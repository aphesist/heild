import type { ModoCor, Tema, TokensTema } from './tipos'

/**
 * Converte o tema do escritório em variáveis CSS. Esta é a única ponte entre
 * dados de marca e estilo: os componentes só conhecem as variáveis.
 *
 * Nomes seguem a convenção do shadcn/ui (--primary, --background...), para que
 * componentes novos adicionados pelo CLI do shadcn funcionem sem adaptação.
 */
export function tokensDoModo(tema: Tema, modo: ModoCor): TokensTema {
  if (modo === 'escuro') {
    const escuro = tema.modo_escuro ?? {}
    // No escuro, superfície/borda/texto suave derivam de novo, a menos que venham explícitos.
    const base = {
      ...tema.tokens,
      superficie: undefined,
      borda: undefined,
      texto_suave: undefined,
      texto_sobre_primaria: undefined,
      fundo_fim: undefined,
      lateral: undefined,
      lateral_fim: undefined,
      atencao: undefined,
      elevada: undefined,
      rebaixada: undefined,
      rebaixada_fim: undefined,
      erro_texto: undefined,
      sucesso_texto: undefined,
      atencao_texto: undefined,
      destaque_texto: undefined,
    }
    return { ...base, ...escuro }
  }
  return tema.tokens
}

const mix = (a: string, b: string, pctA: number) => `color-mix(in oklab, ${a} ${pctA}%, ${b})`

/* ---------- Contraste garantido nas cores derivadas (marca branca) ---------- */

type Rgb = [number, number, number]
const rgbDe = (c: string): Rgb | null => (/^#[0-9a-f]{6}$/i.test(c) ? [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)] : null)
const hexDe = (c: Rgb) => `#${c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`
const misturar = (a: Rgb, b: Rgb, pctA: number): Rgb => [0, 1, 2].map((i) => a[i] * (pctA / 100) + b[i] * (1 - pctA / 100)) as Rgb
const luminancia = (c: Rgb) => {
  const f = (v: number) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2])
}
const contraste = (a: Rgb, b: Rgb) => {
  const [x, y] = [luminancia(a), luminancia(b)].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}
/** Camada derivada em hexadecimal (para medir; a variável CSS continua com color-mix). */
const camada = (explicita: string | undefined, fundo: string, texto: string, pctFundo: number) => explicita && rgbDe(explicita) ? explicita : (() => {
  const f = rgbDe(fundo)
  const t = rgbDe(texto)
  return f && t ? hexDe(misturar(f, t, pctFundo)) : fundo
})()

/**
 * Leva a cor na direção do texto do tema, em passos de 5%, até passar o mínimo
 * (4,5:1, com folga) sobre todas as camadas onde ela aparece como texto.
 * Cor que não é hexadecimal fica como veio.
 */
export function comContraste(cor: string, camadas: string[], texto: string, minimo = 4.6): string {
  const c = rgbDe(cor)
  const t = rgbDe(texto)
  const fundos = camadas.map(rgbDe).filter((x): x is Rgb => !!x)
  if (!c || !t || !fundos.length) return cor
  for (let p = 0; p <= 100; p += 5) {
    const m = misturar(t, c, p)
    if (fundos.every((f) => contraste(m, f) >= minimo)) return hexDe(m)
  }
  return texto
}

/** Escolhe texto claro ou escuro sobre uma cor hexadecimal: o que dá o maior contraste WCAG. */
export function textoSobre(cor: string): string {
  const hex = cor.replace('#', '')
  if (!/^[0-9a-f]{6}$/i.test(hex)) return '#ffffff'
  const canal = (i: number) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  const lum = 0.2126 * canal(0) + 0.7152 * canal(2) + 0.0722 * canal(4)
  // Contraste com o branco (luminância 1) contra o escuro (#0b0b0f, ~0,0035): vence o maior.
  return (lum + 0.05) / (0.0035 + 0.05) >= 1.05 / (lum + 0.05) ? '#0b0b0f' : '#ffffff'
}

export function variaveisCss(tema: Tema, modo: ModoCor): Record<string, string> {
  const t = tokensDoModo(tema, modo)
  const escuro = modo === 'escuro'
  const superficie = t.superficie ?? mix(t.fundo, t.texto, escuro ? 94 : 97)
  const elevada = t.elevada ?? (escuro ? mix(t.fundo, t.texto, 89) : t.fundo)
  const rebaixada = t.rebaixada ?? mix(t.fundo, t.texto, escuro ? 97 : 90)
  const rebaixadaFim = t.rebaixada_fim ?? mix(t.fundo, t.texto, escuro ? 99 : 85)
  const borda = t.borda ?? mix(t.fundo, t.texto, modo === 'escuro' ? 82 : 88)
  const lateral = t.lateral ?? mix(t.fundo, t.texto, modo === 'escuro' ? 92 : 93)
  const lateralFim = t.lateral_fim ?? mix(t.fundo, t.texto, modo === 'escuro' ? 86 : 80)
  const fundoFim = t.fundo_fim ?? mix(t.fundo, t.texto, modo === 'escuro' ? 92 : 90)
  // Camadas em hexadecimal, para garantir o contraste do que é derivado (temas de escritório).
  // Inclui a barra lateral (o texto suave dos rótulos e ícones dela) e o fim do gradiente do fundo.
  const camadasTexto = [t.fundo, camada(t.superficie, t.fundo, t.texto, escuro ? 94 : 97), camada(t.elevada, t.fundo, t.texto, escuro ? 89 : 100), camada(t.rebaixada, t.fundo, t.texto, escuro ? 97 : 90), ...[fundoFim, lateral, lateralFim].filter((c) => /^#[0-9a-f]{6}$/i.test(c))]
  // Texto suave de tema de escritório: levado a 4,5:1 em todas as camadas, mesmo quando o tema define o próprio
  // valor (proposta 6b). O da Heild (fábrica) vem do design system como está: já passa onde aparece (proposta 6).
  const textoSuave = tema.id === 'fabrica' && t.texto_suave ? t.texto_suave : comContraste(t.texto_suave ?? camada(undefined, t.texto, t.fundo, 60), camadasTexto, t.texto)
  const atencao = t.atencao ?? (escuro ? '#e2a845' : '#b7791f')

  return {
    '--background': t.fundo,
    '--foreground': t.texto,
    '--surface': superficie,
    '--raised': elevada,
    '--sunken': rebaixada,
    '--sunken-end': rebaixadaFim,
    '--card': elevada,
    '--card-foreground': t.texto,
    '--popover': elevada,
    '--popover-foreground': t.texto,
    '--primary': t.primaria,
    '--primary-foreground': t.texto_sobre_primaria ?? textoSobre(t.primaria),
    '--secondary': rebaixada,
    '--secondary-foreground': t.texto,
    '--muted': rebaixada,
    '--muted-foreground': textoSuave,
    '--accent': rebaixada,
    '--accent-foreground': t.texto,
    '--warning': atencao,
    // Cor de estado como texto (cores.md): a do tema, ou a cor de estado com contraste garantido.
    '--destructive-text': t.erro_texto ?? comContraste(t.erro, camadasTexto, t.texto),
    '--success-text': t.sucesso_texto ?? comContraste(t.sucesso, camadasTexto, t.texto),
    '--warning-text': t.atencao_texto ?? comContraste(atencao, camadasTexto, t.texto),
    '--highlight-text': t.destaque_texto ?? comContraste(t.destaque, camadasTexto, t.texto),
    // A primária usada como texto (botão link, link no corpo): a própria cor, levada até 4,5:1 nas camadas quando não chega.
    '--primary-text': comContraste(t.primaria, camadasTexto, t.texto),
    '--highlight': t.destaque,
    '--highlight-foreground': textoSobre(t.destaque),
    '--destructive': t.erro,
    '--destructive-foreground': textoSobre(t.erro),
    '--success': t.sucesso,
    '--success-foreground': textoSobre(t.sucesso),
    '--border': borda,
    '--input': borda,
    '--ring': mix(t.primaria, t.fundo, 60),
    '--background-end': fundoFim,
    '--sidebar': lateral,
    '--sidebar-end': lateralFim,
    // Tinta das sombras: o texto do tema no claro (sombra areia), preto no escuro.
    '--shadow-ink': escuro ? '#000000' : t.texto,
    // Tinta do contorno de 1px: no escuro, preto sobre fundo escuro some; o contorno passa a ser claro.
    '--contorno-ink': escuro ? '#ffffff' : t.texto,
    '--radius': t.raio_borda,
    '--font-heading': t.fonte_titulo,
    '--font-body': t.fonte_texto,
  }
}
