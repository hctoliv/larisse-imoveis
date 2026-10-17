(() => {
  /* ================= configuração ================= */
  // WhatsApp da Larisse: só dígitos, com 55 + DDD (ex.: 5511900000000). Vazio = cai no direct do Instagram.
  const WA_NUMBER = '5511992377098';
  // ID do Pixel da Meta (Gerenciador de Eventos). Vazio = sem pixel.
  const META_PIXEL_ID = '';
  const IG_DM = 'https://ig.me/m/larisseimoveis';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  // sem zoom no celular (o Safari do iPhone ignora o user-scalable do viewport)
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(t => document.addEventListener(t, e => e.preventDefault(), { passive: false }));
  document.addEventListener('touchmove', e => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });

  /* ================= origem do lead (UTM / anúncio) ================= */
  const KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'];
  const store = (() => { try { return sessionStorage; } catch (e) { return null; } })();
  const qs = new URLSearchParams(location.search);
  const src = {};
  KEYS.forEach(k => {
    let v = qs.get(k);
    try { v = v || store?.getItem('lr_' + k); if (v) store?.setItem('lr_' + k, v); } catch (e) {}
    if (v) src[k] = v;
  });
  const fromAd = !!(src.fbclid || /fb|ig|insta|meta|face/i.test(src.utm_source || ''));

  /* ================= Pixel da Meta ================= */
  const track = (ev, data) => { try { if (window.fbq) window.fbq('track', ev, data); } catch (e) {} };
  if (META_PIXEL_ID) {
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', META_PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  /* ================= texto em palavras ================= */
  const split = (el, inner) => {
    let i = 0;
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(' '); return; }
          const w = document.createElement('span');
          w.className = 'w';
          const d = (i++ * .055) + 's';
          if (inner) { const s = document.createElement('span'); s.textContent = part; s.style.setProperty('--d', d); w.append(s); }
          else { w.textContent = part; w.style.setProperty('--d', d); }
          frag.append(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
    walk(el);
  };
  $$('[data-split]').forEach(el => split(el, true));
  $$('[data-words]').forEach(el => split(el, false));
  requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('is-ready')));
  // garantia: o hero nunca fica escondido se a animação não rodar
  setTimeout(() => document.body.classList.add('is-ready'), 700);

  /* ================= revelar ao rolar ================= */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -10% 0px' });
  $$('[data-words], [data-clip]').forEach(el => io.observe(el));
  if (!reduce) $$('.perks__list li, .about__wins figure, .faq__list details, .sim__form, .chat, .proofbar__list li').forEach((el, i) => {
    el.classList.add('reveal'); el.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(el);
  });

  /* ================= rolagem ================= */
  const nav = $('.nav'), bar = $('[data-progress]'), hero = $('[data-hero]');
  const journey = $('[data-journey]'), steps = $$('.journey__steps li');
  const parallax = $$('[data-parallax]'), floats = $$('[data-float]');
  const heroForm = $('#lead-form'), dock = $('[data-dock]');
  const forms = $$('form[data-form]');
  const onScreen = new Set();
  let px = 0, py = 0, ticking = false;

  const frame = () => {
    ticking = false;
    const y = scrollY, vh = innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    nav.classList.toggle('is-solid', y > 20);
    // barra fixa: aparece depois do formulário do hero e some quando há formulário na tela
    dock.classList.toggle('is-on', heroForm.getBoundingClientRect().bottom < 0 && onScreen.size === 0);

    const jr = journey.getBoundingClientRect();
    journey.style.setProperty('--p', clamp((vh * .55 - jr.top) / jr.height, 0, 1).toFixed(4));
    steps.forEach(li => li.classList.toggle('is-on', li.getBoundingClientRect().top < vh * .65));

    if (!reduce) {
      parallax.forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        el.style.transform = `scale(1.1) translate3d(0,${(r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.parallax)}px,0)`;
      });
      if (fine && y < hero.offsetHeight) floats.forEach(el => {
        const k = parseFloat(el.dataset.float) || .4;
        el.style.transform = `translate3d(${px * 22 * k}px, ${py * 14 * k - y * .1 * k}px, 0)`;
      });
    }
  };
  const queue = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  if (fine && !reduce) hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
    px = (e.clientX - r.left) / r.width - .5; py = (e.clientY - r.top) / r.height - .5;
    queue();
  });
  new IntersectionObserver(es => {
    es.forEach(e => e.isIntersecting ? onScreen.add(e.target) : onScreen.delete(e.target));
    queue();
  }, { threshold: .15 }).observe(forms[0]);
  const formObs = new IntersectionObserver(es => {
    es.forEach(e => e.isIntersecting ? onScreen.add(e.target) : onScreen.delete(e.target));
    queue();
  }, { threshold: .15 });
  forms.slice(1).forEach(f => formObs.observe(f));
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  frame();

  /* ================= histórias ================= */
  const trackEl = $('[data-track]');
  $$('.arrow').forEach(b => b.addEventListener('click', () => {
    const w = trackEl.querySelector('.story').offsetWidth + 16;
    trackEl.scrollBy({ left: w * +b.dataset.dir, behavior: reduce ? 'auto' : 'smooth' });
  }));
  const vStory = $('.story--video'), video = $('video', vStory);
  $('.story__play', vStory).addEventListener('click', () => {
    video.controls = true; video.play().catch(() => {});
    track('ViewContent', { content_name: 'video_emilly' });
  });
  video.addEventListener('play', () => vStory.classList.add('is-playing'));
  video.addEventListener('pause', () => vStory.classList.remove('is-playing'));
  new IntersectionObserver(([e]) => { if (!e.isIntersecting) video.pause(); }, { threshold: .3 }).observe(video);

  /* ================= formulários → WhatsApp ================= */
  const digits = s => s.replace(/\D/g, '');
  const maskPhone = el => {
    let d = digits(el.value);
    if (d.startsWith('55') && d.length > 11) d = d.slice(2);
    d = d.slice(0, 11);
    el.value = d.length > 6 ? `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`
      : d.length > 2 ? `(${d.slice(0, 2)}) ${d.slice(2)}` : d;
  };
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const buildLines = f => {
    const v = n => (f.elements[n] ? f.elements[n].value : '').trim();
    return [
      'Oi, Larisse! Quero fazer minha simulação do Minha Casa Minha Vida.',
      v('nome') && `Nome: ${v('nome')}`,
      v('cel') && `WhatsApp: ${v('cel')}`,
      v('renda') && `Renda familiar: ${v('renda')}`,
      v('regiao') && `Região: ${v('regiao')}`,
      v('fgts') && `FGTS: ${v('fgts')}`
    ].filter(Boolean);
  };

  const destination = msg => WA_NUMBER ? `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}` : IG_DM;

  // no navegador interno do Instagram/Facebook, abrir na mesma aba é o que funciona
  const go = url => {
    if (fine && window.open(url, '_blank', 'noopener')) return;
    location.href = url;
  };

  const validate = f => {
    const { nome, cel, renda } = f.elements;
    const bad = [], miss = [];
    if (!nome.value.trim()) { bad.push(nome); miss.push('seu nome'); }
    if (digits(cel.value).length < 10) { bad.push(cel); miss.push('um WhatsApp com DDD'); }
    if (!renda.value) { bad.push(renda); miss.push('sua faixa de renda'); }
    [nome, cel, renda].forEach(el => el.setAttribute('aria-invalid', bad.includes(el)));
    const list = miss.length > 1 ? miss.slice(0, -1).join(', ') + ' e ' + miss.at(-1) : miss[0];
    return { ok: !bad.length, first: bad[0], msg: miss.length ? `Falta ${list}.` : '' };
  };

  forms.forEach(f => {
    const err = $('.form__err', f), done = $('.form__done', f), open = $('[data-open]', f);
    f.elements.cel.addEventListener('input', () => maskPhone(f.elements.cel));
    $$('input, select', f).forEach(el => el.addEventListener('input', () => { el.removeAttribute('aria-invalid'); err.hidden = true; }));
    let started = false;
    f.addEventListener('focusin', () => { if (!started) { started = true; track('InitiateCheckout', { content_name: f.dataset.form }); } });

    f.addEventListener('submit', ev => {
      ev.preventDefault();
      const r = validate(f);
      if (!r.ok) { err.textContent = r.msg; err.hidden = false; r.first.focus(); return; }

      const lines = buildLines(f);
      if (fromAd) lines.push(`(Vim pelo anúncio${src.utm_campaign ? ': ' + src.utm_campaign : ''})`);
      const msg = lines.join('\n');
      const url = destination(msg);
      if (!WA_NUMBER && navigator.clipboard) navigator.clipboard.writeText(msg).catch(() => {});

      track('Lead', { content_name: f.dataset.form, content_category: f.elements.renda.value });
      track('Contact');

      open.href = url;
      f.classList.add('is-sent');
      done.hidden = false;
      // pequena pausa para o pixel registrar antes de sair da página
      setTimeout(() => go(url), 350);
    });
  });

  /* ================= prévia da mensagem ================= */
  const sim = $('#sim-form'), chat = $('[data-chat]'), typing = $('[data-typing]');
  let tId;
  const render = () => {
    const [first, ...rest] = buildLines(sim);
    chat.innerHTML = esc(first) + rest.map(l => {
      const i = l.indexOf(': ');
      return `\n${esc(l.slice(0, i))}: <mark>${esc(l.slice(i + 2))}</mark>`;
    }).join('');
    typing.classList.add('is-on');
    clearTimeout(tId); tId = setTimeout(() => typing.classList.remove('is-on'), 900);
  };
  $$('input, select', sim).forEach(el => { el.addEventListener('input', render); el.addEventListener('change', render); });

  // link direto do WhatsApp no rodapé
  $$('[data-wa-direct]').forEach(a => a.addEventListener('click', () => track('Contact', { content_name: 'rodape' })));

  // cliques nos CTAs que levam ao formulário final
  $$('[data-cta]').forEach(a => a.addEventListener('click', () => track('ViewContent', { content_name: 'cta_' + a.dataset.cta })));
})();
