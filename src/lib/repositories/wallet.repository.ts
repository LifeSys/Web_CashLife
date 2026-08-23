import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';
import type { Wallet } from '@/types';
import { BaseRepository } from './base.repository';

function toWallet(row: Record<string, unknown>): Wallet {
  return { ...(row as object), id: row.id as string } as Wallet;
}

export class WalletRepository extends BaseRepository {
  async getAll(uid: string): Promise<Wallet[]> {
    const rows = await prisma.wallet.findMany({ where: { userId: uid }, orderBy: { type: 'asc' } });
    return rows.map(toWallet);
  }

  async create(uid: string, wallet: Omit<Wallet, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<Wallet> {
    const row = await prisma.wallet.create({
      data: {
        ...(wallet as Record<string, unknown>),
        userId: uid,
        createdBy: uid,
        updatedBy: uid,
      } as Prisma.WalletUncheckedCreateInput,
    });
    return toWallet(row);
  }
}
