(() => {
  // número do WhatsApp da Larisse (só dígitos, com 55 + DDD). Vazio = cai no direct do Instagram.
  const WA_NUMBER = '';
  const IG_DM = 'https://ig.me/m/larisseimoveis';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ================= i18n ================= */
  const EN = {
    'nav.how': 'How it works', 'nav.keys': 'Keys delivered', 'nav.about': 'About', 'nav.cta': 'Talk to me',
    'hero.title': 'I help you make your <em>biggest dream</em> come true.',
    'hero.lead': '<strong>Minha Casa Minha Vida</strong> specialist in every region of São Paulo. From our first chat to the keys of your first home.',
    'hero.cta': 'Get your simulation', 'hero.cta2': 'See keys delivered',
    'hero.f1': 'place in Brazil as a seller', 'hero.f2': 'every region of the city', 'hero.f3': 'Minha Casa Minha Vida specialist',
    'hero.cap': 'Emilly’s key handover · July 2026',
    'how.eyebrow': 'How it works', 'how.title': 'From dream to keys in hand',
    'how.s1t': 'Simulation', 'how.s1': 'Tell me your income and where you want to live. I calculate the subsidy and the payment that fit you.',
    'how.s2t': 'The right home', 'how.s2': 'I show you options by region and minimum income, and we visit the model unit together.',
    'how.s3t': 'Approval', 'how.s3': 'I handle the paperwork and credit check with you. Your FGTS can go toward the down payment here.',
    'how.s4t': 'Keys in hand', 'how.s4': 'I follow the construction until key handover. You never forget your first home.',
    'keys.eyebrow': 'Keys delivered', 'keys.title': 'You never forget your first home',
    'keys.sub': 'Families who trusted my work and now have the keys in their hands.',
    'keys.c0': '“Another dream come true! Key handover day finally arrived.”',
    'keys.c1': '“They dreamed, believed and made it!”', 'keys.c2': '“Today we celebrate another dream come true.”',
    'keys.c3': '“She didn’t let fear stop her from owning a home.”', 'keys.c4': '“Went to visit his future home!”',
    'about.eyebrow': 'Who helps you', 'about.title': 'Hi, I’m Larisse.',
    'about.quote': '“It was more than hitting a target, it was making dreams come true with families who trusted me.”',
    'about.p1': 'I’m a real estate agent specialized in Minha Casa Minha Vida, serving every region of São Paulo. Seeing families flourish in their first home is what drives me every day.',
    'about.p2': 'In 2025 I ranked 1st in Brazil as a seller. Grateful to God, to my team and to every family who trusted my work.',
    'about.r1t': 'Specialty', 'about.r2t': 'Area', 'about.r2': 'All regions of São Paulo',
    'proof.c1': '1st place in Brazil · May 2025', 'proof.c2': 'Highlight of the month · August 2025', 'proof.c3': '2026 in Brazil’s largest region',
    'sim.eyebrow': 'Simulation', 'sim.title': 'Message me and get your simulation',
    'sim.sub': 'Answer 4 questions and the message comes to me ready. So, are you ready to get your own place?',
    'sim.name': 'Your name', 'sim.income': 'Monthly family income', 'sim.zone': 'Where you want to live', 'sim.pick': 'Choose',
    'sim.any': 'Not sure yet', 'sim.fgts': 'Do you have FGTS?', 'sim.yes': 'Yes', 'sim.no': 'No', 'sim.dk': 'Not sure',
    'sim.send': 'Send and get my simulation', 'sim.err': 'Fill in name, income and region so I can simulate.',
    'foot.tag': 'I help you make your biggest dream come true.', 'foot.sim': 'Get your simulation', 'foot.area': 'All regions of São Paulo',
    'foot.small': 'Simulations are estimates. Approval, subsidy and terms depend on credit analysis and the program’s current rules.',
    'float': 'Simulate'
  };
  const PT = {};
  $$('[data-i18n]').forEach(el => { PT[el.dataset.i18n] = el.textContent; });
  $$('[data-i18n-html]').forEach(el => { PT[el.dataset.i18nHtml] = el.innerHTML; });
  const T = { pt: PT, en: EN };

  let lang = 'pt';
  try { if (localStorage.getItem('larisse-lang') === 'en') lang = 'en'; } catch (e) {}
  const applyLang = l => {
    lang = l;
    document.documentElement.lang = l === 'pt' ? 'pt-BR' : 'en';
    try { localStorage.setItem('larisse-lang', l); } catch (e) {}
    $$('[data-i18n]').forEach(el => { const v = T[l][el.dataset.i18n]; if (v !== undefined) el.textContent = v; });
    $$('[data-i18n-html]').forEach(el => { const v = T[l][el.dataset.i18nHtml]; if (v !== undefined) el.innerHTML = v; });
    $$('.lang button').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === l));
  };
  $$('.lang button').forEach(b => b.addEventListener('click', () => applyLang(b.dataset.lang)));
  if (lang !== 'pt') applyLang(lang);

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
