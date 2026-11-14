import { useMemo } from 'react'
import { fichas, type ContatoCliente, type FichaCliente, type PreferenciaEntrega, type ServicoFicha } from '@/ambiente/clientes'
import { banco } from '@/nucleo/banco'
import { useTabela } from '@/nucleo/react'

/**
 * S02-T05 · Ficha do cliente: papéis por serviço, preferência de entrega
 * (C2-09) e o diff que vai para o histórico. A ficha mora em
 * `cliente.extras.ficha` (a loja grava ali); estes helpers leem dali.
 */

/** Papéis do app por serviço (06, 2.4). */
export const papeisPorServico: Record<ServicoFicha, string[]> = {
  contabil: ['sócio', 'financeiro', 'RH', 'contador interno', 'leitura', 'sem acesso'],
  bpo_financeiro: ['aprovador', 'financeiro', 'leitura', 'sem acesso'],
}

export const rotuloServicoFicha: Record<ServicoFicha, string> = { contabil: 'Contábil', bpo_financeiro: 'BPO financeiro' }

/** Papel do contato num serviço: o escolhido, ou o que sai do papel na empresa. */
export function papelNoServico(c: ContatoCliente, s: ServicoFicha): string {
  const escolhido = c.papeis?.[s]
  if (escolhido) return escolhido
  if (!c.app) return 'sem acesso'
  if (s === 'bpo_financeiro') return c.alcadaPagamento ? 'aprovador' : c.papel === 'financeiro' ? 'financeiro' : 'leitura'
  if (c.papel === 'sócio' || c.papel === 'sócia' || c.papel === 'titular') return 'sócio'
  if (c.papel === 'financeiro' || c.papel === 'diretor financeiro') return 'financeiro'
  if (c.papel === 'RH') return 'RH'
  if (c.papel === 'fiscal da empresa') return 'contador interno'
  return 'leitura'
}

export const rotuloModoEntrega: Record<PreferenciaEntrega['modo'], string> = {
  digital: 'Só digital (app e e-mail)',
  malote: 'Malote',
  motoboy: 'Motoboy',
  retirada: 'Retirada no escritório',
}

const fichaDoBanco = (clienteId: string): FichaCliente | undefined => {
  const c = banco.ler('cliente').find((x) => x.id === clienteId)
  return (c?.extras?.ficha as FichaCliente | undefined) ?? (banco.escritorioId === 'esc-andrade' ? fichas[clienteId] : undefined)
}

/**
 * Preferência de entrega do cliente (A72, C2-09), para o Societário e as
 * tarefas de entrega física. Sem preferência: digital.
 */
export function preferenciaEntrega(clienteId: string): PreferenciaEntrega {
  return fichaDoBanco(clienteId)?.entrega ?? { modo: 'digital' }
}

/** Frase curta: "Malote com protocolo · às sextas". */
export function resumoEntrega(p: PreferenciaEntrega): string {
  if (p.modo === 'digital') return rotuloModoEntrega.digital
  return [rotuloModoEntrega[p.modo], p.protocolo ? 'com protocolo de devolução' : 'sem protocolo', p.rotina].filter(Boolean).join(' · ')
}

/** A mesma preferência, na tela (re-renderiza quando a ficha muda). */
export function usePreferenciaEntrega(clienteId?: string): PreferenciaEntrega | undefined {
  const clientes = useTabela('cliente')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => (clienteId ? preferenciaEntrega(clienteId) : undefined), [clientes, clienteId])
}

/* ---------- Diff para o histórico ---------- */

const listaAssuntos = (a: string[]) => a.map((x) => x.replace('documentos_pendentes', 'documentos').replace('honorarios', 'honorários').replace('societario', 'societário')).join(', ') || 'nada'

/** O que mudou entre duas versões da ficha, em frases curtas (vai para o evento `ficha.atualizar`). */
export function diffFicha(antes: FichaCliente, depois: FichaCliente, servicos: ServicoFicha[]): string[] {
  const m: string[] = []
  const nomesAntes = antes.contatos.map((c) => c.nome)
  const nomesDepois = depois.contatos.map((c) => c.nome)
  for (const c of depois.contatos) {
    const a = antes.contatos.find((x) => x.nome === c.nome)
    if (!a) {
      m.push(`incluiu o contato ${c.nome} (${c.papel})`)
      continue
    }
    if (a.papel !== c.papel) m.push(`${c.nome}: papel ${a.papel} → ${c.papel}`)
    if ((a.whatsapp ?? '') !== (c.whatsapp ?? '')) m.push(`${c.nome}: WhatsApp ${a.whatsapp || 'vazio'} → ${c.whatsapp || 'vazio'}`)
    if ((a.email ?? '') !== (c.email ?? '')) m.push(`${c.nome}: e-mail ${a.email || 'vazio'} → ${c.email || 'vazio'}`)
    if (listaAssuntos(a.assuntos) !== listaAssuntos(c.assuntos)) m.push(`${c.nome}: assuntos ${listaAssuntos(a.assuntos)} → ${listaAssuntos(c.assuntos)}`)
    if (!!a.app !== !!c.app) m.push(`${c.nome}: ${c.app ? 'passou a usar' : 'deixou de usar'} o app`)
    if (!!a.principal !== !!c.principal && c.principal) m.push(`${c.nome} virou o contato principal`)
    for (const s of servicos) if (papelNoServico(a, s) !== papelNoServico(c, s)) m.push(`${c.nome}: papel no ${rotuloServicoFicha[s]} ${papelNoServico(a, s)} → ${papelNoServico(c, s)}`)
  }
  for (const n of nomesAntes) if (!nomesDepois.includes(n)) m.push(`tirou o contato ${n}`)
  const setores = new Set([...Object.keys(antes.responsaveis), ...Object.keys(depois.responsaveis)])
  for (const s of setores) {
    const a = antes.responsaveis[s as keyof FichaCliente['responsaveis']]
    const d = depois.responsaveis[s as keyof FichaCliente['responsaveis']]
    if ((a ?? '') !== (d ?? '')) m.push(`responsável ${s}: ${a ?? 'padrão do setor'} → ${d ?? 'padrão do setor'}`)
  }
  const sv = new Set([...Object.keys(antes.servicos ?? {}), ...Object.keys(depois.servicos ?? {})])
  for (const k of sv) if ((antes.servicos?.[k] ?? 'disponivel') !== (depois.servicos?.[k] ?? 'disponivel')) m.push(`serviço ${k}: ${antes.servicos?.[k] ?? 'disponivel'} → ${depois.servicos?.[k] ?? 'disponivel'}`)
  const ea = antes.entrega ? resumoEntrega(antes.entrega) : rotuloModoEntrega.digital
  const ed = depois.entrega ? resumoEntrega(depois.entrega) : rotuloModoEntrega.digital
  if (ea !== ed || (antes.entrega?.observacao ?? '') !== (depois.entrega?.observacao ?? '')) m.push(`entrega: ${ea} → ${ed}`)
  return m
}

/* ---------- Validação na hora ---------- */

export const emailValido = (v?: string) => !v || /^\S+@\S+\.\S+$/.test(v.trim())
/** Telefone com DDD (10 ou 11 dígitos), com ou sem +55. */
export const telefoneValido = (v?: string) => {
  if (!v) return true
  const d = v.replace(/\D/g, '')
  return d.length === 10 || d.length === 11 || ((d.length === 12 || d.length === 13) && d.startsWith('55'))
}
