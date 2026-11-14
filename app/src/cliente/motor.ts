import { integranteDoSetor } from '@/ambiente/fluxos'
import type { useLoja } from '@/ambiente/loja'
import { P } from '@/dados/arquivos'
import type { FluxoSimulado } from '@/dados/simulacao'
import type { SetorIntegrante } from '@/theme/tipos'
import { publicarAviso } from './avisos'
import { brl, simuladoRescisao, HOJE, agoraTexto } from './dados'
import { CHAVE_CARTOES, type DocAssinar, type ExtraPedido, type PayloadCartao, type Reenvio } from './estado'

/**
 * O lado do escritório do que nasce no app (S10), agentificado (mapa, 0.7):
 * o integrante do setor acorda pelo gatilho, faz sozinho o reversível (ler,
 * somar, conferir, montar), prepara no cartão o que sai ao cliente e só
 * depois da aprovação de uma pessoa o app recebe. Os efeitos de cada cartão
 * (prefixo `s10-`) estão em `efeitoCartaoS10`, chamado de `ambiente/efeitos`.
 */

type Loja = ReturnType<typeof useLoja>

const novoCartao = (tipo: string) => `s10-${tipo}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`

function guardarPayload(loja: Loja, id: string, p: PayloadCartao) {
  loja.lembrar(CHAVE_CARTOES, {}, (m: Record<string, PayloadCartao>) => ({ ...m, [id]: p }))
}

function trabalhar(loja: Loja, f: Omit<FluxoSimulado, 'integrante'> & { setor: SetorIntegrante }, tarefaId?: string) {
  loja.iniciarTrabalho({ ...f, integrante: integranteDoSetor(f.setor) }, tarefaId ? { tarefaId } : undefined)
}

/** C2-02: pedido de simulado pelo app → o DP lê o cálculo do sistema da folha e monta o modelo do escritório. */
export function prepararSimulado(loja: Loja, a: { clienteId: string; clienteNome: string; tarefaId: string; empregado: string; tipoRescisao: string; data: string; contato: string }) {
  const id = novoCartao('simulado')
  const s = simuladoRescisao(a.empregado, a.tipoRescisao, a.data)
  guardarPayload(loja, id, { tipo: 'simulado', ...a })
  trabalhar(
    loja,
    {
      id: `s10-sim-${a.tarefaId}`,
      setor: 'dp',
      titulo: `Simulado de rescisão · ${a.empregado}`,
      cliente: a.clienteNome,
      inicio: `Pedido de simulado da ${a.clienteNome} pelo app. Vou ler o cálculo do sistema da folha e montar no modelo do escritório.`,
      etapas: ['Puxei o cálculo do sistema da folha (PDF do Domínio)', 'Conferi saldo de salário, férias e 13º proporcional', 'Calculei o aviso e a multa do FGTS pelo tipo de saída', 'Reescrevi no modelo do escritório, em linguagem do cliente'],
      seg: 1.4,
      fim: {
        texto: `Simulado pronto: ${a.empregado}, ${a.tipoRescisao.toLowerCase()}. Total líquido ${brl(s.total)}; ${s.fgts} Mando ao cliente?`,
        cartoes: [{ tipo: 'aprovacao', id, resumo: `Enviar o simulado de rescisão de ${a.empregado} a ${a.contato} pelo app`, argumentos: [{ rotulo: 'Empresa', valor: a.clienteNome }, { rotulo: 'Total líquido', valor: brl(s.total) }, { rotulo: 'Depois', valor: 'cobra a resposta em D+1 e D+3 (régua)' }], expiraEm: '48 h' }],
        aviso: `Simulado de rescisão pronto para aprovar · ${a.clienteNome}`,
      },
    },
    a.tarefaId,
  )
}

/** C2-14: o Contábil soma a receita de 12 meses pelas notas e pelo PGDAS-D e prepara para o contador assinar (D-16). */
export function prepararDeclaracao(loja: Loja, a: { clienteId: string; clienteNome: string; tarefaId: string; finalidade: string; periodo: string; receita: number; contato: string }) {
  const id = novoCartao('declaracao')
  guardarPayload(loja, id, { tipo: 'declaracao', ...a })
  trabalhar(
    loja,
    {
      id: `s10-dec-${a.tarefaId}`,
      setor: 'contabil',
      titulo: `Declaração de faturamento · ${a.clienteNome}`,
      cliente: a.clienteNome,
      inicio: `Pedido de declaração de faturamento (${a.finalidade.toLowerCase()}). Vou somar a receita e conferir as duas fontes.`,
      etapas: ['Somei a receita pelas notas capturadas (XML)', 'Somei pelo PGDAS-D transmitido', 'As duas fontes conferem', 'Montei a declaração no modelo do escritório para o contador assinar'],
      seg: 1.3,
      fim: {
        texto: `Receita de ${a.periodo.toLowerCase()}: ${brl(a.receita)} (notas) × ${brl(a.receita)} (PGDAS-D). Pronta para assinar; vai ao cliente só depois da assinatura conferida.`,
        cartoes: [{ tipo: 'aprovacao', id, resumo: `Assinar como contador e enviar a declaração de faturamento da ${a.clienteNome}`, argumentos: [{ rotulo: 'Receita', valor: brl(a.receita) }, { rotulo: 'Finalidade', valor: a.finalidade }, { rotulo: 'Assinatura', valor: 'certificado do contador, conferida no PDF (D-16)' }], expiraEm: '48 h' }],
        aviso: `Declaração de faturamento para assinar · ${a.clienteNome}`,
      },
    },
    a.tarefaId,
  )
}

/** C2-06: situação de risco registrada → o DP prepara o termo de ciência e o envio para assinatura. */
export function prepararTermo(loja: Loja, a: { clienteId: string; clienteNome: string; titulo: string; texto: string; contato: string }) {
  const id = novoCartao('termo')
  guardarPayload(loja, id, { tipo: 'termo', ...a })
  trabalhar(loja, {
    id: `s10-termo-${a.clienteId}-${Date.now().toString(36)}`,
    setor: 'dp',
    titulo: `Termo de ciência · ${a.clienteNome}`,
    cliente: a.clienteNome,
    inicio: `Registrei a situação de risco da ${a.clienteNome}. Vou preparar o termo de ciência pelo modelo.`,
    etapas: ['Preenchi o modelo de termo de ciência', 'Juntei a orientação dada na conversa', 'Preparei o envio para assinatura eletrônica'],
    seg: 1.2,
    fim: {
      texto: `Termo pronto: "${a.titulo}". Depois de aprovado, vai ao app para ${a.contato} assinar; eu cobro até assinar e guardo o assinado como prova.`,
      cartoes: [{ tipo: 'aprovacao', id, resumo: `Enviar o termo de ciência a ${a.contato} para assinar`, argumentos: [{ rotulo: 'Empresa', valor: a.clienteNome }, { rotulo: 'Assinatura', valor: 'eletrônica pelo app (provedor)' }], expiraEm: '48 h' }],
      aviso: `Termo de ciência para aprovar · ${a.clienteNome}`,
    },
  })
}

/** D-17: documento sem abertura no prazo → o Atendimento prepara o reenvio por outro canal. */
export function prepararReenvio(loja: Loja, a: { clienteId: string; clienteNome: string; docId: string; docNome: string; canal: 'whatsapp' | 'email'; contato: string; conversa?: string }) {
  const id = novoCartao('reenvio')
  guardarPayload(loja, id, { tipo: 'reenvio', ...a })
  loja.lembrar('s10:reenvios', {}, (m: Record<string, Reenvio>) => ({ ...m, [a.docId]: { docId: a.docId, canal: a.canal, situacao: 'preparado', em: agoraTexto(), cartao: id } }))
  trabalhar(loja, {
    id: `s10-reenvio-${a.docId}`,
    setor: 'gestao_atendimento',
    titulo: `Reenvio de ${a.docNome}`,
    cliente: a.clienteNome,
    inicio: `${a.docNome} passou do prazo de 3 dias úteis sem abertura no app. Vou preparar o reenvio por ${a.canal === 'whatsapp' ? 'WhatsApp' : 'e-mail'}.`,
    etapas: ['Conferi o registro de entrega: enviado, não aberto', `Escolhi o canal: ${a.canal === 'whatsapp' ? 'WhatsApp (opt-in ativo)' : 'e-mail'}`, 'Montei a mensagem com o link (o conteúdo não vai no texto)'],
    seg: 1,
    fim: {
      texto: `Preparei o reenvio de ${a.docNome} para ${a.contato} por ${a.canal === 'whatsapp' ? 'WhatsApp' : 'e-mail'}.`,
      cartoes: [{ tipo: 'aprovacao', id, resumo: `Reenviar ${a.docNome} a ${a.contato} por ${a.canal === 'whatsapp' ? 'WhatsApp' : 'e-mail'}`, argumentos: [{ rotulo: 'Empresa', valor: a.clienteNome }, { rotulo: 'Motivo', valor: 'farol vermelho: sem abertura em 3 dias úteis' }], expiraEm: '24 h' }],
      aviso: `Reenvio preparado (farol vermelho) · ${a.clienteNome}`,
    },
  })
}

/** Resposta factual na conversa (06, 7.2): o Atendimento rascunha; no início, uma pessoa aprova antes de sair ao cliente. */
export function prepararResposta(loja: Loja, a: { clienteId: string; clienteNome: string; conversa: string; setor: string; pergunta: string; texto: string; contato: string }) {
  const id = novoCartao('resposta')
  guardarPayload(loja, id, { tipo: 'resposta', clienteId: a.clienteId, clienteNome: a.clienteNome, conversa: a.conversa, setor: a.setor, texto: a.texto, contato: a.contato })
  trabalhar(loja, {
    id: `s10-resp-${a.conversa}-${Date.now().toString(36)}`,
    setor: 'gestao_atendimento',
    titulo: `Resposta a ${a.contato}`,
    cliente: a.clienteNome,
    inicio: `${a.contato} escreveu pelo app: “${a.pergunta.slice(0, 80)}”. Vou procurar a resposta nos dados da empresa.`,
    etapas: ['Li a mensagem e classifiquei: pergunta factual', 'Procurei nos documentos e no calendário da empresa', 'Escrevi a resposta assinada como assistente'],
    seg: 0.9,
    fim: {
      texto: `Rascunhei a resposta para ${a.contato}: “${a.texto}”`,
      cartoes: [{ tipo: 'aprovacao', id, resumo: `Responder ${a.contato} no app (assinado como assistente)`, argumentos: [{ rotulo: 'Resposta', valor: a.texto }], expiraEm: '4 h' }],
      aviso: `Resposta pronta para aprovar · ${a.clienteNome}`,
    },
  })
}

/** O que cada cartão `s10-*` faz quando uma pessoa do escritório decide. */
export function efeitoCartaoS10(loja: Loja, cartao: string, decisao: string, quem: string, conversaDe: (cliente: string, setor: SetorIntegrante, contato?: string) => string) {
  const payloads = (loja.estado.memoria[CHAVE_CARTOES] ?? {}) as Record<string, PayloadCartao>
  const p = payloads[cartao]
  const aprovou = decisao !== 'recusar'
  const editado = decisao === 'editar_e_aprovar' ? ' (com edição)' : ''
  if (!p) {
    loja.registrar(quem, `${aprovou ? 'Aprovou' : 'Recusou'} o cartão ${cartao}`)
    return
  }
  if (!aprovou) {
    if (p.tipo === 'reenvio') loja.lembrar('s10:reenvios', {}, (m: Record<string, Reenvio>) => ({ ...m, [p.docId]: { ...m[p.docId], situacao: 'recusado', em: agoraTexto() } }))
    loja.registrar(quem, `Recusou: ${p.tipo === 'reenvio' ? `reenvio de ${p.docNome}` : p.tipo === 'simulado' ? `envio do simulado de ${p.empregado}` : p.tipo === 'declaracao' ? 'envio da declaração de faturamento' : p.tipo === 'termo' ? `envio do termo "${p.titulo}"` : 'a resposta rascunhada'} (${'clienteNome' in p ? p.clienteNome : p.clienteId})`)
    loja.toast('Recusado. Nada foi ao cliente; o trabalho volta para uma pessoa decidir.')
    return
  }
  if (p.tipo === 'reenvio') {
    const doc = loja.documentos.find((d) => d.id === p.docId)
    const conversa = p.conversa ?? conversaDe(loja.clientes.find((c) => c.id === p.clienteId)?.nome ?? '', 'gestao_atendimento', p.contato)
    loja.mensagemCrm(conversa, { tipo: 'mensagem', de: 'integrante', autor: 'Atendimento', setor: 'gestao_atendimento', canal: p.canal === 'whatsapp' ? 'whatsapp' : 'email', texto: `Oi, ${p.contato.split(' ')[0]}! Reenviando ${p.docNome}: está no app, é só tocar no link (pede login). Qualquer dúvida, é por aqui.`, anexos: [{ nome: p.docNome, tipo: 'pdf' }], entrega: 'enviada' })
    if (doc) loja.ajustarDocumento(doc.id, { entregas: [...(doc.entregas ?? []), { quem: `${p.contato} (reenvio por ${p.canal === 'whatsapp' ? 'WhatsApp' : 'e-mail'})`, acao: 'enviado', quando: `hoje ${agoraTexto().slice(6)}` }] })
    loja.lembrar('s10:reenvios', {}, (m: Record<string, Reenvio>) => ({ ...m, [p.docId]: { ...m[p.docId], situacao: 'enviado', em: agoraTexto() } }))
    loja.registrar(quem, `Aprovou${editado} o reenvio de ${p.docNome} por ${p.canal === 'whatsapp' ? 'WhatsApp' : 'e-mail'} (D-17)`)
    loja.toast(`Reenviado a ${p.contato}. O farol volta a contar.`, { modulo: 'crm', aba: 'conversas', conversa }, 'Ver a conversa')
    return
  }
  if (p.tipo === 'simulado') {
    const s = simuladoRescisao(p.empregado, p.tipoRescisao, p.data)
    const doc = loja.adicionarDocumento({ nome: `Simulado de rescisão - ${p.empregado}.pdf`, clienteId: p.clienteId, pasta: P.folha, tipo: 'folha', competencia: '11/2026', origem: 'gerado_plataforma', conector: 'a1', tamanho: '96 KB', quando: HOJE, por: 'DP (integrante)', dados: { empregado: p.empregado, tipo: p.tipoRescisao, total: brl(s.total) }, forcarVisivel: true })
    loja.lembrar(`s10:pedidos:${p.clienteId}`, {}, (m: Record<string, ExtraPedido>) => ({ ...m, [p.tarefaId]: { ...m[p.tarefaId], simulado: { entregueEm: agoraTexto(), lembretes: ['D+1 agendado (19/11)', 'D+3 agendado (23/11)'] }, resultado: doc.id } }))
    loja.atualizarTarefa(p.tarefaId, { status: 'aguardando_cliente' })
    const conversa = conversaDe(p.clienteNome, 'dp', p.contato)
    loja.mensagemCrm(conversa, { tipo: 'mensagem', de: 'integrante', autor: 'DP', setor: 'dp', canal: 'app', texto: `Oi, ${p.contato.split(' ')[0]}! O simulado de rescisão de ${p.empregado} está no app, em Pedidos. Total líquido: ${brl(s.total)}. Vai seguir com a rescisão?`, anexos: [{ nome: doc.nome, tipo: 'pdf' }] })
    publicarAviso(loja, p.clienteId, { categoria: 'tarefa', prioridade: 'alta', titulo: `Simulado de rescisão pronto: ${p.empregado}`, corpo: `Total líquido ${brl(s.total)} · responda se vai seguir`, area: 'folha', destino: { tela: 'pedidos', item: p.tarefaId } })
    loja.registrar(quem, `Aprovou${editado} o envio do simulado de rescisão de ${p.empregado} (${p.clienteNome}, C2-02)`)
    loja.toast(`Simulado enviado a ${p.contato}. O DP cobra a resposta em D+1 e D+3.`)
    return
  }
  if (p.tipo === 'declaracao') {
    const doc = loja.adicionarDocumento({ nome: `Declaração de faturamento - ${p.periodo}.pdf`, clienteId: p.clienteId, pasta: P.contabil, tipo: 'relatorio', competencia: '11/2026', origem: 'gerado_plataforma', conector: 'a1', tamanho: '74 KB', quando: HOJE, por: 'Contábil (assinado pelo contador)', dados: { receita: brl(p.receita), finalidade: p.finalidade, periodo: p.periodo }, forcarVisivel: true })
    loja.lembrar(`s10:pedidos:${p.clienteId}`, {}, (m: Record<string, ExtraPedido>) => ({ ...m, [p.tarefaId]: { ...m[p.tarefaId], declaracao: { receita12m: p.receita, fontes: 'notas (XML) × PGDAS-D', assinadaEm: agoraTexto(), docId: doc.id }, resultado: doc.id } }))
    loja.atualizarTarefa(p.tarefaId, { status: 'concluida' })
    publicarAviso(loja, p.clienteId, { categoria: 'documento', prioridade: 'alta', titulo: 'Declaração de faturamento assinada', corpo: `${p.periodo}: ${brl(p.receita)} · assinatura do contador conferida`, area: 'guias', destino: { tela: 'documentos', item: doc.id } })
    loja.registrar(quem, `Assinou como contador${editado} e enviou a declaração de faturamento da ${p.clienteNome} (C2-14, D-16)`)
    loja.toast(`Declaração assinada e entregue no app da ${p.clienteNome}.`)
    return
  }
  if (p.tipo === 'termo') {
    const novo: DocAssinar = { id: `as-${Date.now().toString(36)}`, clienteId: p.clienteId, titulo: p.titulo, nivel: 'avancada', origem: 'DP · termo de ciência (C2-06)', setor: 'dp', texto: p.texto, enviadoEm: HOJE, prazo: '25/11/2026', situacao: 'aguardando', lembretes: [], codigo: 'C2-06' }
    loja.lembrar(`s10:assin:${p.clienteId}`, [], (l: DocAssinar[]) => [novo, ...l])
    publicarAviso(loja, p.clienteId, { categoria: 'pendencia', prioridade: 'alta', titulo: 'Documento para assinar', corpo: p.titulo, destino: { tela: 'assinaturas', item: novo.id } })
    loja.registrar(quem, `Aprovou${editado} o envio do termo de ciência “${p.titulo}” (${p.clienteNome}, C2-06)`)
    loja.toast(`Termo enviado ao app de ${p.contato}. O DP cobra até assinar.`)
    return
  }
  if (p.tipo === 'resposta') {
    loja.mensagemCrm(p.conversa, { tipo: 'mensagem', de: 'integrante', autor: 'Atendimento', setor: 'gestao_atendimento', canal: 'app', texto: p.texto })
    loja.statusConversa(p.conversa, 'em_atendimento')
    loja.registrar(quem, `Aprovou${editado} a resposta do assistente para ${p.contato} (${p.clienteNome})`)
    loja.toast(`Resposta enviada a ${p.contato}, assinada como assistente.`, { modulo: 'crm', aba: 'conversas', conversa: p.conversa }, 'Ver a conversa')
  }
}
