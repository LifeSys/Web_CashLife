import { ArrowDownRight, ArrowUpLeft, Send } from 'lucide-react';
import type { Transaction } from '@/types';

interface MovementCardProps {
  transaction: Transaction;
  categoryName?: string;
  accountName?: string;
  personName?: string;
}

export function MovementCard({
  transaction,
  categoryName = 'Categoría',
  accountName = 'Cuenta',
  personName,
}: MovementCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value);
  };

  const getIcon = () => {
    if (transaction.tipo === 'GASTO') {
      return <ArrowDownRight className="w-5 h-5 text-red-500" />;
    }
    if (transaction.tipo === 'INGRESO') {
      return <ArrowUpLeft className="w-5 h-5 text-green-500" />;
    }
    return <Send className="w-5 h-5 text-blue-500" />;
  };

  const getAmountColor = () => {
    if (transaction.tipo === 'GASTO') return 'text-red-500';
    if (transaction.tipo === 'INGRESO') return 'text-green-500';
    return 'text-foreground';
  };

  const getAmountPrefix = () => {
    if (transaction.tipo === 'GASTO') return '-';
    if (transaction.tipo === 'INGRESO') return '+';
    return '';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-PE', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3 flex-1">
        <div className="p-2 bg-muted rounded-full">{getIcon()}</div>
        <div className="flex-1">
          <p className="font-medium">{transaction.descripcion}</p>
          <p className="text-xs text-muted-foreground">{categoryName}</p>
        </div>
      </div>
      <div className="flex items-end gap-3">
        <div className="text-right">
          <p className={`font-bold ${getAmountColor()}`}>
            {getAmountPrefix()}{formatCurrency(transaction.monto)}
          </p>
          <p className="text-xs text-muted-foreground">{formatDate(transaction.fecha)}</p>
        </div>
      </div>
    </div>
  );
}
