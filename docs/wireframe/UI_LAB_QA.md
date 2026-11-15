# QA do UI Lab

**15/11/2026 · sessão UI Lab (branch `wf-ui-lab`), fases 4 e 5.** O QA automatizado que percorre o UI Lab (`#/lab/ui`) e as telas reais, o que ele acusa e o que foi corrigido. O inventário de partida está em `INVENTARIO_UI.md`.

## Como rodar

```
cd app && npx vite --port 6300 --strictPort
URL_APP=http://localhost:6300/ node scripts/ui-lab-qa.cjs /caminho/fora/do/git [--frente=lab|telas|widgets|ambas|tudo] [--filtro=<regex>] [--larguras=390,768,1024,1440,1920] [--variantes=demo,horizonte,membro,escuro] [--doc] [--resumo]
```

A mesma pasta **retoma de onde parou**: Lab e Telas ficam no `ui-lab-qa.json` ao fim de cada frente, e cada caso de widget vai para `widgets.jsonl` assim que termina (uma página que cai é reaberta e o caso, refeito). `--resumo` refaz o resumo sem abrir o navegador. Para a rodada longa, use uma cópia do build (`npm run build` e `npx vite preview --outDir <cópia>`): o servidor de desenvolvimento recarrega a cada edição e mudaria o que está sendo medido. O Lab avisa que desenhou cada endereço (`window.__labDesenhado`) e o QA espera por esse sinal, nunca por um tempo fixo.

- **Lab:** cada ficha declara os eixos que valem para ela (`window.__fichasLab`, lido do próprio Lab). O script monta os casos por **amostragem combinatória por pares**: todo par de valores de dois eixos aparece em pelo menos um caso, então todo estado de cada componente aparece em todas as larguras, todo tema com toda quantidade de itens e assim por diante. Eixos: estado, itens (0, 1, poucos, muitos, o dobro do teto), texto (curto, longo, muito longo, palavra sem espaço, números grandes), tamanho (P a XL e livre), variante (a aba, nos widgets reais), tema (os cinco, claro e escuro), densidade (16px e 18px) e largura (390, 768, 1024, 1440, 1920). Ponteiro em cima e foco são feitos de verdade (passar o mouse, Tab).
- **Telas:** as 67 rotas do `qa-interface.cjs` (`scripts/lib/rotas-qa.cjs`), nas cinco larguras e em quatro variantes: `demo` (escritório completo, Administradora), `horizonte` (escritório pequeno, com as listas quase vazias), `membro` ("ver como" Membro do Fiscal) e `escuro` (modo escuro).
- **Widgets reais com cenários** (`--frente=widgets`): os 238 widgets do Início e do Painel (cada aba nas versões cliente e carteira), alimentados pelo banco de cenário do Lab (`nucleo/semente/cenario.ts`). Base obrigatória: cada quantidade (0, 1, 3, 15, 50, 200) em cada tamanho do widget, a 390, 1024 e 1440. Por cima, por pares: texto (curto, longo, sem espaço), valores extremos, datas (vencidas, hoje, futuras), opcionais ausentes, estado (padrão, carregando, erro, sem acesso), os dez temas e a densidade; 768 e 1920 entram por pares com quantidade, tamanho e estado. Com 50 e 200 itens, o conteúdo fica no padrão (volume mede quantidade; as variações de conteúdo passam por 0 a 15). Prints em `<pasta>/widgets/<aba.widget>/<versao>/<cenario[.estado]>__<tamanho>__<tema>__<largura>.png`.
- **Prints** (fora do git, na pasta passada): `<pasta>/<componente>/<estado>__<itens>__<texto>__<tamanho>__<tema>__<largura>.png` (`na` quando o eixo não vale para a ficha; `-grande` no tema quando a densidade é 18px) e `<pasta>/telas/<rota>/<variante>__<largura>.png`. Relatório em `<pasta>/ui-lab-qa.json` (cada achado com o caso, o print e a caixa na tela) e `<pasta>/resumo.md`.

## O que o detector acusa (`scripts/lib/detector.cjs`)

| Regra | O que é |
| --- | --- |
| `texto-cortado` | texto cortado pela própria caixa ou por uma de fora sem reticências; ou com reticências e sem `title` |
| `sobreposicao` | dois irmãos que se cobrem; a caixa de cada um soma o que vaza dele (como a tag "aguard. cliente" sobre "manual · 2 d"), sem os absolutos de propósito |
| `rolagem-sem-esmaecido` | área que rola sem a máscara de esmaecer, ou com conteúdo abaixo (ou à direita) e o esmaecido parado em zero |
| `rolagem-lateral` | a página rola de lado; ou o conteúdo é mais largo que a área que só rola para baixo, e o que passa some |
| `toque` | alvo menor que 44px com toque (390 e 768), contando a área invisível e o rótulo |
| `contraste` | texto abaixo de 4,5:1 (3:1 no texto grande), com o fundo real atrás (camadas, transparência, gradiente na altura do elemento e opacidade); controles desabilitados não contam (WCAG) |
| `vao` | widget com mais da metade do corpo vazia, card vazio, célula vazia no meio da grade de widgets |
| `fora-do-card` | texto, botão, selo ou campo que passa da borda do card (ou da tela) |

## O que as rodadas acharam e o que mudou na raiz

Cada rodada parte do build do momento; o que ela acha vira correção num componente (resolver um resolve os outros) e a rodada seguinte confere.

1. **Primeira rodada de widgets (parcial, 7 mil casos):** texto corrido acusado como sobreposição (falso: o detector passou a comparar as caixas de cada linha); Processos com nome truncado em duas colunas estreitas; Ações e Relatórios com margem negativa vazando 8px; o estado "carregando" ignorado no widget; **78 dos 238 widgets mostravam o mesmo conteúdo com 0, 3 e 50 itens** (as coleções da S02, o estado da Gestão e o do DP não passavam pelo cenário). O QA às vezes fotografava o caso anterior: veio daí o sinal de desenho.
2. **Rodada completa de widgets (23.744 casos, 20 achados em 5 widgets):** selo e rótulo de situação que não truncavam (Rotulo, Selo), Contagem ("-5 dias", "NaN dias", sem truncar), duas colunas no XL com lista longa (vão sob a coluna curta), Numero espremido pelo texto ao lado, a grade de fluxos da captura por cima de "Rodadas", Simples quebrando sem a PGDAS-D, "Abrir chat" com 3,64:1 no Condesp escuro. Antes dela já tinham saído os vazios em branco (rede de segurança na caixa do widget) e o "Ver tudo (3)" com 200 itens.
3. **Lab (1.860 casos, 243 achados) e telas reais (1.260 casos, 407 achados):** cards esticados em grades de duas colunas, opacidade no texto de registro inativo (28 lugares), `text-warning-foreground` fora do fundo amarelo (18), contador de não lidas com 3,2:1 no escuro, calendário sem rolagem lateral, célula de lista em colunas vazando, buracos na grade de widgets (empacotamento denso), texto suave sem garantia sobre a barra lateral e o fim do gradiente.

## Exceções aceitas

- **Controles desabilitados** (e o rótulo que os envolve): fora do contraste, como no WCAG 1.4.3.
- **Colunas em pilha** (`DuasPilhas`, `data-pilha`) e **coluna lateral sticky**: o fim da pilha mais curta é o desenho do padrão, não vão.
- **Barra sticky** que flutua sobre o conteúdo ao rolar (Confirmações): não é sobreposição.
- **Moldura do aparelho** no app do cliente: raio fixo (desenha o hardware).
- **Texto suave sobre o rebaixado e o fim do gradiente no claro da Heild** (4,0 a 4,4:1): é o token do design system; está na proposta 6 de `PROPOSTAS_DESIGN_SYSTEM.md`, esperando o dono. Onde o par é estável (item selecionado, "Editar painel"), o app já usa o texto.
- **Widgets que não mudam com a quantidade:** os que são número ou resumo (horas, quadro, margem), atalhos, o ciclo de vida, "Pedir" e "Perguntar", a CCT única, a matriz de permissões (vem da estrutura do escritório) e as listas que só existem depois de uma ação (fila de assinatura, declaração de faturamento, ocorrências críticas, perguntas fora do escopo): estas aparecem vazias no QA e cheias nos testes da suíte que as criam.

## Contagem

<!-- contagem:inicio -->
<!-- contagem:fim -->
