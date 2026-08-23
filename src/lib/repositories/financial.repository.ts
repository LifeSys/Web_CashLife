import { BaseRepository } from './base.repository';

type AuditedEntity = { id: string; createdAt?: unknown; updatedAt?: unknown; createdBy?: string; updatedBy?: string };

/**
 * Cualquier delegate de Prisma (prisma.receivableDebt, prisma.incomeRecord, ...)
 * comparte esta forma mínima, suficiente para el CRUD genérico de abajo.
 */
export interface PrismaDelegate {
  findMany(args: unknown): Promise<Record<string, unknown>[]>;
  findFirst(args: unknown): Promise<Record<string, unknown> | null>;
  create(args: unknown): Promise<Record<string, unknown>>;
  update(args: unknown): Promise<Record<string, unknown>>;
}

/**
 * Repositorio genérico para entidades "users/{uid}/coleccion" reutilizado
 * por ReceivableDebt, ReceivablePayment, PayableObligation, PayablePayment,
 * ScheduledPayment e IncomeRecord.
 */
export class FinancialRepository<T extends AuditedEntity> extends BaseRepository {
  constructor(
    private readonly delegate: PrismaDelegate,
    private readonly defaultOrderBy = 'createdAt'
  ) {
    super();
  }

  async getAll(uid: string): Promise<T[]> {
    const rows = await this.delegate.findMany({ where: { userId: uid }, orderBy: { [this.defaultOrderBy]: 'desc' } });
    return rows as T[];
  }

  async getByField(uid: string, field: string, value: string): Promise<T[]> {
    const rows = await this.delegate.findMany({
      where: { userId: uid, [field]: value },
      orderBy: { [this.defaultOrderBy]: 'desc' },
    });
    return rows as T[];
  }

  async getById(uid: string, id: string): Promise<T | null> {
    const row = await this.delegate.findFirst({ where: { id, userId: uid } });
    return (row as T) ?? null;
  }

  async create(uid: string, data: Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<T> {
    const row = await this.delegate.create({
      data: { ...(data as Record<string, unknown>), userId: uid, createdBy: uid, updatedBy: uid },
    });
    return row as T;
  }

  async update(uid: string, id: string, data: Partial<T>): Promise<T | null> {
    const existing = await this.delegate.findFirst({ where: { id, userId: uid } });
    if (!existing) return null;
    const { id: _id, userId: _uid, createdAt: _ca, createdBy: _cb, ...rest } = data as Record<string, unknown>;
    const row = await this.delegate.update({ where: { id }, data: { ...rest, updatedBy: uid } });
    return row as T;
  }
}
