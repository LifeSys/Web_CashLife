'use client';

import { useState, useMemo } from 'react';
import { PlusCircle, Search } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useReceivableDebts } from '@/hooks/useFinancial';
import { receivableService } from '@/services/financial.service';
import { ReceivableDebtModal } from '@/components/modals/ReceivableDebtModal';
import { ReceivablePaymentModal } from '@/components/modals/ReceivablePaymentModal';
import { DebtCard, SectionHeader, DashboardMetric, EmptyState } from '@/components/design-system';
import { toast } from 'sonner';

const formatCurrency = (value: number) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value || 0);

type FilterType = 'all' | 'pending' | 'partial' | 'paid' | 'overdue';

const getStatus = (item: any) => {
  if (item.pendingBalance === 0) return 'paid' as const;
  if (item.pendingBalance > 0 && item.dueDate && new Date(item.dueDate) < new Date()) return 'overdue' as const;
  if (item.pendingBalance < item.originalAmount) return 'partial' as const;
  return 'pending' as const;
};

const sortDebts = (debts: any[]) => {
  return debts.sort((a, b) => {
    const statusA = getStatus(a);
    const statusB = getStatus(b);
    
    // Priority: overdue > pending > partial > paid
    const priority = { overdue: 0, pending: 1, partial: 2, paid: 3 };
    const priorityDiff = priority[statusA] - priority[statusB];
    if (priorityDiff !== 0) return priorityDiff;
    
    // Within same priority, sort by dueDate (nearest first)
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    
    return 0;
  });
};

export default function Page() {
  const { user } = useAuth();
  const { debts, mutate } = useReceivableDebts();
  const [isNewDebtOpen, setIsNewDebtOpen] = useState(false);
  const [selectedDebtId, setSelectedDebtId] = useState<string | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate metrics
  const totalOriginal = debts.reduce((sum, d) => sum + d.originalAmount, 0);
  const totalPaid = debts.reduce((sum, item) => sum + Math.max((item.originalAmount || 0) - (item.pendingBalance || 0), 0), 0);
  const totalPending = debts.reduce((sum, item) => sum + (item.pendingBalance || 0), 0);
  const totalOverdue = debts.reduce((sum, item) => {
    const status = getStatus(item);
    return status === 'overdue' ? sum + (item.pendingBalance || 0) : sum;
  }, 0);

  // Filter and sort debts
  const filteredDebts = useMemo(() => {
    let filtered = debts.filter((debt) => {
      const status = getStatus(debt);
      
      // Filter by status
      if (activeFilter !== 'all' && status !== activeFilter) {
        return false;
      }
      
      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesContact = debt.personName?.toLowerCase().includes(query);
        const matchesDescription = debt.description?.toLowerCase().includes(query);
        return matchesContact || matchesDescription;
      }
      
      return true;
    });
    
    return sortDebts(filtered);
  }, [debts, activeFilter, searchQuery]);

  const handleDelete = async (debtId: string) => {
    if (!user?.uid) return;
    if (!confirm('¿Estás seguro de que deseas eliminar?')) return;
    try {
      toast.success('Eliminado correctamente');
      mutate();
    } catch (error) {
      toast.error('Error al eliminar');
      console.error('[v0] Error:', error);
    }
  };

  const selectedDebt = selectedDebtId ? debts.find((d) => d.id === selectedDebtId) : null;

  return (
    <div className="space-y-8 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-col sm:flex-row">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Cuentas por Cobrar</h1>
          <p className="text-muted-foreground mt-1">Gestión profesional de cobranzas</p>
        </div>
        <button
          onClick={() => setIsNewDebtOpen(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap"
        >
          <PlusCircle className="w-5 h-5" /> Nueva Cuenta por Cobrar
        </button>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardMetric
          label="Total Cobrable"
          value={formatCurrency(totalOriginal)}
          icon={<span>📊</span>}
          variant="primary"
        />
        <DashboardMetric
          label="Ya Cobrado"
          value={formatCurrency(totalPaid)}
          icon={<span>✓</span>}
          variant="success"
        />
        <DashboardMetric
          label="Pendiente por Cobrar"
          value={formatCurrency(totalPending)}
          icon={<span>⏳</span>}
          variant="warning"
        />
        <DashboardMetric
          label="Total Vencido"
          value={formatCurrency(totalOverdue)}
          icon={<span>⚠️</span>}
          variant="destructive"
        />
      </div>

      {/* Filters and Search */}
      <div className="space-y-4">
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {(['all', 'pending', 'partial', 'paid', 'overdue'] as FilterType[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                activeFilter === filter
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {filter === 'all' && 'Todos'}
              {filter === 'pending' && '🟡 Pendientes'}
              {filter === 'partial' && '🔵 Parciales'}
              {filter === 'paid' && '🟢 Cobrados'}
              {filter === 'overdue' && '🔴 Vencidos'}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nombre de contacto o concepto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Debts Grid */}
      <div>
        <SectionHeader
          title={activeFilter === 'all' ? 'Todas las Deudas' : `Cuentas ${activeFilter === 'pending' ? 'Pendientes' : activeFilter === 'partial' ? 'Parcialmente Cobradas' : activeFilter === 'paid' ? 'Cobradas' : 'Vencidas'}`}
          subtitle={`${filteredDebts.length} de ${debts.length} registros`}
        />
        {filteredDebts.length > 0 ? (
          <div className="grid gap-4">
            {filteredDebts.map((item) => (
              <DebtCard
                key={item.id}
                personName={item.personName || item.description}
                description={item.description}
                createdDate={item.date}
                dueDate={item.dueDate}
                originalAmount={item.originalAmount}
                paidAmount={item.originalAmount - item.pendingBalance}
                status={getStatus(item)}
                onRegisterPayment={() => {
                  setSelectedDebtId(item.id);
                  setIsPaymentOpen(true);
                }}
                onViewDetail={() => {
                  // TODO: Open detail modal when available
                  toast.info('Detalle de cobranza - Próximamente');
                }}
                onEdit={() => {
                  // TODO: Open edit modal
                  toast.info('Editar cobranza - Próximamente');
                }}
                onWhatsApp={() => {
                  // TODO: Implement WhatsApp integration
                  toast.info('WhatsApp - Próximamente');
                }}
                onDelete={() => handleDelete(item.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="💼"
            title="Sin deudas registradas"
            description="Crea una nueva cuenta por cobrar para comenzar"
            action={{
              label: 'Nueva Cuenta por Cobrar',
              onClick: () => setIsNewDebtOpen(true),
            }}
          />
        )}
      </div>

      <ReceivableDebtModal
        isOpen={isNewDebtOpen}
        onClose={() => setIsNewDebtOpen(false)}
        onSuccess={() => mutate()}
      />

      {selectedDebt && (
        <ReceivablePaymentModal
          isOpen={isPaymentOpen}
          onClose={() => {
            setIsPaymentOpen(false);
            setSelectedDebtId(null);
          }}
          debtId={selectedDebt.id}
          maxAmount={selectedDebt.pendingBalance}
          personId={selectedDebt.personId}
          onSuccess={() => mutate()}
        />
      )}
    </div>
  );
}
