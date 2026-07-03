'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { FloatingActionButton } from '@/components/layout/FloatingActionButton';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SessionProvider } from '@/providers/SessionProvider';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { useSettings } from '@/hooks/useSettings';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { settings, isLoading } = useSettings();

  useEffect(() => {
    if (!isLoading && settings?.onboardingCompleted === false) {
      router.replace('/onboarding');
    }
  }, [isLoading, settings?.onboardingCompleted, router]);

  if (isLoading || settings?.onboardingCompleted === false) return <LoadingSkeleton />;

  return (
    <SessionProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 pb-20 md:pb-0 md:overflow-auto">
          {children}
        </main>
        <BottomNav />
        <FloatingActionButton />
      </div>
    </SessionProvider>
  );
}
