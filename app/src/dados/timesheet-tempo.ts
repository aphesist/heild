/**
 * S06 · Tempo do Timesheet. As sessões guardam data e hora ISO com o fuso do
 * escritório (America/Sao_Paulo); a leitura converte pelo fuso, então funciona
 * igual com o que vem do localStorage (`-03:00`) e do Postgres (UTC).
 *
 * O "hoje" da demonstração é o mesmo das outras telas (18/11/2026, quarta);
 * a captura ao vivo grava no dia da demonstração com a hora do relógio.
 */

export const HOJE_TS = '2026-11-18'
export const FUSO = 'America/Sao_Paulo'
const OFFSET = '-03:00'

const fmtHora = new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO, hour: '2-digit', minute: '2-digit', hour12: false })
const fmtDia = new Intl.DateTimeFormat('en-CA', { timeZone: FUSO, year: 'numeric', month: '2-digit', day: '2-digit' })

/** Monta a data e hora de um dia ("2026-11-18", "10:10") no fuso do escritório. */
export const dh = (dia: string, hora: string) => `${dia}T${hora.length === 5 ? `${hora}:00` : hora}${OFFSET}`
/** "HH:MM" no fuso do escritório. */
export const hm = (iso: string) => fmtHora.format(new Date(iso)).replace(/^24/, '00')
/** "AAAA-MM-DD" no fuso do escritório. */
export const diaDe = (iso: string) => fmtDia.format(new Date(iso))
/** Minutos desde 0h no fuso do escritório. */
export const minDoDia = (iso: string) => {
  const [h, m] = hm(iso).split(':').map(Number)
  return h * 60 + m
}
export const minHora = (h: string) => {
  const [a, b] = h.split(':').map(Number)
  return a * 60 + (b || 0)
}
export const duracaoMin = (s: { inicio: string; fim?: string | null }) => (s.fim ? Math.max(0, Math.round((Date.parse(s.fim) - Date.parse(s.inicio)) / 60000)) : 0)
export const somaMin = (xs: { inicio: string; fim?: string | null }[]) => xs.reduce((t, x) => t + duracaoMin(x), 0)

/** "7h20", "35 min". */
export const fmtH = (m: number) => {
  const h = Math.floor(m / 60)
  const r = Math.round(m % 60)
  return h ? `${h}h${r ? String(r).padStart(2, '0') : ''}` : `${r} min`
}
/** Horas com uma casa ("31,5 h"). */
export const fmtHoras = (m: number) => `${(Math.round((m / 60) * 10) / 10).toString().replace('.', ',')} h`

/** Agora, no dia da demonstração, com a hora do relógio (a captura ao vivo usa isto). */
export function agoraDemo(t = Date.now()) {
  return dh(HOJE_TS, hm(new Date(t).toISOString()) + ':' + String(new Date(t).getSeconds()).padStart(2, '0'))
}

const dataLocal = (dia: string) => new Date(`${dia}T12:00:00${OFFSET}`)
export const somarDias = (dia: string, n: number) => {
  const d = dataLocal(dia)
  d.setUTCDate(d.getUTCDate() + n)
  return diaDe(d.toISOString())
}
export const diaSemana = (dia: string) => dataLocal(dia).getUTCDay()
export const ehDiaUtil = (dia: string) => diaSemana(dia) !== 0 && diaSemana(dia) !== 6
export const rotuloDia = (dia: string) => {
  const d = dataLocal(dia)
  return `${['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'][d.getUTCDay()]} ${d.getUTCDate()}/${d.getUTCMonth() + 1}`
}
export const ddmm = (dia: string) => `${dia.slice(8, 10)}/${dia.slice(5, 7)}`
/** Segunda-feira da semana do dia. */
export const inicioSemana = (dia: string) => somarDias(dia, -((diaSemana(dia) + 6) % 7))
export const diasUteis = (de: string, ate: string) => {
  const r: string[] = []
  for (let d = de; d <= ate; d = somarDias(d, 1)) if (ehDiaUtil(d)) r.push(d)
  return r
}
export const competenciaDe = (dia: string) => dia.slice(0, 7)
export const mesesPt = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
export const rotuloCompetencia = (c: string) => `${mesesPt[Number(c.slice(5, 7)) - 1]}/${c.slice(0, 4)}`
export const somarMeses = (c: string, n: number) => {
  const total = Number(c.slice(0, 4)) * 12 + Number(c.slice(5, 7)) - 1 + n
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`
}
