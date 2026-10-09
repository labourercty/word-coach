/* ads.js — banner slots, popup ad, rewarded ads, payments. Your code goes in config.js */
(function (G) {
  'use strict';
  var WC = G.WC, S = WC.S, CF = G.WC_CONFIG, $ = WC.$, A = WC.ads = {};
  A.adfree = function () { return S.adfree > Date.now(); };

  function inject(box, html) {
    box.innerHTML = '';
    try {
      var f = document.createRange().createContextualFragment(html);   // runs <script> tags too
      box.appendChild(f);
    } catch (e) { box.textContent = ''; }
  }
  A.render = function () {
    var free = A.adfree();
    Array.prototype.forEach.call(document.querySelectorAll('.adslot'), function (el) {
      var name = el.getAttribute('data-slot'), code = (CF.ads.banner || {})[name] || '';
      if (free) { el.hidden = true; el.innerHTML = ''; return; }
      if (!code && !CF.ads.showEmptySlots) { el.hidden = true; return; }
      el.hidden = false;
      if (el.getAttribute('data-done') === code && code) return;     // don't reload a live ad on every screen change
      el.setAttribute('data-done', code);
      if (code) inject(el, code);
      else el.innerHTML = '<div class="adph">Ad space · banner "' + name + '"</div>';
    });
  };

  /* ---- popup ad: after 30 answers, then every 20 ---- */
  var answered = 0;
  A.count = function () { answered++; };
  A.due = function () {
    if (A.adfree()) return false;
    var p = CF.ads.popup;
    return answered >= p.firstAfter && (answered - p.firstAfter) % p.every === 0 && A.lastShown !== answered;
  };
  A.popup = function (done) {
    A.lastShown = answered;
    var p = CF.ads.popup;
    if (typeof p.handler === 'function') { try { p.handler(function () { done(); }); } catch (e) { done(); } return; }
    if (!p.html && !CF.ads.showEmptySlots) { done(); return; }
    var m = $('popModal'), box = $('popBox'), btn = $('popClose'), left = p.closeAfterSeconds || 0, t;
    if (p.html) inject(box, p.html); else box.innerHTML = '<div class="adph" style="height:220px">Popup ad space<br><small>paste your code in config.js</small></div>';
    m.hidden = false; btn.disabled = true;
    function end() { clearInterval(t); m.hidden = true; box.innerHTML = ''; done(); }
    function upd() { btn.textContent = left > 0 ? 'Close in ' + left + 's' : '✕ Close'; btn.disabled = left > 0; }
    upd();
    t = setInterval(function () { left--; upd(); if (left <= 0) clearInterval(t); }, 1000);
    btn.onclick = end;
  };

  /* ---- rewarded ads (always optional) ---- */
  A.rewarded = function (kind) {
    if (typeof CF.ads.rewarded === 'function') {
      return new Promise(function (res) { try { CF.ads.rewarded(kind).then(res, function () { res(false); }); } catch (e) { res(false); } });
    }
    if (!CF.ads.sampleRewards) { WC.say('Ads are not available right now'); return Promise.resolve(false); }
    return new Promise(function (res) {
      var m = $('adModal'), bar = $('adBar'), claim = $('adClaim'), back = $('adClose'), secs = CF.ads.sampleAdSeconds || 8, t0 = Date.now(), iv;
      $('adTxt').textContent = 'Sample ad · connect your own rewarded ads in config.js';
      m.hidden = false; claim.disabled = true; bar.style.width = '0%';
      function fin(v) { clearInterval(iv); m.hidden = true; res(v); }
      iv = setInterval(function () {
        var f = Math.min(1, (Date.now() - t0) / (secs * 1000));
        bar.style.width = (f * 100) + '%';
        claim.textContent = f < 1 ? 'Wait ' + Math.ceil(secs * (1 - f)) + 's…' : '🎁 Claim reward';
        claim.disabled = f < 1;
      }, 100);
      claim.onclick = function () { fin(true); };
      back.onclick = function () { fin(false); };
    });
  };

  /* ---- payments ---- */
  A.pay = function (prod) {
    var P = CF.pay;
    prod.currency = P.currency;
    if (typeof P.handler === 'function') {
      return new Promise(function (res) { try { P.handler(prod).then(function (v) { res(v === true); }, function () { res(false); }); } catch (e) { res(false); } });
    }
    if (P.demoMode) return Promise.resolve(true);
    return Promise.resolve(false);
  };
})(window);
