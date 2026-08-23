'use client';

import { CreditCard, Account } from '@/types';
import { CreditCardDisplay } from '@/components/design-system/cards/CreditCardDisplay';
import { Plus } from 'lucide-react';

interface CreditCardsSectionProps {
  cards: CreditCard[];
  accounts: Account[];
  totalLimit: number;
  totalUsed: number;
  loading?: boolean;
  onAddCard: () => void;
  onPayCard: (card: CreditCard) => void;
  onRecordCharge: (card: CreditCard) => void;
  onViewTransactions: (cardId: string) => void;
  onEditCard: (card: CreditCard) => void;
  onDeleteCard: (cardId: string) => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);

export function CreditCardsSection({
  cards,
  accounts,
  totalLimit,
  totalUsed,
  loading = false,
  onAddCard,
  onPayCard,
  onRecordCharge,
  onViewTransactions,
  onEditCard,
  onDeleteCard,
}: CreditCardsSectionProps) {
  const totalAvailable = totalLimit - totalUsed;
  const utilization = totalLimit > 0 ? (totalUsed / totalLimit) * 100 : 0;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tarjetas de Crédito</h2>
          <p className="text-sm text-muted-foreground mt-1">Gestiona tus líneas de crédito</p>
        </div>
        <button
          onClick={onAddCard}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
        >
          <Plus className="w-5 h-5" />
          Nueva tarjeta
        </button>
      </div>

      {/* Summary Bar */}
      {cards.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-6">
          <p className="text-sm text-muted-foreground mb-4">Resumen de crédito</p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Línea total</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(totalLimit)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Utilizado</p>
              <p className={`text-xl font-bold ${utilization > 80 ? 'text-red-500' : utilization > 50 ? 'text-amber-500' : 'text-emerald-500'}`}>
                {formatCurrency(totalUsed)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Disponible</p>
              <p className="text-xl font-bold text-green-500">{formatCurrency(totalAvailable)}</p>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span>Utilización</span>
              <span className={`font-bold ${utilization > 80 ? 'text-red-500' : 'text-muted-foreground'}`}>
                {utilization.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all ${utilization > 80 ? 'bg-red-500' : utilization > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(utilization, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid gap-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : cards.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border-2 border-dashed border-border">
          <p className="text-muted-foreground">No tienes tarjetas de crédito registradas</p>
          <p className="text-sm text-muted-foreground mt-1">Crea tu primera tarjeta de crédito</p>
        </div>
      ) : (
        <div className="grid gap-2">
          {cards.map(card => {
            const linkedAccount = accounts.find(a => a.id === card.linkedAccountId);
            return (
              <CreditCardDisplay
                key={card.id}
                card={card}
                account={linkedAccount}
                onPay={() => onPayCard(card)}
                onRecordCharge={() => onRecordCharge(card)}
                onViewTransactions={() => onViewTransactions(card.id)}
                onEdit={() => onEditCard(card)}
                onDelete={() => onDeleteCard(card.id)}
                compact
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
