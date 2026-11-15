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
   - `POST /v1/operacoes`: os **métodos dos repositórios** (734 operações) para o adaptador `api` do app.
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
7. **O app fala com a API sem mudar as telas** (`VITE_HEILD_BANCO=api`). O `fundacao-fumaca.cjs` passa inteiro nesse modo.
8. **Contratos gerados de uma fonte só:** o OpenAPI 3.1 e o esquema das ferramentas, no formato do `tools/list` do MCP, saem do Zod do pacote de domínio. O retrato fica em `servidor/contratos/`, e um teste falha se ele estiver velho.
9. **61 testes da API contra Postgres real:** autorização, isolamento entre escritórios, idempotência, imutabilidade, cadeia e contratos.
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
| Catálogo | 27 ferramentas (`GET /v1/ferramentas`, `contratos/ferramentas.json`) | 734 operações (`GET /v1/operacoes`), tiradas do objeto `repos`. Repositório novo vira operação sem código novo |

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

<!-- RESULTADOS_SESSOES -->

### Desvios do desenho, e por quê

| Desenho | No B1 | Por quê / quando muda |
| --- | --- | --- |
| Servidor executa as ferramentas com SQL escrito à mão (STACK 2.5) | Executa os repositórios do wireframe num banco em memória por pedido, carregado sob demanda | É o que deixa a regra **uma só** hoje, com 734 operações e as regras de 7 sessões, sem reescrever nada. Custo: `criar` e alguns métodos carregam a tabela inteira do escritório (para a `ordem` e para regras que olham a lista). Para os dados de demonstração é rápido (o `fumaca` inteiro faz 71 escritas, todas em milissegundos). Quando uma tabela crescer (mensagem, evento, documento), a operação dela ganha SQL próprio no servidor, e o repositório continua sendo a regra |
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
