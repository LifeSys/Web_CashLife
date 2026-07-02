import { Eye, EyeOff } from 'lucide-react';

interface BalanceCardProps {
  saldo: number;
  showBalance?: boolean;
  onToggleVisibility?: () => void;
}

export function BalanceCard({
  saldo,
  showBalance = true,
  onToggleVisibility,
}: BalanceCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value);
  };

  return (
    <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Saldo Total</p>
          <h2 className="text-4xl font-bold text-primary text-pretty">
            {showBalance ? formatCurrency(saldo) : '••••••'}
          </h2>
        </div>
        {onToggleVisibility && (
          <button
            onClick={onToggleVisibility}
            className="p-3 bg-primary/10 rounded-full hover:bg-primary/20 transition-colors"
          >
            {showBalance ? (
              <Eye className="w-5 h-5 text-primary" />
            ) : (
              <EyeOff className="w-5 h-5 text-primary" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
