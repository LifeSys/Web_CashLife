/**
 * CashLife — llaves de acceso (WebAuthn/passkeys: huella, Face ID, Windows
 * Hello) como alternativa a escribir el código de 6 dígitos.
 * © Johann Sebastian Guevara Elias, Ingeniero de Sistemas. Autor original.
 */
import { headers } from 'next/headers';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
} from '@simplewebauthn/server';

const RP_NAME = 'CashLife';

/**
 * WebAuthn exige que el "relying party ID" (básicamente el dominio) y el
 * origen coincidan exactamente con lo que ve el navegador. Como esta app
 * corre tanto en localhost (dev) como en el dominio real de Vercel, se
 * calculan dinámicamente a partir del host de la petición en vez de
 * dejarlos fijos.
 */
async function getRpConfig(): Promise<{ rpID: string; origin: string }> {
  const h = await headers();
  const host = h.get('host') ?? 'localhost:3000';
  const forwardedProto = h.get('x-forwarded-proto');
  const proto = forwardedProto ?? (host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https');
  const rpID = host.split(':')[0];
  return { rpID, origin: `${proto}://${host}` };
}

export async function buildRegistrationOptions(userId: string, email: string, nombre: string, existingCredentialIds: string[]) {
  const { rpID } = await getRpConfig();
  return generateRegistrationOptions({
    rpName: RP_NAME,
    rpID,
    userName: email,
    userDisplayName: nombre,
    userID: Uint8Array.from(new TextEncoder().encode(userId)),
    attestationType: 'none',
    excludeCredentials: existingCredentialIds.map((id) => ({ id })),
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
    },
  });
}

export async function verifyRegistration(response: RegistrationResponseJSON, expectedChallenge: string) {
  const { rpID, origin } = await getRpConfig();
  return verifyRegistrationResponse({
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
  });
}

export async function buildAuthenticationOptions(allowCredentialIds: string[]) {
  const { rpID } = await getRpConfig();
  return generateAuthenticationOptions({
    rpID,
    userVerification: 'preferred',
    allowCredentials: allowCredentialIds.map((id) => ({ id })),
  });
}

export async function verifyAuthentication(
  response: AuthenticationResponseJSON,
  expectedChallenge: string,
  credential: { id: string; publicKey: Uint8Array; counter: number; transports?: string[] }
) {
  const { rpID, origin } = await getRpConfig();
  return verifyAuthenticationResponse({
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    credential: {
      id: credential.id,
      publicKey: Uint8Array.from(credential.publicKey),
      counter: credential.counter,
      transports: credential.transports as AuthenticatorTransportFuture[] | undefined,
    },
  });
}
