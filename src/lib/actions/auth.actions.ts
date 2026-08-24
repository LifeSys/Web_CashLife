'use server';

import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';
import { UserRepository } from '@/lib/repositories/user.repository';
import {
  createSession,
  destroySession,
  getSessionUserId,
  createPending2FA,
  destroyPending2FA,
  getPending2FAUserId,
} from '@/lib/auth/session';
import { generateTotpSecret, buildTotpEnrollment, verifyTotpToken, generateBackupCodes, findMatchingBackupCode } from '@/lib/auth/totp';
import { User } from '@/types';

const repo = new UserRepository();
const BCRYPT_ROUNDS = 10;
// Id fijo que usaba el modo local (ver AuthProvider) antes de que existiera
// login real. Si nadie la reclamó todavía (sin passwordHash), el primer
// signup la hereda con todo su historial financiero en vez de crear una
// cuenta nueva vacía y dejar esos datos huérfanos.
const LEGACY_LOCAL_USER_ID = 'local-user';

/** Perfil del usuario de la sesión actual (según la cookie firmada), o null si no hay sesión. */
export async function getSessionUserAction(): Promise<User | null> {
  const uid = await getSessionUserId();
  if (!uid) return null;
  return repo.getProfile(uid);
}

export async function signUpAction(input: { email: string; password: string; nombre: string }): Promise<User> {
  const email = input.email.trim().toLowerCase();
  const nombre = input.nombre.trim();
  if (!email || !input.password || !nombre) throw new Error('Completa todos los campos');
  if (input.password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres');

  const existingByEmail = await prisma.user.findUnique({ where: { email } });
  if (existingByEmail) throw new Error('Ya existe una cuenta con ese email');

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  const legacy = await prisma.user.findUnique({ where: { id: LEGACY_LOCAL_USER_ID } });
  let userId: string;
  if (legacy && !legacy.passwordHash) {
    const updated = await prisma.user.update({
      where: { id: LEGACY_LOCAL_USER_ID },
      data: { email, nombre, passwordHash },
    });
    userId = updated.id;
  } else {
    const created = await prisma.user.create({ data: { email, nombre, passwordHash } });
    userId = created.id;
    // Crea settings/cuentas/categorías por defecto para una cuenta nueva de verdad.
    await repo.initializeNewUser(userId, { email, nombre });
  }

  await createSession(userId);
  const profile = await repo.getProfile(userId);
  if (!profile) throw new Error('Error creando la cuenta');
  return profile;
}

export interface SignInResult {
  /** Si es true, la contraseña era correcta pero falta el código de verificación en dos pasos. */
  requiresTotp: boolean;
  user: User | null;
}

export async function signInAction(input: { email: string; password: string }): Promise<SignInResult> {
  const email = input.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) throw new Error('Email o contraseña incorrectos');

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) throw new Error('Email o contraseña incorrectos');

  if (user.totpEnabled) {
    await createPending2FA(user.id);
    return { requiresTotp: true, user: null };
  }

  await createSession(user.id);
  const profile = await repo.getProfile(user.id);
  if (!profile) throw new Error('Error iniciando sesión');
  return { requiresTotp: false, user: profile };
}

/** Segundo paso del login cuando la cuenta tiene verificación en dos pasos: código del app, o un código de respaldo. */
export async function verifyLoginTotpAction(input: { code: string }): Promise<User> {
  const userId = await getPending2FAUserId();
  if (!userId) throw new Error('La verificación expiró — inicia sesión de nuevo.');

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.totpEnabled || !user.totpSecret) throw new Error('La verificación expiró — inicia sesión de nuevo.');

  const code = input.code.trim();
  const isTotpValid = /^\d{6}$/.test(code) && verifyTotpToken(user.totpSecret, code, user.email ?? '');

  if (isTotpValid) {
    await destroyPending2FA();
    await createSession(user.id);
    const profile = await repo.getProfile(user.id);
    if (!profile) throw new Error('Error iniciando sesión');
    return profile;
  }

  // ¿Es un código de respaldo?
  const matchIndex = await findMatchingBackupCode(code, user.totpBackupCodes);
  if (matchIndex === -1) throw new Error('Código incorrecto');

  // Los códigos de respaldo son de un solo uso — se elimina el que se gastó.
  const remaining = user.totpBackupCodes.filter((_, i) => i !== matchIndex);
  await prisma.user.update({ where: { id: user.id }, data: { totpBackupCodes: remaining } });

  await destroyPending2FA();
  await createSession(user.id);
  const profile = await repo.getProfile(user.id);
  if (!profile) throw new Error('Error iniciando sesión');
  return profile;
}

export async function signOutAction(): Promise<void> {
  await destroySession();
}

// ---- Perfil ----

function requireSessionUserId(uid: string | null): asserts uid is string {
  if (!uid) throw new Error('No hay sesión activa');
}

export async function updateProfileAction(input: { nombre: string; email: string }): Promise<User> {
  const uid = await getSessionUserId();
  requireSessionUserId(uid);

  const nombre = input.nombre.trim();
  const email = input.email.trim().toLowerCase();
  if (!nombre) throw new Error('El nombre no puede estar vacío');
  if (!email) throw new Error('El email no puede estar vacío');

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.id !== uid) throw new Error('Ya existe otra cuenta con ese email');

  const updated = await repo.updateProfile(uid, { nombre, email });
  if (!updated) throw new Error('Usuario no encontrado');
  return updated;
}

export async function changePasswordAction(input: { currentPassword: string; newPassword: string }): Promise<void> {
  const uid = await getSessionUserId();
  requireSessionUserId(uid);

  if (input.newPassword.length < 6) throw new Error('La contraseña nueva debe tener al menos 6 caracteres');

  const user = await prisma.user.findUnique({ where: { id: uid } });
  if (!user || !user.passwordHash) throw new Error('Usuario no encontrado');

  const valid = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!valid) throw new Error('La contraseña actual no es correcta');

  const passwordHash = await bcrypt.hash(input.newPassword, BCRYPT_ROUNDS);
  await prisma.user.update({ where: { id: uid }, data: { passwordHash } });
}

// ---- Verificación en dos pasos (TOTP) ----

export interface TotpEnrollmentStart {
  secret: string;
  uri: string;
  qrDataUrl: string;
}

/** Genera un secreto nuevo (todavía no se guarda — se confirma con confirmTotpEnrollmentAction). */
export async function startTotpEnrollmentAction(): Promise<TotpEnrollmentStart> {
  const uid = await getSessionUserId();
  requireSessionUserId(uid);

  const user = await prisma.user.findUnique({ where: { id: uid } });
  if (!user) throw new Error('Usuario no encontrado');
  if (user.totpEnabled) throw new Error('La verificación en dos pasos ya está activada');

  const secret = generateTotpSecret();
  const { uri, qrDataUrl } = await buildTotpEnrollment(secret, user.email ?? uid);
  return { secret, uri, qrDataUrl };
}

/** Confirma la activación: valida el primer código generado con el secreto y lo guarda. Devuelve los códigos de respaldo (una sola vez). */
export async function confirmTotpEnrollmentAction(input: { secret: string; code: string }): Promise<{ backupCodes: string[] }> {
  const uid = await getSessionUserId();
  requireSessionUserId(uid);

  const user = await prisma.user.findUnique({ where: { id: uid } });
  if (!user) throw new Error('Usuario no encontrado');

  if (!verifyTotpToken(input.secret, input.code, user.email ?? uid)) {
    throw new Error('El código no es válido — revisa la hora de tu celular e intenta de nuevo');
  }

  const { plain, hashed } = await generateBackupCodes();
  await prisma.user.update({
    where: { id: uid },
    data: { totpEnabled: true, totpSecret: input.secret, totpBackupCodes: hashed },
  });

  return { backupCodes: plain };
}

/** Desactiva la verificación en dos pasos — pide la contraseña para confirmarlo. */
export async function disableTotpAction(input: { password: string }): Promise<void> {
  const uid = await getSessionUserId();
  requireSessionUserId(uid);

  const user = await prisma.user.findUnique({ where: { id: uid } });
  if (!user || !user.passwordHash) throw new Error('Usuario no encontrado');

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) throw new Error('Contraseña incorrecta');

  await prisma.user.update({
    where: { id: uid },
    data: { totpEnabled: false, totpSecret: null, totpBackupCodes: [] },
  });
}
