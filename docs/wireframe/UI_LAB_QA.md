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

4. **Rodada final (build do PR):** Lab 1.860 casos e 25 achados, telas reais 1.260 e 21, widgets 23.744 e 1 (um print que não saiu no tempo, infraestrutura). Os 46 de contraste que sobram são todos o texto suave da Heild sobre o rebaixado ou o fim do gradiente da página no claro (3,8 a 4,45:1): a proposta 6, que espera o dono. Nenhum vão, sobreposição, texto cortado, conteúdo fora do card ou rolagem sem esmaecido.

## Exceções aceitas

- **Controles desabilitados** (e o rótulo que os envolve): fora do contraste, como no WCAG 1.4.3.
- **Colunas em pilha** (`DuasPilhas`, `data-pilha`) e **coluna lateral sticky**: o fim da pilha mais curta é o desenho do padrão, não vão.
- **Barra sticky** que flutua sobre o conteúdo ao rolar (Confirmações): não é sobreposição.
- **Moldura do aparelho** no app do cliente: raio fixo (desenha o hardware).
- **Texto suave sobre o rebaixado e o fim do gradiente no claro da Heild** (4,0 a 4,4:1): é o token do design system; está na proposta 6 de `PROPOSTAS_DESIGN_SYSTEM.md`, esperando o dono. Onde o par é estável (item selecionado, "Editar painel"), o app já usa o texto.
- **Widgets que não mudam com a quantidade:** os que são número ou resumo (horas, quadro, margem), atalhos, o ciclo de vida, "Pedir" e "Perguntar", a CCT única, a matriz de permissões (vem da estrutura do escritório) e as listas que só existem depois de uma ação (fila de assinatura, declaração de faturamento, ocorrências críticas, perguntas fora do escopo): estas aparecem vazias no QA e cheias nos testes da suíte que as criam.

## Contagem

<!-- contagem:inicio -->
Gerado em 2026-11-15T14:30:37.805Z contra http://localhost:6320/ (cópia do build do PR). Larguras: 390, 768, 1024, 1440, 1920.

### Lab: 1860 casos, 25 achados

| Componente | texto-cortado | texto-espremido | sobreposicao | rolagem-sem-esmaecido | rolagem-lateral | toque | contraste | vao | fora-do-card | erro | Total |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| campos | 0 | 0 | 0 | 0 | 0 | 0 | 18 | 0 | 0 | 0 | 18 |
| avatares | 0 | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 4 |
| abas | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 2 |
| botoes | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 1 |
| **Total** | **0** | **0** | **0** | **0** | **0** | **0** | **25** | **0** | **0** | **0** | **25** |

### Telas reais: 1260 casos, 21 achados

| Grupo de telas | texto-cortado | texto-espremido | sobreposicao | rolagem-sem-esmaecido | rolagem-lateral | toque | contraste | vao | fora-do-card | erro | Total |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Início | 0 | 0 | 0 | 0 | 0 | 0 | 10 | 0 | 0 | 0 | 10 |
| CRM e interna | 0 | 0 | 0 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 8 |
| BPO | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 3 |
| **Total** | **0** | **0** | **0** | **0** | **0** | **0** | **21** | **0** | **0** | **0** | **21** |

### Widgets reais com cenários: 23744 casos, 1 achados

| Widget · versão | texto-cortado | texto-espremido | sobreposicao | rolagem-sem-esmaecido | rolagem-lateral | toque | contraste | vao | fora-do-card | erro | Total |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| fiscal.caixas · carteira | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 1 |
| **Total** | **0** | **0** | **0** | **0** | **0** | **0** | **0** | **0** | **0** | **1** | **1** |

**Os 10 piores casos** (pontos: sobreposição e fora do card 4, rolagem 3, texto espremido 3, texto cortado e vão 2, contraste e toque 1):

1. fiscal|carteira|caixas · 5 pontos (erro) · `widgets/fiscal.caixas/carteira/i200__XL__condesp-claro__768.png`
2. consultoria|carteira|acoes · 0 pontos () · `widgets/consultoria.acoes/carteira/i0.carregando__G__requinte-escuro__768.png`
3. consultoria|cliente|entrada-saida · 0 pontos () · `widgets/consultoria.entrada-saida/cliente/i0.sem-permissao__M__verde-campo-escuro__390.png`
4. consultoria|carteira|carteira-consultoria · 0 pontos () · `widgets/consultoria.carteira-consultoria/carteira/i0.erro__XL__condesp-escuro__1024.png`
5. consultoria|carteira|documentos · 0 pontos () · `widgets/consultoria.documentos/carteira/i0.sem-permissao__G__condesp-claro-grande__1440.png`
6. consultoria|carteira|acoes · 0 pontos () · `widgets/consultoria.acoes/carteira/i0.erro__G__fabrica-escuro__1920.png`
7. consultoria|carteira|acoes · 0 pontos () · `widgets/consultoria.acoes/carteira/i0.erro__G__fabrica-escuro__768.png`
8. contabil|carteira|fila-assinatura · 0 pontos () · `widgets/contabil.fila-assinatura/carteira/i0.sem-permissao__M__verde-campo-escuro__390.png`
9. consultoria|carteira|pendencias · 0 pontos () · `widgets/consultoria.pendencias/carteira/i0.sem-permissao__G__condesp-claro-grande__1440.png`
10. consultoria|carteira|pedir · 0 pontos () · `widgets/consultoria.pedir/carteira/i0.erro__G__horizonte-escuro-grande__1024.png`

Erros de página (JavaScript): 0.
<!-- contagem:fim -->
