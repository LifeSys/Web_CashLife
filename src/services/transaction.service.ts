import type { Transaction } from '@/types';
import { mockTransactions } from '@/lib/mock/transactions';

class TransactionService {
  // En el futuro, estos métodos cambiarán para usar Firebase
  // Pero la interfaz se mantendrá igual

  async getAll(): Promise<Transaction[]> {
    return Promise.resolve([...mockTransactions].sort((a, b) => 
      new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    ));
  }

  async getById(id: string): Promise<Transaction | null> {
    return Promise.resolve(mockTransactions.find(t => t.id === id) || null);
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    return Promise.resolve(
      mockTransactions.filter(t => {
        const tDate = new Date(t.fecha);
        return tDate >= startDate && tDate <= endDate;
      }).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    );
  }

  async getByAccount(accountId: string): Promise<Transaction[]> {
    return Promise.resolve(
      mockTransactions.filter(t => t.cuentaId === accountId)
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    );
  }

  async getByCategory(categoryId: string): Promise<Transaction[]> {
    return Promise.resolve(
      mockTransactions.filter(t => t.categoriaId === categoryId)
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    );
  }

  async getByPerson(personId: string): Promise<Transaction[]> {
    return Promise.resolve(
      mockTransactions.filter(t => t.personaId === personId)
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    );
  }

  async getTotalByType(type: string): Promise<number> {
    return Promise.resolve(
      mockTransactions
        .filter(t => t.tipo === type)
        .reduce((sum, t) => sum + t.monto, 0)
    );
  }

  async create(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
    const newTransaction: Transaction = {
      ...transaction,
      id: `tx-${Date.now()}`,
      createdAt: new Date(),
    };
    mockTransactions.push(newTransaction);
    return Promise.resolve(newTransaction);
  }

  async update(id: string, data: Partial<Transaction>): Promise<Transaction | null> {
    const index = mockTransactions.findIndex(t => t.id === id);
    if (index === -1) return Promise.resolve(null);
    
    mockTransactions[index] = { ...mockTransactions[index], ...data };
    return Promise.resolve(mockTransactions[index]);
  }

  async delete(id: string): Promise<boolean> {
    const index = mockTransactions.findIndex(t => t.id === id);
    if (index === -1) return Promise.resolve(false);
    
    mockTransactions.splice(index, 1);
    return Promise.resolve(true);
  }
}

export const transactionService = new TransactionService();
