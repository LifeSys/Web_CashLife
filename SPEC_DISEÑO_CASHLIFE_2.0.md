# CashLife 2.0 – Especificación de Diseño Premium Fintech

## 📋 Contexto y Rol

### La Visión
CashLife es una **plataforma completa de gestión financiera personal**, no un simple rastreador de gastos. Debe competir visualmente con:
- **Nubank** (simplicidad elegante, microcopy brillante)
- **Revolut** (velocidad, animaciones suaves, diseño moderno)
- **Monzo** (tarjetas hermosas, experiencia nativa)
- **Apple Wallet** (minimalismo premium, jerarquía clara)
- **Arc Browser** (espacios en blanco, tipografía excepcional)

### Tu Rol
Eres simultaneamente:
1. **Senior Product Designer** – Define flujos, información prioritaria, arquitectura de info
2. **Senior UX Designer** – Crea interacciones naturales, accesibilidad, patrones consistentes
3. **Senior Frontend Engineer** – Implementa componentes reutilizables, performance, animaciones

---

## 🎨 Sistema de Diseño

### Paleta de Colores (4 colores máximo)
```
Primary:    #1F2937 (Gris profundo - base)
Accent:     #3B82F6 (Azul brillante - acciones)
Success:    #10B981 (Verde - ingresos, éxito)
Danger:     #EF4444 (Rojo - gastos, alertas)
Warning:    #F59E0B (Ámbar - advertencias)
Neutral:    #F9FAFB, #E5E7EB, #D1D5DB, #9CA3AF (escala)
```

**Regla de oro:** Fondo blanco puro o ligeramente grisáceo. Texto oscuro. Máxima legibilidad.

### Tipografía (2 familias máximo)
```
Headings:    Inter Bold (600+) o sistema nativo
             - H1: 32px / 1.2 línea
             - H2: 24px / 1.3 línea
             - H3: 20px / 1.4 línea
             - Label: 14px / 1.5 línea

Body:        Inter Regular (400) o sistema nativo
             - Desktop body: 16px / 1.6 línea
             - Mobile body: 16px / 1.6 línea (no más pequeño)
             - Caption: 12px / 1.5 línea
```

**Principio:** Tipografía monumental para números de dinero. Espacios en blanco generosos.

### Espaciado (Escala de 4px)
```
xs:  4px    (separadores mínimos)
sm:  8px    (padding interior botones pequeños)
md:  16px   (padding base, gap estándar)
lg:  24px   (separación entre secciones)
xl:  32px   (separación principal)
xxl: 48px   (espacios verticales grandes)
```

### Sombras y Elevación
```
Elevation 1:  0 1px 2px rgba(0,0,0,0.05)      (suave hover)
Elevation 2:  0 4px 6px rgba(0,0,0,0.1)       (tarjetas)
Elevation 3:  0 10px 15px rgba(0,0,0,0.15)    (modales)
Elevation 4:  0 20px 25px rgba(0,0,0,0.2)     (FAB, overlays)
```

### Radios (Redondeado moderno)
```
none:       0px     (números puros)
sm:         4px     (inputs, badges)
md:         8px     (botones, tarjetas pequeñas)
lg:         12px    (tarjetas principales)
full:       9999px  (avatares, pills)
```

---

## 📐 Principios de Diseño

### 1. **Mobile First = Verdad Absoluta**
- Diseña para iPhone 14 Pro (390px) como referencia
- Todo debe ser tocable (min 48px × 48px)
- Una columna, scroll vertical
- Márgenes: 16px a ambos lados en mobile
- Márgenes: 24px en tablet, 32px en desktop

### 2. **Jerarquía Clara**
- Los números grandes son protagonistas
- Contexto secundario es gris claro
- Una acción primaria por pantalla
- Máximo 3 elementos en el fold inicial

### 3. **Minimalismo Financiero**
- Elimina TODO lo que no agregue información
- Sin tablas (nunca)
- Sin listas densas (máximo 6 items antes de scroll)
- Sin decoraciones innecesarias

### 4. **Premium = Espacio + Animaciones Suaves**
- Espacios en blanco generosos (respira)
- Transiciones 200-300ms (no más rápido, se ve barato)
- Spring curves para movimiento natural
- Nada brusco o mecánico

### 5. **Información Contextual Inteligente**
- Cada pantalla responde 1-2 preguntas clave
- Los números principales siempre son visibles
- Status badges comunican estados
- Microcopy brillante (no "Error", sino "Transacción pendiente de aprobación")

---

## 🎯 Arquitectura de Componentes Reutilizables

### Tarjetas Base (Todos los datos en tarjetas)

#### **FinancialCard** (componente universal)
```
Propiedades:
- icon: ReactNode
- title: string
- value: number (formateado con moneda)
- subtitle?: string
- status?: 'positive' | 'negative' | 'neutral'
- actionButtons?: Array<{label, action}>
- trend?: {value: number, direction: 'up' | 'down'}
- bgColor?: 'primary' | 'accent' | 'success' | 'danger'

Estructura:
┌─────────────────────────┐
│ Icon  Title      Badge  │
│ $1,234.56              │
│ Cambio: +$50 (↑15%)   │
│ [Acción] [Más...]      │
└─────────────────────────┘
```

#### **DashboardMetric** (KPI resumido)
```
Mínimo visual:
- Un número grande
- Una etiqueta
- Opcional: trend

Uso: Resumen de 4-6 KPIs en dashboard
```

#### **AccountCard** (cuenta/billetera)
```
Contiene:
- Icon del banco + color corporativo
- Balance grande
- Moneda
- Últimos 2-3 movimientos
- [Ver más]

Interacción: Tap → abre detailed view
```

#### **ContactCard** (persona/acreedor/deudor)
```
Estructura:
┌─────────────────────────┐
│ 👤 Juan García          │
│ Debes: $500 | Te debe: $0│
│ Último: -$200 hace 3d   │
│ [Pagar] [Cobrar] [...]  │
└─────────────────────────┘
```

#### **CreditCardView** (tarjeta de crédito realista)
```
Visual premium:
- Tarjeta grande (full width, aspect 16:9)
- Degradado sutil (marca del banco)
- Números brillantes
- Holograma simulado

Datos visibles:
- Nombre del titular
- Últimos 4 dígitos
- Fecha vencimiento

Tap → detalle de uso, límite, próximo pago
```

#### **DebtCard** / **PayableCard** (deuda a pagar)
```
┌──────────────────────────┐
│ 🏠 Arriendo              │
│ $800.000 / $800.000     │
│ Vence: 15 de Julio     │
│ [Pagar ahora] [Más]     │
│ ████████░░ 100%        │
└──────────────────────────┘
```

#### **TimelineItem** (movimiento)
```
Agrupa por fecha:
Hoy
├─ [Icon] Compra en Starbucks      -$5.20
├─ [Icon] Transferencia a Juan     -$200
Ayer
├─ [Icon] Depósito nómina          +$2,000
```

#### **StatusBadge** (etiquetas de estado)
```
Estados:
- Pending: ⏳ Pendiente      (amarillo)
- Confirmed: ✓ Confirmado   (gris)
- Paid: ✓ Pagado            (verde)
- Overdue: ⚠ Vencido        (rojo)

Tamaño: pequeño, compacto, con ícono
```

#### **EmptyState** (sin datos)
```
┌──────────────────────┐
│      📭               │
│   No hay datos       │
│                      │
│  [Crear primero]     │
└──────────────────────┘
```

#### **LoadingState** (esqueleto)
```
Usa skeleton cards, no spinners:
- Pulso suave 1.5s
- Misma altura que contenido real
- Background: gradiente sutil
```

#### **ProgressBar** (barra de progreso financiero)
```
Casos:
- Uso de límite de crédito: color según %
  0-50%:   Verde
  51-80%:  Ámbar
  81-100%: Rojo

- Deuda pagada: verde gradualmente
```

### Inputs y Formularios (Modernos, no clásicos)

#### **FinancialInput**
```
Estructura:
┌──────────────────────┐
│ Cantidad             │
│ $ ___________        │
│ 💡 Sugerencia        │
└──────────────────────┘

Principios:
- Label siempre visible (floating no)
- Currency symbol integrado
- Sugerencia inteligente si aplica
- Input grande: 48px altura mínimo
```

#### **SelectInput** (dropdown mejorado)
```
Móvil: Bottom sheet con opciones
Desktop: Dropdown elegante

Nunca: <select> nativo
```

#### **DatePicker**
```
Móvil: calendario nativo
Desktop: date input con inline calendar

Visualización: "Mañana", "Próxima semana", etc.
```

### Botones y Acciones

#### **PrimaryButton** (acción principal)
```
- Fondo: accent (#3B82F6)
- Texto: blanco
- Padding: 12px 24px (móvil), 14px 28px (desktop)
- Radio: 8px
- Altura mínima: 48px
- Ancho: full en móvil, auto en desktop
- Hover: sombra elevation 2
- Active: escala 0.98
```

#### **SecondaryButton** (acciones secundarias)
```
- Fondo: gris claro #F3F4F6
- Texto: oscuro
- Mismo tamaño que primary
- Hover: fondo más oscuro
```

#### **IconButton** (acciones compactas)
```
- Círculo 44px × 44px
- Icon centrado
- Hover: fondo sutil
- Uso: hamburger, cerrar, opciones
```

#### **FloatingActionButton** (FAB expandible)
```
Desktop:
┌──────────────┐
│  + Crear     │
│ ┌─────────┐  │
│ │➕ Gasto │  │
│ │➕ Ingreso│  │
│ │➕ Trans.│  │
│ └─────────┘  │
└──────────────┘

Móvil: FAB + bottom sheet con opciones

Animación: Rotate icon + expand container
```

---

## 📱 Pantallas Principales

### 1. **Dashboard - La Joya de la Corona**

**Objetivo:** Responder en 2 segundos:
- ¿Cuánto dinero tengo?
- ¿Cuánto me deben?
- ¿Cuánto debo?
- ¿Qué pagar hoy?

**Layout (Mobile):**
```
┌─────────────────────────┐
│ Hola, Juan              │  ← Saludo + fecha
│ Lunes, 15 de Julio      │
└─────────────────────────┘
                           ← lg gap
┌─────────────────────────┐
│  RESUMEN FINANCIERO     │  ← H3 gris suave
│                         │
│  Tu Balance:            │
│  $5,234.56             │  ← Número ENORME
│                         │
│  Debes:      | Te deben:│
│  $800        | $2,000   │  ← Comparables
└─────────────────────────┘
                           ← md gap
┌─────────────────────────┐
│ ACCIONES RÁPIDAS        │  ← H3
│ ┌──────┬──────┬────────┐ │
│ │ ➕   │ ➕   │ ➕     │ │
│ │Gasto │Ingr  │Trans   │ │
│ ├──────┼──────┼────────┤ │
│ │ ➕   │ ➕   │ ➕     │ │
│ │Présta│Cobro │Pago CC │ │
│ └──────┴──────┴────────┘ │
└─────────────────────────┘
                           ← md gap
┌─────────────────────────┐
│ PROXIMOS PAGOS          │  ← H3
│ ┌─────────────────────┐ │
│ │ 🏠 Arriendo        │ │
│ │ $800 • Vence hoy   │ │  ← URGENTE
│ │ [Pagar]            │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ ☎️ Teléfono        │ │
│ │ $45 • En 3 días    │ │
│ └─────────────────────┘ │
└─────────────────────────┘
                           ← md gap
┌─────────────────────────┐
│ ACTIVIDAD RECIENTE      │  ← H3
│ Hoy                     │
│ ├─ 🛒 Starbucks  -$5.20│
│ ├─ 💸 Transfer   -$200 │
│ Ayer                    │
│ ├─ 💰 Salario   +$2000 │
│ [Ver más]               │
└─────────────────────────┘
                           ← md gap
┌─────────────────────────┐
│ CONTACTOS FRECUENTES    │  ← H3
│ ┌──────────────────────┐│
│ │ 👤 Juan García       ││
│ │ Te debe: $500        ││
│ │ [Cobrar] [Mensaje]   ││
│ └──────────────────────┘│
│ ┌──────────────────────┐│
│ │ 👤 María López       ││
│ │ Debes: $100          ││
│ │ [Pagar] [Mensaje]    ││
│ └──────────────────────┘│
└─────────────────────────┘
                           ← md gap
┌─────────────────────────┐
│ GRÁFICOS Y INSIGHTS     │  ← H3
│ ┌────────────────────┐ │
│ │ Gasto esta semana │ │
│ │  /\               │ │
│ │ /  \    ← sparkline│ │
│ │      $1,234       │ │
│ │ ↓ 10% vs semana   │ │
│ └────────────────────┘ │
│                        │
│ 📌 Insight             │
│ "Hoy gastaste en      │
│  Starbucks más que   │
│  en 2 semanas"       │
└─────────────────────────┘
```

**Interacciones:**
- Pull to refresh (suave)
- Tap en balance → copiar al clipboard + toast
- Tap en tarjeta de pago → abre modal de pago rápido
- Tap en contacto → perfil de contacto

---

### 2. **Pantalla de Contactos - CRM Financiero**

**Objetivo:** Gestionar relaciones financieras

```
┌─────────────────────────┐
│ Contactos               │  ← H2
│ 👤 Búsqueda...          │  ← Search box
└─────────────────────────┘
                           ← md gap
DEBES (3 contactos)
┌─────────────────────────┐
│ 👤 Juan García          │
│ Debes: $500 (Rojo)      │
│ Vence: Hoy              │
│ [Pagar] [Cobrar] [...]  │
└─────────────────────────┘
                           ← sm gap
┌─────────────────────────┐
│ 👤 María López          │
│ Debes: $100             │
│ Vence: En 5 días        │
│ [Pagar] [...]           │
└─────────────────────────┘

TE DEBEN (2 contactos)
┌─────────────────────────┐
│ 👤 Carlos Ruiz          │
│ Te debe: $1,500 (Verde) │
│ Desde: 2 semanas        │
│ [Cobrar] [Recordar] [...│
└─────────────────────────┘
```

**Al tapear un contacto:**
```
┌─────────────────────────┐
│ ← Juan García           │
│ 👤                      │  ← Avatar grande
│                         │
│ DEBES: $500             │  ← Balance principal
│ Vence: Hoy              │
│                         │
│ HISTORIAL               │  ← Timeline
│ Hoy: +$500 (vence)      │
│ 10 jul: Prestaste -$500 │
│ 5 jul: Te pagó +$200    │
│                         │
│ [PAGAR AHORA] [Más...]  │
└─────────────────────────┘
```

---

### 3. **Pantalla de Cuentas - Mi Dinero**

**Objetivo:** Ver cada cuenta como un "mini banco"

```
CUENTAS BANCARIAS

┌─────────────────────────┐
│ 🏦 Banco Principal      │
│ $3,456.78              │
│ Cuenta de ahorros       │
│ Últimos movimientos:    │
│ -$50 Starbucks          │
│ +$2000 Salario          │
│ [Ver todos]             │
└─────────────────────────┘
                           ← md gap
┌─────────────────────────┐
│ 💚 Banco Digital        │
│ $1,200.00              │
│ Cuenta corriente        │
│ [Ver más]               │
└─────────────────────────┘

TARJETAS DE CRÉDITO

┌─────────────────────────┐
│ VISA - Platinum         │  ← Tarjeta visual
│ ◆◆◆◆ 4567             │  ← Números brillantes
│ Juan García             │
│                         │
│ Límite: $5,000          │
│ Disponible: $2,340      │
│ Usado: 53% ████░░░░░░  │
│                         │
│ Vence en 6 días         │
│ [Ver movimientos]       │
└─────────────────────────┘
                           ← md gap
┌─────────────────────────┐
│ MASTERCARD - Basic      │
│ Límite: $2,000          │
│ Disponible: $1,800      │
│ [Activar] [...]         │
└─────────────────────────┘
```

---

### 4. **Pantalla de Deudas por Cobrar - Dinero que me Deben**

**Objetivo:** Rastrear dinero entrante

```
┌─────────────────────────┐
│ TOTAL A COBRAR:         │
│ $2,500                  │
│ 3 deudas activas        │
└─────────────────────────┘
                           ← md gap
VENCIDAS (1)

┌─────────────────────────┐
│ 👤 Carlos Ruiz          │
│ $500 • Hace 15 días     │  ← Rojo
│ Descripción: Préstamo   │
│ [COBRAR] [Recordar] [...│
└─────────────────────────┘

ACTIVAS (2)

┌─────────────────────────┐
│ 👤 Ana Gómez            │
│ $1,000 • Vence en 5d    │
│ [Cobrar] [Extender] [...│
└─────────────────────────┘

┌─────────────────────────┐
│ 👤 Pedro Díaz           │
│ $1,000 • Vence en 20d   │
│ [Cobrar] [...]          │
└─────────────────────────┘
```

---

### 5. **Pantalla de Movimientos - Timeline Financiero**

**Objetivo:** Visualizar transacciones bellamente

```
MOVIMIENTOS

Hoy, 15 de Julio

┌─────────────────────────┐
│ 🛒 Starbucks            │
│ -$5.20                  │  ← Rojo
│ Compra en tienda        │
│ CONFIRMADO              │  ← Badge gris
│ 14:30                   │
└─────────────────────────┘
                           ← sm gap
┌─────────────────────────┐
│ 💸 Transfer a Juan      │
│ -$200                   │
│ Concepto: Almuerzo      │
│ ⏳ PENDIENTE            │  ← Badge amarillo
│ 13:45                   │
└─────────────────────────┘

Ayer, 14 de Julio

┌─────────────────────────┐
│ 💰 Salario              │
│ +$2,000                 │  ← Verde
│ Nómina empresa          │
│ ✓ CONFIRMADO            │  ← Badge verde
│ 10:00                   │
└─────────────────────────┘
```

---

### 6. **Pantalla de Pagos Programados - Suscripciones**

**Objetivo:** Gestionar gastos recurrentes como Netflix

```
GASTOS RECURRENTES

PRÓXIMOS PAGOS ESTA SEMANA (2)

┌─────────────────────────┐
│ 🏠 Arriendo             │
│ $800 • Vence hoy        │  ← URGENTE
│ Se repite: Mensual      │
│ Cambiar a: Próximo mes  │
│ [PAGAR AHORA]           │
└─────────────────────────┘
                           ← md gap
┌─────────────────────────┐
│ ☎️ Teléfono             │
│ $45 • Vence en 3 días   │
│ Se repite: Mensual      │
│ [Recordar] [Cambiar]    │
└─────────────────────────┘

PRÓXIMOS PAGOS ESTE MES (1)

┌─────────────────────────┐
│ 🎬 Netflix              │
│ $15.99 • Vence: 20 jul  │
│ Se repite: Mensual      │
│ Último pago: 20 jun     │
│ [...]                   │
└─────────────────────────┘

PAGADOS ESTE MES (8)

┌──────────────────────────┐
│ 📺 Disney+      | $9.99  │
│ 🍔 DoorDash     | $15    │
│ [Mostrar más]            │
└──────────────────────────┘

Total recurrente: $900/mes
```

---

### 7. **Pantalla de Transacciones - Tarjeta de Crédito**

**Objetivo:** Detalles de uso de crédito

```
┌─────────────────────────┐
│ VISA Platinum           │
│ Cierre: 30 de Julio     │
│                         │
│ Saldo actual: $1,234    │
│ Límite disponible: $3,766│
│ ████████░░ 25%         │
└─────────────────────────┘

TRANSACCIONES DESDE ÚLTIMO CIERRE

Hoy

┌─────────────────────────┐
│ 🛒 Starbucks            │
│ -$5.20 USD              │
│ 14:30 • Tienda          │
│ ✓ Confirmado            │
└─────────────────────────┘

Ayer

┌─────────────────────────┐
│ 🛍️ Amazon               │
│ -$89.99 USD             │
│ 19:45 • Online          │
│ ✓ Confirmado            │
└─────────────────────────┘

RESUMEN POR CATEGORÍA

┌─────────────────────────┐
│ 🍔 Comida: $45         │
│ 🛍️ Compras: $150       │
│ 🚗 Transporte: $0      │
│ 📺 Entretenimiento: $0 │
└─────────────────────────┘
```

---

## 🎬 Animaciones y Microinteracciones

### Principios
- **Duración:** 200-300ms (natural)
- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` (estándar Material)
- **Nunca:** Animaciones sin propósito

### Ejemplos

#### Transición de página
```
Entrada: fade in + slide up suave (100px)
Salida: fade out + slide down suave
Duración: 300ms
```

#### Hover en tarjeta
```
- Elevation sube (sombra aumenta)
- Scale: 1 → 1.02
- Duración: 200ms
```

#### Tap en botón
```
- Scale: 1 → 0.98
- Duration: 100ms
- Al soltar vuelve a 1
```

#### Contador animado (dinero)
```
$0 → $5,234.56
- Duración: 1s
- Easing: easeOut
- Actualiza cada 50ms
```

#### Expandir FAB
```
1. Icono rota 45° (200ms)
2. Contenedor expande (300ms)
3. Items aparecen con delay (50ms cada)
```

#### Refresh (pull to refresh)
```
- Icono rota 360° durante refresh
- Al terminar: checkmark breve + desaparece
```

---

## 📐 Grid y Layout

### Mobile (390px - iPhone 14)
```
Margen horizontal: 16px
Contenedor máx: 358px
Gap entre elementos: 16px (md), 24px (lg)
Altura mínima toque: 48px
```

### Tablet (768px - iPad)
```
Margen horizontal: 24px
Contenedor máx: 720px
Gap: 20px (md), 28px (lg)
Grid: 2 columnas flexible
```

### Desktop (1200px+)
```
Margen horizontal: 32px
Contenedor máx: 1136px
Gap: 24px (md), 32px (lg)
Grid: 3 columnas flexible
Sidebar: 280px fixed
```

---

## 🛠️ Implementación Técnica

### Stack Confirmado
- **Framework:** Next.js 16 (App Router)
- **UI Library:** shadcn/ui
- **Estilos:** Tailwind CSS v4
- **Animaciones:** Framer Motion
- **Iconos:** lucide-react
- **Backend:** Firebase (no tocar)
- **Forms:** react-hook-form + Zod

### Componentes a Crear / Mejorar

#### 1. Componentes del Sistema de Diseño
```
src/components/design-system/
├── cards/
│   ├── FinancialCard.tsx          ✨ NEW
│   ├── DashboardMetric.tsx        ✨ MEJORAR
│   ├── AccountCard.tsx            ✨ MEJORAR
│   ├── ContactCard.tsx            ✨ MEJORAR
│   ├── CreditCardView.tsx         ✨ MEJORAR
│   ├── DebtCard.tsx               ✨ MEJORAR
│   ├── PayableCard.tsx            ✨ NEW
│   └── PremiumCard.tsx            ✨ NEW
├── buttons/
│   ├── PrimaryButton.tsx          ✨ NEW
│   ├── SecondaryButton.tsx        ✨ NEW
│   ├── IconButton.tsx             ✨ NEW
│   └── ActionButton.tsx           ✨ MEJORAR
├── inputs/
│   ├── FinancialInput.tsx         ✨ NEW
│   ├── SelectInput.tsx            ✨ NEW
│   ├── DatePicker.tsx             ✨ NEW
│   └── SearchInput.tsx            ✨ NEW
├── feedback/
│   ├── EmptyState.tsx             ✨ MEJORAR
│   ├── LoadingState.tsx           ✨ MEJORAR
│   ├── ProgressBar.tsx            ✨ MEJORAR
│   ├── StatusBadge.tsx            ✨ MEJORAR
│   └── Toast.tsx                  ✨ NEW
├── layout/
│   ├── Sidebar.tsx                ✨ MEJORAR
│   ├── BottomNav.tsx              ✨ MEJORAR
│   ├── FloatingActionButton.tsx   ✨ MEJORAR
│   └── Header.tsx                 ✨ NEW
└── timeline/
    └── TimelineItem.tsx           ✨ MEJORAR
```

#### 2. Páginas Mejoradas
```
app/dashboard/
├── page.tsx                       ✨ REDISEÑO COMPLETO
├── personas/
│   ├── page.tsx                   ✨ REDISEÑO
│   └── [id]/page.tsx              ✨ REDISEÑO
├── cuentas/
│   └── page.tsx                   ✨ REDISEÑO
├── cuentas-por-cobrar/
│   └── page.tsx                   ✨ REDISEÑO
├── cuentas-por-pagar/
│   └── page.tsx                   ✨ REDISEÑO
├── movimientos/
│   └── page.tsx                   ✨ REDISEÑO
├── pagos-programados/
│   └── page.tsx                   ✨ REDISEÑO
└── reportes/
    └── page.tsx                   ✨ REDISEÑO
```

### Patrones de Codificación

#### Props bien tipificadas
```typescript
interface FinancialCardProps {
  icon: React.ComponentType<{className?: string}>;
  title: string;
  value: number;
  subtitle?: string;
  status?: 'positive' | 'negative' | 'neutral';
  onClick?: () => void;
  className?: string;
}
```

#### Componentes memoizados
```typescript
import { memo } from 'react';

const FinancialCard = memo(({...}: FinancialCardProps) => {
  // componente
}, (prev, next) => {
  // comparación personalizada si es complejo
});

export default FinancialCard;
```

#### Utility para formatear dinero
```typescript
export const formatCurrency = (value: number, currency = 'COP'): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};
```

---

## ✅ Checklist de Calidad

### Antes de considerar cada pantalla "hecha"
- [ ] Funciona en mobile 390px sin scroll horizontal
- [ ] Funciona en tablet 768px sin problemas
- [ ] Funciona en desktop 1200px+ sin estirarse
- [ ] Todos los números están formateados con moneda
- [ ] Todas las fechas están formateadas en español
- [ ] Animaciones son suaves (no jank)
- [ ] Touchscreen targets mínimo 48px
- [ ] Contrast ratio mínimo WCAG AA
- [ ] Sin tablas (nunca)
- [ ] Máximo 3 niveles de jerarquía de color
- [ ] Espacios en blanco generosos
- [ ] Tipografía máximo 2 familias
- [ ] Sin decoraciones sin propósito
- [ ] Loading states bonitos (skeletons)
- [ ] Error states con microcopy útil
- [ ] Empty states amigables

### Performance
- [ ] Componentes memoizados donde aplique
- [ ] Lazy loading de imágenes
- [ ] Tailwind CSS purged
- [ ] Bundle size optimizado
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1

---

## 🎨 Ejemplos Visuales (Descripción de Referencia)

### Estado Premium vs. Actual
```
❌ ACTUAL (Problemas)
- Elementos muy densamente empaquetados
- Tablas para datos (difícil de leer en mobile)
- Tipografía pequeña
- Colores inconsistentes
- Animaciones bruscas o ausentes
- Interfaces administrativas
- Falta de microcopy

✅ PREMIUM (Objetivo)
- Espacios en blanco generosos
- Tarjetas elegantes y espaciadas
- Tipografía grande y legible
- Paleta consistente 3-5 colores
- Animaciones suaves y propositivas
- Interfaces de consumidor (fintech)
- Microcopy brillante y útil
- Jerarquía visual clara
- Cada pantalla responde 1-2 preguntas
```

---

## 🚀 Plan de Implementación Fase 1

### Prioridad Alta
1. **Sistema de Diseño Base** (componentes reutilizables)
2. **Dashboard** (pantalla principal)
3. **Contactos** (CRM de relaciones)
4. **Navegación** (Sidebar + Bottom Nav + FAB)

### Prioridad Media
5. **Cuentas y Tarjetas**
6. **Movimientos** (Timeline)
7. **Deudas por Cobrar / Pagar**

### Prioridad Baja
8. **Pagos Programados**
9. **Reportes**
10. **Configuración**

---

## 📝 Notas Especiales

- **Mobile first:** Diseña para 390px, desktop es mejora
- **Número grande:** $1,234.56 es protagonista
- **Microcopy:** Explica qué hacer sin ser obvio
- **Sin tablas:** Nunca. Usa tarjetas.
- **Animaciones:** 200-300ms, easing suave
- **Colores:** 3-5 máximo, paleta clara
- **Tipografía:** 2 familias máximo
- **Espacios:** Generosos, no apretado
- **Acciones:** Una primaria por pantalla
- **Estados:** Loading, Error, Empty todos hermosos

---

## 💡 Próximos Pasos

1. **Aprueba esta especificación**
2. **Crea primero el Design System** (componentes reutilizables)
3. **Rediseña Dashboard** (corazón de la app)
4. **Itera sobre feedback**
5. **Expande a otras pantallas**
6. **Testing en dispositivos reales**

---

*Especificación completa para transformar CashLife en una experiencia premium de fintech de clase mundial.*
