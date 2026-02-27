"use client";

import { useFinanceiro } from "./useFinanceiro";
import { usePlanStore } from "@/lib/store";

function sumEquip(items: { quantidade: number; custoUnitario: number }[]): number {
  return items.reduce((s, i) => s + (i.quantidade || 0) * (i.custoUnitario || 0), 0);
}

function sumRh(items: { salarioBase: number; encargosMes: number }[], projectMonths: number): number {
  return items.reduce((s, i) => s + ((i.salarioBase || 0) + (i.encargosMes || 0)) * projectMonths, 0);
}

function sumOutros(items: { quantidade: number; custoUnitario: number }[]): number {
  return items.reduce((s, i) => s + (i.quantidade || 0) * (i.custoUnitario || 0), 0);
}

function fmt(v: number): string {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function FinResumoTab() {
  const { financeiro } = useFinanceiro();
  const { config } = financeiro;
  const executionStartDate = usePlanStore((s) => s.formData.executionStartDate);
  const executionEndDate = usePlanStore((s) => s.formData.executionEndDate);

  const projectMonths = (() => {
    if (!executionStartDate || !executionEndDate) return 0;
    const start = new Date(executionStartDate);
    const end = new Date(executionEndDate);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    return Math.max(months, 0);
  })();

  const equipTotal = sumEquip(financeiro.equipamentos);
  const labTotal = sumEquip(financeiro.laboratorios);
  const rhDiretoTotal = sumRh(financeiro.rhDireto, projectMonths);
  const rhIndiretoTotal = sumRh(financeiro.rhIndireto, projectMonths);
  const stTotal = sumEquip(financeiro.servicosTerceiros);
  const mcTotal = sumEquip(financeiro.materialConsumo);
  const livrosTotal = sumOutros(financeiro.outros.livros);
  const treinTotal = sumOutros(financeiro.outros.treinamentos);
  const viagensTotal = sumOutros(financeiro.outros.viagens);
  const outrosTotal = sumOutros(financeiro.outros.outrosDispendios);

  const subtotalDireto =
    equipTotal + labTotal + rhDiretoTotal + rhIndiretoTotal + stTotal + mcTotal +
    livrosTotal + treinTotal + viagensTotal + outrosTotal;

  // Excel formula: Total = base / (1 - ISS% - DOA% - Reserva%)
  // ISS, DOA, Reserva are each a percentage of the Total (not the subtotal)
  const issP = (config.issPercent || 0) / 100;
  const doaP = (config.doaPercent || 0) / 100;
  const reservaP = (config.reservaPercent || 0) / 100;
  const divisor = 1 - issP - doaP - reservaP;
  const total = divisor > 0 ? subtotalDireto / divisor : subtotalDireto;
  const issVal = total * issP;
  const doaVal = total * doaP;
  const reservaVal = total * reservaP;

  const rows = [
    { label: "I - Equipamentos", value: equipTotal },
    { label: "II - Laboratórios", value: labTotal },
    { label: "III - RH Direto", value: rhDiretoTotal },
    { label: "III - RH Indireto", value: rhIndiretoTotal },
    { label: "IV - Serviços de Terceiros", value: stTotal },
    { label: "V - Material de Consumo", value: mcTotal },
    { label: "VI - Livros/Periódicos", value: livrosTotal },
    { label: "VI - Treinamentos", value: treinTotal },
    { label: "VI - Viagens", value: viagensTotal },
    { label: "VI - Outros Dispêndios", value: outrosTotal },
  ];

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Resumo Orçamentário
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Visão consolidada dos custos. Os valores finais com ISS, DOA e Reserva
          são calculados automaticamente na planilha exportada.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-surface-800">
              <th className="text-left py-2 px-4 font-medium text-gray-600 dark:text-gray-400">
                Categoria
              </th>
              <th className="text-right py-2 px-4 font-medium text-gray-600 dark:text-gray-400">
                Valor (R$)
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-t border-gray-100 dark:border-gray-800">
                <td className="py-2 px-4 text-gray-700 dark:text-gray-300">{r.label}</td>
                <td className="py-2 px-4 text-right font-mono text-gray-700 dark:text-gray-300">
                  {fmt(r.value)}
                </td>
              </tr>
            ))}

            <tr className="border-t-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-surface-800">
              <td className="py-2 px-4 font-semibold text-gray-800 dark:text-gray-200">
                Subtotal Direto
              </td>
              <td className="py-2 px-4 text-right font-mono font-semibold text-gray-800 dark:text-gray-200">
                {fmt(subtotalDireto)}
              </td>
            </tr>

            <tr className="border-t border-gray-100 dark:border-gray-800">
              <td className="py-2 px-4 text-gray-500 dark:text-gray-400">
                ISS ({config.issPercent}%)
              </td>
              <td className="py-2 px-4 text-right font-mono text-gray-500 dark:text-gray-400">
                {fmt(issVal)}
              </td>
            </tr>
            <tr className="border-t border-gray-100 dark:border-gray-800">
              <td className="py-2 px-4 text-gray-500 dark:text-gray-400">
                DOA ({config.doaPercent}%)
              </td>
              <td className="py-2 px-4 text-right font-mono text-gray-500 dark:text-gray-400">
                {fmt(doaVal)}
              </td>
            </tr>
            <tr className="border-t border-gray-100 dark:border-gray-800">
              <td className="py-2 px-4 text-gray-500 dark:text-gray-400">
                Reserva Técnica ({config.reservaPercent}%)
              </td>
              <td className="py-2 px-4 text-right font-mono text-gray-500 dark:text-gray-400">
                {fmt(reservaVal)}
              </td>
            </tr>

            <tr className="border-t-2 border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20">
              <td className="py-3 px-4 font-bold text-green-800 dark:text-green-300">
                TOTAL GERAL
              </td>
              <td className="py-3 px-4 text-right font-mono font-bold text-green-800 dark:text-green-300 text-base">
                R$ {fmt(total)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500">
        Nota: Este resumo é uma estimativa. Os valores exatos são calculados pelas
        fórmulas na planilha Excel exportada, que pode diferir ligeiramente por
        arredondamentos.
      </p>
    </div>
  );
}
