'use client';

import { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, CreditCard, DollarSign, FileText, Zap, MoreHorizontal } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { ExpenseModal } from '@/components/modals/ExpenseModal';
import { IncomeModal } from '@/components/modals/IncomeModal';
import { TransferModal } from '@/components/modals/TransferModal';
import { EventFormModal } from '@/components/events/EventFormModal';
import { SectionHeader } from '@/components/common/SectionHeader';

export default function InicioPage() {
  const { transacciones } = useTransactions();
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showMoreOpsModal, setShowMoreOpsModal] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<string | null>(null);

  const recentTransactions = transacciones.slice(0, 5);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value || 0);
  };

  const formatDate = (date: Date | any) => {
    const d = date instanceof Date ? date : date?.toDate?.() || new Date();
    return d.toLocaleDateString('es-PE', { month: 'short', day: 'numeric' });
  };

  return (
    <>
      {/* Modals */}
      {showExpenseModal && <ExpenseModal isOpen={true} onClose={() => setShowExpenseModal(false)} />}
      {showIncomeModal && <IncomeModal isOpen={true} onClose={() => setShowIncomeModal(false)} />}
      {showTransferModal && <TransferModal isOpen={true} onClose={() => setShowTransferModal(false)} />}
      {showMoreOpsModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-background/80 backdrop-blur-sm p-0 md:p-4">
          <div className="w-full md:max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-2xl md:rounded-2xl bg-card shadow-2xl">
            <div className="sticky top-0 bg-card border-b border-border p-4 md:p-6 flex items-center justify-between z-10">
              <h2 className="text-xl md:text-2xl font-bold">Más Operaciones</h2>
              <button onClick={() => setShowMoreOpsModal(false)} className="p-2 hover:bg-muted rounded-lg">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <button onClick={() => { setShowMoreOpsModal(false); setSelectedOperation('credit'); }} className="p-4 rounded-lg border border-border hover:bg-muted transition-all text-left">
                <CreditCard className="w-6 h-6 mb-2 text-blue-500" />
                <h3 className="font-semibold">Crédito</h3>
                <p className="text-xs text-muted-foreground">Registrar línea de crédito</p>
              </button>
              <button onClick={() => { setShowMoreOpsModal(false); setSelectedOperation('loan'); }} className="p-4 rounded-lg border border-border hover:bg-muted transition-all text-left">
                <DollarSign className="w-6 h-6 mb-2 text-green-500" />
                <h3 className="font-semibold">Préstamo</h3>
                <p className="text-xs text-muted-foreground">Registrar préstamo recibido</p>
              </button>
              <button onClick={() => { setShowMoreOpsModal(false); setSelectedOperation('obligation'); }} className="p-4 rounded-lg border border-border hover:bg-muted transition-all text-left">
                <FileText className="w-6 h-6 mb-2 text-orange-500" />
                <h3 className="font-semibold">Obligación</h3>
                <p className="text-xs text-muted-foreground">Deuda por pagar</p>
              </button>
              <button onClick={() => { setShowMoreOpsModal(false); setSelectedOperation('receivable'); }} className="p-4 rounded-lg border border-border hover:bg-muted transition-all text-left">
                <Zap className="w-6 h-6 mb-2 text-purple-500" />
                <h3 className="font-semibold">Cuenta por Cobrar</h3>
                <p className="text-xs text-muted-foreground">Dinero que te deben</p>
              </button>
            </div>
            {selectedOperation && (
              <div className="p-4 md:p-6 border-t border-border">
                <EventFormModal operationType={selectedOperation} onClose={() => { setShowMoreOpsModal(false); setSelectedOperation(null); }} />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Inicio</h1>
          <p className="text-muted-foreground mt-1">Registra tus operaciones financieras</p>
        </div>

        {/* Primary Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setShowExpenseModal(true)}
            className="p-6 rounded-xl border-2 border-red-200 bg-red-50 hover:bg-red-100 transition-all flex flex-col items-center gap-2 text-center"
          >
            <ArrowDownLeft className="w-8 h-8 text-red-500" />
            <h3 className="font-bold text-lg">Registrar Gasto</h3>
            <p className="text-xs text-muted-foreground">Dinero que gastas</p>
          </button>

          <button
            onClick={() => setShowIncomeModal(true)}
            className="p-6 rounded-xl border-2 border-green-200 bg-green-50 hover:bg-green-100 transition-all flex flex-col items-center gap-2 text-center"
          >
            <ArrowUpRight className="w-8 h-8 text-green-500" />
            <h3 className="font-bold text-lg">Registrar Ingreso</h3>
            <p className="text-xs text-muted-foreground">Dinero que recibes</p>
          </button>

          <button
            onClick={() => setShowTransferModal(true)}
            className="p-6 rounded-xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 transition-all flex flex-col items-center gap-2 text-center"
          >
            <ArrowLeftRight className="w-8 h-8 text-blue-500" />
            <h3 className="font-bold text-lg">Registrar Transferencia</h3>
            <p className="text-xs text-muted-foreground">Entre tus cuentas</p>
          </button>
        </div>

        {/* Secondary Action Button */}
        <button
          onClick={() => setShowMoreOpsModal(true)}
          className="w-full p-4 rounded-lg border border-border bg-muted/50 hover:bg-muted transition-all text-center font-semibold flex items-center justify-center gap-2"
        >
          <MoreHorizontal className="w-5 h-5" />
          Más Operaciones
        </button>

        {/* Recent Activity */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Actividad Reciente</h2>
          {recentTransactions.length > 0 ? (
            <div className="space-y-2">
              {recentTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-all">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      t.tipo === 'income' ? 'bg-green-100' :
                      t.tipo === 'expense' ? 'bg-red-100' :
                      t.tipo === 'transfer' ? 'bg-blue-100' :
                      'bg-gray-100'
                    }`}>
                      {t.tipo === 'income' && <ArrowUpRight className="w-5 h-5 text-green-600" />}
                      {t.tipo === 'expense' && <ArrowDownLeft className="w-5 h-5 text-red-600" />}
                      {t.tipo === 'transfer' && <ArrowLeftRight className="w-5 h-5 text-blue-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{t.descripcion}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(t.fecha)}</p>
                    </div>
                  </div>
                  <p className={`font-bold text-sm ${t.tipo === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.tipo === 'income' ? '+' : '-'}{formatCurrency(t.monto)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-lg border border-border bg-muted/30 text-center text-muted-foreground">
              <p>No hay transacciones aún</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
