const ExcelJS = require('exceljs');

async function createTemplate() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('public/Planilha-de-custo.xlsm');

  // Helper: set cell value only if it's NOT a formula
  function setTag(sheet, cellAddr, tag) {
    const cell = sheet.getCell(cellAddr);
    if (cell.formula || cell.sharedFormula) return; // never touch formulas
    cell.value = tag;
  }

  // ---- Tab "I - Equipamentos" (rows 4-17, 14 items) ----
  const wsEquip = wb.getWorksheet('I - Equipamentos');
  if (wsEquip) {
    for (let i = 0; i < 14; i++) {
      const row = i + 4;
      const n = i + 1;
      setTag(wsEquip, `A${row}`, `{equip_nome_${n}}`);
      setTag(wsEquip, `B${row}`, `{equip_atividade_${n}}`);
      setTag(wsEquip, `C${row}`, `{equip_descricao_${n}}`);
      setTag(wsEquip, `D${row}`, `{equip_justificativa_${n}}`);
      setTag(wsEquip, `E${row}`, `{equip_semaisum_${n}}`);
      setTag(wsEquip, `F${row}`, `{equip_tipo_${n}}`);
      setTag(wsEquip, `G${row}`, `{equip_qtde_${n}}`);
      setTag(wsEquip, `H${row}`, `{equip_custounit_${n}}`);
      // I{row} = FORMULA, skip
    }
  }

  // ---- Tab "II - Laboratórios" (rows 4-6, 3 items) ----
  const wsLab = wb.getWorksheet('II - Laboratórios');
  if (wsLab) {
    // Original has only row 4 for data and row 5 for TOTAL.
    // We need to insert 2 extra rows and move TOTAL to row 7.
    // First, copy formatting from row 4 to rows 5-6 by duplicating.
    wsLab.duplicateRow(4, 2, true); // insert 2 copies after row 4
    // Now: row 4 = item 1, row 5 = item 2, row 6 = item 3, row 7 = TOTAL
    // Update TOTAL SUM formula to cover rows 4-6
    const totalCell = wsLab.getCell('I7');
    totalCell.value = { formula: 'SUM(I4:I6)' };

    // Clear the "Modernização de laboratório" default text
    wsLab.getCell('A4').value = null;

    for (let i = 0; i < 3; i++) {
      const row = i + 4;
      const n = i + 1;
      setTag(wsLab, `A${row}`, `{lab_nome_${n}}`);
      setTag(wsLab, `B${row}`, `{lab_atividade_${n}}`);
      setTag(wsLab, `C${row}`, `{lab_descricao_${n}}`);
      setTag(wsLab, `D${row}`, `{lab_justificativa_${n}}`);
      setTag(wsLab, `E${row}`, `{lab_semaisum_${n}}`);
      setTag(wsLab, `F${row}`, `{lab_tipo_${n}}`);
      setTag(wsLab, `G${row}`, `{lab_qtde_${n}}`);
      setTag(wsLab, `H${row}`, `{lab_custounit_${n}}`);
    }
  }

  // ---- Tab "III - RH Direto" (rows 4-25, 22 items) ----
  const wsRhD = wb.getWorksheet('III - RH Direto');
  if (wsRhD) {
    for (let i = 0; i < 22; i++) {
      const row = i + 4;
      const n = i + 1;
      setTag(wsRhD, `B${row}`, `{rhd_nome_${n}}`);
      setTag(wsRhD, `C${row}`, `{rhd_salariobase_${n}}`);
      setTag(wsRhD, `D${row}`, `{rhd_encargos_${n}}`);
      // E = FORMULA (Total Custo/Mês)
      setTag(wsRhD, `F${row}`, `{rhd_custohora_${n}}`);
      setTag(wsRhD, `G${row}`, `{rhd_totalhoras_${n}}`);
      // H = FORMULA (Custo Total)
    }
  }

  // ---- Tab "III - RH Indireto" (rows 4-9, 6 items) ----
  const wsRhI = wb.getWorksheet('III - RH Indireto');
  if (wsRhI) {
    for (let i = 0; i < 6; i++) {
      const row = i + 4;
      const n = i + 1;
      setTag(wsRhI, `A${row}`, `{rhi_nome_${n}}`);
      setTag(wsRhI, `B${row}`, `{rhi_salariobase_${n}}`);
      setTag(wsRhI, `C${row}`, `{rhi_encargos_${n}}`);
      // D = FORMULA
      setTag(wsRhI, `E${row}`, `{rhi_custohora_${n}}`);
      setTag(wsRhI, `F${row}`, `{rhi_totalhoras_${n}}`);
      // G = FORMULA
    }
  }

  // ---- Tab "IV - Serviços de Terceiros" (rows 4-6, 3 items) ----
  const wsST = wb.getWorksheet('IV - Serviços de Terceiros');
  if (wsST) {
    for (let i = 0; i < 3; i++) {
      const row = i + 4;
      const n = i + 1;
      setTag(wsST, `A${row}`, `{st_nome_${n}}`);
      setTag(wsST, `B${row}`, `{st_atividade_${n}}`);
      setTag(wsST, `C${row}`, `{st_descricao_${n}}`);
      setTag(wsST, `D${row}`, `{st_justificativa_${n}}`);
      setTag(wsST, `E${row}`, `{st_semaisum_${n}}`);
      setTag(wsST, `F${row}`, `{st_tipo_${n}}`);
      setTag(wsST, `G${row}`, `{st_qtde_${n}}`);
      setTag(wsST, `H${row}`, `{st_custounit_${n}}`);
    }
  }

  // ---- Tab "V - Mat. Consumo" (rows 4-8, 5 items) ----
  const wsMC = wb.getWorksheet('V - Mat. Consumo');
  if (wsMC) {
    for (let i = 0; i < 5; i++) {
      const row = i + 4;
      const n = i + 1;
      setTag(wsMC, `A${row}`, `{mc_nome_${n}}`);
      setTag(wsMC, `B${row}`, `{mc_atividade_${n}}`);
      setTag(wsMC, `C${row}`, `{mc_descricao_${n}}`);
      setTag(wsMC, `D${row}`, `{mc_justificativa_${n}}`);
      setTag(wsMC, `E${row}`, `{mc_semaisum_${n}}`);
      setTag(wsMC, `F${row}`, `{mc_tipo_${n}}`);
      setTag(wsMC, `G${row}`, `{mc_qtde_${n}}`);
      setTag(wsMC, `H${row}`, `{mc_custounit_${n}}`);
    }
  }

  // ---- Tab "VI - Outros - Livros Periódicos" (rows 4-9, 6 items) ----
  const wsOL = wb.getWorksheet('VI - Outros - Livros Periódicos');
  if (wsOL) {
    for (let i = 0; i < 6; i++) {
      const row = i + 4;
      const n = i + 1;
      setTag(wsOL, `A${row}`, `{ol_descricao_${n}}`);
      setTag(wsOL, `B${row}`, `{ol_justificativa_${n}}`);
      setTag(wsOL, `C${row}`, `{ol_tipo_${n}}`);
      setTag(wsOL, `D${row}`, `{ol_qtde_${n}}`);
      setTag(wsOL, `E${row}`, `{ol_custounit_${n}}`);
    }
  }

  // ---- Tab "VI - Outros - Treinamentos" (rows 4-9, 6 items) ----
  const wsOT = wb.getWorksheet('VI - Outros - Treinamentos');
  if (wsOT) {
    for (let i = 0; i < 6; i++) {
      const row = i + 4;
      const n = i + 1;
      setTag(wsOT, `A${row}`, `{ot_descricao_${n}}`);
      setTag(wsOT, `B${row}`, `{ot_justificativa_${n}}`);
      setTag(wsOT, `C${row}`, `{ot_tipo_${n}}`);
      setTag(wsOT, `D${row}`, `{ot_qtde_${n}}`);
      setTag(wsOT, `E${row}`, `{ot_custounit_${n}}`);
    }
  }

  // ---- Tab "VI - Outros - Viagens" (rows 4-9, 6 items) ----
  const wsOV = wb.getWorksheet('VI - Outros - Viagens');
  if (wsOV) {
    for (let i = 0; i < 6; i++) {
      const row = i + 4;
      const n = i + 1;
      setTag(wsOV, `A${row}`, `{ov_descricao_${n}}`);
      setTag(wsOV, `B${row}`, `{ov_justificativa_${n}}`);
      setTag(wsOV, `C${row}`, `{ov_tipo_${n}}`);
      setTag(wsOV, `D${row}`, `{ov_qtde_${n}}`);
      setTag(wsOV, `E${row}`, `{ov_custounit_${n}}`);
    }
  }

  // ---- Tab "VI - Outros Dispêndios" (rows 4-8, 5 items) ----
  const wsOD = wb.getWorksheet('VI - Outros Dispêndios');
  if (wsOD) {
    for (let i = 0; i < 5; i++) {
      const row = i + 4;
      const n = i + 1;
      setTag(wsOD, `A${row}`, `{od_descricao_${n}}`);
      setTag(wsOD, `B${row}`, `{od_justificativa_${n}}`);
      setTag(wsOD, `C${row}`, `{od_tipo_${n}}`);
      setTag(wsOD, `D${row}`, `{od_qtde_${n}}`);
      setTag(wsOD, `E${row}`, `{od_custounit_${n}}`);
    }
  }

  // ---- Tab "14. Orçamento" (only configurable percentages) ----
  const wsOrc = wb.getWorksheet('14. Orçamento');
  if (wsOrc) {
    // D16 = ISS %, D19 = DOA %, D20 = Reserva %
    // These are NOT formulas - they are user-configurable values
    setTag(wsOrc, 'D16', '{config_iss_pct}');
    setTag(wsOrc, 'D19', '{config_doa_pct}');
    setTag(wsOrc, 'D20', '{config_reserva_pct}');

    // Fix Laboratórios reference: TOTAL row moved from 5 to 7 after inserting extra rows
    const labCell = wsOrc.getCell('C6');
    labCell.value = { formula: "'II - Laboratórios'!$I$7" };
  }

  // ---- Tab "15. Cronograma de Execução" (monthly distribution) ----
  const wsCron = wb.getWorksheet('15. Cronograma de Execução');
  if (wsCron) {
    // Columns E(5) through V(22) = months 1-18
    // Row 10=equip, 11=lab, 12=rhd, 13=rhi, 14=st, 15=mc
    // Row 18=livros, 19=trein, 20=viagens, 22=outros
    const categories = [
      { row: 10, prefix: 'cron_equip' },
      { row: 11, prefix: 'cron_lab' },
      { row: 12, prefix: 'cron_rhd' },
      { row: 13, prefix: 'cron_rhi' },
      { row: 14, prefix: 'cron_st' },
      { row: 15, prefix: 'cron_mc' },
      { row: 18, prefix: 'cron_livros' },
      { row: 19, prefix: 'cron_trein' },
      { row: 20, prefix: 'cron_viagens' },
      { row: 22, prefix: 'cron_outros' },
    ];

    for (const cat of categories) {
      for (let m = 1; m <= 18; m++) {
        const col = m + 4; // col 5 (E) = month 1, col 22 (V) = month 18
        const cell = wsCron.getCell(cat.row, col);
        if (!cell.formula && !cell.sharedFormula) {
          cell.value = `{${cat.prefix}_${m}}`;
        }
      }
    }
  }

  // Save as .xlsx (strips VBA macros, keeps formulas)
  await wb.xlsx.writeFile('public/Planilha-de-custo-template.xlsx');
  console.log('Template created: public/Planilha-de-custo-template.xlsx');

  // Verify: count tags
  let tagCount = 0;
  wb.eachSheet((sheet) => {
    sheet.eachRow((row) => {
      row.eachCell((cell) => {
        if (typeof cell.value === 'string' && cell.value.match(/^\{.+\}$/)) {
          tagCount++;
        }
      });
    });
  });
  console.log(`Total tags inserted: ${tagCount}`);
}

createTemplate().catch(console.error);
