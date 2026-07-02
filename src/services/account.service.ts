import type { Account } from '@/types';
import { mockAccounts } from '@/lib/mock/accounts';

class AccountService {
  async getAll(): Promise<Account[]> {
    return Promise.resolve([...mockAccounts]);
  }

  async getById(id: string): Promise<Account | null> {
    return Promise.resolve(mockAccounts.find(a => a.id === id) || null);
  }

  async getTotalBalance(): Promise<number> {
    return Promise.resolve(
      mockAccounts.reduce((sum, account) => sum + account.saldo, 0)
    );
  }

  async updateBalance(id: string, newBalance: number): Promise<Account | null> {
    const account = mockAccounts.find(a => a.id === id);
    if (!account) return Promise.resolve(null);
    
    account.saldo = newBalance;
    return Promise.resolve(account);
  }

  async create(account: Omit<Account, 'id' | 'createdAt'>): Promise<Account> {
    const newAccount: Account = {
      ...account,
      id: `acc-${Date.now()}`,
      createdAt: new Date(),
    };
    mockAccounts.push(newAccount);
    return Promise.resolve(newAccount);
  }

  async update(id: string, data: Partial<Account>): Promise<Account | null> {
    const account = mockAccounts.find(a => a.id === id);
    if (!account) return Promise.resolve(null);
    
    Object.assign(account, data);
    return Promise.resolve(account);
  }

  async delete(id: string): Promise<boolean> {
    const index = mockAccounts.findIndex(a => a.id === id);
    if (index === -1) return Promise.resolve(false);
    
    mockAccounts.splice(index, 1);
    return Promise.resolve(true);
  }
}

export const accountService = new AccountService();
