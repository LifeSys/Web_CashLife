import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';
import { Transaction } from '@/types';
import { PaginatedResult, PaginationOptions } from './base.repository';

type TxClient = Prisma.TransactionClient;

function toTransaction(row: Record<string, unknown>): Transaction {
  return { ...(row as object), id: row.id as string } as Transaction;
}

const NON_BALANCE_ACCOUNTS = ['accounts-receivable', 'accounts-payable'];

/**
 * JS suma decimales en punto flotante (0.1 + 0.2 !== 0.3), así que cada
 * operación aritmética sobre saldos/montos acumulables se redondea a
 * centavos antes de guardarse. Sin esto, después de suficientes sumas y
 * restas los saldos "arrastran" errores de 1-3 céntimos que un sistema
 * financiero real jamás debería mostrar.
 */
function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Delta de saldo para una cuenta "normal" (no tarjeta, no transferencia)
 * según el tipo de movimiento. Antes esto se pasaba como función callback
 * desde transaction.service.ts, pero los argumentos de una Server Action
 * deben ser serializables (nada de funciones), así que ahora vive aquí,
 * calculado únicamente a partir de datos serializables de la transacción.
 */
// El tipo declarado oficialmente en TransactionType es 'card_payment', pero
// en algún punto se coló 'credit_card_payment' en la lógica de saldos —
// aceptamos ambos para no romper filas históricas que hayan quedado con
// cualquiera de los dos nombres.
const isCardPaymentTipo = (tipo: string) => tipo === 'card_payment' || tipo === 'credit_card_payment';

/**
 * Reembolso de un comercio abonado directamente a la tarjeta (ej. una
 * devolución de una compra). A diferencia de un pago, reduce la deuda de
 * la tarjeta pero NO sale dinero de ninguna cuenta — el dinero nunca pasó
 * por una cuenta del usuario, solo se descontó del saldo que se debe.
 */
const isCardRefundTipo = (tipo: string) => tipo === 'credit_card_refund';

function calculateBalanceDelta(tipo: string, monto: number): number {
  switch (tipo) {
    case 'expense':
    case 'payable_payment':
    case 'scheduled_payment':
    case 'transfer':
    case 'loan':
    case 'card_payment':
    case 'credit_card_payment':
      return -monto;
    case 'income':
    case 'loan_payment':
    case 'receivable_payment':
      return monto;
    case 'credit_card_charge':
    default:
      return 0;
  }
}

export class TransactionRepository {
  /**
   * Obtiene todas las transacciones del usuario (no eliminadas)
   */
  async getAll(uid: string, options?: PaginationOptions): Promise<PaginatedResult<Transaction>> {
    const pageSize = options?.limit || 20;
    const orderField = options?.orderBy || 'createdAt';
    const orderDirection = options?.orderDirection || 'desc';
    const cursor = options?.startAfter as { id: string } | undefined;

    // Orden real de llegada: `fecha` es editable por el usuario y, según
    // por dónde se creó la transacción, a veces trae hora exacta
    // (new Date() al pagar una tarjeta) y a veces queda en medianoche
    // (un formulario que solo pide el día) — dos movimientos del MISMO día
    // calendario casi nunca terminan con `fecha` idéntica, así que un
    // desempate por createdAt sobre `fecha` casi nunca llegaba a activarse:
    // esa diferencia accidental de hora decidía el orden en vez del orden
    // real en que se registraron. `createdAt` sí es siempre el momento
    // real de creación (con resolución de milisegundos, puesto por la
    // base de datos), así que ahora es el criterio principal — arriba
    // siempre el último movimiento que se registró, sin importar la fecha
    // que se le haya puesto.
    const orderBy: Prisma.TransactionOrderByWithRelationInput[] =
      orderField === 'createdAt'
        ? [{ createdAt: orderDirection }, { fecha: orderDirection }]
        : [{ [orderField]: orderDirection }, { createdAt: orderDirection }];

    const rows = await prisma.transaction.findMany({
      where: { userId: uid, isDeleted: false },
      orderBy,
      take: pageSize + 1,
      ...(cursor?.id ? { cursor: { id: cursor.id }, skip: 1 } : {}),
    });

    const hasMore = rows.length > pageSize;
    const items = rows.slice(0, pageSize).map(toTransaction);

    return {
      items,
      hasMore,
      lastCursor: hasMore ? { id: items[items.length - 1].id } : undefined,
    };
  }

  /**
   * Obtiene transacción por ID
   */
  async getById(uid: string, id: string): Promise<Transaction | null> {
    const row = await prisma.transaction.findFirst({ where: { id, userId: uid } });
    return row ? toTransaction(row) : null;
  }

  /**
   * Obtiene transacciones por rango de fechas
   */
  async getByDateRange(uid: string, startDate: Date, endDate: Date): Promise<Transaction[]> {
    const rows = await prisma.transaction.findMany({
      where: { userId: uid, isDeleted: false, fecha: { gte: startDate, lte: endDate } },
      orderBy: [{ fecha: 'desc' }, { createdAt: 'desc' }],
    });
    return rows.map(toTransaction);
  }

  /**
   * Obtiene transacciones por cuenta
   */
  async getByAccount(uid: string, accountId: string): Promise<Transaction[]> {
    const rows = await prisma.transaction.findMany({
      where: { userId: uid, isDeleted: false, cuenta: accountId },
      orderBy: [{ createdAt: 'desc' }, { fecha: 'desc' }],
    });
    return rows.map(toTransaction);
  }

  /**
   * Obtiene transacciones por categoría
   */
  async getByCategory(uid: string, categoryId: string): Promise<Transaction[]> {
    const rows = await prisma.transaction.findMany({
      where: { userId: uid, isDeleted: false, categoria: categoryId },
      orderBy: [{ createdAt: 'desc' }, { fecha: 'desc' }],
    });
    return rows.map(toTransaction);
  }

  /**
   * Obtiene transacciones por persona
   */
  async getByPerson(uid: string, personId: string): Promise<Transaction[]> {
    const rows = await prisma.transaction.findMany({
      where: { userId: uid, isDeleted: false, persona: personId },
      orderBy: [{ createdAt: 'desc' }, { fecha: 'desc' }],
    });
    return rows.map(toTransaction);
  }

  /**
   * Obtiene el total de transacciones por tipo
   */
  async getTotalByType(uid: string, type: string): Promise<number> {
    const result = await prisma.transaction.aggregate({
      where: { userId: uid, isDeleted: false, tipo: type },
      _sum: { monto: true },
    });
    return result._sum.monto ?? 0;
  }

  /**
   * OPERACIÓN ATÓMICA: Crear transacción y actualizar saldo de cuenta.
   * Si ocurre un error, TODO se revierte (transacción SQL real).
   */
  async create(
    uid: string,
    transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'isDeleted'>
  ): Promise<Transaction> {
    return prisma.$transaction(async (t) => {
      await this.applyBalanceChange(t, uid, transaction);

      const created = await t.transaction.create({
        data: {
          ...(transaction as Record<string, unknown>),
          fecha: new Date(transaction.fecha as unknown as string | Date),
          userId: uid,
          isDeleted: false,
          createdBy: uid,
          updatedBy: uid,
        } as Prisma.TransactionUncheckedCreateInput,
      });

      return toTransaction(created);
    });
  }

  private async applyBalanceChange(
    t: TxClient,
    uid: string,
    transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'isDeleted'>
  ) {
    if (transaction.tipo === 'transfer' && transaction.destinationAccountId) {
      const source = await t.account.findFirst({ where: { id: transaction.cuenta, userId: uid } });
      const destination = await t.account.findFirst({ where: { id: transaction.destinationAccountId, userId: uid } });
      if (!source) throw new Error(`Cuenta origen ${transaction.cuenta} no encontrada`);
      if (!destination) throw new Error(`Cuenta destino ${transaction.destinationAccountId} no encontrada`);
      const sourceSaldo = source.saldo ?? source.balance ?? 0;
      const destinationSaldo = destination.saldo ?? destination.balance ?? 0;
      const nextSourceSaldo = roundMoney(sourceSaldo - transaction.monto);
      const nextDestinationSaldo = roundMoney(destinationSaldo + transaction.monto);
      await t.account.update({ where: { id: source.id }, data: { saldo: nextSourceSaldo, balance: nextSourceSaldo, updatedBy: uid } });
      await t.account.update({ where: { id: destination.id }, data: { saldo: nextDestinationSaldo, balance: nextDestinationSaldo, updatedBy: uid } });
    } else if (transaction.creditCardId) {
      const card = await t.creditCard.findFirst({ where: { id: transaction.creditCardId, userId: uid } });
      if (!card) throw new Error(`Tarjeta ${transaction.creditCardId} no encontrada`);
      const currentUsed = card.usedAmount ?? card.montoUtilizado ?? 0;
      const reducesDebt = isCardPaymentTipo(transaction.tipo) || isCardRefundTipo(transaction.tipo);
      const nextUsed = roundMoney(
        reducesDebt
          ? Math.max(currentUsed - transaction.monto, 0)
          : currentUsed + transaction.monto
      );
      const limit = card.creditLimit ?? card.lineaCredito ?? 0;
      await t.creditCard.update({ where: { id: card.id }, data: { usedAmount: nextUsed, montoUtilizado: nextUsed, availableAmount: roundMoney(limit - nextUsed), updatedBy: uid } });
      // El reembolso NO mueve dinero de ninguna cuenta — solo el pago sí.
      if (isCardPaymentTipo(transaction.tipo) && transaction.cuenta) {
        const account = await t.account.findFirst({ where: { id: transaction.cuenta, userId: uid } });
        if (!account) throw new Error(`Cuenta ${transaction.cuenta} no encontrada`);
        const currentSaldo = account.saldo ?? account.balance ?? 0;
        const nextSaldo = roundMoney(currentSaldo - transaction.monto);
        await t.account.update({ where: { id: account.id }, data: { saldo: nextSaldo, balance: nextSaldo, updatedBy: uid } });
      }
    } else if (transaction.cuenta && !NON_BALANCE_ACCOUNTS.includes(transaction.cuenta)) {
      const account = await t.account.findFirst({ where: { id: transaction.cuenta, userId: uid } });
      if (!account) throw new Error(`Cuenta ${transaction.cuenta} no encontrada`);
      const newSaldo = roundMoney(account.saldo + calculateBalanceDelta(transaction.tipo, transaction.monto));
      await t.account.update({ where: { id: account.id }, data: { saldo: newSaldo, balance: newSaldo, updatedBy: uid } });
    }
  }

  /**
   * Actualiza una transacción (no afecta saldos, es solo metadata)
   */
  async update(uid: string, id: string, data: Partial<Transaction>): Promise<Transaction | null> {
    const existing = await prisma.transaction.findFirst({ where: { id, userId: uid } });
    if (!existing) return null;
    const { id: _id, userId: _uid, createdAt: _ca, createdBy: _cb, ...rest } = data as Record<string, unknown>;
    const updated = await prisma.transaction.update({
      where: { id },
      data: { ...rest, updatedBy: uid } as Prisma.TransactionUncheckedUpdateInput,
    });
    return toTransaction(updated);
  }

  /**
   * OPERACIÓN ATÓMICA: Soft delete de transacción (revertir saldo)
   */
  async delete(uid: string, id: string): Promise<boolean> {
    return prisma.$transaction(async (t) => {
      const tx = await t.transaction.findFirst({ where: { id, userId: uid } });
      if (!tx || tx.isDeleted) return false;

      if (tx.tipo === 'transfer' && tx.destinationAccountId) {
        const source = await t.account.findFirst({ where: { id: tx.cuenta ?? undefined, userId: uid } });
        const destination = await t.account.findFirst({ where: { id: tx.destinationAccountId, userId: uid } });
        if (!source || !destination) throw new Error('Cuenta de transferencia no encontrada');
        const sourceSaldo = source.saldo ?? source.balance ?? 0;
        const destinationSaldo = destination.saldo ?? destination.balance ?? 0;
        const nextSourceSaldo = roundMoney(sourceSaldo + tx.monto);
        const nextDestinationSaldo = roundMoney(destinationSaldo - tx.monto);
        await t.account.update({ where: { id: source.id }, data: { saldo: nextSourceSaldo, balance: nextSourceSaldo, updatedBy: uid } });
        await t.account.update({ where: { id: destination.id }, data: { saldo: nextDestinationSaldo, balance: nextDestinationSaldo, updatedBy: uid } });
      } else if (tx.creditCardId) {
        const card = await t.creditCard.findFirst({ where: { id: tx.creditCardId, userId: uid } });
        if (!card) throw new Error('Tarjeta no encontrada');
        const currentUsed = card.usedAmount ?? card.montoUtilizado ?? 0;
        const reducedDebt = isCardPaymentTipo(tx.tipo) || isCardRefundTipo(tx.tipo);
        const nextUsed = roundMoney(reducedDebt ? currentUsed + tx.monto : Math.max(currentUsed - tx.monto, 0));
        const limit = card.creditLimit ?? card.lineaCredito ?? 0;
        await t.creditCard.update({ where: { id: card.id }, data: { usedAmount: nextUsed, montoUtilizado: nextUsed, availableAmount: roundMoney(limit - nextUsed), updatedBy: uid } });
        if (isCardPaymentTipo(tx.tipo) && tx.cuenta) {
          const account = await t.account.findFirst({ where: { id: tx.cuenta, userId: uid } });
          if (!account) throw new Error('Cuenta no encontrada');
          const currentSaldo = account.saldo ?? account.balance ?? 0;
          const nextSaldo = roundMoney(currentSaldo + tx.monto);
          await t.account.update({ where: { id: account.id }, data: { saldo: nextSaldo, balance: nextSaldo, updatedBy: uid } });
        }
      } else if (tx.cuenta && !NON_BALANCE_ACCOUNTS.includes(tx.cuenta)) {
        const account = await t.account.findFirst({ where: { id: tx.cuenta, userId: uid } });
        if (!account) throw new Error('Cuenta no encontrada');
        const currentSaldo = account.saldo ?? account.balance ?? 0;
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
        revertedSaldo = roundMoney(revertedSaldo);
        await t.account.update({ where: { id: account.id }, data: { saldo: revertedSaldo, balance: revertedSaldo, updatedBy: uid } });
      }

      await t.transaction.update({
        where: { id },
        data: { isDeleted: true, deletedAt: new Date(), deletedBy: uid, updatedBy: uid },
      });
      return true;
    });
  }
}
