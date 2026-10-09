/* ui.js — screens, menus, shop, and start-up */
(function (G) {
  'use strict';
  var WC = G.WC, S = WC.S, C = WC.C, A = WC.ads, CF = G.WC_CONFIG, g = WC.g, $ = WC.$, el = WC.el, rich = WC.rich, rh = WC.rh, sfx = WC.audio.sfx;
  var ri = function (n) { return Math.floor(Math.random() * n); }, pk = function (a) { return a[ri(a.length)]; };

  /* ---------- modal stack: Back always returns to the previous screen ---------- */
  var stack = [];
  function openM(id) {
    var m = $(id); if (!m) return;
    var k = stack.indexOf(id); if (k >= 0) stack.splice(k, 1);
    if (stack.length) $(stack[stack.length - 1]).hidden = true;
    stack.push(id); m.hidden = false; g.setPause(true); A.render();
  }
  function closeM() {
    var id = stack.pop(); if (id) $(id).hidden = true;
    if (stack.length) $(stack[stack.length - 1]).hidden = false; else g.setPause(false);
  }
  g.closeAll = function () { stack.forEach(function (i) { $(i).hidden = true; }); stack = []; g.setPause(false); };
  function xOpen(title, html) { $('xTitle').textContent = title; $('xBody').innerHTML = html || ''; openM('xModal'); return $('xBody'); }
  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-back],[data-close]') : null; if (t) closeM();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && stack.length) closeM(); });

  /* ---------- home ---------- */
  function homeUp() {
    g.wallet();
    $('avBtn').innerHTML = g.mascot(S.skin, false, 48);
    var i = g.rkOf(), R = g.RK, a = R[i][1], b = R[i + 1] ? R[i + 1][1] : a + 1;
    $('pInfo').textContent = R[i][0] + ' · ' + S.xp + ' XP';
    $('xpFill').style.width = (R[i + 1] ? Math.min(1, (S.xp - a) / (b - a)) * 100 : 100) + '%';
    $('mdl').innerHTML = S.bd ? g.medal(S.bd - 1, 34) : '';
    var n = g.avail();
    $('drBtn').textContent = n ? '🎁 Daily Reward (' + n + ')' : '📅 Daily Reward ✓';
    $('dcBtn').textContent = S.ch.d === WC.dstr() && S.ch.s != null ? '✅ Daily ' + S.ch.s + '/10' : '🔥 Daily Challenge';
    var bl = S.bl[S.diff];
    $('best').textContent = S.best ? '🏅 Best score ' + S.best + ' · ' + g.DN[S.diff] + ' best level ' + bl + ' / ' + g.MAXL : 'Answer questions, climb levels, collect rewards!';
    Array.prototype.forEach.call(document.querySelectorAll('#diffs button'), function (b) { b.classList.toggle('sel', +b.dataset.d === S.diff); });
    $('adfreeNote').hidden = !A.adfree();
    A.render();
  }
  g.homeUp = homeUp;
  function goHome() { g.leave(); g.closeAll(); g.show('home'); homeUp(); WC.audio.level = function () { return 1; }; }
  Array.prototype.forEach.call(document.querySelectorAll('#diffs button'), function (b) { b.onclick = function () { g.setDiff(+b.dataset.d); homeUp(); }; });
  $('play').onclick = function () { g.start(); };
  $('avBtn').onclick = function () { shopTab = 'a'; openShop(); };
  $('drBtn').onclick = function () { drPage = Math.floor((g.dayNow() - 1) / PG); drUI(); openM('drModal'); };
  $('dcBtn').onclick = function () { g.startDaily(); };
  $('shopBtn').onclick = function () { openShop(); };
  $('lbBtn').onclick = openLb; $('lbBtn2').onclick = openLb;
  $('goalBtn').onclick = openGoals;
  $('setBtn').onclick = function () { setUI(); openM('setModal'); };
  $('quitBtn').onclick = function () { g.quit(); openM('qModal'); };
  $('qStay').onclick = function () { closeM(); g.resume(); };
  $('qGo').onclick = function () { goHome(); };
  $('overBack').onclick = goHome; $('homeBtn').onclick = goHome;
  $('again').onclick = function () { g.again(); };
  $('revive').onclick = function () { g.revive(); };
  $('revBtn').onclick = function () { g.startReview(); };
  $('shareBtn').onclick = function () {
    var t = 'I scored ' + $('fs').textContent + ' in Word Coach! Can you beat me?', u = location.href.split('#')[0];
    if (navigator.share) { navigator.share({ title: 'Word Coach', text: t, url: u }).catch(function () { }); }
    else { try { navigator.clipboard.writeText(t + ' ' + u); WC.say('Copied to clipboard!'); } catch (e) { WC.say(t); } }
  };

  /* ---------- leaderboard (this device only) ---------- */
  function openLb() {
    var box = $('lbList'); box.innerHTML = '';
    if (!S.lb.length) box.appendChild(el('p', 'note', 'Play a game and your best runs appear here.'));
    S.lb.forEach(function (e, i) {
      var r = el('div', 'lb' + (i === 0 ? ' me' : '')); r.appendChild(el('span', '', '#' + (i + 1))); r.appendChild(el('span', '', g.DN[e.d] + ' · Lv ' + e.l)); r.appendChild(el('span', '', String(e.s))); box.appendChild(r);
    });
    $('lbNote').textContent = 'Your best 20 runs on this device.';
    openM('lbModal');
  }

  /* ---------- settings ---------- */
  function setUI() {
    $('sSfx').textContent = S.set.sfx ? 'On' : 'Off'; $('sMus').textContent = S.set.mus ? 'On' : 'Off'; $('sVib').textContent = S.set.vib ? 'On' : 'Off';
    $('sVol').value = S.set.vol; $('sTheme').textContent = { auto: 'Auto', light: 'Light', dark: 'Dark' }[S.set.theme];
    $('sAds').textContent = A.adfree() ? 'Active' : 'Remove';
  }
  $('sSfx').onclick = function () { S.set.sfx = S.set.sfx ? 0 : 1; WC.save(); setUI(); if (S.set.sfx) sfx.ok(); };
  $('sMus').onclick = function () { S.set.mus = S.set.mus ? 0 : 1; WC.save(); if (S.set.mus) { WC.audio.init(); WC.audio.musicOn(); } else WC.audio.musicOff(); setUI(); };
  $('sVol').oninput = function () { WC.audio.setVolume(+$('sVol').value); WC.saveSoon(); };
  $('sVib').onclick = function () { S.set.vib = S.set.vib ? 0 : 1; WC.save(); setUI(); WC.vib(40); };
  $('sTheme').onclick = function () { var o = ['auto', 'light', 'dark']; S.set.theme = o[(o.indexOf(S.set.theme) + 1) % 3]; WC.save(); g.applyMode(); setUI(); };
  $('sReset').onclick = function () { S.qp = {}; S.miss = []; WC.save(); WC.say('Question history cleared'); };
  $('sAds').onclick = function () { shopTab = 'm'; openShop(); };
  $('modesBtn').onclick = openModes;

  /* ---------- 100 game modes ---------- */
  function openModes() {
    var b = $('mBody'); b.innerHTML = '';
    C.cats.forEach(function (name, ci) {
      b.appendChild(el('div', 'sh', (ci + 1) + '. ' + name));
      var grid = el('div', 'mg');
      C.modes.slice(ci * 10, ci * 10 + 10).forEach(function (m) {
        var btn = el('button', '', m.name); btn.onclick = function () { g.startMode(m.i); }; grid.appendChild(btn);
      });
      b.appendChild(grid);
    });
    openM('mModal');
  }

  /* ---------- daily reward calendar ---------- */
  var PG = 28, drPage = 0;
  function drUI() {
    var cur = g.dayNow(), grid = $('drGrid'); grid.innerHTML = '';
    var from = drPage * PG + 1, to = Math.min(g.DAYS, from + PG - 1);
    $('drPg').textContent = 'Days ' + from + '–' + to + ' of ' + g.DAYS;
    for (var n = from; n <= to; n++) {
      (function (n) {
        var r = g.dayRew(n), got = g.has1(n), can = !got && n <= cur, d = el('div', 'dd' + (can ? ' now' : '') + (got ? ' got' : '') + (n > cur ? ' lk' : ''));
        d.appendChild(el('div', '', 'Day ' + n)); d.appendChild(rh(el('div'), '🪙' + r[0])); if (r[1]) d.appendChild(rh(el('div'), '💎' + r[1])); if (r[2]) d.appendChild(rh(el('div'), '♦️' + r[2]));
        if (got) d.appendChild(el('div', '', '✓'));
        if (can) d.onclick = function () { if (g.claimDay(n)) drUI(); };
        grid.appendChild(d);
      })(n);
    }
    var a = g.avail();
    $('drToday').innerHTML = rich(g.has1(cur) ? 'Day ' + cur + ' collected ✓' : 'Today · Day ' + cur + ': ' + g.fmtR(g.dayRew(cur)));
    $('drClaim').disabled = !a; $('drClaim').textContent = a ? (a > 1 ? 'Collect all (' + a + ' days)' : '🎁 Collect Day ' + cur) : 'Come back tomorrow';
    $('drNote').textContent = 'Day 1 was the day you installed. Missed days stay collectable. Tap a glowing day to collect it.';
    homeUp();
  }
  $('drNow').onclick = function () { drPage = Math.floor((g.dayNow() - 1) / PG); drUI(); };
  $('drPrev').onclick = function () { drPage = Math.max(0, drPage - 1); drUI(); };
  $('drNext').onclick = function () { drPage = Math.min(Math.ceil(g.DAYS / PG) - 1, drPage + 1); drUI(); };
  $('drClaim').onclick = function () { if (g.claimAll()) drUI(); };

  /* ---------- shop ---------- */
  var shopTab = 't', spD = 0, spPage = {};
  var TN = { t: 'Themes · pay with 🪙 or ♦️', a: 'Mascots · pay with 💎 or ♦️', p: 'Power-ups · pay with 🪙', s: 'Special items · unlocked by reaching levels', m: 'Red diamonds & ad-free' };
  var grad = function (t) { return 'linear-gradient(135deg,' + t[4] + ',' + t[5] + ')'; };
  function spend(cur, price, gain) {
    if (S[cur] < price) { WC.say('Not enough ' + (cur === 'co' ? '🪙' : cur === 'di' ? '💎' : '♦️')); return; }
    S[cur] -= price; gain(); WC.save(); sfx.coin(); shopUp();
  }
  function item(box, o) {
    var r = el('div', 'it'), p = el('div', 'pv'); if (o.pvHtml) p.innerHTML = o.pvHtml; if (o.bg) p.style.background = o.bg; r.appendChild(p);
    var m = el('div', 'im'); m.appendChild(el('span', '', o.name)); if (o.sub) m.appendChild(el('small', '', o.sub)); r.appendChild(m);
    var bs = el('div', 'ib');
    (o.btns || []).forEach(function (b) { var x = rh(el('button', '', b[0]), b[0]); if (b[2]) x.disabled = true; x.onclick = b[1]; bs.appendChild(x); });
    r.appendChild(bs); box.appendChild(r);
  }
  function equipT(id) { return function () { S.th = id; g.applyTheme(); WC.save(); shopUp(); }; }
  function equipK(id) { return function () { S.skin = id; WC.save(); g.drawMascot(); shopUp(); }; }
  function shopUp() {
    g.wallet(); homeUp();
    var box = $('shopList'); box.innerHTML = '';
    $('tabName').innerHTML = rich(TN[shopTab]);
    Array.prototype.forEach.call(document.querySelectorAll('#tabs button'), function (b) { b.classList.toggle('sel', b.dataset.t === shopTab); });
    $('shopNote').textContent = '';
    if (shopTab === 't') g.TH.forEach(function (t) {
      var own = g.owns('t', t[0]), btns = [];
      if (own) btns.push([S.th === t[0] ? '✓ Equipped' : 'Equip', equipT(t[0]), S.th === t[0]]);
      else { btns.push(['🪙' + t[2], function () { spend('co', t[2], function () { S.own.push('t:' + t[0]); S.th = t[0]; g.applyTheme(); }); }]); btns.push(['♦️' + t[3], function () { spend('rd', t[3], function () { S.own.push('t:' + t[0]); S.th = t[0]; g.applyTheme(); }); }]); }
      item(box, { name: t[1], bg: grad(t), btns: btns });
    });
    if (shopTab === 'a') g.SK.forEach(function (k) {
      var own = g.owns('k', k[0]), btns = [];
      if (own) btns.push([S.skin === k[0] ? '✓ Equipped' : 'Equip', equipK(k[0]), S.skin === k[0]]);
      else { btns.push(['💎' + k[2], function () { spend('di', k[2], function () { S.own.push('k:' + k[0]); S.skin = k[0]; g.drawMascot(); }); }]); btns.push(['♦️' + k[3], function () { spend('rd', k[3], function () { S.own.push('k:' + k[0]); S.skin = k[0]; g.drawMascot(); }); }]); }
      item(box, { name: k[1], pvHtml: g.mascot(k[0], false, 40), btns: btns });
    });
    if (shopTab === 'p') g.PU.forEach(function (p) {
      item(box, { name: p[2], pvHtml: p[1], sub: 'You have ' + S.pu[p[0]], btns: [['🪙' + p[3], function () { spend('co', p[3], function () { S.pu[p[0]]++; }); }]] });
    });
    if (shopTab === 's') specialsUI(box);
    if (shopTab === 'm') moneyUI(box);
    A.render();
  }
  function specialsUI(box) {
    var d = spD, bl = S.bl[d], per = 8, total = g.nSpecials;
    var nxt = Math.min(total, Math.floor(bl / g.SPE) + 1), pg = spPage[d] != null ? spPage[d] : Math.floor((nxt - 1) / per), pages = Math.ceil(total / per);
    var row = el('div', 'row'); row.style.marginBottom = '8px';
    g.DN.forEach(function (n, i) { var b = el('button', '', n); if (i === d) b.classList.add('sel'); b.onclick = function () { spD = i; shopUp(); }; row.appendChild(b); });
    box.appendChild(row);
    box.appendChild(el('p', 'note', 'Reach level ' + g.SPE + ', ' + (g.SPE * 2) + ', ' + (g.SPE * 3) + '… in ' + g.DN[d] + ' (up to ' + g.MAXL + '). Your best level: ' + bl + '. Each one unlocks a theme AND a mascot.'));
    for (var k = pg * per + 1; k <= Math.min(total, pg * per + per); k++) {
      (function (k) {
        var sp = g.special(d, k), own = bl >= sp.lvl;
        item(box, { name: sp.name, sub: own ? 'Unlocked · level ' + sp.lvl : '🔒 Reach level ' + sp.lvl + ' in ' + g.DN[d], pvHtml: g.mascot(sp.id, false, 38), bg: grad([0, 0, 0, 0, sp.c1, sp.c2]),
          btns: own ? [[S.th === sp.id ? '✓ Theme' : 'Theme', equipT(sp.id), S.th === sp.id], [S.skin === sp.id ? '✓ Mascot' : 'Mascot', equipK(sp.id), S.skin === sp.id]] : [] });
      })(k);
    }
    var nav = el('div', 'row'); nav.style.marginTop = '8px';
    var pv = el('button', '', '‹'), nx = el('button', '', '›'), lab = el('button', '', (pg + 1) + ' / ' + pages);
    pv.onclick = function () { spPage[d] = Math.max(0, pg - 1); shopUp(); }; nx.onclick = function () { spPage[d] = Math.min(pages - 1, pg + 1); shopUp(); }; lab.onclick = function () { spPage[d] = Math.floor((nxt - 1) / per); shopUp(); };
    nav.appendChild(pv); nav.appendChild(lab); nav.appendChild(nx); box.appendChild(nav);
  }
  function gems(n) {
    var pos = [[22, 10, 26], [6, 18, 20], [38, 18, 20], [22, 26, 22], [0, 28, 16], [48, 28, 16], [14, 4, 14]], c = Math.min(pos.length, 2 + Math.ceil(n / 15)), s = '';
    for (var i = 0; i < c; i++) s += '<use href="#iRd" x="' + pos[i][0] + '" y="' + pos[i][1] + '" width="' + pos[i][2] + '" height="' + pos[i][2] + '"/>';
    return '<svg viewBox="0 0 66 52" width="66" height="52">' + s + '</svg>';
  }
  function grant(p) {
    if (p.kind === 'red') { S.rd += p.qty; WC.say('+♦️' + p.qty + ' red diamonds!'); }
    else { S.adfree = Math.max(Date.now(), S.adfree) + 30 * 864e5; WC.say('Ads removed for 30 days!'); }
    WC.save(); sfx.lvl(); WC.burst(['♦️', '✨']); shopUp();
  }
  function buy(p) {
    $('shopNote').textContent = 'Processing…';
    A.pay(p).then(function (ok) {
      if (ok) { grant(p); }
      else $('shopNote').textContent = (typeof CF.pay.handler === 'function') ? 'Payment was not completed. Nothing was charged.' : 'Payments are not connected yet, so nothing was charged and nothing was given.';
    });
  }
  function moneyUI(box) {
    var P = CF.pay, cur = P.currency;
    var days = A.adfree() ? Math.ceil((S.adfree - Date.now()) / 864e5) : 0;
    item(box, { name: 'No ads', sub: days ? days + ' days left · extend for 30 more' : 'Removes banner and popup ads. Optional reward ads stay available.', pvHtml: '🚫',
      btns: [[cur + P.adFreeMonthly + ' / month', function () { buy({ id: 'adfree', kind: 'adfree', qty: 1, price: P.adFreeMonthly }); }]] });
    box.appendChild(el('div', 'sh', 'Red diamonds (buy everything)'));
    P.redDiamondPacks.forEach(function (k) {
      item(box, { name: k.qty + ' Red Diamonds', pvHtml: gems(k.qty), btns: [[cur + k.price, function () { buy({ id: k.id, kind: 'red', qty: k.qty, price: k.price }); }]] });
    });
    var cu = P.custom, wrap = el('div', 'it'), inp = el('input'), lab = el('div', 'im'), bt = el('button', '');
    inp.type = 'number'; inp.min = cu.min; inp.max = cu.max; inp.value = 25; inp.style.cssText = 'width:80px;padding:8px;border-radius:12px;border:2px solid var(--line);background:var(--card);font-size:16px;text-align:center';
    lab.appendChild(el('span', '', 'Choose any amount')); lab.appendChild(el('small', '', cu.min + ' – ' + cu.max + ' red diamonds'));
    function upd() { var q = Math.max(cu.min, Math.min(cu.max, Math.floor(+inp.value) || cu.min)); bt.innerHTML = rich('Buy ♦️' + q + ' · ' + cur + q * cu.pricePer); bt._q = q; }
    inp.oninput = upd; upd();
    bt.onclick = function () { upd(); buy({ id: 'custom', kind: 'red', qty: bt._q, price: bt._q * cu.pricePer }); };
    wrap.appendChild(inp); wrap.appendChild(lab); wrap.appendChild(bt); box.appendChild(wrap);
    var note = el('p', 'note', 'Payments run through the payment provider you connect in config.js.'); box.appendChild(note);
  }
  function openShop() { shopUp(); openM('shopModal'); }
  Array.prototype.forEach.call(document.querySelectorAll('#tabs button'), function (b) { b.onclick = function () { shopTab = b.dataset.t; shopUp(); }; });
  function watch(kind, fn) { A.rewarded(kind).then(function (ok) { if (ok) { fn(); WC.save(); sfx.lvl(); WC.burst(['♦️', '💎', '✨']); g.wallet(); } else WC.say('No reward this time'); }); }
  $('adRed').onclick = function () { watch('red', function () { S.rd += 2; S.adwatch++; WC.say('+♦️2 red diamonds!'); }); };
  $('adDia').onclick = function () { watch('dia', function () { S.di += 4; S.adwatch++; WC.say('+💎4 diamonds!'); }); };
  $('adRed').innerHTML = rich('▶ Ad · +♦️2'); $('adDia').innerHTML = rich('▶ Ad · +💎4');

  /* ---------- goals: missions, rank, streak, badges, review ---------- */
  function openGoals() {
    var b = xOpen('Goals', ''), add = function (e) { b.appendChild(e); }, i = g.rkOf(), k = S.sk, d = g.qGet();
    var r = el('div', 'center'); r.style.fontWeight = '700'; r.textContent = g.RK[i][0] + ' · ' + S.xp + ' XP'; add(r);
    add(el('p', 'note', '🔥 Daily streak: ' + k.n + ' day' + (k.n === 1 ? '' : 's') + ' · Best perfect streak: ' + S.pb));
    add(el('div', 'sh', 'Today\'s missions (' + Math.min(d.c, d.l.length) + '/' + d.l.length + ')'));
    if (d.c >= d.l.length) add(el('p', 'note', 'All missions done today. New ones tomorrow!'));
    else {
      var x = g.misn(d, d.c), row = el('div', 'it'), im = el('div', 'im'); im.appendChild(el('span', '', x.txt)); im.appendChild(el('small', '', Math.min(d.pr, x.n) + ' / ' + x.n)); row.appendChild(im);
      var cb = rh(el('button', '', 'Claim 🪙' + x.co + (x.di ? ' 💎' + x.di : '')), 'Claim 🪙' + x.co + (x.di ? ' 💎' + x.di : '')); cb.disabled = d.pr < x.n; cb.onclick = function () { if (g.claimMis()) { g.wallet(); openGoals(); } }; row.appendChild(cb); add(row);
      add(el('p', 'note', 'The next mission appears after you finish this one.'));
    }
    var bb = el('button', 'ghost', '🏅 Badges (' + S.bd + '/35)'); bb.onclick = openBadges; add(bb);
    var ab = el('button', 'ghost', '🏆 Achievements'); ab.style.marginTop = '8px'; ab.onclick = function () { g.spec['@ach'](); }; add(ab);
    var rb = el('button', 'ghost', '📖 Review missed words (' + S.miss.length + ')'); rb.style.marginTop = '8px'; rb.onclick = function () { g.startReview(); }; add(rb);
  }
  function openBadges() {
    var b = xOpen('Badges', ''), n = S.bd, BD = g.BD;
    b.appendChild(el('p', 'note', 'Answer in a row with no wrong answer and no timeout. Your streak carries over between games but resets on a mistake.'));
    var t = el('p', 'center', 'Perfect streak: ' + S.ps + ' · best ' + S.pb); t.style.fontWeight = '700'; b.appendChild(t);
    if (n < BD.length) { var bar = el('div', 'bar'), f = el('i'); f.style.width = Math.min(100, S.ps / BD[n].n * 100) + '%'; bar.appendChild(f); b.appendChild(bar); b.appendChild(el('p', 'note', 'Next: ' + BD[n].name + ' at ' + BD[n].n)); }
    g.BT.forEach(function (tt, ti) {
      b.appendChild(el('div', 'sh', tt)); var gr = el('div', 'bg5');
      g.BS[ti].forEach(function (x, li) { var i = ti * 5 + li, c = el('div', 'ci' + (i < n ? '' : ' lk')); c.innerHTML = g.medal(i, 46); c.appendChild(el('small', '', String(x))); gr.appendChild(c); });
      b.appendChild(gr);
    });
  }

  /* ---------- special modes ---------- */
  var SP = g.spec;
  SP['@reward'] = function () { $('drBtn').onclick(); };
  SP['@daily'] = function () { g.closeAll(); g.startDaily(); };
  SP['@ach'] = function () {
    g.checkAch(); xOpen('Achievement Hunt', g.ACH.map(function (a) { return '<div class="it"><div class="pv">' + (S.ach[a[0]] ? '✓' : '…') + '</div><div class="im"><span>' + a[0] + '</span><small>' + a[1] + '</small></div></div>'; }).join('') + '<p class="note">Each achievement pays 1 diamond.</p>');
  };
  SP['@col'] = function () {
    var it = [];
    g.TH.forEach(function (t) { it.push([g.owns('t', t[0]), '<div class="pv" style="background:' + grad(t) + '"></div>', t[1]]); });
    g.SK.forEach(function (k) { it.push([g.owns('k', k[0]), '<div class="pv">' + g.mascot(k[0], false, 36) + '</div>', k[1]]); });
    var sp = 0; for (var d = 0; d < 3; d++) sp += Math.min(g.nSpecials, Math.floor(S.bl[d] / g.SPE));
    xOpen('Collection Book', '<div class="col">' + it.map(function (x) { return '<div class="ci' + (x[0] ? '' : ' lk') + '">' + x[1] + '<small>' + (x[0] ? x[2] : '???') + '</small></div>'; }).join('') + '</div><p class="note">' + it.filter(function (x) { return x[0]; }).length + ' / ' + it.length + ' shop items · ' + sp + ' / ' + (g.nSpecials * 3) + ' special items</p>');
  };
  function flower(h, s) {
    return '<svg viewBox="0 0 40 50" class="fl"><path d="M20 48V22" stroke="#2f9e44" stroke-width="3"/><path d="M20 40c-8 0-10-6-10-6s8-1 10 6zM20 34c8 0 10-6 10-6s-8-1-10 6z" fill="#51cf66"/>' +
      (s ? '<g fill="hsl(' + h + ',85%,60%)">' + [0, 72, 144, 216, 288].map(function (a) { return '<ellipse cx="20" cy="12" rx="5" ry="8" transform="rotate(' + a + ' 20 20)"/>'; }).join('') + '</g><circle cx="20" cy="20" r="5" fill="#ffd43b"/>' : '<circle cx="20" cy="22" r="3" fill="#51cf66"/>') + '</svg>';
  }
  SP['@gar'] = function () {
    var L = Object.keys(S.learn).length, n = Math.floor(L / 3), h = '';
    for (var j = 0; j < 12; j++) h += j < n ? flower(j * 47 % 360, 1) : j === n ? flower(0, 0) : '<div class="fl"></div>';
    xOpen('Word Garden', '<div class="gg">' + h + '</div><p class="note">Words learned: ' + L + ' · a new flower blooms every 3 words' + (n > 12 ? ' (' + n + ' flowers so far!)' : '') + '</p>');
  };
  SP['@mus'] = function () {
    var l = Object.keys(S.learn), rows = l.slice(-120).reverse().map(function (w) { var o = C.word(w); return o ? '<div class="it"><div class="im"><span>' + w + '</span><small>' + o.d + '</small></div></div>' : ''; }).join('');
    xOpen('Word Museum', l.length ? rows + '<p class="note">' + l.length + ' words learned</p>' : '<p class="note">Answer questions correctly and the words you learn are displayed here.</p>');
  };
  SP['@friend'] = function () {
    var b = xOpen('Code Challenge', '<p class="note">Type any code (a word or number). Everyone who plays the same code gets the same 10 questions, so you can compare scores with friends in person or in chat. Nothing is uploaded.</p><input type="text" id="fcIn" maxlength="10" placeholder="Enter a code" style="margin:8px 0"><button class="primary" id="fcGo">Play this code</button><button class="ghost" id="fcNew" style="margin-top:8px">Make a new code</button>');
    $('fcNew').onclick = function () { $('fcIn').value = Math.random().toString(36).slice(2, 7).toUpperCase(); };
    $('fcGo').onclick = function () { var c = $('fcIn').value.trim().toUpperCase(); if (c.length < 3) { WC.say('Enter a code (3+ characters)'); return; } g.startCode(c); };
  };
  SP['@chest'] = function () {
    xOpen('Mystery Chest', '<div class="center"><svg viewBox="0 0 120 100" width="190" height="158"><ellipse cx="60" cy="94" rx="48" ry="5" fill="#0003"/><rect x="15" y="45" width="90" height="45" rx="5" fill="#8a4b1f" stroke="#4a2408" stroke-width="3"/><rect x="15" y="62" width="90" height="8" fill="#f5b400"/><g id="lid" style="transform-origin:15px 45px;transition:transform .6s"><path d="M15 45v-12a45 22 0 0 1 90 0v12z" fill="#a85f2a" stroke="#4a2408" stroke-width="3"/><rect x="15" y="38" width="90" height="7" fill="#f5b400"/></g><rect x="53" y="52" width="14" height="18" rx="3" fill="#ffd54a" stroke="#8a5200" stroke-width="2"/></svg></div><p class="center" id="chRes" style="font-weight:700;min-height:28px"></p><button class="primary" id="chBtn"></button>');
    chestBtn();
  };
  function chestBtn() {
    var b = $('chBtn'), free = S.ch.cd !== WC.dstr(); b.textContent = free ? 'Open free chest' : 'Open · 60 coins';
    b.onclick = function () {
      if (!free && S.co < 60) { $('chRes').textContent = 'Not enough coins'; return; }
      if (free) S.ch.cd = WC.dstr(); else S.co -= 60;
      var r = Math.random(), t;
      if (r < .5) { var c = 30 + ri(91); S.co += c; t = '+🪙' + c; } else if (r < .75) { var d = 1 + ri(2); S.di += d; t = '+💎' + d; }
      else if (r < .9) { var k = pk(g.PU); S.pu[k[0]]++; t = '+ ' + k[2] + ' power-up'; } else { var c2 = 200 + ri(201); S.co += c2; t = '+🪙' + c2 + ' jackpot!'; }
      $('lid').style.transform = 'rotate(-38deg)'; $('chRes').innerHTML = rich(t); sfx.lvl(); WC.burst(['✨', '🪙', '💎']); WC.save(); g.wallet(); setTimeout(chestBtn, 900);
    };
  }
  var WP = [['c', 50], ['c', 100], ['d', 1], ['p', 0], ['c', 200], ['d', 2]], wr = 0;
  SP['@wheel'] = function () {
    var sg = '';
    WP.forEach(function (p, i) {
      var a0 = (i * 60 - 90) * Math.PI / 180, a1 = ((i + 1) * 60 - 90) * Math.PI / 180, m = (i * 60 + 30 - 90) * Math.PI / 180, x = 100 + 58 * Math.cos(m), y = 100 + 58 * Math.sin(m);
      sg += '<path d="M100 100L' + (100 + 92 * Math.cos(a0)).toFixed(1) + ' ' + (100 + 92 * Math.sin(a0)).toFixed(1) + 'A92 92 0 0 1 ' + (100 + 92 * Math.cos(a1)).toFixed(1) + ' ' + (100 + 92 * Math.sin(a1)).toFixed(1) + 'Z" fill="' + (i % 2 ? '#ff5fa2' : '#6d5efc') + '" stroke="#fff" stroke-width="2"/>';
      sg += p[0] === 'p' ? '<text x="' + x + '" y="' + (y + 6) + '" font-size="20" text-anchor="middle" fill="#fff" font-weight="700">?</text>' : '<use href="#' + (p[0] === 'c' ? 'iCo' : 'iDi') + '" x="' + (x - 10) + '" y="' + (y - 18) + '" width="20" height="20"/><text x="' + x + '" y="' + (y + 14) + '" font-size="13" text-anchor="middle" fill="#fff" font-weight="700">' + p[1] + '</text>';
    });
    xOpen('Reward Wheel', '<div class="center"><svg viewBox="0 0 200 200" width="240" height="240"><g id="wh" style="transform-origin:100px 100px;transition:transform 3.5s cubic-bezier(.15,.7,.2,1);transform:rotate(' + wr + 'deg)">' + sg + '</g><circle cx="100" cy="100" r="9" fill="#fff"/><path d="M92 2h16l-8 20z" fill="#facc15" stroke="#7c5a00" stroke-width="2"/></svg></div><p class="center" id="whRes" style="font-weight:700;min-height:28px"></p><button class="primary" id="whBtn"></button><button class="ghost" id="whAd" style="margin-top:8px">▶ Watch ad for an extra spin</button>');
    $('whAd').onclick = function () { A.rewarded('spin').then(function (ok) { if (ok) { S.spx = (S.spx || 0) + 1; WC.save(); WC.say('+1 extra spin!'); wheelBtns(); } }); };
    wheelBtns();
  };
  function wheelBtns() {
    var b = $('whBtn'); if (!b) return;
    var free = S.wh.d !== WC.dstr(), n = (free ? 1 : 0) + (S.spx || 0); b.disabled = n < 1; b.textContent = n ? 'Spin (' + n + ' left)' : 'No spins left today';
    b.onclick = function () {
      if (b.disabled) return; if (S.wh.d !== WC.dstr()) S.wh = { d: WC.dstr() }; else S.spx--;
      b.disabled = true; var i = ri(6); wr += 1800 + (((360 - (i * 60 + 30) - (wr % 360)) % 360) + 360) % 360; $('wh').style.transform = 'rotate(' + wr + 'deg)'; sfx.click();
      setTimeout(function () {
        var p = WP[i], t; if (p[0] === 'c') { S.co += p[1]; t = '+🪙' + p[1]; } else if (p[0] === 'd') { S.di += p[1]; t = '+💎' + p[1]; } else { var k = pk(g.PU); S.pu[k[0]]++; t = '+ ' + k[2]; }
        if ($('whRes')) $('whRes').innerHTML = rich(t); sfx.lvl(); WC.burst(['✨', '🪙', '💎']); WC.save(); g.wallet(); wheelBtns();
      }, 3600);
    };
  }

  /* ---------- start-up ---------- */
  g.applyTheme(); g.applyMode(); WC.audio.setVolume(S.set.vol);
  function ready() {
    $('load').classList.add('done'); setTimeout(function () { $('load').hidden = true; }, 500);
    g.show('home'); homeUp();
  }
  var tips = ['Tip: answer fast for bonus points!', 'Tip: every 10th level is a boss!', 'Tip: keep a streak for combo ×', 'Tip: collect your daily reward!'];
  $('ltip').textContent = pk(tips);
  C.load().then(ready).catch(function () {
    $('ltip').textContent = 'Could not load the word lists. Open the game from a web address (GitHub Pages), not by double-clicking the file.';
  });
  G.WC.ui = { openM: openM, closeM: closeM, goHome: goHome };
})(window);
