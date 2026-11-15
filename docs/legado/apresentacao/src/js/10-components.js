/* Montagem dos componentes a partir de atributos: dados (data-bind), barras, linha,
   Gantt, diagrama com conectores, palavras e máscaras. Roda uma vez, antes do motor. */

/* ---------- data-bind: valores de window.MODELO ---------- */
function applyBindings(root) {
  const M = window.MODELO;
  const missing = new Set();
  $$('[data-bind]', root).forEach((e) => {
    const key = e.dataset.bind;
    const v = M ? getPath(M, key) : undefined;
    if (v === undefined || v === null) {
      missing.add(key);
      e.classList.add('is-unbound');
      return;
    }
    const isNum = typeof v === 'number' && Number.isFinite(v);
    if (e.classList.contains('bar') || e.classList.contains('gantt-bar')) {
      if (isNum) e.dataset.value = v;
      return;
    }
    if (isNum && e.hasAttribute('data-count-to')) {
      e.dataset.countTo = v;
      return;
    }
    if (isNum) {
      const f = numberFormatOf(e);
      e.textContent = fmt(v, f.decimals, f.prefix, f.suffix);
    } else {
      e.textContent = String(v);
    }
  });
  if (missing.size && M) {
    console.info('[apresentação] data-bind sem valor em MODELO (mantido o texto do HTML):', [...missing].join(', '));
  }
}

/* ---------- Barras ---------- */
function buildBars(chart) {
  if (chart._built) return;
  chart._built = true;
  const bars = $$(':scope > .bar', chart);
  const vals = bars.map((b) => num(b.dataset.value, 0));
  const max = num(chart.dataset.max, Math.max(...vals, 0) || 1);
  const stagger = num(chart.dataset.stagger, 140);
  const base = num(chart.dataset.delay, 0);
  const horizontal = chart.classList.contains('is-horizontal');
  if (!chart.dataset.anim) chart.dataset.anim = 'bars';

  bars.forEach((b, i) => {
    const v = vals[i];
    const own = b.hasAttribute('data-step');
    const d = own ? num(b.dataset.delay, 0) : base + i * stagger;
    b.style.setProperty('--h', Math.max(0, Math.min(100, (v / max) * 100)) + '%');
    b.style.setProperty('--d', d + 'ms');
    if (own && !b.dataset.anim) b.dataset.anim = 'bar';

    if (b.querySelector('.bar-fill')) return; // marcação manual
    const value = el('span', 'bar-value');
    if (b.dataset.display != null) {
      value.textContent = b.dataset.display;
    } else {
      const f = numberFormatOf(b, chart);
      value.dataset.countTo = v;
      value.dataset.decimals = f.decimals;
      if (f.prefix) value.dataset.prefix = f.prefix;
      if (f.suffix) value.dataset.suffix = f.suffix;
      value.dataset.delay = d + 250;
      value.textContent = fmt(v, f.decimals, f.prefix, f.suffix);
    }
    const fill = el('span', 'bar-fill');
    const label = el('span', 'bar-label');
    label.innerHTML = b.dataset.label || '';
    if (horizontal) {
      const track = el('span', 'bar-track');
      track.append(fill, value);
      b.append(label, track);
    } else {
      b.append(value, fill, label);
    }
  });
}

/* ---------- Linha ---------- */
let lineGradId = 0;
function buildLine(box) {
  if (box._built) return;
  box._built = true;
  const vals = (box.dataset.values || '').split(/[;,]\s*/).map(Number).filter((v) => Number.isFinite(v));
  if (vals.length < 2) return;
  const labels = (box.dataset.labels || '').split(/\s*[;,]\s*/);
  const W = box.offsetWidth || 1200;
  const H = box.offsetHeight || 520;
  const padT = 70;
  const padB = 56;
  const padX = 24;
  const min = num(box.dataset.min, Math.min(0, ...vals));
  const max = num(box.dataset.max, Math.max(...vals) * 1.08);
  const f = numberFormatOf(box);
  const color = box.dataset.color || '';
  const X = (i) => padX + (i * (W - padX * 2)) / (vals.length - 1);
  const Y = (v) => padT + (1 - (v - min) / (max - min || 1)) * (H - padT - padB);
  const pts = vals.map((v, i) => [X(i), Y(v)]);

  // curva suave (Catmull-Rom -> Bézier)
  let d = `M${pts[0][0]},${pts[0][1]}`;
  const smooth = box.dataset.smooth !== 'false';
  for (let i = 1; i < pts.length; i++) {
    if (!smooth) {
      d += ` L${pts[i][0]},${pts[i][1]}`;
      continue;
    }
    const p0 = pts[i - 2] || pts[i - 1];
    const p1 = pts[i - 1];
    const p2 = pts[i];
    const p3 = pts[i + 1] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }
  const id = 'clg' + ++lineGradId;
  const s = svg('svg', { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'none', 'aria-hidden': 'true' });
  const defs = svg('defs');
  const lg = svg('linearGradient', { id: id + 's', x1: '0', x2: '1', y1: '0', y2: '0' });
  const stops = color ? [color, color] : ['#7cc4ff', '#b4a0ff', '#ffc983'];
  stops.forEach((c, i) => lg.appendChild(svg('stop', { offset: i / (stops.length - 1), 'stop-color': c })));
  const ag = svg('linearGradient', { id: id + 'a', x1: '0', x2: '0', y1: '0', y2: '1' });
  ag.appendChild(svg('stop', { offset: 0, 'stop-color': color || '#b4a0ff', 'stop-opacity': 0.28 }));
  ag.appendChild(svg('stop', { offset: 1, 'stop-color': color || '#b4a0ff', 'stop-opacity': 0 }));
  defs.append(lg, ag);
  s.appendChild(defs);
  // grade horizontal discreta
  [0, 0.5, 1].forEach((t) => {
    const y = padT + t * (H - padT - padB);
    s.appendChild(svg('line', { x1: 0, x2: W, y1: y, y2: y, class: 'cl-grid' }));
  });
  const area = svg('path', {
    d: `${d} L${pts[pts.length - 1][0]},${H - padB} L${pts[0][0]},${H - padB} Z`,
    fill: `url(#${id}a)`,
    class: 'fade-part',
  });
  const line = svg('path', { d, class: 'cl-line dl', stroke: `url(#${id}s)`, pathLength: 1 });
  s.append(area, line);
  // pontos e rótulos
  const showAll = box.dataset.points === 'all';
  pts.forEach((p, i) => {
    const last = i === pts.length - 1;
    if (showAll || last) {
      s.appendChild(
        svg('circle', { cx: p[0], cy: p[1], r: last ? 11 : 7, class: 'cl-dot fade-part', stroke: last ? stops[stops.length - 1] : stops[0] })
      );
    }
    if (labels[i]) {
      const t = svg('text', { x: p[0], y: H - 12, 'text-anchor': i === 0 ? 'start' : last ? 'end' : 'middle', class: 'cl-label' });
      t.textContent = labels[i];
      s.appendChild(t);
    }
  });
  if (box.dataset.showLast !== 'false') {
    const p = pts[pts.length - 1];
    const t = svg('text', { x: p[0], y: p[1] - 30, 'text-anchor': 'end', class: 'cl-value fade-part' });
    t.textContent = box.dataset.lastLabel || fmt(vals[vals.length - 1], f.decimals, f.prefix, f.suffix);
    s.appendChild(t);
  }
  box.appendChild(s);
  if (!box.dataset.anim) box.dataset.anim = 'draw';
}

/* ---------- Gantt ---------- */
function buildGantt(g) {
  if (g._built) return;
  g._built = true;
  const cols = num(g.dataset.cols, 12);
  g.style.setProperty('--cols', cols);
  if (!g.dataset.anim) g.dataset.anim = 'gantt';
  const stagger = num(g.dataset.stagger, 160);
  const base = num(g.dataset.delay, 0);

  const labels = (g.dataset.labels || '').split(/\s*[;,]\s*/).filter(Boolean);
  if (labels.length) {
    const head = el('div', 'gantt-head');
    const scale = el('div', 'gantt-scale');
    labels.forEach((l) => scale.appendChild(el('span', '', l)));
    head.append(el('span', ''), scale);
    g.insertBefore(head, g.firstChild);
  }

  $$(':scope > .gantt-row', g).forEach((row, i) => {
    let track = $('.gantt-track', row);
    if (!track) {
      track = el('div', 'gantt-track');
      $$(':scope > .gantt-bar', row).forEach((b) => track.appendChild(b));
      row.appendChild(track);
    }
    $$('.gantt-bar', track).forEach((b, j) => {
      b.style.setProperty('--from', num(b.dataset.from, 0));
      b.style.setProperty('--to', num(b.dataset.to, num(b.dataset.from, 0) + 1));
      if (b.hasAttribute('data-step')) {
        if (!b.dataset.anim) b.dataset.anim = 'gantt-bar';
      } else {
        b.style.setProperty('--d', base + i * stagger + j * 80 + 'ms');
      }
    });
  });

  const markers = $$(':scope > .gantt-marker', g);
  if (markers.length) {
    g.classList.add('has-markers');
    const ov = el('div', 'gantt-overlay');
    const rows = $$(':scope > .gantt-row', g).length + (labels.length ? 1 : 0);
    markers.forEach((m, k) => {
      m.style.setProperty('--at', num(m.dataset.at, 0));
      if (m.dataset.label && !m.querySelector('span')) m.appendChild(el('span', '', m.dataset.label));
      if (m.hasAttribute('data-step')) {
        if (!m.dataset.anim) m.dataset.anim = 'gantt-marker';
      } else {
        m.style.setProperty('--d', base + rows * stagger + 200 + k * 200 + 'ms');
      }
      ov.appendChild(m);
    });
    g.appendChild(ov);
  }
}

/* ---------- Diagrama: nós em sequência + conectores desenhados ---------- */
const WIRES = [];

function buildDiagram(dg) {
  if (dg._built) return;
  dg._built = true;
  const stagger = num(dg.dataset.stagger, 240);
  const base = num(dg.dataset.delay, 0);
  const childAnim = dg.dataset.childAnim || 'scale-in';
  const drawMs = 900;
  let t = base;

  // ordem do documento define a sequência: nó, fio, nó...
  const items = $$('.node, .wire', dg);
  const wiresSvg = svg('svg', { class: 'diagram-wires', 'aria-hidden': 'true' });
  dg.insertBefore(wiresSvg, dg.firstChild);

  items.forEach((it) => {
    const own = it.hasAttribute('data-step');
    if (it.classList.contains('node')) {
      if (!it.dataset.anim) it.dataset.anim = childAnim;
      if (!own && it.dataset.delay == null) {
        it.dataset.delay = t;
        t += stagger;
      }
      return;
    }
    // fio
    const delay = it.dataset.delay != null ? num(it.dataset.delay, 0) : own ? 0 : t;
    if (!own && it.dataset.delay == null) t += Math.round(stagger * 1.4);
    const tone = (it.dataset.tone || '').split(/\s+/).filter(Boolean);
    const g = svg('g', { class: 'wire-g' });
    tone.forEach((c) => g.classList.add('is-' + c));
    g.dataset.anim = 'draw';
    g.dataset.delay = delay;
    if (own) g.dataset.step = it.dataset.step;
    g.style.setProperty('--dur-draw', (it.dataset.duration || drawMs) + 'ms');
    const path = svg('path', { class: 'wire-path dl', pathLength: 1 });
    g.appendChild(path);
    const arrow = it.dataset.arrow || 'end';
    const heads = [];
    if (arrow === 'end' || arrow === 'both') heads.push(['end', svg('path', { class: 'wire-head fade-part' })]);
    if (arrow === 'start' || arrow === 'both') heads.push(['start', svg('path', { class: 'wire-head fade-part' })]);
    heads.forEach((h) => g.appendChild(h[1]));
    wiresSvg.appendChild(g);

    let label = null;
    if (it.dataset.label) {
      label = el('span', 'wire-label');
      tone.forEach((c) => label.classList.add('is-' + c));
      label.innerHTML = it.dataset.label;
      if (it.dataset.labelSide) label.classList.add('at-' + it.dataset.labelSide);
      label.dataset.anim = 'fade';
      label.dataset.delay = delay + drawMs * 0.6;
      if (own) label.dataset.step = it.dataset.step;
      dg.appendChild(label);
    }
    WIRES.push({
      dg,
      path,
      heads,
      label,
      from: it.dataset.from,
      to: it.dataset.to,
      side: it.dataset.side || 'auto',
      offset: num(it.dataset.offset, 0),
      fromOffset: num(it.dataset.fromOffset, 0),
      toOffset: num(it.dataset.toOffset, 0),
      bend: num(it.dataset.bend, 0.5),
      labelAt: num(it.dataset.labelAt, 0.5),
      slide: dg.closest('.slide'),
    });
    it.remove();
  });
}

function findNode(slide, dg, ref) {
  if (!ref) return null;
  return dg.querySelector(`[data-node="${ref}"]`) || (slide && slide.querySelector('#' + CSS.escape(ref)));
}

function layoutWires() {
  WIRES.forEach((w) => {
    const A = findNode(w.slide, w.dg, w.from);
    const B = findNode(w.slide, w.dg, w.to);
    if (!A || !B) {
      if (!w.warned) console.warn('[apresentação] conector sem nó:', w.from, '→', w.to);
      w.warned = true;
      return;
    }
    const a = offsetWithin(A, w.dg);
    const b = offsetWithin(B, w.dg);
    const ra = { x: a.x, y: a.y, w: A.offsetWidth, h: A.offsetHeight };
    const rb = { x: b.x, y: b.y, w: B.offsetWidth, h: B.offsetHeight };
    const ca = { x: ra.x + ra.w / 2, y: ra.y + ra.h / 2 };
    const cb = { x: rb.x + rb.w / 2, y: rb.y + rb.h / 2 };
    const dx = cb.x - ca.x;
    const dy = cb.y - ca.y;
    let vertical;
    if (w.side === 'v') vertical = true;
    else if (w.side === 'h') vertical = false;
    else {
      // vertical se os nós não se sobrepõem na horizontal o suficiente
      const gapY = Math.max(rb.y - (ra.y + ra.h), ra.y - (rb.y + rb.h));
      const gapX = Math.max(rb.x - (ra.x + ra.w), ra.x - (rb.x + rb.w));
      vertical = gapY > gapX;
    }
    const GAP = 12;
    let p1;
    let p2;
    let c1;
    let c2;
    const o = w.offset;
    if (w.side === 'hv' || w.side === 'vh') {
      // cotovelo: sai na horizontal e entra na vertical (hv), ou o contrário (vh)
      if (w.side === 'hv') {
        p1 = { x: dx > 0 ? ra.x + ra.w + GAP : ra.x - GAP, y: ca.y + o + w.fromOffset };
        p2 = { x: cb.x + o + w.toOffset, y: dy > 0 ? rb.y - GAP : rb.y + rb.h + GAP };
        c1 = { x: p1.x + (p2.x - p1.x) * 0.75, y: p1.y };
        c2 = { x: p2.x, y: p2.y - (p2.y - p1.y) * 0.6 };
      } else {
        p1 = { x: ca.x + o + w.fromOffset, y: dy > 0 ? ra.y + ra.h + GAP : ra.y - GAP };
        p2 = { x: dx > 0 ? rb.x - GAP : rb.x + rb.w + GAP, y: cb.y + o + w.toOffset };
        c1 = { x: p1.x, y: p1.y + (p2.y - p1.y) * 0.75 };
        c2 = { x: p2.x - (p2.x - p1.x) * 0.6, y: p2.y };
      }
    } else if (vertical) {
      const down = dy > 0;
      p1 = { x: ca.x + o + w.fromOffset, y: down ? ra.y + ra.h + GAP : ra.y - GAP };
      p2 = { x: cb.x + o + w.toOffset, y: down ? rb.y - GAP : rb.y + rb.h + GAP };
    } else {
      const right = dx > 0;
      p1 = { x: right ? ra.x + ra.w + GAP : ra.x - GAP, y: ca.y + o + w.fromOffset };
      p2 = { x: right ? rb.x - GAP : rb.x + rb.w + GAP, y: cb.y + o + w.toOffset };
    }
    if (c1) {
      // já calculado (cotovelo)
    } else if (vertical) {
      const my = p1.y + (p2.y - p1.y) * w.bend;
      c1 = { x: p1.x, y: my };
      c2 = { x: p2.x, y: my };
    } else {
      const mx = p1.x + (p2.x - p1.x) * w.bend;
      c1 = { x: mx, y: p1.y };
      c2 = { x: mx, y: p2.y };
    }
    const r = (n) => Math.round(n * 10) / 10;
    w.path.setAttribute('d', `M${r(p1.x)},${r(p1.y)} C${r(c1.x)},${r(c1.y)} ${r(c2.x)},${r(c2.y)} ${r(p2.x)},${r(p2.y)}`);

    const headAt = (tip, from) => {
      let ux = tip.x - from.x;
      let uy = tip.y - from.y;
      const len = Math.hypot(ux, uy) || 1;
      ux /= len;
      uy /= len;
      const L = 16;
      const Wd = 8;
      const bx = tip.x - ux * L;
      const by = tip.y - uy * L;
      return `M${r(tip.x + ux * 2)},${r(tip.y + uy * 2)} L${r(bx - uy * Wd)},${r(by + ux * Wd)} L${r(bx + uy * Wd)},${r(by - ux * Wd)} Z`;
    };
    w.heads.forEach(([where, h]) => {
      h.setAttribute('d', where === 'end' ? headAt(p2, c2) : headAt(p1, c1));
    });
    if (w.label) {
      const t = w.labelAt;
      const mt = 1 - t;
      const bx = mt * mt * mt * p1.x + 3 * mt * mt * t * c1.x + 3 * mt * t * t * c2.x + t * t * t * p2.x;
      const by = mt * mt * mt * p1.y + 3 * mt * mt * t * c1.y + 3 * mt * t * t * c2.y + t * t * t * p2.y;
      w.label.style.left = r(bx) + 'px';
      w.label.style.top = r(by) + 'px';
    }
  });
}

/* ---------- SVG livre: data-anim="draw" em <svg> ou <path> ---------- */
function prepareDraw(root) {
  const shapes = 'path, line, polyline, polygon, circle, ellipse, rect';
  $$('[data-anim="draw"]', root).forEach((d) => {
    const list = d.matches(shapes) ? [d] : $$(shapes, d);
    list.forEach((p) => {
      if (p.classList.contains('fade-part') || p.classList.contains('cl-grid') || p.classList.contains('no-draw')) return;
      if (p.closest('defs')) return;
      p.classList.add('dl');
      if (!p.hasAttribute('pathLength')) p.setAttribute('pathLength', '1');
    });
  });
}

/* ---------- Palavras e máscara ---------- */
function splitWords(e) {
  if (e._split) return;
  e._split = true;
  const stagger = num(e.dataset.stagger, 70);
  const base = num(e.dataset.delay, 0);
  let i = 0;
  const walk = (node) => {
    Array.from(node.childNodes).forEach((n) => {
      if (n.nodeType === 3) {
        const parts = n.textContent.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        parts.forEach((p) => {
          if (!p) return;
          if (/^\s+$/.test(p)) {
            frag.appendChild(document.createTextNode(p));
            return;
          }
          const w = el('span', 'w');
          const wi = el('span', 'wi', p);
          wi.style.setProperty('--wd', base + i++ * stagger + 'ms');
          w.appendChild(wi);
          frag.appendChild(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR' && !n.classList.contains('w')) {
        walk(n);
      }
    });
  };
  walk(e);
  // gradiente contínuo ao longo do título: cada palavra recebe sua fatia
  const grads = e.classList.contains('grad-text') ? [e] : $$('.grad-text', e);
  grads.forEach((gEl) => {
    const ws = $$('.wi', gEl);
    let total = 0;
    ws.forEach((w) => (total += w.offsetWidth || 1));
    let acc = 0;
    ws.forEach((w) => {
      const wd = w.offsetWidth || 1;
      w.style.backgroundSize = (total / wd) * 100 + '% 100%';
      w.style.backgroundPosition = (total - wd ? (acc / (total - wd)) * 100 : 0) + '% 0';
      acc += wd;
    });
  });
}

function wrapMask(e) {
  if (e.querySelector(':scope > .mask-inner')) return;
  const inner = el('span', 'mask-inner');
  while (e.firstChild) inner.appendChild(e.firstChild);
  e.appendChild(inner);
}

/* ---------- Stagger: filhos diretos entram em sequência ---------- */
function prepareStagger(p) {
  const stagger = num(p.dataset.stagger, 110);
  const base = num(p.dataset.delay, 0);
  const type = p.dataset.childAnim || 'fade-up';
  let i = 0;
  Array.from(p.children).forEach((c) => {
    if (c.classList.contains('notes')) return;
    if (!c.dataset.anim) c.dataset.anim = type;
    if (c.hasAttribute('data-step')) return;
    if (c.dataset.delay == null) c.dataset.delay = base + i * stagger;
    i++;
  });
}

/* Ordem de montagem de um slide */
function buildComponents(slide) {
  $$('.chart-bars', slide).forEach(buildBars);
  $$('.chart-line', slide).forEach(buildLine);
  $$('.gantt', slide).forEach(buildGantt);
  $$('[data-anim="stagger"]', slide).forEach(prepareStagger);
  $$('.diagram', slide).forEach(buildDiagram);
  prepareDraw(slide);
  $$('[data-anim="words"]', slide).forEach(splitWords);
  $$('[data-anim="mask"]', slide).forEach(wrapMask);
}
