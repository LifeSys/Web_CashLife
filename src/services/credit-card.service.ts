import { CreditCard } from '@/types';
import { CreditCardRepository } from '@/lib/repositories/credit-card.repository';

class CreditCardService {
  private repository = new CreditCardRepository();

  async getAll(uid: string): Promise<CreditCard[]> {
    return this.repository.getAll(uid);
  }

  async create(uid: string, card: Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<CreditCard> {
    const creditLimit = card.creditLimit ?? card.lineaCredito ?? 0;
    const usedAmount = card.usedAmount ?? card.montoUtilizado ?? 0;
    return this.repository.create(uid, {
      ...card,
      lineaCredito: creditLimit,
      montoUtilizado: usedAmount,
      fechaCorte: String(card.cutDay ?? card.fechaCorte ?? ''),
      fechaMaximaPago: String(card.paymentDay ?? card.fechaMaximaPago ?? ''),
      pagoMinimo: card.minimumPayment ?? card.pagoMinimo ?? 0,
      tasaInteres: card.interestRate ?? card.tasaInteres ?? 0,
      creditLimit,
      usedAmount,
      availableAmount: creditLimit - usedAmount,
    });
  }
}

export const creditCardService = new CreditCardService();
