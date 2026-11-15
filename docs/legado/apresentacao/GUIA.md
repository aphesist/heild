# Guia para autores de slides

## Padrão visual

Estilo keynote: palco preto, tipografia do sistema, pouco texto, muito respiro, uma ideia por slide. Tudo vem de `src/css/00-tokens.css`; o CSS de seção (`81`–`84`) só usa esses tokens.

- **Grade:** palco 1920×1080, margens laterais de 128 px. Sobretítulo sempre em y = 88 px, título em y = 134 px, com ou sem sobretítulo (o espaço fica reservado). Corpo começa 48 px abaixo do título e termina em y = 968 px. Fonte e numeração no rodapé, na mesma linha de base (44 px do fundo), à esquerda e à direita da margem.
- **Tipo:** 5 tamanhos de texto e 2 de número. `--fs-display` 120 (declaração, capa) · `--fs-title` 72 (todo título de conteúdo) · `--fs-sub` 36 (lead, nome de bloco) · `--fs-text` 26 (corpo, tabela, diagrama; também o sobretítulo) · `--fs-caption` 20 (rótulo, selo, fonte, número do slide) · `--fs-stat` 56 (número em dado) · `--fs-hero` 240 (número-herói). Pesos: 400 texto, 600 ênfase, 700 título e número. Só glifos dentro de ícones (carimbo, número em círculo) ficam fora da escala.
- **Cor:** fundo `#000`; três cinzas (`--ink`, `--ink-2`, `--ink-3`); um acento (`--accent`, violeta) e um gradiente (`--grad`) só para o que importa: o número-chave, a barra ou o bloco "nosso". Semânticas: `--exec-a` azul (Claude por API), `--exec-b` violeta (nossos modelos na GPU), `--exec-c` verde (código e banco); verde também é "conferido", vermelho é erro/risco, âmbar é a lei citada. Nada de palavra pintada em título de conteúdo; sobretítulo é cinza. Sem slides claros.
- **Superfície:** um bloco (`--surface`, raio `--r` 28 px, sem contorno); elemento interno em `--surface-2` (raio `--r-sm` 14 px). Contorno só como fio fino (`--line`) para "a alternativa" ou "o mercado"; o bloco "nosso" ganha fio de 1 px no gradiente. Sem sombras decorativas e sem brilho de fundo, exceto na declaração, na capa e no encerramento (um brilho padrão).
- **Selo (`.pill`):** pílula de 20 px, fundo tênue, sem contorno; cor só quando significa algo. **Tabela (`.table`):** só fios horizontais, cabeçalho em rótulo cinza, linha "nossa" com fio de acento. **Gráfico:** barras neutras em cinza, a nossa no gradiente, a alternativa em grafite; valor em `--fs-sub`, rótulo em legenda, uma linha de base, sem grade. **Diagrama:** nós em superfície sem contorno, fios de 2 px.
- **Layouts nomeados** (`data-layout` em cada `<section>`): `declaracao` (`.slide--statement`, frase grande no meio da altura), `numero-heroi` (`.slide--hero` quando o número está sozinho e centralizado; à esquerda quando acompanha um visual), `diagrama`, `comparacao`, `grafico`, `tabela`, `lista` (todos com `.head` no topo e o corpo abaixo; em `.split` a coluna de texto começa no topo e o visual centraliza na altura) e `encerramento` (`.slide--end`, também a capa). Sobretítulo solto (filho direto do slide) fica no lugar padrão.
- **Movimento:** curvas `--ease` (entradas), `--ease-io` (mecanismos de ida e volta), `--ease-pop` (selos); durações `--dur-fast` 500, `--dur` 900, `--dur-slow` 1200 ms. Cabeçalho sempre igual: sobretítulo `fade`, título `words`, lead `fade-up` com 400 ms. Animações que explicam um mecanismo (pilha que cai, lupa, cascata, carimbos) são próprias de cada slide.
- **Trilha da cascata** (slides 21–28): ocupa a linha do sobretítulo.
- **Analogia** (`.analogia`): uma frase do dia a dia do contador, com lâmpada em linha fina no acento, texto `--fs-text` em `--ink-2`. Uma por slide, no último build, depois do mecanismo. Lugar fixo, fora do fluxo: na linha do sobretítulo, à direita (padrão); `--faixa` logo acima da faixa "Jeito comum / Nosso jeito" (cascata); `--pe` no pé do corpo. Ver "Analogia" em Componentes.
- **Orçamento** (`.budget`): total, barra empilhada e lista com valores e total. Ver "Orçamento" em Componentes.

Este guia é para quem vai escrever os slides. O motor (palco, navegação, animações, visão do apresentador, impressão) já está pronto. Você só escreve HTML com classes e atributos `data-*`. Não escreva CSS nem JavaScript nos arquivos de slide.

O conteúdo de cada slide vem dos planos em `../docs/` (o plano de execução é o `Plano_MVP_6_meses.md`); as falas ficam no [ROTEIRO-DE-FALAS.md](ROTEIRO-DE-FALAS.md). Os números vêm de `data/modelo.json` (via `data-bind`) ou das pesquisas em `../pesquisa/`, sempre com a fonte no rodapé.

## Como trabalhar

1. Crie o seu arquivo em `src/slides/`, com o número da seção do roteiro na frente: `02-problema.html`, `05-arquitetura.html`, `13-investimento.html`. A ordem dos slides é a ordem alfabética dos nomes de arquivo. Arquivos que começam com `_` são ignorados (bom para rascunho).
2. Cada arquivo tem um ou mais `<section class="slide">…</section>`. Nada fora deles, a não ser comentários.
3. Gere a apresentação e abra no navegador:

   ```bash
   cd apresentacao
   node build.mjs           # gera index.html
   node build.mjs --watch   # refaz a cada alteração
   ```

   Abra `index.html` direto no navegador (funciona com `file://` e sem internet). Para ir direto ao seu slide, use o hash: `index.html#14`.
4. Leia os avisos do build: `id` duplicado entre arquivos, `<section>` sem fechar e `data-bind` sem valor no modelo.
5. `src/slides/00-demo.html` tem 4 slides de exemplo. Copie dali. Ele será apagado quando o conteúdo real chegar.

Não edite `index.html` (é gerado), nem `src/css`, `src/js` ou `src/template.html`. Se faltar um componente, peça.

### Regras para trabalho em paralelo

- Se usar `id`, prefixe com a sua seção: `id="arq-agente"`. Em diagramas, prefira `data-node`, que só vale dentro do próprio diagrama.
- Não mude arquivos de outras seções.
- Dê a cada slide um `data-title` curto. Ele aparece na visão geral (tecla O) e no título da aba.

## Atalhos durante a apresentação

| Tecla | O que faz |
| --- | --- |
| → ↓ espaço PageDown Enter | Avança (próximo build ou próximo slide) |
| ← ↑ Shift+espaço PageUp Backspace | Volta (desfaz o último build) |
| Home / End | Primeiro / último slide |
| número + Enter | Vai para o slide (ex.: `2` `3` Enter) |
| O | Visão geral em grade (setas + Enter para escolher) |
| P | Abre a visão do apresentador em outra janela |
| F | Tela cheia |
| B ou . | Tela preta (de novo para voltar) |
| R ou botão ↺ | Repete as animações do slide atual desde o início |
| Shift+R ou botão "↺ tudo" | Volta as animações de todos os slides ao início e repete o atual (Home leva ao slide 1) |

Os dois botões ficam no canto superior direito e aparecem quando o mouse se mexe. Na visão do apresentador: "↺ Repetir slide" e "↺ Reiniciar todas".
| Esc | Fecha visão geral / tela preta |

Clique ou toque avança; clique no quarto esquerdo da tela volta; swipe para os lados também funciona. Controles de apresentação (passadores) mandam PageUp/PageDown e funcionam sem configuração.

**Visão do apresentador (P):** slide atual, o próximo build ou slide, notas, cronômetro (Iniciar, Pausar, Zerar) e relógio. As duas janelas ficam sincronizadas; dá para avançar de qualquer uma. `+` e `−` mudam o tamanho das notas. Se nada abrir, o navegador bloqueou o pop-up: permita pop-ups para o arquivo.

**Impressão e PDF:** abra `index.html?print` e imprima (Ctrl+P, "Salvar como PDF", margens nenhuma, gráficos de fundo ligados). Cada slide vira uma página 1920×1080 no estado final, com todos os builds. Imprimir direto da apresentação também funciona.

**Link direto:** `#12` abre o slide 12; `#12.2` abre o slide 12 já no build 2.

## Regras de estilo

- **Uma ideia por slide.** Se você precisa de "e também", são dois slides.
- **Limites de texto na tela:** título com até 8 palavras; lead com até 25 palavras; listas com até 4 itens de até 8 palavras; cartões com título de até 4 palavras e até 15 palavras de texto. O resto vai para as notas.
- **Títulos são frases, com ponto final**, em caixa normal: "O custo por usuário cai com a escala." Nada de CAIXA ALTA.
- **Sobretítulo (`.kicker`)** é opcional e só serve para situar a seção ("Arquitetura", "Mercado"). Com ou sem ele, o título fica no mesmo lugar.
- **Números:** sempre em formato brasileiro (`R$ 1.234,56`, `18%`), com a fonte no rodapé (`.source`). Estimativas são ditas como estimativa ("cerca de").
- **Cor tem significado:** o gradiente e o violeta marcam "o que é nosso"; cinza (`.is-muted`, `.dim`, `--them`) marca "o mercado" ou "a alternativa". Âmbar é a cor da lei citada (`.cite`, `mark`). Não pinte palavras soltas do título.
- **Movimento com propósito:** cada slide tem no máximo um momento animado principal. Os builds seguem a fala: nada aparece antes de ser dito.
- **Sem fundo claro:** todos os slides usam o palco preto.

## Esqueleto de um slide

```html
<section class="slide" data-title="Custo de uma pergunta">
  <div class="head">
    <p class="kicker" data-anim="fade">Custo de operação</p>
    <h2 class="title" data-anim="words">Uma pergunta custa centavos.</h2>
    <p class="lead" data-anim="fade-up" data-delay="400">Texto de apoio curto, no máximo duas linhas.</p>
  </div>

  <div class="fill">…conteúdo…</div>

  <p class="source">Fonte: pesquisa/02-custos-llm.md, §3.</p>
  <aside class="notes">
    <p>O que dizer. Pode ser longo. Só aparece na visão do apresentador.</p>
  </aside>
</section>
```

### Atributos do `<section class="slide">`

| Atributo / classe | Efeito |
| --- | --- |
| `data-title="…"` | Nome curto do slide (visão geral, aba, apresentador) |
| `data-layout="…"` | Nome do layout (ver "Padrão visual") |
| `class="slide slide--statement"` | Declaração: frase grande no meio da altura, alinhada à margem |
| `class="slide slide--hero"` | Número-herói sozinho, centralizado |
| `class="slide slide--end"` | Capa e encerramento, centralizados (`slide--center` é equivalente, sem brilho) |
| `slide--middle`, `slide--bottom`, `slide--tight`, `data-glow` | Aceitos por compatibilidade; não mudam mais a grade nem o fundo |
| `data-transition="push \| zoom \| none"` | Transição de entrada (padrão: dissolver) |
| `data-chrome="off"` | Esconde número e barra de progresso (capa, encerramento) |

A área útil é 1664 × 856 px (margens de 128 px nas laterais e 112 px em cima e embaixo). Nunca use tamanhos em `vw`/`vh`: o palco é sempre 1920×1080 e é escalado inteiro.

## Builds (`data-step`)

Qualquer elemento com `data-step="1"`, `"2"`… fica escondido até o apresentador avançar. Cada avanço revela o próximo número; quando todos os builds do slide aparecem, o próximo avanço vai para o slide seguinte. Voltar desfaz o último build.

```html
<div class="card" data-step="1">Aparece no 1º clique</div>
<div class="card" data-step="2" data-anim="scale-in">Aparece no 2º clique</div>
<div class="card" data-step="2" data-delay="150">Também no 2º, um pouco depois</div>
```

- Sem `data-anim`, um build entra com `fade-up`.
- Tudo dentro de um elemento com `data-step` entra junto com ele (contadores, listas com stagger, gráficos).
- Elementos sem `data-step` animam sozinhos quando o slide chega.

## Animações (`data-anim`)

Todas duram entre 600 e 1200 ms, com a curva `cubic-bezier(0.22, 1, 0.36, 1)`. Com "reduzir movimento" ligado no sistema, tudo vira um esmaecer curto, sem deslocamento.

Atributos que valem para qualquer animação:

| Atributo | Efeito |
| --- | --- |
| `data-delay="300"` | Atraso em ms depois da chegada do slide (ou do build) |
| `data-duration="1600"` | Duração em ms (contadores e transições) |
| `data-step="n"` | Só anima no build n |

| `data-anim` | O que faz | Use para |
| --- | --- | --- |
| `fade` | Esmaece | Sobretítulos, rodapés, rótulos |
| `fade-up` | Sobe 48 px esmaecendo | Padrão para blocos de texto e cartões |
| `fade-down` / `fade-left` / `fade-right` | Entra da direção indicada | Colunas laterais, setas de sentido |
| `blur-in` | Sai do desfoque | Número-herói, citação, frase de impacto |
| `scale-in` | Cresce de 90% | Cartões, nós, imagens |
| `zoom-in` | Encolhe de 118% saindo do desfoque | Uma revelação dramática por apresentação |
| `pop` | Cresce com leve elástico | Pílulas, selos, citações legais |
| `words` | Cada palavra sobe por uma máscara, em sequência | Títulos (o efeito Apple). `data-stagger="70"` |
| `mask` | O bloco inteiro sobe por uma máscara | Títulos de uma linha, números |
| `wipe` | Revela da esquerda para a direita | Frases-chave, linhas de destaque |
| `highlight` | Passa o marca-texto (em `<mark>`) | O trecho exato que o apresentador vai ler |
| `type` | Digita o texto, com cursor | Pergunta de exemplo. `data-speed="38"` ms por letra |
| `stagger` | Os filhos diretos entram em sequência | Listas, grades de cartões, linhas de tabela. `data-stagger="110"`, `data-child-anim="fade-up"` |
| `draw` | Traços SVG se desenham | SVG feito à mão; `.chart-line` usa sozinho |
| `bars` | Barras crescem | Automático em `.chart-bars` |
| `gantt` | Barras do cronograma crescem em sequência | Automático em `.gantt` |
| `grow-x` | A barra cresce da esquerda (recorte) | Barra empilhada do `.budget`, qualquer barra feita à mão |

Contadores e diagramas não precisam de `data-anim`: o motor reconhece sozinho.

### Exemplos

```html
<h2 class="title" data-anim="words">Quatro camadas. Uma fonte da verdade.</h2>

<ul class="list" data-anim="stagger" data-stagger="120">
  <li><strong>Cita</strong> o artigo e a redação vigente</li>
  <li>Responde pela data do fato</li>
  <li>Se abstém quando não sabe</li>
</ul>

<p class="lead">A alíquota era <mark data-anim="highlight" data-delay="600">0,65%</mark> naquela data.</p>
```

## Contador numérico

```html
<div class="hero-number" data-anim="blur-in" data-count-to="549576">549.576</div>
<span data-count-to="1.5" data-decimals="1" data-prefix="R$ " data-suffix=" mi">R$ 1,5 mi</span>
<span data-count-to="18" data-suffix="%" data-count-from="40">18%</span>
```

| Atributo | Efeito |
| --- | --- |
| `data-count-to` | Valor final, **com ponto decimal** (`6.7`, não `6,7`) |
| `data-count-from` | Valor inicial (padrão 0); pode ser maior que o final para contar para baixo |
| `data-decimals` | Casas decimais exibidas (padrão 0) |
| `data-prefix` / `data-suffix` | Texto antes e depois (`"R$ "`, `" mi"`, `"%"`, `"+"`) |
| `data-duration` | Duração da contagem em ms (padrão 1600) |

A formatação é sempre pt-BR (`549.576`, `6,70`). Escreva o valor final também dentro da tag: é o que aparece se o JavaScript falhar.

## Dados do modelo (`data-bind`)

`data/modelo.json` é embutido no build como `window.MODELO`. Qualquer elemento com `data-bind="caminho"` recebe o valor desse caminho:

```html
<!-- texto simples (usa o valor já formatado do modelo) -->
<span data-bind="premissas_chave.cambio.valor_fmt">R$ 5,49</span>

<!-- número formatado pelo motor -->
<span data-bind="planos.lista.individual.preco_mensal" data-prefix="R$ ">R$ 199</span>

<!-- número que conta: data-count-to é o valor reserva -->
<div class="hero-number" data-bind="cenarios.acelerado.investimento_ate_mvp" data-count-to="3600000" data-prefix="R$ ">…</div>

<!-- altura de uma barra -->
<div class="bar" data-bind="escala.2.receita" data-value="0" data-label="1 mil usuários"></div>
```

- O caminho usa pontos. Em listas, use o índice (`escala.2`) ou o valor do campo `chave` ou `id` do item (`premissas_chave.cambio`, `planos.lista.individual`).
- Se o caminho não existir (ou o arquivo faltar), o elemento mantém o texto do HTML e o build avisa. Por isso, sempre escreva um valor reserva.
- Para números, `data-decimals`, `data-prefix` e `data-suffix` funcionam como no contador.
- Quando o modelo tem um campo `rotulos` ou `*_fmt` já formatado, prefira-o.

## Componentes

### Tipografia

| Classe | Uso |
| --- | --- |
| `.kicker` | Sobretítulo cinza, 26 px (curto, caixa normal) |
| `.title` | Título padrão (72 px, em todo slide de conteúdo). `.title--xl` (120 px, capa); `.title--md` e `.title--sm` não mudam o tamanho; `.title--wide` tira o limite de largura |
| `.lead` | Texto de apoio grande e cinza |
| `.text`, `.small`, `.micro` | Corpo, pequeno, mínimo |
| `.hero-number` | Número gigante (240 px). `.hero-number--md` (120 px), `.hero-number--grad` (com gradiente) |
| `.hero-label` | Legenda do número-herói |
| `.grad-text` | Texto com o gradiente da marca (use em números, não em palavras de título) |
| `.dim`, `.soft`, `.ink`, `.light`, `.bold`, `.c-blue`, `.c-violet`, `.c-amber`, `.c-green`, `.c-red` | Utilitários de cor e peso |
| `<mark>` ou `.hl` | Marca-texto âmbar. `.hl--blue`, `.hl--full` |
| `.list` | Lista com marcador cinza discreto. `.list--big` |
| `.steps-list` | Lista numerada (só para sequências de verdade) |

### Layout

| Classe | Uso |
| --- | --- |
| `.head` | Bloco de sobretítulo + título + lead, com respiro embaixo |
| `.fill` | Ocupa a altura que sobra |
| `.spacer` | Empurra o que vem depois para baixo |
| `.stack`, `.row` | Coluna / linha com espaçamento (`.gap-s`, `.gap-l`) |
| `.grid-2`, `.grid-3`, `.grid-4` | Grades de colunas iguais |
| `.split` | Texto à esquerda, visual à direita. `.split--even`, `.split--wide-left` |
| `.mt-1` `.mt-2` `.mt-3` `.mt-auto` `.mb-1` `.mb-2` | Margens (24, 48, 80 px) |
| `.center`, `.w-full` | Centralizar, largura total |

### Cartões

```html
<div class="grid-3" data-anim="stagger">
  <div class="card">
    <div class="card-num" data-count-to="12">12</div>
    <h3>Fontes oficiais</h3>
    <p>Planalto, Receita, CARF e mais.</p>
  </div>
  <div class="card card--accent">…o que é nosso…</div>
  <div class="card card--quiet">…secundário…</div>
</div>
```

`.card--compact` reduz o espaçamento; `.card-foot` é um rodapé dentro do cartão.

### Analogia

Para os slides técnicos: uma frase curta que traduz o mecanismo para o dia a dia do contador. Entra num build próprio, sempre o último do slide, e repete a frase que está nas notas.

```html
<p class="analogia" data-step="4" data-anim="fade">É como o Ctrl+F.</p>
<p class="analogia analogia--faixa" data-step="3" data-anim="fade">Como o sumário de um livro.</p>
<p class="analogia analogia--pe" data-step="3" data-anim="fade">Um bibliotecário que entende o que você quis dizer.</p>
```

- Coloque logo antes do `.source`. Uma linha, até cerca de 70 caracteres; nada de segunda frase.
- Padrão: linha do sobretítulo, alinhada à direita (y = 88 px). Use quando o lado direito dessa linha está livre.
- `--faixa`: logo acima da faixa "Jeito comum / Nosso jeito" (slides 21 a 28, onde a linha do topo é a trilha).
- `--pe`: no pé do corpo, à direita, quando não há faixa embaixo.
- Nas notas, acrescente `<p><strong>Avance (analogia):</strong> …</p>`.

### Orçamento

Total, barra empilhada (cada segmento com o seu valor) e lista com valores e total. Use dentro de um cartão.

```html
<div class="card card--accent budget" data-step="1" data-anim="fade-left">
  <p class="budget-cat">Aporte dos seis meses</p>
  <div class="budget-total" data-count-to="20000" data-prefix="R$ ">R$ 20.000</div>
  <div class="budget-bar" data-anim="grow-x" data-delay="700">
    <i style="--v: 6828; --c: var(--blue)"></i><i style="--v: 9296; --c: var(--grad)"></i><i class="is-reserve" style="--v: 2492"></i>
  </div>
  <ul class="budget-list" data-anim="stagger">
    <li style="--c: var(--blue)"><span>Claude Ultra <small>US$ 200/mês × 6</small></span><b>R$ 6.828</b></li>
    <li class="is-reserve"><span>Reserva <small>cerca de 12%</small></span><b>R$ 2.492</b></li>
    <li class="is-total"><span>Total</span><b>R$ 20.000</b></li>
  </ul>
  <p class="budget-note">Premissa em uma linha.</p>
</div>
```

`--v` é o valor (a largura sai da proporção); `--c` é a cor, só com significado (azul Claude, verde código, gradiente o que é nosso, cinzas o resto); `.is-reserve` desenha hachurado. `data-anim="grow-x"` faz a barra crescer da esquerda e serve para qualquer barra.

### Pílulas

```html
<div class="pills" data-anim="stagger" data-child-anim="pop">
  <span class="pill pill--blue">Simples Nacional</span>
  <span class="pill pill--violet">Lucro Presumido</span>
  <span class="pill pill--amber">Lucro Real</span>
  <span class="pill pill--outline">MEI</span>
</div>
```

Cores: `--blue`, `--violet`, `--amber`, `--green`, `--red`, `--outline`. Tamanho maior: `.pill--lg`. Ponto colorido: `<span class="dot"></span>` dentro da pílula.

### Tabela

```html
<table class="table table--lg">
  <thead><tr><th>Produto</th><th>Foco</th><th class="num">Preço/mês</th></tr></thead>
  <tbody data-anim="stagger">
    <tr><td>Jus IA</td><td>Jurídico geral</td><td class="num">R$ 78,90</td></tr>
    <tr class="is-highlight" data-step="1"><td>Nós</td><td>Contábil e tributário</td><td class="num">R$ 199,00</td></tr>
    <tr class="is-total"><td>Total</td><td></td><td class="num">R$ 277,90</td></tr>
  </tbody>
</table>
```

Até 6 linhas e 5 colunas. Números em `.num` (alinhados à direita).

### Marcas sim / não e comparativo "nós vs. alternativa"

```html
<div class="versus">
  <div class="versus-col versus-col--us" data-anim="fade-up">
    <h3>DGM-RAG-Contábil</h3>
    <p class="versus-sub">base legal versionada</p>
    <ul class="checks" data-anim="stagger" data-delay="300">
      <li><strong>Cita</strong> artigo e redação vigente</li>
      <li>Responde pela data do fato</li>
    </ul>
  </div>
  <div class="versus-col versus-col--them" data-anim="fade-up" data-delay="150">
    <h3>Chat genérico</h3>
    <p class="versus-sub">o que estava no treino</p>
    <ul class="checks">
      <li class="no">Inventa números de lei</li>
      <li class="partial">Às vezes acerta a regra atual</li>
    </ul>
  </div>
</div>
```

`.checks` funciona sozinha também: `li` (sim, verde), `li.no` (não, cinza), `li.partial` (parcial, âmbar).

### Diagrama de camadas

```html
<div class="layers" data-anim="stagger" data-child-anim="fade-left">
  <div class="layer is-accent">
    <span class="layer-num">2</span>
    <div><div class="layer-name">Agente de resposta</div><div class="layer-desc">pesquisa como um sênior</div></div>
    <span class="pill pill--violet layer-tag">produção</span>
  </div>
  <div class="layer is-muted">…</div>
</div>
```

### Funil

```html
<div class="funnel" data-anim="stagger" data-child-anim="scale-in">
  <div class="funnel-step" style="--w:100%"><span class="funnel-label">Perguntas</span><span class="funnel-value">100%</span></div>
  <div class="funnel-step" style="--w:70%"><span class="funnel-label">Resolvidas no cache</span><span class="funnel-value">62%</span></div>
  <div class="funnel-step is-accent" style="--w:40%"><span class="funnel-label">Modelo caro</span><span class="funnel-value">8%</span></div>
</div>
```

`--w` é a largura de cada etapa. A cor fica mais forte a cada degrau.

### Cascata de etapas (fluxo)

```html
<div class="flow" data-anim="stagger" data-stagger="160">
  <div class="flow-step"><h4>Árvore de temas</h4><p>roteia a pergunta</p></div>
  <div class="flow-step"><h4>Cache semântico</h4><p>reusa respostas</p></div>
  <div class="flow-step is-accent"><h4>Resposta</h4><p>com citação</p></div>
</div>
```

Numera e liga as etapas sozinho (até 5 por linha). `.flow--plain` tira números e linhas. Para revelar uma etapa por clique, ponha `data-step` em cada `.flow-step` (sem `data-anim="stagger"` no pai).

### Gráfico de barras

```html
<div class="chart-bars" data-prefix="R$ " data-suffix=" mil" data-decimals="1" style="--chart-h: 520px">
  <div class="bar is-muted" data-value="6.041" data-label="Piloto<br>50 usuários"></div>
  <div class="bar" data-value="23.097" data-label="1 mil usuários"></div>
  <div class="bar is-accent" data-value="67.046" data-label="10 mil usuários" data-step="1"></div>
</div>
```

- `data-value` é a altura; o valor exibido conta até ele com o formato do gráfico. Para um texto fixo, use `data-display="R$ 67 mil"`.
- `data-max` fixa a escala (padrão: a maior barra). `data-stagger` (padrão 140 ms) e `data-delay` controlam a sequência.
- `.is-accent` (gradiente, "o que é nosso"), `.is-muted` (cinza, "o mercado").
- Barra com `data-step` cresce só naquele build.
- Barras horizontais: `class="chart-bars is-horizontal"` e `style="--label-w: 320px"` para a coluna de rótulos.
- Até 6 barras verticais ou 8 horizontais.

### Gráfico de linha

```html
<div class="chart-line" data-values="0,2,5,9,16,28,45,70" data-labels="2027,,,2028,,,,2030"
     data-prefix="R$ " data-suffix=" mi" style="--chart-h: 520px"></div>
```

Desenha a linha com gradiente, a área e o último valor. Opções: `data-min`, `data-max`, `data-smooth="false"`, `data-points="all"`, `data-show-last="false"`, `data-last-label="R$ 70 mi em 2030"`, `data-color="#7cc4ff"`. Rótulos vazios entre vírgulas pulam aquele ponto.

### Linha do tempo / Gantt

```html
<div class="gantt" data-cols="18" data-labels="dez,jan,fev,mar,abr,mai,jun,jul,ago,set,out,nov,dez,jan,fev,mar,abr,mai">
  <div class="gantt-row">
    <span class="gantt-label">Base legal<small>ingestão em ondas</small></span>
    <span class="gantt-bar" data-from="0" data-to="9">Ingestão</span>
  </div>
  <div class="gantt-row">
    <span class="gantt-label">Piloto</span>
    <span class="gantt-bar is-accent" data-from="11" data-to="15">Beta pago</span>
  </div>
  <span class="gantt-marker" data-at="11" data-label="MVP"></span>
</div>
```

- `data-cols` é o número de colunas (meses); `data-from`/`data-to` contam colunas a partir de 0.
- Uma linha pode ter várias barras. Cores: `.is-accent`, `.is-muted`, `.is-outline`.
- Marcos (`.gantt-marker`) cortam todas as linhas; com `data-step` aparecem só naquele build.
- As barras crescem linha a linha (`data-stagger`, padrão 160 ms). Uma barra com `data-step` entra só no build.
- Até 7 linhas. Largura dos rótulos: `style="--label-w: 300px"`.

### Diagrama de nós com conectores

O diagrama é uma grade CSS. Você posiciona os nós com `grid-column`/`grid-row` e liga com `<i class="wire">`. O motor desenha as curvas, as setas e os rótulos, e monta tudo na ordem em que os elementos aparecem no HTML (nó, fio, nó…).

```html
<div class="diagram fill" data-stagger="260" data-delay="400"
     style="grid-template-columns: 1fr 1.15fr 1fr; gap: 72px 120px">
  <div class="node node--pill node--solid" data-node="contador" style="grid-column: 2; grid-row: 1">
    <b>Contador faz a pergunta</b>
  </div>
  <div class="node node--accent" data-node="agente" style="grid-column: 2; grid-row: 2">
    <span class="node-tag">Camada 2</span><b>Agente de resposta</b><small>entende, pesquisa, responde</small>
  </div>
  <i class="wire" data-from="contador" data-to="agente" data-offset="-90" data-label="pergunta" data-label-side="left"></i>
  <i class="wire" data-from="agente" data-to="contador" data-offset="90" data-tone="accent" data-label="resposta"></i>

  <div class="node" data-node="base" style="grid-column: 2; grid-row: 3" data-step="1">…</div>
  <i class="wire" data-from="agente" data-to="base" data-step="1"></i>
</div>
```

Nós: `.node` (padrão), `.node--accent` (o que é nosso), `.node--ghost` (secundário), `.node--pill` (rótulo curto), `.node--solid` (branco). Dentro: `.node-tag`, `<b>`, `<small>`.

Atributos do fio (`<i class="wire">`):

| Atributo | Efeito |
| --- | --- |
| `data-from`, `data-to` | `data-node` (ou `id`) dos nós ligados |
| `data-side` | `auto` (padrão), `v` (vertical), `h` (horizontal), `hv` (sai de lado e entra por cima/baixo), `vh` (o contrário) |
| `data-offset` | Desloca o fio na lateral (px), para dois fios paralelos entre os mesmos nós |
| `data-from-offset`, `data-to-offset` | Desloca só uma das pontas |
| `data-arrow` | `end` (padrão), `start`, `both`, `none` |
| `data-tone` | `accent`, `blue`, `amber`, `muted` |
| `data-label` | Rótulo no meio do fio |
| `data-label-side` | `left`, `right`, `above`, `below` (afasta o rótulo do fio curto) |
| `data-label-at` | Posição do rótulo ao longo do fio, de 0 a 1 (padrão 0,5) |
| `data-step`, `data-delay` | Build e atraso, como em qualquer elemento |

Até 7 nós por diagrama. Se um fio fica curto demais para o rótulo, use `data-label-side`.

### Pergunta digitando, resposta e citação legal

```html
<div class="ask" data-anim="fade-up">
  <span data-anim="type" data-delay="300">Qual era a alíquota de Cofins em março de 2021?</span>
</div>

<div class="answer" data-step="1">
  <p>Na redação vigente em <mark data-anim="highlight" data-delay="400">15/03/2021</mark>, …</p>
  <div class="cites">
    <span class="cite" data-anim="pop" data-delay="800"><strong>Lei nº 9.718/1998, art. 3º</strong><span>redação vigente em 15/03/2021</span></span>
  </div>
</div>
```

`.ask--box` deixa o campo retangular (perguntas longas). `.cite--blue` é a variante azul (norma relacionada).

### Citação

```html
<section class="slide slide--center">
  <blockquote class="quote" data-anim="blur-in">A IA não assina. Quem assina é o contador.</blockquote>
  <p class="quote-by" data-anim="fade" data-delay="600"><strong>Nome</strong>, cargo</p>
</section>
```

### Indicadores em linha

```html
<div class="kpis" data-anim="stagger">
  <div class="kpi"><div class="kpi-value" data-count-to="416372">416.372</div><div class="kpi-label">contadores</div></div>
  <div class="kpi"><div class="kpi-value grad-text" data-count-to="4" data-prefix="+" data-suffix="%">+4%</div><div class="kpi-label">em 21 meses</div></div>
</div>
```

Até 4 indicadores.

### Rodapé com fonte e marca

```html
<p class="source">Fonte: CFC, Relato Integrado 2025. Ver pesquisa/05-mercado-preco.md, §1.</p>
<div class="brand">DGM-RAG-Contábil</div>
```

### SVG desenhado à mão

```html
<svg class="svg-draw" viewBox="0 0 800 200" width="800" height="200" data-anim="draw">
  <path d="M10 150 C 200 20, 400 20, 790 120" />
</svg>
```

Todos os traços (`path`, `line`, `polyline`, `circle`, `rect`) se desenham. Para algo que deve só aparecer depois do traço, use `class="fade-part"`; para não desenhar, `class="no-draw"`.

## Notas do apresentador

```html
<aside class="notes">
  <p>Frase de abertura.</p>
  <ul><li>Ponto 1</li><li>Ponto 2</li></ul>
</aside>
```

Fica dentro do `<section>`, nunca aparece no palco e é a única coisa que aparece na janela do apresentador. Escreva para ser lido de relance: frases curtas, o que fazer em cada build ("Avance: aparece o custo por usuário").

## Quando usar cada animação

- **Título:** `words` no primeiro slide de cada seção e em frases de impacto; `fade` ou `fade-up` nos demais (variar evita cansaço).
- **Número grande:** contador + `blur-in`. Um por slide.
- **Listas e grades:** `stagger`. Se cada item merece uma fala, `data-step` em cada um.
- **Diagramas:** montagem automática quando a fala acompanha a ordem; `data-step` quando cada parte é explicada separadamente.
- **Gráficos:** barras e linhas crescem sozinhas; o destaque (`is-accent`) pode entrar num build.
- **Trecho de lei ou número citado:** `highlight` no momento em que é lido.
- **Pergunta de exemplo:** `type`. No máximo duas vezes na apresentação.
- **Evite** empilhar `delay`s longos: se o público espera mais de 2 segundos parado, vire build.

## Checklist antes de entregar o seu arquivo

- [ ] `node build.mjs` roda sem avisos novos do seu arquivo.
- [ ] Cada slide tem `data-title`, uma ideia e notas.
- [ ] Todo número tem fonte no `.source` (ou vem do modelo via `data-bind`).
- [ ] Você passou pelos seus slides com → e ← (builds vão e voltam) e viu `?print`.
- [ ] Nada estoura a área útil, nem quebra o título em mais de 2 linhas.
