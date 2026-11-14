import type { Modulo, Nivel, Papel } from '../modelo/entidades'

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
]

const indice = new Map(ferramentas.map((x) => [x.nome, x]))

export function ferramenta(nome: string): Ferramenta {
  const x = indice.get(nome)
  if (!x) throw new Error(`Ferramenta não registrada: ${nome}. Acrescente em src/nucleo/permissoes/ferramentas.ts.`)
  return x
}
