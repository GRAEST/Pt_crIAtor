"use client";

import { Plus, Trash2 } from "lucide-react";
import type { EquipamentoItem } from "@/types/plan";

const EMPTY_ITEM: EquipamentoItem = {
  nome: "",
  atividade: "",
  descricao: "",
  justificativa: "",
  seMaisDeUm: "",
  tipo: "",
  quantidade: 0,
  custoUnitario: 0,
};

interface Props {
  items: EquipamentoItem[];
  onChange: (items: EquipamentoItem[]) => void;
  maxItems: number;
  title: string;
  description?: string;
}

export function EquipTable({ items, onChange, maxItems, title, description }: Props) {
  const addItem = () => {
    if (items.length >= maxItems) return;
    onChange([...items, { ...EMPTY_ITEM }]);
  };

  const removeItem = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: keyof EquipamentoItem, value: string | number) => {
    const updated = items.map((item, i) =>
      i === idx ? { ...item, [field]: value } : item
    );
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Nenhum item adicionado. Clique no botão abaixo para adicionar.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-800 p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Item {idx + 1}
                </span>
                <button
                  onClick={() => removeItem(idx)}
                  className="text-red-500 hover:text-red-700 transition-colors p-1"
                  title="Remover item"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={item.nome}
                    onChange={(e) => updateItem(idx, "nome", e.target.value)}
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-900 px-2.5 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Atividade relacionada
                  </label>
                  <input
                    type="text"
                    value={item.atividade}
                    onChange={(e) => updateItem(idx, "atividade", e.target.value)}
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-900 px-2.5 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Descrição
                </label>
                <textarea
                  value={item.descricao}
                  onChange={(e) => updateItem(idx, "descricao", e.target.value)}
                  rows={2}
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-900 px-2.5 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Justificativa
                </label>
                <textarea
                  value={item.justificativa}
                  onChange={(e) => updateItem(idx, "justificativa", e.target.value)}
                  rows={2}
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-900 px-2.5 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                />
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Justificativa para mais de uma unidade
                  </label>
                  <input
                    type="text"
                    value={item.seMaisDeUm}
                    onChange={(e) => updateItem(idx, "seMaisDeUm", e.target.value)}
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-900 px-2.5 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Tipo
                  </label>
                  <select
                    value={item.tipo}
                    onChange={(e) => updateItem(idx, "tipo", e.target.value)}
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-900 px-2.5 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  >
                    <option value="">Selecione</option>
                    <option value="Nacional">Nacional</option>
                    <option value="Importado">Importado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Quantidade
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={item.quantidade || ""}
                    onChange={(e) => updateItem(idx, "quantidade", parseFloat(e.target.value) || 0)}
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-900 px-2.5 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Custo Unitário (R$)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={item.custoUnitario || ""}
                    onChange={(e) => updateItem(idx, "custoUnitario", parseFloat(e.target.value) || 0)}
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-900 px-2.5 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                Custo Total: <span className="font-medium text-gray-700 dark:text-gray-200">
                  R$ {((item.quantidade || 0) * (item.custoUnitario || 0)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {items.length < maxItems && (
        <button
          onClick={addItem}
          className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:border-green-500 hover:text-green-600 transition-colors"
        >
          <Plus size={16} />
          Adicionar item ({items.length}/{maxItems})
        </button>
      )}
    </div>
  );
}
