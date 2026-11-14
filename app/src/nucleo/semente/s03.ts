// S03: um cliente MEI no escritório de exemplo, para a variante MEI da aba Fiscal (S03-T01).
import type { FichaCliente } from '@/ambiente/clientes'
import { clienteParaModelo } from '../mapeadores'
import type { Fotografia, Tabelas } from '../modelo/entidades'

type Add = <K extends keyof Tabelas>(tabela: K, linha: Omit<Tabelas[K], 'escritorio_id' | 'criado_em' | 'atualizado_em'> & { criado_em?: string }) => Tabelas[K]

export const ID_CLIENTE_MEI = 'c-s03-mei'

const ficha: FichaCliente = {
  id: ID_CLIENTE_MEI,
  contatos: [{ nome: 'Simone Araújo', papel: 'titular', whatsapp: '+55 11 97120-4471', assuntos: ['guias', 'documentos_pendentes', 'honorarios', 'comunicados'], app: true }],
  responsaveis: { fiscal: 'Fernanda Lima' },
  conversas: {},
}

/** Ateliê MEI (fictício): DAS-MEI, limite anual e DASN-SIMEI no Fiscal; declaração de faturamento no Contábil. */
export function sementeS03(foto: Fotografia, add: Add) {
  if (foto.cliente.some((c) => c.id === ID_CLIENTE_MEI)) return
  add('cliente', clienteParaModelo({ id: ID_CLIENTE_MEI, codigo: '640', nome: 'Ateliê Linha Fina MEI', documento: '74.512.330/0001-61', regime: 'MEI', situacao: 'ativo' }, ficha))
  add('versao_perfil', { id: `vp-${ID_CLIENTE_MEI}`, cliente_id: ID_CLIENTE_MEI, vigente_de: '2026-01-01', regime: 'mei', cnaes: ['1412-6/02'], uf: 'SP', servicos_contratados: ['contabil'], motivo_versao: 'Cadastro inicial', fonte: 'importacao' })
  add('pessoa', { id: `pe-${ID_CLIENTE_MEI}-simone`, nome: 'Simone Araújo', tipo: 'cliente' })
}
