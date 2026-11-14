// S06 · Captura de tempo pela tarefa aberta (05, H1 a H3; Fundações 5.4, regras 1 a 3).
// A Plataforma monta <CapturaTempo /> uma vez; ela observa o endereço (tarefa aberta, conversa
// do CRM, Painel com cliente) e o modo de espera, e grava as sessões ao vivo no banco.
import { useEffect, useRef } from 'react'
import { useSessao } from '@/ambiente/sessao'
import { rotuloAtividade, setorDaAtividade } from '@/dados/timesheet-catalogo'
import { agoraDemo, diaDe, HOJE_TS, hm } from '@/dados/timesheet-tempo'
import { banco } from '@/nucleo/banco'
import { useEscritorio, useRegistro } from '@/nucleo/react'
import { configTimesheet, foraDaJornada, itemNaoEraEsta, repos } from '@/nucleo/repositorios'
import { hashParaDestino, useHash } from '@/nucleo/rotas'
import { OuvinteExtensaoLab } from './lab'

/** Evento do painel da demonstração: abre a sessão em 5 s em vez de 60 s (para mostrar ao vivo). */
export const EVENTO_CAPTURA_RAPIDA = 'heild:ts-captura-rapida'
let limiteSeg = 60
if (typeof window !== 'undefined') window.addEventListener(EVENTO_CAPTURA_RAPIDA, (e) => (limiteSeg = (e as CustomEvent<boolean>).detail ? 5 : 60))
export const capturaRapidaLigada = () => limiteSeg < 60

const setorDaAba: Record<string, string> = { societario: 'societario', obrigacoes: 'fiscal', notas: 'notas', fiscal: 'fiscal', dp: 'dp', contabil: 'contabil', consultoria: 'consultor', gestao: 'gestao_atendimento' }
const nomeAba: Record<string, string> = { societario: 'Societário', obrigacoes: 'Obrigações', notas: 'Notas', fiscal: 'Fiscal', dp: 'DP', contabil: 'Contábil', consultoria: 'Consultoria', gestao: 'Gestão' }

interface Contexto {
  chave: string
  cliente_id: string | null
  setor_id: string
  atividade_id: string | null
  rotulo: string
  tarefa_id: string | null
  conversa_id: string | null
  evidencia: string
}

interface Pendente {
  ctx: Contexto
  inicio: number
  ultima: number
  linhaId: string | null
}

export function CapturaTempo({ conta, espera, modulo, aba, clienteId }: { conta: boolean; espera: { desde: number } | null; modulo: string; aba: string; clienteId: string | null }) {
  const hash = useHash()
  const { usuario } = useSessao()
  const escritorio = useEscritorio()
  const cfg = configTimesheet(escritorio)
  const atual = useRef<Pendente | null>(null)
  const emEspera = useRef<number | null>(null)

  const destino = hashParaDestino(hash)
  const tarefaId = destino?.tarefa ?? null
  const conversaId = modulo === 'crm' ? (destino?.conversa ?? null) : null

  // O que está aberto agora (a tarefa vence; sem tarefa, só nas telas que registram tempo).
  let ctx: Contexto | null = null
  const t = tarefaId ? banco.obter('tarefa', tarefaId) : undefined
  if (t && !['concluida', 'cancelada'].includes(t.status)) ctx = { chave: `t:${t.id}`, cliente_id: t.cliente_id ?? null, setor_id: t.setor_id, atividade_id: t.atividade_id, rotulo: rotuloAtividade(t.atividade_id) === t.atividade_id ? t.titulo : rotuloAtividade(t.atividade_id), tarefa_id: t.id, conversa_id: null, evidencia: `tarefa ${t.atividade_id} aberta` }
  else if (conta && conversaId) {
    const c = banco.obter('conversa', conversaId)
    if (c) ctx = { chave: `cv:${c.id}`, cliente_id: c.cliente_id ?? null, setor_id: c.setor_id ?? 'gestao_atendimento', atividade_id: 'GES-025', rotulo: 'Atendimento', tarefa_id: null, conversa_id: c.id, evidencia: `conversa assumida no CRM` }
  } else if (conta && modulo === 'painel' && clienteId) ctx = { chave: `c:${clienteId}:${aba}`, cliente_id: clienteId, setor_id: setorDaAba[aba] ?? 'gestao_atendimento', atividade_id: null, rotulo: `Painel › ${nomeAba[aba] ?? aba} (sem tarefa)`, tarefa_id: null, conversa_id: null, evidencia: `Painel › ${nomeAba[aba] ?? aba} com o cliente aberto` }
  const chave = ctx && !espera ? `${usuario.id}|${ctx.chave}` : null
  const ctxRef = useRef(ctx)
  ctxRef.current = ctx

  // Fecha a sessão aberta no último evento.
  const fechar = (motivo: string, fimMs?: number) => {
    const p = atual.current
    atual.current = null
    if (!p?.linhaId) return
    try {
      repos.sessoes.fecharAoVivo(p.linhaId, agoraDemo(fimMs ?? p.ultima), motivo, cfg)
    } catch {
      /* sem permissão (ex.: módulo fora da assinatura): nada a fechar */
    }
  }

  // Troca de contexto: fecha a anterior e começa a contar a nova (a sessão só nasce depois de 60 s com ação; H2).
  useEffect(() => {
    if (atual.current && atual.current.ctx.chave === ctxRef.current?.chave && chave) return
    fechar(chave ? 'troca de tarefa' : espera ? 'modo de espera' : 'saiu da tela')
    if (chave && ctxRef.current) atual.current = { ctx: ctxRef.current, inicio: Date.now(), ultima: Date.now(), linhaId: null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave])

  // Espera: a sessão termina no último evento; ao voltar, um intervalo de 10 min ou mais vira item de confirmação (05, 3.7).
  useEffect(() => {
    if (espera) {
      emEspera.current = espera.desde
      fechar('modo de espera', espera.desde)
      return
    }
    const desde = emEspera.current
    emEspera.current = null
    const c = ctxRef.current
    if (desde && c && Date.now() - desde >= 10 * 60000) {
      try {
        repos.itensConfirmacao.criar({ usuario_id: usuario.id, setor_id: c.setor_id, dia: HOJE_TS, inicio: agoraDemo(desde), fim: agoraDemo(), tipo: 'espera', texto: `${Math.round((Date.now() - desde) / 60000)} min em espera`, pista: `antes e depois: ${c.atividade_id ?? ''} ${c.rotulo}`, sugestao: { atividade_id: c.atividade_id, rotulo: c.rotulo, cliente_id: c.cliente_id, minutos: Math.round((Date.now() - desde) / 60000), tarefa_id: c.tarefa_id }, situacao: 'marcado', expira_em: new Date(Date.now() + 7 * 86400000).toISOString() })
      } catch {
        /* sem permissão: ignora */
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [espera?.desde])

  // Ações (clique, tecla, rolagem, digitação) estendem; o relógio cria e estende a sessão.
  useEffect(() => {
    const acao = () => {
      if (atual.current && !emEspera.current) atual.current.ultima = Date.now()
    }
    const eventos = ['pointerdown', 'keydown', 'wheel', 'input'] as const
    eventos.forEach((e) => window.addEventListener(e, acao, { passive: true }))
    const relogio = window.setInterval(() => {
      const p = atual.current
      if (!p || emEspera.current) return
      try {
        if (!p.linhaId && (p.ultima - p.inicio) / 1000 >= limiteSeg - 1 && (Date.now() - p.inicio) / 1000 >= limiteSeg) {
          const ini = agoraDemo(p.inicio)
          const fim = agoraDemo(p.ultima)
          const s = repos.sessoes.abrirAoVivo({
            ator_tipo: 'pessoa',
            ator_id: usuario.id,
            usuario_dono_id: usuario.id,
            cliente_id: p.ctx.cliente_id,
            setor_id: p.ctx.setor_id || setorDaAtividade(p.ctx.atividade_id),
            atividade_id: p.ctx.atividade_id,
            rotulo: p.ctx.rotulo,
            tarefa_id: p.ctx.tarefa_id,
            conversa_id: p.ctx.conversa_id,
            origem: 'plataforma',
            inicio: ini,
            fim,
            confianca: 'automatica',
            evidencias: [`${p.ctx.evidencia} às ${hm(ini)}`],
            pacote: /^(FIN|BPO)-/.test(p.ctx.atividade_id ?? '') ? 'bpo' : 'contabil',
            fora_da_jornada: foraDaJornada(ini, fim, cfg),
          })
          p.linhaId = s.id
        } else if (p.linhaId) repos.sessoes.estender(p.linhaId, agoraDemo(p.ultima))
      } catch {
        atual.current = null
      }
    }, 3000)
    return () => {
      eventos.forEach((e) => window.removeEventListener(e, acao))
      window.clearInterval(relogio)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario.id])

  // S04 (contrato em DECISOES.md): o "Não era esta" da ficha da tarefa grava em s04:timesheet:nao-era-esta;
  // aqui cada pedido vira item de correção em Confirmações, com a tarefa certa como sugestão.
  const pedidosS04 = useRegistro('registro_tela', 's04:timesheet:nao-era-esta')?.valor as { de: string; para: { tarefaId?: string; clienteNome?: string }; quando: string; por: string }[] | undefined
  useEffect(() => {
    for (const p of pedidosS04 ?? []) {
      if (p.por !== usuario.nome) continue
      const chaveS04 = `${p.de}|${p.quando}`
      if (repos.itensConfirmacao.listar((i) => i.extras?.s04 === chaveS04, { arquivados: true }).length) continue
      try {
        if (atual.current?.ctx.tarefa_id === p.de) fechar('"não era esta"')
        const s = repos.sessoes.listar((x) => x.tarefa_id === p.de && x.usuario_dono_id === usuario.id && !x.substituida_por && diaDe(x.inicio) === HOJE_TS).at(-1)
        const certa = p.para.tarefaId ? banco.obter('tarefa', p.para.tarefaId) : undefined
        const cliente = certa?.cliente_id ?? banco.ler('cliente').find((c) => c.nome === p.para.clienteNome)?.id ?? null
        const base = s ? itemNaoEraEsta(s) : { usuario_id: usuario.id, setor_id: banco.obter('tarefa', p.de)?.setor_id ?? null, dia: HOJE_TS, inicio: agoraDemo(Date.parse(p.quando) - 5 * 60000), fim: agoraDemo(Date.parse(p.quando)), tipo: 'nao_era_esta' as const, texto: `"Não era esta": ${banco.obter('tarefa', p.de)?.atividade_id ?? ''} aberta por engano`, pista: 'marcado na ficha da tarefa', sugestao: null, sessao_ref_id: null, situacao: 'pendente' as const, expira_em: new Date(Date.now() + 7 * 86400000).toISOString() }
        repos.itensConfirmacao.criar({ ...base, sugestao: certa || cliente ? { atividade_id: certa?.atividade_id ?? base.sugestao?.atividade_id ?? null, rotulo: certa ? rotuloAtividade(certa.atividade_id) : 'corrigido', cliente_id: cliente, minutos: 5, tarefa_id: certa?.id ?? null } : null, situacao: certa || cliente ? 'marcado' : 'pendente', extras: { s04: chaveS04 } }, { ferramenta: 'timesheet.registrar', texto: `"Não era esta" virou item de correção no Timesheet` })
      } catch {
        /* sem permissão: ignora */
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedidosS04, usuario.id])

  // Ao sair (trocar de conta, fechar o app), fecha a sessão aberta.
  useEffect(() => () => fechar('saiu'), []) // eslint-disable-line react-hooks/exhaustive-deps
  return <OuvinteExtensaoLab />
}

/** Para o "Não era esta" do cabeçalho da tarefa (S04-A52): a sessão ao vivo da tarefa vira item de correção. */
export function sessaoAoVivoDaTarefa(tarefaId: string) {
  return repos.sessoes.listar((s) => s.tarefa_id === tarefaId && !!s.ao_vivo && diaDe(s.inicio) === HOJE_TS)[0]
}

/**
 * Contrato com a S04 (S04-A52, "Não era esta" no cabeçalho da tarefa): encerra a sessão ao vivo
 * da tarefa e manda o intervalo para Confirmações como correção; abaixo de 60 s nada foi gravado
 * (descartada sozinha, H2). Devolve o item criado, ou `undefined` se não havia sessão.
 */
export function naoEraEsta(tarefaId: string) {
  const s = sessaoAoVivoDaTarefa(tarefaId) ?? repos.sessoes.listar((x) => x.tarefa_id === tarefaId && !x.substituida_por && diaDe(x.inicio) === HOJE_TS).at(-1)
  if (!s) return undefined
  if (s.ao_vivo) repos.sessoes.fecharAoVivo(s.id, agoraDemo(), '"não era esta"', configTimesheet(banco.ler('escritorio')[0]))
  return repos.itensConfirmacao.criar(itemNaoEraEsta(repos.sessoes.obter(s.id)!), { ferramenta: 'timesheet.registrar', texto: `"Não era esta": ${s.atividade_id ?? ''} ${s.rotulo}` })
}
