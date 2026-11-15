import type { Modulo, Nivel, Papel } from '../modelo/entidades'
import { ferramentasFinanceiro } from './ferramentas-financeiro'

/**
 * Catálogo das ferramentas tipadas (Fundações 6.1), no que a autorização usa.
 * Toda escrita dos repositórios aponta para uma ferramenta daqui; a tela pergunta
 * `pode('tarefa.cancelar', alvo)` antes de mostrar o botão.
 *
 * Para criar ferramenta nova: acrescente aqui (nome `entidade.acao`), use o
 * nome no repositório e, se a tela tiver botão, cheque com `usePode`.
 */
export interface Ferramenta {
  nome: string
  modulo: Modulo | 'plataforma'
  nivel: Nivel
  /**
   * `alvo`: o setor vem do registro afetado (tarefa do Fiscal pede vínculo no Fiscal).
   * `geral`: qualquer pessoa da equipe (transversal).
   * Um código de setor fixo: precisa de vínculo nele.
   */
  setor: 'alvo' | 'geral' | string
  /** Exige o modo gestão no setor (aprovar, reatribuir, timesheet da equipe). */
  gestao?: boolean
  papel_minimo?: Papel
  /** Irreversível (transmitir, enviar, pagar): integrante nunca faz sozinho. */
  irreversivel?: boolean
  exige_aprovacao?: 'nunca' | 'sempre' | 'se_integrante' | 'se_fora_da_lista'
  /** A pessoa do cliente pode usar pelo app (Fundações 3.2, regra 3). */
  exposta_ao_cliente?: boolean
  /** Agrupamento de tela a que a exceção por tela se aplica (`aba.financeiro.contratos`). */
  tela?: string
}

const f = (nome: string, modulo: Ferramenta['modulo'], nivel: Nivel, setor: Ferramenta['setor'], resto: Partial<Ferramenta> = {}): Ferramenta => ({ nome, modulo, nivel, setor, ...resto })

export const ferramentas: Ferramenta[] = [
  // Cadastro
  f('cliente.listar', 'plataforma', 'ler', 'geral'),
  f('cliente.criar', 'plataforma', 'executar', 'geral'),
  f('cliente.atualizar', 'plataforma', 'executar', 'geral'),
  f('cliente.mudar_estado', 'plataforma', 'executar', 'geral', { papel_minimo: 'gestor' }),
  f('cliente.arquivar', 'plataforma', 'executar', 'geral', { papel_minimo: 'gestor' }),
  f('cliente.fundir', 'plataforma', 'executar', 'geral', { papel_minimo: 'administrador' }),
  f('pessoa.criar', 'plataforma', 'executar', 'geral', { exposta_ao_cliente: true }),
  f('pessoa.atualizar', 'plataforma', 'executar', 'geral'),
  // Tarefas (cada transição é ferramenta própria, 4.8)
  f('tarefa.listar', 'painel', 'ler', 'alvo'),
  f('tarefa.criar', 'painel', 'executar', 'alvo', { exposta_ao_cliente: true }),
  f('tarefa.atualizar', 'painel', 'executar', 'alvo', { exposta_ao_cliente: true }),
  f('tarefa.iniciar', 'painel', 'executar', 'alvo', { exposta_ao_cliente: true }),
  f('tarefa.aguardar_cliente', 'painel', 'executar', 'alvo'),
  f('tarefa.aguardar_terceiro', 'painel', 'executar', 'alvo'),
  f('tarefa.enviar_revisao', 'painel', 'executar', 'alvo'),
  f('tarefa.concluir', 'painel', 'executar', 'alvo', { exige_aprovacao: 'se_fora_da_lista', exposta_ao_cliente: true }),
  f('tarefa.cancelar', 'painel', 'executar', 'alvo'),
  f('tarefa.cancelar_obrigacao', 'painel', 'executar', 'alvo', { papel_minimo: 'gestor', gestao: true }),
  f('tarefa.reatribuir', 'painel', 'executar', 'alvo', { gestao: true }),
  f('tarefa.reordenar', 'painel', 'executar', 'alvo'),
  f('tarefa.checklist_marcar', 'painel', 'executar', 'alvo'),
  f('tarefa.arquivar', 'painel', 'executar', 'alvo', { gestao: true }),
  // Obrigações
  f('obrigacao.listar', 'painel', 'ler', 'alvo'),
  f('obrigacao.criar', 'painel', 'executar', 'alvo', { papel_minimo: 'gestor', gestao: true }),
  f('obrigacao.atualizar', 'painel', 'executar', 'alvo', { papel_minimo: 'gestor', gestao: true }),
  f('obrigacao.cancelar', 'painel', 'executar', 'alvo', { papel_minimo: 'gestor', gestao: true }),
  // CRM
  f('conversa.listar', 'crm', 'ler', 'alvo'),
  f('conversa.criar', 'crm', 'executar', 'alvo', { exposta_ao_cliente: true }),
  f('conversa.atualizar', 'crm', 'executar', 'alvo'),
  f('conversa.assumir', 'crm', 'executar', 'alvo'),
  f('conversa.transferir', 'crm', 'executar', 'alvo'),
  f('conversa.resolver', 'crm', 'executar', 'alvo'),
  f('conversa.responder', 'crm', 'executar', 'alvo', { irreversivel: true, exige_aprovacao: 'se_integrante', exposta_ao_cliente: true }),
  f('conversa.nota_interna', 'crm', 'executar', 'alvo'),
  f('lead.criar', 'crm', 'executar', 'gestao_atendimento'),
  f('lead.atualizar', 'crm', 'executar', 'gestao_atendimento'),
  f('lead.mover', 'crm', 'executar', 'gestao_atendimento'),
  // Documentos
  f('documento.listar', 'arquivos', 'ler', 'geral'),
  f('documento.registrar', 'arquivos', 'executar', 'geral', { exposta_ao_cliente: true }),
  f('documento.atualizar', 'arquivos', 'executar', 'geral'),
  f('documento.arquivar', 'arquivos', 'executar', 'geral'),
  f('documento.registrar_entrega', 'arquivos', 'executar', 'geral', { exposta_ao_cliente: true }),
  // Aprovação, avisos, eventos
  f('aprovacao.decidir', 'agentes', 'executar', 'geral', { exposta_ao_cliente: true }),
  f('notificacao.publicar', 'plataforma', 'executar', 'geral', { exposta_ao_cliente: true }),
  f('notificacao.ler', 'plataforma', 'executar', 'geral'),
  f('evento.listar', 'plataforma', 'ler', 'geral'),
  // Integrantes e chat
  f('integrante.enviar_mensagem', 'agentes', 'executar', 'geral'),
  f('integrante.configurar', 'agentes', 'executar', 'geral', { papel_minimo: 'administrador' }),
  f('integrante.trabalhar', 'agentes', 'executar', 'geral'),
  // Comunicação interna (11): sem excluir
  f('mensagem_interna.enviar', 'plataforma', 'executar', 'geral'),
  f('mensagem_interna.editar', 'plataforma', 'executar', 'geral'),
  f('mensagem_interna.fixar', 'plataforma', 'executar', 'geral', { papel_minimo: 'gestor' }),
  f('conversa_interna.criar', 'plataforma', 'executar', 'geral'),
  // Configurações (só Administrador)
  f('conta.usuario.salvar', 'plataforma', 'executar', 'geral', { papel_minimo: 'administrador' }),
  f('conta.excecao.salvar', 'plataforma', 'executar', 'geral', { papel_minimo: 'administrador' }),
  f('conta.excecao.remover', 'plataforma', 'executar', 'geral', { papel_minimo: 'administrador' }),
  f('escritorio.configurar', 'plataforma', 'executar', 'geral', { papel_minimo: 'administrador' }),
  f('setor.configurar', 'plataforma', 'executar', 'geral', { papel_minimo: 'administrador' }),
  // Notas (app do cliente e Painel › Notas)
  f('nfse.emitir', 'painel', 'executar', 'geral', { irreversivel: true, exposta_ao_cliente: true }),
  f('nfse.cancelar', 'painel', 'executar', 'geral', { irreversivel: true, exposta_ao_cliente: true }),
  // Estado de tela (preferências e o que a tela guarda entre abas)
  f('tela.lembrar', 'plataforma', 'executar', 'geral', { exposta_ao_cliente: true }),
  // S06 · Timesheet (05, 12.2 A8; Fundações 5.4). Confirmar e contestar são da própria pessoa (a regra confere o dono).
  f('timesheet.listar_sessoes', 'timesheet', 'ler', 'geral'),
  f('timesheet.registrar', 'timesheet', 'executar', 'geral'),
  f('timesheet.confirmar', 'timesheet', 'executar', 'geral'),
  f('timesheet.confirmar_lote', 'timesheet', 'executar', 'geral'),
  f('timesheet.contestar', 'timesheet', 'executar', 'geral'),
  f('timesheet.decidir_contestacao', 'timesheet', 'executar', 'alvo', { papel_minimo: 'gestor', gestao: true }),
  f('timesheet.atribuir_artefato', 'timesheet', 'executar', 'geral', { papel_minimo: 'gestor', gestao: true }),
  f('timesheet.revisar_anomalia', 'timesheet', 'executar', 'alvo', { papel_minimo: 'gestor', gestao: true }),
  f('timesheet.reconstruir', 'timesheet', 'executar', 'geral', { papel_minimo: 'administrador' }),
  f('timesheet.calibrar', 'timesheet', 'executar', 'geral', { papel_minimo: 'administrador' }),
  f('timesheet.configurar', 'timesheet', 'executar', 'geral', { papel_minimo: 'administrador' }),
  f('timesheet.exportar_proprio', 'timesheet', 'ler', 'geral'),
  f('timesheet.exportar', 'timesheet', 'ler', 'geral', { papel_minimo: 'gestor', gestao: true }),
  f('timesheet.fechar_mes', 'timesheet', 'executar', 'geral', { papel_minimo: 'administrador' }),
  f('ausencia.registrar', 'timesheet', 'executar', 'geral', { papel_minimo: 'gestor', gestao: true }),
  f('custo_hora.definir', 'timesheet', 'executar', 'geral', { papel_minimo: 'administrador' }),
  f('extensao.vincular', 'timesheet', 'executar', 'geral'),
  f('extensao.pausar', 'timesheet', 'executar', 'geral'),
  f('extensao.pulso', 'timesheet', 'executar', 'geral'),
  f('extensao.portal.pedir', 'timesheet', 'executar', 'geral'),
  f('extensao.portal.configurar', 'timesheet', 'executar', 'geral', { papel_minimo: 'administrador' }),
  f('core.conectar', 'timesheet', 'executar', 'geral', { papel_minimo: 'administrador' }),
  f('core.equivalencia', 'timesheet', 'executar', 'geral', { papel_minimo: 'gestor', gestao: true }),
  // S03 · Painel B: Fiscal, Contábil e Consultoria (só acrescentado)
  f('fiscal.caixa_postal.ler', 'painel', 'ler', 'fiscal'),
  f('fiscal.caixa_postal.abrir', 'painel', 'executar', 'fiscal', { irreversivel: true }),
  f('fiscal.situacao.consultar', 'painel', 'executar', 'fiscal'),
  f('fiscal.conferencia.aprovar', 'painel', 'executar', 'fiscal'),
  f('fiscal.declaracao.preparar', 'painel', 'rascunhar', 'fiscal'),
  f('fiscal.declaracao.transmitir', 'painel', 'executar', 'fiscal', { irreversivel: true }),
  f('fiscal.declaracao.transmitir_lote', 'painel', 'executar', 'fiscal', { irreversivel: true, gestao: true }),
  f('fiscal.guia.gerar', 'painel', 'rascunhar', 'fiscal'),
  f('fiscal.guia.enviar', 'painel', 'executar', 'fiscal', { irreversivel: true }),
  f('fiscal.guia.cobrar', 'painel', 'executar', 'fiscal', { irreversivel: true }),
  f('fiscal.guia.recalcular', 'painel', 'executar', 'fiscal'),
  f('fiscal.certidao.emitir', 'painel', 'executar', 'fiscal'),
  f('fiscal.intimacao.responder', 'painel', 'executar', 'fiscal', { irreversivel: true }),
  f('fiscal.resumo.enviar', 'painel', 'executar', 'fiscal', { irreversivel: true }),
  f('fiscal.irpf.transmitir', 'painel', 'executar', 'fiscal', { irreversivel: true, exige_aprovacao: 'sempre' }),
  f('contabil.competencia.abrir', 'painel', 'executar', 'contabil'),
  f('contabil.lista.definir', 'painel', 'executar', 'contabil'),
  f('contabil.triagem.confirmar', 'painel', 'executar', 'contabil'),
  f('contabil.extrato.importar', 'painel', 'executar', 'contabil'),
  f('contabil.depara.corrigir', 'painel', 'executar', 'contabil'),
  f('contabil.lucros.responder', 'painel', 'executar', 'contabil'),
  f('contabil.lucros.exportar', 'painel', 'executar', 'contabil'),
  f('contabil.core.enviar', 'painel', 'executar', 'contabil', { irreversivel: true }),
  f('contabil.competencia.reabrir', 'painel', 'executar', 'contabil', { papel_minimo: 'gestor', gestao: true, exige_aprovacao: 'sempre' }),
  f('contabil.relatorio.gerar', 'painel', 'rascunhar', 'contabil'),
  f('contabil.relatorio.enviar', 'painel', 'executar', 'contabil', { irreversivel: true, exposta_ao_cliente: false }),
  f('contabil.assinatura.conferir', 'painel', 'executar', 'contabil'),
  f('contabil.ecd_ecf.transmitir', 'painel', 'executar', 'contabil', { irreversivel: true, exige_aprovacao: 'sempre' }),
  f('contabil.kanban.mover', 'painel', 'executar', 'contabil'),
  f('consultoria.parecer.rascunhar', 'consultor', 'rascunhar', 'consultor'),
  f('consultoria.parecer.enviar', 'consultor', 'executar', 'consultor', { irreversivel: true }),
  f('consultoria.escopo.marcar', 'consultor', 'executar', 'consultor'),
  f('consultoria.simular', 'consultor', 'ler', 'consultor'),
  f('consultoria.cct.publicar', 'consultor', 'executar', 'geral'),
  // S08 · BPO (10, 3.11 e 5.4): setor do BPO; pagar e transferir nunca automáticos (B3)
  f('bpo.ler', 'bpo', 'ler', 'bpo_financeiro'),
  f('bpo.perfil.editar', 'bpo', 'executar', 'bpo_financeiro', { gestao: true }),
  f('bpo.onboarding', 'bpo', 'executar', 'bpo_financeiro', { gestao: true }),
  f('bpo.encerrar', 'bpo', 'executar', 'bpo_financeiro', { papel_minimo: 'administrador', irreversivel: true }),
  f('bpo.audit_pesos', 'bpo', 'executar', 'bpo_financeiro', { gestao: true }),
  f('erp.conectar', 'bpo', 'executar', 'bpo_financeiro', { gestao: true }),
  f('erp.sincronizar', 'bpo', 'executar', 'bpo_financeiro'),
  f('banco.conectar', 'bpo', 'executar', 'bpo_financeiro', { gestao: true }),
  f('conta_pagar.capturar', 'bpo', 'executar', 'bpo_financeiro'),
  f('conta_pagar.conferir', 'bpo', 'executar', 'bpo_financeiro'),
  f('conta_pagar.cancelar', 'bpo', 'executar', 'bpo_financeiro', { exige_aprovacao: 'se_integrante' }),
  f('conta_receber.baixar', 'bpo', 'executar', 'bpo_financeiro'),
  f('fornecedor.criar', 'bpo', 'executar', 'bpo_financeiro'),
  f('fornecedor.alterar_dados_bancarios', 'bpo', 'executar', 'bpo_financeiro', { irreversivel: true, exige_aprovacao: 'sempre' }),
  f('pagamento_lote.montar', 'bpo', 'rascunhar', 'bpo_financeiro'),
  f('pagamento_lote.pedir_aprovacao', 'bpo', 'executar', 'bpo_financeiro', { gestao: true }),
  f('pagamento_lote.aprovar', 'bpo', 'executar', 'bpo_financeiro', { exposta_ao_cliente: true, irreversivel: true }),
  f('pagamento.liberar', 'bpo', 'executar', 'bpo_financeiro', { exposta_ao_cliente: true, irreversivel: true, exige_aprovacao: 'sempre' }),
  f('alcada.alterar', 'bpo', 'executar', 'bpo_financeiro', { gestao: true, exige_aprovacao: 'sempre' }),
  f('alcada.aceitar', 'bpo', 'executar', 'bpo_financeiro', { exposta_ao_cliente: true }),
  f('fila.criar', 'bpo', 'executar', 'bpo_financeiro', { exposta_ao_cliente: true }),
  f('fila.atualizar', 'bpo', 'executar', 'bpo_financeiro'),
  f('fila.passar_bola', 'bpo', 'executar', 'bpo_financeiro'),
  f('fila.reatribuir', 'bpo', 'executar', 'bpo_financeiro', { gestao: true }),
  f('rotina.marcar', 'bpo', 'executar', 'bpo_financeiro'),
  f('rotina.configurar', 'bpo', 'executar', 'bpo_financeiro', { gestao: true }),
  f('conciliacao.confirmar', 'bpo', 'executar', 'bpo_financeiro'),
  f('bpo.relatorio_mensal', 'bpo', 'executar', 'bpo_financeiro', { gestao: true, exige_aprovacao: 'se_integrante' }),
  f('bpo.volume.contestar', 'bpo', 'executar', 'bpo_financeiro', { exposta_ao_cliente: true }),
  f('bpo.volume.faturar', 'bpo', 'executar', 'bpo_financeiro', { papel_minimo: 'administrador', exige_aprovacao: 'sempre' }),
  f('bpo.contratante.configurar', 'bpo', 'executar', 'bpo_financeiro', { papel_minimo: 'administrador' }),
  f('bpo.convidado.convidar', 'bpo', 'executar', 'bpo_financeiro', { papel_minimo: 'administrador' }),
  f('bpo.revisao.decidir', 'bpo', 'executar', 'bpo_financeiro', { exposta_ao_cliente: true }),
  f('erp.autorizar', 'bpo', 'executar', 'bpo_financeiro', { exposta_ao_cliente: true }),
  f('fila.responder', 'bpo', 'executar', 'bpo_financeiro', { exposta_ao_cliente: true }),
  // S07: Financeiro do escritório
  ...ferramentasFinanceiro,
  // S09 · Arquivos (01, 7): mover, visibilidade, origem, conflito, envio ao cliente.
  f('documento.mover', 'arquivos', 'executar', 'geral', { papel_minimo: 'gestor' }),
  f('documento.forcar_visibilidade', 'arquivos', 'executar', 'geral', { papel_minimo: 'gestor' }),
  f('documento.confirmar_origem', 'arquivos', 'executar', 'geral'),
  f('documento.resolver_conflito', 'arquivos', 'executar', 'geral', { papel_minimo: 'gestor' }),
  f('documento.enviar_cliente', 'arquivos', 'executar', 'geral', { irreversivel: true, exige_aprovacao: 'se_integrante' }),
  // S09 · Configurações: só o Administrador, salvo exceção por tela (setor "configuracoes" não existe em vínculo).
  f('conector.configurar', 'plataforma', 'executar', 'configuracoes', { tela: 'config.conectores' }),
  f('conector.testar', 'plataforma', 'executar', 'configuracoes', { tela: 'config.conectores' }),
  f('conector.ver', 'plataforma', 'ler', 'configuracoes', { tela: 'config.conectores' }),
  f('credencial.vincular', 'plataforma', 'executar', 'configuracoes', { tela: 'config.conectores' }),
  f('credencial.rotacionar', 'plataforma', 'executar', 'configuracoes', { tela: 'config.conectores' }),
  f('credencial.revogar', 'plataforma', 'executar', 'configuracoes', { tela: 'config.conectores', irreversivel: true }),
  f('credencial.usar', 'plataforma', 'ler', 'configuracoes', { tela: 'config.conectores' }),
  f('conector.teto', 'plataforma', 'executar', 'configuracoes', { tela: 'config.conectores' }),
  f('rotina.reprocessar', 'plataforma', 'executar', 'configuracoes', { tela: 'config.conectores' }),
  f('armazenamento.configurar', 'arquivos', 'executar', 'configuracoes', { tela: 'config.armazenamento' }),
  f('raiox.rodar', 'arquivos', 'executar', 'configuracoes', { tela: 'config.armazenamento' }),
  f('raiox.decidir', 'arquivos', 'executar', 'configuracoes', { tela: 'config.armazenamento' }),
  f('raiox.ver_nomes', 'arquivos', 'ler', 'configuracoes', { tela: 'config.armazenamento' }),
  f('integrante.configurar', 'agentes', 'executar', 'configuracoes', { tela: 'config.integrantes' }),
  f('permissao.ver_matriz', 'plataforma', 'ler', 'configuracoes', { tela: 'config.permissoes' }),
  f('tema.publicar', 'plataforma', 'executar', 'geral', { papel_minimo: 'administrador' }),
  f('assinatura.alterar', 'plataforma', 'executar', 'geral', { papel_minimo: 'administrador' }),
  f('implantacao.conduzir', 'plataforma', 'executar', 'geral', { papel_minimo: 'administrador' }),
  // S02 · Painel A (anatomia, Societário, Obrigações, Notas)
  f('obrigacao.gerar_calendario', 'painel', 'executar', 'alvo', { papel_minimo: 'gestor', gestao: true }),
  f('obrigacao.reprogramar_interno', 'painel', 'executar', 'alvo'),
  f('obrigacao.prorrogar', 'painel', 'executar', 'alvo', { papel_minimo: 'gestor', gestao: true }),
  f('obrigacao.anexar_recibo', 'painel', 'executar', 'alvo'),
  f('obrigacao.marcar_eventual', 'painel', 'executar', 'alvo'),
  f('obrigacao.editar_regra_uf', 'painel', 'executar', 'fiscal'),
  f('cliente.versionar_perfil', 'painel', 'executar', 'societario', { exige_aprovacao: 'sempre' }),
  f('cliente.corrigir_perfil', 'painel', 'executar', 'societario'),
  f('cliente.servico_extra', 'painel', 'executar', 'geral', { papel_minimo: 'gestor' }),
  f('app.convidar', 'painel', 'executar', 'societario'),
  f('app.revogar_acesso', 'painel', 'executar', 'geral', { papel_minimo: 'gestor' }),
  f('documento.classificar', 'painel', 'executar', 'alvo'),
  f('legalizacao.abrir_processo', 'painel', 'executar', 'societario'),
  f('credencial.registrar', 'painel', 'executar', 'societario'),
  f('contrato.enviar_assinatura', 'painel', 'executar', 'societario', { irreversivel: true, exige_aprovacao: 'sempre' }),
  f('notas.forcar_captura', 'painel', 'executar', 'notas'),
  f('notas.configurar_captura', 'painel', 'executar', 'notas'),
  f('notas.manifestar', 'painel', 'executar', 'notas', { irreversivel: true, exige_aprovacao: 'se_integrante' }),
  f('painel.acao_lote', 'painel', 'executar', 'alvo', { papel_minimo: 'gestor', gestao: true }),
  // S10: app do cliente (06, 4.3, regra 5: o cliente cancela o pedido enquanto ninguém iniciou)
  f('pedido.cancelar', 'painel', 'executar', 'alvo', { exposta_ao_cliente: true }),
  // S08c · BPO: os nomes conta_pagar.capturar, conta_pagar.cancelar e conciliacao.confirmar também
  // existem no Financeiro do escritório (S07), que vence no índice; o BPO usa estes, do setor dele.
  f('bpo.conta.capturar', 'bpo', 'executar', 'bpo_financeiro'),
  f('bpo.conta.cancelar', 'bpo', 'executar', 'bpo_financeiro', { exige_aprovacao: 'se_integrante' }),
  f('bpo.conciliacao.confirmar', 'bpo', 'executar', 'bpo_financeiro'),
]

const indice = new Map(ferramentas.map((x) => [x.nome, x]))

export function ferramenta(nome: string): Ferramenta {
  const x = indice.get(nome)
  if (!x) throw new Error(`Ferramenta não registrada: ${nome}. Acrescente em src/nucleo/permissoes/ferramentas.ts.`)
  return x
}
