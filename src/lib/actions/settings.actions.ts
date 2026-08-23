'use server';

import { SettingsRepository } from '@/lib/repositories/settings.repository';
import { Settings } from '@/types';

const repo = new SettingsRepository();

export async function getSettingsAction(uid: string): Promise<Settings> {
  return repo.get(uid);
}

export async function updateSettingsAction(uid: string, data: Partial<Settings>): Promise<Settings> {
  return repo.update(uid, data);
}

export async function initializeSettingsAction(uid: string): Promise<Settings> {
  return repo.initialize(uid);
}
