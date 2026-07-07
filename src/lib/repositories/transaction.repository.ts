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
    const collectionPath = `users/${uid}/${FIRESTORE_COLLECTIONS.TRANSACTIONS}`;

    let q = query(
      collection(db, collectionPath),
      where('isDeleted', '==', false),
      orderBy(options?.orderBy || 'fecha', options?.orderDirection || 'desc'),
      limit(pageSize + 1)
    );

    if (options?.startAfter) {
      q = query(
        collection(db, collectionPath),
        where('isDeleted', '==', false),
        orderBy(options?.orderBy || 'fecha', options?.orderDirection || 'desc'),
        startAfter(options.startAfter),
        limit(pageSize + 1)
      );
    }

    const snapshot = await getDocs(q);
    
    const hasMore = snapshot.docs.length > pageSize;
    const docs = snapshot.docs.slice(0, pageSize);

    const items = docs.map((doc) => (this.withDocId<Transaction>(doc.id, doc.data())));

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
    return this.withDocId<Transaction>(docSnap.id, docSnap.data());
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
    return snapshot.docs.map((doc) => (this.withDocId<Transaction>(doc.id, doc.data())));
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
    return snapshot.docs.map((doc) => (this.withDocId<Transaction>(doc.id, doc.data())));
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
    return snapshot.docs.map((doc) => (this.withDocId<Transaction>(doc.id, doc.data())));
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
    return snapshot.docs.map((doc) => (this.withDocId<Transaction>(doc.id, doc.data())));
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
   * @param calculateNewBalance Función que calcula el nuevo saldo
   */
  async create(
    uid: string,
    transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'isDeleted'>,
    calculateNewBalance: (currentBalance: number) => number
  ): Promise<Transaction> {
    return await runTransaction(db, async (t) => {
      if (transaction.tipo === 'transfer' && transaction.destinationAccountId) {
        const sourceRef = doc(db, `users/${uid}/${FIRESTORE_COLLECTIONS.ACCOUNTS}/${transaction.cuenta}`);
        const destinationRef = doc(db, `users/${uid}/${FIRESTORE_COLLECTIONS.ACCOUNTS}/${transaction.destinationAccountId}`);
        const [sourceSnap, destinationSnap] = await Promise.all([t.get(sourceRef), t.get(destinationRef)]);
        if (!sourceSnap.exists()) throw new Error(`Cuenta origen ${transaction.cuenta} no encontrada`);
        if (!destinationSnap.exists()) throw new Error(`Cuenta destino ${transaction.destinationAccountId} no encontrada`);
        const sourceSaldo = (sourceSnap.data().saldo ?? sourceSnap.data().balance ?? 0) as number;
        const destinationSaldo = (destinationSnap.data().saldo ?? destinationSnap.data().balance ?? 0) as number;
        t.update(sourceRef, { saldo: sourceSaldo - transaction.monto, balance: sourceSaldo - transaction.monto, updatedAt: Timestamp.now(), updatedBy: uid });
        t.update(destinationRef, { saldo: destinationSaldo + transaction.monto, balance: destinationSaldo + transaction.monto, updatedAt: Timestamp.now(), updatedBy: uid });
      } else if (transaction.creditCardId) {
        const cardRef = doc(db, `users/${uid}/${FIRESTORE_COLLECTIONS.CREDIT_CARDS}/${transaction.creditCardId}`);
        const cardSnap = await t.get(cardRef);
        if (!cardSnap.exists()) throw new Error(`Tarjeta ${transaction.creditCardId} no encontrada`);
        const data = cardSnap.data();
        const currentUsed = (data.usedAmount ?? data.montoUtilizado ?? 0) as number;
        const nextUsed = transaction.tipo === 'credit_card_payment'
          ? Math.max(currentUsed - transaction.monto, 0)
          : currentUsed + transaction.monto;
        const limit = (data.creditLimit ?? data.lineaCredito ?? 0) as number;
        t.update(cardRef, { usedAmount: nextUsed, montoUtilizado: nextUsed, availableAmount: limit - nextUsed, updatedAt: Timestamp.now(), updatedBy: uid });
        if (transaction.tipo === 'credit_card_payment') {
          const accountRef = doc(db, `users/${uid}/${FIRESTORE_COLLECTIONS.ACCOUNTS}/${transaction.cuenta}`);
          const accountSnap = await t.get(accountRef);
          if (!accountSnap.exists()) throw new Error(`Cuenta ${transaction.cuenta} no encontrada`);
          const currentSaldo = (accountSnap.data().saldo ?? accountSnap.data().balance ?? 0) as number;
          t.update(accountRef, { saldo: currentSaldo - transaction.monto, balance: currentSaldo - transaction.monto, updatedAt: Timestamp.now(), updatedBy: uid });
        }
      } else if (transaction.cuenta && !['accounts-receivable', 'accounts-payable'].includes(transaction.cuenta)) {
        // 1. Obtener documento de cuenta real. Si el movimiento vino por billetera,
        // transaction.cuenta debe ser la cuenta bancaria vinculada, no la billetera.
        // No actualizar saldo para cuentas especiales (receivable_debt, payable_obligation)
        const accountRef = doc(db, `users/${uid}/${FIRESTORE_COLLECTIONS.ACCOUNTS}/${transaction.cuenta}`);
        const accountSnap = await t.get(accountRef);
        if (!accountSnap.exists()) {
          throw new Error(`Cuenta ${transaction.cuenta} no encontrada`);
        }

        const currentSaldo = accountSnap.data().saldo as number;
        const newSaldo = calculateNewBalance(currentSaldo);

        // 2. Actualizar saldo de cuenta
        t.update(accountRef, {
          saldo: newSaldo,
          balance: newSaldo,
          updatedAt: Timestamp.now(),
          updatedBy: uid,
        });
      }

      // 3. Crear documento de transacción
      const txRef = doc(collection(db, `users/${uid}/${FIRESTORE_COLLECTIONS.TRANSACTIONS}`));
      const txData = this.createAuditedData(
        {
          ...transaction,
          isDeleted: false,
        },
        uid
      );

      t.set(txRef, txData);

      // 4. Retornar transacción creada
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

      return this.withDocId<Transaction>(txSnap.id, { ...txSnap.data(), ...updateData });
    });
  }

  /**
   * OPERACIÓN ATÓMICA: Soft delete de transacción (revertir saldo)
   */
  async delete(uid: string, id: string): Promise<boolean> {
    return await runTransaction(db, async (t) => {
      const txRef = doc(db, `users/${uid}/${FIRESTORE_COLLECTIONS.TRANSACTIONS}/${id}`);
      const txSnap = await t.get(txRef);
      if (!txSnap.exists()) return false;
      const tx = txSnap.data() as Transaction;
      if (tx.isDeleted) return false;

      if (tx.tipo === 'transfer' && tx.destinationAccountId) {
        const sourceRef = doc(db, `users/${uid}/${FIRESTORE_COLLECTIONS.ACCOUNTS}/${tx.cuenta}`);
        const destinationRef = doc(db, `users/${uid}/${FIRESTORE_COLLECTIONS.ACCOUNTS}/${tx.destinationAccountId}`);
        const [sourceSnap, destinationSnap] = await Promise.all([t.get(sourceRef), t.get(destinationRef)]);
        if (!sourceSnap.exists() || !destinationSnap.exists()) throw new Error('Cuenta de transferencia no encontrada');
        const sourceSaldo = (sourceSnap.data().saldo ?? sourceSnap.data().balance ?? 0) as number;
        const destinationSaldo = (destinationSnap.data().saldo ?? destinationSnap.data().balance ?? 0) as number;
        t.update(sourceRef, { saldo: sourceSaldo + tx.monto, balance: sourceSaldo + tx.monto, updatedAt: Timestamp.now(), updatedBy: uid });
        t.update(destinationRef, { saldo: destinationSaldo - tx.monto, balance: destinationSaldo - tx.monto, updatedAt: Timestamp.now(), updatedBy: uid });
      } else if (tx.creditCardId) {
        const cardRef = doc(db, `users/${uid}/${FIRESTORE_COLLECTIONS.CREDIT_CARDS}/${tx.creditCardId}`);
        const cardSnap = await t.get(cardRef);
        if (!cardSnap.exists()) throw new Error('Tarjeta no encontrada');
        const data = cardSnap.data();
        const currentUsed = (data.usedAmount ?? data.montoUtilizado ?? 0) as number;
        const nextUsed = tx.tipo === 'credit_card_payment' ? currentUsed + tx.monto : Math.max(currentUsed - tx.monto, 0);
        const limit = (data.creditLimit ?? data.lineaCredito ?? 0) as number;
        t.update(cardRef, { usedAmount: nextUsed, montoUtilizado: nextUsed, availableAmount: limit - nextUsed, updatedAt: Timestamp.now(), updatedBy: uid });
        if (tx.tipo === 'credit_card_payment') {
          const accountRef = doc(db, `users/${uid}/${FIRESTORE_COLLECTIONS.ACCOUNTS}/${tx.cuenta}`);
          const accountSnap = await t.get(accountRef);
          if (!accountSnap.exists()) throw new Error('Cuenta no encontrada');
          const currentSaldo = (accountSnap.data().saldo ?? accountSnap.data().balance ?? 0) as number;
          t.update(accountRef, { saldo: currentSaldo + tx.monto, balance: currentSaldo + tx.monto, updatedAt: Timestamp.now(), updatedBy: uid });
        }
      } else {
        const accountRef = doc(db, `users/${uid}/${FIRESTORE_COLLECTIONS.ACCOUNTS}/${tx.cuenta}`);
        const accountSnap = await t.get(accountRef);
        if (!accountSnap.exists()) throw new Error('Cuenta no encontrada');
        const currentSaldo = (accountSnap.data().saldo ?? accountSnap.data().balance ?? 0) as number;
        let revertedSaldo = currentSaldo;
        switch (tx.tipo) {
          case 'expense':
          case 'loan':
          case 'payable_payment':
          case 'scheduled_payment':
            revertedSaldo = currentSaldo + tx.monto;
            break;
          case 'income':
          case 'loan_payment':
          case 'receivable_payment':
            revertedSaldo = currentSaldo - tx.monto;
            break;
        }
        t.update(accountRef, { saldo: revertedSaldo, balance: revertedSaldo, updatedAt: Timestamp.now(), updatedBy: uid });
      }

      t.update(txRef, { isDeleted: true, deletedAt: Timestamp.now(), deletedBy: uid, updatedAt: Timestamp.now(), updatedBy: uid });
      return true;
    });
  }
}
