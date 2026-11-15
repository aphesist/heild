import { ArrowRightIcon, CaretDownIcon, CircleNotchIcon, EnvelopeSimpleIcon, FileTextIcon, LinkIcon, MagnifyingGlassIcon, PaperclipIcon, ReceiptIcon, TrashIcon, WarningIcon, WhatsappLogoIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { BotaoAcoes, SeloDemonstracao, SePode, useAcao, useConfirmar, type AcaoMenu } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Campo, CampoEscolha, CampoTexto, GavetaFormulario } from '@/components/ui/formulario'
import { cn } from '@/lib/utils'
import type { BpoDocumento } from '@/nucleo/modelo/entidades'
import { documentosBpo } from '@/nucleo/repositorios/s08b-operacao'
import type { ConteudoDocumento } from '@/nucleo/semente/s08b'
import { brl, Caixa, TituloBloco } from '../comum'
import { dataCurta, dataHora, type EmpresaVista } from '../dados'
import { docAberto, rotuloCanal, useDocumentosBpo } from './dados'
import { usePedirOperacao, useTrabalhandoEm } from './integrantes'

/**
 * S08b · Captura de documentos (10, 3.5): o que chega pelo WhatsApp, e-mail,
 * app e DDA entra aqui antes de virar conta. O integrante de Contas a Pagar lê
 * (valor, vencimento, fornecedor, código de barras) e checa (duplicidade,
 * fornecedor novo, dados bancários diferentes, valor fora do padrão). Uma
 * pessoa revisa e lança, anexa ao pedido da fila ou descarta com o motivo.
 */

const iconeCanal = (c: BpoDocumento['canal']) => (c === 'whatsapp' ? <WhatsappLogoIcon /> : c === 'email' ? <EnvelopeSimpleIcon /> : c === 'dda' ? <ReceiptIcon /> : <FileTextIcon />)
export const rotuloSituacaoDoc: Record<BpoDocumento['situacao'], string> = { recebido: 'chegou', lido: 'lido pelo integrante', lancado: 'conta lançada', anexado: 'anexado', descartado: 'descartado' }
const tomChecagem = (t: string) => (t === 'ok' ? 'sucesso' : t === 'duplicidade' || t === 'dados_bancarios' ? 'erro' : 'destaque') as 'sucesso' | 'erro' | 'destaque'
const rotuloChecagem: Record<string, string> = { ok: 'checado', duplicidade: 'possível duplicidade', fornecedor_novo: 'fornecedor novo', dados_bancarios: 'dados bancários diferentes', valor_fora_padrao: 'valor fora do padrão' }

export function CaixaDocumentos({ empresas, mostrarEmpresa, onEscolher }: { empresas: EmpresaVista[]; mostrarEmpresa: boolean; onEscolher: (id: string | null, aba?: string) => void }) {
  const docs = useDocumentosBpo(empresas.map((e) => e.clienteId))
  const pedir = usePedirOperacao()
  const trabalhando = useTrabalhandoEm()
  const [verTratados, setVerTratados] = useState(false)
  const [todosAbertos, setTodosAbertos] = useState(false)
  const [revisar, setRevisar] = useState<string | null>(null)
  const [novo, setNovo] = useState(false)
  const abertos = docs.filter(docAberto)
  const tratados = docs.filter((d) => !docAberto(d))
  const recebidos = abertos.filter((d) => d.situacao === 'recebido' && !trabalhando(d.id))
  const empresaDe = (d: BpoDocumento) => empresas.find((e) => e.clienteId === d.cliente_id)
  const ler = (ds: BpoDocumento[]) => {
    for (const d of ds)
      pedir({
        integrante: 'i-bpo',
        titulo: `Ler ${d.nome_arquivo}`,
        cliente: empresaDe(d)?.nome,
        inicio: `Vou ler ${d.nome_arquivo} (${rotuloCanal[d.canal]}, de ${d.remetente}) e checar contra o cadastro da empresa.`,
        etapas: ['Lendo valor, vencimento, fornecedor e código de barras', 'Checando duplicidade e fornecedor', 'Conferindo os dados bancários com o cadastro'],
        fim: { texto: `Li ${d.nome_arquivo}. Se a leitura for segura e nada chamar atenção, lanço a conta (quem confere é uma pessoa); senão, fica para você revisar.`, aviso: `Contas a Pagar leu ${d.nome_arquivo}` },
        efeito: { tipo: 'ler_documento', docId: d.id },
      })
  }
  const verTodos = abertos.length + (verTratados ? tratados.length : 0)
  const docRevisar = docs.find((d) => d.id === revisar)
  return (
    <Caixa>
      <TituloBloco
        descricao="Boletos, notas e comprovantes que chegaram pelo WhatsApp, e-mail, app e DDA. O integrante lê e checa; uma pessoa lança, anexa ao pedido ou descarta."
        acao={
          <span className="flex flex-wrap gap-1">
            {recebidos.length > 0 && (
              <SePode ferramenta="conta_pagar.ler_documento">
                <Button size="sm" variant="ghost" className="rounded-full" onClick={() => ler(recebidos)}>
                  <MagnifyingGlassIcon /> Pedir ao Contas a Pagar: ler {recebidos.length > 1 ? `os ${recebidos.length}` : ''}
                </Button>
              </SePode>
            )}
            <SePode ferramenta="documento_bpo.receber">
              <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setNovo(true)}>
                <PaperclipIcon /> Documento
              </Button>
            </SePode>
          </span>
        }
      >
        Documentos chegando {abertos.length > 0 && <span className="text-muted-foreground font-normal">· {abertos.length} para tratar</span>}
      </TituloBloco>
      {verTodos === 0 ? (
        <p role="status" className="text-muted-foreground flex items-center gap-2 text-sm">
          <PaperclipIcon className="shrink-0" /> Nenhum documento esperando: o que chegar pelo app, WhatsApp, e-mail ou DDA aparece aqui antes de virar conta.
        </p>
      ) : (
        <ul className="divide-border/70 flex flex-col divide-y" aria-label="Documentos chegando">
          {[...(todosAbertos ? abertos : abertos.slice(0, 4)), ...(verTratados ? tratados : [])].map((d) => (
            <LinhaDocumento key={d.id} d={d} e={empresaDe(d)} mostrarEmpresa={mostrarEmpresa} lendo={trabalhando(d.id)} onLer={() => ler([d])} onRevisar={() => setRevisar(d.id)} onEscolher={onEscolher} />
          ))}
        </ul>
      )}
      {!todosAbertos && abertos.length > 4 && (
        <button type="button" className="text-muted-foreground flex w-fit cursor-pointer items-center gap-1.5 text-xs" onClick={() => setTodosAbertos(true)}>
          <CaretDownIcon /> Ver mais {abertos.length - 4} para tratar
        </button>
      )}
      {tratados.length > 0 && (
        <button type="button" className="text-muted-foreground flex w-fit cursor-pointer items-center gap-1.5 text-xs" onClick={() => setVerTratados((v) => !v)}>
          <CaretDownIcon className={cn('transition-transform', verTratados && 'rotate-180')} /> {verTratados ? 'Esconder' : 'Ver'} {tratados.length} já tratado{tratados.length > 1 ? 's' : ''} (lançados, anexados, descartados)
        </button>
      )}
      {docRevisar && empresaDe(docRevisar) && <GavetaRevisarDocumento d={docRevisar} e={empresaDe(docRevisar)!} onFechar={() => setRevisar(null)} />}
      <GavetaNovoDocumento aberto={novo} onFechar={() => setNovo(false)} empresas={empresas} onRecebido={(d) => ler([d])} />
    </Caixa>
  )
}

function LinhaDocumento({ d, e, mostrarEmpresa, lendo, onLer, onRevisar, onEscolher }: { d: BpoDocumento; e?: EmpresaVista; mostrarEmpresa: boolean; lendo: boolean; onLer: () => void; onRevisar: () => void; onEscolher: (id: string | null, aba?: string) => void }) {
  const executar = useAcao()
  const confirmar = useConfirmar()
  const l = d.leitura
  const pedidos = (e?.fila ?? []).filter((f) => f.tipo === 'pedido' && f.id !== d.fila_id)
  const comprovanteDe = d.tipo_documento === 'comprovante' && l ? (e?.contas ?? []).find((c) => c.contraparte === l.fornecedor && Math.abs(c.valor - l.valor) < 0.01) : undefined
  const descartar = async () => {
    const motivo = await confirmar({ titulo: `Descartar ${d.nome_arquivo}?`, descricao: 'O documento não vira conta. Fica guardado com o motivo (nada se apaga).', acao: 'Descartar', exigirMotivo: true, rotuloMotivo: 'Por quê? (ex.: duplicado da conta já lançada pelo pedido)', perigo: true })
    if (typeof motivo === 'string') executar(() => documentosBpo.descartar(d.id, motivo), { sucesso: `${d.nome_arquivo} descartado` })
  }
  const menu: AcaoMenu[] = [
    ...pedidos.map((f, i) => ({ rotulo: `Anexar ao pedido: ${f.texto.replace(/[“”]/g, '')}`, icone: <LinkIcon />, separar: i === 0 && false, onSelecionar: () => executar(() => documentosBpo.anexar(d.id, f.id), { sucesso: f.faltando.length ? 'Anexado: o que faltava no pedido chegou' : 'Anexado ao pedido' }) })),
    ...(docAberto(d) ? [{ rotulo: 'Descartar, com motivo', icone: <TrashIcon />, separar: pedidos.length > 0, perigo: true, onSelecionar: () => void descartar() }] : []),
  ]
  return (
    <li className="flex flex-wrap items-start gap-3 py-3 text-sm" data-documento={d.id}>
      <span className="bg-sunken text-muted-foreground mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full [&_svg]:size-4">{iconeCanal(d.canal)}</span>
      <span className="min-w-0 flex-1 basis-56">
        <span className="block truncate">{d.nome_arquivo}</span>
        <span className="text-muted-foreground block truncate text-xs">
          {mostrarEmpresa && e && `${e.nome} · `}
          {d.remetente} · {rotuloCanal[d.canal]} · {dataHora(d.recebido_em)}
          {typeof d.extras?.mensagem === 'string' && ` · “${d.extras.mensagem}”`}
        </span>
        {l && (
          <span className="mt-1 block text-xs">
            {l.fornecedor} · <span className="tabular-nums">{brl(l.valor, true)}</span> · vence {dataCurta(l.vencimento)} · {l.categoria}
            {l.confianca === 'baixa' && <span className="text-warning-text"> · leitura incerta</span>}
            {d.lido_por && <span className="text-muted-foreground"> · lido por {d.lido_por}</span>}
          </span>
        )}
        {d.checagens.length > 0 && docAberto(d) && (
          <span className="mt-1 flex flex-wrap gap-1">
            {d.checagens.map((c) => (
              <Badge key={c.tipo} variant={tomChecagem(c.tipo)} title={c.texto}>
                {c.tipo !== 'ok' && <WarningIcon weight="fill" />} {rotuloChecagem[c.tipo]}
              </Badge>
            ))}
          </span>
        )}
        {d.situacao === 'descartado' && d.motivo && <span className="text-muted-foreground block text-xs">Descartado: {d.motivo}</span>}
        {d.situacao === 'lancado' && <span className="text-muted-foreground block text-xs">Conta lançada por {d.lancado_por}: outra pessoa confere em Aprovações.</span>}
      </span>
      <Badge variant={d.situacao === 'lido' ? 'destaque' : d.situacao === 'lancado' || d.situacao === 'anexado' ? 'sucesso' : 'outline'}>{rotuloSituacaoDoc[d.situacao]}</Badge>
      <span className="flex flex-wrap items-center gap-1">
        {lendo ? (
          <span className="text-muted-foreground flex items-center gap-1.5 text-xs" role="status">
            <CircleNotchIcon className="size-3.5 animate-spin" /> o integrante está lendo…
          </span>
        ) : d.situacao === 'recebido' ? (
          <SePode ferramenta="conta_pagar.ler_documento">
            <Button size="sm" variant="outline" className="rounded-full" onClick={onLer}>
              <MagnifyingGlassIcon /> Ler
            </Button>
          </SePode>
        ) : d.situacao === 'lido' && comprovanteDe ? (
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => executar(() => documentosBpo.vincularComprovante(d.id, comprovanteDe.id), { sucesso: `Comprovante guardado com ${comprovanteDe.contraparte}` })}>
            <LinkIcon /> Guardar com a conta {comprovanteDe.contraparte}
          </Button>
        ) : d.situacao === 'lido' ? (
          <SePode ferramenta="conta_pagar.capturar">
            <Button size="sm" variant="outline" className="rounded-full" onClick={onRevisar}>
              Revisar e lançar
            </Button>
          </SePode>
        ) : (d.situacao === 'lancado' || (d.situacao === 'anexado' && d.conta_id)) && e ? (
          <Button size="sm" variant="ghost" className="rounded-full" onClick={() => onEscolher(e.clienteId, 'aprovacoes')}>
            Aprovações <ArrowRightIcon />
          </Button>
        ) : null}
        {menu.length > 0 && <BotaoAcoes rotulo={`Ações de ${d.nome_arquivo}`} acoes={menu} />}
      </span>
    </li>
  )
}

/** Revisar a leitura e lançar a conta: quem lança é quem digitou (outra pessoa confere). */
function GavetaRevisarDocumento({ d, e, onFechar }: { d: BpoDocumento; e: EmpresaVista; onFechar: () => void }) {
  const executar = useAcao()
  const l = d.leitura!
  const [r, setR] = useState({ fornecedor: l.fornecedor, valor: String(l.valor), vencimento: l.vencimento, categoria: l.categoria, duplicidade: '' })
  const checagens = documentosBpo.checar(d.cliente_id, { ...l, fornecedor: r.fornecedor, valor: Number(r.valor) || 0, vencimento: r.vencimento, categoria: r.categoria }, d.id)
  const dup = checagens.some((c) => c.tipo === 'duplicidade')
  const erro = !r.fornecedor.trim() ? 'Informe o fornecedor.' : !(Number(r.valor) > 0) ? 'O valor precisa ser maior que zero.' : !r.vencimento ? 'Informe o vencimento.' : dup && !r.duplicidade.trim() ? 'Diga por que não é duplicada, ou descarte o documento.' : undefined
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo={`Revisar ${d.nome_arquivo}`}
      descricao={`${e.nome} · leitura de ${d.lido_por ?? 'o integrante'}. Você lança; outra pessoa confere em Aprovações (quem digita não confere).`}
      acao="Lançar a conta"
      acaoDesabilitada={!!erro}
      onAcao={() => {
        const conta = executar(() => documentosBpo.lancar(d.id, { ajuste: { fornecedor: r.fornecedor.trim(), valor: Number(r.valor), vencimento: r.vencimento, categoria: r.categoria }, confirmarDuplicidade: r.duplicidade }), {
          sucesso: e.erp.modo === 'E2' ? `Conta lançada; fica em “lançar no ${e.erp.provedor}” e outra pessoa confere` : `Conta lançada no ${e.erp.modo === 'E1' ? e.erp.provedor : 'livro próprio'}; outra pessoa confere em Aprovações`,
        })
        if (conta) onFechar()
      }}
    >
      <div className="flex items-center gap-2">
        <SeloDemonstracao fonte="leitura do documento por IA" />
        <span className="text-muted-foreground text-xs">confiança {l.confianca === 'alta' ? 'alta' : 'baixa: confira cada campo'}</span>
      </div>
      <Campo rotulo="Fornecedor">{(id) => <CampoTexto id={id} valor={r.fornecedor} onMudar={(v) => setR((x) => ({ ...x, fornecedor: v }))} />}</Campo>
      <div className="grid grid-cols-2 gap-2">
        <Campo rotulo="Valor (R$)">{(id) => <CampoTexto id={id} tipo="number" valor={r.valor} onMudar={(v) => setR((x) => ({ ...x, valor: v }))} />}</Campo>
        <Campo rotulo="Vencimento">{(id) => <CampoTexto id={id} tipo="date" valor={r.vencimento} onMudar={(v) => setR((x) => ({ ...x, vencimento: v }))} />}</Campo>
      </div>
      <Campo rotulo="Categoria">{(id) => <CampoTexto id={id} valor={r.categoria} onMudar={(v) => setR((x) => ({ ...x, categoria: v }))} />}</Campo>
      {l.codigo_barras && <p className="text-muted-foreground font-mono text-xs break-all">{l.codigo_barras}</p>}
      {l.banco && <p className="text-muted-foreground text-xs">Dados bancários no documento: {l.banco}</p>}
      <ul className="flex flex-col gap-1.5">
        {checagens.map((c) => (
          <li key={c.tipo} className={cn('rounded-md px-3 py-2 text-xs', c.tipo === 'ok' ? 'bg-success/10' : c.tipo === 'duplicidade' || c.tipo === 'dados_bancarios' ? 'bg-destructive/10' : 'bg-warning/10')}>
            {c.texto}
          </li>
        ))}
      </ul>
      {dup && <Campo rotulo="Por que não é duplicada?" erro={r.duplicidade.trim() ? undefined : 'Obrigatório para lançar'}>{(id) => <CampoTexto id={id} valor={r.duplicidade} onMudar={(v) => setR((x) => ({ ...x, duplicidade: v }))} placeholder="Ex.: é a segunda parcela, confirmada com o cliente" />}</Campo>}
      {erro && !dup && <p className="text-destructive-text text-xs">{erro}</p>}
    </GavetaFormulario>
  )
}

/** Simula um documento chegando (o cliente manda pelo app ou WhatsApp; o DDA entra sozinho). */
function GavetaNovoDocumento({ aberto, onFechar, empresas, onRecebido }: { aberto: boolean; onFechar: () => void; empresas: EmpresaVista[]; onRecebido: (d: BpoDocumento) => void }) {
  const executar = useAcao()
  const vazio = { empresa: empresas[0]?.clienteId ?? '', arquivo: '', canal: 'whatsapp' as BpoDocumento['canal'], tipo: 'boleto' as BpoDocumento['tipo_documento'], fornecedor: '', valor: '', vencimento: '', ler: true }
  const [r, setR] = useState(vazio)
  const [tentou, setTentou] = useState(false)
  const e = empresas.find((x) => x.clienteId === r.empresa) ?? empresas[0]
  const erro = !r.arquivo.trim() ? 'Dê um nome ao arquivo.' : undefined
  return (
    <GavetaFormulario
      aberta={aberto}
      onFechar={onFechar}
      titulo="Documento chegando"
      descricao="Simula o que o cliente manda pelo app, WhatsApp ou e-mail (ou o DDA do banco). O integrante lê o que estiver no documento."
      acao="Receber"
      onAcao={() => {
        setTentou(true)
        if (erro || !e) return
        const conteudo: ConteudoDocumento | undefined = r.fornecedor.trim() ? { fornecedor: r.fornecedor.trim(), valor: Number(r.valor) || 0, vencimento: r.vencimento, categoria: 'Despesas gerais', confianca: Number(r.valor) > 0 && r.vencimento ? 'alta' : 'baixa' } : undefined
        const d = executar(() => documentosBpo.receber({ cliente_id: e.clienteId, nome_arquivo: r.arquivo.trim(), tipo_documento: r.tipo, canal: r.canal, remetente: r.canal === 'dda' ? 'DDA do banco' : (e.ficha?.contatos?.[0]?.nome ?? 'cliente'), extras: { conteudo } }), { sucesso: `Chegou ${r.arquivo.trim()}` })
        if (!d) return
        if (r.ler) onRecebido(d)
        setR(vazio)
        setTentou(false)
        onFechar()
      }}
    >
      {empresas.length > 1 && <Campo rotulo="Empresa">{(id) => <CampoEscolha id={id} valor={r.empresa} onMudar={(v) => setR((x) => ({ ...x, empresa: v }))} opcoes={empresas.map((x) => ({ valor: x.clienteId, rotulo: x.nome }))} />}</Campo>}
      <Campo rotulo="Arquivo" erro={tentou ? erro : undefined}>{(id) => <CampoTexto id={id} valor={r.arquivo} onMudar={(v) => setR((x) => ({ ...x, arquivo: v }))} placeholder="boleto-fornecedor.pdf" />}</Campo>
      <div className="grid grid-cols-2 gap-2">
        <Campo rotulo="Chegou por">
          {(id) => (
            <CampoEscolha
              id={id}
              valor={r.canal}
              onMudar={(v) => setR((x) => ({ ...x, canal: v }))}
              opcoes={[
                { valor: 'whatsapp', rotulo: 'WhatsApp' },
                { valor: 'app', rotulo: 'App do cliente' },
                { valor: 'email', rotulo: 'E-mail' },
                { valor: 'dda', rotulo: 'DDA do banco' },
              ]}
            />
          )}
        </Campo>
        <Campo rotulo="Tipo">
          {(id) => (
            <CampoEscolha
              id={id}
              valor={r.tipo}
              onMudar={(v) => setR((x) => ({ ...x, tipo: v }))}
              opcoes={[
                { valor: 'boleto', rotulo: 'Boleto' },
                { valor: 'nota', rotulo: 'Nota fiscal' },
                { valor: 'comprovante', rotulo: 'Comprovante' },
                { valor: 'outro', rotulo: 'Outro' },
              ]}
            />
          )}
        </Campo>
      </div>
      <p className="text-muted-foreground text-xs">O que está no documento (o integrante vai ler isto; deixe em branco para uma leitura incerta):</p>
      <Campo rotulo="Fornecedor no documento">{(id) => <CampoTexto id={id} valor={r.fornecedor} onMudar={(v) => setR((x) => ({ ...x, fornecedor: v }))} />}</Campo>
      <div className="grid grid-cols-2 gap-2">
        <Campo rotulo="Valor no documento (R$)">{(id) => <CampoTexto id={id} tipo="number" valor={r.valor} onMudar={(v) => setR((x) => ({ ...x, valor: v }))} />}</Campo>
        <Campo rotulo="Vencimento no documento">{(id) => <CampoTexto id={id} tipo="date" valor={r.vencimento} onMudar={(v) => setR((x) => ({ ...x, vencimento: v }))} />}</Campo>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="accent-foreground size-4" checked={r.ler} onChange={(ev) => setR((x) => ({ ...x, ler: ev.target.checked }))} /> Pedir ao Contas a Pagar para ler assim que chegar
      </label>
      {e && <p className="text-muted-foreground text-xs">{e.nome} · {e.erp.provedor} ({e.erp.modo === 'E1' ? 'a conta é criada no ERP por comando' : e.erp.modo === 'E2' ? 'modo arquivo: a conta fica em “lançar no ERP”' : 'livro próprio'})</p>}
    </GavetaFormulario>
  )
}
