import { EyeIcon, InfoIcon, LockSimpleIcon } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { useContas, useNavegacao } from '@/ambiente/loja'
import { papelExibido, perfilDe, useSessao } from '@/ambiente/sessao'
import { Caixa, TituloBloco } from '@/components/compostos/blocos'
import { EstadoVazio } from '@/components/kit'
import { AreaRolagem } from '@/components/ui/area-rolagem'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GavetaFormulario } from '@/components/ui/formulario'
import type { UsuarioCfg } from '@/dados/configuracoes'
import { cn } from '@/lib/utils'
import { permissoesDoPerfil, rotuloSetorCurto } from '@/nucleo/permissoes'
import { useTabela } from '@/nucleo/react'
import type { SetorIntegrante } from '@/theme/tipos'
import { abasInternas, modulosLaterais, type IdModulo } from '../modulos'
import { CabecalhoConfig } from './EscritorioTela'
import { Ficha } from './comum-s09'

type Nivel = 'executa' | 'gere' | 'le' | 'nao'
const rotuloNivel: Record<Nivel, string> = { gere: 'gere', executa: 'executa', le: 'só lê', nao: 'não vê' }

interface Celula {
  nivel: Nivel
  porque: string
}

const setorDaAba: Record<string, SetorIntegrante> = { societario: 'societario', fiscal: 'fiscal', notas: 'notas', dp: 'dp', contabil: 'contabil', consultoria: 'consultor' }

/** Colunas da matriz: módulo e aba (as abas que dependem de setor ou de papel). */
const colunas: { modulo: IdModulo; aba: string; rotulo: string }[] = [
  ...abasInternas.painel.map((a) => ({ modulo: 'painel' as const, aba: a.id, rotulo: `Painel › ${a.rotulo}` })),
  ...abasInternas.crm.map((a) => ({ modulo: 'crm' as const, aba: a.id, rotulo: `CRM › ${a.rotulo}` })),
  ...abasInternas.timesheet.map((a) => ({ modulo: 'timesheet' as const, aba: a.id, rotulo: `Timesheet › ${a.rotulo}` })),
  ...abasInternas.financeiro.map((a) => ({ modulo: 'financeiro' as const, aba: a.id, rotulo: `Financeiro › ${a.rotulo}` })),
  ...abasInternas.bpo.map((a) => ({ modulo: 'bpo' as const, aba: a.id, rotulo: `BPO › ${a.rotulo}` })),
  { modulo: 'arquivos', aba: 'pastas', rotulo: 'Arquivos' },
  { modulo: 'config', aba: 'escritorio', rotulo: 'Configurações' },
]

/** Regras por papel (01, 3.2; 03, 9.2; 09, 10.6; C2-26; 10, 4.1.1). */
const regrasPapel = [
  { papel: 'Administrador', ve: 'Tudo o que a assinatura libera. Único que edita papéis, setores, exceções, tema, catálogo e Configurações.', nunca: '—' },
  { papel: 'Gestor', ve: 'Os setores com vínculo; nos de gestão, aprova cartões, reatribui, decide contestações e vê a equipe.', nunca: 'Configurações (salvo exceção por tela).' },
  { papel: 'Membro', ve: 'Executa nos setores vinculados; vê a % do próprio limite de IA, nunca tokens nem custo.', nunca: 'Aprovar cartões do setor, timesheet da equipe.' },
  { papel: 'Perfil de apoio (Recepção)', ve: 'Membro de Gestão e Atendimento com exceções: vê e conclui só o que é de apoio nos outros setores (separar, consultar, cobrar, digitalizar).', nunca: 'Transmitir, enviar ao cliente, aprovar.' },
  { papel: 'Cliente', ve: 'Só o app, por serviço contratado: sócio, financeiro, RH, contador interno.', nunca: 'Qualquer tela do escritório.' },
  { papel: 'Convidado do contratante', ve: 'Portal do convidado com a marca do contratante (BPO entre escritórios).', nunca: 'Dados de outros contratantes.' },
]

const nuncaLiberavel = ['Margem por cliente e do BPO', 'Custo-hora e salários', 'Financeiro › Resultado', 'Remuneração e sócios']

/**
 * Configurações › Permissões (S09-T05; 01, 3; 03, 9): a matriz usuário ×
 * aba × nível calculada agora pela mesma função que decide cada ação, para
 * conferir e explicar. Só leitura; mudar é em Usuários.
 */
export function PermissoesTela() {
  const contas = useContas().filter((u) => u.situacao === 'ativo')
  const escritorio = useTabela('escritorio')[0]
  const assinatura = useTabela('assinatura')[0]
  const { definirVerComo } = useSessao()
  const nav = useNavegacao()
  const [modulo, setModulo] = useState<IdModulo | 'todos'>('painel')
  const [detalhe, setDetalhe] = useState<{ u: UsuarioCfg; col: (typeof colunas)[number]; c: Celula } | null>(null)
  const extra = { carteira_ligada: escritorio?.carteira_ligada ?? false, modulos: assinatura?.modulos ?? [] }

  const matriz = useMemo(
    () =>
      contas.map((u) => {
        const perfil = perfilDe(u, extra)
        const p = permissoesDoPerfil(perfil)
        const celulas = colunas.map((col): Celula => {
          if (u.papel === 'administrador') return { nivel: 'gere', porque: 'Administrador: tudo o que a assinatura libera (exceções não se aplicam).' }
          if (!p.modulos.includes(col.modulo as never)) return { nivel: 'nao', porque: col.modulo === 'config' ? 'Configurações é só do Administrador (sem exceção por tela).' : `O módulo ${col.modulo} não aparece para esta conta.` }
          const abas = p.abas[col.modulo as keyof typeof p.abas]
          if (abas && !abas.includes(col.aba)) {
            const bloq = u.excecoes.find((x) => x.efeito === 'bloquear' && x.tela === `aba.${col.aba}`)
            return { nivel: 'nao', porque: bloq ? `Exceção: bloqueada (${bloq.motivo}).` : col.modulo === 'painel' ? 'Sem vínculo com o setor da aba.' : 'O papel e os setores não dão esta aba.' }
          }
          const lib = u.excecoes.find((x) => x.efeito === 'liberar' && (x.tela === `aba.${col.aba}` || x.tela.endsWith(`.${col.aba}`) || (col.modulo === 'financeiro' && x.tela.startsWith('aba.financeiro'))))
          if (lib) return { nivel: lib.nivel === 'ler' ? 'le' : 'executa', porque: `Exceção por tela: libera até “${lib.nivel ?? 'executar'}” (${lib.motivo}).` }
          if (col.modulo === 'financeiro' && p.financeiroSoLeitura) return { nivel: 'le', porque: 'Financeiro liberado só para leitura.' }
          const setor = setorDaAba[col.aba]
          const v = setor ? u.vinculos.find((x) => x.setor === setor) : undefined
          if (v) return { nivel: v.modo === 'gestao' ? 'gere' : 'executa', porque: `Setor ${rotuloSetorCurto[v.setor]} com vínculo de ${v.modo === 'gestao' ? 'gestão' : 'execução'}.` }
          if (p.gere.length) return { nivel: 'gere', porque: `Gestão em ${p.gere.map((s) => rotuloSetorCurto[s]).join(', ')}.` }
          return { nivel: 'executa', porque: `Vínculo com ${p.resumo}.` }
        })
        return { u, celulas }
      }),
    [contas, extra.carteira_ligada, extra.modulos], // eslint-disable-line react-hooks/exhaustive-deps
  )

  const indices = colunas.map((c, i) => ({ c, i })).filter(({ c }) => modulo === 'todos' || c.modulo === modulo)
  const modulosFiltro: IdModulo[] = ['painel', 'crm', 'timesheet', 'financeiro', 'bpo', 'arquivos', 'config']

  return (
    <AreaRolagem className="h-full px-4 pb-10 sm:px-5 md:pb-24">
      <div className="pagina flex flex-col gap-4 pt-1">
        <CabecalhoConfig titulo="Permissões" sub="Calculado agora, pela mesma regra que decide cada ação. Para mudar, edite a pessoa em Usuários." />
        {/* A-3: o que nunca se libera vem antes da matriz, em faixa: é a regra que vale para todas as células. */}
        <Caixa>
          <TituloBloco descricao="Nem exceção por tela libera para quem não é Administrador (09, 10.6).">Nunca liberável</TituloBloco>
          <ul className="flex flex-wrap gap-2 text-sm">
            {nuncaLiberavel.map((n) => (
              <li key={n} className="bg-sunken/60 flex min-w-0 items-center gap-1.5 rounded-full px-3 py-1">
                <LockSimpleIcon className="text-muted-foreground size-4 shrink-0" /> {n}
              </li>
            ))}
          </ul>
        </Caixa>
        <Caixa>
          <TituloBloco descricao="Clique numa célula para ver a regra que decidiu. Os integrantes de cada pessoa nunca passam disso.">Matriz usuário × aba × nível</TituloBloco>
          <div className="flex flex-wrap gap-1.5">
            <Ficha ativo={modulo === 'todos'} onClick={() => setModulo('todos')}>
              Tudo
            </Ficha>
            {modulosFiltro.map((m) => (
              <Ficha key={m} ativo={modulo === m} onClick={() => setModulo(m)}>
                {m === 'config' ? 'Configurações' : (modulosLaterais.find((x) => x.id === m)?.rotulo ?? m)}
              </Ficha>
            ))}
          </div>
          {matriz.length === 0 ? (
            <EstadoVazio titulo="Nenhuma conta ativa" />
          ) : (
            <div className="area-rolagem-dupla -mx-1 overflow-x-auto px-1">
              <table className="w-full min-w-[640px] border-separate border-spacing-0 text-sm" aria-label="Matriz de permissões">
                <thead>
                  <tr>
                    <th className="bg-surface sticky left-0 z-10 py-2 pr-3 text-left text-xs font-medium">Pessoa</th>
                    {indices.map(({ c }) => (
                      <th key={`${c.modulo}-${c.aba}`} className="text-muted-foreground px-1.5 py-2 text-left text-[11px] font-normal">
                        {c.rotulo.split(' › ').pop()}
                      </th>
                    ))}
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {matriz.map(({ u, celulas }) => (
                    <tr key={u.id} className="border-border/70 border-t">
                      <th scope="row" className="bg-surface sticky left-0 z-10 py-2 pr-3 text-left font-normal">
                        <span className="block text-sm">{u.nome}</span>
                        <span className="text-muted-foreground block text-[11px]">{papelExibido(u)}</span>
                      </th>
                      {indices.map(({ c, i }) => {
                        const cel = celulas[i]
                        return (
                          <td key={`${c.modulo}-${c.aba}`} className="px-1 py-1.5">
                            <button
                              type="button"
                              onClick={() => setDetalhe({ u, col: c, c: cel })}
                              aria-label={`${u.nome} · ${c.rotulo}: ${rotuloNivel[cel.nivel]}`}
                              className={cn(
                                'w-full cursor-pointer rounded-full px-2 py-0.5 text-center text-[11px] whitespace-nowrap',
                                cel.nivel === 'gere' ? 'bg-success/20' : cel.nivel === 'executa' ? 'bg-success/10' : cel.nivel === 'le' ? 'bg-warning/15' : 'text-muted-foreground bg-sunken/60',
                              )}
                            >
                              {rotuloNivel[cel.nivel]}
                            </button>
                          </td>
                        )
                      })}
                      <td className="py-1.5 pl-2">
                        {u.papel !== 'administrador' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="rounded-full"
                            onClick={() => {
                              definirVerComo({ papel: u.papel, vinculos: u.vinculos })
                              nav.irPara({ modulo: 'inicio', aba: 'visao' })
                            }}
                          >
                            <EyeIcon /> Simular
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="text-muted-foreground flex items-start gap-1.5 text-xs">
            <InfoIcon className="mt-0.5 size-3.5 shrink-0" /> “Simular” mostra o sistema com o papel e os setores da pessoa sem trocar de conta; a faixa no topo avisa e tem o botão para sair.
          </p>
        </Caixa>

        {/* A-3: as regras por papel em largura inteira, o nome à esquerda e o que vê à direita. */}
        <Caixa>
          <TituloBloco descricao="O que cada papel vê e faz. Recepção, Supervisão e Direção são papéis, não abas (E-05).">Regras por papel</TituloBloco>
          <ul className="divide-border/70 flex flex-col divide-y">
            {regrasPapel.map((r) => (
              <li key={r.papel} className="flex flex-col gap-0.5 py-2.5 text-sm sm:grid sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-x-4">
                <span className="font-medium sm:row-span-2">{r.papel}</span>
                <span className="min-w-0 text-pretty">{r.ve}</span>
                <span className="text-muted-foreground text-xs sm:col-start-2">Nunca: {r.nunca}</span>
              </li>
            ))}
          </ul>
        </Caixa>
      </div>
      {detalhe && (
        <GavetaFormulario aberta onFechar={() => setDetalhe(null)} titulo={`${detalhe.u.nome} · ${detalhe.col.rotulo}`} descricao="A regra que decidiu, na ordem da função única: módulo da assinatura, Administrador, exceção bloquear, exceção liberar, vínculo ao setor, carteira, papel mínimo." acao="Fechar" onAcao={() => setDetalhe(null)}>
          <p className="flex items-center gap-2 text-sm">
            <Badge variant={detalhe.c.nivel === 'nao' ? 'outline' : detalhe.c.nivel === 'le' ? 'destaque' : 'sucesso'}>{rotuloNivel[detalhe.c.nivel]}</Badge>
            {detalhe.c.porque}
          </p>
        </GavetaFormulario>
      )}
    </AreaRolagem>
  )
}
