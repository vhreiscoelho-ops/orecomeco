/* Do Vermelho ao Controle — LP v3. GSAP + ScrollTrigger + Lenis (locais, ~50 KB gz).
   Parâmetros de URL úteis:
     ?hl=a|b|c      variação de headline (copy da Ana)  → usar utm_content=hl_b / hl_c
     ?estatico=1    tudo visível, sem animações (capturas de tela / teste sem movimento)
     ?quadro=1.2    congela a entrada do hero no instante (s) — conferência de QA
     ?scroll=1800   rola até Y px ao abrir — conferência de QA                                   */
(function () {
  'use strict';
  var q = new URLSearchParams(location.search);
  var H = document.documentElement;
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var estatico = q.has('estatico');
  var desktop = matchMedia('(min-width:1000px) and (hover:hover)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  if (estatico) H.classList.add('estatico');
  if (q.has('og')) H.classList.add('og'); /* QA: gera a imagem Open Graph */
  if (q.get('desde') && $('#' + q.get('desde'))) { /* QA: mostra a página a partir de uma seção */ var al = $('#' + q.get('desde')); $$('main > section').forEach(function (s) { if (s.compareDocumentPosition(al) & 4) s.style.display = 'none'; }); }

  /* ---------- rastreio (Pixel da Meta; só dispara se o pixel estiver instalado) ---------- */
  window.track = function (ev, p) { try { if (window.fbq) window.fbq('track', ev, p || {}); } catch (e) {} };
  window.track('ViewContent', { content_name: 'Do Vermelho ao Controle' });

  /* ---------- variações de headline (texto da copy-vendas.md) ---------- */
  var HL = {
    a: { h: ['Negociar é o quarto passo.', 'Em 30 dias, você faz os três primeiros.'],
         sub: 'Um mapa das suas contas, um orçamento que cabe no mês e um roteiro de negociação, com uma tarefa de cerca de 10 minutos por dia.',
         apoio: 'Uma tarefa por dia · fichas e checklist para imprimir · 31 fontes oficiais · 7 dias de garantia' },
    b: { h: ['Em 30 dias: o mapa das suas contas, o orçamento que cabe no mês e um roteiro para negociar.'],
         sub: 'O plano dia a dia em PDF, para quem quer decidir com números antes de aceitar a primeira proposta. Cerca de 10 minutos por dia.',
         apoio: 'Do Vermelho ao Controle · 11 capítulos · 8 fichas · 2 bônus · garantia de 7 dias' },
    c: null /* padrão (HTML): identificação/alívio, ICP */
  };
  var v = HL[(q.get('hl') || 'c').toLowerCase()];
  if (v) {
    $('#h1').innerHTML = v.h.map(function (t, i) { return '<span class="split' + (i ? ' dim' : '') + '">' + t + '</span>'; }).join(' ');
    $('#sub').textContent = v.sub; $('#apoio').textContent = v.apoio;
  }

  /* ---------- links de compra: repassa os parâmetros utm, src e sck para a Kiwify ---------- */
  var passa = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'src', 'sck', 'fbclid'];
  $$('[data-checkout]').forEach(function (a) {
    var base = a.getAttribute('href');
    if (/^https?:/.test(base)) {
      try { var u = new URL(base); passa.forEach(function (k) { if (q.get(k)) u.searchParams.set(k, q.get(k)); }); a.href = u.toString(); } catch (e) {}
    }
    a.addEventListener('click', function () { try { if (window.fbq) window.fbq('trackCustom', 'ClickComprar', { content_name: 'Do Vermelho ao Controle', value: 29.9, currency: 'BRL', content_category: a.dataset.pos || '' }); } catch (e) {} });
  });

  /* ---------- isca (Capítulo 1) ---------- */
  var f = $('[data-isca]');
  if (f) f.addEventListener('submit', function (e) {
    if (!/^https?:/.test(f.getAttribute('action') || '')) { e.preventDefault(); console.warn('[LP] Configure o action do formulário da isca (LINK_FORM_ISCA).'); }
    window.track('Lead', { content_name: 'isca-capitulo-1' });
  });

  /* ---------- FAQ: 4 primeiras abertas no desktop ---------- */
  if (matchMedia('(min-width:1000px)').matches) $$('.faq details').slice(0, 4).forEach(function (d) { d.open = true; });

  /* ---------- calculadora dos 3 números (só no navegador) ---------- */
  var ent = $('#c-ent'), sai = $('#c-sai'), res = $('#c-res');
  function num(el) { return parseInt((el.value || '').replace(/\D/g, ''), 10) || 0; }
  function fmt(n) { return n.toLocaleString('pt-BR'); }
  function calc() {
    [ent, sai].forEach(function (el) { var n = num(el); el.value = n ? fmt(n) : ''; });
    if (!ent.value && !sai.value) { res.innerHTML = 'Sua margem aproximada: <b>R$ ___</b>'; res.classList.remove('neg'); return; }
    var d = num(ent) - num(sai);
    res.classList.toggle('neg', d <= 0);
    res.innerHTML = 'Sua margem aproximada: <b>R$ ' + (d < 0 ? '-' : '') + fmt(Math.abs(d)) + '</b>' + (d <= 0 ? '<small>Se der zero ou negativo, é informação, não sentença.</small>' : '');
  }
  if (ent) { ent.addEventListener('input', calc); sai.addEventListener('input', calc); }

  /* ---------- barra fixa do celular ---------- */
  var barra = $('#barra-fixa'), vis = { hero: true, oferta: false, final: false };
  function atualizaBarra() { barra.classList.toggle('on', !vis.hero && !vis.oferta && !vis.final); barra.setAttribute('aria-hidden', barra.classList.contains('on') ? 'false' : 'true'); }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { vis[e.target.dataset.k] = e.isIntersecting; }); atualizaBarra(); });
    [['.hero .cta-bloco', 'hero'], ['#oferta', 'oferta'], ['#final', 'final']].forEach(function (p) { var el = $(p[0]); el.dataset.k = p[1]; io.observe(el); });
  }

  /* ---------- 30 barras (motivo da marca) ---------- */
  function barras(el) {
    var h = '';
    for (var i = 0; i < 30; i++) {
      var neg = i < 12, hh = neg ? ((12 - i) / 12) * 44 + 3 : 3 + Math.pow((i - 12) / 17, 1.25) * 44;
      h += '<i class="br ' + (neg ? 'neg' : 'pos') + (i === 29 ? ' ultima' : '') + '" style="--i:' + i + ';--h:' + hh.toFixed(1) + '%"></i>';
    }
    el.innerHTML = h;
  }
  barras($('#barras')); barras($('#barras-fim'));
  /* trilha dos 30 dias */
  var tc = $('.trilha-celulas'), cel = [];
  for (var d = 1; d <= 30; d++) { var c = document.createElement('i'); c.textContent = d; if (d >= 22 && d <= 28) c.className = 'ac'; if (d >= 29) c.className = 'fi'; tc.appendChild(c); cel.push(c); }

  /* ---------- anchors ---------- */
  var lenis = null;
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href'); var t = id.length > 1 && $(id); if (!t) return;
      if (id === '#notas') { t.open = true; }
      e.preventDefault();
      if (lenis) lenis.scrollTo(t, { offset: -30, duration: 1.2 }); else t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ---------- sem animação (movimento reduzido, estático ou falha de carregamento) ---------- */
  function semAnimacao() {
    H.classList.remove('pre'); cel.forEach(function (c) { c.classList.add('on'); });
  }
  if (reduced || estatico || !window.gsap || !window.ScrollTrigger) {
    semAnimacao(); if (q.has('barra')) barra.classList.add('on');
    if (q.get('scroll')) window.addEventListener('load', function () { window.scrollTo(0, +q.get('scroll')); });
    return;
  }

  /* ================= COM ANIMAÇÃO ================= */
  gsap.registerPlugin(ScrollTrigger);

  if (window.Lenis && !q.get('scroll')) {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* headline: cada palavra sobe de uma máscara */
  $$('.split').forEach(function (s) {
    s.innerHTML = s.textContent.split(' ').map(function (w) { return '<span class="w"><i>' + w + '</i></span>'; }).join(' ');
  });
  var words = $$('.h1 .w > i');
  var txt = $$('.hero [data-hero]');
  gsap.set(words, { yPercent: 112 });
  gsap.set(txt, { opacity: 0, y: 20 });
  var bars = $$('#barras .br');
  gsap.set(bars, { scaleY: 0 });
  gsap.set('.hero-visual', { opacity: 0, y: 70, scale: .9 });
  gsap.set('.chip', { opacity: 0, scale: .6 });
  gsap.set('#livro', { rotationY: -14, rotationX: 5 });
  H.classList.remove('pre');

  var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.to(words, { yPercent: 0, duration: .95, stagger: .05 }, .05)
    .to(txt, { opacity: 1, y: 0, duration: .8, stagger: .09 }, .45)
    .to('.hero-visual', { opacity: 1, y: 0, scale: 1, duration: 1.3, ease: 'power3.out' }, .15)
    .to('#livro', { rotationY: 0, rotationX: 0, duration: 1.6, ease: 'power2.out' }, .15)
    .to(bars, { scaleY: 1, duration: .8, stagger: { each: .032 }, ease: 'back.out(1.2)' }, .5)
    .to('.chip', { opacity: 1, scale: 1, duration: .6, stagger: .15, ease: 'back.out(1.8)' }, 1.4);

  if (q.has('quadro')) { tl.pause(); tl.time(parseFloat(q.get('quadro')) || 0); }
  else {
    gsap.to('.livro-cena', { y: -12, duration: 3.4, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.6 });
    gsap.to('.chip-1', { y: -8, duration: 2.8, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2 });
    gsap.to('.chip-2', { y: 9, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2 });
    if (desktop) {
      gsap.to('.hero .a1', { x: 90, y: 60, duration: 13, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      gsap.to('.hero .a2', { x: -80, y: 40, duration: 16, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      gsap.to('.hero .a3', { x: 120, y: -30, duration: 18, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    }
  }

  /* hero: parallax suave ao rolar; no celular o livro gira com a rolagem */
  gsap.to('.hero .aurora', { yPercent: 16, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  if (!desktop) {
    gsap.fromTo('#livro', { rotationY: -2 }, { rotationY: 16, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 20%', scrub: .6 }, immediateRender: false });
  }

  /* barra de progresso de leitura */
  gsap.to('.progresso i', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .2 } });

  /* revelação com stagger */
  var rev = $$('[data-r]');
  gsap.set(rev, { opacity: 0, y: 30 });
  ScrollTrigger.batch(rev, {
    start: 'top 92%', once: true,
    onEnter: function (b) { gsap.to(b, { opacity: 1, y: 0, duration: .85, stagger: .09, ease: 'power2.out', overwrite: true }); }
  });

  /* count-up */
  $$('.num[data-to],.num-g[data-to]').forEach(function (el) {
    var to = parseFloat(el.dataset.to), dec = +(el.dataset.dec || 0), pre = el.dataset.pre || '', suf = el.dataset.suf || '', o = { n: 0 };
    var show = function () { el.textContent = pre + o.n.toFixed(dec).replace('.', ',') + suf; };
    show();
    ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: function () { gsap.to(o, { n: to, duration: 1.6, ease: 'power2.out', onUpdate: show }); } });
  });

  /* trilha dos 30 dias acende conforme a rolagem */
  ScrollTrigger.create({
    trigger: '#trilha', start: 'top 88%', end: 'top 35%', scrub: true,
    onUpdate: function (s) { var n = Math.round(s.progress * 30); cel.forEach(function (c, i) { c.classList.toggle('on', i < n); }); }
  });

  /* leque de páginas reais abre com a rolagem */
  var pg = $$('#leque .pg'), passo = innerWidth >= 700 ? 125 : 52;
  pg.forEach(function (p, i) {
    var k = i - 2;
    gsap.fromTo(p, { x: 0, rotation: 0, y: 24 }, { x: k * passo, rotation: k * 8.5, y: Math.abs(k) * 6, ease: 'none', immediateRender: true, scrollTrigger: { trigger: '#leque', start: 'top 88%', end: 'top 38%', scrub: .6 } });
  });

  /* barras do final crescem */
  var bf = $$('#barras-fim .br');
  gsap.set(bf, { scaleY: 0 });
  gsap.to(bf, { scaleY: 1, duration: .7, stagger: .03, ease: 'back.out(1.2)', scrollTrigger: { trigger: '#final', start: 'top 70%', once: true } });

  /* ---------- só desktop com mouse ---------- */
  if (desktop) {
    var hero = $('.hero'), lx = 70, ly = 35, raf = 0;
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect(); lx = (e.clientX - r.left) / r.width * 100; ly = (e.clientY - r.top) / r.height * 100;
      if (!raf) raf = requestAnimationFrame(function () { hero.style.setProperty('--lx', lx + '%'); hero.style.setProperty('--ly', ly + '%'); raf = 0; });
      var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      tiltY(x * 16); tiltX(-y * 12);
    });
    hero.addEventListener('mouseleave', function () { tiltY(0); tiltX(0); });
    var tiltY = gsap.quickTo('#livro', 'rotationY', { duration: .9, ease: 'power3.out' });
    var tiltX = gsap.quickTo('#livro', 'rotationX', { duration: .9, ease: 'power3.out' });

    /* borda de luz nos cards de vidro */
    document.addEventListener('mousemove', function (e) {
      var el = e.target.closest && e.target.closest('.vidro'); if (!el) return;
      var r = el.getBoundingClientRect(); el.style.setProperty('--mx', (e.clientX - r.left) + 'px'); el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });

    /* CTA magnético */
    $$('.btn:not(.btn-p)').forEach(function (b) {
      var mx = gsap.quickTo(b, 'x', { duration: .4, ease: 'power3.out' }), my = gsap.quickTo(b, 'y', { duration: .4, ease: 'power3.out' });
      b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); mx((e.clientX - r.left - r.width / 2) * .18); my((e.clientY - r.top - r.height / 2) * .28); });
      b.addEventListener('mouseleave', function () { mx(0); my(0); });
    });
  }

  if (q.get('scroll')) window.addEventListener('load', function () { window.scrollTo(0, +q.get('scroll')); ScrollTrigger.update(); });
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
