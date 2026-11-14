import type { ItemGrade, TamanhoWidget } from '@/components/widgets/tipos'

/**
 * Arranjo padrão de cada aba do Painel (com cliente e em carteira). Feito para
 * fechar a grade de 6 colunas sem buracos (a ordem já conta com o
 * `grid-auto-flow: dense`), na ordem de importância do setor, com tamanhos
 * que cabem o conteúdo de exemplo. Assimétrico de propósito.
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
  societario: a('ciclo:L pendencias:M certificados:M ficha:G pessoas:G acoes:G contrato:M acessos:M processos:G obrigacoes-setor:G documentos:M tarefas:G relatorios:M'),
  obrigacoes: a('calendario:XL riscos:G pendencias:M prerequisitos:G acoes:G comprovacao:M prorrogacoes:G tarefas:G documentos:M relatorios:M'),
  notas: a('fluxos:L manifestacao:M tributaria:G completude:G configuracao:G pendencias:M acoes:G lotes:G obrigacoes-setor:G tarefas:G documentos:M relatorios:M'),
  'fiscal-simples': a('simples:G caixas:G declaracoes:G conferencia:G guias:XL obrigacoes-setor:G situacao:M pendencias:M certidoes:G comunicacao:G parcelamentos:M creditos:M pedir:M acoes:G tarefas:G documentos:G relatorios:M'),
  fiscal: a('mei:G irpf:XL carne-leao:G caixas:G declaracoes:G apuracoes:XL conferencia:G obrigacoes-setor:G guias:XL situacao:M parcelamentos:M certidoes:G reinf:M pendencias:M comunicacao:G creditos:M pedir:M acoes:G tarefas:G documentos:G relatorios:M'),
  dp: a('admissoes:XL quadro:M rescisoes:M pendencias:M folha:G esocial:G ferias:M acoes:G tarefas:G documentos:M relatorios:M'),
  contabil: a('fechamento:L deve-chegar:G triagem:G classificacao:XL lucros:XL conciliacao:G core:G relatorios-cliente:XL travas:G fila-assinatura:G declaracao:G livro-caixa:G obrigacoes-setor:G pendencias:M fase4:G pedir:M acoes:G tarefas:G documentos:M relatorios:M'),
  consultoria: a('perguntas:XL vigilancia:G pareceres:G segunda-opiniao:G cct:G perguntar:M planejamento:XL reforma:XL recuperacao:G entrada-saida:G pendencias:M pedir:M acoes:G tarefas:G documentos:M relatorios:M'),
  gestao: a('produtividade:G ia:G equipe:M permissoes:XL migracao:XL acoes:G tarefas:G relatorios:M'),
  'societario-carteira': a('carteira-certificados:XL carteira-estados:G obrigacoes-setor:G acoes:G tarefas:G relatorios:G'),
  'obrigacoes-carteira': a('carteira-semana:XL riscos:M prerequisitos:M prorrogacoes:M acoes:G tarefas:G relatorios:M'),
  'notas-carteira': a('carteira-captura:XL manifestacao:M obrigacoes-setor:G acoes:G tarefas:XL relatorios:M'),
  'fiscal-carteira': a('carteira-fiscal:XL guias:G caixas:G obrigacoes-setor:G irpf-carteira:G pedir:M relatorios:M acoes:G tarefas:XL'),
  'dp-carteira': a('carteira-folha:XL acoes:G tarefas:XL relatorios:G'),
  'contabil-carteira': a('kanban:XL minha-fila:G fila-assinatura:G carteira-fechamento:XL obrigacoes-setor:G pedir:M relatorios:M acoes:G tarefas:XL'),
  'consultoria-carteira': a('carteira-consultoria:XL avulsos:G pedir:G acoes:G tarefas:XL relatorios:G'),
}

/** Chave do arranjo: a Gestão é igual com ou sem cliente; a Fiscal muda para cliente do Simples. */
export function chavePadrao(abaId: string, carteira: boolean, simples: boolean) {
  if (abaId === 'gestao') return 'gestao'
  if (carteira) return `${abaId}-carteira`
  if (abaId === 'fiscal' && simples) return 'fiscal-simples'
  return abaId
}
