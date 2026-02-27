"use client";

import { useEffect, useRef, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, FileSpreadsheet, Loader2, Check } from "lucide-react";
import { usePlanStore } from "@/lib/store";
import { defaultPlanFormData, defaultFinanceiroData } from "@/types/plan";
import { FinanceiroShell } from "@/components/financeiro/FinanceiroShell";

/* eslint-disable @typescript-eslint/no-explicit-any */
function apiResponseToFormData(plan: any) {
  const toDateStr = (val: any): string => {
    if (!val) return "";
    const d = new Date(val);
    return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
  };

  return {
    partnerName: plan.partnerName ?? "",
    partnerLogo: plan.partnerLogo ?? "",
    foundationName: plan.foundationName ?? "",
    foundationLogo: plan.foundationLogo ?? "",
    projectName: plan.projectName ?? "",
    projectNickname: plan.projectNickname ?? "",
    coordinatorInstitution: plan.coordinatorInstitution ?? "",
    coordinatorFoxconn: plan.coordinatorFoxconn ?? "",
    totalValue: plan.totalValue != null ? Number(plan.totalValue) : null,
    totalValueWritten: plan.totalValueWritten ?? "",
    executionStartDate: toDateStr(plan.executionStartDate),
    executionEndDate: toDateStr(plan.executionEndDate),
    validityStartDate: toDateStr(plan.validityStartDate),
    validityEndDate: toDateStr(plan.validityEndDate),
    projectTypes: plan.projectTypes ?? [],
    activityTypes: plan.activityTypes ?? [],
    motivacao: plan.motivacao ?? null,
    objetivosGerais: plan.objetivosGerais ?? null,
    objetivosEspecificos: plan.objetivosEspecificos ?? null,
    useModulosApproach: plan.useModulosApproach ?? false,
    escopo: plan.escopo ?? null,
    estrategias: plan.estrategias ?? null,
    activities:
      plan.activities && plan.activities.length > 0
        ? plan.activities.map((a: any) => ({
            id: a.id,
            orderIndex: a.orderIndex,
            name: a.name ?? "",
            description: a.description ?? "",
            justification: a.justification ?? "",
            startDate: a.startDate ?? "",
            endDate: a.endDate ?? "",
            activeMonths: a.activeMonths ?? [],
            subActivities: (() => {
              const raw = a.subActivities ?? [];
              if (!Array.isArray(raw) || raw.length === 0) return [{ name: "", description: "" }];
              return raw.map((s: any) =>
                typeof s === "string"
                  ? { name: s, description: "" }
                  : { name: s?.name ?? "", description: s?.description ?? "" }
              );
            })(),
          }))
        : defaultPlanFormData.activities,
    professionals: (plan.professionals ?? []).map((p: any) => ({
      id: p.id,
      staffMemberId: p.staffMemberId ?? undefined,
      orderIndex: p.orderIndex,
      name: p.name ?? "",
      category: p.category ?? "",
      education: p.education ?? "",
      degree: p.degree ?? "",
      miniCv: p.miniCv ?? "",
      roleInProject: p.roleInProject ?? "",
      activityAssignment: p.activityAssignment ?? "",
      hiringType: p.hiringType ?? "",
      directIndirect: p.directIndirect ?? "",
    })),
    indicators: plan.indicators ?? {},
    inovadoras: plan.inovadoras ?? null,
    resultados: plan.resultados ?? null,
    trlMrlLevel: plan.trlMrlLevel ?? null,
    desafios: plan.desafios ?? null,
    solucao: plan.solucao ?? null,
    complementares: plan.complementares ?? null,
    cronogramaOverrides: plan.cronogramaOverrides ?? [],
    financeiro: plan.financeiro ?? { ...defaultFinanceiroData },
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export default function FinanceiroPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const loadPlan = usePlanStore((s) => s.loadPlan);
  const formData = usePlanStore((s) => s.formData);
  const isDirty = usePlanStore((s) => s.isDirty);
  const markSaved = usePlanStore((s) => s.markSaved);
  const storePlanId = usePlanStore((s) => s.planId);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  // Load plan on mount (only if not already loaded for this planId)
  useEffect(() => {
    if (storePlanId === planId) {
      setLoading(false);
      return;
    }

    const fetchPlan = async () => {
      try {
        const res = await fetch(`/api/plans/${planId}`);
        if (!res.ok) {
          router.push("/");
          return;
        }
        const plan = await res.json();
        const data = apiResponseToFormData(plan);
        loadPlan(planId, data as any, plan.completedSections ?? []);
      } catch {
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [planId, storePlanId, loadPlan, router]);

  // Auto-save on changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!isDirty || !storePlanId) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        await fetch(`/api/plans/${planId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ financeiro: formData.financeiro }),
        });
        markSaved();
        setLastSavedAt(new Date());
      } catch (err) {
        console.error("Auto-save error:", err);
      } finally {
        setSaving(false);
      }
    }, 1500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [formData.financeiro, isDirty, storePlanId, planId, markSaved]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch(`/api/export/${planId}/xlsx`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `financeiro-${formData.projectNickname || "plano"}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-surface-900">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Carregando financeiro...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-surface-900">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-850 px-6 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/plans/${planId}`)}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft size={16} />
            Voltar ao Plano
          </button>
          <div className="h-5 w-px bg-gray-300 dark:bg-gray-600" />
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={20} className="text-green-600 dark:text-green-400" />
            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Financeiro
            </h1>
            {formData.projectNickname && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                — {formData.projectNickname}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Save status */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Salvando...
              </>
            ) : lastSavedAt ? (
              <>
                <Check size={14} className="text-green-500" />
                Salvo às {lastSavedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </>
            ) : null}
          </div>

          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {exporting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            Exportar Excel
          </button>
        </div>
      </header>

      {/* Main content */}
      <FinanceiroShell />
    </div>
  );
}
