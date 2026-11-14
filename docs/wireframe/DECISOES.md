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

### S06 · Timesheet

### S07 · Financeiro do escritório

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
