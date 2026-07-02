'use client';

import { useState } from 'react';
import { Settings, LogOut, Bell, Moon } from 'lucide-react';

export default function ConfiguracionPage() {
  const [notificaciones, setNotificaciones] = useState(true);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">Personaliza tu experiencia</p>
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
