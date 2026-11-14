import type { ConversaInterna, Id, MensagemInterna, Obrigacao, Participacao, Usuario, VinculoSetor } from '../modelo/entidades'

type Sem<T> = Omit<T, 'escritorio_id' | 'criado_em' | 'atualizado_em'>

/** Obrigações de plataforma que todo escritório recebe (Fundações 4.7; o catálogo completo vem de pesquisa/atividades.json). */
export function obrigacoesPadrao(): Sem<Obrigacao>[] {
  const o = (id: string, atividade_id: string, nome: string, dia: number, setor: Obrigacao['gera_tarefa_para_setor'], aplicabilidade: Record<string, unknown>, periodicidade: Obrigacao['periodicidade'] = 'mensal'): Sem<Obrigacao> => ({
    id,
    escopo: 'plataforma',
    atividade_id,
    nome,
    periodicidade,
    regra_prazo: { dia, mes_relativo: 1, antecipa_se_nao_util: true },
    aplicabilidade,
    gera_tarefa_para_setor: setor,
    vigente_de: '2026-01-01',
  })
  return [
    o('ob-pgdas', 'FIS-009', 'PGDAS-D', 20, 'fiscal', { regime: ['simples'] }),
    o('ob-dctfweb', 'FIS-019', 'DCTFWeb', 15, 'fiscal', { tem_folha: true }),
    o('ob-efd-contrib', 'FIS-021', 'EFD-Contribuições', 15, 'fiscal', { regime: ['presumido', 'real'] }),
    o('ob-esocial', 'DP-012', 'eSocial (folha)', 15, 'dp', { tem_folha: true }),
    o('ob-fgts', 'DP-015', 'FGTS Digital', 20, 'dp', { tem_folha: true }),
    o('ob-balancete', 'CTB-010', 'Balancete mensal', 25, 'contabil', { servicos: ['contabil'] }),
    o('ob-ecd', 'CTB-030', 'ECD (SPED Contábil)', 31, 'contabil', { regime: ['presumido', 'real'] }, 'anual'),
    o('ob-dirpf', 'PF-001', 'DIRPF', 31, 'contabil', { regime: ['pf'] }, 'anual'),
  ]
}

/**
 * Comunicação interna (subplano 11): o canal geral, um canal por setor ativo
 * (com quem tem o setor) e as primeiras mensagens.
 */
export function canaisInternos(
  setores: { id: Id; nome: string }[],
  usuarios: Usuario[],
  vinculos: VinculoSetor[],
  add: (t: 'conversa_interna' | 'participacao' | 'mensagem_interna', l: Sem<ConversaInterna> | Sem<Participacao> | Sem<MensagemInterna>) => unknown,
  mensagens: { canal: Id; autor: Id; corpo: string }[],
) {
  const ativos = usuarios.filter((u) => u.situacao === 'ativo')
  add('conversa_interna', { id: 'ci-geral', tipo: 'canal_geral', nome: 'Geral' } satisfies Sem<ConversaInterna>)
  for (const u of ativos) add('participacao', { id: `pa-geral-${u.id}`, conversa_interna_id: 'ci-geral', usuario_id: u.id, entrou_em: '2026-01-01T12:00:00.000Z' } satisfies Sem<Participacao>)
  for (const s of setores) {
    const id = `ci-${s.id}`
    add('conversa_interna', { id, tipo: 'canal_setor', nome: s.nome, setor_id: s.id } satisfies Sem<ConversaInterna>)
    for (const u of ativos.filter((u) => u.papel === 'administrador' || vinculos.some((v) => v.usuario_id === u.id && v.setor_id === s.id)))
      add('participacao', { id: `pa-${s.id}-${u.id}`, conversa_interna_id: id, usuario_id: u.id, entrou_em: '2026-01-01T12:00:00.000Z' } satisfies Sem<Participacao>)
  }
  mensagens.forEach((m, i) => add('mensagem_interna', { id: `mn-semente-${i}`, conversa_interna_id: m.canal, autor_id: m.autor, corpo: m.corpo, versoes: [] } satisfies Sem<MensagemInterna>))
}
