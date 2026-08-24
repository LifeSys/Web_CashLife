# Manual de Uso — CashLife

Guía completa de cómo usar CashLife: qué hace cada pantalla, cada botón y
cada opción de configuración.

---

## 1. ¿Qué es CashLife?

CashLife es tu app personal de control financiero: cuentas bancarias,
tarjetas de crédito, deudas (por cobrar y por pagar), pagos fijos
mensuales, reventa de cuentas compartidas (Netflix, Disney+, etc.) y
reportes — todo en un solo lugar, corriendo localmente en tu equipo.

Actualmente corre en **modo local**: no hay que iniciar sesión, hay un
único usuario fijo y todos tus datos viven en tu base de datos PostgreSQL
local (nada se sube a internet salvo que tú lo hagas).

---

## 2. Inicio (Dashboard)

La pantalla principal. Muestra de un vistazo:

- **Resumen Financiero**: Dinero disponible (suma de tus cuentas, sin
  contar tarjetas), Patrimonio neto, Me deben, Total debo.
- **Botones rápidos**: *Registrar Gasto*, *Registrar Ingreso*,
  *Transferencia*.
  - Al registrar un gasto puedes elegir pagarlo con una **cuenta
    bancaria o con una tarjeta de crédito** — si eliges tarjeta, se
    registra como consumo y aumenta la deuda de esa tarjeta.
- **Cobros pendientes**: personas que te deben y no les has escrito en
  más de 7 días, con botón directo para recordarles por WhatsApp.
- **Actividad Reciente**: tus últimos movimientos.
- **Próximos Pagos**: pagos programados que vencen pronto.

---

## 3. Movimientos

Historial completo de todo lo que ha pasado por tu dinero: gastos,
ingresos, transferencias, consumos y pagos de tarjeta, cobros y pagos de
deudas, pagos programados ejecutados, etc.

- Filtros rápidos: Todos / Hoy / Semana / Mes / Año.
- Se puede filtrar por una cuenta o tarjeta específica navegando desde
  "Ver movimientos" en Cuentas y Tarjetas.
- Cada movimiento muestra su tipo en español (Gasto, Compra con tarjeta,
  Cobro recibido, etc.), nunca el nombre interno crudo.

---

## 4. Cuentas y Tarjetas

### Tus Cuentas

Dinero real: Efectivo (fija, no se puede eliminar), cuentas bancarias,
cajas fuertes.

- **Nueva cuenta**: elige tipo (bancaria/efectivo/caja fuerte), banco
  (texto libre — escribe lo que quieras, con sugerencias de bancos
  comunes), moneda, si tiene tarjeta de débito vinculada a Yape/Plin, y
  un **color** para distinguirla de un vistazo.
- **Editar / Eliminar**: el saldo nunca se edita directo ahí — se mueve
  solo con tus movimientos reales.

### Tarjetas de Crédito

- **Nueva tarjeta**: banco (texto libre), marca, línea de crédito,
  moneda, día de corte y de pago, pago mínimo, últimos 4 dígitos, color,
  y la cuenta desde la que normalmente la pagas.
- **Registrar consumo**: anota una compra hecha con esa tarjeta (aumenta
  lo utilizado).
- **Pagar**: abona desde una cuenta real (reduce lo utilizado y descuenta
  de esa cuenta).
- **Editar**: incluye poder corregir manualmente el "monto utilizado" si
  no cuadra con tu banco (pide un motivo, queda registrado en
  Movimientos como un ajuste, sin tocar ninguna cuenta).

---

## 5. Contactos

Cada persona con la que tienes movimientos de dinero (prestamista, deudor,
empresa, banco, proveedor).

- **Historial Financiero**: línea de tiempo con todo lo que le debes / te
  debe, con botón de eliminar por cada evento si registraste algo mal.
- **🟢 Me Debe / 🔴 Le Debo**: registra una nueva deuda en cualquier
  dirección.
- **Escribirle / Llamar**: acceso directo a WhatsApp o llamada.
- **Editar / Eliminar contacto**.

---

## 6. Por Cobrar / Por Pagar

Todas tus deudas, agrupadas por dirección.

- Estado con color: Pendiente (ámbar), Pago parcial (azul), Pagado
  (verde), Vencido (rojo).
- **Registrar pago**: abonos parciales o totales, desde la cuenta que
  elijas.
- **Marcar pagado**: acción rápida de un clic (se paga desde tu cuenta
  Efectivo).
- **Editar, Historial, Eliminar** (con advertencia — revierte cualquier
  cobro/pago ya registrado contra esa deuda).
- Recordatorios por WhatsApp con tu método de cobro incluido
  automáticamente si lo configuraste.

---

## 7. Pagos Programados

Tus gastos fijos de cada mes: Netflix, Movistar, alquiler, etc.

- **Nuevo pago**: nombre, monto, día de vencimiento, frecuencia,
  categoría, y opcionalmente una cuenta/tarjeta sugerida.
- **Franja de 12 meses (01-12)**: se pinta en azul cada mes ya pagado y
  en rojo los que faltan, según el año.
- **Dividir con otras personas**: si alguien más usa/paga parte de este
  servicio (ej. splits de una suscripción compartida). Si cobras más de
  lo que te cuesta, la diferencia se marca como tu margen.
- **Ícono 🔁 / ⚡ (cobro automático)**: haz clic para activarlo o
  desactivarlo.
  - 🔁 → clic abre un mini formulario para elegir cuenta/tarjeta y
    activar el cobro automático.
  - ⚡ → clic lo desactiva al instante, sin preguntar nada.
  - Con cobro automático activado, el pago ya no aparece con botón
    "Marcar como pagado": se da por pagado solo cuando llega la fecha.
- **Marcar como pagado**: para los pagos manuales (🔁), un clic cuando
  ya lo pagaste, eligiendo desde qué cuenta.
- **Editar / Eliminar** (con advertencia).

---

## 8. Reventas

Para cuentas compartidas que alquilas por perfiles (Netflix, Disney+,
etc.) — cada cliente con su propio ciclo y precio.

- **Nuevo servicio**: nombre, credenciales opcionales, color, y el pago
  programado que cubre el costo real (para calcular tu margen).
- **Nuevo perfil**: nombre/PIN del cupo dentro del servicio.
- Por cada perfil:
  - **💬 Recordar por WhatsApp**.
  - **🔄 (verde) Renovar 1 mes**: un clic, reutiliza mismo cliente,
    precio y cuenta, extiende 30 días.
  - **🔄 (azul) Editar datos del ciclo**: corrige fechas, cliente o
    precio del ciclo actual **sin generar ningún ingreso ni mover
    dinero** — solo cuando el perfil ya tiene alguien asignado. Si el
    perfil está libre, esta misma ventana sirve para asignarlo por
    primera vez (ahí sí registra el cobro).
  - **✏️ Editar perfil**: nombre/PIN.
  - **🗑️ Eliminar perfil**.
- **¿Ya te pagó este ciclo?**: al asignar/renovar, si aún no te pagan se
  registra como cuenta por cobrar en vez de ingreso.
- Panel de **"Vencen pronto"**: avisos automáticos un día antes y el
  mismo día del vencimiento, con mensaje de WhatsApp listo para enviar.

---

## 9. Reportes

- Resumen financiero, gastos por categoría (barra de progreso), resumen
  mensual (ingresos/gastos/balance).
- **Visualizar**: abre el PDF en una pestaña nueva para verlo sin
  descargar.
- **Imprimir**: abre el diálogo de impresión del navegador directo.
- **Descargar**: guarda el PDF (`CashLife-Reporte-{fecha}.pdf`) — diseño
  compacto en 1 hoja (2 si hace falta), con tarjetas de color para los
  números clave y barras para gastos por categoría.

---

## 10. Configuración

- **Método de cobro**: el que usas más seguido (Yape, Plin, transferencia
  a algún banco, Tunki, PayPal, etc.) — se agrega solo a tus mensajes de
  cobranza por WhatsApp.
- **Personalizar mensajes**: edita el texto exacto de cada recordatorio
  (cuenta por cobrar, recordatorio de renovación, vence mañana, vence
  hoy) usando variables `{cliente} {servicio} {perfil} {fecha} {monto}
  {metodoPago}` — botón "Restaurar" por si quieres volver al texto
  original.
- **Tipo de cambio (USD → PEN)**: sugerido al registrar deudas en
  dólares; se puede actualizar manual o automático. Cada deuda guarda su
  propio tipo de cambio del día en que se creó.
- **Notificaciones** y **Tema**.
- **Cerrar sesión**: deshabilitado mientras la app corre en modo local
  (no hay login que cerrar).

---

## Preguntas frecuentes

**¿Por qué no veo "Iniciar sesión"?**
Porque CashLife corre en modo local por ahora — hay un único usuario, sin
contraseña, pensado para que sea rápido de usar en tu propio equipo.

**¿Mis datos se suben a algún servidor?**
No. Todo vive en tu base de datos PostgreSQL local.

**Si borro algo por error, ¿se puede recuperar?**
Los botones de eliminar siempre muestran una advertencia antes de
confirmar, explicando exactamente qué se borra. Una vez confirmado, no
hay "deshacer" desde la interfaz.
