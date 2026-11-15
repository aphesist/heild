# Avaliação real dos integrantes · 15/11/2026

Os cinco integrantes do Contábil rodaram o gabarito de cada setor com o Claude no lugar do operário simulado, em **modo sombra** (o procedimento inteiro, sem efeito: nenhum cartão, nenhum envio, o efeito desfeito). A rodada foi autorizada pelo dono, com teto de US$ 10 para a sessão. O roteiro é `pacotes/integrantes/scripts/avaliar.ts`, o gabarito é `pacotes/integrantes/src/avaliacao/gabarito.ts` (hash `22ae1cbb61ed0952`) e o relatório completo está em [`integrantes-2026-11-15-real.json`](integrantes-2026-11-15-real.json). A chave ficou só no ambiente do processo; o relatório foi conferido sem chave e sem cabeçalho de autenticação.

**Configuração:**

- **Modelos (decisão 3):** `claude-sonnet-5-5` como operário e escritor; `claude-opus-5-5` como revisor (nenhum procedimento usa revisão ainda). No roteamento, `claude-haiku-5-5` como barato e `claude-sonnet-5-5` como caro.
- **Esforço:** `low` no operário, `medium` no escritor.
- **Câmbio:** R$ 5,40 por dólar. **Débito em frações de centavo** (o arredondamento por chamada saiu).
- **Execuções:** 36 casos × 3 repetições = 108 no gabarito, mais o portão do Haiku (108 execuções com o Haiku no contrato) e o gabarito de roteamento (11 pedidos, duas vezes). Antes, uma rodada pequena de 5 execuções, uma por setor, para estimar o custo.

## Resultado por setor (Sonnet como operário)

| Setor | Execuções | Acerto | Erro crítico | Cartão desnecessário | Falha | Chamadas/execução | Custo/execução | p50 | p90 | Margem contra a pessoa |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Contábil | 33 | 93,9% | **0** | 2 | 0 | 1,36 | R$ 0,0151 | 5,4 s | 7,5 s | 0 pontos (dentro) |
| Fiscal | 30 | 100% | **0** | 0 | 0 | 0,90 | R$ 0,0111 | 4,9 s | 5,0 s | 0 pontos (dentro) |
| DP | 15 | 100% | **0** | 0 | 0 | 1,20 | R$ 0,0166 | 5,3 s | 8,4 s | 0 pontos (dentro) |
| Societário | 15 | 100% | **0** | 0 | 0 | 1,00 | R$ 0,0104 | 4,9 s | 4,9 s | 0 pontos (dentro) |
| Gestão e Atendimento | 15 | 100% | **0** | 0 | 0 | 1,00 | R$ 0,0106 | 4,4 s | 5,0 s | 0 pontos (dentro) |
| **Total** | **108** | **98,1%** | **0** | 2 | 0 | | R$ 1,39 no total | | | |

- **Casos em que o certo é não decidir** (guia com valor diferente da apuração, pedido com dois eventos de folha, cliente pedindo para cancelar o contrato, e os dois ambíguos de competência): pararam no cartão nas 3 repetições. Nenhum chute.
- **ECD:** a conta plantada (adiantamento a sócios) foi apontada nas 3 repetições.
- **Os 2 cartões desnecessários** foram o caso `seguro` da competência (só o vencimento no texto), o mesmo que já escalava no teste de 15/11. Na terceira repetição o escritor acertou.
- **Saídas fora do esquema:** zero em 247 chamadas.
- A margem é a taxa de erro do integrante contra a da pessoa nos mesmos casos (AVALIAÇÃO 11.4). Neste gabarito, a "pessoa" é o próprio gabarito, então a margem só prova o cálculo; ela passa a medir algo quando entrarem os casos reais com o que a pessoa fez.

## Por papel (Sonnet)

| Papel | Chamadas | Custo | p50 | p90 |
| --- | --- | --- | --- | --- |
| operário | 105 | R$ 1,22 | 1,5 s | 2,1 s |
| escritor (escalada) | 15 | R$ 0,18 | 1,8 s | 4,7 s |

O restante do tempo de cada execução (cerca de 3 s) é a fila: cada salto espera a sondagem do pg-boss, de 0,5 s.

## Roteamento em cascata

| | Pedidos | Acerto | Erro crítico | Pergunta desnecessária | Decidido por | Custo total |
| --- | --- | --- | --- | --- | --- | --- |
| Haiku barato → Sonnet caro | 11 | 100% | **0** | 0 | regra 7, Haiku 3, pergunta 1 | R$ 0,0164 |
| Sonnet barato → Sonnet caro (controle) | 11 | 100% | 0 | 0 | regra 7, Sonnet 3, pergunta 1 | R$ 0,0712 |

O pedido vago ("Resolve isso aqui pra mim") subiu do Haiku ao Sonnet e terminou em pergunta à pessoa, como o gabarito pede. Uma decisão do Haiku custou cerca de R$ 0,0007; a do Sonnet, R$ 0,0145.

## Portão do Haiku

O Haiku só é liberado num contrato se, no mesmo gabarito, tiver zero erro crítico e acertar todo caso em que o Sonnet acertou. A escalada não esconde erro (um erro com confiança alta passa nos validadores e conta como erro crítico), mas pesa no custo, por isso as escaladas estão na tabela.

| Contrato | Resultado | Acerto Sonnet | Acerto Haiku | Erro crítico Haiku | Escalaram (Sonnet / Haiku) | Custo/execução (Sonnet / Haiku) |
| --- | --- | --- | --- | --- | --- | --- |
| `ctb.competencia.escolher` | liberado | 28/30 | 30/30 | 0 | 12 / 14 | R$ 0,0145 / R$ 0,0057 |
| `ctb.ecd.apontar_atencao` | liberado | 3/3 | 3/3 | 0 | 0 / 0 | R$ 0,0194 / R$ 0,0010 |
| `fis.guia.identificar` | liberado | 15/15 | 15/15 | 0 | 0 / 0 | R$ 0,0118 / R$ 0,0006 |
| `fis.caixa_postal.classificar` | liberado | 15/15 | 15/15 | 0 | 0 / 0 | R$ 0,0128 / R$ 0,0006 |
| `dp.evento.classificar` | liberado | 15/15 | 15/15 | 0 | 3 / 3 | R$ 0,0164 / R$ 0,0037 |
| `soc.alteracao.classificar` | liberado | 15/15 | 15/15 | 0 | 0 / 0 | R$ 0,0104 / R$ 0,0005 |
| `ges.faq.escolher` | liberado | 15/15 | 15/15 | 0 | 0 / 0 | R$ 0,0106 / R$ 0,0005 |
| `assistente.rotear` (barato) | liberado | 11/11 | 11/11 | 0 | | R$ 0,0145 / R$ 0,0007 por decisão |

**A configuração não foi trocada.** O portão diz que o Haiku igualou o Sonnet *neste* gabarito, que é pequeno (3 a 15 execuções por contrato, de 1 a 10 casos distintos). A decisão 3 pede que ele se prove perfeito no caso; com tão poucos casos, a liberação é um sinal, não uma prova. A troca é da frente de IA, depois do gabarito ampliado (abaixo).

## Custo da rodada

| | Custo |
| --- | --- |
| Rodada pequena (5 execuções) | R$ 0,06 (US$ 0,01) |
| Gabarito com Sonnet (108 execuções) | R$ 1,39 |
| Portão do Haiku (108 execuções, com as escaladas ao Sonnet) | R$ 0,26 |
| Roteamento (22 pedidos) | R$ 0,09 |
| **Total da sessão** | **R$ 1,80 (≈ US$ 0,33)**, contra o teto de US$ 10 |

## O que a frente de IA precisa decidir

1. **Prompts dos contratos novos.** As instruções de `fis.guia.identificar`, `fis.caixa_postal.classificar`, `dp.evento.classificar`, `soc.alteracao.classificar`, `ges.faq.escolher` e `assistente.rotear` são provisórias, versionadas com o contrato. Passam para `pacotes/contratos-ia`.
2. **Trocar para o Haiku os contratos liberados?** O portão liberou os oito, com economia de 2,5 a 25 vezes por execução. Recomendação: ampliar o gabarito para pelo menos 30 casos distintos por contrato, com casos reais anonimizados, e rodar o portão de novo antes de trocar. O roteador barato já é Haiku pela decisão 4.
3. **Quem paga o roteamento.** Hoje é a bolsa `assistente` do escritório, porque antes de rotear não há setor. A alternativa é debitar do setor de destino depois da decisão.
4. **O roteador vê só o pedido** e o tipo do documento anexado, não o conteúdo do documento. Dar um trecho do documento ajuda nos pedidos vagos e custa mais tokens e mais dado de cliente no modelo.
5. **Limiar de 0,9 e o caso `seguro`.** É o único que ainda escala e às vezes vai ao cartão. Ajustar a instrução de `ctb.competencia.escolher` (vencimento sem referência) ou aceitar o cartão.
6. **Política do revisor Opus.** O papel existe e o contrato confere, mas nenhum procedimento usa revisão. Onde entra: envio ao cliente (guia e resposta de FAQ), transmissão, regra legal?
7. **Uso das correções aprendidas.** A correção da pessoa num cartão "não consegui" vira proposta de memória `correcao:*` e, aprovada, fica no setor; os procedimentos ainda não a leem (só o FAQ lê a base `faq`).
8. **Custo da sombra.** A sombra do dia a dia debita da bolsa do setor. Uma bolsa própria do piloto separa o custo de medir do custo de operar.
9. **Gabarito do piloto pré-registrado.** São 36 casos fictícios; o piloto pede de 400 a 700 por estrato, com o que a pessoa fez em cada caso, para a margem de −3 pontos medir de verdade.
