# Status do wireframe

Situação da base comum e o que falta. Cada sessão registra a própria entrega em `docs/wireframe/entregas/SNN.md` (ver `SESSOES.md`); este arquivo fica com a visão do todo e a fundação.

## S00 · Fundação (branch `wf-s00-fundacao`) · 14/11/2026

### Feito

| Item | O que ficou pronto | Onde |
| --- | --- | --- |
| Camada de dados | Entidades do subplano 01 (escritório, assinatura, pessoa, identidade, usuário, vínculo de setor, exceção por tela, carteira, convite, setor, cliente, versão do perfil, obrigação, tarefa, lead, conversa, mensagem, documento, registro de entrega, evento, cartão de aprovação, notificação, integrante, mensagem de integrante, item de fila, conversa interna, participação, mensagem interna, estado de tela, nota emitida). Banco em memória com gravação no navegador; repositórios com criar, ler, atualizar, mover, reordenar, arquivar, excluir (onde a regra deixa), desfazer, sempre com permissão e evento | `app/src/nucleo/` |
| Regras dos planos | Nada se apaga sozinho; mensagem interna nunca se apaga e editar guarda versões; evento imutável; tarefa cancelada com motivo e, se de obrigação, só por Gestor; obrigação cancelada só por Gestor com motivo; decisão do cartão só por pessoa, com autor e data | `app/src/nucleo/repositorios/index.ts` |
| Persistência | localStorage por padrão (IndexedDB e memória como opções); dois escritórios de exemplo com dados separados; "Restaurar demonstração" e troca de escritório no painel Demonstração | `app/src/nucleo/banco/`, `app/src/nucleo/semente/` |
| Supabase | Adaptador pronto e desligado (`VITE_HEILD_BANCO=supabase`); migração SQL com uma tabela por entidade, RLS forçada por escritório do JWT e gatilhos de imutabilidade. **Nenhum projeto criado** | `app/supabase/`, `app/.env.exemplo` |
| Telas atuais | Todas continuam iguais, agora sobre o banco: a loja virou fachada (tarefas, conversas do CRM, documentos, avisos, eventos, decisões dos cartões, chat do time, trabalho dos integrantes, notas, estado de tela). Configurações › Escritório, Setores e Usuários gravam nas entidades; a tela de entrada e a sessão leem as contas do banco | `app/src/ambiente/loja.tsx`, `sessao.tsx`, `configuracoes.ts` |
| Serviços simulados | Interface + demonstração para IA/Assistente, transcrição, OCR, WhatsApp, e-mail, Integra Contador/e-CAC, SEFAZ, prefeituras, certidões, NFS-e, bancos, Pix, Open Finance, assinatura eletrônica, armazenamento, DJEN; resultado marcado `demonstracao` e selo na tela; falhas simuladas pelo painel | `app/src/servicos/` |
| Kit de interação | Edição em linha, formulário em modal com validação, arrastar e soltar (lista e quadro), confirmação com motivo, toast com desfazer, estados vazio/carregando/erro, menu de contexto, seleção múltipla com lote, permissão na tela, selo de demonstração | `app/src/components/kit/` |
| Permissões | Função única `autorizar` (ordem do 3.2) com catálogo de ferramentas; o que cada conta vê sai do mesmo perfil; papéis Administrador, Gestor e Membro; setores por pessoa; exceções por tela; "Ver como" (papel e setores de faz de conta) com faixa no topo | `app/src/nucleo/permissoes/`, `app/src/ambiente/ver-como.tsx` |
| Rotas | Endereço para módulo, aba, cliente, conversa, integrante, tarefa, ficha, fatura e pasta; `#/app` e `#/kit`; Voltar do navegador | `app/src/nucleo/rotas.ts` |
| Vitrine | `#/kit`: o kit e os serviços funcionando sobre o banco, com a conta escolhida | `app/src/telas/VitrineKit.tsx` |
| Documentação | Guia para as sessões | `docs/wireframe/ARQUITETURA.md` |

### Como testar

```bash
cd app
npm install
npm run typecheck && npm run build
npx vite --port 6100                         # em outro terminal
node scripts/fundacao-fumaca.cjs /tmp        # teste de fumaça (29 verificações)
```

O teste de fumaça entra, passa por todos os módulos, abre links diretos (conversa, ficha da tarefa), cria, edita, move e exclui pela vitrine e por Configurações › Escritório, recarrega e confere que persistiu, confere a trava de permissão de um Membro, a regra da mensagem interna, a troca para o segundo escritório e o "Restaurar demonstração".

Na mão: `npm run app`, entrar como qualquer conta, mexer em algo (concluir uma tarefa, mandar mensagem no CRM, editar o escritório), recarregar a página. Painel Demonstração (aba à direita): escritório de exemplo, ver como, serviços falhando, kit de interação, restaurar.

Comparação visual com o `wireframe` (mesmas telas, mesmo relógio): Painel, CRM, Arquivos, Timesheet, Financeiro, BPO, Configurações e Visão geral saem iguais; só muda a animação dos orbs.

### Testes antigos (`app/scripts/*.cjs`)

Rodados contra o branch novo e contra o `wireframe` original; resultado na seção "Regressão".

### Falta (para as sessões e para a coordenação)

- **Migrar as telas que ainda leem `src/dados`** para entidades: Financeiro (S07), Timesheet (S06), BPO (S08), Leads, Comunicados e Números do CRM (S05), Visão geral (S01), Armazenamento, Integrantes, Tema e Assinatura de Configurações (S09). Enquanto não migram, persistem pelo `usePersistente` e, no escritório Horizonte, mostram um aviso.
- **Mapeadores:** o `StatusTarefa` de tela ainda tem quatro estados; quando S04 ampliar (C3), tirar o achatamento em `tarefaParaTela`. Ficha do cliente (contatos) mora em `cliente.extras.ficha`: S02 pode levar para Pessoa, Identidade e Conta de cliente.
- **`extras`:** campos de tela ainda sem coluna própria (`atrasada` desenhado à mão, `prazoMin` do CRM...). Quem migra a tela troca por campo calculado ou coluna.
- **Supabase:** não validado contra um Postgres de verdade (não há projeto nem Postgres neste ambiente); o SQL segue o padrão do Supabase. Faltam as chaves estrangeiras compostas e a cadeia de hash dos eventos (ver `app/supabase/README.md`).
- **Serviços sem implementação ainda:** eSocial, EFD-Reinf, distribuição de DF-e, consulta CNPJ, calculadora da reforma, BCB, FGTS Digital, cores contábeis, ERPs de PME, extensão de navegador, push, DNS, cofre, importação (catálogo do mapa, 1.7). Seguem o padrão de `src/servicos`.
- **Build:** o pacote principal passa de 2 MB (aviso do Vite, já existia); dividir por módulo é trabalho da coordenação.

### Regressão

Todos os scripts de `app/scripts` rodados no branch (já com o `wireframe` de 14/11 mesclado) e comparados com o `wireframe` original:

| Script | Resultado |
| --- | --- |
| app-cliente, arquivos, bpo-admin, bpo-aprovacao-reforcada, bpo-cenarios, bpo-modulo, decisoes-8-11, decisoes-8-11-b, demonstracao-dinamica, escrita-simulada, espelho-orbs, financeiro-sete-abas, servicos-app, suporte, trabalho-simulado-assistente-crm, trabalho-simulado-ctb016, temas-escritorios | Todas as verificações passam |
| assistente-orquestra | 18 de 19; a que falha ("LC 123/2006, art. 18, § 5º-J") falha igual no `wireframe` original |
| espera | Passa; o erro no fim é da gravação de captura do próprio script, igual no original |
| estouro-horizontal, geometria-abas, orb-troca-de-aba, orbs-nivel-qualidade, padrao-visual, varrer, vaos | Medições sem verificação ok/falha ou que pedem o Storybook (porta 6099); não comparadas |
| fundacao-fumaca (novo) | 26 de 26 |

Durante a S00, cinco desses testes pegaram regressões reais da migração (chaves `bpo.*` do `usePersistente`, cenário trocado por Gestor, entrega registrada pelo app, rótulo "Resetar o ambiente", endereço antigo reaberto no modo estrito); todas corrigidas.

### Pull request

Aberto: https://github.com/aphesist/heild/pull/1 (de `wf-s00-fundacao` para `wireframe`; sem merge).

## S00b · Supabase ligado (branch `wf-s00b-supabase`) · 14/11/2026

Com autorização do dono, o modo Supabase passou a funcionar de ponta a ponta no projeto `rgptcikkxucyysfwarxb` (antigo, nos EUA, já excluído; hoje o wireframe usa o HEILD-PROD, `jccwtyeqookthkonbbxn`) (migração aplicada pela coordenação; nenhuma migração nova foi necessária).

- **Adaptador** (`app/src/nucleo/banco/supabase.ts`): fila local que garante a gravação ao recarregar; uma operação por vez; evento e registro de entrega por "inserir se não existir"; leitura paginada e ordenada; uma conta de demonstração por escritório, com troca automática ao trocar de escritório.
- **Correções que valem também no modo local:** o evento nascia sem `escritorio_id` (o banco agora preenche toda linha com o escritório aberto); ids de mensagem do CRM repetidos entre conversas (`m1`, `m2`...) passaram a ser prefixados pela conversa (`cv1:m1`). Bancos locais antigos: use "Resetar o ambiente" para pegar a semente nova.
- **Contas de demonstração:** senhas novas definidas para `demo-andrade@heild.app` e `demo-horizonte@heild.app`; estão só no `app/.env.local` da sessão S00b (fora do git). `app/.env.exemplo` traz a URL e a chave publicável.
- **Testes:** `scripts/fundacao-fumaca.cjs` passa no modo Supabase (26 de 26) e no local (26 de 26); no local também passam trabalho-simulado-assistente-crm, app-cliente, bpo-modulo e decisoes-8-11. Conferido no Postgres real com as duas contas: cada uma só vê o próprio escritório, inserir no outro é recusado pela RLS, evento não muda nem se apaga, mensagem interna não se apaga.
- **Como ligar, desligar e restaurar:** `docs/wireframe/ARQUITETURA.md`, seção 9.

## S00c · Restaurar no Supabase (branch `wf-s00c-restaurar`) · 15/11/2026

No HEILD-PROD (`jccwtyeqookthkonbbxn`, sa-east-1), com autorização do dono.

- **Causa:** durante o restaurar e a troca de escritório, a tela que saía continuava gravando, e essas linhas iam para a fila do escritório que estava sendo apagado ou ainda não existia (violação de chave estrangeira). Na semeadura, o supabase-js mandava `NULL` nas colunas que faltavam em alguma linha do lote (ex.: `fixada` da mensagem interna), e a abertura dupla do modo estrito semeava duas vezes, com uma falha deixando inserções no ar enquanto a outra apagava o escritório.
- **Correção:** o banco não grava nada fora do estado "pronto" e trata o restaurar como uma abertura; o adaptador descarta a fila e os envios em andamento ao restaurar (geração por escritório), semeia esperando todas as tabelas, usa `defaultToNull: false`; abertura repetida do mesmo escritório é reaproveitada.
- **Testes:** `scripts/fundacao-fumaca.cjs` 26 de 26 duas vezes seguidas no HEILD-PROD, sem nenhuma resposta de erro do Supabase; semeadura limpa dos dois escritórios em cerca de 13 s; modo local 26 de 26; build e typecheck passam. `app-cliente` e `bpo-modulo` falham igual no `wireframe` atual (sem esta mudança), então ficam para as sessões donas.
- **Contas de demonstração:** senhas novas definidas para `demo-andrade@heild.app` e `demo-horizonte@heild.app` no HEILD-PROD; estão só no `app/.env.local` da sessão S00 (fora do git). As do `.env.local` da coordenação deixaram de valer.

## S00d · Fumaça intermitente (branch `wf-s00d-fumaca`) · 15/11/2026

- **Sintoma:** "evento registrado com autor (linha do tempo)" falhava às vezes na suíte completa e passava sozinha.
- **Causa medida:** a seção Eventos da vitrine `#/kit` mostra só os 12 eventos mais recentes, e no momento da checagem o "criou a tarefa" estava sempre na 12ª posição (a última da janela). O trabalho simulado dos integrantes registra eventos num ritmo que depende do relógio; sob carga o teste anda mais devagar, entra mais um evento e o procurado sai da janela. Não era evento gravado tarde nem ordem errada. A checagem "a exclusão fica registrada no evento" tinha a mesma fragilidade.
- **Correção na tela:** a seção Eventos ganhou "Buscar nos eventos", que procura em todos os eventos (texto e nome). O teste procura cada evento pela busca, e não espera mais tempo.
- **Testes:** fumaça 26 de 26 em 10 rodadas seguidas, em 3 rodadas em paralelo (carga) e nas duas rodadas da suíte completa (45 scripts). Nas duas rodadas da suíte, app-cliente, bpo-cenarios, bpo-modulo, decisoes-8-11, servicos-app e qa-interface estouram o tempo ou falham, mas igual no `wireframe` f05bd78 sem esta mudança (conferido script a script); ficam para as sessões donas.
