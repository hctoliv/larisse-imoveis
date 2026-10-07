(() => {
  // número do WhatsApp da Larisse (só dígitos, com 55 + DDD). Vazio = cai no direct do Instagram.
  const WA_NUMBER = '';
  const IG_DM = 'https://ig.me/m/larisseimoveis';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ================= nav ================= */
  const nav = $('.nav'), toggle = $('.nav__toggle'), float = $('.float'), hero = $('.hero');
  const onScroll = () => {
    nav.classList.toggle('is-solid', scrollY > 40);
    float.classList.toggle('is-on', scrollY > hero.offsetHeight * .8);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  const closeMenu = () => { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); };
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  });
  $$('.nav__links a').forEach(a => a.addEventListener('click', closeMenu));

  /* ================= vídeos ================= */
  const loop = $('.hero__media video');
  if (reduce) loop.removeAttribute('autoplay');
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !reduce) loop.play().catch(() => {}); else loop.pause();
  }, { threshold: .2 }).observe(loop);
  // vídeo com som pausa ao sair da tela
  const full = $('.keys__video video');
  new IntersectionObserver(([e]) => { if (!e.isIntersecting) full.pause(); }).observe(full);

  /* ================= revelar ================= */
  if (!reduce && 'IntersectionObserver' in window) {
    const items = $$('.steps li, .keys figure, .about__photo, .about__copy, .proof figure, .sim__form');
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    items.forEach((el, i) => { el.classList.add('reveal'); el.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(el); });
  }

  /* ================= simulação → WhatsApp ================= */
  const form = $('#sim-form'), err = $('.sim__err');
  form.addEventListener('submit', ev => {
    ev.preventDefault();
    const f = form.elements;
    const req = [f.nome, f.renda, f.regiao];
    let ok = true;
    req.forEach(el => { const bad = !el.value.trim(); el.setAttribute('aria-invalid', bad); if (bad) ok = false; });
    err.hidden = ok;
    if (!ok) { req.find(el => !el.value.trim()).focus(); return; }

    const msg = [
      `Oi, Larisse! Quero SIMULAR meu Minha Casa Minha Vida.`,
      `Nome: ${f.nome.value.trim()}`,
      `Renda familiar: ${f.renda.value}`,
      `Região: ${f.regiao.value}`,
      `FGTS: ${f.fgts.value}`
    ].join('\n');

    if (WA_NUMBER) {
      window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    } else {
      // sem número ainda: copia a mensagem e abre o direct do Instagram
      navigator.clipboard?.writeText(msg).catch(() => {});
      window.open(IG_DM, '_blank', 'noopener');
    }
  });
  $$('#sim-form input, #sim-form select').forEach(el => el.addEventListener('input', () => el.removeAttribute('aria-invalid')));
})();
