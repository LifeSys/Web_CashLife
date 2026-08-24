/**
 * CashLife — sesiones de autenticación.
 * © Johann Sebastian Guevara Elias, Ingeniero de Sistemas. Autor original.
 *
 * Cookies httpOnly firmadas con HMAC-SHA256. No es un JWT completo (no
 * hace falta para el tamaño de este proyecto), pero sí evita que alguien
 * pueda simplemente escribir `cashlife_session=otro-id` en el navegador y
 * hacerse pasar por otro usuario, porque no puede calcular la firma sin
 * el secreto del servidor.
 *
 * Hay tres cookies distintas:
 * - `cashlife_session`: sesión real, ya autenticado del todo.
 * - `cashlife_2fa_pending`: estado intermedio de login — la contraseña ya
 *   se verificó correcta, pero falta el código de verificación en dos
 *   pasos. Dura 5 minutos y no sirve para acceder a nada por sí sola.
 * - `cashlife_webauthn_challenge`: el "challenge" aleatorio que exige el
 *   estándar WebAuthn/passkeys mientras dura el registro o la
 *   verificación con huella/Face ID — dura 2 minutos.
 */
import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'crypto';

export const SESSION_COOKIE = 'cashlife_session';
const PENDING_2FA_COOKIE = 'cashlife_2fa_pending';
const WEBAUTHN_CHALLENGE_COOKIE = 'cashlife_webauthn_challenge';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 días
const PENDING_2FA_MAX_AGE_SECONDS = 60 * 5; // 5 minutos
const WEBAUTHN_CHALLENGE_MAX_AGE_SECONDS = 60 * 2; // 2 minutos

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    // No se detiene el arranque por esto (sería muy fácil dejar el dev
    // server roto), pero sí se avisa fuerte: sin un secreto propio en
    // .env.local, las sesiones firmadas con este valor por defecto no son
    // seguras para exponer por internet (ej. por un túnel).
    console.warn(
      '[CashLife] SESSION_SECRET no está definido en el entorno — usando un valor por defecto NO seguro para producción. Agrega SESSION_SECRET a tu .env.local.'
    );
    return 'cashlife-dev-insecure-default-secret';
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('hex');
}

function safeEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** Separa `<payload>.<firma>` y valida la firma. Devuelve el payload si es válido. */
function unsignToken(token: string): string | null {
  const dotIndex = token.lastIndexOf('.');
  if (dotIndex <= 0) return null;
  const payload = token.slice(0, dotIndex);
  const signature = token.slice(dotIndex + 1);
  if (!safeEquals(signature, sign(payload))) return null;
  return payload;
}

// ---- Sesión real ----

export async function createSession(userId: string): Promise<void> {
  const token = `${userId}.${sign(userId)}`;
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Lee la cookie de sesión actual y devuelve el userId si la firma es válida. */
export async function getSessionUserId(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return unsignToken(token);
}

// ---- Login pendiente de verificación en dos pasos ----

export async function createPending2FA(userId: string): Promise<void> {
  const expiresAt = Date.now() + PENDING_2FA_MAX_AGE_SECONDS * 1000;
  const payload = `${userId}.${expiresAt}`;
  const token = `${payload}.${sign(payload)}`;
  const store = await cookies();
  store.set(PENDING_2FA_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: PENDING_2FA_MAX_AGE_SECONDS,
  });
}

export async function destroyPending2FA(): Promise<void> {
  const store = await cookies();
  store.delete(PENDING_2FA_COOKIE);
}

/** Devuelve el userId del login pendiente si la cookie es válida y no expiró. */
export async function getPending2FAUserId(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(PENDING_2FA_COOKIE)?.value;
  if (!token) return null;
  const payload = unsignToken(token);
  if (!payload) return null;
  const separatorIndex = payload.lastIndexOf('.');
  if (separatorIndex <= 0) return null;
  const userId = payload.slice(0, separatorIndex);
  const expiresAt = Number(payload.slice(separatorIndex + 1));
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return null;
  return userId;
}

// ---- Challenge de WebAuthn/passkeys ----

export async function setWebauthnChallenge(challenge: string): Promise<void> {
  const token = `${challenge}.${sign(challenge)}`;
  const store = await cookies();
  store.set(WEBAUTHN_CHALLENGE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: WEBAUTHN_CHALLENGE_MAX_AGE_SECONDS,
  });
}

export async function getWebauthnChallenge(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(WEBAUTHN_CHALLENGE_COOKIE)?.value;
  if (!token) return null;
  return unsignToken(token);
}

export async function clearWebauthnChallenge(): Promise<void> {
  const store = await cookies();
  store.delete(WEBAUTHN_CHALLENGE_COOKIE);
}
