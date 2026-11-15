# Edição no lugar (fase 6)

O sistema deixou o "Editar" com gaveta. O valor que se pode mudar aparece sublinhado em pontilhado. Clicar nele (ou dar Tab e Enter) abre um seletor do tipo certo: popover no computador, folha de baixo no celular. A gravação é otimista, o aviso traz "Desfazer" e o histórico continua no evento de sempre. A gaveta ficou só para criar coisa nova.

O desenho que entra no design system está na proposta 7 de [PROPOSTAS_DESIGN_SYSTEM.md](PROPOSTAS_DESIGN_SYSTEM.md). Ela ainda espera a aprovação do dono.

## Primitivas (`app/src/components/kit/valor-editavel/`)

| Primitiva | O que faz |
| --- | --- |
| `ValorEditavel` | Valor sublinhado que abre o seletor. Tipos: escolha, múltipla (chips), intervalo, número, dinheiro, data, competência, entidade (cliente, pessoa ou setor, com busca), cor, texto curto ou de várias linhas, e plano de dois eixos. Mostra "+ Outra coisa" quando a lista não basta. Tem estados de carregando, vazio e erro (com "Tentar de novo"). Se a gravação falha, o valor volta e o erro aparece ao lado. O leitor de tela lê "Cliente: Padaria, alterar". No toque, a área de clique tem 44 px. |
| `Suposicoes` | `FaixaSuposicoes` fica acima do campo de pedido ("Vou supor: Para **Padaria** · Competência **10/2026** · Setor **Fiscal**"), com cada valor editável. `CampoComSuposicoes` sublinha as palavras do pedido que geraram cada suposição, e clicar nelas abre o seletor. `ResumoSuposicoes` repete o resumo no topo da resposta. |
| `Lacuna` | `RascunhoComLacunas` mostra o rascunho com o que o integrante não sabe em branco. Cada lacuna abre o seletor do tipo e, preenchida, vira valor editável. O rodapé conta: "Preencha as três lacunas e eu continuo", "Faltam duas". A lacuna marcada `opcional` não entra na conta e, em branco, sai do texto. |

`EdicaoEmLinha` virou um invólucro do tipo texto, então os usos antigos ganharam o padrão sem mudar de API. Os números que eram editados como texto passaram para o seletor numérico.

## Onde entrou

- **Cartões de aprovação.** Os argumentos ligados a um campo da ação viram valores editáveis no próprio cartão. Corrigir muda a ação guardada no banco, então aprovar no sino ou na Visão geral executa o corrigido. A correção também troca a assinatura dos argumentos (FNV-1a, sete dígitos hexadecimais), registra quem mudou o quê ("de A para B") e faz o botão virar "Aprovar com a correção" (decisão `editar_e_aprovar`). Ligados até agora:
  - o canal do envio de documento;
  - os clientes de uma ação em lote da aba;
  - a vigência e o motivo da versão do perfil;
  - a regra proposta (cartão de regra);
  - as contas do lote no app do cliente.
- **Telas.**
  - Configurações: escritório, setores, notificações, tema, domínios, remetente, integrantes padrão, modelos de texto e de documento, nome no WhatsApp, assinatura e limites.
  - CRM: horário de atendimento, SLA e réguas de comunicados.
  - BPO: SLA, janela e escalonamento, ficha da empresa, limiares, alçada e teto do WhatsApp, capacidade, convidados e procedimentos.
  - Financeiro: régua, política de inadimplência e tabela de avulsos.
  - Memória do integrante.
- **Feedforward**, com a regra primeiro e o serviço simulado de IA depois. Está no chat do Assistente, no chat com cada integrante e em "Pedir ao integrante":
  - a regra acha cliente (por CNPJ, nome ou palavra marcante), competência, setor (pelas palavras do mapa), valor e prazo, sem esperar rede;
  - o serviço simulado completa só o que faltou: nome parecido na carteira, cliente da tela, setor do integrante;
  - a primeira resposta começa com o mesmo resumo.
- **Lacunas nos rascunhos dos integrantes.**
  - Mensagem ao cliente: prazo do extrato, assunto do retorno e em que pé está.
  - Ata da reunião: data, presentes, decisões e próxima reunião.
  - Relatório do mês: competência, cliente e o que destacar.
  - Preenchido, o rascunho de mensagem vira a prévia que segue para aprovação.
  - "Integrante sugere" no CRM: a sugestão aparece no compositor, no lugar do campo, com o que vem da conversa (nome de quem escreve, imposto citado, anexo recebido, assunto do e-mail) e lacunas para o resto: guia (competência e prazo; vencimento e valor quando já saiu; qual imposto quando a mensagem não diz), documento recebido (qual documento, entre os do cliente; competência e prazo), notas (competência e prazo), admissão, intimação, pedido de opinião, lead e o resto (prazo; assunto quando não há). Toda sugestão termina com "algo a acrescentar", opcional. O Enviar só libera sem lacuna obrigatória e diz o motivo ("Faltam duas lacunas"). "Editar como texto" leva o rascunho preenchido para o campo; "Descartar" volta ao campo de antes. O que sai é texto puro, pelo mesmo envio de sempre.
- **WhatsApp com o cliente:** não mudou (as bolhas e o canal são os de sempre).

## QA

`app/scripts/qa-edicao.cjs` abre o seletor de cada tipo no Lab em 390 (toque), 768 (toque) e 1440. Cada tipo roda com texto curto, muito longo e sem espaço, com poucas opções e com o dobro, e com o gatilho no meio do texto e no canto da tela. Em cada caso, confere:

- se o seletor cabe na tela;
- se algum elemento vaza do seletor;
- se a página ganha rolagem horizontal;
- se a área de toque tem 44 px;
- se Esc fecha e devolve o foco;
- se há erro no console.

Rodada final: 198 casos, nenhuma falha. A rodada anterior achou que a folha de baixo não devolvia o foco ao valor, o que foi corrigido no kit.

Também foram corrigidos no kit, durante a conversão:

- o "Aplicar" de um seletor dentro de gaveta não fecha mais a gaveta: o submit subia pela árvore do React a partir do portal;
- o "Desfazer" usa o `onMudar` mais recente, para não desfazer outros campos com estado velho.

## Em aberto

- **Esperando o dono.** A manipulação direta no "Editar painel" (pergunta (b)). O "Editar painel" segue como estava. As lacunas do "integrante sugere" no CRM (pergunta (a)) foram decididas e entraram.
- **O kit ainda não tem:**
  - seletor de hora (horários aparecem como texto validado em 00:00);
  - "limpar" na data (a ficha BPO não volta a "fora do paralelo");
  - cor livre (o tipo cor só oferece paleta fixa; a cor do integrante padrão usa o seletor do navegador, como no bloco Cores).
- **Ainda em gaveta de edição.** Alçadas de aprovação e NFS-e do escritório (Financeiro), e a decisão com argumentos na ficha da tarefa.
- **Dado perdido.** O interruptor "Travar estas regras" (time padrão) nunca era gravado e saiu junto com a gaveta. Se for para existir, precisa de um campo no modelo de dados.
