import { useState } from 'react'
import { useAgenteS02 } from '@/ambiente/agente-s02'
import { integranteDoSetor } from '@/ambiente/fluxos'
import { useLoja } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { usePode } from '@/components/kit'
import { estadoNotas, mudarNotas } from '@/dados/s02/notas'
import { simular } from '@/servicos/simular'
import { aplicarCaptura, nomeCliente } from './acoes'

/** O que a pessoa pode fazer na aba Notas (vínculo ao setor Notas; Gestor reatribui e aprova). */
export function usePodeNotas(clienteId?: string) {
  const alvo = { setor_id: 'notas', cliente_id: clienteId ?? null }
  return {
    capturar: usePode('notas.forcar_captura', alvo),
    configurar: usePode('notas.configurar_captura', alvo),
    manifestar: usePode('notas.manifestar', alvo),
    lote: usePode('painel.acao_lote', alvo),
    tarefa: usePode('tarefa.criar', alvo),
    documento: usePode('documento.registrar', alvo),
  }
}

/**
 * Forçar captura (S02-A54; NFE-004, 006, 007): consulta simulada da
 * distribuição de DF-e e do ADN, o integrante Notas trabalha e, ao terminar,
 * a contagem e o NSU sobem. A cada duas rodadas ele acha um buraco na
 * sequência de saídas e abre a tarefa sozinho (NFE-020, faz sozinho).
 */
export function useForcarCaptura() {
  const loja = useLoja()
  const trabalhar = useAgenteS02()
  const { usuario } = useSessao()
  const [rodando, setRodando] = useState<string[]>([])
  const [erro, setErro] = useState<{ clienteId: string; texto: string } | null>(null)
  const [fonte, setFonte] = useState<string>()

  const lacuna = (clienteId: string) => {
    const nome = nomeCliente(clienteId)
    const id = loja.criarTarefa({ codigo: 'NFE-020', titulo: 'Conferir buraco na sequência de saídas (nº 9.131 a 9.132)', cliente: nome, setor: 'notas', prazo: '22/11', status: 'a_fazer', responsavel: { tipo: 'integrante', nome: 'Notas', setor: 'notas' } })
    mudarNotas(clienteId, (e) => ({ ...e, completude: [{ id: `cp-lac-${Date.now()}`, item: 'Buraco na sequência de saídas', valor: 'nº 9.131 a 9.132 · tarefa aberta pelo integrante', situacao: 'atencao', atividade: 'NFE-020', tarefa: id }, ...e.completude] }), `Notas achou um buraco na sequência de saídas de ${nome} e abriu a tarefa NFE-020 sozinho`)
    loja.avisar({ para: [usuario.id], tipo: 'sistema', setor: 'notas', titulo: `Buraco na sequência de saídas · ${nome}`, detalhe: 'nº 9.131 a 9.132 não chegaram; abri a tarefa e pedi ao cliente', destino: { modulo: 'painel', aba: 'notas', cliente: clienteId, tarefa: id } })
  }

  const forcar = async (clienteIds: string[], origem: 'forçada' | 'rotina 03:00' | 'lote' = 'forçada') => {
    setErro(null)
    const travados = clienteIds.filter((c) => estadoNotas(c).captura.situacao === 'parada')
    const livres = clienteIds.filter((c) => !travados.includes(c) && !estadoNotas(c).pf && estadoNotas(c).captura.situacao !== 'sem_configuracao')
    if (clienteIds.length === 1 && travados.length) {
      setErro({ clienteId: clienteIds[0], texto: `A SEFAZ recusou a conexão: ${estadoNotas(clienteIds[0]).captura.motivo}. Renove no Societário e tente de novo.` })
      return
    }
    if (clienteIds.length === 1 && estadoNotas(clienteIds[0]).captura.situacao === 'sem_configuracao') {
      setErro({ clienteId: clienteIds[0], texto: 'Cadastre a configuração de captura (CNPJs, inscrições e certificado) antes de capturar.' })
      return
    }
    setRodando(clienteIds)
    try {
      const r = await simular('SEFAZ · distribuição de DF-e e ADN (API-10, API-11)', () => livres.map((c, i) => ({ c, novos: 3 + ((estadoNotas(c).rodadas.length * 5 + i) % 9) })), { latencia: [700, 1300] })
      setFonte(r.fonte)
      const nomes = livres.map(nomeCliente)
      const total = r.dados.reduce((s, x) => s + x.novos, 0)
      const comLacuna = r.dados.filter((x) => origem !== 'lote' && estadoNotas(x.c).rodadas.length % 2 === 1).map((x) => x.c)
      trabalhar({
        setor: 'notas',
        titulo: origem === 'rotina 03:00' ? 'Rotina diária da captura (NFE-004)' : livres.length > 1 ? `Captura em lote de ${livres.length} clientes` : 'Captura forçada',
        cliente: livres.length === 1 ? nomes[0] : undefined,
        clienteId: livres.length === 1 ? livres[0] : undefined,
        inicio: livres.length > 1 ? `Vou ler a SEFAZ e o ADN de ${livres.length} clientes agora.` : `Vou ler a SEFAZ e o ADN de ${nomes[0]} agora, do NSU ${estadoNotas(livres[0]).captura.nsu.toLocaleString('pt-BR')} em diante.`,
        etapas: ['Consultando a distribuição de DF-e pelo NSU', 'Baixando resumos e XMLs novos', 'Lendo o ADN (NFS-e do padrão nacional)', 'Conferindo sequência, canceladas e paridade'],
        seg: 1,
        texto: `Pronto: ${total} documentos novos${livres.length > 1 ? ` em ${livres.length} clientes` : ''}. ${comLacuna.length ? 'Achei um buraco na sequência de saídas e já abri a tarefa.' : 'Sequência completa, sem lacuna.'}${travados.length ? ` Não capturei ${travados.map(nomeCliente).join(', ')}: certificado vencido (avisei o Societário).` : ''}`,
        aviso: livres.length > 1 ? `Captura em lote: ${total} documentos novos` : undefined,
        aoTerminar: () => {
          r.dados.forEach((x) => aplicarCaptura(x.c, x.novos, origem, origem === 'forçada' ? usuario.nome : 'Notas'))
          comLacuna.forEach(lacuna)
        },
        toast: livres.length ? undefined : false,
      })
      if (!livres.length) loja.toast('Nenhum cliente com captura liberada nesta seleção.')
    } catch (e) {
      setErro({ clienteId: clienteIds[0], texto: e instanceof Error ? e.message : 'A captura não respondeu.' })
    } finally {
      setRodando([])
    }
  }
  return { forcar, rodando, erro, limparErro: () => setErro(null), fonte, integrante: integranteDoSetor('notas') }
}
