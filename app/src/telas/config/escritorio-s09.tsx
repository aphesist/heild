import { CalendarBlankIcon, PlusIcon, RocketLaunchIcon, TrashIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { useLoja, usePersistente } from '@/ambiente/loja'
import { Caixa, TituloBloco } from '@/components/compostos/blocos'
import { EstadoVazio, useConfirmar } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Campo, CampoEscolha, CampoTexto, GavetaFormulario, Interruptor } from '@/components/ui/formulario'
import { CHAVE_IMPLANTACAO, estadoImplantacaoInicial, passosImplantacao, type EstadoImplantacao } from '@/dados/implantacao'
import { useTelasCheias } from './telas-cheias'

/** Blocos novos de Configurações › Escritório (S09-T03) e a faixa da implantação (S09-T13). */

export function FaixaImplantacao() {
  const [e] = usePersistente<EstadoImplantacao>(CHAVE_IMPLANTACAO, estadoImplantacaoInicial)
  const { abrir } = useTelasCheias()
  if (e.concluida_em)
    return (
      <p className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
        <RocketLaunchIcon className="size-4" /> Implantação concluída em {new Date(e.concluida_em).toLocaleDateString('pt-BR')}.
        <button type="button" className="cursor-pointer underline-offset-2 hover:underline" onClick={() => abrir('implantacao')}>
          Rever os passos
        </button>
      </p>
    )
  return (
    <Caixa className="ring-warning/40 flex-row flex-wrap items-center ring-1">
      <RocketLaunchIcon className="size-6 shrink-0" />
      <span className="min-w-0 flex-1 basis-60">
        <span className="block text-sm font-medium">Implantação em andamento · {e.feitos.length} de {passosImplantacao.length} passos</span>
        <span className="text-muted-foreground block text-xs">Próximo: {passosImplantacao[e.atual]?.titulo}. O Assistente conduz; dá para pular e voltar.</span>
      </span>
      <Button className="rounded-full" onClick={() => abrir('implantacao')}>
        Continuar implantação
      </Button>
    </Caixa>
  )
}

interface Feriado {
  id: string
  data: string
  nome: string
  abrangencia: 'nacional' | 'estadual' | 'municipal' | 'escritorio'
}

const feriadosIniciais: Feriado[] = [
  { id: 'f1', data: '15/11/2026', nome: 'Proclamação da República', abrangencia: 'nacional' },
  { id: 'f2', data: '20/11/2026', nome: 'Dia da Consciência Negra', abrangencia: 'nacional' },
  { id: 'f3', data: '24/12/2026', nome: 'Véspera de Natal (meio expediente)', abrangencia: 'escritorio' },
  { id: 'f4', data: '25/12/2026', nome: 'Natal', abrangencia: 'nacional' },
  { id: 'f5', data: '25/01/2027', nome: 'Aniversário de São Paulo', abrangencia: 'municipal' },
]

/** Calendário do escritório (S09-T03): feriados e plantão, usados pelo CRM (fora de horário) e pelo calendário de tarefas. */
export function CalendarioEscritorio() {
  const loja = useLoja()
  const confirmar = useConfirmar()
  const [feriados, setFeriados] = usePersistente<Feriado[]>('s09:escritorio:feriados', feriadosIniciais)
  const [plantao, setPlantao] = usePersistente('s09:escritorio:plantao', { ligado: true, quem: 'Bruno Costa', horario: 'sábados, 9h às 12h' })
  const [novo, setNovo] = useState<Feriado | null>(null)
  const valido = novo && /^\d{2}\/\d{2}\/\d{4}$/.test(novo.data) && novo.nome.trim()
  return (
    <Caixa>
      <TituloBloco
        descricao="Feriados e plantão valem para o CRM (mensagem de fora do horário), para o calendário de tarefas e para os prazos internos."
        acao={
          <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setNovo({ id: '', data: '', nome: '', abrangencia: 'escritorio' })}>
            <PlusIcon /> Feriado
          </Button>
        }
      >
        Calendário do escritório
      </TituloBloco>
      {feriados.length === 0 ? (
        <EstadoVazio icone={CalendarBlankIcon} titulo="Sem feriados cadastrados" compacto />
      ) : (
        <ul className="divide-border/70 flex flex-col divide-y">
          {feriados.map((f) => (
            <li key={f.id} className="flex items-center gap-3 py-2 text-sm">
              <span className="w-24 shrink-0 tabular-nums">{f.data}</span>
              <span className="min-w-0 flex-1">{f.nome}</span>
              <Badge variant="outline">{f.abrangencia === 'escritorio' ? 'do escritório' : f.abrangencia}</Badge>
              <Button
                size="icon-sm"
                variant="ghost"
                className="rounded-full"
                aria-label={`Tirar ${f.nome}`}
                onClick={async () => {
                  if (!(await confirmar({ titulo: `Tirar ${f.nome}?`, descricao: 'O dia volta a contar como útil para prazos internos e para o CRM.', acao: 'Tirar', perigo: true }))) return
                  setFeriados((xs) => xs.filter((x) => x.id !== f.id))
                  loja.toastDesfazer(`${f.nome} tirado do calendário.`, () => setFeriados((xs) => [...xs, f]))
                }}
              >
                <TrashIcon />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <div className="border-t pt-3">
        <Interruptor ligado={plantao.ligado} onMudar={(v) => setPlantao({ ...plantao, ligado: v })} rotulo="Plantão" detalhe={`${plantao.quem} · ${plantao.horario}. No plantão, conversas novas vão para quem está de plantão.`} />
      </div>
      {novo && (
        <GavetaFormulario
          aberta
          onFechar={() => setNovo(null)}
          titulo="Novo feriado"
          descricao="Os feriados nacionais já vêm; acrescente os estaduais, municipais e os do escritório."
          acao="Adicionar"
          acaoDesabilitada={!valido}
          onAcao={() => {
            setFeriados((xs) => [...xs, { ...novo, id: `f${Date.now()}` }].sort((a, b) => a.data.split('/').reverse().join('').localeCompare(b.data.split('/').reverse().join(''))))
            setNovo(null)
          }}
        >
          <Campo rotulo="Data" ajuda="dd/mm/aaaa" erro={novo.data && !/^\d{2}\/\d{2}\/\d{4}$/.test(novo.data) ? 'Use dd/mm/aaaa.' : undefined}>
            {(id) => <CampoTexto id={id} valor={novo.data} onMudar={(v) => setNovo({ ...novo, data: v })} placeholder="02/02/2027" />}
          </Campo>
          <Campo rotulo="Nome">{(id) => <CampoTexto id={id} valor={novo.nome} onMudar={(v) => setNovo({ ...novo, nome: v })} />}</Campo>
          <Campo rotulo="Abrangência">
            {(id) => (
              <CampoEscolha
                id={id}
                valor={novo.abrangencia}
                onMudar={(v) => setNovo({ ...novo, abrangencia: v })}
                opcoes={[
                  { valor: 'nacional', rotulo: 'Nacional' },
                  { valor: 'estadual', rotulo: 'Estadual' },
                  { valor: 'municipal', rotulo: 'Municipal' },
                  { valor: 'escritorio', rotulo: 'Só do escritório' },
                ]}
              />
            )}
          </Campo>
        </GavetaFormulario>
      )}
    </Caixa>
  )
}

const servicosAtendidos = [
  { id: 'dp', rotulo: 'Trabalhista e DP', exemplo: 'eSocial, FGTS Digital, DCTFWeb da folha' },
  { id: 'contabil', rotulo: 'Contábil', exemplo: 'ECD, ECF, balancetes' },
  { id: 'notas', rotulo: 'Notas fiscais', exemplo: 'manifestação, escrituração de notas' },
  { id: 'fiscal_estadual', rotulo: 'Fiscal estadual', exemplo: 'GIA, SPED Fiscal, DeSTDA' },
  { id: 'societario', rotulo: 'Societário', exemplo: 'alterações, certidões, licenças' },
]

/** Setores que o escritório não atende (D-25): as obrigações deles somem das listas e do calendário. */
export function SetoresNaoAtendidos() {
  const loja = useLoja()
  const [nao, setNao] = usePersistente<string[]>('s09:escritorio:nao_atende', [])
  return (
    <Caixa>
      <TituloBloco descricao="Ex.: o escritório não faz folha. As obrigações desses serviços somem das listas, do calendário e dos lembretes (D-25). Desativar o setor inteiro é no bloco Setores.">Serviços que o escritório não atende</TituloBloco>
      <ul className="flex flex-col gap-2">
        {servicosAtendidos.map((s) => (
          <li key={s.id}>
            <Interruptor
              ligado={!nao.includes(s.id)}
              onMudar={(v) => {
                setNao((xs) => (v ? xs.filter((x) => x !== s.id) : [...xs, s.id]))
                loja.toast(v ? `${s.rotulo}: obrigações voltam a aparecer.` : `${s.rotulo}: obrigações escondidas (${s.exemplo}).`)
              }}
              rotulo={s.rotulo}
              detalhe={nao.includes(s.id) ? `não atende · ${s.exemplo} escondidos` : s.exemplo}
            />
          </li>
        ))}
      </ul>
    </Caixa>
  )
}
