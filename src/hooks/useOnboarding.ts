'use client';

import useSWR from 'swr';
import { toast } from 'sonner';
import { useAuth } from '@/providers/AuthProvider';
import { accountService } from '@/services/account.service';
import { creditCardService } from '@/services/credit-card.service';
import { personService } from '@/services/person.service';
import { settingsService } from '@/services/settings.service';
import { subscriptionService } from '@/services/subscription.service';
import { Account, CreditCard, Person, Subscription } from '@/types';

export function useOnboarding() {
  const { user } = useAuth();
  const uid = user?.uid;
  const accounts = useSWR(uid ? ['accounts', uid] : null, () => uid ? accountService.getAll(uid) : []);
  const cards = useSWR(uid ? ['creditCards', uid] : null, () => uid ? creditCardService.getAll(uid) : []);
  const subscriptions = useSWR(uid ? ['subscriptions', uid] : null, () => uid ? subscriptionService.getAll(uid) : []);
  const people = useSWR(uid ? ['people', uid] : null, () => uid ? personService.getAll(uid) : []);

  const guard = () => {
    if (!uid) throw new Error('Usuario no autenticado');
    return uid;
  };

  const run = async <T,>(message: string, action: (uid: string) => Promise<T>) => {
    try {
      const result = await action(guard());
      toast.success(message);
      await Promise.all([accounts.mutate(), cards.mutate(), subscriptions.mutate(), people.mutate()]);
      return result;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo guardar la información');
      throw error;
    }
  };

  return {
    accounts: accounts.data ?? [],
    creditCards: cards.data ?? [],
    subscriptions: subscriptions.data ?? [],
    people: people.data ?? [],
    loading: accounts.isLoading || cards.isLoading || subscriptions.isLoading || people.isLoading,
    saveCurrency: (moneda: string) => run('Moneda guardada', (uid) => settingsService.update(uid, { moneda })),
    createAccount: (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) => run('Cuenta guardada', (uid) => accountService.create(uid, account)),
    createCreditCard: (card: Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) => run('Tarjeta guardada', (uid) => creditCardService.create(uid, card)),
    createSubscription: (subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) => run('Pago recurrente guardado', (uid) => subscriptionService.create(uid, subscription)),
    createPerson: (person: Omit<Person, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) => run('Registro guardado', (uid) => personService.create(uid, person)),
    complete: () => run('Onboarding completado', (uid) => settingsService.update(uid, { onboardingCompleted: true })),
  };
}
