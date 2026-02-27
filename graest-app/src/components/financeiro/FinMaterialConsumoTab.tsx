"use client";

import { useFinanceiro } from "./useFinanceiro";
import { EquipTable } from "./EquipTable";

export function FinMaterialConsumoTab() {
  const { financeiro, update } = useFinanceiro();

  return (
    <EquipTable
      items={financeiro.materialConsumo}
      onChange={(items) => update({ materialConsumo: items })}
      maxItems={5}
      title="V - Material de Consumo"
      description="Materiais de consumo necessários. Máximo de 5 itens."
    />
  );
}
