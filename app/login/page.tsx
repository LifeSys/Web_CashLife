'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [needsTotp, setNeedsTotp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, verifyTotp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    try {
      setLoading(true);
      const result = await signIn(email, password);
      if (result.requiresTotp) {
        setNeedsTotp(true);
        return;
      }
      router.push('/dashboard');
    } catch (error) {
      console.error('[v0] Login error:', error);
      const message = error instanceof Error ? error.message : 'Error al iniciar sesión';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error('Ingresa el código de tu app de autenticación');
      return;
    }
    try {
      setLoading(true);
      await verifyTotp(code.trim());
      router.push('/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Código incorrecto';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-lg p-8 space-y-6">
          <div className="text-center">
            <img src="/cashlife-mark.png" alt="CashLife" className="w-16 h-16 mx-auto rounded-xl mb-3" />
            <h1 className="text-3xl font-bold text-foreground">CashLife</h1>
            <p className="text-sm text-muted-foreground mt-2">
              {needsTotp ? 'Verificación en dos pasos' : 'Controla tu dinero, vive mejor'}
            </p>
          </div>

          {!needsTotp ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium disabled:opacity-50"
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Ingresa el código de 6 dígitos de tu app de autenticación (Google Authenticator o similar), o uno de tus códigos de respaldo.
              </p>
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-foreground mb-2">
                  Código
                </label>
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary tracking-widest text-center text-lg"
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium disabled:opacity-50"
              >
                {loading ? 'Verificando...' : 'Verificar'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setNeedsTotp(false);
                  setCode('');
                }}
                className="w-full text-sm text-muted-foreground hover:text-foreground"
              >
                ← Volver
              </button>
            </form>
          )}

          {!needsTotp && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                ¿No tienes cuenta?{' '}
                <Link href="/signup" className="text-primary hover:underline font-medium">
                  Crear cuenta
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
