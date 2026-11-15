// Ajudante dos scripts de QA: limpa o banco do navegador, entra como Fernanda
// Lima (Administradora) e esconde a aba da demonstração. Mesmo roteiro do
// qa-interface.cjs, num lugar só para os scripts novos (ui-lab-qa.cjs).
const espera = (p, ms) => p.waitForTimeout(ms)

async function abrir(p, base) {
  await p.goto(base)
  await p.waitForFunction(() => document.body && !document.body.innerText.includes('Abrindo o escritório'), null, { timeout: 45000 })
}

/** Banco de demonstração limpo e sessão da Fernanda Lima. */
async function entrar(p, base) {
  await abrir(p, base)
  await p.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('heild:') || k.startsWith('ui-lab:')).forEach((k) => localStorage.removeItem(k)))
  await p.reload()
  await p.waitForFunction(() => document.body && !document.body.innerText.includes('Abrindo o escritório'), null, { timeout: 45000 })
  await espera(p, 600)
  await p.getByRole('button', { name: /Fernanda Lima/ }).first().click()
  await p.getByRole('button', { name: 'Entrar', exact: true }).click()
  await espera(p, 500)
  if (await p.getByLabel('Código').count()) {
    await p.getByLabel('Código').fill('123456')
    await p.keyboard.press('Enter')
  }
  await espera(p, 1500)
  await p.keyboard.press('Control+Shift+D').catch(() => {})
}

/** Entra no app do cliente como João Batista (depois de `entrar`). */
async function entrarApp(p, base) {
  await p.goto(base + '#/app')
  await espera(p, 1200)
  if (await p.getByLabel('WhatsApp ou e-mail').count()) {
    await p.getByRole('button', { name: /^João Batista/ }).click()
    await p.getByRole('button', { name: 'Receber código' }).click()
    await espera(p, 1200)
    await p.getByLabel('Código').fill('123456')
    await p.getByRole('button', { name: 'Entrar', exact: true }).click()
    await espera(p, 1000)
  }
}

module.exports = { entrar, entrarApp, abrir, espera }
