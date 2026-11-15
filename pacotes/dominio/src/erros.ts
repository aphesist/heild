import { z } from 'zod'

/**
 * Erros acionáveis (AGENTICO 5 e 8; docs/apis/API_INTERNA.md 2.4): código estável, campo,
 * a frase pronta para a pessoa e, quando existe um próximo passo determinístico, a
 * ferramenta e a entrada sugeridas. O agente decide pelo código, nunca pela frase.
 */

export const CODIGOS = {
  // Entrada e identidade
  ENTRADA_INVALIDA: 'A entrada não segue o esquema da ferramenta.',
  FALTA_CHAVE_IDEMPOTENCIA: 'Toda escrita precisa do cabeçalho Idempotency-Key.',
  FERRAMENTA_DESCONHECIDA: 'Não existe ferramenta com esse nome.',
  OPERACAO_DESCONHECIDA: 'Não existe operação de repositório com esse nome.',
  NAO_ENCONTRADO: 'O registro não existe neste escritório.',
  FORA_DO_ESCRITORIO: 'O registro é de outro escritório.',
  TABELA_SEM_REGRA: 'Essa tabela não tem repositório: não se grava nela pela API.',
  // Sessão
  SEM_SESSAO: 'Falta o token de acesso (Authorization: Bearer).',
  SESSAO_INVALIDA: 'O token de acesso não vale (vencido, adulterado ou de outro emissor).',
  CONTA_INATIVA: 'A conta não está ativa neste escritório.',
  // Permissão (a frase vem da função autorizar)
  NEGADO: 'A função de autorização negou.',
  MODULO_NAO_CONTRATADO: 'Módulo não contratado na assinatura do escritório.',
  PAPEL_INSUFICIENTE: 'O papel da conta não basta para essa ferramenta.',
  SEM_SETOR: 'A conta não tem vínculo com o setor do registro.',
  EXIGE_GESTAO: 'Só quem gere o setor pode fazer isso.',
  SEM_CARTEIRA: 'O cliente não está na carteira da conta.',
  BLOQUEADO_POR_EXCECAO: 'Uma exceção por tela bloqueia essa conta.',
  NIVEL_INSUFICIENTE: 'A exceção por tela só libera ver ou preparar.',
  FORA_DO_APP_CLIENTE: 'Isso não está disponível no app do cliente.',
  EXIGE_APROVACAO: 'Uma pessoa precisa aprovar (cartão de aprovação).',
  // Regras de negócio
  REGRA_DE_NEGOCIO: 'Uma regra de negócio recusou a operação.',
  EXCLUSAO_PROIBIDA: 'Isso não se apaga: arquive, cancele ou resolva (R7).',
  IMUTAVEL: 'O registro é imutável (evento, mensagem interna, registro de entrega).',
  MOTIVO_OBRIGATORIO: 'A operação exige o motivo.',
  TAREFA_FINAL: 'Tarefa concluída ou cancelada é final.',
  JA_DECIDIDO: 'O cartão já foi decidido.',
  SO_PESSOA_DECIDE: 'Aprovar é decisão de uma pessoa (integrante e sistema não decidem).',
  SO_AUTOR_EDITA: 'Só quem escreveu pode editar a mensagem.',
  COMPETENCIA_FECHADA: 'A competência está fechada.',
  CAMPO_OBRIGATORIO: 'Falta um campo obrigatório.',
  // Concorrência, idempotência e limites
  CHAVE_REUSADA: 'A mesma Idempotency-Key já foi usada com outros argumentos.',
  VERSAO_DESATUALIZADA: 'O registro mudou desde que foi lido: recarregue e tente de novo.',
  ID_EM_USO: 'Já existe um registro com esse id.',
  RESTRICAO_DO_BANCO: 'O banco recusou o valor (restrição de integridade).',
  CURSOR_INVALIDO: 'O cursor não vale para estes filtros (ou venceu).',
  LIMITE_TAXA: 'Limite de chamadas atingido.',
  DEMONSTRACAO_DESLIGADA: 'Só existe no ambiente de demonstração.',
  ERRO_INTERNO: 'Erro interno do servidor (registrado).',
} as const

export type CodigoErro = keyof typeof CODIGOS
export const codigosErro = Object.keys(CODIGOS) as [CodigoErro, ...CodigoErro[]]

export const AcaoSugerida = z.object({ ferramenta: z.string(), entrada: z.record(z.string(), z.unknown()) }).strict()

export const RespostaErro = z
  .object({
    resultado: z.enum(['erro', 'negado']),
    codigo: z.enum(codigosErro),
    campo: z.string().nullable(),
    mensagem: z.string(),
    acao_sugerida: AcaoSugerida.nullable(),
    tentar_de_novo_em: z.string().nullable(),
    detalhes: z.record(z.string(), z.unknown()).optional(),
    evento_id: z.string().optional(),
  })
  .strict()
export type RespostaErro = z.infer<typeof RespostaErro>

/** Código da negação pela frase que a função `autorizar` devolve (a frase é a da pessoa; o código é do agente). */
export function codigoDaNegacao(motivo: string): CodigoErro {
  if (motivo.startsWith('Módulo não contratado')) return 'MODULO_NAO_CONTRATADO'
  if (motivo.startsWith('Só o Administrador') || motivo.startsWith('Só Gestor ou Administrador')) return 'PAPEL_INSUFICIENTE'
  if (motivo.startsWith('Bloqueado para a sua conta')) return 'BLOQUEADO_POR_EXCECAO'
  if (motivo.startsWith('Sua conta só pode')) return 'NIVEL_INSUFICIENTE'
  if (motivo.startsWith('Sua conta não tem esse setor')) return 'SEM_SETOR'
  if (motivo.startsWith('Só quem gere')) return 'EXIGE_GESTAO'
  if (motivo.startsWith('Esse cliente não está na sua carteira')) return 'SEM_CARTEIRA'
  if (motivo.startsWith('Isso não está disponível no app do cliente')) return 'FORA_DO_APP_CLIENTE'
  return 'NEGADO'
}

/** Código da regra de negócio: o declarado no ErroRegra ou, para as regras do wireframe, pela frase. */
export function codigoDaRegra(mensagem: string, declarado?: string): CodigoErro {
  if (declarado && declarado in CODIGOS) return declarado as CodigoErro
  const m = mensagem.toLowerCase()
  if (m.startsWith('não encontrei')) return 'NAO_ENCONTRADO'
  if (m.includes('não se apaga') || m.includes('nunca se apaga') || m.includes('isso não se apaga') || m.includes('só cresce')) return 'EXCLUSAO_PROIBIDA'
  if (m.includes('imutável')) return 'IMUTAVEL'
  if (m.includes('exige o motivo') || m.includes('precisa de motivo') || m.includes('informe o motivo')) return 'MOTIVO_OBRIGATORIO'
  if (m.includes('concluída é final') || m.includes('concluída não se cancela') || m.includes('cancelada não volta')) return 'TAREFA_FINAL'
  if (m.includes('já foi decidido')) return 'JA_DECIDIDO'
  if (m.includes('decisão de uma pessoa')) return 'SO_PESSOA_DECIDE'
  if (m.includes('só quem escreveu')) return 'SO_AUTOR_EDITA'
  if (m.includes('está fechada')) return 'COMPETENCIA_FECHADA'
  if (m.startsWith('informe') || m.includes('precisa de um') || m.includes('precisa da') || m.includes('está vazia')) return 'CAMPO_OBRIGATORIO'
  return 'REGRA_DE_NEGOCIO'
}

/** Status HTTP de cada código (AGENTICO 8). */
export function statusDoCodigo(c: CodigoErro): number {
  switch (c) {
    case 'ENTRADA_INVALIDA':
    case 'FALTA_CHAVE_IDEMPOTENCIA':
    case 'CURSOR_INVALIDO':
      return 400
    case 'SEM_SESSAO':
    case 'SESSAO_INVALIDA':
      return 401
    case 'FERRAMENTA_DESCONHECIDA':
    case 'OPERACAO_DESCONHECIDA':
    case 'DEMONSTRACAO_DESLIGADA':
      return 404
    case 'CHAVE_REUSADA':
    case 'VERSAO_DESATUALIZADA':
    case 'ID_EM_USO':
      return 409
    case 'LIMITE_TAXA':
      return 429
    case 'ERRO_INTERNO':
      return 500
    case 'NEGADO':
    case 'MODULO_NAO_CONTRATADO':
    case 'PAPEL_INSUFICIENTE':
    case 'SEM_SETOR':
    case 'EXIGE_GESTAO':
    case 'SEM_CARTEIRA':
    case 'BLOQUEADO_POR_EXCECAO':
    case 'NIVEL_INSUFICIENTE':
    case 'FORA_DO_APP_CLIENTE':
    case 'FORA_DO_ESCRITORIO':
    case 'CONTA_INATIVA':
      return 403
    default:
      return 422
  }
}
