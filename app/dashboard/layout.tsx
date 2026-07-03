'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { FloatingActionButton } from '@/components/layout/FloatingActionButton';
import { SessionProvider } from '@/providers/SessionProvider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
