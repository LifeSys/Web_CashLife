'use server';

import { TransactionRepository } from '@/lib/repositories/transaction.repository';
import { PaginatedResult, PaginationOptions } from '@/lib/repositories/base.repository';
import { Transaction } from '@/types';

const repo = new TransactionRepository();

export async function getAllTransactionsAction(uid: string, options?: PaginationOptions): Promise<PaginatedResult<Transaction>> {
  return repo.getAll(uid, options);
}

export async function getTransactionByIdAction(uid: string, id: string): Promise<Transaction | null> {
  return repo.getById(uid, id);
}

export async function getTransactionsByDateRangeAction(uid: string, startDate: Date, endDate: Date): Promise<Transaction[]> {
  return repo.getByDateRange(uid, startDate, endDate);
}

export async function getTransactionsByAccountAction(uid: string, accountId: string): Promise<Transaction[]> {
  return repo.getByAccount(uid, accountId);
}

export async function getTransactionsByCategoryAction(uid: string, categoryId: string): Promise<Transaction[]> {
  return repo.getByCategory(uid, categoryId);
}

export async function getTransactionsByPersonAction(uid: string, personId: string): Promise<Transaction[]> {
  return repo.getByPerson(uid, personId);
}

export async function getTransactionsTotalByTypeAction(uid: string, type: string): Promise<number> {
  return repo.getTotalByType(uid, type);
}

export async function createTransactionRecordAction(
  uid: string,
  transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'isDeleted'>
): Promise<Transaction> {
  return repo.create(uid, transaction);
}

export async function updateTransactionAction(uid: string, id: string, data: Partial<Transaction>): Promise<Transaction | null> {
  return repo.update(uid, id, data);
}

export async function deleteTransactionAction(uid: string, id: string): Promise<boolean> {
  return repo.delete(uid, id);
}
