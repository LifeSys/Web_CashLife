const money = (n: number) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(Math.abs(n) || 0);

export interface BuildDebtMessageInput {
  contactName: string;
  /** meDebe - leDebo. Positivo: te debe. Negativo: le debes. Cero: a mano. */
  netBalance: number;
  paymentMethodLabel?: string;
  paymentMethodValue?: string;
}

/**
 * Arma el mensaje de cobranza/recordatorio considerando el balance NETO
 * (lo que te debe menos lo que tú le debes), no solo un lado — así, si dos
 * personas se deben mutuamente, el mensaje refleja lo que realmente falta
 * saldar entre ambos.
 */
export function buildDebtMessage({ contactName, netBalance, paymentMethodLabel, paymentMethodValue }: BuildDebtMessageInput): string {
  if (netBalance > 0) {
    let msg = `Hola ${contactName}, tenemos registrado que me debes ${money(netBalance)}. ¿Puedes agendar un pago?`;
    if (paymentMethodLabel && paymentMethodValue) {
      msg += ` Me puedes pagar por ${paymentMethodLabel}: ${paymentMethodValue}.`;
    }
    return msg;
  }
  if (netBalance < 0) {
    return `Hola ${contactName}, tenemos registrado que yo te debo ${money(netBalance)}. Te aviso para coordinar cuándo te lo paso.`;
  }
  return `Hola ${contactName}, quería confirmar que estamos a mano con nuestras cuentas pendientes.`;
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
