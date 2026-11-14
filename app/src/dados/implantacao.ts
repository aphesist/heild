import { useMemo } from 'react'
import { useTabela } from '@/nucleo/react'
import { banco } from '@/nucleo/banco'
import { ID_HORIZONTE } from '@/nucleo/semente'
import type { Papel } from './configuracoes'
import type { Cliente as ClienteTela } from './tipos'

/**
 * Assistente de implantação do escritório (S09-T13; 03, 4.3): nove passos
 * até os critérios da fase 0, com o Geral conduzindo. Estado em
 * `registro_tela` (chave CHAVE_IMPLANTACAO), lido também fora da tela por
 * `useImplantacao()` (a faixa "primeiros passos" da Visão geral some quando
 * `concluida`).
 */

export type IdPasso = 'dados' | 'setores' | 'equipe' | 'clientes' | 'armazenamento' | 'canais' | 'tema' | 'campanha' | 'migracao'

export const passosImplantacao: { id: IdPasso; titulo: string; resumo: string; fonte: string }[] = [
  { id: 'dados', titulo: 'Dados do escritório', resumo: 'CNPJ, CRC e fuso', fonte: '01, 2.2' },
  { id: 'setores', titulo: 'Setores e responsáveis', resumo: 'Desative o que não atende; escolha quem responde por cada setor', fonte: '01, 4.1' },
  { id: 'equipe', titulo: 'Convidar a equipe', resumo: 'Papéis com os exemplos Recepção, Supervisão e Direção', fonte: 'E-05' },
  { id: 'clientes', titulo: 'Importar clientes', resumo: 'Do sistema contábil, da planilha ou do Acessórias, com conferência', fonte: '08, 6.6; GES-608' },
  { id: 'armazenamento', titulo: 'Armazenamento e Raio-X', resumo: 'Conectar a nuvem e diagnosticar as pastas', fonte: 'D-10' },
  { id: 'canais', titulo: 'WhatsApp e e-mail', resumo: 'Os canais do atendimento', fonte: '04, 3.2' },
  { id: 'tema', titulo: 'Tema (marca branca)', resumo: 'Só com o complemento de marca branca', fonte: '01, 10' },
  { id: 'campanha', titulo: 'Campanha de acessos', resumo: 'Procurações e acessos de toda a carteira (SOC-014, SOC-011)', fonte: '03, 4.3' },
  { id: 'migracao', titulo: 'Plano mestre de migração', resumo: 'Ondas por ferramenta antiga', fonte: 'GES-608' },
]

export interface LinhaImportacao {
  id: string
  codigo: string
  nome: string
  documento: string
  regime: ClienteTela['regime']
  /** Divergência encontrada na conferência (vazio = ok). */
  divergencia?: string
  /** Já existe no cadastro (não grava de novo). */
  existente?: boolean
  incluir: boolean
}

export interface OndaMigracao {
  id: string
  ferramenta: string
  o_que: string
  quando: string
  situacao: 'planejada' | 'em_andamento' | 'feita'
}

export interface EstadoImplantacao {
  feitos: IdPasso[]
  pulados: IdPasso[]
  atual: number
  concluida_em: string | null
  importacao: { fonte: string; linhas: LinhaImportacao[]; enviada_em: string | null; gravada_em: string | null } | null
  campanha_em: string | null
  ondas: OndaMigracao[]
  plano_aprovado_em: string | null
}

export const CHAVE_IMPLANTACAO = 's09:implantacao'

const ondasPadrao: OndaMigracao[] = [
  { id: 'o1', ferramenta: 'Planilhas de controle', o_que: 'Obrigações e prazos por cliente', quando: 'semana 1', situacao: 'planejada' },
  { id: 'o2', ferramenta: 'Acessórias', o_que: 'Tarefas recorrentes, protocolos e histórico de entregas', quando: 'semanas 2 e 3', situacao: 'planejada' },
  { id: 'o3', ferramenta: 'SIEG', o_que: 'Notas recebidas e emitidas (paridade por 30 dias)', quando: 'semanas 3 e 4', situacao: 'planejada' },
  { id: 'o4', ferramenta: 'Domínio Honorários', o_que: 'Contratos, cobranças e inadimplência', quando: 'mês 2', situacao: 'planejada' },
  { id: 'o5', ferramenta: 'Drive antigo', o_que: 'Arquivos dos clientes (depois do Raio-X)', quando: 'mês 2', situacao: 'planejada' },
]

export function estadoImplantacaoInicial(): EstadoImplantacao {
  // O Andrade já implantou; o Horizonte está no meio do caminho.
  const andrade = banco.escritorioId !== ID_HORIZONTE
  return {
    feitos: andrade ? passosImplantacao.map((p) => p.id) : ['dados'],
    pulados: [],
    atual: andrade ? 0 : 1,
    concluida_em: andrade ? '2026-03-15T12:00:00.000Z' : null,
    importacao: null,
    campanha_em: andrade ? '2026-03-10T12:00:00.000Z' : null,
    ondas: andrade ? ondasPadrao.map((o) => ({ ...o, situacao: 'feita' })) : ondasPadrao,
    plano_aprovado_em: andrade ? '2026-03-02T12:00:00.000Z' : null,
  }
}

/** Implantação concluída? (para a faixa "primeiros passos" da Visão geral, S01). */
export function useImplantacao(): { concluida: boolean; feitos: number; total: number } {
  const t = useTabela('registro_tela')
  return useMemo(() => {
    const e = (banco.obter('registro_tela', CHAVE_IMPLANTACAO)?.valor as EstadoImplantacao | undefined) ?? estadoImplantacaoInicial()
    return { concluida: !!e.concluida_em, feitos: e.feitos.length, total: passosImplantacao.length }
  }, [t])
}

/** Prévia da importação: o que o integrante leu da fonte, com as divergências da conferência. */
export function previaImportacao(fonte: string, existentes: { documento: string }[]): LinhaImportacao[] {
  const docs = new Set(existentes.map((e) => e.documento))
  const base: Omit<LinhaImportacao, 'incluir'>[] = [
    { id: 'im1', codigo: '801', nome: 'Pizzaria Forno a Lenha Ltda', documento: '81.234.567/0001-10', regime: 'Simples Nacional' },
    { id: 'im2', codigo: '802', nome: 'Farmácia Vida Plena Ltda', documento: '82.345.678/0001-21', regime: 'Lucro Presumido' },
    { id: 'im3', codigo: '803', nome: 'Construtora Alicerce S.A.', documento: '83.456.789/0001-32', regime: 'Lucro Real' },
    { id: 'im4', codigo: '804', nome: 'Ana Paula Ribeiro (MEI)', documento: '84.567.890/0001-43', regime: 'MEI' },
    { id: 'im5', codigo: '805', nome: 'Escola Pequeno Saber Ltda', documento: '85.678.901/0001-5', regime: 'Simples Nacional', divergencia: 'CNPJ com dígito faltando' },
    { id: 'im6', codigo: '806', nome: 'Auto Elétrica Faísca ME', documento: '86.789.012/0001-65', regime: 'Simples Nacional', divergencia: fonte === 'planilha' ? 'regime diferente do cartão CNPJ (MEI na Receita)' : undefined },
    ...existentes.slice(0, 2).map((e, i) => ({ id: `imx${i}`, codigo: '—', nome: (e as { nome?: string }).nome ?? 'Cliente', documento: e.documento, regime: 'Simples Nacional' as const })),
  ]
  return base.map((l) => ({ ...l, existente: docs.has(l.documento), incluir: !docs.has(l.documento) && !l.divergencia }))
}

export const modelosPapel: { id: string; nome: string; papel: Papel; descricao: string; vinculos: { setor: 'gestao_atendimento' | 'fiscal' | 'contabil' | 'dp' | 'societario'; modo: 'gestao' | 'execucao' }[]; apoio?: boolean }[] = [
  { id: 'recepcao', nome: 'Recepção', papel: 'colaborador', descricao: 'Gestão e Atendimento com o perfil de apoio: separa, consulta, cobra e digitaliza nos outros setores (C2-26).', vinculos: [{ setor: 'gestao_atendimento', modo: 'execucao' }], apoio: true },
  { id: 'supervisao', nome: 'Supervisão', papel: 'gestor', descricao: 'Gestor dos setores que supervisiona: aprova cartões, reatribui, vê a equipe.', vinculos: [{ setor: 'fiscal', modo: 'gestao' }, { setor: 'contabil', modo: 'gestao' }, { setor: 'dp', modo: 'gestao' }] },
  { id: 'direcao', nome: 'Direção', papel: 'administrador', descricao: 'Administrador: vê e configura tudo da assinatura.', vinculos: [] },
]
