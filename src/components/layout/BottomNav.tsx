'use client';

import { useState } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { NAV_ITEMS, MOBILE_PRIMARY_HREFS } from './nav-items';

const primaryItems = NAV_ITEMS.filter((item) => MOBILE_PRIMARY_HREFS.includes(item.href));
const moreItems = NAV_ITEMS.filter((item) => !MOBILE_PRIMARY_HREFS.includes(item.href));

export function BottomNav() {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);

  if (isMobile === false) return null;

  const isInMoreSection = moreItems.some((item) => item.href === pathname);

  return (
    <>
      {/* Hoja "Más" — el resto de las secciones, en vez de apretar todo en
          una sola barra ilegible. Mismo espíritu que una barra lateral
          colapsable, adaptado a celular: colapsada = solo las 4 más
          usadas + "Más"; expandida = ícono + nombre de todo lo demás. */}
      {showMore && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end" onClick={() => setShowMore(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="relative w-full bg-card border-t border-border rounded-t-2xl pb-safe max-h-[75vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <p className="font-bold text-sm text-muted-foreground uppercase tracking-wide">Más</p>
              <button onClick={() => setShowMore(false)} className="p-2 -mr-2 text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 pb-4">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMore(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-lg transition-colors ${
                      isActive ? 'bg-primary/10 text-primary' : 'text-foreground active:bg-muted'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-40 pb-safe">
        <ul className="flex divide-x divide-border">
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.href} className="flex-1 min-w-0">
                <Link
                  href={item.href}
                  className={`flex flex-col items-center justify-center py-2.5 gap-1 transition-all duration-200 ease-out ${
                    isActive ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                  <span className="text-[11px] font-medium leading-none truncate max-w-full px-1">{item.label}</span>
                </Link>
              </li>
            );
          })}
          <li className="flex-1 min-w-0">
            <button
              onClick={() => setShowMore(true)}
              className={`w-full flex flex-col items-center justify-center py-2.5 gap-1 transition-all duration-200 ease-out ${
                isInMoreSection ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Menu className={`w-5 h-5 transition-transform ${isInMoreSection ? 'scale-110' : ''}`} />
              <span className="text-[11px] font-medium leading-none">Más</span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}
