import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  orderBy,
  runTransaction,
  Timestamp,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { Account } from '@/types';
import { BaseRepository } from './base.repository';
import { FIRESTORE_COLLECTIONS } from '@/firebase/constants';

export class AccountRepository extends BaseRepository {
  /**
   * Obtiene todas las cuentas del usuario
   */
  async getAll(uid: string): Promise<Account[]> {
    const q = query(
      collection(db, `users/${uid}/${FIRESTORE_COLLECTIONS.ACCOUNTS}`),
      orderBy('nombre', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => (this.withDocId<Account>(doc.id, doc.data())));
  }

  /**
   * Obtiene cuenta por ID
   */
  async getById(uid: string, id: string): Promise<Account | null> {
    const docRef = doc(db, `users/${uid}/${FIRESTORE_COLLECTIONS.ACCOUNTS}/${id}`);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return this.withDocId<Account>(docSnap.id, docSnap.data());
  }

  /**
   * Crea una nueva cuenta
   */
  async create(
    uid: string,
    account: Omit<Account, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>
  ): Promise<Account> {
    const docRef = doc(collection(db, `users/${uid}/${FIRESTORE_COLLECTIONS.ACCOUNTS}`));
    const accountData = this.createAuditedData(account, uid);
    await runTransaction(db, async (t) => {
      t.set(docRef, accountData);
    });
    return {
      id: docRef.id,
      ...this.convertTimestampsToDate(accountData),
    };
  }

  /**
   * Actualiza una cuenta
   */
  async update(
    uid: string,
    id: string,
    data: Partial<Account>
  ): Promise<Account | null> {
    return await runTransaction(db, async (t) => {
      const docRef = doc(db, `users/${uid}/${FIRESTORE_COLLECTIONS.ACCOUNTS}/${id}`);
      const docSnap = await t.get(docRef);
      if (!docSnap.exists()) return null;

      const updateData = this.updateAuditedData(data, uid);
      t.update(docRef, updateData);

      return this.withDocId<Account>(docSnap.id, { ...docSnap.data(), ...updateData });
    });
  }

  /**
   * Elimina una cuenta
   */
  async delete(uid: string, id: string): Promise<void> {
    const docRef = doc(db, `users/${uid}/${FIRESTORE_COLLECTIONS.ACCOUNTS}/${id}`);
    await deleteDoc(docRef);
  }

  /**
   * Obtiene el saldo total de todas las cuentas
   */
  async getTotalBalance(uid: string): Promise<number> {
    const accounts = await this.getAll(uid);
    return accounts.reduce((total, account) => total + account.saldo, 0);
  }
}
