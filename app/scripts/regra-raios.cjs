// Regra dos raios (design system, forma.md): todo canto usa um token de raio
// (rounded-sm, -md, -lg, -xl, -cartao, -campo, -painel, -full), que sai do
// raio base do tema (`raio_borda`) e escala com a marca do escritório. Este
// script acusa raio em pixel solto (rounded-[14px], rounded-tl-[6px]) em src/.
// A exceção é a moldura do aparelho no app do cliente, que desenha o hardware.
//
// Uso: node scripts/regra-raios.cjs   (roda também em `npm run build`)
const fs = require('fs')
const path = require('path')

const raiz = path.join(__dirname, '..', 'src')
const excecoes = new Set([path.join(raiz, 'cliente', 'MolduraCliente.tsx')])
const solto = /(^|[\s"'`{:!])(?:[a-z0-9-]+:)*rounded(?:-[a-z]{1,2})?-\[[\d.]+(?:px|rem)\]/

const achados = []
function varrer(dir) {
  for (const nome of fs.readdirSync(dir)) {
    const p = path.join(dir, nome)
    if (fs.statSync(p).isDirectory()) varrer(p)
    else if (/\.tsx?$/.test(nome) && !excecoes.has(p))
      fs.readFileSync(p, 'utf8')
        .split('\n')
        .forEach((linha, i) => {
          const codigo = linha.replace(/\/\/.*$/, '')
          if (/^\s*\*/.test(linha)) return
          if (solto.test(codigo)) achados.push(`${path.relative(path.join(raiz, '..'), p)}:${i + 1}: ${linha.trim().slice(0, 140)}`)
        })
  }
}
varrer(raiz)
if (achados.length) {
  console.error(`Regra dos raios: ${achados.length} raio(s) em pixel solto:`)
  for (const a of achados) console.error('  ' + a)
  console.error('Use o token de forma.md mais próximo: sm (8,5px), md (12,75), lg (17), cartao (20), campo (24), xl (25,5), painel (34) ou full.')
  process.exit(1)
}
console.log('Regra dos raios: todos os cantos usam token.')
