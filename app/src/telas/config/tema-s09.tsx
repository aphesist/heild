import { CheckCircleIcon, LockSimpleIcon, PencilSimpleIcon, SealCheckIcon, WhatsappLogoIcon } from '@phosphor-icons/react'
import { useState, type CSSProperties } from 'react'
import { useSetoresCfg } from '@/ambiente/configuracoes'
import { useLoja, useNavegacao, usePersistente } from '@/ambiente/loja'
import { Caixa, TituloBloco } from '@/components/compostos/blocos'
import { useConfirmar } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Campo, CampoArea, CampoTexto, GavetaFormulario } from '@/components/ui/formulario'
import { cn } from '@/lib/utils'
import { useBanco } from '@/nucleo/react'
import { temas } from '@/theme/temas'
import { useTema } from '@/theme/ThemeProvider'
import type { ModoCor, Tema } from '@/theme/tipos'
import { variaveisCss } from '@/theme/variaveis'
import { precoComplemento, useComplementos } from './marca-branca'

/**
 * Blocos novos de Configurações › Tema (S09-T07): o estado do complemento de
 * marca branca (S09-A44), o seletor único de tema (fábrica, exemplos,
 * Condesp e Requinte, cada um em claro e escuro), os modelos de documento
 * (S09-A53) e o nome no WhatsApp por número (S09-A52).
 */

export function EstadoComplemento() {
  const [c] = useComplementos()
  const nav = useNavegacao()
  if (c.marca_branca)
    return (
      <p className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
        <SealCheckIcon className="text-success size-4" /> Complemento de marca branca ativo ({precoComplemento.marca_branca}): logotipo, cores, domínio, remetente e app com a marca do escritório.
      </p>
    )
  return (
    <Caixa className="ring-warning/40 flex-row flex-wrap items-center ring-1">
      <LockSimpleIcon className="size-6 shrink-0" weight="duotone" />
      <span className="min-w-0 flex-1 basis-64 text-sm">
        <span className="block font-medium">Sem marca branca: o escritório usa a identidade da plataforma</span>
        <span className="text-muted-foreground block text-xs">Dá para ver e testar tudo nesta tela, mas publicar, domínio próprio e remetente com o seu domínio dependem do complemento ({precoComplemento.marca_branca}). O App do cliente continua incluído no plano.</span>
      </span>
      <Button className="rounded-full" onClick={() => nav.irPara({ modulo: 'config', aba: 'assinatura' })}>
        Adicionar marca branca
      </Button>
    </Caixa>
  )
}

/** Mini prévia de um tema num modo (as variáveis do tema aplicadas só no recorte). */
function Miniatura({ t, modo }: { t: Tema; modo: ModoCor }) {
  return (
    <span style={variaveisCss(t, modo) as CSSProperties} className={cn('from-background to-background-end flex h-14 flex-1 flex-col justify-between overflow-hidden rounded-[10px] bg-gradient-to-b p-1.5', modo === 'escuro' && 'dark')}>
      <span className="text-foreground text-[10px] font-semibold" style={{ fontFamily: t.tokens.fonte_titulo }}>
        {t.sigla}
      </span>
      <span className="flex gap-1">
        <span className="bg-primary h-2 w-6 rounded-full" />
        <span className="bg-surface h-2 w-4 rounded-full" />
        <span className="bg-warning h-2 w-2 rounded-full" />
      </span>
    </span>
  )
}

/** Seletor único: o tema de fábrica, os exemplos e os temas dos escritórios parceiros, cada um em claro e escuro. */
export function SeletorTema() {
  const { tema, definirTema } = useTema()
  const { escritorio } = useBanco()
  const confirmar = useConfirmar()
  const [c] = useComplementos()
  return (
    <Caixa>
      <TituloBloco descricao="O tema de fábrica, os exemplos e os temas dos escritórios parceiros, cada um no claro e no escuro. Trocar recarrega a página com o tema novo; o que você editar abaixo vira uma versão do tema escolhido.">Tema em uso</TituloBloco>
      <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3" aria-label="Temas">
        {temas.map((t) => {
          const atual = t.id === tema.id
          const bloqueado = !c.marca_branca && t.id !== 'fabrica'
          return (
            <li key={t.id}>
              <button
                type="button"
                aria-pressed={atual}
                disabled={bloqueado}
                title={bloqueado ? 'Precisa do complemento de marca branca' : undefined}
                onClick={async () => {
                  if (atual) return
                  if (!(await confirmar({ titulo: `Usar o tema ${t.nome_produto}?`, descricao: 'O tema novo vale na hora para toda a equipe e para o app dos clientes. O tema anterior continua no seletor.', acao: 'Usar este tema' }))) return
                  if (definirTema) {
                    definirTema(t.id)
                    return
                  }
                  try {
                    window.localStorage.setItem(`ui-lab:tema:${escritorio.id}`, JSON.stringify(t.id))
                  } catch {
                    /* sem armazenamento */
                  }
                  window.location.reload()
                }}
                className={cn('bg-sunken/50 hover:bg-sunken flex w-full cursor-pointer flex-col gap-2 rounded-[14px] p-2.5 text-left disabled:cursor-not-allowed disabled:opacity-50', atual && 'ring-foreground/40 ring-2')}
              >
                <span className="flex gap-1.5">
                  <Miniatura t={t} modo="claro" />
                  <Miniatura t={t} modo="escuro" />
                </span>
                <span className="flex items-center gap-1.5 text-sm">
                  {t.nome_produto}
                  {t.id === 'fabrica' && <Badge variant="outline">de fábrica</Badge>}
                  {atual && <CheckCircleIcon weight="fill" className="text-success ml-auto size-4" />}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </Caixa>
  )
}

interface ModeloDoc {
  id: string
  nome: string
  titulo: string
  rodape: string
}

const modelosDocIniciais: ModeloDoc[] = [
  { id: 'relatorio', nome: 'Relatório mensal ao cliente', titulo: '{escritorio} · relatório de {competencia} · {empresa}', rodape: '{escritorio} · CRC {crc} · {telefone}' },
  { id: 'comprovante', nome: 'Comprovante de entrega', titulo: 'Comprovante de entrega · {documento}', rodape: 'Registro com impressão digital SHA-256 · {escritorio}' },
  { id: 'proposta', nome: 'Proposta de honorários', titulo: 'Proposta · {empresa}', rodape: 'Válida por 15 dias · {escritorio}' },
  { id: 'parecer', nome: 'Parecer do Consultor', titulo: 'Parecer · {assunto}', rodape: 'Base legal vigente em {data} · revisado por {pessoa}' },
]

export function ModelosDocumento() {
  const { tema } = useTema()
  const [modelos, setModelos] = usePersistente<ModeloDoc[]>('s09:tema:modelos_doc', modelosDocIniciais)
  const [ed, setEd] = useState<ModeloDoc | null>(null)
  return (
    <Caixa>
      <TituloBloco descricao="Cabeçalho e rodapé dos documentos que o sistema gera, com a marca do tema. Cada documento guarda a versão com que saiu.">Modelos de documento</TituloBloco>
      <ul className="grid gap-2 sm:grid-cols-2">
        {modelos.map((m) => (
          <li key={m.id}>
            <button type="button" onClick={() => setEd(m)} className="bg-sunken/50 hover:bg-sunken flex w-full cursor-pointer flex-col gap-2 rounded-[14px] p-2.5 text-left">
              <span className="flex aspect-[1/0.55] w-full flex-col gap-1 rounded-[6px] bg-white p-2 text-black shadow-[0_1px_2px_rgba(0,0,0,.12)]">
                <span className="flex items-center gap-1 border-b border-black/10 pb-1 text-[9px]">
                  <strong>{tema.sigla}</strong> <span className="truncate text-black/60">{m.titulo}</span>
                </span>
                <span className="h-1 w-full rounded bg-black/10" />
                <span className="h-1 w-4/5 rounded bg-black/10" />
                <span className="mt-auto truncate border-t border-black/10 pt-0.5 text-[8px] text-black/45">{m.rodape}</span>
              </span>
              <span className="flex items-center justify-between gap-2 text-sm">
                {m.nome} <PencilSimpleIcon className="text-muted-foreground size-4" />
              </span>
            </button>
          </li>
        ))}
      </ul>
      {ed && (
        <GavetaFormulario
          aberta
          onFechar={() => setEd(null)}
          titulo={ed.nome}
          descricao="Variáveis entre chaves: {escritorio}, {empresa}, {competencia}, {crc}, {telefone}, {documento}, {pessoa}, {data}. Entra na próxima versão do tema."
          acao="Salvar"
          acaoDesabilitada={!ed.titulo.trim()}
          onAcao={() => {
            setModelos((xs) => xs.map((x) => (x.id === ed.id ? ed : x)))
            setEd(null)
          }}
        >
          <Campo rotulo="Cabeçalho">{(id) => <CampoTexto id={id} valor={ed.titulo} onMudar={(v) => setEd({ ...ed, titulo: v })} />}</Campo>
          <Campo rotulo="Rodapé">{(id) => <CampoArea id={id} linhas={2} valor={ed.rodape} onMudar={(v) => setEd({ ...ed, rodape: v })} />}</Campo>
        </GavetaFormulario>
      )}
    </Caixa>
  )
}

/** Nome que aparece no WhatsApp de cada número (01, 10): a Meta aprova a troca. */
export function NomeWhatsapp() {
  const loja = useLoja()
  const [setores] = useSetoresCfg()
  const numeros = setores.filter((s) => s.numero)
  const [nomes, setNomes] = usePersistente<Record<string, { nome: string; situacao: 'aprovado' | 'em_analise' }>>('s09:tema:nome_whatsapp', {})
  const [ed, setEd] = useState<{ numero: string; nome: string } | null>(null)
  return (
    <Caixa>
      <TituloBloco descricao="O nome de exibição de cada número. A troca vai para a Meta aprovar (de minutos a 2 dias).">Nome no WhatsApp por número</TituloBloco>
      {numeros.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhum número próprio por setor: todos usam o número principal (CRM › Números).</p>
      ) : (
        <ul className="divide-border/70 flex flex-col divide-y">
          {numeros.map((s) => {
            const atual = nomes[s.numero!] ?? { nome: `Contábil Andrade · ${s.nomeExibido}`, situacao: 'aprovado' as const }
            return (
              <li key={s.codigo} className="flex flex-wrap items-center gap-2 py-2 text-sm">
                <WhatsappLogoIcon className="text-muted-foreground size-4" />
                <span className="min-w-0 grow basis-40">
                  <span className="block">{atual.nome}</span>
                  <span className="text-muted-foreground block text-xs">
                    {s.numero} · {s.nomeExibido}
                  </span>
                </span>
                <Badge variant={atual.situacao === 'aprovado' ? 'sucesso' : 'destaque'}>{atual.situacao === 'aprovado' ? 'aprovado pela Meta' : 'em análise na Meta'}</Badge>
                <Button size="icon-sm" variant="ghost" className="rounded-full" aria-label={`Editar nome de ${s.numero}`} onClick={() => setEd({ numero: s.numero!, nome: atual.nome })}>
                  <PencilSimpleIcon />
                </Button>
              </li>
            )
          })}
        </ul>
      )}
      {ed && (
        <GavetaFormulario
          aberta
          onFechar={() => setEd(null)}
          titulo={`Nome do ${ed.numero}`}
          descricao="Regras da Meta: ligado ao nome do escritório, sem só palavras genéricas."
          acao="Enviar à Meta"
          acaoDesabilitada={ed.nome.trim().length < 3}
          onAcao={() => {
            setNomes((x) => ({ ...x, [ed.numero]: { nome: ed.nome.trim(), situacao: 'em_analise' } }))
            loja.toast('Nome enviado à Meta. Avisamos quando aprovar.')
            const n = ed.numero
            setTimeout(() => setNomes((x) => ({ ...x, [n]: { ...x[n], situacao: 'aprovado' } })), 4000)
            setEd(null)
          }}
        >
          <Campo rotulo="Nome de exibição">{(id) => <CampoTexto id={id} valor={ed.nome} onMudar={(v) => setEd({ ...ed, nome: v })} />}</Campo>
        </GavetaFormulario>
      )}
    </Caixa>
  )
}
