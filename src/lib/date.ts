/**
 * `new Date("2026-08-14")` interpreta ese string como medianoche UTC. En
 * timezones detrás de UTC (Perú, UTC-5) eso cae al día anterior en hora
 * local — exactamente el bug de "puse 14 y sale 13". Los `<input
 * type="date">` siempre entregan "YYYY-MM-DD"; esto lo arma como fecha
 * LOCAL en vez de UTC.
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * El inverso: de un Date (o lo que venga de Prisma) a "YYYY-MM-DD" para
 * precargar un `<input type="date">`, usando los componentes locales en
 * vez de `toISOString()` (que primero convierte a UTC y puede correr el
 * día en la dirección contraria).
 */
export function formatDateInput(value: unknown): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(String(value));
  if (isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Día de vencimiento de un pago programado, "recortado" al último día real
 * de ESE mes en particular — no un 28 fijo. Un pago con "día 31" (ej.
 * IPC360 Home) antes se calculaba con `Math.min(dueDay, 28)`, así que en
 * CUALQUIER mes aparecía como si venciera el 28, tres días antes de lo
 * real. `new Date(year, month1Indexed, 0)` es el truco estándar de JS para
 * "último día del mes anterior al indicado" — pasar el mes 1-indexado tal
 * cual da el último día de ESE mes (ej. month=8 → día 0 de septiembre =
 * 31 de agosto).
 */
export function clampDueDay(year: number, month1Indexed: number, dueDay: number): number {
  const lastDayOfMonth = new Date(year, month1Indexed, 0).getDate();
  return Math.min(dueDay, lastDayOfMonth);
}

/** Fecha real de vencimiento de un periodo "YYYY-MM" dado el día configurado. */
export function periodToDueDate(period: string, dueDay: number): Date {
  const [year, month] = period.split('-').map(Number);
  return new Date(year, month - 1, clampDueDay(year, month, dueDay));
}
