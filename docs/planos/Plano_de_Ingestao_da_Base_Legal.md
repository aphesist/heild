# Plano de Ingestão da Base Legal (multiagente)

> **Revisto em 15/11/2026:** a revisão pela IA (decisão do Enzo, 9/11/2026) substitui a fila humana, a auditoria amostral e a concordância com os contadores; estadual nas 27 UFs; janela de 10 anos no federal e 5 no estadual e no municipal. Ver o adendo "consolidação dos planos" no fim deste documento.

5 de novembro de 2026

Este documento descreve como construir, com agentes autônomos, a base legal versionada no tempo que alimenta o assistente para contadores: quais modelos de documento (fichas) preparar, como os agentes se organizam, de onde vêm as informações e em que ordem tudo é feito. O cronograma, o orçamento e os detalhes de sindicatos, Juntas e do coletor estão no [Plano de desenvolvimento (6 meses)](Plano_MVP_6_meses.md), que é o plano de execução.

---

## 1. Resumo

- **Escopo:** legislação federal completa, mais as leis estaduais e municipais de SP, MG, PR, SC e RS. Dos municípios entram as capitais e aqueles onde os escritórios do grupo têm clientes; os demais entram por demanda. Também entram as fontes trabalhistas e societárias: convenções e acordos coletivos, Juntas Comerciais e manuais oficiais.
- **Quem faz o trabalho:** um agente orquestrador coordena agentes especializados que coletam, extraem, validam, revisam e consolidam a legislação. As pessoas são o fundador, Enzo Vasconcelos, e os contadores do grupo, que são os playtesters. Enzo cuida da modelagem, da infraestrutura com suas credenciais e das decisões de negócio. Os contadores validam as fichas, fazem a auditoria por amostragem e enviam o que só circula fora das fontes oficiais. Quando uma fonte tem CAPTCHA, o último recurso é uma pessoa resolvê-lo pelo celular (seção 5.6).
- **O que preparar:** um pacote de modelagem com **6 fichas** (3 de núcleo, que precisam sair perfeitas, e 3 extensíveis) e **3 artefatos de apoio**: vocabulário controlado, taxonomia de temas e manual de preenchimento com casos-modelo.
- **Como acertar as fichas de primeira:** partir de padrões que já existem (LexML e Akoma Ntoso) e só congelar o núcleo depois de um piloto com 300 documentos variados, em que nenhuma rodada nova exija mudança de estrutura.
- **Ordem de execução, dentro dos 6 meses:** modelagem, piloto e federal (M1) → SP e MG (M2) → PR, SC, RS e municípios (M3) → convenções, canal dos contadores e operação contínua (M4 a M6).
- **Janela histórica:** os últimos 10 anos, que cobrem com folga o prazo de decadência tributária de 5 anos.

---

## 2. Princípios que não podem mudar depois

Estes princípios são o que torna a estrutura durável. Se forem respeitados, uma mudança futura de ficha vira reprocessamento automático feito pelos agentes, e não retrabalho humano impossível.

1. **Original imutável.** Todo documento coletado é guardado exatamente como veio (PDF, HTML ou XML), com hash, URL de origem e data de coleta. Tudo o mais é dado derivado e pode ser refeito.
2. **Identificação por padrão nacional.** Cada norma recebe a URN do LexML (ex.: `urn:lex:br:federal:lei.complementar:2006-12-14;123`), e cada dispositivo recebe um sufixo hierárquico estável (artigo, parágrafo, inciso, alínea, item). Não inventar identificadores próprios.
3. **Três datas por versão de dispositivo:** publicação, início de vigência e início de eficácia (produção de efeitos). Além delas, guarda-se a data em que a informação entrou na base, para auditoria.
4. **Eventos, não textos consolidados.** A base guarda *eventos de alteração* (nova redação, acréscimo, revogação e outros). As versões de cada dispositivo são **calculadas por código determinístico**, que aplica os eventos em ordem. Os modelos de IA extraem eventos; nunca escrevem diretamente uma versão consolidada.
5. **Evidência literal.** Todo campo extraído aponta para o trecho exato do documento original que o justifica.
6. **Núcleo estável, extensões flexíveis.** Os campos do núcleo nunca mudam. Necessidades novas entram como campos opcionais de extensão, com versionamento do esquema (v1.0, v1.1...). Uma extensão nova é preenchida retroativamente pelos agentes, sem tocar no núcleo.

---

## 3. Pacote de modelagem

### 3.1 As 6 fichas

| # | Ficha | Para que serve | Tipo | Campos principais |
| --- | --- | --- | --- | --- |
| 1 | **Norma** | Registro de cada ato normativo | Núcleo | URN, tipo, número, data, esfera, ente (UF ou município com código IBGE), órgão emissor, ementa, veículo e data de publicação, abrangência territorial (ex.: UFs aderentes a um convênio CONFAZ), situação |
| 2 | **Dispositivo e versão** | Estrutura hierárquica da norma e o texto de cada dispositivo ao longo do tempo | Núcleo | Identificador hierárquico, tipo de unidade (artigo, parágrafo, inciso, alínea, item, anexo), texto da versão, publicação, vigência, eficácia, evento que originou a versão |
| 3 | **Evento normativo** | Cada alteração que um ato faz em outro | Núcleo | Ato alterador, dispositivo alvo, tipo de evento (lista fechada), texto literal novo, regra de vigência, regra de eficácia, trecho de evidência |
| 4 | **Tabela normativa** | Anexos e tabelas: alíquotas, anexos do Simples, listas de serviços, MVA de substituição tributária, NCM | Extensível | Tabela, colunas com tipo de dado, linhas com identificador estável, vigência por linha, evento que alterou cada linha |
| 5 | **Interpretação oficial** | Soluções de Consulta e de Divergência COSIT, Pareceres Normativos, Atos Declaratórios Interpretativos, respostas a consultas das Sefaz | Extensível | Órgão, número, data, ementa, dispositivos interpretados, conclusão, alcance (vinculante para quem), situação (vigente, reformada, revogada) |
| 6 | **Decisão** | Acórdãos e súmulas do CARF e dos tribunais administrativos estaduais; decisões do STF e do STJ com efeito sobre dispositivos | Extensível | Órgão julgador, processo, data, ementa, dispositivos analisados, resultado, efeito (vinculante, modulação, suspensão), datas da modulação |

**Por que 3 de núcleo e 3 extensíveis:** o risco de ser "impossível refazer" está quase todo em como se identifica um dispositivo e como se representa o tempo (fichas 1, 2 e 3). As fichas 4, 5 e 6 apenas *apontam* para dispositivos do núcleo, então podem ganhar campos depois sem quebrar nada.

**Convenções coletivas** usam as mesmas fichas: a convenção é uma Norma (Ficha 1) com vigência e data-base, cada cláusula é um Dispositivo (Ficha 2), cada aditivo é um Evento (Ficha 3) e pisos e reajustes são Tabelas (Ficha 4). O vínculo atividade do cliente → categoria → sindicato da base territorial entra como extensão.

### 3.2 Tipos de evento (lista fechada da Ficha 3)

Esta lista é a decisão mais delicada do pacote e deve ser validada com cuidado com os contadores do grupo:

- nova redação;
- acréscimo de dispositivo;
- revogação expressa;
- revogação por incompatibilidade (sempre enviada para revisão humana);
- renumeração;
- suspensão de eficácia (inclusive por decisão judicial ou resolução do Senado);
- restabelecimento de eficácia;
- prorrogação de prazo ou de vigência;
- retificação ou republicação por incorreção;
- outro (sempre enviado para revisão humana, e cada ocorrência vira proposta de novo tipo).

**Regra de vigência**, que é um subcampo do evento:

- data fixa expressa;
- prazo contado da publicação;
- primeiro dia de um mês ou exercício subsequente;
- condicionada a regulamentação;
- regra geral da LINDB (45 dias após a publicação, quando o ato é omisso);
- retroativa, com indicação expressa.

### 3.3 Os 3 artefatos de apoio

| Artefato | Conteúdo | Por que importa |
| --- | --- | --- |
| **A. Vocabulário controlado** | Listas fechadas: tipos de norma, tipos de evento, regras de vigência, tributos, esferas, órgãos emissores | Impede que cada agente descreva a mesma coisa de um jeito diferente |
| **B. Taxonomia de temas** | Árvore de temas contábil-tributários (ex.: Simples Nacional → anexos → fator R) | É usada pela recuperação (etapa 1 da cascata) e para classificar cada dispositivo |
| **C. Manual de preenchimento com casos-modelo** | Instruções campo a campo e de 60 a 80 casos resolvidos: pelo menos 5 por tipo de evento, mais os casos difíceis | É a base de referência que o agente revisor usa para comparar cada ficha preenchida |

### 3.4 Quem participa

- **Enzo Vasconcelos (fundador), com agentes de programação:** rascunho das fichas a partir do LexML e do Akoma Ntoso, esquemas formais (JSON Schema), regras de validação, infraestrutura e a operação dos agentes.
- **Contadores do grupo (playtesters):** validam se as fichas respondem às perguntas reais do escritório, preenchem à mão parte da amostra-piloto, resolvem os casos-modelo, fazem a auditoria amostral e enviam pelo canal dos contadores o que não está nas fontes oficiais.
- **Advogado do grupo:** questões jurídicas pontuais, como direitos autorais de convenções e licenças.

### 3.5 Como acertar de primeira: o protocolo de congelamento

"Acertar de primeira" não se consegue adivinhando; se consegue testando antes de congelar. O protocolo:

1. **Rascunho v0 a partir de padrões existentes.** Usar como ponto de partida o esquema XML do LexML e o modelo de ciclo de vida de normas do Akoma Ntoso, padrão internacional para documentos legislativos. Não começar do zero.
2. **Montar a amostra-piloto** de 300 documentos, estratificada (tabela abaixo).
3. **Preenchimento duplo.** Os contadores do grupo preenchem 60 documentos à mão, cobrindo todas as categorias. Os agentes preenchem todos os 300.
4. **Registrar cada "não cabe".** Todo caso em que a realidade não coube nos campos vira uma proposta de mudança, com o documento de exemplo.
5. **Rodadas de revisão.** Ajustar as fichas, preencher de novo e repetir.
6. **Critério de congelamento do núcleo:** duas rodadas seguidas, cada uma com 100 documentos *novos*, sem nenhuma mudança de núcleo e com concordância entre agentes e contadores acima da meta (sugestão: 98% dos campos).
7. **Congelar o núcleo como v1.0.** As extensões continuam evoluindo como v1.1, v1.2 e assim por diante, sem quebrar o que já foi feito.

**Composição da amostra-piloto (300 documentos):**

| Categoria | Quantidade |
| --- | --- |
| Leis ordinárias e complementares federais | 30 |
| Decretos federais (incluindo regulamentos) | 20 |
| Instruções Normativas da RFB | 30 |
| Soluções de Consulta COSIT | 20 |
| Acórdãos e súmulas do CARF | 20 |
| Convênios e ajustes do CONFAZ | 25 |
| Decretos que alteram o RICMS de SP | 30 |
| Decretos que alteram o RICMS de MG | 25 |
| Alterações de legislação de PR, SC e RS | 30 |
| Legislação municipal de ISS (capitais dos 5 estados) | 30 |
| Tabelas e anexos (alíquotas, anexos do Simples, MVA) | 20 |
| Casos difíceis (retificação, vigência diferida por artigo, revogação por incompatibilidade, ato que altera várias normas, efeito condicionado a regulamento) | 20 |

---

## 4. Estrutura agêntica

### 4.1 Visão geral

```
                          ┌──────────────────────────┐
                          │   AGENTE ORQUESTRADOR    │
                          │ fila · prioridades ·     │
                          │ orçamento · escalonamento│
                          └────────────┬─────────────┘
                                       │
   ┌──────────────┬───────────────┬────┴─────────┬────────────────┬───────────────┐
   ▼              ▼               ▼              ▼                ▼               ▼
COLETORES    NORMALIZADOR     TRIADOR      EXTRATORES        REVISÃO        CONSOLIDAÇÃO
(1 por       OCR, separa      ato é        primário +        validador      consolidador
 fonte)      atos do diário   relevante?   independente      (código) +     (código) +
                              altera       (outro modelo)    revisor +      conferente
                              norma?                         reconciliador  de fontes
                                                                   │              │
                                                                   ▼              ▼
                                                       FILA HUMANA        PUBLICADOR
                                                       (escalonamento)    (portões de
                                                                          qualidade)
   Agentes de apoio: mantenedor de coletores · auditor amostral · controlador de custos
```

### 4.2 Os agentes

| Agente | Função | Executado por | Saída |
| --- | --- | --- | --- |
| **Orquestrador** | Mantém a fila, distribui tarefas, aplica prioridades e orçamento, decide o que vai para a fila humana | Modelo grande | Plano de trabalho, alertas |
| **Coletor** (1 por fonte) | Visita a fonte no horário agendado, detecta o que mudou sem IA e baixa só o novo, guardando o original com hash, URL e data. Se esbarrar em CAPTCHA, pausa e chama uma pessoa (seção 5.6) | Código escrito e mantido por agente | Original imutável |
| **Normalizador** | Extração de texto, OCR aberto quando o PDF é digitalizado, limpeza, separação dos atos dentro de cada diário oficial | Código mais modelo pequeno | Atos individualizados em texto |
| **Triador** | Decide se o ato é tributário, contábil, trabalhista ou societário e se altera alguma norma | Modelo pequeno | Descarta o irrelevante, encaminha o resto |
| **Extrator primário** | Preenche as fichas (norma, eventos, tabelas, interpretações, decisões) | Modelo grande | Fichas preenchidas, com evidência |
| **Extrator independente** | Preenche as mesmas fichas sem ver o resultado do primário | Outro modelo ou outra instrução | Segunda versão, para comparação |
| **Validador determinístico** | Aplica as regras automáticas (seção 4.4) | Código | Aprovado ou lista de falhas |
| **Revisor** | Compara cada ficha com as fichas-base e os casos-modelo, confere a evidência literal e a coerência com o vocabulário | Modelo grande | Aprovado, corrigido ou divergente |
| **Reconciliador** | Resolve divergências entre os extratores ou entre agente e fonte, buscando mais contexto; se não conseguir, escala | Modelo grande | Ficha final ou item na fila humana |
| **Consolidador** | Aplica os eventos em ordem e calcula as versões de cada dispositivo | Código determinístico | Linha do tempo de cada dispositivo |
| **Conferente de fontes** | Compara as versões calculadas com textos consolidados oficiais (Planalto, normas.leg.br, RICMS consolidado da Sefaz) | Código mais modelo pequeno | Relatório de divergências |
| **Publicador** | Só libera para produção o que passou em todos os portões (seção 4.5) | Código | Base de produção atualizada |
| **Mantenedor** | Detecta coletores quebrados por mudança de site, tenta reencontrar a página e corrige o código, com testes; se não conseguir, a fonte vai para o painel e o fundador corrige | Modelo grande | Coletor corrigido |
| **Auditor amostral** | Sorteia a amostra para os contadores do grupo e calcula a taxa de erro por categoria | Código | Painel de qualidade |
| **Controlador de custos** | Monitora gasto por fonte e por dia; pausa e alerta se sair do padrão | Código | Alertas, pausas |

### 4.3 O caminho de um documento, passo a passo

1. O **coletor** baixa o diário ou o ato e guarda o original.
2. O **normalizador** extrai o texto e separa os atos.
3. O **triador** descarta o que não é relevante.
4. O **extrator primário** e o **extrator independente** preenchem as fichas em paralelo.
5. O **validador** aplica as regras automáticas a cada ficha.
6. O **revisor** compara cada ficha com o manual e os casos-modelo.
7. Se os dois extratores concordam e o revisor aprova, a ficha segue. Se não, o **reconciliador** tenta resolver; se não conseguir, a ficha vai para a **fila humana**.
8. O **consolidador** aplica o novo evento e recalcula as versões dos dispositivos afetados.
9. O **conferente** compara com o texto consolidado oficial, quando ele existe.
10. O **publicador** libera para produção o que passou em todos os portões.

### 4.4 Regras automáticas do validador

- A nova redação aparece literalmente no ato de origem.
- O dispositivo alterado existe na versão anterior (exceto em eventos de acréscimo).
- A vigência não é anterior à publicação, salvo retroatividade expressa no texto.
- Ato omisso quanto à vigência → regra geral da LINDB aplicada e marcada como tal.
- Todo campo de lista fechada usa um valor do vocabulário controlado.
- Todo campo tem trecho de evidência que existe no original.
- Eventos do mesmo ato sobre o mesmo dispositivo não se contradizem.
- Retificações estão ligadas ao ato original que corrigem.

### 4.5 Portões de qualidade para entrar em produção

Uma versão de dispositivo só entra em produção se:

1. passou no validador sem falhas;
2. os dois extratores concordam em todos os campos do núcleo;
3. o revisor aprovou;
4. bate com o texto consolidado oficial, quando ele existe (quando não existe, recebe uma marcação e entra com prioridade na amostra de auditoria).

### 4.6 O que esperar do revisor

O revisor que compara as fichas com o modelo-base feito por humanos é a peça que mais reduz erro. Ele pega erros de **forma** (campo ausente, valor fora da lista), de **regra** (datas incoerentes) e de **evidência** (texto que não está no original).

O que pode escapar é o erro de **interpretação dentro de um campo válido**: o extrator e o revisor concordam numa leitura errada de uma cláusula de vigência complexa, por exemplo. Isso acontece justamente quando modelos parecidos compartilham o mesmo ponto cego. As três proteções contra isso são:

- o extrator independente roda com outro modelo, o que reduz pontos cegos em comum;
- a conferência contra textos consolidados oficiais funciona como uma referência externa;
- a auditoria amostral se concentra nas categorias de risco: vigência complexa, revogação por incompatibilidade, retificações e tabelas.

Cada erro encontrado vira um novo caso-modelo ou uma nova regra, e a categoria tende a desaparecer. A auditoria diminui com o tempo, mas é ela que permite afirmar a taxa de erro com números.

### 4.7 O papel humano que sobra

- **CAPTCHA:** só no último degrau da escada de acesso, uma pessoa resolve pelo celular (seção 5.6).
- **Pedidos formais de acesso** (LAI, ofícios, licenças) e decisões de negócio e jurídicas: Enzo, com o advogado do grupo quando preciso.
- **Infraestrutura:** Enzo aprova custos e credenciais; os agentes escrevem e operam a infraestrutura como código.
- **Auditoria amostral, pelos contadores do grupo:** 100 dispositivos sorteados no portão do M3, com no máximo 2% de erro; depois, uma amostra mensal concentrada nas categorias de risco.
- **Fila de escalonamento:** só o que os agentes não conseguiram reconciliar.
- **Canal dos contadores:** envio do que só circula fora das fontes oficiais (seção 5.5).

---

## 5. De onde as informações saem

### 5.1 Federal

| Fonte | O que traz | Observação |
| --- | --- | --- |
| [INLABS – Imprensa Nacional](https://github.com/Imprensa-Nacional) | DOU completo em PDF e XML | Livre e gratuito desde 1º de janeiro de 2020; principal fonte para atualização diária |
| [DOU no site da Imprensa Nacional](https://www.gov.br/pt-br/servicos/acessar-o-diario-oficial-da-uniao) | Edições anteriores para consulta | Disponíveis desde 1990 |
| Planalto (legislação compilada) | Textos consolidados com a redação antiga riscada e a indicação da norma alteradora | Referência para conferência e para reconstruir versões antigas |
| [normas.leg.br](https://www25.senado.leg.br/web/atividade/legislacao) | Versão vigente na data escolhida | Por enquanto, só para leis publicadas a partir de 2019 |
| [LexML](https://www.lexml.gov.br) | URN e metadados de normas federais, estaduais e municipais | Índice e identificador; o sitemap traz só URNs e datas, não o texto |
| Normas da Receita Federal | INs, Atos Declaratórios, Soluções de Consulta e de Divergência | Sem API; coleta automatizada |
| CARF | Acórdãos e súmulas | Sem API; coleta automatizada |
| CONFAZ | Convênios, ajustes SINIEF, protocolos | Vale para todos os estados; coletar uma vez |
| STF e STJ | Decisões com efeito sobre dispositivos (repercussão geral, repetitivos, controle concentrado) | Só as que afetam vigência ou eficácia entram na Ficha 6 |

### 5.2 Estadual: SP, MG, PR, SC e RS (mesmo roteiro para cada UF)

| Fonte | O que traz |
| --- | --- |
| Sefaz | RICMS e anexos consolidados, legislação de ICMS, ITCMD e IPVA, respostas a consultas |
| Diário Oficial do Estado | Decretos, resoluções e portarias publicados a cada dia |
| Assembleia Legislativa / Casa Civil | Leis estaduais |
| Tribunal administrativo tributário (ex.: TIT em SP) | Decisões e súmulas |

### 5.3 Municipal: capitais e municípios dos clientes do grupo (mesmo roteiro para cada município)

| Fonte | O que traz |
| --- | --- |
| Diário oficial do município | Leis e decretos de ISS, IPTU e ITBI, código tributário municipal |
| [Querido Diário](https://docs.queridodiario.ok.org.br/en/latest/what-is-it.html) | Diários oficiais municipais reunidos, com busca e API; cobertura parcial |
| Diários de associações de municípios | Em MG, [834 dos 853 municípios](https://agenciaminas.mg.gov.br/news/pdf/129743.pdf) publicam no Diário dos Municípios Mineiros: um coletor cobre o estado quase inteiro |
| Portal de legislação da prefeitura ou da câmara | Textos consolidados, quando existem |

Os demais municípios dos 5 estados entram por demanda.

### 5.4 Trabalhista e societário: sindicatos, Juntas e manuais

| Fonte | Conteúdo | Onde buscar |
| --- | --- | --- |
| Convenções e acordos coletivos | Pisos, reajustes, adicionais, contribuições, aditivos | Sistema Mediador do MTE (convenções depositadas, CLT, art. 614), com os sites dos sindicatos como complemento |
| Registro empresarial federal | Lei 8.934/1994, Decreto 1.800/1996, Instruções Normativas do DREI | DREI/gov.br, Planalto |
| Juntas Comerciais (JUCESP, JUCEMG, JUCEPAR, JUCESC, JUCISRS) | Deliberações, portarias, ofícios circulares, enunciados, tabelas de preço | Sites das Juntas e DOEs |
| Manuais oficiais | eSocial, SPED (EFD, ECD, ECF), NF-e, Perguntas e Respostas da RFB, Portaria MTE 671/2021, circulares da Caixa sobre FGTS, resoluções do CFC | Portais oficiais |

No lançamento, Juntas e manuais entram completos nos 5 estados; convenções, nas categorias dos clientes dos escritórios do grupo, e as demais por demanda. Cada convenção tem vigência, data-base e aditivos, e a resposta usa a que valia na data do fato.

### 5.5 O coletor e o canal dos contadores

O coletor é um programa comum, e a IA só entra no fim (detalhes no [Plano de desenvolvimento](Plano_MVP_6_meses.md), seção "O coletor"):

1. **Cadastro das fontes, uma vez:** as páginas de publicação de cada órgão, sindicato e Junta. O Haiku sugere e o fundador confirma.
2. **Visitas agendadas:** órgãos e Juntas diariamente, sindicatos 1 a 2 vezes por semana; pedido HTTP simples, sem login, respeitando o robots.txt e com intervalo entre pedidos.
3. **Detecção de mudança sem IA:** links e PDFs novos, hash, data de alteração, RSS ou sitemap. Nada mudou, nada mais é feito.
4. **Só o documento novo vai à IA:** extração do texto ou OCR aberto, classificação pelo Haiku (tipo, categoria, vigência) e, daí em diante, o caminho da seção 4.3. Documento do site do sindicato que ainda não está no Mediador fica marcado como "publicado, ainda não registrado".
5. **Saúde das fontes:** página que sumiu ou mudou de estrutura vai para o painel como "fonte quebrada" (agente mantenedor).
6. **Canal dos contadores:** o que só circula em redes sociais ou WhatsApp é enviado pelos playtesters, por e-mail ou upload. O sistema registra quem enviou e de onde veio, e o documento passa pela mesma validação.

### 5.6 Fontes fechadas: escada de acesso

Quando uma fonte tem barreira (documento pago, restrito ou atrás de CAPTCHA), sobe-se esta escada, na ordem:

1. **API ou serviço oficial:** INLABS, LexML, Querido Diário.
2. **Outra fonte oficial do mesmo ato:** convênio no DOU, decreto no diário do estado, convenção no Mediador.
3. **Lei de Acesso à Informação** ao órgão público que guarda o documento (o MTE guarda as convenções; o sindicato, como entidade privada, não está sujeito à LAI).
4. **Ofício ou convênio** com Sefaz, tribunal ou prefeitura.
5. **Licença ou parceria** com o sindicato ou a editora, quando a obra é protegida. Sem licença, a resposta traz o dado e a citação, com link para a fonte, sem republicar o documento.
6. **Humano no circuito, pelo celular (último recurso, para fonte com CAPTCHA):**
   - o coletor esbarra no CAPTCHA e pausa;
   - chega um aviso no painel e no Telegram (ou Discord/WhatsApp) com um link de uso único, que expira em minutos;
   - o link abre a página do site ao vivo no celular: o navegador roda no nosso servidor, e o celular só mostra a tela e repassa os toques;
   - a pessoa resolve ali (um toque no "não sou robô" ou as imagens);
   - o cookie ou token fica no navegador do servidor, e a coleta segue, reaproveitando a sessão para os demais documentos daquela fonte.

   Quem resolve o CAPTCHA é sempre uma pessoa; não há resolução automática. Tudo fica registrado no painel (quem, quando, qual fonte).

**Direitos autorais:** textos de leis, decretos e decisões não são protegidos por direito autoral (Lei 9.610/1998, art. 8º, IV), mas compilações e comentários de editoras são. Coletar sempre da fonte oficial. Cartilhas e manuais de sindicato e normas ABNT só entram com licença. Certidões e cópias de atos de empresas vendidas pelas Juntas não entram: não são norma e trazem dados pessoais. Se a convenção coletiva se enquadra como ato oficial é questão para o advogado do grupo; a resposta define se mostramos o texto ou só o dado com a citação.

---

## 6. Ordem de execução

As fases seguem o cronograma de 6 meses do [Plano de desenvolvimento](Plano_MVP_6_meses.md), com lançamento no M7.

### Fase 0 — Modelagem e piloto (M1)
- Rascunho v0 das 6 fichas e dos 3 artefatos, feito por Enzo com agentes de programação.
- Amostra-piloto de 300 documentos e protocolo de congelamento (seção 3.5), com os contadores do grupo.
- **Portão:** núcleo congelado como v1.0 antes de carregar os estados.

### Fase 1 — Infraestrutura e esqueleto agêntico (M1)
- Repositório de originais, banco de fichas (modelo de dados temporal: dispositivo, 3 datas, URN LexML), consolidador, fila de trabalho.
- Orquestrador e os agentes da seção 4.2, rodando ponta a ponta em **uma** fonte (INLABS).
- **Portão:** um documento percorre todas as etapas e chega à produção com rastreabilidade completa.

### Fase 2 — Federal (M1)
- Ingestão por programa (Planalto, LexML, INLABS), com o Haiku só onde o programa falha.
- Ordem: CF e CTN → LC 87, LC 116, LC 123 e resoluções do CGSN, LC 214 → leis de PIS/Cofins, IRPJ/CSLL e IPI → regulamentos (RIR, RIPI) → INs da RFB → Soluções de Consulta COSIT → súmulas e acórdãos do CARF → convênios do CONFAZ → CLT, legislação previdenciária, Lei 8.934 e DREI.
- Janela: últimos 10 anos com profundidade total; legislação ainda vigente mais antiga entra com a versão atual e o histórico disponível no Planalto.
- **Portão:** federal carregado com versões por dispositivo e conferência contra o Planalto acima da meta.

### Fase 3 — Estados e municípios (M2 e M3)
- **M2:** SP e MG, com as Juntas dos dois estados.
- **M3:** PR, SC e RS, com as Juntas do Sul; municípios (capitais e onde os escritórios do grupo têm clientes); coletor no ar; convenções das categorias do grupo, começando por SP e MG.

Para cada estado, na ordem:
1. RICMS e anexos (incluindo as tabelas de substituição tributária).
2. Leis e decretos de ICMS, ITCMD e IPVA.
3. Respostas a consultas da Sefaz.
4. Decisões e súmulas do tribunal administrativo.
5. Capital: ISS, IPTU e ITBI.
6. Municípios onde os escritórios do grupo têm clientes.

**Portão por estado:** conferência contra o RICMS consolidado da Sefaz acima da meta antes de passar ao próximo. **Portão do M3:** 5 UFs carregadas e auditoria de 100 dispositivos com no máximo 2% de erro.

### Fase 4 — Convenções, canal dos contadores e operação contínua (M4 a M6)
- **M4:** convenções do Sul; canal de envio dos contadores; a busca ao vivo (MCP) passa a alimentar a fila de ingestão.
- **M5 e M6:** atualização diária em regime de produção (meta de menos de 24 horas do DOU à base); municípios e categorias novos por demanda dos playtesters; auditoria mensal.
- **Portão do M6:** base em produção com as métricas da seção 7 dentro da meta.

Outros estados ficam como expansão futura, se houver demanda: mesmas fichas e mesmo roteiro da Fase 3, só os coletores são novos.

---

## 7. Métricas de controle

| Métrica | O que mostra |
| --- | --- |
| Taxa de erro auditada, por categoria | Qualidade real da base; orienta onde reforçar regras e casos-modelo |
| Cobertura por esfera, UF e período | Quanto da legislação relevante já está na base |
| Tamanho da fila de escalonamento | Se os agentes estão melhorando com o tempo |
| Taxa de concordância entre extratores | Saúde do processo de extração |
| Divergências contra fontes consolidadas | Erros detectados antes da produção |
| Custo por documento processado | Eficiência; orienta o uso de modelos pequenos e grandes |
| Tempo entre a publicação e a entrada em produção | Atualidade da base (meta: menos de 24 horas para o DOU) |
| Fontes quebradas e CAPTCHAs pendentes | Saúde dos coletores |

---

## 8. Riscos principais

| Risco | Mitigação |
| --- | --- |
| Núcleo das fichas mal desenhado | Partir de LexML e Akoma Ntoso; piloto de 300 documentos; critério de congelamento rigoroso |
| Erro de interpretação aprovado por agentes que concordam entre si | Extrator independente com outro modelo; conferência com textos consolidados; auditoria por categoria de risco |
| Site de fonte muda e o coletor quebra | Agente mantenedor; painel de fontes quebradas; alertas de queda de volume |
| Fonte com CAPTCHA, documento pago ou restrito | Escada de acesso (seção 5.6): API oficial, outra fonte oficial, LAI, ofício ou convênio, licença e, por último, humano no circuito pelo celular |
| Convenção coletiva protegida por direito autoral | Parecer do advogado do grupo; até lá, responder com o dado e a citação, com link para a fonte |
| Custo de processamento alto | Detecção de mudança sem IA; triagem com modelo pequeno; orçamento por fonte; controlador de custos |
| Retificações não ligadas ao ato original | Regra de validação específica; categoria prioritária na auditoria |
| Municípios sem diário estruturado | Priorizar diários de associações e o Querido Diário; capitais primeiro |

---

## 9. Checklist do que providenciar

- [ ] Contadores do grupo que participam da modelagem, do piloto e da auditoria; advogado do grupo para as questões jurídicas
- [ ] Rascunho v0 das 6 fichas (Norma, Dispositivo e versão, Evento normativo, Tabela normativa, Interpretação oficial, Decisão)
- [ ] Vocabulário controlado
- [ ] Taxonomia de temas
- [ ] Manual de preenchimento com 60 a 80 casos-modelo
- [ ] Amostra-piloto de 300 documentos, conforme a composição da seção 3.5
- [ ] Meta de concordância para o congelamento (sugestão: 98%)
- [ ] Infraestrutura: armazenamento de originais, banco de dados, fila de trabalho, agendamento
- [ ] Cadastro das fontes do coletor (órgãos, sindicatos e Juntas dos 5 estados)
- [ ] Navegador no servidor e bot do Telegram para o humano no circuito
- [ ] Escolha dos modelos de IA (pequeno para triagem; dois modelos diferentes para os extratores)
- [ ] Limites de gasto conforme o orçamento do Plano de desenvolvimento (limite mensal no console da API, alerta no RunPod)

---

## Fontes

- [Plano de desenvolvimento (6 meses) e lançamento](Plano_MVP_6_meses.md)
- [INLABS – Imprensa Nacional (GitHub)](https://github.com/Imprensa-Nacional)
- [Acessar o Diário Oficial da União – gov.br](https://www.gov.br/pt-br/servicos/acessar-o-diario-oficial-da-uniao)
- [Legislação – Senado Federal (normas.leg.br)](https://www25.senado.leg.br/web/atividade/legislacao)
- [LexML Brasil](https://www.lexml.gov.br)
- [O que é o Querido Diário](https://docs.queridodiario.ok.org.br/en/latest/what-is-it.html)
- [Diário dos Municípios Mineiros – Agência Minas](https://agenciaminas.mg.gov.br/news/pdf/129743.pdf)

---

## Adendo: consolidação dos planos (15/11/2026)

Decisões e desenhos mais novos que este documento, achados nos branches do Heild e trazidos para os planos na consolidação de 15/11/2026 (registro em [ATUALIZACOES.md](ATUALIZACOES.md)). Cada item cita a fonte. Onde um item substitui o texto acima, o texto acima fica como histórico e vale o que está aqui; o que ainda depende do Enzo vem marcado com o número da divergência (D1 a D10) daquele registro.

### Fontes de acesso (15/11/2026)

Fonte: [`apis/CATALOGO_CONTABIL.md`](apis/CATALOGO_CONTABIL.md), 8 (branch `wf-backend-apis`). Conferido em 15/11/2026: o **LexML barrou acesso automatizado** com verificação antirrobô e o **INLABS** da Imprensa Nacional estava em manutenção. A URN do LexML continua como padrão de identificação (princípio 2), mas a coleta automática por ele não é garantida. Recomendação pendente com o Enzo (Q8 do plano de APIs): pedir acesso formal ao Senado e à Imprensa Nacional e, se não sair, avaliar um agregador comercial de legislação, com a frente de IA escolhendo.

### Revisão pela IA e as correções da seção 25 do Plano Municipal (9/11/2026)

O [Plano Municipal](Plano_Base_Legislacao_Municipal.md) v0.4 (9/11/2026) registrou, na seção 25, correções a este plano que não tinham sido aplicadas. A decisão do Enzo de 9/11/2026 (Municipal, 13: revisão pela IA, não por pessoas, em toda a ingestão, federal, estadual e municipal) **substitui** os trechos abaixo; o texto acima fica como histórico. Fontes: Plano Municipal, seções 4, 6, 13, 15 e 25; branch `claude/zealous-wright-fvok37`, `apresentacoes/raciocinio/src/dados.js` (slides 10, 24 a 27 e 30), resumidos em [raciocinio/README.md](raciocinio/README.md).

| Onde | Texto de hoje | Passa a valer |
| --- | --- | --- |
| 3.5 (congelamento) | "concordância entre agentes e contadores acima da meta"; os contadores preenchem 60 documentos à mão | Concordância entre extratores de famílias diferentes e contra o ouro, sem preenchimento manual pelos contadores |
| 4.5 (portões) e passo 7 | sem acordo dos dois extratores, "a ficha vai para a fila humana" | Divergência que persiste vira rótulo de certeza baixa: o evento não entra no texto, e a certeza aparece no nível de cobertura. Não há fila humana |
| 4.6 e agente "Auditor amostral" | auditoria amostral humana nas categorias de risco | Ouro reservado, que o processo nunca vê, e reportes dos usuários confirmados na publicação oficial |
| 4.7 (papel humano) e Resumo | contadores fazem a auditoria por amostragem; fila de escalonamento | Papel humano restrito a CAPTCHA, pedidos de LAI, convênios e decisões de negócio. O canal dos contadores continua como fonte de material |
| Agente Revisor | "Modelo grande", sem família | Revisor final de uma **terceira família**, que julga sem saber quem propôs o quê |
| Resumo, 5.2 e Fase 3 | estadual em 5 UFs (SP, MG, PR, SC e RS); "Portão do M3: 5 UFs carregadas" | Estadual nas **27 UFs** |
| Resumo e 5.3 | municipal: "capitais e municípios dos clientes do grupo" | Municípios fáceis primeiro e os demais sob demanda, com nível de cobertura C0 a C4 por ente e domínio |
| Resumo (janela) | "os últimos 10 anos", para tudo | **10 anos no federal, 5 anos no estadual e no municipal** (Municipal, decisão 4); a janela do federal no jurídico está em D5 de [ATUALIZACOES.md](ATUALIZACOES.md) |
| 5.3, Minas Gerais | linha em "Diários de associações de municípios" | Os 834 municípios mineiros publicam no caderno "Diário dos Municípios Mineiros" do jornal Minas Gerais (Imprensa Oficial, Decreto Estadual 48.175/2021); a AMM tem outro diário, no SIGPub (Municipal, 4.3) |

Acréscimos:

- **Por que o princípio 4 não muda.** Num teste com 908 pares de lei alemãs, a consolidação feita por modelo teve 93% a 99% de semelhança com o texto oficial, mas só 50,3% de acerto exato numa alteração e 20,51% em cadeias (Prior et al., NLLP 2025). Slide 10; Municipal, 11.2.
- **Laço de melhoria da ingestão (novo).** Instruções dos extratores e do reconciliador, montador de cadeia, segmentador e limiares competem contra o ouro escondido, fora da produção, num laço inspirado na DGM; o validador, o consolidador, a base, o ouro e as funções de medida ficam trancados (Municipal, 15). Slide 30.
- **"Três datas" (nomenclatura).** As três datas de cada versão deste plano (publicação, vigência, eficácia) descrevem a redação; as três datas do direito no JU-04 (fato, ato, hoje) escolhem qual redação usar.

### Respostas do Enzo ao plano de APIs e decisões do mesmo dia (15/11/2026)

Fonte: [apis/PERGUNTAS.md](apis/PERGUNTAS.md) (branch `wf-backend-apis`, commit f9451f8, 15/11/2026), que registra as respostas a Q1 a Q10 e as decisões posteriores do mesmo dia. **Revê** o que o item anterior deste adendo dizia sobre as perguntas "pendentes".

Resposta a Q8: tentar de novo. No teste de 15/11/2026, a **API de legislação do Senado funcionou sem cadastro** e serve à legislação federal; a busca SRU do LexML continua atrás de um desafio antirrobô em JavaScript (não contornado); o INLABS segue em manutenção e pede um cadastro gratuito da Heild, que o Enzo faz quando a manutenção acabar ([`apis/CATALOGO_CONTABIL.md`](apis/CATALOGO_CONTABIL.md), 8).
