import { ArrowDownRight, ArrowUpLeft, CreditCard, Send } from 'lucide-react';
import type { FireDate, Transaction } from '@/types';

interface MovementCardProps { transaction: Transaction; categoryName?: string; accountName?: string; personName?: string; }
const toDate = (date: FireDate) => date instanceof Date ? date : date.toDate();

export function MovementCard({ transaction, categoryName = 'Sin categoría' }: MovementCardProps) {
  const formatCurrency = (value: number) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value || 0);
  const isIncome = ['income', 'loan_payment', 'receivable_payment'].includes(transaction.tipo);
  const isExpense = ['expense', 'loan', 'payable_payment', 'scheduled_payment', 'credit_card_payment'].includes(transaction.tipo);
  const icon = transaction.tipo.includes('credit_card') ? <CreditCard className="w-5 h-5 text-purple-500" /> : isIncome ? <ArrowUpLeft className="w-5 h-5 text-green-500" /> : isExpense ? <ArrowDownRight className="w-5 h-5 text-red-500" /> : <Send className="w-5 h-5 text-blue-500" />;
  const color = isIncome ? 'text-green-500' : isExpense ? 'text-red-500' : 'text-foreground';
  const prefix = isIncome ? '+' : isExpense ? '-' : '';
  const date = toDate(transaction.fecha);
  return (
    <div className="flex items-center justify-between p-4 border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3 flex-1"><div className="p-2 bg-muted rounded-full">{icon}</div><div className="flex-1"><p className="font-medium">{transaction.descripcion}</p><p className="text-xs text-muted-foreground">{categoryName} · {transaction.tipo}</p></div></div>
      <div className="text-right"><p className={`font-bold ${color}`}>{prefix}{formatCurrency(transaction.monto)}</p><p className="text-xs text-muted-foreground">{new Intl.DateTimeFormat('es-PE', { month: 'short', day: 'numeric' }).format(date)}</p></div>
    </div>
  );
}
