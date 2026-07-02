import type { Settings } from '@/types';

class SettingsService {
  private settings: Settings = {
    id: 'settings-1',
    usuarioId: 'user-1',
    saldoInicial: 50000,
    moneda: 'PEN',
    tema: 'oscuro',
    notificaciones: true,
    updatedAt: new Date(),
  };

  async get(): Promise<Settings> {
    return Promise.resolve({ ...this.settings });
  }

  async update(data: Partial<Settings>): Promise<Settings> {
    this.settings = {
      ...this.settings,
      ...data,
      updatedAt: new Date(),
    };
    return Promise.resolve({ ...this.settings });
  }
}

export const settingsService = new SettingsService();
