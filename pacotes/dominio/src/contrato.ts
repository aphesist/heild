import { z } from 'zod'

/**
 * O contrato da porta de escrita: o que o frontend (adaptador `api`), as ferramentas
 * tipadas e os testes mandam ao executor. Tudo estrito: chave desconhecida é erro.
 */

/** Ids com prefixo do wireframe ("tk…", "ev…", "esc-andrade"): letras minúsculas, dígitos, hífen e sublinhado. */
export const IdEsquema = z.string().min(1).max(120).regex(/^[A-Za-z0-9][A-Za-z0-9_:.-]*$/, 'Id inválido.')

/**
 * Id gerado pela tela durante a operação, com o prefixo pedido. O servidor repete os
 * mesmos ids na mesma ordem por prefixo (a linha otimista e a gravada ficam com o mesmo id).
 */
export const IdGerado = z.object({ p: z.string().min(1).max(12).regex(/^[a-z_]+$/), id: IdEsquema }).strict()

/** Chamada de um método de repositório: `tarefas.mudarStatus`, `bpo.lotes.aprovar`. */
export const ComandoOperacao = z
  .object({
    tipo: z.literal('operacao'),
    operacao: z.string().regex(/^[a-zA-Z]+(\.[a-zA-Z]+)+$/, 'Operação no formato repositorio.metodo.'),
    argumentos: z.array(z.unknown()).max(8),
    ids: z.array(IdGerado).max(500).default([]),
  })
  .strict()

/** Linha gravada direto numa transação da tela (fora de um repositório). O servidor passa cada uma pela regra da tabela. */
export const ComandoLinhas = z
  .object({
    tipo: z.literal('linhas'),
    gravar: z.array(z.object({ tabela: z.string().regex(/^[a-z_]+$/), linha: z.record(z.string(), z.unknown()) }).strict()).max(500),
    remover: z.array(z.object({ tabela: z.string().regex(/^[a-z_]+$/), id: IdEsquema }).strict()).max(200),
  })
  .strict()

export const Comando = z.discriminatedUnion('tipo', [ComandoOperacao, ComandoLinhas])
export type Comando = z.input<typeof Comando>
export type ComandoValidado = z.output<typeof Comando>

/** Corpo de `POST /v1/operacoes`. */
export const PedidoOperacao = z.object({ comando: Comando, validar_apenas: z.boolean().optional() }).strict()

/** Linhas afetadas, por tabela, como ficaram gravadas (a tela reconcilia a escrita otimista com elas). */
export const LinhasAfetadas = z.record(z.string(), z.array(z.record(z.string(), z.unknown())))

export const RespostaOk = z
  .object({
    resultado: z.literal('ok'),
    dados: z.unknown(),
    linhas: LinhasAfetadas,
    removidas: z.record(z.string(), z.array(z.string())),
    eventos: z.array(z.string()),
    evento_id: z.string().nullable(),
    versao: z.number().nullable(),
    cartoes: z.array(z.unknown()),
  })
  .strict()
export type RespostaOk = z.infer<typeof RespostaOk>

export const ErroDeCampo = z.object({ codigo: z.string(), campo: z.string().nullable(), mensagem: z.string() }).strict()

export const RespostaValidado = z
  .object({
    resultado: z.literal('validado'),
    erros: z.array(ErroDeCampo),
    /** O que seria gravado (contagem por tabela), sem efeito e sem evento. */
    previa: z.record(z.string(), z.number()),
  })
  .strict()
export type RespostaValidado = z.infer<typeof RespostaValidado>

export const Pagina = z.object({ cursor: z.string().nullable(), ha_mais: z.boolean(), total: z.number() }).strict()

export const RespostaLista = z
  .object({ resultado: z.literal('ok'), dados: z.object({ totais: z.record(z.string(), z.number()), linhas: z.array(z.unknown()) }).strict(), pagina: Pagina })
  .strict()

export const Visao = z.enum(['compacta', 'tela']).default('compacta')

/** Descrição do ator que a tela mandou junto do comando (o servidor decide quem age pelo token, não por isto). */
export type AtorDoComando =
  | { tipo: 'pessoa'; usuario_id: string }
  | { tipo: 'integrante'; integrante_id: string; dono_usuario_id: string | null }
  | { tipo: 'pessoa_cliente'; cliente_id: string | null; nome: string }
  | { tipo: 'sistema' }
