import { CreditCard } from '@/types';
import {
  getAllCreditCardsAction,
  createCreditCardRecordAction,
  updateCreditCardRecordAction,
  deleteCreditCardRecordAction,
} from '@/lib/actions/credit-card.actions';

class CreditCardService {
  async getAll(uid: string): Promise<CreditCard[]> {
    return getAllCreditCardsAction(uid);
  }

  async getById(uid: string, id: string): Promise<CreditCard | null> {
    const cards = await this.getAll(uid);
    return cards.find(c => c.id === id) || null;
  }

  async create(uid: string, card: Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<CreditCard> {
    // Validate required fields for professional card creation
    if (!card.nombre?.trim()) throw new Error('El nombre de la tarjeta es requerido');
    if (!card.banco?.trim()) throw new Error('El banco es requerido');
    if (!card.marca) throw new Error('La marca es requerida');
    if (!card.currency) throw new Error('La moneda es requerida');
    if (!card.lastDigits?.trim()) throw new Error('Los últimos 4 dígitos son requeridos');
    if (!card.cardColor?.trim()) throw new Error('El color es requerido');
    if (card.cutOffDay < 1 || card.cutOffDay > 31) throw new Error('El día de corte debe estar entre 1 y 31');
    if (card.duePaymentDay < 1 || card.duePaymentDay > 31) throw new Error('El día de pago debe estar entre 1 y 31');
    if (card.lineaCredito <= 0) throw new Error('La línea de crédito debe ser mayor a 0');
    if (card.minimumPayment < 0) throw new Error('El pago mínimo no puede ser negativo');
    if (!card.linkedAccountId?.trim()) throw new Error('Debe seleccionar una cuenta para pagos');

    // Prevent duplicate card names
    const existingCards = await this.getAll(uid);
    if (existingCards.some(c => c.nombre === card.nombre)) {
      throw new Error(`Ya existe una tarjeta llamada "${card.nombre}"`);
    }

    const creditLimit = card.lineaCredito;
    const usedAmount = card.montoUtilizado || 0;

    return createCreditCardRecordAction(uid, {
      ...card,
      userId: uid,
      lineaCredito: creditLimit,
      montoUtilizado: usedAmount,
      // Ensure new format fields are set
      marca: card.marca,
      currency: card.currency,
      lastDigits: card.lastDigits,
      cardColor: card.cardColor,
      cutOffDay: card.cutOffDay,
      duePaymentDay: card.duePaymentDay,
      minimumPayment: card.minimumPayment,
      linkedAccountId: card.linkedAccountId,
      // Legacy fields for backward compatibility
      bank: card.banco,
      brand: card.marca,
      creditLimit,
      usedAmount,
      availableAmount: creditLimit - usedAmount,
      cutDay: card.cutOffDay,
      paymentDay: card.duePaymentDay,
      pagoMinimo: card.minimumPayment,
      fechaCorte: String(card.cutOffDay),
      fechaMaximaPago: String(card.duePaymentDay),
    });
  }

  async update(uid: string, id: string, data: Partial<CreditCard>): Promise<CreditCard | null> {
    const card = await this.getById(uid, id);
    if (!card) throw new Error('Tarjeta no encontrada');

    // Validate important fields if being updated
    if (data.nombre && !data.nombre.trim()) throw new Error('El nombre no puede estar vacío');
    if (data.cutOffDay && (data.cutOffDay < 1 || data.cutOffDay > 31)) throw new Error('El día de corte debe estar entre 1 y 31');
    if (data.duePaymentDay && (data.duePaymentDay < 1 || data.duePaymentDay > 31)) throw new Error('El día de pago debe estar entre 1 y 31');
    if (data.lineaCredito && data.lineaCredito <= 0) throw new Error('La línea de crédito debe ser mayor a 0');
    if (data.minimumPayment !== undefined && data.minimumPayment < 0) throw new Error('El pago mínimo no puede ser negativo');

    // Prevent renaming to duplicate name
    if (data.nombre && data.nombre !== card.nombre) {
      const existingCards = await this.getAll(uid);
      if (existingCards.some(c => c.id !== id && c.nombre === data.nombre)) {
        throw new Error(`Ya existe una tarjeta llamada "${data.nombre}"`);
      }
    }

    // Prevent modifying system fields
    const { id: _id, userId: _uid, createdAt: _ca, createdBy: _cb, ...updateData } = data;

    return updateCreditCardRecordAction(uid, id, updateData);
  }

  async delete(uid: string, id: string): Promise<void> {
    const card = await this.getById(uid, id);
    if (!card) throw new Error('Tarjeta no encontrada');
    await deleteCreditCardRecordAction(uid, id);
  }

  /**
   * Calculate total credit debt across user's cards
   */
  async calculateTotalCreditDebt(uid: string): Promise<number> {
    const cards = await this.getAll(uid);
    return cards.reduce((sum, card) => sum + (card.montoUtilizado || 0), 0);
  }

  /**
   * Calculate available credit for a specific card
   */
  calculateCreditAvailable(card: CreditCard): number {
    return card.lineaCredito - (card.montoUtilizado || 0);
  }

  /**
   * Calculate utilization percentage for a card
   */
  calculateUtilizationPercentage(card: CreditCard): number {
    if (card.lineaCredito === 0) return 0;
    return (card.montoUtilizado || 0) / card.lineaCredito * 100;
  }
}

export const creditCardService = new CreditCardService();
