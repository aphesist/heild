# Implementação do backend real

Registro do que já existe em código no branch `backend`, sessão por sessão. O desenho continua em [`STACK.md`](STACK.md), [`AGENTICO.md`](AGENTICO.md) (v0.3), [`ARQUITETURA.md`](ARQUITETURA.md), [`HOSPEDAGEM.md`](HOSPEDAGEM.md) e [`PERGUNTAS.md`](PERGUNTAS.md). Quando o código e este arquivo divergirem, vale o código, e este arquivo está errado.

O wireframe de demonstração (branch `wireframe`, na Vercel, com dados fictícios) não muda com nada daqui.

---

## B1 · Fundação da API

**15/11/2026 · branch `be1-api` → `backend`.** Tudo roda local: Postgres 16 no próprio container, API em Node 24 com Fastify e o app no Vite com `VITE_HEILD_BANCO=api`. A hospedagem fica para depois.

### Resumo

1. **A regra é uma só, de verdade.** O servidor não reescreve as regras do wireframe: ele roda **os mesmos repositórios** de `app/src/nucleo/repositorios`, com a mesma função `autorizar`, as mesmas transições, a mesma validação e o mesmo `registrarEvento`. Ele roda tudo sobre um banco em memória por pedido, carregado do Postgres sob RLS. O que a tela esconde é exatamente o que a API recusa: um teste compara conta a conta.
2. **Só a API grava.** O papel `api_executor` escreve, sem `BYPASSRLS`. `anon` e `authenticated`, o papel do navegador pela Data API, só leem. A RLS por escritório continua como segunda barreira, e o escritório vem só do token.
3. **Uma porta de escrita, duas formas de chamar, um executor:**
   - `POST /v1/ferramentas/{nome}`: as **ferramentas tipadas** (Zod estrito, ids, nunca nomes) para agentes e integradores;
   - `POST /v1/operacoes`: os **métodos dos repositórios** (764 operações) para o adaptador `api` do app.
4. **Feito para o agente errar pouco:**
   - `validar_apenas` em toda escrita;
   - `Idempotency-Key` obrigatória;
   - erro acionável com código estável (`SEM_SETOR`, `TAREFA_FINAL`, `CHAVE_REUSADA`...);
   - leituras compactas com totais antes das linhas e cursor.
5. **Trilha que não se reescreve:**
   - todo efeito grava evento na **cadeia de hash do escritório**, na mesma transação;
   - negado e erro de regra também viram evento;
   - `auditoria.verificar_cadeia` descobre adulteração, remoção e troca de ordem, até feitas pelo superusuário.
6. **Imutabilidade nas duas barreiras:**
   - no repositório: `exclusao: 'proibida'`, versões da mensagem interna e cartão decidido uma vez só;
   - no banco: gatilhos novos para as entidades centrais e para a decisão do cartão.
7. **O app fala com a API sem mudar as telas** (`VITE_HEILD_BANCO=api`). O `fundacao-fumaca.cjs` passa inteiro nesse modo, e 8 dos 13 scripts das sessões também. Os outros 5 param em checagens explicadas uma a uma, sem nenhuma regra recusada a mais pelo servidor.
8. **Contratos gerados de uma fonte só:** o OpenAPI 3.1 e o esquema das ferramentas, no formato do `tools/list` do MCP, saem do Zod do pacote de domínio. O retrato fica em `servidor/contratos/`, e um teste falha se ele estiver velho.
9. **62 testes da API contra Postgres real:** autorização, isolamento entre escritórios, idempotência, imutabilidade, cadeia e contratos.
10. **Padrões profissionais registrados** em [`PADROES.md`](PADROES.md), com um checklist por endpoint e serviço. No código: timeouts no HTTP e no Postgres, pool, limite de taxa por ator, cabeçalhos de segurança, id do pedido e desligamento gracioso.
11. **Fora do B1, por combinação:** o motor de procedimentos, a fila, o servidor MCP e os conectores. O encaixe com a B2 está no fim desta seção.

### Como rodar

Pré-requisitos: Node 24 e Postgres 16 ou mais novo no `PATH`, ou em `/usr/lib/postgresql/*/bin` (no Ubuntu: `apt install postgresql-16`). Não precisa de Docker.

```bash
# na raiz do repositório
npm install                         # monorepo: pacotes/dominio e servidor
(cd app && npm install)             # o app tem o próprio lockfile

npm run preparar -w @heild/servidor # sobe o Postgres local (porta 54329), aplica as migrações e semeia
npm run dev                         # API em http://127.0.0.1:8787, com recarga

# outro terminal: o app falando com a API
cd app && VITE_HEILD_BANCO=api npx vite --port 6100
```

Os passos do `preparar`, separados:

| Comando (em `servidor/`) | O que faz |
| --- | --- |
| `npm run pg -- iniciar` | Cria o cluster em `servidor/.pgdata`, fora do git, e sobe na porta 54329. Também aceita `parar`, `estado` e `apagar` |
| `npm run migrar` | Aplica `servidor/sql/00_supabase_local.sql` (papéis `anon`, `authenticated` e `service_role`, e o esquema `auth` do Supabase) e as migrações de `app/supabase/migrations` em ordem, anotadas em `heild_interno.migracao`. Cria o papel de login `app_api` |
| `npm run semear` | Grava os dois escritórios de exemplo (`esc-andrade` e `esc-horizonte`), gerados pelo mesmo código da semente do app, pela própria API (`api_executor`, sob a RLS de cada escritório) |
| `npm run contratos` | Regrava `servidor/contratos/openapi.json` e `ferramentas.json` |

Variáveis (todas com padrão local):

| Variável | Padrão | Para quê |
| --- | --- | --- |
| `HEILD_API_PORTA` | `8787` | Porta da API |
| `HEILD_PG_PORTA` / `HEILD_PG_BANCO` | `54329` / `heild` | Postgres local; os testes usam `heild_teste` |
| `HEILD_PG_URL_API` / `HEILD_PG_URL_ADMIN` | `app_api` e `postgres` locais | Conexões. A da API nunca é superusuário |
| `HEILD_DEMONSTRACAO` | `1` | Liga o login por papel, o restaurar e o cabeçalho de integrante simulado |
| `HEILD_SEGREDO_TOKEN` | valor local | Assina o token de demonstração |
| `HEILD_ORIGENS` | `localhost:6100`, `5173` | CORS do app local |
| `VITE_HEILD_API_URL` (no app) | `http://127.0.0.1:8787` | Onde o adaptador `api` acha a API |

Entrar e chamar à mão:

```bash
T=$(curl -s -XPOST localhost:8787/v1/auth/demonstracao -H 'content-type: application/json' \
      -d '{"escritorio_id":"esc-andrade","usuario_id":"u7"}' | jq -r .token)
curl -s -XPOST localhost:8787/v1/ferramentas/tarefa.listar -H "authorization: Bearer $T" \
     -H 'content-type: application/json' -d '{"status":["a_fazer"],"limite":5}'
curl -s -XPOST localhost:8787/v1/ferramentas/tarefa.concluir -H "authorization: Bearer $T" \
     -H 'content-type: application/json' -H 'idempotency-key: minha-chave-0001' -d '{"tarefa_id":"t18"}'
```

### Como testar

```bash
npm test                          # na raiz: Vitest da API (recria heild_teste do zero a cada rodada)
npm run typecheck                 # servidor + pacote de domínio
(cd app && npm run typecheck)     # o app, com o adaptador novo

# o app inteiro contra a API (Playwright; API e Vite no ar como acima)
cd app && node scripts/fundacao-fumaca.cjs /tmp/capturas
```

| Arquivo em `servidor/test/` | O que prova |
| --- | --- |
| `autorizacao.test.ts` | Setor (`SEM_SETOR`), papel (`PAPEL_INSUFICIENTE`), modo gestão (`EXIGE_GESTAO`), carteira (`SEM_CARTEIRA`), exceção por tela (`BLOQUEADO_POR_EXCECAO`), app do cliente (`FORA_DO_APP_CLIENTE`) e integrante que não passa do dono. **A mesma função:** para cada conta ativa e cada setor, a decisão da API em `validar_apenas` é igual à de `autorizar` no navegador, frase por frase. Negação vira evento. Integrante pedindo algo irreversível gera cartão (202) sem efeito. Trocar a ferramenta nas opções ou mandar `semAutorizar` não pula a regra |
| `isolamento.test.ts` | O teste de vazamento (Fundações 11). Pela API: outro escritório não lê, não muda e não grava linha com escritório alheio; o token adulterado cai. No banco: o login `app_api` sozinho não lê nada; `api_executor` com as claims de um escritório não vê nem insere no outro; `authenticated` (o navegador) não grava |
| `idempotencia.test.ts` | Sem chave, 400. A mesma chave com os mesmos argumentos devolve a mesma resposta, com `Idempotent-Replayed`, e um evento só. Com outros argumentos, 409 `CHAVE_REUSADA`. Seis pedidos simultâneos dão um efeito só. Um pedido que falhou não gasta a chave. `validar_apenas` não grava nem gera evento. Os ids da tela se repetem no servidor, e um id repetido não sobrescreve (`ID_EM_USO`) |
| `imutabilidade.test.ts` | Mensagem interna não se apaga; só o autor edita, e a versão anterior fica com autor e data. Tarefa, cliente e evento não se apagam. Evento não se regrava. Status não muda por `tarefa.atualizar`. O integrante não decide cartão; a pessoa decide uma vez, com autor e data. No banco, os mesmos gatilhos recusam |
| `cadeia.test.ts` | A canonização e a verificação. Doze escritas em paralelo dão `seq` sem buraco, e a cadeia confere. Um evento adulterado pelo superusuário é achado na posição exata, só naquele escritório. Apagar o último evento quebra o elo. Restaurar a demonstração recomeça a cadeia |
| `portas.test.ts` | O cursor percorre a lista inteira sem repetir, e o total bate. Cursor de outra consulta é recusado. As visões compacta e de tela. Campo desconhecido na entrada. Sincronização por versão (só o que mudou, mais as exclusões). Evento escrito pela tela regravado com o ator do token. Linha sem evento: a regra da tabela autoriza e o servidor grava o evento. Tabela sem repositório e campo inexistente. O registro das operações e o encaixe da fila |
| `contratos.test.ts` | Todo esquema de entrada é estrito, inclusive os objetos de dentro. Toda escrita aponta para uma operação registrada. Toda leitura autoriza com uma ferramenta `ler` do catálogo. Toda ferramenta usada pelos repositórios existe no catálogo. O retrato de `servidor/contratos` está em dia |

### Como funciona

#### Onde mora cada coisa

```
pacotes/dominio/   @heild/dominio: o que roda igual no navegador e no servidor
  src/index.ts       re-exporta o núcleo do wireframe (entidades, autorizar, catálogo, perfil,
                     repositórios, semente) e o que é novo:
  src/canonico.ts    canonização (JSON com chaves em ordem) e SHA-256
  src/cadeia.ts      hash do evento, gênese por escritório, verificação da cadeia
  src/contrato.ts    comando (operação ou linhas), envelope de resposta, paginação
  src/erros.ts       códigos de erro acionáveis, código pela frase de autorizar e da regra, status HTTP
  src/ferramentas.ts ferramentas tipadas das Fundações e do Contábil (Zod estrito)
  src/jobs.ts        pedirJob: o encaixe da fila (B2)
servidor/
  scripts/pg-local.sh, sql/00_supabase_local.sql, src/banco/{migrar,semear,pg}.ts
  src/auth/sessao.ts            token, perfil materializado (a mesma função da sessão do app), ator
  src/executor/executor.ts      o executor
  src/executor/banco-servidor.ts o banco por pedido (carrega sob demanda, grava numa camada por cima)
  src/executor/operacoes.ts     o registro das operações, tirado do próprio objeto `repos`
  src/executor/linhas.ts        escrita direta da tela, passada pela regra da tabela
  src/executor/leitura.ts       leitura das ferramentas tipadas (cursor, totais, autorizar por linha)
  src/executor/cadeia.ts        grava eventos na cadeia (elo travado por escritório)
  src/contratos.ts              OpenAPI e esquema das ferramentas
  test/                         os testes
app/src/nucleo/banco/api.ts     o adaptador `api` do app e a captura dos comandos
app/supabase/migrations/20261115200000_backend_b1.sql   a migração do B1
```

**Por que o núcleo do wireframe ainda mora em `app/src/nucleo`:** as sessões do wireframe continuam mexendo nesses arquivos (acrescentam ferramentas, entidades e repositórios). Mover agora daria conflito em todo merge do `wireframe` para o `backend`.

- O pacote re-exporta, e o servidor importa **só** de `@heild/dominio`, nunca de `@/` direto.
- Quando o wireframe congelar, os arquivos mudam para `pacotes/dominio/src` e só o índice do pacote muda.
- Nada está duplicado.

**O que mudou no núcleo do app** (pequeno, sem mudar comportamento no wireframe):

- os repositórios gravam em `bancoAtual()`, e não no singleton;
- o gerador de ids pode ser trocado (`definirGeradorId`);
- `criar` recusa id que já existe;
- `ErroRegra` aceita um código;
- a decisão com `aprovacao: true` vira `ErroAprovacao`, só com o modo do servidor ligado;
- o perfil da conta sai de `perfilDeConta`, usado pela sessão do app e pela API;
- o `Banco` ganhou `aoTransacao`, `aplicarDoServidor` e `recarregarDe`, e `substituir` pode devolver a fotografia do servidor;
- três ferramentas novas no catálogo: `mensagem_interna.listar`, `aprovacao.listar` e `auditoria.verificar_cadeia`.

#### O executor

Para cada escrita (`servidor/src/executor/executor.ts`):

1. **Entrada** validada pelo Zod na rota. Erro: 400 `ENTRADA_INVALIDA`, com o campo.
2. **Transação** com o escritório do token fixado (`request.jwt.claims`) e o papel `api_executor`, numa ida só ao banco.
3. **Idempotência:** `insert … on conflict do nothing` em `idempotencia (escritorio_id, chave)`. Um pedido simultâneo com a mesma chave espera o primeiro terminar e devolve a resposta guardada. Hash diferente: 409. Se a transação voltar, a chave fica livre.
4. **A operação roda no banco do pedido**, de forma síncrona, como no navegador. Quando ela lê algo que ainda não foi carregado, o banco lança `PrecisaCarregar`. O executor carrega do Postgres (a linha com `FOR UPDATE`, ou a tabela inteira) e roda a operação de novo, do zero. Até o fim, nada foi gravado: as escritas ficam numa camada por cima. O ator, o banco, o gerador de ids e o modo de aprovação são postos e tirados dentro desse bloco síncrono, então pedidos concorrentes não se misturam.
   - A **autorização acontece aqui dentro**, no próprio repositório, com a função do frontend.
   - Os **ids que a tela gerou** se repetem na mesma ordem, por prefixo.
   - Dos argumentos vindos de fora saem `ctx` e `semAutorizar` e, nas opções, `ferramenta`. Trocar a ferramenta de uma operação genérica trocaria a regra de permissão.
5. **Aprovação:** se `autorizar` disser que uma pessoa precisa aprovar (integrante com ferramenta irreversível, `exige_aprovacao`), nada é aplicado. Vira um cartão para o dono, com o comando guardado, e a resposta é 202 `aguardando_aprovacao`.
6. **`validar_apenas`:** para aqui e devolve `{ resultado: 'validado', erros, previa }`, sem efeito e sem evento.
7. **Aplicar**, na mesma transação:
   - as linhas: inserção; atualização só das colunas que mudaram, com `where versao_linha = <a lida>`, e se mudou no meio, 409 `VERSAO_DESATUALIZADA`; exclusão, que vai para `remocao`;
   - campo que a tabela não tem é erro, com o nome do campo;
   - o escritório da linha tem de ser o da sessão;
   - os jobs pedidos (B2);
   - os eventos na cadeia: trava o elo do escritório, calcula `hash = SHA-256(anterior ‖ canônico)` com a função do pacote e grava com a hora do servidor;
   - a resposta de idempotência e o commit.
8. **Falha:** negado (403) e erro de regra (422) gravam um evento `negado` ou `erro`, fora da linha do tempo, numa transação própria. O erro do Postgres vira código (unicidade, restrição, formato, RLS, gatilho de imutabilidade).

#### As duas formas de chamar

| | Ferramentas tipadas (`/v1/ferramentas/{nome}`) | Operações (`/v1/operacoes`) |
| --- | --- | --- |
| Para quem | Agentes, MCP (B2), integradores, testes | O adaptador `api` do app |
| Entrada | Zod estrito, ids, enums. `*.atualizar` só aceita campos editáveis; status muda só pela transição | `{ comando: { tipo: 'operacao', operacao: 'tarefas.mudarStatus', argumentos, ids } }` ou `{ tipo: 'linhas', gravar, remover }` |
| Execução | Vira a chamada de um método de repositório | O método de repositório, direto |
| Catálogo | 27 ferramentas (`GET /v1/ferramentas`, `contratos/ferramentas.json`) | 764 operações (`GET /v1/operacoes`), tiradas do objeto `repos`. Repositório novo vira operação sem código novo |

As ferramentas tipadas do B1:

- **Tarefas:** `tarefa.listar`, `.obter`, `.criar`, `.atualizar`, `.iniciar`, `.aguardar_cliente`, `.aguardar_terceiro`, `.enviar_revisao`, `.concluir`, `.cancelar`, `.reatribuir`, `.arquivar`.
- **Clientes:** `cliente.listar`, `.obter`, `.criar`, `.atualizar`, `.mudar_estado`, `.arquivar`.
- **Obrigações:** `obrigacao.listar`, `.cancelar`.
- **Comunicação interna:** `mensagem_interna.listar`, `.enviar`, `.editar`.
- **Aprovação:** `aprovacao.listar`, `.decidir`.
- **Avisos e trilha:** `notificacao.ler`, `evento.listar` e `auditoria.verificar_cadeia`.

As leituras:

- respondem em visão `compacta` (padrão, até 20 linhas) ou `tela` (até 100);
- trazem `totais` antes das linhas e `pagina: { cursor, ha_mais, total }`;
- filtram linha a linha com `autorizar` no nível ler (setor e carteira);
- usam cursor opaco que carrega os filtros; mudou o filtro, `CURSOR_INVALIDO`. Nunca `offset`.

A linha de escrita direta (`tipo: 'linhas'`) é o que o motor da demonstração e a loja gravam fora de um repositório. O servidor passa cada linha pela regra da tabela:

- linha nova: ferramenta `criar` do repositório da tabela; linha existente: `atualizar`, depois de `antesDeAtualizar` e `validar`;
- remoção: só com `exclusao: 'definitiva'`;
- evento escrito pela tela: autorizado pela ferramenta dele e regravado com o ator do token;
- sem evento da tela, o servidor grava um (R2).

#### Sessão e autenticação de demonstração

- `POST /v1/auth/demonstracao` aceita três formas:
  - `{ escritorio_id, usuario_id }`;
  - `{ escritorio_id, papel }`, que pega a primeira conta ativa do papel;
  - `{ escritorio_id, cliente_id }`, para a pessoa do cliente.
- Devolve um JWT HS256 assinado pela API, com `app_metadata.escritorio_id`, o mesmo formato do Supabase Auth. Em produção, `verificarToken` passa a conferir o JWT do Supabase pelo JWKS; o resto não muda.
- `GET /v1/auth/contas?escritorio_id=` lista as contas para escolher.
- A cada pedido, o perfil é montado do banco (usuário, vínculos, exceções, carteira, escritório e assinatura) pela mesma `perfilDeConta` da sessão do app. Sem cache no B1: correção antes de desempenho.
- `X-Heild-Integrante: i-fiscal`, só com `HEILD_DEMONSTRACAO=1`: o integrante age em nome da pessoa do token, e `autorizar` faz a interseção (R4). Na produção, o integrante chega com o token próprio que o orquestrador pede.
- Endpoints: `GET /v1/saude`, `GET /v1/sessao` (perfil, permissões e `catalogo_hash`), `GET /v1/sincronizar[?desde=versao]`, `GET /v1/ferramentas`, `POST /v1/ferramentas/{nome}`, `GET|POST /v1/operacoes`, `GET /v1/openapi.json` e, na demonstração, `POST /v1/demonstracao/restaurar`.

#### O banco

A migração `20261115200000_backend_b1.sql`, por cima das do wireframe e **sem editá-las**:

- **Papéis e escrita:**
  - `api_executor` (herda de `authenticated`, sem `BYPASSRLS`) tem a escrita;
  - `anon` e `authenticated` perdem insert, update, delete e truncate;
  - o login `app_api` só pode assumir `api_executor`.
- **Cadeia do evento:**
  - colunas novas no `evento`: `seq`, `hash_anterior`, `hash`, `ferramenta_versao`, `sessao_auth_id`, `aprovacao_id`, `causado_por_evento_id` e `idempotencia_chave`, com `(escritorio_id, seq)` único;
  - `cadeia_evento` guarda um elo por escritório, que só avança;
  - a gênese é `SHA-256("heild-cadeia-v1:" ‖ escritorio_id)`, então a cadeia de um escritório não verifica em outro.
- **Idempotência:** `idempotencia (escritorio_id, chave)`, com o hash dos argumentos e a resposta.
- **Versão de linha:** `versao_linha` em toda tabela, de uma sequência só, mais `remocao` para o que a API exclui. Com isso, `GET /v1/sincronizar?desde=` devolve só o que mudou. O nome não é `versao` porque `documento`, `contrato_honorarios`, `politica_financeira` e `portal_extensao` já usam `versao` como dado de negócio.
- **Segunda barreira:**
  - as entidades centrais não se apagam, fora da restauração da demonstração (marca `heild.restaurando`);
  - cartão decidido não troca de decisão;
  - `restaurar_demonstracao()` também para o `api_executor`.

**Não aplicar no projeto Supabase do wireframe:** o adaptador `supabase` do wireframe grava direto pelo navegador e pararia de funcionar. Ela é do projeto novo em São Paulo e do Postgres local.

#### O adaptador `api` do app

`app/src/nucleo/banco/api.ts`, ligado com `VITE_HEILD_BANCO=api`:

- **Captura:** cada método de repositório chamado de fora vira um comando. A chamada da tela é capturada; as de dentro, como uma transição chamando `atualizar`, fazem parte dela. O comando leva os argumentos sem o `ctx`, os ids gerados e quem age. Uma transação direta no banco, fora de repositório, vira `linhas`.
- **Fila:** uma chamada por vez, em ordem, com `Idempotency-Key` por comando, guardada no `localStorage` até o servidor confirmar. Recarregar a página no meio não perde nada.
- **Reconciliação:** a resposta traz as linhas como ficaram gravadas (`aplicarDoServidor`). Se o servidor recusar, o banco relê o escritório inteiro e o erro aparece no console, com `[heild] falha ao gravar`.
- **Token:** a pessoa da tela. O integrante usa o token do dono mais o cabeçalho. O app do cliente usa a pessoa do cliente. O "Sistema" do motor da demonstração age com a última pessoa da equipe que entrou, ou com a Administradora antes do login.
- **Restaurar:** a API semeia o escritório com a mesma semente do app e devolve a fotografia.

### Os scripts das sessões no modo `api`

Rodados com a API e o Vite no ar (`VITE_HEILD_BANCO=api`), com a semente regravada no servidor antes de cada script. Cada um foi rodado também no modo `local`, como linha de base.

**Resultado final: 8 de 13 scripts passam inteiros no modo `api` (no `local`, os 13 passam).** Os 5 que não passam param em uma ou duas checagens cada. Em nenhum deles o servidor recusou uma regra que devia aceitar: são script lendo o `localStorage`, demonstração simulando evento externo na conta da tela e uma regra do catálogo que o servidor aplica e o wireframe ignorava. A primeira rodada achou defeitos de verdade, e eles foram corrigidos (lista abaixo da tabela).

| Script | `local` | `api` | Por quê |
| --- | --- | --- | --- |
| `fundacao-fumaca.cjs` | passa | **passa** | 71 escritas pela API, todas 200 |
| `s01-inicio` | 37 ok | **37 ok** | |
| `s02-painel-a` | 29 ok | 28 ok, 1 falha | **Artefato do script:** ele confere o cliente novo lendo o `localStorage` (`…:cliente`). No modo `api` os dados ficam no servidor. Conferido no Postgres: o cliente foi criado em "aceito", com a primeira versão do perfil |
| `s03-painel-b` | 53 ok | **53 ok** | |
| `s04-painel-c` | 43 ok | **43 ok** | |
| `s05-crm-interna` | 42 ok | **42 ok** | |
| `s06-timesheet` | 76 ok | **76 ok** | |
| `s07-financeiro` | 72 ok | **72 ok** | Na primeira rodada, o download do CSV não chegou em 5 s; na repetição passou (tempo, não regra) |
| `s08-bpo` | 51 ok | 49 ok, 2 falhas | **Evento externo simulado na conta da tela:** a demonstração faz chegar uma mensagem de cliente no CRM gravando `mensagem` e `conversa` em nome da pessoa logada (a Gestora do BPO, sem o setor da conversa). O servidor recusa (`SEM_SETOR`), e está certo: no backend real, mensagem que chega entra pelo webhook do conector. A segunda falha é consequência: depois da recusa, o banco relê o escritório, e a proposta de alçada mais nova some da tela por alguns instantes (pela API, a proposta funciona) |
| `s08a-bpo-visao` | 76 ok | **76 ok** | |
| `s08b-operacao` | 62 ok | 39 ok, 2 falhas | **Regra do catálogo que o servidor aplica:** `bpo.relatorio_mensal` tem `exige_aprovacao: 'se_integrante'`. O integrante Gerencial pede o rascunho e recebe um cartão (202), em vez de gravar direto como no wireframe. O passo seguinte do script ("o Gestor aprova o rascunho") não acha rascunho. A retomada depois do cartão é da B2. A outra falha é de texto: o servidor grava o integrante com o rótulo oficial ("Contas a Pagar"), e a tela da demonstração espera o sufixo "(integrante)", que vinha do nome montado no navegador |
| `s08c-aprovacoes` | 37 ok | 36 ok, 1 falha | O mesmo do s08: mensagem de cliente simulada no CRM, agora pelo integrante, recusada por `SEM_SETOR` (aparece como erro no console) |
| `s09-arquivos-config` | 48 ok | 47 ok, 1 falha | **Aceite de convite:** a pessoa convidada (situação "convidado") aceita o convite e o app grava a ativação com a conta dela. A API não entra com conta inativa. No produto, aceitar convite é fluxo do Supabase Auth, não ferramenta de quem ainda não tem conta ativa |
| `s10-app-cliente` | 41 ok | **41 ok** | Na primeira rodada, dois tempos de espera do script estouraram; na repetição passou inteiro, sem nenhuma recusa da API |

Defeitos que a primeira rodada achou, todos corrigidos e já no branch:

- **A S08b ficava fora da API.** O repositório de documentos e os objetos `filaOperacao`, `conciliacaoOperacao` e `fechamentoOperacao` estavam fora de `repos` e ligados ao banco do navegador: o servidor respondia `TABELA_SEM_REGRA`, e no servidor eles gravariam no banco errado. Agora usam `bancoAtual()` e entram no registro de operações (764) e na captura.
- **Integrante gravado como pessoa.** O integrante sem dono no contexto (motor da demonstração) ia como a pessoa da sessão, e o efeito ficava em nome dela. Agora vai sempre como integrante.
- **`undefined` virando `null`.** Um campo `undefined` nos argumentos chegava como `null` e apagava um campo obrigatório (`documentos.atualizar`). Agora o campo sai, como no JSON.
- **Fila travada por login recusado.** O comando ficava na frente da fila para sempre e bloqueava os seguintes. Agora é recusa: sai da fila e o banco relê o escritório.
- **"ok" a quem não pode.** Uma transição que não muda nada (iniciar uma tarefa já em andamento) respondia 200 sem passar por `autorizar`. Agora confere a permissão do mesmo jeito.

Como repetir: com a API e o Vite no ar (`VITE_HEILD_BANCO=api`), rode `npm run semear -w @heild/servidor` e `node scripts/<script>.cjs <pasta>` em `app/`, um script por vez. Cada script conta com o escritório recém-semeado.

### Desvios do desenho, e por quê

| Desenho | No B1 | Por quê / quando muda |
| --- | --- | --- |
| Servidor executa as ferramentas com SQL escrito à mão (STACK 2.5) | Executa os repositórios do wireframe num banco em memória por pedido, carregado sob demanda | É o que deixa a regra **uma só** hoje, com 764 operações e as regras de 7 sessões, sem reescrever nada. Custo: `criar` e alguns métodos carregam a tabela inteira do escritório (para a `ordem` e para regras que olham a lista). Para os dados de demonstração é rápido (o `fumaca` inteiro faz 71 escritas, todas em milissegundos). Quando uma tabela crescer (mensagem, evento, documento), a operação dela ganha SQL próprio no servidor, e o repositório continua sendo a regra |
| Banco do navegador por classes: inteira, janela e consulta (ARQUITETURA 6.1) | `GET /v1/sincronizar` entrega o escritório inteiro, filtrado só pela RLS do escritório | Mantém as 143 telas iguais agora. As leituras por setor e carteira já existem nas ferramentas tipadas (`*.listar`). Fica para a F1: classes, janela, `useConsulta` nos 25 a 30 pontos e o filtro por `autorizar` no `sincronizar`. **Até lá, a sincronização não esconde de um Membro as linhas de outro setor do mesmo escritório** (a escrita, sim, é recusada) |
| `x.atualizar` só com campos editáveis (ARQUITETURA 6.2) | Nas ferramentas tipadas, sim. Nas operações do adaptador, `atualizar`, `criar` e `reverter` aceitam o patch livre do wireframe | É o que as telas mandam hoje. A troca de ferramenta nas opções foi fechada (sai dos argumentos). Fechar de vez é trocar, na F1, os repositórios do frontend para clientes das ferramentas tipadas |
| Perfil em cache até um evento `conta.*` (STACK 5) | Montado do banco a cada pedido | Correção antes de desempenho; o cache entra com o SSE |
| Eventos de leitura em `evento_leitura` (STACK 8) | Não registrados | Fica para a F1, com a selagem por lote |
| SSE de mudanças, `useConsulta` | Não há | F1 |
| JWT do Supabase (ES256, JWKS) e MFA | Token de demonstração HS256 | Trocar `verificarToken`; o formato das claims já é o do Supabase |
| Node 24 LTS | Exigido em `engines`. No container desta sessão, o Node 24 foi baixado em `/opt/node24` (o sistema tinha o 22) | — |

### O encaixe com a B2 (motor de procedimentos, fila e MCP)

O que a B2 recebe pronto, e como se liga:

1. **Uma operação vira ferramenta tipada.** A definição vai em `pacotes/dominio/src/ferramentas.ts`: nome do catálogo, `versao`, `descricao_modelo`, `entrada` com `.strict()`, `erros` e `chamada(entrada) → { operacao, argumentos }`, que aponta para um método de repositório ou, na B2, para a operação de processo.
   - Ela aparece sozinha em `GET /v1/ferramentas`, no OpenAPI e em `contratos/ferramentas.json`, já com `name` no formato `tarefa_concluir` e as anotações do MCP.
   - Ela executa pelo mesmo executor, com idempotência, `validar_apenas`, cadeia e erros acionáveis.
   - Para uma **operação de processo** (uma por procedimento), a `chamada` aponta para o método que inicia a execução (`procedimentos.iniciar`, da B2). Ela devolve `{ execucao_id, estado }`, e a rota responde 202 `em_execucao`.
   - O teste de contratos obriga entrada estrita e operação registrada.
2. **Um efeito enfileira um job na mesma transação.** O código de domínio (repositório ou passo determinístico) chama `pedirJob({ fila, dados, singleton, iniciar_em, prioridade })`, de `pacotes/dominio/src/jobs.ts`.
   - O executor junta os pedidos da operação (`bs.jobs`, zerados a cada nova tentativa) e chama `enfileirarNaTransacao(tx, jobs)` em `servidor/src/executor/jobs.ts`, **antes** dos eventos e do commit.
   - No B1, essa função recusa a transação inteira se houver job: não grava o efeito para perder o trabalho em silêncio. Nenhuma operação de hoje pede job.
   - Na B2, o corpo vira `boss.send(fila, dados, { db: <executeSql sobre tx>, singletonKey, startAfter, priority })`. O pg-boss grava em `pgboss.job` com a mesma conexão e o mesmo commit: se o efeito voltar, o job some junto.
3. **O motor chama ferramentas pelo mesmo executor.** `executar(sql, { sessao, comando, chave, validarApenas, rotulo, confiavel: true, entradaOriginal })` é uma função comum, chamável do worker.
   - A chave de idempotência do passo é derivada de `(execucao, passo, tentativa)`.
   - A `sessao` do motor carrega o ator da execução (o integrante e o dono, ou a pessoa que pediu).
   - Falta só a coluna `execucao_id` no evento, para a correlação.
4. **Retomar depois do cartão.** O cartão criado pelo executor guarda `argumentos.comando`, `rotulo` e `alvo`. Na B2, `aprovacao.decidir` aprovado roda o comando guardado com `definirModoAprovacao(true, [ferramenta])` (a ferramenta liberada pelo cartão), o integrante como ator e `aprovacao_id` no evento. Em seguida, retoma a execução parada em `aguardando_cartao`.
5. **MCP na borda.** `tools/list` é `esquemaDasFerramentas()` filtrado por `exposta_mcp`, pelo recorte do setor e pelo escopo do token. `tools/call` é a mesma rota de ferramenta (leitura por `ler`, escrita por `executar`), e `nomeDoExposto` faz a volta de `tarefa_concluir` para `tarefa.concluir`.
6. **Token de integrante.** O cabeçalho `X-Heild-Integrante` da demonstração dá lugar ao token de 15 minutos emitido para o orquestrador (`POST /v1/interno/integrantes/{id}/token`). `abrirSessao` já monta o ator integrante com o dono carregado a cada chamada.

### O que falta (depois do B1)

- **F1:**
  - classes de tabela no `sincronizar`, filtradas por `autorizar`;
  - `useConsulta` e SSE (`/v1/eventos/fluxo`);
  - repositórios do frontend como clientes das ferramentas tipadas, fechando o patch livre;
  - cache do perfil;
  - `evento_leitura`;
  - mais ferramentas tipadas, até cobrir as do Contábil em `docs/apis/API_INTERNA.md` (branch `wf-backend-apis`).
- **B2:** fila (pg-boss), motor de procedimentos, runner de operários, MCP, token de integrante, retomada depois do cartão e `aprovacao.decidir` executando o comando aprovado.
- **Conectores** (sessão futura): cofre, DF-e, NFS-e e consulta de CNPJ.
- **Produção:** JWT do Supabase com JWKS e MFA, OpenTelemetry, limites de taxa, hospedagem ([`HOSPEDAGEM.md`](HOSPEDAGEM.md)), projeto Supabase em São Paulo com esta migração e a Data API desligada.

---

## B2 · Motor de procedimentos, fila, operários e MCP

**15/11/2026 · branch `be2-processos` → `backend`.** Tudo local: o mesmo Postgres da B1 (porta 54329), pg-boss no próprio banco e Node 24. Nenhum modelo de verdade é chamado e nenhum conector real existe: o operário de demonstração é determinístico e respeita o contrato, e o órgão é simulado nos testes. A B2 foi feita **sobre o `be1-api`** (trazido para o branch): usa o papel `api_executor`, a cadeia de hash do evento e o pacote `@heild/dominio`.

### Resumo

1. **Motor durável próprio sobre o Postgres** (`pacotes/processos`). O estado de cada processo é dado do domínio, em `execucao` e `passo_execucao`, sob RLS. Cada passo é um job do pg-boss com chave `(execução, passo, tentativa)`. O resultado é gravado **antes** de avançar, e o próximo job entra **na mesma transação** do checkpoint, do efeito e do evento. Uma queda retoma do último passo gravado.
2. **Procedimento é código**, não um modelo planejando. Os passos são tipados: `deterministico`, `operario`, `validar`, `aprovacao`, `externo`, `efeito` e `concluir`. Entrada e saída têm esquema estrito, e o procedimento é versionado com hash da definição em `procedimento_versao`.
3. **Nenhum ato que a regra exija aprovação sai sem cartão humano.** Isso tem três barreiras:
   - na definição: procedimento com efeito irreversível sem um passo de aprovação `sempre` da mesma ferramenta nem compila;
   - na execução: antes de sair, o motor confere **no banco** que há um cartão desta execução e desta ferramenta, decidido por uma pessoa, com o hash exato dos argumentos que vão sair;
   - na decisão: só uma pessoa decide, só quem está em `pode_aprovar`, com `autorizar` conferido de novo na hora. O integrante nunca decide.
4. **Validação determinística antes do modelo.** Os validadores são serviço (`validadores/`), com custo zero de modelo. Regra dura que falha encerra a execução sem chamar modelo. A saída de operário passa pelo esquema do contrato e pelos validadores. Na falha, a execução escala **uma vez** ao escritor, com a falha anexada; se falhar de novo, vira cartão "não consegui", e a resposta da pessoa passa pelos mesmos validadores.
5. **Nada duplicado.** Garantido por:
   - idempotência por chave e por pedido igual em andamento: duas pessoas pedindo a mesma coisa recebem a mesma execução;
   - trava curta por `(setor, cliente, processo)`, só no efeito;
   - `efeito_externo` com chave natural: reservado antes de chamar o órgão, confirmado depois e consultado antes de qualquer reenvio;
   - `chamada_modelo` única por chave: retentativa não debita duas vezes.
6. **Fila com prioridade e limites:** chat > evento > job. Limite por escritório (padrão 30), por setor (padrão 10) e de segundo plano por pessoa (padrão 3), configuráveis em `limite_execucao`. A posição na fila aparece em `execucao.obter`.
7. **Despachante:** o evento enfileira o despacho na mesma transação. O despachante casa o evento com um `gatilho`, roda a checagem sem modelo e inicia o procedimento **direto**. O integrante só é acordado com `execucao_concluida` (em `item_fila`) quando há algo a dizer.
8. **Runner de operários com contrato:** contexto vazio, só a entrada do contrato, com o conteúdo de fora envelopado como dado. O orçamento é conferido e **reservado antes** de cada chamada: o da execução e o saldo da bolsa do setor, ou da pessoa responsável se o escritório configurar. O acerto é feito pelo custo real, e cada chamada gera `chamada_modelo`. O fornecedor real entra pela interface `FornecedorModelo`.
9. **Servidor MCP por escritório** (`/mcp` e `/mcp/setor/{codigo}`, Streamable HTTP, sem sessão): uma fachada fina das mesmas ferramentas, com a autorização de quem é dono do token. O escritório vem do token. Decidir cartão **não** é exposto por MCP.
10. **Testes:** 38 testes da B2 contra Postgres real, com workers de verdade e uma queda real de worker. As 59 da B1 continuam verdes com a migração da B2 junto.

### Como rodar

Pré-requisitos e instalação: os mesmos da B1 (`npm install` na raiz, `cd app && npm install`, Node 24, Postgres 16).

```bash
cd pacotes/processos
npm run banco        # sobe o Postgres da B1 e aplica as migrações no banco heild_b2 (--recriar zera)
npm run demo         # o CTB-ECD-TRANSMITIR de ponta a ponta, impresso passo a passo
```

`npm run demo` mostra os passos gravados, a chamada de modelo com o débito da bolsa, o cartão e a transmissão depois da aprovação. Mostra também a cadeia de eventos da execução.

Para usar o motor de outro serviço (a API da B1, um worker), use:

```ts
import { criarProcessos, FornecedorDemonstracao, rotasMcp } from '@heild/processos'
const b2 = await criarProcessos({ url, fornecedor, conectores: { sped }, aguardar_ms: 5000 })
await b2.iniciarWorkers()                 // filas procedimento.passo, operario.executar, execucao.admitir, evento.despachar...
await rotasMcp(app, b2.registro, autenticar)  // autenticar(req) → ContextoExec (token de serviço ou de integrante)
```

| Variável | Padrão | Para quê |
| --- | --- | --- |
| `DATABASE_URL` | `postgres://postgres@127.0.0.1:54329/heild_b2` | Banco da B2 (os testes usam `heild_b2_teste`, recriado a cada rodada) |
| `HEILD_TX_CONSULTA` / `HEILD_TX_TRAVA` / `HEILD_TX_OCIOSO` | `5s` / `3s` / `10s` (os do PADROES.md) | `statement_timeout`, `lock_timeout` e `idle_in_transaction_session_timeout` de cada transação do motor |
| `HEILD_LOG_FILA` | vazio | Mostra os erros do pg-boss no console |

### Como testar

```bash
npm run test:b2       # na raiz (ou npm test em pacotes/processos); recria heild_b2_teste
npm run typecheck     # servidor + B2
npm test              # a suíte da B1, com a migração da B2 aplicada
```

| Arquivo em `pacotes/processos/testes/` | O que prova |
| --- | --- |
| `ecd.test.ts` (13) | CTB-ECD-TRANSMITIR. **Validação barra antes do modelo:** partidas que não fecham, CNPJ de outro cliente e saldo que não fecha param em `conferir`, com zero `chamada_modelo`, zero chamada ao fornecedor e zero cartão, e o integrante é acordado com a falha. **Aprovação obrigatória:** mesmo com "executa sozinho" ligado, o ato irreversível pede cartão. Quem não está no cartão, outro setor e o integrante recebem `negado`. A transmissão sai com os argumentos exatos aprovados, uma vez, e o evento aponta o cartão. A cadeia de hash do escritório confere. **Recusa** encerra sem transmitir. **Cartão adulterado no banco** (decidido por integrante, ou argumento trocado) não transmite (`SEM_APROVACAO`). **Retomada:** falha do conector antes e depois de o envio chegar dá um envio só (consulta pela chave). Recusa do órgão para a execução; `execucao.retomar` volta ao passo sem repetir os anteriores. **Duas pessoas:** o mesmo pedido vira uma execução; a mesma chave com outra entrada é `IDEMPOTENCIA_CONFLITO`; duas execuções aprovadas ao mesmo tempo para o mesmo cliente e exercício dão um envio só. Sem conta atípica, nenhum modelo é chamado. **Escalada:** o operário que erra escala ao escritor com a falha; se o escritor também errar, vira cartão "não consegui". **Orçamento:** sem saldo na bolsa, nenhuma chamada; a execução fica `parcial` com cartão para quem gere o setor e continua depois de aprovado. **Resposta do órgão fora do esquema:** `ESQUEMA_EXTERNO`, sem registrar entrega, com o efeito reservado para a retomada consultar antes de reenviar |
| `competencia.test.ts` (8) | CTB-COMPETENCIA-DOC disparado por evento. Uma nota com data de emissão é classificada por regra, sem modelo, sem cartão e sem acordar o integrante. Evento entregue duas vezes abre uma execução só. Um recibo sem data estruturada vai ao operário com contexto vazio (texto envelopado como dado), a escolha fica entre as candidatas e o integrante é avisado. Competência inventada é barrada, escala e acaba no cartão; a pessoa decide. Com competência fechada, vai direto ao cartão, sem modelo. Sem "executa sozinho", pede cartão. "Para quem quer rotear?": a pessoa escolhida vira responsável e o custo sai do plano dela. Vinte documentos de uma vez dão vinte execuções isoladas, cada uma com o seu resultado |
| `fila.test.ts` (5) | Limite por setor com posição na fila. Chat na frente de evento, evento na frente de job. Limite de segundo plano por pessoa. RLS: outro escritório não lê nem grava. Pessoa sem o setor não inicia, e a tentativa fica na trilha |
| `retomada.test.ts` (1) | **Queda real:** o worker morre no meio da chamada ao modelo e outro sobe. O pg-boss reentrega o job, e a execução continua do passo gravado: cada passo é concluído uma vez, há uma `chamada_modelo` e a reserva de orçamento é reaproveitada (sem débito em dobro) |
| `mcp.test.ts` (5) | Sem token, 401. `tools/list` só traz o que a pessoa pode, em ordem fixa, com esquema estrito, e sem `aprovacao.decidir`. O recorte por setor. `tools/call` inicia pelo mesmo motor, com idempotência e erro por campo. Outro escritório não vê a execução. O integrante inicia, mas o cartão vai para quem gere o setor |
| `definicao.test.ts` (6) | O que o CI recusaria: irreversível sem cartão `sempre` da mesma ferramenta, entrada aberta, validador desconhecido, escalada sem operário. Procedimento que muda sem subir a versão não publica. Validadores rodam fora do procedimento com o mesmo código. Memória do setor muda só por proposta aprovada por quem gere. O fornecedor real só liga pela variável de ambiente |

### Como funciona

#### Onde mora cada coisa

```
pacotes/processos/                  @heild/processos
  src/motor/definicao.ts            definirProcedimento: passos tipados e as regras de definição
  src/motor/motor.ts                o motor: iniciar, admitir, executar passo, operário, externo, cartões, retomar, obter
  src/operarios/contrato.ts         definirContrato (recebe e devolve estritos, classe, teto de saída)
  src/operarios/fornecedor.ts       FornecedorModelo, ConfigModelos (modelo por classe e por contrato, preços) e o operário de demonstração
  src/operarios/orcamento.ts        reservar antes / acertar depois; bolsa do setor ou da pessoa
  src/validadores/                  registro, rodarValidadores e os validadores do Contábil
  src/procedimentos/contabil/       ecd.ts (CTB-ECD-TRANSMITIR) e competencia-documento.ts (CTB-COMPETENCIA-DOC)
  src/fila.ts                       filas e enfileirar(tx): o job na transação do efeito
  src/eventos.ts                    PortaEventos: evento na cadeia da B1 + despacho na mesma transação
  src/despachante.ts                evento → gatilho → procedimento direto
  src/ferramentas.ts                registro das ferramentas da B2 e envelope (interface mínima, ver o encaixe)
  src/mcp.ts                        servidor MCP e rotas Fastify
  src/memoria.ts                    memoria.propor / decisão
  scripts/banco.sh, scripts/demo.ts
app/supabase/migrations/20261115210000_b2_processos.sql
```

#### O motor, passo a passo

1. **Iniciar** (`motor.iniciar(ctx, procedimento, entrada, opções)`). O motor:
   - valida a entrada pelo Zod estrito e autoriza a operação de processo com a função `autorizar`;
   - com chave de idempotência já usada, devolve a mesma execução (com outra entrada, é conflito);
   - com pedido igual em andamento, devolve o que já existe;
   - grava a `execucao` como `pendente`, com ator, solicitante, responsável, pagador, prioridade pela origem, orçamento e a memória do setor congelada;
   - grava o evento e enfileira a admissão, na mesma transação.
2. **Admitir.** Sob trava do escritório, conta o que está rodando por setor e por pessoa e admite por prioridade e ordem de chegada. Cada execução admitida recebe o job do passo 0.
3. **Passo.** O job traz `(execução, passo, tentativa)`. O motor trava a linha da execução; se o ponteiro já andou, o job é obsoleto e não faz nada. Por tipo de passo:
   - `deterministico`: código com a transação sob RLS;
   - `operario`: grava o passo como `aguardando`, muda a execução para `aguardando_operario` e enfileira `operario.executar`;
   - `validar`: roda todos os validadores (a pessoa vê todos os erros, não só o primeiro); se falhar, encerra, escala ou cria o cartão "não consegui";
   - `aprovacao`: cria o cartão com os argumentos exatos, o hash, o resumo escrito pelo sistema com números do dado e os cartões visuais. `por_regra` dispensa o cartão só se a lista do escritório liberar e a ferramenta não exigir aprovação;
   - `efeito`: confere o cartão no banco, trava `(setor, cliente, processo)` e grava efeito e evento, com checkpoint e próximo job na mesma transação;
   - `externo`: em três fases. (a) Na transação: confere o cartão, trava e reserva `efeito_externo` pela chave natural; se já foi confirmado, não sai de novo. (b) Fora da transação: chama o conector, consultando antes pela chave se for retentativa, e valida a resposta pelo esquema do passo. (c) Na transação: confirma, grava o evento com `aprovacao_id`, o checkpoint e o próximo passo;
   - `concluir`: valida a saída pelo esquema, grava o evento com o custo e acorda o integrante se houver resumo.
4. **Erros.**
   - Erro de regra, de permissão ou de entrada não se repete: a execução fica `falhou` com o código, e o integrante é acordado.
   - Falha técnica ou passageira fica anotada em `execucao.erro` e volta ao pg-boss, que repete com espera crescente. Esgotadas as tentativas, a fila morta marca `FALHA_TECNICA`.
   - `execucao.retomar` (quem pediu, o responsável ou quem gere o setor) volta ao último passo gravado.
5. **Cartões** (`aprovacao.decidir`), por tipo:
   - `aprovacao`: aprovar, editar (revalida pelo esquema e pelos validadores) ou recusar (cancela);
   - `nao_consegui`: a pessoa fornece a saída do passo, conferida pelo contrato e depois pelos validadores;
   - `orcamento`: aprovar continua do mesmo passo;
   - `escolha_responsavel`: define o responsável e o pagador;
   - `memoria`: grava na memória do setor;
   - cartão vencido expira pelo job `cartao.expirar`.

#### O banco (migração `20261115210000_b2_processos.sql`, depois da B1)

- **Tabelas novas:**
  - `procedimento_versao` (da plataforma), `procedimento_config`, `limite_execucao`, `execucao`, `passo_execucao`;
  - `chamada_modelo`, `reserva_orcamento`, `bolsa_setor`, `efeito_externo`;
  - `entrega_obrigacao`, `competencia_contabil` (para os procedimentos de referência);
  - `memoria_setor` e `gatilho`.
- **Colunas novas nas Fundações:**
  - `cartao_aprovacao.execucao_id`, `argumentos_hash`, `tipo` e `opcoes`;
  - `item_fila.execucao_id`, `prioridade`, `causado_por_evento_id` e `resumo`;
  - `evento.execucao_id` e `custo`.
- **Segunda barreira:**
  - passo concluído e efeito confirmado não mudam;
  - `chamada_modelo` e `entrega_obrigacao` são só de inserção;
  - a bolsa nunca fica negativa (check), e o débito é condicional ao saldo;
  - o gasto de uma execução não passa do orçamento (check);
  - uma entrega por cliente, obrigação e período.
- **RLS:** todas as tabelas novas têm RLS forçada por escritório. A escrita vem do `api_executor`, pelos privilégios padrão da B1.
- **Índices:** fila de pendentes por prioridade, execuções rodando por setor, execuções por cliente e itens pendentes do integrante.

#### Os dois procedimentos de referência

| | CTB-ECD-TRANSMITIR | CTB-COMPETENCIA-DOC |
| --- | --- | --- |
| Operação | `contabil.ecd.conferir_e_transmitir` | `contabil.documento.classificar_competencia` |
| Disparo | Pessoa (chat, tela, MCP) ou integrante | Evento `documento.criar` (o que o repositório de documentos grava) → gatilho, direto no motor |
| Determinístico | Carrega o arquivo lido, confere CNPJ, exercício, partidas, saldos por conta, 12 competências fechadas e entrega repetida; separa as contas atípicas | Campo de competência, data de emissão de nota e período informado; candidatas extraídas do texto |
| Operário | `ctb.ecd.apontar_atencao@1`: aponta, entre as atípicas, o que olhar (sem número) | `ctb.competencia.escolher@1`: escolhe entre as candidatas; só quando a regra não resolve |
| Validadores | `apontamentos_nas_candidatas`, `texto_sem_numero` | `competencia_nas_candidatas`, `confianca_minima:0.9`, `competencia_nao_futura`, `competencia_aberta` |
| Aprovação | `contabil.ecd_ecf.transmitir`, **sempre** (irreversível) | `documento.classificar`, por regra (lista do escritório) |
| Efeito | Transmissão pelo conector `sped` (simulado), chave `ECD:{cliente}:{exercício}`; recibo em `entrega_obrigacao`; conclui a tarefa | Grava a competência no documento, com a origem (regra, modelo ou pessoa) |

### Teste agêntico real (pronto para ligar com a chave)

O roteiro `scripts/agentico-real.ts` roda os dois procedimentos de referência com o **modelo de verdade** no lugar do operário simulado. Ele mede três coisas contra o gabarito `testes/gabarito/contabil.ts`:

- **acerto**, contado assim:
  - acerto;
  - erro crítico: classificou errado, ou não apontou a anomalia plantada;
  - cartão desnecessário: foi ao cartão num caso que dava para decidir;
  - falha;
- **custo**, em centavos de real, somado de `chamada_modelo`;
- **latência**, com p50 e p90, por execução e por chamada.

O simulado continua o padrão de todos os testes. Nada liga sem a variável de ambiente, e a chave nunca está no código.

```bash
cd pacotes/processos && npm run banco
npm run agentico -- --simulado      # confere o roteiro sem chave (operário de demonstração)

# com o modelo real (gasta dinheiro: cerca de 15 a 25 chamadas por rodada)
HEILD_IA_FORNECEDOR=anthropic HEILD_DOLAR_REAIS=5.40 ANTHROPIC_API_KEY=... npm run agentico
```

| Variável | Para quê |
| --- | --- |
| `HEILD_IA_FORNECEDOR=anthropic` | Liga o `FornecedorAnthropic` (`src/operarios/anthropic.ts`). Sem ela, o roteiro recusa rodar sem `--simulado` |
| `ANTHROPIC_API_KEY` | Lida pelo SDK oficial (`@anthropic-ai/sdk`) no ambiente do serviço `operarios`. Um perfil de `ant auth login` também serve |
| `HEILD_DOLAR_REAIS` | Cotação para converter o custo em reais (obrigatória: o orçamento e a bolsa são em centavos de real) |
| `HEILD_IA_ESFORCO_OPERARIO` / `_ESCRITOR` / `_REVISOR` | Esforço por classe (padrões `low`, `medium` e `high`). A escolha final é da frente de IA |
| `HEILD_AGENTICO_REPETICOES` | Quantas rodadas por caso, para medir a variância |

Como o fornecedor real chama o modelo:

- **Modelos pela decisão 3 do dono:** `claude-sonnet-5-5` como operário e escritor, `claude-opus-5-5` como revisor. Os preços de tabela são convertidos pela cotação. Trocar o modelo de um contrato é configuração (`porContrato`).
- **Saída estruturada pelo próprio esquema Zod do contrato** (`betaZodOutputFormat`), e o runner valida de novo.
- **A instrução fixa vai no `system`** (prefixo estável), e só a entrada do contrato vai no `user`, com o conteúdo de fora envelopado como dado.
- **Fallback de recusa do lado do servidor ligado** (`fallbacks: "default"`). Recusa ou corte por `max_tokens` vira saída nula: o validador barra e o motor escala ou cria o cartão.
- **O pedido sai com 4× o teto de saída do contrato**, para o raciocínio adaptativo. A **reserva de orçamento conta o mesmo valor** (`multiplicadorSaida`).
  - Se o orçamento de um procedimento não comportar o custo real, a execução para em `parcial`, e o roteiro mostra isso como `falha`. É o sinal para revisar o `orcamento` do procedimento com o número medido.

O roteiro sai com código 1 se houver **qualquer erro crítico** (critério do dono: o erro custa mais que tudo). O relatório completo fica em `relatorios/agentico-<data>.json`, fora do git. No simulado, a última conferência deu 0 erro crítico, 80% de acerto no CTB-COMPETENCIA-DOC (os 20% restantes foram ao cartão, onde o certo era decidir) e 100% no CTB-ECD-TRANSMITIR. Esses números só provam que o roteiro funciona; os que valem são os do modelo real.

**Primeira rodada real (15/11/2026, autorizada pelo dono):**

- 33 execuções com o Claude (`claude-sonnet-5-5` como operário e escritor);
- **100% de acerto e zero erro crítico** nos dois procedimentos; os dois casos em que o certo é não decidir pararam no cartão todas as vezes;
- R$ 0,81 debitados (≈ US$ 0,15), com um custo pela tabela de preços de ≈ US$ 0,09;
- chamada de modelo com p50 de 1,6 s e p90 de 2,3 a 3,9 s; execução com p50 de 6 s;
- resumo em [`relatorios/agentico-2026-11-15-real.md`](relatorios/agentico-2026-11-15-real.md).

O gabarito tem dez casos de competência (oito decidíveis e dois em que o certo é **não** decidir) e uma ECD com uma anomalia plantada (adiantamento a sócios que sobe 900%). A frente de IA amplia com casos reais anonimizados e com cartões editados por pessoas (02, 14.2), e é com esse conjunto que roda o piloto pré-registrado (AVALIAÇÃO, 11).

### O encaixe com a B1 (ligado)

A B2 roda **dentro da API da B1** e pelo **executor dela**. O pedido de processo segue este caminho:

```
POST /v1/ferramentas/contabil.ecd.conferir_e_transmitir   (Idempotency-Key)
  → executor da B1: Zod, autorizar (a mesma da tela), idempotência
  → operação procedimentos.CTB-ECD-TRANSMITIR.iniciar: pedirJob('procedimento.iniciar') + evento do pedido
  → na MESMA transação: idempotência, evento na cadeia e job no pg-boss
  → 202 { resultado: 'em_execucao', execucao_id }
worker da B2 → abre a execução com esse id → passos → cartão
POST /v1/ferramentas/aprovacao.decidir → motor da B2 retoma → transmissão → eventos na mesma cadeia
```

| Peça da B1 | O que a B2 ligou |
| --- | --- |
| `enfileirarNaTransacao` (`servidor/src/executor/jobs.ts`) | Com a fila ligada (`ligarFila`), cada `pedirJob` vai para o pg-boss pela mesma conexão e o mesmo commit (`bossNaTransacao`). Sem fila ligada, continua recusando a transação inteira |
| Eventos gravados pelo executor | `despacharEventos` (chamado em `aplicar`, depois da cadeia) enfileira o despacho de cada evento, na mesma transação. Os gatilhos da B2 veem os eventos das telas. O teste prova com um `documentos.criar` pela API |
| Catálogo tipado (`@heild/dominio`) | `registrarFerramentaTipada`, que é só acréscimo. Cada procedimento vira uma ferramenta de escrita e entra em `/v1/ferramentas`, no OpenAPI e em `servidor/contratos/`. A operação de servidor que ela chama fica no registro de operações. Os dois são feitos em `servidor/src/b2.ts` |
| `aprovacao.decidir` | Na rota, o cartão com `execucao_id` (ou de memória do setor) vai ao motor da B2, que confere a pessoa e o `pode_aprovar` e retoma a execução. O vocabulário da B1 (`aprovado`, `recusado`, `editado_e_aprovado`) é aceito. Os outros cartões seguem o executor da B1 |
| Ferramentas do motor | `execucao.obter`, `execucao.retomar`, `procedimento.listar`, `validador.executar` e `memoria.propor` são servidas pela mesma rota `/v1/ferramentas/{nome}`, com a sessão da B1 e o envelope do AGENTICO 8 |
| Banco | O pg-boss do processo da API conecta como `app_api` no modo produtor: só enfileira, sem criar esquema, migrar ou supervisionar. O worker, dono do esquema `pgboss`, concede só DML na fila ao `api_executor` e ao `app_api` (`concederFila`). Os gatilhos de imutabilidade da B2 respeitam a restauração da demonstração (`heild.restaurando`) |

Para rodar tudo junto localmente:

```bash
npm run preparar -w @heild/servidor      # banco heild com a semente (B1)
npm run worker -w @heild/processos       # worker da B2: filas, passos, operários, despachante
npm run dev                              # API da B1 com a fila ligada (sem worker, sobe sem as operações de processo)
```

O teste `servidor/test/b2-ponta-a-ponta.test.ts`, na suíte da B1, roda a API (login `app_api`, pg-boss produtor) e o worker da B2 lado a lado. Ele prova:

- as operações de processo no catálogo, no OpenAPI e na lista de ferramentas;
- **o caminho inteiro:**
  - 202 com o id;
  - o evento do pedido na cadeia;
  - a repetição pela mesma chave, que devolve a mesma execução;
  - o cartão só para a pessoa (o integrante recebe 403);
  - a aprovação pela API e uma transmissão só, com o `aprovacao_id` no evento;
  - `auditoria.verificar_cadeia` conferindo os eventos da B1 e da B2 juntos;
- pessoa sem o setor recebe 403 na hora, sem execução;
- um documento criado pela API acorda o gatilho da B2, que classifica a competência sem modelo e com `causado_por_evento_id`.

Ainda mínimos, para trocar quando a B1 entregar o equivalente:

- `carregarPerfil` (`src/contexto.ts`), que deve passar a usar `perfilDeConta`;
- `autorizarFerramenta` (`src/dominio.ts`) para as ferramentas da B2 fora do catálogo do wireframe;
- o token de integrante de 15 minutos no MCP.

### Desvios do desenho, e por quê

| Desenho | Na B2 | Por quê / quando muda |
| --- | --- | --- |
| Lote: um job por raia e consolidação por contador (AGENTICO 4.2) | Não implementado; um operário por passo | Os dois procedimentos de referência não precisam. Entra com o primeiro procedimento de lote (fechamento, extratos) |
| Passos `escrever` e `revisar` (modelo caro sobre o compacto) | Não há tipo próprio. A escalada usa a classe `escritor` no mesmo contrato | Os contratos, os prompts e a política de revisão são da frente de IA. O runner já escolhe o modelo pela classe |
| Serviço `operarios` separado, com a chave do fornecedor (ARQUITETURA 1) | Fila própria (`operario.executar`), no mesmo processo nos testes | Basta subir só o consumidor dessa fila em outro processo. Não há chave ainda |
| Admissão retoma a vaga depois do cartão | Execução aprovada volta direto a `executando`, sem passar de novo pela fila | Simplicidade: o cartão já foi uma espera humana. Rever se a carga mostrar disputa |
| Bolsa do plano da pessoa | Linha `bolsa_setor` com setor `pessoa:{usuario_id}` | Não há tabela de plano ainda. O pagador e o débito já são os definitivos |
| Idempotência guardada por chave | Guarda a chave de quem abriu a execução. Um pedido igual em andamento, com outra chave, recebe a mesma execução, mas essa outra chave não fica guardada | Uma tabela de chaves por execução resolve. O efeito continua protegido pela chave natural |
| Motor conecta como superusuário nos testes | O pg-boss cria o próprio esquema; o domínio roda como `api_executor` por transação | Em produção, um login próprio do worker, dono do esquema `pgboss`, que só assume `api_executor` |
| Limite de taxa por ator e timeouts de HTTP (PADROES.md, API4) | As rotas MCP da B2 só fixam o corpo em 2 MB | O limite de taxa e os timeouts de HTTP são do app da B1, que monta as rotas (`limites.ts`). Os tetos do banco (5 s, 3 s e 10 s), a validação da resposta externa (API10), o cartão no fluxo sensível (API6), o trabalho longo na fila e a RLS em toda tabela nova já seguem o [`PADROES.md`](PADROES.md) |

### O que falta (depois da B2)

- Pôr no OpenAPI as ferramentas do motor (`execucao.*`, `procedimento.listar`, `validador.executar`, `memoria.propor`). Hoje elas aparecem em `GET /v1/ferramentas` e respondem pela rota, mas não estão no retrato dos contratos.
- Montar o MCP (`rotasMcp`) no app da B1, com o token de serviço e o de integrante dela.
- Token de integrante (15 minutos) e fila do integrante com espera longa e pulso (`/v1/interno/fila/integrantes/pegar`): a fila já existe em `item_fila`, mas falta a rota.
- SSE do progresso da execução (`ProgressoTrabalho`).
- `contexto.carregar` e `cliente.resolver`.
- Lote por raias. Casos de gabarito por procedimento, com cartões editados virando casos.
- Rodar o teste agêntico real com a chave e ajustar os orçamentos dos procedimentos pelo custo medido. Prompts, modelo final por classe e política de revisão (frente de IA). Conectores reais e cofre (sessão futura).
- Medir sob carga: vazão da admissão e dos passos, e a disputa no elo da cadeia com muitos eventos por escritório.
