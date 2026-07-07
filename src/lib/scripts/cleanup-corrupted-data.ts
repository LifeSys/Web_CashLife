/**
 * Cleanup script to fix corrupted data in Firestore
 * Run this on existing user data during first login or manual trigger
 */
import { db } from '@/lib/firebase/firebase';
import { collection, getDocs, updateDoc, doc, writeBatch } from 'firebase/firestore';
import { cleanFirestoreData } from '@/lib/repositories/firestore-utils';
import { FIRESTORE_COLLECTIONS } from '@/firebase/constants';

export async function cleanupUserData(uid: string): Promise<{
  transactionsFixed: number;
  accountsFixed: number;
  categoriesFixed: number;
}> {
  let transactionsFixed = 0;
  let accountsFixed = 0;
  let categoriesFixed = 0;

  try {
    // 1. Clean transactions
    const txCollection = collection(db, `users/${uid}/${FIRESTORE_COLLECTIONS.TRANSACTIONS}`);
    const txSnapshot = await getDocs(txCollection);
    if (txSnapshot.size > 0) {
      const batch = writeBatch(db);
      txSnapshot.forEach((doc) => {
        const cleaned = cleanFirestoreData(doc.data());
        if (JSON.stringify(cleaned) !== JSON.stringify(doc.data())) {
          batch.update(doc.ref, cleaned);
          transactionsFixed++;
        }
      });
      if (transactionsFixed > 0) await batch.commit();
    }

    // 2. Clean accounts
    const accCollection = collection(db, `users/${uid}/${FIRESTORE_COLLECTIONS.ACCOUNTS}`);
    const accSnapshot = await getDocs(accCollection);
    if (accSnapshot.size > 0) {
      const batch = writeBatch(db);
      accSnapshot.forEach((doc) => {
        const cleaned = cleanFirestoreData(doc.data());
        if (JSON.stringify(cleaned) !== JSON.stringify(doc.data())) {
          batch.update(doc.ref, cleaned);
          accountsFixed++;
        }
      });
      if (accountsFixed > 0) await batch.commit();
    }

    // 3. Clean categories
    const catCollection = collection(db, `users/${uid}/${FIRESTORE_COLLECTIONS.CATEGORIES}`);
    const catSnapshot = await getDocs(catCollection);
    if (catSnapshot.size > 0) {
      const batch = writeBatch(db);
      catSnapshot.forEach((doc) => {
        const data = doc.data();
        // Ensure tipo is set correctly
        if (!data.tipo || !['expense', 'income'].includes(data.tipo)) {
          const cleaned = cleanFirestoreData({ ...data, tipo: data.tipo || 'expense' });
          batch.update(doc.ref, cleaned);
          categoriesFixed++;
        }
      });
      if (categoriesFixed > 0) await batch.commit();
    }

    console.log(`[Cleanup] Fixed: Transactions=${transactionsFixed}, Accounts=${accountsFixed}, Categories=${categoriesFixed}`);
    return { transactionsFixed, accountsFixed, categoriesFixed };
  } catch (error) {
    console.error('[Cleanup] Error during cleanup:', error);
    throw error;
  }
}
