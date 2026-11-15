/* Unidades animáveis, builds (data-step), contadores e digitação. */

const ENTER_DELAY = 160; // ms entre o slide surgir e as animações começarem

/** Prepara um slide: monta componentes e descobre as unidades e o número de builds. */
function prepareSlide(slide) {
  buildComponents(slide);

  const units = $$('[data-anim], [data-step], [data-count-to]', slide).filter((u) => !u.closest('.notes'));
  let max = 0;
  units.forEach((u) => {
    if (u.hasAttribute('data-step') && !u.dataset.anim) u.dataset.anim = 'fade-up';
    // o build de uma unidade é o maior data-step entre ela e seus ancestrais no slide
    let trig = 0;
    for (let a = u; a && a !== slide; a = a.parentElement || a.parentNode) {
      if (a.dataset && a.dataset.step != null) trig = Math.max(trig, parseInt(a.dataset.step, 10) || 0);
    }
    u.dataset.trig = trig;
    max = Math.max(max, trig);
    const d = num(u.dataset.delay, 0);
    if (d) u.style.setProperty('--d', d + 'ms');
    if (u.dataset.anim === 'type') {
      if (u.dataset.text == null) u.dataset.text = u.textContent.trim();
    }
    if (u.hasAttribute('data-count-to')) {
      u._fmt = numberFormatOf(u);
    }
  });
  slide._units = units;
  slide._max = max;
}

/* ---------- Contador ---------- */
function countText(u, v) {
  const f = u._fmt || numberFormatOf(u);
  return fmt(v, f.decimals, f.prefix, f.suffix);
}
function countFrom(u) {
  return num(u.dataset.countFrom, 0);
}
function countTo(u) {
  return num(u.dataset.countTo, 0);
}

function runCount(u, instant) {
  const tok = (u._tok = (u._tok || 0) + 1);
  const to = countTo(u);
  if (instant || REDUCED) {
    u.textContent = countText(u, to);
    return;
  }
  const from = countFrom(u);
  const dur = num(u.dataset.duration, 1600);
  const delay = num(u.dataset.delay, 0) + 120;
  u.textContent = countText(u, from);
  setTimeout(() => {
    if (u._tok !== tok) return;
    const t0 = performance.now();
    const step = (now) => {
      if (u._tok !== tok) return;
      const t = Math.min(1, (now - t0) / dur);
      u.textContent = countText(u, from + (to - from) * easeOut(t));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, delay);
}

/* ---------- Digitação ---------- */
function runType(u, instant) {
  const tok = (u._tok = (u._tok || 0) + 1);
  const text = u.dataset.text || '';
  u.classList.remove('is-typed', 'is-typing');
  if (instant || REDUCED) {
    u.textContent = text;
    u.classList.add('is-typed');
    return;
  }
  const speed = num(u.dataset.speed, 38);
  const delay = num(u.dataset.delay, 0) + 250;
  u.textContent = '';
  u.classList.add('is-typing');
  let i = 0;
  const tick = () => {
    if (u._tok !== tok) return;
    i++;
    u.textContent = text.slice(0, i);
    if (i >= text.length) {
      u.classList.remove('is-typing');
      u.classList.add('is-typed');
      return;
    }
    const ch = text[i - 1];
    const pause = /[,.;:?!]/.test(ch) ? speed * 5 : ch === ' ' ? speed * 1.6 : speed;
    setTimeout(tick, pause * (0.6 + Math.random() * 0.8));
  };
  setTimeout(tick, delay);
}

/* ---------- Mostrar / esconder unidades ---------- */
function revealUnit(u, instant) {
  u.classList.add('is-in');
  if (u.hasAttribute('data-count-to')) runCount(u, instant);
  if (u.dataset.anim === 'type') runType(u, instant);
}

function concealUnit(u) {
  u.classList.remove('is-in');
  u._tok = (u._tok || 0) + 1;
  if (u.hasAttribute('data-count-to')) u.textContent = countText(u, countFrom(u));
  if (u.dataset.anim === 'type') {
    u.textContent = '';
    u.classList.remove('is-typing', 'is-typed');
  }
}

/** Aplica o build "step" ao slide. how: 'animate' | 'instant'. */
function setSlideStep(slide, step, how) {
  const instant = how === 'instant';
  if (instant) slide.classList.add('no-tr');
  (slide._units || []).forEach((u) => {
    const want = (+u.dataset.trig || 0) <= step;
    const has = u.classList.contains('is-in');
    if (want && !has) revealUnit(u, instant);
    else if (!want && has) concealUnit(u);
  });
  if (instant) {
    reflow(slide);
    nextFrame(() => slide.classList.remove('no-tr'));
  }
}

/** Volta o slide ao estado inicial, sem transição. */
function resetSlide(slide) {
  slide.classList.add('no-tr');
  (slide._units || []).forEach((u) => {
    if (u.classList.contains('is-in')) concealUnit(u);
    else if (u.hasAttribute('data-count-to')) u.textContent = countText(u, countFrom(u));
    else if (u.dataset.anim === 'type') u.textContent = '';
  });
  reflow(slide);
  slide.classList.remove('no-tr');
}

/** Estado final permanente (impressão, miniaturas). */
function finalizeStatic(root) {
  root.classList.add('is-static');
  $$('[data-count-to]', root).forEach((u) => {
    u.textContent = countText(u, countTo(u));
  });
  $$('[data-anim="type"]', root).forEach((u) => {
    u.textContent = u.dataset.text || u.textContent;
    u.classList.remove('is-typing', 'is-typed');
  });
}
