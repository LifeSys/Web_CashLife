import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';
import { CreditCard } from '@/types';
import { BaseRepository } from './base.repository';

function toCreditCard(row: Record<string, unknown>): CreditCard {
  return { ...(row as object), id: row.id as string } as CreditCard;
}

export class CreditCardRepository extends BaseRepository {
  async getAll(uid: string): Promise<CreditCard[]> {
    const rows = await prisma.creditCard.findMany({ where: { userId: uid }, orderBy: { nombre: 'asc' } });
    return rows.map(toCreditCard);
  }

  async getById(uid: string, id: string): Promise<CreditCard | null> {
    const row = await prisma.creditCard.findFirst({ where: { id, userId: uid } });
    return row ? toCreditCard(row) : null;
  }

  async create(uid: string, card: Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<CreditCard> {
    const row = await prisma.creditCard.create({
      data: {
        ...(card as Record<string, unknown>),
        userId: uid,
        createdBy: uid,
        updatedBy: uid,
      } as Prisma.CreditCardUncheckedCreateInput,
    });
    return toCreditCard(row);
  }

  async update(uid: string, id: string, data: Partial<CreditCard>): Promise<CreditCard | null> {
    const existing = await prisma.creditCard.findFirst({ where: { id, userId: uid } });
    if (!existing) return null;
    const { id: _id, userId: _uid, createdAt: _ca, createdBy: _cb, ...rest } = data as Record<string, unknown>;
    const row = await prisma.creditCard.update({
      where: { id },
      data: { ...rest, updatedBy: uid } as Prisma.CreditCardUncheckedUpdateInput,
    });
    return toCreditCard(row);
  }

  async delete(uid: string, id: string): Promise<boolean> {
    const existing = await prisma.creditCard.findFirst({ where: { id, userId: uid } });
    if (!existing) return false;
    await prisma.creditCard.delete({ where: { id } });
    return true;
  }
}
