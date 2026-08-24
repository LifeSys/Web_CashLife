const money = (n: number) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(Math.abs(n) || 0);
const shortDate = (d: Date) => new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'long' }).format(d);

/**
 * Variables disponibles para personalizar los mensajes de cobranza/recordatorio
 * (Configuración → Personalizar mensajes). Se muestran también en la UI para
 * que el usuario sepa qué puede usar en su plantilla.
 */
export const MESSAGE_PLACEHOLDERS = [
  { token: '{cliente}', description: 'Nombre del cliente/contacto' },
  { token: '{servicio}', description: 'Nombre de la cuenta compartida (ej. Netflix)' },
  { token: '{perfil}', description: 'Perfil/cupo alquilado (ej. PIN 1234)' },
  { token: '{fecha}', description: 'Fecha de vencimiento' },
  { token: '{monto}', description: 'Monto a cobrar' },
  { token: '{detalle}', description: 'Lista de qué debe y desde cuándo, una línea por cada cuenta pendiente (se omite si no hay detalle)' },
  { token: '{metodoPago}', description: 'Frase con tu método de cobro, si lo configuraste (se omite si no hay ninguno)' },
] as const;

function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? vars[key] : match));
}

function metodoPagoClause(paymentMethodLabel?: string, paymentMethodValue?: string): string {
  if (!paymentMethodLabel || !paymentMethodValue) return '';
  return ` Me puedes pagar por ${paymentMethodLabel}: ${paymentMethodValue}.`;
}

export interface DebtLineItem {
  description: string;
  amount: number;
  date: Date;
  moneda?: string;
}

/** Arma la lista "Detalle: • ... — S/ ... (fecha)" para meter en el mensaje. Vacío si no hay ítems. */
function detalleClause(items?: DebtLineItem[]): string {
  if (!items || items.length === 0) return '';
  const lines = items.map((it) => {
    const amountFormatted = new Intl.NumberFormat('es-PE', { style: 'currency', currency: it.moneda || 'PEN' }).format(it.amount);
    return `• ${it.description} — ${amountFormatted} (desde el ${shortDate(it.date)})`;
  });
  return `\n\nDetalle:\n${lines.join('\n')}`;
}

// ---- Cuentas por cobrar (deuda general, no ligada a un alquiler) ----

export const DEFAULT_DEBT_TEMPLATE = 'Hola {cliente}, tenemos registrado que me debes {monto}.{detalle}\n\n¿Puedes agendar un pago?{metodoPago}';

export interface BuildDebtMessageInput {
  contactName: string;
  /** meDebe - leDebo. Positivo: te debe. Negativo: le debes. Cero: a mano. */
  netBalance: number;
  paymentMethodLabel?: string;
  paymentMethodValue?: string;
  /** Plantilla personalizada desde Configuración → Personalizar mensajes (solo aplica cuando te deben). */
  template?: string;
  /** Detalle de cuentas por cobrar individuales, para el placeholder {detalle}. */
  items?: DebtLineItem[];
}

/**
 * Arma el mensaje de cobranza/recordatorio considerando el balance NETO
 * (lo que te debe menos lo que tú le debes), no solo un lado — así, si dos
 * personas se deben mutuamente, el mensaje refleja lo que realmente falta
 * saldar entre ambos. Solo el caso "te debe" (el de cobranza real) usa la
 * plantilla personalizable; los otros dos son informativos y no tienen
 * intención de cobro.
 */
export function buildDebtMessage({ contactName, netBalance, paymentMethodLabel, paymentMethodValue, template, items }: BuildDebtMessageInput): string {
  if (netBalance > 0) {
    return renderTemplate(template?.trim() || DEFAULT_DEBT_TEMPLATE, {
      cliente: contactName,
      monto: money(netBalance),
      detalle: detalleClause(items),
      metodoPago: metodoPagoClause(paymentMethodLabel, paymentMethodValue),
    });
  }
  if (netBalance < 0) {
    return `Hola ${contactName}, tenemos registrado que yo te debo ${money(netBalance)}. Te aviso para coordinar cuándo te lo paso.`;
  }
  return `Hola ${contactName}, quería confirmar que estamos a mano con nuestras cuentas pendientes.`;
}

/** De la lista completa de deudas, arma los ítems (solo pendientes, más viejas primero) de un contacto para {detalle}. */
export function debtsToMessageItems(debts: { contactId?: string; personId: string; description: string; pendingBalance: number; date: unknown; moneda?: string }[], contactId: string): DebtLineItem[] {
  return debts
    .filter((d) => (d.contactId ?? d.personId) === contactId && d.pendingBalance > 0)
    .map((d) => ({
      description: d.description,
      amount: d.pendingBalance,
      date: d.date instanceof Date ? d.date : new Date(d.date as string),
      moneda: d.moneda,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

// ---- Reventas: recordatorios de alquiler de perfiles ----

interface RentalTemplateVars {
  contactName: string;
  serviceName: string;
  profileLabel: string;
  date?: Date;
  price: number;
  paymentMethodLabel?: string;
  paymentMethodValue?: string;
}

function renderRentalTemplate(template: string, { contactName, serviceName, profileLabel, date, price, paymentMethodLabel, paymentMethodValue }: RentalTemplateVars): string {
  return renderTemplate(template, {
    cliente: contactName,
    servicio: serviceName,
    perfil: profileLabel,
    fecha: date ? shortDate(date) : '',
    monto: money(price),
    metodoPago: metodoPagoClause(paymentMethodLabel, paymentMethodValue),
  });
}

export const DEFAULT_RENTAL_REMINDER_TEMPLATE = 'Hola {cliente}, tu {servicio} ({perfil}) vence el {fecha}. ¿Renovamos por {monto} más?{metodoPago}';

export interface BuildProfileRentalReminderInput {
  contactName: string;
  serviceName: string;
  profileLabel: string;
  endDate: Date;
  price: number;
  paymentMethodLabel?: string;
  paymentMethodValue?: string;
  template?: string;
}

/** Recordatorio de renovación para un cliente que alquila un perfil (ej. Netflix), con días de anticipación. */
export function buildProfileRentalReminderMessage({ endDate, template, ...rest }: BuildProfileRentalReminderInput): string {
  return renderRentalTemplate(template?.trim() || DEFAULT_RENTAL_REMINDER_TEMPLATE, { ...rest, date: endDate });
}

export const DEFAULT_RENTAL_DUE_TOMORROW_TEMPLATE =
  'Estimado/a {cliente}, le informo que su plan de {servicio} ({perfil}) vence mañana {fecha}. Tiene plazo hasta mañana como máximo hasta las 11:59pm para realizar el pago de {monto} y así mantener la misma cuenta activa sin ser eliminada.{metodoPago}';

export const DEFAULT_RENTAL_DUE_TODAY_TEMPLATE =
  'Hola {cliente}, tu {servicio} ({perfil}) vence hoy {fecha}. Tienes hasta las 11:59pm de hoy para hacer el pago de {monto}; de lo contrario, no podrás mantener el mismo perfil con tu información de visualización.{metodoPago}';

export interface BuildProfileRentalUrgentInput {
  contactName: string;
  serviceName: string;
  profileLabel: string;
  price: number;
  /** Fecha de vencimiento (mañana u hoy, según el mensaje) para el placeholder {fecha}. */
  dueDate: Date;
  paymentMethodLabel?: string;
  paymentMethodValue?: string;
  template?: string;
}

/** Recordatorio para el día ANTES de que venza (ej. vence el 20, este se manda el 19). */
export function buildProfileRentalDueTomorrowMessage({ dueDate, template, ...rest }: BuildProfileRentalUrgentInput): string {
  return renderRentalTemplate(template?.trim() || DEFAULT_RENTAL_DUE_TOMORROW_TEMPLATE, { ...rest, date: dueDate });
}

/** Recordatorio para el mismo día del vencimiento (ej. vence el 20, este se manda el 20). */
export function buildProfileRentalDueTodayMessage({ dueDate, template, ...rest }: BuildProfileRentalUrgentInput): string {
  return renderRentalTemplate(template?.trim() || DEFAULT_RENTAL_DUE_TODAY_TEMPLATE, { ...rest, date: dueDate });
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
