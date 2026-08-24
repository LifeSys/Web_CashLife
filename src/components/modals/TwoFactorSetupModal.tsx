'use client';

import { useEffect, useState } from 'react';
import { X, ShieldCheck, Copy, Check } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';

interface TwoFactorSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type Step = 'loading' | 'scan' | 'backup-codes';

export function TwoFactorSetupModal({ isOpen, onClose, onSuccess }: TwoFactorSetupModalProps) {
  const [step, setStep] = useState<Step>('loading');
  const [secret, setSecret] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setStep('loading');
    setCode('');
    setBackupCodes([]);
    authService
      .startTotpEnrollment()
      .then(({ secret, qrDataUrl }) => {
        setSecret(secret);
        setQrDataUrl(qrDataUrl);
        setStep('scan');
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : 'Error al iniciar la activación');
        onClose();
      });
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code.trim())) {
      toast.error('Ingresa el código de 6 dígitos');
      return;
    }
    setIsSubmitting(true);
    try {
      const { backupCodes } = await authService.confirmTotpEnrollment({ secret, code: code.trim() });
      setBackupCodes(backupCodes);
      setStep('backup-codes');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Código incorrecto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('No se pudo copiar');
    }
  };

  const handleFinish = () => {
    toast.success('Verificación en dos pasos activada');
    onClose();
    onSuccess?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </span>
            <h2 className="text-lg font-bold">Verificación en dos pasos</h2>
          </div>
          {step !== 'backup-codes' && (
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground flex-shrink-0">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {step === 'loading' && <p className="text-sm text-muted-foreground py-6 text-center">Generando código...</p>}

        {step === 'scan' && (
          <form onSubmit={handleConfirm} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Escanea este código con Google Authenticator (o cualquier app de autenticación) y luego escribe el código de 6 dígitos que te muestre.
            </p>
            <div className="flex justify-center">
              {qrDataUrl && <img src={qrDataUrl} alt="Código QR" className="rounded-lg border border-border" width={200} height={200} />}
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">¿No puedes escanear? Ingresa este código a mano:</p>
              <button
                type="button"
                onClick={handleCopySecret}
                className="w-full flex items-center justify-between gap-2 rounded-lg border border-border bg-muted px-3 py-2 font-mono text-xs"
              >
                <span className="truncate">{secret}</span>
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" /> : <Copy className="w-3.5 h-3.5 flex-shrink-0" />}
              </button>
            </div>
            <div>
              <label className="text-sm font-medium">Código de 6 dígitos</label>
              <input
                type="text"
                inputMode="numeric"
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2 text-center text-lg tracking-widest"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-border px-4 py-2 font-medium hover:bg-muted">
                Cancelar
              </button>
              <button type="submit" disabled={isSubmitting} className="flex-1 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground disabled:opacity-50">
                {isSubmitting ? 'Verificando...' : 'Activar'}
              </button>
            </div>
          </form>
        )}

        {step === 'backup-codes' && (
          <div className="space-y-4">
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-amber-600 dark:text-amber-400 text-sm">
              <p className="font-medium">Guarda estos códigos de respaldo en un lugar seguro.</p>
              <p className="mt-1 text-xs">
                Sirven para entrar si pierdes tu celular. Cada uno funciona una sola vez. No se van a volver a mostrar.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono text-sm">
              {backupCodes.map((c) => (
                <div key={c} className="rounded-lg border border-border bg-muted px-3 py-2 text-center">
                  {c}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleFinish}
              className="w-full rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground"
            >
              Ya los guardé
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
