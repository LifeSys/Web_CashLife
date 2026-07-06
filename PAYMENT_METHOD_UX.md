# Rediseño UX: Gastos con Tarjeta de Crédito

## Problema Original

El formulario de "Gasto" siempre solicita una "Cuenta origen", por lo que únicamente muestra cuentas con saldo (bancos, efectivo, billeteras).

**Esto impedía registrar gastos realizados con tarjeta de crédito.**

### Ejemplo Real Que No Funcionaba

```
Hoy pagué una multa del SAT por S/550 utilizando mi Tarjeta BBVA Oro.

❌ No se podía registrar porque el selector solo mostraba cuentas bancarias.
```

---

## Solución Implementada

### 1. Nuevo Flujo de "Gasto"

Cuando el usuario selecciona "Gasto", el formulario ahora pregunta primero:

```
¿Cómo realizaste este gasto?

[ ] Efectivo
[ ] Cuenta Bancaria
[ ] Tarjeta de Crédito
```

### 2. Comportamiento Contextual

#### Si selecciona **Efectivo**
- Mostrar únicamente cuentas de tipo `cash` (cajas, billeteras)
- Campo: "Caja/Efectivo"

#### Si selecciona **Cuenta Bancaria**
- Mostrar únicamente cuentas de tipo `bank`
- Campo: "Cuenta Bancaria"

#### Si selecciona **Tarjeta de Crédito**
- Ocultar completamente el campo "Cuenta origen"
- Mostrar nuevo selector: "Tarjeta de Crédito"
- Listar todas las tarjetas activas del usuario
- Ejemplo: BBVA Oro, Visa BCP, Mastercard Interbank

### 3. Lógica de Guardado

Cuando el usuario registra un gasto con **tarjeta de crédito**:

```typescript
// Input del usuario
{
  tipo: "gasto",
  medioPago: "tarjeta_credito",
  tarjeta: "BBVA Oro",
  monto: 550,
  descripcion: "Multa SAT"
}

// El sistema automáticamente:
1. Detecta que es tarjeta → Crea evento CARGO_TARJETA (no GASTO)
2. Registra la transacción en el historial
3. Incrementa montoUtilizado de la tarjeta
4. Actualiza Dashboard
5. Actualiza sección de tarjetas
```

**Resultado en Dashboard:**
- Se ve el movimiento en "Movimientos"
- Se actualiza automáticamente la deuda utilizada de la tarjeta BBVA Oro
- **No afecta** el saldo de las cuentas bancarias

---

## Cambios en el Código

### EventForm.tsx

#### Nuevo campo en formData
```typescript
medioPago: '' as 'efectivo' | 'cuenta_bancaria' | 'tarjeta_credito' | '';
```

#### Nuevos filtros de cuentas
```typescript
const efectivoAccounts = useMemo(() => 
  cuentas.filter((cuenta) => cuenta.tipo === 'cash'), [cuentas]
);

const bankAccounts = useMemo(() => 
  cuentas.filter((cuenta) => cuenta.tipo === 'bank'), [cuentas]
);
```

#### Helper para obtener cuentas
```typescript
const getAccountsByPaymentMethod = (method: string) => {
  switch (method) {
    case 'efectivo':
      return efectivoAccounts;
    case 'cuenta_bancaria':
      return bankAccounts;
    case 'tarjeta_credito':
      return []; // Las tarjetas se manejan aparte
    default:
      return cashAccounts;
  }
};
```

#### Lógica de handleSubmit actualizada
```typescript
case EventoFinancieroTipo.GASTO:
  if (!formData.medioPago) return toast.error('Selecciona un medio de pago');
  
  if (formData.medioPago === 'tarjeta_credito') {
    // Crear CARGO_TARJETA en lugar de GASTO
    evento = EventBuilder.crearCargoTarjeta(...);
  } else {
    // Gasto normal con efectivo o cuenta bancaria
    evento = EventBuilder.crearGasto(...);
  }
  break;
```

---

## Ejemplo de Uso: Caso Real

### Usuario intenta registrar:
```
Concepto: Multa SAT
Monto: S/550
Medio de pago: Tarjeta BBVA Oro
```

### Paso a paso en la UI:

1. **Click en "Gasto"**
   - Se muestra el selector de medio de pago

2. **Selecciona "Tarjeta de Crédito"**
   - Campo "Cuenta origen" desaparece
   - Aparece selector "Tarjeta de Crédito"

3. **Selecciona "BBVA Oro"**
   ```
   BBVA Oro · usado S/3,200
   ```

4. **Completa datos**
   - Monto: 550
   - Descripción: "Multa SAT"
   - Categoría: "Impuestos" (o similar)

5. **Click en "Guardar"**
   - Sistema detecta tarjeta de crédito
   - Crea evento CARGO_TARJETA
   - Incrementa `montoUtilizado` de BBVA Oro: 3200 → 3750
   - Registra transacción

6. **Dashboard actualiza automáticamente**
   - Nuevo movimiento visible
   - Tarjeta BBVA Oro ahora muestra: "usado S/3,750"
   - Saldo bancario NO se afecta

---

## Modelo de Datos

### Account (Tarjeta de Crédito)
```typescript
{
  id: "cc_001",
  nombre: "BBVA Oro",
  tipo: "credit_card",
  saldo: 5000,  // Límite disponible
  creditLimit: 8000,
  montoUtilizado: 3200,  // Se incrementa con CARGO_TARJETA
  usedAmount: 3200,  // Alias
  active: true
}
```

### Transaction (Cargo a Tarjeta)
```typescript
{
  id: "tx_123",
  tipo: "credit_card_charge",
  monto: 550,
  tarjetaId: "cc_001",
  descripcion: "Multa SAT",
  fecha: "2024-07-06",
  categoriaId: "cat_impuestos"
}
```

---

## Validaciones

### En EventForm
- `medioPago` es requerido para GASTO
- Según el medio de pago, se valida:
  - **Efectivo**: `cuentaId` debe ser de tipo `cash`
  - **Cuenta Bancaria**: `cuentaId` debe ser de tipo `bank`
  - **Tarjeta**: `tarjetaId` debe ser de tipo `credit_card`

### En EventBuilder
- La creación de CARGO_TARJETA valida que el monto sea positivo
- La tarjeta debe estar activa

### En Financial Engine
- `procesarEvento()` procesa CARGO_TARJETA como operación de crédito
- Actualiza automáticamente `montoUtilizado` de la tarjeta

---

## Errores Comunes y Soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| "Selecciona un medio de pago" | Campo medioPago vacío | El usuario olvidó seleccionar el medio |
| "Selecciona una tarjeta" | tarjetaId vacío cuando medioPago = "tarjeta_credito" | Mostrar selector de tarjetas (ya implementado) |
| "Selecciona una cuenta" | cuentaId vacío pero medioPago = "efectivo" \| "cuenta_bancaria" | Revisar que filtro devuelva cuentas disponibles |
| Tarjeta no aparece en selector | Tarjeta está inactiva o borrada | Verificar `active: true` en la tarjeta |

---

## Testing

### Test Case 1: Gasto con Efectivo
```
Entrada: medioPago="efectivo", cuentaId="cash_001", monto=50
Esperado: Crea EventoGasto, reduce saldo efectivo
```

### Test Case 2: Gasto con Cuenta Bancaria
```
Entrada: medioPago="cuenta_bancaria", cuentaId="bank_001", monto=100
Esperado: Crea EventoGasto, reduce saldo bancario
```

### Test Case 3: Gasto con Tarjeta de Crédito
```
Entrada: medioPago="tarjeta_credito", tarjetaId="cc_001", monto=550
Esperado: Crea CargoTarjeta, incrementa montoUtilizado
```

### Test Case 4: Registro de Multa SAT Real
```
Entrada:
  tipo: GASTO
  medioPago: "tarjeta_credito"
  tarjeta: "BBVA Oro"
  monto: 550
  descripcion: "Multa SAT"
  
Esperado:
  - Transacción tipo CREDIT_CARD_CHARGE registrada
  - BBVA Oro.montoUtilizado incrementado
  - Dashboard actualizado
  - Saldo bancario sin cambios
```

---

## Próximas Mejoras

- [ ] Permitir registrar gastos parciales a tarjeta (p.ej., 30% tarjeta, 70% efectivo)
- [ ] Sugerir medio de pago basado en historial (último usado)
- [ ] Categorías especiales para gastos recurrentes de tarjeta
- [ ] Alertas cuando deuda de tarjeta supera % del límite
