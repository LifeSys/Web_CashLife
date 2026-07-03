import { Subscription } from '@/types';
import { SubscriptionRepository } from '@/lib/repositories/subscription.repository';

class SubscriptionService {
  private repository = new SubscriptionRepository();

  async getAll(uid: string): Promise<Subscription[]> {
    return this.repository.getAll(uid);
  }

  async create(uid: string, subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<Subscription> {
    return this.repository.create(uid, subscription);
  }
}

export const subscriptionService = new SubscriptionService();
