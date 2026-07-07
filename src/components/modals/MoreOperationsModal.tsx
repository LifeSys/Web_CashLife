'use client';

import { X, CreditCard, Handshake, TrendingDown, AlertCircle, Calendar } from 'lucide-react';

interface MoreOperationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreditCardCharge?: () => void;
  onCreditCardPayment?: () => void;
  onLoan?: () => void;
  onObligation?: () => void;
  onReceivable?: () => void;
  onScheduledPayment?: () => void;
}

export function MoreOperationsModal({
  isOpen,
  onClose,
  onCreditCardCharge,
  onCreditCardPayment,
  onLoan,
  onObligation,
  onReceivable,
  onScheduledPayment,
}: MoreOperationsModalProps) {
  if (!isOpen) return null;

  const operations = [
    {
      id: 'credit-charge',
      label: 'Cargo a Tarjeta',
      icon: <CreditCard className="w-6 h-6" />,
      color: 'bg-blue-500/10',
      textColor: 'text-blue-600',
      onClick: onCreditCardCharge,
    },
    {
      id: 'credit-payment',
      label: 'Pago de Tarjeta',
      icon: <CreditCard className="w-6 h-6" />,
      color: 'bg-green-500/10',
      textColor: 'text-green-600',
      onClick: onCreditCardPayment,
    },
    {
      id: 'loan',
      label: 'Préstamo',
      icon: <Handshake className="w-6 h-6" />,
      color: 'bg-purple-500/10',
      textColor: 'text-purple-600',
      onClick: onLoan,
    },
    {
      id: 'obligation',
      label: 'Obligación',
      icon: <AlertCircle className="w-6 h-6" />,
      color: 'bg-red-500/10',
      textColor: 'text-red-600',
      onClick: onObligation,
    },
    {
      id: 'receivable',
      label: 'Cuenta por Cobrar',
      icon: <TrendingDown className="w-6 h-6" />,
      color: 'bg-yellow-500/10',
      textColor: 'text-yellow-600',
      onClick: onReceivable,
    },
    {
      id: 'scheduled',
      label: 'Suscripción',
      icon: <Calendar className="w-6 h-6" />,
      color: 'bg-cyan-500/10',
      textColor: 'text-cyan-600',
      onClick: onScheduledPayment,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Más Operaciones</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {operations.map((op) => (
            <button
              key={op.id}
              onClick={() => {
                op.onClick?.();
                onClose();
              }}
              className={`${op.color} hover:opacity-80 ${op.textColor} p-4 rounded-lg transition-all flex flex-col items-center justify-center gap-2 font-medium text-sm`}
            >
              {op.icon}
              {op.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
