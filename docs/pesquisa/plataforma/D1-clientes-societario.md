# D1 · Descoberta: Clientes, Societário e Legalização

5 de novembro de 2026 · Etapa 1 do [Protocolo de Descoberta](00-protocolo-de-descoberta.md) · agente D1

**Escopo:** cadastro, perfil temporal do cliente, certificados digitais, procurações e autorizações eletrônicas, contratos e honorários, onboarding e offboarding, abertura, alteração e baixa de empresas, REDESIM, Juntas Comerciais, alvarás e licenças (Bombeiros, vigilância sanitária, ambiental), livros e atas. Geografia padrão: federal + SP, MG, PR, SC e RS.

**Como ler:** 46 fichas (`SOC-001` a `SOC-046`) no formato da seção 2.1 do protocolo. Viabilidade técnica, preço e nível de automação ficam para a Etapa 2; aqui só há hipótese. Fontes estão na seção "Referências" com código `[Fnn]`, link e data de consulta. Tudo o que não tem fonte está marcado `[NÃO VERIFICADO]` ou `[ESTIMATIVA]`.

**Convenções usadas nas fichas**

- `papel_da_ia`: motores M1 (legal), M2 (escritório), M3 (cálculo), M4 (ação); níveis **ler**, **rascunhar**, **executar** (executar sempre com cartão de aprovação no chat).
- `eventos_timesheet`: nome do evento no padrão `soc.<objeto>.<verbo>`; todo evento leva setor `Societário/Legalização` (ou `Cadastro`), cliente, usuário ou IA, início, fim e quem aprovou.
- Ferramentas agênticas são propostas de nome e assinatura; o catálogo final sai da Etapa 3.

## Achados que mudam as hipóteses do Plano

1. **A "procuração eletrônica" da RFB virou "Autorizações de Acesso" em 5/12/2025**, e a autorização só passa a valer depois que o autorizado a **confirma** expressamente [F8][F9]. O Plano (seção 4.1) fala em "controle das procurações no e-CAC": agora há uma etapa nova de validação por parte do escritório, que precisa entrar no fluxo. Há relato de limite de 20 autorizações ativas por CPF e recomendação de outorgar ao CNPJ do escritório [F10] (fonte comercial; confirmar na Etapa 2).
2. **Beneficiário final passou a ter formulário próprio (e-BEF) desde 1/1/2026**, pela IN RFB 2.290/2025, com prazo de 30 dias a partir da inscrição ou alteração e atualização anual; o descumprimento pode levar à suspensão do CNPJ após intimação [F20][F21]. Não estava no Plano.
3. **Domicílio Judicial Eletrônico (CNJ)**: cadastro obrigatório para médias e grandes (feito de ofício desde 2024) e regras próprias para ME/EPP; citação por meio eletrônico com prazo de 3 dias úteis para ciência e multa de até 5% do valor da causa [F15][F16]. Não estava no Plano; é rotina de vigilância que o escritório costuma assumir.
4. **Opção pelo Simples na abertura mudou em 2025–2026** (Resolução CGSN 183/2025 e 190/2026, segundo fontes secundárias) [F23][F24]. O fluxo de abertura precisa ler a regra vigente da base legal temporal (M1), não regra fixa no código.
5. **Prevenção à lavagem de dinheiro (Res. CFC 1.721/2024)** cria rotina de identificação de cliente e uma declaração anual de não ocorrência até 31 de janeiro [F1][F2]. É do escritório, mas nasce no cadastro do cliente.
6. **Concorrentes já cobrem bem a parte "operacional simples"** (lembrete de vencimento de certificado, quadro de processos de abertura/alteração, protocolo de entrega) [F27][F28][F29]; não encontramos nenhum que una perfil temporal, autorizações de acesso, PLD e alvarás com IA. É aí que está o diferencial.

---

## A. Cadastro e perfil do cliente

### SOC-001 · Cadastrar cliente a partir do CNPJ

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Clientes / Cadastro |
| `atividade` | Cadastrar o cliente puxando os dados do CNPJ |
| `descrição` | Hoje o atendente consulta o cartão CNPJ no site da RFB, copia razão social, CNAEs, endereço, natureza jurídica e QSA para o sistema de gestão e para o core; regime, folha, ST e particularidades são digitados à mão ou ficam em planilha. Retrabalho em 3 a 5 lugares (gestão, core, planilha, WhatsApp). |
| `gatilho_frequência` | Por evento (cliente novo; abertura concluída) |
| `porte_alcance` | Todos os clientes, inclusive MEI e pessoa física com CPF (produtor rural, autônomo) |
| `quem_faz` | Atendimento / legalização / comercial |
| `onde_é_feita_hoje` | Portal RFB (comprovante de inscrição), core, planilha |
| `entradas` / `saídas` | CNPJ → ficha do cliente com dados cadastrais, CNAEs, QSA, regime, UF/município, flags (folha, ST, filial) |
| `base_legal` | IN RFB 2.119/2022 (CNPJ) [F20] |
| `risco_se_falhar` | Cadastro errado contamina obrigações, guias e o roteamento da IA (regime errado = resposta errada) |
| `tempo_estimado` | 15–30 min por cliente `[ESTIMATIVA]` |
| `concorrentes` | Prática comum de puxar dados do CNPJ em ERPs; não confirmado em páginas de Acessórias/Gestta/Hubstrom `[NÃO VERIFICADO]` |
| `hipótese_automação` | Preencher a ficha pelo CNPJ (dados abertos da RFB, Consulta CNPJ SERPRO ou serviços como BrasilAPI/CNPJ.ws [F57]) e pedir só o que a RFB não tem (regime pretendido, folha, ST, contatos). Exportar cadastro no leiaute do core (nível F). |
| `papel_da_ia` | M2 rascunhar (ficha pré-preenchida) + M4 executar com aprovação (gravar); M1 ler para sugerir obrigações pelos CNAEs |
| `ferramentas_agênticas` | `consultar_cnpj(cnpj)`, `criar_cliente(dados)`, `sugerir_obrigacoes(cliente_id)`, `exportar_cadastro_core(cliente_id, sistema)` |
| `eventos_timesheet` | `soc.cliente.cadastrar` (Cadastro, cliente, duração, IA/pessoa) |
| `fontes_descoberta` | [F20], [F57] |

### SOC-002 · Manter o perfil temporal do cliente

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Clientes / Perfil temporal |
| `atividade` | Registrar com data de vigência regime, CNAEs, sócios, administradores, capital, endereço e inscrições |
| `descrição` | Hoje o histórico fica disperso: alterações contratuais em PDF, regime anotado no core, troca de sócio só no QSA atual. Perguntas como "qual era o regime em 2023" exigem abrir pastas. |
| `gatilho_frequência` | Por evento (toda alteração contratual, opção/exclusão do Simples, mudança de endereço) |
| `porte_alcance` | Todos |
| `quem_faz` | Legalização + fiscal (regime) |
| `onde_é_feita_hoje` | Pastas, core, planilha |
| `entradas` / `saídas` | Ato registrado, termo de opção, comprovante CNPJ → versão nova do perfil com início/fim de vigência e documento de origem |
| `base_legal` | — (modelo interno; espelha a vigência da base legal) |
| `risco_se_falhar` | Cálculo e parecer sobre período passado com dados do presente (ex.: fator R, sublimite, responsabilidade de ex-sócio) |
| `tempo_estimado` | 10–20 min por alteração `[ESTIMATIVA]` |
| `concorrentes` | Nenhum encontrado com perfil versionado no tempo `[NÃO ENCONTRADO]` (buscado em páginas de Acessórias, Gestta, Hubstrom) |
| `hipótese_automação` | Cada ato registrado (SOC-029) gera nova versão automaticamente; detector de divergência compara com o CNPJ (SOC-003) |
| `papel_da_ia` | M2 ler ("perfil do cliente X em 10/03/2024"); M4 rascunhar a nova versão a partir do PDF do ato (extração) |
| `ferramentas_agênticas` | `obter_perfil(cliente_id, data)`, `propor_versao_perfil(cliente_id, documento_id)`, `historico_perfil(cliente_id, campo)` |
| `eventos_timesheet` | `soc.perfil.versionar` |
| `fontes_descoberta` | Plano, seção 1.5 (hipótese) |

### SOC-003 · Vigiar o cadastro do CNPJ na RFB e nos órgãos

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Clientes / Vigilância cadastral |
| `atividade` | Detectar mudança de situação cadastral (inapta, suspensa, baixada) e divergência entre QSA/CNAE/endereço da RFB e o perfil do escritório |
| `descrição` | Em geral só se descobre quando a nota é rejeitada, o banco trava a conta ou a certidão sai positiva. |
| `gatilho_frequência` | Semanal ou mensal (varredura da carteira) |
| `porte_alcance` | Todos |
| `quem_faz` | Legalização / fiscal |
| `onde_é_feita_hoje` | Consulta pontual no site da RFB, Sintegra |
| `entradas` / `saídas` | Lista de CNPJs → alertas por cliente com a divergência e tarefa sugerida |
| `base_legal` | IN RFB 2.119/2022 (hipóteses de inaptidão e suspensão) [F20]; fonte secundária cita IN RFB 2.333/2026 sobre suspensão por inconsistência cadastral `[NÃO VERIFICADO]` [F21] |
| `risco_se_falhar` | Notas rejeitadas, bloqueio bancário, CNPJ inapto por omissão |
| `tempo_estimado` | 2–5 min por cliente por consulta manual `[ESTIMATIVA]` |
| `concorrentes` | Hubstrom MonitorHub monitora situação fiscal e certidões com alerta [F33]; situação cadastral específica `[NÃO VERIFICADO]` |
| `hipótese_automação` | Varredura agendada (dados abertos mensais + consulta pontual), diferenças viram tarefa |
| `papel_da_ia` | M2 ler/rascunhar (explicar a divergência); M1 ler (consequência legal da situação) |
| `ferramentas_agênticas` | `varrer_cadastros(carteira)`, `comparar_perfil_rfb(cliente_id)`, `abrir_tarefa(cliente_id, tipo, prazo)` |
| `eventos_timesheet` | `soc.cadastro.verificar` (IA), `soc.cadastro.corrigir` (pessoa) |
| `fontes_descoberta` | [F20], [F21], [F33] |

### SOC-004 · Cadastrar sócios, administradores e representantes

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Clientes / Pessoas vinculadas |
| `atividade` | Manter ficha de cada pessoa física ligada ao cliente (CPF, qualificação, participação, contatos, e-CPF, nível da conta gov.br, representante legal na RFB) |
| `descrição` | Dados de sócios espalhados entre contratos, WhatsApp e e-mail; é comum não saber quem é o representante legal perante a RFB nem se ele tem gov.br prata/ouro, o que trava autorizações e assinaturas. |
| `gatilho_frequência` | Por evento (entrada de sócio, alteração, onboarding) |
| `porte_alcance` | Todos (o sócio também costuma ser cliente de IRPF) |
| `quem_faz` | Legalização / atendimento |
| `onde_é_feita_hoje` | Planilha, core, pasta |
| `entradas` / `saídas` | Documentos pessoais, QSA → cadastro único da pessoa, ligado a N empresas |
| `base_legal` | LGPD (Lei 13.709/2018) para tratamento dos dados `[NÃO VERIFICADO: link]` |
| `risco_se_falhar` | Assinatura errada em ato, autorização impossível, vazamento de dados pessoais |
| `tempo_estimado` | 10 min por pessoa `[ESTIMATIVA]` |
| `concorrentes` | `[NÃO ENCONTRADO]` como funcionalidade destacada |
| `hipótese_automação` | Pessoa única com vínculos (empresa, papel, %); checklist do que falta (gov.br, e-CPF) e pedido automático pelo WhatsApp |
| `papel_da_ia` | M2 ler ("quais clientes têm o João como sócio?"); M4 rascunhar pedido de documento |
| `ferramentas_agênticas` | `vincular_pessoa(cpf, cliente_id, papel, participacao)`, `listar_pendencias_pessoa(cpf)`, `pedir_documento(destinatario, tipo)` |
| `eventos_timesheet` | `soc.pessoa.cadastrar` |
| `fontes_descoberta` | — |

### SOC-005 · Controlar inscrições estaduais, municipais e o contador responsável

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Clientes / Inscrições |
| `atividade` | Manter IE, inscrição municipal (CCM e similares), regimes especiais e o vínculo do contador responsável em cada cadastro (ex.: CADESP em SP) |
| `descrição` | O contador precisa constar como responsável nos cadastros fiscais; ao entrar ou sair, tem que se vincular ou se desvincular. Em SP, a exclusão do contabilista é feita só pelo próprio profissional pela REDESIM ("Meus Clientes") e replicada ao CADESP [F47]; a Sefaz-SP já notificou 15,4 mil contribuintes sem contabilista registrado [F48]. |
| `gatilho_frequência` | Por evento (onboarding, offboarding, abertura de filial) + conferência anual |
| `porte_alcance` | Contribuintes de ICMS e ISS; varia por UF/município |
| `quem_faz` | Legalização |
| `onde_é_feita_hoje` | Portais Sefaz, prefeituras, REDESIM, DBE (eventos 224/232, relato de fórum `[NÃO VERIFICADO]`) |
| `entradas` / `saídas` | Inscrições, comprovantes → painel de inscrições por cliente com status do vínculo |
| `base_legal` | Regulamentos estaduais e municipais (variam) `[NÃO VERIFICADO]` |
| `risco_se_falhar` | Notificação fiscal; ex-contador continua respondendo ou recebendo intimações |
| `tempo_estimado` | 20–40 min por cliente na entrada/saída `[ESTIMATIVA]` |
| `concorrentes` | `[NÃO ENCONTRADO]` |
| `hipótese_automação` | Tabela de inscrições por UF/município; tarefas automáticas no onboarding/offboarding; consulta pública Sintegra/CADESP para conferir |
| `papel_da_ia` | M2 ler; M1 ler (exigência por UF); M4 rascunhar a tarefa |
| `ferramentas_agênticas` | `listar_inscricoes(cliente_id)`, `verificar_vinculo_contador(cliente_id, orgao)`, `abrir_tarefa(...)` |
| `eventos_timesheet` | `soc.inscricao.vincular`, `soc.inscricao.desvincular` |
| `fontes_descoberta` | [F47], [F48] |

### SOC-006 · Declarar e atualizar o beneficiário final (e-BEF)

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Clientes / Cadastro RFB |
| `atividade` | Identificar e informar os beneficiários finais no e-BEF e atualizar quando mudarem e anualmente |
| `descrição` | Obrigação reforçada pela IN RFB 2.290/2025 (capítulo novo na IN 2.119/2022, vigente desde 1/1/2026): 30 dias a partir da inscrição, da alteração de beneficiários ou da perda da dispensa; atualização anual; assinatura digital dos responsáveis no e-CAC [F20][F21]. Exige montar a cadeia societária (participação direta e indireta, em regra a partir de 25%). |
| `gatilho_frequência` | Por evento (abertura, alteração do QSA) + anual (até o fim do ano-calendário, segundo [F21]) |
| `porte_alcance` | Entidades obrigadas; dispensas a confirmar (fonte da Econet discute ME/EPP) `[NÃO VERIFICADO]` |
| `quem_faz` | Legalização / societário |
| `onde_é_feita_hoje` | e-CAC |
| `entradas` / `saídas` | QSA, contratos de controladoras, documentos de estrangeiros → e-BEF transmitido, recibo arquivado |
| `base_legal` | IN RFB 2.119/2022 com redação da IN RFB 2.290/2025 [F20][F21] |
| `risco_se_falhar` | Suspensão do CNPJ e impedimento de operações bancárias após intimação de 30 dias [F21] |
| `tempo_estimado` | 30 min a 2 h (depende da cadeia) `[ESTIMATIVA]` |
| `concorrentes` | `[NÃO ENCONTRADO]` |
| `hipótese_automação` | Calcular a cadeia de participação a partir do perfil temporal (M3), listar quem é obrigado, abrir tarefa com prazo, guardar recibo; transmissão pelo e-CAC (via Integra Contador só se existir serviço: `[NÃO VERIFICADO]`) |
| `papel_da_ia` | M1 ler (regra e dispensas), M3 (participação indireta), M2 ler; M4 rascunhar |
| `ferramentas_agênticas` | `calcular_beneficiarios_finais(cliente_id, data)`, `abrir_tarefa(...)`, `anexar_recibo(...)` |
| `eventos_timesheet` | `soc.ebef.preparar`, `soc.ebef.transmitir` |
| `fontes_descoberta` | [F20], [F21] |

### SOC-007 · Cadastrar e vigiar o Domicílio Judicial Eletrônico

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Clientes / Comunicações oficiais |
| `atividade` | Garantir o cadastro do cliente no Domicílio Judicial Eletrônico e avisar quando chegar citação ou intimação |
| `descrição` | Médias e grandes foram cadastradas de ofício a partir de dados da RFB após 30/5/2024; ME/EPP com e-mail na REDESIM têm cadastro facultativo, sem ele é obrigatório. Citação eletrônica: 3 dias úteis para confirmar ciência; demais comunicações, 10 dias corridos; multa de até 5% do valor da causa por não confirmar [F15][F16]. Fonte de 2026 cita consolidação pela Res. CNJ 569/2024 `[NÃO VERIFICADO]`. |
| `gatilho_frequência` | Por evento (abertura) + leitura diária ou semanal |
| `porte_alcance` | Todas as PJ privadas (regras por porte) |
| `quem_faz` | Legalização / sócio (escritório costuma só orientar) |
| `onde_é_feita_hoje` | Portal do CNJ; muitas vezes ninguém olha |
| `entradas` / `saídas` | CNPJ → status do cadastro, comunicações recebidas, alerta ao cliente e ao jurídico |
| `base_legal` | CPC art. 246; Res. CNJ 455/2022 [F15][F16] |
| `risco_se_falhar` | Revelia, multa de até 5% do valor da causa [F16] |
| `tempo_estimado` | 5 min por cliente por leitura `[ESTIMATIVA]` |
| `concorrentes` | `[NÃO ENCONTRADO]` em concorrentes contábeis |
| `hipótese_automação` | Checklist no onboarding/abertura; leitura automatizada se houver API do CNJ para terceiros `[NÃO VERIFICADO]`, senão lembrete (nível D) |
| `papel_da_ia` | M1 ler (prazos); M4 rascunhar aviso ao cliente |
| `ferramentas_agênticas` | `verificar_domicilio_judicial(cliente_id)`, `notificar_cliente(cliente_id, modelo)` |
| `eventos_timesheet` | `soc.dje.verificar` |
| `fontes_descoberta` | [F15], [F16] |

---

## B. Certificados digitais

### SOC-008 · Guardar e inventariar certificados digitais (cofre)

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Clientes / Certificados |
| `atividade` | Receber, guardar e catalogar certificados A1 (arquivo + senha) e registrar A3 (token/cartão em poder de quem) de clientes, sócios e do escritório |
| `descrição` | É comum o A1 do cliente circular por e-mail/WhatsApp com a senha, ficar em pasta de rede e ser instalado em várias máquinas. Entidades e o Comitê do eSocial alertam para o risco de compartilhar certificados e recomendam usar procuração [F55][F36]. |
| `gatilho_frequência` | Por evento (onboarding, renovação) |
| `porte_alcance` | Todos os clientes com e-CNPJ; obrigatório para NF-e de entrada, alguns portais estaduais/municipais |
| `quem_faz` | TI / legalização / qualquer setor que precise |
| `onde_é_feita_hoje` | Pasta de rede, máquinas, e-mail |
| `entradas` / `saídas` | .pfx + senha → registro com titular, tipo, AC, validade, usos autorizados; arquivo cifrado |
| `base_legal` | MP 2.200-2/2001 (ICP-Brasil) `[NÃO VERIFICADO: link]`; LGPD |
| `risco_se_falhar` | Uso indevido da identidade do cliente; responsabilidade civil do escritório [F54] |
| `tempo_estimado` | 10 min por certificado `[ESTIMATIVA]` |
| `concorrentes` | Acessórias AC Certifica: painel único de certificados do escritório e dos clientes [F27]; SIEG HüB guarda A1 por cliente [F35]; Omie G.Click controla certificados e procurações [F36] |
| `hipótese_automação` | Cofre cifrado, usado só pelos conectores, nunca exposto à IA nem à tela (Plano, seção 2); upload pelo portal do cliente, leitura automática dos metadados do .pfx |
| `papel_da_ia` | M2 ler metadados (nunca o segredo); M4 rascunhar pedido de envio |
| `ferramentas_agênticas` | `listar_certificados(filtro)`, `registrar_certificado_a3(cliente_id, titular, local)`, `pedir_certificado(cliente_id)` (o upload é só humano) |
| `eventos_timesheet` | `soc.certificado.receber` |
| `fontes_descoberta` | [F27], [F35], [F36], [F54], [F55] |

### SOC-009 · Alertar o vencimento e conduzir a renovação de certificados

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Clientes / Certificados |
| `atividade` | Avisar o cliente antes do vencimento, indicar onde renovar, acompanhar até o novo arquivo chegar ao cofre |
| `descrição` | A1 vale 12 meses (editais públicos, ex. [F59]); A3 de 1 a 3 anos, fontes divergem `[NÃO VERIFICADO]`. Vencido, o certificado para transmissões e capturas [F54]. Muitos escritórios revendem certificado (receita extra) [F27]. |
| `gatilho_frequência` | Diário (varredura) com avisos a 60/30/7 dias `[ESTIMATIVA de régua]` |
| `porte_alcance` | Todos com certificado |
| `quem_faz` | Atendimento |
| `onde_é_feita_hoje` | Planilha, lembrete manual, WhatsApp |
| `entradas` / `saídas` | Validade → mensagens, tarefa, link de compra/agendamento, novo certificado no cofre |
| `base_legal` | — |
| `risco_se_falhar` | Captura de XML parada, obrigação não transmitida, multa por atraso |
| `tempo_estimado` | 10–20 min por renovação, somando idas e vindas `[ESTIMATIVA]` |
| `concorrentes` | Acessórias: lembretes automáticos e aviso direto ao cliente, cashback com parceiro [F27]; Omie G.Click [F36] |
| `hipótese_automação` | Régua automática por WhatsApp/e-mail; parceria com AC (receita); fechar a tarefa quando o novo .pfx for validado |
| `papel_da_ia` | M2 ler; M4 executar o envio da régua (modelo pré-aprovado) |
| `ferramentas_agênticas` | `listar_certificados_vencendo(dias)`, `enviar_lembrete(cliente_id, modelo)`, `validar_certificado(arquivo_id)` |
| `eventos_timesheet` | `soc.certificado.lembrar` (IA), `soc.certificado.renovar` |
| `fontes_descoberta` | [F27], [F36], [F54], [F59] |

### SOC-010 · Registrar quem usou cada certificado

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Clientes / Certificados |
| `atividade` | Manter trilha de uso (quem, quando, para qual serviço) e autorizações de uso por certificado |
| `descrição` | Hoje não há trilha: qualquer máquina com o A1 instalado acessa portais em nome do cliente. |
| `gatilho_frequência` | Contínuo |
| `porte_alcance` | Todos |
| `quem_faz` | Sistema / gestor |
| `onde_é_feita_hoje` | Não é feito |
| `entradas` / `saídas` | Uso pelo conector → log auditável; relatório ao cliente |
| `base_legal` | LGPD (segurança e prestação de contas) `[NÃO VERIFICADO: link]` |
| `risco_se_falhar` | Responsabilização sem prova; incidente sem rastreabilidade [F54] |
| `tempo_estimado` | — (automático) |
| `concorrentes` | `[NÃO ENCONTRADO]` |
| `hipótese_automação` | Todo uso passa pelo conector e gera evento (regra 3 da seção 1.6 do Plano) |
| `papel_da_ia` | M2 ler (auditoria) |
| `ferramentas_agênticas` | `historico_uso_certificado(certificado_id, periodo)` |
| `eventos_timesheet` | `soc.certificado.usar` (sem duração de pessoa; serve à auditoria) |
| `fontes_descoberta` | [F54] |

---

## C. Procurações e autorizações eletrônicas

### SOC-011 · Pedir e acompanhar a autorização de acesso na RFB

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Clientes / Procurações |
| `atividade` | Pedir ao cliente que outorgue "Autorização de Acesso" (ex-procuração eletrônica) ao escritório e acompanhar até ficar ativa |
| `descrição` | Desde 5/12/2025 o sistema se chama "Autorizações de Acesso", no Portal de Serviços da RFB, abas "Concedidas" e "Recebidas" [F8][F9]. O cliente precisa de gov.br prata/ouro ou certificado; o escritório envia passo a passo por WhatsApp, o cliente erra, liga, manda print. Validade máxima de 5 anos (IN RFB 2.066/2022, regra anterior ao sistema novo) [F7]. É pré-requisito do Integra Contador [F3][F4]. |
| `gatilho_frequência` | Por evento (onboarding, vencimento, troca de serviços) |
| `porte_alcance` | Todos os clientes federais (PJ, MEI, PF de IRPF) |
| `quem_faz` | Atendimento / legalização |
| `onde_é_feita_hoje` | e-CAC / Portal de Serviços, WhatsApp |
| `entradas` / `saídas` | CNPJ/CPF do cliente, serviços necessários → autorização ativa, serviços cobertos, validade |
| `base_legal` | IN RFB 2.066/2022 [F7]; mudanças de dez/2025 [F8] (norma da mudança `[NÃO ENCONTRADO]`) |
| `risco_se_falhar` | Escritório sem acesso a caixa postal, DCTFWeb, PGDAS, situação fiscal; automação federal inteira para |
| `tempo_estimado` | 15–45 min por cliente, com idas e vindas `[ESTIMATIVA]` |
| `concorrentes` | Omie G.Click (controle) [F36]; e-Auditoria (conteúdo sobre escalar autorizações) [F10]; Acessórias/Hubstrom: `[NÃO ENCONTRADO]` |
| `hipótese_automação` | Gerar o pedido com a lista exata de serviços, guia em vídeo, acompanhamento pela consulta de procurações (Integra Procurações [F3]) e fechamento automático quando aparecer ativa |
| `papel_da_ia` | M2 ler; M4 executar envio do pedido (modelo aprovado); M1 ler (quais serviços cada atividade exige) |
| `ferramentas_agênticas` | `consultar_autorizacoes(cliente_id)`, `pedir_autorizacao(cliente_id, servicos)`, `abrir_tarefa(...)` |
| `eventos_timesheet` | `soc.autorizacao.pedir`, `soc.autorizacao.acompanhar` |
| `fontes_descoberta` | [F3], [F4], [F7], [F8], [F9], [F10] |

### SOC-012 · Validar autorizações recebidas e controlar escopo e vencimento

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Clientes / Procurações |
| `atividade` | Confirmar no portal as autorizações recebidas pelo escritório e manter painel de validade e serviços cobertos |
| `descrição` | No sistema novo a autorização só vale depois que o autorizado confirma [F8]. Um material comercial fala em limite de 20 autorizações ativas por CPF e prazo de 30 dias para confirmar `[NÃO VERIFICADO]` [F10]. Procurações de 5 anos vencem em lote (as feitas em 2021–2022 vencem em 2026–2027) `[ESTIMATIVA]`. |
| `gatilho_frequência` | Diário (novas a validar) + mensal (vencimentos) |
| `porte_alcance` | Todos |
| `quem_faz` | Responsável técnico / legalização (precisa do certificado do escritório ou do CPF autorizado) |
| `onde_é_feita_hoje` | Portal RFB, planilha |
| `entradas` / `saídas` | Lista de autorizações → validações feitas, painel de vencimento, tarefas |
| `base_legal` | IN RFB 2.066/2022 [F7]; [F8] |
| `risco_se_falhar` | Autorização outorgada mas sem efeito; perda de acesso na véspera de prazo |
| `tempo_estimado` | 2–5 min por autorização `[ESTIMATIVA]` |
| `concorrentes` | Omie G.Click [F36]; demais `[NÃO ENCONTRADO]` |
| `hipótese_automação` | Leitura pela consulta de procurações; validação com credencial do escritório (C-cert ou C-crc, a confirmar na Etapa 2) sempre com aprovação |
| `papel_da_ia` | M2 ler; M4 executar só com aprovação do dono do login |
| `ferramentas_agênticas` | `listar_autorizacoes_pendentes()`, `validar_autorizacao(id)` (aprovação obrigatória), `listar_autorizacoes_vencendo(dias)` |
| `eventos_timesheet` | `soc.autorizacao.validar` |
| `fontes_descoberta` | [F7], [F8], [F10], [F36] |

### SOC-013 · Controlar procurações em outros órgãos

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Clientes / Procurações |
| `atividade` | Pedir, registrar e acompanhar procurações fora da RFB: FGTS Digital (Sistema de Procuração Eletrônica), Sefaz estaduais, prefeituras, Junta Comercial, DET, Conectividade/Caixa |
| `descrição` | Cada órgão tem o próprio sistema. No FGTS Digital, a procuração é feita no SPE com gov.br ou certificado, com escolha de poderes, prazo (até 5 anos) e substabelecimento [F41][F42]. Estados e municípios variam `[NÃO VERIFICADO]`. |
| `gatilho_frequência` | Por evento + vencimento |
| `porte_alcance` | Empregadores (FGTS), contribuintes de ICMS/ISS conforme UF/município |
| `quem_faz` | DP (FGTS), fiscal, legalização |
| `onde_é_feita_hoje` | Portais diversos, planilha |
| `entradas` / `saídas` | → matriz cliente × órgão × status × validade |
| `base_legal` | Manual do SPE/FGTS Digital [F41]; normas estaduais `[NÃO VERIFICADO]` |
| `risco_se_falhar` | Guia de FGTS não emitida; perda de acesso a DTE estadual |
| `tempo_estimado` | 15–30 min por procuração `[ESTIMATIVA]` |
| `concorrentes` | `[NÃO ENCONTRADO]` como matriz única |
| `hipótese_automação` | Matriz única com regra por órgão (quais clientes precisam de quê), pedidos automáticos, nível D onde não houver consulta |
| `papel_da_ia` | M1 ler (exigência por órgão); M2 ler; M4 rascunhar |
| `ferramentas_agênticas` | `matriz_procuracoes(cliente_id)`, `pedir_procuracao(cliente_id, orgao, poderes)` |
| `eventos_timesheet` | `soc.procuracao.pedir`, `soc.procuracao.registrar` |
| `fontes_descoberta` | [F41], [F42] |

### SOC-014 · Orientar a conta gov.br dos sócios

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Clientes / Acessos |
| `atividade` | Fazer o sócio subir a conta gov.br para prata/ouro e vincular o CNPJ, para outorgar autorizações, assinar atos e acessar serviços |
| `descrição` | Pequena, repetitiva e trava muitas outras (autorizações, FGTS Digital, assinatura de atos na Junta). Passo a passo por WhatsApp, chamadas, prints. |
| `gatilho_frequência` | Por evento |
| `porte_alcance` | Sócios e titulares, sobretudo de ME/MEI |
| `quem_faz` | Atendimento |
| `onde_é_feita_hoje` | WhatsApp, telefone |
| `entradas` / `saídas` | → nível da conta registrado na ficha da pessoa (SOC-004) |
| `base_legal` | — |
| `risco_se_falhar` | Atraso em abertura e em autorizações |
| `tempo_estimado` | 10–30 min por pessoa `[ESTIMATIVA]` |
| `concorrentes` | `[NÃO ENCONTRADO]` |
| `hipótese_automação` | Roteiro guiado no WhatsApp com vídeos curtos e verificação final pelo próprio cliente |
| `papel_da_ia` | M4 executar conversa guiada (modelo aprovado); M2 ler |
| `ferramentas_agênticas` | `iniciar_roteiro(cliente_id, roteiro='govbr_prata')` |
| `eventos_timesheet` | `soc.govbr.orientar` |
| `fontes_descoberta` | [F42] (exigência de gov.br prata/ouro) |

---

## D. Contratos, honorários e compliance do escritório

### SOC-015 · Elaborar proposta comercial e precificar

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Clientes / Comercial |
| `atividade` | Levantar o perfil do prospect, definir escopo e calcular o honorário |
| `descrição` | Feita em planilha de precificação com base em regime, número de notas, funcionários, filiais; proposta em Word. A Res. CFC 1.590/2020 exige contrato escrito "nos termos da proposta acordada" [F5]. |
| `gatilho_frequência` | Por evento (lead) |
| `porte_alcance` | Prospects |
| `quem_faz` | Sócio / comercial |
| `onde_é_feita_hoje` | Planilha, Word, e-mail |
| `entradas` / `saídas` | CNPJ, volumes → proposta com escopo e preço |
| `base_legal` | Res. CFC 1.590/2020 [F5] |
| `risco_se_falhar` | Cliente com prejuízo desde o primeiro mês |
| `tempo_estimado` | 1–2 h por proposta `[ESTIMATIVA]` |
| `concorrentes` | Makrosystem: proposta/orçamento, contrato e distrato [F38] |
| `hipótese_automação` | Puxar dados do CNPJ, estimar volume, aplicar tabela de preço; usar o timesheet (custo real de clientes parecidos) para sugerir preço |
| `papel_da_ia` | M2 ler (clientes semelhantes), M3 (preço), M4 rascunhar proposta |
| `ferramentas_agênticas` | `estimar_honorario(perfil)`, `gerar_proposta(prospect_id, escopo)` |
| `eventos_timesheet` | `soc.proposta.elaborar` (setor Comercial) |
| `fontes_descoberta` | [F5], [F38] |

### SOC-016 · Formalizar o contrato de prestação de serviços

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Clientes / Contratos |
| `atividade` | Gerar o contrato com o conteúdo mínimo da norma, colher assinatura eletrônica e arquivar |
| `descrição` | Contrato escrito obrigatório após aceitação da proposta, com identificação das partes, detalhamento dos serviços, cláusulas de rescisão e devolução de documentos [F5][F6]. |
| `gatilho_frequência` | Por evento |
| `porte_alcance` | Todos |
| `quem_faz` | Sócio / administrativo |
| `onde_é_feita_hoje` | Word, assinatura eletrônica avulsa ou papel |
| `entradas` / `saídas` | Proposta aceita → contrato assinado, metadados (valor, data-base de reajuste, escopo) |
| `base_legal` | Res. CFC 1.590/2020 [F5] |
| `risco_se_falhar` | Infração ética; disputa de escopo sem prova |
| `tempo_estimado` | 30–60 min `[ESTIMATIVA]` |
| `concorrentes` | Makrosystem (modelos) [F38]; assinatura via Clicksign/D4Sign/ZapSign (hipótese do Plano) `[NÃO VERIFICADO]` |
| `hipótese_automação` | Modelo com cláusulas da norma, preenchido pela proposta; envio para assinatura eletrônica; metadados estruturados para reajuste e escopo |
| `papel_da_ia` | M1 ler (conteúdo mínimo), M4 rascunhar e executar envio com aprovação |
| `ferramentas_agênticas` | `gerar_contrato(proposta_id)`, `enviar_para_assinatura(documento_id, signatarios)` |
| `eventos_timesheet` | `soc.contrato.gerar`, `soc.contrato.assinar` |
| `fontes_descoberta` | [F5], [F6], [F38] |

### SOC-017 · Controlar o escopo contratado e os serviços extras

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Clientes / Contratos |
| `atividade` | Comparar o que foi feito para o cliente com o que o contrato cobre e cobrar o que estiver fora (alteração contratual, certidão avulsa, IRPF de sócio, notas acima do limite) |
| `descrição` | Extras são feitos e não cobrados porque ninguém confere; o contrato fica no PDF. |
| `gatilho_frequência` | Mensal |
| `porte_alcance` | Todos |
| `quem_faz` | Financeiro / sócio |
| `onde_é_feita_hoje` | Não é feito ou planilha |
| `entradas` / `saídas` | Eventos de tarefa + escopo do contrato → lista de extras faturáveis |
| `base_legal` | Res. CFC 1.590/2020 (serviços detalhados no contrato) [F5] |
| `risco_se_falhar` | Perda de receita |
| `tempo_estimado` | — |
| `concorrentes` | `[NÃO ENCONTRADO]` |
| `hipótese_automação` | Tarefas marcadas por tipo de serviço; regra do contrato decide se é extra; rascunho de cobrança para o D7 |
| `papel_da_ia` | M2 ler, M3 (valor), M4 rascunhar cobrança |
| `ferramentas_agênticas` | `listar_extras(cliente_id, periodo)`, `rascunhar_cobranca_extra(...)` |
| `eventos_timesheet` | Consome eventos de todas as abas |
| `fontes_descoberta` | [F5] |

### SOC-018 · Reajustar honorários e fazer aditivos

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Clientes / Contratos |
| `atividade` | Aplicar o reajuste anual (índice ou negociado), comunicar com antecedência e registrar aditivos de escopo |
| `descrição` | Comunicação antecipada e justificada pesa na aceitação [F58]. Alterdata tem reajuste programado de contratos [F37]. |
| `gatilho_frequência` | Anual (data-base de cada contrato) + por evento |
| `porte_alcance` | Todos |
| `quem_faz` | Sócio / financeiro |
| `onde_é_feita_hoje` | Planilha, sistema financeiro, e-mail |
| `entradas` / `saídas` | Índice (IPCA/IGP-M via SGS do BCB), margem do cliente → carta de reajuste, aditivo |
| `base_legal` | Cláusula contratual |
| `risco_se_falhar` | Margem corroída; cancelamento por comunicação ruim |
| `tempo_estimado` | 15–30 min por cliente `[ESTIMATIVA]` |
| `concorrentes` | Alterdata (reajuste anual automático) [F37] |
| `hipótese_automação` | Calcular reajuste e sugerir valor pela rentabilidade do timesheet; carta personalizada com o que foi entregue no ano |
| `papel_da_ia` | M3 (índice), M2 ler (margem, entregas), M4 rascunhar carta |
| `ferramentas_agênticas` | `calcular_reajuste(cliente_id, indice)`, `rascunhar_carta_reajuste(cliente_id)` |
| `eventos_timesheet` | `soc.contrato.reajustar` |
| `fontes_descoberta` | [F37], [F58] |

### SOC-019 · Cumprir a prevenção à lavagem de dinheiro (PLD)

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Clientes / Compliance do escritório |
| `atividade` | Identificar cliente e beneficiário, classificar risco, registrar operações, comunicar ao COAF o que for suspeito e enviar a declaração anual de não ocorrência |
| `descrição` | Res. CFC 1.721/2024 (revogou a 1.530/2017): declaração de não ocorrência ao CFC até 31 de janeiro do ano seguinte; comunicação de ocorrência ao COAF (24 h citado por fontes secundárias `[NÃO VERIFICADO]`) [F1][F2]. |
| `gatilho_frequência` | Por evento (onboarding, operação atípica) + anual (janeiro) |
| `porte_alcance` | O próprio escritório, para toda a carteira |
| `quem_faz` | Sócio / responsável técnico |
| `onde_é_feita_hoje` | Papel, planilha, sistema do CFC/Siscoaf |
| `entradas` / `saídas` | Cadastro, QSA, sinais de alerta → dossiê do cliente, classificação de risco, comunicação ou declaração |
| `base_legal` | Lei 9.613/1998; Res. CFC 1.721/2024 [F1] |
| `risco_se_falhar` | Penalidades do art. 12 da Lei 9.613/1998 e da resolução [F2] |
| `tempo_estimado` | 15–30 min por cliente novo; 30 min por ano para a declaração `[ESTIMATIVA]` |
| `concorrentes` | `[NÃO ENCONTRADO]` |
| `hipótese_automação` | Dossiê PLD criado no onboarding; sinais de alerta lidos de eventos (troca de sócios frequente, capital incompatível); lembrete anual da declaração |
| `papel_da_ia` | M1 ler (regras), M2 ler (sinais), M4 rascunhar (nunca comunicar ao COAF sem humano) |
| `ferramentas_agênticas` | `avaliar_risco_pld(cliente_id)`, `listar_sinais_alerta(periodo)`, `abrir_tarefa(...)` |
| `eventos_timesheet` | `soc.pld.avaliar`, `soc.pld.declarar` |
| `fontes_descoberta` | [F1], [F2] |

### SOC-020 · Formalizar o tratamento de dados e a carta de responsabilidade

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Clientes / Contratos |
| `atividade` | Incluir cláusulas ou termo de tratamento de dados (LGPD) e colher, no encerramento do exercício, a carta de responsabilidade da administração |
| `descrição` | Prática difundida no setor; a base normativa da carta de responsabilidade não foi conferida nesta busca `[NÃO VERIFICADO]`. |
| `gatilho_frequência` | Por evento (contrato) + anual (fechamento) |
| `porte_alcance` | Todos com escrituração |
| `quem_faz` | Contábil / sócio |
| `onde_é_feita_hoje` | Word, e-mail, papel |
| `entradas` / `saídas` | → documento assinado arquivado |
| `base_legal` | LGPD; norma do CFC sobre carta `[NÃO VERIFICADO]` |
| `risco_se_falhar` | Responsabilidade do contador por informação do cliente sem respaldo |
| `tempo_estimado` | 10 min por cliente `[ESTIMATIVA]` |
| `concorrentes` | Acessórias Protocolo Digital (assinatura com data, hora e IP) serve de meio [F29] |
| `hipótese_automação` | Modelo preenchido, envio em lote para assinatura, controle de quem falta |
| `papel_da_ia` | M4 rascunhar e executar envio em lote com aprovação |
| `ferramentas_agênticas` | `gerar_documento(modelo, cliente_id)`, `enviar_para_assinatura(...)` |
| `eventos_timesheet` | `soc.documento.coletar_assinatura` |
| `fontes_descoberta` | [F29] |

---

## E. Onboarding e offboarding

### SOC-021 · Conduzir o onboarding do cliente

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Clientes / Onboarding |
| `atividade` | Executar o checklist de entrada: documentos, acessos, certificados, autorizações, cadastros no core, apresentação de canais e responsáveis |
| `descrição` | Roteiros de 90 dias (diagnóstico, regularização, estabilização) e checklist único com responsáveis e prazos são recomendados [F56]; Gestta trata onboarding como prática de sucesso do cliente [F32]. Hoje, checklist em planilha e muita cobrança por WhatsApp. |
| `gatilho_frequência` | Por evento (contrato assinado ou abertura concluída) |
| `porte_alcance` | Todos |
| `quem_faz` | Atendimento + um analista de cada setor |
| `onde_é_feita_hoje` | Planilha, sistema de tarefas, WhatsApp |
| `entradas` / `saídas` | Contrato → projeto de onboarding com tarefas por setor, pendências do cliente, cliente "ativo" |
| `base_legal` | — |
| `risco_se_falhar` | Primeiro mês com atraso; churn precoce |
| `tempo_estimado` | 4–12 h por cliente somando setores `[ESTIMATIVA]` |
| `concorrentes` | Gestta (conteúdo e processos) [F32]; Acessórias Gestão de Processos [F28]; Hubstrom TaskHub [F34] |
| `hipótese_automação` | Projeto gerado do perfil (regime, folha, UF) com tarefas condicionais; portal/WhatsApp com lista do que falta; integra SOC-008, 011, 013, 019, 022, 023 |
| `papel_da_ia` | M2 ler (o que falta), M4 executar cobranças de pendência; M1 ler (obrigações do perfil) |
| `ferramentas_agênticas` | `iniciar_onboarding(cliente_id)`, `status_onboarding(cliente_id)`, `cobrar_pendencias(cliente_id)` |
| `eventos_timesheet` | `soc.onboarding.etapa` (por setor) |
| `fontes_descoberta` | [F28], [F32], [F34], [F56] |

### SOC-022 · Fazer o diagnóstico de entrada

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Clientes / Onboarding |
| `atividade` | Levantar pendências herdadas: situação fiscal federal, débitos, omissões de declaração, certidões, parcelamentos, situação no Simples, cadastro e alvarás vencidos |
| `descrição` | Feito à mão em vários portais; serve para proteger o escritório (o que é herança do contador anterior) e para vender regularização. |
| `gatilho_frequência` | Por evento |
| `porte_alcance` | Todos |
| `quem_faz` | Fiscal / legalização |
| `onde_é_feita_hoje` | e-CAC, Sefaz, prefeitura, sites de certidão |
| `entradas` / `saídas` | → relatório de diagnóstico assinado pelo cliente, tarefas de regularização |
| `base_legal` | — |
| `risco_se_falhar` | Escritório assume culpa por passivo anterior |
| `tempo_estimado` | 1–3 h `[ESTIMATIVA]` |
| `concorrentes` | Hubstrom MonitorHub (situação fiscal, certidões, caixa postal) [F33] |
| `hipótese_automação` | Disparar as consultas da aba Fiscal (D2) e cadastrais (SOC-003) e montar o relatório |
| `papel_da_ia` | M2 ler, M1 ler (consequências), M4 rascunhar relatório e proposta de regularização |
| `ferramentas_agênticas` | `diagnostico_entrada(cliente_id)` (orquestra ferramentas de D2) |
| `eventos_timesheet` | `soc.diagnostico.gerar` |
| `fontes_descoberta` | [F33] |

### SOC-023 · Receber o acervo e a responsabilidade do contador anterior

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Clientes / Onboarding |
| `atividade` | Solicitar ao contador anterior livros, balancetes, arquivos de obrigações, senhas e saldos; registrar a data de corte da responsabilidade técnica |
| `descrição` | A Res. CFC 1.590/2020 prevê no distrato a forma e o prazo de devolução de livros, documentos e arquivos; as demonstrações do período cabem ao profissional que sai, salvo acordo [F5][F6]. Na prática é negociação por e-mail com atrasos. |
| `gatilho_frequência` | Por evento |
| `porte_alcance` | Clientes que trocam de escritório |
| `quem_faz` | Contábil / sócio |
| `onde_é_feita_hoje` | E-mail, mídia física, WeTransfer |
| `entradas` / `saídas` | → inventário do acervo recebido, termo de corte, saldos de abertura para o core |
| `base_legal` | Res. CFC 1.590/2020 [F5] |
| `risco_se_falhar` | Responsabilidade sobre período alheio; saldos errados |
| `tempo_estimado` | 1–4 h, espalhadas em semanas `[ESTIMATIVA]` |
| `concorrentes` | `[NÃO ENCONTRADO]` |
| `hipótese_automação` | Carta padrão ao contador anterior, checklist do acervo, lembretes automáticos, upload direto |
| `papel_da_ia` | M1 ler, M4 rascunhar e executar lembretes |
| `ferramentas_agênticas` | `solicitar_acervo(cliente_id, contador_anterior)`, `registrar_corte_responsabilidade(cliente_id, data)` |
| `eventos_timesheet` | `soc.acervo.receber` |
| `fontes_descoberta` | [F5], [F6] |

### SOC-024 · Conduzir o offboarding do cliente

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Clientes / Offboarding |
| `atividade` | Distrato, entrega de documentos com protocolo, revogação de autorizações e procurações, desvinculação como contador responsável (CADESP etc.), devolução ou exclusão de certificados, bloqueio de acessos, último faturamento |
| `descrição` | A norma exige cláusula de devolução de documentos e arquivos [F5]; a desvinculação no CADESP é feita pelo próprio profissional via REDESIM [F47]. Ninguém lembra de revogar tudo. |
| `gatilho_frequência` | Por evento |
| `porte_alcance` | Todos |
| `quem_faz` | Sócio / legalização / financeiro |
| `onde_é_feita_hoje` | Planilha, portais |
| `entradas` / `saídas` | → distrato assinado, protocolo de entrega, lista de revogações feitas, cliente "inativo" com data |
| `base_legal` | Res. CFC 1.590/2020 [F5]; [F47] |
| `risco_se_falhar` | Escritório continua responsável perante o fisco; certificado de ex-cliente no cofre (LGPD) |
| `tempo_estimado` | 2–4 h `[ESTIMATIVA]` |
| `concorrentes` | Acessórias Protocolo Digital (entrega com assinatura) [F29]; Makrosystem (modelo de distrato) [F38] |
| `hipótese_automação` | Projeto inverso do onboarding, gerado das matrizes de procuração, inscrições e certificados |
| `papel_da_ia` | M2 ler (tudo que está vinculado), M4 rascunhar e executar com aprovação |
| `ferramentas_agênticas` | `iniciar_offboarding(cliente_id, data)`, `gerar_pacote_entrega(cliente_id)`, `listar_vinculos_ativos(cliente_id)` |
| `eventos_timesheet` | `soc.offboarding.etapa` |
| `fontes_descoberta` | [F5], [F29], [F38], [F47] |

---

## F. Abertura, alteração e baixa (REDESIM e Juntas)

### SOC-025 · Fazer a consulta de viabilidade e a pré-análise da atividade

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Societário / Abertura |
| `atividade` | Escolher CNAEs, conferir se o endereço permite a atividade, pesquisar nome empresarial e classificar o risco da atividade antes do registro |
| `descrição` | Lei 14.195/2021: consulta prévia de viabilidade locacional, dispensa quando o município não responde, nome empresarial pelo próprio CNPJ, colidência só por identidade [F11][F12]. Integradores estaduais: VRE (SP) [F49], integrador da JUCEMG [F50]; PR, SC e RS `[NÃO ENCONTRADO]` nesta busca. |
| `gatilho_frequência` | Por evento |
| `porte_alcance` | Aberturas, mudanças de endereço e de CNAE |
| `quem_faz` | Legalização |
| `onde_é_feita_hoje` | Portais da Junta/REDESIM, prefeitura |
| `entradas` / `saídas` | Atividade descrita pelo cliente, endereço → CNAEs, protocolo de viabilidade, parecer de risco |
| `base_legal` | Lei 14.195/2021 [F11]; Res. CGSIM 61/2020 (dispensa em casos específicos) [F12] |
| `risco_se_falhar` | Indeferimento, endereço inviável depois do aluguel assinado |
| `tempo_estimado` | 1–2 h + espera de dias `[ESTIMATIVA]` |
| `concorrentes` | Acessórias Gestão de Processos acompanha abertura [F28]; pré-análise de CNAE `[NÃO ENCONTRADO]` |
| `hipótese_automação` | IA sugere CNAEs a partir da descrição (tabela CNAE do IBGE), classifica risco (Res. CGSIM 51 e normas locais) e aponta efeitos tributários (Anexo do Simples, fator R); protocolo continua no portal (C ou D, Etapa 2) |
| `papel_da_ia` | M1 ler (CNAE, risco, Simples), M3 (comparar regimes), M4 rascunhar requerimento |
| `ferramentas_agênticas` | `sugerir_cnaes(descricao)`, `classificar_risco_atividade(cnaes, municipio)`, `abrir_processo_societario(tipo, cliente_id)` |
| `eventos_timesheet` | `soc.abertura.viabilidade` |
| `fontes_descoberta` | [F11], [F12], [F49], [F50] |

### SOC-026 · Preparar e registrar o ato constitutivo

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Societário / Abertura |
| `atividade` | Redigir contrato social, requerimento de empresário ou estatuto; colher assinaturas; protocolar na Junta (ou cartório RCPJ para sociedade simples e associações) |
| `descrição` | Minuta em Word a partir de modelo, assinatura digital dos sócios (JUCEMG exige certificado de PF para atos, segundo fórum `[NÃO VERIFICADO]`), protocolo, pagamento de DARE/taxa. Ato apresentado em até 30 dias da assinatura tem efeitos retroativos; fora do prazo, só a partir do despacho [F39]. Deferimento automático com análise posterior em 2 dias úteis, segundo redação citada do art. 42 da Lei 8.934 [F40] `[NÃO VERIFICADO no Planalto]`. |
| `gatilho_frequência` | Por evento |
| `porte_alcance` | Aberturas |
| `quem_faz` | Legalização |
| `onde_é_feita_hoje` | Word, portal da Junta, assinador |
| `entradas` / `saídas` | Viabilidade aprovada, dados dos sócios → ato registrado (NIRE), cópia arquivada |
| `base_legal` | Lei 8.934/1994; Código Civil; IN DREI aplicáveis [F39][F40] |
| `risco_se_falhar` | Exigências repetidas; ato sem efeito retroativo |
| `tempo_estimado` | 2–4 h de trabalho `[ESTIMATIVA]` |
| `concorrentes` | Makrosystem: cadastros para registro de atos em Juntas (resultado de busca) `[NÃO VERIFICADO]` |
| `hipótese_automação` | Minuta gerada do formulário com cláusulas validadas (M1); coleta de assinatura; prazo de 30 dias controlado |
| `papel_da_ia` | M1 ler, M4 rascunhar minuta; executar envio para assinatura com aprovação |
| `ferramentas_agênticas` | `gerar_minuta_ato(tipo, dados)`, `enviar_para_assinatura(...)`, `controlar_prazo_arquivamento(processo_id)` |
| `eventos_timesheet` | `soc.ato.redigir`, `soc.ato.protocolar` |
| `fontes_descoberta` | [F39], [F40] |

### SOC-027 · Obter CNPJ e inscrições

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Societário / Abertura |
| `atividade` | Preencher o DBE/coleta, acompanhar deferimento e obter inscrição estadual e municipal pelo integrador |
| `descrição` | Pela REDESIM o pedido é processado junto por Junta, Sefaz e RFB em vários estados (ex.: MG) [F18][F50]. Acompanhamento é por consulta manual de protocolo. |
| `gatilho_frequência` | Por evento |
| `porte_alcance` | Aberturas, filiais |
| `quem_faz` | Legalização |
| `onde_é_feita_hoje` | Coletor RFB, integrador estadual, prefeitura |
| `entradas` / `saídas` | → CNPJ, IE, IM, cartão CNPJ |
| `base_legal` | IN RFB 2.119/2022 [F20] |
| `risco_se_falhar` | Empresa sem inscrição para emitir nota |
| `tempo_estimado` | 1 h + espera `[ESTIMATIVA]` |
| `concorrentes` | Acessórias (acompanhamento com aviso ao cliente) [F28] |
| `hipótese_automação` | Consulta automática de andamento do protocolo (C ou B, Etapa 2); ao deferir, dispara SOC-001, 006, 007, 028 |
| `papel_da_ia` | M2 ler, M4 executar consulta e aviso ao cliente |
| `ferramentas_agênticas` | `consultar_andamento(protocolo, orgao)`, `notificar_cliente(...)` |
| `eventos_timesheet` | `soc.abertura.inscricoes` |
| `fontes_descoberta` | [F18], [F20], [F50] |

### SOC-028 · Fazer a opção pelo Simples Nacional e o enquadramento na abertura

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Societário / Abertura |
| `atividade` | Decidir o regime, enquadrar como ME/EPP e fazer a opção dentro do prazo de empresa em início de atividade |
| `descrição` | A regra mudou: até 2025, 30 dias do último deferimento de inscrição, limitados a 60 dias da abertura (Res. CGSN 140/2018 alterada pela 150/2019) [F22]; a Res. CGSN 183/2025 levou a opção para o momento da inscrição e a 190/2026 teria redefinido "início de atividade", segundo fontes secundárias `[NÃO VERIFICADO]` [F23][F24]. |
| `gatilho_frequência` | Por evento |
| `porte_alcance` | Aberturas elegíveis |
| `quem_faz` | Fiscal / legalização / sócio |
| `onde_é_feita_hoje` | Portal do Simples, integrador |
| `entradas` / `saídas` | Perfil, projeção de faturamento e folha → recomendação de regime, termo de opção, pendências a regularizar |
| `base_legal` | LC 123/2006; Res. CGSN 140/2018 e alterações [F22][F23][F24] |
| `risco_se_falhar` | Empresa fora do Simples por um ano (só opção em janeiro) [F22] |
| `tempo_estimado` | 1–3 h com simulação `[ESTIMATIVA]` |
| `concorrentes` | `[NÃO ENCONTRADO]` |
| `hipótese_automação` | Prazo calculado pela regra vigente na base legal; simulação de regimes; alerta de pendência que impede a opção |
| `papel_da_ia` | M1 + M3 + M2 combinados (exemplo típico de cascata), M4 rascunhar recomendação |
| `ferramentas_agênticas` | `simular_regimes(perfil)`, `prazo_opcao_simples(cliente_id)` |
| `eventos_timesheet` | `soc.abertura.regime` |
| `fontes_descoberta` | [F22], [F23], [F24] |

### SOC-029 · Fazer alterações contratuais e cadastrais

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Societário / Alteração |
| `atividade` | Alterar endereço, capital, sócios, administrador, CNAE, nome, tipo jurídico; propagar a todos os órgãos e ao perfil |
| `descrição` | Mesma cadeia da abertura (viabilidade, ato, Junta, RFB, Sefaz, prefeitura, licenças) e depois atualização do core, bancos, cadastro de fornecedores do cliente. Prazo de 30 dias para efeito retroativo [F39]. |
| `gatilho_frequência` | Por evento |
| `porte_alcance` | Todos |
| `quem_faz` | Legalização |
| `onde_é_feita_hoje` | Portais, Word, planilha |
| `entradas` / `saídas` | Pedido do cliente → ato registrado, inscrições atualizadas, nova versão do perfil (SOC-002), e-BEF se mudar (SOC-006), licenças a refazer (SOC-034) |
| `base_legal` | Código Civil; Lei 8.934/1994 [F39] |
| `risco_se_falhar` | Divergência entre órgãos, notas rejeitadas, alvará inválido no novo endereço |
| `tempo_estimado` | 3–8 h de trabalho por alteração `[ESTIMATIVA]` |
| `concorrentes` | Acessórias Gestão de Processos (abertura, alteração e baixa com etapas e avisos) [F28] |
| `hipótese_automação` | Fluxo por tipo de alteração que já gera as tarefas de efeito cascata; extra cobrado (SOC-017) |
| `papel_da_ia` | M1 ler (efeitos, ex.: troca de CNAE muda Anexo), M2 ler, M4 rascunhar plano e minuta |
| `ferramentas_agênticas` | `abrir_processo_societario('alteracao', cliente_id, campos)`, `efeitos_alteracao(cliente_id, mudanca)` |
| `eventos_timesheet` | `soc.alteracao.etapa` |
| `fontes_descoberta` | [F28], [F39] |

### SOC-030 · Acompanhar processos e responder exigências

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Societário / Processos |
| `atividade` | Consultar o andamento nos portais (Junta, RFB, Sefaz, prefeitura, Bombeiros) e responder exigências |
| `descrição` | Consulta manual diária de dezenas de protocolos; exigências por motivos formais repetidos; o cliente pergunta "e aí?" no WhatsApp. |
| `gatilho_frequência` | Diária enquanto houver processo aberto |
| `porte_alcance` | Processos em curso |
| `quem_faz` | Legalização |
| `onde_é_feita_hoje` | Portais, planilha |
| `entradas` / `saídas` | Protocolos → status, exigência, resposta, aviso ao cliente |
| `base_legal` | — |
| `risco_se_falhar` | Processo arquivado por prazo de exigência perdido `[NÃO VERIFICADO: prazo]` |
| `tempo_estimado` | 5 min por protocolo por consulta `[ESTIMATIVA]` |
| `concorrentes` | Acessórias (status, prazos, responsáveis e aviso ao cliente a cada etapa) [F28] |
| `hipótese_automação` | Robô de consulta onde houver consulta pública por protocolo; base de exigências comuns com resposta sugerida |
| `papel_da_ia` | M2 ler, M1 ler (fundamento da exigência), M4 rascunhar resposta e aviso |
| `ferramentas_agênticas` | `consultar_andamento(protocolo, orgao)`, `sugerir_resposta_exigencia(texto)` |
| `eventos_timesheet` | `soc.processo.consultar` (IA), `soc.processo.exigencia` (pessoa) |
| `fontes_descoberta` | [F28] |

### SOC-031 · Encerrar a empresa (baixa)

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Societário / Baixa |
| `atividade` | Distrato ou extinção, baixa de CNPJ, IE e IM, coordenação das obrigações de encerramento e da situação fiscal |
| `descrição` | A LC 147/2014 permite a baixa sem exigir regularidade fiscal; débitos passam aos responsáveis; a baixa da IE não atesta inexistência de débito; QSA divergente pode indeferir [F17][F18]. Em MG, o pedido é processado junto por JUCEMG, SEF-MG e RFB [F18]. Obrigações de encerramento (declarações de extinção) ficam com D2/D5. |
| `gatilho_frequência` | Por evento |
| `porte_alcance` | Todos |
| `quem_faz` | Legalização + fiscal + contábil |
| `onde_é_feita_hoje` | Portais, planilha |
| `entradas` / `saídas` | → distrato registrado, CNPJ baixado, relatório de pendências remanescentes ao cliente, offboarding (SOC-024) |
| `base_legal` | LC 123/2006 com LC 147/2014 [F17]; [F18] |
| `risco_se_falhar` | Débito redirecionado ao sócio sem aviso; inscrições estaduais/municipais esquecidas |
| `tempo_estimado` | 3–10 h `[ESTIMATIVA]` |
| `concorrentes` | Acessórias (processo de baixa) [F28] |
| `hipótese_automação` | Fluxo com checklist por UF/município, diagnóstico de situação fiscal antes, tarefas de obrigações de encerramento para os outros setores |
| `papel_da_ia` | M1 ler, M2 ler, M4 rascunhar plano e relatório |
| `ferramentas_agênticas` | `abrir_processo_societario('baixa', cliente_id)`, `diagnostico_entrada(cliente_id)` (reuso) |
| `eventos_timesheet` | `soc.baixa.etapa` |
| `fontes_descoberta` | [F17], [F18], [F28] |

### SOC-032 · Atender o ciclo de vida do MEI

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Societário / MEI |
| `atividade` | Formalizar, alterar, desenquadrar (excesso de receita, atividade vedada, contratação acima do limite) e baixar MEI; emitir CCMEI |
| `descrição` | Volume alto e baixo valor unitário; pedidos chegam por WhatsApp. O Integra Contador cita serviços de CCMEI e PGMEI (Plano, seção 3.1) `[NÃO VERIFICADO na lista atual]`. |
| `gatilho_frequência` | Por evento |
| `porte_alcance` | MEI |
| `quem_faz` | Atendimento / legalização |
| `onde_é_feita_hoje` | Portal do Empreendedor |
| `entradas` / `saídas` | → CCMEI, comunicação de desenquadramento, migração para ME |
| `base_legal` | LC 123/2006 `[NÃO VERIFICADO: artigos]` |
| `risco_se_falhar` | Tributação retroativa como ME após desenquadramento tardio `[NÃO VERIFICADO]` |
| `tempo_estimado` | 15–45 min `[ESTIMATIVA]` |
| `concorrentes` | Hubstrom MonitorHub cobre PGMEI [F33] |
| `hipótese_automação` | Vigilância do limite de receita (dados da aba Notas) e alerta de desenquadramento; roteiros guiados |
| `papel_da_ia` | M1 + M3 (limite proporcional), M4 rascunhar |
| `ferramentas_agênticas` | `verificar_limite_mei(cliente_id)`, `emitir_ccmei(cliente_id)` |
| `eventos_timesheet` | `soc.mei.etapa` |
| `fontes_descoberta` | [F33] |

### SOC-033 · Abrir filial ou transferir sede entre UFs

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Societário / Alteração |
| `atividade` | Registrar filial (inclusive em outra Junta), obter inscrições, licenças, e tratar efeitos tributários (nova IE, DIFAL, ISS de outro município) |
| `descrição` | Envolve duas Juntas, duas Sefaz e prefeituras diferentes; checklist muda por UF. |
| `gatilho_frequência` | Por evento (raro, crítico) |
| `porte_alcance` | Empresas em expansão |
| `quem_faz` | Legalização + fiscal |
| `onde_é_feita_hoje` | Portais, planilha |
| `entradas` / `saídas` | → filial registrada e integrada ao perfil (estabelecimentos) |
| `base_legal` | Lei 8.934/1994; normas estaduais `[NÃO VERIFICADO]` |
| `risco_se_falhar` | Operação sem inscrição; obrigação estadual não cumprida |
| `tempo_estimado` | 4–12 h `[ESTIMATIVA]` |
| `concorrentes` | `[NÃO ENCONTRADO]` |
| `hipótese_automação` | Checklist por UF de origem/destino, tarefas fiscais derivadas |
| `papel_da_ia` | M1 ler, M4 rascunhar plano |
| `ferramentas_agênticas` | `abrir_processo_societario('filial', cliente_id, uf, municipio)` |
| `eventos_timesheet` | `soc.filial.etapa` |
| `fontes_descoberta` | — |

### SOC-034 · Guardar documentos societários e atender pedidos de documento

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Societário / Documentos |
| `atividade` | Manter o contrato social consolidado, alterações, cartão CNPJ, inscrições, alvarás e certidões vigentes, e enviar ao cliente ou a terceiros (banco, licitação, fornecedor) quando pedirem |
| `descrição` | Pedido muito frequente e pequeno ("me manda o contrato social e o cartão CNPJ"); hoje é busca na pasta e envio por WhatsApp. |
| `gatilho_frequência` | Por evento (várias vezes por semana na carteira) |
| `porte_alcance` | Todos |
| `quem_faz` | Atendimento |
| `onde_é_feita_hoje` | Pasta de rede, WhatsApp, e-mail |
| `entradas` / `saídas` | → documento vigente enviado, registro de envio |
| `base_legal` | — |
| `risco_se_falhar` | Envio de versão desatualizada |
| `tempo_estimado` | 5–10 min por pedido `[ESTIMATIVA]` |
| `concorrentes` | Acessórias GED [F30]; Hubstrom DriveHub e app do cliente [F33] |
| `hipótese_automação` | GED com tipo e vigência; cartão CNPJ e certidões reemitidos na hora; resposta automática no WhatsApp com aprovação |
| `papel_da_ia` | M2 ler, M4 executar envio (documento público) ou rascunhar (documento sensível) |
| `ferramentas_agênticas` | `buscar_documento(cliente_id, tipo, vigente=True)`, `enviar_documento(cliente_id, documento_id, canal)` |
| `eventos_timesheet` | `soc.documento.enviar` |
| `fontes_descoberta` | [F30], [F33] |

---

## G. Alvarás e licenças

### SOC-035 · Mapear as licenças exigidas por cliente

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Legalização / Licenças |
| `atividade` | Determinar, por CNAE, município e porte do estabelecimento, quais atos de liberação são exigidos ou dispensados (alvará, Bombeiros, sanitária, ambiental, conselhos) |
| `descrição` | Lei 13.874/2019 dispensa atos de liberação para baixo risco (Res. CGSIM 51/2019, alterada pela 57) [F13][F60]; estados e municípios podem dispensar mais; a dispensa do alvará não dispensa licença sanitária ou ambiental [F14]; Bombeiros podem ter critério próprio [F13]. |
| `gatilho_frequência` | Por evento (abertura, mudança de endereço ou CNAE) + revisão quando a norma local muda |
| `porte_alcance` | Todos com estabelecimento físico |
| `quem_faz` | Legalização |
| `onde_é_feita_hoje` | Conhecimento do analista, sites das prefeituras |
| `entradas` / `saídas` | → matriz de licenças do cliente com fundamento |
| `base_legal` | Lei 13.874/2019; Res. CGSIM 51/2019 e alterações [F13][F60]; decretos municipais (ex. Curitiba) [F14] |
| `risco_se_falhar` | Interdição, multa municipal, seguro negado `[NÃO VERIFICADO]` |
| `tempo_estimado` | 30–60 min `[ESTIMATIVA]` |
| `concorrentes` | `[NÃO ENCONTRADO]` |
| `hipótese_automação` | Base de regras por município (começar pelos municípios da carteira) na base legal temporal |
| `papel_da_ia` | M1 ler (núcleo), M2 ler, M4 rascunhar tarefas |
| `ferramentas_agênticas` | `mapear_licencas(cliente_id, estabelecimento_id)` |
| `eventos_timesheet` | `soc.licenca.mapear` |
| `fontes_descoberta` | [F13], [F14], [F60] |

### SOC-036 · Obter e renovar o alvará de funcionamento

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Legalização / Licenças |
| `atividade` | Pedir o alvará municipal (ou registrar a dispensa), pagar taxas, controlar validade e renovar |
| `descrição` | Varia por município; muitos integrados à REDESIM (JUCESP com 500 municípios conveniados [F51]); vencimentos controlados em planilha [F53]. |
| `gatilho_frequência` | Por evento + anual ou conforme validade |
| `porte_alcance` | Estabelecimentos não dispensados |
| `quem_faz` | Legalização |
| `onde_é_feita_hoje` | Portal da prefeitura, integrador, planilha |
| `entradas` / `saídas` | → alvará ou comprovante de dispensa, data de validade |
| `base_legal` | Legislação municipal `[NÃO VERIFICADO]` |
| `risco_se_falhar` | Multa, interdição |
| `tempo_estimado` | 1–3 h + espera `[ESTIMATIVA]` |
| `concorrentes` | `[NÃO ENCONTRADO]` como módulo próprio; vagas descrevem planilha [F52][F53] |
| `hipótese_automação` | Registro de validade, régua de renovação, guia de taxa anexada (nível D quase sempre) |
| `papel_da_ia` | M2 ler, M4 executar lembretes |
| `ferramentas_agênticas` | `registrar_licenca(cliente_id, tipo, validade, documento_id)`, `listar_licencas_vencendo(dias)` |
| `eventos_timesheet` | `soc.licenca.alvara` |
| `fontes_descoberta` | [F51], [F52], [F53] |

### SOC-037 · Obter e renovar o AVCB/CLCB dos Bombeiros

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Legalização / Licenças |
| `atividade` | Acompanhar o pedido de AVCB ou CLCB (feito pelo cliente ou por engenheiro), guardar o certificado e lembrar da renovação |
| `descrição` | Em SP, sistema Via Fácil Bombeiros; validade de 1 a 5 anos conforme risco (fontes fracas) `[NÃO VERIFICADO]`; MG tem serviço oficial de renovação a pedir antes do vencimento [F43]; consulta por CNPJ não disponível em SP (fonte fraca) `[NÃO VERIFICADO]`. Exige vistoria: o escritório organiza, não executa. |
| `gatilho_frequência` | Por evento + vencimento |
| `porte_alcance` | Estabelecimentos não dispensados |
| `quem_faz` | Legalização / cliente / engenheiro terceiro |
| `onde_é_feita_hoje` | Portais estaduais, planilha |
| `entradas` / `saídas` | → certificado e validade |
| `base_legal` | Decreto SP 63.911/2018 (citado em fórum) `[NÃO VERIFICADO]`; normas do CBMMG [F43][F44] |
| `risco_se_falhar` | Interdição; bloqueio do alvará municipal |
| `tempo_estimado` | 1–2 h de acompanhamento `[ESTIMATIVA]` |
| `concorrentes` | `[NÃO ENCONTRADO]` |
| `hipótese_automação` | Nível D: tarefa, checklist, lembrete, anexo; parceiro de engenharia indicado |
| `papel_da_ia` | M2 ler, M4 lembretes |
| `ferramentas_agênticas` | `registrar_licenca(...)`, `listar_licencas_vencendo(dias)` |
| `eventos_timesheet` | `soc.licenca.bombeiros` |
| `fontes_descoberta` | [F43], [F44] |

### SOC-038 · Obter e renovar a licença sanitária

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Legalização / Licenças |
| `atividade` | Pedir ou renovar licença da vigilância sanitária municipal ou estadual; quando aplicável, acompanhar autorização federal (Anvisa) |
| `descrição` | Comércio de alimentos, saúde, cosméticos; integradores estaduais conectam a vigilância (JUCEMG cita a vigilância sanitária estadual no integrador) [F50]. |
| `gatilho_frequência` | Por evento + vencimento |
| `porte_alcance` | Atividades de interesse sanitário |
| `quem_faz` | Legalização / responsável técnico do cliente |
| `onde_é_feita_hoje` | Portais municipais, integrador |
| `entradas` / `saídas` | → licença e validade |
| `base_legal` | Normas sanitárias locais `[NÃO VERIFICADO]` |
| `risco_se_falhar` | Interdição, multa |
| `tempo_estimado` | 1–3 h `[ESTIMATIVA]` |
| `concorrentes` | `[NÃO ENCONTRADO]` |
| `hipótese_automação` | Nível D com régua e checklist por município |
| `papel_da_ia` | M1 ler, M4 lembretes |
| `ferramentas_agênticas` | `registrar_licenca(...)` |
| `eventos_timesheet` | `soc.licenca.sanitaria` |
| `fontes_descoberta` | [F50] |

### SOC-039 · Obter e renovar a licença ambiental

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Legalização / Licenças |
| `atividade` | Identificar exigência de licença ambiental (municipal ou estadual, ex.: CETESB em SP) e controlar condicionantes e validade |
| `descrição` | Raro na carteira típica, crítico quando existe; em geral feito por consultoria ambiental, o escritório só controla. |
| `gatilho_frequência` | Por evento + vencimento |
| `porte_alcance` | Indústria, oficinas, postos, atividades potencialmente poluidoras |
| `quem_faz` | Legalização / consultor ambiental |
| `onde_é_feita_hoje` | Portais estaduais |
| `entradas` / `saídas` | → licença, condicionantes, validade |
| `base_legal` | Normas ambientais estaduais `[NÃO VERIFICADO]` |
| `risco_se_falhar` | Multa ambiental, embargo |
| `tempo_estimado` | — (acompanhamento) |
| `concorrentes` | `[NÃO ENCONTRADO]` |
| `hipótese_automação` | Nível D: registro, lembrete, anexo |
| `papel_da_ia` | M2 ler, M4 lembretes |
| `ferramentas_agênticas` | `registrar_licenca(...)` |
| `eventos_timesheet` | `soc.licenca.ambiental` |
| `fontes_descoberta` | — |

### SOC-040 · Controlar registros em conselhos e órgãos setoriais

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Legalização / Licenças |
| `atividade` | Registrar a PJ e o responsável técnico em conselhos (CRM, CREA, CRO, CRF etc.) e órgãos setoriais, e pagar anuidades |
| `descrição` | Exigido para atividades regulamentadas; anuidade anual esquecida gera cobrança. |
| `gatilho_frequência` | Por evento + anual |
| `porte_alcance` | Atividades regulamentadas |
| `quem_faz` | Legalização / cliente |
| `onde_é_feita_hoje` | Portais dos conselhos |
| `entradas` / `saídas` | → registro, certidão de regularidade, anuidade paga |
| `base_legal` | Leis de cada profissão `[NÃO VERIFICADO]` |
| `risco_se_falhar` | Autuação pelo conselho, impedimento de licitar |
| `tempo_estimado` | 30 min por ano `[ESTIMATIVA]` |
| `concorrentes` | `[NÃO ENCONTRADO]` |
| `hipótese_automação` | Nível D; derivado do CNAE no mapeamento SOC-035 |
| `papel_da_ia` | M1 ler, M4 lembretes |
| `ferramentas_agênticas` | `registrar_licenca(...)` |
| `eventos_timesheet` | `soc.licenca.conselho` |
| `fontes_descoberta` | — |

---

## H. Livros, atas e obrigações societárias periódicas

### SOC-041 · Realizar a reunião anual de aprovação de contas

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Societário / Atas |
| `atividade` | Preparar convocação (ou dispensa), ata de aprovação das contas e do balanço, designação de administradores e destinação de lucros; registrar quando exigido |
| `descrição` | Código Civil art. 1.078: nos quatro meses seguintes ao fim do exercício (até 30 de abril para exercício civil); poucas limitadas realizam e registram [F19]. |
| `gatilho_frequência` | Anual (jan–abr) |
| `porte_alcance` | Limitadas com mais de um sócio; S.A. (AGO); regras de dispensa a confirmar `[NÃO VERIFICADO]` |
| `quem_faz` | Societário / contábil |
| `onde_é_feita_hoje` | Word, assinador |
| `entradas` / `saídas` | Balanço (do core) → ata assinada, arquivamento na Junta |
| `base_legal` | Código Civil arts. 1.072, 1.074, 1.078 [F19] |
| `risco_se_falhar` | Responsabilidade dos administradores; contas não aprovadas formalmente; questionamento de distribuição de lucros `[NÃO VERIFICADO]` |
| `tempo_estimado` | 30–60 min por cliente `[ESTIMATIVA]` |
| `concorrentes` | `[NÃO ENCONTRADO]` |
| `hipótese_automação` | Campanha anual: lista de quem precisa, minuta gerada com números do balanço, assinatura em lote |
| `papel_da_ia` | M1 ler, M2 ler, M4 rascunhar em lote |
| `ferramentas_agênticas` | `listar_obrigados_ata_anual(ano)`, `gerar_minuta_ata(cliente_id, tipo)` |
| `eventos_timesheet` | `soc.ata.anual` |
| `fontes_descoberta` | [F19] |

### SOC-042 · Autenticar livros digitais na Junta

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Societário / Livros |
| `atividade` | Autenticar livros obrigatórios não escriturados pelo SPED (livro de atas, registro de ações, diário de quem não entrega ECD) |
| `descrição` | IN DREI 82/2021: livros passam a ser digitais, sem livros novos em papel; IN DREI 79/2022 permite digitalizar livros físicos já escriturados [F45][F46]. |
| `gatilho_frequência` | Anual ou por evento |
| `porte_alcance` | Quem não tem os livros autenticados pela ECD; S.A. |
| `quem_faz` | Contábil / societário |
| `onde_é_feita_hoje` | Portal da Junta |
| `entradas` / `saídas` | → livro autenticado (termo e recibo) |
| `base_legal` | IN DREI 82/2021 e 79/2022 [F45][F46] |
| `risco_se_falhar` | Livro sem valor probatório `[NÃO VERIFICADO]` |
| `tempo_estimado` | 30 min `[ESTIMATIVA]` |
| `concorrentes` | `[NÃO ENCONTRADO]` |
| `hipótese_automação` | Lista de obrigados, montagem do PDF com termos, lembrete; protocolo manual |
| `papel_da_ia` | M1 ler, M4 rascunhar |
| `ferramentas_agênticas` | `listar_livros_pendentes(cliente_id)` |
| `eventos_timesheet` | `soc.livro.autenticar` |
| `fontes_descoberta` | [F45], [F46] |

### SOC-043 · Manter o livro societário (quotas, deliberações, lucros por sócio)

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Societário / Livros |
| `atividade` | Registrar deliberações, cessões de quotas, aumentos de capital e distribuições de lucros por sócio, com o documento de suporte |
| `descrição` | Necessário para responder ao sócio e ao IRPF (rendimento isento ou tributado por sócio) e, com as regras recentes de tributação de dividendos, ainda mais `[NÃO VERIFICADO: norma vigente; tema de D6]`. |
| `gatilho_frequência` | Mensal ou por evento |
| `porte_alcance` | Sociedades com distribuição de lucros |
| `quem_faz` | Contábil / societário |
| `onde_é_feita_hoje` | Planilha, core contábil |
| `entradas` / `saídas` | → extrato por sócio, atas de distribuição |
| `base_legal` | Código Civil; legislação do IR `[NÃO VERIFICADO]` |
| `risco_se_falhar` | Distribuição desproporcional sem ata; informe de rendimentos errado |
| `tempo_estimado` | 15–30 min por mês por cliente `[ESTIMATIVA]` |
| `concorrentes` | `[NÃO ENCONTRADO]` |
| `hipótese_automação` | Registro estruturado ligado ao perfil temporal (participação na data), minuta de ata, informe ao sócio |
| `papel_da_ia` | M2 ler, M3 (proporção), M1 ler, M4 rascunhar |
| `ferramentas_agênticas` | `registrar_deliberacao(cliente_id, tipo, dados)`, `extrato_socio(cpf, ano)` |
| `eventos_timesheet` | `soc.livro.deliberacao` |
| `fontes_descoberta` | — |

### SOC-044 · Cumprir as obrigações de capital estrangeiro (SCE-IED)

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Societário / Capital estrangeiro |
| `atividade` | Registrar investimento estrangeiro, comunicar movimentações e entregar declarações periódicas no SCE-IED do Banco Central |
| `descrição` | Res. BCB 278/2022 (alterada pelas 348/2023 e 410/2024): anual para receptoras com ativos de R$ 100 milhões ou mais; quinquenal (anos terminados em 0 ou 5) a partir de R$ 100 mil, de 1/1 a 31/3; comunicação de operações em até 30 dias (blog) [F25][F26]. |
| `gatilho_frequência` | Por evento + anual/quinquenal |
| `porte_alcance` | Empresas com sócio não residente |
| `quem_faz` | Societário / sócio |
| `onde_é_feita_hoje` | Sistema do BCB |
| `entradas` / `saídas` | Balanço, QSA → declaração entregue |
| `base_legal` | Res. BCB 278/2022 e alterações [F25][F26] |
| `risco_se_falhar` | Multas (Res. BCB 131/2021) e suspensão de acesso ao sistema [F25] |
| `tempo_estimado` | 1–3 h `[ESTIMATIVA]` |
| `concorrentes` | `[NÃO ENCONTRADO]` |
| `hipótese_automação` | Flag "sócio estrangeiro" no perfil gera obrigação e prazo; nível D |
| `papel_da_ia` | M1 ler, M2 ler, M4 lembrete |
| `ferramentas_agênticas` | `obrigacoes_capital_estrangeiro(cliente_id)` |
| `eventos_timesheet` | `soc.ied.declarar` |
| `fontes_descoberta` | [F25], [F26] |

### SOC-045 · Publicar atos de sociedades anônimas

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Societário / Atas |
| `atividade` | Publicar convocações, atas e demonstrações exigidas de S.A. e registrar na Junta |
| `descrição` | Raro na carteira de escritórios pequenos e médios; regras de publicação mudaram nos últimos anos `[NÃO VERIFICADO]`. |
| `gatilho_frequência` | Anual + por evento |
| `porte_alcance` | S.A. |
| `quem_faz` | Societário / jurídico |
| `onde_é_feita_hoje` | Jornal, portal, Junta |
| `entradas` / `saídas` | → publicações e arquivamentos |
| `base_legal` | Lei 6.404/1976 `[NÃO VERIFICADO: artigos e redação vigente]` |
| `risco_se_falhar` | Nulidade de deliberação `[NÃO VERIFICADO]` |
| `tempo_estimado` | — |
| `concorrentes` | `[NÃO ENCONTRADO]` |
| `hipótese_automação` | Nível D: calendário e checklist |
| `papel_da_ia` | M1 ler, M4 lembrete |
| `ferramentas_agênticas` | `abrir_tarefa(...)` |
| `eventos_timesheet` | `soc.sa.publicar` |
| `fontes_descoberta` | — |

### SOC-046 · Manter o calendário societário e de legalização do cliente

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Societário / Calendário |
| `atividade` | Reunir num só calendário os prazos desta aba: certificados, autorizações, licenças, ata anual, e-BEF, SCE-IED, declaração PLD do escritório, prazos de 30 dias de arquivamento |
| `descrição` | Hoje cada prazo vive numa planilha diferente; é a "agenda de legalização" que as vagas do setor descrevem como controle manual [F53]. |
| `gatilho_frequência` | Contínuo |
| `porte_alcance` | Todos |
| `quem_faz` | Legalização / gestor |
| `onde_é_feita_hoje` | Planilhas |
| `entradas` / `saídas` | Datas das fichas acima → calendário, régua de avisos, painel de risco por cliente |
| `base_legal` | Conforme cada ficha |
| `risco_se_falhar` | Vencimentos em cascata |
| `tempo_estimado` | — |
| `concorrentes` | Acessórias (lembretes de certificados) [F27]; vencimentos gerais `[NÃO ENCONTRADO]` |
| `hipótese_automação` | Gerado das regras (M1) e do perfil (M2); alimenta a aba Obrigações e Prazos (D2) |
| `papel_da_ia` | M2 ler ("o que vence este mês na legalização?"), M4 executar lembretes |
| `ferramentas_agênticas` | `calendario_legalizacao(cliente_id|carteira, periodo)` |
| `eventos_timesheet` | — (consome eventos) |
| `fontes_descoberta` | [F27], [F53] |

---

## Funcionalidades de concorrentes nesta aba

| Concorrente | O que foi confirmado nesta aba | Fonte |
| --- | --- | --- |
| **Acessórias** | *AC Certifica*: certificados do escritório e dos clientes em painel único, lembrete automático de vencimento, aviso direto ao cliente, cashback com parceiro. *Gestão de Processos*: abertura, alteração e baixa com status, prazos, responsáveis e aviso automático ao cliente a cada etapa. *Protocolo Digital*: entrega com assinatura do cliente, data, hora e IP. *GED*. Procurações: `[NÃO ENCONTRADO]`. | [F27], [F28], [F29], [F30] |
| **Gestta** | *Gestta Processos* integrado às Soluções Domínio (atividades concluídas no Domínio são concluídas no Gestta; função Express reconhece anexos); *Gestta Messenger* (WhatsApp); conteúdo sobre onboarding de clientes. Fluxos societários específicos: `[NÃO ENCONTRADO]`. | [F31], [F32] |
| **Hubstrom** | *MonitorHub*: situação fiscal e certidões monitoradas com alerta, PGDAS, PGMEI, FGTS Digital, DCTFWeb, parcelamentos, caixas postais; *TaskHub*, *DriveHub*, *ConnectHub*, app do cliente. Certificado aparece só na configuração; procurações: `[NÃO ENCONTRADO]`. | [F33], [F34] |
| **SIEG** | HüB guarda o A1 por cliente; NFS-e exige o A1 original (procurador não basta). Cofre e alertas: `[NÃO ENCONTRADO]`. | [F35] |
| **Omie (G.Click)** | Treinamento de controle de vencimento de certificados e procurações de clientes; certificado do escritório para envios por procuração. | [F36] |
| **Alterdata** | Reajuste anual programado de contratos de honorários; contratação do Integra Contador pelo sistema. | [F37], [F4] |
| **Makrosystem** | Modelos de proposta, contrato e distrato; cadastro do certificado do escritório para envios por procuração. | [F38] |
| **Onvio (Thomson Reuters)** | Busca trouxe só páginas do Onvio de Canadá e Reino Unido (company formations); funcionalidade brasileira nesta aba `[NÃO ENCONTRADO]`. | busca de 5/11/2026 |
| **Veri, e-Kontroll, Qive** | `[NÃO ENCONTRADO]` nesta busca (nenhuma página de funcionalidade retornada). | busca de 5/11/2026 |

**Leitura:** o mercado cobre lembrete de certificado, quadro de processos e protocolo de entrega. Nenhum concorrente encontrado faz perfil temporal, matriz de autorizações/procurações com validação, mapeamento de licenças por CNAE e município, e-BEF, PLD ou Domicílio Judicial. Esses são candidatos a diferencial.

---

## Lacunas

1. **Acesso de rede:** os sites `acessorias.com`, `gestta.com.br`, `hubstrom.com.br` e `sieg.com` não puderam ser abertos neste ambiente (o host não resolve; precisa ser liberado nas configurações de rede da sessão). As funcionalidades vieram dos trechos dos resultados de busca; páginas de preço e de recursos completos não foram lidas.
2. **Autorizações de Acesso (RFB, dez/2025):** falta a norma que criou o sistema novo, a confirmação do limite de 20 autorizações por CPF, do prazo de validação e se o Integra Contador já reflete o sistema novo. Ponto crítico para V1.
3. **Integra Contador:** lista atual de serviços (procurações, CCMEI, e-BEF?) e tabela de preços por faixa não encontradas; buscar na Loja SERPRO na Etapa 2.
4. **Opção pelo Simples na abertura:** Res. CGSN 183/2025, 186/2026 e 190/2026 vistas só em fontes secundárias; texto oficial não lido.
5. **e-BEF:** dispensas para ME/EPP, prazo anual exato e a IN RFB 2.333/2026 citada por material de consultoria não confirmadas.
6. **Domicílio Judicial Eletrônico:** Res. CNJ 569/2024 e existência de API para terceiros não verificadas.
7. **Juntas e integradores de PR, SC e RS:** nenhuma fonte encontrada sobre os portais (Empresa Fácil/PR, JUCESC, JucisRS); consulta de andamento por protocolo e termos de uso precisam de V2.
8. **Bombeiros, vigilância e ambiental:** validade do AVCB/CLCB em SP e regras dos demais estados só em fontes fracas; nada oficial dos municípios da carteira.
9. **Carta de responsabilidade da administração e LGPD:** base normativa não conferida.
10. **Res. CFC 1.590/2020:** confirmar se continua vigente sem alteração em 2026 e o texto da transferência de responsabilidade técnica.
11. **Validade de certificados A3:** fontes divergem (2, 3 ou 5 anos); confirmar no ITI.
12. **Tempos:** todos os `tempo_estimado` são estimativas; precisam vir do levantamento com os contadores (apêndice do Plano) e do timesheet.
13. **Exigências e prazos de Junta:** prazo para cumprir exigência e redação atual do art. 42 da Lei 8.934/1994 não confirmados no Planalto.

---

## Referências

Todas consultadas em 5/11/2026 (por WebSearch; páginas não abertas diretamente salvo indicação).

| Código | Fonte |
| --- | --- |
| F1 | Res. CFC 1.721/2024 (PDF no gov.br/COAF): https://www.gov.br/coaf/pt-br/assuntos/informacoes-as-pessoas-obrigadas/orgaos-reguladores-e-fiscalizadores/resolucao-cfc-no-1-721-de-18-de-abril-de-2024-1.pdf/@@display-file/file |
| F2 | CRCMS, declaração de não ocorrência: https://crcms.org.br/coaf-prazo-aberto-para-envio-da-declaracao-de-nao-ocorrencia-ao-cfc ; Jornal Contábil: https://jornalcontabil.com.br/noticia/envio-do-coaf-e-recomendavel-mesmo-fora-do-prazo-saiba-o-motivo/ |
| F3 | NetCPA, Integra Contador (Integra Procurações, autenticação por e-CNPJ e procuração): https://netcpa.com.br/noticias/rfb-plataforma-integra-contador-de-prestacao-de-servicos-contabeis-e-fiscais/13342 |
| F4 | Alterdata, contratação do Integra Contador e procuração: https://ajuda.alterdata.com.br/prosoftcontabil/c1725-simples-nacional-serpro-integra-contador-contratacao-e-procuracao-220178525.html |
| F5 | Res. CFC 1.590/2020: https://www.normaslegais.com.br/legislacao/resolucao-cfc-1590-2020.htm ; https://www.legisweb.com.br/legislacao/?id=449491 |
| F6 | Contábeis, distrato de serviços contábeis: https://www.contabeis.com.br/noticias/40610/quais-procedimentos-deve-o-contabilista-observar-no-distrato-de-servicos-contabeis/ |
| F7 | IN RFB 2.066/2022 (procuração digital, 5 anos): https://okai.com.br/documento/2022-02-24/instrucao-normativa-rfb-nº-2066-de-24-de-fevereiro-de-2022 |
| F8 | Fenacon, nova versão do sistema de procurações (Autorizações de Acesso, 5/12/2025): https://fenacon.org.br/noticias/esta-no-ar-a-nova-versao-do-sistema-de-procuracoes-eletronicas/ ; CNB-SP: https://cnbsp.org.br/2025/12/09/inr-esta-no-ar-a-nova-versao-do-sistema-de-procuracoes-eletronicas-rfb/ |
| F9 | COAD, nova versão do sistema: https://www.coad.com.br/home/noticias-detalhe/134901/receita-federal-disponibiliza-nova-versao-do-sistema-de-procuracoes-eletronicas |
| F10 | e-Auditoria (comercial), autorização de acesso e limite por CPF: https://www.e-auditoria.com.br/blog/autorizacao-de-acesso-e-cac-como-escale-o-acesso-da-carteira/ |
| F11 | Lei 14.195/2021 (Planalto): https://planalto.gov.br/ccivil_03/_Ato2019-2022/2021/Lei/L14195.htm |
| F12 | Fortes Advogados, medidas da Lei 14.195/2021: https://fortes.adv.br/2021/09/22/as-medidas-de-facilitacao-de-abertura-de-empresas-trazidas-com-a-lei-14-195-2021 |
| F13 | DREI, ranking nacional de dispensa de alvarás (4º tri 2023): https://www.gov.br/empresas-e-negocios/pt-br/drei/tabelas-de-dispensa-de-alvara/ranking-nacional-dispensa-alvaras-licencas-4o-trimestre-2023-pdf.pdf |
| F14 | Decreto de Curitiba (dispensa de alvará não dispensa sanitária/ambiental): https://mid.curitiba.pr.gov.br/2025/00462198.pdf |
| F15 | Contábeis, Domicílio Judicial Eletrônico: https://www.contabeis.com.br/noticias/71153/cnj-torna-obrigatorio-cadastro-no-domicilio-judicial-eletronico/ |
| F16 | Felsberg Advogados, Domicílio Judicial Eletrônico: https://www.felsberg.com.br/domicilio-judicial-eletronico/ |
| F17 | Jornal Contábil, baixa com débitos (LC 147/2014): https://jornalcontabil.com.br/noticia/e-possivel-dar-baixa-em-empresa-que-possui-debitos/amp/ |
| F18 | Governo de MG, baixa da IE pela REDESIM: https://www.mg.gov.br/servico/solicitar-baixa-no-cadastro-de-contribuintes-do-icms-ie?page=1%2C0 |
| F19 | Migalhas, reuniões anuais de sócios: https://www.migalhas.com.br/depeso/363514/reunioes-ou-assembleias-anuais-de-socios-das-sociedades-limitadas |
| F20 | Conjur, e-BEF e IN RFB 2.290/2025: https://www.conjur.com.br/?p=892466 |
| F21 | SMA, prazo do beneficiário final: https://smabr.com/prazo-para-indicacao-de-beneficiario-final/ |
| F22 | LegisWeb, prazo de opção do Simples em início de atividade: https://www.legisweb.com.br/noticia/?id=24116 |
| F23 | Res. CGSN 190/2026: https://www.normaslegais.com.br/legislacao/Resolucao-cgsn-190-2026.htm |
| F24 | Res. CGSN 183/2025 (PDF): https://www.reformatributaria.com/wp-content/uploads/2025/11/RESOLUCAO-CGSN-No-183-DE-26-DE-SETEMBRO-DE-2025.pdf |
| F25 | Econet, IED: obrigações, prazos e penalidades: https://blog.econeteditora.com.br/investimento-estrangeiro-direto-ied-obrigacoes-prazos-e-penalidades-junto-ao-banco-central/ |
| F26 | Res. BCB 410/2024: https://www.normasbrasil.com.br/norma/resolucao-410-2024_464345.html |
| F27 | Acessórias, AC Certifica: https://acessorias.com/site/funcionalidade/ac-certifica/ |
| F28 | Acessórias, Gestão de Processos: https://acessorias.com/site/funcionalidade/gestao-de-processos/ |
| F29 | Acessórias, Protocolo Digital: https://acessorias.com/site/funcionalidade/protocolo-digital/ |
| F30 | Acessórias, GED: https://acessorias.com/site/funcionalidades/gestao-eletronica-de-documentos/ |
| F31 | Gestta, integração com Domínio: https://www.gestta.com.br/integracao-gestta-e-solucoes-dominio/ |
| F32 | Gestta, onboarding de clientes contábeis: https://www.gestta.com.br/onboarding-de-clientes-contabeis/ |
| F33 | Hubstrom, MonitorHub: https://hubstrom.com/monitorhub ; app: https://hubstrom.com/aplicativo |
| F34 | Hubstrom, TaskHub: https://hubstrom.com/solucoes/taskhub |
| F35 | SIEG, FAQ sobre edição do certificado A1 (Reclame Aqui): https://www.reclameaqui.com.br/empresa/sieg-solucoes-inteligentes/faq/como-editar-o-certificado-a1_nh9XR-AdeW0PmpA4/ |
| F36 | Omie, G.Click: controle de certificados e procurações: https://ajuda.omie.com.br/pt-BR/articles/15212786-omie-g-click-vocepode-controle-de-certificados-e-procuracoes-com-a-omie-g-click-04-07-2024 |
| F37 | Alterdata, reajuste de contratos de honorários: https://ajuda.alterdata.com.br/prosofterp/e1678-company-servicos-reajuste-de-contratos-de-honorarios-149128019.html |
| F38 | Makrosystem, gestão do contador (proposta, contrato, distrato): https://makrosystem.com.br/categoria/gestao-do-contador/ |
| F39 | DREI, decisão em recurso sobre o prazo de 30 dias do art. 36 da Lei 8.934/1994: https://www.gov.br/empresas-e-negocios/pt-br/drei/pareceres-drei/arquivos/2021/recurso-ao-drei-no-14021-111611-2021-81 |
| F40 | Juruá Docs, art. 42 da Lei 8.934/1994: https://www.juruadocs.com/legislacao/art/lei_00089341994-42 |
| F41 | MTE, manual do Sistema de Procuração Eletrônica do FGTS Digital v1.1 (1/3/2024): https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/fgtsdigital/manual-e-documentacao-tecnica/manual-do-orientacao-do-spe-v1-1-01-03-2024.pdf |
| F42 | Contábeis, FGTS Digital libera procuração eletrônica: https://www.contabeis.com.br/noticias/60985/fgts-digital-libera-sistema-de-procuracao-eletronica/ |
| F43 | Governo de MG, renovar AVCB ou CLCB: https://www.mg.gov.br/servico/renovar-o-avcb-ou-clcb |
| F44 | CBMMG, circular sobre validade do AVCB: https://bombeiros.mg.gov.br/images/stories/dat/CBRENAN_CAT/circular2009/circular_07-09-_validade_avcb.pdf |
| F45 | IN DREI 82/2021 (gov.br): https://www.gov.br/empresas-e-negocios/pt-br/drei/legislacao/arquivos/legislacoes-federais/IN822021RevogaasINs116975.pdf/@@download/file |
| F46 | CFC, regras para autenticação de livros digitais: https://cfc.org.br/noticias/regras-para-autenticacao-de-livros-digitais-e-publicada/ |
| F47 | Sefaz-SP, exclusão de contabilista (CADESP): https://portal.fazenda.sp.gov.br/servicos/cadesp/Paginas/Exclus%C3%A3o-de-Contabilista.aspx ; Fenacon: https://fenacon.org.br/rede-de-noticias/cadesp-exclusao-de-contador-deve-ser-protocolada-somente-pela-redesim%EF%BF%BC |
| F48 | Contábeis, Sefaz-SP notifica 15,4 mil contribuintes sem contabilista: https://www.contabeis.com.br/noticias/32630/secretaria-da-fazenda-notifica-15-4-mil-contribuintes-sem-registro-contabil-no-cadesp/ |
| F49 | CRCSP, tutoriais do Via Rápida Empresa: https://online.crcsp.org.br/portal/noticias/noticia.asp?c=2967 |
| F50 | JUCEMG, SEF e PBH aderem ao integrador estadual da REDESIM: https://jucemg.mg.gov.br/noticia/844/sef-e-pbh-aderem-ao-integrador-estadual-da-redesim |
| F51 | NetCPA, JUCESP com 500 municípios conveniados à REDESIM: https://netcpa.com.br/colunas/jucesp-atinge-marca-de-500-municipios-conveniados-ao-redesim/14729 |
| F52 | InfoJobs, vaga de assistente de legalização (RJ): https://www.infojobs.com.br/vaga-de-assistente-legalizacao-escritorio-contabil-em-rio-janeiro__11784748.aspx |
| F53 | InfoJobs, vaga de analista de legalização (CE), controle em planilha: https://www.infojobs.com.br/vaga-de-analista-legalizacao-escritorio-contabilidade-em-ceara__11699181.aspx |
| F54 | e-Auditoria (comercial), gestão de certificados digitais: https://www.e-auditoria.com.br/blog/gestao-de-certificados-digitais/ |
| F55 | Nota Orientativa eSocial 14/2019 sobre compartilhamento de certificados: https://www.tributa.net/wp-content/uploads/2019/01/nota-orientativa-014-2019-certificado-digital.pdf |
| F56 | Jettax, onboarding de clientes contábeis: https://www.jettax.com.br/blog/onboarding-de-clientes-contabeis/ |
| F57 | Direct Data (comercial), comparativo de APIs de CNPJ (BrasilAPI, ReceitaWS): https://www.directd.com.br/guias/melhor-api-consulta-cnpj-cpf |
| F58 | Contadores.cnt, comunicação do reajuste (6/8/2026): https://contadores.cnt.br/projetos/54/noticias/tecnicas/2026/08/06/como-comunicar-o-reajuste-contabil-e-fortalecer-a-parceria-com-o-cliente.html |
| F59 | TJCE, parecer técnico sobre certificados digitais (validade A1): https://portal.tjce.jus.br/uploads/2024/09/PARECERTECNICOCertificadosdigitais-1_1_2024.pdf |
| F60 | LegisWeb, Res. CGSIM 57 amplia atividades dispensadas: https://www.legisweb.com.br/noticia/?id=24125 |

---

## Fichas do ciclo de vida (rodada 3, 6/11/2026)

Rodada feita para a classificação por etapa do ciclo de vida do cliente (**Entrada**, **Manutenção**, **Desligamento**) usada pelos contadores do grupo. As 46 fichas acima já cobrem o núcleo de onboarding (SOC-021 a SOC-023), offboarding (SOC-024) e baixa (SOC-031); as fichas abaixo cobrem só o que faltava. As fichas existentes não foram alteradas. Campos extras: `etapa` e `nível_automação (provisório)` (escala do consolidado: A, A$, B, C-cert/C-crc/C-captcha, D-assistido, D-humano, E, F, Próprio). Fontes novas `[F61]` a `[F70]` (sem F64) na subseção "Referências da rodada 3", consultadas em 6/11/2026. Tempos são `[ESTIMATIVA]` até o levantamento com os contadores.

### SOC-101 · Manter a biblioteca de modelos e minutas do escritório

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Clientes / Modelos e minutas |
| `etapa` | Entrada, Manutenção, Desligamento |
| `atividade` | Manter, versionar e preencher automaticamente os modelos usados no ciclo do cliente: proposta, contrato de prestação, termo LGPD, carta ao contador anterior, procurações, contrato social e alterações, atas, requerimentos, notificação de rescisão, distrato e termo de entrega de documentos |
| `descrição` | A Res. CFC 1.590/2020 fixa o conteúdo mínimo do contrato (inclusive cláusula rescisória com prazo de aviso prévio, art. 2º, "l") e do distrato (arts. 6º a 10) [F62]; o modelo tem de acompanhar a norma vigente. Concorrentes oferecem modelos de proposta, contrato e distrato (Makrosystem [F38]); não achamos gerador de minutas societárias preenchido a partir do cadastro [F69b]. Hoje os modelos ficam em pastas de Word, com versões divergentes por analista `[NÃO VERIFICADO]`. |
| `gatilho_frequência` | Por evento (cada proposta, contrato, ato societário, distrato), várias vezes por semana na carteira; revisão quando a norma muda |
| `porte_alcance` | Todos |
| `quem_faz` | Sócio / legalização / atendimento |
| `onde_é_feita_hoje` | Pastas de Word, modelos de Junta, e-mail |
| `entradas` / `saídas` | Perfil temporal (SOC-002), sócios (SOC-004), contrato (SOC-016) → minuta preenchida, versão do modelo usada, documento para assinatura |
| `base_legal` | Res. CFC 1.590/2020 [F62]; NBC PG 01, item 3(r) (número de registro em propostas e contratos) [F61] |
| `risco_se_falhar` | Contrato sem cláusula obrigatória (infração ética), minuta com dado errado, retrabalho na Junta |
| `tempo_estimado` | 15–60 min por documento hoje `[ESTIMATIVA]` |
| `concorrentes` | Makrosystem (modelos de proposta, contrato, distrato) [F38] |
| `hipótese_automação` | Biblioteca dentro da plataforma, com modelos ligados à base legal temporal (o M1 avisa quando a norma de um modelo muda) e campos preenchidos do perfil; saída para assinatura eletrônica |
| `papel_da_ia` | M2 ler (dados do cliente), M1 ler (cláusulas exigidas), M4 rascunhar a minuta |
| `ferramentas_agênticas` | `gerar_minuta(modelo_id, cliente_id, parametros)`, `listar_modelos(etapa)`, `verificar_modelo_vigente(modelo_id)` |
| `eventos_timesheet` | `soc.minuta.gerar` |
| `nível_automação (provisório)` | Próprio (assinatura eletrônica por fornecedor, B) |
| `fontes_descoberta` | [F38], [F61], [F62], [F69b] |

### SOC-102 · Fazer o diagnóstico societário e de legalização na entrada

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Clientes / Onboarding |
| `etapa` | Entrada |
| `atividade` | Conferir o que foi herdado na parte societária: contrato social consolidado e cadeia de alterações (certidão simplificada e de inteiro teor da Junta), QSA e CNAE da RFB contra o contrato, atas anuais e livros não registrados, alvarás, licenças e registros em conselho vencidos, beneficiário final (e-BEF) e Domicílio Judicial |
| `descrição` | SOC-022 cobre o diagnóstico fiscal; a parte societária fica sem dono. A certidão simplificada mostra quadro e situação atuais, mas para checar poderes, objeto e histórico é preciso a de inteiro teor [F67]. A NBC PG 01 manda o contador inteirar-se das circunstâncias antes de opinar e comunicar ao cliente, em documento reservado, circunstância adversa [F61]. |
| `gatilho_frequência` | Por evento (cliente novo vindo de outra contabilidade) |
| `porte_alcance` | Clientes que trocam de escritório |
| `quem_faz` | Legalização |
| `onde_é_feita_hoje` | Portais das Juntas, consulta CNPJ, prefeitura, conselhos |
| `entradas` / `saídas` | Documentos recebidos (SOC-023), CNPJ → relatório de divergências societárias e de legalização assinado pelo cliente; tarefas de regularização (SOC-029, SOC-036 a SOC-040, SOC-006) |
| `base_legal` | NBC PG 01, item 3(i) e (j) [F61] |
| `risco_se_falhar` | Escritório assume passivo societário herdado (CNPJ inapto, ato não arquivado, alvará vencido, interdição) |
| `tempo_estimado` | 1–3 h `[ESTIMATIVA]` |
| `concorrentes` | `[NÃO ENCONTRADO]` |
| `hipótese_automação` | Disparar SOC-003 (CNPJ), comparar com o contrato recebido (leitura do PDF), pedir certidões da Junta (pagas, em portal), checar validade dos documentos de legalização no cofre e montar o relatório |
| `papel_da_ia` | M2 ler, M1 ler (o que é exigido para o perfil), M4 rascunhar relatório e proposta de regularização |
| `ferramentas_agênticas` | `diagnostico_societario_entrada(cliente_id)`, `comparar_contrato_qsa(cliente_id, documento_id)` |
| `eventos_timesheet` | `soc.diagnostico_societario.gerar` |
| `nível_automação (provisório)` | D-assistido (certidão da Junta pedida e paga em portal pela pessoa; CNPJ por B, comparação Próprio) |
| `fontes_descoberta` | [F61], [F67] |

### SOC-103 · Trocar vínculos e acessos herdados do contador anterior

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Clientes / Onboarding |
| `etapa` | Entrada |
| `atividade` | Levantar onde o contador anterior ainda tem acesso ou figura como responsável (autorizações de acesso na RFB, procurações no FGTS Digital, Sefaz, prefeitura, CADESP e similares, certificados e senhas em poder dele) e conduzir o cliente a revogar e o escritório a se incluir |
| `descrição` | Guias de troca de contador alertam que, sem revogar, o escritório anterior continua consultando os dados fiscais, e que o próprio titular pode revogar no e-CAC [F63] (fonte comercial). A inclusão do novo contabilista no CADESP segue a REDESIM (simétrica à exclusão de [F47]) `[NÃO VERIFICADO]`. SOC-011 e SOC-013 cuidam de pedir as autorizações novas; esta ficha cuida de desligar as antigas. |
| `gatilho_frequência` | Por evento |
| `porte_alcance` | Clientes que trocam de escritório |
| `quem_faz` | Legalização / atendimento |
| `onde_é_feita_hoje` | e-CAC do cliente, portais estaduais e municipais, WhatsApp |
| `entradas` / `saídas` | Matriz de procurações (SOC-013), inscrições (SOC-005) → lista de vínculos antigos revogados com data e comprovante; contador responsável atualizado em cada cadastro |
| `base_legal` | Res. CFC 1.590/2020, arts. 6º a 9º [F62]; [F47] |
| `risco_se_falhar` | Ex-contador com acesso a dados (LGPD); intimações indo para o escritório errado; dois responsáveis no mesmo cadastro |
| `tempo_estimado` | 30–90 min por cliente, espalhados `[ESTIMATIVA]` |
| `concorrentes` | `[NÃO ENCONTRADO]` |
| `hipótese_automação` | Checklist por órgão gerado do perfil; roteiro passo a passo no app do cliente para revogar; conferência das autorizações ativas onde houver consulta (SOC-012) |
| `papel_da_ia` | M2 ler, M4 rascunhar roteiro e executar cobranças ao cliente |
| `ferramentas_agênticas` | `listar_vinculos_herdados(cliente_id)`, `roteiro_revogacao(cliente_id, orgao)` |
| `eventos_timesheet` | `soc.vinculo_herdado.revogar` |
| `nível_automação (provisório)` | D-assistido (o ato é do cliente ou do escritório em cada portal; consulta das autorizações RFB pode ser C-cert ou A via Integra Contador, a confirmar) |
| `fontes_descoberta` | [F47], [F62], [F63] |

### SOC-104 · Combinar a transição com o contador anterior

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Clientes / Onboarding |
| `etapa` | Entrada |
| `atividade` | Ajudar o cliente a notificar o contador anterior respeitando o aviso prévio do contrato antigo, definir a competência de corte e registrar quem entrega cada obrigação e demonstração do período de transição; pedir ao anterior os fatos que o sucessor deve conhecer |
| `descrição` | Pela Res. CFC 1.590/2020, o rescindente comunica ao novo responsável técnico os fatos de que deva saber (art. 8º), elabora as demonstrações do seu período (art. 9º, par. único) e cumpre as acessórias de competência ocorrida na vigência do contrato, mesmo com vencimento posterior, salvo cláusula em contrário (art. 10) [F62]. A NBC PG 01 repete o dever de informar o substituto e manda evitar desentendimentos entre substituto e substituído (itens 3(l) e 18(d)) [F61]. SOC-023 trata do acervo; aqui é o acordo de corte. |
| `gatilho_frequência` | Por evento |
| `porte_alcance` | Clientes que trocam de escritório |
| `quem_faz` | Sócio / contábil |
| `onde_é_feita_hoje` | Telefone, e-mail, WhatsApp |
| `entradas` / `saídas` | Contrato antigo (prazo de aviso), data de início → modelo de notificação (SOC-101), termo de corte com lista de obrigações por responsável, tarefas no core para as competências do novo escritório |
| `base_legal` | Res. CFC 1.590/2020, arts. 2º "l", 8º, 9º e 10 [F62]; NBC PG 01, itens 3(l), 18(b) e 18(d) [F61] |
| `risco_se_falhar` | Obrigação da competência de transição não entregue por ninguém (multa); dupla entrega; conflito entre profissionais |
| `tempo_estimado` | 30–60 min `[ESTIMATIVA]` |
| `concorrentes` | `[NÃO ENCONTRADO]` |
| `hipótese_automação` | Calcular a competência de corte e listar as obrigações vencendo depois do corte que ainda são do anterior (art. 10), a partir do calendário de obrigações do perfil; gerar carta e termo |
| `papel_da_ia` | M1 ler (quem responde por qual competência), M3 calcular o corte, M4 rascunhar carta e termo |
| `ferramentas_agênticas` | `definir_corte_transicao(cliente_id, data_inicio)`, `listar_obrigacoes_do_anterior(cliente_id)` |
| `eventos_timesheet` | `soc.transicao.combinar` |
| `nível_automação (provisório)` | Próprio |
| `fontes_descoberta` | [F61], [F62] |

### SOC-105 · Planejar a estrutura da empresa antes da abertura

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Societário / Abertura |
| `etapa` | Entrada |
| `atividade` | Reunir com o empreendedor e definir natureza jurídica (EI, SLU, LTDA, sociedade simples), sócios e participação, administrador, capital, CNAEs, endereço (inclusive fiscal ou virtual) e regime tributário por simulação, antes da viabilidade (SOC-025) |
| `descrição` | Guias do Sebrae-PR colocam CNAE, natureza jurídica e regime antes da Junta e do CNPJ, e recomendam simular cenários pelo faturamento previsto [F68]; cartilha do CRC-CE atribui ao contador a orientação do regime [F68]. Com IBS e CBS a escolha de CNAE e regime pesa mais [F68] (fonte secundária). Hoje é reunião e planilha de simulação. |
| `gatilho_frequência` | Por evento (cada abertura) |
| `porte_alcance` | Empresas novas |
| `quem_faz` | Sócio / legalização / fiscal |
| `onde_é_feita_hoje` | Reunião, planilha |
| `entradas` / `saídas` | Plano de negócio do cliente (faturamento, folha, atividade, município) → parecer de estrutura com simulação de regimes, minuta do ato (SOC-101), insumos de SOC-025 a SOC-028 |
| `base_legal` | Código Civil (tipos societários) e LC 123/2006 `[NÃO VERIFICADO nesta rodada]` |
| `risco_se_falhar` | Regime ou tipo jurídico errado desde o início (imposto a mais, responsabilidade pessoal do sócio, retrabalho de alteração) |
| `tempo_estimado` | 1–3 h `[ESTIMATIVA]` |
| `concorrentes` | Contabilidades online fazem abertura guiada (Contabilizei, Agilize) `[NÃO VERIFICADO quanto à simulação]` |
| `hipótese_automação` | Questionário no app, simulação de regimes pelo M3 com a regra vigente do M1, parecer e minuta gerados |
| `papel_da_ia` | M1 ler, M3 calcular, M4 rascunhar parecer |
| `ferramentas_agênticas` | `simular_estrutura_abertura(dados_negocio)`, `gerar_parecer_abertura(simulacao_id)` |
| `eventos_timesheet` | `soc.abertura.planejar` |
| `nível_automação (provisório)` | Próprio |
| `fontes_descoberta` | [F68] |

### SOC-106 · Tratar o pedido de rescisão (ou rescindir pelo escritório)

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Clientes / Offboarding |
| `etapa` | Desligamento |
| `atividade` | Registrar o aviso de saída do cliente (data, motivo, prazo de aviso prévio do contrato), tentar a retenção quando couber e, quando a iniciativa é do escritório (falta de confiança, inadimplência, cliente que some), notificar por escrito respeitando o prazo contratual; quando não há distrato, notificar o fim da relação |
| `descrição` | A NBC PG 01 manda renunciar quando houver falta de confiança, notificando por escrito e respeitando os prazos do contrato (item 3(k)) [F61]. A Res. CFC 1.590/2020 torna o distrato obrigatório e, na impossibilidade, exige notificação do fim da relação com cessação das responsabilidades (art. 6º, par. único) [F62]. Essa é a porta de entrada de SOC-024; hoje fica em e-mail e sem motivo registrado `[NÃO VERIFICADO]`. |
| `gatilho_frequência` | Por evento |
| `porte_alcance` | Todos |
| `quem_faz` | Sócio / atendimento / financeiro |
| `onde_é_feita_hoje` | E-mail, WhatsApp |
| `entradas` / `saídas` | Pedido do cliente ou decisão do escritório, contrato (SOC-016) → data efetiva de saída, motivo classificado, notificação ou distrato (SOC-101), disparo do offboarding (SOC-024) |
| `base_legal` | NBC PG 01, item 3(k) [F61]; Res. CFC 1.590/2020, arts. 2º "l" e 6º [F62] |
| `risco_se_falhar` | Escritório segue responsável sem receber; saída sem prazo definido; perda de cliente que poderia ser retido |
| `tempo_estimado` | 30–60 min `[ESTIMATIVA]` |
| `concorrentes` | Makrosystem (modelo de distrato) [F38] |
| `hipótese_automação` | Formulário de saída, cálculo da data efetiva pelo aviso prévio, notificação gerada, painel de motivos de churn |
| `papel_da_ia` | M2 ler (contrato, histórico, honorários em aberto), M1 ler (prazos), M4 rascunhar notificação |
| `ferramentas_agênticas` | `registrar_pedido_saida(cliente_id, motivo, data)`, `notificar_fim_relacao(cliente_id)` |
| `eventos_timesheet` | `soc.saida.registrar` |
| `nível_automação (provisório)` | Próprio |
| `fontes_descoberta` | [F38], [F61], [F62] |

### SOC-107 · Fechar as responsabilidades de saída com o contador sucessor

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Clientes / Offboarding |
| `etapa` | Desligamento |
| `atividade` | Quando o escritório é quem sai: listar e cumprir as acessórias de competência ocorrida na vigência do contrato, entregar as demonstrações do período, enviar ao novo responsável técnico a carta com os fatos que ele precisa saber e entregar o acervo no prazo do distrato, sem reter documentos |
| `descrição` | É o espelho de SOC-104. A Res. CFC 1.590/2020 impõe esses deveres ao rescindente (arts. 8º a 10) [F62]; a NBC PG 01 veda reter livros, papéis ou arquivos eletrônicos para forçar o pagamento de honorários (item 4(l)) [F61]. SOC-024 já gera o pacote de entrega; faltava a lista de obrigações remanescentes e a comunicação formal ao sucessor. |
| `gatilho_frequência` | Por evento |
| `porte_alcance` | Clientes que saem para outro escritório |
| `quem_faz` | Contábil / fiscal / DP / sócio |
| `onde_é_feita_hoje` | E-mail, planilha |
| `entradas` / `saídas` | Data efetiva (SOC-106), calendário de obrigações → lista de entregas remanescentes com responsável, carta ao sucessor, termo de entrega assinado |
| `base_legal` | Res. CFC 1.590/2020, arts. 7º a 10 [F62]; NBC PG 01, itens 3(l) e 4(l) [F61] |
| `risco_se_falhar` | Multa por obrigação de competência vigente não entregue; processo ético por retenção ou falta de comunicação |
| `tempo_estimado` | 1–2 h de coordenação `[ESTIMATIVA]` |
| `concorrentes` | Acessórias Protocolo Digital (entrega com assinatura) [F29] |
| `hipótese_automação` | Lista gerada do calendário de obrigações do perfil até a data de corte; carta ao sucessor com pendências conhecidas (parcelamentos, processos abertos, intimações); bloqueio de "cliente inativo" até a lista zerar |
| `papel_da_ia` | M1 ler, M2 ler, M4 rascunhar carta e executar o envio com aprovação |
| `ferramentas_agênticas` | `obrigacoes_remanescentes_saida(cliente_id, data_corte)`, `gerar_carta_sucessor(cliente_id)` |
| `eventos_timesheet` | `soc.saida.fechar_responsabilidades` |
| `nível_automação (provisório)` | Próprio (tarefas do core por B) |
| `fontes_descoberta` | [F29], [F61], [F62] |

### SOC-108 · Aplicar retenção e descarte dos dados do ex-cliente (LGPD)

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Clientes / Offboarding |
| `etapa` | Desligamento |
| `atividade` | Depois da saída ou da baixa, aplicar a tabela de temporalidade: o que se guarda e por quanto tempo (obrigação legal, defesa do escritório), o que se devolve, o que se elimina (certificados, senhas, cópias, dados de funcionários do cliente) e registrar a eliminação |
| `descrição` | A LGPD manda eliminar os dados após o término do tratamento, admitindo conservar para cumprimento de obrigação legal ou regulatória, entre outras hipóteses (art. 16) [F65]. Na relação contábil o cliente é controlador e o escritório operador, e o contrato de operador deve prever as condições de encerramento [F65]. Guias recomendam tabela de temporalidade com finalidade, base legal, prazo e forma de descarte [F65] (fonte comercial). |
| `gatilho_frequência` | Por evento (saída) + varredura periódica de prazos vencidos |
| `porte_alcance` | Todos os ex-clientes |
| `quem_faz` | Sócio / encarregado de dados / TI |
| `onde_é_feita_hoje` | Não é feito de forma sistemática `[NÃO VERIFICADO]` |
| `entradas` / `saídas` | Cliente inativo (SOC-024), termo LGPD (SOC-020) → registros eliminados com data, itens retidos com prazo e base legal, aviso de fim de prazo |
| `base_legal` | Lei 13.709/2018, arts. 16 e 39 (via [F65]); Res. CFC 1.590/2020, art. 7º (devolução) [F62] |
| `risco_se_falhar` | Vazamento de dados de ex-cliente; certificado de ex-cliente usado indevidamente; guarda além do necessário |
| `tempo_estimado` | 15–30 min por cliente `[ESTIMATIVA]` |
| `concorrentes` | `[NÃO ENCONTRADO]` |
| `hipótese_automação` | Tabela de temporalidade por tipo de documento na plataforma; descarte automático do A1 e das senhas no cofre na data de saída; fila de eliminação com aprovação e trilha |
| `papel_da_ia` | M1 ler (prazos de guarda), M2 ler, M4 executar eliminação com cartão de aprovação |
| `ferramentas_agênticas` | `aplicar_temporalidade(cliente_id)`, `eliminar_dados(cliente_id, categoria)` |
| `eventos_timesheet` | `soc.lgpd.eliminar` |
| `nível_automação (provisório)` | Próprio |
| `fontes_descoberta` | [F62], [F65] |

### SOC-109 · Encerrar os registros acessórios depois da baixa

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Societário / Baixa |
| `etapa` | Desligamento |
| `atividade` | Depois da baixa na Junta e na RFB, conferir e pedir o cancelamento do que não cai sozinho: registro em conselho profissional, alvará, licença sanitária e ambiental, AVCB, inscrições, Domicílio Judicial, certificado; formalizar com os sócios quem guarda livros e documentos e até quando |
| `descrição` | A REDESIM compartilha a baixa com os órgãos, mas sem prazo para cada um efetivar o cancelamento [F70]. Conselhos exigem requerimento próprio e cobram anuidade proporcional do ano do pedido (ex.: Res. CFBM 115/2005) e há indeferimento de baixa por falta de prova de encerramento nos outros órgãos (CREA-PB) [F70]. O Código Civil, art. 1.194, manda conservar escrituração e papéis enquanto não houver prescrição ou decadência (citado em [F66]); atas e livros societários costumam ser guardados permanentemente [F66] (fonte secundária). |
| `gatilho_frequência` | Por evento (cada baixa) |
| `porte_alcance` | Empresas encerradas |
| `quem_faz` | Legalização |
| `onde_é_feita_hoje` | Portais e protocolos de conselhos e prefeitura |
| `entradas` / `saídas` | Baixa concluída (SOC-031), mapa de licenças (SOC-035), registros (SOC-040) → lista de cancelamentos com comprovante, termo de guarda de documentos assinado pelos sócios |
| `base_legal` | Código Civil, art. 1.194 (via [F66]); Res. CFBM 115/2005 (exemplo de conselho) [F70] |
| `risco_se_falhar` | Anuidade e taxas continuam correndo e viram cobrança ou dívida ativa contra os sócios; documentos perdidos numa fiscalização posterior |
| `tempo_estimado` | 1–3 h por baixa `[ESTIMATIVA]` |
| `concorrentes` | `[NÃO ENCONTRADO]` |
| `hipótese_automação` | Checklist gerado das matrizes de licenças e registros do cliente; modelos de requerimento (SOC-101); acompanhamento até comprovante |
| `papel_da_ia` | M2 ler, M4 rascunhar requerimentos e cobrar comprovantes |
| `ferramentas_agênticas` | `checklist_pos_baixa(cliente_id)`, `termo_guarda_documentos(cliente_id)` |
| `eventos_timesheet` | `soc.baixa.pos_baixa` |
| `nível_automação (provisório)` | D-assistido |
| `fontes_descoberta` | [F66], [F70] |

### SOC-110 · Avaliar baixa ou inatividade e acompanhar a empresa inativa

| Campo | Conteúdo |
| --- | --- |
| `aba` / `subárea` | Societário / Baixa |
| `etapa` | Manutenção, Desligamento |
| `atividade` | Quando o cliente para de operar, comparar baixar agora com manter a empresa inativa (custos, débitos, intenção de retomar, responsabilidade dos sócios) e, se ficar inativa, manter as declarações de inatividade e a vigilância do CNPJ |
| `descrição` | Imprensa contábil distingue empresa inativa de empresa sem movimento e indica a inatividade para quem pretende retomar e a baixa para quem quer encerrar de vez [F69]. As regras de entrega das declarações de inatividade mudaram ao longo dos anos e as fontes divergem [F69]; a parte fiscal fica com D2. Aqui fica a decisão e a reavaliação periódica. |
| `gatilho_frequência` | Por evento + revisão anual |
| `porte_alcance` | Clientes parados |
| `quem_faz` | Sócio / legalização / fiscal |
| `onde_é_feita_hoje` | Conversa com o cliente |
| `entradas` / `saídas` | Situação fiscal (D2), débitos, licenças → parecer baixa x inatividade; se inativa, calendário de declarações e revisão anual; se baixa, SOC-031 |
| `base_legal` | `[NÃO VERIFICADO nesta rodada]` (declarações de inatividade da RFB e estaduais) |
| `risco_se_falhar` | CNPJ inapto e pendência no CPF dos sócios; honorário cobrado de empresa que deveria estar baixada |
| `tempo_estimado` | 30–60 min `[ESTIMATIVA]` |
| `concorrentes` | `[NÃO ENCONTRADO]` |
| `hipótese_automação` | Detectar cliente sem movimento por N meses (dados do core), propor a reavaliação, simular custos das duas saídas |
| `papel_da_ia` | M1 ler, M3 calcular custos, M2 ler, M4 rascunhar parecer |
| `ferramentas_agênticas` | `avaliar_baixa_ou_inatividade(cliente_id)` |
| `eventos_timesheet` | `soc.inatividade.avaliar` |
| `nível_automação (provisório)` | Próprio |
| `fontes_descoberta` | [F69] |

### Classificação das 46 fichas por etapa (rodada 3)

| Etapa | Fichas |
| --- | --- |
| Entrada | 001, 002, 004, 005, 006, 007, 008, 011, 012, 013, 014, 015, 016, 019, 020, 021, 022, 023, 025, 026, 027, 028, 030, 032, 035, 036, 037, 038, 039, 040, 044 |
| Manutenção | 002, 003, 004, 005, 006, 007, 008, 009, 010, 011, 012, 013, 017, 018, 019, 020, 025, 029, 030, 032, 033, 034, 035, 036, 037, 038, 039, 040, 041, 042, 043, 044, 045, 046 |
| Desligamento | 005, 008, 013, 024, 030, 031, 032, 034, 040 |

Antigo nível D dividido: **D-assistido** 006, 011, 013, 014, 024, 025, 028, 029, 031, 033, 036, 040, 042, 044, 045; **D-humano** 037, 038, 039 (vistoria ou responsável técnico externo).

### Referências da rodada 3

Consultadas em 6/11/2026. "Aberta" = página baixada e lida; demais, só trecho do resultado de busca.

| Código | Fonte |
| --- | --- |
| F61 | NBC PG 01 (Código de Ética Profissional do Contador), vigente desde 1/6/2019, itens 3(i)–(l), 3(r), 4(l), 18 (aberta): https://www.normaslegais.com.br/legislacao/nbc-1-2019.htm |
| F62 | Res. CFC 1.590/2020, texto integral, arts. 2º, 6º a 10 e 14 (aberta): https://www.normaslegais.com.br/legislacao/resolucao-cfc-1590-2020.htm |
| F63 | Contabilidade Zen (comercial), revogação da procuração do contador anterior no e-CAC: https://www.contabilidadezen.com.br/blog/como-trocar-de-contador-profissionais-pj-2026/ ; https://www.contabilidadezen.com.br/blog/erros-ao-trocar-de-contador-representantes-comerciais-2026/ |
| F65 | Confidata (comercial), LGPD art. 16 comentado (aberta): https://confidata.com.br/blog/lgpd-comentada-11-termino-eliminacao ; LGPD para escritórios contábeis, cliente controlador e escritório operador, art. 39 (aberta): https://confidata.com.br/blog/lgpd-contadores-escritorios-contabeis ; plano de retenção: https://confidata.com.br/blog/plano-retencao-descarte-dados |
| F66 | Guarda de documentos e art. 1.194 do Código Civil (fontes secundárias): https://flashapp.com.br/blog/quanto-tempo-guardar-documentos ; https://www.contabilidadezen.com.br/blog/tabela-prazos-guarda-documentos-contabeis-2026/ |
| F67 | Contabilizei, certidão simplificada x inteiro teor: https://www.contabilizei.com.br/contabilizei-responde/o-que-e-certidao-simplificada/ |
| F68 | Sebrae-PR, abrir empresa em 2026: https://sebraepr.com.br/comunidade/artigo/como-abrir-empresa-em-2026-passo-a-passo-completo-para-comecar-do-jeito-certo ; escolha do regime: https://sebraepr.com.br/comunidade/artigo/como-abrir-empresa-no-brasil-passo-a-passo-para-escolher-o-regime-tributario-correto ; CRC-CE, cartilha de legalização: https://www.crc-ce.org.br/crcnovo/files/AL_CartilhaCRCCE_LegalizaacaoEmpresas.pdf |
| F69 | Jornal Contábil, declaração de inatividade: https://jornalcontabil.com.br/noticia/declaracao-de-inatividade-saiba-como-evitar-o-abandono-da-empresa/ ; empresa inativa tem obrigações: https://jornalcontabil.com.br/noticia/empresa-inativa-tem-obrigacoes-contabeis-a-cumprir/ |
| F69b | Busca de 6/11/2026 por gerador de minutas societárias em sistemas contábeis: só modelos genéricos (Prover VNext, Omie assinatura) e geradores genéricos; nenhum preenche contrato social ou ata a partir do cadastro. Ex.: https://www.omie.com.br/blog/sistema-para-escritorio-de-contabilidade/index.md |
| F70 | Fenacon, veto ao prazo de extinção de registros (REDESIM compartilha a baixa, sem prazo): https://fenacon.org.br/noticias/bolsonaro-veta-projeto-que-fixou-prazo-para-extincao-de-registro-de-empresas/ ; Res. CFBM 115/2005: https://cfbm.gov.br/wp-content/uploads/2025/03/Res_115de25nov2005.pdf ; CREA-PB, decisão 40/2020: https://creapb.org.br/transparencia/wp-content/uploads/2020/05/20231003-decisao-no-40-2020-baixa-de-registro-de-pj-indef.pdf |

**Lacunas da rodada 3:** Planalto não abriu neste ambiente (LGPD e Código Civil lidos por comentário); inclusão do contabilista no CADESP na entrada não confirmada; regra atual das declarações de inatividade não lida em fonte oficial; o tratamento da baixa pelos municípios (alvará e sanitária) não foi encontrado.
