'use client';

import { useEffect, useState } from 'react';
import { X, ClipboardList } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { receivableService } from '@/services/financial.service';
import { ReceivablePayment } from '@/types';
import { ProgressBar } from '../design-system/feedback/ProgressBar';

interface ReceivableDebtHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  debtId: string;
  debt: any;
  onRegisterPayment?: () => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);

const formatDate = (date?: Date | any) => {
  if (!date) return '-';
  const d = date.toDate ? date.toDate() : new Date(date);
  return new Intl.DateTimeFormat('es-PE', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d);
};

export function ReceivableDebtHistoryModal({
  isOpen,
  onClose,
  debtId,
  debt,
  onRegisterPayment,
}: ReceivableDebtHistoryModalProps) {
  const { user } = useAuth();
  const [payments, setPayments] = useState<ReceivablePayment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !user?.uid || !debtId) return;
    
    const loadPayments = async () => {
      setLoading(true);
      try {
        const data = await receivableService.getPaymentsByDebt(user.uid, debtId);
        setPayments(data);
      } catch (error) {
        console.error('[v0] Error loading payments:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, [isOpen, user?.uid, debtId]);

  if (!isOpen) return null;

  const pendingAmount = debt.originalAmount - debt.pendingBalance;
  const progressPercentage = (pendingAmount / debt.originalAmount) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 md:p-0">
      <div className="bg-card w-full max-w-2xl rounded-lg shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-4 md:p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">Detalle de Cobranza</h2>
            <p className="text-sm text-muted-foreground mt-1">{debt?.personName || debt?.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 space-y-6">
          {/* Summary Section */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-4">
            <h3 className="font-semibold">Información de la Deuda</h3>
            
            {/* Summary Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Monto Original</p>
                <p className="font-bold text-base">{formatCurrency(debt.originalAmount)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Cobrado</p>
                <p className="font-bold text-base text-green-600">{formatCurrency(pendingAmount)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Pendiente</p>
                <p className="font-bold text-base text-amber-600">{formatCurrency(debt.pendingBalance)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Estado</p>
                <p className="font-bold text-base">
                  {debt.pendingBalance === 0 && '✅ Cobrado'}
                  {debt.pendingBalance > 0 && debt.pendingBalance < debt.originalAmount && '🔵 Parcial'}
                  {debt.pendingBalance === debt.originalAmount && '🟡 Pendiente'}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <ProgressBar percentage={progressPercentage} showPercentage={true} />
            </div>
          </div>

          {/* Debt Details */}
          <div className="space-y-3 text-sm">
            <h3 className="font-semibold">Detalles</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground">Concepto</p>
                <p className="font-medium">{debt.description}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Fecha de Creación</p>
                <p className="font-medium">{formatDate(debt.date)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Fecha de Vencimiento</p>
                <p className="font-medium">{formatDate(debt.dueDate)}</p>
              </div>
              {debt.notes && (
                <div className="col-span-2">
                  <p className="text-muted-foreground">Notas</p>
                  <p className="font-medium">{debt.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment History */}
          <div className="space-y-3">
            <h3 className="font-semibold">Historial de Cobros</h3>
            {loading ? (
              <p className="text-muted-foreground text-sm">Cargando...</p>
            ) : payments.length > 0 ? (
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="text-left p-3">Fecha</th>
                      <th className="text-right p-3">Monto Cobrado</th>
                      <th className="text-right p-3">Saldo Restante</th>
                      <th className="text-left p-3">Notas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment, idx) => (
                      <tr key={payment.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                        <td className="p-3">{formatDate(payment.date)}</td>
                        <td className="text-right p-3 font-semibold text-green-600">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="text-right p-3 font-semibold text-amber-600">
                          {formatCurrency(Math.max(debt.pendingBalance + payment.amount - (payments.slice(0, idx).reduce((sum, p) => sum + p.amount, 0) + payment.amount), 0))}
                        </td>
                        <td className="p-3 text-muted-foreground text-xs">{payment.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm p-3 bg-muted/20 rounded-lg">Sin cobros registrados aún</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            {onRegisterPayment && debt.pendingBalance > 0 && (
              <button
                onClick={() => {
                  onRegisterPayment();
                  onClose();
                }}
                className="flex items-center gap-2 bg-green-500/20 text-green-600 px-4 py-2 rounded-lg hover:bg-green-500/30 transition-colors font-medium"
              >
                <ClipboardList className="w-4 h-4" />
                Registrar Nuevo Cobro
              </button>
            )}
            <button
              onClick={onClose}
              className="ml-auto bg-muted text-muted-foreground px-4 py-2 rounded-lg hover:bg-muted/80 transition-colors font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
