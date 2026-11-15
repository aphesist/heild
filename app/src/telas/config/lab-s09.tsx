import { PlugsConnectedIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { CampoEscolha } from '@/components/ui/formulario'
import { catalogoConectores, definirEstadoConector, restaurarConectores, rotuloEstado, type EstadoConexao, type IdConector } from '@/dados/conectores'
import { useLoja } from '@/ambiente/loja'
import { useAgentes } from './armazenamento-s09b'

/**
 * Seção da S09 no painel Demonstração: põe um conector num estado de erro
 * (fora do ar, credencial vencida, certificado vencido, limite, CAPTCHA,
 * timeout, teto) para ver como cada tela reage (mapa, 1.6).
 */
export function SecaoLabS09() {
  const loja = useLoja()
  const [id, setId] = useState<IdConector>('integra_contador')
  const [estado, setEstado] = useState<EstadoConexao>('fora_do_ar')
  const [agentes, setAgentes] = useAgentes()
  const agente = agentes.find((a) => !a.revogado_em)
  return (
    <div className="bg-sunken/60 flex flex-col gap-1.5 rounded-[12px] p-2" data-lab="s09">
      <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
        <PlugsConnectedIcon className="size-3.5" /> Simular conector com problema
      </span>
      <CampoEscolha rotulo="Conector" valor={id} onMudar={setId} opcoes={catalogoConectores.map((c) => ({ valor: c.id, rotulo: c.nome }))} />
      <CampoEscolha rotulo="Estado" valor={estado} onMudar={setEstado} opcoes={(Object.keys(rotuloEstado) as EstadoConexao[]).map((e) => ({ valor: e, rotulo: rotuloEstado[e] }))} />
      <div className="flex flex-wrap gap-1.5 text-xs">
        <button
          type="button"
          className="bg-raised shadow-contorno cursor-pointer rounded-full px-2.5 py-1"
          onClick={() => {
            definirEstadoConector(id, { estado, ultima_execucao: new Date().toISOString(), ...(estado === 'ativo' ? { erros: 0, mensagem: undefined } : { erros: 3 }) })
            loja.toast(`${catalogoConectores.find((c) => c.id === id)?.nome}: ${rotuloEstado[estado]}.`, { modulo: 'config', aba: 'conectores' }, 'Ver em Conectores')
          }}
        >
          Aplicar
        </button>
        {agente && (
          <button
            type="button"
            className="bg-raised shadow-contorno cursor-pointer rounded-full px-2.5 py-1"
            onClick={() => {
              const online = !agente.online
              setAgentes((xs) => xs.map((a) => (a.id === agente.id ? { ...a, online, ...(online ? { ultima_sincronizacao: new Date().toISOString() } : {}) } : a)))
              definirEstadoConector('servidor_local', online ? { estado: 'ativo', mensagem: undefined, ultima_execucao: new Date().toISOString() } : { estado: 'fora_do_ar', mensagem: `O agente de ${agente.dispositivo} está offline (servidor desligado ou sem internet).` })
              loja.toast(`Agente ${agente.dispositivo}: ${online ? 'online' : 'offline'}.`, { modulo: 'config', aba: 'armazenamento' }, 'Ver em Armazenamento')
            }}
          >
            Agente local {agente.online ? 'ficar offline' : 'voltar online'}
          </button>
        )}
        <button type="button" className="text-muted-foreground cursor-pointer rounded-full px-2.5 py-1 hover:underline" onClick={() => (restaurarConectores(), loja.toast('Conectores de volta ao padrão do escritório.'))}>
          Restaurar conectores
        </button>
      </div>
    </div>
  )
}
