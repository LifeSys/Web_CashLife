# Guía de Uso - CashLife Design System 2.0

## Bienvenido a tu nuevo sistema de diseño premium

Este documento te guiará a través de todas las características, componentes y mejores prácticas para usar el nuevo CashLife Design System 2.0.

---

## Índice

1. [Inicio Rápido](#inicio-rápido)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Sistema de Tokens](#sistema-de-tokens)
4. [Componentes Disponibles](#componentes-disponibles)
5. [Ejemplos de Uso](#ejemplos-de-uso)
6. [Mejores Prácticas](#mejores-prácticas)
7. [Próximos Pasos](#próximos-pasos)

---

## Inicio Rápido

### Ver el proyecto en acción

1. **Instalar dependencias** (si no está hecho):
   ```bash
   npm install
   ```

2. **Ejecutar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

3. **Abrir en el navegador**:
   - Dashboard: `http://localhost:3000/dashboard`

### Ver cambios reflejados

El proyecto usa Hot Module Replacement (HMR), así que los cambios en archivos se reflejan automáticamente sin recargar manualmente.

---

## Estructura del Proyecto

### Componentes del Design System

```
src/components/design-system/
├── cards/
│   ├── PremiumCard.tsx          (Base para todas las tarjetas)
│   ├── DashboardMetric.tsx      (Métricas con animaciones)
│   ├── BalanceCard.tsx          (Saldos y balance)
│   ├── PaymentCard.tsx          (Estado de pagos)
│   ├── StatisticsCard.tsx       (Datos estadísticos)
│   ├── ContactCard.tsx
│   ├── DebtCard.tsx
│   ├── AccountCard.tsx
│   └── CreditCardView.tsx
│
├── feedback/
│   ├── LoadingState.tsx         (4 variantes de carga)
│   ├── ErrorState.tsx           (Estados de error)
│   ├── StatusBadge.tsx          (Badges de estado)
│   ├── ProgressBar.tsx          (Barras de progreso)
│   └── EmptyState.tsx           (Estados vacíos)
│
├── actions/
│   ├── QuickAction.tsx          (Botón de acción rápida)
│   ├── ActionGrid.tsx           (Grid de acciones)
│   └── ActionButton.tsx         (Botón genérico)
│
├── timeline/
│   ├── TimelineItem.tsx         (Item individual)
│   └── TimelineList.tsx         (Lista completa)
│
├── layout/
│   ├── SectionHeader.tsx        (Encabezado de sección)
│   ├── SectionDivider.tsx       (Divisor de sección)
│   └── ContainerCard.tsx        (Contenedor genérico)
│
├── specialized/
│   ├── FinancialAvatar.tsx      (Avatar con badge)
│   └── BottomSheet.tsx          (Modal desde abajo)
│
└── index.ts                     (Exportaciones centralizadas)
```

### Tokens de Diseño

```
src/styles/
└── design-tokens.css           (Sistema de tokens CSS)
```

Importado automáticamente en `app/globals.css`.

---

## Sistema de Tokens

### Espaciado (4px base grid)

```javascript
--spacing-xs: 4px          // Para detalles pequeños
--spacing-sm: 8px          // Padding pequeño
--spacing-md: 12px         // Padding estándar
--spacing-lg: 16px         // Padding normal
--spacing-xl: 24px         // Padding grande
--spacing-2xl: 32px        // Padding muy grande
--spacing-3xl: 48px        // Márgenes grandes
--spacing-4xl: 64px        // Márgenes muy grandes
```

### Border Radius

```javascript
--radius-xs: 4px
--radius-sm: 8px
--radius-md: 12px
--radius-lg: 16px
--radius-xl: 20px
--radius-2xl: 24px
--radius-full: 9999px
```

### Tipografía

**Font Families**:
- Display: Inter (headings)
- Body: Inter (body text)
- Mono: JetBrains Mono (numbers, code)

**Font Sizes** (10px a 48px)
**Font Weights** (300 a 700)
**Line Heights** (1.2 a 2)

### Sombras

```javascript
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1)
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25)
```

### Transiciones

```javascript
--transition-fast: 150ms
--transition-base: 200ms (recomendado)
--transition-slow: 300ms
--transition-slower: 500ms
```

---

## Componentes Disponibles

### Cards

#### PremiumCard
Base para todas las tarjetas. Soporta variantes: `elevated`, `outlined`, `filled`, `glass`.

```typescript
<PremiumCard variant="elevated" interactive onClick={handleClick}>
  Contenido aquí
</PremiumCard>
```

#### DashboardMetric
Métrica con icono, valor y cambio porcentual.

```typescript
<DashboardMetric
  label="Dinero Disponible"
  value="$1,234.56"
  icon={<Wallet />}
  variant="success"
  animated
  change={+12}
/>
```

#### BalanceCard
Tarjeta de saldo con gradiente y opción de ocultar.

```typescript
<BalanceCard
  label="Cuenta Corriente"
  amount="$5,000.00"
  icon="🏦"
  gradient="bg-gradient-to-br from-blue-500 to-cyan-600"
  hidden={false}
/>
```

#### PaymentCard
Tarjeta de pago con estado.

```typescript
<PaymentCard
  amount="$250.00"
  description="Pago de servicios"
  dueDate="15 de julio"
  status="overdue"
  action={{ label: 'Pagar', onClick: () => {} }}
/>
```

#### StatisticsCard
Tarjeta con datos estadísticos.

```typescript
<StatisticsCard
  title="Ingresos"
  variant="success"
  data={[{ value: '$5,000', label: 'Total' }]}
/>
```

### Feedback

#### LoadingState
Muestra estado de carga con 4 variantes.

```typescript
<LoadingState
  variant="spinner" // spinner, pulse, skeleton, dots
  text="Cargando..."
  size="md"
  fullScreen={false}
/>
```

#### ErrorState
Muestra error con acciones.

```typescript
<ErrorState
  title="Error al cargar datos"
  description="Intenta nuevamente"
  action={{ label: 'Reintentar', onClick: () => {} }}
/>
```

#### StatusBadge
Badge con estado.

```typescript
<StatusBadge
  status="active"
  label="En línea"
  showPulse
  variant="soft"
/>
```

#### ProgressBar
Barra de progreso.

```typescript
<ProgressBar
  percentage={65}
  label="Progreso"
  color="primary"
  showPercentage
  animated
/>
```

#### EmptyState
Estado vacío de una sección.

```typescript
<EmptyState
  icon="📭"
  title="Sin datos"
  description="No hay elementos"
  action={{ label: 'Crear', onClick: () => {} }}
/>
```

### Actions

#### ActionGrid
Grid de acciones rápidas.

```typescript
<ActionGrid
  actions={[
    { id: '1', icon: <Send />, label: 'Enviar', onClick: () => {} },
    { id: '2', icon: <Download />, label: 'Descargar', onClick: () => {} },
  ]}
  columns={4}
  gap="md"
/>
```

#### QuickAction
Botón de acción rápida.

```typescript
<QuickAction
  icon={<Send />}
  label="Transferir"
  onClick={() => {}}
  variant="primary"
  size="md"
/>
```

### Timeline

#### TimelineList
Lista de eventos.

```typescript
<TimelineList
  entries={[
    {
      id: '1',
      title: 'Evento 1',
      timestamp: 'Hace 2 horas',
      color: 'primary',
    },
  ]}
  direction="vertical"
/>
```

### Layout

#### SectionHeader
Encabezado de sección.

```typescript
<SectionHeader
  title="Mis Finanzas"
  subtitle="Resumen del mes"
/>
```

#### SectionDivider
Divisor entre secciones.

```typescript
<SectionDivider
  title="Separador"
  icon={<Wallet />}
/>
```

#### ContainerCard
Contenedor genérico.

```typescript
<ContainerCard
  padding="lg"
  shadow="md"
  bgColor="default"
>
  Contenido
</ContainerCard>
```

### Specialized

#### FinancialAvatar
Avatar con badge de estado.

```typescript
<FinancialAvatar
  initials="JD"
  amount="$500"
  status="active"
  size="md"
/>
```

#### BottomSheet
Modal desde el fondo.

```typescript
<BottomSheet
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Mi Modal"
  height="md"
>
  Contenido
</BottomSheet>
```

---

## Ejemplos de Uso

### Ejemplo 1: Dashboard Métrica

```typescript
import { DashboardMetric } from '@/components/design-system';
import { Wallet } from 'lucide-react';

export function FinancialSummary() {
  return (
    <DashboardMetric
      label="Saldo Disponible"
      value="$2,500.00"
      icon={<Wallet className="w-5 h-5" />}
      variant="primary"
      animated
      change={+15}
    />
  );
}
```

### Ejemplo 2: Acciones Rápidas

```typescript
import { ActionGrid } from '@/components/design-system';
import { Send, Download, Wallet } from 'lucide-react';

export function QuickActions() {
  return (
    <ActionGrid
      actions={[
        {
          id: 'transfer',
          icon: <Send className="w-5 h-5" />,
          label: 'Transferir',
          onClick: () => alert('Transferir'),
        },
        {
          id: 'deposit',
          icon: <Download className="w-5 h-5" />,
          label: 'Depositar',
          onClick: () => alert('Depositar'),
        },
        {
          id: 'balance',
          icon: <Wallet className="w-5 h-5" />,
          label: 'Ver Saldo',
          onClick: () => alert('Ver Saldo'),
        },
      ]}
      columns={3}
      gap="md"
    />
  );
}
```

### Ejemplo 3: Modal Premium

```typescript
import { useState } from 'react';
import { BottomSheet, ActionButton } from '@/components/design-system';

export function PaymentModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <ActionButton
        label="Pagar"
        onClick={() => setIsOpen(true)}
      />
      
      <BottomSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Realizar Pago"
        height="md"
      >
        <div className="space-y-4">
          <input placeholder="Monto" type="number" />
          <ActionButton
            label="Confirmar"
            onClick={() => setIsOpen(false)}
            fullWidth
          />
        </div>
      </BottomSheet>
    </>
  );
}
```

---

## Mejores Prácticas

### 1. Reutiliza componentes del Design System

**Bien:**
```typescript
import { PremiumCard, ActionButton } from '@/components/design-system';
```

**No hagas:**
```typescript
const customCard = <div className="bg-card rounded-lg p-6">...</div>
```

### 2. Usa animaciones con moderación

Todas las animaciones están en el CSS, no en JavaScript. Esto mejora performance.

```typescript
<DashboardMetric animated /> // Animación CSS interna
```

### 3. Mantén consistencia en espaciado

```typescript
// Usa las variables de tokens
<div className="p-6 gap-4">...</div>  // --spacing-xl, --spacing-lg

// No hagas
<div className="p-[24px] gap-[16px]">...</div>
```

### 4. Accesibilidad primero

Todos los componentes tienen ARIA attributes:
- `role="button"` en clickables
- `aria-disabled` en deshabilitados
- `aria-label` en elementos sin texto

### 5. Responsive design

```typescript
// Mobile-first
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
```

### 6. Paleta de colores

Usa las variantes predefinidas:
- `variant="primary"` (verde)
- `variant="success"` (verde clara)
- `variant="warning"` (ámbar)
- `variant="danger"` (rojo)
- `variant="info"` (azul)

---

## Próximos Pasos

### Fase 4: Rediseñar Pantallas Restantes

Las siguientes pantallas están listas para ser rediseñadas usando el nuevo sistema:

1. **Contactos** (`/dashboard/personas`)
   - Lista de contactos con FinancialAvatar
   - Búsqueda y filtros con ActionButton

2. **Cuentas** (`/dashboard/cuentas`)
   - Grilla de cuentas con AccountCard
   - Estadísticas con StatisticsCard

3. **Tarjetas de Crédito** (`/dashboard/tarjetas`)
   - Galería de tarjetas con CreditCardView
   - Uso disponible con ProgressBar

4. **Movimientos** (`/dashboard/movimientos`)
   - Timeline de transacciones con TimelineList
   - Filtros con ActionGrid

5. **Pagos Programados** (`/dashboard/pagos-programados`)
   - Lista de pagos con PaymentCard
   - Calendario de próximas fechas

6. **Reportes** (`/dashboard/reportes`)
   - Dashboard con StatisticsCard
   - Exportación de datos

7. **Configuración** (`/dashboard/configuracion`)
   - Formularios con ActionButton
   - Toggles y switches

### Cómo Rediseñar una Pantalla

1. **Importa componentes del DS**:
   ```typescript
   import { 
     DashboardMetric, 
     ActionGrid, 
     ContainerCard 
   } from '@/components/design-system';
   ```

2. **Estructura con SectionHeader**:
   ```typescript
   <SectionHeader title="Mi Sección" subtitle="Descripción" />
   ```

3. **Usa ContainerCard para agrupar**:
   ```typescript
   <ContainerCard padding="lg">
     {/* Contenido */}
   </ContainerCard>
   ```

4. **Feedback con LoadingState, ErrorState, EmptyState**

5. **Acciones con ActionGrid o ActionButton**

---

## Recursos Adicionales

- **Documentación de Tokens**: Ver `src/styles/design-tokens.css`
- **Especificación Completa**: Ver `SPEC_DISEÑO_CASHLIFE_2.0.md`
- **Resumen de Implementación**: Ver `RESUMEN_IMPLEMENTACION.md`

---

## Soporte y Contacto

Para problemas, sugerencias o mejoras:

1. Revisa los componentes existentes en `src/components/design-system`
2. Consulta los ejemplos en `app/dashboard/page.tsx`
3. Verifica los tokens en `src/styles/design-tokens.css`

---

**¡Felicidades! Ya tienes un sistema de diseño premium y profesional listo para usar.**

Ahora puedes:
- Rediseñar todas las pantallas fácilmente
- Mantener consistencia visual
- Escalar el proyecto sin problemas
- Crear componentes nuevos reutilizando el DS

¡A crear algo extraordinario con CashLife 2.0!

---

_Última actualización: 2026-07-06_
_CashLife Design System v2.0 - v0 by Vercel_
