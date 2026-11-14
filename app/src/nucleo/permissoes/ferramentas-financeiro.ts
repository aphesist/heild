import type { Ferramenta } from './ferramentas'

/*
 * S07 · Ferramentas do Financeiro do escritório (09, 4 a 8 e 10.6).
 *
 * Todas ficam no setor `financeiro_escritorio`: o Administrador faz tudo; o
 * Gestor com o setor em modo gestão faz o operacional e aprova até a alçada; o
 * Membro só por exceção na conta (`aba.financeiro.*`, com `nivel_max`).
 * Resultado, remuneração, sócios, fechamento e configuração são só do
 * Administrador (papel mínimo), e exceção não libera (09, 10.6).
 *
 * `irreversivel` e `exige_aprovacao: 'sempre'` marcam o que nunca sai sem
 * cartão: cobrança, NFS-e, cancelar, substituir, pagar, reajuste, suspensão.
 */

const S = 'financeiro_escritorio'
const f = (nome: string, nivel: Ferramenta['nivel'], tela: string, resto: Partial<Ferramenta> = {}): Ferramenta => ({ nome, modulo: 'financeiro', nivel, setor: S, gestao: true, tela, ...resto })
const adm = { papel_minimo: 'administrador' as const }

export const ferramentasFinanceiro: Ferramenta[] = [
  // Leitura
  f('financeiro.ler', 'ler', 'aba.financeiro.visao', { gestao: false }),
  // Contratos (09, 4)
  f('contrato.criar', 'rascunhar', 'aba.financeiro.contratos'),
  f('contrato.aditar', 'executar', 'aba.financeiro.contratos', { exige_aprovacao: 'se_integrante' }),
  f('contrato.enviar_assinatura', 'executar', 'aba.financeiro.contratos', { irreversivel: true }),
  f('contrato.encerrar', 'executar', 'aba.financeiro.contratos', { irreversivel: true, papel_minimo: 'gestor' }),
  f('reajuste.aplicar', 'executar', 'aba.financeiro.contratos', { ...adm, irreversivel: true, exige_aprovacao: 'sempre' }),
  f('avulso.registrar', 'executar', 'aba.financeiro.contratos'),
  f('avulso.decidir', 'executar', 'aba.financeiro.contratos'),
  f('despesa.registrar', 'executar', 'aba.financeiro.contratos'),
  f('despesa.perdoar', 'executar', 'aba.financeiro.contratos', { papel_minimo: 'gestor' }),
  // Cobranças (09, 4.5 e 5)
  f('faturamento.preparar_lote', 'rascunhar', 'aba.financeiro.cobrancas'),
  f('aprovacao.decidir_lote', 'executar', 'aba.financeiro.cobrancas', { irreversivel: true }),
  f('cobranca.criar', 'executar', 'aba.financeiro.cobrancas', { irreversivel: true }),
  f('cobranca.segunda_via', 'executar', 'aba.financeiro.cobrancas'),
  f('cobranca.cancelar', 'executar', 'aba.financeiro.cobrancas', { irreversivel: true, exige_aprovacao: 'sempre' }),
  f('cobranca.substituir', 'executar', 'aba.financeiro.cobrancas', { irreversivel: true, exige_aprovacao: 'sempre' }),
  f('cobranca.ajustar', 'executar', 'aba.financeiro.cobrancas', { irreversivel: true, exige_aprovacao: 'sempre' }),
  f('cobranca.propor_acordo', 'rascunhar', 'aba.financeiro.cobrancas'),
  f('cobranca.pausar_regua', 'executar', 'aba.financeiro.cobrancas'),
  f('recebimento.baixar', 'executar', 'aba.financeiro.cobrancas'),
  f('recebimento.vincular', 'executar', 'aba.financeiro.cobrancas'),
  f('nfse.escritorio.emitir', 'executar', 'aba.financeiro.cobrancas', { irreversivel: true }),
  f('nfse.escritorio.cancelar', 'executar', 'aba.financeiro.cobrancas', { irreversivel: true, exige_aprovacao: 'sempre' }),
  f('suspensao.aplicar', 'executar', 'aba.financeiro.cobrancas', { ...adm, irreversivel: true, exige_aprovacao: 'sempre' }),
  // Contas a pagar (09, 6.1): o integrante nunca paga
  f('conta_pagar.capturar', 'executar', 'aba.financeiro.contas_pagar'),
  f('conta_pagar.classificar', 'rascunhar', 'aba.financeiro.contas_pagar'),
  f('conta_pagar.aprovar', 'executar', 'aba.financeiro.contas_pagar', { irreversivel: true, exige_aprovacao: 'sempre' }),
  f('conta_pagar.baixar', 'executar', 'aba.financeiro.contas_pagar'),
  f('conta_pagar.cancelar', 'executar', 'aba.financeiro.contas_pagar'),
  // Conciliação (09, 6.2)
  f('conciliacao.confirmar', 'executar', 'aba.financeiro.conciliacao'),
  f('conciliacao.ajustar', 'executar', 'aba.financeiro.conciliacao', { exige_aprovacao: 'sempre' }),
  f('regra_categorizacao.aprovar', 'executar', 'aba.financeiro.conciliacao'),
  f('conta_bancaria.conectar', 'executar', 'aba.financeiro.conciliacao', adm),
  // Fluxo de caixa (09, 7.1)
  f('caixa.salvar_cenario', 'executar', 'aba.financeiro.caixa'),
  // Resultado e configuração: só Administrador (09, 10.6)
  f('fechamento.fechar', 'executar', 'aba.financeiro.resultado', { ...adm, exige_aprovacao: 'sempre' }),
  f('fechamento.reabrir', 'executar', 'aba.financeiro.resultado', adm),
  f('custo_hora.propor', 'rascunhar', 'aba.financeiro.resultado', adm),
  f('remuneracao.apurar', 'rascunhar', 'aba.financeiro.resultado', adm),
  f('financeiro.configurar', 'executar', 'aba.financeiro.configurar', adm),
]
