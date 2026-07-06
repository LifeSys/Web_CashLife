import { ReactNode } from 'react';
import { PremiumCard } from './PremiumCard';
import { ProgressBar } from '../feedback/ProgressBar';
import { StatusBadge } from '../feedback/StatusBadge';
import { Edit, Trash2, CheckCircle2, ClipboardList, History } from 'lucide-react';

interface DebtCardProps {
  personName: string;
  personAvatar?: string;
  description: string;
  originalAmount: number;
  paidAmount: number;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  onRegisterPayment?: () => void;
  onMarkPaid?: () => void;
  onEdit?: () => void;
  onHistory?: () => void;
  onDelete?: () => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);

export function DebtCard({
  personName,
  personAvatar,
  description,
  originalAmount,
  paidAmount,
  status,
  onRegisterPayment,
  onMarkPaid,
  onEdit,
  onHistory,
  onDelete,
}: DebtCardProps) {
  const pendingAmount = originalAmount - paidAmount;
  const progressPercentage = (paidAmount / originalAmount) * 100;

  return (
    <PremiumCard>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
        {personAvatar && <img src={personAvatar} alt={personName} className="w-10 h-10 rounded-full" />}
        <div className="flex-1">
          <h3 className="font-bold text-base">{personName}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Amounts */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <p className="text-xs text-muted-foreground">Original</p>
          <p className="text-sm font-bold">{formatCurrency(originalAmount)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Pagado</p>
          <p className="text-sm font-bold text-green-500">{formatCurrency(paidAmount)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Pendiente</p>
          <p className="text-sm font-bold text-amber-500">{formatCurrency(pendingAmount)}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <ProgressBar percentage={progressPercentage} showPercentage={false} />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {onRegisterPayment && (
          <button
            onClick={onRegisterPayment}
            className="flex items-center gap-2 text-xs font-semibold bg-green-500/20 text-green-600 px-3 py-2 rounded-lg hover:bg-green-500/30 transition-colors"
          >
            <ClipboardList className="w-3 h-3" /> Registrar
          </button>
        )}
        {onMarkPaid && (
          <button
            onClick={onMarkPaid}
            className="flex items-center gap-2 text-xs font-semibold bg-primary/20 text-primary px-3 py-2 rounded-lg hover:bg-primary/30 transition-colors"
          >
            <CheckCircle2 className="w-3 h-3" /> Marcar
          </button>
        )}
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center gap-2 text-xs font-semibold bg-muted text-muted-foreground px-3 py-2 rounded-lg hover:bg-muted/80 transition-colors"
          >
            <Edit className="w-3 h-3" /> Editar
          </button>
        )}
        {onHistory && (
          <button
            onClick={onHistory}
            className="flex items-center gap-2 text-xs font-semibold bg-muted text-muted-foreground px-3 py-2 rounded-lg hover:bg-muted/80 transition-colors"
          >
            <History className="w-3 h-3" /> Historial
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="flex items-center gap-2 text-xs font-semibold bg-red-500/20 text-red-600 px-3 py-2 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            <Trash2 className="w-3 h-3" /> Eliminar
          </button>
        )}
      </div>
    </PremiumCard>
  );
}
