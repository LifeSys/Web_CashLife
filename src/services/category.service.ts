import { Category } from '@/types';
import { CategoryRepository } from '@/lib/repositories/category.repository';

class CategoryService {
  private repository = new CategoryRepository();

  async getAll(uid: string): Promise<Category[]> {
    return this.repository.getAll(uid);
  }

  async getById(uid: string, id: string): Promise<Category | null> {
    return this.repository.getById(uid, id);
  }

  async create(
    uid: string,
    category: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>
  ): Promise<Category> {
    return this.repository.create(uid, category);
  }

  async update(uid: string, id: string, data: Partial<Category>): Promise<Category | null> {
    return this.repository.update(uid, id, data);
  }
}

export const categoryService = new CategoryService();
