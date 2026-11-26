/* extra.js - render.js uzerine ek bolum cizicileri. Guvenlik: yalnizca textContent / createElement. */
(function () {
  'use strict';
  var K = window.SiteKit;
  if (!K) return;
  var doc = document, C = window.SITE_CONTENT || {};
  var R = K.R, el = K.el, L = K.L, t = K.t, img = K.img, safeUrl = K.safeUrl, safeImg = K.safeImg;
  function arr(v) { return Array.isArray(v) ? v : []; }
  /* listeyi temizler, her oge icin make() sonucunu ekler */
  function each(host, items, make) {
    K.clear(host);
    items.forEach(function (x, i) { var n = make(x, i); if (n) host.appendChild(n); });
    K.finishList(host, items.length);
  }
  function button(cls, text, fn) {
    var b = el('button', cls, text); b.type = 'button'; b.addEventListener('click', fn); return b;
  }
  function figure(src, alt, caption, cls) {
    var f = el('figure', cls || 'shot'), a = el('a'), u = safeImg(src);
    a.href = u; a.setAttribute('data-lightbox', '');
    a.appendChild(img(src, alt || caption, 800, 600));
    f.appendChild(a);
    if (caption) f.appendChild(el('figcaption', '', caption));
    return f;
  }
  function chips(items) {
    var ul = el('ul', 'chips');
    arr(items).forEach(function (x) { var li = el('li'); li.appendChild(el('span', 'chip', L(x))); ul.appendChild(li); });
    return ul;
  }
  function titleCard(title, text, tag) {
    var li = el(tag || 'li', 'panel'); li.appendChild(el('h3', '', title)); li.appendChild(el('p', '', text)); return li;
  }

  /* ---------- ana sayfa / hakkimda ---------- */
  R.why = function (h) { each(h, arr(C.why), function (p) { return el('p', 'lead', L(p)); }); };
  R.works = function (h) { each(h, arr(C.works), function (w) { return titleCard(L(w.title), L(w.text)); }); };
  R.stats = function (h) {
    each(h, arr(C.stats), function (s) {
      var d = el('div', 'stat is-visible'); d.appendChild(el('dt', '', L(s.label))); d.appendChild(el('dd', '', String(s.value))); return d;
    });
  };
  R.languages = function (h) {
    K.clear(h);
    arr(C.languages).forEach(function (x) { h.appendChild(el('dt', '', L(x.name))); h.appendChild(el('dd', '', L(x.level))); });
    K.finishList(h, arr(C.languages).length);
  };
  R['top-tech'] = function (h) { each(h, arr(C.topTech), function (x) { return el('li', '', L(x.text)); }); };
  R.facts2 = function (h) { each(h, arr(C.didYouKnow), function (x) { return el('li', 'panel', L(x.text)); }); };
  R.abbr = function (h) {
    K.clear(h);
    arr(C.abbreviations).forEach(function (x) {
      var dt = el('dt'), a = el('abbr', '', x.short); a.title = L(x.long); dt.appendChild(a);
      h.appendChild(dt); h.appendChild(el('dd', '', L(x.long)));
    });
    K.finishList(h, arr(C.abbreviations).length);
  };

  /* ---------- projeler ---------- */
  var dialog = null, openProject = null;
  function projectDialog(p) {
    if (!dialog) {
      dialog = el('dialog', 'modal');
      dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
      dialog.addEventListener('close', function () { openProject = null; });
      doc.body.appendChild(dialog);
    }
    openProject = p;
    K.clear(dialog);
    var box = el('div', 'modal__box');
    box.appendChild(button('btn btn--ghost modal__close', t('lb.close'), function () { dialog.close(); }));
    var h = el('h2', '', L(p.title)); h.id = 'modal-title'; dialog.setAttribute('aria-labelledby', h.id); box.appendChild(h);
    var main = img(p.image, L(p.imageAlt) || L(p.title), 800, 600, false); box.appendChild(main);
    var full = el('a', '', t('proj.full')); full.href = safeImg(p.full || p.image); full.target = '_blank'; full.rel = 'noopener';
    var fp = el('p'); fp.appendChild(full); box.appendChild(fp);
    box.appendChild(el('p', '', L(p.summary)));
    if (arr(p.techniques).length) { box.appendChild(el('h3', '', t('proj.tech'))); box.appendChild(chips(p.techniques)); }
    if (arr(p.views).length) {
      box.appendChild(el('h3', '', t('proj.views')));
      var g = el('div', 'modal__views');
      p.views.forEach(function (v) {
        var f = el('figure'), a = el('a'); a.href = safeImg(v.image); a.target = '_blank'; a.rel = 'noopener';
        a.appendChild(img(v.image, L(v.label), 800, 600)); f.appendChild(a); f.appendChild(el('figcaption', '', L(v.label))); g.appendChild(f);
      });
      box.appendChild(g);
    }
    var demo = safeUrl((p.links || {}).demo);
    if (demo) { var d = el('a', 'btn', t((p.links || {}).demoLabel === 'ref' ? 'proj.ref' : 'proj.demo')); d.href = demo; d.target = '_blank'; d.rel = 'noopener noreferrer'; box.appendChild(d); }
    dialog.appendChild(box);
    if (!dialog.open) dialog.showModal();
  }
  function projects() { return K.list('projects'); }

  R['project-details'] = function (h) {
    each(h, projects(), function (p) {
      var card = el('article', 'card reveal'); card.id = p.slug;
      var fig = el('figure', 'card__media'); fig.appendChild(img(p.image, L(p.imageAlt) || L(p.title), 800, 600)); card.appendChild(fig);
      var body = el('div', 'card__body');
      body.appendChild(el('h3', '', L(p.title)));
      body.appendChild(el('p', '', L(p.summary)));
      body.appendChild(chips(p.techniques));
      body.appendChild(button('btn btn--ghost', t('proj.open'), function () { projectDialog(p); }));
      card.appendChild(body); return card;
    });
  };
  R.spotlight = function (h) {
    each(h, projects().filter(function (p) { return p.featured; }), function (p) {
      var row = el('article', 'spot reveal');
      row.appendChild(figure(p.image, L(p.imageAlt), '', 'shot spot__media'));
      var d = el('div'); d.appendChild(el('h3', '', L(p.title))); d.appendChild(el('p', '', L(p.summary))); d.appendChild(chips(p.techniques));
      d.appendChild(button('btn btn--ghost', t('proj.open'), function () { projectDialog(p); }));
      row.appendChild(d); return row;
    });
  };
  var dealt = false;
  R.deck = function (h) {
    K.clear(h);
    var all = projects();
    var table = el('ul', 'deck' + (dealt ? ' is-dealt' : ''));
    all.forEach(function (p, i) {
      var li = el('li'); li.style.setProperty('--n', i);
      var b = button('deck__card', '', function () { if (dealt) projectDialog(p); else toggle(); });
      b.appendChild(img(p.image, '', 800, 600)); b.appendChild(el('span', '', L(p.title)));
      li.appendChild(b); table.appendChild(li);
    });
    var ctl = button('btn', t(dealt ? 'deck.gather' : 'deck.deal'), toggle);
    ctl.setAttribute('aria-pressed', String(dealt));
    function sync() {
      Array.prototype.forEach.call(table.querySelectorAll('button'), function (b, i) { b.tabIndex = dealt || i === all.length - 1 ? 0 : -1; });
    }
    function toggle() {
      dealt = !dealt; table.classList.toggle('is-dealt', dealt);
      ctl.textContent = t(dealt ? 'deck.gather' : 'deck.deal'); ctl.setAttribute('aria-pressed', String(dealt)); sync();
    }
    sync(); h.appendChild(ctl); h.appendChild(table);
    K.finishList(h, all.length);
  };
  R.compare = function (h) {
    K.clear(h);
    var c = C.compare;
    if (!c || !c.before || !c.after) { K.finishList(h, 0); return; }
    var box = el('div', 'compare'); box.style.setProperty('--pos', '50%');
    box.appendChild(img(c.after, t('cmp.after'), 800, 600));
    var top = img(c.before, t('cmp.before'), 800, 600); top.className = 'compare__top'; box.appendChild(top);
    box.appendChild(el('span', 'compare__line'));
    var r = el('input'); r.type = 'range'; r.min = 0; r.max = 100; r.value = 50; r.setAttribute('aria-label', t('cmp.label'));
    r.addEventListener('input', function () { box.style.setProperty('--pos', r.value + '%'); });
    box.appendChild(r); h.appendChild(box);
    h.appendChild(el('p', 'muted', t('cmp.help')));
    K.finishList(h, 1);
  };
  R['code-projects'] = function (h) {
    each(h, arr(C.codeProjects), function (g) {
      var d = el('div', 'panel'); d.appendChild(el('h3', '', L(g.title)));
      var ul = el('ul');
      arr(g.items).forEach(function (x) { var li = el('li'); li.appendChild(el('strong', '', L(x.title))); li.appendChild(doc.createTextNode(': ' + L(x.text))); ul.appendChild(li); });
      d.appendChild(ul); return d;
    });
  };

  /* ---------- galeri ---------- */
  R.game = function (h) {
    K.clear(h);
    var g = C.game;
    if (!g) { K.finishList(h, 0); return; }
    h.appendChild(el('h3', '', L(g.title))); h.appendChild(el('p', '', L(g.text)));
    var dl = el('dl', 'facts'); arr(g.facts).forEach(function (f) { dl.appendChild(el('dt', '', L(f.label))); dl.appendChild(el('dd', '', L(f.value))); }); h.appendChild(dl);
    var grid = el('div', 'gallery'); arr(g.shots).forEach(function (s) { grid.appendChild(figure(s.image, L(s.caption), L(s.caption))); }); h.appendChild(grid);
    K.finishList(h, 1);
  };
  R.prototypes = function (h) {
    each(h, arr(C.prototypes), function (p) {
      var card = el('article', 'card'); var f = figure(p.image, L(p.title), '', 'card__media'); card.appendChild(f);
      var b = el('div', 'card__body'); b.appendChild(el('h3', '', L(p.title))); b.appendChild(el('p', '', L(p.text))); card.appendChild(b); return card;
    });
  };
  var category = '';
  R.photos = function (h) {
    K.clear(h);
    var all = K.list('gallery'), seen = [], names = {};
    all.forEach(function (g) { var k = g.group && g.group.tr; if (k && !names[k]) { names[k] = g.group; seen.push(k); } });
    var bar = el('div', 'chips filter-chips'); bar.setAttribute('role', 'group'); bar.setAttribute('aria-label', t('gal.filter'));
    [''].concat(seen).forEach(function (k) {
      var b = button('chip chip--btn', k ? L(names[k]) : t('filter.all'), function () {
        category = k; R.photos(h);
        var again = h.querySelector('[aria-pressed="true"]'); if (again) again.focus();
      });
      b.setAttribute('aria-pressed', String(k === category)); bar.appendChild(b);
    });
    h.appendChild(bar);
    var grid = el('div', 'gallery');
    all.filter(function (g) { return !category || (g.group && g.group.tr === category); }).forEach(function (g) {
      var f = figure(g.image, L(g.alt), '');
      var cap = el('figcaption'); cap.appendChild(el('strong', '', L(g.title))); cap.appendChild(el('span', 'tag', L(g.group))); cap.appendChild(doc.createTextNode(' ' + L(g.caption)));
      f.appendChild(cap); grid.appendChild(f);
    });
    h.appendChild(grid);
    K.finishList(h, all.length);
  };

  /* ---------- blog ---------- */
  R.upcoming = function (h) { each(h, arr(C.upcomingPosts), function (x) { return el('li', '', L(x.text)); }); };
  var basePost = R.post;
  R.post = function (host) {
    basePost(host);
    var slug = new URLSearchParams(location.search).get('slug') || '';
    var posts = K.list('posts'), p = posts.filter(function (x) { return x.slug === slug; })[0];
    if (!p) return;
    var headings = host.querySelectorAll(':scope > h2, :scope > h3');
    var toc = el('nav', 'toc panel'); toc.setAttribute('aria-labelledby', 'toc-h');
    var th = el('h2', 'toc__title', t('post.toc')); th.id = 'toc-h'; toc.appendChild(th);
    var ol = el('ol');
    Array.prototype.forEach.call(headings, function (h, i) {
      h.id = 'bolum-' + (i + 1);
      var li = el('li'), a = el('a', '', h.textContent); a.href = '#' + h.id; li.appendChild(a); ol.appendChild(li);
    });
    toc.appendChild(ol);
    if (headings.length) host.insertBefore(toc, host.querySelector('.post-meta').nextSibling);
    var end = host.querySelector('.post-nav');
    if (L(p.summary)) {
      var s = el('aside', 'panel'); s.appendChild(el('h2', 'toc__title', t('post.summary'))); s.appendChild(el('p', '', L(p.summary))); host.insertBefore(s, end);
    }
    var others = posts.filter(function (x) { return x !== p; });
    if (others.length) {
      var sec = el('section'); sec.appendChild(el('h2', 'toc__title', t('post.others')));
      var ul = el('ul'); others.forEach(function (x) { var li = el('li'), a = el('a', '', L(x.title)); a.href = 'post.html?slug=' + encodeURIComponent(x.slug); li.appendChild(a); ul.appendChild(li); });
      sec.appendChild(ul); host.insertBefore(sec, end);
    }
  };

  window.addEventListener('langchange', function () { if (dialog && dialog.open && openProject) projectDialog(openProject); });
})();
