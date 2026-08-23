'use server';

import { CategoryRepository } from '@/lib/repositories/category.repository';
import { Category } from '@/types';

const repo = new CategoryRepository();

export async function getAllCategoriesAction(uid: string): Promise<Category[]> {
  return repo.getAll(uid);
}

export async function getCategoryByIdAction(uid: string, id: string): Promise<Category | null> {
  return repo.getById(uid, id);
}

export async function createCategoryRecordAction(uid: string, category: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<Category> {
  return repo.create(uid, category);
}

export async function updateCategoryRecordAction(uid: string, id: string, data: Partial<Category>): Promise<Category | null> {
  return repo.update(uid, id, data);
}
