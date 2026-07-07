'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { signUp as firebaseSignUp, signIn as firebaseSignIn, signOutUser, onAuthStateChanged } from '@/lib/firebase/auth';
import { UserRepository } from '@/lib/repositories/user.repository';
import { User, AuthContextType } from '@/types';
import { cleanupUserData } from '@/lib/scripts/cleanup-corrupted-data';

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const userRepository = new UserRepository();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();

  // Mantener sesión iniciada automáticamente
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          const userProfile = await userRepository.getProfile(firebaseUser.uid);
          if (userProfile) {
            setUser(userProfile);
            // Run cleanup on first load to fix any corrupted data
            try {
              await cleanupUserData(firebaseUser.uid);
            } catch (cleanupErr) {
              console.warn('[CashLife] Non-critical cleanup error:', cleanupErr);
            }
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('[CashLife] Error loading user profile:', err);
        setError(err instanceof Error ? err : new Error('Error loading profile'));
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, nombre: string): Promise<void> => {
    try {
      setError(undefined);
      setLoading(true);

      // 1. Crear usuario en Firebase Auth
      const firebaseUser = await firebaseSignUp(email, password);

      // 2. Inicializar usuario en Firestore (perfil + datos por defecto)
      await userRepository.initializeNewUser(firebaseUser.uid, { email, nombre });

      // 3. Cargar perfil
      const userProfile = await userRepository.getProfile(firebaseUser.uid);
      if (userProfile) {
        setUser(userProfile);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al registrarse');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setError(undefined);
      setLoading(true);
      await firebaseSignIn(email, password);
      // El usuario se carga automáticamente vía onAuthStateChanged
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al iniciar sesión');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setError(undefined);
      setLoading(true);
      await signOutUser();
      setUser(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al cerrar sesión');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, error }}>
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
