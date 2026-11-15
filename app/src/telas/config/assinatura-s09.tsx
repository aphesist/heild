import { CheckIcon, PlusIcon, ScalesIcon, StorefrontIcon, SwatchesIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { useContas, useLoja, usePersistente } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { Caixa, TituloBloco } from '@/components/compostos/blocos'
import { useConfirmar } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Campo, CampoEscolha, CampoTexto, GavetaFormulario } from '@/components/ui/formulario'
import { registrar } from '@/nucleo/repositorios'
import { reais } from './comum-s09'
import { precoComplemento, useComplementos, type Complementos } from './marca-branca'

/**
 * Blocos novos de Configurações › Assinatura (S09-T10): pacotes de área com
 * o configurador do Jurídico (S11), complementos pagos (marca branca e app
 * na loja; o App do cliente vem incluído), planos de IA por pessoa (10, 6.3)
 * e o uso de IA nas janelas de 5 horas e de 7 dias.
 */

const rotuloComplemento: Record<keyof Complementos, { nome: string; descricao: string; Icone: typeof SwatchesIcon }> = {
  marca_branca: { nome: 'Marca branca', descricao: 'Logotipo, cores, domínio próprio, remetente de e-mail e app com a marca do escritório.', Icone: SwatchesIcon },
  app_loja: { nome: 'App na loja', descricao: 'O app do cliente publicado na App Store e no Google Play com o nome do escritório (exige marca branca).', Icone: StorefrontIcon },
}

export function Complementos() {
  const loja = useLoja()
  const { usuario } = useSessao()
  const confirmar = useConfirmar()
  const [c, setC] = useComplementos()
  const alternar = async (k: keyof Complementos) => {
    const ligar = !c[k]
    if (k === 'app_loja' && ligar && !c.marca_branca) return loja.toastErro('O app na loja precisa da marca branca: adicione ela antes.')
    const ok = await confirmar({
      titulo: ligar ? `Adicionar ${rotuloComplemento[k].nome}?` : `Remover ${rotuloComplemento[k].nome}?`,
      descricao: ligar ? `${precoComplemento[k]}, proporcional a partir de hoje na próxima fatura.` : k === 'marca_branca' ? 'O sistema e o app voltam para a identidade da plataforma no fim do ciclo. As versões do seu tema ficam guardadas.' : 'O app sai das lojas no fim do ciclo; os clientes continuam pelo navegador.',
      acao: ligar ? 'Adicionar' : 'Remover',
      perigo: !ligar,
    })
    if (!ok) return
    setC({ ...c, [k]: ligar, ...(k === 'marca_branca' && !ligar ? { app_loja: false } : {}) })
    registrar(`${usuario.nome} ${ligar ? 'adicionou' : 'removeu'} o complemento ${rotuloComplemento[k].nome}`, 'assinatura.alterar')
    loja.toast(ligar ? `${rotuloComplemento[k].nome} adicionado.` : `${rotuloComplemento[k].nome} removido no fim do ciclo.`)
  }
  return (
    <Caixa>
      <TituloBloco descricao="O App do cliente vem incluído em todo plano. A marca branca é complemento pago (Estudo de precificação, 7/11).">Complementos</TituloBloco>
      <ul className="divide-border/70 flex flex-col divide-y">
        <li className="flex items-center gap-3 py-2.5">
          <span className="bg-success/15 flex size-6 shrink-0 items-center justify-center rounded-full">
            <CheckIcon weight="bold" className="text-success size-3.5" />
          </span>
          <span className="min-w-0 flex-1 text-sm">
            <span className="block">App do cliente</span>
            <span className="text-muted-foreground block text-xs">Documentos, guias, pendências, pedidos e conversa com o escritório.</span>
          </span>
          <Badge variant="sucesso">incluído no plano</Badge>
        </li>
        {(Object.keys(rotuloComplemento) as (keyof Complementos)[]).map((k) => {
          const { nome, descricao, Icone } = rotuloComplemento[k]
          return (
            <li key={k} data-complemento={k} className="flex flex-wrap items-center gap-3 py-2.5">
              <Icone className="text-muted-foreground size-6 shrink-0" weight="duotone" />
              <span className="min-w-0 flex-1 basis-56 text-sm">
                <span className="block">
                  {nome} <span className="text-muted-foreground text-xs">· {precoComplemento[k]}</span>
                </span>
                <span className="text-muted-foreground block text-xs">{descricao}</span>
              </span>
              {c[k] ? <Badge variant="sucesso">contratado</Badge> : <Badge variant="outline">não contratado</Badge>}
              <Button size="sm" variant={c[k] ? 'ghost' : 'outline'} className="rounded-full" onClick={() => void alternar(k)}>
                {c[k] ? 'Remover' : (
                  <>
                    <PlusIcon /> Adicionar
                  </>
                )}
              </Button>
            </li>
          )
        })}
      </ul>
    </Caixa>
  )
}

export function Pacotes() {
  const loja = useLoja()
  const [juridico, setJuridico] = usePersistente<{ contratado: boolean; advogados: number; processos: number } | null>('s09:assinatura:juridico', null)
  const [config, setConfig] = useState(false)
  return (
    <Caixa>
      <TituloBloco descricao="O pacote de área define o que o escritório faz; os módulos da plataforma valem para todos.">Pacotes de área</TituloBloco>
      <ul className="divide-border/70 flex flex-col divide-y text-sm">
        <li className="flex items-center gap-3 py-2.5">
          <span className="min-w-0 flex-1">
            Contábil <span className="text-muted-foreground block text-xs">Painel com as oito abas, obrigações, integrantes por setor</span>
          </span>
          <Badge variant={loja.estado.cenario === 'bpo_puro' ? 'outline' : 'sucesso'}>{loja.estado.cenario === 'bpo_puro' ? 'não contratado' : 'contratado'}</Badge>
        </li>
        <li className="flex items-center gap-3 py-2.5">
          <span className="min-w-0 flex-1">
            BPO Financeiro <span className="text-muted-foreground block text-xs">Liga e desliga em Módulos extras</span>
          </span>
          <Badge variant={loja.estado.bpoModulo ? 'sucesso' : 'outline'}>{loja.estado.bpoModulo ? 'contratado' : 'não contratado'}</Badge>
        </li>
        <li className="flex flex-wrap items-center gap-3 py-2.5">
          <ScalesIcon className="text-muted-foreground size-5" />
          <span className="min-w-0 grow basis-40">
            Jurídico <span className="text-muted-foreground block text-xs">{juridico?.contratado ? `${juridico.advogados} advogado(s) · até ${juridico.processos} processos` : 'Processos, prazos, intimações e peças (pacote posterior)'}</span>
          </span>
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => setConfig(true)}>
            Configurar preço
          </Button>
        </li>
      </ul>
      {config && <ConfiguradorJuridico inicial={juridico} onFechar={() => setConfig(false)} onSalvar={(j) => (setJuridico(j), setConfig(false), loja.toast(j.contratado ? 'Pacote Jurídico adicionado à proposta da assinatura.' : 'Simulação guardada.'))} />}
    </Caixa>
  )
}

/** Configurador de preço do Jurídico (S09-A78; JU-12, 3). Esboço: a equação completa é da S11. */
function ConfiguradorJuridico({ inicial, onFechar, onSalvar }: { inicial: { contratado: boolean; advogados: number; processos: number } | null; onFechar: () => void; onSalvar: (j: { contratado: boolean; advogados: number; processos: number }) => void }) {
  const [adv, setAdv] = useState(String(inicial?.advogados ?? 3))
  const [proc, setProc] = useState(String(inicial?.processos ?? 300))
  const a = Math.max(0, Number(adv) || 0)
  const p = Math.max(0, Number(proc) || 0)
  const preco = 490 + a * 89 + Math.ceil(p / 100) * 60
  return (
    <GavetaFormulario aberta onFechar={onFechar} titulo="Configurador do Jurídico" descricao="Base + por advogado + por faixa de 100 processos monitorados. Valores de demonstração; a equação final é a do JU-12." acao="Adicionar à assinatura" acaoDesabilitada={a < 1} onAcao={() => onSalvar({ contratado: true, advogados: a, processos: p })}>
      <Campo rotulo="Advogados">{(id) => <CampoTexto id={id} valor={adv} onMudar={setAdv} mono />}</Campo>
      <Campo rotulo="Processos monitorados">{(id) => <CampoTexto id={id} valor={proc} onMudar={setProc} mono />}</Campo>
      <p className="text-sm">
        Preço estimado: <strong className="font-medium">{reais(preco)}/mês</strong>
      </p>
    </GavetaFormulario>
  )
}

const planosIa = [
  { id: 'basico', nome: 'Básico', janela5h: 40, janela7d: 400 },
  { id: 'padrao', nome: 'Padrão', janela5h: 100, janela7d: 1000 },
  { id: 'avancado', nome: 'Avançado', janela5h: 250, janela7d: 2500 },
]

/** Planos de IA por pessoa (10, 6.3): o plano é do usuário; o uso aparece em janelas de 5 horas e de 7 dias. */
export function PlanosIa() {
  const loja = useLoja()
  const contas = useContas().filter((u) => u.situacao === 'ativo')
  const [planos, setPlanos] = usePersistente<Record<string, string>>('s09:assinatura:planos_ia', {})
  const planoDe = (id: string, papel: string) => planos[id] ?? (papel === 'administrador' ? 'avancado' : papel === 'gestor' ? 'padrao' : 'basico')
  return (
    <Caixa>
      <TituloBloco descricao="Cada pessoa tem o seu plano de IA. A pessoa vê só a % do próprio limite; aqui o Administrador vê o uso nas janelas de 5 horas e de 7 dias.">Planos de IA por pessoa</TituloBloco>
      <ul className="divide-border/70 flex flex-col divide-y">
        {contas.map((u, i) => {
          const pl = planosIa.find((p) => p.id === planoDe(u.id, u.papel))!
          const uso5 = Math.round(pl.janela5h * (((i * 37) % 90) + 5) / 100)
          const uso7 = Math.round(pl.janela7d * (((i * 53) % 85) + 10) / 100)
          return (
            <li key={u.id} className="flex flex-wrap items-center gap-3 py-2.5 text-sm">
              <span className="min-w-0 flex-1 basis-40">{u.nome}</span>
              <span className="text-muted-foreground w-44 text-xs tabular-nums">
                5 h: {Math.round((uso5 / pl.janela5h) * 100)}% · 7 dias: {Math.round((uso7 / pl.janela7d) * 100)}%
              </span>
              <span className="w-36">
                <CampoEscolha
                  rotulo={`Plano de IA de ${u.nome}`}
                  valor={pl.id}
                  onMudar={(v) => {
                    setPlanos((x) => ({ ...x, [u.id]: v }))
                    loja.toast(`${u.nome}: plano de IA ${planosIa.find((p) => p.id === v)?.nome}.`)
                  }}
                  opcoes={planosIa.map((p) => ({ valor: p.id, rotulo: p.nome }))}
                />
              </span>
            </li>
          )
        })}
      </ul>
    </Caixa>
  )
}
