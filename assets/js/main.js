(function () {
  'use strict';

  var GH_USER = 'HamzaHassanain';
  var CF_HANDLES = ['GreatShinobiOwl', 'Hmzaawy'];
  var root = document.documentElement;
  root.classList.add('js');

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function store(key, val) {
    try { if (val === undefined) return localStorage.getItem(key); localStorage.setItem(key, val); } catch (e) { return null; }
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function getJSON(url) {
    return fetch(url, { headers: { Accept: 'application/json' } }).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    });
  }

  /* ---------- Theme ---------- */
  var themeBtn = $('#theme-toggle');
  function effectiveTheme() {
    var t = root.dataset.theme;
    if (t === 'light' || t === 'dark') return t;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  themeBtn.addEventListener('click', function () {
    var next = effectiveTheme() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    store('theme', next);
  });

  /* ---------- Mobile menu ---------- */
  var menuBtn = $('#menu-toggle');
  var links = $('.nav__links');
  menuBtn.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  $all('a', links).forEach(function (a) {
    a.addEventListener('click', function () { links.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); });
  });

  /* ---------- Active nav link + reveal on scroll ---------- */
  if ('IntersectionObserver' in window) {
    var navMap = {};
    $all('a', links).forEach(function (a) { navMap[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && navMap[e.target.id]) {
          $all('a', links).forEach(function (a) { a.classList.remove('active'); });
          navMap[e.target.id].classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $all('main section[id]').forEach(function (s) { spy.observe(s); });

    var reveal = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); reveal.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    $all('.section .card, .section .posts, .stats').forEach(function (el) { el.classList.add('reveal'); reveal.observe(el); });
  }

  /* ---------- Durations ("11 mos") ---------- */
  function monthsBetween(start, end) {
    var p = start.split('-');
    return (end.getFullYear() - +p[0]) * 12 + (end.getMonth() + 1 - +p[1]) + 1;
  }
  function fmtDuration(m) {
    var y = Math.floor(m / 12), r = m % 12, out = [];
    if (y) out.push(y + (y === 1 ? ' yr' : ' yrs'));
    if (r) out.push(r + (r === 1 ? ' mo' : ' mos'));
    return out.join(' ') || '1 mo';
  }
  $all('.js-duration').forEach(function (el) { el.textContent = fmtDuration(monthsBetween(el.dataset.start, new Date())); });
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Repositories ---------- */
  var LANG_COLORS = {
    'C++': '#f34b7d', TypeScript: '#3178c6', JavaScript: '#f1e05a', Python: '#3572A5', Swift: '#F05138',
    Go: '#00ADD8', Rust: '#dea584', HTML: '#e34c26', CSS: '#563d7c', 'C#': '#178600', TeX: '#3D6117',
    EJS: '#a91e50', Shell: '#89e051', C: '#555555', Java: '#b07219'
  };
  var repos = (window.REPOS || []).slice();
  var grid = $('#repo-grid'), search = $('#repo-search'), langSel = $('#repo-lang'),
      sortSel = $('#repo-sort'), forksChk = $('#repo-forks'), countEl = $('#repo-count');

  function fillLanguages() {
    var seen = {};
    repos.forEach(function (r) { if (r.language) seen[r.language] = (seen[r.language] || 0) + 1; });
    var current = langSel.value;
    langSel.innerHTML = '<option value="">All languages</option>' + Object.keys(seen)
      .sort(function (a, b) { return seen[b] - seen[a] || a.localeCompare(b); })
      .map(function (l) { return '<option value="' + esc(l) + '">' + esc(l) + ' (' + seen[l] + ')</option>'; }).join('');
    langSel.value = current;
  }

  function relTime(iso) {
    var d = new Date(iso), diff = (Date.now() - d.getTime()) / 864e5;
    if (diff < 1) return 'today';
    if (diff < 30) return Math.round(diff) + 'd ago';
    if (diff < 365) return Math.round(diff / 30) + 'mo ago';
    var y = Math.round(diff / 365);
    return y + 'y ago';
  }

  function renderRepos() {
    var q = search.value.trim().toLowerCase(), lang = langSel.value, forks = forksChk.checked, sort = sortSel.value;
    var list = repos.filter(function (r) {
      if (!forks && r.fork) return false;
      if (lang && r.language !== lang) return false;
      if (!q) return true;
      return (r.name + ' ' + (r.description || '') + ' ' + (r.topics || []).join(' ')).toLowerCase().indexOf(q) !== -1;
    });
    list.sort(function (a, b) {
      if (sort === 'name') return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      if (sort === 'pushed') return b.pushed.localeCompare(a.pushed);
      return b.stars - a.stars || b.forks - a.forks || b.pushed.localeCompare(a.pushed);
    });
    var total = repos.filter(function (r) { return forks || !r.fork; }).length;
    countEl.textContent = 'Showing ' + list.length + ' of ' + total + ' repositories';
    if (!list.length) { grid.innerHTML = '<p class="meta">No repositories match.</p>'; return; }
    grid.innerHTML = list.map(function (r) {
      var meta = [];
      if (r.language) meta.push('<span><i class="lang-dot" style="--c:' + (LANG_COLORS[r.language] || '') + '"></i>' + esc(r.language) + '</span>');
      if (r.stars) meta.push('<span title="Stars">★ ' + r.stars + '</span>');
      if (r.forks) meta.push('<span title="Forks">⑂ ' + r.forks + '</span>');
      meta.push('<span title="Last push ' + esc(r.pushed) + '">' + relTime(r.pushed) + '</span>');
      if (r.homepage && /^https?:\/\//.test(r.homepage)) meta.push('<a href="' + esc(r.homepage) + '" target="_blank" rel="noopener">site ↗</a>');
      return '<article class="card repo">' +
        '<div><a class="repo__name" href="' + esc(r.url) + '" target="_blank" rel="noopener">' + esc(r.name) + '</a>' +
        (r.fork ? '<span class="repo__fork">fork</span>' : '') + (r.archived ? '<span class="repo__fork">archived</span>' : '') + '</div>' +
        '<p class="repo__desc">' + (r.description ? esc(r.description) : '<em>No description.</em>') + '</p>' +
        '<div class="repo__meta">' + meta.join('') + '</div></article>';
    }).join('');
  }

  [search, langSel, sortSel, forksChk].forEach(function (el) { el.addEventListener('input', renderRepos); });
  fillLanguages();
  renderRepos();

  // Refresh with live data (unauthenticated GitHub API: 60 req/hr per visitor, plenty here).
  getJSON('https://api.github.com/users/' + GH_USER + '/repos?per_page=100&type=owner&sort=pushed')
    .then(function (live) {
      var fresh = live.filter(function (r) { return !r.private && r.name !== GH_USER && r.name.toLowerCase() !== (GH_USER + '.github.io').toLowerCase(); })
        .map(function (r) {
          return { name: r.name, url: r.html_url, description: r.description, language: r.language, stars: r.stargazers_count,
            forks: r.forks_count, fork: r.fork, homepage: r.homepage || '', topics: r.topics || [],
            pushed: (r.pushed_at || '').slice(0, 10), archived: r.archived };
        });
      if (!fresh.length) return;
      repos = fresh;
      fillLanguages();
      renderRepos();
      var byName = {};
      fresh.forEach(function (r) { byName[r.name] = r; });
      $all('.star[data-repo]').forEach(function (el) { var r = byName[el.dataset.repo]; if (r) el.textContent = '★ ' + r.stars; });
    })
    .catch(function () { /* keep the baked-in snapshot */ });

  getJSON('https://api.github.com/users/' + GH_USER).then(function (u) {
    var f = $('[data-gh="followers"]'), p = $('[data-gh="repos"]');
    if (f && u.followers != null) f.textContent = u.followers.toLocaleString();
    if (p && u.public_repos != null) p.textContent = u.public_repos;
  }).catch(function () {});

  /* ---------- Codeforces ---------- */
  getJSON('https://codeforces.com/api/user.info?handles=' + CF_HANDLES.join(';')).then(function (res) {
    if (res.status !== 'OK') return;
    res.result.forEach(function (u) {
      var li = $('#cf-list li[data-handle="' + u.handle + '"]');
      if (!li) return;
      li.dataset.rank = u.rank || '';
      $('.cf__rank', li).textContent = (u.rank || 'unrated') + (u.maxRank && u.maxRank !== u.rank ? ' · max ' + u.maxRank : '');
      $('.cf__rating', li).innerHTML = (u.rating || '—') + ' <small>max ' + (u.maxRating || '—') + '</small>';
    });
  }).catch(function () {});
  // Static fallback colors until (or if) the API answers
  $all('#cf-list li').forEach(function (li) {
    if (!li.dataset.rank) li.dataset.rank = $('.cf__rank', li).textContent.toLowerCase();
  });

  /* ---------- dev.to (keeps list current as new posts land) ---------- */
  getJSON('https://dev.to/api/articles?username=hamzahassanain0&per_page=30').then(function (posts) {
    if (!posts || !posts.length) return;
    $('#posts').innerHTML = posts.map(function (p) {
      return '<li><a href="' + esc(p.url) + '" target="_blank" rel="noopener">' + esc(p.title) + '</a>' +
        '<span class="meta mono">' + esc((p.published_at || '').slice(0, 10)) + ' · ' + (p.reading_time_minutes || 1) + ' min</span></li>';
    }).join('');
  }).catch(function () {});
})();
