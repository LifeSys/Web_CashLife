'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, LogOut, Bell, Moon, Sun, Laptop, Wallet, RefreshCw, DollarSign, MessageSquareText, RotateCcw, UserCircle, KeyRound, ShieldCheck, ShieldOff } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { authService } from '@/services/auth.service';
import { fetchUsdToPenRateAction } from '@/lib/actions/exchange-rate.actions';
import { TwoFactorSetupModal } from '@/components/modals/TwoFactorSetupModal';
import { DisableTwoFactorModal } from '@/components/modals/DisableTwoFactorModal';
import {
  MESSAGE_PLACEHOLDERS,
  DEFAULT_DEBT_TEMPLATE,
  DEFAULT_RENTAL_REMINDER_TEMPLATE,
  DEFAULT_RENTAL_DUE_TOMORROW_TEMPLATE,
  DEFAULT_RENTAL_DUE_TODAY_TEMPLATE,
} from '@/lib/whatsapp';
import { toast } from 'sonner';

const formatRelativeDays = (date: Date): string => {
  const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'hoy';
  if (days === 1) return 'ayer';
  return `hace ${days} días`;
};

const PAYMENT_METHODS = [
  'Yape',
  'Plin',
  'Transferencia BCP',
  'Transferencia BBVA',
  'Transferencia Interbank',
  'Transferencia Scotiabank',
  'Transferencia (otro banco)',
  'Tunki',
  'Agora',
  'Lukita',
  'PayPal',
  'Efectivo',
  'Otro',
] as const;

export default function ConfiguracionPage() {
  const router = useRouter();
  const { settings, updateSettings } = useSettings();
  const { user, signOut, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [metodoPagoLabel, setMetodoPagoLabel] = useState('');
  const [metodoPagoValor, setMetodoPagoValor] = useState('');
  const [tipoCambio, setTipoCambio] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingRate, setIsFetchingRate] = useState(false);
  const [isTogglingNotifications, setIsTogglingNotifications] = useState(false);
  const [msgDebt, setMsgDebt] = useState('');
  const [msgRentalReminder, setMsgRentalReminder] = useState('');
  const [msgRentalDueTomorrow, setMsgRentalDueTomorrow] = useState('');
  const [msgRentalDueToday, setMsgRentalDueToday] = useState('');
  const [isSavingMessages, setIsSavingMessages] = useState(false);

  // Perfil
  const [nombrePerfil, setNombrePerfil] = useState('');
  const [emailPerfil, setEmailPerfil] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Cambiar contraseña
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Verificación en dos pasos
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [show2FADisable, setShow2FADisable] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setMetodoPagoLabel(settings.metodoPagoLabel ?? '');
    setMetodoPagoValor(settings.metodoPagoValor ?? '');
    setTipoCambio(settings.tipoCambioUsdPen ? String(settings.tipoCambioUsdPen) : '');
    setMsgDebt(settings.msgDebtTemplate ?? DEFAULT_DEBT_TEMPLATE);
    setMsgRentalReminder(settings.msgRentalReminderTemplate ?? DEFAULT_RENTAL_REMINDER_TEMPLATE);
    setMsgRentalDueTomorrow(settings.msgRentalDueTomorrowTemplate ?? DEFAULT_RENTAL_DUE_TOMORROW_TEMPLATE);
    setMsgRentalDueToday(settings.msgRentalDueTodayTemplate ?? DEFAULT_RENTAL_DUE_TODAY_TEMPLATE);
  }, [settings]);

  useEffect(() => {
    if (!user) return;
    setNombrePerfil(user.nombre ?? '');
    setEmailPerfil(user.email ?? '');
  }, [user]);

  const notificaciones = settings?.notificaciones ?? true;

  const handleToggleNotifications = async () => {
    setIsTogglingNotifications(true);
    try {
      await updateSettings({ notificaciones: !notificaciones });
    } catch (error) {
      toast.error('Error al guardar la preferencia');
      console.error('[CashLife] Error toggling notifications:', error);
    } finally {
      setIsTogglingNotifications(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al cerrar sesión');
      console.error('[CashLife] Error cerrando sesión:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!nombrePerfil.trim() || !emailPerfil.trim()) {
      toast.error('Completa nombre y email');
      return;
    }
    setIsSavingProfile(true);
    try {
      await authService.updateProfile({ nombre: nombrePerfil.trim(), email: emailPerfil.trim() });
      await refreshUser();
      toast.success('Perfil actualizado');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar el perfil');
      console.error('[CashLife] Error guardando perfil:', error);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error('Completa los 3 campos');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('Las contraseñas nuevas no coinciden');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('La contraseña nueva debe tener al menos 6 caracteres');
      return;
    }
    setIsChangingPassword(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      toast.success('Contraseña actualizada');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al cambiar la contraseña');
      console.error('[CashLife] Error cambiando contraseña:', error);
    } finally {
      setIsChangingPassword(false);
    }
  };

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

  const handleSaveMessages = async () => {
    setIsSavingMessages(true);
    try {
      await updateSettings({
        msgDebtTemplate: msgDebt.trim() || undefined,
        msgRentalReminderTemplate: msgRentalReminder.trim() || undefined,
        msgRentalDueTomorrowTemplate: msgRentalDueTomorrow.trim() || undefined,
        msgRentalDueTodayTemplate: msgRentalDueToday.trim() || undefined,
      });
      toast.success('Mensajes guardados');
    } catch (error) {
      toast.error('Error al guardar');
      console.error('[CashLife] Error guardando plantillas de mensajes:', error);
    } finally {
      setIsSavingMessages(false);
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

      {/* Mi Perfil */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-4">
        <h2 className="font-bold flex items-center gap-2">
          <UserCircle className="w-5 h-5" />
          Mi Perfil
        </h2>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-2">Nombre completo</label>
            <input
              type="text"
              value={nombrePerfil}
              onChange={(e) => setNombrePerfil(e.target.value)}
              className="w-full rounded-lg border border-border bg-muted px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={emailPerfil}
              onChange={(e) => setEmailPerfil(e.target.value)}
              className="w-full rounded-lg border border-border bg-muted px-3 py-2"
            />
          </div>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={isSavingProfile}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm disabled:opacity-50"
        >
          {isSavingProfile ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      {/* Cambiar contraseña */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-4">
        <h2 className="font-bold flex items-center gap-2">
          <KeyRound className="w-5 h-5" />
          Cambiar contraseña
        </h2>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium mb-2">Contraseña actual</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-border bg-muted px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Contraseña nueva</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-border bg-muted px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Confirmar contraseña nueva</label>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-border bg-muted px-3 py-2"
            />
          </div>
        </div>

        <button
          onClick={handleChangePassword}
          disabled={isChangingPassword}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm disabled:opacity-50"
        >
          {isChangingPassword ? 'Cambiando...' : 'Cambiar contraseña'}
        </button>
      </div>

      {/* Verificación en dos pasos */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-4">
        <h2 className="font-bold flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" />
          Verificación en dos pasos
        </h2>
        <p className="text-xs text-muted-foreground -mt-2">
          Protege tu cuenta con un código extra de una app tipo Google Authenticator, además de tu contraseña. Es opcional — actívala si quieres.
        </p>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            {user?.totpEnabled ? (
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
            ) : (
              <ShieldOff className="w-5 h-5 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">{user?.totpEnabled ? 'Activada' : 'Desactivada'}</p>
              <p className="text-xs text-muted-foreground">
                {user?.totpEnabled ? 'Te va a pedir un código al iniciar sesión' : 'Solo tu contraseña protege la cuenta'}
              </p>
            </div>
          </div>
          {user?.totpEnabled ? (
            <button
              onClick={() => setShow2FADisable(true)}
              className="px-4 py-2 bg-destructive/10 text-destructive rounded-lg font-medium text-sm hover:bg-destructive/20"
            >
              Desactivar
            </button>
          ) : (
            <button
              onClick={() => setShow2FASetup(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90"
            >
              Activar
            </button>
          )}
        </div>
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

      {/* Personalizar mensajes */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-5">
        <div>
          <h2 className="font-bold flex items-center gap-2">
            <MessageSquareText className="w-5 h-5" />
            Personalizar mensajes
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Edita el texto que se manda por WhatsApp en cada tipo de recordatorio. Usa estas variables donde quieras — se reemplazan solas:
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {MESSAGE_PLACEHOLDERS.map((p) => (
              <span key={p.token} title={p.description} className="px-2 py-0.5 rounded-md bg-muted text-xs font-mono">
                {p.token}
              </span>
            ))}
          </div>
        </div>

        <MessageTemplateField
          label="Cuenta por cobrar (te deben dinero)"
          value={msgDebt}
          onChange={setMsgDebt}
          onReset={() => setMsgDebt(DEFAULT_DEBT_TEMPLATE)}
        />
        <MessageTemplateField
          label="Recordatorio de renovación (con días de anticipación)"
          value={msgRentalReminder}
          onChange={setMsgRentalReminder}
          onReset={() => setMsgRentalReminder(DEFAULT_RENTAL_REMINDER_TEMPLATE)}
        />
        <MessageTemplateField
          label="Vence mañana (urgente)"
          value={msgRentalDueTomorrow}
          onChange={setMsgRentalDueTomorrow}
          onReset={() => setMsgRentalDueTomorrow(DEFAULT_RENTAL_DUE_TOMORROW_TEMPLATE)}
        />
        <MessageTemplateField
          label="Vence hoy (último día)"
          value={msgRentalDueToday}
          onChange={setMsgRentalDueToday}
          onReset={() => setMsgRentalDueToday(DEFAULT_RENTAL_DUE_TODAY_TEMPLATE)}
        />

        <button
          onClick={handleSaveMessages}
          disabled={isSavingMessages}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm disabled:opacity-50"
        >
          {isSavingMessages ? 'Guardando...' : 'Guardar mensajes'}
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
            onClick={handleToggleNotifications}
            disabled={isTogglingNotifications}
            className={`px-4 py-2 rounded-full font-medium text-sm transition-colors disabled:opacity-50 ${
              notificaciones
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground'
            }`}
          >
            {notificaciones ? 'Activado' : 'Desactivado'}
          </button>
        </div>

        {/* Tema */}
        <div className="py-3">
          <div className="flex items-center gap-3 mb-3">
            <Moon className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Tema</p>
              <p className="text-xs text-muted-foreground">Elige cómo se ve CashLife</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'claro' as const, label: 'Claro', icon: Sun },
              { value: 'oscuro' as const, label: 'Oscuro', icon: Moon },
              { value: 'sistema' as const, label: 'Sistema', icon: Laptop },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={`flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-sm font-medium transition-colors ${
                  theme === option.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <option.icon className="w-4 h-4" />
                {option.label}
              </button>
            ))}
          </div>
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
      <button
        onClick={handleSignOut}
        className="w-full px-4 py-3 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition-opacity font-bold flex items-center justify-center gap-2"
      >
        <LogOut className="w-5 h-5" />
        Cerrar Sesión
      </button>

      <TwoFactorSetupModal
        isOpen={show2FASetup}
        onClose={() => setShow2FASetup(false)}
        onSuccess={() => refreshUser()}
      />
      <DisableTwoFactorModal
        isOpen={show2FADisable}
        onClose={() => setShow2FADisable(false)}
        onSuccess={() => refreshUser()}
      />
    </div>
  );
}

interface MessageTemplateFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onReset: () => void;
}

function MessageTemplateField({ label, value, onChange, onReset }: MessageTemplateFieldProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium">{label}</label>
        <button
          type="button"
          onClick={onReset}
          title="Restaurar el texto por defecto"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="w-3 h-3" /> Restaurar
        </button>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm"
      />
    </div>
  );
}
