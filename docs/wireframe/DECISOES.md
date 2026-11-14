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
