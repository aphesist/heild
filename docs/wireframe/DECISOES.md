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

### S06 · Timesheet

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
