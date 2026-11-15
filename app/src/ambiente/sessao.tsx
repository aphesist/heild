import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { usuariosCfg, type UsuarioCfg } from '@/dados/configuracoes'
import type { Papel } from '@/nucleo/modelo/entidades'
import { permissoesDoPerfil, rotuloSetorCurto, type Contexto, type Perfil, type Permissoes } from '@/nucleo/permissoes'
import { perfilDeConta } from '@/nucleo/mapeadores'
import { definirContexto } from '@/nucleo/repositorios'
import { useTabela } from '@/nucleo/react'
import type { SetorIntegrante } from '@/theme/tipos'
import { useContas } from './loja'

/**
 * Sessão do escritório de demonstração: quem entrou e o que essa conta pode
 * ver. As permissões saem da função única das Fundações (3.4), em
 * src/nucleo/permissoes: o mesmo perfil decide o que a tela mostra e o que o
 * repositório aceita gravar.
 *
 * "Ver como" (painel da demonstração): mostra o sistema com outro papel e
 * outros setores sem trocar de pessoa, para os contadores verem o que cada um
 * enxerga. Fica marcado no topo e não muda a conta guardada.
 */

export { integrantesBpo, rotuloSetorCurto, setoresContabeis } from '@/nucleo/permissoes'
export type { IdModuloSessao, Permissoes } from '@/nucleo/permissoes'

/** Visibilidade de uma conta (a lista de Configurações e a tela de entrada usam). */
export function permissoesDe(u: UsuarioCfg, extra: Pick<Perfil, 'carteira_ligada' | 'modulos'> = { carteira_ligada: false, modulos: ['painel', 'crm', 'timesheet', 'agentes', 'consultor', 'app_cliente', 'financeiro', 'arquivos', 'bpo'] }): Permissoes {
  return permissoesDoPerfil(perfilDe(u, extra))
}

export function perfilDe(u: UsuarioCfg, extra: Pick<Perfil, 'carteira_ligada' | 'modulos'>): Perfil {
  return perfilDeConta(u, extra)
}

/** Nome do papel nas telas: Administrador, Gestor (com os setores que gere) e Membro. */
export const papelExibido = (u: UsuarioCfg) =>
  u.papel === 'administrador'
    ? 'Administradora'
    : u.papel === 'gestor'
      ? `Gestor · ${u.vinculos
          .filter((v) => v.modo === 'gestao')
          .map((v) => rotuloSetorCurto[v.setor])
          .join(', ')}`
      : 'Membro'

/** Papel e setores de faz de conta, escolhidos no painel da demonstração. */
export interface VerComo {
  papel: Papel
  vinculos: { setor: SetorIntegrante; modo: 'gestao' | 'execucao' }[]
}

interface Sessao {
  usuario: UsuarioCfg | null
  permissoes: Permissoes | null
  perfil: Perfil | null
  /** Contas do escritório (do banco). */
  contas: UsuarioCfg[]
  entrar: (id: string) => void
  sair: () => void
  verComo: VerComo | null
  definirVerComo: (v: VerComo | null) => void
}

const Ctx = createContext<Sessao | null>(null)
const CHAVE = 'heild:sessao'

/**
 * `contextoExterno`: quem age quando a tela não é do escritório (o app do
 * cliente passa a pessoa do cliente); sem ele, é a conta que entrou.
 */
export function SessaoProvider({ children, inicial = null, contextoExterno = null }: { children: ReactNode; inicial?: string | null; contextoExterno?: Contexto | null }) {
  // A conta fica guardada no navegador: recarregar a página continua na mesma pessoa.
  const [id, setId] = useState<string | null>(() => {
    if (inicial) return inicial
    try {
      return window.sessionStorage.getItem(CHAVE)
    } catch {
      return null
    }
  })
  const [verComo, setVerComo] = useState<VerComo | null>(null)
  const contas = useContas()
  const escritorio = useTabela('escritorio')[0]
  const assinatura = useTabela('assinatura')[0]
  const valor = useMemo<Sessao>(() => {
    const real = contas.find((u) => u.id === id && u.situacao === 'ativo') ?? null
    const usuario = real && verComo ? { ...real, papel: verComo.papel, vinculos: verComo.vinculos, excecoes: [] } : real
    const extra = { carteira_ligada: escritorio?.carteira_ligada ?? false, modulos: assinatura?.modulos ?? [] }
    const perfil = usuario ? perfilDe(usuario, extra) : null
    const lembrar = (v: string | null) => {
      try {
        if (v) window.sessionStorage.setItem(CHAVE, v)
        else window.sessionStorage.removeItem(CHAVE)
      } catch {
        /* sem armazenamento */
      }
    }
    return {
      usuario,
      perfil,
      permissoes: perfil ? permissoesDoPerfil(perfil) : null,
      contas,
      entrar: (novo) => {
        setVerComo(null)
        lembrar(novo)
        setId(novo)
      },
      sair: () => {
        setVerComo(null)
        lembrar(null)
        setId(null)
      },
      verComo,
      definirVerComo: setVerComo,
    }
  }, [id, contas, escritorio, assinatura, verComo])
  // Os repositórios conferem a permissão de quem está na tela.
  const ctx: Contexto | null = contextoExterno ?? (valor.perfil ? { ator: { tipo: 'pessoa', perfil: valor.perfil }, origem: 'tela' } : null)
  definirContexto(ctx)
  useEffect(() => () => definirContexto(null), [])
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>
}

/** Sessão atual. Fora do provider (stories antigas), cai na Administradora. */
export function useSessao(): Sessao & { usuario: UsuarioCfg; permissoes: Permissoes } {
  const s = useContext(Ctx)
  const u = s?.usuario ?? usuariosCfg[0]
  return { entrar: () => {}, sair: () => {}, contas: usuariosCfg, verComo: null, definirVerComo: () => {}, perfil: null, ...s, usuario: u, permissoes: s?.permissoes ?? permissoesDe(u) }
}

export function useSessaoBruta() {
  return useContext(Ctx)
}

/** Contas que conseguem entrar (ativas). */
export const contasAtivas = (contas: UsuarioCfg[]) => contas.filter((u) => u.situacao === 'ativo')
