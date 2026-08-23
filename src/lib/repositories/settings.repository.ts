import { prisma } from '@/lib/db/prisma';
import { Settings } from '@/types';
import { BaseRepository } from './base.repository';
import { DEFAULT_SETTINGS } from '@/firebase/constants';

function toSettings(row: { saldoInicial: number; moneda: string; tema: string; notificaciones: boolean; onboardingCompleted: boolean; updatedAt: Date }): Settings {
  return {
    saldoInicial: row.saldoInicial,
    moneda: row.moneda,
    tema: row.tema as Settings['tema'],
    notificaciones: row.notificaciones,
    onboardingCompleted: row.onboardingCompleted,
    updatedAt: row.updatedAt,
  };
}

export class SettingsRepository extends BaseRepository {
  /**
   * Obtiene configuración del usuario
   */
  async get(uid: string): Promise<Settings> {
    const row = await prisma.settings.findUnique({ where: { userId: uid } });
    if (!row) return DEFAULT_SETTINGS;
    return toSettings(row);
  }

  /**
   * Actualiza configuración del usuario
   */
  async update(uid: string, settings: Partial<Settings>): Promise<Settings> {
    const row = await prisma.settings.upsert({
      where: { userId: uid },
      create: { userId: uid, ...DEFAULT_SETTINGS, ...settings },
      update: { ...settings },
    });
    return toSettings(row);
  }

  /**
   * Inicializa configuración predeterminada
   */
  async initialize(uid: string): Promise<Settings> {
    const row = await prisma.settings.upsert({
      where: { userId: uid },
      create: { userId: uid, ...DEFAULT_SETTINGS },
      update: {},
    });
    return toSettings(row);
  }
}
