'use client';

import { useIsMobile } from '@/hooks/useIsMobile';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Wallet,
  Users,
  BarChart3,
  ReceiptText,
  CalendarClock,
  TrendingUp,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: Home },
  { href: '/dashboard/movimientos', label: 'Movimientos', icon: Wallet },
  { href: '/dashboard/cuentas', label: 'Cuentas', icon: Wallet },
  { href: '/dashboard/personas', label: 'Contactos', icon: Users },
  {
    href: '/dashboard/cuentas-por-cobrar',
    label: 'Por Cobrar',
    icon: ReceiptText,
  },
  {
    href: '/dashboard/cuentas-por-pagar',
    label: 'Por Pagar',
    icon: ReceiptText,
  },
  { href: '/dashboard/pagos-programados', label: 'Pagos', icon: CalendarClock },
  { href: '/dashboard/ingresos', label: 'Ingresos', icon: TrendingUp },
  { href: '/dashboard/reportes', label: 'Reportes', icon: BarChart3 },
];

export function BottomNav() {
  const isMobile = useIsMobile();
  const pathname = usePathname();

  if (isMobile === false) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-40 pb-safe safe-area-inset-bottom">
      <ul className="flex justify-around divide-x divide-border">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`
                  flex flex-col items-center justify-center py-3 gap-1.5
                  transition-all duration-200 ease-out
                  ${
                    isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }
                `}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                <span className="text-xs font-medium leading-none">
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
