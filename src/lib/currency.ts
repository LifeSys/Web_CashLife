/**
 * Convierte un monto a su equivalente en soles usando el tipo de cambio
 * que quedó "congelado" en el registro (deuda/obligación) al crearlo —
 * nunca el tipo de cambio de hoy, para que los totales históricos no se
 * muevan solos cuando el dólar sube o baja.
 */
export function toPenEquivalent(amount: number, tipoCambio?: number | null): number {
  return amount * (tipoCambio ?? 1);
}
