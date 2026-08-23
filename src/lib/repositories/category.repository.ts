import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';
import { Category } from '@/types';
import { BaseRepository } from './base.repository';

function toCategory(row: Record<string, unknown>): Category {
  return { ...(row as object), id: row.id as string } as Category;
}

export class CategoryRepository extends BaseRepository {
  async getAll(uid: string): Promise<Category[]> {
    const rows = await prisma.category.findMany({ where: { userId: uid }, orderBy: { nombre: 'asc' } });
    return rows.map(toCategory);
  }

  async getById(uid: string, id: string): Promise<Category | null> {
    const row = await prisma.category.findFirst({ where: { id, userId: uid } });
    return row ? toCategory(row) : null;
  }

  async create(uid: string, category: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<Category> {
    const row = await prisma.category.create({
      data: {
        ...(category as Record<string, unknown>),
        userId: uid,
        createdBy: uid,
        updatedBy: uid,
      } as Prisma.CategoryUncheckedCreateInput,
    });
    return toCategory(row);
  }

  async update(uid: string, id: string, data: Partial<Category>): Promise<Category | null> {
    const existing = await prisma.category.findFirst({ where: { id, userId: uid } });
    if (!existing) return null;
    const { id: _id, userId: _uid, createdAt: _ca, createdBy: _cb, ...rest } = data as Record<string, unknown>;
    const row = await prisma.category.update({
      where: { id },
      data: { ...rest, updatedBy: uid } as Prisma.CategoryUncheckedUpdateInput,
    });
    return toCategory(row);
  }
}
