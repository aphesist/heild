# Hospedagem da API e dos workers

**Versão 0.1 · 15/11/2026 · desenho.** Onde rodam a API, os workers e o cofre, perto do Supabase de São Paulo. Preços em dólar, sem impostos, de páginas oficiais e da AWS Price List API (publicações de 05 a 14/11/2026), acessados em 15/11/2026. **[calc]** marca conta nossa a partir do preço unitário oficial; **[NE]** marca número não encontrado. Para reais, o estudo de precificação usa R$ 7,97 por dólar (com tributos de serviço importado, a confirmar) ou R$ 5,69 (só IOF).

## Resumo

- **Agora: AWS sa-east-1 (São Paulo), ECS Fargate em ARM, atrás de um ALB, com a infraestrutura em AWS CDK (TypeScript).**
  - É a mesma região física do Supabase de São Paulo, a cerca de 1 a 3 ms.
  - Os dados ficam no Brasil.
  - KMS, S3 e uma futura saída para o RDS estão no mesmo lugar.
- **Custo:**
  - piloto: cerca de US$ 200 por mês, com o Supabase;
  - 10 escritórios: cerca de US$ 460;
  - 100 escritórios: cerca de US$ 1,2 mil;
  - 1.000 escritórios: de US$ 8 a 10 mil;
  - o armazenamento de documentos fica à parte (repassado por GB).
- **Railway, Render, Koyeb, DigitalOcean e Hetzner estão fora: nenhum tem região no Brasil.**
  - Vindo dos EUA, cada ida e volta ao banco leva ~114 ms.
  - Uma ferramenta típica faz de 3 a 6 idas e voltas, então leva de 0,4 a 0,7 s só de rede.
- **Plano B para o piloto: Fly.io em `gru`.** Sai cerca de US$ 115 por mês mais barato e é mais simples de operar, mas é mais caro na região (multiplicador de 1,615), tem relato de problema de IPv6 até o Supabase, e a mudança para a AWS viria depois de qualquer jeito.

## 1. Por que a distância até o banco decide

Uma chamada de ferramenta faz de 3 a 6 idas e voltas ao Postgres: fixar o escritório, ler, gravar, travar o elo da cadeia, gravar o evento e confirmar (ver a medição em [`poc/`](poc/README.md)). Juntar tudo numa função SQL por ferramenta resolveria a rede, mas jogaria a regra de negócio para dentro do banco e quebraria a fonte única em TypeScript ([`STACK.md`](STACK.md), seção 2.4).

| Onde a API roda | Ida e volta até o Supabase sa-east-1 | 5 idas e voltas por ferramenta | Fonte |
| --- | --- | --- | --- |
| AWS sa-east-1 (mesma região) | ~1 a 2,5 ms | 5 a 13 ms | Economize: 2,52 ms dentro de sa-east-1 |
| Outro provedor em São Paulo (GCP southamerica-east1, Fly `gru`, Azure Brazil South, Oracle São Paulo, Magalu br-se1) | **[NE]**; mesma região metropolitana, estimamos de 2 a 8 ms | 10 a 40 ms | Nenhuma medição pública. **Medir antes de escolher** (seção 7) |
| EUA Leste (Railway us-east4, Render Virginia e Ohio, Koyeb WAS, Hetzner Ashburn) | 114 a 126 ms | 570 a 630 ms | cloudping.co: sa-east-1 ↔ us-east-1 113,87 ms, ↔ us-east-2 126,12 ms |
| Europa | 178 a 216 ms | 0,9 a 1,1 s | cloudping.co |

Uma tela que dispara três ferramentas ficaria 2 s mais lenta só de rede. Os workers que fazem milhões de jobs por dia, cada um com várias idas ao banco, multiplicariam isso. **Por isso a API e os workers precisam estar em São Paulo.**

## 2. Os provedores

| Provedor | Região no Brasil | 1 vCPU / 2 GB por mês | 2 vCPU / 4 GB por mês | Para um time pequeno | Saída para a AWS |
| --- | --- | --- | --- | --- | --- |
| **AWS Fargate ARM** | Sim (sa-east-1) | US$ 49,60 [calc] | US$ 99,19 [calc] | Médio: ECS + ALB + CDK; sem Kubernetes | Já está |
| AWS Fargate x86 | Sim | US$ 61,90 [calc] | US$ 123,81 [calc] | Idem | Já está |
| AWS EC2 t4g (com Docker) | Sim | US$ 19,56 (t4g.small, 2 vCPU e 2 GB, intermitente) | US$ 39,13 (t4g.medium) | Mais trabalho: SO, atualizações, alta disponibilidade à mão | Já está |
| AWS App Runner | Não; **fechado a clientes novos desde 30/04/2026** (a AWS recomenda o ECS Express Mode) | — | — | — | — |
| **Fly.io `gru`** | Sim (multiplicador de 1,615 sobre Ashburn) | ~US$ 10,80 (shared-cpu-1x, 1 GB) [calc]; US$ 53,31 (performance-1x, 2 GB, preço publicado) | ~US$ 106,59 (performance-2x) [calc] | **Fácil**: `fly deploy`, proxy e TLS incluídos | Média: refazer o deploy; o código não muda |
| Google Cloud Run (southamerica-east1, Tier 2) | Sim | US$ 69,38 por instância [calc]; cobrança por pedido com escala a zero | US$ 138,76 [calc] | Fácil para a API; o worker sempre ligado sai caro | Média |
| Azure Container Apps (Brazil South) | Sim | ~US$ 78,84 em consumo sempre ligado [calc] | ~US$ 157,68 [calc] | Médio; há uma taxa nova de ambiente de US$ 0,10/h desde 01/11/2026 **[?]** | Média |
| Oracle Cloud (São Paulo, Vinhedo) | Sim | **[NE]** (a Oracle diz que o preço é igual em todas as regiões) | [NE] | Médio | Média |
| Magalu Cloud (br-se1, br-ne1) | Sim; **cobra em reais** | **[NE]** (a calculadora não abre sem JavaScript) | [NE] | Desconhecido: ecossistema novo | Média |
| Northflank BYOC | Usa a nossa conta AWS sa-east-1 | AWS + ~US$ 15,2/vCPU [calc] | AWS + ~US$ 30,4 | Fácil (painel sobre EKS) | Já está |
| Vercel (funções em `gru1`) | Sim, só funções | US$ 0,221/h de CPU ativa + US$ 0,0183/GB-h | — | Fácil, mas sem worker longo nem conexão fixa ao banco | — |
| Railway | **Não** (us-west2, us-east4, europe-west4, asia-southeast1). O pedido de região no Brasil foi recusado por "riscos legais e de compliance" (fórum, 24/07/2026) | ~US$ 40 | ~US$ 80 | Fácil | — |
| Render, Koyeb, DigitalOcean, Hetzner | **Não** | — | — | — | — |

Itens de rede e serviços da AWS em sa-east-1:

| Item | Preço |
| --- | --- |
| ALB | US$ 0,034/h (≈ US$ 24,82/mês) + US$ 0,011 por LCU-h |
| NAT Gateway | US$ 0,093/h (≈ US$ 67,89/mês) + US$ 0,093/GB processado |
| IPv4 público | US$ 0,005/h (≈ US$ 3,65/mês) por endereço **[preço global da AWS, conferir]** |
| S3 Standard / Standard-IA | US$ 0,0405 / US$ 0,0221 por GB-mês |
| SQS | US$ 0,40 por milhão (standard) |
| Saída para a internet | US$ 0,25/GB nos primeiros 10 TB **[?]** (us-east-1: US$ 0,16) |

Sobre a saída para a internet: o tráfego da API para o navegador sai a esse preço. Respostas de API são pequenas, e documentos vão por URL pré-assinada do S3, que também paga saída. Isso entra no custo por GB repassado.

## 3. Modelo de carga usado nas contas

Premissas explícitas, para revisar quando houver uso real:

| Premissa | Valor | De onde |
| --- | --- | --- |
| Escritório médio | 15 usuários, 100 clientes | Estudo de precificação (escritório M) |
| Pico | 60% dos usuários ativos × 0,5 pedido/s; integrantes e jobs somam 50% | Hipótese; ≈ 0,45 pedido/s por usuário cadastrado no pico |
| Média do mês | ~15% do pico (10 h por dia útil em 22 dias, mais jobs à noite) | Hipótese |
| Capacidade da API em Node | 1.417 req/s por vCPU medidos no misto; **÷ 3** pela regra real (validação, autorizar, respostas maiores); **× 60%** de ocupação-alvo → **~280 req/s por vCPU no pico** | [`poc/`](poc/README.md) |
| Jobs | ~30 por cliente por dia, de 0,3 a 5 s cada, quase tudo espera de rede; OCR em ~10% dos documentos | [`STACK.md`](STACK.md), seção 4 |
| Banco | ~4 consultas por pedido | Medição (4 a 6 idas e voltas) |
| Egress do Supabase | Resposta média do banco para a API de ~4 KB | Hipótese. O Supabase cobra o egress unificado, banco incluído, acima de 250 GB, a US$ 0,09/GB **[conferir se o tráfego do banco para a nossa API entra]** |

| Escala | Usuários | Clientes | Pico (req/s) | API no pico | Média do mês |
| --- | --- | --- | --- | --- | --- |
| Piloto (2 escritórios, 20 contas, 5 clientes cada) | 20 | 10 | ~9 | 2 tarefas de 0,5 vCPU (alta disponibilidade, não carga) | idem |
| 10 escritórios | 150 | 1.000 | ~70 | 2 × 0,5 vCPU | idem |
| 100 escritórios | 1.500 | 10.000 | ~675 | ~2,5 vCPU | 3 × 1 vCPU |
| 1.000 escritórios | 15.000 | 100.000 | ~6.750 | ~24 vCPU | ~15 vCPU (7,5 × 2 vCPU, com escala automática) |

## 4. Quanto custa na escolha recomendada (AWS sa-east-1 + Supabase sa-east-1)

US$ por mês, **sem o armazenamento de documentos**: S3 Standard-IA a US$ 22,60 por TB-mês, repassado por GB como no estudo de precificação.

| Linha | Piloto | 10 escritórios | 100 escritórios | 1.000 escritórios |
| --- | --- | --- | --- | --- |
| **Supabase** | Pro + Small (25 + 15 − 10 de crédito) = 30 | Pro + Medium = 75 | Pro + XL = 225 | Team + 4XL (599 + 960 − 10) = 1.549 |
| PITR | — (backup diário de 7 dias + `pg_dump` noturno no S3) | 7 dias = 100 | 7 dias = 100 | 28 dias = 400 |
| Réplica de leitura | — | — | — | 4XL = 960, mais disco |
| Disco além de 8 GB | — | 50 GB ≈ 5 | 400 GB ≈ 49 | 2 TB ≈ 255; réplica ≈ 320 |
| Egress do Supabase além de 250 GB [hipótese] | — | — | ~1,1 TB ≈ 77 | ~11 TB ≈ 970 |
| IPv4 dedicado do Supabase **[preço a conferir]** | ~4 | ~4 | ~4 | ~4 |
| **Subtotal Supabase** | **~34** | **~184** | **~455** | **~4.460** (com 8XL: ~6.280) |
| API (Fargate ARM) | 2 × 0,5 vCPU/1 GB = 49,60 | 49,60 | 3 × 1 vCPU/2 GB = 148,80 | ~7,5 × 2 vCPU/4 GB ≈ 744 |
| Workers TypeScript (conectores, despachante, documentos) | 1 × 0,5 vCPU = 24,80 | 2 × 0,5 = 49,60 | 2 × 1 vCPU = 99,20 | 4 × 2 vCPU = 396,80 |
| Worker Python (OCR, PDF) | Mínimo 0, sobe com a fila ≈ 5 | 1 × 1 vCPU = 49,60 | 2 × 1 vCPU = 99,20 | 4 × 2 vCPU = 396,80 |
| Cofre | 1 × 0,25 vCPU/0,5 GB = 12,40 | 12,40 | 2 × 12,40 = 24,80 | 3 × 0,5 vCPU = 74,40 |
| ALB | ~29 | ~30 | ~45 | ~150 |
| IPv4 públicos das tarefas (sub-redes públicas, grupo de segurança fechado, sem NAT) | 4 × 3,65 = 14,60 | 6 × 3,65 ≈ 22 | 9 × 3,65 ≈ 33 | 19 × 3,65 ≈ 69 |
| Transferência regional até o Supabase | — | — | ~15 | ~110 |
| KMS (uma chave por escritório + a da plataforma; [`PERGUNTAS.md`](PERGUNTAS.md), P7) | ~3 | ~11 | ~101 | ~1.100 |
| Logs, métricas, Sentry | ~15 | ~40 | ~150 | ~600 |
| ECR, Secrets Manager, Route 53, WAF, buckets do cofre e da âncora | ~10 | ~15 | ~40 | ~150 |
| **Subtotal AWS** | **~163** | **~279** | **~756** | **~3.790** |
| **Total** | **~US$ 197** | **~US$ 463** | **~US$ 1.211** | **~US$ 8,3 mil a 10,1 mil** |
| Em reais (R$ 7,97 / R$ 5,69) | R$ 1.570 / R$ 1.120 | R$ 3.690 / R$ 2.630 | R$ 9.650 / R$ 6.890 | R$ 66 a 80 mil / R$ 47 a 57 mil |
| Por escritório | — | ~US$ 46 | ~US$ 12 | ~US$ 8 a 10 |

Leituras da tabela:

1. **O piloto custa um pouco mais que a premissa do estudo de precificação** (R$ 1.200 de infraestrutura no degrau 0): R$ 1,1 mil a R$ 1,6 mil, conforme o câmbio. A partir de 100 escritórios, o custo por escritório (~R$ 70 a 100) fica perto da premissa provável do estudo (R$ 25 + R$ 0,60 por cliente, ou R$ 85 no escritório médio).
2. **Com 100 escritórios, o plano Team do Supabase (+US$ 574) só entra se algum contrato pedir SOC 2.** Com ele, o total vai a ~US$ 1,8 mil.
3. **Com 1.000 escritórios, o banco é mais da metade da conta.** O egress do banco (se o Supabase o cobrar como estimado) e a réplica pesam mais que toda a API. É o momento de comparar com Aurora ou RDS Multi-AZ ([`STACK.md`](STACK.md), seção 3.4) e de usar Compute Savings Plans no Fargate **[desconto a conferir]**.
4. **Rust no lugar de Node economizaria cerca de US$ 400 por mês com 1.000 escritórios** (API de ~15 para ~7 vCPU em média). É menos que a linha de KMS e menos de 5% do total.
5. **A KMS por escritório vira 11% da conta AWS com 1.000 escritórios.** A alternativa (chave de dados envelopada) custa quase zero, mas complica a criptografia por escritório no S3 ([`PERGUNTAS.md`](PERGUNTAS.md), P7).

### Comparação no piloto e com 100 escritórios

| | AWS Fargate (recomendado) | Fly.io `gru` | Cloud Run São Paulo |
| --- | --- | --- | --- |
| Piloto, só computação e rede | ~US$ 135 (API, workers, cofre, ALB, IPs) | ~US$ 45 (2 × shared-1x de 1 GB para a API, 1 × shared-1x para o worker, cofre pequeno, Python com parada automática); KMS e S3 na AWS à parte, ~US$ 5 | API por pedido, perto de zero com escala a zero (partida a frio de ~1 s); workers sempre ligados ≈ US$ 70 a 140 |
| 100 escritórios, computação e rede | ~US$ 465 | ~US$ 395 (3 × performance-1x para a API, 4 para os workers) | ~US$ 520 [calc] (7 instâncias de 1 vCPU e cofre pequeno; HTTPS incluído) |
| Latência até o Supabase | Medida publicamente (mesma região) | Não medida; relato de perda de pacotes IPv6 até o Supabase, resolvido com o pooler IPv4 | Não medida |
| KMS e S3 no mesmo provedor | Sim | Não (fica na AWS) | Equivalentes do GCP (Cloud KMS, GCS São Paulo) |

## 5. LGPD

- **A LGPD não obriga a guardar os dados no Brasil.** A transferência internacional segue o art. 33 e o regulamento da ANPD com cláusulas-padrão (Resolução CD/ANPD nº 19/2024) **[confirmar com o jurídico]**. Ter tudo no Brasil simplifica o contrato com o escritório (que é o controlador; a Heild é operadora), poupa a cláusula de transferência e é argumento de venda para contador.
- **O que fica no Brasil nesta escolha:**
  - o banco (Supabase sa-east-1);
  - os documentos (S3 sa-east-1);
  - o cofre e as chaves (KMS sa-east-1);
  - os logs (CloudWatch sa-east-1);
  - a computação.
- **O que pode sair:**
  - metadados técnicos do Sentry, sem dado pessoal (limpeza ligada) ou auto-hospedado;
  - as chamadas aos modelos de IA, que são decisão da frente de IA e precisam de registro de transferência;
  - o Supabase como empresa estrangeira, mesmo com os dados em São Paulo, que exige DPA ([`PERGUNTAS.md`](PERGUNTAS.md), P3).
- **Saída de escritório:** exportação completa, depois destruição da chave do escritório (cofre e S3) e apagamento das linhas, respeitando a guarda mínima (Fundações 5.2) e as cópias de backup, que expiram no prazo do PITR.

## 6. Operação com um time pequeno

| Tema | Como |
| --- | --- |
| Infraestrutura como código | AWS CDK em TypeScript, a mesma linguagem; uma *stack* por ambiente (dev, homologação, produção) |
| Deploy | GitHub Actions com OIDC (sem chave da AWS guardada) → imagem no ECR → `ecs update-service` com *rolling update* e *health check*; migração SQL num passo antes, sempre compatível com a versão anterior do código |
| Ambientes | Local com a Supabase CLI (Postgres e Auth em Docker); prévia por PR com branch do Supabase; homologação num projeto Supabase Pro pequeno; produção |
| Rede | VPC própria, sub-redes públicas, tarefas com IP público e grupo de segurança que só aceita o ALB. Sem NAT até que a política de segurança peça sub-redes privadas (então NAT, ou endpoints de VPC para S3 e KMS, que são grátis no caso do S3) |
| Segredos | Secrets Manager para a string de conexão e chaves de fornecedor; credencial de cliente só no cofre |
| Plantão | Alertas no celular (seção 10 do [`STACK.md`](STACK.md)); runbook de restaurar, girar segredo e pausar conector |
| Esforço inicial | ~1 semana-pessoa para a primeira stack (VPC, ECS, ALB, ECR, CDK, CI); depois, minutos por deploy |

## 7. Antes de assinar: medir a latência de verdade

Os números da seção 1 para provedores fora da AWS são estimativas. Antes de fechar, rodar de cada candidato (um container pequeno, 10 minutos) até o projeto Supabase em São Paulo:

```bash
# 200 conexões TCP e 200 consultas triviais; anote p50 e p99
for i in $(seq 200); do /usr/bin/time -f %e bash -c "</dev/tcp/$HOST/5432" ; done 2>&1 | sort -n | awk '{a[NR]=$1} END{print "p50", a[int(NR/2)], "p99", a[int(NR*0.99)]}'
psql "$URL" -c '\timing on' -c 'select 1' -c 'select 1' -c 'select 1'
```

## 8. Recomendação e caminho de crescimento

| Fase | O que muda |
| --- | --- |
| **Agora (piloto)** | Projeto Supabase novo em sa-east-1, Pro + Small. AWS sa-east-1: ECS Fargate ARM com `api` (2 tarefas), `worker` (1), `worker-py` (mínimo 0), `cofre` (1); ALB; S3 (documentos, cofre, âncora com Object Lock); KMS; CloudWatch; CDK; GitHub Actions |
| **10 escritórios** | PITR de 7 dias; Supabase Medium; `worker-py` sempre ligado; ensaio trimestral de restauração |
| **100 escritórios** | Supabase XL; escala automática da API por CPU e da fila por idade do item mais velho; WAF no ALB; Team se algum contrato pedir SOC 2; eventos de leitura passando a Parquet no S3 |
| **1.000 escritórios** | Réplica de leitura (relatórios, M2, sincronização), SQS nas filas quentes, Savings Plans; **decisão Supabase × Aurora/RDS** com os números reais de egress, IOPS e alta disponibilidade; GPU do reranker na mesma VPC (frente de IA) |

Se o time preferir não lidar com AWS no piloto, o **Fly.io em `gru`** com KMS e S3 na AWS é aceitável por alguns meses. Nesse caso, medir a latência (seção 7) e usar o pooler IPv4 do Supabase. A mudança para a AWS custa cerca de 1 a 2 semanas-pessoa, porque o código e as imagens são os mesmos.
