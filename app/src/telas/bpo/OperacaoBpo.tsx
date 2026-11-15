/**
 * BPO › Fila e pedidos (S08-T03) e BPO › Rotinas (S08-T04). A S08b levou as
 * duas abas para `./operacao/` (fila com documentos chegando, detalhe do item
 * e histórico; rotinas com as seções da operação e o fechamento do mês). Este
 * arquivo continua exportando os mesmos nomes de antes, para o módulo, os
 * contratantes e o portal do convidado não mudarem.
 */
export { rotuloBola, slaDe, useAcoesFila } from './operacao/comum-fila'
export { FilaBpoTela } from './operacao/fila'
export { RotinasBpoTela } from './operacao/rotinas'
export { brl } from './comum'
