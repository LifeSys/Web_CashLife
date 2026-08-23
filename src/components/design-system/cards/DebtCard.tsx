import { PremiumCard } from './PremiumCard';
import { ProgressBar } from '../feedback/ProgressBar';
import { Edit, Trash2, ClipboardList, Eye, MessageCircle, Repeat } from 'lucide-react';

interface DebtCardProps {
  personName: string;
  personAvatar?: string;
  description: string;
  createdDate: Date;
  dueDate?: Date;
  originalAmount: number;
  paidAmount: number;
  /** Moneda de la deuda (por defecto PEN) — cada deuda se muestra en la suya, sin convertir. */
  currency?: string;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  onRegisterPayment?: () => void;
  onViewDetail?: () => void;
  onEdit?: () => void;
  onWhatsApp?: () => void;
  onDelete?: () => void;
  /** Fila angosta tipo lista (nombre + monto + acciones en un renglón) en vez de la tarjeta completa. */
  compact?: boolean;
  /** true si se generó sola al marcar un Pago Programado dividido como pagado. */
  fromScheduledPayment?: boolean;
}

const formatCurrency = (value: number, currency = 'PEN') =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency }).format(value);

const formatDate = (date?: Date) =>
  date ? new Intl.DateTimeFormat('es-PE', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(date)) : '-';

const getDaysOverdue = (dueDate?: Date) => {
  if (!dueDate) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diff = today.getTime() - due.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return { bg: 'bg-amber-500/10', text: 'text-amber-600', icon: '🟡' };
    case 'partial':
      return { bg: 'bg-blue-500/10', text: 'text-blue-600', icon: '🔵' };
    case 'paid':
      return { bg: 'bg-green-500/10', text: 'text-green-600', icon: '🟢' };
    case 'overdue':
      return { bg: 'bg-red-500/10', text: 'text-red-600', icon: '🔴' };
    default:
      return { bg: 'bg-gray-500/10', text: 'text-gray-600', icon: '⭕' };
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Pendiente';
    case 'partial':
      return 'Parcialmente Cobrado';
    case 'paid':
      return 'Cobrado';
    case 'overdue':
      return 'Vencido';
    default:
      return 'Desconocido';
  }
};

export function DebtCard({
  personName,
  personAvatar,
  description,
  createdDate,
  dueDate,
  originalAmount,
  paidAmount,
  currency = 'PEN',
  status,
  onRegisterPayment,
  onViewDetail,
  onEdit,
  onWhatsApp,
  onDelete,
  compact = false,
  fromScheduledPayment = false,
}: DebtCardProps) {
  const pendingAmount = originalAmount - paidAmount;
  const progressPercentage = (paidAmount / originalAmount) * 100;
  const statusColor = getStatusColor(status);
  const daysOverdue = getDaysOverdue(dueDate);
  const isOverdue = daysOverdue > 0;

  if (compact) {
    const actionButtonClass = 'p-2 rounded-lg transition-colors flex-shrink-0';
    return (
      <PremiumCard className={`!p-3 ${fromScheduledPayment ? 'border-l-4 !border-l-purple-500' : ''}`}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[140px]">
            <p className="font-bold text-sm truncate">{personName}</p>
            <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
              {fromScheduledPayment && <Repeat className="w-3 h-3 text-purple-500 flex-shrink-0" />}
              <span className="truncate">{description}</span>
            </p>
          </div>

          <div className="hidden sm:block text-xs text-muted-foreground whitespace-nowrap">
            {formatDate(createdDate)}
          </div>

          <div className={`${statusColor.bg} ${statusColor.text} px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 flex items-center gap-1`}>
            <span>{statusColor.icon}</span>
            <span className="hidden md:inline">{getStatusLabel(status)}</span>
          </div>

          <p className="text-sm font-bold text-amber-600 whitespace-nowrap flex-shrink-0 w-20 text-right">
            {formatCurrency(pendingAmount, currency)}
          </p>

          <div className="flex items-center gap-1 flex-shrink-0">
            {onRegisterPayment && (
              <button onClick={onRegisterPayment} title="Registrar cobro" className={`${actionButtonClass} bg-green-500/20 text-green-600 hover:bg-green-500/30`}>
                <ClipboardList className="w-4 h-4" />
              </button>
            )}
            {onViewDetail && (
              <button onClick={onViewDetail} title="Ver detalle" className={`${actionButtonClass} bg-blue-500/20 text-blue-600 hover:bg-blue-500/30`}>
                <Eye className="w-4 h-4" />
              </button>
            )}
            {onEdit && (
              <button onClick={onEdit} title="Editar" className={`${actionButtonClass} bg-muted text-muted-foreground hover:bg-muted/80`}>
                <Edit className="w-4 h-4" />
              </button>
            )}
            {onWhatsApp && (
              <button onClick={onWhatsApp} title="WhatsApp" className={`${actionButtonClass} bg-green-500/20 text-green-600 hover:bg-green-500/30`}>
                <MessageCircle className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button onClick={onDelete} title="Eliminar" className={`${actionButtonClass} bg-red-500/20 text-red-600 hover:bg-red-500/30`}>
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </PremiumCard>
    );
  }

  return (
    <PremiumCard className={fromScheduledPayment ? 'border-l-4 !border-l-purple-500' : ''}>
      {/* Row 1: Contact + Status Badge */}
      <div className="flex items-start justify-between gap-3 mb-3 pb-3 border-b border-border">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {personAvatar && <img src={personAvatar} alt={personName} className="w-12 h-12 rounded-full flex-shrink-0" />}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base truncate">{personName}</h3>
            <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
              {fromScheduledPayment && <Repeat className="w-3 h-3 text-purple-500 flex-shrink-0" />}
              <span className="truncate">{description}</span>
            </p>
          </div>
        </div>
        <div className={`${statusColor.bg} ${statusColor.text} px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 flex items-center gap-1`}>
          <span>{statusColor.icon}</span>
          <span>{getStatusLabel(status)}</span>
        </div>
      </div>

      {/* Row 2: Dates + Overdue Info */}
      <div className="flex justify-between items-start gap-3 mb-3 pb-3 border-b border-border text-xs">
        <div>
          <p className="text-muted-foreground">Creada</p>
          <p className="font-medium">{formatDate(createdDate)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Vencimiento</p>
          <p className="font-medium">{formatDate(dueDate)}</p>
        </div>
        {isOverdue && (
          <div className="text-right">
            <p className="text-muted-foreground">Vencido</p>
            <p className="font-medium text-red-600">Desde {daysOverdue} d</p>
          </div>
        )}
      </div>

      {/* Row 3: Amounts Grid (Original | Cobrado | Pendiente) */}
      <div className="grid grid-cols-3 gap-2 mb-3 pb-3 border-b border-border">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Original</p>
          <p className="text-sm font-bold truncate">{formatCurrency(originalAmount, currency)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Cobrado</p>
          <p className="text-sm font-bold text-green-600 truncate">{formatCurrency(paidAmount, currency)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Pendiente</p>
          <p className="text-sm font-bold text-amber-600 truncate">{formatCurrency(pendingAmount, currency)}</p>
        </div>
      </div>

      {/* Row 4: Progress Bar */}
      <div className="mb-4">
        <ProgressBar percentage={progressPercentage} showPercentage={true} />
      </div>

      {/* Row 5: Actions */}
      <div className="flex flex-wrap gap-2 justify-between">
        {onRegisterPayment && (
          <button
            onClick={onRegisterPayment}
            className="flex items-center gap-1 text-xs font-semibold bg-green-500/20 text-green-600 px-3 py-2 rounded-lg hover:bg-green-500/30 transition-colors"
            title="Registrar cobro"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cobro</span>
          </button>
        )}
        {onViewDetail && (
          <button
            onClick={onViewDetail}
            className="flex items-center gap-1 text-xs font-semibold bg-blue-500/20 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-500/30 transition-colors"
            title="Ver detalle"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Detalle</span>
          </button>
        )}
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center gap-1 text-xs font-semibold bg-muted text-muted-foreground px-3 py-2 rounded-lg hover:bg-muted/80 transition-colors"
            title="Editar"
          >
            <Edit className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Editar</span>
          </button>
        )}
        {onWhatsApp && (
          <button
            onClick={onWhatsApp}
            className="flex items-center gap-1 text-xs font-semibold bg-green-500/20 text-green-600 px-3 py-2 rounded-lg hover:bg-green-500/30 transition-colors"
            title="WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="flex items-center gap-1 text-xs font-semibold bg-red-500/20 text-red-600 px-3 py-2 rounded-lg hover:bg-red-500/30 transition-colors"
            title="Eliminar"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Eliminar</span>
          </button>
        )}
      </div>
    </PremiumCard>
  );
}
