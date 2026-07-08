'use client';

import { PersonFinancialSummary } from '@/services/person.service';
import { formatCurrency, formatDate } from '@/lib/utils';

interface ContactFinancialSummaryProps {
  summary: PersonFinancialSummary;
}

export function ContactFinancialSummary({ summary }: ContactFinancialSummaryProps) {
  const meDebeStatus = summary.meDebe > 0 ? 'positive' : 'neutral';
  const leDeboStatus = summary.leDebo > 0 ? 'warning' : 'neutral';

  return (
    <div className="space-y-6">
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Me Debe */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">💰 Me debe</h3>
            {summary.meDebe > 0 && (
              <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs font-semibold rounded-full">
                Activo
              </span>
            )}
          </div>
          <p className="text-3xl font-bold text-green-400">{formatCurrency(summary.meDebe)}</p>
          <p className="text-xs text-muted-foreground">
            {summary.totalReceivableDebts} operación{summary.totalReceivableDebts !== 1 ? 'es' : ''}
          </p>
        </div>

        {/* Le Debo */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">💸 Le debo</h3>
            {summary.leDebo > 0 && (
              <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs font-semibold rounded-full">
                Activo
              </span>
            )}
          </div>
          <p className="text-3xl font-bold text-red-400">{formatCurrency(summary.leDebo)}</p>
          <p className="text-xs text-muted-foreground">
            {summary.totalPayableObligations} operación{summary.totalPayableObligations !== 1 ? 'es' : ''}
          </p>
        </div>

        {/* Operaciones */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">📄 Operaciones</h3>
          <p className="text-3xl font-bold text-blue-400">{summary.totalOperations}</p>
          <p className="text-xs text-muted-foreground">Transacciones registradas</p>
        </div>

        {/* Última Operación */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">📅 Última operación</h3>
          {summary.lastOperation ? (
            <p className="text-3xl font-bold text-amber-400">
              {formatDate(summary.lastOperation)}
            </p>
          ) : (
            <p className="text-xl font-bold text-muted-foreground">-</p>
          )}
          <p className="text-xs text-muted-foreground">
            {summary.lastOperation
              ? `Hace ${Math.floor((Date.now() - summary.lastOperation.getTime()) / (1000 * 60 * 60 * 24))} días`
              : 'Sin operaciones'}
          </p>
        </div>
      </div>

      {/* Net Balance */}
      {(summary.meDebe > 0 || summary.leDebo > 0) && (
        <div className="rounded-lg border border-border bg-gradient-to-r from-card to-card/50 p-6">
          <p className="text-sm font-medium text-muted-foreground mb-2">Balance neto</p>
          <div className="flex items-center justify-between">
            <p
              className={`text-4xl font-bold ${
                summary.netBalance > 0
                  ? 'text-green-400'
                  : summary.netBalance < 0
                    ? 'text-red-400'
                    : 'text-gray-400'
              }`}
            >
              {formatCurrency(Math.abs(summary.netBalance))}
            </p>
            <p className="text-sm text-muted-foreground text-right">
              {summary.netBalance > 0
                ? '↑ Me debe más'
                : summary.netBalance < 0
                  ? '↓ Yo debo más'
                  : 'Equilibrado'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
