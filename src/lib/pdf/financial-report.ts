import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Transaction, Category } from '@/types';

const money = (n: number) => `S/ ${new Intl.NumberFormat('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0)}`;

const toDate = (value: unknown): Date =>
  value instanceof Date ? value : value && typeof value === 'object' && 'toDate' in (value as object) ? (value as { toDate(): Date }).toDate() : new Date(String(value));

export interface FinancialReportInput {
  generatedAt: Date;
  resumen: {
    dineroDisponible: number;
    patrimonioNeto: number;
    meDeben: number;
    totalDebo: number;
  };
  resumenMensual: {
    ingresos: number;
    gastos: number;
    balance: number;
  };
  gastosPorCategoria: { nombre: string; monto: number; cantidad: number }[];
  movimientosDelMes: Transaction[];
  categorias: Category[];
}

const TIPO_LABELS: Record<string, string> = {
  expense: 'Gasto',
  income: 'Ingreso',
  transfer: 'Transferencia',
  credit_card_charge: 'Compra con tarjeta',
  card_payment: 'Pago de tarjeta',
  payable_payment: 'Pago cuenta por pagar',
  receivable_payment: 'Cobro cuenta por cobrar',
  scheduled_payment: 'Pago programado',
  payable_obligation: 'Registro cuenta por pagar',
  receivable_debt: 'Registro cuenta por cobrar',
};

const getCategoryName = (tx: Transaction, categorias: Category[]) => {
  const id = tx.categoriaId ?? tx.categoria;
  if (!id) return '—';
  return categorias.find((c) => c.id === id)?.nombre ?? tx.categoria ?? '—';
};

export function generateFinancialReportPdf(input: FinancialReportInput) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('CashLife — Reporte Financiero', 14, y);
  y += 7;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(
    `Generado el ${input.generatedAt.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })} a las ${input.generatedAt.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`,
    14,
    y
  );
  y += 10;
  doc.setTextColor(0);

  // ---- Resumen financiero (patrimonio) ----
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen financiero', 14, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [['Dinero disponible', 'Patrimonio neto', 'Me deben', 'Total debo']],
    body: [[
      money(input.resumen.dineroDisponible),
      money(input.resumen.patrimonioNeto),
      money(input.resumen.meDeben),
      money(input.resumen.totalDebo),
    ]],
    theme: 'grid',
    headStyles: { fillColor: [16, 24, 40], fontSize: 9 },
    bodyStyles: { fontSize: 11, fontStyle: 'bold', halign: 'center' },
    margin: { left: 14, right: 14 },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 10;

  // ---- Resumen mensual ----
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen del mes', 14, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [['Ingresos', 'Gastos', 'Balance']],
    body: [[money(input.resumenMensual.ingresos), money(input.resumenMensual.gastos), money(input.resumenMensual.balance)]],
    theme: 'grid',
    headStyles: { fillColor: [16, 24, 40], fontSize: 9 },
    bodyStyles: { fontSize: 11, fontStyle: 'bold', halign: 'center' },
    margin: { left: 14, right: 14 },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 10;

  // ---- Gastos por categoría ----
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Gastos por categoría (este mes)', 14, y);
  y += 6;

  const totalGastos = input.gastosPorCategoria.reduce((s, c) => s + c.monto, 0) || 1;

  if (input.gastosPorCategoria.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Categoría', 'Monto', '% del total', 'Transacciones']],
      body: input.gastosPorCategoria
        .sort((a, b) => b.monto - a.monto)
        .map((c) => [c.nombre, money(c.monto), `${((c.monto / totalGastos) * 100).toFixed(1)}%`, String(c.cantidad)]),
      theme: 'striped',
      headStyles: { fillColor: [16, 24, 40], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 10;
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Sin gastos registrados este mes.', 14, y);
    y += 10;
  }

  // ---- Detalle de movimientos del mes ----
  if (y > 250) {
    doc.addPage();
    y = 18;
  }
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Detalle de movimientos (este mes)', 14, y);
  y += 6;

  if (input.movimientosDelMes.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Fecha', 'Descripción', 'Tipo', 'Categoría', 'Monto']],
      body: input.movimientosDelMes
        .slice()
        .sort((a, b) => toDate(b.fecha).getTime() - toDate(a.fecha).getTime())
        .map((tx) => [
          toDate(tx.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }),
          tx.descripcion,
          TIPO_LABELS[tx.tipo] ?? tx.tipo,
          getCategoryName(tx, input.categorias),
          money(tx.monto),
        ]),
      theme: 'striped',
      headStyles: { fillColor: [16, 24, 40], fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      columnStyles: { 4: { halign: 'right' } },
      margin: { left: 14, right: 14 },
    });
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Sin movimientos registrados este mes.', 14, y);
  }

  // ---- Footer con numeración ----
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Página ${i} de ${pageCount} — CashLife`, pageWidth / 2, doc.internal.pageSize.getHeight() - 8, { align: 'center' });
  }

  const fileDate = input.generatedAt.toISOString().slice(0, 10);
  doc.save(`CashLife-Reporte-${fileDate}.pdf`);
}
