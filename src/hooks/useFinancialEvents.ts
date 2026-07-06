/**
 * Hook para procesar eventos financieros
 * Orquesta la creación de eventos y su procesamiento a través del Financial Engine
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { financialEngine } from '@/services/financial-engine.service';
import { EventBuilder } from '@/utils/EventBuilder';
import {
  EventoFinanciero,
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
} from '@/types/EventTypes';

interface UseFinancialEventsOptions {
  onSuccess?: (evento: EventoFinanciero) => void;
  onError?: (error: Error) => void;
}

interface UseFinancialEventsReturn {
  loading: boolean;
  error: Error | null;
  procesarGasto: (params: Parameters<typeof EventBuilder.crearGasto>[0]) => Promise<EventoGasto>;
  procesarIngreso: (params: Parameters<typeof EventBuilder.crearIngreso>[0]) => Promise<EventoIngreso>;
  procesarTransferencia: (params: Parameters<typeof EventBuilder.crearTransferencia>[0]) => Promise<EventoTransferencia>;
  procesarCargoTarjeta: (params: Parameters<typeof EventBuilder.crearCargoTarjeta>[0]) => Promise<EventoCargoTarjeta>;
  procesarPagoTarjeta: (params: Parameters<typeof EventBuilder.crearPagoTarjeta>[0]) => Promise<EventoPagoTarjeta>;
  procesarPrestamo: (params: Parameters<typeof EventBuilder.crearPrestamo>[0]) => Promise<EventoPrestamo>;
  procesarDeudaRecibida: (params: Parameters<typeof EventBuilder.crearDeudaRecibida>[0]) => Promise<EventoDeudaRecibida>;
  procesarCobranza: (params: Parameters<typeof EventBuilder.crearCobranza>[0]) => Promise<EventoCobranza>;
  procesarPago: (params: Parameters<typeof EventBuilder.crearPago>[0]) => Promise<EventoPago>;
  procesarObligacion: (params: Parameters<typeof EventBuilder.crearObligacion>[0]) => Promise<EventoObligacion>;
  procesarCuentaCobrar: (params: Parameters<typeof EventBuilder.crearCuentaCobrar>[0]) => Promise<EventoCuentaCobrar>;
  procesarEvento: (uid: string, evento: EventoFinanciero) => Promise<void>;
}

export function useFinancialEvents(options?: UseFinancialEventsOptions): UseFinancialEventsReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const procesarEvento = async (uid: string, evento: EventoFinanciero) => {
    setLoading(true);
    setError(null);

    try {
      await financialEngine.procesarEvento(uid, evento);
      options?.onSuccess?.(evento);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido');
      setError(error);
      options?.onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Métodos específicos por tipo de evento
  const procesarGasto = async (...args: Parameters<typeof EventBuilder.crearGasto>) => {
    const evento = EventBuilder.crearGasto(...args);
    // Se retorna el evento pero no se procesa (esto es responsabilidad del caller)
    return evento;
  };

  const procesarIngreso = async (...args: Parameters<typeof EventBuilder.crearIngreso>) => {
    const evento = EventBuilder.crearIngreso(...args);
    return evento;
  };

  const procesarTransferencia = async (...args: Parameters<typeof EventBuilder.crearTransferencia>) => {
    const evento = EventBuilder.crearTransferencia(...args);
    return evento;
  };

  const procesarCargoTarjeta = async (...args: Parameters<typeof EventBuilder.crearCargoTarjeta>) => {
    const evento = EventBuilder.crearCargoTarjeta(...args);
    return evento;
  };

  const procesarPagoTarjeta = async (...args: Parameters<typeof EventBuilder.crearPagoTarjeta>) => {
    const evento = EventBuilder.crearPagoTarjeta(...args);
    return evento;
  };

  const procesarPrestamo = async (...args: Parameters<typeof EventBuilder.crearPrestamo>) => {
    const evento = EventBuilder.crearPrestamo(...args);
    return evento;
  };

  const procesarDeudaRecibida = async (...args: Parameters<typeof EventBuilder.crearDeudaRecibida>) => {
    const evento = EventBuilder.crearDeudaRecibida(...args);
    return evento;
  };

  const procesarCobranza = async (...args: Parameters<typeof EventBuilder.crearCobranza>) => {
    const evento = EventBuilder.crearCobranza(...args);
    return evento;
  };

  const procesarPago = async (...args: Parameters<typeof EventBuilder.crearPago>) => {
    const evento = EventBuilder.crearPago(...args);
    return evento;
  };

  const procesarObligacion = async (...args: Parameters<typeof EventBuilder.crearObligacion>) => {
    const evento = EventBuilder.crearObligacion(...args);
    return evento;
  };

  const procesarCuentaCobrar = async (...args: Parameters<typeof EventBuilder.crearCuentaCobrar>) => {
    const evento = EventBuilder.crearCuentaCobrar(...args);
    return evento;
  };

  return {
    loading,
    error,
    procesarGasto,
    procesarIngreso,
    procesarTransferencia,
    procesarCargoTarjeta,
    procesarPagoTarjeta,
    procesarPrestamo,
    procesarDeudaRecibida,
    procesarCobranza,
    procesarPago,
    procesarObligacion,
    procesarCuentaCobrar,
    procesarEvento,
  };
}

export default useFinancialEvents;
