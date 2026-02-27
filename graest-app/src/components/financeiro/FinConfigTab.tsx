"use client";

import { useFinanceiro } from "./useFinanceiro";

export function FinConfigTab() {
  const { financeiro, update } = useFinanceiro();
  const config = financeiro.config;

  const setConfig = (key: keyof typeof config, value: number) => {
    update({ config: { ...config, [key]: value } });
  };

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Configurações do Orçamento
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Defina os percentuais que serão aplicados no cálculo do orçamento
          total (aba &quot;14. Orçamento&quot; da planilha).
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            ISS (%)
          </label>
          <input
            type="number"
            min={0}
            max={100}
            step={0.1}
            value={config.issPercent}
            onChange={(e) => setConfig("issPercent", parseFloat(e.target.value) || 0)}
            className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-green-500 focus:ring-1 focus:ring-green-500"
          />
          <p className="mt-1 text-xs text-gray-400">Padrão: 5%</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            DOA - Despesas Operacionais e Administrativas (%)
          </label>
          <input
            type="number"
            min={0}
            max={100}
            step={0.1}
            value={config.doaPercent}
            onChange={(e) => setConfig("doaPercent", parseFloat(e.target.value) || 0)}
            className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-green-500 focus:ring-1 focus:ring-green-500"
          />
          <p className="mt-1 text-xs text-gray-400">Padrão: 15%</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Reserva Técnica (%)
          </label>
          <input
            type="number"
            min={0}
            max={100}
            step={0.1}
            value={config.reservaPercent}
            onChange={(e) => setConfig("reservaPercent", parseFloat(e.target.value) || 0)}
            className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-green-500 focus:ring-1 focus:ring-green-500"
          />
          <p className="mt-1 text-xs text-gray-400">Padrão: 5%</p>
        </div>
      </div>
    </div>
  );
}
