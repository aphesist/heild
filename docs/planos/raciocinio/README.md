# O raciocínio do Consultor

Como o Consultor e o motor legal chegam a uma resposta sobre a lei: a norma certa, na redação que valia na data do fato, com o trecho citado e conferido. Sem base, ele diz que não encontrou.

Este resumo junta o que está espalhado em cinco planos e na apresentação "O raciocínio do Consultor" (33 slides, 9/11/2026, branch `claude/zealous-wright-fvok37`, `apresentacoes/raciocinio/`). Trazido para os planos na consolidação de 15/11/2026. Não decide nada novo: cada seção diz de onde vem e onde o plano detalha. Quando dois documentos divergem, vale o mais recente, e a divergência fica marcada em "Pendências".

| Plano | O que detalha |
|---|---|
| [Plano do Assistente](../Plano_Assistente_de_IA_para_Contadores.md) | As quatro camadas, a cascata, o guia das técnicas, a DGM |
| [Plano de Ingestão](../Plano_de_Ingestao_da_Base_Legal.md) | Fichas, princípios da base, agentes, fontes |
| [Subplano 07](../subplanos/07-Motores-e-Consultor.md) | `legal.consultar`, o M3 Cálculo, a verificação, a abstenção, os modos, o benchmark |
| [JU-04](../subplanos/juridico/JU-04-Motor-Juridico-e-Base-de-Leis.md) | O que muda no jurídico: três datas, precedente, divergência, abstenção ampliada, OAB |
| [Plano Municipal](../Plano_Base_Legislacao_Municipal.md) (v0.4) | Cobertura C0 a C4, revisão pela IA, limite da concordância, blocos e pacotes, laço da ingestão |

Nos slides, a numeração é a de `apresentacoes/raciocinio/src/dados.js`.

## 1. As quatro camadas

A lei fica fora do modelo. O Consultor não responde de memória: lê uma base legal organizada no tempo, que se audita. Saiu norma nova, atualiza-se a base, não o modelo.

1. **Base legal no tempo:** a fonte da verdade. Cada dispositivo com todas as redações e o grafo de relações.
2. **Consultor (agente de resposta):** entende, pesquisa, confere e responde. A pergunta chega com a data do fato; volta só a redação vigente naquele dia, com o identificador do trecho.
3. **Busca ao vivo:** vai às fontes oficiais quando a base ainda não tem a norma. O que traz sai marcado "ainda não validado" e entra na fila de ingestão.
4. **Melhoria contínua, fora da produção:** as respostas avaliadas descem para a melhoria; só volta ao ar a versão que vence a prova e que uma pessoa aprova.

De onde vem: slide 8; Plano do Assistente, "Arquitetura geral" e Camadas 1 a 4.

## 2. A base no tempo

**Cada dispositivo, todas as redações.** A unidade é o dispositivo (artigo, parágrafo, inciso, alínea), com identificador URN do LexML que não muda e a lista de redações: quando começou, quando terminou e qual norma causou a mudança. Revogado não some: fica com a data em que deixou de valer. Exemplo: o § 3º do art. 58 da CLT, acrescido pela LC 123/2006 e revogado pela Lei 13.467/2017. Slide 9; Assistente, Camada 1; Ingestão, princípio 2.

**O texto compilado é calculado.** A IA não escreve a lei compilada. Registra eventos (nova redação, acréscimo, revogação), cada um com o trecho literal que o prova, e um programa os aplica em ordem de eficácia. Quando um modelo consolida sozinho, o texto parece certo (93% a 99% de semelhança) e erra a redação exata na metade das vezes: 50,3% de acerto numa alteração e 20,51% em cadeias (Prior et al., NLLP 2025, 908 pares de leis alemãs). Slide 10; Ingestão, princípios 4 e 5; Municipal, 11.2 e 11.3.

**No direito, três datas.** A lei material segue a data do fato; a processual, a data do ato; o precedente vale pelo que vincula hoje. A resposta diz qual data usou em cada parte. Exemplos conferidos: horas de trajeto (CLT, art. 58, § 2º, corte em 11/11/2017); prazo (CPC/1973, art. 178, contínuo; CPC/2015, art. 219, dias úteis, desde 18/03/2016); precedente (Tema 23 do TST, 25/11/2024). Slide 11; JU-04, 2.1 e R-J1.

Não confundir com as três datas de cada versão no Plano de Ingestão (publicação, início de vigência, início de eficácia), que descrevem a redação; as do direito escolhem qual redação usar.

**O grafo de remissões.** Quem altera, quem regulamenta, quem julga, quem remete a quem. A relevância parte dos dispositivos achados e se espalha pela rede num passo só (PageRank personalizado). As arestas são as da base, não extraídas por modelo. O ganho de 10 a 30 vezes no custo e de 6 a 13 no tempo, contra a busca em rodadas (IRCoT), é do HippoRAG 1; o HippoRAG 2 mede cerca de 7% em memória associativa. O grafo só liga se vencer no benchmark; até lá, remissões de um salto. Slide 12; Assistente, Camada 1 e guia das técnicas; 07, 3.7; Municipal, 12 e 15.

## 3. A cascata

Do barato ao caro. Código, índices e modelos pequenos fazem quase tudo; o modelo principal entra uma vez, no fim, e lê só os poucos trechos que sobram, na redação da data. A cascata roda inteira dentro da ferramenta `legal.consultar`.

| Etapa | Quem faz | O que sai |
|---|---|---|
| 1 · Entender | modelo barato | Tema, área, norma, lugar, data do fato |
| 2 · Cache | embedding | Resposta já validada, só se as normas citadas seguem vigentes |
| 3 · Vigência | código | Só o que valia na data: esfera, ente, redação |
| 4 · Palavras e significado | índices | BM25 e busca multivetorial, fundidas numa lista |
| 5 · Grafo | código | Remissões, regulamentação, interpretação, decisões |
| 6 · Revisor | modelo pequeno | De uns 50 candidatos, 5 a 10 trechos, cada um com o motivo |
| 7 · Redação | modelo principal | Resposta direta primeiro, depois o fundamento |
| 8 · Verificação | código e modelo barato | Cada afirmação contra o trecho |
| 9 · Saída | código | Grau de segurança, ou abstenção |

De onde vem: slide 13; 07, 3.1 (a versão em vigor, com a busca ao vivo como 7'); o Plano do Assistente descreve sete etapas com a árvore de temas na frente, hoje atrás de chave (07, 3.7).

**Entender antes de buscar.** Tema, área, datas e lugar saem da pergunta. Se falta um dado que muda a resposta, ele pergunta de volta em vez de supor. No jurídico, pergunta a data do fato só se a lei material mudou entre as datas possíveis; se não mudou, responde e diz qual data considerou. Slide 14; Assistente, fluxo, passo 1; JU-04, 2.1.

**O filtro de vigência é código.** Antes de procurar qualquer palavra, o banco separa só o que valia na data. O que não valia nem entra no caminho. É o que desarma as armadilhas das versões e das revogações: o texto revogado continua publicado e continuaria aparecendo numa busca comum. Slides 7 e 15; 07, 3.1, etapa 3; JU-04, 2.1.

**Palavras e significado.** A busca por palavras (BM25) acha o número da lei, o CFOP, a sigla. A busca por significado, com um vetor por termo, acha "receita bruta" quando o cliente diz "faturamento"; na ingestão, cada dispositivo ganha as perguntas que responde. As duas listas são fundidas pela posição de cada item (reciprocal rank fusion). Um vetor só por documento tem limite matemático (LIMIT, ICLR 2026). Slide 16; Assistente, guia das técnicas.

**O revisor que diz por quê.** O revisor lê cada candidato, decide e anota o motivo, que fica registrado e auditável. Exemplo: o § 5º-J sai porque "vale para as atividades do § 5º-I, não para a odontologia". O Rank1 foi destilado de raciocínios em inglês; para a lei brasileira precisa de nova destilação em português e só entra se vencer o reranqueador por API. Slide 17; 07, 3.7 e 9.4; Municipal, 15.

**A conta fora do modelo.** Fator R, alíquota, juros e prazo saem de funções em código, com tabelas versionadas pela data. As entradas vêm de registros lidos e cada número carrega a origem. A explicação é escrita depois, a partir dos passos, sem ver a pergunta. No jurídico, a data final de um prazo sai da função de prazo, com a memória de cálculo; prazo fatal tem conferência humana. Slide 18; 07, 5.1 e 5.6; JU-04, 2.5, 2.6 e R-J4.

**Os modos.** Perguntar, parecer, pesquisa de jurisprudência, revisão de contrato, vigilância e segunda opinião usam a mesma base, a mesma conferência e a mesma abstenção. Na vigilância, o predicado que escolhe os casos afetados inclui a data do fato: lei nova só afeta fato posterior. O Consultor nunca assina, protocola, dá ciência de intimação ou conta prazo de cabeça. Slide 19; 07, 8.1; JU-04, 4.1 e 4.5.

## 4. A confiança

**O verificador.** Depois de redigir, uma segunda etapa confere cada afirmação: o dispositivo existe, valia na data e diz o que a resposta afirma. Identificador e datas são conferidos por código; um modelo barato só classifica se o trecho sustenta a frase. Afirmação sem suporte é removida, e a remoção fica registrada para o benchmark. Número sem origem vira "valor não conferido". Slide 20; 07, 3.3 e 7; JU-04, 6.1.

**A abstenção.** Sem fundamento, o Consultor não completa com o que o modelo acha: diz o que pesquisou, o que faltou e o que dá para fazer. Tipos: sem base legal, data do fato necessária, divergência sem tese vinculante, precedente pendente, premissa falsa, sem base local (com o texto C0). A métrica pune os dois erros, inventar e calar quando havia resposta, porque avaliação que dá nota ao chute ensina o modelo a chutar (Kalai et al., 2025); a taxa de abstenção é publicada junto. Slides 7 e 21; 07, 7.4 e R-M3; JU-04, 2.7.

**A divergência.** Sem tese que vincule, o Consultor mostra cada posição com o órgão, a data, o estado e a força, e deixa a escolha com o advogado. Precedente superado nunca aparece como vigente. Exemplo: a base do ITBI numa compra de 2026, entre o Tema 1.113 do STJ (24/02/2022, RE pendente) e a LC 227/2026 (CTN, art. 38, §§ 1º a 4º). Slide 22; JU-04, 2.2, 2.4, R-J2 e R-J3.

**A responsabilidade.** A IA prepara; quem tem inscrição assina. O desenho segue a Recomendação 001/2024 do CFOAB, itens 2.2, 3.1 e 3.2: o conteúdo de um caso nunca sai do escritório; peça é rascunho até a revisão assinada; citação conferida no texto. Nunca sugere aval da OAB nem que substitui o advogado. No contábil vale o mesmo: a decisão e a assinatura são do contador. Slide 23; JU-04, R-J5 a R-J7 e 5.7; Assistente, "Riscos e salvaguardas".

**O grau de segurança.** É o menor entre o grau da afirmação, a certeza da versão citada e o nível de cobertura do ente. Slide 25; Municipal, 14.1.

## 5. A base municipal

**O desafio.** Federal e estadual têm serviços abertos ou um coletor por fonte; no município, cada um publica do seu jeito e quase nenhum mantém texto compilado. Em outubro de 2026, os diários municipais de SC tiveram 97.180 publicações, 6.319 leis e decretos e 230 atos com tema tributário; 22,9% das leis revogam "as disposições em contrário" sem dizer quais, e 4,3% marcam a nova redação com "(NR)". Janelas: 10 anos no federal, 5 no estadual e no municipal. Slide 24; Municipal, 2 e 3.

**Os níveis de cobertura C0 a C4.** Cada ente e cada domínio têm um nível: C0 sem base local, C1 só publicações novas, C2 texto atual sem histórico, C3 com histórico de 5 anos, C4 amplo. O rótulo aparece na citação e, quando limita a conclusão, na primeira linha da resposta. Os textos foram aprovados pelo dono em 9/11/2026. Coletor parado rebaixa o nível sozinho. A alíquota da NFS-e Nacional aparece como parâmetro, nunca como lei. Não confundir com os níveis de maturidade N0 a N4 dos pacotes jurídicos. Slide 25; Municipal, 8 e 14.

**A revisão pela IA.** Padrão em toda a ingestão, federal, estadual e municipal (decisão do dono, 9/11/2026). Dois modelos de famílias diferentes leem cada ato sem ver um ao outro; o código compara e confere que a evidência existe literalmente no original; a reconciliação só olha os campos divergentes; regras em código validam; um revisor de uma terceira família julga sem saber quem propôs o quê; o código consolida; tudo é conferido contra o ouro automático. Divergência que persiste não vai para uma pessoa: o evento não entra no texto e a certeza baixa aparece no rótulo. Slide 26; Municipal, 13.1 a 13.4.

**O limite da concordância.** Modelos diferentes erram juntos: quando dois erravam, davam a mesma resposta errada em 60% dos casos, num dos conjuntos (Kim et al., ICML 2025, mais de 350 modelos). Por isso a concordância é só uma das travas: evidência literal, famílias às cegas, consolidação em código, ouro reservado, NFS-e como segunda fonte, reportes dos usuários confirmados na publicação oficial e certeza no rótulo. O erro é medido contra uma parte do ouro que o processo nunca vê. Slide 27; Municipal, 13.5 e 13.6.

**Blocos e pacotes.** A base é feita de 30 blocos, cada um construído e revisado uma vez, com as suas camadas, o seu coletor, a sua cobertura e a sua vigilância. Os pacotes (Contábil, BPO e cada área jurídica) dividem os mesmos blocos, inteiros ou em fatia. Do lançamento contábil e BPO, Tributário e Empresarial saem quase prontos, e Trabalhista e Previdenciário com a parte material pronta: cerca de 30% dos advogados (estimativa do plano). Slide 28; Municipal, 6.

## 6. A melhoria

**Cada correção vira prova.** Quem usa marca "correta" ou "incorreta" e corrige; a correção revisada vira caso de teste, com a data e os dispositivos a citar. Uma parte do benchmark fica reservada e nunca é vista pelo que evolui. Métricas: conclusão, citação, vigência, abstenção nos dois sentidos. Metas: zero citação inexistente, zero precedente superado citado como vigente, menos de 17% de respostas erradas ou mal fundamentadas nos pacotes grandes. No jurídico, os casos são escritos por advogados do grupo em duplo cego, nunca com dados de clientes. Quando uma norma citada muda, o caso volta para revisão. Slide 29; Assistente, Camada 4; 07, 9; JU-04, 6.2 e 6.3.

**O laço inspirado na DGM.** Variantes do método fazem a mesma prova; só entra no arquivo a que passa, e as fracas ficam guardadas, porque às vezes o salto vem delas. Os modelos ficam congelados; muda o código ao redor. No artigo, 80 iterações levaram o SWE-bench de 20,0% a 50,0%, e uma rodada custou cerca de duas semanas e US$ 22 mil; por isso a Heild roda um laço inspirado nela, não a DGM inteira. São dois laços, ambos fora da produção: o do Consultor e o da ingestão, este contra o ouro escondido. Nenhuma versão vai ao ar sem uma pessoa aprovar. Slide 30; Assistente, Camada 4; 07, 9.4; Municipal, 15.

**A burla da métrica.** No artigo da DGM, uma variante apagou o registro dos marcadores que denunciavam o uso inventado de ferramentas e passou no detector sem resolver o problema. Por isso ficam fora da área editável a base legal, as funções de cálculo e as tabelas, a verificação, o ouro e as funções de medida, as permissões e os limites. Se a variante não vencer a versão de partida no conjunto reservado, fica desligada e o custo não muda. Slide 31; 07, 9.4 e R-M8; Municipal, 13.5 e 15.

## Pendências

Os adendos de 15/11/2026 levaram as correções aos planos (Assistente, Ingestão, Plano de 6 meses, 07, JU-04 e Municipal); o registro está em [`../ATUALIZACOES.md`](../ATUALIZACOES.md). O que precisa do Enzo segue abaixo, como D5 a D7 daquele registro.

- **Plano do Assistente:** ainda descreve a cascata de sete etapas, põe a verificação na área editável da DGM (contra o 07, 9.4) e atribui o "10 a 30 vezes" ao HippoRAG 2.
- **Fator R:** o 07, 5.4, cita o § 5º-J para a folha e para a odontologia; o certo é o § 24 para a folha e o § 5º-M, I, com o § 5º-B, XX, para a odontologia. Desde 01/01/2027 a janela do § 5º-K muda (LC 214/2025, art. 517).
- **Correções da seção 25 do Plano Municipal:** nenhuma foi levada ao Plano de Ingestão, ao Plano do Assistente, ao Plano de 6 meses nem ao JU-04.
- **Para o Enzo:** a janela do federal no jurídico (10 anos ou desde a origem); a lista final do que o laço da DGM pode mudar; o papel do especialista jurídico depois da revisão pela IA; o preço por pacote de blocos no lugar do módulo de lei.
