'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useAccounts } from '@/hooks/useAccounts';
import { useCreditCards } from '@/hooks/useCreditCards';
import { accountService } from '@/services/account.service';
import { creditCardService } from '@/services/credit-card.service';
import { financialEngine } from '@/services/financial-engine.service';
import { DashboardSummary } from '@/components/design-system/DashboardSummary';
import { AccountsSection } from '@/components/sections/AccountsSection';
import { CreditCardsSection } from '@/components/sections/CreditCardsSection';
import { BankAccountModal } from '@/components/modals/BankAccountModal';
import { CreditCardCreateModal } from '@/components/modals/CreditCardCreateModal';
import { CreditCardEditModal } from '@/components/modals/CreditCardEditModal';
import { CreditCardChargeModal } from '@/components/modals/CreditCardChargeModal';
import { AccountEditModal } from '@/components/modals/AccountEditModal';
import { PayCreditCardModal } from '@/components/modals/PayCreditCardModal';
import { ConfirmDeleteModal } from '@/components/modals/ConfirmDeleteModal';
import { Account, CreditCard } from '@/types';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function CuentasPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cuentas: accounts, mutate: mutateAccounts, isLoading: loadingAccounts } = useAccounts();
  const { creditCards: cards, mutate: mutateCreditCards, isLoading: loadingCards } = useCreditCards();

  // Modal states
  const [showBankAccountModal, setShowBankAccountModal] = useState(false);
  const [showCreditCardModal, setShowCreditCardModal] = useState(false);
  const [showPayCardModal, setShowPayCardModal] = useState(false);
  const [selectedCardForPayment, setSelectedCardForPayment] = useState<CreditCard | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<Account | null>(null);
  const [cardToEdit, setCardToEdit] = useState<CreditCard | null>(null);
  const [showChargeModal, setShowChargeModal] = useState(false);
  const [cardForCharge, setCardForCharge] = useState<CreditCard | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  const [cardToDelete, setCardToDelete] = useState<CreditCard | null>(null);

  // Ensure Efectivo exists on mount
  useEffect(() => {
    if (user?.uid) {
      accountService.ensureEfectivoExists(user.uid).catch(err => {
        console.error('[v0] Error ensuring Efectivo exists:', err);
      });
    }
  }, [user?.uid]);

  // Filter money accounts (exclude credit cards)
  const moneyAccounts = accounts.filter(a => a.tipo !== 'credit_card');

  // Calculate summary metrics
  const totalAvailableMoney = moneyAccounts.reduce((sum, a) => sum + (a.saldo || 0), 0);
  const totalCreditDebt = cards.reduce((sum, c) => sum + (c.montoUtilizado || 0), 0);
  const totalCreditLimit = cards.reduce((sum, c) => sum + c.lineaCredito, 0);

  // Handlers
  const handleDeleteAccount = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    if (!account) return;

    if (account.nombre === 'Efectivo') {
      toast.error('No se puede eliminar la cuenta "Efectivo"');
      return;
    }

    setAccountToDelete(account);
  };

  const handleConfirmDeleteAccount = async () => {
    if (!accountToDelete) return;
    setIsDeleting(true);
    try {
      if (user?.uid) {
        await accountService.delete(user.uid, accountToDelete.id);
        await mutateAccounts();
        toast.success('Cuenta eliminada');
      }
      setAccountToDelete(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar cuenta';
      toast.error(message);
      console.error('[v0] Error deleting account:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCard = (cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;
    setCardToDelete(card);
  };

  const handleConfirmDeleteCard = async () => {
    if (!cardToDelete) return;
    setIsDeleting(true);
    try {
      if (user?.uid) {
        await creditCardService.delete(user.uid, cardToDelete.id);
        await mutateCreditCards();
        toast.success('Tarjeta eliminada');
      }
      setCardToDelete(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar tarjeta';
      toast.error(message);
      console.error('[v0] Error deleting card:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePayCard = (card: CreditCard) => {
    setSelectedCardForPayment(card);
    setShowPayCardModal(true);
  };

  const handlePaymentSuccess = () => {
    mutateCreditCards();
    mutateAccounts();
    setShowPayCardModal(false);
    setSelectedCardForPayment(null);
  };

  const handleViewAccountTransactions = (accountId: string) => {
    router.push(`/dashboard/movimientos?cuenta=${accountId}`);
  };

  const handleViewCardTransactions = (cardId: string) => {
    router.push(`/dashboard/movimientos?tarjeta=${cardId}`);
  };

  const handleRecordCharge = (card: CreditCard) => {
    setCardForCharge(card);
    setShowChargeModal(true);
  };

  const handleEditAccount = (account: Account) => {
    setAccountToEdit(account);
  };

  const handleEditCard = (card: CreditCard) => {
    setCardToEdit(card);
  };

  const isLoading = loadingAccounts || loadingCards || isDeleting;

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">Cuentas y Tarjetas</h1>
        <p className="text-muted-foreground mt-2">Administra tu dinero real y líneas de crédito</p>
      </div>

      {/* Warning if no Efectivo */}
      {accounts.length === 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Primeros pasos</p>
            <p className="text-sm text-muted-foreground mt-1">Crea tu primera cuenta bancaria para comenzar a organizar tu dinero</p>
          </div>
        </div>
      )}

      {/* Dashboard Summary */}
      <DashboardSummary
        totalAvailableMoney={totalAvailableMoney}
        accountCount={moneyAccounts.length}
        creditCardCount={cards.length}
        totalCreditDebt={totalCreditDebt}
      />

      {/* Money Accounts Section */}
      <AccountsSection
        accounts={moneyAccounts}
        loading={loadingAccounts}
        onAddAccount={() => setShowBankAccountModal(true)}
        onEditAccount={handleEditAccount}
        onDeleteAccount={handleDeleteAccount}
        onViewTransactions={handleViewAccountTransactions}
      />

      {/* Credit Cards Section */}
      <CreditCardsSection
        cards={cards}
        accounts={moneyAccounts}
        totalLimit={totalCreditLimit}
        totalUsed={totalCreditDebt}
        loading={loadingCards}
        onAddCard={() => setShowCreditCardModal(true)}
        onPayCard={handlePayCard}
        onRecordCharge={handleRecordCharge}
        onViewTransactions={handleViewCardTransactions}
        onEditCard={handleEditCard}
        onDeleteCard={handleDeleteCard}
      />

      {/* Bank Account Modal */}
      <BankAccountModal
        isOpen={showBankAccountModal}
        onClose={() => setShowBankAccountModal(false)}
        onSuccess={() => mutateAccounts()}
      />

      {/* Credit Card Creation Modal */}
      <CreditCardCreateModal
        isOpen={showCreditCardModal}
        onClose={() => setShowCreditCardModal(false)}
        onSuccess={() => mutateCreditCards()}
      />

      {/* Payment Modal */}
      {selectedCardForPayment && (
        <PayCreditCardModal
          card={selectedCardForPayment}
          userAccounts={moneyAccounts}
          isOpen={showPayCardModal}
          onClose={() => {
            setShowPayCardModal(false);
            setSelectedCardForPayment(null);
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Account Edit Modal */}
      <AccountEditModal
        isOpen={!!accountToEdit}
        account={accountToEdit}
        onClose={() => setAccountToEdit(null)}
        onSuccess={() => mutateAccounts()}
      />

      {/* Credit Card Edit Modal */}
      <CreditCardEditModal
        isOpen={!!cardToEdit}
        card={cardToEdit}
        onClose={() => setCardToEdit(null)}
        onSuccess={() => mutateCreditCards()}
      />

      {/* Credit Card Charge Modal */}
      <CreditCardChargeModal
        isOpen={showChargeModal}
        prefilledCardId={cardForCharge?.id}
        onClose={() => {
          setShowChargeModal(false);
          setCardForCharge(null);
        }}
        onSuccess={() => {
          mutateCreditCards();
          mutateAccounts();
        }}
      />

      {/* Delete Account Confirm */}
      <ConfirmDeleteModal
        isOpen={!!accountToDelete}
        onClose={() => setAccountToDelete(null)}
        title="Eliminar cuenta"
        itemName={accountToDelete?.nombre ?? 'esta cuenta'}
        bullets={['Su historial de movimientos queda huérfano de esta cuenta']}
        onConfirm={handleConfirmDeleteAccount}
      />

      {/* Delete Card Confirm */}
      <ConfirmDeleteModal
        isOpen={!!cardToDelete}
        onClose={() => setCardToDelete(null)}
        title="Eliminar tarjeta"
        itemName={cardToDelete?.nombre ?? 'esta tarjeta'}
        bullets={['Su historial de consumos y pagos queda huérfano de esta tarjeta']}
        onConfirm={handleConfirmDeleteCard}
      />
    </div>
  );
}
