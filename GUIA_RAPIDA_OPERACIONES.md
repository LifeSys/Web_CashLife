# Guía Rápida - Nueva Modal de Operaciones

## 🎯 En 30 segundos

Hemos rediseñado la modal de "Nueva Operación" para que sea **intuitiva, clara y responsiva**.

**Antes:** 11 botones técnicos confusos
**Ahora:** 3 pasos naturales → Categoría → Operación → Formulario

---

## 📱 Tres Etapas Simples

### Etapa 1: Categoría
Elige qué tipo de operación vas a hacer:
- 💰 **Dinero** - Gastos, ingresos, transferencias
- 👤 **Personas** - Lo que debes, lo que te deben, préstamos
- 🏦 **Tarjetas** - Compras y pagos con tarjeta

### Etapa 2: Operación
Elige la operación específica (cada una tiene descripción):
- "Dinero que alguien me debe" → Se explica: "Crea una deuda que otra persona pagará después"
- "Dinero que debo" → Se explica: "Registra dinero que debes pagar a alguien"
- Etc.

### Etapa 3: Formulario
Completa los campos que se necesitan para esa operación específica.

---

## 🎨 Cómo Se Ve

### Mobile (Teléfono)
```
┌─────────────────────────────────────┐
│ Nueva Operación          [X]         │  ← Header sticky
├─────────────────────────────────────┤
│                                     │
│  Categorías (grid 1 columna):        │
│  ┌─────────────────────────────────┐│
│  │ 💰 Dinero                       ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ 👤 Personas                     ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ 🏦 Tarjetas & Bancos            ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘

Booleano sheet que se abre desde abajo
Sin salir de la pantalla
```

### Tablet/Desktop
```
Modal centrado
┌────────────────────────────────────────┐
│ Nueva Operación                      │ │
├────────────────────────────────────────┤
│                                        │
│  ┌──────────────┐ ┌──────────────┐    │
│  │ 💰 Dinero    │ │ 👤 Personas  │    │
│  └──────────────┘ └──────────────┘    │
│                                        │
│  ┌──────────────┐ ┌──────────────┐    │
│  │ 🏦 Tarjetas  │ │ 📅 Facturas  │    │
│  └──────────────┘ └──────────────┘    │
│                                        │
└────────────────────────────────────────┘

Ancho máximo 800px
Centrada en la pantalla
```

---

## 🗣️ Lenguaje User-Friendly

| Concepto Técnico | Usuario Lo Dice |
|---|---|
| Receivable | Dinero que alguien me debe |
| Payable | Dinero que debo |
| Debt Collection | Recibir pago |
| Loan | Dinero que presté / Dinero que pedí prestado |
| Credit Card Purchase | Compra con tarjeta |
| Credit Card Payment | Pago de tarjeta |

---

## 📊 Categorías Disponibles

### 💰 Dinero (Money)
Para operaciones que afectan tu efectivo:
- Gasto
- Ingreso
- Transferencia

### 👤 Personas (People)
Para operaciones con otra persona:
- Dinero que alguien me debe
- Dinero que debo
- Dinero que presté
- Dinero que pedí prestado
- Recibir pago (de alguien que me debía)
- Pagar a alguien (dinero que me debía)

### 🏦 Tarjetas & Bancos (Banks)
Para operaciones con tarjetas de crédito:
- Compra con tarjeta
- Pago de tarjeta

### 📅 Facturas (Bills)
*Próximas expansiones*

---

## 🎯 Ejemplos de Uso

### Caso 1: "Compré un café esta mañana"
```
1. Categoría → 💰 Dinero
2. Operación → Gasto
3. Formulario:
   - Monto: 5.50
   - Cuenta: Mi billetera
   - Categoría: Alimentos
   - Descripción: Café en la mañana
4. Guardar
```

### Caso 2: "Mi amigo Rino me debe 200 soles"
```
1. Categoría → 👤 Personas
2. Operación → Dinero que alguien me debe
3. Formulario:
   - Monto: 200
   - Contacto: Rino
   - Descripción: Almuerzo el viernes
4. Guardar
```

### Caso 3: "Pagué mi tarjeta de crédito"
```
1. Categoría → 🏦 Tarjetas & Bancos
2. Operación → Pago de tarjeta
3. Formulario:
   - Monto: 1500
   - Tarjeta: Mi Visa
   - Cuenta origen: Mi cuenta banco
4. Guardar
```

---

## ✨ Características

✅ **Intuitivo** - Lenguaje natural, no técnico  
✅ **Responsive** - Funciona en móvil, tablet, desktop  
✅ **Rápido** - Se carga al instante  
✅ **Accesible** - WCAG AA compliant  
✅ **Bonito** - Diseño premium con animaciones  
✅ **Validado** - Validaciones claras y mensajes de error  

---

## 🔄 Flujo de Navegación

```
┌─────────────────────┐
│ Selecciona Categoría │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Selecciona Operación │
│ (con descripción)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Completa Formulario  │
│ (campos dinámicos)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Guardar             │
│ ↓                   │
│ ✓ Éxito + cierre    │
└─────────────────────┘
```

Botón "Volver" en cada etapa para regresar.

---

## 🎮 Cómo Funciona

1. **Haz clic en el botón FAB** (+ verde en la esquina)
2. **Se abre la nueva modal** (animación suave)
3. **Selecciona categoría** de los 4 cuadros
4. **Selecciona la operación específica** (verás descripción)
5. **Completa el formulario** (campos cambian según operación)
6. **Haz clic en "Guardar"**
7. **¡Listo!** Se registra la operación

---

## 📞 Si Algo No Funciona

1. Abre DevTools (F12)
2. Mira la consola por errores
3. Verifica que:
   - Tu sesión esté activa
   - Tengas al menos una cuenta/tarjeta
   - Internet esté conectado
4. Recarga la página si es necesario

---

## 🎨 Diseño Responsive

### Mobile (< 768px)
- Bottom sheet desde abajo
- Ancho completo con márgenes seguros
- 1 categoría por fila
- Touch targets grandes

### Tablet (768px - 1024px)
- Modal centrado 600px
- 2 categorías por fila
- Todo accesible

### Desktop (> 1024px)
- Modal centrado 800px
- 2 categorías por fila
- Optimizado para mouse/teclado

---

## 🚀 ¡Qué Esperar!

**Mejor experiencia:**
- Menos confusión
- Más rápido
- Interfaz hermosa
- Mejor feedback

**Mismo backend:**
- Firestore igual
- Servicios igual
- Datos igual

---

## 📚 Documentación Completa

Para detalles técnicos, ver:
- `NUEVA_EXPERIENCIA_OPERACIONES.md` - Especificación completa
- `RESUMEN_OPERATIONMODAL.md` - Detalles de implementación

---

¡Disfruta la nueva experiencia!
