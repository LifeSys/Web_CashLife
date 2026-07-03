import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  runTransaction,
  Timestamp,
  collection,
  addDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { User, Account, Category, Settings } from '@/types';
import { BaseRepository } from './base.repository';
import { FIRESTORE_COLLECTIONS, DEFAULT_ACCOUNTS, DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from '@/firebase/constants';

export class UserRepository extends BaseRepository {
  /**
   * Obtiene perfil del usuario
   */
  async getProfile(uid: string): Promise<User | null> {
    const docRef = doc(db, `users/${uid}`);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    return {
      uid,
      ...this.convertTimestampsToDate(docSnap.data() as Omit<User, 'uid'>),
    } as User;
  }

  /**
   * Crea perfil de usuario
   */
  async createProfile(
    uid: string,
    data: { email: string; nombre: string }
  ): Promise<User> {
    const docRef = doc(db, `users/${uid}`);
    const profileData = {
      email: data.email,
      nombre: data.nombre,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    await setDoc(docRef, profileData);
    return {
      uid,
      ...this.convertTimestampsToDate(profileData),
    } as User;
  }

  /**
   * Actualiza perfil del usuario
   */
  async updateProfile(uid: string, data: Partial<User>): Promise<User | null> {
    return await runTransaction(db, async (t) => {
      const docRef = doc(db, `users/${uid}`);
      const docSnap = await t.get(docRef);
      if (!docSnap.exists()) return null;

      const updateData = {
        ...data,
        updatedAt: Timestamp.now(),
      };
      t.update(docRef, updateData);

      return {
        uid,
        ...this.convertTimestampsToDate({
          ...docSnap.data(),
          ...updateData,
        } as Omit<User, 'uid'>),
      } as User;
    });
  }

  /**
   * OPERACIÓN ATÓMICA: Inicializa nuevo usuario con datos por defecto
   * - Crea perfil
   * - Crea settings
   * - Crea cuentas por defecto
   * - Crea categorías por defecto
   */
  async initializeNewUser(uid: string, data: { email: string; nombre: string }): Promise<void> {
    return await runTransaction(db, async (t) => {
      // 1. Crear perfil
      const profileRef = doc(db, `users/${uid}`);
      t.set(profileRef, {
        email: data.email,
        nombre: data.nombre,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // 2. Crear settings
      const settingsRef = doc(db, `users/${uid}/${FIRESTORE_COLLECTIONS.SETTINGS}/config`);
      t.set(settingsRef, {
        ...DEFAULT_SETTINGS,
        updatedAt: Timestamp.now(),
      });

      // 3. Crear cuentas por defecto
      DEFAULT_ACCOUNTS.forEach((account) => {
        const accountRef = doc(collection(db, `users/${uid}/${FIRESTORE_COLLECTIONS.ACCOUNTS}`));
        t.set(accountRef, {
          nombre: account.nombre,
          tipo: account.tipo,
          color: account.color,
          icono: account.icono,
          saldo: 0,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          createdBy: uid,
          updatedBy: uid,
        });
      });

      // 4. Crear categorías por defecto
      DEFAULT_CATEGORIES.forEach((category) => {
        const categoryRef = doc(collection(db, `users/${uid}/${FIRESTORE_COLLECTIONS.CATEGORIES}`));
        t.set(categoryRef, {
          nombre: category.nombre,
          icono: category.icono,
          color: category.color,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          createdBy: uid,
          updatedBy: uid,
        });
      });
    });
  }
}
