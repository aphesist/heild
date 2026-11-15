# Propostas ao design system

**15/11/2026 · direção de design de interface.** O que a direção visual do wireframe (`DIRECAO_VISUAL.md`, `PADRAO_DE_INTERFACE.md` versão 2) pediria do design system e que **não** foi mudado no app, porque mexe em token ou regra de marca. Cada proposta vai para o branch `design-system`, se o dono aprovar; até lá o app segue o design system como está.

## 1. Raios como proporção do raio base

- **Hoje:** `forma.md` dá os raios em pixels fixos (`raio-cartao` 20px, `raio-campo` 24px, `raio-painel` 34px). O app tem marca branca: o escritório troca o raio base (`raio_borda` no tema), e só `sm`, `md`, `lg`, `xl` e `2xl` acompanham; os outros ficavam soltos (`rounded-[24px]` no widget e na `Caixa`).
- **No app (sem mudar a marca):** `rounded-cartao`, `rounded-campo` e `rounded-painel` em `index.css`, calculados do raio base (`20/17`, `24/17`, `2×`), que dão exatamente 20, 24 e 34px no tema da Heild.
- **Proposta:** escrever em `forma.md` e no `tokens.json` que todo raio é proporção do `raio-lg` (como já são `sm`, `md` e `xl`), para que os temas de escritório escalem a forma inteira.

## 2. Estilo `numero-medio`

- **Hoje:** a escala tem `numero-grande` (36/40, 300, tabular) e mais nada para número. As telas usam 24 e 30px soltos (`text-2xl`, `text-3xl`) em faixas de resumo e KPIs de contexto.
- **Proposta:** acrescentar `numero-medio`, 24/32, 300, `tabular-nums`, para o número que dá contexto (não decide). Assim o 36 fica reservado ao número que pede ação, e a hierarquia entre KPIs vira regra.

## 3. Card clicável: estado de hover e de seleção

- **Hoje:** `forma.md` dá uma sombra por peça e não diz o que acontece com um cartão inteiro clicável (aviso do time, cliente na lista, cartão do kanban) ao passar o mouse ou quando está selecionado. Cada tela inventa (fundo rebaixado, contorno, nada).
- **Proposta:** definir dois estados com os tokens que já existem: **hover** = camada um passo acima (`superficie` → `elevada`) sem mudar a sombra e sem mover o cartão; **selecionado** = contorno de 2px em `destaque` (o "marcador de seleção" que `cores.md` já prevê para o índigo). Sem novo token de sombra.

## 4. Módulo de altura da grade

- **Hoje:** a grade de widgets mede altura em módulos de 4px (`espaco-1`) e a célula de 156px vem do app (`--celula-widget`), não do design system.
- **Proposta:** levar para `forma.md` a "célula de widget" (156px; 136px em tela baixa) e a regra de que o widget tem a altura do conteúdo, em passos de `espaco-1`, com teto em células. Hoje é decisão de produto; vale registrar como forma da marca para o site e as apresentações mostrarem o produto do mesmo jeito.

## 5. Ícones da barra lateral

- **Hoje:** o README do design system pede Phosphor "no peso regular". A barra lateral do app usa duotone no item inativo e preenchido no ativo (`barra-lateral.tsx`), o que veio do desenho da navegação.
- **No app:** os componentes base passaram para o peso regular; a barra lateral ficou como está, porque o preenchido marca o destino atual.
- **Proposta:** escrever a exceção no design system: na navegação principal, regular no inativo e preenchido no ativo (sem duotone). Se aprovado, a barra troca o duotone pelo regular.
