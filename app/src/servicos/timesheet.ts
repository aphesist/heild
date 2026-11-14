// S06 · Serviços externos do Timesheet, simulados: a extensão de navegador (API-26) e os
// conectores dos cores contábeis (API-18). No produto, a extensão é um Manifest V3 que manda
// só o pulso e o identificador do cliente; os cores vêm pelo backend (nunca do navegador).
import { esperar, simular } from './simular'
import type { Resultado } from './tipos'

export interface VisitaPortal {
  portal: string
  dominio: string
  /** O que a página mostra (o que a extensão lê localmente só para achar o cliente). */
  cnpjNaUrl?: string
  cnpjNoTitulo?: string
  cnpjNaPagina?: string
  minutos: number
  /** Houve tecla ou clique (booleano) no último minuto. */
  comEntrada: boolean
}

export interface ResultadoVisita {
  /** Pulsos enviados (um por minuto com entrada; sem entrada, nenhum). */
  pulsos: number
  metodo: 'url' | 'titulo' | 'identificacao' | 'nenhum'
  cnpj_detectado?: string
  /** O que foi enviado à plataforma, campo a campo (para a tela "como a extensão vê"). */
  enviado: { campo: string; valor: string }[]
  /** O que ficou só no navegador. */
  naoEnviado: string[]
}

export interface ServicoExtensao {
  detectar(navegador: 'chrome' | 'edge'): Promise<Resultado<{ instalada: boolean; versao: string }>>
  vincular(usuarioNome: string): Promise<Resultado<{ vinculada: boolean }>>
  visitar(v: VisitaPortal, foraDaLista: boolean): Promise<Resultado<ResultadoVisita>>
}

export interface ServicoCores {
  testarToken(core: string, token: string): Promise<Resultado<{ tarefasNoMes: number }>>
  importarRelatorio(core: string, arquivo: string): Promise<Resultado<{ linhas: number; semEquivalente: number }>>
  lerAgora(core: string): Promise<Resultado<{ novas: number; lidaEm: string }>>
}

export const extensaoDemonstracao: ServicoExtensao = {
  detectar: (navegador) => simular('Extensão (loja do navegador)', () => ({ instalada: true, versao: navegador === 'chrome' ? '1.4.2 (Chrome)' : '1.4.2 (Edge)' }), { latencia: [500, 900] }),
  vincular: (nome) => simular('Extensão (vínculo pelo login)', () => ({ vinculada: !!nome }), { latencia: [900, 1400] }),
  async visitar(v, foraDaLista) {
    if (foraDaLista) {
      await esperar(400)
      return { dados: { pulsos: 0, metodo: 'nenhum', enviado: [], naoEnviado: ['o site inteiro: está fora da lista de portais, a extensão não roda'] }, demonstracao: true, fonte: 'Extensão de navegador', latencia_ms: 400, gerado_em: new Date().toISOString() }
    }
    return simular(
      'Extensão de navegador',
      () => {
        const cnpj = v.cnpjNaUrl ?? v.cnpjNoTitulo ?? v.cnpjNaPagina
        const metodo: ResultadoVisita['metodo'] = v.cnpjNaUrl ? 'url' : v.cnpjNoTitulo ? 'titulo' : v.cnpjNaPagina ? 'identificacao' : 'nenhum'
        const pulsos = v.comEntrada ? v.minutos : 0
        return {
          pulsos,
          metodo,
          cnpj_detectado: cnpj,
          enviado: pulsos ? [{ campo: 'portal', valor: v.portal }, { campo: 'cnpj_detectado', valor: cnpj ?? '—' }, { campo: 'metodo_deteccao', valor: metodo }, { campo: 'em', valor: 'relógio do servidor, 1 por minuto' }, { campo: 'pulsos', valor: String(pulsos) }] : [],
          naoEnviado: ['URL completa', 'conteúdo da página (lido só para achar o CNPJ)', 'campos de formulário e senhas', 'certificado escolhido', 'teclas e cliques (só "houve entrada", sim ou não)', 'capturas de tela', 'outras abas e sites'],
        }
      },
      { latencia: [500, 1000] },
    )
  },
}

export const coresDemonstracao: ServicoCores = {
  testarToken: (core, token) => simular(`${core} (ePlugin)`, () => ({ tarefasNoMes: 380 + (token.length % 7) * 9 }), { latencia: [1000, 1600], falha: token.toLowerCase().includes('erro') ? 1 : 0, mensagemFalha: `${core} recusou o token (simulado). Gere outro em eContador › Integrações.` }),
  importarRelatorio: (core) => simular(`${core} (relatório importado)`, () => ({ linhas: 214, semEquivalente: 6 }), { latencia: [900, 1500] }),
  lerAgora: (core) => simular(`${core} (leitura)`, () => ({ novas: 3 + Math.floor(Math.random() * 9), lidaEm: new Date().toISOString() }), { latencia: [700, 1200] }),
}
