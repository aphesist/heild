# Teste agêntico real · 15/11/2026

Os dois procedimentos de referência rodaram com o Claude no lugar do operário simulado. A rodada foi autorizada pelo dono, com teto de US$ 5. O roteiro é `pacotes/processos/scripts/agentico-real.ts`, o gabarito é `pacotes/processos/testes/gabarito/contabil.ts` e o relatório completo está em [`agentico-2026-11-15-real.json`](agentico-2026-11-15-real.json). A chave ficou só no ambiente do processo; relatório e logs foram conferidos sem a chave e sem cabeçalho de autenticação.

**Configuração da rodada:**

- **Modelos:** `claude-sonnet-5-5` como operário e escritor (decisão 3). O revisor não entrou em nenhum dos dois procedimentos.
- **Esforço:** `low` para o operário e `medium` para o escritor.
- **Câmbio:** R$ 5,40 por dólar.
- **Execuções:** três repetições de cada caso, 33 no total, mais uma rodada pequena antes, de 2 execuções, para conferir o custo.

## Resultado

| Procedimento | Execuções | Acerto | Erro crítico | Cartão desnecessário | Falha | Chamadas por execução | p50 da execução | p90 da execução |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CTB-COMPETENCIA-DOC | 30 | **100%** | **0** | 0 | 0 | 1,40 | 6,0 s | 9,0 s |
| CTB-ECD-TRANSMITIR (até o cartão) | 3 | **100%** | **0** | 0 | 0 | 1,00 | 5,5 s | 6,0 s |

- **Casos ambíguos:** nos dois casos em que o certo é não decidir (`duas-datas` e `sem-referencia`), o procedimento parou no cartão "não consegui" nas 3 repetições. Não chutou nenhuma vez.
- **ECD:** a conta plantada (1.1.05, adiantamento a sócios que sobe 900%) foi apontada nas 3 repetições. Nenhum motivo trouxe número, e nenhuma conta ficou fora das candidatas.
- **Saídas fora do esquema:** zero. A saída estruturada pelo esquema do contrato funcionou em todas as 45 chamadas.

## Latência por chamada de modelo (papel × procedimento)

| Papel | Procedimento | Chamadas | p50 | p90 |
| --- | --- | --- | --- | --- |
| operário | CTB-COMPETENCIA-DOC | 30 | 1,6 s | 2,3 s |
| escritor | CTB-COMPETENCIA-DOC | 12 | 1,6 s | 3,9 s |
| operário | CTB-ECD-TRANSMITIR | 3 | 2,2 s | 2,5 s |

O restante do tempo da execução (cerca de 4 s) é a fila: cada salto espera a sondagem do pg-boss, de 0,5 s, e há 6 a 8 saltos. Sobra para otimizar depois, com LISTEN/NOTIFY no worker.

## Custo

| | Tokens de entrada | Tokens de saída | Custo pela tabela de preços | Debitado na bolsa (centavos arredondados por chamada) |
| --- | --- | --- | --- | --- |
| Gabarito inteiro (33 execuções, 45 chamadas) | 28.377 | 3.545 | ≈ US$ 0,09 ≈ R$ 0,50 | R$ 0,81 (≈ US$ 0,15) |
| Rodada pequena (2 execuções) | | | | R$ 0,04 |

Por execução, o custo debitado ficou em R$ 0,02 a R$ 0,04. A bolsa debita em centavos inteiros, arredondando cada chamada para cima, o que dá cerca de 60% a mais que o custo real em chamadas tão pequenas. Isso é conservador, nunca a menos, mas vale passar a contabilidade para milésimos de centavo antes do piloto. O teto de US$ 5 não chegou perto.

## O que apareceu

1. **Escalada por confiança:** `reembolso` (data da despesa com `dd/mm/aaaa`, sem a palavra "referente") e `seguro` (só o vencimento) escalaram ao escritor nas 3 repetições. O operário devolveu confiança entre 0,3 e 0,8, abaixo do limiar de 0,9, e o escritor acertou em seguida. É o portão funcionando, mas custa uma chamada a mais nesses formatos. A frente de IA pode ajustar a instrução do contrato `ctb.competencia.escolher` ou o limiar.
2. **Arredondamento do débito:** descrito no custo acima.
3. **Nenhuma falha técnica, nenhuma recusa e nenhum fallback** acionado.
