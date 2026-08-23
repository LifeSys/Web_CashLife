import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';
import { Subscription } from '@/types';
import { BaseRepository } from './base.repository';

function toSubscription(row: Record<string, unknown>): Subscription {
  return { ...(row as object), id: row.id as string } as Subscription;
}

export class SubscriptionRepository extends BaseRepository {
  async getAll(uid: string): Promise<Subscription[]> {
    const rows = await prisma.subscription.findMany({ where: { userId: uid }, orderBy: { fechaVencimiento: 'asc' } });
    return rows.map(toSubscription);
  }

  async create(uid: string, subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<Subscription> {
    const row = await prisma.subscription.create({
      data: {
        ...(subscription as Record<string, unknown>),
        userId: uid,
        createdBy: uid,
        updatedBy: uid,
      } as Prisma.SubscriptionUncheckedCreateInput,
    });
    return toSubscription(row);
  }
}
