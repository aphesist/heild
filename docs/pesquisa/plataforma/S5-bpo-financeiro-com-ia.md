# S5 · Plataformas de BPO financeiro com IA

**Data:** 08/11/2026 · **Escopo:** concorrentes do módulo de BPO financeiro (pagamento, recebimento, cobrança e conciliação executados pelo escritório, com IA). Prioridade: **Sofia** (usesofia.com). Comparação: BPO Suite, Loki, Nortcash. MULTI BPO e Ottimizza.AI não foram verificados.
**Método:** leitura direta dos sites (curl) e 8 buscas web. Tudo que é "a empresa diz" vem de página comercial, sem auditoria externa. `[a confirmar]` marca o que não foi verificado.

## Sobre o nome (Luana e Sofia)

- **Luana:** 2 buscas extras (BPO financeiro, contas a pagar, WhatsApp, agente, startup, LinkedIn, Product Hunt) não acharam produto de BPO com esse nome. O único "Luana" de software é luana.ai, FP&A para grandes empresas. Não existe evidência de um "Luana" de BPO.
- **Sofia:** o usuário confirmou que o produto era a Sofia ([usesofia.com](https://www.usesofia.com/)). Ela passa a ser o item principal. Busca web por cobertura externa (rodadas, imprensa) não achou nada. Todo o conhecimento vem do site da empresa.

## 1. Sofia (prioridade)

**Quem faz:** Sofia Software Ltda (CNPJ 52.433.318/0001-60, [termos](https://www.usesofia.com/termos-e-condicoes)). Os dois fundadores aparecem como Daniel e Marco Aurélio (sobrenome de Daniel `[a confirmar]`). Lançou a v1.0 em 11/08/2025. Em 26/10/2026 estava na v1.5.28, com patches semanais ([changelog](https://www.usesofia.com/changelog)). Sem rodada ou imprensa localizada.

**Para quem vende:** BPOs financeiros ("de BPO para BPO"). A v1.0 também citava startups e PMEs.

**Preço público** ([precos](https://www.usesofia.com/precos)):
- R$ 250 por organização ativa por mês, plano único, sem fidelidade.
- Operadores e organizações ilimitados.
- Uso justo por organização: 50 NFSe/mês, 5.000 lançamentos/mês, 5 conexões bancárias.
- Programa Founders: R$ 179 por organização, vitalício (sujeito a reajuste anual pela inflação), mínimo de 3 organizações, 100 vagas ([founders](https://www.usesofia.com/sofia-founders)).
- Migração gratuita, "menos de uma hora por organização".

**O que a IA faz de fato (declarado como disponível):**
- **Radar:** o cliente manda nota, comprovante ou áudio no WhatsApp ou e-mail. A IA lê PDF, imagem e XML de NF-e, cria o lançamento na organização certa e o operador valida. O Radar V2 (26/10/2026) traz caixa de entrada com atalhos J/K, resumo "Sofia entendeu" e tipo de documento detectado.
- **Conciliação:** a IA sugere o pareamento e o operador confirma.
- **Copiloto no WhatsApp:** consultas, PDF/Excel, DRE.
- **Plugin do Claude:** concilia em lote, reclassifica a carteira e gera BI em HTML. O plugin tem código aberto em `sofia-open-source/sofia-anthropic` ([plugin](https://www.usesofia.com/plugin-claude)).

**"IA autônoma":** a home diz que a Sofia "**está construindo**" IA que executa com confiança alta. Hoje a IA sugere e o operador confirma. Os termos (cláusula 9.2) dizem que o nível de automação é configurável pelo cliente. Nenhum limiar de confiança é descrito. A promessa de "1 operador de 5 para 30 organizações" é meta da empresa. Um cliente (Grow BPO) declara 60+ organizações.

**Contas bancárias:** Open Finance via Pluggy, 8 importações por dia, OFX para banco fora do Open Finance. É leitura. Guia da comunidade sobre acesso secundário no banco: perfil de consulta e "o BPO inclui, o cliente aprova" ([artigo](https://www.usesofia.com/comunidade/acesso-secundario-banco-bpo-financeiro)).

**Pagamento:** não há evidência de execução de pagamento, lote, dupla aprovação ou alçada. Contas a pagar são lançamentos e há campos de chave Pix e boleto. DDA aparece só como fonte de dados na v1.0 `[a confirmar se existe hoje]`.

**Segregação:** permissão por organização (leitura, edição, administração), isolamento entre organizações e auditoria de quem fez o quê ([produto](https://www.usesofia.com/produto)).

**Integrações:** Open Finance, NFSe (só serviço; NF-e está no roadmap, cobertura municipal varia), WhatsApp, e-mail, API REST com token. Importadores de ERP e planilha. Ligação com sistema contábil `[a confirmar]`. Não há MCP próprio; o plugin usa a API.

**White-label:** a home vende "white-label nativo" (subdomínio). A FAQ da própria home diz que o cliente final tem hoje login próprio e que o portal com marca e subdomínio está "**em construção**".

**Central do BPO e audit score:** só aparecem na home. Não estão em produto nem no changelog. Os "health score" com semáforo existem no plugin. `[a confirmar se o audit score já existe]`

**Diferenciais:** foco no BPO, preço por organização, velocidade de entrega, Radar, plugin e API abertos, comunidade de BPOs. **Limites e riscos:**
- Tese de IA autônoma ainda é promessa.
- Sem pagamento nem aprovação.
- Chave de API do plugin acessa **todas** as organizações do usuário e fica nas instruções de um projeto do Claude (a própria Sofia recomenda expiração de ~7 dias).
- Dependência de Pluggy, Anthropic e Asaas (cobrança).
- Equipe pequena e sem cobertura externa.
- Um bug corrigido: a IA "inventava" desconto e juros em lote.

## 2. Comparação (BPO Suite, Loki, Nortcash)

| | **BPO Suite** | **Loki** | **Nortcash** |
|---|---|---|---|
| Quem | Contbank; fundadores Erico Azevedo (ex-Wabbi/Conta Azul), Luiz Tavares, Paulo Castro. Conta digital desde 2021, plataforma atual em set/2025 ([sobre](https://bposuite.com.br/sobre/)) | Loki Soluções Corporativas, SP, desde 2025 ([site](https://loki.global/)) | Kompra.app Apoio Administrativo Ltda ([site](https://www.nortcash.com.br/)) |
| Vende para | Contadores e BPOs; 1.000+ contadores parceiros | PMEs e "quem opera o financeiro de PMEs"; programa de parceiros para escritórios | PMEs e BPOs/escritórios |
| IA | Categorização assistida, previsão de risco (Navigator.AI, "até 97,8%" segundo a empresa) | Agentes de pagar, receber, conciliar, documentos fiscais, via chat. Assistente que prepara, time autoriza | Copiloto que lança, categoriza, concilia, monta DRE; WhatsApp; MCP |
| Contas | Conta PJ própria + Open Finance de outros bancos | Open Finance e envio a bancos integrados (quais `[a confirmar]`) | Open Finance, só leitura |
| Pagamento | Pix, TED, boleto, agendado, **autorização individual e em lote**, DDA ([comparativo](https://bposuite.com.br/contadores/compare-planos/)) | Envio ao banco; "autorização final com o seu time"; lote de salários | **Não paga nem cobra** (blog da própria Nortcash) |
| Segregação | Permissões e perfis, MFA. Dupla aprovação `[a confirmar]` | Permissões e aprovações configuráveis | MCP "pede o seu sim antes de gravar" |
| WhatsApp | Notificações, em beta | Não confirmado | Perguntas e respostas |
| Preço | R$ 299 (3 CNPJs), 475 (5), 800 (10), 1.750 (25); CNPJ extra R$ 70 a 99; BolePIX R$ 0,99 a 1,39 ([planos](https://bposuite.com.br/contadores/planos-e-precos/)) | Sem preço público; mensal sem fidelidade; implantação 15 a 30 dias úteis | R$ 179 / 358 / 467 (12 meses, nov/2026); escritório sob consulta |
| Clientes por operador | "Cerca de 80" (empresa) | Não citado | Não citado; "90% do operacional automático" em um cliente BPO (empresa) |

**Notas por produto**
- **BPO Suite** é o único com pagamento e conta própria. Inconsistências no site: pagamento via Open Finance aparece "em breve" nos planos e "incluso" no comparativo; WhatsApp custa R$ 0,60 num lugar e R$ 2,00 em outro. Receita extra para o escritório: rebate progressivo e cashback ([BPO Financeiro com IA](https://bposuite.com.br/contadores/bpo-financeiro-ia/)).
- **Loki** declara "100+ empresas" na home e "25+" na página Sobre. Comissão de parceiro de 10 a 20% por 24 meses ([parceiros](https://loki.global/parceiros)). Ver também o [agente de contas a pagar](https://loki.global/agentes/contas-a-pagar).
- **Nortcash:** os preços e a afirmação de que não movimenta dinheiro estão no próprio blog, que é conteúdo comercial com comparativos a favor dela. Termos de uso mencionam proposta individualizada. [MCP](https://www.nortcash.com.br/mcp).
- **MULTI BPO ("Luca") e Ottimizza.AI ("Luz"):** uma busca para cada, sem confirmação. `[a confirmar]`

## 3. O que a Sofia ensina ao nosso BPO

Obs.: o que "nós temos" segue a descrição do coordenador (subplanos 09 e 10), que não verifiquei.

**Ela faz e nosso desenho já cobre:** carteira multi-cliente, conciliação com Open Finance, captura por WhatsApp e e-mail, permissões por cliente, API.

**Ela tem e nós não temos (candidatos a feature):**
1. **Audit score** verde, amarelo e vermelho por organização, com gestão por exceção.
2. **IA que executa com confiança alta**, com nível configurável por cliente e regra aprendida do uso.
3. **Plugin do Claude, API e MCP como superfície de operação**, com chave por integração. Cuidado: escopo mínimo e curto, não uma chave que abre a carteira inteira.
4. **BI em HTML** gerado sob demanda a partir dos dados reais.
5. Inbox de triagem com teclado e "entendi isto" mostrando o que a IA preencheu.
6. Migração em simulação (dry-run) com importadores por ERP.
7. Programa Founders e cobrança por organização ativa com uso justo.

**Nós temos e ela não tem:** ligação com a contabilidade, timesheet e custo-hora, app do cliente, Time de agentes, aprovação por cartão, pacotes de área, marca branca em dois níveis. Ela também não executa pagamento.

**Riscos que ela enfrenta:** ver seção 1 (promessas à frente do produto, segurança da chave, dependências, equipe pequena).

## 4. Ideias aproveitáveis dos demais

- **BPO Suite:** produtividade de ~80 clientes por profissional como meta de produto; DDA ("buscador de boletos") com autorização individual e em lote; painel do contador (BPO Manager); receita extra para o escritório (rebate, cashback, tarifas); sincronização de notas por SIEG; e-CNPJ incluso; previsão de risco por cliente.
- **Loki:** agentes por área (pagar, receber, conciliar, documentos); holerite vira rascunho de lote de salários; "dado incerto vira exceção, não preenchimento"; programa de comissão a parceiros.
- **Nortcash:** conciliação em três níveis (extrato, notas, contas a pagar com DDA); DRE de cada CNPJ lado a lado; MCP de leitura com OAuth que pede confirmação antes de gravar.
- **Não verificado em nenhum:** QR code por empresa e aprovação por WhatsApp com código único (não apareceram nos sites lidos).

## 5. Riscos comuns ao mercado

- Promessa de IA autônoma sem pagamento aprovado ou sem prova de acurácia (97,8% e 90% são alegações das empresas).
- Cobrar por tarifas bancárias ou ser banco (BPO Suite) traz risco regulatório e de conflito com o escritório.
- Chaves de API em ferramentas de IA de terceiros com acesso a toda a carteira.
- Preço e funcionalidade inconsistentes entre páginas, e métricas de clientes divergentes.
- Dependência de agregadores de Open Finance e de NFSe municipal.

*Fontes principais (lidas em 07 e 08/11/2026): usesofia.com (home, produto, preços, changelog, developers, plugin, founders, parceiros, termos, comunidade); bposuite.com.br; loki.global; nortcash.com.br (sitemap, termos e blog). Arquivos brutos em `/tmp/claude-0/-home-user-DGM-RAG-Contabil/5331db90-ca7d-552a-9f3a-94299e74c80c/scratchpad/s5/`.*
