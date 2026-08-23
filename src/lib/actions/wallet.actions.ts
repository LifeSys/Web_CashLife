'use server';

import { WalletRepository } from '@/lib/repositories/wallet.repository';
import type { Wallet } from '@/types';

const repo = new WalletRepository();

export async function getAllWalletsAction(uid: string): Promise<Wallet[]> {
  return repo.getAll(uid);
}

export async function createWalletRecordAction(uid: string, wallet: Omit<Wallet, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<Wallet> {
  return repo.create(uid, wallet);
}
