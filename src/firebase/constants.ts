export const FIRESTORE_COLLECTIONS = {
  USERS: 'users',
  TRANSACTIONS: 'transactions',
  ACCOUNTS: 'accounts',
  PEOPLE: 'people',
  SETTINGS: 'settings',
  CATEGORIES: 'categories',
} as const;

export const DEFAULT_ACCOUNTS = [
  { nombre: 'Efectivo', tipo: 'cash', color: '#EF4444', icono: 'Wallet' },
  { nombre: 'BCP', tipo: 'bank', color: '#3B82F6', icono: 'CreditCard' },
  { nombre: 'Interbank', tipo: 'bank', color: '#9333EA', icono: 'CreditCard' },
  { nombre: 'BBVA', tipo: 'bank', color: '#1E40AF', icono: 'CreditCard' },
  { nombre: 'Yape', tipo: 'wallet', color: '#F59E0B', icono: 'Smartphone' },
  { nombre: 'Plin', tipo: 'wallet', color: '#06B6D4', icono: 'Smartphone' },
  { nombre: 'Caja Fuerte', tipo: 'safe_box', color: '#10B981', icono: 'Vault' },
];

export const DEFAULT_CATEGORIES = [
  { nombre: 'Comida', icono: 'UtensilsCrossed', color: '#EF4444' },
  { nombre: 'Transporte', icono: 'Car', color: '#F59E0B' },
  { nombre: 'Compras', icono: 'ShoppingBag', color: '#EC4899' },
  { nombre: 'Hogar', icono: 'Home', color: '#6366F1' },
  { nombre: 'Salud', icono: 'Heart', color: '#10B981' },
  { nombre: 'Educación', icono: 'BookOpen', color: '#8B5CF6' },
  { nombre: 'Entretenimiento', icono: 'Gamepad2', color: '#06B6D4' },
  { nombre: 'Trabajo', icono: 'Briefcase', color: '#3B82F6' },
  { nombre: 'Otros', icono: 'MoreHorizontal', color: '#6B7280' },
  { nombre: 'Salario', icono: 'DollarSign', color: '#22C55E' },
];

export const DEFAULT_SETTINGS = {
  saldoInicial: 0,
  moneda: 'PEN',
  tema: 'oscuro',
  notificaciones: true,
};
