# V1 · Verificação: Governo federal · Rodada 2 (6/11/2026)

6 de novembro de 2026 · Etapa 2 do [Protocolo de Descoberta](00-protocolo-de-descoberta.md) · agente V1, rodada 2 (a rodada 1 é de 05/11/2026)

Domínio: RFB, SERPRO (Integra Contador, Consulta CNPJ/CPF), PGFN e certidões federais, eSocial, EFD-Reinf, FGTS Digital, MTE (DET, Mediador), gov.br, NFS-e Nacional, Simples Nacional, Calculadora de Tributos (CBS/IBS/IS), BCB e IBGE.

Fichas verificadas: **135** (as mesmas da rodada 1: as que dependem de pelo menos uma integração federal).

Premissas do fundador adotadas nesta rodada (decisões posteriores à rodada 1):

1. **Certificado A1 do cliente é documento obrigatório**, enviado pelo próprio cliente no app/portal do cliente e guardado em cofre. Para NF-e, o autXML com o CNPJ do escritório é complemento. (Já apurado antes desta rodada: a NT 2014.002 v1.40 mantém a autenticação pelo certificado do próprio ator; a FENACON pediu acesso por procuração à NFS-e Nacional, ainda não implementado.)
2. **Tarefas vêm dos módulos de processos dos sistemas core, por API negociada** com cada fornecedor (fora do domínio V1; ver V3).
3. **Agente de desktop fora do plano principal.** Para o domínio federal isso reforça: robô em portal (níveis C) só como reserva, com aprovação humana.

---

## 0. Método da rodada 2 (ler antes de usar qualquer veredito)

- **Rede liberada.** As páginas oficiais foram baixadas com `curl` em 06/11/2026 e lidas como texto (HTML sem tags; PDFs com `pdftotext`). Conteúdo baixado foi tratado como dado.
- **O que foi aberto nesta rodada (fonte oficial):** documentação do Integra Contador no `apicenter.estaleiro.serpro.gov.br` (introdução, catálogo de serviços de 15/10/2026, Autentica Procurador, padrão do Termo de Autorização, cache do termo, Caixa Postal, Eventos de Atualização e limites, como contratar, suporte); ficha do produto Integra Contador, Consulta CNPJ e Consulta CPF na Loja SERPRO (dados do produto lidos pela API pública da própria loja, `loja.serpro.gov.br/ccstore/v1/products/...`); notícias SERPRO (2024 e Sescon-PA 2025); manual das APIs do ADN para contribuintes (v1.0, 12/02/2026), página "APIs – Prod. Restrita e Produção" (atualizada em 20/08/2026) e planilha oficial de municípios aderentes (28/09/2026) do portal NFS-e; manual do desenvolvedor do eSocial **v1.16 (ago/2026)** e página de documentação técnica do eSocial; manual do desenvolvedor da EFD-Reinf **v2.8 (ago/2026)**; página "Manual e Documentação Técnica" do FGTS Digital e manual do FGTS Digital v1.70 (12/06/2026); notícia oficial e Guia do Usuário de **Autorizações de Acesso** da RFB (página atualizada em 28/10/2026); Calculadora de Tributos (aplicação e endpoint público de versão em `piloto-cbs.tributos.gov.br`); API SGS do BCB.
- **O que não abriu:** `servicodados.ibge.gov.br` (conexão recusada pela rede da sessão em 06/11/2026); `adn.nfse.gov.br` e `adn.producaorestrita.nfse.gov.br` (falha de TLS na sessão; as URLs foram conferidas na página oficial de APIs, não nas próprias Swaggers); `det.sit.trabalho.gov.br`; repositório de dados abertos do CNPJ (o endereço antigo devolve 404).
- **Buscas usadas:** 10 (de no máximo 60).
- **Marcação por item:** cada integração (seção 1) e cada ficha (seção 2) diz se foi **"conferido na rodada 2"**, **"parcialmente conferido na rodada 2"** ou **"mantido da rodada 1 (não conferido)"**. Confiança **alta** só onde a fonte oficial foi aberta nesta rodada.
- `[CP]` continua valendo como `[NÃO VERIFICADO]` (conhecimento prévio do agente). `[INFERÊNCIA]` marca conclusão do V1 a partir de fonte oficial lida, que ainda precisa de confirmação do órgão.

Legenda de citação: `[D2 S3]` = fonte S3 da ficha D2. `[R2-xx]` = fonte aberta nesta rodada, listada na seção 6.

---

## 1. Mapa das integrações do domínio

Cada integração recebe um código `I-xx`, usado na seção 2.

### I-01 · Integra Contador (SERPRO / RFB) · conferido na rodada 2

| Campo | Conteúdo |
| --- | --- |
| Nível | **A$** |
| Catálogo atual (oficial, 15/10/2026) [R2-02] | **119 linhas no catálogo**, das quais algumas "em construção/prospecção" ou descontinuadas (ex.: 8.2 EXPIRARAUTORIZACAO, descontinuado em 01/04/2024). A notícia SERPRO/Sescon-PA (2025) fala em "118 serviços via API" [R2-10]. Grupos: **Integra-SN** (PGDAS-D: entregar declaração, gerar DAS, consultar declarações/recibos/extrato do DAS, DAS de cobrança, de processo e avulso; REGIMEAPURACAO: opção e consulta do regime de caixa/competência; DEFIS: transmitir e consultar); **Integra-MEI** (PGMEI: DAS em PDF e código de barras, atualizar benefício, consultar dívida ativa; CCMEI: emitir, consultar dados e situação cadastral; DASN-SIMEI: entregar, consultar, DAS de excesso); **Integra-DCTFWeb** (gerar guia, recibo, declaração completa, XML, transmitir, guia para declaração em andamento; relatórios de crédito/débito, MAED, vinculação, abatimento e valor suspenso aparecem sem data de implantação; **MIT**: encerrar e consultar apuração); **Integra-Procurações** (obter procuração); **Integra-Sicalc** (consolidar e emitir DARF em PDF e código de barras; **CONSOLIDAR54**, cálculo de acréscimos sem emitir DARF, implantado em 15/10/2026); **Integra-CaixaPostal** (lista de mensagens, detalhe da mensagem, indicador de novas mensagens, quantidade, anexos e URL pré-assinada de anexo; **DTE**: situação de adesão ao DTE do Simples e e-CAC); **Integra-Pagamento** (consultar pagamentos, emitir comprovante, contar documentos pagos); **Integra-SITFIS** (solicitar protocolo e emitir relatório de situação fiscal, desde 01/09/2023); **Integra-Parcelamentos** (PARCSN, PARCSN-ESP, PERTSN, RELPSN, PARCMEI, PARCMEI-ESP, PERTMEI, RELPMEI: pedidos, parcelamento, pagamentos, parcelas e emissão do DAS, desde 11/11/2024; PARC-PAEX e PARC-SIPADE: extrato e documento de arrecadação, sem data); **Integra-Redesim** (PNRCONTADOR: consultar vínculos do contador, solicitar renúncia de vínculo, comprovante, desde 02/12/2025); **Integra-e-Processo** (consultar processos por interessado desde 10/11/2025; lista e documentos do processo, comunicados e intimações sem data); **Integra-Contador-Gerenciador** (AUTENTICAPROCURADOR; EVENTOSATUALIZACAO PF e PJ, desde 01/04/2024) |
| O que **não** está no catálogo (06/11/2026) | Dívida ativa da PGFN (fora o "consultar dívida ativa" do PGMEI), CND, PER/DCOMP, DIRBI, e-BEF, ECD/ECF, opção IBS/CBS do Simples: `[NÃO ENCONTRADO]` no catálogo [R2-02] |
| Credencial | Contrato na Loja SERPRO assinado com **e-CNPJ do contratante**; chaves de acesso (consumer key/secret) na Área do Cliente em até 10 minutos após assinar [R2-03]. Para serviços que exigem procuração, o contribuinte precisa ter dado a permissão do serviço no sistema de procurações da RFB; sem isso a requisição é negada [R2-01]. **Software house sem procuração** age em nome do procurador (o escritório) enviando um **Termo de Autorização em XML assinado com o certificado do procurador** (e-CPF ou e-CNPJ ICP-Brasil, A1 ou A3, padrão XMLDSig) ao serviço AUTENTICAPROCURADOR; recebe um token (`autenticar_procurador_token`) que vale **até a meia-noite do dia seguinte** (horário de Brasília) [R2-04]. O termo traz `dataAssinatura` e `vigencia`; termo repetido e ainda válido é respondido com HTTP 304 e o mesmo token (cache) [R2-05]. O CPF/CNPJ do "autor do pedido de dados" tem de ser o do certificado que assinou [R2-06] |
| Preço (oficial, Loja SERPRO, lido em 06/11/2026) [R2-07] | Pós-pago, sem taxa de instalação, sem fidelidade; "o pagamento é calculado direto na faixa do consumo" (todo o volume paga o preço da faixa atingida). **Consulta:** 1–300 R$ 0,24 · 301–1.000 R$ 0,21 · 1.001–3.000 R$ 0,18 · 3.001–7.000 R$ 0,16 · 7.001–15.000 R$ 0,14 · 15.001–23.000 R$ 0,11 · 23.001–30.000 R$ 0,09 · acima de 30.000 R$ 0,06. **Emissão:** 1–500 R$ 0,32 · 501–5.000 R$ 0,29 · 5.001–10.000 R$ 0,26 · 10.001–15.000 R$ 0,22 · 15.001–25.000 R$ 0,19 · 25.001–35.000 R$ 0,16 · 35.001–50.000 R$ 0,12 · acima de 50.000 R$ 0,08. **Declaração:** 1–100 R$ 0,40 · 101–500 R$ 0,36 · 501–1.000 R$ 0,32 · 1.001–3.000 R$ 0,28 · 3.001–5.000 R$ 0,24 · 5.001–8.000 R$ 0,20 · 8.001–10.000 R$ 0,16 · acima de 10.000 R$ 0,12. O período de apuração das faixas não está escrito na página do Integra (na Consulta CNPJ a loja diz "consultas/mês") `[INFERÊNCIA: mensal; confirmar]`. A loja classifica cada serviço: ex. caixa postal (lista, detalhe e **indicador de novas mensagens**) = Consulta; gerar DAS, DARF, comprovante, **SITFIS solicitar e SITFIS emitir** = Emissão; PGDAS-D, DCTFWeb, DEFIS e renúncia PNR = Declaração. **Eventos de atualização** (Monitorar) não aparecem na lista de cobrança e a notícia oficial de 2024 os chama de gratuitos [R2-09]. AUTENTICAPROCURADOR (Apoiar) também não aparece na lista `[INFERÊNCIA: não cobrado; confirmar]` |
| Preço de revenda (referência) | Alterdata/Prosoft: exemplo "PGDAS de 10 clientes = R$ 8,00; retificar 1 = + R$ 0,80" (R$ 0,80 por declaração) [R2-11]; rodada 1 tinha R$ 0,75 por DAS (2025) [D2 S5]. Margem de revenda sobre a faixa 1 oficial (R$ 0,40 declaração): ~2× |
| Limites e riscos | **Ler o detalhe de uma mensagem da caixa postal registra ciência** da intimação (art. 23, § 2º, III, do Decreto 70.235/1972), como no e-CAC [R2-08]; a lista de mensagens não traz esse aviso e devolve `dataCiencia` e `dataLeitura` [R2-08b]. Eventos de atualização: assíncrono, em lote, até **1.000 contribuintes por requisição** e **1.000 requisições por dia** para PF e para PJ; resultado guardado 20 minutos e apagado após a primeira leitura; dados de no máximo 60 dias; sincronismo médio de 15 minutos; exige procuração vigente até D-1 para cada contribuinte [R2-12]. Catálogo muda a cada trimestre (Sicalc CONSOLIDAR54 entrou em 15/10/2026). A documentação ainda fala em "procurações eletrônicas do Portal e-CAC" (texto de 19/02/2026), sem citar o sistema novo de Autorizações de Acesso (ver I-13) |
| Link | Documentação: https://apicenter.estaleiro.serpro.gov.br/documentacao/api-integra-contador/ · Catálogo: https://apicenter.estaleiro.serpro.gov.br/documentacao/api-integra-contador/pt/catalogo_de_servicos/ · Loja: https://loja.serpro.gov.br/integracontador |
| Confiança | **Alta** para catálogo, credencial, termo de autorização, ciência na caixa postal e tabela de preços (fontes oficiais abertas em 06/11/2026); média para o período das faixas e a gratuidade de Monitorar/Apoiar |

**Modelo de contratação para uma plataforma que atende vários escritórios (conferido na rodada 2, com uma lacuna):**

| Modelo | Como funciona (fonte) | Quem paga o SERPRO | Implicação |
| --- | --- | --- | --- |
| A · Plataforma contratante única | A plataforma contrata com o próprio e-CNPJ; cada escritório (procurador dos seus clientes) assina **um Termo de Autorização** em nome da plataforma; a plataforma envia o termo, recebe o token e chama a API com `contratante` = plataforma, `autorPedidoDados` = escritório, `contribuinte` = cliente [R2-01, R2-04, R2-06]. É o modelo da Alterdata/Prosoft, que contrata direto e repassa o custo [R2-11] | A plataforma (depois repassa ao escritório: GES-010) | Volume somado de todos os escritórios cai em faixas mais baratas. Contrato-padrão e eventuais cláusulas sobre uso em nome de terceiros: `[NÃO ENCONTRADO]` (o contrato só aparece no fluxo de compra com e-CNPJ) |
| B · Cada escritório contratante | O escritório contrata com o próprio e-CNPJ; as chaves ficam ligadas a esse CNPJ e não servem para outros escritórios (Omie: "não é possível vincular múltiplos escritórios à mesma contratação") [R2-13] | Cada escritório | Mais simples juridicamente; cada escritório fica na faixa 1–2; a plataforma guarda as chaves de cada escritório no cofre |
| C · Convênio de sindicato | SERPRO e Sescon-PA firmaram contrato com condições diferenciadas para filiados (2025) e a notícia diz que outros sindicatos podem avaliar [R2-10] | Escritório filiado | Verificar se o Sescon do estado do escritório-piloto tem acordo `[NÃO VERIFICADO]` |
| D · Termo assinado pelo próprio contribuinte `[INFERÊNCIA]` | O modelo oficial do termo traz `assinadoPor` = "NOME DO CONTRIBUINTE" e aceita e-CNPJ; com o A1 do cliente no cofre (premissa 1), o próprio cliente poderia ser o "autor do pedido de dados", sem depender da procuração ao escritório [R2-06] | Plataforma ou escritório | **Hipótese a confirmar com o SERPRO** antes de usar: se valer, a procuração deixa de ser pré-requisito para os clientes que já entregaram o A1. Mesmo assim, recomenda-se manter a procuração (responsabilidade do contador e serviços fora do Integra) |

Recomendação do V1: **modelo A** como alvo (plataforma contratante, termo por escritório), com **B** como fallback enquanto o contrato-padrão não for lido; o termo pode ser assinado uma vez com vigência longa e reenviado a cada dia (cache 304) `[INFERÊNCIA a partir de R2-05; confirmar vigência máxima]`. Isso permite que o e-CNPJ do escritório seja **A3** (assinatura manual do termo), resolvendo a pergunta 4.4-3 da rodada 1.

**Custo por cliente (exemplo com a tabela oficial, faixa 1, sem desconto):** Simples com PGDAS-D (Declaração R$ 0,40) + DAS (Emissão R$ 0,32) + lista da caixa postal 4×/mês (4 × Consulta R$ 0,24) + consulta de pagamento (R$ 0,24) ≈ **R$ 1,92/mês**; com SITFIS mensal (2 × Emissão, R$ 0,64) ≈ R$ 2,56/mês. Monitorar com eventos de atualização (grátis) reduz as consultas. Valores são estimativa do V1 a partir da tabela [R2-07].

### I-02 · Consulta CNPJ (SERPRO) · conferido na rodada 2 (preço)

| Campo | Conteúdo |
| --- | --- |
| Nível | **A$** |
| Oferece | Três tipos: **Consulta Básica, Consulta QSA, Consulta Empresa** [R2-14]. Conteúdo de cada tipo: `[NÃO VERIFICADO]` nesta rodada |
| Credencial | Contrato na Loja SERPRO `[CP para OAuth2]`. Exigência de procuração: `[NÃO VERIFICADO]` (dado cadastral; `[CP]` não exige) |
| Preço (oficial, 06/11/2026) [R2-14] | Por consulta, faixa pelo volume do mês. Faixa 01 (1–999): Básica R$ 0,6591 · QSA R$ 0,8683 · Empresa R$ 1,1717. Faixa 02 (1.000–9.999): R$ 0,5649 · R$ 0,7428 · R$ 1,0148. Faixa 03 (10.000–49.999): R$ 0,3557 · R$ 0,5963 · R$ 0,8265. Segue em 16 faixas até R$ 0,025 · R$ 0,067 · R$ 0,108 acima de 30 milhões |
| Alternativa | I-04 (dados abertos, grátis, defasado) e agregadores (V3) |
| Link | https://loja.serpro.gov.br/consultacnpj |
| Confiança | Alta para preço; baixa para o conteúdo de cada tipo |

### I-03 · Consulta CPF (SERPRO) e Qualificação Cadastral do eSocial · parcialmente conferido na rodada 2

| Campo | Conteúdo |
| --- | --- |
| Nível | Consulta CPF: **A$**; Qualificação Cadastral: **C-cert/D** `[CP, mantido da rodada 1]` |
| Preço Consulta CPF (oficial, 06/11/2026) [R2-15] | Por consulta no mês: até 999 R$ 0,6591 · 1.000–9.999 R$ 0,5649 · 10.000–49.999 R$ 0,3557 · … até R$ 0,017 acima de 30 milhões |
| Observação | A NT S-1.3 07/2026 (rev. 20/10/2026) está publicada na documentação do eSocial [R2-17]; o tratamento de CPF não vinculado citado por D4 não foi relido |
| Confiança | Alta para preço da Consulta CPF; baixa para a Qualificação Cadastral |

### I-04 · Dados abertos do CNPJ (RFB) · parcialmente conferido na rodada 2

| Campo | Conteúdo |
| --- | --- |
| Nível | **A** (arquivo, não API) |
| Situação em 06/11/2026 | O endereço usado até 2025, `https://arquivos.receitafederal.gov.br/dados/cnpj/dados_abertos_cnpj/`, devolve **404** ("SERPRO+ – Repositório de Arquivos da Receita Federal: página não encontrada"). Endereço atual: **`[NÃO ENCONTRADO]`** (2 buscas). Atenção: o **CNPJ alfanumérico** começou em julho de 2026 (notícia Fazenda, 31/07/2026, via busca) e afeta parsers que esperam só números; o Sicalc do Integra já tem exemplo "Consolidar DARF com CNPJ alfanumérico" [R2-02] |
| Credencial · Preço | Nenhuma · grátis `[mantido da rodada 1]` |
| Limites | Defasagem; arquivo grande `[mantido da rodada 1]` |
| Confiança | Baixa até achar o endereço atual |

### I-05 · eSocial (webservices) · conferido na rodada 2

| Campo | Conteúdo |
| --- | --- |
| Nível | **A** |
| Documento vigente | Manual de Orientação do Desenvolvedor **v1.16, agosto de 2026** (a rodada 1 citava a v1.7, de 2018) [R2-16]; leiautes S-1.3 até NT 07/2026 rev. 20/10/2026, com XSD em produção em 26/10/2026, 23/11/2026, 14/12/2026 e 18/01/2027 [R2-17] |
| Oferece | Envio de lote (até **50 eventos** por lote) em `https://webservices.envio.esocial.gov.br/servicos/empregador/...`; consulta do resultado em `https://webservices.consulta.esocial.gov.br/...`; **consulta de identificadores** e **solicitação de download de eventos** em `https://webservices.download.esocial.gov.br/servicos/empregador/dwlcirurgico/...` (por Id ou por número de recibo) [R2-16] |
| Quem pode usar | Envio: qualquer certificado ICP-Brasil; "não é necessário qualquer tipo de vínculo formal (ex: procuração) entre o transmissor e o empregador"; o resultado do lote só com o mesmo certificado da transmissão [R2-16]. Download e identificadores: só o empregador ou procurador com **perfil de procuração eletrônica** para o tipo de evento (erro 407), na Procuração Eletrônica da RFB ou da Caixa [R2-16] |
| Limites | Download/identificadores: **no máximo 10 acessos por dia por empregador** (soma dos dois serviços), uma consulta por vez (sem paralelismo), janela de no máximo 31 dias, data-fim até 1 hora antes de agora, bloqueio em alguns dias do mês (consulta de identificadores: dias 1 a 7) [R2-16] |
| Preço | Gratuito |
| Link | https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/996775-manualorientacaodesenvolvedoresocialv1-16.pdf |
| Confiança | **Alta** |

### I-06 · EFD-Reinf (webservices) · conferido na rodada 2

| Campo | Conteúdo |
| --- | --- |
| Nível | **A** |
| Documento vigente | Manual de Orientação do Desenvolvedor **v2.8, agosto de 2026** [R2-18]. Desde a v2.7 (out/2025) só existe o modelo **assíncrono** (secundária, via busca) |
| Oferece | Envio de lote: `https://reinf.receita.economia.gov.br/recepcao/lotes`; consulta de lote: `https://reinf.receita.economia.gov.br/consulta/lotes/{numeroProtocolo}`; **API REST de consulta a recibo de entrega de evento**: `https://reinf.receita.economia.gov.br/consulta/reciboevento/` + endpoint do evento. Produção restrita em `pre-reinf.receita.economia.gov.br`, com Swagger em `/recepcao/swagger/index.html` e `/consulta/swagger/index.html` [R2-18] |
| Credencial | Certificado ICP-Brasil série A, A1 ou A3, e-CNPJ com o mesmo CNPJ base do contribuinte, ou do representante legal, ou **de procurador habilitado na procuração eletrônica da RFB** (para PJ, outorgada pelo CNPJ matriz); certificado na conexão HTTPS [R2-18] |
| Preço | Gratuito |
| Limites | Retificação gera nova DCTFWeb em andamento [D2 S31-b, mantido] |
| Link | https://www.gov.br/sped/pt-br/assuntos/escrituracoes-digitais/efd-reinf/manuais-e-documentos-tecnicos/manualorientacaodesenvolvedor-reinf-v2-8.pdf/@@display-file/file |
| Confiança | **Alta** |

### I-07 · DCTFWeb · conferido na rodada 2

| Campo | Conteúdo |
| --- | --- |
| Nível | **A$** pelo Integra Contador [R2-02]; sem API gratuita conhecida `[CP]` |
| Oferece | Gerar guia, consultar recibo, declaração completa e XML, transmitir, guia de declaração em andamento (28/03/2025); MIT: encerrar, consultar situação, consultar apuração e listar por ano/mês (28/03/2025) [R2-02] |
| Preço | Transmitir = Declaração; guias = Emissão; consultas = Consulta (tabela em I-01) [R2-07] |
| Limites | DCTFWeb em andamento bloqueia CND [D2 S10, mantido]; prazo: IN RFB 2.248/2025 [D2 S8, mantido] |
| Confiança | Alta (serviços e preço) |

### I-08 · FGTS Digital (MTE) · conferido na rodada 2

| Campo | Conteúdo |
| --- | --- |
| Nível | **C-cert** ou **D** |
| API | **Nenhuma API pública documentada.** A página oficial "Manual e Documentação Técnica" lista só: Manual do FGTS Digital v1.70 (12/06/2026), Leiaute do arquivo de importação de Remunerações para Fins Rescisórios v1.2 (03/10/2025) e Manual do Sistema de Procuração Eletrônica (SPE) v2.0 (11/08/2025) [R2-19]. O manual v1.70 não descreve API (o termo "webservice" aparece só para o envio ao eSocial) [R2-20]. Indício contrário: aviso de manutenção de 31/07/2026 cita um módulo "Integrações de Sistemas (API): comunicação automatizada de softwares de folha de pagamento ou sistemas parceiros" [R2-21, secundária]. Conclusão: se existe, é integração restrita a parceiros, não documentada publicamente `[NÃO VERIFICADO]` |
| Credencial | gov.br ou certificado; escritório como procurador no SPE (manual v2.0) [R2-19] |
| Alternativa | D: o analista emite a GFD; a plataforma lê o PDF e envia ao cliente pelo app |
| Confiança | Alta para "não há API pública documentada"; baixa para a existência de API de parceiros |

### I-09 · Domicílio Eletrônico Trabalhista (DET, MTE) · parcialmente conferido na rodada 2

| Campo | Conteúdo |
| --- | --- |
| Nível | **C-cert** ou **D** |
| API | **`[NÃO ENCONTRADO]`** (1 busca; nenhum resultado oficial ou secundário menciona API; o manual em `det.sit.trabalho.gov.br/manual/` não abriu na sessão) |
| Ciência | O empregador fica ciente no dia da consulta eletrônica do teor ou, sem consulta, após 15 dias corridos (Portaria MTE 3.869/2023, via resultados de busca, secundária). Robô que abre a mensagem dá ciência: só listar |
| Credencial | Perfil de procurador no próprio DET [D4 DP-042, mantido] |
| Confiança | Média |

### I-10 · Sistema Mediador (MTE) · mantido da rodada 1 (não conferido)

Nível **D**; consulta pública de instrumentos coletivos legível sem credencial `[CP]`. Manual: https://www.gov.br/trabalho-e-emprego/pt-br/pdfs/manual-do-sistema-mediador-srt-digital.pdf [D4 T10]. Confiança baixa.

### I-11 · Empregador Web (seguro-desemprego) · mantido da rodada 1 (não conferido)

**D** ou **C-cert**; status em nov/2026 `[NÃO VERIFICADO]` [D4 T22]. Confiança baixa.

### I-12 · gov.br (login do cidadão) · mantido da rodada 1 (não conferido)

**C-crc** quando o serviço exige o login pessoal; sem delegação por API `[CP]`. Para Autorizações de Acesso, a conta gov.br precisa ser prata ou ouro (resultado de busca, gov.br). Confiança média.

### I-13 · Autorizações de Acesso (antiga procuração eletrônica RFB) · conferido na rodada 2

| Campo | Conteúdo |
| --- | --- |
| Nível | Concessão: **D** (só o cliente concede); **aceite pelo procurador: D** (o escritório valida na aba "Recebidas"); consulta: **A$** (Integra-Procurações, OBTERPROCURACAO41) [R2-02] |
| Fatos oficiais | A nova versão do sistema de procurações eletrônicas "passou a se chamar **Autorizações de Acesso**", integrada ao **Portal de Serviços** da RFB; **a autorização só vale depois que a pessoa indicada confirma que aceita ser representante** [R2-22]. Guia do Usuário: o outorgante escolhe todos os serviços ou serviços específicos; enquanto o autorizado não valida, a situação é "Em Análise"; **a validação tem de ocorrer em até 30 dias**, senão a autorização é cancelada automaticamente [R2-23]. Data de entrada (05/12/2025): por notícias secundárias e pela notícia RFB de dezembro/2025 [R2-22] |
| Não encontrado | Norma que alterou o sistema; limite de autorizações por CPF; validade máxima (um resultado de busca do gov.br cita "até 5 anos ou o período definido pelo outorgante", não aberto) |
| Impacto na plataforma | Novo passo no onboarding (SOC-011/012): depois que o cliente concede, **alguém do escritório precisa validar em até 30 dias**; a plataforma deve lembrar e conferir (Integra-Procurações). Validar é ação do procurador no portal (gov.br/certificado): manter como tarefa manual com lembrete |
| Link | https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2025/dezembro/esta-no-ar-a-nova-versao-do-sistema-de-procuracoes-eletronicas · https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/passo-a-passo/autorizacoes-de-acesso-guia-do-usuario |
| Confiança | Alta para nome, aceite e prazo de 30 dias; baixa para limites e validade |

### I-14 · e-CAC por robô · mantido da rodada 1 (não conferido)

**C-cert desaconselhado** (anti-robô citado pelo CFC em 2021 [D2 S7]). Reforço oficial nesta rodada: a própria documentação da Caixa Postal do Integra diz que a API "busca substituir abordagens baseadas em Web Scraping, que podem se tornar instáveis ... e impactar o desempenho de plataformas como o e-CAC" [R2-08c]. Com o catálogo atual (I-01), a necessidade de robô no e-CAC cai para PER/DCOMP, DIRBI, e-BEF e parcelamentos da PGFN.

### I-15 · PGFN (Regularize, dívida ativa, transação) · mantido da rodada 1 (não conferido)

API para contribuinte ou procurador `[NÃO ENCONTRADO]` (não rebuscado). O Integra só tem "consultar dívida ativa" do PGMEI e extratos PAEX/SIPADE [R2-02]. Editais públicos [D2 S27]. Confiança baixa.

### I-16 · Certidões federais (CND, CRF, CNDT) · mantido da rodada 1 (não conferido)

**C-captcha** nos portais `[CP]` ou **B** por agregador (V3). A situação fiscal que explica a positiva vem do **SITFIS**, agora confirmado no catálogo (I-01, desde 01/09/2023; cobrado como Emissão) [R2-02, R2-07]. Base: Portaria Conjunta RFB/PGFN 1.751/2014 [D2 S26].

### I-17 · NFS-e Nacional (Sefin Nacional + ADN) · conferido na rodada 2

| Campo | Conteúdo |
| --- | --- |
| Nível | **A** |
| URLs oficiais (página atualizada em 20/08/2026) [R2-24] | Produção: ADN contribuintes `https://adn.nfse.gov.br/contribuintes/docs/index.html`; ADN geral `https://adn.nfse.gov.br/docs/index.html`; DANFSe `https://adn.nfse.gov.br/danfse/docs/index.html`; CNC (cadastro nacional de contribuintes) `https://adn.nfse.gov.br/cnc/docs/index.html` e `/cnc/consulta/docs/index.html`; parametrização `https://adn.nfse.gov.br/parametrizacao/docs/index.html`; **Sefin Nacional (emissão por DPS)** `https://sefin.nfse.gov.br/SefinNacional/docs/index`. Produção restrita: mesmos caminhos em `adn.producaorestrita.nfse.gov.br` e `sefin.producaorestrita.nfse.gov.br/API/SefinNacional/docs/index` |
| Manual do contribuinte (v1.0, 12/02/2026) [R2-25] | Métodos `GET /DFe/{NSU}` (distribuição) e `GET /NFSe/{ChaveAcesso}/Eventos`; destinação: emitente, intermediário e tomador. "As consultas ... podem ser realizadas utilizando um certificado cujo CNPJ tenha o **mesmo CNPJ Raiz do contribuinte**"; na consulta por NSU há parâmetro para informar outro CNPJ do mesmo raiz. O manual não prevê procuração. Limite HTTP 429: citado na rodada 1 [D3 S4], **não encontrado no texto da v1.0** relido nesta rodada |
| Credencial | **A1 do cliente** (ou de outro CNPJ do mesmo grupo raiz). Com a premissa 1 (A1 obrigatório no app do cliente), o ADN fica viável para toda a carteira. Acesso por procuração: pedido da FENACON, **não implementado** (apurado antes desta rodada) |
| Adesão (planilha oficial de 28/09/2026) [R2-26] | 5.571 municípios na planilha: **5.543 "Conveniado Ativo" e aderentes ao Ambiente Nacional**, 28 "Conveniado – Não Ativo"; 2.875 aderentes ao Emissor Nacional. **Capitais:** São Paulo (conveniado ativo; aderente ao Ambiente Nacional; vigência 22/12/2025), Belo Horizonte (vigência 01/12/2022), Curitiba (30/08/2023), Florianópolis (27/08/2025), Porto Alegre (17/04/2023): todas "Conveniado Ativo", "AderenteAmbienteNacional = Sim" e, segundo a planilha, "AderenteEmissorNacional = Sim" (conferir: SP e outras capitais mantêm emissor próprio `[CP]`; o campo pode significar adesão parcial). Por UF: SP 645/645 no Ambiente Nacional; MG 853/853; PR 398/399; SC 295/295; RS 496/497 |
| Preço | Gratuito |
| Limites | Hosts `adn.*` com falha de TLS a partir da sessão em 06/11/2026 (problema provável da rede da sessão, não do serviço); falhas do portal em jun/2026 [D3 S7, mantido] |
| Link | https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/apis-prod-restrita-e-producao · https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/documentacao-atual/manual-contribuintes-apis-adn-sistema-nacional-nfse.pdf · https://www.gov.br/nfse/pt-br/municipios/monitoramento-adesoes/municipios-aderentes-20260928.xlsx |
| Confiança | **Alta** para URLs, métodos, credencial e lista de municípios; média para o significado do campo "Emissor Nacional" nas capitais |

### I-18 · Portal do Simples Nacional e DTE-SN · parcialmente conferido na rodada 2

PGDAS-D, DEFIS, regime de apuração, PGMEI, DASN-SIMEI, CCMEI, parcelamentos do Simples/MEI e **indicador de adesão ao DTE** estão no Integra (I-01) [R2-02]. Opção pelo Simples, Termo de Exclusão e resposta continuam **D** (roteiro oficial 2027 [D2 S14], não relido). Mensagens do DTE-SN chegam pela Caixa Postal (o detalhe dá ciência, ver I-01) `[INFERÊNCIA]`. Confiança média.

### I-19 · Calculadora de Tributos da RFB (CBS, IBS, IS) · conferido na rodada 2

| Campo | Conteúdo |
| --- | --- |
| Nível | **A** |
| Endereço | Aplicação: `https://piloto-cbs.tributos.gov.br/servico/calculadora-consumo/` (aberta em 06/11/2026). Endpoint público de versão respondeu: `GET /servico/calculadora-consumo/api/calculadora/dados-abertos/versao` → `versaoApp 1.6.2`, `versaoDb V0066`, `dataVersaoDb 2026-10-28`, `ambiente "apr"` [R2-27]. Há Swagger UI em `/api/swagger-ui/index.html`, mas o arquivo de especificação não carregou na sessão. Outros caminhos (`/calculadora/regime-geral`, `/calculadora/base-calculo/...`) só por pacote **não oficial** `rfbcalc` (PyPI, via busca) `[NÃO VERIFICADO]` |
| Versão offline | O próprio site diz: "A Calculadora offline está disponível como imagem Docker e como componentes Java (JAR), um para a API do Regime Geral e outro para a API do Simples Nacional", e o pacote `calculadora.zip` reúne o Portal e "as APIs do Regime Regular, do Split Payment Simplificado e do Simples Nacional", para Windows, macOS e Linux [R2-27]. Portanto pode rodar no servidor da plataforma (sem cota da RFB) |
| Termos e licença | **`[NÃO ENCONTRADO]`** (a única licença no código da página é a do Padrão Digital de Governo, CC0/MIT, do componente visual, não da calculadora) |
| Preço | Gratuita [D6 S5] |
| Veredito | **Integrar a versão offline (Docker) como motor de conferência do M3**; acompanhar `versaoDb` para saber quando atualizar |
| Confiança | Alta para existência, endereço, versão offline e APIs; baixa para termos de uso |

### I-20 · Apuração assistida da CBS (RFB, piloto 2026) · mantido da rodada 1 (não conferido)

API para escritório `[NÃO ENCONTRADO]`; portal (piloto) [D6 S16] → **C-cert/D**. Confiança baixa.

### I-21 · Banco Central: SGS e PTAX · conferido na rodada 2 (SGS)

| Campo | Conteúdo |
| --- | --- |
| Nível | **A** |
| Teste em 06/11/2026 | `GET https://api.bcb.gov.br/dados/serie/bcdata.sgs.11/dados/ultimos/2?formato=json` → `[{"data":"04/11/2026","valor":"0.050788"},{"data":"05/11/2026","valor":"0.050788"}]` (série 11, Selic diária) [R2-28]. Sem credencial, gratuito |
| Não conferido | Códigos 432, 12, 433 e o limite de janela em séries diárias `[CP]`; PTAX (Olinda) não testada |
| Confiança | Alta para o endpoint e a série 11 |

### I-22 · IBGE (servicodados) · mantido da rodada 1 (não conferido)

`servicodados.ibge.gov.br` recusou conexão a partir da sessão em 06/11/2026. A planilha oficial da NFS-e traz um anexo com código IBGE de municípios (`anexo_a-municipio_ibge-paises_iso2-v1-00-snnfse-20251210.xlsx`, listado na documentação atual [R2-24b]), que serve de reserva para o código de município. Confiança média.

### I-23 · BCB: SCE-IED · mantido da rodada 1 (não conferido)

**D** `[CP]`; Res. BCB 278/2022 [D1 F25, F26].

### I-24 · SPED (ECD, ECF) e ReceitaNet · mantido da rodada 1 (não conferido)

**F/D** `[CP]`; a plataforma guarda o recibo vindo do core.

### I-25 · Serviços federais só por portal · parcialmente conferido na rodada 2

PER/DCOMP Web, DIRBI, e-BEF, Coletor Nacional/REDESIM (parte federal), Meu INSS → continuam **C-cert ou D** (não estão no catálogo do Integra em 15/10/2026 [R2-02]). **e-Processo saiu desta lista:** o Integra tem Integra-e-Processo (consultar processos por interessado desde 10/11/2025; documentos do processo e "consultar comunicados e intimações" no catálogo sem data de implantação) [R2-02]. **Vínculo do contador no CNPJ (REDESIM)**: consulta e renúncia pelo PNRCONTADOR desde 02/12/2025 [R2-02].

### I-26 · Fontes normativas · mantido da rodada 1 (não conferido)

Planalto, Sijut2, DOU, LexML. Nível **A**, confiança baixa.

---

## 2. Verificação por ficha

> Resumo da rodada 2 nesta seção: 63 fichas conferidas, 36 parcialmente conferidas, 36 mantidas da rodada 1 (não conferidas).


Formato: os campos da seção 2.2 do protocolo. `integrações` cita os códigos da seção 1. Os campos de cada ficha são os da rodada 1 (05/11/2026); a linha **status_rodada_2** diz o que foi conferido em 06/11/2026 (com base nas integrações I-xx citadas na ficha) e a linha **atualização_rodada_2**, quando existe, traz o que mudou. Onde as duas divergem, **vale a atualização da rodada 2**. Preços: onde a ficha da rodada 1 diz `[PREÇO NÃO VERIFICADO]` para o Integra Contador, vale a tabela oficial de I-01.

### 2.1 D1 · Clientes, Societário e Legalização

#### SOC-001 · Cadastrar cliente a partir do CNPJ
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | parcialmente conferido na rodada 2 (conferidos: I-02; parciais: I-04; mantidos da rodada 1: I-22) |
| atualização_rodada_2 | Consulta CNPJ SERPRO com preço oficial (Básica R$ 0,6591 a QSA R$ 0,8683 na faixa 1) [R2-14]; o endereço antigo dos dados abertos (I-04) dá 404 e o novo não foi encontrado: até achá-lo, a base inicial depende de I-02 ou de agregador (V3). CNPJ alfanumérico desde jul/2026: o cadastro deve aceitar letras. |
| nível_automação | **A** (I-04) + **A$** opcional (I-02) |
| integrações | I-04 dados abertos (base inicial); I-02 Consulta CNPJ para dado do dia; I-22 IBGE para município e CNAE |
| credencial_exigida | Nenhuma (I-04, I-22); contrato SERPRO (I-02) |
| preço | I-04/I-22 grátis; I-02 `[PREÇO NÃO PÚBLICO nesta rodada]` |
| limites_e_riscos | Dados abertos têm defasagem mensal; regime tributário (Simples/MEI) vem no arquivo, Lucro Presumido/Real não `[CP]` |
| alternativa | Agregador B (V3) |
| veredito | **Construir** com I-04 + I-22; I-02 só se a defasagem incomodar |
| confiança | Média |

#### SOC-002 · Manter o perfil temporal do cliente
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | parcialmente conferido na rodada 2 (conferidos: I-01; parciais: I-04) |
| nível_automação | **A** para o cadastral (I-04 mensal, diffs); **A$** para regime do Simples (I-01, `[CP]`) |
| integrações | I-04; I-01 (consulta de regime/opção do Simples `[CP]`) |
| credencial_exigida | Nenhuma / I-01 |
| preço | I-01 por chamada, ver mapa |
| limites_e_riscos | Lucro Real/Presumido não aparece em fonte federal consultável por API `[CP]`: continua sendo dado informado e versionado pelo escritório |
| alternativa | D (registro manual com data de vigência) |
| veredito | **Construir** (núcleo do produto) |
| confiança | Média |

#### SOC-003 · Vigiar o cadastro do CNPJ na RFB e nos órgãos
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | parcialmente conferido na rodada 2 (conferidos: I-02; parciais: I-04) |
| atualização_rodada_2 | PNRCONTADOR (Integra, desde 02/12/2025) permite consultar os vínculos do contador nos CNPJs [R2-02]: serve para detectar cliente que trocou de contador. Eventos de atualização PJ (grátis, lote de 1.000) avisam mudança sem custo por consulta [R2-12]. |
| nível_automação | **A** (I-04 mensal) + **A$** (I-02 para varredura semanal dos clientes ativos) |
| integrações | I-04, I-02; IE/IM ficam com V2 |
| credencial_exigida | Nenhuma / contrato SERPRO |
| preço | Ver mapa |
| limites_e_riscos | Base citada pela D1 (IN RFB 2.333/2026) `[NÃO VERIFICADO]` |
| alternativa | Agregador B |
| veredito | **Construir** |
| confiança | Média |

#### SOC-004 · Cadastrar sócios, administradores e representantes
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | parcialmente conferido na rodada 2 (conferidos: I-02; parciais: I-03, I-04) |
| nível_automação | **A** (QSA em I-04) |
| integrações | I-04; I-02; CPF dos sócios por I-03 (A$, opcional) |
| credencial_exigida | Nenhuma / SERPRO |
| preço | Ver mapa |
| limites_e_riscos | Dados abertos mascaram parte do CPF dos sócios `[CP]`; LGPD no armazenamento |
| alternativa | Documento societário lido por IA (D) |
| veredito | **Construir** |
| confiança | Média |

#### SOC-005 · Controlar inscrições estaduais, municipais e o contador responsável
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | parcialmente conferido na rodada 2 (parciais: I-04) |
| atualização_rodada_2 | Contador responsável no CNPJ: agora **A$** pelo PNRCONTADOR (consultar vínculos, solicitar renúncia, comprovante) [R2-02]. |
| nível_automação | Parte federal: **A** (I-04 traz CNPJ e situação); contador responsável no CNPJ: só portal `[CP]` → **D**. Estadual/municipal: V2 |
| veredito | **Integrar** (federal) + checklist |
| confiança | Baixa |

#### SOC-006 · Declarar e atualizar o beneficiário final (e-BEF)
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | parcialmente conferido na rodada 2 (parciais: I-25) |
| nível_automação | **D** (cálculo da cadeia na plataforma; transmissão manual) |
| integrações | I-25 (sem API conhecida); serviço no Integra Contador **`[NÃO ENCONTRADO]`** |
| credencial_exigida | Certificado/gov.br do representante ou procurador |
| preço | — |
| limites_e_riscos | Base: IN RFB 2.119/2022 com IN 2.290/2025 [D1 F20, F21] |
| alternativa | — |
| veredito | **Só checklist + lembrete** (com rascunho da cadeia pelo M3) |
| confiança | Baixa |

#### SOC-007 · Cadastrar e vigiar o Domicílio Judicial Eletrônico
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | mantido da rodada 1 (não conferido): sem integração federal mapeada |
| nível_automação | Fora do domínio V1 (CNJ). Indicativo: **C-cert/D** `[CP]` |
| veredito | Repassar à consolidação; checklist |
| confiança | Baixa |

#### SOC-008 · Guardar e inventariar certificados digitais (cofre)
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-01, I-05, I-06, I-17) |
| atualização_rodada_2 | Com a premissa 1, o cofre guarda o A1 do cliente (enviado no app) e o e-CNPJ do escritório. Usos federais conferidos: ADN da NFS-e exige certificado do mesmo CNPJ raiz do cliente [R2-25]; Integra aceita termo assinado com A1 ou A3 [R2-04]; Reinf aceita certificado do contribuinte ou de procurador [R2-18]. |
| nível_automação | **Construir** (interno). Relevância federal: o A1 do cliente é exigido por I-17 (NFS-e ADN) e pela distribuição de DF-e; o e-CNPJ do escritório por I-01, I-05, I-06 |
| limites_e_riscos | Guarda de A1 de terceiros é sensível (Nota Orientativa eSocial 14/2019 [D7 R14]); HSM/KMS, trilha de uso (SOC-010) |
| veredito | **Construir** |
| confiança | Média |

#### SOC-009 · Alertar o vencimento e conduzir a renovação de certificados
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | mantido da rodada 1 (não conferido): sem integração federal mapeada |
| nível_automação | **A** (data de validade lida do próprio certificado no cofre) + **D** (renovação com AC) |
| veredito | **Construir** |
| confiança | Alta para a leitura da validade (propriedade do certificado X.509); sem integração federal |

#### SOC-010 · Registrar quem usou cada certificado
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-01, I-05, I-06, I-17) |
| nível_automação | **Construir** (log interno de cada chamada I-01, I-05, I-06, I-17 com usuário, cliente, serviço) |
| veredito | **Construir**; requisito para os níveis C |
| confiança | Média |

#### SOC-011 · Pedir e acompanhar a autorização de acesso na RFB
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-01, I-13) |
| atualização_rodada_2 | Sistema novo **Autorizações de Acesso** confirmado em fonte oficial: o cliente concede no Portal de Serviços (todos os serviços ou serviços escolhidos); **o escritório precisa validar em até 30 dias** na aba Recebidas, senão a autorização é cancelada [R2-22, R2-23]. Fluxo da plataforma: pedido ao cliente pelo app com guia → lembrete ao escritório para validar → conferência por OBTERPROCURACAO41 (Consulta, R$ 0,24 na faixa 1) [R2-02, R2-07]. |
| nível_automação | Pedido e guia: **D**; acompanhamento: **A$** (I-13 consulta via Integra Procurações [D1 F3]) |
| integrações | I-13, I-01 |
| credencial_exigida | Cliente: gov.br prata/ouro ou certificado; escritório: e-CNPJ |
| preço | Por consulta (I-01) |
| limites_e_riscos | Nome e regras do sistema novo (dez/2025) não confirmados [D1 F8]; se o cliente esquecer um serviço, chamadas do Integra falham |
| alternativa | Escritório confere manualmente no e-CAC |
| veredito | **Integrar** (consulta) + roteiro guiado |
| confiança | Média |

#### SOC-012 · Validar autorizações recebidas e controlar escopo e vencimento
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-13) |
| atualização_rodada_2 | O aceite pelo procurador é obrigatório no sistema novo (status "Em Análise" até validar; prazo de 30 dias) [R2-23]. Nível do aceite: **D** (ação humana no portal); a leitura segue **A$**. Confiança sobe para alta no fluxo. |
| nível_automação | Leitura: **A$** (I-13); aceite/validação, se o sistema novo exigir ação do procurador: **C-cert** com aprovação `[CP]` |
| veredito | **Integrar** leitura; aceite manual |
| confiança | Baixa |

#### SOC-013 · Controlar procurações em outros órgãos
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | parcialmente conferido na rodada 2 (conferidos: I-08, I-13; parciais: I-09) |
| nível_automação | eSocial: procuração via e-CAC (A$ na leitura por I-13 `[CP]`); FGTS Digital SPE: **D** (sem API, I-08); DET: **D** (I-09) |
| veredito | **Só checklist + lembrete** com validade por órgão |
| confiança | Média |

#### SOC-014 · Orientar a conta gov.br dos sócios
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | mantido da rodada 1 (não conferido): I-12 |
| nível_automação | **D** (I-12: sem API de verificação do nível da conta `[CP]`) |
| veredito | **Só checklist** com roteiro e vídeo |
| confiança | Média |

#### SOC-019 · Cumprir a prevenção à lavagem de dinheiro (PLD)
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | parcialmente conferido na rodada 2 (parciais: I-04) |
| nível_automação | **D**. Comunicação ao COAF pelo sistema do CFC (D5 CTB-049) — fora do V1. Apoio federal: I-04 (QSA, situação) para due diligence |
| veredito | Checklist + consultas I-04 |
| confiança | Baixa |

#### SOC-022 · Fazer o diagnóstico de entrada
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | parcialmente conferido na rodada 2 (conferidos: I-01; mantidos da rodada 1: I-16) |
| nível_automação | **A$** (I-01: situação fiscal, caixa postal, parcelamentos, declarações entregues `[CP]`) + I-16 (certidões, C-captcha/B) |
| preço | Pacote de chamadas por cliente novo (estimar ~10–20 chamadas `[ESTIMATIVA]`) |
| limites_e_riscos | Exige procuração ativa antes do diagnóstico |
| veredito | **Integrar** |
| confiança | Média |

#### SOC-023 · Receber o acervo e a responsabilidade do contador anterior
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-01, I-05) |
| nível_automação | Parte federal: **A** (I-05 download de eventos do eSocial do histórico) e **A$** (I-01 declarações transmitidas `[CP]`); resto **D** |
| veredito | **Integrar** onde houver; checklist |
| confiança | Baixa |

#### SOC-024 · Conduzir o offboarding do cliente
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-01, I-13) |
| nível_automação | **D**; revogar a própria procuração é ato no portal (I-13) `[CP]`; parar bilhetagem I-01 |
| veredito | Checklist |
| confiança | Baixa |

#### SOC-027 · Obter CNPJ e inscrições
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | parcialmente conferido na rodada 2 (parciais: I-25) |
| nível_automação | **D** na parte federal (Coletor Nacional/REDESIM, I-25); V2 cobre Juntas/REDESIM estaduais |
| veredito | Checklist + acompanhamento |
| confiança | Baixa |

#### SOC-028 · Fazer a opção pelo Simples Nacional e o enquadramento na abertura
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | parcialmente conferido na rodada 2 (conferidos: I-01; parciais: I-18) |
| nível_automação | **D** para a opção (portal do Simples, I-18); acompanhamento do resultado por I-01 `[CP]` |
| limites_e_riscos | Prazos da opção mudaram para 2027 (set–out/2026) [D2 S14, roteiro oficial RFB] |
| veredito | Checklist com prazo derivado da data de abertura |
| confiança | Média |

#### SOC-029 · Fazer alterações contratuais e cadastrais
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | parcialmente conferido na rodada 2 (conferidos: I-02; parciais: I-04) |
| nível_automação | **D** (federal); conferência posterior por I-04/I-02 |
| veredito | Checklist + vigilância |
| confiança | Baixa |

#### SOC-031 · Encerrar a empresa (baixa)
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | parcialmente conferido na rodada 2 (conferidos: I-01; mantidos da rodada 1: I-16) |
| nível_automação | Pré-checagem de pendências: **A$** (I-01 situação fiscal) + I-16; ato de baixa: **D** |
| veredito | **Integrar** pré-checagem; checklist |
| confiança | Baixa |

#### SOC-032 · Atender o ciclo de vida do MEI
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-01) |
| nível_automação | **A$**: CCMEI emissão automatizada é oficial [D2 S2]; DAS-MEI e DASN-SIMEI `[CP]` |
| integrações | I-01 |
| credencial_exigida | Procuração do MEI para o escritório |
| preço | Por chamada (revenda R$ 0,75/DAS em 2025 [D2 S5]) |
| limites_e_riscos | Margem baixa no MEI: custo por chamada pesa; volume alto |
| alternativa | PGMEI web sem certificado (D) |
| veredito | **Integrar** |
| confiança | Média |
| correção à ficha D1 | A ficha marcou CCMEI como `[NÃO VERIFICADO na lista atual]`: a notícia oficial do SERPRO de 2024 confirma a emissão automatizada do CCMEI [D2 S2] |

#### SOC-033 · Abrir filial ou transferir sede entre UFs
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | mantido da rodada 1 (não conferido): sem integração federal mapeada |
| nível_automação | **D** (federal); V2 |
| veredito | Checklist |
| confiança | Baixa |

#### SOC-040 · Controlar registros em conselhos e órgãos setoriais
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | mantido da rodada 1 (não conferido): sem integração federal mapeada |
| nível_automação | Fora do V1 (autarquias de classe). **D** |
| confiança | Baixa |

#### SOC-042 · Autenticar livros digitais na Junta
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | mantido da rodada 1 (não conferido): I-24 |
| nível_automação | Autenticação da ECD é automática pelo SPED (Decreto 8.683/2016) `[CP]`; livros fora da ECD: V2 (Juntas). Federal: **F/D** (I-24) |
| veredito | Checklist |
| confiança | Baixa |

#### SOC-044 · Cumprir as obrigações de capital estrangeiro (SCE-IED)
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | mantido da rodada 1 (não conferido): I-23 |
| nível_automação | **D** (I-23) |
| veredito | **Só checklist + lembrete** (flag "sócio estrangeiro" no perfil) |
| confiança | Baixa |

#### SOC-046 · Manter o calendário societário e de legalização
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | mantido da rodada 1 (não conferido): I-16 |
| nível_automação | Interno (**construir**); feriados nacionais: lista oficial anual (portaria do Ministério da Gestão) `[CP]`; datas de vencimento de certidões: I-16 |
| confiança | Baixa |

### 2.2 D2 · Fiscal e Obrigações

#### FIS-001 · Gerar o calendário mensal de obrigações
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | parcialmente conferido na rodada 2 (parciais: I-04; mantidos da rodada 1: I-26) |
| nível_automação | Interno (tabela versionada); sem API oficial de "agenda tributária" `[CP]`. Agenda Tributária da RFB é página publicada mensalmente (leitura de página pública) `[CP]` |
| integrações | I-26 (normas), I-04 (perfil) |
| veredito | **Construir** (diferencial) |
| confiança | Média |

#### FIS-002 · Acompanhar prorrogações e mudanças de prazo
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | mantido da rodada 1 (não conferido): I-26 |
| nível_automação | **A** para a fonte (DOU, Sijut2, páginas de notícias da RFB, I-26) + IA classifica; aprovação humana antes de alterar prazo |
| veredito | **Construir** (vigia da lei) |
| confiança | Baixa (fontes não abertas) |

#### FIS-003 · Comprovar a entrega: anexar recibo e dar baixa
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | parcialmente conferido na rodada 2 (conferidos: I-01, I-05, I-06; mantidos da rodada 1: I-24) |
| nível_automação | **A$** para DCTFWeb, PGDAS-D, DEFIS, DASN (consulta de declarações/recibos pelo I-01 `[CP]`); **A** para eSocial/Reinf (I-05, I-06); **F** para SPED (recibo vem do core, I-24) |
| veredito | **Integrar** |
| confiança | Média |

#### FIS-004 · Conferir antes de transmitir
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-01, I-05, I-06) |
| nível_automação | Interno (cruzamentos); insumos federais: I-01 (PGDAS-D anterior, DCTFWeb), I-05 (totalizadores), I-06 |
| veredito | **Construir** |
| confiança | Média |

#### FIS-005 · Ler a caixa postal do e-CAC (DTE) de todos os clientes
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-01) |
| atualização_rodada_2 | Respondido: **o serviço "Obter detalhes de uma mensagem específica" (MSGDETALHAMENTO62) registra ciência da intimação** (art. 23, § 2º, III, do Decreto 70.235/1972), igual ao e-CAC [R2-08]. Desenho: monitorar com indicador de novas mensagens (INNOVAMSG63, cobrado como Consulta segundo a loja [R2-07]) e/ou lista de mensagens (MSGCONTRIBUINTE61, Consulta, traz assunto, relevância, `dataCiencia`) [R2-08b]; **abrir o detalhe só com aprovação do contador** (cartão de aprovação), com registro de quem autorizou. Preço: Consulta R$ 0,24 a R$ 0,06 por chamada [R2-07]. Nível: **A$** confirmado; confiança alta. |
| nível_automação | **A$** (monitoramento de eventos gratuito + leitura paga) |
| integrações | I-01: monitoramento gratuito de eventos de Caixa Postal [D2 S2, oficial]; leitura do conteúdo da mensagem por serviço pago `[CP]` |
| credencial_exigida | e-CNPJ do escritório + procuração com o serviço de caixa postal |
| preço | Eventos: grátis [D2 S2]; leitura: por chamada `[PREÇO NÃO VERIFICADO]` |
| limites_e_riscos | Ler pela API pode registrar ciência `[CP]` (confirmar se a leitura via Integra marca a mensagem como lida; se marcar, a contagem do prazo começa); robô no e-CAC é combatido [D2 S7] |
| alternativa | Robô C-cert (desaconselhado) ou leitura manual com lista de pendências |
| veredito | **Integrar** (prioridade alta) |
| confiança | Média |
| correção à ficha D2 | Os 15 dias (Decreto 70.235/1972, art. 23) e os 45 dias (DTE-SN, LC 123/2006) **não são versões conflitantes**: são regimes diferentes (caixa postal geral × Simples Nacional) `[CP]`; a plataforma deve calcular o prazo conforme a origem da mensagem. Confirmar os artigos na próxima rodada |

#### FIS-006 · Emitir e comparar o relatório de situação fiscal federal
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-01) |
| atualização_rodada_2 | SITFIS confirmado no catálogo oficial (SOLICITARPROTOCOLO91 e RELATORIOSITFIS92, desde 01/09/2023) [R2-02]; a documentação tem seções "Tempo de espera" e "Cache". A loja lista as duas chamadas como **Emissão** (R$ 0,32 cada na faixa 1, ~R$ 0,64 por relatório) [R2-07]. Confiança alta. |
| nível_automação | **A$** (SITFIS pelo I-01, existência em fonte oficial `[NÃO VERIFICADO]`, só pacote não oficial [D2 S3-b]) |
| credencial_exigida | Procuração com o serviço de situação fiscal |
| preço | Por chamada; serviço assíncrono (protocolo + relatório) `[CP]` |
| limites_e_riscos | Relatório em PDF: extrair dados por IA para o diff; pendências da PGFN aparecem no relatório `[CP]` |
| alternativa | C-cert no e-CAC (desaconselhado) ou D |
| veredito | **Integrar** |
| confiança | Baixa–média |

#### FIS-007 · Controlar procurações eletrônicas no e-CAC e em outros órgãos
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | parcialmente conferido na rodada 2 (conferidos: I-08, I-13; parciais: I-09) |
| nível_automação | **A$** (I-13 leitura) + **D** (outros órgãos, I-08, I-09) |
| veredito | **Integrar** + checklist |
| confiança | Média |

#### FIS-008 · Monitorar e tratar o Termo de Exclusão do Simples (DTE-SN)
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-01) |
| atualização_rodada_2 | Indicador DTE (CONSULTASITUACAODTE111) informa adesão ao DTE do Simples/e-CAC [R2-02]; o termo de exclusão chega pela caixa postal, cuja leitura do detalhe dá ciência [R2-08]. |
| nível_automação | Leitura **A$** (caixa postal/DTE-SN via I-01 `[CP]`); regularização **D** |
| limites_e_riscos | Prazo de regularização 90 dias (LC 216/2025) [D2 S13, secundária]; contestação 30 dias |
| veredito | **Integrar** leitura; alerta de alta prioridade |
| confiança | Média |

#### FIS-009 · Transmitir o PGDAS-D mensal
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-01) |
| atualização_rodada_2 | PGDAS-D TRANSDECLARACAO11 confirmado [R2-02]; preço oficial: **Declaração R$ 0,40 (1–100/mês) a R$ 0,12** [R2-07]; revenda Alterdata R$ 0,80 por declaração [R2-11]. O valor de fórum (R$ 0,96) fica superado. |
| nível_automação | **A$** (I-01, transmissão `[CP]`; Alterdata revende serviços do Simples [D2 S5]) |
| credencial_exigida | Procuração |
| preço | Declaração por chamada (fórum: até R$ 0,96 [D2 S6]) |
| limites_e_riscos | Normalmente feito pelo core; a plataforma confere e só transmite se o core não fizer; multa por atraso desde 01/01/2026 [D2 S11] |
| alternativa | Transmissão manual no portal |
| veredito | **Integrar** (conferência + transmissão opcional, sempre com aprovação) |
| confiança | Média |

#### FIS-010 · Emitir o DAS e enviar ao cliente
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-01) |
| atualização_rodada_2 | GERARDAS12 (e DAS de cobrança, de processo e avulso desde 27/11/2024) confirmados [R2-02]; preço oficial **Emissão R$ 0,32 (1–500/mês) a R$ 0,08** [R2-07]. Entrega ao cliente pelo app (premissa 1). |
| nível_automação | **A$** (I-01) |
| preço | R$ 0,75/DAS na revenda Alterdata, 2025 [D2 S5] |
| veredito | **Integrar** |
| confiança | Média |

#### FIS-011 · Monitorar sublimite e limite do Simples
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-01) |
| atualização_rodada_2 | Consultas de declarações e extrato do DAS (PGDASD CONSDECLARACAO13, CONSEXTRATO16) confirmadas [R2-02], Consulta R$ 0,24 a R$ 0,06 [R2-07]. |
| nível_automação | Interno a partir das notas (D3) e do PGDAS-D (I-01 consulta de declarações `[CP]`) |
| veredito | **Construir** |
| confiança | Média |

#### FIS-012 · Calcular o fator R e orientar o pró-labore
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-05) |
| nível_automação | Interno (M3); insumos: folha do core ou I-05 (remunerações dos últimos 12 meses por download de eventos) |
| veredito | **Construir** |
| confiança | Média |

#### FIS-013 · Entregar a DEFIS
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-01) |
| atualização_rodada_2 | DEFIS TRANSDECLARACAO141 e consultas confirmados (25/09/2023) [R2-02]; Declaração R$ 0,40 a R$ 0,12 [R2-07]. |
| nível_automação | **A$** `[CP]` (DEFIS no I-01) |
| limites_e_riscos | Multa por atraso desde 2026 [D2 S11] |
| alternativa | Portal (D) |
| veredito | **Integrar** se confirmado; senão checklist |
| confiança | Baixa |

#### FIS-014 · Conduzir a opção, o cancelamento e as pendências de entrada no Simples
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | parcialmente conferido na rodada 2 (conferidos: I-01; parciais: I-18) |
| nível_automação | **D** para a opção (I-18); acompanhamento de pendências por I-01 (SITFIS) `[CP]` |
| fontes | Roteiro oficial 2027 [D2 S14] |
| veredito | Checklist com prazo |
| confiança | Média |

#### FIS-015 · Decidir e registrar a opção semestral pelo regime regular de IBS/CBS
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-01, I-19) |
| atualização_rodada_2 | REGIMEAPURACAO no Integra trata do **regime de caixa/competência** do Simples (efetuar e consultar opção, desde 24/07/2023) [R2-02]. Serviço para a opção semestral IBS/CBS "por fora" do Simples: `[NÃO ENCONTRADO]` no catálogo de 15/10/2026. |
| nível_automação | Decisão: M3 + I-19; registro da opção: **D** (portal do Simples) — serviço no I-01 `[NÃO ENCONTRADO]` |
| base | Res. CGSN 186/2026 [D6 S2]; prorrogação Res. CGSN 194/2026 [D6 S3] |
| veredito | **Construir** simulação; checklist para a opção |
| confiança | Média |

#### FIS-016 · Emitir e enviar o DAS-MEI em lote
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-01) |
| atualização_rodada_2 | PGMEI GERARDASPDF21 e GERARDASCODBARRA22 confirmados [R2-02]; Emissão R$ 0,32 a R$ 0,08 [R2-07]. Confiança alta. |
| nível_automação | **A$** `[CP]` (PGMEI no I-01) |
| alternativa | PGMEI web (D) |
| veredito | **Integrar** |
| confiança | Média |

#### FIS-017 · Entregar a DASN-SIMEI e controlar o limite do MEI
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | parcialmente conferido na rodada 2 (ver atualização) |
| atualização_rodada_2 | DASN-SIMEI (entregar, consultar, DAS de excesso) consta no catálogo sem data de implantação (situação a confirmar na legenda do catálogo) [R2-02]; CCMEI situação cadastral confirmado (01/10/2024). |
| nível_automação | **A$** `[CP]` + interno para limite (notas) |
| veredito | **Integrar** |
| confiança | Baixa–média |

#### FIS-018 · Conduzir opção, desenquadramento e baixa do SIMEI
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | mantido da rodada 1 (não conferido): sem integração federal mapeada |
| nível_automação | **D** (portal); alerta interno |
| veredito | Checklist |
| confiança | Baixa |

#### FIS-019 · Fechar e transmitir a DCTFWeb (com MIT) e emitir o DARF
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-01, I-07) |
| atualização_rodada_2 | DCTFWeb e MIT confirmados (I-07) [R2-02]; transmitir = Declaração; guia = Emissão [R2-07]. |
| nível_automação | **A$** (I-07 / I-01) [D2 S3, oficial] |
| preço | Ver I-01 |
| limites_e_riscos | Em andamento bloqueia CND [D2 S10]; prazo último dia útil (IN 2.248/2025) [D2 S8] |
| veredito | **Integrar** |
| confiança | Média |

#### FIS-020 · Fechar e transmitir a EFD-Reinf
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-06) |
| atualização_rodada_2 | Manual do desenvolvedor da Reinf v2.8 (ago/2026): só modelo assíncrono; URLs de produção e API REST de recibo; procurador com procuração eletrônica RFB (CNPJ matriz) pode usar [R2-18]. A transmissão continua sendo do core (regra 3.7); a plataforma usa a consulta de recibo para comprovar. |
| nível_automação | **A** (I-06); geração no core |
| veredito | **Integrar** (consulta/conferência); transmissão fica no core |
| confiança | Baixa |

#### FIS-021 · Emitir DARF avulso e recalcular tributo pago em atraso
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-01, I-21) |
| atualização_rodada_2 | Sicalc confirmado (CONSOLIDARGERARDARF51, GERARDARFCODBARRA53) e novo **CONSOLIDAR54** (15/10/2026): calcula acréscimos sem emitir o DARF, útil para simular atraso [R2-02]. Selic diária pela API SGS testada [R2-28]. |
| nível_automação | **A$** (Sicalc no I-01 `[CP]`); cálculo de acréscimos com Selic (I-21) como conferência |
| veredito | **Integrar** |
| confiança | Baixa |

#### FIS-022 · Entregar a DIRBI mensal
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | parcialmente conferido na rodada 2 (parciais: I-25) |
| atualização_rodada_2 | DIRBI não está no catálogo do Integra (15/10/2026) [R2-02]: segue D. |
| nível_automação | **D** (formulário no e-CAC, I-25, sem API conhecida `[CP]`) |
| limites_e_riscos | Possível migração da DIRBI para outra obrigação `[NÃO VERIFICADO]` |
| veredito | Checklist só para clientes com benefício |
| confiança | Baixa |

#### FIS-023 · Controlar a entrega dos SPED gerados pelo core
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | mantido da rodada 1 (não conferido): I-24 |
| nível_automação | **F** (recibo do core, I-24) |
| veredito | **Integrar** com o core (V3) |
| confiança | Média |

#### FIS-030 · Vigiar situação cadastral (CNPJ) e omissões que levam à inaptidão
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | parcialmente conferido na rodada 2 (conferidos: I-01, I-02; parciais: I-04) |
| nível_automação | **A**/**A$** (I-04, I-02) + I-01 (omissões na situação fiscal `[CP]`) |
| veredito | **Construir/Integrar** |
| confiança | Média |

#### FIS-031 · Operar a central de guias
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-01, I-08) |
| nível_automação | Guias federais: **A$** (DAS, DAS-MEI, DARF DCTFWeb, Sicalc via I-01); GFD: **D/C-cert** (I-08); leitura de PDF por IA para guias que chegam do core |
| veredito | **Construir** (central) + **integrar** (I-01) |
| confiança | Média |

#### FIS-032 · Confirmar o pagamento das guias e cobrar o cliente
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-08) |
| atualização_rodada_2 | PAGTOWEB (consultar pagamentos, emitir comprovante, contar documentos pagos) confirmado [R2-02]; Consulta/Emissão pela tabela [R2-07]. |
| nível_automação | **A$**: monitoramento gratuito de eventos de **Pagamento Web** [D2 S2, oficial] + consulta/comprovante pago `[CP]`; FGTS: **D** (I-08); alternativa: extrato bancário (Open Finance, V3) |
| veredito | **Integrar** (prioridade alta) |
| confiança | Média |

#### FIS-033 · Enviar ao cliente o resumo mensal fiscal
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-01) |
| nível_automação | Interno; dados de I-01 (pagamentos, pendências) |
| veredito | **Construir** |
| confiança | Média |

#### FIS-034 · Controlar parcelamentos ativos e emitir as parcelas
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | parcialmente conferido na rodada 2 (ver atualização) |
| atualização_rodada_2 | Parcelamentos do Simples e MEI (8 modalidades, desde 11/11/2024) e PAEX/SIPADE confirmados [R2-02]; PGFN continua sem API. |
| nível_automação | RFB/Simples/MEI: **A$** (Integra Parcelamento [D2 S4, oficial]); PGFN: **C-cert/D** (I-15) |
| preço | Por chamada |
| veredito | **Integrar** (RFB) + checklist (PGFN) |
| confiança | Média |

#### FIS-035 · Acompanhar editais de transação e programas de regularização
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | mantido da rodada 1 (não conferido): I-15, I-26 |
| nível_automação | **A** para leitura de editais públicos (I-15, I-26); adesão **D** no Regularize |
| veredito | **Construir** monitor + cruzamento com clientes |
| confiança | Baixa |

#### FIS-036 · Emitir, monitorar e entregar certidões negativas
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | parcialmente conferido na rodada 2 (conferidos: I-01; mantidos da rodada 1: I-16) |
| nível_automação | **C-captcha** direto / **B** por agregador (I-16) |
| integrações | I-16; SITFIS (I-01) para antecipar positiva |
| credencial_exigida | Nenhuma para CND conjunta, CRF e CNDT (consulta pública por CNPJ) `[CP]` |
| preço | Portais grátis; agregador por consulta (V3) |
| limites_e_riscos | CAPTCHA; termos de uso de agregadores |
| alternativa | Humano no circuito pelo celular (C-captcha) |
| veredito | **Comprar** (agregador) + monitor de validade |
| confiança | Média |

#### FIS-037 · Diagnosticar e resolver o que impede a certidão
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-01) |
| nível_automação | **A$** (SITFIS, I-01 `[CP]`) + IA explica + tarefa |
| veredito | **Integrar** |
| confiança | Baixa–média |

#### FIS-038 · Tratar intimações e notificações fiscais
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | parcialmente conferido na rodada 2 (parciais: I-25) |
| atualização_rodada_2 | Integra-e-Processo: consultar processos por interessado (10/11/2025) e, no catálogo, "consultar comunicados e intimações" e documentos do processo [R2-02]. Intimações da caixa postal: detalhe dá ciência [R2-08]. |
| nível_automação | Federal: entrada por FIS-005 (A$); resposta **D** (e-Processo/e-CAC, I-25) |
| veredito | **Integrar** entrada; resposta assistida (M1 rascunha) |
| confiança | Média |

#### FIS-039 · Responder malha PJ e campanhas de autorregularização
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | mantido da rodada 1 (não conferido): sem integração federal mapeada |
| nível_automação | Entrada pela caixa postal (A$); resposta **D** |
| veredito | Idem FIS-038 |
| confiança | Baixa |

#### FIS-040 · Conferir notificações de multa por atraso (MAED) e pedir revisão
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | mantido da rodada 1 (não conferido): sem integração federal mapeada |
| nível_automação | Entrada A$ (caixa postal); revisão **D** |
| veredito | **Integrar** entrada + conferência interna de datas |
| confiança | Baixa |

#### FIS-041 · Identificar e recuperar PIS/Cofins monofásico pago a maior no Simples
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | mantido da rodada 1 (não conferido): sem integração federal mapeada |
| nível_automação | Identificação interna (XML, D3); retificação do PGDAS-D **A$** `[CP]`; restituição/compensação **D** |
| veredito | **Construir** detecção |
| confiança | Baixa |

#### FIS-042 · Elaborar e acompanhar PER/DCOMP
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | parcialmente conferido na rodada 2 (parciais: I-25) |
| nível_automação | **D** (PER/DCOMP Web, I-25); status pela caixa postal (A$) |
| veredito | Checklist + prazo de prescrição |
| confiança | Baixa |

#### FIS-044 · Responder dúvidas fiscais do cliente no WhatsApp
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-01) |
| nível_automação | Interno (M1/M2); dados de I-01 para "quanto pago, pagou?" |
| veredito | **Construir** |
| confiança | Média |

#### FIS-045 · Conferir o destaque de CBS/IBS nas notas (2026)
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-19) |
| nível_automação | **A** (I-19 como conferência, endereço `[NÃO ENCONTRADO]`) |
| limites_e_riscos | Sem multa antes de 90 dias do regulamento [D2 S32] |
| veredito | **Construir** com I-19 |
| confiança | Média |

#### FIS-046 · Garantir certificado e acesso válidos antes das transmissões
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-13) |
| atualização_rodada_2 | Pré-condições conferidas: procuração/autorização validada (I-13, 30 dias), termo de autorização vigente (I-01, token até meia-noite do dia seguinte) [R2-04], A1 do cliente válido no cofre para NFS-e [R2-25]. |
| nível_automação | Interno (cofre) + I-13 (procurações) |
| veredito | **Construir** |
| confiança | Média |

#### FIS-047 · Acompanhar o fechamento fiscal do mês
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-01) |
| nível_automação | Interno; status alimentado por I-01 (DCTFWeb, PGDAS-D, pagamentos) |
| veredito | **Construir** |
| confiança | Média |

### 2.3 D3 · Notas fiscais

Nota: a distribuição de NF-e/CT-e (Ambiente Nacional) foi atribuída ao V2 pelo protocolo; aqui só NFS-e Nacional, retenções federais, cadastro e reforma.

#### NFE-001 · Configurar a captura de cada cliente (parte NFS-e Nacional)
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-17) |
| atualização_rodada_2 | URLs oficiais do ADN e da Sefin Nacional conferidas [R2-24]; credencial: A1 do cliente (premissa 1) [R2-25]. |
| nível_automação | **A** (I-17) |
| credencial_exigida | **A1 do cliente** (mesmo CNPJ raiz) [D3 S4] |
| veredito | **Construir** |
| confiança | Média |

#### NFE-003 · Monitorar a saúde da captura (NFS-e Nacional)
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-17) |
| atualização_rodada_2 | Todas as capitais do escopo e quase todos os municípios de SP, MG, PR, SC e RS aparecem como aderentes ao Ambiente Nacional na planilha de 28/09/2026 [R2-26]; a saúde da captura deve olhar o último NSU por cliente. |
| nível_automação | **A** (I-17: último NSU, HTTP 429, certificado vencido) |
| veredito | **Construir** |
| confiança | Média |

#### NFE-007 · Capturar NFS-e prestadas e tomadas pelo ADN
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-17) |
| atualização_rodada_2 | Conferido: `GET /DFe/{NSU}` e `GET /NFSe/{chave}/Eventos`, produção `https://adn.nfse.gov.br/contribuintes/` [R2-24, R2-25]; certificado do mesmo CNPJ raiz do contribuinte. Adesão oficial (28/09/2026): 5.543 municípios conveniados ativos e aderentes ao Ambiente Nacional, incluindo as 5 capitais do escopo [R2-26] (substitui o "1.472" de fonte secundária). O limite 429 não aparece no manual v1.0 relido. Confiança alta. |
| nível_automação | **A** |
| integrações | I-17 (`GET /DFe/{NSU}`, `GET /NFSe/{chave}/Eventos`) [D3 S4] |
| credencial_exigida | A1 do cliente (CNPJ raiz) |
| preço | Gratuito |
| limites_e_riscos | 429; URL de produção diverge entre fontes; municípios que não compartilham ainda (mapa de adesão `[NÃO ENCONTRADO]` em fonte oficial; 1.472 por fonte secundária [D3 S5]) |
| alternativa | NFE-008 (V2: prefeituras e integradores) |
| veredito | **Construir** |
| confiança | Média |

#### NFE-016 · Detectar notas emitidas indevidamente contra o CNPJ (parte NFS-e)
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-17) |
| nível_automação | **A** (I-17, notas tomadas) |
| veredito | **Construir** |
| confiança | Média |

#### NFE-022 · Conciliar faturamento das notas com a receita declarada
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-01) |
| nível_automação | Interno + **A$** (PGDAS-D declarado via I-01 `[CP]`) |
| veredito | **Construir** |
| confiança | Média |

#### NFE-027 · Conferir ISS e retenções federais nas NFS-e
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-17) |
| nível_automação | Interno (regras); dados I-17 |
| veredito | **Construir** |
| confiança | Média |

#### NFE-028 · Verificar a regularidade cadastral dos emitentes
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | parcialmente conferido na rodada 2 (conferidos: I-02; parciais: I-04) |
| nível_automação | **A** (I-04 em lote, defasagem mensal) / **A$** (I-02 na data); IE: V2 |
| preço | I-02 por consulta: custo multiplica pelo nº de fornecedores; usar I-04 como triagem |
| veredito | **Construir** com I-04; I-02 só para exceções |
| confiança | Média |

#### NFE-030 · Conferir os grupos de IBS/CBS nas NF-e/NFC-e
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-19) |
| nível_automação | **A** (I-19, tabelas de cClassTrib publicadas pelos entes `[CP]`) |
| veredito | **Construir** |
| confiança | Média |

#### NFE-031 · Acompanhar a migração ao Emissor Nacional da NFS-e
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-17) |
| atualização_rodada_2 | Planilha oficial (28/09/2026): 2.875 municípios aderentes ao Emissor Nacional; nas UFs do escopo SP 421, MG 482, PR 195, SC 203, RS 302 [R2-26]. |
| nível_automação | Interno (vigia da lei) + I-17 (detectar se as notas do cliente passaram a aparecer no ADN) |
| veredito | **Construir** |
| confiança | Média |

#### NFE-036 · Guardar os XMLs pelo prazo legal (NFS-e)
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-17) |
| nível_automação | **A** (I-17) + armazenamento interno |
| veredito | **Construir** |
| confiança | Média |

#### NFE-039 · Emitir notas fiscais pelo cliente (NFS-e)
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | parcialmente conferido na rodada 2 (ver atualização) |
| atualização_rodada_2 | Emissão por DPS na Sefin Nacional: `https://sefin.nfse.gov.br/SefinNacional/docs/index` [R2-24]; exige o certificado do prestador (A1 no cofre, premissa 1). |
| nível_automação | **A** (emissão de DPS na Sefin Nacional `[CP]`) para municípios no padrão nacional; **B** (integrador, V2/V3) para os demais |
| credencial_exigida | Certificado do prestador (cliente) |
| veredito | **Integrar**, com aprovação do cliente antes de emitir |
| confiança | Baixa–média |

#### NFE-040 · Acompanhar notas técnicas e mudanças de leiaute (NFS-e)
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | mantido da rodada 1 (não conferido): sem integração federal mapeada |
| nível_automação | **A** (biblioteca técnica do gov.br/nfse, leitura de página pública [D3 S6]) |
| veredito | **Construir** monitor |
| confiança | Média |

### 2.4 D4 · Trabalhista e DP

#### DP-004 · Conferir CPF e dados cadastrais antes do S-2200
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | parcialmente conferido na rodada 2 (parciais: I-03) |
| nível_automação | **A$** (I-03 Consulta CPF `[CP]`) ou Qualificação Cadastral em lote (C-cert/D) |
| preço | `[PREÇO NÃO PÚBLICO nesta rodada]` |
| veredito | **Integrar** se o preço por consulta couber; senão validação por dígito + lote manual |
| confiança | Baixa |

#### DP-006 · Transmitir a admissão no prazo e conferir o recibo
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-05) |
| nível_automação | **A** (I-05 consulta de recibo); transmissão no core |
| credencial_exigida | e-CNPJ do escritório + procuração eSocial |
| veredito | **Integrar** (conferência) |
| confiança | Média |

#### DP-014 · Atualizar tabelas e parâmetros legais
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | mantido da rodada 1 (não conferido): I-26 |
| nível_automação | **A** para fontes (I-26; salário mínimo, tabelas INSS/IRRF por portaria) — sem API oficial de "tabelas" `[CP]` |
| veredito | **Construir** (vigia da lei) |
| confiança | Baixa |

#### DP-013 · Conferir os descontos do Crédito do Trabalhador
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-05, I-08) |
| nível_automação | Dados no eSocial (I-05) e guia no FGTS Digital (I-08, D) [D4 T1, T5] |
| veredito | **Integrar** (eSocial) + checklist |
| confiança | Baixa |

#### DP-016 · Fechar os eventos periódicos do eSocial e tratar rejeições
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-05) |
| atualização_rodada_2 | Manual do desenvolvedor do eSocial v1.16 (ago/2026): lote de até 50 eventos; envio sem exigência de procuração; resultado só com o mesmo certificado [R2-16]. |
| nível_automação | **A** (I-05 consulta de lotes e totalizadores) |
| veredito | **Integrar** (painel de rejeições por cliente) |
| confiança | Média |

#### DP-017 · Conferir a DCTFWeb do DP e emitir o DARF
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-07) |
| nível_automação | **A$** (I-07) |
| veredito | **Integrar** |
| confiança | Média |

#### DP-018 · Emitir e conferir a guia do FGTS Digital (GFD)
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-08) |
| atualização_rodada_2 | Página oficial de documentação técnica do FGTS Digital não traz API (só manual v1.70, leiaute de remunerações rescisórias e manual do SPE) [R2-19, R2-20]; notícia de jul/2026 cita "Integrações de Sistemas (API)" para folha e parceiros [R2-21]: perguntar ao MTE (seção 5). Veredito mantido: D com leitura do PDF da guia enviado ao cliente pelo app. |
| nível_automação | **C-cert** ou **D** (I-08; API `[NÃO ENCONTRADO]`) |
| credencial_exigida | e-CNPJ do escritório + procuração SPE |
| limites_e_riscos | Robô em portal gov.br; mudanças frequentes; contingência 05/2026 |
| alternativa | Analista emite; plataforma lê o PDF e envia |
| veredito | **Só checklist + lembrete** no início; robô C-cert só após parecer jurídico e se a dor justificar |
| confiança | Média |

#### DP-021 · Conferir o pagamento das guias
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-01, I-08) |
| nível_automação | DARF: **A$** (PagtoWeb, I-01 [D2 S2]); GFD: **D** (I-08) ou extrato bancário (V3) |
| veredito | **Integrar** (DARF) |
| confiança | Média |

#### DP-029 · Conferir o S-2299 e a guia rescisória do FGTS
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-05, I-08) |
| atualização_rodada_2 | Igual a DP-018 para a GFD rescisória; leiaute de importação de Remunerações para Fins Rescisórios v1.2 (03/10/2025) [R2-19] é arquivo para o portal, não API. |
| nível_automação | S-2299: **A** (I-05); GFD rescisória: **D** (I-08) |
| veredito | **Integrar** + checklist |
| confiança | Média |

#### DP-031 · Fazer o requerimento do seguro-desemprego
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | mantido da rodada 1 (não conferido): I-11 |
| nível_automação | **D** (I-11, status `[NÃO VERIFICADO]`) |
| veredito | Checklist; reavaliar quando confirmar se o eSocial já alimenta o benefício |
| confiança | Baixa |

#### DP-034 · Monitorar a data-base e o registro de novo instrumento coletivo
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | mantido da rodada 1 (não conferido): I-10 |
| nível_automação | **A** sem credencial se a consulta pública do Mediador puder ser lida (I-10, `[CP]`); senão **D** |
| veredito | **Construir** monitor (baixa frequência) |
| confiança | Baixa |

#### DP-038 · Monitorar pendências e divergências do eSocial da carteira
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-05, I-07) |
| nível_automação | **A** (I-05) + **A$** (DCTFWeb I-07 para divergência eSocial × DCTFWeb) |
| veredito | **Integrar** |
| confiança | Média |

#### DP-039 · Baixar e guardar os XMLs e recibos do eSocial
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-05) |
| atualização_rodada_2 | Conferido no manual v1.16: download por Id ou por recibo; **máximo 10 acessos/dia por empregador** somando identificadores + download, sem paralelismo, janela de 31 dias, dados até 1 h antes [R2-16]. Exige o empregador ou procurador com perfil de procuração para o grupo de eventos (erro 407). Rotina noturna precisa caber em 10 chamadas por cliente por dia. Confiança alta. |
| nível_automação | **A** (I-05 solicitação de download de eventos) [D4 T18] |
| credencial_exigida | e-CNPJ + procuração com perfil do grupo de eventos |
| limites_e_riscos | Cota diária de solicitações (valor diverge) |
| veredito | **Integrar** (rotina noturna) |
| confiança | Média |

#### DP-040 · Ler o DET de todos os clientes
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | parcialmente conferido na rodada 2 (parciais: I-09) |
| atualização_rodada_2 | API do DET: `[NÃO ENCONTRADO]` também na rodada 2. Ciência no dia da consulta do teor ou após 15 dias corridos (secundária). Veredito mantido. |
| nível_automação | **C-cert** (só listar) / **D** (I-09) |
| limites_e_riscos | Abrir pode dar ciência `[CP]`; ciência tácita 15 dias [D4 T2] |
| veredito | **Só checklist + lembrete** diário; robô de listagem C-cert como fase 2 com aprovação |
| confiança | Média |

#### DP-041 · Atender notificação ou fiscalização do trabalho
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | mantido da rodada 1 (não conferido): sem integração federal mapeada |
| nível_automação | **D** (resposta no DET); M1 rascunha |
| veredito | Checklist + rascunho |
| confiança | Média |

#### DP-042 · Controlar procurações e acessos ao eSocial, FGTS Digital e DET
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-13) |
| atualização_rodada_2 | Autorizações de Acesso da RFB exigem aceite do escritório em 30 dias [R2-23]; para o FGTS Digital o SPE tem manual v2.0 (11/08/2025) [R2-19]. |
| nível_automação | eSocial/RFB: **A$** leitura (I-13); FGTS SPE e DET: **D** |
| veredito | Checklist com validade |
| confiança | Média |

#### DP-043 · Acompanhar notas técnicas do eSocial e mudanças trabalhistas
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | mantido da rodada 1 (não conferido): I-26 |
| nível_automação | **A** (página pública de documentação técnica do eSocial, I-26) |
| veredito | **Construir** monitor |
| confiança | Média |

#### DP-044 · Informar e recolher valores de processo trabalhista
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-05) |
| nível_automação | Eventos S-2500/S-2501 via core e I-05 (**A**) `[CP]`; DARF via DCTFWeb (A$); FGTS de processo via FGTS Digital (**D**) [D4 T1] |
| veredito | Checklist + conferência |
| confiança | Baixa |

#### DP-046 · Receber atestados e encaminhar ao INSS
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | parcialmente conferido na rodada 2 (conferidos: I-05; parciais: I-25) |
| nível_automação | S-2230 pelo core/I-05 (A); requerimento ao INSS: **D** (I-25) |
| veredito | Checklist |
| confiança | Baixa |

#### DP-048 · Emitir a CAT no prazo
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-05) |
| nível_automação | **A** (S-2210 por I-05, em geral pelo core ou sistema de SST) |
| veredito | Checklist com prazo (1º dia útil) + conferência de recibo |
| confiança | Média |

#### DP-054 · Gerar e distribuir o informe de rendimentos
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-05, I-06) |
| nível_automação | Dados de I-05/I-06 (fim da DIRF [D4 T14]); geração no core |
| veredito | Distribuição pela plataforma |
| confiança | Baixa |

#### DP-057 · Corrigir dados de vínculos para o abono salarial (bases que substituíram RAIS/CAGED)
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | mantido da rodada 1 (não conferido): sem integração federal mapeada |
| nível_automação | Correção via eventos do eSocial (A, core) [D4 T22] |
| veredito | Checklist |
| confiança | Baixa |

#### DP-062 · Atender empregador doméstico e MEI com empregado
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | mantido da rodada 1 (não conferido): sem integração federal mapeada |
| nível_automação | eSocial Doméstico: portal web, sem webservice para o módulo simplificado `[CP]` → **C-crc/C-cert** ou **D** |
| veredito | Checklist |
| confiança | Baixa |

### 2.5 D5 · Contábil

#### CTB-014 · Controlar empréstimos, financiamentos e aplicações
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-21) |
| nível_automação | **A** (I-21 SGS: CDI, Selic, IPCA para conferência de rendimentos e encargos) |
| veredito | **Construir** |
| confiança | Média |

#### CTB-022 · Contabilizar parcelamentos e sua atualização
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-01, I-21) |
| atualização_rodada_2 | Extratos de parcelamento (PARC-PAEX, PARC-SIPADE em JSON/PDF) e consultas de parcelamento do Simples/MEI no Integra [R2-02]; Selic SGS testada [R2-28]. |
| nível_automação | **A$** (Integra Parcelamento, I-01 [D2 S4]) + **A** (Selic, I-21) |
| veredito | **Integrar** |
| confiança | Média |

#### CTB-023 · Contabilizar CBS e IBS e preparar o split payment
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-19) |
| nível_automação | I-19 (conferência); split payment: especificação técnica e APIs do recolhimento **`[NÃO ENCONTRADO]`** [D6 S6] |
| veredito | **Construir** quando houver especificação |
| confiança | Baixa |

#### CTB-030 · Calcular indicadores e emitir alertas
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-21) |
| atualização_rodada_2 | Endpoint SGS confirmado com a série 11 em 06/11/2026 [R2-28]. |
| nível_automação | Interno + **A** (I-21 índices de mercado; IBGE para dados setoriais `[CP]`) |
| veredito | **Construir** |
| confiança | Média |

#### CTB-034 · Controlar lucros mensais por sócio e a retenção de 10%
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-01) |
| nível_automação | Interno; DARF da retenção via I-01 (Sicalc/DCTFWeb `[CP]`); declaração da retenção em Reinf/DCTFWeb `[NÃO VERIFICADO]` (Lei 15.270/2025 [D5 T3]) |
| veredito | **Construir** controle + integrar DARF |
| confiança | Baixa |

#### CTB-035 · Projetar o IRPFM dos sócios
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | mantido da rodada 1 (não conferido): sem integração federal mapeada |
| nível_automação | Interno (M3); sem integração federal |
| veredito | **Construir** |
| confiança | Média |

#### CTB-041 · Acompanhar a ECD até o recibo
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | mantido da rodada 1 (não conferido): I-24 |
| nível_automação | **F** (I-24) |
| veredito | Checklist + recibo do core |
| confiança | Baixa |

#### CTB-042 · Acompanhar a ECF e conferir com a ECD
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | mantido da rodada 1 (não conferido): I-24 |
| nível_automação | **F** (I-24) |
| veredito | Checklist + conferência interna |
| confiança | Baixa |

#### CTB-043 · Retificar ou substituir ECD e ECF
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | mantido da rodada 1 (não conferido): sem integração federal mapeada |
| nível_automação | **F/D** |
| veredito | Checklist |
| confiança | Baixa |

#### CTB-049 · Declaração de Não Ocorrência ao COAF
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | mantido da rodada 1 (não conferido): sem integração federal mapeada |
| nível_automação | **D** (sistema do CFC, fora do V1) |
| veredito | Checklist com prazo anual |
| confiança | Baixa |

#### CTB-052 · Manter livro caixa e registrar livros quando não houver ECD
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | mantido da rodada 1 (não conferido): sem integração federal mapeada |
| nível_automação | Interno; sem integração federal |
| veredito | Construir/checklist |
| confiança | Baixa |

### 2.6 D6 · Consultoria e Reforma

#### CON-002 · Pesquisar a legislação e responder dúvida rápida
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | mantido da rodada 1 (não conferido): I-26 |
| nível_automação | **A** (I-26: Planalto, Sijut2, DOU) para ingestão no M1 |
| limites_e_riscos | Sijut2 sem API documentada `[CP]`: raspagem respeitosa de página pública |
| veredito | **Construir** (base do M1) |
| confiança | Baixa |

#### CON-006 · Formular e acompanhar consulta formal ao Fisco
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | parcialmente conferido na rodada 2 (parciais: I-25) |
| nível_automação | **D** (e-Processo, I-25); acompanhamento pela caixa postal (A$) |
| veredito | Checklist + rascunho |
| confiança | Baixa |

#### CON-008 · Planejamento tributário anual
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-19) |
| nível_automação | Interno (M3) + I-19 para CBS/IBS |
| veredito | **Construir** |
| confiança | Média |

#### CON-009 · Executar e comprovar a opção de regime
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | parcialmente conferido na rodada 2 (conferidos: I-01; parciais: I-18) |
| nível_automação | Simples: **D** (I-18); Presumido: opção pelo 1º DARF (I-01 Sicalc `[CP]`) |
| veredito | Checklist com comprovante |
| confiança | Média |

#### CON-013 · Acompanhar teses e decisões judiciais
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | mantido da rodada 1 (não conferido): sem integração federal mapeada |
| nível_automação | Fora do V1 (tribunais); pareceres da PGFN (listas de dispensa) são páginas públicas `[CP]` |
| veredito | Monitor de fontes |
| confiança | Baixa |

#### CON-016 · Simular CBS, IBS e IS por cliente, 2026–2033
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-19) |
| atualização_rodada_2 | Calculadora oficial confirmada: versão 1.6.2 / base V0066 de 28/10/2026; **versão offline em Docker ou JAR com APIs do Regime Regular, Split Payment Simplificado e Simples Nacional** [R2-27]. Rodar no servidor da plataforma; termos de uso `[NÃO ENCONTRADO]`. |
| nível_automação | **A** (I-19) como conferência + motor próprio |
| limites_e_riscos | Alíquota CBS 2027 ainda em definição (TCU 11,3%, Senado até 15/12) [D6 S17] |
| veredito | **Construir + integrar I-19** |
| confiança | Média |

#### CON-017 · Recomendar a opção semestral do "Simples por fora"
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-19) |
| nível_automação | M3 + I-19; registro da opção **D** |
| veredito | **Construir** |
| confiança | Média |

#### CON-018 · Analisar fornecedores e clientes quanto a crédito
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | parcialmente conferido na rodada 2 (parciais: I-04) |
| nível_automação | **A** (I-04: regime Simples/MEI dos parceiros) |
| veredito | **Construir** |
| confiança | Média |

#### CON-020 · Revisar cadastro de produtos e serviços (NCM, NBS, cClassTrib)
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | mantido da rodada 1 (não conferido): sem integração federal mapeada |
| nível_automação | **A** para tabelas (cClassTrib/NBS publicadas pela RFB/CGIBS `[CP]`; endereço não verificado) |
| veredito | **Construir** |
| confiança | Baixa |

#### CON-023 · Projetar o split payment no caixa
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | parcialmente conferido na rodada 2 (ver atualização) |
| atualização_rodada_2 | A calculadora offline inclui uma "API do Split Payment Simplificado" [R2-27]: avaliar como motor de projeção. |
| nível_automação | Interno; especificação técnica **`[NÃO ENCONTRADO]`** |
| veredito | **Construir** quando houver regra |
| confiança | Baixa |

#### CON-028 · Manter as tabelas de alíquotas e regras da reforma
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | parcialmente conferido na rodada 2 (conferidos: I-19; mantidos da rodada 1: I-26) |
| atualização_rodada_2 | O endpoint `/api/calculadora/dados-abertos/versao` informa a versão da base de regras (V0066, 28/10/2026) [R2-27]: usar como gatilho para revisar as tabelas internas. |
| nível_automação | **A** (I-19 se expuser tabelas; I-26) |
| veredito | **Construir** com versionamento |
| confiança | Baixa |

#### CON-032 · Conferir a apuração assistida da CBS
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | mantido da rodada 1 (não conferido): I-20 |
| nível_automação | **C-cert/D** (I-20; API `[NÃO ENCONTRADO]`) |
| veredito | Checklist; reavaliar em 2027 |
| confiança | Baixa |

#### CON-033 · Triar a carteira em busca de créditos a recuperar
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | mantido da rodada 1 (não conferido): sem integração federal mapeada |
| nível_automação | Interno (SPED/XML do core e D3) |
| veredito | **Construir** |
| confiança | Média |

#### CON-034 · Executar o projeto de recuperação
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | parcialmente conferido na rodada 2 (parciais: I-25) |
| nível_automação | Retificações por core; PER/DCOMP **D** (I-25) |
| veredito | Checklist + dossiê |
| confiança | Baixa |

#### CON-035 · Controlar créditos judiciais e limite mensal de compensação
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | mantido da rodada 1 (não conferido): sem integração federal mapeada |
| nível_automação | Interno (cálculo do limite, Lei 14.873/2024 [D6]); habilitação **D** |
| veredito | **Construir** controle |
| confiança | Baixa |

### 2.7 D7 · Gestão, Atendimento e Timesheet

#### GES-007 · Emitir a NFS-e dos honorários do próprio escritório
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-17) |
| nível_automação | **A** (I-17, emissão pela API da Sefin Nacional com o certificado do escritório `[CP]` sobre a emissão; ADN confirmado para distribuição [D3 S4]) se o município do escritório estiver no padrão nacional; senão **B** (V3) |
| credencial_exigida | e-CNPJ do escritório |
| preço | Gratuito (A) |
| veredito | **Integrar** |
| confiança | Média |

#### GES-008 · Conferir retenções na fonte sobre os honorários
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-06, I-17) |
| nível_automação | Interno; NFS-e tomadas pelos clientes via I-17; Reinf dos tomadores (I-06) não é acessível ao prestador `[CP]` |
| veredito | **Construir** |
| confiança | Baixa |

#### GES-010 · Repassar ou ratear custos variáveis por cliente (APIs)
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | parcialmente conferido na rodada 2 (conferidos: I-01, I-02; parciais: I-03) |
| atualização_rodada_2 | Bilhetagem oficial: tabela por faixa (Consulta, Emissão, Declaração) [R2-07]; no modelo A (plataforma contratante) o volume somado cai em faixas menores e o rateio por escritório/cliente vira obrigatório. Consulta CNPJ/CPF com tabela própria [R2-14, R2-15]. |
| nível_automação | Interno; precisa da bilhetagem por chamada de I-01/I-02/I-03 |
| veredito | **Construir** (log de chamadas por cliente desde o primeiro dia) |
| confiança | Média |

#### GES-025 · Responder perguntas de status com dados do sistema
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-01) |
| nível_automação | Interno; dados de I-01 (DAS emitido, pagamento confirmado) |
| veredito | **Construir** |
| confiança | Média |

#### GES-058 · Renovar os certificados do escritório e dos contadores
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | conferido na rodada 2 (I-01, I-05, I-06) |
| nível_automação | **A** (leitura da validade) + **D** |
| limites_e_riscos | e-CNPJ do escritório vencido derruba I-01, I-05, I-06 de toda a carteira: alerta crítico com 60/30/7 dias `[ESTIMATIVA]` |
| veredito | **Construir** |
| confiança | Média |

#### GES-061 · Cuidar das obrigações do próprio escritório ("cliente zero")
| Campo | Conteúdo |
| --- | --- |
| status_rodada_2 | mantido da rodada 1 (não conferido): sem integração federal mapeada |
| nível_automação | Os mesmos de D2/D4 aplicados ao CNPJ do escritório |
| veredito | **Construir** (o escritório é o primeiro cliente da plataforma) |
| confiança | Média |

---

## 3. O que não existe ou exige robô com credencial (C-cert, C-crc, C-captcha)

Com a premissa 3 (sem agente de desktop no plano principal), tudo o que está aqui fica em **D** (tarefa, checklist, lembrete, anexo pelo app) até haver motivo e parecer jurídico para um robô no servidor.

| Atividade (id) | Por quê | Nível | Credencial | Recomendação | Status |
| --- | --- | --- | --- | --- | --- |
| Emitir GFD do FGTS Digital (DP-018, DP-029, DP-044) | Sem API pública na documentação técnica oficial [R2-19, R2-20]; notícia cita API para "sistemas parceiros" [R2-21] | D (C-cert só com parecer) | e-CNPJ do escritório + procuração SPE | D: analista emite, plataforma lê o PDF e entrega pelo app; perguntar ao MTE pela API de parceiros | conferido na rodada 2 |
| Ler o DET (DP-040, DP-041) | API `[NÃO ENCONTRADO]` | D (C-cert só listar) | e-CNPJ + perfil de procurador | Nunca abrir sem aprovação (ciência) | parcialmente conferido na rodada 2 |
| Validar Autorizações de Acesso recebidas (SOC-011, SOC-012) | Ação do procurador no Portal de Serviços; prazo de 30 dias [R2-23] | D | gov.br prata/ouro ou certificado do escritório | Lembrete + conferência por Integra-Procurações | conferido na rodada 2 |
| Certidões CND conjunta, CRF, CNDT (FIS-036) | CAPTCHA `[CP]` | C-captcha / B | Nenhuma | Agregador (V3); SITFIS (A$) explica pendências | mantido da rodada 1 (não conferido) |
| Regularize/PGFN (FIS-034, FIS-035) | API `[NÃO ENCONTRADO]` (não rebuscado) | D | gov.br ou certificado + procuração | Checklist; monitor de editais | mantido da rodada 1 (não conferido) |
| PER/DCOMP, DIRBI, e-BEF (FIS-042, FIS-022, SOC-006) | Fora do catálogo do Integra em 15/10/2026 [R2-02] | D | Certificado + procuração | Checklist + rascunho pela IA | conferido na rodada 2 (ausência no catálogo) |
| ~~e-Processo (FIS-038)~~ | **Saiu da lista**: Integra-e-Processo [R2-02] | A$ | Procuração | Integrar | conferido na rodada 2 |
| Apuração assistida da CBS (CON-032) | API `[NÃO ENCONTRADO]` | D | Certificado | Reavaliar em 2027 | mantido da rodada 1 (não conferido) |
| Serviços que exigem o gov.br pessoal (SOC-014, partes de DP-062) | Sem delegação por API `[CP]` | C-crc | Login pessoal com 2FA | Nunca automático | mantido da rodada 1 (não conferido) |
| Qualificação Cadastral em lote (DP-004) | Portal com arquivo `[CP]` | D | Acesso ao eSocial | Consulta CPF SERPRO (R$ 0,6591 a R$ 0,017) se o volume justificar [R2-15] | parcialmente conferido na rodada 2 |
| SCE-IED (SOC-044), ECD/ECF (CTB-041/042) | Sistema web/PVA `[CP]` | D / F | Certificado | Recibo do core | mantido da rodada 1 (não conferido) |
| Seguro-desemprego (DP-031) | Status `[NÃO VERIFICADO]` | D | — | Checklist | mantido da rodada 1 (não conferido) |
| Leitura de e-CAC por robô para serviço que o Integra cobre | O Integra existe para substituir scraping [R2-08c] | Não fazer | — | Usar I-01 | conferido na rodada 2 |

Regra para a plataforma: toda execução em nível C ou que **dê ciência** (detalhe de mensagem da caixa postal, abrir DET) fica atrás de cartão de aprovação, registra a credencial usada (SOC-010) e quem autorizou; C-crc nunca roda sem o dono do login.

---

## 4. Lacunas e perguntas

### 4.1 Lacunas da rodada 1: o que fechou e o que segue aberto

| # | Lacuna (rodada 1) | Situação em 06/11/2026 |
| --- | --- | --- |
| 1 | Catálogo atual do Integra Contador | **Fechada** [R2-02] (ver I-01) |
| 2 | Tabela de preços oficial | **Fechada** [R2-07]; aberto: período das faixas (mensal?) e se Monitorar/Apoiar são grátis |
| 3 | Modelo de credencial para software house | **Fechada na parte técnica** (termo de autorização, token, cache) [R2-04, R2-05, R2-06]; **aberta** a leitura do contrato-padrão (cláusulas de uso para terceiros, repasse de custo) |
| 4 | Leitura da caixa postal marca ciência? | **Fechada: sim, o detalhe da mensagem dá ciência** [R2-08] |
| 5 | FGTS Digital: API? | **Fechada para API pública (não há)** [R2-19]; aberta a "API para sistemas parceiros" [R2-21] |
| 6 | DET: API? | Aberta (`[NÃO ENCONTRADO]`; manual não abriu) |
| 7 | Calculadora de Tributos | **Fechada** para endereço, versão e offline [R2-27]; aberta: termos de uso e especificação OpenAPI |
| 8 | NFS-e: URLs, municípios | **Fechada** [R2-24, R2-26]; aberta: significado de "AderenteEmissorNacional = Sim" nas capitais e limite de requisições |
| 9 | Autorizações de Acesso | **Fechada** para nome, aceite, 30 dias [R2-22, R2-23]; aberta: norma, limite por CPF, validade máxima, e se a mensagem de erro do Integra já reflete o sistema novo |
| 10 | EFD-Reinf | **Fechada** [R2-18] |
| 11 | Consulta CNPJ/CPF SERPRO | **Fechada para preço** [R2-14, R2-15]; aberta: conteúdo de cada tipo e termos de uso para terceiros |
| 12 | Regularize/PGFN sem API | Aberta (não rebuscado) |
| 13 | Split payment e apuração assistida | Aberta (a calculadora offline tem API de "Split Payment Simplificado" [R2-27]) |
| 14 | Prazos de ciência tácita | Parcial: art. 23, § 2º, III, do Decreto 70.235/1972 citado pela própria documentação do Integra [R2-08]; 45 dias do DTE-SN não relidos |
| 15 | DIRBI | Fora do Integra [R2-02]; situação no e-CAC não relida |
| 16 | BCB SGS e IBGE | SGS **fechado** para a série 11 [R2-28]; IBGE aberto (host recusado na sessão) |
| novo | Dados abertos do CNPJ | Endereço antigo dá 404; **novo endereço `[NÃO ENCONTRADO]`** |
| novo | Termo assinado pelo próprio contribuinte com o A1 do cofre (modelo D de I-01) | Hipótese do V1 a confirmar com o SERPRO |

### 4.2 Perguntas ao SERPRO (comercial e técnico)

1. As faixas da tabela do Integra Contador são por mês? A faixa é por tipo (Consulta, Emissão, Declaração) separadamente? Os serviços "Monitorar" (eventos de atualização) e "Apoiar" (AUTENTICAPROCURADOR) são cobrados? O indicador de novas mensagens da caixa postal é cobrado como Consulta (como diz a loja) ou é Monitorar (como diz o catálogo)?
2. Pode uma plataforma ser **contratante única** para vários escritórios, cada um assinando o Termo de Autorização? Há cláusula contratual sobre isso, sobre repasse do custo e sobre LGPD (o termo já cita os arts. 7º e 11)? Há desconto por volume ou contrato de parceiro para software house?
3. Qual a vigência máxima aceita no campo `vigencia` do termo? O mesmo XML assinado pode ser reenviado diariamente até a vigência?
4. O próprio contribuinte pode assinar o termo com o seu e-CNPJ (A1 guardado pela plataforma) e ser o "autor do pedido de dados", sem procuração ao escritório?
5. O Integra já valida contra o sistema novo de **Autorizações de Acesso** (com aceite do procurador)? Que código de erro aparece quando a autorização está "Em Análise"?
6. Existe ambiente de demonstração (a documentação tem "Demonstração" e "Cenários de demonstração") e quais são as cotas por segundo e o SLA?
7. Há previsão de serviços para opção semestral IBS/CBS do Simples, DIRBI, PER/DCOMP, e-BEF e dívida ativa da PGFN?

### 4.3 Perguntas à RFB, ao MTE, ao CGNFS-e e à Caixa

1. RFB: norma do sistema Autorizações de Acesso, limite de autorizações por outorgado e validade máxima.
2. RFB: novo endereço do repositório de dados abertos do CNPJ.
3. RFB: termos de uso e licença da Calculadora de Tributos (versão offline em servidor de terceiros, uso comercial).
4. MTE: o FGTS Digital tem API para "sistemas parceiros" (citada em aviso de jul/2026)? Como um software de escritório se habilita (acordo de cooperação técnica?) e há API para o DET?
5. CGNFS-e: o campo "AderenteEmissorNacional" nas capitais significa uso exclusivo do Emissor Nacional? Qual o limite de requisições no ADN? Há prazo para o acesso por procuração pedido pela FENACON?

### 4.4 Perguntas aos contadores do escritório-piloto

1. Quantas chamadas por mês por cliente (DAS, PGDAS, caixa postal, situação fiscal, pagamentos)? Com a tabela oficial, um cliente do Simples custa ~R$ 1,92 a R$ 2,56/mês na faixa 1 (estimativa em I-01).
2. Quem no escritório vai **validar as Autorizações de Acesso** em até 30 dias e quem aprova a abertura de mensagens que dão ciência?
3. O e-CNPJ do escritório é A1 ou A3? (Com o termo de vigência longa, A3 basta para o Integra `[INFERÊNCIA]`.)
4. O escritório é filiado ao Sescon do seu estado? (Possível convênio com o SERPRO, como o do Sescon-PA.)

---

## 5. Contatos e próximos passos com fornecedores/órgãos

| Órgão / fornecedor | Canal oficial conferido (06/11/2026) | Para quê | Próximo passo | Dono sugerido |
| --- | --- | --- | --- | --- |
| **SERPRO – Integra Contador (comercial)** | Página do produto e "Quero contratar": https://loja.serpro.gov.br/integracontador · Central de Ajuda: https://centraldeajuda.serpro.gov.br/duvidas/pt/ · atendimento online da loja: https://serpro-atendimento.dialoga.serpro.gov.br/livechat | Perguntas 4.2-1 a 4.2-4 e 4.2-7; contrato-padrão; desconto para software house | 1) Ler o contrato no fluxo de compra (exige e-CNPJ; não assinar sem decisão); 2) pedir por escrito a posição sobre contratante único + termo por escritório e sobre termo assinado pelo contribuinte; 3) decidir modelo A ou B (I-01) | Fundador |
| **SERPRO – Integra Contador (técnico)** | "Como pedir ajuda" da documentação (formulário de acionamento; ter o CNPJ contratante) e Área do Cliente https://cliente.serpro.gov.br (chaves, consumo, 2ª via) [R2-29] | Perguntas 4.2-5 e 4.2-6; testes | Depois de contratar: usar os "Cenários de demonstração" (AUTENTICAPROCURADOR, CAIXAPOSTAL, PGDASD etc.) para a prova de conceito: termo → token → lista de mensagens → DAS | Engenharia |
| **SERPRO – Consulta CNPJ / CPF** | https://loja.serpro.gov.br/consultacnpj · https://loja.serpro.gov.br/consultacpf | Só se dados abertos/agregador não bastarem | Decidir após achar o novo endereço dos dados abertos do CNPJ | Engenharia |
| **Sescon do estado do escritório-piloto** | `[NÃO VERIFICADO]` (modelo: notícia SERPRO/Sescon-PA [R2-10]) | Convênio com condições diferenciadas | Perguntar ao sindicato se há convênio ou interesse | Escritório-piloto |
| **Receita Federal** | Notícia e Guia do Usuário de Autorizações de Acesso [R2-22, R2-23]; Fale Conosco da RFB `[NÃO VERIFICADO nesta rodada]` | 4.3-1 a 4.3-3 | Montar no app o guia do cliente para conceder a autorização (com a lista de serviços do Integra que a plataforma usa) e o lembrete de validação de 30 dias para o escritório | Produto |
| **Comitê Gestor da NFS-e (CGNFS-e)** | Canais de Atendimento: https://www.gov.br/nfse/pt-br/canais-de-atendimento · APIs: https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/apis-prod-restrita-e-producao | 4.3-5 | Prova de conceito em produção restrita com o A1 de um cliente piloto (`/DFe/{NSU}`); acompanhar a nova planilha de adesões | Engenharia |
| **FENACON** | `[NÃO VERIFICADO nesta rodada]` | Acompanhar o pedido de acesso por procuração ao ADN | Monitorar notícias; não depender disso (premissa 1) | Fundador |
| **eSocial / EFD-Reinf** | Documentação técnica do eSocial https://www.gov.br/esocial/pt-br/documentacao-tecnica · manual Reinf v2.8 [R2-18] | Sem contato necessário (APIs abertas e documentadas) | PoC de download do eSocial respeitando 10 acessos/dia; consulta de recibo da Reinf | Engenharia |
| **MTE – FGTS Digital e DET** | Página "Manual e Documentação Técnica" do FGTS Digital [R2-19]; página de Acordos de Cooperação Técnica do MTE: https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/acordos-de-cooperacao-tecnica (link visto na página, conteúdo não lido) | 4.3-4 | Pedido formal (Fala.BR ou ouvidoria `[NÃO VERIFICADO]`) sobre a API de parceiros do FGTS Digital e do DET; até lá, D | Fundador |
| **RFB – Calculadora de Tributos** | https://piloto-cbs.tributos.gov.br/servico/calculadora-consumo/ (seção offline) | 4.3-3 | Baixar o pacote offline (Docker) em ambiente de teste e checar a licença que vem no pacote antes de usar em produção | Engenharia |
| **Banco Central (SGS)** | https://api.bcb.gov.br (sem cadastro) | — | Usar direto | Engenharia |
| **IBGE** | `servicodados.ibge.gov.br` (não abriu na sessão) | Códigos de município e CNAE | Testar fora da sessão; reserva: anexo de municípios da NFS-e [R2-24b] | Engenharia |

**Ordem sugerida (próximas 4 semanas):** (1) SERPRO comercial: contrato e modelo A/B; (2) PoC Integra (termo, caixa postal só lista, DAS, SITFIS) e PoC ADN com A1 de um cliente; (3) guia de Autorizações de Acesso no app do cliente + lembrete de 30 dias ao escritório; (4) PoC download do eSocial; (5) Calculadora offline; (6) pedidos formais ao MTE e à RFB.

---

## 6. Fontes

### 6.1 Abertas nesta rodada (06/11/2026)

- [R2-01] SERPRO, Integra Contador, Introdução (atualizada em 19/02/2026): https://apicenter.estaleiro.serpro.gov.br/documentacao/api-integra-contador/
- [R2-02] SERPRO, Catálogo de Serviços do Integra Contador (atualizado em 15/10/2026): https://apicenter.estaleiro.serpro.gov.br/documentacao/api-integra-contador/pt/catalogo_de_servicos/
- [R2-03] SERPRO, Como contratar (19/02/2026): https://apicenter.estaleiro.serpro.gov.br/documentacao/api-integra-contador/pt/como_contratar/
- [R2-04] SERPRO, Autentica Procurador (19/02/2026): https://apicenter.estaleiro.serpro.gov.br/documentacao/api-integra-contador/pt/solucoes/integra-contador-gerenciador/autenticaprocurador/
- [R2-05] SERPRO, Cache do Termo de Autorização (10/04/2026): https://apicenter.estaleiro.serpro.gov.br/documentacao/api-integra-contador/pt/solucoes/integra-contador-gerenciador/autenticaprocurador/cache/
- [R2-06] SERPRO, Padrões Técnicos de Assinatura do XML / modelo do Termo de Autorização (10/04/2026): https://apicenter.estaleiro.serpro.gov.br/documentacao/api-integra-contador/pt/solucoes/integra-contador-gerenciador/autenticaprocurador/padroes_tecnicos_assinatura_xml/
- [R2-07] Loja SERPRO, Integra Contador, tabela de preços e lista de funcionalidades por tipo (dados do produto em https://loja.serpro.gov.br/ccstore/v1/products/integracontador; página: https://loja.serpro.gov.br/integracontador)
- [R2-08] SERPRO, Caixa Postal, "Obter Detalhes de uma Mensagem Específica" (31/08/2026): https://apicenter.estaleiro.serpro.gov.br/documentacao/api-integra-contador/pt/solucoes/integra-caixapostal/caixapostal/servicos/obter_detalhes_de_uma_mensagem_especifica/
- [R2-08b] SERPRO, Caixa Postal, "Obter Lista de Mensagens por Contribuintes": https://apicenter.estaleiro.serpro.gov.br/documentacao/api-integra-contador/pt/solucoes/integra-caixapostal/caixapostal/servicos/obter_lista_de_mensagens_por_contribuintes/
- [R2-08c] SERPRO, Caixa Postal, Introdução (19/10/2026): https://apicenter.estaleiro.serpro.gov.br/documentacao/api-integra-contador/pt/solucoes/integra-caixapostal/caixapostal/
- [R2-09] SERPRO, notícia Integra Contador e CCMEI (2024; "44 serviços", monitoração de eventos gratuita): https://www.serpro.gov.br/menu/noticias/noticias-2024/integra-contador-emissao-automatizada-ccmei
- [R2-10] SERPRO, notícia Sescon-PA contrata Integra Contador (2025; "118 serviços"): https://www.serpro.gov.br/menu/noticias/noticias-2025/sescon-pa-contrata-integra-contador
- [R2-11] Alterdata/Prosoft, C1725 contratação e procuração (exemplo de R$ 0,80 por PGDAS): https://ajuda.alterdata.com.br/prosoftcontabil/c1725-simples-nacional-serpro-integra-contador-contratacao-e-procuracao-220178525.html
- [R2-12] SERPRO, Eventos de Atualização (25/02/2026) e Limites: https://apicenter.estaleiro.serpro.gov.br/documentacao/api-integra-contador/pt/solucoes/integra-contador-gerenciador/eventosatualizacao/ · https://apicenter.estaleiro.serpro.gov.br/documentacao/api-integra-contador/pt/solucoes/integra-contador-gerenciador/eventosatualizacao/limites/
- [R2-13] Omie, Como contratar o Integra Contador (credenciais ligadas a um CNPJ): https://ajuda.omie.com.br/pt-BR/articles/9749470-como-contratar-o-servico-integra-contador
- [R2-14] Loja SERPRO, Consulta CNPJ, tabela de preços: https://loja.serpro.gov.br/consultacnpj (dados: https://loja.serpro.gov.br/ccstore/v1/products/consultacnpj)
- [R2-15] Loja SERPRO, Consulta CPF, tabela de preços: https://loja.serpro.gov.br/consultacpf (dados: https://loja.serpro.gov.br/ccstore/v1/products/consultacpf)
- [R2-16] eSocial, Manual de Orientação do Desenvolvedor v1.16 (ago/2026): https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/996775-manualorientacaodesenvolvedoresocialv1-16.pdf
- [R2-17] eSocial, Documentação técnica (leiautes S-1.3, NT 07/2026 rev. 20/10/2026): https://www.gov.br/esocial/pt-br/documentacao-tecnica
- [R2-18] SPED/RFB, EFD-Reinf, Manual de Orientação do Desenvolvedor v2.8 (ago/2026): https://www.gov.br/sped/pt-br/assuntos/escrituracoes-digitais/efd-reinf/manuais-e-documentos-tecnicos/manualorientacaodesenvolvedor-reinf-v2-8.pdf/@@display-file/file
- [R2-19] MTE, FGTS Digital, Manual e Documentação Técnica: https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/fgtsdigital/manual-e-documentacao-tecnica
- [R2-20] MTE, Manual do FGTS Digital v1.70 (12/06/2026): https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/fgtsdigital/manual-e-documentacao-tecnica/manual-de-orientacao-do-fgts-digital-versao-1-70-12-06-2026.pdf
- [R2-21] Jornal Contábil, manutenção do FGTS Digital (31/07/2026; cita módulo de API; secundária): https://jornalcontabil.com.br/noticia/sistema-do-fgts-digital-ficara-indisponivel-neste-fim-de-semana/
- [R2-22] RFB, "Está no ar a Nova Versão do Sistema de Procurações Eletrônicas" (dez/2025; página atualizada em 28/10/2026): https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2025/dezembro/esta-no-ar-a-nova-versao-do-sistema-de-procuracoes-eletronicas
- [R2-23] RFB, Autorizações de Acesso (antiga Procuração Digital), Guia do Usuário (PDF, 12 p.): https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/passo-a-passo/autorizacoes-de-acesso-guia-do-usuario
- [R2-24] Portal NFS-e, APIs – Prod. Restrita e Produção (atualizada em 20/08/2026): https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/apis-prod-restrita-e-producao
- [R2-24b] Portal NFS-e, Documentação Atual (Produção): https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/documentacao-atual
- [R2-25] Portal NFS-e, Manual dos Contribuintes – APIs do ADN v1.0 (12/02/2026): https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/documentacao-atual/manual-contribuintes-apis-adn-sistema-nacional-nfse.pdf
- [R2-26] Portal NFS-e, Monitoramento das Adesões, planilha de municípios aderentes (28/09/2026): https://www.gov.br/nfse/pt-br/municipios/monitoramento-adesoes/municipios-aderentes-20260928.xlsx
- [R2-27] RFB, Calculadora de Tributos (aplicação, seção offline e endpoint de versão): https://piloto-cbs.tributos.gov.br/servico/calculadora-consumo/ · https://piloto-cbs.tributos.gov.br/servico/calculadora-consumo/api/calculadora/dados-abertos/versao
- [R2-28] BCB, API SGS, série 11: https://api.bcb.gov.br/dados/serie/bcdata.sgs.11/dados/ultimos/2?formato=json
- [R2-29] SERPRO, Integra Contador, Suporte / Como pedir ajuda: https://apicenter.estaleiro.serpro.gov.br/documentacao/api-integra-contador/pt/suporte/

Vistas só pelo resumo do buscador nesta rodada (não abertas): notícias secundárias sobre Autorizações de Acesso (portalspedbrasil, FENACON, Jornal Contábil, dez/2025); pacote não oficial `rfbcalc` (PyPI); Tecnospeed sobre EFD-Reinf; notícias sobre o DET (Portaria MTE 3.869/2023); notícia Fazenda sobre o primeiro CNPJ alfanumérico (31/07/2026).

### 6.2 Fontes da rodada 1 mantidas (acessadas via fichas D em 05/11/2026, não reabertas)

- SERPRO, novas funcionalidades DCTFWeb/MIT (2025): https://serpro.gov.br/menu/noticias/noticias-2025/integra-contador-novas-funcionalidades [D2 S3]
- SERPRO, Integra Parcelamento (2024): https://www.serpro.gov.br/menu/noticias/noticias-2024/integra-parcelamento [D2 S4]
- Jornal Contábil, 27 serviços (2022): https://jornalcontabil.com.br/noticia/integra-contador-oferece-27-servicos-e-ficara-apta-a-partir-de-outubro/ [D2 S1]
- Pacote não oficial do Integra: https://github.com/MarlonSantosDev/serpro_integra_contador_api [D2 S3-b] (superado pelo catálogo oficial)
- Alterdata, revenda (R$ 0,75/DAS, 2025): https://ajuda.alterdata.com.br/fiscalbase/simples-nacional-api-serpro-integra-contador-206051349.html [D2 S5]
- Fórum Contábeis, tarifas (set/2025): https://www.contabeis.com.br/forum/tributos-federais/410290/modulo-integra-contador-tarifas/ [D2 S6] (superado pela tabela oficial)
- NetCPA, Integra Contador e Integra Procurações: https://netcpa.com.br/noticias/rfb-plataforma-integra-contador-de-prestacao-de-servicos-contabeis-e-fiscais/13342 [D1 F3]
- CFC, e-CAC e anti-robô (2021): https://cfc.org.br/noticias/em-reuniao-com-a-rfb-cfc-e-fenacon-buscam-solucoes-para-funcionamento-melhor-do-e-cac/ [D2 S7]
- RFB, roteiro da opção pelo Simples 2027: https://www8.receita.fazenda.gov.br/SimplesNacional/Arquivos/manual/Roteiro%20da%20op%C3%A7%C3%A3o%20pelo%20Simles%20Nacional%20para%20o%20ano%20de%202027.pdf [D2 S14]
- RFB, DARF da DCTFWeb: https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/declaracoes-e-demonstrativos/DCTFWeb/notas-orientativas/arquivos/instrucoes-emissao-darf-dctfweb-vencimento-prorrogado.pdf [D4 T27]
- gov.br/nfse, NT 007: https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/rtc/nt-007-se-cgnfse-v1-0.pdf [D3 S6]
- eSocial, manual do desenvolvedor v1.7 (2018): https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/manualorientacaodesenvolvedoresocialv1-7.pdf [D4 T18] (superado pela v1.16)
- MTE, nota de contingência FGTS Digital 05/2026: https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/fgtsdigital/manual-e-documentacao-tecnica/sei_8572427_nota-orientativa-para-situacao-de-contingencia-05-2026.pdf [D4 T1]
- FGTS Digital, procuração (SPE): https://www.contabeis.com.br/noticias/60985/fgts-digital-libera-sistema-de-procuracao-eletronica/ [D4 T25]
- MTE, manual do Sistema Mediador: https://www.gov.br/trabalho-e-emprego/pt-br/pdfs/manual-do-sistema-mediador-srt-digital.pdf [D4 T10]
- DET (secundária): https://www.contabeis.com.br/noticias/65493/det-o-que-e-e-quem-precisa-se-cadastrar/ [D4 T2]
- Calculadora de Tributos (secundárias): https://www.machadomeyer.com.br/pt/inteligencia-juridica/publicacoes-ij/tributario-ij/rfb-libera-ferramenta-de-calculo-da-reforma-tributaria-para-toda-a-sociedade · https://www.reformatributaria.com/tecnologia/receita-federal-libera-ferramenta-oficial-de-calculo-da-reforma-tributaria-sobre-o-consumo/ [D6 S5]
- Apuração assistida da CBS: https://www.fiemg.com.br/wp-content/uploads/2026/02/IE_18_RFB-teste-CBS-contribuintes.pdf [D6 S16]
- PGFN, Edital 6/2026: https://www.mayerbrown.com/pt/insights/publications/2026/06/notice-no-6-2026-pgfn-publishes-notice-on-tax-settlement-for-the-regularization-of-outstanding-debts [D2 S27]

---

## Rodada 3 (6/11/2026): fichas do ciclo de vida

Agente V1, rodada 3 (refeita depois da interrupção; esta versão substitui a anterior, que estava incompleta). Escopo: as 73 fichas novas do ciclo de vida (entrada, transição entre contabilidades, desligamento), filtradas para as que dependem do domínio federal. **40 fichas tratadas**: 28 da primeira passada, revistas, e 12 acrescentadas nesta (SOC-104, FIS-108, NFE-106, DP-105, DP-106, CON-101, GES-104, CIC-005, CIC-008, CIC-009, CIC-010 e o trecho federal de NFE-105). As demais (minutas internas, cobrança, Junta, Sefaz, prefeituras, conselhos, Open Finance, NF-e estadual) ficaram fora por não dependerem de integração federal.

### R3.0 Método

- Páginas oficiais baixadas com `curl` em 06/11/2026 para o scratchpad e lidas como texto (PDF com `pdftotext`). Conteúdo baixado tratado como dado.
- **Buscas usadas:** 7 na primeira passada e **10 na refeita** (cota da refeita: 18).
- **Reabertos na refeita (06/11/2026):** catálogo do Integra (rodapé "15 de outubro de 2026", 119 serviços, sem mudança), tabela de preços da Loja SERPRO do Integra (Consulta R$ 0,24, Emissão R$ 0,32, Declaração R$ 0,40 na faixa 1), tabela da Consulta CNPJ na loja (QSA R$ 0,8683 na faixa 01) e o MOS S-1.3 consolidado até a NO 12/2026 (eventos S-1000, S-1005, S-1010 e S-2200).
- **Tentados sem sucesso:** texto consolidado da IN RFB 2.003/2021 no portal Normas (o portal virou aplicação JavaScript e a API devolve 403), Lei 11.101/2005 no Planalto (servidor não respondeu) e a página gov.br "Encerramento de CNPJ de MEI falecido" (CAPTCHA). As afirmações que dependiam deles continuam `[NÃO VERIFICADO na fonte oficial]`.
- Reaproveitado da rodada 2 sem reabrir: manual do desenvolvedor do eSocial v1.16 [R2-16] e da EFD-Reinf v2.8 [R2-18]. **Reabertos nesta rodada:** catálogo do Integra (15/10/2026) e a tabela de preços da Loja SERPRO (os valores conferem com I-01).
- Confiança **alta** só quando a fonte oficial foi aberta nesta rodada; `[INFERÊNCIA]` marca uma conclusão do V1 a partir de fonte oficial; `[NÃO VERIFICADO]`, uma afirmação sem fonte.

### R3.1 Fatos novos que afetam várias fichas

1. **Integra-Redesim / PNRCONTADOR** (em produção desde 02/12/2025) [R3-03]: o profissional ou a empresa contábil **consulta os próprios vínculos de contabilista** nos CNPJ dos clientes, **solicita renúncia de vínculo**, acompanha a situação da renúncia e emite o comprovante. Só vale para os próprios clientes ("não sendo possível o acesso aos vínculos de terceiros"). Limites: 50 registros por página e 200 requisições simultâneas (HTTP 429). Não exige procuração [R3-05]. Na loja, "Solicitar Renúncia de Vínculo" fica em **Geração de declarações** (R$ 0,40 na faixa 1), "Emitir Comprovante" em Emissão e as consultas em Consulta [R3-02]. Na entrada, o escritório novo confirma que já é o contador do CNPJ. Na saída, o escritório renuncia ao vínculo por API.
2. **Integra-Procurações / OBTERPROCURACAO41** [R3-04]: devolve as procurações entre **um outorgante e um procurador informados** (os dois CPF/CNPJ são obrigatórios), com a lista de sistemas e a data de expiração. **Não lista todos os procuradores** de um cliente: para saber se o contador anterior ainda tem acesso, é preciso saber o CPF/CNPJ dele. O exemplo oficial traz sistemas como "Declarações - DIRPF" e "Meu Imposto de Renda". Não exige procuração [R3-05]. Se o serviço já reflete o sistema novo de Autorizações de Acesso: `[NÃO VERIFICADO]`. A documentação ainda fala em "procuração eletrônica".
3. **Autorizações de Acesso (RFB), cancelamento** [R3-06]: "A Autorização de Acesso pode ser cancelada a qualquer momento, **tanto por quem concedeu (outorgante), quanto por quem recebeu (procurador/outorgado)**", nas abas Concedidas/Recebidas. Acesso pelo Portal de Serviços com conta **gov.br prata ou ouro**. Consequência: na saída, **o próprio escritório pode cancelar** a autorização que recebeu, sem depender do cliente. Na entrada, o cliente vê na aba Concedidas quem ainda tem autorização e cancela ali.
4. **FGTS Digital / SPE** [R3-07]: o SPE permite "aditar, **revogar**, alterar, **renunciar**". Os outorgados só usam o mandato **com certificado digital**, e pessoa jurídica outorgada **só com e-CNPJ**. **Procurações do e-CAC não valem no FGTS Digital.** O DET envia para o mesmo SPE [R3-08]. API: nenhuma (I-08 se mantém).
5. **DEFIS por API aceita situação especial** [R3-09]: o objeto `situacaoEspecial` tem os tipos 1 Cisão parcial, 2 Cisão total, **3 Extinção**, 4 Fusão e 5 Incorporação.
6. **MIT (DCTFWeb) por API aceita sem movimento e eventos especiais** [R3-10]: o campo `SemMovimento` é obrigatório. `ListaEventosEspeciais` aceita até 5 eventos: **1 Extinção**, 2 Fusão, 3 Cisão Total, 4 Cisão Parcial, 5 Incorporação (incorporada), 6 Incorporação (incorporadora). Na loja, o MIT não aparece na lista de "Geração de declarações", que só traz PGDAS-D, DCTFWeb, DEFIS e renúncia PNR. O tipo de cobrança do encerramento do MIT ficou `[NÃO ENCONTRADO]`.
7. **DASN-SIMEI por API ainda não está disponível**: a página do serviço diz "A FUNCIONALIDADE AINDA NÃO ESTÁ DISPONÍVEL PARA CONTRATAÇÃO E PODE SOFRER ALTERAÇÕES" (versão inicial de 22/12/2025, sem data de implantação no catálogo). Os dados de entrada não trazem campo de situação especial, mas o retorno prevê os tipos "3) Original com Situação Especial" e "4) Retificadora com Situação Especial" [R3-11]. **A DASN-SIMEI continua no portal.**
8. **Integra-e-Processo**: "Consultar Processos por Interessado" está em produção desde 10/11/2025 e devolve número, tipo, subtipo, situação, localização e último encaminhamento de **todos os processos do contribuinte**. Exige a procuração **00051 – Processos Digitais (e-Processo)**. Lista de documentos, documento e "Comunicados e Intimações" estão no catálogo **sem data** [R3-01, R3-05, R3-12].
9. **eSocial e baixa do CNPJ** (MOS S-1.3, consolidado até a NO S-1.3 12/2026, publicado em 21/10/2026) [R3-13]: "**Não há necessidade de ser informada ao eSocial a baixa do CNPJ.** Mas, em caso de o declarante optar por prestar essa informação, deve primeiro encerrar todas as suas tabelas e, na sequência, enviar o evento S-1000, com o grupo de informações relativas à alteração, com a data fim de validade". O MOS **não traz procedimento de troca de software ou de contador** (busca no texto por "software", "troca de" e "transmissor").
10. **ReceitanetBX tem um modo "serviço" com API local** (Manual – Serviço ReceitanetBX v1.0, nov/2020) [R3-14]: instalador Linux e Windows, roda como serviço do sistema operacional e oferece uma API (web service) com "Pesquisar Arquivos, Solicitar Arquivos, Situação dos Pedidos, Consultar Pedidos". O certificado ICP-Brasil é o "emitido para o CNPJ do usuário do serviço". O download é permitido a "contribuintes, representantes legais de empresas, procuradores autorizados por procuração eletrônica". O endereço do instalador aparece como "Aguardando Homologação" no manual, e a documentação própria da API não foi encontrada: disponibilidade atual e alcance para a ECF `[NÃO VERIFICADO]`. **Atualização da refeita:** o serviço é exclusivo para entidades conveniadas (item 19).
11. **Res. CFC 1.590/2020, texto oficial** [R3-15]: art. 2º (conteúdo mínimo do contrato, incluindo "l) cláusula rescisória com a fixação de prazo de prévio aviso"); art. 3º (carta de responsabilidade anual); art. 6º (distrato obrigatório; "Na impossibilidade da celebração do distrato, o profissional ... deverá notificar o cliente"); art. 7º (o distrato traz a responsabilidade do contratante de receber os documentos); art. 8º ("O profissional rescindente deverá comunicar ao novo responsável técnico ... sobre fatos de que deva tomar conhecimento"); art. 9º (forma e prazo de devolução no distrato; demonstrações do período ficam com o rescindente, salvo distrato); art. 10 (acessórias de competência dentro da vigência ficam com o rescindente, ainda que vençam depois, salvo contrato). **A resolução não trata de procurações, acessos ou vínculos em portais.**
12. **Res. CFC 1.721/2024, texto oficial** [R3-16]: trata da PLD/FTP. O art. 3º exige cadastro do contratante PF (nome, CPF, documento, PEP e endereço, inclusive eletrônico) e PJ (incluindo beneficiário final "quando possível").
13. **FGTS Digital: inventariante e administrador judicial** (Nota Orientativa FGTS Digital nº 06/2024) [R3-17]: para **empregador pessoa física falecido**, inventariante, curador e administrador nomeado judicialmente, o acesso é pedido por protocolo digital no MTE ("Cadastro de Administrador / Inventariante / Curador junto ao FGTS Digital"), com certidão de óbito no caso de inventariante. A análise leva até 7 dias corridos. O acesso vale **12 meses** (inventário sem partilha) ou **2 meses** (com partilha, prazo para o herdeiro transferir o empregado no eSocial).
14. **Regularize (PGFN)** [R3-18]: o acesso PJ é feito por CNPJ e senha, certificado digital ou, desde setembro de 2026, conta gov.br prata/ouro do responsável perante a RFB. API para contador: `[NÃO ENCONTRADO]` (1 busca; só portal).
15. **Preços do Integra conferidos de novo** (Loja SERPRO, API pública do produto, 06/11/2026) [R3-02]: Consulta R$ 0,24 · Emissão R$ 0,32 · Declaração R$ 0,40 na faixa 1, iguais a I-01.
16. **DCTFWeb sem movimento não se renova todo ano** (Perguntas e Respostas da DCTFWeb, set/2025, itens 5.10, 5.13 e 5.21) [R3-21]: "Como na DCTFWeb sem movimento não há obrigatoriedade de renovação anual", a inativa que já tem uma DCTFWeb sem movimento válida (a última entregue foi sem movimento) não reenvia em janeiro. Quem não tem entrega uma vez: no início da obrigatoriedade, no mês em que deixou de ter movimento ou no início da atividade. O MIT sem movimento **não é obrigatório**, mas serve para transmitir a DCTFWeb sem movimento sem enviar eSocial ou Reinf sem movimento. **Na extinção**, o MIT só é preenchido quando há tributo a informar; quem já tem DCTFWeb sem movimento válida e continua sem movimento no mês da extinção não precisa entregar a DCTFWeb desse mês.
17. **Opção pelo Simples para 2027** (Res. CGSN 194/2026, DOU de 28/09/2026, que altera a Res. CGSN 186/2026) [R3-22]: opção de 01/09 a **15/10/2026**; cancelamento irretratável de 03/11 a 20/12/2026; pendências de indeferimento regularizáveis até 30/10/2026. A opção pelo regime regular de IBS/CBS (jan–jun/2027) vai de 01/09 a **30/10/2026**. As regras gerais não valem para empresa em início de atividade inscrita no CNPJ de **16/10 a 31/12/2026** (Simples) ou de **31/10 a 31/12/2026** (IBS/CBS). A redação do art. 3º dada pela 194 não diz como essas empresas optam (o texto do art. 3º foi abreviado com "..." na publicação): `[NÃO VERIFICADO]` na fonte oficial; fontes secundárias falam em opção no ato da inscrição.
18. **LCDPR** (página do LCDPR na RFB, atualizada em 30/04/2024, e Perguntas e Respostas) [R3-23]: entrega anual até o fim do prazo da DIRPF, salvo espólio e saída definitiva; **transmissão no e-CAC, serviço "Meu Imposto de Renda", com certificado ICP-Brasil**. O limite de obrigatoriedade é o do art. 23-A da IN SRF 83/2001, apurado por produtor somando todas as unidades rurais. O valor de R$ 4,8 milhões não aparece no texto aberto; só nas fontes secundárias e no resumo da busca `[NÃO VERIFICADO na fonte oficial]`. Não há API.
19. **ReceitanetBX-Serviços é exclusivo para entidades conveniadas** (notícia da Fenacon de 10/04/2026, "Fonte: Receita Federal") [R3-24]: a versão 1.9.26 do ReceitanetBX desktop corrige falhas de download para usuários externos; o "ReceitanetBX-Serviços, que é exclusivo para entidades conveniadas", também foi atualizado. Isso derruba a hipótese, levantada na primeira passada, de usar a API local do serviço (item 10) num escritório comum. Fonte secundária que cita a RFB: confiança média.
20. **Ordem dos eventos iniciais do eSocial** (MOS S-1.3, reaberto) [R3-13]: o S-1000 "é o primeiro evento que deve ser transmitido pelo declarante. Nenhum outro evento pode ser enviado antes deste". O S-1005 vem "antes do evento S-2200 e dos eventos S-1200, S-1202 ou S-1207". O S-1010 vem antes dos eventos de remuneração e antes do S-2299 e do S-2399. O S-2200 de empregado vai "até o dia imediatamente anterior ao do início da prestação dos serviços", e o eSocial passa a recebê-lo **30 dias antes** da admissão. O S-2200 também se usa na transferência dentro do grupo econômico e na sucessão, fusão ou incorporação.
21. **MEI de titular falecido** [R3-26]: a RFB publica o formulário "Requerimento Para Alteração/Baixa de CNPJ MEI – Titular Falecido" (certidão de óbito, documento do parente ou cônjuge e procuração, se houver), usado quando a baixa automática não acontece. A baixa automática a partir da comunicação do cartório e a retroação à data do óbito vêm do resumo da busca e de fontes antigas (a página gov.br pediu CAPTCHA) `[NÃO VERIFICADO na fonte oficial]`.
22. **Consulta CNPJ SERPRO, preços reabertos** (Loja SERPRO, 06/11/2026) [R3-25]: faixa 01 (1 a 999 consultas): Básica R$ 0,6591, **QSA R$ 0,8683**, Empresa R$ 1,1717. Conferem com I-02.
23. **Integra Contador não tem opção nem exclusão do Simples, desenquadramento do MEI nem consulta de CNPJ** (catálogo de 15/10/2026, reaberto) [R3-01]. No Integra-MEI só existem PGMEI, CCMEI e DASN-SIMEI (esta ainda sem data de produção). O REGIMEAPURACAO trata só do regime de caixa ou competência do Simples.

### R3.2 Verificação por ficha

Os níveis seguem a tabela 2.3 do protocolo. "Correção" aparece só quando algo muda em relação à ficha.

#### D1 · Clientes e Societário

**SOC-101 · Manter a biblioteca de modelos e minutas**

| Campo | Verificação |
| --- | --- |
| Nível | **Próprio** (confirmado) |
| Integração | Assinatura eletrônica por fornecedor (B; fora do domínio V1) |
| Credencial · Preço | Nenhuma federal · n/a |
| Base legal conferida | Res. CFC 1.590/2020, art. 2º (13 itens mínimos do contrato, de "a" a "m"), arts. 6º, 7º e 9º (conteúdo do distrato: responsabilidade de receber os documentos, forma e prazo de devolução) [R3-15]. Ajuste de redação: a resolução fixa o **conteúdo mínimo do contrato** (art. 2º) e **cláusulas obrigatórias do distrato** (arts. 7º e 9º), sem uma lista "mínima" de distrato |
| Confiança | Alta (texto oficial) |

**SOC-102 · Diagnóstico societário e de legalização na entrada (parte federal)**

| Campo | Verificação |
| --- | --- |
| Nível | **D-assistido** (confirmado; o ato final é na Junta) |
| Integração federal | QSA e CNAE: **Consulta CNPJ SERPRO (A$)**, tipo QSA, R$ 0,8683 por consulta na faixa 01 (I-02), como alternativa oficial ao "CNPJ por B"; dados abertos do CNPJ (A, defasado; endereço atual `[NÃO ENCONTRADO]` em I-04). e-BEF: sem API (I-25) |
| Correção | Integração do CNPJ: "B" → "A$ (Consulta CNPJ SERPRO) ou B (agregador)" |
| Confiança | Alta para o preço (loja reaberta em 06/11/2026, faixa 01 QSA R$ 0,8683 [R3-25]); a parte da Junta é do V2 |

**SOC-103 · Trocar vínculos e acessos herdados do contador anterior**

| Campo | Verificação |
| --- | --- |
| Nível | **D-assistido** (confirmado: a revogação continua sendo ato do cliente, ou do próprio anterior, no portal) |
| Integração | (a) Autorizações de Acesso RFB: o cliente vê e cancela na aba **Concedidas** (gov.br prata/ouro), sem API de cancelamento [R3-06]. (b) Conferência: **OBTERPROCURACAO41 (A$, Consulta)**, informando o CNPJ do cliente e o CPF/CNPJ do anterior [R3-04]. (c) Contador responsável no CNPJ: **PNRCONTADOR CONSVINCULOS261 (A$)** confirma que o escritório novo já aparece como contabilista; o anterior pode renunciar pelo SOLICRENUNCIA262 [R3-03]. (d) FGTS Digital e DET: o empregador revoga no SPE, ou o anterior renuncia; procuração do e-CAC não vale lá [R3-07]. (e) Sefaz, prefeitura e CADESP: fora do domínio V1 |
| Credencial | Cliente: gov.br prata/ouro ou certificado. Escritório: contrato Integra (I-01) e Termo de Autorização |
| Preço | Consulta R$ 0,24 por par cliente × anterior (faixa 1) [R3-02] |
| Correção | "C-cert ou Integra Contador (a confirmar)" → **"Integra Contador: OBTERPROCURACAO41 (exige o CPF/CNPJ do anterior) + PNRCONTADOR; sem C-cert"**. A base "Res. CFC 1.590/2020 arts. 6º a 9º" não trata de acessos em portais: vale como dever geral de transição (art. 8º), não como regra de revogação [R3-15] |
| Limite | OBTERPROCURACAO não descobre procuradores desconhecidos. A varredura completa é a tela Concedidas, vista pelo cliente |
| Confiança | Alta (catálogo, documentação do serviço e guia RFB lidos nesta rodada) |

**SOC-104 · Combinar a transição com o contador anterior** (acrescentada na refeita)

| Campo | Verificação |
| --- | --- |
| Nível | **Próprio** (confirmado) |
| Integração federal (opcional) | Na data de corte, o agente confirma a troca: **PNRCONTADOR CONSVINCULOS261 (A$)** mostra se o escritório novo já é o contabilista do CNPJ (só os próprios vínculos são visíveis) [R3-03], e **OBTERPROCURACAO41 (A$)** mostra se o anterior ainda tem procuração, informando o CPF/CNPJ dele [R3-04]. Nenhuma das duas exige procuração do cliente [R3-05] |
| Credencial · Preço | Contrato Integra + e-CNPJ do escritório · Consulta R$ 0,24 cada (faixa 1) [R3-02] |
| Base conferida | Res. CFC 1.590/2020, art. 2º, "l" (aviso prévio), art. 8º (comunicar fatos ao sucessor), art. 9º (demonstrações do período) e art. 10 (acessórias de competência na vigência, salvo contrato) [R3-15] |
| Correção | "Nenhuma externa" → "Nenhuma obrigatória; conferência opcional por PNRCONTADOR e OBTERPROCURACAO (A$)" |
| Confiança | Alta |

**SOC-106 · Tratar o pedido de rescisão**

| Campo | Verificação |
| --- | --- |
| Nível | **Próprio** (confirmado) |
| Base conferida | Art. 2º, "l" (cláusula rescisória com prazo de aviso prévio) e art. 6º, parágrafo único (notificação quando o distrato for impossível) [R3-15]. Precisão: o distrato é **obrigatório** (art. 6º, caput); a notificação só substitui o distrato quando ele for impossível |
| Confiança | Alta |

**SOC-107 · Fechar as responsabilidades de saída com o sucessor**

| Campo | Verificação |
| --- | --- |
| Nível | **Próprio** (confirmado) |
| Integração federal (acréscimo) | Na saída, o escritório **renuncia ao vínculo de contabilista** pelo PNRCONTADOR SOLICRENUNCIA262 (A$, Declaração R$ 0,40) e emite o comprovante (Emissão R$ 0,32) [R3-02, R3-03]. Também **cancela a autorização recebida** no sistema de Autorizações de Acesso, ato do procurador, sem API [R3-06] |
| Base conferida | Res. CFC 1.590/2020, arts. 7º a 10 [R3-15]: art. 8º (comunicar ao novo responsável), art. 9º, parágrafo único (demonstrações do período), art. 10 (acessórias de competência ocorrida na vigência) |
| Correção | Acrescentar a integração "PNRCONTADOR (A$) para renúncia do vínculo" |
| Confiança | Alta |

**SOC-110 · Avaliar baixa ou inatividade e acompanhar a empresa inativa (parte federal)**

| Campo | Verificação |
| --- | --- |
| Nível | **Próprio** (confirmado) |
| Integração federal | Manutenção da inativa: DCTFWeb sem movimento pelo **MIT por API (A$)**, com campo `SemMovimento` [R3-10]; DEFIS por API, onde o campo de inatividade só vale para ano-calendário anterior a 2025 [R3-09]; vigilância do CNPJ por Eventos de Atualização (grátis) e Consulta CNPJ (A$) |
| Regra resolvida | A DCTFWeb sem movimento **não se renova todo ano**: entrega-se uma vez (no mês em que o movimento parou) e a dispensa vale até voltar a haver fato gerador. A inativa com DCTFWeb sem movimento válida não reenvia em janeiro [R3-21, itens 5.10 e 5.13]. O agente vigia só o retorno do movimento |
| Correção | Acrescentar "MIT sem movimento por Integra (A$, Declaração R$ 0,40), **uma vez**", e não como rotina anual |
| Confiança | Alta (Perguntas e Respostas oficiais da DCTFWeb, set/2025) |

#### D2 · Fiscal e Obrigações

**FIS-101 · Levantar o perfil fiscal de entrada**

| Campo | Verificação |
| --- | --- |
| Nível | **Próprio** (confirmado) |
| Integração | Federal: Consulta CNPJ (A$), REGIMEAPURACAO CONSULTAROPCAOREGIME103 e CONSULTARANOSCALENDARIOS102 (A$, procuração 00060), PGDAS-D e DEFIS consultas (A$, procuração 00146), DTE CONSULTASITUACAODTE111 (A$, procuração 00050) [R3-01, R3-05] |
| Correção | "consultas cadastrais federais (A)" → **(A$)**: os serviços oficiais que dão o perfil são pagos (Integra e Consulta CNPJ). Só os dados abertos do CNPJ são A |
| Preço | Consulta R$ 0,24 cada (faixa 1) [R3-02] |
| Confiança | Alta |

**FIS-102 · Competência de corte:** fora do domínio (sem integração federal). A base conferida, Res. CFC 1.590/2020 art. 10, sustenta a regra [R3-15].

**FIS-103 · Conferir o histórico fiscal herdado: declarado × apurado × pago**

| Campo | Verificação |
| --- | --- |
| Nível | **A$** (correção: era A) |
| Integração | PGDAS-D CONSDECLARACAO13, CONSDECREC15 e CONSEXTRATO16; DCTFWeb CONSRECIBO32, CONSDECCOMPLETA33 e CONSXMLDECLARACAO38; MIT CONSAPURACAO316 e LISTAAPURACOES317; DEFIS consultas; PAGTOWEB PAGAMENTOS71; SITFIS 91/92; SICALC CONSOLIDAR54 (acréscimos sem emitir DARF, desde 15/10/2026) [R3-01]. EFD-Reinf: consulta de recibo por API REST gratuita (A) [R2-18]. **Fora do Integra:** ECD, ECF, EFD-Contribuições, DIRBI e PER/DCOMP, que vêm por F (arquivos do core ou do anterior) ou CTB-102 |
| Credencial | Contrato Integra + procurações 00146 (PGDAS-D/DEFIS), 00103 (DCTFWeb), 00004 (pagamentos) e 00002 (SITFIS) [R3-05] |
| Preço (estimativa V1) | Diagnóstico de 5 anos de um Simples: ~60 consultas de declaração + ~5 de pagamento + SITFIS (2 Emissões) ≈ 65 × R$ 0,24 + 2 × R$ 0,32 ≈ **R$ 16,24 por cliente, uma vez** (faixa 1, sem desconto) `[INFERÊNCIA a partir de R3-02]` |
| Correção | Nível A → **A$**; "a confirmar por serviço" → lista acima |
| Confiança | Alta para serviços e preço unitário; média para a estimativa |

**FIS-104 · Inventariar créditos, saldos credores e pedidos herdados**

| Campo | Verificação |
| --- | --- |
| Nível | **F** (confirmado como principal) |
| Integração federal | PER/DCOMP: **fora do catálogo do Integra** [R3-01]; consulta pelo PER/DCOMP Web no e-CAC (C-cert desaconselhado, I-14) ou D-assistido. Processos de restituição e ressarcimento que viraram processo digital: **e-Processo CONSPROCPORINTER271 (A$)**, procuração 00051 [R3-12] |
| Correção | Acrescentar "e-Processo (A$) para processos; PER/DCOMP sem API (D-assistido)" |
| Confiança | Alta para a ausência no catálogo; média para o resto |

**FIS-105 · Inventariar parcelamentos, transações, processos e intimações herdados**

| Campo | Verificação |
| --- | --- |
| Nível | **A$** (correção: era A; o Integra é pago) |
| Integração | Simples e MEI: PARCSN, PARCSN-ESP, PERTSN, RELPSN, PARCMEI, PARCMEI-ESP, PERTMEI, RELPMEI (pedidos, parcelamento, parcelas, pagamentos; produção desde 11/11/2024). PAEX e SIPADE: extratos **sem data de implantação**. Processos: e-Processo (A$). Intimações: Caixa Postal (A$; ler o detalhe dá ciência, I-01). Panorama: SITFIS (A$) [R3-01]. **Sem API:** parcelamentos ordinários da RFB fora do Simples, PGFN (Regularize, por CNPJ e senha, certificado ou gov.br [R3-18]) e transações, que ficam em C-cert com o A1 do cliente ou D-assistido |
| Credencial | Procurações 00076/00188 (PARCSN), 00125, 00149/10011, 00209/10035 e outras por modalidade; 00051 (e-Processo); 00006 (Caixa Postal) [R3-05] |
| Preço | Consulta R$ 0,24; DAS de parcela = Emissão R$ 0,32 [R3-02] |
| Correção | A → **A$**; "C-cert para estaduais e municipais" → acrescentar **PGFN e parcelamentos RFB não-Simples por C-cert/D-assistido** |
| Confiança | Alta |

**FIS-106 · Regularizar obrigações omitidas herdadas**

| Campo | Verificação |
| --- | --- |
| Nível | **D-assistido** (mantido para o conjunto, que inclui obrigações estaduais e municipais e ECD/ECF) |
| Integração federal | Transmissão por API (A$): PGDAS-D TRANSDECLARACAO11, DEFIS TRANSDECLARACAO141, DCTFWeb TRANSDECLARACAO310 e MIT ENCAPURACAO314; EFD-Reinf por webservice (A). **DASN-SIMEI ainda não contratável por API** [R3-11]. ECD e ECF pelo core (F). MAED: retorno da DASN-SIMEI e serviços MAED da DCTFWeb (3.6 e 3.7) **sem data de implantação** [R3-01] |
| Preço | Declaração R$ 0,40 cada (faixa 1) [R3-02] |
| Correção | Acrescentar DEFIS, MIT e Reinf ao que tem API; marcar DASN-SIMEI como portal |
| Confiança | Alta |

**FIS-107 · Habilitar o cliente nos ambientes fiscais eletrônicos (parte federal)**

| Campo | Verificação |
| --- | --- |
| Nível | **D-assistido** (confirmado) |
| Integração federal | Conferir a procuração do escritório: OBTERPROCURACAO41 (A$). Adesão ao DTE: CONSULTASITUACAODTE111 (A$). O escritório **valida a autorização em até 30 dias** (ato no portal, gov.br prata/ouro) [R3-06]. Contador no CNPJ: PNRCONTADOR CONSVINCULOS261 (A$). FGTS Digital: procuração própria no SPE, e-CNPJ obrigatório para PJ [R3-07] |
| Correção | "verificação federal por A" → **A$** |
| Preço | Consulta R$ 0,24 por verificação |
| Confiança | Alta |

**FIS-108 · Montar e entregar o dossiê fiscal ao novo contador** (acrescentada na refeita)

| Campo | Verificação |
| --- | --- |
| Nível | **Próprio** (confirmado) |
| Integração federal (para completar o dossiê) | Recibos e declarações: PGDAS-D CONSDECREC15, DCTFWeb CONSRECIBO32 e CONSDECCOMPLETA33, DEFIS CONSDECREC144 (Consulta). Comprovantes de pagamento: PAGTOWEB COMPARRECADACAO72 (Emissão). Retrato final: SITFIS RELATORIOSITFIS92 (Emissão). Parcelamentos do Simples e MEI e processos (e-Processo) [R3-01]. Procurações 00146, 00103, 00004, 00002 e 00051 [R3-05]. Tudo isso **antes** de o escritório cancelar a autorização e renunciar ao vínculo (FIS-109): depois, perde o acesso |
| Preço | Consulta R$ 0,24 · Emissão R$ 0,32 (faixa 1) [R3-02] |
| Base conferida | Res. CFC 1.590/2020, arts. 6º a 10; o art. 11 diz que descumprir a resolução é infração ao Código de Ética Profissional do Contador [R3-15] |
| Correção | Acrescentar "complemento por Integra (A$), antes do encerramento dos acessos" |
| Confiança | Alta |

**FIS-109 · Encerrar acessos, automações e consumos fiscais do ex-cliente**

| Campo | Verificação |
| --- | --- |
| Nível | **Próprio** (confirmado) |
| Integração | O escritório **cancela ele mesmo** a autorização recebida (aba Recebidas) [R3-06], **renuncia no SPE** do FGTS Digital com e-CNPJ [R3-07] e **renuncia ao vínculo de contabilista por API** (PNRCONTADOR, A$) [R3-03]. Parar EVENTOSATUALIZACAO e consultas pagas é interno |
| Correção | Base legal "IN RFB 1.751/2017 (procuração cancelada só pelo e-CAC)" está **desatualizada**: desde a nova versão (dez/2025) o cancelamento é feito no sistema Autorizações de Acesso do Portal de Serviços, pelo outorgante ou pelo procurador [R3-06]. "Revogações em portais (D-assistido)" passa a ser, na parte federal, ato do próprio escritório (cancelar e renunciar), mais a renúncia PNR por API |
| Preço | Renúncia PNR R$ 0,40 + comprovante R$ 0,32 [R3-02] |
| Confiança | Alta |

**FIS-110 · Obrigações fiscais de encerramento na baixa**

| Campo | Verificação |
| --- | --- |
| Nível | **D-assistido** (mantido para o conjunto; a parte federal é quase toda A$/A) |
| Integração federal | **DEFIS de situação especial (Extinção) por API (A$)** [R3-09]; **DCTFWeb e MIT com evento especial "Extinção" por API (A$)** [R3-10]; PGDAS-D e DAS (A$); EFD-Reinf R-1000 por webservice (A) [R2-18]; **DASN-SIMEI de situação especial: portal**, porque a API não está disponível [R3-11]; obrigações estaduais e municipais: portais (V2) |
| Correção | "Portais (DEFIS, DASN-SIMEI, Reinf, estaduais)" → **DEFIS e Reinf saem de "portais"**: DEFIS pelo Integra (A$), Reinf por webservice (A). Ficam no portal a DASN-SIMEI e as estaduais e municipais |
| Regra da DCTFWeb na extinção | O MIT com evento especial só é preenchido **se houver tributo a informar** no mês da extinção. Sem apuração, basta a DCTFWeb gerada pelo eSocial ou Reinf. Quem já tem DCTFWeb sem movimento válida e segue sem movimento **não entrega** a DCTFWeb do mês da extinção [R3-21, item 5.21] |
| Preço | Declaração R$ 0,40 (DEFIS, DCTFWeb, PGDAS-D); DAS = Emissão R$ 0,32 [R3-02] |
| Confiança | Alta para DEFIS, MIT e DASN-SIMEI; prazos da Res. CGSN 140/2018 não reabertos |

#### D3 · Notas fiscais

**NFE-101 · Janela de 90 dias e acervo histórico (parte NFS-e Nacional)**

| Campo | Verificação |
| --- | --- |
| Nível | **A** (confirmado para a captura) |
| Integração | ADN, `GET /DFe/{NSU}` e `GET /NFSe/{ChaveAcesso}/Eventos`, com certificado do **mesmo CNPJ raiz** do contribuinte (A1 do cliente) [R3-19] |
| Correção | "ADN só para 90 dias": **o manual do ADN (v1.0, 12/02/2026) não traz limite temporal** [R3-19]. O limite de 90 dias é da distribuição de NF-e e CT-e (NT 2014.002, fora do domínio V1). Para NFS-e Nacional, o alcance histórico do NSU é `[NÃO VERIFICADO]` e deve ser testado em produção restrita |
| Credencial · Preço | A1 do cliente · grátis |
| Confiança | Alta para métodos e credencial; baixa para o alcance histórico |

**NFE-105 · Desligar a captura e a guarda de XMLs do ex-cliente (parte NFS-e Nacional)** (acrescentada na refeita)

| Campo | Verificação |
| --- | --- |
| Nível | **Próprio** (confirmado) |
| Integração federal | Parar as chamadas ao ADN (`GET /DFe/{NSU}`) feitas com o A1 do ex-cliente e apagar o certificado do coletor; é ato interno, sem pedido ao ADN [R3-19]. O autXML da NF-e é estadual (V2) |
| Confiança | Alta |

**NFE-106 · Fechar o acervo de documentos fiscais na baixa (parte NFS-e Nacional)** (acrescentada na refeita)

| Campo | Verificação |
| --- | --- |
| Nível | **D-assistido** (mantido para o conjunto; inutilização e MDF-e são da Sefaz, V2) |
| Integração federal | NFS-e Nacional: captura pelo ADN (A, grátis) com o A1 do mesmo CNPJ raiz enquanto o certificado valer [R3-19]. O manual do ADN não fala em CNPJ baixado: se o ADN continua aceitando o A1 de CNPJ baixado é `[NÃO VERIFICADO]` (testar em produção restrita) |
| Credencial · Preço | A1 do cliente · grátis |
| Confiança | Média |

#### D4 · Trabalhista e DP

**DP-102 · Diagnóstico trabalhista inicial**

| Campo | Verificação |
| --- | --- |
| Nível | **A** (mantido para o núcleo: download do eSocial) |
| Integração | eSocial, solicitação de download e consulta de identificadores (A): **no máximo 10 acessos por dia por empregador**, janela de 31 dias e perfil de procuração eletrônica para o tipo de evento [R2-16]. FGTS em aberto: **FGTS Digital sem API** (C-cert ou D-assistido) [R3-07]. CRF (Caixa): a primeira página da consulta, aberta nesta rodada, não mostra CAPTCHA, mas as telas seguintes não foram testadas. CNDT (TST): página inicial aberta, emissão não testada; os dois seguem `[NÃO VERIFICADO]` quanto a CAPTCHA |
| Limite | Com 10 acessos/dia e janela de 31 dias, baixar 5 anos de eventos leva vários dias por cliente `[INFERÊNCIA a partir de R2-16]` |
| Correção | Acrescentar "FGTS Digital sem API" |
| Confiança | Alta para eSocial e FGTS; baixa para CRF e CNDT |

**DP-104 · Assumir o eSocial e a folha a partir de uma competência de corte**

| Campo | Verificação |
| --- | --- |
| Nível | **F** (confirmado) |
| Integração | Download eSocial (A, limites acima) [R2-16]; importação no core (F) |
| Correção | A etapa "reenviar as tabelas S-1000 a S-1020 com fim de validade no sistema anterior" **não tem apoio no MOS S-1.3**, que não traz procedimento de troca de software ou de contador. As tabelas são do declarante e se ajustam pelos grupos [alteracao] e [inclusao] [R3-13] `[INFERÊNCIA; confirmar com o fornecedor do core]`. Base Res. CFC 1.590/2020 art. 10 conferida [R3-15] |
| Confiança | Alta (MOS e CFC lidos) |

**DP-105 · Preparar o empregador novo antes da primeira admissão** (acrescentada na refeita)

| Campo | Verificação |
| --- | --- |
| Nível | **Próprio** (confirmado; a transmissão sai do core ou do webservice do eSocial) |
| Integração | eSocial por webservice (A, grátis) [R2-16], se a plataforma transmitir em vez do core. **Ordem oficial** [R3-13]: S-1000 primeiro ("Nenhum outro evento pode ser enviado antes deste"); S-1005 antes do S-2200 e dos S-1200/S-1202/S-1207; S-1010 antes dos eventos de remuneração e do S-2299/S-2399; **S-2200 até o dia anterior ao início do trabalho**, recebido a partir de **30 dias antes** da admissão. Procurações: eSocial pela Autorização de Acesso da RFB (o cliente concede e o escritório **valida em até 30 dias**, ou ela cai) [R3-06]; **FGTS Digital e DET por procuração própria no SPE**, PJ outorgada só com e-CNPJ, procuração do e-CAC não vale lá [R3-07, R3-08]. Sem API para criar procurações |
| Credencial | e-CNPJ do escritório (procurador) ou certificado do cliente |
| Preço | Grátis (eSocial, SPE) |
| Base conferida | Ordem dos eventos e prazo do S-2200: MOS S-1.3 [R3-13]. NR-1/NR-7: fora do domínio V1 |
| Correção | "Tabelas enviadas pelo core (B ou F)" → acrescentar "ou eSocial por webservice (A)" e "procurações em três lugares: RFB (eSocial), SPE (FGTS Digital e DET)"; a base "ordem dos eventos" deixa de ser genérica |
| Confiança | Alta |

**DP-106 · Entregar o acervo do DP ao novo contador e fechar a última competência** (acrescentada na refeita)

| Campo | Verificação |
| --- | --- |
| Nível | **Próprio** (confirmado) |
| Integração federal (opcional) | O download do eSocial (A, até 10 acessos por dia por empregador, janela de 31 dias) completa o pacote de XMLs se o core não guardou tudo [R2-16]. FGTS Digital sem API: guias e extratos pelo portal [R3-07]. Depois da última competência, encerrar os acessos (DP-107) |
| Base conferida | Res. CFC 1.590/2020, arts. 6º a 10 [R3-15] |
| Confiança | Alta |

**DP-107 · Revogar procurações e acessos trabalhistas na saída**

| Campo | Verificação |
| --- | --- |
| Nível | **D-assistido** (confirmado; não há API) |
| Integração | FGTS Digital e DET: SPE com "revogar" (empregador) e **"renunciar" (outorgado)**; PJ outorgada só com e-CNPJ [R3-07, R3-08]. eSocial: procuração RFB, cancelável pelo próprio procurador nas Autorizações de Acesso [R3-06] |
| Correção | "ato final do cliente" → **o escritório também pode encerrar sozinho** (renúncia no SPE e cancelamento na RFB). Base "Manual do SPE v1.1" → versão vigente **v2.0 (11/08/2025)**, citada na página oficial; o texto do SPE não foi aberto, e o fato vem do manual do FGTS Digital v1.70 |
| Credencial | e-CNPJ do escritório (SPE); gov.br prata/ouro ou certificado (RFB) |
| Confiança | Alta |

**DP-108 · Encerrar o DP na baixa**

| Campo | Verificação |
| --- | --- |
| Nível | **F** (confirmado) |
| Correção | O MOS S-1.3 diz que **não é preciso informar a baixa do CNPJ ao eSocial**. Se o declarante optar por informar, primeiro encerra todas as tabelas e depois envia o S-1000 de alteração com data fim de validade [R3-13]. O "S-1000/S-1005 de encerramento" passa de obrigatório a **opcional**, e a ordem oficial fica resolvida. Efeito no FGTS Digital e no DET após a baixa: `[NÃO VERIFICADO]` |
| Confiança | Alta para o eSocial |

#### D5 · Contábil

**CTB-102 · Recuperar ECD, ECF e livros transmitidos**

| Campo | Verificação |
| --- | --- |
| Nível | **C-cert** (mantido) |
| Integração | ReceitanetBX desktop (versão 1.9.26, abril/2026, com correções de download para usuários externos) [R3-24]. Existe também o **"Serviço ReceitanetBX"**, que roda no servidor e expõe uma **API local** (Pesquisar e Solicitar Arquivos, Situação e Consulta de Pedidos) [R3-14]. Porém o **ReceitanetBX-Serviços é "exclusivo para entidades conveniadas"** [R3-24], então não serve a um escritório comum. A ficha **não sobe para A** |
| Credencial | Certificado ICP-Brasil. Download por contribuinte, representante legal ou **procurador por procuração eletrônica** [R3-14]: A1 do cliente ou e-CNPJ do escritório com procuração |
| Preço | Grátis (programa da RFB); o custo é operar o robô |
| Pendência | O alcance para a ECF não aparece no manual (fontes secundárias relatam download da ECF) `[NÃO VERIFICADO]` |
| Correção | Na primeira passada foi sugerido "Serviço ReceitanetBX com API local (possível A)". **Retirado**: o serviço é restrito a conveniados. Fica C-cert (robô no desktop) com D-assistido como alternativa |
| Confiança | Média (a restrição vem de notícia da Fenacon que cita a RFB) |

**CTB-105 · Dividir ECD, ECF e demonstrações do ano da troca**

| Campo | Verificação |
| --- | --- |
| Nível | **Próprio** (confirmado) |
| Base conferida | Res. CFC 1.590/2020, art. 3º (carta de responsabilidade anual), art. 9º, parágrafo único (demonstrações do período com o rescindente, salvo distrato) e art. 10 [R3-15]. IN RFB 2.003/2021, art. 5º: não reaberta |
| Confiança | Alta para a CFC |

**CTB-110 · Encerrar a contabilidade na baixa**

| Campo | Verificação |
| --- | --- |
| Nível | **Próprio** (confirmado); transmissão F pelo core |
| Base | Prazos de ECD na extinção (evento de janeiro a maio: último dia útil de junho; de junho a dezembro: último dia útil do mês seguinte) aparecem em fonte secundária, na redação da IN RFB 2.082/2022 que alterou a IN 2.003. O texto consolidado oficial não foi aberto: na refeita, o portal Normas da RFB devolveu só a casca JavaScript, e a API respondeu 403 `[NÃO VERIFICADO na fonte oficial]`. Uma fonte secundária diz que a IN RFB 2.142/2023 mudou a redação do § 3º do art. 5º; isso também precisa ser conferido. Integração federal correlata: DEFIS e MIT de extinção por API (ver FIS-110), com a regra do item 5.21 das Perguntas e Respostas da DCTFWeb [R3-21] |
| Confiança | Média |

#### D6 · Consultoria

**CON-101 · Diagnóstico tributário de entrada** (acrescentada na refeita)

| Campo | Verificação |
| --- | --- |
| Nível | **Próprio** (confirmado) |
| Integração | Além dos arquivos recebidos (F), o declarado e o pago federais vêm do Integra (A$), com o mesmo conjunto de FIS-103: PGDAS-D, DEFIS, DCTFWeb, MIT, PAGTOWEB e SITFIS [R3-01]. ECD, ECF, EFD-Contribuições e PER/DCOMP ficam fora do Integra (F ou CTB-102) |
| Credencial | Contrato Integra + procurações 00146, 00103, 00004 e 00002 [R3-05] |
| Preço | ≈ R$ 16 por cliente, uma vez, para 5 anos de um Simples (estimativa de FIS-103) `[INFERÊNCIA a partir de R3-02]`. Se FIS-103 já rodou, custo zero (reuso) |
| Correção | "Arquivos SPED/PGDAS recebidos pelo app (F)" → "F + Integra (A$) para declarado × pago federal" |
| Confiança | Alta |

**CON-102 · Inventariar a herança consultiva**

| Campo | Verificação |
| --- | --- |
| Nível | **D-assistido** (mantido: PER/DCOMP e consultas formais seguem sem API) |
| Integração | **Processos: Integra-e-Processo CONSPROCPORINTER271 (A$)**, em produção desde 10/11/2025, com todos os processos do contribuinte e a situação de cada um [R3-12]; procuração 00051 [R3-05]. PER/DCOMP: sem API [R3-01] |
| Correção | "e-CAC (processos e PER/DCOMP) sem API verificada" → **processos com API (A$); só PER/DCOMP sem API** |
| Preço | Consulta R$ 0,24 por cliente [R3-02] |
| Confiança | Alta |

**CON-103 · Planejar regime e enquadramento antes da inscrição**

| Campo | Verificação |
| --- | --- |
| Nível | **Próprio** (confirmado) |
| Base conferida | Res. CGSN 194/2026 (DOU de 28/09/2026) [R3-22]: opção pelo Simples para 2027 de 01/09 a **15/10/2026** (e não 30/10, como dizia a primeira passada; 30/10 é o prazo da opção de IBS/CBS no regime regular e o da regularização de pendências); cancelamento de 03/11 a 20/12/2026. Empresa em início de atividade inscrita no CNPJ de **16/10 a 31/12/2026** fica fora da janela geral do Simples, e de **31/10 a 31/12/2026** fora da janela de IBS/CBS. Como essas empresas optam (no ato da inscrição, segundo fontes secundárias) está nos parágrafos da Res. 186 que a 194 não reproduziu `[NÃO VERIFICADO]` |
| Integração | Nenhuma API: opção pelo Simples e pelo IBS/CBS **não estão no catálogo do Integra** [R3-01]. Ato no Portal do Simples ou na inscrição (D-assistido no momento da abertura) |
| Correção | Datas: 15/10/2026 para a opção geral do Simples; 30/10/2026 para o IBS/CBS |
| Confiança | Alta para as datas (texto do DOU); média para a forma de opção do início de atividade |

**CON-106 · Planejar a tributação do encerramento**

| Campo | Verificação |
| --- | --- |
| Nível | **Próprio** (confirmado) |
| Integração federal | A restituição de saldo negativo por PER/DCOMP **não tem API** (fora do catálogo) [R3-01]: a execução é D-assistido |
| Confiança | Alta para a ausência no catálogo |

#### D7 · Gestão e atendimento

**GES-104 · Ativar o cliente novo no app e nos canais (convite, A1, opt-in)** (acrescentada na refeita)

| Campo | Verificação |
| --- | --- |
| Nível | **Próprio** (confirmado) |
| Credencial (ajuste) | O Integra Contador **não usa o A1 do cliente**: o pedido sai com o certificado do escritório, e "existem serviços que exigem a procuração eletrônica quando o autor do pedido de dados não é o próprio contribuinte" [R3-05]. O A1 do cliente continua necessário para o ADN da NFS-e (certificado do mesmo CNPJ raiz) [R3-19], para a distribuição de NF-e (V2) e para robôs C-cert. Para a parte federal, o que precisa ser colhido na ativação é a **Autorização de Acesso** com os serviços da tabela [R3-05], que o escritório valida em até 30 dias [R3-06] |
| Correção | "Coletar o A1 obrigatório" → "coletar a Autorização de Acesso RFB (federal) e o A1 só onde ele é exigido (notas, robôs)". `[INFERÊNCIA a partir de R3-05 e R3-19]` |
| Confiança | Alta |

#### Ciclo de vida (L1)

**CIC-004 · Cliente pessoa física (IRPF, carnê-leão, LCDPR)**

| Campo | Verificação |
| --- | --- |
| Nível | **D-assistido** (confirmado) |
| Integração | **Transmissão de IRPF, carnê-leão e LCDPR: sem API** no catálogo do Integra (06/11/2026) [R3-01]. O que existe por API: Sicalc emite DARF de PF (A$, Emissão; exemplo oficial "Emitir DARF de pessoa física"), Caixa Postal PF (A$) e Eventos de Atualização PF (grátis) [R3-01]. Conferência de acesso: OBTERPROCURACAO41 (A$), cujo exemplo oficial traz os sistemas "Declarações - DIRPF" e "Meu Imposto de Renda" [R3-04] |
| Base conferida | Res. CFC 1.721/2024, art. 3º, I (cadastro PF) [R3-16]. **LCDPR** [R3-23]: entrega anual até o fim do prazo da DIRPF (salvo espólio e saída definitiva), **no e-CAC, serviço "Meu Imposto de Renda", com certificado ICP-Brasil**; limite do art. 23-A da IN SRF 83/2001, apurado por produtor somando todas as unidades. O valor de R$ 4,8 mi não estava no texto aberto (só em secundárias). IN RFB 2.312/2026: não aberta |
| Credencial | Transmissão de IRPF e LCDPR: certificado do cliente PF ou procuração (Autorizações de Acesso) para o e-CAC; LCDPR exige certificado ICP-Brasil [R3-23] |
| Correção | "Sem API de transmissão de IRPF encontrada [NÃO VERIFICADO]" → **confirmado pelo catálogo oficial**. Acrescentar o DARF PF pelo Sicalc (A$) e o canal oficial do LCDPR (e-CAC com certificado, sem API) |
| Preço | DARF PF: Emissão R$ 0,32; Caixa Postal PF: Consulta R$ 0,24 [R3-02] |
| Confiança | Alta para a ausência de API e para o canal do LCDPR; média para o valor do limite e os prazos de 2026 |

**CIC-006 · Falecimento do titular ou de sócio**

| Campo | Verificação |
| --- | --- |
| Nível | **D-humano** (confirmado) |
| Integração | Para **empregador pessoa física falecido** (doméstico ou equiparado), o inventariante pede acesso ao FGTS Digital por protocolo no MTE, com certidão de óbito. O acesso vale 12 meses (sem partilha) ou 2 meses (com partilha) [R3-17]. Eventos de Atualização do Integra **não têm evento de situação do CPF**: os eventos são só E0301 DCTFWeb, E0601 Caixa Postal e E0701 Pagamentos [R3-20]. A baixa de ofício do MEI se confirma pela Consulta CNPJ ou pelo CCMEI CCMEISITCADASTRAL123 (A$) |
| Base | Quando a baixa do MEI não acontece sozinha, há o formulário oficial "Requerimento Para Alteração/Baixa de CNPJ MEI – Titular Falecido", com certidão de óbito e documento do parente ou cônjuge [R3-26]. A baixa automática pela comunicação do cartório e a retroação à data do óbito: só resumo de busca e fontes antigas `[NÃO VERIFICADO na fonte oficial]` |
| Correção | Acrescentar o procedimento de acesso do inventariante no FGTS Digital (NO 06/2024) e o formulário de baixa do MEI falecido (a minuta pode ser preparada pelo agente; o protocolo é humano) |
| Confiança | Alta para o FGTS Digital e para a existência do formulário; baixa para a retroação |

**CIC-005 · Receber uma carteira de clientes em bloco** (acrescentada na refeita)

| Campo | Verificação |
| --- | --- |
| Nível | **Próprio** (confirmado), com etapas D-assistido por cliente |
| Integração federal | **Procurações não se transferem entre escritórios.** A Autorização de Acesso é concedida pelo cliente a uma pessoa determinada, e essa pessoa valida em até 30 dias [R3-06]. Cada cliente concede uma nova ao comprador, e o comprador valida cada uma. O guia não traz concessão em lote: `[INFERÊNCIA a partir de R3-06]`. O vendedor cancela as que recebeu (aba Recebidas) e **renuncia aos vínculos por API** (PNRCONTADOR SOLICRENUNCIA262 + COMPRENUNCIA264). O comprador confere com CONSVINCULOS261 [R3-03]. FGTS Digital e DET: nova procuração no SPE por cliente, com e-CNPJ do comprador [R3-07] |
| Preço (estimativa V1) | Para 100 clientes, do lado do vendedor: 100 × R$ 0,40 (renúncia) + 100 × R$ 0,32 (comprovante) = **R$ 72**; do lado do comprador: 100 × R$ 0,24 (vínculos) + 100 × R$ 0,24 (procuração) = **R$ 48** (faixa 1) `[INFERÊNCIA a partir de R3-02]` |
| Correção | Acrescentar "procurações e vínculos refeitos cliente a cliente; renúncia e conferência por PNRCONTADOR (A$)" |
| Confiança | Alta para os serviços; média para a ausência de concessão em lote |

**CIC-008 · Falência ou recuperação judicial do cliente** (acrescentada na refeita)

| Campo | Verificação |
| --- | --- |
| Nível | **D-humano** (confirmado) |
| Integração federal | Para o relatório ao administrador judicial, o passivo fiscal federal vem do **SITFIS (A$, Emissão)**, dos parcelamentos do Simples e MEI e do e-Processo (A$) [R3-01]. PGFN (dívida ativa): Regularize sem API [R3-18]. FGTS Digital: a NO 06/2024 prevê cadastro de "administrador nomeado judicialmente", mas dentro das exceções para **empregador pessoa física** [R3-17]. Como o administrador judicial de PJ falida acessa RFB e FGTS Digital: `[NÃO VERIFICADO]` |
| Base | Lei 11.101/2005, arts. 51, II, e 104, II e V: o texto oficial no Planalto não abriu nesta rodada `[NÃO VERIFICADO na fonte oficial]` |
| Preço | SITFIS: R$ 0,32 (Emissão) + consultas a R$ 0,24 [R3-02] |
| Confiança | Média para as integrações; baixa para a base legal |

**CIC-009 · Grupo econômico como conta única** (acrescentada na refeita)

| Campo | Verificação |
| --- | --- |
| Nível | **Próprio** (confirmado) |
| Integração federal | QSA de cada CNPJ do grupo: **Consulta CNPJ SERPRO tipo QSA (A$)**, R$ 0,8683 por consulta na faixa 01 [R3-25], ou dados abertos do CNPJ (A, defasados). O Integra é cobrado **por CNPJ consultado** e exige procuração de **cada empresa** e de **cada sócio PF**, porque a Autorização de Acesso é por outorgante [R3-05, R3-06]. Vigilância conjunta: Eventos de Atualização PJ e PF em lote, que exigem procuração válida para cada contribuinte monitorado [R3-05, R3-20] |
| Correção | "QSA via SOC-004" → precisar "Consulta CNPJ QSA (A$, R$ 0,8683) ou dados abertos (A)" |
| Confiança | Alta |

**CIC-010 · Reentradas parciais (mudança de porte, regime ou atividade)** (acrescentada na refeita)

| Campo | Verificação |
| --- | --- |
| Nível | **Próprio** (confirmado) |
| Integração federal | Detecção: MEI → ME pela **CCMEI CCMEISITCADASTRAL123 (A$)** ou pela Consulta CNPJ; exclusão do Simples e termos de exclusão pela **Caixa Postal / DTE (A$)** e pelo evento E0601 (Caixa Postal) dos Eventos de Atualização [R3-01, R3-20]; regime de caixa ou competência pelo **REGIMEAPURACAO (A$)**. **Não há API** de opção ou exclusão do Simples nem de desenquadramento do MEI [R3-01]: o ato fica em D-assistido. Primeiro empregado: DP-105 (eSocial A) |
| Base conferida | Res. CFC 1.590/2020, art. 2º, "i" ("previsão de aditamento contratual, se necessário") [R3-15] |
| Preço | Consulta R$ 0,24 por verificação [R3-02] |
| Confiança | Alta |

### R3.3 Resumo das correções de nível

| Ficha | Nível na ficha | Nível verificado | Motivo |
| --- | --- | --- | --- |
| FIS-103 | A | **A$** | Consultas federais saem do Integra (pago) |
| FIS-105 | A | **A$** | Parcelamentos do Simples e MEI, e-Processo e SITFIS são do Integra; PGFN sem API |
| CTB-102 | C-cert | **C-cert** (mantido) | A hipótese "API local do Serviço ReceitanetBX (possível A)" caiu: o serviço é exclusivo para conveniados |
| Demais 37 | — | mantidos | Ajustes de integração, credencial, preço ou base (ver cada ficha) |

As mudanças de integração mais relevantes: **PNRCONTADOR** (renúncia do vínculo por API) em SOC-103, SOC-104, SOC-107, FIS-109 e CIC-005; **cancelamento pelo próprio procurador** (RFB) e **renúncia no SPE** (FGTS Digital) em FIS-109 e DP-107; **DEFIS e MIT de extinção por API** em FIS-110, com a regra de que o MIT só se preenche se houver tributo; **DCTFWeb sem movimento entregue uma vez, sem renovação anual** (SOC-110); **DASN-SIMEI ainda sem API**; **e-Processo** em CON-102 e FIS-104; **baixa do CNPJ dispensada no eSocial** em DP-108; **ordem oficial S-1000 → S-1005 → S-1010 → S-2200** em DP-105; **A1 do cliente desnecessário para o Integra** (GES-104); **datas corretas da opção pelo Simples para 2027** (15/10/2026; IBS/CBS até 30/10/2026) em CON-103; **LCDPR só pelo e-CAC com certificado** em CIC-004.

**Correções de rótulo na planilha sem mudança de nível:** FIS-101, FIS-107, CON-101 e CIC-009 têm consultas federais rotuladas "A" que são **A$** (Integra ou Consulta CNPJ, pagos).

### R3.4 Fontes abertas nesta rodada (06/11/2026)

- [R3-01] SERPRO, Catálogo de Serviços do Integra Contador (15/10/2026): https://apicenter.estaleiro.serpro.gov.br/documentacao/api-integra-contador/pt/catalogo_de_servicos/
- [R3-02] Loja SERPRO, Integra Contador (tabela de preços e funcionalidades por tipo, via API pública do produto): https://loja.serpro.gov.br/ccstore/v1/products/integracontador · https://loja.serpro.gov.br/integracontador
- [R3-03] SERPRO, Integra-Redesim / PNRCONTADOR, Introdução (19/02/2026): https://apicenter.estaleiro.serpro.gov.br/documentacao/api-integra-contador/pt/solucoes/integra-redesim/pnrcontador/
- [R3-04] SERPRO, Integra-Procurações, Introdução e "Obter Procuração" (10/04/2026): https://apicenter.estaleiro.serpro.gov.br/documentacao/api-integra-contador/pt/solucoes/integra-procuracoes/procuracoes/ · https://apicenter.estaleiro.serpro.gov.br/documentacao/api-integra-contador/pt/solucoes/integra-procuracoes/procuracoes/servicos/obter_procuracao/
- [R3-05] SERPRO, Serviços x Procurações (01/06/2026): https://apicenter.estaleiro.serpro.gov.br/documentacao/api-integra-contador/pt/servicos_vs_procuracoes/
- [R3-06] RFB, Autorizações de Acesso – Guia do Usuário (PDF, 12 p.; seções 5 e 6): https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/passo-a-passo/autorizacoes-de-acesso-guia-do-usuario
- [R3-07] MTE, Manual de Orientação do FGTS Digital v1.70 (12/06/2026), seção 1.5 Procurações: https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/fgtsdigital/manual-e-documentacao-tecnica/manual-de-orientacao-do-fgts-digital-versao-1-70-12-06-2026.pdf
- [R3-08] MTE/SERPRO, Manual do DET (Apresentação; menu Procurações → SPE): https://det.sit.trabalho.gov.br/manual/
- [R3-09] SERPRO, DEFIS: Transmitir declaração (entrada) e Dados de domínio (situação especial): https://apicenter.estaleiro.serpro.gov.br/documentacao/api-integra-contador/pt/solucoes/integra-sn/defis/servicos/entregar_entrada/ · https://apicenter.estaleiro.serpro.gov.br/documentacao/api-integra-contador/pt/solucoes/integra-sn/defis/dados_de_dominio/
- [R3-10] SERPRO, MIT: Encerrar Apuração: https://apicenter.estaleiro.serpro.gov.br/documentacao/api-integra-contador/pt/solucoes/integra-dctfweb/mit/servicos/encerrar_apuracao/
- [R3-11] SERPRO, DASN-SIMEI: Entregar Declaração e Changelog (1.0.0, 22/12/2025): https://apicenter.estaleiro.serpro.gov.br/documentacao/api-integra-contador/pt/solucoes/integra-mei/dasnsimei/servicos/entregar_declaracao/ · https://apicenter.estaleiro.serpro.gov.br/documentacao/api-integra-contador/pt/solucoes/integra-mei/dasnsimei/changelog/
- [R3-12] SERPRO, e-Processo: Consultar Processos por Interessado (10/04/2026): https://apicenter.estaleiro.serpro.gov.br/documentacao/api-integra-contador/pt/solucoes/integra-e-processo/eprocesso/servicos/consultar_processos/
- [R3-13] eSocial, MOS S-1.3 consolidado até a NO S-1.3 12/2026 (publicado em 21/10/2026), item sobre tabelas e baixa do CNPJ: https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/mos-s-1-3-consolidada-ate-a-no-s-1-3-12-2026.pdf
- [R3-14] RFB, Manual – Serviço ReceitanetBX v1.0 (nov/2020): https://servicos.receita.fazenda.gov.br/publico/programas/ReceitanetBX/Servicos/manual_servico_receitanetbx.pdf
- [R3-15] CFC, Resolução CFC nº 1.590/2020 (texto oficial): https://www1.cfc.org.br/sisweb/SRE/docs/RES_1590.pdf
- [R3-16] CFC, Resolução CFC nº 1.721/2024 (texto oficial): https://www1.cfc.org.br/sisweb/SRE/docs/RES_1721.pdf
- [R3-17] MTE, Nota Orientativa FGTS Digital nº 06/2024 (15/08/2024): https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/fgtsdigital/manual-e-documentacao-tecnica/nota-orientativa-fd-06-2024-cadastro-de-administradores-judiciais-inventariantes-e-correlatos-pdf.pdf
- [R3-18] SERPRO, notícia "Representantes de empresas já acessam o Regularize pela conta gov.br" (set/2026): https://www.serpro.gov.br/menu/noticias/noticias-2026/novo-acesso-portal-regularize
- [R3-19] Portal NFS-e, Manual dos Contribuintes – APIs do ADN v1.0 (12/02/2026), reaberto: https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/documentacao-atual/manual-contribuintes-apis-adn-sistema-nacional-nfse.pdf
- [R3-20] SERPRO, Eventos de Atualização: Introdução e Dados de domínio: https://apicenter.estaleiro.serpro.gov.br/documentacao/api-integra-contador/pt/solucoes/integra-contador-gerenciador/eventosatualizacao/dados_de_dominio/
- [R3-21] RFB, Perguntas e Respostas da DCTFWeb (set/2025), itens 5.10, 5.13 e 5.21: https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/declaracoes-e-demonstrativos/DCTFWeb/arquivos/perguntas-e-respostas-dctfweb-2025-09-23.pdf
- [R3-22] Resolução CGSN nº 194, de 25/09/2026 (DOU de 28/09/2026, Edição 183-C, Seção 1 Extra C, p. 8), lida na reprodução em PDF da página do DOU publicada pela Fenacon: https://fenacon.org.br/wp-content/uploads/2026/09/Resolucao-CGSN-no-194-DE-25-DE-setembro-DE-2026-Resolucao-CGSN-no-194-DE-25-DE-setembro-DE-2026-DOU-Imprensa-Naciona.pdf
- [R3-23] RFB, página do LCDPR (atualizada em 30/04/2024) e Perguntas e Respostas do LCDPR (itens 1, 4, 5 e 7): https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/declaracoes-e-demonstrativos/lcdpr-livro-caixa-digital-do-produtor-rural · https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/declaracoes-e-demonstrativos/lcdpr-livro-caixa-digital-do-produtor-rural/perguntas-e-respostas-livro-caixa-digital-do-produtor-rural-lcdpr.pdf
- [R3-24] Fenacon, "ReceitanetBX recebe novas versões para usuários externos" (10/04/2026, "Fonte: Receita Federal"; secundária): https://fenacon.org.br/noticias/receitanetbx-recebe-novas-versoes-para-usuarios-externos/
- [R3-25] Loja SERPRO, Consulta CNPJ (tabela de preços, via API pública do produto, 06/11/2026): https://loja.serpro.gov.br/ccstore/v1/products/consultacnpj
- [R3-26] RFB, formulário "Requerimento Para Alteração/Baixa de CNPJ MEI – Titular Falecido": https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/formularios/cadastros/cnpj-mei-falecido
- Reabertos na refeita: [R3-01] catálogo (15/10/2026), [R3-02] loja do Integra, [R3-05] Serviços x Procurações (01/06/2026) e [R3-13] MOS S-1.3 (eventos S-1000, S-1005, S-1010 e S-2200).
- Tentados sem sucesso na refeita: IN RFB 2.003/2021 no portal Normas (https://normas.receita.fazenda.gov.br/sijut2consulta/link.action?idAto=114965; aplicação JavaScript, API 403); Lei 11.101/2005 no Planalto (sem resposta); gov.br "Encerramento de CNPJ de MEI falecido" (CAPTCHA).
- Consultadas sem confirmar (CAPTCHA não testado): CNDT https://cndt-certidao.tst.jus.br/inicio.faces · CRF https://consulta-crf.caixa.gov.br/consultacrf/pages/consultaEmpregador.jsf
- Secundárias usadas só como indício (via busca): Res. CGSN 186/194/2026 (Econet, netcpa, legisweb); baixa do MEI por óbito (COAD, netcpa); IN RFB 2.082/2022, prazos da ECD (okai, hondatar); LCDPR (COAD, Contábeis); DCTFWeb sem movimento (sitecontabil, Jornal Contábil); ReceitanetBX e ECF (Domínio, Contábeis); na refeita: IN RFB 2.142/2023 e o § 3º do art. 5º da IN 2.003 (portalspedbrasil), Res. CGSN 186/194 (netcpa, normaslegais), limite de R$ 4,8 mi do LCDPR (resumo de busca citando a IN RFB 1.903/2019 e o ENAT), baixa automática do MEI falecido (resumo de busca citando o gov.br e um e-book da Prefeitura de Cabo Frio)
