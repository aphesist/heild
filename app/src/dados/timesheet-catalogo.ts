// S06 · Atividades do catálogo usadas pelo Timesheet, com `horas_100` do atividades.json
// (horas por mês para 100 clientes; a duração padrão por cliente é horas_100 / 100, 05, 5.1).

export interface AtividadeTs {
  id: string
  rotulo: string
  setor: string
  horas_100: number
}

const a = (id: string, rotulo: string, setor: string, horas_100: number): AtividadeTs => ({ id, rotulo, setor, horas_100 })

export const catalogoTs: AtividadeTs[] = [
  a('FIS-004', 'Conferência', 'fiscal', 40),
  a('FIS-005', 'Caixa postal e-CAC', 'fiscal', 20),
  a('FIS-006', 'Situação fiscal', 'fiscal', 12),
  a('FIS-009', 'PGDAS-D', 'fiscal', 25),
  a('FIS-010', 'DAS', 'fiscal', 8),
  a('FIS-019', 'DCTFWeb', 'fiscal', 15),
  a('FIS-020', 'EFD-Reinf', 'fiscal', 15),
  a('FIS-021', 'DARF', 'fiscal', 6),
  a('FIS-023', 'SPED validado', 'fiscal', 15),
  a('FIS-024', 'Declarações estaduais', 'fiscal', 4),
  a('FIS-028', 'ISS próprio', 'fiscal', 10),
  a('FIS-038', 'Intimação', 'fiscal', 6),
  a('CTB-015', 'Conciliação', 'contabil', 80),
  a('CTB-017', 'Envio ao core', 'contabil', 10),
  a('CTB-028', 'Relatório ao cliente', 'contabil', 15),
  a('CTB-031', 'Balancete', 'contabil', 4),
  a('CTB-047', 'Balanço de abertura', 'contabil', 4),
  a('DP-001', 'Admissão', 'dp', 6),
  a('DP-004', 'Contrato de experiência', 'dp', 2),
  a('DP-011', 'Folha', 'dp', 20),
  a('DP-012', 'Resumo da folha', 'dp', 8),
  a('DP-014', 'Ponto e tabelas', 'dp', 4),
  a('DP-016', 'eSocial (fechamento)', 'dp', 10),
  a('DP-019', 'Holerites', 'dp', 5),
  a('DP-027', 'Rescisão', 'dp', 2),
  a('DP-043', 'eSocial (correção)', 'dp', 3),
  a('SOC-009', 'Certificado A1', 'societario', 4),
  a('SOC-017', 'Serviço extra', 'societario', 5),
  a('SOC-031', 'Exigência da Junta', 'societario', 3),
  a('NFE-008', 'NFS-e municipal', 'notas', 12),
  a('NFE-015', 'Manifestação', 'notas', 4),
  a('NFE-021', 'XML sem nota', 'notas', 6),
  a('NFE-503', 'Certificado da captura', 'notas', 3),
  a('GES-024', 'Triagem de conversa', 'gestao_atendimento', 10),
  a('GES-025', 'Atendimento', 'gestao_atendimento', 60),
  a('GES-026', 'Documento do cliente', 'gestao_atendimento', 25),
  a('GES-027', 'E-mails', 'gestao_atendimento', 25),
  a('GES-033', 'Ligação', 'gestao_atendimento', 6),
  a('GES-045', 'Reunião com cliente', 'gestao_atendimento', 6),
  a('FIN-003', 'Captura de contas', 'bpo_financeiro', 6),
  a('FIN-004', 'Conciliação', 'bpo_financeiro', 6),
  a('FIN-006', 'Relatório do mês', 'bpo_financeiro', 3),
  a('FIN-201', 'Conferência e lotes', 'bpo_financeiro', 40),
  a('BPO-009', 'ERP e credenciais', 'bpo_financeiro', 25),
  a('BPO-013', 'Fechamento', 'bpo_financeiro', 30),
]

/** Atividades internas (05, A3): entram na capacidade, não na rentabilidade. */
export const atividadesInternas = [
  { id: 'INT-REUNIAO', rotulo: 'Reunião interna' },
  { id: 'INT-TREINAMENTO', rotulo: 'Treinamento' },
  { id: 'INT-ADMIN', rotulo: 'Administrativo' },
]

const indice = new Map(catalogoTs.map((x) => [x.id, x]))
export const atividadeTs = (id?: string | null) => (id ? indice.get(id) : undefined)
export const rotuloAtividade = (id?: string | null) => (id ? (indice.get(id)?.rotulo ?? atividadesInternas.find((x) => x.id === id)?.rotulo ?? id) : 'sem atividade')
export const ehInterna = (id?: string | null) => !!id && id.startsWith('INT-')

/** Setor da atividade pelo prefixo do código. */
export function setorDaAtividade(id?: string | null): string {
  if (!id) return 'gestao_atendimento'
  const x = indice.get(id)
  if (x) return x.setor
  const p = id.split('-')[0]
  return ({ FIS: 'fiscal', CTB: 'contabil', DP: 'dp', SOC: 'societario', NFE: 'notas', GES: 'gestao_atendimento', FIN: 'bpo_financeiro', BPO: 'bpo_financeiro', INT: 'gestao_atendimento' } as Record<string, string>)[p] ?? 'gestao_atendimento'
}
export const pacoteDaAtividade = (id?: string | null) => (id && /^(FIN|BPO)-/.test(id) ? ('bpo' as const) : ('contabil' as const))
/** Duração padrão do catálogo em minutos por cliente-mês (horas_100 / 100). */
export const duracaoCatalogoMin = (id?: string | null) => Math.max(5, Math.round(((atividadeTs(id)?.horas_100 ?? 15) * 60) / 100))
