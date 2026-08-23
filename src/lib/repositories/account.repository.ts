import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';
import { Account } from '@/types';
import { BaseRepository } from './base.repository';

function toAccount(row: Record<string, unknown>): Account {
  return { ...(row as object), id: row.id as string } as Account;
}

export class AccountRepository extends BaseRepository {
  /**
   * Obtiene todas las cuentas del usuario
   */
  async getAll(uid: string): Promise<Account[]> {
    const rows = await prisma.account.findMany({ where: { userId: uid }, orderBy: { nombre: 'asc' } });
    return rows.map(toAccount);
  }

  /**
   * Obtiene cuenta por ID
   */
  async getById(uid: string, id: string): Promise<Account | null> {
    const row = await prisma.account.findFirst({ where: { id, userId: uid } });
    return row ? toAccount(row) : null;
  }

  /**
   * Crea una nueva cuenta
   */
  async create(uid: string, account: Omit<Account, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<Account> {
    const row = await prisma.account.create({
      data: {
        ...(account as Record<string, unknown>),
        userId: uid,
        createdBy: uid,
        updatedBy: uid,
      } as Prisma.AccountUncheckedCreateInput,
    });
    return toAccount(row);
  }

  /**
   * Actualiza una cuenta
   */
  async update(uid: string, id: string, data: Partial<Account>): Promise<Account | null> {
    const existing = await prisma.account.findFirst({ where: { id, userId: uid } });
    if (!existing) return null;
    const { id: _id, userId: _uid, createdAt: _ca, createdBy: _cb, ...rest } = data as Record<string, unknown>;
    const row = await prisma.account.update({
      where: { id },
      data: { ...rest, updatedBy: uid } as Prisma.AccountUncheckedUpdateInput,
    });
    return toAccount(row);
  }

  /**
   * Elimina una cuenta (excepto Efectivo)
   */
  async delete(uid: string, id: string): Promise<void> {
    const account = await this.getById(uid, id);
    if (!account) {
      throw new Error(`Cuenta ${id} no encontrada`);
    }

    if (account.nombre === 'Efectivo' && account.tipo === 'cash') {
      throw new Error('No se puede eliminar la cuenta Efectivo');
    }

    await prisma.account.delete({ where: { id } });
  }

  /**
   * Obtiene el saldo total de todas las cuentas
   */
  async getTotalBalance(uid: string): Promise<number> {
    const accounts = await this.getAll(uid);
    return accounts.reduce((total, account) => total + account.saldo, 0);
  }
}
