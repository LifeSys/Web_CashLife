/**
 * TIPOS DE EVENTOS FINANCIEROS
 * 
 * Representan acciones del usuario en lenguaje natural del negocio.
 * Cada evento es procesado por Financial Engine para generar transacciones y obligaciones.
 */

export enum EventoFinancieroTipo {
  // MOVIMIENTO DE DINERO (1 Transaction)
  GASTO = 'gasto',                          // Registrar un gasto
  INGRESO = 'ingreso',                      // Registrar un ingreso
  TRANSFERENCIA = 'transferencia',          // Mover dinero entre cuentas propias

  // LÍNEAS DE CRÉDITO (1 Transaction)
  CARGO_TARJETA = 'cargo_tarjeta',          // Cargar gasto a tarjeta
  PAGO_TARJETA = 'pago_tarjeta',            // Pagar la tarjeta

  // PERSONAS Y OBLIGACIONES
  PRESTAMO = 'prestamo',                    // Prestar dinero a alguien
  DEUDA_RECIBIDA = 'deuda_recibida',        // Recibir un préstamo
  COBRANZA = 'cobranza',                    // Cobrar un préstamo anterior
  PAGO = 'pago',                            // Pagar una obligación anterior
  OBLIGACION = 'obligacion',                // Crear obligación sin transacción
  CUENTA_COBRAR = 'cuenta_cobrar',          // Crear cuenta por cobrar sin transacción

  // SUSCRIPCIONES Y PAGOS PROGRAMADOS
  PAGO_PROGRAMADO = 'pago_programado',      // Registrar pago de suscripción
}

/**
 * Categorías de eventos
 * Agrupar eventos por contexto de negocio
 */
export enum CategoriaEvento {
  MOVIMIENTO = 'movimiento',         // Dinero que fluye inmediatamente
  CREDITO = 'credito',               // Líneas de crédito
  PERSONAS = 'personas',             // Deudas entre personas
  SUSCRIPCIONES = 'suscripciones',   // Pagos recurrentes
}

/**
 * Mapeo de evento a categoría
 */
export const EVENTO_A_CATEGORIA: Record<EventoFinancieroTipo, CategoriaEvento> = {
  [EventoFinancieroTipo.GASTO]: CategoriaEvento.MOVIMIENTO,
  [EventoFinancieroTipo.INGRESO]: CategoriaEvento.MOVIMIENTO,
  [EventoFinancieroTipo.TRANSFERENCIA]: CategoriaEvento.MOVIMIENTO,
  [EventoFinancieroTipo.CARGO_TARJETA]: CategoriaEvento.CREDITO,
  [EventoFinancieroTipo.PAGO_TARJETA]: CategoriaEvento.CREDITO,
  [EventoFinancieroTipo.PRESTAMO]: CategoriaEvento.PERSONAS,
  [EventoFinancieroTipo.DEUDA_RECIBIDA]: CategoriaEvento.PERSONAS,
  [EventoFinancieroTipo.COBRANZA]: CategoriaEvento.PERSONAS,
  [EventoFinancieroTipo.PAGO]: CategoriaEvento.PERSONAS,
  [EventoFinancieroTipo.OBLIGACION]: CategoriaEvento.PERSONAS,
  [EventoFinancieroTipo.CUENTA_COBRAR]: CategoriaEvento.PERSONAS,
  [EventoFinancieroTipo.PAGO_PROGRAMADO]: CategoriaEvento.SUSCRIPCIONES,
};

/**
 * Labels legibles para el usuario (en español)
 */
export const EVENTO_LABELS: Record<EventoFinancieroTipo, string> = {
  [EventoFinancieroTipo.GASTO]: 'Gasto',
  [EventoFinancieroTipo.INGRESO]: 'Ingreso',
  [EventoFinancieroTipo.TRANSFERENCIA]: 'Transferencia',
  [EventoFinancieroTipo.CARGO_TARJETA]: 'Cargo a Tarjeta',
  [EventoFinancieroTipo.PAGO_TARJETA]: 'Pago de Tarjeta',
  [EventoFinancieroTipo.PRESTAMO]: 'Prestar Dinero',
  [EventoFinancieroTipo.DEUDA_RECIBIDA]: 'Recibir Préstamo',
  [EventoFinancieroTipo.COBRANZA]: 'Cobrar Préstamo',
  [EventoFinancieroTipo.PAGO]: 'Pagar Obligación',
  [EventoFinancieroTipo.OBLIGACION]: 'Crear Obligación',
  [EventoFinancieroTipo.CUENTA_COBRAR]: 'Crear Cuenta por Cobrar',
  [EventoFinancieroTipo.PAGO_PROGRAMADO]: 'Registrar Pago Programado',
};

/**
 * Descripciones para cada evento (help text)
 */
export const EVENTO_DESCRIPCIONES: Record<EventoFinancieroTipo, string> = {
  [EventoFinancieroTipo.GASTO]: 'Registra un dinero que salió de tu cuenta',
  [EventoFinancieroTipo.INGRESO]: 'Registra un dinero que entró a tu cuenta',
  [EventoFinancieroTipo.TRANSFERENCIA]: 'Mueve dinero entre tus propias cuentas',
  [EventoFinancieroTipo.CARGO_TARJETA]: 'Registra un gasto usando tarjeta de crédito',
  [EventoFinancieroTipo.PAGO_TARJETA]: 'Registra un pago a tu tarjeta de crédito',
  [EventoFinancieroTipo.PRESTAMO]: 'Registra dinero que prestaste a alguien',
  [EventoFinancieroTipo.DEUDA_RECIBIDA]: 'Registra un dinero que recibiste prestado',
  [EventoFinancieroTipo.COBRANZA]: 'Registra el cobro de un préstamo anterior',
  [EventoFinancieroTipo.PAGO]: 'Registra el pago de una obligación anterior',
  [EventoFinancieroTipo.OBLIGACION]: 'Crea una obligación de pago (sin dinero aún)',
  [EventoFinancieroTipo.CUENTA_COBRAR]: 'Crea una cuenta por cobrar (sin dinero aún)',
  [EventoFinancieroTipo.PAGO_PROGRAMADO]: 'Registra el pago de una suscripción',
};

/**
 * Iconos para cada tipo de evento (Lucide icons)
 */
export const EVENTO_ICONOS: Record<EventoFinancieroTipo, string> = {
  [EventoFinancieroTipo.GASTO]: 'TrendingDown',
  [EventoFinancieroTipo.INGRESO]: 'TrendingUp',
  [EventoFinancieroTipo.TRANSFERENCIA]: 'ArrowRightLeft',
  [EventoFinancieroTipo.CARGO_TARJETA]: 'CreditCard',
  [EventoFinancieroTipo.PAGO_TARJETA]: 'CheckCircle2',
  [EventoFinancieroTipo.PRESTAMO]: 'Hand',
  [EventoFinancieroTipo.DEUDA_RECIBIDA]: 'Inbox',
  [EventoFinancieroTipo.COBRANZA]: 'ArrowDownToLine',
  [EventoFinancieroTipo.PAGO]: 'ArrowUpFromLine',
  [EventoFinancieroTipo.OBLIGACION]: 'AlertCircle',
  [EventoFinancieroTipo.CUENTA_COBRAR]: 'AlertCircle',
  [EventoFinancieroTipo.PAGO_PROGRAMADO]: 'Clock',
};

/**
 * Colores para cada tipo de evento
 */
export const EVENTO_COLORES: Record<EventoFinancieroTipo, string> = {
  [EventoFinancieroTipo.GASTO]: '#EF4444',              // Rojo
  [EventoFinancieroTipo.INGRESO]: '#22C55E',            // Verde
  [EventoFinancieroTipo.TRANSFERENCIA]: '#3B82F6',      // Azul
  [EventoFinancieroTipo.CARGO_TARJETA]: '#F59E0B',      // Ámbar
  [EventoFinancieroTipo.PAGO_TARJETA]: '#6366F1',       // Índigo
  [EventoFinancieroTipo.PRESTAMO]: '#EC4899',           // Rosa
  [EventoFinancieroTipo.DEUDA_RECIBIDA]: '#8B5CF6',     // Púrpura
  [EventoFinancieroTipo.COBRANZA]: '#10B981',           // Verde oscuro
  [EventoFinancieroTipo.PAGO]: '#F97316',               // Naranja
  [EventoFinancieroTipo.OBLIGACION]: '#64748B',         // Gris
  [EventoFinancieroTipo.CUENTA_COBRAR]: '#64748B',      // Gris
  [EventoFinancieroTipo.PAGO_PROGRAMADO]: '#06B6D4',    // Cian
};

/**
 * Payload base para cualquier evento
 */
export interface EventoFinancieroBase {
  tipo: EventoFinancieroTipo;
  monto?: number;
  descripcion: string;
  fecha: Date;
  cuentaId?: string;
  personaId?: string;
  notas?: string;
  categoria?: string;
  categoriaId?: string;
  createdBy?: string;
}

/**
 * PAYLOADS POR CATEGORÍA DE EVENTO
 */

// MOVIMIENTO DE DINERO
export interface EventoGasto extends EventoFinancieroBase {
  tipo: EventoFinancieroTipo.GASTO;
  monto: number;
  cuentaId: string;
  categoriaId: string;
}

export interface EventoIngreso extends EventoFinancieroBase {
  tipo: EventoFinancieroTipo.INGRESO;
  monto: number;
  cuentaId: string;
  categoriaId: string;
}

export interface EventoTransferencia extends EventoFinancieroBase {
  tipo: EventoFinancieroTipo.TRANSFERENCIA;
  monto: number;
  cuentaOrigenId: string;
  cuentaDestinoId: string;
}

// LÍNEAS DE CRÉDITO
export interface EventoCargoTarjeta extends EventoFinancieroBase {
  tipo: EventoFinancieroTipo.CARGO_TARJETA;
  monto: number;
  tarjetaId: string;
  categoriaId: string;
}

export interface EventoPagoTarjeta extends EventoFinancieroBase {
  tipo: EventoFinancieroTipo.PAGO_TARJETA;
  monto: number;
  tarjetaId: string;
  cuentaId: string;
}

// PERSONAS Y OBLIGACIONES
export interface EventoPrestamo extends EventoFinancieroBase {
  tipo: EventoFinancieroTipo.PRESTAMO;
  monto: number;
  personaId: string;
  cuentaId: string;
  fechaVencimiento?: Date;
}

export interface EventoDeudaRecibida extends EventoFinancieroBase {
  tipo: EventoFinancieroTipo.DEUDA_RECIBIDA;
  monto: number;
  personaId: string;
  cuentaId: string;
  fechaVencimiento?: Date;
}

export interface EventoCobranza extends EventoFinancieroBase {
  tipo: EventoFinancieroTipo.COBRANZA;
  monto: number;
  deudaId: string;
  personaId: string;
  cuentaId: string;
}

export interface EventoPago extends EventoFinancieroBase {
  tipo: EventoFinancieroTipo.PAGO;
  monto: number;
  obligacionId: string;
  cuentaId: string;
}

export interface EventoObligacion extends EventoFinancieroBase {
  tipo: EventoFinancieroTipo.OBLIGACION;
  monto: number;
  acreedor: string;
  tipoAcreedor: 'person' | 'bank' | 'company' | 'sunat' | 'other';
  fechaVencimiento: Date;
}

export interface EventoCuentaCobrar extends EventoFinancieroBase {
  tipo: EventoFinancieroTipo.CUENTA_COBRAR;
  monto: number;
  personaId: string;
  fechaVencimiento?: Date;
}

// SUSCRIPCIONES Y PAGOS PROGRAMADOS
export interface EventoPagoProgramado extends EventoFinancieroBase {
  tipo: EventoFinancieroTipo.PAGO_PROGRAMADO;
  suscripcionId: string;
  periodoId: string;
  cuentaId: string;
  monto: number;
}

/**
 * Union type de todos los payloads de eventos
 */
export type EventoFinanciero =
  | EventoGasto
  | EventoIngreso
  | EventoTransferencia
  | EventoCargoTarjeta
  | EventoPagoTarjeta
  | EventoPrestamo
  | EventoDeudaRecibida
  | EventoCobranza
  | EventoPago
  | EventoObligacion
  | EventoCuentaCobrar
  | EventoPagoProgramado;
