'use client';

import { useIsMobile } from '@/hooks/useIsMobile';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wallet, Users, BarChart3, ReceiptText, CalendarClock, TrendingUp } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: Home },
  { href: '/dashboard/movimientos', label: 'Movimientos', icon: Wallet },
  { href: '/dashboard/cuentas', label: 'Cuentas', icon: Wallet },
  { href: '/dashboard/personas', label: 'Personas', icon: Users },
  { href: '/dashboard/cuentas-por-cobrar', label: 'Por Cobrar', icon: ReceiptText },
  { href: '/dashboard/cuentas-por-pagar', label: 'Por Pagar', icon: ReceiptText },
  { href: '/dashboard/pagos-programados', label: 'Programados', icon: CalendarClock },
  { href: '/dashboard/ingresos', label: 'Ingresos', icon: TrendingUp },
  { href: '/dashboard/reportes', label: 'Reportes', icon: BarChart3 },
];

export function BottomNav() {
  const isMobile = useIsMobile();
  const pathname = usePathname();

  if (isMobile === false) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 pb-safe">
      <ul className="flex justify-around">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`flex flex-col items-center justify-center py-3 gap-1 transition-colors ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
