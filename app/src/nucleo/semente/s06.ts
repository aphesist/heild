// S06 · Semente do Timesheet: sessões de novembro (até hoje, 18/11), itens de confirmação,
// contestações, anomalias, integrantes em série separada, extensão, cores, custo-hora e os
// fechamentos dos 12 meses anteriores. Determinística: a mesma em toda máquina.
import { atividadeTs, pacoteDaAtividade, rotuloAtividade, setorDaAtividade } from '@/dados/timesheet-catalogo'
import { dh, diasUteis, HOJE_TS, minHora, somarDias } from '@/dados/timesheet-tempo'
import { artefatosSemPessoa, calibracao, conectores, custoHora as custoProt, dominios, filaSemEquivalente, mapasDepartamento, mapasResponsavel, rentabilidade as rentProt, sessoesPorUsuario, type SessaoTs } from '@/dados/timesheet'
import { empresasBpo } from '@/dados/bpo'
import type { Cliente, ItemConfirmacao, SessaoTrabalho, Tabelas, Tarefa, Usuario } from '../modelo/entidades'

type Add = <K extends keyof Tabelas>(tabela: K, linha: Omit<Tabelas[K], 'escritorio_id' | 'criado_em' | 'atualizado_em'> & { criado_em?: string }) => Tabelas[K]
type SemReg<T> = Omit<T, 'escritorio_id' | 'criado_em' | 'atualizado_em'>

export interface BaseS06 {
  clientes: Pick<Cliente, 'id' | 'nome'>[]
  tarefas: Pick<Tarefa, 'id' | 'atividade_id' | 'cliente_id'>[]
  usuarios: Pick<Usuario, 'id' | 'nome' | 'situacao'>[]
}

/** Gerador pseudoaleatório com semente (mulberry32). */
function aleatorio(semente: string) {
  let h = 1779033703
  for (let i = 0; i < semente.length; i++) h = Math.imul(h ^ semente.charCodeAt(i), 3432918353)
  let a = h >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const hh = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
const NOV = '2026-11-02'

/** O que cada pessoa costuma fazer: atividade, cliente (nome) e de onde vem o tempo. */
type Molde = [atividade: string, cliente: string | null, origem: SessaoTrabalho['origem'] | 'crm']

const moldesAndrade: Record<string, Molde[]> = {
  u1: [['FIS-019', 'Metalúrgica Andrade Ltda', 'plataforma'], ['FIS-009', 'Padaria Pão Quente ME', 'plataforma'], ['FIS-004', 'Metalúrgica Andrade Ltda', 'core'], ['GES-025', 'Transportes Rota Sul S.A.', 'crm'], ['FIS-005', 'Loja Bela Vista Eireli', 'extensao'], ['FIS-019', 'Transportes Rota Sul S.A.', 'plataforma'], ['FIN-201', 'Clínica Sorriso Ltda', 'plataforma']],
  u2: [['CTB-015', 'Metalúrgica Andrade Ltda', 'core'], ['CTB-047', 'Clínica Sorriso Ltda', 'plataforma'], ['FIS-038', 'Transportes Rota Sul S.A.', 'plataforma'], ['GES-025', 'Clínica Sorriso Ltda', 'crm'], ['CTB-028', 'Transportes Rota Sul S.A.', 'plataforma'], ['CTB-015', 'Padaria Pão Quente ME', 'core']],
  u3: [['DP-011', 'Metalúrgica Andrade Ltda', 'plataforma'], ['DP-011', 'Transportes Rota Sul S.A.', 'plataforma'], ['DP-001', 'Padaria Pão Quente ME', 'crm'], ['DP-016', 'Loja Bela Vista Eireli', 'extensao'], ['DP-019', 'Loja Bela Vista Eireli', 'artefato'], ['DP-014', 'Transportes Rota Sul S.A.', 'plataforma']],
  u4: [['SOC-031', 'Metalúrgica Andrade Ltda', 'extensao'], ['GES-025', null, 'crm'], ['SOC-009', 'Clínica Sorriso Ltda', 'plataforma'], ['GES-024', null, 'crm'], ['SOC-017', 'Padaria Pão Quente ME', 'plataforma']],
  u5: [['FIS-009', 'Loja Bela Vista Eireli', 'plataforma'], ['FIS-010', 'Padaria Pão Quente ME', 'artefato'], ['FIS-005', 'Clínica Sorriso Ltda', 'extensao'], ['FIS-024', 'Metalúrgica Andrade Ltda', 'plataforma'], ['FIS-028', 'Transportes Rota Sul S.A.', 'plataforma']],
  u7: [['FIS-009', 'Padaria Pão Quente ME', 'plataforma'], ['NFE-021', 'Metalúrgica Andrade Ltda', 'plataforma'], ['NFE-008', 'Transportes Rota Sul S.A.', 'extensao'], ['FIS-010', 'Café Central ME', 'artefato'], ['GES-025', 'Padaria Pão Quente ME', 'crm']],
  u8: [['FIN-201', 'Padaria Pão Quente ME', 'plataforma'], ['FIN-006', 'Studio Forma Arquitetura Ltda', 'plataforma'], ['BPO-009', 'Loja Bela Vista Eireli', 'plataforma'], ['FIN-004', 'Clínica Sorriso Ltda', 'plataforma']],
  u9: [['FIN-003', 'Mercado Bom Preço Ltda', 'plataforma'], ['FIN-004', 'Mercado Bom Preço Ltda', 'artefato'], ['FIN-201', 'AutoPeças Rota 9 Ltda', 'plataforma'], ['FIN-003', 'Loja Bela Vista Eireli', 'plataforma']],
}

const moldesHorizonte: Record<string, Molde[]> = {
  'h-u1': [['GES-025', 'Farmácia Vida Plena Ltda', 'crm'], ['GES-045', 'Estúdio Lume Fotografia ME', 'plataforma'], ['FIS-004', 'Farmácia Vida Plena Ltda', 'plataforma']],
  'h-u2': [['FIS-009', 'Oficina Mecânica Ponte Alta Ltda', 'plataforma'], ['FIS-019', 'Farmácia Vida Plena Ltda', 'extensao'], ['CTB-015', 'Farmácia Vida Plena Ltda', 'plataforma'], ['FIS-010', 'Estúdio Lume Fotografia ME', 'artefato']],
  'h-u3': [['DP-011', 'Oficina Mecânica Ponte Alta Ltda', 'plataforma'], ['DP-001', 'Farmácia Vida Plena Ltda', 'crm'], ['DP-019', 'Oficina Mecânica Ponte Alta Ltda', 'artefato']],
}

/** Integrantes de cada dono (série separada). */
const integrantesDe: Record<string, string[]> = { u1: ['i-fiscal', 'i-contabil'], u2: ['i-contabil'], u3: ['i-dp'], u4: ['i-atendimento', 'i-societario'], u5: ['i-fiscal'], u7: ['i-notas'], u8: ['i-bpo'], u9: ['i-bpo-conciliacao'], 'h-u1': ['h-i-fiscal'], 'h-u2': ['h-i-fiscal'], 'h-u3': ['h-i-dp'] }
const setorDoIntegrante = (i: string) => (i.includes('bpo') ? 'bpo_financeiro' : i.includes('contabil') ? 'contabil' : i.includes('dp') ? 'dp' : i.includes('notas') ? 'notas' : i.includes('atendimento') ? 'gestao_atendimento' : i.includes('societario') ? 'societario' : 'fiscal')
const trabalhosIntegrante: Record<string, [string, string][]> = {
  fiscal: [['FIS-009', 'Preparou o PGDAS-D de 14 clientes do Simples'], ['FIS-005', 'Leu 6 caixas postais e abriu 1 tarefa'], ['FIS-019', 'Conferiu 9 DCTFWeb contra a EFD-Reinf'], ['FIS-010', 'Gerou 12 guias DAS e mandou ao app']],
  contabil: [['CTB-015', 'Classificou 412 linhas do extrato da Metalúrgica'], ['CTB-028', 'Montou o balancete de 3 clientes para revisão']],
  dp: [['DP-011', 'Conferiu as variáveis da folha de 4 clientes'], ['DP-014', 'Conferiu o ponto de outubro da Loja Bela Vista']],
  notas: [['NFE-021', 'Cruzou XML e notas de 7 clientes'], ['NFE-015', 'Preparou 22 manifestações']],
  gestao_atendimento: [['GES-025', 'Respondeu 18 perguntas frequentes no WhatsApp'], ['GES-024', 'Encaminhou 31 conversas ao setor certo']],
  societario: [['SOC-009', 'Avisou 3 clientes do certificado vencendo']],
  bpo_financeiro: [['FIN-003', 'Capturou 27 contas por DDA e e-mail'], ['FIN-004', 'Conciliou 186 lançamentos']],
}

export function sementeS06(base: BaseS06, add: Add, escritorio: 'andrade' | 'horizonte') {
  const andrade = escritorio === 'andrade'
  const idCliente = (nome: string | null | undefined) => (nome ? (base.clientes.find((c) => c.nome === nome)?.id ?? null) : null)
  const tarefaDe = (atividade?: string | null, cliente?: string | null) => (atividade && cliente ? (base.tarefas.find((t) => t.atividade_id === atividade && t.cliente_id === cliente)?.id ?? null) : null)
  const moldes = andrade ? moldesAndrade : moldesHorizonte
  const ausentes: Record<string, [string, string][]> = andrade ? { u3: [['2026-11-03', '2026-11-07']] } : {}
  const jornadaFim = minHora('18:00')
  const sessoes: SemReg<SessaoTrabalho>[] = []
  const itens: SemReg<ItemConfirmacao>[] = []
  let n = 0
  const novoIdS = (p: string) => `${p}-s06-${(n++).toString(36)}`

  const sessao = (u: string, dia: string, ini: string, fim: string, atividade: string | null, cliente: string | null, origem: Molde[2], confianca: SessaoTrabalho['confianca'], evidencias: string[], extra: Partial<SessaoTrabalho> = {}): SemReg<SessaoTrabalho> => {
    const cid = idCliente(cliente)
    const s: SemReg<SessaoTrabalho> = {
      id: extra.id ?? novoIdS('ss'),
      ator_tipo: 'pessoa',
      ator_id: u,
      usuario_dono_id: u,
      cliente_id: cid,
      setor_id: setorDaAtividade(atividade),
      atividade_id: atividade,
      rotulo: atividade ? rotuloAtividade(atividade) : 'sem tarefa',
      tarefa_id: origem === 'plataforma' ? tarefaDe(atividade, cid) : null,
      conversa_id: origem === 'crm' ? `conversa-${cid ?? 'fila'}` : null,
      origem: origem === 'crm' ? 'plataforma' : origem,
      inicio: dh(dia, ini),
      fim: dh(dia, fim),
      confianca,
      evidencias,
      pacote: pacoteDaAtividade(atividade),
      fora_da_jornada: minHora(ini) < minHora('08:00') || minHora(fim) > jornadaFim,
      // C2-25: o serviço extra fica marcado (no produto, pela tarefa marcada como extra na ficha).
      ...(atividade === 'SOC-017' ? { extras: { servico_extra: { descricao: 'Serviço fora do contrato (comanda digital)' } } } : {}),
      ...extra,
    }
    sessoes.push(s)
    return s
  }

  const evidenciaPadrao = (m: Molde, cliente: string | null, r: () => number) => {
    const [at, , origem] = m
    const nome = cliente ?? 'fila do setor'
    if (origem === 'plataforma') return [`tarefa ${at} aberta (${nome})`, `${2 + Math.floor(r() * 9)} ações na plataforma`]
    if (origem === 'crm') return [`assumiu conversa de ${nome} no CRM`, `etiqueta "${rotuloAtividade(at).toLowerCase()}"`]
    if (origem === 'extensao') return [`${10 + Math.floor(r() * 60)} pulsos no portal com o CNPJ de ${nome}`, `tarefa ${at} aberta`]
    if (origem === 'core') return [`tarefa ${at} aberta`, `core: "${rotuloAtividade(at)}" concluída (vira evidência, não sessão nova)`]
    return [`arquivo de ${rotuloAtividade(at)} salvo na pasta de ${nome}`, `duração padrão do cliente, aparada às sessões vizinhas`]
  }

  /** Preenche um dia passado com blocos, deixando livres os intervalos reservados. */
  const preencher = (u: string, dia: string, reservados: [number, number][], ate = jornadaFim) => {
    const r = aleatorio(`${u}:${dia}`)
    const lista = moldes[u] ?? []
    if (!lista.length) return
    const janelas: [number, number][] = [
      [minHora('08:00') + Math.floor(r() * 4) * 5, minHora('12:00') + Math.floor(r() * 3) * 5],
      [minHora('13:00') + Math.floor(r() * 4) * 5, Math.min(ate, minHora('17:20') + Math.floor(r() * 6) * 5)],
    ]
    for (const [ji, jf] of janelas) {
      let t = ji
      while (t < jf - 20) {
        const livre = reservados.find(([a, b]) => t >= a && t < b)
        if (livre) {
          t = livre[1]
          continue
        }
        const proxRes = reservados.filter(([a]) => a > t).sort((x, y) => x[0] - y[0])[0]
        const dur = [35, 45, 55, 70, 90, 110, 130][Math.floor(r() * 7)]
        const fim = Math.min(t + dur, jf, proxRes ? proxRes[0] : jf)
        if (fim - t < 15) {
          t = fim
          continue
        }
        // de vez em quando, um buraco sem pista vira "sem classificação"
        if (r() < 0.08 && fim - t >= 25) {
          t = fim
          continue
        }
        const m = lista[Math.floor(r() * lista.length)]
        const x = r()
        const confianca: SessaoTrabalho['confianca'] = m[2] === 'artefato' ? 'estimada' : x < 0.12 ? 'confirmada' : 'automatica'
        sessao(u, dia, hh(t), hh(fim), m[0], m[1], confianca === 'confirmada' && m[2] !== 'core' ? 'confirmacao' : m[2], confianca, evidenciaPadrao(m, m[1], r))
        t = fim + (r() < 0.6 ? 0 : 5)
      }
    }
    // Fora da jornada: a Fernanda responde cliente à noite de vez em quando (marcado, sem alerta).
    if (u === 'u1' && r() < 0.45) sessao(u, dia, '20:30', hh(minHora('20:30') + 15 + Math.floor(r() * 4) * 10), 'GES-025', 'Padaria Pão Quente ME', 'crm', 'automatica', ['respondeu o cliente pelo WhatsApp'])
  }

  const usuariosAtivos = Object.keys(moldes).filter((u) => base.usuarios.some((x) => x.id === u && x.situacao === 'ativo'))
  const diasPassados = diasUteis(NOV, somarDias(HOJE_TS, -1))
  const reservas: Record<string, [string, string][]> = andrade
    ? {
        'u1:2026-11-17': [['11:20', '11:50'], ['15:10', '16:40'], ['16:45', '17:30']],
        'u2:2026-11-16': [['09:00', '11:20']],
        'u4:2026-11-17': [['14:00', '17:00']],
        'u3:2026-11-17': [['08:10', '08:40']],
        'u7:2026-11-16': [['14:00', '15:30']],
        'u5:2026-11-16': [['10:00', '12:00'], ['13:00', '14:00']],
        'u7:2026-11-17': [['13:00', '19:30']],
        'u2:2026-11-13': [['14:00', '15:00']],
      }
    : {}
  for (const u of usuariosAtivos)
    for (const dia of diasPassados) {
      if ((ausentes[u] ?? []).some(([a, b]) => dia >= a && dia <= b)) continue
      const res = (reservas[`${u}:${dia}`] ?? []).map(([a, b]) => [minHora(a), minHora(b)] as [number, number])
      preencher(u, dia, res)
    }

  // Hoje: o dia detalhado de cada pessoa (o mesmo do protótipo), com buracos virando itens de confirmação.
  const hoje = HOJE_TS
  const doHoje = andrade ? sessoesPorUsuario : {}
  const idsHoje: Record<string, string> = {}
  for (const [u, lista] of Object.entries(doHoje)) {
    for (const s of lista as SessaoTs[]) {
      if (s.rotulo === 'sem registro' || s.confianca === 'sem') {
        const cid = idCliente(s.cliente)
        const antes = lista.find((x) => x.fim === s.inicio)
        itens.push({
          id: novoIdS('ic'),
          usuario_id: u,
          setor_id: setorDaAtividade(antes?.atividade),
          dia: hoje,
          inicio: dh(hoje, s.inicio),
          fim: dh(hoje, s.fim),
          tipo: s.confianca === 'sem' ? 'sem_pista' : 'buraco',
          texto: s.confianca === 'sem' ? 'Sem registro e sem pista' : `${minHora(s.fim) - minHora(s.inicio)} min sem registro`,
          pista: s.confianca === 'sem' ? '—' : s.evidencias[1] ?? 'antes e depois: a mesma tarefa',
          sugestao: s.confianca === 'sem' ? null : { atividade_id: antes?.atividade ?? null, rotulo: rotuloAtividade(antes?.atividade), cliente_id: cid, minutos: minHora(s.fim) - minHora(s.inicio), tarefa_id: tarefaDe(antes?.atividade, cid) },
          situacao: s.confianca === 'sem' ? 'pendente' : 'marcado',
          expira_em: dh(somarDias(hoje, 7), '23:59'),
        })
        continue
      }
      const origem: Molde[2] = s.origem === 'crm' ? 'crm' : s.origem === 'confirmacao' ? (s.confianca === 'confirmada' ? 'confirmacao' : 'artefato') : s.origem
      const nova = sessao(u, hoje, s.inicio, s.fim, s.atividade ?? null, s.cliente ?? null, origem, s.confianca === 'contestada' ? 'automatica' : s.confianca, s.evidencias)
      idsHoje[`${u}:${s.id}`] = nova.id
    }
  }
  // Carla começou o dia agora há pouco; o resto da equipe já tem o dia inteiro.
  if (andrade) preencher('u5', hoje, [], minHora('12:00'))
  else for (const u of usuariosAtivos) preencher(u, hoje, [], minHora('12:00'))

  // Sessões marcadas (contestações, anomalias, conflitos), nos intervalos reservados.
  if (andrade) {
    const agora = (dia: string, h: string) => dh(dia, h)
    sessao('u2', '2026-11-16', '09:00', '11:20', 'CTB-015', 'Metalúrgica Andrade Ltda', 'plataforma', 'contestada', ['tarefa CTB-015 Metalúrgica aberta às 09:00', 'nenhum artefato da Metalúrgica no intervalo', '2 documentos da Clínica classificados às 10:40'], {
      contestacao: { por: 'u2', em: agora('2026-11-16', '17:40'), motivo: 'cliente', correcao: 'Clínica Sorriso Ltda', correcao_dados: { cliente_id: idCliente('Clínica Sorriso Ltda') }, nota: 'Estava com a tarefa da Metalúrgica aberta, mas conciliei a Clínica.', status: 'pendente', confianca_antes: 'automatica' },
    })
    sessao('u4', '2026-11-17', '14:00', '17:00', 'SOC-031', 'Metalúrgica Andrade Ltda', 'plataforma', 'contestada', ['tarefa aberta às 14:00', 'último evento às 15:08', 'pulsos até 17:00 sem entrada (tela aberta)'], {
      contestacao: { por: 'u4', em: agora('2026-11-17', '17:30'), motivo: 'tempo', correcao: '14:00–15:10', correcao_dados: { inicio: agora('2026-11-17', '14:00'), fim: agora('2026-11-17', '15:10') }, status: 'pendente', confianca_antes: 'automatica' },
    })
    sessao('u3', '2026-11-17', '08:10', '08:40', 'DP-011', 'Loja Bela Vista Eireli', 'plataforma', 'contestada', ['tarefa aberta às 08:10 sem ação'], {
      contestacao: { por: 'u3', em: agora('2026-11-17', '09:00'), motivo: 'nao_era_trabalho', correcao: 'descartar', status: 'pendente', confianca_antes: 'automatica' },
    })
    // Rafael: contestação aceita pelo João (a original fica substituída pela corrigida).
    const orig = sessao('u7', '2026-11-16', '14:00', '15:30', 'CTB-015', 'Metalúrgica Andrade Ltda', 'plataforma', 'automatica', ['tarefa CTB-015 Metalúrgica aberta às 14:00'], {
      contestacao: { por: 'u7', em: agora('2026-11-16', '16:00'), motivo: 'cliente', correcao: 'Clínica Sorriso Ltda', correcao_dados: { cliente_id: idCliente('Clínica Sorriso Ltda') }, status: 'aceita', confianca_antes: 'automatica', decidido_por: 'u2', decidido_por_nome: 'João Pereira', decidido_em: agora('2026-11-16', '17:10') },
    })
    const corr = sessao('u7', '2026-11-16', '14:00', '15:30', 'CTB-015', 'Clínica Sorriso Ltda', 'confirmacao', 'confirmada', ['corrigiu (contestação aceita) por João Pereira'])
    orig.substituida_por = corr.id
    // Carla: tarefa aberta duas horas sem ação (anomalia "sem evento") e uma contestação recusada.
    sessao('u5', '2026-11-16', '10:00', '12:00', 'FIS-024', 'Metalúrgica Andrade Ltda', 'plataforma', 'automatica', ['tarefa FIS-024 aberta às 10:00', 'nenhuma ação depois das 10:04'], { anomalia: { tipo: 'sem_evento', texto: 'Tarefa aberta 2h sem nenhuma ação depois dos primeiros 4 min' } })
    sessao('u5', '2026-11-16', '13:00', '14:00', 'FIS-009', 'Loja Bela Vista Eireli', 'plataforma', 'automatica', ['tarefa FIS-009 aberta às 13:00', 'PGDAS-D transmitido às 13:52'], {
      contestacao: { por: 'u5', em: agora('2026-11-16', '15:00'), motivo: 'tempo', correcao: '13:00–13:20', status: 'recusada', confianca_antes: 'automatica', decidido_por: 'u1', decidido_por_nome: 'Fernanda Lima', decidido_em: agora('2026-11-16', '18:00'), motivo_recusa: 'o horário bate com os eventos' },
    })
    // Rafael: sessão longa (6h30, só pulsos no fim).
    sessao('u7', '2026-11-17', '13:00', '19:30', 'FIS-010', null, 'plataforma', 'automatica', ['12 guias DAS registradas até 15:40', 'depois das 15:40, só pulsos do portal do Simples'], { anomalia: { tipo: 'sessao_longa', texto: '6h30 seguidas; nenhum evento de ferramenta depois das 15:40 (só pulsos)' } })
    // João: duas sessões sobrepostas (atendimento de outro cliente no meio da tarefa).
    sessao('u2', '2026-11-13', '14:00', '15:00', 'CTB-015', 'Padaria Pão Quente ME', 'core', 'automatica', ['tarefa CTB-015 aberta às 14:00'], { anomalia: { tipo: 'sobreposta', texto: 'Sobreposta à conversa com a Clínica Sorriso das 14:20 às 14:45' } })
    sessao('u2', '2026-11-13', '14:20', '14:45', 'GES-025', 'Clínica Sorriso Ltda', 'crm', 'automatica', ['assumiu a conversa da Clínica às 14:20'])
    // Fernanda, 17/11: tarefa da Metalúrgica aberta enquanto o portal mostrava a Clínica (conflito).
    const conflito = sessao('u1', '2026-11-17', '15:10', '16:40', 'CTB-015', 'Metalúrgica Andrade Ltda', 'plataforma', 'automatica', ['tarefa CTB-015 Metalúrgica aberta às 15:10', 'extensão: o portal mostrou o CNPJ da Clínica Sorriso por 62 min'])
    const ex = (dia: string) => dh(somarDias(dia, 7), '23:59')
    itens.push(
      { id: 'ic-s06-c2', usuario_id: 'u1', setor_id: 'fiscal', dia: '2026-11-17', inicio: dh('2026-11-17', '11:20'), fim: dh('2026-11-17', '11:50'), tipo: 'portal', texto: 'e-CAC com o CNPJ da Padaria, sem tarefa aberta', pista: 'extensão · 28 pulsos', sugestao: { atividade_id: 'FIS-005', rotulo: 'Caixa postal e-CAC', cliente_id: idCliente('Padaria Pão Quente ME'), minutos: 30 }, situacao: 'marcado', expira_em: ex('2026-11-17') },
      { id: 'ic-s06-c4', usuario_id: 'u1', setor_id: 'contabil', dia: '2026-11-17', inicio: dh('2026-11-17', '15:10'), fim: dh('2026-11-17', '16:40'), tipo: 'conflito', texto: 'Tarefa CTB-015 da Metalúrgica aberta; o portal mostrou a Clínica Sorriso', pista: 'conflito tarefa × extensão', sugestao: { atividade_id: 'CTB-015', rotulo: 'Conciliação', cliente_id: idCliente('Metalúrgica Andrade Ltda'), minutos: 90 }, alternativa_cliente_id: idCliente('Clínica Sorriso Ltda'), sessao_ref_id: conflito.id, situacao: 'marcado', expira_em: ex('2026-11-17') },
      { id: 'ic-s06-c6', usuario_id: 'u1', setor_id: 'gestao_atendimento', dia: '2026-11-17', inicio: dh('2026-11-17', '16:45'), fim: dh('2026-11-17', '17:30'), tipo: 'buraco', texto: '45 min sem registro', pista: 'antes: GES-025 Rota Sul', sugestao: { atividade_id: 'GES-025', rotulo: 'Atendimento', cliente_id: idCliente('Transportes Rota Sul S.A.'), minutos: 45 }, situacao: 'marcado', expira_em: ex('2026-11-17') },
    )
    // A guia DAS da Loja (artefato) é a sessão estimada de hoje: o item a confirma.
    const s4 = idsHoje['u1:s4']
    if (s4) itens.push({ id: 'ic-s06-c3', usuario_id: 'u1', setor_id: 'fiscal', dia: hoje, inicio: dh(hoje, '13:30'), fim: null, tipo: 'artefato', texto: 'Guia DAS da Loja Bela Vista emitida', pista: 'artefato · padrão do cliente 15 min', sugestao: { atividade_id: 'FIS-010', rotulo: 'DAS', cliente_id: idCliente('Loja Bela Vista Eireli'), minutos: 15 }, sessao_ref_id: s4, situacao: 'marcado', expira_em: ex(hoje) })
    // Arquivos sem pessoa (o Gestor atribui).
    for (const a of artefatosSemPessoa) {
      const dia = a.quando.startsWith('ter') ? '2026-11-17' : hoje
      itens.push({ id: `ic-s06-${a.id}`, usuario_id: null, setor_id: setorDaAtividade(a.atividade), dia, inicio: dh(dia, a.quando.slice(-5)), fim: null, tipo: 'foi_voce', texto: a.texto, pista: `${a.atividade} · sugestão: ${a.sugestao}`, sugestao: { atividade_id: a.atividade, rotulo: rotuloAtividade(a.atividade), cliente_id: null, minutos: 20 }, situacao: 'pendente', expira_em: ex(dia), extras: { sugestao_pessoa: base.usuarios.find((u) => u.nome === a.sugestao)?.id } })
    }
  }

  // Itens já resolvidos nos dias anteriores (para "a equipe confirma em dia?") e alguns expirados.
  for (const u of usuariosAtivos) {
    const r = aleatorio(`itens:${u}`)
    for (const dia of diasPassados.slice(0, -2)) {
      if (r() < 0.55) continue
      const sit: ItemConfirmacao['situacao'] = r() < 0.08 ? 'expirado' : r() < 0.1 ? 'descartado' : 'confirmado'
      const resolvidoEm = sit === 'expirado' ? dh(somarDias(dia, 7), '23:59') : dh(r() < 0.78 ? dia : somarDias(dia, r() < 0.7 ? 1 : 3), '18:20')
      itens.push({ id: novoIdS('ic'), usuario_id: u, setor_id: setorDaAtividade((moldes[u] ?? [])[0]?.[0]), dia, inicio: dh(dia, '17:00'), fim: dh(dia, '17:30'), tipo: 'buraco', texto: '30 min sem registro', pista: 'antes e depois: a mesma tarefa', sugestao: null, situacao: sit, resultado: sit === 'confirmado' ? 'confirmado com a sugestão' : sit === 'descartado' ? 'não era trabalho' : null, expira_em: dh(somarDias(dia, 7), '23:59'), extras: { resolvido_em: resolvidoEm } })
    }
  }

  // Integrantes: série separada (máquina, custo, passos, horas poupadas).
  for (const u of usuariosAtivos)
    for (const dia of [...diasPassados, hoje]) {
      const r = aleatorio(`ag:${u}:${dia}`)
      for (const i of integrantesDe[u] ?? []) {
        const setor = setorDoIntegrante(i)
        const opcoes = trabalhosIntegrante[setor] ?? []
        const qtd = 1 + Math.floor(r() * 2)
        for (let k = 0; k < qtd; k++) {
          const [at, texto] = opcoes[Math.floor(r() * opcoes.length)]
          const ini = minHora('06:30') + Math.floor(r() * 18) * 30
          const maquina = 3 + Math.floor(r() * 28)
          const cli = (moldes[u] ?? []).find((m) => m[0].split('-')[0] === at.split('-')[0])?.[1] ?? null
          sessoes.push({
            id: novoIdS('sa'),
            ator_tipo: 'integrante',
            ator_id: i,
            usuario_dono_id: u,
            cliente_id: texto.includes('clientes') ? null : idCliente(cli),
            setor_id: setor,
            atividade_id: at,
            rotulo: texto,
            origem: 'plataforma',
            inicio: dh(dia, hh(ini)),
            fim: dh(dia, hh(ini + maquina)),
            confianca: 'automatica',
            evidencias: [`trabalho do integrante: ${texto}`],
            pacote: pacoteDaAtividade(at),
            custo: { maquina_seg: maquina * 60, centavos: Math.round(maquina * (35 + r() * 30)), passos: 20 + Math.floor(r() * 180), poupadas_min: Math.round(maquina * (2 + r() * 2.5)) },
          })
        }
      }
    }

  sessoes.forEach((s) => add('sessao_trabalho', s))
  itens.forEach((i) => add('item_confirmacao', i))

  // Extensão e termo de ciência por pessoa (Bruno sem extensão; Carla ainda sem o termo).
  const vinc = andrade ? { u1: true, u2: true, u3: true, u7: true, u8: true, u9: true, u4: false } : ({} as Record<string, boolean>)
  for (const [u, vinculada] of Object.entries(vinc))
    add('vinculo_extensao', {
      id: `ve-${u}`,
      usuario_id: u,
      termo_versao: '2026-11-07',
      termo_aceito_em: dh('2026-11-03', '08:10'),
      navegador: vinculada ? 'chrome' : null,
      vinculada_em: vinculada ? dh('2026-11-03', '08:15') : null,
      pausas: u === 'u1' ? [{ de: dh('2026-11-17', '12:00'), ate: dh('2026-11-17', '12:30'), rotulo: 'por 30 min' }] : [],
    })

  // Pulsos de hoje (agregados por portal e cliente).
  if (andrade)
    for (const [u, portal, cliente, metodo, minutos, ini, fim] of [
      ['u1', 'e-CAC', 'Metalúrgica Andrade Ltda', 'identificacao', 74, '08:40', '10:08'],
      ['u1', 'Simples Nacional', 'Padaria Pão Quente ME', 'titulo', 41, '10:50', '11:55'],
      ['u1', 'eSocial', null, 'nenhum', 6, '16:05', '16:12'],
      ['u2', 'SEFAZ-RS', 'Transportes Rota Sul S.A.', 'url', 41, '10:10', '11:48'],
      ['u2', 'e-CAC', 'Transportes Rota Sul S.A.', 'identificacao', 22, '16:35', '17:40'],
      ['u3', 'eSocial', 'Metalúrgica Andrade Ltda', 'identificacao', 64, '13:05', '15:35'],
      ['u7', 'Simples Nacional', 'Padaria Pão Quente ME', 'titulo', 38, '08:20', '09:45'],
    ] as const)
      add('pulso_portal', { id: `pp-${u}-${portal}`.replace(/\s+/g, '-').toLowerCase(), usuario_id: u, dia: hoje, portal, cliente_id: idCliente(cliente), metodo, minutos, primeiro: dh(hoje, ini), ultimo: dh(hoje, fim) })

  dominios.forEach((d, i) => add('portal_extensao', { id: `px-${i + 1}`, portal: d.portal, dominio: d.dominio, leitura: d.leitura, atividade_sugerida: d.atividade, situacao: d.ativo ? 'ativo' : 'desligado', versao: 3 }))

  if (andrade) {
    for (const c of conectores)
      add('conector_core', {
        id: `cn-${c.core.normalize('NFD').replace(/[^a-zA-Z]/g, '').toLowerCase()}`,
        core: c.core,
        modo: c.modo,
        status: c.status === 'conectado' ? 'conectado' : c.status === 'importação' ? 'importacao' : 'nao_conectado',
        detalhe: c.detalhe,
        ultima_leitura: c.status === 'conectado' ? dh(hoje, '10:45') : null,
        mapa_departamento: c.core === 'Alterdata' ? mapasDepartamento.map((m) => ({ core: m.core, setor_id: m.setor ?? null })) : [],
        mapa_responsavel: c.core === 'Alterdata' ? mapasResponsavel.map((m) => ({ core: m.core, usuario_id: base.usuarios.find((u) => u.nome === m.usuario)?.id ?? null })) : [],
      })
    filaSemEquivalente.forEach((f) => add('equivalencia_core', { id: `eq-${f.id}`, core_sistema: f.core, core_tipo_tarefa: f.nome, departamento: f.departamento, ocorrencias: f.ocorrencias, sugestoes: f.sugestoes, atividade_id: null, situacao: 'sem_equivalente' }))
    ;[['Conciliação mensal', 'Contábil', 'CTB-015', 31], ['Conferência fiscal', 'Fiscal', 'FIS-004', 44], ['DCTFWeb', 'Fiscal', 'FIS-019', 63]].forEach(([nome, dep, at, oc], i) =>
      add('equivalencia_core', { id: `eq-ok${i}`, core_sistema: 'Alterdata', core_tipo_tarefa: String(nome), departamento: String(dep), ocorrencias: Number(oc), sugestoes: [], atividade_id: String(at), situacao: 'equivalente' }),
    )
    calibracao.forEach((c) => {
      const at = c.atividade.split(' ·')[0]
      add('duracao_padrao', { id: `dp-${at}`, atividade_id: at, rotulo: rotuloAtividade(at), catalogo_min: c.catalogoMin, mediana_min: c.medianaMin, n: c.n, origem: 'catalogo' })
    })
    add('custo_hora', { id: 'ch-2026-10', competencia: '2026-10', modo: 'gastos', gastos: custoProt.gastos, horas_produtivas: custoProt.horasProdutivas, valor: custoProt.valor, por_cargo: false, por_pacote: false, valor_bpo: 85, definido_por: 'u1', definido_por_nome: 'Fernanda Lima', criado_em: dh('2026-11-03', '09:00') })
    add('ausencia', { id: 'au-ana-ferias', usuario_id: 'u3', tipo: 'ferias', inicio: '2026-11-03', fim: '2026-11-07', registrada_por: 'u1', substituto_id: 'u2', extras: { pessoa_nome: 'Ana Souza' } })
    add('ausencia', { id: 'au-joao-folga', usuario_id: 'u2', tipo: 'folga', inicio: '2026-11-27', fim: '2026-11-27', registrada_por: 'u1', extras: { pessoa_nome: 'João Pereira' } })

    // Fechamentos dos 12 meses anteriores (nov/2025 a out/2026), a partir da margem do protótipo.
    const competencias = Array.from({ length: 12 }, (_, i) => `${i < 2 ? 2025 : 2026}-${String(((10 + i) % 12) + 1).padStart(2, '0')}`)
    const marcosPor: Record<string, Record<number, string>> = {}
    for (const r of rentProt) {
      const cid = idCliente(r.cliente)
      if (!cid) continue
      marcosPor[cid] = Object.fromEntries((r.marcos ?? []).map((m) => [m.mes, m.texto]))
      competencias.forEach((comp, i) => {
        if (!r.serie.length) {
          add('fechamento_timesheet', { id: `ft-${comp}-${cid}`, competencia: comp, cliente_id: cid, pacote: 'contabil', horas: r.horas, horas_estimadas: 0, honorario: null, variaveis: 0, custo_hora: 300, marcos: [] })
          return
        }
        const pct = r.serie[i]
        if (pct === 0 && (r.marcos ?? []).some((m) => m.texto === 'entrada' && m.mes > i)) return
        const honorario = r.honorario ?? 0
        const custo = honorario * (1 - pct / 100)
        const horas = i === 11 ? r.horas : Math.max(1, Math.round(((custo - r.variaveis) / 300) * 10) / 10)
        add('fechamento_timesheet', { id: `ft-${comp}-${cid}`, competencia: comp, cliente_id: cid, pacote: 'contabil', horas, horas_estimadas: Math.round(horas * 0.12 * 10) / 10, honorario: i === 11 ? honorario : honorario, variaveis: r.variaveis, custo_hora: 300, marcos: marcosPor[cid][i] ? [marcosPor[cid][i]] : [] })
      })
    }
    for (const e of empresasBpo) {
      const cid = e.clienteId ?? idCliente(e.nome)
      if (!cid) continue
      add('fechamento_timesheet', { id: `ft-2026-10-${cid}-bpo`, competencia: '2026-10', cliente_id: cid, pacote: 'bpo', horas: e.horasMes, horas_estimadas: 0, honorario: e.honorarioBpo, variaveis: 0, custo_hora: 300, marcos: [] })
    }
  }
}

/** Duração padrão do catálogo para quem não calibrou (usada nas estimativas). */
export const padraoDe = (atividade: string) => Math.round(((atividadeTs(atividade)?.horas_100 ?? 15) * 60) / 100)
