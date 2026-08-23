// Antes podía venir de Firestore como Timestamp; con Postgres/Prisma
// todas las fechas llegan como Date real. Se deja el alias para no tener
// que tocar el resto de las interfaces de este archivo.
export type FireDate = Date;
export type Currency = 'PEN' | 'USD' | string;

export interface User {
  id?: string;
  uid?: string;
  email: string;
  nombre: string;
  avatar?: string;
  createdAt?: FireDate;
  updatedAt?: FireDate;
}

export type AccountType = 'cash' | 'bank' | 'safe_box' | 'credit_card';
export interface Account {
  id: string;
  nombre: string;
  saldo: number;
  tipo?: AccountType;
  banco?: string;
  subtipo?: 'savings' | 'checking';
  creditLimit?: number;
  cutDay?: number;
  paymentDay?: number;
  active?: boolean;
  bank?: string;
  name?: string;
  balance?: number;
  currency?: Currency;
  moneda?: Currency;
  hasDebitCard?: boolean;
  hasYape?: boolean;
  hasPlin?: boolean;
  saldoInicial?: number;
  tarjetaDebito?: boolean;
  color?: string;
  icono?: string;
  createdAt?: FireDate;
  updatedAt?: FireDate;
  createdBy?: string;
  updatedBy?: string;
}

export type TransactionType =
  | 'expense'           // Gasto desde cualquier cuenta
  | 'income'            // Ingreso a cualquier cuenta
  | 'transfer'          // Transferencia entre cuentas
  | 'card_purchase'     // Compra con tarjeta de crédito
  | 'card_payment'      // Pago de tarjeta de crédito
  | 'loan'              // Préstamo otorgado
  | 'loan_payment'      // Pago de préstamo recibido
  | 'receivable_created' // Deuda creada (por cobrar)
  | 'receivable_paid'   // Deuda pagada (por cobrar)
  | 'payable_created'   // Obligación creada (por pagar)
  | 'payable_paid'      // Obligación pagada (por pagar)
  | 'scheduled_execution' // Ejecución de pago programado;

export interface Transaction {
  id: string;
  monto: number;
  tipo: TransactionType;
  descripcion: string;
  fecha: FireDate;
  cuenta?: string;
  cuentaId?: string;
  walletId?: string;
  creditCardId?: string;
  destinationAccountId?: string;
  categoria?: string;
  categoriaId?: string;
  persona?: string;
  personaId?: string;
  personId?: string;
  contactId?: string;
  relatedDebtId?: string;
  relatedObligationId?: string;
  scheduledPaymentId?: string;
  scheduledPeriod?: string;
  notas?: string;
  createdAt?: FireDate;
  updatedAt?: FireDate;
  createdBy?: string;
  updatedBy?: string;
  isDeleted?: boolean;
  deletedAt?: FireDate;
  deletedBy?: string;
}

export interface Category {
  id: string;
  nombre: string;
  icono?: string;
  color?: string;
  tipo: 'expense' | 'income';  // REQUIRED, no ambiguity
  createdAt?: FireDate;
  updatedAt?: FireDate;
  createdBy?: string;
  updatedBy?: string;
}

export type ContactKind = 'person' | 'company' | 'bank' | 'client' | 'provider' | 'entity';
export type ContactRole = 'debtor' | 'creditor' | 'client' | 'provider' | 'bank' | 'other';
export interface Person {
  id: string;
  nombre: string;
  deuda: number;
  tipo?: 'PRESTAMISTA' | 'DEUDOR';
  tipoDeuda?: 'PRESTAMISTA' | 'PRESTADO' | 'DEUDOR' | null;
  fecha?: FireDate;
  contactType?: ContactKind;
  roles?: ContactRole[];
  phone?: string;
  email?: string;
  notes?: string;
  transacciones?: unknown[];
  active?: boolean;
  createdAt?: FireDate;
  updatedAt?: FireDate;
  createdBy?: string;
  updatedBy?: string;
}

export interface Wallet {
  id: string;
  type: 'Yape' | 'Plin' | 'Otra';
  linkedAccountId: string;
  createdAt?: FireDate;
  updatedAt?: FireDate;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreditCard {
  id: string;
  userId?: string;
  
  // Primary fields (required)
  nombre: string;
  banco: string;
  lineaCredito: number;
  montoUtilizado: number;
  
  // New required fields for professional cards
  marca: 'Visa' | 'Mastercard' | 'American Express' | 'Diners' | 'Discover' | 'Other';
  currency: Currency;
  lastDigits: string; // Last 4 digits
  cardColor: string; // Hex color for visual identification
  cutOffDay: number; // 1-31: day when cycle resets
  duePaymentDay: number; // 1-31: day payment is due
  minimumPayment: number;
  linkedAccountId: string; // Default payment account
  
  // Optional fields
  tasaInteres?: number;
  interestRate?: number;
  notes?: string;
  
  // Legacy/backward compatibility fields
  brand?: 'Visa' | 'Mastercard' | 'American Express' | 'Diners' | 'Otra';
  bank?: string;
  name?: string;
  creditLimit?: number;
  usedAmount?: number;
  availableAmount?: number;
  cutDay?: number;
  paymentDay?: number;
  fechaCorte?: string;
  fechaMaximaPago?: string;
  pagoMinimo?: number;
  color?: string;
  icono?: string;
  
  // System fields
  createdAt?: FireDate;
  updatedAt?: FireDate;
  createdBy?: string;
  updatedBy?: string;
}

export interface Subscription {
  id: string;
  nombre: string;
  monto: number;
  frecuencia: 'monthly' | 'weekly' | 'yearly';
  fechaVencimiento: string;
  cuentaId?: string;
  activo: boolean;
  createdAt?: FireDate;
  updatedAt?: FireDate;
  createdBy?: string;
  updatedBy?: string;
}

export interface Settings {
  saldoInicial: number;
  moneda: string;
  tema: 'oscuro' | 'claro';
  notificaciones: boolean;
  onboardingCompleted: boolean;
  updatedAt?: FireDate;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp(email: string, password: string, nombre: string): Promise<void>;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  error?: Error;
}

export type DebtStatus = 'pending' | 'partial' | 'paid' | 'overdue';
export type PayableCreditorType = 'person' | 'bank' | 'company' | 'sunat' | 'other';
export type ScheduledPaymentFrequency = 'monthly' | 'weekly' | 'yearly' | 'custom';
export type ScheduledPaymentPeriodStatus = 'pending' | 'paid' | 'overdue' | 'skipped';
export type IncomeCategory = 'salary' | 'fees' | 'freelance' | 'commission' | 'sale' | 'bonus' | 'other';

export interface ReceivableDebt {
  id: string;
  personId: string;
  contactId?: string;
  description: string;
  date: FireDate;
  dueDate?: FireDate;
  originalAmount: number;
  pendingBalance: number;
  status: DebtStatus;
  notes?: string;
  createdAt?: FireDate;
  updatedAt?: FireDate;
  createdBy?: string;
  updatedBy?: string;
}

export interface ReceivablePayment {
  id: string;
  debtId: string;
  personId: string;
  contactId?: string;
  date: FireDate;
  amount: number;
  accountId: string;
  observations?: string;
  transactionId?: string;
  createdAt?: FireDate;
  updatedAt?: FireDate;
  createdBy?: string;
  updatedBy?: string;
}

export interface PayableObligation {
  id: string;
  creditorName: string;
  creditorType: PayableCreditorType;
  contactId?: string;
  personId?: string;
  description: string;
  date: FireDate;
  dueDate: FireDate;
  originalAmount: number;
  pendingBalance: number;
  status: DebtStatus;
  notes?: string;
  createdAt?: FireDate;
  updatedAt?: FireDate;
  createdBy?: string;
  updatedBy?: string;
}

export interface PayablePayment {
  id: string;
  obligationId: string;
  contactId?: string;
  personId?: string;
  date: FireDate;
  amount: number;
  accountId: string;
  observations?: string;
  transactionId?: string;
  createdAt?: FireDate;
  updatedAt?: FireDate;
  createdBy?: string;
  updatedBy?: string;
}

export interface ScheduledPayment {
  id: string;
  name: string;
  category: string;
  amount: number;
  dueDay: number;
  frequency: ScheduledPaymentFrequency;
  customFrequencyDays?: number;
  suggestedAccountId?: string;
  active: boolean;
  reminders: number[];
  lastPaidAt?: FireDate;
  nextDuePeriod?: string;
  createdAt?: FireDate;
  updatedAt?: FireDate;
  createdBy?: string;
  updatedBy?: string;
}

export interface ScheduledPaymentPeriod {
  id: string;
  paymentId: string;
  period: string;
  status: ScheduledPaymentPeriodStatus;
  amount: number;
  dueDate: FireDate;
  paidAt?: FireDate;
  accountId?: string;
  transactionId?: string;
  notes?: string;
  createdAt?: FireDate;
  updatedAt?: FireDate;
  createdBy?: string;
  updatedBy?: string;
}

export interface IncomeRecord {
  id: string;
  description: string;
  category: IncomeCategory;
  date: FireDate;
  amount: number;
  destinationAccountId: string;
  notes?: string;
  transactionId?: string;
  createdAt?: FireDate;
  updatedAt?: FireDate;
  createdBy?: string;
  updatedBy?: string;
}
