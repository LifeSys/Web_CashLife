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
import { Person } from '@/types';
import { BaseRepository } from './base.repository';
import { FIRESTORE_COLLECTIONS } from '@/firebase/constants';

export class PersonRepository extends BaseRepository {
  /**
   * Obtiene todas las personas del usuario
   */
  async getAll(uid: string): Promise<Person[]> {
    const q = query(
      collection(db, `users/${uid}/${FIRESTORE_COLLECTIONS.PEOPLE}`),
      orderBy('nombre', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => (this.withDocId<Person>(doc.id, doc.data())));
  }

  /**
   * Obtiene persona por ID
   */
  async getById(uid: string, id: string): Promise<Person | null> {
    const docRef = doc(db, `users/${uid}/${FIRESTORE_COLLECTIONS.PEOPLE}/${id}`);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return this.withDocId<Person>(docSnap.id, docSnap.data());
  }

  /**
   * Crea una nueva persona
   */
  async create(
    uid: string,
    person: Omit<Person, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>
  ): Promise<Person> {
    const docRef = doc(collection(db, `users/${uid}/${FIRESTORE_COLLECTIONS.PEOPLE}`));
    const personData = this.createAuditedData(person, uid);
    await runTransaction(db, async (t) => {
      t.set(docRef, personData);
    });
    return {
      id: docRef.id,
      ...this.convertTimestampsToDate(personData),
    };
  }

  /**
   * Actualiza una persona
   */
  async update(
    uid: string,
    id: string,
    data: Partial<Person>
  ): Promise<Person | null> {
    return await runTransaction(db, async (t) => {
      const docRef = doc(db, `users/${uid}/${FIRESTORE_COLLECTIONS.PEOPLE}/${id}`);
      const docSnap = await t.get(docRef);
      if (!docSnap.exists()) return null;

      const updateData = this.updateAuditedData(data, uid);
      t.update(docRef, updateData);

      return this.withDocId<Person>(docSnap.id, { ...docSnap.data(), ...updateData });
    });
  }

  /**
   * Elimina una persona
   */
  async delete(uid: string, id: string): Promise<boolean> {
    return await runTransaction(db, async (t) => {
      const docRef = doc(db, `users/${uid}/${FIRESTORE_COLLECTIONS.PEOPLE}/${id}`);
      const docSnap = await t.get(docRef);
      if (!docSnap.exists()) return false;
      t.delete(docRef);
      return true;
    });
  }
}
