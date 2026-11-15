#!/usr/bin/env node
// Junta src/ em um único index.html autocontido (CSS e JS embutidos).
// Uso: node build.mjs            -> gera index.html
//      node build.mjs --watch    -> refaz a cada alteração em src/ ou data/
//      node build.mjs --only 20-arquitetura --out /caminho/preview.html
//                                -> só os arquivos de slides que contêm o texto dado, gravando em outro lugar
// Sem dependências: só módulos nativos do Node (>= 18).

import { readFileSync, writeFileSync, readdirSync, existsSync, watch } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = join(ROOT, 'src');
const argVal = (k) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : null; };
const OUT = argVal('--out') || join(ROOT, 'index.html');
const ONLY = argVal('--only');
const MODELO = join(ROOT, 'data', 'modelo.json');

const list = (dir, ext) =>
  existsSync(dir)
    ? readdirSync(dir).filter((f) => f.endsWith(ext) && !f.startsWith('_') && !f.startsWith('.')).sort()
    : [];

function getPath(obj, path) {
  // "planos.lista.individual.preco_mensal": em listas, aceita índice ou o valor de "chave"/"id"
  return String(path)
    .split('.')
    .reduce((o, k) => {
      if (o == null) return undefined;
      if (Array.isArray(o) && !/^\d+$/.test(k)) return o.find((x) => x && (x.chave === k || x.id === k));
      return o[k];
    }, obj);
}

function build() {
  const t0 = Date.now();
  const warnings = [];

  const css = list(join(SRC, 'css'), '.css')
    .map((f) => `/* ==== ${f} ==== */\n` + readFileSync(join(SRC, 'css', f), 'utf8'))
    .join('\n');

  const js = list(join(SRC, 'js'), '.js')
    .map((f) => `// ==== ${f} ====\n` + readFileSync(join(SRC, 'js', f), 'utf8'))
    .join('\n');

  const slideFiles = list(join(SRC, 'slides'), '.html').filter((f) => !ONLY || f.includes(ONLY));
  let total = 0;
  const ids = new Map();
  const slidesHtml = slideFiles
    .map((f) => {
      let html = readFileSync(join(SRC, 'slides', f), 'utf8');
      let n = 0;
      // Marca cada slide com o arquivo de origem (aparece na visão geral e ajuda a depurar).
      html = html.replace(/<section(\s[^>]*?)?\sclass="([^"]*\bslide\b[^"]*)"/g, (m) => {
        n++;
        return m.replace('<section', `<section data-src="${f}"`);
      });
      if (n === 0) warnings.push(`${f}: nenhum <section class="slide"> encontrado`);
      const opens = (html.match(/<section\b/g) || []).length;
      const closes = (html.match(/<\/section>/g) || []).length;
      if (opens !== closes) warnings.push(`${f}: ${opens} <section> abertos e ${closes} fechados`);
      for (const m of html.matchAll(/\sid="([^"]+)"/g)) {
        if (ids.has(m[1])) warnings.push(`id duplicado "${m[1]}" em ${f} e ${ids.get(m[1])} (use prefixos por seção)`);
        else ids.set(m[1], f);
      }
      total += n;
      return `\n<!-- ===== ${f} (${n} slide${n === 1 ? '' : 's'}) ===== -->\n${html.trim()}\n`;
    })
    .join('');

  // Dados opcionais
  let modelo = null;
  if (existsSync(MODELO)) {
    try {
      modelo = JSON.parse(readFileSync(MODELO, 'utf8'));
    } catch (e) {
      warnings.push(`data/modelo.json inválido, ignorado: ${e.message}`);
    }
  }
  const binds = [...slidesHtml.matchAll(/data-bind="([^"]+)"/g)].map((m) => m[1]);
  const missing = [...new Set(binds.filter((k) => getPath(modelo, k) === undefined))];
  if (missing.length)
    warnings.push(
      `${missing.length} data-bind sem valor em data/modelo.json (o texto do HTML fica como reserva): ${missing.join(', ')}`
    );

  const modeloJs = `window.MODELO = ${modelo ? JSON.stringify(modelo).replace(/</g, '\\u003c') : 'window.MODELO || null'};`;

  const template = readFileSync(join(SRC, 'template.html'), 'utf8');
  const out = template
    .replace('{{CSS}}', () => css)
    .replace('{{SLIDES}}', () => slidesHtml)
    .replace('{{MODELO}}', () => modeloJs)
    .replace('{{JS}}', () => `(function () {\n'use strict';\n${js}\n})();`);

  writeFileSync(OUT, out);
  const kb = (Buffer.byteLength(out) / 1024).toFixed(0);
  console.log(
    `index.html: ${total} slides de ${slideFiles.length} arquivo(s), ${kb} KB, ${Date.now() - t0} ms` +
      (modelo ? ', com data/modelo.json' : ', sem data/modelo.json')
  );
  for (const w of warnings) console.warn('  aviso: ' + w);
}

build();

if (process.argv.includes('--watch')) {
  let timer;
  const again = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      try {
        build();
      } catch (e) {
        console.error(e.message);
      }
    }, 80);
  };
  watch(SRC, { recursive: true }, again);
  if (existsSync(join(ROOT, 'data'))) watch(join(ROOT, 'data'), again);
  console.log('Observando src/ e data/ (Ctrl+C para sair)…');
}
