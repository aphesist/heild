# Roteiro de falas: Enzo Vasconcelos

Assistente de IA para contadores · 5 de novembro de 2026 · 65 slides · plateia: donos de escritórios contábeis pequenos e médios, possíveis playtesters e financiadores dos 6 meses de desenvolvimento.

---

## Como usar

**Duas durações no mesmo texto.**

- **Versão curta (~28 min, a meta do evento):** diga só as frases em **negrito** de cada FALA e dê todos os cliques mesmo assim (os builds precisam passar). Lidas em sequência, as frases em negrito contam a história inteira.
- **Versão completa (~69 min + perguntas):** diga a FALA inteira.

**O tom.** Frases curtas. Uma ideia por vez. Diga o número e pare. Contraste sempre "o jeito de hoje" com "o nosso jeito". Deixe o clique fazer a revelação: fale depois que a coisa aparece, não antes. Entusiasmo de quem construiu, não de quem vende. O "e tem mais uma coisa" aparece uma vez só, no slide 15. Não gaste antes.

**Legenda das marcações**

| Marcação | O que fazer |
| --- | --- |
| `[PAUSA]` | Pare 2 segundos. Respire. Deixe o número ou a frase assentar antes de seguir. |
| `[CLIQUE n]` | Dê o clique de número n do slide: entra o build seguinte. A numeração recomeça em cada slide e bate com os `data-step` dos arquivos em `src/slides/`. |
| `[AVANÇA]` | Último clique: passa para o próximo slide. |
| Texto em itálico entre parênteses | Indicação de cena, o que aparece na tela ou lembrete para o Enzo. Não se lê em voz alta. |
| **Negrito** | Ênfase na fala e, ao mesmo tempo, o texto da versão curta. |
| ⏱ | Tempo da versão completa · tempo da versão curta · número de cliques antes do `[AVANÇA]`. |
| Para você entender | Quadro no fim de cada slide, só para o Enzo. Não é para ser lido em voz alta. |

Contagem de cliques conferida em 5/11/2026 contra os 65 slides de `src/slides/` (10-, 15-, 20-, 30-, 40-), já com os 4 slides novos de `15-novo.html`. Nos 22 slides que têm analogia visual, ela entra no último clique, e a fala a diz exatamente nesse clique. Se os slides mudarem antes do ensaio, reconte:

```bash
cd apresentacao && python3 -c "
import re,glob
n=0
for f in sorted(glob.glob('src/slides/*.html')):
    for m in re.finditer(r'<section class=\"slide[^\"]*\"(.*?)>(.*?)</section>',open(f).read(),re.S):
        n+=1; t=re.search(r'data-title=\"([^\"]*)\"',m.group(1))
        print(n, t.group(1) if t else '?', len(set(re.findall(r'data-step=\"(\d+)\"',m.group(2)))))"
```

### Tempo por seção

| # | Seção | Slides | Completa | Curta |
| --- | --- | --- | ---: | ---: |
| 1 | Abertura | 1–2 | 1:30 | 1:00 |
| 2 | O problema | 3–6 | 4:30 | 2:00 |
| 3 | Mercado e concorrentes | 7–9 | 3:00 | 1:00 |
| 4 | A solução | 10–12 | 3:30 | 1:30 |
| 5 | O que há de novo | 13–16 | 6:30 | 3:00 |
| 6 | Arquitetura em 4 camadas | 17–21 | 5:00 | 1:50 |
| 7 | A cascata de recuperação | 22–32 | 10:30 | 3:40 |
| 8 | Confiança e melhoria contínua | 33–36 | 4:40 | 1:40 |
| 9 | Ingestão da base legal | 37–47 | 10:00 | 3:00 |
| 10 | Visão agêntica e diferenciais | 48–49 | 2:30 | 1:00 |
| 11 | Segurança, LGPD e responsabilidade | 50–51 | 2:00 | 1:00 |
| 12 | Plano e investimento | 52–54 | 3:30 | 1:40 |
| 13 | GPU e custo por pergunta | 55–58 | 4:00 | 1:30 |
| 14 | Preço e escala | 59–62 | 3:30 | 1:30 |
| 15 | Riscos, aporte e encerramento | 63–65 | 4:00 | 2:30 |
| | **Total** | **65** | **~68:40** | **~27:50** |

Depois: 15 a 20 minutos de perguntas (seção no fim deste arquivo).

### Cinco dicas de palco para quem não é contador

1. **Quando não souber, devolva a pergunta ao grupo.** "Boa pergunta. Como vocês fazem isso hoje no escritório?" Eles são os especialistas, e você está ali para construir a ferramenta com eles, não para dar aula de tributação.
2. **Nunca improvise número nem artigo de lei.** Se o número não está no slide ou neste roteiro, diga: "Não tenho esse número aqui. Anoto e mando para vocês." É exatamente o que o produto promete: abstenção em vez de invenção. Faça no palco o que o sistema faz.
3. **Os exemplos dos slides são ilustrativos e foram conferidos, mas peça validação.** Frase pronta: "Esse exemplo foi conferido, mas quem dá a palavra final aqui são vocês."
4. **Fale na língua do escritório, não na da tecnologia.** Diga o nome técnico uma vez, logo depois a analogia, e daí em diante use só a analogia ("o revisor", "a gaveta", "o office boy").
5. **Assuma que é uma pessoa só.** Não esconda isso. A força da proposta é um escopo bem cortado, agentes de programação e o grupo de contadores medindo tudo. Dizer "eu" com tranquilidade passa mais confiança do que um "nós" vago.

---

## Seção 1 · Abertura

### Slide 1 · A lei certa, na data certa

⏱ 0:50 · curta 0:35 · cliques: 0

**FALA**

*(as três linhas sobem sozinhas; espere a terceira acender antes de falar)* [PAUSA]

Boa noite. **Eu sou o Enzo Vasconcelos. Sou desenvolvedor. Não sou contador.** [PAUSA] **E é exatamente por isso que estou aqui: vocês são os especialistas; eu construo a ferramenta.**

Uma cena que todo mundo aqui conhece. O cliente liga. Faz uma pergunta. Você sabe que a resposta existe. Mas em qual lei? Em qual redação? Já mudou? Aí começa a peregrinação: Planalto, Receita, Sefaz, um parecer antigo, o grupo de WhatsApp.

**Hoje eu vou mostrar como encurtar esse caminho.** Não com uma IA que "acha". **Com uma IA que responde pela lei que valia na data do fato e mostra, artigo por artigo, onde está escrito.** [PAUSA] Essas três linhas são a apresentação inteira. O resto é como fazer isso de verdade.

[AVANÇA]

> **Para você entender** · "Data do fato" é a data em que aconteceu o fato gerador (a venda, o serviço, o pagamento da folha). A regra que vale é a daquela data, não a de hoje. Todo contador trabalha com isso, mas nenhuma ferramenta de busca comum separa as redações por data.

### Slide 2 · 549.576 profissionais

⏱ 0:40 · curta 0:25 · cliques: 1

**FALA**

*(deixe o número subir sem falar)* [PAUSA]

**549.576.** [PAUSA] **É o número de profissionais da contabilidade registrados no Brasil, em outubro deste ano.**

[CLIQUE 1]

E cerca de 102 mil organizações contábeis. Mais da metade com 1 a 9 pessoas. Ou seja: o escritório de vocês. O dono que também é o especialista que pesquisa. **Eu não quero fazer escrituração, guia nem obrigação acessória. O sistema contábil já faz isso. Quero devolver o tempo que vocês gastam pesquisando e interpretando. O tempo mais caro do escritório.**

[AVANÇA]

> **Para você entender** · O sistema CFC/CRCs é o conselho federal e os conselhos regionais de contabilidade; o registro no CRC é o que permite assinar como contador. "Obrigação acessória" é tudo o que a empresa entrega ao fisco além de pagar o tributo (declarações, escriturações digitais). Isso é trabalho do ERP contábil, não nosso.

---

## Seção 2 · O problema

### Slide 3 · A regra muda toda semana

⏱ 1:00 · curta 0:30 · cliques: 1

**FALA**

*(as folhas caem e o número sobe até ~550)*

**Na nossa estimativa: cerca de 550 atos normativos novos por mês. Só nas fontes que importam para tributação.** [PAUSA] Leis, decretos, instruções normativas, resoluções. E por trás deles, dezenas de milhares de publicações em diário oficial que alguém precisa triar.

[CLIQUE 1]

Mas acompanhar não é o único problema. Chega a fiscalização, ou vocês revisam um período, e a pergunta muda: **qual regra valia naquela data?** A decadência é de cinco anos. Vocês precisam da redação de 2021, de 2022. Não a de hoje. **Pesquisar no Google é olhar o mapa de hoje para saber como era a cidade dez anos atrás.** Ele quase sempre mostra a redação atual.

[AVANÇA]

> **Para você entender** · Decadência é o prazo que o fisco tem para lançar (cobrar) um tributo: em regra, 5 anos (CTN, arts. 150, § 4º, e 173). Por isso uma fiscalização em 2026 pode olhar fatos de 2021. Os ~550 atos/mês são estimativa própria (pesquisa 02, § 6.4); diga sempre "na nossa estimativa".

### Slide 4 · Dois sistemas até 2033

⏱ 1:20 · curta 0:30 · cliques: 4

**FALA**

E por cima de tudo isso: a reforma tributária. Emenda 132, Lei Complementar 214. **Em cima, em cinza, o que existe hoje. Embaixo, o que entra.**

[CLIQUE 1] 2026: CBS e IBS só destacados na nota, em teste. 0,9% e 0,1%.

[CLIQUE 2] 2027: a CBS entra para valer. PIS e Cofins acabam. Corte seco. E começa o Imposto Seletivo.

[CLIQUE 3] De 2029 a 2032, ISS e ICMS descem: 90, 80, 70, 60%. O IBS sobe na mesma medida.

[CLIQUE 4] 2033: só IBS e CBS.

[PAUSA] **Uma pergunta sobre 2030 tem uma parte respondida pelo ICMS e outra pelo IBS. Quem responde com "a lei atual" erra metade.** Sete anos com dois livros de regras abertos na mesa.

[AVANÇA]

> **Para você entender** · CBS (Contribuição sobre Bens e Serviços) é federal e substitui PIS e Cofins. IBS (Imposto sobre Bens e Serviços) é de estados e municípios e substitui ICMS (estadual) e ISS (municipal). IS (Imposto Seletivo) incide sobre produtos prejudiciais à saúde ou ao meio ambiente. EC 132/2023 é a emenda da reforma; LC 214/2025 a regulamenta.

### Slide 5 · O preço de um erro

⏱ 0:50 · curta 0:25 · cliques: 1

**FALA**

Essa conta vocês conhecem melhor do que eu. *(a coluna se monta)* Tributo não recolhido, fiscalização encontra: vem o tributo, **mais 75% de multa de ofício, mais juros pela Selic.**

[CLIQUE 1]

[PAUSA] E tem um custo que não aparece no auto de infração: **o cliente que perde a confiança no escritório.** Então tudo o que eu vou mostrar gira em torno de uma ideia. **Uma resposta errada dita com confiança é pior do que nenhuma resposta.**

[AVANÇA]

> **Para você entender** · Multa de ofício é a aplicada quando o fisco descobre a falta (não quando o contribuinte confessa): 75% do tributo (Lei 9.430/1996, art. 44, I). Juros de mora pela taxa Selic (art. 61, § 3º). "Auto de infração" é o documento da autuação.

### Slide 6 · Por que a IA genérica erra

⏱ 1:20 · curta 0:35 · cliques: 2

**FALA**

*(o 78% sobe sozinho)* **78%.** [PAUSA] **É quanto dos contadores já usa IA pelo menos uma vez por semana, segundo a IOB com a Fenacon e o CFC, deste ano.** 53% todo dia. E 62% dizem que o próprio conhecimento de IA é básico. Vocês já usam. Só não sabem bem onde ela tropeça.

[CLIQUE 1]

Olhem essa resposta de um chat genérico. Fluente. Segura. Bem escrita. O ChatGPT aprendeu lendo a internet até uma certa data. Não sabe qual redação valia em 2022. Mistura lei antiga com lei nova. E, quando não sabe, escreve um artigo que parece verdadeiro.

[CLIQUE 2]

[PAUSA] **Lei revogada. Artigo inventado.** O Decreto 3.000 foi revogado em 2018, e aquele parágrafo não existe. **Ele não foi feito para dizer "não sei".** O balão é ilustrativo, mas são exatamente esses dois erros que eu quero eliminar.

[AVANÇA]

> **Para você entender** · O Decreto 3.000/1999 era o antigo Regulamento do Imposto de Renda (RIR/1999), substituído pelo Decreto 9.580/2018 (RIR/2018). Um contador experiente percebe o erro na hora; um estagiário pode copiar e colar. "Alucinação" é o nome técnico para quando a IA inventa algo com cara de verdade.

---

## Seção 3 · Mercado e concorrentes

### Slide 7 · 18 produtos, uma receita

⏱ 1:00 · curta 0:20 · cliques: 1

**FALA**

Antes de construir, olhei o mercado inteiro. *(os cartões caem e se organizam)* Editoras: IOB, Econet, Thomson Reuters. IA dentro do sistema contábil: Domínio, Questor, Makro, Alterdata. Startups tributárias. O chatbot da Receita. Duas IAs do mundo jurídico.

[CLIQUE 1]

**18 produtos. Uma receita só: pegam o modelo de IA de outra empresa, OpenAI, Google ou IBM, e colocam em cima do acervo próprio.** O diferencial anunciado é o acervo e a curadoria humana. [PAUSA] E quase ninguém mede precisão em público. A exceção é a Questor: 66% de respostas avaliadas como úteis. Uma startup diz 95%, sem dizer como mediu.

[AVANÇA]

> **Para você entender** · "Acervo" aqui é a coleção de legislação, artigos e pareceres que a editora mantém. "Curadoria humana" é gente revisando esse material. Não é ruim; só não resolve sozinho o problema da data e da citação conferida.

### Slide 8 · Quanto se paga hoje

⏱ 1:00 · curta 0:20 · cliques: 1

**FALA**

Quanto se paga hoje. *(os preços entram do mais barato ao mais caro)* Receita e Makro: grátis. Jus IA: de R$ 78,90, com 30 mensagens, a R$ 208,90 no ilimitado. ChatGPT Plus: R$ 99,90. A IA do Portal da Reforma: R$ 199 por mês, e só fala da reforma.

[CLIQUE 1]

[PAUSA] **A leitura é simples. O profissional já paga entre R$ 79 e R$ 250 por mês. O que falta não é preço. É poder confiar na resposta sem refazer a pesquisa.**

[AVANÇA]

> **Para você entender** · Preços por usuário, por mês, coletados entre setembro e outubro de 2026 (pesquisa 05). Vale guardar: o profissional já paga por consulta; a discussão não é "se" paga, é "pelo quê".

### Slide 9 · O espaço vazio

⏱ 1:00 · curta 0:20 · cliques: 1

**FALA**

Comparando o que cada grupo divulga, aparece um espaço vazio. *(as colunas se preenchem)* Responder pela redação válida numa data passada? Ninguém descreve; todos falam em "legislação vigente". Conferir a citação antes de entregar? Ninguém. Publicar precisão? Quase ninguém. Melhoria medida a cada ciclo? Ninguém.

[CLIQUE 1]

**A nossa coluna: um "sim" em cada linha.** [PAUSA] Uma ressalva honesta: "não divulgado" não quer dizer que não exista. Mas, se existe, ninguém está mostrando. **E mostrar é parte do nosso produto.**

[AVANÇA]

> **Para você entender** · Esta tabela compara o que é público, não o que cada empresa tem internamente. Se alguém da plateia usa um desses produtos e diz "o meu faz isso", a resposta certa é: "Ótimo, então me mostre como mede; é isso que eu quero publicar no nosso."

---

## Seção 4 · A solução

### Slide 10 · Em uma frase

⏱ 1:00 · curta 0:30 · cliques: 0

**FALA**

*(a frase se escreve sozinha; leia junto, sem pressa)*

**Uma frase: um consultor de IA que responde pela lei vigente na data do fato, prova cada afirmação e melhora a cada ciclo.** Tributário, contábil, trabalhista e societário.

Um detalhe que parece técnico. É o centro de tudo. [PAUSA] **A lei não fica decorada dentro da IA. Fica numa base de dados organizada no tempo, que dá para auditar. A IA só raciocina em cima dela.** Um consultor brilhante que nunca responde de memória: sempre abre o código na página certa.

[AVANÇA]

> **Para você entender** · Isso se chama RAG (recuperação + geração), explicado no slide 13. O nome do projeto, DGM-RAG-Contábil, vem daí: RAG mais DGM, a melhoria contínua dos slides 15 e 36.

### Slide 11 · Uma pergunta real

⏱ 1:00 · curta 0:30 · cliques: 1

**FALA**

Um caso do dia a dia. *(a pergunta é digitada; espere terminar)* **"Meu cliente desenvolve software, está no Simples. Em março de 2022 faturava R$ 12 mil por mês e tinha folha de R$ 3 mil. Ele estava no anexo certo?"**

Três coisas. Uma data no passado. Uma conta, o fator R. E ninguém falou "fator R" nem "Anexo V": falou do jeito que se fala no escritório.

[CLIQUE 1]

**Primeiro passo: entender. Tema, regime, data do fato, atividade. Antes de pesquisar qualquer coisa.** Se faltasse um dado que muda a resposta, ele perguntaria de volta. Como um bom sênior pergunta ao estagiário: "qual UF?".

[AVANÇA]

> **Para você entender** · Simples Nacional (LC 123/2006) é o regime unificado para empresas com receita de até R$ 4,8 milhões por ano: paga-se tudo numa guia só, o DAS. As atividades são divididas em cinco anexos, cada um com sua tabela de alíquotas (I comércio, II indústria, III a V serviços). Software pode cair no Anexo III (mais barato) ou no V (mais caro), dependendo do fator R.

### Slide 12 · A resposta, montada

⏱ 1:30 · curta 0:30 · cliques: 4

**FALA**

A resposta começa pelo que interessa. **Anexo V. 15,5% na primeira faixa.**

[CLIQUE 1]

O porquê. Folha de 12 meses, R$ 36 mil. Receita de 12 meses, R$ 144 mil. Dá 25%. Abaixo dos 28% do Anexo III. [PAUSA] **E essa conta não foi feita pela IA. Foi feita por uma calculadora, com a tabela daquela data. A IA só explica.**

[CLIQUE 2]

As citações. Lei Complementar 123, artigo 18, com o selo: vigente em março de 2022...

[CLIQUE 3]

...e a Resolução CGSN 140, também conferida. Existe, valia na data e diz o que a resposta afirma.

[CLIQUE 4]

E a dica de planejamento: **com R$ 3.360 de folha, o cliente ia para o Anexo III. 6%.** [PAUSA] **A resposta, a conta, a prova e a dica. Em segundos.** Esse exemplo foi conferido, mas quem valida são vocês.

[AVANÇA]

> **Para você entender** · Fator R = folha de salários dos últimos 12 meses (inclui pró-labore e encargos como CPP e FGTS) ÷ receita bruta dos últimos 12 meses. Se ≥ 28%, certas atividades de serviço vão para o Anexo III; se < 28%, para o Anexo V (LC 123, art. 18, §§ 5º-D e 5º-M). 28% de R$ 12 mil = R$ 3.360. CGSN é o Comitê Gestor do Simples Nacional, que regulamenta o regime por resoluções.

---

## Seção 5 · O que há de novo

### Slide 13 · Prova com consulta (RAG)

⏱ 1:40 · curta 0:45 · cliques: 4

**FALA**

Como isso funciona por dentro? A primeira novidade tem um nome em inglês: RAG. Geração aumentada por recuperação. Esqueçam o nome. **Pensem numa prova.**

[CLIQUE 1]

*(entra o quadro "IA comum, sem consulta")* **A IA comum faz prova sem consulta.** Responde do que leu no treino, meses ou anos atrás. Não lembra? Chuta, com cara de certeza: "acho que era assim". E se a lei mudou depois do treino, ela simplesmente não sabe. É o estagiário que decorou o RIR de 1999 e nunca soube que saiu um novo em 2018.

[CLIQUE 2]

*(entra o quadro "RAG, com consulta"; o livro da LC 123 sai da estante)* **O RAG faz prova com consulta. Primeiro acha a página certa nos livros oficiais. Depois responde, citando a página.** Na nossa pergunta do fator R: ele puxa a LC 123, abre no artigo 18 e só então escreve.

[CLIQUE 3]

[PAUSA] E aqui está a vantagem que muda o jogo. **A lei fica fora do modelo. Saiu uma norma nova hoje? Atualizamos a base. A resposta de amanhã já sai atualizada. Sem retreinar nada.** O jeito de hoje: esperar a próxima versão do ChatGPT. O nosso jeito: atualizar a estante.

[CLIQUE 4]

**É a prova com consulta: acerta quem sabe achar a página.**

[AVANÇA]

> **Para você entender** · RAG = Retrieval-Augmented Generation (Lewis et al., NeurIPS 2020). "Treino" é quando o modelo lê bilhões de textos e fixa o que aprendeu nos seus "pesos" (os números internos); depois disso, não aprende mais nada sozinho. "Retreinar" é caro e lento. Por isso a lei fica na base (Camada 1) e o modelo só lê os trechos que a busca entrega.

### Slide 14 · Técnicas 2024–2026

⏱ 1:40 · curta 0:45 · cliques: 3

**FALA**

**Só que lei não é um livro qualquer.** O RAG comum procura o trecho mais parecido com a pergunta. Com legislação, isso não basta.

[CLIQUE 1]

*(entram as quatro armadilhas)* **Quatro armadilhas.** Uma: **versões.** O mesmo artigo teve três redações; o RAG comum traz a mais parecida, não a que valia em março de 2022. Duas: **revogações.** O texto revogado continua lá, idêntico, e continua aparecendo na busca. Três: **remissões.** "Observado o art. X da Lei Y": a resposta está em outra norma, e o RAG comum não segue o fio. Quatro: **vocabulário.** O cliente pergunta "posso pagar menos?"; o artigo do fator R fala em "folha de salários" e "receita bruta". Nenhuma palavra em comum.

[CLIQUE 2]

*(a linha do tempo se desenha: 2024, 2025, 2026)* Para cada armadilha, uma técnica. **E todas publicadas nos últimos dois anos.** RAPTOR, 2024: organiza a lei numa árvore de temas, como o sumário de um livro. HippoRAG 2, 2025: segue a rede de remissões num passo só. Rank1, 2025: um revisor que raciocina sobre cada trecho e anota o porquê. Search-R1, 2025: aprende, por tentativa e nota, quando vale buscar de novo. E o LIMIT, da Google DeepMind, no ICLR de 2026: provou que resumir cada trecho num número só tem limite matemático. Por isso a nossa busca por significado é multivetorial. [PAUSA] Daqui a pouco vocês veem cada uma trabalhando na nossa pergunta.

[CLIQUE 3]

**Quando eu digo "experimental", leiam "estado da arte". Saiu agora dos laboratórios. Quase nenhum produto usa.** Os 18 concorrentes que eu mostrei? Nenhum descreve isso.

[AVANÇA]

> **Para você entender** · Fontes: Sarthi et al., ICLR 2024 (RAPTOR); Gutiérrez et al., 2025 (HippoRAG 2); Weller et al., COLM 2025 (Rank1); Jin et al., 2025 (Search-R1); Weller et al., ICLR 2026 (LIMIT). ICLR e COLM são conferências científicas de IA com revisão por pares: ser aceito lá é o selo de qualidade da área. O filtro de vigência, que resolve versões e revogações, é decisão de projeto, não artigo científico. Mapa armadilha → solução: versões e revogações → filtro de vigência (slide 27); remissões → grafo (slide 30); vocabulário → doc2query e busca multivetorial (slides 28 e 29); excesso de candidatos → revisor (slide 31); buscar demais → política de busca (slide 32).

### Slide 15 · Darwin Gödel Machine

⏱ 1:50 · curta 0:55 · cliques: 5

**FALA**

[PAUSA] **E tem mais uma coisa.** [PAUSA]

*(o título "Um sistema que evolui sozinho" se escreve; aparece o v0 na base da árvore)* **Um sistema que evolui sozinho.** Chama-se Darwin Gödel Machine. DGM. Publicada em 2025 por Zhang, Hu, Lu, Lange e Clune, da Universidade da Colúmbia Britânica, do Vector Institute e da Sakana AI. Aceita no ICLR de 2026. **A ideia em uma linha: seleção natural aplicada ao código do agente.**

[CLIQUE 1]

*(entra o ciclo de quatro passos e a primeira geração: v1, um ✕ vermelho e v2)* **Cada nova versão faz quatro coisas. Lê os próprios erros. Propõe uma mudança em si mesma. Faz a prova. Funcionou? Entra no arquivo.** Não funcionou? Fica de fora, como esse ✕ vermelho. E a prova, no nosso caso, é o benchmark: as perguntas reais de vocês, com gabarito. Exemplo de escritório: o sistema errou três perguntas de ICMS-ST porque não seguiu a remissão até o convênio. A versão nova propõe "siga a remissão um nível mais fundo". Refaz a prova. Acertou mais? Fica.

[CLIQUE 2]

*(a árvore cresce até o v8, no alto; aparece "o grande salto veio de uma linha fraca")* Reparem na árvore. As versões fracas não vão para o lixo. Ficam guardadas. **E o grande salto, lá em cima, veio justamente de uma linha fraca.** É a parte Darwin: diversidade primeiro, seleção depois.

[CLIQUE 3]

*(20% vira 50%)* O resultado no artigo. Um agente de programação, numa prova padronizada de problemas reais de software, o SWE-bench. **De 20% de acerto para 50%.** [PAUSA] **Sozinho.**

[CLIQUE 4]

Por que isso importa para vocês? **Melhorar sem retreinar o modelo e sem um time de engenheiros.** A lei muda toda semana, as perguntas de vocês mudam; o sistema acompanha. E repare: a lei nunca entra no modelo. **O que evolui é o jeito de pesquisar e responder.**

[CLIQUE 5]

**É Darwin no escritório: muitas tentativas, só fica o que prova resultado.**

[AVANÇA]

> **Para você entender** · Fonte: Zhang, Hu, Lu, Lange e Clune, "Darwin Gödel Machine" (arXiv 2505.22954; ICLR 2026). "Gödel" homenageia uma ideia teórica antiga de máquina que se reescreve; "Darwin" é a evolução por arquivo de versões. O que a DGM pode mudar no nosso agente: estratégia de busca, até onde seguir remissões, quanto contexto montar, instruções de cada especialista, a verificação de citações, quando consultar fontes ao vivo. O que ela NÃO muda: base legal, cálculos e regras de segurança. A árvore do slide é ilustrativa. O próprio artigo relata que a DGM tentou "burlar a prova"; a resposta a isso está no slide seguinte. Se perguntarem do exemplo do ICMS-ST: é ilustrativo, para mostrar o tipo de mudança.

### Slide 16 · Rede de proteção

⏱ 1:20 · curta 0:35 · cliques: 4

**FALA**

Agora, a pergunta que vocês estão pensando. "Experimental? No meu escritório? Com a minha assinatura?" [PAUSA] **Experimental, sim. Com rede de proteção.** Toda novidade entra como experimento, cercada por quatro garantias.

[CLIQUE 1]

*(a chave liga)* **Um: só entra se vencer.** Cada técnica disputa no benchmark contra o jeito que já funciona. Perdeu? Fica desligada por uma chave. O sistema segue com o método clássico, e o custo não muda.

[CLIQUE 2]

*(o cadeado fecha)* **Dois: lei e cálculos são intocáveis.** A DGM não mexe na base legal nem na calculadora do fator R. Isso fica fora da área que ela pode editar.

[CLIQUE 3]

**Três: aprovação humana.** Nenhuma versão nova vai ao ar sem uma pessoa aprovar. É como procedimento novo no escritório: só vale com a assinatura do responsável.

[CLIQUE 4]

*(a rede se desenha embaixo)* **Quatro: cada resposta continua com a citação conferida, artigo por artigo.** [PAUSA] Ou seja: no pior caso, a novidade não entra. No melhor caso, ela entra e vocês ganham. **É por isso que, aqui, experimental é vantagem, não risco.**

[AVANÇA]

> **Para você entender** · Fonte: Plano do Assistente, Camada 4 ("O que ela não muda") e "Riscos e salvaguardas"; Plano MVP: "Se um componente não vencer no benchmark, ele entra no lançamento desligado por chave, e o custo dele não muda." Contra a DGM "burlar a prova": métrica que pune erro e omissão, auditoria humana por amostra, área editável restrita, conjunto reservado que ela nunca vê, execução isolada e a versão anterior pronta para voltar.

---

## Seção 6 · Arquitetura em 4 camadas

### Slide 17 · Quatro camadas

⏱ 1:10 · curta 0:30 · cliques: 4

**FALA**

Agora a casa inteira. Quatro camadas. **Pensem num escritório bem organizado.**

[CLIQUE 1] **Camada 1: a biblioteca.** Toda a legislação, com todas as versões e datas.

[CLIQUE 2] **Camada 2: o consultor sênior.** Recebe a pergunta, pesquisa, confere e responde. É com ele que vocês conversam.

[CLIQUE 3] **Camada 3: o estagiário que corre ao Diário Oficial** quando falta algo na biblioteca. O que ele traz entra no acervo.

[CLIQUE 4] **Camada 4: a reunião semanal de qualidade. É aqui que mora a DGM.** [PAUSA] E ela fica fora da produção: só volta para o sistema uma versão aprovada por uma pessoa.

[AVANÇA]

> **Para você entender** · "Produção" é o sistema que os clientes estão usando de verdade, em oposição ao ambiente de testes. A regra é a mesma de um escritório: procedimento novo só vale depois que o responsável aprova.

### Slide 18 · Camada 1: versões

⏱ 1:10 · curta 0:25 · cliques: 4

**FALA**

O jeito de hoje: cortar a lei em blocos de tamanho fixo. Como rasgar páginas de um livro ao acaso. Vejam os cortes vermelhos: um parágrafo pela metade, separado do caput.

[CLIQUE 1]

**O nosso jeito: guardar a lei como vocês a leem. Artigo, parágrafo, inciso, alínea.** Cada um, uma unidade inteira.

[CLIQUE 2]

Cada dispositivo tem um identificador nacional que não muda e **a lista de todas as redações que já teve:** publicação, início e fim da vigência e a norma que causou a mudança.

[CLIQUE 3]

**Toda consulta carrega uma data.** O contador não informou? Usamos a de hoje e avisamos.

[CLIQUE 4]

[PAUSA] **É o histórico de versões de um documento: a foto da lei em cada data.**

[AVANÇA]

> **Para você entender** · Caput é a "cabeça" do artigo; depois vêm parágrafos (§), incisos (I, II…) e alíneas (a, b…). O identificador vem do LexML, o portal oficial que dá um código único (URN) a cada norma brasileira. "Vigência" é quando a regra passa a valer; nem sempre coincide com a publicação. É esta estrutura que desarma as armadilhas "versões" e "revogações" do slide 14.

### Slide 19 · Camada 1: rede de normas

⏱ 1:00 · curta 0:20 · cliques: 1

**FALA**

**Ninguém aqui responde lendo só a lei.** Vocês olham o decreto, a instrução normativa, a solução de consulta, o que o CARF decidiu. *(a rede se desenha)* A base guarda essas ligações: quem altera, quem regulamenta, quem interpreta, quem julga, quem remete a quem.

[CLIQUE 1]

E respeita a hierarquia das fontes, da Constituição às normas do CFC. **Quando duas fontes divergem, ele aponta.** A reforma mora aqui também: CBS, IBS e IS convivendo ano a ano com PIS/Cofins, ICMS e ISS, até 2033.

[AVANÇA]

> **Para você entender** · Solução de Consulta COSIT: resposta formal da Receita (Coordenação-Geral de Tributação) a uma dúvida de contribuinte; orienta toda a fiscalização. CARF: o tribunal administrativo federal que julga recursos contra autuações; suas decisões são "acórdãos". IN: instrução normativa, norma interna da Receita que detalha a lei. NBC TG/CPC: normas contábeis. Esta rede é a matéria-prima do grafo do slide 30.

### Slide 20 · Camada 2: o agente

⏱ 1:00 · curta 0:20 · cliques: 2

**FALA**

O agente. A parte com que vocês conversam. **Um sênior com método.** *(as estações acendem)* Primeiro entende: tema, data do fato, regime, UF, município, atividade. Falta a UF numa pergunta de ICMS? Ele pergunta, em vez de supor.

[CLIQUE 1]

Depois encaminha para o especialista certo. São sete: federal, ICMS, ISS, trabalhista, societário, contábil e reforma. Cada um com suas fontes. Pesquisa, monta a norma inteira na redação da data, responde direto e fundamenta depois. E confere cada afirmação.

[CLIQUE 2]

[PAUSA] **Sem fundamento, ele diz: "Não encontrei base legal para afirmar isso."** E vocês podem cadastrar o perfil de cada cliente, para não repetir contexto toda vez.

[AVANÇA]

> **Para você entender** · "Agente" é uma IA que não só responde, mas executa passos (pesquisar, conferir, perguntar de volta). ICMS é estadual, então a resposta muda conforme a UF; ISS é municipal, muda conforme o município. Por isso o agente pergunta antes de responder.

### Slide 21 · Camada 3: busca ao vivo

⏱ 0:40 · curta 0:15 · cliques: 2

**FALA**

Lei publicada hoje cedo ainda não passou pela organização. **Então o agente vai direto às fontes oficiais:** Planalto, Receita, Diário Oficial, CARF, Sefaz, CONFAZ, CFC. Internet aberta só como último recurso, e só em sites oficiais.

[CLIQUE 1]

**O que vem daí sai com link, data da consulta e a marca "ainda não validada na base".** Vocês sabem o grau de confiança.

[CLIQUE 2]

E o documento entra na fila de organização. A próxima pergunta já encontra o material conferido.

[AVANÇA]

> **Para você entender** · Sefaz: secretaria estadual da fazenda (cuida do ICMS). CONFAZ: conselho dos secretários de fazenda, que aprova convênios de ICMS entre estados. Diário Oficial da União (DOU): onde toda norma federal é publicada.

---

## Seção 7 · A cascata de recuperação

### Slide 22 · Cascata: do barato ao caro

⏱ 1:00 · curta 0:25 · cliques: 3

**FALA**

O coração técnico. Prometo: simples. **A base vai ter, na nossa estimativa, cerca de 2 milhões de dispositivos. O agente nunca lê tudo.**

[CLIQUE 1]

Cada pergunta passa por um funil. Sete etapas.

[CLIQUE 2]

**As seis primeiras: programas, índices e modelos pequenos. Rápidos e baratos. O Claude, a IA que cobra por leitura, entra uma vez só, no fim, e lê só de 5 a 10 trechos.** [PAUSA] É a triagem de um pronto-socorro: recepção, enfermagem e exames resolvem quase tudo, e o especialista caro só vê o caso já preparado.

[CLIQUE 3]

Faltou algo? O funil volta e busca de novo. Quem decide é uma política treinada. Já chego nela.

[AVANÇA]

> **Para você entender** · "Dispositivo" = cada artigo, parágrafo, inciso ou alínea. Claude é o modelo de IA da Anthropic que usamos para entender e redigir; cobra pelo volume de texto lido e escrito (medido em "tokens", pedaços de palavra). Quanto menos texto ele lê, mais barata a pergunta.

### Slide 23 · Quem faz o quê

⏱ 1:10 · curta 0:20 · cliques: 3

**FALA**

Três cores daqui em diante. **Azul: o Claude, pela internet. Violeta: modelos abertos que são nossos, numa placa de vídeo alugada. Verde: código comum e banco de dados, sem IA.** Nada roda no computador de vocês. Só o navegador.

[CLIQUE 1]

O funil colorido. O azul só aparece nas pontas: entender e redigir. Na redação, o Haiku, o mais barato, faz a maioria. O Sonnet entra nas difíceis, cerca de 9%. O Opus, cerca de 1%. O meio é todo violeta e verde.

[CLIQUE 2]

Quem decide buscar de novo ou parar: uma política pequena, também nossa.

[CLIQUE 3]

[PAUSA] **E antes de sair: citação conferida por código, letra a letra, contra o texto oficial. E toda conta, fator R, alíquota, prazo, feita por código. Nunca pela IA de cabeça.**

[AVANÇA]

> **Para você entender** · API: a "tomada" pela qual um programa usa o serviço de outro pela internet, pagando por uso. GPU: placa de vídeo usada para rodar modelos de IA. Haiku, Sonnet e Opus são três tamanhos do Claude: pequeno e barato, médio, grande e caro. Ter modelos próprios (violeta) é o que permite treiná-los com os nossos dados, o que não dá para fazer com o Claude.

### Slide 24 · Fora da hora da pergunta

⏱ 0:40 · curta 0:15 · cliques: 2

**FALA**

Duas coisas acontecem fora da hora da pergunta. Sem ninguém esperando.

[CLIQUE 1]

**Um: a organização da lei.** Norma nova? O Haiku, em lote, extrai artigo, versão e datas. Dois extratores discordam? Só aí o Sonnet desempata. Validar é código, com regras fixas.

[CLIQUE 2]

**Dois: a melhoria contínua. A DGM propõe variações do método, cada uma faz a prova com as perguntas de vocês, e nenhuma entra sem aprovação humana.**

[AVANÇA]

> **Para você entender** · "Em lote" significa mandar muitos documentos de uma vez para processar sem pressa, o que sai mais barato. "Ingestão" é o nome técnico para pegar a lei publicada e transformá-la em fichas organizadas na base.

### Slide 25 · 1 · Árvore de temas

⏱ 1:00 · curta 0:20 · cliques: 3

**FALA**

Etapa um: de que assunto estamos falando? **Uma árvore de temas que segue a lógica de vocês. Simples Nacional, depois anexos, depois fator R.** Cada ramo com um resumo do que contém. A técnica se chama RAPTOR, de 2024: agrupa trechos parecidos, resume o grupo, agrupa os resumos, e repete, até formar a árvore. Nós guiamos essa árvore pela classificação contábil.

[CLIQUE 1]

*(a pergunta desce pelos ramos e para em "Fator R")* A nossa pergunta desce e para em "Fator R".

[CLIQUE 2]

O jeito de hoje: jogar a pergunta no acervo inteiro e torcer. **O nosso jeito: a busca já começa na estante certa.** É isso que desarma a armadilha do vocabulário logo na porta: o cliente falou "anexo certo", a árvore sabe que isso é fator R. E quem faz é o Haiku, o modelo mais barato.

[CLIQUE 3]

**É o sumário de um livro: ninguém procura o fator R folheando o livro inteiro.**

[AVANÇA]

> **Para você entender** · RAPTOR: Sarthi et al., ICLR 2024. MVA (que aparece no ramo de ICMS) é a margem de valor agregado usada para calcular o ICMS da substituição tributária. Taxonomia é só "classificação em níveis".

### Slide 26 · 2 · Cache semântico

⏱ 0:50 · curta 0:20 · cliques: 4

**FALA**

Muitas perguntas se repetem com outras palavras. **"Qual o prazo do DAS?" e "até quando pago o Simples?" são a mesma pergunta.**

[CLIQUE 1]

O cache reconhece e puxa a resposta já validada. A pasta de pareceres aprovados do escritório.

[CLIQUE 2]

[PAUSA] **Mas só devolve se todas as normas citadas continuarem vigentes.**

[CLIQUE 3]

Alguma mudou? O parecer volta para a gaveta e a pergunta segue o funil. Um cache comum devolveria uma resposta vencida. O pior erro possível.

[CLIQUE 4]

**É a resposta guardada na gaveta: antes de entregar, confere se a lei mudou.**

[AVANÇA]

> **Para você entender** · DAS: Documento de Arrecadação do Simples Nacional, a guia única mensal. "Semântico" = pelo significado, não pela letra. O sistema compara significados com um "embedding" (uma impressão digital numérica do sentido de um texto), fornecido pela empresa Voyage. O cache só existe quando já houver respostas validadas pelo grupo.

### Slide 27 · 3 · Filtro de vigência

⏱ 0:50 · curta 0:20 · cliques: 5

**FALA**

Etapa simples. E obrigatória. Antes de procurar qualquer palavra, o sistema separa só o que pode responder.

[CLIQUE 1] A esfera certa: federal, estadual ou municipal.

[CLIQUE 2] O tributo certo.

[CLIQUE 3] **E, principalmente, a redação válida na data do fato.**

[CLIQUE 4]

O jeito de hoje: buscar em tudo e torcer para o texto antigo não aparecer. **O nosso jeito: ele nem está no caminho.** Versões e revogações, duas das quatro armadilhas, resolvidas aqui. Pelo banco de dados. Sem IA nenhuma.

[CLIQUE 5]

**É a data de validade no rótulo: o que estava vencido em março de 2022, ou ainda não valia, nem sai da prateleira.**

[AVANÇA]

> **Para você entender** · Esferas: federal (IRPJ, CSLL, PIS, Cofins, IPI), estadual (ICMS, IPVA, ITCMD), municipal (ISS, IPTU, ITBI). "Metadados" são as etiquetas de cada dispositivo: esfera, tributo, datas.

### Slide 28 · 4a · Palavras exatas

⏱ 0:50 · curta 0:20 · cliques: 4

**FALA**

Etapa quatro: duas buscas lado a lado. A primeira, por palavras exatas. Uma técnica clássica, o BM25. Dá mais peso a termos raros. Número de lei, NCM, CFOP, sigla: nada substitui.

[CLIQUE 1]

Mas a lei não fala como o contador. Então, na organização, um modelo lê cada artigo e escreve as perguntas que ele responde. E cola no artigo. Como post-its.

[CLIQUE 2]

**"Posso pagar menos se aumentar a folha?" encontra o artigo do fator R. Que não tem nenhuma dessas palavras.**

[CLIQUE 3]

O jeito comum seria um índice separado. Aqui é um índice a menos. Na hora da pergunta, só o banco de dados trabalha.

[CLIQUE 4]

**É o Ctrl+F: acha o número exato, letra por letra. E os post-its trazem as palavras do contador.**

[AVANÇA]

> **Para você entender** · NCM: código de classificação de mercadorias. CFOP: código fiscal da operação (venda, devolução, remessa). doc2query (Nogueira et al., 2019) é o nome da técnica de escrever de antemão as perguntas que cada artigo responde. No teste LIMIT, o BM25 se sai bem justamente onde os vetores únicos falham.

### Slide 29 · 4b · Significado

⏱ 1:00 · curta 0:20 · cliques: 3

**FALA**

A segunda busca: por significado.

[CLIQUE 1]

O jeito de hoje resume cada artigo numa única impressão digital numérica. Um número só para o artigo inteiro. Em 2026, a Google DeepMind provou que isso tem um teto matemático: há combinações de documentos que esse resumo único simplesmente não consegue achar. O teste se chama LIMIT. [PAUSA] Pensem em descrever um artigo de lei inteiro com uma única palavra. Alguma coisa vai se perder.

[CLIQUE 2]

**O nosso jeito: cada palavra da pergunta procura seu melhor par no artigo. "Faturamento" encontra "receita bruta".** Uma nota por termo, não uma por artigo. É um modelo pequeno, nosso, ajustado ao português jurídico. E se não ganhar do método comum nas perguntas de vocês, fica desligado.

[CLIQUE 3]

**É um bibliotecário que entende o que você quis dizer, mesmo quando você não usa as palavras da lei.**

[AVANÇA]

> **Para você entender** · Nome técnico: ColBERT (Khattab e Zaharia, 2020), um recuperador "multivetorial". O estudo que o justifica é o LIMIT (Weller et al., ICLR 2026). "Receita bruta" é o termo legal; "faturamento" é como o cliente fala. Benchmark: o conjunto de perguntas com gabarito que o grupo monta para medir tudo.

### Slide 30 · 5 · Grafo de normas

⏱ 1:00 · curta 0:20 · cliques: 5

**FALA**

Achados os artigos principais, falta o resto: o regulamento, a solução de consulta, o acórdão. A armadilha das remissões.

[CLIQUE 1]

Acendem os dois artigos encontrados na etapa anterior.

[CLIQUE 2]

O princípio é o do Google antigo, o PageRank. **A relevância parte dos artigos encontrados e se espalha pela rede de normas.** A técnica é o HippoRAG 2, de 2025.

[CLIQUE 3]

Lei, regulamento, interpretação e julgamento. Juntos. Num passo só.

[CLIQUE 4]

O jeito de hoje: buscar de novo, rodada após rodada, seguindo cada remissão. No artigo original, o nosso caminho saiu **de 10 a 30 vezes mais barato.** [PAUSA] **E é conta pura. Sem IA.**

[CLIQUE 5]

**É quem cita quem: o boca a boca entre normas. A norma citada por normas importantes ganha peso.**

[AVANÇA]

> **Para você entender** · "Remissão" é quando um artigo manda ler outro ("conforme o art. X"). "Grafo" é só uma rede de pontos ligados. Res. CGSN 140/2018 é o regulamento do Simples. HippoRAG: Gutiérrez et al., 2024; HippoRAG 2, 2025. O "10 a 30 vezes" é do artigo original do HippoRAG, comparado à busca em rodadas.

### Slide 31 · 6 · Revisor

⏱ 1:00 · curta 0:20 · cliques: 4

**FALA**

Depois das buscas: uns 50 candidatos.

[CLIQUE 1]

O revisor lê cada um e anota o motivo. "Este responde: é fator R em 2022." "Este não: é sobre MEI."

[CLIQUE 2]

Ficam de 5 a 10. Os outros saem com o motivo registrado.

[CLIQUE 3]

O jeito de hoje: um reordenador dá uma nota e pronto, sem explicar. O nosso, o Rank1, de 2025, pensa antes de decidir. [PAUSA] **Num produto que precisa mostrar a base legal, essa justificativa é ouro: dá para auditar por que um artigo entrou e outro não.** É um modelo nosso, e só substitui o provisório se ganhar dele nas perguntas de vocês.

[CLIQUE 4]

**É o escritório de sempre: o estagiário traz 50 documentos, o sênior escolhe 5 e explica por quê.**

[AVANÇA]

> **Para você entender** · Nome técnico: Rank1 (Weller et al., COLM 2025), um "reranker de raciocínio". MEI: microempreendedor individual, regime à parte (art. 18-A da LC 123). É aqui que a GPU própria mais economiza: mandar 50 artigos ao Claude a cada pergunta é o que encarece o jeito comum.

### Slide 32 · 7 · Decisão de parar

⏱ 1:10 · curta 0:20 · cliques: 5

**FALA**

Etapa sete. O Claude lê os poucos trechos que sobraram, sempre na redação da data, e redige.

[CLIQUE 1]

Às vezes falta algo. Ele pode voltar e buscar de novo.

[CLIQUE 2]

**Quem decide é uma pequena política de busca, treinada com nota pelo resultado.** A técnica é o Search-R1, de 2025. Funciona como estágio com avaliação: acertou com poucas buscas, nota alta. Buscou à toa, nota menor. Errou, nota baixa. Depois de milhares de tentativas, ela aprende sozinha quando já basta.

[CLIQUE 3]

E segue para a resposta citada. [PAUSA] **Isso não muda o acerto. Reduz custo e espera.**

[CLIQUE 4]

O jeito de hoje: escrever na instrução "se precisar, busque mais". E a IA busca demais, ou de menos. A nossa aprende quando parar.

[CLIQUE 5]

**É um GPS que aprende os atalhos e sabe quando já chegou: não fica dando voltas.**

[AVANÇA]

> **Para você entender** · "Treino por reforço" (RL): o modelo tenta, recebe uma nota e ajusta o próprio comportamento. Fonte: Jin et al., 2025 (Search-R1); continuação Search-R1++, 2026. Só dá para treinar assim um modelo que é nosso; por isso ele roda na nossa GPU. Diferença para a DGM: o RL ajusta os pesos deste modelo pequeno; a DGM ajusta o código em volta (cascata, limiares, instruções).

---

## Seção 8 · Confiança e melhoria contínua

### Slide 33 · Conferido antes de chegar

⏱ 1:20 · curta 0:30 · cliques: 3

**FALA**

**A salvaguarda principal.** *(a primeira citação atravessa os três portões)* Depois de redigir, uma segunda etapa pega cada afirmação e faz três perguntas. **O dispositivo existe? Estava vigente na data do fato? Diz mesmo o que a resposta afirma?**

[CLIQUE 1]

A segunda citação passa nas duas primeiras e cai na terceira. O artigo existe, valia, mas não diz aquilo. Riscada. Afirmação sem suporte é removida ou marcada.

[CLIQUE 2]

[PAUSA] Sem fundamento suficiente, a resposta é "não encontrei base legal para afirmar isso", com a lista do que foi pesquisado. **Nunca uma invenção. A meta: 100% das respostas com citação conferida ou abstenção.** Quem mede são vocês.

[CLIQUE 3]

**É conferir a nota fiscal contra o pedido: item por item, antes de dar entrada no estoque.**

[AVANÇA]

> **Para você entender** · "Abstenção" = o sistema se recusa a afirmar sem prova. É o equivalente a "o fechamento só sai quando bater". Esta etapa é uma das que a DGM pode aprimorar, mas não pode desligar.

### Slide 34 · Conta não é opinião

⏱ 1:00 · curta 0:25 · cliques: 3

**FALA**

IA escreve bem. Faz conta mal. E às vezes erra uma alíquota com toda a segurança. **Por isso nenhuma conta passa pela IA.**

[CLIQUE 1]

Alíquota efetiva do Simples, fator R, multa e juros pela Selic: tudo por um programa comum, com tabelas versionadas por data e os índices vindos direto do Banco Central. Exemplo: receita de R$ 300 mil em 12 meses, segunda faixa do Anexo III. Alíquota efetiva: 8,08%.

[CLIQUE 2]

O número sai da calculadora e entra no balão. [PAUSA] **A mesma divisão de trabalho do escritório: a planilha calcula, o sênior interpreta.** E essa parte fica trancada. A DGM não toca nela.

[CLIQUE 3]

**Calculadora, não opinião: o mesmo número toda vez, e dá para conferir.**

[AVANÇA]

> **Para você entender** · Alíquota efetiva do Simples = (RBT12 × alíquota nominal − parcela a deduzir) ÷ RBT12. RBT12 = receita bruta dos últimos 12 meses. No exemplo: (300.000 × 11,2% − 9.360) ÷ 300.000 = 8,08%. "Determinístico" = mesma entrada, sempre o mesmo resultado.

### Slide 35 · Cada correção vira prova

⏱ 1:10 · curta 0:25 · cliques: 3

**FALA**

A melhoria contínua começa com o botão mais simples do mundo. Correta ou incorreta. E um campo para corrigir.

[CLIQUE 1]

O contador clica "incorreta" e escreve: "Na data do fato valia a redação anterior." **Esse feedback é o ativo mais valioso do produto.**

[CLIQUE 2]

O grupo valida e a correção vira um caso de teste: pergunta, data, resposta certa e os artigos que precisam ser citados. 20% ficam guardados e nunca são mostrados ao sistema que evolui. A prova final que o aluno não vê antes.

[CLIQUE 3]

[PAUSA] **A prova cresce com o uso: começa com 50 perguntas e chega a 200. Todas enviadas por vocês.** Sem essa régua, não dá para medir nada. E a DGM não tem contra o que evoluir.

[AVANÇA]

> **Para você entender** · Benchmark = prova padronizada com gabarito. "Conjunto reservado" = parte da prova guardada a sete chaves para evitar que o sistema "decore" as respostas. Quando uma norma citada muda, o caso volta para revisão.

### Slide 36 · Dois laços de evolução

⏱ 1:10 · curta 0:20 · cliques: 4

**FALA**

Lembram da DGM? Aqui ela encontra o feedback de vocês. Dois laços de evolução.

[CLIQUE 1]

**O primeiro: a DGM, fazendo a prova com as perguntas de vocês.** Cada versão lê os próprios erros, propõe uma melhoria, e só entra no arquivo se acertar mais. [PAUSA] O próprio artigo relata que ela tenta "burlar a prova". É para isso que existe o conjunto reservado e a revisão humana.

[CLIQUE 2]

O segundo: o treino daquele GPS da busca. Premia o acerto, penaliza cada busca extra. **Os dois medidos pela mesma régua: acerto por real gasto.**

[CLIQUE 3]

**E a lei, as calculadoras e as regras de segurança ficam trancadas. Nenhum dos dois laços mexe nelas.** Não venceu a versão de partida? Fica desligado.

[CLIQUE 4]

**Uma auditoria interna: só aprova a mudança que prova resultado.**

[AVANÇA]

> **Para você entender** · Métrica da DGM: acerto da conclusão (modelo-juiz calibrado com revisões humanas), precisão das citações, abstenção correta (pune inventar e também dizer "não sei" quando havia resposta) e custo/tempo como restrição. A comparação com auditoria é boa para esta plateia: "nenhum procedimento novo entra sem evidência e sem assinatura do responsável".

---

## Seção 9 · Ingestão da base legal

### Slide 37 · Por que é difícil

⏱ 1:10 · curta 0:20 · cliques: 1

**FALA**

Tudo isso depende de uma base confiável. **E montar essa base é a parte mais difícil do projeto.** Na nossa estimativa, dez anos de federal, cinco estados e 25 municípios: cerca de 5 milhões de atos em diários para triar. 89 mil para ler a fundo. 2 milhões de dispositivos no fim.

[CLIQUE 1]

E a lei não muda de forma limpa. [PAUSA] Vocês sabem. Um artigo entra em vigor numa data, outro noventa dias depois. Sai uma retificação. Uma lei revoga outra sem dizer qual. Um único ato altera dez normas. O efeito depende de um regulamento que ainda não saiu. **E compilação de editora tem direito autoral. Só usamos a fonte oficial.**

[AVANÇA]

> **Para você entender** · "Vigência diferida": parte da lei vale numa data, parte noutra. "Revogação por incompatibilidade" (tácita): a lei nova contradiz a antiga sem citá-la. Retificação: republicação para corrigir erro do texto publicado.

### Slide 38 · De onde vêm os dados

⏱ 0:50 · curta 0:15 · cliques: 1

**FALA**

De onde vem a informação. **Fontes oficiais. Quase todas gratuitas.** Federal: o Diário Oficial completo em formato de dados, grátis desde 2020; o Planalto com os textos compilados; o LexML com o identificador de cada norma; Receita, CARF, CONFAZ e tribunais superiores. Cada estado: Sefaz, diário oficial, Assembleia, tribunal administrativo. Municípios: diário oficial e o projeto Querido Diário.

[CLIQUE 1]

Um exemplo de como o escopo cabe: em Minas, 834 dos 853 municípios publicam no mesmo diário. Um coletor cobre o estado quase inteiro.

[AVANÇA]

> **Para você entender** · INLABS: serviço da Imprensa Nacional que entrega o DOU em XML (formato de dados). Querido Diário: projeto aberto que reúne diários municipais. Editoras pagas servem só para conferência manual.

### Slide 39 · Sindicatos, Juntas e manuais

⏱ 1:00 · curta 0:15 · cliques: 2

**FALA**

**Contador não vive só de lei tributária.** A folha depende da convenção coletiva. A abertura de empresa, da Junta. O dia a dia, dos manuais. Tudo isso entra. Convenções e acordos, no Mediador do Ministério do Trabalho, onde são depositados. Registro empresarial: lei, decreto, instruções do DREI e as cinco Juntas do nosso escopo. Manuais: eSocial, SPED, NF-e, o Perguntas e Respostas da Receita, FGTS.

[CLIQUE 1]

Como achar a convenção certa: da atividade do cliente para a categoria, da categoria para o sindicato da base territorial, daí para a convenção.

[CLIQUE 2]

[PAUSA] E a convenção também tem tempo: vigência, data-base, aditivos. Como na lei, vale a foto da data do fato. No lançamento, entram as categorias dos clientes de vocês; as demais, por demanda.

[AVANÇA]

> **Para você entender** · Convenção coletiva (CCT): acordo entre sindicato dos empregados e sindicato patronal (piso, reajuste, adicionais); acordo coletivo (ACT) é com uma empresa. Data-base: mês em que a categoria renegocia. CLT, art. 614: depósito no MTE (sistema Mediador). DREI: órgão federal que normatiza as Juntas Comerciais (registro de empresas, estadual). eSocial: escrituração trabalhista e previdenciária; SPED: escriturações digitais fiscais e contábeis (EFD, ECD, ECF). A forma de acesso ao Mediador ainda está sendo conferida.

### Slide 40 · O coletor

⏱ 1:10 · curta 0:20 · cliques: 7

**FALA**

**Para sindicatos e Juntas: um coletor. Um programa comum e barato que visita, compara e só chama a IA no fim.**

[CLIQUE 1] Uma vez, cadastramos as páginas de publicação de cada sindicato e Junta. Depois, visitas agendadas: órgãos e Juntas todo dia, sindicatos uma ou duas vezes por semana. Sem login, respeitando as regras de cada site.

[CLIQUE 2] "Mudou?" é respondido sem IA: compara a impressão digital do arquivo. Nada mudou, nada mais é feito. Custo quase zero.

[CLIQUE 3] Só o documento novo vai à IA, que classifica tipo, categoria e vigência.

[CLIQUE 4] Página sumiu ou mudou de lugar? Vai para um painel de fontes quebradas. A IA tenta reencontrar; se não conseguir, eu corrijo.

[CLIQUE 5] O que só circula no WhatsApp chega por vocês, por e-mail ou upload, com registro de quem enviou.

[CLIQUE 6] Documento pago ou restrito: versão oficial gratuita; pedido pela Lei de Acesso à Informação; licença com o sindicato ou a editora; e, se nada der, mostramos o dado com a citação e o link, sem republicar o documento.

[CLIQUE 7] **Um office boy que passa nos órgãos todo dia e só traz o que é novo.**

[AVANÇA]

> **Para você entender** · "Hash" é a impressão digital de um arquivo: muda se uma vírgula mudar. "robots.txt" é o aviso do site dizendo o que robôs podem visitar. LAI: Lei 12.527/2011; vale para órgãos públicos (o MTE), não para sindicatos, que são entidades privadas. Certidões vendidas pelas Juntas não entram: não são norma e têm dados pessoais.

### Slide 41 · Quatro princípios

⏱ 0:50 · curta 0:15 · cliques: 4

**FALA**

Quatro regras que não mudam nunca.

[CLIQUE 1] Um: o original nunca muda. Guardado como veio, com impressão digital, endereço e data da coleta.

[CLIQUE 2] Dois: cada versão tem três datas, publicação, vigência e eficácia, mais a data em que entrou na base.

[CLIQUE 3] **Três: a IA não escreve o texto consolidado. Só registra eventos, "este ato deu nova redação a este parágrafo", e um programa aplica os eventos em ordem. Como lançamento contábil: o saldo não se digita. Se apura.**

[CLIQUE 4] Quatro: toda informação aponta para o trecho exato do original que a justifica.

[AVANÇA]

> **Para você entender** · Vigência = quando a norma existe e vale; eficácia = quando produz efeito (pode depender de regulamento ou de anterioridade tributária, os 90 dias/exercício seguinte). "Texto consolidado" = a lei com todas as alterações já incorporadas.

### Slide 42 · Uma equipe de agentes

⏱ 1:00 · curta 0:15 · cliques: 7

**FALA**

**Quem faz esse trabalho não é uma equipe grande de pessoas. Sou eu, com uma equipe de agentes.** No topo, o orquestrador: fila, prioridades, orçamento.

[CLIQUE 1] O coletor baixa e guarda o original; o normalizador extrai o texto; o triador descarta o que não interessa.

[CLIQUE 2] Dois extratores, com IAs de empresas diferentes, às cegas, preenchem as fichas sem ver o trabalho um do outro. Dois auditores que não conversam antes de entregar. Um validador aplica regras automáticas.

[CLIQUE 3] Um revisor compara com casos-modelo. Divergiu? Um reconciliador tenta resolver; não conseguiu, fila humana.

[CLIQUE 4] Um programa consolida, um conferente compara com o texto oficial. Só vai para produção o que passa nos quatro portões.

[CLIQUE 5] Ao lado: o auditor amostral, o controlador de custos e o mantenedor dos coletores.

[CLIQUE 6] Vejam um documento percorrendo o caminho: se divide nos dois extratores e se reencontra no validador.

[CLIQUE 7] **Um escritório com setores: cada um faz a sua parte, com conferência no meio.**

[AVANÇA]

> **Para você entender** · Os quatro portões: validador sem falhas, extratores concordando, revisor aprovando, conferência com o texto oficial. É segregação de funções, conceito que vocês usam em controle interno: quem prepara não é quem confere.

### Slide 43 · Medir antes de congelar

⏱ 0:50 · curta 0:15 · cliques: 4

**FALA**

Antes de organizar milhões de dispositivos, preciso fixar o formato das fichas. **E quem valida são vocês.** *(aparece a amostra)* 300 documentos variados, com 20 casos difíceis de propósito.

[CLIQUE 1]

Vocês preenchem 60 à mão; os agentes, os 300. Caso que não cabe nos campos vira proposta de mudança.

[CLIQUE 2]

Meta: 98% de concordância entre agentes e profissionais.

[CLIQUE 3]

[PAUSA] Só congelamos depois de duas rodadas seguidas, com 100 documentos novos cada, sem nenhuma mudança. Acertar de primeira não se adivinha. Se testa.

[CLIQUE 4]

**Como definir o plano de contas antes de lançar: depois de congelado, não se mexe.**

[AVANÇA]

> **Para você entender** · "Esquema" = o formato das fichas (quais campos, que tipo de dado). Partimos de padrões que já existem: LexML e Akoma Ntoso (padrão internacional para textos legislativos). Dúvidas de vigência vão ao advogado do grupo.

### Slide 44 · Em ondas

⏱ 0:40 · curta 0:15 · cliques: 4

**FALA**

A base cresce em ondas.

[CLIQUE 1] **Primeiro, o federal. Vale para todos.**

[CLIQUE 2] Depois São Paulo e Minas; depois Paraná, Santa Catarina e Rio Grande do Sul. Cada estado com o regulamento do ICMS, as tabelas de substituição tributária, as respostas a consultas da Sefaz e as decisões do tribunal administrativo. Um estado só segue depois de passar na auditoria.

[CLIQUE 3] Junto com o Sul, os municípios: capitais e onde os escritórios de vocês têm clientes. Os demais, por demanda.

[CLIQUE 4] **Os últimos dez anos. Cobrem com folga a decadência de cinco.**

[AVANÇA]

> **Para você entender** · RICMS: regulamento do ICMS de cada estado. Substituição tributária (ST): um contribuinte da cadeia recolhe o ICMS pelos seguintes. Sem contar SC, os estados do escopo somam cerca de 286 mil profissionais, mais da metade do país. Se o slide mostrar os meses, não os leia: diga só a ordem.

### Slide 45 · Confiança em números

⏱ 0:50 · curta 0:20 · cliques: 4

**FALA**

**Como saber se a base está certa? Amostragem.**

[CLIQUE 1]

Sorteamos 100 dispositivos e vocês conferem cada um contra o texto oficial. Vocês são playtesters. E auditores.

[CLIQUE 2]

Certo ou errado, um por um: taxa de erro medida, não estimada. A amostra se concentra onde o risco é maior: vigência complexa, retificações, tabelas.

[CLIQUE 3]

[PAUSA] **O critério: no máximo 2% de erro nas cinco UFs. E menos de 24 horas entre o Diário Oficial e a base.**

[CLIQUE 4]

**A mesma amostragem de auditoria que vocês já fazem.**

[AVANÇA]

> **Para você entender** · É a lógica da NBC TA de amostragem: amostra dirigida ao risco, erro projetado para a população. Cada erro encontrado vira um novo caso-modelo ou uma nova regra no validador.

### Slide 46 · Quando a porta está fechada

⏱ 0:50 · curta 0:15 · cliques: 6

**FALA**

Algumas fontes têm barreira. Até o Planalto bloqueou nossa coleta automática durante a pesquisa. Então temos uma escada.

[CLIQUE 1] Degrau um: serviço oficial de dados. INLABS, LexML, Querido Diário.

[CLIQUE 2] Dois: o mesmo ato em outro veículo oficial. O convênio também sai no DOU.

[CLIQUE 3] Três: Lei de Acesso à Informação. Gratuito, sem justificar, resposta em até 20 dias, prorrogáveis por 10.

[CLIQUE 4] Quatro: ofício ou convênio com a Sefaz, o tribunal ou a prefeitura.

[CLIQUE 5] Cinco: licença paga, quando a compilação é protegida.

[CLIQUE 6] [PAUSA] **E o último degrau é uma pessoa.**

[AVANÇA]

> **Para você entender** · LAI, art. 8º, § 3º, III: os órgãos devem permitir acesso automatizado em formato legível por máquina. CAPTCHA: o "não sou um robô" dos sites; existe justamente para exigir uma pessoa. Não tentamos burlar; uma pessoa resolve.

### Slide 47 · Humano no circuito

⏱ 0:50 · curta 0:15 · cliques: 7

**FALA**

**O CAPTCHA é resolvido sempre por uma pessoa. Mas ela não precisa sentar no computador.**

[CLIQUE 1] O coletor está baixando os atos de uma Junta e esbarra num CAPTCHA. Pausa e chama uma pessoa.

[CLIQUE 2] Chega um aviso com um link: no painel, no Telegram, no Discord ou no WhatsApp.

[CLIQUE 3] O link abre a página ao vivo no celular. O navegador roda no nosso servidor; o celular só mostra a tela. Nenhuma senha, nenhum arquivo passa pelo celular.

[CLIQUE 4] A pessoa resolve. Um toque, ou as imagens. Segundos.

[CLIQUE 5] A IA continua de onde parou.

[CLIQUE 6] Link de uso único, expira em minutos, tudo registrado. Custo perto de zero.

[CLIQUE 7] **Como autorizar um Pix pelo app.**

[AVANÇA]

> **Para você entender** · "Sessão" = o login temporário que o site concede depois do CAPTCHA; fica no servidor e serve para os demais documentos daquela fonte. "Headless" = navegador que roda sem tela, no servidor.

---

## Seção 10 · Visão agêntica e diferenciais

### Slide 48 · Agêntico por padrão

⏱ 1:20 · curta 0:35 · cliques: 4

**FALA**

Para onde isso vai. **O futuro não é um chat que responde. É um time de agentes trabalhando para o contador.**

[CLIQUE 1]

Um vigia da lei, que cruza cada norma nova com a atividade, o regime e o estado de cada cliente, e avisa: "isto muda para a empresa X". Um agente de prazos. Um que prepara rascunhos de respostas e cálculos para você revisar e assinar. E os coletores, dia e noite.

[CLIQUE 2]

E o agente é nosso. Código aberto, hospedado e controlado por nós, na mesma GPU do plano.

[CLIQUE 3]

[PAUSA] **As travas são de engenharia: cada ação precisa de permissão própria; certificado digital, e-CAC ou envio ao cliente esperam a aprovação de uma pessoa; o agente roda isolado; tudo fica registrado.** A lista de tarefas que vocês querem delegar é o que define os primeiros agentes.

[CLIQUE 4]

**Uma equipe de assistentes trabalhando enquanto você atende o cliente.**

[AVANÇA]

> **Para você entender** · e-CAC: portal da Receita onde se acessa a situação fiscal da empresa, com certificado digital. Agentes de terceiros como OpenClaw, Hermes e Grok Bot tiveram falhas documentadas (instâncias expostas, acesso às contas do usuário). No desenvolvimento, eu os testo só num ambiente isolado (a VPS do aporte), nunca com dados de cliente.

### Slide 49 · Seis diferenciais

⏱ 1:10 · curta 0:25 · cliques: 1

**FALA**

Seis. *(acendem um a um)* **Data do fato:** pergunta sobre 2022, regra de 2022. **Citação conferida** antes de chegar a vocês. **Várias normas num passo:** lei, decreto, IN, convenção, Junta. **Precisão publicada**, num mercado em que quase ninguém publica. **Time de agentes**, não só chat. **E o "não sei" honesto** em vez de inventar. [PAUSA] Nenhum dos 18 concorrentes que olhei descreve os seis juntos.

[CLIQUE 1]

E custo baixo por desenho: o modelo caro só lê o que importa. Já mostro os números.

[AVANÇA]

> **Para você entender** · Se alguém perguntar "qual é o principal?", responda: data do fato com citação conferida. É o que nenhum produto contábil consultado descreve.

---

## Seção 11 · Segurança, LGPD e responsabilidade

### Slide 50 · Dados dos clientes

⏱ 1:00 · curta 0:30 · cliques: 1

**FALA**

Na pesquisa da Fenacon, a maior preocupação dos contadores com IA é vazamento de dados de clientes: 33%. **Os dados de cada escritório ficam cifrados e isolados dos outros, com registro de quem acessou. Nunca são usados para treinar modelos. Termos de uso e LGPD prontos antes de qualquer cobrança.**

[CLIQUE 1]

[PAUSA] E sendo transparente: a pergunta precisa ir ao modelo de IA, que roda fora do país. **É transferência internacional, coberta pelas cláusulas-padrão da ANPD, e o fornecedor não guarda nem treina com ela.** Quando a GPU for nossa, ela fica num datacenter em São Paulo. E nenhum dado de cliente entra nas perguntas de teste sem anonimização.

[AVANÇA]

> **Para você entender** · LGPD: Lei Geral de Proteção de Dados (Lei 13.709/2018). ANPD: a autoridade que fiscaliza. "Cláusulas-padrão contratuais" são o modelo de contrato aprovado pela ANPD para enviar dados a outro país. "Cifrado" = criptografado: ilegível sem a chave.

### Slide 51 · Quem assina

⏱ 1:00 · curta 0:30 · cliques: 1

**FALA**

Uma posição clara. [PAUSA] **Isto é um assistente. Não substitui o contador nem o advogado. A decisão e a assinatura são de quem tem CRC.** *(deixe a assinatura se desenhar)*

[CLIQUE 1]

Toda resposta cita a fonte e a data de vigência, e registramos qual versão da base gerou cada uma, para reconstruir depois se alguém questionar. Publicamos a taxa de erro medida, em vez de prometer "100% correto". E seguro de responsabilidade profissional e auditoria humana por amostra entram no custo a partir de 500 usuários.

[AVANÇA]

> **Para você entender** · O contador responde pelo trabalho que assina (Código de Ética do CFC e responsabilidade civil). O produto reforça isso, não tira: mostra a prova para o contador decidir. Seguro E&O = seguro de erros e omissões profissionais.

---

## Seção 12 · Plano e investimento

### Slide 52 · Seis meses

⏱ 1:10 · curta 0:35 · cliques: 2

**FALA**

*(os meses entram um a um; deixe a tela falar, não leia a grade)*

**Seis meses. Uma pessoa. A arquitetura inteira.** Eu, trabalhando com agentes de programação, sem equipe contratada. A ordem é por risco: primeiro a lei com todas as versões e a citação conferida. Depois a busca completa e os estados. Depois a inteligência que aprende: a política de busca e a DGM. No fim, o portão: congela, corrige, liga a cobrança.

[CLIQUE 1]

**E vocês, desde o primeiro dia.** Mandando perguntas com gabarito, usando o alfa, marcando erros, até usar como se já estivesse lançado.

[CLIQUE 2]

**Lançamento comercial no mês 7.** [PAUSA] Por que cabe em seis meses? Três motivos. Cinco estados, não o país inteiro. Textos oficiais digitais, sem papel escaneado. E agentes de programação fazendo o trabalho de vários programadores.

[AVANÇA]

> **Para você entender** · Alfa: primeira versão de uso, crua, para poucos. Beta: quase pronta, para um grupo fechado. Playtester: quem usa e aponta defeitos durante o desenvolvimento. "Portão" final: as 7 etapas, a política, a DGM e a busca ao vivo em produção, com acerto acima da meta do grupo no conjunto reservado. Se alguém pedir o detalhe mês a mês, está na tela e em docs/Plano_MVP_6_meses.md; responda apontando a tela, sem recitar.

### Slide 53 · Investimento

⏱ 1:10 · curta 0:35 · cliques: 2

**FALA**

Quanto custa o desenvolvimento em si. **Na conta base: R$ 15,6 mil em seis meses.** A barra mostra para onde vai: IA para ler e organizar a lei, GPU alugada por hora, testes, servidor e os ciclos de melhoria. A linha tracejada é o teto de referência: R$ 10 mil.

[CLIQUE 1]

**Com as alavancas: R$ 9,3 mil. Dentro do teto.** As principais: pagar tudo no cartão de pessoa física e abrir o CNPJ só no fim do desenvolvimento; um servidor no Brasil, cobrado em reais; a DGM usando a própria assinatura do agente de programação; GPU mais barata; e os termos revisados pelo advogado do grupo.

[CLIQUE 2]

Quem financia são vocês, os playtesters: durante o desenvolvimento não há preço nem receita. Tem limite mensal de gasto, alerta e uma ordem de corte combinada. [PAUSA] **Este número não inclui as ferramentas com que eu construo. No último slide eu mostro o aporte completo, com tudo dentro.**

[AVANÇA]

> **Para você entender** · Ordem de corte, se o dinheiro apertar: 1º o terceiro ciclo da DGM, 2º a segunda rodada de treino da política, 3º o doc2query completo. Faixa da base: R$ 9 mil a R$ 27,4 mil; com alavancas: R$ 5,6 mil a R$ 15,9 mil (são estimativas).

### Slide 54 · Tributos sobre o dólar

⏱ 1:10 · curta 0:30 · cliques: 2

**FALA**

Algo que vocês conhecem bem: serviço importado. IA, GPU e servidor são cobrados em dólar ou euro. Câmbio do dia: cerca de R$ 5,49. **No cartão de pessoa física, com IOF de 3,5%: R$ 5,69 por dólar.**

[CLIQUE 1]

**Com CNPJ, entram IRRF, CIDE, CBS e IBS, ISS e IOF: R$ 7,97 por dólar.**

[CLIQUE 2]

[PAUSA] **40% a mais em tudo o que é pago lá fora. Por isso os seis meses vão no cartão de pessoa física.** E por isso, no lançamento, todo o custo de IA já está calculado a R$ 7,97.

[AVANÇA]

> **Para você entender** · Importação de serviço por pessoa jurídica: IRRF retido, CIDE-remessas, tributos sobre consumo (PIS/Cofins-importação, em transição para CBS/IBS), ISS sobre importação e IOF-câmbio. PTAX: taxa de câmbio oficial do Banco Central. Aqui a plateia sabe mais que você; se alguém detalhar alíquotas, agradeça e anote.

---

## Seção 13 · GPU e custo por pergunta

### Slide 55 · GPU em três fases

⏱ 1:00 · curta 0:20 · cliques: 3

**FALA**

A GPU é a placa que roda os nossos modelos pequenos: o revisor, o GPS da busca. **No desenvolvimento, só alugada por hora, ligada quando precisa: cerca de 275 horas, uns R$ 2,6 mil.**

[CLIQUE 1]

No lançamento: servidor dedicado alugado, cerca de R$ 2,5 mil por mês com 500 usuários pagantes.

[CLIQUE 2]

**O ideal: GPU própria, num datacenter em São Paulo.** R$ 40,8 mil uma vez, mais R$ 1.075 por mês. E ela roda também o nosso agente.

[CLIQUE 3]

**Como o imóvel: aluga-se para começar, compra-se quando o uso justifica.**

[AVANÇA]

> **Para você entender** · RunPod e Hetzner são empresas que alugam servidores com GPU. Datacenter (colocation) = você é dono da máquina e paga para ela ficar num prédio com energia, refrigeração e segurança. É a decisão de imobilizado que vocês fazem com clientes: alugar enquanto não compensa comprar.

### Slide 56 · Comprar GPU própria

⏱ 1:00 · curta 0:25 · cliques: 1

**FALA**

**Alugar para sempre não é sustentável. O aluguel cresce com a base. A máquina própria, não.** Gasto mensal. Com 500 usuários: alugar, R$ 2.457; a própria, R$ 3.215, porque mantemos uma alugada de reserva. Não se paga. Com 3.000: se paga em 24 meses. Com 10.000: em 6.

[CLIQUE 1]

[PAUSA] **A regra: compramos quando a compra se paga em até 12 meses. Isso acontece por volta de 3.500 usuários pagantes.** Sempre num datacenter em São Paulo, com um servidor alugado de reserva.

[AVANÇA]

> **Para você entender** · Payback = tempo para a economia mensal devolver o investimento. Depreciação em 36 meses: R$ 2.208/mês. Placa RTX 5090 a ~R$ 27,8 mil (mediana de 3 meses no gpuprix) + computador de R$ 13 mil (premissa).

### Slide 57 · Custo por pergunta

⏱ 1:10 · curta 0:30 · cliques: 3

**FALA**

**O ponto que mais importa para o preço.** O jeito de hoje: pegar uns 80 mil tokens de texto e mandar tudo para um modelo grande. No Opus, R$ 2,87 por pergunta. No Sonnet, R$ 1,43.

[CLIQUE 1]

O nosso jeito: o funil filtra antes, nas nossas máquinas, e a maioria das perguntas vai para o Haiku. **R$ 0,22 por pergunta. Já com a conferência das citações.**

[CLIQUE 2]

[PAUSA] **De 6 a 13 vezes menos.** Honestidade: os concorrentes não publicam quanto gastam; esta é a conta com a mesma tabela de preços para os dois jeitos. O nosso número é estimativa. A meta é medir até R$ 0,30 com vocês.

[CLIQUE 3]

**Triagem antes: o processo inteiro não vai ao advogado mais caro.**

[AVANÇA]

> **Para você entender** · Valores só de IA, já com os tributos de importação (R$ 7,97/US$). Mix estimado: Haiku na maioria, Sonnet ~9%, Opus ~1% (pesquisa 08; a medir com o grupo).

### Slide 58 · Custo total por pergunta

⏱ 0:50 · curta 0:15 · cliques: 0

**FALA**

O slide anterior era só a IA. Agora tudo: IA, GPU, servidor, melhoria contínua, seguro, auditoria, suporte, contador. **50 usuários: R$ 2,69 por pergunta. 500: R$ 0,63. 3.000: R$ 0,47. 10.000: R$ 0,39.** [PAUSA] A tecnologia se dilui; a parte cinza, seguro e suporte, cresce com o número de clientes. A escala trabalhando a favor.

[AVANÇA]

> **Para você entender** · É rateio de custo fixo: o servidor custa quase o mesmo para 50 ou 500 usuários, então o custo unitário cai. Não inclui tributos sobre a receita nem taxa do meio de pagamento.

---

## Seção 14 · Preço e escala

### Slide 59 · Preço por pergunta

⏱ 0:50 · curta 0:20 · cliques: 2

**FALA**

O outro lado: preço. Quanto se paga hoje por consulta. Jus IA, plano de entrada: cerca de R$ 2,63 por mensagem. Locus.IA: R$ 2,50 por análise.

[CLIQUE 1]

**O nosso Individual: R$ 199 por 100 perguntas. R$ 1,99 cada.** E cada pergunta é uma pesquisa fundamentada, com citação conferida e data do fato.

[CLIQUE 2]

[PAUSA] Mesmo mais barato, sobra margem: cerca de 67% com metade da cota, 62% com a cota cheia.

[AVANÇA]

> **Para você entender** · Margem aqui = (preço − tributos − meio de pagamento − IA − infraestrutura rateada) ÷ preço, com 500 usuários. "Cota" = franquia de perguntas do plano.

### Slide 60 · Planos

⏱ 1:00 · curta 0:25 · cliques: 1

**FALA**

Os planos do lançamento, com nota fiscal no CNPJ do escritório e desconto no anual. **Grátis, com 10 perguntas simples por mês. Individual, R$ 199. Escritório, R$ 790, com 5 usuários e 400 perguntas: o tamanho do escritório típico.** Corporativo, R$ 2.290. Enterprise, a partir de R$ 6.900. Margem entre 62% e 68% em todos.

[CLIQUE 1]

Passou da cota? Pacote de 100 perguntas por R$ 149. [PAUSA] Isso segura a conta: um plano "ilimitado" quebraria a margem.

[AVANÇA]

> **Para você entender** · Anual: Individual R$ 169, Escritório R$ 659, Corporativo R$ 1.890 por mês. O plano Grátis custa para nós R$ 0,43 por usuário/mês: é custo de aquisição de cliente (como a primeira consulta gratuita).

### Slide 61 · Ao lado do mercado

⏱ 0:50 · curta 0:20 · cliques: 1

**FALA**

Os concorrentes em cinza, por usuário e por mês. E a faixa de R$ 79 a R$ 250 que o profissional já paga.

[CLIQUE 1]

Nossos planos caem dentro da régua. O Individual empata com o Portal da Reforma, que só cobre a reforma, e fica abaixo do Jus IA Premium e do Locus.IA. **O Escritório sai a R$ 158 por usuário. É o plano em que eu mais quero ouvir vocês sobre preço.** E para quem já tem IA grátis no sistema contábil: não competimos com o sistema. Somos a camada de consulta que ele não tem.

[AVANÇA]

> **Para você entender** · O pacote IOB de 5 usuários sai a cerca de R$ 97 por usuário (contrato público de 2023 corrigido, estimativa): é um portal com IA acessória, não uma pesquisa com citação conferida.

### Slide 62 · Escala e equilíbrio

⏱ 0:50 · curta 0:25 · cliques: 1

**FALA**

**Para quem está financiando, a boa notícia: com 44 usuários pagantes, a operação se paga.** Sem contar salário. Só o grupo de vocês pode chegar perto disso. Com 500 usuários: resultado de R$ 51 mil por mês, margem de 62%.

[CLIQUE 1]

[PAUSA] Com um pró-labore de R$ 10 mil para mim, que ainda é premissa a confirmar, o equilíbrio vai para 137 usuários.

[AVANÇA]

> **Para você entender** · Breakeven (ponto de equilíbrio) operacional: receita = custos. Os cenários usam Simples (Anexo V) com 50 e 500 usuários e Lucro Presumido de 2027 com 3.000 e 10.000. Com pró-labore ≥ 28% da receita, a empresa iria para o Anexo III pelo fator R: o mesmo caso do slide 12.

---

## Seção 15 · Riscos, aporte e encerramento

### Slide 63 · Riscos

⏱ 1:00 · curta 0:30 · cliques: 0

**FALA**

O que pode dar errado. **O maior risco: uma resposta errada dita com confiança. Quase toda a arquitetura existe para impedir isso: citação conferida e abstenção.** Orçamento estourar o teto: alavancas, limite de gasto, ordem de corte. Uma técnica experimental não vencer no teste: fica desligada, sem custo extra. Convenção coletiva ter direito autoral: pergunta para o advogado do grupo; se não puder, mostramos o dado com a citação. Um agente agir fora do combinado: permissão por ação e aprovação humana. [PAUSA] E uso acima da cota: franquia e pacote extra.

[AVANÇA]

> **Para você entender** · Lei 9.610/1998 (direitos autorais), art. 8º, IV: atos oficiais (leis, decretos, decisões) não têm proteção autoral. Falta saber se convenção coletiva, que é um acordo privado depositado no MTE, se enquadra.

### Slide 64 · Próximos passos

⏱ 2:20 · curta 1:30 · cliques: 4

**FALA**

O que acontece agora.

[CLIQUE 1]

**Primeiro: fechar o grupo de playtesters e o aporte. E aqui eu peço com clareza: R$ 20 mil para os seis meses, dividido entre os escritórios do grupo.** [PAUSA] Para onde vai cada real. Tudo no meu cartão de pessoa física, a R$ 5,69 por dólar, com o CNPJ aberto só no fim, como vimos.

- **R$ 6.828: o Claude Ultra**, o antigo Max 20x, US$ 200 por mês. O agente de programação que faz o trabalho de uma equipe. Sem ele, não há seis meses.
- **R$ 1.024: o Cursor Premium**, US$ 30 por mês. O editor de código com os agentes.
- **R$ 360: um servidor isolado** para testar agentes abertos, como OpenClaw e Hermes, longe de qualquer dado real.
- **R$ 9.296: o desenvolvimento em si**, o do slide do investimento, já com as alavancas: API, GPU por hora, servidor, domínio, e-CNPJ, termos.
- **R$ 2.492: uma reserva de cerca de 12%**, porque são estimativas e o dólar oscila.

[PAUSA] Uma possível folga, que ainda estou confirmando: o plano Ultra inclui US$ 200 por mês em créditos de API. Se confirmar, parte do custo de IA já está paga. Vira sobra, não gasto novo.

E além do dinheiro: **50 perguntas reais do dia a dia, com a resposta certa. Uso desde o alfa, marcando erros. E a lista das tarefas repetitivas que vocês gostariam de entregar a um agente.**

[CLIQUE 2]

**Segundo: montar com vocês as perguntas com gabarito.** Começa com 50 e chega a 200. É a régua de tudo. É a prova que a DGM vai fazer.

[CLIQUE 3]

Terceiro: levar ao advogado do grupo a questão do direito autoral das convenções.

[CLIQUE 4]

**Quarto: começar. Pela base federal, com todas as versões.**

[AVANÇA]

> **Para você entender** · Soma: 6.828 + 1.024 + 360 + 9.296 + 2.492 = R$ 20.000. Conferência: US$ 200 × 6 × 5,69 = R$ 6.828; US$ 30 × 6 × 5,69 ≈ R$ 1.024. A reserva é ~12% do total (≈ 14% sobre os R$ 17.508 de custos). Os R$ 9.296 são o desenvolvimento "com alavancas", cuja faixa vai de R$ 5,6 mil a R$ 15,9 mil; a reserva cobre parte desse risco, não todo. O slide mostra os itens nesta mesma ordem.

### Slide 65 · Encerramento

⏱ 0:40 · curta 0:30 · cliques: 0

**FALA**

*(deixe as três linhas aparecerem)* [PAUSA]

**Começamos com três linhas. Terminamos com elas.**

**A lei certa: cada artigo guarda todas as suas versões.**

**Na data certa: toda pergunta carrega a data do fato.**

**Com a prova: cada citação é conferida. Sem prova, o sistema diz "não encontrei".**

[PAUSA] **Seis meses. R$ 20 mil. Vocês medindo desde o primeiro dia.**

**Vocês são os especialistas. Eu construo a ferramenta. Obrigado. Agora, perguntas.**

*(fim; deixe o slide com "Enzo Vasconcelos" na tela durante as perguntas)*

> **Para você entender** · Termine e fique em silêncio. A primeira pergunta demora uns segundos; não preencha o silêncio. Se ninguém perguntar, use: "Uma pergunta que sempre me fazem é: e se a IA errar?" (resposta 4 abaixo). Se o grupo quiser entrar, peça para falarem com você na saída.

---

## Perguntas prováveis

Respostas curtas, honestas e baseadas no plano. Quando a resposta não está no plano, está marcado **[a combinar]**: diga isso com tranquilidade.

**1. Se a resposta estiver errada e meu cliente for autuado, quem responde?**
Quem assina é o contador com CRC; o produto é um assistente, não substitui o profissional. O que eu faço é reduzir o risco e deixar tudo rastreável: toda resposta mostra a fonte e a data de vigência, registro qual versão da base gerou cada resposta, e publico a taxa de erro medida. Seguro de responsabilidade profissional entra a partir de 500 usuários.

**2. Meus dados e os dos meus clientes ficam seguros? E a LGPD?**
Cada escritório fica cifrado e isolado, com registro de acesso. Nada é usado para treinar modelos. A pergunta vai ao modelo de IA fora do país, com as cláusulas-padrão da ANPD, e o fornecedor não guarda nem treina com ela. Termos de uso e LGPD ficam prontos antes de qualquer cobrança.

**3. De onde vem a lei? Vocês copiam das editoras?**
Não. Só fontes oficiais: Diário Oficial (INLABS), Planalto, LexML, Receita, CARF, CONFAZ, Sefaz, diários municipais, Mediador do MTE e Juntas. Compilação de editora tem direito autoral e serve só para conferência manual.

**4. E se a IA errar?**
Três travas. Antes de entregar, cada citação passa por três perguntas: existe, valia na data, diz o que se afirma. Sem prova, o sistema responde "não encontrei base legal". E quando mesmo assim errar, você clica em "incorreta", corrige, e isso vira um caso de teste que nenhuma versão futura pode reprovar.

**5. Isso tudo é experimental. E se não funcionar?**
Então não entra. Cada técnica nova disputa no benchmark, com as perguntas de vocês, contra o método clássico que já funciona (busca por palavra, filtro de vigência, citação conferida). Se perder, fica desligada por uma chave, e o custo não muda. O que nunca é experimental: a base legal, as calculadoras e a conferência das citações.

**6. Por que arriscar com técnicas tão novas, em vez de usar o que já é testado?**
Porque o que já é testado é o que os 18 concorrentes fazem, e é justamente o que erra com lei: traz a redação errada, o texto revogado, não segue remissão. As técnicas novas foram publicadas em conferências científicas com revisão (ICLR, COLM) e atacam esses problemas um por um. E o risco é controlado: só entra o que vence, com aprovação humana. No pior caso, vocês ficam com o método clássico.

**7. O que é a DGM, em uma frase?**
Seleção natural aplicada ao código do agente: cada nova versão lê os próprios erros, propõe uma mudança, faz a prova com as perguntas de vocês, e só fica se acertar mais. Se pedirem mais: é de 2025, de pesquisadores da UBC, do Vector Institute e da Sakana AI, aceita no ICLR 2026, e levou um agente de programação de 20% para 50% no SWE-bench.

**8. A DGM pode "aprender errado" ou mexer na lei sozinha?**
Não na lei: a base legal, as calculadoras e as regras de segurança ficam fora da área que ela pode editar. Contra "aprender errado", ou burlar a prova, que o próprio artigo relata: um conjunto reservado de perguntas que ela nunca vê, métrica que pune erro e omissão, auditoria humana por amostra, execução isolada e a versão anterior pronta para voltar. E nada vai ao ar sem uma pessoa aprovar.

**9. Por que eu pagaria se já tenho o ChatGPT?**
O ChatGPT não sabe qual redação valia em 2022, não confere a citação e não foi feito para dizer "não sei". O exemplo do slide 6 é o tipo de erro que ele comete: lei revogada e artigo inventado. Aqui a diferença é data do fato, citação conferida e cálculos feitos por calculadora.

**10. Quanto custa para mim?**
Agora, no desenvolvimento: a sua parte do aporte de R$ 20 mil, dividido entre os escritórios do grupo (se forem 10 escritórios, por exemplo, R$ 2 mil cada). Depois do lançamento: Individual R$ 199/mês, Escritório R$ 790/mês para 5 usuários. Condição especial para quem financiou: **[a combinar com o grupo]**.

**11. O que eu ganho sendo playtester?**
Usa o sistema desde o começo, molda o produto com as suas perguntas e decide quais agentes vêm primeiro (a lista de tarefas que você quer delegar). Benefícios comerciais, como desconto ou acesso no lançamento, **[a combinar com o grupo]**: prefiro decidir com vocês a prometer aqui.

**12. Como fica o aporte? Para quem eu pago? Que garantia eu tenho?**
Os gastos são pagos no meu cartão de pessoa física, porque sai 40% mais barato que via CNPJ (R$ 5,69 contra R$ 7,97 por dólar); o CNPJ é aberto no fim do desenvolvimento. A forma jurídica do aporte (doação para desenvolvimento, pré-pagamento de assinatura, participação) e a prestação de contas mês a mês **[a combinar com o grupo]**. Há limite mensal de gasto e alerta, e uma ordem de corte definida.

**13. E se faltar dinheiro?**
Tem reserva de cerca de 12%. Se passar disso, a ordem de corte já está definida: primeiro o 3º ciclo da DGM, depois a 2ª rodada de treino da política de busca, depois o doc2query completo. O que é essencial para o portão final não entra no corte.

**14. E se sobrar dinheiro?**
É possível, principalmente se os créditos de API do Claude Ultra se confirmarem. O destino da sobra **[a combinar com o grupo]**.

**15. Qual é o prazo? Quando eu uso de verdade?**
Você participa desde o começo: manda perguntas com gabarito, usa o alfa assim que existir e, antes do fim dos seis meses, já usa como se estivesse lançado. Lançamento comercial no mês 7. O detalhe está no slide 52.

**16. E se o Enzo sumir?**
É uma pergunta justa: é um projeto de uma pessoa, e isso é um risco real. O que mitiga: todo o código e os planos ficam versionados num repositório, a base guarda os documentos originais e as regras de montagem, e o método está documentado. Dar ao grupo acesso ao repositório ou um acordo de continuidade **[a combinar com o grupo]**: estou aberto a colocar isso no acordo do aporte.

**17. Funciona para o meu estado (ex.: Bahia, Rio de Janeiro)?**
No lançamento: federal mais SP, MG, PR, SC e RS, com as capitais e os municípios onde os escritórios do grupo têm clientes. A parte federal (IRPJ, PIS/Cofins, Simples, trabalhista federal) serve para todos. Outros estados entram como expansão, se houver demanda.

**18. Quanto tempo leva para uma lei nova aparecer?**
A meta é menos de 24 horas entre o Diário Oficial e a base. Antes disso, a busca ao vivo encontra a norma e responde com a marca "ainda não validada na base".

**19. Vai substituir o meu sistema contábil?**
Não. Não faço escrituração, guia nem obrigação acessória. É a camada de consulta e pesquisa que o sistema não tem.

**20. Cobre a reforma tributária?**
Sim. A base guarda CBS, IBS e IS convivendo ano a ano com PIS/Cofins, ICMS e ISS até 2033, e a resposta usa a regra de cada tributo na data do fato.

**21. Por que o aporte paga Claude Ultra e Cursor? Isso não é ferramenta sua?**
São as ferramentas que substituem uma equipe de programadores. O plano de R$ 9,3 mil deixava a assinatura do agente de fora; o aporte de R$ 20 mil põe tudo na mesa, com transparência, para não haver custo escondido.

**22. Vocês disseram que não usam agentes de terceiros. Por que o servidor para OpenClaw e Hermes?**
Exatamente por causa dos riscos documentados: eu os testo num servidor isolado, sem dados de cliente nem senhas, para saber o que aproveitar. O produto usa o nosso agente, na nossa máquina, com permissão por ação e aprovação humana.

**23. Preciso instalar alguma coisa ou ter computador potente?**
Não. Só o navegador. O processamento acontece nos servidores.

**24. E se a Anthropic ou o dólar aumentarem o preço?**
Está simulado: com API 30% mais cara, a margem do Individual cai de 67,3% para 65,7%; com câmbio 10% mais caro, para 66,5%. Como a IA cara só entra no fim do funil, a variação pesa pouco.

---

## Glossário (uma linha por termo)

**Tecnologia**

- **IA / modelo de linguagem (LLM):** programa treinado em muito texto que entende e escreve linguagem natural.
- **Treino / pesos:** a fase em que o modelo lê bilhões de textos e fixa o que aprendeu em números internos (pesos); depois disso, não aprende sozinho.
- **Alucinação:** quando a IA inventa algo com cara de verdade (artigo inexistente, lei revogada).
- **RAG:** buscar primeiro os trechos certos e só depois a IA redigir com base neles; a prova com consulta.
- **Claude (Haiku, Sonnet, Opus):** a IA da Anthropic, em três tamanhos: barato, médio e caro.
- **Token:** pedaço de palavra; a IA cobra por tokens lidos e escritos.
- **API:** a "tomada" pela qual um programa usa outro serviço pela internet, pagando por uso.
- **GPU:** placa de vídeo que roda modelos de IA; alugada por hora ou comprada.
- **Agente:** IA que executa tarefas em passos (pesquisar, conferir, avisar), não só responde.
- **Base temporal:** a lei guardada com todas as versões e datas; histórico de versões de um documento.
- **Dispositivo:** artigo, parágrafo, inciso ou alínea, cada um guardado como unidade.
- **URN LexML:** identificador nacional único de cada norma.
- **Akoma Ntoso:** padrão internacional para estruturar textos legislativos.
- **ICLR / COLM / NeurIPS:** conferências científicas de IA com revisão por pares; ser aceito lá é o selo de qualidade da área.
- **Estado da arte / experimental:** técnica recém-publicada, à frente do que os produtos usam; aqui só entra se vencer no benchmark.
- **Árvore de temas (RAPTOR, 2024):** classificação em níveis com resumos; o sumário do livro.
- **Cache semântico:** reaproveitar resposta já validada para pergunta igual em outras palavras, se a lei não mudou.
- **Embedding:** impressão digital numérica do significado de um texto.
- **Filtro de vigência:** separar só a redação válida na data do fato; a data de validade no rótulo.
- **BM25:** busca por palavras exatas que valoriza termos raros; o Ctrl+F inteligente.
- **doc2query:** perguntas escritas de antemão e coladas em cada artigo, como post-its.
- **ColBERT (multivetorial):** busca por significado termo a termo; o bibliotecário que entende o que você quis dizer.
- **LIMIT (ICLR 2026):** estudo da Google DeepMind que provou o limite matemático de resumir cada texto num vetor único.
- **Grafo / PageRank (HippoRAG 2, 2025):** rede de quem cita quem; o boca a boca entre normas.
- **Reranker (Rank1, 2025):** revisor que lê ~50 candidatos, escolhe 5 a 10 e explica por quê.
- **Política de busca (Search-R1, 2025):** modelo pequeno que decide buscar mais ou parar; o GPS que aprende atalhos.
- **Aprendizado por reforço (RL):** treino por nota no resultado, como estágio com avaliação.
- **DGM (Darwin Gödel Machine):** seleção natural aplicada ao código do agente; cada nova versão só fica se provar resultado (Zhang, Hu, Lu, Lange e Clune; 2025; ICLR 2026).
- **SWE-bench:** prova padronizada de agentes de programação com problemas reais de software; onde a DGM foi de 20% para 50%.
- **Chave (feature flag):** interruptor que liga ou desliga uma técnica sem mexer no resto do sistema.
- **Benchmark:** prova padronizada com gabarito, montada pelos contadores do grupo.
- **Conjunto reservado:** parte da prova (20%) que o sistema nunca vê; decide o portão final.
- **Abstenção:** responder "não encontrei base legal" em vez de inventar.
- **Cálculo determinístico:** conta feita por programa comum; mesma entrada, mesmo resultado.
- **Ingestão:** transformar a lei publicada em fichas organizadas na base.
- **Congelamento do esquema:** fixar o formato das fichas depois de testado; o plano de contas antes de lançar.
- **Coletor:** programa que visita as fontes e só traz o que é novo; o office boy.
- **Hash:** impressão digital de um arquivo; muda se uma vírgula mudar.
- **OCR:** leitura de texto em imagem ou PDF escaneado.
- **robots.txt:** aviso do site dizendo o que robôs podem visitar.
- **CAPTCHA:** o "não sou um robô"; exige uma pessoa.
- **Humano no circuito:** uma pessoa resolve a etapa que exige gente, pelo celular, como autorizar um Pix.
- **Busca ao vivo (MCP):** consulta direta às fontes oficiais quando a base ainda não tem a norma.
- **Produção:** o sistema que os clientes usam de verdade.
- **Alfa / beta:** primeira versão crua / versão quase pronta para grupo fechado.
- **Playtester:** quem usa durante o desenvolvimento e aponta os erros.
- **Servidor dedicado / VPS:** computador alugado num datacenter, inteiro ou em fatia.
- **Colocation:** sua máquina hospedada num datacenter de terceiros.
- **RunPod / Hetzner:** empresas que alugam GPU e servidores.
- **Voyage:** empresa que fornece o serviço de embedding.
- **Claude Ultra:** plano de assinatura do Claude usado como agente de programação (antigo Max 20x).
- **Cursor:** editor de código com agentes de IA.
- **OpenClaw / Hermes / Grok Bot:** agentes de terceiros; testados só em ambiente isolado.
- **Payback:** tempo para a economia devolver o investimento.
- **Breakeven:** ponto em que a receita cobre os custos.

**Contabilidade, tributos e trabalho**

- **Data do fato:** data do fato gerador; define qual regra vale.
- **Decadência:** prazo de 5 anos para o fisco lançar o tributo.
- **Multa de ofício:** 75% do tributo quando o fisco descobre a falta (Lei 9.430, art. 44, I).
- **Selic:** taxa básica de juros, usada nos juros de mora federais.
- **Simples Nacional:** regime unificado da LC 123/2006, com guia única (DAS), até R$ 4,8 mi/ano.
- **Anexos do Simples:** tabelas de alíquota por atividade (I comércio, II indústria, III a V serviços).
- **Fator R:** folha de 12 meses ÷ receita de 12 meses; ≥ 28% leva certas atividades ao Anexo III.
- **RBT12:** receita bruta dos últimos 12 meses.
- **Alíquota efetiva:** (RBT12 × alíquota − parcela a deduzir) ÷ RBT12.
- **CGSN:** Comitê Gestor do Simples Nacional, que edita resoluções.
- **MEI:** microempreendedor individual (LC 123, art. 18-A).
- **Lucro Presumido:** regime em que o lucro tributável é um percentual fixo da receita.
- **Pró-labore:** remuneração do sócio pelo trabalho; entra no fator R.
- **ICMS / ISS:** imposto estadual sobre mercadorias e alguns serviços / imposto municipal sobre serviços.
- **ICMS-ST / MVA:** substituição tributária / margem de valor agregado usada no cálculo.
- **RICMS:** regulamento do ICMS de cada estado.
- **CONFAZ:** conselho dos estados que aprova convênios de ICMS.
- **Sefaz:** secretaria estadual da fazenda.
- **CBS / IBS / IS:** contribuição federal que substitui PIS/Cofins / imposto de estados e municípios que substitui ICMS e ISS / imposto seletivo.
- **EC 132/2023 e LC 214/2025:** emenda da reforma tributária e sua lei complementar.
- **IN (instrução normativa):** norma da Receita que detalha a lei.
- **Solução de Consulta COSIT:** resposta oficial da Receita a dúvida de contribuinte; orienta a fiscalização.
- **CARF:** tribunal administrativo federal que julga recursos contra autuações.
- **Acórdão:** decisão de um tribunal colegiado.
- **NBC TG / CPC:** normas brasileiras de contabilidade.
- **Vigência / eficácia:** quando a norma passa a valer / quando passa a produzir efeito.
- **Revogação tácita:** lei nova contradiz a antiga sem citá-la.
- **Remissão:** quando um artigo manda ler outro ("conforme o art. X").
- **Retificação:** republicação para corrigir erro do texto.
- **Convenção coletiva (CCT) / acordo coletivo (ACT):** acordo entre sindicatos de empregados e patronal / entre sindicato e empresa.
- **Data-base:** mês de renegociação anual da categoria.
- **Mediador (MTE):** sistema onde as convenções são depositadas (CLT, art. 614).
- **Junta Comercial:** órgão estadual de registro de empresas.
- **DREI:** órgão federal que normatiza as Juntas.
- **eSocial:** escrituração digital das obrigações trabalhistas e previdenciárias.
- **SPED (EFD, ECD, ECF):** sistema de escriturações digitais fiscais e contábeis.
- **NF-e / NFS-e:** nota fiscal eletrônica de mercadorias / de serviços.
- **NCM / CFOP / CNAE:** código da mercadoria / da operação fiscal / da atividade econômica.
- **e-CAC:** portal da Receita acessado com certificado digital.
- **e-CNPJ:** certificado digital da empresa.
- **Serviço importado:** pagamento ao exterior que, via CNPJ, atrai IRRF, CIDE, CBS/IBS, ISS e IOF.
- **IOF:** imposto sobre operações financeiras; 3,5% no cartão internacional.
- **PTAX:** taxa de câmbio oficial do Banco Central.
- **LGPD / ANPD:** lei de proteção de dados / autoridade que a fiscaliza.
- **Cláusulas-padrão da ANPD:** modelo de contrato para enviar dados ao exterior.
- **LAI:** Lei de Acesso à Informação (12.527/2011).
- **Amostragem de auditoria:** conferir uma amostra sorteada, dirigida ao risco, para medir o erro do todo.
