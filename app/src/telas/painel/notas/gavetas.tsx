import { useState } from 'react'
import { FileZipIcon, SparkleIcon } from '@phosphor-icons/react'
import { integranteDoSetor } from '@/ambiente/fluxos'
import { useLoja } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { EstadoErro, SeloDemonstracao, useFormulario } from '@/components/kit'
import { Button } from '@/components/ui/button'
import { Campo, CampoArea, CampoTexto, Fichas, GavetaFormulario, Segmentado } from '@/components/ui/formulario'
import { corrigirNomeWindows, estadoNotas, mudarNotas, reverterNotas, type CaminhoCaptura, type Divergencia, type ModeloDoc } from '@/dados/s02/notas'
import { servicos } from '@/servicos'
import type { CamposLidos } from '@/servicos'
import { nomeCliente } from './acoes'

const modelos: ModeloDoc[] = ['NF-e', 'NFC-e', 'NFS-e', 'CT-e', 'MDF-e']
const caminhos: CaminhoCaptura[] = ['DF-e (SEFAZ)', 'autXML', 'ADN (padrão nacional)', 'Prefeitura (robô)', 'E-mail de recepção']

/** S02-A56 · Cadastrar a configuração de captura (NFE-001): CNPJ, IE, IM, modelos, e-mail de recepção e o caminho de cada documento. */
export function GavetaConfigurarCaptura({ clienteId, onFechar }: { clienteId: string; onFechar: () => void }) {
  const loja = useLoja()
  const { usuario } = useSessao()
  const e = estadoNotas(clienteId)
  const f = useFormulario(
    { cnpjs: e.perfil.cnpjs.join(', '), ies: e.perfil.ies, ims: e.perfil.ims, modelos: e.perfil.modelos, email: e.perfil.email_recepcao, caminho: e.perfil.caminho as Record<string, string> },
    (v) => ({
      cnpjs: v.cnpjs.trim() ? null : 'Informe ao menos um CNPJ (ou "matriz").',
      modelos: v.modelos.length ? null : 'Escolha ao menos um modelo de documento.',
      email: /^\S+@\S+\.\S+$/.test(v.email) ? null : 'E-mail de recepção inválido.',
      ies: v.ies.trim() ? null : 'Informe a inscrição estadual (ou "isenta").',
    }),
  )
  const v = f.valores
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      largura="lg"
      titulo={`Configuração de captura · ${nomeCliente(clienteId)}`}
      descricao="Por onde cada documento chega (perfil de captura). O integrante Notas roda a captura todo dia às 3h por esses caminhos."
      acao="Salvar"
      onAcao={() => {
        if (!f.tentar()) return
        const antes = mudarNotas(
          clienteId,
          (x) => ({
            ...x,
            perfil: { ...x.perfil, cnpjs: v.cnpjs.split(',').map((s) => s.trim()).filter(Boolean), ies: v.ies, ims: v.ims, modelos: v.modelos, email_recepcao: v.email, caminho: v.caminho as Partial<Record<ModeloDoc, CaminhoCaptura>> },
            captura: x.captura.situacao === 'sem_configuracao' ? { situacao: 'atencao', ultima: 'aguardando a primeira rodada', nsu: 0, motivo: 'primeira captura às 3h' } : x.captura,
          }),
          `${usuario.nome} atualizou a configuração de captura de ${nomeCliente(clienteId)} (NFE-001)`,
        )
        loja.toastDesfazer('Configuração de captura salva. A próxima rodada já usa os caminhos novos.', () => reverterNotas(antes))
        onFechar()
      }}
    >
      <Campo rotulo="CNPJs monitorados" ajuda="Separe por vírgula (matriz e filiais)." erro={f.erro('cnpjs')}>
        {(id) => <CampoTexto id={id} valor={v.cnpjs} onMudar={(x) => f.definir('cnpjs', x)} />}
      </Campo>
      <div className="grid gap-3 sm:grid-cols-2">
        <Campo rotulo="Inscrições estaduais" erro={f.erro('ies')}>
          {(id) => <CampoTexto id={id} valor={v.ies} onMudar={(x) => f.definir('ies', x)} />}
        </Campo>
        <Campo rotulo="Inscrições municipais">{(id) => <CampoTexto id={id} valor={v.ims} onMudar={(x) => f.definir('ims', x)} />}</Campo>
      </div>
      <Campo rotulo="E-mail de recepção" ajuda="Fornecedor que não manda por autXML manda para cá." erro={f.erro('email')}>
        {(id) => <CampoTexto id={id} valor={v.email} onMudar={(x) => f.definir('email', x)} />}
      </Campo>
      <Campo rotulo="Modelos de documento" erro={f.erro('modelos')}>
        {() => <Fichas rotulo="Modelos" valores={v.modelos} onMudar={(x) => f.definir('modelos', x)} opcoes={modelos.map((m) => ({ valor: m, rotulo: m }))} />}
      </Campo>
      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">Caminho de cada documento</h3>
        {v.modelos.map((m) => (
          <div key={m} className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">{m}</span>
            <Segmentado rotulo={`Caminho de ${m}`} valor={(v.caminho[m] ?? 'DF-e (SEFAZ)') as CaminhoCaptura} onMudar={(x) => f.definir('caminho', { ...v.caminho, [m]: x })} opcoes={caminhos.filter((c) => (m === 'NFS-e' ? !/DF-e|autXML/.test(c) : !/ADN|Prefeitura/.test(c))).map((c) => ({ valor: c, rotulo: c }))} />
          </div>
        ))}
      </section>
      <p className="text-muted-foreground text-xs">Certificado: {e.perfil.certificado}. O arquivo e a senha ficam no cofre (Societário › Certificados); aqui nunca aparecem.</p>
    </GavetaFormulario>
  )
}

/** S02-A60 · Aceitar ou corrigir divergência tributária (NFE-023 a 027): aceitar ensina o integrante. */
export function GavetaDivergencia({ clienteId, item, onFechar }: { clienteId: string; item: Divergencia; onFechar: () => void }) {
  const loja = useLoja()
  const { usuario } = useSessao()
  const [modo, setModo] = useState<'aceitar' | 'corrigir'>('aceitar')
  const [correcao, setCorrecao] = useState('')
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo={`${item.tipo} · ${item.nota}`}
      descricao="O integrante Notas preparou a sugestão a partir da regra. Aceitar aplica e ensina; corrigir aplica a sua versão e ele aprende com ela."
      acao={modo === 'aceitar' ? 'Aceitar a sugestão' : 'Salvar a correção'}
      acaoDesabilitada={modo === 'corrigir' && correcao.trim().length < 5}
      onAcao={() => {
        const nome = nomeCliente(clienteId)
        const antes = mudarNotas(
          clienteId,
          (e) => ({ ...e, tributaria: e.tributaria.map((t) => (t.id === item.id ? { ...t, situacao: modo === 'aceitar' ? 'aceita' : 'corrigida', correcao: modo === 'corrigir' ? correcao : undefined } : t)) }),
          `${usuario.nome} ${modo === 'aceitar' ? 'aceitou' : 'corrigiu'} a divergência ${item.tipo} da ${item.nota} (${item.regra})`,
        )
        loja.mensagemTime(integranteDoSetor('notas'), {
          autor: { tipo: 'integrante', setor: 'notas' },
          texto:
            modo === 'aceitar'
              ? `Anotei: ${usuario.nome} aceitou “${item.sugestao}” na ${item.nota} de ${nome}. Nas próximas notas iguais deste fornecedor eu já aplico a mesma regra (${item.regra}) e deixo para conferência.`
              : `Anotei a correção de ${usuario.nome} na ${item.nota} de ${nome}: “${correcao}”. Troquei a minha regra por essa para este cliente.`,
        })
        loja.toastDesfazer(modo === 'aceitar' ? 'Sugestão aceita. O integrante aprendeu a regra.' : 'Correção salva. O integrante aprendeu com ela.', () => reverterNotas(antes))
        onFechar()
      }}
    >
      <div className="bg-sunken flex flex-col gap-1 rounded-[14px] p-3 text-sm">
        <span className="text-muted-foreground text-xs">Alerta</span>
        {item.alerta}
      </div>
      <div className="bg-sunken flex flex-col gap-1 rounded-[14px] p-3 text-sm">
        <span className="text-muted-foreground flex items-center gap-1 text-xs">
          <SparkleIcon className="size-3.5" /> Sugestão do integrante · {item.regra}
        </span>
        {item.sugestao}
      </div>
      <Campo rotulo="Decisão">
        {() => (
          <Segmentado
            rotulo="Decisão"
            valor={modo}
            onMudar={setModo}
            opcoes={[
              { valor: 'aceitar', rotulo: 'Aceitar' },
              { valor: 'corrigir', rotulo: 'Corrigir' },
            ]}
          />
        )}
      </Campo>
      {modo === 'corrigir' && <Campo rotulo="Como deve ficar">{(id) => <CampoArea id={id} linhas={3} valor={correcao} onMudar={setCorrecao} placeholder="Ex.: manter o crédito: o fornecedor é do Simples e destacou o ICMS por erro" />}</Campo>}
    </GavetaFormulario>
  )
}

/** S02-A64 · Registrar NFS-e de prefeitura sem ADN (NFE-008): upload de PDF ou XML com extração de campos. */
export function GavetaRegistrarNfse({ clienteId, onFechar }: { clienteId: string; onFechar: () => void }) {
  const loja = useLoja()
  const { usuario } = useSessao()
  const [arquivo, setArquivo] = useState('NFS-e 1452 prefeitura de Guarulhos.pdf')
  const [lendo, setLendo] = useState(false)
  const [lido, setLido] = useState<{ campos: CamposLidos; fonte: string } | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const ler = async () => {
    setLendo(true)
    setErro(null)
    try {
      const r = await servicos.ocr.ler({ nome: arquivo })
      setLido({ campos: r.dados, fonte: r.fonte })
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'A leitura não respondeu.')
    } finally {
      setLendo(false)
    }
  }
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo="Registrar NFS-e de prefeitura"
      descricao="Para municípios que ainda não mandam ao padrão nacional (ADN): suba o PDF ou o XML; os campos são lidos e você confere."
      acao="Registrar"
      acaoDesabilitada={!lido}
      onAcao={() => {
        const nome = nomeCliente(clienteId)
        loja.adicionarDocumento({ nome: arquivo, clienteId, pasta: ['Notas', 'Serviços tomados'], tipo: 'nfse', competencia: estadoNotas(clienteId).competencia, origem: 'upload_equipe', conector: 'drive', tamanho: '84 KB', quando: 'agora', por: usuario.nome, dados: lido?.campos.campos })
        mudarNotas(
          clienteId,
          (e) => {
            const i = e.fluxos.findIndex((x) => /NFS-e/.test(x.tipo))
            const fluxos = i >= 0 ? e.fluxos.map((x, k) => (k === i ? { ...x, qtd: x.qtd + 1 } : x)) : [...e.fluxos, { tipo: 'Serviços tomados (NFS-e)', qtd: 1, fonte: 'Prefeitura (manual)', paridade: 1 }]
            return { ...e, fluxos }
          },
          `${usuario.nome} registrou ${arquivo} (NFS-e sem ADN) para ${nome} (NFE-008)`,
        )
        loja.toast(`NFS-e registrada e guardada em Notas / Serviços tomados de ${nome}.`, { modulo: 'arquivos', pasta: { clienteId, caminho: ['Notas', 'Serviços tomados'] } }, 'Ver em Arquivos')
        onFechar()
      }}
    >
      <Campo rotulo="Arquivo (PDF ou XML)" ajuda="Na demonstração, o nome do arquivo decide o que a leitura encontra.">
        {(id) => (
          <div className="flex gap-2">
            <CampoTexto id={id} valor={arquivo} onMudar={(x) => (setArquivo(x), setLido(null))} />
            <Button type="button" variant="outline" className="shrink-0 rounded-full" disabled={lendo || !arquivo.trim()} onClick={ler}>
              {lendo ? 'Lendo…' : 'Ler'}
            </Button>
          </div>
        )}
      </Campo>
      {erro && <EstadoErro descricao={erro} onTentar={ler} className="py-4" />}
      {lido && (
        <div className="bg-sunken flex flex-col gap-2 rounded-[14px] p-3 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground text-xs">Campos lidos · confiança {Math.round(lido.campos.confianca * 100)}%</span>
            <SeloDemonstracao fonte={lido.fonte} />
          </div>
          <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1">
            {Object.entries(lido.campos.campos).map(([k, x]) => (
              <div key={k} className="contents">
                <dt className="text-muted-foreground">{k.replace(/_/g, ' ')}</dt>
                <dd className="truncate">{x}</dd>
              </div>
            ))}
          </dl>
          {lido.campos.tipo !== 'nfse' && <p className="text-warning-text text-xs">Isto não parece uma NFS-e ({lido.campos.tipo}). Confira o arquivo antes de registrar.</p>}
        </div>
      )}
    </GavetaFormulario>
  )
}

/** Itens de um .zip de exemplo, com os nomes estragados do Windows (D-04). */
const itensZip = ['Nota fiscal servi‡o 1452.xml', 'NF-e 88120 a‡o.xml', 'Relat¢rio de compras outubro.pdf', 'Notas canceladas Æ conferir.xml']

/** S02-A65 · Abrir .zip enviado pelo cliente (D-04): cada item vira documento, com os nomes com acento corrigidos. */
export function GavetaAbrirZip({ clienteId, onFechar }: { clienteId: string; onFechar: () => void }) {
  const loja = useLoja()
  const { usuario } = useSessao()
  const [zip, setZip] = useState('notas outubro.zip')
  const [marcados, setMarcados] = useState(itensZip)
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo="Abrir .zip do cliente"
      descricao="Cada arquivo de dentro vira um documento com a origem do zip. Nomes que o Windows estragou (acentos) saem corrigidos."
      acao={`Registrar ${marcados.length} ${marcados.length === 1 ? 'documento' : 'documentos'}`}
      acaoDesabilitada={!marcados.length}
      onAcao={() => {
        const nome = nomeCliente(clienteId)
        for (const i of marcados) loja.adicionarDocumento({ nome: corrigirNomeWindows(i), clienteId, pasta: ['Notas', 'Recebidos do cliente'], tipo: /\.xml$/.test(i) ? 'xml' : 'outro', competencia: estadoNotas(clienteId).competencia, origem: 'conversa', conector: 'drive', tamanho: '40 KB', quando: 'agora', por: `${usuario.nome} (de ${zip})` })
        mudarNotas(clienteId, (e) => e, `${usuario.nome} abriu ${zip} de ${nome}: ${marcados.length} documentos registrados (D-04)`)
        loja.toast(`${marcados.length} documentos de ${zip} registrados em Notas / Recebidos do cliente.`, { modulo: 'arquivos', pasta: { clienteId, caminho: ['Notas', 'Recebidos do cliente'] } }, 'Ver em Arquivos')
        onFechar()
      }}
    >
      <Campo rotulo="Arquivo .zip">{(id) => <CampoTexto id={id} valor={zip} onMudar={setZip} />}</Campo>
      <ul className="flex flex-col gap-1.5">
        {itensZip.map((i) => {
          const ok = marcados.includes(i)
          const certo = corrigirNomeWindows(i)
          return (
            <li key={i}>
              <label className="bg-sunken flex cursor-pointer items-start gap-2.5 rounded-[12px] px-3 py-2 text-sm">
                <input type="checkbox" checked={ok} onChange={() => setMarcados((xs) => (ok ? xs.filter((x) => x !== i) : [...xs, i]))} className="mt-1" />
                <FileZipIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{certo}</span>
                  {certo !== i && <span className="text-muted-foreground block truncate text-xs">no zip: {i}</span>}
                </span>
              </label>
            </li>
          )
        })}
      </ul>
    </GavetaFormulario>
  )
}
