"use client";

import { useFinanceiro } from "./useFinanceiro";
import { EquipTable } from "./EquipTable";

export function FinServicosTerceirosTab() {
  const { financeiro, update } = useFinanceiro();

  return (
    <EquipTable
      items={financeiro.servicosTerceiros}
      onChange={(items) => update({ servicosTerceiros: items })}
      maxItems={3}
      title="IV - Serviços de Terceiros"
      description="Serviços contratados de terceiros. Máximo de 3 itens."
    />
  );
}
