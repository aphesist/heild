import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLoja } from '@/ambiente/loja'
import type { LinhaSuposicao, QualquerValor } from '@/components/kit/valor-editavel'
import { HOJE_DEMO } from '@/dados/obrigacoes-setor'
import { COMPETENCIA } from '@/dados/painel-s03'
import { suporDoTexto, type CampoSuposicao, type Suposicao } from '@/lib/suposicoes'
import { configDoCampo, contextoSuposicoes } from '@/lib/suposicoes-heild'
import { suporComIa, type PadroesSuposicao } from '@/lib/suposicoes-ia'

const ORDEM: CampoSuposicao[] = ['cliente', 'competencia', 'setor', 'valor', 'prazo']

/**
 * Feedforward de um pedido (fase 6): a regra supõe na hora, enquanto a pessoa
 * escreve; o serviço simulado de IA completa o que faltou um instante depois;
 * o que a pessoa corrigir na faixa vale até o pedido ser enviado.
 */
export function useSuposicoes(texto: string, padroes: PadroesSuposicao = {}, ativo = true) {
  const loja = useLoja()
  const ctx = useMemo(() => contextoSuposicoes(loja.clientes, COMPETENCIA, HOJE_DEMO), [loja.clientes])
  const curto = !ativo || texto.trim().length < 4
  const daRegra = useMemo(() => (curto ? [] : suporDoTexto(texto, ctx)), [curto, texto, ctx])
  const [daIa, setDaIa] = useState<Suposicao[]>([])
  const [carregando, setCarregando] = useState(false)
  const [daPessoa, setDaPessoa] = useState<Partial<Record<CampoSuposicao, Suposicao>>>({})
  const rodada = useRef(0)
  const { clienteId, setor } = padroes

  useEffect(() => {
    const minha = ++rodada.current
    if (curto) {
      setDaIa([])
      setCarregando(false)
      return
    }
    setCarregando(true)
    const t = window.setTimeout(() => {
      void suporComIa(texto, daRegra, ctx, { clienteId, setor }).then((extra) => {
        if (minha !== rodada.current) return
        setDaIa(extra)
        setCarregando(false)
      })
    }, 250)
    return () => window.clearTimeout(t)
  }, [curto, texto, daRegra, ctx, clienteId, setor])

  useEffect(() => {
    if (curto) setDaPessoa({})
  }, [curto])

  const suposicoes = useMemo(() => {
    const porCampo = new Map<CampoSuposicao, Suposicao>()
    for (const s of [...daIa, ...daRegra]) if (!porCampo.has(s.campo) || s.origem === 'regra') porCampo.set(s.campo, s)
    for (const s of Object.values(daPessoa)) if (s) porCampo.set(s.campo, { ...s, trecho: porCampo.get(s.campo)?.trecho })
    return ORDEM.map((c) => porCampo.get(c)).filter(Boolean) as Suposicao[]
  }, [daRegra, daIa, daPessoa])

  const linhas: LinhaSuposicao[] = useMemo(() => suposicoes.map((s) => ({ s, ...configDoCampo(s.campo, loja.clientes) })), [suposicoes, loja.clientes])
  const mudar = useCallback((campo: CampoSuposicao, valor: QualquerValor) => setDaPessoa((x) => ({ ...x, [campo]: { campo, valor: valor as string | number, origem: 'pessoa' } })), [])
  const limpar = useCallback(() => setDaPessoa({}), [])
  return { suposicoes, linhas, carregando: carregando && !curto, mudar, limpar }
}

/** As linhas de um resumo já gravado (na resposta), com o seletor de cada campo. */
export function useLinhasSuposicao(suposicoes: Suposicao[] | undefined): LinhaSuposicao[] {
  const loja = useLoja()
  return useMemo(() => (suposicoes ?? []).map((s) => ({ s, ...configDoCampo(s.campo, loja.clientes) })), [suposicoes, loja.clientes])
}
