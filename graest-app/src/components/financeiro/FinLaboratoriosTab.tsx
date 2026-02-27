"use client";

import { useFinanceiro } from "./useFinanceiro";
import { EquipTable } from "./EquipTable";

export function FinLaboratoriosTab() {
  const { financeiro, update } = useFinanceiro();

  return (
    <EquipTable
      items={financeiro.laboratorios}
      onChange={(items) => update({ laboratorios: items })}
      maxItems={3}
      title="II - Laboratórios"
      description="Infraestrutura laboratorial. Máximo de 3 itens."
    />
  );
}
