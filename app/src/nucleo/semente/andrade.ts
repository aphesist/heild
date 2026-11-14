import { fichas } from '@/ambiente/clientes'
import { avisosIniciais } from '@/dados/avisos'
import { documentosBase, visivelAoCliente } from '@/dados/arquivos'
import { escritorio as cfgEscritorio, setoresCfg, usuariosCfg } from '@/dados/configuracoes'
import { conversasCrm } from '@/dados/crm'
import * as exemplo from '@/dados/exemplo'
import { rotinas } from '@/dados/simulacao'
import type { CodigoSetor, Fotografia, Integrante } from '../modelo/entidades'
import { avisoParaModelo, clienteParaModelo, contaParaModelo, conversaParaModelo, documentoParaModelo, itemParaMensagem, mensagemTelaParaModelo, tarefaParaModelo, trabalhoParaModelo, type Consulta } from '../mapeadores'
import { montador, type EscritorioDeExemplo } from './comum'
import { canaisInternos, obrigacoesPadrao } from './padrao'
import { sementeComunicacaoInterna } from './s05' // S05
import { sementeS02 } from './s02'
import { sementeS06 } from './s06'

export const ID_ANDRADE = 'esc-andrade'

/** O escritório de demonstração completo: os dados de exemplo de src/dados, agora como entidades. */
export function sementeAndrade(): Fotografia {
  const { foto, add } = montador(ID_ANDRADE)
  add('escritorio', {
    id: ID_ANDRADE,
    razao_social: cfgEscritorio.razaoSocial,
    nome_fantasia: cfgEscritorio.nomeFantasia,
    cnpj: cfgEscritorio.cnpj,
    crc: cfgEscritorio.crc,
    fuso_horario: cfgEscritorio.fuso,
    inatividade_min: cfgEscritorio.inatividadeMin,
    carteira_ligada: cfgEscritorio.carteiraLigada,
    modo_bpo: cfgEscritorio.modoBpo,
    situacao: 'ativo',
    tema_id: 'fabrica',
    configuracao: { cenario: 'contabil_bpo', custo_por_pacote: false, segundo_fator: cfgEscritorio.segundoFator },
  })
  add('assinatura', { id: 'ass-andrade', dono_tipo: 'escritorio', dono_id: ID_ANDRADE, plano: exemplo.planoUso.plano, modulos: ['painel', 'crm', 'timesheet', 'agentes', 'consultor', 'app_cliente', 'financeiro', 'arquivos', 'bpo'], limites: { usuarios: 15, clientes: 300 }, vigente_de: '2026-01-01' })

  for (const s of setoresCfg)
    add('setor', {
      id: s.codigo,
      codigo: s.codigo as CodigoSetor,
      nome_padrao: s.nomePadrao,
      nome_exibido: s.nomeExibido,
      tem_equipe: s.temEquipe,
      ativo: s.ativo,
      numero_whatsapp: s.numero,
      responsavel_padrao_id: usuariosCfg.find((u) => u.nome === s.responsavel)?.id ?? null,
    })

  for (const u of usuariosCfg) {
    const c = contaParaModelo(u)
    add('pessoa', c.pessoa)
    add('identidade', { id: `id-${u.id}`, pessoa_id: c.pessoa.id, tipo: 'email', valor: u.email, principal: true, ativa: true })
    add('usuario', c.usuario)
    c.vinculos.forEach((v) => add('vinculo_setor', v))
    c.excecoes.forEach((x) => add('excecao_tela', x))
    c.carteira.forEach((x) => add('carteira_cliente', x))
  }
  add('convite', { id: 'cv-carla', tipo: 'usuario_escritorio', destino: 'carla@contabilandrade.com.br', papel_proposto: 'colaborador', setores_propostos: ['fiscal'], expira_em: '2026-11-23T12:00:00.000Z', enviado_por: 'u1' })

  for (const c of exemplo.clientes) {
    add('cliente', clienteParaModelo(c, fichas[c.id]))
    add('versao_perfil', { id: `vp-${c.id}`, cliente_id: c.id, vigente_de: '2026-01-01', regime: clienteParaModelo(c).regime, cnaes: [], uf: 'SP', servicos_contratados: c.servicos ?? ['contabil'], motivo_versao: 'Cadastro inicial', fonte: 'importacao' })
    for (const contato of fichas[c.id]?.contatos ?? []) {
      const pessoaId = `pe-${c.id}-${contato.nome.toLowerCase().replace(/[^a-z]+/g, '-')}`
      if (foto.pessoa.some((p) => p.id === pessoaId)) continue
      add('pessoa', { id: pessoaId, nome: contato.nome, tipo: 'cliente' })
      if (contato.whatsapp) add('identidade', { id: `id-${pessoaId}-w`, pessoa_id: pessoaId, tipo: 'whatsapp_id', valor: contato.whatsapp, principal: true, ativa: true })
      if (contato.email) add('identidade', { id: `id-${pessoaId}-e`, pessoa_id: pessoaId, tipo: 'email', valor: contato.email, principal: !contato.whatsapp, ativa: true })
    }
  }

  for (const i of exemplo.integrantes) {
    const linha: Omit<Integrante, 'escritorio_id' | 'criado_em' | 'atualizado_em'> = {
      id: i.id,
      usuario_dono_id: i.tipo === 'criado_pelo_usuario' ? 'u1' : null,
      tipo: i.tipo ?? 'padrao_setor',
      setor: i.setor,
      nome_exibido: i.nome,
      instrucoes: i.funcao,
      setores: [i.setor],
      canal_aviso: 'chat',
      situacao: i.situacao ?? 'ativo',
      extras: { setor_rotulo: i.setorRotulo, em_observacao: i.emObservacao },
    }
    add('integrante', linha)
  }

  const q: Consulta = { clientes: foto.cliente, usuarios: foto.usuario, integrantes: foto.integrante }
  exemplo.tarefas.forEach((t, i) => add('tarefa', { ...tarefaParaModelo(t, q), ordem: i + 1, status_desde: '2026-11-18T08:00:00.000Z' }))
  obrigacoesPadrao().forEach((o) => add('obrigacao', o))

  for (const c of conversasCrm) {
    const pessoa = foto.pessoa.find((p) => p.nome === c.pessoa.nome) ?? add('pessoa', { id: `pe-${c.id}`, nome: c.pessoa.nome, tipo: c.lead ? 'lead' : 'cliente' })
    add('conversa', conversaParaModelo(c, q, pessoa.id))
    c.itens.forEach((item, i) => add('mensagem', itemParaMensagem(c.id, item, i + 1)))
  }

  for (const d of documentosBase()) add('documento', documentoParaModelo(d, visivelAoCliente(d)))
  avisosIniciais.forEach((a, i) => add('notificacao', avisoParaModelo(a, avisosIniciais.length - i)))

  for (const [integrante, msgs] of Object.entries(exemplo.conversasPorIntegrante)) msgs.forEach((m, i) => add('mensagem_integrante', mensagemTelaParaModelo(`time:${integrante}`, m, i + 1)))

  // O time já está trabalhando quando a demonstração abre (rotinas que andam e terminam).
  const agora = Date.now()
  for (const { feitoSeg, ...r } of rotinas) add('item_fila', trabalhoParaModelo({ ...r, uid: `rot-${r.id}`, inicioEm: agora - feitoSeg * 1000, situacao: 'rodando', silencioso: true }))

  canaisInternos(foto.setor.filter((s) => s.tem_equipe && s.ativo).map((s) => ({ id: s.id, nome: s.nome_exibido })), foto.usuario, foto.vinculo_setor, add, [
    { canal: 'ci-geral', autor: 'u1', corpo: 'Bom dia, time! Lembrete: a DCTFWeb de outubro vence dia 20. O Fiscal já conferiu as de 6 clientes.' },
    { canal: 'ci-geral', autor: 'u4', corpo: 'A Metalúrgica Andrade mandou a alteração contratual assinada; já subi em Arquivos.' },
    { canal: 'ci-fiscal', autor: 'u7', corpo: 'Rita, da Metalúrgica, perguntou do ISS de Sorocaba. Alguém já viu isso?' },
    { canal: 'ci-fiscal', autor: 'u2', corpo: 'Vi: a filial ainda não tem inscrição municipal. Abri tarefa no Societário.' },
  ])
  sementeComunicacaoInterna(foto, add) // S05
  sementeS02(foto, add) // S02: regras com setor dono e o calendário de 10/2026
  sementeS06({ clientes: foto.cliente, tarefas: foto.tarefa, usuarios: foto.usuario }, add, 'andrade') // S06: Timesheet
  return foto
}

export const escritorioAndrade: EscritorioDeExemplo = {
  id: ID_ANDRADE,
  nome: 'Contábil Andrade & Lima',
  descricao: 'Escritório completo: contabilidade com BPO, 10 clientes e a equipe toda.',
  completo: true,
  semente: sementeAndrade,
}
