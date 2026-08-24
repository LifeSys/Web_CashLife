'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
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
        {/* pt-safe: en el iPhone (instalado a pantalla completa) el
            contenido puede nacer debajo de la isla dinámica/notch si no
            se empuja explícitamente — esto lo corrige en todas las
            páginas de una sola vez. */}
        <main className="flex-1 pt-safe pb-20 md:pb-0 md:pt-0 md:overflow-auto">
          {children}
        </main>
        <BottomNav />
      </div>
    </SessionProvider>
  );
}
