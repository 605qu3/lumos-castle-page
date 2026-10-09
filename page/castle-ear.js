/* The castle's forgiving ear: Safari's speech recognition, opened only by a tap, for the spoken things in the castle
   (a `say` in the event files, as please at the polite door; the Fat Lady's password on the corridor page).

   It only hears. `listen()` must be called inside the tap's own handler, since iOS starts recognition only from a
   user's gesture; it hands every guess as it lands (interim and final, up to ten alternatives with their confidence)
   and says why it ended (`end`, `timeout`, `stopped`, or `error <name>` as Safari names it). Whether a guess is
   near enough is `match()`: the speech probe's nearness (page/probe-speech.html, letters only, one minus the edit
   distance over the longer length), taken at its best over every run of the target's own word count in the guess
   and over the whole, so "please open the door" holds please. How loose is `LOOSE`, provisional at 0.6 with the
   accent `LANG` en-GB, until the probe is run on the iPad (9 October 2026). With no recognition in the
   browser, `available()` is false and the castle's spoken things wait for a tap instead. */
(function () {
  'use strict';

  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  function norm(s) { return String(s || '').toLowerCase().replace(/[^a-z]/g, ''); }
  /* the probe's nearness, kept word for word so its measurements calibrate this one */
  function near(a, b) {
    a = norm(a); b = norm(b);
    if (!a.length || !b.length) return 0;
    var prev = [], cur = [], i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      cur = [i];
      for (j = 1; j <= b.length; j++)
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return 1 - prev[b.length] / Math.max(a.length, b.length);
  }

  /* How near a guess comes to the words wanted: the best of the whole guess and of every run of as many words. */
  function match(guess, target) {
    var words = String(guess || '').toLowerCase().split(/\s+/).filter(function (w) { return norm(w).length; });
    var n = String(target || '').split(/\s+/).filter(function (w) { return norm(w).length; }).length || 1;
    var best = near(guess, target);
    for (var i = 0; i + n <= words.length; i++) best = Math.max(best, near(words.slice(i, i + n).join(' '), target));
    return best;
  }

  /* Listen once, until he stops speaking or `seconds` pass. opts: onHeard(guesses, final), onEnd(why), seconds. */
  function listen(opts) {
    opts = opts || {};
    var onHeard = opts.onHeard || function () {}, onEnd = opts.onEnd || function () {};
    if (!SR) { onEnd('error not-available'); return { stop: function () {} }; }
    var rec = new SR(), ended = false, why = null;
    rec.lang = ear.LANG;
    rec.interimResults = true;
    rec.maxAlternatives = 10;
    rec.continuous = false;
    function finish(w) { if (ended) return; ended = true; clearTimeout(timer); onEnd(w); }
    rec.onresult = function (e) {
      for (var i = e.resultIndex; i < e.results.length; i++) {
        var r = e.results[i], guesses = [];
        for (var k = 0; k < r.length; k++) guesses.push({ text: r[k].transcript, confidence: r[k].confidence || 0 });
        onHeard(guesses, !!r.isFinal);
      }
    };
    rec.onerror = function (e) { why = 'error ' + e.error; };
    rec.onend = function () { finish(why || 'end'); };
    var timer = setTimeout(function () { why = why || 'timeout'; try { rec.stop(); } catch (e) { finish(why); } }, (opts.seconds || ear.SECONDS) * 1000);
    try { rec.start(); } catch (e) { finish('error ' + (e.name || 'start')); }
    return { stop: function () { why = why || 'stopped'; try { rec.stop(); } catch (e) { finish(why); } } };
  }

  var ear = {
    LOOSE: 0.6,          /* provisional: the probe sets it */
    LANG: 'en-GB',       /* provisional: the probe sets it */
    SECONDS: 8,          /* how long one tap's listening lasts at most */
    available: function () { return !!SR; },
    near: near,
    match: match,
    listen: listen
  };
  window.CastleEar = ear;
})();
