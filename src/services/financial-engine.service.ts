import { Transaction } from '@/types';
import { transactionService } from './transaction.service';
import { receivableService, payableService, scheduledPaymentService } from './financial.service';
import { EventoFinanciero, EventoFinancieroTipo } from '@/types/EventTypes';
import { eventLogger } from './event-logger.service';

export type TransactionInput = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'isDeleted'>;

class FinancialEngineService {
  async createIncome(uid: string, input: Omit<TransactionInput, 'tipo'>) {
    return transactionService.create(uid, { ...input, tipo: 'income' });
  }

  async createExpense(uid: string, input: Omit<TransactionInput, 'tipo'>) {
    return transactionService.create(uid, { ...input, tipo: 'expense' });
  }

  async createTransfer(uid: string, input: Omit<TransactionInput, 'tipo'> & { destinationAccountId: string }) {
    return transactionService.create(uid, { ...input, tipo: 'transfer' });
  }

  async grantLoan(uid: string, input: { personId: string; contactId?: string; description: string; amount: number; accountId: string; date: Date; dueDate?: Date; notes?: string }) {
    const debt = await receivableService.createDebt(uid, {
      personId: input.personId,
      contactId: input.contactId ?? input.personId,
      description: input.description,
      date: input.date,
      dueDate: input.dueDate,
      originalAmount: input.amount,
      notes: input.notes,
    });
    await transactionService.create(uid, {
      monto: input.amount,
      tipo: 'loan',
      descripcion: `Préstamo otorgado: ${input.description}`,
      fecha: input.date,
      cuenta: input.accountId,
      persona: input.personId,
      personId: input.personId,
      contactId: input.contactId ?? input.personId,
      relatedDebtId: debt.id,
      notas: input.notes,
    });
    return debt;
  }

  async receiveLoan(uid: string, input: { creditorName: string; creditorType?: 'person' | 'bank' | 'company' | 'sunat' | 'other'; contactId?: string; personId?: string; description: string; amount: number; accountId: string; date: Date; dueDate?: Date; notes?: string }) {
    const obligation = await payableService.createObligation(uid, {
      creditorName: input.creditorName,
      creditorType: input.creditorType ?? 'person',
      contactId: input.contactId,
      personId: input.personId,
      description: input.description,
      date: input.date,
      dueDate: input.dueDate ?? input.date,
      originalAmount: input.amount,
      notes: input.notes,
    });
    await transactionService.create(uid, {
      monto: input.amount,
      tipo: 'income',
      descripcion: `Préstamo recibido: ${input.description}`,
      fecha: input.date,
      cuenta: input.accountId,
      persona: input.personId,
      personId: input.personId,
      contactId: input.contactId ?? input.personId,
      relatedObligationId: obligation.id,
      notas: input.notes,
      isLoanTransaction: true,
    });
    return obligation;
  }

  /**
   * Create receivable debt AND generate transaction
   */
  async createReceivableDebt(uid: string, input: { personId: string; contactId?: string; description: string; amount: number; date: Date; dueDate?: Date; notes?: string }) {
    const debt = await receivableService.createDebt(uid, { personId: input.personId, contactId: input.contactId ?? input.personId, description: input.description, date: input.date, dueDate: input.dueDate, originalAmount: input.amount, notes: input.notes });
    // Create transaction for receivable debt registration
    await transactionService.create(uid, {
      monto: input.amount,
      tipo: 'receivable_debt',
      descripcion: `Cuenta por cobrar: ${input.description}`,
      fecha: input.date,
      cuenta: 'accounts-receivable', // Special account type for receivables
      persona: input.personId,
      personId: input.personId,
      contactId: input.contactId ?? input.personId,
      relatedDebtId: debt.id,
      notas: input.notes,
    });
    return debt;
  }

  /**
   * Create payable obligation AND generate transaction
   */
  async createPayableObligation(uid: string, input: { creditorName: string; creditorType?: 'person' | 'bank' | 'company' | 'sunat' | 'other'; contactId?: string; personId?: string; description: string; amount: number; date: Date; dueDate?: Date; notes?: string }) {
    const obligation = await payableService.createObligation(uid, { creditorName: input.creditorName, creditorType: input.creditorType ?? 'person', contactId: input.contactId, personId: input.personId, description: input.description, date: input.date, dueDate: input.dueDate ?? input.date, originalAmount: input.amount, notes: input.notes });
    // Create transaction for payable obligation registration
    await transactionService.create(uid, {
      monto: input.amount,
      tipo: 'payable_obligation',
      descripcion: `Cuenta por pagar: ${input.description}`,
      fecha: input.date,
      cuenta: 'accounts-payable', // Special account type for payables
      persona: input.personId,
      personId: input.personId,
      contactId: input.contactId,
      relatedObligationId: obligation.id,
      notas: input.notes,
    });
    return obligation;
  }

  /**
   * Legacy aliases for backward compatibility
   */
  createReceivable(uid: string, input: { personId: string; contactId?: string; description: string; amount: number; date: Date; dueDate?: Date; notes?: string }) {
    return this.createReceivableDebt(uid, input);
  }

  createPayable(uid: string, input: { creditorName: string; creditorType?: 'person' | 'bank' | 'company' | 'sunat' | 'other'; contactId?: string; personId?: string; description: string; amount: number; date: Date; dueDate?: Date; notes?: string }) {
    return this.createPayableObligation(uid, input);
  }

  collectReceivable(uid: string, input: { debtId: string; personId: string; contactId?: string; amount: number; accountId: string; date: Date; observations?: string }) {
    return receivableService.registerPayment(uid, input);
  }

  payObligation(uid: string, input: { obligationId: string; contactId?: string; personId?: string; amount: number; accountId: string; date: Date; observations?: string }) {
    return payableService.registerPayment(uid, input);
  }

  async chargeCreditCard(uid: string, input: Omit<TransactionInput, 'tipo' | 'cuenta'> & { creditCardId: string; cuenta?: string }) {
    return transactionService.create(uid, { ...input, cuenta: input.cuenta ?? 'credit-card', tipo: 'credit_card_charge' });
  }

  async payCreditCard(uid: string, input: Omit<TransactionInput, 'tipo'> & { creditCardId: string }) {
    return transactionService.create(uid, { ...input, tipo: 'credit_card_payment' });
  }

  payScheduledPayment(uid: string, input: { paymentId: string; period: string; accountId: string; paidAt?: Date }) {
    return scheduledPaymentService.markPeriodAsPaid(uid, input.paymentId, input.period, input.accountId, input.paidAt ?? new Date());
  }

  /**
   * MÉTODO PRINCIPAL: Procesa cualquier evento financiero
   * Orquesta la creación de transacciones y obligaciones según el tipo de evento
   */
  async procesarEvento(uid: string, evento: EventoFinanciero) {
    const startTime = performance.now();
    try {
      switch (evento.tipo) {
        // MOVIMIENTO DE DINERO
        case EventoFinancieroTipo.GASTO:
          return await this.createExpense(uid, {
            monto: evento.monto,
            descripcion: evento.descripcion,
            fecha: evento.fecha,
            cuenta: evento.cuentaId,
            cuentaId: evento.cuentaId,
            categoriaId: evento.categoriaId,
            notas: evento.notas,
          });

        case EventoFinancieroTipo.INGRESO:
          return await this.createIncome(uid, {
            monto: evento.monto,
            descripcion: evento.descripcion,
            fecha: evento.fecha,
            cuenta: evento.cuentaId,
            cuentaId: evento.cuentaId,
            categoriaId: evento.categoriaId,
            notas: evento.notas,
          });

        case EventoFinancieroTipo.TRANSFERENCIA:
          return await this.createTransfer(uid, {
            monto: evento.monto,
            descripcion: evento.descripcion,
            fecha: evento.fecha,
            cuenta: evento.cuentaOrigenId,
            cuentaId: evento.cuentaOrigenId,
            destinationAccountId: evento.cuentaDestinoId,
            notas: evento.notas,
          });

        // LÍNEAS DE CRÉDITO
        case EventoFinancieroTipo.CARGO_TARJETA:
          return await this.chargeCreditCard(uid, {
            monto: evento.monto,
            descripcion: evento.descripcion,
            fecha: evento.fecha,
            creditCardId: evento.tarjetaId,
            categoriaId: evento.categoriaId,
            notas: evento.notas,
          });

        case EventoFinancieroTipo.PAGO_TARJETA:
          return await this.payCreditCard(uid, {
            monto: evento.monto,
            descripcion: evento.descripcion,
            fecha: evento.fecha,
            cuenta: evento.cuentaId,
            cuentaId: evento.cuentaId,
            creditCardId: evento.tarjetaId,
            notas: evento.notas,
          });

        // PERSONAS Y OBLIGACIONES
        case EventoFinancieroTipo.PRESTAMO:
          return await this.grantLoan(uid, {
            personId: evento.personaId,
            description: evento.descripcion,
            amount: evento.monto,
            accountId: evento.cuentaId,
            date: evento.fecha,
            dueDate: evento.fechaVencimiento,
            notes: evento.notas,
          });

        case EventoFinancieroTipo.DEUDA_RECIBIDA:
          return await this.receiveLoan(uid, {
            creditorName: evento.descripcion,
            personId: evento.personaId,
            description: evento.descripcion,
            amount: evento.monto,
            accountId: evento.cuentaId,
            date: evento.fecha,
            dueDate: evento.fechaVencimiento,
            notes: evento.notas,
          });

        case EventoFinancieroTipo.COBRANZA:
          return await this.collectReceivable(uid, {
            debtId: evento.deudaId,
            personId: evento.personaId,
            amount: evento.monto,
            accountId: evento.cuentaId,
            date: evento.fecha,
            observations: evento.notas,
          });

        case EventoFinancieroTipo.PAGO:
          return await this.payObligation(uid, {
            obligationId: evento.obligacionId,
            amount: evento.monto,
            accountId: evento.cuentaId,
            date: evento.fecha,
            observations: evento.notas,
          });

        case EventoFinancieroTipo.OBLIGACION:
          return await this.createPayable(uid, {
            creditorName: evento.acreedor,
            creditorType: evento.tipoAcreedor,
            description: evento.descripcion,
            amount: evento.monto,
            date: evento.fecha,
            dueDate: evento.fechaVencimiento,
            notes: evento.notas,
          });

        case EventoFinancieroTipo.CUENTA_COBRAR:
          return await this.createReceivable(uid, {
            personId: evento.personaId,
            description: evento.descripcion,
            amount: evento.monto,
            date: evento.fecha,
            dueDate: evento.fechaVencimiento,
            notes: evento.notas,
          });

        // SUSCRIPCIONES Y PAGOS PROGRAMADOS
        case EventoFinancieroTipo.PAGO_PROGRAMADO:
          return await this.payScheduledPayment(uid, {
            paymentId: evento.suscripcionId,
            period: evento.periodoId,
            accountId: evento.cuentaId,
            paidAt: evento.fecha,
          });

        default:
          throw new Error(`Tipo de evento desconocido: ${(evento as any).tipo}`);
      }

      // Log exitoso
      const duracion = performance.now() - startTime;
      eventLogger.logEvento(uid, evento, true, duracion);
    } catch (error) {
      const duracion = performance.now() - startTime;
      const err = error instanceof Error ? error : new Error('Error desconocido');
      console.error('[FinancialEngine] Error procesando evento:', error);
      eventLogger.logEvento(uid, evento, false, duracion, err);
      throw error;
    }
  }
}

export const financialEngine = new FinancialEngineService();
