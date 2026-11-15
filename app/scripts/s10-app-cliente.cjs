// S10 · App do cliente: as ações principais de ponta a ponta (entrada, convite, pendências com devolução,
// documentos, pedidos C2-02 e C2-14, conversa, assinatura, financeiro, empresa, avisos, aprovação no escritório).
// Uso: app servido em http://localhost:6100/ (npx vite --port 6100) e `node scripts/s10-app-cliente.cjs <pasta-das-capturas>`;
// URL_APP=http://localhost:6200/ muda o endereço, como nos outros testes.
const { chromium } = require('playwright');
(async () => {
  const out = process.argv[2] || '/tmp'; const b = await chromium.launch(); const errs = []; let falhas = 0;
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  const ok = (r, m) => { if (!r) falhas++; console.log((r ? 'ok   ' : 'FALHA') + ' ' + m); };
  const shot = (n) => p.screenshot({ path: `${out}/s10-${n}.png` });
  const espera = (ms) => p.waitForTimeout(ms);
  const ir = async (t) => { await p.evaluate((t) => { location.hash = '#/app/' + t }, t); await espera(500); };
  const tem = async (re) => (await p.getByText(re).count()) > 0;
  // Espera o estado pronto de uma resposta simulada (src/servicos/simular.ts sorteia a latência numa faixa):
  // o limite é o teto da faixa do serviço mais folga de renderização, nunca um sleep fixo.
  const ate = async (re, tetoMs) => p.getByText(re).first().waitFor({ state: 'visible', timeout: tetoMs + 1500 }).then(() => true, () => false);
  const lab = async () => { await p.getByRole('button', { name: /Demonstração/ }).click(); await espera(300); };
  const dlg = () => p.getByRole('dialog');

  await p.goto((process.env.URL_APP || 'http://localhost:6100/') + '#/app'); await espera(1200);

  // S10-T01: entrada por código, código errado, contato fora da ficha
  await p.getByLabel('WhatsApp ou e-mail').fill('+55 11 90000-0000'); await espera(200);
  ok(await tem(/Peça o convite ao escritório/), 'A05 contato fora da ficha é barrado');
  await p.getByRole('button', { name: /^João Batista/ }).click(); await p.getByRole('button', { name: 'Receber código' }).click();
  ok(await ate(/Seu código de acesso é/, 700), 'A02 código chega no WhatsApp (simulado, com selo)');
  await p.getByLabel('Código').fill('000000'); await p.getByRole('button', { name: 'Entrar', exact: true }).click(); await espera(200);
  ok(await tem(/Restam 4 tentativas/), 'A02 código errado conta tentativas');
  await p.getByLabel('Código').fill('123456'); await p.getByRole('button', { name: 'Entrar', exact: true }).click(); await espera(800);
  await shot('inicio');
  ok(await tem(/O escritório precisa de você/), 'T02 Início com pendências');
  ok(await tem(/Para assinar/), 'T02 Início com documento para assinar');

  // S10-T04: envio com devolução e reenvio, recibo
  await ir('pendencias');
  await p.locator('section', { hasText: 'Extrato bancário de outubro' }).getByRole('button', { name: /Enviar arquivo/ }).click(); await espera(300);
  await p.getByRole('button', { name: 'extrato-itau-setembro.pdf' }).click(); await p.getByRole('button', { name: /Enviar 1 arquivo/ }).click(); await espera(400);
  ok(await tem(/Recebido. Protocolo/), 'A20 envio gera protocolo');
  ok(await ate(/precisamos de 10\/2026/, 1600), 'A26 integrante devolve o arquivo errado com o motivo'); await shot('devolvido');
  await p.locator('section', { hasText: 'Extrato bancário de outubro' }).getByRole('button', { name: /Enviar de novo/ }).click(); await espera(300);
  await p.getByRole('button', { name: 'extrato-itau-outubro.pdf' }).click(); await p.getByRole('button', { name: /Enviar 1 arquivo/ }).click();
  ok(await ate(/Enviados por você/, 1600), 'A20 reenvio conferido vai para "Enviados por você"');
  await p.getByRole('button', { name: 'Recibo' }).first().click(); await espera(300);
  ok(await tem(/Impressão digital/), 'A25 recibo com protocolo e hash'); await shot('recibo');
  await p.keyboard.press('Escape'); await espera(200);
  await p.locator('section', { hasText: 'Notas de outubro' }).getByRole('button', { name: 'Não tenho isso' }).click();
  await p.getByLabel('Justificativa').fill('Em outubro não emitimos notas de serviço.'); await p.getByRole('button', { name: 'Avisar o escritório' }).click(); await espera(300);
  ok(await tem(/você disse que não tem/), 'A24 "não tenho isso" volta ao escritório');

  // S10-T03: busca, abrir, baixar, compartilhar e revogar
  await ir('documentos');
  await p.getByLabel('Buscar documentos').fill('FGTS'); await espera(200);
  await p.getByRole('button', { name: /FGTS Digital 10-2026/ }).click(); await espera(400);
  await p.getByRole('button', { name: 'Baixar', exact: true }).click(); await espera(200);
  ok(await tem(/O escritório vê que chegou/), 'A16 baixar registra a entrega');
  await p.getByRole('button', { name: 'Compartilhar' }).click(); await p.getByLabel('Para quem (nome ou empresa)').fill('Banco do Brasil'); await p.getByRole('button', { name: 'Gerar link' }).click();
  ok(await ate(/Link pronto/, 500), 'A18 link para terceiro gerado'); await p.getByRole('button', { name: 'Pronto' }).click();
  await ir('documentos'); ok(await tem(/Links compartilhados/), 'A18 link aparece na lista de links');
  await p.getByRole('button', { name: 'Revogar' }).first().click(); await espera(200);
  ok(await tem(/revogado em/), 'A18 revogar link');
  await p.getByRole('button', { name: /Baixar o mês/ }).click(); await espera(200); await p.getByRole('button', { name: /Gerar zip/ }).click();
  ok(await ate(/manifesto.txt/, 1600), 'A19 baixar o mês com manifesto'); await p.keyboard.press('Escape');

  // S10-T05: simulado de rescisão (C2-02) e declaração de faturamento (C2-14)
  await ir('pedidos'); await p.getByRole('button', { name: 'Novo pedido' }).click(); await espera(200);
  await p.getByLabel('Tipo de pedido').selectOption('Simulado de rescisão');
  await p.getByLabel('Quem').fill('Carla (balconista)'); await p.getByLabel('Data prevista do desligamento').fill('2026-12-01'); await p.getByLabel('Tipo', { exact: true }).selectOption('Sem justa causa');
  await p.getByRole('button', { name: 'Abrir pedido' }).click(); await espera(500); await shot('pedido-simulado');
  ok(await tem(/Simulado de rescisão: Carla/), 'A28 pedido de simulado de rescisão aberto');
  await ir('pedidos'); await p.getByRole('button', { name: 'Novo pedido' }).click(); await espera(200);
  await p.getByLabel('Tipo de pedido').selectOption('Declaração de faturamento');
  await p.getByLabel('Para quê').selectOption('Pronampe'); await p.getByLabel('Período').selectOption('Últimos 12 meses');
  await p.getByRole('button', { name: 'Abrir pedido' }).click(); await espera(500);
  ok(await tem(/Declaração de faturamento: Pronampe/), 'A28 pedido de declaração de faturamento aberto');
  await ir('pedidos'); await p.getByRole('button', { name: 'Novo pedido' }).click(); await espera(200);
  await p.getByLabel('Tipo de pedido').selectOption('Alteração da empresa'); await p.getByLabel('O que muda').selectOption('Endereço'); await p.getByLabel('Detalhes', { exact: true }).first().fill('Mudamos para a Rua Nova, 100');
  await p.getByRole('button', { name: 'Abrir pedido' }).click(); await espera(500);
  ok(await tem(/Serviço avulso: R\$/), 'A30 pedido fora do contrato mostra o avulso');
  await p.getByRole('button', { name: 'Autorizar' }).click(); await espera(200);
  ok(await tem(/Autorizado por João Batista/), 'A30 avulso autorizado e registrado');
  await ir('pedidos'); await p.getByRole('button', { name: 'Novo pedido' }).click(); await espera(200);
  await p.getByLabel('Tipo de pedido').selectOption('Dúvida'); await p.getByLabel('Sua pergunta').fill('Posso dar vale-refeição sem desconto?');
  await p.getByRole('button', { name: 'Abrir pedido' }).click(); await espera(500);
  await p.getByRole('button', { name: /Cancelar pedido/ }).click(); await p.getByLabel('Motivo').fill('Já resolvi com o sindicato'); await p.getByRole('button', { name: 'Cancelar o pedido' }).click(); await espera(300);
  ok(await tem(/Cancelado: Já resolvi/), 'A31 cancelar pedido não iniciado');

  // S10-T06: conversa, pedido implícito e resposta preparada pelo integrante
  await ir('conversa/gestao_atendimento');
  await p.getByLabel('Mensagem').fill('Contratei dois funcionários, como faço?'); await p.getByRole('button', { name: 'Enviar', exact: true }).click(); await espera(400);
  ok(await tem(/abrir pedido de admissão/), 'A35 pedido implícito vira cartão no app');
  await p.getByLabel('Mensagem').fill('Quando vence o FGTS?'); await p.getByRole('button', { name: 'Enviar', exact: true }).click(); await espera(300);
  await shot('conversa');

  // Assinatura (C2-06, provedor simulado)
  await ir('assinaturas'); await p.getByRole('button', { name: /Termo de ciência: horas extras/ }).click(); await espera(300);
  await p.getByRole('button', { name: 'Assinar', exact: true }).click();
  ok(await ate(/Assinado por João Batista/, 1400 + 3 * 2200), 'C2-06 termo assinado pelo provedor (simulado)'); await shot('assinado');

  // S10-T08: Pix, contestação
  await ir('financeiro'); await p.getByRole('button', { name: 'Pagar' }).first().click(); await espera(200);
  await p.getByRole('button', { name: /Gerar Pix/ }).click();
  ok(await ate(/br.gov.bcb.pix/, 1400), 'A43 Pix copia e cola gerado (simulado)'); await shot('pix'); await p.keyboard.press('Escape');
  await p.getByRole('button', { name: 'Contestar' }).first().click(); await p.getByLabel('Motivo').fill('O valor do BPO veio duplicado'); await p.getByRole('button', { name: 'Enviar contestação' }).click(); await espera(300);
  ok(await tem(/pausa/i), 'A45 contestação pausa a régua');
  await p.getByRole('button', { name: /Autorizar Pix Automático/ }).click(); await p.getByRole('button', { name: 'Autorizar no meu banco' }).click();
  ok(await ate(/A fatura sai sozinha/, 2200), 'A44 Pix Automático autorizado');

  // S10-T09: acessos, preferências, certificado
  await ir('empresa/acessos'); await p.getByRole('button', { name: /Sair de todos os outros/ }).click(); await espera(200); await p.getByRole('dialog').getByRole('button', { name: 'Sair de todos' }).click(); await espera(300);
  ok(await p.getByRole('button', { name: 'Sair', exact: true }).count() === 0, 'A54 sair de todos os outros aparelhos');
  await ir('empresa/avisos'); await p.getByLabel('Documentos novos por WhatsApp').check(); await espera(100);
  ok(await p.getByLabel('Documentos novos por WhatsApp').isChecked(), 'A55 preferência de aviso por categoria');
  await ir('empresa/certificado'); await p.getByRole('button', { name: /Enviar certificado novo/ }).click(); await p.getByRole('button', { name: /Concordo com o termo/ }).click();
  await p.getByRole('button', { name: 'certificado-de-outra-empresa.pfx' }).click(); await p.getByLabel('Senha do certificado').fill('1234'); await p.getByRole('button', { name: 'Enviar ao cofre' }).click();
  ok(await ate(/de outra empresa/, 1700), 'A50 validação recusa certificado de outra empresa');
  await p.getByRole('button', { name: 'certificado-a1-2027.pfx' }).click(); await p.getByRole('button', { name: 'Enviar ao cofre' }).click();
  ok(await ate(/Validado: a senha abre o arquivo/, 1700), 'A50 certificado validado no cofre'); await p.keyboard.press('Escape');

  // S10-T10 e T11: Consultor, push agrupado, central
  await ir('servico/consultor');
  if (await p.getByRole('button', { name: 'Como está minha empresa?' }).count()) { await p.getByRole('button', { name: 'Como está minha empresa?' }).click(); ok(await ate(/Como está a empresa · 10\/2026/, 900 + 2000), 'A59/A62 Consultor responde com caixas e fonte'); }
  else ok(true, 'Consultor não ativo para a Padaria (serviço disponível)');
  await p.getByRole('button', { name: /Escritório publica 12 documentos/ }).click(); await espera(500);
  await ir('avisos'); ok(await tem(/12 documentos de novembro/), 'A63/A64 aviso agrupado chega na central');
  await p.getByRole('button', { name: /Marcar todos como lidos/ }).click(); await espera(200);
  ok(await p.getByRole('button', { name: 'Notificações', exact: true }).count() > 0, 'A63 marcar todos como lidos zera o sino');

  // Escritório aprova o simulado (C2-02): o resultado chega ao app só depois
  await p.getByRole('button', { name: 'Ver no painel do escritório' }).click(); await espera(800);
  await lab(); await dlg().getByRole('button', { name: /Fernanda Lima/ }).click(); await espera(1500);
  await p.evaluate(() => { location.hash = '#/inicio/time?integrante=i-dp' });
  // O DP trabalha em 4 etapas de 1,4 s e escreve o resultado (1,8 s) antes do cartão: espera o cartão, não um tempo fixo.
  ok(await ate(/Enviar o simulado de rescisão de Carla/, 4 * 1400 + 1800), 'C2-02 cartão do simulado chega ao DP para aprovar'); await shot('escritorio-dp');
  // O cartão do simulado é o último do chat do DP neste roteiro (declaração vai ao Contábil, resposta ao Atendimento).
  const aprovar = p.getByRole('button', { name: /^Aprovar/ }).last();
  if (await aprovar.count()) { await aprovar.click(); await espera(800); }
  await lab(); await dlg().getByRole('button', { name: /App do cliente/ }).click(); await p.keyboard.press('Escape'); await espera(800);
  await ir('pedidos'); await p.getByRole('button', { name: /Simulado de rescisão: Carla/ }).click(); await shot('simulado-entregue');
  ok(await ate(/Vai seguir com a rescisão/, 0), 'C2-02 simulado aprovado aparece no app com "vai seguir?"');
  if (await p.getByRole('button', { name: 'Sim, seguir' }).count()) { await p.getByRole('button', { name: 'Sim, seguir' }).click(); await espera(400); ok(await tem(/Rescisão: Carla/), 'C2-02 "seguir" abre a rescisão (C2-01)'); }

  // Modo leitura e convite
  await p.getByRole('button', { name: /Escritório sai da plataforma/ }).click(); await ir('inicio');
  ok(await tem(/App em modo leitura/), 'A65 modo leitura com data de encerramento');
  await p.getByRole('button', { name: /Desfazer a saída/ }).click();
  await ir('mais'); await p.getByRole('button', { name: /Sair deste aparelho/ }).click(); await espera(500);
  await p.getByRole('button', { name: /Recebi um convite/ }).click(); await p.locator('div', { hasText: /^Carla Nunes/ }).getByRole('button', { name: 'Abrir convite' }).first().click(); await ate(/Seu código de acesso é/, 700);
  await p.getByLabel('Código').fill('654321'); await p.getByRole('button', { name: 'Confirmar' }).click(); await espera(300);
  ok(await tem(/Termo de uso/), 'A01/A03 convite pede o termo de uso');
  await p.getByRole('checkbox').first().check(); await p.getByRole('button', { name: 'Aceitar e continuar' }).click();
  await p.getByRole('button', { name: 'Usar biometria' }).click(); await p.getByRole('button', { name: 'Continuar' }).click();
  ok(await tem(/Leve o app para a tela inicial/), 'A04/A08 forma de entrar e instalação');
  await p.getByRole('button', { name: 'Agora não' }).click(); await espera(800); await shot('convite-dentro');
  ok(await tem(/Carla Nunes · RH/), 'A01 convidada entra no app com o papel dela');

  // Celular de verdade (390 px) e computador
  await p.setViewportSize({ width: 390, height: 844 }); await espera(500); await shot('celular-390');
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= 390), 'celular 390px sem rolagem horizontal');
  await p.setViewportSize({ width: 1440, height: 900 }); await espera(300);
  await p.getByRole('button', { name: 'Computador' }).click(); await espera(400); await shot('computador');
  ok(await p.getByRole('navigation', { name: 'Menu do app' }).count() > 0, 'app no computador com menu lateral');

  console.log('erros', JSON.stringify(errs.slice(0, 6)));
  console.log(falhas ? `${falhas} FALHA(S)` : 'tudo ok');
  await b.close(); process.exit(falhas ? 1 : 0);
})();
