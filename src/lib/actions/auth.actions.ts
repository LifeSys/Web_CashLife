'use server';

import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';
import { UserRepository } from '@/lib/repositories/user.repository';
import { createSession, destroySession, getSessionUserId } from '@/lib/auth/session';
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

export async function signInAction(input: { email: string; password: string }): Promise<User> {
  const email = input.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) throw new Error('Email o contraseña incorrectos');

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) throw new Error('Email o contraseña incorrectos');

  await createSession(user.id);
  const profile = await repo.getProfile(user.id);
  if (!profile) throw new Error('Error iniciando sesión');
  return profile;
}

export async function signOutAction(): Promise<void> {
  await destroySession();
}
