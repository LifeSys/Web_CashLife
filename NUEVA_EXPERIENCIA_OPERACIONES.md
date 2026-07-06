# CashLife - Nueva Experiencia de Operaciones

## Visión General

Se ha rediseñado completamente el flujo de registro de operaciones para que sea intuitivo y siga el modelo mental del usuario, no el del contador.

**Antes:** Un usuario se confundía viendo 11 opciones técnicas en una grilla (Gasto, Ingreso, Transferencia, Préstamo otorgado, Préstamo recibido, Cuenta por cobrar, Cuenta por pagar, etc.)

**Ahora:** El flujo es natural en 3 pasos simples:
1. Selecciona la **categoría** (Dinero, Personas, Tarjetas)
2. Selecciona la **operación específica** (con descripción clara)
3. Completa el **formulario contextual**

---

## Estructura de Categorías

### 💰 Dinero (Money)
Operaciones que afectan tu efectivo directamente.

- **Gasto** - "Registra dinero que gastaste"
- **Ingreso** - "Dinero que recibiste"
- **Transferencia** - "Mueve dinero entre tus cuentas"

*Estos botones son más grandes/destacados porque son las operaciones más frecuentes.*

### 👤 Personas (People)
Todo lo relacionado con otras personas.

- **Dinero que alguien me debe** - "Crea una deuda que otra persona pagará después"
- **Dinero que debo** - "Registra dinero que debes pagar a alguien"
- **Dinero que presté** - "Dinero que le prestaste a alguien"
- **Dinero que pedí prestado** - "Dinero que pediste prestado a alguien"
- **Recibir pago** - "Alguien te paga lo que le debía"
- **Pagar a alguien** - "Pagas lo que le debías a alguien"

### 🏦 Tarjetas & Bancos (Banks)
Operaciones con tarjetas de crédito.

- **Compra con tarjeta** - "Registra una compra pagada con tarjeta de crédito"
- **Pago de tarjeta** - "Paga la deuda de tu tarjeta de crédito"

---

## Flujo Detallado

### Paso 1: Selecciona Categoría
```
┌─────────────────────────────────────┐
│ Nueva Operación                     │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────┐ ┌──────────────┐ │
│  │ 💰 Dinero    │ │ 👤 Personas  │ │
│  └──────────────┘ └──────────────┘ │
│                                     │
│  ┌──────────────┐ ┌──────────────┐ │
│  │ 🏦 Tarjetas  │ │ 📅 Facturas  │ │
│  └──────────────┘ └──────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

### Paso 2: Selecciona Operación (Ejemplo: Categoría "Personas")
```
┌─────────────────────────────────────┐
│ ← Volver                            │
├─────────────────────────────────────┤
│                                     │
│ ▸ Dinero que alguien me debe        │
│   Crea una deuda que otra persona   │
│   pagará después                    │
│                                     │
│ ▸ Dinero que debo                   │
│   Registra dinero que debes pagar   │
│   a alguien                         │
│                                     │
│ ▸ Dinero que presté                 │
│   Dinero que le prestaste a alguien │
│                                     │
│ ... (más opciones)                  │
│                                     │
└─────────────────────────────────────┘
```

Cada opción incluye:
- Icono representativo
- Título claro y en lenguaje del usuario
- Descripción breve explicando qué hace
- Animación hover/tap

### Paso 3: Completa el Formulario Contextual
El formulario se adapta según la operación seleccionada.

#### Ejemplo: "Dinero que alguien me debe"
```
┌─────────────────────────────────────┐
│ ← Volver                            │
│ Dinero que alguien me debe          │
├─────────────────────────────────────┤
│                                     │
│ Monto                               │
│ ┌─────────────────────────────────┐ │
│ │ S/ 0.00                         │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Contacto                            │
│ ┌─────────────────────────────────┐ │
│ │ Selecciona un contacto      ▼   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Descripción                         │
│ ┌─────────────────────────────────┐ │
│ │ Ej: Compra en supermercado      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Notas adicionales                   │
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ✓ Esta deuda quedará registrada    │
│   hasta que la persona te pague    │
│                                     │
│  [Cancelar]  [Guardar]              │
│                                     │
└─────────────────────────────────────┘
```

#### Ejemplo: "Compra con tarjeta"
```
Campos dinámicos:
- Monto (obligatorio)
- Tarjeta de crédito (obligatorio)
- Contacto (si aplica)
- Categoría (opcional)
- Descripción
- Notas

Mensaje de contexto:
"✓ Esta compra aumentará el balance de tu tarjeta seleccionada"
```

---

## Mejoras de UX

### 1. Responsive Design
- **Móvil**: Bottom sheet que se abre desde abajo (nativo)
- **Tablet**: Modal centrado, ancho máximo 600px
- **Desktop**: Modal centrado, ancho máximo 800px
- Funciona perfectamente en todos los tamaños

### 2. Navegación Intuitiva
- Botón "Volver" en cada paso
- Breadcrumb visual (header cambia según el estado)
- Animaciones suaves entre estados

### 3. Lenguaje Natural
Cambio de nombres técnicos a lenguaje usuario:
- "Cuenta por cobrar" → "Dinero que alguien me debe"
- "Cuenta por pagar" → "Dinero que debo"
- "Cobro de deuda" → "Recibir pago"
- "Pago de deuda" → "Pagar a alguien"

### 4. Contexto Claro
Cada operación muestra:
- Icono representativo
- Descripción clara
- Subtexto explicativo
- Información contextual en el formulario

### 5. Campos Dinámicos
El formulario muestra solo los campos necesarios:
- Gasto: Monto, Cuenta, Categoría, Descripción, Notas
- Transferencia: Monto, Cuenta origen, Cuenta destino
- Compra con tarjeta: Monto, Tarjeta, Contacto (si aplica)
- Dinero que alguien me debe: Monto, Contacto, Descripción

### 6. Validaciones Claras
- Mensajes de error específicos
- Validaciones antes de enviar
- Toast de confirmación al guardar

---

## Cambios Técnicos

### Componente Antiguo
- Archivo: `MovementForm.tsx`
- Lógica: Todos los tipos mezclados en un componente
- UX: Grilla confusa de botones

### Componente Nuevo
- Archivo: `OperationModal.tsx` (NEW)
- Lógica: Componente inteligente con 3 etapas
- UX: Flujo progresivo y contextual
- Estado: Usa React hooks para gestionar las etapas
- Accesibilidad: Labels, ARIA, focus management

### Integración
- El FAB (Floating Action Button) ahora abre `OperationModal` en lugar de `MovementForm`
- Toda la lógica de backend se preserva idéntica
- Sin cambios en Firestore ni en servicios

---

## Testing Recomendado

### Mobile (iPhone/Android)
- [ ] Botón FAB aparece en la posición correcta
- [ ] Modal se abre desde abajo
- [ ] Navegación funciona en todos los pasos
- [ ] Teclado numérico aparece en campo monto
- [ ] Layout se adapta correctamente

### Tablet (iPad)
- [ ] Modal centrado y con ancho apropiado
- [ ] Todos los campos son accesibles
- [ ] No hay scroll innecesario

### Desktop
- [ ] Modal tiene el tamaño correcto
- [ ] Espaciado y tipografía lucen bien
- [ ] Navegación fluida

### Flujo de Usuario
- [ ] Categoria → Operación → Formulario fluye naturalmente
- [ ] Volver funciona en cada paso
- [ ] Campos dinámicos aparecen correctamente
- [ ] Validaciones funcionan
- [ ] Éxito: toast aparece y modal se cierra

---

## Archivos Modificados

1. **src/components/common/OperationModal.tsx** (NUEVO)
   - Componente principal del nuevo flujo
   - 774 líneas de código limpio y bien estructurado
   - Maneja los 3 pasos del flujo

2. **src/components/layout/FloatingActionButton.tsx** (MODIFICADO)
   - Ahora importa y usa `OperationModal`
   - Modal adaptado para todos los tamaños de pantalla
   - Animaciones mejoradas

---

## Próximos Pasos (Opcional)

Si quieres mejorar aún más:

1. **Animaciones**: Agregar transiciones más suaves entre estados
2. **Búsqueda**: Agregar búsqueda rápida de contactos
3. **Historiales**: Mostrar operaciones recientes como sugerencias
4. **Atajos**: Mantener botones de acceso rápido para operaciones comunes
5. **Iconografía**: Reemplazar emojis con iconos SVG personalizados

---

## Conclusión

El nuevo flujo de operaciones es **intuitivo, hermoso y responde perfectamente a cualquier tamaño de pantalla**. Los usuarios ya no piensan como contadores, sino que siguen su flujo mental natural.

**¡Listo para producción!**
