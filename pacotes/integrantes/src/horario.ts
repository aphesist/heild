import { z } from 'zod'

/**
 * Horário de atendimento do escritório (decisões do Enzo de 15/11/2026). Fica em
 * `escritorio.configuracao.horario_atendimento`, no fuso do escritório, e vem DESLIGADO por padrão:
 * sem horário ligado, a triagem atende a qualquer hora e não há resposta de fora do horário. Ligado
 * (`{ ligado: true }`), fora do horário vai a resposta automática fixa, sem IA, e nenhuma triagem até
 * abrir. O padrão sugerido ao ligar é de segunda a sexta, das 8h às 18h; `dias`, `inicio` e `fim`
 * mudam o padrão.
 */
export const HorarioAtendimento = z
  .object({
    /** 0 = domingo … 6 = sábado. */
    dias: z.array(z.number().int().min(0).max(6)).min(1).max(7),
    inicio: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    fim: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  })
  .strict()
  .refine((h) => h.inicio < h.fim, 'O início vem antes do fim.')
export type HorarioAtendimento = z.infer<typeof HorarioAtendimento>

/** O padrão sugerido quando o escritório liga o horário sem dizer dias e horas. */
export const HORARIO_PADRAO: HorarioAtendimento = { dias: [1, 2, 3, 4, 5], inicio: '08:00', fim: '18:00' }

/**
 * Lê da configuração do escritório. Ausente ou com `ligado` diferente de `true`: null (desligado,
 * atende a qualquer hora). Ligado: o horário dado, ou o padrão sugerido se faltar ou for inválido
 * (nunca derruba a triagem).
 */
export function horarioDe(configuracao: unknown): HorarioAtendimento | null {
  const cfg = (configuracao as { horario_atendimento?: { ligado?: unknown } & Record<string, unknown> } | null)?.horario_atendimento
  if (!cfg || cfg.ligado !== true) return null
  const { ligado: _, ...resto } = cfg
  const h = HorarioAtendimento.safeParse(resto)
  return h.success ? h.data : HORARIO_PADRAO
}

interface Local {
  dia: number
  minutos: number
  ano: number
  mes: number
  data: number
}

const SEMANA: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }

/** Data e hora locais no fuso, sem biblioteca (Intl). */
export function local(agora: Date, fuso: string): Local {
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', { timeZone: fuso, hourCycle: 'h23', weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
      .formatToParts(agora)
      .map((p) => [p.type, p.value]),
  )
  return { dia: SEMANA[partes.weekday!]!, minutos: Number(partes.hour) * 60 + Number(partes.minute), ano: Number(partes.year), mes: Number(partes.month), data: Number(partes.day) }
}

const minutos = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5))

export function dentroDoHorario(agora: Date, h: HorarioAtendimento, fuso: string): boolean {
  const l = local(agora, fuso)
  return h.dias.includes(l.dia) && l.minutos >= minutos(h.inicio) && l.minutos < minutos(h.fim)
}

/** Diferença do fuso para UTC, em minutos, no instante dado. */
function deslocamento(instante: Date, fuso: string): number {
  const l = local(instante, fuso)
  const comoUtc = Date.UTC(l.ano, l.mes - 1, l.data, Math.floor(l.minutos / 60), l.minutos % 60)
  return Math.round((comoUtc - Math.floor(instante.getTime() / 60_000) * 60_000) / 60_000)
}

/** O próximo instante em que o expediente abre (ou `agora`, se já está aberto). */
export function proximaAbertura(agora: Date, h: HorarioAtendimento, fuso: string): Date {
  if (dentroDoHorario(agora, h, fuso)) return agora
  const l = local(agora, fuso)
  for (let d = 0; d <= 7; d++) {
    const dia = (l.dia + d) % 7
    if (!h.dias.includes(dia)) continue
    if (d === 0 && l.minutos >= minutos(h.inicio)) continue
    const base = Date.UTC(l.ano, l.mes - 1, l.data + d, 0, minutos(h.inicio))
    const palpite = new Date(base - deslocamento(new Date(base), fuso) * 60_000)
    return new Date(base - deslocamento(palpite, fuso) * 60_000)
  }
  return agora
}

const NOME_DIA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']
const hora = (hhmm: string) => (hhmm.endsWith(':00') ? `${Number(hhmm.slice(0, 2))}h` : `${Number(hhmm.slice(0, 2))}h${hhmm.slice(3)}`)

/** "de segunda a sexta, das 8h às 18h" (dias seguidos viram intervalo). */
export function textoDoHorario(h: HorarioAtendimento): string {
  const dias = [...new Set(h.dias)].sort((a, b) => a - b)
  const seguidos = dias.every((d, i) => i === 0 || d === dias[i - 1]! + 1)
  const quando =
    dias.length === 1
      ? `${NOME_DIA[dias[0]!]}`
      : seguidos
        ? `de ${NOME_DIA[dias[0]!]} a ${NOME_DIA[dias.at(-1)!]}`
        : dias.map((d) => NOME_DIA[d]).join(', ').replace(/, ([^,]*)$/, ' e $1')
  return `${quando}, das ${hora(h.inicio)} às ${hora(h.fim)}`
}

/** Bom dia / Boa tarde / Boa noite pela hora local. */
export function saudacao(agora: Date, fuso: string): 'Bom dia' | 'Boa tarde' | 'Boa noite' {
  const m = local(agora, fuso).minutos
  return m < 12 * 60 ? 'Bom dia' : m < 18 * 60 ? 'Boa tarde' : 'Boa noite'
}
