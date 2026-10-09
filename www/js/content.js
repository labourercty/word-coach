/* content.js — loads the word data and builds every kind of question */
(function (G) {
  'use strict';
  var WC = G.WC, B = WC.BANK, S = WC.S, C = WC.C = {};
  var W = [], SPL = [], XW = [], byPos = {}, ready = false, BK = {}, MEMO = {}, recent = [];

  var ri = function (n) { return Math.floor(WC.rand() * n); };
  var pk = function (a) { return a[ri(a.length)]; };
  var cl = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  function shuf(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = ri(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function uniq(a) { var s = {}, o = []; a.forEach(function (x) { if (!s[x]) { s[x] = 1; o.push(x); } }); return o; }

  /* ---------- loading ---------- */
  C.load = function () {
    return Promise.all([
      fetch('data/words.json').then(function (r) { return r.json(); }),
      fetch('data/spell.json').then(function (r) { return r.json(); })
    ]).then(function (d) {
      W = d[0].w.map(function (r) {
        return { w: r[0], p: r[1], t: r[2], d: r[3], sy: r[4] ? r[4].split(',') : [], an: r[5] ? r[5].split(',') : [], ex: r[6] || '', h: WC.hash(r[0]) % 10 };
      });
      SPL = d[1].p.map(function (r) { return { c: r[0], x: r[1].split(','), t: r[2], h: WC.hash(r[0]) % 10 }; });
      var seen = {};
      W.forEach(function (w) { seen[w.w] = 1; byPos[w.p] = byPos[w.p] || []; byPos[w.p].push(w); });
      XW = W.filter(function (w) { return /^[a-z]{3,12}$/.test(w.w); }).map(function (w) { return { w: w.w, t: w.t, h: w.h }; });
      d[1].x.forEach(function (r) { if (!seen[r[0]] && /^[a-z]{3,12}$/.test(r[0])) XW.push({ w: r[0], t: r[1], h: WC.hash(r[0]) % 10 }); });
      ready = true;
      C.stats = { words: W.length, spell: SPL.length, letters: XW.length };
    });
  };

  /* ---------- picking without repeats ---------- */
  var FN = { syn: function (w) { return w.sy.length > 0; }, ant: function (w) { return w.an.length > 0; }, ex: function (w) { return !!w.ex; }, unl: function (w) { return !S.learn[w.w]; } };
  function bucket(list, tag, sh, t, f) {
    var k = tag + '|' + sh + '|' + t + '|' + f; if (BK[k]) return BK[k];
    var ok = function (w) { return (sh < 0 || w.h === sh) && (!f || FN[f](w)); };
    var a = list.filter(function (w) { return ok(w) && w.t === t; });
    if (a.length < 12) a = list.filter(function (w) { return ok(w) && Math.abs(w.t - t) <= 1; });
    if (a.length < 4) a = list.filter(function (w) { return !f || FN[f](w); });
    return (BK[k] = a);
  }
  function pickFrom(arr, key, ctx) {
    var n = arr.length;
    if (n < 2) return arr[0];
    if (ctx && ctx.seeded) return arr[ri(n)];
    var q = S.qp[key]; if (!q) q = S.qp[key] = { p: 0, e: 0 };
    if (q.p >= n) { q.e++; q.p = 0; }
    var ck = key + '#' + q.e + '#' + n, ord = MEMO[ck];
    if (!ord) {
      var r = WC.rng(WC.hash(S.seed + ck)), a = [], i, j, t;
      for (i = 0; i < n; i++) a.push(i);
      for (i = n - 1; i > 0; i--) { j = Math.floor(r() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; }
      MEMO[ck] = ord = a;
    }
    WC.saveSoon();
    return arr[ord[q.p++]];
  }
  function pickWord(ctx, t, f, list, tag) {
    var arr = bucket(list || W, tag || 'w', ctx.sh, t, f || ''), w, n = 0;
    do { w = pickFrom(arr, ctx.key + '|' + (tag || 'w') + t + (f || ''), ctx); n++; }
    while (!ctx.seeded && recent.indexOf(w.w || w.c) >= 0 && n < 6);
    recent.push(w.w || w.c); if (recent.length > 25) recent.shift();
    return w;
  }
  function pickBank(arr, name, ctx) { return pickFrom(arr, ctx.key + '|b' + name, ctx); }

  /* ---------- answer options ---------- */
  function mk(tag, q, c, pool, k, extra) {
    var o = [c], g = 0, p = pool.filter(function (x) { return x !== c && x != null && x !== ''; });
    p = uniq(p);
    while (o.length < (k || 2) && g++ < 80 && p.length) { var d = pk(p); if (o.indexOf(d) < 0) o.push(d); }
    var r = { tag: tag, q: q, c: c, o: o };
    if (extra) for (var x in extra) r[x] = extra[x];
    return r;
  }
  function vari(w) {
    var n = w.length, v = w, g = 0;
    if (n < 3) return w + w[n - 1];
    while (v === w && g++ < 30) {
      var m = ri(3), i = 1 + ri(Math.max(1, n - 2));
      if (m === 0 && n > 3) v = w.slice(0, i) + w.slice(i + 1);
      else if (m === 1) v = w.slice(0, i) + w[i] + w.slice(i);
      else { var a = w.split(''), j = Math.min(i, n - 2), t = a[j]; a[j] = a[j + 1]; a[j + 1] = t; v = a.join(''); }
    }
    return v;
  }
  // similar-looking wrong words; higher h = harder (closer in length and first letter)
  function near(w, n, h, pred) {
    var pool = (byPos[w.p] || W).filter(function (x) { return x !== w && x.w !== w.w && (!pred || pred(x)); });
    var tp = pool.filter(function (x) { return Math.abs(x.t - w.t) <= 1; }); if (tp.length >= 12) pool = tp;
    var cands = [], i;
    for (i = 0; i < 16 && pool.length; i++) cands.push(pk(pool));
    cands.forEach(function (x) {
      var sim = (x.w.length === w.w.length ? 0.5 : 0.5 - Math.min(0.5, Math.abs(x.w.length - w.w.length) * 0.12)) + (x.w[0] === w.w[0] ? 0.5 : 0) + (Math.abs(x.t - w.t) <= 1 ? 0.2 : 0);
      x._s = WC.rand() * (1 - h) + h * sim;
    });
    cands.sort(function (a, b) { return b._s - a._s; });
    var out = [];
    cands.forEach(function (x) { if (out.length < n && out.indexOf(x) < 0) out.push(x); });
    return out;
  }
  var LT = 'abcdefghijklmnopqrstuvwxyz'.split(''), VW = 'aeiou'.split(''), CS = 'bcdfghjklmnprstvwy'.split('');

  /* ---------- the generators: each returns {tag,q,c,o,...} ---------- */
  var G_ = {};
  G_.def = function (t, k, x) { var w = pickWord(x.ctx, t), d = near(w, k - 1, x.h); return mk('Which word matches?', '“' + w.d + '”', w.w, d.map(function (e) { return e.w; }), k, { wi: w.w }); };
  G_.mean = function (t, k, x) { var w = pickWord(x.ctx, t), d = near(w, k - 1, x.h); return mk('What does it mean?', w.w, w.d, d.map(function (e) { return e.d; }), k, { wi: w.w }); };
  G_['new'] = function (t, k, x) { var w = pickWord(x.ctx, t, 'unl'), d = near(w, k - 1, x.h); return mk('New word! What does it mean?', w.w, w.d, d.map(function (e) { return e.d; }), k, { wi: w.w }); };
  G_.syn = function (t, k, x) {
    var w = pickWord(x.ctx, t, 'syn'), s = pk(w.sy), bad = w.an.concat(w.sy);
    var d = near(w, k + 2, x.h, function (e) { return bad.indexOf(e.w) < 0 && e.sy.indexOf(w.w) < 0; }).map(function (e) { return e.w; });
    if (x.h > 0.4 && w.an.length) d.unshift(pk(w.an));
    return mk('Same meaning as “' + w.w + '”?', w.w.toUpperCase(), s, d, k, { wi: w.w, tagOnly: 1 });
  };
  G_.ant = function (t, k, x) {
    var w = pickWord(x.ctx, t, 'ant'), a = pk(w.an);
    var d = near(w, k + 2, x.h, function (e) { return w.an.indexOf(e.w) < 0; }).map(function (e) { return e.w; });
    if (x.h > 0.4 && w.sy.length) d.unshift(pk(w.sy));
    return mk('Opposite of “' + w.w + '”?', w.w.toUpperCase(), a, d, k, { wi: w.w });
  };
  G_.spell = function (t, k, x) {
    var e = pickWord(x.ctx, t, '', SPL, 'sp'), wr = shuf(e.x), o = [e.c];
    while (o.length < k) o.push(wr.length ? wr.pop() : vari(e.c));
    return { tag: 'Spot the right spelling', q: '✍️ Which is correct?', c: e.c, o: uniq(o), wi: e.c };
  };
  function hideOne(w) { var i = 1 + ri(w.length - 1); return { i: i, s: w.slice(0, i) + '＿' + w.slice(i + 1) }; }
  G_.miss = function (t, k, x) {
    var e = pickWord(x.ctx, t, '', XW, 'lw'), h = hideOne(e.w), c = e.w[h.i], vowel = VW.indexOf(c) >= 0, pool = (vowel ? VW : CS).concat(LT);
    return mk('Find the missing letter', h.s.toUpperCase(), c.toUpperCase(), (vowel ? VW.concat(['y']) : CS).concat(x.h > .6 ? [] : LT).map(function (z) { return z.toUpperCase(); }), k);
  };
  G_.scr = function (t, k, x) {
    var e = pickWord(x.ctx, t, '', XW, 'lw'), s = e.w, g = 0;
    while ((s === e.w) && g++ < 20) s = shuf(e.w.split('')).join('');
    return mk('Unscramble the word', s.toUpperCase(), e.w, [vari(e.w), vari(e.w), vari(e.w)], k);
  };
  G_.build = function (t, k, x) {
    var e = pickWord(x.ctx, t, '', XW, 'lw'), n = e.w.length, i = 1 + ri(Math.max(1, n - 2)), c = e.w.slice(i, i + 2);
    var vs = [vari(e.w), vari(e.w), vari(e.w)].map(function (v) { return v.slice(i, i + 2); });
    return mk('Complete the word', (e.w.slice(0, i) + '＿＿' + e.w.slice(i + 2)).toUpperCase(), c.toUpperCase(), vs.concat(['er', 'ea', 'ou', 'ch', 'th', 'st']).map(function (z) { return z.toUpperCase(); }), k);
  };
  G_.guess = function (t, k, x) {
    var w = pickWord(x.ctx, t), d = near(w, k - 1, x.h);
    return mk('Guess the word', w.d + '  ·  ' + w.w[0].toUpperCase() + '＿'.repeat(w.w.length - 1), w.w, d.map(function (e) { return e.w; }), k, { wi: w.w });
  };
  G_.odd = function (t, k, x) {
    var gs = B.groups, g = pickBank(gs, 'odd', x.ctx), o = pk(gs.filter(function (z) { return z !== g; })), m = shuf(g);
    var show = m.slice(0, 3), c = m[3], d = shuf(o).filter(function (z) { return g.indexOf(z) < 0; });
    return mk('Which word belongs with these?', show.join(' · '), c, d, k);
  };
  G_.mem = function (t, k, x) {
    var w = pickWord(x.ctx, t), d = near(w, k - 1, 0.8);
    return mk('Remember this word!', w.w.toUpperCase(), w.w, d.map(function (e) { return e.w; }), k, { mem: true, wi: w.w });
  };
  G_.chain = function (t, k, x) {
    var w = pickWord(x.ctx, t), l = w.w[w.w.length - 1], pool = W.filter(function (e) { return e.w[0] === l && e.w !== w.w; });
    if (!pool.length) return G_.def(t, k, x);
    var c = pk(pool), d = W.filter(function (e) { return e.w[0] !== l; }).map(function (e) { return e.w; });
    return mk('Word chain: starts with the last letter', w.w.toUpperCase() + ' →', c.w, shuf(d).slice(0, 12), k);
  };
  G_.tf = function (t, k, x) {
    var w = pickWord(x.ctx, t), d = near(w, 1, x.h)[0], good = ri(2) === 0;
    return { tag: 'True or false?', q: '“' + w.w + '” means “' + (good ? w.d : d.d) + '”', c: good ? 'True' : 'False', o: ['True', 'False'], wi: w.w };
  };
  G_.yn = function (t, k, x) {
    var w = pickWord(x.ctx, t, 'syn'), good = ri(2) === 0, o;
    if (good) o = pk(w.sy); else o = w.an.length && ri(2) ? pk(w.an) : near(w, 1, x.h, function (e) { return w.sy.indexOf(e.w) < 0; })[0].w;
    return { tag: 'Yes or no?', q: 'Do “' + w.w + '” and “' + o + '” mean the same?', c: good ? 'Yes' : 'No', o: ['Yes', 'No'], wi: w.w };
  };
  G_.emoji = function (t, k, x) {
    var r = pickBank(B.emoji, 'emoji', x.ctx);
    return mk('What is this?', r[0], r[1], B.emoji.map(function (z) { return z[1]; }), k, { big: false });
  };
  G_.wpic = function (t, k, x) {
    var r = pickBank(B.emoji, 'emoji', x.ctx);
    return mk('Which picture is “' + r[1] + '”?', r[1].toUpperCase(), r[0], B.emoji.map(function (z) { return z[0]; }), k, { big: true });
  };
  function shp(n) { return '<svg viewBox="0 0 40 40" class="shp" fill="var(--acc)" stroke="#0004" stroke-width="1.5">' + B.shapes[n] + '</svg>'; }
  G_.shape = function (t, k, x) {
    var names = Object.keys(B.shapes), n = pickBank(names, 'shape', x.ctx);
    return mk('What shape is this?', shp(n), n, names, k, { svg: true });
  };
  G_.ctx = function (t, k, x) {
    var arr = B.cloze.filter(function (r) { return r.t === t; });
    if (arr.length < 5) arr = B.cloze.filter(function (r) { return Math.abs(r.t - t) <= 1; });
    var r = pickBank(arr, 'cz' + t, x.ctx), pool = B.cloze.map(function (z) { return z.c; });
    return mk('Choose the word that fits', r.s, r.c, [r.w].concat(k > 2 ? pool : []), k);
  };
  G_.mctx = function (t, k, x) {
    var w = pickWord(x.ctx, t, 'ex');
    if (!w.ex) return G_.ctx(t, k, x);
    var d = near(w, k - 1, x.h);
    return mk('What does “' + w.w + '” mean here?', w.ex, w.d, d.map(function (e) { return e.d; }), k, { wi: w.w });
  };
  G_.read = function (t, k, x) {
    var arr = B.reading.filter(function (r) { return r.tier === t; });
    if (arr.length < 4) arr = B.reading.filter(function (r) { return Math.abs(r.tier - t) <= 1; });
    var r = pickBank(arr, 'rd' + t, x.ctx), o = mk('Read, then answer', r.t + '  ❓ ' + r.q, r.c, [r.w], 2);
    if (k > 2) o.o.push(pk(B.reading.map(function (z) { return z.c; }).filter(function (z) { return z !== r.c && z !== r.w; })));
    return o;
  };
  /* grammar */
  function gpair(tag, q, c, w, k, extra) {
    var o = mk(tag, q, c, [w], 2, extra);
    if (k > 2) o.o.push(c.length < 3 ? pk(['me', 'him', 'us', 'at', 'in', 'on', 'to', 'by', 'of', 'we'].filter(function (z) { return z !== c.toLowerCase() && z !== w.toLowerCase(); })) : vari(c));
    return o;
  }
  var GR = {};
  GR.n = function (t, k, x) { var r = pickBank(B.plurals, 'pl', x.ctx); return gpair('Pick the plural', r.s + ' → ?', r.c, r.w, k); };
  GR.a = function (t, k, x) {
    var r = pickBank(B.comps, 'cp', x.ctx);
    return ri(2) ? gpair('Pick the comparative', 'He is ___ than his brother. (' + r.a + ')', r.c, r.w, k) : gpair('Pick the superlative', 'She is the ___ of all. (' + r.a + ')', r.sc, r.c, k);
  };
  GR.v = function (t, k, x) {
    var v = pickBank(B.verbs, 'vb', x.ctx), r = [v.b, v.p, v.pp, v.s, v.o], s = pk(B.subjects), m = ri(3);
    if (m === 0) return gpair('Past tense', pk(B.times) + ' ' + s[0].toLowerCase().replace(/^i$/, 'I').replace(/^(she|he|we|they|you|my|the|our)/, function (z) { return z; }) + ' ___ ' + r[4] + '.', r[1], r[2] !== r[1] ? r[2] : r[0], k);
    if (m === 1) { var sg = B.subjects.filter(function (z) { return z[1] === 's'; }); s = pk(sg); return gpair('Present tense', s[0] + ' ___ ' + r[4] + ' every day.', r[3], r[0], k); }
    return gpair('Perfect tense', s[0] + (s[1] === 's' ? ' has ' : ' have ') + '___ ' + r[4] + '.', r[2], r[1] !== r[2] ? r[1] : r[0], k);
  };
  GR.p = function (t, k, x) { var r = pickBank(B.prons, 'pr', x.ctx); return gpair('Pick the right word', r.s, r.c, r.w, k); };
  GR.h = function (t, k, x) { var r = pickBank(B.homos, 'hm', x.ctx); return gpair('Pick the right word', r.s, r.c, r.w, k); };
  GR.r = function (t, k, x) { var r = pickBank(B.preps, 'pp', x.ctx); return gpair('Pick the preposition', r.s, r.c, r.w, k); };
  GR.s = function (t, k, x) { return GR[pk(['p', 'r', 'h'])](t, k, x); };
  GR.t = GR.v;
  GR.q = function (t, k, x) { return GR[pk(['n', 'v', 'a', 'p', 'r', 'h'])](t, k, x); };
  G_.gram = function (t, k, x, a) {
    if (!a) a = 'q';
    if (a.length > 1) a = pk(a.split(''));
    return GR[a](t, k, x);
  };
  /* math + number words */
  var NUMN = B.numv;
  function numWord(n) { var i = NUMN.indexOf(n); return B.numw[i]; }
  G_.numw = function (t, k, x) {
    var n = pk(NUMN.slice(0, Math.min(NUMN.length, 12 + t * 3)));
    return ri(2) ? mk('Number → word', String(n), numWord(n), NUMN.map(numWord), k) : mk('Word → number', numWord(n).toUpperCase(), String(n), NUMN.map(String), k);
  };
  G_.numspell = function (t, k, x) { var n = pk(NUMN.slice(0, Math.min(NUMN.length, 12 + t * 3))), w = numWord(n); return mk('Spell the number ' + n, '✍️ Which is correct?', w, [vari(w), vari(w), vari(w)], k); };
  G_.mterm = function (t, k, x) {
    var p = pickBank(B.mterms, 'mt', x.ctx), all = B.mterms;
    return ri(2) ? mk('Math term', p[0].toUpperCase(), p[1], all.map(function (z) { return z[1]; }), k) : mk('Which term?', '“' + p[1] + '”', p[0], all.map(function (z) { return z[0]; }), k);
  };
  G_.sym = function (t, k, x) { var p = pickBank(B.symbols, 'sy', x.ctx); return mk('Math symbol', p[0], p[1], B.symbols.map(function (z) { return z[1]; }), k); };
  G_.eq = function (t, k, x) {
    var m = [5, 9, 12, 15, 20, 30][cl(t, 1, 6) - 1], a = 1 + ri(m), b = 1 + ri(m), o = ri(3), hi = Math.max(a, b), lo = Math.min(a, b), c = [a + b, hi - lo, a * b][o];
    return mk('Equation words', 'What is the ' + ['sum', 'difference', 'product'][o] + ' of ' + (o === 1 ? hi + ' and ' + lo : a + ' and ' + b) + '?', String(c), [c + 1, c - 1, c + 2, c - 2, c + 10].filter(function (v) { return v >= 0; }).map(String), k);
  };
  G_.pat = function (t, k, x) {
    var d = 1 + ri(cl(t, 1, 6) + 2), a = 1 + ri(9), c = a + 4 * d;
    return mk('What comes next?', [0, 1, 2, 3].map(function (j) { return a + j * d; }).join(', ') + ', ?', String(c), [c + d, c - d, c + 2 * d, c + 1, c - 1].filter(function (v) { return v !== c; }).map(String), k);
  };
  G_.logic = function (t, k, x) {
    var a = ri(40 * t) + 1, n = shuf([a, a + 1 + ri(20), a + 21 + ri(20)]), small = t > 3 && ri(2);
    var c = small ? Math.min.apply(null, n) : Math.max.apply(null, n);
    return { tag: small ? 'Which is the smallest?' : 'Which is the greatest?', q: n.join('  ·  '), c: String(c), o: n.map(String) };
  };

  C.gen = function (spec, t, k, x) {
    var p = spec.split(':'), n = p[0], a = p[1] || '';
    if (n === 'mix') { var q = pk(a.split(',')).split(':'); n = q[0]; a = q[1] || ''; }
    if (!G_[n]) n = 'def';
    var r = G_[n](cl(t, 1, 6), Math.max(2, k || 2), x, a);
    r.o = uniq(r.o);
    if (r.o.length < 2) r.o.push(r.c === 'x' ? 'y' : 'x');
    return r;
  };

  /* ---------- classic game: question for a level ---------- */
  var KK = [1, 1.7, 2.6];
  C.tierFor = function (L, diff) { return cl(1 + Math.floor((L - 1) * KK[diff] / 20) + (diff === 2 ? 1 : 0), 1, 6); };
  C.hard = function (L, diff) { return cl(((L - 1) * KK[diff] - 60) / 700, 0, 1); };   // keeps rising after level 6 tier
  C.classic = function (L, diff, boss) {
    var t = C.tierFor(L, diff), h = C.hard(L, diff);
    if (boss) t = Math.min(6, t + 1); else if (t > 1 && WC.rand() < 0.25) t--;
    var T = ['def', 'mean'];
    if (L >= 3) T.push('syn'); if (L >= 6) T.push('spell'); if (L >= 10) T.push('miss'); if (L >= 14) T.push('ant');
    if (L >= 20) T.push('scr', 'ctx'); if (L >= 30) T.push('gram:q'); if (L >= 40) T.push('read', 'build');
    var spec = pk(T), k = 2;
    var q = C.gen(spec, t, k, { ctx: { key: 'cl' + diff, sh: -1 }, h: h });
    q.spec = spec; q.t = t;
    return q;
  };
  /* ---------- modes ---------- */
  C.modes = [];
  (function () {
    WC.MS.split(';').forEach(function (x, i) {
      var p = x.split('|'), c = { name: p[0], g: p[1], i: i };
      (p[2] || '').replace(/([a-zA-Z])(\d+)/g, function (m, l, v) { c[l] = +v; });
      c.grp = Math.floor(i / 10);
      c.sh = c.g[0] === '@' ? -1 : (3 * (i % 10) + c.grp) % 10;     // each mode reads its own slice of the word list
      if (c.name === 'Avatar Challenge') c.name = 'Mascot Challenge';
      if (c.name === 'Friend Challenge') c.name = 'Code Challenge';
      C.modes.push(c);
    });
  })();
  C.cats = ['Daily & Rewards', 'Word Games', 'Vocabulary', 'Spelling', 'Grammar', 'Reading & Understanding', 'Speed Games', 'Special Word Modes', 'Math & Brain Training', 'Long-Term Activities'];
  C.modeQ = function (c, idx, base, seeded) {
    var n = c.n || 10, per = Math.ceil(n / 6), t = c.r || cl(base + Math.floor(idx / per), 1, 6);
    return C.gen(c.g, t, c.k || 2, { ctx: { key: 'm' + c.i, sh: c.sh, seeded: seeded }, h: cl((t - 3) / 4, 0, 1) });
  };
  C.seedList = function (c, key, n) {
    n = n || c.n || 10;
    return WC.withSeed(key, function () { var a = []; for (var i = 0; i < n; i++) a.push(C.modeQ(c, i, 1, true)); return a; });
  };
  C.dailyList = function (key) {
    return WC.withSeed(key, function () {
      var a = [], c = { i: 99, sh: -1, g: 'mix:def,mean,syn,ant,spell,miss', n: 10 };
      for (var i = 0; i < 10; i++) a.push(C.gen(c.g, 1 + Math.floor(i / 2), 2, { ctx: { key: 'daily', sh: -1, seeded: true }, h: 0.3 }));
      return a;
    });
  };
  C.review = function (word) {
    var w = C.word(word); if (!w) return null;
    var d = near(w, 1, 0.3)[0]; if (!d) return null;
    return ri(2) ? mk('Review: what does it mean?', w.w, w.d, [d.d], 2, { wi: w.w }) : mk('Review: which word?', '“' + w.d + '”', w.w, [d.w], 2, { wi: w.w });
  };
  C.word = function (w) { for (var i = 0; i < W.length; i++) if (W[i].w === w) return W[i]; return null; };
  C.allWords = function () { return W; };
  C.isReady = function () { return ready; };
  // honest size of the question pool: distinct (word × question type) stems
  C.poolSize = function () {
    var n = W.length * 2 + W.filter(FN.syn).length + W.filter(FN.ant).length + SPL.length + XW.length * 3 + W.length * 3;
    return n + B.cloze.length + B.reading.length + B.preps.length + B.prons.length + B.homos.length + B.plurals.length + B.comps.length + B.verbs.length * 3 + B.emoji.length * 2 + 400;
  };
})(window);
