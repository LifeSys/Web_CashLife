import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyA7frk_FkHzBASUhbDJUJN4HTomAdRC4H8',
  authDomain: 'cashlife-core-81625.firebaseapp.com',
  projectId: 'cashlife-core-81625',
  storageBucket: 'cashlife-core-81625.appspot.com',
  messagingSenderId: '809026736634',
  appId: '1:809026736634:web:ae45f1af43390474be1443',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function verifyData() {
  console.log('\n===== FIRESTORE VERIFICATION REPORT =====\n');
  
  try {
    // Get all users
    const usersRef = collection(db, 'users');
    const usersSnap = await getDocs(usersRef);
    
    console.log(`Found ${usersSnap.docs.length} user(s)\n`);
    
    for (const userDoc of usersSnap.docs) {
      const uid = userDoc.id;
      const userData = userDoc.data();
      console.log(`\n--- User: ${uid} ---`);
      console.log(`Email: ${userData.email || 'N/A'}`);
      
      // Check Efectivo account
      const accountsRef = collection(db, `users/${uid}/accounts`);
      const accountsSnap = await getDocs(accountsRef);
      console.log(`\nAccounts (${accountsSnap.docs.length}):`);
      
      let efectivoExists = false;
      for (const accDoc of accountsSnap.docs) {
        const acc = accDoc.data();
        console.log(`  - ${acc.nombre} (${acc.tipo}): Saldo ${acc.saldo || acc.balance || 0}`);
        if (acc.nombre === 'Efectivo') efectivoExists = true;
      }
      
      if (!efectivoExists) {
        console.log(`  ⚠️  WARNING: Efectivo account not found!`);
      }
      
      // Check categories
      const catsRef = collection(db, `users/${uid}/categories`);
      const catsSnap = await getDocs(catsRef);
      console.log(`\nCategories (${catsSnap.docs.length}):`);
      
      let expenseCount = 0;
      let incomeCount = 0;
      let missingType = 0;
      
      for (const catDoc of catsSnap.docs) {
        const cat = catDoc.data();
        if (!cat.tipo) {
          console.log(`  ⚠️  Missing tipo: ${cat.nombre}`);
          missingType++;
        } else if (cat.tipo === 'expense') {
          expenseCount++;
        } else if (cat.tipo === 'income') {
          incomeCount++;
        }
      }
      
      console.log(`  Expense: ${expenseCount}, Income: ${incomeCount}`);
      if (missingType > 0) console.log(`  ⚠️  ${missingType} categories missing 'tipo' field`);
      
      // Check transactions
      const txRef = collection(db, `users/${uid}/transactions`);
      const txSnap = await getDocs(txRef);
      console.log(`\nTransactions (${txSnap.docs.length}):`);
      
      let txWithUndefined = 0;
      let txWithNaN = 0;
      let txByType = {};
      
      for (const txDoc of txSnap.docs) {
        const tx = txDoc.data();
        const txType = tx.type || 'unknown';
        txByType[txType] = (txByType[txType] || 0) + 1;
        
        // Check for undefined or NaN
        for (const [key, value] of Object.entries(tx)) {
          if (value === undefined) {
            console.log(`  ⚠️  Transaction ${txDoc.id} has undefined field: ${key}`);
            txWithUndefined++;
          }
          if (typeof value === 'number' && isNaN(value)) {
            console.log(`  ⚠️  Transaction ${txDoc.id} has NaN field: ${key}`);
            txWithNaN++;
          }
        }
      }
      
      console.log(`  By type:`, txByType);
      if (txWithUndefined > 0) console.log(`  ⚠️  ${txWithUndefined} transactions have undefined fields`);
      if (txWithNaN > 0) console.log(`  ⚠️  ${txWithNaN} transactions have NaN fields`);
    }
    
    console.log('\n===== END VERIFICATION =====\n');
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
}

verifyData();
