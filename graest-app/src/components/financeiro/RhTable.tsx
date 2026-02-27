"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { usePlanStore } from "@/lib/store";
import type { RhFinanceiroItem } from "@/types/plan";

interface Props {
  items: RhFinanceiroItem[];
  onChange: (items: RhFinanceiroItem[]) => void;
  maxItems: number;
  title: string;
  description?: string;
  directIndirect: "Direto" | "Indireto";
}

export function RhTable({ items, onChange, title, description, directIndirect }: Props) {
  const professionals = usePlanStore((s) => s.formData.professionals);
  const executionStartDate = usePlanStore((s) => s.formData.executionStartDate);
  const executionEndDate = usePlanStore((s) => s.formData.executionEndDate);

  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});

  // Calculate project duration in months
  const projectMonths = (() => {
    if (!executionStartDate || !executionEndDate) return 0;
    const start = new Date(executionStartDate);
    const end = new Date(executionEndDate);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    return Math.max(months, 0);
  })();

  // Filter plan professionals by directIndirect
  // Plan stores "direct"/"indirect", props receive "Direto"/"Indireto"
  const diValue = directIndirect === "Direto" ? "direct" : "indirect";
  const relevantProfessionals = professionals.filter(
    (p) => p.directIndirect === diValue || p.directIndirect === directIndirect
  );

  // Auto-sync: ensure items match plan professionals
  const syncItems = useCallback(() => {
    const synced: RhFinanceiroItem[] = relevantProfessionals.map((prof) => {
      // Find existing item by staffMemberId
      const existing = items.find((it) => it.staffMemberId === prof.staffMemberId);
      if (existing) {
        // Update name and role from plan (in case they changed)
        return {
          ...existing,
          nome: prof.name,
          profissionalNome: prof.roleInProject || existing.profissionalNome,
        };
      }
      // New professional — create empty item, fetch valorHora async
      return {
        staffMemberId: prof.staffMemberId,
        nome: prof.name,
        profissionalNome: prof.roleInProject || "",
        salarioBase: 0,
        encargosMes: 0,
        custoHora: 0,
        totalHsProjeto: 0,
      };
    });

    // Check if items actually changed to avoid infinite loop
    const changed =
      synced.length !== items.length ||
      synced.some((s, i) => {
        const o = items[i];
        return (
          s.staffMemberId !== o?.staffMemberId ||
          s.nome !== o?.nome ||
          s.profissionalNome !== o?.profissionalNome
        );
      });

    if (changed) {
      onChange(synced);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(relevantProfessionals.map((p) => ({ id: p.staffMemberId, name: p.name, role: p.roleInProject })))]);

  useEffect(() => {
    syncItems();
  }, [syncItems]);

  // Fetch valorHora for items that have staffMemberId but custoHora === 0
  useEffect(() => {
    let cancelled = false;
    const itemsNeedingFetch = items.filter(
      (it) => it.staffMemberId && it.custoHora === 0
    );
    if (itemsNeedingFetch.length === 0) return;

    Promise.all(
      itemsNeedingFetch.map(async (it) => {
        try {
          const res = await fetch(`/api/staff/${it.staffMemberId}`);
          if (res.ok) {
            const staff = await res.json();
            return { staffMemberId: it.staffMemberId, valorHora: staff.valorHora ?? 0 };
          }
        } catch { /* ignore */ }
        return { staffMemberId: it.staffMemberId, valorHora: 0 };
      })
    ).then((results) => {
      if (cancelled) return;
      const valorMap = new Map(results.map((r) => [r.staffMemberId, r.valorHora]));
      let anyChanged = false;
      const updated = items.map((item) => {
        if (item.custoHora === 0 && valorMap.has(item.staffMemberId)) {
          const vh = valorMap.get(item.staffMemberId)!;
          if (vh > 0) {
            anyChanged = true;
            const totalHs =
              vh > 0 && projectMonths > 0 && item.salarioBase > 0
                ? (item.salarioBase * projectMonths) / vh
                : 0;
            return { ...item, custoHora: vh, totalHsProjeto: totalHs };
          }
        }
        return item;
      });
      if (anyChanged) onChange(updated);
    });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const updateSalarioBase = (idx: number, salarioBase: number) => {
    const updated = items.map((item, i) => {
      if (i !== idx) return item;
      const custoHora = item.custoHora || 0;
      const totalHs =
        custoHora > 0 && projectMonths > 0
          ? (salarioBase * projectMonths) / custoHora
          : item.totalHsProjeto;
      return { ...item, salarioBase, encargosMes: 0, totalHsProjeto: totalHs };
    });
    onChange(updated);
  };

  const toggleCollapse = (idx: number) => {
    setCollapsed((prev) => ({ ...prev, [idx]: !prev[idx] }));
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
            Nenhum profissional com dedicação {directIndirect.toLowerCase()} no plano de trabalho.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => {
            const totalMes = (item.salarioBase || 0) + (item.encargosMes || 0);
            const custoTotal = totalMes * projectMonths;
            const isCollapsed = collapsed[idx];

            return (
              <div
                key={item.staffMemberId || idx}
                className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-800 overflow-hidden"
              >
                {/* Header — always visible */}
                <button
                  onClick={() => toggleCollapse(idx)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-surface-750 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {isCollapsed ? (
                      <ChevronRight size={16} className="shrink-0 text-gray-400" />
                    ) : (
                      <ChevronDown size={16} className="shrink-0 text-gray-400" />
                    )}
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                      {item.nome || `Profissional ${idx + 1}`}
                    </span>
                    {item.profissionalNome && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate hidden sm:inline">
                        — {item.profissionalNome}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 shrink-0 ml-4">
                    {item.custoHora > 0 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        R$ {item.custoHora.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/h
                      </span>
                    )}
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      R$ {custoTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </button>

                {/* Body — collapsible */}
                {!isCollapsed && (
                  <div className="px-4 pb-4 pt-1 space-y-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Nome
                        </label>
                        <div className="px-2.5 py-1.5 text-sm text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-surface-900 rounded border border-gray-200 dark:border-gray-700 min-h-[32px]">
                          {item.nome || "—"}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Profissional (função no projeto)
                        </label>
                        <div className="px-2.5 py-1.5 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-surface-900 rounded border border-gray-200 dark:border-gray-700 min-h-[32px]">
                          {item.profissionalNome || "—"}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Salário Base (R$)
                        </label>
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          value={item.salarioBase || ""}
                          onChange={(e) => updateSalarioBase(idx, parseFloat(e.target.value) || 0)}
                          className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-900 px-2.5 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Encargos/Mês (R$)
                        </label>
                        <div className="px-2.5 py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-surface-900 rounded border border-gray-200 dark:border-gray-700">
                          {(item.encargosMes || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Total/Mês
                        </label>
                        <div className="px-2.5 py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-surface-900 rounded border border-gray-200 dark:border-gray-700">
                          {totalMes.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Custo/Hora (R$)
                        </label>
                        <div className="px-2.5 py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-surface-900 rounded border border-gray-200 dark:border-gray-700">
                          {(item.custoHora || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Total Horas
                        </label>
                        <div className="px-2.5 py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-surface-900 rounded border border-gray-200 dark:border-gray-700">
                          {(item.totalHsProjeto || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                      Custo Total: <span className="font-medium text-gray-700 dark:text-gray-200">
                        R$ {custoTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
