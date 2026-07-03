import { CreditCard } from '@/types';
import { CreditCardRepository } from '@/lib/repositories/credit-card.repository';

class CreditCardService {
  private repository = new CreditCardRepository();

  async getAll(uid: string): Promise<CreditCard[]> {
    return this.repository.getAll(uid);
  }

  async create(uid: string, card: Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<CreditCard> {
    return this.repository.create(uid, card);
  }
}

export const creditCardService = new CreditCardService();
