import { useMemo } from 'react'
import { perfilDoCliente } from '@/dados/perfil-cliente'
import { itensDeObrigacao } from '@/dados/obrigacoes-setor'
import { EstadoVazio } from '@/components/kit'
import { useTabela } from '@/nucleo/react'
import { FaixaCicloDeVida } from './painel/trilha/faixa'
import { FaixaEstado, preContrato, soLeitura, TrabalhandoEm, useClienteEntidade, useResponsavelDiferente } from './painel/anatomia'
import { SaudeCaptura } from './painel/notas/saude'
import { useFluxos } from '@/ambiente/fluxos'
import { AbaCtx, CabecalhoAba } from '@/components/compostos/painel-aba'
import type { DefWidget, ItemGrade } from '@/components/widgets/tipos'
import { GradeWidgets } from '@/components/widgets/grade'
import { abasPainel } from '@/dados/painel'
import type { Cliente, Integrante, Tarefa } from '@/dados/tipos'
import { widgetsComuns } from './painel/comuns'
import { widgetsContabil } from './painel/contabil'
import { widgetsConsultoria } from './painel/consultoria'
import { widgetsDP } from './painel/dp'
import { widgetsFiscal } from './painel/fiscal'
import { widgetsGestao } from './painel/gestao'
import { widgetsNotas } from './painel/notas'
import { SeletorSetores, widgetsObrigacoes } from './painel/obrigacoes'
import { chavePadrao, padroes } from './painel/padroes'
import { widgetsSocietario } from './painel/societario'
import type { CtxAba, WidgetsAba } from './painel/tipos'

interface Props {
  abaId: string
  /** Cliente selecionado; ausente = carteira. */
  cliente?: Cliente
  clientesNaCarteira: number
  tarefas: Tarefa[]
  integrantes: Integrante[]
  onFalar?: (setor: Integrante['setor']) => void
}

/** Widgets próprios (bloco C) de cada aba. */
const porAba: Record<string, (ctx: CtxAba) => WidgetsAba> = {
  societario: widgetsSocietario,
  obrigacoes: widgetsObrigacoes,
  notas: widgetsNotas,
  fiscal: widgetsFiscal,
  dp: widgetsDP,
  contabil: widgetsContabil,
  consultoria: widgetsConsultoria,
  gestao: widgetsGestao,
}

/** Catálogo e arranjo padrão de uma aba (exportado para a story de todos os tamanhos). */
export function gradePainel(ctx: CtxAba): { catalogo: DefWidget[]; padrao: ItemGrade[] } {
  const { aba, cliente } = ctx
  const catalogo = [...widgetsComuns(ctx), ...(porAba[aba.id]?.(ctx).catalogo ?? [])]
  const padrao = padroes[chavePadrao(aba.id, !cliente, cliente?.regime === 'Simples Nacional')] ?? []
  return { catalogo, padrao }
}

/**
 * Aba interna do Painel, com a anatomia do subplano 03, seção 5: o cabeçalho
 * (A) fica fixo em cima; o resto vira widgets na grade personalizável, na
 * ordem da anatomia por padrão: B pendências · E ações · C blocos da aba ·
 * F tarefas · D documentos · G relatórios. Cada aba guarda o seu arranjo,
 * separado para cliente e carteira (os widgets mudam entre um e outro).
 */
export function PainelTela({ abaId, cliente, clientesNaCarteira, tarefas, integrantes, onFalar }: Props) {
  const fluxos = useFluxos()
  const aba = abasPainel.find((a) => a.id === abaId) ?? abasPainel[0]
  const integrante = integrantes.find((i) => i.setor === aba.setor && i.tipo !== 'criado_pelo_usuario')
  // O regime vem do cliente selecionado; o resto do perfil é de exemplo.
  // O perfil do cabeçalho vem do cliente selecionado (regime, UF, empregados, certificado...).
  const perfilBase = cliente ? perfilDoCliente(aba.perfil, cliente.id, cliente.regime) : aba.perfil
  const entidade = useClienteEntidade(cliente?.id)
  const tTarefas = useTabela('tarefa')
  // Obrigações: o cabeçalho conta do banco (competência aberta, atrasadas e em risco do cliente).
  const perfil = useMemo(() => {
    if (aba.id !== 'obrigacoes' || !cliente) return perfilBase
    const doCliente = itensDeObrigacao(tTarefas, entidade ? [entidade] : []).filter((i) => i.clienteId === cliente.id)
    const abertas = doCliente.filter((i) => !['entregue', 'cancelada', 'dispensada'].includes(i.status))
    const atrasadas = abertas.filter((i) => i.status === 'atrasada').length
    const risco = abertas.filter((i) => i.status === 'em risco' || i.status === 'vence hoje').length
    return [
      ...perfilBase.filter((c) => c.rotulo === 'Regime' || c.rotulo === 'UF'),
      { rotulo: 'Obrigações abertas', valor: String(abertas.length) },
      { rotulo: 'Atrasadas', valor: String(atrasadas), alerta: atrasadas > 0 },
      { rotulo: 'Em risco ou vence hoje', valor: String(risco), alerta: risco > 0 },
    ]
  }, [aba.id, cliente, perfilBase, tTarefas, entidade])
  const estado = entidade?.estado_ciclo
  const somenteLeitura = soLeitura(estado)
  const responsavel = useResponsavelDiferente(aba.setor, cliente?.id)

  const grade = gradePainel({ aba, cliente, clientesNaCarteira, tarefas, integrante })
  // Prospect e proposta: no Societário só ficha, pessoas e contrato; nas outras abas, nada ainda (03, 6.1).
  const soFicha = preContrato(estado)
  const catalogo = soFicha ? grade.catalogo.filter((w) => ['ficha', 'pessoas', 'contrato'].includes(w.id)) : grade.catalogo
  const padrao = soFicha ? grade.padrao.filter((w) => ['ficha', 'pessoas', 'contrato'].includes(w.id)) : grade.padrao
  // Arranjo salvo por aba e variante (cliente, carteira, cliente do Simples na Fiscal).
  const chave = `painel-${chavePadrao(aba.id, !cliente, cliente?.regime === 'Simples Nacional')}${soFicha ? '-proposta' : ''}`

  return (
    <div className="area-rolagem h-full overflow-y-auto px-4 pb-10 sm:px-5 md:pb-24">
      <div className="pagina flex flex-col gap-4 pt-1">
        {/* A */}
        <CabecalhoAba
          titulo={aba.rotulo}
          cliente={cliente ? `${cliente.codigo} - ${cliente.nome} · ${cliente.regime}` : undefined}
          perfil={perfil}
          vigencia={aba.vigencia}
          faixa={!cliente || cliente.id === 'c1' ? aba.faixa : undefined}
          clienteId={cliente?.id}
          faixas={
            cliente ? (
              <>
                <FaixaCicloDeVida cliente={cliente} />
                <FaixaEstado cliente={entidade} />
              </>
            ) : clientesNaCarteira === 0 ? (
              <EstadoVazio compacto titulo="Carteira vazia" descricao="Cadastre o primeiro cliente pelo CNPJ na aba Societário." />
            ) : undefined
          }
          extra={
            <>
              <TrabalhandoEm setor={aba.setor} clienteId={cliente?.id} />
              {responsavel && <span className="bg-sunken text-muted-foreground rounded-full px-3 py-1 text-xs">responsável neste cliente: {responsavel} (não o padrão do setor)</span>}
              {aba.id === 'notas' && cliente && <SaudeCaptura clienteId={cliente.id} />}
            </>
          }
          integrante={integrante}
          statusIntegrante={
            integrante && (integrante.estado === 'trabalhando' || integrante.pendentes > 0) ? (integrante.resumo ?? aba.statusIntegrante) : cliente ? aba.statusIntegrante : `Na carteira: ${aba.statusIntegrante.toLowerCase()}`
          }
          onFalar={() => onFalar?.(aba.setor)}
          onFicha={cliente ? () => fluxos.fichaCliente(cliente.id) : undefined}
        />
        <AbaCtx.Provider value={{ cliente: cliente?.nome, setor: aba.setor, clienteId: cliente?.id, somenteLeitura }}>
          {aba.id === 'obrigacoes' && !soFicha && <SeletorSetores />}
          {soFicha && aba.id !== 'societario' ? (
            <EstadoVazio titulo={`${cliente?.nome} ainda não é cliente ativo`} descricao="Em prospect ou proposta, só o Societário mostra ficha, pessoas e contrato. As outras abas abrem depois do aceite." />
          ) : (
            <GradeWidgets key={chave} chave={chave} catalogo={catalogo} padrao={padrao} />
          )}
        </AbaCtx.Provider>
      </div>
    </div>
  )
}
