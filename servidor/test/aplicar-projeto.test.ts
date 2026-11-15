import { describe, expect, it } from 'vitest'
import { aplicarProjeto, refDoProjeto } from '../src/banco/aplicar-projeto.ts'

/** O caminho de aplicar no projeto novo (B5): as travas que valem antes de qualquer conexão. */

const ref = 'abcdefghijklmnopqrst'

describe('aplicar no projeto Supabase novo', () => {
  it('acha o projeto pela URL (conexão direta e pooler)', () => {
    expect(refDoProjeto(`postgres://postgres:x@db.${ref}.supabase.co:5432/postgres`)).toBe(ref)
    expect(refDoProjeto(`postgres://postgres.${ref}:x@aws-0-sa-east-1.pooler.supabase.com:5432/postgres`)).toBe(ref)
    expect(refDoProjeto('postgres://postgres@127.0.0.1:54329/heild')).toBeNull()
  })

  it('não aplica sem confirmar o projeto, nem fora do Supabase, nem sem a senha do login da API', async () => {
    await expect(aplicarProjeto({ url: 'postgres://postgres@127.0.0.1:54329/heild', confirmar: ref, senhaApi: 'x'.repeat(30), aplicar: true })).rejects.toThrow(/não é de um projeto Supabase/)
    await expect(aplicarProjeto({ url: `postgres://postgres:x@db.${ref}.supabase.co:5432/postgres`, confirmar: 'outroprojetoqualquer', senhaApi: 'x'.repeat(30), aplicar: true })).rejects.toThrow(/HEILD_CONFIRMAR_PROJETO/)
    await expect(aplicarProjeto({ url: `postgres://postgres:x@db.${ref}.supabase.co:5432/postgres`, confirmar: ref, senhaApi: 'curta', aplicar: true })).rejects.toThrow(/HEILD_PG_SENHA_API/)
  })
})
