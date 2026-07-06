'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useAccounts } from '@/hooks/useAccounts';
import { useAuth } from '@/providers/AuthProvider';
import { useCategories } from '@/hooks/useCategories';
import { useCreditCards } from '@/hooks/useCreditCards';
import { usePayableObligations, useReceivableDebts } from '@/hooks/useFinancial';
import { usePeople } from '@/hooks/usePeople';
import { financialEngine } from '@/services/financial-engine.service';
import { EventBuilder } from '@/utils/EventBuilder';
import { EventoFinancieroTipo, EVENTO_LABELS, EVENTO_DESCRIPCIONES, EVENTO_A_CATEGORIA, CategoriaEvento, EVENTO_ICONOS } from '@/types/EventTypes';

interface EventFormProps {
  onClose: () => void;
  categoriaInicial?: CategoriaEvento;
}

export function EventForm({ onClose, categoriaInicial }: EventFormProps) {
  const { user } = useAuth();
  const { cuentas, mutate: mutateCuentas } = useAccounts();
  const { categorias } = useCategories();
  const { personas } = usePeople();
  const { creditCards, mutate: mutateCards } = useCreditCards();
  const { debts, mutate: mutateDebts } = useReceivableDebts();
  const { obligations, mutate: mutateObligations } = usePayableObligations();

  const [tipoEvento, setTipoEvento] = useState<EventoFinancieroTipo>(EventoFinancieroTipo.GASTO);
  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaEvento>(
    categoriaInicial || CategoriaEvento.MOVIMIENTO
  );
  const [formData, setFormData] = useState({
    monto: '',
    cuentaId: '',
    cuentaDestinoId: '',
    tarjetaId: '',
    personaId: '',
    categoriaId: '',
    deudaId: '',
    obligacionId: '',
    descripcion: '',
    notas: '',
    fechaVencimiento: '',
    acreedor: '',
    tipoAcreedor: 'person' as const,
    medioPago: '' as 'efectivo' | 'cuenta_bancaria' | 'tarjeta_credito' | '',
  });

  const montoRef = useRef<HTMLInputElement>(null);
  const cashAccounts = useMemo(() => cuentas.filter((cuenta) => cuenta.tipo !== 'credit_card'), [cuentas]);
  const efectivoAccounts = useMemo(() => cuentas.filter((cuenta) => cuenta.tipo === 'cash'), [cuentas]);
  const bankAccounts = useMemo(() => cuentas.filter((cuenta) => cuenta.tipo === 'bank'), [cuentas]);

  // Agrupar eventos por categoría
  const eventosPorCategoria = useMemo(() => {
    const grupos: Record<CategoriaEvento, EventoFinancieroTipo[]> = {
      [CategoriaEvento.MOVIMIENTO]: [
        EventoFinancieroTipo.GASTO,
        EventoFinancieroTipo.INGRESO,
        EventoFinancieroTipo.TRANSFERENCIA,
      ],
      [CategoriaEvento.CREDITO]: [
        EventoFinancieroTipo.CARGO_TARJETA,
        EventoFinancieroTipo.PAGO_TARJETA,
      ],
      [CategoriaEvento.PERSONAS]: [
        EventoFinancieroTipo.PRESTAMO,
        EventoFinancieroTipo.DEUDA_RECIBIDA,
        EventoFinancieroTipo.COBRANZA,
        EventoFinancieroTipo.PAGO,
        EventoFinancieroTipo.OBLIGACION,
        EventoFinancieroTipo.CUENTA_COBRAR,
      ],
      [CategoriaEvento.SUSCRIPCIONES]: [EventoFinancieroTipo.PAGO_PROGRAMADO],
    };
    return grupos;
  }, []);

  useEffect(() => {
    montoRef.current?.focus();
  }, [tipoEvento]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      cuentaId: prev.cuentaId || cashAccounts[0]?.id || '',
      categoriaId: prev.categoriaId || categorias[0]?.id || '',
      tarjetaId: prev.tarjetaId || creditCards[0]?.id || '',
      deudaId: prev.deudaId || debts.find((d) => d.status !== 'paid')?.id || '',
      obligacionId: prev.obligacionId || obligations.find((o) => o.status !== 'paid')?.id || '',
    }));
  }, [cashAccounts, categorias, creditCards, debts, obligations]);

  const refresh = () => {
    mutateCuentas();
    mutateCards();
    mutateDebts();
    mutateObligations();
  };

  const selectedDebt = debts.find((d) => d.id === formData.deudaId);
  const selectedObligation = obligations.find((o) => o.id === formData.obligacionId);

  // Obtener cuentas según medio de pago seleccionado
  const getAccountsByPaymentMethod = (method: string) => {
    switch (method) {
      case 'efectivo':
        return efectivoAccounts;
      case 'cuenta_bancaria':
        return bankAccounts;
      case 'tarjeta_credito':
        return []; // Las tarjetas se manejan aparte
      default:
        return cashAccounts;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.uid) return toast.error('Usuario no autenticado');
    if (!formData.descripcion.trim()) return toast.error('Descripción es requerida');

    const monto = Number(formData.monto);

    try {
      let evento;

      // Validar y crear evento según tipo
      switch (tipoEvento) {
        case EventoFinancieroTipo.GASTO:
          if (!formData.medioPago) return toast.error('Selecciona un medio de pago');
          if (!formData.categoriaId) return toast.error('Selecciona una categoría');
          
          // Si el gasto es con tarjeta de crédito, crear evento CARGO_TARJETA en lugar de GASTO
          if (formData.medioPago === 'tarjeta_credito') {
            if (!formData.tarjetaId) return toast.error('Selecciona una tarjeta');
            evento = EventBuilder.crearCargoTarjeta(
              monto,
              formData.tarjetaId,
              formData.categoriaId,
              formData.descripcion,
              new Date(),
              formData.notas
            );
          } else {
            // Gasto normal con efectivo o cuenta bancaria
            if (!formData.cuentaId) return toast.error('Selecciona una cuenta');
            evento = EventBuilder.crearGasto(
              monto,
              formData.cuentaId,
              formData.categoriaId,
              formData.descripcion,
              new Date(),
              formData.notas
            );
          }
          break;

        case EventoFinancieroTipo.INGRESO:
          if (!formData.cuentaId) return toast.error('Selecciona una cuenta');
          if (!formData.categoriaId) return toast.error('Selecciona una categoría');
          evento = EventBuilder.crearIngreso(
            monto,
            formData.cuentaId,
            formData.categoriaId,
            formData.descripcion,
            new Date(),
            formData.notas
          );
          break;

        case EventoFinancieroTipo.TRANSFERENCIA:
          if (!formData.cuentaId) return toast.error('Selecciona cuenta origen');
          if (!formData.cuentaDestinoId) return toast.error('Selecciona cuenta destino');
          evento = EventBuilder.crearTransferencia(
            monto,
            formData.cuentaId,
            formData.cuentaDestinoId,
            formData.descripcion,
            new Date(),
            formData.notas
          );
          break;

        case EventoFinancieroTipo.CARGO_TARJETA:
          if (!formData.tarjetaId) return toast.error('Selecciona una tarjeta');
          if (!formData.categoriaId) return toast.error('Selecciona una categoría');
          evento = EventBuilder.crearCargoTarjeta(
            monto,
            formData.tarjetaId,
            formData.categoriaId,
            formData.descripcion,
            new Date(),
            formData.notas
          );
          break;

        case EventoFinancieroTipo.PAGO_TARJETA:
          if (!formData.tarjetaId) return toast.error('Selecciona una tarjeta');
          if (!formData.cuentaId) return toast.error('Selecciona una cuenta');
          evento = EventBuilder.crearPagoTarjeta(
            monto,
            formData.tarjetaId,
            formData.cuentaId,
            formData.descripcion,
            new Date(),
            formData.notas
          );
          break;

        case EventoFinancieroTipo.PRESTAMO:
          if (!formData.personaId) return toast.error('Selecciona una persona');
          if (!formData.cuentaId) return toast.error('Selecciona una cuenta');
          evento = EventBuilder.crearPrestamo(
            monto,
            formData.personaId,
            formData.cuentaId,
            formData.descripcion,
            new Date(),
            formData.fechaVencimiento ? new Date(formData.fechaVencimiento) : undefined,
            formData.notas
          );
          break;

        case EventoFinancieroTipo.DEUDA_RECIBIDA:
          if (!formData.personaId) return toast.error('Selecciona una persona');
          if (!formData.cuentaId) return toast.error('Selecciona una cuenta');
          evento = EventBuilder.crearDeudaRecibida(
            monto,
            formData.personaId,
            formData.cuentaId,
            formData.descripcion,
            new Date(),
            formData.fechaVencimiento ? new Date(formData.fechaVencimiento) : undefined,
            formData.notas
          );
          break;

        case EventoFinancieroTipo.COBRANZA:
          if (!formData.deudaId) return toast.error('Selecciona una deuda por cobrar');
          if (!formData.cuentaId) return toast.error('Selecciona una cuenta');
          if (!selectedDebt) return toast.error('Deuda no encontrada');
          evento = EventBuilder.crearCobranza(
            monto,
            formData.deudaId,
            selectedDebt.personId,
            formData.cuentaId,
            formData.descripcion,
            new Date(),
            formData.notas
          );
          break;

        case EventoFinancieroTipo.PAGO:
          if (!formData.obligacionId) return toast.error('Selecciona una obligación');
          if (!formData.cuentaId) return toast.error('Selecciona una cuenta');
          evento = EventBuilder.crearPago(
            monto,
            formData.obligacionId,
            formData.cuentaId,
            formData.descripcion,
            new Date(),
            formData.notas
          );
          break;

        case EventoFinancieroTipo.OBLIGACION:
          if (!formData.acreedor) return toast.error('Especifica el acreedor');
          if (!formData.fechaVencimiento) return toast.error('Especifica fecha de vencimiento');
          evento = EventBuilder.crearObligacion(
            monto,
            formData.acreedor,
            formData.tipoAcreedor,
            new Date(formData.fechaVencimiento),
            formData.descripcion,
            new Date(),
            formData.notas
          );
          break;

        case EventoFinancieroTipo.CUENTA_COBRAR:
          if (!formData.personaId) return toast.error('Selecciona una persona');
          evento = EventBuilder.crearCuentaCobrar(
            monto,
            formData.personaId,
            formData.descripcion,
            new Date(),
            formData.fechaVencimiento ? new Date(formData.fechaVencimiento) : undefined,
            formData.notas
          );
          break;

        default:
          return toast.error('Tipo de evento no soportado');
      }

      // Procesar evento a través del Financial Engine
      await financialEngine.procesarEvento(user.uid, evento);

      refresh();
      toast.success('Evento registrado correctamente');
      onClose();
    } catch (error) {
      console.error('[EventForm] Error:', error);
      toast.error(error instanceof Error ? error.message : 'Error al registrar evento');
    }
  };

  const renderCamposEspecificos = () => {
    const campos: React.ReactNode[] = [];

    // Campos comunes por tipo de evento
    switch (tipoEvento) {
      case EventoFinancieroTipo.GASTO:
      case EventoFinancieroTipo.INGRESO:
        // Selector de medio de pago para GASTO
        if (tipoEvento === EventoFinancieroTipo.GASTO) {
          campos.push(
            <div key="medioPago">
              <label className="text-sm font-medium">¿Cómo realizaste este gasto?</label>
              <select
                value={formData.medioPago}
                onChange={(e) => 
                  setFormData((p) => ({
                    ...p,
                    medioPago: e.target.value as 'efectivo' | 'cuenta_bancaria' | 'tarjeta_credito' | '',
                    cuentaId: '', // Limpiar selección anterior
                    tarjetaId: '',
                  }))
                }
                className="w-full rounded-lg border bg-muted px-4 py-3"
              >
                <option value="">Selecciona un medio de pago</option>
                <option value="efectivo">Efectivo</option>
                <option value="cuenta_bancaria">Cuenta Bancaria</option>
                <option value="tarjeta_credito">Tarjeta de Crédito</option>
              </select>
            </div>
          );
        }

        // Mostrar selector de cuentas o tarjetas según el medio de pago
        if (tipoEvento === EventoFinancieroTipo.INGRESO || formData.medioPago) {
          if (tipoEvento === EventoFinancieroTipo.INGRESO) {
            // Para INGRESO, siempre mostrar selector de cuentas
            campos.push(
              <div key="cuenta">
                <label className="text-sm font-medium">Cuenta</label>
                <select
                  value={formData.cuentaId}
                  onChange={(e) => setFormData((p) => ({ ...p, cuentaId: e.target.value }))}
                  className="w-full rounded-lg border bg-muted px-4 py-3"
                >
                  <option value="">Selecciona una cuenta</option>
                  {cashAccounts.map((cuenta) => (
                    <option key={cuenta.id} value={cuenta.id}>
                      {cuenta.nombre} · S/{cuenta.saldo ?? cuenta.balance ?? 0}
                    </option>
                  ))}
                </select>
              </div>
            );
          } else if (formData.medioPago === 'tarjeta_credito') {
            // Para GASTO con tarjeta: mostrar selector de tarjetas
            campos.push(
              <div key="tarjeta">
                <label className="text-sm font-medium">Tarjeta de Crédito</label>
                <select
                  value={formData.tarjetaId}
                  onChange={(e) => setFormData((p) => ({ ...p, tarjetaId: e.target.value }))}
                  className="w-full rounded-lg border bg-muted px-4 py-3"
                >
                  <option value="">Selecciona una tarjeta</option>
                  {creditCards.map((card) => (
                    <option key={card.id} value={card.id}>
                      {card.nombre} · usado S/{card.usedAmount ?? card.montoUtilizado ?? 0}
                    </option>
                  ))}
                </select>
              </div>
            );
          } else {
            // Para GASTO con efectivo o cuenta bancaria: mostrar cuentas filtradas
            const cuentasDisponibles = getAccountsByPaymentMethod(formData.medioPago);
            campos.push(
              <div key="cuenta">
                <label className="text-sm font-medium">
                  {formData.medioPago === 'efectivo' ? 'Caja/Efectivo' : 'Cuenta Bancaria'}
                </label>
                <select
                  value={formData.cuentaId}
                  onChange={(e) => setFormData((p) => ({ ...p, cuentaId: e.target.value }))}
                  className="w-full rounded-lg border bg-muted px-4 py-3"
                >
                  <option value="">Selecciona una cuenta</option>
                  {cuentasDisponibles.map((cuenta) => (
                    <option key={cuenta.id} value={cuenta.id}>
                      {cuenta.nombre} · S/{cuenta.saldo ?? cuenta.balance ?? 0}
                    </option>
                  ))}
                </select>
              </div>
            );
          }
        }

        // Mostrar selector de categoría
        campos.push(
          <div key="categoria">
            <label className="text-sm font-medium">Categoría</label>
            <select
              value={formData.categoriaId}
              onChange={(e) => setFormData((p) => ({ ...p, categoriaId: e.target.value }))}
              className="w-full rounded-lg border bg-muted px-4 py-3"
            >
              <option value="">Selecciona una categoría</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>
        );
        break;

      case EventoFinancieroTipo.TRANSFERENCIA:
        campos.push(
          <div key="origen">
            <label className="text-sm font-medium">Cuenta Origen</label>
            <select
              value={formData.cuentaId}
              onChange={(e) => setFormData((p) => ({ ...p, cuentaId: e.target.value }))}
              className="w-full rounded-lg border bg-muted px-4 py-3"
            >
              <option value="">Selecciona cuenta origen</option>
              {cashAccounts.map((cuenta) => (
                <option key={cuenta.id} value={cuenta.id}>
                  {cuenta.nombre} · S/{cuenta.saldo ?? 0}
                </option>
              ))}
            </select>
          </div>,
          <div key="destino">
            <label className="text-sm font-medium">Cuenta Destino</label>
            <select
              value={formData.cuentaDestinoId}
              onChange={(e) => setFormData((p) => ({ ...p, cuentaDestinoId: e.target.value }))}
              className="w-full rounded-lg border bg-muted px-4 py-3"
            >
              <option value="">Selecciona cuenta destino</option>
              {cashAccounts
                .filter((c) => c.id !== formData.cuentaId)
                .map((cuenta) => (
                  <option key={cuenta.id} value={cuenta.id}>
                    {cuenta.nombre}
                  </option>
                ))}
            </select>
          </div>
        );
        break;

      case EventoFinancieroTipo.CARGO_TARJETA:
      case EventoFinancieroTipo.PAGO_TARJETA:
        campos.push(
          <div key="tarjeta">
            <label className="text-sm font-medium">Tarjeta de Crédito</label>
            <select
              value={formData.tarjetaId}
              onChange={(e) => setFormData((p) => ({ ...p, tarjetaId: e.target.value }))}
              className="w-full rounded-lg border bg-muted px-4 py-3"
            >
              <option value="">Selecciona una tarjeta</option>
              {creditCards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.nombre} · usado S/{card.usedAmount ?? card.montoUtilizado ?? 0}
                </option>
              ))}
            </select>
          </div>
        );
        if (tipoEvento === EventoFinancieroTipo.CARGO_TARJETA) {
          campos.push(
            <div key="categoria">
              <label className="text-sm font-medium">Categoría</label>
              <select
                value={formData.categoriaId}
                onChange={(e) => setFormData((p) => ({ ...p, categoriaId: e.target.value }))}
                className="w-full rounded-lg border bg-muted px-4 py-3"
              >
                <option value="">Selecciona una categoría</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>
          );
        } else {
          campos.push(
            <div key="cuenta">
              <label className="text-sm font-medium">Cuenta de Pago</label>
              <select
                value={formData.cuentaId}
                onChange={(e) => setFormData((p) => ({ ...p, cuentaId: e.target.value }))}
                className="w-full rounded-lg border bg-muted px-4 py-3"
              >
                <option value="">Selecciona una cuenta</option>
                {cashAccounts.map((cuenta) => (
                  <option key={cuenta.id} value={cuenta.id}>
                    {cuenta.nombre} · S/{cuenta.saldo ?? 0}
                  </option>
                ))}
              </select>
            </div>
          );
        }
        break;

      case EventoFinancieroTipo.PRESTAMO:
      case EventoFinancieroTipo.DEUDA_RECIBIDA:
      case EventoFinancieroTipo.CUENTA_COBRAR:
        campos.push(
          <div key="persona">
            <label className="text-sm font-medium">Persona</label>
            <select
              value={formData.personaId}
              onChange={(e) => setFormData((p) => ({ ...p, personaId: e.target.value }))}
              className="w-full rounded-lg border bg-muted px-4 py-3"
            >
              <option value="">Selecciona una persona</option>
              {personas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>
        );
        if (tipoEvento !== EventoFinancieroTipo.CUENTA_COBRAR) {
          campos.push(
            <div key="cuenta">
              <label className="text-sm font-medium">Cuenta</label>
              <select
                value={formData.cuentaId}
                onChange={(e) => setFormData((p) => ({ ...p, cuentaId: e.target.value }))}
                className="w-full rounded-lg border bg-muted px-4 py-3"
              >
                <option value="">Selecciona una cuenta</option>
                {cashAccounts.map((cuenta) => (
                  <option key={cuenta.id} value={cuenta.id}>
                    {cuenta.nombre} · S/{cuenta.saldo ?? 0}
                  </option>
                ))}
              </select>
            </div>
          );
        }
        campos.push(
          <div key="vencimiento">
            <label className="text-sm font-medium">Fecha de Vencimiento (Opcional)</label>
            <input
              type="date"
              value={formData.fechaVencimiento}
              onChange={(e) => setFormData((p) => ({ ...p, fechaVencimiento: e.target.value }))}
              className="w-full rounded-lg border bg-muted px-4 py-3"
            />
          </div>
        );
        break;

      case EventoFinancieroTipo.COBRANZA:
        campos.push(
          <div key="deuda">
            <label className="text-sm font-medium">Deuda a Cobrar</label>
            <select
              value={formData.deudaId}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  deudaId: e.target.value,
                  monto: String(debts.find((d) => d.id === e.target.value)?.pendingBalance ?? p.monto),
                }))
              }
              className="w-full rounded-lg border bg-muted px-4 py-3"
            >
              <option value="">Selecciona una deuda</option>
              {debts
                .filter((d) => d.status !== 'paid')
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.description} · Pendiente S/{d.pendingBalance}
                  </option>
                ))}
            </select>
          </div>,
          <div key="cuenta">
            <label className="text-sm font-medium">Cuenta Destino</label>
            <select
              value={formData.cuentaId}
              onChange={(e) => setFormData((p) => ({ ...p, cuentaId: e.target.value }))}
              className="w-full rounded-lg border bg-muted px-4 py-3"
            >
              <option value="">Selecciona una cuenta</option>
              {cashAccounts.map((cuenta) => (
                <option key={cuenta.id} value={cuenta.id}>
                  {cuenta.nombre} · S/{cuenta.saldo ?? 0}
                </option>
              ))}
            </select>
          </div>
        );
        break;

      case EventoFinancieroTipo.PAGO:
        campos.push(
          <div key="obligacion">
            <label className="text-sm font-medium">Obligación a Pagar</label>
            <select
              value={formData.obligacionId}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  obligacionId: e.target.value,
                  monto: String(obligations.find((o) => o.id === e.target.value)?.pendingBalance ?? p.monto),
                }))
              }
              className="w-full rounded-lg border bg-muted px-4 py-3"
            >
              <option value="">Selecciona una obligación</option>
              {obligations
                .filter((o) => o.status !== 'paid')
                .map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.description} · Pendiente S/{o.pendingBalance}
                  </option>
                ))}
            </select>
          </div>,
          <div key="cuenta">
            <label className="text-sm font-medium">Cuenta de Pago</label>
            <select
              value={formData.cuentaId}
              onChange={(e) => setFormData((p) => ({ ...p, cuentaId: e.target.value }))}
              className="w-full rounded-lg border bg-muted px-4 py-3"
            >
              <option value="">Selecciona una cuenta</option>
              {cashAccounts.map((cuenta) => (
                <option key={cuenta.id} value={cuenta.id}>
                  {cuenta.nombre} · S/{cuenta.saldo ?? 0}
                </option>
              ))}
            </select>
          </div>
        );
        break;

      case EventoFinancieroTipo.OBLIGACION:
        campos.push(
          <div key="acreedor">
            <label className="text-sm font-medium">Acreedor</label>
            <input
              type="text"
              value={formData.acreedor}
              onChange={(e) => setFormData((p) => ({ ...p, acreedor: e.target.value }))}
              placeholder="Nombre del acreedor"
              className="w-full rounded-lg border bg-muted px-4 py-3"
            />
          </div>,
          <div key="tipo-acreedor">
            <label className="text-sm font-medium">Tipo de Acreedor</label>
            <select
              value={formData.tipoAcreedor}
              onChange={(e) =>
                setFormData((p) => ({ ...p, tipoAcreedor: e.target.value as any }))
              }
              className="w-full rounded-lg border bg-muted px-4 py-3"
            >
              <option value="person">Persona</option>
              <option value="bank">Banco</option>
              <option value="company">Empresa</option>
              <option value="sunat">SUNAT</option>
              <option value="other">Otro</option>
            </select>
          </div>,
          <div key="vencimiento">
            <label className="text-sm font-medium">Fecha de Vencimiento</label>
            <input
              type="date"
              value={formData.fechaVencimiento}
              onChange={(e) => setFormData((p) => ({ ...p, fechaVencimiento: e.target.value }))}
              className="w-full rounded-lg border bg-muted px-4 py-3"
              required
            />
          </div>
        );
        break;
    }

    return campos;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 pb-8">
      {/* Pestañas de categorías */}
      <div className="flex gap-2 border-b">
        {(Object.values(CategoriaEvento) as CategoriaEvento[]).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              setCategoriaActiva(cat);
              setTipoEvento(eventosPorCategoria[cat][0]);
            }}
            className={`px-4 py-2 font-medium transition-colors ${
              categoriaActiva === cat
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Botones de tipo de evento (solo de la categoría activa) */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {eventosPorCategoria[categoriaActiva].map((tipo) => (
          <button
            key={tipo}
            type="button"
            onClick={() => setTipoEvento(tipo)}
            className={`rounded-lg px-3 py-3 text-sm font-semibold transition-colors ${
              tipoEvento === tipo ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
            }`}
          >
            {EVENTO_LABELS[tipo]}
          </button>
        ))}
      </div>

      {/* Monto */}
      <div>
        <label className="text-sm font-medium">Monto</label>
        <input
          ref={montoRef}
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.monto}
          onChange={(e) => setFormData((p) => ({ ...p, monto: e.target.value }))}
          className="w-full rounded-lg border bg-muted px-4 py-3 text-lg font-bold"
          required
        />
      </div>

      {/* Campos específicos según tipo de evento */}
      <div className="space-y-3">{renderCamposEspecificos()}</div>

      {/* Descripción */}
      <div>
        <label className="text-sm font-medium">Descripción</label>
        <input
          type="text"
          placeholder={EVENTO_DESCRIPCIONES[tipoEvento]}
          value={formData.descripcion}
          onChange={(e) => setFormData((p) => ({ ...p, descripcion: e.target.value }))}
          className="w-full rounded-lg border bg-muted px-4 py-3"
          required
        />
      </div>

      {/* Notas */}
      <div>
        <label className="text-sm font-medium">Notas (Opcional)</label>
        <textarea
          placeholder="Información adicional..."
          value={formData.notas}
          onChange={(e) => setFormData((p) => ({ ...p, notas: e.target.value }))}
          rows={2}
          className="w-full resize-none rounded-lg border bg-muted px-4 py-3"
        />
      </div>

      {/* Botones de acción */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-lg bg-muted px-4 py-3 font-semibold hover:bg-muted/80"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 rounded-lg bg-primary px-4 py-3 font-bold text-primary-foreground hover:bg-primary/90"
        >
          Guardar Evento
        </button>
      </div>
    </form>
  );
}
