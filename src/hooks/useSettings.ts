'use client';

import useSWR from 'swr';
import { settingsService } from '@/services/settings.service';
import { useAuth } from '@/providers/AuthProvider';
import { Settings } from '@/types';

export function useSettings() {
  const { user } = useAuth();
  const { data: settings, isLoading, error, mutate } = useSWR(
    user?.uid ? ['settings', user.uid] : null,
    () => user?.uid ? settingsService.get(user.uid) : null,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  const updateSettings = async (newSettings: Partial<Settings>) => {
    if (!user?.uid) return;
    const updated = await settingsService.update(user.uid, newSettings);
    mutate(updated);
  };

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    mutate,
  };
}
