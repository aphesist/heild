# 08 · Modelo financeiro: desenvolvimento (M1–M6) e lançamento (M7+)

Gerado por `pesquisa/modelo/modelo_lancamento.py` em 5/11/2026. 1 pessoa, arquitetura completa no lançamento, sem receita em M1–M6. Preços, mix de planos e aporte do `docs/Plano_MVP_6_meses.md`; GPU do 01; API e tokens do 02; tributos do 04; mercado do 05. **[PREMISSA A CONFIRMAR]** marca o que não vem dessas fontes nem das premissas aprovadas.

## 1. Investimento do desenvolvimento (R$)

Câmbio: R$ 5,69/US$ (cartão PF) em M1–M4; R$ 7,97/US$ a partir do CNPJ (M5). €/US$ 1,16 **[PREMISSA A CONFIRMAR]**.

| Item | M1 | M2 | M3 | M4 | M5 | M6 | Base | Faixa |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| API: ingestão e enriquecimento (extração por programa + Haiku; doc2query, RAPTOR, grafo) | 1.132 | 1.132 | 649 | 324 | – | – | 3.238 | 2.266–5.504 |
| API: traces para destilar o Rank1 (≈ 15 mil exemplos, lote) | – | – | 683 | – | – | – | 683 | 341–1.366 |
| API: desenvolvimento, testes e regressão do benchmark | 228 | 228 | 398 | 398 | 558 | 558 | 2.368 | 1.421–3.552 |
| API: ciclos DGM enxutos (10 variantes, benchmark de 200) | – | – | – | 569 | 797 | 797 | 2.163 | 1.298–4.326 |
| API: perguntas dos playtesters | – | – | 47 | 124 | 435 | 652 | 1.257 | 629–2.515 |
| GPU por hora (RunPod) | – | 133 | 378 | 523 | 910 | 664 | 2.608 | 1.565–4.174 |
| Servidor dedicado (Postgres + índices + app; M1–M2 local) | – | – | 462 | 462 | 647 | 647 | 2.219 | 1.109–3.328 |
| Domínio .com.br | 40 | – | – | – | – | – | 40 | 40–40 |
| e-CNPJ A1 | – | – | – | – | 200 | – | 200 | 150–280 |
| Termos de uso e LGPD (modelo + revisão) | – | – | – | – | 500 | – | 500 | 0–1.500 |
| Sindicatos e Juntas: OCR aberto em GPU por hora + Haiku em lote | – | – | 100 | 150 | 50 | – | 300 | 150–800 |
| **Total** | **1.400** | **1.493** | **2.716** | **2.551** | **4.097** | **3.318** | **15.576** | **8.969–27.384** |

- GPU: 275 GPU-h (180 h de RTX 4090, 25 h de A100, 70 h de H100) + disco de rede **[PREMISSA A CONFIRMAR]**. Playtesters: 6.100 perguntas a US$ 0,0273 (arquitetura completa, sem cache semântico) **[PREMISSA A CONFIRMAR]**.
- **Estouro do teto de R$ 10 mil: R$ 5.576 na base.** Pesam a ingestão/enriquecimento, a GPU, o servidor e o câmbio com CNPJ em M5–M6.
- **Com as alavancas** (CNPJ no fim do M6; VPS no Brasil em R$; doc2query só nos vigentes e RAPTOR no Haiku; traces do Rank1 com modelo aberto; propostas da DGM pelo agente da assinatura; GPU Spot/comunidade; termos revisados pelo advogado do grupo): **R$ 9.296** (faixa R$ 5.623 a R$ 15.906) **[PREMISSA A CONFIRMAR]**.

### Aporte dos 6 meses

O orçamento acima é só o desenvolvimento. O aporte pedido aos playtesters soma a ele as assinaturas dos agentes de programação, o ambiente isolado e uma reserva.

| Destino | Conta | Valor (R$) |
| --- | --- | ---: |
| Claude Ultra (antigo Max 20x) | US$ 200/mês × 6 | 6.828 |
| Cursor Premium, com Grok Bot e agentes | US$ 30/mês × 6 | 1.024 |
| Ambiente isolado (VPS) para agentes abertos (OpenClaw, Hermes) | 6 meses | 360 |
| Desenvolvimento: API, GPU por hora, servidor, domínio, e-CNPJ, termos, sindicatos e Juntas | com as alavancas | 9.296 |
| Reserva | cerca de 12% | 2.492 |
| **Total** | | **20.000** |

Assinaturas no cartão PF, com IOF (R$ 5,69/US$); CNPJ aberto no fim do M6.

## 2. Custo por pergunta da arquitetura completa (produção, com CNPJ)

Etapa 1 (árvore de temas) no Haiku: 8 mil tokens em cache + 800 novos, 600 de saída, +10%. Etapa 2 (cache semântico): no acerto, o Haiku confere a vigência (3 mil novos + 2 mil em cache, 300 de saída); 0% no lançamento, 12% com 500, 20% com 3.000 e 25% com 10.000 usuários. Etapas 3 a 6 (vigência, BM25, ColBERT com doc2query, PageRank, Rank1) e a política Search-R1: CPU/GPU próprias, sem API (custo de GPU na seção 3). Etapa 7: 10 mil tokens de instruções em cache + contexto da classe + 1,5 mil de pergunta; segunda rodada em 25% (+5 mil tokens **[PREMISSA A CONFIRMAR]**); busca ao vivo MCP em 5% (2 buscas a US$ 0,01 + 15 mil tokens); reescrita em 15%; verificação de citações (11,2 mil novos + 4 mil em cache); escalonamento.

| Classe | Peso | Modelo | Contexto / raciocínio | Escala | US$ | R$ |
| --- | ---: | --- | --- | --- | ---: | ---: |
| A. Simples (prazo, alíquota, qual artigo) | 60% | Haiku 5.5 | 10.000 / 2.000 | 3% → Sonnet | 0,0087 | 0,069 |
| B. Padrão (interpretar uma norma) | 30% | Haiku 5.5 | 16.000 / 4.000 | 8% → Sonnet | 0,0158 | 0,126 |
| C. Difícil (várias normas, data passada) | 9% | Sonnet 5.5 | 25.000 / 5.000 | 5% → Opus | 0,1489 | 1,187 |
| D. Crítica (alto risco, fontes divergentes) | 1% | Opus 5.5 | 40.000 / 6.000 | 0% → Opus | 0,3945 | 3,145 |
| **Média no lançamento (cache 0%)** | | | | | **0,0273** | **0,217** |

Roteamento por dificuldade **[PREMISSA A CONFIRMAR]** (medir com os playtesters). Por degrau, com o cache semântico: 50 usuários R$ 0,213; 500 usuários R$ 0,192; 3.000 usuários R$ 0,176; 10.000 usuários R$ 0,165. Plano Grátis (só classe A, sem extras): R$ 0,043 por pergunta. O modelo principal pesa 63% do custo; a classe C, 49%.

## 3. Operação por degrau (R$/mês, sem pró-labore)

Mix de assentos do plano (interpolado; 60/40/0/0 Individual/Escritório/Corporativo/Enterprise com até 100 usuários, 30/35/20/15 com 10.000), 40% no anual, uso de 50% da cota, 1 usuário grátis por pagante usando 6 perguntas. Pacotes extras fora da receita (conservador).

| Usuários pagantes | 50 | 500 | 3.000 | 10.000 |
| --- | ---: | ---: | ---: | ---: |
| Degrau | 0 | 1 | 2 | 3 |
| Perguntas pagas/mês | 2.300 | 21.952 | 126.495 | 412.500 |
| **Receita** | **8.560** | **82.389** | **478.615** | **1.568.320** |
| Tributos (regime) | 1.327 (15,5%, Anexo V) | 15.465 (18,8%, Anexo V) | 119.189 (24,9%, Lucro Presumido 2027) | 405.433 (25,9%, Lucro Presumido 2027) |
| Gateway | 232 | 1.974 | 10.208 | 31.309 |
| API das perguntas (+ Grátis) | 490 (+13) | 4.222 (+130) | 22.278 (+779) | 68.151 (+2.596) |
| API fixa (base + DGM) | 1.881 | 1.881 | 3.475 | 7.102 |
| Infra sem GPU [PREMISSA A CONFIRMAR] | 1.200 | 2.500 | 6.000 | 15.000 |
| GPU (serviço + treino) | 2.111 | 2.457 | 4.914 | 3.215 |
| Seguro, auditoria, suporte, contador [PREMISSA A CONFIRMAR] | 500 | 2.600 | 22.500 | 66.800 |
| **Resultado** | **806** | **51.160** | **289.271** | **968.714** |
| Margem operacional | 9,4% | 62,1% | 60,4% | 61,8% |

GPU: 50: RunPod RTX 4090 por hora, no expediente; 500: 1× Hetzner GEX45 24/7; 3.000: 2× Hetzner GEX45 24/7 (1 de reserva); 10.000: 1× RTX 5090 própria em colocation + 1 GEX45 de reserva. Com 10.000 usuários e GPU só alugada, o resultado seria R$ 962.101 (GPU R$ 9.828). Acima de R$ 4,8 mi/ano sai do Simples; o Presumido de 2027 já inclui CBS/IBS (04).

**Fator R:** sem folha, software cai no Anexo V (15,5% na 1ª faixa); pró-labore ≥ 28% da receita leva ao Anexo III (6%). Compensa quando o pró-labore é retirada que o fundador já faria (o sócio paga 11% de INSS + IRPF).

## 4. Margem por plano (degrau de 500 usuários)

Margem = (preço médio com 40% no anual − Simples efetivo de 18,8% − gateway − API a R$ 0,192/pergunta − infra e GPU rateadas por usuário) / preço.

| Plano | Usuários | Perguntas | Mensal / anual | Preço médio | Margem a 50% | Margem a 100% |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Individual | 1 | 100 | R$ 199 / R$ 169 | R$ 187 | 67,3% | 62,1% |
| Escritório | 5 | 400 | R$ 790 / R$ 659 | R$ 738 | 68,1% | 62,9% |
| Corporativo | 15 | 1.050 | R$ 2.290 / R$ 1.890 | R$ 2.130 | 68,3% | 63,6% |
| Enterprise | 50 | 3.500 | R$ 6.900 / R$ 6.900 | R$ 6.900 | 68,2% | 63,3% |

Pacote extra: R$ 149 por 100 perguntas, margem de 64,8%. Grátis: R$ 0,43 por usuário/mês com a cota cheia (custo de aquisição).

## 5. Breakeven operacional

- **Sem salário:** 44 usuários pagantes (R$ 7.533/mês). O piso é a infra mínima com a arquitetura completa (servidor + GPU por hora + DGM).
- **Com pró-labore de R$ 10.000 [PREMISSA A CONFIRMAR]:** 137 usuários pagantes (R$ 23.283/mês; Simples Anexo III).

## 6. GPU própria × alugada

RTX 5090 (R$ 27,8 mil, gpuprix, 4/11/2026) + host R$ 13.000 **[PREMISSA A CONFIRMAR]** = R$ 40.800. Operação: colocation R$ 700 **[PREMISSA A CONFIRMAR]** + energia R$ 375. Custo mensal com depreciação em 36 meses: R$ 2.208. Aluguel: GEX45 R$ 1.979/mês (GPU de 20–24 GB, ≈ 1/3 da 5090 **[PREMISSA A CONFIRMAR]**); RunPod 5090 24/7 R$ 6.924/mês.

| Usuários | Só alugada | R$/mês | Com própria | R$/mês | Investimento | Payback |
| ---: | --- | ---: | --- | ---: | ---: | ---: |
| 500 | 1× Hetzner GEX45 24/7 + treino por hora | 2.457 | 1× RTX 5090 própria em colocation + 1 GEX45 de reserva | 3.215 | 40.800 | não se paga |
| 3.000 | 2× Hetzner GEX45 24/7 (1 de reserva) + treino por hora | 4.914 | 1× RTX 5090 própria em colocation + 1 GEX45 de reserva | 3.215 | 40.800 | 24,0 meses |
| 10.000 | 4× Hetzner GEX45 24/7 (1 de reserva) + treino por hora | 9.828 | 1× RTX 5090 própria em colocation + 1 GEX45 de reserva | 3.215 | 40.800 | 6,2 meses |

Payback ≤ 12 meses a partir de **≈ 3.500 usuários pagantes** (quando a compra substitui 3 ou mais servidores alugados e as horas de treino).

## 7. Sensibilidade

| Cenário | R$/pergunta (lançamento) | Margem Individual a 50% | Resultado 500 | Resultado 3.000 | Breakeven | Com pró-labore |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Base | R$ 0,217 | 67,3% | R$ 51.160 | R$ 289.271 | 44 | 137 |
| Câmbio +10% | R$ 0,239 | 66,5% | R$ 50.291 | R$ 286.127 | 48 | 141 |
| Câmbio −10% | R$ 0,196 | 68,1% | R$ 52.029 | R$ 292.416 | 41 | 133 |
| Uso ×2 (100% da cota) | R$ 0,217 | 62,1% | R$ 46.938 | R$ 264.853 | 48 | 147 |
| API +30% | R$ 0,283 | 65,7% | R$ 49.290 | R$ 281.311 | 50 | 144 |
| API −30% | R$ 0,152 | 68,8% | R$ 53.030 | R$ 297.231 | 39 | 130 |
| Roteamento conservador (B no Sonnet) | R$ 0,580 | 58,8% | R$ 44.160 | R$ 252.499 | 83 | 154 |

## Premissas a confirmar

- Horas de GPU do desenvolvimento (≈ 275 GPU-h) e perguntas dos playtesters (6.100 no total).
- Ingestão por programa com Haiku só onde o programa falha (US$ 568 com doc2query, RAPTOR e grafo).
- Ciclo DGM enxuto a US$ 100 (10 variantes, benchmark de 200, juiz Haiku).
- Servidor dedicado de dev a €70/mês e câmbio €/US$ 1,16.
- Roteamento 60/30/9/1%, tokens por classe e +5 mil tokens na segunda rodada.
- 3,5 s de GPU classe L4 por pergunta (01) e RTX 5090 = 3× L4.
- Infra sem GPU por degrau (R$ 1,2 mil / 2,5 mil / 6 mil / 15 mil).
- Seguro E&O, auditoria humana amostral e suporte a R$ 6/assento a partir do degrau 2.
- Host da GPU (R$ 13 mil), colocation (R$ 700/mês) e vida útil de 36 meses.
- Pró-labore de referência de R$ 10 mil/mês.
- Efeito de cada alavanca do orçamento.
- OCR e classificação de sindicatos e Juntas (R$ 300; faixa R$ 150–800).
