"use client";

import { Plus, Trash2 } from "lucide-react";
import type { OutrosSubItem } from "@/types/plan";

const EMPTY_ITEM: OutrosSubItem = {
  descricao: "",
  justificativa: "",
  tipo: "",
  quantidade: 0,
  custoUnitario: 0,
};

interface Props {
  items: OutrosSubItem[];
  onChange: (items: OutrosSubItem[]) => void;
  maxItems: number;
  title: string;
}

export function OutrosSubTable({ items, onChange, maxItems, title }: Props) {
  const addItem = () => {
    if (items.length >= maxItems) return;
    onChange([...items, { ...EMPTY_ITEM }]);
  };

  const removeItem = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: keyof OutrosSubItem, value: string | number) => {
    const updated = items.map((item, i) =>
      i === idx ? { ...item, [field]: value } : item
    );
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</h3>

      {items.map((item, idx) => (
        <div
          key={idx}
          className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-800 p-3 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Item {idx + 1}</span>
            <button onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-700 p-1">
              <Trash2 size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-0.5">Descrição</label>
              <input
                type="text"
                value={item.descricao}
                onChange={(e) => updateItem(idx, "descricao", e.target.value)}
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-900 px-2 py-1 text-sm text-gray-900 dark:text-gray-100 focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-0.5">Justificativa</label>
              <input
                type="text"
                value={item.justificativa}
                onChange={(e) => updateItem(idx, "justificativa", e.target.value)}
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-900 px-2 py-1 text-sm text-gray-900 dark:text-gray-100 focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-0.5">Tipo</label>
              <select
                value={item.tipo}
                onChange={(e) => updateItem(idx, "tipo", e.target.value)}
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-900 px-2 py-1 text-sm text-gray-900 dark:text-gray-100 focus:border-green-500 focus:ring-1 focus:ring-green-500"
              >
                <option value="">Selecione</option>
                <option value="Nacional">Nacional</option>
                <option value="Importado">Importado</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-0.5">Quantidade</label>
              <input
                type="number"
                min={0}
                value={item.quantidade || ""}
                onChange={(e) => updateItem(idx, "quantidade", parseFloat(e.target.value) || 0)}
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-900 px-2 py-1 text-sm text-gray-900 dark:text-gray-100 focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-0.5">Custo Unit. (R$)</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={item.custoUnitario || ""}
                onChange={(e) => updateItem(idx, "custoUnitario", parseFloat(e.target.value) || 0)}
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-900 px-2 py-1 text-sm text-gray-900 dark:text-gray-100 focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
          </div>
        </div>
      ))}

      {items.length < maxItems && (
        <button
          onClick={addItem}
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-green-600 transition-colors"
        >
          <Plus size={14} />
          Adicionar ({items.length}/{maxItems})
        </button>
      )}
    </div>
  );
}
