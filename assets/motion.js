// 2026-10-15 追加: 画面の動き（全ページ共通）。表示は site-enhance.css 側。
// 「動きを減らす」設定の端末では何もしない（JSが無くても全要素は普通に表示される）。
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var header = document.querySelector('.site-header');
  function headerH() { return header ? header.getBoundingClientRect().height : 0; }
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  // 1. ボタンのリップル（押した位置から波紋が広がる）
  var RIPPLE = '.nav-cta, .hero-actions a, .bp-actions a, .contact-email-row a, .ripple';
  document.addEventListener('pointerdown', function (e) {
    var b = e.target.closest(RIPPLE);
    if (!b || reduce) return;
    var r = b.getBoundingClientRect();
    var d = Math.max(r.width, r.height) * 2.2;
    var ink = document.createElement('span');
    ink.className = 'ripple-ink';
    ink.style.width = ink.style.height = d + 'px';
    ink.style.left = (e.clientX - r.left - d / 2) + 'px';
    ink.style.top = (e.clientY - r.top - d / 2) + 'px';
    b.appendChild(ink);
    ink.addEventListener('animationend', function () { ink.remove(); });
  });

  // 2. ページ内リンクのスムーススクロール（固定ヘッダーの高さを差し引いて着地）
  document.documentElement.style.scrollBehavior = 'auto';
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function scrollToY(y) {
    if (reduce) { window.scrollTo(0, y); return; }
    var from = window.scrollY, dist = y - from;
    var dur = Math.min(1200, 450 + Math.abs(dist) * 0.25), t0 = null;
    function step(ts) {
      if (t0 === null) t0 = ts;
      var t = Math.min(1, (ts - t0) / dur);
      window.scrollTo(0, from + dist * ease(t));
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href*="#"]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    var url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
    var id = decodeURIComponent(url.hash.slice(1));
    var target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    var y = id === 'top' ? 0 : target.getBoundingClientRect().top + window.scrollY - headerH() - 12;
    scrollToY(Math.max(0, y));
    history.pushState(null, '', url.hash);
  });

  if (reduce) return;

  // 3. スライドイン（実績・体制、発注者側支援のカード等）
  var REVEAL = [
    '#track-record .ledger-row', '#track-record .ledger-note', '#track-record .advisor-grid article',
    '#track-record .principal-note', '.oe-visual article', '.oe-visual li', '.oe-chips li', '.oe-no li', '.oe-note'
  ].join(',');
  var items = document.querySelectorAll(REVEAL);
  if (items.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) {
      var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.matches(REVEAL); });
      var i = sibs.indexOf(el);
      // 行は左から、2列のカードは左右交互に
      var fromRight = el.closest('.advisor-grid') && i % 2 === 1;
      el.style.setProperty('--rx', fromRight ? '48px' : '-48px');
      el.style.setProperty('--rd', (i * 0.09).toFixed(2) + 's');
      el.classList.add('reveal');
      io.observe(el);
    });
  }

  // 5. トップの青図面：スクロールとマウスで奥行き（遠景は少し、近景は大きく動かす）
  var bp = document.querySelector('.bp-hero');
  if (bp) {
    var far = bp.querySelector('.bp-far'), near = bp.querySelector('.bp-near');
    var raf2 = false;
    window.addEventListener('scroll', function () {
      if (raf2) return;
      raf2 = true;
      requestAnimationFrame(function () {
        raf2 = false;
        var y = Math.min(window.scrollY, bp.offsetHeight);
        far.style.setProperty('--py-far', (y * 0.12).toFixed(1));
        near.style.setProperty('--py-near', (y * 0.3).toFixed(1));
      });
    }, { passive: true });
    if (window.matchMedia('(hover: hover)').matches) {
      bp.addEventListener('pointermove', function (e) {
        var r = bp.getBoundingClientRect();
        var dx = (e.clientX - r.left) / r.width - 0.5;
        far.style.setProperty('--mx-far', (-dx * 10).toFixed(1));
        near.style.setProperty('--mx-near', (-dx * 26).toFixed(1));
      });
    }
  }

  // 4. 「構想から立ち上げまで」のピン止め＋スクラブ（スクロール量に合わせて階段が1段ずつ立ち上がる）
  var pin = document.querySelector('.cycle-pin');
  if (pin) {
    var sticky = pin.querySelector('.cycle-sticky');
    var steps = pin.querySelectorAll('.stairs li');
    var on = false;
    function layout() {
      pin.classList.remove('pin-on');
      pin.style.height = '';
      steps.forEach(function (s) { s.style.removeProperty('--s'); });
      var room = window.innerHeight - headerH();
      on = window.innerWidth >= 981 && sticky.offsetHeight <= room - 16;
      if (!on) return;
      pin.classList.add('pin-on');
      pin.style.setProperty('--hh', headerH() + 'px');
      // ピン中は sticky が画面の高さ（room）になるので、それに送り量 1.1 画面分を足す
      pin.style.height = (room + window.innerHeight * 1.1) + 'px';
      update();
    }
    function update() {
      if (!on) return;
      var r = pin.getBoundingClientRect();
      var travel = pin.offsetHeight - sticky.offsetHeight;
      var p = clamp((headerH() - r.top) / travel);
      steps.forEach(function (s, i) { s.style.setProperty('--s', clamp(p * 1.18 * steps.length - i).toFixed(3)); });
    }
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { ticking = false; update(); });
    }, { passive: true });
    window.addEventListener('resize', layout);
    window.addEventListener('load', layout);
    layout();
  }
})();
