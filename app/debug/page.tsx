'use client';

import { useAuth } from '@/providers/AuthProvider';
import { accountService } from '@/services/account.service';
import { categoryService } from '@/services/category.service';
import { transactionService } from '@/services/transaction.service';
import { useEffect, useState } from 'react';
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
      const [accounts, categories, transactions] = await Promise.all([
        accountService.getAll(user.uid),
        categoryService.getAll(user.uid),
        transactionService.getAll(user.uid),
      ]);

      setData({ accounts, categories, transactions: transactions.items });
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
    return <div className="p-4">Cargando usuario local...</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Debug Dashboard (Postgres)</h1>
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
