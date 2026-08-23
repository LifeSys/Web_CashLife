export interface PaginationOptions {
  limit?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  startAfter?: { id: string } | unknown;
}

export interface PaginatedResult<T> {
  items: T[];
  hasMore: boolean;
  lastCursor?: unknown;
}

export class BaseRepository {
  protected createAuditedData<T extends object>(data: T, uid: string) {
    return { ...data, createdBy: uid, updatedBy: uid };
  }

  protected updateAuditedData<T extends object>(data: T, uid: string) {
    return { ...data, updatedBy: uid };
  }
}
