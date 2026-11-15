import { FlaskIcon, UsersThreeIcon, WarningIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { useLoja, usePersistente } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { BarraUso, Caixa, TituloBloco } from '@/components/compostos/blocos'
import { usePode } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Campo, CampoEscolha, CampoTexto, GavetaFormulario, Interruptor } from '@/components/ui/formulario'
import { cn } from '@/lib/utils'
import { registrar } from '@/nucleo/repositorios'
import { reais } from './comum-s09'

/**
 * Blocos novos de Configurações › Integrantes (S09-T06): liberação no
 * atendimento (D-33, começa vazia, com amostragem GES-062), clientes-piloto
 * (D-31), modo simulação (D-30) e o teto de gasto que cai para uma pessoa
 * sem deixar o cliente mudo (D-32).
 */

interface Categoria {
  id: string
  nome: string
  exemplo: string
  ligada: boolean
  amostragem: number
}

const categoriasIniciais: Categoria[] = [
  { id: 'segunda_via', nome: 'Segunda via de guia já emitida', exemplo: '“Pode mandar o DAS de novo?”', ligada: false, amostragem: 20 },
  { id: 'status', nome: 'Andamento de um serviço', exemplo: '“Como está a alteração contratual?”', ligada: false, amostragem: 20 },
  { id: 'pendencia', nome: 'Lembrete de documento pendente', exemplo: '“Faltam os extratos de outubro.”', ligada: false, amostragem: 10 },
  { id: 'horario', nome: 'Horário, endereço e contatos do escritório', exemplo: '“Vocês abrem sábado?”', ligada: false, amostragem: 5 },
  { id: 'prazo', nome: 'Prazo de obrigação já calculado', exemplo: '“Até quando pago o ISS?”', ligada: false, amostragem: 30 },
]

export function LiberacaoAtendimento() {
  const loja = useLoja()
  const { usuario } = useSessao()
  const pode = usePode('integrante.configurar')
  const [cats, setCats] = usePersistente<Categoria[]>('s09:int:categorias', categoriasIniciais)
  const [pilotos, setPilotos] = usePersistente<{ ligado: boolean; clientes: string[] }>('s09:int:pilotos', { ligado: true, clientes: [] })
  const [simulacao, setSimulacao] = usePersistente<boolean>('s09:int:simulacao', false)
  const [editandoPilotos, setEditandoPilotos] = useState(false)
  const nomes = pilotos.clientes.map((id) => loja.clientes.find((c) => c.id === id)?.nome).filter(Boolean)

  return (
    <>
      {simulacao && (
        <p className="bg-warning/15 flex items-center gap-2 rounded-lg px-3 py-2 text-sm" role="status">
          <FlaskIcon className="size-4 shrink-0" /> Modo simulação ligado: a equipe testa os integrantes sem gravar nada nem enviar ao cliente.
        </p>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        <Caixa>
          <TituloBloco descricao="Assuntos em que o integrante pode responder sozinho ao cliente. Começa vazio (D-33): tudo vira rascunho para uma pessoa até você liberar. Uma amostra das respostas volta para revisão (GES-062).">Liberação no atendimento</TituloBloco>
          <ul className="divide-border/70 flex flex-col divide-y">
            {cats.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-3 py-2.5">
                <span className="min-w-0 flex-1 basis-48 text-sm">
                  <span className="block">{c.nome}</span>
                  <span className="text-muted-foreground block text-xs">
                    {c.exemplo}
                    {c.ligada && ` · revisa ${c.amostragem}% por amostragem`}
                  </span>
                </span>
                {c.ligada && pode && (
                  <span className="w-28">
                    <CampoEscolha rotulo={`Amostragem de ${c.nome}`} valor={String(c.amostragem)} onMudar={(v) => setCats((xs) => xs.map((x) => (x.id === c.id ? { ...x, amostragem: Number(v) } : x)))} opcoes={['5', '10', '20', '30', '50', '100'].map((v) => ({ valor: v, rotulo: `${v}% revisado` }))} />
                  </span>
                )}
                <Interruptor
                  ocultarRotulo
                  rotulo={`Liberar ${c.nome}`}
                  ligado={c.ligada}
                  desabilitado={!pode}
                  onMudar={(v) => {
                    setCats((xs) => xs.map((x) => (x.id === c.id ? { ...x, ligada: v } : x)))
                    registrar(`${usuario.nome} ${v ? 'liberou' : 'tirou'} a resposta sozinha em “${c.nome}”`, 'integrante.configurar')
                    loja.toast(v ? `Liberado: o integrante responde sozinho sobre ${c.nome.toLowerCase()} (${c.amostragem}% revisado).` : `${c.nome}: volta a ser rascunho para uma pessoa.`)
                  }}
                />
              </li>
            ))}
          </ul>
        </Caixa>
        <div className="flex flex-col gap-4">
          <Caixa>
            <TituloBloco
              descricao="No começo, a IA só fala com cliente real desta lista (D-31). Os outros clientes recebem resposta de uma pessoa."
              acao={
                pode && (
                  <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setEditandoPilotos(true)}>
                    <UsersThreeIcon /> Escolher
                  </Button>
                )
              }
            >
              Clientes-piloto
            </TituloBloco>
            <Interruptor ligado={pilotos.ligado} desabilitado={!pode} onMudar={(v) => setPilotos({ ...pilotos, ligado: v })} rotulo="Só com os clientes-piloto" detalhe={pilotos.ligado ? (nomes.length ? nomes.join(', ') : 'nenhum escolhido: a IA não fala com cliente nenhum') : 'desligado: a IA fala com todos, dentro das categorias liberadas'} />
          </Caixa>
          <Caixa>
            <TituloBloco descricao="Para treinar a equipe: os integrantes respondem e preparam, mas nada é gravado nem enviado (D-30).">Modo simulação</TituloBloco>
            <Interruptor
              ligado={simulacao}
              desabilitado={!pode}
              onMudar={(v) => {
                setSimulacao(v)
                registrar(`${usuario.nome} ${v ? 'ligou' : 'desligou'} o modo simulação dos integrantes`, 'integrante.configurar')
                loja.toast(v ? 'Modo simulação ligado para a equipe.' : 'Modo simulação desligado: os integrantes voltam a gravar e preparar envios.')
              }}
              rotulo="Ligar o modo simulação"
              detalhe="Cada tela mostra uma faixa “simulação” enquanto estiver ligado."
            />
          </Caixa>
        </div>
      </div>
      {editandoPilotos && (
        <GavetaFormulario aberta onFechar={() => setEditandoPilotos(false)} titulo="Clientes-piloto" descricao="Escolha os clientes com quem a IA pode falar no começo." acao="Salvar" onAcao={() => setEditandoPilotos(false)}>
          <div className="flex flex-wrap gap-1.5">
            {loja.clientes.map((c) => {
              const on = pilotos.clientes.includes(c.id)
              return (
                <button key={c.id} type="button" aria-pressed={on} onClick={() => setPilotos({ ...pilotos, clientes: on ? pilotos.clientes.filter((x) => x !== c.id) : [...pilotos.clientes, c.id] })} className={cn('cursor-pointer rounded-full border px-3 py-1 text-xs', on ? 'border-foreground/30 bg-raised font-medium' : 'text-muted-foreground')}>
                  {c.nome}
                </button>
              )
            })}
          </div>
        </GavetaFormulario>
      )}
    </>
  )
}

/** Teto de gasto do escritório (02, 11.2; D-32): ao chegar, o integrante para e a conversa do cliente cai para uma pessoa. */
export function TetoEscritorio() {
  const loja = useLoja()
  const { usuario } = useSessao()
  const pode = usePode('integrante.configurar')
  const [teto, setTeto] = usePersistente('s09:int:teto', { valor: 2400, gasto: 1612.4, caiParaPessoa: true, atingido: false })
  const [editando, setEditando] = useState(false)
  const [v, setV] = useState(String(teto.valor))
  const simular = () => {
    setTeto({ ...teto, gasto: teto.valor, atingido: true })
    loja.avisar({ para: [usuario.id], tipo: 'sistema', titulo: 'Teto de IA do escritório atingido', detalhe: teto.caiParaPessoa ? 'as conversas de clientes caíram para o responsável humano de cada setor' : 'os integrantes pararam até o próximo mês', destino: { modulo: 'config', aba: 'integrantes' } })
    loja.toast(teto.caiParaPessoa ? 'Teto atingido: nenhum cliente fica sem resposta, as conversas foram para as pessoas responsáveis.' : 'Teto atingido: os integrantes pararam.')
  }
  return (
    <Caixa>
      <TituloBloco
        descricao="O limite de gasto com IA do escritório no mês, por cima dos limites de cada pessoa."
        acao={
          pode && (
            <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setEditando(true)}>
              Editar
            </Button>
          )
        }
      >
        Teto do escritório
      </TituloBloco>
      <BarraUso rotulo="Gasto de IA no mês" usado={Math.round(teto.gasto)} total={teto.valor} />
      <p className="text-muted-foreground text-xs">
        {reais(teto.gasto)} de {reais(teto.valor)}
      </p>
      <Interruptor ligado={teto.caiParaPessoa} desabilitado={!pode} onMudar={(x) => setTeto({ ...teto, caiParaPessoa: x })} rotulo="Ao atingir, a conversa cai para uma pessoa" detalhe="O cliente nunca fica sem resposta: vai para o responsável do setor (D-32)." />
      {teto.atingido ? (
        <p className="text-warning flex items-center gap-1.5 text-sm">
          <WarningIcon className="size-4" /> Teto atingido.{' '}
          <button type="button" className="cursor-pointer underline" onClick={() => setTeto({ ...teto, gasto: 1612.4, atingido: false })}>
            Voltar ao normal
          </button>
        </p>
      ) : (
        pode && (
          <Button size="sm" variant="outline" className="w-fit rounded-full" onClick={simular}>
            Simular teto atingido
          </Button>
        )
      )}
      {editando && (
        <GavetaFormulario
          aberta
          onFechar={() => setEditando(false)}
          titulo="Teto de IA do escritório"
          descricao="Vale para o mês corrente; zera no dia 1º."
          acao="Salvar"
          acaoDesabilitada={!(Number(v) > 0)}
          onAcao={() => {
            setTeto({ ...teto, valor: Number(v) })
            setEditando(false)
          }}
        >
          <Campo rotulo="Teto em reais">{(id) => <CampoTexto id={id} valor={v} onMudar={setV} mono />}</Campo>
          <Badge variant="outline">gasto atual {reais(teto.gasto)}</Badge>
        </GavetaFormulario>
      )}
    </Caixa>
  )
}
