# Triagem como conversa (GES-TRIAR-REPASSAR v3): avaliação real · 15/11/2026

Esta rodada mede a triagem conversando, pedida na decisão do Enzo de 15/11/2026 ("os clientes odeiam menu e falar com robô"), com teto de US$ 10. O gabarito tem 25 conversas de várias trocas, rodadas com 2 repetições, com o Sonnet e com o Haiku conversando. O escritor da escalada é sempre o Sonnet.

- **Roteiro:** `pacotes/integrantes/scripts/avaliar-conversas.ts`.
- **Gabarito:** `pacotes/integrantes/src/avaliacao/gabarito-conversas.ts` (hash `4c7c29aaab64c0f8`).
- **Relatório completo:** [`triagem-conversa-2026-11-15-real.json`](triagem-conversa-2026-11-15-real.json).
- **Chave:** ficou só no ambiente do processo.

**Como roda.** O cliente é simulado por roteiro: a cada fala do escritório, ele manda a próxima linha, que revela o assunto aos poucos. A rodada roda de verdade num escritório de avaliação, e não em sombra, porque a fala do integrante precisa ficar na conversa para a troca seguinte. O relógio da triagem é fixo (segunda-feira, 14h) e os casos de fora do horário mudam esse relógio. Uma conversa termina quando o integrante repassa, chama uma pessoa, vai ao cartão ou responde fora do horário; ou quando o roteiro acaba sem decisão.

## Resultado

| | Acerto | Erro crítico | Perguntas até rotear (média / máx.) | Falas fora do tom | Falas fora do escopo | Escaladas | Custo por conversa | p50 / p90 da conversa |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Sonnet** | **50/50** | 0 | 0,9 / 2 | 0 de 78 | 0 de 78 | 5 | R$ 0,042 | 7,5 s / 21,0 s |
| Haiku | 49/50 | 0 | 1,0 / 2 | 0 de 81 | 0 de 81 | 0 | R$ 0,0026 | 12,9 s / 23,4 s |

- **Portão do Haiku: bloqueado por um caso.** No caso "Quero colocar meu filho como dono de uma parte da empresa.", o Haiku respondeu numa repetição "Me conta um pouco mais sobre como você imagina isso?" em vez de repassar. Como o roteiro tinha uma linha só, a conversa ficou sem decisão. Na outra repetição, ele repassou ao Societário. A margem de 2 pontos está dentro dos 3, mas a regra do portão exige acertar todo caso que o Sonnet acertou.
- **Decisão: a conversa fica no Sonnet,** como propõe o plano (classe que escreve ao cliente). O Haiku custa 16 vezes menos e chegou perto. Vale medir de novo com conversas reais e com roteiros de duas linhas nos casos claros, porque a pergunta a mais do Haiku não é erro de tom nem de escopo, só uma troca a mais.
- **Tom e escopo:** nenhuma fala saiu com menu, lista, jargão de robô, valor, prazo, promessa ou pedido de documento sensível. As 5 escaladas do Sonnet foram correções de estilo pegas pelos validadores antes de sair, a maioria por duas perguntas na mesma mensagem. O escritor consertou todas.
- **A primeira rodada achou o mesmo padrão**, com o código anterior aos ajustes do #41: Sonnet 48/48, Haiku 45/48, com as 3 falhas do Haiku sendo perguntas de esclarecimento em roteiros de uma linha só. Esses roteiros ganharam uma segunda fala.

## Por grupo (Sonnet)

| Grupo | Conversas | Acerto | Perguntas (média) | Custo por conversa |
| --- | --- | --- | --- | --- |
| Assunto vago | 12 | 100% | 1,5 | R$ 0,073 |
| Claro, sem palavra-chave | 8 | 100% | 0 | R$ 0,025 |
| Dois assuntos | 4 | 100% | 1 | R$ 0,052 |
| Muda de assunto | 4 | 100% | 1,5 | R$ 0,064 |
| Irritado | 4 | 100% | 0 | R$ 0,026 |
| Delicado (falecimento, cancelamento) | 4 | 100% | 0 | R$ 0,026 |
| Pede uma pessoa | 2 | 100% | 0 | R$ 0,025 |
| Nunca esclarece | 2 | 100% | 3 | R$ 0,103 |
| Fora do horário | 4 | 100% | 0 | R$ 0 (sem IA) |
| Conversa aberta | 2 | 100% | 0 | R$ 0 (regra) |
| Puxa para fora do escopo | 4 | 100% | 0 | R$ 0,025 |

## Como falou (Sonnet, primeira repetição)

- **Assunto vago (rescisão):**
  - "Boa tarde! Tudo bem por aí? Me conta o que você precisa."
  - "Entendi, obrigado por avisar. Por ser um assunto de desligamento, vou chamar alguém da equipe do DP para falar com você e te ajudar com isso."

  Rescisão é assunto delicado no A.10, por isso foi a uma pessoa na hora, no DP.
- **Dois assuntos:**
  - "Você pediu a guia do DAS e também as férias do Pedro, que são com setores diferentes. Qual dos dois você quer resolver primeiro?"
  - Depois de o cliente escolher: "Certo, vou passar agora para o pessoal do fiscal, que cuida da guia do DAS."
- **Luto:** "Sinto muito pela perda do seu sócio. Vou chamar alguém da nossa equipe para conversar com você com toda a atenção sobre isso."
- **Pergunta sobre valor:** "Pelo que você descreveu, parece ser a guia mensal de imposto, então vou passar para o pessoal do fiscal, que cuida disso." Nenhum valor foi dito.
- **Nunca esclarece:** depois de 3 perguntas, "Vou chamar alguém da equipe para conversar com você com calma por aqui, tá bom?"

## Limites do gabarito

- **O cliente simulado segue o roteiro e não responde à pergunta do integrante.** Isso mede se a conversa chega ao setor, mas não a naturalidade de cada resposta do cliente. A frente de IA deve trocar por conversas reais.
- **O escritório de avaliação não tem carteira nem responsável padrão,** então o aviso com o nome ("vou passar para a Ana, do DP") só foi exercitado nos testes.

## Custo

| | Custo |
| --- | --- |
| Rodadas pequenas (4 e 6 conversas) | R$ 0,70 |
| Primeira rodada completa (24 × 2 × 2 modelos) | R$ 1,96 |
| Rodada final (25 × 2 × 2 modelos) | R$ 2,23 |
| **Total** | **R$ 4,89 (≈ US$ 0,91)**, contra o teto de US$ 10 |
