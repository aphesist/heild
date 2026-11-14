# Supabase

O wireframe guarda os dados no navegador por padrão. A mesma camada de dados
(`src/nucleo`) roda sobre o Supabase trocando só o adaptador. O projeto da
Heild para o wireframe já existe (`rgptcikkxucyysfwarxb`) com a migração
aplicada e duas contas de demonstração; **como ligar, desligar e restaurar está
em `docs/wireframe/ARQUITETURA.md`, seção 9**. O passo a passo abaixo serve
para montar outro projeto do zero.

## O que tem

| Arquivo | O que é |
|---|---|
| `migrations/20261114120000_fundacoes.sql` | Uma tabela por entidade das Fundações, com os mesmos nomes e colunas de `src/nucleo/modelo/entidades.ts`; RLS forçada por escritório; regras de imutabilidade |
| `../src/nucleo/banco/supabase.ts` | O adaptador (supabase-js, carregado só quando ligado) |
| `../.env.exemplo` | As variáveis de ambiente |

## Como as regras ficam no banco

- **Multi-inquilino (DA-01, Fundações 3.4).** Toda tabela tem `escritorio_id` e
  chave primária `(escritorio_id, id)`. A política de cada tabela compara com
  `public.escritorio_atual()`, que lê `app_metadata.escritorio_id` do JWT. O
  escritório nunca vem de parâmetro (R3). `force row level security` vale até
  para o dono da tabela.
- **Nada se apaga sozinho.** `evento` e `registro_entrega` só recebem inserção
  (gatilho recusa update e delete); `mensagem_interna` nunca é apagada (gatilho
  recusa delete; editar guarda versões em `versoes`, pelo app).
- **Decisão humana.** `cartao_aprovacao` decidido exige `decidido_por` e
  `decidido_em`; `tarefa` cancelada exige `cancelada_motivo`.
- **O resto das regras** (setor, papel, carteira, nível, "cancelar obrigação só
  Gestor") é da função `autorizar` do app (`src/nucleo/permissoes`), como manda
  a Fundações 3.4: a RLS é a segunda barreira, só por escritório. No backend de
  verdade, a mesma função roda no servidor (ver "Depois" abaixo).
- `restaurar_demonstracao()` apaga o escritório do JWT inteiro (cascata) para o
  "Restaurar demonstração". No produto, essa função sai.

## Ligar

1. Crie um projeto no Supabase e aplique a migração:
   `supabase link --project-ref <ref>` e `supabase db push` (ou cole o SQL no
   editor do painel).
2. Crie uma conta em Authentication e grave o escritório dela em
   `app_metadata` (pelo painel ou pela API de administração):
   `{ "escritorio_id": "esc-andrade" }`. Para o segundo escritório de exemplo,
   outra conta com `esc-horizonte`.
3. Copie `app/.env.exemplo` para `app/.env.local` e preencha:
   ```
   VITE_HEILD_BANCO=supabase
   VITE_SUPABASE_URL=https://<ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<chave publicável>
   VITE_SUPABASE_EMAIL_ESC_ANDRADE=<conta do esc-andrade>
   VITE_SUPABASE_SENHA_ESC_ANDRADE=<senha>
   VITE_SUPABASE_EMAIL_ESC_HORIZONTE=<conta do esc-horizonte>
   VITE_SUPABASE_SENHA_ESC_HORIZONTE=<senha>
   ```
4. `npm run app`. Na primeira abertura, o escritório é semeado com os dados de
   exemplo; depois tudo lê e grava no Postgres. "Restaurar demonstração" chama
   `restaurar_demonstracao()` e semeia de novo.

Sem as variáveis, o app avisa no console e continua no localStorage.

## Mudar o esquema

Entidade nova ou coluna nova: mude `entidades.ts` **e** crie uma migração nova
em `migrations/` (nunca edite a que já foi aplicada), com o mesmo padrão:
colunas comuns (`escritorio_id`, `id`, `criado_em`, `atualizado_em`,
`arquivado_em`, `ordem`, `extras`), as quatro políticas por escritório e o
gatilho `tocar`. Ponha a tabela em `nomesTabelas` (a ordem é a de gravação:
pai antes do filho).

## Depois (quando houver backend)

- Chaves estrangeiras compostas `(escritorio_id, x_id)` entre as tabelas
  (hoje só índices, para a semente entrar em qualquer ordem).
- Cadeia de hash dos eventos (`hash_anterior`, 5.2) e o evento gravado na mesma
  transação do efeito por uma função do banco ou do servidor, não pelo navegador.
- As escritas passam a ir por funções do servidor (as ferramentas tipadas,
  Fundações 6) que chamam `autorizar` antes; o navegador perde o insert direto.
- Serviços pagos (`src/servicos`) chamados pelo servidor, nunca do navegador.
