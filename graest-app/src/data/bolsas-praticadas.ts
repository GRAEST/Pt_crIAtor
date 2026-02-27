export interface BolsaEntry {
  id: string;
  grupo: "Professores" | "Servidores Públicos" | "Alunos";
  perfil: string;
  descricao: string;
  valorHora: number;
}

export const BOLSAS_PRATICADAS: BolsaEntry[] = [
  // ── Bolsas Professores ──
  { id: "prof-graduado-unc", grupo: "Professores", perfil: "Professor Graduado - Nível: UNC", descricao: "1 - Professor Graduado - Nível: UNC", valorHora: 91.02 },
  { id: "prof-esp-aux-a", grupo: "Professores", perfil: "PROF.ESPECIAL AUX.A 40HS-PE.111.20", descricao: "2 - Especialização Auxiliar - Nível: A", valorHora: 113.47 },
  { id: "prof-esp-aux-b", grupo: "Professores", perfil: "PROF.ESPECIAL AUX.B 40HS-PE.111.20", descricao: "3 - Especialização Auxiliar - Nível: B", valorHora: 116.88 },
  { id: "prof-esp-aux-c", grupo: "Professores", perfil: "PROF.ESPECIAL AUX.C 40HS-PE.111.20", descricao: "4 - Especialização Auxiliar - Nível: C", valorHora: 120.39 },
  { id: "prof-esp-aux-d", grupo: "Professores", perfil: "PROF.ESPECIAL AUX.D 40HS-PE.111.20", descricao: "5 - Especialização Auxiliar - Nível: D", valorHora: 124.00 },
  { id: "prof-mestre-assist-a", grupo: "Professores", perfil: "PROF.MESTRE ASSIST.A 40HS-PM.111.20", descricao: "6 - Mestrado Assistente - Nível: A", valorHora: 144.65 },
  { id: "prof-mestre-assist-b", grupo: "Professores", perfil: "PROF.MESTRE ASSIST.B 40HS-PM.111.20", descricao: "7 - Mestrado Assistente - Nível: B", valorHora: 148.99 },
  { id: "prof-mestre-assist-c", grupo: "Professores", perfil: "PROF.MESTRE ASSIST.C 40HS-PM.111.20", descricao: "8 - Mestrado Assistente - Nível: C", valorHora: 153.46 },
  { id: "prof-mestre-assist-d", grupo: "Professores", perfil: "PROF.MESTRE ASSIST.D 40HS-PM.111.20", descricao: "9 - Mestrado Assistente - Nível: D", valorHora: 158.07 },
  { id: "prof-doutor-adj-a", grupo: "Professores", perfil: "PROF.DOUTOR ADJ.A 40HS-PD.111.20", descricao: "10 - Doutorado Adjunto - Nível: A", valorHora: 187.51 },
  { id: "prof-doutor-adj-b", grupo: "Professores", perfil: "PROF.DOUTOR ADJ.B 40HS-PD.111.20", descricao: "11 - Doutorado Adjunto - Nível: B", valorHora: 193.13 },
  { id: "prof-doutor-adj-c", grupo: "Professores", perfil: "PROF.DOUTOR ADJ.C 40HS-PD.111.20", descricao: "12 - Doutorado Adjunto - Nível: C", valorHora: 198.93 },
  { id: "prof-doutor-adj-d", grupo: "Professores", perfil: "PROF.DOUTOR ADJ.D 40HS-PD.111.20", descricao: "13 - Doutorado Adjunto - Nível: D", valorHora: 204.90 },
  { id: "prof-doutor-assoc-a", grupo: "Professores", perfil: "PROF.DOUTOR ASSOC.A 40HS-PA.111.20", descricao: "14 - Doutorado Associado - Nível: A", valorHora: 263.66 },
  { id: "prof-doutor-assoc-b", grupo: "Professores", perfil: "Doutorado Associado - Nível: B", descricao: "15 - Doutorado Associado - Nível: B", valorHora: 282.82 },
  { id: "prof-doutor-assoc-c", grupo: "Professores", perfil: "Doutorado Associado - Nível: C", descricao: "16 - Doutorado Associado - Nível: C", valorHora: 301.98 },
  { id: "prof-doutor-titular-unc", grupo: "Professores", perfil: "Doutorado Titular - Nível: UNC", descricao: "17 - Doutorado Titular - Nível: UNC", valorHora: 307.18 },

  // ── Bolsas Servidores Públicos ──
  { id: "serv-agente-admin-nb", grupo: "Servidores Públicos", perfil: "AGENTE ADMINISTRATIVO A - N.B.", descricao: "Assistente Técnico - Nível I", valorHora: 34.89 },
  { id: "serv-aux-admin-3a", grupo: "Servidores Públicos", perfil: "AUX.ADMINISTRATIVO 3A.CL-AA.303.0", descricao: "AUX ADMINISTRATIVO", valorHora: 40.00 },
  { id: "serv-aux-admin-4a", grupo: "Servidores Públicos", perfil: "AUX.ADMINISTRATIVO 4A.CL-AA.304.0", descricao: "Analista Técnico - Nível I", valorHora: 46.28 },
  { id: "serv-assessor-tec-niv1", grupo: "Servidores Públicos", perfil: "ASSESSOR TECNICO NIV.I UEA.5", descricao: "Assistente Técnico - Nível II", valorHora: 45.45 },
  { id: "serv-assessor-tec-niv2", grupo: "Servidores Públicos", perfil: "ASSESSOR TECNICO NIV.II UEA.7", descricao: "Auxiliar/Apoio Técnico - Nível II", valorHora: 34.09 },
  { id: "serv-assessor-tec-niv3", grupo: "Servidores Públicos", perfil: "ASSESSOR TECNICO NIV.III UEA.9", descricao: "Auxiliar/Apoio Técnico - Nível I", valorHora: 22.73 },
  { id: "serv-assessor-tec-niv4", grupo: "Servidores Públicos", perfil: "ASSESSOR TECNICO NIV.IV UEA.11", descricao: "Assessor Tecnico", valorHora: 17.05 },
  { id: "serv-prof-especialista", grupo: "Servidores Públicos", perfil: "PROFESSOR ESPECIALISTA - TEMPORÁRIO", descricao: "Professor Pesquisador Especialista", valorHora: 125.00 },
  { id: "serv-prof-mestre", grupo: "Servidores Públicos", perfil: "PROFESSOR MESTRE - TEMPORÁRIO", descricao: "Professor Pesquisador Mestre", valorHora: 147.73 },
  { id: "serv-prof-doutor", grupo: "Servidores Públicos", perfil: "PROFESSOR DOUTOR - TEMPORÁRIO", descricao: "Professor Pesquisador Doutor", valorHora: 170.45 },

  // ── Bolsas Alunos ──
  { id: "aluno-doutorado", grupo: "Alunos", perfil: "Aluno Doutorado", descricao: "Aluno Doutorando", valorHora: 160.00 },
  { id: "aluno-mestrado-2", grupo: "Alunos", perfil: "Aluno Mestrado - Segundo Mestrado", descricao: "Aluno Mestrando", valorHora: 150.00 },
  { id: "aluno-mestrado-1", grupo: "Alunos", perfil: "Aluno Mestrado - Primeiro Mestrado", descricao: "Aluno Mestrando", valorHora: 140.00 },
  { id: "aluno-esp-3", grupo: "Alunos", perfil: "Aluno Especialização - Terceira Especialização", descricao: "Aluno Especialista", valorHora: 130.00 },
  { id: "aluno-esp-2", grupo: "Alunos", perfil: "Aluno Especialização - Segunda Especialização", descricao: "Aluno Especialista", valorHora: 120.00 },
  { id: "aluno-esp-1", grupo: "Alunos", perfil: "Aluno Especialização - Primeira Especialização", descricao: "Aluno Especialista", valorHora: 110.00 },
  { id: "aluno-grad-e-5ano", grupo: "Alunos", perfil: "Aluno Graduando - Nível: E - 5º Ano", descricao: "Aluno Graduando - Nível: E - 5º Ano", valorHora: 80.00 },
  { id: "aluno-grad-d-4ano", grupo: "Alunos", perfil: "Aluno Graduando - Nível: D - 4º Ano", descricao: "Aluno Graduando - Nível: D - 4º Ano", valorHora: 70.00 },
  { id: "aluno-grad-c-3ano", grupo: "Alunos", perfil: "Aluno Graduando - Nível: C - 3º Ano", descricao: "Aluno Graduando - Nível: C - 3º Ano", valorHora: 60.00 },
  { id: "aluno-grad-b-2ano", grupo: "Alunos", perfil: "Aluno Graduando - Nível: B - 2º Ano", descricao: "Aluno Graduando - Nível: B - 2º Ano", valorHora: 50.00 },
  { id: "aluno-grad-a-1ano", grupo: "Alunos", perfil: "Aluno Graduando - Nível: A - 1º Ano", descricao: "Aluno Graduando - Nível: A - 1º Ano", valorHora: 40.00 },
];

export function getBolsasByGroup(): Map<string, BolsaEntry[]> {
  const groups = new Map<string, BolsaEntry[]>();
  for (const b of BOLSAS_PRATICADAS) {
    if (!groups.has(b.grupo)) groups.set(b.grupo, []);
    groups.get(b.grupo)!.push(b);
  }
  return groups;
}

export function getBolsaById(id: string): BolsaEntry | undefined {
  return BOLSAS_PRATICADAS.find((b) => b.id === id);
}
