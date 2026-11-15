/* Visão do apresentador (tecla P) e sincronização entre janelas.
   Três canais redundantes, cada um protegido por try/catch: BroadcastChannel,
   postMessage entre opener/janela aberta e o evento storage do localStorage. */

const SYNC_KEY = 'dgm-deck-sync';
const ME = Math.random().toString(36).slice(2, 10);
let syncSeq = 0;
let bc = null;
let presenterWin = null;
const seenMsgs = new Set();

function sendSync(msg) {
  msg.k = 'dgm-deck';
  msg.from = ME;
  msg.id = ME + ':' + ++syncSeq;
  msg.at = Date.now();
  try {
    if (bc) bc.postMessage(msg);
  } catch (e) {}
  try {
    if (presenterWin && !presenterWin.closed) presenterWin.postMessage(msg, '*');
  } catch (e) {}
  try {
    if (window.opener && !window.opener.closed) window.opener.postMessage(msg, '*');
  } catch (e) {}
  lsSet(SYNC_KEY, JSON.stringify(msg));
}

function broadcastState() {
  if (Deck.muted || MODE === 'print') return;
  sendSync({ type: 'state', index: Deck.index, step: Deck.step });
}

function onSync(msg) {
  if (!msg || msg.k !== 'dgm-deck' || msg.from === ME || seenMsgs.has(msg.id)) return;
  seenMsgs.add(msg.id);
  if (seenMsgs.size > 500) seenMsgs.clear();
  if (msg.type === 'state') syncTo(msg.index | 0, msg.step | 0);
  else if (msg.type === 'hello') {
    sendSync({ type: 'state', index: Deck.index, step: Deck.step });
  } else if (msg.type === 'black' && MODE === 'show') toggleBlack();
  else if (msg.type === 'resetall' && MODE === 'show') {
    Deck.muted = true;
    try {
      if ((msg.index | 0) !== Deck.index) go(msg.index | 0, 0, 'animate');
      resetAll();
    } finally {
      Deck.muted = false;
    }
  }
  else if (msg.type === 'replay' && MODE === 'show') {
    Deck.muted = true;
    try {
      if ((msg.index | 0) !== Deck.index) go(msg.index | 0, 0, 'animate');
      else replaySlide();
    } finally {
      Deck.muted = false;
    }
  }
}

function initSync() {
  if (MODE === 'print') return;
  try {
    bc = new BroadcastChannel('dgm-deck');
    bc.onmessage = (e) => onSync(e.data);
  } catch (e) {
    bc = null;
  }
  addEventListener('message', (e) => onSync(e.data));
  addEventListener('storage', (e) => {
    if (e.key !== SYNC_KEY || !e.newValue) return;
    try {
      const m = JSON.parse(e.newValue);
      if (Date.now() - (m.at || 0) < 5000) onSync(m);
    } catch (err) {}
  });
}

function openPresenter() {
  const url = new URL(location.href);
  url.searchParams.set('presenter', '');
  url.hash = '#' + (Deck.index + 1) + (Deck.step ? '.' + Deck.step : '');
  const href = url.href;
  try {
    presenterWin = window.open(href, 'dgm-presenter', 'width=1280,height=800');
  } catch (e) {
    presenterWin = null;
  }
  if (!presenterWin) {
    console.warn('[apresentação] o navegador bloqueou a janela do apresentador. Permita pop-ups para este arquivo.');
  }
}

/* ---------- Interface do apresentador ---------- */
const PV = {};
let timerStart = 0;
let timerAcc = 0;
let timerRunning = false;

function timerNow() {
  return timerAcc + (timerRunning ? Date.now() - timerStart : 0);
}
function timerFmt(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = String(s % 60).padStart(2, '0');
  return (h ? h + ':' + String(m).padStart(2, '0') : String(m).padStart(2, '0')) + ':' + ss;
}
function timerStartIfNeeded() {
  if (!timerRunning && timerAcc === 0) {
    timerRunning = true;
    timerStart = Date.now();
  }
}

function buildPresenter() {
  document.documentElement.classList.add('is-presenter');
  const root = el('div', 'pv');
  root.innerHTML = `
    <header class="pv-bar">
      <div class="pv-timer" title="Tempo de apresentação">00:00</div>
      <button class="pv-btn" data-act="pause" type="button">Pausar</button>
      <button class="pv-btn" data-act="reset" type="button">Zerar</button>
      <button class="pv-btn" data-act="replay" type="button" title="Repete as animações do slide atual (R)">↺ Repetir slide</button>
      <button class="pv-btn" data-act="resetall" type="button" title="Volta todas as animações da apresentação ao início (Shift+R)">↺ Reiniciar todas</button>
      <div class="pv-count"></div>
      <div class="pv-steps"></div>
      <div class="pv-clock"></div>
    </header>
    <div class="pv-main">
      <section class="pv-col">
        <div class="pv-label">Agora</div>
        <div class="pv-cur"></div>
        <div class="pv-hint">← → avançam aqui e na apresentação · B tela preta · + e − mudam o tamanho das notas</div>
      </section>
      <section class="pv-col">
        <div class="pv-label pv-next-label">A seguir</div>
        <div class="pv-next"></div>
        <div class="pv-label">Notas</div>
        <div class="pv-notes"></div>
      </section>
    </div>`;
  document.body.appendChild(root);
  Object.assign(PV, {
    root,
    timer: $('.pv-timer', root),
    count: $('.pv-count', root),
    steps: $('.pv-steps', root),
    clock: $('.pv-clock', root),
    cur: $('.pv-cur', root),
    next: $('.pv-next', root),
    nextLabel: $('.pv-next-label', root),
    notes: $('.pv-notes', root),
    pause: $('[data-act="pause"]', root),
  });
  PV.pause.addEventListener('click', () => {
    if (timerRunning) {
      timerAcc = timerNow();
      timerRunning = false;
    } else {
      timerRunning = true;
      timerStart = Date.now();
    }
    tickPresenter();
  });
  $('[data-act="replay"]', root).addEventListener('click', () => replaySlide());
  $('[data-act="resetall"]', root).addEventListener('click', () => resetAll());
  $('[data-act="reset"]', root).addEventListener('click', () => {
    timerAcc = 0;
    timerRunning = false;
    tickPresenter();
  });
  let notesSize = num(lsGet('dgm-notes-size'), 24);
  root.style.setProperty('--pv-notes-size', notesSize + 'px');
  addEventListener('keydown', (e) => {
    if (e.key === '+' || e.key === '=' || e.key === '-') {
      notesSize = Math.max(14, Math.min(48, notesSize + (e.key === '-' ? -2 : 2)));
      root.style.setProperty('--pv-notes-size', notesSize + 'px');
      lsSet('dgm-notes-size', notesSize);
    }
  });
  setInterval(tickPresenter, 500);
  tickPresenter();
  document.title = 'Apresentador · ' + BASE_TITLE;
}

function tickPresenter() {
  if (!PV.timer) return;
  PV.timer.textContent = timerFmt(timerNow());
  PV.timer.classList.toggle('is-paused', !timerRunning && timerAcc > 0);
  PV.pause.textContent = timerRunning ? 'Pausar' : timerAcc > 0 ? 'Continuar' : 'Iniciar';
  const d = new Date();
  PV.clock.textContent = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

let lastRendered = '';
function renderPresenter() {
  if (!PV.root) return;
  const i = Deck.index;
  const st = Deck.step;
  const key = i + '.' + st;
  if (key === lastRendered) return;
  if (lastRendered) timerStartIfNeeded();
  lastRendered = key;
  const n = Deck.slides.length;
  const max = maxStep(i);
  PV.count.innerHTML = `Slide <b>${i + 1}</b> de ${n}`;
  PV.steps.innerHTML = max ? Array.from({ length: max + 1 }, (_, k) => `<i class="${k <= st ? 'on' : ''}"></i>`).join('') : '';
  PV.cur.replaceChildren(makeThumb(i, st));
  if (st < max) {
    PV.nextLabel.textContent = 'A seguir: build ' + (st + 1) + ' de ' + max;
    PV.next.replaceChildren(makeThumb(i, st + 1));
  } else {
    PV.nextLabel.textContent = i + 1 < n ? 'A seguir: slide ' + (i + 2) : 'Fim da apresentação';
    PV.next.replaceChildren(makeThumb(i + 1, 0));
  }
  const notes = Deck.slides[i].querySelector('.notes');
  PV.notes.innerHTML = notes ? notes.innerHTML.trim() : '';
  PV.notes.scrollTop = 0;
  updateHash();
}
