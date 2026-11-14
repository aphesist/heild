import type { AvisoSistema, Trabalho } from '@/ambiente/loja'
import type { FichaCliente } from '@/ambiente/clientes'
import type { Documento as DocumentoTela } from '@/dados/arquivos'
import type { UsuarioCfg } from '@/dados/configuracoes'
import type { CanalCrm, ConversaCrm, ItemConversa } from '@/dados/crm'
import type { NotaEmitida as NotaTela } from '@/dados/servicos-extras'
import type { Cliente as ClienteTela, Mensagem as MensagemTela, Tarefa as TarefaTela } from '@/dados/tipos'
import type { SetorIntegrante } from '@/theme/tipos'
import type {
  CanalMensagem,
  Cliente,
  Conversa,
  Documento,
  ExcecaoTela,
  Id,
  ItemFila,
  Mensagem,
  MensagemIntegrante,
  NotaEmitida,
  Notificacao,
  Pessoa,
  Regime,
  Tarefa,
  Usuario,
  VinculoSetor,
} from '../modelo/entidades'

/**
 * Tradução entre as entidades do banco e os formatos de tela que as telas do
 * wireframe já usavam. A loja usa estes mapeadores para que as telas antigas
 * continuem iguais enquanto leem do banco novo. Tela nova pode ler a entidade
 * direto pelo repositório.
 */

type SemRegistro<T> = Omit<T, 'escritorio_id' | 'criado_em' | 'atualizado_em'>

/** Ano da demonstração: os prazos "dd/mm" dos dados de exemplo são de 2026. */
const ANO = 2026
export const dataDeDiaMes = (ddmm: string): string | null => {
  const m = ddmm.match(/^(\d{2})\/(\d{2})$/)
  return m ? `${ANO}-${m[2]}-${m[1]}` : null
}
export const diaMesDeData = (iso?: string | null): string => (iso && /^\d{4}-\d{2}-\d{2}/.test(iso) ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}` : '')
export const horaCurta = (iso: string) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

/** O que o mapeador precisa olhar no banco para traduzir nomes em ids (e de volta). */
export interface Consulta {
  clientes: Cliente[]
  usuarios: Usuario[]
  integrantes: { id: Id; setor: string }[]
}

/* ---------- Cliente ---------- */

const regimeModelo: Record<ClienteTela['regime'], Regime> = { 'Simples Nacional': 'simples', 'Lucro Presumido': 'presumido', 'Lucro Real': 'real', MEI: 'mei', 'Pessoa física': 'pf' }
const regimeTela = Object.fromEntries(Object.entries(regimeModelo).map(([k, v]) => [v, k])) as Record<Regime, ClienteTela['regime']>
const cicloModelo = { ativo: 'ativo', implantacao: 'em_implantacao', saida: 'em_saida' } as const

export function clienteParaModelo(c: ClienteTela, ficha?: FichaCliente): SemRegistro<Cliente> {
  return {
    id: c.id,
    tipo: c.regime === 'Pessoa física' ? 'pf' : c.regime === 'MEI' ? 'mei' : 'pj',
    codigo: c.codigo,
    documento: c.documento,
    nome: c.nome,
    estado_ciclo: cicloModelo[c.situacao ?? 'ativo'],
    estado_ciclo_desde: `${ANO}-01-01`,
    regime: regimeModelo[c.regime],
    servicos_contratados: c.servicos ?? ['contabil'],
    extras: { ficha, servicos_definidos: !!c.servicos },
  }
}

export function clienteParaTela(c: Cliente): ClienteTela {
  const situacao = c.estado_ciclo === 'em_implantacao' ? 'implantacao' : c.estado_ciclo === 'em_saida' ? 'saida' : 'ativo'
  return { id: c.id, codigo: c.codigo, nome: c.nome, documento: c.documento, regime: regimeTela[c.regime] ?? 'Simples Nacional', situacao, ...(c.extras?.servicos_definidos ? { servicos: c.servicos_contratados as ('contabil' | 'bpo')[] } : {}) }
}

/* ---------- Tarefa ---------- */

export function tarefaParaModelo(t: TarefaTela, q: Consulta, base?: Tarefa): SemRegistro<Tarefa> {
  const cliente = q.clientes.find((c) => c.nome === t.cliente)
  const r = t.responsavel
  const responsavelId = r?.tipo === 'integrante' ? (q.integrantes.find((i) => i.setor === r.setor)?.id ?? null) : r ? (q.usuarios.find((u) => u.nome === r.nome)?.id ?? null) : null
  const extras: Record<string, unknown> = { ...base?.extras, atrasada: t.atrasada, dias_aguardando: t.diasAguardando, cartao_pendente: t.cartaoPendente, responsavel_nome: r?.nome, responsavel_setor: r?.setor, responsavel_tipo_tela: r?.tipo }
  if (!cliente) extras.cliente_nome = t.cliente
  else delete extras.cliente_nome
  return {
    quem_conclui: 'pessoa',
    prioridade: t.atrasada ? 'alta' : 'normal',
    checklist: [],
    risco: false,
    status_desde: base?.status_desde ?? new Date().toISOString(),
    ...base,
    id: t.id,
    cliente_id: cliente?.id ?? null,
    setor_id: t.setor,
    atividade_id: t.codigo,
    titulo: t.titulo,
    origem: t.origem ?? base?.origem ?? 'pessoa',
    responsavel_tipo: r ? (r.tipo === 'integrante' ? 'integrante' : 'usuario') : null,
    responsavel_id: responsavelId,
    status: t.status,
    prazo_interno: dataDeDiaMes(t.prazo),
    conversa_id: t.conversa ?? null,
    extras,
  }
}

export function tarefaParaTela(t: Tarefa, q: Pick<Consulta, 'clientes'>): TarefaTela {
  const e = t.extras ?? {}
  const cliente = t.cliente_id ? q.clientes.find((c) => c.id === t.cliente_id)?.nome : undefined
  const tela: TarefaTela = {
    id: t.id,
    codigo: t.atividade_id,
    titulo: t.titulo,
    cliente: cliente ?? String(e.cliente_nome ?? ''),
    setor: t.setor_id as SetorIntegrante,
    prazo: diaMesDeData(t.prazo_interno ?? t.prazo_legal),
    // A tela só conhece quatro estados: os outros aparecem como "em andamento" (revisão, terceiro) ou concluída (cancelada sai da fila).
    status: t.status === 'aguardando_terceiro' || t.status === 'em_revisao' ? 'em_andamento' : t.status === 'cancelada' ? 'concluida' : t.status,
  }
  if (e.responsavel_nome) tela.responsavel = { tipo: e.responsavel_tipo_tela === 'integrante' || t.responsavel_tipo === 'integrante' ? 'integrante' : 'pessoa', nome: String(e.responsavel_nome), ...(e.responsavel_setor ? { setor: e.responsavel_setor as SetorIntegrante } : {}) }
  if (e.atrasada !== undefined) tela.atrasada = e.atrasada as boolean
  if (e.dias_aguardando !== undefined) tela.diasAguardando = e.dias_aguardando as number
  if (e.cartao_pendente !== undefined) tela.cartaoPendente = e.cartao_pendente as boolean
  if (t.conversa_id) tela.conversa = t.conversa_id
  if (t.origem === 'pedido_cliente') tela.origem = 'pedido_cliente'
  return tela
}

/* ---------- Conversa do CRM e mensagens ---------- */

const canalModelo: Record<CanalCrm, CanalMensagem> = { whatsapp: 'whatsapp', email: 'email', app: 'chat_app' }
const canalTela = (c: CanalMensagem): CanalCrm => (c === 'email' ? 'email' : c === 'chat_app' ? 'app' : 'whatsapp')

export function conversaParaModelo(c: ConversaCrm, q: Consulta, pessoaId?: Id): SemRegistro<Conversa> {
  const { itens: _itens, ...resto } = c
  void _itens
  return {
    id: c.id,
    cliente_id: c.clienteId ?? null,
    lead_id: null,
    pessoa_id: pessoaId ?? null,
    setor_id: c.setor,
    responsavel_id: q.usuarios.find((u) => u.nome === c.responsavel)?.id ?? null,
    status: c.status,
    tarefa_id: c.tarefaAguardada ?? null,
    canal_resposta_atual: canalModelo[c.canal],
    etiquetas: c.etiquetas,
    resumo: c.resumo,
    ultima_mensagem_em: new Date().toISOString(),
    extras: { tela: { ...resto, itens: undefined }, pessoa_nome: c.pessoa.nome },
  }
}

/** Uma linha de conversa (mensagem, nota, dia, marco, cartão) vira uma Mensagem; o item original fica em `extras.item`. */
export function itemParaMensagem(conversaId: Id, item: ItemConversa, ordem: number): SemRegistro<Mensagem> {
  const id = 'id' in item ? item.id : `${conversaId}-dia-${ordem}`
  const base = { id, conversa_id: conversaId, ordem, extras: { item } }
  if (item.tipo === 'mensagem')
    return {
      ...base,
      direcao: item.de === 'cliente' ? 'entrada' : 'saida',
      canal: canalModelo[item.canal],
      autor_tipo: item.de === 'cliente' ? 'pessoa' : item.de === 'atendente' ? 'usuario' : item.de === 'integrante' ? 'integrante' : 'sistema',
      corpo: item.texto,
      transcricao: item.audio?.transcricao,
      origem_externa: item.de === 'cliente',
      status_entrega: item.entrega ?? null,
    }
  if (item.tipo === 'nota') return { ...base, direcao: 'nota_interna', canal: 'sistema', autor_tipo: 'usuario', corpo: item.texto, origem_externa: false }
  return { ...base, direcao: 'saida', canal: 'sistema', autor_tipo: 'sistema', corpo: 'texto' in item ? item.texto : item.tipo === 'cartao' ? item.titulo : undefined, origem_externa: false }
}

export function mensagemParaItem(m: Mensagem): ItemConversa {
  const item = (m.extras?.item ?? { tipo: 'nota', id: m.id, autor: '', hora: '', texto: m.corpo ?? '' }) as ItemConversa
  if (item.tipo === 'mensagem') return { ...item, ...(m.corpo !== undefined ? { texto: m.corpo } : {}), ...(m.status_entrega ? { entrega: m.status_entrega } : {}) }
  if (item.tipo === 'nota') return { ...item, texto: m.corpo ?? item.texto }
  return item
}

export function conversaParaTela(c: Conversa, mensagens: Mensagem[]): ConversaCrm {
  const tela = (c.extras?.tela ?? {}) as Omit<ConversaCrm, 'itens'>
  return {
    ...tela,
    id: c.id,
    clienteId: c.cliente_id ?? undefined,
    setor: c.setor_id as SetorIntegrante,
    status: c.status,
    canal: tela.canal ?? canalTela(c.canal_resposta_atual),
    etiquetas: c.etiquetas,
    resumo: c.resumo ?? tela.resumo,
    itens: mensagens.map(mensagemParaItem),
  }
}

/* ---------- Documento ---------- */

const mimes: Record<string, string> = { pdf: 'application/pdf', xml: 'application/xml', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', jpg: 'image/jpeg', png: 'image/png', zip: 'application/zip', ofx: 'application/x-ofx', txt: 'text/plain' }
const bytes = (t: string) => {
  const m = t.replace(',', '.').match(/([\d.]+)\s*(KB|MB|GB|B)/i)
  if (!m) return 0
  const f = { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3 }[m[2].toUpperCase() as 'B']
  return Math.round(parseFloat(m[1]) * f)
}

export function documentoParaModelo(d: DocumentoTela, visivel: boolean): SemRegistro<Documento> {
  const ext = d.nome.split('.').pop()?.toLowerCase() ?? ''
  return {
    id: d.id,
    cliente_id: d.clienteId ?? null,
    tipo: d.tipo,
    competencia: d.competencia,
    nome_arquivo: d.nome,
    mime: mimes[ext] ?? 'application/octet-stream',
    tamanho_bytes: bytes(d.tamanho),
    hash_sha256: d.hash,
    origem: d.origem,
    backend_id: d.conector,
    caminho: d.pasta.join('/'),
    visivel_ao_cliente: visivel,
    versao: d.versao,
    metadados: d.dados,
    extras: { pasta: d.pasta, quando: d.quando, por: d.por, tamanho: d.tamanho, entregas: d.entregas, forcarVisivel: d.forcarVisivel },
  }
}

export function documentoParaTela(d: Documento): DocumentoTela {
  const e = d.extras ?? {}
  return {
    id: d.id,
    nome: d.nome_arquivo,
    ...(d.cliente_id ? { clienteId: d.cliente_id } : {}),
    pasta: (e.pasta as string[] | undefined) ?? (d.caminho ? d.caminho.split('/') : []),
    tipo: d.tipo as DocumentoTela['tipo'],
    competencia: d.competencia,
    origem: d.origem as DocumentoTela['origem'],
    conector: d.backend_id,
    tamanho: String(e.tamanho ?? `${Math.max(1, Math.round(d.tamanho_bytes / 1024))} KB`),
    quando: String(e.quando ?? ''),
    por: String(e.por ?? ''),
    versao: d.versao,
    hash: d.hash_sha256,
    ...(d.metadados ? { dados: d.metadados } : {}),
    ...(e.entregas ? { entregas: e.entregas as DocumentoTela['entregas'] } : {}),
    ...(e.forcarVisivel !== undefined ? { forcarVisivel: e.forcarVisivel as boolean } : {}),
  }
}

/* ---------- Aviso (notificação) ---------- */

const categoria: Record<AvisoSistema['tipo'], Notificacao['categoria']> = { cartao: 'aprovacao', conversa: 'conversa', prazo: 'prazo', sistema: 'sistema', cliente: 'cliente' }
const tipoAviso = Object.fromEntries(Object.entries(categoria).map(([k, v]) => [v, k])) as Record<Notificacao['categoria'], AvisoSistema['tipo']>

export function avisoParaModelo(a: AvisoSistema, ordem: number): SemRegistro<Notificacao> {
  return {
    id: a.id,
    ordem,
    destinatario_tipo: a.para.length ? 'usuario' : 'todos',
    destinatario_ids: a.para,
    setor_id: a.setor ?? null,
    categoria: categoria[a.tipo],
    prioridade: a.tipo === 'cartao' ? 'alta' : 'normal',
    titulo: a.titulo,
    corpo: a.detalhe,
    acao: (a.destino as unknown as Record<string, unknown>) ?? null,
    publicada_por_tipo: 'sistema',
    lida_por: a.lidoPor,
    quando: a.quando,
  }
}

export function avisoParaTela(n: Notificacao): AvisoSistema {
  return {
    id: n.id,
    para: n.destinatario_ids,
    titulo: n.titulo,
    ...(n.corpo ? { detalhe: n.corpo } : {}),
    quando: n.quando,
    ...(n.setor_id ? { setor: n.setor_id as SetorIntegrante } : {}),
    tipo: tipoAviso[n.categoria] ?? 'sistema',
    lidoPor: n.lida_por,
    ...(n.acao ? { destino: n.acao as unknown as AvisoSistema['destino'] } : {}),
  }
}

/* ---------- Conta (usuário, vínculos, exceções, carteira) ---------- */

export function contaParaModelo(u: UsuarioCfg): { pessoa: SemRegistro<Pessoa>; usuario: SemRegistro<Usuario>; vinculos: SemRegistro<VinculoSetor>[]; excecoes: SemRegistro<ExcecaoTela>[]; carteira: { id: Id; usuario_id: Id; cliente_id: Id }[] } {
  const pessoaId = `pe-${u.id}`
  return {
    pessoa: { id: pessoaId, nome: u.nome, tipo: 'equipe' },
    usuario: { id: u.id, pessoa_id: pessoaId, nome: u.nome, papel: u.papel, email_login: u.email, situacao: u.situacao, cargo: u.cargo, segundo_fator: u.segundoFator, ultimo_acesso: u.ultimoAcesso, preferencias: {} },
    vinculos: u.vinculos.map((v) => ({ id: `vs-${u.id}-${v.setor}`, usuario_id: u.id, setor_id: v.setor, modo: v.modo, vigente_de: `${ANO}-01-01` })),
    excecoes: u.excecoes.map((x) => ({ id: x.id, usuario_id: u.id, tela_ou_ferramenta: x.tela, efeito: x.efeito, nivel_max: x.nivel, motivo: x.motivo, vigente_de: `${ANO}-01-01`, vigente_ate: x.ate ? (dataDeDiaMes(x.ate) ?? null) : null })),
    carteira: u.carteira.map((c) => ({ id: `cc-${u.id}-${c}`, usuario_id: u.id, cliente_id: c })),
  }
}

export function contaParaTela(u: Usuario, vinculos: VinculoSetor[], excecoes: ExcecaoTela[], carteira: { usuario_id: Id; cliente_id: Id }[]): UsuarioCfg {
  return {
    id: u.id,
    nome: u.nome,
    email: u.email_login,
    papel: u.papel,
    situacao: u.situacao,
    vinculos: vinculos.filter((v) => v.usuario_id === u.id && !v.vigente_ate).map((v) => ({ setor: v.setor_id as SetorIntegrante, modo: v.modo })),
    excecoes: excecoes
      .filter((x) => x.usuario_id === u.id)
      .map((x) => ({ id: x.id, tela: x.tela_ou_ferramenta, efeito: x.efeito, ...(x.nivel_max ? { nivel: x.nivel_max } : {}), motivo: x.motivo, ...(x.vigente_ate ? { ate: diaMesDeData(x.vigente_ate) } : {}) })),
    carteira: carteira.filter((c) => c.usuario_id === u.id).map((c) => c.cliente_id),
    segundoFator: u.segundo_fator,
    ultimoAcesso: u.ultimo_acesso ?? '',
    ...(u.cargo ? { cargo: u.cargo } : {}),
  }
}

/* ---------- Chat dos integrantes e trabalho simulado ---------- */

export function mensagemTelaParaModelo(sessao: string, m: MensagemTela, ordem: number): SemRegistro<MensagemIntegrante> {
  return {
    id: m.id,
    ordem,
    sessao_chave: sessao,
    autor_tipo: m.autor.tipo === 'usuario' ? 'usuario' : m.autor.tipo === 'integrante' ? 'integrante' : 'sistema',
    autor_id: m.autor.tipo === 'integrante' ? m.autor.setor : m.autor.tipo === 'usuario' ? m.autor.nome : null,
    corpo: m.texto,
    extras: { mensagem: m },
  }
}

export const mensagemModeloParaTela = (m: MensagemIntegrante): MensagemTela => (m.extras?.mensagem ?? { id: m.id, autor: { tipo: 'sistema' }, hora: '', texto: m.corpo }) as MensagemTela

export function trabalhoParaModelo(t: Trabalho): SemRegistro<ItemFila> {
  return {
    id: t.uid,
    integrante_id: t.integrante,
    tipo: t.origem ? 'mensagem_usuario' : 'job',
    status: t.situacao === 'rodando' ? 'em_execucao' : 'concluido',
    enfileirado_em: new Date(t.inicioEm).toISOString(),
    iniciado_em: new Date(t.inicioEm).toISOString(),
    concluido_em: t.fimEm ? new Date(t.fimEm).toISOString() : null,
    extras: { trabalho: t, titulo: t.titulo },
  }
}

export const trabalhoParaTela = (i: ItemFila): Trabalho => ({ ...(i.extras?.trabalho as Trabalho), situacao: i.status === 'concluido' ? 'concluido' : 'rodando', ...(i.concluido_em ? { fimEm: Date.parse(i.concluido_em) } : {}) })

/* ---------- Nota emitida ---------- */

export const notaParaModelo = (n: NotaTela & { clienteId: string }): SemRegistro<NotaEmitida> => ({ id: `nf-${n.clienteId}-${n.numero}`, cliente_id: n.clienteId, numero: n.numero, situacao: n.situacao, extras: { nota: n } })
export const notaParaTela = (n: NotaEmitida): NotaTela => ({ ...(n.extras?.nota as NotaTela), situacao: n.situacao as NotaTela['situacao'], clienteId: n.cliente_id })
