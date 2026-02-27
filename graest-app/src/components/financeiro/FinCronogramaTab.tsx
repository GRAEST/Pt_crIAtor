"use client";

import { useState, useRef, useCallback } from "react";
import { useFinanceiro } from "./useFinanceiro";
import { usePlanStore } from "@/lib/store";
import { Divide, Trash2 } from "lucide-react";
import type { CronogramaFinanceiroMes } from "@/types/plan";

type CronKey = keyof Omit<CronogramaFinanceiroMes, "mes">;

/** Parse a raw pt-BR input string to a number */
function parseRaw(rawVal: string): number {
  const cleaned = rawVal.replace(/\./g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}

/** Monetary input that formats as pt-BR currency and clamps to a max value in real-time */
function MoneyInput({
  value,
  max,
  onChange,
}: {
  value: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [raw, setRaw] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const formatted = value
    ? value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "";

  const clampedMax = Math.max(Math.round(max * 100) / 100, 0);

  const handleFocus = () => {
    setEditing(true);
    setRaw(value ? String(value).replace(".", ",") : "");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRaw = e.target.value;
    const parsed = parseRaw(newRaw);
    // Real-time clamp: if typed value exceeds max, snap to max
    if (parsed > clampedMax) {
      setRaw(clampedMax > 0 ? String(clampedMax).replace(".", ",") : "");
      return;
    }
    setRaw(newRaw);
  };

  const commit = useCallback(() => {
    setEditing(false);
    let num = parseRaw(raw);
    if (num < 0) num = 0;
    if (num > clampedMax) num = clampedMax;
    onChange(num);
  }, [clampedMax, raw, onChange]);

  const handleBlur = () => commit();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
      inputRef.current?.blur();
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="decimal"
      value={editing ? raw : formatted}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      className="w-full rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-900 px-1 py-0.5 text-xs text-right text-gray-900 dark:text-gray-100 focus:border-green-500 focus:ring-1 focus:ring-green-500"
    />
  );
}

function getEmptyMonth(mes: number): CronogramaFinanceiroMes {
  return {
    mes,
    equipamentos: 0,
    laboratorios: 0,
    rhDireto: 0,
    rhIndireto: 0,
    servicosTerceiros: 0,
    materialConsumo: 0,
    livros: 0,
    treinamentos: 0,
    viagens: 0,
    outrosDispendios: 0,
  };
}

// Helpers to compute category totals from financeiro data
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

/**
 * Compute monthly derived values using the Excel formula:
 *   Total = base / (1 - ISS% - DOA% - Reserva%)
 * where base = sum of all editable categories for that month.
 * ISS, DOA, Reserva are each = Total * their respective %.
 */
function computeMonthDerived(month: CronogramaFinanceiroMes, issP: number, doaP: number, reservaP: number) {
  const totalIaV =
    (month.equipamentos || 0) +
    (month.laboratorios || 0) +
    (month.rhDireto || 0) +
    (month.rhIndireto || 0) +
    (month.servicosTerceiros || 0) +
    (month.materialConsumo || 0);

  const base =
    totalIaV +
    (month.livros || 0) +
    (month.treinamentos || 0) +
    (month.viagens || 0) +
    (month.outrosDispendios || 0);

  const divisor = 1 - issP - doaP - reservaP;
  const total = divisor > 0 ? base / divisor : base;
  const iss = total * issP;
  const doa = total * doaP;
  const reserva = total * reservaP;

  const viSubtotal =
    (month.livros || 0) +
    (month.treinamentos || 0) +
    (month.viagens || 0) +
    iss +
    (month.outrosDispendios || 0);

  const totalIaVI = totalIaV + viSubtotal;

  return { totalIaV, viSubtotal, iss, totalIaVI, doa, reserva, total };
}

// Row definition for the cronograma table
interface RowDef {
  id: string;
  label: string;
  cronKey?: CronKey;
  derivedKey?: "totalIaV" | "viSubtotal" | "iss" | "totalIaVI" | "doa" | "reserva" | "total";
  getValor: (ctx: ValorCtx) => number;
  isSummary?: boolean;
  isFinal?: boolean;
  indent?: boolean;
}

interface ValorCtx {
  equipTotal: number;
  labTotal: number;
  rhDiretoTotal: number;
  rhIndiretoTotal: number;
  stTotal: number;
  mcTotal: number;
  livrosTotal: number;
  treinTotal: number;
  viagensTotal: number;
  outrosTotal: number;
  totalIaV: number;
  viSubtotal: number;
  issVal: number;
  totalIaVI: number;
  doaVal: number;
  reservaVal: number;
  totalGeral: number;
}

const ROWS: RowDef[] = [
  { id: "equip", label: "I - Equipamentos", cronKey: "equipamentos", getValor: (c) => c.equipTotal },
  { id: "lab", label: "II - Laboratórios", cronKey: "laboratorios", getValor: (c) => c.labTotal },
  { id: "rhd", label: "III - RH Direto", cronKey: "rhDireto", getValor: (c) => c.rhDiretoTotal },
  { id: "rhi", label: "III - RH Indireto", cronKey: "rhIndireto", getValor: (c) => c.rhIndiretoTotal },
  { id: "st", label: "IV - Serv. Terceiros", cronKey: "servicosTerceiros", getValor: (c) => c.stTotal },
  { id: "mc", label: "V - Mat. Consumo", cronKey: "materialConsumo", getValor: (c) => c.mcTotal },
  {
    id: "totalIaV",
    label: "Total Dispêndios (I a V)",
    isSummary: true,
    derivedKey: "totalIaV",
    getValor: (c) => c.totalIaV,
  },
  {
    id: "viSubtotal",
    label: "VI - Outros disp. correlatos",
    isSummary: true,
    derivedKey: "viSubtotal",
    getValor: (c) => c.viSubtotal,
  },
  { id: "livros", label: "Livros e Periódicos", cronKey: "livros", indent: true, getValor: (c) => c.livrosTotal },
  { id: "trein", label: "Treinamentos", cronKey: "treinamentos", indent: true, getValor: (c) => c.treinTotal },
  { id: "viagens", label: "Viagens", cronKey: "viagens", indent: true, getValor: (c) => c.viagensTotal },
  { id: "iss", label: "ISS", derivedKey: "iss", indent: true, getValor: (c) => c.issVal },
  { id: "outros", label: "Outros (Aluguel, Internet, etc.)", cronKey: "outrosDispendios", indent: true, getValor: (c) => c.outrosTotal },
  {
    id: "totalIaVI",
    label: "Total Dispêndios (I a VI)",
    isSummary: true,
    derivedKey: "totalIaVI",
    getValor: (c) => c.totalIaVI,
  },
  { id: "doa", label: "DOA", isSummary: true, derivedKey: "doa", getValor: (c) => c.doaVal },
  { id: "reserva", label: "Reserva Técnica", isSummary: true, derivedKey: "reserva", getValor: (c) => c.reservaVal },
  { id: "total", label: "Total", isFinal: true, derivedKey: "total", getValor: (c) => c.totalGeral },
];

export function FinCronogramaTab() {
  const { financeiro, update } = useFinanceiro();
  const executionStartDate = usePlanStore((s) => s.formData.executionStartDate);
  const executionEndDate = usePlanStore((s) => s.formData.executionEndDate);
  const cron = financeiro.cronogramaFinanceiro;
  const { config } = financeiro;

  const issP = (config.issPercent || 0) / 100;
  const doaP = (config.doaPercent || 0) / 100;
  const reservaP = (config.reservaPercent || 0) / 100;

  // Calculate project duration in months
  const totalMonths = (() => {
    if (!executionStartDate || !executionEndDate) return 18;
    const start = new Date(executionStartDate);
    const end = new Date(executionEndDate);
    const m = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    return Math.max(m, 1);
  })();

  // Build months array matching project duration
  const months: CronogramaFinanceiroMes[] = [];
  for (let m = 1; m <= totalMonths; m++) {
    const existing = cron.find((c) => c.mes === m);
    months.push(existing ?? getEmptyMonth(m));
  }

  // Compute category totals (VALOR) from financeiro items using Excel formula
  const equipTotal = sumEquip(financeiro.equipamentos);
  const labTotal = sumEquip(financeiro.laboratorios);
  const rhDiretoTotal = sumRh(financeiro.rhDireto, totalMonths);
  const rhIndiretoTotal = sumRh(financeiro.rhIndireto, totalMonths);
  const stTotal = sumEquip(financeiro.servicosTerceiros);
  const mcTotal = sumEquip(financeiro.materialConsumo);
  const livrosTotal = sumOutros(financeiro.outros.livros);
  const treinTotal = sumOutros(financeiro.outros.treinamentos);
  const viagensTotal = sumOutros(financeiro.outros.viagens);
  const outrosTotal = sumOutros(financeiro.outros.outrosDispendios);

  const totalIaV = equipTotal + labTotal + rhDiretoTotal + rhIndiretoTotal + stTotal + mcTotal;
  const base = totalIaV + livrosTotal + treinTotal + viagensTotal + outrosTotal;
  const divisor = 1 - issP - doaP - reservaP;
  const totalGeral = divisor > 0 ? base / divisor : base;
  const issVal = totalGeral * issP;
  const doaVal = totalGeral * doaP;
  const reservaVal = totalGeral * reservaP;
  const viSubtotal = livrosTotal + treinTotal + viagensTotal + issVal + outrosTotal;
  const totalIaVI = totalIaV + viSubtotal;

  const valorCtx: ValorCtx = {
    equipTotal, labTotal, rhDiretoTotal, rhIndiretoTotal, stTotal, mcTotal,
    livrosTotal, treinTotal, viagensTotal, outrosTotal,
    totalIaV, viSubtotal, issVal, totalIaVI, doaVal, reservaVal, totalGeral,
  };

  const setValue = (mes: number, cronKey: CronKey, value: number) => {
    const updated = months.map((m) =>
      m.mes === mes ? { ...m, [cronKey]: value } : m
    );
    update({ cronogramaFinanceiro: updated });
  };

  // Clear all months for a given category
  const clearRow = (cronKey: CronKey) => {
    const updated = months.map((m) => ({ ...m, [cronKey]: 0 }));
    update({ cronogramaFinanceiro: updated });
  };

  // Auto-distribute: divide VALOR equally across all months for a given category
  const autoDistribute = (cronKey: CronKey, valor: number) => {
    if (totalMonths <= 0 || valor <= 0) return;
    const perMonth = valor / totalMonths;
    const updated = months.map((m) => ({ ...m, [cronKey]: perMonth }));
    update({ cronogramaFinanceiro: updated });
  };

  // Precompute derived values per month
  const monthDerived = months.map((m) => computeMonthDerived(m, issP, doaP, reservaP));

  // Get the monthly cell value for a given row and month index
  function getCellValue(row: RowDef, monthIdx: number): number {
    const month = months[monthIdx];
    if (row.cronKey) return month[row.cronKey] || 0;
    if (row.derivedKey) return monthDerived[monthIdx][row.derivedKey];
    return 0;
  }

  // Row total (sum across all months)
  function getRowDistTotal(row: RowDef): number {
    let sum = 0;
    for (let i = 0; i < months.length; i++) sum += getCellValue(row, i);
    return sum;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Cronograma de Execução Financeira
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Distribuição mensal dos custos por categoria ({totalMonths} meses). Valores em R$.
          O &quot;Check&quot; mostra a diferença entre o valor orçado e o distribuído.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-surface-800">
              <th className="sticky left-0 z-10 bg-gray-50 dark:bg-surface-800 py-2 px-3 text-left font-medium text-gray-600 dark:text-gray-400 min-w-[200px]">
                Despesas do Projeto
              </th>
              <th className="py-2 px-1 text-center font-medium min-w-[110px] bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300">
                VALOR (R$)
              </th>
              {months.map((m) => (
                <th
                  key={m.mes}
                  className="py-2 px-1 text-center font-medium text-gray-600 dark:text-gray-400 min-w-[80px]"
                >
                  Mês {m.mes}
                </th>
              ))}
              <th className="py-2 px-1 text-center font-medium min-w-[110px] bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300">
                Total Dist. Mensal
              </th>
              <th className="py-2 px-1 text-center font-medium min-w-[110px] bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-300">
                Check
              </th>
              <th className="py-2 px-1 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => {
              const valor = row.getValor(valorCtx);
              const distTotal = getRowDistTotal(row);
              const check = valor - distTotal;
              const isEditable = !!row.cronKey;

              // Row styling
              let rowBg = "bg-white dark:bg-surface-850";
              let textCls = "text-gray-700 dark:text-gray-300";
              let fontCls = "font-medium";
              if (row.isSummary) {
                rowBg = "bg-gray-50 dark:bg-surface-800";
                textCls = "text-gray-800 dark:text-gray-200";
                fontCls = "font-semibold";
              }
              if (row.isFinal) {
                rowBg = "bg-green-50 dark:bg-green-950/20";
                textCls = "text-green-800 dark:text-green-300";
                fontCls = "font-bold";
              }

              // Check cell color
              let checkBg = "";
              let checkText = "text-gray-500 dark:text-gray-400";
              if (valor > 0 || distTotal > 0) {
                if (Math.abs(check) < 0.01) {
                  checkBg = "bg-green-50 dark:bg-green-950/20";
                  checkText = "text-green-600 dark:text-green-400";
                } else {
                  checkBg = "bg-yellow-50 dark:bg-yellow-950/20";
                  checkText = "text-yellow-700 dark:text-yellow-300";
                }
              }

              return (
                <tr key={row.id} className={`border-t border-gray-100 dark:border-gray-800 ${rowBg}`}>
                  {/* Category label + auto-distribute button */}
                  <td className={`sticky left-0 z-10 ${rowBg} py-1.5 px-3 ${fontCls} ${textCls} whitespace-nowrap ${row.indent ? "pl-6" : ""}`}>
                    <div className="flex items-center gap-1.5">
                      <span>{row.label}</span>
                      {isEditable && valor > 0 && (row.cronKey === "rhDireto" || row.cronKey === "rhIndireto") && (
                        <button
                          type="button"
                          onClick={() => autoDistribute(row.cronKey!, valor)}
                          title={`Dividir R$ ${fmt(valor)} igualmente entre ${totalMonths} meses`}
                          className="inline-flex items-center justify-center rounded p-0.5 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:text-green-400 dark:hover:bg-green-950/30 transition-colors"
                        >
                          <Divide size={12} />
                        </button>
                      )}
                    </div>
                  </td>

                  {/* VALOR (R$) */}
                  <td className="py-1 px-2 text-right font-mono text-gray-700 dark:text-gray-300 bg-amber-50/50 dark:bg-amber-950/10">
                    {fmt(valor)}
                  </td>

                  {/* Month cells */}
                  {months.map((month, monthIdx) => {
                    const cellVal = getCellValue(row, monthIdx);

                    if (isEditable) {
                      // Max for this cell = VALOR - sum of all OTHER months in this row
                      const otherMonthsSum = distTotal - cellVal;
                      const cellMax = Math.max(valor - otherMonthsSum, 0);
                      return (
                        <td key={month.mes} className="py-1 px-1">
                          <MoneyInput
                            value={cellVal}
                            max={cellMax}
                            onChange={(v) => setValue(month.mes, row.cronKey!, v)}
                          />
                        </td>
                      );
                    }

                    return (
                      <td
                        key={month.mes}
                        className={`py-1 px-1 text-right font-mono ${textCls} ${row.isFinal ? "font-bold" : ""}`}
                      >
                        {cellVal !== 0 ? fmt(cellVal) : "-"}
                      </td>
                    );
                  })}

                  {/* Total Distribuição Mensal */}
                  <td className={`py-1 px-2 text-right font-mono ${fontCls} text-blue-700 dark:text-blue-300 bg-blue-50/50 dark:bg-blue-950/10`}>
                    {fmt(distTotal)}
                  </td>

                  {/* Check Mensal x Total */}
                  <td className={`py-1 px-2 text-right font-mono ${fontCls} ${checkText} ${checkBg}`}>
                    {valor > 0 || distTotal > 0 ? fmt(check) : "-"}
                  </td>

                  {/* Clear row */}
                  <td className="py-1 px-1">
                    {isEditable && distTotal > 0 && (
                      <button
                        type="button"
                        onClick={() => clearRow(row.cronKey!)}
                        title="Limpar todos os meses desta linha"
                        className="inline-flex items-center justify-center rounded p-0.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-950/30 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
