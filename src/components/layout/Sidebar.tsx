'use client';

import { useIsMobile } from '@/hooks/useIsMobile';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from './nav-items';

export function Sidebar() {
  const isMobile = useIsMobile();
  const pathname = usePathname();

  if (isMobile) return null;

  return (
    <aside className="hidden md:flex w-64 bg-card border-r border-border flex-col h-screen sticky top-0 z-40">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 group cursor-pointer"
        >
          <img
            src="/cashlife-mark.png"
            alt="CashLife"
            className="w-11 h-11 rounded-lg group-hover:shadow-lg transition-all duration-200"
          />
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
          {NAV_ITEMS.map((item) => {
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

      {/* Footer: sin "Cerrar sesión" mientras CashLife corre en modo local
          (un solo usuario, sin login). Vuelve a aparecer cuando se retome
          el login real para el lanzamiento web. */}
    </aside>
  );
}
