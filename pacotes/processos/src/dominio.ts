/**
 * Ponte para o pacote de domínio da B1 (`@heild/dominio`): a autorização é a MESMA função que a
 * tela usa para esconder botões (R8). A B2 importa só daqui, nunca do `app/` direto.
 */
import {
  autorizar as autorizarCatalogo,
  autorizarPerfil,
  catalogo,
  type Ator,
  type Contexto,
  type Decisao,
  type Ferramenta,
  type Modulo,
  type Nivel,
  type Perfil,
} from '@heild/dominio'

export type { Ator, Contexto, Decisao, Ferramenta, Modulo, Nivel, Perfil }
export { autorizarPerfil }

const noCatalogo = new Set(catalogo.map((f) => f.nome))

export const estaNoCatalogo = (nome: string) => noCatalogo.has(nome)

export function metadadosDoCatalogo(nome: string): Ferramenta | undefined {
  return catalogo.find((f) => f.nome === nome)
}

export interface Alvo {
  setor_id?: string | null
  cliente_id?: string | null
}

/**
 * Autoriza uma ferramenta. As do catálogo do wireframe passam pela função `autorizar` dele, sem
 * cópia. As novas da B2 (operações de processo, `execucao.*`, `memoria.propor`) ainda não estão no
 * catálogo: recebem a definição e seguem a mesma ordem do 3.2 por `autorizarPerfil`, com a regra
 * do integrante (nunca excede o dono; irreversível vira cartão). Combinado com a B1: quando o
 * catálogo aceitar registro de fora (IMPLEMENTACAO.md, B2), este desvio some.
 */
export function autorizarFerramenta(ctx: { ator: Ator }, f: Ferramenta, alvo: Alvo = {}, nivel?: Nivel): Decisao {
  // A origem não entra na decisão (só no evento); o catálogo pede o campo.
  if (noCatalogo.has(f.nome)) return autorizarCatalogo({ ator: ctx.ator, origem: 'job' }, f.nome, alvo, nivel)
  const a = ctx.ator
  if (a.tipo === 'sistema') return { permitido: true, nivel: f.nivel }
  if (a.tipo === 'pessoa_cliente') {
    if (!f.exposta_ao_cliente) return { permitido: false, motivo: 'Isso não está disponível no app do cliente.' }
    return { permitido: true, nivel: f.nivel }
  }
  if (a.tipo === 'integrante') {
    if (a.dono) {
      const d = autorizarPerfil(a.dono, f, alvo, nivel)
      if (!d.permitido) return d
    }
    if (f.irreversivel || f.exige_aprovacao === 'sempre' || f.exige_aprovacao === 'se_integrante') return { permitido: true, nivel: f.nivel, aprovacao: true, motivo: 'Uma pessoa precisa aprovar.' }
    return { permitido: true, nivel: f.nivel }
  }
  return autorizarPerfil(a.perfil, f, alvo, nivel ?? f.nivel)
}

/** Exige aprovação humana para um integrante ou um job, qualquer que seja a lista do escritório. */
export function exigeCartaoSempre(f: Pick<Ferramenta, 'irreversivel' | 'exige_aprovacao'>) {
  return Boolean(f.irreversivel) || f.exige_aprovacao === 'sempre'
}
