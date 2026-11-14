import { escolher, ficticio, simular } from './simular'
import type { Resultado } from './tipos'

/**
 * S08 · ERPs financeiros dos clientes do BPO (API-25; subplano 10, 3.0 e 8.3).
 * No produto: Conta Azul, Omie e Bling por API (leitura e, onde a API deixa,
 * escrita), Nibo e Granatum por arquivo, com a credencial do cliente no cofre.
 * Aqui: leituras de faz de conta, sempre marcadas como demonstração. Nenhum
 * pagamento passa por aqui: o ERP recebe o lançamento e a baixa, nunca a ordem
 * de pagar (B3).
 */

export interface ContaLidaDoErp {
  contraparte: string
  categoria: string
  valor: number
  /** ISO (AAAA-MM-DD). */
  vencimento: string
  origem: string
}

export interface ServicoErp {
  /** Sincronização incremental do espelho (a cada 15 minutos no produto; 10, Q2). */
  sincronizar(provedor: string, empresa: string): Promise<Resultado<{ lidos: number; novas: ContaLidaDoErp[] }>>
  /** Link de reautorização (OAuth) que vai ao cliente pelo app. */
  reautorizar(provedor: string, empresa: string): Promise<Resultado<{ link: string; expira_em: string }>>
  /** Atalho "abrir no ERP": o endereço do registro no sistema do cliente. */
  abrir(provedor: string, registro: string): Promise<Resultado<{ url: string }>>
  /** Modo arquivo (E2): importa OFX, CSV ou planilha exportada do ERP. */
  importarArquivo(provedor: string, nome: string): Promise<Resultado<{ linhas: number; baixasParaLancar: number }>>
}

const novasPorEmpresa: Record<string, ContaLidaDoErp[]> = {
  'Padaria Pão Quente ME': [
    { contraparte: 'Distribuidora Trigal', categoria: 'Matéria-prima', valor: 1_380, vencimento: '2026-11-25', origem: 'DDA' },
    { contraparte: 'Sabesp', categoria: 'Água', valor: 640, vencimento: '2026-11-26', origem: 'DDA' },
  ],
  'Clínica Sorriso Ltda': [{ contraparte: 'Dental Speed', categoria: 'Materiais odontológicos', valor: 2_460, vencimento: '2026-11-27', origem: 'e-mail' }],
  'Mercado Bom Preço Ltda': [{ contraparte: 'Laticínios Vale Verde', categoria: 'Mercadoria para revenda', valor: 6_920, vencimento: '2026-11-24', origem: 'DDA' }],
  'Studio Forma Arquitetura Ltda': [{ contraparte: 'Adobe (licenças)', categoria: 'Software', valor: 890, vencimento: '2026-11-28', origem: 'e-mail' }],
}

export const erpDemonstracao: ServicoErp = {
  sincronizar: (provedor, empresa) =>
    simular(`${provedor} (API do ERP)`, () => ({ lidos: 30 + (empresa.length % 17), novas: novasPorEmpresa[empresa] ?? escolher(empresa, [[], [{ contraparte: 'Fornecedor recorrente', categoria: 'Despesas gerais', valor: 520, vencimento: '2026-11-27', origem: 'DDA' }]]) }), { latencia: [900, 1800] }),
  reautorizar: (provedor) => simular(`${provedor} (OAuth)`, () => ({ link: `https://auth.${provedor.toLowerCase().replace(/\s+/g, '')}.exemplo/consent/${ficticio.txid().slice(0, 10)}`, expira_em: '2026-11-25' }), { latencia: [500, 900] }),
  abrir: (provedor, registro) => simular(`${provedor} (link do registro)`, () => ({ url: `https://app.${provedor.toLowerCase().replace(/\s+/g, '')}.exemplo/registro/${encodeURIComponent(registro)}` }), { latencia: [200, 400] }),
  importarArquivo: (provedor, nome) => simular(`${provedor} (arquivo)`, () => ({ linhas: 40 + (nome.length % 9), baixasParaLancar: 6 }), { latencia: [800, 1500] }),
}
