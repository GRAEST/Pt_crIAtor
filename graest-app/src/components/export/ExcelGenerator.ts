import type { FinanceiroData, EquipamentoItem, RhFinanceiroItem, OutrosSubItem } from "@/types/plan";
import ExcelJS from "exceljs";
import path from "path";

/**
 * Build a flat tag→value map from FinanceiroData.
 * Tags match the placeholders inserted in the template by create-template.js.
 */
function buildTagMap(fin: FinanceiroData): Record<string, string | number> {
  const m: Record<string, string | number> = {};

  // Helper: populate equipment-style items
  function mapEquip(items: EquipamentoItem[], prefix: string, max: number) {
    for (let i = 0; i < max; i++) {
      const n = i + 1;
      const item = items[i];
      m[`${prefix}_nome_${n}`] = item?.nome ?? "";
      m[`${prefix}_atividade_${n}`] = item?.atividade ?? "";
      m[`${prefix}_descricao_${n}`] = item?.descricao ?? "";
      m[`${prefix}_justificativa_${n}`] = item?.justificativa ?? "";
      m[`${prefix}_semaisum_${n}`] = item?.seMaisDeUm ?? "";
      m[`${prefix}_tipo_${n}`] = item?.tipo ?? "";
      m[`${prefix}_qtde_${n}`] = item?.quantidade ?? "";
      m[`${prefix}_custounit_${n}`] = item?.custoUnitario ?? "";
    }
  }

  // Helper: populate RH items
  function mapRh(items: RhFinanceiroItem[], prefix: string, max: number) {
    for (let i = 0; i < max; i++) {
      const n = i + 1;
      const item = items[i];
      m[`${prefix}_nome_${n}`] = item?.profissionalNome ?? "";
      m[`${prefix}_salariobase_${n}`] = item?.salarioBase ?? "";
      m[`${prefix}_encargos_${n}`] = item?.encargosMes ?? "";
      m[`${prefix}_custohora_${n}`] = item?.custoHora ?? "";
      m[`${prefix}_totalhoras_${n}`] = item?.totalHsProjeto ?? "";
    }
  }

  // Helper: populate Outros sub-items
  function mapOutros(items: OutrosSubItem[], prefix: string, max: number) {
    for (let i = 0; i < max; i++) {
      const n = i + 1;
      const item = items[i];
      m[`${prefix}_descricao_${n}`] = item?.descricao ?? "";
      m[`${prefix}_justificativa_${n}`] = item?.justificativa ?? "";
      m[`${prefix}_tipo_${n}`] = item?.tipo ?? "";
      m[`${prefix}_qtde_${n}`] = item?.quantidade ?? "";
      m[`${prefix}_custounit_${n}`] = item?.custoUnitario ?? "";
    }
  }

  // I - Equipamentos (14 items)
  mapEquip(fin.equipamentos, "equip", 14);

  // II - Laboratórios (3 items, same structure)
  mapEquip(fin.laboratorios, "lab", 3);

  // III - RH Direto (22 items)
  mapRh(fin.rhDireto, "rhd", 22);

  // III - RH Indireto (6 items)
  mapRh(fin.rhIndireto, "rhi", 6);

  // IV - Serviços de Terceiros (3 items, same structure as equip)
  mapEquip(fin.servicosTerceiros, "st", 3);

  // V - Material Consumo (5 items, same structure as equip)
  mapEquip(fin.materialConsumo, "mc", 5);

  // VI - Outros
  mapOutros(fin.outros.livros, "ol", 6);
  mapOutros(fin.outros.treinamentos, "ot", 6);
  mapOutros(fin.outros.viagens, "ov", 6);
  mapOutros(fin.outros.outrosDispendios, "od", 5);

  // 14. Orçamento - config percentages (as decimals: 5% → 0.05)
  m["config_iss_pct"] = (fin.config.issPercent ?? 5) / 100;
  m["config_doa_pct"] = (fin.config.doaPercent ?? 15) / 100;
  m["config_reserva_pct"] = (fin.config.reservaPercent ?? 5) / 100;

  // 15. Cronograma de Execução (18 months × 10 categories)
  const cronMap: Record<string, string> = {
    cron_equip: "equipamentos",
    cron_lab: "laboratorios",
    cron_rhd: "rhDireto",
    cron_rhi: "rhIndireto",
    cron_st: "servicosTerceiros",
    cron_mc: "materialConsumo",
    cron_livros: "livros",
    cron_trein: "treinamentos",
    cron_viagens: "viagens",
    cron_outros: "outrosDispendios",
  };

  for (const [prefix, field] of Object.entries(cronMap)) {
    for (let month = 1; month <= 18; month++) {
      const entry = fin.cronogramaFinanceiro.find((c) => c.mes === month);
      m[`${prefix}_${month}`] = entry
        ? (entry as unknown as Record<string, number>)[field] ?? ""
        : "";
    }
  }

  return m;
}

/**
 * Insert formulas that the original .xlsm calculated via VBA macros.
 * These cells were empty in the original file and need explicit formulas.
 */
function insertMissingFormulas(wb: ExcelJS.Workbook, fin: FinanceiroData, projectMonths: number) {
  // Helper to set formula on a cell, replacing any existing shared formula
  function setFormula(ws: ExcelJS.Worksheet, addr: string, formula: string) {
    const cell = ws.getCell(addr);
    // Set formula with a cached result of 0 to avoid Excel repair warning
    cell.value = { formula, result: 0 } as ExcelJS.CellFormulaValue;
  }

  // I - Equipamentos: I = G * H (rows 4-17)
  const wsEquip = wb.getWorksheet("I - Equipamentos");
  if (wsEquip) {
    for (let r = 4; r <= 17; r++) {
      setFormula(wsEquip, `I${r}`, `G${r}*H${r}`);
    }
  }

  // II - Laboratórios: I = G * H (rows 4-6)
  const wsLab = wb.getWorksheet("II - Laboratórios");
  if (wsLab) {
    for (let r = 4; r <= 6; r++) {
      setFormula(wsLab, `I${r}`, `G${r}*H${r}`);
    }
  }

  // III - RH Direto: E = C + D, H = (salarioBase + encargos) * projectMonths (rows 4-25)
  // We compute H directly to avoid floating-point precision issues with custoHora * totalHsProjeto
  const wsRhD = wb.getWorksheet("III - RH Direto");
  if (wsRhD) {
    for (let r = 4; r <= 25; r++) {
      setFormula(wsRhD, `E${r}`, `C${r}+D${r}`);
      const idx = r - 4;
      const item = fin.rhDireto[idx];
      if (item && (item.salarioBase || item.encargosMes)) {
        const total = ((item.salarioBase || 0) + (item.encargosMes || 0)) * projectMonths;
        wsRhD.getCell(`H${r}`).value = total;
      } else {
        setFormula(wsRhD, `H${r}`, `F${r}*G${r}`);
      }
    }
  }

  // III - RH Indireto: D = B + C, G = (salarioBase + encargos) * projectMonths (rows 4-9)
  const wsRhI = wb.getWorksheet("III - RH Indireto");
  if (wsRhI) {
    for (let r = 4; r <= 9; r++) {
      setFormula(wsRhI, `D${r}`, `B${r}+C${r}`);
      const idx = r - 4;
      const item = fin.rhIndireto[idx];
      if (item && (item.salarioBase || item.encargosMes)) {
        const total = ((item.salarioBase || 0) + (item.encargosMes || 0)) * projectMonths;
        wsRhI.getCell(`G${r}`).value = total;
      } else {
        setFormula(wsRhI, `G${r}`, `E${r}*F${r}`);
      }
    }
  }

  // IV - Serviços de Terceiros: I = G * H (rows 4-6) — already has formulas, but ensure
  const wsST = wb.getWorksheet("IV - Serviços de Terceiros");
  if (wsST) {
    for (let r = 4; r <= 6; r++) {
      setFormula(wsST, `I${r}`, `G${r}*H${r}`);
    }
  }

  // V - Mat. Consumo: I = G * H (rows 4-8)
  const wsMC = wb.getWorksheet("V - Mat. Consumo");
  if (wsMC) {
    for (let r = 4; r <= 8; r++) {
      setFormula(wsMC, `I${r}`, `G${r}*H${r}`);
    }
  }

  // VI - Outros - Livros Periódicos: F = D * E (rows 4-9) — some already have formulas
  const wsOL = wb.getWorksheet("VI - Outros - Livros Periódicos");
  if (wsOL) {
    for (let r = 4; r <= 9; r++) {
      setFormula(wsOL, `F${r}`, `D${r}*E${r}`);
    }
  }

  // VI - Outros - Treinamentos: F = D * E (rows 4-9)
  const wsOT = wb.getWorksheet("VI - Outros - Treinamentos");
  if (wsOT) {
    for (let r = 4; r <= 9; r++) {
      setFormula(wsOT, `F${r}`, `D${r}*E${r}`);
    }
  }

  // VI - Outros - Viagens: F = D * E (rows 4-9)
  const wsOV = wb.getWorksheet("VI - Outros - Viagens");
  if (wsOV) {
    for (let r = 4; r <= 9; r++) {
      setFormula(wsOV, `F${r}`, `D${r}*E${r}`);
    }
  }

  // VI - Outros Dispêndios: F = D * E (rows 4-8)
  const wsOD = wb.getWorksheet("VI - Outros Dispêndios");
  if (wsOD) {
    for (let r = 4; r <= 8; r++) {
      setFormula(wsOD, `F${r}`, `D${r}*E${r}`);
    }
  }
}

/**
 * Enable wrap text on cells with long content and estimate row heights
 * so all text is visible without double-clicking to expand.
 */
function autoFitRows(wb: ExcelJS.Workbook) {
  wb.eachSheet((sheet) => {
    sheet.eachRow((row, rowNumber) => {
      // Skip header rows (1-3)
      if (rowNumber <= 3) return;

      let maxLines = 1;

      row.eachCell((cell, colNumber) => {
        if (typeof cell.value === "string" && cell.value.length > 0) {
          // Enable wrap text
          cell.alignment = { ...cell.alignment, wrapText: true, vertical: "top" };

          // Estimate number of lines based on column width and text length
          const col = sheet.getColumn(colNumber);
          const colWidth = (col.width || 15) * 7; // approx pixels
          const charWidth = 7; // approx pixels per char
          const charsPerLine = Math.max(Math.floor(colWidth / charWidth), 10);
          const lines = Math.ceil(cell.value.length / charsPerLine);
          if (lines > maxLines) maxLines = lines;
        }
      });

      // Set row height if text needs multiple lines (15pt per line)
      if (maxLines > 1) {
        const estimatedHeight = maxLines * 15;
        const currentHeight = row.height || 15;
        if (estimatedHeight > currentHeight) {
          row.height = estimatedHeight;
        }
      }
    });
  });
}

/**
 * Generate an Excel buffer by reading the template and replacing tags with data.
 */
export async function generateXlsx(fin: FinanceiroData, projectMonths: number = 0): Promise<Buffer> {
  const templatePath = path.join(
    process.cwd(),
    "public",
    "Planilha-de-custo-template.xlsx"
  );

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(templatePath);

  const tagMap = buildTagMap(fin);

  // First pass: convert shared formulas to individual formulas to avoid corruption
  wb.eachSheet((sheet) => {
    sheet.eachRow((row) => {
      row.eachCell((cell) => {
        const val = cell.value as any;
        if (val && typeof val === "object" && val.sharedFormula) {
          // This is a dependent shared formula cell — resolve it
          // The formula is derived from the master cell but with adjusted row/col refs.
          // ExcelJS already computes cell.formula for shared formula dependents.
          if (cell.formula) {
            cell.value = { formula: cell.formula, result: 0 } as ExcelJS.CellFormulaValue;
          } else {
            cell.value = null;
          }
        } else if (val && typeof val === "object" && val.shareType === "shared") {
          // This is a master shared formula cell — convert to regular formula
          cell.value = { formula: val.formula, result: 0 } as ExcelJS.CellFormulaValue;
        }
      });
    });
  });

  // Second pass: replace tags in all cells (skip formulas)
  wb.eachSheet((sheet) => {
    sheet.eachRow((row) => {
      row.eachCell((cell) => {
        // Never touch formulas
        if (cell.formula) return;

        if (typeof cell.value === "string") {
          const match = cell.value.match(/^\{(.+)\}$/);
          if (match) {
            const tag = match[1];
            const replacement = tagMap[tag];
            if (replacement !== undefined) {
              cell.value = replacement === "" ? null : replacement;
            } else {
              // Tag not found in map - clear it
              cell.value = null;
            }
          }
        }
      });
    });
  });

  // Insert formulas that were missing from the original .xlsm (VBA-dependent)
  insertMissingFormulas(wb, fin, projectMonths);

  // Auto-fit row heights: enable wrap text on text cells and estimate row height
  autoFitRows(wb);

  const buffer = await wb.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
