'use server';

/**
 * API gratuita, sin API key, actualizada ~1 vez al día. Si algún día deja
 * de responder, el usuario siempre puede meter el tipo de cambio a mano en
 * Configuración — nunca es un bloqueante.
 */
const EXCHANGE_RATE_API = 'https://open.er-api.com/v6/latest/USD';

export interface ExchangeRateResult {
  rate: number;
  fetchedAt: string;
}

export async function fetchUsdToPenRateAction(): Promise<ExchangeRateResult> {
  const res = await fetch(EXCHANGE_RATE_API, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`No se pudo consultar el tipo de cambio (HTTP ${res.status})`);
  }
  const data = (await res.json()) as { result?: string; rates?: Record<string, number> };
  const rate = data.rates?.PEN;
  if (data.result !== 'success' || !rate) {
    throw new Error('La API de tipo de cambio no devolvió un valor para PEN');
  }
  return { rate, fetchedAt: new Date().toISOString() };
}
