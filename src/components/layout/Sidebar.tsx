'use client';

import { useIsMobile } from '@/hooks/useIsMobile';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wallet, Users, BarChart3, Settings, ReceiptText, CalendarClock, TrendingUp } from 'lucide-react';

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
  { href: '/dashboard/configuracion', label: 'Configuración', icon: Settings },
];

export function Sidebar() {
  const isMobile = useIsMobile();
  const pathname = usePathname();

  if (isMobile) return null;

  return (
    <aside className="hidden md:flex w-64 bg-card border-r border-border flex-col h-screen sticky top-0">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">₡</span>
          </div>
          <div>
            <h1 className="font-bold text-lg">CashLife</h1>
            <p className="text-xs text-muted-foreground">Tu dinero, tu control</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <button className="w-full px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition-opacity font-medium text-sm">
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
