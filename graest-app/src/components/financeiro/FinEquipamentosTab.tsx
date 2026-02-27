"use client";

import { useFinanceiro } from "./useFinanceiro";
import { EquipTable } from "./EquipTable";

export function FinEquipamentosTab() {
  const { financeiro, update } = useFinanceiro();

  return (
    <EquipTable
      items={financeiro.equipamentos}
      onChange={(items) => update({ equipamentos: items })}
      maxItems={14}
      title="I - Equipamentos"
      description="Equipamentos necessários para o projeto. Máximo de 14 itens."
    />
  );
}
