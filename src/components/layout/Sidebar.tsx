'use client';

import { useIsMobile } from '@/hooks/useIsMobile';
import { useAuth } from '@/providers/AuthProvider';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Wallet,
  Users,
  BarChart3,
  Settings,
  ReceiptText,
  CalendarClock,
  TrendingUp,
  LogOut,
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
  { href: '/dashboard/pagos-programados', label: 'Pagos Programados', icon: CalendarClock },
  { href: '/dashboard/reportes', label: 'Reportes', icon: BarChart3 },
  { href: '/dashboard/configuracion', label: 'Configuración', icon: Settings },
];

export function Sidebar() {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const { signOut } = useAuth();

  if (isMobile) return null;

  return (
    <aside className="hidden md:flex w-64 bg-card border-r border-border flex-col h-screen sticky top-0 z-40">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 group cursor-pointer"
        >
          <div className="w-11 h-11 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center group-hover:shadow-lg transition-all duration-200">
            <span className="text-primary-foreground font-bold text-lg">₡</span>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-foreground">
              CashLife
            </h1>
            <p className="text-xs text-muted-foreground">
              Tu dinero, tu control
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200 ease-out
                    ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-foreground hover:bg-muted/80 active:bg-muted'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium text-sm">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-3">
        <button onClick={signOut} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-lg transition-all duration-200 font-medium text-sm active:scale-95">
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
