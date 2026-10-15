// 2026-10-15 追加: スマホ幅（<=980px）のメニュー開閉。表示は site-enhance.css 側。
(function () {
  var header = document.querySelector('.site-header');
  var nav = header && header.querySelector('nav');
  if (!nav) return;
  var en = document.documentElement.lang === 'en';
  var labels = en ? ['Open menu', 'Close menu'] : ['メニューを開く', 'メニューを閉じる'];
  if (!nav.id) nav.id = 'site-nav';

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'nav-toggle';
  btn.setAttribute('aria-controls', nav.id);
  btn.innerHTML = '<span></span><span></span><span></span>';
  header.appendChild(btn);

  function setOpen(open) {
    header.classList.toggle('nav-open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', labels[open ? 1 : 0]);
  }
  setOpen(false);

  btn.addEventListener('click', function () { setOpen(!header.classList.contains('nav-open')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
  window.matchMedia('(min-width: 981px)').addEventListener('change', function (m) { if (m.matches) setOpen(false); });
})();
