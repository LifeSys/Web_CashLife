import { ArrowDownRight, ArrowUpLeft, CreditCard, Send } from 'lucide-react';
import type { FireDate, Transaction } from '@/types';
import { getTransactionTypeLabel } from '@/lib/transaction-labels';

interface MovementCardProps { transaction: Transaction; categoryName?: string; accountName?: string; personName?: string; }
const toDate = (date: FireDate) => date instanceof Date ? date : date.toDate();

// Mismas categorías usadas en useCalculations.ts para que "Movimientos" y
// los totales del Dashboard/Reportes coincidan visualmente con lo que
// realmente suma o resta cada tipo de movimiento.
const INCOME_TYPES = ['income', 'ingreso', 'loan_payment', 'receivable_payment', 'receivable_paid'];
const EXPENSE_TYPES = ['expense', 'gasto', 'loan', 'credit_card_charge', 'card_purchase', 'payable_payment', 'payable_paid', 'scheduled_payment', 'card_payment', 'credit_card_payment'];

export function MovementCard({ transaction, categoryName = 'Sin categoría', personName }: MovementCardProps) {
  const formatCurrency = (value: number) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value || 0);
  const isIncome = INCOME_TYPES.includes(transaction.tipo);
  const isExpense = EXPENSE_TYPES.includes(transaction.tipo);
  const icon = transaction.tipo.includes('credit_card') || transaction.tipo === 'card_payment' || transaction.tipo === 'card_purchase' ? <CreditCard className="w-5 h-5 text-purple-500" /> : isIncome ? <ArrowUpLeft className="w-5 h-5 text-green-500" /> : isExpense ? <ArrowDownRight className="w-5 h-5 text-red-500" /> : <Send className="w-5 h-5 text-blue-500" />;
  const color = isIncome ? 'text-green-500' : isExpense ? 'text-red-500' : 'text-foreground';
  const prefix = isIncome ? '+' : isExpense ? '-' : '';
  const date = toDate(transaction.fecha);
  // `fecha` es la fecha del movimiento (editable, a veces sin hora real si
  // se cargó desde un formulario que solo pide el día) — para saber A QUÉ
  // HORA quedó registrado de verdad (y así poder verificar el orden a
  // simple vista cuando varios movimientos caen el mismo día) se muestra
  // aparte la hora de `createdAt`, que siempre la pone la base de datos al
  // crearlo y nunca es editable.
  const registeredAt = transaction.createdAt ? toDate(transaction.createdAt) : null;
  return (
    <div className="flex items-center justify-between gap-2 p-4 border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="p-2 bg-muted rounded-full flex-shrink-0">{icon}</div>
        <div className="min-w-0">
          <p className="font-medium truncate">{transaction.descripcion}</p>
          <p className="text-xs text-muted-foreground truncate">
            {getTransactionTypeLabel(transaction.tipo)}
            {personName ? ` · ${personName}` : ''}
          </p>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={`font-bold whitespace-nowrap ${color}`}>{prefix}{formatCurrency(transaction.monto)}</p>
        <p className="text-xs text-muted-foreground whitespace-nowrap">
          {new Intl.DateTimeFormat('es-PE', { month: 'short', day: 'numeric' }).format(date)}
          {registeredAt && ` · ${new Intl.DateTimeFormat('es-PE', { hour: 'numeric', minute: '2-digit' }).format(registeredAt)}`}
        </p>
      </div>
    </div>
  );
}
