// S06 · Timesheet: regras das sessões de trabalho e da confirmação assistida (05; Fundações 5.4).
import { diaDe, duracaoMin, hm, minHora } from '@/dados/timesheet-tempo'
import { banco } from '../banco'
import type { ConfiancaSessao, ContestacaoSessao, Escritorio, Id, ItemConfirmacao, SessaoTrabalho } from '../modelo/entidades'
import { ErroRegra } from '../permissoes/autorizar'
import { idDoAtor, nomeDoAtor, type Contexto } from '../permissoes/perfil'
import { contextoAtual } from './contexto'
import { agora, novoId, registrarEvento, Repositorio, type OpcoesEscrita } from './repositorio'

/** Configuração do módulo (05, ad. 16), guardada em `escritorio.configuracao.timesheet`. */
export interface ConfigTimesheet {
  itens_dia: number
  fechamento: string
  jornada_inicio: string
  jornada_fim: string
  /** Intervalo de almoço: não vira "sem classificação". */
  intervalo_inicio: string
  intervalo_fim: string
  equipe_apos_semanas: number
  extensao: boolean
  artefatos: boolean
  benchmark: boolean
  /** Valor-hora de cobrança (Jurídico; distinto do custo-hora; Gestor vê). */
  valor_hora_cobranca: number
  /** Meta de cobertura automática (05, 11.1). */
  meta_cobertura: number
}

export const configPadraoTimesheet: ConfigTimesheet = { itens_dia: 8, fechamento: '18:00', jornada_inicio: '08:00', jornada_fim: '18:00', intervalo_inicio: '12:00', intervalo_fim: '13:00', equipe_apos_semanas: 2, extensao: true, artefatos: true, benchmark: false, valor_hora_cobranca: 450, meta_cobertura: 80 }

export function configTimesheet(e?: Escritorio | null): ConfigTimesheet {
  return { ...configPadraoTimesheet, ...((e?.configuracao?.timesheet as Partial<ConfigTimesheet> | undefined) ?? {}) }
}

/** Fora da jornada (GES-053): marca, nunca alerta por ocorrência. */
export function foraDaJornada(inicio: string, fim: string, cfg: ConfigTimesheet) {
  const ini = minHora(hm(inicio))
  const f = minHora(hm(fim))
  return ini < minHora(cfg.jornada_inicio) || f > minHora(cfg.jornada_fim) || ini > f
}

const usuarioDoCtx = (ctx: Contexto) => (ctx.ator.tipo === 'pessoa' ? ctx.ator.perfil.usuario_id : null)

function exigirDono(dono: Id | null | undefined, ctx: Contexto, oque: string) {
  if (ctx.ator.tipo === 'sistema') return
  const u = usuarioDoCtx(ctx)
  if (!u || u !== dono) throw new ErroRegra(`Só a própria pessoa pode ${oque}. O Gestor decide contestações; não mexe no tempo de outra pessoa.`)
}

const rotMotivo: Record<ContestacaoSessao['motivo'], string> = { cliente: 'cliente errado', atividade: 'atividade errada', tempo: 'tempo errado', nao_era_trabalho: 'não era trabalho' }
export const rotuloMotivoContestacao = (m: ContestacaoSessao['motivo']) => rotMotivo[m]

export type Parte = { cliente_id?: Id | null; atividade_id?: string | null; rotulo: string; inicio: string; fim: string; setor_id?: Id; tarefa_id?: Id | null }

export class RepositorioSessoes extends Repositorio<'sessao_trabalho'> {
  /** Captura: abre a sessão da tarefa ou da tela aberta (só depois de 60 s com ação; H2). */
  abrirAoVivo(dados: Omit<SessaoTrabalho, 'id' | 'escritorio_id' | 'criado_em' | 'atualizado_em' | 'ao_vivo'>, op: OpcoesEscrita = {}): SessaoTrabalho {
    return this.criar({ ...dados, ao_vivo: true }, { ...op, ferramenta: 'timesheet.registrar', texto: op.texto ?? `Tempo contando: ${dados.atividade_id ? `${dados.atividade_id} ` : ''}${dados.rotulo}` })
  }

  /** O fim avança enquanto há ação (sem evento: é o relógio, não uma decisão). */
  estender(id: Id, fim: string) {
    const s = this.obter(id)
    if (!s || !s.ao_vivo || Date.parse(fim) <= Date.parse(s.fim)) return
    banco.transacao((tx) => tx.gravar('sessao_trabalho', { ...s, fim, atualizado_em: agora() }))
  }

  /** Encerra a sessão ao vivo no último evento (troca de tarefa, espera, conclusão). */
  fecharAoVivo(id: Id, fim: string, motivo: string, cfg: ConfigTimesheet) {
    const s = this.obter(id)
    if (!s || !s.ao_vivo) return
    const f = Date.parse(fim) > Date.parse(s.inicio) ? fim : s.fim
    this.atualizar(id, { fim: f, ao_vivo: false, fora_da_jornada: foraDaJornada(s.inicio, f, cfg) }, { ferramenta: 'timesheet.registrar', texto: `Sessão encerrada (${motivo}): ${s.atividade_id ?? ''} ${s.rotulo}, ${hm(s.inicio)}–${hm(f)}` })
  }

  /** Confirmar o estimado em um clique (05, 5.2): sessão nova confirmada; a original fica com `substituida_por` (H7). */
  confirmar(id: Id, op: OpcoesEscrita = {}): SessaoTrabalho {
    const s = this.exigir(id)
    const ctx = op.ctx ?? contextoAtual()
    exigirDono(s.usuario_dono_id, ctx, 'confirmar o próprio tempo')
    if (s.substituida_por) throw new ErroRegra('Esta sessão já foi substituída.')
    return this.substituir(s, [{ cliente_id: s.cliente_id, atividade_id: s.atividade_id, rotulo: s.rotulo, inicio: s.inicio, fim: s.fim, setor_id: s.setor_id, tarefa_id: s.tarefa_id }], 'confirmou', ctx, 'timesheet.confirmar')[0]
  }

  /** Corrigir ou dividir (05, 5.2): partes novas confirmadas substituem a original. */
  corrigir(id: Id, partes: Parte[], op: OpcoesEscrita = {}): SessaoTrabalho[] {
    const s = this.exigir(id)
    const ctx = op.ctx ?? contextoAtual()
    exigirDono(s.usuario_dono_id, ctx, 'corrigir o próprio tempo')
    if (!partes.length) throw new ErroRegra('Informe ao menos uma parte.')
    for (const p of partes) if (Date.parse(p.fim) <= Date.parse(p.inicio)) throw new ErroRegra('O fim precisa ser depois do início.')
    return this.substituir(s, partes, partes.length > 1 ? 'dividiu' : 'corrigiu', ctx, 'timesheet.confirmar')
  }

  /** Sessões novas a partir de partes; a original fica substituída pela primeira. */
  substituir(s: SessaoTrabalho, partes: Parte[], verbo: string, ctx: Contexto, ferramenta: string): SessaoTrabalho[] {
    const quando = agora()
    const novas: SessaoTrabalho[] = partes.map((p) => ({
      id: novoId('ss'),
      escritorio_id: banco.escritorioId ?? '',
      criado_em: quando,
      atualizado_em: quando,
      ator_tipo: 'pessoa',
      ator_id: s.ator_id,
      usuario_dono_id: s.usuario_dono_id,
      cliente_id: p.cliente_id ?? null,
      setor_id: p.setor_id ?? s.setor_id,
      atividade_id: p.atividade_id ?? null,
      rotulo: p.rotulo,
      tarefa_id: p.tarefa_id ?? (p.cliente_id === s.cliente_id ? s.tarefa_id : null),
      conversa_id: s.conversa_id ?? null,
      origem: 'confirmacao',
      inicio: p.inicio,
      fim: p.fim,
      confianca: 'confirmada',
      evidencias: [...s.evidencias, `${verbo} por ${nomeDoAtor(ctx.ator)} em ${diaDe(quando)} (substitui a sessão ${hm(s.inicio)}–${hm(s.fim)})`],
      pacote: s.pacote,
      fora_da_jornada: s.fora_da_jornada,
    }))
    this.autorizar(ferramenta, s, {})
    banco.transacao((tx) => {
      novas.forEach((n) => tx.gravar('sessao_trabalho', n))
      tx.gravar('sessao_trabalho', { ...s, substituida_por: novas[0]?.id ?? 'descartada', ao_vivo: false, atualizado_em: quando })
      registrarEvento(tx, ctx, { nome: `sessao_trabalho.${verbo === 'confirmou' ? 'confirmar' : 'corrigir'}`, ferramenta, resultado_ref: s.id, cliente_id: s.cliente_id ?? null, setor_id: s.setor_id, texto: `${nomeDoAtor(ctx.ator)} ${verbo} a sessão ${hm(s.inicio)}–${hm(s.fim)} · ${s.rotulo}` })
    })
    return novas
  }

  /** Descarta (não era trabalho): a original fica com `substituida_por = descartada` e sai da contagem. */
  descartar(id: Id, op: OpcoesEscrita & { motivo?: string } = {}) {
    const s = this.exigir(id)
    const ctx = op.ctx ?? contextoAtual()
    return this.atualizar(id, { substituida_por: 'descartada', ao_vivo: false }, { ...op, ctx, ferramenta: op.ferramenta ?? 'timesheet.confirmar', texto: `${nomeDoAtor(ctx.ator)} descartou a sessão ${hm(s.inicio)}–${hm(s.fim)} · ${s.rotulo}${op.motivo ? ` (${op.motivo})` : ''}` })
  }

  /** Contestar (Membro; 05, 8.2): motivo em lista, nota opcional; o Gestor decide. */
  contestar(id: Id, c: Pick<ContestacaoSessao, 'motivo' | 'correcao' | 'correcao_dados' | 'nota'>, op: OpcoesEscrita = {}): SessaoTrabalho {
    const s = this.exigir(id)
    const ctx = op.ctx ?? contextoAtual()
    exigirDono(s.usuario_dono_id, ctx, 'contestar o próprio tempo')
    if (s.ator_tipo !== 'pessoa') throw new ErroRegra('Sessão de integrante não se contesta: revise o cartão do integrante.')
    if (s.contestacao?.status === 'pendente') throw new ErroRegra('Esta sessão já está contestada e aguarda o Gestor.')
    if (s.substituida_por) throw new ErroRegra('Esta sessão já foi substituída.')
    const contestacao: ContestacaoSessao = { ...c, por: idDoAtor(ctx.ator) ?? '', em: agora(), status: 'pendente', confianca_antes: s.confianca }
    return this.atualizar(id, { contestacao, confianca: 'contestada' }, { ...op, ctx, ferramenta: 'timesheet.contestar', texto: `${nomeDoAtor(ctx.ator)} contestou a sessão ${hm(s.inicio)}–${hm(s.fim)} · ${s.rotulo}: ${rotMotivo[c.motivo]}` })
  }

  /** Gestor decide (05, 8.3): aceitar vira confirmada com a correção; recusar volta ao que era, com motivo. */
  decidirContestacao(id: Id, aceita: boolean, motivoRecusa = '', op: OpcoesEscrita = {}): SessaoTrabalho {
    const s = this.exigir(id)
    const ctx = op.ctx ?? contextoAtual()
    const c = s.contestacao
    if (!c || c.status !== 'pendente') throw new ErroRegra('Esta contestação já foi decidida.')
    if (usuarioDoCtx(ctx) === s.usuario_dono_id) throw new ErroRegra('Quem contestou não decide a própria contestação: outro Gestor ou o Administrador decide.')
    if (!aceita && !motivoRecusa.trim()) throw new ErroRegra('Recusar exige o motivo.')
    this.autorizar('timesheet.decidir_contestacao', s, op)
    const decisao: ContestacaoSessao = { ...c, status: aceita ? 'aceita' : 'recusada', decidido_por: idDoAtor(ctx.ator), decidido_por_nome: nomeDoAtor(ctx.ator), decidido_em: agora(), motivo_recusa: aceita ? undefined : motivoRecusa }
    if (!aceita) return this.atualizar(id, { contestacao: decisao, confianca: c.confianca_antes }, { ...op, ctx, ferramenta: 'timesheet.decidir_contestacao', texto: `${nomeDoAtor(ctx.ator)} recusou a contestação de ${s.rotulo} (${hm(s.inicio)}–${hm(s.fim)}): ${motivoRecusa}` })
    const d = c.correcao_dados ?? {}
    const atual = this.atualizar(id, { contestacao: decisao }, { ...op, ctx, ferramenta: 'timesheet.decidir_contestacao', texto: `${nomeDoAtor(ctx.ator)} aceitou a contestação de ${s.rotulo} (${hm(s.inicio)}–${hm(s.fim)}): ${rotMotivo[c.motivo]}` })
    if (c.motivo === 'nao_era_trabalho') {
      banco.transacao((tx) => tx.gravar('sessao_trabalho', { ...atual, substituida_por: 'descartada', atualizado_em: agora() }))
      return this.obter(id)!
    }
    const parte: Parte = { cliente_id: d.cliente_id !== undefined ? d.cliente_id : s.cliente_id, atividade_id: d.atividade_id !== undefined ? d.atividade_id : s.atividade_id, rotulo: d.rotulo ?? s.rotulo, inicio: d.inicio ?? s.inicio, fim: d.fim ?? s.fim, setor_id: s.setor_id }
    this.substituir(atual, [parte], 'corrigiu (contestação aceita)', { ...ctx, ator: ctx.ator }, 'timesheet.decidir_contestacao')
    return this.obter(id)!
  }

  /** Revisar sessão anômala (05, 11.3): corrigir (abre a correção na tela), descartar ou manter. */
  revisarAnomalia(id: Id, revisao: 'descartada' | 'mantida' | 'corrigida', op: OpcoesEscrita = {}) {
    const s = this.exigir(id)
    if (!s.anomalia) throw new ErroRegra('Esta sessão não tem anomalia.')
    const ctx = op.ctx ?? contextoAtual()
    const anomalia = { ...s.anomalia, revisada_em: agora(), revisao }
    return this.atualizar(id, { anomalia, ...(revisao === 'descartada' ? { substituida_por: 'descartada' } : {}) }, { ...op, ctx, ferramenta: 'timesheet.revisar_anomalia', texto: `${nomeDoAtor(ctx.ator)} revisou a sessão anômala de ${s.rotulo} (${hm(s.inicio)}–${hm(s.fim)}): ${revisao}` })
  }
  /**
   * Reconstruir período (`timesheet.reconstruir`; Fundações 5.4 e 05, 11.4): relê o período e
   * refaz o que é derivado: fecha sessões ao vivo esquecidas, remarca fora da jornada, detecta
   * anomalias (longa, sobreposta) e expira itens vencidos. Confirmadas não mudam. Determinístico.
   */
  reconstruir(de: string, ate: string, cfg: ConfigTimesheet, hoje: string, op: OpcoesEscrita = {}) {
    const ctx = op.ctx ?? contextoAtual()
    this.autorizar('timesheet.reconstruir', {}, op)
    const doPeriodo = this.listar((s) => !s.substituida_por && diaDe(s.inicio) >= de && diaDe(s.inicio) <= ate)
    const quando = agora()
    const mudou: SessaoTrabalho[] = []
    let anomalias = 0
    let fechadas = 0
    for (const s of doPeriodo) {
      let n = { ...s }
      if (n.ao_vivo && Date.now() - Date.parse(n.atualizado_em) > 10 * 60000) {
        n = { ...n, ao_vivo: false }
        fechadas++
      }
      if (n.ator_tipo === 'pessoa') {
        const fora = foraDaJornada(n.inicio, n.fim, cfg)
        if (!!n.fora_da_jornada !== fora) n = { ...n, fora_da_jornada: fora }
        if (!n.anomalia && duracaoMin(n) > 6 * 60) {
          n = { ...n, anomalia: { tipo: 'sessao_longa', texto: `${Math.round(duracaoMin(n) / 60)}h seguidas na mesma sessão` } }
          anomalias++
        }
        if (!n.anomalia) {
          const outra = doPeriodo.find((o) => o.id !== n.id && o.ator_tipo === 'pessoa' && o.usuario_dono_id === n.usuario_dono_id && o.cliente_id !== n.cliente_id && Date.parse(o.inicio) < Date.parse(n.fim) && Date.parse(o.fim) > Date.parse(n.inicio) && duracaoMin(o) < duracaoMin(n))
          if (outra) {
            n = { ...n, anomalia: { tipo: 'sobreposta', texto: `Sobreposta a ${outra.rotulo} (${hm(outra.inicio)}–${hm(outra.fim)}), de outro cliente` } }
            anomalias++
          }
        }
      }
      if (JSON.stringify(n) !== JSON.stringify(s)) mudou.push({ ...n, atualizado_em: quando })
    }
    const vencidos = banco.ler('item_confirmacao').filter((i) => (i.situacao === 'pendente' || i.situacao === 'marcado') && i.dia >= de && i.dia <= ate && i.expira_em.slice(0, 10) < hoje)
    banco.transacao((tx) => {
      mudou.forEach((m) => tx.gravar('sessao_trabalho', m))
      vencidos.forEach((i) => tx.gravar('item_confirmacao', { ...i, situacao: 'expirado', atualizado_em: quando }))
      registrarEvento(tx, ctx, { nome: 'timesheet.reconstruir', ferramenta: 'timesheet.reconstruir', texto: `${nomeDoAtor(ctx.ator)} reconstruiu o Timesheet de ${de} a ${ate}: ${doPeriodo.length} sessões relidas, ${mudou.length} ajustadas` })
    })
    return { relidas: doPeriodo.length, ajustadas: mudou.length, anomalias, fechadas, expirados: vencidos.length }
  }
}

export class RepositorioItensConfirmacao extends Repositorio<'item_confirmacao'> {
  /** Marcar para o lote é clique de tela: sem evento. */
  marcar(id: Id, marcado: boolean) {
    const i = this.obter(id)
    if (!i || (i.situacao !== 'pendente' && i.situacao !== 'marcado')) return
    exigirDono(i.usuario_id, contextoAtual(), 'marcar os próprios itens')
    banco.transacao((tx) => tx.gravar('item_confirmacao', { ...i, situacao: marcado ? 'marcado' : 'pendente', atualizado_em: agora() }))
  }

  /** Confirma com a sugestão, com a alternativa ou com as partes corrigidas; cria as sessões confirmadas. */
  confirmar(id: Id, escolha: 'sugestao' | 'alternativa' | Parte[], op: OpcoesEscrita & { lote?: boolean } = {}): ItemConfirmacao {
    const i = this.exigir(id)
    const ctx = op.ctx ?? contextoAtual()
    exigirDono(i.usuario_id, ctx, 'confirmar o próprio tempo')
    if (i.situacao !== 'pendente' && i.situacao !== 'marcado') throw new ErroRegra('Este item já foi resolvido.')
    const ref = i.sessao_ref_id ? banco.obter('sessao_trabalho', i.sessao_ref_id) : undefined
    const fim = i.fim ?? new Date(Date.parse(i.inicio) + (i.sugestao?.minutos ?? 15) * 60000).toISOString()
    const base = { inicio: ref?.inicio ?? i.inicio, fim: ref?.fim ?? fim, setor_id: i.setor_id ?? ref?.setor_id ?? 'gestao_atendimento', tarefa_id: i.sugestao?.tarefa_id ?? null }
    const partes: Parte[] =
      escolha === 'sugestao'
        ? [{ ...base, cliente_id: i.sugestao?.cliente_id ?? null, atividade_id: i.sugestao?.atividade_id ?? null, rotulo: i.sugestao?.rotulo ?? 'confirmado' }]
        : escolha === 'alternativa'
          ? [{ ...base, cliente_id: i.alternativa_cliente_id ?? null, atividade_id: i.sugestao?.atividade_id ?? null, rotulo: i.sugestao?.rotulo ?? 'confirmado', tarefa_id: null }]
          : escolha.map((p) => ({ setor_id: base.setor_id, ...p }))
    if (!partes.every((p) => p.cliente_id || p.atividade_id)) throw new ErroRegra('Escolha o cliente ou a atividade (ou "interno").')
    const repoS = sessoesDoBanco()
    let sessaoId: Id | null = null
    if (ref && !ref.substituida_por) {
      sessaoId = repoS.substituir(ref, partes, 'confirmou', ctx, 'timesheet.confirmar')[0]?.id ?? null
    } else {
      const quando = agora()
      const novas: SessaoTrabalho[] = partes.map((p) => ({
        id: novoId('ss'),
        escritorio_id: banco.escritorioId ?? '',
        criado_em: quando,
        atualizado_em: quando,
        ator_tipo: 'pessoa',
        ator_id: i.usuario_id ?? '',
        usuario_dono_id: i.usuario_id ?? '',
        cliente_id: p.cliente_id ?? null,
        setor_id: p.setor_id ?? base.setor_id,
        atividade_id: p.atividade_id ?? null,
        rotulo: p.rotulo,
        tarefa_id: p.tarefa_id ?? null,
        origem: 'confirmacao',
        inicio: p.inicio,
        fim: p.fim,
        confianca: 'confirmada',
        evidencias: [`item de confirmação: ${i.texto}`, `pista: ${i.pista}`],
        pacote: /^(FIN|BPO)-/.test(p.atividade_id ?? '') ? 'bpo' : 'contabil',
      }))
      banco.transacao((tx) => novas.forEach((n) => tx.gravar('sessao_trabalho', n)))
      sessaoId = novas[0]?.id ?? null
    }
    const resultado = partes.map((p) => `${p.atividade_id ? `${p.atividade_id} ` : ''}${p.rotulo}`).join(' · ')
    return this.atualizar(id, { situacao: 'confirmado', resultado, sessao_id: sessaoId }, { ...op, ctx, ferramenta: op.lote ? 'timesheet.confirmar_lote' : 'timesheet.confirmar', texto: `${nomeDoAtor(ctx.ator)} confirmou ${hm(i.inicio)}${i.fim ? `–${hm(i.fim)}` : ''}: ${resultado}` })
  }

  /** "Confirmar tudo marcado" (`timesheet.confirmar_lote`). */
  confirmarLote(ids: Id[], op: OpcoesEscrita = {}) {
    const feitos: ItemConfirmacao[] = []
    for (const id of ids) {
      const i = this.obter(id)
      if (i && (i.sugestao?.cliente_id || i.sugestao?.atividade_id)) feitos.push(this.confirmar(id, 'sugestao', { ...op, lote: true }))
    }
    return feitos
  }

  /** "Não era trabalho": sai da contagem, sem explicação. */
  descartar(id: Id, op: OpcoesEscrita = {}) {
    const i = this.exigir(id)
    const ctx = op.ctx ?? contextoAtual()
    exigirDono(i.usuario_id, ctx, 'descartar o próprio tempo')
    if (i.sessao_ref_id) {
      const ref = banco.obter('sessao_trabalho', i.sessao_ref_id)
      if (ref && !ref.substituida_por) banco.transacao((tx) => tx.gravar('sessao_trabalho', { ...ref, substituida_por: 'descartada', atualizado_em: agora() }))
    }
    return this.atualizar(id, { situacao: 'descartado', resultado: 'não era trabalho' }, { ...op, ctx, ferramenta: 'timesheet.confirmar', texto: `${nomeDoAtor(ctx.ator)} marcou ${hm(i.inicio)} como "não era trabalho"` })
  }

  /** Arquivo sem pessoa: o Gestor atribui e a pessoa recebe "foi você?" (05, 5.1, regra 5). */
  atribuir(id: Id, usuarioId: Id, nome: string, op: OpcoesEscrita = {}) {
    const i = this.exigir(id)
    const ctx = op.ctx ?? contextoAtual()
    if (i.usuario_id) throw new ErroRegra('Este arquivo já tem pessoa.')
    return this.atualizar(id, { usuario_id: usuarioId, atribuido_a: usuarioId, situacao: 'pendente', texto: `Foi você? ${i.texto}`, pista: `atribuído por ${nomeDoAtor(ctx.ator)}` }, { ...op, ctx, ferramenta: 'timesheet.atribuir_artefato', texto: `${nomeDoAtor(ctx.ator)} atribuiu "${i.texto}" a ${nome}` })
  }
}

let fabricaSessoes: () => RepositorioSessoes = () => {
  throw new Error('repositório de sessões não registrado')
}
export const registrarRepoSessoes = (f: () => RepositorioSessoes) => (fabricaSessoes = f)
const sessoesDoBanco = () => fabricaSessoes()

/** Item novo de "não era esta" (03, ad. 22; S04-A52): a tarefa aberta por engano vira correção. */
export function itemNaoEraEsta(s: SessaoTrabalho): Omit<ItemConfirmacao, 'id' | 'escritorio_id' | 'criado_em' | 'atualizado_em'> {
  return {
    usuario_id: s.usuario_dono_id,
    setor_id: s.setor_id,
    dia: diaDe(s.inicio),
    inicio: s.inicio,
    fim: s.fim,
    tipo: 'nao_era_esta',
    texto: `"Não era esta": ${s.atividade_id ?? ''} ${s.rotulo} aberta por engano`,
    pista: `${duracaoMin(s)} min na tarefa errada`,
    sugestao: null,
    sessao_ref_id: s.id,
    situacao: 'pendente',
    expira_em: new Date(Date.parse(s.inicio) + 7 * 86400000).toISOString(),
  }
}

export type { ConfiancaSessao }
