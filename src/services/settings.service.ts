import { Settings } from '@/types';
import { SettingsRepository } from '@/lib/repositories/settings.repository';

class SettingsService {
  private repository = new SettingsRepository();

  async get(uid: string): Promise<Settings> {
    return this.repository.get(uid);
  }

  async update(uid: string, data: Partial<Settings>): Promise<Settings> {
    return this.repository.update(uid, data);
  }
}

export const settingsService = new SettingsService();
