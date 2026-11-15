import { BankIcon, CheckCircleIcon, PlusIcon, ShieldWarningIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { useSessao } from '@/ambiente/sessao'
import { Carregando, EstadoErro, EstadoVazio, SeloDemonstracao, useAcao, useConfirmar, usePode } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Campo, CampoEscolha, CampoTexto, GavetaFormulario, Segmentado } from '@/components/ui/formulario'
import type { BpoContaBancaria, BpoFornecedor } from '@/nucleo/modelo/entidades'
import { repos } from '@/nucleo/repositorios'
import { ErroServico, servicos } from '@/servicos'
import { brl } from './comum'
import { agoraBpo, dataCurta, dataHora, diasAte, hojeBpo, quando, type EmpresaVista } from './dados'

const rotuloVia: Record<BpoContaBancaria['via'], string> = { open_finance: 'Open Finance', api_banco: 'API do banco', ofx: 'OFX', manual: 'lançado no ERP' }

/**
 * S08a · Bancos da empresa na ficha BPO (10, 3.4 e 3.12, `conexoes_bancarias`):
 * saldo lido, por onde, consentimento do Open Finance (renovar 30 dias antes)
 * e desconectar. Só leitura de extrato e saldo; senha de banco nunca.
 */
export function BancosEmpresa({ e, onConectar }: { e: EmpresaVista; onConectar: () => void }) {
  const pode = usePode('banco.conectar', { cliente_id: e.clienteId })
  const executar = useAcao()
  const confirmar = useConfirmar()
  const [estado, setEstado] = useState<{ id?: string; erro?: string; fonte?: string }>({})
  const renovar = async (b: BpoContaBancaria) => {
    setEstado({ id: b.id })
    try {
      const r = await servicos.openFinance.conectar(b.nome.replace(/ \(.*\)$/, ''), '')
      const [d, m, a] = r.dados.expira_em.split('/')
      executar(() => repos.bpo.bancos.atualizar(b.id, { consentimento_ate: a ? `${a}-${m}-${d}` : null, saldo_em: agoraBpo() }, { texto: `Renovou o consentimento do ${b.nome} de ${e.nome} (Open Finance)` }), { sucesso: `Consentimento do ${b.nome} renovado por um ano` })
      setEstado({ fonte: r.fonte })
    } catch (err) {
      setEstado({ id: b.id, erro: err instanceof ErroServico ? err.message : 'O banco não respondeu.' })
    }
  }
  const desconectar = async (b: BpoContaBancaria) => {
    const r = await confirmar({ titulo: `Desconectar ${b.nome}?`, descricao: 'O escritório para de ler o extrato e o saldo desta conta. A conta continua do cliente; a conexão fica no histórico.', acao: 'Desconectar', perigo: true })
    if (r) executar(() => repos.bpo.bancos.arquivar(b.id, { texto: `Desconectou ${b.nome} de ${e.nome}` }), { sucesso: `${b.nome} desconectado` })
  }
  return (
    <div className="flex flex-col gap-2">
      {e.bancos.length === 0 ? (
        <EstadoVazio compacto icone={BankIcon} titulo="Nenhuma conta conectada" descricao="O cliente autoriza no banco dele, por Open Finance; só leitura de extrato e saldo." />
      ) : (
        <ul className="divide-border/70 flex flex-col divide-y" aria-label="Contas bancárias da empresa">
          {e.bancos.map((b) => {
            const vence = b.consentimento_ate ? diasAte(b.consentimento_ate) : null
            return (
              <li key={b.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm">
                <BankIcon className="text-muted-foreground size-4 shrink-0" />
                <span className="min-w-0 flex-1 basis-40">
                  <span className="block truncate">{b.nome}</span>
                  <span className="text-muted-foreground block text-xs">
                    {rotuloVia[b.via]} · saldo lido {dataHora(b.saldo_em)}
                    {b.consentimento_ate && ` · consentimento até ${dataCurta(b.consentimento_ate)}`}
                  </span>
                </span>
                <span className="tabular-nums">{brl(b.saldo)}</span>
                {vence !== null && vence <= 30 && <Badge variant="destaque">vence {quando(b.consentimento_ate)}</Badge>}
                {pode && (
                  <span className="flex gap-1">
                    {b.via === 'open_finance' && (
                      <Button size="sm" variant="ghost" className="rounded-full" disabled={estado.id === b.id && !estado.erro} onClick={() => void renovar(b)}>
                        Renovar
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="text-destructive-text rounded-full" onClick={() => void desconectar(b)}>
                      Desconectar
                    </Button>
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      )}
      {estado.id && !estado.erro && <Carregando rotulo="Esperando o consentimento no banco" linhas={1} />}
      {estado.erro && <EstadoErro titulo="O banco não respondeu" descricao={estado.erro} onTentar={() => void renovar(e.bancos.find((b) => b.id === estado.id)!)} />}
      <div className="flex flex-wrap items-center gap-2">
        {pode && (
          <Button size="sm" variant="outline" className="rounded-full" onClick={onConectar}>
            <PlusIcon /> Conectar banco por Open Finance
          </Button>
        )}
        {estado.fonte && <SeloDemonstracao fonte={estado.fonte} />}
      </div>
    </div>
  )
}

const rotuloRisco: Record<BpoFornecedor['risco'], string> = { recorrente: 'confirmado', novo: 'novo · a confirmar', alterado: 'dados alterados · a confirmar' }
const canais = ['Telefone já conhecido do cadastro', 'E-mail do cadastro (não o do boleto)', 'Presencial ou documento assinado']

/**
 * S08a · Fornecedores da empresa (10, 3.12 e 3.13): dados bancários só valem
 * confirmados por segundo canal, por uma pessoa (o integrante lista e alerta,
 * nunca confirma nem altera dado bancário). Passo 6 da implantação.
 */
export function FornecedoresEmpresa({ e }: { e: EmpresaVista }) {
  const executar = useAcao()
  const { usuario } = useSessao()
  const podeConfirmar = usePode('fornecedor.alterar_dados_bancarios', { cliente_id: e.clienteId })
  const podeCriar = usePode('fornecedor.criar', { cliente_id: e.clienteId })
  const [filtro, setFiltro] = useState<'todos' | 'confirmar'>('todos')
  const [confirmando, setConfirmando] = useState<BpoFornecedor | null>(null)
  const [novo, setNovo] = useState(false)
  const lista = e.fornecedores.filter((f) => filtro === 'todos' || !f.dados_bancarios_confirmados_em || f.risco !== 'recorrente')
  const aConfirmar = e.fornecedores.filter((f) => !f.dados_bancarios_confirmados_em || f.risco !== 'recorrente').length
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Segmentado
          rotulo="Filtrar fornecedores"
          valor={filtro}
          onMudar={setFiltro}
          opcoes={[
            { valor: 'todos', rotulo: `Todos (${e.fornecedores.length})` },
            { valor: 'confirmar', rotulo: `A confirmar (${aConfirmar})` },
          ]}
        />
        {podeCriar && (
          <Button size="sm" variant="ghost" className="ml-auto rounded-full" onClick={() => setNovo(true)}>
            <PlusIcon /> Fornecedor
          </Button>
        )}
      </div>
      {lista.length === 0 ? (
        <p className="text-muted-foreground py-2 text-sm">{e.fornecedores.length ? 'Todos confirmados por segundo canal.' : 'Nenhum fornecedor ainda. Na implantação, o Contas a Pagar lista os recorrentes do ERP.'}</p>
      ) : (
        <ul className="divide-border/70 flex flex-col divide-y" aria-label="Fornecedores da empresa">
          {lista.map((f) => {
            const ok = f.risco === 'recorrente' && !!f.dados_bancarios_confirmados_em
            return (
              <li key={f.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm">
                {ok ? <CheckCircleIcon weight="fill" className="text-success size-4 shrink-0" /> : <ShieldWarningIcon weight="fill" className="text-warning size-4 shrink-0" />}
                <span className="min-w-0 flex-1 basis-48">
                  <span className="block truncate">{f.nome}</span>
                  <span className="text-muted-foreground block truncate text-xs">
                    {f.banco ?? 'dados bancários não informados'}
                    {ok && f.confirmado_por && ` · confirmado por ${f.confirmado_por} (${f.canal_confirmacao ?? 'segundo canal'}) em ${dataCurta(f.dados_bancarios_confirmados_em)}`}
                  </span>
                </span>
                <Badge variant={ok ? 'sucesso' : 'destaque'}>{ok ? rotuloRisco.recorrente : rotuloRisco[f.risco]}</Badge>
                {!ok && podeConfirmar && (
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => setConfirmando(f)} aria-label={`Confirmar os dados bancários de ${f.nome}`}>
                    Confirmar
                  </Button>
                )}
              </li>
            )
          })}
        </ul>
      )}
      {confirmando && <ConfirmarFornecedor f={confirmando} e={e} quem={usuario.nome} onFechar={() => setConfirmando(null)} executar={executar} />}
      <NovoFornecedor aberta={novo} e={e} onFechar={() => setNovo(false)} executar={executar} />
    </div>
  )
}

function ConfirmarFornecedor({ f, e, quem, onFechar, executar }: { f: BpoFornecedor; e: EmpresaVista; quem: string; onFechar: () => void; executar: ReturnType<typeof useAcao> }) {
  const [r, setR] = useState({ canal: canais[0], contato: '', banco: f.banco && !/a confirmar|espelho|boleto/.test(f.banco) ? f.banco : '' })
  const erroContato = !r.contato.trim() ? 'Diga com quem falou no fornecedor.' : undefined
  const erroBanco = r.banco.trim().length < 6 ? 'Informe banco, agência e conta conferidos.' : undefined
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo={`Confirmar ${f.nome}`}
      descricao="Confirmação por segundo canal, nunca pelo contato que veio no boleto ou na mensagem (troca de conta é a fraude mais comum)."
      acao="Confirmar os dados"
      acaoDesabilitada={!!erroContato || !!erroBanco}
      onAcao={() => {
        const ok = executar(
          () => repos.bpo.fornecedores.atualizar(f.id, { risco: 'recorrente', banco: r.banco.trim(), dados_bancarios_confirmados_em: hojeBpo, confirmado_por: quem, canal_confirmacao: r.canal }, { texto: `${quem} confirmou os dados bancários de ${f.nome} (${e.nome}) por ${r.canal.toLowerCase()}, com ${r.contato.trim()}` }),
          { sucesso: `${f.nome} confirmado` },
        )
        if (ok) onFechar()
      }}
    >
      <Campo rotulo="Canal da confirmação">{(id) => <CampoEscolha id={id} valor={r.canal} onMudar={(v) => setR((s) => ({ ...s, canal: v }))} opcoes={canais.map((c) => ({ valor: c, rotulo: c }))} />}</Campo>
      <Campo rotulo="Com quem falou no fornecedor" erro={erroContato}>
        {(id) => <CampoTexto id={id} valor={r.contato} onMudar={(v) => setR((s) => ({ ...s, contato: v }))} placeholder="Nome e cargo" />}
      </Campo>
      <Campo rotulo="Banco, agência e conta conferidos" erro={erroBanco}>
        {(id) => <CampoTexto id={id} mono valor={r.banco} onMudar={(v) => setR((s) => ({ ...s, banco: v }))} placeholder="Itaú 0001 / 12345-6" />}
      </Campo>
    </GavetaFormulario>
  )
}

function NovoFornecedor({ aberta, e, onFechar, executar }: { aberta: boolean; e: EmpresaVista; onFechar: () => void; executar: ReturnType<typeof useAcao> }) {
  const [r, setR] = useState({ nome: '', documento: '' })
  const erroNome = !r.nome.trim() ? 'Informe o nome.' : e.fornecedores.some((f) => f.nome.toLowerCase() === r.nome.trim().toLowerCase()) ? 'Já existe um fornecedor com esse nome.' : undefined
  return (
    <GavetaFormulario
      aberta={aberta}
      onFechar={onFechar}
      titulo="Novo fornecedor"
      descricao="Entra como novo, sem dados bancários: a primeira conta dele sobe de faixa e os dados só valem confirmados por segundo canal."
      acao="Cadastrar"
      acaoDesabilitada={!!erroNome}
      onAcao={() => {
        const ok = executar(() => repos.bpo.fornecedores.criar({ cliente_id: e.clienteId, nome: r.nome.trim(), documento: r.documento.trim() || undefined, risco: 'novo', banco: 'a confirmar por segundo canal' }, { texto: `Cadastrou o fornecedor ${r.nome.trim()} de ${e.nome}` }), { sucesso: `${r.nome.trim()} cadastrado: confirme os dados bancários` })
        if (ok) {
          setR({ nome: '', documento: '' })
          onFechar()
        }
      }}
    >
      <Campo rotulo="Nome do fornecedor" erro={erroNome}>
        {(id) => <CampoTexto id={id} valor={r.nome} onMudar={(v) => setR((s) => ({ ...s, nome: v }))} />}
      </Campo>
      <Campo rotulo="CNPJ ou CPF (opcional)">{(id) => <CampoTexto id={id} mono valor={r.documento} onMudar={(v) => setR((s) => ({ ...s, documento: v }))} />}</Campo>
    </GavetaFormulario>
  )
}
