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

export interface BuildProfileRentalReminderInput {
  contactName: string;
  serviceName: string;
  profileLabel: string;
  endDate: Date;
  price: number;
  paymentMethodLabel?: string;
  paymentMethodValue?: string;
}

/** Recordatorio de renovación para un cliente que alquila un perfil (ej. Netflix). */
export function buildProfileRentalReminderMessage({
  contactName,
  serviceName,
  profileLabel,
  endDate,
  price,
  paymentMethodLabel,
  paymentMethodValue,
}: BuildProfileRentalReminderInput): string {
  const dateStr = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'long' }).format(endDate);
  let msg = `Hola ${contactName}, tu ${serviceName} (${profileLabel}) vence el ${dateStr}. ¿Renovamos por ${money(price)} más?`;
  if (paymentMethodLabel && paymentMethodValue) {
    msg += ` Me puedes pagar por ${paymentMethodLabel}: ${paymentMethodValue}.`;
  }
  return msg;
}

export interface BuildProfileRentalUrgentInput {
  contactName: string;
  serviceName: string;
  profileLabel: string;
  price: number;
  paymentMethodLabel?: string;
  paymentMethodValue?: string;
}

/** Recordatorio para el día ANTES de que venza (ej. vence el 20, este se manda el 19). */
export function buildProfileRentalDueTomorrowMessage({
  contactName,
  serviceName,
  profileLabel,
  price,
  paymentMethodLabel,
  paymentMethodValue,
}: BuildProfileRentalUrgentInput): string {
  let msg = `Hola ${contactName}, te escribo para avisarte con tiempo: tu ${serviceName} (${profileLabel}) vence mañana. Puedes renovar el pago de ${money(price)} hasta mañana a las 11:59pm.`;
  if (paymentMethodLabel && paymentMethodValue) {
    msg += ` Me puedes pagar por ${paymentMethodLabel}: ${paymentMethodValue}.`;
  }
  return msg;
}

/** Recordatorio para el mismo día del vencimiento (ej. vence el 20, este se manda el 20). */
export function buildProfileRentalDueTodayMessage({
  contactName,
  serviceName,
  profileLabel,
  price,
  paymentMethodLabel,
  paymentMethodValue,
}: BuildProfileRentalUrgentInput): string {
  let msg = `Hola ${contactName}, tu ${serviceName} (${profileLabel}) vence hoy. Tienes hasta las 11:59pm de hoy para hacer el pago de ${money(price)}; de lo contrario, no podrás mantener el mismo perfil con tu información de visualización.`;
  if (paymentMethodLabel && paymentMethodValue) {
    msg += ` Me puedes pagar por ${paymentMethodLabel}: ${paymentMethodValue}.`;
  }
  return msg;
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
