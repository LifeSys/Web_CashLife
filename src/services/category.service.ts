import type { Category } from '@/types';
import { mockCategories } from '@/lib/mock/categories';

class CategoryService {
  async getAll(): Promise<Category[]> {
    return Promise.resolve([...mockCategories]);
  }

  async getById(id: string): Promise<Category | null> {
    return Promise.resolve(mockCategories.find(c => c.id === id) || null);
  }

  async getByType(type: 'gasto' | 'ingreso'): Promise<Category[]> {
    return Promise.resolve(
      mockCategories.filter(c => c.tipo === type || !c.tipo)
    );
  }

  async create(category: Omit<Category, 'id' | 'createdAt'>): Promise<Category> {
    const newCategory: Category = {
      ...category,
      id: `cat-${Date.now()}`,
      createdAt: new Date(),
    };
    mockCategories.push(newCategory);
    return Promise.resolve(newCategory);
  }

  async update(id: string, data: Partial<Category>): Promise<Category | null> {
    const category = mockCategories.find(c => c.id === id);
    if (!category) return Promise.resolve(null);
    
    Object.assign(category, data);
    return Promise.resolve(category);
  }

  async delete(id: string): Promise<boolean> {
    const index = mockCategories.findIndex(c => c.id === id);
    if (index === -1) return Promise.resolve(false);
    
    mockCategories.splice(index, 1);
    return Promise.resolve(true);
  }
}

export const categoryService = new CategoryService();
