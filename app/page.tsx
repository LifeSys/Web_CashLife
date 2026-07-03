'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { useSettings } from '@/hooks/useSettings';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { settings, isLoading } = useSettings();

  useEffect(() => {
    if (!loading && !isLoading) {
      if (user) {
        router.push(settings?.onboardingCompleted === false ? '/onboarding' : '/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, isLoading, settings?.onboardingCompleted, router]);

  return <LoadingSkeleton />;
}
