'use client';

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

const convertToDate = (date: any): Date => {
  return date instanceof Date ? date : new Date(date);
};

export function useCalculations(transacciones: Transaction[], saldoTotal?: number) {
  const stats = useMemo(() => {
    const { startOfMonth, endOfMonth } = getMonthDateRange();

    const transaccionesDelMes = transacciones.filter(t => {
      const tDate = convertToDate(t.fecha);
      return tDate >= startOfMonth && tDate <= endOfMonth && !t.isDeleted;
    });

    const ingresosDelMes = transaccionesDelMes
      .filter(t => t.tipo === 'income')
      .reduce((sum, t) => sum + t.monto, 0);

    const gastosDelMes = transaccionesDelMes
      .filter(t => t.tipo === 'expense')
      .reduce((sum, t) => sum + t.monto, 0);

    const balance = ingresosDelMes - gastosDelMes;

    const dineroPrestado = transacciones
      .filter(t => t.tipo === 'loan' && !t.isDeleted)
      .reduce((sum, t) => sum + t.monto, 0);

    const dineroPorCobrar = transacciones
      .filter(t => t.tipo === 'loan_payment' && !t.isDeleted)
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
      const tDate = convertToDate(t.fecha);
      return tDate >= startOfMonth && tDate <= endOfMonth && t.tipo === 'expense' && !t.isDeleted;
    });

    const byCategory: Record<string, { amount: number; count: number }> = {};

    transaccionesDelMes.forEach(t => {
      const catId = t.categoria || 'sin-categoria';
      if (!byCategory[catId]) {
        byCategory[catId] = { amount: 0, count: 0 };
      }
      byCategory[catId].amount += t.monto;
      byCategory[catId].count += 1;
    });

    return byCategory;
  }, [transacciones]);
}

export function useMonthlyTrend(transacciones: Transaction[]) {
  return useMemo(() => {
    const months: Record<string, { ingresos: number; gastos: number }> = {};

    transacciones.forEach(t => {
      if (t.isDeleted) return;
      
      const date = convertToDate(t.fecha);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!months[monthKey]) {
        months[monthKey] = { ingresos: 0, gastos: 0 };
      }

      if (t.tipo === 'income') {
        months[monthKey].ingresos += t.monto;
      } else if (t.tipo === 'expense') {
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
