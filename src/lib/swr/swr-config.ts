import { useSWRConfig } from 'swr';

/**
 * Centralized SWR cache keys and invalidation strategy
 * Single source of truth for all data fetching cache keys
 */

export const SWR_KEYS = {
  // Transactions - PRIMARY SOURCE
  TRANSACTIONS: (uid: string) => ['transactions', uid],
  TRANSACTIONS_BY_DATE: (uid: string, startDate: string, endDate: string) => ['transactions', uid, 'dateRange', startDate, endDate],
  TRANSACTIONS_BY_ACCOUNT: (uid: string, accountId: string) => ['transactions', uid, 'account', accountId],
  TRANSACTIONS_BY_CATEGORY: (uid: string, categoryId: string) => ['transactions', uid, 'category', categoryId],
  TRANSACTIONS_BY_PERSON: (uid: string, personId: string) => ['transactions', uid, 'person', personId],

  // Accounts
  ACCOUNTS: (uid: string) => ['accounts', uid],
  ACCOUNT_TOTAL: (uid: string) => ['accountTotal', uid],

  // Credit Cards
  CREDIT_CARDS: (uid: string) => ['creditCards', uid],

  // Categories
  CATEGORIES: (uid: string) => ['categories', uid],

  // People / Contacts
  PEOPLE: (uid: string) => ['people', uid],
  PERSON_DETAIL: (uid: string, personId: string) => ['person', uid, personId],

  // Receivable Debts (now backed by transactions)
  RECEIVABLE_DEBTS: (uid: string) => ['receivable-debts', uid],
  RECEIVABLE_DEBT_DETAIL: (uid: string, debtId: string) => ['receivable-debt', uid, debtId],

  // Payable Obligations (now backed by transactions)
  PAYABLE_OBLIGATIONS: (uid: string) => ['payable-obligations', uid],
  PAYABLE_OBLIGATION_DETAIL: (uid: string, obligationId: string) => ['payable-obligation', uid, obligationId],

  // Scheduled Payments
  SCHEDULED_PAYMENTS: (uid: string) => ['scheduled-payments', uid],
  SCHEDULED_PAYMENT_PERIODS: (uid: string, paymentId: string) => ['scheduled-payment-periods', uid, paymentId],

  // Financial summaries (derived from transactions)
  FINANCIAL_SUMMARY: (uid: string) => ['financial-summary', uid],
  INCOME_TOTAL: (uid: string) => ['income-total', uid],
  EXPENSE_TOTAL: (uid: string) => ['expense-total', uid],
  BALANCE: (uid: string) => ['balance', uid],

  // Onboarding
  ONBOARDING_STATUS: (uid: string) => ['onboarding', uid],
};

/**
 * Hook to invalidate SWR cache keys after operations
 * Use this in modals and components after mutations
 */
export function useSWRInvalidation() {
  const { mutate } = useSWRConfig();

  return {
    // Invalidate single key
    invalidate: (key: string | string[] | null) => {
      if (key) mutate(key);
    },

    // Invalidate multiple keys by pattern
    invalidatePattern: (pattern: string) => {
      mutate((key) => {
        if (typeof key === 'string') return key.includes(pattern);
        if (Array.isArray(key)) return JSON.stringify(key).includes(pattern);
        return false;
      });
    },

    // Invalidate all user data after any operation
    invalidateAll: (uid: string) => {
      mutate((key) => {
        if (Array.isArray(key) && key.includes(uid)) return true;
        return false;
      });
    },

    // Invalidate after expense/income/transfer (affects most screens)
    invalidateAfterMovement: (uid: string) => {
      // Invalidate transactions (primary source)
      mutate((key) => {
        if (typeof key === 'string') return false;
        if (Array.isArray(key) && key[0] === 'transactions' && key[1] === uid) return true;
        return false;
      });

      // Invalidate financial summaries
      mutate((key) => {
        if (typeof key === 'string') return false;
        if (Array.isArray(key) && key[1] === uid) {
          const keyName = key[0];
          return ['financial-summary', 'income-total', 'expense-total', 'balance'].includes(keyName);
        }
        return false;
      });

      // Invalidate accounts (balances may change)
      mutate((key) => {
        if (typeof key === 'string') return false;
        if (Array.isArray(key) && (key[0] === 'accounts' || key[0] === 'accountTotal') && key[1] === uid) return true;
        return false;
      });
    },

    // Invalidate after receivable debt operation
    invalidateAfterReceivable: (uid: string) => {
      // Invalidate receivable debts
      mutate((key) => {
        if (typeof key === 'string') return false;
        if (Array.isArray(key) && key[0] === 'receivable-debts' && key[1] === uid) return true;
        if (Array.isArray(key) && key[0] === 'receivable-debt' && key[1] === uid) return true;
        return false;
      });

      // Invalidate related person
      mutate((key) => {
        if (typeof key === 'string') return false;
        if (Array.isArray(key) && (key[0] === 'person' || key[0] === 'people') && key[1] === uid) return true;
        return false;
      });

      // Invalidate transactions
      mutate((key) => {
        if (typeof key === 'string') return false;
        if (Array.isArray(key) && key[0] === 'transactions' && key[1] === uid) return true;
        return false;
      });
    },

    // Invalidate after payable obligation operation
    invalidateAfterPayable: (uid: string) => {
      // Invalidate payable obligations
      mutate((key) => {
        if (typeof key === 'string') return false;
        if (Array.isArray(key) && key[0] === 'payable-obligations' && key[1] === uid) return true;
        if (Array.isArray(key) && key[0] === 'payable-obligation' && key[1] === uid) return true;
        return false;
      });

      // Invalidate related person
      mutate((key) => {
        if (typeof key === 'string') return false;
        if (Array.isArray(key) && (key[0] === 'person' || key[0] === 'people') && key[1] === uid) return true;
        return false;
      });

      // Invalidate transactions
      mutate((key) => {
        if (typeof key === 'string') return false;
        if (Array.isArray(key) && key[0] === 'transactions' && key[1] === uid) return true;
        return false;
      });
    },

    // Invalidate after credit card charge/payment
    invalidateAfterCreditCard: (uid: string) => {
      // Invalidate credit cards
      mutate((key) => {
        if (typeof key === 'string') return false;
        if (Array.isArray(key) && key[0] === 'creditCards' && key[1] === uid) return true;
        return false;
      });

      // Invalidate transactions
      mutate((key) => {
        if (typeof key === 'string') return false;
        if (Array.isArray(key) && key[0] === 'transactions' && key[1] === uid) return true;
        return false;
      });

      // Invalidate financial summaries
      mutate((key) => {
        if (typeof key === 'string') return false;
        if (Array.isArray(key) && key[1] === uid) {
          const keyName = key[0];
          return ['financial-summary', 'balance'].includes(keyName);
        }
        return false;
      });
    },

    // Invalidate after scheduled payment
    invalidateAfterScheduledPayment: (uid: string) => {
      // Invalidate scheduled payments
      mutate((key) => {
        if (typeof key === 'string') return false;
        if (Array.isArray(key) && key[0] === 'scheduled-payments' && key[1] === uid) return true;
        if (Array.isArray(key) && key[0] === 'scheduled-payment-periods' && key[1] === uid) return true;
        return false;
      });

      // Invalidate transactions and accounts
      this.invalidateAfterMovement(uid);
    },
  };
}
