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
