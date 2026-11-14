import { ArrowsLeftRightIcon, CheckCircleIcon, PrinterIcon, SealCheckIcon, WarningIcon, XIcon } from '@phosphor-icons/react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { useState } from 'react'
import { integranteDoSetor } from '@/ambiente/fluxos'
import { useLoja } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { PaginaDocumento } from '@/components/compostos/visualizador-documento'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Campo, CampoEscolha, CampoTexto, GavetaFormulario, Segmentado } from '@/components/ui/formulario'
import { pastaDoCliente, rotuloTipoDoc, type Documento, type VersaoDocumento } from '@/dados/arquivos'
import { registrar } from '@/nucleo/repositorios'
import { useTema } from '@/theme/ThemeProvider'
import type { SetorIntegrante } from '@/theme/tipos'

/**
 * Ações sobre um documento (S09-T01 e T02; 01, 7.4, 7.7 e 7.8; D-16; D-34),
 * usadas pelo módulo Arquivos e pelo visualizador: mover e renomear (mudança
 * de cliente vai para conferência), versões lado a lado, confirmar origem,
 * resolver conflito, comprovante de entrega e envio ao cliente com a
 * conferência do CNPJ.
 */

export type AcaoDocumento = 'mover' | 'versoes' | 'origem' | 'conflito' | 'comprovante' | 'enviar'

const agoraCurto = () => new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

/** Setor que cuida do documento pelo tipo (para o integrante que avisa e o cartão de envio). */
export function setorDoDocumento(d: Documento): SetorIntegrante {
  if (d.tipo === 'holerite' || d.tipo === 'folha') return 'dp'
  if (d.tipo === 'balancete' || d.tipo === 'extrato') return 'contabil'
  if (d.tipo === 'contrato' || d.tipo === 'procuracao' || d.tipo === 'certidao' || d.tipo === 'cadastro') return 'societario'
  if (d.tipo === 'xml' || d.tipo === 'nfse') return 'notas'
  return 'fiscal'
}

export function GavetaMover({ d, onFechar }: { d: Documento; onFechar: () => void }) {
  const loja = useLoja()
  const { usuario } = useSessao()
  const [nome, setNome] = useState(d.nome)
  const [cliente, setCliente] = useState(d.clienteId ?? '_escritorio')
  const [pasta, setPasta] = useState(d.pasta.join('/'))
  const mudaCliente = (cliente === '_escritorio' ? undefined : cliente) !== d.clienteId
  const ok = nome.trim().length > 2 && pasta.trim()
  return (
    <GavetaFormulario
      aberta
      largura="lg"
      onFechar={onFechar}
      titulo={`Mover ou renomear · ${d.nome}`}
      descricao="O registro de entrega segue o arquivo pela impressão digital. Mudar de cliente muda quem pode ver: vai para a conferência de um Gestor antes de valer."
      acao={mudaCliente ? 'Enviar para conferência' : 'Salvar'}
      acaoDesabilitada={!ok}
      onAcao={() => {
        const novaPasta = pasta.split('/').map((x) => x.trim()).filter(Boolean)
        if (mudaCliente) {
          loja.ajustarDocumento(d.id, { nome: nome.trim(), s09: { ...d.s09, conferencia: { clienteDestino: cliente, pastaDestino: novaPasta, por: usuario.nome, quando: agoraCurto() } } })
          registrar(`${usuario.nome} pediu para mover ${d.nome} para ${pastaDoCliente(cliente === '_escritorio' ? undefined : cliente)} (aguarda conferência)`, 'documento.mover')
          loja.toast('Mudança de cliente enviada para conferência. Até um Gestor confirmar, o arquivo fica onde está.')
        } else {
          loja.ajustarDocumento(d.id, { nome: nome.trim(), pasta: novaPasta })
          registrar(`${usuario.nome} moveu ${d.nome} para ${[pastaDoCliente(d.clienteId), ...novaPasta].join('/')}${nome.trim() !== d.nome ? ` e renomeou para ${nome.trim()}` : ''}`, 'documento.mover')
          loja.toastDesfazer(`${nome.trim()} salvo em ${novaPasta.join('/')}.`, () => loja.ajustarDocumento(d.id, { nome: d.nome, pasta: d.pasta }))
        }
        onFechar()
      }}
    >
      <Campo rotulo="Nome">{(id) => <CampoTexto id={id} valor={nome} onMudar={setNome} />}</Campo>
      <Campo rotulo="Cliente" ajuda={mudaCliente ? 'Mudança de cliente: vai para a conferência.' : undefined}>
        {(id) => <CampoEscolha id={id} valor={cliente} onMudar={setCliente} opcoes={[{ valor: '_escritorio', rotulo: '_escritorio (do escritório)' }, ...loja.clientes.map((c) => ({ valor: c.id, rotulo: `${c.codigo} · ${c.nome}` }))]} />}
      </Campo>
      <Campo rotulo="Pasta" ajuda="Caminho a partir da pasta do cliente, separado por /.">
        {(id) => <CampoTexto id={id} valor={pasta} onMudar={setPasta} mono />}
      </Campo>
    </GavetaFormulario>
  )
}

/** Versões lado a lado (7.4): alterado na nuvem cria versão; comparar duas. */
export function DialogoVersoes({ d, onFechar }: { d: Documento; onFechar: () => void }) {
  const atual: VersaoDocumento = { versao: d.versao, quando: d.quando, por: d.por, origem: 'versão atual', hash: d.hash }
  const versoes = [...(d.s09?.versoes ?? []), atual].sort((a, b) => b.versao - a.versao)
  const [esq, setEsq] = useState(String(versoes[1]?.versao ?? versoes[0].versao))
  const [dir, setDir] = useState(String(versoes[0].versao))
  const ve = versoes.find((v) => String(v.versao) === esq)!
  const vd = versoes.find((v) => String(v.versao) === dir)!
  return (
    <DialogPrimitive.Root open onOpenChange={(v) => !v && onFechar()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[65] bg-black/45" />
        <DialogPrimitive.Content aria-describedby={undefined} className="bg-background text-foreground fixed inset-2 z-[65] flex flex-col overflow-hidden rounded-[24px] shadow-2xl outline-none sm:inset-6">
          <header className="flex shrink-0 flex-wrap items-center gap-2 border-b px-4 py-2.5">
            <DialogPrimitive.Title className="min-w-0 flex-1 truncate text-sm font-medium sm:text-base">Versões · {d.nome}</DialogPrimitive.Title>
            <DialogPrimitive.Close asChild>
              <Button size="icon-sm" variant="ghost" className="rounded-full" aria-label="Fechar">
                <XIcon />
              </Button>
            </DialogPrimitive.Close>
          </header>
          {versoes.length < 2 ? (
            <p className="text-muted-foreground p-6 text-sm">Este arquivo tem uma versão só. Quando alguém alterar na nuvem, a anterior fica guardada aqui.</p>
          ) : (
            <div className="area-rolagem-dupla grid min-h-0 flex-1 gap-4 overflow-y-auto p-4 md:grid-cols-2">
              {[
                [ve, esq, setEsq],
                [vd, dir, setDir],
              ].map(([v, valor, set], i) => {
                const vv = v as VersaoDocumento
                return (
                  <div key={i} className="flex min-w-0 flex-col gap-2">
                    <CampoEscolha rotulo={i === 0 ? 'Versão da esquerda' : 'Versão da direita'} valor={valor as string} onMudar={set as (x: string) => void} opcoes={versoes.map((x) => ({ valor: String(x.versao), rotulo: `v${x.versao} · ${x.quando} · ${x.por}` }))} />
                    <p className="text-muted-foreground text-xs">
                      {vv.origem}
                      {vv.mudanca ? ` · ${vv.mudanca}` : ''} · SHA-256 {vv.hash}
                    </p>
                    <PaginaDocumento d={{ ...d, versao: vv.versao, hash: vv.hash }} />
                  </div>
                )
              })}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

/** Confirmar origem (7.4): arquivo que caiu direto na nuvem ganha `enviado_por` e, se for o caso, uma tarefa. */
export function GavetaConfirmarOrigem({ d, onFechar }: { d: Documento; onFechar: () => void }) {
  const loja = useLoja()
  const { usuario } = useSessao()
  const ficha = loja.fichaDe(d.clienteId)
  const contatos = ficha?.contatos.map((c) => c.nome) ?? []
  const [quem, setQuem] = useState<'cliente' | 'equipe' | 'outro'>('cliente')
  const [pessoa, setPessoa] = useState(contatos[0] ?? '')
  const [outro, setOutro] = useState('')
  const [tarefa, setTarefa] = useState<'nao' | 'sim'>('sim')
  const enviadoPor = quem === 'cliente' ? `${pessoa} (cliente)` : quem === 'equipe' ? usuario.nome : outro.trim()
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo={`De onde veio · ${d.nome}`}
      descricao="O arquivo foi posto direto na nuvem, sem dizer quem mandou. Confirmar a origem completa o índice e, se precisar, abre a tarefa do setor."
      acao="Confirmar origem"
      acaoDesabilitada={!enviadoPor}
      onAcao={() => {
        const setor = setorDoDocumento(d)
        let tarefaId: string | undefined
        const cli = loja.clientes.find((c) => c.id === d.clienteId)
        if (tarefa === 'sim' && cli) tarefaId = loja.criarTarefa({ codigo: 'GES-031', titulo: `Tratar ${d.nome}`, cliente: cli.nome, setor, status: 'a_fazer', prazo: new Date(Date.now() + 2 * 86_400_000).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) })
        loja.ajustarDocumento(d.id, { por: enviadoPor, s09: { ...d.s09, semOrigem: false, origemConfirmada: { por: usuario.nome, quando: agoraCurto(), enviadoPor, tarefa: tarefaId } } })
        registrar(`${usuario.nome} confirmou a origem de ${d.nome}: ${enviadoPor}`, 'documento.confirmar_origem')
        loja.toast(`Origem confirmada: ${enviadoPor}.${tarefaId ? ' Tarefa aberta no setor.' : ''}`, tarefaId ? { modulo: 'painel', aba: setor === 'consultor' ? 'consultoria' : setor === 'gestao_atendimento' ? 'gestao' : setor, tarefa: tarefaId } : undefined, tarefaId ? 'Ver a tarefa' : undefined)
        onFechar()
      }}
    >
      <Segmentado
        rotulo="Quem mandou"
        valor={quem}
        onMudar={setQuem}
        opcoes={[
          { valor: 'cliente', rotulo: 'O cliente' },
          { valor: 'equipe', rotulo: 'Eu (equipe)' },
          { valor: 'outro', rotulo: 'Outro' },
        ]}
      />
      {quem === 'cliente' && (contatos.length ? <Campo rotulo="Pessoa do cliente">{(id) => <CampoEscolha id={id} valor={pessoa} onMudar={setPessoa} opcoes={contatos.map((c) => ({ valor: c, rotulo: c }))} />}</Campo> : <Campo rotulo="Nome de quem mandou">{(id) => <CampoTexto id={id} valor={pessoa} onMudar={setPessoa} />}</Campo>)}
      {quem === 'outro' && <Campo rotulo="Quem (contador anterior, banco, órgão)">{(id) => <CampoTexto id={id} valor={outro} onMudar={setOutro} />}</Campo>}
      <Campo rotulo="Abrir tarefa para o setor?">
        {() => (
          <Segmentado
            rotulo="Abrir tarefa"
            valor={tarefa}
            onMudar={setTarefa}
            opcoes={[
              { valor: 'sim', rotulo: 'Sim' },
              { valor: 'nao', rotulo: 'Não precisa' },
            ]}
          />
        )}
      </Campo>
    </GavetaFormulario>
  )
}

/** Conflito (7.4): a cópia com sufixo e o original; escolher qual fica (a outra vira versão). */
export function GavetaConflito({ d, onFechar }: { d: Documento; onFechar: () => void }) {
  const loja = useLoja()
  const { usuario } = useSessao()
  const original = loja.documentos.find((x) => x.clienteId === d.clienteId && x.nome === d.s09?.conflito?.original)
  const [fica, setFica] = useState<'original' | 'copia'>('copia')
  return (
    <GavetaFormulario
      aberta
      largura="lg"
      onFechar={onFechar}
      titulo="Resolver conflito"
      descricao="Duas pessoas mexeram no mesmo arquivo ao mesmo tempo e a nuvem criou uma cópia com sufixo. Escolha qual fica; a outra vira versão anterior (nada se perde)."
      acao="Resolver"
      onAcao={() => {
        const quando = agoraCurto()
        if (original) {
          const vencedora = fica === 'copia' ? d : original
          const perdedora = fica === 'copia' ? original : d
          loja.ajustarDocumento(original.id, { versao: original.versao + 1, hash: vencedora.hash, por: vencedora.por, quando, s09: { ...original.s09, versoes: [...(original.s09?.versoes ?? []), { versao: original.versao, quando: perdedora.quando, por: perdedora.por, origem: fica === 'copia' ? 'original antes do conflito' : 'cópia de conflito', hash: perdedora.hash }] } })
        }
        loja.ajustarDocumento(d.id, { s09: { ...d.s09, conflito: { ...d.s09!.conflito!, resolvido: `${fica === 'copia' ? 'ficou a cópia' : 'ficou o original'} · ${usuario.nome} · ${quando}` } } })
        registrar(`${usuario.nome} resolveu o conflito de ${d.s09?.conflito?.original}: ${fica === 'copia' ? 'ficou a cópia' : 'ficou o original'}`, 'documento.resolver_conflito')
        loja.toast(`Conflito resolvido. ${original?.nome ?? 'O arquivo'} ganhou uma versão nova; a outra ficou no histórico.`)
        onFechar()
      }}
    >
      <Segmentado
        rotulo="Qual fica"
        valor={fica}
        onMudar={setFica}
        opcoes={[
          { valor: 'copia', rotulo: 'A cópia (mais recente)' },
          { valor: 'original', rotulo: 'O original' },
        ]}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {original && <PaginaDocumento d={original} />}
        <PaginaDocumento d={d} />
      </div>
    </GavetaFormulario>
  )
}

/** Comprovante de entrega em PDF com o tema (7.7). */
export function DialogoComprovante({ d, onFechar }: { d: Documento; onFechar: () => void }) {
  const loja = useLoja()
  const { usuario } = useSessao()
  const { tema } = useTema()
  const cliente = loja.clientes.find((c) => c.id === d.clienteId)
  return (
    <DialogPrimitive.Root open onOpenChange={(v) => !v && onFechar()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[65] bg-black/45" />
        <DialogPrimitive.Content aria-describedby={undefined} className="bg-background text-foreground fixed inset-2 z-[65] flex flex-col overflow-hidden rounded-[24px] shadow-2xl outline-none sm:inset-x-[12vw] sm:inset-y-6">
          <header className="flex shrink-0 items-center gap-2 border-b px-4 py-2.5">
            <DialogPrimitive.Title className="min-w-0 flex-1 truncate text-sm font-medium">Comprovante de entrega</DialogPrimitive.Title>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              onClick={() => {
                registrar(`${usuario.nome} gerou o comprovante de entrega de ${d.nome}`, 'documento.comprovante')
                loja.toast(`Comprovante de ${d.nome} baixado em PDF.`)
              }}
            >
              <PrinterIcon /> Baixar PDF
            </Button>
            <DialogPrimitive.Close asChild>
              <Button size="icon-sm" variant="ghost" className="rounded-full" aria-label="Fechar">
                <XIcon />
              </Button>
            </DialogPrimitive.Close>
          </header>
          <div className="bg-sunken/60 area-rolagem-dupla min-h-0 flex-1 overflow-y-auto p-4 sm:p-8">
            {/* A folha é sempre clara, como papel, com o cabeçalho do tema do escritório. */}
            <div className="mx-auto flex w-full max-w-[560px] flex-col gap-3 bg-white p-[7%] text-black shadow-[0_1px_2px_rgba(0,0,0,.12),0_12px_32px_-12px_rgba(0,0,0,.35)]">
              <header className="flex items-center gap-2 border-b border-black/10 pb-2">
                <span className="font-heading text-lg leading-none font-semibold tracking-tighter">{tema.sigla}</span>
                <span className="text-[11px] text-black/60">{tema.nome_produto}</span>
                <span className="ml-auto text-[10px] text-black/50">Comprovante de entrega</span>
              </header>
              <p className="text-[13px] font-semibold">{d.nome}</p>
              <table className="w-full text-[11px]">
                <tbody>
                  {[
                    ['Cliente', cliente ? `${cliente.nome} · ${cliente.documento}` : 'Documento do escritório'],
                    ['Tipo', rotuloTipoDoc[d.tipo]],
                    ['Competência', d.competencia ?? '—'],
                    ['Versão', `v${d.versao}`],
                    ['Impressão digital (SHA-256)', d.hash],
                  ].map(([a, b]) => (
                    <tr key={a} className="border-b border-black/10">
                      <td className="py-1.5 pr-2 text-black/55">{a}</td>
                      <td className="py-1.5 text-right font-medium break-all">{b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-[11px] font-semibold">Registro</p>
              {(d.entregas ?? []).length === 0 ? (
                <p className="text-[11px] text-black/55">Sem entrega registrada até agora.</p>
              ) : (
                <ol className="flex flex-col gap-1 text-[11px]">
                  {(d.entregas ?? []).map((e, i) => (
                    <li key={i} className="flex justify-between gap-2 border-b border-black/5 pb-1">
                      <span>
                        {e.quem} · {e.acao}
                      </span>
                      <span className="text-black/55">{e.quando}</span>
                    </li>
                  ))}
                </ol>
              )}
              <footer className="mt-4 border-t border-black/10 pt-1.5 font-mono text-[8.5px] text-black/45">Gerado em {new Date().toLocaleString('pt-BR')} por {usuario.nome}. O registro de entrega só cresce e segue a impressão digital do arquivo.</footer>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

/** Enviar ao cliente (03, 5; D-34): confere o CNPJ do documento com o do cliente e prepara o cartão. */
export function GavetaEnviarCliente({ d, onFechar, onEscrever }: { d: Documento; onFechar: () => void; onEscrever?: () => void }) {
  const loja = useLoja()
  const { usuario } = useSessao()
  const cliente = loja.clientes.find((c) => c.id === d.clienteId)
  const ficha = loja.fichaDe(d.clienteId)
  const contatos = ficha?.contatos ?? []
  const [para, setPara] = useState(contatos[0]?.nome ?? '')
  const cnpjDoc = d.dados?.cnpj ?? cliente?.documento ?? ''
  const confere = !!cliente && cnpjDoc.replace(/\D/g, '') === cliente.documento.replace(/\D/g, '')
  const setor = setorDoDocumento(d)
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo={`Enviar ao cliente · ${d.nome}`}
      descricao="Antes de sair, o sistema confere se o CNPJ do documento é o do cliente (D-34). O envio vira cartão de aprovação: nada sai sem o sim."
      acao="Preparar o cartão"
      acaoDesabilitada={!confere || !para}
      onAcao={() => {
        loja.mensagemTime(integranteDoSetor(setor), {
          autor: { tipo: 'integrante', setor },
          texto: `Preparei o envio de ${d.nome} para ${para} (${cliente?.nome}). Conferi o CNPJ do documento com o do cliente: bate.`,
          cartoes: [{ tipo: 'aprovacao', id: `s09-envio-${d.id}`, resumo: `Enviar ${d.nome} a ${para}`, argumentos: [{ rotulo: 'Cliente', valor: cliente?.nome ?? '' }, { rotulo: 'CNPJ conferido', valor: cnpjDoc }, { rotulo: 'Canal', valor: 'app e WhatsApp' }], expiraEm: 'expira em 1 dia' }],
        })
        registrar(`${usuario.nome} preparou o envio de ${d.nome} ao cliente (CNPJ conferido)`, 'documento.enviar_cliente')
        loja.toast('Cartão de envio no chat do integrante do setor.', { modulo: 'inicio', aba: 'time', integrante: integranteDoSetor(setor) }, 'Abrir o cartão')
        onFechar()
      }}
      secundaria={
        onEscrever && (
          <Button type="button" variant="ghost" className="rounded-full" onClick={onEscrever}>
            Escrever mensagem
          </Button>
        )
      }
    >
      {confere ? (
        <p className="bg-success/15 flex items-start gap-2 rounded-[14px] px-3 py-2.5 text-sm">
          <CheckCircleIcon weight="fill" className="text-success mt-0.5 size-4 shrink-0" /> CNPJ do documento ({cnpjDoc}) é o de {cliente?.nome}.
        </p>
      ) : (
        <p className="bg-destructive/10 text-destructive flex items-start gap-2 rounded-[14px] px-3 py-2.5 text-sm">
          <WarningIcon className="mt-0.5 size-4 shrink-0" /> {cliente ? `O CNPJ do documento (${cnpjDoc || 'sem CNPJ'}) não é o de ${cliente.nome} (${cliente.documento}). Envio bloqueado.` : 'Documento do escritório: não tem cliente para enviar.'}
        </p>
      )}
      {contatos.length > 0 ? (
        <Campo rotulo="Para">{(id) => <CampoEscolha id={id} valor={para} onMudar={setPara} opcoes={contatos.map((c) => ({ valor: c.nome, rotulo: `${c.nome}${c.papel ? ` · ${c.papel}` : ''}` }))} />}</Campo>
      ) : (
        <Campo rotulo="Para">{(id) => <CampoTexto id={id} valor={para} onMudar={setPara} />}</Campo>
      )}
    </GavetaFormulario>
  )
}

/** Conferência da assinatura dentro do PDF (D-16), para a fila do contador. */
export function conferirAssinatura(d: Documento): { resultado: 'valida' | 'ausente'; detalhe: string } {
  const assinado = !/cópia|conflito|rascunho/i.test(d.nome) && (d.origem === 'core' || d.origem === 'gerado_plataforma')
  return assinado
    ? { resultado: 'valida', detalhe: 'Assinado por João Pereira (CRC SP-123456/O-0) com certificado ICP-Brasil válido; o arquivo não mudou depois da assinatura.' }
    : { resultado: 'ausente', detalhe: 'Sem assinatura digital do contador dentro do PDF. Para ir ao cliente, mande para a fila de assinatura.' }
}

export function SeloAssinatura({ a }: { a: NonNullable<Documento['s09']>['assinatura'] }) {
  if (!a) return null
  return (
    <p className={a.resultado === 'valida' ? 'flex items-start gap-1.5 text-sm' : 'text-destructive flex items-start gap-1.5 text-sm'}>
      {a.resultado === 'valida' ? <SealCheckIcon weight="fill" className="text-success mt-0.5 size-4 shrink-0" /> : <WarningIcon className="mt-0.5 size-4 shrink-0" />}
      <span>
        {a.detalhe} <span className="text-muted-foreground text-xs">· conferido {a.quando}</span>
      </span>
    </p>
  )
}

export const IconeComparar = ArrowsLeftRightIcon
export { Badge as SeloDocumento }
