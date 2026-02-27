"use client";

import { useFinanceiro } from "./useFinanceiro";
import { RhTable } from "./RhTable";

export function FinRhDiretoTab() {
  const { financeiro, update } = useFinanceiro();

  return (
    <RhTable
      items={financeiro.rhDireto}
      onChange={(items) => update({ rhDireto: items })}
      maxItems={22}
      title="III - Recursos Humanos Direto"
      description="Profissionais com dedicação direta ao projeto. Máximo de 22 itens."
      directIndirect="Direto"
    />
  );
}
