import type { Wallet } from '@/types';
import { getAllWalletsAction, createWalletRecordAction } from '@/lib/actions/wallet.actions';

class WalletService {
  async getAll(uid: string): Promise<Wallet[]> {
    return getAllWalletsAction(uid);
  }

  async create(uid: string, wallet: Omit<Wallet, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<Wallet> {
    return createWalletRecordAction(uid, wallet);
  }
}

export const walletService = new WalletService();
