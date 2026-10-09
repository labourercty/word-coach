/* game.js — catalog, the game loop, rewards, missions, badges, daily calendar */
(function (G) {
  'use strict';
  var WC = G.WC, S = WC.S, C = WC.C, A = WC.ads, CF = G.WC_CONFIG, $ = WC.$, el = WC.el, rich = WC.rich, rh = WC.rh, sfx = WC.audio.sfx;
  var g = WC.g = {};
  var DN = ['Easy', 'Medium', 'Legend'], HP = [3, 2, 1], TT = [12, 9, 6], MAXL = CF.game.maxLevel, SPE = CF.game.specialEvery;
  g.DN = DN; g.MAXL = MAXL; g.SPE = SPE;
  var ri = function (n) { return Math.floor(WC.rand() * n); }, pk = function (a) { return a[ri(a.length)]; };
  var run = null, lastMode = null;
  g.run = function () { return run; };

  /* ---------- catalog: themes, mascot skins, power-ups, specials ---------- */
  var mo = new Date().getMonth();
  g.TH = [['default', 'Classic', 0, 0, '#6d5efc', '#ff5fa2'], ['candy', 'Candy', 150, 1, '#ff5fa2', '#ffb86b'], ['mint', 'Mint', 250, 1, '#10b981', '#06b6d4'],
    ['neon', 'Neon', 400, 2, '#22d3ee', '#a855f7'], ['sunset', 'Sunset', 600, 3, '#f97316', '#ef4444'],
    mo >= 2 && mo <= 4 ? ['season', 'Spring (Season)', 300, 2, '#f472b6', '#84cc16'] : mo >= 5 && mo <= 7 ? ['season', 'Summer (Season)', 300, 2, '#f59e0b', '#06b6d4'] :
      mo >= 8 && mo <= 10 ? ['season', 'Autumn (Season)', 300, 2, '#ea580c', '#ca8a04'] : ['season', 'Winter (Season)', 300, 2, '#38bdf8', '#818cf8']];
  g.SK = [['default', 'Buddy', 0, 0, null, 0], ['kit', 'Kitty', 10, 1, '#f59e0b', 1], ['pup', 'Puppy', 10, 1, '#a16207', 7], ['fox', 'Foxy', 15, 1, '#ea580c', 1], ['pan', 'Panda', 15, 1, '#64748b', 4],
    ['bot', 'Robo', 25, 1, '#0ea5e9', 8], ['owl', 'Wise Owl', 20, 1, '#8b5cf6', 3], ['uni', 'Unicorn', 30, 2, '#ec4899', 5], ['rok', 'Star Pilot', 40, 2, '#14b8a6', 9], ['dra', 'Dragon', 50, 3, '#16a34a', 6], ['king', 'Word King', 80, 5, '#eab308', 2]];
  g.PU = [['freeze', '⏱', '+5 seconds', 40], ['shield', '🛡', 'Saves a heart', 120], ['skip', '⏭', 'Skip a question', 60], ['x2', '✖2', '2× next 3 answers', 80]];
  var ADJ = 'Golden Emerald Crimson Azure Velvet Solar Lunar Frosty Blazing Mystic Royal Neon Cosmic Silent Radiant Stormy Jade Amber Coral Ivory Shadow Crystal Thunder Wild Noble Swift Gleaming Ancient Electric Lucky Hidden'.split(' ');
  var NOUN = 'Falcon Tiger Comet Phoenix Wolf Scholar Dragon Knight Owl Lion Sparrow Panther Titan Wizard Raven Orca Eagle Fox Sphinx Pegasus Cobra Griffin Hydra Yeti Samurai Nomad Oracle Voyager Lynx Kraken'.split(' ');
  g.nSpecials = Math.floor(MAXL / SPE);
  g.special = function (d, k) {
    var h = (k * 47 + d * 130) % 360;
    return { id: 'sp:' + d + ':' + k, d: d, k: k, lvl: k * SPE, name: ADJ[(k - 1) % 30] + ' ' + NOUN[(Math.floor((k - 1) / 30) + d * 8) % 30],
      c1: 'hsl(' + h + ',85%,55%)', c2: 'hsl(' + ((h + 50) % 360) + ',85%,60%)', skin: { c: 'hsl(' + h + ',70%,52%)', a: 1 + (k % 9) } };
  };
  function parseSp(id) { var p = id.split(':'); return p[0] === 'sp' ? g.special(+p[1], +p[2]) : null; }
  g.owns = function (kind, id) {
    var s = parseSp(id); if (s) return S.bl[s.d] >= s.lvl;
    return S.own.indexOf(kind + ':' + id) >= 0;
  };
  g.themeOf = function (id) {
    var s = parseSp(id); if (s) return [id, s.name, 0, 0, s.c1, s.c2];
    return g.TH.filter(function (t) { return t[0] === id; })[0] || g.TH[0];
  };
  g.skinOf = function (id) {
    var s = parseSp(id); if (s) return [id, s.name, 0, 0, s.skin.c, s.skin.a];
    return g.SK.filter(function (t) { return t[0] === id; })[0] || g.SK[0];
  };
  g.applyTheme = function () {
    if (!g.owns('t', S.th)) S.th = 'default';
    var t = g.themeOf(S.th), r = document.documentElement.style;
    r.setProperty('--acc', t[4]); r.setProperty('--acc2', t[5]);
  };
  g.applyMode = function () {
    var t = S.set.theme; if (t === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t);
  };
  var ACC = {
    1: '<path d="M10 20L12 4l12 10zM46 20L44 4 32 14z" fill="COL" stroke="#0005" stroke-width="1.5"/>',
    2: '<path d="M16 12l4-9 8 6 8-6 4 9z" fill="#ffd54a" stroke="#7a5a00" stroke-width="1.5"/>',
    3: '<path d="M16 14h24l-3-11H19z" fill="#334155"/><rect x="11" y="13" width="34" height="4" rx="2" fill="#1e293b"/>',
    4: '<rect x="10" y="17" width="16" height="12" rx="5" fill="none" stroke="#111" stroke-width="2"/><rect x="30" y="17" width="16" height="12" rx="5" fill="none" stroke="#111" stroke-width="2"/><path d="M26 22h4" stroke="#111" stroke-width="2"/>',
    5: '<polygon points="28,0 31,7 38,7 32,11 34,18 28,14 22,18 24,11 18,7 25,7" fill="#ffd54a" stroke="#7a5a00" stroke-width="1"/>',
    6: '<path d="M12 12Q4 2 17 6zM44 12Q52 2 39 6z" fill="#fff" stroke="#0005" stroke-width="1.5"/>',
    7: '<path d="M28 8l-10-6v11zM28 8l10-6v11z" fill="#ff5fa2" stroke="#0004"/><circle cx="28" cy="8" r="3" fill="#e11d48"/>',
    8: '<path d="M28 4V-1" stroke="#555" stroke-width="2"/><circle cx="28" cy="1" r="3" fill="#ef4444"/>',
    9: '<ellipse cx="28" cy="3" rx="12" ry="3.5" fill="none" stroke="#ffd54a" stroke-width="2.5"/>'
  };
  g.mascot = function (id, live, size) {
    var s = g.skinOf(id), col = s[4] || 'var(--acc)';
    return '<svg viewBox="0 -4 56 60" width="' + (size || 56) + '" height="' + (size || 56) + '"' + (live ? ' id="mas"' : '') + ' aria-hidden="true">' + (ACC[s[5]] || '').replace('COL', col) +
      '<circle cx="28" cy="28" r="25" fill="' + col + '" stroke="#0004" stroke-width="2"/><circle cx="19" cy="23" r="6" fill="#fff"/><circle cx="37" cy="23" r="6" fill="#fff"/><circle cx="19" cy="23" r="3" fill="#1d2433"/><circle cx="37" cy="23" r="3" fill="#1d2433"/>' +
      '<path' + (live ? ' id="mou"' : '') + ' d="M18 38q10 4 20 0" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>';
  };
  var MAS = { idle: 'M18 38q10 4 20 0', happy: 'M16 34q12 14 24 0', sad: 'M18 44q10-10 20 0', wow: 'M22 36q6 12 12 0' };
  function mas(st) { var a = $('mas'), m = $('mou'); if (!a || !m) return; m.setAttribute('d', MAS[st] || MAS.idle); a.style.transform = st === 'happy' || st === 'wow' ? 'scale(1.15)' : ''; setTimeout(function () { if ($('mas') === a) { a.style.transform = ''; if (m) m.setAttribute('d', MAS.idle); } }, 900); }
  g.drawMascot = function () { var b = $('masBox'); if (b) b.innerHTML = g.mascot(S.skin, true, 56); };

  /* ---------- small helpers ---------- */
  var wkend = function () { var d = new Date().getDay(); return d === 0 || d === 6; };
  var zone = function (l) { return Math.floor((l - 1) / 20) % 8; };
  var ZN = ['Sunny Meadow', 'Deep Ocean', 'Firefly Forest', 'Volcano Sunset', 'Galaxy', 'Desert Dunes', 'Candy Land', 'Aurora Night'];
  g.wallet = function () { var t = '🪙 ' + S.co + '   💎 ' + S.di + '   ♦️ ' + S.rd; ['wal', 'shopWal'].forEach(function (i) { if ($(i)) $(i).innerHTML = rich(t); }); };
  g.give = function (co, di, rd) { S.co += co || 0; S.di += di || 0; S.rd += rd || 0; g.wallet(); WC.save(); };
  function show(id) { ['home', 'game', 'over'].forEach(function (x) { $(x).hidden = x !== id; }); window.scrollTo(0, 0); A.render(); }
  g.show = show;
  function setZone(l) { Array.prototype.forEach.call(document.querySelectorAll('.z'), function (z, i) { z.classList.toggle('on', i === zone(l)); }); }
  g.setDiff = function (d) { S.diff = d; WC.save(); };

  /* ---------- daily streak, missions, rank ---------- */
  g.touchStreak = function () {
    var t = WC.dnum(), k = S.sk; if (k.d === t) return;
    k.n = (t - k.d === 1) ? k.n + 1 : 1; k.d = t;
    var co = Math.min(10 * k.n, 300); S.co += co;
    setTimeout(function () { WC.say('🔥 ' + k.n + '-day streak! +🪙' + co); }, 600);
  };
  var MSN = [['cor', 10, 'Answer {n} questions correctly'], ['streak', 3, 'Reach a {n} streak'], ['modes', 1, 'Play {n} game(s)'], ['cor', 25, 'Answer {n} questions correctly'], ['score', 200, 'Score {n} points in one run'],
    ['streak', 6, 'Reach a {n} streak'], ['modes', 3, 'Play {n} game(s)'], ['cor', 40, 'Answer {n} questions correctly'], ['score', 450, 'Score {n} points in one run'], ['daily', 1, 'Finish the Daily Challenge'], ['boss', 1, 'Defeat a boss']];
  var DAYS = 9000;
  g.DAYS = DAYS;
  g.dayNow = function () { return Math.max(1, Math.min(DAYS, WC.dnum() - S.inst + 1)); };
  g.qGet = function () {
    var t = WC.dnum();
    if (!S.ms || S.ms.d !== t) {
      var n = g.dayNow(), k = [5, 6, 4][(n - 1) % 3], r = WC.rng(WC.hash('ms' + n + S.seed)), ids = MSN.map(function (x, i) { return i; }).sort(function () { return r() - .5; }).slice(0, k).sort(function (x, y) { return x - y; });
      S.ms = { d: t, n: n, l: ids, pr: 0, c: 0, b: 0, t: 0 };
    }
    return S.ms;
  };
  g.misn = function (d, i) {
    var t = MSN[d.l[i]], f = 1 + Math.min(1.5, d.n / 1500), n = t[0] === 'daily' || t[0] === 'boss' ? t[1] : Math.ceil(t[1] * f);
    return { m: t[0], n: n, txt: t[2].replace('{n}', n), co: 40 + i * 15 + Math.min(Math.floor(d.n / 20), 100), di: (i % 2 === 1 ? 1 : 0) + (i === d.l.length - 1 ? 1 : 0) };
  };
  function qAdd(m, v, mx) {
    var d = g.qGet(); if (d.c >= d.l.length) return;
    var x = g.misn(d, d.c); if (x.m !== m) return;
    d.pr = mx ? Math.max(d.pr, v) : d.pr + v;
    if (d.pr >= x.n && !d.t) { d.t = 1; setTimeout(function () { WC.say('Mission complete! Collect it in Goals'); }, 700); }
  }
  g.qAdd = qAdd;
  g.claimMis = function () {
    var d = g.qGet(); if (d.c >= d.l.length) return false;
    var x = g.misn(d, d.c); if (d.pr < x.n) return false;
    g.give(x.co, x.di); d.c++; d.pr = 0; d.t = 0; WC.save(); sfx.coin(); WC.burst(['🪙', '💎']); WC.say('Mission done! +🪙' + x.co + (x.di ? ' +💎' + x.di : '')); return true;
  };
  g.RK = [['Rookie', 0], ['Learner', 200], ['Scholar', 600], ['Expert', 1500], ['Master', 3500], ['Grandmaster', 8000], ['Legend', 20000], ['Mythic', 60000]];
  g.rkOf = function () { var i = 0; g.RK.forEach(function (r, j) { if (S.xp >= r[1]) i = j; }); return i; };
  var ACH = [['First steps', 'Answer 10 correctly', function (s) { return s.stat.cor >= 10; }], ['Scholar', 'Answer 100 correctly', function (s) { return s.stat.cor >= 100; }], ['Word master', 'Answer 1,000 correctly', function (s) { return s.stat.cor >= 1000; }],
    ['On fire', '10 in a row', function (s) { return s.stat.best >= 10; }], ['Unstoppable', '25 in a row', function (s) { return s.stat.best >= 25; }], ['Boss slayer', 'Defeat a boss', function (s) { return s.stat.boss >= 1; }],
    ['Explorer', 'Play 10 modes', function (s) { return Object.keys(s.stat.modes).length >= 10; }], ['Adventurer', 'Play 50 modes', function (s) { return Object.keys(s.stat.modes).length >= 50; }],
    ['Collector', 'Own 8 items', function (s) { return s.own.length >= 8; }], ['Special', 'Reach level ' + SPE + ' and unlock a special item', function (s) { return Math.max.apply(null, s.bl) >= SPE; }],
    ['Bookworm', 'Learn 50 words', function (s) { return Object.keys(s.learn).length >= 50; }], ['Top score', 'Score 1,000 in one run', function (s) { return (s.best || 0) >= 1000; }]];
  g.ACH = ACH;
  g.checkAch = function () {
    ACH.forEach(function (a) { if (!S.ach[a[0]] && a[2](S)) { S.ach[a[0]] = 1; S.di++; setTimeout(function () { WC.say(a[0] + ' unlocked! +💎1'); }, 1500); } });
  };

  /* ---------- perfect-streak badges ---------- */
  var BT = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster'];
  var BS = [[500, 600, 700, 800, 900], [1000, 1100, 1200, 1300, 1400], [1500, 1600, 1700, 1800, 1900], [2000, 2200, 2400, 2600, 2800], [3000, 3300, 3600, 3900, 4200], [4500, 5000, 5500, 6000, 6500], [7000, 8000, 9000, 10000, 12000]];
  var BD = []; BS.forEach(function (row, t) { row.forEach(function (n, l) { BD.push({ t: t, l: l + 1, n: n, name: BT[t] + ' ' + (l + 1) }); }); });
  g.BT = BT; g.BS = BS; g.BD = BD;
  g.medal = function (i, sz) {
    var b = BD[i], w = sz || 64, gr = 'url(#gT' + b.t + ')', crown = b.t >= 6 ? '<path d="M21 6l5 7 6-9 6 9 5-7-2 11H23z" fill="#ffd54a" stroke="#7a5a00" stroke-width="1.2"/>' : '';
    return '<svg viewBox="0 0 64 84" width="' + w + '" height="' + Math.round(w * 84 / 64) + '" class="md"><path d="M18 52L10 82l14-6 8 8 8-8 14 6-8-30z" fill="' + (b.t >= 4 ? '#7c3aed' : '#c0392b') + '" stroke="#0004"/><circle cx="32" cy="32" r="29" fill="' + gr + '" stroke="#0006" stroke-width="1.5"/><circle cx="32" cy="32" r="23" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2"/><circle cx="32" cy="32" r="20" fill="' + gr + '"/><circle cx="32" cy="32" r="20" fill="#000" fill-opacity=".18"/><path d="M12 24a22 22 0 0 1 14-12" stroke="#fff" stroke-opacity=".7" stroke-width="3.5" fill="none" stroke-linecap="round"/><text x="32" y="42" font-size="26" font-weight="800" text-anchor="middle" fill="#fff" stroke="#0007" stroke-width="1" font-family="sans-serif">' + b.l + '</text>' + crown + '</svg>';
  };
  function perfOk() {
    S.ps++; S.pb = Math.max(S.pb, S.ps);
    while (S.bd < BD.length && S.ps >= BD[S.bd].n) {
      var i = S.bd, b = BD[i], di = 2 + b.t * 2, co = 100 * (i + 1);
      S.bd++; S.di += di; S.co += co; WC.save();
      (function (i, di, co) {
        setTimeout(function () {
          var d = el('div', 'bdpop'); d.innerHTML = g.medal(i, 84) + '<div>New badge: ' + BD[i].name + '</div>'; document.body.appendChild(d); setTimeout(function () { d.remove(); }, 2700);
          sfx.lvl(); WC.say('+🪙' + co + ' +💎' + di);
        }, 600);
      })(i, di, co);
    }
  }

  /* ---------- daily calendar: 9000 days counted from install ---------- */
  g.dayRew = function (n) {
    var co = 50 + ((n * 7) % 9) * 20 + Math.min(Math.floor(n / 15), 150), di = n % 5 === 0 ? 1 : 0, rd = 0;
    if (n === 7) rd += 1; if (n % 30 === 0) { di += 2; rd += 1; } if (n % 100 === 0) { co += 300; di += 5; rd += 2; } if (n % 365 === 0) { co += 1000; di += 20; rd += 5; }
    if (n === DAYS) { co = 5000; di = 100; rd = 50; }
    return [co, di, rd];
  };
  g.has1 = function (n) { return S.cl.charAt(n - 1) === '1'; };
  g.avail = function () { var c = 0, cur = g.dayNow(); for (var n = 1; n <= cur; n++) if (!g.has1(n)) c++; return c; };
  g.fmtR = function (r) { return '🪙' + r[0] + (r[1] ? ' 💎' + r[1] : '') + (r[2] ? ' ♦️' + r[2] : ''); };
  function mark(list) { var a = S.cl.split(''); list.forEach(function (n) { a[n - 1] = '1'; }); S.cl = a.join(''); }
  g.claimDay = function (n) {
    if (n > g.dayNow() || g.has1(n)) return false;
    var r = g.dayRew(n); mark([n]); g.give(r[0], r[1], r[2]); sfx.lvl(); WC.burst(['🎁', '🪙', '💎']); WC.say('Day ' + n + ': +' + g.fmtR(r)); return true;
  };
  g.claimAll = function () {
    var cur = g.dayNow(), l = [], c = 0, d = 0, r = 0;
    for (var i = 1; i <= cur; i++) if (!g.has1(i)) { var x = g.dayRew(i); c += x[0]; d += x[1]; r += x[2]; l.push(i); }
    if (!l.length) return false;
    mark(l); g.give(c, d, r); sfx.lvl(); WC.burst(['🎁', '🪙', '💎']); WC.say(l.length + ' day' + (l.length > 1 ? 's' : '') + ' collected! +' + g.fmtR([c, d, r])); return true;
  };

  /* ---------- the question loop ---------- */
  var mult = function () { return 1 + Math.min(4, Math.floor(run.streak / 3)); };
  function hud() {
    $('lvl').textContent = run.md ? run.md.name.slice(0, 13) : run.boss ? '👹 Boss' : 'Lv ' + run.lvl;
    $('score').textContent = run.daily ? run.cor + ' ✓' : run.score;
    $('hearts').textContent = run.daily ? run.i + '/' + run.daily.length : '❤️'.repeat(Math.max(0, run.lives)) + '🖤'.repeat(Math.max(0, run.max - run.lives));
    $('prog').style.width = (run.daily ? run.i * 100 / run.daily.length : run.boss ? (5 - run.boss) * 20 : run.lp * 20) + '%';
    $('hudCard').classList.toggle('boss', !!run.boss);
    $('streak').textContent = 'Streak ' + run.streak; $('mult').textContent = '×' + mult() + (run.x2 > 0 ? ' ✖2' : '') + (run.shield ? ' 🛡' : '');
    $('qn').textContent = run.md && run.md.T ? '⏳' + Math.ceil(run.tot) + 's' : 'Q' + run.n;
  }
  function updPU() {
    var box = $('pus'); box.innerHTML = '';
    g.PU.forEach(function (p) { var b = el('button', '', p[1] + ' ×' + S.pu[p[0]]); b.disabled = S.pu[p[0]] < 1; b.onclick = function () { usePU(p[0]); }; box.appendChild(b); });
  }
  function nextQ() {
    var q;
    if (run.daily) q = run.daily[run.i++];
    else if (run.md) q = C.modeQ(run.md, run.n, run.base);
    else q = C.classic(run.lvl, S.diff, !!run.boss);
    run.n++; run.busy = false; run.cur = q;
    var md = run.md, L = run.lvl, base = md && md.t ? md.t : md && md.T ? 15 : run.daily ? 10 : Math.max(TT[S.diff] * .5, TT[S.diff] - Math.floor(L / 10));
    var len = q.q.length; run.tm = run.tl = (run.boss ? base * .75 : base) + (len > 100 ? 12 : len > 60 ? 6 : 0) + (q.mem ? 2.5 : 0);
    $('tag').textContent = (run.boss ? '👹 BOSS · ' : '') + q.tag;
    var qe = $('q'); qe.style.fontSize = len > 50 && !q.svg ? '18px' : '';
    if (q.svg) qe.innerHTML = q.q; else qe.textContent = q.q;
    var ob = $('opts'); ob.innerHTML = ''; ob.hidden = false;
    var o = q.o.slice(); if (q.o.length > 2 || q.o[0] !== 'True' && q.o[0] !== 'Yes') o.sort(function () { return WC.rand() - .5; });
    o.forEach(function (t) {
      var b = el('button'); b._k = t; if (q.big) b.style.fontSize = '34px'; b.textContent = t; b.onclick = function () { answer(b, t === q.c, q.c); }; ob.appendChild(b);
    });
    $('msg').textContent = ''; hud(); updPU();
    if (q.mem) {
      var me = run; run.busy = true; ob.hidden = true;
      setTimeout(function () { if (run !== me || me.quit) return; $('q').textContent = '❓ Which word was it?'; ob.hidden = false; me.busy = false; }, 2200);
    }
  }
  setInterval(function () {
    if (!run || run.busy || run.pause || run.quit || document.hidden || $('game').hidden) return;
    if (run.md && run.md.T) { run.tot -= .1; if (Math.abs(run.tot - Math.round(run.tot)) < .05) $('qn').textContent = '⏳' + Math.max(0, Math.ceil(run.tot)) + 's'; if (run.tot <= 0) { endRun(); return; } }
    run.tl -= .1; var f = $('tfill'); f.style.width = Math.max(0, run.tl / run.tm * 100) + '%'; f.classList.toggle('low', run.tl < 3);
    if (run.tl <= 3 && run.tl > 0 && Math.abs(run.tl - Math.round(run.tl)) < .05) { sfx.beat(); WC.vib(12); }
    if (run.tl <= 0) answer(null, false, run.cur.c);
  }, 100);
  function answer(btn, good, c) {
    if (!run || run.busy) return; run.busy = true; A.count();
    Array.prototype.forEach.call($('opts').children, function (b) { if (b._k === c) b.classList.add('ok'); });
    if (good) {
      S.stat.cor++; S.xp += 10; qAdd('cor', 1); perfOk();
      var wi = run.cur.wi; if (wi) { S.learn[wi] = 1; S.miss = S.miss.filter(function (x) { return x !== wi; }); }
      run.ok++; run.streak++; run.cor++; S.stat.best = Math.max(S.stat.best, run.streak); qAdd('streak', run.streak, 1); run.best = Math.max(run.best, run.streak);
      var m = mult(), pts = (10 + Math.round(5 * run.tl / run.tm)) * m * (run.x2 > 0 ? 2 : 1) * (run.boss ? 2 : 1) * (run.md && run.md.x || 1);
      if (run.x2 > 0) run.x2--; run.score += pts; S.co += m * (wkend() ? 2 : 1);
      sfx.ok(); WC.vib(20); $('msg').textContent = 'Correct! +' + pts; mas('happy');
      if (run.streak >= 3) { WC.anim($('combo'), run.streak + ' COMBO! ×' + m); sfx.combo(Math.floor(run.streak / 3) + 1); WC.burst(['🔥', '⭐', '✨'], run.streak % 5 === 0 ? 26 : 14); if (run.streak % 5 === 0) { WC.flash(); mas('wow'); } }
      if (!run.daily && !run.md) { if (run.boss) { run.boss--; if (!run.boss) bossWin(); } else if (++run.lp >= 5) { run.lp = 0; levelUp(); } }
    } else {
      if (btn) btn.classList.add('bad'); run.streak = 0; S.ps = 0; sfx.bad(); WC.vib([60, 40, 60]); mas('sad');
      var w = run.cur.wi; if (w) S.miss = [w].concat(S.miss.filter(function (x) { return x !== w; })).slice(0, 40);
      if (run.shield) { run.shield = false; $('msg').textContent = '🛡 Shield saved your heart!'; }
      else { if (!run.daily) run.lives--; $('msg').textContent = btn ? 'Oops!' : '⏰ Time\'s up!'; }
    }
    hud(); WC.saveSoon();
    var me = run; setTimeout(function () { if (run !== me || me.quit) return; adv(); }, good ? 850 : 1300);
  }
  function adv() {
    var done = run.daily ? run.i >= run.daily.length : run.md && run.md.n && run.n >= run.md.n;
    if (done || (!run.daily && run.lives <= 0)) { endRun(); return; }
    if (A.due()) { var me = run; me.pause = true; A.popup(function () { me.pause = false; if (run === me && !me.quit) nextQ(); }); }
    else nextQ();
  }
  function endRun() { if (run.md) modeEnd(); else if (run.daily) dailyEnd(); else over(); }
  function levelUp() {
    var oz = zone(run.lvl); if (run.lvl < MAXL) run.lvl++;
    setTimeout(function () { sfx.lvl(); WC.say('⬆️ LEVEL ' + run.lvl); WC.burst(['🎉', '🌟']); }, 250);
    if (run.lvl % 5 === 0) S.di++;
    if (zone(run.lvl) !== oz) { setZone(run.lvl); setTimeout(function () { WC.say('🌍 ' + ZN[zone(run.lvl)]); }, 1300); }
    if (run.lvl % SPE === 0 && run.lvl / SPE <= g.nSpecials) unlockSpecial(run.lvl / SPE);
    if (run.lvl % 10 === 0) { run.boss = 5; setTimeout(function () { WC.say('👹 BOSS LEVEL! Land 5 hits'); }, 1300); }
    S.bl[S.diff] = Math.max(S.bl[S.diff], run.lvl); WC.save();
  }
  function unlockSpecial(k) {
    var sp = g.special(S.diff, k), red = k % 10 === 0 ? 1 : 0;
    S.di += 2; S.rd += red; WC.save();
    setTimeout(function () { WC.say('🔓 ' + DN[S.diff] + ' Lv ' + sp.lvl + ': ' + sp.name + ' unlocked! +💎2' + (red ? ' +♦️1' : '')); WC.burst(['🔓', '🎁', '✨']); }, 2400);
  }
  function bossWin() {
    S.stat.boss++; qAdd('boss', 1); S.di += 3; S.co += 100; S.pu[g.PU[ri(4)][0]]++; WC.save();
    setTimeout(function () { WC.say('👑 BOSS DEFEATED! +💎3 +🪙100'); sfx.lvl(); WC.burst(['👑', '💎', '🪙']); }, 900);
    levelUp();
  }
  function usePU(k) {
    if (!run || run.busy || S.pu[k] < 1) return; S.pu[k]--; var m = '⚡ Power-up used';
    if (k === 'freeze') { run.tl += 5; run.tm = Math.max(run.tm, run.tl); m = '⏱ +5 seconds'; }
    else if (k === 'shield') { run.shield = true; m = '🛡 Shield ready'; }
    else if (k === 'x2') { run.x2 = 3; m = '✖2 for 3 answers'; }
    else { run.busy = true; m = '⏭ Skipped'; var me = run; setTimeout(function () { if (run !== me || me.quit) return; adv(); }, 350); }
    WC.save(); sfx.ok(); $('msg').textContent = m; hud(); updPU();
  }
  function start(qs, md) {
    WC.audio.init(); WC.audio.musicOn(); g.touchStreak(); qAdd('modes', 1);
    var dl = Array.isArray(qs), lv = md && md.l ? md.l : dl ? 3 : HP[S.diff];
    var plays = md ? (S.stat.modes[md.name] || 0) : 0;
    if (md) S.stat.modes[md.name] = plays + 1;
    run = { lvl: Math.max(1, 1), lp: 0, ok: 0, cor: 0, score: 0, streak: 0, lives: lv, max: lv, n: 0, best: 0, busy: false, rev: false, boss: 0, daily: dl ? qs : null, md: md || null,
      tot: md && md.T || 0, i: 0, x2: 0, shield: false, tl: 1, tm: 1, cur: { c: '' }, base: 1 + Math.min(3, Math.floor(plays / 3)) };
    WC.audio.level = function () { return run ? run.lvl : 1; };
    setZone(1); g.drawMascot(); show('game'); nextQ();
  }
  g.start = function () { start(null, null); };
  function over() {
    sfx.over(); show('over');
    $('fs').textContent = run.score; $('fd').textContent = DN[S.diff] + ' · Level ' + run.lvl + ' · best streak ' + run.best;
    $('revive').hidden = run.rev; $('fst').textContent = '';
    var pb = S.best || 0; $('nudge').textContent = run.score > pb ? 'New personal best!' : (pb - run.score) + ' points from your best. One more round?';
    S.best = Math.max(pb, run.score); qAdd('score', run.score, 1); S.stat.games++;
    if (run.lbRef) S.lb = S.lb.filter(function (e) { return e !== run.lbRef; });
    run.lbRef = { s: run.score, d: S.diff, l: run.lvl, t: Date.now() }; S.lb.push(run.lbRef);
    S.lb.sort(function (a, b) { return b.s - a.s; }); S.lb = S.lb.slice(0, 20);
    g.checkAch(); WC.save();
  }
  g.revive = function () {
    A.rewarded('revive').then(function (ok) {
      if (!ok || !run) return;
      run.rev = true; run.lives = 1; run.busy = false; run.quit = false; run.streak = 0;
      show('game'); sfx.lvl(); WC.say('❤️ Back in the game!'); nextQ();
    });
  };
  g.leave = function () { if (run) { run.quit = true; if (!run.md && !run.daily && run.score > 0) over0(); } run = null; };
  function over0() { S.best = Math.max(S.best || 0, run.score); S.stat.games++; WC.save(); }
  g.quit = function () { if (run) run.quit = true; };
  g.setPause = function (b) { if (run) run.pause = b; };
  g.resume = function () { if (run) run.quit = false; };

  /* daily challenge */
  g.startDaily = function () {
    var t = WC.dstr();
    if (S.ch.d === t && S.ch.s != null) { WC.say('✅ Done today: ' + S.ch.s + '/10'); return; }
    start(C.dailyList('daily' + t), null);
  };
  function dailyEnd() {
    var c = run.cor, d = c >= 8 ? 2 : c >= 5 ? 1 : 0, co = c * 10 * (wkend() ? 2 : 1);
    S.co += co; S.di += d; S.ch.d = WC.dstr(); S.ch.s = c; sfx.lvl(); qAdd('daily', 1); qAdd('score', run.score, 1); g.checkAch(); WC.save(); show('over');
    $('nudge').textContent = ''; $('fs').textContent = c + '/10'; $('fd').textContent = '🔥 Daily Challenge complete'; $('fst').innerHTML = rich('+🪙' + co + (d ? '  +💎' + d : '')); $('revive').hidden = true; WC.burst(['🔥', '🪙', '💎']);
  }

  /* the 100 modes */
  g.lastMode = function () { return lastMode; };
  g.startMode = function (i, code) {
    var c = C.modes[i], today = WC.dstr(), wk = WC.weekId();
    if (c.g[0] === '@') { if (g.spec[c.g]) g.spec[c.g](); return; }
    if (c.s === 1 && S.done[c.name] === today) { WC.say('Done for today! Come back tomorrow'); return; }
    if (c.s === 2 && S.done[c.name] === wk) { WC.say('Once a week. Come back next week'); return; }
    if (c.w === 8) { if (S.lk.d !== today) S.lk = { d: today, n: 0 }; if (S.lk.n >= 3) { WC.say('3 Lucky Words a day. Come back tomorrow!'); return; } }
    g.closeAll(); lastMode = i;
    if (c.s) start(C.seedList(c, c.name + (c.s === 2 ? wk : today)), c); else start(null, c);
  };
  g.startCode = function (code) {
    var cf = { name: 'Code ' + code, g: 'mix:def,mean,syn,ant,spell,miss', n: 10, w: 9, i: 98, sh: -1 };
    g.closeAll(); lastMode = null; start(C.seedList(cf, 'code' + code), cf);
  };
  function modeEnd() {
    var c = run.md, n = c.n || 0, cor = run.cor, co = cor * 3, di = n && cor >= .8 * n ? 1 : 0;
    if (c.w === 1) { co = run.best * 5; di = run.best >= 15 ? 1 : 0; } else if (c.w === 2) { co = cor * 30; di = cor >= 5 ? 1 : 0; } else if (c.w === 3) { co = cor * 4; di = cor >= 8 ? 2 : 0; }
    else if (c.w === 4) { co = cor * 10; di = cor >= 12 ? 5 : 0; } else if (c.w === 5) { co = cor * 15; di = cor >= 16 ? 8 : 0; } else if (c.w === 6) { co = cor * 5; di = Math.floor(cor / 20); }
    else if (c.w === 7) { co = cor ? 30 : 0; di = 0; } else if (c.w === 8) { co = cor ? 50 + ri(251) : 0; di = cor && WC.rand() < .2 ? 1 : 0; S.lk.n++; } else if (c.w === 9) { co = cor; di = 0; }
    if (wkend()) co *= 2;
    S.co += co; S.di += di; qAdd('score', run.score, 1);
    if (c.s) S.done[c.name] = c.s === 2 ? WC.weekId() : WC.dstr();
    S.best = Math.max(S.best || 0, run.score); g.checkAch(); WC.save(); sfx.lvl(); show('over');
    $('nudge').textContent = ''; $('fs').textContent = n ? cor + '/' + n : run.score; $('fd').textContent = c.name + ' · best streak ' + run.best; $('fst').innerHTML = rich('+🪙' + co + (di ? '  +💎' + di : '')); $('revive').hidden = true; WC.burst(['🌟', '🪙', '💎']);
  }
  g.spec = {};

  /* review your missed words */
  g.startReview = function () {
    if (!S.miss.length) { WC.say('No missed words. Nice!'); return false; }
    var list = S.miss.slice(0, 10).map(function (w) { return C.review(w); }).filter(Boolean);
    if (!list.length) { WC.say('No missed words. Nice!'); return false; }
    g.closeAll(); lastMode = null; start(list, { name: 'Review', n: list.length, w: 0, i: 97, sh: -1 }); return true;
  };
  g.again = function () { if (lastMode != null) g.startMode(lastMode); else g.start(); };
  g.zoneName = function (l) { return ZN[zone(l)]; };
  g.endRunNow = function () { if (run) endRun(); };
  g.hud = hud;
  g.closeAll = function () { };   // replaced by ui.js
})(window);
