# D3 · Descoberta: Notas fiscais e documentos fiscais

5 de novembro de 2026 · Etapa 1 do [Protocolo de Descoberta](00-protocolo-de-descoberta.md) · agente D3

Escopo: tudo o que o escritório faz **em volta** do core (Domínio, Alterdata, Contmatic) com documentos fiscais eletrônicos: NF-e (55), NFC-e (65), CT-e e CT-e OS (57/67), NFS-e (padrão nacional e municipais), MDF-e (58), NF-e de produtor rural; captura de XML de entrada e de saída, manifestação do destinatário, eventos (cancelamento, CC-e, desacordo, encerramento), conferência de completude e tributária (NCM, CST/CSOSN, CFOP, ST, monofásico, DIFAL/antecipação, ISS e retenções, IBS/CBS), envio ao core e guarda. A escrituração e a apuração dentro do core ficam fora (regra 3.7). A emissão de notas pelo escritório entra só como atividade de demanda (NFE-039).

## Como ler este arquivo

- **40 fichas** (NFE-001 a NFE-040), agrupadas em seis subáreas (A a F). Campos da seção 2.1 do protocolo.
- **Fontes:** citadas por código (`[S4]`, `[C3]`) e listadas com link na seção "Fontes" ao final. Todas consultadas em **05/11/2026**.
- **Limitação de método:** nesta sessão a leitura direta de páginas (curl e WebFetch) não alcançou os sites (código 000 em nfe.fazenda.gov.br, gov.br/nfse, sieg.com, qive.com.br, contabeis.com.br). As fontes foram lidas pelos **resumos e trechos do buscador** (WebSearch). Por isso a confiança nos prazos é **média**, e a Etapa 2 deve abrir as notas técnicas originais (NT 2014.002, NT 2020.001, NT 2015.002, NT 2025.002, NT 004/005/007 da NFS-e, manual das APIs do ADN) antes de qualquer prazo ou limite virar regra.
- **`tempo_estimado`:** nenhuma fonte pública trouxe medição de tempo por atividade. Todos os tempos são `[ESTIMATIVA]` do agente e devem ser substituídos pelo levantamento com os contadores (Apêndice do Plano).
- **Motores de IA:** M1 legal, M2 escritório, M3 cálculo, M4 ação. Níveis: **ler**, **rascunhar**, **executar** (executar sempre com cartão de aprovação; nunca automático quando o caminho for C-crc ou quando o evento for irreversível, como manifestação conclusiva).
- **Nomes de ferramentas agênticas** são propostas de interface da plataforma, não serviços existentes.
- `transversal: Dx` marca atividade que se repete em outra aba e deve virar ferramenta única na Etapa 3.

## Achados que mudam as hipóteses do Plano (seções 3.1 e 4.3)

1. **Prazo da manifestação conclusiva caiu de 180 para 90 dias** contados da autorização (Ajuste SINIEF 14/26, refletido na NT 2020.001 v1.60, abril/2026) [S3]. O Plano não tem prazo; a plataforma precisa de contador regressivo por nota.
2. **A distribuição de DF-e tem janela curta e regra de uso indevido.** Documentos ficam disponíveis por cerca de 90 dias (3 meses) após a recepção no Ambiente Nacional; mais de 20 consultas por hora no mesmo NSU/chave gera rejeição 656 e bloqueio de 1 h; após "137 – nenhum documento" é preciso esperar 1 h [S1][S2]. Há relato (fórum, ago/2025) de que CNPJ sem uso por mais de 60 dias tem a geração de NSU interrompida sem retroação `[NÃO VERIFICADO em fonte oficial]` [S1]. Consequência: a captura tem que começar **no dia do onboarding** e rodar sem falhas; buraco de captura vira nota perdida.
3. **O ADN da NFS-e tem API de distribuição para contribuintes** (`GET /DFe/{NSU}`, `GET /NFSe/{chave}/Eventos`, manual v1.0 de 12/02/2026), com certificado do mesmo CNPJ raiz do contribuinte e limite de requisições (HTTP 429) [S4]. O caminho exato da URL diverge entre fontes. Isso reforça a hipótese A do Plano, mas **com certificado do cliente**, não do escritório.
4. **SP criou o SAE-NFC-e** (Sistema de Apoio à Escrituração da NFC-e) com dois webservices: listagem de chaves por CNPJ e período e download do XML com eventos, com e-CNPJ e limite de requisições [S14]. NFC-e deixa de depender de o cliente mandar o arquivo, ao menos em SP. Outras UFs: `[NÃO ENCONTRADO]` caminho oficial equivalente.
5. **IBS/CBS sem trava de rejeição.** Na NF-e, a NT 2025.002 v1.51 trocou a data de rejeição em produção (03/08/2026) por "implementação futura"; a obrigação de informar continua [S8]. Na NFS-e nacional, a ausência de IBS/CBS não gera rejeição até 31/12/2026 [S6]. Simples Nacional entra em 2027 [S8]. Como o sistema não barra, **o escritório é quem precisa auditar** (NFE-030/031); o art. 348 da LC 214/2025 condiciona a dispensa de recolhimento em 2026 ao cumprimento das obrigações acessórias [S9].
6. **Guarda dos XMLs: 132 meses (11 anos)** segundo o Ajuste SINIEF 2/2025, vigente desde 01/05/2025, com fontes que dizem que o prazo maior vale só para as administrações tributárias e o contribuinte segue em 5 anos [S13]. Conflito a resolver na Etapa 2; o Plano não tratava a política de retenção.
7. **NFP-e/NF-e obrigatória para todos os produtores rurais em PR, RS e SC desde 05/01/2026** [S23]. Clientes do agro e cooperativas passam a ter entradas e saídas 100% eletrônicas capturáveis.
8. **Simples prestador de serviço passou ao Emissor Nacional da NFS-e** em 2026; as datas divergem (01/09/2026 pela Res. CGSN 189/2026; 01/11/2026 pela Res. CGSN 191/2026, que teria revogado a anterior) [S5][S6]. Cria rotina de orientação e de troca de fonte de captura por cliente.
9. **Domínio aceita XML por API Onvio via parceiro** (Fiscal.io Monitor, plano Enterprise) [C4] e o erro mais comum de importação é "não foi encontrada relação de acumulador para o CFOP/CST" [S20]. O caminho F (arquivo) não é o único; a Etapa 2 (V3) deve confirmar a API Onvio para parceiros.
10. **Portal Nacional da NFS-e com instabilidade para baixar XML e PDF desde junho/2026** [S7]: a captura precisa de reprocessamento e de alerta de falha por cliente.

---

## A. Cadastro, acessos e configuração da captura

### NFE-001 · Configurar a captura de documentos fiscais de cada cliente

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Configuração |
| atividade | Cadastrar, para cada cliente, os CNPJs (matriz e filiais), IEs, IMs, UFs, municípios, modelos de documento que ele emite e recebe, e o certificado usado na captura |
| descrição | Hoje o analista cadastra a empresa em uma ferramenta de captura (SIEG, Qive, e-Auditoria, Jettax), sobe o A1 do cliente, escolhe o "período retroativo" (ex.: 90 dias) e marca NF-e/CT-e/NFC-e [C1]; repete no core e no gestor de tarefas. Filial nova, mudança de município ou certificado renovado exigem refazer |
| gatilho_frequência | Por evento (cliente novo, filial nova, troca de certificado, mudança de município ou de regime) |
| porte_alcance | Todos os clientes com movimento fiscal |
| quem_faz | Analista fiscal / onboarding |
| onde_é_feita_hoje | Ferramenta de captura de terceiros, core, planilha de controle |
| entradas / saídas | Cartão CNPJ, IE/IM, certificado A1 → perfil de captura por CNPJ (fontes ativas, NSU inicial, data de início) |
| base_legal | NT 2014.002 (distribuição por CNPJ raiz do certificado) [S2]; manual das APIs do ADN (CNPJ raiz) [S4] |
| risco_se_falhar | Notas não capturadas dentro da janela de ~90 dias da distribuição [S1] = perda definitiva pela via automática; escrituração incompleta |
| tempo_estimado | `[ESTIMATIVA]` 20–40 min por cliente novo; 10 min por alteração |
| concorrentes | SIEG (cadastro com A1 e procurador, período de 90 dias) [C1]; Qive, e-Auditoria, Jettax, NFE.io com cadastro por CNPJ [C2][C5][C6][C8] |
| hipótese_automação | Perfil de captura derivado do cadastro do cliente (D1) e do perfil temporal: a plataforma liga as fontes certas (NF-e, CT-e, NFS-e ADN, NFC-e SAE-SP) por CNPJ, define NSU inicial e mostra "o que falta configurar" |
| papel_da_ia | M2 **ler** perfil do cliente; M1 **ler** quais documentos o regime/UF/atividade implica; M4 **rascunhar** a configuração e **executar** após aprovação |
| ferramentas_agênticas | `configurar_captura(cliente)`, `listar_fontes_aplicaveis(cliente, data)`, `diagnosticar_captura(cliente)` |
| eventos_timesheet | `nfe.captura.configurada` (cliente, nº de CNPJs, fontes, por IA/pessoa) |
| fontes_descoberta | [S1] [S2] [S4] [C1] [C2] [C5] [C6] [C8] · transversal: D1 (onboarding) |

### NFE-002 · Pedir ao cliente que inclua o escritório no campo autXML do emissor

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Configuração |
| atividade | Orientar o cliente (ou o fornecedor do ERP/emissor dele) a informar o CNPJ do escritório na tag autXML de todas as NF-e emitidas |
| descrição | O analista manda instrução por WhatsApp ou e-mail, o cliente repassa ao suporte do ERP; raramente se confere se ficou ativo. Com autXML, o escritório recebe a nota pela distribuição de DF-e com o próprio certificado [S2] |
| gatilho_frequência | Por evento (onboarding, troca de ERP/emissor do cliente); conferência mensal |
| porte_alcance | Clientes que emitem NF-e (indústria, comércio, atacado) |
| quem_faz | Analista fiscal / atendimento |
| onde_é_feita_hoje | WhatsApp, e-mail, telefone com o suporte do ERP do cliente |
| entradas / saídas | CNPJ do escritório → configuração no emissor; amostra de XML com autXML preenchido |
| base_legal | Leiaute NF-e, tag autXML; NT 2014.002 (terceiro só recebe se constar na autXML) [S2] |
| risco_se_falhar | Dependência do cliente para mandar as saídas (NFE-005), atraso no fechamento |
| tempo_estimado | `[ESTIMATIVA]` 15 min por cliente + retrabalho de cobrança |
| concorrentes | Nenhum concorrente encontrado que confira automaticamente a presença do autXML `[NÃO ENCONTRADO]` (buscado: "autXML autorização download contador CNPJ escritório") |
| hipótese_automação | Verificar em cada XML de saída capturado se a autXML contém o CNPJ do escritório; se não, abrir tarefa e mandar ao cliente instrução pronta por ERP (Bling, Omie, Tiny etc.) |
| papel_da_ia | M2 **ler** XMLs; M4 **rascunhar** a mensagem ao cliente e ao ERP dele |
| ferramentas_agênticas | `verificar_autxml(cliente, periodo)`, `gerar_instrucao_autxml(cliente, erp)`, `enviar_mensagem(cliente, texto)` |
| eventos_timesheet | `nfe.autxml.solicitado`, `nfe.autxml.confirmado` (cliente) |
| fontes_descoberta | [S2] |

### NFE-003 · Monitorar a saúde da captura: certificado vencido, falha de consulta, NSU parado

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Configuração |
| atividade | Acompanhar diariamente se a captura de cada cliente rodou, se o certificado é válido e se o NSU avançou |
| descrição | Hoje o problema aparece no fechamento ("não veio nenhuma nota de entrada"); o analista descobre que o A1 venceu ou que a ferramenta parou. Bloqueio 656 por consulta excessiva e Portal Nacional da NFS-e instável agravam [S1][S7] |
| gatilho_frequência | Diária |
| porte_alcance | Todos os clientes com captura |
| quem_faz | Analista fiscal / coordenador |
| onde_é_feita_hoje | Painel da ferramenta de captura, e-mail de alerta, planilha de certificados |
| entradas / saídas | Logs de captura, validade do certificado → lista de clientes com captura falhando + tarefa |
| base_legal | NT 2014.002 (656, 137, espera de 1 h) [S1] |
| risco_se_falhar | Janela de 90 dias passa e a nota some da distribuição [S1]; possível interrupção do NSU após 60 dias sem uso `[NÃO VERIFICADO]` [S1] |
| tempo_estimado | `[ESTIMATIVA]` 15–30 min/dia para 100 clientes sem painel; quase zero com alerta |
| concorrentes | SIEG, Qive, e-Auditoria têm painéis de status por empresa `[NÃO VERIFICADO]` em página oficial |
| hipótese_automação | Painel "saúde da captura" por cliente e fonte (último NSU, última nota, erro, dias até vencer o certificado); alerta ao responsável; nova tentativa respeitando a regra de 1 h |
| papel_da_ia | M2 **ler** logs; M4 **executar** nova tentativa e **rascunhar** pedido de certificado novo ao cliente |
| ferramentas_agênticas | `status_captura(cliente)`, `reprocessar_captura(cliente, fonte)`, `alertar_certificado(cliente)` |
| eventos_timesheet | `nfe.captura.falha_tratada` (cliente, fonte, causa) |
| fontes_descoberta | [S1] [S7] · transversal: D1 (cofre de certificados) |

---

## B. Captura de documentos

### NFE-004 · Capturar as NF-e de entrada (emitidas contra o CNPJ do cliente)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Captura de entradas |
| atividade | Baixar diariamente, por NSU, os resumos e XMLs das NF-e em que o cliente é destinatário |
| descrição | Ou o cliente manda os XMLs por e-mail (incompletos), ou o escritório usa ferramenta de captura com o A1 do cliente. Sem ferramenta, o analista baixa nota a nota no portal nacional com chave |
| gatilho_frequência | Diária (contínua) |
| porte_alcance | Todos os clientes que compram mercadoria (regime normal e Simples) |
| quem_faz | Analista fiscal (ou robô de terceiro) |
| onde_é_feita_hoje | Ferramenta de captura, portal nacional da NF-e, e-mail |
| entradas / saídas | Certificado A1 do cliente, último NSU → resumos (resNFe), XMLs completos (procNFe), eventos |
| base_legal | NT 2014.002 (NFeDistribuicaoDFe: distNSU, consNSU, consChNFe; 90 dias; uso indevido) [S1][S2] |
| risco_se_falhar | Crédito de ICMS/PIS/COFINS perdido, SPED com notas faltando, malha por nota de entrada não escriturada |
| tempo_estimado | `[ESTIMATIVA]` manual: 1–3 h/mês por cliente médio; automático: minutos de conferência |
| concorrentes | SIEG [C1], Qive [C2], e-Auditoria ("consulta periodicamente os webservices da SEFAZ") [C5], Jettax (A1, entrada e saída) [C6], NFE.io (NSU por CNPJ) [C8], Fiscal.io [C4], HubStrom XMLHub [C3] |
| hipótese_automação | Coletor por CNPJ com fila e controle de taxa (no máximo uma consulta por hora após 137), guarda de NSU, resumo → ciência → XML completo (encadeia NFE-014) |
| papel_da_ia | Nenhum no fluxo principal (determinístico). M2 **ler** para responder "chegou a nota do fornecedor X?" |
| ferramentas_agênticas | `buscar_notas(cliente, periodo, tipo, emitente)`, `obter_xml(chave)`, `status_captura(cliente)` |
| eventos_timesheet | Nenhum por nota (máquina). `nfe.captura.lote` agregado (cliente, nº de notas) para custo de servir |
| fontes_descoberta | [S1] [S2] [C1]–[C6] [C8] |

### NFE-005 · Obter as notas de saída emitidas pelo cliente

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Captura de saídas |
| atividade | Juntar todos os XMLs de NF-e e NFC-e emitidos pelo cliente na competência |
| descrição | O analista cobra o cliente, que exporta do ERP e manda ZIP por e-mail ou WhatsApp, quase sempre perto do prazo; ou o escritório recebe via autXML (NFE-002) ou por acesso ao emissor do cliente. Jettax diz que "contar com clientes para enviar XML é arriscado e manual" [C6] |
| gatilho_frequência | Mensal (início do mês) + por evento |
| porte_alcance | Clientes emissores de NF-e/NFC-e |
| quem_faz | Analista fiscal, atendimento |
| onde_é_feita_hoje | E-mail, WhatsApp, pasta compartilhada, portal do emissor |
| entradas / saídas | ZIP/XMLs, acesso ao ERP → XMLs de saída organizados por competência |
| base_legal | Leiaute NF-e (autXML) [S2]; para NFC-e em SP, SAE-NFC-e [S14] |
| risco_se_falhar | Receita declarada a menor no PGDAS-D/EFD; malha estadual por divergência NF × declaração [S15] |
| tempo_estimado | `[ESTIMATIVA]` 30–60 min/mês por cliente, maior parte em cobrança |
| concorrentes | SIEG Emissor com painel ao contador [C1]; Jettax (saída via A1) [C6]; HubStrom (busca de saída) [C3] |
| hipótese_automação | Ordem de preferência: (1) distribuição com o A1 do cliente quando a fonte devolver as emitidas, (2) autXML, (3) SAE-NFC-e SP, (4) integração com o ERP do cliente, (5) portal do cliente com upload e e-mail dedicado. Em todos, conferir completude (NFE-020) |
| papel_da_ia | M2 **ler** o que já chegou; M4 **rascunhar** cobrança só do que falta (NFE-038) |
| ferramentas_agênticas | `importar_xmls(cliente, arquivo)`, `listar_saidas(cliente, competencia)`, `solicitar_documentos(cliente, lista)` |
| eventos_timesheet | `nfe.saidas.recebidas` (cliente, competência, canal, nº) |
| fontes_descoberta | [S2] [S14] [S15] [C1] [C3] [C6] · transversal: D7 (portal do cliente) |

### NFE-006 · Capturar CT-e e CT-e OS em que o cliente é tomador ou outro ator

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Captura de entradas |
| atividade | Baixar os CT-e de frete contratado (tomador, remetente, destinatário) e os CT-e emitidos por clientes transportadores |
| descrição | Frete é esquecido com frequência porque não vem junto com a NF-e; o analista pede ao cliente ou baixa por chave. Para transportadoras clientes, o volume é alto |
| gatilho_frequência | Diária |
| porte_alcance | Comércio e indústria que contratam frete (crédito de ICMS/PIS/COFINS no regime normal); transportadoras |
| quem_faz | Analista fiscal |
| onde_é_feita_hoje | Ferramenta de captura, e-mail do transportador |
| entradas / saídas | Certificado → XMLs de CT-e e eventos |
| base_legal | NT 2015.002 (CTeDistribuicaoDFe; atores emitente, destinatário, remetente, recebedor, expedidor, tomador e terceiros; 3 meses) [S10] |
| risco_se_falhar | Crédito de frete perdido; escrituração incompleta; CT-e indevido sem desacordo (NFE-017) |
| tempo_estimado | `[ESTIMATIVA]` 20–40 min/mês por cliente comercial sem automação |
| concorrentes | SIEG (CT-e marcado no cadastro) [C1]; e-Auditoria, NFE.io (CT-e inbound) [C5][C8]; Alterdata importa CT-e por rotina automática [S21] |
| hipótese_automação | Mesmo coletor da NFE-004 para o webservice de CT-e; vincular CT-e à NF-e transportada (chave referenciada) |
| papel_da_ia | M2 **ler** e responder "qual o frete desta compra?" |
| ferramentas_agênticas | `buscar_cte(cliente, periodo, papel)`, `vincular_cte_nfe(chave_cte)` |
| eventos_timesheet | `nfe.captura.lote` (modelo 57/67) |
| fontes_descoberta | [S10] [S21] [C1] [C5] [C8] |

### NFE-007 · Capturar NFS-e prestadas e tomadas pelo Ambiente de Dados Nacional (ADN)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Captura de serviços |
| atividade | Baixar por NSU as NFS-e emitidas e recebidas pelo cliente nos municípios integrados ao ADN |
| descrição | Hoje o analista entra no portal de cada prefeitura (ou no Portal Nacional) com login/certificado do cliente e exporta XML/PDF; serviços tomados de fora do município são os mais perdidos [C6] |
| gatilho_frequência | Diária ou semanal |
| porte_alcance | Prestadores de serviço (todos os regimes) e tomadores de serviço (retenções) |
| quem_faz | Analista fiscal |
| onde_é_feita_hoje | Portais municipais, Portal Nacional da NFS-e, ferramentas de captura |
| entradas / saídas | Certificado do cliente (mesmo CNPJ raiz) → XMLs de NFS-e (DPS/NFS-e) e eventos |
| base_legal | LC 214/2025, art. 62 (padrão nacional e compartilhamento no ambiente nacional desde 01/01/2026) [S5]; manual das APIs do ADN v1.0, 12/02/2026 [S4] |
| risco_se_falhar | Receita de serviço omitida; ISS/IRRF/CSRF retidos não aproveitados ou não recolhidos; cruzamento com DCTFWeb/EFD-Reinf |
| tempo_estimado | `[ESTIMATIVA]` 30–90 min/mês por cliente prestador sem automação |
| concorrentes | NFE.io (NFS-e recebidas via Ambiente Nacional com certificado) [C8]; Jettax (2.200+ municípios, diz que sem certificado) [C6]; Kolossus (700+ municípios) [C7]; HubStrom (NFS-e de saída) [C3] |
| hipótese_automação | Coletor do ADN por CNPJ raiz respeitando limite (429), com mapa "município do cliente → integrado ao ADN sim/não" atualizado; fallback para NFE-008 |
| papel_da_ia | M2 **ler**; M1 **ler** regra de retenção para conferência (NFE-027) |
| ferramentas_agênticas | `buscar_nfse(cliente, periodo, papel)`, `municipio_integrado_adn(ibge)` |
| eventos_timesheet | `nfe.captura.lote` (NFS-e) |
| fontes_descoberta | [S4] [S5] [S7] [C3] [C6] [C7] [C8] |

### NFE-008 · Capturar NFS-e de municípios fora do ADN, de emissores próprios e de PDFs

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Captura de serviços |
| atividade | Obter NFS-e de prefeituras que mantêm sistema próprio sem envio completo ao ADN, e transformar PDF/imagem em dado |
| descrição | Muitos municípios conveniados ainda não estavam ativos (303 ativos de 3.615 conveniados, out/2025, análise citada) [S5]; São Paulo mantém emissor próprio que transmite ao ADN [S5]. Notas tomadas chegam como PDF por e-mail e são digitadas no core |
| gatilho_frequência | Mensal |
| porte_alcance | Clientes em municípios não integrados; tomadores de serviços de vários municípios |
| quem_faz | Analista fiscal |
| onde_é_feita_hoje | Portais municipais, e-mail, digitação no core |
| entradas / saídas | Login/certificado municipal, PDFs → XML ou registro estruturado da nota |
| base_legal | Legislação de cada município; LC 214/2025 art. 62 [S5] |
| risco_se_falhar | Digitação errada de retenções e valores; nota tomada não escriturada |
| tempo_estimado | `[ESTIMATIVA]` 3–5 min por nota digitada; 15 min por portal municipal visitado |
| concorrentes | Kolossus, Jettax (captura municipal) [C6][C7]; Sovos (OCR de NFS-e em PDF/imagem) [C9] |
| hipótese_automação | Integrador de NFS-e (B) ou robô municipal (C-cert) só onde a carteira concentra; leitura de PDF com extração estruturada + validação pela consulta pública da nota quando houver |
| papel_da_ia | Extração de PDF/imagem (modelo de visão) com M2 **rascunhar** o registro e humano confirmar; nunca gravar no core sem conferência |
| ferramentas_agênticas | `extrair_nota_pdf(arquivo)`, `validar_nfse_publica(municipio, numero, codigo)`, `registrar_nota_manual(cliente, dados)` |
| eventos_timesheet | `nfe.nfse.digitada` (cliente, nº de notas, por IA/pessoa, minutos de revisão) |
| fontes_descoberta | [S5] [C6] [C7] [C9] |

### NFE-009 · Capturar as NFC-e do varejo

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Captura de saídas |
| atividade | Obter todos os XMLs de NFC-e emitidos pelo cliente varejista na competência |
| descrição | Volume de milhares de cupons por mês; o cliente exporta do PDV (quando lembra). Sem a chave não há consulta pública; "se o cliente não envia o DANFE, você simplesmente não sabe que aquela nota existe" [S14] |
| gatilho_frequência | Mensal (ou diária) |
| porte_alcance | Varejo, restaurantes, postos |
| quem_faz | Analista fiscal |
| onde_é_feita_hoje | Exportação do PDV, e-mail, pen drive |
| entradas / saídas | e-CNPJ do cliente → lista de chaves + XMLs com eventos |
| base_legal | SP: SAE-NFC-e (NFCeListagemChaves, NFCeDownloadXML) com e-CNPJ e limite de requisições [S14]; demais UFs `[NÃO ENCONTRADO]` serviço oficial equivalente (buscado: "NFC-e contador download XML Sefaz MG PR SC RS") |
| risco_se_falhar | Receita omitida; malha PGDAS-D × NFC-e (ex.: PE e GO cruzam NF-e e NFC-e com a receita declarada) [S15] |
| tempo_estimado | `[ESTIMATIVA]` 30 min/mês por cliente varejista + retrabalho |
| concorrentes | Jettax anuncia captura automática de NFC-e em "mais estados" [C6]; Alterdata importa NFC-e por XML (zerando ICMS na entrada) [S21] |
| hipótese_automação | SP via SAE-NFC-e (A); outras UFs via integração com o PDV/emissor do cliente ou agregador (B) |
| papel_da_ia | Nenhum no fluxo; M2 **ler** totais por dia para conferência |
| ferramentas_agênticas | `listar_chaves_nfce(cliente, periodo)`, `baixar_nfce(chave)` |
| eventos_timesheet | `nfe.captura.lote` (NFC-e) |
| fontes_descoberta | [S14] [S15] [S21] [C6] |

### NFE-010 · Controlar MDF-e dos clientes transportadores e emitentes de carga própria

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Eventos de transporte |
| atividade | Acompanhar MDF-e abertos e orientar o encerramento antes que bloqueiem novas emissões |
| descrição | O cliente liga quando a emissão é rejeitada (686: MDF-e não encerrado há mais de 30 dias); o escritório localiza e orienta encerrar. Bloqueios escalonados: imediato para mesma placa e UF (611/662), 5 dias (462), 30 dias para o emitente (686) [S11] |
| gatilho_frequência | Diária/semanal (por evento de rejeição) |
| porte_alcance | Transportadoras e empresas com frota própria |
| quem_faz | Analista fiscal / atendimento |
| onde_é_feita_hoje | Telefone, WhatsApp, emissor do cliente |
| entradas / saídas | XMLs de MDF-e → lista de manifestos abertos por placa e idade |
| base_legal | Ajuste SINIEF que institui o MDF-e `[NÃO VERIFICADO número e redação]`; prazo de 720 h citado por fornecedor [S11] |
| risco_se_falhar | Cliente parado sem conseguir emitir; mercadoria retida |
| tempo_estimado | `[ESTIMATIVA]` 15–30 min por ocorrência |
| concorrentes | `[NÃO ENCONTRADO]` concorrente de escritório com alerta de MDF-e aberto |
| hipótese_automação | Se o MDF-e for capturável pela distribuição (`[NÃO VERIFICADO]` existência de distribuição de MDF-e a terceiros), alertar manifestos com mais de 25 dias; senão, integração com o emissor do cliente |
| papel_da_ia | M4 **rascunhar** aviso ao cliente com a lista de manifestos e o passo a passo |
| ferramentas_agênticas | `listar_mdfe_abertos(cliente)`, `alertar_cliente(cliente, motivo)` |
| eventos_timesheet | `nfe.mdfe.alerta` (cliente, nº abertos) |
| fontes_descoberta | [S11] |

### NFE-011 · Capturar notas de produtor rural (NFP-e / NF-e de produtor)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Captura |
| atividade | Obter as notas emitidas por produtores rurais clientes (saídas) e as recebidas de produtores (entradas de cooperativas, agroindústrias) |
| descrição | Até 2025 coexistia o talão modelo 4; desde 05/01/2026 PR, RS e SC exigem nota eletrônica para todos os produtores [S23]. Produtor pessoa física emite pelo app da Sefaz (ex.: Nota Fiscal Fácil) e manda print ao contador |
| gatilho_frequência | Mensal; picos na safra |
| porte_alcance | Produtores rurais (PF e PJ), cooperativas, agroindústrias |
| quem_faz | Analista fiscal / DP rural |
| onde_é_feita_hoje | App da Sefaz, WhatsApp, Portal Receita/PR |
| entradas / saídas | Certificado do produtor (quando houver) → XMLs; caso PF sem certificado, upload |
| base_legal | Ajuste SINIEF 10/22 (limite temporal citado por SC) [S23]; atos da Sefaz PR, RS e SC [S23] |
| risco_se_falhar | Funrural/receita da atividade rural mal apurada; IRPF do produtor; crédito presumido da cooperativa |
| tempo_estimado | `[ESTIMATIVA]` 20 min/mês por produtor |
| concorrentes | `[NÃO ENCONTRADO]` funcionalidade específica para produtor rural nos concorrentes pesquisados |
| hipótese_automação | Mesmo coletor da NF-e quando o produtor tem certificado; quando é CPF sem certificado, upload no portal/WhatsApp com leitura da chave e download por chave |
| papel_da_ia | Extração da chave em foto/print; M2 **ler** |
| ferramentas_agênticas | `extrair_chave_imagem(arquivo)`, `obter_xml(chave)` |
| eventos_timesheet | `nfe.rural.recebida` (cliente, nº) |
| fontes_descoberta | [S23] · transversal: D5 (Livro Caixa rural) |

### NFE-012 · Receber documentos soltos pelo atendimento (WhatsApp, e-mail) e casá-los com os XMLs

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Captura |
| atividade | Triar DANFEs, PDFs, fotos de cupom e boletos que chegam pelo atendimento e identificar se já existe o XML |
| descrição | Clientes mandam foto do DANFE no WhatsApp; o atendente salva em pasta e avisa o fiscal, que procura o XML ou pede de novo. Duplicidades e perdas são comuns |
| gatilho_frequência | Diária |
| porte_alcance | Todos |
| quem_faz | Atendimento → analista fiscal |
| onde_é_feita_hoje | WhatsApp, e-mail, pastas de rede |
| entradas / saídas | Imagem/PDF → chave de acesso, status "XML já capturado / falta / nota cancelada" |
| base_legal | — |
| risco_se_falhar | Retrabalho; nota escriturada duas vezes ou nenhuma |
| tempo_estimado | `[ESTIMATIVA]` 2–5 min por documento |
| concorrentes | Sovos (OCR) [C9]; multiatendimento dos concorrentes não cruza com XML `[NÃO VERIFICADO]` |
| hipótese_automação | O canal de atendimento (D7) detecta anexo fiscal, extrai a chave (código de barras/QR), consulta a base de XMLs e responde ao cliente "já temos" ou anexa à competência |
| papel_da_ia | Visão + M2 **ler**; M4 **executar** o arquivamento (reversível) e **rascunhar** a resposta |
| ferramentas_agênticas | `extrair_chave_imagem(arquivo)`, `localizar_nota(chave)`, `anexar_documento(cliente, competencia, arquivo)` |
| eventos_timesheet | `atendimento.documento.triado` (cliente, tipo, canal) |
| fontes_descoberta | [C9] · transversal: D7 (multiatendimento), D5 (coleta de documentos) |

### NFE-013 · Capturar documentos de outros modelos (energia NF3e, telecom NFCom, importação, devolução de terceiros)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Captura |
| atividade | Obter faturas eletrônicas de energia (NF3e) e telecom (NFCom) e as NF-e de importação emitidas pelo próprio cliente |
| descrição | Contas de luz e telefone chegam em PDF; são relevantes para crédito de ICMS/PIS/COFINS no regime normal. NF-e de importação exige conferir com a DI/DUIMP |
| gatilho_frequência | Mensal |
| porte_alcance | Regime normal (crédito), indústrias, importadores |
| quem_faz | Analista fiscal |
| onde_é_feita_hoje | E-mail, portal da concessionária |
| entradas / saídas | Faturas → XML/registro; DI/DUIMP → conferência com a NF-e de importação |
| base_legal | `[NÃO VERIFICADO]` NT de distribuição de NF3e e NFCom a destinatários; MG anunciou "consumo indevido" na NFCom em 07/07/2025 (indício de webservice) [S1] |
| risco_se_falhar | Crédito perdido; erro de base de cálculo na importação |
| tempo_estimado | `[ESTIMATIVA]` 10 min/mês por cliente |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Verificar na Etapa 2 se há distribuição oficial para NF3e/NFCom; senão, leitura de PDF (NFE-008) |
| papel_da_ia | Extração + M2 **ler** |
| ferramentas_agênticas | `buscar_documentos(cliente, modelo, periodo)` |
| eventos_timesheet | `nfe.captura.lote` (modelo) |
| fontes_descoberta | [S1] |

---

## C. Manifestação do destinatário e eventos

### NFE-014 · Registrar a Ciência da Operação para liberar o XML completo

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Manifestação |
| atividade | Enviar o evento de ciência para cada resumo recebido, a fim de baixar o XML completo |
| descrição | Ferramentas fazem a ciência automática; sem ferramenta, o analista faz pelo app da Sefaz com o certificado do cliente [C2]. A ciência não é manifestação final e não pode ser registrada depois de uma conclusiva [S3] |
| gatilho_frequência | Diária (por nota) |
| porte_alcance | Destinatários de NF-e |
| quem_faz | Robô / analista fiscal |
| onde_é_feita_hoje | Ferramenta de captura, app da Sefaz |
| entradas / saídas | Resumo (resNFe) → evento registrado → XML completo |
| base_legal | NT 2020.001 v1.60 [S3]; TOTVS cita prazo de 10 dias para "ciência da emissão" `[NÃO VERIFICADO; conflita com a prática de ciência a qualquer tempo dentro da janela]` [S3] |
| risco_se_falhar | Sem XML completo, a escrituração vira digitação |
| tempo_estimado | `[ESTIMATIVA]` 1 min por nota manual |
| concorrentes | SIEG, Qive, e-Auditoria `[NÃO VERIFICADO]` em página oficial a ciência automática |
| hipótese_automação | Ciência automática (evento não conclusivo) em todo resumo, com autorização registrada do cliente no contrato/onboarding |
| papel_da_ia | Nenhum (regra fixa); M4 **executar** em lote só com autorização permanente |
| ferramentas_agênticas | `registrar_ciencia(chave)` |
| eventos_timesheet | Nenhum por nota; agregado `nfe.manifestacao.ciencia_lote` |
| fontes_descoberta | [S3] [C2] |

### NFE-015 · Fazer a manifestação conclusiva (confirmação, desconhecimento, operação não realizada) no prazo

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Manifestação |
| atividade | Confirmar com o cliente se a mercadoria foi recebida e registrar o evento conclusivo de cada nota dentro do prazo |
| descrição | Pouco feito por escritórios pequenos; exige perguntar ao cliente nota a nota. Algumas UFs e operações (ex.: combustíveis, valores altos) tornaram obrigatória a manifestação conclusiva `[NÃO VERIFICADO quais em SP, MG, PR, SC, RS]` |
| gatilho_frequência | Por nota; prazo de 90 dias da autorização [S3] |
| porte_alcance | Destinatários de NF-e, com ênfase nos obrigados |
| quem_faz | Analista fiscal com o cliente |
| onde_é_feita_hoje | App da Sefaz, ERP do cliente, WhatsApp para perguntar |
| entradas / saídas | Lista de notas sem manifestação → resposta do cliente → evento registrado |
| base_legal | Ajuste SINIEF 14/26; NT 2020.001 v1.60 (90 dias; fora do período o evento é rejeitado) [S3] |
| risco_se_falhar | Evento rejeitado fora do prazo; nota fraudulenta sem desconhecimento (NFE-016); penalidade estadual onde obrigatória `[NÃO VERIFICADO]` |
| tempo_estimado | `[ESTIMATIVA]` 1–2 min por nota + espera do cliente |
| concorrentes | Qive trata manifestação em conteúdo [C2]; nenhum concorrente encontrado que pergunte ao cliente pelo WhatsApp `[NÃO ENCONTRADO]` |
| hipótese_automação | Lista por cliente com contagem regressiva; mensagem ao cliente com "recebeu? sim / não / não conheço" por nota ou em lote; a resposta gera o evento para aprovação do analista |
| papel_da_ia | M2 **ler**; M4 **rascunhar** pergunta ao cliente e **executar** o evento só com aprovação (evento conclusivo não se desfaz) |
| ferramentas_agênticas | `listar_pendentes_manifestacao(cliente, dias_restantes)`, `perguntar_recebimento(cliente, chaves)`, `registrar_manifestacao(chave, tipo, justificativa)` |
| eventos_timesheet | `nfe.manifestacao.conclusiva` (cliente, nº de notas, tipo, aprovado por) |
| fontes_descoberta | [S3] [C2] |

### NFE-016 · Detectar notas emitidas indevidamente contra o CNPJ do cliente (nota fria, uso do CNPJ)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Manifestação e risco |
| atividade | Identificar entradas que o cliente não reconhece e registrar desconhecimento ou operação não realizada |
| descrição | Empresas costumam não saber dessas notas; a recomendação é consultar diariamente as emitidas contra o CNPJ e manifestar [S19]. Cancelamento após a entrega também é golpe conhecido [S24] |
| gatilho_frequência | Diária |
| porte_alcance | Todos os destinatários de NF-e |
| quem_faz | Analista fiscal + cliente |
| onde_é_feita_hoje | Ferramenta de captura, WhatsApp |
| entradas / saídas | Entradas novas × fornecedores habituais × pedidos/pagamentos → alerta + evento de desconhecimento |
| base_legal | NT 2020.001 (eventos de desconhecimento e operação não realizada) [S3]; crime contra a ordem tributária citado por fonte secundária [S19] `[NÃO VERIFICADO dispositivo]` |
| risco_se_falhar | Cliente envolvido em fiscalização; crédito glosado; cobrança indevida |
| tempo_estimado | `[ESTIMATIVA]` 10–30 min por ocorrência |
| concorrentes | Qive (controle antifraude de notas frias) [C2]; Dootax (repositório de notas emitidas para o CNPJ) [S19] |
| hipótese_automação | Regra de anomalia: emitente novo, CFOP incomum, valor fora do padrão, emitente com situação cadastral irregular (NFE-028); alerta ao cliente pelo canal preferido |
| papel_da_ia | M2 **ler** histórico de fornecedores; M4 **rascunhar** alerta e evento |
| ferramentas_agênticas | `detectar_notas_suspeitas(cliente, periodo)`, `alertar_cliente(cliente, motivo)`, `registrar_manifestacao(chave, "desconhecimento")` |
| eventos_timesheet | `nfe.risco.nota_suspeita` (cliente, chave, desfecho) |
| fontes_descoberta | [S3] [S19] [S24] [C2] |

### NFE-017 · Registrar prestação de serviço em desacordo no CT-e

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Eventos de transporte |
| atividade | Contestar CT-e com dados errados ou indevidos em que o cliente é tomador |
| descrição | O cliente percebe tarde que o frete veio errado; o escritório orienta o evento e a emissão de CT-e substituto pelo transportador |
| gatilho_frequência | Por evento |
| porte_alcance | Tomadores de frete |
| quem_faz | Analista fiscal com o cliente |
| onde_é_feita_hoje | Emissor/app, e-mail ao transportador |
| entradas / saídas | CT-e → evento 610110 (desacordo) → CT-e substituto |
| base_legal | Prazo de 45 dias para o desacordo e 60 dias para o substituto, segundo fontes secundárias [S10] `[NÃO VERIFICADO na NT]` |
| risco_se_falhar | Crédito indevido/glosa; frete cobrado errado |
| tempo_estimado | `[ESTIMATIVA]` 20 min por ocorrência |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Alerta de CT-e sem NF-e vinculada ou com tomador divergente; checklist e prazo |
| papel_da_ia | M1 **ler** a regra; M4 **rascunhar** o evento |
| ferramentas_agênticas | `registrar_desacordo_cte(chave, motivo)` |
| eventos_timesheet | `nfe.cte.desacordo` (cliente) |
| fontes_descoberta | [S10] |

### NFE-018 · Monitorar cancelamentos, CC-e e outros eventos posteriores à importação

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Eventos |
| atividade | Detectar notas canceladas, corrigidas ou com eventos depois de já importadas no core e ajustar a escrituração |
| descrição | Nota cancelada fora do prazo ou após a importação continua escriturada como válida; a CC-e altera dados que o core já gravou. A recomendação é consulta diária ou no mínimo semanal [S24] |
| gatilho_frequência | Diária |
| porte_alcance | Todos |
| quem_faz | Analista fiscal |
| onde_é_feita_hoje | Ferramenta de captura, core |
| entradas / saídas | Eventos distribuídos → lista "nota já no core com evento novo" + tarefa de ajuste |
| base_legal | CC-e até 720 h (Ajuste SINIEF 07/2005, segundo fonte) [S12]; a última CC-e substitui as anteriores [S12] |
| risco_se_falhar | Crédito de nota cancelada; SPED divergente; retificação |
| tempo_estimado | `[ESTIMATIVA]` 5–10 min por evento |
| concorrentes | Qive (conteúdo sobre cancelamento como golpe) [S24]; captura de eventos em NFE.io [C8] |
| hipótese_automação | Toda nota tem linha do tempo de eventos; evento após a exportação ao core gera tarefa e, onde possível, reexportação |
| papel_da_ia | M2 **ler**; M4 **rascunhar** o ajuste e a mensagem |
| ferramentas_agênticas | `eventos_pos_importacao(cliente, periodo)`, `linha_do_tempo_nota(chave)` |
| eventos_timesheet | `nfe.evento.ajustado` (cliente, tipo de evento) |
| fontes_descoberta | [S12] [S24] [C8] |

### NFE-019 · Orientar o cliente em cancelamento fora do prazo e carta de correção nas saídas

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Eventos |
| atividade | Responder "errei a nota, e agora?": decidir entre CC-e, cancelamento, cancelamento extemporâneo, nota de devolução/estorno ou complementar |
| descrição | Dúvida diária do atendimento. Prazo regular de cancelamento de 24 h, com UFs que aceitam até 168 h [S12]; SP exige pedido extemporâneo pelo SIPET [S12]; MG tem manual próprio [S12]. CC-e não corrige valores nem destinatário [S12] |
| gatilho_frequência | Por evento (várias vezes por semana) |
| porte_alcance | Emissores |
| quem_faz | Analista fiscal / atendimento |
| onde_é_feita_hoje | WhatsApp, telefone, portal da Sefaz |
| entradas / saídas | Nota e o erro → orientação com a norma e o passo a passo; pedido extemporâneo protocolado |
| base_legal | Ajuste SINIEF 07/2005 [S12]; SP: Portaria SRE 83/2020 e DN CAT 05/2019 (fontes divergem) [S12]; MG: manual de cancelamento extemporâneo [S12] |
| risco_se_falhar | Imposto pago sobre nota que não deveria existir; multa por cancelamento irregular |
| tempo_estimado | `[ESTIMATIVA]` 10–20 min por consulta |
| concorrentes | Qive lista emissão de carta de correção [C2] |
| hipótese_automação | Árvore de decisão por UF e por tipo de erro, com o passo a passo e o link do serviço da Sefaz |
| papel_da_ia | M1 **ler** a regra vigente por UF; M2 **ler** a nota; M4 **rascunhar** resposta ao cliente |
| ferramentas_agênticas | `orientar_correcao_nota(chave, erro)`, `explicar_regra(uf, tema)` |
| eventos_timesheet | `atendimento.duvida_fiscal` (cliente, tema "correção de nota") |
| fontes_descoberta | [S12] [C2] · transversal: D7 |

---

## D. Completude e conferência

### NFE-020 · Conferir a completude das saídas (sequência numérica, séries, inutilizações)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Completude |
| atividade | Verificar se não faltam números na sequência de NF-e/NFC-e/NFS-e emitidas, por série, e se os saltos têm inutilização |
| descrição | O analista ordena os XMLs no Excel ou no core e procura buracos; muitas vezes só descobre no SPED |
| gatilho_frequência | Mensal (antes do fechamento) |
| porte_alcance | Emissores |
| quem_faz | Analista fiscal |
| onde_é_feita_hoje | Planilha, relatório do core |
| entradas / saídas | XMLs de saída, eventos de inutilização → lista de lacunas + pedido ao cliente |
| base_legal | Regras de numeração e inutilização da NF-e `[NÃO VERIFICADO dispositivo]` |
| risco_se_falhar | Receita omitida; malha [S15] |
| tempo_estimado | `[ESTIMATIVA]` 10–20 min/mês por cliente |
| concorrentes | `[NÃO VERIFICADO]` relatórios de sequência nos concorrentes de captura |
| hipótese_automação | Verificação determinística de sequência por CNPJ/modelo/série; lacuna sem inutilização vira pedido ao cliente |
| papel_da_ia | M3 (regra determinística); M4 **rascunhar** pedido |
| ferramentas_agênticas | `verificar_sequencia(cliente, competencia)`, `solicitar_documentos(cliente, lista)` |
| eventos_timesheet | `nfe.completude.verificada` (cliente, competência, nº de lacunas) |
| fontes_descoberta | [S15] |

### NFE-021 · Conferir a completude das entradas e das notas só com resumo

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Completude |
| atividade | Garantir que toda entrada distribuída tem XML completo e que compras pagas (extrato, contas a pagar) têm nota |
| descrição | O analista compara a lista do portal com o que o cliente mandou; compras pagas sem nota aparecem só na conciliação contábil |
| gatilho_frequência | Mensal |
| porte_alcance | Todos |
| quem_faz | Analista fiscal / contábil |
| onde_é_feita_hoje | Planilha, core |
| entradas / saídas | Resumos sem XML, extrato/contas a pagar → lista de pendências |
| base_legal | — |
| risco_se_falhar | Crédito perdido; despesa sem documento |
| tempo_estimado | `[ESTIMATIVA]` 15–30 min/mês por cliente |
| concorrentes | `[NÃO VERIFICADO]` |
| hipótese_automação | Painel "resumos sem XML" + cruzamento com pagamentos (D5) |
| papel_da_ia | M2 **ler**; M3 cruzamento por valor/data/CNPJ |
| ferramentas_agênticas | `notas_sem_xml(cliente)`, `cruzar_pagamentos_notas(cliente, periodo)` |
| eventos_timesheet | `nfe.completude.verificada` (entradas) |
| fontes_descoberta | — · transversal: D5 (conciliação) |

### NFE-022 · Conciliar o faturamento das notas com a receita declarada (PGDAS-D, EFD)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Conferência |
| atividade | Comparar NF-e, NFC-e e NFS-e emitidas (menos devoluções e canceladas) com a receita da declaração antes de transmitir |
| descrição | Os fiscos já cruzam: GO (Malha 128: vendas líquidas × receita do PGDAS-D; Malha 129: DIMP × receita) e PE (faturamento de ICMS declarado menor que o das NF-e/NFC-e) [S15]. Erros comuns: nota de um mês declarada em outro, cancelamentos e devoluções [S15] |
| gatilho_frequência | Mensal (antes do PGDAS-D, dia 20) |
| porte_alcance | Simples Nacional (malha PGDAS-D, Res. CGSN 140/2018 art. 39-A [S15]) e regime normal |
| quem_faz | Analista fiscal |
| onde_é_feita_hoje | Planilha, relatório do core |
| entradas / saídas | Totais por competência × valor declarado → diferença explicada ou corrigida |
| base_legal | Res. CGSN 140/2018, art. 39-A [S15]; notas técnicas de malha estaduais [S15] |
| risco_se_falhar | Retenção em malha, auto de infração; PGDAS-D tem caráter de confissão [S15] |
| tempo_estimado | `[ESTIMATIVA]` 10–20 min/mês por cliente |
| concorrentes | e-Simples Auditoria (malha do Simples) [S15] |
| hipótese_automação | Conciliação automática por competência e por segregação (monofásico, ST, retenção) antes da transmissão; pendência vira bloqueio da tarefa de PGDAS-D |
| papel_da_ia | M3 cálculo; M2 dados; M1 regra de segregação |
| ferramentas_agênticas | `conciliar_faturamento(cliente, competencia)` |
| eventos_timesheet | `nfe.conciliacao.faturamento` (cliente, competência, diferença) |
| fontes_descoberta | [S15] · transversal: D2 (FIS PGDAS-D) |

### NFE-023 · Conferir NCM, CST/CSOSN, CFOP e alíquotas das entradas antes de importar

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Conferência tributária |
| atividade | Validar item a item se a classificação e a tributação do fornecedor batem com a regra e com o direito a crédito do cliente |
| descrição | Hoje feito por amostragem ou só quando o core acusa; validar antes da escrituração evita retificar o SPED depois [S24]. ERPs parametrizados errado propagam o erro [S16] |
| gatilho_frequência | Mensal / contínua |
| porte_alcance | Regime normal (crédito); Simples (custo, ST e monofásico) |
| quem_faz | Analista fiscal |
| onde_é_feita_hoje | Core, ferramenta de auditoria, planilha |
| entradas / saídas | XMLs + cadastro do cliente + regras vigentes → divergências por item com a regra citada |
| base_legal | Tabela TIPI/NCM, tabelas de CST, CFOP (Convênio SINIEF s/nº 1970) `[NÃO VERIFICADO versões vigentes]` |
| risco_se_falhar | Crédito indevido ou não aproveitado; autuação |
| tempo_estimado | `[ESTIMATIVA]` 30–120 min/mês por cliente do regime normal |
| concorrentes | e-Auditoria (validação em lote) [C5]; Omie (auditoria "regra tributária não informada") [C10]; SIEG (conferência tributária) `[NÃO VERIFICADO]` |
| hipótese_automação | Motor de regras determinístico (tabelas versionadas) que roda em cada XML capturado, com explicação da regra |
| papel_da_ia | M3 regra; M1 **ler** a norma para explicar e para casos ambíguos; nunca decide sozinho a classificação |
| ferramentas_agênticas | `auditar_notas(cliente, competencia, regras)`, `explicar_divergencia(item)` |
| eventos_timesheet | `nfe.auditoria.executada` (cliente, nº divergências, minutos de revisão) |
| fontes_descoberta | [S16] [S24] [C5] [C10] |

### NFE-024 · Identificar produtos monofásicos de PIS/COFINS nas saídas do Simples (segregação e recuperação)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Conferência tributária |
| atividade | Separar a receita de produtos monofásicos para não pagar PIS/COFINS em duplicidade no DAS e apurar recuperação de períodos passados |
| descrição | CST 04, 05, 06 sinalizam monofasia, mas usar só o CFOP leva a erro [S16]; a classificação depende do NCM. Recuperação é oferecida como serviço extra |
| gatilho_frequência | Mensal + projeto pontual (recuperação de 5 anos) |
| porte_alcance | Simples Nacional no comércio (autopeças, farmácia, perfumaria, bebidas, combustíveis) |
| quem_faz | Analista fiscal / consultoria |
| onde_é_feita_hoje | Planilha, calculadoras por XML, core |
| entradas / saídas | XMLs de saída por NCM → receita segregada; valor recuperável |
| base_legal | LC 128/2008 (segregação no Simples, citada por fonte) [S16]; leis do regime monofásico `[NÃO VERIFICADO dispositivos]` |
| risco_se_falhar | Pagamento a maior (perda) ou segregação indevida (autuação; PE tem indicador de segregação indevida [S15]) |
| tempo_estimado | `[ESTIMATIVA]` 20 min/mês por cliente; 4–8 h por recuperação |
| concorrentes | e-Auditoria (conteúdo e ferramentas de monofásico) [S16]; calculadoras por XML [S16] |
| hipótese_automação | Tabela NCM → monofásico versionada; segregação sugerida a cada mês; simulação de recuperação |
| papel_da_ia | M3 cálculo; M1 **ler** a norma por NCM; M4 **rascunhar** proposta de serviço de recuperação |
| ferramentas_agênticas | `segregar_monofasico(cliente, competencia)`, `simular_recuperacao(cliente, periodo)` |
| eventos_timesheet | `nfe.monofasico.segregado`; `consultoria.recuperacao.simulada` |
| fontes_descoberta | [S15] [S16] · transversal: D6 (recuperação de créditos) |

### NFE-025 · Conferir substituição tributária do ICMS nas entradas e saídas

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Conferência tributária |
| atividade | Verificar se o ICMS-ST veio retido corretamente (CEST, MVA, base), se há ST a recolher na entrada e se há direito a ressarcimento |
| descrição | Feito por especialista com tabelas próprias por UF; muda com frequência |
| gatilho_frequência | Mensal |
| porte_alcance | Comércio com produtos sujeitos a ST, em SP, MG, PR, SC, RS |
| quem_faz | Analista fiscal sênior |
| onde_é_feita_hoje | Planilha, core, consultorias de conteúdo |
| entradas / saídas | XMLs + tabela de ST da UF → ST devida/retida/a recolher/ressarcível |
| base_legal | RICMS de cada UF e protocolos/convênios `[NÃO VERIFICADO]` (não pesquisado nesta etapa) |
| risco_se_falhar | Recolhimento a menor; crédito de ressarcimento perdido |
| tempo_estimado | `[ESTIMATIVA]` 30–60 min/mês por cliente com ST |
| concorrentes | `[NÃO ENCONTRADO]` nos concorrentes de escritório pesquisados; existem fornecedores de conteúdo tributário (ex.: Systax) [S8] |
| hipótese_automação | Comprar conteúdo tributário (tabelas de ST por NCM/UF) e rodar a regra no XML |
| papel_da_ia | M3 cálculo; M1 **ler** |
| ferramentas_agênticas | `conferir_st(cliente, competencia)` |
| eventos_timesheet | `nfe.st.conferida` |
| fontes_descoberta | [S8] |

### NFE-026 · Calcular DIFAL e antecipação parcial nas entradas interestaduais e gerar a guia

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Conferência tributária |
| atividade | Identificar entradas interestaduais sujeitas a diferencial de alíquota ou antecipação parcial, calcular e emitir a guia estadual |
| descrição | Relatórios de apoio no core leem as entradas interestaduais e calculam a antecipação item a item (ex.: RS, aplicável também ao Simples) [S17]; MG tem contencioso sobre DIFAL/antecipação de optantes do Simples (ADI 5.464 citada) [S17] |
| gatilho_frequência | Mensal (ou por entrada, conforme a UF) |
| porte_alcance | Comércio com compras de outras UFs; Simples e regime normal |
| quem_faz | Analista fiscal |
| onde_é_feita_hoje | Core, portal da Sefaz (guia), planilha |
| entradas / saídas | XMLs de entrada interestaduais → valor por nota + guia |
| base_legal | RICMS de cada UF; ADI 5.464 `[NÃO VERIFICADO status atual]` [S17] |
| risco_se_falhar | Autuação; mercadoria retida em barreira (UFs com cobrança na entrada) |
| tempo_estimado | `[ESTIMATIVA]` 20–40 min/mês por cliente |
| concorrentes | Alterdata (relatório de antecipação parcial RS) [S17] |
| hipótese_automação | Regra por UF de destino versionada; guia gerada por integração ou robô na Sefaz (C-cert) na Etapa 2 |
| papel_da_ia | M3 cálculo; M1 **ler** a regra da UF; M4 **rascunhar** envio da guia ao cliente |
| ferramentas_agênticas | `calcular_difal_antecipacao(cliente, competencia)`, `emitir_guia_estadual(cliente, tipo, valor)`, `enviar_guia(cliente, guia)` |
| eventos_timesheet | `nfe.difal.calculado`, `fiscal.guia.enviada` |
| fontes_descoberta | [S17] · transversal: D2 (guias estaduais) |

### NFE-027 · Conferir ISS (município de incidência) e retenções federais nas NFS-e

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Conferência tributária |
| atividade | Verificar nas NFS-e prestadas e tomadas o município de incidência, ISS retido, IRRF, CSRF e INSS retidos, e o reflexo nas declarações |
| descrição | Municípios de tomadores às vezes exigem retenção fora das hipóteses legais [S22]; erro no campo do município da prestação leva o ISS ao município errado [S22]; tomador precisa declarar serviços recebidos em sistemas municipais (ex.: Niterói) [S22] |
| gatilho_frequência | Mensal |
| porte_alcance | Prestadores e tomadores de serviço |
| quem_faz | Analista fiscal |
| onde_é_feita_hoje | Portais municipais, planilha, core |
| entradas / saídas | XMLs de NFS-e → divergências de retenção; base para EFD-Reinf/DCTFWeb e declarações municipais |
| base_legal | LC 116/2003 (local de incidência) `[NÃO VERIFICADO artigos]`; legislação municipal [S22] |
| risco_se_falhar | ISS pago em dobro ou ao município errado; retenção federal não declarada na EFD-Reinf |
| tempo_estimado | `[ESTIMATIVA]` 15–30 min/mês por cliente |
| concorrentes | Jettax (auditoria de retenção no módulo Serviços) [C6] |
| hipótese_automação | Regras de retenção por serviço (item da lista) e município; divergências alimentam a tarefa da EFD-Reinf (D2) |
| papel_da_ia | M1 **ler** a regra municipal/federal; M3 cálculo |
| ferramentas_agênticas | `auditar_retencoes_nfse(cliente, competencia)` |
| eventos_timesheet | `nfe.retencoes.conferidas` |
| fontes_descoberta | [S22] [C6] · transversal: D2 (EFD-Reinf, DCTFWeb) |

### NFE-028 · Verificar a regularidade cadastral dos emitentes (idoneidade) na data da operação

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Risco |
| atividade | Consultar situação do CNPJ e da IE do fornecedor e guardar a prova da consulta na data da compra |
| descrição | Tribunais administrativos têm aceitado a boa-fé quando o adquirente comprova consultas ao Sintegra e à Junta na data das operações [S18]; outros glosam créditos de fornecedores declarados inaptos (ICMS e PIS/COFINS no CARF) [S18] |
| gatilho_frequência | Por fornecedor novo / mensal |
| porte_alcance | Regime normal com crédito de ICMS/PIS/COFINS |
| quem_faz | Analista fiscal |
| onde_é_feita_hoje | Sintegra, CCC, consulta CNPJ, manual |
| entradas / saídas | CNPJs dos emitentes → situação na data + comprovante guardado |
| base_legal | RICMS de cada UF (inidoneidade) [S18] |
| risco_se_falhar | Glosa do crédito, multa |
| tempo_estimado | `[ESTIMATIVA]` 2 min por fornecedor |
| concorrentes | `[NÃO ENCONTRADO]` em concorrentes de escritório |
| hipótese_automação | Consulta automática de situação cadastral por emitente novo (Etapa 2: CCC/Sintegra/consulta CNPJ), com carimbo de data e arquivo da prova |
| papel_da_ia | M2 **ler**; M4 **executar** a consulta (só leitura) |
| ferramentas_agênticas | `consultar_situacao_emitente(cnpj, ie, data)`, `guardar_prova(cliente, consulta)` |
| eventos_timesheet | Agregado `nfe.emitentes.verificados` |
| fontes_descoberta | [S18] · transversal: D1 (consulta de cadastro) |

### NFE-029 · Tratar notas canceladas e denegadas antes do fechamento

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Conferência |
| atividade | Garantir que canceladas e denegadas não entram como válidas e que são informadas onde o leiaute pede |
| descrição | Canceladas e denegadas precisam ser escrituradas e armazenadas conforme a situação [S24]; no SPED Fiscal e no EFD-Contribuições o tratamento difere (fonte de fórum) [S24] |
| gatilho_frequência | Mensal |
| porte_alcance | Todos |
| quem_faz | Analista fiscal |
| onde_é_feita_hoje | Core, ferramenta de captura |
| entradas / saídas | Status na Sefaz → lista para ajuste no core |
| base_legal | Guia prático da EFD `[NÃO VERIFICADO]` |
| risco_se_falhar | Receita ou crédito indevidos |
| tempo_estimado | `[ESTIMATIVA]` 5–10 min/mês por cliente |
| concorrentes | Qive/Arquivei (conteúdo sobre denegadas e canceladas) [S24] |
| hipótese_automação | Status vem dos eventos (NFE-018); exportação ao core já leva a situação |
| papel_da_ia | Nenhum (determinístico) |
| ferramentas_agênticas | `listar_canceladas_denegadas(cliente, competencia)` |
| eventos_timesheet | — (incluído em `nfe.evento.ajustado`) |
| fontes_descoberta | [S24] |

### NFE-030 · Conferir os grupos de IBS/CBS (CST, cClassTrib, alíquotas-teste) nas NF-e/NFC-e do cliente

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Reforma tributária |
| atividade | Verificar se as notas do cliente trazem o grupo IBS/CBS preenchido, com par CST × cClassTrib coerente, e orientar a correção do emissor |
| descrição | Atividade nova de 2026. O grupo UB da NT 2025.002 reúne IBS (UF e município), CBS, devoluções, créditos e diferimentos; rejeições de grupo mal preenchido exigem conferir CST × cClassTrib [S8]. A rejeição em produção virou "implementação futura" (v1.51) [S8]; alíquotas-teste de 0,1% (IBS) e 0,9% (CBS) [S9] |
| gatilho_frequência | Mensal (2026) e por evento (mudança de leiaute) |
| porte_alcance | Regime normal em 2026; Simples e monofásico a partir de 01/01/2027; não contribuintes de ICMS 01/12/2026 (fonte de set/2026) [S8] |
| quem_faz | Analista fiscal / consultor |
| onde_é_feita_hoje | Planilha, suporte do ERP do cliente |
| entradas / saídas | XMLs de saída → lista de notas sem grupo ou com par inválido + orientação ao cliente/ERP |
| base_legal | LC 214/2025 arts. 343, 346 e 348 (dispensa de recolhimento condicionada às obrigações acessórias; prazo de regularização citado) [S9]; NT 2025.002 [S8] |
| risco_se_falhar | Perda da dispensa de recolhimento em 2026 `[NÃO VERIFICADO texto consolidado do art. 348]` [S9]; penalidades a partir da obrigatoriedade efetiva |
| tempo_estimado | `[ESTIMATIVA]` 15 min/mês por cliente + orientação inicial de 1 h |
| concorrentes | `[NÃO ENCONTRADO]` funcionalidade dedicada nos concorrentes de escritório; conteúdo em Systax, Taxcel, Trivium [S8] |
| hipótese_automação | Validador do grupo IBS/CBS em todo XML de saída com tabela cClassTrib versionada; relatório por cliente e mensagem pronta ao suporte do ERP |
| papel_da_ia | M1 **ler** NT e LC vigentes na data; M3 regra; M4 **rascunhar** orientação |
| ferramentas_agênticas | `validar_ibs_cbs(cliente, competencia)`, `explicar_cclasstrib(codigo, data)`, `gerar_instrucao_erp(cliente, problema)` |
| eventos_timesheet | `reforma.nfe.validacao` (cliente, nº notas com erro) |
| fontes_descoberta | [S8] [S9] · transversal: D6 |

### NFE-031 · Acompanhar a migração do cliente ao Emissor Nacional da NFS-e e os campos de IBS/CBS na NFS-e

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Reforma tributária |
| atividade | Orientar cada prestador sobre quando e como emitir no padrão nacional, e conferir os campos de IBS/CBS das NFS-e |
| descrição | Simples prestador obrigado ao Emissor Nacional em 2026 (datas divergentes: 01/09 pela Res. CGSN 189/2026; 01/11 pela 191/2026) [S5][S6]; NT 004 v2.0 é o leiaute em produção; NT 005 ainda não exigida; sem rejeição por falta de IBS/CBS até 31/12/2026 [S6] |
| gatilho_frequência | Por evento (data de obrigatoriedade por cliente) + mensal |
| porte_alcance | Prestadores de serviço, especialmente Simples e profissionais liberais |
| quem_faz | Analista fiscal / atendimento |
| onde_é_feita_hoje | WhatsApp, e-mail, Portal Nacional |
| entradas / saídas | Perfil do cliente + norma → aviso, passo a passo de acesso e conferência das primeiras notas |
| base_legal | LC 214/2025 art. 62 [S5]; Res. CGSN 189/2026 e 191/2026 `[NÃO VERIFICADO texto original]` [S5][S6]; NT 004/005/007 [S6] |
| risco_se_falhar | Cliente emitindo no sistema errado; nota sem validade; captura quebrada (fonte muda) |
| tempo_estimado | `[ESTIMATIVA]` 30–60 min por cliente na migração |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | "Vigia da lei" cruza a norma com os clientes afetados (Plano 4.2), gera aviso em lote e troca a fonte de captura do cliente (NFE-007) |
| papel_da_ia | M1 **ler**; M2 achar afetados; M4 **rascunhar** avisos em lote |
| ferramentas_agênticas | `clientes_afetados(norma)`, `enviar_aviso_lote(clientes, texto)`, `configurar_captura(cliente)` |
| eventos_timesheet | `reforma.nfse.migracao` (cliente) |
| fontes_descoberta | [S5] [S6] · transversal: D2, D6 |

### NFE-032 · Auditar o cadastro de produtos e a parametrização fiscal do emissor do cliente

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Conferência tributária |
| atividade | Revisar periodicamente NCM, CEST, CST/CSOSN, CFOP e cClassTrib configurados no ERP do cliente, com base nas notas emitidas |
| descrição | Erros nascem na parametrização do ERP do cliente e se repetem em todas as notas; a recomendação é auditoria preventiva de cadastros e parâmetros [S16]; há relatos de emissor que grava CST diferente do informado [S16] |
| gatilho_frequência | Trimestral + onboarding + mudança de leiaute |
| porte_alcance | Emissores de NF-e/NFC-e |
| quem_faz | Analista fiscal sênior / consultoria |
| onde_é_feita_hoje | Planilha exportada do ERP do cliente |
| entradas / saídas | Itens distintos das saídas (código, descrição, NCM, CST, CFOP) → relatório de inconsistências e correções sugeridas |
| base_legal | Ver NFE-023 e NFE-030 |
| risco_se_falhar | Erro sistemático em todas as notas; autuação |
| tempo_estimado | `[ESTIMATIVA]` 2–6 h por cliente por revisão |
| concorrentes | Omie (auditoria de regra tributária no próprio ERP) [C10] |
| hipótese_automação | Extrair o "cadastro observado" dos XMLs e rodar as regras; sugerir NCM por descrição só como rascunho |
| papel_da_ia | M1 + M3; sugestão de NCM por descrição como **rascunhar** com revisão humana obrigatória |
| ferramentas_agênticas | `cadastro_observado(cliente, periodo)`, `auditar_cadastro(cliente)`, `sugerir_ncm(descricao)` |
| eventos_timesheet | `nfe.cadastro.auditado` (cliente, nº itens, nº inconsistências) |
| fontes_descoberta | [S16] [C10] · transversal: D6 (serviço de consultoria) |

---

## E. Envio ao core

### NFE-033 · Organizar e enviar os XMLs ao core (lote, pasta, API)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Envio ao core |
| atividade | Separar os XMLs por empresa e competência e importar no Domínio, Alterdata ou Contmatic |
| descrição | Pasta compartilhada ou ZIP baixado da ferramenta e importado no core. Alterdata tem rotina automática que lê pasta local/rede com subpastas, entradas e saídas, NF-e/CT-e/NFC-e [S21]; para o Domínio, parceiro envia via API Onvio (plano Enterprise do Fiscal.io) [C4] |
| gatilho_frequência | Diária a mensal |
| porte_alcance | Todos |
| quem_faz | Analista fiscal |
| onde_é_feita_hoje | Ferramenta de captura + core |
| entradas / saídas | XMLs → notas importadas no core + relatório de rejeições |
| base_legal | — |
| risco_se_falhar | Notas duplicadas ou faltando no core |
| tempo_estimado | `[ESTIMATIVA]` 10–30 min/mês por cliente com pasta; quase zero com API |
| concorrentes | Fiscal.io (API Onvio) [C4]; HubStrom XMLHub ("envia notas automaticamente para os principais sistemas") [C3]; Jettax (Domínio, Omie, Nibo, Contmatic) [C6] |
| hipótese_automação | Nível F (pasta/leiaute) desde já; A$/B via API Onvio se confirmada pela V3; controle de "o que já foi enviado" por chave |
| papel_da_ia | Nenhum no fluxo; M2 **ler** status |
| ferramentas_agênticas | `exportar_para_core(cliente, competencia, core)`, `status_envio_core(cliente)` |
| eventos_timesheet | `nfe.core.exportado` (cliente, competência, nº) |
| fontes_descoberta | [S21] [C3] [C4] [C6] |

### NFE-034 · Manter o de-para de CFOP, acumuladores e produtos e tratar erros de importação

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Envio ao core |
| atividade | Configurar e ajustar a conversão do CFOP de saída do fornecedor para o CFOP de entrada do cliente, acumuladores e exceções por fornecedor/produto |
| descrição | No Domínio, o erro "não foi encontrada relação de acumulador para o CFOP, CST/CSOSN…" é o mais comum; a correção é em Configuração de Importação (guias CFOPs e Acumuladores), com exceção por fornecedor/produto que exige cadastro prévio [S20]. Alterdata tem casos de nota de entrada importada como saída [S20] |
| gatilho_frequência | Por evento (fornecedor/produto novo); semanal |
| porte_alcance | Todos |
| quem_faz | Analista fiscal |
| onde_é_feita_hoje | Core |
| entradas / saídas | Mensagens de erro de importação → regra de de-para nova |
| base_legal | — |
| risco_se_falhar | Escrituração com CFOP/crédito errado; importação travada |
| tempo_estimado | `[ESTIMATIVA]` 5–15 min por erro; dezenas por mês em clientes novos |
| concorrentes | `[NÃO ENCONTRADO]` de-para mantido fora do core |
| hipótese_automação | Pré-validar o lote contra o de-para conhecido do cliente antes de exportar; sugerir regra nova com base no histórico; para o Domínio, gerar o passo a passo da regra |
| papel_da_ia | M2 histórico; M1 regra de CFOP; M4 **rascunhar** a regra |
| ferramentas_agênticas | `prevalidar_importacao(cliente, lote, core)`, `sugerir_depara_cfop(cliente, cfop_saida, ncm, fornecedor)` |
| eventos_timesheet | `nfe.core.erro_tratado` (cliente, tipo de erro) |
| fontes_descoberta | [S20] |

### NFE-035 · Conferir o que entrou no core contra os XMLs (quantidade e valores)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Envio ao core |
| atividade | Comparar totais por competência (nº de notas, valor contábil, ICMS, PIS/COFINS) do core com os XMLs capturados |
| descrição | O analista confere o livro de entradas/saídas do core com o relatório da ferramenta; diferença aparece só no SPED ou na malha |
| gatilho_frequência | Mensal (antes de gerar as obrigações) |
| porte_alcance | Todos |
| quem_faz | Analista fiscal |
| onde_é_feita_hoje | Core, planilha |
| entradas / saídas | Relatório exportado do core × base de XMLs → divergências por nota |
| base_legal | — |
| risco_se_falhar | SPED/EFD divergente; retificação |
| tempo_estimado | `[ESTIMATIVA]` 15–30 min/mês por cliente |
| concorrentes | e-Auditoria (XML × SPED) [C5] `[NÃO VERIFICADO detalhe]` |
| hipótese_automação | Ler o relatório exportado do core (F) ou o SPED gerado e cruzar por chave |
| papel_da_ia | M3 cruzamento; M2 **ler** |
| ferramentas_agênticas | `conferir_core_x_xml(cliente, competencia, arquivo_core)` |
| eventos_timesheet | `nfe.core.conferido` |
| fontes_descoberta | [C5] · transversal: D2 (conferência antes da transmissão) |

---

## F. Guarda, atendimento e manutenção

### NFE-036 · Guardar os XMLs pelo prazo legal e entregar pacotes (cliente, fiscalização, saída do cliente)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Guarda |
| atividade | Manter os XMLs íntegros e localizáveis pelo prazo de guarda e gerar pacotes sob demanda |
| descrição | Os XMLs ficam espalhados em ferramenta de captura, core e pastas; na intimação ou na saída do cliente, alguém junta tudo. A guarda é responsabilidade do contribuinte [S13] |
| gatilho_frequência | Contínua; por evento (intimação, offboarding, troca de ferramenta) |
| porte_alcance | Todos |
| quem_faz | Analista fiscal / gestor |
| onde_é_feita_hoje | Ferramenta de captura (cofre), servidor, nuvem |
| entradas / saídas | XMLs + eventos → acervo indexado; ZIP por período/CNPJ |
| base_legal | Ajuste SINIEF 2/2025 (132 meses, desde 01/05/2025) versus leitura de 5 anos para contribuintes e decadência do CTN art. 173 [S13] |
| risco_se_falhar | Impossibilidade de comprovar crédito em fiscalização; perda do cliente na troca de ferramenta |
| tempo_estimado | `[ESTIMATIVA]` 1–4 h por pedido de pacote sem cofre |
| concorrentes | SIEG Cofre [C1]; Qive (armazenar e consultar) [C2]; HubStrom (armazenamento com trilha de auditoria) [C3] |
| hipótese_automação | Cofre próprio com retenção configurável (decisão 5 ou 11 anos pela Etapa 2), integridade (hash), exportação por filtro e entrega pelo portal |
| papel_da_ia | M4 **executar** geração de pacote (leitura) |
| ferramentas_agênticas | `exportar_pacote_xml(cliente, periodo, tipos)`, `politica_retencao(cliente)` |
| eventos_timesheet | `nfe.pacote.entregue` (cliente, motivo) |
| fontes_descoberta | [S13] [C1] [C2] [C3] · transversal: D1 (offboarding), D2 (intimações) |

### NFE-037 · Atender pedidos do cliente sobre notas (2ª via, "chegou a nota?", relatório de compras e vendas)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Atendimento |
| atividade | Responder pedidos de DANFE/XML, status de notas e relatórios por fornecedor, produto ou período |
| descrição | Pedidos chegam pelo WhatsApp e consomem o analista fiscal; HubStrom destaca relatórios compartilháveis com clientes [C3] |
| gatilho_frequência | Diária |
| porte_alcance | Todos |
| quem_faz | Atendimento / analista fiscal |
| onde_é_feita_hoje | WhatsApp, e-mail, ferramenta de captura |
| entradas / saídas | Pergunta → arquivo ou relatório enviado |
| base_legal | — |
| risco_se_falhar | Tempo do analista; insatisfação |
| tempo_estimado | `[ESTIMATIVA]` 3–10 min por pedido |
| concorrentes | HubStrom (relatórios compartilhados) [C3]; SIEG (painel) [C1] |
| hipótese_automação | O chat do cliente (WhatsApp) responde direto com o arquivo, dentro da permissão do cliente; casos fora do padrão vão ao analista |
| papel_da_ia | M2 **ler**; M4 **executar** envio de documento do próprio cliente (baixo risco) |
| ferramentas_agênticas | `localizar_nota(chave_ou_filtro)`, `gerar_danfe(chave)`, `relatorio_notas(cliente, filtro)`, `enviar_documento(cliente, arquivo)` |
| eventos_timesheet | `atendimento.pedido_nota` (cliente, resolvido por IA/pessoa, minutos) |
| fontes_descoberta | [C1] [C3] · transversal: D7 |

### NFE-038 · Cobrar do cliente os documentos fiscais que faltam

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Atendimento |
| atividade | Pedir e lembrar o cliente das notas, XMLs, faturas e PDFs que faltam para fechar a competência |
| descrição | Mensagens repetidas por WhatsApp e e-mail no início do mês; o analista controla de cabeça ou em planilha quem já mandou |
| gatilho_frequência | Mensal (dias 1 a 10) + por pendência |
| porte_alcance | Todos |
| quem_faz | Atendimento / analista |
| onde_é_feita_hoje | WhatsApp, e-mail, planilha |
| entradas / saídas | Pendências de NFE-005, 008, 012, 020, 021 → mensagem com a lista exata + lembretes |
| base_legal | Contrato de honorários (prazo de entrega de documentos) `[NÃO VERIFICADO]` |
| risco_se_falhar | Atraso de obrigações; trabalho em cima do prazo |
| tempo_estimado | `[ESTIMATIVA]` 5–10 min por cliente por mês |
| concorrentes | Acessórias, Gestta e Onvio Processos têm solicitação de documentos e portal do cliente `[NÃO VERIFICADO nesta busca]` |
| hipótese_automação | Lista de pendências gerada pelas conferências; mensagem única e lembrete escalonado; baixa automática quando o documento chega |
| papel_da_ia | M2 **ler** pendências; M4 **executar** lembretes padrão aprovados uma vez, **rascunhar** os fora do padrão |
| ferramentas_agênticas | `pendencias_documentais(cliente, competencia)`, `solicitar_documentos(cliente, lista)`, `agendar_lembrete(cliente, data)` |
| eventos_timesheet | `atendimento.cobranca_documento` (cliente, nº itens, canal) |
| fontes_descoberta | — · transversal: D5, D7 |

### NFE-039 · Emitir notas fiscais pelo cliente (por demanda)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Emissão |
| atividade | Emitir NFS-e ou NF-e em nome de clientes pequenos (MEI, profissionais liberais) que pedem ao escritório |
| descrição | Comum com MEI e prestadores pequenos; o analista entra no Emissor Nacional ou no portal da prefeitura com o acesso do cliente |
| gatilho_frequência | Por evento |
| porte_alcance | MEI, Simples prestadores de serviço |
| quem_faz | Atendimento / analista |
| onde_é_feita_hoje | Emissor Nacional NFS-e, portais municipais |
| entradas / saídas | Pedido do cliente (tomador, valor, serviço) → NFS-e emitida e enviada |
| base_legal | LC 214/2025 art. 62; Res. CGSN sobre Emissor Nacional [S5][S6] |
| risco_se_falhar | Nota errada em nome do cliente; responsabilidade do escritório |
| tempo_estimado | `[ESTIMATIVA]` 5–10 min por nota |
| concorrentes | Emissores via integrador (Focus NFe, PlugNotas, NFE.io, eNotas citados no Plano) `[NÃO VERIFICADO nesta busca]` |
| hipótese_automação | Avaliar na triagem (P3 no Plano): integrador de emissão (B) e fluxo "cliente pede no WhatsApp → rascunho → aprovação do cliente → emissão" |
| papel_da_ia | M4 **rascunhar** a nota; **executar** só com aprovação explícita do cliente e do analista |
| ferramentas_agênticas | `rascunhar_nfse(cliente, dados)`, `emitir_nfse(rascunho)` |
| eventos_timesheet | `nfe.emissao.cliente` (cliente, nº) |
| fontes_descoberta | [S5] [S6] |

### NFE-040 · Acompanhar notas técnicas e mudanças de leiaute e comunicar os clientes afetados

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Manutenção |
| atividade | Ler as NTs de NF-e, NFC-e, CT-e, MDF-e e NFS-e e os atos estaduais, decidir o impacto por cliente e avisar |
| descrição | 2025–2026 teve sequência de versões com datas que mudaram (NT 2025.002 até v1.51; NT 004/005/007 da NFS-e; NT 2020.001 v1.60; SAE-NFC-e SP) [S3][S6][S8][S14]. O analista acompanha por blog de fornecedor e grupos |
| gatilho_frequência | Semanal / por publicação |
| porte_alcance | Todos os emissores |
| quem_faz | Coordenador fiscal |
| onde_é_feita_hoje | Portais oficiais, blogs (TecnoSpeed, Systax, Senior), WhatsApp |
| entradas / saídas | NT nova → resumo do que muda, datas, clientes afetados, aviso |
| base_legal | As próprias NTs e Ajustes SINIEF |
| risco_se_falhar | Cliente com notas rejeitadas no dia da mudança; conferências do escritório desatualizadas |
| tempo_estimado | `[ESTIMATIVA]` 1–2 h/semana do coordenador |
| concorrentes | `[NÃO ENCONTRADO]` cruzamento automático NT × clientes nos concorrentes |
| hipótese_automação | Coletor de NTs no "vigia da lei" (Plano 4.2) com versões, datas e extração das regras; atualiza também as regras das conferências NFE-023/030 |
| papel_da_ia | M1 **ler** e resumir com citação; M2 afetados; M4 **rascunhar** avisos |
| ferramentas_agênticas | `detectar_nova_nt(fonte)`, `resumir_nt(nt)`, `clientes_afetados(norma)` |
| eventos_timesheet | `fiscal.norma.analisada` (norma, nº clientes afetados) |
| fontes_descoberta | [S3] [S6] [S8] [S14] · transversal: D2 (FIS-002), D6 |

---

## Funcionalidades de concorrentes nesta aba

Leitura por resumo do buscador (não pelas páginas oficiais); confiança média a baixa. Preços praticamente não encontrados.

| Concorrente | O que foi encontrado | Fonte | Observação |
| --- | --- | --- | --- |
| **SIEG** | Cofre de XML; emissor com painel em tempo real para o contador; planos especiais para escritórios; cadastro com A1, procurador e retroativo de 90 dias; NF-e, CT-e, NFC-e | [C1] | Página oficial não lida; NFS-e e conferência tributária `[NÃO VERIFICADO]`; preço `[NÃO ENCONTRADO]` |
| **Qive (ex-Arquivei)** | Armazenar e consultar XML; consulta em lote; carta de correção; verificação de autenticidade; integração com transportadoras; controle antifraude de notas frias | [C2] | Catálogo de terceiros com dados contraditórios sobre auditoria; preço inicial de R$ 153/mês citado por comparador `[NÃO VERIFICADO]` |
| **HubStrom (XMLHub)** | Captura de notas, busca de NFS-e de saída, busca por chave, relatórios compartilhados com clientes, armazenamento com trilha de auditoria, envio automático aos sistemas de apuração; MonitorHub para obrigações | [C3] | Fontes com aparência promocional (amdjus.com.br) |
| **Fiscal.io Monitor** | Captura na Sefaz com o certificado de cada empresa e entrega ao Domínio pela API Onvio (plano Enterprise) | [C4] | Indica que a API Onvio recebe XMLs de parceiros |
| **e-Auditoria** | Robôs que consultam os webservices e baixam notas contra o CNPJ; validação e conversão em lote para o SPED; conteúdo de monofásico | [C5] [S16] | Cruzamento XML × SPED `[NÃO VERIFICADO]` |
| **Jettax** | Captura de NF-e entrada/saída com A1; NFS-e em 2.200+ municípios (sem certificado, segundo o site); NFC-e em vários estados; guias e auditoria de retenção no módulo Serviços; integração Domínio, Omie, Nibo, Contmatic | [C6] | Números do próprio fornecedor |
| **Kolossus (ASIS)** | Captura de NFS-e em 700+ municípios | [C7] | Nota patrocinada |
| **NFE.io** | Distribuição inbound de NF-e/CT-e por NSU; NFS-e recebidas via Ambiente Nacional com certificado | [C8] | Tem API documentada (útil para a V3 avaliar "comprar vs. construir") |
| **Sovos** | OCR de NFS-e em PDF/imagem integrado ao ERP | [C9] | |
| **Omie** | Auditoria "regra tributária não informada" por produto/NCM/CFOP no próprio ERP | [C10] | ERP do cliente, não do escritório |
| **Alterdata (core)** | Rotina automática de importação de XML por pasta (NF-e, CT-e, NFC-e; entradas e saídas); relatório de antecipação parcial RS | [S21] [S17] | |
| **Domínio (core)** | Importação padrão de XML com guias de CFOP e acumuladores e exceções por fornecedor/produto | [S20] | |
| **Acessórias, Gestta, Onvio Processos** | `[NÃO ENCONTRADO]` funcionalidade de captura ou conferência de XML nesta busca (buscado: "Acessórias Gestta busca automática de notas fiscais XML"; "Onvio documentos fiscais busca automática") | — | São gestores de tarefas/obrigações; a V3 deve confirmar |
| **Veri, e-Kontroll, NSDocs** | `[NÃO ENCONTRADO]` detalhe; NSDocs aparece com página de funcionalidades não lida | [C11] | |

**Leitura de mercado:** a captura de XML de NF-e/CT-e é commodity (vários fornecedores, mesmo webservice). Os espaços menos ocupados, pelo que se encontrou, são: (1) manifestação conclusiva perguntando ao cliente pelo canal de atendimento; (2) conferência de IBS/CBS; (3) pré-validação do de-para do core antes da importação; (4) cruzamento NT/norma × clientes afetados; (5) tudo isso no mesmo chat com o timesheet.

---

## Lacunas

1. **Leitura das fontes primárias não foi possível** (rede bloqueou curl e WebFetch). Tudo precisa ser reconferido nas NTs originais: NT 2014.002 (limites, janela de 90 dias, regra dos 60 dias sem uso), NT 2020.001 v1.60 e Ajuste SINIEF 14/26 (90 dias; a "ciência da emissão em 10 dias" citada pela TOTVS), NT 2015.002 (CT-e; prazos de desacordo de 45 dias e substituto de 60 dias), NT 2025.002 v1.51 (datas de IBS/CBS), NT 004/005/007 da NFS-e, manual das APIs do ADN (caminho exato da URL, limites, eventos).
2. **Distribuição a terceiros de MDF-e, NF3e e NFCom:** `[NÃO ENCONTRADO]` se existe e quem pode consultar.
3. **NFC-e fora de SP:** `[NÃO ENCONTRADO]` serviço oficial de listagem e download para MG, PR, SC e RS (equivalente ao SAE-NFC-e).
4. **Manifestação conclusiva obrigatória por UF/operação** (SP, MG, PR, SC, RS) e penalidades: `[NÃO VERIFICADO]`.
5. **Prazo de guarda (5 × 11 anos)**: conflito entre fontes sobre o alcance do Ajuste SINIEF 2/2025 [S13]; precisa do texto oficial.
6. **Datas do Emissor Nacional para o Simples** (Res. CGSN 189/2026 × 191/2026) e cronograma de obrigatoriedade de IBS/CBS na NFS-e: fontes divergem [S5][S6].
7. **Texto consolidado do art. 348 da LC 214/2025** (alterações pela LC 227/2026 citadas) e se a falta de destaque em 2026 tira a dispensa de recolhimento [S9].
8. **Cancelamento extemporâneo em SP**: norma (DN CAT 02/2015 × 05/2019; Portaria SRE 83/2020) e limite de horas divergentes [S12]; PR, SC e RS não pesquisados.
9. **Regras estaduais de ST, DIFAL e antecipação parcial** (NFE-025/026) não pesquisadas a fundo; candidatas a conteúdo comprado (V3) e à V2.
10. **API Onvio para parceiros** (receber XML, devolver status de importação) e leiautes de importação de Alterdata e Contmatic: existe indício pelo Fiscal.io [C4]; V3 deve confirmar acesso, contrato e preço.
11. **Preços dos concorrentes de captura** (SIEG, Qive, Jettax, e-Auditoria, NFE.io): `[PREÇO NÃO PÚBLICO]` ou `[NÃO ENCONTRADO]`, exceto um valor de comparador para a Qive.
12. **Tempos por atividade**: todos `[ESTIMATIVA]`; levantar com os contadores (volume de notas por cliente, tempo de cobrança de XML, nº de erros de importação por mês).
13. **Captura com certificado do escritório**: a distribuição da NF-e e do ADN exige certificado do mesmo CNPJ raiz do contribuinte [S2][S4]; o escritório só recebe com o próprio certificado via autXML. Falta confirmar se procuração eletrônica (e-CAC ou estadual) permite consultar com o e-CNPJ do escritório. Isso decide a política de guarda de certificados A1 dos clientes (risco jurídico e de segurança).
14. **Malhas estaduais NF × PGDAS-D em SP, MG, PR, SC e RS**: só GO e PE foram encontradas [S15].

---

## Fontes

Todas consultadas em 05/11/2026, pelos resumos do buscador.

**Normas, documentação técnica e órgãos**

- [S1] Distribuição DF-e e uso indevido (NT 2014.002): https://blog.tecnospeed.com.br/nota-tecnica-2014-002-versao-1-10-da-nf-e/ · https://conteudo.fiscal.io/o-que-e-consumo-indevido-na-sefaz-e-como-evitar/ · https://netcpa.com.br/colunas/nf-e-04032022-atualizacao-das-regras-de-uso-indevido-do-web-service-nfedistribuicaodfe-nt-2014002/13214 · https://groups.google.com/g/nfephp/c/ijiXuxjkNi8 (fórum, regra de 60 dias)
- [S2] autXML e distNSU: https://flexdocs.net/guiaNFe/WS.distDFe.consChNFe.html · https://portalspedbrasil.com.br/forum/nf-e-regra-de-distribuicao-via-download-do-xml-nt-2014-002-versao-1-02c-agosto-2020/
- [S3] Manifestação do destinatário, NT 2020.001 v1.60 e Ajuste SINIEF 14/26: https://documentacao.senior.com.br/exigenciaslegais/noticias/federal/2026/2026-04-27-nf-e-nota-tecnica-no-2020-001-v-1-60-evento-de-manifestacao-do-destinatario · https://www.totvs.com/blog/fiscal-clientes/nf-e-publicada-versao-1-60-da-nt-2020-001-com-reducao-de-prazo-da-manifestacao-do-destinatario/ · https://portal.sefaz.pb.gov.br/ser/images/e-docs/FAQ_MANIFESTACAO_DESTINATARIO.pdf
- [S4] APIs do ADN (NFS-e): https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/documentacao-atual/manual-contribuintes-apis-adn-sistema-nacional-nfse.pdf · https://pypi.org/project/odoo-addon-l10n-br-nfse-dfe · https://www.projetoacbr.com.br/forum/topic/74320-acesso-%C3%A0-api-para-baixar-as-nfs-e-nacional-adn/
- [S5] NFS-e padrão nacional, obrigatoriedade e adesão: https://jornalcontabil.com.br/noticia/nfs-e-padrao-nacional-passa-a-ser-uma-obrigacao-em-2026/ · https://www.barbieriadvogados.com/?p=3813 · https://www.ey.com/content/dam/ey-unified-site/ey-com/pt-br/campaigns/reforma-tributaria/documents/ey-serie-reforma-tributaria-layouts-da-nfs-e-2026.pdf · https://triviumcontabil.com.br/?p=17554 · https://www.reformatributaria.com/tecnologia/governo-informa-adesao-de-1-472-municipios-a-nfs-e-nacional/
- [S6] NFS-e NT 004/005/007 e IBS/CBS: https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/rtc-producao-restrita-piloto/nt-004-se-cgnfse-novo-layout-rtc-v2-00-20251210.pdf · https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/rtc/nt-007-se-cgnfse-v1-0.pdf · https://www.systax.com.br/?p=42430 · https://notagateway.com.br/blog/nfs-e-padrao-nacional-nota-tecnica-no-007-detalha-ajustes-sobre-ibs-cbs-e-pis-cofins/ · https://jornalcontabil.com.br/noticia/governo-define-cronograma-para-incluir-ibs-e-cbs-na-nfs-e/amp/
- [S7] Falhas do Portal Nacional da NFS-e (jun/2026): https://amdjus.com.br/portal-nota-fiscal-eletronica-usuarios-enfrentam-falhas-no-acesso-a-documentos/
- [S8] NF-e e IBS/CBS (NT 2025.002, cClassTrib): https://www.systax.com.br/?p=42952 · https://taxcel.com.br/ibs-cbs-nota-fiscal-2026-obrigatorio-rejeicao · https://triviumcontabil.com.br/?p=17226 · https://www.lacerdagama.com.br/post/receita-federal-e-comitê-gestor-do-ibs-adiam-a-obrigatoriedade-dos-campos-de-ibs-e-cbs-nas-notas-fis
- [S9] LC 214/2025, 2026 como ano de testes (arts. 343, 346, 348): https://netcpa.com.br/colunas/as-penalidades-que-vao-pesar-no-bolso-de-quem-nao-destacar-ibs-e-cbs-em-2026/26979 · https://guiatributario.net/?p=35103 · https://blog.tecnospeed.com.br/reforma-tributaria-obrigatoriedade-de-ibs-e-cbs/ · https://www.reformatributaria.com/opiniao/ibs-e-cbs-em-2026-como-funciona-a-convivencia-com-os-tributos-atuais-segundo-a-lc-no-214-2025/
- [S10] CT-e: distribuição (NT 2015.002) e desacordo: https://tributos.io/blog/legislacao-e-normas/ctedistribuicaodfe-acesso-facilitado-a-df-e-para-atores-do-ct-e · https://documentacao.senior.com.br/exigenciaslegais/noticias/federal/2024/2024-06-28-nota-tecnica-2015-002-v1-04-atualiza-documentacao-para-atores-ct-e-incluindo-ct-e-os-gtv · https://simplifique.contmatic.com.br/blogs/manifesto-de-cte-em-desacordo-como-fazer-passo-a-passo · https://userapps.support.sap.com/sap/support/knowledge/en/3443016
- [S11] MDF-e, encerramento e rejeições: https://simplifique.contmatic.com.br/blogs/encerramento-de-mdfe-como-encerrar-prazo-2026 · https://atendimento.receita.rs.gov.br/mensagem-de-erro-existe-df-e-nao-encerrado · https://buscadorncm.com.br/mdfe/rejeicoes/686
- [S12] Cancelamento e CC-e: https://simplifique.contmatic.com.br/blogs/cancelar-nfe-carta-correcao · https://legislacao.fazenda.sp.gov.br/Paginas/RC31033_2024.aspx · https://portalsped.fazenda.mg.gov.br/spedmg/export/sites/spedmg/nfe/download/Manual-para-Cancelamento-extemporaneo-de-NF.pdf · https://jornalcontabil.com.br/noticia/nfe-prazo-para-cancelamento-em-todos-os-estados/amp/
- [S13] Prazo de guarda (Ajuste SINIEF 2/2025): https://www.contabeis.com.br/artigos/70492/novo-ajuste-sinief-exige-guarda-de-documentos-fiscais-por-11-anos/ · https://simplifique.contmatic.com.br/blogs/prazo-de-guarda-de-xml-11-anos · https://blog.econeteditora.com.br/padronizado-prazo-de-guarda/
- [S14] SAE-NFC-e de SP: https://www.reformatributaria.com/tecnologia/sefaz-sp-lanca-sistema-para-consulta-e-download-de-nfc-e/ · https://tagdlaw.com.br/sefaz-sp-institui-sistema-de-apoio-para-recuperacao-de-xml-e-chaves-da-nfc-e-via-webservices/ · https://portal.fazenda.sp.gov.br/servicos/nfce/Paginas/saenfce.aspx · https://www.jettax.com.br/blog/nfce-sefaz-sp/
- [S15] Malhas NF × PGDAS-D: https://goias.gov.br/economia/wp-content/uploads/sites/45/2026/07/NOTA_TECNICA_MALHA_128_.pdf · https://goias.gov.br/economia/wp-content/uploads/sites/45/2026/07/NOTA_TECNICA_MALHA_129.pdf · https://www.sefaz.pe.gov.br/Servicos/Programa-de-Conformidade-e-Autorregularizacao-Coopera/Paginas/Segregacao-Indevida-de-Receita.aspx · https://atendimento.receita.rs.gov.br/o-que-e-a-malha-fiscal-pgdas-d · https://www.esimplesauditoria.com/malha-fiscal-no-simples-nacional
- [S16] Monofásico e erros de parametrização: https://www.e-auditoria.com.br/blog/produtos-com-tributacao-monofasica-de-pis-e-cofins/ · https://jornalcontabil.com.br/noticia/erro-invisivel-nas-notas-fiscais-dispara-autuacoes-na-contabilidade/ · https://www.projetoacbr.com.br/forum/topic/85626-erro-225-para-cst-49-no-pis-e-cofins/
- [S17] Antecipação parcial e DIFAL: https://ajuda.alterdata.com.br/fiscalbase/antecipacao-parcial-rs-relatorio-112352425.html · https://ajuda.alterdata.com.br/x/axL8Aw · https://www.contabeis.com.br/forum/tributos-estaduais-municipais/288970/antecipacao-icms-empresas-simples-nacional-em-mg/
- [S18] Inidoneidade e boa-fé: https://www.machadomeyer.com.br/pt/boletim/quarta-camara-julgadora-do-tit-sp-cancela-autuacao-referente-a-creditamento-de-icms-de-notas-fiscais-consideradas-inidoneas · https://www.contabeis.com.br/artigos/6040/empresa-inidonea-nunca-vai-acontecer-comigo/ · https://jus.com.br/artigos/17151/a-ilegalidade-dos-autos-de-infracao-lavrados-em-operacoes-realizadas-com-contribuintes-em-situacao-cadastral-irregular-no-sintegra-sem-previa-publicacao-no-diario-oficial-da-irregularidade
- [S19] Notas frias e emissão contra o CNPJ: https://qive.com.br/blog/notas-frias · https://jornalcontabil.com.br/noticia/emitiram-nota-fiscal-em-meu-nome-o-que-eu-faco/ · https://dootax.com.br/notas-emitidas-para-meu-cnpj/
- [S20] Domínio, importação de XML (suporte oficial): https://suporte.dominioatendimento.com/central/faces/solucao.html?codigo=121 · https://suporte.dominioatendimento.com/central/faces/solucao.html?codigo=921 · https://suporte.dominioatendimento.com/central/faces/solucao.html?codigo=1195 · https://suporte.dominioatendimento.com/central/faces/solucao.html?codigo=859 · Alterdata: https://ajuda.alterdata.com.br/prosofterp/e432-erro-nota-fiscal-de-entrada-apresentada-como-saida-no-historico-do-produto-149130213.html
- [S21] Alterdata, rotina automática e NFC-e: https://ajuda.alterdata.com.br/x/qJyqBQ · https://ajuda.alterdata.com.br/fiscalbase/como-importar-nfce-por-xml-40403653.html
- [S22] ISS retido e serviços tomados: https://www.jettax.com.br/blog/como-tratar-nfs-e-intermunicipais-e-identificar-retencao-de-iss/ · https://contabilidade.com/blog/iss-retido-na-nfs-e-como-preencher-corretamente-no-emissor-nacional/ · https://nfse.niteroi.rj.gov.br/files/manuais/NFSe_declaracao.pdf · https://www.contabeis.com.br/forum/tributos-estaduais-municipais/352462/iss-retido-na-fonte/
- [S23] NF-e do produtor rural: https://www.fazenda.pr.gov.br/Noticia/Adesao-obrigatoria-nota-fiscal-eletronica-do-produtor-rural-e-adiada-para-2026 · https://www.coad.com.br/home/noticias-detalhe/133387/com-obrigatoriedade-para-produtores-rurais-aplicativo-da-nf-e-tem-aumento-de-usuarios-no-rio-grande-do-sul · https://legislacao.sef.sc.gov.br/html/Expo_mo/2025/dec_25_0868_em_25_003.pdf
- [S24] Canceladas, denegadas e validação antes da escrituração: https://academia.arquivei.com.br/wp-content/uploads/2019/02/Material-Evite-erros-fiscais-com-NFes-denegadas-e-canceladas.pdf · https://qive.com.br/blog/nota-fiscal-cancelada-irregularidade-pode-trazer-prejuizo · https://www.jettax.com.br/?p=30145

**Concorrentes**

- [C1] SIEG: https://www.contabeis.com.br/noticias/32568/um-emissor-de-nf-e-que-vai-facilitar-sua-vida/ · https://www.glitter.io/guides/como-atualizar-adicionar-cadastros-sieg
- [C2] Qive: https://www.b2bstack.com.br/product/qive/funcionalidades · https://qive.com.br/blog/arquivo-xml-dicas-para-profissionais · https://qive.com.br/blog/notas-frias-antifraude-arquivei-mf
- [C3] HubStrom XMLHub: https://amdjus.com.br/hubstrom-revoluciona-a-integracao-do-xmlhub-com-os-principais-softwares-de-contabilidade-do-mercado/ · https://amdjus.com.br/hubstrom-revoluciona-a-contabilidade-com-seu-ecossistema-inteligente-integrado/
- [C4] Fiscal.io Monitor + Domínio: https://www.fiscal.io/assets/docs/fiscal-io-monitor-dominio-xmls-direto-no-erp.pdf · https://conteudo.fiscal.io/integracao-dominio-thomson-reuters/
- [C5] e-Auditoria: https://www.e-auditoria.com.br/solucoes/para-integrar/captura-automatica-de-df-e/ · https://www.e-auditoria.com.br/blog/formatar-xml-como-corrigir-editar-e-preparar-arquivos-para-o-sped/
- [C6] Jettax: https://jettax.com.br/modulos/servicos/ · https://www.jettax.com.br/blog/captura-automatica-de-nfc-e-em-quais-estados-a-jettax-ja-busca-documentos/ · https://www.jettax.com.br/blog/captura-automatica-de-nfs-e/
- [C7] Kolossus: https://www.contabeis.com.br/noticias/63581/empresa-poupa-o-tempo-do-contribuinte-ao-automatizar-a-captura-e-armazenamento-de-nfs-e/
- [C8] NFE.io: https://nfe.io/docs/distribuicao/ · https://nfe.io/nfse-recebida/
- [C9] Sovos: https://sovos.com/pt-br/blog/tributos/elimine-erros-de-digitacao-e-riscos-na-escrituracao-de-entrada-das-nfs/
- [C10] Omie: https://ajuda.omie.com.br/pt-BR/articles/17116358-auditoria-regra-tributaria-nao-informada
- [C11] NSDocs: https://nsdocs.com.br/funcionalidades (não lida)

---

## Fichas do ciclo de vida (rodada 3, 6/11/2026)

Rodada feita para a classificação por etapa do ciclo de vida do cliente (**Entrada**, **Manutenção**, **Desligamento**) usada pelos contadores do grupo. As 40 fichas acima são quase todas de Manutenção; a Entrada aparecia só na configuração (NFE-001, NFE-002, NFE-032) e o Desligamento só no pacote de XMLs (NFE-036). As fichas abaixo cobrem o que faltava **neste setor**, sem repetir o que outras abas já cobriram na mesma rodada: credenciamento de emissor e CSC da empresa nova (D2 FIS-107), estoque final e nota de baixa de estoque (D2 FIS-111), encerramento de monitores fiscais (D2 FIS-109), conferência declarado × apurado × pago (D2 FIS-103), acordo de corte e acervo com o contador anterior (D1 SOC-023, SOC-104, SOC-107) e descarte LGPD (D1 SOC-108). As fichas existentes não foram alteradas. Campos extras: `etapa` e `nível_automação (provisório)` (escala do consolidado). Fontes novas `[S25]` a `[S32]` em "Fontes da rodada 3", consultadas em 6/11/2026. Tempos são `[ESTIMATIVA]`.

**Achado que muda a Entrada:** a NT 2014.002 v1.40 (julho de 2026) diz, para as três formas de consulta (distNSU, consNSU e consChNFe), que o documento só fica disponível "nos últimos 90 dias" após a recepção pelo Ambiente Nacional e que "após este período não será possível recuperar a NF-e" [S25]; um fornecedor confirma que documento mais antigo só se obtém com o emitente [S26]. Logo, no dia em que o cliente chega, tudo o que tem mais de 90 dias depende do contador anterior, do cliente ou do fornecedor: a captura do primeiro dia e o pedido do acervo são urgentes, e o A1 obrigatório no app (decisão 1) é o que permite salvar a janela.

### NFE-101 · Salvar a janela de 90 dias e receber o acervo histórico de documentos fiscais do cliente que chega

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Entrada e transição |
| etapa | Entrada |
| atividade | No primeiro dia do cliente, disparar a captura retroativa de tudo o que a distribuição ainda alcança (NF-e, CT-e, NFS-e do ADN) e, para o período anterior, pedir e receber do contador anterior, da ferramenta de captura antiga ou do próprio cliente os XMLs de entrada e saída do período não decaído, conferindo o que chegou contra o que deveria existir |
| descrição | A consulta por NSU e por chave só alcança documentos recebidos pelo Ambiente Nacional nos últimos 90 dias; depois disso a NF-e não é recuperável pelo serviço [S25]; o que for mais antigo só vem do emitente [S26]. Guias de troca de contador listam o "histórico completo de notas fiscais emitidas" entre os documentos a pedir e dizem que o de exportação muitas vezes não vem no pacote padrão (fonte comercial) [S30]. A Res. CFC 1.590/2020 manda o distrato prever forma e prazo de devolução de documentos e arquivos (D1 [F62]). Hoje os XMLs chegam em ZIPs incompletos, semanas depois, e ninguém confere a lacuna até a primeira fiscalização |
| gatilho_frequência | Por evento (cliente novo vindo de outra contabilidade; também empresa que troca de ferramenta de captura) |
| porte_alcance | Clientes que trocam de escritório (todos os regimes) |
| quem_faz | Analista fiscal / onboarding |
| onde_é_feita_hoje | E-mail com o contador anterior, WeTransfer, pen drive, exportação do ERP do cliente |
| entradas / saídas | A1 do cliente (app), data de corte (D2 FIS-102 / D1 SOC-104), ZIPs recebidos → acervo indexado (NFE-036) com mapa de cobertura por mês, modelo e CNPJ: "capturado pela distribuição", "recebido do anterior", "faltando" |
| base_legal | NT 2014.002 v1.40, itens de consNSU e consChNFe (90 dias) [S25]; Res. CFC 1.590/2020, arts. 6º a 10 (D1 [F62]); prazo de guarda [S13] |
| risco_se_falhar | Notas com mais de 90 dias perdidas pela via automática; crédito sem XML para comprovar; período herdado sem prova em fiscalização |
| tempo_estimado | `[ESTIMATIVA]` 1–3 h por cliente, espalhadas por semanas de cobrança |
| concorrentes | Ferramentas de captura fazem a busca retroativa de até 90 dias ao cadastrar o CNPJ (NFE.io [S26], SIEG [C1]); `[NÃO ENCONTRADO]` quem monte o mapa de cobertura do acervo herdado |
| hipótese_automação | Ao receber o A1 no app, disparo imediato de distNSU a partir de NSU zero (respeitando as regras de uso indevido [S1]) e do ADN; carta padrão ao contador anterior com a lista exata de meses e modelos faltantes; upload de ZIP com leitura, deduplicação por chave e validação de assinatura; mapa de cobertura com lacunas por mês |
| papel_da_ia | M2 **ler** o que foi capturado e recebido; M4 **executar** a captura retroativa e **rascunhar** o pedido ao anterior e os lembretes |
| ferramentas_agênticas | `capturar_retroativo(cliente)`, `importar_acervo_zip(cliente, arquivo, origem)`, `mapa_cobertura_xml(cliente, periodo)` |
| eventos_timesheet | `nfe.acervo.recebido` (cliente, origem, nº de XMLs, meses cobertos/faltantes) |
| nível_automação (provisório) | A (distribuição e ADN, com o A1 do cliente, só para os últimos 90 dias) + Próprio (importação e mapa do acervo); o pedido ao anterior é D-assistido |
| fontes_descoberta | [S25] [S26] [S30] [S1] [S13] [C1] · transversal: D1 SOC-023/SOC-104, D2 FIS-102 |

### NFE-102 · Auditar as notas herdadas na entrada (diagnóstico documental e oportunidades)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Entrada e transição |
| etapa | Entrada |
| atividade | Rodar sobre o acervo herdado (NFE-101) as mesmas conferências da rotina: XML × escrituração recebida (notas não escrituradas ou escrituradas em duplicidade, canceladas escrituradas), notas emitidas contra o CNPJ sem desconhecimento, NCM/CST/CFOP, monofásico e ST nas saídas do Simples, retenções de NFS-e; separar o que é herança (linha de corte) do que é oportunidade de recuperação |
| descrição | D1 SOC-022 tira a fotografia das pendências que o fisco já aponta; D2 FIS-103 confere declarações contra apuração e pagamento. Falta o olhar nota a nota, que é onde aparecem o crédito perdido e o erro que vira malha. Fontes de mercado descrevem a revisão de monofásico como extrair os XMLs de entrada e saída dos últimos cinco anos e cruzar NCM e CST [S32]; o prazo de cinco anos para pedir restituição é atribuído ao art. 168 do CTN [S32]. Achados viram relatório assinado pelo cliente e proposta comercial de recuperação |
| gatilho_frequência | Por evento (cliente novo com histórico) |
| porte_alcance | Clientes que trocam de escritório; maior valor no Simples com revenda de monofásicos, ST e serviços com retenção |
| quem_faz | Analista fiscal sênior / consultoria |
| onde_é_feita_hoje | Planilhas, ferramenta de auditoria de XML contratada à parte, ou não é feita |
| entradas / saídas | Acervo (NFE-101), escrituração/arquivos recebidos do anterior (SPED, PGDAS) → relatório "herança × oportunidade" por período, tarefas de regularização (D2 FIS-106) e proposta de recuperação (T16) |
| base_legal | CTN art. 168 (prazo de restituição, citado por [S32]); regras das conferências NFE-023 a NFE-027 e [S16] |
| risco_se_falhar | Escritório assume passivo de notas mal escrituradas pelo anterior; crédito de monofásico prescrevendo; nota fria antiga sem contestação |
| tempo_estimado | `[ESTIMATIVA]` 2–6 h por cliente sem ferramenta; minutos com as conferências já automatizadas |
| concorrentes | e-Auditoria e Econet oferecem recuperação de PIS/Cofins monofásico do Simples [S32]; `[NÃO ENCONTRADO]` produto que rode o diagnóstico documental como etapa do onboarding |
| hipótese_automação | Reaproveitar os motores de NFE-016, 020, 021, 023, 024, 027 em modo "retroativo" sobre o acervo, com marcação automática de período herdado; relatório e minuta de proposta gerados |
| papel_da_ia | M2 **ler**; M1 **ler** regra vigente em cada data (base temporal); M3 **calcular** o valor recuperável; M4 **rascunhar** relatório e proposta |
| ferramentas_agênticas | `auditar_acervo_herdado(cliente, ate_data_corte)`, `estimar_recuperacao(cliente, tipo)`, `gerar_relatorio_heranca(cliente)` |
| eventos_timesheet | `nfe.diagnostico_entrada.gerado` (cliente, nº de achados, valor estimado) |
| nível_automação (provisório) | Próprio (sobre os XMLs já reunidos) |
| fontes_descoberta | [S16] [S32] · transversal: D1 SOC-022, D2 FIS-103/FIS-104/FIS-106, D6 (recuperação de créditos) |

### NFE-103 · Montar a parametrização de entrada do cliente no core (de-para, acumuladores, produtos e fornecedores)

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Entrada e transição |
| etapa | Entrada |
| atividade | Antes da primeira importação de XML do cliente novo, montar no core o de-para de CFOP e acumuladores, as exceções por fornecedor e produto e o cadastro inicial de fornecedores, partindo do histórico de notas (NFE-101) e de um perfil-modelo por regime e atividade |
| descrição | O suporte da Domínio orienta copiar parâmetros e cadastros de outra empresa já existente ao cadastrar uma nova (ex.: de um Simples para outro) e permite perfis como "Comércio do Simples Nacional" [S29]. Na prática, a primeira competência de um cliente novo concentra os erros de importação e de acumulador que NFE-034 trata na rotina [S20]; a parametrização do contador anterior raramente vem junto (cores diferentes) `[NÃO VERIFICADO]` |
| gatilho_frequência | Por evento (cliente novo; mudança de regime ou de atividade) |
| porte_alcance | Todos com movimento fiscal |
| quem_faz | Analista fiscal |
| onde_é_feita_hoje | Core (cópia de empresa-modelo), planilhas de de-para |
| entradas / saídas | Histórico de XMLs (CFOPs, NCMs, fornecedores mais frequentes), perfil do cliente → proposta de de-para e acumuladores, carga no core, lista do que ficou sem regra |
| base_legal | — (parametrização interna) |
| risco_se_falhar | Primeira competência importada errada; retrabalho e atraso na primeira apuração do cliente |
| tempo_estimado | `[ESTIMATIVA]` 1–2 h por cliente novo |
| concorrentes | Cópia de empresa-modelo dentro da Domínio [S29]; `[NÃO ENCONTRADO]` proposta de de-para gerada do histórico de XML |
| hipótese_automação | Estatística do histórico (CFOP × NCM × fornecedor) gera a proposta de de-para sobre o perfil-modelo; o analista aprova; carga pela API de entrada da Domínio ou pelo ePlugin onde existir, senão arquivo/roteiro (T14) |
| papel_da_ia | M2 **ler** o histórico; M1 **ler** o tratamento por regime; M4 **rascunhar** o de-para e **executar** a carga após aprovação |
| ferramentas_agênticas | `propor_de_para_inicial(cliente)`, `aplicar_perfil_modelo(cliente, perfil)` |
| eventos_timesheet | `nfe.parametrizacao_inicial.concluida` (cliente, nº de regras, por IA/pessoa) |
| nível_automação (provisório) | Próprio (proposta) + F (carga no core; B onde a API do core aceitar cadastros, a confirmar) |
| fontes_descoberta | [S20] [S29] · transversal: NFE-034, D5 (parametrização do core) |

### NFE-104 · Fechar a competência de corte das notas e passar as pendências documentais ao novo contador

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Desligamento |
| etapa | Desligamento |
| atividade | Quando o cliente sai para outra contabilidade: fechar a captura e as conferências até a competência de corte, listar o que fica pendente (manifestações ainda no prazo, notas só com resumo, saídas não recebidas do cliente, lacunas de numeração a inutilizar, cancelamentos e CC-e posteriores ao corte que alteram competências já entregues) e entregar ao sucessor junto com o pacote de XMLs (NFE-036) |
| descrição | Pela Res. CFC 1.590/2020, o escritório que sai cumpre as acessórias de competência ocorrida na vigência do contrato e comunica ao novo responsável técnico os fatos que ele deva saber (D1 [F62]; D2 [R3-1]). No setor de notas isso tem conteúdo próprio: eventos chegam depois do corte (NFE-018) e a manifestação conclusiva tem prazo que atravessa a troca (NFE-015). Hoje o pacote vai sem lista de pendências |
| gatilho_frequência | Por evento (saída do cliente) |
| porte_alcance | Clientes que saem para outra contabilidade |
| quem_faz | Analista fiscal / gestor |
| onde_é_feita_hoje | E-mail, ZIP, conversa informal com o sucessor |
| entradas / saídas | Data de corte (D1 SOC-107), pendências das fichas NFE-015, 018, 020, 021, 038 → termo de pendências documentais anexo ao protocolo de entrega |
| base_legal | Res. CFC 1.590/2020, arts. 8º a 10 (D1 [F62]); prazo de inutilização citado por fornecedor: 10 dias úteis após o período de apuração [S28] `[NÃO VERIFICADO na norma]` |
| risco_se_falhar | Escritório responde por competência que não fechou; sucessor perde prazo de manifestação ou de inutilização; conflito ético entre substituto e substituído |
| tempo_estimado | `[ESTIMATIVA]` 30–60 min por cliente |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Relatório de pendências gerado das filas já existentes, congelado na data de corte; anexado ao protocolo de entrega (T1) com assinatura do cliente/sucessor |
| papel_da_ia | M2 **ler** as filas; M4 **rascunhar** o termo e **executar** o envio após aprovação |
| ferramentas_agênticas | `pendencias_documentais(cliente, data_corte)`, `exportar_pacote_xml(cliente, periodo, tipos)` |
| eventos_timesheet | `nfe.corte.fechado` (cliente, data de corte, nº de pendências) |
| nível_automação (provisório) | Próprio |
| fontes_descoberta | [S28] · transversal: D1 SOC-024/SOC-107, D2 FIS-108, NFE-036 |

### NFE-105 · Desligar a captura, o autXML e a guarda de XMLs do ex-cliente

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Desligamento |
| etapa | Desligamento |
| atividade | Depois do corte: parar as consultas de distribuição e do ADN com o A1 do ex-cliente, apagar o certificado do coletor, desativar o CNPJ em ferramentas de captura cobradas por CNPJ, pedir ao cliente que retire o CNPJ do escritório do campo autXML do emissor e filtrar os XMLs que continuarem chegando por autXML, e aplicar a política de retenção aos XMLs guardados |
| descrição | O autXML é gravado em cada nota no momento da emissão; o escritório recebe com o próprio certificado todas as notas que trouxerem o seu CNPJ [S31][S2]. Sem o cliente atualizar a lista de autorizados no emissor, o escritório segue recebendo XMLs de quem já não atende `[NÃO VERIFICADO: inferência a partir de S31; nenhuma fonte descreve a revogação]`. D2 FIS-109 cuida dos monitores fiscais e D1 SOC-108 da tabela de temporalidade; esta ficha cobre o que é só do setor de notas |
| gatilho_frequência | Por evento (saída ou baixa) |
| porte_alcance | Todos os clientes que saem |
| quem_faz | Analista fiscal / TI |
| onde_é_feita_hoje | Ferramenta de captura, emissor do cliente, ou não é feita |
| entradas / saídas | Data de corte → coletores desligados, certificado excluído (registro), pedido de remoção do autXML com roteiro por emissor, regra de descarte dos XMLs que chegarem por autXML, prazo de retenção aplicado |
| base_legal | LGPD (via D1 SOC-108); prazo de guarda [S13] |
| risco_se_falhar | Dados fiscais de ex-cliente recebidos e guardados sem base (LGPD); custo por CNPJ em ferramenta paga; consumo com certificado vencido gerando erro na fila |
| tempo_estimado | `[ESTIMATIVA]` 15–30 min por cliente |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Gatilho "cliente inativo" desliga coletores e exclui o A1 do cofre (T7); mensagem com roteiro de remoção do autXML por emissor (V3·I-16); regra no coletor do escritório que descarta e registra XMLs de CNPJ inativo |
| papel_da_ia | M4 **executar** o desligamento (reversível até a data de corte) e **rascunhar** o roteiro ao cliente |
| ferramentas_agênticas | `desligar_captura(cliente, data)`, `roteiro_remover_autxml(cliente, emissor)` |
| eventos_timesheet | `nfe.captura.desligada` (cliente, fontes, certificado excluído) |
| nível_automação (provisório) | Próprio (desligar coletores e cofre) + D-assistido (remoção do autXML é feita pelo cliente no emissor) |
| fontes_descoberta | [S2] [S13] [S31] · transversal: D1 SOC-024/SOC-108, D2 FIS-109 |

### NFE-106 · Fechar o acervo de documentos fiscais na baixa da empresa ou do estabelecimento

| Campo | Conteúdo |
| --- | --- |
| aba / subárea | Notas fiscais / Desligamento |
| etapa | Desligamento |
| atividade | Antes e depois da baixa: conferir a sequência das notas emitidas e inutilizar as lacunas, garantir MDF-e encerrados, conferir a última NFS-e e o cancelamento de notas pendentes; depois da baixa, vigiar notas emitidas contra o estabelecimento baixado (fornecedores, energia, telecom), orientar a troca de titularidade dos serviços e entregar o acervo final aos sócios |
| descrição | A Sefaz-SP respondeu em 2026 a um caso de notas de fornecedor e de energia (NF3e) emitidas contra filial já baixada: não se opera com estabelecimento sem inscrição regular, o emitente deve regularizar por denúncia espontânea e a consulente deve trocar a titularidade da unidade consumidora [S27]. Fornecedor de software afirma que a inutilização também é exigida no encerramento das atividades e que a extemporânea gera multa estadual [S28] (sem norma citada). A nota de baixa de estoque e o ICMS ficam em D2 FIS-111 |
| gatilho_frequência | Por evento (baixa) |
| porte_alcance | Empresas que encerram (ou fecham filial) |
| quem_faz | Analista fiscal / legalização |
| onde_é_feita_hoje | Emissor do cliente, portais da Sefaz, ou não é feita |
| entradas / saídas | XMLs de saída, MDF-e (NFE-010), data da baixa (D1 SOC-031) → lista de lacunas a inutilizar, MDF-e abertos, alertas de notas pós-baixa, pacote final aos sócios (NFE-036) |
| base_legal | Sefaz-SP, RC 33769/2026 [S27]; MDF-e e bloqueios [S11]; guarda [S13]; demais UFs `[NÃO VERIFICADO]` |
| risco_se_falhar | Multa por lacuna não inutilizada; nota emitida contra CNPJ baixado sem tratamento; sócio sem os XMLs para defesa no prazo de guarda |
| tempo_estimado | `[ESTIMATIVA]` 1–2 h por baixa |
| concorrentes | `[NÃO ENCONTRADO]` |
| hipótese_automação | Checklist de baixa gerado das fichas NFE-010 e NFE-020; manter a distribuição ligada por um período após a baixa (enquanto o A1 valer) para detectar notas pós-baixa e avisar o emitente; pacote final no app do cliente |
| papel_da_ia | M2 **ler**; M1 **ler** regra da UF; M4 **rascunhar** avisos ao cliente e ao emitente |
| ferramentas_agênticas | `checklist_baixa_documentos(cliente)`, `vigiar_notas_pos_baixa(cliente, ate)` |
| eventos_timesheet | `nfe.baixa.acervo_fechado` (cliente, nº de lacunas, notas pós-baixa) |
| nível_automação (provisório) | A (distribuição com o A1 do cliente enquanto válido) + D-assistido (inutilizar e encerrar MDF-e são atos no emissor do cliente) |
| fontes_descoberta | [S11] [S13] [S27] [S28] · transversal: D1 SOC-031/SOC-109, D2 FIS-110/FIS-111 |

### Classificação das 40 fichas por etapa (rodada 3)

| Etapa | Fichas |
| --- | --- |
| Entrada | 001, 002, 024, 032, 034, 101, 102, 103 |
| Manutenção | 001 a 040 (todas) |
| Desligamento | 036, 104, 105, 106 |

Antigo nível D dividido: **D-assistido** NFE-008 (o agente lê PDF/XML enviado e valida; a pessoa só baixa no portal municipal sem integração) e NFE-013 (idem para faturas de energia, telecom e importação). Nenhuma ficha deste setor é D-humano.

### Fontes da rodada 3

Consultadas em 6/11/2026. "Lida" = página baixada e lida; demais, só trecho do buscador.

- [S25] NT 2014.002 v1.40 (julho de 2026), Web Service NFeDistribuicaoDFe, itens de consNSU e consChNFe, 90 dias e "não será possível recuperar a NF-e" (lida): https://www.reformatributaria.com/wp-content/uploads/2026/07/NT2014.002_v1.40-WsNFeDistribuicaoDFe-CNPJ-alfa.pdf
- [S26] NFE.io, FAQ de distribuição NF-e/CT-e (busca retroativa de até 90 dias; documentos mais antigos com o emitente) (lida; fornecedor): https://nfe.io/docs/distribuicao-nfe-cte-faq/index.md
- [S27] Sefaz-SP, Resposta à Consulta Tributária 33769/2026, de 06/05/2026, publicada em 08/09/2026 (notas emitidas para estabelecimento com IE baixada; NF3e e troca de titularidade) (lida): https://rotadajurisprudencia.com.br/wp-content/uploads/2026/09/RC_33769_2026.pdf
- [S28] Contmatic Simplifique, "Inutilização de NF-e" (prazo de 10 dias úteis, encerramento de atividades, multa estadual) (lida; fornecedor, sem norma citada): https://simplifique.contmatic.com.br/blogs/inutilizacao-nfe
- [S29] Domínio (suporte oficial), "Como copiar parâmetros e cadastros de outra empresa?" (trecho): https://suporte.dominioatendimento.com/central/faces/solucao.html?codigo=543
- [S30] Contabilidade Zen (comercial), documentos para trocar de contador (histórico de notas, notas de exportação, memória de ST/DIFAL) (trecho): https://www.contabilidadezen.com.br/blog/documentos-trocar-de-contador-ecommerce-2026/
- [S31] Alterdata NF-Stock, importar notas pela tag autXML com o certificado do contador (trecho): https://ajuda.alterdata.com.br/nfstockbase/nf-stock-importar-notas-de-entrada-e-saida-com-o-certificado-do-contador-pela-tag-autxml · Senior, cadastro de autorizados XML (trecho): https://documentacao.senior.com.br/gestaoempresarialerp/5.10.3/menu_cadastros/f140aut.htm
- [S32] Revisão de monofásico e prazo de cinco anos (fontes de mercado, trechos): https://www.omie.com.br/blog/recuperacao-de-creditos-tributarios/index.md · https://www.e-auditoria.com.br/blog/recuperacao-de-creditos-de-pis-e-cofins-no-simples-nacional/ · https://triviumcontabil.com.br/?p=16525 · https://blog.econeteditora.com.br/recuperador-de-creditos-de-pis-e-cofins-do-simples-nacional-a-nova-solucao-da-econet-para-ganhos-tributarios.md

**Lacunas da rodada 3:** nenhuma fonte descreve a revogação do autXML na troca de contador (NFE-105 é inferência); prazo e obrigatoriedade da inutilização no encerramento só em fonte de fornecedor (NFE-106); regra pós-baixa fora de SP não pesquisada; se a API de entrada da Domínio aceita carga de acumuladores e cadastros (NFE-103) fica para o V3.
