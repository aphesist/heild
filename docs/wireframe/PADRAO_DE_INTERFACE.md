# Padrão de interface do wireframe

**Versão 2 · 15/11/2026 · direção de design de interface.** Como toda tela do `app/` organiza grade, cards, texto, estados, movimento e toque, em qualquer largura. Substitui a versão 1 (QA de interface), que fechava vãos esticando cards. A ideia por trás está no `DIRECAO_VISUAL.md`; o que é marca (cores, raios, sombras, espaçamentos, tipos) continua no design system (`design-system/forma.md`, `cores.md`, `tipografia.md` no branch `design-system`) e aqui só é aplicado. O teste `app/scripts/qa-interface.cjs` confere as regras marcadas com **[QA]**.

**A regra que manda nas outras:** o card tem o tamanho do conteúdo e da tarefa, não o do vão que sobrou. Buraco se resolve com ordem e empacotamento, nunca esticando.

## 1. Faixas de largura e grade

| Faixa | Largura da janela | Variante Tailwind | Barra lateral | Grade de widgets | Grade de cards fora dos widgets |
| --- | --- | --- | --- | --- | --- |
| Celular | < 640 | (base) | menu inferior com 5 destinos | 2 colunas | 1 coluna |
| Tablet | 640 a 1023 | `sm:` `md:` | menu inferior até 767; de 768, fechada (76px), abre por cima | 2 ou 4 colunas | 1 ou 2 colunas |
| Computador | 1024 a 1439 | `lg:` `xl:` | fixa a partir de 1280 | 4 ou 6 colunas | 2 colunas (3 se forem do mesmo tipo) |
| Largo | ≥ 1440 | `largo:` (e `ultra:` ≥ 1800) | fixa | 6 colunas (8 no ultrawide) | 2 ou 3 colunas |

- **Contêiner da tela:** `pagina` (`index.css`): centrado, até 1152px (1600px no ultrawide), como manda o design system. Trocar de aba não move o conteúdo.
- **Margem lateral:** `px-4 sm:px-5` na área de rolagem (16px no celular, nunca menos).
- **Colunas da grade de widgets** saem da largura do contêiner (célula de no mínimo ~150px): < 600 → 2; < 980 → 4; < 1320 → 6; acima → 8 (`colunasPara`, `components/widgets/grade.tsx`).
- **Grade sem colunas na faixa atual** tem uma coluna `minmax(0,1fr)` (base em `index.css`): nunca empurra a página para o lado.

## 2. Espaçamento e densidade (tokens do design system, base 4px)

| Uso | Classe | Token |
| --- | --- | --- |
| Entre cards e na grade de widgets | `gap-4` (na grade de widgets, o respiro de 16px embaixo de cada item) | `espaco-4` |
| Padding de card | `p-4` (`sm:p-5` em `Caixa` de página) | `espaco-4` / `espaco-5` |
| Entre título do card e corpo | `gap-3` | `espaco-3` |
| Entre itens de uma lista | linha de 40 a 52px com divisória `border` (sem `gap` extra) | `espaco-2` / `espaco-3` |
| Entre chips e botões de um grupo | `gap-2` | `espaco-2` |
| Entre seções da tela | `gap-6` ou `gap-8` | `espaco-6` / `espaco-8` |

- **Densidade confortável:** texto 14px, apertado dentro do grupo (8 a 12px), generoso entre grupos (24 a 32px). Mais espaço acima de um título do que abaixo dele.
- Espaço entre irmãos vem de `gap`, nunca de margem. Nenhum valor solto (`gap-[13px]`, `p-[7px]`, `rounded-[14px]`).
- **Raios aninhados** (forma.md): cartão e widget `rounded-cartao` (20px), coluna ou bloco dentro do cartão `rounded-lg` (17px), item dentro da coluna `rounded-md` (12,75px), ícone com fundo `rounded-sm`. Pílula para ação principal, sugestão, selo e abas. `rounded-cartao`, `rounded-campo` e `rounded-painel` são os tokens do design system, proporcionais ao raio do tema (seguem a marca branca).

## 3. Tamanho do card por conteúdo e tarefa

### Como a grade de widgets mede

- O tamanho escolhido (P 1×1, M 2×1, G 2×2, L 4×1, XL 4×2, em colunas × células) dá **a largura e o teto de altura**. A célula tem 156px (136px em tela baixa).
- **A altura é a que o conteúdo pede**, medida em módulos de 4px (`--modulo-widget`, o `espaco-1`): a grade solta o corpo do widget por um instante, lê a altura natural e devolve no mesmo quadro (`useAlturas`, `grade.tsx`). O card fica com a altura do conteúdo, de no mínimo uma célula.
- **Teto e rolagem:** passou do teto do tamanho, o corpo rola por dentro (com o esmaecido de baixo). Se passa por até meia célula (a última linha de sugestões, o rodapé de uma lista), ganha essa meia célula em vez de ser cortado.
- **Área de trabalho** (kanban, calendário) declara `linhasMaximas` (teto maior, em células) e `larguraMinima` (seção 4).
- O conteúdo recebe o tamanho escolhido (`useTamanhoWidget()`); só na grade estreita (L e XL no celular) recebe o maior tamanho aceito que cabe na largura (o calendário abre no dia, não na semana).
- O modo edição mostra exatamente o mesmo arranjo (sem pulo ao concluir).

### Por tipo de conteúdo

| Conteúdo | Tarefa | Tamanho | Largura | Altura |
| --- | --- | --- | --- | --- |
| KPI, número, medidor | olhar e decidir se abre | P (um número), M (dois a três números ou número + detalhe) | estreito | uma célula; nunca rola; número `tabular-nums` em `titulo` leve |
| Lista curta (até ~6 linhas) | escolher um item e agir | M ou G | 2 colunas | pelo conteúdo; o "ver todas" no cabeçalho |
| Lista longa / fila | trabalhar item a item | G ou XL | 2 a 4 colunas | teto de 2 células e rola por dentro; filtros no topo do corpo |
| Tabela | comparar linhas | G até 4 colunas de dado; XL de 5 a 6; mais de 6, `larguraMinima` | pelo número de colunas | cabeçalho fixo, rola por dentro; no celular vira lista de linhas |
| Kanban | mover trabalho entre etapas | XL com `larguraMinima` = colunas × 15rem + vãos e `linhasMaximas` 4 (ou tela própria, como os Leads) | o que as colunas pedem | coluna com a altura do que carrega; cada uma rola por dentro; etapa vazia diz "Nada nesta etapa" |
| Calendário | ver a semana ou o mês e reprogramar | G (dois dias), XL (semana) com `larguraMinima` 66rem (7 dias × 9rem) e `linhasMaximas` 3 | a da semana | pelo dia mais cheio, até o teto; no celular, o dia |
| Gráfico | ver tendência | M (sparkline com o número), G/L (com eixo) | L quando a série é longa | nunca rola; legenda dentro do card |
| Formulário | preencher e salvar | fora da grade: gaveta (`GavetaFormulario`) ou card de página | até 36rem de campo | a gaveta rola; botões no rodapé fixo |
| Chat / pedir ao integrante | pedir algo | M (as sugestões) ou G | 2 colunas | a conversa vai para a gaveta do chat; no card, só as sugestões |
| Linha do tempo | entender o que aconteceu | G; L quando vira faixa horizontal de etapas | 2 colunas; inteira se for faixa | rola por dentro, mais recente em cima |
| Estado vazio | saber que não há nada e o que fazer | o menor que o widget aceita | — | uma célula; frase e ação no centro |

- Widget declara só os tamanhos que fazem sentido em `tamanhos`; o arranjo padrão escolhe pela tarefa (uma fila de trabalho merece G; uma lista de três relatórios, M).

### Contrato de transbordo **[QA]**

Todo widget aguenta 0, 1, 3, 15, 50 e 200 itens sem crescer sem limite nem cortar seco:

| Quantidade | O que acontece |
| --- | --- |
| 0 | Estado vazio com a próxima ação (`EstadoVazio compacto`), o card no menor tamanho |
| Até o teto do tamanho | Cabe no card, com a altura do conteúdo |
| Acima do teto de altura | O corpo rola por dentro com o esmaecido do topo e do fim; o rodapé oferece **"Ver tudo (N)"**, que abre o conteúdo inteiro numa gaveta (no tamanho XL). Vem do próprio `Widget` (`components/widgets/widget.tsx`): nenhum widget precisa fazer à mão |
| Lista com teto por quantidade | `ListaComTeto` (`components/kit/lista-com-teto.tsx`): até P 3, M 5, G 8, L 5, XL 12 itens; além disso "Ver todos (N)" abre a lista inteira numa gaveta |
| Centenas de itens | Na gaveta, acima de 150 itens, só a janela visível é desenhada (`ListaVirtual`) |

- **Texto:** curto, longo e sem espaço (CNPJ, chave, e-mail) cabem: quebra de palavra na base, truncamento com título, selo que trunca.
- **Valores e datas extremos:** R$ 0,00, R$ 1.234.567.890,12, negativos, percentuais acima de 100%, datas vencidas, de hoje e futuras: a coluna de valor tem o tamanho do conteúdo (`minmax(Nrem,max-content)`), nada invade o vizinho.
- **Campos opcionais ausentes, todos os status misturados, serviços falhando e sem permissão:** o widget mostra o que tem e diz o que falta, sem quebrar.
- **Como conferir:** o UI Lab (`#/lab/ui/widget`) alimenta o widget real com cada cenário (`nucleo/semente/cenario.ts`); o `scripts/ui-lab-qa.cjs --frente=widgets` percorre todos os widgets, com cliente e na carteira, em todos os cenários de quantidade, tamanhos e larguras principais.
- Fora da grade de widgets, um card de página (`Caixa`) tem altura natural; lista longa vai numa `<AreaRolagem className="max-h-[60vh]">`, não no card inteiro.

## 4. Largura inteira: só quando o conteúdo pede

- **Critério escrito:** um card ocupa a largura inteira quando a **largura mínima do conteúdo** passa da largura do seu tamanho. Na grade de widgets isso é calculado: `larguraMinima` (rem, no XL) vira colunas pela largura real da coluna, até a grade inteira. Em 1152px, o kanban de quatro etapas (64rem) e a semana (66rem) pedem as seis colunas; no ultrawide (8 colunas) pedem seis e sobram duas para outro widget.
- **Pedem largura:** kanban com quatro ou mais colunas, calendário de semana ou mês, tabela com mais de seis colunas de dado, linha do tempo em faixa (etapas lado a lado), comparação lado a lado, o cartão principal de uma tela de trabalho (a conversa no CRM).
- **Não pedem:** KPI, lista, card de ação, estado vazio, gráfico curto, formulário. Esses deixam a linha para os vizinhos.
- Fora da grade: largura inteira = o card fora da grade de colunas, sozinho na linha (`col-span-full` ou fora do `grid`).

## 5. Anti-buraco por ordem e empacotamento **[QA]**

O que a grade faz (`arranjar`, `components/widgets/tipos.ts`):

1. **Ordem é prioridade.** O arranjo padrão (`padroes.ts` do Painel, `padraoDoPapel` do Início) lista os widgets na ordem da tarefa do dia: o que pede decisão (pendências, prazos, aprovações), depois o que se trabalha (filas, kanban, calendário), depois o que se consulta (relatórios, documentos, histórico).
2. **Empacotamento.** Cada widget vai para o primeiro lugar livre, de cima para baixo e da esquerda para a direita; um widget menor que vem depois sobe para o vão de cima (como `grid-auto-flow: dense`).
3. **Só cresce quem pede.** Um widget com mais conteúdo do que o teto mostra desce para o espaço livre logo abaixo dele, até a altura que o conteúdo pede. Nenhum widget cresce para o lado.
4. **Acerto de faixa.** Se sob um widget sobra no máximo meia célula (até 84px) até o próximo widget ou o fim da grade, ele desce essa sobra e o fundo alinha com o vizinho. Mais que isso não: é buraco, e a correção é a ordem.
5. **A sobra da última faixa** fica: é o fim natural do conteúdo, alinhado à esquerda, como a última linha de um parágrafo. O QA não conta a última faixa.

O que a sessão de tela faz quando ainda sobra vão no meio:

- trocar a ordem no arranjo padrão (o widget baixo vai para junto de outro baixo; o alto, para junto de outro alto);
- trocar o tamanho para o que a tarefa pede (lista de três itens em M, não em G);
- juntar dois widgets fracos num só (ex.: "Atrasos e riscos" dentro de "Prazos");
- nunca esticar um card para tapar o vão, nem pôr conteúdo de enchimento.

**Fora da grade de widgets** (telas com `grid` de `Caixa`):

- Cards de alturas parecidas na mesma linha: `items-stretch` (o padrão) e o card com `h-full`: a linha fica com uma altura só e os títulos na mesma altura.
- Cards de alturas diferentes: a coluna mais curta vira uma **pilha** (`flex flex-col gap-4`) com o próximo card de baixo, ou a linha usa `items-start` e o card mais baixo leva um vizinho embaixo. Nunca duas colunas com centenas de pixels vazios sob a mais curta.
- Coluna lateral (resumo, ajuda) ao lado de uma lista longa: `lg:sticky lg:top-0 self-start`, para ficar à vista ao rolar em vez de deixar o vão.
- Masonry só consciente: `columns-2 gap-4` com `break-inside-avoid`, quando os cards são independentes e sem ordem de leitura.

## 6. Hierarquia: título, ação e número

- **Título do card** em `corpo-enfase` (14/500), uma linha com `truncate` e `title`; é a pergunta que o card responde ("Quem está devendo?"). Sem rótulo acima do título, sem código de rastreio à vista (os IDs do mapa aparecem ao passar o mouse e no `title`).
- **Ícone do card** no peso regular (Phosphor), 18px, em `texto-suave`; só um, à esquerda do título.
- **Ação do card:** no máximo uma no cabeçalho (link "Ver todas →", "Abrir →"), em `texto-suave`; a ação principal do conteúdo é um botão no fim do corpo ou na linha do item. Mais de três ações: as outras vão para um menu "Mais".
- **Uma ação, uma forma:** a mesma ação tem o mesmo botão em todo lugar (ex.: "Lançar tempo" uma vez por tela).
- **Número:** `titulo` 36/300 com `tabular-nums` quando decide (KPI); 24/300 quando é contexto; valores em reais à direita na tabela; estado sempre com palavra ou ícone além da cor.

## 7. Texto **[QA]**

- Todo filho de `flex`/`grid` com texto leva `min-w-0`.
- **Uma linha:** `truncate` + `title={texto}`. **Até duas linhas:** `line-clamp-2` + `title`.
- **Quebra:** frases quebram (`break-words`, `text-pretty`); títulos equilibrados (`text-balance`); códigos longos sem espaço (CNPJ, chave, e-mail) `break-all` ou `truncate`.
- **Botão:** o rótulo quebra em vez de vazar (`button.tsx`).
- **Números:** `tabular-nums` em toda coluna, total e KPI (a `Tabela` já põe na tabela inteira).
- **Palavra sem espaço** (CNPJ, chave, e-mail) quebra em vez de vazar: a base põe `overflow-wrap: anywhere` no corpo (na tabela, `break-word`: a coluna alarga primeiro). **[QA]**
- **Quem trunca tem título:** `Linha`, `Celula texto=`, `Badge`, `ListItem`, `Passos` e o título do widget põem o `title` sozinhos; à mão, `truncate` sempre com `title`. **[QA]**
- **Linha que quebra** (`flex flex-wrap`): o texto é `min-w-0 grow basis-40` (base de 10rem), nunca `flex-1` (base 0), senão os botões nunca descem e o texto vira uma coluna de três palavras. **[QA]**

### Lista em colunas e selo **[QA]**

- Lista que é tabela (tarefas, contratos, cobranças) usa `ListaColunas` + `LinhaColunas` + `Celula` (`components/kit/linha-colunas.tsx`): uma grade só para cabeçalho e linhas. `largura: 'fluida'` para o texto (trunca), `'conteudo'` para selo, valor e ação (a trilha cresce com o conteúdo e nada invade o vizinho), `'NNrem'` só para texto que trunca. Abaixo da quebra do contêiner, `largo` some e `abaixo` desce para a linha de baixo.
- Coluna de valor ou selo em grade feita à mão: `minmax(Nrem,max-content)`, nunca `Nrem` seco; em flex, `min-w-NN shrink-0 whitespace-nowrap`, nunca `w-NN`.
- `Badge` nunca passa da largura do contêiner: sem lugar, trunca e mostra o selo inteiro no `title`. Selo de estado: fundo do estado a 15%, texto em `texto`, ícone na cor do estado (cores.md), inclusive o de erro.
- Nada abaixo de 12px fora da hora da mensagem (11px). Nada em caixa alta.
- Nenhum texto passa da borda do card ou da tela; corte só com reticências.

## 8. Estados

| Estado | Componente | Regra |
| --- | --- | --- |
| Vazio | `EstadoVazio` (kit), `VazioWidget`, `Vazio` (S03) | ícone regular em círculo rebaixado, frase que diz o que não há e a ação que resolve; no centro; marca `data-estado-vazio`. No widget, o card fica no menor tamanho (uma célula) |
| Carregando | `Carregando` com `linhas` | esqueleto com a forma do conteúdo (linhas de 48px), nunca girador no meio do card; sem pulsar com movimento reduzido |
| Erro | `EstadoErro` | o que deu errado em frase de colega e "Tentar de novo" |
| Etapa vazia de kanban | `Quadro` | "Nada nesta etapa · arraste para cá" em borda tracejada, da altura de um cartão |
| Aguardando decisão | contorno `atencao` a 60% (cores.md) | o card que pede decisão se destaca pelo contorno, não pelo tamanho |

Nunca um card em branco, nem enquanto carrega.

## 9. Movimento

- **Só quando algo muda.** Entrada de cartão: sobe 4px e aparece em 0,3s `ease-out` (forma.md). Troca de aba: a pílula desliza (mola). Grade: os widgets refluem para o lugar novo ao editar. Kanban: o cartão acompanha o dedo e as colunas abrem espaço.
- **Rotina em 150 a 250ms** (cor, sombra, opacidade); layout em 300 a 500ms; nada de coreografia ao abrir a tela.
- **Hover não pula:** o card não se move sob o ponteiro; muda só a cor do link ou da linha. Card que é link inteiro pode subir 2px num filho, nunca o próprio card.
- **Em repouso, só o orb** (design system). Nada pisca, nada gira.
- **Movimento reduzido:** nada se desloca; o que confirma uma ação continua visível por cor e opacidade.

## 10. Rolagem

- **Toda rolagem passa pela primitiva `AreaRolagem`** (`components/ui/area-rolagem.tsx`), `eixo="y"` (padrão), `"x"` ou `"ambos"`: o topo e o fim (ou os lados) esmaecem quando há conteúdo para aquele lado; parado, nada é cortado. A regra `scripts/regra-rolagem.cjs` (no `npm run build`) acusa qualquer `overflow-auto`, `overflow-x-auto`, `overflow-y-auto` ou `overflow-scroll` fora dela. **[QA]**
- **Cabeçalho fixo dentro da área** (o `thead` da `Tabela`, o cabeçalho preso de uma gaveta): marque com `data-cabecalho-fixo`; o esmaecido do topo começa abaixo dele e a primeira linha não é cortada seca. A `Tabela` rola nas duas direções (`eixo="ambos"`).
- Modal (`DialogContent`) tem altura máxima e o conteúdo rola por dentro; gaveta usa `SheetCorpo` (ou `GavetaFormulario`/`GavetaLarga`) entre o cabeçalho e o rodapé.
- A página não rola de lado em nenhuma largura **[QA]**. Rolagem horizontal só em faixa declarada (`<AreaRolagem eixo="x">`, com `snap-x` no kanban): abas, kanban, tabela larga no tablet.
- Rolagem interna só em: corpo do widget acima do teto, coluna do kanban, tabela com cabeçalho fixo, chat. Nunca duas rolagens verticais aninhadas visíveis ao mesmo tempo.
- O botão flutuante Chat não cobre o fim da tela (`md:pb-24` na área de rolagem).

## 11. Celular e toque **[QA]**

- **Uma coluna na ordem de prioridade**, KPIs aos pares (P ocupa uma das duas colunas), cada card com a altura do que carrega.
- **Menu inferior** (< 768px): Início, Tarefas, Pendências, Chat, Mais. O conteúdo sobe a altura do menu (`ALTURA_MENU_INFERIOR`).
- **Kanban** em colunas de 85% com encaixe (`snap-x`), a próxima aparecendo na borda; **calendário** no dia; **tabela** vira lista de linhas (ou rola de lado com a borda esmaecida).
- **Alvo de toque ≥ 44px** com ponteiro grosso (área invisível, `--alvo-toque`, `index.css`); campos com 44px; caixa e rádio com 24px e rótulo completando o alvo.
- Ações principais com pelo menos `size="default"`, decisão em um toque; edição e configuração "no computador" (`SoLeituraNoCelular`).
- Ícone sem texto sempre com `aria-label`.

## 12. Como conferir

```
cd app && npx vite --port 6300 --strictPort
URL_APP=http://localhost:6300/ node scripts/qa-interface.cjs /caminho/dos/prints [filtro-de-rota] [1440,1024,768,390]
```

O script percorre todas as rotas nas quatro larguras, salva um print alto de cada uma e grava `qa-interface.json` com o que achou em cada categoria: `rolagem`, `texto`, `toque`, `vazio` (widget com mais da metade do corpo vazio), `buraco` (célula vazia no meio da grade de widgets, ou vão sob card fora dela). Olhe também o print: o script não vê hierarquia nem ordem.

**UI Lab e QA por componente.** O `#/lab/ui` mostra cada componente em todos os estados, quantidades de itens, comprimentos de texto, tamanhos, temas, larguras e densidades, e as páginas destas regras. O `scripts/ui-lab-qa.cjs` percorre o Lab por pares e as rotas reais em quatro variantes, com o detector de `scripts/lib/detector.cjs` (texto cortado, texto espremido, sobreposição, rolagem sem esmaecido, rolagem lateral, toque, contraste AA, vão, conteúdo fora do card). Como rodar e a contagem: `UI_LAB_QA.md`.
