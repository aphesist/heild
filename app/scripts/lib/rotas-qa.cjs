// Rotas das telas reais que os scripts de QA percorrem (qa-interface.cjs e ui-lab-qa.cjs): 67 rotas.
const abas = {
  inicio: ['assistente', 'time', 'visao'],
  painel: ['societario', 'obrigacoes', 'notas', 'fiscal', 'dp', 'contabil', 'consultoria', 'gestao'],
  crm: ['conversas', 'leads', 'comunicados', 'numeros'],
  interna: ['conversas', 'arquivos'],
  timesheet: ['meu', 'confirmacoes', 'equipe', 'rentabilidade'],
  financeiro: ['visao', 'contratos', 'cobranca', 'pagar', 'conciliacao', 'caixa', 'resultado'],
  bpo: ['visao', 'carteira', 'fila', 'rotinas', 'aprovacoes', 'entregas', 'volume', 'rentabilidade', 'configuracao'],
  arquivos: ['pastas', 'recentes'],
  config: ['escritorio', 'usuarios', 'armazenamento', 'tema', 'integrantes', 'assinatura', 'conectores', 'permissoes'],
}
const rotas = []
for (const a of abas.inicio) rotas.push({ grupo: 'Início', rota: `#/inicio/${a}` })
for (const a of abas.painel) {
  rotas.push({ grupo: 'Painel', rota: `#/painel/${a}?cliente=todos` })
  rotas.push({ grupo: 'Painel', rota: `#/painel/${a}?cliente=c1` })
}
for (const a of abas.crm) rotas.push({ grupo: 'CRM e interna', rota: `#/crm/${a}` })
for (const a of abas.interna) rotas.push({ grupo: 'CRM e interna', rota: `#/interna/${a}` })
for (const a of abas.timesheet) rotas.push({ grupo: 'Timesheet', rota: `#/timesheet/${a}` })
for (const a of abas.financeiro) rotas.push({ grupo: 'Financeiro', rota: `#/financeiro/${a}` })
for (const a of abas.bpo) {
  rotas.push({ grupo: 'BPO', rota: `#/bpo/${a}?cliente=todos` })
  if (!['visao', 'carteira', 'volume', 'rentabilidade', 'configuracao'].includes(a)) rotas.push({ grupo: 'BPO', rota: `#/bpo/${a}?cliente=c2` })
}
for (const a of abas.arquivos) rotas.push({ grupo: 'Arquivos e Config', rota: `#/arquivos/${a}` })
for (const a of abas.config) rotas.push({ grupo: 'Arquivos e Config', rota: `#/config/${a}` })
const rotasApp = ['inicio', 'pendencias', 'documentos', 'pedidos', 'assinaturas', 'financeiro', 'avisos', 'mais'].map((a) => ({ grupo: 'App do cliente', rota: `#/app/${a}`, app: true }))
module.exports = { abas, rotas, rotasApp }
