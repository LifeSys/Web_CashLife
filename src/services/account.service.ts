import { Account } from '@/types';
import { AccountRepository } from '@/lib/repositories/account.repository';

class AccountService {
  private repository = new AccountRepository();

  async getAll(uid: string): Promise<Account[]> {
    return this.repository.getAll(uid);
  }

  async getById(uid: string, id: string): Promise<Account | null> {
    return this.repository.getById(uid, id);
  }

  async getTotalBalance(uid: string): Promise<number> {
    return this.repository.getTotalBalance(uid);
  }

  async create(
    uid: string,
    account: Omit<Account, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>
  ): Promise<Account> {
    return this.repository.create(uid, account);
  }

  async update(uid: string, id: string, data: Partial<Account>): Promise<Account | null> {
    return this.repository.update(uid, id, data);
  }
}

export const accountService = new AccountService();
