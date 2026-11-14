import { DesktopIcon, DeviceMobileIcon, DeviceTabletIcon, LockSimpleIcon, MoonIcon, SunIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Campo, CampoEscolha, CampoTexto, GavetaFormulario, Interruptor, Segmentado } from '@/components/ui/formulario'
import { escritorio } from '@/dados/configuracoes'
import { cn } from '@/lib/utils'
import { useTema } from '@/theme/ThemeProvider'
import { useLoja, usePersistente } from './loja'
import { lembrarModo } from './modo-s01'
import { papelExibido, useSessao } from './sessao'

/**
 * Minha conta (S01-T08; 01, 8 e ad. 22; 03, 2.2): o que é da pessoa.
 * - avisos por categoria: canais em ordem (sistema sempre; WhatsApp; e-mail),
 *   silêncio, resumo diário com hora e o mínimo para canal externo;
 * - senha (com validação), segundo fator (travado quando o escritório obriga, com o motivo);
 * - sessões abertas: encerrar uma ou todas, com efeito;
 * - claro e escuro (alterna e lembra); papel e setores só leitura.
 * Guardado por pessoa no escritório (`s01:conta:<usuário>`).
 */

type Categoria = 'aprovacao' | 'tarefa' | 'pendencia' | 'conversa' | 'documento' | 'prazo' | 'agente' | 'sistema'
const categorias: { id: Categoria; rotulo: string }[] = [
  { id: 'aprovacao', rotulo: 'Aprovações' },
  { id: 'prazo', rotulo: 'Prazos' },
  { id: 'tarefa', rotulo: 'Tarefas' },
  { id: 'pendencia', rotulo: 'Pendências de cliente' },
  { id: 'conversa', rotulo: 'Conversas' },
  { id: 'documento', rotulo: 'Documentos' },
  { id: 'agente', rotulo: 'Avisos do time' },
  { id: 'sistema', rotulo: 'Sistema' },
]
type Canal = 'whatsapp' | 'email'
interface Preferencias {
  canais: Record<Categoria, Canal[]>
  silencio: 'escritorio' | 'proprio'
  silencioDe: string
  silencioAte: string
  resumo: boolean
  resumoHora: string
  minimoExterno: 'urgente' | 'alta' | 'normal'
}
interface Sessao {
  id: string
  aparelho: 'computador' | 'celular' | 'tablet'
  nome: string
  ultimo: string
  atual?: boolean
}

const padrao = (papel: string): Preferencias => ({
  canais: { aprovacao: papel === 'colaborador' ? [] : ['whatsapp'], prazo: ['whatsapp', 'email'], tarefa: [], pendencia: [], conversa: [], documento: [], agente: [], sistema: ['email'] },
  silencio: 'escritorio',
  silencioDe: escritorio.silencio.de,
  silencioAte: escritorio.silencio.ate,
  resumo: true,
  resumoHora: escritorio.resumoHora,
  minimoExterno: 'alta',
})
const sessoesIniciais: Sessao[] = [
  { id: 's-atual', aparelho: 'computador', nome: 'Chrome · este computador', ultimo: 'agora', atual: true },
  { id: 's-cel', aparelho: 'celular', nome: 'App no celular', ultimo: 'ontem, 21:40' },
  { id: 's-tab', aparelho: 'tablet', nome: 'Safari · tablet', ultimo: 'seg, 08:12' },
]
const iconeAparelho = { computador: DesktopIcon, celular: DeviceMobileIcon, tablet: DeviceTabletIcon }

export function MinhaConta({ onFechar, onAlternarModo }: { onFechar: () => void; onAlternarModo?: () => void }) {
  const { usuario, permissoes } = useSessao()
  const loja = useLoja()
  const { modo } = useTema()
  const obrigatorio = escritorio.segundoFator === 'todos' || (escritorio.segundoFator === 'administradores' && usuario.papel === 'administrador')
  const [salvas, setSalvas] = usePersistente<Preferencias | null>(`s01:conta:${usuario.id}`, null)
  const [p, setP] = useState<Preferencias>(salvas ?? padrao(usuario.papel))
  const [sessoes, setSessoes] = usePersistente<Sessao[]>(`s01:sessoes:${usuario.id}`, sessoesIniciais)
  const [fator, setFator] = usePersistente<boolean>(`s01:segundo-fator:${usuario.id}`, usuario.segundoFator || obrigatorio)
  const [senhaAtual, setSenhaAtual] = useState('')
  const [senhaNova, setSenhaNova] = useState('')
  const [senhaConfirma, setSenhaConfirma] = useState('')
  const erroSenha = senhaNova && senhaNova.length < 10 ? 'Use 10 caracteres ou mais.' : senhaNova && !/\d/.test(senhaNova) ? 'Inclua pelo menos um número.' : undefined
  const erroConfirma = senhaConfirma && senhaConfirma !== senhaNova ? 'As duas senhas não batem.' : undefined
  const trocandoSenha = senhaNova.length > 0
  const bloqueado = !!erroSenha || !!erroConfirma || (trocandoSenha && (!senhaAtual || !senhaConfirma))

  const alternarCanal = (c: Categoria, canal: Canal) => setP({ ...p, canais: { ...p.canais, [c]: p.canais[c].includes(canal) ? p.canais[c].filter((x) => x !== canal) : [...p.canais[c], canal] } })
  const encerrar = (ids: string[]) => {
    const antes = sessoes
    setSessoes(sessoes.filter((s) => !ids.includes(s.id)))
    loja.registrar(usuario.nome, `Encerrou ${ids.length === 1 ? 'a sessão' : `${ids.length} sessões`} (${antes.filter((s) => ids.includes(s.id)).map((s) => s.nome).join(', ')})`)
    loja.toastDesfazer(ids.length === 1 ? 'Sessão encerrada: aquele aparelho volta para a tela de entrada.' : 'Outras sessões encerradas.', () => setSessoes(antes))
  }

  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      largura="lg"
      titulo="Minha conta"
      descricao={`${usuario.nome} · ${papelExibido(usuario)}`}
      acao="Salvar"
      acaoDesabilitada={bloqueado}
      onAcao={() => {
        setSalvas(p)
        if (trocandoSenha) {
          setSessoes(sessoes.filter((s) => s.atual))
          loja.registrar(usuario.nome, 'Trocou a senha; as outras sessões foram encerradas')
        }
        loja.toast(trocandoSenha ? 'Preferências e senha atualizadas. As outras sessões foram encerradas.' : 'Preferências salvas.')
        onFechar()
      }}
    >
      <section className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">E-mail de acesso</span>
        <span className="bg-sunken/60 rounded-[12px] px-3 py-2.5 text-sm">{usuario.email}</span>
        <span className="text-sm font-medium">Papel e setores</span>
        <span className="bg-sunken/60 flex items-center gap-2 rounded-[12px] px-3 py-2.5 text-sm">
          <LockSimpleIcon className="text-muted-foreground size-4 shrink-0" />
          {papelExibido(usuario)} · {permissoes.resumo}
        </span>
        <span className="text-muted-foreground text-xs">E-mail, papel e setores são editados pelo Administrador (Configurações › Usuários).</span>
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">Aparência</h3>
        <div role="radiogroup" aria-label="Modo" className="bg-sunken flex w-fit rounded-full p-0.5 text-sm">
          {(['claro', 'escuro'] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={modo === m}
              disabled={!onAlternarModo}
              onClick={() => {
                if (modo === m) return
                onAlternarModo?.()
                lembrarModo(usuario.id, m)
              }}
              className={cn('flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5', modo === m && 'bg-raised shadow-pilula')}
            >
              {m === 'claro' ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />} {m === 'claro' ? 'Claro' : 'Escuro'}
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-medium">Avisos</h3>
        <p className="text-muted-foreground text-xs">Todo aviso fica no sino. Marque onde mais ele chega, por categoria. Urgente fura o silêncio; o que não for, espera o resumo.</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground text-xs">
              <th className="py-1 text-left font-normal">Categoria</th>
              <th className="w-20 py-1 font-normal">Sino</th>
              <th className="w-20 py-1 font-normal">WhatsApp</th>
              <th className="w-20 py-1 font-normal">E-mail</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="py-1.5">{c.rotulo}</td>
                <td className="text-center">
                  <input type="checkbox" checked disabled aria-label={`${c.rotulo} no sino (sempre)`} className="accent-foreground" />
                </td>
                {(['whatsapp', 'email'] as const).map((canal) => (
                  <td key={canal} className="text-center">
                    <input type="checkbox" checked={p.canais[c.id].includes(canal)} onChange={() => alternarCanal(c.id, canal)} aria-label={`${c.rotulo} por ${canal === 'whatsapp' ? 'WhatsApp' : 'e-mail'}`} className="accent-foreground cursor-pointer" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <Campo rotulo="Mínimo para sair do sistema (WhatsApp e e-mail)">
          {(id) => (
            <CampoEscolha
              id={id}
              valor={p.minimoExterno}
              onMudar={(v) => setP({ ...p, minimoExterno: v })}
              opcoes={[
                { valor: 'urgente', rotulo: 'Só urgente' },
                { valor: 'alta', rotulo: 'Alta e urgente' },
                { valor: 'normal', rotulo: 'Normal, alta e urgente' },
              ]}
            />
          )}
        </Campo>
        <Interruptor ligado={p.resumo} onMudar={(v) => setP({ ...p, resumo: v })} rotulo="Resumo diário" detalhe="O que não foi urgente, agrupado por cliente e setor, numa mensagem só." />
        {p.resumo && <Campo rotulo="Hora do resumo">{(id) => <CampoTexto id={id} tipo="time" valor={p.resumoHora} onMudar={(v) => setP({ ...p, resumoHora: v })} />}</Campo>}
        <Campo rotulo="Silêncio">
          {() => (
            <Segmentado
              rotulo="Silêncio"
              valor={p.silencio}
              onMudar={(v) => setP({ ...p, silencio: v })}
              opcoes={[
                { valor: 'escritorio', rotulo: `O do escritório (${escritorio.silencio.de}–${escritorio.silencio.ate})` },
                { valor: 'proprio', rotulo: 'Meu próprio horário' },
              ]}
            />
          )}
        </Campo>
        {p.silencio === 'proprio' && (
          <div className="grid grid-cols-2 gap-3">
            <Campo rotulo="De">{(id) => <CampoTexto id={id} tipo="time" valor={p.silencioDe} onMudar={(v) => setP({ ...p, silencioDe: v })} />}</Campo>
            <Campo rotulo="Até">{(id) => <CampoTexto id={id} tipo="time" valor={p.silencioAte} onMudar={(v) => setP({ ...p, silencioAte: v })} />}</Campo>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-medium">Segurança</h3>
        <Interruptor
          ligado={fator}
          onMudar={(v) => {
            setFator(v)
            loja.registrar(usuario.nome, v ? 'Ligou o segundo fator' : 'Desligou o segundo fator')
          }}
          desabilitado={obrigatorio}
          rotulo="Segundo fator no login"
          detalhe={obrigatorio ? 'Obrigatório para administradores neste escritório (Configurações › Escritório).' : 'App autenticador; recomendado.'}
        />
        <Campo rotulo="Senha atual">{(id) => <CampoTexto id={id} tipo="password" valor={senhaAtual} onMudar={setSenhaAtual} />}</Campo>
        <Campo rotulo="Nova senha" erro={erroSenha}>
          {(id) => <CampoTexto id={id} tipo="password" valor={senhaNova} onMudar={setSenhaNova} />}
        </Campo>
        <Campo rotulo="Repita a nova senha" erro={erroConfirma}>
          {(id) => <CampoTexto id={id} tipo="password" valor={senhaConfirma} onMudar={setSenhaConfirma} />}
        </Campo>
      </section>

      <section className="flex flex-col gap-2 text-sm">
        <h3 className="font-medium">Sessões abertas</h3>
        <ul className="flex flex-col gap-1">
          {sessoes.map((s) => {
            const Icone = iconeAparelho[s.aparelho]
            return (
              <li key={s.id} className="flex items-center gap-2">
                <Icone className="text-muted-foreground size-4 shrink-0" />
                <span className="min-w-0 flex-1">
                  {s.nome} · {s.ultimo}
                  {s.atual && <span className="text-muted-foreground"> (esta)</span>}
                </span>
                {!s.atual && (
                  <Button type="button" size="sm" variant="ghost" className="h-7 rounded-full px-2" onClick={() => encerrar([s.id])}>
                    Encerrar
                  </Button>
                )}
              </li>
            )
          })}
        </ul>
        <Button type="button" size="sm" variant="outline" className="w-fit rounded-full" disabled={sessoes.length <= 1} onClick={() => encerrar(sessoes.filter((s) => !s.atual).map((s) => s.id))}>
          Encerrar as outras sessões
        </Button>
      </section>
    </GavetaFormulario>
  )
}
