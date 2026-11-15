# B10 · Escritório que atende escritório: BPO contábil, fiscal e de DP para outras contabilidades

6 de novembro de 2026 · pesquisa de linha de negócio seguindo o [Protocolo de Descoberta](00-protocolo-de-descoberta.md) · contexto: [Plano da Plataforma do Escritório](../../planos/Plano_Plataforma_do_Escritorio.md)

**Escopo:** o escritório que executa departamentos (fiscal, DP, contábil) para outros escritórios de contabilidade. Cobre a separação estrita dos dados de cada escritório contratante (multi-inquilino em dois níveis), a marca do contratante no app do cliente final, o contrato entre escritórios e o SLA, a cadeia de tratamento de dados na LGPD (controlador, operador, suboperador), a responsabilidade técnica perante o CRC, os acessos a portais em nome de terceiros, o preço por departamento e por volume, a fila de trabalho compartilhada, o reporte ao contratante, a auditoria de qualidade, a entrada e a saída de um contratante, e quem já faz isso no Brasil e lá fora.

## Como ler este arquivo

- **23 fichas** (`BPO-001` a `BPO-023`), setor "Escritório para escritório (BPO)". Não é um nicho por CNAE: é um **modo da plataforma** que liga quando o inquilino declara que atende outros escritórios. Por isso as fichas de fundação (separação de dados, permissões, contrato, LGPD, responsabilidade técnica, acessos) ficam na **fase 0**, e o resto segue as fases das fichas genéricas de que depende. Só o catálogo de BPOs parceiros (BPO-023) fica na fase 5.
- **Fases alinhadas ao `atividades.json` em 8/11/2026** (ajuste A15 do subplano 10): as fichas BPO-005, 009, 010, 012, 019 e 020 passam à fase do JSON; **BPO-017** vai para a fase 4 (era 1 aqui e 5 no JSON; entra com o C2, depois do BPO financeiro da fase 3c) e **FIN-201**, que o JSON tinha na fase 5, passa à **fase 3c** (BPO financeiro, depois do Financeiro 3b). Cada ficha traz a fase antiga entre parênteses.
- **Inventário conferido** (`indice.txt`, 466 fichas): só havia o BPO **financeiro** do cliente (FIN-201) e o app com a marca do escritório (GES-204), ambos de um nível só. Nada sobre um escritório atender outro, subinquilino, suboperador, transferência de responsabilidade técnica ou SLA entre escritórios. As fichas genéricas reaproveitadas (cadastro SOC-001, permissões GES-021 e GES-041, cofre SOC-008 e SOC-010, autorizações SOC-011 e FIS-007, contrato SOC-016 e FIN-001, LGPD GES-054 e SOC-020, processos GES-206, calendário FIS-001, timesheet GES-047, erros GES-019, conferência FIS-004) aparecem em `depende_de`, sem duplicar.
- **horas_100:** estimativa para um BPO cuja carteira soma o equivalente a **100 empresas finais**, espalhadas por cerca de 5 a 10 escritórios contratantes. Conta só o trabalho **de coordenação entre escritórios** que estas fichas descrevem (pedidos, fila, SLA, reporte, revisão, conversas, faturamento entre escritórios). A execução das rotinas em si (folha, apuração, conciliação) já está nas fichas DP, FIS e CTB. Nenhuma fonte trouxe tempo medido; todos os valores são `[ESTIMATIVA]`. Soma: cerca de 207 h/mês, ou pouco mais de uma pessoa em tempo integral só para coordenar.
- **Confiança "alta"** só onde li o texto oficial nesta data: Res. CFC 1.590/2020 (PDF do CFC hospedado pelo CRC-MS), LGPD (publicação original no site da Câmara; os arts. 5º, 37, 39, 42, 46 a 48 que uso não mudaram, até onde sei, mas não li a versão compilada), Guia da ANPD sobre agentes de tratamento (gov.br), App Store Review Guidelines (Apple) e documentação do PostgreSQL. A NBC PG 01 foi lida em duas cópias não oficiais que coincidem (Sindcont-SP e Normas Legais), por isso as fichas que dependem só dela ficam em "média".
- **Limite de método:** `normas.receita.fazenda.gov.br`, o DOU (`in.gov.br`) e a página da Resolução CD/ANPD 15/2024 no gov.br não devolveram o texto nesta sessão. A IN RFB 1.751/2017 (procurações) e a Res. CD/ANPD 15/2024 (incidentes) ficaram com leitura só em fontes secundárias e estão marcadas. A página da TaxDome devolveu bloqueio anti-robô.
- **Campos novos:** `autonomia`, `core`, `substitui`, `horas_100`, `depende_de` e `fase` preenchidos em todas as fichas, com os valores da lista fechada.

## Achados que mudam as hipóteses do Plano

1. **O BPO entre escritórios exige multi-inquilino em dois níveis, e isso precisa nascer na fundação.** O inquilino BPO tem subinquilinos (os escritórios contratantes), e cada um tem as suas empresas. Separação, permissões, índice de busca da IA, marca, remetente e base de conhecimento precisam ser por subinquilino (BPO-001, BPO-002, BPO-021). Fazer isso depois exige mexer no modelo de dados inteiro. O PostgreSQL oferece política por linha (row-level security), mas superusuários, papéis com `BYPASSRLS` e, em regra, o dono da tabela passam por cima dela, a menos que se use `FORCE ROW LEVEL SECURITY` [PG-RLS]. A plataforma precisa de testes automáticos de vazamento entre inquilinos.
2. **Na LGPD, o BPO é suboperador.** A empresa cliente é controladora dos dados dos seus empregados e sócios, o escritório contratante é operador e o BPO trabalha "em nome do controlador" por intermédio do operador. A LGPD só define controlador e operador (art. 5º VI e VII), exige registro das operações dos dois (art. 37) e manda o operador seguir as instruções do controlador (art. 39). O operador responde solidariamente quando descumpre essas instruções (art. 42 §1º I) [LGPD]. O guia da ANPD reconhece o suboperador, diz que ele pode responder perante a ANPD como operador e recomenda que o operador obtenha **autorização formal, genérica ou específica, do controlador** para contratá-lo, inclusive no próprio contrato [ANPD-GUIA]. Consequência: a plataforma precisa gerar a cadeia de acordos e a lista de suboperadores (incluindo a própria plataforma e a nuvem) por subinquilino (BPO-004).
3. **A norma do CFC permite o BPO, mas com responsabilidade técnica do contratante e revisão registrada.** NBC PG 01 item 5: o contador pode "(b) transferir o contrato de serviços a seu cargo a outro profissional, com a anuência do cliente, sempre por escrito" e "(c) transferir, parcialmente, a execução dos serviços a seu cargo a outro profissional, mantendo sempre como sua a responsabilidade técnica". Entre as vedações está "assinar documentos ou peças contábeis elaborados por outrem alheio à sua orientação, supervisão ou revisão" [NBC-PG01]. Ou seja, no BPO invisível (transferência parcial) o responsável técnico do contratante precisa **revisar** antes de assinar ou transmitir, e a plataforma deve guardar essa revisão como prova (BPO-005).
4. **A Res. CFC 1.590/2020 não trata da terceirização entre escritórios, mas dá o molde do contrato.** O texto lido exige contrato escrito que "comprove a extensão e os limites da responsabilidade técnica" (art. 1º), lista 13 itens mínimos, inclusive "quais serviços serão executados pelo contratante" (art. 2º c), e regula o distrato: devolução de documentos, comunicação ao novo responsável e obrigações acessórias das competências do contrato a cargo de quem sai (arts. 6º a 10) [CFC-1590]. Não achei norma do CFC específica sobre BPO entre escritórios `[NÃO ENCONTRADO]`; a plataforma aplica o molde por analogia (BPO-003, BPO-019).
5. **A procuração da Receita não passa do contratante para o BPO.** Segundo as fontes encontradas, a IN RFB 1.751/2017 proíbe o substabelecimento da procuração eletrônica (texto oficial não lido nesta sessão) [IN1751-BUSCA]. Assim, ou a empresa cliente outorga também ao BPO, ou o BPO usa o certificado do contratante guardado no cofre com trilha por pessoa, ou o BPO prepara e o contratante transmite. É o maior atrito operacional do modelo, e nenhum produto encontrado o resolve (BPO-006).
6. **O white-label em dois níveis esbarra na regra 4.2.6 da App Store.** A Apple rejeita apps "criados a partir de um modelo comercial ou serviço de geração de apps" se não forem enviados pelo próprio dono do conteúdo, e aceita como alternativa um app único com "seletor" de clientes [APPLE-426]. Isso também corrige a hipótese de GES-204 ("publicação em lote pela conta do fornecedor"): o app com a marca do contratante precisa sair pela conta de desenvolvedor do contratante, ou a plataforma oferece app único com seletor e PWA (BPO-007).
7. **Ninguém no Brasil vende a plataforma do BPO entre escritórios; existem só os prestadores.** Achei prestadores de DP e de operação para escritórios (Cristina Farias Assessoria, "atuação nacional especializada em terceirização operacional para escritórios contábeis", artigo de 30/06/2026; GC Soluções, LS Departamento Pessoal e LP Contabilidade Consultiva em resultados de busca) [JC-TERC][BUSCA-DP]. Nenhum publica SLA, preço ou contrato. Nos gestores de escritório (Acessórias, Gestta, Onvio Processos, HubStrom), não encontrei modo BPO com subinquilinos `[NÃO ENCONTRADO]`.
8. **Lá fora o mercado é maduro, cobra por hora e vende confiança com certificação.** Acculink cobra de US$ 8 a 35 por hora conforme o cargo (texto de 25/09/2026), com teste de 40 horas, sem taxa de entrada, sem fidelidade, início em 5 a 10 dias úteis, e anuncia SOC 2 Type II, ISO 27001 e conformidade com o IRC §7216 [ACCULINK]. Meru anuncia trabalho "totalmente white label sob o nome da sua firma", a partir de US$ 10 por hora [MERU]. Nos EUA, o código de ética da AICPA (ET 1.700.040) exige consentimento ou contrato de confidencialidade antes de passar dados do cliente a prestador terceiro (fontes secundárias divergem entre "consentimento" e "notificação") [JOA-OUT]. As ferramentas de gestão (Karbon, US$ 59 ou 89 por usuário por mês; TaxDome) são de uma firma só, com portal para o cliente, não para outra firma [KARBON][KARBON-BUSCA].
9. **O que diferencia é medir.** O BPO briga com o contratante por atraso e erro sem dados. Fila compartilhada com "quem está com a bola" (BPO-010), SLA com pausas por pendência (BPO-011), auditoria de qualidade por amostra e regra (BPO-013) e faturamento pelo volume executado (BPO-015) saem quase de graça do registro de eventos que a plataforma já terá (GES-047), e nenhum concorrente encontrado oferece isso entre escritórios.

## Fichas
### BPO-001 · Cadastrar cada escritório contratante como um inquilino separado, com as suas empresas clientes, de modo que nenhum dado de um escritório apareça para outro

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Escritório para escritório (BPO) / Fundação multi-inquilino |
| descrição | O BPO atende vários escritórios, e cada um tem a sua carteira. A plataforma precisa de dois níveis de separação: o BPO (inquilino operador) e, dentro dele, cada escritório contratante (subinquilino) com as suas empresas. Hoje a separação é feita por pastas, planilhas e bancos do core separados, e um erro de pasta expõe dados de um escritório a outro. |
| etapas | Entrada, Manutenção |
| frequência | Na entrada de cada escritório contratante; contínua |
| quem_faz | Sócio do BPO / coordenador de operações |
| base_legal | LGPD arts. 46 e 47 (segurança desde a concepção) e art. 39 (operador segue as instruções do controlador); NBC PG 01 item 3 c (sigilo) |
| nível (como a informação entra) | Próprio |
| integração / credencial | Isolamento por linha no banco (row-level security do PostgreSQL ou equivalente), chaves por inquilino, testes automáticos de vazamento entre inquilinos · Nenhuma |
| preço | Sem custo de terceiros |
| autonomia | Agente faz sozinho |
| core | Não depende |
| substitui | Planilha |
| concorrentes | Não encontrei, nas buscas, gestor de escritório brasileiro (Acessórias, Gestta, Onvio Processos) que anuncie modo BPO com subinquilinos [NÃO ENCONTRADO]; lá fora, Karbon e TaxDome são ferramentas de uma firma só, sem modo multi-firma anunciado nas páginas consultadas |
| papel_da_ia | Nenhum na separação em si (regra do banco, não da IA). A IA nunca recebe, no mesmo contexto, dados de dois escritórios contratantes; os índices de busca e a memória da IA ficam separados por subinquilino. |
| ferramentas | `criar_inquilino_contratante(bpo, cnpj_escritorio)`, `vincular_empresa(contratante, cnpj)`, `testar_isolamento(inquilino)` |
| notas (dor · freq · risco · dif) | 4 · 2 · 5 · 5 |
| horas_100 | 3 h/mês `[ESTIMATIVA]` |
| depende_de | SOC-001 |
| fase | 0 Fundação |
| confiança | alta |
| fontes | [LGPD] [PG-RLS] [NBC-PG01] |

### BPO-002 · Dar à equipe do BPO acesso só às empresas e departamentos contratados por cada escritório, dar à equipe do contratante visão do que o BPO fez, e revogar tudo no fim

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Escritório para escritório (BPO) / Fundação multi-inquilino |
| descrição | O analista do BPO deve ver só as empresas do escritório X no departamento contratado (ex.: só DP), e a equipe do escritório X deve ver as tarefas, recibos e pendências da sua carteira. Hoje se compartilham logins do core, pastas de rede e grupos de WhatsApp, sem trilha de quem viu o quê. |
| etapas | Entrada, Manutenção, Desligamento |
| frequência | Por evento (entrada ou saída de analista, de contratante ou de empresa); revisão mensal |
| quem_faz | Coordenador do BPO e sócio do contratante |
| base_legal | LGPD art. 46 (acesso não autorizado); NBC PG 01 item 3 c (sigilo) |
| nível (como a informação entra) | Próprio |
| integração / credencial | Papéis por inquilino e por departamento (fiscal, DP, contábil, societário), convite de usuários do contratante, registro de acesso · Login de cada pessoa, com 2 fatores |
| preço | Sem custo de terceiros |
| autonomia | Agente prepara, pessoa conclui |
| core | Não depende |
| substitui | Planilha, WhatsApp |
| concorrentes | Karbon (US$ 59 ou US$ 89 por usuário/mês) cobra por usuário de uma firma; não achei preço para usuário externo de outra firma [KARBON] |
| papel_da_ia | Revisa acessos todo mês e aponta excessos (analista que saiu do contrato, usuário sem uso há 60 dias); a pessoa confirma a revogação. |
| ferramentas | `conceder_acesso(usuario, contratante, departamento)`, `revisar_acessos(contratante)`, `revogar_acessos(contratante)` |
| notas (dor · freq · risco · dif) | 4 · 3 · 5 · 4 |
| horas_100 | 4 h/mês `[ESTIMATIVA]` |
| depende_de | BPO-001, GES-021, GES-041 |
| fase | 0 Fundação |
| confiança | alta |
| fontes | [LGPD] [NBC-PG01] [KARBON] |

### BPO-003 · Gerar o contrato BPO-escritório com escopo por departamento, SLA, divisão de responsabilidades, sigilo, preço por volume e regras de saída

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Escritório para escritório (BPO) / Contrato entre escritórios |
| descrição | A relação entre escritórios costuma começar por conversa e proposta em PDF. A plataforma gera o contrato com o conteúdo mínimo que o CFC exige do contrato contábil (partes, serviços, o que fica a cargo do contratante, duração, honorários por serviço, reajuste, responsabilidades, aditivos, aviso prévio, foro) e acrescenta o que é próprio do BPO: SLA por tipo de entrega, pausas por pendência, quem fala com o cliente final, quem assina, devolução de dados. |
| etapas | Entrada, Manutenção |
| frequência | Na entrada; aditivos por evento (novo departamento, nova empresa, reajuste) |
| quem_faz | Sócio do BPO com o sócio do contratante |
| base_legal | Res. CFC 1.590/2020 arts. 1º, 2º e 4º a 10 (contrato escrito, conteúdo mínimo, distrato); NBC PG 01 item 5 c (execução parcial transferida, responsabilidade técnica mantida) e item 9 (contrato escrito) |
| nível (como a informação entra) | Próprio |
| integração / credencial | Modelo de contrato com cláusulas variáveis, assinatura eletrônica (mesmo fluxo de SOC-016) e contrato estruturado (mesma base de FIN-001) · Nenhuma |
| preço | Custo da assinatura eletrônica (ver SOC-016) |
| autonomia | Agente prepara, pessoa conclui |
| core | Não depende |
| substitui | Planilha, E-mail |
| concorrentes | Fornecedores brasileiros de terceirização para escritórios (ex.: Cristina Farias Assessoria, DP para escritórios) não publicam modelo de contrato ou SLA [JC-TERC]; Acculink publica regras comerciais (teste de 40 h, sem taxa de entrada, sem fidelidade, início em 5 a 10 dias úteis) [ACCULINK] |
| papel_da_ia | Monta a minuta a partir da proposta aceita e do escopo marcado; aponta cláusula faltante do art. 2º da Res. 1.590 e cláusulas de BPO sem preenchimento; os sócios revisam e assinam. |
| ferramentas | `gerar_contrato_bpo(contratante, escopo, sla, precos)`, `checar_clausulas_minimas(contrato)`, `registrar_aditivo(contrato, mudanca)` |
| notas (dor · freq · risco · dif) | 3 · 2 · 4 · 4 |
| horas_100 | 4 h/mês `[ESTIMATIVA]` |
| depende_de | BPO-001, SOC-016, FIN-001 |
| fase | 0 Fundação |
| confiança | alta |
| fontes | [CFC-1590] [NBC-PG01] [JC-TERC] [ACCULINK] |

### BPO-004 · Formalizar a cadeia de tratamento de dados (cliente final controlador, escritório contratante operador, BPO suboperador, plataforma e nuvem abaixo) e manter o registro das operações

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Escritório para escritório (BPO) / LGPD na cadeia |
| descrição | Nos dados dos empregados e sócios das empresas atendidas, a empresa cliente é a controladora, o escritório contratante é operador e o BPO entra como suboperador. O guia da ANPD recomenda que o operador obtenha autorização formal, genérica ou específica, do controlador para contratar o suboperador, e que o contrato fixe objeto, duração, finalidade, tipos de dados e responsabilidades. A plataforma gera o acordo de tratamento, a lista de suboperadores e o registro das operações (art. 37) por subinquilino. |
| etapas | Entrada, Manutenção, Desligamento |
| frequência | Na entrada; revisão anual; por evento (novo suboperador, nova finalidade) |
| quem_faz | Sócio ou encarregado (DPO) do BPO, com o do contratante |
| base_legal | LGPD art. 5º VI e VII, art. 37 (registro das operações), art. 39 (instruções do controlador), art. 42 §1º I (operador responde solidariamente se descumprir instruções); Guia ANPD de agentes de tratamento v2 (abr/2022), itens 54 a 56 e 63 a 69 |
| nível (como a informação entra) | Próprio |
| integração / credencial | Modelo de acordo de tratamento, lista pública de suboperadores, registro de operações gerado a partir do que a plataforma de fato faz (eventos de GES-047) · Nenhuma |
| preço | Sem custo de terceiros |
| autonomia | Agente prepara, pessoa conclui |
| core | Não depende |
| substitui | E-mail, Planilha |
| concorrentes | Lá fora, o análogo é o consentimento ou contrato exigido pelo código da AICPA (ET 1.700.040) antes de passar dados a prestador terceiro, e o consentimento do IRC §7216 para dados de declaração; Acculink anuncia conformidade com o §7216 [JOA-OUT][ACCULINK] |
| papel_da_ia | Preenche o acordo e o registro das operações a partir do escopo e dos fluxos reais; avisa quando um fluxo novo (ex.: IA externa, novo fornecedor) não está na lista autorizada; o encarregado aprova. |
| ferramentas | `gerar_acordo_tratamento(contratante)`, `listar_suboperadores()`, `gerar_registro_operacoes(contratante, periodo)` |
| notas (dor · freq · risco · dif) | 3 · 2 · 4 · 5 |
| horas_100 | 2 h/mês `[ESTIMATIVA]` |
| depende_de | BPO-003, GES-054, SOC-020 |
| fase | 0 Fundação |
| confiança | alta |
| fontes | [LGPD] [ANPD-GUIA] [JOA-OUT] [ACCULINK] |

### BPO-005 · Registrar, por empresa atendida, quem é o responsável técnico e se a transferência ao BPO é parcial ou total, e guardar a revisão do responsável antes de cada entrega assinada

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Escritório para escritório (BPO) / Responsabilidade técnica |
| descrição | O Código de Ética permite transferir parcialmente a execução a outro profissional, mantendo a responsabilidade técnica, e transferir o contrato inteiro só com anuência escrita do cliente. Também proíbe assinar peças elaboradas por outrem sem orientação, supervisão ou revisão. A plataforma guarda o modo de cada empresa (parcial ou total), a anuência quando há, o registro no CRC das duas organizações e a revisão do responsável técnico do contratante antes de transmissões e demonstrações. |
| etapas | Entrada, Manutenção |
| frequência | Na entrada de cada empresa; a cada entrega que exige assinatura ou transmissão |
| quem_faz | Contador responsável técnico do contratante; coordenador técnico do BPO |
| base_legal | NBC PG 01 item 4 (vedação de assinar peça elaborada por outrem alheio à sua orientação, supervisão ou revisão) e item 5 b e c (transferência total com anuência escrita; parcial com responsabilidade mantida); Res. CFC 1.590/2020 art. 1º parágrafo único (contrato delimita a responsabilidade técnica) |
| nível (como a informação entra) | Próprio |
| integração / credencial | Campo de modo de transferência por empresa, fluxo de revisão com registro de quem revisou o quê e quando; consulta do registro das organizações no CRC (ver GES-057) · Login do contador responsável técnico |
| preço | Sem custo de terceiros |
| autonomia | Agente prepara, pessoa conclui |
| core | Não depende |
| substitui | Planilha, E-mail |
| concorrentes | Acculink e RemoteBooksOnline descrevem revisão em dois níveis antes da entrega à firma [ACCULINK]; no Brasil, não achei ferramenta que registre o modo de transferência [NÃO ENCONTRADO] |
| papel_da_ia | Bloqueia a transmissão ou a liberação de demonstração sem a revisão registrada do responsável técnico do contratante; prepara o resumo do que mudou para a revisão ficar rápida. |
| ferramentas | `definir_modo_transferencia(empresa, parcial/total, anuencia)`, `pedir_revisao_rt(entrega)`, `registrar_revisao(entrega, rt, resultado)` |
| notas (dor · freq · risco · dif) | 4 · 4 · 5 · 5 |
| horas_100 | 6 h/mês `[ESTIMATIVA]` |
| depende_de | BPO-002, BPO-003, GES-057 |
| fase | 1 Captura e obrigações (alinhada ao `atividades.json` em 8/11/2026; antes: 0 Fundação) |
| confiança | média |
| fontes | [NBC-PG01] [CFC-1590] [ACCULINK] |

### BPO-006 · Resolver como o BPO acessa portais em nome das empresas do contratante (procurações próprias, certificado do contratante no cofre com trilha, ou acesso pelo contratante) sem compartilhar senhas

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Escritório para escritório (BPO) / Acessos e credenciais |
| descrição | A procuração eletrônica da Receita não pode ser substabelecida, então o BPO não herda a do contratante. As saídas são: a empresa cliente outorga também ao BPO (com anuência ligada ao modo de BPO-005), o BPO opera com o certificado do contratante guardado no cofre com trilha de uso por pessoa, ou o BPO prepara e o contratante transmite. A plataforma registra, por empresa e por portal, qual saída vale e quem usou cada credencial. |
| etapas | Entrada, Manutenção, Desligamento |
| frequência | Na entrada; por evento (vencimento de procuração ou certificado, troca de analista) |
| quem_faz | Coordenador do BPO, sócio do contratante e sócio da empresa cliente (quando precisa outorgar) |
| base_legal | IN RFB 1.751/2017 (vedação de substabelecimento da procuração eletrônica, lida em fonte secundária); LGPD art. 46 |
| nível (como a informação entra) | D-assistido |
| integração / credencial | Cofre de certificados (SOC-008) com trilha de uso (SOC-010); pedido de autorização de acesso (SOC-011) dirigido ao BPO quando a empresa concorda; procurações de eSocial e FGTS Digital têm regras próprias de substabelecimento (não lidas) · e-CNPJ do contratante ou do BPO; procuração ou autorização de acesso do cliente final |
| preço | Custo do Integra Contador por consulta quando usado (ver FIS-007) |
| autonomia | Agente organiza e lembra |
| core | Não depende |
| substitui | Planilha, WhatsApp |
| concorrentes | Não encontrei produto que trate o acesso em cadeia BPO-contratante-cliente [NÃO ENCONTRADO] |
| papel_da_ia | Mostra, por empresa e portal, qual credencial cobre o BPO, avisa vencimentos e bloqueia uso de certificado por pessoa sem permissão; o pedido de procuração ao cliente final sai pelo contratante, com a marca dele. |
| ferramentas | `mapa_credenciais(contratante)`, `pedir_outorga_ao_bpo(empresa, servicos)`, `registrar_uso_certificado(certificado, usuario, servico)` |
| notas (dor · freq · risco · dif) | 5 · 3 · 5 · 4 |
| horas_100 | 10 h/mês `[ESTIMATIVA]` |
| depende_de | BPO-002, SOC-008, SOC-010, SOC-011, FIS-007 |
| fase | 0 Fundação |
| confiança | média |
| fontes | [IN1751-BUSCA] [LGPD] |

### BPO-007 · Mostrar ao cliente final o app, o portal e os documentos com a marca do escritório contratante, nunca a do BPO

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Escritório para escritório (BPO) / Marca do contratante |
| descrição | No BPO invisível, o cliente final nem sabe que existe o BPO. O app e o portal precisam do tema do contratante (nome, logo, cores, domínio, remetente) num segundo nível de white-label, abaixo do BPO. A regra 4.2.6 da App Store rejeita apps gerados por modelo comercial se não forem enviados pelo próprio dono do conteúdo, e aceita um app único com seletor de escritórios: logo, ou cada contratante publica pela sua conta de desenvolvedor, ou todos usam um app único com seletor, ou PWA. |
| etapas | Entrada, Manutenção |
| frequência | Na entrada de cada contratante; por evento (troca de marca) |
| quem_faz | Coordenador do BPO / marketing do contratante |
| base_legal | App Store Review Guidelines 4.2.6 (apps de modelo comercial) |
| nível (como a informação entra) | Próprio |
| integração / credencial | Tema por subinquilino, domínio próprio do contratante, remetente de e-mail e número de WhatsApp do contratante; app nas lojas pela conta do contratante ou app único com seletor · Conta de desenvolvedor do contratante (se publicar app próprio) |
| preço | Conta Apple Developer e Google Play do contratante [PREÇO NÃO CONSULTADO] |
| autonomia | Agente faz sozinho |
| core | Não depende |
| substitui | Nenhuma |
| concorrentes | TaxDome vende app com a marca da firma, sem diferença de função, publicado nas lojas com o nome da firma (página oficial bloqueada nesta sessão; informação de resultado de busca); Meru Accounting e Acculink trabalham sob a marca da firma contratante [MERU][ACCULINK]; no Brasil, HubStrom AppHub, Nibo MeuApp e Acessórias têm app com a marca do escritório, para um nível só (ver GES-204) |
| papel_da_ia | Nenhum na publicação; ao redigir qualquer texto para o cliente final, usa o nome, o tom e a assinatura do contratante. |
| ferramentas | `configurar_marca(contratante, logo, cores, dominio)`, `pre_visualizar_app(contratante)` |
| notas (dor · freq · risco · dif) | 3 · 1 · 3 · 4 |
| horas_100 | 1 h/mês `[ESTIMATIVA]` |
| depende_de | BPO-001, GES-204 |
| fase | 2 Atendimento e documentos |
| confiança | alta |
| fontes | [APPLE-426] [TAXDOME-BUSCA] [MERU] [ACCULINK] |

### BPO-008 · Escolher, por contratante, quem fala com o cliente final (BPO invisível, BPO com a marca do contratante ou BPO direto) e fazer todas as mensagens e documentos seguirem essa regra

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Escritório para escritório (BPO) / Marca do contratante |
| descrição | Alguns escritórios querem que só a sua equipe fale com o cliente; outros deixam o BPO cobrar documentos ou responder dúvidas de DP em nome deles. A plataforma guarda o modo por contratante e por departamento e faz cobranças de documentos, guias, holerites e respostas saírem pelo canal e com a assinatura certos, com cópia para o contratante quando o BPO fala direto. |
| etapas | Entrada, Manutenção |
| frequência | Diária (cada mensagem) |
| quem_faz | Analistas do BPO; atendimento do contratante |
| base_legal | NBC PG 01 item 3 c (sigilo); contrato BPO-escritório (BPO-003) |
| nível (como a informação entra) | Próprio |
| integração / credencial | Mesmo multiatendimento e portal (GES-023, GES-039), com remetente por subinquilino · Número de WhatsApp e domínio de e-mail do contratante |
| preço | Custo das mensagens (ver GES-023) |
| autonomia | Agente prepara, pessoa conclui |
| core | Não depende |
| substitui | WhatsApp, E-mail |
| concorrentes | Fornecedores white-label anunciam que o trabalho sai com o nome da firma contratante, que fica com o crédito e com a relação com o cliente [MERU][ACCULINK] |
| papel_da_ia | Redige a mensagem no tom do contratante; mensagens de rotina (cobrança de documento, guia) saem sozinhas pelo modo escolhido; mensagens sensíveis passam pelo contratante. |
| ferramentas | `definir_modo_contato(contratante, departamento, modo)`, `enviar_em_nome(contratante, empresa, mensagem)` |
| notas (dor · freq · risco · dif) | 4 · 5 · 4 · 4 |
| horas_100 | 6 h/mês `[ESTIMATIVA]` |
| depende_de | BPO-007, GES-023, GES-039 |
| fase | 2 Atendimento e documentos |
| confiança | média |
| fontes | [NBC-PG01] [MERU] [ACCULINK] |

### BPO-009 · Receber os pedidos do contratante (admissão, rescisão, férias, fechamento, alteração, apuração extra) num formulário por tipo, conferir se estão completos e iniciar a contagem do SLA

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Escritório para escritório (BPO) / Fila de trabalho compartilhada |
| descrição | Hoje os pedidos chegam ao BPO por WhatsApp, e-mail e planilha, incompletos, e ninguém sabe quando o prazo começou. A plataforma recebe o pedido estruturado (vindo do contratante ou do cliente final pelo portal do contratante), confere a completude com o mesmo checklist de DP-001 e GES-040, devolve o que falta e só começa a contar o SLA quando o pedido fica completo. |
| etapas | Manutenção |
| frequência | Diária |
| quem_faz | Analista de entrada do BPO |
| base_legal | Contrato BPO-escritório (BPO-003); prazos legais da própria rotina (ex.: rescisão, ver DP-027) |
| nível (como a informação entra) | Próprio |
| integração / credencial | Formulários por tipo de pedido, leitura de anexos, tarefa na fila (BPO-010) · Nenhuma |
| preço | Sem custo de terceiros |
| autonomia | Agente faz sozinho |
| core | Não depende |
| substitui | WhatsApp, E-mail, Planilha |
| concorrentes | Fornecedores de DP para escritórios (Cristina Farias Assessoria, GC Soluções, LS Departamento Pessoal) não publicam o canal de pedidos [JC-TERC][BUSCA-DP] |
| papel_da_ia | Lê o pedido e os anexos, aponta o que falta, pede ao contratante e marca o pedido como completo; casos ambíguos vão ao analista. |
| ferramentas | `receber_pedido(contratante, tipo, dados)`, `checar_completude(pedido)`, `iniciar_sla(pedido)` |
| notas (dor · freq · risco · dif) | 4 · 5 · 4 · 3 |
| horas_100 | 25 h/mês `[ESTIMATIVA]` |
| depende_de | BPO-001, BPO-002, DP-001, GES-206 |
| fase | 2 Atendimento e documentos (alinhada ao JSON em 8/11/2026; antes: 1) |
| confiança | média |
| fontes | [JC-TERC] [BUSCA-DP] |

### BPO-010 · Manter uma fila única, vista pelos dois escritórios, com as tarefas de cada empresa e competência, quem está com a bola (BPO, contratante ou cliente final) e o prazo interno e legal

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Escritório para escritório (BPO) / Fila de trabalho compartilhada |
| descrição | O calendário de obrigações e os processos de cada empresa viram tarefas na fila do BPO, mas o contratante precisa ver o andamento e o que depende dele. A fila mostra o estado, o responsável do momento, as pendências do cliente final, os bloqueios e as passagens entre os dois escritórios, com histórico e comentários por tarefa. |
| etapas | Manutenção |
| frequência | Diária |
| quem_faz | Coordenador e analistas do BPO; gestor do contratante |
| base_legal | Prazos de cada obrigação (FIS-001) e contrato BPO-escritório (BPO-003) |
| nível (como a informação entra) | Próprio |
| integração / credencial | Calendário de obrigações (FIS-001), processos (GES-206), recibos (FIS-003) · Nenhuma |
| preço | Sem custo de terceiros |
| autonomia | Agente faz sozinho |
| core | Não depende |
| substitui | Acessórias, Gestta/Domínio Processos, Planilha |
| concorrentes | Gestores brasileiros (Acessórias, Gestta, Onvio Processos) fazem a fila de um escritório; não achei visão compartilhada entre dois escritórios [NÃO ENCONTRADO]; Karbon tem portal com o cliente (Karbon for Clients, jul/2025), não com outra firma [KARBON-BUSCA] |
| papel_da_ia | Reordena a fila pelo risco de prazo, avisa quando a bola está parada com o contratante ou com o cliente final e sugere redistribuição entre analistas. |
| ferramentas | `fila_compartilhada(contratante, filtros)`, `passar_bola(tarefa, para)`, `comentar_tarefa(tarefa, texto)` |
| notas (dor · freq · risco · dif) | 5 · 5 · 4 · 4 |
| horas_100 | 30 h/mês `[ESTIMATIVA]` |
| depende_de | BPO-009, FIS-001, FIS-003, GES-206 |
| fase | 2 Atendimento e documentos (alinhada ao JSON em 8/11/2026; antes: 1) |
| confiança | média |
| fontes | [KARBON-BUSCA] |

### BPO-011 · Medir o SLA de cada entrega (recebido completo, entregue, prazo contratado, pausas por pendência do contratante) e fechar o relatório mensal de cumprimento com créditos ou multas

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Escritório para escritório (BPO) / SLA e medição |
| descrição | Sem medição, a discussão de atraso vira palavra contra palavra. A plataforma marca o início (pedido completo ou documentos completos da competência), as pausas (pendência do contratante ou do cliente final), a entrega e a revisão, calcula o percentual no prazo por tipo de entrega e por empresa, e aplica as regras do contrato (crédito, desconto, multa). |
| etapas | Manutenção |
| frequência | Contínua; fechamento mensal |
| quem_faz | Coordenador do BPO; gestor do contratante confere |
| base_legal | Contrato BPO-escritório (BPO-003) |
| nível (como a informação entra) | Próprio |
| integração / credencial | Eventos da fila (BPO-010) e registro de eventos (GES-047) · Nenhuma |
| preço | Sem custo de terceiros |
| autonomia | Agente prepara, pessoa conclui |
| core | Não depende |
| substitui | Planilha |
| concorrentes | Não achei SLA publicado por BPO contábil brasileiro [NÃO ENCONTRADO]; Acculink fala em entrega revisada no prazo e em custo de retrabalho ao comparar fornecedores [ACCULINK] |
| papel_da_ia | Calcula e explica cada desvio (atraso por pendência do cliente final x atraso do BPO); o fechamento com o contratante é revisado por uma pessoa. |
| ferramentas | `medir_sla(contratante, periodo)`, `explicar_desvio(tarefa)`, `fechar_relatorio_sla(contratante, mes)` |
| notas (dor · freq · risco · dif) | 4 · 3 · 3 · 5 |
| horas_100 | 8 h/mês `[ESTIMATIVA]` |
| depende_de | BPO-003, BPO-010, GES-047 |
| fase | 2 Atendimento e documentos |
| confiança | média |
| fontes | [ACCULINK] |

### BPO-012 · Entregar ao escritório contratante um painel e um relatório mensal por empresa: o que foi entregue, recibos, guias, pendências do cliente final, riscos encontrados e erros

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Escritório para escritório (BPO) / Reporte ao contratante |
| descrição | O contratante precisa responder ao seu cliente e prestar contas ao seu responsável técnico. O painel mostra, por empresa e competência, entregas com recibo, guias emitidas, pendências, alertas (multas, divergências, notificações) e erros do BPO com a correção, e o relatório mensal sai com a marca que o contratante escolher. |
| etapas | Manutenção |
| frequência | Contínuo (painel); mensal (relatório) |
| quem_faz | Coordenador do BPO |
| base_legal | Contrato BPO-escritório (BPO-003); LGPD art. 39 (controlador verifica a observância das instruções) |
| nível (como a informação entra) | Próprio |
| integração / credencial | Fila (BPO-010), SLA (BPO-011), recibos (FIS-003), registro de erros (GES-019) · Nenhuma |
| preço | Sem custo de terceiros |
| autonomia | Agente faz sozinho |
| core | Não depende |
| substitui | Planilha, E-mail |
| concorrentes | Não achei relatório padrão publicado por BPO brasileiro [NÃO ENCONTRADO] |
| papel_da_ia | Escreve o resumo do mês por empresa e destaca o que o contratante precisa decidir; sai sozinho quando o contratante aprovar o modelo. |
| ferramentas | `painel_contratante(contratante)`, `gerar_relatorio_mensal(contratante, mes)` |
| notas (dor · freq · risco · dif) | 3 · 3 · 3 · 3 |
| horas_100 | 10 h/mês `[ESTIMATIVA]` |
| depende_de | BPO-010, BPO-011, FIS-003, GES-019 |
| fase | 3 Financeiro e gestão do escritório (alinhada ao JSON em 8/11/2026; antes: 2) |
| confiança | média |
| fontes | [LGPD] |

### BPO-013 · Auditar a qualidade das entregas do BPO: conferência por regra em 100%, amostra revisada por pessoa, nota por analista e por tipo de entrega, causa de cada erro e plano de ação

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Escritório para escritório (BPO) / Auditoria de qualidade |
| descrição | O erro do BPO aparece meses depois (rubrica errada, divergência no FGTS Digital, rescisão mal calculada) e cai no colo do contratante. A plataforma confere toda entrega por regras (cruzamentos de FIS-004, totais da folha contra o eSocial, conciliação), sorteia uma amostra para revisão humana por tipo e analista, registra os erros com causa e custo e mostra a tendência ao contratante. |
| etapas | Manutenção |
| frequência | Contínua; amostragem semanal; fechamento mensal |
| quem_faz | Revisor sênior do BPO; responsável técnico do contratante |
| base_legal | NBC PG 01 item 4 (revisão antes de assinar) e item 5 c; contrato (BPO-003) |
| nível (como a informação entra) | Próprio |
| integração / credencial | Conferências de FIS-004 e DP-038, registro de erros (GES-019), auditoria de atendimento por IA (GES-201) · Nenhuma |
| preço | Sem custo de terceiros |
| autonomia | Agente prepara, pessoa conclui |
| core | Lê do core |
| substitui | Planilha |
| concorrentes | Cristina Farias aponta erros de rubrica, de FGTS Digital e de rescisão como os riscos que aparecem meses depois [JC-TERC]; Acculink descreve revisão em dois níveis [ACCULINK] |
| papel_da_ia | Executa as conferências por regra e escolhe a amostra pelo risco (empresa nova, analista novo, entrega com mudança grande); a pessoa revisa a amostra e classifica o erro. |
| ferramentas | `conferir_entrega(entrega)`, `sortear_amostra(periodo, criterio)`, `registrar_erro(entrega, causa, custo)` |
| notas (dor · freq · risco · dif) | 4 · 4 · 5 · 4 |
| horas_100 | 30 h/mês `[ESTIMATIVA]` |
| depende_de | BPO-010, FIS-004, DP-038, GES-019 |
| fase | 3 Financeiro e gestão do escritório |
| confiança | média |
| fontes | [JC-TERC] [ACCULINK] [NBC-PG01] |

### BPO-014 · Precificar o BPO por departamento e por volume (empresa por regime, holerite, admissão, rescisão, nota escriturada, lançamento) ou por hora e equipe dedicada, e simular a proposta

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Escritório para escritório (BPO) / Preço e faturamento entre escritórios |
| descrição | BPO cobra de formas diferentes: preço por empresa e regime, por evento de DP, por volume de notas ou lançamentos, ou capacidade dedicada (horas ou equipe). A plataforma guarda a tabela do BPO, simula o preço de uma carteira com o volume real medido e mostra a margem esperada pelo tempo medido de empresas parecidas. |
| etapas | Entrada, Manutenção |
| frequência | Na proposta; revisão anual ou por mudança de volume |
| quem_faz | Sócio do BPO |
| base_legal | Res. CFC 1.590/2020 art. 2º e (honorários por serviço) e art. 4º (proposta detalhada) |
| nível (como a informação entra) | Próprio |
| integração / credencial | Volumes medidos (eventos e documentos da plataforma), custo-hora (GES-055), estimativa de esforço (GES-102) · Nenhuma |
| preço | Sem custo de terceiros |
| autonomia | Agente prepara, pessoa conclui |
| core | Não depende |
| substitui | Planilha |
| concorrentes | Lá fora, terceirização para firmas de contabilidade é cobrada por hora (US$ 8 a 35/h na tabela da Acculink, set/2026; Meru a partir de US$ 10/h) ou por equipe dedicada [ACCULINK][MERU]; no Brasil não há tabela pública, e um estudo citado em busca diz que nem CRCs nem sindicatos padronizam honorários [BUSCA-DP] |
| papel_da_ia | Calcula a proposta a partir do volume real do contratante e aponta empresas cujo esforço medido foge do preço; o sócio decide. |
| ferramentas | `simular_preco_bpo(contratante, carteira)`, `comparar_preco_x_esforco(contratante)` |
| notas (dor · freq · risco · dif) | 3 · 2 · 3 · 4 |
| horas_100 | 3 h/mês `[ESTIMATIVA]` |
| depende_de | BPO-003, GES-055, GES-102 |
| fase | 3 Financeiro e gestão do escritório |
| confiança | média |
| fontes | [CFC-1590] [ACCULINK] [MERU] [BUSCA-DP] |

### BPO-015 · Contar no fim do mês o volume realmente executado para cada contratante, gerar a fatura e a NFS-e ao escritório e tratar as contestações

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Escritório para escritório (BPO) / Preço e faturamento entre escritórios |
| descrição | O faturamento por volume exige contar holerites, admissões, rescisões, empresas ativas, notas escrituradas e horas extras de escopo. A plataforma conta pelos eventos da fila e dos documentos, mostra o extrato ao contratante para conferência, gera a cobrança e a NFS-e e registra glosas acordadas. |
| etapas | Manutenção, Desligamento |
| frequência | Mensal |
| quem_faz | Financeiro do BPO |
| base_legal | Contrato BPO-escritório (BPO-003) |
| nível (como a informação entra) | Próprio |
| integração / credencial | Eventos da fila (BPO-010), cobrança (GES-001), NFS-e do escritório (GES-007), excedente de faixa (GES-015) · Nenhuma |
| preço | Custos de boleto, Pix e NFS-e (ver GES-001 e GES-007) |
| autonomia | Agente faz sozinho |
| core | Não depende |
| substitui | Conexa, Planilha |
| concorrentes | Não achei ferramenta brasileira que fature BPO entre escritórios por volume medido [NÃO ENCONTRADO]; Conexa e Conta Azul faturam honorários por contrato, sem contar eventos executados |
| papel_da_ia | Monta o extrato de volume e explica cada linha; a cobrança sai sozinha depois que o contratante não contesta no prazo combinado. |
| ferramentas | `contar_volume(contratante, mes)`, `gerar_fatura_bpo(contratante, mes)`, `registrar_glosa(fatura, item, motivo)` |
| notas (dor · freq · risco · dif) | 4 · 3 · 3 · 4 |
| horas_100 | 6 h/mês `[ESTIMATIVA]` |
| depende_de | BPO-010, BPO-014, GES-001, GES-007, GES-015 |
| fase | 3 Financeiro e gestão do escritório |
| confiança | média |
| fontes | — (desenho da plataforma, sem fonte externa) |

### BPO-016 · Medir a rentabilidade por contratante e por departamento e planejar a capacidade da equipe para os picos do mês

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Escritório para escritório (BPO) / Gestão do BPO |
| descrição | O BPO vive de margem por hora e de picos previsíveis (folha no início do mês, DCTFWeb e EFD-Reinf no meio, Simples no dia 20). A plataforma cruza horas medidas e preço por contratante e departamento e projeta a carga de cada semana pela fila e pelo calendário, apontando quando contratar ou recusar carteira. |
| etapas | Manutenção |
| frequência | Semanal (capacidade); mensal (rentabilidade) |
| quem_faz | Sócio e coordenador do BPO |
| base_legal | Nenhuma específica |
| nível (como a informação entra) | Próprio |
| integração / credencial | Timesheet automático (GES-047), rentabilidade (GES-013), faturamento (BPO-015) · Nenhuma |
| preço | Sem custo de terceiros |
| autonomia | Agente prepara, pessoa conclui |
| core | Não depende |
| substitui | Planilha |
| concorrentes | Contbank diz que um profissional de BPO financeiro atende cerca de 80 clientes (ver B2) [B2-S36]; Acculink apresenta a conta horas x taxa por nível de capacidade (40, 80, 160 h/mês) [ACCULINK] |
| papel_da_ia | Projeta a carga e a margem e sugere ações (redistribuir, reajustar, recusar); o sócio decide. |
| ferramentas | `rentabilidade_contratante(contratante, periodo)`, `projetar_capacidade(semanas)` |
| notas (dor · freq · risco · dif) | 3 · 3 · 3 · 4 |
| horas_100 | 5 h/mês `[ESTIMATIVA]` |
| depende_de | BPO-015, GES-013, GES-047 |
| fase | 3 Financeiro e gestão do escritório |
| confiança | média |
| fontes | [ACCULINK] [B2-S36] |

### BPO-017 · Receber a carteira de um escritório contratante em bloco: empresas, acessos, parâmetros do core, histórico e pendências, com período de trabalho em paralelo

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Escritório para escritório (BPO) / Entrada de um contratante |
| descrição | A entrada de um escritório traz dezenas de empresas de uma vez. A plataforma importa a lista, cria as empresas no subinquilino, pede credenciais (BPO-006), levanta pendências herdadas de cada empresa e organiza um ou dois meses de paralelo em que o contratante ainda executa e o BPO confere, antes de assumir. |
| etapas | Entrada |
| frequência | Por evento (novo contratante) |
| quem_faz | Coordenador de implantação do BPO |
| base_legal | Contrato BPO-escritório (BPO-003) |
| nível (como a informação entra) | Próprio |
| integração / credencial | Entrada em lote (CIC-005), levantamento de pendências (SOC-022), checklist de onboarding (SOC-021) · As de BPO-006 |
| preço | Custo de consultas pagas no levantamento (ver SOC-022) |
| autonomia | Agente prepara, pessoa conclui |
| core | Lê do core |
| substitui | Planilha, E-mail |
| concorrentes | Cristina Farias diz que a implantação feita com a equipe já sobrecarregada ocorre em meio a atrasos e retrabalho, e recomenda planejar antes [JC-TERC]; Acculink anuncia início em 5 a 10 dias úteis [ACCULINK] |
| papel_da_ia | Importa e confere a carteira, monta o plano de entrada por empresa e acompanha o paralelo comparando o que o contratante entregou com o que o BPO faria. |
| ferramentas | `importar_carteira(contratante, arquivo)`, `plano_entrada(contratante)`, `comparar_paralelo(empresa, competencia)` |
| notas (dor · freq · risco · dif) | 4 · 2 · 4 · 3 |
| horas_100 | 12 h/mês `[ESTIMATIVA]` |
| depende_de | BPO-001, BPO-002, BPO-003, BPO-006, CIC-005, SOC-021, SOC-022 |
| fase | 4, com o C2, depois do BPO financeiro da fase 3c (subplano 10, 11.3 e A15, 8/11/2026; antes: 1; o JSON tinha 5) |
| confiança | média |
| fontes | [JC-TERC] [ACCULINK] |

### BPO-018 · Decidir e registrar onde o BPO executa (no core do contratante por acesso remoto ou nuvem, ou no core do próprio BPO com troca de arquivos) e quem lançou o quê

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Escritório para escritório (BPO) / Execução no core |
| descrição | Há dois modelos: o BPO trabalha dentro do Domínio, Alterdata ou Questor do contratante (licença e base do contratante) ou na própria base, devolvendo arquivos e relatórios. A plataforma guarda o modelo por empresa e departamento, controla a troca de arquivos (exportação e importação) e registra, pelo que o core informa, quem fez cada lançamento ou cálculo. |
| etapas | Entrada, Manutenção, Desligamento |
| frequência | Na entrada; diária na execução |
| quem_faz | Coordenador do BPO e TI do contratante |
| base_legal | Contrato BPO-escritório (BPO-003); licença do core |
| nível (como a informação entra) | F |
| integração / credencial | Arquivos de exportação e importação do core; captura do que foi feito no core (GES-048), quando houver · Usuário do core do contratante para o analista do BPO |
| preço | Licenças de usuário no core [PREÇO NÃO PÚBLICO] |
| autonomia | Agente prepara, pessoa conclui |
| core | Lê e escreve no core |
| substitui | Nenhuma |
| concorrentes | LP Contabilidade Consultiva diz executar o DP em sistema próprio na nuvem ou no sistema do cliente (resultado de busca) [BUSCA-DP] |
| papel_da_ia | Confere se o que voltou do core bate com o que foi pedido e se a base do contratante recebeu os arquivos; não lança no core sozinha. |
| ferramentas | `definir_local_execucao(empresa, departamento, modelo)`, `enviar_arquivo_core(empresa, arquivo)`, `conferir_retorno_core(empresa, competencia)` |
| notas (dor · freq · risco · dif) | 4 · 4 · 4 · 3 |
| horas_100 | 15 h/mês `[ESTIMATIVA]` |
| depende_de | BPO-002, BPO-006 |
| fase | 1 Captura e obrigações |
| confiança | baixa |
| fontes | [BUSCA-DP] |

### BPO-019 · Encerrar a relação com um contratante, ou tirar uma empresa da carteira: concluir as competências do contrato, devolver dados e arquivos, apagar o que não precisa ser guardado e revogar acessos

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Escritório para escritório (BPO) / Saída de um contratante |
| descrição | No fim, o BPO precisa entregar o que fez, terminar as obrigações das competências cobertas, devolver os dados ao contratante (que responde ao controlador), apagar cópias, revogar procurações e acessos e emitir a última fatura. A plataforma gera o pacote de saída por empresa com manifesto, o termo de encerramento e a prova da exclusão. |
| etapas | Desligamento |
| frequência | Por evento |
| quem_faz | Coordenador do BPO e sócio do contratante |
| base_legal | Res. CFC 1.590/2020 arts. 6º a 10 (distrato, devolução de documentos, obrigações das competências do contrato), aplicados por analogia à relação entre escritórios; LGPD art. 39 (instruções do controlador) e art. 47 (segurança após o término) |
| nível (como a informação entra) | Próprio |
| integração / credencial | Dossiê de saída (CIC-003), offboarding (SOC-024), descarte (SOC-108), revogação (BPO-002, BPO-006) · As de BPO-006 (para revogar) |
| preço | Sem custo de terceiros |
| autonomia | Agente prepara, pessoa conclui |
| core | Lê do core |
| substitui | E-mail, Planilha |
| concorrentes | Acculink anuncia ausência de fidelidade e inclui o apoio de saída no custo total a comparar [ACCULINK] |
| papel_da_ia | Monta o pacote e a lista do que falta concluir; avisa obrigações de competência do contrato com vencimento posterior; a pessoa assina o termo. |
| ferramentas | `pacote_saida(contratante/empresa)`, `listar_obrigacoes_remanescentes(empresa)`, `comprovar_exclusao(contratante)` |
| notas (dor · freq · risco · dif) | 3 · 1 · 4 · 3 |
| horas_100 | 3 h/mês `[ESTIMATIVA]` |
| depende_de | BPO-002, BPO-004, BPO-006, CIC-003, SOC-024, SOC-108 |
| fase | 2 Atendimento e documentos (alinhada ao JSON em 8/11/2026; antes: 1) |
| confiança | média |
| fontes | [CFC-1590] [LGPD] [ACCULINK] |

### BPO-020 · Dar ao contratante prova de segurança: trilha de auditoria por subinquilino, aviso imediato de incidente para ele cumprir o prazo da ANPD e relatório periódico de controles

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Escritório para escritório (BPO) / Segurança e evidência |
| descrição | O contratante só responde ao cliente final e à ANPD se souber logo do incidente. A regra da ANPD dá ao controlador 3 dias úteis contados do conhecimento (lida em fontes secundárias); o BPO, no meio da cadeia, precisa avisar em horas. A plataforma mantém trilha imutável por subinquilino, avisa o contratante no mesmo dia, com o que foi atingido, e gera relatório de controles (acessos, revisões, incidentes). Lá fora, fornecedores mostram SOC 2 Type II e ISO 27001 como prova. |
| etapas | Manutenção |
| frequência | Contínua; relatório trimestral ou anual |
| quem_faz | Encarregado (DPO) do BPO |
| base_legal | LGPD arts. 46 a 48; Res. CD/ANPD 15/2024 (comunicação de incidente; prazo lido em fontes secundárias) |
| nível (como a informação entra) | Próprio |
| integração / credencial | Registro de eventos (GES-047), registro de incidentes (GES-059), acordo de tratamento (BPO-004) · Nenhuma |
| preço | Auditoria SOC 2 ou ISO 27001, se buscada [PREÇO NÃO CONSULTADO] |
| autonomia | Agente prepara, pessoa conclui |
| core | Não depende |
| substitui | Nenhuma |
| concorrentes | Acculink anuncia SOC 2 Type II e ISO 27001; Vance & Cole fala em instalação 'compliant', o que não é o mesmo que relatório SOC 2 Type II [ACCULINK][BUSCA-OFF] |
| papel_da_ia | Detecta padrões de acesso anormais por subinquilino e rascunha o aviso de incidente com dados atingidos e empresas afetadas; o encarregado envia. |
| ferramentas | `trilha_auditoria(contratante, periodo)`, `avisar_incidente(contratante, incidente)`, `relatorio_controles(contratante, periodo)` |
| notas (dor · freq · risco · dif) | 3 · 2 · 5 · 4 |
| horas_100 | 3 h/mês `[ESTIMATIVA]` |
| depende_de | BPO-004, GES-047, GES-059 |
| fase | 2 Atendimento e documentos (alinhada ao JSON em 8/11/2026; antes: 1) |
| confiança | média |
| fontes | [LGPD] [ANPD15-BUSCA] [ACCULINK] [BUSCA-OFF] |

### BPO-021 · Guardar o jeito de cada escritório contratante (plano de contas, rubricas, prazos internos, formato de entrega, quem aprova) e as particularidades de cada empresa, para o analista e a IA seguirem

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Escritório para escritório (BPO) / Conhecimento por contratante |
| descrição | Cada contratante tem padrões próprios, e o analista do BPO atende vários. Sem registro, o padrão de um escritório vaza para outro e o retrabalho cresce. A plataforma mantém a base de procedimentos por subinquilino e por empresa, ligada às tarefas da fila. |
| etapas | Entrada, Manutenção |
| frequência | Na entrada; atualização por evento |
| quem_faz | Coordenador do BPO; gestor do contratante valida |
| base_legal | Nenhuma específica |
| nível (como a informação entra) | Próprio |
| integração / credencial | Base de conhecimento (GES-020) separada por subinquilino · Nenhuma |
| preço | Sem custo de terceiros |
| autonomia | Agente faz sozinho |
| core | Não depende |
| substitui | Planilha |
| concorrentes | Meru diz alinhar-se aos processos, prazos e padrões de qualidade de cada firma [MERU] |
| papel_da_ia | Mostra ao analista, na tarefa, o procedimento do contratante certo e responde dúvidas só com a base daquele subinquilino. |
| ferramentas | `procedimento(contratante, tipo_tarefa)`, `registrar_particularidade(empresa, texto)` |
| notas (dor · freq · risco · dif) | 3 · 4 · 3 · 3 |
| horas_100 | 5 h/mês `[ESTIMATIVA]` |
| depende_de | BPO-001, GES-020 |
| fase | 2 Atendimento e documentos |
| confiança | média |
| fontes | [MERU] |

### BPO-022 · Conversar com o contratante dentro da tarefa (dúvida técnica, aprovação, "pode transmitir") em vez de WhatsApp, com escalonamento e prova do que foi combinado

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Escritório para escritório (BPO) / Canal entre escritórios |
| descrição | Hoje a troca BPO-contratante acontece em grupos de WhatsApp por escritório, misturando empresas e sem prova ligada à entrega. A plataforma põe a conversa na tarefa e na empresa certas, com prazo de resposta, escalonamento ao sócio e registro das aprovações como prova. |
| etapas | Manutenção |
| frequência | Diária |
| quem_faz | Analistas do BPO e equipe do contratante |
| base_legal | Contrato BPO-escritório (BPO-003) |
| nível (como a informação entra) | Próprio |
| integração / credencial | Fila (BPO-010), registro de aceite (GES-036) · Nenhuma |
| preço | Sem custo de terceiros |
| autonomia | Agente faz sozinho |
| core | Não depende |
| substitui | WhatsApp, E-mail |
| concorrentes | Não achei canal entre firmas em ferramenta brasileira [NÃO ENCONTRADO] |
| papel_da_ia | Resume a conversa, liga a aprovação à entrega e cobra a resposta do contratante quando o SLA está pausado por ele. |
| ferramentas | `perguntar_contratante(tarefa, texto)`, `registrar_aprovacao(tarefa, quem, texto)` |
| notas (dor · freq · risco · dif) | 4 · 5 · 3 · 3 |
| horas_100 | 15 h/mês `[ESTIMATIVA]` |
| depende_de | BPO-010, GES-036 |
| fase | 2 Atendimento e documentos |
| confiança | média |
| fontes | — (desenho da plataforma, sem fonte externa) |

### BPO-023 · Deixar o escritório que usa a plataforma encontrar e contratar um BPO parceiro para um departamento, vendo SLA e qualidade medidos

| Campo | Conteúdo |
| --- | --- |
| setor / subárea | Escritório para escritório (BPO) / Rede de parceiros |
| descrição | Com SLA e qualidade medidos na própria plataforma, um escritório sobrecarregado pode contratar um BPO para DP ou fiscal sem migrar dados. É expansão: catálogo de BPOs com indicadores medidos, contrato padrão (BPO-003) e ativação do acesso por departamento. |
| etapas | Entrada |
| frequência | Eventual |
| quem_faz | Sócio do escritório que contrata |
| base_legal | NBC PG 01 item 5 c; Res. CFC 1.590/2020 |
| nível (como a informação entra) | Próprio |
| integração / credencial | Indicadores de BPO-011 e BPO-013, contrato BPO-003, permissões BPO-002 · Nenhuma |
| preço | Sem custo de terceiros |
| autonomia | Agente organiza e lembra |
| core | Não depende |
| substitui | Nenhuma |
| concorrentes | Conta Azul mantém diretório de parceiros contadores e de BPO financeiro (Encontre contador), sem indicadores medidos de SLA [CA-DIR] |
| papel_da_ia | Sugere BPOs pelo departamento, porte e indicadores; a contratação é decisão humana. |
| ferramentas | `buscar_bpo(departamento, regiao)`, `contratar_bpo(escritorio, bpo, escopo)` |
| notas (dor · freq · risco · dif) | 2 · 1 · 2 · 5 |
| horas_100 | 1 h/mês `[ESTIMATIVA]` |
| depende_de | BPO-002, BPO-003, BPO-011, BPO-013 |
| fase | 5 Nichos e expansão |
| confiança | baixa |
| fontes | [CA-DIR] [NBC-PG01] |

## Lacunas e próximos passos

- Ler no original, quando os domínios responderem: IN RFB 1.751/2017 consolidada (vedação de substabelecimento e eventuais alterações), Res. CD/ANPD 15/2024 (prazo de 3 dias úteis e papel do operador na comunicação), Res. CD/ANPD 2/2022 (prazos em dobro para agentes de pequeno porte, que alcança muitos escritórios) e a versão compilada da LGPD no Planalto.
- Verificar no CFC se existe norma ou parecer específico sobre terceirização entre organizações contábeis (registro do BPO como organização contábil, Res. CFC 1.555/2018 e seguintes, e se o CRC exige contrato também entre escritórios). Não li nesta rodada.
- Procurações do eSocial e do FGTS Digital: o manual do FGTS Digital trata de substabelecimento com regras próprias (achado só em resultado de busca); ler para saber se o BPO pode receber substabelecimento ali, ao contrário do e-CAC.
- Confirmar com os gestores brasileiros (Acessórias, Gestta, Onvio Processos, HubStrom) se têm perfil de "parceiro terceirizado" ou multiescritório; a busca não achou.
- Levantar com BPOs reais: SLA típico por entrega (ex.: folha em X dias úteis após o fechamento do ponto), modelo de preço praticado no Brasil (por empresa, por holerite, por hora) e tempo real de coordenação, para substituir os `[ESTIMATIVA]`.
- Decidir o modelo do app em dois níveis (conta do contratante, app único com seletor ou só PWA) e revisar a ficha GES-204 à luz da regra 4.2.6 da Apple. Não li a regra equivalente do Google Play.

## Fontes (todas consultadas em 06/11/2026)

| Código | Fonte | Observação |
| --- | --- | --- |
| [CFC-1590] | Res. CFC 1.590/2020, PDF do CFC hospedado pelo CRC-MS: https://crcms.org.br/wp-content/uploads/2020/05/Res.-CFC-1590_Contratos_Definitivo-18-03.pdf | Oficial, lido inteiro (arts. 1º a 14) |
| [NBC-PG01] | NBC PG 01 (Código de Ética), 07/02/2019, cópia do Sindcont-SP: https://www.sindcontsp.org.br/wp-content/uploads/2021/04/NBCPG01.pdf ; cópia em Normas Legais: https://www.normaslegais.com.br/legislacao/nbc-1-2019.htm | Cópias não oficiais, lidas, coincidentes (itens 3 c, 4 c, 5 b e c, 9) |
| [LGPD] | Lei 13.709/2018, publicação original, Câmara dos Deputados: https://www2.camara.leg.br/legin/fed/lei/2018/lei-13709-14-agosto-2018-787077-publicacaooriginal-156212-pl.html | Oficial, lido (arts. 5º VI e VII, 37 a 39, 42, 46 a 48); não li a versão compilada |
| [ANPD-GUIA] | ANPD, Guia orientativo para definições dos agentes de tratamento e do encarregado, v2 (abr/2022): https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/Segunda_Versao_do_Guia_de_Agentes_de_Tratamento_retificada.pdf | Oficial, lido (itens 54 a 56 e 63 a 69, seção 5 "Suboperador") |
| [APPLE-426] | Apple, App Store Review Guidelines, item 4.2.6: https://developer.apple.com/app-store/review/guidelines/ | Oficial, lido |
| [PG-RLS] | PostgreSQL, Row Security Policies: https://www.postgresql.org/docs/current/ddl-rowsecurity.html | Documentação oficial, lida |
| [IN1751-BUSCA] | IN RFB 1.751/2017 em resultado de busca (Legisweb e Contadores.cnt.br): https://www.legisweb.com.br/legislacao/?id=351021 | Secundária; a página devolveu erro de acesso; texto oficial não lido |
| [ANPD15-BUSCA] | Res. CD/ANPD 15/2024 em resultados de busca (Mattos Filho, Lefosse): https://www.mattosfilho.com.br/unico/regulamento-incidente-seguranca/ ; https://lefosse.com/noticias/alerta/client-alert-anpd-aprova-regulamento-de-comunicacao-de-incidente-de-seguranca/ | Secundária; página oficial não devolveu o texto |
| [JC-TERC] | Jornal Contábil, "O que ninguém fala sobre terceirização operacional na contabilidade", por Cristina Farias, 30/06/2026: https://jornalcontabil.com.br/noticia/o-que-ninguem-fala-sobre-terceirizacao-operacional-na-contabilidade/ | Artigo de prestadora, lido |
| [JC-WL] | Jornal Contábil, "Quando o White Label se torna uma solução estratégica para empresas contábeis", 13/06/2024: https://jornalcontabil.com.br/noticia/quando-o-white-label-se-torna-uma-solucao-estrategica-para-empresas-contabeis/ | Artigo genérico, lido (definição de white label) |
| [BUSCA-DP] | Resultados de busca sobre terceirização de DP para escritórios (GC Soluções, LS Departamento Pessoal em https://contaazul.com/encontre-contador/contadores/ls-departamento-pessoal/ , LP Contabilidade Consultiva em https://www.ohub.com.br/empresa/lp-contabilidade-consultiva-ltda-porto-alegre-rs-512756 ) | Só resultado de busca; páginas não lidas; confiança baixa |
| [CA-DIR] | Conta Azul, Encontre contadores e BPO financeiro: https://contaazul.com/encontre-contador/ | Só resultado de busca |
| [ACCULINK] | Acculink CPA, "How Much Does It Cost to Outsource Accounting? 2026 pricing breakdown for CPA firms", 25/09/2026: https://acculinkcpa.com/blog/how-much-does-it-cost-to-outsource-accounting-a-2026-pricing-breakdown-for-cpa-firms | Página do fornecedor, lida (US$ 8 a 35/h, teste de 40 h); SOC 2, ISO 27001, §7216 e prazo de início vêm do resumo da busca sobre o perfil do fornecedor |
| [MERU] | Meru Accounting, White Label Services for CPA Firms: https://www.meruaccounting.com/what-we-do/white-label-services-for-cpa-firms | Página do fornecedor, lida (a partir de US$ 10/h; "fully white labeled under your firm's name") |
| [BUSCA-OFF] | Resultados de busca sobre terceirização offshore (Vance & Cole, QX, RemoteBooksOnline): https://vance-cole.pages.dev/guides/accounting-outsourcing-cost | Só resultado de busca |
| [JOA-OUT] | Journal of Accountancy, "Outsourcing and professional liability", set/2024: https://www.journalofaccountancy.com/issues/2024/sep/outsourcing-and-professional-liability.html | Secundária (resumo da busca); fontes divergem entre consentimento e notificação |
| [KARBON] | Karbon, Pricing: https://karbonhq.com/pricing | Oficial, lido (Team US$ 59 e Business US$ 89 por usuário/mês, anual) |
| [KARBON-BUSCA] | Karbon, lançamento do portal do cliente (jul/2025): https://karbonhq.com/resources/karbon-client-portal-eliminates-bottlenecks/ | Só resultado de busca |
| [TAXDOME-BUSCA] | TaxDome, White-labeled app: https://taxdome.com/ja-jp/white-labeled-app | Página bloqueada por anti-robô; informação do resultado de busca |
| [B2-S36] | Contbank BPO Suite, citado em [B2-concorrentes-gestao.md](B2-concorrentes-gestao.md): https://contbank.com | Fonte de outra pesquisa deste projeto |
