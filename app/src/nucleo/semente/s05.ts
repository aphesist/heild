import type { ConversaInterna, Fotografia, MensagemInterna, NomeTabela, Participacao, Tabelas } from '../modelo/entidades'

type Add = <K extends NomeTabela>(tabela: K, linha: Omit<Tabelas[K], 'escritorio_id' | 'criado_em' | 'atualizado_em'> & { criado_em?: string }) => Tabelas[K]
type Sem<T> = Omit<T, 'escritorio_id' | 'criado_em' | 'atualizado_em'> & { criado_em?: string }

/**
 * S05: comunicação interna do escritório completo, para a demonstração mostrar
 * de cara o que o subplano 11 pede: conversa pessoal, grupo com entrada
 * registrada, fio, menção a pessoa e a integrante (resposta marcada como IA),
 * cartão de cliente e de tarefa, mensagem editada com a versão guardada,
 * aviso fixado no Geral e anexo. Horários fixos (a semente é igual em toda máquina).
 */
export function sementeComunicacaoInterna(foto: Fotografia, add: Add) {
  // Horários relativos à abertura (como as rotinas do time): a conversa parece de hoje e as mensagens
  // novas ficam sempre depois das da semente. "11:20" vira "há 6h40 antes das 18:00 de hoje", e assim por diante.
  const fim = Date.now() - 20 * 60 * 1000
  const t = (h: string) => {
    const [hh, mm] = h.split(':').map(Number)
    return new Date(fim - ((18 - hh) * 60 - mm) * 60 * 1000).toISOString()
  }
  // As primeiras mensagens dos canais (semente comum) também passam a ser desta manhã.
  foto.mensagem_interna.filter((m) => m.id.startsWith('mn-semente-')).forEach((m, i) => {
    m.criado_em = m.atualizado_em = t(`08:${String(30 + i * 7).padStart(2, '0')}`)
  })
  const conversa = (c: Sem<ConversaInterna>) => add('conversa_interna', c)
  const part = (p: Sem<Participacao>) => add('participacao', p)
  const msg = (m: Partial<Sem<MensagemInterna>> & Pick<MensagemInterna, 'id' | 'conversa_interna_id' | 'autor_id' | 'corpo'>) => add('mensagem_interna', { versoes: [], ...m })
  if (!foto.conversa_interna.some((c) => c.id === 'ci-geral')) return

  // Aviso fixado no topo do Geral (Gestor fixa, 11, P5).
  msg({ id: 'mn-s05-fixada', conversa_interna_id: 'ci-geral', autor_id: 'u2', corpo: 'Fechamento de novembro: documentos dos clientes até dia 5; apurações até dia 15. Dúvida de prazo, chamem o @Fiscal aqui no canal.', fixada: true, criado_em: t('11:05'), extras: { fixada_por: 'João Pereira', fixada_em: t('11:06'), mencoes: [{ tipo: 'integrante', id: 'fiscal', rotulo: 'Fiscal' }] } })

  // Fio no canal do Fiscal: menção a integrante, resposta marcada como IA, cartão de cliente e de tarefa.
  msg({ id: 'mn-s05-f1', conversa_interna_id: 'ci-fiscal', autor_id: 'u2', corpo: '@Fiscal, quais clientes ainda não mandaram o extrato de outubro?', criado_em: t('11:20'), extras: { mencoes: [{ tipo: 'integrante', id: 'fiscal', rotulo: 'Fiscal' }] } })
  msg({ id: 'mn-s05-f2', conversa_interna_id: 'ci-fiscal', autor_id: 'i-fiscal', responde_a_id: 'mn-s05-f1', corpo: 'Olhei as tarefas do Fiscal: 2 clientes ainda não mandaram o que falta: Padaria Pão Quente ME, Loja Bela Vista Eireli. Quer que eu prepare a cobrança pela régua? Quem envia é uma pessoa, no CRM.', criado_em: t('11:21'), extras: { ia: { setor: 'fiscal', nome: 'Fiscal', demonstracao: true } } })
  msg({ id: 'mn-s05-f3', conversa_interna_id: 'ci-fiscal', autor_id: 'u7', responde_a_id: 'mn-s05-f1', corpo: 'Eu cobro a Padaria Pão Quente ME hoje à tarde pelo CRM.', criado_em: t('11:30'), extras: { citacoes: [{ tipo: 'cliente', id: 'c2', rotulo: 'Padaria Pão Quente ME', cliente_id: 'c2' }] } })
  msg({ id: 'mn-s05-f4', conversa_interna_id: 'ci-fiscal', autor_id: 'u7', corpo: 'A Transmitir PGDAS-D 10/2026 do Café Central está com cartão esperando aprovação. João, consegue olhar até amanhã?', criado_em: t('11:40'), editada_em: t('11:42'), versoes: [{ corpo: 'A PGDAS do Café está com cartão esperando. João, olha?', ate: t('11:42'), por: 'u7' }], extras: { citacoes: [{ tipo: 'tarefa', id: 't0', rotulo: 'Transmitir PGDAS-D 10/2026', setor_id: 'fiscal' }], mencoes: [] } })

  // Conversa pessoal entre a Administradora e o Gestor do Fiscal.
  conversa({ id: 'ci-s05-pessoal-u1-u2', tipo: 'pessoal', criada_por: 'u1', criado_em: t('09:00') })
  for (const u of ['u1', 'u2']) part({ id: `pa-s05-pessoal-${u}`, conversa_interna_id: 'ci-s05-pessoal-u1-u2', usuario_id: u, entrou_em: t('09:00') })
  msg({ id: 'mn-s05-p1', conversa_interna_id: 'ci-s05-pessoal-u1-u2', autor_id: 'u2', corpo: 'Fernanda, a Rita da Metalúrgica Andrade Ltda pediu reunião sobre o ISS de Sorocaba. Pode ser quinta às 10h?', criado_em: t('09:10'), extras: { citacoes: [{ tipo: 'cliente', id: 'c1', rotulo: 'Metalúrgica Andrade Ltda', cliente_id: 'c1' }] } })
  msg({ id: 'mn-s05-p2', conversa_interna_id: 'ci-s05-pessoal-u1-u2', autor_id: 'u1', corpo: 'Pode. Manda o link: https://meet.google.com/abc-defg-hij', criado_em: t('09:14') })

  // Grupo com entrada registrada e um anexo (vai a Arquivos com a origem "comunicação interna").
  conversa({ id: 'ci-s05-grupo-fechamento', tipo: 'grupo', nome: 'Fechamento de novembro', criada_por: 'u2', criado_em: t('10:00') })
  for (const u of ['u2', 'u1', 'u3', 'u7']) part({ id: `pa-s05-grupo-${u}`, conversa_interna_id: 'ci-s05-grupo-fechamento', usuario_id: u, entrou_em: t('10:00') })
  part({ id: 'pa-s05-grupo-u4', conversa_interna_id: 'ci-s05-grupo-fechamento', usuario_id: 'u4', entrou_em: t('10:00'), saiu_em: t('10:30') })
  msg({ id: 'mn-s05-g0', conversa_interna_id: 'ci-s05-grupo-fechamento', autor_id: 'u2', corpo: 'João Pereira criou o grupo com Fernanda Lima, Ana Souza, Rafael Nunes, Bruno Costa', criado_em: t('10:00'), extras: { sistema: true } })
  msg({ id: 'mn-s05-g1', conversa_interna_id: 'ci-s05-grupo-fechamento', autor_id: 'u2', corpo: 'Segue a planilha de controle do fechamento. Cada um marca os seus clientes.', criado_em: t('10:05'), extras: { anexos: [{ nome: 'controle-fechamento-11-2026.xlsx', tamanho: '48 KB', mime: 'application/vnd.ms-excel' }] } })
  msg({ id: 'mn-s05-g2', conversa_interna_id: 'ci-s05-grupo-fechamento', autor_id: 'u4', corpo: 'Bruno Costa saiu do grupo', criado_em: t('10:30'), extras: { sistema: true } })
  msg({ id: 'mn-s05-g3', conversa_interna_id: 'ci-s05-grupo-fechamento', autor_id: 'u3', corpo: 'Folha da Loja Bela Vista Eireli conferida. Falta só o pró-labore do sócio novo.', criado_em: t('10:45'), extras: { citacoes: [{ tipo: 'cliente', id: 'c3', rotulo: 'Loja Bela Vista Eireli', cliente_id: 'c3' }] } })
}
