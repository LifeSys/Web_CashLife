'use server';

import { AccountRepository } from '@/lib/repositories/account.repository';
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
