import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  orderBy,
  runTransaction,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { Category } from '@/types';
import { BaseRepository } from './base.repository';
import { FIRESTORE_COLLECTIONS } from '@/firebase/constants';

export class CategoryRepository extends BaseRepository {
  /**
   * Obtiene todas las categorías del usuario
   */
  async getAll(uid: string): Promise<Category[]> {
    const q = query(
      collection(db, `users/${uid}/${FIRESTORE_COLLECTIONS.CATEGORIES}`),
      orderBy('nombre', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => (this.withDocId<Category>(doc.id, doc.data())));
  }

  /**
   * Obtiene categoría por ID
   */
  async getById(uid: string, id: string): Promise<Category | null> {
    const docRef = doc(db, `users/${uid}/${FIRESTORE_COLLECTIONS.CATEGORIES}/${id}`);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return this.withDocId<Category>(docSnap.id, docSnap.data());
  }

  /**
   * Crea una nueva categoría
   */
  async create(
    uid: string,
    category: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>
  ): Promise<Category> {
    const docRef = doc(collection(db, `users/${uid}/${FIRESTORE_COLLECTIONS.CATEGORIES}`));
    const categoryData = this.createAuditedData(category, uid);
    await runTransaction(db, async (t) => {
      t.set(docRef, categoryData);
    });
    return {
      id: docRef.id,
      ...this.convertTimestampsToDate(categoryData),
    };
  }

  /**
   * Actualiza una categoría
   */
  async update(
    uid: string,
    id: string,
    data: Partial<Category>
  ): Promise<Category | null> {
    return await runTransaction(db, async (t) => {
      const docRef = doc(db, `users/${uid}/${FIRESTORE_COLLECTIONS.CATEGORIES}/${id}`);
      const docSnap = await t.get(docRef);
      if (!docSnap.exists()) return null;

      const updateData = this.updateAuditedData(data, uid);
      t.update(docRef, updateData);

      return this.withDocId<Category>(docSnap.id, { ...docSnap.data(), ...updateData });
    });
  }
}
