import type { Id, Nivel } from '../modelo/entidades'
import { ferramenta, type Ferramenta } from './ferramentas'
import type { Contexto, Perfil } from './perfil'

/**
 * A função única de autorização (Fundações 3.2 e 3.4). Toda escrita dos
 * repositórios passa por aqui; a tela usa a mesma função (pelo `usePode`) para
 * esconder o que a pessoa não pode. A RLS do Supabase é a segunda barreira, só
 * por escritório.
 */

export type Decisao =
  | { permitido: true; nivel: Nivel; aprovacao?: false }
  /** O integrante prepara; uma pessoa decide (cartão de aprovação). */
  | { permitido: true; nivel: Nivel; aprovacao: true; motivo: string }
  | { permitido: false; motivo: string }

export interface Alvo {
  setor_id?: Id | null
  cliente_id?: Id | null
}

const ordemNivel: Record<Nivel, number> = { ler: 0, rascunhar: 1, executar: 2 }
const cabe = (pedido: Nivel, maximo: Nivel) => ordemNivel[pedido] <= ordemNivel[maximo]
const ordemPapel = { colaborador: 0, gestor: 1, administrador: 2 } as const

/** Escopo efetivo de uma pessoa para uma ferramenta, na ordem do 3.2 (a primeira regra que decide encerra). */
export function autorizarPerfil(p: Perfil, f: Ferramenta, alvo: Alvo = {}, nivel: Nivel = f.nivel): Decisao {
  // 1. Módulo fora da assinatura: "módulo não contratado", nunca "sem permissão".
  if (f.modulo !== 'plataforma' && !p.modulos.includes(f.modulo)) return { permitido: false, motivo: 'Módulo não contratado na assinatura do escritório.' }
  // 2. Administrador: tudo que a assinatura libera. Exceções não se aplicam.
  if (p.papel === 'administrador') return { permitido: true, nivel: f.nivel }
  // 8 (antecipada). Papel mínimo da ferramenta.
  if (f.papel_minimo && ordemPapel[p.papel] < ordemPapel[f.papel_minimo]) return { permitido: false, motivo: `Só ${f.papel_minimo === 'administrador' ? 'o Administrador' : 'Gestor ou Administrador'} pode fazer isso.` }
  const setor = f.setor === 'alvo' ? (alvo.setor_id ?? null) : f.setor === 'geral' ? null : f.setor
  // 4 e 5. Exceções por tela.
  const telas = [f.tela, setor ? `aba.${setor}` : null].filter(Boolean)
  const excecao = p.excecoes.find((x) => telas.includes(x.tela))
  if (excecao?.efeito === 'bloquear') return { permitido: false, motivo: `Bloqueado para a sua conta${excecao.motivo ? `: ${excecao.motivo}` : '.'}` }
  if (excecao?.efeito === 'liberar') {
    const max = excecao.nivel_max ?? 'executar'
    return cabe(nivel, max) ? { permitido: true, nivel: max } : { permitido: false, motivo: `Sua conta só pode ${max === 'ler' ? 'ver' : 'preparar'} aqui.` }
  }
  // 6. Vínculo ao setor.
  if (setor) {
    const vinculo = p.vinculos.find((v) => v.setor === setor)
    if (!vinculo) return { permitido: false, motivo: 'Sua conta não tem esse setor.' }
    if (f.gestao && vinculo.modo !== 'gestao') return { permitido: false, motivo: 'Só quem gere o setor pode fazer isso.' }
  } else if (f.gestao && !p.vinculos.some((v) => v.modo === 'gestao')) return { permitido: false, motivo: 'Só quem gere um setor pode fazer isso.' }
  // 7. Carteira.
  if (p.carteira_ligada && alvo.cliente_id && !p.carteira.includes(alvo.cliente_id)) return { permitido: false, motivo: 'Esse cliente não está na sua carteira.' }
  return { permitido: true, nivel: f.nivel }
}

/** Autoriza qualquer ator (pessoa, integrante, pessoa do cliente, sistema). */
export function autorizar(ctx: Contexto, nomeFerramenta: string, alvo: Alvo = {}, nivel?: Nivel): Decisao {
  const f = ferramenta(nomeFerramenta)
  const a = ctx.ator
  if (a.tipo === 'sistema') return { permitido: true, nivel: f.nivel }
  if (a.tipo === 'pessoa_cliente') {
    // 3. Cliente: só ferramentas expostas ao cliente, só nos clientes das contas dele.
    if (!f.exposta_ao_cliente) return { permitido: false, motivo: 'Isso não está disponível no app do cliente.' }
    return { permitido: true, nivel: f.nivel }
  }
  if (a.tipo === 'integrante') {
    // Integrante nunca excede o dono (R4); irreversível vira cartão de aprovação.
    if (a.dono) {
      const d = autorizarPerfil(a.dono, f, alvo, nivel)
      if (!d.permitido) return d
    }
    if (f.irreversivel || f.exige_aprovacao === 'sempre' || f.exige_aprovacao === 'se_integrante') return { permitido: true, nivel: f.nivel, aprovacao: true, motivo: 'Uma pessoa precisa aprovar.' }
    return { permitido: true, nivel: f.nivel }
  }
  return autorizarPerfil(a.perfil, f, alvo, nivel ?? f.nivel)
}

export class ErroPermissao extends Error {
  readonly ferramenta: string
  constructor(ferramenta: string, motivo: string) {
    super(motivo)
    this.ferramenta = ferramenta
  }
}

export class ErroRegra extends Error {}
