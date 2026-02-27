"use client";

import { useFinanceiro } from "./useFinanceiro";
import { OutrosSubTable } from "./OutrosSubTable";

export function FinOutrosTab() {
  const { financeiro, update } = useFinanceiro();
  const outros = financeiro.outros;

  const updateSub = (key: keyof typeof outros, items: typeof outros[typeof key]) => {
    update({ outros: { ...outros, [key]: items } });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          VI - Outros Dispêndios
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Livros/Periódicos, Treinamentos, Viagens e Outros.
        </p>
      </div>

      <OutrosSubTable
        items={outros.livros}
        onChange={(items) => updateSub("livros", items)}
        maxItems={6}
        title="Livros e Periódicos"
      />

      <hr className="border-gray-200 dark:border-gray-700" />

      <OutrosSubTable
        items={outros.treinamentos}
        onChange={(items) => updateSub("treinamentos", items)}
        maxItems={6}
        title="Treinamentos"
      />

      <hr className="border-gray-200 dark:border-gray-700" />

      <OutrosSubTable
        items={outros.viagens}
        onChange={(items) => updateSub("viagens", items)}
        maxItems={6}
        title="Viagens"
      />

      <hr className="border-gray-200 dark:border-gray-700" />

      <OutrosSubTable
        items={outros.outrosDispendios}
        onChange={(items) => updateSub("outrosDispendios", items)}
        maxItems={5}
        title="Outros Dispêndios"
      />
    </div>
  );
}
