import { EntradaAcesso, EntradaConvite, EntradaPrimeiroAcesso, EntradaRevogar } from './auth/contas.ts'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { z } from 'zod'
import { canonizar, catalogo, ferramentaDoCatalogo, ferramentasTipadas, PedidoOperacao, RespostaErro, RespostaOk, RespostaValidado, sha256Hex, nomeExposto, type FerramentaTipada } from '@heild/dominio'
import { operacoes } from './executor/operacoes.ts'
// As operações de processo da B2 entram no catálogo na carga deste módulo (mesma fonte dos contratos).
import { definicoesDoMotor } from './b2.ts'

/**
 * Contratos gerados de uma fonte só (AGENTICO 7): o Zod das ferramentas tipadas e do
 * envelope, no pacote de domínio, vira o OpenAPI 3.1 e o esquema das ferramentas (o mesmo
 * formato que o MCP da B2 vai servir em `tools/list`). `npm run contratos` grava o
 * retrato em servidor/contratos/; o teste falha se o retrato estiver velho.
 */

const json = (s: z.ZodType, io: 'input' | 'output' = 'output') => z.toJSONSchema(s, { io, unrepresentable: 'any' }) as Record<string, unknown>

function metadados(f: FerramentaTipada) {
  // A ferramenta tipada pode ter nome próprio (`tarefa.obter`); a do catálogo diz o nível e o setor.
  const base = f.tipo === 'leitura' ? f.autorizar_com : f.nome
  let doCatalogo: ReturnType<typeof ferramentaDoCatalogo> | null = null
  try {
    doCatalogo = ferramentaDoCatalogo(base)
  } catch {
    doCatalogo = null
  }
  return {
    'x-heild-nivel': f.tipo === 'leitura' ? 'ler' : (doCatalogo?.nivel ?? 'executar'),
    'x-heild-setor': doCatalogo?.setor ?? 'geral',
    'x-heild-modulo': doCatalogo?.modulo ?? 'plataforma',
    'x-heild-aprovacao': doCatalogo?.irreversivel ? 'se_integrante' : (doCatalogo?.exige_aprovacao ?? 'nunca'),
    'x-heild-idempotencia': f.tipo === 'leitura' ? 'natural' : 'por_chave',
    'x-heild-versao': f.versao,
    'x-heild-exposta-mcp': f.exposta_mcp,
    'x-heild-erros': f.erros,
  }
}

/** As ferramentas do motor (B2) e do Assistente (B3) que a mesma rota serve (as que não são do catálogo tipado). */
function doMotor() {
  const tipadas = new Set(ferramentasTipadas.map((f) => f.nome))
  return definicoesDoMotor()
    .filter((d) => !tipadas.has(d.nome))
    .map((d) => ({
      name: nomeExposto(d.nome),
      nome: d.nome,
      description: d.descricao_modelo,
      inputSchema: json(d.entrada, 'input'),
      annotations: { readOnlyHint: d.meta.nivel === 'ler', idempotentHint: true, destructiveHint: false, openWorldHint: false },
      'x-heild-nivel': d.meta.nivel,
      'x-heild-setor': d.meta.setor,
      'x-heild-modulo': d.meta.modulo,
      'x-heild-aprovacao': d.meta.irreversivel ? 'se_integrante' : (d.meta.exige_aprovacao ?? 'nunca'),
      'x-heild-idempotencia': d.meta.nivel === 'ler' ? 'natural' : 'pelo_motor',
      'x-heild-versao': d.versao,
      'x-heild-exposta-mcp': d.exposta_mcp,
      'x-heild-erros': [] as string[],
      'x-heild-origem': 'motor',
      'x-heild-recorte': d.recorte,
    }))
}

export function esquemaDasFerramentas() {
  return [
    ...ferramentasTipadas.map((f) => ({
      name: nomeExposto(f.nome),
      nome: f.nome,
      description: f.descricao_modelo,
      inputSchema: json(f.entrada, 'input'),
      annotations: { readOnlyHint: f.tipo === 'leitura', idempotentHint: true, destructiveHint: false, openWorldHint: false },
      ...metadados(f),
      'x-heild-origem': 'catalogo',
    })),
    ...doMotor(),
  ].sort((a, b) => a.nome.localeCompare(b.nome))
}

export const catalogoHash = () => sha256Hex(canonizar({ ferramentas: esquemaDasFerramentas(), operacoes: [...operacoes.keys()].sort(), catalogo: catalogo.map((c) => c.nome).sort() })).slice(0, 16)

export function gerarOpenApi() {
  const erro = json(RespostaErro)
  const paths: Record<string, unknown> = {}
  const cabecalhos = [
    { name: 'Idempotency-Key', in: 'header', required: false, description: 'Obrigatório em toda escrita (sem validar_apenas). Mesmo valor com outros argumentos: 409 CHAVE_REUSADA.', schema: { type: 'string', minLength: 8, maxLength: 200 } },
    { name: 'X-Heild-Tela', in: 'header', required: false, schema: { type: 'string' } },
  ]
  const respostasErro = {
    400: { description: 'Entrada inválida', content: { 'application/json': { schema: erro } } },
    401: { description: 'Sem sessão ou token inválido', content: { 'application/json': { schema: erro } } },
    403: { description: 'Negado pela função autorizar (gera evento)', content: { 'application/json': { schema: erro } } },
    409: { description: 'Chave reusada, versão desatualizada ou id em uso', content: { 'application/json': { schema: erro } } },
    422: { description: 'Regra de negócio (gera evento)', content: { 'application/json': { schema: erro } } },
  }
  for (const f of esquemaDasFerramentas()) {
    const def = ferramentasTipadas.find((x) => x.nome === f.nome) ?? { tipo: f['x-heild-nivel'] === 'ler' ? ('leitura' as const) : ('motor' as const) }
    const entrada = def.tipo === 'escrita' ? { ...f.inputSchema, properties: { ...(f.inputSchema.properties as object), validar_apenas: { type: 'boolean', description: 'Roda esquema, autorizar e regras e devolve os erros, sem efeito e sem evento.' } } } : f.inputSchema
    paths[`/v1/ferramentas/${f.nome}`] = {
      post: {
        operationId: f.name,
        summary: f.description,
        tags: [f['x-heild-modulo']],
        parameters: def.tipo === 'escrita' ? cabecalhos : [],
        requestBody: { required: true, content: { 'application/json': { schema: entrada } } },
        responses: {
          200: { description: def.tipo === 'escrita' ? 'ok ou validado' : 'ok', content: { 'application/json': { schema: def.tipo === 'escrita' ? { oneOf: [json(RespostaOk), json(RespostaValidado)] } : { type: 'object' } } } },
          ...(def.tipo === 'escrita' ? { 202: { description: 'aguardando_aprovacao (cartão criado)' } } : def.tipo === 'motor' ? { 202: { description: 'em_execucao ou aguardando_aprovacao (envelope do motor, AGENTICO 8)' } } : {}),
          ...respostasErro,
        },
        ...Object.fromEntries(Object.entries(f).filter(([k]) => k.startsWith('x-heild-'))),
      },
    }
  }
  paths['/v1/operacoes'] = {
    post: {
      operationId: 'operacoes',
      summary: 'Chama um método de repositório (a mesma regra do app). Usado pelo adaptador `api` do frontend.',
      parameters: cabecalhos,
      requestBody: { required: true, content: { 'application/json': { schema: json(PedidoOperacao, 'input') } } },
      responses: { 200: { description: 'ok ou validado', content: { 'application/json': { schema: { oneOf: [json(RespostaOk), json(RespostaValidado)] } } } }, 202: { description: 'aguardando_aprovacao' }, ...respostasErro },
      'x-heild-operacoes': [...operacoes.keys()].sort(),
    },
  }
  // Contas da equipe (decisão (b) de 15/11/2026): convite por e-mail ou criação manual com código.
  const postJson = (operationId: string, summary: string, schema: Parameters<typeof json>[0], semSessao = false) => ({
    post: {
      operationId,
      summary,
      ...(semSessao ? { security: [] } : { parameters: cabecalhos }),
      requestBody: { required: true, content: { 'application/json': { schema: json(schema, 'input') } } },
      responses: { 200: { description: 'ok' }, ...respostasErro },
    },
  })
  paths['/v1/equipe/convidar'] = postJson('equipe_convidar', 'Cria a conta (convidado) com setores, papel e carteira e dá o acesso: convite por e-mail (Supabase Auth) ou código de primeiro acesso de 48 h, devolvido uma vez só ao Administrador.', EntradaConvite)
  paths['/v1/equipe/acesso'] = postJson('equipe_acesso', 'Reenvia o convite por e-mail ou gera outro código (o anterior deixa de valer). Só antes do primeiro acesso.', EntradaAcesso)
  paths['/v1/equipe/acesso/revogar'] = postJson('equipe_acesso_revogar', 'Revoga o código de primeiro acesso ainda não usado.', EntradaRevogar)
  paths['/v1/auth/primeiro-acesso'] = postJson('auth_primeiro_acesso', 'Primeiro acesso por código (sem sessão): e-mail, código e a senha nova. Depois, a pessoa entra pelo Supabase Auth; Administrador e Gestor configuram o MFA.', EntradaPrimeiroAcesso, true)
  for (const [p, d] of [
    ['/v1/sessao', 'Perfil materializado, permissões e catalogo_hash'],
    ['/v1/sincronizar', 'Linhas das classes 1 e 2 (classes=1,2), filtradas pela regra de leitura; com desde=versão, só o que mudou e o que saiu do escopo'],
    ['/v1/eventos/fluxo', 'SSE (text/event-stream): { tabela, ids, versao } só do que a pessoa leria; pulso a cada 10 s'],
    ['/v1/ferramentas', 'Ferramentas tipadas com JSON Schema'],
    ['/v1/operacoes', 'Lista das operações de repositório'],
  ] as const) paths[p] = { ...((paths[p] as object | undefined) ?? {}), get: { summary: d, responses: { 200: { description: 'ok' } } } }
  return {
    openapi: '3.1.0',
    info: { title: 'API da Heild (B1, local)', version: catalogoHash(), description: 'Gerado de pacotes/dominio. Não edite: rode npm run contratos.' },
    servers: [{ url: 'http://127.0.0.1:8787' }],
    components: { securitySchemes: { bearer: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } } },
    security: [{ bearer: [] }],
    paths,
  }
}

export const PASTA_CONTRATOS = path.resolve(import.meta.dirname, '../contratos')

export function textoDosContratos() {
  return {
    'openapi.json': JSON.stringify(gerarOpenApi(), null, 2) + '\n',
    'ferramentas.json': JSON.stringify({ catalogo_hash: catalogoHash(), ferramentas: esquemaDasFerramentas() }, null, 2) + '\n',
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  mkdirSync(PASTA_CONTRATOS, { recursive: true })
  for (const [nome, texto] of Object.entries(textoDosContratos())) writeFileSync(path.join(PASTA_CONTRATOS, nome), texto)
  console.log(`Contratos gravados em ${PASTA_CONTRATOS} (catálogo ${catalogoHash()}).`)
}
