/* Miniaturas e visão geral em grade (tecla O). */

let thumbRO = null;
function observeThumb(t) {
  if (!thumbRO && 'ResizeObserver' in window) {
    thumbRO = new ResizeObserver((entries) => {
      entries.forEach((en) => {
        const w = en.contentRect.width;
        if (w) en.target.style.setProperty('--s', w / STAGE_W);
      });
    });
  }
  if (thumbRO) thumbRO.observe(t);
  else requestAnimationFrame(() => t.style.setProperty('--s', (t.offsetWidth || 300) / STAGE_W));
}

/** Cria uma miniatura do slide i. Com step, o que ainda vai entrar aparece fantasma. */
function makeThumb(i, step) {
  const wrap = el('div', 'thumb');
  const src = Deck.slides[i];
  if (!src) {
    wrap.appendChild(el('div', 'thumb-empty', 'Fim'));
    return wrap;
  }
  const inner = el('div', 'thumb-stage');
  const c = src.cloneNode(true);
  c.classList.remove('is-before', 'is-after', 'no-tr');
  c.classList.add('is-active');
  c.removeAttribute('aria-hidden');
  $$('[id]', c).forEach((n) => n.removeAttribute('id'));
  $$('.notes', c).forEach((n) => n.remove());
  $$('.is-in', c).forEach((n) => n.classList.remove('is-in'));
  finalizeStatic(c);
  if (step != null) {
    $$('[data-trig]', c).forEach((u) => {
      if ((+u.dataset.trig || 0) > step) u.classList.add('is-pending');
    });
  }
  inner.appendChild(c);
  wrap.appendChild(inner);
  observeThumb(wrap);
  return wrap;
}

const Overview = {
  open: false,
  root: null,
  sel: 0,

  build() {
    const root = el('div', 'overview');
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', 'Visão geral dos slides');
    const head = el('div', 'overview-head');
    head.innerHTML = `<b>${Deck.slides.length} slides</b><span>Setas para escolher, Enter para abrir, O ou Esc para fechar</span>`;
    const grid = el('div', 'overview-grid');
    Deck.slides.forEach((s, i) => {
      const item = el('button', 'ov-item');
      item.type = 'button';
      item.style.setProperty('--od', Math.min(i, 30) * 12 + 'ms');
      item.appendChild(makeThumb(i));
      const meta = el('div', 'ov-meta');
      const title = s.dataset.title || (s.querySelector('.title, h1, h2') || {}).textContent || '';
      meta.innerHTML = `<b>${i + 1}</b><span></span>`;
      meta.querySelector('span').textContent = title.trim().slice(0, 60) || s.dataset.src || '';
      meta.title = s.dataset.src || '';
      item.appendChild(meta);
      item.addEventListener('click', () => {
        this.close();
        go(i, 0, 'animate');
      });
      grid.appendChild(item);
    });
    root.append(head, grid);
    document.body.appendChild(root);
    this.root = root;
    this.items = $$('.ov-item', grid);
    this.grid = grid;
  },

  toggle() {
    this.open ? this.close() : this.show();
  },

  show() {
    if (!this.root) this.build();
    this.open = true;
    this.sel = Deck.index;
    this.items.forEach((it, i) => it.classList.toggle('is-current', i === Deck.index));
    this.mark();
    reflow(this.root);
    this.root.classList.add('is-on');
    const cur = this.items[Deck.index];
    if (cur) cur.scrollIntoView({ block: 'center' });
  },

  close() {
    this.open = false;
    if (this.root) this.root.classList.remove('is-on');
  },

  mark() {
    this.items.forEach((it, i) => it.classList.toggle('is-selected', i === this.sel));
    const it = this.items[this.sel];
    if (it) it.scrollIntoView({ block: 'nearest' });
  },

  cols() {
    const a = this.items[0];
    if (!a) return 1;
    let c = 0;
    for (const it of this.items) {
      if (it.offsetTop !== a.offsetTop) break;
      c++;
    }
    return c || 1;
  },

  key(e) {
    const k = e.key;
    const n = this.items.length;
    let s = this.sel;
    if (k === 'ArrowRight') s++;
    else if (k === 'ArrowLeft') s--;
    else if (k === 'ArrowDown') s += this.cols();
    else if (k === 'ArrowUp') s -= this.cols();
    else if (k === 'Home') s = 0;
    else if (k === 'End') s = n - 1;
    else if (k === 'Enter' || k === ' ') {
      this.close();
      go(this.sel, 0, 'animate');
      e.preventDefault();
      return true;
    } else if (k === 'Escape' || k === 'o' || k === 'O') {
      this.close();
      e.preventDefault();
      return true;
    } else return false;
    this.sel = Math.max(0, Math.min(n - 1, s));
    this.mark();
    e.preventDefault();
    return true;
  },
};
