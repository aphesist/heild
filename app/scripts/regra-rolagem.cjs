// Regra da rolagem (PADRAO_DE_INTERFACE.md, 10): toda área que rola passa pela
// primitiva <AreaRolagem> (src/components/ui/area-rolagem.tsx), que aplica o
// esmaecido do topo e do fim (ou dos lados). Este script acusa qualquer
// overflow-auto, overflow-x-auto, overflow-y-auto ou overflow-scroll (classe
// Tailwind ou estilo em linha) fora da primitiva, em todo src/ (telas, kit,
// histórias e CSS). Sai com código 1 se achar algum.
//
// Uso: node scripts/regra-rolagem.cjs   (roda também em `npm run build`)
const fs = require('fs')
const path = require('path')

const raiz = path.join(__dirname, '..', 'src')
const permitido = new Set([path.join(raiz, 'components', 'ui', 'area-rolagem.tsx')])
const classe = /(^|[\s"'`{:!])(?:[a-z0-9-]+:)*overflow(?:-[xy])?-(?:auto|scroll)(?=[\s"'`}]|$)/
const estilo = /overflow(?:X|Y)?\s*:\s*['"]?(?:auto|scroll)\b|overflow(?:-[xy])?\s*:\s*(?:auto|scroll)\b/

const achados = []
function varrer(dir) {
  for (const nome of fs.readdirSync(dir)) {
    const p = path.join(dir, nome)
    const st = fs.statSync(p)
    if (st.isDirectory()) varrer(p)
    else if (/\.(tsx?|css)$/.test(nome) && !permitido.has(p)) {
      fs.readFileSync(p, 'utf8')
        .split('\n')
        .forEach((linha, i) => {
          // Comentário que só cita a regra não conta.
          const codigo = linha.replace(/\/\/.*$/, '').replace(/\/\*.*?\*\//g, '')
          if (/^\s*\*/.test(linha)) return
          if (classe.test(codigo) || estilo.test(codigo)) achados.push(`${path.relative(path.join(raiz, '..'), p)}:${i + 1}: ${linha.trim().slice(0, 140)}`)
        })
    }
  }
}
varrer(raiz)
if (achados.length) {
  console.error(`Regra da rolagem: ${achados.length} rolagem(ns) fora de <AreaRolagem> (src/components/ui/area-rolagem.tsx):`)
  for (const a of achados) console.error('  ' + a)
  console.error('Troque por <AreaRolagem eixo="y|x|ambos">, que aplica o esmaecido do topo e do fim.')
  process.exit(1)
}
console.log('Regra da rolagem: nenhuma rolagem fora de <AreaRolagem>.')
