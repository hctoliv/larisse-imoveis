(() => {
  // número do WhatsApp da Larisse (só dígitos, com 55 + DDD). Vazio = cai no direct do Instagram.
  const WA_NUMBER = '';
  const IG_DM = 'https://ig.me/m/larisseimoveis';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ================= texto em palavras ================= */
  // envolve cada palavra (mantendo <em>) para animar
  const split = (el, inner) => {
    const delay = { i: 0 };
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(' '); return; }
            const w = document.createElement('span');
            w.className = 'w';
            const d = (delay.i++ * .06) + 's';
            if (inner) { const s = document.createElement('span'); s.textContent = part; s.style.setProperty('--d', d); w.append(s); }
            else { w.textContent = part; w.style.setProperty('--d', d); }
            frag.append(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
  };
  $$('[data-split]').forEach(el => split(el, true));
  $$('[data-words]').forEach(el => split(el, false));
  requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('is-ready')));

  /* ================= nav ================= */
  const nav = $('.nav'), toggle = $('.nav__toggle'), float = $('.float'), hero = $('[data-hero]');
  const closeMenu = () => { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); };
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  });
  $$('.nav__links a').forEach(a => a.addEventListener('click', closeMenu));

  /* ================= flutuação no hero ================= */
  // a Larisse e os selos se mexem de leve com o mouse e com a rolagem
  const floats = $$('[data-float]');
  let px = 0, py = 0;
  if (fine && !reduce) hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
    px = (e.clientX - r.left) / r.width - .5; py = (e.clientY - r.top) / r.height - .5;
  });

  /* ================= revelar ao rolar ================= */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -12% 0px' });
  $$('[data-words], [data-clip]').forEach(el => io.observe(el));
  if (!reduce) $$('.about__copy > *, .proof figure, .sim__form, .chat').forEach((el, i) => {
    el.classList.add('reveal'); el.style.transitionDelay = (i % 3) * 80 + 'ms'; io.observe(el);
  });

  /* ================= loop de rolagem ================= */
  const bar = $('[data-progress]');
  const marquee = $('[data-marquee]');
  const journey = $('[data-journey]'), steps = $$('.journey__steps li');
  const gallery = $('[data-gallery]'), track = $('[data-gallery-track]'), gBar = $('[data-gallery-bar]'), gI = $('[data-gallery-i]');
  const slides = $$('.slide', track);
  const parallax = $$('[data-parallax]');
  const wide = matchMedia('(min-width: 821px)');

  // galeria: a seção ganha altura para a rolagem vertical virar horizontal
  let gDist = 0;
  const sizeGallery = () => {
    if (wide.matches && !reduce) {
      track.style.transform = '';
      gDist = Math.max(0, track.scrollWidth - innerWidth);
      gallery.style.height = (innerHeight + gDist) + 'px';
    } else { gDist = 0; gallery.style.height = ''; track.style.transform = ''; }
  };
  sizeGallery();
  addEventListener('resize', sizeGallery);
  addEventListener('load', sizeGallery);

  let mx = 0, lastY = scrollY, vel = 0;
  const frame = () => {
    const y = scrollY, vh = innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    nav.classList.toggle('is-solid', y > 40);
    float.classList.toggle('is-on', y > hero.offsetHeight * .8);

    if (!reduce) {
      // faixa: anda sempre e acelera com a rolagem
      vel += ((y - lastY) - vel) * .1;
      mx -= .6 + Math.abs(vel) * .35;
      const half = marquee.scrollWidth / 2;
      if (-mx >= half) mx += half;
      marquee.style.transform = `translate3d(${mx}px,0,0)`;

      // parallax
      parallax.forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const off = (r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.parallax);
        el.style.transform = el.tagName === 'IMG' ? `scale(1.12) translate3d(0,${off}px,0)` : `translate3d(0,${off}px,0)`;
      });
      // flutuação do hero
      if (y < hero.offsetHeight) {
        const t = performance.now() / 1000;
        floats.forEach((el, i) => {
          const k = parseFloat(el.dataset.float || 0) || 0;
          const bob = k ? Math.sin(t * 1.4 + i * 2) * 6 : 0;
          el.style.transform = `translate3d(${px * 24 * (k || .4)}px, ${py * 16 * (k || .4) + bob - y * .12 * (k || .4)}px, 0)`;
        });
      }
    }

    // jornada: a chave acompanha o centro da tela
    const jr = journey.getBoundingClientRect();
    journey.style.setProperty('--p', clamp((vh * .55 - jr.top) / jr.height, 0, 1).toFixed(4));
    steps.forEach(li => li.classList.toggle('is-on', li.getBoundingClientRect().top < vh * .62));

    // galeria horizontal
    if (gDist) {
      const g = clamp(-gallery.getBoundingClientRect().top / gDist, 0, 1);
      track.style.transform = `translate3d(${-g * gDist}px,0,0)`;
      gBar.style.setProperty('--g', (.2 + g * .8).toFixed(4));
      gI.textContent = String(Math.floor(g * (slides.length - .01)) + 1).padStart(2, '0');
    }

    lastY = y;
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  // galeria no celular: contador acompanha o deslize
  track.addEventListener('scroll', () => {
    if (gDist) return;
    const g = track.scrollLeft / Math.max(1, track.scrollWidth - track.clientWidth);
    gBar.style.setProperty('--g', (.2 + g * .8).toFixed(4));
    gI.textContent = String(Math.round(g * (slides.length - 1)) + 1).padStart(2, '0');
  }, { passive: true });

  /* ================= vídeo com som ================= */
  const vSlide = $('.slide--video'), full = $('video', vSlide), play = $('.slide__play', vSlide);
  play.addEventListener('click', () => { full.controls = true; full.play().catch(() => {}); });
  full.addEventListener('play', () => vSlide.classList.add('is-playing'));
  full.addEventListener('pause', () => vSlide.classList.remove('is-playing'));
  new IntersectionObserver(([e]) => { if (!e.isIntersecting) full.pause(); }, { threshold: .3 }).observe(full);

  /* ================= simulação → WhatsApp ================= */
  const form = $('#sim-form'), err = $('.sim__err'), chat = $('[data-chat]'), typing = $('[data-typing]');
  const f = form.elements;
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const lines = () => [
    'Oi, Larisse! Quero fazer minha simulação do Minha Casa Minha Vida.',
    f.nome.value.trim() && `Nome: ${f.nome.value.trim()}`,
    f.renda.value && `Renda familiar: ${f.renda.value}`,
    f.regiao.value && `Região: ${f.regiao.value}`,
    `FGTS: ${f.fgts.value}`
  ].filter(Boolean);

  // prévia ao vivo da mensagem
  let tId;
  const render = () => {
    const [first, ...rest] = lines();
    chat.innerHTML = esc(first) + rest.map(l => {
      const i = l.indexOf(': ');
      return `\n${esc(l.slice(0, i))}: <mark>${esc(l.slice(i + 2))}</mark>`;
    }).join('');
    typing.classList.add('is-on');
    clearTimeout(tId); tId = setTimeout(() => typing.classList.remove('is-on'), 900);
  };
  $$('input, select', form).forEach(el => {
    el.addEventListener('input', () => { el.removeAttribute('aria-invalid'); render(); });
    el.addEventListener('change', render);
  });

  const send = msg => {
    if (WA_NUMBER) {
      window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    } else {
      // sem número ainda: copia a mensagem e abre o direct do Instagram
      navigator.clipboard?.writeText(msg).catch(() => {});
      window.open(IG_DM, '_blank', 'noopener');
    }
  };

  // regiões: escolhe a região no formulário e leva até ele
  $$('[data-region]').forEach(b => b.addEventListener('click', () => {
    f.regiao.value = b.dataset.region;
    f.regiao.removeAttribute('aria-invalid');
    render();
    $('#simular').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    setTimeout(() => f.nome.focus({ preventScroll: true }), reduce ? 0 : 700);
  }));

  // formulário rápido do hero
  const lead = $('#lead-form'), lf = lead.elements, lErr = $('.lead__err');
  lf.cel.addEventListener('input', () => {
    const d = lf.cel.value.replace(/\D/g, '').slice(0, 11);
    lf.cel.value = d.length > 6 ? `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}` : d.length > 2 ? `(${d.slice(0, 2)}) ${d.slice(2)}` : d;
  });
  $$('input', lead).forEach(el => el.addEventListener('input', () => el.removeAttribute('aria-invalid')));
  lead.addEventListener('submit', ev => {
    ev.preventDefault();
    const badNome = !lf.nome.value.trim(), badCel = lf.cel.value.replace(/\D/g, '').length < 10;
    lf.nome.setAttribute('aria-invalid', badNome); lf.cel.setAttribute('aria-invalid', badCel);
    lErr.hidden = !(badNome || badCel);
    if (badNome || badCel) { (badNome ? lf.nome : lf.cel).focus(); return; }
    send(`Oi, Larisse! Sou ${lf.nome.value.trim()} e quero saber mais sobre o Minha Casa Minha Vida.\nMeu celular: ${lf.cel.value}`);
  });

  form.addEventListener('submit', ev => {
    ev.preventDefault();
    const req = [f.nome, f.renda, f.regiao];
    let ok = true;
    req.forEach(el => { const bad = !el.value.trim(); el.setAttribute('aria-invalid', bad); if (bad) ok = false; });
    err.hidden = ok;
    if (!ok) { req.find(el => !el.value.trim()).focus(); return; }
    send(lines().join('\n'));
  });
})();
