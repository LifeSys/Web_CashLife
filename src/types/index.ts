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

// Account (Cuenta bancaria/billetera)
export interface Account {
  id: string;
  nombre: string;
  saldo: number;
  tipo: 'cash' | 'bank' | 'wallet' | 'safe_box' | 'debit';
  banco?: string;
  subtipo?: 'savings' | 'checking';
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
  cuenta: string; // accountId (relación)
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



// CreditCard (Tarjeta de crédito independiente)
export interface CreditCard {
  id: string;
  banco: string;
  nombre: string;
  lineaCredito: number;
  montoUtilizado: number;
  fechaCorte: string;
  fechaMaximaPago: string;
  pagoMinimo: number;
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
