"use client";

import { useMemo } from "react";
import { usePlanStore } from "@/lib/store";
import { Input } from "@/components/ui/Input";
import { DateInput } from "@/components/ui/DateInput";
import type { FinanceiroData } from "@/types/plan";
import { defaultFinanceiroData } from "@/types/plan";
import { numberToWordsBRL } from "@/lib/numberToWords";

function formatBRL(value: number | null): string {
  if (value === null || isNaN(value)) return "";
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function calcTotalFromFinanceiro(fin: FinanceiroData, projectMonths: number): number {
  const sumEquip = (items: { quantidade: number; custoUnitario: number }[]) =>
    items.reduce((s, i) => s + (i.quantidade || 0) * (i.custoUnitario || 0), 0);
  const sumRh = (items: { salarioBase: number; encargosMes: number }[]) =>
    items.reduce((s, i) => s + ((i.salarioBase || 0) + (i.encargosMes || 0)) * projectMonths, 0);
  const sumOutros = (items: { quantidade: number; custoUnitario: number }[]) =>
    items.reduce((s, i) => s + (i.quantidade || 0) * (i.custoUnitario || 0), 0);

  const subtotal =
    sumEquip(fin.equipamentos) + sumEquip(fin.laboratorios) +
    sumRh(fin.rhDireto) + sumRh(fin.rhIndireto) +
    sumEquip(fin.servicosTerceiros) + sumEquip(fin.materialConsumo) +
    sumOutros(fin.outros.livros) + sumOutros(fin.outros.treinamentos) +
    sumOutros(fin.outros.viagens) + sumOutros(fin.outros.outrosDispendios);

  const issP = (fin.config.issPercent || 0) / 100;
  const doaP = (fin.config.doaPercent || 0) / 100;
  const reservaP = (fin.config.reservaPercent || 0) / 100;
  const divisor = 1 - issP - doaP - reservaP;
  return divisor > 0 ? subtotal / divisor : subtotal;
}

export function Step01Identificacao() {
  const { formData, updateField } = usePlanStore();
  const financeiro = formData.financeiro ?? defaultFinanceiroData;

  const projectMonths = useMemo(() => {
    if (!formData.executionStartDate || !formData.executionEndDate) return 0;
    const start = new Date(formData.executionStartDate);
    const end = new Date(formData.executionEndDate);
    return Math.max((end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()), 0);
  }, [formData.executionStartDate, formData.executionEndDate]);

  const totalValue = useMemo(() => calcTotalFromFinanceiro(financeiro, projectMonths), [financeiro, projectMonths]);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
        1. Identificação do Projeto
      </h2>

      {/* Project Name with char counter */}
      <div>
        <Input
          id="projectName"
          label="Nome do Projeto"
          value={formData.projectName}
          maxLength={120}
          onChange={(e) => updateField("projectName", e.target.value)}
          placeholder="Digite o nome do projeto"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
          {formData.projectName.length}/120 caracteres
        </p>
      </div>

      <Input
        id="projectNickname"
        label="Apelido do Projeto"
        value={formData.projectNickname}
        onChange={(e) => updateField("projectNickname", e.target.value)}
        placeholder="Apelido ou sigla do projeto"
      />

      <Input
        id="coordinatorInstitution"
        label="Coordenador da Instituição"
        value={formData.coordinatorInstitution}
        onChange={(e) => updateField("coordinatorInstitution", e.target.value)}
        placeholder="Nome do coordenador da instituição"
      />

      <Input
        id="coordinatorFoxconn"
        label="Coordenador do Projeto na Empresa"
        value={formData.coordinatorFoxconn}
        onChange={(e) => updateField("coordinatorFoxconn", e.target.value)}
        placeholder="Nome do coordenador na empresa"
      />

      {/* Total Value - calculated from financeiro */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Valor Total (R$)
        </label>
        <div className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-surface-900 rounded-lg border border-gray-200 dark:border-gray-700 min-h-[38px] flex items-center">
          {totalValue > 0 ? formatBRL(totalValue) : <span className="text-gray-400 dark:text-gray-500">Calculado automaticamente pela planilha financeira</span>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Valor por Extenso
        </label>
        <div className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-surface-900 rounded-lg border border-gray-200 dark:border-gray-700 min-h-[38px] flex items-center">
          {totalValue > 0 ? numberToWordsBRL(totalValue) : <span className="text-gray-400 dark:text-gray-500">Calculado automaticamente</span>}
        </div>
      </div>

      {/* Execution Dates */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DateInput
          id="executionStartDate"
          label="Inicio da Execucao"
          value={formData.executionStartDate}
          onChange={(v) => updateField("executionStartDate", v)}
        />
        <div>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <DateInput
                id="executionEndDate"
                label="Fim da Execucao"
                value={formData.executionEndDate}
                onChange={(v) => updateField("executionEndDate", v)}
              />
            </div>
            {formData.executionStartDate && formData.executionEndDate && (() => {
              const start = new Date(formData.executionStartDate);
              const end = new Date(formData.executionEndDate);
              const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
              if (months > 0) {
                return (
                  <span className="shrink-0 mb-1 inline-flex items-center rounded-md bg-primary-500/10 px-2.5 py-1.5 text-sm font-medium text-primary-400 ring-1 ring-inset ring-primary-500/20">
                    {months} {months === 1 ? "mes" : "meses"}
                  </span>
                );
              }
              return null;
            })()}
          </div>
        </div>
      </div>

      {/* Validity Dates */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DateInput
          id="validityStartDate"
          label="Inicio da Vigencia"
          value={formData.validityStartDate}
          onChange={(v) => updateField("validityStartDate", v)}
        />
        <DateInput
          id="validityEndDate"
          label="Fim da Vigencia"
          value={formData.validityEndDate}
          onChange={(v) => updateField("validityEndDate", v)}
        />
      </div>
    </div>
  );
}
