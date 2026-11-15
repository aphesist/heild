# QA do UI Lab

**15/11/2026 · sessão UI Lab (branch `wf-ui-lab`), fases 4 e 5.** O QA automatizado que percorre o UI Lab (`#/lab/ui`) e as telas reais, o que ele acusa e o que foi corrigido. O inventário de partida está em `INVENTARIO_UI.md`.

## Como rodar

```
cd app && npx vite --port 6300 --strictPort
URL_APP=http://localhost:6300/ node scripts/ui-lab-qa.cjs /caminho/fora/do/git [--frente=lab|telas|ambas] [--filtro=<regex>] [--larguras=390,768,1024,1440,1920] [--variantes=demo,horizonte,membro,escuro] [--doc]
```

- **Lab:** cada ficha declara os eixos que valem para ela (`window.__fichasLab`, lido do próprio Lab). O script monta os casos por **amostragem combinatória por pares**: todo par de valores de dois eixos aparece em pelo menos um caso, então todo estado de cada componente aparece em todas as larguras, todo tema com toda quantidade de itens e assim por diante. Eixos: estado, itens (0, 1, poucos, muitos, o dobro do teto), texto (curto, longo, muito longo, palavra sem espaço, números grandes), tamanho (P a XL e livre), variante (a aba, nos widgets reais), tema (os cinco, claro e escuro), densidade (16px e 18px) e largura (390, 768, 1024, 1440, 1920). Ponteiro em cima e foco são feitos de verdade (passar o mouse, Tab).
- **Telas:** as 67 rotas do `qa-interface.cjs` (`scripts/lib/rotas-qa.cjs`), nas cinco larguras e em quatro variantes: `demo` (escritório completo, Administradora), `horizonte` (escritório pequeno, com as listas quase vazias), `membro` ("ver como" Membro do Fiscal) e `escuro` (modo escuro).
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

## Contagem

<!-- contagem:inicio -->
<!-- contagem:fim -->
