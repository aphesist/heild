// Prova de conceito: os dois endpoints da medição em Node (Fastify + postgres.js + jose).
import Fastify from 'fastify'
import postgres from 'postgres'
import { importSPKI, jwtVerify } from 'jose'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'

const chave = await importSPKI(readFileSync('../pub.pem', 'utf8'), 'ES256')
const sql = postgres({ host: '127.0.0.1', port: 5433, user: 'app_api', database: 'heild', max: 20 })
const app = Fastify({ logger: false })

async function claims(req) {
  const t = (req.headers.authorization ?? '').slice(7)
  const { payload } = await jwtVerify(t, chave, { algorithms: ['ES256'] })
  return payload
}
const fixar = (tx, c) => tx`select set_config('request.jwt.claims', ${JSON.stringify(c)}, true), set_config('role', 'authenticated', true)`

app.get('/v1/tarefas', async (req, rep) => {
  const c = await claims(req)
  const setor = req.query.setor ?? 'fiscal'
  const linhas = await sql.begin(async (tx) => {
    await fixar(tx, c)
    return tx`select id, titulo, cliente_id, setor_id, atividade_id, status, responsavel_id, prazo_interno, prazo_legal, extras
      from tarefa where setor_id = ${setor} and status in ('a_fazer','em_andamento','aguardando_cliente','em_revisao')
      order by prazo_interno limit 50`
  })
  return { dados: linhas }
})

app.post('/v1/tarefas/:id/concluir', async (req, rep) => {
  const c = await claims(req)
  const esc = c.app_metadata.escritorio_id
  const r = await sql.begin(async (tx) => {
    await fixar(tx, c)
    const [t] = await tx`update tarefa set status = case when status = 'concluida' then 'em_andamento' else 'concluida' end, atualizado_em = now()
      where id = ${req.params.id} returning id, cliente_id, setor_id, status, titulo`
    if (!t) return null
    const [cad] = await tx`select seq, ultimo_hash from cadeia_evento for update`
    const seq = BigInt(cad.seq) + 1n
    const nome = t.status === 'concluida' ? 'tarefa.concluir' : 'tarefa.iniciar'
    const hash = createHash('sha256').update(cad.ultimo_hash).update(`${esc}|${seq}|${nome}|${c.sub}|${t.id}`).digest()
    await tx`insert into evento (escritorio_id, seq, nome, ator_tipo, ator_id, cliente_id, setor_id, ferramenta, nivel, resultado, resultado_ref, origem, texto, hash_anterior, hash)
      values (${esc}, ${seq.toString()}, ${nome}, 'pessoa', ${c.sub}, ${t.cliente_id}, ${t.setor_id}, ${nome}, 'executar', 'ok', ${t.id}, 'tela', ${'concluiu ' + t.titulo}, ${cad.ultimo_hash}, ${hash})`
    await tx`update cadeia_evento set seq = ${seq.toString()}, ultimo_hash = ${hash}`
    return { tarefa: t, evento_seq: seq.toString() }
  })
  if (!r) return rep.code(404).send({ erro: 'tarefa não encontrada' })
  return r
})

await app.listen({ port: Number(process.env.PORTA ?? 8081), host: '127.0.0.1' })
