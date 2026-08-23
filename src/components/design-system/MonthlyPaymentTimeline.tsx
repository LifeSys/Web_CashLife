'use client';

import type { ScheduledPaymentPeriod } from '@/types';

interface MonthlyPaymentTimelineProps {
  periods: ScheduledPaymentPeriod[];
  createdAt?: Date;
  year?: number;
}

const MONTH_LABELS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

/**
 * Franja de 12 meses (01-12) del año en curso: azul = ya pagado ese mes,
 * rojo = falta pagarlo, gris = el pago aún no existía ese mes.
 */
export function MonthlyPaymentTimeline({ periods, createdAt, year }: MonthlyPaymentTimelineProps) {
  const targetYear = year ?? new Date().getFullYear();
  const createdYear = createdAt ? createdAt.getFullYear() : targetYear;
  const createdMonth = createdAt ? createdAt.getMonth() + 1 : 1;

  return (
    <div className="flex items-center gap-1" title={`Historial de pagos ${targetYear}`}>
      {MONTH_LABELS.map((label, idx) => {
        const monthNumber = idx + 1;
        const periodKey = `${targetYear}-${label}`;
        const notYetExisted = targetYear === createdYear && monthNumber < createdMonth;
        const periodRow = periods.find((p) => p.period === periodKey);
        const isPaid = periodRow?.status === 'paid';

        const colorClasses = notYetExisted
          ? 'bg-muted text-muted-foreground/50'
          : isPaid
            ? 'bg-blue-500 text-white'
            : 'bg-red-500/80 text-white';

        return (
          <span
            key={periodKey}
            title={
              notYetExisted
                ? `${label}/${targetYear} · Aún no existía`
                : isPaid
                  ? `${label}/${targetYear} · Pagado`
                  : `${label}/${targetYear} · Pendiente`
            }
            className={`flex-1 rounded-md py-1 text-center text-[10px] font-semibold ${colorClasses}`}
          >
            {label}
          </span>
        );
      })}
    </div>
  );
}
