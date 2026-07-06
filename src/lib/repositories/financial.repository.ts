import { collection, doc, getDoc, getDocs, orderBy, query, runTransaction, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { BaseRepository } from './base.repository';

type AuditedEntity = { id: string; createdAt: unknown; updatedAt: unknown; createdBy: string; updatedBy: string };

export class FinancialRepository<T extends AuditedEntity> extends BaseRepository {
  constructor(private readonly collectionName: string, private readonly defaultOrderBy = 'createdAt') {
    super();
  }

  private path(uid: string) {
    return `users/${uid}/${this.collectionName}`;
  }

  async getAll(uid: string): Promise<T[]> {
    const q = query(collection(db, this.path(uid)), orderBy(this.defaultOrderBy, 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((item) => ({ id: item.id, ...this.convertTimestampsToDate(item.data() as T) } as T));
  }

  async getByField(uid: string, field: string, value: string): Promise<T[]> {
    const q = query(collection(db, this.path(uid)), where(field, '==', value), orderBy(this.defaultOrderBy, 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((item) => ({ id: item.id, ...this.convertTimestampsToDate(item.data() as T) } as T));
  }

  async getById(uid: string, id: string): Promise<T | null> {
    const snap = await getDoc(doc(db, `${this.path(uid)}/${id}`));
    if (!snap.exists()) return null;
    return { id: snap.id, ...this.convertTimestampsToDate(snap.data() as T) } as T;
  }

  async create(uid: string, data: Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<T> {
    const ref = doc(collection(db, this.path(uid)));
    const audited = this.createAuditedData(data as Record<string, unknown>, uid);
    await runTransaction(db, async (t) => t.set(ref, audited));
    return { id: ref.id, ...this.convertTimestampsToDate(audited) } as T;
  }

  async update(uid: string, id: string, data: Partial<T>): Promise<T | null> {
    return runTransaction(db, async (t) => {
      const ref = doc(db, `${this.path(uid)}/${id}`);
      const snap = await t.get(ref);
      if (!snap.exists()) return null;
      const audited = this.updateAuditedData(data as Record<string, unknown>, uid);
      t.update(ref, audited);
      return { id: snap.id, ...this.convertTimestampsToDate({ ...snap.data(), ...audited } as T) } as T;
    });
  }
}
