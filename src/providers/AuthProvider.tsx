'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSessionUserAction, signInAction, signUpAction, signOutAction } from '@/lib/actions/auth.actions';
import { User, AuthContextType } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Login real con email/contraseña (cookie de sesión firmada — ver
 * src/lib/auth/session.ts). Antes de esto CashLife entraba solo con un
 * usuario local fijo sin contraseña; ese modo quedó reemplazado porque la
 * app puede exponerse fuera de este equipo (ej. un túnel para entrar desde
 * el celular), y sin login cualquiera con el link veía y editaba los datos.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const profile = await getSessionUserAction();
        if (!cancelled) setUser(profile);
      } catch (err) {
        console.error('[CashLife] Error cargando la sesión:', err);
        if (!cancelled) setError(err instanceof Error ? err : new Error('Error loading session'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const profile = await signInAction({ email, password });
    setUser(profile);
  }, []);

  const signUp = useCallback(async (email: string, password: string, nombre?: string) => {
    const profile = await signUpAction({ email, password, nombre: nombre ?? email.split('@')[0] });
    setUser(profile);
  }, []);

  const signOut = useCallback(async () => {
    await signOutAction();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signOut,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    // During HMR or if AuthProvider is not present, return a default context
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.warn('[AuthProvider] useAuth called outside of AuthProvider');
      return {
        user: null,
        loading: true,
        error: undefined,
        signUp: async () => {},
        signIn: async () => {},
        signOut: async () => {},
      } as AuthContextType;
    }
    throw new Error('useAuth debe estar dentro de AuthProvider');
  }
  return context;
}
