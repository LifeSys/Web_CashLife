/**
 * EventLogger Service
 * Registra auditoría de eventos financieros para tracking y debugging
 */

import { EventoFinanciero, EventoFinancieroTipo, EVENTO_LABELS } from '@/types/EventTypes';

export interface EventLog {
  timestamp: Date;
  uid: string;
  tipoEvento: EventoFinancieroTipo;
  etiqueta: string;
  monto?: number;
  descripcion: string;
  exitoso: boolean;
  error?: string;
  duracion: number; // ms
}

class EventLoggerService {
  private logs: EventLog[] = [];
  private maxLogs = 100;

  /**
   * Registrar un evento procesado
   */
  logEvento(
    uid: string,
    evento: EventoFinanciero,
    exitoso: boolean,
    duracion: number,
    error?: Error
  ) {
    const log: EventLog = {
      timestamp: new Date(),
      uid,
      tipoEvento: evento.tipo,
      etiqueta: EVENTO_LABELS[evento.tipo],
      monto: evento.monto,
      descripcion: evento.descripcion,
      exitoso,
      error: error?.message,
      duracion,
    };

    this.logs.push(log);

    // Mantener solo los últimos 100 logs en memoria
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log en consola si hay error
    if (!exitoso) {
      console.error('[EventLogger]', log);
    } else {
      console.log('[EventLogger] Evento procesado:', {
        tipo: log.etiqueta,
        monto: log.monto,
        duracion: `${log.duracion}ms`,
      });
    }
  }

  /**
   * Obtener últimos logs
   */
  getLogs(cantidad = 20): EventLog[] {
    return this.logs.slice(-cantidad).reverse();
  }

  /**
   * Obtener logs de un usuario
   */
  getLogsPorUsuario(uid: string, cantidad = 20): EventLog[] {
    return this.logs
      .filter((log) => log.uid === uid)
      .slice(-cantidad)
      .reverse();
  }

  /**
   * Obtener logs por tipo de evento
   */
  getLogsPorTipo(tipo: EventoFinancieroTipo, cantidad = 20): EventLog[] {
    return this.logs
      .filter((log) => log.tipoEvento === tipo)
      .slice(-cantidad)
      .reverse();
  }

  /**
   * Obtener resumen de eventos
   */
  getResumen(): {
    totalEventos: number;
    exitosos: number;
    fallidos: number;
    porTipo: Record<EventoFinancieroTipo, number>;
    montoTotal: number;
  } {
    const resumen = {
      totalEventos: this.logs.length,
      exitosos: this.logs.filter((l) => l.exitoso).length,
      fallidos: this.logs.filter((l) => !l.exitoso).length,
      porTipo: {} as Record<EventoFinancieroTipo, number>,
      montoTotal: 0,
    };

    for (const log of this.logs) {
      resumen.porTipo[log.tipoEvento] = (resumen.porTipo[log.tipoEvento] || 0) + 1;
      if (log.monto) resumen.montoTotal += log.monto;
    }

    return resumen;
  }

  /**
   * Limpiar todos los logs
   */
  clear() {
    this.logs = [];
  }
}

export const eventLogger = new EventLoggerService();
export default eventLogger;
