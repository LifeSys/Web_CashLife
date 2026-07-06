import { collection, doc, getDocs, query, orderBy, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { CreditCard } from '@/types';
import { BaseRepository } from './base.repository';
import { FIRESTORE_COLLECTIONS } from '@/firebase/constants';

export class CreditCardRepository extends BaseRepository {
  async getAll(uid: string): Promise<CreditCard[]> {
    const q = query(collection(db, `users/${uid}/${FIRESTORE_COLLECTIONS.CREDIT_CARDS}`), orderBy('nombre', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => (this.withDocId<CreditCard>(doc.id, doc.data())));
  }

  async create(uid: string, card: Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<CreditCard> {
    const docRef = doc(collection(db, `users/${uid}/${FIRESTORE_COLLECTIONS.CREDIT_CARDS}`));
    const cardData = this.createAuditedData(card, uid);
    await runTransaction(db, async (t) => t.set(docRef, cardData));
    return { id: docRef.id, ...this.convertTimestampsToDate(cardData) };
  }
}
