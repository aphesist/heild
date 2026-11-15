import { z } from 'zod'
import type { Tx } from '@heild/processos'

/**
 * Envio ao cliente, configurável por categoria (subplano 02, adendo "Envio ao cliente: configurável
 * por categoria"; 04, A.11; decisão do Enzo de 15/11/2026). Para cada categoria de mensagem
 * padronizada, o Administrador escolhe:
 *   - `cartao` (padrão de toda categoria, D-33): a IA prepara, uma pessoa aprova no cartão e o
 *     aprovar executa o envio pelo CRM, na conversa do cliente;
 *   - `automatico`: a IA envia sozinha a mensagem padronizada, registrada na conversa;
 *   - `desligado`: a IA não envia essa categoria; o aviso fica com a pessoa.
 * Mora em `escritorio.configuracao.envio_ao_cliente` ({ categoria: modo }); o motor lê na aprovação
 * `por_categoria`. A triagem conversando não entra aqui (sai sem aprovação, por ser só triagem), e o
 * que não é padronizado continua sempre com cartão.
 */
export const ModoEnvio = z.enum(['cartao', 'automatico', 'desligado'])
export type ModoEnvio = z.infer<typeof ModoEnvio>

/** As categorias que os planos já têm (04, 8.1 e 8.2), com quem as usa hoje. */
export const CATEGORIAS_DE_ENVIO = {
  guia_emitida: { nome: 'Guia emitida', usada_por: ['FIS-GUIA-CONFERIR'] },
  resposta_factual: { nome: 'Resposta factual a pergunta frequente (GES-025)', usada_por: ['GES-FAQ-RESPONDER'] },
  documento_faltando: { nome: 'Documento faltando', usada_por: [] as string[] },
  prazo_chegando: { nome: 'Prazo chegando', usada_por: [] as string[] },
  tarefa_concluida: { nome: 'Serviço concluído (tarefa visível ao cliente)', usada_por: [] as string[] },
  admissao_feita: { nome: 'Admissão feita', usada_por: [] as string[] },
} as const
export type CategoriaEnvio = keyof typeof CATEGORIAS_DE_ENVIO
export const CategoriaEnvio = z.enum(Object.keys(CATEGORIAS_DE_ENVIO) as [CategoriaEnvio, ...CategoriaEnvio[]])

export async function modosDeEnvio(tx: Tx): Promise<Record<CategoriaEnvio, ModoEnvio>> {
  const [e] = await tx`select configuracao->'envio_ao_cliente' as envio from escritorio where id = escritorio_atual()`
  const salvo = (e?.envio ?? {}) as Record<string, unknown>
  return Object.fromEntries(
    (Object.keys(CATEGORIAS_DE_ENVIO) as CategoriaEnvio[]).map((c) => [c, ModoEnvio.safeParse(salvo[c]).success ? (salvo[c] as ModoEnvio) : 'cartao']),
  ) as Record<CategoriaEnvio, ModoEnvio>
}

export async function configurarEnvio(tx: Tx, categoria: CategoriaEnvio, modo: ModoEnvio) {
  await tx`
    update escritorio set configuracao = jsonb_set(coalesce(configuracao, '{}'::jsonb), '{envio_ao_cliente}',
      coalesce(configuracao->'envio_ao_cliente', '{}'::jsonb) || jsonb_build_object(${categoria}::text, ${modo}::text))
    where id = escritorio_atual()`
  return modosDeEnvio(tx)
}
