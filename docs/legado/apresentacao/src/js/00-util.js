/* Utilidades compartilhadas. O build embrulha todos os arquivos de src/js num único escopo. */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const PARAMS = new URLSearchParams(location.search);
const MODE = PARAMS.has('print') ? 'print' : PARAMS.has('presenter') ? 'presenter' : 'show';

let REDUCED = PARAMS.has('reduce');
try {
  REDUCED = REDUCED || matchMedia('(prefers-reduced-motion: reduce)').matches;
} catch (e) {}

const STAGE_W = 1920;
const STAGE_H = 1080;

function num(v, fallback) {
  if (v === undefined || v === null || v === '') return fallback;
  const n = parseFloat(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : fallback;
}

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

const SVG_NS = 'http://www.w3.org/2000/svg';
function svg(tag, attrs) {
  const e = document.createElementNS(SVG_NS, tag);
  if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
  return e;
}

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

const NF = {};
/** Formata em pt-BR: fmt(1234.5, 1, 'R$ ', ' mi') -> "R$ 1.234,5 mi" */
function fmt(n, decimals = 0, prefix = '', suffix = '') {
  const key = decimals;
  if (!NF[key]) {
    NF[key] = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }
  return prefix + NF[key].format(n) + suffix;
}

/** Lê casas decimais, prefixo e sufixo de um elemento (com herança opcional de outro). */
function numberFormatOf(e, parent) {
  const pick = (k) => (e.dataset[k] != null ? e.dataset[k] : parent && parent.dataset[k] != null ? parent.dataset[k] : undefined);
  return {
    decimals: Math.max(0, Math.min(6, num(pick('decimals'), 0) | 0)),
    prefix: pick('prefix') || '',
    suffix: pick('suffix') || '',
  };
}

const easeOut = (t) => 1 - Math.pow(1 - t, 4);

function lsGet(k) {
  try {
    return localStorage.getItem(k);
  } catch (e) {
    return null;
  }
}
function lsSet(k, v) {
  try {
    localStorage.setItem(k, v);
  } catch (e) {}
}

function reflow(e) {
  return e && e.offsetWidth;
}

function nextFrame(fn) {
  requestAnimationFrame(() => requestAnimationFrame(fn));
}

/** Soma offsetLeft/Top até chegar a um ancestral (não é afetado por transform). */
function offsetWithin(node, ancestor) {
  let x = 0;
  let y = 0;
  let n = node;
  while (n && n !== ancestor) {
    x += n.offsetLeft;
    y += n.offsetTop;
    const p = n.offsetParent;
    if (!p) break;
    if (p !== ancestor && !ancestor.contains(p)) {
      // ancestral não posicionado: subtrai a posição dele
      const a = offsetWithin(ancestor, p);
      return { x: x - a.x, y: y - a.y };
    }
    n = p;
  }
  return { x, y };
}
