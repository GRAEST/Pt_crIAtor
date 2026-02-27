"use client";

import { getBolsasByGroup } from "@/data/bolsas-praticadas";

interface Props {
  value: string;
  onChange: (bolsaId: string, valorHora: number | null) => void;
}

export function BolsaSelect({ value, onChange }: Props) {
  const groups = getBolsasByGroup();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (!id) {
      onChange("", null);
      return;
    }
    // Find the entry to get the valorHora
    for (const entries of groups.values()) {
      const entry = entries.find((b) => b.id === id);
      if (entry) {
        onChange(id, entry.valorHora);
        return;
      }
    }
    onChange(id, null);
  };

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
        Valor Hora (Bolsa)
      </label>
      <select
        value={value}
        onChange={handleChange}
        className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-surface-800 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400 transition-colors"
      >
        <option value="">Selecione a bolsa...</option>
        {Array.from(groups.entries()).map(([grupo, entries]) => (
          <optgroup key={grupo} label={`Bolsas ${grupo}`}>
            {entries.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.descricao} — R$ {entry.valorHora.toFixed(2)}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
