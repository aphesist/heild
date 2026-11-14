# Decisões do wireframe

Registro das decisões tomadas durante as sessões do wireframe interativo que mudam o plano, preenchem o que o plano não diz (as marcas **[sem regra no plano]** do `MAPA_DE_TELAS.md`) ou pedem mudança num arquivo compartilhado (`SESSOES.md`, seção 2). A fonte da verdade dos planos continua no repositório de trabalho; a coordenação leva estas decisões de volta a `docs/planos-dgm/` de lá.

## Como registrar

- Cada sessão escreve **só na sua seção** abaixo, acrescentando no fim dela (evita conflito entre branches).
- Uma decisão por registro (título de nível 4, `####`), a mais recente por último. Nada se apaga: decisão revista ganha registro novo que cita a anterior.
- Cite telas e ações pelos códigos do mapa (`S02-T03`, `S02-A40`) e o plano pela forma do mapa ("03, 6.2", "01, ad. 22", "FIS-009", "C2-01").

Formato de cada registro:

```
#### AAAA-MM-DD · SNN · título curto

- **Decisão:** o que foi decidido, em uma ou duas frases.
- **Por quê:** o motivo, e quem decidiu (Enzo, coordenação ou a sessão, como hipótese).
- **Telas e ações:** códigos do mapa afetados.
- **Impacto no plano:** subplano e seção que mudam, ou "nenhum (só desenho)".
- **Arquivos compartilhados:** os que precisaram de mudança fora da regra "só acrescentar", ou "nenhum".
- **Situação:** proposta · aceita pelo Enzo · levada ao plano.
```

## Registros

### Coordenação

#### 2026-11-14 · Coordenação · Celular com menu inferior de cinco destinos

- **Decisão:** no celular (< 768px) vale o plano: menu inferior fixo com cinco destinos (Início, Tarefas, Pendências, Chat, Mais); "Mais" abre a gaveta com os demais módulos. A gaveta atual continua só como o conteúdo do "Mais".
- **Por quê:** é o que o plano pede (03, 2.6) e dá acesso a um toque ao que se usa no dia a dia; decidido pela coordenação a pedido do Enzo.
- **Telas e ações:** S01-A06; moldura de todas as telas no celular.
- **Impacto no plano:** nenhum (confirma 03, 2.6).
- **Arquivos compartilhados:** moldura (S01 é dona).
- **Situação:** aceita pelo Enzo (delegou a decisão).

#### 2026-11-14 · Coordenação · Ordem das abas do Timesheet

- **Decisão:** Meu tempo · Confirmações · Equipe · Rentabilidade (a ordem atual do protótipo), fechando a pendência U5 do 03.
- **Por quê:** começa pelo que cada pessoa usa todo dia e termina na visão do Gestor; decidido pela coordenação a pedido do Enzo.
- **Telas e ações:** telas do S06.
- **Impacto no plano:** 03, pendência U5 fechada.
- **Arquivos compartilhados:** nenhum.
- **Situação:** aceita pelo Enzo (delegou a decisão).

#### 2026-11-14 · Coordenação · Conversas internas pelo botão "Chat" do canto inferior direito

- **Decisão:** a comunicação interna (subplano 11) abre pelo botão flutuante **Chat** do canto inferior direito, presente em todos os módulos. A gaveta do Chat ganha duas abas no topo: **Equipe** (conversas pessoais, grupos, canal do setor e geral) e **Integrantes** (o chat com o time de IA que já existe). O botão mostra o total de não lidas das duas. Dentro da gaveta, "abrir em tela cheia" leva à tela completa das conversas internas (rota própria). **Não há item novo na barra lateral.** No celular, o destino "Chat" do menu inferior abre a mesma coisa.
- **Por quê:** pedido do Enzo ("o chat interno poderia ser acessado via aquele chat que fica no canto inferior direito da tela do painel"); evita mais um item na barra.
- **Telas e ações:** telas do S05 (comunicação interna) e a gaveta do chat da moldura (S01).
- **Impacto no plano:** 11, seção 6 ("Onde mora na tela") passa a ser o botão Chat, não um item da barra lateral.
- **Arquivos compartilhados:** gaveta do chat (S01 acomoda as duas abas; S05 preenche a aba Equipe e a tela cheia).
- **Situação:** aceita pelo Enzo.

### S01 · Início e moldura

### S02 · Painel A: anatomia, Societário, Obrigações, Notas

### S03 · Painel B: Fiscal, Contábil, Consultoria

### S04 · Painel C: DP, Gestão, tarefas, trilhas, ciclo de vida

### S05 · CRM e Comunicação interna

#### 2026-11-14 · S05 · Contrato C8 revisto: botão Chat com abas Equipe e Integrantes

- **Decisão:** cumprindo o registro da Coordenação ("Conversas internas pelo botão Chat"), o C8 passa a ser: `src/ambiente/interna.tsx` exporta `abrirChat({ aba?: 'equipe' | 'integrantes', conversa? })` (abre a gaveta de qualquer lugar; o destino "Chat" do menu inferior do celular chama `abrirChat()`), `useEstadoChat()` (a gaveta lê aberta, aba e conversa) e `useNaoLidasInternas()` (total e por conversa, por pessoa; conversa silenciada não soma). O botão Chat mostra a soma das não lidas da Equipe com os cartões pendentes dos integrantes (o que já era o "pendente" da aba Integrantes). A tela cheia é o módulo `interna` (`#/interna/conversas?conversaInterna=ci-geral`), sem item na barra lateral; o `usePersistente('s05:interna:naoLidas')` do C8 original não é usado (o contador sai das mensagens e do "lido até" de cada pessoa, `s05:interna:lidas:<usuário>`).
- **Por quê:** decisão do Enzo registrada pela Coordenação; a S05 só fez o mínimo na moldura.
- **Telas e ações:** S05-T05, S05-A87; S01-T06 (gaveta do chat), S01-A06 (Chat no celular).
- **Impacto no plano:** 11, 6 (já registrado pela Coordenação).
- **Arquivos compartilhados:** `ModuloTela.tsx` (`GavetaChat`, de S01: abas no topo, contador no botão, abertura controlada por `useEstadoChat`); `Plataforma.tsx` (rota `interna`, ícone, parâmetro `conversaInterna`, a gaveta do Chat passa a aparecer em todos os módulos, não só no Painel, e a condição do `ModuloTela` genérico exclui `interna`); `modulos.ts`, `loja.tsx` (`IdModulo` e `Destino.conversaInterna`), `nucleo/rotas.ts` e `nucleo/permissoes/telas.ts` (módulo `interna` para toda a equipe), só acrescentando.
- **Situação:** proposta.

#### 2026-11-14 · S05 · Comunicação interna nas entidades do 01, com o que falta em `extras`

- **Decisão:** conversas, participações e mensagens usam as entidades que a S00 criou (`conversa_interna`, `participacao`, `mensagem_interna`). O que o 11 pede e o modelo ainda não tem fica em `mensagem_interna.extras` (menções, citações com cliente e setor, anexos com o documento criado, áudio e transcrição, autoria do integrante, proposta de tarefa, tarefa criada, resumo, linha do sistema, quem fixou). O "lido até" de cada pessoa por conversa fica em `registro_tela` (`s05:interna:lidas:<usuário>`) e dá as não lidas e o "visto por". Preferências da pessoa (silenciadas, horário de silêncio, presença, aceite do primeiro uso) e as aberturas em investigação também ficam em `registro_tela` com o prefixo `s05:interna:`. Nenhuma migração nova.
- **Por quê:** a sessão; o backend transforma `extras` em colunas (ou numa tabela de leitura) sem mudar as telas.
- **Telas e ações:** S05-T05, S05-A65 a A87.
- **Impacto no plano:** 01, ad. do 11 (Conversa interna, Mensagem com versões, Participação): sugere as colunas `mencoes`, `citacoes`, `anexos`, `audio` e a tabela `leitura_conversa_interna (usuario_id, conversa_id, lido_ate)`.
- **Arquivos compartilhados:** nenhum além dos já registrados.
- **Situação:** proposta.

#### 2026-11-14 · S05 · Menção a integrante, a setor e a pessoa

- **Decisão:** `@Fiscal` (o nome do integrante no tema) chama o integrante, que responde no fio marcado como IA e com o selo de demonstração; `@equipe Fiscal` avisa todas as pessoas do setor (o mesmo nome curto não serve para os dois); `@Nome` avisa a pessoa com o trecho e, se ela não participa da conversa, leva só o trecho, não o acesso. `#` cita cliente, tarefa, obrigação ou documento, que viram cartões clicáveis; quem não pode ver o cliente (carteira ligada, cliente restrito) ou o setor da tarefa vê "sem acesso".
- **Por quê:** a sessão; o 11, 3 pede as três menções e não diz como diferenciar setor de integrante.
- **Telas e ações:** S05-A72, A73, A74.
- **Impacto no plano:** 11, 3 (forma da menção a setor).
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-14 · S05 · Quando o integrante entra sem ser chamado

- **Decisão:** o integrante só posta sem menção em dois casos: a proposta de tarefa ("parece um pedido: quer que eu crie a tarefa?"), em grupo ou canal, quando a mensagem tem verbo de pedido ou prazo e ninguém chamou outro integrante; e o resumo da manhã, se o Gestor do setor (ou o Administrador) ligar o gatilho no canal: o primeiro a abrir o canal no dia vê o integrante postar o de hoje (no produto, job das 8h). Em conversa pessoal, nunca, salvo chamado. O resumo do fio é pedido pela pessoa e aparece só para ela (não vira mensagem).
- **Por quê:** 11, 4 e P6; "integrantes não leem conversa pessoal".
- **Telas e ações:** S05-A76, A77, A78.
- **Impacto no plano:** nenhum (detalha 11, 4).
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-14 · S05 · Investigação de conversa pessoal pelo Administrador

- **Decisão:** em Preferências › Auditoria, o Administrador vê só os nomes das conversas pessoais de outras pessoas (nunca o conteúdo antes de abrir); abrir exige motivo escrito (`useConfirmar` com motivo), grava evento, posta uma linha do sistema na conversa e avisa os dois pelo sino. A conversa abre só para leitura, com a faixa do motivo, e o Administrador não marca nada como lido.
- **Por quê:** 11, 5 e P2.
- **Telas e ações:** S05-A85.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-14 · S05 · Semente da comunicação interna com horários do dia

- **Decisão:** a semente da S05 (`src/nucleo/semente/s05.ts`, chamada no fim de `andrade.ts` com `// S05`) cria uma conversa pessoal, um grupo com uma saída registrada, um fio com resposta do integrante, citações, uma mensagem editada com a versão e um aviso fixado no Geral, com horários relativos à abertura (como as rotinas do time). Ela também passa as quatro mensagens da semente comum dos canais (`mn-semente-*`) para a manhã do mesmo dia: com a data fixa de 18/11, toda mensagem nova ficava "antes" delas e as não lidas se perdiam.
- **Por quê:** a sessão; não muda o texto nem o autor da semente comum, só o horário.
- **Telas e ações:** S05-T05.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** `src/nucleo/semente/andrade.ts` (uma linha no fim, como pede a ARQUITETURA, seção 4); horário das mensagens `mn-semente-*` da semente comum.
- **Situação:** proposta.

#### 2026-11-14 · S05 · Ids únicos das mensagens do CRM e mover mensagem sem apagar

- **Decisão:** os itens de exemplo das conversas do CRM repetiam ids ("m1", "m2") entre conversas; no banco a mensagem tem id único e uma conversa sobrescrevia a outra (salvar a conversa da Padaria tirava mensagens da Metalúrgica). Em `src/dados/crm.ts` os ids passam a levar o id da conversa (`cv2-m1`). "Mover mensagem" (S05-A16) deixa na origem o registro "mensagem movida para…" e copia o item para a conversa certa: nada some.
- **Por quê:** correção encontrada pela S05 (dona de `Conversa` e de `crm.ts`); quem tinha o banco guardado precisa de "Restaurar demonstração" para ver os ids novos.
- **Telas e ações:** S05-T01, S05-A16.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** nenhum (`crm.ts` é da S05).
- **Situação:** proposta.

#### 2026-11-14 · S05 · Itens aprovados do CRM agentificados

- **Decisão:** C2-07: o nome de quem atende entra em toda mensagem de pessoa ao cliente (começo em negrito do WhatsApp, rodapé ou desligado; primeiro nome, completo ou com o setor), configurado em Números › Nome de quem atende, com prévia no campo. C2-08: cada setor conecta a caixa de e-mail (OAuth simulado); o integrante de Atendimento lê entrada, enviados (inclusive o que a equipe mandou pelo Outlook ou Gmail) e anexos, põe o e-mail no fio certo e arquiva o anexo na pasta do cliente com o mês (na conversa, "Ler a caixa de e-mail agora" mostra um caso). D-17: farol do documento enviado (verde abriu, amarelo no prazo, vermelho 3 dias úteis sem abrir) com reenvio por outro canal em cartão. D-18: e-mail devolvido marca a falha e prepara o reenvio por WhatsApp. D-34: o anexo guarda o cliente do documento e o envio é bloqueado com o motivo se o CNPJ não for o da conversa. D-30: modo simulação local (nada grava). D-31 e D-33: categorias que o integrante responde sozinho começam todas desligadas e valem primeiro nos clientes-piloto. C2-13: aniversário da empresa e fim de ano por modelo, marcados como ideia. D-19: opção de PDF de pendências por cliente no comunicado, marcada como "depois".
- **Por quê:** princípio 7 do mapa (tudo do Leandro e do 2º escritório entra agentificado).
- **Telas e ações:** S05-A22 a A25, A29, A50, A51, A61, A64.
- **Impacto no plano:** nenhum (implementa os itens).
- **Arquivos compartilhados:** nenhum. Configurações novas em `registro_tela` com o prefixo `s05:crm:`.
- **Situação:** proposta.

#### 2026-11-14 · S05 · Ajustes na moldura para o Chat

- **Decisão:** além do registrado no C8 revisto, a `GavetaChat` ganha a prop `acima` (o botão sobe no CRM › Conversas para não cobrir o Enviar) e passa a montar a janela flutuante da comunicação interna (S05-A87), que fica por cima de qualquer módulo no computador; no celular a gaveta faz esse papel. No painel Demonstração entra a seção da S05 (colega menciona você, resumo da manhã, cliente apaga ou edita, e-mail devolvido, documento sem abrir).
- **Por quê:** a sessão; a S01, ao assumir a moldura, pode mover o botão e a janela para onde preferir mantendo `abrirChat` e `useNaoLidasInternas`.
- **Telas e ações:** S05-A87; S01-T06.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** `ModuloTela.tsx` (`GavetaChat`), `Plataforma.tsx` (uma prop na linha da gaveta), `PainelLab.tsx` (uma linha com `<LabS05>`).
- **Situação:** proposta.

#### 2026-11-14 · S05 · O que ficou guardado mas ainda não age

- **Decisão:** o horário de silêncio da pessoa fica guardado e aparece nas preferências, mas os avisos do sino ainda saem nesse horário (quem publica o aviso é a loja, da coordenação; basta a loja consultar `s05:interna:silencio:<usuário>`). A conversa silenciada já não soma no contador do Chat. A presença dos colegas é de demonstração (a própria pessoa escolhe disponível ou ausente).
- **Por quê:** não mexer no redutor da loja.
- **Telas e ações:** S05-A86.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** nenhum (pedido à coordenação).
- **Situação:** proposta.

### S06 · Timesheet

### S07 · Financeiro do escritório

#### 2026-11-14 · S07 · Financeiro sobre as entidades do 09, com migração nova

- **Decisão:** o Financeiro deixa de ler `src/dados/financeiro.ts` e passa a morar em 20 tabelas novas com os nomes do 09, 3.1 (`contrato_honorarios`, `item_contrato`, `aditivo`, `item_tabela_avulsos`, `servico_avulso`, `despesa_adiantada`, `lote_faturamento`, `cobranca`, `parcela`, `recebimento`, `nota_servico_escritorio`, `conta_bancaria`, `lancamento`, `conta_pagar`, `centro_custo`, `categoria_gerencial`, `regra_categorizacao`, `fechamento_financeiro`, `politica_financeira`, `cenario_caixa`), com repositórios que não apagam dinheiro (cancelar e substituir com motivo; lançamento só por ajuste; item de contrato se fecha). A migração `20261114180000_s07_financeiro.sql` segue o padrão da de fundações (RLS por escritório, gatilho que recusa apagar o dinheiro fora do `restaurar_demonstracao()`). O arquivo `src/dados/financeiro.ts` continua (o app do cliente, o BPO e a Rentabilidade ainda o leem) e é a fonte da semente.
- **Por quê:** o pedido é o frontend pronto para o backend real; e o Horizonte não podia continuar com o aviso de "tela com dados fixos".
- **Telas e ações:** S07-T01 a T08.
- **Impacto no plano:** nenhum (implementa 09, 3.1 no wireframe). **A migração não foi aplicada no projeto Supabase** (pede autorização do dono): até aplicar, o modo Supabase não carrega (o adaptador lê todas as tabelas de `nomesTabelas`).
- **Arquivos compartilhados:** `nucleo/modelo/entidades.ts` (import dos tipos de `modelo/financeiro.ts`, entradas no fim de `Tabelas` e `nomesTabelas`), `nucleo/permissoes/ferramentas.ts` (espalha `ferramentas-financeiro.ts` no fim), `nucleo/repositorios/index.ts` (espalha `reposFinanceiro` no fim), `nucleo/semente/andrade.ts` e `horizonte.ts` (uma linha cada), `servicos/index.ts` (cobrança, índices e importação), `telas/Plataforma.tsx` (tira o Financeiro de `telaAindaFixa`; estado `contratoAberto`), só acrescentando.
- **Situação:** proposta.

#### 2026-11-14 · S07 · Cartões do Financeiro: `s07-*`, um registro só, alçada conferida

- **Decisão:** o que o integrante Financeiro prepara vira um `cartao_aprovacao` com a ação em `argumentos` (id `s07-<assunto>-<registro>`), mostrado no chat dele, no topo da aba (`extras.aba`), na Visão geral e no sino. Decidir em qualquer lugar passa por `useEfeitosCartao`, que chama `decidirCartaoFin` (`telas/financeiro/cartoes.ts`) antes de tudo: confere a alçada gravada (`gestor` = Gestor do Financeiro ou Administrador; `administrador` = só ele), registra a decisão e executa com o nome de quem aprovou. O cartão antigo `fik1` (lote de dezembro do chat) passou a aprovar o `lote_faturamento` de dez/26 de verdade. Também vira cartão o que a própria pessoa pede e o plano manda ser sempre cartão (cancelar, substituir, corrigir nota, acordo, aviso formal, pausa, ajuste, fechar o mês, reajuste): quem pediu e tem alçada aprova em seguida.
- **Por quê:** 01, 6.4 (um registro só) e 09, 8 (o que nunca sai sem pessoa); decisão da sessão.
- **Telas e ações:** S07-A01, A06, A07, A09, A10, A13, A17, A18, A19, A23, A27, A31, A43.
- **Impacto no plano:** nenhum (só desenho).
- **Arquivos compartilhados:** `ambiente/efeitos.tsx` (uma linha no começo da função devolvida, chamando `decidirCartaoFin`).
- **Situação:** proposta.

#### 2026-11-14 · S07 · Dois aprovadores acima de R$ 10 mil

- **Decisão:** a alçada das contas a pagar tem três degraus na política (`limite_gestor` R$ 5 mil, `limite_dois_aprovadores` R$ 10 mil): acima do segundo, a primeira aprovação fica registrada ("1 de 2") e a conta só agenda com o segundo sócio. No wireframe, o segundo sócio aprova pelo painel Demonstração (S07).
- **Por quê:** a alçada "Administrador + segundo sócio" já estava no protótipo; o 09, 10.6 pede alçada por valor e papel. **[sem regra no plano: o terceiro degrau]**.
- **Telas e ações:** S07-A27, S07-A50.
- **Impacto no plano:** 09, 6.1 (alçadas) ganha o terceiro degrau, se aceito.
- **Situação:** proposta.

#### 2026-11-14 · S07 · Reajuste em dois cartões: as cartas e a aplicação

- **Decisão:** a campanha de reajuste termina num cartão do Administrador que envia as cartas (cada contrato ganha um aditivo `comunicado`); aplicar os valores é outro cartão, na data-base ("Aplicar na data-base"), que grava a versão nova do contrato a partir da competência. O lote de dezembro usa os itens que valem em dezembro (`itensNaCompetencia`), nunca o reajuste de janeiro.
- **Por quê:** 09, 4.3 (aviso com antecedência, nunca retroativo, sempre cartão).
- **Telas e ações:** S07-A10.
- **Impacto no plano:** nenhum.
- **Situação:** proposta.

#### 2026-11-14 · S07 · Comanda de serviço extra (C2-25) e certificado como serviço (C2-23)

- **Decisão:** a tarefa marcada como extra carrega `extras.servico_extra = { descricao, quantidade?, marcada_por, marcada_em, avulso_id? }` (contrato com a S04, que marca na ficha da tarefa). O Financeiro lista essas comandas em Contratos › "O que entra na próxima fatura"; "Faturar comanda" cria o `servico_avulso` (`origem: 'comanda'`, preço da tabela de avulsos × quantidade) e o cartão que manda a proposta ao cliente; com o aceite, fica a faturar. O certificado digital vendido como serviço é o item `C2-23` da tabela de avulsos e um avulso de `origem: 'certificado'`, `fase: 3`, visível com o selo "fase 3 · depois" e sem ação.
- **Por quê:** C2-25 e C2-23 entram agentificados; 09, 4.7 (sem aceite não fatura).
- **Telas e ações:** S07-A09, S07-T02 (extras), S07-A52.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** nenhum (a semente S07 acrescenta duas tarefas de exemplo com a marca).
- **Situação:** proposta.

#### 2026-11-14 · S07 · O que as outras sessões leem do Financeiro

- **Decisão:** (1) S10: as faturas do app devem passar a ler a entidade `cobranca` do cliente (com `nota_servico_escritorio` e `parcela`); o "pago" do app é um `recebimento` com `origem: 'informado_pelo_cliente'` e `situacao: 'informado'`, que só pausa a régua (`regua_pausada_ate`); a contestação pausa com `regua_pausa_motivo`. Exemplos prontos no painel Demonstração (S07). (2) S06: o custo-hora proposto e o fechado ficam em `fechamento_financeiro.custo_hora` da competência. (3) S08: `conta_bancaria`, `lancamento` e `conta_pagar` têm `titular_tipo` (`escritorio` ou `empresa`) e `titular_cliente_id`, para o BPO usar as mesmas tabelas; `pecas.tsx` não mudou de assinatura.
- **Por quê:** contratos C10/S07 → S10 e S06 → S07 do `SESSOES.md`.
- **Situação:** proposta.

#### 2026-11-14 · S07 · Data da demonstração, contrato no endereço e banco antigo

- **Decisão:** as contas de prazo do Financeiro usam o "hoje" fixo da demonstração, 18/11/2026 (o mesmo da semente). O contrato aberto vai para o endereço (`#/financeiro/contratos?contrato=ch-c1`, `Destino.contrato`). Banco guardado no navegador antes do S07 recebe a semente do Financeiro na primeira abertura (sem mexer no resto). Vencimento do contrato entre os dias 1 e 28 **[sem regra no plano]**.
- **Arquivos compartilhados:** `ambiente/loja.tsx` (`Destino.contrato`), `nucleo/rotas.ts` (parâmetro `contrato`), `ambiente/PainelLab.tsx` (uma linha: seção S07), só acrescentando.
- **Situação:** proposta.

### S08 · BPO

### S09 · Arquivos, Configurações, entrada e implantação

### S10 · App do cliente

### S11 · Pacote Jurídico

### S00 · Fundação (base comum)

#### 2026-11-14 · S00 · Dados nas entidades das Fundações, com a loja como fachada

- **Decisão:** os dados do wireframe passam a morar nas entidades do subplano 01 (`app/src/nucleo`), com repositórios que conferem permissão, aplicam a regra e gravam evento. A `loja.tsx` deixa de ter redutor de dados e vira fachada com a mesma API para as telas antigas. `usePersistente` passa a persistir ao recarregar (tabela `registro_tela`). O "não alterar o redutor da loja" do `SESSOES.md` continua valendo na prática: estado novo por `usePersistente` ou por entidade e repositório.
- **Por quê:** pedido do Enzo (base para o backend futuro, persistência local, Supabase pronto); decidido pela S00.
- **Telas e ações:** todas (visual igual).
- **Impacto no plano:** nenhum (implementa 01, 2 a 6 no wireframe).
- **Arquivos compartilhados:** `loja.tsx`, `sessao.tsx`, `App.tsx`, `PainelLab.tsx`, `Plataforma.tsx` (rotas e aviso de tela com dados fixos), `fluxos.tsx` (item da tarefa no endereço).
- **Situação:** proposta.

#### 2026-11-14 · S00 · "Membro" nas telas, `colaborador` no código

- **Decisão:** o papel aparece como **Membro** nas telas da sessão e do painel Demonstração (o mapa, 1.1, já usa Membro); no código e no SQL continua `colaborador`, como no subplano 01. Some o "Colaborador/Colaboradora" deduzido do nome.
- **Por quê:** o Enzo chama de Membro; não adivinhar gênero pelo nome.
- **Telas e ações:** entrada (S09), menu do usuário (S01). `UsuariosTela` ainda mostra "Colaborador" no rótulo próprio: S09 troca.
- **Impacto no plano:** nenhum (rótulo).
- **Arquivos compartilhados:** `sessao.tsx` (`papelExibido`).
- **Situação:** proposta.

#### 2026-11-14 · S00 · Notificação com lista de destinatários

- **Decisão:** no wireframe, uma `notificacao` tem `destinatario_ids` (lista; vazia = todos) e `lida_por`, em vez de uma linha por destinatário (01, 8).
- **Por quê:** mantém o sino atual sem multiplicar avisos; o backend pode abrir em linhas.
- **Impacto no plano:** nenhum para o produto (simplificação do wireframe).
- **Situação:** proposta.

#### 2026-11-14 · S00 · Telas com dados fixos no segundo escritório de exemplo

- **Decisão:** no escritório de exemplo Horizonte, as telas que ainda leem `src/dados` (Financeiro, Timesheet, BPO, Leads/Comunicados/Números, Visão geral, Armazenamento, Integrantes, Tema e Assinatura) mostram um aviso em vez dos dados do Andrade. Cada sessão, ao migrar a tela para o banco, tira a tela da condição `telaAindaFixa` em `Plataforma.tsx`.
- **Por quê:** não misturar dados de dois escritórios (isolamento do DA-01).
- **Situação:** proposta.

#### 2026-11-14 · S00 · Permissão escondida por padrão

- **Decisão:** o kit esconde o que a conta não pode (`SePode`); o botão cinza com "por que não posso?" (`mostrarMotivo`) fica para onde o plano pede (03, 9.1) e para a vitrine `#/kit`.
- **Por quê:** o mapa (1.1) manda esconder; o 03, 9.1 admite o cinza explicado.
- **Situação:** proposta.
