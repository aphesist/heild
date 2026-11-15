# Padrão de interface do wireframe

**Versão 1 · 15/11/2026 · QA de interface.** Como toda tela do `app/` organiza grade, cards, texto e toque, em qualquer largura. Vale para as sessões de tela; o que é marca (cores, raios, sombras, espaçamentos) continua no design system (`design-system/forma.md` no branch `design-system`) e aqui só é aplicado. O teste `app/scripts/qa-interface.cjs` confere as regras marcadas com **[QA]**.

## 1. Faixas de largura e grade

| Faixa | Largura da janela | Variante Tailwind | Barra lateral | Grade de widgets | Grade de cards fora dos widgets |
| --- | --- | --- | --- | --- | --- |
| Celular | < 640 | (base) | menu inferior com 5 destinos | 2 colunas | 1 coluna |
| Tablet | 640 a 1023 | `sm:` `md:` | menu inferior até 767; de 768, fechada (76px), abre por cima | 2 ou 4 colunas | 2 colunas |
| Computador | 1024 a 1439 | `lg:` `xl:` | fixa a partir de 1280 | 4 ou 6 colunas | 2 ou 3 colunas |
| Largo | ≥ 1440 | `largo:` (e `ultra:` ≥ 1800) | fixa | 6 colunas (8 no ultrawide) | 3 ou 4 colunas |

- **Contêiner da tela:** `pagina` (utilitário em `index.css`): centrado, até 1152px (1600px no ultrawide), como manda o design system. Dentro dele as peças podem ocupar a largura inteira; "80% da tela" é isso: o card de trabalho ocupa a largura toda do contêiner.
- **Margem lateral:** `px-4 sm:px-5` na área de rolagem da tela (16px no celular, nunca menos).
- **Colunas da grade de widgets** saem da largura do contêiner, não da janela (célula de no mínimo ~150px): < 600 → 2; < 980 → 4; < 1320 → 6; acima → 8 (`colunasPara`, `components/widgets/grade.tsx`).
- **Grade de cards fora dos widgets:** sempre `grid gap-4` com colunas por faixa e `minmax(0,1fr)`: `grid gap-4 sm:grid-cols-2 lg:grid-cols-3`. Nada de `flex` com larguras fixas para dispor cards lado a lado.
- **Grade sem colunas na faixa atual** (o celular de `grid lg:grid-cols-2`) tem uma coluna `minmax(0,1fr)` por padrão (base em `index.css`): nunca cresce até o conteúdo mais largo nem empurra a página para o lado.

## 2. Espaçamento (tokens do design system, base 4px)

| Uso | Classe | Token |
| --- | --- | --- |
| Entre cards e na grade de widgets | `gap-4` | `espaco-4` (16px) |
| Padding de card | `p-4` (`sm:p-5` em card de página) | `espaco-4` / `espaco-5` |
| Entre chips e botões de um grupo | `gap-2` | `espaco-2` |
| Entre seções da tela | `gap-6` ou `gap-8` | `espaco-6` / `espaco-8` |

Espaço entre irmãos vem de `gap`, nunca de margem. Nenhum valor solto (`gap-[13px]`, `p-[7px]`).

## 3. Tamanho do card por tipo de conteúdo

A grade de widgets tem células de altura fixa (`--celula-widget`, 156px; 136px em tela baixa) e tamanhos P 1×1, M 2×1, G 2×2, L 4×1, XL 4×2 (colunas × linhas). O widget declara os tamanhos que fazem sentido em `tamanhos`; o arranjo padrão de cada aba escolhe um deles.

| Conteúdo | Tamanhos | Largura total? | Altura e rolagem |
| --- | --- | --- | --- |
| KPI, número, medidor | P (um número), M (número + detalhe ou 2 a 3 números) | não | sem rolagem; número com `tabular-nums` |
| Lista curta (até ~5 linhas) | M (2 linhas + "e mais N"), G (até 6) | não | rola por dentro só se passar; o "ver todas" vai no cabeçalho |
| Tabela | G (até 5 colunas), L/XL (mais colunas) | XL quando tem mais de 5 colunas | cabeçalho fixo; rola por dentro; no celular vira lista de linhas |
| Kanban | XL com `larguraTotal` e `linhasMinimas: 3` (ou tela própria, como os Leads) | **sim** | colunas dividem a largura (mín. 15rem); cada coluna rola por dentro; no celular, colunas de 85% com encaixe horizontal (`snap-x`); componente `Quadro` do kit |
| Gráfico | M (sparkline), G/L (gráfico com eixo) | L quando é série longa | nunca rola; legenda dentro do card |
| Formulário | fora da grade: gaveta (`GavetaFormulario`) | — | a gaveta rola; botões no rodapé fixo |
| Linha do tempo | G ou L | não | rola por dentro, mais recente em cima |
| Chat / pedir ao integrante | M ou G | não | a conversa vai para a gaveta do chat; no card, só as sugestões |
| Área de trabalho (calendário, quadro, tabela grande) | XL com `larguraTotal` | **sim** | `linhasMinimas` 3 ou 4; rola por dentro |

- `larguraTotal: true` (em `DefWidget`) faz o widget, no tamanho XL, ocupar a linha inteira em qualquer faixa; `linhasMinimas` dá a altura mínima em células no XL. Use para o que é trabalho (arrastar, comparar colunas), não para listas. Hoje: Kanban do fechamento (Contábil) e Calendário (Visão geral).
- O corpo do widget rola só na vertical (`overflow-x-hidden`); conteúdo largo (tabela) traz a própria faixa horizontal (`Tabela` do Painel já traz).
- No celular, L e XL viram 2 colunas e ganham altura (L 2×2, XL 2×3); o conteúdo recebe o maior tamanho aceito que cabe na largura (um calendário G/XL abre no dia, não na semana).
- Fora da grade de widgets, um card de página (`Caixa`) tem altura natural; card de lista longa leva `max-h-[60vh] overflow-y-auto` na lista, não no card inteiro.

## 4. Quando ocupar a largura inteira

- **Sim:** kanban, tabela com mais de 5 colunas, calendário de semana/mês, linha de filtros + resultados, comparação lado a lado, o cartão principal de uma tela de trabalho (ex.: a conversa no CRM).
- **Não:** KPI, lista curta, card de ação, estado vazio. Esses ficam em M ou G e deixam a linha para os vizinhos.

## 5. Regra anti-buraco **[QA]**

1. A grade de widgets **não deixa célula vazia no meio nem meia linha no fim**: `arranjar` (`components/widgets/tipos.ts`) coloca cada widget no primeiro lugar livre e, fora do modo edição, a linha que sobra é repartida entre os widgets da faixa; o que ainda sobrar é coberto pelo vizinho (cresce para o lado; desce se ganha um tamanho que aceita, M → G). O conteúdo recebe o tamanho que ganhou (`useTamanhoWidget()`), então um M que cresceu para 4 colunas mostra o seu L.
2. No modo edição não há preenchimento: a pessoa vê exatamente o tamanho que escolheu.
3. Fora da grade de widgets, cards da mesma linha têm a mesma altura: `grid` com `items-stretch` (o padrão) e o card com `h-full`. `items-start` só quando os cards são de tipo diferente **e** o mais baixo fica embaixo de outro (masonry consciente: `columns-2 gap-4` com `break-inside-avoid`).
4. Widget com pouco conteúdo usa o menor tamanho que aceita; o arranjo padrão não põe G em lista de 2 itens.

## 6. Texto **[QA]**

- Todo filho de `flex`/`grid` que tem texto leva `min-w-0` (senão ele não encolhe e empurra o card).
- **Uma linha:** `truncate` + `title={texto}` (ou `Tooltip`) quando o texto pode ser maior que o espaço (nome de cliente, assunto). **Até duas linhas:** `line-clamp-2` + `title`.
- **Quebra:** frases e descrições quebram (`break-words`); códigos longos sem espaço (CNPJ, chave, e-mail) levam `break-all` ou `truncate`.
- **Botão:** o rótulo quebra em vez de vazar (`max-w-full`, altura mínima, não fixa, em `components/ui/button.tsx`). Botão com altura fixa passada por fora (`h-7`) continua de uma linha.
- **Números:** `tabular-nums` em toda coluna, total e KPI; valores à direita em tabela.
- Nada de `whitespace-nowrap` em texto de conteúdo; só em rótulo curto e fixo (aba, selo).
- Nenhum texto passa da borda do card ou da tela; corte só com reticências (`truncate`/`line-clamp`).

## 7. Rolagem

- A página não rola de lado em nenhuma largura **[QA]**. Rolagem horizontal só dentro de uma faixa que se declara (`overflow-x-auto` + `snap-x`, ou `data-rolagem-horizontal`): abas, kanban, tabela larga no tablet.
- O botão flutuante Chat (tablet e computador) não cobre o fim da tela: a área de rolagem da página tem `md:pb-24`.
- Rolagem interna só em: corpo do widget (já vem do `Widget`), lista de coluna do kanban, tabela com cabeçalho fixo, chat. Nunca duas rolagens verticais aninhadas na mesma direção visíveis ao mesmo tempo.

## 8. Toque e celular **[QA]**

- **Menu inferior** (< 768px, decidido): Início, Tarefas, Pendências, Chat, Mais. O conteúdo sobe a altura do menu (`ALTURA_MENU_INFERIOR`).
- **Campos:** com ponteiro grosso, campo de texto e seleção têm no mínimo 44px de altura; caixa e rádio nativos, 24px (WCAG 2.5.8), com o rótulo (`label`) completando o alvo.
- **Alvo de toque ≥ 44px.** Com ponteiro grosso (`@media (pointer: coarse)`), todo botão, aba, rádio, caixa e item de menu ganha uma área de toque invisível centrada de no mínimo 44px (`--alvo-toque`, em `index.css`): o desenho não muda, o dedo acerta. Controle novo não precisa fazer nada; quem desenha um alvo próprio (`div` clicável) usa `button` ou `role="button"`.
- Ações principais no celular: botões de pelo menos `size="default"`, decisão em um toque; edição e configuração "no computador" (`SoLeituraNoCelular`).
- Ícone sem texto sempre com `aria-label`.

## 9. Estados vazios

- Sem dados: `EstadoVazio` (kit) com ícone, frase e a ação que resolve (`acao`); dentro de widget, `VazioWidget` ou `Vazio` (S03), que centralizam a frase. Os três marcam `data-estado-vazio` (o QA não conta como buraco).
- Nunca um card em branco: nem carregando (`Carregando` com linhas), nem com erro (`EstadoErro` com "Tentar de novo").
- Estado vazio não ganha tamanho grande: widget que costuma ficar vazio entra em M no arranjo padrão.

## 10. Como conferir

```
cd app && npx vite --port 6200 --strictPort
node scripts/qa-interface.cjs /caminho/dos/prints [filtro-de-rota] [1440,1024,768,390]
```

O script percorre todas as rotas (Início, Painel com e sem cliente, CRM, interna, Timesheet, Financeiro, BPO com e sem cliente, Arquivos, Configurações e o app do cliente) nas quatro larguras, salva um print alto de cada uma e grava `qa-interface.json` com o que achou em cada categoria: `rolagem`, `texto`, `toque`, `vazio`, `buraco`.
