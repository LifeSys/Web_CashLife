/**
 * EventBuilder - Utilidades para construir y validar eventos financieros
 * 
 * Proporciona métodos factoría para crear eventos con validación básica
 */

import {
  EventoFinancieroTipo,
  EventoGasto,
  EventoIngreso,
  EventoTransferencia,
  EventoCargoTarjeta,
  EventoPagoTarjeta,
  EventoPrestamo,
  EventoDeudaRecibida,
  EventoCobranza,
  EventoPago,
  EventoObligacion,
  EventoCuentaCobrar,
  EventoPagoProgramado,
  EventoFinanciero,
} from '@/types/EventTypes';

export class EventBuilder {
  /**
   * Valida que un monto sea válido (positivo)
   */
  static validarMonto(monto: number): boolean {
    return typeof monto === 'number' && monto > 0;
  }

  /**
   * Valida que una fecha no sea futura
   */
  static validarFecha(fecha: Date): boolean {
    return fecha <= new Date();
  }

  /**
   * Valida que una cadena no esté vacía
   */
  static validarDescripcion(desc: string): boolean {
    return typeof desc === 'string' && desc.trim().length > 0;
  }

  /**
   * Valida ID (que sea string y no vacío)
   */
  static validarId(id?: string): boolean {
    return typeof id === 'string' && id.trim().length > 0;
  }

  /**
   * Crear evento de gasto
   */
  static crearGasto(
    monto: number,
    cuentaId: string,
    categoriaId: string,
    descripcion: string,
    fecha: Date = new Date(),
    notas?: string
  ): EventoGasto {
    if (!this.validarMonto(monto)) {
      throw new Error('Monto debe ser un número positivo');
    }
    if (!this.validarId(cuentaId)) {
      throw new Error('ID de cuenta requerido');
    }
    if (!this.validarId(categoriaId)) {
      throw new Error('ID de categoría requerido');
    }
    if (!this.validarDescripcion(descripcion)) {
      throw new Error('Descripción requerida');
    }
    if (!this.validarFecha(fecha)) {
      throw new Error('La fecha no puede ser futura');
    }

    return {
      tipo: EventoFinancieroTipo.GASTO,
      monto,
      cuentaId,
      categoriaId,
      descripcion,
      fecha,
      notas,
    };
  }

  /**
   * Crear evento de ingreso
   */
  static crearIngreso(
    monto: number,
    cuentaId: string,
    categoriaId: string,
    descripcion: string,
    fecha: Date = new Date(),
    notas?: string
  ): EventoIngreso {
    if (!this.validarMonto(monto)) {
      throw new Error('Monto debe ser un número positivo');
    }
    if (!this.validarId(cuentaId)) {
      throw new Error('ID de cuenta requerido');
    }
    if (!this.validarId(categoriaId)) {
      throw new Error('ID de categoría requerido');
    }
    if (!this.validarDescripcion(descripcion)) {
      throw new Error('Descripción requerida');
    }
    if (!this.validarFecha(fecha)) {
      throw new Error('La fecha no puede ser futura');
    }

    return {
      tipo: EventoFinancieroTipo.INGRESO,
      monto,
      cuentaId,
      categoriaId,
      descripcion,
      fecha,
      notas,
    };
  }

  /**
   * Crear evento de transferencia
   */
  static crearTransferencia(
    monto: number,
    cuentaOrigenId: string,
    cuentaDestinoId: string,
    descripcion: string,
    fecha: Date = new Date(),
    notas?: string
  ): EventoTransferencia {
    if (!this.validarMonto(monto)) {
      throw new Error('Monto debe ser un número positivo');
    }
    if (!this.validarId(cuentaOrigenId)) {
      throw new Error('ID de cuenta origen requerido');
    }
    if (!this.validarId(cuentaDestinoId)) {
      throw new Error('ID de cuenta destino requerido');
    }
    if (cuentaOrigenId === cuentaDestinoId) {
      throw new Error('Las cuentas no pueden ser iguales');
    }
    if (!this.validarDescripcion(descripcion)) {
      throw new Error('Descripción requerida');
    }
    if (!this.validarFecha(fecha)) {
      throw new Error('La fecha no puede ser futura');
    }

    return {
      tipo: EventoFinancieroTipo.TRANSFERENCIA,
      monto,
      cuentaOrigenId,
      cuentaDestinoId,
      descripcion,
      fecha,
      notas,
    };
  }

  /**
   * Crear evento de cargo a tarjeta
   */
  static crearCargoTarjeta(
    monto: number,
    tarjetaId: string,
    categoriaId: string,
    descripcion: string,
    fecha: Date = new Date(),
    notas?: string
  ): EventoCargoTarjeta {
    if (!this.validarMonto(monto)) {
      throw new Error('Monto debe ser un número positivo');
    }
    if (!this.validarId(tarjetaId)) {
      throw new Error('ID de tarjeta requerido');
    }
    if (!this.validarId(categoriaId)) {
      throw new Error('ID de categoría requerido');
    }
    if (!this.validarDescripcion(descripcion)) {
      throw new Error('Descripción requerida');
    }
    if (!this.validarFecha(fecha)) {
      throw new Error('La fecha no puede ser futura');
    }

    return {
      tipo: EventoFinancieroTipo.CARGO_TARJETA,
      monto,
      tarjetaId,
      categoriaId,
      descripcion,
      fecha,
      notas,
    };
  }

  /**
   * Crear evento de pago de tarjeta
   */
  static crearPagoTarjeta(
    monto: number,
    tarjetaId: string,
    cuentaId: string,
    descripcion: string,
    fecha: Date = new Date(),
    notas?: string
  ): EventoPagoTarjeta {
    if (!this.validarMonto(monto)) {
      throw new Error('Monto debe ser un número positivo');
    }
    if (!this.validarId(tarjetaId)) {
      throw new Error('ID de tarjeta requerido');
    }
    if (!this.validarId(cuentaId)) {
      throw new Error('ID de cuenta requerido');
    }
    if (!this.validarDescripcion(descripcion)) {
      throw new Error('Descripción requerida');
    }
    if (!this.validarFecha(fecha)) {
      throw new Error('La fecha no puede ser futura');
    }

    return {
      tipo: EventoFinancieroTipo.PAGO_TARJETA,
      monto,
      tarjetaId,
      cuentaId,
      descripcion,
      fecha,
      notas,
    };
  }

  /**
   * Crear evento de préstamo
   */
  static crearPrestamo(
    monto: number,
    personaId: string,
    cuentaId: string,
    descripcion: string,
    fecha: Date = new Date(),
    fechaVencimiento?: Date,
    notas?: string
  ): EventoPrestamo {
    if (!this.validarMonto(monto)) {
      throw new Error('Monto debe ser un número positivo');
    }
    if (!this.validarId(personaId)) {
      throw new Error('ID de persona requerido');
    }
    if (!this.validarId(cuentaId)) {
      throw new Error('ID de cuenta requerido');
    }
    if (!this.validarDescripcion(descripcion)) {
      throw new Error('Descripción requerida');
    }
    if (!this.validarFecha(fecha)) {
      throw new Error('La fecha no puede ser futura');
    }
    if (fechaVencimiento && fechaVencimiento < fecha) {
      throw new Error('La fecha de vencimiento no puede ser anterior a la fecha del préstamo');
    }

    return {
      tipo: EventoFinancieroTipo.PRESTAMO,
      monto,
      personaId,
      cuentaId,
      descripcion,
      fecha,
      fechaVencimiento,
      notas,
    };
  }

  /**
   * Crear evento de deuda recibida
   */
  static crearDeudaRecibida(
    monto: number,
    personaId: string,
    cuentaId: string,
    descripcion: string,
    fecha: Date = new Date(),
    fechaVencimiento?: Date,
    notas?: string
  ): EventoDeudaRecibida {
    if (!this.validarMonto(monto)) {
      throw new Error('Monto debe ser un número positivo');
    }
    if (!this.validarId(personaId)) {
      throw new Error('ID de persona requerido');
    }
    if (!this.validarId(cuentaId)) {
      throw new Error('ID de cuenta requerido');
    }
    if (!this.validarDescripcion(descripcion)) {
      throw new Error('Descripción requerida');
    }
    if (!this.validarFecha(fecha)) {
      throw new Error('La fecha no puede ser futura');
    }
    if (fechaVencimiento && fechaVencimiento < fecha) {
      throw new Error('La fecha de vencimiento no puede ser anterior a la fecha');
    }

    return {
      tipo: EventoFinancieroTipo.DEUDA_RECIBIDA,
      monto,
      personaId,
      cuentaId,
      descripcion,
      fecha,
      fechaVencimiento,
      notas,
    };
  }

  /**
   * Crear evento de cobranza
   */
  static crearCobranza(
    monto: number,
    deudaId: string,
    personaId: string,
    cuentaId: string,
    descripcion: string,
    fecha: Date = new Date(),
    notas?: string
  ): EventoCobranza {
    if (!this.validarMonto(monto)) {
      throw new Error('Monto debe ser un número positivo');
    }
    if (!this.validarId(deudaId)) {
      throw new Error('ID de deuda requerido');
    }
    if (!this.validarId(personaId)) {
      throw new Error('ID de persona requerido');
    }
    if (!this.validarId(cuentaId)) {
      throw new Error('ID de cuenta requerido');
    }
    if (!this.validarDescripcion(descripcion)) {
      throw new Error('Descripción requerida');
    }
    if (!this.validarFecha(fecha)) {
      throw new Error('La fecha no puede ser futura');
    }

    return {
      tipo: EventoFinancieroTipo.COBRANZA,
      monto,
      deudaId,
      personaId,
      cuentaId,
      descripcion,
      fecha,
      notas,
    };
  }

  /**
   * Crear evento de pago de obligación
   */
  static crearPago(
    monto: number,
    obligacionId: string,
    cuentaId: string,
    descripcion: string,
    fecha: Date = new Date(),
    notas?: string
  ): EventoPago {
    if (!this.validarMonto(monto)) {
      throw new Error('Monto debe ser un número positivo');
    }
    if (!this.validarId(obligacionId)) {
      throw new Error('ID de obligación requerido');
    }
    if (!this.validarId(cuentaId)) {
      throw new Error('ID de cuenta requerido');
    }
    if (!this.validarDescripcion(descripcion)) {
      throw new Error('Descripción requerida');
    }
    if (!this.validarFecha(fecha)) {
      throw new Error('La fecha no puede ser futura');
    }

    return {
      tipo: EventoFinancieroTipo.PAGO,
      monto,
      obligacionId,
      cuentaId,
      descripcion,
      fecha,
      notas,
    };
  }

  /**
   * Crear evento de obligación
   */
  static crearObligacion(
    monto: number,
    acreedor: string,
    tipoAcreedor: 'person' | 'bank' | 'company' | 'sunat' | 'other',
    fechaVencimiento: Date,
    descripcion: string,
    fecha: Date = new Date(),
    notas?: string
  ): EventoObligacion {
    if (!this.validarMonto(monto)) {
      throw new Error('Monto debe ser un número positivo');
    }
    if (!this.validarDescripcion(acreedor)) {
      throw new Error('Nombre del acreedor requerido');
    }
    if (!this.validarDescripcion(descripcion)) {
      throw new Error('Descripción requerida');
    }
    if (!this.validarFecha(fecha)) {
      throw new Error('La fecha no puede ser futura');
    }
    if (fechaVencimiento < fecha) {
      throw new Error('La fecha de vencimiento no puede ser anterior a la fecha');
    }

    return {
      tipo: EventoFinancieroTipo.OBLIGACION,
      monto,
      acreedor,
      tipoAcreedor,
      fechaVencimiento,
      descripcion,
      fecha,
      notas,
    };
  }

  /**
   * Crear evento de cuenta por cobrar
   */
  static crearCuentaCobrar(
    monto: number,
    personaId: string,
    descripcion: string,
    fecha: Date = new Date(),
    fechaVencimiento?: Date,
    notas?: string
  ): EventoCuentaCobrar {
    if (!this.validarMonto(monto)) {
      throw new Error('Monto debe ser un número positivo');
    }
    if (!this.validarId(personaId)) {
      throw new Error('ID de persona requerido');
    }
    if (!this.validarDescripcion(descripcion)) {
      throw new Error('Descripción requerida');
    }
    if (!this.validarFecha(fecha)) {
      throw new Error('La fecha no puede ser futura');
    }
    if (fechaVencimiento && fechaVencimiento < fecha) {
      throw new Error('La fecha de vencimiento no puede ser anterior a la fecha');
    }

    return {
      tipo: EventoFinancieroTipo.CUENTA_COBRAR,
      monto,
      personaId,
      descripcion,
      fecha,
      fechaVencimiento,
      notas,
    };
  }

  /**
   * Crear evento de pago programado
   */
  static crearPagoProgramado(
    suscripcionId: string,
    periodoId: string,
    cuentaId: string,
    monto: number,
    descripcion: string,
    fecha: Date = new Date(),
    notas?: string
  ): EventoPagoProgramado {
    if (!this.validarId(suscripcionId)) {
      throw new Error('ID de suscripción requerido');
    }
    if (!this.validarId(periodoId)) {
      throw new Error('ID de período requerido');
    }
    if (!this.validarId(cuentaId)) {
      throw new Error('ID de cuenta requerido');
    }
    if (!this.validarMonto(monto)) {
      throw new Error('Monto debe ser un número positivo');
    }
    if (!this.validarDescripcion(descripcion)) {
      throw new Error('Descripción requerida');
    }
    if (!this.validarFecha(fecha)) {
      throw new Error('La fecha no puede ser futura');
    }

    return {
      tipo: EventoFinancieroTipo.PAGO_PROGRAMADO,
      suscripcionId,
      periodoId,
      cuentaId,
      monto,
      descripcion,
      fecha,
      notas,
    };
  }
}

export default EventBuilder;
