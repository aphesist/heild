// Mede o custo de verificar um JWT ES256 com o jose, num núcleo.
import { importSPKI, jwtVerify } from 'jose'
import { readFileSync } from 'node:fs'
const chave = await importSPKI(readFileSync('../pub.pem', 'utf8'), 'ES256')
const tokens = JSON.parse(readFileSync('../tokens.json'))
const n = 20000; const t0 = performance.now()
for (let i = 0; i < n; i++) await jwtVerify(tokens[i % 100], chave, { algorithms: ['ES256'] })
const ms = performance.now() - t0
console.log(`jose ES256: ${(ms * 1000 / n).toFixed(1)} µs por verificação, ${Math.round(n / ms * 1000)}/s num núcleo`)
