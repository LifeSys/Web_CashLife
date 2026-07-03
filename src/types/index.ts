// Tipos de datos centralizados para CashLife
import { Timestamp } from 'firebase/firestore';

// User (Perfil del usuario)
export interface User {
  uid: string;
  email: string;
  nombre: string;
  avatar?: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

// Account (dinero real: efectivo, cuenta bancaria o caja fuerte)
export interface Account {
  id: string;
  nombre: string; // legacy alias for name
  saldo: number; // legacy alias for balance
  tipo: 'cash' | 'bank' | 'safe_box';
  banco?: string; // legacy alias for bank
  subtipo?: 'savings' | 'checking';
  bank?: string;
  name?: string;
  balance?: number;
  currency?: string;
  hasDebitCard?: boolean;
  color: string;
  icono: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  createdBy: string;
  updatedBy: string;
}

// Transaction (Movimiento financiero)
export interface Transaction {
  id: string;
  monto: number;
  tipo: 'expense' | 'income' | 'transfer' | 'loan' | 'loan_payment';
  descripcion: string;
  fecha: Timestamp | Date;
  cuenta: string; // accountId real afectado (wallets resuelven a linkedAccountId)
  walletId?: string; // medio de pago digital, no saldo propio
  creditCardId?: string; // tarjeta de crédito usada para aumentar deuda
  categoria?: string; // categoryId (relación)
  persona?: string; // personId (relación, solo si es préstamo)
  notas?: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  createdBy: string;
  updatedBy: string;
  isDeleted: boolean;
  deletedAt?: Timestamp | Date;
  deletedBy?: string;
}

// Category (Categoría de gasto)
export interface Category {
  id: string;
  nombre: string;
  icono: string;
  color: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  createdBy: string;
  updatedBy: string;
}

// Person (Persona para préstamos/deudas)
export interface Person {
  id: string;
  nombre: string;
  deuda: number;
  tipo: 'PRESTAMISTA' | 'DEUDOR';
  fecha: Timestamp | Date;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  createdBy: string;
  updatedBy: string;
}



export interface Wallet {
  id: string;
  type: 'Yape' | 'Plin' | 'Otra';
  linkedAccountId: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  createdBy: string;
  updatedBy: string;
}

// CreditCard (Tarjeta de crédito independiente: deuda, no saldo de cuenta)
export interface CreditCard {
  id: string;
  banco: string; // legacy alias for bank
  nombre: string; // legacy alias for name
  lineaCredito: number; // legacy alias for creditLimit
  montoUtilizado: number; // legacy alias for usedAmount
  fechaCorte: string; // legacy alias for cutDay
  fechaMaximaPago: string; // legacy alias for paymentDay
  pagoMinimo: number; // legacy alias for minimumPayment
  tasaInteres?: number; // legacy alias for interestRate
  bank?: string;
  name?: string;
  brand?: 'Visa' | 'Mastercard' | 'American Express' | 'Diners' | 'Otra';
  creditLimit?: number;
  usedAmount?: number;
  availableAmount?: number;
  cutDay?: number;
  paymentDay?: number;
  minimumPayment?: number;
  interestRate?: number;
  color: string;
  icono: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  createdBy: string;
  updatedBy: string;
}

// Subscription (Pago recurrente)
export interface Subscription {
  id: string;
  nombre: string;
  monto: number;
  frecuencia: 'monthly' | 'weekly' | 'yearly';
  fechaVencimiento: string;
  cuentaId?: string;
  activo: boolean;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  createdBy: string;
  updatedBy: string;
}

// Settings (Configuración del usuario)
export interface Settings {
  saldoInicial: number;
  moneda: string;
  tema: 'oscuro' | 'claro';
  notificaciones: boolean;
  onboardingCompleted: boolean;
  updatedAt?: Timestamp | Date;
}

// Auth Context
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp(email: string, password: string, nombre: string): Promise<void>;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  error?: Error;
}
