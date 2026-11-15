# Pendências do dono (fora do sistema)

**Versão 0.1 · 15/11/2026.** O que só o Enzo pode fazer fora do código: contratos, contas, cadastros e conversas. Ficam em aberto até ele resolver. Quando um item for feito, marque `[x]`, ponha a data e registre em [ATUALIZACOES.md](ATUALIZACOES.md) se mudar algum plano.

A origem de cada item está no plano de APIs ([apis/ORDEM_DE_IMPLEMENTACAO.md](apis/ORDEM_DE_IMPLEMENTACAO.md), seções 1, 2.2 e 2.3, e [apis/PERGUNTAS.md](apis/PERGUNTAS.md)).

## 1. Lista do dia 1 do piloto (caminho crítico)

Os prazos de terceiros não aceleram com IA. Pedir cedo evita travar o piloto em bloco (2 escritórios, 5 clientes cada, todos os setores).

| # | Item | Por quê | Prazo de terceiros | Situação |
| --- | --- | --- | --- | --- |
| 1 | **e-CNPJ A1 da Heild** | Pré-requisito do contrato SERPRO | Em geral no mesmo dia (AC) | [ ] |
| 2 | **Contrato SERPRO** (Integra Contador e Consulta CNPJ) e conversa com o comercial sobre o modelo A (uma contratante para vários escritórios) | Caixa postal do e-CAC, situação fiscal, PGDAS-D e DAS. No piloto vale o preço normal da loja (faixa 1); o modelo A só pesa em escala | Chaves em até 10 min; o aceite do modelo A, a confirmar | [ ] |
| 3 | **Procurações dos 10 clientes** no e-CAC | Sem elas, nenhuma consulta paga ao SERPRO | O escritório tem até 30 dias para aceitar | [ ] |
| 4 | **Conta InfoSimples e DPA** | Certidões e DTE estaduais no piloto | Cadastro imediato; DPA a confirmar | [ ] |
| 5 | **Certificado de assinatura de código OV** do agente local | Sem ele, o Windows mostra o aviso do SmartScreen ao instalar | US$ 150 a 300 por ano | [ ] |
| 6 | **Domínio heild.com.br e página de política de privacidade** | Destrava a verificação do app Google e as lojas da extensão. LP em heild.com.br, sistema em painel.heild.com.br (Locaweb) | — | [ ] |
| 7 | **Contas de desenvolvedor** na Chrome Web Store, no Edge Add-ons e no Microsoft Partner Center | Extensão de navegador e publisher verification da Microsoft | Revisão das lojas, a confirmar | [ ] |
| 8 | **Saída do sandbox do SES** (AWS, São Paulo) | Convites e e-mails do sistema | Horas a um dia | [ ] |
| 9 | **Produção restrita** do ADN (NFS-e), do eSocial e do Reinf | Testes com certificado antes da produção | A confirmar | [ ] |
| 10 | **DPAs** do fornecedor de modelos (Anthropic) e do Supabase | Dado completo vai ao fornecedor de modelos, sem máscara, sob DPA e sem treino | Em geral documento padrão dos termos comerciais | [ ] |
| 11 | **Certificados em nuvem e plano de assinatura eletrônica** para os 2 escritórios | ECD, ECF e o que pede A3; fluxo de assinatura do contador | A confirmar | [ ] |
| 12 | **Número de teste da Meta** (WhatsApp oficial) | Teste da API oficial, que fica só para envio em massa grande pago pelo escritório | — | [ ] |
| 13 | **Projetos Supabase de produção em São Paulo** | O HEILD-PROD atual serve ao wireframe; produção vem depois | — | [ ] |

## 2. Outros

| Item | Detalhe | Situação |
| --- | --- | --- |
| **Cadastro no INLABS** (Imprensa Nacional) | Em inlabs.in.gov.br, quando sair da manutenção. A senha nunca vai para o chat nem para o repositório: o Administrador da Heild digita na tela de integrações e ela vai para o cofre | [ ] |
| **Revisão jurídica da cláusula de aceite do WhatsApp não oficial** | Recomendada, não trava o piloto. O texto está em [apis/WHATSAPP.md](apis/WHATSAPP.md) | [ ] |
| **Mensagem para o Leandro** (15 perguntas) | Rascunho em [Mensagem_para_o_Leandro.md](Mensagem_para_o_Leandro.md) | [ ] |
| **Liberação da Heild no Google Workspace do escritório do piloto** | O administrador do Workspace marca a Heild como app confiável em Controles de API. Passo a passo em [apis/ARMAZENAMENTO.md](apis/ARMAZENAMENTO.md), seção 2.1. Só quando o conector estiver pronto | [ ] |
| **Verificação de escopo restrito do Google e CASA anual** | Só antes de vender em escala; fora do caminho crítico do piloto | [ ] |
| **Parceria com a Thomson Reuters (Domínio)** | Só depois do piloto; até lá, arquivo de troca | [ ] |
| **Lojas de app (Google Play e App Store)** | Depois; o app do cliente é webapp por padrão | [ ] |
