# Stack Tecnológico y Arquitectura — CashLife

Documento de referencia técnica: qué tecnologías usa CashLife, cómo está
organizado el código y por qué está hecho así.

---

## 1. Resumen

CashLife es una aplicación **full-stack en Next.js**, corriendo hoy en
**modo local**: un único usuario fijo, sin autenticación real, con
PostgreSQL corriendo en el mismo equipo. El diseño deja el camino
preparado para migrar a una versión web con login real más adelante sin
reescribir la capa de datos.

---

## 2. Tecnologías principales

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Next.js (App Router, Turbopack) | 16.2.6 |
| UI | React | 19 |
| Lenguaje | TypeScript | 5.7 |
| Estilos | Tailwind CSS | v4 |
| Base de datos | PostgreSQL | local |
| ORM | Prisma (con `@prisma/adapter-pg`) | 7.9 |
| Fetching / caché cliente | SWR | 2.4 |
| Formularios | react-hook-form + zod | — |
| Notificaciones (toasts) | sonner | — |
| Íconos | lucide-react | — |
| PDF | jsPDF + jspdf-autotable | — |
| Analítica (solo producción) | @vercel/analytics | — |
| Gestor de paquetes | pnpm | 11 |

---

## 3. Arquitectura en capas

Todo dato que se lee o escribe sigue siempre el mismo camino, en este
orden estricto:

```
Prisma (Postgres)
   ↓
Repository        src/lib/repositories/*.repository.ts
   ↓
Server Action      src/lib/actions/*.actions.ts        ('use server')
   ↓
Service (cliente)  src/services/*.service.ts             (frontera cliente-seguro)
   ↓
Hook (SWR)         src/hooks/use*.ts
   ↓
Componente/página  app/**/page.tsx, src/components/**
```

- **Repository**: única capa que habla con Prisma directamente. Sabe
  hacer `findMany`, `create`, `update`, `delete`, y aplica reglas de
  negocio pesadas (ej. recalcular saldos dentro de una transacción SQL
  atómica con `prisma.$transaction`).
- **Server Action** (`'use server'`): función que Next.js expone al
  cliente de forma segura. Normalmente delega directo al repository, o
  orquesta varios repositorios cuando una operación toca más de una
  tabla (ej. registrar un pago de tarjeta también actualiza el saldo de
  la cuenta que paga).
- **Service**: clase del lado cliente que envuelve las Server Actions.
  Es la única capa que los componentes deberían importar directo — nunca
  un repository ni Prisma desde un componente.
- **Hook**: usa SWR para cachear, revalidar y exponer `mutate()` a los
  componentes.

Esta separación existe para que **todo el cálculo de saldos ocurra en el
servidor**, dentro de transacciones SQL reales, y nunca en el cliente
(evita inconsistencias si dos pestañas escriben a la vez).

---

## 4. Modelo de datos

`prisma/schema.prisma` define todas las tablas. El patrón heredado del
diseño original en Firestore es **"todo cuelga de `userId`"**: cada fila
de cada tabla (cuentas, tarjetas, transacciones, deudas, pagos
programados, servicios de reventa, etc.) tiene su propio `userId`, en vez
de anidar datos bajo un documento de usuario. Esto hace que migrar a
Postgres gestionado en la nube más adelante sea, en teoría, solo cambiar
la `connection string`.

Migraciones: `prisma/migrations/`, gestionadas con
`npx prisma migrate dev --name <algo>`. La connection string vive en
`prisma.config.ts` (Prisma 7 ya no la lee desde el `schema.prisma`).

### Modelos principales

- `User`, `Settings` (incluye plantillas de mensajes de WhatsApp y
  método de cobro).
- `Account` (cuentas de dinero real: banco, efectivo, caja fuerte) y
  `CreditCard` (líneas de crédito, aparte).
- `Transaction`: el ledger central — todo movimiento de dinero pasa por
  aquí, con un campo `tipo` (string) que determina si suma o resta saldo.
- `ReceivableDebt` / `PayableObligation` (+ sus tablas de pagos
  parciales): deudas por cobrar y por pagar.
- `ScheduledPayment` + `ScheduledPaymentPeriod` + `ScheduledPaymentSplit`:
  pagos fijos mensuales, su historial mes a mes, y cómo se dividen entre
  personas.
- `SharedService` + `ServiceProfile` + `ProfileRental`: el módulo de
  Reventas (cuentas compartidas alquiladas por perfiles).
- `Person`: contactos.

### Sobre el campo `Transaction.tipo`

Es un `string`, no un enum estricto de Prisma, porque distintas partes
del código fueron agregando variantes con el tiempo (`card_payment` vs
`credit_card_payment`, `credit_card_charge` vs `card_purchase`, etc.). La
traducción a texto legible para el usuario vive centralizada en
`src/lib/transaction-labels.ts` — **cualquier tipo nuevo que se agregue
debe sumarse ahí también**, o se mostrará el texto crudo en vez de una
etiqueta en español.

---

## 5. Convenciones importantes del código

- **Nunca usar `data ?? []` directo en un array de dependencias de un
  hook** — crea una referencia nueva en cada render y provoca loops
  infinitos. Se usa una constante `EMPTY_ARRAY` compartida
  (`src/hooks/useFinancial.ts`, `useTransactions.ts`, etc.) en su lugar.
- **Aritmética de dinero siempre redondeada a centavos**
  (`roundMoney()` en `src/lib/repositories/transaction.repository.ts`) —
  JavaScript no representa decimales exactos en punto flotante, así que
  cada suma/resta de saldo se redondea antes de guardarse, para que no
  se acumulen residuos de céntimos con el tiempo.
- **Transacciones "cosméticas"**: crear una deuda/obligación también crea
  una fila en `Transaction` (con `relatedDebtId`/`relatedObligationId`,
  usando cuentas pseudo `'accounts-receivable'`/`'accounts-payable'`
  excluidas del cálculo real de saldos) solo para que sea visible en
  Movimientos. Cualquier lógica de borrado de una deuda/obligación debe
  limpiar también esta transacción cosmética, o queda un "fantasma".
- **Confirmaciones de borrado**: nunca usar `window.confirm()` nativo —
  en este entorno viene bloqueado/deshabilitado y falla silenciosamente.
  Se usa el modal propio `ConfirmDeleteModal`
  (`src/components/modals/ConfirmDeleteModal.tsx`).
- **Paginación**: `TransactionRepository.getAll` pagina por defecto (20
  filas) — cualquier hook que necesite el total real de movimientos debe
  pasar `{ limit: 5000 }` explícito, o los cálculos agregados quedan
  truncados silenciosamente.

---

## 6. Estructura de carpetas

```
app/                        Rutas (App Router) — cada carpeta es una página
  dashboard/                 Todas las pantallas autenticadas
    cuentas/, personas/, cuentas-por-cobrar/, cuentas-por-pagar/,
    pagos-programados/, reventas/, reportes/, configuracion/, movimientos/
src/
  components/
    modals/                  Formularios en modal (crear/editar/eliminar)
    sections/                Bloques reutilizables de una pantalla
    design-system/           Tarjetas, badges, layout compartido
    common/                  Utilidades de UI genéricas
  hooks/                     useSWR hooks (useAccounts, useFinancial, etc.)
  services/                  Capa cliente-segura sobre las Server Actions
  lib/
    actions/                 Server Actions ('use server')
    repositories/            Acceso a datos con Prisma
    pdf/                     Generación del reporte en PDF
    whatsapp.ts              Plantillas de mensajes y su motor de variables
    db/prisma.ts             Cliente Prisma singleton
  providers/                 AuthProvider (usuario local fijo)
  types/                     Tipos TypeScript compartidos
prisma/
  schema.prisma              Modelo de datos
  migrations/                Historial de migraciones SQL
```

---

## 7. Variables de entorno

- `DATABASE_URL` — cadena de conexión a PostgreSQL
  (`postgresql://usuario:password@localhost:5432/cashlife?schema=public`),
  en `.env` / `.env.local`.

---

## 8. Scripts (`package.json`)

| Comando | Qué hace |
|---|---|
| `pnpm install` | instala dependencias |
| `pnpm dev` | levanta el servidor de desarrollo (`next dev`, Turbopack) |
| `pnpm build` | build de producción |
| `pnpm start` | sirve el build ya compilado |
| `pnpm lint` | ESLint (requiere tenerlo instalado como dependencia) |
| `npx prisma migrate dev --name X` | crea y aplica una migración |
| `npx prisma generate` | regenera el cliente de Prisma tras tocar el schema |

---

## 9. Rutas sin usar / heredadas

`app/login`, `app/signup` y `app/debug` existen en el código pero no
están enlazados desde la navegación — quedaron de una etapa anterior con
autenticación real (Firebase) y no forman parte del flujo actual en modo
local. Se conservan por si se retoma el login real más adelante.
