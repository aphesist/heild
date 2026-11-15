# Perguntas para o Enzo: plano de APIs do Contábil

**15/11/2026.** Dez decisões que só o dono pode tomar, cada uma com a recomendação. **O Enzo respondeu as dez em 15/11/2026**; a resposta e o que ela mudou estão na última coluna. As decisões do backend (P1 a P10 de `docs/backend/PERGUNTAS.md`) já tinham sido aceitas e não voltam aqui.

## Respostas

| # | Pergunta | Recomendação | Resposta do dono e o que mudou |
| --- | --- | --- | --- |
| Q1 | **Integra Contador no piloto.** Sem ele, o Fiscal não vê a caixa postal do e-CAC nem gera PGDAS-D e DAS pela Heild. Custa ~3 sp | Sim | **Segue a recomendação.** O Integra entra no piloto, base e completo ([`ORDEM_DE_IMPLEMENTACAO.md`](ORDEM_DE_IMPLEMENTACAO.md), 2) |
| Q2 | **Modelo A do SERPRO.** A Heild contrata uma vez e cada escritório assina só o termo. Com 1.000 escritórios, economiza ~R$ 150 mil por mês. Pedir a confirmação ao comercial? | Sim, já; modelo B como reserva no piloto | **Segue a recomendação; quem fala com o comercial do SERPRO é o Enzo.** Registrado como **pendência do Enzo** ([`ORDEM_DE_IMPLEMENTACAO.md`](ORDEM_DE_IMPLEMENTACAO.md), 1, item 2) |
| Q3 | **403 cobrado.** Nenhuma chamada paga sem a procuração conferida no dia anterior pelos eventos gratuitos? | Sim | **Segue a recomendação** |
| Q4 | **Cache das consultas pagas.** Situação fiscal 24 h, certidão até vencer, CNPJ 30 dias; só uma pessoa força a consulta nova | Sim | **Segue a recomendação** ([`API_INTERNA.md`](API_INTERNA.md), 2.8) |
| Q5 | **WhatsApp.** O serviço ficou pago em 10/2026. Manter o repasse da API oficial a custo? | Repasse a custo, sem margem | **Mudou.** O uso do dia a dia (atendimento, suporte, recados, conversas) vai por **integração não oficial com o WhatsApp Web**, sem custo por mensagem. Envio em massa também pode ir por ela, com o risco de banimento explicado ao escritório na venda. A API oficial só entra quando o escritório quiser envio em massa grande, contratada e paga por ele. Desenho, comparação das opções e riscos em [`WHATSAPP.md`](WHATSAPP.md); **recomendação: WAHA auto-hospedado com a engine GOWS** |
| Q6 | **Certidões e DTE no piloto?** A InfoSimples tem franquia de R$ 100 | Logo depois do piloto | **Mudou.** O piloto liga **tudo o que der para ligar, pago**: SERPRO completo, InfoSimples, eSocial, Reinf, assinatura, cobrança, nuvens, Pluggy, WhatsApp (não oficial e um número de teste oficial), Calculadora RFB e o resto do catálogo. Ordem refeita: ~82 sp; custo de ~R$ 3,0 mil por mês só de APIs, R$ 4,9 mil com infraestrutura e R$ 5,7 mil com IA ([`ORDEM_DE_IMPLEMENTACAO.md`](ORDEM_DE_IMPLEMENTACAO.md), 2 e 3) |
| Q7 | **Dado de cliente no fornecedor de modelos.** Mascarar CPF e CNPJ quando o passo não precisar? | Sim, com DPA | **Mudou.** O dado vai completo, **sem máscara**: a máscara poderia atrapalhar a parte agêntica, e é o que já se faz hoje. Ficam o DPA, a configuração sem treino com os dados e a retenção mínima. A máscara saiu do desenho ([`CATALOGO_CONTABIL.md`](CATALOGO_CONTABIL.md), 9) |
| Q8 | **Base legal.** O LexML barrou o acesso automatizado e o INLABS estava em manutenção. Pedir acesso formal? | Sim | **Tentar de novo.** Resultado do teste de 15/11/2026, no catálogo, seção 8: a busca SRU do LexML continua atrás de um desafio antirrobô em JavaScript (não contornado); **a API de legislação do Senado funcionou sem cadastro** e serve à legislação federal; o INLABS segue em manutenção, e o `www.in.gov.br` devolveu resposta vazia a partir deste ambiente. **Credencial que falta:** cadastro gratuito no INLABS (e-mail e senha da Heild), que entra por formulário com cookie, não por cabeçalho |
| Q9 | **Parceria com a Thomson Reuters** para a entrada no Domínio | Sim, já | **Só depois do piloto.** No piloto, arquivo de troca |
| Q10 | **MCP para terceiros** antes do piloto? | Só depois do piloto | **Avaliar, com recorte.** Se abrir, é para **assistentes de IA** (Claude, ChatGPT, Copilot) e **ferramentas do escritório** (Microsoft 365 e Google Workspace). **n8n, Make e Zapier ficam de fora:** o CRM já engloba o e-mail, e o integrante cria a tarefa a partir dele. Seção 10 da [`API_INTERNA.md`](API_INTERNA.md): recomendação de **incluir antes do piloto** o OAuth 2.1 e o MCP remoto para Claude, ChatGPT e Copilot Studio (~3,5 sp), só leitura e propostas aprovadas por pessoa |

## Pendências que ficam com o dono

| Pendência | Origem |
| --- | --- |
| Falar com o comercial do SERPRO sobre o modelo A (a Heild contrata, cada escritório assina o termo) | Q2 |
| Pedir parecer jurídico sobre a exposição da Heild como fornecedora da integração não oficial do WhatsApp, e revisar o aviso de risco do contrato | Q5 · [`WHATSAPP.md`](WHATSAPP.md), 4 |
| Criar o cadastro do INLABS, pelo formulário seguro, para o conector do DOU | Q8 |
| Pedir à Pluggy um preço de piloto abaixo do piso de R$ 2.500 (é 83% do custo de API do piloto) | Q6 · [`ORDEM_DE_IMPLEMENTACAO.md`](ORDEM_DE_IMPLEMENTACAO.md), 3.4 |
| Decidir entre o piloto em bloco (~9,5 meses com 2 pessoas) e o mesmo piloto em ondas, que começa em ~5,5 meses | Q6 · [`ORDEM_DE_IMPLEMENTACAO.md`](ORDEM_DE_IMPLEMENTACAO.md), 2.1 |
