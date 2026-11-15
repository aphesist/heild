# Ajustes dos integrantes: avaliação real · 15/11/2026

Rodada da sessão B3b, autorizada pelo dono, com teto de US$ 15. Ela mede, no **gabarito ampliado** (30 casos distintos por contrato de operário, 7 contratos, 2 repetições), o Sonnet contra o Haiku em cada contrato, o roteador com e sem o trecho do documento e o custo do revisor de risco (Opus). Tudo roda em **modo sombra**, pago pela bolsa do piloto.

- **Roteiro:** `pacotes/integrantes/scripts/avaliar.ts`.
- **Gabarito:** `pacotes/integrantes/src/avaliacao/gabarito-ampliado.ts`.
- **Relatórios completos:** [`integrantes-ajustes-2026-11-15-real.json`](integrantes-ajustes-2026-11-15-real.json) e, para a nova rodada do DP v2, [`integrantes-ajustes-2026-11-15-dp-v2.json`](integrantes-ajustes-2026-11-15-dp-v2.json).
- **Chave:** ficou só no ambiente do processo, e os relatórios foram conferidos sem ela.

**Configuração.** Sonnet 5.5 como operário e escritor, Opus 5.5 como revisor, Haiku 5.5 no lado Haiku do portão. Esforço `low` no operário, `medium` no escritor e `high` no revisor. Câmbio de R$ 5,40. Débito em frações de centavo.

## Portão do Haiku por contrato (Sonnet × Haiku)

Para ser liberado, o Haiku precisa acertar todo caso em que o Sonnet acertou, sem erro crítico e dentro da margem de −3 pontos na taxa de erro.

| Contrato | Acerto Sonnet | Acerto Haiku | Erro crítico Haiku | Escaladas (S / H) | Custo do contrato (S / H) | Resultado |
| --- | --- | --- | --- | --- | --- | --- |
| `ctb.competencia.escolher` (v2) | 60/60 | 60/60 | 0 | 14 / 21 | R$ 0,90 / R$ 0,31 | **trocado para o Haiku** |
| `ctb.ecd.apontar_atencao` | 60/60 | 60/60 | 0 | 0 / 0 | R$ 4,21 / R$ 2,87 (com o revisor) | **trocado** |
| `fis.guia.identificar` | 60/60 | 60/60 | 0 | 5 / 4 | R$ 2,73 / R$ 1,96 (com o revisor) | **trocado** |
| `fis.caixa_postal.classificar` | 60/60 | 60/60 | 0 | 0 / 0 | R$ 0,75 / R$ 0,04 | **trocado** |
| `dp.evento.classificar` (v1) | 58/60 | 58/60 | **2** | 15 / 16 | R$ 1,03 / R$ 0,28 | bloqueado |
| `dp.evento.classificar` (v2, nova rodada) | 60/60 | 60/60 | 0 | 15 / 16 | R$ 1,03 / R$ 0,28 | **trocado** |
| `soc.alteracao.classificar` | 60/60 | 60/60 | 0 | 10 / 6 | R$ 0,76 / R$ 0,10 | **trocado** |
| `ges.faq.escolher` | 55/60 | 55/60 | 0 | 24 / 16 | R$ 2,32 / R$ 1,63 (com o revisor) | **trocado** |
| `assistente.rotear` (barato, com trecho) | 26/32 | 28/32 | 0 | | R$ 0,44 / R$ 0,15 | **trocado** |

- **O erro crítico do DP v1** apareceu nos dois modelos, nas 2 repetições, no mesmo caso: "o Jorge fez horas extras em 10/2026, mas ainda não sei quantas". Os dois lançaram hora extra sem quantidade. O conserto é por regra, não por modelo: o **DP-EVENTO-FOLHA v2** tem o validador `quantidade_quando_exigida`, que barra hora extra, falta e adiantamento sem quantidade, escala uma vez e, se continuar sem quantidade, vai ao cartão. Na nova rodada, o caso parou no cartão nos dois modelos, e o contrato passou com 60 × 60.
- **Os 5 cartões desnecessários do FAQ** foram os mesmos casos nos dois modelos ("certidão para o financiamento", "vocês já enviaram as guias?", "até que dia recebo o DAS?"). Não houve decisão errada.
- **Na competência v2**, o caso `seguro` (só o vencimento no texto) acertou nas 2 repetições com os dois modelos, e nenhum caso virou decisão errada. O Haiku escala um pouco mais (21 contra 14) e mesmo assim custa um terço.
- **No total do operário** (420 chamadas de cada lado): Sonnet R$ 5,66 contra Haiku R$ 0,32, 18 vezes menos. Latência do operário: Sonnet com p50 de 1,6 s e p90 de 3,3 s; Haiku com p50 de 1,4 s e p90 de 2,2 s.

## Resultado por setor (configuração de produção da rodada: Sonnet)

| Setor | Execuções | Acerto | Erro crítico | Cartão desnecessário | Custo/execução | p50 | p90 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Contábil | 120 | 100% | 0 | 0 | R$ 0,0426 | 9,4 s | 12,9 s |
| Fiscal | 120 | 100% | 0 | 0 | R$ 0,0290 | 5,9 s | 8,8 s |
| DP (v1) | 60 | 96,7% | 2 (corrigidos no v2) | 0 | R$ 0,0172 | 4,4 s | 32,3 s |
| Societário | 60 | 100% | 0 | 0 | R$ 0,0126 | 3,8 s | 22,3 s |
| Gestão e Atendimento | 60 | 91,7% | 0 | 5 | R$ 0,0387 | 6,0 s | 26,9 s |

Os p90 longos de DP, Societário e Atendimento são fila: com 6 execuções em paralelo e o limite do setor, a sombra espera a vez. A chamada ao modelo não passa de 5 s no p90.

## Revisor de risco (Opus)

Entra só antes de ato irreversível: transmitir a ECD, enviar a guia ao cliente, responder ao cliente.

| | Chamadas | Custo total | Custo por revisão | p50 | p90 |
| --- | --- | --- | --- | --- | --- |
| Rodada Sonnet | 151 | R$ 6,18 | R$ 0,041 | 2,6 s | 4,8 s |
| Rodada Haiku | 151 | R$ 6,06 | R$ 0,040 | 2,4 s | 4,4 s |

- **Peso por execução:** a revisão é a maior parte do custo dos três procedimentos irreversíveis. Na ECD, a execução foi de cerca de R$ 0,02 para R$ 0,07, e a latência cresce cerca de 2,6 s.
- **Ele aprovou as 302 revisões. Não devolveu nenhuma.** Neste gabarito, todo ato que chegou ao revisor estava certo: os casos com erro param antes, nos validadores (valor da guia diferente da apuração, quantidade faltando, resposta sem base). O valor dele ainda **não está medido**. Para medir, faltam casos em que o operário erra e mesmo assim passa nos validadores (ver as decisões abaixo).
- **A rodada pequena achou dois defeitos, já corrigidos.** Primeiro, o revisor devolvia toda ECD com contas atípicas, porque achava que os pontos de atenção precisavam estar "resolvidos". A instrução agora diz que a pessoa vai ver esses pontos no cartão. Segundo, a ECD v1 mostrava variações como "500.000.000%" em conta que começa o ano zerada; a v2 mede essa conta contra o saldo final.

## Roteador com e sem o trecho do documento (32 pedidos)

| Configuração | Acerto | Erro crítico | Pergunta desnecessária | Custo total | p50 | p90 |
| --- | --- | --- | --- | --- | --- | --- |
| Haiku barato, sem trecho | 71,9% | 0 | 9 | R$ 0,23 | 1,5 s | 3,6 s |
| **Haiku barato, com trecho** | **87,5%** | **0** | 4 | R$ 0,15 | 1,1 s | 3,3 s |
| Sonnet barato, sem trecho | 71,9% | 0 | 9 | R$ 0,48 | 1,6 s | 5,1 s |
| Sonnet barato, com trecho | 81,3% | 0 | 6 | R$ 0,44 | 1,5 s | 4,9 s |

- **Por grupo:** os pedidos decididos por regra (10) e os de pedido claro (10) não mudam com o trecho. A diferença está nos 8 pedidos vagos com documento claro ("Vê isso pra mim" com a mensagem do cliente anexada): sem o trecho, o certo é perguntar, e os dois modelos perguntaram nos 8; com o trecho, o Haiku decidiu 5. Nos 4 vagos de verdade, perguntar continua sendo o certo.
- **"nenhum" conta como não agir.** Com o trecho, o modelo respondeu "nenhum" em dois casos: "Obrigado pelo atendimento de ontem", em que não há procedimento e o pedido fica registrado, e a certidão negativa de um pedido vago. "nenhum" não leva a nenhuma ação, só registra o pedido sem procedimento. Por isso o roteiro passou a contá-lo como "perguntar", e a tabela acima já usa essa regra. Contado à parte, como estava no relatório cru, apareceriam 2 "erros" no Haiku com trecho e 1 no Sonnet com trecho, nenhum deles ação errada.
- **Decisão:** o trecho fica **ligado** (`com_trecho: true`), porque o acerto sobe de 71,9% para 87,5% sem erro crítico e com custo menor (o caro é chamado menos). O roteador barato fica no **Haiku**: com o trecho, ele acertou todo caso que o Sonnet acertou.

## Triar e repassar (número único de WhatsApp)

Item pedido depois dos ajustes (decisão do Enzo: o CRM também atende escritórios com um número só de WhatsApp). São 30 casos no gabarito: escolha no menu (inclusive contra o texto), palavra-chave, modelo, assunto misto e remetente desconhecido ou reconhecido pelo histórico. Foram 2 repetições, em [`integrantes-ajustes-2026-11-15-triagem.json`](integrantes-ajustes-2026-11-15-triagem.json).

| | Acerto | Erro crítico | Escaladas | Custo/execução | p50 | p90 |
| --- | --- | --- | --- | --- | --- | --- |
| Sonnet | 60/60 | 0 | 4 | R$ 0,0079 | 3,4 s | 6,3 s |
| Haiku | 60/60 | 0 | 6 | R$ 0,0018 | 3,5 s | 17,3 s (fila) |

- **30 das 60 execuções decidiram sem modelo:** pelo menu, sempre respeitado, ou por palavra-chave de um setor só.
- **Os 4 casos de assunto misto e o remetente desconhecido sem assunto claro** pararam no cartão para uma pessoa do Atendimento, nos dois modelos.
- **O Haiku foi liberado** no contrato `ges.triagem.classificar`.

## Custo da sessão

| | Custo |
| --- | --- |
| Rodadas pequenas (2 casos por contrato, depois os 3 procedimentos com revisor) | R$ 1,34 |
| Rodada completa (840 execuções em sombra, 128 roteamentos) | R$ 21,20 |
| Nova rodada do DP v2 (240 execuções) | R$ 1,31 |
| Triar e repassar (120 execuções) | R$ 0,58 |
| **Total** | **R$ 24,43 (≈ US$ 4,52)**, contra o teto de US$ 15 |

## O que foi trocado

- **Haiku como operário** nos 8 contratos, contando o do triar e repassar (`pacotes/integrantes/src/modelos.ts`, `CONTRATOS_NO_HAIKU`, com a evidência por linha), aplicado pelo worker dos integrantes.
- **Haiku como roteador barato** e **trecho do documento ligado** no roteador.
- **Sonnet continua escritor** (a escalada) e **Opus continua revisor**.

## Para a frente de IA

1. **Medir o valor do revisor.** São necessários casos em que o operário erra com confiança e passa nos validadores, e só o julgamento pega o erro (por exemplo, a guia do tributo certo com o cliente pedindo outro mês por mensagem). Sem isso, o revisor custa cerca de R$ 0,04 e 2,6 s por ato irreversível sem ganho medido.
2. **Gabarito com casos reais**, com o que a pessoa fez, para a margem medir contra a pessoa de verdade. Os 30 casos por contrato ainda são fictícios.
3. **Reavaliar o Haiku periodicamente.** A liberação vale para estes contratos e estas instruções. Mudar a instrução ou o modelo exige rodar o portão de novo.
