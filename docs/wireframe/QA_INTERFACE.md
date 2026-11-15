# QA de interface: o que fica para as sessões de tela

**15/11/2026 · branch `wf-qa-padrao`.** Resultado do QA de UI/UX em todas as rotas, nas larguras 1440×900, 1024×768, 768×1024 e 390×844, contra o `PADRAO_DE_INTERFACE.md`. O que era de base já foi corrigido neste branch (seção 1); o que exige trabalho por tela está na seção 3, por grupo, para virar uma sessão por grupo.

- **Prints:** gerados por `node scripts/qa-interface.cjs <pasta>` (não vão para o git). O nome é a rota e a largura: `painel_contabil_cliente_todos--1440.png` é `#/painel/contabil?cliente=todos` em 1440. O `qa-interface.json` da mesma pasta tem cada achado.
- **Prioridade:** **A** atrapalha o uso ou quebra a regra do padrão (vaza, corta, rola de lado, buraco grande); **B** organização ou proporção ruim, mas usável; **C** acabamento.

## 1. O que a base já resolve (todas as telas)

| Antes | Agora | Onde |
| --- | --- | --- |
| Kanban do fechamento em XL de 4 colunas e 2 células: colunas de 288px fixas, rolagem lateral dentro de 280px de altura | Largura inteira, 3 células de altura; colunas dividem a largura (mín. 15rem), cada uma rola por dentro; no celular 85% com encaixe | `Quadro` (`components/kit/ordenavel.tsx`), `larguraTotal`/`linhasMinimas` |
| Grade com células vazias no meio e meia linha vazia no fim (L de 4 colunas numa grade de 6) | `arranjar`: linhas repartidas, vizinho cobre o vão, vão embaixo vira altura do card | `components/widgets/tipos.ts` |
| 6 colunas em 1024 (células de 135px) | Colunas pela largura do contêiner com célula mínima de ~150px | `colunasPara` |
| Celular: `grid lg:grid-cols-2` virava coluna automática que crescia até o conteúdo e empurrava a página (BPO Visão geral rolava 191px de lado; Comunicados, Conciliação, Time) | Coluna `minmax(0,1fr)` por padrão | `.grid` em `index.css` |
| Todo widget com tabela rolava 4px de lado no celular (margem negativa da `Tabela`) | Sem margem negativa; corpo do widget só rola na vertical | `Tabela.tsx`, `widget.tsx` |
| Rótulo de botão vazava do card (botão sem quebra de linha) | Botão quebra o rótulo e nunca passa da largura do card | `button.tsx`, `lib/utils.ts` |
| ~3.600 alvos de toque abaixo de 44px por largura (abas de 32px, botões de ícone, campos de 32px) | Área de toque invisível de 44px em todo controle, campos com 44px, caixas com 24px | `index.css` (`pointer: coarse`) |
| Ação do cabeçalho do widget empurrava o título para fora no celular | Cabeçalho quebra a ação para a linha de baixo; título com `title` | `widget.tsx` |
| Calendário da Visão geral em 4 de 6 colunas, semana espremida; no celular abria na semana e rolava 214px de lado | Área de trabalho na largura inteira com 3 células; no celular abre no dia | `widgets-inicio.tsx` |
| Margem lateral de 12px no celular (o design system pede 16px) e gap da grade de 12px | `px-4` e `gap-4` | todas as telas |
| Botão Chat cobria o último card da página | `md:pb-24` na área de rolagem | todas as telas |
| Estado vazio no topo do widget com o resto do card vazio | `Vazio`, `VazioWidget` e `EstadoVazio` centralizados e marcados (`data-estado-vazio`) | kit, S03 |

## 2. Contagem do script (antes → depois)

Na seção 4, gerada com o mesmo script nas duas versões. Em resumo: nada rola de lado no celular (25 → 0), os alvos de toque pequenos somem (~3.600 → 0 a 1 por largura) e os buracos caem pela metade; o que resta está na seção 3.

## 3. Por grupo de telas

### Início (S01)

| # | Problema | Print | Correção proposta | Prior. |
| --- | --- | --- | --- | --- |
| I-1 | "Implantações em andamento" em G com 2 linhas: 64% do card vazio | `inicio_visao--1440.png` | Aceitar M no widget e usar M no arranjo do Administrador; G só com mais de 3 implantações | B |
| I-2 | KPIs P com título truncado ("Conversas sem r…") em 1440 e 1024 | `inicio_visao--1024.png` | Títulos curtos nos P ("Sem resposta") ou o número com o rótulo embaixo, sem cabeçalho | C |
| I-3 | Time (chat): bolha com "Enviar ao cliente" e anexos estoura a largura no celular | `inicio_time--390.png` | Ações do cartão de documento em linha própria abaixo do nome no celular (base já quebra; conferir o cartão de aprovação) | B |
| I-4 | Toasts empilhados (até 2) cobrem ~25% da tela no celular e o campo de resposta no CRM em 1024 | `crm_conversas--390.png`, `crm_conversas--1024.png` | Toaster: no máximo 1 visível no celular, acima do menu inferior, e desviar do campo de resposta (`acima`) | A |

### Painel A/B/C (S02, S03, S04)

| # | Problema | Print | Correção proposta | Prior. |
| --- | --- | --- | --- | --- |
| P-1 | Widget "Ações" só aceita G; com 3 ou 4 ações fica 35% ocupado em quase toda aba | `painel_obrigacoes_cliente_c1--1440.png`, `painel_consultoria_cliente_todos--1440.png` | Aceitar M e L (faixa de botões na horizontal); arranjo padrão em L junto das Tarefas | A |
| P-2 | Widgets G com pouco conteúdo de exemplo: Clientes por estado (20%), Acessos pendentes, Campanha do IRPF (23%), Guias da carteira, Eventos posteriores, Termo de ciência, Pareceres, Segunda opinião, Recuperação de créditos, Pauta da reunião, Fila de assinatura, Declaração de faturamento | `painel_societario_cliente_todos--1440.png`, `painel_fiscal_cliente_todos--1440.png`, `painel_consultoria_cliente_c1--1440.png`, `painel_gestao_cliente_todos--1440.png` | Rever `padroes.ts`: M para o que tem até 2 linhas; G só com lista; ou mais dados na semente | B |
| P-3 | Celular: XL de lista (Tarefas, Folha da carteira, Planejamento, Reforma) com 600px e 35–40% ocupado | `painel_dp_cliente_todos--390.png`, `painel_consultoria_cliente_c1--390.png` | Conteúdo de XL no celular mostrar mais itens (o widget recebe G: listar pelo espaço, não por `slice` fixo) | B |
| P-4 | Gestão: "Moldes das trilhas" com coluna esticada e 125px vazios | `painel_gestao_cliente_todos--1440.png` | Os dois blocos em pilha única, ou a lista de moldes ocupar a altura | C |
| P-5 | DP com cliente: selo "4 dias · S-2200 até 22/11" vaza do card no celular | `painel_dp_cliente_c1--390.png` | `Contagem` com quebra (`flex-wrap`) ou texto curto no celular | B |
| P-6 | Obrigações: matriz obrigação × cliente com 7+ colunas em G | `painel_obrigacoes_cliente_todos--1024.png` | Marcar como área de trabalho (`larguraTotal`, XL) | B |
| P-7 | Abas segmentadas do Painel (8) rolam de lado no celular sem indicar que há mais | `painel_contabil_cliente_todos--390.png` | Esmaecer a borda direita quando há mais abas (máscara) ou seletor em lista no celular | B |
| P-8 | Kanban dentro do card: cartão sobre cartão (fundo elevado dentro de coluna afundada dentro do widget); no celular as colunas ficam com ~250px | `painel_contabil_cliente_todos--390.png` | No celular, Kanban em tela própria (gaveta larga) ao tocar "abrir"; no widget, só a contagem por coluna | C |

### CRM e comunicação interna (S05)

| # | Problema | Print | Correção proposta | Prior. |
| --- | --- | --- | --- | --- |
| C-1 | Conversas em 768: botão "Enviar" vaza 67px do campo de resposta | `crm_conversas--768.png` | Barra do campo com `flex-wrap` ou ícones recolhidos em "mais" abaixo de 900px | A |
| C-2 | Conversas em 1024: botão Chat flutuante cobre a última mensagem; o toast cobre o campo | `crm_conversas--1024.png` | A `GavetaChat acima` já existe: aplicar também em 1024 e no toast | A |
| C-3 | Leads (quadro): colunas largas no celular agora com encaixe; muitas etapas ainda pedem rolagem lateral em 1024 | `crm_leads--1024.png` | Recolher "Perdido" e "Implantação" em colunas estreitas com contagem; ou filtro de etapas | B |
| C-4 | Comunicados: cabeçalho do envio aperta código, data e dois botões numa linha | `crm_comunicados--390.png` | Ações em linha própria no celular (base já quebra a linha) | C |
| C-5 | Conversas internas: aviso de primeiro uso cobre a tela inteira toda vez que o QA abre (é o esperado na primeira visita) | `interna_conversas--1024.png` | Nada; só registrar que o aviso não volta depois de "Entendi" | C |

### Timesheet (S06)

| # | Problema | Print | Correção proposta | Prior. |
| --- | --- | --- | --- | --- |
| T-1 | Meu tempo: coluna da esquerda acaba em 690px e a direita vai a 1065px: 376px de buraco | `timesheet_meu--1440.png` | Mover "O que meus integrantes fizeram" para a coluna larga, abaixo de "Onde foi o meu dia", ou grade de 2 colunas por linha (padrão 5.3) | A |
| T-2 | Confirmações: mesma assimetria, 420px vazios sob a lista do dia | `timesheet_confirmacoes--1440.png` | Lateral com `sticky top-0` (fica à vista ao rolar) ou lista em largura inteira com o resumo em faixa em cima | A |
| T-3 | Equipe e Rentabilidade em 1024: tudo em uma coluna, gráficos de barra com 3 barras ocupando 600px | `timesheet_equipe--1024.png` | Gráfico de captura em M ao lado do "por que a cobertura não é maior" (2 colunas a partir de `lg`) | B |

### Financeiro (S07)

| # | Problema | Print | Correção proposta | Prior. |
| --- | --- | --- | --- | --- |
| F-1 | Cobranças: "Quem está devendo?" esticado com 163px vazios ao lado da régua | `financeiro_cobranca--1440.png` | Régua e devedores em pilha na coluna estreita, ou régua em faixa horizontal acima | B |
| F-2 | Resultado: "Orçado × realizado" (desligado) esticado com 212px vazios | `financeiro_resultado--1440.png` | Card desligado em M (estado vazio compacto) e "Cenários" ao lado | B |
| F-3 | Conciliação em 768: KPI "R$ 154.730" vaza do card; página rola 7px de lado | `financeiro_conciliacao--768.png` | KPIs em `grid-cols-2` até `lg`; número com `text-xl` abaixo de `lg` | A |
| F-4 | Visão geral: "Precisa de você" e "Receita por setor" esticados (até 130px) | `financeiro_visao--1440.png` | Proporções 1,3fr/1fr trocadas por 1fr/1fr na segunda linha, ou "Receita por setor" em M ao lado de "Clientes que pedem atenção" | C |

### BPO: visão, operação, aprovações e gestão (S08a a S08d)

| # | Problema | Print | Correção proposta | Prior. |
| --- | --- | --- | --- | --- |
| B-1 | Rotinas com empresa: calendário da empresa com 5 colunas de ~60px no celular, texto truncado em 4 letras | `bpo_rotinas_cliente_c2--390.png` | No celular, calendário em lista por dia (o `Calendario` já tem "dia") | A |
| B-2 | Rotinas: checklist em três colunas com alturas diferentes (até 248px vazios em 768) | `bpo_rotinas_cliente_c2--768.png` | Colunas viram seções em pilha abaixo de `lg`; acima, `items-start` com masonry (`columns-3`) | B |
| B-3 | Entregas e SLA em 1024: cards de 2 colunas com o nome do relatório quebrando em 4 linhas ao lado de dois botões | `bpo_entregas_cliente_todos--1024.png` | Uma coluna até `xl`; botões abaixo do nome | B |
| B-4 | Configuração: card "Contas a Receber" esticado com 240–340px vazios ao lado de cards mais altos | `bpo_configuracao_cliente_todos--1440.png` | Os quatro integrantes por função em grade de 2×2 com conteúdo equivalente, ou masonry consciente | B |
| B-5 | Configuração: controles deslizantes sem rótulo associado (`label`) | `bpo_configuracao_cliente_todos--390.png` | `label htmlFor` ou `aria-label` em cada um | B |
| B-6 | Visão geral com cliente: "Precisa de decisão" esticado (264px) ao lado da auditoria | `bpo_visao_cliente_todos--1440.png` | Lista de decisões com altura natural e "Por analista" abaixo na mesma coluna | C |

### Arquivos e Configurações (S09)

| # | Problema | Print | Correção proposta | Prior. |
| --- | --- | --- | --- | --- |
| A-1 | Arquivos › Pastas: conteúdo da pasta esticado à altura da árvore (313px vazios) | `arquivos_pastas--1440.png` | Árvore com rolagem própria e altura máxima (`max-h-[70vh]`), conteúdo com altura natural | B |
| A-2 | Armazenamento: "Raio-X do Drive" esticado com 422px vazios | `config_armazenamento--1440.png` | Raio-X em largura inteira abaixo, ou os dois cards em pilha | B |
| A-3 | Permissões: "Nunca liberável" esticado com 397px vazios ao lado da matriz | `config_permissoes--1440.png` | "Nunca liberável" em faixa acima da matriz | B |
| A-4 | Tema: nomes dos integrantes padrão truncados em chips de ~80px | `config_tema--1024.png` | Grade de 2 colunas (não 4) até `xl`, com nome inteiro | C |
| A-5 | Integrantes: coluna "Clientes-piloto" com 108px vazios | `config_integrantes--1440.png` | Pilha única abaixo de `xl` | C |
| A-6 | Configurações no celular são só leitura (decidido); conferir que nenhum campo aparece editável | `config_usuarios--390.png` | Nada a mudar; teste por tela | C |

### App do cliente (S10)

| # | Problema | Print | Correção proposta | Prior. |
| --- | --- | --- | --- | --- |
| K-1 | Sem problemas automáticos nas 8 telas; atalhos do Início ("Certidões", "Recalcular guia", "Agenda no calendário") cortados na borda direita sem indicar que rolam | `app_inicio--390.png` | Esmaecer a borda (máscara) ou quebrar em duas linhas | C |
| K-2 | Documentos e Financeiro: listas longas dentro de card com o rodapé do card colado ao menu inferior | `app_documentos--390.png` | `pb` extra igual à altura do menu inferior na área de rolagem | C |

## 4. Contagem do script

Números de `qa-interface.cjs` (67 rotas por largura), versão de partida (`wireframe`, fbbdacb) e este branch, com o mesmo script. A categoria `toque` só é medida em 768 e 390 (ponteiro de toque).

| Largura | Rolagem | Texto | Toque | Vazio | Buraco | Total |
| --- | --- | --- | --- | --- | --- | --- |
| 1440 | 0 → 0 | 0 → 0 | — | 25 → 21 | 25 → 12 | 50 → 33 |
| 1024 | 0 → 0 | 3 → 1 | — | 21 → 24 | 28 → 13 | 52 → 38 |
| 768 | 3 → 1 | 5 → 2 | 3570 → 1 | 23 → 20 | 11 → 5 | 3612 → 29 |
| 390 | 25 → 0 | 2 → 0 | 3638 → 0 | 33 → 20 | 2 → 0 | 3700 → 20 |

- O que sobra em `vazio` é quase todo P-1, P-2 e I-1 (widget grande com pouco conteúdo de exemplo); em 1024 sobe um pouco porque a grade agora tem 4 colunas e os widgets crescem para fechar a linha.
- O que sobra em `buraco` está nos itens T-1, T-2, F-1, F-2, B-2, B-4, A-1 a A-3 e P-4 (colunas e cards esticados fora da grade de widgets).
- `texto` e `rolagem` restantes: C-1 e F-3.
