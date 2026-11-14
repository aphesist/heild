import type { Destino, IdModulo } from '@/ambiente/loja'
import { documentoParaTela } from '@/nucleo/mapeadores'
import { rotuloSetorCurto } from '@/nucleo/permissoes'
import { repos } from '@/nucleo/repositorios'
import type { SetorIntegrante } from '@/theme/tipos'
import { casa, trechoDe, type EscopoBusca, type ResultadoBusca, type TermoBusca } from './busca'
import { integrantes } from './exemplo'

/**
 * Fonte de busca da S01 (contrato C7): o que é de todos e mora no banco
 * (clientes, tarefas, obrigações, documentos, conversas do CRM com a
 * transcrição dos áudios, mensagens internas, integrantes) e as próprias
 * telas ("usuários", "tema"). Os módulos com dados próprios (Financeiro,
 * BPO, Leads...) acrescentam a fonte deles em `busca.ts`.
 */

const abaDoSetor: Partial<Record<SetorIntegrante, string>> = { societario: 'societario', fiscal: 'fiscal', notas: 'notas', dp: 'dp', contabil: 'contabil', consultor: 'consultoria', gestao_atendimento: 'gestao' }

/** Telas que a busca encontra pelo nome (vai direto, sem trocar cliente). */
const telas: { modulo: IdModulo; aba?: string; titulo: string; chaves: string }[] = [
  { modulo: 'inicio', aba: 'assistente', titulo: 'Início › Assistente', chaves: 'assistente chat geral perguntar' },
  { modulo: 'inicio', aba: 'time', titulo: 'Início › Time', chaves: 'time integrantes agentes ia' },
  { modulo: 'inicio', aba: 'visao', titulo: 'Início › Visão geral', chaves: 'visao geral home hoje widgets calendario' },
  { modulo: 'painel', aba: 'obrigacoes', titulo: 'Painel › Obrigações e Prazos', chaves: 'obrigacoes prazos calendario' },
  { modulo: 'painel', aba: 'societario', titulo: 'Painel › Clientes e Societário', chaves: 'societario legal legalizacao clientes cadastro' },
  { modulo: 'painel', aba: 'fiscal', titulo: 'Painel › Fiscal', chaves: 'fiscal tributos impostos' },
  { modulo: 'painel', aba: 'dp', titulo: 'Painel › Trabalhista e DP', chaves: 'dp folha trabalhista pessoal' },
  { modulo: 'painel', aba: 'contabil', titulo: 'Painel › Contábil', chaves: 'contabil balancete conciliacao' },
  { modulo: 'painel', aba: 'notas', titulo: 'Painel › Notas fiscais', chaves: 'notas nfe nfse xml' },
  { modulo: 'painel', aba: 'gestao', titulo: 'Painel › Gestão', chaves: 'gestao equipe carteira' },
  { modulo: 'crm', aba: 'conversas', titulo: 'CRM › Conversas', chaves: 'crm conversas whatsapp atendimento' },
  { modulo: 'crm', aba: 'leads', titulo: 'CRM › Leads', chaves: 'leads funil proposta' },
  { modulo: 'timesheet', aba: 'meu', titulo: 'Timesheet › Meu tempo', chaves: 'timesheet horas tempo' },
  { modulo: 'timesheet', aba: 'confirmacoes', titulo: 'Timesheet › Confirmações', chaves: 'confirmacoes horas' },
  { modulo: 'financeiro', aba: 'cobranca', titulo: 'Financeiro › Cobranças', chaves: 'cobrancas faturas honorarios boleto' },
  { modulo: 'arquivos', aba: 'pastas', titulo: 'Arquivos', chaves: 'arquivos pastas documentos drive' },
  { modulo: 'config', aba: 'usuarios', titulo: 'Configurações › Usuários e setores', chaves: 'usuarios convidar equipe permissoes setores' },
  { modulo: 'config', aba: 'tema', titulo: 'Configurações › Tema', chaves: 'tema marca branca cores logo' },
  { modulo: 'config', aba: 'integrantes', titulo: 'Configurações › Integrantes', chaves: 'integrantes agentes autonomia' },
  { modulo: 'config', aba: 'conectores', titulo: 'Configurações › Conectores e cofre', chaves: 'conectores cofre certificado credenciais' },
]

export function buscarS01(termo: TermoBusca, escopo: EscopoBusca): ResultadoBusca[] {
  const r: ResultadoBusca[] = []
  const setores = new Set<string>(escopo.setores)
  const clientes = new Map(escopo.clientes.map((c) => [c.id, c]))
  const temPainel = escopo.modulos.includes('painel')
  const nomeCliente = (id?: string | null) => (id ? clientes.get(id)?.nome : undefined)

  // Clientes: nome, fantasia, CNPJ/CPF com e sem pontuação, código no core, apelido.
  for (const c of repos.clientes.listar()) {
    if (!clientes.has(c.id)) continue
    const rel = casa(termo, c.nome, c.codigo, c.documento, String(c.extras?.nome_fantasia ?? ''), String(c.extras?.apelido ?? ''), String(c.extras?.codigo_core ?? ''))
    if (!rel) continue
    r.push({
      id: c.id,
      tipo: 'cliente',
      titulo: `${c.codigo} - ${c.nome}`,
      detalhe: `${c.documento} · ${c.regime.replace(/_/g, ' ')}`,
      destino: temPainel ? { modulo: 'painel', aba: 'societario', cliente: c.id, ficha: c.id } : { modulo: escopo.modulos.includes('clientes') ? 'clientes' : 'inicio', cliente: c.id },
      clienteId: c.id,
      relevancia: rel,
    })
  }

  // Tarefas dos setores da pessoa.
  for (const t of repos.tarefas.listar()) {
    if (!setores.has(t.setor_id) || t.status === 'cancelada') continue
    if (t.cliente_id && !clientes.has(t.cliente_id)) continue
    const rel = casa(termo, t.titulo, t.atividade_id, t.descricao, nomeCliente(t.cliente_id))
    if (!rel) continue
    const setor = t.setor_id as SetorIntegrante
    const destino: Destino = temPainel
      ? { modulo: 'painel', aba: abaDoSetor[setor] ?? 'obrigacoes', cliente: t.cliente_id ?? null, tarefa: t.id }
      : { modulo: 'bpo', aba: 'fila', cliente: t.cliente_id ?? null, tarefa: t.id }
    r.push({ id: t.id, tipo: 'tarefa', titulo: `${t.atividade_id} · ${t.titulo}`, detalhe: [nomeCliente(t.cliente_id), rotuloSetorCurto[setor], t.status === 'concluida' ? 'concluída' : null].filter(Boolean).join(' · '), destino, clienteId: t.cliente_id ?? null, setor, relevancia: rel - (t.status === 'concluida' ? 10 : 0) })
  }

  // Obrigações (regras) dos setores da pessoa: leva à aba Obrigações filtrada.
  if (temPainel)
    for (const o of repos.obrigacoes.listar()) {
      const setor = o.gera_tarefa_para_setor as SetorIntegrante
      if (!setores.has(setor) || o.cancelada_em) continue
      const rel = casa(termo, o.nome, o.atividade_id)
      if (!rel) continue
      r.push({ id: o.id, tipo: 'obrigacao', titulo: o.nome, detalhe: `${o.atividade_id} · ${rotuloSetorCurto[setor] ?? setor} · ${o.periodicidade}`, destino: { modulo: 'painel', aba: 'obrigacoes', filtroSetor: setor }, setor, relevancia: rel })
    }

  // Documentos do escopo.
  if (escopo.modulos.includes('arquivos'))
    for (const d of repos.documentos.listar()) {
      if (d.cliente_id && !clientes.has(d.cliente_id)) continue
      const rel = casa(termo, d.nome_arquivo, d.tipo, d.competencia, nomeCliente(d.cliente_id))
      if (!rel) continue
      const tela = documentoParaTela(d)
      r.push({ id: d.id, tipo: 'documento', titulo: d.nome_arquivo, detalhe: [nomeCliente(d.cliente_id) ?? 'Escritório', d.competencia, tela.pasta.join(' › ')].filter(Boolean).join(' · '), destino: { modulo: 'arquivos', aba: 'pastas', pasta: { clienteId: d.cliente_id ?? undefined, caminho: tela.pasta } }, clienteId: d.cliente_id ?? null, relevancia: rel })
    }

  // Conversas do CRM: só dos setores da pessoa (04, 10.1: a de outro setor não aparece nem na busca). Inclui a transcrição dos áudios.
  if (escopo.modulos.includes('crm')) {
    const mensagens = repos.mensagens.listar()
    for (const c of repos.conversas.listar()) {
      if (!setores.has(c.setor_id)) continue
      if (c.cliente_id && !clientes.has(c.cliente_id)) continue
      const pessoa = String(c.extras?.pessoa_nome ?? '')
      let rel = casa(termo, pessoa, nomeCliente(c.cliente_id), c.resumo, ...c.etiquetas)
      let trecho: string | undefined
      if (!rel)
        for (const m of mensagens) {
          if (m.conversa_id !== c.id) continue
          const n = casa(termo, m.corpo, m.transcricao)
          if (n) {
            rel = n - 10
            const fonte = m.transcricao && casa(termo, m.transcricao) ? m.transcricao : (m.corpo ?? '')
            trecho = `${m.transcricao && fonte === m.transcricao ? 'Áudio: ' : ''}${trechoDe(fonte, termo)}`
            break
          }
        }
      if (!rel) continue
      r.push({ id: c.id, tipo: 'conversa', titulo: pessoa || 'Conversa', detalhe: [nomeCliente(c.cliente_id) ?? (c.lead_id ? 'lead' : undefined), rotuloSetorCurto[c.setor_id as SetorIntegrante], c.status].filter(Boolean).join(' · '), trecho, destino: { modulo: 'crm', aba: 'conversas', conversa: c.id }, clienteId: c.cliente_id ?? null, setor: c.setor_id as SetorIntegrante, relevancia: rel })
    }
  }

  // Mensagens internas: só das conversas em que a pessoa participa agora.
  const minhas = new Set(repos.participacoes.listar((p) => p.usuario_id === escopo.usuarioId && !p.saiu_em).map((p) => p.conversa_interna_id))
  const conversasInternas = new Map(repos.conversasInternas.listar().map((c) => [c.id, c]))
  let internas = 0
  for (const m of repos.mensagensInternas.listar()) {
    if (!minhas.has(m.conversa_interna_id) || internas >= 12) continue
    const rel = casa(termo, m.corpo)
    if (!rel) continue
    internas++
    const ci = conversasInternas.get(m.conversa_interna_id)
    r.push({ id: m.id, tipo: 'mensagem_interna', titulo: ci?.nome ?? (ci?.tipo === 'pessoal' ? 'Conversa pessoal' : 'Conversa interna'), trecho: trechoDe(m.corpo, termo), detalhe: new Date(m.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), destino: { modulo: 'interna', aba: 'conversas', conversaInterna: m.conversa_interna_id }, relevancia: rel - 5 })
  }

  // Integrantes da pessoa (os do setor dela, o Assistente e o Consultor).
  for (const i of integrantes) {
    if (i.tipo === 'criado_pelo_usuario' || !(i.setor === 'geral' || i.setor === 'consultor' || setores.has(i.setor))) continue
    const rel = casa(termo, i.setorRotulo, i.funcao, rotuloSetorCurto[i.setor], i.setor === 'geral' ? 'assistente' : undefined)
    if (!rel) continue
    r.push({ id: i.id, tipo: 'integrante', titulo: i.setor === 'geral' ? 'Assistente' : (rotuloSetorCurto[i.setor] ?? i.setorRotulo), detalhe: i.funcao, destino: { modulo: 'inicio', aba: 'time', integrante: i.id }, setor: i.setor, relevancia: rel - 5 })
  }

  // Telas do sistema.
  for (const t of telas) {
    if (!escopo.modulos.includes(t.modulo)) continue
    const rel = casa(termo, t.titulo, t.chaves)
    if (!rel) continue
    r.push({ id: `${t.modulo}/${t.aba ?? ''}`, tipo: 'tela', titulo: t.titulo, destino: { modulo: t.modulo, ...(t.aba ? { aba: t.aba } : {}) }, relevancia: rel - 15 })
  }

  return r
}
