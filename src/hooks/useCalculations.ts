import { useMemo } from 'react';
import type { Transaction } from '@/types';

export interface DashboardStats {
  saldoTotal: number;
  ingresosDelMes: number;
  gastosDelMes: number;
  balance: number;
  dineroPrestado: number;
  dineroPorCobrar: number;
  transaccionesDelMes: number;
}

const getMonthDateRange = () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { startOfMonth, endOfMonth };
};

export function useCalculations(transacciones: Transaction[], saldoTotal?: number) {
  const stats = useMemo(() => {
    const { startOfMonth, endOfMonth } = getMonthDateRange();

    const transaccionesDelMes = transacciones.filter(t => {
      const tDate = new Date(t.fecha);
      return tDate >= startOfMonth && tDate <= endOfMonth;
    });

    const ingresosDelMes = transaccionesDelMes
      .filter(t => t.tipo === 'INGRESO')
      .reduce((sum, t) => sum + t.monto, 0);

    const gastosDelMes = transaccionesDelMes
      .filter(t => t.tipo === 'GASTO')
      .reduce((sum, t) => sum + t.monto, 0);

    const balance = ingresosDelMes - gastosDelMes;

    const dineroPrestado = transacciones
      .filter(t => t.tipo === 'PRESTAMO' && !t.personaId?.includes('person-2') && !t.personaId?.includes('person-5') && !t.personaId?.includes('person-7'))
      .reduce((sum, t) => sum + t.monto, 0);

    const dineroPorCobrar = transacciones
      .filter(t => t.tipo === 'PRESTAMO' && (t.personaId?.includes('person-2') || t.personaId?.includes('person-5') || t.personaId?.includes('person-7')))
      .reduce((sum, t) => sum + t.monto, 0);

    return {
      saldoTotal: saldoTotal || 0,
      ingresosDelMes,
      gastosDelMes,
      balance,
      dineroPrestado,
      dineroPorCobrar,
      transaccionesDelMes: transaccionesDelMes.length,
    };
  }, [transacciones, saldoTotal]);

  return stats;
}

export function useExpensesByCategory(transacciones: Transaction[]) {
  return useMemo(() => {
    const { startOfMonth, endOfMonth } = getMonthDateRange();

    const transaccionesDelMes = transacciones.filter(t => {
      const tDate = new Date(t.fecha);
      return tDate >= startOfMonth && tDate <= endOfMonth && t.tipo === 'GASTO';
    });

    const byCategory: Record<string, { amount: number; count: number }> = {};

    transaccionesDelMes.forEach(t => {
      if (!byCategory[t.categoriaId]) {
        byCategory[t.categoriaId] = { amount: 0, count: 0 };
      }
      byCategory[t.categoriaId].amount += t.monto;
      byCategory[t.categoriaId].count += 1;
    });

    return byCategory;
  }, [transacciones]);
}

export function useMonthlyTrend(transacciones: Transaction[]) {
  return useMemo(() => {
    const months: Record<string, { ingresos: number; gastos: number }> = {};

    transacciones.forEach(t => {
      const date = new Date(t.fecha);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!months[monthKey]) {
        months[monthKey] = { ingresos: 0, gastos: 0 };
      }

      if (t.tipo === 'INGRESO') {
        months[monthKey].ingresos += t.monto;
      } else if (t.tipo === 'GASTO') {
        months[monthKey].gastos += t.monto;
      }
    });

    return Object.entries(months)
      .map(([month, data]) => ({
        mes: month,
        ...data,
      }))
      .sort((a, b) => a.mes.localeCompare(b.mes));
  }, [transacciones]);
}
