import { Category } from '@/types';
import { CategoryRepository } from '@/lib/repositories/category.repository';
import { DEFAULT_CATEGORIES } from '@/firebase/constants';

class CategoryService {
  private repository = new CategoryRepository();

  async getAll(uid: string): Promise<Category[]> {
    const categories = await this.repository.getAll(uid);
    // Auto-create default categories if none exist
    if (categories.length === 0) {
      await this.ensureDefaultCategories(uid);
      return this.repository.getAll(uid);
    }
    return categories;
  }

  async ensureDefaultCategories(uid: string): Promise<void> {
    for (const category of DEFAULT_CATEGORIES) {
      await this.repository.create(uid, category);
    }
  }

  async getById(uid: string, id: string): Promise<Category | null> {
    return this.repository.getById(uid, id);
  }

  async create(
    uid: string,
    category: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>
  ): Promise<Category> {
    // Validate required fields
    if (!category.nombre || !category.nombre.trim()) {
      throw new Error('El nombre de la categoría es requerido');
    }
    if (!category.tipo || !['expense', 'income'].includes(category.tipo)) {
      throw new Error('El tipo de categoría debe ser "expense" o "income"');
    }

    // Prevent duplicate category names within same type
    const existingCategories = await this.repository.getAll(uid);
    if (existingCategories.some(c => 
      c.nombre.toLowerCase() === category.nombre.toLowerCase() && 
      c.tipo === category.tipo
    )) {
      throw new Error(`Ya existe una categoría de ${category.tipo === 'expense' ? 'gasto' : 'ingreso'} llamada "${category.nombre}"`);
    }
    
    return this.repository.create(uid, category);
  }

  async update(uid: string, id: string, data: Partial<Category>): Promise<Category | null> {
    return this.repository.update(uid, id, data);
  }
}

export const categoryService = new CategoryService();
