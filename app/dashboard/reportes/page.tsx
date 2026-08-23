'use client';

import { useMemo, useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useAccounts, useAccountBalance } from '@/hooks/useAccounts';
import { useCategories } from '@/hooks/useCategories';
import { useCreditCards } from '@/hooks/useCreditCards';
import { usePayableObligations, useReceivableDebts } from '@/hooks/useFinancial';
import { useCalculations, useExpensesByCategory } from '@/hooks/useCalculations';
import { toPenEquivalent } from '@/lib/currency';
import { generateFinancialReportPdf } from '@/lib/pdf/financial-report';
import { DashboardStats } from '@/features/dashboard/components/DashboardStats';
import { BarChart3, Download, PieChart } from 'lucide-react';
import { toast } from 'sonner';

const toDate = (value: unknown): Date =>
  value instanceof Date ? value : value && typeof value === 'object' && 'toDate' in (value as object) ? (value as { toDate(): Date }).toDate() : new Date(String(value));

export default function ReportesPage() {
  const { transacciones } = useTransactions();
  const { cuentas } = useAccounts();
  const { saldoTotal } = useAccountBalance();
  const { categorias } = useCategories();
  const { creditCards } = useCreditCards();
  const { debts } = useReceivableDebts();
  const { obligations } = usePayableObligations();
  const stats = useCalculations(transacciones, saldoTotal);
  const expensesByCategory = useExpensesByCategory(transacciones);
  const [isGenerating, setIsGenerating] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value);
  };

  const categoryName = (categoryId: string) => {
    if (categoryId === 'sin-categoria') return 'Sin categoría';
    return categorias.find((c) => c.id === categoryId)?.nombre ?? 'Categoría eliminada';
  };

  // Mismo cálculo que el Resumen Financiero del dashboard, para que el PDF
  // no diga algo distinto a lo que ya ve el usuario ahí.
  const patrimonio = useMemo(() => {
    const dineroDisponible = cuentas.filter((a) => a.tipo !== 'credit_card').reduce((sum, a) => sum + (a.saldo ?? a.balance ?? 0), 0);
    const meDeben = debts.reduce((sum, d) => sum + toPenEquivalent(d.pendingBalance || 0, d.tipoCambio), 0);
    const obligacionesTotal = obligations.reduce((sum, o) => sum + toPenEquivalent(o.pendingBalance || 0, o.tipoCambio), 0);
    const creditoUsado = creditCards.reduce((sum, c) => sum + (c.usedAmount ?? c.montoUtilizado ?? 0), 0);
    const totalDebo = obligacionesTotal + creditoUsado;
    return {
      dineroDisponible,
      meDeben,
      totalDebo,
      patrimonioNeto: dineroDisponible + meDeben - totalDebo,
    };
  }, [cuentas, debts, obligations, creditCards]);

  const movimientosDelMes = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return transacciones.filter((t) => !t.isDeleted && toDate(t.fecha) >= startOfMonth);
  }, [transacciones]);

  const handleDownloadPdf = () => {
    setIsGenerating(true);
    try {
      generateFinancialReportPdf({
        generatedAt: new Date(),
        resumen: {
          dineroDisponible: patrimonio.dineroDisponible,
          patrimonioNeto: patrimonio.patrimonioNeto,
          meDeben: patrimonio.meDeben,
          totalDebo: patrimonio.totalDebo,
        },
        resumenMensual: {
          ingresos: stats.ingresosDelMes,
          gastos: stats.gastosDelMes,
          balance: stats.balance,
        },
        gastosPorCategoria: Object.entries(expensesByCategory).map(([categoryId, data]) => ({
          nombre: categoryName(categoryId),
          monto: data.amount,
          cantidad: data.count,
        })),
        movimientosDelMes,
        categorias,
      });
      toast.success('PDF descargado');
    } catch (error) {
      toast.error('Error al generar el PDF');
      console.error('[CashLife] Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Reportes</h1>
          <p className="text-muted-foreground">Análisis de tu actividad financiera</p>
        </div>
        <button
          onClick={handleDownloadPdf}
          disabled={isGenerating}
          className="flex-shrink-0 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {isGenerating ? 'Generando...' : 'Descargar PDF'}
        </button>
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
                    <span className="font-medium">{categoryName(categoryId)}</span>
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
