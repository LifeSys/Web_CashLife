import { collection, doc, getDocs, query, orderBy, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { Subscription } from '@/types';
import { BaseRepository } from './base.repository';
import { FIRESTORE_COLLECTIONS } from '@/firebase/constants';

export class SubscriptionRepository extends BaseRepository {
  async getAll(uid: string): Promise<Subscription[]> {
    const q = query(collection(db, `users/${uid}/${FIRESTORE_COLLECTIONS.SUBSCRIPTIONS}`), orderBy('fechaVencimiento', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ ...this.convertTimestampsToDate(doc.data() as Subscription), id: doc.id } as Subscription));
  }

  async create(uid: string, subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<Subscription> {
    const docRef = doc(collection(db, `users/${uid}/${FIRESTORE_COLLECTIONS.SUBSCRIPTIONS}`));
    const subscriptionData = this.createAuditedData(subscription, uid);
    await runTransaction(db, async (t) => t.set(docRef, subscriptionData));
    return { id: docRef.id, ...this.convertTimestampsToDate(subscriptionData) };
  }
}
