import { appendFileSync, readdirSync } from 'node:fs'
import { createHmac } from 'node:crypto'
import path from 'node:path'
import postgres from 'postgres'
import { refDoProjeto } from './aplicar-projeto.ts'

/**
 * Preparo do CI contra o HEILD-BACKEND (critério da E1; `.github/workflows/backend-nuvem.yml`).
 *
 * Lê a conexão de administrador do segredo `HEILD_BACKEND_DATABASE_URL` (Session pooler de
 * São Paulo) e, com travas:
 *  - só segue se o projeto da URL for o do backend (`PROJETO`); qualquer outro ref para tudo;
 *  - mascara a URL e as senhas no log do Actions (`::add-mask::`) antes de qualquer saída;
 *  - NÃO migra: confere que todas as migrações do repositório já estão em
 *    `heild_interno.migracao` e para se faltar alguma (migrar é o `aplicar-projeto`, à mão);
 *  - recusa banco com escritório que não seja de demonstração (os testes semeiam e restauram);
 *  - a senha do login `app_api` é derivada da do administrador (HMAC, nunca impressa) e só é
 *    trocada se o login falhar: o pooler do Supabase guarda a senha de cada usuário por um
 *    tempo, e trocar a cada execução fazia a seguinte recusar o login (28P01);
 *  - exporta para os passos seguintes (`$GITHUB_ENV`) as conexões de administrador e da API.
 */

export const PROJETO = 'zfjivmgujytrqaiagvpm'
const DEMONSTRACAO = ['esc-andrade', 'esc-horizonte']
const MIGRACOES = path.resolve(import.meta.dirname, '../../../app/supabase/migrations')

const mascarar = (v: string) => console.log(`::add-mask::${v}`)

async function main() {
  const url = process.env.HEILD_BACKEND_DATABASE_URL
  if (!url) throw new Error('Falta o segredo HEILD_BACKEND_DATABASE_URL.')
  const u = new URL(url)
  mascarar(url)
  if (u.password) mascarar(decodeURIComponent(u.password))
  const ref = refDoProjeto(url)
  if (ref !== PROJETO) throw new Error(`A conexão não é do HEILD-BACKEND (${PROJETO}). Nada foi feito.`)
  if (!u.hostname.includes('sa-east-1')) throw new Error('A conexão não é do pooler de São Paulo (sa-east-1). Nada foi feito.')

  const senha = createHmac('sha256', decodeURIComponent(u.password)).update(`heild:app_api:${PROJETO}`).digest('base64url')
  mascarar(senha)
  // A API conecta pelo mesmo pooler, como app_api (no pooler, o usuário leva o ref).
  const api = new URL(url)
  api.username = `app_api.${PROJETO}`
  api.password = senha
  const adm = postgres(url, { ssl: 'require', max: 1, onnotice: () => {}, connect_timeout: 15 })
  try {
    const feitas = new Set((await adm`select nome from heild_interno.migracao`).map((r) => String(r.nome)))
    const faltam = readdirSync(MIGRACOES).filter((a) => a.endsWith('.sql') && !feitas.has(a))
    if (faltam.length) throw new Error(`Faltam migrações no projeto (${faltam.join(', ')}). O CI não migra: aplique com o aplicar-projeto e rode de novo.`)
    const reais = await adm`select id from escritorio where not (id = any(${DEMONSTRACAO}))`
    if (reais.length) throw new Error('O projeto tem escritório que não é de demonstração: os testes semeiam e restauram, e não rodam aqui.')
    const [papel] = await adm`select rolbypassrls from pg_roles where rolname = 'app_api'`
    if (!papel) throw new Error('O login app_api não existe no projeto (é criado pelo aplicar-projeto).')
    if (papel.rolbypassrls) throw new Error('O login app_api fura a RLS: não pode.')
    if (!(await entra(api.toString()))) {
      await adm.unsafe(`alter role app_api with password '${senha}'`)
      console.log('Senha do app_api acertada; esperando o pooler aceitar o login.')
      let ok = false
      for (let i = 0; i < 24 && !ok; i++) {
        await new Promise((r) => setTimeout(r, 5000))
        ok = await entra(api.toString())
      }
      if (!ok) throw new Error('O pooler ainda recusa o login do app_api depois de 2 min (senha guardada no pooler). Rode de novo mais tarde.')
    }
  } finally {
    await adm.end()
  }
  const saida = process.env.GITHUB_ENV
  const linhas = [
    `HEILD_TESTE_URL_ADMIN=${url}`,
    `HEILD_PG_URL_ADMIN=${url}`,
    `HEILD_PG_URL_API=${api.toString()}`,
    `HEILD_PG_SENHA_API=${senha}`,
    `HEILD_CONFIRMAR_PROJETO=${PROJETO}`,
  ]
  if (saida) appendFileSync(saida, linhas.join('\n') + '\n')
  console.log(`HEILD-BACKEND (${PROJETO}) pronto para os testes: migrações em dia, só escritórios de demonstração, login da API conferido pelo pooler.`)
}

/** O login entra pelo pooler? (28P01 = senha recusada; outro erro sobe.) */
async function entra(url: string): Promise<boolean> {
  const c = postgres(url, { ssl: 'require', max: 1, onnotice: () => {}, connect_timeout: 15 })
  try {
    await c`select 1`
    return true
  } catch (e) {
    if ((e as { code?: string }).code === '28P01') return false
    throw e
  } finally {
    await c.end()
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : String(e))
  process.exit(1)
})
