/* إنفست جيت — السكربت العام */
(function () {
  // رقم واتساب الشركة بالصيغة الدولية (بدون + وبدون أصفار في البداية)
  var WHATSAPP = '9647700000000';

  var LANG = (document.documentElement.lang || 'ar').slice(0, 3);
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
      types: ['Direct solar pumping system (no batteries)', 'On-Grid system', 'Off-Grid system', 'Hybrid system'],
      book: ['Hello, I would like to book a site survey for a solar energy system.', 'Approximate load', 'A', 'Daytime operating hours', 'Night-time operating hours'],
      form: ['Quotation request from the website', 'Name', 'Phone', 'Service required', 'Governorate', 'Details']
    }
  }[LANG === 'ckb' ? 'ckb' : LANG === 'en' ? 'en' : 'ar'];

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var waLink = function (text) { return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(text); };

  /* الرأس والقائمة */
  var header = $('.header');
  var onScroll = function () { header.classList.toggle('shadow', window.scrollY > 10); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var menuBtn = $('.menu-btn'), nav = $('.nav');
  menuBtn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
  });

  /* زر واتساب العائم */
  $$('[data-wa]').forEach(function (a) {
    a.href = waLink(T.hello);
  });

  /* السلايدر */
  var slides = $$('.slide');
  if (slides.length) {
    var dots = $$('.dots button'), cur = 0, timer;
    var go = function (n) {
      cur = (n + slides.length) % slides.length;
      slides.forEach(function (s, i) { s.classList.toggle('active', i === cur); s.setAttribute('aria-hidden', i !== cur); });
      dots.forEach(function (d, i) { d.classList.toggle('active', i === cur); });
    };
    var play = function () { clearInterval(timer); timer = setInterval(function () { go(cur + 1); }, 7000); };
    dots.forEach(function (d, i) { d.addEventListener('click', function () { go(i); play(); }); });
    $('.prev').addEventListener('click', function () { go(cur - 1); play(); });
    $('.next').addEventListener('click', function () { go(cur + 1); play(); });
    play();
  }

  /* عدّاد الأرقام */
  var counters = $$('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, end = +el.dataset.count, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '', t0 = performance.now();
        var step = function (t) {
          var p = Math.min((t - t0) / 1400, 1);
          el.textContent = pre + Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        io.unobserve(el);
      });
    }, { threshold: .5 });
    counters.forEach(function (c) { io.observe(c); });
  }

  /* فلترة المشاريع */
  $$('.filters button').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('.filters button').forEach(function (x) { x.classList.toggle('active', x === b); });
      var f = b.dataset.filter;
      $$('.proj').forEach(function (p) { p.classList.toggle('hidden', f !== 'all' && p.dataset.cat !== f); });
    });
  });

  /* قائمة الخدمات الفرعية */
  var subLinks = $$('.svc-nav a');
  if (subLinks.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        subLinks.forEach(function (l) { l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    subLinks.forEach(function (l) { var t = $(l.getAttribute('href')); if (t) spy.observe(t); });
  }

  /* حاسبة المنظومة الشمسية */
  var calc = $('#calc');
  if (calc) {
    var SUN = 5.5, EFF = 0.78, PANEL = 585, DOD = 0.9, DIVERSITY = 0.7;
    var f = { use: $('#c-use'), amp: $('#c-amp'), day: $('#c-day'), night: $('#c-night') };
    var update = function () {
      var amp = +f.amp.value, day = +f.day.value, night = +f.night.value, use = f.use.value;
      $('#o-amp').textContent = T.amp(amp);
      $('#o-day').textContent = T.hrs(day);
      $('#o-night').textContent = T.hrs(night);
      var kw = amp * 220 / 1000;
      var energy = kw * (day + night) * DIVERSITY;
      var panels = Math.max(2, Math.ceil(energy / (SUN * EFF) * 1000 / PANEL));
      $('#r-kwp').textContent = (Math.round(panels * PANEL / 100) / 10).toString();
      $('#r-pan').textContent = panels;
      $('#r-inv').textContent = Math.max(3, Math.ceil(kw * 1.25));
      $('#r-bat').textContent = night ? Math.ceil(kw * night * DIVERSITY / DOD) : 0;
      $('#r-type').textContent =
        T.types[use === 'farm' && night === 0 ? 0 : night === 0 ? 1 : use === 'farm' ? 2 : 3];
    };
    Object.keys(f).forEach(function (k) { f[k].addEventListener('input', update); });
    update();
    var book = $('#calc-book');
    var setBook = function () {
      var b = T.book;
      book.href = waLink(b[0] + '\n' + b[1] + ': ' + f.amp.value + ' ' + b[2] + '\n' + b[3] + ': ' + f.day.value + '\n' + b[4] + ': ' + f.night.value);
    };
    Object.keys(f).forEach(function (k) { f[k].addEventListener('input', setBook); });
    setBook();
  }

  /* نموذج التواصل */
  var form = $('#contact-form');
  if (form) {
    var params = new URLSearchParams(location.search);
    if (params.get('service')) form.elements.service.value = params.get('service');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      [['name', function (v) { return v.trim().length > 1; }], ['phone', function (v) { return v.replace(/\D/g, '').length >= 10; }]]
        .forEach(function (r) {
          var input = form.elements[r[0]], valid = r[1](input.value);
          input.closest('.field').classList.toggle('invalid', !valid);
          if (!valid) ok = false;
        });
      if (!ok) return;
      var d = form.elements;
      var L = T.form;
      var text = L[0] + '\n' +
        L[1] + ': ' + d.name.value.trim() + '\n' +
        L[2] + ': ' + d.phone.value.trim() + '\n' +
        L[3] + ': ' + d.service.value + '\n' +
        L[4] + ': ' + d.city.value +
        (d.msg.value.trim() ? '\n' + L[5] + ': ' + d.msg.value.trim() : '');
      var url = waLink(text);
      var res = $('#form-result');
      $('a', res).href = url;
      res.classList.add('show');
      try { window.open(url, '_blank', 'noopener'); } catch (err) { /* يبقى الرابط ظاهراً */ }
    });
  }

  var yr = $('#year');
  if (yr) yr.textContent = new Date().getFullYear();
})();
