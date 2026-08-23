'use client';

import { useMemo } from 'react';
import { usePeople } from './usePeople';
import { useAllServiceProfiles } from './useReventas';
import type { Person } from '@/types';
import type { ServiceProfileWithService } from '@/services/reventas.service';

export interface RentalReminderRow {
  profile: ServiceProfileWithService;
  client: Person;
  urgency: 'tomorrow' | 'today';
}

function daysUntil(date: Date): number {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((target.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Perfiles de Reventas cuyo alquiler vence mañana o vence hoy — para el
 * panel de "avísale antes de que se le corte el acceso".
 */
export function useRentalReminders() {
  const { contacts, isLoading: loadingPeople } = usePeople();
  const { profiles, isLoading: loadingProfiles } = useAllServiceProfiles();

  const rows = useMemo<RentalReminderRow[]>(() => {
    const result: RentalReminderRow[] = [];
    for (const profile of profiles) {
      const rental = profile.currentRental;
      if (!rental || !rental.personId) continue;
      const end = rental.endDate instanceof Date ? rental.endDate : new Date(rental.endDate);
      const diff = daysUntil(end);
      if (diff !== 0 && diff !== 1) continue;
      const client = contacts.find((c) => c.id === rental.personId);
      if (!client) continue;
      result.push({ profile, client, urgency: diff === 0 ? 'today' : 'tomorrow' });
    }
    return result.sort((a, b) => (a.urgency === 'today' ? -1 : 1) - (b.urgency === 'today' ? -1 : 1));
  }, [profiles, contacts]);

  return {
    rows,
    dueTodayRows: rows.filter((r) => r.urgency === 'today'),
    dueTomorrowRows: rows.filter((r) => r.urgency === 'tomorrow'),
    isLoading: loadingPeople || loadingProfiles,
  };
}
