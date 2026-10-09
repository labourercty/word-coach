/*
 * WORD COACH — SETTINGS YOU CAN EDIT
 * ----------------------------------
 * This is the only file you need to touch to add your own ads and
 * payments. Everything else works without changes.
 *
 * After editing, bump CACHE_VERSION in sw.js (e.g. wc-v1 -> wc-v2) so
 * players' phones download the new files.
 */
window.WC_CONFIG = {

  /* ------------------------------------------------------------------
   * 1) BANNER ADS — three separate spaces on three different screens
   *    Paste your ad network's code (HTML and/or <script>) between the
   *    quote marks (use backticks ` ` so it can span several lines).
   *    Empty = just a reserved space.
   * ------------------------------------------------------------------ */
  ads: {
    // Show a faint "Ad space" box while a slot is empty. Set to false to
    // hide empty slots completely.
    showEmptySlots: true,

    banner: {
      home:   ``,   // BANNER 1 — home screen (below the menu buttons)
      game:   ``,   // BANNER 2 — in-game screen (below the answer buttons)
      result: ``    // BANNER 3 — game-over and shop screens
    },

    /* --------------------------------------------------------------
     * 2) POPUP ADS (full-screen, shown between questions)
     *    First popup after 30 answered questions, then every 20 more.
     *    Never shown to ad-free subscribers.
     * -------------------------------------------------------------- */
    popup: {
      firstAfter: 30,
      every: 20,
      closeAfterSeconds: 4,  // the Close button appears after this delay
      html: ``               // paste your popup ad code here
      // Or, for full control (e.g. an interstitial SDK), define:
      // handler: function (done) { /* show your ad, then call done() */ }
    },

    /* --------------------------------------------------------------
     * 3) REWARDED ADS (optional — player chooses to watch)
     *    Used for: +2 red diamonds, +4 diamonds, extra try after losing,
     *    extra wheel spin. Until you connect a real ad network a short
     *    sample ad is shown so you can test the flow.
     *
     *    To connect your network, define a function that shows the ad and
     *    RETURNS A PROMISE that resolves to true ONLY if the player
     *    watched it to the end:
     *
     *    rewarded: function (kind) {
     *      return new Promise(function (resolve) {
     *        // kind is "red", "dia", "revive" or "spin"
     *        yourAdSdk.showRewardedAd({
     *          onComplete: function () { resolve(true);  },
     *          onSkip:     function () { resolve(false); },
     *          onError:    function () { resolve(false); }
     *        });
     *      });
     *    }
     * -------------------------------------------------------------- */
    rewarded: null,
    sampleAdSeconds: 8,       // length of the built-in sample ad
    // true  = until you connect `rewarded`, a built-in SAMPLE ad is shown and the reward is given (good for testing).
    // false = no reward without a real ad network. Set false before you go live if you have not connected one.
    sampleRewards: true
  },

  /* ------------------------------------------------------------------
   * 4) PRICES (shown in the shop). Change freely.
   * ------------------------------------------------------------------ */
  pay: {
    currency: '₹',
    adFreeMonthly: 99,        // ad-free for 30 days
    redDiamondPacks: [        // real-money packs of red diamonds
      { id: 'rd5',   qty: 5,   price: 49  },
      { id: 'rd15',  qty: 15,  price: 129 },
      { id: 'rd40',  qty: 40,  price: 299 },
      { id: 'rd100', qty: 100, price: 699 }
    ],
    custom: { min: 1, max: 1000, pricePer: 10 },   // "buy as many as you want"

    /* Connect your payment provider here. Define a function that takes a
     * product object and RETURNS A PROMISE resolving to true only after the
     * payment really succeeded:
     *
     *   handler: function (product) {
     *     // product = { id:'rd15', kind:'red', qty:15, price:129, currency:'₹' }
     *     //         or { id:'adfree', kind:'adfree', qty:1, price:99, ... }
     *     return yourPaymentSdk.pay(product).then(function (r) { return r.paid === true; });
     *   }
     *
     * Leave it null until then. Nothing is charged and nothing is given.
     */
    handler: null,

    // TESTING ONLY: true = every purchase succeeds for free. Never ship true.
    demoMode: false
  },

  /* ------------------------------------------------------------------
   * 5) GAME TUNING
   * ------------------------------------------------------------------ */
  game: {
    maxLevel: 9000,
    specialEvery: 40          // a special item every 40 levels, per difficulty
  }
};
