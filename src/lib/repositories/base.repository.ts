import { Timestamp } from 'firebase/firestore';

export interface PaginationOptions {
  limit?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  startAfter?: any;
}

export interface PaginatedResult<T> {
  items: T[];
  hasMore: boolean;
  lastCursor?: any;
}

export class BaseRepository {
  /**
   * Convierte Timestamps de Firestore a Date
   */
  protected convertTimestampsToDate<T extends Record<string, any>>(data: T): T {
    const converted = { ...data };
    for (const key in converted) {
      if (converted[key] instanceof Timestamp) {
        (converted[key] as any) = (converted[key] as Timestamp).toDate();
      }
    }
    return converted;
  }

  /**
   * Convierte múltiples documentos
   */
  protected convertDocumentsToDate<T extends Record<string, any>>(
    items: T[]
  ): T[] {
    return items.map((item) => this.convertTimestampsToDate(item));
  }

  /**
   * Crea un registro con auditoría automática
   */
  protected createAuditedData<T extends Record<string, any>>(
    data: T,
    uid: string
  ): T & {
    createdAt: Timestamp;
    updatedAt: Timestamp;
    createdBy: string;
    updatedBy: string;
  } {
    return {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: uid,
      updatedBy: uid,
    };
  }

  /**
   * Actualiza auditoría de un registro
   */
  protected updateAuditedData<T extends Record<string, any>>(
    data: T,
    uid: string
  ): Partial<T> & {
    updatedAt: Timestamp;
    updatedBy: string;
  } {
    return {
      ...data,
      updatedAt: Timestamp.now(),
      updatedBy: uid,
    };
  }
}
