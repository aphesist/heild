import { createContext, useContext, useState, type ReactNode } from 'react'
import { VisualizadorDocumento } from '@/components/compostos/visualizador-documento'
import { chaveNome, pastaPeloTipo, tipoPeloNome, type Documento, type OrigemDocumento } from '@/dados/arquivos'
import * as exemplo from '@/dados/exemplo'
import type { SetorIntegrante } from '@/theme/tipos'
import { useFluxos } from './fluxos'
import { useLoja, useNavegacao } from './loja'
import { useSessao } from './sessao'
import { conferirAssinatura, DialogoComprovante, DialogoVersoes, GavetaConfirmarOrigem, GavetaConflito, GavetaEnviarCliente, GavetaMover, type AcaoDocumento } from '@/telas/arquivos/acoes-documento'
import { registrar } from '@/nucleo/repositorios'

export interface ContextoMencao {
  clienteId?: string
  clienteNome?: string
  setor?: SetorIntegrante
  /** Se o documento ainda não está no índice, de onde ele veio. */
  origem?: OrigemDocumento
  por?: string
}

interface ApiDocumentos {
  /** Abre o documento citado pelo nome (cartão, anexo, lista); se não estiver no índice, entra nele. */
  abrir: (nome: string, ctx?: ContextoMencao) => void
  abrirDoc: (d: Documento) => void
  /** Acha (ou registra) o documento citado, sem abrir. */
  resolver: (nome: string, ctx?: ContextoMencao) => Documento
  /** S09: abre uma ação sobre o documento (mover, versões, origem, conflito, comprovante, enviar). */
  acao: (tipo: AcaoDocumento, d: Documento) => void
}

const Ctx = createContext<ApiDocumentos | null>(null)

/**
 * Toda menção a um documento abre o mesmo arquivo, no visualizador com a marca
 * do escritório, e a pasta dele leva ao módulo Arquivos.
 */
export function DocumentosProvider({ children }: { children: ReactNode }) {
  const loja = useLoja()
  const nav = useNavegacao()
  const fluxos = useFluxos()
  const { usuario, permissoes } = useSessao()
  const [abertoId, setAbertoId] = useState<string | null>(null)
  const [recemCriado, setRecemCriado] = useState<Documento | null>(null)
  const [acaoAberta, setAcaoAberta] = useState<{ tipo: AcaoDocumento; id: string } | null>(null)

  const resolver = (nome: string, ctx: ContextoMencao = {}) => {
    const clienteId = ctx.clienteId ?? exemplo.clientes.find((c) => c.nome === ctx.clienteNome)?.id
    const chave = chaveNome(nome)
    const candidatos = loja.documentos.filter((d) => chaveNome(d.nome) === chave)
    const achado = candidatos.find((d) => !clienteId || d.clienteId === clienteId) ?? (clienteId ? undefined : candidatos[0])
    if (achado) return achado
    const tipo = tipoPeloNome(nome)
    return loja.adicionarDocumento({
      nome: /\.\w{2,4}$/.test(nome) ? nome : `${nome}.pdf`,
      clienteId,
      pasta: pastaPeloTipo(tipo),
      tipo,
      origem: ctx.origem ?? 'conversa',
      conector: 'a1',
      tamanho: '140 KB',
      quando: 'hoje',
      por: ctx.por ?? usuario.nome,
    })
  }

  const api: ApiDocumentos = {
    resolver,
    abrir: (nome, ctx) => {
      const d = resolver(nome, ctx)
      setRecemCriado(d)
      setAbertoId(d.id)
    },
    abrirDoc: (d) => {
      setRecemCriado(d)
      setAbertoId(d.id)
    },
    acao: (tipo, d) => setAcaoAberta({ tipo, id: d.id }),
  }
  const docAcao = acaoAberta ? loja.documentos.find((d) => d.id === acaoAberta.id) : undefined
  const fecharAcao = () => setAcaoAberta(null)

  const aberto = abertoId ? (loja.documentos.find((d) => d.id === abertoId) ?? (recemCriado?.id === abertoId ? recemCriado : null)) : null
  const cliente = exemplo.clientes.find((c) => c.id === aberto?.clienteId)
  const podeForcar = usuario.papel !== 'colaborador'

  return (
    <Ctx.Provider value={api}>
      {children}
      {aberto && (
        <VisualizadorDocumento
          d={aberto}
          onFechar={() => setAbertoId(null)}
          acoes={{
            onBaixar: () => {
              loja.registrar(usuario.nome, `Baixou ${aberto.nome}${cliente ? ` (${cliente.nome})` : ''}`)
              loja.toast(`${aberto.nome} baixado.`)
            },
            // As gavetas abrem por cima do sistema: o visualizador fecha antes (as janelas de versões e comprovante ficam por cima dele).
            onEnviar: cliente
              ? () => {
                  setAbertoId(null)
                  setAcaoAberta({ tipo: 'enviar', id: aberto.id })
                }
              : undefined,
            onAcao: (tipo) => {
              if (tipo === 'mover' || tipo === 'origem' || tipo === 'conflito') setAbertoId(null)
              setAcaoAberta({ tipo, id: aberto.id })
            },
            onImprimir: () => {
              loja.ajustarDocumento(aberto.id, { entregas: [...(aberto.entregas ?? []), { quem: usuario.nome, acao: 'baixado', quando: new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) }] })
              registrar(`${usuario.nome} imprimiu ${aberto.nome}`, 'documento.imprimir')
              loja.toast(`${aberto.nome} enviado para a impressora (registrado).`)
            },
            onConferirAssinatura: () => {
              const r = conferirAssinatura(aberto)
              loja.ajustarDocumento(aberto.id, { s09: { ...aberto.s09, assinatura: { ...r, quando: new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) } } })
              registrar(`${usuario.nome} conferiu a assinatura de ${aberto.nome}: ${r.resultado === 'valida' ? 'válida' : 'ausente'}`, 'documento.conferir_assinatura')
            },
            onAvisarSemBytes: () => {
              loja.avisar({ para: [], tipo: 'sistema', titulo: `Arquivo sem bytes: ${aberto.nome}`, detalhe: `indisponível desde ${aberto.s09?.indisponivelDesde}; restaurar da lixeira da nuvem ou pedir de novo ao cliente`, destino: { modulo: 'arquivos', aba: 'pastas', pasta: { clienteId: aberto.clienteId, caminho: aberto.pasta } } })
              loja.toast('Administrador avisado.')
            },
            onAbrirPasta: (caminho) => {
              setAbertoId(null)
              nav.irPara({ modulo: 'arquivos', aba: 'pastas', pasta: { clienteId: aberto.clienteId, caminho } })
            },
            onForcarVisivel: podeForcar
              ? (v) => {
                  loja.ajustarDocumento(aberto.id, { forcarVisivel: v, s09: { ...aberto.s09, forcadoPor: v === undefined ? undefined : `${usuario.nome} em ${new Date().toLocaleDateString('pt-BR')}` } })
                  loja.registrar(usuario.nome, `${v === undefined ? 'Voltou à visibilidade da pasta' : v ? 'Mostrou ao cliente' : 'Ocultou do cliente'}: ${aberto.nome}`)
                }
              : undefined,
            onCopiarLink: () => loja.toast('Link interno copiado: abre este documento para quem tem acesso ao cliente.'),
          }}
        />
      )}
      {docAcao && acaoAberta?.tipo === 'mover' && <GavetaMover d={docAcao} onFechar={fecharAcao} />}
      {docAcao && acaoAberta?.tipo === 'versoes' && <DialogoVersoes d={docAcao} onFechar={fecharAcao} />}
      {docAcao && acaoAberta?.tipo === 'origem' && <GavetaConfirmarOrigem d={docAcao} onFechar={fecharAcao} />}
      {docAcao && acaoAberta?.tipo === 'conflito' && <GavetaConflito d={docAcao} onFechar={fecharAcao} />}
      {docAcao && acaoAberta?.tipo === 'comprovante' && <DialogoComprovante d={docAcao} onFechar={fecharAcao} />}
      {docAcao && acaoAberta?.tipo === 'enviar' && (
        <GavetaEnviarCliente
          d={docAcao}
          onFechar={fecharAcao}
          onEscrever={() => {
            const cli = loja.clientes.find((c) => c.id === docAcao.clienteId)
            fecharAcao()
            setAbertoId(null)
            if (cli) fluxos.enviar({ cliente: cli.nome, setor: permissoes.setores[0] ?? 'fiscal', texto: '', anexo: docAcao.nome, assunto: docAcao.nome.replace(/\.\w+$/, '') })
          }}
        />
      )}
    </Ctx.Provider>
  )
}

const nada: ApiDocumentos = { abrir: () => {}, abrirDoc: () => {}, acao: () => {}, resolver: (nome) => ({ id: 'x', nome, pasta: [], tipo: 'outro', origem: 'conversa', conector: 'a1', tamanho: '', quando: '', por: '', versao: 1, hash: '' }) }
export const useDocumentos = () => useContext(Ctx) ?? nada
