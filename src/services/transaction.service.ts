import { Transaction } from '@/types';
import { PaginationOptions } from '@/lib/repositories/base.repository';
import { walletService } from '@/services/wallet.service';
import {
  getAllTransactionsAction,
  getTransactionByIdAction,
  getTransactionsByDateRangeAction,
  getTransactionsByAccountAction,
  getTransactionsByCategoryAction,
  getTransactionsByPersonAction,
  getTransactionsTotalByTypeAction,
  createTransactionRecordAction,
  updateTransactionAction,
  deleteTransactionAction,
} from '@/lib/actions/transaction.actions';

/**
 * Lógica de negocio para transacciones.
 * El cálculo de saldo y la persistencia ocurren del lado del servidor
 * (Server Actions -> Prisma/Postgres); esta clase solo orquesta.
 */
class TransactionService {
  async getAll(uid: string, options?: PaginationOptions) {
    return getAllTransactionsAction(uid, options);
  }

  async getById(uid: string, id: string): Promise<Transaction | null> {
    return getTransactionByIdAction(uid, id);
  }

  async getByDateRange(uid: string, startDate: Date, endDate: Date): Promise<Transaction[]> {
    return getTransactionsByDateRangeAction(uid, startDate, endDate);
  }

  async getByAccount(uid: string, accountId: string): Promise<Transaction[]> {
    return getTransactionsByAccountAction(uid, accountId);
  }

  async getByCategory(uid: string, categoryId: string): Promise<Transaction[]> {
    return getTransactionsByCategoryAction(uid, categoryId);
  }

  async getByPerson(uid: string, personId: string): Promise<Transaction[]> {
    return getTransactionsByPersonAction(uid, personId);
  }

  async getTotalByType(uid: string, type: string): Promise<number> {
    return getTransactionsTotalByTypeAction(uid, type);
  }

  /**
   * Crear transacción con cálculo automático de saldo.
   * Usa una transacción SQL atómica (ver TransactionRepository.create).
   */
  async create(
    uid: string,
    transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'isDeleted'>
  ): Promise<Transaction> {
    const normalizedTransaction = { ...transaction };
    if (normalizedTransaction.walletId) {
      const wallets = await walletService.getAll(uid);
      const wallet = wallets.find((item) => item.id === normalizedTransaction.walletId);
      if (!wallet) throw new Error('Billetera no encontrada');
      normalizedTransaction.cuenta = wallet.linkedAccountId;
    }

    return createTransactionRecordAction(uid, normalizedTransaction);
  }

  async update(uid: string, id: string, data: Partial<Transaction>): Promise<Transaction | null> {
    return updateTransactionAction(uid, id, data);
  }

  /**
   * Eliminar transacción (soft delete) con reversión automática de saldo.
   */
  async delete(uid: string, id: string): Promise<boolean> {
    return deleteTransactionAction(uid, id);
  }
}

export const transactionService = new TransactionService();
