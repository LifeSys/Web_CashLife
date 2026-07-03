import {
  doc,
  getDoc,
  setDoc,
  runTransaction,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { Settings } from '@/types';
import { BaseRepository } from './base.repository';
import { FIRESTORE_COLLECTIONS, DEFAULT_SETTINGS } from '@/firebase/constants';

export class SettingsRepository extends BaseRepository {
  /**
   * Obtiene configuración del usuario
   */
  async get(uid: string): Promise<Settings> {
    const docRef = doc(db, `users/${uid}/${FIRESTORE_COLLECTIONS.SETTINGS}/config`);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return DEFAULT_SETTINGS;
    }

    return this.convertTimestampsToDate(docSnap.data() as Settings);
  }

  /**
   * Actualiza configuración del usuario
   */
  async update(uid: string, settings: Partial<Settings>): Promise<Settings> {
    return await runTransaction(db, async (t) => {
      const docRef = doc(db, `users/${uid}/${FIRESTORE_COLLECTIONS.SETTINGS}/config`);
      const updateData = {
        ...settings,
        updatedAt: Timestamp.now(),
      };
      t.set(docRef, updateData, { merge: true });
      return this.convertTimestampsToDate({
        ...DEFAULT_SETTINGS,
        ...updateData,
      });
    });
  }

  /**
   * Inicializa configuración predeterminada
   */
  async initialize(uid: string): Promise<Settings> {
    return await runTransaction(db, async (t) => {
      const docRef = doc(db, `users/${uid}/${FIRESTORE_COLLECTIONS.SETTINGS}/config`);
      const settingsData = {
        ...DEFAULT_SETTINGS,
        updatedAt: Timestamp.now(),
      };
      t.set(docRef, settingsData);
      return this.convertTimestampsToDate(settingsData);
    });
  }
}
