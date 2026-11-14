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

### S07 · Financeiro do escritório

### S08 · BPO

#### 2026-11-14 · S08 · BPO nas entidades, com as regras nos repositórios

- **Decisão:** o BPO deixa de ler `src/dados/bpo.ts` e de guardar estado em `registro_tela` e passa a morar em quinze tabelas novas (subplano 10, 3.12 e 4.1): `subinquilino`, `bpo_configuracao`, `bpo_perfil`, `bpo_conexao_erp`, `bpo_conta_bancaria`, `bpo_fornecedor`, `bpo_conta`, `bpo_lote`, `bpo_alcada`, `bpo_item_fila`, `bpo_rotina`, `bpo_transacao`, `bpo_entrega`, `bpo_volume`, `bpo_convidado`, com repositórios em `src/nucleo/repositorios/bpo.ts` (acessados por `repos.bpo.*`) e 35 ferramentas `bpo.*`, `conta_pagar.*`, `pagamento_lote.*`, `pagamento.liberar`, `alcada.*`, `fila.*`, `rotina.*`, `erp.*`. As regras B2 e B3 ficam no repositório, não na tela: quem digitou não confere; acima da faixa 1, analista e gestor; quem propôs a alçada não confere; aprovar, recusar e liberar só pela pessoa do cliente; lote expirado nunca paga. Migração nova `20261114180000_s08_bpo.sql` (não aplicada: pede autorização do dono). `src/dados/bpo.ts` fica como fonte da semente (`src/nucleo/semente/s08.ts`). Banco guardado antes recebe só a semente do BPO na primeira abertura do módulo (`garantirSementeBpo`).
- **Por quê:** o mapa pede os dois modos de dados e o backend em cima sem muita alteração; a sessão decidiu.
- **Telas e ações:** S08-T01 a T10.
- **Impacto no plano:** nenhum (implementa 10, 3.12 no wireframe).
- **Arquivos compartilhados:** `entidades.ts`, `ferramentas.ts`, `repositorios/index.ts` (uma linha `bpo:`), `semente/andrade.ts` (uma linha), `servicos/index.ts` (serviço `erp`), só acrescentando. `Plataforma.tsx`: as nove linhas do BPO viraram uma (`ModuloBpo`) e o BPO saiu de `telaAindaFixa`. `PainelLab.tsx`: uma linha com a seção do BPO. A `loja.tsx` não mudou: `bpoLotes`, `decidirLote` e afins ficam sem uso pelo BPO (a coordenação pode tirar).
- **Situação:** proposta.

#### 2026-11-14 · S08 · Audit score: critérios fixos, pesos do Gestor, limiares 3 e 8

- **Decisão:** treze critérios fixos (vencido sem aprovação 10, credencial do ERP vencida 8, sincronização atrasada 8, caixa abaixo do mínimo 8, conciliação atrasada há mais de dois dias 5, SLA abaixo da meta 5, lote recusado 5, cartão que vence hoje 3, fornecedor novo ou dados alterados 3, ERP em modo arquivo com baixas para lançar 3, conector do ERP com aviso no C9 3, consentimento do Open Finance a vencer em 30 dias 2, em paralelo 2). Cada critério pesa uma vez por empresa (três fornecedores novos não valem três); a soma 3 ou mais é "atenção", 8 ou mais é "agir hoje". O Gestor ajusta os pesos em Configuração (`bpo_configuracao`, ferramenta `bpo.audit_pesos`); a cor recalcula na hora.
- **Por quê:** 10, 5.2 manda critérios fixos e pesos do Gestor, com os pesos de partida como premissa a validar; os números são hipótese da sessão.
- **Telas e ações:** S08-A03, S08-A38; Visão geral, Carteira, cartão do integrante.
- **Impacto no plano:** 10, 5.2 (pesos de partida a validar no piloto).
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-14 · S08 · Saúde do ERP vem do conector (C9) por cima da conexão da empresa

- **Decisão:** a situação do ERP de cada empresa é a da conexão dela (credencial, atraso) e, se estiver boa, a do conector do provedor em Configurações › Conectores: fora do ar vira "sincronização atrasada", erro de credencial vira "credencial vencida", limite, CAPTCHA ou lentidão viram aviso (critério "conector com aviso"). Sincronizar com o conector fora do ar mostra o erro e o "Tentar de novo". O painel Demonstração liga "Conta Azul fora do ar".
- **Por quê:** o C9 é a fonte da saúde dos conectores; a credencial por empresa é do BPO (10, 3.12).
- **Telas e ações:** S08-A06, A08, A33.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** nenhum (só leitura de `src/dados/conectores.ts`).
- **Situação:** proposta.

#### 2026-11-14 · S08 · "Hoje" do BPO é 18/11/2026

- **Decisão:** vencimentos, "vence hoje", "vencido sem aprovação" e expiração dos cartões usam o dia da demonstração (18/11/2026, o mesmo do calendário dos dados de exemplo), não o relógio da máquina; registros novos levam o dia 18 com a hora do relógio.
- **Por quê:** sem isso a demonstração envelhece (tudo vira vencido) e fica diferente em cada máquina.
- **Telas e ações:** todas do BPO.
- **Impacto no plano:** nenhum (só desenho).
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-14 · S08 · Modo de pagamento vai ao aceite junto com a alçada

- **Decisão:** trocar o modo de pagamento (M1 ou M2 com teto) cria uma proposta de alçada com o modo; o modo só muda no perfil quando o sócio aceita no app, como a alçada (10, 3.8). M3 aparece descrito e desligado.
- **Por quê:** 10, 3.8 e 5.4 dizem que alçada e modo só valem com o aceite do sócio; o plano não diz como o modo chega ao app.
- **Telas e ações:** S08-A35, A36, A51.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-14 · S08 · Lote com teto do WhatsApp em R$ 3.000 e "Editar e aprovar" refaz a faixa

- **Decisão:** aprovar pelo WhatsApp (código de uso único de seis dígitos) só para lote de até R$ 3.000 (`teto_whatsapp` em `bpo_configuracao`); acima, a mensagem leva ao app com segundo fator. Ao tirar contas do lote, a faixa é recalculada pelo total que ficou (pode deixar de ser reforçada); as contas tiradas voltam para "conferida" com a marca de quem tirou. Recusa volta as contas com o motivo e vira "Refazer" para a equipe; lote expirado devolve as contas para um lote novo.
- **Por quê:** 04, ad. 19 fala em "teto baixo" sem valor; a sessão decidiu o valor como hipótese.
- **Telas e ações:** S08-A25, A48, A50.
- **Impacto no plano:** 04, ad. 19 (valor do teto a validar).
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-14 · S08 · Frente entre escritórios no mesmo item, com contratantes de exemplo

- **Decisão:** o escritório de exemplo Andrade mostra as duas frentes (seletor "Empresas · Contratantes") porque tem dois contratantes de exemplo (Escritório Alfa Contabilidade e Contábil Beta, nomes fictícios como os do wireframe do plano). O contexto mãe e o contexto do contratante são estado de tela (`s08:contexto`); no contratante, a área do BPO usa o tema dele (variáveis do tema só naquele bloco). Os clientes finais ficam numa lista dentro do subinquilino (simplificação do wireframe: no produto são clientes do subinquilino, DA-01 em dois níveis). O portal do convidado abre por cima do sistema, com o tema do contratante e "entrar como" um convidado; o convidado age como pessoa externa (ferramentas expostas: pedido, revisão, contestação).
- **Por quê:** a ordem de venda põe o C2 depois, mas o mapa pede todas as fases visíveis; um B que atende escritórios tem as duas frentes (10, 5.2).
- **Telas e ações:** S08-A05, A12, A39, A43 a A46.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-14 · S08 · Três cenários na demonstração

- **Decisão:** "contabilidade com BPO" e "só BPO" seguem o seletor de cenário do painel Demonstração; "BPO adicionado" é o interruptor "Pacote BPO ligado neste escritório" (liga o módulo na assinatura e ativa o setor `bpo_financeiro`): no Horizonte, o item BPO aparece vazio, com "Pôr uma empresa no BPO" e os oito passos da implantação.
- **Por quê:** 10, 2.2 descreve os cenários de venda; contratar o pacote depois é nova linha de assinatura (2.5).
- **Telas e ações:** S08-A10, S08-T08.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** `PainelLab.tsx` (uma linha).
- **Situação:** proposta.

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
