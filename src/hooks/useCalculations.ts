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

    // Ingresos reales: dinero que YA entró. 'receivable_debt' (registrar que
    // alguien te debe) NO cuenta — todavía no has cobrado nada, solo quedó
    // anotado. Ese dinero entra recién como 'receivable_payment' cuando de
    // verdad te pagan; contar ambos sería contarlo dos veces.
    const ingresosDelMes = transaccionesDelMes
      .filter(t => ['income', 'receivable_payment'].includes(t.tipo))
      .reduce((sum, t) => sum + t.monto, 0);

    // Gastos reales: dinero que YA salió. 'payable_obligation' (registrar que
    // le debes a alguien) tampoco cuenta por la misma razón — sale recién
    // como 'payable_payment' cuando de verdad lo pagas.
    const gastosDelMes = transaccionesDelMes
      .filter(t => ['expense', 'credit_card_charge', 'payable_payment', 'scheduled_payment'].includes(t.tipo))
      .reduce((sum, t) => sum + t.monto, 0);

    const balance = ingresosDelMes - gastosDelMes;

    const dineroPrestado = transacciones
      .filter(t => t.tipo === 'loan' && !t.isDeleted)
      .reduce((sum, t) => sum + t.monto, 0);

    const dineroYaCobradoDePrestamos = transacciones
      .filter(t => t.tipo === 'loan_payment' && !t.isDeleted)
      .reduce((sum, t) => sum + t.monto, 0);

    // "Por Cobrar" = lo que todavía falta que te devuelvan, no lo ya cobrado.
    const dineroPorCobrar = Math.max(dineroPrestado - dineroYaCobradoDePrestamos, 0);

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
      return tDate >= startOfMonth && tDate <= endOfMonth && ['expense', 'credit_card_charge', 'payable_payment', 'scheduled_payment'].includes(t.tipo) && !t.isDeleted;
    });

    const byCategory: Record<string, { amount: number; count: number }> = {};

    transaccionesDelMes.forEach(t => {
      const catId = t.categoriaId || 'sin-categoria';
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

      // Mismo criterio que useCalculations: solo dinero que de verdad entró o salió.
      if (['income', 'receivable_payment'].includes(t.tipo)) {
        months[monthKey].ingresos += t.monto;
      }
      else if (['expense', 'credit_card_charge', 'payable_payment', 'scheduled_payment'].includes(t.tipo)) {
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
