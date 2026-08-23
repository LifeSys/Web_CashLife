'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserProfileAction, initializeNewUserAction } from '@/lib/actions/user.actions';
import { User, AuthContextType } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * CashLife corre por ahora como sistema local (Postgres en este equipo,
 * sin login) con vista a migrar a la versión web más adelante. Mientras
 * tanto hay un único usuario fijo, creado automáticamente la primera vez
 * que se abre la app. Cuando se retome el login real, este archivo es el
 * único que hay que tocar.
 */
const LOCAL_USER_ID = 'local-user';
const LOCAL_USER_SEED = { email: 'local@cashlife.app', nombre: 'Usuario Local' };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        let profile = await getUserProfileAction(LOCAL_USER_ID);
        if (!profile) {
          await initializeNewUserAction(LOCAL_USER_ID, LOCAL_USER_SEED);
          profile = await getUserProfileAction(LOCAL_USER_ID);
        }
        if (!cancelled) setUser(profile);
      } catch (err) {
        console.error('[CashLife] Error iniciando el usuario local:', err);
        if (!cancelled) setError(err instanceof Error ? err : new Error('Error loading profile'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const notAvailable = async (): Promise<never> => {
    throw new Error('El login está deshabilitado mientras CashLife corre en modo local.');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp: notAvailable,
        signIn: notAvailable,
        signOut: notAvailable,
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
