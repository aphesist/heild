import { BellRingingIcon, HourglassMediumIcon, PlugsIcon, SealCheckIcon } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { useLoja, usePersistente } from './loja'
import { useSessao } from './sessao'

/**
 * Controles da S01 no painel Demonstração: limite de IA atingido (S01-A20),
 * escritório sem plano de IA (02, ad. 25), resumo diário (S01-A62) e o fim
 * da observação e a pergunta de promoção de um integrante (S01-A35, A36).
 */
export function useDemoS01() {
  const [limite, setLimite] = usePersistente<boolean>('s01:demo:limite', false)
  const [semIa, setSemIa] = usePersistente<boolean>('s01:demo:sem-ia', false)
  return { limite, setLimite, semIa, setSemIa }
}


const linha = 'text-muted-foreground hover:bg-sunken/70 flex cursor-pointer items-center gap-2 rounded-[10px] px-2 py-1.5 text-left text-sm'

export function DemonstracaoS01({ onFechar }: { onFechar: () => void }) {
  const loja = useLoja()
  const { usuario } = useSessao()
  const { limite, setLimite, semIa, setSemIa } = useDemoS01()
  const [novos] = usePersistente<{ id: string; setor: string; nome?: string; cor?: string }[]>('time.novos', [])
  const fimObservacao = () => {
    const i = novos[novos.length - 1]
    if (!i) return loja.toast('Crie um integrante no Time primeiro (Início › Time › Novo integrante).')
    loja.mensagemTimeComId(i.id, {
      id: `m-obs-${Date.now()}`,
      autor: { tipo: 'integrante', setor: i.setor as never, nome: i.nome, cor: i.cor },
      hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      texto: 'Terminaram os 14 dias de observação. Tudo o que eu faria sozinho passou por você: 12 cartões, 11 aprovados sem edição. Posso fazer sozinho o que é reversível? O que transmite, paga, assina ou sai ao cliente continua com cartão.',
      cartoes: [{ tipo: 'aprovacao', id: `s01-obs-${i.id}`, resumo: 'Sair da observação: fazer sozinho o que é reversível', argumentos: [{ rotulo: 'Cartões na observação', valor: '12 · 11 sem edição' }, { rotulo: 'Continua com cartão', valor: 'transmitir, pagar, assinar, enviar ao cliente' }] }],
    })
    loja.avisar({ para: [usuario.id], tipo: 'cartao', titulo: `${i.nome ?? 'Integrante novo'}: fim da observação`, detalhe: 'posso fazer sozinho o que é reversível?', destino: { modulo: 'inicio', aba: 'time', integrante: i.id } })
    loja.toast(`${i.nome ?? 'O integrante'} terminou a observação e pergunta no chat dele.`, { modulo: 'inicio', aba: 'time', integrante: i.id }, 'Ver no Time')
  }
  const resumo = () => {
    const nao = loja.estado.avisos.filter((a) => !a.lidoPor.includes(usuario.id) && (a.para.length === 0 || a.para.includes(usuario.id)))
    const porSetor = new Map<string, number>()
    nao.forEach((a) => porSetor.set(a.setor ?? 'escritório', (porSetor.get(a.setor ?? 'escritório') ?? 0) + 1))
    loja.avisar({ para: [usuario.id], tipo: 'sistema', titulo: `Resumo do dia: ${nao.length} ${nao.length === 1 ? 'aviso' : 'avisos'} que não foram urgentes`, detalhe: [...porSetor.entries()].map(([s, n]) => `${s}: ${n}`).join(' · ') || 'nada pendente', destino: { modulo: 'inicio', aba: 'visao' } })
    loja.toast('Resumo diário entregue no sino (e por e-mail, se ligado em Minha conta).')
    onFechar()
  }
  return (
    <>
      <span className="text-muted-foreground mt-1 text-xs">Início e moldura</span>
      <button type="button" aria-pressed={limite} onClick={() => setLimite(!limite)} className={linha}>
        <HourglassMediumIcon className="size-4 shrink-0" /> Limite de IA desta janela: {limite ? 'atingido' : 'normal'} (alternar)
      </button>
      <button type="button" aria-pressed={semIa} onClick={() => setSemIa(!semIa)} className={linha}>
        <PlugsIcon className="size-4 shrink-0" /> Plano de IA: {semIa ? 'sem plano (só ajuda e suporte)' : 'contratado'} (alternar)
      </button>
      <button type="button" onClick={resumo} className={linha}>
        <BellRingingIcon className="size-4 shrink-0" /> Entregar o resumo diário agora
      </button>
      <button
        type="button"
        onClick={() => {
          loja.mensagemTimeComId('i-fiscal', {
            id: `m-promo-${Date.now()}`,
            autor: { tipo: 'integrante', setor: 'fiscal' },
            hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            texto: 'Nos últimos 30 cartões de "pedir XML de nota sem XML ao cliente", você aprovou 29 sem editar (97%). Posso passar a fazer isso sozinho? Continuo avisando o que fiz.',
            cartoes: [{ tipo: 'aprovacao', id: `s01-promo-${Date.now()}`, resumo: 'Fazer sozinho: pedir XML ao cliente quando a nota chega sem XML', argumentos: [{ rotulo: 'Cartões', valor: '30 · 29 sem edição (97%)' }, { rotulo: 'Ferramenta', valor: 'conversa.pedir_documento' }, { rotulo: 'Se sim', valor: 'vale para sempre (dá para voltar em Configurações › Integrantes)' }, { rotulo: 'Se não', valor: 'não pergunto de novo por 90 dias' }] }],
          })
          loja.avisar({ para: [usuario.id], tipo: 'cartao', setor: 'fiscal', titulo: 'Fiscal pergunta: posso fazer sozinho?', detalhe: 'pedir XML de nota sem XML · 97% aprovados sem edição', destino: { modulo: 'inicio', aba: 'time', integrante: 'i-fiscal' } })
          loja.toast('O Fiscal fez a pergunta de promoção no chat dele.', { modulo: 'inicio', aba: 'time', integrante: 'i-fiscal' }, 'Ver no Time')
          onFechar()
        }}
        className={cn(linha)}
      >
        <SealCheckIcon className="size-4 shrink-0" /> Integrante pede promoção (30 cartões, 95% sem edição)
      </button>
      <button type="button" onClick={() => { fimObservacao(); onFechar() }} className={linha}>
        <SealCheckIcon className="size-4 shrink-0" /> Integrante criado termina os 14 dias de observação
      </button>
    </>
  )
}
