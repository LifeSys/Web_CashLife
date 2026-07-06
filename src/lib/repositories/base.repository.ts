import { Timestamp } from 'firebase/firestore';

export interface PaginationOptions {
  limit?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  startAfter?: unknown;
}

export interface PaginatedResult<T> {
  items: T[];
  hasMore: boolean;
  lastCursor?: unknown;
}

export class BaseRepository {
  protected convertTimestampsToDate<T>(data: T): T {
    const converted = { ...(data as Record<string, unknown>) };
    for (const key in converted) {
      const value = converted[key];
      if (value instanceof Timestamp) {
        converted[key] = value.toDate();
      }
    }
    return converted as T;
  }

  protected createAuditedData<T extends object>(data: T, uid: string) {
    return {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: uid,
      updatedBy: uid,
    };
  }

  protected updateAuditedData<T extends object>(data: T, uid: string) {
    return {
      ...data,
      updatedAt: Timestamp.now(),
      updatedBy: uid,
    };
  }

  protected withDocId<T>(id: string, data: object): T {
    const normalized = this.convertTimestampsToDate(data);
    return { ...(normalized as object), id } as T;
  }
}
