'use client';

import { usePeople } from '@/hooks/usePeople';
import { Trash2, PlusCircle } from 'lucide-react';

export interface SplitRow {
  personId: string;
  amount: string;
}

interface SplitRowsEditorProps {
  rows: SplitRow[];
  onChange: (rows: SplitRow[]) => void;
  /**
   * Costo real del gasto (lo que a ti te cobran). Los montos que pongas por
   * persona pueden sumar menos (tú cubres el resto) o más (tu margen/extra
   * por gestionarlo) — solo se usa para mostrar la comparación, no limita
   * lo que puedes escribir en cada fila.
   */
  totalAmount?: number;
}

const money = (n: number) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n || 0);

export function SplitRowsEditor({ rows, onChange, totalAmount }: SplitRowsEditorProps) {
  const { contacts } = usePeople();
  const totalSplit = rows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const addRow = () => onChange([...rows, { personId: '', amount: '' }]);
  const updateRow = (index: number, patch: Partial<SplitRow>) => {
    const next = rows.slice();
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };
  const removeRow = (index: number) => onChange(rows.filter((_, i) => i !== index));

  return (
    <div className="space-y-2">
      {rows.map((row, i) => (
        <div key={i} className="flex gap-2">
          <select
            value={row.personId}
            onChange={(e) => updateRow(i, { personId: e.target.value })}
            className="flex-1 rounded-lg border border-border bg-muted px-3 py-2 text-sm"
          >
            <option value="">Selecciona persona</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
          <input
            type="number"
            step="0.01"
            min="0"
            value={row.amount}
            onChange={(e) => updateRow(i, { amount: e.target.value })}
            placeholder="0.00"
            className="w-24 rounded-lg border border-border bg-muted px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => removeRow(i)}
            className="px-2 text-muted-foreground hover:text-destructive transition-colors"
            title="Quitar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addRow}
        className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80"
      >
        <PlusCircle className="w-4 h-4" /> Agregar persona
      </button>

      {rows.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {totalAmount ? (
            totalSplit > totalAmount ? (
              <>
                Cobras {money(totalSplit)} · te cuesta {money(totalAmount)} ·{' '}
                <span className="text-emerald-500 font-medium">tu margen: +{money(totalSplit - totalAmount)}</span>
              </>
            ) : totalSplit < totalAmount ? (
              <>Dividido: {money(totalSplit)} de {money(totalAmount)} — el resto ({money(totalAmount - totalSplit)}) lo pagas tú</>
            ) : (
              <>Dividido: {money(totalSplit)} — cubre el costo completo, no pagas nada extra</>
            )
          ) : (
            <>Dividido: {money(totalSplit)}</>
          )}
        </p>
      )}
    </div>
  );
}
