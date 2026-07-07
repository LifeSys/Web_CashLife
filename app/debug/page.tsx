'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import React from 'react';

export default function DebugPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadUserData = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    setError('');
    try {
      const userData: any = {};
      
      // Load accounts
      const accountsRef = collection(db, `users/${user.uid}/accounts`);
      const accountsSnap = await getDocs(accountsRef);
      userData.accounts = accountsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Load categories
      const catsRef = collection(db, `users/${user.uid}/categories`);
      const catsSnap = await getDocs(catsRef);
      userData.categories = catsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Load transactions
      const txRef = collection(db, `users/${user.uid}/transactions`);
      const txSnap = await getDocs(txRef);
      userData.transactions = txSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setData(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
    const interval = setInterval(loadUserData, 5000);
    return () => clearInterval(interval);
  }, [user?.uid]);

  if (!user) {
    return <div className="p-4">Please log in first</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Debug Dashboard</h1>
      <button
        onClick={loadUserData}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Refresh Data
      </button>
      
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      
      {data && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold">Accounts ({data.accounts?.length || 0})</h2>
            <pre className="bg-gray-100 p-2 rounded overflow-auto text-xs max-h-60">
              {JSON.stringify(data.accounts, null, 2)}
            </pre>
          </div>
          
          <div>
            <h2 className="text-xl font-bold">Categories ({data.categories?.length || 0})</h2>
            <pre className="bg-gray-100 p-2 rounded overflow-auto text-xs max-h-60">
              {JSON.stringify(data.categories, null, 2)}
            </pre>
          </div>
          
          <div>
            <h2 className="text-xl font-bold">Transactions ({data.transactions?.length || 0})</h2>
            <pre className="bg-gray-100 p-2 rounded overflow-auto text-xs max-h-96">
              {JSON.stringify(data.transactions, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
