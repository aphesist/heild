import { useMemo } from 'react'
import { escritorio as padrao, type SetorCfg } from '@/dados/configuracoes'
import type { CodigoSetor, Setor } from '@/nucleo/modelo/entidades'
import { useTabela } from '@/nucleo/react'
import { repos } from '@/nucleo/repositorios'

/**
 * Configurações › Escritório sobre o banco: o escritório e os setores no
 * formato que a tela já usava, gravando nas entidades `escritorio` e `setor`
 * (com permissão de Administrador e evento).
 */

export type EscritorioCfg = typeof padrao

export function useEscritorioCfg(): [EscritorioCfg, (v: EscritorioCfg | ((x: EscritorioCfg) => EscritorioCfg)) => void] {
  const linha = useTabela('escritorio')[0]
  const e = useMemo<EscritorioCfg>(() => {
    if (!linha) return padrao
    const c = linha.configuracao
    return {
      razaoSocial: linha.razao_social,
      nomeFantasia: linha.nome_fantasia,
      cnpj: linha.cnpj,
      crc: linha.crc ?? '',
      fuso: linha.fuso_horario,
      inatividadeMin: linha.inatividade_min,
      carteiraLigada: linha.carteira_ligada,
      segundoFator: c.segundo_fator ?? padrao.segundoFator,
      modoBpo: linha.modo_bpo,
      resumoHora: (c.resumo_hora as string | undefined) ?? padrao.resumoHora,
      silencio: (c.silencio as EscritorioCfg['silencio'] | undefined) ?? padrao.silencio,
    }
  }, [linha])
  const definir = (v: EscritorioCfg | ((x: EscritorioCfg) => EscritorioCfg)) => {
    if (!linha) return
    const n = typeof v === 'function' ? v(e) : v
    repos.escritorios.atualizar(linha.id, {
      razao_social: n.razaoSocial,
      nome_fantasia: n.nomeFantasia,
      cnpj: n.cnpj,
      crc: n.crc,
      fuso_horario: n.fuso,
      inatividade_min: n.inatividadeMin,
      carteira_ligada: n.carteiraLigada,
      modo_bpo: n.modoBpo,
      configuracao: { ...linha.configuracao, segundo_fator: n.segundoFator, resumo_hora: n.resumoHora, silencio: n.silencio },
    })
  }
  return [e, definir]
}

const setorParaCfg = (s: Setor, nomes: Map<string, string>): SetorCfg => ({
  codigo: s.codigo as SetorCfg['codigo'],
  nomePadrao: s.nome_padrao,
  nomeExibido: s.nome_exibido,
  temEquipe: s.tem_equipe,
  ativo: s.ativo,
  ...(s.responsavel_padrao_id ? { responsavel: nomes.get(s.responsavel_padrao_id) } : {}),
  ...(s.numero_whatsapp ? { numero: s.numero_whatsapp } : {}),
})

export function useSetoresCfg(): [SetorCfg[], (v: SetorCfg[] | ((x: SetorCfg[]) => SetorCfg[])) => void] {
  const linhas = useTabela('setor')
  const usuarios = useTabela('usuario')
  const setores = useMemo(() => {
    const nomes = new Map(usuarios.map((u) => [u.id, u.nome]))
    return linhas.map((s) => setorParaCfg(s, nomes))
  }, [linhas, usuarios])
  const definir = (v: SetorCfg[] | ((x: SetorCfg[]) => SetorCfg[])) => {
    const lista = typeof v === 'function' ? v(setores) : v
    for (const s of lista) {
      const atual = linhas.find((l) => l.codigo === s.codigo)
      const patch: Partial<Setor> = { nome_exibido: s.nomeExibido, ativo: s.ativo, numero_whatsapp: s.numero, responsavel_padrao_id: usuarios.find((u) => u.nome === s.responsavel)?.id ?? null }
      if (!atual) repos.setores.criar({ id: s.codigo, codigo: s.codigo as CodigoSetor, nome_padrao: s.nomePadrao, tem_equipe: s.temEquipe, ...patch, nome_exibido: s.nomeExibido, ativo: s.ativo })
      else if (Object.entries(patch).some(([k, x]) => (atual as unknown as Record<string, unknown>)[k] !== x && !(x === undefined && (atual as unknown as Record<string, unknown>)[k] == null))) repos.setores.atualizar(atual.id, patch, { texto: `Configurou o setor ${s.nomeExibido}` })
    }
  }
  return [setores, definir]
}
