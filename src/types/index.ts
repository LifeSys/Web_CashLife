// Tipos de datos centralizados para CashLife

export type TransactionType = 'GASTO' | 'INGRESO' | 'TRANSFERENCIA' | 'PRESTAMO';
export type DebtType = 'PRESTADO' | 'PRESTAMISTA' | null;

export interface User {
  id: string;
  nombre: string;
  email: string;
  avatar?: string;
}

export interface Account {
  id: string;
  nombre: string;
  saldo: number;
  color: string;
  icono: string;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  tipo: TransactionType;
  monto: number;
  descripcion: string;
  cuentaId: string;
  categoriaId: string;
  personaId?: string;
  fecha: Date;
  notas?: string;
  createdAt: Date;
}

export interface Person {
  id: string;
  nombre: string;
  deuda: number;
  tipoDeuda: DebtType;
  transacciones: string[];
  createdAt: Date;
}

export interface Category {
  id: string;
  nombre: string;
  icono: string;
  color: string;
  tipo?: 'gasto' | 'ingreso';
  createdAt: Date;
}

export interface Settings {
  id: string;
  usuarioId: string;
  saldoInicial: number;
  moneda: string;
  tema: 'oscuro' | 'claro';
  notificaciones: boolean;
  updatedAt: Date;
}
