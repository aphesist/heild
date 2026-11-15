import { BankIcon, CheckCircleIcon, DownloadSimpleIcon, FileArrowUpIcon, PencilSimpleIcon, PlusIcon, TrashIcon, WarningIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { useLoja } from '@/ambiente/loja'
import { EstadoErro, SeloDemonstracao, useAcao, useConfirmar } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Campo, CampoArea, CampoEscolha, CampoTexto, Fichas, GavetaFormulario, Interruptor, Passos, Segmentado } from '@/components/ui/formulario'
import { cn } from '@/lib/utils'
import type { PassoRegua, PoliticaFinanceira } from '@/nucleo/modelo/financeiro'
import { repos } from '@/nucleo/repositorios'
import { servicos } from '@/servicos'
import { useFin } from './dados'
import { dataCurta, PROXIMA_COMPETENCIA, rotuloCompetencia, rotuloDia, rotuloMeio, rotuloSituacao, servicos as tabServicos } from './dominio'

/*
 * S07-T08 · Financeiro › Configurar (só Administrador): provedor de cobrança,
 * NFS-e do escritório, política de inadimplência e régua, conectar conta por
 * Open Finance, plano de contas e centros de custo, alçadas, trazer o
 * financeiro atual, tabela de avulsos e exportar. Tudo grava na política
 * financeira (uma versão vigente; cada mudança gera evento) ou nas entidades.
 */

type Fechar = { onFechar: () => void }
const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const numero = (s: string) => Number(s.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '')) || 0

function usePolitica() {
  const fin = useFin()
  const executar = useAcao()
  const salvar = (patch: Partial<PoliticaFinanceira>, texto: string, sucesso = 'Configuração salva: a política ganhou uma versão nova.') => {
    if (!fin.politica) return false
    return !!executar(() => repos.politicasFinanceiras.atualizar(fin.politica!.id, patch, { texto }), { sucesso })
  }
  return { politica: fin.politica, salvar, fin }
}

/** S07-A45 · Provedor de cobrança em passos: banco do escritório (padrão) ou gateway; trocar sem perder Pix Automático. */
export function ConectarProvedor({ onFechar, troca }: Fechar & { troca?: boolean }) {
  const { politica, salvar } = usePolitica()
  const passos = ['Provedor', 'Credenciais', 'Conta', 'Testar', 'Pronto']
  const [passo, setPasso] = useState(0)
  const [tipo, setTipo] = useState<'banco' | 'gateway'>(politica?.provedor.tipo ?? 'banco')
  const bancos = ['Banco Inter (API PJ)', 'Itaú (API Cobrança)', 'Bradesco (API Cobrança)', 'Sicredi (API)', 'Banco do Brasil (API Cobrança)']
  const gateways = ['Asaas', 'Efí (Gerencianet)']
  const [prov, setProv] = useState(politica?.provedor.tipo === tipo && politica.provedor.nome !== 'a escolher' ? politica.provedor.nome : bancos[0])
  const [token, setToken] = useState('')
  const [cert, setCert] = useState(false)
  const [teste, setTeste] = useState<{ estado: 'nao' | 'testando' | 'ok' | 'erro'; erro?: string; fonte?: string }>({ estado: 'nao' })
  const [migrar, setMigrar] = useState(true)
  const opcoes = tipo === 'banco' ? bancos : gateways
  const precisaCert = tipo === 'banco'
  const pode = passo === 1 ? token.length >= 8 && (!precisaCert || cert) : passo === 3 ? teste.estado === 'ok' : true
  const ultimo = passo === passos.length - 1
  const testar = async () => {
    setTeste({ estado: 'testando' })
    try {
      const r = await servicos.cobranca.testarConvenio(prov)
      setTeste({ estado: 'ok', fonte: r.fonte })
    } catch (e) {
      setTeste({ estado: 'erro', erro: e instanceof Error ? e.message : String(e) })
    }
  }
  const tarifa = (x: string) => (x === 'Asaas' ? ['R$ 1,99', 'R$ 1,99', 'R$ 1,49', 'D+1'] : x.startsWith('Efí') ? ['R$ 3,45', 'grátis', 'R$ 3,50', 'D+0'] : ['R$ 1,90', 'grátis', 'R$ 0,90', 'D+0'])
  return (
    <GavetaFormulario
      aberta
      largura="lg"
      onFechar={onFechar}
      titulo={troca ? 'Provedor de cobrança' : 'Conectar provedor de cobrança'}
      descricao="Como no Conexa, a cobrança sai direto do banco onde o escritório tem convênio (API Pix e boleto); Asaas e Efí ficam para quem não tem convênio. A credencial vai para o cofre; ninguém a vê depois de salva."
      acao={ultimo ? 'Concluir' : 'Continuar'}
      acaoDesabilitada={!pode}
      onAcao={() => {
        if (!ultimo) return setPasso((p) => p + 1)
        const [boleto, pix, pixAuto, credito] = tarifa(prov)
        if (politica && salvar({ provedor: { ...politica.provedor, tipo, nome: prov, conta: tipo === 'banco' ? 'conta PJ do escritório' : 'subconta no gateway', convenio: tipo === 'banco' ? 'convênio de cobrança ativo · API Pix e boleto' : 'gateway (sem convênio)', boleto, pix, pix_automatico: pixAuto, credito, autorizacoes_pix: migrar ? politica.provedor.autorizacoes_pix : 0 } }, `Provedor de cobrança: ${prov}${migrar ? ', com as autorizações de Pix Automático' : ''}`))
          onFechar()
      }}
      secundaria={
        passo > 0 && !ultimo ? (
          <Button type="button" variant="ghost" className="rounded-full" onClick={() => setPasso((p) => p - 1)}>
            Voltar
          </Button>
        ) : undefined
      }
    >
      <Passos passos={passos} atual={passo} />
      {passo === 0 && (
        <>
          {politica && politica.provedor.nome !== 'a escolher' && (
            <p className="bg-sunken/60 rounded-lg px-3 py-2 text-sm">
              Hoje: <strong className="font-medium">{politica.provedor.nome}</strong> · {politica.provedor.convenio} · {politica.provedor.autorizacoes_pix} autorizações de Pix Automático
            </p>
          )}
          <Campo rotulo="Como cobrar">
            {() => (
              <Segmentado
                rotulo="Como cobrar"
                valor={tipo}
                onMudar={(v) => {
                  setTipo(v)
                  setProv(v === 'banco' ? bancos[0] : gateways[0])
                }}
                opcoes={[
                  { valor: 'banco', rotulo: 'Banco do escritório (recomendado)' },
                  { valor: 'gateway', rotulo: 'Gateway (sem convênio)' },
                ]}
              />
            )}
          </Campo>
          <Campo rotulo={tipo === 'banco' ? 'Banco conveniado' : 'Gateway'}>{(id) => <CampoEscolha id={id} valor={prov} onMudar={setProv} opcoes={opcoes.map((x) => ({ valor: x, rotulo: x }))} />}</Campo>
          <div className="bg-sunken/60 grid grid-cols-2 gap-2 rounded-lg p-3 text-xs sm:grid-cols-4">
            {['Boleto', 'Pix', 'Pix Automático', 'Crédito'].map((r, i) => (
              <span key={r}>
                <span className="text-muted-foreground block">{r}</span>
                {tarifa(prov)[i]}
              </span>
            ))}
          </div>
          {troca && politica && politica.provedor.autorizacoes_pix > 0 && (
            <Interruptor
              ligado={migrar}
              onMudar={setMigrar}
              rotulo={`Levar as ${politica.provedor.autorizacoes_pix} autorizações de Pix Automático`}
              detalhe="Os títulos em aberto continuam no provedor atual até a baixa; os novos saem pelo novo. Quem não puder ser levado recebe um pedido de nova autorização no app."
            />
          )}
        </>
      )}
      {passo === 1 && (
        <>
          <Campo rotulo={tipo === 'banco' ? 'Client ID e secret da API' : 'Chave da API do gateway'} ajuda="Criados no internet banking (ou no painel do gateway), com escopo de cobrança e de extrato. Vão para o cofre.">
            {(id) => <CampoTexto id={id} valor={token} onMudar={setToken} mono placeholder="cole aqui (mínimo 8 caracteres)" />}
          </Campo>
          {precisaCert && (
            <Campo rotulo="Certificado da API (mTLS)" ajuda="Arquivos .crt e .key que o banco gera junto com a credencial.">
              {() => (
                <Button type="button" variant="outline" className="w-fit rounded-full" onClick={() => setCert(true)}>
                  <FileArrowUpIcon /> {cert ? 'certificado.crt e chave.key no cofre' : 'Enviar arquivos'}
                </Button>
              )}
            </Campo>
          )}
        </>
      )}
      {passo === 2 && politica && (
        <>
          <Campo rotulo="Conta que recebe">{(id) => <CampoEscolha id={id} valor="pj" onMudar={() => {}} opcoes={[{ valor: 'pj', rotulo: tipo === 'banco' ? `${prov.split(' (')[0]} · conta PJ do escritório` : 'Subconta do escritório no gateway' }]} />}</Campo>
          <Campo rotulo="Juros e multa no boleto" ajuda="Vêm da política de inadimplência; mudam lá.">
            {() => (
              <p className="text-sm">
                {politica.juros_mes.toLocaleString('pt-BR')}% ao mês · multa de {politica.multa.toLocaleString('pt-BR')}%
              </p>
            )}
          </Campo>
        </>
      )}
      {passo === 3 && (
        <div className="flex flex-col gap-3 text-sm">
          <p className="text-muted-foreground">Emitimos um boleto e um Pix de R$ 1,00 em homologação, consultamos e cancelamos. Nada chega a cliente.</p>
          <Button type="button" variant="outline" className="w-fit rounded-full" disabled={teste.estado === 'testando'} onClick={testar}>
            {teste.estado === 'testando' ? 'Testando…' : teste.estado === 'erro' ? 'Testar de novo' : 'Testar conexão'}
          </Button>
          {teste.estado === 'erro' && <EstadoErro titulo="O convênio não respondeu" descricao={teste.erro} onTentar={testar} />}
          {teste.estado === 'ok' && (
            <>
              <ul className="flex flex-col gap-1">
                {['Credencial aceita', 'Boleto de teste emitido e cancelado', 'Pix de teste com QR Code', 'Webhook de baixa respondendo'].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <CheckCircleIcon className="text-success size-4" weight="fill" /> {t}
                  </li>
                ))}
              </ul>
              <SeloDemonstracao fonte={teste.fonte} />
            </>
          )}
        </div>
      )}
      {passo === 4 && <p className="bg-success/10 rounded-lg px-3 py-2.5 text-sm">Ao concluir, as cobranças do próximo ciclo ({rotuloCompetencia(PROXIMA_COMPETENCIA)}) já saem por {prov}.{troca && migrar ? ' As autorizações de Pix Automático são levadas; você acompanha em Cobranças.' : ''}</p>}
    </GavetaFormulario>
  )
}

/** S07-A46 · NFS-e do escritório: emissor, série, quando emitir, reembolso e `nfse_por_servico`. */
export function ConfigNfse({ onFechar }: Fechar) {
  const { politica, salvar } = usePolitica()
  const [d, setD] = useState(politica?.nfse)
  if (!politica || !d) return null
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo="NFS-e do escritório"
      descricao="A nota de cada honorário, mensal e extra, pelo padrão nacional. Erro no emissor volta como cartão para corrigir e reemitir."
      acao="Salvar"
      onAcao={() => salvar({ nfse: d }, `NFS-e do escritório: ${d.nfse_por_servico ? 'uma nota por serviço' : 'vários itens na mesma nota'}, emissão ${d.envio === 'com_a_cobranca' ? 'com a cobrança' : 'após a liquidação'}`) && onFechar()}
    >
      <Campo rotulo="Onde emite">{(id) => <CampoEscolha id={id} valor={d.emissor} onMudar={(v) => setD({ ...d, emissor: v })} opcoes={['Emissor Nacional (NFS-e padrão nacional)', 'Integrador (município fora do padrão)'].map((x) => ({ valor: x, rotulo: x }))} />}</Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo rotulo="Série">{(id) => <CampoTexto id={id} valor={d.serie} onMudar={(v) => setD({ ...d, serie: v })} />}</Campo>
        <Campo rotulo="Última emitida">{() => <p className="text-sm tabular-nums">{d.serie}/{d.ultimo_numero}</p>}</Campo>
      </div>
      <Campo rotulo="Certificado">{() => <p className="text-sm">{d.certificado}</p>}</Campo>
      <Campo rotulo="Quando emitir">
        {() => (
          <Segmentado
            rotulo="Quando emitir"
            valor={d.envio}
            onMudar={(v) => setD({ ...d, envio: v })}
            opcoes={[
              { valor: 'com_a_cobranca', rotulo: 'Com a cobrança' },
              { valor: 'apos_liquidacao', rotulo: 'Após o pagamento' },
            ]}
          />
        )}
      </Campo>
      <Interruptor
        ligado={d.nfse_por_servico}
        onMudar={(v) => setD({ ...d, nfse_por_servico: v })}
        rotulo="Uma NFS-e por serviço (nfse_por_servico)"
        detalhe={`Padrão ligado: a fatura é uma só, mas contábil (17.19) e BPO (17.02) saem em notas separadas, cada uma com a própria tributação. ${d.regra}.`}
      />
      <Campo rotulo="Reembolso de despesas" ajuda="Se entra na base do ISS depende do município [a confirmar]; o padrão é recibo separado, fora da nota (09, 4.6).">
        {() => (
          <Segmentado
            rotulo="Reembolso"
            valor={d.reembolso}
            onMudar={(v) => setD({ ...d, reembolso: v })}
            opcoes={[
              { valor: 'recibo_separado', rotulo: 'Recibo separado' },
              { valor: 'na_nota', rotulo: 'Na nota' },
            ]}
          />
        )}
      </Campo>
    </GavetaFormulario>
  )
}

const rotuloTom: Record<PassoRegua['tom'], string> = { lembrete: 'lembrete', cordial: 'cordial', firme: 'firme', gestor: 'aviso ao Gestor', formal: 'aviso formal', pausa: 'pausa parcial' }
const rotuloQuem: Record<PassoRegua['quem'], string> = { sozinho: 'integrante sozinho', gestor: 'cartão ao Gestor', administrador: 'cartão ao Administrador' }

/** S07-A21 · Um passo da régua de honorários (dias e texto). */
export function EditarPassoRegua({ p, onFechar, onSalvar, onExcluir }: Fechar & { p?: PassoRegua; onSalvar: (p: PassoRegua) => void; onExcluir?: () => void }) {
  const [d, setD] = useState<PassoRegua>(p ?? { id: `p${Date.now()}`, dias: 15, canal: 'WhatsApp', tom: 'firme', quem: 'gestor', texto: '', ativo: true })
  const quando = d.dias < 0 ? `${-d.dias} dias antes` : d.dias === 0 ? 'no vencimento' : `${d.dias} dias depois`
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo={p ? 'Editar passo da régua' : 'Novo passo da régua'}
      descricao="Vale para todos os clientes; quem está em acordo, contestou ou informou pagamento sai da régua até resolver. Documento nunca é retido."
      acao="Salvar"
      acaoDesabilitada={!d.texto.trim()}
      onAcao={() => onSalvar(d)}
      secundaria={
        onExcluir ? (
          <Button type="button" variant="ghost" className="text-destructive-text rounded-full" onClick={onExcluir}>
            <TrashIcon /> Tirar da régua
          </Button>
        ) : undefined
      }
    >
      <Campo rotulo={`Quando: ${quando} (${rotuloDia(d.dias)})`}>{(id) => <input id={id} type="range" min={-10} max={60} value={d.dias} onChange={(e) => setD({ ...d, dias: Number(e.target.value) })} className="accent-foreground w-full" />}</Campo>
      <Campo rotulo="Canal">{(id) => <CampoEscolha id={id} valor={d.canal} onMudar={(v) => setD({ ...d, canal: v })} opcoes={(['WhatsApp', 'e-mail', 'WhatsApp e e-mail', 'app'] as const).map((x) => ({ valor: x, rotulo: x }))} />}</Campo>
      <Campo rotulo="Tom">{(id) => <CampoEscolha id={id} valor={d.tom} onMudar={(v) => setD({ ...d, tom: v })} opcoes={(Object.keys(rotuloTom) as PassoRegua['tom'][]).map((x) => ({ valor: x, rotulo: rotuloTom[x] }))} />}</Campo>
      <Campo rotulo="Quem age" ajuda="Os três primeiros passos rodam sozinhos depois que o Administrador aprova a régua; D+10 em diante pedem cartão (09, 5.2).">
        {(id) => <CampoEscolha id={id} valor={d.quem} onMudar={(v) => setD({ ...d, quem: v })} opcoes={(Object.keys(rotuloQuem) as PassoRegua['quem'][]).map((x) => ({ valor: x, rotulo: rotuloQuem[x] }))} />}
      </Campo>
      <Campo rotulo="Mensagem" ajuda="Variáveis: {{contato}}, {{competencia}}, {{vencimento}}, {{valor}}, {{link_2via}}. A 2ª via sempre vai com juros e multa atualizados.">
        {(id) => <CampoArea id={id} valor={d.texto} onMudar={(v) => setD({ ...d, texto: v })} />}
      </Campo>
      <Interruptor ligado={d.ativo} onMudar={(v) => setD({ ...d, ativo: v })} rotulo="Passo ativo" />
    </GavetaFormulario>
  )
}

/** Lista da régua com editar (usada em Configurar e em Cobranças). */
export function ListaRegua({ politica, editavel, onEditar }: { politica: PoliticaFinanceira; editavel: boolean; onEditar: (p?: PassoRegua) => void }) {
  return (
    <ol className="flex flex-col gap-1.5">
      {[...politica.regua]
        .sort((a, b) => a.dias - b.dias)
        .map((p) => (
          <li key={p.id} className={cn('flex items-start gap-3 rounded-md px-2 py-1.5 text-sm', !p.ativo && 'opacity-50')}>
            <span className="bg-sunken w-12 shrink-0 rounded-full py-0.5 text-center text-xs font-medium tabular-nums">{rotuloDia(p.dias)}</span>
            <span className="min-w-0 flex-1">
              <span className="block">
                {rotuloTom[p.tom]} · {p.canal}
                {!p.ativo && ' · desligado'}
              </span>
              <span className="text-muted-foreground block text-xs">
                {rotuloQuem[p.quem]} · {p.texto}
              </span>
            </span>
            {editavel && (
              <Button size="icon-sm" variant="ghost" className="rounded-full" aria-label={`Editar o passo ${rotuloDia(p.dias)}`} onClick={() => onEditar(p)}>
                <PencilSimpleIcon />
              </Button>
            )}
          </li>
        ))}
    </ol>
  )
}

/** S07-A47 · Política de inadimplência: juros, multa, régua, aviso formal, pausa e acordo. Nunca reter documento. */
export function PoliticaInadimplencia({ onFechar }: Fechar) {
  const { politica, salvar } = usePolitica()
  const [d, setD] = useState(politica)
  const [passo, setPasso] = useState<PassoRegua | 'novo' | null>(null)
  if (!politica || !d) return null
  const formal = d.regua.find((p) => p.tom === 'formal')
  const pausa = d.regua.find((p) => p.tom === 'pausa')
  const ajustar = (tom: 'formal' | 'pausa', dias: number) => setD({ ...d, regua: d.regua.map((p) => (p.tom === tom ? { ...p, dias } : p)) })
  if (passo)
    return (
<EditarPassoRegua
          p={passo === 'novo' ? undefined : passo}
          onFechar={() => setPasso(null)}
          onSalvar={(p) => {
            setD({ ...d, regua: d.regua.some((x) => x.id === p.id) ? d.regua.map((x) => (x.id === p.id ? p : x)) : [...d.regua, p] })
            setPasso(null)
          }}
          onExcluir={passo === 'novo' ? undefined : () => (setD({ ...d, regua: d.regua.filter((x) => x.id !== passo.id) }), setPasso(null))}
        />
    )
  return (
    <GavetaFormulario
      aberta
      largura="lg"
      onFechar={onFechar}
      titulo="Política de inadimplência"
      descricao="O que acontece, e quando, com quem não paga. Obrigação em curso, prazo legal, guia e documento já devido nunca são retidos: só pedidos novos e extras pausam."
      acao="Salvar"
      onAcao={() => salvar({ juros_mes: d.juros_mes, multa: d.multa, regua: d.regua, prazo_pago_dias: d.prazo_pago_dias, acordo_desconto_max: d.acordo_desconto_max, acordo_parcelas_max: d.acordo_parcelas_max }, `Política de inadimplência: juros ${d.juros_mes}%, multa ${d.multa}%, aviso formal em D+${formal?.dias}, pausa em D+${pausa?.dias}`) && onFechar()}
    >
      <div className="grid grid-cols-2 gap-3">
        <Campo rotulo="Juros ao mês (%)">{(id) => <CampoTexto id={id} valor={String(d.juros_mes).replace('.', ',')} onMudar={(v) => setD({ ...d, juros_mes: numero(v) })} />}</Campo>
        <Campo rotulo="Multa (%)">{(id) => <CampoTexto id={id} valor={String(d.multa).replace('.', ',')} onMudar={(v) => setD({ ...d, multa: numero(v) })} />}</Campo>
      </div>
      {formal && (
        <Campo rotulo={`Aviso formal em D+${formal.dias}`}>{(id) => <input id={id} type="range" min={15} max={60} step={5} value={formal.dias} onChange={(e) => ajustar('formal', Number(e.target.value))} className="accent-foreground w-full" />}</Campo>
      )}
      {pausa && (
        <Campo rotulo={`Pausa parcial em D+${pausa.dias}`} ajuda="Reativa sozinha quando o pagamento é confirmado.">
          {(id) => <input id={id} type="range" min={30} max={90} step={5} value={pausa.dias} onChange={(e) => ajustar('pausa', Number(e.target.value))} className="accent-foreground w-full" />}
        </Campo>
      )}
      <Campo rotulo={`"Pago" informado pausa a régua por ${d.prazo_pago_dias} dias úteis`} ajuda="O botão pago do app não baixa: só pausa até o extrato ou o webhook confirmar (09, 5.3).">
        {(id) => <input id={id} type="range" min={1} max={7} value={d.prazo_pago_dias} onChange={(e) => setD({ ...d, prazo_pago_dias: Number(e.target.value) })} className="accent-foreground w-full" />}
      </Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo rotulo={`Desconto máximo no acordo: ${d.acordo_desconto_max}%`}>{(id) => <input id={id} type="range" min={0} max={30} value={d.acordo_desconto_max} onChange={(e) => setD({ ...d, acordo_desconto_max: Number(e.target.value) })} className="accent-foreground w-full" />}</Campo>
        <Campo rotulo={`Até ${d.acordo_parcelas_max} parcelas`}>{(id) => <input id={id} type="range" min={1} max={12} value={d.acordo_parcelas_max} onChange={(e) => setD({ ...d, acordo_parcelas_max: Number(e.target.value) })} className="accent-foreground w-full" />}</Campo>
      </div>
      <section className="flex flex-col gap-2">
        <span className="flex items-center gap-2">
          <h3 className="flex-1 text-sm font-medium">Régua de honorários</h3>
          <Button type="button" size="sm" variant="outline" className="rounded-full" onClick={() => setPasso('novo')}>
            <PlusIcon /> Passo
          </Button>
        </span>
        <ListaRegua politica={d} editavel onEditar={(p) => setPasso(p ?? 'novo')} />
      </section>
    </GavetaFormulario>
  )
}

/** S07-A48 e S07-A33 · Conectar conta (ou renovar o consentimento) por Open Finance, com consentimento. */
export function ConectarConta({ onFechar, renovar }: Fechar & { renovar?: string }) {
  const executar = useAcao()
  const fin = useFin()
  const conta = renovar ? fin.contasBancarias.find((c) => c.id === renovar) : undefined
  const passos = renovar ? ['Consentimento', 'Pronto'] : ['Banco', 'Consentimento', 'Contas', 'Pronto']
  const [passo, setPasso] = useState(0)
  const [banco, setBanco] = useState(conta?.banco ?? 'Bradesco')
  const [estado, setEstado] = useState<{ s: 'nao' | 'indo' | 'ok' | 'erro'; erro?: string; fonte?: string; expira?: string }>({ s: 'nao' })
  const [contas, setContas] = useState(['conta corrente PJ'])
  const etapa = passos[passo]
  const ultimo = passo === passos.length - 1
  const autorizar = async () => {
    setEstado({ s: 'indo' })
    try {
      const r = await servicos.openFinance.conectar(banco, '')
      setEstado({ s: 'ok', fonte: r.fonte, expira: r.dados.expira_em })
    } catch (e) {
      setEstado({ s: 'erro', erro: e instanceof Error ? e.message : String(e) })
    }
  }
  const concluir = () => {
    const ate = '2027-11-18'
    if (conta) executar(() => repos.contasBancarias.atualizar(conta.id, { situacao: 'ativa', consentimento_ate: ate, saldo_em: new Date().toISOString() }, { texto: `Consentimento Open Finance de ${conta.nome} renovado até ${dataCurta(ate)}/2027` }), { sucesso: `${conta.nome}: consentimento renovado por 12 meses.` })
    else
      for (const c of contas)
        executar(() => repos.contasBancarias.criar({ titular_tipo: 'escritorio', nome: `${banco} ${c === 'cartão empresarial' ? 'Cartão' : 'PJ'}`, banco, tipo: c === 'cartão empresarial' ? 'cartao' : 'corrente', conta_mascarada: '•••' + String(Math.floor(Math.random() * 900) + 100), origem: 'open_finance', saldo: c === 'cartão empresarial' ? -1240 : 12_480, saldo_em: new Date().toISOString(), situacao: 'ativa', consentimento_ate: ate }), { sucesso: `${banco} conectado: os últimos 90 dias de extrato entram para conciliar.` })
    onFechar()
  }
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo={conta ? `Renovar consentimento · ${conta.nome}` : 'Conectar conta do escritório'}
      descricao="Extrato e saldo pelo Open Finance, só leitura. Pagamentos continuam no banco, com a aprovação daqui."
      acao={ultimo ? 'Concluir' : 'Continuar'}
      acaoDesabilitada={etapa === 'Consentimento' && estado.s !== 'ok'}
      onAcao={() => (ultimo ? concluir() : setPasso((p) => p + 1))}
    >
      <Passos passos={passos} atual={passo} />
      {etapa === 'Banco' && <Campo rotulo="Banco">{(id) => <CampoEscolha id={id} valor={banco} onMudar={setBanco} opcoes={['Bradesco', 'Banco do Brasil', 'Caixa', 'Santander', 'Sicoob', 'Itaú', 'Nubank PJ'].map((x) => ({ valor: x, rotulo: x }))} />}</Campo>}
      {etapa === 'Consentimento' && (
        <div className="flex flex-col gap-3 text-sm">
          <p className="text-muted-foreground">Você é levado ao {banco} para autorizar por 12 meses: saldos, extratos e faturas de cartão. Dá para revogar lá ou aqui.</p>
          <Button type="button" variant="outline" className="w-fit rounded-full" disabled={estado.s === 'indo'} onClick={autorizar}>
            <BankIcon /> {estado.s === 'ok' ? 'Autorizado no banco' : estado.s === 'indo' ? 'Esperando o banco…' : `Autorizar no ${banco}`}
          </Button>
          {estado.s === 'erro' && <EstadoErro titulo="O banco não respondeu" descricao={estado.erro} onTentar={autorizar} />}
          {estado.s === 'ok' && <SeloDemonstracao fonte={estado.fonte} />}
        </div>
      )}
      {etapa === 'Contas' && <Campo rotulo="O que trazer">{() => <Fichas rotulo="Contas" valores={contas} onMudar={setContas} opcoes={['conta corrente PJ', 'cartão empresarial'].map((x) => ({ valor: x, rotulo: x }))} />}</Campo>}
      {etapa === 'Pronto' && <p className="bg-success/10 rounded-lg px-3 py-2.5 text-sm">{conta ? `Consentimento renovado: ${conta.nome} volta a atualizar 4 vezes ao dia.` : `${banco} conectado. Os últimos 90 dias de extrato entram para conciliar; daqui em diante, atualiza 4 vezes ao dia.`}</p>}
    </GavetaFormulario>
  )
}

/** S07-A49 · Plano de contas gerencial e centros de custo (modelo padrão; editar; "entra no custo-hora"). */
export function PlanoContas({ onFechar }: Fechar) {
  const fin = useFin()
  const executar = useAcao()
  const [aba, setAba] = useState<'categorias' | 'centros'>('categorias')
  const [novo, setNovo] = useState<Record<string, string>>({})
  const [novoCentro, setNovoCentro] = useState('')
  const grupos = [...new Set(fin.categorias.map((c) => c.grupo))]
  return (
    <GavetaFormulario aberta largura="lg" onFechar={onFechar} titulo="Plano de contas e centros de custo" descricao="As categorias da conciliação e da DRE e os centros que recebem os custos. Nada se apaga: o que não se usa mais é desativado (o histórico continua)." acao="Fechar" onAcao={onFechar}>
      <Segmentado
        rotulo="O quê"
        valor={aba}
        onMudar={setAba}
        opcoes={[
          { valor: 'categorias', rotulo: `Categorias (${fin.categorias.filter((c) => c.ativa).length})` },
          { valor: 'centros', rotulo: `Centros de custo (${fin.centros.filter((c) => c.ativo).length})` },
        ]}
      />
      {aba === 'categorias' &&
        grupos.map((g) => {
          const cats = fin.categorias.filter((c) => c.grupo === g)
          return (
            <section key={g} className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">{g}</h3>
              <ul className="flex flex-wrap gap-1.5">
                {cats.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      aria-pressed={c.ativa}
                      title={c.ativa ? 'Desativar' : 'Reativar'}
                      onClick={() => executar(() => repos.categoriasGerenciais.atualizar(c.id, { ativa: !c.ativa }, { texto: `Categoria ${c.nome} ${c.ativa ? 'desativada' : 'reativada'}` }))}
                      className={cn('bg-sunken/70 hover:bg-raised cursor-pointer rounded-full px-3 py-1 text-xs', !c.ativa && 'line-through opacity-50')}
                    >
                      {c.codigo} {c.nome}
                    </button>
                  </li>
                ))}
              </ul>
              <span className="flex gap-2">
                <CampoTexto valor={novo[g] ?? ''} onMudar={(v) => setNovo({ ...novo, [g]: v })} placeholder={`Nova categoria em ${g}`} className="flex-1" aria-label={`Nova categoria em ${g}`} />
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  disabled={!novo[g]?.trim()}
                  onClick={() => {
                    const base = cats[0]
                    executar(() => repos.categoriasGerenciais.criar({ codigo: `${base.codigo.split('.')[0]}.${cats.length + 1}`, nome: novo[g].trim(), grupo: g, natureza: base.natureza, entra_no_custo_hora: base.entra_no_custo_hora, ativa: true }), { sucesso: 'Categoria criada.' })
                    setNovo({ ...novo, [g]: '' })
                  }}
                >
                  <PlusIcon /> Adicionar
                </Button>
              </span>
            </section>
          )
        })}
      {aba === 'centros' && (
        <>
          <ul className="divide-border/70 flex flex-col divide-y">
            {fin.centros.map((c) => (
              <li key={c.id} className={cn('flex flex-wrap items-center gap-3 py-2 text-sm', !c.ativo && 'opacity-50')}>
                <span className="min-w-0 grow basis-40">
                  <span className="block">{c.nome}</span>
                  <span className="text-muted-foreground block text-xs">{c.tipo === 'setor' ? 'setor fixo' : c.tipo === 'carteira_de_socio' ? 'carteira de sócio' : c.tipo}</span>
                </span>
                <Interruptor ligado={c.entra_no_custo_hora} onMudar={(v) => executar(() => repos.centrosCusto.atualizar(c.id, { entra_no_custo_hora: v }, { texto: `${c.nome} ${v ? 'entra' : 'sai'} do custo-hora` }))} rotulo="entra no custo-hora" />
                {c.tipo !== 'setor' && (
                  <Button size="sm" variant="ghost" className="rounded-full" onClick={() => executar(() => repos.centrosCusto.atualizar(c.id, { ativo: !c.ativo }, { texto: `Centro ${c.nome} ${c.ativo ? 'desativado' : 'reativado'}` }))}>
                    {c.ativo ? 'Desativar' : 'Reativar'}
                  </Button>
                )}
              </li>
            ))}
          </ul>
          <span className="flex gap-2">
            <CampoTexto valor={novoCentro} onMudar={setNovoCentro} placeholder="Novo centro de custo (ex.: Unidade Campinas)" className="flex-1" aria-label="Novo centro de custo" />
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              disabled={!novoCentro.trim()}
              onClick={() => {
                executar(() => repos.centrosCusto.criar({ nome: novoCentro.trim(), tipo: 'estrutura', entra_no_custo_hora: true, ativo: true }), { sucesso: 'Centro de custo criado.' })
                setNovoCentro('')
              }}
            >
              <PlusIcon /> Adicionar
            </Button>
          </span>
          <p className="text-muted-foreground text-xs">Os setores fixos entram prontos e não se desativam (Fundações 4.1); a receita de cada item do contrato vai ao centro do setor dele.</p>
        </>
      )}
    </GavetaFormulario>
  )
}

/** S07-A50 · Alçadas de aprovação: por valor e papel. */
export function Alcadas({ onFechar }: Fechar) {
  const { politica, salvar } = usePolitica()
  const [gestor, setGestor] = useState(String(politica?.limite_gestor ?? 5000))
  const [dois, setDois] = useState(String(politica?.limite_dois_aprovadores ?? 10000))
  const g = numero(gestor)
  const d = numero(dois)
  const erro = d <= g ? 'O limite de dois aprovadores precisa ser maior que o do Gestor.' : undefined
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo="Alçadas de aprovação"
      descricao="Quem aprova cada conta, acordo e ajuste antes de executar. O integrante Financeiro captura e prepara; pagar é sempre de uma pessoa, e a liberação final é no banco."
      acao="Salvar"
      acaoDesabilitada={!!erro || g <= 0}
      onAcao={() => salvar({ limite_gestor: g, limite_dois_aprovadores: d }, `Alçadas: Gestor do Financeiro até ${brl(g)}; dois aprovadores acima de ${brl(d)}`) && onFechar()}
    >
      <Campo rotulo="Gestor com o setor Financeiro aprova até (R$)">{(id) => <CampoTexto id={id} valor={gestor} onMudar={setGestor} />}</Campo>
      <Campo rotulo="Acima disso, o Administrador. Dois aprovadores (Administrador + segundo sócio) acima de (R$)" erro={erro}>
        {(id) => <CampoTexto id={id} valor={dois} onMudar={setDois} />}
      </Campo>
      <ul className="bg-sunken/60 flex flex-col gap-1 rounded-lg p-3 text-sm">
        <li>até {brl(g)}: Gestor com o setor Financeiro (ou o Administrador)</li>
        <li>até {brl(d)}: Administrador</li>
        <li>acima de {brl(d)}: Administrador e segundo sócio</li>
      </ul>
    </GavetaFormulario>
  )
}

/** S07-A52 · Tabela de avulsos: preço por atividade do catálogo. */
export function TabelaAvulsos({ onFechar }: Fechar) {
  const fin = useFin()
  const executar = useAcao()
  const confirmar = useConfirmar()
  const [ed, setEd] = useState<{ id?: string; atividade_id: string; nome: string; valor: string; unidade: 'ocorrencia' | 'hora' | 'por_empregado'; exige_aceite: boolean } | null>(null)
  const unidade = { ocorrencia: 'por vez', hora: 'por hora', por_empregado: 'por empregado' }
  return (
    <GavetaFormulario aberta largura="lg" onFechar={onFechar} titulo="Tabela de avulsos" descricao="O preço do escritório por atividade do catálogo (GES-002). O integrante usa para propor o serviço fora do contrato; sem aceite, não fatura." acao="Fechar" onAcao={onFechar}>
      <ul className="divide-border/70 flex flex-col divide-y">
        {fin.tabelaAvulsos.map((t) => (
          <li key={t.id} className={cn('flex flex-wrap items-center gap-3 py-2 text-sm', !t.ativo && 'opacity-50')}>
            <span className="text-muted-foreground w-16 shrink-0 font-mono text-xs">{t.atividade_id}</span>
            <span className="min-w-0 grow basis-40">
              <span className="block">{t.nome}</span>
              <span className="text-muted-foreground block text-xs">
                {unidade[t.unidade]} · {t.exige_aceite ? 'exige aceite do cliente' : 'sem aceite (cláusula do contrato)'}
                {t.atividade_id === 'C2-23' && ' · fase 3 (depois)'}
              </span>
            </span>
            <span className="tabular-nums">{brl(t.valor_padrao)}</span>
            <Button size="icon-sm" variant="ghost" className="rounded-full" aria-label={`Editar ${t.nome}`} onClick={() => setEd({ id: t.id, atividade_id: t.atividade_id, nome: t.nome, valor: String(t.valor_padrao), unidade: t.unidade, exige_aceite: t.exige_aceite })}>
              <PencilSimpleIcon />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              className="text-destructive-text rounded-full"
              aria-label={`Excluir ${t.nome}`}
              onClick={async () => {
                if (!(await confirmar({ titulo: `Excluir ${t.nome} da tabela?`, descricao: 'Os avulsos já propostos não mudam.', acao: 'Excluir', perigo: true }))) return
                const antes = executar(() => repos.tabelaAvulsos.excluir(t.id))
                if (antes) executar(() => undefined, { sucesso: 'Preço excluído.', desfazer: () => repos.tabelaAvulsos.reverter(antes) })
              }}
            >
              <TrashIcon />
            </Button>
          </li>
        ))}
      </ul>
      <Button type="button" variant="outline" className="w-fit rounded-full" onClick={() => setEd({ atividade_id: '', nome: '', valor: '', unidade: 'ocorrencia', exige_aceite: true })}>
        <PlusIcon /> Preço
      </Button>
      {ed && (
        <div className="bg-sunken/50 flex flex-col gap-3 rounded-lg p-3">
          <div className="grid grid-cols-[7rem_1fr] gap-3">
            <Campo rotulo="Atividade">{(id) => <CampoTexto id={id} valor={ed.atividade_id} onMudar={(v) => setEd({ ...ed, atividade_id: v.toUpperCase() })} placeholder="SOC-031" />}</Campo>
            <Campo rotulo="Nome">{(id) => <CampoTexto id={id} valor={ed.nome} onMudar={(v) => setEd({ ...ed, nome: v })} />}</Campo>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Campo rotulo="Preço (R$)">{(id) => <CampoTexto id={id} valor={ed.valor} onMudar={(v) => setEd({ ...ed, valor: v })} />}</Campo>
            <Campo rotulo="Unidade">{(id) => <CampoEscolha id={id} valor={ed.unidade} onMudar={(v) => setEd({ ...ed, unidade: v })} opcoes={(Object.keys(unidade) as (keyof typeof unidade)[]).map((x) => ({ valor: x, rotulo: unidade[x] }))} />}</Campo>
          </div>
          <Interruptor ligado={ed.exige_aceite} onMudar={(v) => setEd({ ...ed, exige_aceite: v })} rotulo="Exige aceite do cliente" />
          <span className="flex gap-2">
            <Button
              type="button"
              className="rounded-full"
              disabled={!ed.nome.trim() || numero(ed.valor) <= 0 || !ed.atividade_id.trim()}
              onClick={() => {
                const dados = { atividade_id: ed.atividade_id, nome: ed.nome.trim(), valor_padrao: numero(ed.valor), unidade: ed.unidade, exige_aceite: ed.exige_aceite, ativo: true }
                const ok = executar(() => (ed.id ? repos.tabelaAvulsos.atualizar(ed.id, dados) : repos.tabelaAvulsos.criar(dados)), { sucesso: 'Tabela de avulsos salva.' })
                if (ok) setEd(null)
              }}
            >
              Salvar preço
            </Button>
            <Button type="button" variant="ghost" className="rounded-full" onClick={() => setEd(null)}>
              Cancelar
            </Button>
          </span>
        </div>
      )}
    </GavetaFormulario>
  )
}

const origensImportacao = ['Conexa', 'Omie', 'Conta Azul', 'Nibo', 'Domínio Honorários', 'Planilha (modelo)'] as const

/**
 * S07-A51 · Trazer o financeiro atual (FIN-014, FIN-601 a 603): origem,
 * arquivos, conferência de paridade e data de virada. No escritório sem
 * contratos (Horizonte), a importação cria os contratos de verdade.
 */
export function ImportarFinanceiro({ onFechar }: Fechar) {
  const fin = useFin()
  const executar = useAcao()
  const loja = useLoja()
  const passos = ['Origem', 'Arquivos', 'Conferir', 'Virada']
  const [passo, setPasso] = useState(0)
  const [origem, setOrigem] = useState<string>(origensImportacao[0])
  const [leitura, setLeitura] = useState<{ s: 'nao' | 'lendo' | 'ok' | 'erro'; erro?: string; fonte?: string }>({ s: 'nao' })
  const [virada, setVirada] = useState(PROXIMA_COMPETENCIA)
  const ultimo = passo === passos.length - 1
  const semContrato = fin.semContrato.filter((c) => c.tipo !== 'pf' || true)
  const propostos = semContrato.map((c, i) => ({ cliente: c, valor: [1480, 2950, 650, 980, 1200][i % 5], dia: 10 }))
  const ler = async () => {
    setLeitura({ s: 'lendo' })
    try {
      const r = await servicos.importacaoFinanceiro.ler(origem)
      setLeitura({ s: 'ok', fonte: r.fonte })
    } catch (e) {
      setLeitura({ s: 'erro', erro: e instanceof Error ? e.message : String(e) })
    }
  }
  const concluir = () => {
    let n = 0
    for (const p of propostos) {
      const c = executar(() =>
        repos.contratosHonorarios.criar({ cliente_id: p.cliente.id, numero: `CT-${p.cliente.codigo}`, versao: 1, vigente_de: virada, situacao: 'ativo', dia_vencimento: p.dia, meio_pagamento: 'boleto', indice: 'IPCA', data_base: Number(virada.slice(5, 7)), politica_13o: 'dezembro', retencoes: [], centro_custo_id: 'cc-contabil', extras: { importado_de: origem } }, { texto: `Contrato de ${p.cliente.nome} importado de ${origem}` }),
      )
      if (!c) continue
      executar(() => repos.itensContrato.criar({ contrato_id: c.id, servico: 'contabil', descricao: p.cliente.tipo === 'pf' ? 'IRPF e carnê-leão' : 'Contabilidade, fiscal e folha', setor_id: tabServicos.contabil.setor, valor: p.valor, tipo_cobranca: 'fixo', vigente_de: virada }))
      n++
    }
    if (fin.politica) executar(() => repos.politicasFinanceiras.atualizar(fin.politica!.id, { importacao: { origem, virada, paridade: n ? `${n} contratos importados; em aberto na origem = aqui` : 'sem diferença', concluida: true } }, { texto: `Financeiro trazido de ${origem}: virada em ${rotuloCompetencia(virada)}` }))
    loja.toast(n ? `${n} contratos trazidos de ${origem}. As cobranças saem daqui a partir de ${rotuloCompetencia(virada)}.` : `Paridade com ${origem} conferida. Virada agendada para ${rotuloCompetencia(virada)}.`, { modulo: 'financeiro', aba: 'contratos' }, 'Ver contratos')
    onFechar()
  }
  return (
    <GavetaFormulario
      aberta
      largura="lg"
      onFechar={onFechar}
      titulo="Trazer o financeiro atual"
      descricao="Contratos, cobranças em aberto, histórico e autorizações de débito. Nada é cobrado em dobro: as recorrências da origem são encerradas na data da virada."
      acao={ultimo ? 'Agendar virada' : 'Continuar'}
      acaoDesabilitada={passo === 1 && leitura.s !== 'ok'}
      onAcao={() => (ultimo ? concluir() : setPasso((p) => p + 1))}
      secundaria={
        passo > 0 ? (
          <Button type="button" variant="ghost" className="rounded-full" onClick={() => setPasso((p) => p - 1)}>
            Voltar
          </Button>
        ) : undefined
      }
    >
      <Passos passos={passos} atual={passo} />
      {passo === 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {origensImportacao.map((o) => (
            <button key={o} type="button" aria-pressed={origem === o} onClick={() => setOrigem(o)} className={cn('cursor-pointer rounded-lg px-3 py-3 text-left text-sm', origem === o ? 'bg-raised shadow-cartao ring-foreground/30 ring-2' : 'bg-sunken/60')}>
              {o}
            </button>
          ))}
        </div>
      )}
      {passo === 1 && (
        <div className="flex flex-col gap-3 text-sm">
          <p className="text-muted-foreground">{origem.startsWith('Planilha') ? 'Baixe o modelo, preencha e envie.' : `No ${origem}, exporte "clientes", "contratos ou vendas recorrentes" e "contas a receber" em CSV ou Excel.`}</p>
          <Button type="button" variant="outline" className="w-fit rounded-full" disabled={leitura.s === 'lendo'} onClick={ler}>
            <FileArrowUpIcon /> {leitura.s === 'ok' ? '3 arquivos lidos' : leitura.s === 'lendo' ? 'Lendo…' : 'Enviar arquivos'}
          </Button>
          {leitura.s === 'erro' && <EstadoErro titulo="Não consegui ler os arquivos" descricao={leitura.erro} onTentar={ler} />}
          {leitura.s === 'ok' && <SeloDemonstracao fonte={leitura.fonte} />}
        </div>
      )}
      {passo === 2 && (
        <ul className="flex flex-col gap-2 text-sm">
          <li className="flex items-center gap-2">
            <CheckCircleIcon className="text-success size-4" weight="fill" /> {fin.clientes.length} clientes casados pelo CNPJ ou CPF
          </li>
          {propostos.length ? (
            propostos.map((p) => (
              <li key={p.cliente.id} className="flex items-center gap-2">
                <CheckCircleIcon className="text-success size-4" weight="fill" /> {p.cliente.nome}: {brl(p.valor)}/mês, vence dia {p.dia}
              </li>
            ))
          ) : (
            <li className="flex items-center gap-2">
              <CheckCircleIcon className="text-success size-4" weight="fill" /> Todos os clientes já têm contrato aqui: só a paridade
            </li>
          )}
          <li className="flex items-center gap-2">
            <WarningIcon className="text-warning size-4" weight="fill" /> Em aberto na origem e aqui: iguais (paridade conferida)
          </li>
        </ul>
      )}
      {passo === 3 && (
        <>
          <Campo rotulo="Competência da virada" ajuda="Daí em diante, as cobranças saem daqui. Os títulos já emitidos na origem seguem lá até a baixa.">
            {(id) => <CampoEscolha id={id} valor={virada} onMudar={setVirada} opcoes={['2026-12', '2027-01', '2027-02'].map((x) => ({ valor: x, rotulo: rotuloCompetencia(x) }))} />}
          </Campo>
          <p className="bg-sunken/60 rounded-lg px-3 py-2.5 text-sm">Na véspera, o integrante Financeiro prepara a lista de recorrências a encerrar no {origem}; você confirma e ele encerra.</p>
        </>
      )}
    </GavetaFormulario>
  )
}

/** S07-A11 · Exportar: CSV (arquivo de verdade, gerado no navegador) ou PDF (impressão). */
export function ExportarFin({ onFechar, inicial = 'contratos' }: Fechar & { inicial?: string }) {
  const fin = useFin()
  const [o, setO] = useState(inicial)
  const [formato, setFormato] = useState<'csv' | 'pdf'>('csv')
  const [pronto, setPronto] = useState<string | null>(null)
  const tabela = (): string[][] => {
    if (o === 'faturas') return [['Fatura', 'Cliente', 'Competência', 'Valor', 'Vencimento', 'Situação', 'Meio'], ...fin.cobrancas.map((c) => [c.numero, fin.nomeCliente(c.cliente_id), rotuloCompetencia(c.competencia), c.valor.toFixed(2).replace('.', ','), dataCurta(c.vencimento), rotuloSituacao[fin.situacao(c)], rotuloMeio[c.meio]])]
    if (o === 'pagar') return [['Fornecedor', 'Categoria', 'Valor', 'Vencimento', 'Situação', 'Aprovado por'], ...fin.contasPagar.map((c) => [c.fornecedor, c.categoria, c.valor.toFixed(2).replace('.', ','), dataCurta(c.vencimento), c.situacao, c.aprovador_nome ?? ''])]
    if (o === 'extrato') return [['Data', 'Conta', 'Descrição', 'Valor', 'Categoria', 'Situação'], ...fin.lancamentos.map((l) => [dataCurta(l.data), fin.contasBancarias.find((c) => c.id === l.conta_id)?.nome ?? '', l.descricao_extrato, l.valor.toFixed(2).replace('.', ','), l.categoria ?? l.sugestao ?? '', l.situacao])]
    return [['Contrato', 'Cliente', 'Versão', 'Desde', 'Itens', 'Total', 'Vencimento', 'Meio', 'Índice'], ...fin.contratos.map((c) => [c.numero, c.cliente, String(c.versao), rotuloCompetencia(c.vigente_de), c.itens.map((i) => `${i.descricao} ${i.valor}`).join(' | '), c.total.toFixed(2).replace('.', ','), `dia ${c.dia_vencimento}`, rotuloMeio[c.meio_pagamento], c.indice])]
  }
  const gerar = () => {
    const linhas = tabela()
    const nome = `financeiro-${o}.${formato}`
    if (formato === 'csv') {
      const csv = linhas.map((l) => l.map((x) => `"${x.replace(/"/g, '""')}"`).join(';')).join('\n')
      const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' }))
      const a = document.createElement('a')
      a.href = url
      a.download = nome
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 2000)
    } else {
      const w = window.open('', '_blank')
      if (w) {
        w.document.write(`<!doctype html><meta charset="utf-8"><title>${nome}</title><body style="font-family:sans-serif"><h1>Financeiro · ${o}</h1><table border="1" cellpadding="4" style="border-collapse:collapse">${linhas.map((l, i) => `<tr>${l.map((x) => (i ? `<td>${x}</td>` : `<th>${x}</th>`)).join('')}</tr>`).join('')}</table></body>`)
        w.document.close()
        w.print()
      }
    }
    setPronto(`${nome} · ${linhas.length - 1} linhas`)
  }
  return (
    <GavetaFormulario aberta onFechar={onFechar} titulo="Exportar" descricao="Sai o que está no banco agora, com o mesmo filtro de permissão da tela." acao={pronto ? 'Fechar' : 'Gerar arquivo'} onAcao={() => (pronto ? onFechar() : gerar())}>
      <Campo rotulo="O quê">
        {(id) => (
          <CampoEscolha
            id={id}
            valor={o}
            onMudar={(v) => {
              setO(v)
              setPronto(null)
            }}
            opcoes={[
              { valor: 'contratos', rotulo: 'Contratos e itens' },
              { valor: 'faturas', rotulo: 'Faturas e situação' },
              { valor: 'pagar', rotulo: 'Contas a pagar' },
              { valor: 'extrato', rotulo: 'Extrato e conciliação' },
            ]}
          />
        )}
      </Campo>
      <Campo rotulo="Formato">
        {() => (
          <Segmentado
            rotulo="Formato"
            valor={formato}
            onMudar={(v) => {
              setFormato(v)
              setPronto(null)
            }}
            opcoes={[
              { valor: 'csv', rotulo: 'CSV' },
              { valor: 'pdf', rotulo: 'PDF (imprimir)' },
            ]}
          />
        )}
      </Campo>
      {pronto && (
        <p className="bg-success/10 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm">
          <DownloadSimpleIcon className="size-4" /> {pronto}
        </p>
      )}
      <Badge variant="outline">o arquivo sai do navegador; nada vai a servidor</Badge>
    </GavetaFormulario>
  )
}
