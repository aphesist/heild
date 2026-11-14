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
]

const indice = new Map(ferramentas.map((x) => [x.nome, x]))

export function ferramenta(nome: string): Ferramenta {
  const x = indice.get(nome)
  if (!x) throw new Error(`Ferramenta não registrada: ${nome}. Acrescente em src/nucleo/permissoes/ferramentas.ts.`)
  return x
}
