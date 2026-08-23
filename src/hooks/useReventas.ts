'use client';

import useSWR from 'swr';
import { reventasService, type ServiceProfileWithCurrentRental, type ServiceProfileWithService } from '@/services/reventas.service';
import { useAuth } from '@/providers/AuthProvider';
import type { SharedService, ProfileRental } from '@/types';

// Ver el comentario en useFinancial.ts: `data ?? []` crea un array nuevo en
// cada render mientras no hay datos, lo que puede provocar loops infinitos
// si algún componente lo mete en las dependencias de un useEffect.
const EMPTY_ARRAY: never[] = [];

export function useSharedServices() {
  const { user } = useAuth();
  const { data, isLoading, error, mutate } = useSWR<SharedService[]>(
    user?.uid ? ['shared-services', user.uid] : null,
    () => reventasService.getServices(user!.uid as string),
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  );
  return { services: data ?? EMPTY_ARRAY, isLoading, error, mutate };
}

export function useServiceProfiles(serviceId?: string) {
  const { user } = useAuth();
  const { data, isLoading, error, mutate } = useSWR<ServiceProfileWithCurrentRental[]>(
    user?.uid && serviceId ? ['service-profiles', user.uid, serviceId] : null,
    () => reventasService.getProfiles(user!.uid as string, serviceId!),
    { revalidateOnFocus: false, dedupingInterval: 15000 }
  );
  return { profiles: data ?? EMPTY_ARRAY, isLoading, error, mutate };
}

/** Todos los perfiles de todos los servicios — para el panel de recordatorios. */
export function useAllServiceProfiles() {
  const { user } = useAuth();
  const { data, isLoading, error, mutate } = useSWR<ServiceProfileWithService[]>(
    user?.uid ? ['all-service-profiles', user.uid] : null,
    () => reventasService.getAllProfiles(user!.uid as string),
    { revalidateOnFocus: false, dedupingInterval: 15000 }
  );
  return { profiles: data ?? EMPTY_ARRAY, isLoading, error, mutate };
}

export function useProfileRentals(profileId?: string) {
  const { user } = useAuth();
  const { data, isLoading, error, mutate } = useSWR<ProfileRental[]>(
    user?.uid && profileId ? ['profile-rentals', user.uid, profileId] : null,
    () => reventasService.getRentals(user!.uid as string, profileId!),
    { revalidateOnFocus: false, dedupingInterval: 15000 }
  );
  return { rentals: data ?? EMPTY_ARRAY, isLoading, error, mutate };
}
