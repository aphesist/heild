import { widgetObrigacoesDoSetor } from './obrigacoes-setor'
import { FileXIcon } from '@phosphor-icons/react'
import { EstadoVazio } from '@/components/kit'
import type { DefWidget } from '@/components/widgets/tipos'
import { widgetsNotasCarteira, widgetsNotasCliente } from './notas/blocos'
import './notas/acoes'
import type { CtxAba, WidgetsAba } from './tipos'

/**
 * Notas fiscais (03, 6.3; S02-T04): capturar, conferir e entregar os
 * documentos fiscais ao core e avisar o que falta. Substitui SIEG e Qive.
 * Os blocos e as ações moram em `./notas/`; o estado de cada cliente, em
 * `src/dados/s02/notas.ts`. Em carteira: captura de cada cliente, manifestação
 * e eventos posteriores. Cliente pessoa física: Notas vazia com explicação (03, 3.5).
 */
export function widgetsNotas(ctx: CtxAba): WidgetsAba {
  const { cliente } = ctx
  if (!cliente) return { catalogo: [...widgetsNotasCarteira, widgetObrigacoesDoSetor('notas', ctx)] }
  if (cliente.regime === 'Pessoa física') return { catalogo: [pessoaFisica] }
  return { catalogo: [...widgetsNotasCliente(cliente.id), widgetObrigacoesDoSetor('notas', ctx)] }
}

const pessoaFisica: DefWidget = {
  id: 'fluxos',
  titulo: 'Notas fiscais',
  descricao: 'Pessoa física: sem captura de notas',
  icone: FileXIcon,
  tamanhos: ['M', 'L', 'XL'],
  conteudo: () => <EstadoVazio compacto icone={FileXIcon} titulo="Pessoa física não tem captura de notas" descricao="Recibos e informes do titular entram pela aba Fiscal (carnê-leão e IRPF) e por Arquivos." />,
}
