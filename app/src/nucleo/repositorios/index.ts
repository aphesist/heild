import { banco, bancoAtual } from '../banco'
import { instalarCapturaApi } from '../banco/api'
import type { Banco } from '../banco/banco'
import type { CartaoAprovacao, Id, MensagemInterna, NomeTabela, Notificacao, StatusTarefa, Tabelas, Tarefa } from '../modelo/entidades'
import { ErroRegra } from '../permissoes/autorizar'
import { idDoAtor, nomeDoAtor } from '../permissoes/perfil'
import { criarReposBpo } from './bpo'
import { contextoAtual } from './contexto'
import { reposFinanceiro } from './financeiro'
import { agora, definirGeradorId, novoId, novoIdPadrao, registrarEvento, Repositorio, type OpcoesEscrita, type RegrasEntidade } from './repositorio'
import { registrarRepoSessoes, RepositorioItensConfirmacao, RepositorioSessoes } from './s06-timesheet'

export * from './contexto'
export * from './repositorio'
export * from './s06-timesheet'
export { ehGestorBpo, eventoBpo } from './bpo'
export { competenciaDe } from './financeiro'

const b = (): Banco => bancoAtual()

/* ---------- Tarefa: cada transição é ferramenta própria (Fundações 4.8) ---------- */

const ferramentaDaTransicao: Record<StatusTarefa, string> = {
  a_fazer: 'tarefa.atualizar',
  em_andamento: 'tarefa.iniciar',
  aguardando_cliente: 'tarefa.aguardar_cliente',
  aguardando_terceiro: 'tarefa.aguardar_terceiro',
  em_revisao: 'tarefa.enviar_revisao',
  concluida: 'tarefa.concluir',
  cancelada: 'tarefa.cancelar',
}

const fraseStatus: Record<StatusTarefa, string> = {
  a_fazer: 'voltou para a fazer',
  em_andamento: 'iniciou',
  aguardando_cliente: 'pôs em aguardando o cliente',
  aguardando_terceiro: 'pôs em aguardando terceiro',
  em_revisao: 'mandou para revisão',
  concluida: 'concluiu',
  cancelada: 'cancelou',
}

export class RepositorioTarefas extends Repositorio<'tarefa'> {
  /** Troca o status pela ferramenta da transição. Concluída é final: reabrir cria tarefa nova. */
  mudarStatus(id: Id, status: StatusTarefa, op: OpcoesEscrita & { motivo?: string } = {}): Tarefa {
    const t = this.exigir(id)
    if (t.status === status) {
      // Nada muda, mas a resposta não pode dizer "ok" a quem não pode: confere a permissão do mesmo jeito.
      this.autorizar(op.ferramenta ?? ferramentaDaTransicao[status], t, op)
      return t
    }
    if (status === 'cancelada') return this.cancelar(id, op.motivo ?? '', op)
    if (t.status === 'cancelada') throw new ErroRegra('Tarefa cancelada não volta: crie uma tarefa nova.')
    const quando = agora()
    const ctx = op.ctx ?? contextoAtual()
    const extra: Partial<Tarefa> =
      status === 'concluida' ? { concluida_em: quando, concluida_por_tipo: ctx.ator.tipo === 'integrante' ? 'integrante' : 'usuario', concluida_por_id: idDoAtor(ctx.ator) } : t.status === 'concluida' ? { concluida_em: null, concluida_por_id: null, concluida_por_tipo: null } : {}
    return this.atualizar(id, { status, status_desde: quando, ...extra }, { ...op, ferramenta: op.ferramenta ?? ferramentaDaTransicao[status], texto: op.texto ?? `${nomeDoAtor(ctx.ator)} ${fraseStatus[status]} ${this.regras.rotulo(t)}` })
  }

  /** Cancelar exige motivo; tarefa de obrigação só Gestor ou Administrador cancela (4.8). */
  cancelar(id: Id, motivo: string, op: OpcoesEscrita = {}): Tarefa {
    const t = this.exigir(id)
    if (!motivo.trim()) throw new ErroRegra('Cancelar uma tarefa exige o motivo.')
    if (t.status === 'concluida') throw new ErroRegra('Tarefa concluída não se cancela.')
    const ctx = op.ctx ?? contextoAtual()
    return this.atualizar(id, { status: 'cancelada', status_desde: agora(), cancelada_motivo: motivo }, { ...op, ferramenta: t.origem === 'obrigacao' ? 'tarefa.cancelar_obrigacao' : 'tarefa.cancelar', texto: `${nomeDoAtor(ctx.ator)} cancelou ${this.regras.rotulo(t)}: ${motivo}` })
  }

  reatribuir(id: Id, responsavel: { tipo: 'usuario' | 'integrante'; id: Id; nome?: string }, op: OpcoesEscrita = {}): Tarefa {
    const t = this.exigir(id)
    return this.atualizar(id, { responsavel_tipo: responsavel.tipo, responsavel_id: responsavel.id, extras: { ...t.extras, responsavel_nome: responsavel.nome } }, { ...op, ferramenta: 'tarefa.reatribuir' })
  }
}

/* ---------- Obrigação: cancelar só por Gestor ou Administrador, com motivo ---------- */

export class RepositorioObrigacoes extends Repositorio<'obrigacao'> {
  cancelar(id: Id, motivo: string, op: OpcoesEscrita = {}) {
    if (!motivo.trim()) throw new ErroRegra('Cancelar uma obrigação exige o motivo.')
    const ctx = op.ctx ?? contextoAtual()
    return this.atualizar(id, { cancelada_em: agora(), cancelada_por: idDoAtor(ctx.ator), cancelada_motivo: motivo, vigente_ate: agora().slice(0, 10) }, { ...op, ferramenta: 'obrigacao.cancelar', texto: `${nomeDoAtor(ctx.ator)} cancelou a obrigação ${this.exigir(id).nome}: ${motivo}` })
  }
}

/* ---------- Mensagem interna: nunca se apaga; editar guarda versões (subplano 11) ---------- */

export class RepositorioMensagensInternas extends Repositorio<'mensagem_interna'> {
  enviar(conversaId: Id, corpo: string, op: OpcoesEscrita & { respondeA?: Id } = {}): MensagemInterna {
    const ctx = op.ctx ?? contextoAtual()
    return this.criar({ conversa_interna_id: conversaId, autor_id: idDoAtor(ctx.ator) ?? 'sistema', corpo, responde_a_id: op.respondeA ?? null, versoes: [] }, { ...op, ferramenta: 'mensagem_interna.enviar', texto: `${nomeDoAtor(ctx.ator)} escreveu na conversa interna` })
  }
  editar(id: Id, corpo: string, op: OpcoesEscrita = {}): MensagemInterna {
    return this.atualizar(id, { corpo }, { ...op, ferramenta: 'mensagem_interna.editar' })
  }
}

/* ---------- Cartão de aprovação: decisão humana, sempre com autor e data ---------- */

export class RepositorioCartoes extends Repositorio<'cartao_aprovacao'> {
  decidir(id: Id, status: 'aprovado' | 'recusado' | 'editado_e_aprovado', op: OpcoesEscrita & { comentario?: string; criarSeFaltar?: Partial<CartaoAprovacao> } = {}): CartaoAprovacao {
    const ctx = op.ctx ?? contextoAtual()
    if (ctx.ator.tipo === 'integrante' || ctx.ator.tipo === 'sistema') throw new ErroRegra('Aprovar é decisão de uma pessoa: o integrante prepara, quem decide é você.')
    const quando = agora()
    const decisao = { status, decidido_por: idDoAtor(ctx.ator) ?? nomeDoAtor(ctx.ator), decidido_em: quando, comentario: op.comentario, extras: { ...(this.obter(id)?.extras ?? op.criarSeFaltar?.extras), decidido_por_nome: nomeDoAtor(ctx.ator) } }
    const texto = `${nomeDoAtor(ctx.ator)} ${status === 'recusado' ? 'recusou' : 'aprovou'} ${this.obter(id)?.resumo_humano ?? op.criarSeFaltar?.resumo_humano ?? 'o cartão'}`
    if (!this.obter(id)) {
      const base: Omit<CartaoAprovacao, 'escritorio_id' | 'criado_em' | 'atualizado_em'> = { id, ferramenta: 'aprovacao.decidir', argumentos: {}, resumo_humano: '', pedido_por_tipo: 'integrante', pode_aprovar: [], ...op.criarSeFaltar, ...decisao }
      return this.criar(base, { ...op, ferramenta: 'aprovacao.decidir', texto })
    }
    const atual = this.obter(id)!
    if (atual.status !== 'pendente' && atual.decidido_em) throw new ErroRegra(`Este cartão já foi decidido por ${String(atual.extras?.decidido_por_nome ?? atual.decidido_por)}.`)
    return this.atualizar(id, decisao, { ...op, ferramenta: 'aprovacao.decidir', texto })
  }
}

/* ---------- Notificação: publicar e marcar lida ---------- */

export class RepositorioNotificacoes extends Repositorio<'notificacao'> {
  ler(id: Id, usuarioId: Id) {
    const n = this.obter(id)
    if (!n || n.lida_por.includes(usuarioId)) return
    this.atualizar(id, { lida_por: [...n.lida_por, usuarioId] }, { ferramenta: 'notificacao.ler', texto: '' })
  }
  lerTodas(usuarioId: Id, ids: Id[]) {
    const alvo = ids.map((id) => this.obter(id)).filter((n): n is Notificacao => !!n && !n.lida_por.includes(usuarioId))
    if (!alvo.length) return
    bancoAtual().transacao((tx) => alvo.forEach((n) => tx.gravar('notificacao', { ...n, lida_por: [...n.lida_por, usuarioId], atualizado_em: agora() })))
  }
}

/* ---------- Estado de tela: chave e valor, sem evento ---------- */

export class RepositorioTela extends Repositorio<'registro_tela'> {
  lembrar(chave: string, valor: unknown) {
    const atual = this.obter(chave)
    bancoAtual().transacao((tx) => tx.gravar('registro_tela', { ...(atual ?? { id: chave, escritorio_id: bancoAtual().escritorioId ?? '', criado_em: agora() }), valor, atualizado_em: agora() }))
  }
  esquecer(chave: string) {
    if (this.obter(chave)) bancoAtual().transacao((tx) => tx.remover('registro_tela', chave))
  }
}

/* ---------- Regras por entidade ---------- */

const regras = <K extends NomeTabela>(r: RegrasEntidade<K>) => r
const porSetor = (r: { setor_id?: Id | null; cliente_id?: Id | null }) => ({ setor_id: r.setor_id ?? null, cliente_id: r.cliente_id ?? null })

export const repos = {
  escritorios: new Repositorio(b, regras({ tabela: 'escritorio', prefixo: 'esc', artigo: 'o escritório', ferramentas: { criar: 'escritorio.configurar', atualizar: 'escritorio.configurar' }, exclusao: 'proibida', rotulo: (r) => r.nome_fantasia })),
  assinaturas: new Repositorio(b, regras({ tabela: 'assinatura', prefixo: 'ass', artigo: 'a assinatura', ferramentas: { criar: 'escritorio.configurar', atualizar: 'escritorio.configurar' }, exclusao: 'proibida', rotulo: (r) => r.plano })),
  pessoas: new Repositorio(b, regras({ tabela: 'pessoa', prefixo: 'pe', artigo: 'a pessoa', ferramentas: { criar: 'pessoa.criar', atualizar: 'pessoa.atualizar' }, exclusao: 'proibida', motivoExclusaoProibida: 'Pessoa não se apaga: funda ou desative (R7).', rotulo: (r) => r.nome, validar: (r) => (r.nome.trim() ? null : 'A pessoa precisa de um nome.') })),
  identidades: new Repositorio(b, regras({ tabela: 'identidade', prefixo: 'id', artigo: 'a identidade', ferramentas: { criar: 'pessoa.atualizar', atualizar: 'pessoa.atualizar' }, exclusao: 'proibida', rotulo: (r) => r.valor })),
  usuarios: new Repositorio(b, regras({ tabela: 'usuario', prefixo: 'u', artigo: 'a conta de', ferramentas: { criar: 'conta.usuario.salvar', atualizar: 'conta.usuario.salvar' }, exclusao: 'proibida', motivoExclusaoProibida: 'Conta não se apaga: desative (o histórico continua).', rotulo: (r) => r.nome, validar: (r) => (!r.nome.trim() ? 'A conta precisa de um nome.' : !/^\S+@\S+\.\S+$/.test(r.email_login) ? 'E-mail inválido.' : null) })),
  vinculos: new Repositorio(b, regras({ tabela: 'vinculo_setor', prefixo: 'vs', artigo: 'o vínculo', ferramentas: { criar: 'conta.usuario.salvar', atualizar: 'conta.usuario.salvar', excluir: 'conta.usuario.salvar' }, exclusao: 'definitiva', rotulo: (r) => `${r.usuario_id} · ${r.setor_id}` })),
  excecoes: new Repositorio(b, regras({ tabela: 'excecao_tela', prefixo: 'x', artigo: 'a exceção', ferramentas: { criar: 'conta.excecao.salvar', atualizar: 'conta.excecao.salvar', excluir: 'conta.excecao.remover' }, exclusao: 'definitiva', rotulo: (r) => r.tela_ou_ferramenta, validar: (r) => (r.motivo.trim() ? null : 'A exceção precisa de motivo (vai para o evento).') })),
  carteiras: new Repositorio(b, regras({ tabela: 'carteira_cliente', prefixo: 'cc', artigo: 'o cliente da carteira', ferramentas: { criar: 'conta.usuario.salvar', atualizar: 'conta.usuario.salvar', excluir: 'conta.usuario.salvar' }, exclusao: 'definitiva', rotulo: (r) => r.cliente_id })),
  convites: new Repositorio(b, regras({ tabela: 'convite', prefixo: 'cv', artigo: 'o convite para', ferramentas: { criar: 'conta.usuario.salvar', atualizar: 'conta.usuario.salvar', excluir: 'conta.usuario.salvar' }, exclusao: 'definitiva', rotulo: (r) => r.destino })),
  setores: new Repositorio(b, regras({ tabela: 'setor', prefixo: 'st', artigo: 'o setor', ferramentas: { criar: 'setor.configurar', atualizar: 'setor.configurar' }, exclusao: 'proibida', motivoExclusaoProibida: 'Os setores são fixos: dá para renomear ou desativar (Fundações 4.1).', rotulo: (r) => r.nome_exibido })),
  clientes: new Repositorio(b, regras({ tabela: 'cliente', prefixo: 'cli', artigo: 'o cliente', ferramentas: { criar: 'cliente.criar', atualizar: 'cliente.atualizar', arquivar: 'cliente.arquivar', mover: 'cliente.mudar_estado' }, exclusao: 'proibida', motivoExclusaoProibida: 'Cliente não se apaga: arquive ou mude o estado do ciclo (R7).', rotulo: (r) => r.nome, alvo: (r) => ({ cliente_id: r.id ?? null }), validar: (r) => (!r.nome.trim() ? 'O cliente precisa de um nome.' : !r.documento.trim() ? 'Informe o CNPJ ou CPF.' : null) })),
  versoesPerfil: new Repositorio(b, regras({ tabela: 'versao_perfil', prefixo: 'vp', artigo: 'a versão do perfil', ferramentas: { criar: 'cliente.atualizar', atualizar: 'cliente.atualizar' }, exclusao: 'proibida', rotulo: (r) => r.vigente_de, alvo: (r) => ({ cliente_id: r.cliente_id ?? null }) })),
  obrigacoes: new RepositorioObrigacoes(b, regras({ tabela: 'obrigacao', prefixo: 'ob', artigo: 'a obrigação', ferramentas: { criar: 'obrigacao.criar', atualizar: 'obrigacao.atualizar' }, exclusao: 'proibida', motivoExclusaoProibida: 'Obrigação não se apaga: o Gestor cancela com motivo.', rotulo: (r) => r.nome, alvo: (r) => ({ setor_id: r.gera_tarefa_para_setor ?? null }) })),
  tarefas: new RepositorioTarefas(b, regras({ tabela: 'tarefa', prefixo: 'tk', artigo: 'a tarefa', ferramentas: { criar: 'tarefa.criar', atualizar: 'tarefa.atualizar', arquivar: 'tarefa.arquivar', reordenar: 'tarefa.reordenar', mover: 'tarefa.atualizar' }, exclusao: 'proibida', motivoExclusaoProibida: 'Tarefa não se apaga: cancele com motivo (Fundações 4.8).', rotulo: (r) => r.titulo, alvo: porSetor, validar: (r) => (!r.titulo.trim() ? 'A tarefa precisa de um título.' : !r.atividade_id ? 'A tarefa precisa da atividade do catálogo.' : null) })),
  leads: new Repositorio(b, regras({ tabela: 'lead', prefixo: 'ld', artigo: 'o lead', ferramentas: { criar: 'lead.criar', atualizar: 'lead.atualizar', mover: 'lead.mover', reordenar: 'lead.mover' }, exclusao: 'proibida', motivoExclusaoProibida: 'Lead não se apaga: marque como perdido, com motivo.', rotulo: (r) => r.empresa_nome ?? r.pessoa_id })),
  conversas: new Repositorio(b, regras({ tabela: 'conversa', prefixo: 'cv', artigo: 'a conversa', ferramentas: { criar: 'conversa.criar', atualizar: 'conversa.atualizar' }, exclusao: 'proibida', motivoExclusaoProibida: 'Conversa não se apaga: resolva.', rotulo: (r) => String(r.extras?.pessoa_nome ?? r.id), alvo: porSetor })),
  mensagens: new Repositorio(b, regras({ tabela: 'mensagem', prefixo: 'm', artigo: 'a mensagem', ferramentas: { criar: 'conversa.responder', atualizar: 'conversa.atualizar' }, exclusao: 'proibida', motivoExclusaoProibida: 'Mensagem enviada não se apaga.', rotulo: (r) => (r.corpo ?? '').slice(0, 40), linhaDoTempo: false })),
  documentos: new Repositorio(b, regras({ tabela: 'documento', prefixo: 'doc', artigo: 'o documento', ferramentas: { criar: 'documento.registrar', atualizar: 'documento.atualizar', arquivar: 'documento.arquivar' }, exclusao: 'proibida', motivoExclusaoProibida: 'Documento não se apaga: arquive (o registro de entrega fica).', rotulo: (r) => r.nome_arquivo, alvo: (r) => ({ cliente_id: r.cliente_id ?? null }) })),
  entregas: new Repositorio(b, regras({ tabela: 'registro_entrega', prefixo: 're', artigo: 'a entrega de', ferramentas: { criar: 'documento.registrar_entrega', atualizar: 'documento.registrar_entrega' }, exclusao: 'proibida', motivoExclusaoProibida: 'O registro de entrega só cresce (4.11).', rotulo: (r) => r.documento_id })),
  eventos: new Repositorio(b, regras({ tabela: 'evento', prefixo: 'ev', artigo: 'o evento', ferramentas: { criar: 'evento.listar', atualizar: 'evento.listar' }, exclusao: 'proibida', motivoExclusaoProibida: 'O registro de eventos é imutável (5.2).', rotulo: (r) => r.nome, semEvento: true, antesDeAtualizar: () => { throw new ErroRegra('O registro de eventos é imutável: correção é um evento novo (5.2).') } })),
  cartoes: new RepositorioCartoes(b, regras({ tabela: 'cartao_aprovacao', prefixo: 'ca', artigo: 'o cartão', ferramentas: { criar: 'aprovacao.decidir', atualizar: 'aprovacao.decidir' }, exclusao: 'proibida', rotulo: (r) => r.resumo_humano || r.id })),
  notificacoes: new RepositorioNotificacoes(b, regras({ tabela: 'notificacao', prefixo: 'av', artigo: 'o aviso', ferramentas: { criar: 'notificacao.publicar', atualizar: 'notificacao.ler', excluir: 'notificacao.ler' }, exclusao: 'definitiva', rotulo: (r) => r.titulo, semEvento: true })),
  integrantes: new Repositorio(b, regras({ tabela: 'integrante', prefixo: 'i', artigo: 'o integrante', ferramentas: { criar: 'integrante.configurar', atualizar: 'integrante.configurar' }, exclusao: 'proibida', motivoExclusaoProibida: 'Integrante não se apaga: desative (a memória e o histórico ficam).', rotulo: (r) => r.nome_exibido ?? r.setor })),
  mensagensIntegrante: new Repositorio(b, regras({ tabela: 'mensagem_integrante', prefixo: 'mi', artigo: 'a mensagem', ferramentas: { criar: 'integrante.enviar_mensagem', atualizar: 'integrante.enviar_mensagem' }, exclusao: 'proibida', rotulo: (r) => r.sessao_chave, semEvento: true })),
  filas: new Repositorio(b, regras({ tabela: 'item_fila', prefixo: 'tr', artigo: 'o trabalho', ferramentas: { criar: 'integrante.trabalhar', atualizar: 'integrante.trabalhar' }, exclusao: 'proibida', rotulo: (r) => String(r.extras?.titulo ?? r.id), semEvento: true })),
  conversasInternas: new Repositorio(b, regras({ tabela: 'conversa_interna', prefixo: 'ci', artigo: 'a conversa interna', ferramentas: { criar: 'conversa_interna.criar', atualizar: 'conversa_interna.criar' }, exclusao: 'proibida', motivoExclusaoProibida: 'Conversa interna é registro do escritório: não se apaga (subplano 11).', rotulo: (r) => r.nome ?? r.tipo })),
  participacoes: new Repositorio(b, regras({ tabela: 'participacao', prefixo: 'pa', artigo: 'a participação', ferramentas: { criar: 'conversa_interna.criar', atualizar: 'conversa_interna.criar' }, exclusao: 'proibida', motivoExclusaoProibida: 'Saída de grupo fica registrada: use saiu_em.', rotulo: (r) => r.usuario_id })),
  mensagensInternas: new RepositorioMensagensInternas(
    b,
    regras({
      tabela: 'mensagem_interna',
      prefixo: 'mn',
      artigo: 'a mensagem',
      ferramentas: { criar: 'mensagem_interna.enviar', atualizar: 'mensagem_interna.editar' },
      exclusao: 'proibida',
      motivoExclusaoProibida: 'Mensagem interna nunca se apaga, nem pelo Administrador (subplano 11). Dá para editar: a versão anterior fica guardada.',
      rotulo: (r) => r.corpo.slice(0, 40),
      linhaDoTempo: false,
      validar: (r) => (r.corpo.trim() ? null : 'A mensagem está vazia.'),
      antesDeAtualizar: (antes, depois, ctx) => {
        if (antes.autor_id !== idDoAtor(ctx.ator) && depois.corpo !== antes.corpo) throw new ErroRegra('Só quem escreveu pode editar a mensagem.')
        if (depois.corpo === antes.corpo) return depois
        return { ...depois, editada_em: agora(), versoes: [...antes.versoes, { corpo: antes.corpo, ate: agora(), por: idDoAtor(ctx.ator) ?? 'sistema' }] }
      },
    }),
  ),
  telas: new RepositorioTela(b, regras({ tabela: 'registro_tela', prefixo: 'rt', artigo: 'o estado de tela', ferramentas: { criar: 'tela.lembrar', atualizar: 'tela.lembrar', excluir: 'tela.lembrar' }, exclusao: 'definitiva', rotulo: (r) => r.id, semEvento: true })),
  notas: new Repositorio(b, regras({ tabela: 'nota_emitida', prefixo: 'nf', artigo: 'a nota', ferramentas: { criar: 'nfse.emitir', atualizar: 'nfse.cancelar' }, exclusao: 'proibida', motivoExclusaoProibida: 'Nota emitida não se apaga: cancele.', rotulo: (r) => `NFS-e ${r.numero}`, alvo: (r) => ({ cliente_id: r.cliente_id ?? null }) })),
  // S06 · Timesheet (05; Fundações 5.4). Nada se apaga: sessão corrigida fica com `substituida_por`.
  sessoes: new RepositorioSessoes(b, regras({ tabela: 'sessao_trabalho', prefixo: 'ss', artigo: 'a sessão', ferramentas: { criar: 'timesheet.registrar', atualizar: 'timesheet.registrar' }, exclusao: 'proibida', motivoExclusaoProibida: 'Sessão de trabalho não se apaga: corrija ou descarte (fica substituída).', rotulo: (r) => `${r.atividade_id ?? ''} ${r.rotulo}`.trim(), alvo: porSetor, linhaDoTempo: false })),
  itensConfirmacao: new RepositorioItensConfirmacao(b, regras({ tabela: 'item_confirmacao', prefixo: 'ic', artigo: 'o item', ferramentas: { criar: 'timesheet.registrar', atualizar: 'timesheet.confirmar' }, exclusao: 'proibida', motivoExclusaoProibida: 'Item de confirmação não se apaga: expira em 7 dias.', rotulo: (r) => r.texto, alvo: (r) => ({ setor_id: r.setor_id ?? null }), linhaDoTempo: false })),
  ausencias: new Repositorio(b, regras({ tabela: 'ausencia', prefixo: 'au', artigo: 'a ausência de', ferramentas: { criar: 'ausencia.registrar', atualizar: 'ausencia.registrar', arquivar: 'ausencia.registrar' }, exclusao: 'proibida', motivoExclusaoProibida: 'Ausência registrada não se apaga: cancele (fica no histórico).', rotulo: (r) => String(r.extras?.pessoa_nome ?? r.usuario_id), validar: (r) => (!r.inicio || !r.fim ? 'Informe o início e o fim.' : r.fim < r.inicio ? 'O fim é antes do início.' : null) })),
  custosHora: new Repositorio(b, regras({ tabela: 'custo_hora', prefixo: 'ch', artigo: 'o custo-hora', ferramentas: { criar: 'custo_hora.definir', atualizar: 'custo_hora.definir' }, exclusao: 'proibida', motivoExclusaoProibida: 'Custo-hora é versionado: defina um novo.', rotulo: (r) => `${r.competencia} · R$ ${r.valor}/h`, validar: (r) => (r.valor > 0 ? null : 'O custo-hora precisa ser maior que zero.') })),
  vinculosExtensao: new Repositorio(b, regras({ tabela: 'vinculo_extensao', prefixo: 've', artigo: 'a extensão de', ferramentas: { criar: 'extensao.vincular', atualizar: 'extensao.vincular' }, exclusao: 'proibida', rotulo: (r) => r.usuario_id, linhaDoTempo: false })),
  pulsos: new Repositorio(b, regras({ tabela: 'pulso_portal', prefixo: 'pp', artigo: 'os pulsos', ferramentas: { criar: 'extensao.pulso', atualizar: 'extensao.pulso' }, exclusao: 'proibida', rotulo: (r) => `${r.portal} · ${r.minutos} min`, semEvento: true })),
  portaisExtensao: new Repositorio(b, regras({ tabela: 'portal_extensao', prefixo: 'px', artigo: 'o portal', ferramentas: { criar: 'extensao.portal.pedir', atualizar: 'extensao.portal.configurar' }, exclusao: 'proibida', rotulo: (r) => r.portal, validar: (r) => (!r.portal.trim() ? 'Informe o portal.' : !/\./.test(r.dominio) ? 'Domínio inválido.' : null) })),
  conectoresCore: new Repositorio(b, regras({ tabela: 'conector_core', prefixo: 'cn', artigo: 'o conector', ferramentas: { criar: 'core.conectar', atualizar: 'core.conectar' }, exclusao: 'proibida', motivoExclusaoProibida: 'Conector não se apaga: desconecte.', rotulo: (r) => r.core })),
  equivalencias: new Repositorio(b, regras({ tabela: 'equivalencia_core', prefixo: 'eq', artigo: 'a equivalência', ferramentas: { criar: 'core.equivalencia', atualizar: 'core.equivalencia' }, exclusao: 'proibida', rotulo: (r) => `"${r.core_tipo_tarefa}"` })),
  duracoesPadrao: new Repositorio(b, regras({ tabela: 'duracao_padrao', prefixo: 'dp', artigo: 'a duração padrão de', ferramentas: { criar: 'timesheet.calibrar', atualizar: 'timesheet.calibrar' }, exclusao: 'proibida', rotulo: (r) => r.atividade_id, validar: (r) => (r.adotada_min != null && r.adotada_min <= 0 ? 'A duração precisa ser maior que zero.' : null) })),
  fechamentosTimesheet: new Repositorio(b, regras({ tabela: 'fechamento_timesheet', prefixo: 'ft', artigo: 'o fechamento', ferramentas: { criar: 'timesheet.fechar_mes', atualizar: 'timesheet.fechar_mes' }, exclusao: 'proibida', rotulo: (r) => `${r.competencia} · ${r.cliente_id}`, linhaDoTempo: false })),
  // S08: BPO (subplano 10), regras em ./bpo.ts
  bpo: criarReposBpo(b),
  // S07: Financeiro do escritório (09, 3.1)
  ...reposFinanceiro(b),
}

export type Repos = typeof repos

registrarRepoSessoes(() => repos.sessoes) // S06

// Backend (VITE_HEILD_BANCO=api): cada chamada de repositório da tela vira comando para a API.
instalarCapturaApi({ repos: repos as unknown as Record<string, unknown>, banco, definirGeradorId, novoIdPadrao, contextoAtual })

/** Registra um evento avulso (algo que aconteceu sem mudar uma linha: "Começou: conferir PGDAS-D"). */
export function registrar(texto: string, nome = 'atividade.registrar', op: { ctx?: OpcoesEscrita['ctx']; cliente_id?: Id | null; setor_id?: Id | null } = {}) {
  bancoAtual().transacao((tx) => registrarEvento(tx, op.ctx ?? contextoAtual(), { nome, ferramenta: 'evento.listar', texto, cliente_id: op.cliente_id ?? null, setor_id: op.setor_id ?? null }))
}

/** Linha nova com os campos de registro preenchidos, para gravar direto numa transação (semente, migração). */
export function linhaNova<K extends NomeTabela>(_tabela: K, dados: Omit<Tabelas[K], 'escritorio_id' | 'criado_em' | 'atualizado_em'> & Partial<Pick<Tabelas[K], 'criado_em'>>): Tabelas[K] {
  const quando = dados.criado_em ?? agora()
  return { ...dados, escritorio_id: bancoAtual().escritorioId ?? '', criado_em: quando, atualizado_em: quando } as Tabelas[K]
}

export { novoId }
