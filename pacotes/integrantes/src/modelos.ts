import type { ConfigModelos } from '@heild/processos'

/**
 * Modelos dos integrantes (decisão 3; B3b). O padrão é Sonnet como operário e escritor e Opus como
 * revisor. O Haiku entra como operário SÓ nos contratos em que o portão provou, no gabarito ampliado
 * (30 casos distintos por contrato, 2 repetições), que ele iguala o Sonnet caso a caso, sem erro
 * crítico e dentro da margem de −3 pontos. A evidência de cada linha está no relatório citado.
 *
 * Mudar esta lista exige rodar o portão de novo (`npm run avaliar` com HEILD_AVALIACAO_PORTAO=1).
 */
export const RELATORIO_DO_PORTAO = 'docs/backend/relatorios/integrantes-ajustes-2026-11-15-real.md'

export const CONTRATOS_NO_HAIKU: { contrato: string; evidencia: string }[] = [
  { contrato: 'ctb.competencia.escolher', evidencia: '60 × 60 acertos (v2), 0 erro crítico; escaladas 14 Sonnet × 21 Haiku' },
  { contrato: 'ctb.ecd.apontar_atencao', evidencia: '60 × 60, 0 erro crítico' },
  { contrato: 'fis.guia.identificar', evidencia: '60 × 60, 0 erro crítico' },
  { contrato: 'fis.caixa_postal.classificar', evidencia: '60 × 60, 0 erro crítico' },
  { contrato: 'dp.evento.classificar', evidencia: '60 × 60 no DP-EVENTO-FOLHA v2 (com o validador de quantidade), 0 erro crítico' },
  { contrato: 'soc.alteracao.classificar', evidencia: '60 × 60, 0 erro crítico' },
  { contrato: 'ges.faq.escolher', evidencia: '55 × 55 (os mesmos 5 cartões desnecessários nos dois), 0 erro crítico' },
  { contrato: 'ges.triagem.classificar', evidencia: '84 × 84 no contrato v2 (triagem do número compartilhado, 42 casos), 0 erro crítico' },
]

/** O roteador barato do Assistente: Haiku só se o portão do roteador liberar (decisão 4 com a 3). */
export const ROTEADOR_BARATO_NO_HAIKU = { liberado: true, evidencia: 'com o trecho: Haiku 28 × Sonnet 26 de 32, 0 erro crítico, e o Haiku acertou todo caso que o Sonnet acertou' }

/** Aplica a lista sobre a configuração de produção (só onde há preço do Haiku, isto é, com o fornecedor real). */
export function modelosDosIntegrantes(base: ConfigModelos): ConfigModelos {
  if (!base.precos['claude-haiku-5-5']) return base
  return {
    ...base,
    porContrato: { ...base.porContrato, ...Object.fromEntries(CONTRATOS_NO_HAIKU.map((c) => [c.contrato, { ...base.porContrato?.[c.contrato], operario: 'claude-haiku-5-5' }])) },
  }
}
