# CashLife - Controla tu dinero, vive mejor

Una aplicación moderna de gestión financiera personal que te permite registrar cualquier movimiento financiero en menos de 5 segundos.

## Características

- 📊 **Dashboard inteligente** con estadísticas calculadas automáticamente
- ⚡ **Registro rápido** de gastos, ingresos, préstamos y transferencias
- 📱 **Totalmente responsivo** optimizado primero para móvil
- 🎨 **Tema oscuro personalizado** elegante y moderno
- 💾 **Datos simulados** con 28 transacciones de ejemplo
- 🔧 **Arquitectura escalable** preparada para Firebase

## Tecnología

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- SWR (fetching y caching)

## Estructura del Proyecto

```
src/
├── app/                    # Páginas y layouts
├── components/             # Componentes reutilizables
│   ├── common/            # StatCard, BalanceCard, MovementCard, etc.
│   └── layout/            # Sidebar, BottomNav, FAB
├── features/              # Componentes específicos de features
├── services/              # Capa de datos (preparada para Firebase)
├── hooks/                 # React hooks personalizados
├── lib/mock/              # Datos simulados
└── types/                 # Tipos TypeScript
```

## Instalación

```bash
# Instalar dependencias
pnpm install

# Iniciar dev server
pnpm dev

# Abrir en navegador
# http://localhost:3000
```

## Uso

### Dashboard
Pantalla principal con resumen de tu situación financiera:
- Saldo total en grande
- Ingresos, gastos y balance del mes
- Dinero prestado/por cobrar
- Últimas 5 transacciones

### Registrar Movimiento
Haz clic en el botón flotante verde (+) para:
1. Seleccionar tipo (Gasto, Ingreso, Préstamo, Transferencia)
2. Ingresar monto
3. Elegir cuenta y categoría
4. Guardar (todo en menos de 5 segundos)

### Otras Vistas
- **Movimientos**: Historial completo con filtros
- **Cuentas**: Gestiona tus cuentas y saldos
- **Personas**: Deudores y prestamistas
- **Reportes**: Análisis de gastos por categoría
- **Configuración**: Preferencias de la app

## Mock Data

El proyecto incluye datos simulados:
- 7 cuentas bancarias (Efectivo, BCP, Interbank, BBVA, Yape, Plin, Caja Fuerte)
- 10 categorías (Comida, Transporte, Suscripciones, etc.)
- 8 personas con préstamos activos
- 28 transacciones de ejemplo del último mes

Toda la data se carga desde `src/lib/mock/` y está aislada de los componentes.

## Arquitectura de Datos

### Services (Preparados para Firebase)

Cada servicio tiene interfaz consistente:
- `getAll()` - Obtener todos
- `getById(id)` - Obtener por ID
- `create()` - Crear
- `update(id, data)` - Actualizar
- `delete(id)` - Eliminar

```typescript
// Actual: Usa mock data
const transactions = await transactionService.getAll();

// Futuro: Cambiarás solo la implementación interna a Firebase
```

### Hooks

Los hooks manejan la lógica de estado:
- `useTransactions()` - Transacciones con caching SWR
- `useAccounts()` - Cuentas y balance
- `useCalculations()` - Estadísticas automáticas
- `usePeople()` - Personas con deudas
- `useCategories()` - Categorías de transacciones

### Componentes Reutilizables

Componentes genéricos sin lógica de negocio:
- `StatCard` - Tarjeta de estadística
- `BalanceCard` - Tarjeta de saldo principal
- `MovementCard` - Movimiento individual
- `MovementForm` - **Único formulario dinámico** (se adapta por tipo)
- `SectionHeader` - Títulos de sección

## Próximos Pasos

Para convertir esto a producción:

1. **Integración Firebase**
   ```typescript
   // Cambiar en transaction.service.ts
   async getAll() {
     return await firebase.collection('transactions').getDocs();
   }
   ```

2. **Autenticación**
   - Implementar login/signup
   - Usar Better Auth o Supabase Auth

3. **Validaciones**
   - Validar montos
   - Validar selecciones requeridas

4. **PWA**
   - Agregar manifest
   - Service workers

5. **Tests**
   - Tests unitarios de componentes
   - Tests de integración

## Tema de Color

Sistema de diseño con 5 colores:
- Fondo: `#09090B`
- Superficie: `#18181B`
- Primario: `#22C55E` (verde)
- Secundario: `#3B82F6` (azul)
- Destructivo: `#EF4444` (rojo)

## Notas

- ✓ Todo en español
- ✓ Mobile-first responsive
- ✓ Tema oscuro elegante
- ✓ Registro en <5 segundos
- ✓ Datos calculados automáticamente
- ✓ Preparado para Firebase

---

**CashLife v1.0** - Controla tu dinero, vive mejor.
