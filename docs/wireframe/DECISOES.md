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

#### 2026-11-14 · S01 · Busca global: contrato C7 publicado

- **Decisão:** `src/dados/busca.ts` define `FuncaoBusca = (termo: TermoBusca, escopo: EscopoBusca) => ResultadoBusca[]`. Cada sessão escreve `src/dados/busca-sNN.ts` e acrescenta **uma linha** em `fontesBusca` (`{ sessao, modulo?, buscar }`). O termo chega normalizado (sem acento), com os dígitos (CNPJ/CPF com ou sem pontuação) e os sinônimos ("legal" e "legalização" acham Societário); use `casa(termo, ...campos)` e `trechoDe`. O resultado traz `destino` (`Destino`) e `clienteId`; a S01 corta o que está fora do escopo, agrupa por tipo e troca o cliente com aviso de uma linha. A fonte da S01 já cobre clientes, tarefas, obrigações, documentos, conversas do CRM (com a transcrição dos áudios), mensagens internas (só das conversas em que a pessoa participa), integrantes e telas. Abre por Ctrl/Cmd+K, "/" ou a lupa do cabeçalho (`abrirBusca(termo?)`).
- **Por quê:** SESSOES.md, C7; o mapa (S01-T09) pede a busca inteira.
- **Telas e ações:** S01-A70 a A74.
- **Impacto no plano:** nenhum (implementa 03, 2.2).
- **Arquivos compartilhados:** nenhum (arquivos novos).
- **Situação:** proposta.

#### 2026-11-14 · S01 · Menu inferior do celular: o que cada destino abre

- **Decisão:** cumprindo o registro da Coordenação, o menu inferior (< 768px) tem Início (vai à Visão geral), **Tarefas** (gaveta "Minha fila": minhas, dos meus setores, atrasadas; iniciar e concluir num toque; abrir leva à ficha, C4), **Pendências** (gaveta com as pendências por cliente: cobrar e marcar recebida), **Chat** (`abrirChat()`, a mesma gaveta com Equipe e Integrantes) e **Mais** (a barra lateral como gaveta). O botão de menu do cabeçalho some no celular (o "Mais" faz o papel) e a marca curta entra no canto; o botão flutuante "Chat" some no celular. Configurações no celular ficam só leitura, com o aviso "edite no computador" (`SoLeituraNoCelular`, em `components/compostos/edite-no-computador.tsx`, que outras telas podem usar).
- **Por quê:** 03, 2.6; o plano não diz o conteúdo de Tarefas e Pendências **[sem regra no plano]**: a sessão escolheu a fila da pessoa e o widget de pendências, que já são "decisão em um toque".
- **Telas e ações:** S01-A06, S01-A07.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-14 · S01 · Seletor de cliente: favoritos, recentes, grupos e Ctrl+J

- **Decisão:** favoritos por conta no escritório (`s01:seletor:favoritos:<usuário>`, até 10); recentes por aparelho no navegador (10); grupos econômicos de exemplo em `src/dados/grupos-s01.ts` até existir a entidade Grupo econômico na migração (o grupo seleciona a empresa principal e o seletor mostra "Grupo X · 2 de 4"); Ctrl/Cmd+J abre o seletor. O seletor só lista o que está no escopo (carteira, quando ligada) e, se o cliente aberto sair do escopo, volta a Todos com aviso. "Agora em X" aparece ao trocar de cliente pela busca.
- **Por quê:** 03, 3.1 a 3.4. Atalho **[sem regra no plano]**: Ctrl+K é a busca (padrão de mercado); Ctrl+J ficou para o cliente.
- **Telas e ações:** S01-A75 a A81.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-14 · S01 · Contadores da barra saem da sessão

- **Decisão:** a barra lateral calcula os contadores por item (`useContadoresModulo`, `src/ambiente/contadores-s01.ts`): Início = cartões esperando a pessoa; Painel = atrasadas dos setores dela; CRM = conversas novas ou não lidas; Timesheet = itens de confirmação. Outra sessão acrescenta um hook no fim de `fontesContador` com o contador do módulo dela. O botão Chat soma não lidas da Equipe (S05) e cartões (`useContadorChat`).
- **Por quê:** mapa, S01-T01 ("contadores reais por item").
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-14 · S01 · Gaveta do Chat: Geral com a conversa do Início e integrante na própria gaveta

- **Decisão:** o lado Integrantes da gaveta abre no Geral com a mesma conversa do Início › Assistente para o cliente da tela (o histórico do Assistente passa a ser guardado por pessoa no escritório, `s01:assistente:<usuário>`, e sobrevive ao recarregar); trocar de cliente avisa "agora falando de...". Os ícones à direita abrem o integrante dentro da gaveta (sem ir ao Time) e o "+" cria integrante. "Falar com [integrante]" do cabeçalho da aba abre a gaveta no chat dele (`falarComIntegrante(setor)`, `src/ambiente/chat-moldura.ts`).
- **Por quê:** 03, 2.5 e 5; 02, ad. 22.
- **Telas e ações:** S01-A52 a A55.
- **Arquivos compartilhados:** `Plataforma.tsx`: uma linha (`onFalar` do Painel chama `falarComIntegrante`), fora do "só acrescentar".
- **Situação:** proposta.

#### 2026-11-14 · S01 · Sino lê a notificação inteira

- **Decisão:** a central de avisos lê a tabela `notificacao` (categoria, prioridade, cliente), não só o formato da loja: filtro por categoria, prioridade escrita ("urgente", "alta"), grupo quando há 3 ou mais da mesma categoria e cliente, descartar (por pessoa, `s01:sino:descartados:<usuário>`, com desfazer) e decisão do cartão de aprovação no próprio sino (é o mesmo cartão do chat do integrante que publicou).
- **Por quê:** 01, 8; mapa S01-T07.
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-14 · S01 · Roteador do Geral e cartões novos

- **Decisão:** o Geral (Início e gaveta do Chat, `src/telas/inicio/roteador.ts`) decide nesta ordem: pedido ao time; pergunta sobre o sistema → assistente de ajuda (cartão `ajuda`, sem gastar limite); "me avise quando..." → cartão `regra` (sim liga um job do integrante, editar ajusta a regra, não descarta; o que não dá para vigiar volta "não consigo vigiar isso porque..."); "pauta da reunião" → tabela por setor; cálculo → cartão `calculo` com fórmula e origem; "escreva uma mensagem..." → cartão `previa_mensagem` (editar texto e canal; enviar pede aprovação e grava na conversa do setor no CRM); termo solto e ambíguo → cartão `escolha` com dois botões; anexo → Documento do cliente classificado pelo nome, na pasta do tipo (sem cliente, em "recebidos pelo chat"). Os cinco tipos entram em `Cartao` (`src/dados/tipos.ts`, S01 é dona) e `AcoesCartao` ganha `onEnviar`.
- **Por quê:** 02, 9.1, 9.3, 7.3 e ad. 25; 07, 2. A pasta do anexo é **[sem regra no plano]**: a sessão usou a árvore-modelo pelo tipo do documento.
- **Telas e ações:** S01-A08 a A24.
- **Arquivos compartilhados:** `tipos.ts` (cartões novos, dona); `cartoes-chat.tsx` (S01).
- **Situação:** proposta.

#### 2026-11-14 · S01 · Jobs, memória e configuração do integrante por pessoa

- **Decisão:** enquanto não há entidades Job agendado, Memória e configuração do integrante na migração, ficam por pessoa no escritório (`s01:jobs:<usuário>`, `s01:memoria:<usuário>:<integrante>`, `s01:config-integrante:<usuário>:<integrante>`). Jobs guardam os últimos 30 resultados (vazio, ok, parcial, falhou) e o custo estimado, que só Gestor e Administrador veem. Memória do setor só leitura. Configurar mostra as camadas 1 e 2 travadas, setores, clientes, ferramentas por nível (irreversível sempre com aprovação; fora do acesso do dono, "removido"), canal de aviso e teto diário; no celular, só leitura.
- **Por quê:** 01, 9; 02, 5, 7.1, 11.2. Sem migração nova (regra do SESSOES.md).
- **Telas e ações:** S01-A29 a A32, A35, A36, A41, A42.
- **Arquivos compartilhados:** `efeitos.tsx` (casos `s01-promo*` e `s01-obs*`, só acrescentando); `PainelLab.tsx` (seção da S01: limite de IA atingido, sem plano de IA, resumo diário, promoção e fim da observação).
- **Situação:** proposta.

#### 2026-11-14 · S01 · Visão geral lê do banco

- **Decisão:** os widgets da Visão geral saem das tarefas, conversas, eventos e clientes do banco, no escopo da pessoa e do cliente do seletor; o arranjo é por pessoa e separado para cliente e carteira, com o padrão do papel (Administrador com Primeiros passos, Implantações e SLA; Gestor com SLA e Carga prevista; Membro com Horas da semana). O calendário usa o `Calendario` do C5 com filtros (responsável, setor, só atrasadas) e passa `onReprogramar` (passar do prazo legal pede confirmação com a multa estimada; Membro só reprograma as próprias). Outra sessão acrescenta widgets na galeria por `widgetsExtras` (`src/telas/inicio/widgets-inicio.tsx`; o S11 troca o de Prazos do Jurídico). Como a tela migrou, saiu da condição `telaAindaFixa` de `Plataforma.tsx`.
- **Por quê:** 03, 4; registro da S00 sobre telas com dados fixos.
- **Telas e ações:** S01-A43 a A51.
- **Arquivos compartilhados:** `Plataforma.tsx` (tira `inicio/visao` de `telaAindaFixa`; `MinhaConta` recebe `onAlternarModo`), fora do "só acrescentar".
- **Situação:** proposta.

#### 2026-11-14 · S01 · Espera, presença e claro/escuro lembrado

- **Decisão:** ao continuar da espera com uma ficha de tarefa aberta, a tela pergunta "você estava em X; continuar?"; a espera fica por cima da ficha. Enquanto a tela está em espera, `s01:presenca:<usuário>` vale `em_espera` (a S05 pode ler para a presença na comunicação interna); Suporte e conversas da equipe continuam a um clique. O claro/escuro escolhido no menu da conta ou em Minha conta fica lembrado por pessoa no aparelho e volta ao entrar.
- **Por quê:** 01, 2.5; 03, 7.3 e ad. 23; 11, 3; 03, 2.2.
- **Telas e ações:** S01-A68, A84 a A87.
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

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
