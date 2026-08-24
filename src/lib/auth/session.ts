/**
 * CashLife — sesiones de autenticación.
 * © Johann Sebastian Guevara Elias, Ingeniero de Sistemas. Autor original.
 *
 * Cookie httpOnly firmada con HMAC-SHA256: `<userId>.<firma>`. No es un
 * JWT completo (no hace falta para el tamaño de este proyecto), pero sí
 * evita que alguien pueda simplemente escribir `cashlife_session=otro-id`
 * en el navegador y hacerse pasar por otro usuario, porque no puede
 * calcular la firma sin el secreto del servidor.
 */
import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'crypto';

export const SESSION_COOKIE = 'cashlife_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 días

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

function sign(userId: string): string {
  return createHmac('sha256', getSecret()).update(userId).digest('hex');
}

function safeEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

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
  const dotIndex = token.lastIndexOf('.');
  if (dotIndex <= 0) return null;
  const userId = token.slice(0, dotIndex);
  const signature = token.slice(dotIndex + 1);
  if (!safeEquals(signature, sign(userId))) return null;
  return userId;
}
