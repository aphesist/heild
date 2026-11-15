import { CheckCircleIcon, ClockCounterClockwiseIcon, GlobeIcon, ImageIcon, SpinnerIcon, WarningIcon } from '@phosphor-icons/react'
import { usePersistente } from '@/ambiente/loja'
import { BotaoFeito } from '@/ambiente/interface'
import { useState, type CSSProperties } from 'react'
import { Caixa, Propriedade, TituloBloco } from '@/components/compostos/blocos'
import { ValorEditavel } from '@/components/kit'
import { AreaRolagem } from '@/components/ui/area-rolagem'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Campo, CampoArea, CampoEscolha, CampoTexto, GavetaFormulario, Segmentado } from '@/components/ui/formulario'
import { Orb } from '@/components/ui/orb'
import { versoesTema as versoesIniciais } from '@/dados/configuracoes'
import { rotuloSetor } from '@/dados/crm'
import { useTema } from '@/theme/ThemeProvider'
import type { ModoCor, SetorIntegrante, Tema, TokensTema } from '@/theme/tipos'
import { textoSobre, tokensDoModo, variaveisCss } from '@/theme/variaveis'
import { CabecalhoConfig } from './EscritorioTela'
import { EstadoComplemento, ModelosDocumento, NomeWhatsapp, SeletorTema } from './tema-s09'
import { useMarcaBranca } from './marca-branca'

/** Contraste WCAG entre duas cores hex. */
function contraste(a: string, b: string) {
  const lum = (h: string) => {
    const m = h.replace('#', '').match(/.{2}/g)
    if (!m || m.length < 3) return 0.5
    const [r, g, bl] = m.slice(0, 3).map((x) => {
      const c = parseInt(x, 16) / 255
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl
  }
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}

const fontes = [
  {
    valor: '"PP Neue Montreal", ui-sans-serif, system-ui, sans-serif',
    rotulo: 'PP Neue Montreal',
  },
  {
    valor: 'ui-sans-serif, system-ui, sans-serif',
    rotulo: 'Sistema (sem serifa)',
  },
  {
    valor: 'ui-rounded, ui-sans-serif, system-ui, sans-serif',
    rotulo: 'Arredondada',
  },
  { valor: 'ui-serif, Georgia, serif', rotulo: 'Com serifa' },
]

const camposCor: { chave: keyof TokensTema; rotulo: string; ajuda: string }[] = [
  {
    chave: 'primaria',
    rotulo: 'Primária',
    ajuda: 'botões principais, seleção',
  },
  { chave: 'fundo', rotulo: 'Fundo', ajuda: 'a página' },
  { chave: 'texto', rotulo: 'Texto', ajuda: 'e o orb do Assistente' },
  {
    chave: 'destaque',
    rotulo: 'Destaque da marca',
    ajuda: 'detalhes de identidade',
  },
  { chave: 'atencao', rotulo: 'Atenção', ajuda: 'prazo, falta, urgente' },
  { chave: 'erro', rotulo: 'Erro', ajuda: 'atraso, rejeição' },
  { chave: 'sucesso', rotulo: 'Sucesso', ajuda: 'feito, pago, aprovado' },
]

const exigeTexto = (v: string) => (v.trim() ? null : 'Não pode ficar vazio.')
const exigeHost = (v: string) => (/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(v.trim().toLowerCase()) ? null : 'Endereço como painel.seudominio.com.br.')
const exigeEmail = (v: string) => (/^\S+@\S+\.\S+$/.test(v.trim()) ? null : 'E-mail como nome@seudominio.com.br.')

const modelosTexto = [
  {
    chave: 'assinatura_email',
    grupo: 'Documentos',
    texto: '{pessoa} · {setor} · {escritorio} · {telefone}',
  },
  {
    chave: 'saudacao',
    grupo: 'Atendimento',
    texto: 'Olá, {nome}! Aqui é o {escritorio}.',
  },
  {
    chave: 'convite_app',
    grupo: 'App do cliente',
    texto: '{nome}, a {empresa} agora acompanha tudo com o {escritorio} pelo app. Toque para entrar: {link}',
  },
  {
    chave: 'tudo_em_dia',
    grupo: 'App do cliente',
    texto: 'Tudo em dia por aqui. Nada pendente com você este mês.',
  },
  {
    chave: 'termo_timesheet',
    grupo: 'Equipe',
    texto: 'Registramos o tempo de trabalho por cliente para saber quanto cada um custa e acabar com o apontamento manual…',
  },
  {
    chave: 'timesheet_apresentacao',
    grupo: 'Equipe',
    texto: 'Ninguém precisa mais apontar horas; vocês confirmam o que o sistema deduziu, e cada um vê os próprios dados primeiro.',
  },
  {
    chave: 'rodape_email',
    grupo: 'Documentos',
    texto: '{escritorio} · CRC {crc} · {telefone}',
  },
  {
    chave: 'cabecalho_relatorio',
    grupo: 'Documentos',
    texto: '{escritorio} · relatório de {competencia} · {empresa}',
  },
]

/**
 * Configurações › Tema (Fundações 10): a marca branca. Identidade, cores do
 * claro e do escuro com prévia ao vivo e checagem de contraste, tipografia e
 * raio, domínios e remetente com verificação, integrantes padrão, modelos de
 * texto e versões (publicar cria nova versão; documentos guardam a versão).
 */
export function TemaTela() {
  const { tema } = useTema()
  const [r, setR] = useState<Tema>(() => JSON.parse(JSON.stringify(tema)))
  const [modo, setModo] = useState<ModoCor>('claro')
  const [versoes, setVersoes] = usePersistente('cfg.tema.versoes', versoesIniciais)
  const [modal, setModal] = useState<'publicar' | 'logo' | null>(null)
  const [verificando, setVerificando] = useState<string | null>(null)
  const [modelos, setModelos] = usePersistente('cfg.tema.modelos', modelosTexto)
  const [dominios, setDominios] = usePersistente('cfg.tema.dominios', {
    painel: { host: 'painel.contabilandrade.com.br', ok: true },
    app: { host: 'app.contabilandrade.com.br', ok: false },
  })
  const [remetente, setRemetente] = usePersistente('cfg.tema.remetente', {
    nome: 'Contábil Andrade & Lima',
    email: 'atendimento@contabilandrade.com.br',
    ok: true,
  })
  const alterado = JSON.stringify(r) !== JSON.stringify(tema)
  const marca = useMarcaBranca()
  const t = tokensDoModo(r, modo)

  const setIntegrante = (s: SetorIntegrante, p: { nome?: string; cor?: string }) =>
    setR((x) => {
      const i = x.integrantes_padrao[s]!
      return { ...x, integrantes_padrao: { ...x.integrantes_padrao, [s]: { ...i, nome: p.nome ?? i.nome, avatar: { ...i.avatar, cor: p.cor ?? i.avatar.cor } } } }
    })
  const verificarDns = (k: 'painel' | 'app') => {
    setVerificando(k)
    setTimeout(() => {
      setVerificando(null)
      setDominios((x) => ({ ...x, [k]: { ...x[k], ok: true } }))
    }, 1300)
  }

  const setToken = (k: keyof TokensTema, v: string) => setR((x) => (modo === 'claro' ? { ...x, tokens: { ...x.tokens, [k]: v } } : { ...x, modo_escuro: { ...x.modo_escuro, [k]: v } }))

  const cTexto = contraste(t.texto, t.fundo)
  const cPrim = contraste(t.primaria, t.texto_sobre_primaria ?? textoSobre(t.primaria))
  const setores = (Object.keys(r.integrantes_padrao) as SetorIntegrante[]).filter((s) => s !== 'geral')

  return (
    <AreaRolagem className="h-full px-4 pb-10 sm:px-5 md:pb-24">
      <div className="pagina flex flex-col gap-4 pt-1">
        <CabecalhoConfig
          titulo="Tema"
          sub={`Versão ${versoes[0].versao} publicada · o tema de fábrica é só o ponto de partida e nunca aparece para o cliente`}
          acao={
            <Button size="sm" className="rounded-full" disabled={!alterado || !marca.contratada} title={!marca.contratada ? 'Publicar depende do complemento de marca branca' : undefined} onClick={() => setModal('publicar')}>
              Publicar versão {versoes[0].versao + 1}
            </Button>
          }
        />

        <EstadoComplemento />
        <SeletorTema />
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <div data-pilha className="flex min-w-0 flex-col gap-4">
            <Caixa>
              <TituloBloco>Identidade</TituloBloco>
              <div className="grid gap-3 sm:grid-cols-[1fr_6rem]">
                <Campo rotulo="Nome do produto" ajuda="Título do painel e do app.">
                  {(id) => <CampoTexto id={id} valor={r.nome_produto} onMudar={(v) => setR({ ...r, nome_produto: v })} />}
                </Campo>
                <Campo rotulo="Sigla">{(id) => <CampoTexto id={id} valor={r.sigla} onMudar={(v) => setR({ ...r, sigla: v.slice(0, 3).toUpperCase() })} />}</Campo>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-sunken flex size-14 items-center justify-center rounded-lg text-xl font-semibold">{r.sigla}</span>
                <span className="text-muted-foreground min-w-0 flex-1 text-xs">Logotipo, ícone do app e favicon. Sem logotipo, usamos a sigla.</span>
                <Button size="sm" variant="outline" className="rounded-full" onClick={() => setModal('logo')}>
                  <ImageIcon /> Enviar
                </Button>
              </div>
            </Caixa>

            <Caixa>
              <TituloBloco
                acao={
                  <Segmentado
                    rotulo="Modo"
                    valor={modo}
                    onMudar={setModo}
                    opcoes={[
                      { valor: 'claro', rotulo: 'Claro' },
                      { valor: 'escuro', rotulo: 'Escuro' },
                    ]}
                  />
                }
                descricao="As camadas (superfície, elevada, rebaixada) saem do fundo e do texto; dá para ajustar uma a uma depois."
              >
                Cores
              </TituloBloco>
              <ul className="grid gap-2 sm:grid-cols-2 sm:[&>li:last-child:nth-child(odd)]:col-span-2">
                {camposCor.map((c) => {
                  const valor = (t[c.chave] as string) || '#999999'
                  return (
                    <li key={c.chave}>
                      <label className="bg-sunken/50 flex cursor-pointer items-center gap-3 rounded-md px-2.5 py-2">
                        <input
                          type="color"
                          value={valor.length === 7 ? valor : '#999999'}
                          onChange={(e) => setToken(c.chave, e.target.value)}
                          className="size-8 shrink-0 cursor-pointer rounded-md border-0 bg-transparent p-0"
                          aria-label={c.rotulo}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm">{c.rotulo}</span>
                          <span className="text-muted-foreground block truncate text-xs">
                            {valor} · {c.ajuda}
                          </span>
                        </span>
                      </label>
                    </li>
                  )
                })}
              </ul>
              <div className="flex flex-col gap-1 text-xs">
                <span className={cTexto >= 4.5 ? 'text-muted-foreground' : 'text-destructive-text'}>
                  {cTexto >= 4.5 ? <CheckCircleIcon className="text-success mr-1 inline size-3.5" /> : <WarningIcon className="mr-1 inline size-3.5" />}
                  Texto sobre o fundo: {cTexto.toFixed(1).replace('.', ',')}:1 {cTexto >= 4.5 ? '(legível)' : '(abaixo de 4,5:1: difícil de ler)'}
                </span>
                <span className={cPrim >= 4.5 ? 'text-muted-foreground' : 'text-warning-text'}>
                  {cPrim >= 4.5 ? <CheckCircleIcon className="text-success mr-1 inline size-3.5" /> : <WarningIcon className="mr-1 inline size-3.5" />}
                  Texto do botão sobre a primária: {cPrim.toFixed(1).replace('.', ',')}:1
                </span>
              </div>
            </Caixa>
            <Caixa>
              <TituloBloco descricao="O tema é carregado pelo endereço, antes do login. Crie o registro CNAME no seu provedor de DNS e verifique: leva de minutos a algumas horas.">Domínios</TituloBloco>
              <dl className="divide-border/70 flex flex-col divide-y">
                {(['painel', 'app'] as const).map((k) => (
                  <Propriedade key={k} rotulo={k === 'painel' ? 'Painel da equipe' : 'App do cliente'}>
                    <span className="flex flex-wrap items-center gap-2">
                      <ValorEditavel
                        rotulo={k === 'painel' ? 'Domínio do painel da equipe' : 'Domínio do app do cliente'}
                        valor={dominios[k].host}
                        config={{ tipo: 'texto', validar: exigeHost }}
                        className="min-w-0 font-mono text-xs break-all"
                        onMudar={(v) => setDominios((x) => ({ ...x, [k]: { host: v.trim().toLowerCase(), ok: false } }))}
                      />
                      {dominios[k].ok ? <Badge variant="sucesso">verificado</Badge> : <Badge variant="destaque">aguardando DNS</Badge>}
                    </span>
                    {!dominios[k].ok && (
                      <span className="mt-1.5 flex flex-col items-start gap-1.5">
                        <code className="bg-sunken/60 rounded-md px-3 py-1.5 text-xs break-all">
                          {dominios[k].host.split('.')[0]} CNAME {k}.plataforma-contabil.com.br
                        </code>
                        <Button type="button" size="sm" variant="outline" className="rounded-full" disabled={verificando === k} onClick={() => verificarDns(k)}>
                          {verificando === k ? <SpinnerIcon className="animate-spin" /> : <GlobeIcon />} {verificando === k ? 'Verificando…' : 'Verificar DNS'}
                        </Button>
                      </span>
                    )}
                  </Propriedade>
                ))}
              </dl>
            </Caixa>
            <Caixa>
              <TituloBloco descricao="Os e-mails do sistema (convites, comunicados, resumos) saem com este nome e endereço.">Remetente de e-mail e WhatsApp</TituloBloco>
              <dl className="divide-border/70 flex flex-col divide-y">
                <Propriedade rotulo="E-mail">
                  <span className="block">
                    <ValorEditavel rotulo="Nome do remetente" valor={remetente.nome} config={{ tipo: 'texto', validar: exigeTexto }} onMudar={(v) => setRemetente((x) => ({ ...x, nome: v.trim() }))} />
                  </span>
                  <span className="text-muted-foreground block">
                    <ValorEditavel
                      rotulo="Endereço do remetente"
                      valor={remetente.email}
                      config={{ tipo: 'texto', validar: exigeEmail }}
                      className="break-all"
                      onMudar={(v) => setRemetente((x) => ({ ...x, email: v.trim(), ok: v.trim().split('@')[1] === x.email.split('@')[1] && x.ok }))}
                    />
                  </span>
                  {remetente.ok ? (
                    <Badge variant="sucesso" className="mt-1">
                      domínio verificado
                    </Badge>
                  ) : (
                    <span className="mt-1.5 flex flex-col items-start gap-1.5">
                      {['SPF  TXT  v=spf1 include:mail.plataforma-contabil.com.br ~all', 'DKIM CNAME pc._domainkey → dkim.plataforma-contabil.com.br'].map((x) => (
                        <code key={x} className="bg-sunken/60 rounded-md px-3 py-1.5 text-xs break-all">
                          {x}
                        </code>
                      ))}
                      <Button type="button" size="sm" variant="outline" className="rounded-full" onClick={() => setRemetente((x) => ({ ...x, ok: true }))}>
                        Verificar domínio
                      </Button>
                    </span>
                  )}
                </Propriedade>
                <Propriedade rotulo="Nome no WhatsApp">por número, no bloco abaixo</Propriedade>
              </dl>
            </Caixa>
            <Caixa>
              <TituloBloco descricao="Cada documento gerado guarda a versão do tema com que saiu.">Versões</TituloBloco>
              <ul className="flex flex-col gap-2 text-sm">
                {versoes.map((v, i) => (
                  <li key={v.versao} className="flex items-start gap-3">
                    <ClockCounterClockwiseIcon className="text-muted-foreground mt-0.5 size-4" />
                    <span className="min-w-0 flex-1">
                      <span className="block">
                        v{v.versao} · {v.mudanca} {i === 0 && <Badge variant="sucesso">em uso</Badge>}
                      </span>
                      <span className="text-muted-foreground block text-xs">
                        {v.quando} · {v.por}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </Caixa>
            <NomeWhatsapp />
          </div>

          <div data-pilha className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-0">
            <Previa tema={r} modo={modo} />
            <Caixa>
              <TituloBloco descricao="Nome e cor do orb de cada setor (toque no orb para trocar a cor). Vale para quem não deu outro nome ao seu. O Assistente é sempre o contraste do tema.">Integrantes padrão</TituloBloco>
              <ul className="largo:grid-cols-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
                {setores.map((s) => {
                  const i = r.integrantes_padrao[s]!
                  return (
                    <li key={s} className="bg-sunken/50 flex items-center gap-2 rounded-md px-2.5 py-2">
                      {/* O orb é a amostra da cor: clicar abre o seletor de cor do navegador, como nas Cores acima. */}
                      <span className="relative shrink-0">
                        <Orb cor={(modo === 'escuro' && i.avatar.cor_escuro) || i.avatar.cor} corOlhos={i.avatar.cor_olhos} tamanho={26} cutucavel={false} extras={false} />
                        <input type="color" aria-label={`Cor do orb de ${i.nome}`} title="Cor do orb" value={i.avatar.cor.length === 7 ? i.avatar.cor : '#999999'} onChange={(e) => setIntegrante(s, { cor: e.target.value })} className="absolute inset-0 size-full cursor-pointer opacity-0" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm">
                          <ValorEditavel rotulo={`Nome do integrante do ${rotuloSetor[s] ?? s}`} valor={i.nome} config={{ tipo: 'texto', validar: exigeTexto }} onMudar={(v) => setIntegrante(s, { nome: v.trim() })} />
                        </span>
                        <span className="text-muted-foreground block truncate text-xs">{rotuloSetor[s] ?? (s === 'financeiro_escritorio' ? 'Financeiro' : s)}</span>
                      </span>
                    </li>
                  )
                })}
              </ul>
            </Caixa>
            <Caixa>
              <TituloBloco>Tipografia e forma</TituloBloco>
              <div className="grid gap-3 sm:grid-cols-2">
                <Campo rotulo="Títulos">
                  {(id) => (
                    <CampoEscolha id={id} valor={fontes.some((f) => f.valor === r.tokens.fonte_titulo) ? r.tokens.fonte_titulo : fontes[1].valor} onMudar={(v) => setR({ ...r, tokens: { ...r.tokens, fonte_titulo: v } })} opcoes={fontes} />
                  )}
                </Campo>
                <Campo rotulo="Texto">
                  {(id) => (
                    <CampoEscolha id={id} valor={fontes.some((f) => f.valor === r.tokens.fonte_texto) ? r.tokens.fonte_texto : fontes[1].valor} onMudar={(v) => setR({ ...r, tokens: { ...r.tokens, fonte_texto: v } })} opcoes={fontes} />
                  )}
                </Campo>
              </div>
              <Campo rotulo={`Arredondamento: ${r.tokens.raio_borda}`}>
                {(id) => (
                  <input
                    id={id}
                    type="range"
                    min={0}
                    max={24}
                    value={parseFloat(r.tokens.raio_borda) * (r.tokens.raio_borda.endsWith('rem') ? 16 : 1)}
                    onChange={(e) =>
                      setR({
                        ...r,
                        tokens: {
                          ...r.tokens,
                          raio_borda: `${Number(e.target.value) / 16}rem`,
                        },
                      })
                    }
                    className="accent-foreground w-full"
                  />
                )}
              </Campo>
            </Caixa>
            <ModelosDocumento />
            <Caixa className="flex-1">
              <TituloBloco descricao="Textos com variáveis entre chaves: {nome}, {empresa}, {escritorio}, {competencia}, {link}, {crc}, {telefone}. Mudar um texto publica com a próxima versão do tema. Os do atendimento ficam em CRM › Números › Mensagens automáticas.">
                Modelos de texto
              </TituloBloco>
              <ul className="divide-border/70 flex flex-col divide-y">
                {modelos.map((m) => (
                  <li key={m.chave} className="flex flex-col py-2">
                    <span className="flex items-center gap-2 text-sm">
                      <code>{m.chave}</code> <span className="text-muted-foreground text-xs">{m.grupo}</span>
                    </span>
                    <span className="text-muted-foreground text-xs">
                      <ValorEditavel rotulo={`Texto de ${m.chave}`} valor={m.texto} config={{ tipo: 'texto', multilinha: true, validar: exigeTexto }} onMudar={(v) => setModelos((xs) => xs.map((x) => (x.chave === m.chave ? { ...x, texto: v } : x)))} />
                    </span>
                  </li>
                ))}
              </ul>
            </Caixa>
          </div>
        </div>
      </div>

      {modal === 'publicar' && (
        <Publicar
          versao={versoes[0].versao + 1}
          onFechar={() => setModal(null)}
          onPublicar={(mudanca) => {
            setVersoes((xs) => [
              {
                versao: xs[0].versao + 1,
                quando: 'agora',
                por: 'Fernanda Lima',
                mudanca,
              },
              ...xs,
            ])
            setModal(null)
          }}
        />
      )}
      {modal === 'logo' && (
        <GavetaFormulario aberta onFechar={() => setModal(null)} titulo="Logotipo e ícones" descricao="Viram documentos do escritório. O ícone do app e o favicon saem do ícone." acao="Salvar" onAcao={() => setModal(null)}>
          {['Logotipo (SVG ou PNG, fundo transparente)', 'Ícone quadrado (512 px)', 'Logotipo para o modo escuro (opcional)'].map((x) => (
            <div key={x} className="border-border flex items-center gap-3 rounded-lg border border-dashed px-3 py-4 text-sm">
              <ImageIcon className="text-muted-foreground size-6" />
              <span className="flex-1">{x}</span>
              <BotaoFeito type="button" size="sm" variant="outline" className="rounded-full" texto={`${x.split(' (')[0]}: arquivo carregado. Entra na próxima versão do tema.`}>
                Escolher arquivo
              </BotaoFeito>
            </div>
          ))}
        </GavetaFormulario>
      )}
    </AreaRolagem>
  )
}

/** Prévia ao vivo: as variáveis do rascunho aplicadas só neste recorte. */
function Previa({ tema, modo }: { tema: Tema; modo: ModoCor }) {
  const vars = variaveisCss(tema, modo) as CSSProperties
  return (
    <section aria-label="Prévia do tema" style={vars} className={modo === 'escuro' ? 'dark' : undefined}>
      <div className="from-background to-background-end text-foreground overflow-hidden rounded-cartao bg-gradient-to-b p-3 shadow-cartao" style={{ fontFamily: tema.tokens.fonte_texto }}>
        <div className="flex gap-3">
          <div className="from-sidebar to-sidebar-end hidden w-28 shrink-0 flex-col gap-1 rounded-lg bg-gradient-to-b p-2 text-xs sm:flex">
            <span className="mb-1 px-1.5 text-base font-semibold">{tema.sigla}</span>
            {['Início', 'Painel', 'CRM', 'Timesheet'].map((m, i) => (
              <span key={m} className={i === 1 ? 'bg-raised rounded-sm px-1.5 py-1 font-medium' : 'px-1.5 py-1'}>
                {m}
              </span>
            ))}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2.5">
            <div className="bg-sunken flex w-fit gap-0.5 rounded-full p-0.5 text-xs">
              <span className="bg-raised rounded-full px-2.5 py-1 font-medium">Fiscal</span>
              <span className="text-muted-foreground px-2.5 py-1">DP</span>
              <span className="text-muted-foreground px-2.5 py-1">Contábil</span>
            </div>
            <h4 className="text-xl font-light" style={{ fontFamily: tema.tokens.fonte_titulo }}>
              {tema.nome_produto}
            </h4>
            <div className="bg-surface shadow-cartao flex flex-col gap-2 p-3" style={{ borderRadius: `calc(${tema.tokens.raio_borda} * 1.6)` }}>
              <span className="text-sm font-medium">Guias de outubro</span>
              <span className="text-muted-foreground text-xs">3 enviadas · 1 vence hoje</span>
              <div className="flex flex-wrap gap-1.5">
                <span className="bg-success/15 rounded-full px-2 py-0.5 text-xs">paga</span>
                <span className="bg-warning/15 rounded-full px-2 py-0.5 text-xs">vence hoje</span>
                <span className="bg-destructive/15 text-foreground rounded-full px-2 py-0.5 text-xs">atrasada</span>
                <span className="bg-highlight/20 rounded-full px-2 py-0.5 text-xs">destaque</span>
              </div>
              <div className="flex gap-2">
                <span className="bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium" style={{ borderRadius: tema.tokens.raio_borda }}>
                  Enviar ao cliente
                </span>
                <span className="bg-raised shadow-contorno px-3 py-1.5 text-xs" style={{ borderRadius: tema.tokens.raio_borda }}>
                  Ver guia
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Publicar({ versao, onFechar, onPublicar }: { versao: number; onFechar: () => void; onPublicar: (m: string) => void }) {
  const [m, setM] = useState('')
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo={`Publicar versão ${versao}`}
      descricao="Vale na hora para a equipe e para o app dos clientes. A versão anterior fica guardada e os documentos já gerados não mudam."
      acao="Publicar"
      acaoDesabilitada={!m.trim()}
      onAcao={() => onPublicar(m.trim())}
    >
      <Campo rotulo="O que mudou" ajuda="Aparece no histórico de versões.">
        {(id) => <CampoArea id={id} linhas={2} valor={m} onMudar={setM} />}
      </Campo>
    </GavetaFormulario>
  )
}
