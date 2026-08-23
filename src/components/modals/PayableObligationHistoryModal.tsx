'use client';

import { useEffect, useState } from 'react';
import { X, ClipboardList } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { payableService } from '@/services/financial.service';
import { PayablePayment, PayableObligation } from '@/types';
import { ProgressBar } from '../design-system/feedback/ProgressBar';

interface PayableObligationHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  obligationId: string;
  obligation: PayableObligation;
  onRegisterPayment?: () => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);

const formatDate = (date?: Date | any) => {
  if (!date) return '-';
  const d = date.toDate ? date.toDate() : new Date(date);
  return new Intl.DateTimeFormat('es-PE', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d);
};

export function PayableObligationHistoryModal({
  isOpen,
  onClose,
  obligationId,
  obligation,
  onRegisterPayment,
}: PayableObligationHistoryModalProps) {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PayablePayment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !user?.uid || !obligationId) return;

    const loadPayments = async () => {
      setLoading(true);
      try {
        const data = await payableService.getPaymentsByObligation(user.uid, obligationId);
        setPayments(data);
      } catch (error) {
        console.error('[CashLife] Error loading payments:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, [isOpen, user?.uid, obligationId]);

  if (!isOpen) return null;

  const paidAmount = obligation.originalAmount - obligation.pendingBalance;
  const progressPercentage = (paidAmount / obligation.originalAmount) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 md:p-0">
      <div className="bg-card w-full max-w-2xl rounded-lg shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-4 md:p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">Detalle de la Obligación</h2>
            <p className="text-sm text-muted-foreground mt-1">{obligation?.creditorName}</p>
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
            <h3 className="font-semibold">Información de la Obligación</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Monto Original</p>
                <p className="font-bold text-base">{formatCurrency(obligation.originalAmount)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Pagado</p>
                <p className="font-bold text-base text-green-600">{formatCurrency(paidAmount)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Pendiente</p>
                <p className="font-bold text-base text-amber-600">{formatCurrency(obligation.pendingBalance)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Estado</p>
                <p className="font-bold text-base">
                  {obligation.pendingBalance === 0 && '✅ Pagado'}
                  {obligation.pendingBalance > 0 && obligation.pendingBalance < obligation.originalAmount && '🔵 Parcial'}
                  {obligation.pendingBalance === obligation.originalAmount && '🟡 Pendiente'}
                </p>
              </div>
            </div>

            <div>
              <ProgressBar percentage={progressPercentage} showPercentage={true} />
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3 text-sm">
            <h3 className="font-semibold">Detalles</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground">Concepto</p>
                <p className="font-medium">{obligation.description}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Acreedor</p>
                <p className="font-medium">{obligation.creditorName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Fecha</p>
                <p className="font-medium">{formatDate(obligation.date)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Vencimiento</p>
                <p className="font-medium">{formatDate(obligation.dueDate)}</p>
              </div>
              {obligation.notes && (
                <div className="col-span-2">
                  <p className="text-muted-foreground">Notas</p>
                  <p className="font-medium">{obligation.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment History */}
          <div className="space-y-3">
            <h3 className="font-semibold">Historial de Pagos</h3>
            {loading ? (
              <p className="text-muted-foreground text-sm">Cargando...</p>
            ) : payments.length > 0 ? (
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="text-left p-3">Fecha</th>
                      <th className="text-right p-3">Monto Pagado</th>
                      <th className="text-left p-3">Notas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                        <td className="p-3">{formatDate(payment.date)}</td>
                        <td className="text-right p-3 font-semibold text-green-600">{formatCurrency(payment.amount)}</td>
                        <td className="p-3 text-muted-foreground text-xs">{payment.observations || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm p-3 bg-muted/20 rounded-lg">Sin pagos registrados aún</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            {onRegisterPayment && obligation.pendingBalance > 0 && (
              <button
                onClick={() => {
                  onRegisterPayment();
                  onClose();
                }}
                className="flex items-center gap-2 bg-green-500/20 text-green-600 px-4 py-2 rounded-lg hover:bg-green-500/30 transition-colors font-medium"
              >
                <ClipboardList className="w-4 h-4" />
                Registrar Nuevo Pago
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
