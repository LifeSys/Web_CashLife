# Guía de Eventos Financieros

## Arquitectura de Eventos

CashLife ahora implementa un sistema basado en **Eventos Financieros** que mapean las acciones del usuario en lenguaje natural a transacciones y obligaciones.

### Tres Capas

```
Eventos Financieros (UI)
        ↓
Financial Engine (Orquestación)
        ↓
Transacciones + Obligaciones (BD)
```

## Uso Rápido

### 1. Usar EventForm en una página

```tsx
'use client';

import { useState } from 'react';
import { EventFormModal } from '@/components/events/EventFormModal';
import { CategoriaEvento } from '@/types/EventTypes';

export function MiPaginaFinanzas() {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <button onClick={() => setAbierto(true)}>
        Registrar Evento
      </button>

      {abierto && (
        <div className="fixed inset-0 bg-black/50 p-4 flex items-center justify-center">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <EventFormModal 
              onClose={() => setAbierto(false)}
              categoriaInicial={CategoriaEvento.MOVIMIENTO}
            />
          </div>
        </div>
      )}
    </>
  );
}
```

### 2. Procesar un evento manualmente

```tsx
import { EventBuilder } from '@/utils/EventBuilder';
import { financialEngine } from '@/services/financial-engine.service';
import { useAuth } from '@/providers/AuthProvider';

export function MiComponente() {
  const { user } = useAuth();

  const registrarGasto = async () => {
    try {
      // Crear evento con validación
      const evento = EventBuilder.crearGasto(
        100,                    // monto
        'cuenta_123',           // cuentaId
        'categoria_456',        // categoriaId
        'Almuerzo en la oficina', // descripción
        new Date(),             // fecha
        'Pago a restaurante'    // notas (opcional)
      );

      // Procesar a través del engine
      await financialEngine.procesarEvento(user!.uid, evento);
      console.log('Evento procesado exitosamente');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return <button onClick={registrarGasto}>Registrar Gasto</button>;
}
```

### 3. Usar el hook useFinancialEvents

```tsx
import { useFinancialEvents } from '@/hooks/useFinancialEvents';
import { useAuth } from '@/providers/AuthProvider';

export function MiComponente() {
  const { user } = useAuth();
  const { procesarEvento, loading, error } = useFinancialEvents({
    onSuccess: (evento) => console.log('Éxito:', evento),
    onError: (error) => console.error('Error:', error),
  });

  const registrarPrestamo = async () => {
    if (!user?.uid) return;
    
    try {
      const evento = EventBuilder.crearPrestamo(
        5000,                  // monto
        'persona_789',         // personaId
        'cuenta_123',          // cuentaId
        'Préstamo para viaje',
        new Date(),
        new Date('2024-12-31'), // fecha de vencimiento
      );

      await procesarEvento(user.uid, evento);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <button onClick={registrarPrestamo} disabled={loading}>
      {loading ? 'Procesando...' : 'Prestar Dinero'}
    </button>
  );
}
```

## Tipos de Eventos

### Movimiento de Dinero
- **GASTO**: Registra dinero que salió
- **INGRESO**: Registra dinero que entró
- **TRANSFERENCIA**: Dinero entre cuentas propias

### Líneas de Crédito
- **CARGO_TARJETA**: Compra con tarjeta
- **PAGO_TARJETA**: Pago a tarjeta

### Personas y Obligaciones
- **PRESTAMO**: Prestar dinero
- **DEUDA_RECIBIDA**: Recibir préstamo
- **COBRANZA**: Cobrar préstamo anterior
- **PAGO**: Pagar obligación anterior
- **OBLIGACION**: Crear obligación (sin transacción)
- **CUENTA_COBRAR**: Crear cuenta por cobrar

### Suscripciones
- **PAGO_PROGRAMADO**: Pago de suscripción

## Componentes Principales

### EventForm
Formulario inteligente con campos contextuales.

```tsx
import { EventForm } from '@/components/events/EventForm';

<EventForm 
  onClose={handleClose}
  categoriaInicial={CategoriaEvento.MOVIMIENTO}
/>
```

**Props:**
- `onClose(): void` - Callback cuando se cierra
- `categoriaInicial?: CategoriaEvento` - Categoría inicial

### EventFormModal
Wrapper que añade estilos de modal.

```tsx
import { EventFormModal } from '@/components/events/EventFormModal';

<EventFormModal 
  onClose={handleClose}
  categoriaInicial={CategoriaEvento.PERSONAS}
/>
```

## Validación

EventBuilder valida automáticamente:
- ✓ Montos positivos
- ✓ Fechas no futuras
- ✓ IDs válidos
- ✓ Descripciones no vacías
- ✓ Fechas de vencimiento >= fecha del evento

```tsx
try {
  EventBuilder.crearGasto(-100, ...); // Lanza error
} catch (error) {
  console.error(error.message); // "Monto debe ser un número positivo"
}
```

## Financial Engine

El `procesarEvento()` orquesta todo:

```
evento → tipo específico → validación → operación financiera
                                               ↓
                                   Transacción creada
                                   Obligación creada
                                   Saldo actualizado
                                   Evento logged
```

Cada tipo de evento puede generar múltiples movimientos:

```
EventoPrestamo
  ├─ Transaction (LOAN)
  └─ ReceivableDebt
  
EventoCobranza
  ├─ ReceivablePayment
  ├─ Transaction (INCOME)
  └─ Actualiza ReceivableDebt.pendingBalance
```

## Logging y Debugging

EventLogger registra automáticamente todo:

```tsx
import { eventLogger } from '@/services/event-logger.service';

// Ver últimos 10 eventos
console.log(eventLogger.getLogs(10));

// Ver eventos de un usuario
console.log(eventLogger.getLogsPorUsuario(uid, 20));

// Ver resumen
console.log(eventLogger.getResumen());
// {
//   totalEventos: 45,
//   exitosos: 43,
//   fallidos: 2,
//   porTipo: { gasto: 20, ingreso: 15, ... },
//   montoTotal: 15000
// }
```

## Migración de MovementForm antiguo

El componente antiguo `MovementForm` sigue funcionando. Para migrar:

1. Reemplaza `<MovementForm onClose={...} />` con `<EventFormModal onClose={...} />`
2. Si necesitas categoría inicial: `<EventFormModal onClose={...} categoriaInicial={CategoriaEvento.MOVIMIENTO} />`
3. Los hooks existentes siguen siendo compatibles

## Estructura de Archivos

```
src/
├── types/
│   └── EventTypes.ts              # Definición de eventos
├── utils/
│   └── EventBuilder.ts            # Factory para crear eventos
├── services/
│   ├── financial-engine.service.ts # Orquestación principal
│   └── event-logger.service.ts    # Auditoría
├── components/events/
│   ├── EventForm.tsx              # Formulario principal
│   └── EventFormModal.tsx         # Wrapper con modal
└── hooks/
    └── useFinancialEvents.ts      # Hook para procesar eventos
```

## Errores Comunes

### "Monto debe ser un número positivo"
```tsx
// ❌ Incorrecto
EventBuilder.crearGasto(0, ...);   // Falla: 0 no es positivo
EventBuilder.crearGasto(-100, ...); // Falla: negativo

// ✅ Correcto
EventBuilder.crearGasto(100, ...);
```

### "La fecha no puede ser futura"
```tsx
// ❌ Incorrecto
const mañana = new Date();
mañana.setDate(mañana.getDate() + 1);
EventBuilder.crearGasto(100, 'cuenta', 'cat', 'desc', mañana, ...); // Falla

// ✅ Correcto
EventBuilder.crearGasto(100, 'cuenta', 'cat', 'desc', new Date(), ...);
```

### "Las cuentas no pueden ser iguales"
```tsx
// ❌ Incorrecto
EventBuilder.crearTransferencia(100, 'cuenta_1', 'cuenta_1', ...); // Falla

// ✅ Correcto
EventBuilder.crearTransferencia(100, 'cuenta_1', 'cuenta_2', ...);
```

## Próximas Fases (TODO)

- [ ] Responsive mobile completo para EventForm
- [ ] Historial de eventos en dashboard
- [ ] Exportar/importar eventos
- [ ] Undo/Redo de eventos
- [ ] Notificaciones por evento
- [ ] Categorización automática
- [ ] Detección de duplicados
