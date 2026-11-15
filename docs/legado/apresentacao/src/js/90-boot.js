/* Inicialização. */

function enterPrint() {
  document.documentElement.classList.add('is-print');
  Deck.slides.forEach((s) => {
    s.classList.add('is-active');
    s.classList.remove('is-before', 'is-after');
    $$('.is-in', s).forEach((u) => u.classList.remove('is-in'));
    finalizeStatic(s);
  });
  document.documentElement.style.setProperty('--print-zoom', Math.min(1, innerWidth / STAGE_W));
}

function leavePrint() {
  document.documentElement.classList.remove('is-print');
  Deck.slides.forEach((s) => {
    s.classList.remove('is-static', 'is-active');
    resetSlide(s);
  });
  const i = Deck.index;
  const st = Deck.step;
  Deck.index = -1;
  go(i, st, 'instant');
}

function boot() {
  Deck.slides = $$('#stage > .slide');
  Object.assign(Deck, { go, next: nextStep, prev: prevStep, maxStep, toggleBlack, overview: Overview, layoutWires });

  if (!Deck.slides.length) {
    const s = el('section', 'slide slide--center is-active');
    s.innerHTML = '<h1 class="title">Nenhum slide.</h1><p class="lead mt-1">Coloque arquivos em src/slides/ e rode node build.mjs.</p>';
    $('#stage').prepend(s);
    Deck.slides = [s];
  }

  applyBindings(document);
  Deck.slides.forEach((s, i) => {
    s.dataset.index = i + 1;
    s.setAttribute('aria-roledescription', 'slide');
    s.setAttribute('aria-label', `Slide ${i + 1} de ${Deck.slides.length}`);
    s.setAttribute('aria-hidden', 'true');
    prepareSlide(s);
  });
  layoutWires();
  const relayout = () => layoutWires();
  try {
    document.fonts.ready.then(relayout);
    document.fonts.addEventListener && document.fonts.addEventListener('loadingdone', relayout);
  } catch (e) {}
  addEventListener('load', relayout);

  if (MODE === 'print') {
    enterPrint();
    return;
  }

  fitStage();
  initSync();
  bindInput();

  if (MODE === 'presenter') {
    buildPresenter();
  } else {
    addEventListener('beforeprint', enterPrint);
    addEventListener('afterprint', leavePrint);
    const hint = $('.hint');
    if (hint && !lsGet('dgm-hint-seen')) {
      setTimeout(() => hint.classList.add('is-on'), 600);
      setTimeout(() => hint.classList.remove('is-on'), 5200);
      lsSet('dgm-hint-seen', '1');
    }
    onMouseMove();
  }

  const h = parseHash();
  if (h) go(h.i, h.step, h.step ? 'instant' : 'animate');
  else go(0, 0, 'animate');

  if (MODE === 'presenter') sendSync({ type: 'hello' });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
