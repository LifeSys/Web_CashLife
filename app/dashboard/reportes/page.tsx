'use client';

import { useTransactions } from '@/hooks/useTransactions';
import { useAccountBalance } from '@/hooks/useAccounts';
import { useCalculations, useExpensesByCategory } from '@/hooks/useCalculations';
import { DashboardStats } from '@/features/dashboard/components/DashboardStats';
import { BarChart3, PieChart } from 'lucide-react';

export default function ReportesPage() {
  const { transacciones } = useTransactions();
  console.log('[v0] Reportes - transacciones.length:', transacciones.length);
  
  const { saldoTotal } = useAccountBalance();
  const stats = useCalculations(transacciones, saldoTotal);
  console.log('[v0] Reportes - stats.ingresosDelMes:', stats.ingresosDelMes);
  console.log('[v0] Reportes - stats.gastosDelMes:', stats.gastosDelMes);
  
  const expensesByCategory = useExpensesByCategory(transacciones);
  console.log('[v0] Reportes - expensesByCategory:', expensesByCategory);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Reportes</h1>
        <p className="text-muted-foreground">Análisis de tu actividad financiera</p>
      </div>

      {/* Stats */}
      <DashboardStats stats={stats} />

      {/* Gastos por categoría */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-4">
        <div className="flex items-center gap-2">
          <PieChart className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold">Gastos por Categoría</h2>
        </div>
        {Object.entries(expensesByCategory).length > 0 ? (
          <div className="space-y-3">
            {Object.entries(expensesByCategory)
              .sort((a, b) => b[1].amount - a[1].amount)
              .map(([categoryId, data]) => (
                <div key={categoryId} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Categoría {categoryId}</span>
                    <span className="text-muted-foreground">{data.count} transacciones</span>
                  </div>
                  <div className="bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${
                          (data.amount /
                            Object.values(expensesByCategory).reduce((sum, d) => sum + d.amount, 0)) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">{formatCurrency(data.amount)}</p>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">Sin datos disponibles</p>
        )}
      </div>

      {/* Resumen */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold">Resumen Mensual</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Ingresos</p>
            <p className="text-xl font-bold text-green-500">{formatCurrency(stats.ingresosDelMes)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Gastos</p>
            <p className="text-xl font-bold text-red-500">{formatCurrency(stats.gastosDelMes)}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-muted-foreground">Balance</p>
            <p className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatCurrency(stats.balance)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
