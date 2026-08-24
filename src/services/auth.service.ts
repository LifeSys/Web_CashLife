import type { User } from '@/types';
import {
  updateProfileAction,
  changePasswordAction,
  startTotpEnrollmentAction,
  confirmTotpEnrollmentAction,
  disableTotpAction,
  type TotpEnrollmentStart,
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
}

export const authService = new AuthService();
