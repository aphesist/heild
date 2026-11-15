/**
 * Kit de interação comum do wireframe (S00). Use estas peças em toda tela
 * nova; o visual vem dos tokens do tema (nada de cor solta).
 * Vitrine viva em #/kit; guia em docs/wireframe/ARQUITETURA.md.
 */
export { EdicaoEmLinha } from './edicao-em-linha'
export { FormularioModal, useFormulario, type Formulario, type Validador } from './formulario-modal'
export { ListaOrdenavel, Quadro, type ColunaQuadro } from './ordenavel'
export { ConfirmarProvider, DialogoConfirmacao, useConfirmar, type PedidoConfirmacao } from './confirmar'
export { Carregando, EstadoErro, EstadoVazio, Estados } from './estados'
export { BotaoAcoes, MenuContexto, type AcaoMenu } from './menu-contexto'
export { BarraLote, CaixaSelecao, useSelecao, type AcaoLote, type Selecao } from './selecao'
export { SeloDemonstracao } from './selo-demonstracao'
export { SePode, useAcao, usePermissao, usePode } from './permissao'
export { Celula, LinhaColunas, ListaColunas, type ColunaLista, type LarguraColuna, type QuebraLista } from './linha-colunas'
