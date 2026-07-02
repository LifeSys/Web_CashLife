# Guía de Inicio Rápido - CashLife

## ¿Qué es CashLife?

CashLife es una aplicación web moderna para gestionar tu dinero personal. Permite registrar gastos, ingresos, préstamos y transferencias en menos de 5 segundos, con un hermoso dashboard que te muestra tu situación financiera en tiempo real.

## Características Principales

✓ **Dashboard inteligente** - Saldo total y estadísticas calculadas automáticamente  
✓ **Registro ultra-rápido** - Movimiento nuevo en <5 segundos  
✓ **Completamente responsivo** - Perfecto en móvil, tablet y desktop  
✓ **Tema oscuro elegante** - Interfaz moderna y agradable  
✓ **Datos simulados** - 28 transacciones de ejemplo para explorar  

## Instalación Local

### Requisitos
- Node.js 18+ 
- pnpm (recomendado) o npm

### Pasos

```bash
# 1. Clonar o descargar el proyecto
cd cashlife

# 2. Instalar dependencias
pnpm install
# o: npm install

# 3. Iniciar servidor de desarrollo
pnpm dev
# o: npm run dev

# 4. Abrir en navegador
# http://localhost:3000
```

El servidor estará disponible en `http://localhost:3000`

## Primeros Pasos

### 1. Explorar el Dashboard
Cuando abras la app, verás:
- Tu saldo total en grande (S/ 55,000)
- 6 tarjetas con estadísticas (Ingresos, Gastos, Balance, Prestado, Por Cobrar, Transacciones)
- Los últimos 5 movimientos registrados

### 2. Registrar tu Primer Movimiento

Haz clic en el botón **verde con "+"** (esquina inferior derecha en móvil)

1. **Selecciona tipo**: Gasto, Ingreso, Préstamo, Transferencia
2. **Ingresa monto**: Ej: 125.50
3. **Elige cuenta**: Donde ocurre el movimiento
4. **Categoría**: Para organizarte (Comida, Transporte, etc)
5. **Descripción**: Detalles opcionales
6. **Guardar**: ¡Listo! Menos de 5 segundos

### 3. Navegar la App

**En Móvil** (< 768px):
- Usa la barra de navegación inferior para cambiar de sección
- Swipe hacia los lados para una experiencia fluida

**En Desktop** (>= 768px):
- Usa el menú lateral izquierdo (Sidebar)
- Más espacio para ver detalles

### 4. Explorar Secciones

- **Inicio** - Dashboard con resumen
- **Movimientos** - Historial filtrable (Hoy, Semana, Mes)
- **Cuentas** - Tus 7 cuentas y saldos
- **Personas** - Deudores y prestamistas
- **Reportes** - Análisis de gastos por categoría
- **Configuración** - Preferencias de la app

## Datos Incluidos

### 7 Cuentas
- Efectivo (S/ 2,500)
- BCP (S/ 15,000)
- Interbank (S/ 8,500)
- BBVA (S/ 22,000)
- Yape (S/ 1,200)
- Plin (S/ 800)
- Caja Fuerte (S/ 5,000)
**Total: S/ 55,000**

### 10 Categorías
- Comida, Transporte, Suscripciones, Entretenimiento, Salud, Educación, Hogar, Otros, Salario, Bonificación

### 28 Transacciones
- Ejemplo: Almuerzo, Salario, Transporte, Suscripciones, Préstamos
- Fechas: Últimos 25 días

### 8 Personas
- Con deudas activas (préstamos entre personas)

## Cómo Está Hecho

### Stack Tecnológico
- **Next.js 16** - Framework React con App Router
- **React 19** - UI library
- **TypeScript** - Tipado seguro
- **Tailwind CSS v4** - Estilos
- **SWR** - Caching y fetching
- **Lucide React** - Iconos

### Arquitectura

La app está dividida en capas bien definidas:

```
Componentes (UI)
    ↓
Hooks (Lógica + Estado)
    ↓
Services (Datos)
    ↓
Mock Data (Simulación)
```

**Ventaja**: Código limpio, fácil de testear, y preparado para cambiar a una base de datos real (Firebase).

### Carpetas Principales

```
src/
├── app/              # Páginas (Next.js)
├── components/       # Componentes reutilizables
├── features/         # Componentes específicos
├── services/         # Capa de datos
├── hooks/            # Lógica compartida
├── lib/mock/         # Datos simulados
└── types/            # TypeScript types
```

## Próximos Pasos

### Para Explorar Más
1. Abre DevTools (F12)
2. Consola: Verás los datos cargándose
3. Network: SWR caching en acción

### Para Modificar

#### Cambiar Colores
```css
/* app/globals.css */
.dark {
  --primary: #22C55E;        /* Verde principal */
  --secondary: #3B82F6;      /* Azul */
  /* etc */
}
```

#### Agregar Transacciones
```typescript
// src/lib/mock/transactions.ts
export const mockTransactions: Transaction[] = [
  {
    id: 'tx-new',
    tipo: 'GASTO',
    monto: 50,
    descripcion: 'Mi nuevo gasto',
    // ...
  }
]
```

#### Cambiar Moneda
```typescript
// src/components/common/BalanceCard.tsx
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'USD',  // Cambiar aquí
  }).format(value);
}
```

## Debugging

### Si ves errores:

1. **Limpia cache**
   ```bash
   rm -rf .next node_modules/.cache
   pnpm dev
   ```

2. **Revisa la consola** (F12 → Console)
   - Verás logs de datos cargando
   - Cualquier error de JavaScript

3. **Verifica el servidor**
   - Abre http://localhost:3000
   - Si no carga, el servidor no está corriendo

### Performance

Abre DevTools → Performance para medir:
- LCP (Largest Contentful Paint)
- CLS (Cumulative Layout Shift)
- INP (Interaction to Next Paint)

CashLife está optimizado para mobile-first, así que deberías ver números buenos.

## Soporte

Para reportar bugs o sugerencias:
1. Revisa el código en `src/`
2. Los datos están en `src/lib/mock/`
3. Los componentes están bien documentados

## Licencia

Código de ejemplo. Libre para usar y modificar.

---

**CashLife v1.0** - Controla tu dinero, vive mejor.

¡Happy coding! 🚀
