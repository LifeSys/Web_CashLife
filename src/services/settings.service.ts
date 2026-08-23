import { Settings } from '@/types';
import { getSettingsAction, updateSettingsAction } from '@/lib/actions/settings.actions';

class SettingsService {
  async get(uid: string): Promise<Settings> {
    return getSettingsAction(uid);
  }

  async update(uid: string, data: Partial<Settings>): Promise<Settings> {
    return updateSettingsAction(uid, data);
  }
}

export const settingsService = new SettingsService();
