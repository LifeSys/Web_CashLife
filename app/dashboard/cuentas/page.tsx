'use client';

import { useAccounts } from '@/hooks/useAccounts';
import { Wallet } from 'lucide-react';

export default function CuentasPage() {
  const { cuentas } = useAccounts();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Mis Cuentas</h1>
        <p className="text-muted-foreground">Gestiona tus cuentas y saldos</p>
      </div>

      <div className="grid gap-4">
        {cuentas.map(cuenta => (
          <div
            key={cuenta.id}
            className="bg-card border border-border rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: cuenta.color + '20', color: cuenta.color }}
              >
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold">{cuenta.nombre}</h3>
                <p className="text-sm text-muted-foreground">Saldo disponible</p>
              </div>
            </div>
            <p className="text-lg font-bold">{formatCurrency(cuenta.saldo)}</p>
          </div>
        ))}
      </div>

      <div className="text-center pt-4">
        <p className="text-sm text-muted-foreground">
          Saldo total: {formatCurrency(cuentas.reduce((sum, c) => sum + c.saldo, 0))}
        </p>
      </div>
    </div>
  );
}
