# Inventário de interface

**15/11/2026 · sessão UI Lab (branch `wf-ui-lab`), fase 1.** Cada peça de interface do `app/`, onde aparece, se é componente ou foi feita à mão na tela, e as duplicatas (o mesmo padrão feito de jeitos diferentes). É a base da fase 2 (componentização), da fase 3 (UI Lab, `#/lab/ui`) e da fase 4 (QA sobre o Lab e as telas reais). As contagens vêm de varredura do código (`grep` e leitura), sem `*.stories.tsx`, e são aproximadas (±10%).

- **Tamanho:** ~99 mil linhas de TS/TSX; 37 telas de topo e ~190 arquivos de tela; 102 widgets declarados (`conteudo:` em `DefWidget`).
- **Caminhos** relativos a `app/src/`. "Kit" = `components/{ui,kit,compostos,widgets}`.
- **Destino** é o componente do kit que a fase 2 usa (ou cria) para aquela peça.

## 0. Resumo

| | Números |
| --- | --- |
| Componentes no kit | 26 em `ui/`, 39 arquivos em `compostos/`, 10 em `kit/`, 4 em `widgets/` |
| Componentes do kit **sem nenhum uso nas telas** | `Card` (e partes), `List`/`ListItem`, `Tabs`, `Input`/`Textarea`/`Label`, `VazioWidget`, `Separator`, `Contador` quase (5 usos contra ~11 contadores à mão) |
| "Kit paralelo" morando nas telas | `Tabela`/`Linha`/`Numero`/`Dias` (`telas/painel/Tabela.tsx`), `Rotulo`/`Vazio`/`Barra`/`SeloFase` (`painel/s03/pecas.tsx`), `Bloco`/`Selo`/`Chip`/`Linha`/`Faixa`/`Folha`/`Campo` (`cliente/pecas.tsx`), `Pergunta` (timesheet e financeiro), `FiltroSelect`/`Entrada`/`AreaTexto`/`Secao`/`GavetaLarga` (`tarefas/pecas.tsx`), `Ficha` (`config/comum-s09.tsx`) |
| Peças feitas à mão nas telas | ~380 caixas internas (`bg-sunken`/`bg-raised` com raio solto), ~85 selos em `span`, ~50 KPIs, ~160 estados vazios em `<p>`/`<li>`, 28 trilhos de segmentado, 15 buscas, 11 gráficos de barra, 24 linhas do tempo, 30 barras de progresso |
| `<button>` cru | 368 (contra 1.103 `<Button>`); ~100 `<Button>` com `rounded-full`/`h-7` sobrescritos (pílula sem variante) |
| Raios soltos | 525 `rounded-[NNpx]` (14px 106×, 12px 67×, 10px 33×, 16px 18×, 18px 9×, 24px 8×) |
| `text-[10px]` | 27 (abaixo do mínimo de 11px da tipografia em vários) |
| Rolagens | 90 `overflow-*-auto` (nenhum `overflow-scroll`); **42 sem esmaecido**; 1 tabela com cabeçalho fixo cuja rolagem vertical não esmaece ("Captura da carteira") |
| Linhas em grade com coluna fixa e conteúdo que não quebra | 28 casos (o da tag "aguard. cliente" é o pior; 6 de risco alto) |

## 1. Superfícies

| Peça | Componente | Onde | Feito à mão | Duplicatas e diferença | Destino |
| --- | --- | --- | --- | --- | --- |
| **Widget** | `Widget` (`widgets/widget.tsx`) | grade de widgets do Início e do Painel (102 widgets) | — | — | fica; corpo passa a `AreaRolagem` |
| **Card de página** | `Caixa` (`compostos/blocos.tsx`), 41 arquivos, ~256 usos | Timesheet, Financeiro, BPO, Config, Arquivos | ~45 cards com `bg-surface shadow-cartao rounded-[16/18/20/24px]`, `p-3`/`p-3.5`/`p-4` (PortalConvidado, cliente/entrada, conversa, inicio, pendencias); `Caixa` local em `crm/LeadsTela.tsx:533`; molduras `rounded-[24px] sm:rounded-[34px]` (LeadsTela, ConversasTela, ConversasInternasTela) | `Card` (`ui/card.tsx`: `bg-card rounded-xl border shadow-xs`) sem uso; `Bloco` do app do cliente (`cliente/pecas.tsx:14`, 67 usos, `rounded-[20px] p-3.5`); constante `casca` (`bg-card rounded-xl border p-4`) repetida em `cartoes-chat`, `cartoes-s01`, `CartaoTarefa`, `AvisoIntegrante`, `CartaoRespostaLegal`, `BlocoTarefas`. Duas famílias de superfície: `bg-card`+borda e `bg-surface`+`shadow-cartao` | `Caixa` com `tom` (`superficie`, `elevada`) e o raio do token; `Card` sai |
| **Caixa interna** (bloco dentro do card) | — | — | ~380: `bg-sunken`, `/50`, `/60`, `/70`, `bg-raised shadow-contorno`, com raio 10/12/14/16/18px e `p-3`, `px-3 py-2`. As mais comuns: `bg-sunken p-3 rounded-[14px]`, `bg-raised px-3 py-2 rounded-[12px]` | — | `Bloco` (novo no kit): `tom` (`rebaixada`, `elevada`), `rounded-lg` (17px, o de dentro do cartão) |
| **Aviso / faixa de tom** | `AvisoCompacto`, `AvisoEditeNoComputador` | — | ~25 no Painel (`bg-warning/10 rounded-[12/14px] px-3 py-2`), `Faixa` (`timesheet/comum.tsx:116`, `cliente/pecas.tsx:263`, 23 usos), `Nota` (`financeiro/comum.tsx:191`), `Regra` (`bpo/comum.tsx:181`), `Erro` (`timesheet/configuracao.tsx:33`, `fiscal.tsx:109`, `contabil.tsx:137`) | cinco componentes para a mesma faixa, com raio 14/16/18px e padding diferentes | `Aviso` (novo): `tom` (`neutro`, `atencao`, `sucesso`, `erro`), ícone, ação |
| **Modal** | `Dialog*` (`ui/dialog.tsx`), `FormularioModal`, `DialogoConfirmacao` | 16 `DialogContent` | `Modal` local (`crm/s05/acoes.tsx:22`); 6 `DialogContent` sobrescritos com `bg-surface rounded-[24px] border-0 p-5`; `PortalConvidado.tsx:71` (div `fixed role=dialog` sem Radix); `JanelaFlutuante` (`role=dialog`, `rounded-[22px]`); `DialogPrimitive` cru em `armazenamento-s09b.tsx:66`; diálogo de confirmação à mão em `barra-conversa.tsx:91` | `DialogContent` base (`bg-popover border p-6`) e as confirmações (`bg-surface border-0 p-5`); z-index 45, 65, 70; **nenhum modal rolava por dentro** (conteúdo longo saía da tela) | `DialogContent` com corpo rolável sempre; uma aparência |
| **Gaveta** | `Sheet*`, `GavetaFormulario` (61 usos) | — | `GavetaLarga` (`tarefas/pecas.tsx:9`); `Folha` do app do cliente (bottom-sheet próprio, `cliente/pecas.tsx:98`); gaveta lateral da `Moldura` (motion, véu `bg-black/25`); gavetas que rolam inteiras (`FichaEmpresa.tsx:210`, `fila.tsx:467`) | `SheetContent` somava `border-l` duas vezes no lado esquerdo; cada uso direto repete o corpo do seu jeito | `SheetContent` + `SheetCorpo` (rola entre cabeçalho e rodapé); `GavetaLarga` e `GavetaFormulario` sobre ele |
| **Popover / menu** | `Popover`, `Menu`/`ItemMenu`, `MenuContexto`/`BotaoAcoes` | 8 popovers | `ItemMenu` privado em `barra-lateral.tsx:222` e `cabecalho-integrante.tsx:138`; respostas rápidas (`ConversasTela.tsx:910`); menções (`interna/pecas.tsx:620`); seletor de empresa do app (`ClienteApp.tsx:226`) | três itens de menu com classes diferentes | `Menu`/`ItemMenu` |
| **Tooltip** | `Tooltip` (16 arquivos) | — | ~58 `title=` nativos fazendo papel de tooltip; caixa de hover à mão em `timesheet/graficos.tsx:262` | — | `title` fica para texto truncado; dica de ação usa `Tooltip` |
| **Toast** | `Toasts` (`ambiente/interface.tsx:30`) | todas | — | — | fica |

## 2. Listas e tabelas

| Peça | Componente | Onde | Feito à mão | Duplicatas e diferença | Destino |
| --- | --- | --- | --- | --- | --- |
| **Lista** | `List` (sem uso) | — | ~265 `ul`/`ol` com `divide-y` (`divide-border/70 flex flex-col divide-y` 55×, `divide-border` puro, `-mx-2`) | — | `Lista` (kit) com divisória, vazio embutido e rolagem opcional |
| **Linha de lista** | `ListItem` (sem uso), `Linha` (`painel/Tabela.tsx:28`, 14 usos) | — | ~340 `li` flex/grid (`py-1.5`, `py-2`, `py-2.5`, com e sem `px`); `Linha` do app do cliente (22 usos); ~45 linhas clicáveis (`hover:bg-sunken/60 -mx-2 w-[calc(100%+1rem)] rounded-[12px] px-2`, `min-w-0 flex-1 basis-48 cursor-pointer`) | quatro "linhas" com respiro e título diferentes | `Linha` no kit (ícone, título truncado com `title`, detalhe, fim) e `LinhaColunas` (abaixo) |
| **Linha em colunas** (lista que é tabela) | — | — | `LinhaTarefa` (`ListaTarefas.tsx:204`, `role=row` em grid `minmax(0,1fr)_9rem_5.5rem_9.5rem_6rem_7rem`); `GestaoBpo.tsx:891/901` (`5rem_4rem_5rem_4rem_3.5rem`); `Contratantes.tsx:119/130`; `ContratosTela.tsx:319`; `CobrancaTela.tsx:145`; `ConciliacaoTela.tsx:143`; `VisaoFinTela.tsx:144`; `financeiro/pecas.tsx:278` | cabeçalho e linha com grades diferentes (`ListaTarefas`: cabeçalho `gap-x-3 px-2` e 6 colunas; linha `gap-x-2 px-1` e 7) | `ListaColunas` + `LinhaColunas` + `Celula`: uma grade declarada para cabeçalho e linhas, trilha `auto` para selo e ação, texto sempre truncado com `title`, selo que desce para a linha de baixo no estreito |
| **Tabela** | `Tabela` (`painel/Tabela.tsx:7`, 24 usos; `thead` fixo) | Painel | 20 `<table>` próprias: `documentos-aba.tsx:170`, `LeadsTela.tsx:623`, `NumerosTela.tsx:80`, `comunicados.tsx:68`, `crm/config/Atendimento.tsx:151`, `lancamento.tsx:305`, `EquipeTela.tsx:357/578`, `ResultadoTela.tsx:103`, `fechamento.tsx:192`, `PermissoesTela.tsx:118`, `RaioXTela.tsx:274`, `acoes-documento.tsx:270`, `cliente/financeiro.tsx:347`, `cliente/pedidos.tsx:294`, `cartoes-chat.tsx:165`, `visualizador-documento.tsx:26`, `conta.tsx:148` | `th` com `font-medium` ou `font-normal`, `py-1.5 pr-3` ou `pb-2`; ~109 `td` à mão (`py-1.5 pr-2` 23×, `… text-right tabular-nums` 17×); só a `Tabela` tem cabeçalho fixo; duas tabelas sem nenhuma rolagem (`Atendimento.tsx:151`, `comunicados.tsx:68`) | `Tabela` sobe para o kit, com `Celula` (`num`, `direita`), cabeçalho fixo e rolagem nas duas direções |
| **Propriedade (rótulo e valor)** | `Propriedade` (`compostos/blocos.tsx:34`) | 7 arquivos | `Dado` em `fiscal.tsx:160`, `trilha/index.tsx:604`, `FichaTarefa.tsx:614` (duas idênticas); `Linha` em `ComunicadosTela.tsx:500` (`6rem_1fr`); `dl` em `LeadsTela.tsx:213` (`7rem_1fr`) | colunas de 6, 7 e 10rem | `Propriedade` |

## 3. Selos, contadores, botões

| Peça | Componente | Onde | Feito à mão | Duplicatas e diferença | Destino |
| --- | --- | --- | --- | --- | --- |
| **Selo / tag** | `Badge` (75 arquivos, 216 usos), `StatusTarefaBadge`, `SeloDemonstracao` (44) | todas | ~85 `span rounded-full` (ArquivosTela 7, TemaTela, ConectoresTela, RaioX, saude.tsx, ficha-cliente, crm/itens, Modelos, financeiro/configuracao) | **12 selos paralelos:** `Selo` (`painel-aba.tsx:405`, `text-[11px] px-1.5`, sem borda, neutro `bg-sunken`), `Contagem`, `Dias` (`bg-destructive/12`), `Rotulo` (`s03/pecas.tsx:85`, 40 usos), `SeloFase` (`text-[10px]`), `SeloStatusObrigacao`, `SeloSituacao`, `SeloTitular`, `SeloEstado`, `SeloErp`/`SeloAudit`, `SeloAssinatura`, `Selo` do app do cliente (28 usos), `Prazo` (duas cópias: `ConversasTela.tsx:71`, `LeadsTela.tsx:144`). Erro em `/12` e `/15`; texto em 10, 11 e 12px; uns com `whitespace-nowrap`, outros sem. O `Badge` é `shrink-0 whitespace-nowrap` e não trunca: é o que invade a coluna vizinha | `Badge` com tom `neutro` (`bg-sunken`), texto que trunca com `title` quando falta lugar, nunca maior que o contêiner; os selos de domínio passam a só escolher tom, ícone e texto |
| **Contador** | `Contador` (`ui/badge.tsx`) | 5 | ~11 à mão (`ClienteApp.tsx:173` copia as classes; `LeadsTela.tsx:110`; `ConversasTela.tsx:273`; `ListaInternas.tsx:218`; `widgets-inicio.tsx:463`; `cliente/mais.tsx:39`), em `text-[10px]` | `text-[10px]` está abaixo do mínimo (11px só para a hora) | `Contador` (variante `neutro`), 11px |
| **Botão** | `Button` (7 variantes, 5 tamanhos) | 1.103 usos | 368 `<button>` crus: links sublinhados (~30, com `underline`, `underline-offset-2/4`, 11/12/14px), linhas clicáveis (~45), card clicável (~15), ícone redondo (~10), chips; ~100 `<Button className="rounded-full">` e `h-7 rounded-full` (pílula sem variante); `Mini` (`gestao.tsx:55`, 17 usos) | pílula e link sem variante; `BotaoFeito`/`BotaoIr`/`BotaoAba`/`LinkWidget` envolvem `Button` com ação | `Button` ganha `forma="pilula"` e tamanho `xs`; `variant="link"` passa a ser o link de texto |
| **Grupo de botões / chips** | `Fichas` (16) | — | ~25: `Ficha` (`config/comum-s09.tsx:45`) com cópias em `EscritorioTela`, `UsuariosTela` (2), `integrantes-s09`; `Chip` do cliente; categorias da `CentralAvisos` (ativo `bg-foreground`); chips de sugestão (`shadow-contorno rounded-full px-3 py-1`); `Alternar` (`ListaTarefas.tsx:187`) | dois estilos de ativo (`bg-raised` com borda e `bg-foreground text-background`) | `Fichas` e `Ficha` |
| **Abas** | `AbasSegmentadas` (pílula com motion), `Tabs` (sem uso) | 2 usos | — | — | `AbasSegmentadas`; `Tabs` sai |
| **Segmentado** | `Segmentado` (`ui/formulario.tsx:147`, 49 usos) | — | 28 trilhos à mão: Painel 9 (`dp.tsx:91`, `trilha/faixa.tsx:117`, `trilha/index.tsx:45`, `ListaTarefas.tsx:117`, `widgets-inicio.tsx:210`, `minha-fila.tsx:54`, `ficha-cliente.tsx:133`), CRM 6 (`LeadsTela.tsx:48`, `ConversasTela.tsx:165/839`, `ComunicadosTela.tsx:327/402`, `NumerosTela.tsx:145`), app do cliente e config 5, base 6 (`calendario.tsx:197`, `interface.tsx:309`, `PainelLab.tsx:160`, `conta.tsx:124`, `cartoes-s01.tsx:193`, tamanhos do `Widget`) | trilho `p-0.5`, `p-1`, `p-[3px]`; ativo `bg-background shadow-xs` ou `bg-raised shadow-pilula`; papel `tablist`, `radiogroup` ou `aria-pressed` | `Segmentado` |

## 4. Campos

| Peça | Componente | Feito à mão | Duplicatas | Destino |
| --- | --- | --- | --- | --- |
| **Campo de texto** | `CampoTexto` (61), `Campo` (66) | ~40 `input` (gestao 10 selects, dp 6, cliente/servicos 6, TemaTela, IntegrantesTela, ConfigBpo) | `Input` (`ui/input.tsx`, `border-input h-9`) contra `CampoTexto` (`bg-raised shadow-contorno h-10`); `Entrada` (`tarefas/pecas.tsx`); `Campo`/`classeCampo` (`cliente/pecas.tsx`, h-11, **mesmo nome do `Campo` do kit**); const `campo` em `cliente/servicos.tsx:19` | `CampoTexto` (h-10, toque 44px por `--alvo-toque`) |
| **Seletor** | `CampoEscolha` (64) | 23 `select` (h-7, h-8, h-9; `rounded` e `rounded-md`) | `FiltroSelect` (`tarefas/pecas.tsx`), select pílula em `widgets-inicio.tsx:224` | `CampoEscolha` e `Filtro` |
| **Área de texto** | `CampoArea` (29) | 14 `textarea` (composer do CRM, `comunicados.tsx:205`, `CampoInterno` da interna) | `AreaTexto` em `tarefas/pecas.tsx` e `cliente/pecas.tsx`; `CampoChat` em `compostos` | `CampoArea`; `CampoChat` para os compositores |
| **Caixa de seleção** | `CaixaSelecao` (6) | ~44 checkbox nativos (`accent-foreground`, `accent-primary`) | — | `CaixaSelecao` |
| **Liga/desliga** | `Interruptor` (34) | preferências do app (`cliente/empresa.tsx:754`) | — | `Interruptor` |
| **Controle deslizante** | — (não existe) | 18 `range` (`timesheet/configuracao`, `financeiro/configuracao`, `CobrancaTela`, `ResultadoTela`, `ConfigBpo`), sem rótulo associado (B-5) | — | `Deslizante` (novo, com rótulo) |
| **Busca** | — (não existe) | 15: `ClientesTela.tsx:82` e `ArquivosTela.tsx:99` (idênticas), `ConversasTela.tsx:190`, `ListaInternas.tsx:70`, `NovaConversa.tsx:22`, `ContratosTela.tsx:284`, `CobrancaTela.tsx:120`, `VisaoBpo.tsx:545`, `cliente/documentos.tsx:107`, `fila.tsx:169`; `BuscaGlobal` (modal) | dois padrões (pílula `h-9` e campo com ícone absoluto `h-8`) | `Busca` (novo) |
| **Passos** | `Passos` (6) | `Passos` local em `timesheet/configuracao.tsx:20`; `crm/config/Numero.tsx:58`; ~11 círculos numerados | — | `Passos` |

## 5. Estados

| Peça | Componente | Feito à mão | Duplicatas | Destino |
| --- | --- | --- | --- | --- |
| **Vazio** | `EstadoVazio` (114) | ~160 `<p>`/`<li>` "Nenhum…/Nada…" (`text-sm` ou `text-xs`, `py-2` a `py-10`, com e sem `text-center`; `societario.tsx:629` nem é suave); vazios da base em `seletor-cliente.tsx:187`, `busca-global.tsx:154`, `interface.tsx:327` | `VazioWidget` (sem uso), `Vazio` (`s03/pecas.tsx:122`, 15 usos), `Lista` com vazio embutido (`dp.tsx:72`) | `EstadoVazio` (com `compacto` e `linha` para dentro de lista) |
| **Carregando** | `Carregando` (16) | ~13 (spinners de borda `border-2 border-t-foreground animate-spin`; `role=status` em texto) | girador no meio do card contra o esqueleto que o padrão pede | `Carregando linhas=` |
| **Erro** | `EstadoErro` (36) | `Erro` duplicado em `fiscal.tsx:109` e `contabil.tsx:137` | — | `EstadoErro` |

## 6. Dados visuais

| Peça | Componente | Feito à mão | Destino |
| --- | --- | --- | --- |
| **KPI / número** | `Numero` (`blocos.tsx`, 16; `text-2xl sm:text-3xl`), `Numero` (`painel/Tabela.tsx`, 13; `text-4xl`), `ConteudoIndicador` | ~50 (`font-heading font-light tabular-nums` em 20/24/30/36px); KPI que é filtro (`aria-pressed`, `obrigacoes.tsx:438`, `societario.tsx:984`, `widgets-inicio.tsx:336`); `Numero` duplicado em `widgets-inicio.tsx:75` | `Kpi` (novo): `tamanho` (`grande` 36 decide, `medio` 24 contexto), `tom`, `pressionado`/`onClick` |
| **Barra de uso / progresso** | `BarraUso`, `Medidor`, `MedidorSublimite`, `Confianca`, `ProgressoTrabalho` | ~30 trilhos `bg-sunken h-1.5/h-2 rounded-full` com largura em linha, só alguns com `role=meter`; `Barra` (`s03/pecas.tsx:141`), `Progresso` (`cliente/pecas.tsx:274`) | `Barra` (novo, `role=meter`, limiar de atenção) |
| **Gráfico de barras** | — | 11: `timesheet/graficos.tsx` (`ColunasEmpilhadas`, `LinhasEmpilhadas`, `Barras`, `Divergente`, `Capacidade`), `BarrasReais` (`financeiro/comum.tsx:209`, mesma grade de `Barras`), `FluxoMensal`, `Metricas` (Leads), `gestao.tsx:346/391`, `GestaoBpo.tsx:940`, `ConectoresTela.tsx:745`, `RaioXTela.tsx:314` | `BarrasHorizontais` (une `Barras` e `BarrasReais`); os outros ficam na tela, com as regras do Lab |
| **Linha do tempo** | `LinhaDoTempo` (`compostos/widgets.tsx:116`, 1 uso) | 24: `anatomia.tsx:149`, `societario.tsx:154`, `gavetas.tsx:462`, `ficha-cliente.tsx:557`, `trilha/faixa.tsx`, `gestao.tsx:793`, `ContratosTela.tsx:465`, `CobrancaTela.tsx:416`, `interna/pecas.tsx:211`, `ConfigBpo.tsx:265`, `fila.tsx:628`, `secoes.tsx:462`, `AprovacoesBpo.tsx:604/665`, `cliente/bpo.tsx:374`, `FichaEmpresa.tsx:429`, `Contratantes.tsx:727`; bolinha com offset `-left-[4.5px]`, `-left-[21px]`, coluna de data `w-12`/`w-16`/`w-20`/`w-24` | `LinhaDoTempo` (data em trilha `auto`) |
| **Kanban** | `Quadro` (`kit/ordenavel.tsx`) | quadro próprio de Leads (`LeadsTela.tsx:64–168`); cartão do quadro à mão (`ListaTarefas.tsx:335`) | `Quadro` |
| **Calendário** | `Calendario`, `CalendarioSemana` | `Calendario` homônimo em `bpo/operacao/rotinas.tsx:189` (5 colunas de ~60px no celular, B-1); `CalendarioEntregas`; `SemanaCarteira` (`obrigacoes.tsx:962`); `SemanaManual` | `Calendario` (no celular, o dia) |
| **Bolha de chat** | `BolhaChat` | `crm/itens.tsx:128`, `config/Modelos.tsx:225`, `s05/acoes.tsx:341` (`rounded-[18px]` + canto de 6px) | `BolhaChat` |
| **Avatar e orb** | `Avatar`, `Orb`, `GrupoOrbs`, `EspelhoOrbs` | iniciais à mão em `societario.tsx:208`, `UsuariosTela.tsx:87`, `RelatorioBpo.tsx:38` | `Avatar` |

## 7. Moldura

| Peça | Componente | Observação |
| --- | --- | --- |
| Barra lateral | `BarraLateral` | `ItemMenu` privado; ícones duotone/preenchido (proposta 5) |
| Menu inferior (sistema) | privado em `Moldura.tsx:148` | — |
| Menu inferior (app do cliente) | à mão em `ClienteApp.tsx:208` (e lateral `w-48` em `:156`) | rótulo em 11px |
| Cabeçalho de página | `CabecalhoModulo`, `CabecalhoAba`, `CabecalhoIntegrante` | h1 `text-2xl font-light sm:text-3xl` repetido em 5 telas de topo (`ArquivosTela`, `ClientesTela`, `VisaoGeralTela`, `AssistenteTela`, `LoginTela`) → `CabecalhoPagina` |
| Cabeçalho de card / seção | `TituloBloco` (138 usos), `CabecalhoSecao`, cabeçalho do `Widget` | `Pergunta` duplicado (`timesheet/graficos.tsx:50`, `financeiro/comum.tsx:196`, 67 usos); `CardHeader` sem uso; `Secao` em 6 arquivos; ~12 rótulos em caixa alta (`text-[11px] tracking-wide uppercase`: `ConversasTela.tsx:1141`, `LeadsTela.tsx:254/293/401`, `config/Listas.tsx:34`, `ListaInternas.tsx:150/173`), contra a tipografia | `TituloBloco`; caixa alta sai |
| Seletor de cliente, busca global, sino, painel da demonstração, "ver como" | `SeletorCliente`, `BuscaGlobal`, `CentralAvisos`, `PainelLab`, `VerComoSeletor` | — |

## 8. Rolagem (antes da fase 2)

90 `overflow-*-auto` em 62 arquivos. **42 sem esmaecido:**

- **Horizontais sem `esmaecer-lados` (18):** `Tabela` (`painel/Tabela.tsx:9`: tinha `data-rolagem-horizontal`, mas o script só media `.esmaecer-lados`), `documentos-aba.tsx:169`, `ListaTarefas.tsx:178` (calendário) e `:317` (quadro por responsável), `VisaoGeralTela.tsx:183`, `LeadsTela.tsx:64` (kanban), `NumerosTela.tsx:79/145`, `lancamento.tsx:304`, `EquipeTela.tsx:356/577`, `ResultadoTela.tsx:102`, `cartoes-chat.tsx:164`, `lista-integrantes.tsx:91`, `visualizador-documento.tsx:213`, `interface.tsx:318`, `PermissoesTela.tsx:117` (usava a classe vertical), `RaioXTela.tsx:272`.
- **Verticais sem esmaecido (24):** colunas do `Quadro` (`ordenavel.tsx:108`), `gestao.tsx:594/793`, `trilha/index.tsx:506`, `notas/blocos.tsx:274/569/729`, `s05/acoes.tsx:146/338`, `ConversasInternasTela.tsx:160`, `interna/pecas.tsx:620`, `NovaConversa.tsx:26`, `AprovacoesBpo.tsx:665`, `Contratantes.tsx:338`, `PortalConvidado.tsx:93/127`, `VitrineKit.tsx:485`, e os que rolavam a caixa inteira: `DialogContent` (`novo-integrante.tsx:152`, `RelatorioBpo.tsx:95/195`), `SheetContent` (`FichaEmpresa.tsx:210`, com cabeçalho `sticky` que o esmaecido cobria; `fila.tsx:467`), `PopoverContent` (`PainelLab.tsx:113`).
- **Tabela com cabeçalho fixo cortando seco ("Captura da carteira", `notas/blocos.tsx:1140`):** a `Tabela` tem `h-full` e `overflow-x-auto`, o que também liga a rolagem vertical na própria `div`; dentro do widget, é ela que rola para baixo, sem esmaecido, e a primeira linha some seca sob o `thead` fixo. O corpo do widget (que esmaece) não chega a rolar. Vale para todas as 24 `Tabela` do Painel.
- **Modais sem rolagem nenhuma:** o `DialogContent` base não tinha altura máxima; modal longo saía da tela.
- Nenhum `area-rolagem-ambos` existia; a classe `.area-rolagem` (só topo) era usada nas páginas.

## 9. Colunas fixas que deixam um elemento invadir o vizinho

O padrão do defeito: trilha de largura fixa (`7rem`, `w-24`) com conteúdo que não quebra (`Badge` `whitespace-nowrap shrink-0`, `brl()` com espaço inseparável após "R$") e `justify-end`/`text-right`: o excesso vaza **para a esquerda**, por cima da coluna vizinha.

| Risco | Onde | Coluna | Conteúdo |
| --- | --- | --- | --- |
| **Alto (caso de teste)** | `tarefas/ListaTarefas.tsx:204` | `7rem` (status) | orb 16px + `Badge` "aguard. cliente (2 d)" + botão 28px ≈ 190px: cobre "manual · 2 d" (`6rem`). "aguard. órgão" e "em andamento" também passam |
| Alto | `financeiro/ContratosTela.tsx:319` | `8rem` | `Badge` "aguardando assinatura" (~150px) sobre a coluna de valor |
| Alto | `financeiro/VisaoFinTela.tsx:144` | `7rem` | `brl` + `Badge` "abaixo" (~135px) |
| Alto | `bpo/operacao/secoes.tsx:422/524`, `AprovacoesBpo.tsx:292`, `cliente/servicos.tsx:813` | `w-24` | `brl` com centavos (≥ R$ 10.000,00 ≈ 100px) sobre o `Badge` ou o botão |
| Médio | `CobrancaTela.tsx:145` (`10rem`, `SeloSituacao` "aguardando confirmação"), `ConciliacaoTela.tsx:143` e `financeiro/pecas.tsx:278` (`7rem`, `brl`), `timesheet/graficos.tsx:211` e `financeiro/comum.tsx:215` (`7.5rem`, `brl` + %), `GestaoBpo.tsx:891/901` (`4rem`/`5rem`), `notas/blocos.tsx:385` (`Badge w-16`), `secoes.tsx:130/272/508`, `AprovacoesBpo.tsx:393`, `GestaoBpo.tsx:646` | | |
| Médio (estrutura) | `ListaTarefas.tsx:154` × `:204` | cabeçalho e linha com grades diferentes | colunas desalinhadas ~4px por vão |
| Baixo | `ListaTarefas.tsx:204` (Responsável `9.5rem` sem truncar), `gavetas-integrante.tsx:388`, `gestao.tsx:93/344`, `graficos.tsx:149/182/283`, `ResultadoTela.tsx:198`, `VisaoFinTela.tsx:161`, `CobrancaTela.tsx:416`, `LeadsTela.tsx:492/515`, `Contratantes.tsx:935`, `VisaoBpo.tsx:651`, `fila.tsx:364`, `GestaoBpo.tsx:667/1026`, `Contratantes.tsx:1006` | | quebra de linha ou sobra pequena |

**Correção na raiz (fase 2):** trilha `auto` (do tamanho do conteúdo) para selo, valor e ação; trilha fluida `minmax(0,1fr)` para o texto, que trunca com `title`; `min-w-0` em toda célula; selo que nunca passa do contêiner e trunca; no estreito, o selo desce para a linha de baixo.

## 10. Plano da fase 2 (o que este inventário pede)

1. `AreaRolagem` (`ui/area-rolagem.tsx`) como primitiva única, `eixo="y|x|ambos"`, sempre com esmaecido; cabeçalho fixo (`data-cabecalho-fixo`) empurra o esmaecido do topo para baixo dele. Regra automática `scripts/regra-rolagem.cjs` no `npm run build`.
2. `DialogContent` e `SheetContent`/`SheetCorpo` com corpo rolável.
3. `ListaColunas`/`LinhaColunas`/`Celula` e `Badge` que trunca; trocar `ListaTarefas` e as linhas da seção 9.
4. Subir para o kit e unificar: `Tabela`+`Celula`, `Linha`, `Kpi`, `Bloco`, `Aviso`, `Busca`, `Deslizante`, `Barra`, `LinhaDoTempo`, `CabecalhoPagina`; tom `neutro` no `Badge` e no `Contador`; `Button` pílula; tirar `Card`, `Tabs`, `List`, `Input`, `VazioWidget` sem uso.
5. Trocar os usos à mão nas telas pela peça do kit, começando pelo que o QA da fase 4 acusar (resolver um resolve os outros).
