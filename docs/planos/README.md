# Planos da Heild

**Centralizados aqui em 15/11/2026.** Esta pasta é a fonte da verdade dos planos do produto, que antes ficavam no repositório de trabalho `DGM-RAG-Contabil` (agora só histórico). As pesquisas estão em [`../pesquisa/`](../pesquisa/).

Acréscimos de 14 e 15/11/2026, além do índice herdado abaixo:

| Documento | O que é |
| --- | --- |
| [backend/](backend/) | Desenho do backend real: stack (TypeScript no Node 24 com Fastify; Python só em workers de documento), hospedagem (AWS São Paulo com Fargate; Supabase em São Paulo), acesso agêntico por setor, arquitetura e migração do wireframe, perguntas respondidas |
| [integrantes/](integrantes/) | Pesquisa de orquestração dos integrantes (Grok Bot, Openbot, agentes.chat), avaliação contra o contraprova, modelo de custo e as decisões do Enzo (integrante compartilhado por setor, procedimento por processo, Sonnet como padrão de operário, piloto automatizado com margem de 3 pontos) |
| [Plano_Base_Legislacao_Municipal.md](Plano_Base_Legislacao_Municipal.md) | Base legal municipal e estadual, blocos e pacotes de base legal, revisão pela IA (v0.4, 9/11/2026) |
| [Plano_Redes_Sociais.md](Plano_Redes_Sociais.md) | Plano das redes sociais da Heild |
| Wireframe interativo | O mapa de telas, a divisão das sessões, as decisões e as entregas ficam no branch [`wireframe`](../../../../tree/wireframe/docs/wireframe), junto do código |

---

## Índice herdado do repositório de trabalho (DGM-RAG-Contábil)

Assistente de IA para contadores brasileiros que responde perguntas tributárias, contábeis, trabalhistas e societárias com citação verificada da base legal, inclusive pela lei vigente na data do fato.

### Estrutura original

| Pasta | Conteúdo |
| --- | --- |
| `docs/planos/` | Os planos do projeto |
| `../pesquisa/` | Pesquisas de infraestrutura, custos, agentes, aspectos jurídicos e mercado, e o modelo financeiro |
| `../legado/apresentacao/` | Apresentação em código (HTML, CSS e JavaScript) para os contadores do grupo |

## Planos

| Documento | Papel |
| --- | --- |
| [Plano de desenvolvimento (6 meses) e lançamento](Plano_MVP_6_meses.md) | **Plano de execução:** premissas, cronograma M1–M6 e lançamento no M7, sindicatos e Juntas, coletor, agentes, orçamento, aporte de R$ 20 mil, degraus de infraestrutura e compra de GPU própria |
| [Plano do Assistente de IA para Contadores](Plano_Assistente_de_IA_para_Contadores.md) | Produto e arquitetura técnica: as quatro camadas, a cascata de recuperação, a visão agêntica, a DGM, os riscos e o mercado |
| [Plano de Ingestão da Base Legal](Plano_de_Ingestao_da_Base_Legal.md) | Como os agentes constroem a base legal temporal: fichas, protocolo de congelamento, agentes, fontes, escada de acesso e ordem de execução |
| [Desenho do Sistema](Desenho_do_Sistema.md) | Os seis módulos (Painel, CRM, Timesheet, Time de agentes, Consultor, App do cliente) sobre fundações comuns: contas e papéis, cadastro único, tarefas, documentos, eventos, ferramentas tipadas; 17 perguntas para aval; suporte geral com chat de pessoas e assistente de ajuda que lê só pelo escopo de quem pergunta, com tela compartilhada sob consentimento (1.10) |
| [Subplano 01 · Fundações](subplanos/01-Fundacoes.md) | Inquilinos e contas, matriz de permissões, modelo de dados, registro de eventos, contrato das ferramentas (40 iniciais), armazenamento, notificações, entidades dos integrantes, tema, testes e ordem de construção |
| [Subplano 02 · Time de agentes](subplanos/02-Time-de-Agentes.md) | Anatomia do integrante, integrantes padrão por setor, loop, memória em três camadas, compaction, proatividade (23 eventos), passagem de trabalho entre usuários, chat Geral, Consultor, criação de integrantes, segurança, custos, avaliação |
| [Subplano 03 · Painel](subplanos/03-Painel.md) | Esqueleto da tela (barra lateral com módulos, seletor de cliente por módulo, Painel com oito abas só para quem tem setor contábil), contexto de cliente, Home com calendário, anatomia de aba, as 11 abas com as atividades de fases 0 a 2, tarefas, implantação e saída, permissões, validação com os contadores, cruzamento com o painel existente, métricas |
| [Subplano 04 · CRM](subplanos/04-CRM.md) | Padrão do mercado, um número por setor com coexistência, caixa de conversas, identidade e cadastro único, leads, comunicados e réguas, IA no CRM como ferramentas, tempo e eventos, permissões e LGPD, app no mesmo fio, construir sobre as Fundações com Chatwoot como referência |
| [Subplano 05 · Timesheet](subplanos/05-Timesheet.md) | As cinco fontes de tempo, extensão de navegador, conectores dos cores com equivalência, artefatos e confirmação em um clique, casos de borda de sessão, integrantes em série separada, tela com quatro abas, 16 métricas, privacidade e calibração |
| [Subplano 06 · App do cliente](subplanos/06-App-do-Cliente.md) | Contas e papéis, telas, pendências e pedidos, documentos e entrega, certificado A1 e procurações, conversa no mesmo fio, serviços extras, Consultor da empresa, notificações, marca branca, privacidade e métricas |
| [Subplano 07 · Motores e Consultor](subplanos/07-Motores-e-Consultor.md) | Roteador de intenção, M1 Legal (cascata com citação conferida), M2 Escritório, M3 Cálculo com 22 funções e tabelas versionadas, M4 Ação, verificação e abstenção, os seis modos do Consultor, benchmark, custos e segurança |
| `design/` | Telas do Figma do usuário (Início e Time), paleta e tipografia, referência do UI lab |
| (branch `claude/ui-lab`) | **UI lab:** wireframe vivo em código (Vite, React, Storybook) com as decisões do usuário; `ui-lab/PLANO.md` e `ui-lab/REVISAO.md` trazem o que mudou nos subplanos, incorporado nos adendos "decisões do UI lab" (primeira e segunda rodadas, 7 e 8/11/2026) |
| [Subplano 08 · Conectores](subplanos/08-Conectores.md) | Contrato comum dos conectores, cofre de credenciais, governo federal com preços, perfil por UF (sempre sem A1 primeiro), cores, mercado (WhatsApp, e-mail, bancos, cobrança, assinatura, calendário, nuvens), robôs, fluxos ponta a ponta, custos para 100 clientes e riscos |
| [Subplano 09 · Financeiro](subplanos/09-Financeiro.md) | Financeiro do escritório no nível do Conexa e ligado à operação: contratos e faturamento, cobrança com régua, contas a pagar, conciliação, caixa, DRE, integrante do Financeiro, migração, telas e fases |
| [Estudo de precificação por módulo](Estudo_de_Precificacao_por_Modulo.md) | Custo por módulo em três escritórios-tipo, o que é embutido, consumo ou repasse, referências de mercado, modelo escolhido (configurador modular, com [calculadora](precificacao/configurador.html)), IA vendida à parte em planos por usuário (limites por janela de 5 horas e por semana, bolsa, uso extra), pacotes como atalhos, sensibilidades suporte geral com FAQ, assistente de ajuda e chat (P25; v0.8 com o custo do diagnóstico), teto dos conectores em 130% (P26) e piso da implantação em margem zero (P27), e as perguntas (todas respondidas, menos a P28, custo real da hora de implantação) |
| [Subplano 10 · BPO](subplanos/10-BPO.md) | BPO como pacote e módulo com tela própria: contabilidade que compra o BPO, BPO financeiro puro e BPO entre escritórios; tabela de cruzamentos, aprovação e alçadas, fila e SLA, precificação sem dupla cobrança, riscos jurídicos, e as respostas finais às perguntas da segunda rodada do UI lab (seção 12; faturamento conjunto com notas por serviço) |
| [Síntese do pacote Jurídico](Sintese_Pacote_Juridico.md) | Pesquisa em seis frentes (`../pesquisa/juridico/J1` a `J6`): mercado, eLaw, 234 atividades, fontes e integrações, IA jurídica e ética, outras áreas; núcleo × pacote, base de leis modular, sigilo e próximos passos |
| [Subplanos JU-06 a JU-12 do pacote Jurídico](subplanos/juridico/) | Time de agentes, CRM e app do cliente, documentos e assinatura, agenda e correspondentes, segurança e LGPD, migração e lançamento, estudo de precificação (`precificacao/parametros-juridico.json`); só planejamento |
| [Conferência do pacote Jurídico](Conferencia_Pacote_Juridico.md) | Lacunas dos cinco subplanos contra concorrentes e regulação, e os subplanos JU-06 a JU-12 propostos (pesquisa sem verificação: leitura das páginas falhou) |
| [Subplanos do pacote Jurídico (JU-01 a JU-05)](subplanos/juridico/) | Só planejamento, nada construído: [JU-01 modelo de dados e catálogo](subplanos/juridico/JU-01-Modelo-de-Dados-e-Catalogo.md), [JU-02 painel e telas](subplanos/juridico/JU-02-Painel-e-Telas.md), [JU-03 prazos, comunicações e conectores](subplanos/juridico/JU-03-Prazos-Comunicacoes-e-Conectores.md), [JU-04 motor jurídico e base de leis](subplanos/juridico/JU-04-Motor-Juridico-e-Base-de-Leis.md), [JU-05 honorários, financeiro e preço](subplanos/juridico/JU-05-Honorarios-Financeiro-e-Preco.md) |
| [Cruzamento com o levantamento do segundo escritório](Cruzamento_Levantamento_Segundo_Escritorio.md) | 10 fichas do segundo contador contra o nosso levantamento: Legal × Societário, validade das abas do Painel, lista de decisão C2 e dores mais repetidas |
| [Pesquisa: setores de escritórios contábeis](../pesquisa/relatorios/Setores%20de%20escrit%C3%B3rios%20cont%C3%A1beis.md) | Legalização × Societário, como os sistemas dividem departamentos, certificado digital (notas em `research_notes/`) |
| [Lista de decisão do painel do Leandro](Lista_de_Decisao_Painel_do_Leandro.md) | 41 itens que o painel dele tem e o nosso plano não tem (ou tem em parte), com recomendação e caixa de decisão; Raio-X do Drive em seção própria |
| [Cruzamento com o painel do Leandro](Cruzamento_Painel_do_Leandro.md) | Inventário do painel em Apps Script (34 funções) contra os subplanos: o que já está planejado, parcial ou falta, lições, riscos, perguntas ao Leandro e migração |
| [Subplano 11 · Comunicação interna](subplanos/11-Comunicacao-Interna.md) | Conversas pessoais, grupos, canal por setor e geral, sem exclusão de mensagens; integrantes por menção |
| [Revisão de consistência](subplanos/00-Revisao-de-consistencia.md) | Correções feitas entre o Desenho e os subplanos, divergências resolvidas e lacunas encaminhadas, em seis passadas (01 a 06; 07 e 08; 09; revisão geral de 8/11/2026 com as decisões do UI lab e do subplano 10; rodada de decisões de 8/11/2026: suporte geral, teto dos conectores, implantação, Financeiro em sete abas e nomes; segunda rodada do UI lab, seção 10; respostas finais de 8/11/2026, seção 11; últimas decisões de 8/11/2026, seção 12: NFS-e pelo layout nacional, FAQ no suporte, custo-hora único com BPO como filtro e escalonamento do lote) |
| [Plano da Plataforma do Escritório](Plano_Plataforma_do_Escritorio.md) | **Rascunho para discussão:** a plataforma agêntica (painel, IA operadora, multiatendimento, timesheet e assistente legal), inventário de atividades por aba, APIs, linha do tempo e triagem |

## Pesquisas (`../pesquisa/`)

| Arquivo | Assunto |
| --- | --- |
| [01-infra-aws.md](../pesquisa/01-infra-aws.md) | Infraestrutura, GPU e armazenamento |
| [02-custos-llm.md](../pesquisa/02-custos-llm.md) | Preços de API e tokens por etapa |
| [03-agentes-dev.md](../pesquisa/03-agentes-dev.md) | Agentes de programação e ferramentas agênticas, com riscos |
| [04-juridico-tributario-dados.md](../pesquisa/04-juridico-tributario-dados.md) | Abertura da empresa, tributos, LGPD e acesso a dados públicos |
| [05-mercado-preco.md](../pesquisa/05-mercado-preco.md) | Tamanho do mercado, preços dos concorrentes e modelos de cobrança |
| [plataforma/00-protocolo-de-descoberta.md](../pesquisa/plataforma/00-protocolo-de-descoberta.md) | Protocolo reutilizável de descoberta de funcionalidades da plataforma (descoberta por aba, verificação por domínio, consolidação) |
| [plataforma/90-consolidado.md](../pesquisa/plataforma/90-consolidado.md) | Levantamento por agentes: 589 atividades fora do core, triadas, com catálogo de ferramentas, mapa de integrações com preços conferidos e agenda de contatos (D1–D7 descoberta, V1–V3 verificação em duas rodadas) |
| [plataforma/L1-ciclo-de-vida.md](../pesquisa/plataforma/L1-ciclo-de-vida.md) | Jornadas de entrada, manutenção e desligamento do cliente, catálogo de modelos e fichas transversais |
| [plataforma/L2-trilha-implantacao.md](../pesquisa/plataforma/L2-trilha-implantacao.md) | Trilha de implantação em fases, caminho crítico e ordem de desligamento das ferramentas atuais |
| `plataforma/S1` a `S5` | Pesquisas para o desenho: times de agentes (OpenBot, Hermes, Grok Bot, OpenClaw), captura passiva de tempo, conexão WhatsApp, APIs de cobrança dos bancos, plataformas de BPO financeiro com IA (Sofia, BPO Suite, Loki, Nortcash) |
| `plataforma/B1` a `B10` | Pesquisas: financeiro, concorrentes, captura sem certificado, cores e migração, pessoa física, terceiro setor, nichos e BPO |
| [plataforma/mapa-de-atividades.html](../pesquisa/plataforma/mapa-de-atividades.html) | Visualizador das 589 atividades com filtros por setor, etapa, prioridade e nível (dados em `atividades.json`) |
| [08-modelo-mvp.md](../pesquisa/08-modelo-mvp.md) | Modelo financeiro do desenvolvimento e do lançamento, gerado por `../pesquisa/modelo/modelo_lancamento.py` |

Para regenerar o modelo: `python3 docs/pesquisa/modelo/modelo_lancamento.py` (atualiza `../pesquisa/08-modelo-mvp.md` e `../legado/apresentacao/data/modelo.json`).

## Apresentação (`../legado/apresentacao/`)

| Arquivo | Conteúdo |
| --- | --- |
| `index.html` | A apresentação pronta (65 slides), gerada pelo build |
| `ROTEIRO-DE-FALAS.md` | Falas de cada slide, com versão curta (frases em negrito) e completa |
| `cola/` | Cola de celular com as falas, gerada por `cola/gerar_cola.py` a partir do roteiro (`cola/index.html`) |
| `GUIA.md` | Guia para quem escreve slides: padrão visual, componentes e atalhos |
| `build.mjs` | Monta `index.html` a partir de `src/` e `data/modelo.json` |

**Como abrir:** abra `apresentacao/index.html` direto no navegador (funciona sem internet). Para refazer depois de editar `src/`: `cd apresentacao && node build.mjs`. Para refazer a cola: `python3 apresentacao/cola/gerar_cola.py`.

**Atalhos principais:**

| Tecla | O que faz |
| --- | --- |
| → espaço PageDown Enter | Avança |
| ← Shift+espaço PageUp | Volta |
| Home / End | Primeiro / último slide |
| número + Enter | Vai para o slide |
| O | Visão geral em grade |
| P | Visão do apresentador em outra janela |
| F | Tela cheia |
| B ou . | Tela preta |
| R | Repete as animações do slide atual |
| Shift+R | Volta as animações de todos os slides ao início e repete o atual |
| Esc | Fecha a visão geral ou a tela preta |

A lista completa está no [GUIA.md](apresentacao/GUIA.md).
