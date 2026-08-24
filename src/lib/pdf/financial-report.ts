import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Transaction, Category } from '@/types';
import { getTransactionTypeLabel } from '@/lib/transaction-labels';

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

const getCategoryName = (tx: Transaction, categorias: Category[]) => {
  const id = tx.categoriaId ?? tx.categoria;
  if (!id) return '—';
  return categorias.find((c) => c.id === id)?.nombre ?? tx.categoria ?? '—';
};

// Paleta de la app: azul/teal primario, verde ingresos, rojo gastos, ámbar deudas.
const COLOR_PRIMARY: [number, number, number] = [15, 23, 42]; // slate-900, para la barra de cabecera
const COLOR_ACCENT: [number, number, number] = [13, 148, 136]; // teal-600
const COLOR_GREEN: [number, number, number] = [22, 163, 74];
const COLOR_RED: [number, number, number] = [220, 38, 38];
const COLOR_AMBER: [number, number, number] = [217, 119, 6];
const COLOR_GRAY_TEXT: [number, number, number] = [100, 100, 100];
const COLOR_CARD_BG: [number, number, number] = [246, 247, 249];

const MAX_MOVEMENTS_ROWS = 14;

/**
 * Tarjeta compacta tipo "KPI" con una barrita de color a la izquierda,
 * una etiqueta chica y un valor grande — mucho más rápida de leer de un
 * vistazo que una tabla, y ocupa bastante menos espacio vertical.
 */
function drawKpiCard(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  value: string,
  accent: [number, number, number]
) {
  doc.setFillColor(...COLOR_CARD_BG);
  doc.roundedRect(x, y, w, h, 1.5, 1.5, 'F');
  doc.setFillColor(...accent);
  doc.roundedRect(x, y, 1.6, h, 0.8, 0.8, 'F');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLOR_GRAY_TEXT);
  doc.text(label, x + 5, y + 7);

  doc.setFontSize(12.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 20);
  doc.text(value, x + 5, y + h - 5.5);
}

function sectionTitle(doc: jsPDF, text: string, x: number, y: number) {
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 20);
  doc.text(text, x, y);
}

/** Arma el PDF pero NO lo descarga — para poder también previsualizarlo o imprimirlo con el mismo documento. */
export function buildFinancialReportPdf(input: FinancialReportInput): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2;

  // ---- Cabecera ----
  doc.setFillColor(...COLOR_PRIMARY);
  doc.rect(0, 0, pageWidth, 24, 'F');
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('CashLife', marginX, 11);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 210, 220);
  doc.text('Reporte financiero', marginX, 18);

  doc.setFontSize(8.5);
  doc.setTextColor(220, 225, 230);
  const generatedText = `Generado el ${input.generatedAt.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}, ${input.generatedAt.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`;
  doc.text(generatedText, pageWidth - marginX, 11, { align: 'right' });
  const periodo = input.generatedAt.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
  doc.text(`Periodo: ${periodo.charAt(0).toUpperCase()}${periodo.slice(1)}`, pageWidth - marginX, 17, { align: 'right' });

  let y = 33;

  // ---- Patrimonio (4 tarjetas) ----
  sectionTitle(doc, 'Patrimonio', marginX, y);
  y += 4;
  const gap = 3;
  const cardW = (contentWidth - gap * 3) / 4;
  const cardH = 20;
  drawKpiCard(doc, marginX, y, cardW, cardH, 'DINERO DISPONIBLE', money(input.resumen.dineroDisponible), COLOR_ACCENT);
  drawKpiCard(doc, marginX + (cardW + gap), y, cardW, cardH, 'PATRIMONIO NETO', money(input.resumen.patrimonioNeto), input.resumen.patrimonioNeto >= 0 ? COLOR_GREEN : COLOR_RED);
  drawKpiCard(doc, marginX + (cardW + gap) * 2, y, cardW, cardH, 'ME DEBEN', money(input.resumen.meDeben), COLOR_GREEN);
  drawKpiCard(doc, marginX + (cardW + gap) * 3, y, cardW, cardH, 'TOTAL DEBO', money(input.resumen.totalDebo), COLOR_AMBER);
  y += cardH + 9;

  // ---- Resumen del mes (3 tarjetas) ----
  sectionTitle(doc, 'Este mes', marginX, y);
  y += 4;
  const cardW3 = (contentWidth - gap * 2) / 3;
  drawKpiCard(doc, marginX, y, cardW3, cardH, 'INGRESOS', money(input.resumenMensual.ingresos), COLOR_GREEN);
  drawKpiCard(doc, marginX + (cardW3 + gap), y, cardW3, cardH, 'GASTOS', money(input.resumenMensual.gastos), COLOR_RED);
  drawKpiCard(doc, marginX + (cardW3 + gap) * 2, y, cardW3, cardH, 'BALANCE', money(input.resumenMensual.balance), input.resumenMensual.balance >= 0 ? COLOR_GREEN : COLOR_RED);
  y += cardH + 10;

  // ---- Gastos por categoría (barras horizontales, más visual que una tabla) ----
  sectionTitle(doc, 'Gastos por categoría (este mes)', marginX, y);
  y += 6;

  const topCategorias = [...input.gastosPorCategoria].sort((a, b) => b.monto - a.monto).slice(0, 6);
  const totalGastos = input.gastosPorCategoria.reduce((s, c) => s + c.monto, 0) || 1;

  if (topCategorias.length > 0) {
    const barRowH = 7.2;
    const labelW = 38;
    const amountW = 26;
    const barMaxW = contentWidth - labelW - amountW - 4;
    const barMax = Math.max(...topCategorias.map((c) => c.monto), 1);

    topCategorias.forEach((cat) => {
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(40, 40, 40);
      const label = cat.nombre.length > 20 ? `${cat.nombre.slice(0, 19)}…` : cat.nombre;
      doc.text(label, marginX, y + 4.6);

      const barW = Math.max((cat.monto / barMax) * barMaxW, 1.5);
      doc.setFillColor(230, 232, 236);
      doc.roundedRect(marginX + labelW, y + 1, barMaxW, 4.6, 1, 1, 'F');
      doc.setFillColor(...COLOR_ACCENT);
      doc.roundedRect(marginX + labelW, y + 1, barW, 4.6, 1, 1, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(20, 20, 20);
      doc.text(`${money(cat.monto)} (${((cat.monto / totalGastos) * 100).toFixed(0)}%)`, marginX + labelW + barMaxW + 2, y + 4.6);

      y += barRowH;
    });
    y += 4;
  } else {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLOR_GRAY_TEXT);
    doc.text('Sin gastos registrados este mes.', marginX, y + 4);
    y += 10;
  }

  // ---- Detalle de movimientos (acotado para no desbordar la hoja) ----
  sectionTitle(doc, 'Últimos movimientos', marginX, y);
  y += 5;

  const sortedMovs = input.movimientosDelMes.slice().sort((a, b) => toDate(b.fecha).getTime() - toDate(a.fecha).getTime());
  const shownMovs = sortedMovs.slice(0, MAX_MOVEMENTS_ROWS);

  if (shownMovs.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Fecha', 'Descripción', 'Tipo', 'Categoría', 'Monto']],
      body: shownMovs.map((tx) => [
        toDate(tx.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }),
        tx.descripcion,
        getTransactionTypeLabel(tx.tipo),
        getCategoryName(tx, input.categorias),
        money(tx.monto),
      ]),
      theme: 'striped',
      headStyles: { fillColor: COLOR_PRIMARY, fontSize: 8.5 },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: COLOR_CARD_BG },
      columnStyles: { 4: { halign: 'right' } },
      margin: { left: marginX, right: marginX },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 4;

    if (sortedMovs.length > MAX_MOVEMENTS_ROWS) {
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(...COLOR_GRAY_TEXT);
      doc.text(
        `Mostrando los ${MAX_MOVEMENTS_ROWS} movimientos más recientes de ${sortedMovs.length} este mes. Ver todos en Movimientos dentro de la app.`,
        marginX,
        y
      );
    }
  } else {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLOR_GRAY_TEXT);
    doc.text('Sin movimientos registrados este mes.', marginX, y + 4);
  }

  // ---- Pie de página ----
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(150);
    doc.text(`Página ${i} de ${pageCount} — CashLife`, pageWidth / 2, doc.internal.pageSize.getHeight() - 8, { align: 'center' });
  }

  return doc;
}

function reportFileName(generatedAt: Date) {
  return `CashLife-Reporte-${generatedAt.toISOString().slice(0, 10)}.pdf`;
}

/** Descarga el PDF directo al dispositivo. */
export function generateFinancialReportPdf(input: FinancialReportInput) {
  const doc = buildFinancialReportPdf(input);
  doc.save(reportFileName(input.generatedAt));
}

/** Abre el PDF en una pestaña nueva para verlo sin descargarlo. */
export function previewFinancialReportPdf(input: FinancialReportInput) {
  const doc = buildFinancialReportPdf(input);
  const blobUrl = doc.output('bloburl');
  window.open(blobUrl as unknown as string, '_blank');
}

/** Abre el PDF y dispara el diálogo de impresión del navegador. */
export function printFinancialReportPdf(input: FinancialReportInput) {
  const doc = buildFinancialReportPdf(input);
  doc.autoPrint();
  const blobUrl = doc.output('bloburl');
  window.open(blobUrl as unknown as string, '_blank');
}
