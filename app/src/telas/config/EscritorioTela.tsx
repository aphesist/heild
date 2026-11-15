import { BuildingsIcon, PlusIcon, WarningIcon } from '@phosphor-icons/react'
import { usePersistente } from '@/ambiente/loja'
import { useLayoutEffect, useRef, useState } from 'react'
import { Caixa, Propriedade, TituloBloco } from '@/components/compostos/blocos'
import { ValorEditavel } from '@/components/kit'
import { AreaRolagem } from '@/components/ui/area-rolagem'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Campo, CampoTexto, GavetaFormulario, Interruptor } from '@/components/ui/formulario'
import { subinquilinos as subIniciais, type SetorCfg } from '@/dados/configuracoes'
import { useEscritorioCfg, useSetoresCfg, type EscritorioCfg } from '@/ambiente/configuracoes'
import { useContas } from '@/ambiente/loja'
import { cn } from '@/lib/utils'
import { CalendarioEscritorio, FaixaImplantacao, SetoresNaoAtendidos } from './escritorio-s09'

/** Pessoas ativas do escritório (do banco), para escolher responsáveis. */
const usePessoas = () => useContas().filter((u) => u.situacao === 'ativo').map((u) => u.nome)

const fusos = ['America/Sao_Paulo', 'America/Manaus', 'America/Cuiaba', 'America/Recife', 'America/Noronha'].map((f) => ({ valor: f, rotulo: f.replace('America/', '').replace('_', ' ') }))
const exigeTexto = (v: string) => (v.trim() ? null : 'Não pode ficar vazio.')
const exigeCnpj = (v: string) => (v.replace(/\D/g, '').length === 14 ? null : 'CNPJ com 14 dígitos.')
const exigeHora = (v: string) => (/^([01]\d|2[0-3]):[0-5]\d$/.test(v.trim()) ? null : 'Hora no formato 00:00.')

/** Cabeçalho comum das abas de Configurações. */
export function CabecalhoConfig({ titulo, sub, acao }: { titulo: string; sub: string; acao?: React.ReactNode }) {
  return (
    <header className="flex flex-wrap items-end gap-2">
      <div className="min-w-0 grow basis-40">
        <h1 className="text-2xl font-light tracking-tight sm:text-3xl">{titulo}</h1>
        <p className="text-muted-foreground text-sm">{sub}</p>
      </div>
      {acao}
    </header>
  )
}

/**
 * Configurações › Escritório (Fundações 2.2, 4.1, 8): dados do escritório,
 * setores fixos (só renomear a exibição, desativar e escolher o responsável
 * padrão), regras de acesso, notificações padrão e subinquilinos (BPO).
 */
export function EscritorioTela() {
  const [e, setE] = useEscritorioCfg()
  const [setores, setSetores] = useSetoresCfg()
  const [subs, setSubs] = usePersistente('cfg.esc.subs', subIniciais)
  const [modal, setModal] = useState<'sub' | 'carteira' | null>(null)
  const pessoas = usePessoas()
  const comEquipe = setores.filter((s) => s.temEquipe)
  const perfil = setores.filter((s) => !s.temEquipe)
  // Edição em linha: o "Desfazer" do aviso roda depois de outras mudanças, então
  // grava sempre sobre o estado e o setter mais recentes (senão desfaria os outros campos).
  const ultimo = useRef({ e, setE, setores, setSetores })
  useLayoutEffect(() => {
    ultimo.current = { e, setE, setores, setSetores }
  })
  const mudarE = (p: Partial<EscritorioCfg>) => ultimo.current.setE({ ...ultimo.current.e, ...p })
  const mudarSetor = (codigo: SetorCfg['codigo'], p: Partial<SetorCfg>) => ultimo.current.setSetores(ultimo.current.setores.map((x) => (x.codigo === codigo ? { ...x, ...p } : x)))

  return (
    <AreaRolagem className="h-full px-4 pb-10 sm:px-5 md:pb-24">
      <div className="pagina flex flex-col gap-4 pt-1">
        <CabecalhoConfig titulo="Escritório" sub="Só o Administrador muda. Toda mudança vira evento." />
        <FaixaImplantacao />

        <div className="grid gap-4 lg:grid-cols-2">
          <Caixa>
            <TituloBloco descricao="O nome que aparece para clientes e equipe é o do tema (aba Tema).">Dados</TituloBloco>
            <dl className="divide-border/70 flex flex-col divide-y">
              <Propriedade rotulo="Razão social">
                <ValorEditavel rotulo="Razão social" valor={e.razaoSocial} config={{ tipo: 'texto', validar: exigeTexto }} onMudar={(v) => mudarE({ razaoSocial: v.trim() })} />
              </Propriedade>
              <Propriedade rotulo="Nome fantasia">
                <ValorEditavel rotulo="Nome fantasia" valor={e.nomeFantasia} config={{ tipo: 'texto' }} onMudar={(v) => mudarE({ nomeFantasia: v.trim() })} />
              </Propriedade>
              <Propriedade rotulo="CNPJ">
                <ValorEditavel rotulo="CNPJ" valor={e.cnpj} config={{ tipo: 'texto', validar: exigeCnpj }} className="tabular-nums" onMudar={(v) => mudarE({ cnpj: v.trim() })} />
              </Propriedade>
              <Propriedade rotulo="CRC">
                <ValorEditavel rotulo="CRC" valor={e.crc} vazio="opcional" config={{ tipo: 'texto' }} onMudar={(v) => mudarE({ crc: v.trim() })} />
              </Propriedade>
              <Propriedade rotulo="Fuso horário">
                <ValorEditavel rotulo="Fuso horário" valor={e.fuso} config={{ tipo: 'escolha', opcoes: fusos, outra: false }} onMudar={(v) => mudarE({ fuso: v })} />
              </Propriedade>
            </dl>
          </Caixa>
          <Caixa>
            <TituloBloco descricao="A espera só vale nas telas que registram tempo (Painel com cliente e CRM): para o contador no último evento e cobre a tela, sem deslogar. Mexer o mouse não conta como ação.">Regras de acesso</TituloBloco>
            <dl className="divide-border/70 flex flex-col divide-y">
              <Propriedade rotulo="Inatividade">
                espera depois de{' '}
                <ValorEditavel rotulo="Minutos sem ação até a espera" valor={e.inatividadeMin} config={{ tipo: 'numero', min: 2, max: 5, unidade: 'min' }} className="tabular-nums" onMudar={(v) => mudarE({ inatividadeMin: v })} /> sem ação no Painel e no CRM (não desloga)
              </Propriedade>
              <Propriedade rotulo="Segundo fator">
                <ValorEditavel
                  rotulo="Segundo fator"
                  valor={e.segundoFator}
                  config={{
                    tipo: 'escolha',
                    outra: false,
                    opcoes: [
                      { valor: 'administradores', rotulo: 'obrigatório para administradores', detalhe: 'Para administradores é sempre obrigatório.' },
                      { valor: 'todos', rotulo: 'obrigatório para todos' },
                    ],
                  }}
                  formatar={(v) => (v === 'administradores' ? 'obrigatório para administradores' : v === 'todos' ? 'obrigatório para todos' : 'opcional')}
                  onMudar={(v) => mudarE({ segundoFator: v as EscritorioCfg['segundoFator'] })}
                />
              </Propriedade>
              <Propriedade rotulo="Carteira de clientes">
                <span className="flex flex-wrap items-center gap-2">
                  {e.carteiraLigada ? 'ligada: cada pessoa vê só os clientes da carteira' : 'desligada: quem tem o setor vê todos os clientes'}
                  <Button size="sm" variant="outline" className="h-7 rounded-full px-3 text-xs" onClick={() => (e.carteiraLigada ? setE({ ...e, carteiraLigada: false }) : setModal('carteira'))}>
                    {e.carteiraLigada ? 'Desligar carteira' : 'Ligar carteira'}
                  </Button>
                </span>
              </Propriedade>
            </dl>
          </Caixa>
        </div>

        <Caixa>
          <TituloBloco descricao="Os setores são fixos e seguem as abas do sistema: não se apagam nem se fundem. Dá para renomear a exibição, desativar um setor que o escritório não atende (a aba some, o integrante pausa; nada se apaga) e escolher quem responde por ele quando o cliente não tem responsável próprio. O número de WhatsApp do setor fica em CRM › Números.">
            Setores
          </TituloBloco>
          <ul className="divide-border/70 flex flex-col divide-y">
            {comEquipe.map((s) => (
              <li
                key={s.codigo}
                className={cn('grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-0.5 py-2.5 text-sm sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_auto]', !s.ativo && 'text-muted-foreground grayscale')}
              >
                <span className="font-medium">
                  <ValorEditavel rotulo={`Nome exibido de ${s.nomePadrao}`} valor={s.nomeExibido} config={{ tipo: 'texto', validar: exigeTexto }} onMudar={(v) => mudarSetor(s.codigo, { nomeExibido: v.trim() })} />
                  {s.nomeExibido !== s.nomePadrao && <span className="text-muted-foreground block text-xs font-normal">padrão: {s.nomePadrao}</span>}
                </span>
                <span className="text-muted-foreground col-span-2 row-start-2 text-xs sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:text-sm">
                  responsável padrão:{' '}
                  <ValorEditavel
                    rotulo={`Responsável padrão de ${s.nomeExibido}`}
                    valor={s.responsavel}
                    config={{ tipo: 'entidade', opcoes: pessoas.map((p) => ({ valor: p, rotulo: p })), buscar: 'Buscar pessoa', outra: false }}
                    onMudar={(v) => mudarSetor(s.codigo, { responsavel: v })}
                  />
                  {s.numero ? ` · WhatsApp ${s.numero}` : ' · usa o número principal'}
                </span>
                <span className="flex items-center gap-2">
                  {!s.ativo && <Badge variant="outline">desativado</Badge>}
                  <Interruptor ocultarRotulo rotulo={`${s.nomeExibido} ativo`} ligado={s.ativo} onMudar={(v) => mudarSetor(s.codigo, { ativo: v })} />
                </span>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2 border-t pt-3">
            <span className="text-muted-foreground text-xs">Setores de perfil (sem equipe; mudam o que as abas mostram para clientes desse tipo):</span>
            <div className="flex flex-wrap gap-2">
              {perfil.map((s) => (
                <button
                  key={s.codigo}
                  type="button"
                  onClick={() => setSetores((xs) => xs.map((x) => (x.codigo === s.codigo ? { ...x, ativo: !x.ativo } : x)))}
                  aria-pressed={s.ativo}
                  className={cn('cursor-pointer rounded-full border px-3 py-1 text-xs', s.ativo ? 'border-foreground/30 bg-raised font-medium' : 'text-muted-foreground')}
                >
                  {s.nomeExibido} {s.ativo ? '· ligado' : '· desligado'}
                </button>
              ))}
            </div>
          </div>
        </Caixa>

        <div className="grid gap-4 lg:grid-cols-2">
          <Caixa>
            <TituloBloco descricao="Padrão para quem não mudou as próprias preferências. Urgente vai a todos os canais e fura o silêncio; alta respeita o silêncio; normal vai para o resumo.">Notificações</TituloBloco>
            <dl className="divide-border/70 flex flex-col divide-y">
              <Propriedade rotulo="Resumo diário">
                às <ValorEditavel rotulo="Hora do resumo diário" valor={e.resumoHora} config={{ tipo: 'texto', validar: exigeHora, placeholder: '18:00' }} className="tabular-nums" onMudar={(v) => mudarE({ resumoHora: v.trim() })} />, com o que não foi urgente
              </Propriedade>
              <Propriedade rotulo="Silêncio">
                <ValorEditavel rotulo="Silêncio de" valor={e.silencio.de} config={{ tipo: 'texto', validar: exigeHora, placeholder: '20:00' }} className="tabular-nums" onMudar={(v) => mudarE({ silencio: { ...ultimo.current.e.silencio, de: v.trim() } })} /> às{' '}
                <ValorEditavel rotulo="Silêncio até" valor={e.silencio.ate} config={{ tipo: 'texto', validar: exigeHora, placeholder: '08:00' }} className="tabular-nums" onMudar={(v) => mudarE({ silencio: { ...ultimo.current.e.silencio, ate: v.trim() } })} />{' '}
                <ValorEditavel
                  rotulo="Silêncio nos fins de semana"
                  valor={e.silencio.fimDeSemana ? 'sim' : 'nao'}
                  config={{
                    tipo: 'escolha',
                    outra: false,
                    opcoes: [
                      { valor: 'sim', rotulo: 'e fins de semana' },
                      { valor: 'nao', rotulo: 'só nos dias úteis' },
                    ],
                  }}
                  onMudar={(v) => mudarE({ silencio: { ...ultimo.current.e.silencio, fimDeSemana: v === 'sim' } })}
                />{' '}
                (urgente fura o silêncio)
              </Propriedade>
            </dl>
          </Caixa>
          <Caixa>
            <TituloBloco
              acao={
                e.modoBpo ? (
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => setModal('sub')}>
                    <PlusIcon /> Subinquilino
                  </Button>
                ) : undefined
              }
              descricao="Para quem atende outras empresas com marca, clientes e administradores próprios."
            >
              Modo BPO
            </TituloBloco>
            <Interruptor ligado={e.modoBpo} onMudar={(v) => setE({ ...e, modoBpo: v })} rotulo="Permitir subinquilinos" detalhe="Cada um tem assinatura e tema próprios; a mãe só vê o que o subinquilino deixar." />
            {e.modoBpo && (
              <ul className="flex flex-col gap-2">
                {subs.map((s) => (
                  <li key={s.id} className="bg-sunken/60 flex items-center gap-3 rounded-md px-3 py-2 text-sm">
                    <BuildingsIcon className="text-muted-foreground size-5" />
                    <span className="min-w-0 flex-1">
                      <span className="block">{s.nome}</span>
                      <span className="text-muted-foreground block text-xs">
                        {s.cnpj} · {s.clientes} clientes · {s.visivelParaMae ? 'visível para a mãe' : 'privado'}
                      </span>
                    </span>
                    <Badge variant="sucesso">{s.situacao}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Caixa>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <CalendarioEscritorio />
          <SetoresNaoAtendidos />
        </div>
      </div>

      {modal === 'carteira' && (
        <GavetaFormulario
          aberta
          onFechar={() => setModal(null)}
          titulo="Ligar a carteira de clientes"
          descricao="Com a carteira ligada, cada Colaborador vê só os clientes atribuídos a ele (no setor ou em todos)."
          acao="Ligar carteira"
          onAcao={() => {
            setE({ ...e, carteiraLigada: true })
            setModal(null)
          }}
        >
          <p className="bg-warning/10 flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm">
            <WarningIcon className="text-warning mt-0.5 size-4 shrink-0" />
            <span>
              <strong className="font-medium">3 colaboradores ainda não têm carteira</strong> (Ana Souza, Bruno Costa, Carla Mendes). Ao ligar, eles deixam de ver qualquer cliente até você atribuir. Administradores e Gestores continuam
              vendo tudo dos seus setores.
            </span>
          </p>
          <p className="text-muted-foreground text-sm">Monte as carteiras em Usuários e setores, em cada pessoa. Conversas de lead e de número desconhecido continuam visíveis para quem atende o setor.</p>
        </GavetaFormulario>
      )}
      {modal === 'sub' && (
        <NovoSubinquilino
          onFechar={() => setModal(null)}
          onCriar={(s) => {
            setSubs((xs) => [...xs, s])
            setModal(null)
          }}
        />
      )}
    </AreaRolagem>
  )
}

function NovoSubinquilino({ onFechar, onCriar }: { onFechar: () => void; onCriar: (s: (typeof subIniciais)[number]) => void }) {
  const [nome, setNome] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [admin, setAdmin] = useState('')
  const [visivel, setVisivel] = useState(true)
  const ok = nome.trim() && cnpj.replace(/\D/g, '').length === 14 && /@/.test(admin)
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo="Novo subinquilino"
      descricao="Ganha assinatura própria e tema próprio (herda o seu até definir). O administrador dele recebe o convite."
      acao="Criar e convidar"
      acaoDesabilitada={!ok}
      onAcao={() =>
        onCriar({
          id: `b${Date.now()}`,
          nome,
          cnpj,
          visivelParaMae: visivel,
          situacao: 'ativo',
          clientes: 0,
        })
      }
    >
      <Campo rotulo="Razão social">{(id) => <CampoTexto id={id} valor={nome} onMudar={setNome} />}</Campo>
      <Campo rotulo="CNPJ">{(id) => <CampoTexto id={id} valor={cnpj} onMudar={setCnpj} />}</Campo>
      <Campo rotulo="E-mail do administrador do subinquilino">{(id) => <CampoTexto id={id} tipo="email" valor={admin} onMudar={setAdmin} />}</Campo>
      <Interruptor ligado={visivel} onMudar={setVisivel} rotulo="Visível para o escritório-mãe" detalhe="Desligado, você não vê clientes nem dados dele; só a assinatura." />
    </GavetaFormulario>
  )
}
