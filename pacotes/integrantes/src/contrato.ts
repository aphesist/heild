import { z } from 'zod'
import {
  exigeCartaoSempre,
  metadadosDoCatalogo,
  type Classe,
  type Ferramenta,
  type Procedimento,
} from '@heild/processos'

/**
 * O contrato padrão de integrante (decisões 1 a 4 do Enzo, docs/integrantes/DECISOES.md).
 *
 * Um integrante é uma CONFIGURAÇÃO compartilhada pelo setor: identidade, procedimentos, o pacote
 * de ferramentas permitidas, papéis de modelo, limites e o limiar de confiança. Não guarda contexto:
 * cada pedido roda numa execução própria do motor da B2 (vinte pessoas são vinte execuções).
 * O integrante não improvisa fluxo: só inicia procedimentos do seu pacote (decisão 2).
 */

/** Os setores do pacote Contábil (Fundações 4.1). "Gestão e Atendimento" é um setor só. */
export const SetorContabil = z.enum(['societario', 'fiscal', 'dp', 'contabil', 'gestao_atendimento'])
export type SetorContabil = z.infer<typeof SetorContabil>

/** Os anexos que o chat manda com o pedido: sempre ids, nunca nomes (AGENTICO 3, regra 3). */
export const Anexos = z
  .object({
    cliente_id: z.string().min(1).max(80).optional(),
    documento_id: z.string().min(1).max(80).optional(),
    exercicio: z.string().regex(/^\d{4}$/).optional(),
    competencia: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).optional(),
    /** A conversa do CRM (triar e repassar o número único de WhatsApp). */
    conversa_id: z.string().min(1).max(80).optional(),
  })
  .strict()
export type Anexos = z.infer<typeof Anexos>

/** O que o integrante devolve para cada execução, no formato fixo do processo (sem modelo). */
export interface Apresentacao {
  titulo: string
  texto: string
  dados?: Record<string, string | number | boolean | null>
}

/** O que o gabarito e a sombra comparam: a decisão do integrante numa execução. */
export interface ExecucaoParaDecisao {
  estado: string
  saida: Record<string, unknown> | null
  erro: { codigo?: string } | null
  /** Saída concluída de cada passo, por nome (a última tentativa). */
  passos: Record<string, Record<string, unknown> | null>
}

export interface PacoteProcedimento {
  procedimento: Procedimento
  /** Monta a entrada do procedimento a partir dos anexos do pedido. Falta campo: diz qual. */
  entrada: (anexos: Anexos) => { ok: true; entrada: Record<string, unknown> } | { ok: false; falta: (keyof Anexos)[] }
  /** Camada 1 do roteamento: expressões que, no texto do pedido, apontam este procedimento. */
  regras: RegExp[]
  /** Tipos de documento anexado que apontam este procedimento sem dúvida (camada 1). */
  tipos_documento?: string[]
  /** Tipos de documento que o procedimento aceita (filtra as opções do roteamento). Sem lista: qualquer um. */
  aceita_documentos?: string[]
  /** Descrição curta para o classificador de roteamento (estável, entra no prefixo de cache). */
  descricao_roteamento: string
  /** O formato fixo da resposta deste processo (decisão 4): escrito pelo sistema, nunca pelo modelo. */
  apresentar: (saida: Record<string, unknown>) => Apresentacao
  /** A decisão comparável (gabarito, sombra). `cartao` quando o integrante não decidiu. */
  decisao: (e: ExecucaoParaDecisao) => string
  /**
   * Limiares próprios, quando o plano define outros para este trabalho (ex.: a triagem do número
   * compartilhado roteia com 0,8 e marca incerta entre 0,6 e 0,8). Sem isto, o procedimento tem de
   * conferir a confiança com pelo menos o limiar do integrante. `fonte` diz onde o plano decide.
   */
  limiares_do_plano?: { roteia: number; incerta: number; fonte: string }
}

export interface PapeisIntegrante {
  /** Classes de modelo que os procedimentos do integrante podem usar (decisão 3). */
  operario: true
  escritor: boolean
  revisor: boolean
}

export interface DefinicaoIntegrante {
  id: string
  setor: SetorContabil
  nome: string
  /** Para o Assistente e para a tela: o que este integrante faz, em uma linha. */
  descricao: string
  papeis: PapeisIntegrante
  /** Decisão 1: limite de execuções simultâneas do setor (padrão 10); o excedente espera na fila. */
  limites: { simultaneas: number; segundo_plano_por_pessoa: number }
  /** Limiar de confiança do operário abaixo do qual o passo escala (o 0,9 do teste real é o ponto de partida). */
  limiar_confianca: number
  /** Decisão 5: antes de rodar trabalho de evento ou job, pergunta "Para quem quer rotear esta atividade?". */
  perguntar_responsavel: boolean
  /** O pacote de ferramentas permitidas (catálogo tipado + operações de processo). */
  ferramentas: string[]
  procedimentos: PacoteProcedimento[]
}

export interface Integrante extends DefinicaoIntegrante {
  /** Ferramentas resolvidas, em ordem fixa (cache). */
  pacote: Ferramenta[]
}

export type ResolverMeta = (nome: string) => Ferramenta | undefined

const parametroConfianca = (v: string) => (v.startsWith('confianca_minima') ? Number(v.split(':')[1] ?? '0.9') : null)

/**
 * Define um integrante e confere o que o CI cobraria:
 *  - cada procedimento é do setor do integrante e tem um `decisao` e um `apresentar`;
 *  - cada ferramenta do pacote existe e é do setor, transversal (`geral`) ou do registro afetado (`alvo`);
 *  - toda ferramenta citada por um passo dos procedimentos está no pacote (o integrante não usa
 *    ferramenta fora do seu pacote) e, se for irreversível, só sai com aprovação `sempre`;
 *  - todo procedimento com operário que devolve confiança a confere com limiar >= o do integrante (escalada);
 *  - todo procedimento que usa a classe revisor tem o papel ligado.
 */
export function definirIntegrante(d: DefinicaoIntegrante, resolver: ResolverMeta = metadadosDoCatalogo): Integrante {
  const erros: string[] = []
  if (!/^i-[a-z_]+$/.test(d.id)) erros.push(`id fora do padrão: ${d.id}`)
  if (d.limiar_confianca < 0.5 || d.limiar_confianca > 1) erros.push('limiar_confianca fora de [0,5; 1]')
  if (d.limites.simultaneas < 1 || d.limites.simultaneas > 50) erros.push('limites.simultaneas fora de [1; 50]')
  const pacote: Ferramenta[] = []
  for (const nome of [...new Set(d.ferramentas)].sort()) {
    const f = resolver(nome)
    if (!f) {
      erros.push(`ferramenta desconhecida no pacote: ${nome}`)
      continue
    }
    if (f.setor !== d.setor && f.setor !== 'geral' && f.setor !== 'alvo') erros.push(`ferramenta ${nome} é do setor ${f.setor}, não de ${d.setor}`)
    pacote.push(f)
  }
  const noPacote = new Set(pacote.map((f) => f.nome))
  for (const pp of d.procedimentos) {
    const p = pp.procedimento
    if (p.setor !== d.setor) erros.push(`${p.id} é do setor ${p.setor}`)
    if (!noPacote.has(p.operacao)) erros.push(`${p.id}: a operação ${p.operacao} não está no pacote`)
    let temOperario = false
    let limiar: number | null = null
    for (const passo of p.passos) {
      if (passo.tipo === 'operario') {
        // A escalada por confiança vale para o operário que devolve confiança (quem só aponta, como na ECD, é conferido por regra).
        if ('confianca' in passo.contrato.devolve.shape) temOperario = true
        if (passo.contrato.classe === 'revisor' && !d.papeis.revisor) erros.push(`${p.id}: usa revisor sem o papel`)
        if (passo.contrato.classe === 'escritor' && !d.papeis.escritor) erros.push(`${p.id}: usa escritor sem o papel`)
      }
      if (passo.tipo === 'validar') for (const v of passo.validadores) limiar = parametroConfianca(v) ?? limiar
      if (passo.tipo === 'validar' && passo.ao_falhar === 'escalar' && !d.papeis.escritor) erros.push(`${p.id}: escala ao escritor sem o papel`)
      if (passo.tipo === 'aprovacao' || passo.tipo === 'efeito' || passo.tipo === 'externo') {
        if (!noPacote.has(passo.ferramenta)) erros.push(`${p.id}.${passo.nome}: ${passo.ferramenta} fora do pacote do integrante`)
        const f = resolver(passo.ferramenta)
        if (passo.tipo === 'aprovacao' && f && exigeCartaoSempre(f) && passo.exigida !== 'sempre') erros.push(`${p.id}.${passo.nome}: ${passo.ferramenta} é irreversível`)
      }
    }
    if (pp.limiares_do_plano) {
      const l = pp.limiares_do_plano
      if (!(l.incerta >= 0.5 && l.incerta <= l.roteia && l.roteia <= 1) || !l.fonte.trim()) erros.push(`${p.id}: limiares do plano inválidos`)
    } else if (temOperario && (limiar === null || limiar < d.limiar_confianca)) erros.push(`${p.id}: confere a confiança abaixo do limiar do integrante (${limiar ?? 'nenhum'} < ${d.limiar_confianca})`)
  }
  if (erros.length) throw new Error(`Integrante ${d.id} inválido:\n- ${erros.join('\n- ')}`)
  return { ...d, pacote }
}

export type { Classe }
