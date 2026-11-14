# Arquitetura do wireframe

**Versão 1 · 14/11/2026 · sessão S00 (fundação).** Como o wireframe guarda dados, confere permissão, simula serviços e monta telas, e como cada sessão (S01 a S11) usa essa base sem pisar nas outras. Complementa o `SESSOES.md` (onde cada sessão mexe) e o `MAPA_DE_TELAS.md` (o que cada tela tem); quando este arquivo e o `SESSOES.md` divergirem sobre quem pode editar um arquivo, vale o `SESSOES.md`.

## 1. Visão geral

```
telas (src/telas, src/cliente)            o que a pessoa vê
   │  useLoja() (formato de tela, API antiga)      useTabela('tarefa') + repos.tarefas (entidades)
   ▼                                               ▼
loja (src/ambiente/loja.tsx) ── fachada ──► repositórios (src/nucleo/repositorios)
                                              │ autorizar() → regra da entidade → evento
                                              ▼
                                           banco (src/nucleo/banco) ── memória, leitura síncrona
                                              │ adaptador
                       ┌──────────────┬───────┴──────┬───────────────┐
                    local (padrão)  indexeddb     supabase        memoria
                    localStorage    IndexedDB     Postgres+RLS    (testes)

serviços externos (src/servicos) ── interface + implementação de demonstração (resultado marcado)
kit de interação (src/components/kit) ── edição, formulário, arrastar, confirmar, estados, menu, lote, permissão
rotas (src/nucleo/rotas.ts) ── #/modulo/aba?cliente=&tarefa=… ; #/app ; #/kit
```

- Os dados são as **entidades do subplano 01**, com os mesmos nomes de campo (snake_case) das tabelas do Supabase.
- Toda escrita passa por um **repositório**, que confere a permissão na **função única** `autorizar` (Fundações 3.4), aplica a regra da entidade e grava o **evento** na mesma transação (R1, R2).
- A **loja** continua com a mesma API para as telas que já existiam (`loja.tarefas`, `loja.atualizarTarefa`...), mas agora lê e grava no banco pelos **mapeadores** (`src/nucleo/mapeadores`). Tudo persiste: recarregar a página não perde nada.
- `usePersistente(chave, inicial)` também persiste agora (tabela `registro_tela`).

## 2. Onde ficam as coisas

| Caminho | O que é | Quem mexe |
| --- | --- | --- |
| `src/nucleo/modelo/entidades.ts` | As entidades (tipos), `Tabelas`, `nomesTabelas` | Coordenação; sessão acrescenta entidade nova no fim (seção 4) |
| `src/nucleo/banco/` | `Banco` (memória + gravação), adaptadores `local`, `indexeddb`, `supabase`, `memoria` | Coordenação |
| `src/nucleo/repositorios/` | `Repositorio` genérico, repositórios por entidade (`repos`), contexto do ator | Coordenação; sessão acrescenta repositório no fim de `repos` |
| `src/nucleo/permissoes/` | `autorizar`, catálogo de `ferramentas`, `permissoesDoPerfil` (o que cada conta vê), rótulos de papel e setor | Coordenação; sessão acrescenta ferramenta e regra de tela (só acrescentar) |
| `src/nucleo/mapeadores/` | Entidade ↔ formato de tela das telas antigas | Coordenação; a sessão dona do tipo de tela ajusta o mapeador dele |
| `src/nucleo/semente/` | Os escritórios de exemplo (Andrade completo, Horizonte pequeno) e o que todo escritório recebe | Coordenação; sessão acrescenta dados no fim, com comentário `// SNN` |
| `src/nucleo/react.tsx` | `BancoProvider`, `useTabela`, `useRegistro`, `useBanco`, `useEscritorio` | Coordenação |
| `src/nucleo/rotas.ts` | Endereço de cada tela e item | Coordenação; sessão acrescenta parâmetro novo (seção 8) |
| `src/servicos/` | Serviços externos: interface e demonstração | Coordenação; sessão acrescenta serviço em arquivo novo |
| `src/components/kit/` | Kit de interação comum | Coordenação; componente genérico novo vai por pedido em `DECISOES.md` |
| `src/telas/VitrineKit.tsx` | `#/kit`: o kit e os serviços funcionando sobre o banco (exemplo vivo) | Coordenação |
| `app/supabase/` | Migração SQL e guia para ligar o Supabase | Coordenação; entidade nova = migração nova |
| `app/scripts/fundacao-fumaca.cjs` | Teste de fumaça da fundação | Coordenação |

## 3. Ler e escrever dados

### Ler numa tela

```tsx
import { useTabela } from '@/nucleo/react'
import { repos } from '@/nucleo/repositorios'

const tTarefa = useTabela('tarefa')                       // re-renderiza quando a tabela muda
const doFiscal = useMemo(() => repos.tarefas.listar((t) => t.setor_id === 'fiscal'), [tTarefa])
const tarefa = useRegistro('tarefa', id)                  // uma linha
```

`repos.x.listar(filtro?, { arquivados? })` devolve as linhas não arquivadas, na ordem manual (`ordem`) e depois na de criação. O banco só tem o escritório da sessão (o mesmo isolamento da RLS).

### Escrever

| Operação | Repositório | Observação |
| --- | --- | --- |
| Criar | `repos.tarefas.criar({ ... })` | Preenche `id`, `escritorio_id`, datas e `ordem`; valida; evento `tarefa.criar` |
| Atualizar | `repos.tarefas.atualizar(id, patch, { ferramenta?, texto? })` | Evento com os campos que mudaram |
| Mover entre colunas | `repos.tarefas.mover(id, 'status', 'em_andamento', posicao)` | Reordena a coluna de destino |
| Reordenar | `repos.obrigacoes.reordenar(ids)` | Grava `ordem` 1..n; sem evento na linha do tempo |
| Arquivar / desarquivar | `repos.clientes.arquivar(id, { motivo })` | Some das listas, continua existindo (R7) |
| Excluir | `repos.convites.excluir(id)` | Só onde a regra deixa (`exclusao: 'definitiva'`); devolve a linha para desfazer |
| Desfazer | `repos.x.reverter(linhaAnterior)` · `repos.x.desfazerCriacao(id)` | O evento registra o desfazer |
| Perguntar | `repos.x.pode('excluir', linha)` | Sem efeito; para esconder botão |

Os repositórios específicos têm as transições do plano: `repos.tarefas.mudarStatus(id, status)` (cada transição é uma ferramenta, 4.8), `repos.tarefas.cancelar(id, motivo)`, `repos.tarefas.reatribuir(...)`, `repos.obrigacoes.cancelar(id, motivo)`, `repos.mensagensInternas.enviar/editar`, `repos.cartoes.decidir(id, status)`, `repos.notificacoes.ler/lerTodas`, `repos.telas.lembrar(chave, valor)`.

Erros: permissão negada lança `ErroPermissao` e regra de negócio lança `ErroRegra`, as duas com a frase pronta para a pessoa. Use `useAcao()` do kit para transformar em toast:

```tsx
const executar = useAcao()
executar(() => repos.tarefas.mudarStatus(id, 'concluida'), { sucesso: 'Tarefa concluída', desfazer: () => repos.tarefas.reverter(antes) })
```

Várias linhas de uma vez, atômicas: `banco.transacao((tx) => { tx.gravar('tarefa', ...); registrarEvento(tx, contextoAtual(), {...}) })`. Use só quando o repositório não serve (a loja usa para conversa + mensagens).

### Regras de negócio que já estão na base

| Regra | Onde |
| --- | --- |
| Nada se apaga sozinho: excluir só com confirmação na tela; entidades centrais (cliente, pessoa, tarefa, conversa, mensagem, documento, obrigação, lead, integrante, setor) não têm excluir: arquivam, cancelam ou resolvem | `exclusao` em cada regra de `repos` |
| Mensagem interna nunca se apaga; editar guarda a versão anterior (autor e data) e só o autor edita | `repos.mensagensInternas` + gatilho no SQL |
| Evento é imutável; registro de entrega só cresce | `repos.eventos` + gatilhos no SQL |
| Tarefa: cancelar exige motivo; de obrigação só Gestor (gestão do setor) ou Administrador; concluída é final | `RepositorioTarefas` + `tarefa.cancelar_obrigacao` |
| Obrigação: cancelar só Gestor ou Administrador, com motivo; fica no histórico | `RepositorioObrigacoes` |
| Decisão humana com autor e data: o cartão só é decidido por pessoa (integrante e sistema não decidem) e não se decide duas vezes | `RepositorioCartoes` + restrição no SQL |
| Exceção por tela exige motivo | `repos.excecoes` |
| Setores são fixos: renomear e desativar, nunca apagar | `repos.setores` |

## 4. Criar uma entidade nova

1. **Tipo:** em `src/nucleo/modelo/entidades.ts`, acrescente a interface (estende `Registro`, campos em snake_case com os nomes do plano), a entrada em `Tabelas` e o nome em `nomesTabelas` (pai antes de filho).
2. **Repositório:** em `src/nucleo/repositorios/index.ts`, acrescente no fim de `repos`:
   ```ts
   processos: new Repositorio(b, regras({ tabela: 'processo', prefixo: 'pr', artigo: 'o processo',
     ferramentas: { criar: 'processo.criar', atualizar: 'processo.atualizar', arquivar: 'processo.arquivar' },
     exclusao: 'proibida', motivoExclusaoProibida: 'Processo não se apaga: arquive.',
     rotulo: (r) => r.numero, alvo: (r) => ({ cliente_id: r.cliente_id ?? null }),
     validar: (r) => (r.numero.trim() ? null : 'Informe o número do processo.') })),
   ```
   Regra especial (transição, versão, recusa): estenda `Repositorio` numa classe, como `RepositorioTarefas`.
3. **Ferramentas:** acrescente as ferramentas em `src/nucleo/permissoes/ferramentas.ts` (`nome`, `modulo`, `nivel`, `setor`, `papel_minimo`, `gestao`, `irreversivel`, `exposta_ao_cliente`).
4. **Semente:** dados de exemplo em `src/nucleo/semente/andrade.ts` (no fim, `// SNN`) ou num arquivo novo `src/nucleo/semente/sNN.ts` chamado de lá. Para o banco já guardado no navegador receber a semente nova, use "Restaurar demonstração" (tabela nova entra vazia em banco antigo).
5. **SQL:** migração nova em `app/supabase/migrations/AAAAMMDDHHMMSS_<nome>.sql`, no padrão da `..._fundacoes.sql` (colunas comuns, chave `(escritorio_id, id)`, quatro políticas por escritório, gatilho `tocar`). Nunca edite migração já aplicada.

Estado de tela que não é entidade (filtro escolhido, rascunho, arranjo) continua em `usePersistente('sNN:tela:item', inicial)`: agora também persiste ao recarregar.

## 5. Permissões e papéis

- **Papéis:** Administrador, Gestor e Membro (`colaborador` no código e no SQL, como no subplano; nas telas aparece "Membro"). Setores por pessoa com modo `gestao` ou `execucao` (`vinculo_setor`); exceções por tela (`excecao_tela`, liberar até um nível ou bloquear, com motivo); carteira opcional.
- **Função única:** `autorizar(ctx, 'tarefa.cancelar', { setor_id, cliente_id })` segue a ordem do 3.2: módulo da assinatura → Administrador → cliente (só ferramentas expostas) → exceção bloquear → exceção liberar → vínculo ao setor (e modo gestão quando a ferramenta pede) → carteira → papel mínimo. Integrante nunca excede o dono e o irreversível vira cartão.
- **O que cada conta vê:** `permissoesDoPerfil(perfil)` (módulos, abas, setores, gere...). `useSessao().permissoes` já devolve isso; `sessao.tsx` reexporta.
- **Na tela:**
  ```tsx
  const pode = usePode('obrigacao.cancelar', { setor_id: 'fiscal' })
  <SePode ferramenta="conta.usuario.salvar"><Button>Convidar</Button></SePode>          // esconde
  <SePode ferramenta="obrigacao.cancelar" alvo={{ setor_id }} mostrarMotivo>...</SePode> // cinza com o motivo
  ```
  O padrão é **esconder** (mapa, 1.1); `mostrarMotivo` só onde o plano pede o "por que não posso?".
- **Quem age:** a sessão define o ator dos repositórios (a pessoa da tela; no app do cliente, a pessoa do cliente). O motor da demonstração age como o integrante (`comoAtor(ctx, () => ...)`).
- **Ver como:** no painel Demonstração, "Ver como" troca papel e setores sem trocar de pessoa; a faixa no topo avisa. Bom para mostrar aos contadores o que cada um enxerga.
- **Regra nova de tela:** acrescente em `src/nucleo/permissoes/telas.ts` (`permissoesDoPerfil`), sem mudar as existentes (é o que o `SESSOES.md` chama de `permissoesDe` em `sessao.tsx`).

## 6. Serviços simulados

Tudo o que é pago ou ainda impossível está em `src/servicos`, com interface e implementação de demonstração: IA e Assistente (`ia`), transcrição, OCR, WhatsApp, e-mail, Integra Contador/e-CAC, consultas estaduais e municipais, certidões, NFS-e, bancos, Pix, Open Finance, assinatura eletrônica, armazenamento em nuvem e DJEN. O `catalogoServicos` liga cada um ao código do catálogo de APIs do mapa (1.7).

```tsx
import { servicos } from '@/servicos'
import { SeloDemonstracao } from '@/components/kit'

const r = await servicos.integraContador.situacaoFiscal(cnpj)   // espera, "pensando", devolve
r.dados          // o resultado
r.demonstracao   // true: mostre <SeloDemonstracao fonte={r.fonte} />
```

- Toda chamada devolve `Resultado<T>` (`dados`, `demonstracao`, `fonte`, `latencia_ms`). Erro é `ErroServico` (mostre `EstadoErro` com "Tentar de novo").
- **Falhas simuladas:** o painel Demonstração liga "Serviços externos falhando" (`definirInstabilidade`); toda tela que depende de serviço precisa do estado de erro.
- **Texto ao vivo:** `servicos.ia.responderAoVivo(pedido, aoEscrever, aoPensar)`. O chat dos integrantes continua no motor da loja (`usePedirIntegrante`, `dados/simulacao.ts`); a resposta gerada ao vivo traz `demonstracao: true` e a bolha mostra o selo.
- **Serviço novo:** arquivo novo em `src/servicos/<nome>.ts` com a interface e a implementação de demonstração (use `simular(fonte, gerar, { latencia })`), uma linha em `Servicos`/`servicos` e uma no `catalogoServicos`.
- **Ligar o real:** implementar a mesma interface chamando o backend (nunca a API paga direto do navegador) e trocar com `definirServicos({ whatsapp: real }, { real: true })`. A tela não muda; o selo some porque `demonstracao` vem `false`.

## 7. Kit de interação

Tudo em `src/components/kit` (importe de `@/components/kit`), com os tokens do tema. Vitrine viva em `#/kit` (painel Demonstração › "Kit de interação").

| Peça | Para quê |
| --- | --- |
| `EdicaoEmLinha` | Texto que vira campo ao clicar; Enter salva, Esc cancela; valida; mostra o erro do repositório |
| `useFormulario` + `FormularioModal` | Formulário em modal com validação (erro por campo depois de mexer ou tentar salvar); para cadastro longo, `GavetaFormulario` (ui/formulario) com o mesmo `useFormulario` |
| `ListaOrdenavel`, `Quadro` | Arrastar e soltar (dnd-kit): reordenar lista; mover entre colunas (kanban). Mouse, toque e teclado |
| `useConfirmar` | Diálogo de confirmação, com motivo obrigatório quando pedir (`exigirMotivo`) |
| `loja.toastDesfazer(texto, desfazer)` | Toast com Desfazer (ou `useAcao` com `desfazer`) |
| `EstadoVazio`, `Carregando`, `EstadoErro`, `Estados` | Os três estados de qualquer lista |
| `MenuContexto`, `BotaoAcoes` | Botão direito e "⋯" com as mesmas ações; ação sem permissão aparece desabilitada com o motivo |
| `useSelecao`, `CaixaSelecao`, `BarraLote` | Seleção múltipla (Shift marca intervalo) e ação em lote |
| `SePode`, `usePode`, `useAcao` | Permissão na tela e escrita com toast de erro e desfazer |
| `SeloDemonstracao` | Marca da resposta simulada |

O `ConfirmarProvider` já envolve o app (`App.tsx`).

## 8. Rotas

Endereço por hash (funciona em hospedagem estática):

| Endereço | Abre |
| --- | --- |
| `#/painel/fiscal` | Módulo e aba |
| `#/painel/fiscal?cliente=c1` | Com o cliente selecionado (`todos` = carteira) |
| `#/painel/societario?tarefa=t18` | A ficha da tarefa por cima |
| `#/painel/societario?ficha=c1` | A ficha do cliente |
| `#/crm/conversas?conversa=cv1` | A conversa |
| `#/inicio/time?integrante=i-fiscal` | O chat do integrante |
| `#/financeiro/cobranca?fatura=f3` | A fatura |
| `#/arquivos?pasta=c1:Fiscal/2026` | A pasta |
| `#/app` · `#/kit` | App do cliente · vitrine do kit |

Quem não está logado vê a entrada e, depois de entrar, cai no endereço pedido. Trocar módulo ou aba entra no histórico (o Voltar funciona).

- A **Plataforma** escreve a base (`definirRotaBase`); a gaveta escreve o item (`definirItemDaRota`); uma tela escreve o item aberto dentro dela com `useItemNaRota({ conversa })`.
- **Parâmetro novo** (ex.: `processo`): acrescente o campo opcional em `Destino` (`loja.tsx`), a leitura e a escrita em `destinoParaHash`/`hashParaDestino` e trate em `navegar` da Plataforma (ou na gaveta). Abrir por código: `useNavegacao().irPara({ modulo: 'painel', aba: 'fiscal', tarefa: 't0' })`.

## 9. Escritórios de exemplo e demonstração

- Dois escritórios: **Contábil Andrade & Lima** (completo, os dados de exemplo de sempre) e **Horizonte Contabilidade** (pequeno, em implantação, sem BPO). Cada um tem os dados guardados à parte (`heild:banco:<escritorio>:<tabela>` no localStorage). Troca no painel Demonstração.
- As telas que ainda leem dados fixos de `src/dados` (Financeiro, Timesheet, BPO, Leads/Comunicados/Números, Visão geral, parte de Configurações) mostram, no Horizonte, um aviso em vez de misturar dados de outro escritório. Ao migrar uma tela para o banco, tire-a da condição `telaAindaFixa` em `Plataforma.tsx`.
- **Resetar o ambiente (restaurar demonstração)** (painel Demonstração) volta o escritório ativo aos dados de exemplo, sai das contas e volta ao tema.
- Onde os dados ficam: `VITE_HEILD_BANCO=local|indexeddb|supabase|memoria` (`app/.env.exemplo`; Supabase em `app/supabase/README.md`).

### Supabase: ligar, desligar e restaurar

Existe um projeto Supabase da Heild para o wireframe (`rgptcikkxucyysfwarxb`, região us-east-1) com a migração `app/supabase/migrations/20261114120000_fundacoes.sql` aplicada: 30 tabelas, todas com RLS forçada pelo escritório do JWT. Duas contas de demonstração em Auth, uma por escritório de exemplo: `demo-andrade@heild.app` (`esc-andrade`) e `demo-horizonte@heild.app` (`esc-horizonte`). As senhas não estão no repositório: pergunte à coordenação ou defina outras (passo 3 abaixo).

**Ligar** (o modo local continua o padrão e roda sem rede):

1. `cp app/.env.exemplo app/.env.local` (o `.env.local` fica fora do git).
2. No `.env.local`: `VITE_HEILD_BANCO=supabase` e as duas senhas (`VITE_SUPABASE_SENHA_ESC_ANDRADE`, `VITE_SUPABASE_SENHA_ESC_HORIZONTE`). A URL e a chave publicável já vêm no exemplo.
3. Senha esquecida: troque no painel do Supabase (Authentication › Users) ou pela API admin do Auth com a service_role, que nunca vai para o repositório nem para o `.env`.
4. `npm run app`. O app entra sozinho com a conta do escritório ativo; trocar de escritório no painel Demonstração troca a conta. Na primeira abertura de um escritório vazio, a semente entra sozinha.

**Desligar:** `VITE_HEILD_BANCO=local` no `.env.local` (ou apague a linha), ou rode com a variável na frente: `VITE_HEILD_BANCO=local npm run app` (variável do terminal vence o arquivo).

**Restaurar os dados de demonstração:** painel Demonstração › "Resetar o ambiente (restaurar demonstração)". No Supabase, isso chama `restaurar_demonstracao()` (apaga só o escritório do JWT, inclusive eventos e mensagens internas, que de outro jeito não se apagam) e semeia de novo. Os dois escritórios se restauram separados (troque de escritório e restaure o outro).

**Como o adaptador grava** (`src/nucleo/banco/supabase.ts`):

- Toda alteração vai antes para uma fila no localStorage (`heild:fila-supabase:<escritorio>`), de forma síncrona, e só sai de lá quando o Supabase confirma. Recarregar no meio da gravação não perde nada: a fila é enviada antes da próxima leitura, e o que ainda está nela vence a cópia do servidor.
- Uma operação por vez (a fila de um escritório nunca sai com a conta do outro durante a troca); tabelas em paralelo dentro da operação.
- Evento e registro de entrega usam "inserir se não existir" (não têm política de update, de propósito). Leitura paginada (1000 por vez) e na ordem de criação.
- Erro de gravação aparece no console (`[heild] falha ao gravar`) e a alteração continua na fila para a próxima tentativa.

**Testar no Supabase:** `VITE_HEILD_BANCO=supabase npx vite --port 6100` e `node scripts/fundacao-fumaca.cjs <pasta>` (o mesmo teste do modo local; termina restaurando o escritório Andrade).

**Esquema novo:** migração nova em `app/supabase/migrations/` (nunca edite a aplicada); aplicar no projeto pede autorização do dono.

## 10. Como não conflitar com outra sessão

- Siga o `SESSOES.md` (dono de cada arquivo, "só acrescentar" nos compartilhados). Os arquivos de `src/nucleo`, `src/servicos` e `src/components/kit` são da coordenação: acrescente no fim (entidade, repositório, ferramenta, serviço, parâmetro de rota), nunca reordene nem reformate.
- **Prefira entidades e repositórios** para dado que mais de uma tela vê (tarefa, cliente, documento, conversa). Para estado só da sua tela, `usePersistente('sNN:...')`.
- **Não edite a semente existente**: acrescente no fim com `// SNN`. Mudar dado existente vai por `DECISOES.md`.
- **Mapeadores:** a sessão dona do tipo de tela (`SESSOES.md`, seção 2: `Tarefa` → S04, `Cliente` → S02, `Mensagem`/`Cartao` → S01, `Conversa` → S05) é quem ajusta o mapeador dele. Ex.: quando S04 acrescentar `aguardando_terceiro`, `em_revisao` e `cancelada` ao `StatusTarefa` de tela (C3), tira o "achatamento" em `tarefaParaTela`.
- **Teste:** teste novo em `app/scripts/sNN-<assunto>.cjs`; rode também `scripts/fundacao-fumaca.cjs` antes de entregar (pega quebra na base).
- Antes do push: `npm run typecheck` e `npm run build` sem erro.
