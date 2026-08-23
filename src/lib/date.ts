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
