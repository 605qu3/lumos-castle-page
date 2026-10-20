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

  /* An ear that can never hear on this device (20 October 2026, Godric's iPhone: no microphone prompt at all, so the
     password never worked): the microphone refused, Siri and Dictation off, no microphone, the accent not offered,
     or a start Safari will not make. Then `available()` is false for the rest of this browsing session, so the
     castle's spoken things wait for a tap, as with no recognition at all. */
  var DEAF = /^(not-allowed|service-not-allowed|audio-capture|language-not-supported)$/;
  var DEAF_KEY = 'lumos.castle.ear.deaf';
  var deaf = null;
  try { deaf = window.sessionStorage.getItem(DEAF_KEY); } catch (e) {}
  function goDeaf(why) {
    deaf = why;
    try { window.sessionStorage.setItem(DEAF_KEY, why); } catch (e) {}
    if (why === 'not-allowed' && thirdParty()) tell(ADVICE);
  }

  /* Which browser, by its own mark in the user agent (20 October 2026: Godric's iPhone was the DuckDuckGo browser,
     not Safari). On iOS every browser is Safari's web view underneath, and one that is not Safari is never lent the
     microphone unless iOS has given that app the microphone, so its refusal comes as not-allowed with no prompt. */
  var UA = navigator.userAgent || '';
  var IOS = /iPhone|iPad|iPod/.test(UA) || (/Macintosh/.test(UA) && navigator.maxTouchPoints > 1);
  function browser() {
    var marks = [[/Ddg\//, 'DuckDuckGo'], [/CriOS\//, 'Chrome'], [/FxiOS\//, 'Firefox'], [/EdgiOS\//, 'Edge'],
      [/OPT\//, 'Opera'], [/GSA\//, 'the Google app'], [/FBAN|FBAV|Instagram/, 'an app\'s own browser']];
    for (var i = 0; i < marks.length; i++) if (marks[i][0].test(UA)) return marks[i][1];
    if (IOS) return /Safari\//.test(UA) ? 'Safari' : (navigator.standalone ? 'Safari, from a home-screen icon' : 'an app\'s own browser');
    return /Edg\//.test(UA) ? 'Edge' : /Chrome\//.test(UA) ? 'Chrome' : /Firefox\//.test(UA) ? 'Firefox' : /Safari\//.test(UA) ? 'Safari' : 'a browser';
  }
  function thirdParty() { return IOS && !/^Safari/.test(browser()); }
  var ADVICE = 'This browser will not lend the microphone. Open the castle in Safari, or allow the microphone for this browser in Settings.';
  /* One plain line at the foot of the page, a few seconds, once (the deaf mark keeps it from coming again). */
  function tell(text) {
    try {
      var d = document.createElement('div');
      d.className = 'castle-ear-note';
      d.textContent = text;
      d.style.cssText = 'position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;padding:10px 14px;' +
        'background:rgba(20,16,12,.9);color:#f3ead8;font:15px/1.4 Georgia,serif;border-radius:8px;text-align:center;' +
        'transition:opacity .8s';
      document.body.appendChild(d);
      setTimeout(function () { d.style.opacity = '0'; }, 9000);
      setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 10000);
    } catch (e) {}
  }

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
    /* iOS Safari does not always fire onend (after an error, a stop, or from a home-screen icon): each way out ends
       the listening itself a beat later, so the thing listening always hears its end and the Fat Lady can give in
       (20 October 2026: on the iPad she asked for ever). */
    var GRACE_MS = 1500;
    function closeSoon() { setTimeout(function () { try { rec.abort(); } catch (e) {} finish(why || 'end'); }, GRACE_MS); }
    rec.onerror = function (e) { why = 'error ' + e.error; if (DEAF.test(e.error)) goDeaf(e.error); closeSoon(); };
    rec.onend = function () { finish(why || 'end'); };
    var timer = setTimeout(function () { why = why || 'timeout'; try { rec.stop(); } catch (e) { finish(why); } closeSoon(); }, (opts.seconds || ear.SECONDS) * 1000);
    try { rec.start(); } catch (e) { if (e.name !== 'InvalidStateError') goDeaf(e.name || 'start'); finish('error ' + (e.name || 'start')); }
    return { stop: function () { why = why || 'stopped'; try { rec.stop(); } catch (e) { finish(why); } closeSoon(); } };
  }

  var ear = {
    LOOSE: 0.6,          /* provisional: the probe sets it */
    LANG: 'en-GB',       /* provisional: the probe sets it */
    SECONDS: 8,          /* how long one tap's listening lasts at most */
    available: function () { return !!SR && !deaf; },
    deaf: function () { return deaf; },
    browser: browser,
    thirdParty: thirdParty,
    ADVICE: ADVICE,
    near: near,
    match: match,
    listen: listen
  };
  window.CastleEar = ear;
})();
