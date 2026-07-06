import { ReactNode } from 'react';
import { Send, Download, LogOut } from 'lucide-react';

interface AccountCardProps {
  bankName: string;
  accountType: string;
  balance: number;
  currency: string;
  icon: ReactNode;
  gradient: string;
  lastMovement?: string;
  onClick?: () => void;
  onTransfer?: () => void;
  onDeposit?: () => void;
  onWithdraw?: () => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);

export function AccountCard({
  bankName,
  accountType,
  balance,
  currency,
  icon,
  gradient,
  lastMovement,
  onClick,
  onTransfer,
  onDeposit,
  onWithdraw,
}: AccountCardProps) {
  return (
    <div
      onClick={onClick}
      className={`${gradient} rounded-2xl p-6 text-white cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-102`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-sm opacity-80 font-semibold">{bankName}</p>
          <p className="text-xs opacity-70 mt-1">{accountType}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>

      {/* Balance */}
      <div className="mb-6">
        <p className="text-xs opacity-70 mb-1">Saldo disponible</p>
        <p className="text-4xl font-bold">{formatCurrency(balance)}</p>
      </div>

      {/* Last Movement */}
      {lastMovement && <p className="text-xs opacity-70 mb-6">{lastMovement}</p>}

      {/* Actions */}
      <div className="flex gap-2">
        {onTransfer && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTransfer();
            }}
            className="flex-1 flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 rounded-lg py-2 text-sm font-semibold transition-colors"
          >
            <Send className="w-4 h-4" /> Transferir
          </button>
        )}
        {onDeposit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeposit();
            }}
            className="flex-1 flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 rounded-lg py-2 text-sm font-semibold transition-colors"
          >
            <Download className="w-4 h-4" /> Depositar
          </button>
        )}
        {onWithdraw && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onWithdraw();
            }}
            className="flex-1 flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 rounded-lg py-2 text-sm font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4" /> Retirar
          </button>
        )}
      </div>
    </div>
  );
}
