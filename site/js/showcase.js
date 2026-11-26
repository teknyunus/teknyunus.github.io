/* showcase.js - giris katmanlari, arac seridi, proje mozaigi ve sergi goruntuleyici. */
(function () {
  'use strict';
  var K = window.SiteKit;
  if (!K) return;
  var doc = document, C = window.SITE_CONTENT || {};
  var R = K.R, el = K.el, L = K.L, t = K.t, img = K.img, safeImg = K.safeImg;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function projects() { return K.list('projects'); }
  function paint(node, p) { if (/^#[0-9a-f]{6}$/i.test(p.color || '')) node.style.setProperty('--c', p.color); }
  function href(p) { return 'projeler.html#' + encodeURIComponent(p.slug); }

  R['hero-layers'] = function (h) {
    K.clear(h);
    var picks = projects().filter(function (p) { return p.hero; }).sort(function (a, b) { return a.hero - b.hero; });
    picks.forEach(function (p, i) {
      var a = el('a', 'layers__item'); a.href = href(p); a.style.setProperty('--n', i); paint(a, p);
      a.appendChild(img(p.image, L(p.imageAlt), 800, 600, false));
      a.appendChild(el('span', '', L(p.short || p.title)));
      h.appendChild(a);
    });
    /* fare ile derinlik hareketi (yalnizca ince isaretci) */
    if (!h.dataset.bound && !reduce && window.matchMedia('(pointer: fine)').matches) {
      h.dataset.bound = '1';
      var area = h.closest('section') || h;
      area.addEventListener('pointermove', function (e) {
        var r = area.getBoundingClientRect();
        h.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
        h.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
      });
      area.addEventListener('pointerleave', function () { h.style.setProperty('--mx', 0); h.style.setProperty('--my', 0); });
    }
  };

  R.ticker = function (h) {
    K.clear(h);
    var words = (C.ticker || []).map(L);
    var track = el('div', 'marquee__track');
    for (var n = 0; n < 2; n++) {
      var ul = el('ul', 'marquee__group');
      if (n) ul.setAttribute('aria-hidden', 'true');
      words.forEach(function (w) { ul.appendChild(el('li', '', w)); });
      track.appendChild(ul);
    }
    h.appendChild(track);
  };

  R.mosaic = function (h) {
    K.clear(h);
    var picks = projects().filter(function (p) { return p.featured; }).slice(0, 3);
    picks.forEach(function (p) {
      var a = el('a', 'tile'); a.href = href(p); paint(a, p);
      a.appendChild(img(p.image, L(p.imageAlt), 800, 600));
      var d = el('div'); d.appendChild(el('h3', '', L(p.title))); d.appendChild(el('p', '', (p.techniques || []).slice(0, 2).map(L).join(', ')));
      a.appendChild(d); h.appendChild(a);
    });
    K.finishList(h, picks.length);
  };

  R.reel = function (h) {
    K.clear(h);
    var all = projects();
    all.forEach(function (p) {
      var li = el('li'), a = el('a'); a.href = '#' + p.slug; paint(a, p);
      a.appendChild(img(p.image, '', 800, 600, false)); a.appendChild(el('span', '', L(p.short || p.title)));
      li.appendChild(a); h.appendChild(li);
    });
    K.finishList(h, all.length);
  };

  /* ---------- sergi goruntuleyici ---------- */
  var chosen = {};   /* dil degisiminde secili gorunum korunur */
  function frames(p) {
    var out = [];
    if (p.compare) out.push({ type: 'compare', label: t('view.compare'), thumb: p.compare.before });
    out.push({ type: 'image', label: t('cmp.after'), image: p.full || p.image, thumb: p.image });
    (p.views || []).forEach(function (v) { out.push({ type: 'image', label: L(v.label), image: v.image, thumb: v.image, kind: v.kind }); });
    return out;
  }
  function compareBox(p) {
    var box = el('div', 'compare'); box.style.setProperty('--pos', '50%');
    box.appendChild(img(p.compare.after, t('cmp.after'), 800, 600));
    var top = img(p.compare.before, t('cmp.before'), 800, 600); top.className = 'compare__top'; box.appendChild(top);
    box.appendChild(el('span', 'compare__line'));
    box.appendChild(el('span', 'compare__tag compare__tag--a', t('cmp.before')));
    box.appendChild(el('span', 'compare__tag compare__tag--b', t('cmp.after')));
    var r = el('input'); r.type = 'range'; r.min = 0; r.max = 100; r.value = 50; r.setAttribute('aria-label', L(p.title) + ': ' + t('cmp.label'));
    r.addEventListener('input', function () { box.style.setProperty('--pos', r.value + '%'); });
    box.appendChild(r);
    return box;
  }
  function viewer(p) {
    var wrap = el('div', 'viewer'), screen = el('div', 'viewer__screen'), cap = el('p', 'viewer__caption'), strip = el('div', 'viewer__strip');
    strip.setAttribute('role', 'group'); strip.setAttribute('aria-label', L(p.title) + ': ' + t('proj.views'));
    var list = frames(p);
    function show(i) {
      var f = list[i]; chosen[p.slug] = i;
      K.clear(screen); K.clear(cap);
      screen.className = 'viewer__screen'; screen.scrollTop = 0;
      var name = el('strong', '', f.label); cap.appendChild(name);
      if (f.type === 'compare') { screen.appendChild(compareBox(p)); cap.appendChild(el('span', '', t('cmp.help'))); }
      else {
        var a = el('a'); a.href = safeImg(f.image); a.target = '_blank'; a.rel = 'noopener';
        var big = img(f.image, L(p.title) + ': ' + f.label, 0, 0, i === 0 ? true : false);
        a.appendChild(big); screen.appendChild(a);
        /* uzun sayfa tasarimlari ekranin icinde kaydirilir; dar panel goruntuleri koyu zeminde durur */
        var fit = function () {
          if (f.kind === 'panel') screen.classList.add('viewer__screen--dark');
          else if (big.naturalHeight > big.naturalWidth * 1.3) { screen.classList.add('viewer__screen--scroll'); if (!cap.dataset.s) cap.appendChild(el('span', '', t('view.scroll'))); }
        };
        if (big.complete && big.naturalWidth) fit(); else big.addEventListener('load', fit, { once: true });
        var full = el('a', '', t('proj.full')); full.href = safeImg(f.image); full.target = '_blank'; full.rel = 'noopener'; cap.appendChild(full);
      }
      Array.prototype.forEach.call(strip.children, function (b, n) { b.setAttribute('aria-pressed', String(n === i)); });
    }
    list.forEach(function (f, i) {
      var b = el('button', 'viewer__thumb'); b.type = 'button'; b.title = f.label; b.setAttribute('aria-label', f.label);
      b.appendChild(img(f.thumb, '', 86, 62));
      b.addEventListener('click', function () { show(i); });
      strip.appendChild(b);
    });
    wrap.appendChild(screen); wrap.appendChild(cap); wrap.appendChild(strip);
    show(chosen[p.slug] && chosen[p.slug] < list.length ? chosen[p.slug] : 0);
    return wrap;
  }
  R.exhibits = function (h) {
    K.clear(h);
    var all = projects();
    all.forEach(function (p) {
      var art = el('article', 'exhibit reveal'); art.id = p.slug; paint(art, p);
      var info = el('div', 'exhibit__info');
      info.appendChild(el('h3', '', L(p.title)));
      info.appendChild(el('p', '', L(p.summary)));
      var ul = el('ul', 'chips'); (p.techniques || []).forEach(function (x) { var li = el('li'); li.appendChild(el('span', 'chip', L(x))); ul.appendChild(li); }); info.appendChild(ul);
      var b = el('button', 'btn btn--ghost', t('proj.open')); b.type = 'button';
      b.addEventListener('click', function () { if (K.openProject) K.openProject(p); });
      info.appendChild(b);
      art.appendChild(info); art.appendChild(viewer(p));
      h.appendChild(art);
    });
    K.finishList(h, all.length);
  };
})();
