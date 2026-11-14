// S02: obrigações com setor dono (C2) e o calendário de outubro/2026 já gerado.
import { hashCurto, planejarCalendario, type PerfilParaObrigacoes } from '@/dados/obrigacoes-setor'
import type { Fotografia, Obrigacao, Tabelas, Tarefa } from '../modelo/entidades'

type Sem<T> = Omit<T, 'escritorio_id' | 'criado_em' | 'atualizado_em'>
type Add = <K extends keyof Tabelas>(tabela: K, linha: Omit<Tabelas[K], 'escritorio_id' | 'criado_em' | 'atualizado_em'> & { criado_em?: string }) => Tabelas[K]

/**
 * Regras de obrigação que completam as de `obrigacoesPadrao` (Fundações 4.7),
 * com o setor dono em `gera_tarefa_para_setor` (03, ad. 14/11). Atividades do
 * `atividades.json`; as eventuais (D-23) e as dos itens do 2º escritório
 * (C2-15, C2-16, C2-20, C2-22) marcadas na aplicabilidade.
 */
export function obrigacoesS02(): Sem<Obrigacao>[] {
  const o = (id: string, atividade_id: string, nome: string, dia: number, setor: Obrigacao['gera_tarefa_para_setor'], aplicabilidade: Record<string, unknown>, periodicidade: Obrigacao['periodicidade'] = 'mensal', mes_relativo = 1): Sem<Obrigacao> => ({
    id,
    escopo: 'plataforma',
    atividade_id,
    nome,
    periodicidade,
    regra_prazo: { dia, mes_relativo, antecipa_se_nao_util: true },
    aplicabilidade,
    gera_tarefa_para_setor: setor,
    vigente_de: '2026-01-01',
  })
  return [
    o('ob-reinf', 'FIS-020', 'EFD-Reinf', 15, 'fiscal', { regime: ['presumido', 'real'] }),
    o('ob-gia-sp', 'FIS-024', 'GIA-SP', 18, 'fiscal', { regime: ['presumido', 'real'], uf: ['SP'] }),
    o('ob-destda', 'FIS-024', 'DeSTDA', 28, 'fiscal', { regime: ['simples'] }),
    o('ob-pis-cofins', 'FIS-021', 'PIS/COFINS (DARF)', 25, 'fiscal', { regime: ['presumido', 'real'], eventual: true, so_com_imposto: true }),
    o('ob-iss', 'FIS-028', 'ISS próprio (guia)', 20, 'fiscal', { regime: ['presumido', 'real'], eventual: true, so_com_imposto: true }),
    o('ob-das-mei', 'FIS-016', 'DAS-MEI', 20, 'fiscal', { regime: ['mei'] }),
    o('ob-defis', 'FIS-013', 'DEFIS', 31, 'fiscal', { regime: ['simples'] }, 'anual', 5),
    o('ob-dmed', 'C2-16', 'DMED', 28, 'fiscal', { saude: true }, 'anual', 4),
    o('ob-s1299', 'DP-016', 'eSocial S-1299 (fechamento)', 15, 'dp', { tem_folha: true }),
    o('ob-gfd', 'DP-018', 'GFD (FGTS Digital)', 20, 'dp', { tem_folha: true }),
    o('ob-ecf', 'CTB-042', 'ECF', 31, 'contabil', { regime: ['presumido', 'real'] }, 'anual', 9),
    o('ob-ibge', 'C2-15', 'Pesquisa do IBGE (PAC/PAS)', 30, 'contabil', { chamada_ibge: true }, 'por_evento'),
    o('ob-taxa-licenca', 'C2-22', 'Taxa anual de licença municipal', 30, 'societario', { taxa_licenca: true }),
    o('ob-conselho', 'C2-20', 'Renovação no conselho de classe', 31, 'societario', { conselho: true }, 'anual', 0),
    o('ob-manifestacao', 'NFE-015', 'Manifestação conclusiva das NF-e', 30, 'notas', { servicos: ['contabil'] }),
    o('ob-entrega-guias', 'GES-039', 'Entrega das guias e documentos do mês', 10, 'gestao_atendimento', { servicos: ['contabil'] }),
  ]
}

/** Perfil para as obrigações dos clientes do Andrade (o resto vem da versão do perfil). */
export const perfisAndrade: Record<string, Omit<PerfilParaObrigacoes, 'clienteId' | 'regime' | 'servicos'>> = {
  c1: { uf: 'SP', temFolha: true, mesTaxaLicenca: 11 },
  c2: { uf: 'SP', temFolha: true },
  c3: { uf: 'SP', temFolha: true, mesTaxaLicenca: 12 },
  c4: { uf: 'SP', temFolha: true, saude: true, conselho: 'CRO-SP', mesTaxaLicenca: 11 },
  c5: { uf: 'SP', temFolha: true },
  c6: { uf: 'SP', temFolha: false },
  c7: { uf: 'SP', temFolha: true },
}

/** Perfis de todos os clientes do Painel, a partir da fotografia (versão do perfil + mapa acima). */
export function perfisDaFoto(foto: Pick<Fotografia, 'cliente' | 'versao_perfil'>, extras: Record<string, Partial<PerfilParaObrigacoes>> = perfisAndrade): PerfilParaObrigacoes[] {
  return foto.cliente
    .filter((c) => c.servicos_contratados.includes('contabil') && !['prospect', 'proposta', 'encerrado', 'arquivado', 'eliminado', 'inativo'].includes(c.estado_ciclo))
    .map((c) => {
      const vp = foto.versao_perfil.filter((v) => v.cliente_id === c.id && !v.vigente_ate).at(-1)
      return { clienteId: c.id, regime: vp?.regime ?? c.regime, uf: vp?.uf ?? 'SP', servicos: vp?.servicos_contratados ?? c.servicos_contratados, temFolha: c.tipo !== 'pf', ...extras[c.id] }
    })
}

/** Como cada ocorrência de outubro está em 18/11 (o resto segue a data: vencida = entregue com recibo). */
const situacao: Record<string, Partial<Pick<Tarefa, 'status' | 'risco'>> & { recibo?: string; falta?: string; multa?: number; dispensada?: boolean; motivo?: string }> = {
  'c1:ob-dctfweb': { status: 'concluida', recibo: 'b7e1c04' },
  'c1:ob-reinf': { status: 'concluida', recibo: '91fa2d3' },
  'c1:ob-gia-sp': { status: 'em_andamento', risco: true, falta: '3 compras sem XML' },
  'c1:ob-s1299': { status: 'a_fazer', multa: 380 },
  'c1:ob-efd-contrib': { status: 'em_andamento', multa: 500 },
  'c1:ob-taxa-licenca': { status: 'a_fazer', falta: 'guia da prefeitura de Sorocaba' },
  'c2:ob-s1299': { status: 'concluida', recibo: '3c0a9e1' },
  'c3:ob-gfd': { status: 'aguardando_cliente', risco: true, falta: 'ponto de outubro' },
  'c4:ob-s1299': { status: 'a_fazer', multa: 200 },
  'c4:ob-efd-contrib': { status: 'em_andamento', risco: true, falta: 'certificado A1 (vence em 3 dias)' },
  'c4:ob-pis-cofins': { status: 'cancelada', dispensada: true, motivo: 'Sem PIS/COFINS a recolher em 10/2026 (sem arquivo não é falta, D-23).' },
  'c5:ob-gia-sp': { status: 'concluida', recibo: '5d17b20' },
  'c7:ob-gfd': { status: 'concluida', recibo: 'e2f9a41' },
}

/** Responsável padrão: o integrante do setor (que faz ou prepara) ou a pessoa do setor. */
const responsavel: Partial<Record<string, { tipo: 'integrante' | 'usuario'; id: string; nome: string }>> = {
  fiscal: { tipo: 'integrante', id: 'i-fiscal', nome: 'Fiscal' },
  dp: { tipo: 'integrante', id: 'i-dp', nome: 'DP' },
  contabil: { tipo: 'integrante', id: 'i-contabil', nome: 'Contábil' },
  notas: { tipo: 'integrante', id: 'i-notas', nome: 'Notas' },
  societario: { tipo: 'integrante', id: 'i-societario', nome: 'Societário' },
  gestao_atendimento: { tipo: 'integrante', id: 'i-atendimento', nome: 'Atendimento' },
}

/** Tarefas antigas que já eram ocorrências de obrigação: ganham a origem (registrado em DECISOES, S02). */
const jaEram: Record<string, { regra: string; legal: string }> = {
  t0: { regra: 'ob-pgdas', legal: '2026-11-20' },
  t1: { regra: 'ob-pgdas', legal: '2026-11-20' },
}

/** Acrescenta as regras, liga as tarefas antigas e gera o calendário de 10/2026 do Andrade. */
export function sementeS02(foto: Fotografia, add: Add) {
  obrigacoesS02().forEach((o) => add('obrigacao', o))
  for (const t of foto.tarefa) {
    const j = jaEram[t.id]
    if (!j) continue
    Object.assign(t, { origem: 'obrigacao', origem_ref: j.regra, competencia: '10/2026', prazo_legal: j.legal })
  }
  const plano = planejarCalendario('10/2026', perfisDaFoto(foto), foto.obrigacao, foto.tarefa)
  plano.forEach((p, i) => {
    const s = situacao[`${p.clienteId}:${p.regra.id}`] ?? {}
    const vencida = p.legal < '2026-11-18'
    const status: Tarefa['status'] = s.status ?? (vencida ? 'concluida' : 'a_fazer')
    const r = responsavel[p.regra.gera_tarefa_para_setor]
    const recibo = s.recibo ?? (status === 'concluida' && !s.dispensada ? hashCurto(`${p.clienteId}${p.regra.id}`) : undefined)
    add('tarefa', {
      id: `ob-${p.clienteId}-${p.regra.id.replace(/^ob-/, '')}-1026`,
      cliente_id: p.clienteId,
      setor_id: p.regra.gera_tarefa_para_setor,
      atividade_id: p.regra.atividade_id,
      titulo: `${p.regra.nome} ${p.competencia}`,
      competencia: p.competencia,
      origem: 'obrigacao',
      origem_ref: p.regra.id,
      responsavel_tipo: r?.tipo ?? null,
      responsavel_id: r?.id ?? null,
      quem_conclui: 'agente_prepara_pessoa_conclui',
      status,
      status_desde: '2026-11-18T08:00:00.000Z',
      prazo_legal: p.legal,
      prazo_interno: p.interno,
      prioridade: s.risco ? 'alta' : 'normal',
      checklist: [],
      risco: !!s.risco,
      ordem: 1000 + i,
      ...(status === 'concluida' ? { concluida_por_tipo: 'integrante' as const, concluida_por_id: r?.id ?? null, concluida_em: `${p.interno}T15:00:00.000Z` } : {}),
      ...(s.motivo ? { cancelada_motivo: s.motivo } : {}),
      extras: {
        obrigacao_nome: p.regra.nome,
        responsavel_nome: r?.nome,
        responsavel_setor: r?.tipo === 'integrante' ? p.regra.gera_tarefa_para_setor : undefined,
        responsavel_tipo_tela: r?.tipo === 'integrante' ? 'integrante' : 'pessoa',
        ...(recibo ? { recibo } : {}),
        ...(p.eventual ? { eventual: true } : {}),
        ...(s.falta ? { falta: s.falta } : {}),
        ...(s.multa ? { multa: s.multa } : {}),
        ...(s.dispensada ? { dispensada: true } : {}),
        ...(p.legal < '2026-11-18' && status !== 'concluida' && status !== 'cancelada' ? { atrasada: true } : {}),
      },
    } satisfies Omit<Tarefa, 'escritorio_id' | 'criado_em' | 'atualizado_em'>)
  })
}
