import { collection, doc, getDocs, orderBy, query, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { FIRESTORE_COLLECTIONS } from '@/firebase/constants';
import type { Wallet } from '@/types';
import { BaseRepository } from './base.repository';

export class WalletRepository extends BaseRepository {
  async getAll(uid: string): Promise<Wallet[]> {
    const q = query(collection(db, `users/${uid}/${FIRESTORE_COLLECTIONS.WALLETS}`), orderBy('type', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ ...this.convertTimestampsToDate(doc.data() as Wallet), id: doc.id } as Wallet));
  }

  async create(uid: string, wallet: Omit<Wallet, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<Wallet> {
    const docRef = doc(collection(db, `users/${uid}/${FIRESTORE_COLLECTIONS.WALLETS}`));
    const walletData = this.createAuditedData(wallet, uid);
    await runTransaction(db, async (t) => t.set(docRef, walletData));
    return { id: docRef.id, ...this.convertTimestampsToDate(walletData) } as Wallet;
  }
}
