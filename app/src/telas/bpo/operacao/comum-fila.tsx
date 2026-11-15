import { ArrowRightIcon, BellRingingIcon, UserSwitchIcon } from '@phosphor-icons/react'
import { useAcao, useConfirmar, usePode, type AcaoMenu } from '@/components/kit'
import type { BolaBpo, BpoItemFila } from '@/nucleo/modelo/entidades'
import { repos } from '@/nucleo/repositorios'
import { filaOperacao } from '@/nucleo/repositorios/s08b-operacao'
import { diasAte, quando } from '../dados'
import { useEquipeBpo } from '../FichaEmpresa'

export const rotuloBola: Record<BolaBpo, string> = { bpo: 'conosco', cliente: 'com o cliente', contratante: 'com o contratante', cliente_final: 'com o cliente final', terceiro: 'com terceiro' }

/** Estado do SLA do item (10, 4.3): começa com o pedido completo; pausa quando a bola está fora. */
export function slaDe(f: BpoItemFila) {
  if (f.situacao === 'resolvido') return { texto: 'Resolvido', tom: 'ok' as const }
  if (f.faltando.length) return { texto: `SLA não começou: falta ${f.faltando.join(', ')}`, tom: 'neutro' as const }
  if (f.bola !== 'bpo') return { texto: `SLA pausado (bola ${rotuloBola[f.bola]})`, tom: 'neutro' as const }
  const d = diasAte(f.prazo)
  return d < 0 ? { texto: `SLA estourado (prazo ${quando(f.prazo)})`, tom: 'erro' as const } : d === 0 ? { texto: `SLA corre: vence hoje (meta ${f.sla_meta_h} h)`, tom: 'atencao' as const } : { texto: `SLA corre (meta ${f.sla_meta_h} h, prazo ${quando(f.prazo)})`, tom: 'ok' as const }
}

const paraQuem = (b: BolaBpo) => (b === 'bpo' ? 'o BPO' : rotuloBola[b].replace('com ', ''))

/** Ações do item da fila (A15 passar a bola, A16 executar, A17 reatribuir), em menu e em botão. */
export function useAcoesFila() {
  const executar = useAcao()
  const confirmar = useConfirmar()
  const equipe = useEquipeBpo()
  const podeReatribuir = usePode('fila.reatribuir')
  const passar = async (f: BpoItemFila, para: BolaBpo) => {
    const motivo = await confirmar({ titulo: `Passar a bola para ${paraQuem(para)}?`, descricao: para === 'bpo' ? 'O SLA volta a correr.' : 'O SLA pausa até a resposta; o integrante cobra se a bola parar.', acao: 'Passar a bola', exigirMotivo: true, rotuloMotivo: 'O que falta ou por quê (vai para quem recebe)' })
    if (typeof motivo === 'string') executar(() => repos.bpo.fila.passarBola(f.id, para, motivo), { sucesso: `Bola ${rotuloBola[para]}` })
  }
  const lembrar = (f: BpoItemFila) => executar(() => filaOperacao.cobrar(f.id, f.bola === 'bpo' ? `lembrete a ${f.responsavel_nome} pelo sino` : 'lembrete pelo app e pelo WhatsApp'), { sucesso: `Lembrete enviado (${f.bola === 'bpo' ? `a ${f.responsavel_nome}` : 'pelo app e WhatsApp'})` })
  const reatribuir = (f: BpoItemFila, nome: string) => executar(() => repos.bpo.fila.reatribuir(f.id, nome), { sucesso: `${f.texto} com ${nome}` })
  const menu = (f: BpoItemFila, bolas: BolaBpo[]): AcaoMenu[] => [
    ...bolas.filter((b) => b !== f.bola).map((b) => ({ rotulo: `Passar a bola: ${rotuloBola[b]}`, icone: <ArrowRightIcon />, onSelecionar: () => void passar(f, b) })),
    ...equipe
      .filter((u) => u.nome !== f.responsavel_nome)
      .map((u, i) => ({ rotulo: `Reatribuir a ${u.nome}`, icone: <UserSwitchIcon />, separar: i === 0, motivo: podeReatribuir ? undefined : 'Só o Gestor do BPO reatribui.', onSelecionar: () => reatribuir(f, u.nome) })),
    { rotulo: 'Lembrar quem está com a bola', icone: <BellRingingIcon />, separar: true, onSelecionar: () => lembrar(f) },
  ]
  return { passar, menu, executar, lembrar, reatribuir, podeReatribuir, equipe }
}
