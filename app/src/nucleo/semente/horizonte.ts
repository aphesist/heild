import { setoresCfg } from '@/dados/configuracoes'
import type { CodigoSetor, Fotografia } from '../modelo/entidades'
import { montador, type EscritorioDeExemplo } from './comum'
import { canaisInternos, obrigacoesPadrao } from './padrao'

export const ID_HORIZONTE = 'esc-horizonte'

/**
 * Segundo escritório de exemplo: pequeno, em implantação, só contabilidade
 * (sem BPO), com três pessoas e quatro clientes. Serve para mostrar o sistema
 * quase vazio, o isolamento entre escritórios e as telas que já leem do banco.
 * Nomes, CNPJs e pessoas são fictícios.
 */
export function sementeHorizonte(): Fotografia {
  const { foto, add } = montador(ID_HORIZONTE)
  add('escritorio', {
    id: ID_HORIZONTE,
    razao_social: 'Horizonte Contabilidade Ltda',
    nome_fantasia: 'Horizonte',
    cnpj: '44.555.666/0001-77',
    crc: 'PR-1PR009876/O-2',
    fuso_horario: 'America/Sao_Paulo',
    inatividade_min: 3,
    carteira_ligada: false,
    modo_bpo: false,
    situacao: 'ativo',
    tema_id: 'horizonte',
    configuracao: { cenario: 'contabil_bpo', custo_por_pacote: false, segundo_fator: 'administradores' },
  })
  add('assinatura', { id: 'ass-horizonte', dono_tipo: 'escritorio', dono_id: ID_HORIZONTE, plano: 'Escritório Essencial', modulos: ['painel', 'crm', 'timesheet', 'agentes', 'consultor', 'app_cliente', 'financeiro', 'arquivos'], limites: { usuarios: 5, clientes: 80 }, vigente_de: '2026-11-01' })

  const responsavel: Record<string, string> = { fiscal: 'h-u2', contabil: 'h-u2', dp: 'h-u3' }
  for (const s of setoresCfg)
    add('setor', { id: s.codigo, codigo: s.codigo as CodigoSetor, nome_padrao: s.nomePadrao, nome_exibido: s.nomePadrao, tem_equipe: s.temEquipe, ativo: s.codigo !== 'bpo_financeiro' && s.ativo, responsavel_padrao_id: responsavel[s.codigo] ?? 'h-u1' })

  const contas = [
    { id: 'h-u1', nome: 'Helena Duarte', email: 'helena@horizontecontabil.com.br', papel: 'administrador' as const, vinculos: [] },
    { id: 'h-u2', nome: 'Paulo Reis', email: 'paulo@horizontecontabil.com.br', papel: 'gestor' as const, vinculos: [['fiscal', 'gestao'], ['contabil', 'execucao'], ['notas', 'execucao']] as const },
    { id: 'h-u3', nome: 'Júlia Matos', email: 'julia@horizontecontabil.com.br', papel: 'colaborador' as const, vinculos: [['dp', 'execucao'], ['societario', 'execucao']] as const },
  ]
  for (const c of contas) {
    add('pessoa', { id: `pe-${c.id}`, nome: c.nome, tipo: 'equipe' })
    add('usuario', { id: c.id, pessoa_id: `pe-${c.id}`, nome: c.nome, papel: c.papel, email_login: c.email, situacao: 'ativo', segundo_fator: c.papel === 'administrador', ultimo_acesso: 'hoje', preferencias: {} })
    for (const [setor, modo] of c.vinculos) add('vinculo_setor', { id: `vs-${c.id}-${setor}`, usuario_id: c.id, setor_id: setor, modo, vigente_de: '2026-11-01' })
  }

  const clientes = [
    { id: 'h-c1', codigo: '101', nome: 'Oficina Mecânica Ponte Alta Ltda', documento: '81.234.567/0001-10', regime: 'simples' as const, estado: 'ativo' as const },
    { id: 'h-c2', codigo: '102', nome: 'Farmácia Vida Plena Ltda', documento: '82.345.678/0001-21', regime: 'presumido' as const, estado: 'ativo' as const },
    { id: 'h-c3', codigo: '103', nome: 'Beatriz Lacerda', documento: '987.654.321-00', regime: 'pf' as const, estado: 'ativo' as const },
    { id: 'h-c4', codigo: '104', nome: 'Estúdio Lume Fotografia ME', documento: '83.456.789/0001-32', regime: 'simples' as const, estado: 'em_implantacao' as const },
  ]
  for (const c of clientes) {
    add('cliente', { id: c.id, tipo: c.regime === 'pf' ? 'pf' : 'pj', codigo: c.codigo, documento: c.documento, nome: c.nome, estado_ciclo: c.estado, estado_ciclo_desde: '2026-11-01', regime: c.regime, servicos_contratados: ['contabil'], extras: { servicos_definidos: false } })
    add('versao_perfil', { id: `vp-${c.id}`, cliente_id: c.id, vigente_de: '2026-11-01', regime: c.regime, cnaes: [], uf: 'PR', servicos_contratados: ['contabil'], motivo_versao: 'Cadastro inicial', fonte: 'importacao' })
  }

  for (const [id, setor, tipo] of [
    ['h-i-geral', 'geral', 'geral'],
    ['h-i-fiscal', 'fiscal', 'padrao_setor'],
    ['h-i-dp', 'dp', 'padrao_setor'],
    ['h-i-contabil', 'contabil', 'padrao_setor'],
  ] as const)
    add('integrante', { id, tipo, setor, instrucoes: '', setores: [setor], canal_aviso: 'chat', situacao: 'ativo', usuario_dono_id: null })

  const t = (id: string, codigo: string, titulo: string, cliente: string | null, setor: string, prazo: string, status: 'a_fazer' | 'em_andamento' | 'aguardando_cliente' | 'concluida', resp: string, atrasada = false) =>
    add('tarefa', {
      id,
      cliente_id: cliente,
      setor_id: setor,
      atividade_id: codigo,
      titulo,
      origem: 'obrigacao',
      responsavel_tipo: 'usuario',
      responsavel_id: resp,
      quem_conclui: 'pessoa',
      status,
      status_desde: '2026-11-18T08:00:00.000Z',
      prazo_interno: prazo,
      prioridade: atrasada ? 'alta' : 'normal',
      checklist: [],
      risco: false,
      extras: { atrasada, responsavel_nome: contas.find((c) => c.id === resp)?.nome, responsavel_tipo_tela: 'pessoa' },
    })
  t('h-t1', 'FIS-009', 'PGDAS-D de outubro', 'h-c1', 'fiscal', '2026-11-20', 'em_andamento', 'h-u2')
  t('h-t2', 'FIS-021', 'EFD-Contribuições de outubro', 'h-c2', 'fiscal', '2026-11-14', 'a_fazer', 'h-u2', true)
  t('h-t3', 'DP-012', 'Folha de novembro e eSocial', 'h-c1', 'dp', '2026-11-25', 'a_fazer', 'h-u3')
  t('h-t4', 'CTB-010', 'Balancete de outubro', 'h-c2', 'contabil', '2026-11-25', 'aguardando_cliente', 'h-u2')
  t('h-t5', 'SOC-020', 'Implantação: procuração e-CAC do Estúdio Lume', 'h-c4', 'societario', '2026-11-22', 'em_andamento', 'h-u3')
  t('h-t6', 'PF-001', 'Organizar documentos da DIRPF 2027', 'h-c3', 'contabil', '2026-12-15', 'a_fazer', 'h-u2')
  obrigacoesPadrao().forEach((o) => add('obrigacao', o))

  add('pessoa', { id: 'pe-h-ricardo', nome: 'Ricardo Ponte', tipo: 'cliente' })
  add('identidade', { id: 'id-h-ricardo', pessoa_id: 'pe-h-ricardo', tipo: 'whatsapp_id', valor: '+55 41 99812-3344', principal: true, ativa: true })
  add('conversa', {
    id: 'h-cv1',
    cliente_id: 'h-c1',
    pessoa_id: 'pe-h-ricardo',
    setor_id: 'fiscal',
    responsavel_id: 'h-u2',
    status: 'em_atendimento',
    canal_resposta_atual: 'whatsapp',
    etiquetas: [],
    ultima_mensagem_em: '2026-11-18T12:10:00.000Z',
    extras: { tela: { cliente: 'Oficina Mecânica Ponte Alta Ltda', pessoa: { nome: 'Ricardo Ponte', papel: 'sócio', contato: '+55 41 99812-3344' }, prazoMin: 42, previa: 'Ricardo Ponte: Mando as notas de compra hoje à tarde.', janelaAberta: true, responsavel: 'Paulo Reis' }, pessoa_nome: 'Ricardo Ponte' },
  })
  const msg = (id: string, ordem: number, de: 'cliente' | 'atendente', texto: string, hora: string) =>
    add('mensagem', { id, conversa_id: 'h-cv1', ordem, direcao: de === 'cliente' ? 'entrada' : 'saida', canal: 'whatsapp', autor_tipo: de === 'cliente' ? 'pessoa' : 'usuario', corpo: texto, origem_externa: de === 'cliente', status_entrega: de === 'atendente' ? 'lida' : null, extras: { item: { tipo: 'mensagem', id, de, autor: de === 'cliente' ? 'Ricardo Ponte' : 'Paulo Reis', hora, canal: 'whatsapp', texto, ...(de === 'atendente' ? { entrega: 'lida' } : {}) } } })
  add('mensagem', { id: 'h-cv1-dia', conversa_id: 'h-cv1', ordem: 0, direcao: 'saida', canal: 'sistema', autor_tipo: 'sistema', corpo: 'Hoje', origem_externa: false, extras: { item: { tipo: 'dia', texto: 'Hoje' } } })
  msg('h-m1', 1, 'atendente', 'Bom dia, Ricardo! Para fechar o PGDAS-D de outubro, faltam as notas de compra de peças.', '09:02')
  msg('h-m2', 2, 'cliente', 'Mando as notas de compra hoje à tarde.', '09:10')

  const doc = (id: string, cliente: string, nome: string, tipo: string, pasta: string[]) =>
    add('documento', { id, cliente_id: cliente, tipo, competencia: '2026-10', nome_arquivo: nome, mime: 'application/pdf', tamanho_bytes: 184_320, hash_sha256: id.padEnd(12, '0'), origem: 'upload_equipe', backend_id: 'heild', caminho: pasta.join('/'), visivel_ao_cliente: true, versao: 1, extras: { pasta, quando: 'ontem', por: 'Paulo Reis', tamanho: '180 KB' } })
  doc('h-d1', 'h-c1', 'Contrato social Ponte Alta.pdf', 'contrato', ['Societário'])
  doc('h-d2', 'h-c2', 'Extrato outubro Farmácia Vida Plena.pdf', 'extrato', ['Contábil', '2026', '10'])
  doc('h-d3', 'h-c4', 'Procuração e-CAC Estúdio Lume.pdf', 'procuracao', ['Societário'])

  add('notificacao', { id: 'h-av1', ordem: 2, destinatario_tipo: 'usuario', destinatario_ids: ['h-u1', 'h-u2'], setor_id: 'fiscal', categoria: 'prazo', prioridade: 'alta', titulo: 'EFD-Contribuições da Farmácia Vida Plena atrasada', corpo: 'venceu em 14/11', publicada_por_tipo: 'sistema', lida_por: [], quando: '08:00', acao: { modulo: 'painel', aba: 'fiscal', tarefa: 'h-t2' } })
  add('notificacao', { id: 'h-av2', ordem: 1, destinatario_tipo: 'todos', destinatario_ids: [], categoria: 'sistema', prioridade: 'normal', titulo: 'Bem-vindos à Horizonte na Heild', corpo: 'O escritório está em implantação: 4 clientes cadastrados.', publicada_por_tipo: 'sistema', lida_por: [], quando: 'ontem' })

  canaisInternos(
    foto.setor.filter((s) => s.tem_equipe && s.ativo).map((s) => ({ id: s.id, nome: s.nome_exibido })),
    foto.usuario,
    foto.vinculo_setor,
    add,
    [{ canal: 'ci-geral', autor: 'h-u1', corpo: 'Começamos! Cadastrei os quatro primeiros clientes; a procuração do Estúdio Lume está com a Júlia.' }],
  )
  return foto
}

export const escritorioHorizonte: EscritorioDeExemplo = {
  id: ID_HORIZONTE,
  nome: 'Horizonte Contabilidade',
  descricao: 'Escritório pequeno em implantação: só contabilidade, 3 pessoas e 4 clientes.',
  completo: false,
  semente: sementeHorizonte,
}
