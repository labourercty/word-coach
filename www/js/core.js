/* core.js — helpers, saved state, sound, small effects */
(function (G) {
  'use strict';
  var WC = G.WC = G.WC || {};

  /* ---------- tiny DOM helpers ---------- */
  var $ = function (id) { return document.getElementById(id); };
  var el = function (tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  };
  WC.$ = $; WC.el = el;

  // Turn the three currency tokens into drawn gem/coin icons (see the <svg> defs in index.html).
  var ICO = {
    co: '<svg class="ic" aria-hidden="true"><use href="#iCo"/></svg>',
    di: '<svg class="ic" aria-hidden="true"><use href="#iDi"/></svg>',
    rd: '<svg class="ic" aria-hidden="true"><use href="#iRd"/></svg>'
  };
  WC.ICO = ICO;
  WC.rich = function (t) {
    return String(t).replace(/🪙/g, ICO.co).replace(/💎/g, ICO.di).replace(/♦️?/g, ICO.rd);
  };
  WC.rh = function (e, t) { e.innerHTML = WC.rich(t); return e; };

  /* ---------- numbers, dates, random ---------- */
  WC.hash = function (s) {           // FNV-1a, 32-bit
    s = String(s); var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  };
  WC.rng = function (seed) {         // mulberry32
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  WC.dnum = function (d) {           // day number in the player's local time
    d = d || new Date();
    return Math.floor((d.getTime() - d.getTimezoneOffset() * 6e4) / 864e5);
  };
  WC.dstr = function () { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
  WC.weekId = function () {
    var d = new Date(), j = new Date(d.getFullYear(), 0, 1);
    return d.getFullYear() + 'w' + Math.ceil(((d - j) / 864e5 + j.getDay() + 1) / 7);
  };
  WC.clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  WC.rand = Math.random;             // game code uses WC.rand(); seeded modes swap it temporarily
  WC.withSeed = function (seed, fn) {
    var old = WC.rand; WC.rand = WC.rng(WC.hash(seed));
    try { return fn(); } finally { WC.rand = old; }
  };

  /* ---------- saved state (localStorage, no server) ---------- */
  var KEY = 'wc2';
  function defaults() {
    return {
      v: 2, seed: (Math.random() * 2147483647) | 0,
      co: 100, di: 2, rd: 0,
      pu: { freeze: 1, shield: 1, skip: 1, x2: 1 },
      own: ['t:default', 'k:default'], th: 'default', skin: 'default',
      diff: 0, bl: [0, 0, 0], best: 0,
      qp: {}, learn: {}, miss: [],
      stat: { cor: 0, best: 0, boss: 0, games: 0, modes: {} },
      done: {}, lk: { d: '', n: 0 }, ch: { d: '' }, wh: { d: '' }, spx: 0,
      inst: 0, cl: '', ps: 0, pb: 0, bd: 0,
      sk: { d: 0, n: 0, fz: 0 }, xp: 0, ms: null, ach: {}, lb: [],
      rem: 1, set: { sfx: 1, mus: 1, vol: 0.7, vib: 1, theme: 'auto' },
      adfree: 0, adwatch: 0, name: ''
    };
  }
  function merge(base, src) {
    if (!src || typeof src !== 'object') return base;
    Object.keys(base).forEach(function (k) {
      if (!(k in src)) return;
      var b = base[k], s = src[k];
      if (b && typeof b === 'object' && !Array.isArray(b) && s && typeof s === 'object' && !Array.isArray(s)) {
        // keep free-form maps (qp/learn/done/ach/stat.modes) as saved; merge fixed-shape objects
        if (['qp', 'learn', 'done', 'ach', 'modes'].indexOf(k) >= 0) base[k] = s; else base[k] = merge(b, s);
      } else if (typeof b === typeof s || b === null || b === '') { base[k] = s; }
    });
    return base;
  }
  var S = defaults();
  try { var raw = localStorage.getItem(KEY); if (raw) S = merge(defaults(), JSON.parse(raw)); } catch (e) { /* private mode: play without saving */ }
  S.set = S.set || defaults().set;
  if (!S.inst) S.inst = WC.dnum();                       // day 1 of the reward calendar = install day
  if (!S.cl || S.cl.length !== 9000) S.cl = (S.cl || '').padEnd(9000, '0').slice(0, 9000);
  WC.S = S;
  var saveT = 0;
  WC.save = function () {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ }
  };
  WC.saveSoon = function () { clearTimeout(saveT); saveT = setTimeout(WC.save, 400); };
  WC.save();
  G.addEventListener('pagehide', WC.save);
  document.addEventListener('visibilitychange', function () { if (document.hidden) WC.save(); });

  /* ---------- sound: everything is synthesized, no audio files ---------- */
  var AC = null, MG = null, musicTimer = null, step = 0;
  var A = WC.audio = { tones: 0, musicTones: 0, level: function () { return 1; } };
  A.init = function () {
    try {
      if (!AC) {
        var C = G.AudioContext || G.webkitAudioContext; if (!C) return false;
        AC = new C(); MG = AC.createGain(); MG.connect(AC.destination);
      }
      MG.gain.value = S.set.vol;
      if (AC.state === 'suspended') AC.resume();
      return true;
    } catch (e) { return false; }
  };
  A.state = function () { return AC ? AC.state : 'none'; };
  A.setVolume = function (v) { S.set.vol = v; if (MG) MG.gain.value = v; };
  function tone(f, d, type, vol, at, isMusic) {
    if (!AC || (isMusic ? !S.set.mus : !S.set.sfx)) return;
    try {
      var t = AC.currentTime + (at || 0), o = AC.createOscillator(), g = AC.createGain();
      o.type = type || 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0008, t + d);
      o.connect(g); g.connect(MG); o.start(t); o.stop(t + d + 0.05);
      if (isMusic) A.musicTones++; else A.tones++;
    } catch (e) { /* ignore */ }
  }
  var mf = function (m) { return 440 * Math.pow(2, (m - 69) / 12); };
  A.sfx = {
    click: function () { tone(700, 0.06, 'square', 0.08); },
    ok: function () { tone(523, 0.12, 'triangle', 0.25); tone(784, 0.2, 'triangle', 0.25, 0.09); },
    bad: function () { tone(180, 0.35, 'sawtooth', 0.15); tone(120, 0.4, 'sawtooth', 0.15, 0.12); },
    beat: function () { tone(70, 0.12, 'sine', 0.4); tone(58, 0.16, 'sine', 0.35, 0.16); },
    coin: function () { tone(988, 0.08, 'square', 0.1); tone(1319, 0.16, 'square', 0.1, 0.07); },
    combo: function (n) { [0, 4, 7, 12, 16].slice(0, Math.min(5, n)).forEach(function (s, i) { tone(mf(72 + s), 0.18, 'square', 0.12, i * 0.07); }); },
    lvl: function () { [0, 4, 7, 12, 16, 19].forEach(function (s, i) { tone(mf(67 + s), 0.25, 'triangle', 0.22, i * 0.09); }); },
    over: function () { [7, 5, 3, 0].forEach(function (s, i) { tone(mf(60 + s), 0.4, 'sawtooth', 0.15, i * 0.18); }); }
  };
  var SC = [[0, 2, 4, 7, 9], [0, 3, 5, 7, 10], [0, 2, 3, 7, 8], [0, 2, 5, 7, 9], [0, 1, 5, 7, 8], [0, 2, 4, 6, 9], [0, 4, 5, 7, 11], [0, 3, 4, 7, 10]];
  var RT = [48, 50, 45, 52, 47, 49, 46, 51];
  A.musicOn = function () {
    if (musicTimer || !S.set.mus || !AC) return;
    musicTimer = setInterval(function () {
      var lv = A.level(), z = Math.floor((lv - 1) / 20) % SC.length, sc = SC[z], r = RT[z],
        sd = Math.max(0.13, 0.27 - Math.min(lv, 100) * 0.0012);
      for (var k = 0; k < 2; k++) {
        var t = k * sd;
        if (step % 4 === 0) tone(mf(r - 12), sd * 3, 'triangle', 0.09, t, 1);
        if (Math.random() < 0.7) tone(mf(r + 12 + sc[Math.floor(Math.random() * 5)] + (Math.random() < 0.3 ? 12 : 0)), sd * 1.6, 'sine', 0.06, t, 1);
        step++;
      }
    }, 260);
  };
  A.musicOff = function () { clearInterval(musicTimer); musicTimer = null; };
  A.isMusicPlaying = function () { return !!musicTimer; };
  document.addEventListener('pointerdown', function () { if (A.init()) A.musicOn(); }, { passive: true });
  document.addEventListener('keydown', function () { if (A.init()) A.musicOn(); });
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('button')) A.sfx.click();
  });
  document.addEventListener('visibilitychange', function () {   // be quiet when the app is in the background
    if (document.hidden) A.musicOff(); else if (AC) A.musicOn();
  });
  WC.vib = function (p) { if (S.set.vib) { try { navigator.vibrate && navigator.vibrate(p); } catch (e) { /* ignore */ } } };

  /* ---------- little visual effects ---------- */
  WC.anim = function (e, txt, html) {
    if (html) e.innerHTML = WC.rich(txt); else e.textContent = txt;
    e.classList.remove('go'); void e.offsetWidth; e.classList.add('go');
  };
  WC.say = function (t) { WC.anim($('toast'), t, true); };
  WC.burst = function (list, n) {
    n = n || 14;
    if (G.matchMedia && G.matchMedia('(prefers-reduced-motion: reduce)').matches) n = 4;
    for (var i = 0; i < n; i++) {
      var b = el('div', 'bit');
      b.innerHTML = list[i % list.length] === '♦️' || list[i % list.length] === '💎' || list[i % list.length] === '🪙' ? WC.rich(list[i % list.length]) : '';
      if (!b.innerHTML) b.textContent = list[i % list.length];
      b.style.setProperty('--x', (Math.random() * 300 - 150) + 'px');
      b.style.setProperty('--y', (Math.random() * 260 - 120) + 'px');
      document.body.appendChild(b);
      (function (x) { setTimeout(function () { x.remove(); }, 950); })(b);
    }
  };
  WC.flash = function () {
    var f = $('flash'), g = $('game');
    f.classList.remove('on'); void f.offsetWidth; f.classList.add('on');
    g.classList.remove('shake'); void g.offsetWidth; g.classList.add('shake');
    WC.vib([30, 30, 60]);
  };
})(window);
