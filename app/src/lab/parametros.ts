/**
 * Parâmetros do UI Lab (#/lab/ui): cada combinação tem um endereço, para o
 * QA (scripts/ui-lab-qa.cjs) abrir direto e para a pessoa mandar o link.
 *   #/lab/ui/<ficha>?estado=&itens=&texto=&tamanho=&tema=&modo=&densidade=&isolado=1
 * `isolado=1` mostra só a peça (é o que vai dentro do quadro de largura e o
 * que o QA fotografa); sem ele, a ficha abre com os controles.
 */

export const estados = ['padrao', 'carregando', 'vazio', 'erro', 'desabilitado', 'selecionado', 'hover', 'foco', 'so-leitura', 'sem-permissao'] as const
export type EstadoLab = (typeof estados)[number]
export const rotuloEstado: Record<EstadoLab, string> = {
  padrao: 'Padrão',
  carregando: 'Carregando',
  vazio: 'Vazio',
  erro: 'Erro',
  desabilitado: 'Desabilitado',
  selecionado: 'Selecionado',
  hover: 'Ponteiro em cima',
  foco: 'Foco (teclado)',
  'so-leitura': 'Só leitura',
  'sem-permissao': 'Sem permissão',
}

export const quantidades = ['0', '1', 'poucos', 'muitos', 'dobro'] as const
export type QuantidadeLab = (typeof quantidades)[number]
export const rotuloQuantidade: Record<QuantidadeLab, string> = { '0': '0', '1': '1', poucos: 'Poucos (3)', muitos: 'Muitos (o teto)', dobro: 'O dobro do teto' }

export const textos = ['curto', 'longo', 'muito-longo', 'sem-espaco', 'numeros'] as const
export type TextoLab = (typeof textos)[number]
export const rotuloTexto: Record<TextoLab, string> = { curto: 'Curto', longo: 'Longo', 'muito-longo': 'Muito longo', 'sem-espaco': 'Palavra sem espaço', numeros: 'Números grandes' }

export const tamanhos = ['P', 'M', 'G', 'L', 'XL', 'livre'] as const
export type TamanhoLab = (typeof tamanhos)[number]

export const larguras = [390, 768, 1024, 1440, 1920] as const

export const densidades = ['padrao', 'grande'] as const
export type DensidadeLab = (typeof densidades)[number]
/** Base 16px; "tela grande" é a base de 18px que o design system dá acima de 2400 × 1300 (tipografia.md). */
export const rotuloDensidade: Record<DensidadeLab, string> = { padrao: 'Padrão (16px)', grande: 'Tela grande (18px)' }

export interface ParamsLab {
  ficha: string
  estado: EstadoLab
  itens: QuantidadeLab
  texto: TextoLab
  tamanho: TamanhoLab
  /** Variante da ficha (aba do Painel, tom do selo...), quando a ficha tem. */
  variante: string
  /** Cenário de dados (semente/cenario.ts: `i15.tl.ve.dv.oa`); vazio = os dados de exemplo. */
  cenario: string
  tema: string
  modo: 'claro' | 'escuro'
  densidade: DensidadeLab
  isolado: boolean
}

export const padraoParams: Omit<ParamsLab, 'ficha'> = { estado: 'padrao', itens: 'poucos', texto: 'curto', tamanho: 'M', variante: '', cenario: '', tema: '', modo: 'claro', densidade: 'padrao', isolado: false }

const de = <T extends string>(lista: readonly T[], v: string | null, padrao: T): T => (v && (lista as readonly string[]).includes(v) ? (v as T) : padrao)

export function lerParams(hash: string): ParamsLab {
  const m = hash.replace(/^#/, '').match(/^\/lab\/ui(?:\/([^?]*))?(?:\?(.*))?$/)
  const q = new URLSearchParams(m?.[2] ?? '')
  return {
    ficha: decodeURIComponent(m?.[1] ?? ''),
    estado: de(estados, q.get('estado'), padraoParams.estado),
    itens: de(quantidades, q.get('itens'), padraoParams.itens),
    texto: de(textos, q.get('texto'), padraoParams.texto),
    tamanho: de(tamanhos, q.get('tamanho'), padraoParams.tamanho),
    variante: q.get('variante') ?? '',
    cenario: q.get('cenario') ?? '',
    tema: q.get('tema') ?? '',
    modo: q.get('modo') === 'escuro' ? 'escuro' : 'claro',
    densidade: de(densidades, q.get('densidade'), padraoParams.densidade),
    isolado: q.get('isolado') === '1',
  }
}

export function hashDe(p: Partial<ParamsLab> & { ficha: string }): string {
  const q = new URLSearchParams()
  const t = { ...padraoParams, ...p }
  for (const k of ['estado', 'itens', 'texto', 'tamanho', 'variante', 'cenario', 'tema', 'modo', 'densidade'] as const) if (t[k] && t[k] !== padraoParams[k]) q.set(k, t[k])
  if (t.isolado) q.set('isolado', '1')
  const s = q.toString()
  return `#/lab/ui${p.ficha ? `/${p.ficha}` : ''}${s ? `?${s}` : ''}`
}

/* ---------- Geradores: o mesmo conteúdo para toda ficha ---------- */

/** Quantos itens cada quantidade dá, para um teto (o "muitos" de cada peça). */
export function quantos(q: QuantidadeLab, teto = 12): number {
  return q === '0' ? 0 : q === '1' ? 1 : q === 'poucos' ? 3 : q === 'muitos' ? teto : teto * 2
}

const frases = ['Conferir a guia do DAS de outubro', 'Apurar o fator R da Padaria Pão Quente', 'Enviar o balancete de setembro', 'Cobrar o extrato bancário de outubro', 'Transmitir a DCTFWeb da competência', 'Revisar a folha de pagamento', 'Emitir a certidão negativa federal', 'Conciliar 41 de 44 lançamentos']
const clientes = ['Padaria Pão Quente ME', 'Metalúrgica Andrade Ltda', 'Clínica Sorriso Ltda', 'Transportes Rota Sul S.A.', 'Loja Bela Vista Eireli', 'Construtora Horizonte Ltda']

/** Texto do tipo pedido, variando pelo índice (`i`) para a lista não ficar com linhas iguais. */
export function textoDe(tipo: TextoLab, i = 0, papel: 'titulo' | 'detalhe' | 'rotulo' = 'titulo'): string {
  const base = papel === 'detalhe' ? clientes[i % clientes.length] : papel === 'rotulo' ? ['em dia', 'atrasada', 'aguard. cliente'][i % 3] : frases[i % frases.length]
  switch (tipo) {
    case 'curto':
      return papel === 'titulo' ? base.split(' ').slice(0, 3).join(' ') : base.split(' ')[0]
    case 'longo':
      return papel === 'rotulo' ? `${base} há 12 dias` : `${base} com a folha, o faturamento declarado e as notas de entrada`
    case 'muito-longo':
      return papel === 'rotulo' ? `${base} há 12 dias, sem retorno do responsável pela empresa` : `${base} com a folha, o faturamento declarado, as notas de entrada e saída, os extratos dos três bancos e o relatório de retenções de ISS de todos os municípios onde a empresa presta serviço`
    case 'sem-espaco':
      return papel === 'rotulo' ? 'aguardandoclienteháduassemanas' : 'conferiraguiadodasdeoutubrocomafolhaeofaturamentodeclarado_12.345.678/0001-90'
    case 'numeros':
      return papel === 'rotulo' ? 'R$ 1.234.567,89' : `${base} · R$ 12.345.678.901,23 · 123.456.789 itens`
  }
}

/** Valor em reais do tamanho pedido (números grandes = bilhões). */
export function valorDe(tipo: TextoLab, i = 0): number {
  return tipo === 'numeros' ? 12345678901.23 + i : [1250, 34990.5, 980, 15420.75][i % 4]
}
