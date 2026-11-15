# S2 · Captura passiva de tempo (fallback do timesheet sem API dos cores)

Pesquisa de 7/11/2026 para o [Desenho do Sistema](../../planos/Desenho_do_Sistema.md), seção 4. Sites dos fornecedores estavam bloqueados na rede da sessão; preços vêm de diretórios e análises (USD por usuário por mês) e estão marcados onde não foram confirmados.

## 1. Produtos de captura passiva usados por advocacia e contabilidade no exterior

| Produto | Como captura | Atribuição a cliente | API | Preço aprox. | Windows |
| --- | --- | --- | --- | --- | --- |
| [Laurel](https://www.laurel.ai/) (ex-Time by Ping) | Agente desktop Windows (.NET), assistentes em nuvem (M365, Outlook, Teams), navegador só em URLs de lista | IA sugere cliente, matéria e narrativa; conectores Aderant, Elite, ProLaw | Fechado, enterprise | Sob consulta [a confirmar] | Sim (Mac só web) |
| [WiseTime](https://www.softwareadvice.com/project-management/wisetime-profile/) | Agente desktop Win/Mac/Linux lê janela ativa e documentos | "tags" por regras (nome do cliente no título ou arquivo) | API pública e conectores (Clio, Actionstep) | ~US$ 30 | Sim |
| [Billables AI](https://billables.ai/pricing) | Integrações M365, Teams, Adobe, Chrome, Edge, Zoom; sem capturas de tela | IA gera lançamentos por matéria; Clio, MyCase | Sem API pública [a confirmar] | US$ 59–99 | Sim |
| [Timely (Memory)](https://thedigitalprojectmanager.com/tools/timely-review/) | Memory tracker desktop grava apps, sites, documentos, calendário; privado por padrão | IA sugere projeto | REST com OAuth [a confirmar] | US$ 11 / 20 / 28 | Sim |
| [Rize](https://docs.rize.io/getting-started/faq) | Lê app, título de janela e URL; sem capturas nem teclado | Regras + IA; foco em produtividade pessoal | Sem API | US$ 10–15; equipes 20–40 [a confirmar] | Sim |
| [TimeCamp](https://saasprobe.pages.dev/reviews/timecamp-review-2026/) | Agente desktop com "atividades do computador" e **regras por palavra-chave** (título ou URL → projeto) | Palavra-chave → cliente | REST pública | Grátis; US$ 3–6 | Sim |
| Hubstaff | Capturas de tela, nível de atividade, GPS | Não é por cliente | Sim | US$ 5–10 | Sim; péssimo para LGPD |
| [Clockify auto tracker](https://clockify.me/help/track-time/auto-tracker) | Grava programa, título e URL; **dados locais**, só o usuário vê, apagados em 45 dias; nada vira lançamento sem conversão manual | Manual | API pública, mas o auto tracker local não é exposto | Grátis; US$ 4–10 | Sim |
| Toggl Track timeline | Grava apps e janelas localmente; palavras-chave disparam o timer | Palavra-chave | API para lançamentos; timeline não exportável [a confirmar] | US$ 9–18 | Sim |
| Replicon ZeroTime (Deltek) | Captura de 100+ apps e gera folha pré-preenchida para aprovação | Regras + IA | Sim, enterprise | ~US$ 6–12 + add-on | Sim |
| TIQ Time, OneAdvanced Time Capture, Sixminute | Outlook, Word, Teams | Regras | Varia | Sob consulta | Sim |

Observação central: **nenhum deles entende Domínio, Alterdata ou Contmatic.** Todos dependem de título de janela mais regras, que é exatamente o que um coletor próprio faria.

## 2. Alternativas de implementação própria

| Opção | Esforço | Privacidade e LGPD | Aceitação | Precisão |
| --- | --- | --- | --- | --- |
| **a) Extensão de navegador** (aba ativa em e-CAC, eSocial, Simples, SEFAZ, Onvio e Domínio Web) | Baixo (Manifest V3, Chrome e Edge) | Boa: lista fixa de domínios, sem conteúdo; cliente inferido por CNPJ ou razão social na URL, no título ou pelo certificado escolhido | Alta | Alta nos portais; zero nos cores desktop |
| **b) Coletor leve de foco de janela no Windows** (processo + título da janela ativa + ociosidade) | Médio (instalador, antivírus, atualização) | Igual a Clockify e Toggl: sem conteúdo nem capturas; LGPD pede aviso, finalidade, lista de apps, pausa privada e retenção curta; controle do empregador é lícito se proporcional [a confirmar com jurídico] | Média (é muito menos invasivo que ler dados do core) | Títulos do Domínio e do Alterdata costumam mostrar a empresa ativa [a confirmar por módulo]; Contmatic Phoenix muitas vezes não |
| **c) Inferência por artefato** (guia emitida, SPED gerado, e-mail enviado, arquivo salvo na pasta do cliente) | Baixo a médio | Ótima (metadados) | Alta | Baixa a média: tempo padrão por tarefa; bom para custeio, fraco para auditoria de horas |
| **d) Calendário e e-mail** (Graph, Gmail) | Baixo | Aceitável (metadados) | Alta | Alta para reuniões; nula para o core |

## 3. Como os produtos tratam privacidade e atribuição

Padrões recorrentes: dados ficam locais até a conversão (Clockify, Toggl); memórias privadas, só o usuário vê (Timely, WiseTime); sem capturas nem teclado (Rize, Billables, Laurel); lista de apps e URLs permitidos (Laurel, Rize, Clockify); modo privado ou pausa (Timely, WiseTime); retenção automática curta (Clockify, 45 dias). Atribuição por palavra-chave no título, arquivo ou URL (TimeCamp, Toggl, WiseTime) ou por IA sobre contexto e histórico (Laurel, Billables, Timely, ZeroTime), **sempre com revisão do usuário antes de virar hora**.

## 4. Recomendação, em ordem

1. Nativo: toda ação na plataforma gera registro.
2. API do Alterdata (histórico de tarefas) e negociação com Domínio/Onvio; ingestão direta, sem coletor.
3. Extensão de navegador própria para portais do governo e Domínio/Onvio web, com regra CNPJ → cliente.
4. Coletor Windows "só título de janela", opt-in, com lista de apps permitidos (Domínio, Alterdata, Contmatic), pausa privada, dados locais por 30 dias, regras palavra-chave → cliente e revisão diária em um clique. É o único caminho para cobrir o Contmatic.
5. Inferência por artefatos, calendário e e-mail como complemento e para quem recusar o coletor.
6. Se não quisermos construir o coletor: licenciar TimeCamp (API e palavras-chave, ~US$ 5) ou WiseTime (API, ~US$ 30) como coletor e importar os lançamentos.

Sobra para confirmação manual: trabalho no Contmatic sem coletor, telefone, tarefas sem cliente identificável e correções da revisão diária. Estimativa: 10% a 20% das horas [a confirmar em piloto].
