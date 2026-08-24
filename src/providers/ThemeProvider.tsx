'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSettings } from '@/hooks/useSettings';
import type { Settings } from '@/types';

export type Theme = Settings['tema'];

const THEME_STORAGE_KEY = 'cashlife-theme';

interface ThemeContextType {
  /** Preferencia elegida: 'claro' | 'oscuro' | 'sistema'. */
  theme: Theme;
  /** Cómo se ve ahora mismo en pantalla ('sistema' se resuelve a 'claro' u 'oscuro' según el SO). */
  resolvedTheme: 'claro' | 'oscuro';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyThemeClass(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove('dark', 'light');
  if (theme === 'oscuro') {
    root.classList.add('dark');
  } else if (theme === 'claro') {
    root.classList.add('light');
  }
  // 'sistema': no se agrega ninguna clase — el CSS ya tiene un
  // @media (prefers-color-scheme: dark) que cubre ese caso solo.
}

function getSystemPrefersDark(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Aplica el tema (claro/oscuro/según sistema) agregando o quitando las
 * clases `.dark`/`.light` en `<html>` — el resto lo resuelve el CSS ya
 * existente en globals.css. Se guarda en localStorage para que un script
 * inline en <head> (ver app/layout.tsx) lo pueda aplicar ANTES del primer
 * render y evitar el parpadeo del tema equivocado; y en Settings (base de
 * datos) para que se recuerde entre dispositivos.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings, updateSettings } = useSettings();
  const [theme, setThemeState] = useState<Theme>('oscuro');
  const [systemPrefersDark, setSystemPrefersDark] = useState(getSystemPrefersDark);

  // Al montar: usa lo que ya haya en localStorage (mismo valor que aplicó
  // el script inline) para no pisar la elección del usuario con el
  // default mientras Settings todavía está cargando desde el servidor.
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? (localStorage.getItem(THEME_STORAGE_KEY) as Theme | null) : null;
    if (stored === 'claro' || stored === 'oscuro' || stored === 'sistema') {
      setThemeState(stored);
    }
  }, []);

  // Cuando Settings carga (o cambia desde otro dispositivo), sincroniza.
  useEffect(() => {
    if (settings?.tema) {
      setThemeState(settings.tema);
      localStorage.setItem(THEME_STORAGE_KEY, settings.tema);
    }
  }, [settings?.tema]);

  useEffect(() => {
    applyThemeClass(theme);
  }, [theme]);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const setTheme = useCallback(
    (next: Theme) => {
      setThemeState(next);
      localStorage.setItem(THEME_STORAGE_KEY, next);
      applyThemeClass(next);
      updateSettings({ tema: next }).catch((err) => console.error('[CashLife] Error guardando el tema:', err));
    },
    [updateSettings]
  );

  const resolvedTheme: 'claro' | 'oscuro' = theme === 'sistema' ? (systemPrefersDark ? 'oscuro' : 'claro') : theme;

  return <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme debe estar dentro de ThemeProvider');
  return context;
}
