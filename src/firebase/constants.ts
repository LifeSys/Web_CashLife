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
 * No se crean cuentas ni tarjetas por defecto.
 * Cada usuario las configura libremente durante el onboarding.
 */
type DefaultAccount = { nombre: string; tipo: 'cash' | 'bank' | 'safe_box'; color: string; icono: string };

export const DEFAULT_ACCOUNTS: readonly DefaultAccount[] = [];

/**
 * Categorías por defecto para nuevo usuario
 */
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
