/* Invest Gate — interactions & motion */
(function () {
  'use strict';

  // رقم واتساب الشركة بالصيغة الدولية (بدون + وبدون أصفار في البداية)
  var WHATSAPP = '9647700000000';

  var d = document, html = d.documentElement, W = window;
  var RTL = html.dir === 'rtl';
  var LANG = (html.lang || 'ar').slice(0, 3);
  var reduce = W.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = W.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var G = W.gsap, ST = W.ScrollTrigger;
  var motion = !!(G && ST) && !reduce;

  var T = {
    ar: {
      hello: 'السلام عليكم، أود الاستفسار عن خدمات شركة إنفست جيت.',
      amp: function (n) { return n + ' أمبير'; },
      hrs: function (n) { return n === 0 ? 'لا يوجد' : n === 1 ? 'ساعة' : n === 2 ? 'ساعتان' : n <= 10 ? n + ' ساعات' : n + ' ساعة'; },
      types: ['منظومة ضخ مباشر بدون بطاريات', 'منظومة مرتبطة بالشبكة (On-Grid)', 'منظومة مستقلة (Off-Grid)', 'منظومة هجينة (Hybrid)'],
      book: ['السلام عليكم، أرغب بحجز زيارة كشف لمنظومة طاقة شمسية.', 'الحمل التقريبي', 'أمبير', 'ساعات التشغيل النهارية', 'ساعات التشغيل الليلية'],
      form: ['طلب عرض سعر من الموقع الإلكتروني', 'الاسم', 'رقم الهاتف', 'الخدمة المطلوبة', 'المحافظة', 'التفاصيل']
    },
    ckb: {
      hello: 'سڵاو، دەمەوێت زانیاری دەربارەی خزمەتگوزارییەکانی کۆمپانیای ئینڤێست گەیت وەربگرم.',
      amp: function (n) { return n + ' ئەمپێر'; },
      hrs: function (n) { return n === 0 ? 'نییە' : n + ' کاتژمێر'; },
      types: ['سیستەمی پەمپی ڕاستەوخۆ بێ پاتری', 'سیستەمی بەستراو بە تۆڕ (On-Grid)', 'سیستەمی سەربەخۆ (Off-Grid)', 'سیستەمی هایبرید (Hybrid)'],
      book: ['سڵاو، دەمەوێت سەردانی شوێن بۆ سیستەمی وزەی خۆر داوا بکەم.', 'باری نزیکەیی', 'ئەمپێر', 'کاتژمێرەکانی کارکردن بە ڕۆژ', 'کاتژمێرەکانی کارکردن بە شەو'],
      form: ['داواکردنی نرخ لە ماڵپەڕەوە', 'ناو', 'ژمارەی تەلەفۆن', 'خزمەتگوزاریی داواکراو', 'پارێزگا', 'وردەکاری']
    },
    en: {
      hello: 'Hello, I would like to enquire about Invest Gate services.',
      amp: function (n) { return n + ' A'; },
      hrs: function (n) { return n === 0 ? 'None' : n === 1 ? '1 hour' : n + ' hours'; },
      types: ['Direct solar pumping (no batteries)', 'On-Grid system', 'Off-Grid system', 'Hybrid system'],
      book: ['Hello, I would like to book a site survey for a solar energy system.', 'Approximate load', 'A', 'Daytime operating hours', 'Night-time operating hours'],
      form: ['Quotation request from the website', 'Name', 'Phone', 'Service required', 'Governorate', 'Details']
    }
  }[LANG === 'ckb' ? 'ckb' : LANG === 'en' ? 'en' : 'ar'];

  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }
  function store(k, v) {
    try {
      if (v === undefined) return W.sessionStorage.getItem(k);
      W.sessionStorage.setItem(k, v);
    } catch (e) { return null; }
  }
  function wa(text) { return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(text); }

  if (G && ST) G.registerPlugin(ST);

  /* ---------------------------------------------------------------
     Smooth scroll
  --------------------------------------------------------------- */
  var lenis = null;
  if (motion && W.Lenis) {
    lenis = new W.Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1 });
    lenis.on('scroll', ST.update);
    G.ticker.add(function (t) { lenis.raf(t * 1000); });
    G.ticker.lagSmoothing(0);
  }
  function hdrH() { return parseInt(getComputedStyle(html).getPropertyValue('--hdr'), 10) || 80; }
  function scrollToEl(el) {
    if (lenis) lenis.scrollTo(el, { offset: -hdrH() - 12, duration: 1.4 });
    else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }

  /* ---------------------------------------------------------------
     Word splitting (word level, safe for Arabic & Kurdish shaping)
  --------------------------------------------------------------- */
  function splitWords(el, cls) {
    if (el.__split) return el.__split;
    var out = [];
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var parts = n.textContent.split(/(\s+)/);
          var frag = d.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(d.createTextNode(p)); return; }
            if (cls) {
              var s = d.createElement('span'); s.className = cls; s.textContent = p;
              frag.appendChild(s); out.push(s);
            } else {
              var w = d.createElement('span'); w.className = 'w';
              var i = d.createElement('span'); i.className = 'wi'; i.textContent = p;
              w.appendChild(i); frag.appendChild(w); out.push(i);
            }
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    })(el);
    el.__split = out;
    return out;
  }

  /* ---------------------------------------------------------------
     Header, overlay menu, WhatsApp button
  --------------------------------------------------------------- */
  var hdr = $('.hdr'), waBtn = $('.wa'), lastY = 0, menuOpen = false;
  function onScroll(y) {
    if (hdr) {
      hdr.classList.toggle('is-solid', y > 40);
      if (!menuOpen) hdr.classList.toggle('is-hidden', y > lastY && y > 480);
    }
    if (waBtn) waBtn.classList.toggle('is-on', y > W.innerHeight * 0.5);
    lastY = y;
  }
  if (lenis) lenis.on('scroll', function (e) { onScroll(e.scroll); });
  else W.addEventListener('scroll', function () { onScroll(W.scrollY); }, { passive: true });
  onScroll(W.scrollY);

  $$('[data-wa]').forEach(function (a) { a.href = wa(T.hello); });

  var ovl = $('.ovl'), menuBtn = $('.menu-btn'), closeBtn = $('.ovl__close');
  function setMenu(open) {
    if (!ovl) return;
    menuOpen = open;
    menuBtn && menuBtn.setAttribute('aria-expanded', open);
    if (open) {
      ovl.style.visibility = 'visible';
      ovl.removeAttribute('inert');
      lenis && lenis.stop();
      if (motion) {
        G.timeline()
          .fromTo(ovl, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'expo.inOut' })
          .fromTo($$('.ovl__links a', ovl), { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.05, duration: 0.8, ease: 'expo.out' }, '-=.45')
          .fromTo($$('.ovl__aside > *', ovl), { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, duration: 0.6, ease: 'power3.out' }, '-=.6');
      } else { ovl.style.clipPath = 'none'; }
      closeBtn && closeBtn.focus();
    } else {
      var done = function () { ovl.style.visibility = 'hidden'; ovl.setAttribute('inert', ''); lenis && lenis.start(); };
      if (motion) G.to(ovl, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.8, ease: 'expo.inOut', onComplete: done });
      else { ovl.style.clipPath = 'inset(0 0 100% 0)'; done(); }
      menuBtn && menuBtn.focus();
    }
  }
  if (ovl) {
    ovl.setAttribute('inert', '');
    menuBtn && menuBtn.addEventListener('click', function () { setMenu(true); });
    closeBtn && closeBtn.addEventListener('click', function () { setMenu(false); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuOpen) setMenu(false); });
  }

  /* ---------------------------------------------------------------
     Anchor links (same page)
  --------------------------------------------------------------- */
  d.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href*="#"]');
    if (!a) return;
    var url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash || url.hash === '#') return;
    var t = d.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!t) return;
    e.preventDefault();
    if (menuOpen) setMenu(false);
    scrollToEl(t);
    history.replaceState(null, '', url.hash);
  });

  /* ---------------------------------------------------------------
     Page transitions
  --------------------------------------------------------------- */
  var pt = $('.pt');
  if (motion && pt) {
    d.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if ((a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      var raw = a.getAttribute('href');
      if (!raw || raw.charAt(0) === '#' || /^(mailto|tel|sms|whatsapp):/i.test(raw)) return;
      var url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.hash) return;
      e.preventDefault();
      store('ig-pt', '1');
      pt.classList.add('is-on');
      G.fromTo(pt, { clipPath: 'inset(100% 0% 0% 0%)' }, {
        clipPath: 'inset(0% 0% 0% 0%)', duration: 0.75, ease: 'expo.inOut',
        onComplete: function () { location.href = a.href; }
      });
    });
    W.addEventListener('pageshow', function (e) {
      if (e.persisted) { pt.classList.remove('is-on'); html.classList.remove('pt-in'); G.set(pt, { clearProps: 'clipPath' }); }
    });
  }

  /* ---------------------------------------------------------------
     Loader → page intro
  --------------------------------------------------------------- */
  var ldr = $('.ldr');
  function boot(next) {
    if (!motion || html.classList.contains('no-loader') || !ldr) {
      if (ldr) ldr.remove();
      if (motion && html.classList.contains('pt-in') && pt) {
        pt.classList.add('is-on');
        G.fromTo(pt, { clipPath: 'inset(0% 0% 0% 0%)' }, {
          clipPath: 'inset(0% 0% 100% 0%)', duration: 0.9, ease: 'expo.inOut', delay: 0.05,
          onComplete: function () { pt.classList.remove('is-on'); html.classList.remove('pt-in'); }
        });
        G.delayedCall(0.35, next);
      } else next();
      return;
    }
    store('ig-seen', '1');
    lenis && lenis.stop();
    var cnt = $('.ldr__count', ldr), o = { v: 0 };
    G.timeline({ onComplete: function () { ldr.remove(); lenis && lenis.start(); } })
      .from($$('.ldr__mark .b', ldr), { scaleY: 0, transformOrigin: '50% 100%', stagger: 0.045, duration: 0.55, ease: 'power3.out' })
      .from($('.ldr__name', ldr), { y: 18, autoAlpha: 0, duration: 0.7, ease: 'power3.out' }, '-=.3')
      .to(o, { v: 100, duration: 1.7, ease: 'power2.inOut', onUpdate: function () { cnt.textContent = Math.round(o.v); } }, 0)
      .to(ldr, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.05, ease: 'expo.inOut' }, '+=.05')
      .add(next, '-=.6');
  }

  /* ---------------------------------------------------------------
     The gate (home hero): arch window that opens into the full view
  --------------------------------------------------------------- */
  var gate = $('.gate');
  var gateState = { p: 0, e: 0 };
  function gateSetup() {
    if (!gate || !motion) return null;
    var frame = $('.gate__frame', gate), media = $(':scope > .gate__media', gate);
    if (!frame || !media) return null;
    var R = {};
    function draw() {
      var k = 1 - gateState.p, e = gateState.e;
      var top = (R.t + (1 - e) * R.h) * k;
      media.style.clipPath = 'inset(' + top.toFixed(1) + 'px ' + (R.r * k).toFixed(1) + 'px ' + (R.b * k).toFixed(1) + 'px ' + (R.l * k).toFixed(1) +
        'px round ' + (R.rad * k).toFixed(1) + 'px ' + (R.rad * k).toFixed(1) + 'px 0px 0px)';
    }
    function measure() {
      var g = gate.getBoundingClientRect(), f = frame.getBoundingClientRect();
      R = { t: f.top - g.top, r: g.right - f.right, b: g.bottom - f.bottom, l: f.left - g.left, rad: f.width / 2, h: f.height };
      draw();
    }
    gate.classList.add('is-live');
    measure();
    var copy = $('.gate__copy', gate), cap = $('.gate__caption', gate), cue = $('.scroll-cue', gate), img = $('img', media);
    G.timeline({
      scrollTrigger: { trigger: gate, start: 'top top', end: '+=110%', pin: true, scrub: 1, invalidateOnRefresh: true, onRefresh: measure }
    })
      .to(gateState, { p: 1, ease: 'power2.inOut', duration: 1, onUpdate: draw }, 0)
      .to(copy, { yPercent: -14, autoAlpha: 0, ease: 'power1.in', duration: 0.5 }, 0)
      .to(cue, { autoAlpha: 0, duration: 0.15 }, 0)
      .fromTo(img, { scale: 1.16 }, { scale: 1, ease: 'none', duration: 1 }, 0)
      .to(media, { '--shade': 1, duration: 1, ease: 'none' }, 0)
      .to(cap, { autoAlpha: 1, duration: 0.25 }, 0.72)
      .from($$('li', cap), { y: 26, opacity: 0, stagger: 0.035, duration: 0.25 }, 0.72);
    W.addEventListener('resize', measure);
    return draw;
  }
  var gateDraw = gateSetup();

  function introHome() {
    if (!gate) return;
    var words = splitWords($('.gate__title', gate));
    var tl = G.timeline({ defaults: { ease: 'expo.out' } });
    tl.fromTo(words, { yPercent: 115 }, { yPercent: 0, duration: 1.4, stagger: 0.07 }, 0)
      .fromTo($$('.gate__meta, .gate__sub, .gate__actions, .scroll-cue', gate), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, stagger: 0.1 }, 0.35);
    if (gateDraw) {
      tl.fromTo(gateState, { e: 0 }, { e: 1, duration: 1.6, ease: 'expo.inOut', onUpdate: gateDraw }, 0.1)
        .fromTo($('.gate > .gate__media img'), { scale: 1.45 }, { scale: 1.16, duration: 2.2, ease: 'expo.out' }, 0.1);
    }
  }
  function introInner() {
    var ph = $('.phero');
    if (!ph) return;
    var words = splitWords($('.phero__title', ph));
    var tl = G.timeline({ defaults: { ease: 'expo.out' } });
    tl.fromTo(words, { yPercent: 115 }, { yPercent: 0, duration: 1.3, stagger: 0.06 }, 0)
      .fromTo($$('.crumbs, .phero__text', ph), { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: 0.1 }, 0.25);
    var m = $('.phero__media', ph);
    if (m) {
      tl.fromTo(m, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' }, 0.05)
        .fromTo($('img', m), { scale: 1.35 }, { scale: 1, duration: 2, ease: 'expo.out' }, 0.05);
    }
  }

  /* ---------------------------------------------------------------
     Scroll-driven effects
  --------------------------------------------------------------- */
  function scrollFx() {
    // headings that rise word by word
    $$('[data-split]').forEach(function (el) {
      if (el.closest('.gate, .phero')) return;
      var words = splitWords(el);
      G.fromTo(words, { yPercent: 115 }, {
        yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.045,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });
    // fade-up blocks
    $$('[data-reveal]').forEach(function (el) {
      G.fromTo(el, { y: 36, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true }
      });
    });
    $$('[data-stagger]').forEach(function (el) {
      G.fromTo(el.children, { y: 34, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.08,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });
    // lines that draw
    $$('[data-line]').forEach(function (el) {
      G.fromTo(el, { scaleX: 0 }, {
        scaleX: 1, transformOrigin: RTL ? '100% 50%' : '0% 50%', duration: 1.4, ease: 'expo.inOut',
        scrollTrigger: { trigger: el, start: 'top 92%', once: true }
      });
    });
    // image frames: wipe up + settle
    $$('[data-img]').forEach(function (fr) {
      var img = $('img', fr);
      G.timeline({ scrollTrigger: { trigger: fr, start: 'top 85%', once: true } })
        .fromTo(fr, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' })
        .fromTo(img, { scale: 1.3 }, { scale: 1, duration: 1.8, ease: 'expo.out' }, 0);
    });
    // parallax inside frames
    $$('[data-par]').forEach(function (fr) {
      var img = $('img', fr);
      G.fromTo(img, { yPercent: -6 }, {
        yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: fr, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
    // statement that lights up word by word
    $$('[data-scrub]').forEach(function (el) {
      var words = splitWords(el, 'sw');
      G.fromTo(words, { opacity: 0.14 }, {
        opacity: 1, ease: 'none', stagger: 0.1,
        scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 55%', scrub: true }
      });
    });
    // count-up figures
    $$('[data-count]').forEach(function (el) {
      var end = +el.dataset.count, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '', o = { v: 0 };
      var fmt = new Intl.NumberFormat('en-US');
      el.textContent = pre + '0' + suf;
      G.to(o, {
        v: end, duration: 2, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        onUpdate: function () { el.textContent = pre + fmt.format(Math.round(o.v)) + suf; }
      });
    });
    // timeline progress line
    $$('.tl__line i').forEach(function (i) {
      G.fromTo(i, { scaleY: 0 }, {
        scaleY: 1, ease: 'none',
        scrollTrigger: { trigger: i.closest('.tl'), start: 'top 70%', end: 'bottom 60%', scrub: true }
      });
    });
    // giant footer wordmark
    var word = $('.ftr__word');
    if (word) {
      var chars = $$('span', word);
      G.fromTo(chars, { yPercent: 100 }, {
        yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.035,
        scrollTrigger: { trigger: word, start: 'top 98%', once: true }
      });
    }

    // horizontal solar band (desktop)
    var hs = $('.hs');
    if (hs) {
      var mm = G.matchMedia();
      mm.add('(min-width: 861px)', function () {
        hs.classList.add('is-live');
        var row = $('.hs__row', hs), bar = $('.hs__bar i', hs);
        var dist = function () { return Math.max(0, row.scrollWidth - W.innerWidth); };
        var tw = G.to(row, {
          x: function () { return (RTL ? 1 : -1) * dist(); }, ease: 'none',
          scrollTrigger: {
            trigger: hs, start: 'top top', end: function () { return '+=' + dist(); },
            pin: true, scrub: 1, invalidateOnRefresh: true,
            onUpdate: function (s) { if (bar) bar.style.transform = 'scaleX(' + s.progress.toFixed(3) + ')'; }
          }
        });
        $$('.hs__img img', hs).forEach(function (img) {
          G.fromTo(img, { xPercent: RTL ? -7 : 7 }, {
            xPercent: RTL ? 7 : -7, ease: 'none',
            scrollTrigger: { trigger: img.parentNode, containerAnimation: tw, start: RTL ? 'right left' : 'left right', end: RTL ? 'left right' : 'right left', scrub: true }
          });
        });
        return function () { hs.classList.remove('is-live'); };
      });
    }

    // marquee that follows scroll speed and direction
    var mq = $('.mq__track');
    if (mq) {
      var x = 0, dir = 1, active = false;
      ST.create({ trigger: mq, start: 'top bottom', end: 'bottom top', onToggle: function (s) { active = s.isActive; } });
      G.ticker.add(function () {
        if (!active) return;
        var v = lenis ? lenis.velocity : 0;
        if (lenis && lenis.direction) dir = lenis.direction;
        var half = mq.scrollWidth / 2;
        x -= (0.55 + Math.min(Math.abs(v), 40) * 0.35) * dir;
        if (x <= -half) x += half;
        if (x > 0) x -= half;
        mq.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0)';
      });
    }
  }

  /* ---------------------------------------------------------------
     Pointer effects (desktop only)
  --------------------------------------------------------------- */
  function pointerFx() {
    if (!fine || !motion) return;
    // floating image over the sectors index
    var rows = $('.rows'), hm = $('.hover-media');
    if (rows && hm) {
      var imgs = $$('img', hm), xTo = G.quickTo(hm, 'x', { duration: 0.7, ease: 'power3' }), yTo = G.quickTo(hm, 'y', { duration: 0.7, ease: 'power3' });
      var rTo = G.quickTo(hm, 'rotation', { duration: 0.9, ease: 'power3' }), px = 0;
      G.set(hm, { xPercent: -50, yPercent: -50 });
      $$('.row', rows).forEach(function (r, i) {
        r.addEventListener('mouseenter', function (e) {
          if (G.getProperty(hm, 'autoAlpha') < 0.05) { G.set(hm, { x: e.clientX, y: e.clientY }); xTo(e.clientX); yTo(e.clientY); }
          imgs.forEach(function (im, j) { im.classList.toggle('on', j === i); });
          G.to(hm, { autoAlpha: 1, scale: 1, duration: 0.55, ease: 'power3.out' });
        });
      });
      rows.addEventListener('mousemove', function (e) {
        xTo(e.clientX); yTo(e.clientY);
        rTo(Math.max(-10, Math.min(10, (e.clientX - px) * 0.6))); px = e.clientX;
      });
      rows.addEventListener('mouseleave', function () { G.to(hm, { autoAlpha: 0, scale: 0.6, duration: 0.45, ease: 'power3.out' }); });
    }
    // magnetic buttons
    $$('[data-magnetic]').forEach(function (el) {
      var mx = G.quickTo(el, 'x', { duration: 0.8, ease: 'elastic.out(1, .4)' }), my = G.quickTo(el, 'y', { duration: 0.8, ease: 'elastic.out(1, .4)' });
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * 0.35); my((e.clientY - r.top - r.height / 2) * 0.35);
      });
      el.addEventListener('mouseleave', function () { mx(0); my(0); });
    });
  }

  /* ---------------------------------------------------------------
     Footer curtain
  --------------------------------------------------------------- */
  var fw = $('.foot-wrap'), ftr = $('.ftr');
  function curtain() {
    if (!fw || !ftr) return;
    fw.classList.remove('curtain');
    var h = ftr.offsetHeight;
    if (motion && W.innerWidth > 860 && h < W.innerHeight * 0.96) {
      fw.style.setProperty('--fh', h + 'px');
      fw.classList.add('curtain');
    }
  }

  /* ---------------------------------------------------------------
     Page widgets
  --------------------------------------------------------------- */
  // services: side navigation follows the section in view
  var svcs = $$('.svc');
  if (svcs.length && 'IntersectionObserver' in W) {
    var links = $$('.side a, .chips a');
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (!x.isIntersecting) return;
        links.forEach(function (l) {
          var on = l.getAttribute('href') === '#' + x.target.id;
          l.classList.toggle('on', on);
          if (on && l.parentNode.classList.contains('chips')) {
            var c = l.parentNode;
            c.scrollTo({ left: l.offsetLeft - (c.clientWidth - l.offsetWidth) / 2, behavior: 'smooth' });
          }
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    svcs.forEach(function (s) { io.observe(s); });
  }

  // projects filter
  var gallery = $('.gallery');
  $$('.filters button').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('.filters button').forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
      var f = b.dataset.f, shown = [];
      $$('.gitem', gallery).forEach(function (g) {
        var hide = f !== 'all' && g.dataset.cat !== f;
        g.classList.toggle('is-hidden', hide);
        if (!hide) shown.push(g);
      });
      gallery.classList.toggle('is-filtered', f !== 'all');
      if (motion) {
        G.fromTo(shown, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.06, ease: 'power3.out' });
        ST.refresh();
      }
    });
  });

  // solar calculator
  var calc = $('#calc');
  if (calc) {
    var SUN = 5.5, EFF = 0.78, PANEL = 585, DOD = 0.9, DIV = 0.7;
    var f = { use: $('#c-use'), amp: $('#c-amp'), day: $('#c-day'), night: $('#c-night') };
    var R = { kwp: $('#r-kwp'), pan: $('#r-pan'), inv: $('#r-inv'), bat: $('#r-bat') }, shown = { kwp: 0, pan: 0, inv: 0, bat: 0 };
    var fill = function (el) { el.style.setProperty('--p', ((el.value - el.min) / (el.max - el.min) * 100) + '%'); };
    var put = function (vals) {
      Object.keys(vals).forEach(function (k) {
        var dec = k === 'kwp' ? 1 : 0;
        if (motion) {
          G.to(shown, {
            [k]: vals[k], duration: 0.6, ease: 'power3.out', overwrite: 'auto',
            onUpdate: function () { R[k].textContent = shown[k].toFixed(dec); }
          });
        } else R[k].textContent = vals[k].toFixed(dec);
      });
    };
    var update = function () {
      var amp = +f.amp.value, day = +f.day.value, night = +f.night.value, use = f.use.value;
      [f.amp, f.day, f.night].forEach(fill);
      $('#o-amp').textContent = T.amp(amp);
      $('#o-day').textContent = T.hrs(day);
      $('#o-night').textContent = T.hrs(night);
      var kw = amp * 220 / 1000;
      var panels = Math.max(2, Math.ceil(kw * (day + night) * DIV / (SUN * EFF) * 1000 / PANEL));
      put({ kwp: panels * PANEL / 1000, pan: panels, inv: Math.max(3, Math.ceil(kw * 1.25)), bat: night ? Math.ceil(kw * night * DIV / DOD) : 0 });
      $('#r-type').textContent = T.types[use === 'farm' && night === 0 ? 0 : night === 0 ? 1 : use === 'farm' ? 2 : 3];
      var b = T.book;
      $('#calc-book').href = wa(b[0] + '\n' + b[1] + ': ' + amp + ' ' + b[2] + '\n' + b[3] + ': ' + day + '\n' + b[4] + ': ' + night);
    };
    Object.keys(f).forEach(function (k) { f[k].addEventListener('input', update); });
    update();
  }

  // quotation form → WhatsApp
  var form = $('#qform');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true, el = form.elements;
      [['name', function (v) { return v.trim().length > 1; }], ['phone', function (v) { return v.replace(/\D/g, '').length >= 10; }]]
        .forEach(function (r) {
          var good = r[1](el[r[0]].value);
          el[r[0]].closest('.field').classList.toggle('bad', !good);
          if (!good) ok = false;
        });
      if (!ok) return;
      var L = T.form;
      var url = wa(L[0] + '\n' + L[1] + ': ' + el.name.value.trim() + '\n' + L[2] + ': ' + el.phone.value.trim() + '\n' +
        L[3] + ': ' + el.service.value + '\n' + L[4] + ': ' + el.city.value + (el.msg.value.trim() ? '\n' + L[5] + ': ' + el.msg.value.trim() : ''));
      var res = $('.form__result', form);
      $('a', res).href = url;
      res.classList.add('on');
      try { W.open(url, '_blank', 'noopener'); } catch (err) { /* the link stays visible */ }
    });
  }

  var yr = $('#year');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------------
     Start
  --------------------------------------------------------------- */
  if (!motion) {
    if (ldr) ldr.remove();
    if (pt) { pt.classList.remove('is-on'); html.classList.remove('pt-in'); }
    if (gate) gate.classList.remove('is-live');
    return;
  }
  scrollFx();
  pointerFx();
  curtain();
  boot(function () { introHome(); introInner(); });

  var rz;
  W.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { curtain(); ST.refresh(); }, 200); });
  W.addEventListener('load', function () { curtain(); ST.refresh(); });
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { ST.refresh(); });
  if (location.hash) {
    var target = d.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target) W.addEventListener('load', function () { setTimeout(function () { scrollToEl(target); }, 300); });
  }
})();
