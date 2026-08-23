import { Subscription } from '@/types';
import { getAllSubscriptionsAction, createSubscriptionRecordAction } from '@/lib/actions/subscription.actions';

class SubscriptionService {
  async getAll(uid: string): Promise<Subscription[]> {
    return getAllSubscriptionsAction(uid);
  }

  async create(uid: string, subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<Subscription> {
    return createSubscriptionRecordAction(uid, subscription);
  }
}

export const subscriptionService = new SubscriptionService();
