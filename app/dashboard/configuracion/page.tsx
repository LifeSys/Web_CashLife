'use client';

import { useEffect, useState } from 'react';
import { Settings, LogOut, Bell, Moon, Wallet, RefreshCw, DollarSign } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { fetchUsdToPenRateAction } from '@/lib/actions/exchange-rate.actions';
import { toast } from 'sonner';

const formatRelativeDays = (date: Date): string => {
  const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'hoy';
  if (days === 1) return 'ayer';
  return `hace ${days} días`;
};

const PAYMENT_METHODS = ['Yape', 'Plin', 'Transferencia', 'Efectivo', 'Otro'] as const;

export default function ConfiguracionPage() {
  const { settings, updateSettings } = useSettings();
  const [notificaciones, setNotificaciones] = useState(true);
  const [metodoPagoLabel, setMetodoPagoLabel] = useState('');
  const [metodoPagoValor, setMetodoPagoValor] = useState('');
  const [tipoCambio, setTipoCambio] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingRate, setIsFetchingRate] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setMetodoPagoLabel(settings.metodoPagoLabel ?? '');
    setMetodoPagoValor(settings.metodoPagoValor ?? '');
    setTipoCambio(settings.tipoCambioUsdPen ? String(settings.tipoCambioUsdPen) : '');
  }, [settings]);

  const handleSaveExchangeRate = async () => {
    const parsed = Number(tipoCambio);
    if (!parsed || parsed <= 0) {
      toast.error('Ingresa un tipo de cambio válido');
      return;
    }
    setIsSaving(true);
    try {
      await updateSettings({ tipoCambioUsdPen: parsed, tipoCambioUpdatedAt: new Date() });
      toast.success('Tipo de cambio guardado');
    } catch (error) {
      toast.error('Error al guardar');
      console.error('[CashLife] Error guardando tipo de cambio:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFetchAutoRate = async () => {
    setIsFetchingRate(true);
    try {
      const { rate, fetchedAt } = await fetchUsdToPenRateAction();
      setTipoCambio(rate.toFixed(4));
      await updateSettings({ tipoCambioUsdPen: rate, tipoCambioUpdatedAt: new Date(fetchedAt) });
      toast.success(`Tipo de cambio actualizado: S/ ${rate.toFixed(4)} por USD`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo consultar el tipo de cambio');
      console.error('[CashLife] Error consultando tipo de cambio:', error);
    } finally {
      setIsFetchingRate(false);
    }
  };

  const handleSavePaymentMethod = async () => {
    setIsSaving(true);
    try {
      await updateSettings({
        metodoPagoLabel: metodoPagoLabel || undefined,
        metodoPagoValor: metodoPagoValor || undefined,
      });
      toast.success('Método de cobro guardado');
    } catch (error) {
      toast.error('Error al guardar');
      console.error('[CashLife] Error guardando método de cobro:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">Personaliza tu experiencia</p>
      </div>

      {/* Método de cobro */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-4">
        <h2 className="font-bold flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Método de cobro
        </h2>
        <p className="text-xs text-muted-foreground -mt-2">
          Se agrega automáticamente a tus mensajes de cobranza por WhatsApp, para que te paguen sin tener que preguntarte a dónde.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-2">Método</label>
            <select
              value={metodoPagoLabel}
              onChange={(e) => setMetodoPagoLabel(e.target.value)}
              className="w-full rounded-lg border border-border bg-muted px-3 py-2"
            >
              <option value="">Sin definir</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Número / cuenta</label>
            <input
              type="text"
              value={metodoPagoValor}
              onChange={(e) => setMetodoPagoValor(e.target.value)}
              placeholder="987 654 321"
              className="w-full rounded-lg border border-border bg-muted px-3 py-2"
            />
          </div>
        </div>

        <button
          onClick={handleSavePaymentMethod}
          disabled={isSaving}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm disabled:opacity-50"
        >
          {isSaving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      {/* Tipo de cambio */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-4">
        <h2 className="font-bold flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Tipo de cambio (USD → PEN)
        </h2>
        <p className="text-xs text-muted-foreground -mt-2">
          Se usa como sugerencia al registrar deudas en dólares — cada deuda guarda su propio tipo de cambio del día en que la creaste, así que actualizar esto no cambia lo ya registrado.
        </p>

        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">1 USD equivale a</label>
            <input
              type="number"
              step="0.0001"
              min="0"
              value={tipoCambio}
              onChange={(e) => setTipoCambio(e.target.value)}
              placeholder="3.75"
              className="w-full rounded-lg border border-border bg-muted px-3 py-2"
            />
          </div>
          <button
            onClick={handleSaveExchangeRate}
            disabled={isSaving}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm disabled:opacity-50"
          >
            Guardar
          </button>
        </div>

        <button
          onClick={handleFetchAutoRate}
          disabled={isFetchingRate}
          className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg font-medium text-sm hover:bg-muted/80 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isFetchingRate ? 'animate-spin' : ''}`} />
          {isFetchingRate ? 'Consultando...' : 'Actualizar automático'}
        </button>

        {settings?.tipoCambioUpdatedAt && (
          <p className="text-xs text-muted-foreground">
            Última actualización: {formatRelativeDays(new Date(settings.tipoCambioUpdatedAt as unknown as string))}
          </p>
        )}
      </div>

      {/* Preferencias */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-4">
        <h2 className="font-bold flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Preferencias
        </h2>

        {/* Notificaciones */}
        <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Notificaciones</p>
              <p className="text-xs text-muted-foreground">Recibe alertas de transacciones</p>
            </div>
          </div>
          <button
            onClick={() => setNotificaciones(!notificaciones)}
            className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${
              notificaciones
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground'
            }`}
          >
            {notificaciones ? 'Activado' : 'Desactivado'}
          </button>
        </div>

        {/* Tema */}
        <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
          <div className="flex items-center gap-3">
            <Moon className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Tema Oscuro</p>
              <p className="text-xs text-muted-foreground">Tema actual: Oscuro</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-full font-medium text-sm">
            Activo
          </button>
        </div>
      </div>

      {/* Información */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-3">
        <h2 className="font-bold">Acerca de</h2>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>CashLife v1.0</p>
          <p>Controla tu dinero, vive mejor</p>
          <p className="text-xs">Última actualización: 2 de julio, 2026</p>
        </div>
      </div>

      {/* Cerrar sesión */}
      <button className="w-full px-4 py-3 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition-opacity font-bold flex items-center justify-center gap-2">
        <LogOut className="w-5 h-5" />
        Cerrar Sesión
      </button>
    </div>
  );
}
