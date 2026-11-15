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

> **B5 (15/11/2026):** a F1 abaixo foi feita, e os desvios da tabela acima de sincronização, patch livre, cache do perfil, `evento_leitura`, SSE e JWT do Supabase foram resolvidos. Ver a seção B5.

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

---

## B3 · Integrantes dos setores

**16/11/2026 · branch `be3-integrantes` → `backend`.** Os integrantes de IA de cada setor do Contábil sobre o motor da B2, com o Assistente na porta do chat e a avaliação automatizada. Implementa as oito decisões do Enzo (`docs/integrantes/DECISOES.md`, branch `wf-integrantes-pesquisa`) sem reabrir nenhuma. Tudo local, no mesmo Postgres; o simulado é o padrão de todos os testes, e o modelo real só liga por variável de ambiente.

### Resumo

1. **Contrato padrão de integrante** (`pacotes/integrantes/src/contrato.ts`). Um integrante é uma **configuração compartilhada** pelo setor: identidade, procedimentos, o **pacote de ferramentas** permitidas (catálogo tipado e operações de processo, resolvidos pela mesma `autorizar`), papéis de modelo, limite de execuções simultâneas (10), limite de segundo plano por pessoa (3), limiar de confiança (0,9) e se pergunta "Para quem quer rotear esta atividade?". `definirIntegrante` recusa, como o CI recusaria: ferramenta de outro setor no pacote, passo que usa ferramenta fora do pacote, irreversível sem aprovação `sempre`, operário que devolve confiança sem conferi-la com limiar ≥ o do integrante, e escalada ao escritor sem o papel.
2. **Resposta padrão** (`src/resposta.ts`, Zod estrito, `heild.resposta@1`). Todo integrante e o roteamento respondem no mesmo formato: tipo (`concluido`, `aguardando_aprovacao`, `nao_consegui`, `na_fila`, `em_execucao`, `falhou`, `cancelado`, `pergunta`, `sem_procedimento`, `negado`), título, texto, cartões visuais, a ação que espera uma pessoa, opções, dados, origem, custo, confiança e se escalou. O texto é **do sistema**, por processo (`apresentar` de cada procedimento) e por tipo (`TEXTO_PADRAO`); nenhum modelo escreve a resposta.
3. **Integrantes do Contábil**, um por setor (`src/integrantes.ts`), cada um com o seu pacote, as regras de roteamento e o formato do processo:

   | Integrante | Setor | Procedimentos | Aprovação |
   | --- | --- | --- | --- |
   | Contábil | `contabil` | CTB-COMPETENCIA-DOC e CTB-ECD-TRANSMITIR (os de referência da B2) | por regra; ECD sempre |
   | Fiscal | `fiscal` | **FIS-GUIA-CONFERIR** (tributo e competência pelo operário só sem código de receita; o código confere o valor com a apuração; enviar ao cliente é irreversível) e **FIS-CAIXA-POSTAL-TRIAR** (categoria e prazo tirado das datas do texto) | guia sempre; caixa postal por regra |
   | DP | `dp` | **DP-EVENTO-FOLHA** (tipo, competência e quantidade, cada um entre as opções do texto) | por regra (`dp.evento.lancar`) |
   | Societário | `societario` | **SOC-ALTERACAO-TRIAR** (tipo de alteração; a tabela do setor decide se exige Junta) | por regra (`legalizacao.abrir_processo`) |
   | Atendimento | `gestao_atendimento` | **GES-FAQ-RESPONDER** (liga a mensagem a uma pergunta da base; vai ao cliente o **texto aprovado**, nunca um texto do modelo; a base é memória do setor) | sempre (`conversa.responder`) |

   "Gestão e Atendimento" é **um setor só** no catálogo (`gestao_atendimento`), com o integrante Atendimento do wireframe.
4. **Fábrica de procedimentos de escolha** (`src/escolha.ts`). Os cinco procedimentos novos têm o mesmo caminho em código: ler o documento do cliente → o código extrai as opções (e decide por regra quando dá) → o operário escolhe **entre** as opções → validadores (opções, confiança, regras do setor) → aprovação → efeito → concluir. Validadores novos: `escolha_nas_candidatas`, `valor_confere_apuracao`, `faq_respondivel`, `competencia_passada_ou_atual`.
5. **Assistente e roteador** (`src/assistente.ts`, `src/roteador.ts`). Cascata: **regras** (tipo do documento anexado e expressões de cada procedimento) → **modelo barato** (Haiku, decisão 4) → **modelo caro** (Sonnet) só quando o barato fica abaixo do limiar ou marca "ambíguo" → se ainda houver dúvida, **pergunta à pessoa** com as opções. O modelo só escolhe entre procedimentos que a pessoa pode iniciar (a mesma `autorizar`); escolha fora das opções nunca é aceita. O Assistente **encaminha sem reescrever**: a resposta que ele devolve é o objeto do integrante (o teste compara o hash). Cada decisão vai para `pedido_assistente` e para a **cadeia de eventos** (`assistente.rotear`, com camada, procedimento, confiança e as camadas que rodaram; o texto do pedido não vai à cadeia, só hash e tamanho). Roteamento com modelo vai para a fila `assistente.rotear`: o pedido HTTP nunca espera modelo.
6. **Execução** (`src/execucao.ts`). `instalarIntegrantes` grava o integrante compartilhado por setor, o limite de simultâneas do setor em `limite_execucao` e as bolsas. Prioridade chat > evento > job e isolamento por execução são do motor da B2 (provados de novo aqui com os integrantes). `iniciarPeloIntegrante` só aceita procedimento do pacote (decisão 2) e pergunta "Para quem quer rotear esta atividade?" no evento e no job quando o integrante está configurado assim (o Fiscal está). `aprenderComCartao` transforma a correção de uma pessoa num cartão "não consegui" em **proposta** de memória do setor (decisão 6); só quem gere o setor ou o Administrador aprova.
7. **Modo sombra no motor da B2** (`OpcoesInicio.sombra`, coluna `execucao.sombra`). O procedimento roda inteiro, mas o **efeito roda num savepoint sempre desfeito**, o passo externo nunca chama o órgão, nenhum cartão é criado e o integrante não é acordado. A sombra nunca se junta a uma execução de verdade (o hash da entrada leva a marca). Só código liga a sombra; nenhuma entrada de API a aceita.
8. **Avaliação automatizada** (`src/avaliacao/`). Gabarito por setor (36 casos, com casos em que o certo é **não** decidir) rodado em sombra; relatório com acerto, erro crítico, cartão desnecessário, falha, custo e latência **por setor e por papel**; comparação com o que a pessoa fez (`comparacao_sombra`, `iniciarSombra`, `registrarDecisaoDaPessoa`, `resumoSombra`); **margem de −3 pontos** na taxa de erro contra a pessoa (AVALIAÇÃO 11.4); **portão do Haiku**: o Haiku só fica num contrato se, no mesmo gabarito, tiver zero erro crítico e acertar todo caso em que o Sonnet acertou. O mesmo portão vale para o roteador barato.
9. **Débito em frações de centavo.** As colunas de centavos viraram `numeric(18,6)` e `centavosDe` deixou de arredondar cada chamada para o centavo de cima. A reserva antes da chamada e o acerto depois continuam iguais, agora exatos. O teste real de 15/11 debitava cerca de 60% a mais por causa do arredondamento.
10. **Na API da B1**: as operações de processo dos cinco setores entram no catálogo tipado, no OpenAPI e em `/v1/ferramentas`; `assistente.pedir`, `assistente.obter`, `integrante.listar` e `integrante.aprender` são servidas pela mesma rota `/v1/ferramentas/{nome}` (extensão do `criarProcessos`, sem porta nova). O worker que roda com a API passa a ser o dos integrantes (`npm run worker -w @heild/integrantes`).

### Como rodar e testar

```bash
npm run typecheck        # servidor + B2 + B3
npm run lint             # oxlint (a mesma configuração do app) na B2 e na B3
npm run test:b3          # B3: 46 testes contra Postgres real (banco heild_b3_teste, recriado)
npm run test:b2          # B2: os 38 de antes, verdes com a sombra e as frações de centavo
npm test                 # B1: 68 testes, com o ponta a ponta da B3 pela API

cd pacotes/integrantes
npm run banco            # banco heild_b3 com todas as migrações (--recriar zera)
npm run avaliar -- --simulado
# real (gasta dinheiro; a chave fica só no ambiente do processo):
HEILD_IA_FORNECEDOR=anthropic HEILD_DOLAR_REAIS=5.40 HEILD_TETO_USD=3 HEILD_AVALIACAO_CASOS=1 ANTHROPIC_API_KEY=... npm run avaliar
```

| Variável do roteiro `scripts/avaliar.ts` | Para quê |
| --- | --- |
| `HEILD_TETO_USD` | Teto da rodada; o roteiro para assim que o gasto medido passa |
| `HEILD_AVALIACAO_CASOS` | Casos por setor (rodada pequena para estimar); padrão, todos |
| `HEILD_AVALIACAO_REPETICOES` | Repetições de cada caso |
| `HEILD_AVALIACAO_SETORES` | Só estes setores |
| `HEILD_AVALIACAO_PORTAO=1` | Roda o portão do Haiku em cada contrato de operário |
| `HEILD_AVALIACAO_ROTEAMENTO=1` | Roda o gabarito de roteamento e o portão do roteador barato |

| Arquivo em `pacotes/integrantes/testes/` | O que prova |
| --- | --- |
| `contrato.test.ts` (15) | Os cinco setores com integrante; pacote em ordem fixa e só do setor; o que `definirIntegrante` recusa; resposta padrão estrita e texto do sistema; regras de roteamento contra o gabarito (quais decidem por regra e quais sobem ao modelo); débito sem arredondar; extração por código; classificação de erro, margem e portão do Haiku |
| `setores.test.ts` (10) | Cada procedimento novo de ponta a ponta. Guia: cartão **sempre**, mesmo com "executa sozinho", saída com os argumentos aprovados e o evento apontando o cartão; código de receita decide sem modelo; valor divergente da apuração para no cartão "não consegui" sem escalar. Caixa postal por regra do escritório. DP: quantidade inventada é barrada, escala uma vez e termina no cartão. Societário e a tabela da Junta. FAQ: vai ao cliente o texto aprovado da base, e a base vem da memória do setor. Pessoa sem o setor é negada e a negação fica na trilha |
| `assistente.test.ts` (9) | **Ponta a ponta**: chat → regra → integrante do Fiscal → procedimento → cartão → aprovação → resposta padrão → Assistente, com o objeto idêntico ao do integrante e a decisão na cadeia (sem o texto). Modelo barato decidindo pela fila, com o custo do roteamento em frações de centavo na bolsa `assistente`. Barato em dúvida sobe ao caro; os dois em dúvida viram pergunta. Escolha fora das opções nunca é aceita. Sem saldo, nenhum modelo é chamado. Falta de anexo vira pergunta; pedido de outra pessoa não se lê; integrante não conversa com o Assistente; idempotência por chave; a mesma porta do registro de ferramentas |
| `execucao.test.ts` (6) | Limite de 10 por setor vindo do contrato do integrante, com a posição na fila; prioridade chat > evento > job; vinte execuções paralelas isoladas; o integrante só inicia procedimento do pacote; "Para quem quer rotear esta atividade?" no evento do Fiscal, com o cartão para a pessoa escolhida e o custo na bolsa do setor; correção no cartão "não consegui" vira proposta de memória que só quem gere aprova |
| `avaliacao.test.ts` (6) | O gabarito inteiro em sombra sem nenhum efeito (nenhum cartão, documento, envio ao órgão nem evento de efeito); um operário que erra aparece como erro crítico e fora da margem; a sombra do dia a dia contra a decisão da pessoa; o portão do Haiku bloqueando e liberando, e devolvendo a configuração ao estado anterior |
| `servidor/test/b3-assistente.test.ts` (3) | O mesmo ponta a ponta **pela API da B1**, com o worker dos integrantes ao lado e a cadeia conferindo no fim |

### Avaliação real (15/11/2026, autorizada pelo dono)

108 execuções em sombra com o Claude (`claude-sonnet-5-5` como operário e escritor), mais o portão do Haiku e o roteamento:

- **98,1% de acerto e zero erro crítico** nos cinco setores; os casos em que o certo é não decidir pararam no cartão todas as vezes;
- roteamento: 11 de 11, com 7 decididos por regra, 3 pelo Haiku e 1 virando pergunta à pessoa;
- portão do Haiku: os oito contratos liberados neste gabarito (a configuração **não** foi trocada; ver o relatório);
- custo da sessão: R$ 1,80 (≈ US$ 0,33), com débito em frações de centavo;
- resumo e as decisões para a frente de IA em [`relatorios/integrantes-2026-11-15-real.md`](relatorios/integrantes-2026-11-15-real.md).

### Onde mora cada coisa

```
pacotes/integrantes/                @heild/integrantes
  src/contrato.ts                   definirIntegrante, Anexos, PacoteProcedimento
  src/resposta.ts                   RespostaPadrao (Zod) e os textos fixos por tipo
  src/escolha.ts                    a fábrica dos procedimentos "ler e escolher" e a extração por código
  src/setores/                      fiscal.ts, dp.ts, societario.ts, atendimento.ts (contratos e procedimentos)
  src/integrantes.ts                os cinco integrantes, com pacote, regras e formato de cada processo
  src/validadores.ts                validadores da B3 (no registro da B2)
  src/roteador.ts                   a cascata (regras, barato, caro) e a cobrança do roteamento
  src/assistente.ts                 pedir, rotear (fila), obter; encaminhar sem reescrever
  src/responder.ts                  execução → resposta padrão do integrante
  src/execucao.ts                   instalar, iniciar pelo integrante, aprender com o cartão
  src/extensao.ts                   a B3 como extensão do criarProcessos (ferramentas, fila, worker)
  src/avaliacao/                    avaliar (sombra), relatorio, portao (Haiku), sombra (dia a dia), gabarito
  scripts/avaliar.ts, scripts/worker.ts
app/supabase/migrations/20261116090000_b3_integrantes.sql
```

### Desvios e limites

| Desenho | Na B3 | Por quê / quando muda |
| --- | --- | --- |
| Roteador vê o pedido | Vê só o texto do pedido e o tipo do documento anexado, não o conteúdo do documento | Menos dado de cliente no modelo e menos custo. Decisão da frente de IA (perguntas abaixo) |
| Quem paga o roteamento | Bolsa `assistente` do escritório (o setor ainda não é conhecido) | Decisão 5 fala da bolsa do setor; antes do roteamento não há setor. Pergunta abaixo |
| Revisor Opus | O papel existe e é conferido no contrato, mas nenhum procedimento usa revisão ainda | A política de revisão é da frente de IA. O runner já escolhe o modelo pela classe |
| Sombra paga modelo | A sombra debita da bolsa do setor | Medir custa. Uma bolsa própria do piloto é uma linha de `bolsa_setor` |
| Correções aprendidas | A proposta de memória `correcao:*` é gravada depois de aprovada, mas nenhum procedimento a lê ainda (o GES-FAQ lê a base `faq`) | Como cada procedimento usa a correção é decisão de conteúdo da frente de IA |
| Efeitos dos procedimentos novos | Gravam a decisão no `documento.metadados`; não há conector real de envio (WhatsApp, Junta, folha) | Os conectores são de uma sessão futura. O cartão e a trilha já são os definitivos |
| Gabarito | 36 casos fictícios | O piloto pré-registrado pede 400 a 700 por estrato, com casos reais anonimizados (AVALIAÇÃO 11.5) |

---

## B5 · Fase F1: núcleo pela API (entrega E1)

**15/11/2026 · branch `be5-f1-fundacao` → `backend`.** Fecha a F1 (ARQUITETURA 7) e o que a entrega E1 pede (ORDEM_DE_IMPLEMENTACAO 2.1), sem escopo novo. Tudo local: o mesmo Postgres 16 da B1 (porta 54329), Node 24 e o app no Vite com `VITE_HEILD_BANCO=api`. Nada foi aplicado em projeto Supabase: o projeto do backend em São Paulo ainda não existe (depende do dono), e a migração **não** vai para o HEILD-PROD, que é do wireframe. O caminho para aplicar no projeto novo está pronto (abaixo).

### Resumo, pelos sete itens

1. **`sincronizar` por classes, filtrado pela regra de leitura.** `GET /v1/sincronizar?classes=1,2` (padrão `1,2`; a classe 3 é recusada com 400) traz a configuração e o trabalho aberto, linha a linha pela mesma `podeLerLinha` que o SSE e a leitura tipada usam: setor e carteira pela função `autorizar` no nível ler, exceção por tela, o que é da pessoa (aviso, conversa interna privada) e, no app do cliente, só o que é do cliente dela, com as contas da equipe reduzidas a nome e papel. A classe 2 vem na janela (tarefa aberta ou fechada há 60 dias; cartão pendente ou decidido há 30), no SQL. Com `desde`, só o que mudou, e a linha que mudou e saiu do escopo da pessoa vem em `removidas`. Nada do escritório inteiro.
2. **Repositórios do frontend como clientes das ferramentas tipadas; o patch livre acabou.** As 19 entidades da F1 têm ferramentas de entidade geradas de uma declaração só (`x.criar`, `x.atualizar({ x_id, campos })` com os campos **editáveis**, `x.arquivar`, `x.desarquivar`, `x.excluir` onde a regra deixa, `x.reordenar`), com Zod estrito e os `check` do banco como enum. O adaptador `api` passa cada chamada de repositório pelo tradutor (`app/src/nucleo/banco/traducao.ts`) e manda `POST /v1/ferramentas/{nome}`; os ids gerados pela tela e a frase do evento vão no envelope `heild_tela`. O servidor recusa por `/v1/operacoes` toda operação genérica das tabelas da F1 (`USE_FERRAMENTA_TIPADA`, com `acao_sugerida` já montada) e, pela escrita direta de linhas, a mudança de campo não editável. Desfazer é a operação inversa: o editável volta por `x.atualizar`, o status pela transição dele. O catálogo tipado foi de 34 para 75 ferramentas (as 27 da B1, as operações de processo da B2 e da B3 e as 41 novas da F1), e o retrato dos contratos tem mais 9 do motor e do Assistente.
3. **`useConsulta` e SSE, com cursor em toda listagem.** `GET /v1/eventos/fluxo` (SSE) manda `{ tabela, ids, versao }` só do que a pessoa leria; cada instância lê a cauda de mudanças a cada 400 ms. O app lê o SSE com `fetch` (precisa do token) e pede o delta das classes 1 e 2 ou avisa as consultas da classe 3. O hook `useConsulta(tabela, filtro)` lê evento e mensagem interna pela ferramenta de lista, com cursor, e os 12 pontos de tela da F1 que liam essas tabelas inteiras passaram a ele. Toda lista tipada é por cursor (nunca `offset`), e os totais contam na primeira página e seguem no cursor.
4. **Cache do perfil e `evento_leitura`.** O perfil fica em memória por 5 minutos ou até a cauda de mudanças trazer uma linha das tabelas de que ele sai (usuário, vínculo, exceção, carteira, escritório, assinatura), de qualquer instância; a escrita local invalida na hora. Toda leitura tipada e todo `sincronizar` viram uma linha de `evento_leitura` (quem, ferramenta, ids, contagem, filtros), gravada em lote fora da transação da leitura (até 500 ou a cada 2 s) e selada por lote com o hash do lote anterior (`selo_leitura`), sem travar a cadeia do evento (decisão P6).
5. **Autenticação de produção.** O JWT do Supabase Auth (ES256 ou RS256) verificado pelo JWKS do projeto, com emissor `<projeto>/auth/v1` e público `authenticated`; o escritório, a conta e o tipo vêm de `app_metadata`, que o gancho de token em SQL (`heild_interno.gancho_token`) preenche a partir de `conta_auth`. O Administrador só entra com `aal2` (MFA). O token HS256 de demonstração só vale com `HEILD_DEMONSTRACAO=1`. Testado com um emissor de JWKS de teste, sem nuvem.
6. **Contratos.** O OpenAPI 3.1 e o esquema das ferramentas (formato do `tools/list` do MCP) agora trazem também as ferramentas do motor da B2 (`execucao.obter`, `execucao.retomar`, `procedimento.listar`, `validador.executar`, `memoria.propor`) e do Assistente da B3, geradas das mesmas definições, sem banco. O CI (`.github/workflows/backend.yml`) roda typecheck, lint sem aviso, a conferência do retrato (`npm run contratos:conferir`) e as suítes da B1/B5, B2 e B3 contra o Postgres do runner.
7. **Vazamento e fumaça.** O teste de vazamento cobre agora o `sincronizar`, o SSE, a leitura tipada (conversa privada), o JWT de outro escritório e a Data API fechada no banco (`anon` e `authenticated` sem privilégio em tabela nenhuma). A fumaça e os scripts das sessões no modo `api`: ver a tabela abaixo.

### Cobertura das ferramentas do Contábil (API_INTERNA)

A F1 cobre as **operações de entidade** do núcleo que a API_INTERNA lista para o Contábil (5.1 a 5.8, linhas "entidade"; 6.3 e 6.7): tarefas (`tarefa.*` com as transições, `reordenar` e `desarquivar`), clientes (`cliente.*`, com `mudar_estado`, `fundir` e `arquivar`), pessoas e identidades, versões do perfil, obrigações (`criar`, `atualizar`, `cancelar`, `reordenar`), cartões, avisos, conversa e mensagem interna, e a configuração (escritório, assinatura, setores, contas, vínculos, exceções, carteira, convites). As de contexto que dependem só do núcleo também (`evento.listar` com a ficha do registro, `mensagem_interna.listar` das conversas da pessoa). Todas com Zod estrito, erro acionável (código, campo e, quando há, `acao_sugerida`), `validar_apenas` e idempotência pela chave.

Ficam para as fases delas, como o desenho manda: as **operações de processo** (uma por procedimento; as dos integrantes do Contábil já estão no catálogo pela B2 e pela B3), as de **conector** (F4) e as de contexto que leem dado de conector (`captura.saude`, `nota.listar_*`, `folha.listar_totais`). `cliente.resolver`, `pessoa.resolver` e `contexto.carregar` são da F3 (B2, "O que falta").

### Como rodar

Os mesmos passos da B1 (Node 24, Postgres 16 no `PATH` ou em `/usr/lib/postgresql/*/bin`, sem Docker):

```bash
npm install && (cd app && npm install)
npm run preparar -w @heild/servidor      # Postgres local, migrações (com a da B5) e semente
npm run dev                              # API em http://127.0.0.1:8787
cd app && VITE_HEILD_BANCO=api npx vite --port 6100
```

Variáveis novas (todas opcionais no ambiente local):

| Variável | Padrão | Para quê |
| --- | --- | --- |
| `HEILD_SUPABASE_URL` | vazio | URL do projeto Supabase (ou da stack local do `supabase start`). Liga a verificação do JWT de produção pelo JWKS (`<url>/auth/v1/.well-known/jwks.json`, emissor `<url>/auth/v1`, público `authenticated`) |
| `HEILD_SUPABASE_JWKS_URL` | vazio | Outro endereço para as chaves (testes) |
| `HEILD_MFA_PAPEIS` | `administrador` | Papéis que só entram com o segundo fator (`aal2`) |
| `HEILD_DEMONSTRACAO` | `1` | Fora do ambiente local, `0`: o token HS256 de demonstração deixa de valer |
| `HEILD_CACHE_PERFIL_MS` | `300000` | Validade do perfil em cache (0 desliga; os testes de regra usam 0) |
| `HEILD_FLUXO_MS` / `HEILD_FLUXO_POR_CONTA` | `400` / `5` | Intervalo da leitura da cauda de mudanças e conexões de SSE por conta |
| `HEILD_LEITURA_LOTE` / `HEILD_LEITURA_MS` | `500` / `2000` | Lote e intervalo do registro de leituras |

Chamar à mão (o SSE é uma resposta aberta; o `-N` desliga o buffer do curl):

```bash
T=$(curl -s -XPOST localhost:8787/v1/auth/demonstracao -H 'content-type: application/json' \
      -d '{"escritorio_id":"esc-andrade","usuario_id":"u7"}' | jq -r .token)
curl -s "localhost:8787/v1/sincronizar?classes=1,2" -H "authorization: Bearer $T" | jq '.tabelas | map_values(length)'
curl -sN localhost:8787/v1/eventos/fluxo -H "authorization: Bearer $T"
curl -s -XPOST localhost:8787/v1/ferramentas/evento.listar -H "authorization: Bearer $T" \
     -H 'content-type: application/json' -d '{"resultado_ref":"t18","so_linha_do_tempo":false}'
```

### Como testar

```bash
npm test                    # B1 + B5 contra Postgres real (recria heild_teste a cada rodada)
npm run test:b2 && npm run test:b3
npm run typecheck && npm run lint
(cd app && npx tsc --noEmit -p tsconfig.app.json)
npm run contratos:conferir  # o retrato de servidor/contratos está em dia (o CI roda igual)
```

| Arquivo novo em `servidor/test/` | O que prova |
| --- | --- |
| `auth-producao.test.ts` | O JWT do Supabase pelo JWKS (emissor de teste com chave ES256): a conta sai de `app_metadata`; emissor, público, assinatura ou validade errados caem; token sem escritório é `CONTA_SEM_VINCULO`; o Administrador sem `aal2` é `EXIGE_MFA`; conta inativa não entra; a pessoa do cliente; um login da Horizonte não lê a Andrade; fora da demonstração, o HS256 não vale. O gancho de token em SQL põe e tira o vínculo, e o navegador não lê `conta_auth` |
| `sincronizar.test.ts` | Classes (a 3 nunca vem; `classes=3` é 400); o Membro só recebe tarefa dos setores dele; aviso de outra pessoa não chega; conversa privada só para quem participa; carteira ligada tira o cliente e a tarefa dele; exceção por tela que bloqueia a aba tira as linhas do setor; a pessoa do cliente só recebe o cliente dela; no delta, a linha que saiu do escopo vem em `removidas`. Na leitura tipada: conversa pessoal de outros não aparece nem passando o id; o cursor leva o total; `evento.listar` por `resultado_ref` |
| `fluxo.test.ts` | O SSE num servidor HTTP de verdade: o Membro recebe a tarefa do setor dele e não a de outro; outro escritório não recebe nada; uma segunda volta não repete; sem token 401; limite de conexões por conta; conta desativada tem o fluxo desligado. O cache do perfil é invalidado pela cauda (mudança feita por fora da instância). O registro de leituras: a linha com os ids e os filtros, o selo confere e descobre adulteração feita pelo superusuário, lotes simultâneos encadeiam sem buraco, restaurar a demonstração recomeça leituras e selos juntos, o `sincronizar` também fica registrado |
| `ferramentas-tipadas.test.ts` | `/v1/operacoes` recusa a operação genérica da F1 com a ferramenta sugerida; status, setor e responsável não mudam por `tarefa.atualizar` nem pela linha; toda entidade tem as ferramentas declaradas, e os editáveis do núcleo são os do esquema; criar com o id da tela e a frase do evento; a regra do repositório continua mandando; exclusão só onde a regra deixa; o tradutor (transições, mover no quadro, desfazer, mensagem interna, o que não é da F1) e a tradução de uma chamada de tela de ponta a ponta |
| `aplicar-projeto.test.ts` | As travas do caminho de aplicar no projeto novo (projeto pela URL, confirmação, senha do login da API) |

Os testes antigos que mandavam operação genérica de tabela da F1 por `/v1/operacoes` passaram a usar a ferramenta tipada (é o comportamento novo, de propósito), e o `isolamento.test.ts` ganhou a Data API fechada no banco.

**Resultado (15/11/2026):** 124 testes da API (B1 e B5) verdes em três rodadas seguidas, contra o Postgres local com RLS; 38 da B2 e 46 da B3, sem mudança nelas. Typecheck e lint sem aviso (o `npm run lint` passou a cobrir também `servidor/`, `pacotes/dominio` e o que a B5 escreveu no app, com `--deny-warnings`).

**Planos das consultas novas** (`EXPLAIN ANALYZE` com a semente): a ficha de um registro (`evento.listar` por `resultado_ref`) usa `evento_por_ref`; a cauda do SSE são duas buscas, pela chave `(escritorio_id, versao)` e por `mudanca_recentes`; as listas de mensagem interna por conversa e de tarefa por setor têm índice próprio (com a semente, pequena, o Postgres ainda prefere a varredura). O `sincronizar` lê por tabela, com a janela da classe 2 no SQL.

### Onde mora cada coisa

```
app/src/nucleo/permissoes/leitura.ts            classes de tabela, janela, podeLerLinha (navegador e servidor)
app/src/nucleo/permissoes/ferramentas-entidade.ts as entidades da F1 e os campos editáveis (dado puro)
app/src/nucleo/banco/traducao.ts                o tradutor: chamada de repositório → ferramenta tipada
app/src/nucleo/banco/api.ts                     adaptador api: ferramentas, sincronizar por classe, delta, SSE, consultar
app/src/nucleo/consulta.ts                      useConsulta
pacotes/dominio/src/ferramentas-entidade.ts     os esquemas Zod gerados das declarações
pacotes/dominio/src/cadeia.ts                   + o selo dos lotes de leitura
servidor/src/auth/sessao.ts, cache-perfil.ts    JWT por JWKS, MFA, cache do perfil
servidor/src/executor/sincronizar.ts            sincronizar por classes
servidor/src/fluxo.ts                           SSE e a cauda de mudanças
servidor/src/leituras.ts                        registro de leituras e verificação dos selos
servidor/src/banco/aplicar-projeto.ts           aplicar no projeto Supabase novo
app/supabase/migrations/20261117090000_b5_fundacao.sql
.github/workflows/backend.yml
```

### O banco (migração `20261117090000_b5_fundacao.sql`)

- `conta_auth` (login do Supabase → conta do escritório) e `heild_interno.gancho_token(jsonb)`, o *custom access token hook*. RLS forçada; o navegador não lê; só o papel do servidor do Auth lê para montar o token.
- `mudanca`: a cauda que o SSE lê. Gatilho **por comando** (tabelas de transição) em toda tabela com `versao_linha`, uma inserção em lote por comando. `heild_interno.limpar_mudancas()` guarda 2 dias.
- `evento_leitura`, particionada por mês (`heild_interno.criar_particao_leitura`, mais uma partição padrão), e `selo_leitura`. Só de inserção (gatilho), RLS forçada, FK para o escritório.
- Índices das listas novas (mensagem interna por conversa, tarefa por setor e status, por cliente, evento por cliente e por `resultado_ref`, cartão por status).
- **Data API fechada no banco:** `anon` e `authenticated` perdem todo privilégio em tabela do `public` (o `api_executor` tem os dele). Toda migração nova que criar tabela revoga também; o teste confere.

### Aplicar no projeto novo (quando ele existir)

1. Criar o projeto em **sa-east-1** (P4) e pegar a conexão do painel (Connect › direta ou *session pooler*).
2. Conferir sem mudar nada, depois aplicar:
   ```bash
   HEILD_PG_URL_ADMIN='postgres://postgres.<ref>:<senha>@aws-0-sa-east-1.pooler.supabase.com:5432/postgres' \
   HEILD_CONFIRMAR_PROJETO=<ref> npm run aplicar-projeto -w @heild/servidor
   HEILD_PG_URL_ADMIN=... HEILD_CONFIRMAR_PROJETO=<ref> HEILD_PG_SENHA_API=<24+ caracteres> \
     npm run aplicar-projeto -w @heild/servidor -- --aplicar
   ```
   Recusa se o `<ref>` não bater, se o banco já tiver o esquema do app sem o registro da ferramenta (a marca do projeto do wireframe) e se faltar a senha do login `app_api`. Não aplica `00_supabase_local.sql`.
3. No painel: **Authentication › Hooks › Custom Access Token** → `heild_interno.gancho_token`; **MFA (TOTP)** ligado; **Settings › API › Data API** desligada.
4. Na API: `HEILD_SUPABASE_URL=https://<ref>.supabase.co`, `HEILD_DEMONSTRACAO=0`, `HEILD_PG_URL_API` com o login `app_api`.
5. Critério da E1, contra o projeto de **homologação** (ou um branch dele; nunca o de produção):
   ```bash
   HEILD_TESTE_URL_ADMIN='postgres://postgres.<ref>:<senha>@aws-0-sa-east-1.pooler.supabase.com:5432/postgres' \
   HEILD_CONFIRMAR_PROJETO=<ref> HEILD_PG_SENHA_API=<a mesma do passo 2> npm test -- test/isolamento.test.ts test/sincronizar.test.ts test/fluxo.test.ts
   ```
   O modo remoto do `globalSetup` aplica as migrações pelo mesmo caminho do passo 2, recusa projeto com escritório que não seja de demonstração, semeia os dois escritórios de exemplo e conecta a API como `app_api`, com TLS. Depois, a fumaça: a API com `HEILD_PG_URL_API` do projeto e `HEILD_DEMONSTRACAO=1` (homologação), o app com `VITE_HEILD_BANCO=api` e `node scripts/fundacao-fumaca.cjs`. Alguns testes de barreira usam poder de superusuário (adulterar a cadeia, desligar gatilho); no Supabase o papel `postgres` não é superusuário, e esses podem precisar de ajuste quando rodarem lá pela primeira vez.

### A fumaça e os scripts das sessões no modo `api`

Rodados com a API e o Vite no ar (`VITE_HEILD_BANCO=api`), um por vez, com a semente regravada no servidor antes de cada um, depois de todas as correções. A coluna B1 é o resultado registrado na seção B1.

| Script | B1 (`api`) | B5 (`api`) | Observação |
| --- | --- | --- | --- |
| `fundacao-fumaca.cjs` | passa | **passa** (26 ok) | Três rodadas seguidas verdes, depois da correção do integrante de outro escritório (abaixo) |
| `s01-inicio` | 37 ok | **37 ok** | |
| `s02-painel-a` | 28 ok, 1 falha | **29 ok** | O script confere o cliente novo pela própria API quando `URL_API` está definido (no modo local, segue lendo o `localStorage`) |
| `s03-painel-b` | 53 ok | **53 ok** | |
| `s04-painel-c` | 43 ok | **43 ok** | |
| `s05-crm-interna` | 42 ok | **42 ok** | |
| `s06-timesheet` | 76 ok | **76 ok** | |
| `s07-financeiro` | 72 ok | **72 ok** | |
| `s08-bpo` | 49 ok, 2 falhas | **51 ok** | |
| `s08a-bpo-visao` | 76 ok | **76 ok** | |
| `s08b-operacao` | 39 ok, 2 falhas | 39 ok, 2 falhas | **As mesmas duas da B1, com a mesma causa, aceita pelo desenho.** `bpo.relatorio_mensal` exige aprovação se for integrante: o servidor devolve o cartão (202) em vez de gravar o rascunho, e o passo "o Gestor aprova o rascunho" não acha rascunho. A outra é o rótulo do integrante ("Contas a Pagar", o oficial do servidor, contra o "(integrante)" que a tela montava). Muda quando o cartão do executor rodar o comando aprovado (ver "O que falta") |
| `s08c-aprovacoes` | 36 ok, 1 falha | **37 ok** | |
| `s09-arquivos-config` | 47 ok, 1 falha | 47 ok, 1 falha | **A mesma da B1, aceita pelo desenho:** a pessoa convidada (situação "convidado") aceita o convite e a tela grava em nome dela; a API não entra com conta inativa. No produto, aceitar o convite é o fluxo do Supabase Auth, que cria o login e a linha de `conta_auth` |
| `s10-app-cliente` | 41 ok | **41 ok** | |

**O que as rodadas acharam e foi corrigido:**

- **Campos legítimos que o esquema ainda não aceitava,** trazidos do que a tela grava e dos `check` do banco: competência MM/AAAA, origem da tarefa, `quem_conclui` e `conversa_id` editáveis, `lida_por` e o setor livre do aviso, `ultimo_acesso` na criação da conta, o cartão que nasce pendente.
- **O patch levava a linha inteira:** o tradutor passou a mandar só o que muda e a tirar os campos da transição (hora do status, quem concluiu), que vão pela ferramenta da transição.
- **Id escolhido pela tela:** a criação aceita o id de quem cria (AIP-133); antes, o servidor criava com outro id e a aprovação seguinte não achava o cartão (s07).
- **Desfazer uma exclusão** recria a linha como era (s09).
- **Cadastro da equipe e o que é da pessoa:** vínculos, carteira e exceções de outras contas não são dado do setor (montam os perfis e o "agindo como"); a sessão de trabalho da própria pessoa sempre vem (s06).
- **Troca da pessoa na tela:** o adaptador relê as classes 1 e 2 com o token da pessoa nova e troca o token do SSE.
- **Aviso do app do cliente preso na tela:** o tempo de 5 s era cancelado a cada mudança da lista de avisos (bug latente da tela, que o delta do SSE fez aparecer; s10).
- **Integrante de outro escritório:** depois de trocar de escritório, um temporizador do motor da demonstração do escritório anterior ainda pedia uma ação de um integrante que não existe no novo (o servidor recusava com `NAO_ENCONTRADO`, e a fumaça falhava às vezes no "sem erros no console"). O adaptador descarta essa ação antes de sair, com um aviso no console.

### Desvios do desenho, e por quê

| Desenho | Na B5 | Por quê / quando muda |
| --- | --- | --- |
| SSE lê a cauda de `evento` (ARQUITETURA 6.3) | Lê a cauda de `mudanca` (tabela, id, versão), gravada por gatilho por comando na mesma transação | O evento não diz tabela nem id, e as tabelas sem evento (aviso, fila do integrante, estado de tela) também precisam avisar. O custo é uma inserção em lote por comando |
| Uma consulta por instância para todos os escritórios conectados (6.3) | Uma consulta por escritório acompanhado, sob a RLS dele | A API não tem papel que leia todos os escritórios (sem `BYPASSRLS`, de propósito). Com poucos escritórios por instância, é barato; acima disso, um papel de leitura da cauda só para o fluxo |
| Aviso de exclusão "só a quem veria" | A exclusão avisa só o id a todos do escritório | A linha já não existe para conferir o setor. Só se exclui o que a regra deixa (convite, vínculo, exceção, carteira) |
| Classe 3 nunca no navegador | O cache da classe 3 começa com a página mais recente que a pessoa pode ver (até 500 por tabela, pela ferramenta de lista e pela regra de leitura) e cresce com o que as telas consultam | Os 12 pontos de tela da F1 passaram ao `useConsulta`; outros ainda leem a tabela (o "feito por" de cada item, que viraria uma consulta por linha; telas do BPO e do Financeiro, das fases F6). Quando eles migrarem, o aquecimento pode cair |
| Tabelas das fases seguintes | Seguem na classe 1 de transição, filtradas por setor e carteira | ARQUITETURA 5: a tabela ainda não migrada segue como está, com dado de demonstração. A classe do desenho de cada uma está em `CLASSE_DESENHO` |
| Métodos específicos sem ferramenta tipada | Seguem por `/v1/operacoes` | Assinatura fixa, sem patch, com a regra do repositório. Só o genérico (o patch livre) foi fechado. Viram ferramenta na fase de cada módulo |
| Linha direta do cartão de aprovação | A lista de quem aprova ainda muda pela linha | A regra de alçada do BPO (S08c, F6) reescreve `pode_aprovar` pela tela |
| Texto do evento é do sistema (AGENTICO) | A tela manda a frase do evento no envelope (`heild_tela.texto`, até 500 caracteres) | É a frase que a linha do tempo do wireframe já mostra. Quem, quando, ferramenta e resultado continuam do servidor |
| Competência AAAA-MM | `CompetenciaEsquema` aceita AAAA-MM e MM/AAAA | A semente e as telas do wireframe gravam MM/AAAA. Unificar é migração de dado, fora da F1 |
| Partição antiga de `evento_leitura` vai para o S3 em 90 dias | Particionada por mês, sem o arquivamento | O arquivamento frio é da hospedagem (F7) |
| JWT verificado por JWKS do projeto | Testado com um emissor de JWKS de teste (mesma rota e formato do Supabase) | A stack local do `supabase start` precisa de Docker, e o projeto de São Paulo não existe ainda |
| Perda de leituras numa queda | O registro de leituras guarda até 2 s na memória antes de gravar | É o preço de não travar a leitura (STACK 8: "fora da transação de leitura"). Desligar a API grava o que estiver na memória |

### O que falta (depois da B5)

- **Projeto Supabase em São Paulo** (depende do dono): aplicar a migração pelo `aplicar-projeto`, ligar o gancho de token e o MFA, desligar a Data API e rodar o vazamento e a fumaça contra ele (critério da E1).
- **Retomada do cartão do executor da B1:** o cartão que o executor cria quando um integrante pede algo que exige aprovação ainda não roda o comando guardado quando a pessoa aprova (encaixe 4 da B1). Os cartões de execução da B2 já retomam. É o que falta para o s08b (abaixo).
- **Fluxo de convite pelo Supabase Auth:** quem aceita o convite cria o login e a linha de `conta_auth`. Hoje a ligação é feita por quem administra (é o que o s09 esbarra).
- Os pontos de tela que ainda leem evento e mensagem interna inteiros, nas telas das fases seguintes.
- Ferramenta tipada para os métodos específicos dos módulos das fases seguintes, junto com cada fase.
- Medir sob carga o fluxo (muitos escritórios por instância) e o gatilho da cauda de mudanças nas importações grandes.
