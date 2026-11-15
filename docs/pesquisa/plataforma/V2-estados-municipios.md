# V2 · Verificação: Estados e municípios · Rodada 2 (6/11/2026)

6 de novembro de 2026 · Etapa 2 do [Protocolo de Descoberta](00-protocolo-de-descoberta.md) · agente V2, rodada 2 (a rodada 1 é de 5/11/2026)

**Domínio:** Sefaz de SP, MG, PR, SC e RS (distribuição de NF-e/CT-e no Ambiente Nacional, manifestação, DTE, conta-corrente fiscal, certidões estaduais, guias e obrigações estaduais), prefeituras das capitais (NFS-e, ISS, DEC), integradores de NFS-e, Juntas Comerciais e REDESIM, Corpo de Bombeiros e vigilância sanitária.

**Fichas tratadas:** as mesmas 62 fichas da rodada 1 (D1: 18, D2: 13, D3: 24, D5: 2, D6: 3, D7: 2). A verificação federal (Integra Contador, APIs do ADN da NFS-e, eSocial) é do V1; agregadores e preços em geral são do V3 e entram aqui só quando são o caminho para um serviço estadual ou municipal.

**Premissas do fundador depois da rodada 1 (valem para todo este arquivo):**

1. **Certificado A1 do cliente:** a plataforma terá um app/portal do cliente que espelha os dados dele, recebe os documentos dele e entrega os do escritório. O A1 do cliente passa a ser **documento obrigatório enviado pelo próprio cliente no app** e fica num cofre. Para NF-e, o `autXML` com o CNPJ do escritório é complemento. Já apurado antes desta rodada: a NT 2014.002 v1.40 mantém a autenticação pelo certificado do próprio ator e as APIs do ADN da NFS-e exigem o certificado do contribuinte; a FENACON pediu acesso por procuração, ainda não implementado.
2. **Sistemas core:** tarefas e dados de processos vêm dos cores por API negociada com cada fornecedor. Guias estaduais e municipais geradas pelo core entram por esse caminho (F ou API do core).
3. **Agente de desktop:** fora do plano principal; só alternativa se algum core não tiver API.

---

## 0. Método desta rodada (ler antes de usar)

- **Rede liberada.** As páginas foram baixadas com `curl` em 06/11/2026 e lidas como texto. O Portal Nacional da NF-e (`www.nfe.fazenda.gov.br`) entrou em laço de redirecionamento com `curl` simples; a NT 2014.002 v1.40 foi lida **na íntegra** numa cópia do PDF publicada em `reformatributaria.com` (mesmo documento, controle de versão 1.40 de 08/07/2026). O manual do DEC paulistano (`smartsampa.prefeitura.sp.gov.br`) devolveu 403.
- **Buscas usadas:** 13 de 55.
- **Marcas de status em cada item:**

| Marca | Significado | Confiança máxima |
| --- | --- | --- |
| **[R2 conferido]** | Fonte aberta nesta rodada (06/11/2026). Fonte oficial do órgão → confiança **alta**; texto oficial lido em cópia de terceiro ou página de fornecedor → **média** (alta para o que o fornecedor diz de si mesmo, como preço) | alta |
| **[R2 trecho]** | Só o trecho do buscador desta rodada; página não aberta | média |
| **[R1 mantido, não conferido]** | Igual à rodada 1; não foi reaberto nesta rodada | a da rodada 1 (média ou baixa) |
| `[NÃO ENCONTRADO]` | Procurado nesta rodada e não achado; diz o que foi buscado | — |

- Marcas herdadas da rodada 1: `[Dx:Sn]` = fonte citada por uma ficha de descoberta (lida só por trecho do buscador em 05/11/2026); `[NÃO VERIFICADO — conhecimento prévio]` = conhecimento do agente sem fonte.
- Datas: toda fonte marcada [R2 …] foi consultada em **06/11/2026**.

### 0.1 Fontes abertas nesta rodada (referência para as marcas)

| Id | Fonte | Tipo |
| --- | --- | --- |
| R2-NT | NT 2014.002 v1.40 (NFeDistribuicaoDFe, CNPJ alfanumérico), PDF integral: https://www.reformatributaria.com/wp-content/uploads/2026/07/NT2014.002_v1.40-WsNFeDistribuicaoDFe-CNPJ-alfa.pdf | texto oficial, cópia |
| R2-ADN | Planilha "Municípios aderentes" de 28/09/2026: https://www.gov.br/nfse/pt-br/municipios/monitoramento-adesoes/municipios-aderentes-20260928.xlsx (página: https://www.gov.br/nfse/pt-br/municipios/monitoramento-adesoes) | oficial |
| R2-SP-DEC | Portaria CAT 140/2010 (DEC): https://legislacao.fazenda.sp.gov.br/Paginas/pcat1402010.aspx ; página do DEC: https://portal.fazenda.sp.gov.br/servicos/dec | oficial |
| R2-SP-CND | Portal SIDEB (Certidão Única): https://www4.fazenda.sp.gov.br/SIDEB/CertidaoNegativaDebitos ; texto da Res. Conjunta SFP/PGE 1/2026 (DOE 14/09/2026) lido em https://netcpa.com.br/colunas/resolucao-conjunta-sfppge-no-12026-regulamenta-no-ambito-da-secretaria-da-fazenda-e-planejamento-e-da-procuradoria-geral-do-estado-a-emissao-da-certidao-unica-de-debitos/28375 | oficial + cópia |
| R2-SP-SAE | SAE-NFC-e: https://portal.fazenda.sp.gov.br/servicos/nfce/Paginas/saenfce.aspx | oficial |
| R2-MG-DTE | Página do DT-e: https://www.fazenda.mg.gov.br/empresas/DTE/ ; Decreto 47.531/2018: https://www.fazenda.mg.gov.br/empresas/legislacao_tributaria/decretos/2018/d47531_2018.html | oficial |
| R2-PR-DTE | Lei 17.079/2012 (texto em https://www.normasbrasil.com.br/norma/lei-17079-2012-pr_357786.html); Resolução SEFA 159/2019 (procuração eletrônica): https://www.fazenda.pr.gov.br/sites/default/arquivos_restritos/files/documento/2022-08/resolucaosefa1592019.pdf | cópia + oficial |
| R2-SC-DTEC | Serviço de credenciamento no DTEC: https://www.sef.sc.gov.br/servicos/credenciar-pessoa-juridica-no-domicilio-tributario-eletronico-do-contribuinte-dtec-tat ; Ato DIAT 42/2020: https://legislacao.sef.sc.gov.br/html/Atos_Diat/2020/atodiat_20_042.htm | oficial |
| R2-RS-DTE | FAQs da Receita Estadual: https://atendimento.receita.rs.gov.br/o-contabilista-vinculado-ao-cadastro-pode-inserir-as-informacoes-de-contato-no-dte-ou-dar-ciencia-em-intimacoes-e-notificacoes ; https://atendimento.receita.rs.gov.br/o-acesso-a-caixa-postal-eletronica-do-dte-pode-ser-realizado-sem-certificado-digital ; https://atendimento.receita.rs.gov.br/o-que-e-o-domicilio-tributario-eletronico-dte | oficial |
| R2-IS | InfoSimples: catálogo público em JSON https://infosimples.com/consultas/apis.json (837 APIs), página de preços https://infosimples.com/consultas/precos/ e regras https://infosimples.com/pricing-rules.json (atualizadas em 26/10/2026); páginas de DEC: https://infosimples.com/consultas/sefaz-sp-dec-caixa-postal/ (e equivalentes MG, PR, SC) | fornecedor |
| R2-FOCUS | Preços Focus NFe: https://focusnfe.com.br/precos/ | fornecedor |
| R2-NFEIO | Preços NFE.io (NFS-e): https://nfe.io/precos/ | fornecedor |
| R2-PLUG | Página do PlugNotas (TecnoSpeed): https://www.tecnospeed.com.br/plugnotas/ | fornecedor |
| R2-MG-DAPI | Portaria SRE 296/2026 (DAPI → EFD), resumo: https://documentacao.senior.com.br/exigenciaslegais/noticias/estadual/2026/2026-08-03-icms-mg-portaria-sre-no-296-2026-substituicao-da-dapi-pela-entrega-exclusiva-da-efd-icms-ipi | secundária |

---

## 1. Mapa das integrações do domínio

Legenda de credencial: **A1-cli** = certificado A1 (e-CNPJ) do cliente, enviado por ele no app e guardado em cofre (premissa 1); **e-CNPJ-esc** = certificado do escritório; **cert-ctb** = e-CPF do contador; **login-ctb** = usuário e senha do contabilista; **proc-el** = procuração eletrônica outorgada pelo cliente no portal estadual; **gov.br** = conta gov.br do sócio ou do contador.

### I-01 · NF-e: Distribuição de DF-e de Interesse (Ambiente Nacional) · [R2 conferido]

| Campo | Conteúdo |
| --- | --- |
| O que oferece | Documentos e resumos de interesse do ator que **não tenham sido gerados por ele**. Atores: emitente, destinatário, transportador e terceiros do `autXML`. Três consultas: `distNSU`, `consNSU`, `consChNFe`; até 50 documentos por resposta [R2-NT, itens 3 e 3.4] |
| Notas **emitidas** pelo próprio CNPJ | **Não são distribuídas.** Na tabela do item 3 a linha "NF-e" tem "Não" para o emitente, e a regra H172 rejeita a consulta por chave com 641 ("A NF-e não deve ser disponibilizada para o emitente da NF-e"). O emitente recebe só **eventos**: manifestações do destinatário, eventos do Fisco (desde a v1.13, mesmo se emitente e destinatário forem iguais), resumos de CT-e/MDF-e, comprovante e insucesso de entrega propagados do CT-e [R2-NT, item 3 e tabela de validações]. **Confirma a correção C-01** |
| Destinatário | Sem manifestação recebe só o resumo (`resNFe`) e o cancelamento; com Ciência, Confirmação ou Operação não Realizada recebe o XML completo [R2-NT, item 3, nota 1] |
| Papel do `autXML` | Terceiro cujo CNPJ ou CPF está no `autXML` recebe a NF-e **integral**, sem manifestação, além de cancelamento e CC-e. Exceção: se o CNPJ do `autXML` também for o destinatário da mesma nota, o NSU só é gerado depois da manifestação [R2-NT, item 3 nota 3 e item 3.4]. Para o escritório: com o CNPJ do escritório no `autXML` das **saídas** dos clientes, o escritório baixa essas notas com o **próprio** e-CNPJ, num único fluxo de NSU para todos os clientes |
| Credencial | Certificado do próprio ator. PJ autenticada pelo CNPJ base (8 dígitos) do certificado; pode consultar qualquer filial do mesmo CNPJ base [R2-NT, item 3]. Logo: **A1-cli** para entradas do cliente; **e-CNPJ-esc** para o que estiver no `autXML` do escritório |
| Janela | Documentos disponíveis por **até 90 dias** após a recepção no Ambiente Nacional; depois "não será possível recuperar a NF-e" [R2-NT, itens 3 e 3.4] |
| Regra dos 60 dias (agora oficial) | O NSU só é gerado para quem usou o `distNSU` nos últimos 60 dias. **Usuário novo: NSU a partir do primeiro acesso, sem retroativo**; quem ficar mais de 60 dias sem consultar perde a geração no intervalo, sem retroativo. O primeiro acesso devolve 137 e os documentos aparecem nas consultas seguintes, depois de 1 h [R2-NT, item 3.4]. Consequência: a plataforma deve **ligar o coletor no dia do onboarding** e nunca passar 60 dias sem consultar; notas anteriores ao primeiro acesso só por `consChNFe` (chave, dentro dos 90 dias) ou upload |
| Limites | Depois de 137 (nenhum documento), esperar 1 h; consultar antes gera 656 e bloqueio do CNPJ por 1 h. Consulta fora da sequência de `ultNSU` também gera 656. `consChNFe`/`consNSU`: **20 consultas por hora**, depois 656 e bloqueio de 1 h; voltar antes de 1 h zera a contagem. Várias aplicações do mesmo ator para o mesmo CNPJ têm de seguir a mesma sequência [R2-NT, item 3.11.4] |
| Endereços | Publicados no Portal Nacional, menu "Serviços / Relação de Serviços Web" [R2-NT, item 3.12] (portal não alcançado por `curl`) |
| Preço | Gratuito: a NT não prevê cobrança [R2-NT]; não há página de preço (serviço público) |
| Nível | **A** · confiança **alta** (texto integral da NT; cópia de terceiro, versão conferida pelo controle de versões) |

### I-02 · NF-e: Recepção de Evento (manifestação do destinatário) · [R1 mantido, não conferido] com um ponto conferido

| Campo | Conteúdo |
| --- | --- |
| O que oferece | Eventos 210210 Ciência, 210200 Confirmação, 210220 Desconhecimento, 210240 Operação não Realizada [NÃO VERIFICADO — códigos]. **Conferido:** Ciência, Confirmação ou Operação não Realizada liberam o XML completo pela distribuição [R2-NT, item 3 nota 1] |
| Documentação | NT 2020.001 v1.60 (abr/2026) e Ajuste SINIEF 14/26: prazo da conclusiva de 180 para 90 dias [D3:S3] (não reaberta) |
| Credencial | A1-cli. Ato do destinatário; o escritório só registra com o certificado do cliente e autorização do cliente no app |
| Preço | Gratuito [NÃO VERIFICADO] |
| Nível | **A** (ciência automática); **A com aprovação humana** para conclusivos |

### I-03 · CT-e: Distribuição de DF-e e eventos do tomador · [R1 mantido, não conferido]

| Campo | Conteúdo |
| --- | --- |
| O que oferece | CT-e e CT-e OS para os atores do documento por NSU; evento de Prestação de Serviço em Desacordo [D3:S10] |
| Ligação conferida com a NF-e | Os resumos de eventos de CT-e autorizado/cancelado chegam aos atores da NF-e (inclusive ao emitente) pela distribuição da NF-e [R2-NT, tabela do item 3] |
| Credencial / preço | A1-cli / gratuito [NÃO VERIFICADO] |
| Nível | **A** |

### I-04 · MDF-e · [R1 mantido, não conferido], com um ponto conferido

- Resumos de eventos de MDF-e autorizado/cancelado são distribuídos a todos os atores da NF-e vinculada, inclusive ao emitente [R2-NT, tabela do item 3]. Isso **não** é a distribuição do MDF-e em si.
- Consulta de não encerrados pelo emitente: [NÃO VERIFICADO — conhecimento prévio]. Distribuição do MDF-e a terceiros: [NÃO ENCONTRADO].
- Nível: **A** para o emitente (a confirmar no manual do MDF-e), **E** para terceiros.

### I-05 · NFC-e: SAE-NFC-e da Sefaz-SP · [R2 conferido]

| Campo | Conteúdo |
| --- | --- |
| O que oferece | Dois webservices: `NFCeListagemChaves` (chaves das NFC-e emitidas por um CNPJ num período) e `NFCeDownloadXML` (XML) [R2-SP-SAE] |
| Credencial | "É obrigatório o uso de certificado digital (e-CNPJ) **do próprio contribuinte**" [R2-SP-SAE]. Resolve a dúvida da rodada 1: o e-CNPJ do contabilista não serve; usar o **A1-cli** do cofre |
| Limites | "Limite de requisições por IP/minuto"; valor não publicado na página [R2-SP-SAE]; detalhes na "Nota Técnica de Serviços de Apoio à Escrituração" (não aberta) |
| Preço | Gratuito (serviço da Sefaz; nenhuma cobrança na página) |
| Outras UFs | Serviço oficial equivalente em MG, PR, SC, RS: [NÃO ENCONTRADO]. Por agregador há consultas de NFC-e por chave ou resumo (InfoSimples: `sefaz/mg/nfce-resumida`, `sefaz/pr/nfce`, `sefaz/sc/nfce`, `sefaz/rs/nfce-resumida`, `sefaz/rs/nfce-svrs`) [R2-IS]; são consultas **nota a nota**, não listagem por CNPJ |
| Nível | **A** em SP (confiança alta); **B** nota a nota ou integração com PDV/emissor nas demais UFs |

### I-06 · Consulta cadastral de contribuintes de ICMS (CCC / Sintegra) · parcialmente [R2 conferido]

| Campo | Conteúdo |
| --- | --- |
| Caminhos | (a) Webservice NfeConsultaCadastro das Sefaz [R1 mantido, não conferido]; (b) consulta pública Sintegra [R1 mantido]; (c) agregador: **conferido** que a InfoSimples tem `sintegra/sp`, `/mg`, `/pr`, `/sc`, `/rs` (sem certificado), `sintegra/unificada` e `sefaz/cadastro-centralizado` (CCC mantido pela SEFAZ-RS, exige certificado ou login) [R2-IS] |
| Preço (c) | Preço base por consulta (R$ 0,20 até 500/mês, caindo por faixa até R$ 0,05 acima de 100 mil) + adicional: Sintegra SP/RS/SC R$ 0,04; MG e PR R$ 0,00; Unificada R$ 0,10; CCC R$ 0,08; franquia mínima de R$ 100/mês por conta [R2-IS] |
| Nível | **A** onde a UF responde o (a); **B** pelo agregador (agora com preço) |

### I-07 · Sefaz-SP

| Serviço | O que é | Credencial | API? | Nível | Fonte e status |
| --- | --- | --- | --- | --- | --- |
| **DEC** (Domicílio Eletrônico do Contribuinte) | Caixa postal; acesso "restrito a usuários autorizados e portadores de certificação digital" | Certificado da PJ; ou **procurador** nomeado por procuração eletrônica no próprio DEC, PF ou PJ com certificado, por prazo indeterminado | Oficial: [NÃO ENCONTRADO]. **Agregador: sim** (InfoSimples `sefaz/sp/dec/caixa-postal`, com A1 em PKCS#12 e opção `ignora_nao_lidas`) | **B** (ou C-cert) | Portaria CAT 140/2010, art. 6º [R2-SP-DEC]; InfoSimples [R2-IS] · **[R2 conferido]** |
| Regra de ciência do DEC | Recebida no dia da consulta (ou no 1º dia útil seguinte, se consulta em dia não útil); sem consulta em **10 dias** do envio, considera-se recebida no fim do prazo | — | — | — | Portaria CAT 140/2010, art. 5º [R2-SP-DEC] · **[R2 conferido]** |
| **Certidão Única de Débitos** (Sefaz + PGE) | Desde **14/10/2026** (vigência 30 dias após o DOE de 14/09/2026) uma só certidão cobre débitos tributários na Sefaz e dívida ativa na PGE; CNPJ base, matriz e filiais; **validade 90 dias** (180 para o Cadastro Fiscal Positivo); emitida no SIDEB; sistema disponível em dias úteis das 6h às 21h | Nenhuma para emitir; relatório de pendências e pedido de correção pedem e-CNPJ ou poderes no CADESP | Oficial: não. Agregador: InfoSimples `sefaz/sp/certidao-debitos` (eCND do SIDEB, adicional R$ 0,08) e `pge/sp/cndt` | **B** / C-captcha a confirmar | Res. Conj. SFP/PGE 1/2026, arts. 1º, 3º, 4º, 6º, 8º e 16 [R2-SP-CND]; SIDEB aberto (não aparece CAPTCHA no HTML da página inicial) · **[R2 conferido]**. **Corrige a C-10** |
| Conta fiscal / pendências | Relatório de Pendências Fiscais no SIDEB (com e-CNPJ ou poderes no CADESP); Posto Fiscal Eletrônico [R1] | e-CNPJ | [NÃO ENCONTRADO] | C-cert | [R2-SP-CND] parcial |
| GARE-ICMS | Guia | — | Agregador: só `pge/sp/emissao-gare` (GARE de liquidação de dívida ativa) [R2-IS] | F via core (premissa 2) | [R1 mantido] |
| GIA | Dispensada para o RPA desde jan/2026; retificações seguem [D2:S18][D2:S19] | — | — | F/D | [R1 mantido, não conferido] |
| CADESP / contabilista | Exclusão do contabilista pela REDESIM "Meus Clientes" [D1:F47] | login-ctb/gov.br | Não | C-crc | [R1 mantido, não conferido] |
| SAE-NFC-e | Ver I-05 | A1-cli | Sim | A | [R2 conferido] |

### I-08 · SEF-MG

| Serviço | O que é | Credencial | API? | Nível | Fonte e status |
| --- | --- | --- | --- | --- | --- |
| **DT-e** (Domicílio Tributário Eletrônico), dentro do SIARE | Obrigatório para débito e crédito (inclusive contribuinte externo ST) e para o **Simples que emite DF-e**; facultativo para os demais | Login no SIARE com certificado A1 ou A3 (e-CNPJ, ou IE + e-CPF do sócio master); **procurador** cadastrado pelo contribuinte no SIARE, que entra com a IE da matriz e o próprio e-CPF ou e-CNPJ | Oficial: [NÃO ENCONTRADO]. Agregador: InfoSimples `sefaz/mg/dec/caixa-postal` (A1 PKCS#12; filtros de data; `ignora_nao_lidas`) | **B** (ou C-cert) | [R2-MG-DTE], [R2-IS] · **[R2 conferido]** |
| Regra de ciência do DT-e | Intimação feita na data do acesso ao teor; sem acesso em **10 dias corridos** do envio, considera-se feita no fim do prazo; comunicação pelo DT-e é pessoal | — | — | — | RPTA, art. 12, VI e § 2º, e art. 23-D, na redação do Decreto 47.531/2018 [R2-MG-DTE] · **[R2 conferido]** |
| Certidão (CDT) | InfoSimples descreve como "Certidão Negativa de Débitos Tributários Não Inscritos na SEFAZ MG"; pede CNPJ/IE **e** login ou certificado | login ou A1-cli | Agregador (adicional R$ 0,08) | B | [R2-IS] · conferido no agregador; página oficial não aberta |
| Parcelamento, dívida ativa, CADIN | Consultas públicas | Nenhuma | Agregador (`sefaz/mg/parcelamento`, `divida-ativa`, `cadin`) | B | [R2-IS] |
| DAE | Guia | — | [NÃO ENCONTRADO] | F via core | [R1 mantido] |
| DAPI 1 → EFD | Portaria SRE 285/2026 e 296/2026: apuração do ICMS só pela EFD, com DAPI 1 mantida para escrituração centralizada ou IE única com mais de um estabelecimento; efeito desde 30/01/2026 | — | — | F/D | [R2-MG-DAPI] (secundária) · **[R2 conferido]**, confiança média |
| Calendário de obrigações vigente | Prazo geral de recolhimento: [NÃO ENCONTRADO] em fonte oficial de 2026 (só notícia antiga citando o dia 15) | — | — | — | [R2 trecho] |
| Integrador REDESIM | JUCEMG, SEF e PBH no integrador [D1:F50] | — | — | ver I-19 | [R1 mantido] |

### I-09 · Receita Estadual do Paraná (SEFA-PR)

| Serviço | O que é | Credencial | API? | Nível | Fonte e status |
| --- | --- | --- | --- | --- | --- |
| **DT-e** (nome confirmado pela Lei 17.079/2012, art. 6º), no portal Receita/PR | Comunicação eletrônica nos processos tributários e não tributários, após credenciamento; comunicação pessoal | Credenciamento na SEFA; **procuração eletrônica** no Receita/PR (a Res. SEFA 159/2019 disciplina a do e-PAF) | Oficial: [NÃO ENCONTRADO]. Agregador: InfoSimples `sefaz/pr/dec/caixa-postal` (A1 PKCS#12) | **B** (ou C-cert) | Lei 17.079/2012, arts. 6º a 9º [R2-PR-DTE]; Res. SEFA 159/2019, art. 1º [R2-PR-DTE]; [R2-IS] · **[R2 conferido]** (lei lida em site de legislação; resolução no site oficial) |
| Regra de ciência | Feita no dia da consulta; sem consulta em **10 dias** do envio, "considerada automaticamente realizada" no fim do prazo | — | — | — | Lei 17.079/2012, art. 9º, §§ 2º a 4º [R2-PR-DTE] · confiança média (texto em site não oficial) |
| Certidão | Certidão de Débitos Tributários e de Dívida Ativa Estadual | Nenhuma | Agregador `sefaz/pr/certidao-debitos` (adicional R$ 0,07) | B | [R2-IS] |
| GR-PR | Guia | — | [NÃO ENCONTRADO] | F via core | [R1 mantido] |
| NF-e do produtor rural | Obrigatória desde 05/01/2026 [D3:S23] | — | I-01 | A/D | [R1 mantido] |
| Calendário vigente | [NÃO ENCONTRADO] (busca de 06/11/2026 sem resultado oficial) | — | — | — | — |

### I-10 · SEF-SC

| Serviço | O que é | Credencial | API? | Nível | Fonte e status |
| --- | --- | --- | --- | --- | --- |
| **DTEC** (Domicílio Tributário Eletrônico do Contribuinte), aplicativo do SAT | Caixa postal oficial; credenciamento irrevogável e por prazo indeterminado | Credenciamento com certificado ICP-Brasil (MEI pode usar usuário e senha do SAT); acesso às mensagens com certificado **ou senha do SAT** (termo de responsabilização pelo uso da senha); **procuração eletrônica** a um CPF, com período definido (Anexo V) | Oficial: [NÃO ENCONTRADO]. Agregador: InfoSimples `sefaz/sc/dec/caixa-postal` (A1 PKCS#12) | **B** (ou C-cert / C-crc) | [R2-SC-DTEC], [R2-IS] · **[R2 conferido]** |
| Regra de ciência | Sem acesso em **10 dias** da postagem, o destinatário "será considerado automaticamente intimado"; contagem pelo art. 221-A, § 4º, da Lei 3.938/1966 | — | — | — | Ato DIAT 42/2020, Anexo I, cláusula sétima [R2-SC-DTEC] · **[R2 conferido]** |
| Certidão | Certidão de Débitos Estaduais / Negativa-Positiva | Nenhuma | Agregador `sefaz/sc/certidao-debitos` (adicional R$ 0,04) | B | [R2-IS] |
| DIME / DeSTDA | Dispensa por fases [D2:S20] | — | — | F/D | [R1 mantido, não conferido] |
| DARE-SC | Guia | — | [NÃO ENCONTRADO] | F via core | [R1 mantido] |

### I-11 · Receita Estadual do RS

| Serviço | O que é | Credencial | API? | Nível | Fonte e status |
| --- | --- | --- | --- | --- | --- |
| **DTE** (Lei 14.381/2013; IN RE 045/98) | Comunicações da Receita (notificações, intimações, avisos, autorregularização, recibos); credenciamento mantido após a baixa pelo prazo decadencial (IN RE 012/24) | Primeiro acesso com **e-CNPJ do contribuinte** para cadastrar o contato; depois, **procuração eletrônica** outorgada pelo CNPJ ao contabilista ou outro CPF. "Não bastando vínculos no cadastro do CGCTE." No novo Portal DTE (desde 09/05/2022) só lê quem tem procuração; no e-CAC estadual, sócio/administrador ou quem tem autorização eletrônica entra com usuário e senha, cartão Banrisul ou certificado | Oficial: [NÃO ENCONTRADO]. Agregador: **não há** DTE-RS no catálogo da InfoSimples [R2-IS] | **C-crc** (procurador com login próprio) ou C-cert; nunca dar ciência sem aprovação | [R2-RS-DTE] · **[R2 conferido]**. **Corrige a C-04** |
| Regra de ciência | Consulta não feita em **10 dias** do envio considera-se feita no fim do prazo (Lei 14.381/2013, art. 7º, § 2º, segundo trecho do buscador) | — | — | — | [R2 trecho] · confiança média |
| Leitura × ciência | A leitura e a ciência registradas num portal (DTE ou e-CAC) valem para o outro [R2-RS-DTE] | — | — | — | [R2 conferido] |
| Certidão de Situação Fiscal | — | Nenhuma | Agregador `sefaz/rs/certidao-debitos` (adicional R$ 0,04) | B | [R2-IS] |
| Guia do ICMS | Exige EFD validada [D2:S21] | Certificado | [NÃO ENCONTRADO] | F via core | [R1 mantido, não conferido] |

### I-12 a I-16 · Prefeituras das capitais: NFS-e e o Ambiente de Dados Nacional · [R2 conferido]

Planilha oficial de municípios aderentes de 28/09/2026 [R2-ADN]:

| Capital | Convênio | Aderente ao Ambiente Nacional | Aderente ao Emissor Nacional | Ativo na base / no último período | Publicação · início de vigência |
| --- | --- | --- | --- | --- | --- |
| São Paulo | Conveniado Ativo | Sim | Sim | Sim / Sim | 20/03/2023 · 22/12/2025 |
| Belo Horizonte | Conveniado Ativo | Sim | Sim | Sim / Sim | 02/09/2022 · 01/12/2022 |
| Curitiba | Conveniado Ativo | Sim | Sim | Sim / Sim | 23/09/2022 · 30/08/2023 |
| Florianópolis | Conveniado Ativo | Sim | Sim | Sim / Sim | 02/09/2022 · 27/08/2025 |
| Porto Alegre | Conveniado Ativo | Sim | Sim | Sim / Sim | 30/08/2022 · 17/04/2023 |

- Quadro geral da mesma planilha: 5.571 municípios listados; **5.543 aderentes ao Ambiente Nacional**, 2.875 ao Emissor Nacional; 5.462 ativos no último período. Nas cinco UFs: SP 645/645 aderentes ao AN (640 ativos no último período), MG 853/853 (850), PR 398/399 (398), SC 295/295 (295), RS 496/497 (495) [R2-ADN]. Isso **supera** o dado de 303 municípios ativos de out/2025 citado pelo D3 [D3:S5].
- Consequência: a captura de NFS-e (prestadas e tomadas) passa a ser **A pelo ADN** (API do V1, com o A1 do cliente) para as cinco capitais e para quase todos os municípios das cinco UFs. O integrador deixa de ser o caminho de captura e fica para emissão (se o cliente não usar o Emissor Nacional) e para exceções.
- **Cuidado:** a planilha diz que o município aderiu e está ativo; não diz se **todas** as notas do sistema próprio do município (ex.: NFS-e paulistana) chegam ao ADN desde quando nem com que defasagem. Teste obrigatório antes de desligar qualquer alternativa: baixar pelo ADN as notas de um CNPJ real de cada capital e comparar com o portal municipal (seção 5).
- A coluna "AderenteMAN" está "Não" nas cinco capitais; o significado da sigla não aparece na planilha [NÃO ENCONTRADO].
- Sistemas próprios (NFS-e paulistana, BHISS Digital, ISS Curitiba, NFS-e POA): nomes [R1 mantido, NÃO VERIFICADO]. Florianópolis: sistema próprio [NÃO ENCONTRADO].
- ISS e declarações de SP: ISS dia 10, NFTS, D-SUP [D2:S29] [R1 mantido, não conferido].
- DEC paulistano: manual de 19/06/2026 [D2:S24]; ciência tácita em 10 dias segundo trecho do buscador desta rodada [R2 trecho]; o manual oficial devolveu 403. Agregador: InfoSimples `pref/sp/sao-paulo/caixa-postal` (A1 PKCS#12; `ignora_nao_lidas`/`ignora_lidas`) [R2-IS]. DEC de Curitiba: ciência tácita em 10 dias (LC municipal 40/2001) [D2:S24] [R1 mantido].
- Certidões municipais por agregador (conferido no catálogo): São Paulo (Certidão Tributária Mobiliária, adicional R$ 0,04), Belo Horizonte (CND, R$ 0,08), Curitiba (CND, R$ 0,08), Florianópolis (CND, R$ 0,00), Porto Alegre (CND, R$ 0,04) [R2-IS].
- Nível: NFS-e **A** (ADN, V1) com teste de completude; DEC SP **B**; demais DEC **D**/C-cert; guias de ISS **F** (core) ou C-cert.

### I-17 · Integradores de NFS-e (emissão e captura) · parcialmente [R2 conferido]

| Fornecedor | O que oferece | Preço | Status |
| --- | --- | --- | --- |
| Focus NFe | API de emissão de NF-e, NFS-e, NFC-e, CT-e, MDF-e, NFCom e DC-e; "recebimento de NFe, CTe e NFSe Nacional"; diz ter integração com mais de 3.500 municípios e integrar município novo por **R$ 199** fixos em até 15 dias | Solo R$ 94,90/mês (1 CNPJ, 100 documentos, R$ 0,11 por adicional); Start R$ 119,90/mês (3 CNPJs, R$ 39,90 por CNPJ adicional, 100 documentos por CNPJ, R$ 0,11 por adicional); **Growth R$ 572,00/mês (CNPJs ilimitados, 4.000 documentos, R$ 0,125 por adicional)**; documento emitido **ou recebido** conta no pacote; 30 dias de teste | [R2-FOCUS] · **[R2 conferido]** |
| NFE.io | Emissão de NFS-e por API (CNPJ ilimitado nos planos anuais) | Mensal: Base R$ 190 (250 notas, adesão R$ 299), Crescimento R$ 265 (500, adesão R$ 499), Escala R$ 375 (1.000, adesão R$ 499); anual com 20% de desconto (ex.: Base R$ 1.825/ano); Enterprise sob consulta | [R2-NFEIO] · **[R2 conferido]**. Captura de NFS-e recebidas [D3:C8]: preço não aberto |
| PlugNotas (TecnoSpeed) | API para NFS-e "municipal e nacional", NF-e, NFC-e, MDF-e, NFCom, calculadora IBS/CBS | **[PREÇO NÃO PÚBLICO]** na página aberta | [R2-PLUG] · **[R2 conferido]** |
| eNotas | Página de preços voltada a infoprodutores (Hotmart etc.); preço por plano não extraído | [PREÇO NÃO PÚBLICO] no texto aberto | [R2 conferido], sem preço |
| Qive, Kolossus, Jettax | Captura de NFS-e | [NÃO VERIFICADO] | [R1 mantido, não conferido] (página de preços da Qive deu 404) |

Com as capitais no ADN, o integrador fica para **emissão** (NFE-039, GES-007) e o escritório compara o custo com a emissão direta pela API do Emissor Nacional (V1). Riscos comuns: guarda do A1 do cliente no integrador (LGPD e contrato).

### I-18 · Certidões estaduais e municipais por agregador · [R2 conferido]

| Campo | Conteúdo |
| --- | --- |
| Quem | **InfoSimples**: CND estadual das cinco UFs e uma API unificada `sefaz/certidao-debitos` ("unifica as 27 APIs individuais"), PGE-SP, CNDs municipais das cinco capitais e de dezenas de municípios das cinco UFs [R2-IS]. Concorrentes que embutem certidões (HubCount, Jettax, Dootax, Makro) [D2:C3][D2:C4][D2:C6][D2:C12] [R1 mantido] |
| Credencial | Maioria sem credencial; MG CND pede login ou certificado; PGE-SP CNDT pede login ou certificado [R2-IS] |
| Preço | Pré-pago, sem adesão, R$ 100 de crédito de avaliação (30 dias), **franquia mínima de R$ 100/mês** por conta. Preço base por consulta em cascata: R$ 0,20 (1–500), 0,16 (501–2.000), 0,14 (2.001–5.000), 0,13 (5.001–10.000), 0,11 (10.001–30.000), 0,10 (30.001–50.000), 0,09 (50.001–80.000), 0,07 (80.001–100.000), 0,05 (acima). Adicionais: CND SP R$ 0,08, MG 0,08, PR 0,07, SC 0,04, RS 0,04, unificada 0,08 [R2-IS, regras atualizadas em 26/10/2026] |
| Exemplo | 100 clientes × 5 certidões estaduais/municipais por mês = 500 consultas: 500 × R$ 0,20 + adicionais (~R$ 0,06 médio) ≈ **R$ 130/mês** (cálculo deste agente sobre a tabela) |
| Limites | Validades por órgão (SP agora 90 dias, I-07); horário do SIDEB (dias úteis, 6h–21h); agregador sem vínculo com os órgãos (a própria InfoSimples diz que opera "de maneira estritamente independente") |
| Nível | **B** (confiança alta para existência e preço); fallback **C-captcha** |

### I-19 · REDESIM e integradores estaduais · parcialmente [R2 conferido]

| Campo | Conteúdo |
| --- | --- |
| Integradores | SP: Via Rápida Empresa e JUCESP [D1:F49][D1:F51]; MG: integrador da JUCEMG [D1:F50]; PR, SC, RS: nomes [R1 mantido, NÃO VERIFICADO] |
| API oficial de consulta de processo | **[NÃO ENCONTRADO]** (busca de 06/11/2026 por "API", "webservice", "consulta andamento protocolo" com JUCEMG, JUCESC, JUCEPAR e REDESIM: nada oficial) |
| Agregador | **JUCESP:** InfoSimples `junta-comercial/sp/redesim/acp` mostra o status da **consulta prévia de viabilidade** de um protocolo REDESIM da JUCESP; pede protocolo + login (CPF e senha) ou certificado; adicional R$ 0,08 [R2-IS]. Cobre só a viabilidade, não o registro. Demais Juntas: [NÃO ENCONTRADO] no catálogo |
| Nível | Viabilidade em SP: **B**; demais consultas: **C-captcha/C-crc** ou **D** |

### I-20 · Juntas Comerciais · parcialmente [R2 conferido]

- API oficial: [NÃO ENCONTRADO] para as cinco Juntas (mesma busca da I-19).
- **JUCESP por agregador** [R2-IS]: certidão simplificada, fichas cadastrais simplificada e completa (PDF), lista e download de documentos arquivados, NIRE por filtros e por sócio (com login ou certificado; adicional R$ 0,08), consulta pública do licenciamento integrado (Facilita SP, adicional R$ 0,04). Demais Juntas: nada no catálogo.
- Atos e autenticação de livros: **D** [R1 mantido].

### I-21 · Corpo de Bombeiros · parcialmente [R2 conferido]

| UF | Sistema | API |
| --- | --- | --- |
| SP | Via Fácil Bombeiros [D1: SOC-037, R1] | Agregador: InfoSimples `pm/sp/licenca-bombeiros` consulta a situação de CLCB, AVCB e TAACB de um imóvel em SP, sem credencial, sem adicional [R2-IS] → **B** para consulta de validade |
| MG | Renovação no gov.br de MG [D1:F43][D1:F44] | [NÃO ENCONTRADO] |
| PR, SC, RS | [R1 mantido, NÃO VERIFICADO] | [NÃO ENCONTRADO] |

Vistoria e renovação: **D**.

### I-22 · Vigilância sanitária · [R1 mantido, não conferido]

Municipal na maioria; estadual em parte [D1:F50]. API [NÃO ENCONTRADO]. Nível **D**.

### I-23 · Domicílios eletrônicos (resumo estadual e municipal)

| Domicílio | Nome conferido | Ciência tácita | Acesso de terceiro | Agregador com API | Status |
| --- | --- | --- | --- | --- | --- |
| SP estadual | DEC | 10 dias (Port. CAT 140/2010, art. 5º) | Procuração eletrônica no DEC, procurador com certificado | InfoSimples (A1) | R2 conferido |
| MG | DT-e (SIARE) | 10 dias corridos (RPTA, art. 12, § 2º) | Procurador no SIARE, com e-CPF/e-CNPJ | InfoSimples (A1) | R2 conferido |
| PR | DT-e (Receita/PR) | 10 dias (Lei 17.079/2012, art. 9º, § 4º) | Procuração eletrônica no Receita/PR | InfoSimples (A1) | R2 conferido (lei em cópia) |
| SC | DTEC (SAT) | 10 dias (Ato DIAT 42/2020; Lei 3.938/1966, art. 221-A) | Procuração eletrônica a CPF; senha do SAT | InfoSimples (A1) | R2 conferido |
| RS | DTE | 10 dias (Lei 14.381/2013, art. 7º, § 2º) | Procuração eletrônica outorgada pelo CNPJ; vínculo no CGCTE não basta | **Não** | R2 conferido (prazo por trecho) |
| São Paulo (capital) | DEC paulistano | 10 dias (trecho) | [NÃO ENCONTRADO] | InfoSimples (A1) | parcial |
| Curitiba | DEC | 10 dias (LC 40/2001) [D2:S24] | [NÃO ENCONTRADO] | não | R1 mantido |
| BH, Florianópolis, Porto Alegre | [NÃO ENCONTRADO] | — | — | não | R1 mantido |

**Risco de ciência pela leitura (conferido como regra):** em SP, MG, PR e RS a comunicação se considera feita **no dia em que o teor é consultado** [R2-SP-DEC][R2-MG-DTE][R2-PR-DTE][R2-RS-DTE]. Um robô ou API que abra a mensagem pode iniciar o prazo. A InfoSimples oferece o parâmetro `ignora_nao_lidas` nas APIs de DEC de SP, MG e da capital paulista [R2-IS]; a documentação aberta não diz se a consulta das mensagens não lidas registra ciência [NÃO ENCONTRADO] (perguntar ao fornecedor, seção 5). Regra de produto: ler só a lista (assunto, data, status) com `ignora_nao_lidas`, alertar o responsável e só abrir o teor com aprovação.

---

## 2. Verificação por ficha

Formato: campos da seção 2.2 do protocolo, mais `status_r2`. Fichas sem item conferido mantêm o texto da rodada 1.

### 2.1 Registro de correções às fichas de descoberta

| # | Ficha | O que a ficha diz | Correção ou ressalva | Base · status |
| --- | --- | --- | --- | --- |
| C-01 | NFE-005 | Opção (1): "distribuição com o A1 do cliente quando a fonte devolver as emitidas" | **Confirmado:** a distribuição não devolve NF-e ao emitente (tabela do item 3: "Não"; regra H172, rejeição 641). Saídas de NF-e vêm por `autXML` com o CNPJ do escritório (baixadas com o e-CNPJ do escritório), por integração com o emissor/ERP, por SAE-NFC-e (SP, só NFC-e) ou por upload no app. Remover a opção (1) para NF-e; para NFS-e vale pelo ADN | [R2-NT] · R2 conferido |
| C-02 | NFE-007, GES-007, Plano 3.1 | ADN como fonte "A" geral da NFS-e | **Revisto:** as cinco capitais e quase todos os municípios das cinco UFs são aderentes e ativos no Ambiente Nacional (planilha de 28/09/2026). ADN vira a fonte A padrão; o fallback B fica para exceções e para falha no teste de completude | [R2-ADN] · R2 conferido |
| C-03 | FIS-026 | Nomes "PR DT-e" e "SC DTEC" | **Confirmados**: DT-e (Lei 17.079/2012, art. 6º) e DTEC (SEF-SC). SP é DEC; MG é DT-e; RS é DTE | [R2-PR-DTE][R2-SC-DTEC][R2-SP-DEC][R2-MG-DTE] · R2 conferido |
| C-04 | FIS-026 | (rodada 1) "No RS o contabilista vinculado acessa sem certificado e pode dar ciência" | **Corrigido:** no RS o vínculo no CGCTE não basta. O cliente faz o primeiro acesso com e-CNPJ e outorga **procuração eletrônica** ao contabilista; só então ele lê e dá ciência. Caminho: C-crc com procuração (ou B não disponível no RS), nunca ciência sem aprovação | [R2-RS-DTE] · R2 conferido |
| C-05 | FIS-025, NFE-026 | Guia estadual por robô C-cert | Mantido o ajuste da rodada 1 (RS depende da EFD; SP sem GIA) e, pela premissa 2, a guia vem do core (F/API do core) | [D2:S18][D2:S21] · R1 mantido |
| C-06 | SOC-027, SOC-030, Plano 3.2 | "Automação só para consultar andamento" | API oficial segue [NÃO ENCONTRADO]. **Novo:** em SP, status da viabilidade REDESIM/JUCESP por agregador (B). Demais: C-captcha/C-crc ou D | [R2-IS] · R2 conferido |
| C-07 | NFE-009 | "outras UFs via agregador (B)" | Agregador só consulta NFC-e nota a nota (MG, PR, SC, RS); não lista por CNPJ. B vale para conferência, não para captura em massa | [R2-IS] · R2 conferido |
| C-08 | NFE-010 | Distribuição de MDF-e a terceiros | Mantido [NÃO ENCONTRADO]; os atores da NF-e recebem só os **resumos de eventos** do MDF-e | [R2-NT] · R2 parcial |
| C-09 | NFE-028, SOC-003, FIS-030 | "CCC/Sintegra por agregador" | Agregador confirmado com preço (Sintegra das cinco UFs, unificada e CCC). Webservice oficial de consulta cadastro segue [R1, não conferido] | [R2-IS] · R2 parcial |
| C-10 | FIS-036 | Certidão estadual como uma só | **Corrigido para SP:** desde 14/10/2026 a Certidão Única (Sefaz + PGE) substitui o par eCND + CRDA, validade 90 dias (180 no Cadastro Fiscal Positivo). O kit de certidões continua modelando **certidão por órgão**, mas SP passa a ter uma só | [R2-SP-CND] · R2 conferido |
| C-11 (nova) | NFE-001, NFE-004 | Captura "começa no onboarding" (janela de 90 dias) | Reforço com regra oficial: NSU **sem retroativo** para usuário novo e interrupção após 60 dias sem consulta. O app precisa coletar o A1 do cliente **antes** do primeiro mês de serviço e o coletor tem de rodar ao menos a cada poucos dias | [R2-NT, item 3.4] · R2 conferido |
| C-12 (nova) | FIS-026, FIS-029 | DTE = robô C-cert | Há agregador com API (InfoSimples) para DEC SP, DT-e MG, DT-e PR, DTEC SC e DEC paulistano, usando o A1 do cliente; RS fica sem agregador. Nível passa a **B** em quatro UFs | [R2-IS] · R2 conferido |

### 2.2 Clientes, Societário e Legalização (D1)

#### SOC-003 · Vigiar o cadastro do CNPJ (parte estadual e municipal)
- `nível_automação`: **A** (consulta cadastral oficial, onde a UF responde) ou **B** (Sintegra/CCC por agregador, com preço); IM **D**.
- `integrações`: NfeConsultaCadastro [R1]; InfoSimples `sintegra/{uf}`, `sintegra/unificada`, `sefaz/cadastro-centralizado` [R2-IS].
- `credencial_exigida`: nenhuma no Sintegra; CCC por agregador pede A1-cli ou login.
- `preço`: oficial gratuito [NÃO VERIFICADO]; agregador R$ 0,05–0,20 + adicional R$ 0,00–0,10 por consulta, franquia R$ 100/mês [R2-IS].
- `limites_e_riscos`: UFs que não respondem o webservice; varredura em massa.
- `alternativa`: conferência mensal manual.
- `veredito`: **comprar** (B) para o monitoramento mensal; **integrar** o oficial quando confirmado.
- `confiança`: média (agregador alta; oficial baixa).
- `fontes_verificação`: [R2-IS] 06/11/2026.
- `status_r2`: conferido (agregador); oficial mantido da rodada 1.

#### SOC-005 · Controlar inscrições estaduais, municipais e o contador responsável
- `nível_automação`: **C-crc** em SP (REDESIM "Meus Clientes") [D1:F47]; **novo:** nas cinco UFs, o acesso do escritório aos domicílios eletrônicos depende de **procuração eletrônica** ou procurador cadastrado (SP DEC, MG SIARE, PR Receita/PR, SC DTEC, RS DTE) [R2-SP-DEC][R2-MG-DTE][R2-PR-DTE][R2-SC-DTEC][R2-RS-DTE] → checklist de onboarding por UF.
- `credencial_exigida`: login-ctb/gov.br (SP); certificado do cliente para outorgar procurações.
- `preço`: gratuito.
- `limites_e_riscos`: ato pessoal; Sefaz-SP notificou 15,4 mil contribuintes sem contabilista [D1:F48].
- `alternativa`: **D** com tarefa no onboarding/offboarding; pedido ao cliente pelo app.
- `veredito`: **só checklist + lembrete**, com a lista de procurações estaduais por UF como item obrigatório do onboarding no app.
- `confiança`: alta (procurações nos DTEs); média (SP CADESP).
- `fontes_verificação`: as citadas, 06/11/2026; [D1:F47][D1:F48].
- `status_r2`: conferido (procurações); CADESP mantido.

#### SOC-013 · Controlar procurações em outros órgãos (estadual e municipal)
- `nível_automação`: **D**; consulta padronizada de procurações [NÃO ENCONTRADO].
- `limites_e_riscos`: **conferido** o modelo de cada UF: SP procuração no DEC por prazo indeterminado; MG procurador no SIARE; PR procuração no Receita/PR (a do e-PAF, Res. SEFA 159/2019; prazo máximo de 5 anos segundo trecho do buscador); SC procuração com período definido (Ato DIAT 42/2020, Anexo V); RS procuração eletrônica outorgada pelo CNPJ.
- `alternativa`: matriz por órgão com validade, alimentada no onboarding do app.
- `veredito`: **só checklist + lembrete**.
- `confiança`: alta (existência e forma); média (prazos PR).
- `fontes_verificação`: [R2-SP-DEC][R2-MG-DTE][R2-PR-DTE][R2-SC-DTEC][R2-RS-DTE], 06/11/2026.
- `status_r2`: conferido.

#### SOC-025 · Fazer a consulta de viabilidade e a pré-análise da atividade
- `nível_automação`: pré-análise **construir** (M1); protocolo **D**; **acompanhamento da viabilidade em SP B** (InfoSimples `junta-comercial/sp/redesim/acp`, login ou certificado, adicional R$ 0,08) [R2-IS].
- `integrações`: VRE [D1:F49]; integrador JUCEMG [D1:F50]; PR, SC, RS [NÃO VERIFICADO].
- `credencial_exigida`: gov.br do solicitante [NÃO VERIFICADO]; login/certificado para o agregador.
- `preço`: viabilidade gratuita [NÃO VERIFICADO]; agregador ~R$ 0,28 por consulta na primeira faixa.
- `veredito`: **construir** a pré-análise; **comprar** o acompanhamento em SP.
- `confiança`: média.
- `fontes_verificação`: [D1:F11][D1:F12][D1:F49][D1:F50]; [R2-IS].
- `status_r2`: conferido (agregador SP); demais mantidos.

#### SOC-026 · Preparar e registrar o ato constitutivo
- Sem mudança. `nível_automação`: minuta **construir**; assinatura **B** (V3); protocolo **D**. `veredito`: **construir** minuta e prazo; protocolo humano. `confiança`: média. `fontes_verificação`: [D1:F39][D1:F40]. `status_r2`: mantido da rodada 1 (não conferido).

#### SOC-027 · Obter CNPJ e inscrições
- `nível_automação`: SP viabilidade **B** [R2-IS]; demais **C-captcha/C-crc** ou **D**; detecção indireta da IE nova pela consulta cadastral (I-06, agora com agregador B).
- `limites_e_riscos`: API oficial de andamento [NÃO ENCONTRADO] (busca de 06/11/2026).
- `veredito`: **só checklist + lembrete**, com detecção indireta (Sintegra B) e acompanhamento B em SP.
- `confiança`: média.
- `status_r2`: conferido (agregador, ausência de API oficial).

#### SOC-029 · Fazer alterações contratuais e cadastrais
- Sem mudança. **D** no protocolo; cascata interna **construir**. Fichas da JUCESP por agregador (B) servem para conferir o resultado [R2-IS]. `confiança`: média. `status_r2`: parcial.

#### SOC-030 · Acompanhar processos e responder exigências
- `nível_automação`: SP viabilidade **B**; registro na Junta e demais UFs **C-captcha** ou **D**; resposta **rascunho** M1.
- `veredito`: **só checklist + lembrete**; agregador em SP.
- `confiança`: média.
- `status_r2`: conferido (agregador SP); demais mantidos.

#### SOC-031 · Encerrar a empresa (baixa) (parte estadual e municipal)
- `nível_automação`: **D**; diagnóstico prévio com certidões estaduais/municipais por agregador (**B**, I-18) e conta-corrente C-cert.
- `limites_e_riscos`: baixa da IE não atesta inexistência de débito [D1:F17][D1:F18]; no RS o credenciamento no DTE continua após a baixa pelo prazo decadencial (IN RE 012/24) [R2-RS-DTE] → manter a leitura do DTE do cliente baixado.
- `veredito`: **só checklist**. `confiança`: média.
- `status_r2`: parcial (RS conferido).

#### SOC-033 · Abrir filial ou transferir sede entre UFs
- Sem mudança. **D**; checklist por par de UFs. Novo item do checklist: credenciar o DTE e outorgar procuração na UF nova (I-23). `confiança`: baixa. `status_r2`: mantido.

#### SOC-035 · Mapear as licenças exigidas por cliente
- Sem mudança. **construir** (M1). `confiança`: média. `status_r2`: mantido.

#### SOC-036 · Obter e renovar o alvará de funcionamento
- Sem mudança. **D**. Em SP, consulta do licenciamento integrado (Facilita SP) por agregador (B, adicional R$ 0,04) [R2-IS]. `status_r2`: parcial.

#### SOC-037 · Obter e renovar o AVCB/CLCB
- `nível_automação`: renovação **D**; **consulta de validade em SP B** (InfoSimples `pm/sp/licenca-bombeiros`, sem credencial, sem adicional) [R2-IS]; MG, PR, SC, RS [NÃO ENCONTRADO].
- `preço`: taxa estadual [NÃO VERIFICADO]; consulta SP R$ 0,05–0,20.
- `veredito`: **só checklist + lembrete**, com conferência automática de validade em SP.
- `confiança`: média.
- `status_r2`: conferido (SP agregador).

#### SOC-038 · SOC-039 · SOC-040 · Licença sanitária, ambiental, conselhos
- Sem mudança: **D**, **só checklist + lembrete**, confiança baixa. `status_r2`: mantido da rodada 1 (não conferido).

#### SOC-042 · Autenticar livros digitais na Junta
- Sem mudança. Preparação **construir**; envio **D**. `status_r2`: mantido.

#### SOC-046 · Calendário societário e de legalização
- **construir**; consome validades de I-18 (SP agora 90/180 dias) e I-21. `confiança`: média. `status_r2`: parcial.

### 2.3 Fiscal e Obrigações (D2)

#### FIS-001 · Gerar o calendário mensal de obrigações (parte estadual e municipal)
- `nível_automação`: **construir**; API de calendário estadual ou municipal [NÃO ENCONTRADO].
- `limites_e_riscos`: MG mudou a apuração (DAPI 1 → EFD, Portarias SRE 285 e 296/2026) [R2-MG-DAPI]; prazo geral de MG e calendário do PR [NÃO ENCONTRADO] em fonte oficial de 2026; SP GIA, SC DIME, RS prazos [R1 mantido].
- `veredito`: **construir** (matriz curada por pessoa).
- `confiança`: média.
- `status_r2`: parcial (MG conferido em secundária).

#### FIS-007 · Procurações em outros órgãos
- Ver SOC-013 (conferido). **D**, **só checklist + lembrete**.

#### FIS-024 · Controlar as obrigações estaduais de cada UF
- `nível_automação`: **construir**; entrega pelo core (**F**/API do core).
- `limites_e_riscos`: MG DAPI 1 residual só para escrituração centralizada ou IE única com vários estabelecimentos [R2-MG-DAPI]; demais [R1 mantido].
- `veredito`: **construir**. `confiança`: média (SP, SC, RS, MG); baixa (PR).
- `status_r2`: parcial.

#### FIS-025 · Emitir guias estaduais e enviar
- `nível_automação`: **F/API do core** (premissa 2); robô C-cert só como exceção. API oficial de guia [NÃO ENCONTRADO]; agregador só para GARE de dívida ativa em SP (`pge/sp/emissao-gare`) [R2-IS].
- `veredito`: **integrar via core**.
- `confiança`: média.
- `status_r2`: parcial.

#### FIS-026 · Ler os domicílios tributários eletrônicos estaduais
- `nível_automação`: **B** em SP, MG, PR e SC (InfoSimples, com o A1 do cliente do cofre); **C-crc** com procuração eletrônica no RS (sem agregador). API oficial [NÃO ENCONTRADO] nas cinco.
- `integrações`: `sefaz/sp/dec/caixa-postal`, `sefaz/mg/dec/caixa-postal`, `sefaz/pr/dec/caixa-postal`, `sefaz/sc/dec/caixa-postal` [R2-IS]; portais oficiais (I-07 a I-11).
- `credencial_exigida`: A1-cli em PKCS#12 enviado a cada chamada ao agregador [R2-IS] (o certificado sai do cofre para um terceiro: cláusula no termo de uso do app e no contrato com o fornecedor); RS: procuração eletrônica do cliente ao contabilista.
- `preço`: preço base R$ 0,05–0,20 por consulta, sem adicional nos DECs [R2-IS]. Ex.: 100 clientes × 4 leituras/mês = 400 consultas ≈ R$ 80, abaixo da franquia de R$ 100.
- `limites_e_riscos`: ciência tácita de 10 dias em todas as cinco UFs (I-23); ciência pela consulta ao teor (SP, MG, PR, RS); SP, PR e SC devolvem só a **primeira página** da caixa; MG uma página com filtro de data [R2-IS]; efeito do `ignora_nao_lidas` sobre ciência [NÃO ENCONTRADO].
- `alternativa`: robô C-cert próprio; lembrete semanal (D).
- `veredito`: **comprar (B)** para SP, MG, PR, SC; **C-crc com aprovação** ou lembrete no RS; nunca abrir o teor nem dar ciência sem aprovação.
- `confiança`: alta (regras e existência do agregador); média (comportamento do agregador quanto à ciência).
- `fontes_verificação`: [R2-SP-DEC][R2-MG-DTE][R2-PR-DTE][R2-SC-DTEC][R2-RS-DTE][R2-IS], 06/11/2026.
- `status_r2`: conferido.

#### FIS-027 · Consultar conta-corrente e pendências estaduais
- `nível_automação`: certidão como sentinela **B** (I-18); SP: Relatório de Pendências Fiscais no SIDEB (e-CNPJ ou poderes no CADESP) **C-cert** [R2-SP-CND]; MG: parcelamento, dívida ativa e CADIN por agregador **B** [R2-IS]; demais C-cert.
- `veredito`: **comprar (B)** a certidão mensal + consultas públicas; robô só onde a dor for grande.
- `confiança`: média.
- `status_r2`: parcial.

#### FIS-028 · Apurar e emitir guias de ISS e entregar declarações municipais
- `nível_automação`: apuração **construir** sobre NFS-e capturadas pelo **ADN (A)** [R2-ADN]; guias e declarações **F** (core) ou C-cert.
- `limites_e_riscos`: regras de ISS das capitais [R1 mantido]; guia unificada do ADN para municípios aderentes [NÃO VERIFICADO; V1].
- `veredito`: **construir apuração + F para guias**.
- `confiança`: média.
- `status_r2`: parcial (ADN conferido).

#### FIS-029 · Ler os domicílios eletrônicos municipais
- `nível_automação`: DEC paulistano **B** (InfoSimples `pref/sp/sao-paulo/caixa-postal`, A1, sem adicional) [R2-IS]; Curitiba C-cert; BH, Florianópolis, Porto Alegre **D** (existência [NÃO ENCONTRADO]).
- `limites_e_riscos`: SP e Curitiba com ciência tácita de 10 dias ([R2 trecho] e [D2:S24]).
- `veredito`: **comprar (B)** em SP; lembrete nas demais.
- `confiança`: média.
- `status_r2`: parcial.

#### FIS-030 · Vigiar a situação cadastral (IE e IM)
- Ver SOC-003. **A**/**B**; IM **D**. `status_r2`: conferido (agregador).

#### FIS-036 · Emitir, monitorar a validade e entregar certidões (estaduais e municipais)
- `nível_automação`: **B**; fallback **C-captcha**.
- `integrações`: InfoSimples `sefaz/certidao-debitos` (unificada) ou por UF; `pge/sp/cndt`; CNDs municipais das cinco capitais [R2-IS]; SIDEB oficial em SP [R2-SP-CND].
- `credencial_exigida`: nenhuma na maioria; MG e PGE-SP com login ou certificado.
- `preço`: base R$ 0,05–0,20 + adicional R$ 0,00–0,08; franquia R$ 100/mês [R2-IS].
- `limites_e_riscos`: SP Certidão Única com 90 dias de validade (180 no Cadastro Fiscal Positivo) e horário 6h–21h em dias úteis [R2-SP-CND]; validades das demais UFs [D2:S26, R1].
- `alternativa`: humano resolvendo CAPTCHA pelo celular; emissão no portal oficial.
- `veredito`: **comprar**; entrega ao cliente pelo app.
- `confiança`: alta (existência, preço, regra SP); média (validades das outras UFs).
- `fontes_verificação`: [R2-IS][R2-SP-CND], 06/11/2026.
- `status_r2`: conferido.

#### FIS-037 · Diagnosticar e resolver o que impede a certidão
- `nível_automação`: diagnóstico **construir**; em SP, o Relatório de Pendências e o pedido de correção (prazo de 15 dias para recurso) ficam no SIDEB com e-CNPJ [R2-SP-CND]; resolução **D**.
- `veredito`: **construir**. `confiança`: média. `status_r2`: parcial.

#### FIS-038 · Tratar intimações estaduais e municipais
- `nível_automação`: detecção via FIS-026/029 (**B** em quatro UFs); prazo conta da ciência (10 dias de tácita, I-23); resposta **rascunho** M1; protocolo **D**.
- `veredito`: **construir** o fluxo. `confiança`: média. `status_r2`: parcial.

#### FIS-043 · Levantar ressarcimento de ICMS-ST e créditos estaduais
- Sem mudança. Varredura **construir** sobre XMLs da I-01; pedido **D**. `status_r2`: mantido.

### 2.4 Notas fiscais (D3)

#### NFE-001 · Configurar a captura de documentos fiscais
- `nível_automação`: **construir** o perfil de captura sobre I-01 (A), I-03 (A), I-05 (A em SP), ADN (A, V1) e upload no app.
- `credencial_exigida`: A1-cli do cofre (enviado pelo cliente no app); e-CNPJ-esc para o `autXML`.
- `limites_e_riscos`: **NSU sem retroativo para usuário novo** e interrupção após 60 dias sem consulta; janela de 90 dias [R2-NT] → o pedido do A1 é o primeiro passo do onboarding no app.
- `veredito`: **construir**. `confiança`: alta.
- `fontes_verificação`: [R2-NT][R2-SP-SAE][R2-ADN], 06/11/2026.
- `status_r2`: conferido.

#### NFE-003 · Monitorar a saúde da captura
- `nível_automação`: **construir**. Sinais conferidos: 137 (esperar 1 h), 656 (bloqueio 1 h; o XML da 656 traz o último NSU consultado), 641 (consulta indevida de nota emitida), 632 (fora dos 90 dias); alerta se algum cliente passar de ~50 dias sem consulta [R2-NT].
- `veredito`: **construir**. `confiança`: alta. `status_r2`: conferido.

#### NFE-004 · Capturar as NF-e de entrada
- `nível_automação`: **A** (I-01 + I-02 para ciência).
- `credencial_exigida`: A1-cli.
- `preço`: gratuito [R2-NT, sem previsão de cobrança].
- `limites_e_riscos`: consumo indevido (656); janela de 90 dias; sem NSU retroativo; cofre de A1 (LGPD).
- `alternativa`: `autXML` com o CNPJ do escritório (fornecedores que aceitarem); upload no app.
- `veredito`: **construir**. `confiança`: alta.
- `fontes_verificação`: [R2-NT]; [D3:S3].
- `status_r2`: conferido (distribuição); manifestação mantida.

#### NFE-005 · Obter as notas de saída
- `nível_automação`: **A** via `autXML` do escritório (I-01, e-CNPJ-esc) e SAE-NFC-e em SP (A1-cli); **B/F** integração com emissor/ERP; **D** upload no app. Distribuição ao próprio emitente **não existe** (C-01 confirmada).
- `credencial_exigida`: e-CNPJ-esc (`autXML`); A1-cli (SAE-NFC-e, que exige o certificado do próprio contribuinte).
- `preço`: gratuito (A).
- `limites_e_riscos`: depende de o cliente configurar o `autXML` no emissor (o app pode pedir isso como tarefa do onboarding); NF-e emitidas antes da configuração só por upload.
- `veredito`: **construir** (`autXML` + upload) e **integrar** emissores comuns.
- `confiança`: alta.
- `fontes_verificação`: [R2-NT][R2-SP-SAE], 06/11/2026.
- `status_r2`: conferido.

#### NFE-006 · Capturar CT-e e CT-e OS
- Sem mudança: **A** (I-03), A1-cli, **construir**. `status_r2`: mantido (NT 2015.002 não reaberta).

#### NFE-007 · Capturar NFS-e pelo ADN (parte municipal)
- `nível_automação`: **A** (API do ADN, V1) para as cinco capitais e 2.687 de 2.689 municípios das cinco UFs (aderentes ao AN na planilha de 28/09/2026); **B** só para exceções.
- `credencial_exigida`: A1 do mesmo CNPJ raiz [D3:S4] (premissa 1).
- `limites_e_riscos`: HTTP 429 [D3:S4]; completude das notas de sistemas municipais próprios no ADN [NÃO ENCONTRADO] → teste por capital.
- `veredito`: **integrar** ADN + mapa município → fonte (gerado da planilha oficial, atualizado a cada nova versão).
- `confiança`: alta (adesão); média (completude).
- `fontes_verificação`: [R2-ADN], 06/11/2026; [D3:S4].
- `status_r2`: conferido.

#### NFE-008 · Capturar NFS-e de municípios fora do ADN e de PDFs
- `nível_automação`: **D** (upload + extração de PDF) para os poucos municípios fora do ADN; **B** consulta nota a nota por agregador (ex.: NFS-e paulistana `pref/sp/sao-paulo/nfs`, adicional R$ 0,04, ou OCR `nfs-ocr`) [R2-IS] para validar PDFs.
- `veredito`: **construir** extração de PDF; **não comprar** captura em massa enquanto o teste do ADN passar.
- `confiança`: média.
- `status_r2`: conferido.

#### NFE-009 · Capturar as NFC-e do varejo
- `nível_automação`: **A** em SP (SAE-NFC-e, A1-cli, limite por IP/minuto) [R2-SP-SAE]; demais UFs **F/B** pela integração com o PDV/emissor; agregador só nota a nota [R2-IS].
- `veredito`: **integrar** SAE-NFC-e; demais pelo emissor do cliente.
- `confiança`: alta (SP); média (demais).
- `status_r2`: conferido.

#### NFE-010 · Controlar MDF-e
- `nível_automação`: emitente **A** [NÃO VERIFICADO]; terceiros recebem só resumos de eventos de MDF-e pela distribuição da NF-e [R2-NT]. `veredito`: **integrar** para emitentes. `confiança`: baixa. `status_r2`: parcial.

#### NFE-011 · Capturar notas de produtor rural
- Sem mudança: **A** quando o produtor emite contra o cliente; **D** para PF sem certificado. `status_r2`: mantido.

#### NFE-013 · Outros modelos (NF3e, NFCom)
- Sem mudança: [NÃO ENCONTRADO]; **D**. `status_r2`: mantido.

#### NFE-014 · Registrar a Ciência da Operação
- `nível_automação`: **A** (I-02); a ciência libera o XML completo [R2-NT].
- `credencial_exigida`: A1-cli + autorização do cliente registrada no app.
- `veredito`: **construir**, automático. `confiança`: média (códigos e prazos não reabertos). `status_r2`: parcial.

#### NFE-015 · Manifestação conclusiva no prazo
- Sem mudança: **A** com aprovação; prazo de 90 dias [D3:S3]. `status_r2`: mantido.

#### NFE-016 · Detectar notas emitidas indevidamente contra o CNPJ
- `nível_automação`: **A**: o destinatário recebe o `resNFe` de toda nota em que figura, antes de manifestar [R2-NT]; desconhecimento via I-02 com aprovação.
- `veredito`: **construir**. `confiança`: alta. `status_r2`: conferido.

#### NFE-017 · Desacordo no CT-e
- Sem mudança. `status_r2`: mantido.

#### NFE-018 · Monitorar cancelamentos, CC-e e outros eventos
- `nível_automação`: **A**: cancelamento chega ao destinatário mesmo sem manifestação; CC-e ao destinatário (após manifestação), transportador e `autXML`; eventos do Fisco ao emitente e ao destinatário [R2-NT].
- `veredito`: **construir**. `confiança`: alta. `status_r2`: conferido.

#### NFE-020 / NFE-021 · Conferir completude de saídas e entradas
- `nível_automação`: **construir**; consulta por chave (`consChNFe`, até 20 por hora por CNPJ) para notas só com resumo [R2-NT].
- `confiança`: alta. `status_r2`: conferido.

#### NFE-025 / NFE-026 · ST, DIFAL/antecipação e guia
- Sem mudança: cálculo **construir**; guia **F** via core (premissa 2). `status_r2`: mantido.

#### NFE-027 · Conferir ISS e retenções nas NFS-e
- **construir** sobre NFS-e do ADN. `status_r2`: parcial.

#### NFE-028 · Verificar a regularidade cadastral dos emitentes
- `nível_automação`: **B** (Sintegra/CCC por agregador, com preço) [R2-IS]; **A** oficial [R1, não conferido].
- `veredito`: **comprar** como padrão; integrar o oficial quando confirmado. `confiança`: média. `status_r2`: parcial.

#### NFE-031 · Acompanhar a migração ao Emissor Nacional da NFS-e (parte municipal)
- `nível_automação`: **construir** um vigia da planilha oficial de aderentes (versões datadas em `gov.br/nfse/.../monitoramento-adesoes`) [R2-ADN].
- `limites_e_riscos`: as cinco capitais já aderentes ao AN e ao Emissor Nacional; data de obrigatoriedade do Simples (01/09 × 01/11/2026) [D3:S5][D3:S6] não reaberta.
- `veredito`: **construir**. `confiança`: alta (adesão). `status_r2`: conferido.

#### NFE-039 · Emitir notas fiscais pelo cliente
- `nível_automação`: **A** pelo Emissor Nacional/API (V1) nas capitais aderentes; **B** por integrador se o cliente quiser um só emissor para NF-e, NFC-e e NFS-e.
- `preço`: Focus NFe a partir de R$ 94,90/mês (Growth R$ 572/mês para CNPJs ilimitados e 4.000 documentos) [R2-FOCUS]; NFE.io NFS-e a partir de R$ 190/mês + adesão [R2-NFEIO]; PlugNotas [PREÇO NÃO PÚBLICO] [R2-PLUG].
- `veredito`: **integrar** Emissor Nacional para NFS-e; **comprar** integrador só para NF-e/NFC-e se o escritório emitir pelo cliente.
- `confiança`: média.
- `status_r2`: conferido (preços e adesão).

### 2.5 Contábil (D5)

#### CTB-044 · CTB-052
- Sem mudança: arquivamento e autenticação na Junta **D**. `status_r2`: mantido.

### 2.6 Consultoria e Reforma (D6)

#### CON-006 · CON-026 · CON-027
- Sem mudança (pesquisa e rascunho **construir**; protocolo **D**; saldo de ICMS pela EFD do core). `status_r2`: mantido.

### 2.7 Gestão do escritório (D7)

#### GES-007 · Emitir a NFS-e dos honorários do próprio escritório
- `nível_automação`: **A** pelo Emissor Nacional/API (V1): as cinco capitais são aderentes ao Emissor Nacional [R2-ADN].
- `credencial_exigida`: e-CNPJ do escritório.
- `preço`: gratuito pelo Emissor Nacional; integrador só se preferir (I-17).
- `veredito`: **integrar** (A).
- `confiança`: alta (adesão do município); média (API, V1).
- `status_r2`: conferido.

#### GES-061 · Obrigações do próprio escritório ("cliente zero")
- Reusa as integrações. `status_r2`: mantido.

---

## 3. O que não existe ou exige robô com credencial

### 3.1 Não existe hoje (E) ou não encontrado

| Item | Situação (06/11/2026) | Fichas |
| --- | --- | --- |
| API oficial de andamento de processos da REDESIM e das Juntas | [NÃO ENCONTRADO]; só agregador para viabilidade na JUCESP | SOC-027, SOC-030 |
| API oficial de DTE estadual (cinco UFs) | [NÃO ENCONTRADO]; agregador em SP, MG, PR, SC; nada no RS | FIS-026, FIS-038 |
| API oficial de conta-corrente estadual | [NÃO ENCONTRADO] | FIS-027, FIS-037 |
| API oficial de guia estadual | [NÃO ENCONTRADO]; guia vem do core | FIS-025, NFE-026 |
| API oficial de certidão estadual ou municipal | [NÃO ENCONTRADO]; agregador cobre as cinco UFs e as cinco capitais | FIS-036 |
| Distribuição oficial de NFC-e fora de SP | [NÃO ENCONTRADO] | NFE-009 |
| Distribuição do MDF-e a terceiros | [NÃO ENCONTRADO]; só resumos de eventos | NFE-010 |
| API de Bombeiros e vigilância | [NÃO ENCONTRADO]; consulta de licença em SP por agregador | SOC-037, SOC-038 |
| Distribuição de NF-e ao próprio emitente | **Não existe** (confirmado, R2-NT) | NFE-005 |

### 3.2 Exige robô com certificado (C-cert)

| Robô | Credencial | Fichas | Prioridade |
| --- | --- | --- | --- |
| DTE estadual próprio | — | FIS-026 | **Baixa**: comprar B em SP, MG, PR, SC |
| Conta-corrente estadual (PFE/SIDEB SP, SIARE MG, Receita/PR, SAT SC, RS) | A1-cli ou procurador | FIS-027, FIS-037 | Média (certidão B como sentinela) |
| Guias estaduais | — | FIS-025 | **Fora**: core (premissa 2) |
| DEC de Curitiba | A1-cli | FIS-029 | Baixa |
| Guias e declarações de ISS | — | FIS-028 | Fora: core |
| Captura de NFS-e fora do ADN | — | NFE-008 | Fora: poucos municípios; upload |

### 3.3 Exige login pessoal do contador (C-crc) · nunca executar sem aprovação do dono do login

| Serviço | Por que é C-crc | Fichas |
| --- | --- | --- |
| DTE do RS | Leitura e ciência por procurador com procuração eletrônica do CNPJ; sem agregador [R2-RS-DTE] | FIS-026 |
| DTEC SC por senha do SAT | Alternativa ao A1, com termo de responsabilização pelo uso da senha [R2-SC-DTEC] | FIS-026 |
| Vínculo do contabilista em SP (REDESIM "Meus Clientes") | Ato pessoal [D1:F47] | SOC-005 |
| Ações em processos da REDESIM | gov.br do contador ou do sócio | SOC-027, SOC-030 |

### 3.4 Esbarra em CAPTCHA (C-captcha)

| Serviço | Situação | Fichas |
| --- | --- | --- |
| Certidões estaduais e municipais | Cobertas por agregador (B); C-captcha só como fallback | FIS-036 |
| Sintegra/CCC | Coberto por agregador (B) | SOC-003, FIS-030, NFE-028 |
| Consultas públicas das Juntas fora de SP | [R1 mantido] | SOC-027, SOC-030 |

Regras para C e para B com certificado: registro de quem autorizou o uso da credencial (aceite do cliente no app), termos de uso do portal e do fornecedor, plano de manutenção, e **cláusula sobre o envio do A1 ao agregador** (a InfoSimples recebe o PKCS#12 e a senha em cada chamada [R2-IS]).

---

## 4. Lacunas e perguntas

### 4.1 Perguntas aos órgãos

1. **Sefaz SP, MG, PR, SC, RS:** existe API ou credenciamento de desenvolvedor para DTE, conta-corrente ou guia? (Nada encontrado em 06/11/2026.) Listar mensagens sem abrir o teor registra ciência?
2. **Sefaz-SP:** qual o limite de requisições por IP/minuto do SAE-NFC-e? Há CAPTCHA no fluxo de emissão do SIDEB?
3. **Demais Sefaz:** há serviço equivalente ao SAE-NFC-e?
4. **Ambiente Nacional NF-e:** confirmar no portal oficial (que recusou `curl`) que a v1.40 é a vigente; distribuição de MDF-e, NF3e e NFCom a terceiros.
5. **Prefeituras das capitais e CGNFS-e:** desde quando as notas do sistema próprio de cada capital chegam ao ADN? Há defasagem? O que significa a coluna "AderenteMAN"?
6. **Prefeituras de BH, Florianópolis e Porto Alegre:** têm domicílio eletrônico? Qual a regra de ciência?
7. **REDESIM/Juntas:** existe API de consulta de processo por convênio?
8. **Bombeiros MG, PR, SC, RS:** há consulta pública de validade por CNPJ ou endereço?

### 4.2 Perguntas a fornecedores

1. **InfoSimples:** (a) a consulta de DEC com `ignora_nao_lidas=false` abre a mensagem e registra ciência em cada UF? (b) como o PKCS#12 é tratado (retenção, logs, criptografia, DPA LGPD)? (c) paginação completa da caixa (hoje "primeira página" em SP, PR, SC)? (d) previsão de DTE-RS? (e) preço pós-pago e SLA quando o portal muda.
2. **Dootax, Jettax, Makro:** DTE por API (não só painel), UFs cobertas e preço, para comparar com a InfoSimples.
3. **Focus NFe, NFE.io, PlugNotas:** preço de **captura** de NFS-e recebidas e de NF-e para escritório com centenas de CNPJs, e se a captura de NFS-e usa o ADN; PlugNotas: tabela de preço.
4. **SIEG e Qive:** preço de captura por CNPJ, para comparar com construir sobre a fonte A gratuita (agora com regras conferidas).

### 4.3 Roteiro de buscas para a próxima rodada

1. NT 2015.002 (CT-e) e manual do MDF-e (não encerrados e distribuição) nos portais oficiais.
2. Nota Técnica dos Serviços de Apoio à Escrituração da NFC-e (SP): limites.
3. Texto oficial da Lei 14.381/2013 (RS) e da Lei 17.079/2012 (PR) nos sites dos governos.
4. Calendários oficiais 2026 de MG (RICMS, prazos de recolhimento) e PR.
5. Domicílio eletrônico de BH, Florianópolis e Porto Alegre.
6. Documentação do ADN para contribuinte (distribuição por NSU) e teste de completude por capital (com o V1).
7. Preços de Dootax, Jettax, Makro, SIEG, Qive.

### 4.4 Hosts

A rede da sessão alcançou todos os hosts usados nesta rodada. Exceções: `www.nfe.fazenda.gov.br` (laço de redirecionamento com `curl`), `smartsampa.prefeitura.sp.gov.br` (403), `www.coad.com.br` (403).

### 4.5 Lacunas que mudam decisão

| Lacuna | Situação em 06/11/2026 | Por que importa |
| --- | --- | --- |
| Adesão das 5 capitais ao ADN | **Resolvida:** todas aderentes e ativas | Captura de NFS-e é A (grátis); integrador só para emissão |
| Completude das notas das capitais no ADN | Aberta | Pode exigir fallback em alguma capital |
| API de DTE em fornecedor B | **Resolvida em parte:** InfoSimples em SP, MG, PR, SC; RS sem | Comprar em vez de construir quatro robôs |
| Ciência por leitura no DTE | Regra conferida (ciência na consulta ao teor); comportamento do agregador aberto | Risco jurídico da leitura automática |
| Validação do C-01 | **Resolvida:** confirmada | Saídas de NF-e por `autXML` + upload |
| Preços de captura (SIEG, Qive) × construir | Aberta | Build × buy da aba Notas (a fonte A está confirmada e é grátis) |

---

## 5. Contatos e próximos passos com fornecedores e órgãos

| # | Com quem | Canal encontrado (06/11/2026) | O que pedir | Para quê | Prioridade |
| --- | --- | --- | --- | --- | --- |
| 1 | **InfoSimples** | suporte@infosimples.com.br (atendimento em dias úteis, 9h–18h) [R2-IS]; conta com R$ 100 de crédito de teste | Respostas da seção 4.2 item 1; DPA/LGPD; teste com o A1 de um cliente piloto em SP, MG, PR e SC (lista de mensagens sem abrir); teste das CNDs das cinco UFs e capitais | Fechar FIS-026 e FIS-036 em B | Alta |
| 2 | **CGNFS-e / Receita Federal (NFS-e)** | Canais de atendimento do portal `gov.br/nfse` (página "Canais de Atendimento", não aberta) | Defasagem e completude das notas das capitais no ADN; significado de "AderenteMAN" | Fechar NFE-007 | Alta (com o V1) |
| 3 | **Teste interno ADN** | — | Baixar pelo ADN 1 mês de NFS-e prestadas e tomadas de um cliente de cada capital (A1 do cofre) e comparar com o portal municipal | Desligar ou manter fallback por capital | Alta |
| 4 | **Teste interno NF-e** | — | Ligar o `distNSU` com o e-CNPJ do escritório (fluxo `autXML`) e com o A1 de um cliente; medir 137/656 e a regra dos 60 dias | Validar NFE-004 e NFE-005 | Alta |
| 5 | **Focus NFe, NFE.io, TecnoSpeed (PlugNotas)** | Formulários "Solicite um contato"/"Fale conosco" nas páginas de preço [R2-FOCUS][R2-NFEIO][R2-PLUG] | Preço para escritório multi-CNPJ, captura × emissão, uso do ADN | Decidir NFE-039 e GES-007 | Média |
| 6 | **Dootax, Jettax, Makro** | [NÃO ENCONTRADO] canal (sites não abertos nesta rodada) | DTE por API e preço | Concorrência para o item 1 | Média |
| 7 | **Sefaz-SP** | Fale Conosco 0800-0170110 (fixo) e 11-2930-3750 (móvel) [rodapé de R2-SP-SAE]; SIFALE para o SIDEB [R2-SP-CND] | Limite do SAE-NFC-e; CAPTCHA no SIDEB; API para DEC | I-05, I-07 | Baixa |
| 8 | **SEF-SC** | 0800-048-1515; Ouvidoria 0800-6448500 [R2-SC-DTEC] | API para DTEC; ciência por listagem | I-10 | Baixa |
| 9 | **Receita Estadual RS** | Portal de atendimento `atendimento.receita.rs.gov.br` (ouvidoria com protocolo) [R2-RS-DTE] | API ou serviço para software de terceiros ler o DTE com procuração | Única UF sem agregador | Média |
| 10 | **SEF-MG, SEFA-PR** | [NÃO ENCONTRADO] canal nesta rodada | API para DT-e; calendário oficial 2026 (PR) | I-08, I-09, FIS-001 | Baixa |
| 11 | **Juntas (JUCESP, JUCEMG, JUCEPAR, JUCESC, JUCISRS) / DREI** | [NÃO ENCONTRADO] canal de desenvolvedor | API de consulta de processo por convênio | SOC-027, SOC-030 | Baixa |

**Itens para o app do cliente (decorrem desta rodada):**

1. Pedir o A1 no primeiro dia do onboarding e ligar o coletor de NF-e no mesmo dia (NSU sem retroativo; janela de 90 dias).
2. Pedir ao cliente que inclua o CNPJ do escritório no `autXML` do emissor de NF-e.
3. Checklist de procurações estaduais por UF: DEC SP, procurador no SIARE MG, Receita/PR, DTEC SC, DTE RS (no RS é a única forma de o escritório ler o DTE).
4. Aceite do cliente para o uso do A1 por fornecedores (agregador de DTE e certidões) e para a ciência da operação automática.

---

## Rodada 3 (6/11/2026): fichas do ciclo de vida

**Escopo.** Das 73 fichas novas (entrada, transição e desligamento), 13 dependem de Sefaz, Junta, REDESIM ou prefeitura. As demais são próprias, federais ou do core e ficaram para os outros verificadores. Os níveis seguem a tabela 2.3 atual do protocolo, com D-assistido e D-humano.

**Método.** Foram usadas 17 buscas da cota. As páginas foram baixadas com `curl` em 06/11/2026 para `scratchpad/web-V2r3/` e lidas como texto. Marca **[R3]** = fonte aberta nesta rodada. Fonte oficial do órgão dá confiança alta. As marcas [R2-…] remetem às fontes da seção 0.1, que não foram reabertas nesta rodada, salvo o catálogo da InfoSimples, baixado de novo com regras de preço atualizadas em 05/11/2026.

### R3.0 Fontes abertas nesta rodada

| Id | Fonte | Tipo |
| --- | --- | --- |
| R3-JUCESP | JUCESP Online, página inicial com o catálogo de serviços e os ícones Gratuito, Com senha e Tarifado: https://www.jucesponline.sp.gov.br/ | oficial |
| R3-MG-CERT | Serviço "Solicitar certidões" (Jucemg): https://www.mg.gov.br/servico/solicitar-certidoes | oficial |
| R3-SP-EXCL | Sefaz-SP, CADESP, Exclusão de Contabilista: https://portal.fazenda.sp.gov.br/servicos/cadesp/Paginas/Exclus%C3%A3o-de-Contabilista.aspx | oficial |
| R3-SP-BAIXA | Sefaz-SP, CADESP, Baixa da Inscrição Estadual: https://portal.fazenda.sp.gov.br/servicos/cadesp/Paginas/Baixa-de-Inscri%C3%A7%C3%A3o-Estadual.aspx | oficial |
| R3-RC22783 | RC 22783/2020 (27/01/2021): https://legislacao.fazenda.sp.gov.br/Paginas/RC22783_2020.aspx | oficial |
| R3-RC29755 | RC 29755/2024 (24/06/2024): https://legislacao.fazenda.sp.gov.br/Paginas/RC29755_2024.aspx | oficial |
| R3-RC33769 | RC 33769/2026 (06/05/2026, publicada em 08/09/2026): https://legislacao.fazenda.sp.gov.br/Paginas/RC33769_2026.aspx | oficial |
| R3-ECREDAC | Portaria SRE 65/2023 (e-CredAc): https://legislacao.fazenda.sp.gov.br/Paginas/Portaria-SRE-65-de-2023.aspx | oficial |
| R3-SP-PARC | Sefaz-SP, Parcelamento de ICMS (Ordinário): https://portal.fazenda.sp.gov.br/servicos/parcelamento-icms | oficial |
| R3-SP-NFE | Sefaz-SP, página da NF-e, aviso "Dispensa de Inutilização de Número da NF-e e NFC-e": https://portal.fazenda.sp.gov.br/servicos/nfe | oficial |
| R3-NT2023002 | Resumo da NT 2023.002 v1.02 (Senior, 27/10/2026): https://documentacao.senior.com.br/exigenciaslegais/noticias/federal/2026/2026-10-27-nf-e-nfc-e-nota-tecnica-no-2023-002-versao-1-02-eliminacao-da-autorizacao-assincrona-e-dos-servicos-de-inutilizacao | secundária |
| R3-CCM | Prefeitura de São Paulo, CCM, Cancelamento on-line: https://prefeitura.sp.gov.br/fazenda/w/servicos/ccm/2370 | oficial |
| R3-IS | InfoSimples: catálogo https://infosimples.com/consultas/apis.json (838 APIs) e regras de preço https://infosimples.com/pricing-rules.json (`sourceUpdatedAt` 05/11/2026). Faixas e franquia iguais às da R2 | fornecedor |
| R3-MDFE | Trechos de buscador sobre `mdfeConsNaoEnc` (NT MDF-e 2015/001) e o encerramento automático pela SVRS (Ajuste SINIEF 04/18); páginas não abertas | trecho |

### R3.1 Correções que mudam ficha

| # | Ficha | O que a ficha diz | Correção | Base |
| --- | --- | --- | --- | --- |
| C-13 | SOC-102 | "Certidões da Junta pagas em portal (pessoa executa)" | **Em SP a maior parte é gratuita:** na JUCESP Online, Certidão Simplificada, Ficha Cadastral Completa (arquivamentos desde 1992), Ficha Simplificada, FBR digitalizada e Cópia Digitalizada de Documentos Arquivados são **gratuitas com senha** (login "Com senha NF-P"). **Tarifadas:** Certidão de Inteiro Teor e certidões específicas com teor solicitado. A de teor solicitado genérica e a de livros anteriores a 22/09/2000 estão suspensas. Por agregador (B): `junta-comercial/sp/simplifica`, `ficha`, `completa`, `lista-dcs` e `download-dc` (CPF e senha ou certificado; adicional R$ 0,08). **MG:** todas as certidões são pagas por DAE e saem até 48 h após a compensação. Nível: **B** para a leitura em SP (cadeia de alterações pela ficha completa e pelas cópias digitalizadas); D-assistido só para a inteiro teor e para as outras Juntas | [R3-JUCESP][R3-IS][R3-MG-CERT] |
| C-14 | SOC-103 | Revogação no CADESP "pelo cliente"; inclusão pela REDESIM [NÃO VERIFICADO] | **Em SP, a exclusão do contabilista anterior é ato exclusivo do próprio contador anterior,** na REDESIM, em Módulo contador > "Meus Clientes" > renúncia de vínculo, com login gov.br. A Sefaz-SP **indefere** pedido de quem não é o profissional da ficha. Se a base da RFB diverge do CADESP, o próprio profissional pede pelo SIPET. Não há taxa. O novo escritório e o cliente **não** conseguem remover o anterior: dependem dele. A inclusão do novo contador segue [NÃO VERIFICADO] em fonte oficial (fórum cita DBE, eventos 224 e 232). Entra na lista: procurações no **e-CredAc** (cadastradas no próprio sistema) | [R3-SP-EXCL][R3-ECREDAC] |
| C-15 | NFE-106 | "Inutilizar lacunas" antes da baixa | **SP não tem mais inutilização:** desde **01/11/2026** o pedido de inutilização de NF-e (mod. 55) e NFC-e (mod. 65) deixa de ser aplicável em SP (Ajustes SINIEF 40/2026 e 38/2026). Salto na numeração não se inutiliza: a numeração segue do próximo número e a escrituração mantém a quebra. A NT 2023.002 v1.02 tira do ar o webservice de inutilização de AC, BA e SP, com produção prevista para 11/11/2026 (fonte secundária). Nas demais UFs (MG, PR, SC, RS) a inutilização segue por webservice com o A1 do cliente (prazo do 10º dia do mês seguinte, segundo fontes secundárias) | [R3-SP-NFE] oficial; [R3-NT2023002] |
| C-16 | FIS-111 | Base "RICMS/SP arts. 3º, I, e 182, V (RC 22783/2020)" para a perda do saldo credor | A perda do saldo credor no encerramento está no **art. 69, II, do RICMS/2000**, reafirmada na RC 29755/2024. Os arts. 3º, I, e 182, V, fundamentam a NF de baixa de estoque (CFOP 5.928) na data do encerramento. Encerramento irregular: ir ao Posto Fiscal e usar a denúncia espontânea (art. 529) | [R3-RC22783][R3-RC29755] |
| C-17 | NFE-106 | "RC 33769/2026 trata notas de fornecedor e NF3e contra filial baixada" | **Confirmado com ressalva:** a RC trata de NF-e de fornecedor e de documento da concessionária de energia emitidos contra filial com IE baixada desde 26/01/2026. A ementa manda o **emissor** procurar o Posto Fiscal e usar a denúncia espontânea, porque não se opera com contribuinte não inscrito. Para o escritório do destinatário isso vira vigiar as notas que chegam e avisar o emitente, mais a troca de titularidade na concessionária | [R3-RC33769] |
| C-18 | SOC-109 | Cancelamentos acessórios "sem API" | **Prefeitura de SP:** o cancelamento do CCM de PJ é feito só pela internet, no VRE (Via Rápida Empresa), na mesma plataforma da baixa do CNPJ e do distrato na JUCESP. Se a baixa nos outros entes já foi feita, usa-se o formulário eletrônico PJ, com ou sem Senha Web. Ou seja, não cai sozinho. Débitos impedem o cancelamento e no MEI o cancelamento vem do repasse da RFB (os dois pontos vêm de fórum e de trecho da FAQ, não conferidos) | [R3-CCM] |

### R3.2 Verificação por ficha

#### SOC-102 · Diagnóstico societário e de legalização na entrada
- `nível_automação`: **B** em SP para ficha completa, ficha simplificada, certidão simplificada e cópias de atos (agregador sobre serviço oficial gratuito com senha); **D-assistido** para a inteiro teor (tarifada) e para as Juntas de MG, PR, SC e RS; comparação contra QSA e CNAE Próprio.
- `integrações`: InfoSimples `junta-comercial/sp/simplifica`, `/ficha`, `/completa`, `/lista-dcs`, `/download-dc` e `junta-comercial/sp/cli` (licenciamento integrado Facilita SP, sem credencial); `pm/sp/licenca-bombeiros` para a validade de AVCB/CLCB em SP (sem credencial) [R3-IS]. Oficial: JUCESP Online [R3-JUCESP]; Jucemg Portal de Serviços com DAE [R3-MG-CERT]. API oficial das Juntas: [NÃO ENCONTRADO], mantido da R2.
- `credencial_exigida`: login JUCESP (CPF e senha da Nota Fiscal Paulista) ou certificado; no agregador, as mesmas credenciais. Licenciamento e Bombeiros SP sem credencial.
- `preço`: JUCESP: simplificada, ficha completa e cópias digitalizadas **gratuitas**; inteiro teor tarifada, valor [NÃO ENCONTRADO] (a tabela de 2026 não foi achada; revendedor cita R$ 47,26 para a simplificada impressa, sem data, não usado). Jucemg: [PREÇO NÃO PÚBLICO] no texto aberto (a página aponta para uma tabela que não foi aberta). Agregador: R$ 0,05 a 0,20 por consulta + R$ 0,08 nas APIs da JUCESP (R$ 0,04 no licenciamento, R$ 0,00 nos Bombeiros), franquia de R$ 100/mês [R3-IS].
- `limites_e_riscos`: cópia digitalizada "não tem valor jurídico de certidão"; documento não digitalizado exige pedido tarifado de digitalização; certidão de livros anteriores a 22/09/2000 suspensa.
- `confiança`: **alta** (SP, oficial e fornecedor lidos agora); média para MG.
- `correção`: C-13.

#### SOC-103 · Trocar vínculos e acessos herdados do contador anterior
- `nível_automação`: **D-assistido** mantido, com **dependência do contador anterior** no CADESP-SP (ele precisa renunciar). Se ele não colaborar, o caso vira D-humano (cobrança formal com base na Res. CFC 1.590/2020).
- `integrações`: consulta pública dos contadores vinculados no CADESP por CRC, CPF ou CNPJ [R3-SP-EXCL]; procurações estaduais a revisar: DEC SP, e-CredAc SP (procuração cadastrada no próprio sistema, art. 3º) [R3-ECREDAC], SIARE MG, Receita/PR, DTEC SC e DTE RS (I-23).
- `credencial_exigida`: gov.br do **contador anterior** para a renúncia na REDESIM; e-CNPJ do cliente para revogar procurações eletrônicas estaduais.
- `preço`: gratuito ("Não há taxa") [R3-SP-EXCL].
- `confiança`: **alta** para SP; demais UFs mantidas da R2.
- `correção`: C-14.

#### SOC-109 · Encerrar os registros acessórios depois da baixa
- `nível_automação`: **D-assistido** mantido.
- `integrações`: Prefeitura de SP: CCM cancelado pelo VRE ou por formulário eletrônico PJ [R3-CCM]; Bombeiros SP: consulta de situação por agregador (B, só leitura); DTE-RS segue credenciado após a baixa pelo prazo decadencial (I-11, R2). Conselhos e vigilância: [NÃO ENCONTRADO] API (mantido).
- `credencial_exigida`: Senha Web da prefeitura ou formulário sem senha; demais por protocolo.
- `preço`: cancelamento do CCM sem taxa indicada na página [R3-CCM]; anuidades de conselho conforme cada um (não conferido).
- `confiança`: média (alta para o CCM paulistano).
- `correção`: C-18.

#### FIS-101 · Perfil fiscal de entrada (parte estadual)
- `nível_automação`: Próprio mantido. A parte de inscrições por UF ganha **B**: Sintegra das cinco UFs, Sintegra unificada e CCC por agregador; CCM paulistano (`pref/sp/sao-paulo/ccm`, sem credencial, R$ 0,00 adicional) e CPOM SP [R3-IS].
- `preço`: R$ 0,05 a 0,20 por consulta + adicional de R$ 0,00 a 0,10 [R3-IS].
- `confiança`: alta para existência e preço no agregador; regimes especiais por UF seguem [NÃO VERIFICADO].
- `correção`: incluir a consulta cadastral estadual e municipal por B na integração (a ficha só cita as consultas federais).

#### FIS-104 · Inventariar e assumir créditos e saldos credores herdados (parte estadual)
- `nível_automação`: **F** mantido para a EFD recebida; somar **C-cert** em SP: o **e-CredAc** dá consulta da conta corrente do crédito acumulado e da situação dos arquivos (art. 1º, IV e II).
- `credencial_exigida`: e-CNPJ do cliente (todas as funções), **e-CPF de procurador** com procuração registrada no e-CredAc, ou senha do PFE só para consulta [R3-ECREDAC].
- `preço`: gratuito (serviço da Sefaz).
- `limites_e_riscos`: saldo credor comum não é crédito acumulado (ressalva de fonte secundária). Demais UFs: [NÃO VERIFICADO].
- `confiança`: alta para SP.
- `correção`: integração passa a "F + C-cert (e-CredAc SP, procurador e-CPF)".

#### FIS-105 · Inventariar parcelamentos e intimações herdados (parte estadual e municipal)
- `nível_automação`: A para a parte federal (V1); na parte estadual, **B** onde há agregador: SEF-MG parcelamento (`sefaz/mg/parcelamento`, sem credencial, + R$ 0,04), PGE-SP dívida ativa (`pge/sp/divida-ativa`, por CNPJ ou IE, + R$ 0,04), acordos da Prefeitura de SP (`pref/sp/sao-paulo/ep`, + R$ 0,00) [R3-IS]; **C-cert** para o parcelamento ordinário de ICMS-SP não inscrito e para PR, SC e RS.
- `fatos conferidos (SP)`: até sete parcelamentos simultâneos (de 12 a 60 parcelas, correção pela Selic); o rompimento com saldo a pagar continua contando no limite até a inscrição em dívida ativa; débito inscrito é parcelado no site da PGE [R3-SP-PARC]. Regra de quantas parcelas em atraso rompem: [NÃO ENCONTRADO] na página.
- `credencial_exigida`: nenhuma nas consultas do agregador citadas; portal do parcelamento SP: [NÃO VERIFICADO] (fórum cita senha do PFE para o PEP).
- `preço`: tabela da InfoSimples [R3-IS].
- `confiança`: média (alta para o que foi lido de SP e do agregador).
- `correção`: integração passa a "A (federal) + B (MG, PGE-SP, Prefeitura SP) + C-cert (demais)".

#### FIS-107 · Habilitar o cliente nos ambientes fiscais eletrônicos (parte estadual e municipal)
- `nível_automação`: **D-assistido** mantido. O credenciamento NF-e/NFC-e e a geração do CSC são atos do contribuinte no portal da UF, com certificado; em SP pode haver credenciamento de ofício, que não dispensa o pedido (Portaria CAT 162/2008 e CAT 34/2010, só por trecho de buscador) [R3 trecho].
- `integrações`: verificação posterior por A (a NF-e autoriza ou rejeita); domicílios conforme a I-23.
- `credencial_exigida`: certificado do cliente (A1 ou A3) e representante legal.
- `preço`: gratuito.
- `confiança`: média (página oficial do credenciamento não aberta).
- `correção`: nenhuma.

#### FIS-109 · Encerrar acessos, automações e consumos fiscais (parte estadual)
- `nível_automação`: Próprio + D-assistido mantido. Acrescentar: **renunciar ao vínculo de contabilista no CADESP** pela REDESIM (ato do próprio escritório que sai, gov.br, sem taxa) [R3-SP-EXCL]. Isso inverte o C-14: na saída, a ação é do escritório.
- `confiança`: alta para SP.
- `correção`: incluir a renúncia no CADESP como passo do escritório que sai.

#### FIS-110 · Obrigações fiscais de encerramento na baixa (parte estadual)
- `nível_automação`: **D-assistido** mantido. Em SP, a baixa da IE é comunicada até o **último dia útil do mês seguinte** ao encerramento (art. 25 do RICMS/2000), pela REDESIM, sem taxa. O contribuinte guarda livros e documentos pelo prazo do art. 230 do RICMS e a declaração de baixa (Portaria CAT 92/1998, Anexo III, art. 6º) [R3-SP-BAIXA]. As últimas EFD e guias vêm do core (F).
- `confiança`: alta para SP; demais UFs [NÃO VERIFICADO].
- `correção`: acrescentar o prazo e o termo de guarda de SP.

#### FIS-111 · Estoque final, ICMS e saldo credor na baixa da IE
- `nível_automação`: **D-assistido** mantido (cálculo Próprio, NF de baixa no emissor do cliente, pedido de baixa na REDESIM).
- `fatos conferidos`: estoque baixado por NF na data do encerramento, CFOP 5.928 (arts. 3º, I, e 182, V); perda do saldo credor no encerramento (art. 69, II), reafirmada em 2024; encerramento irregular vai ao Posto Fiscal com denúncia espontânea [R3-RC22783][R3-RC29755].
- `preço`: gratuito.
- `confiança`: alta (SP); demais UFs [NÃO VERIFICADO].
- `correção`: C-16.

#### NFE-101 · Salvar a janela de 90 dias e receber o acervo
- `nível_automação`: **A** mantido. Distribuição DF-e: 90 dias, NSU sem retroativo para usuário novo, interrupção após 60 dias sem consulta, 20 consultas por hora em `consChNFe` (I-01, R2-NT, não reaberto). Saídas de NF-e do cliente **não** vêm pela distribuição ao emitente (C-01): para o histórico de saídas, só pelo `autXML` do escritório anterior, pelo emissor ou pelo cliente (D-assistido). NFC-e SP: SAE-NFC-e com o A1 do cliente (I-05) cobre o histórico de emitidas por período.
- `credencial_exigida`: A1 do cliente.
- `preço`: gratuito.
- `confiança`: alta (texto integral da NT lido na R2).
- `correção`: deixar explícito que as saídas históricas de NF-e não vêm pela distribuição e acrescentar o SAE-NFC-e em SP.

#### NFE-105 · Desligar a captura, o autXML e a guarda
- `nível_automação`: Próprio + D-assistido mantido. Conferido na NT que o terceiro do `autXML` recebe a NF-e integral pela distribuição com o **próprio** e-CNPJ (I-01). Enquanto o ex-cliente não tirar o CNPJ do escritório do emissor, as notas dele continuam entrando no fluxo NSU do escritório. A plataforma precisa filtrar por CNPJ emitente e descartar. Não há "revogação" do `autXML` na Sefaz: [NÃO ENCONTRADO], o que confirma a inferência da ficha.
- `confiança`: alta para o mecanismo; média para a ausência de revogação.
- `correção`: acrescentar o filtro no fluxo NSU do e-CNPJ do escritório.

#### NFE-106 · Fechar o acervo na baixa
- `nível_automação`: **D-assistido** mantido, mas sem inutilização em SP (C-15). MDF-e: o encerramento é evento do emitente (webservice, A1 do cliente) e há consulta de não encerrados (`mdfeConsNaoEnc`) restrita ao CNPJ emitente [R3-MDFE, trecho]. A SVRS encerra de ofício o MDF-e rodoviário com mais de 60 dias (Ajuste SINIEF 04/18, trecho). Se o escritório tiver o A1, consulta e encerramento podem ser **A com aprovação**.
- `preço`: gratuito.
- `confiança`: alta para SP (aviso oficial); baixa para o MDF-e (trechos).
- `correção`: C-15 e C-17.

### R3.3 Lacunas desta rodada
1. Tabela de preços de 2026 das Juntas (inteiro teor da JUCESP, Jucemg, JUCEPAR, JUCESC, JUCISRS): [NÃO ENCONTRADO].
2. Inclusão do novo contabilista no CADESP: só fórum (DBE, eventos 224 e 232).
3. Regra de rompimento do parcelamento de ICMS por atraso em SP e nas outras UFs.
4. Texto oficial dos Ajustes SINIEF 38 e 40/2026 (Confaz recusou a conexão; vale o aviso oficial da Sefaz-SP).
5. Baixa da IE, saldo credor e inutilização em MG, PR, SC e RS.
