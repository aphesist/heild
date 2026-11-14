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

#### 2026-11-14 · S04 · Telas da S04 leem a entidade Tarefa; a loja segue sem a cancelada

- **Decisão:** as telas da S04 (bloco de tarefas, ficha, calendário, trilha, Gestão) leem a entidade `tarefa` direto do banco (`src/telas/tarefas/modelo.ts`) e escrevem pelas transições do repositório (`acoesTarefa`), com as regras do 03, 7. O `StatusTarefa` de tela ganhou os três estados (C3) e o mapeador parou de achatar; `loja.tarefas` continua deixando a cancelada fora das filas, para não mudar as contagens das telas de outras sessões. O bloco de tarefas inclui as canceladas do mesmo escopo quando o filtro pede.
- **Por quê:** a ficha precisa de checklist, prazos legal e interno, origem, `tarefa_pai_id` e motivo, que o formato de tela não tem; decidido pela S04.
- **Telas e ações:** S04-T03 a T06.
- **Impacto no plano:** nenhum (implementa 01, 4.8 e 03, 7).
- **Arquivos compartilhados:** `dados/tipos.ts` (dona de `Tarefa`), `nucleo/mapeadores` (bloco de Tarefa), `ClienteApp.tsx` (só as três chaves novas em `statusPedido`, para compilar).
- **Situação:** proposta.

#### 2026-11-14 · S04 · Fila de revisão no próprio bloco de tarefas

- **Decisão:** a fila de revisão (01, 4.8) é uma visão do bloco de tarefas ("Revisão · N"), ao lado de Lista, Por responsável e Calendário, em toda aba e na tela "Tarefas"; agrupa por atividade, com aprovar em lote (evento com o nome de quem aprovou) e devolver com comentário obrigatório.
- **Por quê:** fecha o **[sem regra no plano]** do mapa (S04-A66) sem widget novo em cada aba; quem revisa vê no mesmo lugar onde trabalha. Decidido pela S04.
- **Telas e ações:** S04-A66 a A68.
- **Impacto no plano:** nenhum (só desenho).
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-14 · S04 · Tela "Tarefas" como gaveta e componente para o celular

- **Decisão:** a tela "Tarefas" (03, 7.1) é o componente `TarefasTela` (`src/telas/tarefas/GavetaTarefas.tsx`), aberto por `useFluxos().verTarefas({ setor?, cliente? })` ("ver todas" do bloco, carteira com as 50 mais urgentes) numa gaveta larga. O destino "Tarefas" do menu inferior do celular (S01) monta o mesmo `TarefasTela`.
- **Por quê:** não cria aba nem módulo novo (o Painel tem oito abas); S01 é dona da moldura do celular.
- **Telas e ações:** S04-T03, S04-A39; S01-A06.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** `ambiente/fluxos.tsx` (dona; `verTarefas` acrescentado).
- **Situação:** proposta; S01 liga o destino do celular.

#### 2026-11-14 · S04 · Cartões da S04 num registro só, com efeito por tela

- **Decisão:** os cartões que os integrantes da S04 deixam são linhas de `cartao_aprovacao` com id `s04-…` e `extras.acao` (ex.: `dp.kit`, `ciclo.mudar`); cada tela registra o efeito (`registrarEfeitoS04`). Decidir na ficha, no chat ou no sino vale em todos: `efeitos.tsx` ganhou uma linha que entrega os `s04-…` ao efeito registrado. Recusar devolve a uma pessoa e guarda o comentário como aprendizado do integrante (`s04:integrantes:aprendizados`), mostrado na ficha e na Governança da IA; editar e aprovar grava os argumentos editados.
- **Por quê:** 03, 7.5 (o cartão é o mesmo registro em toda tela) e 02, 7.2 (o comentário vira aprendizado).
- **Telas e ações:** S04-A56, S04-A07, A08, A09, A12, A13, A17, A21, A78, A83, A88.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** `ambiente/efeitos.tsx` (uma linha acrescentada no começo da função, para os `s04-…`).
- **Situação:** proposta.

#### 2026-11-14 · S04 · Moldes das trilhas com as atividades reais de Entrada e Desligamento

- **Decisão:** o plano dá os códigos dos moldes (a1 a a12, b1 a b11, c1 a c8, e1 a e13, f1 a f11) e só desenha os nomes da transição (03, 8.2). A S04 montou cada marco com uma atividade real das etapas Entrada e Desligamento do `atividades.json` (ex.: b3 acervo = CIC-002; e9 dossiê único = CIC-003; f6 distrato e baixa = SOC-031), com prazo relativo e dependência; acrescentou o molde "reentrada" para reativar ex-cliente (C2-24, CIC-010). Os moldes se editam (prazo relativo, versão nova) em Gestão › Processos.
- **Por quê:** "nada inventado": usar as atividades do catálogo em vez de criar passos; a tela de editar moldes não tem lugar no plano e o mapa sugere Gestão › Processos.
- **Telas e ações:** S04-T07, T08, S04-A72, A80, A89.
- **Impacto no plano:** 03, 8.2 e 8.3 ganham a lista dos marcos (levar ao plano).
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-14 · S04 · A trilha abre por cima do Painel, não dentro do Societário

- **Decisão:** a trilha (entrada e saída, em abas) é uma gaveta larga aberta por `?trilha=<cliente>` (C6), por `useFluxos().abrirTrilha` e pela faixa de ciclo de vida, com o Painel no Societário por baixo. O estado que não é tarefa (o que o cliente e o contador anterior precisam enviar, revogações, dossiê, dados da saída) fica em `s04:trilha:<entrada|saida>:<cliente>`.
- **Por quê:** o 03, 8.1 diz que a trilha "mora em Clientes e Societário"; a aba Societário é da S02 e a gaveta chega de qualquer aba sem mexer nela.
- **Telas e ações:** S04-T07, T08, T09.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** `loja.tsx` (`Destino.trilha`) e `nucleo/rotas.ts` (parâmetro `trilha`), só acrescentando.
- **Situação:** proposta. Pedido à S02: pôr `FaixaCicloDeVida` acima do cabeçalho da aba e, se quiser, `widgetCicloDeVida(ctx)` no catálogo do Societário.

#### 2026-11-14 · S04 · Mudar estado do ciclo é cartão; reativar gera a trilha de reentrada

- **Decisão:** mudar o estado do cliente (por serviço: contábil e BPO, com o do BPO em `cliente.extras.ciclo_bpo`) cria um cartão para o Gestor com os bloqueios; aprovar executa `cliente.mudar_estado`. Encerrar fica bloqueado com tarefas remanescentes ou revogações abertas. Reativar ex-cliente (inativo ou encerrado → em implantação) reabre com o histórico e gera a trilha de reentrada. Iniciar a saída (Gestor) muda direto para em saída ou em baixa, porque o próprio ato é do Gestor (CIC-003). Evento de exceção (falecimento, inapto, falência) vira faixa e tarefa crítica.
- **Por quê:** 01, ad. 23 (ciclo por serviço); CIC-001 (executar com aprovação do Gestor); 01, 4.2.
- **Telas e ações:** S04-A81, A85, A87 a A90.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-14 · S04 · Visão do DP pelo widget "Visão do DP"

- **Decisão:** as duas visões internas do DP (E-04) trocam no widget "Visão do DP", primeiro da aba; a escolha fica em `s04:dp:visao` e o catálogo da aba muda (Rescisão: simulados, rescisões e kit; Admissão e rotina: quadro, admissões, folha, eSocial, guias e boletos, férias e SST, convenções, recálculo, fases 4 e 5; nas duas: Obrigações do setor, DET e termos). Na carteira, a visão troca entre a folha da carteira e as rescisões e simulados da carteira.
- **Por quê:** a anatomia da aba (cabeçalho, grade) é da S02; um widget troca a visão sem mexer nela, e a grade já guarda o arranjo.
- **Telas e ações:** S04-A01.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** `padroes.ts` (chaves `dp`, `dp-carteira` e `gestao`, que são da S04).
- **Situação:** proposta.

#### 2026-11-14 · S04 · Dados do DP e da Gestão em estado de tela até haver entidade

- **Decisão:** admissões, folha, eSocial, guias, boletos, simulados, rescisões e kit, CCT, termos e DET do DP (`s04:dp:<cliente>`) e catálogo local, processos, migração, LGPD, rotinas, ausências e moldes da Gestão (`s04:gestao`) ficam em `registro_tela`, partindo dos dados de exemplo da aba. Sem migração SQL nova.
- **Por quê:** as Fundações não têm essas entidades; o brief pede não mexer no esquema sem migração. O backend do DP e da Gestão vira tabela própria depois.
- **Telas e ações:** S04-T01, T02.
- **Impacto no plano:** nenhum; lista do que vira entidade na entrega da S04.
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-14 · S04 · "Não era esta", ausências e serviço extra para o Timesheet e o Financeiro

- **Decisão:** "não era esta" grava a correção em `s04:timesheet:nao-era-esta` e o evento; férias com substituto grava em `s04:gestao` (`ausencias`) e repassa as tarefas; serviço extra fica em `tarefa.extras.servico_extra` e `extra_valor`. A S06 lê os dois primeiros para os itens de confirmação e a ausência; a S07 lê o terceiro para faturar (C2-25).
- **Por quê:** S06 e S07 são donas das telas que consomem; a S04 só marca na tarefa.
- **Telas e ações:** S04-A22, A52, A62.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta; S06 e S07 consomem.

#### 2026-11-14 · S04 · Multa estimada ao passar do prazo legal é demonstração

- **Decisão:** ao arrastar o prazo interno para depois do legal, o calendário pede confirmação com uma multa estimada por setor, marcada com o selo de demonstração; o valor real vem da regra da obrigação quando ela existir.
- **Por quê:** 03, 4.1 pede "a multa estimada"; não há regra de multa por obrigação no wireframe.
- **Telas e ações:** S04-A41.
- **Impacto no plano:** pede a regra de multa na Obrigação (01, 4.7).
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

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

#### 2026-11-14 · S06 · Entidades do Timesheet e migração nova (não aplicada)

- **Decisão:** o Timesheet passa a morar em onze entidades novas, no fim de `entidades.ts`: `sessao_trabalho` (Fundações 5.4, com `substituida_por`, `contestacao`, `anomalia`, `custo` do integrante e `pacote`), `item_confirmacao`, `ausencia` (05, ad. 16), `custo_hora` (05, A7, uma linha por definição), `vinculo_extensao` (termo e extensão por pessoa), `pulso_portal` (pulsos agregados por dia, portal e cliente), `portal_extensao` (lista versionada, desligável), `conector_core`, `equivalencia_core`, `duracao_padrao` (calibração) e `fechamento_timesheet` (o mês fechado por cliente, para a série de 12 meses). Esquema em `app/supabase/migrations/20261114180000_s06_timesheet.sql`, no padrão da de fundações.
- **Por quê:** o backend real deve nascer em cima destas tabelas; `usePersistente` não serve para dado que três telas e o Financeiro leem. A sessão não aplicou a migração no projeto Supabase: a arquitetura (seção 9) pede autorização do dono. **Sem ela aplicada, o modo Supabase não abre** (o adaptador lê todas as tabelas de `nomesTabelas`): a coordenação aplica ao integrar.
- **Telas e ações:** S06-T01 a T06.
- **Impacto no plano:** nenhum (implementa 01, 5.4 e 05, A7, A11 no wireframe).
- **Arquivos compartilhados:** `entidades.ts`, `repositorios/index.ts` (repositórios no fim e uma linha que liga o repositório de sessões ao de itens), `permissoes/ferramentas.ts` (ferramentas `timesheet.*`, `ausencia.registrar`, `custo_hora.definir`, `extensao.*`, `core.*`), `semente/andrade.ts` e `horizonte.ts` (uma linha `// S06` cada), só acrescentando.
- **Situação:** proposta.

#### 2026-11-14 · S06 · "Sem classificação" calculado e intervalo de almoço

- **Decisão:** "sem classificação" não é sessão guardada: é calculado como as lacunas de 10 min ou mais dentro da jornada (05, 9.1), menos o intervalo de almoço, que entra na configuração do módulo (padrão 12:00 a 13:00); hoje, só até o último registro. Item de confirmação pendente com sugestão aparece na linha do dia como estimado; sem sugestão, como sem classificação.
- **Por quê:** o 05 define a métrica pelas lacunas; sem o intervalo, todo almoço viraria item. **[sem regra no plano]** o intervalo.
- **Telas e ações:** S06-T01, S06-A06; S06-A39 (campo novo).
- **Impacto no plano:** 05, ad. 16 ganha o intervalo na configuração.
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-14 · S06 · Quem mexe no tempo de quem

- **Decisão:** confirmar, corrigir, dividir, classificar e contestar são só da própria pessoa (a regra fica no repositório, além da ferramenta). Quem contestou não decide a própria contestação (outro Gestor do setor ou o Administrador decide). O Gestor não altera o tempo de outra pessoa: "corrigir" uma sessão anômala manda um item "confirma 6h30 em FIS-010?" para ela (05, 11.3); descartar e manter são do Gestor.
- **Por quê:** 05, H4 e 8.3 (a pessoa contesta, o Gestor decide); o caso do Administrador que contesta o próprio tempo não estava coberto.
- **Telas e ações:** S06-A03 a A06, A24, A29.
- **Impacto no plano:** nenhum (explicita 05, 8.3 e 11.3).
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-14 · S06 · Custo-hora só do Administrador, margem também do Gestor de Gestão ou Financeiro

- **Decisão:** a Rentabilidade abre ao Administrador e ao Gestor com Gestão ou Financeiro (05, 8.4), mas o valor do custo-hora só o Administrador vê e edita (o Gestor vê horas, custo total e margem, com "custo-hora definido pelo Administrador"). O valor-hora de cobrança (Jurídico) é configuração do escritório, visível ao Gestor; o chip "Jurídico" aparece quando a assinatura tiver o módulo `juridico` (S11).
- **Por quê:** o mapa manda "custo-hora só do Administrador" e "valor-hora visível ao Gestor"; o 05 abre a aba ao Gestor de Gestão ou Financeiro.
- **Telas e ações:** S06-T04, S06-A38, S06-A40.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-14 · S06 · Rentabilidade: mês fechado e mês corrente

- **Decisão:** competências fechadas leem `fechamento_timesheet` (horas, honorário, variáveis e marcos do mês); a corrente lê as sessões até hoje, com o honorário proporcional aos dias úteis decorridos e o custo dos integrantes em centavos nas variáveis. O honorário vem do último fechamento até a S07 expor `contrato.honorario_na_competencia` (05, ad. 15). Deficitário = margem negativa no mês e em pelo menos um dos dois anteriores (2 de 3).
- **Por quê:** o mês corrente sem proporção daria margem enganosa; a série de 12 meses precisa de fotografia mensal (09, fechamento). **[sem regra no plano]** a proporção.
- **Telas e ações:** S06-A31 a A33, A36.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-14 · S06 · Captura pela tarefa aberta

- **Decisão:** `CapturaTempo` (`src/telas/timesheet/captura.tsx`), montada uma vez na Plataforma, abre a sessão ao vivo da tarefa aberta (em qualquer tela) ou, sem tarefa, do Painel com cliente e da conversa do CRM (01, 5.4, regra 1), depois de 60 s com ação (H2); o fim avança a cada ação; troca de tarefa, saída e modo de espera fecham no último evento; voltar da espera com 10 min ou mais cria o item "em espera" pré-preenchido (05, 3.7). Sessão sem tarefa no Painel fica com atividade em branco ("Painel › Fiscal (sem tarefa)") para a pessoa classificar. A data é a do dia da demonstração (18/11) com a hora do relógio. O painel Demonstração liga "sessão nasce em 5 s" para mostrar ao vivo.
- **Por quê:** o modo de espera é da S01 (`espera.tsx`); a S06 só lê `tempo.espera`, sem mexer nele.
- **Telas e ações:** S06-T01; lado do Timesheet de S01-A83 a A85.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** `Plataforma.tsx` (uma linha montando a captura, o contador da aba Confirmações no mapa das abas, `clienteId` nas quatro telas e o Timesheet fora de `telaAindaFixa`), `PainelLab.tsx` (uma linha com a seção do Timesheet).
- **Situação:** proposta.

#### 2026-11-14 · S06 · Contratos com a S04 ("não era esta", ausências, serviço extra)

- **Decisão:** a S06 consome o que a S04 grava: cada pedido em `s04:timesheet:nao-era-esta` vira item `nao_era_esta` em Confirmações, ligado à sessão da tarefa errada e com a tarefa certa como sugestão; as férias com substituto de `s04:gestao` (`ausencias`) entram na capacidade da Equipe (só leitura, "pela Gestão"); `tarefa.extras.servico_extra` marca as horas como serviço extra (C2-25). Para quem quiser chamar direto, `naoEraEsta(tarefaId)` em `captura.tsx`.
- **Por quê:** registro da S04 de 14/11 ("S06 e S07 consomem").
- **Telas e ações:** S06-A13, A22, A25.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-14 · S06 · Extensão e cores como serviços simulados

- **Decisão:** `src/servicos/timesheet.ts` traz `extensao` (API-26: detectar, vincular, visitar portal, com o que é enviado e o que nunca sai) e `cores` (API-18: testar token, importar relatório, ler agora), com uma linha em `Servicos`, `servicos` e `catalogoServicos`. A tela "como a extensão vê" (S06-T06) fica no painel Demonstração, como o mapa sugere; o pulso sem tarefa e com CNPJ vira "trecho de portal" em Confirmações, nunca sessão.
- **Por quê:** 1.7 do mapa e ARQUITETURA, 6.
- **Telas e ações:** S06-A11, A27, A43 a A45.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** `src/servicos/index.ts` (só acrescentando).
- **Situação:** proposta.

#### 2026-11-14 · S06 · Abertura da Equipe ao Gestor e o que ficou fixo

- **Decisão:** "abrir a Equipe ao Gestor após N semanas" conta a partir de 02/11/2026 (ativação do módulo nos exemplos); com 3 ou 4 semanas, o Gestor vê "a aba Equipe abre em dd/mm". O percentual do limite de IA (5 h e 7 dias) continua o do protótipo (o limite de uso é da S01). Os filtros de contratante e frente existem; nos exemplos todo o BPO é do próprio escritório e da frente financeira, então "entre escritórios" esvazia a tela (S08 traz os dados).
- **Por quê:** 05, 10.6; o resto depende de outras sessões.
- **Telas e ações:** S06-T03, S06-A23, S06-A39.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-14 · S06 · Ordem das abas aplicada em `modulos.ts`

- **Decisão:** a lista do Timesheet em `src/telas/modulos.ts` passa a Meu tempo · Confirmações · Equipe · Rentabilidade, como escrito no registro da Coordenação; o `contador: 6` fixo de Confirmações sai (o número vem dos itens pendentes da pessoa, na Plataforma).
- **Por quê:** o registro diz "a ordem atual do protótipo", mas o protótipo tinha Confirmações por último; a sessão seguiu a ordem escrita, que é a mesma do pedido do dono para a S06.
- **Telas e ações:** S06-T01 a T04, S06-A19.
- **Impacto no plano:** nenhum (03, U5 já fechada pela Coordenação).
- **Arquivos compartilhados:** `src/telas/modulos.ts` (reordena as quatro abas do Timesheet; mudança fora do "só acrescentar", registrada aqui).
- **Situação:** proposta.

### S07 · Financeiro do escritório

### S08 · BPO

### S09 · Arquivos, Configurações, entrada e implantação

#### 2026-11-14 · S09 · Contrato C9: estado dos conectores no `registro_tela`

- **Decisão:** `src/dados/conectores.ts` publica o catálogo (27 conectores em oito famílias, com o código da API do mapa), os estados (ativo, somente leitura, erro de credencial, certificado vencido, fora do ar, limite, CAPTCHA, sem resposta, pausado pelo teto, não conectado) e a leitura `estadoConector(id)` / `useEstadoConector(id)` / `useConectores()`, com `frase`, `tom`, `funcionando`, `precisaDePessoa` e `destino` prontos. O estado vivo fica no `registro_tela` (chave `s09:conectores:estado`) por cima do padrão de cada escritório de exemplo; cofre, rotinas, teto e custos ficam em chaves `s09:*` com os nomes de campo do 08. Sem entidade nova nem migração.
- **Por quê:** S02, S03 e S08 precisavam ler já; o formato dos objetos segue o 08 e vira tabela `conector`/`credencial` no backend sem mudar quem lê.
- **Telas e ações:** S09-T09, S09-A64 a A70; quem consome: S02 (Notas), S03, S08.
- **Impacto no plano:** nenhum (só desenho).
- **Arquivos compartilhados:** `PainelLab.tsx` (uma seção "Simular conector com problema"), `servicos/index.ts` (serviços `conectores`, `cofre`, `arvore`).
- **Situação:** proposta.

#### 2026-11-14 · S09 · Abas novas Conectores e Permissões; exceção por tela libera aba de Configurações

- **Decisão:** Configurações ganha as abas **Conectores** (S09-T09) e **Permissões** (S09-T05, a sugestão do mapa adotada, com a mesma matriz calculada e o "Simular" do Ver como). Configurações continua só do Administrador; uma exceção por tela `config.<aba>` (Conectores, Armazenamento, Integrantes, Permissões) libera aquela aba para outra conta. As ferramentas da S09 usam o setor fictício `configuracoes` para que só Administrador ou a exceção passem na função única.
- **Por quê:** o pedido diz "Configurações são do Administrador, com exceções"; a ordem do 3.2 confere papel mínimo antes da exceção, então o setor fictício foi o jeito de a exceção valer sem mudar `autorizar`.
- **Telas e ações:** S09-T05, S09-T09, S09-A32 a A34.
- **Impacto no plano:** 03, 9 (aba Permissões em Configurações, além da matriz em Gestão).
- **Arquivos compartilhados:** `modulos.ts` (duas abas), `Plataforma.tsx` (duas linhas de rota e a montagem das telas cheias), `permissoes/telas.ts` (regra acrescentada: `config` aparece com as abas liberadas), `permissoes/ferramentas.ts` (ferramentas novas no fim).
- **Situação:** proposta.

#### 2026-11-14 · S09 · Implantação e Raio-X como telas cheias

- **Decisão:** o assistente de implantação (S09-T13) e o Raio-X do Drive (S09-T14) abrem em tela cheia por cima de qualquer módulo (Escritório › "Continuar implantação"; Armazenamento › "Rodar o Raio-X"; passo 5 da implantação), sem aba própria. O que está aberto fica guardado (recarregar volta) e fecha ao trocar de módulo ou aba. Para a faixa "primeiros passos" da Visão geral (S01), `useImplantacao()` em `src/dados/implantacao.ts` devolve `concluida`.
- **Por quê:** são fluxos de começo e fim definidos; uma aba a mais em Configurações confundiria o uso diário.
- **Telas e ações:** S09-T13, S09-T14, S09-A63, S09-A92 a A99.
- **Impacto no plano:** nenhum (o plano não desenha a tela, "desenho a fazer").
- **Arquivos compartilhados:** `Plataforma.tsx` (`<TelasCheiasS09 />`).
- **Situação:** proposta; pedido à S01: esconder a faixa com `useImplantacao().concluida`.

#### 2026-11-14 · S09 · Marca branca é complemento pago; o que fica sem ele

- **Decisão:** a Assinatura mostra o App do cliente **incluído** e dois complementos pagos: marca branca (R$ 290/mês na demonstração) e app na loja (exige marca branca). Sem marca branca, o Tema avisa que o escritório usa a identidade da plataforma, deixa ver e editar o rascunho com a prévia, mas bloqueia publicar, domínio e remetente próprios, e o seletor só deixa o tema de fábrica. Os dois exemplos têm o complemento ligado por padrão.
- **Por quê:** decisão 6 do mapa; o plano não diz o que fica editável sem o complemento **[sem regra no plano]**.
- **Telas e ações:** S09-A44, S09-A71, S09-A72.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** nenhum (`dados/configuracoes.ts` é da S09: App do cliente passou a contratado).
- **Situação:** proposta (preços são de demonstração).

#### 2026-11-14 · S09 · Seletor único de tema troca recarregando a página

- **Decisão:** o bloco "Tema em uso" lista o tema de fábrica, os exemplos e os temas Condesp e Requinte, cada um com a miniatura do claro e do escuro, no mesmo seletor. Escolher grava a preferência do escritório e recarrega a página.
- **Por quê:** o tema ativo mora em `App.tsx` (`usePreferencia`), que é da coordenação, e o `ThemeProvider` não expõe troca.
- **Telas e ações:** S09-T07.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** nenhum. **Pedido à coordenação:** expor `definirTema` no contexto do tema para trocar sem recarregar.
- **Situação:** proposta.

#### 2026-11-14 · S09 · Campo `s09` no documento de tela e cartões `s09-*`

- **Decisão:** o tipo `Documento` de tela (dono: S09) ganhou `s09` com origem a confirmar, versões, conflito, sem bytes, conferência de mudança de cliente, quem forçou a visibilidade e a conferência de assinatura; o mapeador de documento leva e traz esse campo em `extras`. Os cartões da S09 (Raio-X em lote, importação de clientes, campanha de acessos, envio de documento) têm chave `s09-*` e o efeito mora em `src/ambiente/efeitos-s09.ts`, chamado por uma linha em `efeitos.tsx`.
- **Por quê:** guardar o estado do índice sem coluna nova; um efeito só para os cartões da sessão.
- **Telas e ações:** S09-A04 a A10, A12, A16, A17, A93, A94, A97.
- **Impacto no plano:** nenhum (o backend vira colunas de `documento` e versões em `versao_de`).
- **Arquivos compartilhados:** `nucleo/mapeadores/index.ts` (documento), `efeitos.tsx` (uma linha).
- **Situação:** proposta.

#### 2026-11-14 · S09 · Entrada: esqueci a senha, convite e contexto

- **Decisão:** esqueci a senha manda um código de 6 números por e-mail (vale 30 min) e pede senha nova com pelo menos 8 caracteres e um número; as outras sessões caem. O convite abre pelo link (`?convite=<e-mail>`) ou, na demonstração, tocando na conta convidada: nome, senha, segundo fator (obrigatório para Administrador) e o termo da equipe (mensagens internas não se apagam, tempo por cliente, integrantes agem em nome da pessoa, LGPD). Convite vencido mostra o motivo. Quem tem vínculo no BPO Financeiro escolhe o contexto (escritório ou subinquilino) quando há subinquilino.
- **Por quê:** S09-A89 é **[sem regra detalhada no plano]**; o resto segue 01, 2.4 e 2.5 e 11, 5.
- **Telas e ações:** S09-A86 a A91.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-14 · S09 · Perfil de apoio e modelos de papel

- **Decisão:** o perfil de apoio (Recepção, C2-26) é um modelo de exceções que libera até "rascunhar" as abas Societário, Fiscal, DP e Contábil para um Membro de Gestão e Atendimento (separa, consulta, cobra e digitaliza; nunca transmite nem aprova). Recepção, Supervisão e Direção aparecem como modelos no convite e no passo 3 da implantação. "Colaborador" virou "Membro" em Usuários.
- **Por quê:** E-05 e C2-26; nível "rascunhar" impede o que sai do escritório.
- **Telas e ações:** S09-A26, S09-A31.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-14 · S09 · Teto de custo dos conectores pausa na hora

- **Decisão:** salvar um teto abaixo do que já se gastou no mês pausa na hora os conectores pagos (estado "pausado pelo teto") e avisa o Administrador; subir o teto retoma. O teto de IA do escritório é outro (Integrantes), e ao chegar nele a conversa do cliente cai para uma pessoa (D-32).
- **Por quê:** 08, 10 diz "ao atingir, pausa o que é pago e avisa"; o momento da pausa ao editar é **[sem regra no plano]**.
- **Telas e ações:** S09-A69, S09-A38.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-14 · S09 · Gavetas abertas do visualizador fecham o visualizador

- **Decisão:** mover, confirmar origem, resolver conflito e enviar ao cliente, quando pedidos dentro do visualizador, fecham o visualizador e abrem a gaveta; versões e comprovante abrem por cima dele.
- **Por quê:** a gaveta do formulário fica numa camada abaixo do visualizador (`ui/` é da coordenação).
- **Telas e ações:** S09-T02.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-14 · S09 · Telas de Configurações que continuam com dados fixos no Horizonte

- **Decisão:** Armazenamento, Integrantes, Tema e Assinatura continuam na condição `telaAindaFixa` do escritório Horizonte (a base delas é `dados/configuracoes.ts`, do Andrade). As abas novas (Conectores, Permissões), Escritório, Usuários, Arquivos, Raio-X e implantação usam os dados do escritório aberto.
- **Por quê:** migrar essas quatro abas para entidades é trabalho do backend (tema, assinatura e integrantes têm entidade própria nas Fundações); o Horizonte serve para ver a implantação em andamento.
- **Situação:** proposta.

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
