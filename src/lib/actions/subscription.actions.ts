'use server';

import { SubscriptionRepository } from '@/lib/repositories/subscription.repository';
import { Subscription } from '@/types';

const repo = new SubscriptionRepository();

export async function getAllSubscriptionsAction(uid: string): Promise<Subscription[]> {
  return repo.getAll(uid);
}

export async function createSubscriptionRecordAction(uid: string, subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<Subscription> {
  return repo.create(uid, subscription);
}
