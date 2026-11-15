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

#### 2026-11-15 · Coordenação · Grade de widgets: tamanho pelo conteúdo, sem esticar

- **Decisão:** o tamanho do widget (P, M, G, L, XL) dá a largura e o teto de altura; a altura é a que o conteúdo pede (módulos de 4px), e a grade fecha vão por ordem e empacotamento (janela de três), nunca esticando um widget. A largura inteira vem da `larguraMinima` do conteúdo (kanban, semana), não de uma regra fixa. Revê a regra anti-buraco da versão 1 do `PADRAO_DE_INTERFACE.md` (vizinho que cresce para fechar a linha).
- **Por quê:** pedido do dono: "não precisa pegar a largura inteira, só se aquele card pedir"; o card tem de fazer sentido para quem mexe. Direção em `DIRECAO_VISUAL.md`.
- **Telas e ações:** todas as telas com `GradeWidgets` (Visão geral, Painel A/B/C).
- **Impacto no plano:** nenhum (só desenho).
- **Arquivos compartilhados:** `components/widgets/` (tipos, grade, widget), `components/kit/ordenavel.tsx`, `components/kit/estados.tsx`, `index.css`, `telas/painel/padroes.ts`; `DefWidget.larguraTotal` e `linhasMinimas` viraram `larguraMinima` (rem) e `linhasMaximas` (células).
- **Situação:** proposta.

### S01 · Início e moldura

#### 2026-11-14 · S01 · Busca global: contrato C7 publicado

- **Decisão:** `src/dados/busca.ts` define `FuncaoBusca = (termo: TermoBusca, escopo: EscopoBusca) => ResultadoBusca[]`. Cada sessão escreve `src/dados/busca-sNN.ts` e acrescenta **uma linha** em `fontesBusca` (`{ sessao, modulo?, buscar }`). O termo chega normalizado (sem acento), com os dígitos (CNPJ/CPF com ou sem pontuação) e os sinônimos ("legal" e "legalização" acham Societário); use `casa(termo, ...campos)` e `trechoDe`. O resultado traz `destino` (`Destino`) e `clienteId`; a S01 corta o que está fora do escopo, agrupa por tipo e troca o cliente com aviso de uma linha. A fonte da S01 já cobre clientes, tarefas, obrigações, documentos, conversas do CRM (com a transcrição dos áudios), mensagens internas (só das conversas em que a pessoa participa), integrantes e telas. Abre por Ctrl/Cmd+K, "/" ou a lupa do cabeçalho (`abrirBusca(termo?)`).
- **Por quê:** SESSOES.md, C7; o mapa (S01-T09) pede a busca inteira.
- **Telas e ações:** S01-A70 a A74.
- **Impacto no plano:** nenhum (implementa 03, 2.2).
- **Arquivos compartilhados:** nenhum (arquivos novos).
- **Situação:** proposta.

#### 2026-11-14 · S01 · Menu inferior do celular: o que cada destino abre

- **Decisão:** cumprindo o registro da Coordenação, o menu inferior (< 768px) tem Início (vai à Visão geral), **Tarefas** (gaveta com a `TarefasTela` da S04, a pedido dela: lista, por responsável, calendário e revisão; abrir leva à ficha, C4), **Pendências** (gaveta com as pendências por cliente: cobrar e marcar recebida), **Chat** (`abrirChat()`, a mesma gaveta com Equipe e Integrantes) e **Mais** (a barra lateral como gaveta). O botão de menu do cabeçalho some no celular (o "Mais" faz o papel) e a marca curta entra no canto; o botão flutuante "Chat" some no celular. Configurações no celular ficam só leitura, com o aviso "edite no computador" (`SoLeituraNoCelular`, em `components/compostos/edite-no-computador.tsx`, que outras telas podem usar).
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

- **Decisão:** os widgets da Visão geral saem das tarefas, conversas, eventos e clientes do banco, no escopo da pessoa e do cliente do seletor; o arranjo é por pessoa e separado para cliente e carteira, com o padrão do papel (Administrador com Primeiros passos, Implantações e SLA; Gestor com SLA e Carga prevista; Membro com Horas da semana). O calendário usa o `Calendario` do C5 (`semFiltros`, com os filtros da Visão geral: responsável eu, equipe, integrantes ou todos; setor; só atrasadas) e passa `onReprogramar`, que grava com evento e desfazer (quem pode mover e a confirmação da multa ficam no componente da S04). Outra sessão acrescenta widgets na galeria por `widgetsExtras` (`src/telas/inicio/widgets-inicio.tsx`; o S11 troca o de Prazos do Jurídico). Como a tela migrou, saiu da condição `telaAindaFixa` de `Plataforma.tsx`.
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

#### 2026-11-14 · S02 · Ocorrência de obrigação é tarefa; setor dono vem da regra (C2)

- **Decisão:** cada ocorrência de obrigação é uma Tarefa com `origem = 'obrigacao'` e `origem_ref` = id da regra (`Obrigacao`); o setor dono é o `gera_tarefa_para_setor` da regra, copiado em `tarefa.setor_id`. As telas leem pelo formato `ItemObrigacao` (`src/dados/obrigacoes-setor.ts`, campo `setor`). A semente ganhou as regras que faltavam (EFD-Reinf, GIA-SP, DeSTDA, PIS/COFINS, ISS, DAS-MEI, DEFIS, DMED C2-16, ECF, IBGE C2-15, taxa de licença C2-22, conselho C2-20, manifestação NFE-015, entrega das guias GES-039) e o calendário de 10/2026 já gerado. As tarefas t0 e t1 (PGDAS-D 10/2026) passam a ter `origem = 'obrigacao'`.
- **Por quê:** é o que o plano manda (03, 6.2 e ad. 14/11: "Tarefa `origem = obrigacao` por setor dono"); a S02 decidiu, como hipótese.
- **Telas e ações:** S02-T03, S02-A40 a A53; C1 e C2.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** `semente/andrade.ts` (uma linha no fim chama `semente/s02.ts`, que também ajusta t0 e t1 e as versões do perfil, ver abaixo).
- **Situação:** proposta.

#### 2026-11-14 · S02 · Filtro de setores da aba Obrigações e "ver todas"

- **Decisão:** quatro modos (`meus`, `um`, `todos`, `chips`) guardados em `usePersistente('s02:obrigacoes:setores')`. Membro com um setor não vê seletor; com vários, chips (desmarcar foca). Gestor e Administrador: "Meus setores · Um setor · Todos", padrão "meus setores". Quem tem Fiscal vê também as obrigações de Notas (E-03). "Ver todas" do bloco C1 navega com `Destino.filtroSetor` (e o link `#/painel/obrigacoes?setor=dp`) e abre em "um setor" (Gestor) ou só aquele chip (Membro). A competência e a faixa D-20 também ficam guardadas (`s02:obrigacoes:competencia`, `s02:obrigacoes:faixa`).
- **Por quê:** 03, ad. 14/11; o modo de chegar filtrado não tinha regra.
- **Telas e ações:** S02-A40, A53.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** `loja.tsx` (`Destino.filtroSetor?`), `rotas.ts` (parâmetro `setor`), `Plataforma.tsx` (duas linhas).
- **Situação:** proposta.

#### 2026-11-14 · S02 · Regras finas da aba Obrigações

- **Decisão:** (1) "hoje" da demonstração é 18/11/2026; (2) prazo interno padrão = dois dias úteis antes do legal; (3) gerar o calendário é do Gestor e do Administrador e é idempotente (o que já existe, mesmo cancelado, não volta); o integrante Fiscal mostra o trabalho e cria as tarefas ao terminar; (4) o Membro reprograma só as suas (responsável é ele ou o integrante do setor); além do legal pede confirmação com a multa; (5) "sem imposto no mês" (D-23) encerra como concluída com `extras.dispensada`, não como cancelada, porque cancelar obrigação é só do Gestor; (6) multa estimada mostra a origem dos números com selo de demonstração (o motor M3 é simulado); (7) mudar as declarações estaduais do cliente versiona o perfil e marca as futuras não iniciadas como "regerada".
- **Por quê:** o plano não dá esses detalhes; a S02 decidiu.
- **Telas e ações:** S02-A41, A42, A46, A48, A50, A51.
- **Impacto no plano:** nenhum (só desenho).
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-14 · S02 · Integrantes do Painel A agentificados: cartão com ação e aprendizado

- **Decisão:** `src/ambiente/agente-s02.ts` põe o integrante para trabalhar (etapas no chat pelo motor da loja). Quando faz sozinho, a mudança acontece ao terminar; quando prepara, deixa um cartão `s02-…` gravado em `cartao_aprovacao` com a ação em `argumentos`, para que decidir no chat, no sino, na Visão geral ou no topo das Ações da aba execute a mesma coisa. Cada aba registra os executores dos seus cartões. Toda decisão entra na memória do integrante (`s02:memoria`) e ele responde o que anotou; depois de 30 cartões com 95% sem edição, diz que vai perguntar ao Administrador se pode fazer sozinho (02, 3.3), menos transmitir, enviar, pagar e assinar. Gatilhos com efeito na tela: certificado a 30 dias (pede a renovação pelo app uma vez), conferência da Receita (SOC-003, com cartão de regularização quando inapta), captura com lacuna (abre NFE-020).
- **Por quê:** item 7 do mapa (seção 0) e o pedido do dono ("parecer trabalhar de verdade").
- **Telas e ações:** todas as da S02.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** `efeitos.tsx` (uma linha no início: cartões `s02-` vão para `efeitoCartaoS02`).
- **Situação:** proposta.

#### 2026-11-14 · S02 · Dados sem entidade ficam em coleções `s02:*` no `registro_tela`

- **Decisão:** acesso a órgão e procuração, credencial (certificado: nunca o arquivo nem a senha), processo de legalização, licença, comunicação oficial (Domicílio Judicial), acesso ao app, contrato, prorrogação, arquivos repetidos e o estado de Notas por cliente ficam em listas no `registro_tela` (`s02:<colecao>`), com campos no formato das entidades do plano e evento em toda escrita (`src/dados/s02/colecao.ts`). Não criei tabela nova nem migração.
- **Por quê:** o "não altere o esquema Supabase sem migração nova" e o tempo da sessão; o backend vira cada coleção em tabela (Credencial do 08, Processo, Conta de cliente...) sem mudar a tela.
- **Telas e ações:** S02-T02, S02-T04.
- **Impacto no plano:** nenhum para o produto (simplificação do wireframe).
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-14 · S02 · Linha de versões do perfil na semente e histórico real

- **Decisão:** a versão vigente de cada cliente do Andrade passa a ter a data e o motivo da linha de versões dos dados de exemplo, e as versões antigas entram fechadas. O histórico do cabeçalho (S02-A01) lê `versao_perfil`, com "perfil em" uma data; corrigir digitação marca "corrigido por" sem criar versão (01, P2).
- **Por quê:** o histórico era desenhado à mão e igual para todos.
- **Telas e ações:** S02-A01, A20, A21, A22.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** semente existente (`vp-c*`), ajustada por `semente/s02.ts`.
- **Situação:** proposta.

#### 2026-11-14 · S02 · Estado do cliente na anatomia

- **Decisão:** além da faixa de ciclo de vida da S04 (C6), a aba mostra uma faixa própria para proposta, aceito, em baixa, inativo e encerrado ("encerrado em DD/MM; retenção até AAAA", cinco anos). Inativo, encerrado e arquivado deixam a aba só leitura (as Ações somem). Prospect e proposta: no Societário só ficha, pessoas e contrato; nas outras abas, um estado vazio explicando.
- **Por quê:** 03, 6.1 e 8.1; a retenção de cinco anos é hipótese da S02.
- **Telas e ações:** S02-T01 (estados), S02-A34.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-14 · S02 · Serviço simulado de cadastros

- **Decisão:** arquivo novo `src/servicos/cadastros.ts` com consulta de CNPJ (API-12), procurações (API-06) e Domicílio Judicial, com dados fictícios e marcados; uma linha em `Servicos`, `servicos` e `catalogoServicos`.
- **Por quê:** o catálogo da S00 ainda não tinha consulta de CNPJ.
- **Telas e ações:** S02-A19, A26, A33.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** `src/servicos/index.ts` (acréscimo).
- **Situação:** proposta.

#### 2026-11-14 · S02 · Notas: captura, emissão e divergência

- **Decisão:** a captura parada da demonstração é a Loja Bela Vista (c3: A1 vencido em 15/11 e autXML faltando); "forçar captura" e "rodar a rotina das 3h" usam o mesmo motor e, a cada duas rodadas, o integrante acha um buraco de sequência e abre a NFE-020 sozinho. Emitir a pedido do cliente: o cartão aprova mandar o rascunho ao cliente, o "pode emitir" dele fica guardado como prova (GES-036) e a emissão é sempre de uma pessoa. Aceitar ou corrigir divergência tributária é decisão da pessoa na gaveta (sem cartão) e o integrante registra o que anotou. A saúde da captura no cabeçalho lê o estado de Notas enquanto o C9 (S09) não chega.
- **Por quê:** o plano não fixa os exemplos nem a forma do aceite do cliente.
- **Telas e ações:** S02-T04, A54 a A66.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-14 · S02 · Ficha do cliente: papéis por serviço, edição por papel, entrega

- **Decisão:** papel no app por serviço (Contábil: sócio, financeiro, RH, contador interno, leitura, sem acesso; BPO: aprovador, financeiro, leitura, sem acesso), em `ContatoCliente.papeis`. O contato "principal" recebe o assunto sem dono; sem principal, vai ao sócio ou titular. O Membro com setor edita contatos e entrega; Gestor e Administrador também responsáveis e serviços extras; a alçada só o Gestor do BPO e o Administrador, e só como proposta até o aceite no app. O que a conta não edita aparece só leitura, com aviso: a ficha é de consulta. Na Relação, setores que a conta não tem aparecem só como número; valores de honorário só para quem tem o Financeiro. Preferência de entrega em `FichaCliente.entrega` (padrão "só digital"). Cada salvar grava o evento `ficha.atualizar` com o diff, e a aba Histórico lê dele.
- **Por quê:** 04, 5.4; 06, 2.4; 01, ad. 22 e 25; C2-09. Os detalhes de papel e edição são hipótese da S02.
- **Telas e ações:** S02-T05, A67 a A72.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** `fluxos.tsx` (só `GavetaFichaCliente`, que delega), `clientes.ts` (campos opcionais).
- **Situação:** proposta.

#### 2026-11-14 · S02 · Faixa de ciclo de vida da S04 no lugar da faixa própria (revê "Estado do cliente na anatomia")

- **Decisão:** a `FaixaCicloDeVida` da S04 (C6) fica acima do cabeçalho de toda aba, como pede a S04. Como ela já cobre implantação, saída, baixa, inativo e encerrado, a faixa própria da S02 passa a aparecer só em prospect, proposta e aceito. A regra de só leitura (inativo, encerrado, arquivado) continua. O painel de ciclo de vida da S04 (`widgetCicloDeVida`, por serviço) entra na galeria do Societário; o bloco "Ciclo de vida" da S02 (S02-A34) continua no arranjo padrão.
- **Por quê:** pedido da S04 repassado pela coordenação; evita duas faixas para o mesmo estado.
- **Telas e ações:** S02-T01 (estados), S02-A34; S04-T09.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

### S03 · Painel B: Fiscal, Contábil, Consultoria

#### 2026-11-14 · S03 · Estado do Painel B em `usePersistente`, sem entidade nova

- **Decisão:** o que muda com o uso nas abas Fiscal, Contábil e Consultoria (mensagem aberta, conferência, recibo, guia enviada e paga, regras por favorecido e de-para, Kanban, fila de assinatura, rascunhos de parecer) fica em `usePersistente` com chaves `s03:fiscal:<cliente>`, `s03:contabil:<cliente>`, `s03:consultoria:<cliente>`, `s03:contabil:kanban`, `s03:aprendizado` e `s03:avulsos` (tabela `registro_tela`). Tarefas, documentos, conversas, avisos, eventos e cartões usam a loja e os repositórios de sempre. Nenhuma migração nova: funciona igual no modo local e no Supabase.
- **Por quê:** o mapa (1.6) pede estado novo por `usePersistente`; as entidades próprias (declaração, guia, lançamento, regra) ficam para o backend. Decidido pela S03.
- **Telas e ações:** S03-T01 a T03.
- **Impacto no plano:** nenhum (simplificação do wireframe; o backend modela Guia, Declaração, Lançamento e Regra do subplano 01).
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-14 · S03 · Cartões `s03-*` com efeito pelo `useEfeitosS03`

- **Decisão:** todo cartão da S03 tem id `s03-<ação>-<sufixo>` e guarda em `s03:cartao:<id>` o que faz ao ser aprovado. `efeitos.tsx` chama `useEfeitosS03()` logo depois de `loja.decidir` (uma linha); decidir no chat, no sino ou dentro do widget dá no mesmo. Cada decisão conta em `s03:aprendizado` (aprovado, editado, recusado) e o widget mostra "N de 30 decisões" para a promoção do 02, 3.3; transmitir, abrir caixa postal e reabrir competência aparecem como nunca promovíveis.
- **Por quê:** "acrescentar os efeitos dos seus cartões, com chave prefixada pela sessão" (SESSOES, 2) sem tocar no `switch` existente.
- **Telas e ações:** S03-A02, A06, A07, A08, A11, A15, A17, A28, A33, A34, A37, A38, A44, A50.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** `src/ambiente/efeitos.tsx` (duas linhas acrescentadas).
- **Situação:** proposta.

#### 2026-11-14 · S03 · Números por cliente: perfil escrito à mão ou gerado estável

- **Decisão:** cada cliente tem um perfil fiscal e contábil (`src/dados/painel-s03.ts`): os do escritório Andrade escritos à mão, coerentes com o resto da demonstração; qualquer outro (Horizonte, cliente novo) gerado de forma estável a partir do id. Simples com as tabelas dos anexos da LC 123/2006 (alíquota efetiva calculada), fator R pela folha, DCTFWeb e Reinf pela folha e receita, guias pelo regime, carteira somando os clientes. Nenhum número repete a Metalúrgica Andrade.
- **Por quê:** pedido do dono ("os números devem variar por cliente"); lacuna 7 do mapa.
- **Telas e ações:** S03-T01 a T03.
- **Impacto no plano:** nenhum (dados fictícios).
- **Arquivos compartilhados:** nenhum (os blocos `fiscalDetalhe`, `contabilDetalhe` e `consultoriaDetalhe` ficaram como estavam e não são mais lidos pelas abas da S03).
- **Situação:** proposta.

#### 2026-11-14 · S03 · Um cliente MEI no escritório de exemplo

- **Decisão:** a semente do Andrade ganha "Ateliê Linha Fina MEI" (`c-s03-mei`, fictício) em `src/nucleo/semente/s03.ts`, chamado antes da linha da S02 em `andrade.ts` para o calendário de 10/2026 gerar o DAS-MEI. Bancos já guardados precisam de "Resetar o ambiente" para ver o cliente.
- **Por quê:** a variante MEI da aba Fiscal (FIS-016 a 018) não tinha cliente para aparecer.
- **Telas e ações:** S03-T01 (MEI).
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** `src/nucleo/semente/andrade.ts` (uma linha e um import, com `// S03`).
- **Situação:** proposta.

#### 2026-11-14 · S03 · Pedido à S02: cabeçalho do perfil para cliente fora da lista fixa

- **Decisão:** `perfilDoCliente` (`src/dados/perfil-cliente.ts`, da S02) quebrava a aba inteira para qualquer cliente fora da lista `fixos` (o MEI e os clientes do Horizonte). A S03 pôs um valor padrão de uma linha para não quebrar; a S02 pode trocar pelo perfil real.
- **Por quê:** a tela caía com erro; correção mínima.
- **Telas e ações:** S02-T01 (cabeçalho), todas as abas com cliente.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** `src/dados/perfil-cliente.ts` (uma linha, fora da regra "só acrescentar").
- **Situação:** proposta (pede revisão da S02).

#### 2026-11-14 · S03 · Selo de fase sempre visível nos blocos das fases 4 e 5

- **Decisão:** blocos e itens das fases 4 e 5 (créditos, planejamento, reforma, recuperação, entrada e saída, auditoria, consolidação, renda variável, cripto, espólio) funcionam e levam um selo discreto "fase N", sem depender da opção "Mostrar fases" do mapa (1.4).
- **Por quê:** o dono pediu todas as fases funcionando; o selo diz o que vem depois sem esconder. Se a coordenação adotar a opção do painel Demonstração, o `SeloFase` (`telas/painel/s03/pecas.tsx`) passa a ler dela.
- **Telas e ações:** S03-T01 (créditos), T02 (fase 4), T03 (fases 4 e 5).
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-14 · S03 · Regras de negócio que o plano não fixa

- **Decisão:** (1) ciência tácita da caixa postal em 10 dias do recebimento; o cartão de abrir expira na véspera; (2) retenção de 10% sobre lucro acima de R$ 50 mil no mês por sócio (Lei 15.270/2025), com DARF até o dia 20 do mês seguinte **[sem regra no plano: vencimento]**, aviso uma vez por sócio e mês; (3) trava do REINF por trimestre: no Presumido e no Real os meses de trimestre já enviado não aceitam resposta de dúvida (vira complementar); sem REINF (Simples), o trimestre fica aberto; (4) travas do relatório (D-26): faturamento zerado, lucro maior que o faturamento, "outras receitas" acima de 20% do faturamento **[sem regra no plano: limite]** e balancete com débito ≠ crédito; corrigir ou justificar libera; (5) a conferência da assinatura (D-16) exige assinatura digital dentro do PDF, e "devolver sem assinatura digital" mostra a recusa; (6) FIS-010 (enviar DAS e DAS-MEI) é "executar" porque está promovida em Configurações › Integrantes; as outras guias saem por cartão; (7) IRPF, ECD e ECF são "só pessoa": botão com confirmação, nunca cartão do integrante.
- **Por quê:** o mapa marca essas regras sem detalhe; decididas pela S03 como hipótese para os contadores validarem.
- **Telas e ações:** S03-A02, A08, A19, A31, A32, A35 a A39.
- **Impacto no plano:** 03, 6.4 e 6.6; lista do Leandro (D-14, D-15, D-16, D-26), a confirmar.
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-14 · S03 · "Fora do escopo" para o Financeiro e serviços novos

- **Decisão:** marcar uma pergunta fora do escopo grava em `usePersistente('s03:avulsos')` a lista `{ id, cliente, clienteId, assunto, quando, por }` e leva ao Financeiro › Contratos; a S07 pode ler essa chave para propor o avulso. Serviços simulados novos em `src/servicos/s03.ts` (EFD-Reinf, Sicalc, Calculadora RFB, core contábil, leitor de extratos, validador de assinatura), com uma linha cada em `servicos` e em `catalogoServicos`. Ferramentas novas `fiscal.*`, `contabil.*` e `consultoria.*` no fim de `ferramentas.ts`.
- **Por quê:** S03-A48 (entrega para S07) e catálogo de APIs do mapa (1.7).
- **Telas e ações:** S03-A48; APIs 09, 06, 15, 18, 19, 22.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** `src/servicos/index.ts`, `src/nucleo/permissoes/ferramentas.ts` (só acrescentando).
- **Situação:** proposta.

#### 2026-11-14 · S03 · Arranjo padrão das variantes MEI e pessoa física

- **Decisão:** como `chavePadrao` (S02) só separa o Simples, Presumido, Real, MEI e pessoa física dividem a chave `fiscal` em `padroes.ts`; a grade descarta os ids que a variante não tem. Pedido à S02: se quiser arranjo próprio, acrescentar `fiscal-mei` e `fiscal-pf` em `chavePadrao`.
- **Por quê:** não mudar a estrutura da S02.
- **Telas e ações:** S03-T01.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** `src/telas/painel/padroes.ts` (só as chaves das abas da S03).
- **Situação:** proposta.

#### 2026-11-14 · S03 · Gatilhos do Painel B no painel Demonstração

- **Decisão:** seção própria no painel Demonstração (`telas/painel/s03/gatilhos.tsx`, uma linha em `PainelLab.tsx`): mensagem nova no e-CAC, extrato chega pelo WhatsApp, guia vence sem pagamento, sócio passa de R$ 50 mil, job do dia 8 (PGDAS-D da carteira) e derrubar/religar o Integra Contador (C9). Cada gatilho põe o integrante para trabalhar com etapas e termina no que o produto faria (cartão, baixa de pendência, aviso).
- **Por quê:** mostrar aos contadores o integrante agindo por gatilho (mapa, 0, item 7).
- **Telas e ações:** S03-T01, T02.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** `src/ambiente/PainelLab.tsx` (uma linha e um import).
- **Situação:** proposta.

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

#### 2026-11-15 · S06b · Lançamento manual de tempo, ao lado da captura automática

- **Decisão:** o Timesheet passa a aceitar tempo lançado à mão (pedido do dono, 15/11), sem deixar de ter a captura automática como principal. O lançamento é uma **ação dentro de Meu tempo**, não uma aba nova: o botão "Lançar tempo" fica no cabeçalho e no cartão lateral, junto com o cronômetro, e a visão "O que lancei à mão nesta semana?" (cliente e atividade por dia) fica em Semana. Assim a ordem das abas decidida (Meu tempo · Confirmações · Equipe · Rentabilidade) continua igual. Campos do lançamento: cliente, tarefa ou atividade, data, início e fim ou duração, descrição e faturável. Ações: duplicar para outro dia, repetir os lançamentos do dia útil anterior, cronômetro (iniciar e parar). O cliente vem preenchido nesta ordem: o da tela de origem (seletor do topo ou o evento `heild:ts-lancar` com `{ cliente_id?, tarefa_id?, atividade_id?, dia? }`, que abre o lançamento de qualquer tela), o da tarefa aberta e, por último, o da última sessão do dia.
- **Regras:** o lançamento é uma `sessao_trabalho` com `origem = 'manual'` e `confianca = 'confirmada'`, marcada como "manual" nas listas, no CSV e na Equipe. Se o intervalo cruza uma sessão já capturada, a pessoa precisa escolher entre "manter as duas" (as duas ficam e o lançamento leva a marca) e "o meu substitui a capturada" (a capturada fica com `substituida_por`). Editar guarda a versão anterior em `versoes`, e descartar marca o lançamento como substituído (nada se apaga). Só a própria pessoa lança, edita e para o cronômetro: o Gestor vê a proporção manual × automático na aba Equipe ("Quanto foi lançado à mão?").
- **Tempo padrão do que é feito por fora:** fica em Configurações do Timesheet (Administrador), guardado em `escritorio.configuracao.timesheet.tempos_padrao` (nome, atividade, minutos). Vem com seis itens: ligação com cliente (10 min), emissão de guia no portal (15), e-mail ao cliente (5), conferência de documento (10), reunião com cliente (30) e certidão no portal (10). Escolher um deles no lançamento preenche a duração, que a pessoa pode alterar.
- **Por quê:** pedido do Enzo repassado pela Coordenação. Ele muda a premissa "ninguém precisa mais apontar" do 05: o termo de ciência foi reescrito ("o registro automático faz quase tudo; o que foi feito fora do sistema você pode lançar à mão") e ganhou a linha "o que você lançar à mão, marcado como lançamento manual".
- **Telas e ações:** S06-T01 (Lançar tempo, cronômetro, semana manual), S06-T03 (proporção manual), S06-T05 (tempo padrão), S06-A42 (CSV com fonte, descrição e faturável).
- **Impacto no plano:** 05, 1.3 e 8.2. O lançamento manual vira uma sexta fonte (`manual`), opcional, e o termo de ciência (10.1) passa a citá-lo. 05, 1.4 ("apontamento manual livre não existe em tela alguma") fica revisto por este registro.
- **Arquivos compartilhados:** `entidades.ts` (origem `manual` e os campos `descricao`, `faturavel`, `lancamento_de`, `versoes` na sessão, só acrescentando), `ferramentas.ts` (`timesheet.lancar`). Esquema em `app/supabase/migrations/20261115180000_s06b_lancamento_manual.sql`.
- **Pedido a S09:** o modelo de texto "apresentação do Timesheet" em `TemaTela.tsx` ainda diz "ninguém precisa mais apontar horas". Sugestão: "A captura automática faz quase tudo; o que for feito fora do sistema, vocês lançam à mão com o tempo padrão do escritório."
- **Situação:** proposta.

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

- **Decisão:** o Financeiro lê a marca que a S04 grava na ficha da tarefa (`acoesTarefa.marcarExtra`: `extras.servico_extra: true` e `extras.extra_valor`, texto opcional como "R$ 360,00"). Ele lista essas comandas em Contratos › "O que entra na próxima fatura"; "Faturar comanda" cria o `servico_avulso` (`origem: 'comanda'`, `tarefa_id`, o valor informado ou o da tabela de avulsos) e o cartão que manda a proposta ao cliente; com o aceite, fica a faturar. O certificado digital vendido como serviço é o item `C2-23` da tabela de avulsos e um avulso de `origem: 'certificado'`, `fase: 3`, visível com o selo "fase 3 · depois" e sem ação.
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

#### 2026-11-14 · S07 · Ausências e "não era esta" não mexem na cobrança

- **Decisão:** a cobrança do escritório não é por hora: o contrato é fixo, por faixa ou por unidade (09, 4.2), e o avulso por hora (consultoria) leva a quantidade combinada na proposta, com aceite. Por isso as ausências e o "não era esta" da S04 não alteram fatura, lote nem avulso; eles entram no custo-hora e na Rentabilidade (S06), que o Financeiro lê pelo `fechamento_financeiro.custo_hora`. O serviço extra marcado na tarefa (C2-25) já é lido (registro "Comanda de serviço extra").
- **Por quê:** pedido da S04 repassado pela coordenação; o plano não cobra honorário por hora apontada.
- **Telas e ações:** S07-A09, S07-A44.
- **Impacto no plano:** nenhum.
- **Situação:** proposta.

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

### S08c · BPO › Aprovações e Configuração

#### 2026-11-14 · S08c · Estado novo das duas telas em `extras`, sem migração

- **Decisão:** o que as telas Aprovações e Configuração passaram a guardar fica no campo `extras` (jsonb) das tabelas que já existem: `bpo_configuracao.extras.s08c` (alçada de conferência por pessoa e ações "faz sozinho" desligadas), `bpo_perfil.extras.s08c_sla` (prazos do SLA), `bpo_lote.extras.s08c_escalonamento` e `s08c_excecao`, `bpo_alcada.extras` (`limite_dia`, `limite_mes`, `reforcada`, `vigencia_ate`). As regras e simulações ficam em `src/telas/bpo/regras-s08c.ts`.
- **Por quê:** nenhuma coluna nova; funciona nos dois modos de dados sem migração (a `20261114180000_s08_bpo.sql` já tem `extras` em todas as tabelas). A sessão decidiu.
- **Telas e ações:** S08-T05, S08-T07.
- **Impacto no plano:** nenhum (no backend real, `limite_dia`, `limite_mes`, `pode_conferir_ate` e `pode_aprovar_reforcada` viram colunas da alçada e do vínculo, 10, 3.9).
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-14 · S08c · Lote com exceção vai à aprovação reforçada

- **Decisão:** as exceções da 3.7 (fornecedor novo, dados bancários alterados, valor 30% acima da média do fornecedor, duplicidade suspeita, fracionamento por fornecedor e dia, pessoa física) aparecem na conta como "sobe de faixa". Lote enviado com exceção leva `extras.s08c_excecao` e pede duas aprovações mesmo abaixo da faixa 2 (linha "Com exceção" da 3.7). No repositório, `aprovar` passou a considerar `s08c_excecao` ao recalcular quantas aprovações faltam (uma linha). "Fora do horário" e "urgência" ficam listados nas regras, sem detecção na demonstração.
- **Por quê:** 10, 3.7 manda subir de faixa; sem isso, fornecedor novo passava com um aprovador.
- **Telas e ações:** S08-A22, A24, A27; no app (S08d), o lote com exceção mostra "falta a segunda aprovação" depois da primeira, sem mudança na tela do app.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** `src/nucleo/repositorios/bpo.ts` (uma linha em `RepositorioLotesBpo.aprovar`, comentada "S08c"). Aviso à S08d: quem aprova continua vindo de `aprovadoresPara` (alçada para o total); a reforçada por exceção pede duas dessas pessoas.
- **Situação:** proposta.

#### 2026-11-14 · S08c · Fornecedor novo só entra em lote com os dados confirmados por segundo canal

- **Decisão:** conta conferida de fornecedor novo ou alterado sem `dados_bancarios_confirmados_em` não tem "Pôr no próximo lote": no lugar, "Confirmar dados" pede o canal (vai para a trilha) e troca o alerta das contas em aberto do fornecedor. O integrante, ao sugerir o lote, também pula essas contas.
- **Por quê:** 10, 3.13 (troca de conta do fornecedor é a fraude mais comum) e 3.8 (cadastrar ou alterar dados bancários exige confirmação por segundo canal).
- **Telas e ações:** S08-A23.
### S08a · BPO: Visão geral, Carteira e Clientes

#### 2026-11-15 · S08a · Dados novos do perfil BPO em `extras.s08a`, sem migração

- **Decisão:** o que a S08a acrescenta ao perfil BPO da empresa (quem fez cada passo da implantação, item do contrato, termo, convites do app, carga inicial do ERP, paralelo com a comparação, prazos do SLA, versões do perfil, ativação e saída) fica em `bpo_perfil.extras.s08a` (tipo `ExtrasS08a` em `src/telas/bpo/perfil-s08a.ts`), gravado pelo repositório `repos.bpo.perfis` com evento. A coluna `extras jsonb` já existe na migração da S08: nenhuma migração nova, nada editado nas aplicadas. Os efeitos pendentes dos integrantes ficam em `s08a:efeitos` e os cartões em `s08a:cartoes` (`registro_tela`).
- **Por quê:** os campos de 10, 3.12 (`termo_id`, `sla_id`, `conexoes_bancarias`) e de 3.14 viram tabelas próprias no backend; até lá, o JSON do perfil guarda o mesmo conteúdo nos dois modos de dados. A sessão decidiu.
- **Telas e ações:** S08-A06, A09, A10, A11.
- **Impacto no plano:** nenhum (só desenho; no backend, `termo`, `sla` e `versao_perfil` como tabelas).
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-15 · S08a · Visão geral por papel

- **Decisão:** o Membro abre a Visão geral nas empresas em que é analista ou responsável ("o que é dele", 10, 5.4), com "Minhas · Toda a carteira" (lê a carteira inteira, como na Carteira); o Gestor e o Administrador abrem na carteira toda e veem o bloco "Por analista" (quem acumula vermelho; clicar abre a Carteira filtrada pela pessoa); a margem do BPO aparece só para quem vê Rentabilidade (Administrador; Gestor com Gestão ou Financeiro). Entram também "Fila em risco" (bola conosco e prazo hoje ou amanhã) e "Caixa das empresas" (saldo contra o mínimo, em barra com texto) e o volume do mês no subtítulo, como no wireframe de 10, 5.3. "Pedir o resumo do dia" põe a Conciliação para trabalhar e responder no Time.
- **Por quê:** 10, 5.2 e 5.4 dizem o que cada papel vê, mas não a forma; a sessão decidiu.
- **Telas e ações:** S08-T01, A01 a A04.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-14 · S08c · Alçada de conferência da pessoa do BPO e limites da alçada da empresa

- **Decisão:** em Configuração › Equipe do BPO, o Gestor do BPO (ou o Administrador) define até quanto cada pessoa confere (`pode_conferir_ate`, 10, 3.9); vale a menor entre ela e a faixa da conta, e o botão "Conferir" desliga com o motivo. A proposta de alçada ganhou limite por dia e por mês, revisão anual e quem entra na reforçada; o limite diário aceito trava "Montar lote e enviar" quando o que já está com o cliente mais o lote passa dele. A marca "reforçada" por pessoa só vale com o aceite (o `aceitar` do repositório aplica `extras.reforcada` na ficha, junto com as alçadas).
- **Por quê:** 10, 3.9 fala em limites por pagamento, dia e mês e em alçada da pessoa do BPO por vínculo; a forma é da sessão. A regra do limite de conferência é conferida na tela (o repositório comum segue com a segregação B2).
- **Telas e ações:** S08-A22, A24, A36.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** `src/nucleo/repositorios/bpo.ts` (função nova `aplicarReforcadaS08c` e a chamada dela em `RepositorioAlcadasBpo.aceitar`). Aviso à S08d: o cartão "o escritório propôs novas alçadas" pode mostrar `extras.limite_dia` e `extras.reforcada` (hoje não mostra; o aceite funciona igual).
- **Situação:** proposta.

#### 2026-11-14 · S08c · M2 só até o teto; acima, o lote vai como M1

- **Decisão:** na empresa em M2, o lote com alguma conta acima do teto é enviado como M1 (o cliente libera no banco), com o aviso na montagem e no cartão.
- **Por quê:** 10, 3.4 põe teto no M2; o plano não diz o que fazer com a conta acima dele. A sessão escolheu o caminho que nunca paga sem o cliente.
- **Telas e ações:** S08-A24, A35.
#### 2026-11-15 · S08a · Carteira: filtros guardados, visão por analista e sincronizar a carteira

- **Decisão:** a Carteira ganha busca, filtro pela cor, pelo ERP (com problema, modo arquivo, livro próprio), pela pessoa e pela situação do serviço, e ordem (auditoria, caixa perto do mínimo, SLA abaixo da meta, nome), guardados por pessoa (`s08a:carteira:filtros`). A visão "Por analista" mostra uma coluna por pessoa da equipe do BPO; arrastar a empresa reatribui **só o analista** (o responsável que confere não muda), vira uma versão do perfil e só o Gestor arrasta. "Sincronizar a carteira" põe a Conciliação para ler os ERPs por API que estão funcionando e dizer quais ficaram de fora e por quê (credencial vencida, modo arquivo, conector com problema).
- **Por quê:** o plano pede reatribuir por arrastar na Fila (10, 5.4) e gestão por exceção na carteira; reatribuir a análise da empresa inteira pela Carteira é decisão da sessão.
- **Telas e ações:** S08-T02, A06, A07, A17 (na Carteira).
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-14 · S08c · Escalonamento avançado pelo relógio da demonstração

- **Decisão:** o cartão do lote aberto mostra os passos do escalonamento (10, 3.6 e Q3) com o que já aconteceu e o próximo. O Gestor do BPO (ou o Administrador) tem "Avançar o relógio" (selo de demonstração): lembrete ao aprovador; substituto (se tiver alçada na ficha, entra no `pode_aprovar` do cartão; sem alçada, só acompanha e o alerta vai ao Gestor); alerta da véspera ao Gestor e ao sócio com a lista; vencido, só alerta, o cartão expira pelo `expirar` do repositório e as contas voltam para um lote novo. Cada passo vira aviso no sino e entra na trilha. O sócio que recebe os alertas é escolhido no escalonamento.
- **Por quê:** o mapa pedia a linha do tempo do escalonamento visível no cartão; sem relógio, ninguém via os passos acontecerem. Fica no cartão (e não no painel Demonstração, arquivo comum do BPO) para não conflitar com as outras sessões.
- **Telas e ações:** S08-A25, A37.
#### 2026-11-15 · S08a · Implantação: ação em cada passo, caixa para o que foi feito fora

- **Decisão:** cada um dos oito passos (10, 3.3) tem a sua ação: (1) gravar o item no contrato com faixa de volume e mensalidade; (2) enviar o termo de dados pelo app e registrar o aceite; (3) Contas a Pagar prepara o convite do app com a alçada de cada pessoa e deixa um **cartão de aprovação** (`s08a-convite-*`), que aparece na ficha, no chat e no sino; aprovado, sai; recusado, nada sai; (4) bancos por Open Finance; (5) ERP e a carga de 90 dias pela Conciliação; (6) Contas a Pagar lista os recorrentes do espelho sem dado bancário e uma pessoa confirma cada um; (7) o paralelo começa com 30 dias e o passo fecha quando o Gestor revisa a comparação do Gerencial (a demonstração não espera os 30 dias); (8) ativar só depois dos sete, com confirmação, evento e prova. A caixa de cada passo continua valendo para marcar o que foi feito fora da plataforma (contrato em papel, por exemplo), com quem e quando. O aceite do termo e o primeiro acesso ao app são simulados por botão marcado como demonstração. As faixas do contrato (até 150, 300 e 600 lançamentos) e as mensalidades sugeridas (R$ 900, R$ 1.400 e R$ 2.300) são exemplo.
- **Por quê:** o mapa pede "integrantes que preparam e deixam cartão" e "nada sai ao cliente sem aprovação"; o plano lista os passos, não a tela de cada um. Valores de exemplo, a validar.
- **Telas e ações:** S08-A10.
- **Impacto no plano:** 10, 3.3 (faixas e valores a validar).
- **Arquivos compartilhados:** `src/ambiente/efeitos.tsx` (um import e uma linha para os cartões `s08a-*`), `src/telas/bpo/ModuloBpo.tsx` (um import e uma linha `useEfeitosS08a()`), só acrescentando.
- **Situação:** proposta.

#### 2026-11-15 · S08a · Encerramento com aviso prévio, desistência e ordem revogar → apagar

- **Decisão:** abrir o encerramento (Administrador, com motivo) marca o aviso prévio de 30 dias; os cinco passos de 10, 3.14 têm ação (gerar o pacote de saída com manifesto, revogar banco e ERP em um passo com confirmação, apagar o espelho com prova de exclusão, que só libera depois de revogar); "Desistir do encerramento" volta o serviço ao ativo com motivo e fica no histórico. Concluir tira o serviço BPO do cliente; o cadastro continua (em Clientes aparece "BPO encerrado" com "Pôr no BPO").
- **Por quê:** o plano dá os passos e "aviso prévio" no contrato sem número; 30 dias é hipótese da sessão.
- **Telas e ações:** S08-A11.
- **Impacto no plano:** 10, 3.14 (prazo do aviso prévio a validar).
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-15 · S08a · Fornecedor confirmado por segundo canal pede canal, contato e dados conferidos

- **Decisão:** na ficha BPO, "Confirmar" o fornecedor pede o canal (telefone já conhecido, e-mail do cadastro, presencial), com quem falou e banco, agência e conta conferidos; grava `risco = recorrente`, `dados_bancarios_confirmados_em`, `confirmado_por` e `canal_confirmacao` (ferramenta `fornecedor.alterar_dados_bancarios`, só pessoa). Fornecedor novo cadastrado à mão entra sem dado bancário. A auditoria deixa de pesar "fornecedor novo" quando ele é confirmado.
- **Por quê:** 10, 3.13 manda confirmar por segundo canal; o plano não diz o que registrar.
- **Telas e ações:** S08-A06, A10 (passo 6).
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-14 · S08c · Integrantes por função na Configuração do BPO

- **Decisão:** a Configuração lista os quatro integrantes do BPO com o que cada um faz sozinho (S), o que prepara (P) e o que nunca faz (travado: pagar, conferir, alterar dados bancários, mudar alçada, fechar o mês, revogar credencial, cobrança firme). Só o Administrador tira item do "faz sozinho" (01, 3.3: a lista vem cheia e ele só tira). Nas telas da S08c o efeito é real em dois pontos: a captura do ERP fica desligada com o motivo e "sugerir o lote" respeita a lista. As outras sessões podem ler `acaoLigada(config, integrante, acao)` de `regras-s08c.ts`.
- **Por quê:** o pedido da S08c inclui "integrantes por função e o que cada um faz sozinho"; a classe vem do 10, 6.2 e 6.3.
- **Telas e ações:** S08-T07.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** `src/telas/bpo/integrantes.ts` (efeito novo `sugerir_lote`, no fim, comentado "S08c").
- **Situação:** proposta.

#### 2026-11-14 · S08c · Ferramentas próprias do BPO para capturar, cancelar e confirmar baixa

- **Decisão:** `conta_pagar.capturar`, `conta_pagar.cancelar` e `conciliacao.confirmar` existem nos dois catálogos (BPO e Financeiro do escritório, S07); o índice guarda a última, a do Financeiro (setor `financeiro_escritorio`), e por isso a equipe do BPO sem o Financeiro (Marina, Lucas) não lançava conta nem confirmava baixa. Acrescentei `bpo.conta.capturar`, `bpo.conta.cancelar` e `bpo.conciliacao.confirmar` no fim do catálogo e o repositório do BPO passou a usá-las. Os nomes antigos continuam com o significado do Financeiro.
- **Por quê:** permissão é por ferramenta e titular (10, 5.4, F1); o mesmo nome com dois setores é ambíguo.
- **Telas e ações:** S08-A22 (lançar conta), A25 (baixa).
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** `src/nucleo/permissoes/ferramentas.ts` (três linhas no fim); `src/nucleo/repositorios/bpo.ts` (cinco nomes de ferramenta trocados). **Pedido à coordenação (ou à S08b):** `src/telas/bpo/OperacaoBpo.tsx`, no botão de lançar conta (`SePode ferramenta="conta_pagar.capturar"`), trocar para `bpo.conta.capturar`; não mexi para não conflitar.
- **Situação:** proposta.

#### 2026-11-14 · S08c · Trilha do lote com impressão encadeada de demonstração

- **Decisão:** "Trilha" no cartão do lote lista os eventos do lote, das contas e do cartão (quem, quando, ferramenta) com uma impressão curta encadeada (FNV, não criptográfica) para mostrar a ideia da cadeia de hashes das Fundações (5.2). O backend real usa o hash das Fundações.
- **Por quê:** 10, 3.11 pede a trilha como entregável ao cliente e ao auditor.
- **Telas e ações:** S08-A25.
- **Impacto no plano:** nenhum (só desenho).
#### 2026-11-15 · S08a · Clientes do BPO puro sem o pacote Contábil e com o encerrado no cadastro

- **Decisão:** no cenário "Só BPO", Clientes não mostra o pacote nem o responsável da contabilidade; filtra pela situação do BPO (em implantação, ativo, sem BPO); o cliente com o BPO encerrado continua no cadastro (com "Pôr no BPO"). O novo cliente confere o CNPJ ou CPF (dígitos, e se já existe, com "Abrir a ficha existente") e pode já abrir a implantação do BPO. Contatos filtram por quem aprova pagamentos e por quem usa o app.
- **Por quê:** 10, 2.2 e 2.5: o cadastro é um só e é do núcleo; no C1 não há Painel nem pacote Contábil.
- **Telas e ações:** S08-T08, A40 a A42.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

### S08b · BPO › Fila e pedidos e Rotinas

#### 2026-11-15 · S08b · Fila e Rotinas em `telas/bpo/operacao/`, com os mesmos nomes exportados

- **Decisão:** as duas abas saíram de `OperacaoBpo.tsx` para `src/telas/bpo/operacao/` (fila, documentos, rotinas, seções, fechamento, integrantes, dados). `OperacaoBpo.tsx` só reexporta `FilaBpoTela`, `RotinasBpoTela`, `rotuloBola`, `slaDe` e `useAcoesFila`, para o módulo, os contratantes e o portal do convidado não mudarem.
- **Por quê:** as abas cresceram muito; arquivos separados evitam conflito com as outras sessões do BPO.
- **Telas e ações:** S08-T03, S08-T04.
- **Impacto no plano:** nenhum (só desenho).
- **Arquivos compartilhados:** nenhum fora da regra.
- **Situação:** proposta.

#### 2026-11-15 · S08b · Documentos que chegam viram entidade própria (`bpo_documento`)

- **Decisão:** boleto, nota e comprovante que chegam pelo app, WhatsApp, e-mail ou DDA entram em "Documentos chegando" na Fila antes de virar conta. O integrante de Contas a Pagar lê (`conta_pagar.ler_documento`, rascunhar) e checa contra o cadastro da empresa: duplicidade (mesmo fornecedor, valor e vencimento, ou o mesmo código de barras), fornecedor novo, dados bancários diferentes do cadastro e valor acima do dobro da média do fornecedor. **Só lança sozinho** (captura é "faz sozinho", FIN-003) quando a leitura tem confiança alta e nenhuma checagem chamou atenção; senão, uma pessoa revisa e lança (e passa a ser quem digitou: outra pessoa confere). Duplicidade só passa com o motivo de quem confirmou que é outra cobrança. Dados bancários diferentes marcam o fornecedor como "alterado" e a conta com o alerta de confirmar por segundo canal antes do lote. Comprovante não vira conta: fica guardado com a conta certa. Descartar exige motivo (nada se apaga). Anexar ao pedido da fila completa "boleto ou nota" e "valor" e o SLA começa.
- **Por quê:** 10, 3.5 descreve captura, leitura e checagem, mas não a caixa de entrada; o golpe mais comum é a troca de conta do fornecedor (10, 3.13). Tabela própria porque o documento tem ciclo de vida (chegou, lido, lançado, anexado, descartado) e trilha.
- **Telas e ações:** S08-A14, A16; S08-T03.
- **Impacto no plano:** 10, 3.12 ganha a entidade "Documento recebido do BPO" (proposta).
- **Arquivos compartilhados:** `entidades.ts` (interface nova, linha em `Tabelas` e em `nomesTabelas`, no fim); `ferramentas.ts` (bloco S08b com `documento_bpo.receber`, `conta_pagar.ler_documento`, `documento_bpo.descartar`, `fila.comentar`, `fila.cobrar`, `conta_receber.cobrar`, `erp.lancar`, `erp.baixar`, `extrato.buscar`, `bpo.fechamento.executar`, `bpo.fechamento.reabrir`); migração nova `20261115120000_s08b_bpo_documento.sql` (não aplicada: pede autorização do dono, como a da S08).
- **Situação:** proposta.

#### 2026-11-15 · S08b · Bola parada e ordem por risco

- **Decisão:** bola fora do BPO há 24 h ou mais é "bola parada" (selo no item, atalho no resumo, cobrança pelo integrante, anotada no item). A ordem "por risco" do integrante soma: prazo estourado 50, vence hoje 30, amanhã 15; pagamento 12; valor até 10; prazo legal em um dia 25; empresa vermelha 12, amarela 5; bola parada 8; pedido incompleto 4. Cada item mostra o motivo do risco.
- **Por quê:** BPO-010 diz que a IA "ordena por risco e avisa bola parada" sem dizer como **[sem regra no plano]**; números como hipótese da sessão.
- **Telas e ações:** S08-A13, A15.
- **Impacto no plano:** nenhum (pesos a validar no piloto).
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-15 · S08b · Membro abre a fila em "só as minhas"; pedido da equipe sem completude do cliente

- **Decisão:** quem não reatribui (Membro) abre a fila com "só as minhas" ligado (guardado por pessoa); o Gestor abre com tudo. Pedido com o canal "da equipe" entra completo (a completude do BPO-009 é do pedido do cliente), com a visibilidade "interna do BPO" e quem pediu.
- **Por quê:** 10, 5.4: o Colaborador "executa as suas"; o mapa pede pedidos dos clientes e da equipe.
- **Telas e ações:** S08-A13, A14.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-15 · S08b · Rotinas por seções da operação

- **Decisão:** sem empresa escolhida, as Rotinas mostram a carteira por exceção (checklist do dia, o que falta conferir, extrato, lançar no ERP, a receber em atraso e o mês aberto ou fechado, com atalho para a seção). Com uma empresa, seis seções: Hoje (checklist em três colunas e o calendário único, com a seta que leva aonde cada rotina se faz pelo código da atividade), Contas a pagar, A receber, Conciliação, Lançamentos no ERP e Fechamento. O integrante do cabeçalho muda com a seção (Contas a Pagar, Contas a Receber, Conciliação, Gerencial). No celular, as seções viram uma lista de escolha.
- **Por quê:** 10, 3.1 e 3.2 descrevem a operação do dia; o mapa não diz como dividir a tela **[sem regra no plano]**.
- **Telas e ações:** S08-A18 a A21.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-15 · S08b · Baixa no ERP por modo e extrato do Open Finance simulado

- **Decisão:** conciliar no modo API (E1) manda a baixa ao ERP por comando (`erp.baixar`, evento "enviada e relida"); desfazer registra o estorno no ERP. No modo arquivo (E2) a linha conciliada vai para "Lançar no ERP" e a pessoa marca "Lancei no Nibo": a baixa manual conta no SLA com a marca "manual"; conta lançada na plataforma também espera ali. Quando não sobra nada para lançar, a pendência "lançar baixas" da fila se resolve sozinha, com evento. No livro próprio (E3) não há o que levar. "Buscar o extrato agora" chama o serviço de Open Finance da demonstração (latência e falha simulada) e grava linhas de exemplo por empresa, marcadas como demonstração.
- **Por quê:** 10, 3.0 (fonte da verdade e modo arquivo); o serviço de Open Finance das Fundações devolve um extrato genérico.
- **Telas e ações:** S08-A19, S08-T04.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** nenhum (o serviço é só chamado).
- **Situação:** proposta.

#### 2026-11-15 · S08b · Fechamento do mês nas Rotinas, com o rascunho do Gerencial

- **Decisão:** a seção Fechamento trata a competência de outubro (em 18/11): antes de fechar, extrato do mês conciliado, baixas do mês no ERP, contas do mês conferidas, rascunho do Gerencial e revisão do Gestor (mesma regra na tela e no repositório). O Gerencial rascunha a DRE gerencial, caixa, pagamentos, atrasos, pendências com o cliente e riscos (gravado na entrega "relatorio" da competência, com a marca `rascunho` que a aba Entregas já lê); o Gestor revisa e pode reescrever o texto; fechar é do Gestor do BPO e grava a entrega "fechamento" (a mesma que Entregas mostra) com o evento `bpo.mes_fechado` ao Contábil quando a empresa tem contabilidade; reabrir só o Administrador, com motivo. Enviar o relatório ao cliente continua em Entregas.
- **Por quê:** 10, 3.10 (fechamento só com conciliação sem pendência e relatório aprovado; reabrir exige Administrador e motivo). A divisão com Entregas evita duas portas para o mesmo envio.
- **Telas e ações:** S08-A18, A28 (só leitura compartilhada); S08-T04.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** nenhum (usa `repos.bpo.entregas`).
- **Situação:** proposta.

#### 2026-11-15 · S08b · Datas da operação no dia da demonstração

- **Decisão:** o que a operação grava (chegada de documento, anotação, conciliação, baixa manual, rascunho, revisão, fechamento) leva o dia 18/11 com a hora do relógio, como a S08 decidiu para o BPO; os eventos gravados pelo relógio da máquina aparecem no histórico e na "bola parada" levados a 18/11.
- **Por quê:** sem isso, a bola passada agora pareceria parada há dias e o histórico mostraria a data da máquina.
- **Telas e ações:** S08-T03, S08-T04.
- **Impacto no plano:** nenhum (só desenho).
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-15 · S08b · Pequenas mudanças em arquivos comuns, só acrescentando

- **Decisão:** `ModuloBpo.tsx` ganhou uma linha que monta o trabalho dos integrantes da operação (`useEfeitosOperacaoBpo`, com chave própria `s08b:efeitos`, sem tocar no `integrantes.ts` da S08); `semente/andrade.ts`, uma linha (`sementeS08b`), com a semente tardia para banco já guardado; `PainelLab.tsx`, uma linha com a seção "Operação do BPO (S08b)" (boleto chegando pelo WhatsApp e boleto com os dados bancários trocados).
- **Por quê:** regra das sessões de BPO (só acrescentar nos comuns).
- **Telas e ações:** S08-T03, S08-T04.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** os três citados, uma linha cada.
- **Situação:** proposta.

### S08d · BPO: gestão (Entregas, Volume, Rentabilidade), entre escritórios e app

#### 2026-11-15 · S08d · Integrantes do grupo num arquivo próprio, montado por uma linha no módulo

- **Decisão:** o trabalho simulado dos integrantes nas telas da S08d (redistribuição sugerida pelo Gerencial, rascunho do relatório do contratante pelo Atendimento, cobrança da bola parada) mora em `src/telas/bpo/efeitos-s08d.ts`, com a chave própria `s08d:efeitos`, no mesmo mecanismo do `integrantes.ts`. O hook `useEfeitosS08d()` é montado no `ModuloBpo.tsx` por uma linha acrescentada (e um import), com o comentário "S08d".
- **Por quê:** quatro sessões do BPO em paralelo; acrescentar tipos ao `switch` comum do `integrantes.ts` geraria conflito certo.
- **Telas e ações:** S08-A32, S08-T09 (Entregas e Visão do contratante).
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** `src/telas/bpo/ModuloBpo.tsx` (duas linhas acrescentadas, nada mudado).
- **Situação:** proposta.

#### 2026-11-15 · S08d · Relatório do mês como folha revisada pelo Gestor, com recibo

- **Decisão:** o relatório da empresa (e o do contratante) abre como folha com a marca de quem envia: o da empresa com a do escritório; o do contratante com a dele, nunca a do BPO. O Gerencial (ou o Atendimento, no C2) rascunha; o Gestor revisa o resumo, guarda o rascunho ou fecha e envia. Enviado, a folha mostra o recibo (hash, versão e cada entrega). "Fechar e enviar" direto na lista continua valendo para quem já revisou. O resumo revisado vai junto do documento e aparece no app.
- **Por quê:** 10, 7.4 e 6.2 (FIN-006 é P: rascunha; BPO-012 é S, mas nada sai ao cliente sem uma pessoa no início, mapa 0.7).
- **Telas e ações:** S08-A28, S08-A44, S08-A52.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-15 · S08d · Crédito de SLA: 1% do honorário por ponto abaixo da meta, até 10%, só com desvio do BPO

- **Decisão:** o fechamento do SLA (BPO-011) é revisado pelo Gestor do BPO, que classifica cada desvio como do BPO ou do cliente. Com o SLA abaixo da meta e ao menos um desvio do BPO, o crédito do contrato é 1% do honorário do BPO por ponto abaixo da meta, no máximo 10%. Desvio do cliente não gera crédito. Fechado, o Financeiro recebe o aviso do desconto na próxima fatura (lançar o desconto é tela do Financeiro, S07). Multa não entra no wireframe.
- **Por quê:** 10, 4.3 manda aplicar "créditos e multas do contrato", revisado por pessoa, sem dizer a regra; o valor é hipótese da sessão, a validar no contrato modelo.
- **Telas e ações:** S08-A29.
- **Impacto no plano:** 10, 3.14 e 4.3 (regra de crédito a validar).
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-15 · S08d · Auditoria de qualidade: amostra de três contas; divergência vira item na fila

- **Decisão:** uma pessoa sorteia três contas do mês (documento, valor, conferência e aprovação) e marca cada uma como OK ou divergência, com motivo. A divergência vira item da fila (`BPO-013`, interno, prazo de dois dias) para o analista da empresa. As últimas cinco amostras ficam no histórico (`s08d:qualidade`).
- **Por quê:** BPO-013 é P (o integrante confere por regra e sorteia; pessoa revisa); o tamanho da amostra não está no plano.
- **Telas e ações:** S08-A29.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-15 · S08d · Extrato de volume enviado ao cliente com três dias úteis para contestar

- **Decisão:** o Gestor envia o extrato do mês ao app da empresa; o cliente tem três dias úteis para contestar (no "hoje" do BPO, de 18/11 a 23/11), pelo app (Fluxo de caixa › Extrato do BPO do mês). A contestação traz item, quantidade e motivo quando registrada pela equipe ou pelo portal; pelo app, só o motivo (o escritório quantifica ao decidir). Aceitar vira glosa; recusar exige motivo, que o cliente vê. Quem decide é o Gestor do BPO.
- **Por quê:** 10, 7.2 diz que a empresa vê o extrato antes da fatura; a tabela 5.4 diz "só a fatura" para o cliente do BPO. A sessão seguiu o 7.2 (ver antes de pagar) e manteve a fatura no Financeiro do app (S10). O prazo é hipótese da sessão.
- **Telas e ações:** S08-A30, S08-A52.
- **Impacto no plano:** 10, 5.4 (linha "Volume e faturamento" do cliente) e 7.2 (prazo a validar).
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-15 · S08d · Excedente vira serviço avulso do Financeiro; aditivo de faixa é proposta ao Financeiro

- **Decisão:** "Lançar o extra" cria um `servico_avulso` (entidade da S07) com origem `faixa`, situação `a_faturar` e o ok de quem lançou em `aceite_ref`; ele aparece em Financeiro › Contratos (avulsos) e entra na próxima fatura única, numa linha própria. Desfazer cancela o avulso e volta o volume. "Propor aditivo de faixa" (`faixa.estourar`) marca o volume e avisa o Financeiro; o contrato muda lá. Volume do contratante segue só marcado como faturado: o contratante não está no cadastro de clientes do Financeiro no wireframe.
- **Por quê:** 10, 7.3: o BPO usa as estruturas do 09 e não cria motor novo.
- **Telas e ações:** S08-A31.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** nenhum (só usa `repos.servicosAvulsos`).
- **Situação:** proposta.

#### 2026-11-15 · S08d · O que o BPO conta na assinatura da plataforma

- **Decisão:** em Volume, o Administrador vê o que o escritório paga à plataforma pelo BPO, com os valores de teste do 10, 9.1: pacote BPO Financeiro, R$ 390 + R$ 65 por empresa incluída (conta a partir do paralelo; em implantação ainda não conta); modo BPO, R$ 490 + R$ 120 por contratante; os clientes finais somam na faixa de clientes; convidados sem preço por usuário (teto de abuso, não cobrança). Atalho para Configurações › Assinatura.
- **Por quê:** "faturar por inclusão de empresa e por contratante" é o que o 9.1 descreve; o momento em que a empresa passa a contar não está no plano (hipótese da sessão).
- **Telas e ações:** S08-T06 (Volume), S08-T09.
- **Impacto no plano:** 10, 9.1 (início da contagem a validar).
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-15 · S08d · Rentabilidade: custos variáveis, base faturado ou recebido, capacidade e redistribuição

- **Decisão:** margem = honorário − horas × custo-hora − custos variáveis (R$ 9 do pacote por empresa, R$ 3 do conector de ERP e R$ 1 por conta no Open Finance, o custo provável do 10, 9.2), sobre o faturado ou sobre o recebido (recebido quando a fatura de novembro está paga). Capacidade de cada pessoa no mês, editável pelo Gestor (`s08d:capacidade`). Carga das quatro semanas: fila 1 h por item no prazo; rotina diária 6 min por dia útil, semanal 15 min, mensal 1 h na semana do dia; no C2, folha (dia 5), DCTFWeb e EFD-Reinf (dia 15) e Simples (dia 20) por empresa do departamento. O Gerencial sugere a redistribuição (BPO-016, P) e só o Gestor aplica. Horas poupadas (GES-056) em série separada: captura 6 min, conciliação por regra 2 min (60% das conciliações do mês casam por regra), rascunho do relatório 45 min. Margem por departamento do contratante: honorário pelas empresas do departamento; custo metade pela carteira e metade pela fila dele.
- **Por quê:** 10, 7.4 e BPO-016; as durações e os pesos são hipóteses da sessão (o plano manda calibrar pelo Timesheet).
- **Telas e ações:** S08-A32.
- **Impacto no plano:** 10, 7.4 (premissas de carga a calibrar).
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-15 · S08d · Contratante entra e sai em passos; nunca se apaga

- **Decisão:** "Novo contratante" (Administrador) cria o subinquilino em "entrada" com sete passos: contrato (BPO-003), acordo LGPD e suboperadores (BPO-004), empresas importadas (carteira em bloco, BPO-017, colando da planilha: nome; CNPJ; regime), credenciais pedidas, pendências levantadas (SOC-022), responsável técnico convidado e um mês em paralelo. Importar e convidar o RT marcam os passos sozinhos. Só ativa com todos. "Encerrar contratante" pede o motivo e abre a saída em seis passos (BPO-019); concluir revoga os convidados e arquiva o contratante (fica no histórico). Novo contratante mostra SLA e margem como "—" até ter histórico.
- **Por quê:** 10, 4.6 lista o que a carteira em bloco e o encerramento fazem, sem a ordem; a ordem é da sessão.
- **Telas e ações:** S08-A39, S08-A43, S08-T09.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-15 · S08d · Revisão do responsável técnico com estado próprio; transmitir bloqueado sem o "pode transmitir"

- **Decisão:** o item de revisão guarda o estado em `extras.revisao` (preparando, com o RT, ajuste pedido, aprovada), com o resumo do que mudou e o hash da entrega. "Mandar ao RT" passa a bola ao contratante; o RT aprova ou pede ajuste (comentário obrigatório) no portal; ajuste volta como "Ajustar e reenviar ao RT". Na transferência parcial, "Transmitir e concluir" só libera com a revisão aprovada. Corrige o comportamento anterior, em que "pedir ajuste" devolvia a bola e já liberava a transmissão. Um pedido novo pode nascer marcado como "precisa da revisão do RT".
- **Por quê:** 10, 4.4 (NBC PG 01, item 5 c; BPO-005).
- **Telas e ações:** S08-A44, S08-T05 (frente E), S08-T09.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-15 · S08d · Conversa BPO e contratante, primeiro acesso, procedimentos e trilha por contratante

- **Decisão:** (1) uma conversa por contratante (BPO-022), vista pela equipe na Visão do contratante e pelo convidado no portal, guardada em `s08d:conversa:<contratante>`; o cliente final não vê. Simplificação: o plano põe a conversa na tarefa. (2) Convidado com convite pendente cai no primeiro acesso do portal e aceita (passa a ativo). (3) Convidado manda o que falta e devolve a bola pela ferramenta exposta `fila.responder`. (4) Procedimentos do contratante (BPO-021) em `extras.procedimentos`, editáveis em linha. (5) Registro de operações (LGPD, BPO-004 e BPO-020): a trilha dos eventos que citam o contratante. (6) Teto de convidados editado em linha (antes gravava a cada tecla), convite reenviável e convidado reativável.
- **Por quê:** 10, 4.1.1, 4.2, 4.5 e 4.6; o formato de cada um é da sessão.
- **Telas e ações:** S08-A44, S08-A45, S08-T09.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-15 · S08d · App do cliente: escalonamento, vencidas, baixas e saldo atualizado sem gravar

- **Decisão:** no cartão do lote, "Se ninguém responder" mostra o escalonamento com os horários da empresa (janela, lembrete, substituto ou "sem substituto", véspera ao Gestor e ao sócio, vencida só alerta, expiração). Conta vencida sem aprovação aparece como alerta no topo das Aprovações (B3). Lotes decididos vão para "Decididos". Depois de liberado (M1) ou agendado (M2), cada conta mostra a baixa no extrato. Em Fluxo de caixa, "Atualizar" lê o saldo pelo serviço simulado de bancos (com selo de demonstração e estado de erro com "Tentar de novo") sem gravar: conectar banco não é ferramenta exposta ao cliente. O relatório do BPO abre em Documentos e a proposta de alçada mostra os valores de hoje riscados.
- **Por quê:** 10, 3.6 e 14; 06, ad. 19 e 20. Contrato C10 mantido: `AprovacoesApp`, `CaixaApp`, `PropostaAlcadaApp` e `useLotesAbertos` com os mesmos pontos de uso.
- **Telas e ações:** S08-A47 a A52.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-15 · S08d · Sem migração nova

- **Decisão:** tudo o que a S08d acrescentou cabe nas colunas que já existem (`extras` das tabelas do BPO, `registro_tela` e `servico_avulso` da S07); nenhuma migração nova. A migração da S08 (`20261114180000_s08_bpo.sql`) continua pendente de aplicação no projeto Supabase: esta sessão não tem permissão de leitura no projeto para conferir.
- **Por quê:** ARQUITETURA, 9: esquema novo só com migração nova e aplicar pede o dono.
- **Telas e ações:** S08-T06, T09, T10.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

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

#### 2026-11-15 · S09 · Armazenamento com qualquer provedor e servidor local com agente (S09b)

- **Decisão:** Configurações › Armazenamento aceita Google Drive, OneDrive/SharePoint, **Dropbox**, **Box**, **servidor local (agente Heild)**, S3, WebDAV, SFTP e o armazenamento da plataforma. Dropbox e Box autorizam pela mesma janela simulada do Google e da Microsoft. Google com conta Workspace mostra o passo a passo para o administrador liberar a Heild em Controles de API, e a autorização é recusada até ele liberar. O servidor local pareia por um código de 8 caracteres (vale 15 minutos, uma vez só), mostra o estado do agente (online ou offline, versão, última sincronização, arquivos), as pastas compartilhadas e o botão de revogar o dispositivo; o agente só abre conexão de saída. Uma faixa no topo diz que os arquivos ficam no armazenamento do escritório e que a Heild guarda só o índice e o texto. O Raio-X lê qualquer armazenamento conectado (escolha "Onde ler").
- **Por quê:** pedido do Enzo, repassado pela coordenação ("não deve funcionar só o Drive"; um escritório do piloto usa servidor local).
- **Telas e ações:** S09-T08 (S09-A55, A56), S09-T09 (C9 ganha `dropbox`, `box`, `servidor_local`), S09-T14 (S09-A96).
- **Impacto no plano:** 01, 7.1 (lista de backends ganha Dropbox, Box e o agente local); 08, 7.8.
- **Arquivos compartilhados:** `servicos/documentos.ts` (parâmetro opcional `provedor` em `listar` e `enviar`, sem mudar quem já chama), `servicos/index.ts` (serviço `nuvens`), `Plataforma.tsx` (Armazenamento sai da condição de dados fixos: agora tem padrão por escritório, e o Horizonte é o piloto com servidor local).
- **Dados:** pelo núcleo, sem migração: conectores de armazenamento em `cfg.arm.conectores` e agentes em `s09:arm:agentes` (`registro_tela`), que valem no modo local e no Supabase. Nada aplicado no HEILD-PROD (combinado com a coordenação).
- **Situação:** proposta.

### S10 · App do cliente

#### 2026-11-14 · S10 · Estado do app no `registro_tela`, sem migração nova

- **Decisão:** o que só o app guarda (acesso e forma de entrar, sessões, preferências de aviso, central do app, recibos, links para terceiros, assinaturas pendentes, extras do pedido, reuniões, Pix Automático, termo do certificado, saída do escritório) fica em `usePersistente('s10:…')`, que grava na tabela `registro_tela` nos dois modos (local e Supabase). O que o escritório vê e age continua nas entidades pela loja: tarefa (pedido e pendência), conversa e mensagem, documento e registro de entrega, notificação, evento, ficha do cliente.
- **Por quê:** nenhuma entidade nova sem necessidade; funciona no Supabase sem migração. Hipótese da sessão; o backend pode abrir em tabelas (Conta de cliente, Preferência, Credencial, Registro de entrega com `enviado_*` e `confirmado_pelo_cliente`).
- **Telas e ações:** S10-T01 a T11.
- **Impacto no plano:** nenhum (simplificação do wireframe).
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-14 · S10 · Ferramenta `pedido.cancelar` exposta ao cliente

- **Decisão:** o cliente cancela o pedido que ninguém começou (06, 4.3, regra 5) pela ferramenta nova `pedido.cancelar` (exposta ao cliente); conferida a permissão, o sistema executa o cancelamento da tarefa com o motivo. A loja do escritório esconde tarefa cancelada; o app lê os pedidos direto do repositório para mostrar "cancelado, com o motivo".
- **Por quê:** `tarefa.cancelar` não é exposta ao cliente (e não deve ser).
- **Telas e ações:** S10-A31.
- **Impacto no plano:** 01, catálogo de ferramentas ganha `pedido.cancelar`.
- **Arquivos compartilhados:** `src/nucleo/permissoes/ferramentas.ts` (só acrescentar). O aceite do convite grava a ficha como sistema (`conta.convite.aceitar`), pelo mesmo motivo.
- **Situação:** proposta.

#### 2026-11-14 · S10 · Cartões `s10-*` e o efeito ao aprovar

- **Decisão:** o que sai ao cliente nasce agentificado e passa por cartão no chat do integrante: simulado de rescisão (DP, C2-02), declaração de faturamento assinada pelo contador (Contábil, C2-14 com D-16), termo de ciência (DP, C2-06), reenvio por outro canal do farol de abertura (Atendimento, D-17) e resposta factual na conversa (Atendimento, 06, 7.2). O efeito de cada um está em `src/cliente/motor.ts` e é chamado por uma linha em `efeitos.tsx` para os ids com prefixo `s10-`.
- **Por quê:** "nada sai ao cliente sem aprovação humana no início" (mapa, 0.7).
- **Telas e ações:** S10-A28, A33, A35; C2-02, C2-06, C2-14, D-16, D-17.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** `src/ambiente/efeitos.tsx` (uma linha e um import, ao lado da linha da S04).
- **Situação:** proposta.

#### 2026-11-14 · S10 · Lacunas que o plano não fecha, decididas pela sessão

- **Decisão:** (1) na demonstração, o código de acesso aparece numa mensagem simulada do WhatsApp; qualquer código de 6 dígitos entra e `000000` simula o código errado (5 tentativas, depois bloqueio de 15 min com aviso ao escritório). (2) O cartão de push só aparece depois do primeiro toque e no fim do Início (não desloca o que está sob o dedo). (3) Grupo econômico de exemplo: Padaria e Café do João Batista. (4) Revisão anual de acessos aparece ao sócio em Empresa até ser respondida. (5) O sócio pede convite para outra pessoa como pedido ao escritório (GES-104), não convida direto: a conta é do escritório (06, 2.5). (6) Pausa parcial da fatura: contestar citando um serviço deixa essa linha "em espera". (7) Franquia do Consultor de 40 perguntas por mês no exemplo. (8) Domínio do app pela razão social (`app.contabilandrade.com.br`); textos do app (termo, "tudo em dia", fora do horário) vêm de um modelo com o nome do produto do tema, porque o `Tema` ainda não tem campos de app.
- **Por quê:** o mapa marca como sem regra ou não detalha; hipótese da sessão.
- **Telas e ações:** S10-A02, A07, A09, A47, A49, A59; S10-T01.
- **Impacto no plano:** sugestão ao 01, 10 (Tema): campos `textos_app` (termo, tudo em dia, fora do horário).
- **Arquivos compartilhados:** nenhum.
- **Situação:** proposta.

#### 2026-11-14 · S10 · Testes antigos do app que mudaram de comportamento

- **Decisão:** `scripts/app-cliente.cjs` e `scripts/servicos-app.cjs` (não editados, regra do `SESSOES.md`) falham em pontos que a S10 mudou de propósito: o envio da pendência agora abre a folha com foto, recorte e arquivos e o integrante confere antes do "recebido"; o pedido tem formulário por tipo com campos obrigatórios; NFS-e e Consultor respondem com latência simulada. A cobertura passou para `scripts/s10-app-cliente.cjs`.
- **Por quê:** mapa, S10-A20, A28, A58, A59.
- **Situação:** proposta (a coordenação decide se aposenta os dois scripts).

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

### UI Lab (branch `wf-ui-lab`)

#### 2026-11-15 · UI Lab · Uma primitiva de rolagem, com esmaecido sempre, e uma regra que barra o resto

- **Decisão:** toda área que rola passa por `AreaRolagem` (`components/ui/area-rolagem.tsx`, `eixo="y|x|ambos"`), que põe o esmaecido do topo e do fim (ou dos lados). Cabeçalho fixo dentro da área (`data-cabecalho-fixo`, o `thead` da `Tabela`) faz o esmaecido começar abaixo dele. `scripts/regra-rolagem.cjs` acusa qualquer `overflow-*-auto`/`overflow-scroll` fora da primitiva e roda no `npm run build`. O modal (`DialogContent`) tem altura máxima e rola por dentro; a gaveta tem `SheetCorpo`.
- **Por quê:** pedido do dono ("nenhum lugar do sistema deve ter scroll cortando de maneira dura"); a "Captura da carteira" cortava a primeira linha seca porque a `Tabela` rolava na própria `div`, sem esmaecido.
- **Telas e ações:** todas (90 rolagens migradas).
- **Impacto no plano:** nenhum (só desenho).
- **Arquivos compartilhados:** `index.css`, `lib/esmaecer-rolagem.ts`, `components/ui/{area-rolagem,dialog,sheet}.tsx`, `package.json` (build).
- **Situação:** proposta.

#### 2026-11-15 · UI Lab · Lista em colunas e selo que não invade o vizinho

- **Decisão:** lista que é tabela usa `ListaColunas`/`LinhaColunas`/`Celula` (uma grade para cabeçalho e linhas; selo, valor e ação com o tamanho do conteúdo; texto truncado; no estreito, colunas `largo` somem e `abaixo` descem). Coluna de valor feita à mão: `minmax(Nrem,max-content)` ou `min-w-NN`. `Badge` nunca passa do contêiner (trunca, com o texto inteiro no `title`).
- **Por quê:** a tag "aguard. cliente (2 d)" subia sobre "manual · 2 d" na lista de Tarefas (trilha de 7rem com conteúdo de ~190px e `justify-end`); o mesmo padrão em Contratos, Visão do Financeiro e valores com centavos no BPO.
- **Telas e ações:** S04-T03 (lista de tarefas), Financeiro, BPO, app do cliente.
- **Impacto no plano:** nenhum (só desenho).
- **Arquivos compartilhados:** `components/kit/linha-colunas.tsx` (novo), `components/ui/badge.tsx`, `index.css`.
- **Situação:** proposta.

#### 2026-11-15 · UI Lab · Cenários de dados para ver os widgets reais em todos os estados

- **Decisão:** o UI Lab (`#/lab/ui`) abre o escritório em memória (nunca toca nos dados do navegador) e, com `cenario=`, semeia um escritório `esc-cenario:<nome>` a partir da fotografia do Andrade transformada (`nucleo/semente/cenario.ts`): 0, 1, 3, 15, 50 ou 200 itens nas listas (por cliente e setor, só nos grupos que as telas mostram), texto curto/longo/sem espaço, valores extremos, datas vencidas/hoje/futuras, opcionais ausentes e os estados do domínio misturados (lidos de `entidades.ts`). As fontes fixas (`painel-s03`, `painel`, `painel-abas`) passam por `comCenarioPor`, que fora do Lab devolve o mesmo dado. Serviços falhando e "ver como" sem acesso entram como estados.
- **Por quê:** pedido do dono ("como ficaria o card Documentos da aba com 15? com 50? com 0?"); o widget real é alimentado pelo cenário, sem cópia.
- **Telas e ações:** os 142 widgets do Início e do Painel (cliente e carteira).
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** `nucleo/banco/{index,navegador}.ts` (memória no Lab, com limite), `nucleo/react.tsx` (`escritorioFixo`), `nucleo/semente/index.ts`, `App.tsx`, as três fontes de `src/dados` (só o embrulho na função exportada).
- **Situação:** proposta.

#### 2026-11-15 · UI Lab · Contrato de transbordo no próprio widget

- **Decisão:** passou do teto do tamanho, o corpo do widget rola com o esmaecido e o rodapé oferece "Ver tudo (N)", que abre o conteúdo inteiro do widget numa gaveta (no tamanho XL); N é a maior lista do corpo. Lista que precisa de teto por quantidade usa `ListaComTeto` (teto P 3, M 5, G 8, L 5, XL 12; "Ver todos (N)"; virtualização acima de 150 na gaveta).
- **Por quê:** "nada pode crescer sem limite nem cortar seco"; vale para todo widget de uma vez, sem regra por tela.
- **Telas e ações:** todos os widgets.
- **Impacto no plano:** nenhum (só desenho).
- **Arquivos compartilhados:** `components/widgets/widget.tsx`, `components/kit/lista-com-teto.tsx` (novo).
- **Situação:** proposta.

#### 2026-11-15 · UI Lab · Texto de estado e contraste garantido no tema

- **Decisão:** o tema mapeia os tokens de texto de estado do design system (`erro-texto`, `sucesso-texto`, `atencao-texto`, `destaque-texto` → `text-destructive-text`, `text-success-text`, `text-warning-text`, `text-highlight-text`); a cor de estado cheia fica para ícone e preenchimento. Nos temas de escritório sem esses valores, e no texto suave derivado, o provider leva a cor na direção do texto até 4,5:1 em todas as camadas (`comContraste`). O texto sobre a primária escolhe o maior contraste WCAG. Selo de estado: texto em `texto` e ícone na cor do estado (cores.md), inclusive o de erro. Nada abaixo de 12px fora da hora (277 `text-[11px]` e 26 `text-[10px]` passaram a 12px; o `Contador` também).
- **Por quê:** o QA mediu milhares de textos abaixo do AA, quase todos por essas raízes (temas Horizonte e Verde Campo, selo vermelho sobre vermelho).
- **Telas e ações:** todas.
- **Impacto no plano:** nenhum (aplica o design system).
- **Arquivos compartilhados:** `theme/{tipos,temas,variaveis}.ts`, `index.css`, `components/ui/badge.tsx`.
- **Situação:** proposta.

#### 2026-11-15 · UI Lab · Quebra de palavra, título automático e linhas que quebram

- **Decisão:** a base põe `overflow-wrap: anywhere` no corpo (na tabela, `break-word`). Texto truncado ganha o texto inteiro como título ao apontar (`lib/titulo-automatico.ts`). Em linha `flex-wrap`, o texto é `grow basis-40`, não `flex-1` (83 lugares).
- **Por quê:** palavra sem espaço vazava de modais e gavetas; centenas de textos truncavam sem título; `flex-1` (base 0) espremia o texto numa coluna enquanto os botões ficavam inteiros (as "Pendências do setor" do print do dono).
- **Telas e ações:** todas.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** `index.css`, `main.tsx`.
- **Situação:** proposta.

#### 2026-11-15 · UI Lab · Ações numa forma só; avisos acima do campo de escrever

- **Decisão:** o widget Ações vira uma lista de linhas (ícone, verbo e objeto, contagem na carteira e o nível como selo; o que falta vira selo de atenção) (QA_INTERFACE.md, X-4). Avisos e botão Chat sobem a altura do campo de escrever (`--desvio-campo`, medido por ResizeObserver e removido ao desmontar); no celular, só o aviso mais novo (proposta aprovada da UI-1).
- **Por quê:** três formas de botão no mesmo widget; o botão Chat e os avisos cobriam o campo do CRM › Conversas.
- **Telas e ações:** todas as abas do Painel; S05-T01.
- **Impacto no plano:** nenhum (só desenho).
- **Arquivos compartilhados:** `components/compostos/painel-aba.tsx`, `ambiente/interface.tsx`, `telas/ModuloTela.tsx`, `lib/desvio-campo.ts` (novo).
- **Situação:** proposta (a das Ações); aceita pela coordenação (a dos avisos).

#### 2026-11-15 · UI Lab · Scripts antigos apagados

- **Decisão:** saem `app-cliente`, `bpo-cenarios`, `bpo-modulo`, `decisoes-8-11` e `servicos-app` (de 08/11, com endereço fixo e o painel da demonstração antigo; falham no começo também no wireframe puro). O que testavam está na suíte: app do cliente no s10; BPO, abas, alçadas e só-BPO nos s08 e s08a a s08d; NFS-e e cancelamento no s07; diagnóstico no s09. O selo de titular do BPO não tem teste próprio: aparece no Lab e no QA das telas. O `qa-interface.cjs` fica (roda em ~2 min; print da página inteira só com `QA_ALTO=1`).
- **Por quê:** pedido da coordenação (triagem na fase 5).
- **Telas e ações:** nenhuma.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** nenhum.
- **Situação:** aceita pela coordenação.

#### 2026-11-15 · UI Lab · Estados de dados e estado vazio iguais em todos os widgets

- **Decisão:** a caixa do widget desenha os estados de dados no lugar do conteúdo, pelo `ContextoEstadoWidget`: carregando (esqueleto), erro ("Não deu para carregar" com "Tentar de novo") e sem acesso ("Pedir acesso"); em P, M e L (uma célula de altura), só o título do estado e a ação; em G e XL, com ícone e explicação. O vazio é um só, `VazioWidget`, centrado, com o porquê ou o que vem a seguir e, quando existe, o botão da próxima ação (Documentos da aba vazio leva a Arquivos). O `Vazio` dos blocos S03 e os vazios improvisados passaram a ser ele.
- **Por quê:** pedido do dono (cenários de carregando, erro e sem permissão; estado vazio com a próxima ação); antes, cada widget inventava o seu ou não tinha.
- **Telas e ações:** todos os widgets do Início e do Painel.
- **Impacto no plano:** nenhum (só desenho).
- **Arquivos compartilhados:** `components/widgets/widget.tsx`, `telas/painel/s03/pecas.tsx`, `lab/widgets.tsx`.
- **Situação:** proposta.

#### 2026-11-15 · UI Lab · Pendências e Documentos da carteira juntam todos os clientes

- **Decisão:** na versão carteira de cada aba, "Pendências do setor" lista as tarefas aguardando cliente de todos os clientes do setor e "Documentos da aba" lista os documentos do setor de todos os clientes, com o nome do cliente em cada linha; "Cobrar" usa o cliente da pendência.
- **Por quê:** o QA de cenários mostrou que os dois widgets eram sempre vazios na carteira (o código devolvia lista vazia sem cliente), mesmo com clientes esperando.
- **Telas e ações:** S02/S03 (abas do Painel na carteira).
- **Impacto no plano:** nenhum (a carteira é a união das listas por cliente que já existem).
- **Arquivos compartilhados:** `dados/painel.ts` (`PendenciaSetor.cliente`), `telas/painel/{comuns,documentos-aba}.tsx`, `components/compostos/painel-aba.tsx`.
- **Situação:** proposta.

#### 2026-11-15 · UI Lab · Raios só por token

- **Decisão:** os 284 raios em pixel solto viraram o token de `forma.md` mais próximo (6 a 10px `sm`; 12 e 14 `md`; 16 e 18 `lg`; 20 e 22 `cartao`; 24 a 28 `campo`; 34 `painel`); `scripts/regra-raios.cjs` barra raio solto novo no build. Fica fixa só a moldura do aparelho no app do cliente (desenho do hardware).
- **Por quê:** proposta 1 de `PROPOSTAS_DESIGN_SYSTEM.md` (decidir o mapa no Lab); com raio solto, o `raio_borda` do tema de escritório mudava só parte dos cantos.
- **Telas e ações:** todas.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** `package.json` (build), quase todo `src/`.
- **Situação:** proposta (o mapa); a regra no `forma.md` segue como proposta ao design system.

#### 2026-11-15 · UI Lab · Avisos nunca cobrem a ação principal

- **Decisão:** `--desvio-campo` vira pilha (vale a maior altura entre os registrados; sai com o último) e é registrado também pelo rodapé da gaveta de formulário: os avisos sobem acima de Cancelar e da ação principal. O push simulado do app do cliente conta os 5 s pelo aviso mostrado, não pela lista.
- **Por quê:** a suíte achou um aviso sobre "Enviar contestação" (s06) e o push do app preso na tela para sempre quando a central mudava durante o aviso (s10).
- **Telas e ações:** toda gaveta de formulário; app do cliente.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** `lib/desvio-campo.ts`, `components/ui/formulario.tsx`, `cliente/avisos.tsx`.
- **Situação:** proposta.

#### 2026-11-15 · UI Lab · Texto nunca com opacidade; teto nas listas longas; grade de widgets densa

- **Decisão:** (1) registro inativo (desativado, revogado, cancelado, concluído, zerado) e etapa futura ficam no texto suave com os tons em cinza (`text-muted-foreground grayscale`), nunca com `opacity-*` no texto; `text-foreground/60-75` e `text-muted-foreground/60` saíram; a primária usada como texto é `text-primary-text` (garante 4,5:1 nos temas de escritório) e `text-warning-foreground` só sobre o amarelo. (2) Listas longas dentro do widget seguem o teto do tamanho com "Ver todos (N)" (`ListaComTeto`, `TetoDeFilhos`), e a lista publica o total (`data-total`) para o "Ver tudo (N)" do widget mostrar o número de verdade. (3) A grade de widgets empacota denso (um widget menor sobe para o buraco) e os arranjos padrão fecham as seis colunas de cada faixa. (4) Página de duas colunas com alturas diferentes: `items-start` onde o card esticava muito; coluna lateral presa ao topo (`sticky`) ou as duas como pilhas (`DuasPilhas`/`data-pilha`), sem esticar card para fechar vão.
- **Por quê:** o QA das telas reais achou 294 textos abaixo do AA, quase todos por opacidade ou token trocado, e cards esticados; o dos widgets, "Ver tudo (3)" com 200 itens e vão sob a coluna curta no XL.
- **Telas e ações:** todas.
- **Impacto no plano:** nenhum (só desenho).
- **Arquivos compartilhados:** `theme/variaveis.ts` (`--primary-text`, camadas da barra lateral e do fim do gradiente na garantia de contraste), `index.css`, `components/kit/{lista-com-teto,duas-pilhas}.tsx`, `components/widgets/{widget,grade}.tsx`, `telas/inicio/widgets-inicio.tsx` (arranjo do Membro).
- **Situação:** proposta.

#### 2026-11-15 · UI Lab · Fase 6 · Central de aprovações num painel lateral global

- **Decisão:** a central de cartões de aprovação é um painel lateral global, aberto pelo botão "Aprovações" (escudo, com contador) ao lado do sino no cabeçalho de toda tela; à direita no computador e em folha inteira no celular. Mostra tudo o que espera a decisão da pessoa, agrupado por setor (com "Aprovar os N" quando o setor tem mais de um) e filtrável por cliente (valor editável na frase "N cartões esperam você, de **todos os clientes**") e por setor. Cada cartão é o `CartaoAprovacao` do padrão novo: o argumento ligado à ação se corrige no lugar ("Aprovar com a correção" decide `editar_e_aprovar`, com a diferença registrada), Aprovar e Recusar, e um comentário curto e opcional ("Por quê? O integrante aprende com isso", oferecido ao recusar e em "Comentar" ao aprovar) que fica em `cartao_aprovacao.comentario` e vira lição nos aprendizados do integrante (`s04:integrantes:aprendizados`, os da Governança da IA e da ficha da tarefa; nos cartões S02, também a nota da memória `s02:memoria` e a frase do integrante no chat). Link profundo: `?aprovacoes=` em qualquer endereço (`todas`, `setor:fiscal`, `cliente:c1` ou o id do cartão em foco) e `abrirAprovacoes()` no código. O "Editar e aprovar" que sobrava no sino e no aviso da Home virou "Corrigir" (sem lápis), que abre a central focada no cartão.
- **Por quê:** os cartões nascem em qualquer tela (chat do integrante, abas do Painel, Financeiro, documentos, implantação), então a central não pode morar numa aba de um módulo; um item no Início só serviria a quem está no Início, e uma aba nova competiria com Assistente, Time e Visão geral. O sino já é a central de avisos e mistura tudo; aprovação pede espaço para ler os argumentos, corrigir e comentar, o que não cabe no popover. Recomendação da coordenação, decidida pela sessão.
- **Como funciona nos dois modos:** a central lê `cartao_aprovacao` pelo `useTabela` (pendentes que a pessoa pode decidir: lista `pode_aprovar` vazia vale para o Gestor do setor e o Administrador; com lista, o id ou nome da pessoa, `administrador` ou `gestor:<setor>`) e os cartões que ainda só existem no chat dos integrantes dela (os da demonstração); os lotes de pagamento do BPO ficam de fora, porque quem decide é o cliente no app. Decidir passa por `useEfeitosCartao`, o mesmo caminho do chat e do sino, então a ação executa igual em local, IndexedDB ou Supabase; o cartão só do chat ganha a linha no banco antes da decisão. O produtor dos cartões S02 passa a guardar os argumentos de exibição em `extras.argumentos_exibidos` (sem funções nem ícones); sem eles, a central deriva linhas só de leitura da ação (sem ids nem hashes) ou usa `extras.argumentos_tela` (Financeiro).
- **Telas e ações:** cabeçalho de todas as telas (botão Aprovações), sino (S01-T07), aviso do integrante na Home, chat do integrante (cartão de aprovação), UI Lab (ficha "Central de aprovações", estados vazio, poucos, muitos, foco, carregando e erro).
- **Impacto no plano:** 02, 9.3 e Fundações 6.4 ganham o lugar único para decidir fora do chat; nenhuma regra de decisão muda.
- **Arquivos compartilhados:** `ambiente/{efeitos,agente-s02,fluxos,interface,loja}.tsx|ts` (comentário na decisão, argumentos de exibição, `Destino.aprovacoes`, "Corrigir"), `nucleo/rotas.ts` (parâmetro `aprovacoes`), `components/compostos/{cartoes-chat,botoes-decisao,aviso-integrante}.tsx`, `telas/Plataforma.tsx`, `lab/fichas-edicao.tsx`; novos `ambiente/aprovacoes.tsx` e `ambiente/cartoes-aprovacao.ts`.
- **Situação:** proposta.

#### 2026-11-15 · UI Lab · Fase 6 · Texto suave dos temas: Heild em areia-700 (proposta 6) e piso de 4,5:1 nos temas de escritório (6b)

- **Decisão:** (1) o texto suave do claro da Heild (tema de fábrica) passa a areia-700 (#585552), aprovado pelo dono, com o mesmo valor do branch design-system. (2) Todo tema de escritório tem o texto suave levado a pelo menos 4,5:1 em todas as camadas (fundo, superfície, elevada, rebaixada, fim do fundo, barra lateral), também quando o tema define o próprio valor. Antes, o valor definido pelo tema passava sem conferência. A Heild fica de fora do ajuste automático porque o valor vem do design system já conferido; a lateral-fim dela não leva texto suave.
- **Por quê:** o QA tinha 46 achados de contraste. Os 45 do claro da Heild zeraram com o areia-700. O que sobrou era do tema Requinte. Por ser tema de escritório e não marca da Heild, o coordenador pediu a regra direto no app, sem passar pelo dono.
- **Telas e ações:** todas, no tema claro da Heild e nos temas de escritório.
- **Impacto no plano:** nenhum.
- **Arquivos compartilhados:** `theme/temas.ts` (areia-700 no claro da fábrica), `theme/variaveis.ts` (`comContraste` também sobre o `texto_suave` definido pelo tema).
- **Situação:** (1) aprovada; (2) decidida pelo coordenador.
