'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  ChevronRight,
  Wallet,
  Users,
  CreditCard,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  Send,
  TrendingUp,
} from 'lucide-react';
import { useAccounts } from '@/hooks/useAccounts';
import { useAuth } from '@/providers/AuthProvider';
import { useCategories } from '@/hooks/useCategories';
import { useCreditCards } from '@/hooks/useCreditCards';
import { usePayableObligations, useReceivableDebts } from '@/hooks/useFinancial';
import { usePeople } from '@/hooks/usePeople';
import { financialEngine } from '@/services/financial-engine.service';

type OperationType =
  | 'expense'
  | 'income'
  | 'transfer'
  | 'loan_granted'
  | 'loan_received'
  | 'receivable'
  | 'payable'
  | 'credit_card_charge'
  | 'credit_card_payment'
  | 'collect_debt'
  | 'pay_debt';

type OperationCategory = 'money' | 'people' | 'banks' | 'bills' | null;

interface OperationConfig {
  type: OperationType;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  category: OperationCategory;
}

const operationConfigs: Record<OperationType, OperationConfig> = {
  expense: {
    type: 'expense',
    label: 'Gasto',
    description: 'Registra dinero que gastaste',
    icon: <ArrowDownLeft className="w-5 h-5" />,
    color: 'bg-red-500/10 text-red-600 border-red-200',
    category: 'money',
  },
  income: {
    type: 'income',
    label: 'Ingreso',
    description: 'Dinero que recibiste',
    icon: <ArrowUpRight className="w-5 h-5" />,
    color: 'bg-green-500/10 text-green-600 border-green-200',
    category: 'money',
  },
  transfer: {
    type: 'transfer',
    label: 'Transferencia',
    description: 'Mueve dinero entre tus cuentas',
    icon: <Send className="w-5 h-5" />,
    color: 'bg-blue-500/10 text-blue-600 border-blue-200',
    category: 'money',
  },
  receivable: {
    type: 'receivable',
    label: 'Dinero que alguien me debe',
    description: 'Crea una deuda que otra persona pagará después',
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'bg-blue-500/10 text-blue-600 border-blue-200',
    category: 'people',
  },
  payable: {
    type: 'payable',
    label: 'Dinero que debo',
    description: 'Registra dinero que debes pagar a alguien',
    icon: <Wallet className="w-5 h-5" />,
    color: 'bg-blue-500/10 text-blue-600 border-blue-200',
    category: 'people',
  },
  loan_granted: {
    type: 'loan_granted',
    label: 'Dinero que presté',
    description: 'Dinero que le prestaste a alguien',
    icon: <Send className="w-5 h-5" />,
    color: 'bg-blue-500/10 text-blue-600 border-blue-200',
    category: 'people',
  },
  loan_received: {
    type: 'loan_received',
    label: 'Dinero que pedí prestado',
    description: 'Dinero que pediste prestado a alguien',
    icon: <Wallet className="w-5 h-5" />,
    color: 'bg-blue-500/10 text-blue-600 border-blue-200',
    category: 'people',
  },
  collect_debt: {
    type: 'collect_debt',
    label: 'Recibir pago',
    description: 'Alguien te paga lo que le debía',
    icon: <ArrowUpRight className="w-5 h-5" />,
    color: 'bg-blue-500/10 text-blue-600 border-blue-200',
    category: 'people',
  },
  pay_debt: {
    type: 'pay_debt',
    label: 'Pagar a alguien',
    description: 'Pagas lo que le debías a alguien',
    icon: <ArrowDownLeft className="w-5 h-5" />,
    color: 'bg-blue-500/10 text-blue-600 border-blue-200',
    category: 'people',
  },
  credit_card_charge: {
    type: 'credit_card_charge',
    label: 'Compra con tarjeta',
    description: 'Registra una compra pagada con tarjeta de crédito',
    icon: <CreditCard className="w-5 h-5" />,
    color: 'bg-purple-500/10 text-purple-600 border-purple-200',
    category: 'banks',
  },
  credit_card_payment: {
    type: 'credit_card_payment',
    label: 'Pago de tarjeta',
    description: 'Paga la deuda de tu tarjeta de crédito',
    icon: <CreditCard className="w-5 h-5" />,
    color: 'bg-purple-500/10 text-purple-600 border-purple-200',
    category: 'banks',
  },
};

const categoryNames = {
  money: '💰 Dinero',
  people: '👤 Personas',
  banks: '🏦 Tarjetas & Bancos',
  bills: '📅 Facturas',
};

interface OperationModalProps {
  onClose: () => void;
}

export function OperationModal({ onClose }: OperationModalProps) {
  const { user } = useAuth();
  const { cuentas, mutate: mutateCuentas } = useAccounts();
  const { categorias } = useCategories();
  const { personas } = usePeople();
  const { creditCards, mutate: mutateCards } = useCreditCards();
  const { debts, mutate: mutateDebts } = useReceivableDebts();
  const { obligations, mutate: mutateObligations } = usePayableObligations();

  const [stage, setStage] = useState<'category' | 'operation' | 'form'>('category');
  const [selectedCategory, setSelectedCategory] = useState<OperationCategory>(null);
  const [selectedType, setSelectedType] = useState<OperationType | null>(null);
  const [formData, setFormData] = useState({
    monto: '',
    cuentaId: '',
    destinationAccountId: '',
    categoriaId: '',
    descripcion: '',
    personaId: '',
    creditCardId: '',
    debtId: '',
    obligationId: '',
    notas: '',
  });

  const montoRef = useRef<HTMLInputElement>(null);
  const cashAccounts = useMemo(
    () => cuentas.filter((cuenta) => cuenta.tipo !== 'credit_card'),
    [cuentas]
  );

  useEffect(() => {
    montoRef.current?.focus();
  }, [stage]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      cuentaId:
        prev.cuentaId || cashAccounts[0]?.id || '',
      categoriaId:
        prev.categoriaId || categorias[0]?.id || '',
      creditCardId:
        prev.creditCardId || creditCards[0]?.id || '',
      debtId:
        prev.debtId ||
        debts.find((d) => d.status !== 'paid')?.id ||
        '',
      obligationId:
        prev.obligationId ||
        obligations.find((o) => o.status !== 'paid')?.id ||
        '',
    }));
  }, [cashAccounts, categorias, creditCards, debts, obligations]);

  const operationsByCategory = useMemo(
    () =>
      (Object.entries(operationConfigs) as [OperationType, OperationConfig][])
        .filter(([_, config]) => config.category === selectedCategory)
        .map(([operationType, config]) => ({ ...config, type: operationType })),
    [selectedCategory]
  );

  const selectedConfig = selectedType ? operationConfigs[selectedType] : null;
  const selectedDebt = debts.find((d) => d.id === formData.debtId);
  const selectedObligation = obligations.find((o) => o.id === formData.obligationId);

  const refresh = () => {
    mutateCuentas();
    mutateCards();
    mutateDebts();
    mutateObligations();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) return;

    const amount = Number(formData.monto);
    if (!amount || amount <= 0 || !user?.uid)
      return toast.error('Ingresa un monto válido');
    if (
      !formData.cuentaId &&
      !['credit_card_charge', 'receivable', 'payable'].includes(selectedType)
    )
      return toast.error('Selecciona una cuenta');
    if (
      selectedType === 'transfer' &&
      !formData.destinationAccountId
    )
      return toast.error('Selecciona la cuenta destino');
    if (
      ['loan_granted', 'loan_received', 'receivable', 'payable'].includes(
        selectedType
      ) &&
      !formData.personaId
    )
      return toast.error('Selecciona un contacto');
    if (
      ['credit_card_charge', 'credit_card_payment'].includes(
        selectedType
      ) &&
      !formData.creditCardId
    )
      return toast.error('Selecciona una tarjeta');
    if (selectedType === 'collect_debt' && !selectedDebt)
      return toast.error('Selecciona una deuda por cobrar');
    if (selectedType === 'pay_debt' && !selectedObligation)
      return toast.error('Selecciona una deuda por pagar');

    try {
      const base = {
        monto: amount,
        descripcion: formData.descripcion || operationConfigs[selectedType].label,
        cuenta: formData.cuentaId,
        categoria: formData.categoriaId || undefined,
        persona: formData.personaId || undefined,
        personId: formData.personaId || undefined,
        contactId: formData.personaId || undefined,
        notas: formData.notas || undefined,
        fecha: new Date(),
      };

      if (selectedType === 'income')
        await financialEngine.createIncome(user.uid, base);
      if (selectedType === 'expense')
        await financialEngine.createExpense(user.uid, base);
      if (selectedType === 'transfer')
        await financialEngine.createTransfer(user.uid, {
          ...base,
          destinationAccountId: formData.destinationAccountId,
        });
      if (selectedType === 'loan_granted')
        await financialEngine.grantLoan(user.uid, {
          personId: formData.personaId,
          contactId: formData.personaId,
          description: formData.descripcion || 'Dinero que presté',
          amount,
          accountId: formData.cuentaId,
          date: new Date(),
          notes: formData.notas || undefined,
        });
      if (selectedType === 'loan_received')
        await financialEngine.receiveLoan(user.uid, {
          creditorName:
            personas.find((p) => p.id === formData.personaId)?.nombre ||
            'Acreedor',
          personId: formData.personaId,
          contactId: formData.personaId,
          description: formData.descripcion || 'Dinero que pedí prestado',
          amount,
          accountId: formData.cuentaId,
          date: new Date(),
          notes: formData.notas || undefined,
        });
      if (selectedType === 'receivable')
        await financialEngine.createReceivable(user.uid, {
          personId: formData.personaId,
          contactId: formData.personaId,
          description:
            formData.descripcion || 'Dinero que alguien me debe',
          amount,
          date: new Date(),
          notes: formData.notas || undefined,
        });
      if (selectedType === 'payable')
        await financialEngine.createPayable(user.uid, {
          creditorName:
            personas.find((p) => p.id === formData.personaId)?.nombre ||
            'Acreedor',
          personId: formData.personaId,
          contactId: formData.personaId,
          description: formData.descripcion || 'Dinero que debo',
          amount,
          date: new Date(),
          notes: formData.notas || undefined,
        });
      if (selectedType === 'credit_card_charge')
        await financialEngine.chargeCreditCard(user.uid, {
          ...base,
          cuenta: undefined,
          creditCardId: formData.creditCardId,
        });
      if (selectedType === 'credit_card_payment')
        await financialEngine.payCreditCard(user.uid, {
          ...base,
          creditCardId: formData.creditCardId,
        });
      if (selectedType === 'collect_debt' && selectedDebt)
        await financialEngine.collectReceivable(user.uid, {
          debtId: selectedDebt.id,
          personId: selectedDebt.personId,
          contactId: selectedDebt.contactId,
          amount,
          accountId: formData.cuentaId,
          date: new Date(),
          observations: formData.notas || undefined,
        });
      if (selectedType === 'pay_debt' && selectedObligation)
        await financialEngine.payObligation(user.uid, {
          obligationId: selectedObligation.id,
          personId: selectedObligation.personId,
          contactId: selectedObligation.contactId,
          amount,
          accountId: formData.cuentaId,
          date: new Date(),
          observations: formData.notas || undefined,
        });

      refresh();
      toast.success('Operación registrada correctamente');
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : 'Error al registrar operación'
      );
    }
  };

  return (
    <div className="w-full max-h-[90vh] overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-border p-4 md:p-6">
        {stage === 'category' && (
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            Nueva Operación
          </h2>
        )}
        {stage === 'operation' && (
          <button
            type="button"
            onClick={() => {
              setStage('category');
              setSelectedCategory(null);
            }}
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-3"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            Volver
          </button>
        )}
        {stage === 'form' && (
          <button
            type="button"
            onClick={() => {
              setStage('operation');
              setSelectedType(null);
            }}
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-3"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            Volver
          </button>
        )}
        {stage === 'form' && selectedConfig && (
          <h2 className="text-lg md:text-xl font-bold text-foreground">
            {selectedConfig.label}
          </h2>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 md:p-6 space-y-4">
        {/* Stage 1: Category Selection */}
        {stage === 'category' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(
              Object.entries(categoryNames) as [OperationCategory, string][]
            ).map(([cat, name]) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat as OperationCategory);
                  setStage('operation');
                }}
                className="group p-4 rounded-lg border-2 border-border hover:border-primary bg-card hover:bg-primary/5 transition-all duration-200 text-left"
              >
                <div className="text-2xl mb-2">{name.split(' ')[0]}</div>
                <div className="text-sm font-medium text-foreground">
                  {name.substring(2)}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Stage 2: Operation Selection */}
        {stage === 'operation' && selectedCategory && (
          <div className="grid grid-cols-1 gap-2">
            {operationsByCategory.map((op) => (
              <button
                key={op.type}
                type="button"
                onClick={() => {
                  setSelectedType(op.type);
                  setStage('form');
                }}
                className={`p-4 rounded-lg border-2 border-dashed transition-all duration-200 text-left hover:border-solid ${op.color} group`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">{op.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {op.label}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {op.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Stage 3: Form */}
        {stage === 'form' && selectedType && selectedConfig && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Monto
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  S/
                </span>
                <input
                  ref={montoRef}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.monto}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, monto: e.target.value }))
                  }
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-card text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
            </div>

            {/* Account Selection (if applicable) */}
            {!['credit_card_charge', 'receivable', 'payable'].includes(
              selectedType
            ) && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {selectedType === 'collect_debt'
                    ? 'Cuenta destino'
                    : 'Cuenta origen'}
                </label>
                <select
                  value={formData.cuentaId}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, cuentaId: e.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                >
                  <option value="">Selecciona una cuenta</option>
                  {cashAccounts.map((cuenta) => (
                    <option key={cuenta.id} value={cuenta.id}>
                      {cuenta.nombre} · S/{cuenta.saldo ?? cuenta.balance ?? 0}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Destination Account (Transfer only) */}
            {selectedType === 'transfer' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Cuenta destino
                </label>
                <select
                  value={formData.destinationAccountId}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      destinationAccountId: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                >
                  <option value="">Selecciona cuenta destino</option>
                  {cashAccounts
                    .filter((c) => c.id !== formData.cuentaId)
                    .map((cuenta) => (
                      <option key={cuenta.id} value={cuenta.id}>
                        {cuenta.nombre}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* Credit Card Selection */}
            {['credit_card_charge', 'credit_card_payment'].includes(
              selectedType
            ) && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tarjeta de crédito
                </label>
                <select
                  value={formData.creditCardId}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      creditCardId: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                >
                  <option value="">Selecciona una tarjeta</option>
                  {creditCards.map((card) => (
                    <option key={card.id} value={card.id}>
                      {card.nombre ?? card.name} · usado S/
                      {card.usedAmount ?? card.montoUtilizado ?? 0}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Debt Selection (collect_debt only) */}
            {selectedType === 'collect_debt' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Deuda a cobrar
                </label>
                <select
                  value={formData.debtId}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      debtId: e.target.value,
                      monto: String(
                        debts.find((d) => d.id === e.target.value)
                          ?.pendingBalance ?? p.monto
                      ),
                    }))
                  }
                  className="w-full px-4 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                >
                  <option value="">Selecciona deuda</option>
                  {debts
                    .filter((d) => d.status !== 'paid')
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.description} · pendiente S/{d.pendingBalance}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* Obligation Selection (pay_debt only) */}
            {selectedType === 'pay_debt' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Deuda a pagar
                </label>
                <select
                  value={formData.obligationId}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      obligationId: e.target.value,
                      monto: String(
                        obligations.find((o) => o.id === e.target.value)
                          ?.pendingBalance ?? p.monto
                      ),
                    }))
                  }
                  className="w-full px-4 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                >
                  <option value="">Selecciona deuda</option>
                  {obligations
                    .filter((o) => o.status !== 'paid')
                    .map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.description} · pendiente S/{o.pendingBalance}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* Person Selection */}
            {[
              'loan_granted',
              'loan_received',
              'receivable',
              'payable',
              'credit_card_charge',
            ].includes(selectedType) && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Contacto
                </label>
                <select
                  value={formData.personaId}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, personaId: e.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                >
                  <option value="">Selecciona un contacto</option>
                  {personas.map((persona) => (
                    <option key={persona.id} value={persona.id}>
                      {persona.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Category Selection (expenses/income) */}
            {['expense', 'income'].includes(selectedType) && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Categoría
                </label>
                <select
                  value={formData.categoriaId}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, categoriaId: e.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Selecciona categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Descripción
              </label>
              <input
                type="text"
                placeholder="Ej: Compra en supermercado"
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, descripcion: e.target.value }))
                }
                className="w-full px-4 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Notas adicionales
              </label>
              <textarea
                placeholder="Agrega notas si lo necesitas..."
                value={formData.notas}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, notas: e.target.value }))
                }
                rows={2}
                className="w-full px-4 py-3 rounded-lg border border-border bg-card resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Info Message */}
            {selectedType === 'credit_card_charge' && (
              <div className="p-3 bg-purple-500/10 border border-purple-200 rounded-lg text-sm text-purple-700">
                ✓ Esta compra aumentará el balance de tu tarjeta seleccionada
              </div>
            )}
            {selectedType === 'receivable' && (
              <div className="p-3 bg-blue-500/10 border border-blue-200 rounded-lg text-sm text-blue-700">
                ✓ Esta deuda quedará registrada hasta que la persona te pague
              </div>
            )}
            {selectedType === 'payable' && (
              <div className="p-3 bg-blue-500/10 border border-blue-200 rounded-lg text-sm text-blue-700">
                ✓ Registra todo lo que debes pagar a esta persona
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-lg bg-muted text-foreground font-semibold hover:bg-muted/80 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors active:scale-95"
              >
                Guardar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
