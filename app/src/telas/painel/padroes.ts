import type { ItemGrade, TamanhoWidget } from '@/components/widgets/tipos'

/**
 * Arranjo padrão de cada aba do Painel (com cliente e em carteira). A ordem é a
 * prioridade da tarefa do setor (o que pede decisão, o que se trabalha, o que
 * se consulta) e o tamanho é o que o conteúdo e a tarefa pedem
 * (PADRAO_DE_INTERFACE.md, 3). A altura vem do conteúdo e a grade empacota na
 * ordem: buraco que sobrar se corrige aqui, trocando a ordem ou o tamanho,
 * nunca esticando o widget.
 */
const a = (lista: string): ItemGrade[] =>
  lista
    .trim()
    .split(/\s+/)
    .map((x) => {
      const [id, tamanho] = x.split(':')
      return { id, tamanho: tamanho as TamanhoWidget }
    })

export const padroes: Record<string, ItemGrade[]> = {
  societario: a('ciclo:L pendencias:M certificados:M ficha:G pessoas:G acoes:G contrato:G processos:G comunicacoes:G acessos:XL entrega:M app:G obrigacoes-setor:G repetidos:M documentos:M tarefas:G relatorios:M'),
  obrigacoes: a('faixas:L pendencias:M calendario:XL riscos:M prerequisitos:G eventuais:G comprovacao:M prorrogacoes:G acoes:G tarefas:G documentos:M relatorios:M'),
  notas: a('fluxos:L manifestacao:G configuracao:G tributaria:G completude:G eventos:G pendencias:M acoes:G atendimento:G lotes:G entrada-saida:G obrigacoes-setor:G tarefas:G documentos:M relatorios:M'),
  'fiscal-simples': a('simples:G caixas:G declaracoes:G conferencia:G guias:XL obrigacoes-setor:G situacao:M pendencias:M certidoes:G comunicacao:G parcelamentos:M creditos:M pedir:M acoes:G tarefas:G documentos:G relatorios:M'),
  fiscal: a('mei:G irpf:XL carne-leao:G caixas:G declaracoes:G apuracoes:XL conferencia:G obrigacoes-setor:G guias:XL situacao:M parcelamentos:M certidoes:G reinf:M pendencias:M comunicacao:G creditos:M pedir:M acoes:G tarefas:G documentos:G relatorios:M'),
  dp: a('dp-visao:L obrigacoes-setor:M admissoes:XL rescisoes:XL simulados:G quadro:M folha:G esocial:G guias:XL ferias:G convencoes:G det:M termos:G recalculo:M fase45:M dp-vazio:XL pendencias:M acoes:G tarefas:XL documentos:M relatorios:M'),
  contabil: a('fechamento:L deve-chegar:G triagem:G classificacao:XL lucros:XL conciliacao:G core:G relatorios-cliente:XL travas:G fila-assinatura:G declaracao:G livro-caixa:G obrigacoes-setor:G pendencias:M fase4:G pedir:M acoes:G tarefas:G documentos:M relatorios:M'),
  consultoria: a('perguntas:XL vigilancia:G pareceres:G segunda-opiniao:G cct:G perguntar:M planejamento:XL reforma:XL recuperacao:G entrada-saida:G pendencias:M pedir:M acoes:G tarefas:G documentos:M relatorios:M'),
  gestao: a('produtividade:G ia:G equipe:G permissoes:XL criticas:M rotinas:G pauta:G processos:XL catalogo:XL migracao:G compliance:G auditoria:XL atalhos:M relatorios:M fase3:M acoes:G tarefas:XL'),
  'societario-carteira': a('carteira-certificados:XL carteira-estados:G carteira-acessos:XL carteira-licencas:G obrigacoes-setor:G acoes:G tarefas:G relatorios:G'),
  'obrigacoes-carteira': a('faixas:L riscos:M carteira-semana:XL prerequisitos:G prorrogacoes:G eventuais:G acoes:G tarefas:G relatorios:M'),
  'notas-carteira': a('carteira-captura:XL manifestacao:M carteira-eventos:G obrigacoes-setor:G acoes:G tarefas:XL relatorios:M'),
  'fiscal-carteira': a('carteira-fiscal:XL guias:G caixas:G obrigacoes-setor:G irpf-carteira:G pedir:M relatorios:M acoes:G tarefas:XL'),
  'dp-carteira': a('dp-visao:L obrigacoes-setor:M carteira-folha:XL carteira-rescisao:XL relatorios:M acoes:G tarefas:XL'),
  'contabil-carteira': a('kanban:XL minha-fila:G fila-assinatura:G carteira-fechamento:XL obrigacoes-setor:G relatorios:M acoes:G tarefas:XL pedir:M'),
  'consultoria-carteira': a('carteira-consultoria:XL avulsos:G pedir:G acoes:G tarefas:XL relatorios:G'),
}

/** Chave do arranjo: a Gestão é igual com ou sem cliente; a Fiscal muda para cliente do Simples. */
export function chavePadrao(abaId: string, carteira: boolean, simples: boolean) {
  if (abaId === 'gestao') return 'gestao'
  if (carteira) return `${abaId}-carteira`
  if (abaId === 'fiscal' && simples) return 'fiscal-simples'
  return abaId
}
