import {
  Home,
  Wallet,
  CreditCard,
  Users,
  BarChart3,
  Settings,
  ReceiptText,
  CalendarClock,
  Share2,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/**
 * Única lista de navegación, compartida por el Sidebar de escritorio y la
 * barra/menú de celular — antes cada uno tenía su propia lista y se
 * desincronizaban (el celular no tenía forma de llegar a Configuración).
 */
export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Inicio', icon: Home },
  { href: '/dashboard/movimientos', label: 'Movimientos', icon: Wallet },
  { href: '/dashboard/cuentas', label: 'Cuentas', icon: CreditCard },
  { href: '/dashboard/personas', label: 'Contactos', icon: Users },
  { href: '/dashboard/cuentas-por-cobrar', label: 'Por Cobrar', icon: ReceiptText },
  { href: '/dashboard/cuentas-por-pagar', label: 'Por Pagar', icon: ReceiptText },
  { href: '/dashboard/pagos-programados', label: 'Pagos Programados', icon: CalendarClock },
  { href: '/dashboard/reventas', label: 'Reventas', icon: Share2 },
  { href: '/dashboard/reportes', label: 'Reportes', icon: BarChart3 },
  { href: '/dashboard/configuracion', label: 'Configuración', icon: Settings },
];

/** Los que van fijos en la barra inferior de celular — el resto vive en "Más". */
export const MOBILE_PRIMARY_HREFS = ['/dashboard', '/dashboard/movimientos', '/dashboard/cuentas', '/dashboard/personas'];
