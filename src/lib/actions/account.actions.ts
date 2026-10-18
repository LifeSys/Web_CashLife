'use server';

import { AccountRepository } from '@/lib/repositories/account.repository';
import { transactionService } from '@/services/transaction.service';
import { Account } from '@/types';

const repo = new AccountRepository();

export async function getAllAccountsAction(uid: string): Promise<Account[]> {
  return repo.getAll(uid);
}

export async function getAccountByIdAction(uid: string, id: string): Promise<Account | null> {
  return repo.getById(uid, id);
}

export async function createAccountRecordAction(uid: string, account: Omit<Account, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<Account> {
  return repo.create(uid, account);
}

export async function updateAccountRecordAction(uid: string, id: string, data: Partial<Account>): Promise<Account | null> {
  return repo.update(uid, id, data);
}

export async function deleteAccountRecordAction(uid: string, id: string): Promise<void> {
  return repo.delete(uid, id);
}

export async function getTotalBalanceAction(uid: string): Promise<number> {
  return repo.getTotalBalance(uid);
}

/**
 * Regulariza el saldo de una cuenta para que cuadre con el banco o con el
 * efectivo contado. No edita el campo directamente: crea un ingreso o gasto
 * de "Ajuste" por la diferencia, así queda trazable en Movimientos y el
 * saldo se mueve por la misma lógica atómica que cualquier transacción.
 */
export async function adjustAccountBalanceAction(
  uid: string,
  accountId: string,
  newBalance: number,
  reason?: string
): Promise<Account | null> {
  const account = await repo.getById(uid, accountId);
  if (!account) throw new Error('Cuenta no encontrada');
  if (!Number.isFinite(newBalance)) throw new Error('Saldo inválido');

  const delta = Math.round((newBalance - (account.saldo ?? 0)) * 100) / 100;
  if (Math.abs(delta) < 0.01) return account;

  await transactionService.create(uid, {
    monto: Math.abs(delta),
    tipo: delta > 0 ? 'income' : 'expense',
    descripcion: `Regularización de saldo: ${reason?.trim() || account.nombre}`,
    fecha: new Date(),
    cuenta: accountId,
    categoria: 'Ajuste',
  });

  return repo.getById(uid, accountId);
}
