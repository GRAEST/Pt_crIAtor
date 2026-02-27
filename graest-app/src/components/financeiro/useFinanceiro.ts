import { useCallback } from "react";
import { usePlanStore } from "@/lib/store";
import type { FinanceiroData } from "@/types/plan";
import { defaultFinanceiroData } from "@/types/plan";

/**
 * Hook to read and update financeiro data from the plan store.
 */
export function useFinanceiro() {
  const financeiro = usePlanStore((s) => s.formData.financeiro) ?? { ...defaultFinanceiroData };
  const updateField = usePlanStore((s) => s.updateField);

  const update = useCallback(
    (partial: Partial<FinanceiroData>) => {
      updateField("financeiro", { ...financeiro, ...partial });
    },
    [financeiro, updateField]
  );

  return { financeiro, update };
}
