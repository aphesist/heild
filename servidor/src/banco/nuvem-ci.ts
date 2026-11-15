import { appendFileSync, readdirSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
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
 *  - dá ao login `app_api` (que já existe) uma senha nova, gerada aqui, a cada execução;
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

  const senha = randomBytes(24).toString('base64url')
  mascarar(senha)
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
    await adm.unsafe(`alter role app_api with password '${senha}'`)
  } finally {
    await adm.end()
  }

  // A API conecta pelo mesmo pooler, como app_api (no pooler, o usuário leva o ref).
  const api = new URL(url)
  api.username = `app_api.${PROJETO}`
  api.password = senha
  const saida = process.env.GITHUB_ENV
  const linhas = [
    `HEILD_TESTE_URL_ADMIN=${url}`,
    `HEILD_PG_URL_ADMIN=${url}`,
    `HEILD_PG_URL_API=${api.toString()}`,
    `HEILD_PG_SENHA_API=${senha}`,
    `HEILD_CONFIRMAR_PROJETO=${PROJETO}`,
  ]
  if (saida) appendFileSync(saida, linhas.join('\n') + '\n')
  console.log(`HEILD-BACKEND (${PROJETO}) pronto para os testes: migrações em dia, só escritórios de demonstração, login da API com senha nova.`)
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : String(e))
  process.exit(1)
})
