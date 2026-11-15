/**
 * Demonstração no terminal: o CTB-ECD-TRANSMITIR de ponta a ponta, num escritório novo no banco
 * local (operário de demonstração, órgão simulado). Mostra cada passo gravado, a chamada de modelo
 * com o débito da bolsa do setor, o cartão de aprovação e a transmissão depois da decisão humana.
 *
 * Uso: npm run banco && npm run demo   (em pacotes/processos)
 */
import { comEscritorio } from '../src/index.ts'
import { documentoEcd, esperar, montar, pessoa, semear, sqlAdmin } from '../testes/ambiente.ts'

const admin = sqlAdmin()
const h = await montar()
const dizer = (t: string) => console.log(`\n▸ ${t}`)
try {
  const s = await semear(admin)
  const doc = await documentoEcd(admin, s)
  const ana = await pessoa(admin, s.esc, 'u-ana')
  dizer(`Escritório ${s.esc}: Ana (Contábil) pede pelo chat a ECD 2025 da Padaria Exemplo.`)
  const env = await h.registro.chamar(ana, 'contabil.ecd.conferir_e_transmitir', { cliente_id: 'c-1', exercicio: '2025', documento_id: doc })
  console.log(env)
  const id = (env as { execucao_id: string }).execucao_id
  const ler = () => comEscritorio(admin, s.esc, async (tx) => (await tx`select * from execucao where id = ${id}`)[0]!)
  const ex = await esperar(ler, (e) => e.estado === 'aguardando_cartao')
  dizer('Passos gravados até o cartão:')
  console.table(await admin`select ordem, nome, tipo, tentativa, estado, custo_centavos from passo_execucao where execucao_id = ${id} order by ordem, tentativa`)
  dizer('Chamada de modelo (operário de demonstração) e bolsa do setor:')
  console.table(await admin`select contrato, classe, modelo, tokens_entrada, tokens_saida, centavos, saida_valida from chamada_modelo where execucao_id = ${id}`)
  console.table(await admin`select setor, mes, saldo_centavos, gasto_centavos from bolsa_setor where escritorio_id = ${s.esc}`)
  const [c] = await admin`select id, resumo_humano, pode_aprovar from cartao_aprovacao where id = ${ex.cartao_id}`
  dizer(`Cartão para ${c!.pode_aprovar.join(', ')}: ${c!.resumo_humano}`)
  dizer('Ana aprova no cartão.')
  console.log(await h.registro.chamar(ana, 'aprovacao.decidir', { cartao_id: c!.id, decisao: 'aprovar' }))
  const fim = await esperar(ler, (e) => e.estado === 'concluida')
  dizer(`Concluída. Recibo ${fim.saida.recibo}; envios ao órgão: ${h.sped.envios}.`)
  console.table(await admin`select seq, nome, resultado, texto from evento where escritorio_id = ${s.esc} order by seq`)
} finally {
  await h.parar()
  await admin.end()
}
