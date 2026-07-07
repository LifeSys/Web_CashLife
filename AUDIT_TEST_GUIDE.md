# CashLife Financial System Audit - Test Guide

## Overview
This document outlines how to verify that the financial system is working correctly after the unification audit. All operations should now flow through the Financial Engine as a single source of truth.

---

## Pre-Test Checklist

- [ ] Project builds without errors: `npm run build`
- [ ] Dev server starts: `npm run dev`
- [ ] User is authenticated in the app
- [ ] Test Firebase project is active
- [ ] No console errors in browser DevTools

---

## Test Case 1: Multa SAT (S/550 on BBVA Gold Card)

**Operation**: Record a credit card charge/expense

**Setup**:
1. Navigate to Dashboard
2. Click on the button/modal to create a new transaction
3. Select "Gasto con Tarjeta" or "Credit Card Charge"
4. Fill in:
   - Descripción: "Multa SAT"
   - Monto: 550
   - Tarjeta: Select "BBVA Oro" (or your test credit card)
   - Fecha: Today
   - Click "Registrar"

**Expected Results**:
- [ ] ✓ Toast shows "Gasto registrado correctamente"
- [ ] ✓ Appears in "Movimientos" page as `credit_card_charge` type
- [ ] ✓ Appears in "Reportes" under "Gastos del Mes"
- [ ] ✓ Dashboard "Tarjetas - Utilizado" increases by 550
- [ ] ✓ Dashboard "Gastos" metric increases by 550
- [ ] ✓ Credit card document in Firestore shows usedAmount +550

**Firestore Check**:
```
users/{uid}/transactions/{id}:
  - tipo: "credit_card_charge"
  - monto: 550
  - descripcion: "Multa SAT"
  - creditCardId: "bbva-oro-id"

users/{uid}/credit_cards/bbva-oro-id:
  - usedAmount: +550
```

---

## Test Case 2: Ingreso - Préstamo de Equipo (S/10)

**Operation**: Record income from loan of equipment

**Setup**:
1. Navigate to Dashboard
2. Click to create "Nuevo Ingreso"
3. Fill in:
   - Descripción: "Préstamo de equipo"
   - Monto: 10
   - Cuenta: Select your test account (e.g., "Mi Billetera")
   - Categoría: Select appropriate category
   - Fecha: Today
   - Click "Registrar Ingreso"

**Expected Results**:
- [ ] ✓ Toast shows "Ingreso registrado correctamente"
- [ ] ✓ Appears in "Movimientos" as `income` type
- [ ] ✓ Appears in "Reportes" under "Ingresos del Mes"
- [ ] ✓ Selected account balance increased by 10
- [ ] ✓ Dashboard "Dinero Disponible" increased by 10
- [ ] ✓ Dashboard "Ingresos" metric increased by 10

**Firestore Check**:
```
users/{uid}/transactions/{id}:
  - tipo: "income"
  - monto: 10
  - descripcion: "Préstamo de equipo"
  - cuenta: "billetera-id"

users/{uid}/accounts/billetera-id:
  - saldo: +10
```

---

## Test Case 3: Compra Disney (S/10)

**Operation**: Record a simple expense

**Setup**:
1. Navigate to Dashboard
2. Click to create "Nuevo Gasto"
3. Fill in:
   - Descripción: "Compra Disney"
   - Monto: 10
   - Cuenta: Select payment account
   - Categoría: "Entretenimiento" or similar
   - Fecha: Today
   - Click "Registrar Gasto"

**Expected Results**:
- [ ] ✓ Toast shows "Gasto registrado correctamente"
- [ ] ✓ Appears in "Movimientos" as `expense` type
- [ ] ✓ Appears in "Reportes" under "Gastos del Mes"
- [ ] ✓ Account balance decreased by 10
- [ ] ✓ Dashboard "Dinero Disponible" decreased by 10
- [ ] ✓ Dashboard "Gastos" metric increased by 10

**Firestore Check**:
```
users/{uid}/transactions/{id}:
  - tipo: "expense"
  - monto: 10
  - descripcion: "Compra Disney"
  - cuenta: "account-id"

users/{uid}/accounts/account-id:
  - saldo: -10
```

---

## Test Case 4: Cobro Parcial - Receivable Payment (S/100)

**Operation**: Collect partial payment from money owed

**Setup**:
1. Create a receivable debt first (if you don't have one):
   - Go to "Cuentas por Cobrar"
   - Click "Nueva Deuda por Cobrar"
   - Fill: Persona, Descripción, Monto (e.g., 500), Fecha
   - Click "Crear Deuda"

2. Now record a partial payment:
   - In "Cuentas por Cobrar", find the debt
   - Click on it or the payment button
   - Select payment option
   - Fill in:
     - Monto: 100 (partial of 500)
     - Cuenta Destino: Select receiving account
     - Fecha: Today
     - Click "Registrar Pago"

**Expected Results**:
- [ ] ✓ Toast shows "Pago registrado correctamente"
- [ ] ✓ Appears in "Movimientos" as `receivable_payment` type
- [ ] ✓ Appears in "Reportes" under "Ingresos del Mes"
- [ ] ✓ Account balance increased by 100
- [ ] ✓ Dashboard "Me Deben" decreased by 100
- [ ] ✓ Dashboard "Ingresos" metric increased by 100
- [ ] ✓ Receivable debt record shows pendingBalance -100

**Firestore Check**:
```
users/{uid}/transactions/{id}:
  - tipo: "receivable_payment"
  - monto: 100
  - relatedDebtId: "debt-id"

users/{uid}/receivable_debts/debt-id:
  - pendingBalance: -100 (from 500 to 400)

users/{uid}/accounts/destination-id:
  - saldo: +100
```

---

## Test Case 5: Pago Parcial - Payable Payment (S/150)

**Operation**: Pay partial obligation owed

**Setup**:
1. Create a payable obligation first (if needed):
   - Go to "Cuentas por Pagar"
   - Click "Nueva Obligación"
   - Fill: Acreedor, Descripción, Monto (e.g., 500), Fecha
   - Click "Crear Obligación"

2. Record a partial payment:
   - In "Cuentas por Pagar", find the obligation
   - Click on it or the payment button
   - Select payment option
   - Fill in:
     - Monto: 150 (partial of 500)
     - Cuenta de Pago: Select paying account
     - Fecha: Today
     - Click "Registrar Pago"

**Expected Results**:
- [ ] ✓ Toast shows "Pago registrado correctamente"
- [ ] ✓ Appears in "Movimientos" as `payable_payment` type
- [ ] ✓ Appears in "Reportes" under "Gastos del Mes"
- [ ] ✓ Account balance decreased by 150
- [ ] ✓ Dashboard "Total Debo" decreased by 150
- [ ] ✓ Dashboard "Gastos" metric increased by 150
- [ ] ✓ Payable obligation record shows pendingBalance -150

**Firestore Check**:
```
users/{uid}/transactions/{id}:
  - tipo: "payable_payment"
  - monto: 150
  - relatedObligationId: "obligation-id"

users/{uid}/payable_obligations/obligation-id:
  - pendingBalance: -150 (from 500 to 350)

users/{uid}/accounts/payment-id:
  - saldo: -150
```

---

## Test Case 6: Pago de Tarjeta (S/200)

**Operation**: Pay credit card balance

**Setup**:
1. First, ensure you have a credit card with used amount:
   - If not, do Test Case 1 to charge a credit card

2. Record a credit card payment:
   - Navigate to Dashboard or find credit card payment option
   - Fill in:
     - Monto: 200 (payment amount)
     - Cuenta de Pago: Select account to pay from
     - Tarjeta: Select credit card being paid
     - Fecha: Today
     - Click "Registrar Pago"

**Expected Results**:
- [ ] ✓ Toast shows "Pago de tarjeta registrado correctamente"
- [ ] ✓ Appears in "Movimientos" as `credit_card_payment` type
- [ ] ✓ Appears in "Reportes" under "Gastos del Mes" (as expense)
- [ ] ✓ Account balance decreased by 200
- [ ] ✓ Credit card usedAmount decreased by 200
- [ ] ✓ Dashboard "Deuda en Tarjeta" decreased by 200
- [ ] ✓ Dashboard "Gastos" metric increased by 200

**Firestore Check**:
```
users/{uid}/transactions/{id}:
  - tipo: "credit_card_payment"
  - monto: 200
  - creditCardId: "card-id"
  - cuenta: "account-id"

users/{uid}/credit_cards/card-id:
  - usedAmount: -200

users/{uid}/accounts/account-id:
  - saldo: -200
```

---

## Dashboard Verification Checklist

After running all test cases, verify Dashboard shows:

- [ ] **Dinero Disponible**: Reflects all account balance changes
  - Should have started balance + Income (10) - Expense (10) - CC Payment (200)
  
- [ ] **Patrimonio Neto**: Accounts + Receivables - Obligations - CC Debt
  - Available Money + Me Deben - Total Debo

- [ ] **Me Deben**: Shows remaining receivable amount
  - Started 500, paid 100 = 400 remaining

- [ ] **Total Debo**: Shows total obligations + CC used + payables
  - CC debt + remaining payable obligation + other debts

- [ ] **Ingresos del Mes**: S/10 + S/100 = S/110
  - Direct income + receivable payments + loan receipts

- [ ] **Gastos del Mes**: S/550 (CC) + S/10 (expense) + S/150 (payable) + S/200 (CC payment) = S/910
  - Expenses + CC charges + payable payments + CC payments

---

## Reports Verification Checklist

Navigate to "Reportes" and verify:

- [ ] **Monthly Income Graph/Stats**: Shows S/110
  - Includes: income, receivable_payment, loan types

- [ ] **Monthly Expenses Graph/Stats**: Shows S/910
  - Includes: expense, credit_card_charge, payable_payment, credit_card_payment, scheduled_payment

- [ ] **Expense Breakdown by Category**:
  - "Entretenimiento": S/10 (Disney)
  - Other categories from test cases shown

- [ ] **Receivables & Payables Section**:
  - Shows receivable debt with S/400 pending
  - Shows payable obligation with S/350 pending

---

## Movimientos Verification Checklist

Navigate to "Movimientos" and verify all transactions appear:

- [ ] [ ] 1 x `credit_card_charge` (Multa SAT, S/550)
- [ ] [ ] 1 x `income` (Préstamo de equipo, S/10)
- [ ] [ ] 1 x `expense` (Compra Disney, S/10)
- [ ] [ ] 1 x `receivable_payment` (Cobro parcial, S/100)
- [ ] [ ] 1 x `payable_payment` (Pago parcial, S/150)
- [ ] [ ] 1 x `credit_card_payment` (Pago de tarjeta, S/200)

All transactions should:
- Show correct amounts
- Show correct dates
- Show correct descriptions
- Have proper account references
- Display correct transaction type

---

## Firestore Integrity Checks

For complete verification, check Firestore Console:

```
For each transaction type, verify:
1. Transaction exists in users/{uid}/transactions/
2. Related documents updated (accounts, credit_cards, receivable_debts, payable_obligations)
3. Amounts are correct and in sync
4. No orphaned records
5. All fields populated correctly

Key Collections to Check:
- users/{uid}/transactions (6 new entries)
- users/{uid}/accounts (balances updated)
- users/{uid}/credit_cards (usedAmount updated)
- users/{uid}/receivable_debts (pendingBalance updated)
- users/{uid}/payable_obligations (pendingBalance updated)
```

---

## Success Criteria

The audit is successful when ALL of the following are true:

✓ **Financial Engine Unity**
- All modals use Financial Engine (no direct service calls)
- No bypassed paths

✓ **Complete Data Flow**
- All 6 transaction types appear in Movimientos
- All transaction types affect Dashboard correctly
- All transaction types appear in Reports correctly

✓ **Calculation Accuracy**
- Dashboard metrics match manual calculations
- Reports income/expense totals correct
- Category breakdowns accurate

✓ **Firestore Consistency**
- No orphaned records
- All related documents updated atomically
- No missing or out-of-sync data

✓ **Compilation & Stability**
- Project builds without errors
- No console errors during operations
- All SWR hooks update correctly

---

## Troubleshooting

If a test case fails:

1. **Check Console Errors**
   - Open DevTools → Console tab
   - Look for JavaScript errors
   - Check Network tab for failed API calls

2. **Check Firestore**
   - Verify document was created
   - Check field values are correct
   - Look for transaction timestamps

3. **Check Browser Cache**
   - Clear SWR cache with DevTools
   - Do a hard refresh (Ctrl+Shift+R)
   - Check if data syncs after refresh

4. **Verify Financial Engine Path**
   - Confirm modal imports `financialEngine`
   - Check method names match exactly
   - Verify return values are handled

5. **Check Toast Messages**
   - If no success toast, check for error toast
   - If error, read the message for clues
   - Check console for stack trace

---

## Next Steps

After verification:

1. [ ] Commit changes with descriptive message
2. [ ] Create PR for code review
3. [ ] Merge to main branch
4. [ ] Deploy to production
5. [ ] Monitor for issues in real environment
6. [ ] Document any findings in tickets

---

## Commit Reference

Implementation commit: `46d5698`

Changes included:
- 5 modals unified to use Financial Engine
- Dashboard calculations updated
- Reports calculations updated
- Financial Engine wrapper methods added
- All 9 files modified for consistency

Total changes: 9 files, 55 insertions(+), 28 deletions(-)
