/* Motor da apresentação: estado, navegação, teclado, toque, hash, cromo. */

const Deck = (window.Deck = {
  slides: [],
  index: -1,
  step: 0,
  muted: false, // true enquanto aplica estado vindo de outra janela (não rebroadcast)
});

function maxStep(i) {
  const s = Deck.slides[i];
  return s ? s._max || 0 : 0;
}

/* ---------- Escala do palco ---------- */
function fitStage() {
  const stage = $('#stage');
  if (!stage) return;
  const s = Math.min(innerWidth / STAGE_W, innerHeight / STAGE_H);
  stage.style.setProperty('--scale', s);
}

/* ---------- Ir para slide/build ---------- */
const leaveTimers = new WeakMap();
let enterTimer = 0;

function go(i, step, how) {
  const n = Deck.slides.length;
  if (!n) return;
  i = Math.max(0, Math.min(n - 1, i | 0));
  const max = maxStep(i);
  step = step === 'end' ? max : Math.max(0, Math.min(max, step | 0));
  how = how || 'animate';

  if (MODE === 'presenter') {
    Deck.index = i;
    Deck.step = step;
    renderPresenter();
    broadcastState();
    return;
  }

  const prev = Deck.slides[Deck.index];
  const next = Deck.slides[i];

  if (i !== Deck.index) {
    clearTimeout(enterTimer);
    Deck.slides.forEach((s, k) => {
      s.classList.toggle('is-before', k < i);
      s.classList.toggle('is-after', k > i);
    });
    if (prev) {
      prev.classList.remove('is-active');
      prev.setAttribute('aria-hidden', 'true');
      const t = setTimeout(() => {
        if (!prev.classList.contains('is-active')) resetSlide(prev);
      }, 900);
      leaveTimers.set(prev, t);
    }
    clearTimeout(leaveTimers.get(next));
    resetSlide(next);
    next.classList.add('is-active');
    next.removeAttribute('aria-hidden');
    if (how === 'instant') {
      setSlideStep(next, step, 'instant');
    } else {
      // build 0 anima na chegada; builds acima de 0 já chegam prontos
      if (step > 0) setSlideStep(next, step, 'instant');
      else enterTimer = setTimeout(() => setSlideStep(next, 0, 'animate'), ENTER_DELAY);
    }
  } else {
    clearTimeout(enterTimer);
    setSlideStep(next, step, how);
  }

  Deck.index = i;
  Deck.step = step;
  updateChrome();
  updateHash();
  broadcastState();
}

/** Repete as animações do slide atual desde o início (tecla R ou botão ↺). */
function replaySlide() {
  if (MODE === 'presenter') {
    Deck.step = 0;
    renderPresenter();
    sendSync({ type: 'replay', index: Deck.index });
    return;
  }
  const s = Deck.slides[Deck.index];
  if (!s) return;
  clearTimeout(enterTimer);
  resetSlide(s);
  Deck.step = 0;
  enterTimer = setTimeout(() => setSlideStep(s, 0, 'animate'), ENTER_DELAY);
  updateChrome();
  updateHash();
  broadcastState();
}

/** Volta TODOS os slides ao estado inicial e repete o atual (Shift+R ou botão "↺ tudo"). */
function resetAll() {
  if (MODE === 'presenter') {
    Deck.step = 0;
    renderPresenter();
    sendSync({ type: 'resetall', index: Deck.index });
    return;
  }
  Deck.slides.forEach((s) => {
    clearTimeout(leaveTimers.get(s));
    resetSlide(s);
  });
  replaySlide();
}

function nextStep() {
  if (Deck.step < maxStep(Deck.index)) go(Deck.index, Deck.step + 1, 'animate');
  else if (Deck.index < Deck.slides.length - 1) go(Deck.index + 1, 0, 'animate');
}

function prevStep() {
  if (Deck.step > 0) go(Deck.index, Deck.step - 1, 'animate');
  else if (Deck.index > 0) go(Deck.index - 1, 'end', 'instant');
}

/** Estado recebido de outra janela: anima se for o passo vizinho, salta se não. */
function syncTo(i, step) {
  if (i === Deck.index && step === Deck.step) return;
  Deck.muted = true;
  try {
    const max = maxStep(Deck.index);
    if ((i === Deck.index && step === Deck.step + 1) || (i === Deck.index + 1 && step === 0 && Deck.step === max)) nextStep();
    else if ((i === Deck.index && step === Deck.step - 1) || (i === Deck.index - 1 && Deck.step === 0 && step === maxStep(i))) prevStep();
    else go(i, step, step === 0 ? 'animate' : 'instant');
  } finally {
    Deck.muted = false;
  }
}

/* ---------- Cromo ---------- */
function updateChrome() {
  const chrome = $('.chrome');
  if (!chrome) return;
  const n = Deck.slides.length;
  const s = Deck.slides[Deck.index];
  const max = maxStep(Deck.index);
  const p = n > 1 ? (Deck.index + (max ? Deck.step / (max + 1) : 0)) / (n - 1) : 1;
  $('.chrome-progress i', chrome).style.setProperty('--p', Math.min(1, p));
  $('.chrome-num b', chrome).textContent = Deck.index + 1;
  $('.chrome-num span', chrome).textContent = ' / ' + n;
  chrome.classList.toggle('is-hidden', !!(s && s.dataset.chrome === 'off'));
  document.title = (s && s.dataset.title ? s.dataset.title + ' · ' : '') + BASE_TITLE;
}
const BASE_TITLE = document.title;

/* ---------- Hash (#12 ou #12.2) ---------- */
function parseHash() {
  const m = /^#(\d+)(?:\.(\d+))?$/.exec(location.hash || '');
  if (!m) return null;
  return { i: Math.max(0, parseInt(m[1], 10) - 1), step: m[2] ? parseInt(m[2], 10) : 0 };
}
function updateHash() {
  const h = '#' + (Deck.index + 1) + (Deck.step ? '.' + Deck.step : '');
  if (location.hash === h) return;
  try {
    history.replaceState(null, '', h);
  } catch (e) {
    Deck.ignoreHash = true;
    location.hash = h;
  }
}

/* ---------- Tela preta, tela cheia, ir para ---------- */
function toggleBlack(force) {
  const b = $('.blackout');
  const on = force != null ? force : !b.classList.contains('is-on');
  b.classList.toggle('is-on', on);
}

function toggleFullscreen() {
  const d = document;
  try {
    if (d.fullscreenElement || d.webkitFullscreenElement) (d.exitFullscreen || d.webkitExitFullscreen).call(d);
    else {
      const r = d.documentElement;
      const p = (r.requestFullscreen || r.webkitRequestFullscreen).call(r);
      if (p && p.catch) p.catch(() => {});
    }
  } catch (e) {}
}

let gotoBuf = '';
let gotoTimer = 0;
function gotoShow() {
  const g = $('.goto');
  if (!g) return;
  g.innerHTML = gotoBuf ? `Ir para o slide <b>${gotoBuf}</b> · Enter` : '';
  g.classList.toggle('is-on', !!gotoBuf);
  clearTimeout(gotoTimer);
  if (gotoBuf) gotoTimer = setTimeout(() => ((gotoBuf = ''), gotoShow()), 3000);
}

/* ---------- Teclado ---------- */
function onKey(e) {
  if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
  const t = e.target;
  if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
  const k = e.key;

  if (Overview.open && Overview.key(e)) return;

  if (/^[0-9]$/.test(k)) {
    gotoBuf = (gotoBuf + k).slice(-3);
    gotoShow();
    e.preventDefault();
    return;
  }
  if (k === 'Enter' && gotoBuf) {
    go(parseInt(gotoBuf, 10) - 1, 0, 'animate');
    gotoBuf = '';
    gotoShow();
    e.preventDefault();
    return;
  }
  if (k === 'Backspace' && gotoBuf) {
    gotoBuf = gotoBuf.slice(0, -1);
    gotoShow();
    e.preventDefault();
    return;
  }

  const lk = k.length === 1 ? k.toLowerCase() : k;
  let handled = true;
  switch (lk) {
    case 'ArrowRight':
    case 'ArrowDown':
    case 'PageDown':
    case 'Enter':
    case 'n':
      nextStep();
      break;
    case ' ':
      e.shiftKey ? prevStep() : nextStep();
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
    case 'PageUp':
    case 'Backspace':
      prevStep();
      break;
    case 'Home':
      go(0, 0, 'animate');
      break;
    case 'End':
      go(Deck.slides.length - 1, 0, 'animate');
      break;
    case 'f':
      if (MODE !== 'presenter') toggleFullscreen();
      break;
    case 'o':
      if (MODE === 'show') Overview.toggle();
      break;
    case 'b':
    case '.':
      if (MODE === 'show') toggleBlack();
      else sendSync({ type: 'black' });
      break;
    case 'p':
      if (MODE === 'show') openPresenter();
      break;
    case 'r':
      e.shiftKey ? resetAll() : replaySlide();
      break;
    case 'Escape':
      if (gotoBuf) {
        gotoBuf = '';
        gotoShow();
      } else if (MODE === 'show' && $('.blackout.is-on')) toggleBlack(false);
      else handled = false;
      break;
    default:
      handled = false;
  }
  if (handled) e.preventDefault();
}

/* ---------- Clique, toque e swipe ---------- */
let touch = null;
let suppressClickUntil = 0;

function onClick(e) {
  if (Overview.open) return;
  if (Date.now() < suppressClickUntil) return;
  if (e.button !== 0) return;
  if (e.target.closest('a, button, input, textarea, select, [data-no-advance]')) return;
  if ($('.blackout.is-on')) {
    toggleBlack(false);
    return;
  }
  if (e.clientX < innerWidth * 0.22) prevStep();
  else nextStep();
}

function onTouchStart(e) {
  if (e.touches.length !== 1) return (touch = null);
  touch = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() };
}
function onTouchEnd(e) {
  if (!touch || Overview.open) return;
  const p = e.changedTouches[0];
  const dx = p.clientX - touch.x;
  const dy = p.clientY - touch.y;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) {
    suppressClickUntil = Date.now() + 600;
    dx < 0 ? nextStep() : prevStep();
  }
  touch = null;
}

/* ---------- Cursor some quando parado ---------- */
let idleTimer = 0;
function onMouseMove() {
  document.documentElement.classList.remove('hide-cursor');
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => document.documentElement.classList.add('hide-cursor'), 2500);
}

function bindInput() {
  addEventListener('keydown', onKey);
  addEventListener('resize', fitStage);
  addEventListener('hashchange', () => {
    if (Deck.ignoreHash) return (Deck.ignoreHash = false);
    const h = parseHash();
    if (h && (h.i !== Deck.index || h.step !== Deck.step)) go(h.i, h.step, h.step ? 'instant' : 'animate');
  });
  if (MODE === 'show') {
    $('#viewport').addEventListener('click', onClick);
    addEventListener('touchstart', onTouchStart, { passive: true });
    addEventListener('touchend', onTouchEnd, { passive: true });
    addEventListener('mousemove', onMouseMove, { passive: true });
    const rb = $('.replay');
    if (rb) rb.addEventListener('click', (e) => { e.stopPropagation(); replaySlide(); rb.blur(); });
    const ra = $('.replay-all');
    if (ra) ra.addEventListener('click', (e) => { e.stopPropagation(); resetAll(); ra.blur(); });
  }
}
