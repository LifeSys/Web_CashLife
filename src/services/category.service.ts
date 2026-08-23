import { Category } from '@/types';
import { DEFAULT_CATEGORIES } from '@/firebase/constants';
import {
  getAllCategoriesAction,
  getCategoryByIdAction,
  createCategoryRecordAction,
  updateCategoryRecordAction,
} from '@/lib/actions/category.actions';

class CategoryService {
  async getAll(uid: string): Promise<Category[]> {
    const categories = await getAllCategoriesAction(uid);
    // Auto-create default categories if none exist
    if (categories.length === 0) {
      await this.ensureDefaultCategories(uid);
      return getAllCategoriesAction(uid);
    }
    return categories;
  }

  async ensureDefaultCategories(uid: string): Promise<void> {
    for (const category of DEFAULT_CATEGORIES) {
      await createCategoryRecordAction(uid, category);
    }
  }

  async getById(uid: string, id: string): Promise<Category | null> {
    return getCategoryByIdAction(uid, id);
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
    const existingCategories = await getAllCategoriesAction(uid);
    if (existingCategories.some(c =>
      c.nombre.toLowerCase() === category.nombre.toLowerCase() &&
      c.tipo === category.tipo
    )) {
      throw new Error(`Ya existe una categoría de ${category.tipo === 'expense' ? 'gasto' : 'ingreso'} llamada "${category.nombre}"`);
    }

    return createCategoryRecordAction(uid, category);
  }

  async update(uid: string, id: string, data: Partial<Category>): Promise<Category | null> {
    return updateCategoryRecordAction(uid, id, data);
  }
}

export const categoryService = new CategoryService();
