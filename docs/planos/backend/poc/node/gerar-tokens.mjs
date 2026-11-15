// Gera um JWT ES256 por escritório de teste (esc-1 a esc-100), no formato do Supabase Auth, para o gerador de carga.
import { SignJWT } from 'jose'
import { readFileSync, writeFileSync } from 'node:fs'
import { createPrivateKey } from 'node:crypto'
const pk = createPrivateKey(readFileSync('../priv.pem'))
const tokens = []
for (let e = 1; e <= 100; e++) {
  tokens.push(await new SignJWT({ role: 'authenticated', app_metadata: { escritorio_id: `esc-${e}` } })
    .setProtectedHeader({ alg: 'ES256' }).setSubject(`u${e}`).setExpirationTime('30d').sign(pk))
}
writeFileSync('../tokens.json', JSON.stringify(tokens))
