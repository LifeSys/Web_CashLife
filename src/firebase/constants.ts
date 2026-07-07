/**
 * Constantes de colecciones de Firestore
 * NUNCA hardcodear nombres de colecciones directamente en el código
 */

export const FIRESTORE_COLLECTIONS = {
  USERS: 'users',
  TRANSACTIONS: 'transactions',
  ACCOUNTS: 'accounts',
  PEOPLE: 'people',
  SETTINGS: 'settings',
  CATEGORIES: 'categories',
  CREDIT_CARDS: 'creditCards',
  WALLETS: 'wallets',
  SUBSCRIPTIONS: 'subscriptions',
  RECEIVABLE_DEBTS: 'receivableDebts',
  RECEIVABLE_PAYMENTS: 'receivablePayments',
  PAYABLE_OBLIGATIONS: 'payableObligations',
  PAYABLE_PAYMENTS: 'payablePayments',
  SCHEDULED_PAYMENTS: 'scheduledPayments',
  INCOMES: 'incomes',
} as const;

/**
 * Subcollecciones dentro de users/{uid}/
 */
export const FIRESTORE_SUBCOLLECTIONS = {
  TRANSACTIONS: FIRESTORE_COLLECTIONS.TRANSACTIONS,
  ACCOUNTS: FIRESTORE_COLLECTIONS.ACCOUNTS,
  PEOPLE: FIRESTORE_COLLECTIONS.PEOPLE,
  CATEGORIES: FIRESTORE_COLLECTIONS.CATEGORIES,
} as const;

/**
 * Documentos especiales dentro de users/{uid}/
 */
export const FIRESTORE_DOCUMENTS = {
  PROFILE: 'profile',
  SETTINGS: 'settings',
} as const;

/**
 * Cuentas por defecto: solamente Efectivo se crea automáticamente
 * Otras cuentas se crean durante onboarding
 */
type DefaultAccount = { nombre: string; tipo: 'cash' | 'bank' | 'safe_box'; color: string; icono: string };

export const DEFAULT_ACCOUNTS: readonly DefaultAccount[] = [
  { nombre: 'Efectivo', tipo: 'cash', color: '#10B981', icono: 'Wallet' },
] as const;

/**
 * Categorías por defecto para nuevo usuario
 */
export const DEFAULT_CATEGORIES = [
  // GASTOS
  { nombre: 'Comida', icono: 'UtensilsCrossed', color: '#EF4444', tipo: 'expense' },
  { nombre: 'Transporte', icono: 'Car', color: '#F59E0B', tipo: 'expense' },
  { nombre: 'Salud', icono: 'Heart', color: '#10B981', tipo: 'expense' },
  { nombre: 'Educación', icono: 'BookOpen', color: '#8B5CF6', tipo: 'expense' },
  { nombre: 'Hogar', icono: 'Home', color: '#6366F1', tipo: 'expense' },
  { nombre: 'Servicios', icono: 'Zap', color: '#F59E0B', tipo: 'expense' },
  { nombre: 'Entretenimiento', icono: 'Gamepad2', color: '#06B6D4', tipo: 'expense' },
  { nombre: 'Compras', icono: 'ShoppingBag', color: '#EC4899', tipo: 'expense' },
  { nombre: 'Viajes', icono: 'MapPin', color: '#8B5CF6', tipo: 'expense' },
  { nombre: 'Mascotas', icono: 'Paw', color: '#F59E0B', tipo: 'expense' },
  { nombre: 'Impuestos', icono: 'Receipt', color: '#64748B', tipo: 'expense' },
  { nombre: 'Otros', icono: 'MoreHorizontal', color: '#6B7280', tipo: 'expense' },
  
  // INGRESOS
  { nombre: 'Salario', icono: 'DollarSign', color: '#22C55E', tipo: 'income' },
  { nombre: 'Ventas', icono: 'ShoppingCart', color: '#16A34A', tipo: 'income' },
  { nombre: 'Freelance', icono: 'Briefcase', color: '#15803D', tipo: 'income' },
  { nombre: 'Negocio', icono: 'TrendingUp', color: '#22C55E', tipo: 'income' },
  { nombre: 'Inversiones', icono: 'PieChart', color: '#16A34A', tipo: 'income' },
  { nombre: 'Regalos', icono: 'Gift', color: '#15803D', tipo: 'income' },
  { nombre: 'Reembolso', icono: 'RefreshCw', color: '#22C55E', tipo: 'income' },
  { nombre: 'Otros', icono: 'MoreHorizontal', color: '#6B7280', tipo: 'income' },
] as const;

/**
 * Configuración por defecto para nuevo usuario
 */
export const DEFAULT_SETTINGS = {
  saldoInicial: 0,
  moneda: 'PEN',
  tema: 'oscuro',
  notificaciones: true,
  onboardingCompleted: false,
} as const;
