# Data Layer Stabilization - Testing Checklist

## Phase 1: Verify Transaction Creation
All operations must create exactly ONE transaction in Firestore.

### Test 1: Register Expense
1. Open Dashboard
2. Click "Registrar Gasto"
3. Fill: Descripción="Test Expense", Monto=100, Cuenta=Efectivo, Categoría=Comida, Fecha=today
4. Submit
5. **Verify:**
   - Toast shows "Gasto registrado correctamente"
   - No page reload needed
   - Dashboard balance updates immediately
   - Movimientos page shows new transaction with type='expense'
   - Efectivo balance decreased by 100
   - One transaction created in Firestore

### Test 2: Register Income
1. Open Dashboard
2. Click "Registrar Ingreso"
3. Fill: Descripción="Test Income", Monto=500, Cuenta=Efectivo, Categoría=Salario, Fecha=today
4. Submit
5. **Verify:**
   - Toast shows "Ingreso registrado correctamente"
   - Dashboard balance updates immediately
   - Movimientos shows new transaction with type='income'
   - Efectivo balance increased by 500
   - One transaction created in Firestore

### Test 3: Transfer Money
1. Create two bank accounts first (from Cuentas module)
2. Open Dashboard
3. Click "Realizar Transferencia"
4. Fill: From=Efectivo (previous balance 400), To=BankAccount, Monto=200, Fecha=today
5. Submit
6. **Verify:**
   - Toast shows "Transferencia realizada correctamente"
   - Efectivo balance = 200
   - BankAccount balance increased by 200
   - Movimientos shows one transaction with type='transfer'
   - From/To both updated atomically

### Test 4: Credit Card Purchase
1. Create a credit card (from Cuentas module)
2. Navigate to Cuentas > Credit Cards section
3. Click "Registrar Compra" on the card
4. Fill: Monto=150, Categoría=Compras, Fecha=today
5. Submit
6. **Verify:**
   - Card utilization increased by 150
   - Card available amount decreased by 150
   - Transaction created with type='card_purchase'
   - No account balance change (only utilization)

### Test 5: Credit Card Payment
1. From Cuentas > Credit Cards section
2. Click "Realizar Pago" on a card with balance
3. Fill: Monto=100, From=Efectivo, Fecha=today
4. Submit
5. **Verify:**
   - Card utilization decreased by 100
   - Efectivo balance decreased by 100
   - Transaction created with type='card_payment'

## Phase 2: Verify Category System
Categories must be auto-created on signup with correct types.

### Test 6: New User Signup
1. Create new account with email/password
2. Complete onboarding
3. Navigate to Dashboard
4. **Verify:**
   - Efectivo account exists and visible
   - No errors in console
   - Can open Registrar Gasto modal
   - Expense categories available: Comida, Transporte, Salud, Educación, Hogar, Servicios, Entretenimiento, Compras, Viajes, Mascotas, Impuestos, Otros
   - Income categories available: Salario, Ventas, Freelance, Negocio, Inversiones, Regalos, Reembolso, Otros

### Test 7: Category Filtering
1. Open Registrar Gasto - should show ONLY expense categories
2. Open Registrar Ingreso - should show ONLY income categories
3. **Verify:**
   - Gasto shows 12 expense categories
   - Ingreso shows 8 income categories
   - No mixing of categories

## Phase 3: Real-Time Data Sync
Data updates without page reload after operations.

### Test 8: Dashboard Auto-Update
1. Open Dashboard in one tab
2. Register expense from the same tab
3. **Verify:**
   - Balance updates immediately (no reload)
   - Recent activity shows new transaction
   - Movimientos count increased

### Test 9: Movimientos Real-Time
1. Open Movimientos page
2. Register gasto/ingreso/transfer from Dashboard
3. **Verify:**
   - New transaction appears in Movimientos list
   - Sorted newest first
   - No page reload needed
   - Type displayed correctly

## Phase 4: Data Cleanup
Existing corrupted data is fixed on login.

### Test 10: First Login Cleanup
1. For existing users, check browser console
2. Login to app
3. **Verify:**
   - No console errors about undefined/NaN
   - Cleanup script runs silently
   - All existing transactions display correctly
   - No "Unsupported field value" errors in Firestore

## Phase 5: No Undefined/NaN
All Firestore writes must be clean.

### Test 11: Inspect Firestore Data
1. Open Firebase Console
2. Navigate to users/{uid}/transactions collection
3. Click several random transaction documents
4. **Verify:**
   - No `undefined` fields anywhere
   - No `NaN` values
   - All required fields present and valid
   - All numbers are actual numbers (not strings)

### Test 12: Firestore Error Prevention
1. Register multiple expenses/incomes in quick succession
2. Monitor Firebase error logs
3. **Verify:**
   - No "Unsupported field value" errors
   - No "Invalid argument" errors
   - All operations succeed without Firestore errors

## Phase 6: Atomicity
Operations are all-or-nothing at Firestore level.

### Test 13: Transfer Atomicity
1. Get account A balance and B balance
2. Initiate transfer from A to B
3. Monitor Firestore during operation (or simulate interruption)
4. **Verify:**
   - Both accounts updated together
   - Or both NOT updated (if transfer fails)
   - Transaction always created if balances updated
   - No orphaned transactions

## Rollback/Troubleshooting

If tests fail:

### If transactions not appearing in Movimientos:
- Check `invalidateAfterMovement` is called in modal
- Verify useTransactions hook returns data
- Check Firestore has transactions with correct uid

### If balance not updating:
- Verify account type is not 'credit_card' for balance ops
- Check saldo field is present (not balance)
- Verify calculateNewBalance logic in transaction.service.ts

### If categories not appearing:
- Check CategoryRepository.getAll returns data
- Verify categories have tipo='expense' or 'income'
- Check UserRepository.initializeNewUser creates defaults on signup

### If Firestore errors about undefined:
- Run cleanupUserData manually
- Check all service methods use cleanFirestoreData
- Verify BaseRepository createAuditedData/updateAuditedData wraps with cleaner

## Sign-Off
Once all tests pass:
- [ ] All 13 tests completed successfully
- [ ] No console errors
- [ ] No Firestore errors
- [ ] Real-time sync working
- [ ] Cleanup running on login
- [ ] Categories auto-created
- [ ] Data is clean (no undefined/NaN)
