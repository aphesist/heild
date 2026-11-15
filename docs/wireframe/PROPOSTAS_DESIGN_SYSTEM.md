# Propostas ao design system

**15/11/2026 · direção de design de interface.** O que a direção visual do wireframe (`DIRECAO_VISUAL.md`, `PADRAO_DE_INTERFACE.md` versão 2) pediria do design system e que **não** foi mudado no app, porque mexe em token ou regra de marca. Cada proposta vai para o branch `design-system`, se o dono aprovar; até lá o app segue o design system como está.

## 1. Raios como proporção do raio base

- **Hoje:** `forma.md` dá os raios em pixels fixos (`raio-cartao` 20px, `raio-campo` 24px, `raio-painel` 34px). O app tem marca branca: o escritório troca o raio base (`raio_borda` no tema), e só `sm`, `md`, `lg`, `xl` e `2xl` acompanham; os outros ficavam soltos (`rounded-[24px]` no widget e na `Caixa`).
- **No app (sem mudar a marca):** `rounded-cartao`, `rounded-campo` e `rounded-painel` em `index.css`, calculados do raio base (`20/17`, `24/17`, `2×`), que dão exatamente 20, 24 e 34px no tema da Heild.
- **Proposta:** escrever em `forma.md` e no `tokens.json` que todo raio é proporção do `raio-lg` (como já são `sm`, `md` e `xl`), para que os temas de escritório escalem a forma inteira.
- **Decidido no UI Lab (`wf-ui-lab`), sem mudar a marca:** os 284 raios em pixel solto do app viraram o token de `forma.md` mais próximo (6 a 10px → `sm`; 12 e 14 → `md`; 16 e 18 → `lg`; 20 e 22 → `cartao`; 24 a 28 → `campo`; 34 → `painel`), e `npm run build` barra raio solto novo (`scripts/regra-raios.cjs`). A exceção é a moldura do aparelho no app do cliente. O mapa está na página Raios do UI Lab. A proposta ao design system (escrever a proporção em `forma.md`) continua de pé.

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

## 6. Texto suave sobre o fundo rebaixado

- **Hoje:** `cores.md` dá o `texto-suave` para texto secundário em qualquer camada. O QA do UI Lab (`app/scripts/ui-lab-qa.cjs`, regra de contraste) mede o par `texto-suave` × `rebaixada` (o fundo de hover, de item selecionado e de selo neutro) entre **4,0 e 4,4:1** no claro da Heild: abaixo do AA (4,5:1) por pouco. Nas outras camadas (fundo, superfície, elevada) passa.
- **No app (sem mudar a marca):** onde o texto secundário fica sobre o rebaixado de forma estável (item selecionado da lista de integrantes), o texto passa a `texto`. No hover (passageiro) e nos temas de escritório, o provider já leva o texto suave dos temas sem esse valor até 4,5:1 em todas as camadas; o da Heild é o do design system e não foi mexido.
- **Proposta:** escurecer um passo o `texto-suave` do claro (para passar de 4,5:1 também no `rebaixada`), ou escrever em `cores.md` que texto secundário sobre `rebaixada` usa `texto`. A primeira resolve em todo lugar; a segunda pede cuidado de quem desenha. **Pergunta ao dono antes de mexer** (é token de marca).
