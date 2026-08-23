'use server';

import { CreditCardRepository } from '@/lib/repositories/credit-card.repository';
import { transactionService } from '@/services/transaction.service';
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

/**
 * Corrige el monto utilizado de una tarjeta a mano (ej. la cuadratura no
 * coincide con el banco, un cargo que nunca se registró, etc.). No edita el
 * campo directamente: crea una transacción de "ajuste" con la diferencia,
 * así pasa por la misma lógica que cualquier cargo/pago (queda en
 * Movimientos y actualiza usedAmount/availableAmount de forma consistente),
 * sin tocar el saldo de ninguna cuenta bancaria.
 */
export async function adjustCreditCardUsageAction(
  uid: string,
  cardId: string,
  newUsedAmount: number,
  reason?: string
): Promise<CreditCard | null> {
  const card = await repo.getById(uid, cardId);
  if (!card) throw new Error('Tarjeta no encontrada');

  const currentUsed = card.montoUtilizado ?? card.usedAmount ?? 0;
  const delta = newUsedAmount - currentUsed;
  if (Math.abs(delta) < 0.01) return card;

  await transactionService.create(uid, {
    monto: Math.abs(delta),
    tipo: delta > 0 ? 'card_purchase' : 'card_payment',
    descripcion: `Ajuste de saldo: ${reason?.trim() || card.nombre}`,
    fecha: new Date(),
    creditCardId: cardId,
    categoria: 'Ajuste',
  });

  return repo.getById(uid, cardId);
}
