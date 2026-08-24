import type { User } from '@/types';
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/server';
import {
  updateProfileAction,
  changePasswordAction,
  startTotpEnrollmentAction,
  confirmTotpEnrollmentAction,
  disableTotpAction,
  type TotpEnrollmentStart,
  listPasskeysAction,
  deletePasskeyAction,
  startPasskeyRegistrationAction,
  finishPasskeyRegistrationAction,
  type PasskeyInfo,
} from '@/lib/actions/auth.actions';

class AuthService {
  updateProfile(input: { nombre: string; email: string }): Promise<User> {
    return updateProfileAction(input);
  }

  changePassword(input: { currentPassword: string; newPassword: string }): Promise<void> {
    return changePasswordAction(input);
  }

  startTotpEnrollment(): Promise<TotpEnrollmentStart> {
    return startTotpEnrollmentAction();
  }

  confirmTotpEnrollment(input: { secret: string; code: string }): Promise<{ backupCodes: string[] }> {
    return confirmTotpEnrollmentAction(input);
  }

  disableTotp(input: { password: string }): Promise<void> {
    return disableTotpAction(input);
  }

  listPasskeys(): Promise<PasskeyInfo[]> {
    return listPasskeysAction();
  }

  deletePasskey(id: string): Promise<void> {
    return deletePasskeyAction(id);
  }

  startPasskeyRegistration(): Promise<PublicKeyCredentialCreationOptionsJSON> {
    return startPasskeyRegistrationAction();
  }

  finishPasskeyRegistration(response: RegistrationResponseJSON, name?: string): Promise<void> {
    return finishPasskeyRegistrationAction(response, name);
  }
}

export const authService = new AuthService();

// Re-exportados para que el login (que no pasa por AuthProvider para esto) los pueda usar directo.
export type { RegistrationResponseJSON, AuthenticationResponseJSON, PublicKeyCredentialCreationOptionsJSON, PublicKeyCredentialRequestOptionsJSON };
