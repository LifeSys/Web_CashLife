'use client';

import { usePeople } from '@/hooks/usePeople';
import { Users } from 'lucide-react';

export default function PersonasPage() {
  const { personas } = usePeople();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value);
  };

  const deudores = personas.filter(p => p.tipoDeuda === 'PRESTADO' && p.deuda > 0);
  const prestamistas = personas.filter(p => p.tipoDeuda === 'PRESTAMISTA' && p.deuda > 0);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Personas</h1>
        <p className="text-muted-foreground">Gestiona préstamos y deudas</p>
      </div>

      {/* Deudores */}
      {deudores.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-red-500">Te deben dinero</h2>
          <div className="space-y-2">
            {deudores.map(persona => (
              <div
                key={persona.id}
                className="bg-card border border-border rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/10 rounded-full">
                    <Users className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-bold">{persona.nombre}</h3>
                    <p className="text-xs text-muted-foreground">Deuda pendiente</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-red-500">{formatCurrency(persona.deuda)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prestamistas */}
      {prestamistas.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-green-500">Tú debes dinero</h2>
          <div className="space-y-2">
            {prestamistas.map(persona => (
              <div
                key={persona.id}
                className="bg-card border border-border rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-full">
                    <Users className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-bold">{persona.nombre}</h3>
                    <p className="text-xs text-muted-foreground">Adeudado</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-green-500">{formatCurrency(persona.deuda)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {deudores.length === 0 && prestamistas.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Sin préstamos registrados</p>
        </div>
      )}
    </div>
  );
}
