# Plano de desenvolvimento (6 meses) e lançamento

> **Revisto em 15/11/2026:** a plataforma é construída por 2 pessoas no backend (decisão de 15/11/2026), com piloto em ~4,5 a 5 meses; este cronograma e estes preços ficam como histórico do assistente (D1). Ver o adendo "consolidação dos planos" no fim deste documento.

Rascunho para aprovação, 4/11/2026. Os números vêm de `pesquisa/modelo/modelo_lancamento.py`, e o detalhamento está na pesquisa 08. **[PREMISSA A CONFIRMAR]** marca o que não vem do plano, das pesquisas ou das premissas aprovadas.

## Premissas

- **Equipe:** só o fundador, com agente de programação. A assinatura do agente fica fora do orçamento. Não há salários de terceiros nem fundo de investimento.
- **Quem financia:** os contadores do grupo que aderirem. Eles são os playtesters e financiam os meses 1 a 6 com o investimento deles. Não há preço nem receita em M1–M6.
- **Escopo:** a arquitetura **completa** fica pronta até o M6:
  - cascata de 7 etapas: árvore de temas (RAPTOR), cache semântico, filtro de vigência, BM25 + multivetorial ColBERT com doc2query, PageRank (HippoRAG 2), reranker Rank1 e modelo principal;
  - política de busca Search-R1 treinada por RL;
  - DGM;
  - busca ao vivo via MCP.
- **Base legal:** federal, mais as leis estaduais e municipais de SP, MG, PR, SC e RS. Dos municípios entram as capitais e aqueles onde os escritórios do grupo têm clientes; os demais entram por demanda. Os textos são digitais, então não há OCR relevante. Também entram as fontes trabalhistas e societárias: convenções e acordos coletivos dos sindicatos, Juntas Comerciais e manuais oficiais (seção própria abaixo).
- **Orçamento:** teto de R$ 10 mil, sem a assinatura do agente. Entra só o estritamente necessário, com planos gratuitos onde houver e infraestrutura em degraus. Domínio, CNPJ (aberto pelos contadores do grupo, sem honorário), e-CNPJ e termos/LGPD estão incluídos.
- **GPU no desenvolvimento:** só alugada por hora no RunPod (preços de 4/11/2026): RTX 4090 a US$ 0,89/h, A100 80 GB a US$ 1,19/h e H100 a US$ 1,99/h.
- **Câmbio:**
  - antes do CNPJ: cartão PF com IOF de 3,5%, a **R$ 5,69/US$**;
  - depois do CNPJ (M5): caso base de importação de serviço do 04, a **R$ 7,97/US$**;
  - euro: €/US$ 1,16 **[PREMISSA A CONFIRMAR]**.
- **Lançamento (M7):** arquitetura completa, com estes preços e planos:
  - Grátis: 10 perguntas.
  - Individual: R$ 199, ou R$ 169 no anual; 100 perguntas.
  - Escritório: R$ 790, ou R$ 659 no anual; 5 usuários; 400 perguntas.
  - Corporativo: R$ 2.290, ou R$ 1.890 no anual; 15 usuários; 1.050 perguntas.
  - Enterprise: a partir de R$ 6.900.
  - Pacote extra: 100 perguntas por R$ 149.

## Cronograma: tudo pronto até o M6

| Mês | O que é construído | O que os playtesters usam | Critério de saída |
| --- | --- | --- | --- |
| M1 | Modelo de dados temporal (dispositivo, 3 datas, URN LexML); ingestão federal por programa (Planalto, LexML, INLABS), com Haiku só onde o programa falha; BM25 + filtro de vigência | Enviam perguntas reais com gabarito (benchmark v0, 50 perguntas) | Federal carregado com versões por dispositivo; 50 perguntas validadas |
| M2 | SP e MG; doc2query + indexação ColBERT (GPU por hora); grafo de normas com PageRank (HippoRAG 2); árvore de temas (RAPTOR); modelo principal com citação verificada e abstenção (reranker provisório: Voyage, cota grátis) | Alfa web mínima: federal + SP e MG | 100% das respostas com citação conferida ou abstenção; benchmark v1 com 100 perguntas |
| M3 | PR, SC, RS e municípios; Rank1 destilado (SFT/LoRA na A100) e ColBERT ajustado; servidor dedicado no ar | Uso semanal real, com marcação de erros | 5 UFs carregadas; auditoria de 100 dispositivos com no máximo 2% de erro; Rank1 ≥ reranker por API no benchmark |
| M4 | Política Search-R1, 1ª rodada (GRPO/LoRA 3B na H100); busca ao vivo MCP (DOU/INLABS, Sefaz, Querido Diário); 1º ciclo DGM; cálculos determinísticos (Simples, fator R) | Uso diário; benchmark v2 com 200 perguntas | A política corta buscas sem perder acerto; a DGM vence a versão de partida no conjunto reservado |
| M5 | Cache semântico (respostas validadas pelos playtesters, invalidadas quando a norma muda); política, 2ª rodada; 2º ciclo DGM; CNPJ, e-CNPJ, termos e LGPD; teste de carga da GPU | Beta fechado com todos os escritórios do grupo | Custo por pergunta medido ≤ R$ 0,30; latência aceita pelo grupo |
| M6 | Congelamento e correções; 3º ciclo DGM; cobrança (Asaas), NFS-e, planos e limites de cota | Uso como no lançamento, com as cotas ligadas | **Portão:** as 7 etapas, a política, a DGM e o MCP em produção; acerto ≥ meta do grupo no conjunto reservado |

Ordem de risco: a base temporal e a citação verificada vêm primeiro. Rank1, política e DGM só entram depois que existe benchmark para medi-los. Se um componente não vencer no benchmark, ele entra no lançamento desligado por chave, e o custo dele não muda.

## Fontes trabalhistas e societárias: sindicatos, Juntas e o coletor

**O que entra**

| Fonte | Conteúdo | Onde buscar |
| --- | --- | --- |
| Convenções e acordos coletivos | Pisos, reajustes, adicionais, contribuições, aditivos | Sistema Mediador do MTE, onde ficam as convenções depositadas (CLT, art. 614), com os sites dos sindicatos como complemento. A forma de acesso ao Mediador ainda precisa ser conferida **[A CONFIRMAR]** |
| Registro empresarial federal | Lei 8.934/1994, Decreto 1.800/1996, Instruções Normativas do DREI (manuais de registro) | DREI/gov.br, Planalto |
| Juntas Comerciais (JUCESP, JUCEMG, JUCEPAR, JUCESC, JUCISRS) | Deliberações, portarias, ofícios circulares, enunciados, tabelas de preço | Sites das Juntas e DOEs |
| Manuais oficiais | eSocial (leiautes, notas técnicas), SPED (EFD, ECD, ECF), NF-e, Perguntas e Respostas da RFB, Portaria MTE 671/2021, circulares da Caixa sobre FGTS, resoluções do CFC | Portais oficiais |

**Escopo no lançamento**
- Juntas e manuais oficiais: completos nos 5 estados.
- Convenções: as categorias dos clientes dos escritórios do grupo. As demais entram por demanda.

**Modelo temporal**
- Cada convenção tem vigência, data-base e aditivos, e a resposta usa a que valia na data do fato.
- O mapeamento é atividade do cliente → categoria → sindicato da base territorial → convenção vigente.

**O coletor (programa comum, com a IA só no fim)**
1. **Cadastro das fontes, uma vez:** as páginas de publicação de cada sindicato e Junta. O Haiku sugere e o fundador confirma.
2. **Visitas agendadas:** órgãos e Juntas diariamente, sindicatos 1 a 2 vezes por semana. Pedido HTTP simples, sem login, respeitando o robots.txt e com intervalo entre pedidos.
3. **Detecção de mudança sem IA:** links e PDFs novos, hash, data de alteração, RSS ou sitemap quando houver. Nada mudou, nada mais é feito.
4. **Só o documento novo vai à IA:**
   - extração do texto, ou OCR aberto quando o PDF é digitalizado;
   - o Haiku classifica o tipo, a categoria e a vigência;
   - daí em diante segue a ingestão normal.
   - Documento do site do sindicato que ainda não está no Mediador fica marcado como "publicado, ainda não registrado".
5. **Saúde das fontes:** página que sumiu ou mudou de estrutura vai para o painel como "fonte quebrada". O Haiku tenta reencontrar a página, e se não conseguir o fundador corrige.
6. **Canal dos contadores:** o que só circula em redes sociais ou WhatsApp é enviado pelos playtesters, por e-mail ou upload. O sistema registra quem enviou e de onde veio, e o documento passa pela mesma validação.

**Documentos pagos ou restritos, em ordem:**
1. Versão oficial gratuita: Mediador, DOE, site da Junta ou do órgão.
2. Pedido pela LAI ao órgão público que guarda o documento. O MTE guarda as convenções; o sindicato, como entidade privada, não está sujeito à LAI.
3. Licença ou parceria com o sindicato ou a editora.
4. Responder com o dado e a citação, com link para a fonte, sem republicar o documento.
5. **Humano no circuito, pelo celular (último recurso, para fonte com CAPTCHA):**
   - o coletor esbarra no CAPTCHA e pausa;
   - aviso no painel e no Telegram (ou Discord/WhatsApp) com um link de uso único, que expira em minutos;
   - o link abre a página do site ao vivo no celular: o navegador roda no nosso servidor, e o celular só mostra a tela e repassa os toques;
   - a pessoa resolve ali (um toque no "não sou robô" ou as imagens);
   - o cookie ou token fica no navegador do servidor, e a coleta segue, reaproveitando a sessão para os demais documentos daquela fonte.
   - Quem resolve o CAPTCHA é sempre uma pessoa. Tudo fica registrado no painel (quem, quando, qual fonte), sem precisar voltar ao computador.
   - Custo perto de zero: navegador headless no servidor já previsto e bot do Telegram gratuito.

Certidões e cópias de atos de empresas, vendidas pelas Juntas, não entram na base: não são norma e trazem dados pessoais. Cartilhas e manuais de sindicato e normas ABNT são obras protegidas e só entram com licença.

**Questão para o advogado do grupo:** a Lei 9.610/1998, art. 8º, IV, exclui da proteção autoral os atos oficiais. Falta saber se a convenção coletiva se enquadra, o que define se mostramos o texto ou só o dado com a citação.

**No cronograma**
- M1: DREI e Lei 8.934 entram com o federal.
- M2: Juntas de SP e MG.
- M3: Juntas do Sul, coletor no ar e convenções das categorias do grupo, começando por SP e MG.
- M4: convenções do Sul e canal de envio dos contadores.

## Agentes

**Visão de produto: agêntico por padrão.** O produto é um time de agentes trabalhando para o contador, não só um chat:
- **Vigia da lei:** cruza cada norma nova com a atividade, o regime e a UF de cada cliente e avisa o que mudou para quem.
- **Prazos:** avisa antes de vencer.
- **Rascunhos:** prepara respostas e cálculos para o contador revisar e assinar.
- **Coletores:** buscam as fontes (ver "O coletor").

**Agente próprio.** Um agente de código aberto, hospedado por nós e rodando na nossa GPU (a mesma de "Quando comprar GPU própria"; até lá, no servidor e na GPU alugados já previstos), que podemos adquirir, ajustar e controlar internamente. Não dependemos de agentes de terceiros hospedados por outros (Grok Bot, OpenClaw, Hermes): a pesquisa 03, seção 4, documenta falhas críticas e instâncias expostas, login nas contas do usuário e proteções que "não são uma fronteira rígida".

**Travas (engenharia, não recusa):**
- permissão por ação: cada ferramenta é liberada à parte;
- aprovação humana para ações sensíveis: certificado digital, e-CAC, envio a cliente;
- ambiente isolado: o agente só alcança o que a tarefa precisa, sem segredos repassados;
- registro de tudo no painel; texto vindo da web é tratado como dado, nunca como instrução.

Escopo e prazo de cada agente depois do lançamento: definidos com os playtesters, a partir das tarefas que eles querem delegar **[A CONFIRMAR]**.

## Orçamento do desenvolvimento (R$, sem a assinatura do agente)

| Item | M1 | M2 | M3 | M4 | M5 | M6 | Base | Faixa |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| API: ingestão e enriquecimento (US$ 568: extração, doc2query, RAPTOR, grafo) | 1.132 | 1.132 | 649 | 324 | – | – | 3.238 | 2.266–5.504 |
| API: traces para destilar o Rank1 (US$ 120) | – | – | 683 | – | – | – | 683 | 341–1.366 |
| API: desenvolvimento, testes e regressão | 228 | 228 | 398 | 398 | 558 | 558 | 2.368 | 1.421–3.552 |
| API: 3 ciclos DGM enxutos (US$ 100 cada) | – | – | – | 569 | 797 | 797 | 2.163 | 1.298–4.326 |
| API: perguntas dos playtesters (6.100) | – | – | 47 | 124 | 435 | 652 | 1.257 | 629–2.515 |
| GPU por hora no RunPod (275 GPU-h) | – | 133 | 378 | 523 | 910 | 664 | 2.608 | 1.565–4.174 |
| Servidor dedicado (€ 70/mês; M1–M2 na máquina local) | – | – | 462 | 462 | 647 | 647 | 2.219 | 1.109–3.328 |
| Domínio, CNPJ (R$ 0), e-CNPJ e termos/LGPD | 40 | – | – | – | 700 | – | 740 | 190–1.820 |
| Sindicatos e Juntas: OCR aberto em GPU por hora + Haiku em lote **[PREMISSA A CONFIRMAR]** | – | – | 100 | 150 | 50 | – | 300 | 150–800 |
| Licenças de conteúdo pago (só fontes oficiais no desenvolvimento) | – | – | – | – | – | – | 0 | 0 |
| **Total** | **1.400** | **1.493** | **2.716** | **2.551** | **4.097** | **3.318** | **15.576** | **8.969–27.384** |

**Horas de GPU [PREMISSA A CONFIRMAR]:**

| GPU | Horas | Uso |
| --- | ---: | --- |
| RTX 4090 | 180 | Indexação e reindexação do ColBERT, ajuste fino do ColBERT, testes do Rank1 e da política, beta e avaliações da DGM |
| A100 80 GB | 25 | SFT/LoRA do Rank1-7B |
| H100 | 70 | GRPO/LoRA da política de 3B: 2 rodadas e ajuste |

O total fica dentro da referência de 150 a 300 GPU-h.

**A arquitetura completa estoura o teto em cerca de R$ 5,6 mil na base.** O que pesa:

- ingestão e enriquecimento: 21%;
- GPU: 17%;
- API de testes: 16%;
- servidor: 15%;
- DGM: 14%;
- o câmbio com CNPJ em M5–M6, que encarece em 40% tudo o que é pago no exterior.

Alavancas, na ordem sugerida **[PREMISSA A CONFIRMAR]**:

| Alavanca | Item afetado (base → com alavanca) | Observação |
| --- | --- | --- |
| Pagar M5–M6 ainda no cartão PF e abrir o CNPJ no fim do M6 | Todos os itens pagos no exterior | Decisão do grupo: a forma do aporte dos playtesters muda |
| VPS no Brasil, cobrada em R$; M3 ainda na máquina local | Servidor: 2.219 → 750 | Sem tributo de importação |
| Ciclo DGM com as propostas feitas pelo agente da assinatura e juiz Haiku em lote | DGM: 2.163 → 854 | Limite de uso da assinatura |
| doc2query só nos dispositivos vigentes; RAPTOR no Haiku | Ingestão: 3.238 → 2.266 | Medir no benchmark |
| Traces do Rank1 gerados por modelo aberto no RunPod | Traces: 683 → 273 | Qualidade a validar |
| GPU Spot/comunidade; beta por demanda | GPU: 2.608 → 1.618 | Interrupções |
| Termos revisados pelo advogado do grupo | Termos: 500 → 0 | |
| **Com todas as alavancas** | **R$ 9.296 (faixa de R$ 5.623 a R$ 15.906)** | Cabe no teto na base, mas não no pior caso |

Controle: limite mensal no console da API e alerta de gasto no RunPod. Se o teto apertar, cortar nesta ordem:

1. o 3º ciclo DGM;
2. a 2ª rodada de RL;
3. o doc2query completo.

O que é essencial para o portão do M6 não entra no corte.

## Aporte dos 6 meses: R$ 20.000

O orçamento acima é só o desenvolvimento. O aporte pedido aos playtesters soma a ele as assinaturas dos agentes de programação, o ambiente isolado e uma reserva.

| Destino | Conta | Valor (R$) |
| --- | --- | ---: |
| Claude Ultra (antigo Max 20x) | US$ 200/mês × 6 | 6.828 |
| Cursor Premium, com Grok Bot e agentes | US$ 30/mês × 6 | 1.024 |
| Ambiente isolado (VPS) para agentes abertos (OpenClaw, Hermes) | 6 meses | 360 |
| Desenvolvimento: API, GPU por hora, servidor, domínio, e-CNPJ, termos | com as alavancas (tabela acima) | 9.296 |
| Reserva | cerca de 12% | 2.492 |
| **Total** | | **20.000** |

Premissa: assinaturas pagas no cartão PF, com IOF (R$ 5,69/US$); CNPJ aberto no fim do M6.

Possível folga: o Ultra inclui US$ 200/mês em créditos de API **[A CONFIRMAR]**, o que reduziria a linha de desenvolvimento.

## Depois do lançamento: degraus de infraestrutura

| Degrau | Usuários pagantes | Infra sem GPU (R$/mês) [PREMISSA A CONFIRMAR] | GPU do Rank1 e da política | GPU (R$/mês, com treino) |
| --- | --- | ---: | --- | ---: |
| 0 | até 50 | 1.200 (servidor dedicado único + backup) | RTX 4090 no RunPod por hora, só no expediente (264 h) | 2.111 |
| 1 | até 500 | 2.500 (+ servidor de ingestão, standby do banco) | 1 Hetzner GEX45 24/7 (€ 214 + € 209 de setup; 01) | 2.457 |
| 2 | até 3.000 | 6.000 (réplica de leitura, 2 servidores de app) | 2 GEX45 (1 de reserva) | 4.914 |
| 3 | até 10.000 | 15.000 (alta disponibilidade) | 1 RTX 5090 própria em colocation + 1 GEX45 de reserva | 3.215 |

A carga de GPU usa a premissa do 01: 3,5 s de GPU classe L4 por pergunta fora do cache, 85% das perguntas em 220 horas comerciais e folga de 2× no pico. O resultado operacional por degrau é de R$ 0,8 mil com 50 usuários, R$ 51 mil com 500, R$ 289 mil com 3.000 e R$ 969 mil com 10.000 por mês (pesquisa 08).

## Quando comprar GPU própria

Alugar para sempre não é sustentável. O objetivo é ter GPUs próprias, compradas no degrau em que se pagam rápido.

| | RTX 5090 própria | GEX45 alugada | RunPod 5090 24/7 |
| --- | ---: | ---: | ---: |
| Investimento | R$ 40,8 mil (placa a R$ 27,8 mil, mediana de 3 meses no gpuprix em 4/11/2026, + host de R$ 13 mil **[PREMISSA A CONFIRMAR]**) | € 209 de setup | – |
| Custo mensal em caixa | R$ 1.075 (colocation de R$ 700 **[PREMISSA A CONFIRMAR]** + energia de R$ 375, estimativa) | R$ 1.979 (com os tributos de importação) | R$ 6.924 |
| Custo mensal com depreciação em 36 meses | R$ 2.208 | R$ 1.979 | R$ 6.924 |
| Capacidade (classe L4 = 1) | ≈ 3 **[PREMISSA A CONFIRMAR]** | ≈ 1 | ≈ 3 |

**Quando a compra se paga:**

| Usuários pagantes | Payback da compra | Motivo |
| --- | --- | --- |
| 500 | Não se paga | Um GEX alugado basta |
| 3.000 | 24 meses | A compra substitui 2 GEX e as horas de treino |
| 10.000 | **6 meses** | A compra substitui 4 GEX e o treino por hora; o RL e a DGM rodam na GPU própria à noite |

- **Regra:** comprar quando o payback ficar em 12 meses ou menos. Isso acontece por volta de **3.500 usuários pagantes**, quando a compra substitui 3 ou mais servidores alugados.
- **Antecipar a compra** se a Hetzner subir preços de novo (o 01 registra altas em 2026) ou se o Rank1-14B (32 GB) vencer no benchmark.
- **Manter sempre 1 servidor alugado de reserva.**
- **Onde hospedar:** colocation em datacenter de São Paulo, não em casa.
  - Disponibilidade: energia redundante, link e acesso 24/7.
  - LGPD: controle físico de acesso e registro, com as perguntas dos clientes processadas no Brasil.
  - Entra o custo de colocation no lugar da conta de luz doméstica.
- **Crescimento depois disso:** 1 placa a mais a cada cerca de 3 GEX de carga. Um segundo host só para redundância quando houver 2 ou mais placas próprias.

---

## Adendo: consolidação dos planos (15/11/2026)

Decisões e desenhos mais novos que este documento, achados nos branches do Heild e trazidos para os planos na consolidação de 15/11/2026 (registro em [ATUALIZACOES.md](ATUALIZACOES.md)). Cada item cita a fonte. Onde um item substitui o texto acima, o texto acima fica como histórico e vale o que está aqui; o que ainda depende do Enzo vem marcado com o número da divergência (D1 a D10) daquele registro.

### Backend real e equipe (15/11/2026)

Este plano (4/11/2026) supunha só o fundador com agente de programação, o assistente legal como produto e teto de R$ 10 mil. Depois dele, o produto virou a plataforma do escritório (Desenho do Sistema e subplanos 01 a 11), e em 15/11/2026 o Enzo aceitou o desenho do backend ([`backend/PERGUNTAS.md`](backend/PERGUNTAS.md)):

- **Equipe (P10):** 2 pessoas fixas de TypeScript no backend até o piloto; o orquestrador dos integrantes fica com a frente de IA. **Substitui a premissa "só o fundador"** para a construção da plataforma.
- **Infraestrutura:** AWS sa-east-1 (ECS Fargate) com Supabase em São Paulo desde o piloto, ~US$ 200 por mês (P2). Os degraus de infraestrutura e a GPU alugada deste plano continuam valendo só para a frente de IA (recuperação, reranker, DGM).
- **Prazo do piloto:** ~4,5 meses com 2 pessoas para 2 escritórios e 20 contas (Painel, tarefas, Arquivos, cartões, cofre, captura de DF-e e NFS-e, motor de procedimentos com dois procedimentos de referência); ~5 meses com o Integra Contador ([`apis/PERGUNTAS.md`](apis/PERGUNTAS.md), Q1, pendente); sistema inteiro ~6,5 meses ([`backend/ARQUITETURA.md`](backend/ARQUITETURA.md), 7).
- O cronograma M1 a M6 e os preços por pergunta deste plano ficam como histórico do assistente; o cronograma da plataforma é o do backend, e os preços, os do [Estudo de precificação](Estudo_de_Precificacao_por_Modulo.md). Ver D1 em [`ATUALIZACOES.md`](ATUALIZACOES.md).

### Correções do raciocínio e do Plano Municipal (9/11/2026)

Fontes: [Plano Municipal](Plano_Base_Legislacao_Municipal.md), seções 13 e 25; branch `claude/zealous-wright-fvok37`, `apresentacoes/raciocinio/src/dados.js` (slides 13, 26 e 27).

- **Cascata:** a arquitetura de produção é a de nove etapas do subplano 07 (3.1); árvore de temas (RAPTOR) e política Search-R1 ficam atrás de chave até vencerem no benchmark.
- **Base legal:** estadual nas 27 UFs; municipal pelos municípios fáceis e sob demanda, com nível de cobertura C0 a C4; janela de 10 anos no federal e 5 no estadual e no municipal (substitui "SP, MG, PR, SC e RS" e "capitais e aqueles onde os escritórios do grupo têm clientes").
- **OCR:** "não há OCR relevante" não vale para atos municipais antigos, digitalizados em imagem (a própria Fase de ingestão já previa OCR aberto para PDF digitalizado).
- **Critério do M3:** em vez da auditoria humana de 100 dispositivos, acerto de pelo menos 98% contra o ouro reservado, com a cobertura do ouro publicada (revisão pela IA, decisão de 9/11/2026).
- **DGM:** os "3 ciclos DGM enxutos" passam a ser o laço inspirado na DGM (uma rodada da DGM original custou cerca de US$ 22 mil), em dois laços fora da produção: Consultor e ingestão.

### Respostas do Enzo ao plano de APIs e decisões do mesmo dia (15/11/2026)

Fonte: [apis/PERGUNTAS.md](apis/PERGUNTAS.md) (branch `wf-backend-apis`, commit f9451f8, 15/11/2026), que registra as respostas a Q1 a Q10 e as decisões posteriores do mesmo dia. **Revê** o que o item anterior deste adendo dizia sobre as perguntas "pendentes".

O piloto é **em bloco** (todos os setores dos dois escritórios, tudo ligado menos a Pluggy), com ~80 sp e um calendário de entregas com critério de pronto, cujo prazo depende do caminho crítico externo (contratos, verificações e procurações). Substitui a estimativa de ~4,5 a 5 meses citada acima ([`apis/ORDEM_DE_IMPLEMENTACAO.md`](apis/ORDEM_DE_IMPLEMENTACAO.md), v0.2, 2.1 a 2.3).
