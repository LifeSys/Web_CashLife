'use server';

import { CreditCardRepository } from '@/lib/repositories/credit-card.repository';
import { CreditCard } from '@/types';

const repo = new CreditCardRepository();

export async function getAllCreditCardsAction(uid: string): Promise<CreditCard[]> {
  return repo.getAll(uid);
}

export async function getCreditCardByIdAction(uid: string, id: string): Promise<CreditCard | null> {
  return repo.getById(uid, id);
}

export async function createCreditCardRecordAction(uid: string, card: Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<CreditCard> {
  return repo.create(uid, card);
}

export async function updateCreditCardRecordAction(uid: string, id: string, data: Partial<CreditCard>): Promise<CreditCard | null> {
  return repo.update(uid, id, data);
}

export async function deleteCreditCardRecordAction(uid: string, id: string): Promise<boolean> {
  return repo.delete(uid, id);
}
