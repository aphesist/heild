# Direção visual do wireframe

**Versão 1 · 15/11/2026 · direção de design de interface.** O diagnóstico com olhos de designer das telas principais e a direção visual da Heild como sistema de operação diário. O `PADRAO_DE_INTERFACE.md` (versão 2) transforma esta direção em regras; o `QA_INTERFACE.md` lista o que sobra por grupo de telas. A marca continua no design system (branch `design-system`); aqui ela só é aplicada. O que exigiria mudar token ou regra de marca está em `PROPOSTAS_DESIGN_SYSTEM.md`.

## Em cinco linhas

1. A Heild é uma mesa de trabalho em areia: camadas quietas, um índigo raro, os orbs como única cor viva. Nada compete com o trabalho.
2. O card tem o tamanho do que carrega e da tarefa que pede. Nunca o tamanho do vão que sobrou na grade.
3. A ordem da tela é a ordem do dia: o que pede decisão em cima, o que se acompanha no meio, o que se consulta embaixo.
4. Cada card responde a uma pergunta e oferece uma ação principal. Número grande só quando ele decide alguma coisa.
5. O movimento só acontece quando algo muda (um cartão chega, uma etapa avança); o resto fica parado, para quem passa oito horas na tela.

## Como foi feito

- **Telas e larguras:** Início (Assistente, Time, Visão geral), Painel com as oito abas de setor com cliente e na carteira, o Kanban do fechamento (Contábil, carteira), CRM, Timesheet com o lançamento manual, Financeiro, BPO, Arquivos, Configurações e o app do cliente, em 1440×900, 1024×768 e 390×844 (e 768×1024 no script de QA). Prints de antes e depois em `scratchpad/design/` da sessão (não vão para o git); os do script em `qa-interface.json` de cada pasta.
- **Método:** a crítica do Impeccable (modo **Operate**: a pessoa veio terminar uma tarefa; o mundo da marca entra só por tipo, paleta, densidade e um gesto próprio) com a rubrica de carga cognitiva e as heurísticas de Nielsen, mais as partes do Taste que valem para um sistema (bordas iguais, nada esparso, "card que é quase nada": um passo acima do fundo, sem moldura dentro de moldura, títulos na mesma altura numa linha). A crítica rodou num contexto só e sem o detector automático do Impeccable (a sessão não executa scripts das skills); o que o detector faria (contraste, sobreposição, alvo de toque) ficou com o `qa-interface.cjs`.
- **Quando a skill e a marca discordam, vale a marca.** Ex.: o Taste pede cartões sem sombra e com 24 a 32px de respiro; o design system pede `sombra-cartao` e 16px. Ficou o design system.

## O que já é bom (e fica)

- **A paleta.** Areia quente em camadas, sem cinza frio; o índigo quase não aparece; o estado sempre vem com palavra ("atrasada", "vence hoje"). Isso é raro em sistema contábil e é o que dá a calma.
- **A tipografia.** Títulos grandes e leves (300) e a Text em 14px: a tela tem hierarquia sem gritar. Números de KPI em `titulo` leve com algarismos tabulares.
- **Os orbs.** O único elemento vivo, com cor própria, usado só no orb e nos marcadores do integrante. É o gesto próprio da Heild: o time trabalhando dentro da superfície neutra.
- **Abas segmentadas** em trilho afundado com a pílula elevada que desliza: familiar, claro, da marca.
- **Linguagem do ofício** ("PGDAS-D", "fator R", "lote") e frases de colega ("Contábil está livre. Peça o que precisa").
- **Estados declarados** (`EstadoVazio`, `Carregando`, `EstadoErro`) e o esmaecido nas bordas de rolagem.

## O que é "cara de sistema genérico"

| # | Sintoma | Onde | Por que incomoda quem usa |
| --- | --- | --- | --- |
| G1 | **Card esticado para fechar a grade.** A grade fazia o vizinho crescer para o lado e para baixo até não sobrar vão; o card ganhava altura sem ganhar conteúdo (Implantações com 2 linhas num card de 2×2 células: 60% vazio; Fila de assinatura vazia num G; Atrasos e riscos, Pré-requisitos, Regras e Ações esticados até a altura da coluna) | Visão geral, Painel (todas as abas), celular | O olho procura o conteúdo que falta; o card grande diz "importante" sem ser. É o que todo dashboard genérico faz: caixa do mesmo tamanho para tudo |
| G2 | **Tudo do mesmo peso.** Uma parede de cards iguais, todos com ícone, título, lista; nenhum card diz "comece por aqui" | Painel, BPO | Carga cognitiva: a pessoa tem que ler tudo para achar o que pede decisão |
| G3 | **Coluna vazia de kanban.** Etapas com um cartão viravam colunas afundadas da altura da maior, um poço vazio | Kanban do fechamento | Peso visual onde não há trabalho |
| G4 | **Código de rastreio no título.** `CTB-026; D-21, D-22` em mono ao lado de todo título de widget | Painel | É dado para quem revisa o wireframe, não para quem trabalha; a mono como enfeite vai contra a tipografia da marca |
| G5 | **Ícones em duotone** no cabeçalho de widget, nos estados vazios e na galeria | Base | O design system pede Phosphor no peso regular; o duotone deixa a tela com cara de kit de UI |
| G6 | **Raios soltos.** `rounded-[24px]` no widget e na Caixa (o token do cartão é 20px), `14px`, `18px`, `10px` espalhados (mais de 500 ocorrências) | Base e telas | Os cantos não se aninham: o de dentro às vezes é maior que o de fora |
| G7 | **Ações sem hierarquia.** O widget Ações mistura pílula, cartão e botão; três "Lançar tempo" na mesma tela do Timesheet | Painel, Timesheet | A pessoa não sabe qual é o botão; a mesma ação em três formas |
| G8 | **Duas colunas de alturas diferentes fora da grade de widgets**, com centenas de pixels vazios sob a mais curta | Timesheet, Financeiro, BPO, Arquivos, Configurações | O vão vira o elemento mais visível da tela |
| G9 | **KPI pequeno com título cortado** ("Conversas sem respo…") e o ícone empurrado para cima do título | Visão geral | O rótulo é o que dá sentido ao número |
| G10 | **Faixa que rola de lado sem avisar** (abas do Painel e atalhos no celular, kanban) | Celular | Não se vê que há mais |

## Notas da crítica (Impeccable, modo Operate)

Heurísticas de Nielsen, de 0 a 4, na versão de partida (`wireframe`, e5732a7):

| # | Heurística | Nota | O principal |
| --- | --- | --- | --- |
| 1 | Visibilidade do estado | 3 | Toast, selo de estado e contagens; falta dizer quando algo está carregando dentro do widget |
| 2 | Linguagem do mundo real | 4 | Termos do ofício, frases de colega |
| 3 | Controle e liberdade | 3 | Desfazer nas ações; "Restaurar padrão" no painel |
| 4 | Consistência | 2 | G5, G6, G7: a mesma coisa com formas diferentes |
| 5 | Prevenção de erro | 3 | Cartão de aprovação antes de transmitir, pagar, enviar |
| 6 | Reconhecer em vez de lembrar | 3 | Seletor de cliente sempre à vista; falta "o que mudou desde ontem" |
| 7 | Flexibilidade e eficiência | 3 | Painel editável, atalhos de teclado (Ctrl+J, Ctrl+B) |
| 8 | Estética e minimalismo | 2 | G1, G2, G4: o card grande e vazio é ruído |
| 9 | Recuperação de erro | 3 | `EstadoErro` com "Tentar de novo" |
| 10 | Ajuda e documentação | 3 | Integrante responde sobre a tela; Suporte |
| | **Total** | **29/40** | Bom produto, com a forma (8 e 4) atrás do conteúdo |

- **Carga cognitiva:** falha em "foco único" e "hierarquia visual" (G2) e em "escolhas mínimas" nas abas com mais de 15 widgets; passa em agrupamento, memória de trabalho e revelação progressiva. Duas falhas: carga moderada.
- **Especificidade:** a paleta, os orbs e a voz são da Heild; a organização dos cards não era: qualquer dashboard faria igual. É aí que a direção atua.

## A direção

### A ideia: mesa de trabalho em areia

Um sistema que a equipe usa oito horas por dia precisa ser **calmo, previsível e denso na medida**. A Heild já tem a matéria (areia, luz vertical, um índigo, orbs); falta a disciplina de composição. A direção é a de uma mesa bem arrumada: cada coisa tem o tamanho dela, as coisas do mesmo assunto ficam juntas, o que está em uso fica na frente, e o que sobra de espaço é respiro, não buraco.

### Os cinco compromissos

1. **Tamanho pelo conteúdo e pela tarefa.** A largura vem do tipo de conteúdo (KPI estreito, lista média, tabela e kanban largos); a altura vem do que o card carrega, com teto e rolagem interna. A largura inteira só quando o conteúdo pede (kanban com quatro colunas de 15rem, a semana com sete dias de 9rem, tabela com mais de seis colunas, linha do tempo), e isso se calcula, não se decide no olho (`larguraMinima`).
2. **Ordem é prioridade, empacotamento é a arrumação.** O arranjo padrão de cada aba lista os widgets na ordem do dia; a grade põe cada um no primeiro lugar livre e um widget menor que vem depois sobe para o vão de cima. Nenhum card cresce para tapar buraco. O que sobra no fim da última faixa é o fim natural do conteúdo, como a última linha de um parágrafo.
3. **Um card, uma pergunta, uma ação.** O título é a pergunta ("Quem está devendo?"), o corpo é a resposta, a ação principal fica no canto do cabeçalho ou no fim do corpo. Sem rótulo acima do título, sem código de rastreio à vista, sem ícone decorativo além do que identifica o card.
4. **Camadas, não caixas.** Cartão sobre fundo (`superficie` com `sombra-cartao`), item sobre cartão (`elevada`), trilho dentro do cartão (`rebaixada`). Dois níveis no máximo dentro de um card; raios aninhados (cartão 20, coluna 17, item 12,75).
5. **Movimento só quando algo muda.** Entrada de cartão (4px, 0,3s), a pílula das abas deslizando, a grade refluindo ao editar. Hover sem pular; nada animado em repouso além do orb. Com movimento reduzido, nada se move.

### O gesto próprio da Heild

O Impeccable pede, num sistema de operação, um único gesto próprio além de tipo, paleta e densidade. O da Heild já existe e fica: **os integrantes trabalhando dentro da superfície neutra**. O orb é a única cor viva e o único movimento contínuo; quando um integrante faz algo, o card dele mostra o orb e a frase na primeira pessoa. A composição calma (este documento) existe para que esse gesto seja visto.

### Densidade e tipografia

- **Densidade confortável, não frouxa:** 14px de texto, linhas de lista de 40 a 52px, 16px de respiro no card, 16px entre cards, 32px entre seções. O usuário de escritório contábil lê muito número: densidade alta dentro do card, espaço generoso entre os grupos.
- **Números** sempre tabulares; valores em reais à direita; o número de KPI em `titulo` 36/300 quando ele decide algo, em 24/300 quando é contexto.
- **Duas tintas** (`texto`, `texto-suave`), hierarquia por tamanho e peso (500 de ênfase), nada abaixo de 12px fora da hora.

### Celular

No celular, o mesmo conteúdo vira uma coluna na ordem de prioridade, os KPIs aos pares, cada card com a altura do que carrega. Kanban e calendário trocam de forma (coluna de 85% com encaixe; o dia em vez da semana), e toda faixa que rola de lado esmaece a borda para mostrar que há mais.

## O que a base já aplica

Na grade de widgets (`components/widgets/`): altura pelo conteúdo medida em módulos de 4px, teto por tamanho com rolagem interna, empacotamento por ordem, crescimento só de quem pede, acerto de fundo de até meia célula, largura inteira calculada pela `larguraMinima`. Nos componentes base: raio do cartão do design system, cabeçalho numa linha com ícone no peso regular, códigos de rastreio só no hover, colunas de kanban da altura do conteúdo com etapa vazia dizendo que está vazia, tabela com números tabulares e cabeçalho de rótulo, estados com ícone regular e sem animação no movimento reduzido, borda esmaecida nas faixas que rolam de lado. O que fica por tela está no `QA_INTERFACE.md`.
