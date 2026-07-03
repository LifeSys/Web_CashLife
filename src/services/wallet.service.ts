import type { Wallet } from '@/types';
import { WalletRepository } from '@/lib/repositories/wallet.repository';

class WalletService {
  private repository = new WalletRepository();

  async getAll(uid: string): Promise<Wallet[]> {
    return this.repository.getAll(uid);
  }

  async create(uid: string, wallet: Omit<Wallet, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<Wallet> {
    return this.repository.create(uid, wallet);
  }
}

export const walletService = new WalletService();
