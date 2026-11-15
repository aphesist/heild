// Teste da lógica do configurador (Node, sem dependências): node docs/precificacao/teste_configurador.js
// 1) a lógica nova reproduz os números da v0.4 quando os valores da v0.4 são restaurados;
// 2) os números da v0.5 batem com contas feitas à parte, a partir dos parâmetros crus;
// 3) o fluxo de caixa bate com uma simulação independente; 4) parametros.json e o HTML têm os mesmos valores.
const fs = require('fs'), path = require('path');
const dir = __dirname;
const html = fs.readFileSync(path.join(dir, 'configurador.html'), 'utf8');
const json = JSON.parse(fs.readFileSync(path.join(dir, 'parametros.json'), 'utf8'));
const a = html.indexOf('const PARAMETROS'), b = html.indexOf('// ===== FIM DA LÓGICA');
const L = new Function(html.slice(a, b) + '\nreturn {PARAMETROS,calcular,niveis,propMinIA,entradaPacote,implantacao,precoImplantacao,primeiroAno,equilibrioImplantacao,fluxoCaixa,custoAjuda,custoChat,descontoMaximo,tetoConectores,refBPO,clientesEfetivos};')();
const clone = o => JSON.parse(JSON.stringify(o));
let falhas = 0, total = 0;
const perto = (nome, v, esperado, tol) => { total++; const ok = Math.abs(v - esperado) <= (tol === undefined ? 0.5 : tol); if (!ok) falhas++; console.log((ok ? 'ok    ' : 'FALHA ') + nome + ': ' + (typeof v === 'number' ? +v.toFixed(3) : v) + (ok ? '' : ' (esperado ' + esperado + ')')); };
const igual = (nome, v, esperado) => { total++; const ok = v === esperado; if (!ok) falhas++; console.log((ok ? 'ok    ' : 'FALHA ') + nome + ': ' + v + (ok ? '' : ' (esperado ' + esperado + ')')); };

// 4) parâmetros do HTML = parametros.json
igual('parametros.json igual ao PARAMETROS do HTML', JSON.stringify(L.PARAMETROS), JSON.stringify(json));

// 1) regressão da v0.4 (com os valores históricos dos parâmetros, inclusive o App a R$ 0,30 por cliente, antes da v0.9)
{ const P = clone(L.PARAMETROS);
  P.modulos.app.preco.cliente = 0.3;
  P.modulos.painel.custo.usuario = [6, 25, 60];
  P.ajuda.perguntas_usuario = [0, 0, 0]; P.ajuda.infra_usuario = [0, 0, 0]; P.suporte_chat.usuario = [0, 0, 0];
  P.conectores_teto.gov = {consultas:0, emissoes:0, declaracoes:0, cnpj:2.25/0.6591}; P.conectores_teto.est.consultas = 1.37/0.22;
  const v04 = {base:{P:[990,374],M:[1376,983],G:[2314,2628]}, essencial:{P:[704,292],M:[977,786],G:[1637,2107]},
    operacao:{P:[1436,511],M:[2546,1352],G:[5446,3628]}, completo:{P:[2122,684],M:[4635,1908],G:[10940,5119]}};
  for (const pk in v04) for (const k in v04[pk]) { const r = L.calcular(L.entradaPacote(P, pk, k), P);
    perto('v0.4 '+pk+' '+k+' preço', r.total, v04[pk][k][0], 1); perto('v0.4 '+pk+' '+k+' custo', r.custo, v04[pk][k][1], 1.5); }
  const alto = {P:[1086,829], M:[1698,2143], G:[3279,5664]};
  for (const k in alto) { const r = L.calcular(Object.assign(L.entradaPacote(P,'base',k), {perfil:2}), P); perto('v0.4 alto '+k+' preço', r.total, alto[k][0], 1); perto('v0.4 alto '+k+' custo', r.custo, alto[k][1], 1.5); }
  const e = {modulos:P.pacotes.operacao.modulos, clientes:400, usuarios:10, gb:2000, comp:{marca_branca:true, modo_bpo:true}, perfil:1, numeros:4, subs:4, planos:{intensivo:10}, bolsaUU:0, extraPacotes:0};
  const r = L.calcular(e, P); perto('v0.4 BPO preço', r.total, 7014, 1); perto('v0.4 BPO custo', r.custo, 3637, 1.5); }

// 2) v0.5 e v0.7 (chat de suporte, teto de 130%) e v0.9 (App a R$ 0,60 por cliente), contas à parte
{ const P = clone(L.PARAMETROS);
  // preço do sistema-base montado à parte: soma de base + cliente × clientes efetivos (faixa marginal) + usuário × usuários, mais a marca branca
  const efInd = n => { let s = 0, ant = 0; for (const f of P.faixas_clientes) { const teto = f.ate === null ? Infinity : f.ate; if (n > ant) s += (Math.min(n, teto) - ant)*f.fator; ant = teto; } return s; };
  const precoBase = (c, u) => ['painel','crm','app','gov','timesheet','est'].reduce((t, m) => { const p = P.modulos[m].preco; return t + p.base + p.cliente*efInd(c) + p.usuario*u; }, 0) + P.complementos.marca_branca.preco_fixo;
  igual('v0.9: App a R$ 0,60 por cliente (era 0,30)', P.modulos.app.preco.cliente, 0.6);
  perto('v0.9: App na faixa de 501 a 1.000 clientes cobre o custo provável com folga de 50% ou mais', P.modulos.app.preco.cliente*P.faixas_clientes[5].fator/P.modulos.app.custo.cliente[1], 1.65, 1e-9);
  const diag = 10*0.2*3*3000/1e6*0.075*7.97;                            // diagnóstico de leitura (v0.8): 2 perguntas com 3 chamadas de 3 mil tokens
  const ajuda = 10*8000/1e6*0.075*7.97 + 0.10 + diag;                  // R$ por usuário por mês, provável (R$ 0,16)
  perto('ajuda do sistema por usuário', L.custoAjuda(1, P), ajuda, 1e-9);
  perto('diagnóstico: provável R$ 0,011, ajuda R$ 0,16', diag, 0.0108, 0.0005); perto('ajuda provável arredonda a R$ 0,16', L.custoAjuda(1, P), 0.16, 0.005);
  perto('diagnóstico: baixo R$ 0,001, ajuda R$ 0,06', L.custoAjuda(0, P), 0.06, 0.005); perto('diagnóstico no alto: R$ 0,18; ajuda R$ 0,65', L.custoAjuda(2, P), 0.65, 0.005);
  perto('diagnóstico no alto', L.custoAjuda(2, P) - (30*15000/1e6*0.075*7.97 + 0.20), 12*25000/1e6*0.075*7.97, 1e-9);
  const tetoG = 8*0.24 + 1.6*0.32 + 0.8*0.40 + 0.27*0.6591, tetoE = 8.1*0.22;
  perto('teto Integra e CNPJ', L.tetoConectores(P).gov, tetoG, 1e-9);
  perto('teto InfoSimples', L.tetoConectores(P).est, tetoE, 1e-9);
  perto('P26: teto de Integra e CNPJ em 130% do uso provável (R$ 2,25)', tetoG/2.25*100, 130, 0.5);
  perto('P26: teto de InfoSimples em 130% do uso provável (R$ 1,37)', tetoE/1.37*100, 130, 0.5);
  perto('P25: chat de suporte por assento (provável)', L.custoChat(1, P), 2, 1e-9);
  // médio, sistema-base: custo montado linha a linha
  const M = L.calcular(L.entradaPacote(P, 'base', 'M'), P);
  const custoM = (33 + 0.6*100 + 12.5*15) + 0.43*100 + 2*15 + (5 + 0.2*100) + (25 + 2.25*100) + (15 + 1.37*100) + 15 + 15*ajuda + 15*2;
  perto('M base custo', M.custo, custoM, 1e-6); perto('M base preço (conta à parte)', M.total, precoBase(100, 15), 1e-6); perto('M base preço', M.total, 1404, 1); perto('M base margem', M.margem*100, (precoBase(100, 15) - custoM)/precoBase(100, 15)*100, 1e-6); perto('M base margem arredondada', M.margem*100, 41.0, 0.06);
  const Pq = L.calcular(L.entradaPacote(P, 'base', 'P'), P), G = L.calcular(L.entradaPacote(P, 'base', 'G'), P);
  perto('P base preço (conta à parte)', Pq.total, precoBase(30, 5), 1e-6); perto('P base preço', Pq.total, 999, 1); perto('P base custo', Pq.custo, 311.7 + 10, 0.1); perto('P base margem', Pq.margem*100, 67.8, 0.06);
  perto('G base preço (conta à parte)', G.total, precoBase(300, 40), 1e-6); perto('G base preço', G.total, 2386, 1); perto('G base custo', G.custo, 2134.3 + 80, 0.1); perto('G base margem', G.margem*100, 7.2, 0.06);
  const nM = L.niveis(M, L.entradaPacote(P,'base','M'), P);
  perto('M base (b)', nM.mApos*100, 21.6, 0.06); perto('M base (c)', nM.mLiq*100, 9.1, 0.06);
  // sem consumo extra no uso provável (o teto cobre com folga); no alto, só o que passa do teto
  igual('sem excedente no provável (M)', M.consumo, 0);
  const alt = L.calcular(Object.assign(L.entradaPacote(P,'base','M'), {perfil:2}), P);
  perto('excedente no alto (M)', alt.consumo, ((3.8 - tetoG) + (2.5 - tetoE))*100*1.2, 0.05);
  // P26: o teto sozinho leva o uso alto do médio de −13,5% a −3,9% (sem o chat de suporte; v0.8: com o diagnóstico); com o chat, −7,7%. v0.9 (App a R$ 0,60): −2,1% sem o chat e −5,9% com o chat
  const sc = clone(P); sc.suporte_chat.usuario = [0, 0, 0]; perto('P26: uso alto do médio com teto de 130%, sem o chat', L.calcular(Object.assign(L.entradaPacote(sc,'base','M'), {perfil:2}), sc).margem*100, -2.1, 0.1);
  perto('P26: uso alto do médio com teto de 130% e chat', alt.margem*100, -5.85, 0.06);
  // excedente se o uso real for 150% do provável (médio): (1,5 − 1,3) × (2,25 + 1,37) × 100 × 1,2, na aproximação do teto exato
  perto('P26: risco de extra no provável (médio, uso real a 150% do provável)', ((1.5*2.25 - tetoG) + (1.5*1.37 - tetoE))*100*1.2, 86.2, 0.5);
  // Operação para 1/3 (5 usuários IA Operação), médio
  const e = L.entradaPacote(P, 'base', 'M'); e.planos = {operacao:5}; const r = L.calcular(e, P);
  perto('M IA Operação 1/3 preço', r.total, precoBase(100, 15) + 5*189, 1e-6); perto('M IA Operação 1/3 custo', r.custo, 1067.0 + 30, 0.1);
  // câmbio escala tokens e ajuda
  const Q = clone(P); Q.cambio.valor = 5.69; perto('ajuda com câmbio 5,69', L.custoAjuda(1, Q), 10*8000/1e6*0.075*5.69 + 0.10 + 10*0.2*3*3000/1e6*0.075*5.69, 1e-9);
  // alíquota editável muda só (c)
  const Q2 = clone(P); Q2.cenario.aliquota = 0.17; const n2 = L.niveis(M, L.entradaPacote(P,'base','M'), Q2);
  perto('M (c) com tributos de 17%', n2.mLiq*100, (nM.apos - 0.17*M.total)/M.total*100, 1e-9); perto('(a) não muda com a alíquota', n2.mContrib*100, nM.mContrib*100, 1e-9);
  // pró-labore ligado soma ao fixo
  const Q3 = clone(P); Q3.cenario.prolabore = true; perto('rateio com pró-labore (M, 30 escritórios)', L.niveis(M, L.entradaPacote(P,'base','M'), Q3).rateio, 18200/30, 1e-9);
}


// 2b) tabela 6.4 do estudo (preço, custo provável, (a), (a) alta / pior, (b), (c)), 8.1 e 9.2
{ const P = clone(L.PARAMETROS), cen = {N:30, prolabore:false, aliq:0.125, comissao:0};
  const cfg = (k, pl, fr) => { const e = L.entradaPacote(P, 'base', k); e.planos = pl ? {[pl]: fr === 1 ? e.usuarios : Math.round(e.usuarios*fr)} : {}; return e; };
  const tab = [ // porte, plano, fração, preço, custo, (a), alta, pior, (b), (c)   [v0.7: chat de suporte e teto de 130%; v0.8: diagnóstico de leitura na ajuda; v0.9: App a R$ 0,60 por cliente]
    ['P',null,0,999,322,67.8,35.8,35.8,59.6,47.1], ['P','operacao',0.3333,1377,429,68.8,36.1,30.6,62.9,50.4], ['P','operacao',1,1944,591,69.6,36.2,26.4,65.4,52.9], ['P','intensivo',1,2494,724,71.0,39.6,27.4,67.7,55.2],
    ['M',null,0,1404,828,41.0,-5.85,-5.85,21.6,9.1], ['M','operacao',0.3333,2349,1097,53.3,10.0,2.2,41.7,29.2], ['M','operacao',1,4239,1635,61.4,21.4,8.0,55.0,42.5], ['M','intensivo',1,5889,2033,65.5,29.6,14.25,60.8,48.3],
    ['G',null,0,2386,2214,7.2,-50.45,-50.45,-27.2,-39.7], ['G','operacao',0.3333,4843,2914,39.8,-10.9,-20.4,22.9,10.4], ['G','operacao',1,9946,4367,56.1,12.2,-2.85,47.85,35.35], ['G','intensivo',1,14346,5429,62.2,23.85,7.15,56.4,43.9]];
  for (const [k, pl, fr, preco, custo, a, alta, pior, b, c] of tab) { const nome = '6.4 ' + k + ' ' + (pl || 'sem IA') + (pl ? ' ' + fr : '');
    const e = cfg(k, pl, fr), r = L.calcular(e, P), n = L.niveis(r, e, P, cen);
    perto(nome + ' preço', r.total, preco, 1); perto(nome + ' custo', r.custo, custo, 1); perto(nome + ' (a)', r.margem*100, a, 0.06);
    perto(nome + ' alta', L.calcular(Object.assign(cfg(k, pl, fr), {perfil:2}), P).margem*100, alta, 0.06); perto(nome + ' pior', L.calcular(Object.assign(cfg(k, pl, fr), {perfil:3}), P).margem*100, pior, 0.06);
    perto(nome + ' (b)', n.mApos*100, b, 0.06); perto(nome + ' (c)', n.mLiq*100, c, 0.06); }
  // 8.1: atalhos (preço, custo, margem)
  const at = {essencial:{P:[713,241,66.2],M:[1005,631,37.2],G:[1709,1693,0.9]}, operacao:{P:[1444.5,459,68.2],M:[2574,1197,53.5],G:[5518,3214,41.75]}, completo:{P:[2130.5,632,70.3],M:[4663,1753,62.4],G:[11011,4705,57.3]}};
  for (const pk in at) for (const k in at[pk]) { const r = L.calcular(L.entradaPacote(P, pk, k), P); const [pr, cu, mg] = at[pk][k];
    perto('8.1 ' + pk + ' ' + k + ' preço', r.total, pr, 1); perto('8.1 ' + pk + ' ' + k + ' custo', r.custo, cu, 1); perto('8.1 ' + pk + ' ' + k + ' margem', r.margem*100, mg, 0.06); }
  // 9.2: Completo por cenário (custo, margem)
  const c92 = {P:[[252,88.2],[632,70.3],[1357,37.95],[1555,28.9]], M:[[691,85.2],[1753,62.4],[3707,23.6],[4300,11.4]], G:[[1856,83.15],[4705,57.3],[9871,14.8],[11452,1.1]]};
  for (const k in c92) c92[k].forEach(([cu, mg], pf) => { const r = L.calcular(Object.assign(L.entradaPacote(P, 'completo', k), {perfil:pf}), P);
    perto('9.2 ' + k + ' perfil ' + pf + ' custo', r.custo, cu, 1); perto('9.2 ' + k + ' perfil ' + pf + ' margem', r.margem*100, mg, 0.06); });
  // 9.4 C: equilíbrio em escritórios médios equivalentes (médio arredondado para cima)
  const eq = {base:[15,32], operacao:[7,15]};
  for (const [nome, pl, fr] of [['base',null,0],['operacao','operacao',0.3333]]) { const e = cfg('M', pl, fr), r = L.calcular(e, P);
    igual('9.4 equilíbrio do médio, ' + nome + ', sem pró-labore', Math.ceil(L.niveis(r, e, P, cen).equilibrio), eq[nome][0]);
    igual('9.4 equilíbrio do médio, ' + nome + ', com pró-labore', Math.ceil(L.niveis(r, e, P, {N:30, prolabore:true, aliq:0.125, comissao:0}).equilibrio), eq[nome][1]); }
  // 6.9 B: excedente do teto no uso alto, sistema-base
  const exc = {P:57, M:191, G:572}; for (const k in exc) perto('6.9 excedente no alto, ' + k, L.calcular(Object.assign(cfg(k, null, 0), {perfil:2}), P).consumo, exc[k], 1);
}

// implantação (8.2): horas × R$ 90; piso = custo (margem zero, P27)
{ const P = clone(L.PARAMETROS), esp = {P:[28,2520,4500,2520], M:[60,5400,8500,5400], G:[150,13500,19500,13500]};
  for (const k in esp) { const i = L.implantacao(P, k, false);
    perto('implantação '+k+' horas', i.horas, esp[k][0]); perto('implantação '+k+' custo', i.custo, esp[k][1]); perto('implantação '+k+' tabela', i.tabela, esp[k][2]); perto('implantação '+k+' piso', i.piso, esp[k][3]); }
  const mig = {P:[42,3780,3780], M:[90,8100,8100], G:[226,20340,20340]};
  for (const k in mig) { const i = L.implantacao(P, k, true); perto('com migrações '+k+' horas', i.horas, mig[k][0]); perto('com migrações '+k+' custo', i.custo, mig[k][1]); perto('com migrações '+k+' piso', i.piso, mig[k][2]); }
  const iM = L.implantacao(P, 'M', false);
  perto('margem na tabela (M)', iM.margemTabela*100, (8500-5400)/8500*100, 1e-9); perto('margem no piso (M): zero (P27)', iM.margemPiso*100, 0, 1e-9); perto('desconto máximo (M)', iM.descontoMax*100, (8500-5400)/8500*100, 1e-9); perto('campo de desconto limitado ao menor desconto máximo (Grande, 30,7%)', L.descontoMaximo(P, false)*100, 30.7, 1e-9);
  perto('desconto de 20% em M', L.precoImplantacao(iM, 0.2), 6800); perto('desconto de 40% em M trava no piso (o custo)', L.precoImplantacao(iM, 0.4), 5400); perto('desconto de 36,5% em M leva ao custo', L.precoImplantacao(iM, 0.365), 5400, 0.5); perto('desconto de 51% (o do mercado) em G trava no custo', L.precoImplantacao(L.implantacao(P, 'G', false), 0.51), 13500);
  perto('horas que o valor negociado do mercado paga', iM.horasMercado, 2200/90, 1e-9);
  // primeiro ano do médio, sistema-base: 12 × contribuição + (8.500 − 5.400)
  const r = L.calcular(L.entradaPacote(P,'base','M'), P), c = r.total - r.custo, a1 = L.primeiroAno(c, r.total, 8500, 5400);
  perto('1º ano M: margem', a1.margem, 12*c + 3100, 1e-6); perto('1º ano M: receita', a1.receita, 12*r.total + 8500, 1e-6);
  const q = L.equilibrioImplantacao(c, 3100, 8200); perto('equilíbrio em regime (M)', q.regime, 8200/c, 1e-9); perto('equilíbrio no 1º ano (M)', q.ano1, 12*8200/(12*c + 3100), 1e-9); }

// 3) fluxo de caixa: simulação independente (sem churn), 3 novos por mês, mix 50/40/10, desconto de 20%, à vista
{ const P = clone(L.PARAMETROS);
  const sim = (pacote, novos, opt) => { opt = opt || {};
    const parte = {P:0.5, M:0.4, G:0.1}, un = {}; let acum = 0, saldos = [], acs = [];
    for (const k of ['P','M','G']) { const r = L.calcular(L.entradaPacote(P, pacote, k), P), i = L.implantacao(P, k, false);
      un[k] = {preco:r.total, custo:r.custo, impl:Math.max(i.piso, i.tabela*0.8), ci:i.custo}; }
    for (let t = 1; t <= 12; t++) { let ent = 0, sai = 0;
      for (const k in un) { const n = novos*parte[k];
        ent += n*un[k].impl; sai += n*un[k].ci;                                  // implantação do mês t (à vista)
        const antigos = novos*(t-1)*parte[k];                                    // escritórios assinados antes e já pagando
        ent += antigos*un[k].preco; sai += antigos*un[k].custo; }
      sai += 8200; sai += 0.125*ent; acum += ent - sai; saldos.push(ent - sai); acs.push(acum); }
    return {saldos, acs}; };
  for (const pk of ['base','operacao','completo']) { const s = sim(pk, 3), f = L.fluxoCaixa(P, {pacote:pk});
    let ok = true; f.rows.forEach((r, i) => { if (Math.abs(r.saldo - s.saldos[i]) > 0.01 || Math.abs(r.acum - s.acs[i]) > 0.01) ok = false; });
    igual('fluxo '+pk+' igual à simulação independente (12 meses)', ok, true); }
  const esp = {base:[12, 7, 20233, 5295], operacao:[6, 4, 10778, 116575], completo:[4, 3, 6980, 325289]};
  for (const pk in esp) { const f = L.fluxoCaixa(P, {pacote:pk});
    igual('caixa acumulado positivo ('+pk+')', f.mesCaixaPositivo, esp[pk][0]); igual('resultado do mês positivo ('+pk+')', f.mesSaldoPositivo, esp[pk][1]);
    perto('maior necessidade de caixa ('+pk+')', f.necessidadeMax, esp[pk][2]); perto('caixa acumulado no mês 12 ('+pk+')', f.acumFinal, esp[pk][3]); }
  const f = L.fluxoCaixa(P, {pacote:'base'}); perto('parte da implantação nas entradas, 3 meses', f.parteImplantacao3*100, 82.4, 0.05); perto('parte da implantação, 12 meses', f.parteImplantacao12*100, 46.0, 0.05);
  igual('sem cobrar a implantação, base: caixa não fica positivo', L.fluxoCaixa(P, {pacote:'base', cobra_implantacao:false}).mesCaixaPositivo, null);
  const Q = clone(P); Q.cenario.prolabore = true; igual('com pró-labore, base: caixa não fica positivo em 12 meses', L.fluxoCaixa(Q, {pacote:'base'}).mesCaixaPositivo, null);
  igual('5 escritórios por mês, base: mês 7', L.fluxoCaixa(P, {pacote:'base', novos_mes:5}).mesCaixaPositivo, 7);
  igual('parcelamento em 3 vezes, base: não fica positivo em 12 meses', L.fluxoCaixa(P, {pacote:'base', parcelas:3}).mesCaixaPositivo, null);
  // as parcelas somam o mesmo total: a implantação recebida em 12 meses com 1 e com 3 vezes difere só pelas parcelas ainda não vencidas
  const f1 = L.fluxoCaixa(P, {pacote:'base', parcelas:1}), f3 = L.fluxoCaixa(P, {pacote:'base', parcelas:3});
  perto('mês 1 com 3 parcelas recebe 1/3', f3.rows[0].implRec, f1.rows[0].implRec/3, 1e-6);
  perto('mês 3 com 3 parcelas = 3 meses de 1/3 sobre 3 lotes', f3.rows[2].implRec, f1.rows[0].implRec, 1e-6);
  // churn reduz os ativos
  const fc = L.fluxoCaixa(P, {pacote:'base', churn:0.03}); perto('ativos no mês 3 com 3% de cancelamento (coortes de 1 e 2 meses de casa)', fc.rows[2].ativos, 3*(0.97*0.97 + 0.97), 1e-9); }


// 5) v0.6: pacote BPO financeiro (mensalidade-base + valor por empresa + conector de ERP), núcleo sem Contábil, P9 e as três simulações do subplano 10
{ const P = clone(L.PARAMETROS), d = P.complementos.bpo_fin, base = {gb:0, perfil:1, bolsaUU:0, extraPacotes:0};
  igual('BPO financeiro: mensalidade-base e valor por empresa de teste', d.preco_fixo + '+' + d.preco_empresa, '390+65');
  const sem = Object.assign({}, base, {modulos:['painel','crm','timesheet','app','fin'], clientes:100, usuarios:15, numeros:2, comp:{}, bpoEmpresas:10, subs:1, planos:{}});
  const com = Object.assign({}, sem, {comp:{bpo_fin:true}});
  const dif = L.calcular(com, P), s0 = L.calcular(sem, P);
  perto('pacote BPO, 10 empresas: preço', dif.total - s0.total, 390 + 65*10, 1e-9);
  perto('pacote BPO, 10 empresas: custo (fixo + IA + conector de ERP)', dif.custo - s0.custo, 30 + 10*(9 + 3), 1e-9);
  const alto = L.calcular(Object.assign({}, com, {perfil:2}), P), s2 = L.calcular(Object.assign({}, sem, {perfil:2}), P);
  perto('pacote BPO, 10 empresas: custo no uso alto', alto.custo - s2.custo, 60 + 10*(18 + 8), 1e-9);
  const Q = clone(P); Q.complementos.bpo_fin.preco_fixo = 500; Q.complementos.bpo_fin.preco_empresa = 70;
  perto('mensalidade-base e valor por empresa são editáveis', L.calcular(com, Q).total - L.calcular(sem, Q).total, 500 + 700, 1e-9);
  const ef40 = L.clientesEfetivos(40, P);
  // produto BPO financeiro puro: núcleo no lugar do Painel
  const c2 = Object.assign({}, base, {modulos:['painel','crm','timesheet','app','fin'], semContabil:true, clientes:40, usuarios:6, numeros:1, comp:{marca_branca:true, open_finance:true, bpo_fin:true}, ofClientes:40, bpoEmpresas:40, subs:1, planos:{intensivo:6}});
  const r2 = L.calcular(c2, P), nucleo = r2.linhas.find(l => l.id === 'painel');
  perto('núcleo sem Contábil (40 clientes, 6 usuários): preço', nucleo.preco, 100 + 0.3*ef40 + 5*6, 1e-9);
  perto('núcleo sem Contábil: custo provável', nucleo.custo, 22 + 0.3*40 + 12.5*6, 1e-9);
  perto('chat de suporte vale também no núcleo sem Contábil (6 usuários)', r2.linhas.find(l => l.id === 'suporte_chat').custo, 6*2, 1e-9);
  igual('sem Contábil, gov, est e cores não entram', L.calcular(Object.assign({}, c2, {modulos:c2.modulos.concat(['gov','est','cores'])}), P).linhas.some(l => ['gov','est','cores'].includes(l.id)), false);
  const painel = L.calcular(Object.assign({}, c2, {semContabil:false}), P).linhas.find(l => l.id === 'painel');
  perto('núcleo + Contábil = Painel (diferença de preço: base 100 e 0,40 por cliente)', painel.preco - nucleo.preco, 100 + 0.4*ef40, 1e-9);
  const n2 = L.niveis(r2, c2, P);
  // caso 2 (subplano 10, 9.3)
  perto('caso 2 preço', r2.total, 6329.5, 1); perto('caso 2 custo', r2.custo, 1473, 1); perto('caso 2 (a)', r2.margem*100, 76.7, 0.06); perto('caso 2 (b)', n2.mApos*100, 75.0, 0.06); perto('caso 2 (c)', n2.mLiq*100, 62.5, 0.06);
  perto('caso 2 uso alto (a)', L.calcular(Object.assign({}, c2, {perfil:2}), P).margem*100, 54.2, 0.06);
  // caso 1: contabilidade com BPO financeiro de 10 empresas
  const c1 = Object.assign({}, base, {modulos:['painel','crm','timesheet','app','fin','gov','est'], clientes:100, usuarios:15, numeros:2, comp:{marca_branca:true, open_finance:true, bpo_fin:true}, ofClientes:10, bpoEmpresas:10, subs:1, planos:{operacao:3}});
  const r1 = L.calcular(c1, P), n1 = L.niveis(r1, c1, P);
  perto('caso 1 preço', r1.total, 3720, 1); perto('caso 1 custo', r1.custo, 1417, 1); perto('caso 1 (a)', r1.margem*100, 61.9, 0.06); perto('caso 1 (b)', n1.mApos*100, 54.55, 0.06); perto('caso 1 (c)', n1.mLiq*100, 42.05, 0.06);
  perto('caso 1 uso alto (a)', L.calcular(Object.assign({}, c1, {perfil:2}), P).margem*100, 31.3, 0.06);
  // caso 3: BPO entre escritórios; P9: o Financeiro conta os 8 contratantes
  const c3 = Object.assign({}, base, {modulos:['painel','crm','timesheet','app','fin','gov','est','cores'], clientes:160, usuarios:12, numeros:3, comp:{marca_branca:true, modo_bpo:true}, ofClientes:0, bpoEmpresas:0, subs:8, finClientes:8, planos:{operacao:12}});
  const r3 = L.calcular(c3, P), n3 = L.niveis(r3, c3, P), fin = r3.linhas.find(l => l.id === 'fin');
  perto('P9: Financeiro com 8 contratantes, preço', fin.preco, 80 + 1.3*L.clientesEfetivos(8, P), 1e-9); perto('P9: Financeiro, custo', fin.custo, 8 + 0.1*8, 1e-9);
  perto('caso 3 preço', r3.total, 5412, 1); perto('caso 3 custo', r3.custo, 1963, 1); perto('caso 3 (a)', r3.margem*100, 63.7, 0.06); perto('caso 3 (b)', n3.mApos*100, 55.6, 0.06); perto('caso 3 (c)', n3.mLiq*100, 43.1, 0.06);
  perto('caso 3 uso alto (a)', L.calcular(Object.assign({}, c3, {perfil:2}), P).margem*100, 29.7, 0.06);
  perto('caso 3 sem P9 (Financeiro com 160 clientes) sobe o preço', L.calcular(Object.assign({}, c3, {finClientes:0}), P).total - r3.total, 80 + 1.3*L.clientesEfetivos(160, P) - (80 + 1.3*L.clientesEfetivos(8, P)), 1e-9);
  igual('P5: teto de abuso de convidados por contratante (não é cobrança)', P.complementos.modo_bpo.convidados_max_por_contratante, 10);
  igual('P5: o modo BPO não tem preço por usuário convidado', Object.keys(P.complementos.modo_bpo).some(k => /usuario/.test(k) && /preco/.test(k)), false);
  // referência de mercado de BPO financeiro (S5)
  const rf = L.refBPO(40, P); perto('Sofia, 40 organizações', rf.sofia, 10000); perto('Sofia Founders, 40', rf.founders, 7160); perto('BPO Suite, 40 CNPJs (25 + 15 extras a R$ 84,50)', rf.suite, 1750 + 15*84.5, 1e-9);
  perto('BPO Suite, 10 CNPJs', L.refBPO(10, P).suite, 800, 1e-9);
  igual('regressão: sem semContabil e sem finClientes o Painel é o de sempre', L.calcular(Object.assign({}, c1, {comp:{}}), P).linhas.find(l => l.id === 'painel').preco, 200 + 0.7*L.clientesEfetivos(100, P) + 5*15);
}

console.log('\n' + (total - falhas) + ' de ' + total + ' verificações passaram' + (falhas ? ' — ' + falhas + ' FALHA(S)' : '.'));
process.exit(falhas ? 1 : 0);
