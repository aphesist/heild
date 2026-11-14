import { esperar, ficticio, simular } from './simular'
import { ErroServico, type Resultado } from './tipos'

/**
 * Conectores, cofre de credenciais e leitura da árvore do Drive (S09).
 *
 * - Conectores (08, 2): conectar com token, OAuth, certificado ou termo do
 *   Integra; testar a conexão (com os erros do mapa, 1.6).
 * - Cofre (08, 3; API-29): o segredo vai direto ao cofre e nunca volta para a
 *   tela; a tela só recebe a referência, a validade e a impressão digital.
 * - Árvore do Drive (D-10; API-24): o Raio-X lê só nomes de pastas e de
 *   arquivos, nunca o conteúdo.
 */

export type ResultadoTeste = 'ok' | 'erro_credencial' | 'certificado_vencido' | 'fora_do_ar' | 'limite' | 'captcha' | 'timeout'

export interface Teste {
  resultado: ResultadoTeste
  /** Frase do que aconteceu, para a tela. */
  detalhe: string
  /** Etapas que o teste percorreu (aparecem uma a uma). */
  etapas: string[]
}

export interface ServicoConectores {
  /** Testa a conexão; `forcar` reproduz um erro (painel Demonstração). */
  testar(id: string, op?: { forcar?: ResultadoTeste; aoEtapa?: (e: string) => void }): Promise<Resultado<Teste>>
  /** Conecta (OAuth abre a tela do provedor; token e certificado vão ao cofre). */
  conectar(id: string, modo: string): Promise<Resultado<{ conta: string; escopos: string[] }>>
  /** Roda de novo uma rotina parada (D-38). */
  reprocessar(rotina: string): Promise<Resultado<{ processados: number; restantes: number }>>
}

export interface ReferenciaCofre {
  ref: string
  impressao: string
  validade?: string
}

export interface ServicoCofre {
  /** Guarda o segredo (arquivo do certificado, token) e devolve só a referência. */
  guardar(c: { tipo: string; titular: string; nomeArquivo?: string; senha?: string }): Promise<Resultado<ReferenciaCofre>>
  rotacionar(ref: string): Promise<Resultado<ReferenciaCofre>>
  revogar(ref: string): Promise<Resultado<{ revogado_em: string }>>
}

export interface ItemArvore {
  /** Caminho a partir da raiz do Drive ("Clientes/Padaria Pão Quente/Fiscal/2026-10"). */
  caminho: string
  tipo: 'pasta' | 'arquivo'
  modificado: string
}

export interface ServicoArvore {
  /** Lê a lista de pastas e arquivos (sem conteúdo), com progresso. */
  ler(raiz: string, aoProgresso?: (lidas: number, total: number) => void): Promise<Resultado<{ itens: number; pastas: number; arquivos: number }>>
}

const etapasTeste: Record<string, string[]> = {
  termo: ['Conferindo o termo de autorização assinado', 'Pedindo o token ao SERPRO', 'Consultando a caixa postal de um cliente de teste'],
  certificado: ['Abrindo o certificado no cofre', 'Conferindo a validade', 'Fazendo uma consulta de teste'],
  oauth: ['Renovando o acesso autorizado', 'Lendo a conta conectada', 'Fazendo uma leitura de teste'],
  token: ['Conferindo o token', 'Fazendo uma consulta de teste'],
  robo: ['Abrindo o portal', 'Entrando com a credencial do cofre', 'Lendo a página de teste'],
  arquivo: ['Conferindo a pasta de importação', 'Lendo o último arquivo'],
  chave: ['Conferindo a chave de acesso', 'Gravando e apagando um arquivo de teste'],
}

const detalheErro: Record<Exclude<ResultadoTeste, 'ok'>, string> = {
  erro_credencial: 'O serviço recusou a credencial (senha trocada ou acesso revogado do outro lado).',
  certificado_vencido: 'O certificado digital está vencido.',
  fora_do_ar: 'O serviço do outro lado não respondeu: fora do ar.',
  limite: 'Limite de consultas do período atingido.',
  captcha: 'O portal pediu CAPTCHA: precisa de uma pessoa.',
  timeout: 'Demorou mais de 30 segundos para responder.',
}

export const conectoresDemonstracao: ServicoConectores = {
  async testar(id, op = {}) {
    const etapas = etapasTeste[id] ?? etapasTeste[modoDoId(id)] ?? etapasTeste.token
    for (const e of etapas) {
      op.aoEtapa?.(e)
      await esperar(450)
    }
    return simular(`Conector ${id}`, () => {
      const r = op.forcar ?? 'ok'
      return { resultado: r, detalhe: r === 'ok' ? 'Conexão funcionando. Consulta de teste respondeu em 0,8 s.' : detalheErro[r], etapas }
    }, { latencia: [300, 700] })
  },
  conectar: (id, modo) =>
    simular(`Conector ${id}`, () => ({ conta: modo === 'oauth' ? 'ti@escritorio.com.br' : modo === 'termo' ? 'Termo de autorização nº ' + ficticio.protocolo().slice(-8) : 'credencial no cofre', escopos: modo === 'oauth' ? ['leitura', 'escrita na pasta da Heild'] : ['consulta'] }), { latencia: [900, 1600] }),
  reprocessar: (rotina) => simular(`Rotina ${rotina}`, () => ({ processados: 3 + (rotina.length % 9), restantes: 0 }), { latencia: [1200, 2200] }),
}

const modoDoId = (id: string) => (id === 'integra_contador' ? 'termo' : id.includes('drive') || id === 'onedrive' || id === 'email' || id === 'whatsapp' ? 'oauth' : 'token')

const impressao = () => Array.from({ length: 4 }, () => Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0')).join(':').toUpperCase()

export const cofreDemonstracao: ServicoCofre = {
  guardar: (c) => {
    if (c.nomeArquivo !== undefined && !c.nomeArquivo.trim()) throw new ErroServico('Cofre de credenciais', 'sem_arquivo', 'Escolha o arquivo do certificado.')
    return simular('Cofre de credenciais', () => ({ ref: ficticio.id('cofre'), impressao: impressao(), validade: c.tipo.includes('A1') || c.tipo.includes('e-CNPJ') ? '13/11/2027' : undefined }), { latencia: [900, 1500] })
  },
  rotacionar: () => simular('Cofre de credenciais', () => ({ ref: ficticio.id('cofre'), impressao: impressao() }), { latencia: [700, 1200] }),
  revogar: () => simular('Cofre de credenciais', () => ({ revogado_em: new Date().toISOString() }), { latencia: [500, 900] }),
}

export const arvoreDemonstracao: ServicoArvore = {
  async ler(_raiz, aoProgresso) {
    const total = 96210
    for (let i = 1; i <= 8; i++) {
      await esperar(380)
      aoProgresso?.(Math.round((total * i) / 8), total)
    }
    return simular('Google Drive (só a lista)', () => ({ itens: total, pastas: 4812, arquivos: total - 4812 }), { latencia: [200, 400] })
  },
}
