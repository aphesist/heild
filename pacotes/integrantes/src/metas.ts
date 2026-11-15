import { metadadosDoCatalogo, type Ferramenta } from '@heild/processos'

/**
 * Ferramentas novas da B3 que os passos citam e que ainda não estão no catálogo do wireframe
 * (o DP não tem nenhuma ali). Seguem os mesmos campos do catálogo e passam pela mesma `autorizar`
 * (`autorizarFerramenta` da B2). Quando o catálogo do wireframe as receber, saem daqui sem mudar nome.
 */
export const metasB3: Ferramenta[] = [
  { nome: 'dp.evento.lancar', modulo: 'painel', nivel: 'executar', setor: 'dp', exige_aprovacao: 'se_fora_da_lista' },
  { nome: 'assistente.pedir', modulo: 'agentes', nivel: 'executar', setor: 'geral' },
  { nome: 'assistente.obter', modulo: 'agentes', nivel: 'ler', setor: 'geral' },
  // Feedforward e lacunas (padrão da interface, 15/11/2026).
  { nome: 'assistente.prever_suposicoes', modulo: 'agentes', nivel: 'ler', setor: 'geral' },
  { nome: 'assistente.preencher_lacuna', modulo: 'agentes', nivel: 'executar', setor: 'geral' },
  { nome: 'integrante.listar', modulo: 'agentes', nivel: 'ler', setor: 'geral' },
  { nome: 'integrante.aprender', modulo: 'agentes', nivel: 'rascunhar', setor: 'geral' },
  // Número compartilhado (04, A.7; API_INTERNA, adendo de 15/11/2026): rotear é interno e reversível.
  { nome: 'conversa.rotear', modulo: 'crm', nivel: 'executar', setor: 'alvo' },
  // Só registra a sugestão do integrante que diverge do menu (evento `conversa.triagem_divergir`).
  { nome: 'conversa.triagem_divergir', modulo: 'crm', nivel: 'executar', setor: 'alvo' },
  // As falas da triagem ao cliente (decisão do Enzo de 15/11/2026): saem sem cartão porque só entendem
  // o assunto e encaminham, com os limites de estilo e escopo conferidos por regra. Qualquer outra
  // mensagem da IA ao cliente continua em `conversa.responder` (irreversível, com cartão).
  { nome: 'conversa.triagem_responder', modulo: 'crm', nivel: 'executar', setor: 'alvo', exposta_ao_cliente: true },
  // Envio ao cliente por categoria (subplano 02, adendo de 15/11/2026): o Administrador escolhe o modo.
  { nome: 'envio_cliente.listar', modulo: 'agentes', nivel: 'ler', setor: 'geral' },
  { nome: 'envio_cliente.configurar', modulo: 'agentes', nivel: 'executar', setor: 'geral', papel_minimo: 'administrador' },
]

/** As ferramentas transversais do motor (B2), com os mesmos metadados do registro dela. */
export const metasDoMotor: Ferramenta[] = [
  { nome: 'execucao.obter', modulo: 'agentes', nivel: 'ler', setor: 'geral' },
  { nome: 'execucao.retomar', modulo: 'agentes', nivel: 'executar', setor: 'geral' },
  { nome: 'procedimento.listar', modulo: 'agentes', nivel: 'ler', setor: 'geral' },
  { nome: 'validador.executar', modulo: 'agentes', nivel: 'ler', setor: 'geral' },
  { nome: 'memoria.propor', modulo: 'agentes', nivel: 'rascunhar', setor: 'geral' },
]

const porNome = new Map([...metasB3, ...metasDoMotor].map((m) => [m.nome, m]))

/** Resolve metadados: B3, operações de processo dadas, depois o catálogo do wireframe. */
export function resolverCom(extras: Ferramenta[] = []) {
  const mapa = new Map(extras.map((m) => [m.nome, m]))
  return (nome: string): Ferramenta | undefined => mapa.get(nome) ?? porNome.get(nome) ?? metadadosDoCatalogo(nome)
}
