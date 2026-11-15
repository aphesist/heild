# QA de interface: o que fica para as sessões de tela

**15/11/2026 · versão 2 · direção de design de interface (branch `wf-design-stunning`).** Revisão do QA de UI/UX depois da direção visual (`DIRECAO_VISUAL.md`) e do padrão de interface versão 2 (`PADRAO_DE_INTERFACE.md`). A versão 1 (branch `wf-qa-padrao`) fechava os vãos da grade esticando widgets; esta tira o esticamento, faz o tamanho vir do conteúdo e da tarefa e lista o que sobra por grupo de telas, para virar uma sessão por grupo.

- **Prints:** gerados por `URL_APP=http://localhost:6300/ node scripts/qa-interface.cjs <pasta>` (não vão para o git). O nome é a rota e a largura: `painel_contabil_cliente_todos--1440.png` é `#/painel/contabil?cliente=todos` em 1440. O `qa-interface.json` da mesma pasta tem cada achado.
- **Prioridade:** **A** atrapalha o uso ou quebra a regra do padrão (vaza, corta, rola de lado, buraco grande); **B** organização ou proporção ruim, mas usável; **C** acabamento.
- **Item resolvido pela base** fica riscado na tabela do grupo, com o porquê, para a sessão não refazer.

## 1. O que a base resolve agora (versão 2)

| Antes (versão 1) | Agora | Onde |
| --- | --- | --- |
| A grade fechava vão esticando o vizinho (para o lado e para baixo); o card ganhava altura sem ganhar conteúdo (Implantações 60% vazio, Fila de assinatura vazia em G, Atrasos e riscos, Pré-requisitos, Regras e Ações esticados) | O tamanho dá a largura e o teto; a altura é a que o conteúdo pede, medida em módulos de 4px; nenhum widget estica para fechar vão | `arranjar` e `useAlturas` (`components/widgets/tipos.ts`, `grade.tsx`) |
| Buraco evitado só pela ordem fixa do arranjo padrão | Empacotamento na ordem com janela de três: vai primeiro, entre o próximo e os dois seguintes, o que deixa menos buraco; quem tem mais conteúdo que o teto desce para o espaço livre abaixo; acerto de fundo de até meia célula | `empacotar`, `tipos.ts` |
| Kanban e calendário na largura inteira por regra fixa (`larguraTotal`) | Largura pela `larguraMinima` do conteúdo (kanban de quatro etapas: 64rem; semana: 66rem): inteira até 1152px, e no ultrawide sobra lugar ao lado | `widgets-inicio.tsx`, `painel/contabil.tsx` |
| Etapa do kanban com um cartão virava coluna afundada da altura da maior | Coluna da altura do que carrega; etapa vazia diz "Nada nesta etapa · arraste para cá"; raios aninhados | `Quadro` (`components/kit/ordenavel.tsx`) |
| Título do P cortado ("Conversas sem respo…") e ícone empurrado para cima do título | Ícone e título numa linha; no P o título vai a duas linhas | `widget.tsx` |
| Códigos do mapa (`CTB-026; D-21`) em mono ao lado de todo título | Só ao passar o mouse ou com foco no card, e no `title` | `widget.tsx` |
| Ícones em duotone e raios soltos (`rounded-[24px]`, `14px`, `18px`) nos componentes base | Phosphor regular; `rounded-cartao` (20), `rounded-campo` (24), `rounded-xl` (diálogo), `rounded-lg`, `rounded-md`, `rounded-sm` | `components/` (tokens novos em `index.css`, proporcionais ao raio do tema) |
| Faixa que rola de lado sem avisar (abas do Painel no celular, kanban) | A borda esmaece 24px quando há mais conteúdo daquele lado (`esmaecer-lados`) | `index.css`, `lib/esmaecer-rolagem.ts`, `AbasSegmentadas`, `Quadro` |
| Tabela sem números tabulares e com cabeçalho em 500 | `tabular-nums` na tabela inteira, cabeçalho no estilo rótulo (12/400) com borda de base | `telas/painel/Tabela.tsx` |
| Estados com ícone duotone e esqueleto/girador animando com movimento reduzido | Ícone regular, título equilibrado, nada anima com movimento reduzido | `components/kit/estados.tsx` |
| Abas do kit (`TabsList`) com a pílula em `background` e `shadow-sm` | Trilho rebaixado com `inset-shadow-trilho`, pílula `raised` com `shadow-pilula` | `components/ui/tabs.tsx` |
| QA contava a sobra da última faixa como buraco | Buraco no meio é célula vazia com widget embaixo; vão sob card na grade de widgets conta acima de uma célula | `scripts/qa-interface.cjs` |

O que a versão 1 já resolvia (e continua): sem rolagem lateral no celular, alvo de toque de 44px, botão que quebra o rótulo, cabeçalho que desce a ação, margem de 16px, `md:pb-24` sob o botão Chat, estados vazios centralizados.

## 2. Contagem do script (antes → depois)

Na seção 4. Em resumo: os widgets com mais da metade vazia somem (21 a 24 por largura → 0), nada sobra de célula vazia no meio da grade de widgets, e o que fica em `buraco` é quase todo fora da grade de widgets (colunas e cards esticados das telas com `Caixa`), que é trabalho de cada grupo (seção 3).

## 3. Por grupo de telas

Cada linha: tela, problema, print, correção, prioridade. Os prints são do `qa-interface.cjs` na versão deste branch.

### Comum a todos os grupos (cada sessão no seu arquivo)

| # | Problema | Onde | Correção | Prior. |
| --- | --- | --- | --- | --- |
| X-1 | Raios soltos fora dos componentes base | `rounded-[NNpx]`: painel 90, cliente 89, crm 72, bpo 53, timesheet 36, config 35, interna 30, financeiro 27, inicio 12, arquivos 4 | Cartão/caixa → `rounded-cartao`; bloco dentro do cartão → `rounded-lg`; item, miniatura e campo pequeno → `rounded-md`/`rounded-sm`; diálogo e gaveta → `rounded-xl` (forma.md: o de dentro menor que o de fora) | C |
| X-2 | Ícones em duotone nas telas | bpo 9, config 7, painel 5, crm 2, timesheet 2, financeiro 2, interna 1 (`grep -rn 'weight="duotone"' src/telas`) | Tirar o `weight` (Phosphor regular) | C |
| X-3 | Card esticado e coluna com vão fora da grade de widgets | ver os grupos | Padrão, seção 5 "Fora da grade de widgets": pilha na coluna curta, `items-start` com vizinho embaixo, lateral `sticky`, ou masonry consciente | A/B |
| X-4 | Widget "Ações" com três formas de botão (pílula, cartão com contorno, cartão rebaixado) | todas as abas do Painel, `painel_*--1440.png` | Uma forma só: linha de ação (ícone, verbo + objeto, contagem à direita, "executar/preparar/com aprovação" como selo); aceitar M e L | B |

### Início (S01)

| # | Problema | Print | Correção proposta | Prior. |
| --- | --- | --- | --- | --- |
| ~~I-1~~ | ~~Implantações em G com 2 linhas: 64% vazio~~ | — | Resolvido pela base: a altura segue o conteúdo | — |
| ~~I-2~~ | ~~KPIs P com título truncado~~ | — | Resolvido pela base: título do P em duas linhas | — |
| I-3 | Time (chat): bolha com "Enviar ao cliente" e anexos estoura a largura no celular | `inicio_time--390.png` | Ações do cartão de documento em linha própria abaixo do nome no celular | B |
| I-4 | Toasts empilhados (até 2) cobrem ~25% da tela no celular e o campo de resposta no CRM em 1024 | `crm_conversas--390.png`, `crm_conversas--1024.png` | Toaster: no máximo 1 visível no celular, acima do menu inferior, e desviar do campo de resposta | A |
| I-5 | Visão geral em 1024 e 768: a Linha do tempo termina 216px acima do Time agora (fim desalinhado) | `inicio_visao--1024.png` | Em `padraoDoPapel`: Time agora em M (só os orbs) no papel Administrador, ou a Linha do tempo antes de Pendências | C |
| I-6 | Prazos (M) desce para depois do calendário em 1024 (a grade evita o vão ao lado do calendário) | `inicio_visao--1024.png` | Se Prazos tem de ficar no topo: em L (três números na largura de quatro colunas) quando a grade tem 4 colunas, ou como quinto KPI em P | C |

### Painel A/B/C (S02, S03, S04)

| # | Problema | Print | Correção proposta | Prior. |
| --- | --- | --- | --- | --- |
| P-1 | Ações: altura já segue o conteúdo; falta a forma única e os tamanhos M e L | `painel_obrigacoes_cliente_c1--1440.png` | X-4 | B |
| ~~P-2~~ | ~~Widgets G com pouco conteúdo de exemplo (Clientes por estado, Campanha do IRPF, Fila de assinatura…)~~ | — | Resolvido pela base: o card tem a altura do conteúdo, estado vazio em uma célula | — |
| ~~P-3~~ | ~~Celular: XL de lista com 600px e 35–40% ocupado~~ | — | Resolvido pela base | — |
| P-4 | Gestão: "Moldes das trilhas" com coluna esticada e 125px vazios dentro de Processos | `painel_gestao_cliente_todos--1440.png` | Os dois blocos em pilha única, ou a lista de moldes ocupar a altura | C |
| P-5 | DP com cliente: selo "4 dias · S-2200 até 22/11" vaza do card no celular; campo "Empregado do termo" com 40px de largura no tablet | `painel_dp_cliente_c1--390.png`, `painel_dp_cliente_c1--768.png` | `Contagem` com `flex-wrap`; o campo em linha própria abaixo de `md` | B |
| P-6 | Obrigações: matriz obrigação × cliente com 7+ colunas em G | `painel_obrigacoes_cliente_todos--1024.png` | XL com `larguraMinima` (colunas × 6rem) | B |
| ~~P-7~~ | ~~Abas do Painel rolam de lado no celular sem indicar~~ | — | Resolvido pela base: borda esmaecida (`esmaecer-lados`) | — |
| P-8 | Kanban no celular dentro do card (cartão sobre coluna sobre widget); colunas de ~250px | `painel_contabil_cliente_todos--390.png` | No celular, "Abrir quadro" em gaveta larga; no widget, a contagem por etapa | C |
| P-9 | Fim desalinhado (sobra de mais de uma célula na última faixa) | Gestão `painel_gestao_cliente_todos--1440.png` (Relatórios, 256px); DP carteira `painel_dp_cliente_todos--1440.png` (Relatórios, 180px) e `--1024` (Ações, 192px); Societário com cliente `painel_societario_cliente_c1--1440.png` (Documentos, 200px) | Ordem em `padroes.ts`: o widget curto do fim vai para junto de outro curto (ex.: Gestão `… atalhos:M relatorios:M fase3:M acoes:G tarefas:XL`; DP carteira `relatorios:M` antes de `acoes:G`). Conferir em 1440 e 1024 | C |
| P-10 | "Pedir ao <integrante>" em M corta as sugestões (passa do teto) | `painel_fiscal_cliente_todos--1440.png` (Pedir ao Fiscal) | G, ou no fim do arranjo (como no Contábil da carteira), onde ganha a altura que pede | C |

### CRM e comunicação interna (S05)

| # | Problema | Print | Correção proposta | Prior. |
| --- | --- | --- | --- | --- |
| C-1 | Conversas em 768: botão "Enviar" vaza 67px do campo de resposta | `crm_conversas--768.png` | Barra do campo com `flex-wrap` ou ícones recolhidos em "mais" abaixo de 900px | A |
| C-2 | Conversas em 1024: botão Chat flutuante cobre a última mensagem; o toast cobre o campo | `crm_conversas--1024.png` | `GavetaChat acima` também em 1024 e no toast | A |
| C-3 | Leads (quadro próprio, fora do `Quadro` do kit): muitas etapas pedem rolagem lateral em 1024, sem borda esmaecida | `crm_leads--1024.png` | Usar o `Quadro` do kit (colunas da altura do conteúdo, etapa vazia, `esmaecer-lados`); recolher "Perdido" e "Implantação" em colunas estreitas com contagem | B |
| C-4 | Comunicados: cabeçalho do envio aperta código, data e dois botões numa linha | `crm_comunicados--390.png` | Ações em linha própria no celular | C |
| C-5 | Conversas internas: aviso de primeiro uso cobre a tela (esperado na primeira visita) | `interna_conversas--1024.png` | Nada; só registrar que o aviso não volta depois de "Entendi" | C |

### Timesheet (S06)

| # | Problema | Print | Correção proposta | Prior. |
| --- | --- | --- | --- | --- |
| T-1 | Meu tempo: a coluna larga acaba em ~690px e a lateral vai até ~1360px: 671px de vão sob "Onde foi o meu dia" (1440 e 1024) | `timesheet_meu--1440.png` | "O que meus integrantes fizeram" para a coluna larga, abaixo de "Onde foi o meu dia"; a lateral fica com Lançar à mão, Extensão e Contestações | A |
| T-2 | Confirmações: 420px vazios sob a lista do dia | `timesheet_confirmacoes--1440.png` | Lateral `lg:sticky lg:top-0 self-start`, ou resumo em faixa em cima e lista em largura inteira | A |
| T-3 | Equipe e Rentabilidade em 1024: tudo em uma coluna, gráfico de 3 barras com 600px | `timesheet_equipe--1024.png` | Gráfico de captura em M ao lado do "por que a cobertura não é maior" a partir de `lg` | B |
| T-4 | "Lançar tempo" três vezes na mesma tela (cabeçalho, card "Lançar tempo à mão" e o botão dele) | `timesheet_meu--1440.png` | Uma ação, uma forma: o botão do cabeçalho abre o lançamento; o card vira o formulário sem repetir o título no botão ("Salvar") | B |

### Financeiro (S07)

| # | Problema | Print | Correção proposta | Prior. |
| --- | --- | --- | --- | --- |
| F-1 | Cobranças: "Quem está devendo?" esticado com 163px vazios ao lado da régua; em 1024, "Pede sua aprovação" com 102px vazios | `financeiro_cobranca--1440.png`, `--1024.png` | Régua e devedores em pilha na coluna estreita, ou régua em faixa horizontal acima | B |
| F-2 | Resultado: "Orçado × realizado" (desligado) esticado com 212px vazios (268px em 1024, e "Cenários de caixa" 216px) | `financeiro_resultado--1440.png` | Card desligado em estado vazio compacto e "Cenários" ao lado; `items-start` | B |
| F-3 | Conciliação em 768: KPI "R$ 154.730" vaza do card; página rola 7px de lado | `financeiro_conciliacao--768.png` | KPIs em `grid-cols-2` até `lg`; número em `text-xl` abaixo de `lg` | A |
| F-4 | Visão geral: "Precisa de você" e "Receita por setor" esticados até a altura do vizinho | `financeiro_visao--1440.png` | Segunda linha `items-start`, ou "Receita por setor" em pilha com "Vencidas por idade" | C |

### BPO: visão, operação, aprovações e gestão (S08a a S08d)

| # | Problema | Print | Correção proposta | Prior. |
| --- | --- | --- | --- | --- |
| B-1 | Rotinas com empresa: calendário com 5 colunas de ~60px no celular, texto truncado em 4 letras | `bpo_rotinas_cliente_c2--390.png` | No celular, calendário em lista por dia | A |
| B-2 | Rotinas: checklist em três colunas com alturas diferentes (156px vazios em 1440, 248px em 768) | `bpo_rotinas_cliente_c2--768.png` | Colunas em pilha abaixo de `lg`; acima, `items-start` | B |
| B-3 | Entregas e SLA em 1024: nome do relatório quebra em 4 linhas ao lado de dois botões | `bpo_entregas_cliente_todos--1024.png` | Uma coluna até `xl`; botões abaixo do nome | B |
| B-4 | Configuração: card "Contas a Receber" esticado com 240–340px vazios | `bpo_configuracao_cliente_todos--1440.png` | Grade 2×2 com `items-start` e conteúdo equivalente, ou masonry consciente | B |
| B-5 | Configuração: controles deslizantes sem rótulo associado | `bpo_configuracao_cliente_todos--390.png` | `label htmlFor` ou `aria-label` | B |
| B-6 | Visão geral em 1024: "Precisa de decisão" esticado com 324px vazios | `bpo_visao_cliente_todos--1024.png` | Lista de decisões com altura natural e "Por analista" abaixo, na mesma coluna | B |
| B-7 | Aprovações com empresa em 1024: card "Contas a Pagar" com 84px de vão embaixo | `bpo_aprovacoes_cliente_c2--1024.png` | `items-start` na faixa de resumo ou cards com a mesma estrutura | C |

### Arquivos e Configurações (S09)

| # | Problema | Print | Correção proposta | Prior. |
| --- | --- | --- | --- | --- |
| A-1 | Arquivos › Pastas: conteúdo da pasta esticado à altura da árvore (313px vazios) | `arquivos_pastas--1440.png` | Árvore com rolagem própria (`max-h-[70vh]`), conteúdo com altura natural (`items-start`) | B |
| A-2 | Armazenamento: "Raio-X do Drive" esticado com 422px vazios (486px em 1024) | `config_armazenamento--1440.png` | Raio-X em largura inteira abaixo, ou os dois cards em pilha | B |
| A-3 | Permissões: "Nunca liberável" esticado com ~390px vazios ao lado da matriz | `config_permissoes--1440.png` | "Nunca liberável" em faixa acima da matriz | B |
| A-4 | Tema em 1024: e-mail do escritório vaza 25px do card; nomes dos integrantes truncados em chips de ~80px | `config_tema--1024.png` | `break-all` no e-mail; grade de 2 colunas até `xl` | B |
| A-5 | Integrantes: coluna "Clientes-piloto" com 108px vazios | `config_integrantes--1440.png` | Pilha única abaixo de `xl` | C |
| A-6 | Configurações no celular são só leitura (decidido); conferir que nenhum campo aparece editável | `config_usuarios--390.png` | Nada; teste por tela | C |

### App do cliente (S10)

| # | Problema | Print | Correção proposta | Prior. |
| --- | --- | --- | --- | --- |
| K-1 | Atalhos do Início ("Certidões", "Recalcular guia"…) cortados na borda direita sem indicar que rolam | `app_inicio--390.png` | Pôr `esmaecer-lados` na faixa (`cliente/inicio.tsx`, `cliente/pecas.tsx`, `cliente/servicos.tsx`: os `div` com `overflow-x-auto`) | C |
| K-2 | Documentos e Financeiro: rodapé do card colado ao menu inferior | `app_documentos--390.png` | `pb` extra igual à altura do menu inferior na área de rolagem | C |

## 4. Contagem do script

Números de `qa-interface.cjs` (67 rotas por largura). **Antes** é a versão de partida deste branch (`wireframe`, e5732a7, que já trazia a versão 1 do QA); **depois** é este branch. As duas colunas foram medidas com o script deste branch (buraco no meio = célula vazia com widget embaixo; vão sob card na grade de widgets acima de uma célula). Com o script antigo, o antes dá os mesmos números (a grade esticada não tinha sobra na última faixa). A categoria `toque` só é medida em 768 e 390.

| Largura | Rolagem | Texto | Toque | Vazio | Buraco | Total |
| --- | --- | --- | --- | --- | --- | --- |
| 1440 | 0 → 0 | 0 → 0 | — | 21 → 0 | 12 → 16 | 33 → 16 |
| 1024 | 0 → 0 | 1 → 1 | — | 24 → 0 | 13 → 15 | 38 → 16 |
| 768 | 1 → 1 | 2 → 2 | 1 → 1 | 20 → 0 | 5 → 7 | 29 → 11 |
| 390 | 0 → 0 | 0 → 0 | 0 → 0 | 20 → 0 | 0 → 0 | 20 → 0 |

- **`vazio` zera:** nenhum widget fica com mais da metade do corpo vazio, em nenhuma largura. Era o que o esticamento produzia.
- **`buraco` sobe um pouco, e o que sobe é visível de propósito.** Os 12 de 1440 do antes eram todos fora da grade de widgets; o vão da grade ficava escondido dentro dos cards esticados (era o `vazio`). Depois, os mesmos 12 continuam, nenhum achado é célula vazia no meio da grade de widgets, e entram quatro fins desalinhados de mais de uma célula na última faixa (P-9), que a ordem do arranjo padrão corrige. Por tipo: (a) fora da grade de widgets, colunas e cards esticados das telas com `Caixa` (T-1, T-2, F-1, F-2, F-4, B-2, B-4, B-6, B-7, A-1 a A-3, A-5), que a base não mexe porque cada tela tem sua composição; (b) na grade de widgets, os fins desalinhados (I-5, P-9); (c) P-4, um vão dentro de um widget.
- **`texto`, `rolagem` e `toque` restantes:** A-4 (1024), C-1 e F-3 (768) e o campo de P-5 (768), todos por tela.

## 5. Sessão UI-1 (Início, Painel, CRM e interna): pausada

**15/11/2026.** Pausada a pedido do coordenador (o dono decidiu fazer antes o UI Lab com a componentização). O que ficou neste branch (`wf-ui-1`), sem PR:

- **Contagem de partida nas 26 rotas do grupo** (`qa-interface.cjs`, filtro `^#/(inicio|painel|crm|interna)`): 1440 → 6, 1024 → 2, 768 → 7, 390 → 0 (15 no total). Os achados: I-5 (768 e 1024), P-9 (DP carteira, Societário com cliente, Gestão), P-4 (Moldes das trilhas, 96 a 125px), P-5 (campo "Empregado do termo" 40×44 em 768), C-1 ("Enviar" vaza 67px em 768) e o botão "Fechar notificação" do toast com 43×43 em 768.
- **Feito, conferido na grade:** I-5 e I-6 (`inicio/widgets-inicio.tsx`): Prazos antes dos indicadores, no topo em 4 e 6 colunas (em 4: Prazos, Atrasadas e Vence hoje em cima; Entregues e Conversas abaixo do calendário); Linha do tempo antes de Pendências, o que alinha o fim das colunas em 1024 e 768. Vale também para o papel Gestor.
- **Feito, sem conferir:** P-9 (`painel/padroes.ts`): Gestão com `relatorios:M` antes de `fase3`; DP carteira com `relatorios:M` antes de `acoes`. Falta medir em 1440 e 1024 (e Societário com cliente e P-10 não foram mexidos).
- **Descoberto:** em 1024 o campo de resposta do CRM › Conversas tem mais de 160px de altura, então o botão Chat com `acima` (`bottom-40`) o cobre (C-2). Em `Toasts` (`ambiente/interface.tsx`), o contêiner fica em `bottom-4` (celular `bottom-20`) sem saber do campo, e mostra todas as notificações da fila (I-4).
- **Proposta aprovada pelo coordenador, para o Lab** (mudança em componente compartilhado): (1) `Toasts` mostra só a mais nova no celular (< 640) e fica em `bottom: calc(var(--desvio-campo, 0px) + 1rem)` (no celular, somado aos 80px acima do menu inferior); (2) `--desvio-campo` é posta no `documentElement` pela tela com campo de escrever no canto (CRM › Conversas), medida por ResizeObserver, sem salto ao medir, removida ao desmontar e ao trocar de rota; (3) `GavetaChat acima` usa o mesmo `calc` no lugar de `bottom-36 sm:bottom-40`, e a lista de mensagens ganha `pb` da altura do botão. O botão Chat não some no CRM (decisão de coordenação). Respeitar movimento reduzido.
