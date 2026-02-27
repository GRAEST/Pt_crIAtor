"use client";

import { useFinanceiro } from "./useFinanceiro";
import { RhTable } from "./RhTable";

export function FinRhIndiretoTab() {
  const { financeiro, update } = useFinanceiro();

  return (
    <RhTable
      items={financeiro.rhIndireto}
      onChange={(items) => update({ rhIndireto: items })}
      maxItems={6}
      title="III - Recursos Humanos Indireto"
      description="Profissionais com dedicação indireta. Máximo de 6 itens."
      directIndirect="Indireto"
    />
  );
}
