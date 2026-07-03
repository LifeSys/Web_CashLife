import {
  collection,
  doc,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  runTransaction,
  Timestamp,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { Transaction } from '@/types';
import { BaseRepository, PaginatedResult, PaginationOptions } from './base.repository';
import { FIRESTORE_COLLECTIONS } from '@/firebase/constants';

export class TransactionRepository extends BaseRepository {
  /**
   * Obtiene todas las transacciones del usuario (no eliminadas)
   */
  async getAll(
    uid: string,
    options?: PaginationOptions
  ): Promise<PaginatedResult<Transaction>> {
    const pageSize = options?.limit || 20;

    let q = query(
      collection(db, `users/${uid}/${FIRESTORE_COLLECTIONS.TRANSACTIONS}`),
      where('isDeleted', '==', false),
      orderBy(options?.orderBy || 'fecha', options?.orderDirection || 'desc'),
      limit(pageSize + 1)
    );

    if (options?.startAfter) {
      q = query(
        collection(db, `users/${uid}/${FIRESTORE_COLLECTIONS.TRANSACTIONS}`),
        where('isDeleted', '==', false),
        orderBy(options?.orderBy || 'fecha', options?.orderDirection || 'desc'),
        startAfter(options.startAfter),
        limit(pageSize + 1)
      );
    }

    const snapshot = await getDocs(q);
    const hasMore = snapshot.docs.length > pageSize;
    const docs = snapshot.docs.slice(0, pageSize);

    const items = docs.map((doc) => ({
      id: doc.id,
      ...this.convertTimestampsToDate(doc.data() as Transaction),
    } as Transaction));

    return {
      items,
      hasMore,
      lastCursor: hasMore ? docs[docs.length - 1] : undefined,
    };
  }

  /**
   * Obtiene transacción por ID
   */
  async getById(uid: string, id: string): Promise<Transaction | null> {
    const docRef = doc(db, `users/${uid}/${FIRESTORE_COLLECTIONS.TRANSACTIONS}/${id}`);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return {
      id: docSnap.id,
      ...this.convertTimestampsToDate(docSnap.data() as Transaction),
    };
  }

  /**
   * Obtiene transacciones por rango de fechas
   */
  async getByDateRange(
    uid: string,
    startDate: Date,
    endDate: Date
  ): Promise<Transaction[]> {
    const q = query(
      collection(db, `users/${uid}/${FIRESTORE_COLLECTIONS.TRANSACTIONS}`),
      where('isDeleted', '==', false),
      where('fecha', '>=', Timestamp.fromDate(startDate)),
      where('fecha', '<=', Timestamp.fromDate(endDate)),
      orderBy('fecha', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...this.convertTimestampsToDate(doc.data() as Transaction),
    }));
  }

  /**
   * Obtiene transacciones por cuenta
   */
  async getByAccount(uid: string, accountId: string): Promise<Transaction[]> {
    const q = query(
      collection(db, `users/${uid}/${FIRESTORE_COLLECTIONS.TRANSACTIONS}`),
      where('isDeleted', '==', false),
      where('cuenta', '==', accountId),
      orderBy('fecha', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...this.convertTimestampsToDate(doc.data() as Transaction),
    }));
  }

  /**
   * Obtiene transacciones por categoría
   */
  async getByCategory(uid: string, categoryId: string): Promise<Transaction[]> {
    const q = query(
      collection(db, `users/${uid}/${FIRESTORE_COLLECTIONS.TRANSACTIONS}`),
      where('isDeleted', '==', false),
      where('categoria', '==', categoryId),
      orderBy('fecha', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...this.convertTimestampsToDate(doc.data() as Transaction),
    }));
  }

  /**
   * Obtiene transacciones por persona
   */
  async getByPerson(uid: string, personId: string): Promise<Transaction[]> {
    const q = query(
      collection(db, `users/${uid}/${FIRESTORE_COLLECTIONS.TRANSACTIONS}`),
      where('isDeleted', '==', false),
      where('persona', '==', personId),
      orderBy('fecha', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...this.convertTimestampsToDate(doc.data() as Transaction),
    }));
  }

  /**
   * Obtiene el total de transacciones por tipo
   */
  async getTotalByType(uid: string, type: string): Promise<number> {
    const q = query(
      collection(db, `users/${uid}/${FIRESTORE_COLLECTIONS.TRANSACTIONS}`),
      where('isDeleted', '==', false),
      where('tipo', '==', type)
    );

    const snapshot = await getDocs(q);
    let total = 0;
    snapshot.docs.forEach((doc) => {
      const tx = doc.data() as Transaction;
      total += tx.monto;
    });
    return total;
  }

  /**
   * OPERACIÓN ATÓMICA: Crear transacción y actualizar saldo de cuenta
   * Si ocurre un error, TODO se revierte
   */
  async create(uid: string, transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'isDeleted'>): Promise<Transaction> {
    return await runTransaction(db, async (t) => {
      // 1. Obtener documento de cuenta
      const accountRef = doc(db, `users/${uid}/${FIRESTORE_COLLECTIONS.ACCOUNTS}/${transaction.cuenta}`);
      const accountSnap = await t.get(accountRef);
      if (!accountSnap.exists()) {
        throw new Error(`Cuenta ${transaction.cuenta} no encontrada`);
      }

      const currentSaldo = accountSnap.data().saldo as number;
      let newSaldo = currentSaldo;

      // 2. Calcular nuevo saldo según tipo de transacción
      switch (transaction.tipo) {
        case 'expense':
          newSaldo = currentSaldo - transaction.monto;
          break;
        case 'income':
          newSaldo = currentSaldo + transaction.monto;
          break;
        case 'transfer':
          newSaldo = currentSaldo - transaction.monto;
          break;
        case 'loan':
          newSaldo = currentSaldo - transaction.monto;
          break;
        case 'loan_payment':
          newSaldo = currentSaldo + transaction.monto;
          break;
      }

      // 3. Actualizar saldo de cuenta
      t.update(accountRef, {
        saldo: newSaldo,
        updatedAt: Timestamp.now(),
        updatedBy: uid,
      });

      // 4. Crear documento de transacción
      const txRef = doc(collection(db, `users/${uid}/${FIRESTORE_COLLECTIONS.TRANSACTIONS}`));
      const txData = this.createAuditedData(
        {
          ...transaction,
          isDeleted: false,
        },
        uid
      );

      t.set(txRef, txData);

      // 5. Retornar transacción creada
      return {
        id: txRef.id,
        ...this.convertTimestampsToDate(txData),
      } as Transaction;
    });
  }

  /**
   * Actualiza una transacción (no afecta saldos, es solo metadata)
   */
  async update(
    uid: string,
    id: string,
    data: Partial<Transaction>
  ): Promise<Transaction | null> {
    return await runTransaction(db, async (t) => {
      const txRef = doc(db, `users/${uid}/${FIRESTORE_COLLECTIONS.TRANSACTIONS}/${id}`);
      const txSnap = await t.get(txRef);
      if (!txSnap.exists()) return null;

      const updateData = this.updateAuditedData(data, uid);
      t.update(txRef, updateData);

      return {
        id: txSnap.id,
        ...this.convertTimestampsToDate({
          ...txSnap.data(),
          ...updateData,
        } as Transaction),
      };
    });
  }

  /**
   * OPERACIÓN ATÓMICA: Soft delete de transacción (revertir saldo)
   * Si ocurre un error, TODO se revierte
   */
  async delete(uid: string, id: string): Promise<boolean> {
    return await runTransaction(db, async (t) => {
      // 1. Obtener transacción
      const txRef = doc(db, `users/${uid}/${FIRESTORE_COLLECTIONS.TRANSACTIONS}/${id}`);
      const txSnap = await t.get(txRef);
      if (!txSnap.exists()) return false;

      const tx = txSnap.data() as Transaction;
      if (tx.isDeleted) return false; // Ya está eliminada

      // 2. Obtener cuenta y revertir saldo
      const accountRef = doc(db, `users/${uid}/${FIRESTORE_COLLECTIONS.ACCOUNTS}/${tx.cuenta}`);
      const accountSnap = await t.get(accountRef);
      if (!accountSnap.exists()) throw new Error('Cuenta no encontrada');

      const currentSaldo = accountSnap.data().saldo as number;
      let revertedSaldo = currentSaldo;

      // 3. Revertir saldo según tipo de transacción
      switch (tx.tipo) {
        case 'expense':
          revertedSaldo = currentSaldo + tx.monto; // Agregar lo que se restó
          break;
        case 'income':
          revertedSaldo = currentSaldo - tx.monto; // Restar lo que se sumó
          break;
        case 'transfer':
          revertedSaldo = currentSaldo + tx.monto;
          break;
        case 'loan':
          revertedSaldo = currentSaldo + tx.monto;
          break;
        case 'loan_payment':
          revertedSaldo = currentSaldo - tx.monto;
          break;
      }

      // 4. Actualizar saldo
      t.update(accountRef, {
        saldo: revertedSaldo,
        updatedAt: Timestamp.now(),
        updatedBy: uid,
      });

      // 5. Soft delete de transacción
      t.update(txRef, {
        isDeleted: true,
        deletedAt: Timestamp.now(),
        deletedBy: uid,
        updatedAt: Timestamp.now(),
        updatedBy: uid,
      });

      return true;
    });
  }
}
