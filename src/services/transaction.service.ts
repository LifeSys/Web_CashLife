import { Transaction } from '@/types';
import { TransactionRepository } from '@/lib/repositories/transaction.repository';
import { PaginationOptions } from '@/lib/repositories/base.repository';
import { walletService } from '@/services/wallet.service';

/**
 * Lógica de negocio para transacciones
 * Valida, calcula saldos y coordina con el repository
 */
class TransactionService {
  private repository = new TransactionRepository();

  async getAll(uid: string, options?: PaginationOptions) {
    return await this.repository.getAll(uid, options);
  }

  async getById(uid: string, id: string): Promise<Transaction | null> {
    return this.repository.getById(uid, id);
  }

  async getByDateRange(uid: string, startDate: Date, endDate: Date): Promise<Transaction[]> {
    return this.repository.getByDateRange(uid, startDate, endDate);
  }

  async getByAccount(uid: string, accountId: string): Promise<Transaction[]> {
    return this.repository.getByAccount(uid, accountId);
  }

  async getByCategory(uid: string, categoryId: string): Promise<Transaction[]> {
    return this.repository.getByCategory(uid, categoryId);
  }

  async getByPerson(uid: string, personId: string): Promise<Transaction[]> {
    return this.repository.getByPerson(uid, personId);
  }

  async getTotalByType(uid: string, type: string): Promise<number> {
    return this.repository.getTotalByType(uid, type);
  }

  /**
   * Crear transacción con cálculo automático de saldo
   * Usa transacción atómica en Firestore
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

    // Función que calcula el nuevo saldo según el tipo de transacción
    const calculateNewBalance = (currentBalance: number): number => {
      if (normalizedTransaction.creditCardId && normalizedTransaction.tipo !== 'credit_card_payment') return currentBalance;
      switch (normalizedTransaction.tipo) {
        case 'expense':
        case 'payable_payment':
        case 'scheduled_payment':
          return currentBalance - normalizedTransaction.monto;
        case 'income':
          return currentBalance + normalizedTransaction.monto;
        case 'transfer':
          return currentBalance - normalizedTransaction.monto;
        case 'loan':
          return currentBalance - normalizedTransaction.monto;
        case 'loan_payment':
        case 'receivable_payment':
          return currentBalance + normalizedTransaction.monto;
        case 'credit_card_payment':
          return currentBalance - normalizedTransaction.monto;
        case 'credit_card_charge':
          return currentBalance;
        default:
          return currentBalance;
      }
    };

    return this.repository.create(uid, normalizedTransaction, calculateNewBalance);
  }

  async update(uid: string, id: string, data: Partial<Transaction>): Promise<Transaction | null> {
    return this.repository.update(uid, id, data);
  }

  /**
   * Eliminar transacción (soft delete) con cálculo automático de revertir saldo
   * Usa transacción atómica en Firestore
   */
  async delete(uid: string, id: string): Promise<boolean> {
    return this.repository.delete(uid, id);
  }
}

export const transactionService = new TransactionService();
