# Integración Firebase - CashLife

**¡La aplicación está completamente integrada con Firebase!**

Todo el código está listo para conectar a tu proyecto de Firebase. Solo necesitas configurar las variables de entorno.

## Pasos para Conectar Firebase

### 1. Crear un Proyecto Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Crea un nuevo proyecto (o usa uno existente)
3. Habilita **Authentication** (Email/Password)
4. Crea una base de datos **Cloud Firestore**

### 2. Obtener Credenciales

1. En Firebase Console, ve a **Project Settings** (ícono de engranaje)
2. Copia la configuración de Firebase (debería verse como un objeto con estas claves):
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

### 3. Configurar Variables de Entorno

1. Copia `.env.local.example` a `.env.local`
2. Pega los valores de Firebase en las variables correspondientes:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abc123def456
```

### 4. Desplegar Reglas de Firestore

1. En Firebase Console, ve a **Firestore Database > Rules**
2. Copia el contenido de `firestore.rules` (en el root del proyecto)
3. Pégalo en el editor de reglas de Firestore

### 5. Crear Índices (Opcional)

1. En Firebase Console, ve a **Firestore Database > Indexes**
2. Copia los índices de `firestore.indexes.json`
3. Créalos manualmente o Firebase te lo pedirá cuando hagas las primeras consultas complejas

### 6. Iniciar la Aplicación

```bash
pnpm install
pnpm dev
```

## Estructura de Datos en Firestore

La aplicación usa la siguiente estructura:

```
users/
  {uid}/
    profile (documento)
      - email
      - nombre
      - createdAt
      - updatedAt
    
    settings/config (documento)
      - moneda
      - tema
      - notificaciones
    
    accounts/ (subcolección)
      {accountId}/
        - nombre
        - saldo
        - tipo (cash, bank, wallet, safe_box)
        - color
        - icono
        - createdAt, updatedAt, createdBy, updatedBy
    
    categories/ (subcolección)
      {categoryId}/
        - nombre
        - icono
        - color
        - createdAt, updatedAt, createdBy, updatedBy
    
    transactions/ (subcolección)
      {txId}/
        - monto
        - tipo (expense, income, transfer, loan, loan_payment)
        - descripcion
        - fecha
        - cuenta (accountId)
        - categoria (categoryId)
        - persona (personId)
        - isDeleted (soft delete)
        - deletedAt, deletedBy
        - createdAt, updatedAt, createdBy, updatedBy
    
    people/ (subcolección)
      {personId}/
        - nombre
        - deuda
        - tipo (PRESTAMISTA, DEUDOR)
        - fecha
        - createdAt, updatedAt, createdBy, updatedBy
```

## Características Implementadas

### Arquitectura por Capas
- **Componentes** → **Hooks** → **Services** → **Repositories** → **Firebase**
- Separación perfecta de responsabilidades
- Fácil migración a otras bases de datos (cambiando solo repositories)

### Autenticación
- Registro con email/password
- Login automático al refrescar página
- Sesión persistente
- Logout limpia

### Datos
- Cada usuario tiene sus propios datos
- Sin acceso entre usuarios
- Auditoría completa (createdBy, updatedBy, deletedBy)

### Transacciones Atómicas
- Crear transacción = actualizar saldo + crear movimiento (garantizado)
- Eliminar transacción = revertir saldo + soft delete (garantizado)
- Si algo falla, todo se revierte (ACID)

### SWR Caché
- Datos cacheados localmente
- Revalidación automática cada 60 segundos
- Invalidación manual después de cambios
- Reduce consultas innecesarias a Firestore

### Paginación
- Todas las consultas soportan paginación
- Preparado para millones de registros
- `limit()`, `orderBy()`, `startAfter()` implementados

### Validación
- React Hook Form + Zod en formularios
- Validación en Firestore Rules
- Mensajes de error claros

### Seguridad
- Firestore Rules implementadas
- Solo usuario autenticado accede a sus datos
- Soft delete nunca pierde historial
- serverTimestamp() en todas las fechas

## Flujo de Registro

1. Usuario entra credenciales en `/signup`
2. AuthProvider llama `signUp(email, password, nombre)`
3. Firebase Auth crea cuenta
4. UserInitializationService crea:
   - Perfil de usuario
   - Configuración por defecto
   - 7 cuentas por defecto
   - 10 categorías por defecto
5. Usuario redirige a `/dashboard`
6. SessionProvider verifica sesión activa

## Flujo de Transacción

1. Usuario llena formulario de transacción
2. TransactionService.create() calcula nuevo saldo
3. TransactionRepository.create() usa `runTransaction()` atómico:
   - Obtiene cuenta
   - Calcula nuevo saldo
   - Actualiza saldo en documento
   - Crea documento de transacción
   - Commit atómico
4. Si algo falla, TODO se revierte
5. SWR invalida caché automáticamente

## Variables de Entorno Requeridas

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

## Debugging

Para ver logs de Firestore:
```bash
# En navegador DevTools
localStorage.setItem('firebase-log-level', 'debug');
```

Para ver logs de Auth:
```bash
# En navigador DevTools
localStorage.setItem('firebase-auth-log-level', 'debug');
```

## Próximos Pasos

1. **Configurar Firebase** con los pasos arriba
2. **Crear usuario de prueba** en `/signup`
3. **Agregar transacción** desde dashboard
4. **Verificar datos** en Firestore Console
5. **Desplegar en Vercel** (todo funciona automáticamente)

## Características Listas para Usar

- ✅ Autenticación completa
- ✅ Gestión de cuentas
- ✅ Historial de transacciones
- ✅ Categorías y personas
- ✅ Configuración de usuario
- ✅ Transacciones atómicas
- ✅ Caché con SWR
- ✅ Paginación escalable
- ✅ Seguridad Firestore Rules
- ✅ Auditoría completa
- ✅ Soft delete para historial

## Arquitectura Escalable

Esta arquitectura está preparada para:
- Millones de usuarios
- Billones de transacciones
- Migración a otra BD (solo cambiar repositories)
- Multi-tenant (ya está separado por uid)
- Análisis de datos (auditoría completa)
- Backups automáticos (Firestore)

¡La aplicación está lista para producción! 🚀
