/**
 * CashLife — verificación en dos pasos (TOTP, compatible con Google
 * Authenticator, Authy, etc.).
 * © Johann Sebastian Guevara Elias, Ingeniero de Sistemas. Autor original.
 */
import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

const ISSUER = 'CashLife';
const BACKUP_CODE_COUNT = 8;

function buildTotp(secret: string, email: string): OTPAuth.TOTP {
  return new OTPAuth.TOTP({
    issuer: ISSUER,
    label: email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  });
}

/** Genera un secreto nuevo en base32, listo para mostrar en QR o a mano. */
export function generateTotpSecret(): string {
  return new OTPAuth.Secret({ size: 20 }).base32;
}

/** URI `otpauth://...` + su versión como imagen QR (data URL) para escanear. */
export async function buildTotpEnrollment(secret: string, email: string): Promise<{ uri: string; qrDataUrl: string }> {
  const totp = buildTotp(secret, email);
  const uri = totp.toString();
  const qrDataUrl = await QRCode.toDataURL(uri, { margin: 1, width: 240 });
  return { uri, qrDataUrl };
}

/** Verifica un código de 6 dígitos contra el secreto (con 1 paso de tolerancia por desfase de reloj). */
export function verifyTotpToken(secret: string, token: string, email: string): boolean {
  const totp = buildTotp(secret, email);
  const delta = totp.validate({ token: token.trim(), window: 1 });
  return delta !== null;
}

/** Genera códigos de respaldo en texto plano (para mostrar UNA vez) + sus hashes (para guardar). */
export async function generateBackupCodes(): Promise<{ plain: string[]; hashed: string[] }> {
  const plain = Array.from({ length: BACKUP_CODE_COUNT }, () => randomBytes(5).toString('hex').toUpperCase());
  const hashed = await Promise.all(plain.map((code) => bcrypt.hash(code, 10)));
  return { plain, hashed };
}

/** Revisa un código de respaldo contra la lista guardada; devuelve el índice usado, o -1 si no coincide con ninguno. */
export async function findMatchingBackupCode(code: string, hashedCodes: string[]): Promise<number> {
  const normalized = code.trim().toUpperCase();
  for (let i = 0; i < hashedCodes.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    if (await bcrypt.compare(normalized, hashedCodes[i])) return i;
  }
  return -1;
}
