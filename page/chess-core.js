/* The castle's chess core, a plain stand-in (req 922, the Architect's hundred-fourteenth, 22 October 2026; Fawkes
   15:10's word): one seam, `window.lumosChess`, for both boards (the giant board in stone-chess-chamber now, the common
   room's round table later). Godric's Rookery core replaces this file whole when it comes into the archive; whatever
   replaces it exposes the same calls, and the pages call nothing else:

     lumosChess.create()            a new game, white to move, the usual start
     game.pieces()                  [{ sq: 'e2', side: 'white' | 'black', kind: 'p' | 'n' | 'b' | 'r' | 'q' | 'k' }]
     game.turn()                    'white' | 'black'
     game.moves(sq)                 the legal moves from that square, each as game.move returns them
     game.move(from, to)            plays a legal move (a pawn reaching the far rank becomes a queen) and returns
                                    { from, to, side, kind, taken: { sq, side, kind } | null, rook: { from, to } | null,
                                      queen: true when promoted }, or null when it is not legal
     game.danger(from, to)          true when, after that move, the other side could take the piece on `to`
     game.status()                  'play' | 'checkmate' | 'stalemate' | 'draw' (fifty moves, threefold, bare kings)
     game.best(level)               the move it would play for the side to move, { from, to }; level 1 to 4

   Here: a legal-move generator (castling, en passant, a queen on promotion) and a small search, material and a
   little of the centre, deeper at each level, with a pinch of chance at the low ones. Nothing here draws. */
(function () {
  var FILES = 'abcdefgh', VAL = { p: 100, n: 300, b: 320, r: 500, q: 900, k: 0 };
  var KN = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]];
  var KG = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
  var DIAG = [[1, 1], [1, -1], [-1, 1], [-1, -1]], LINE = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  function idx(sq) { return (+sq[1] - 1) * 8 + FILES.indexOf(sq[0]); }
  function name(i) { return FILES[i % 8] + (Math.floor(i / 8) + 1); }
  function other(c) { return c === 'w' ? 'b' : 'w'; }

  function create() {
    var B = new Array(64), turn = 'w', castle = { wk: true, wq: true, bk: true, bq: true }, ep = -1, quiet = 0, seen = {};
    'rnbqkbnr'.split('').forEach(function (k, f) {
      B[f] = { c: 'w', k: k }; B[8 + f] = { c: 'w', k: 'p' }; B[48 + f] = { c: 'b', k: 'p' }; B[56 + f] = { c: 'b', k: k };
    });
    function key() { return B.map(function (p) { return p ? (p.c === 'w' ? p.k.toUpperCase() : p.k) : '.'; }).join('') + turn + ep; }
    seen[key()] = 1;

    function attacked(i, by) {   /* is square i attacked by side `by` */
      var f = i % 8, r = Math.floor(i / 8), d, k, p, ff, rr;
      var pr = by === 'w' ? r - 1 : r + 1;
      for (d = -1; d <= 1; d += 2) { ff = f + d; if (ff >= 0 && ff < 8 && pr >= 0 && pr < 8) { p = B[pr * 8 + ff]; if (p && p.c === by && p.k === 'p') return true; } }
      for (k = 0; k < 8; k++) {
        ff = f + KN[k][0]; rr = r + KN[k][1]; if (ff >= 0 && ff < 8 && rr >= 0 && rr < 8) { p = B[rr * 8 + ff]; if (p && p.c === by && p.k === 'n') return true; }
        ff = f + KG[k][0]; rr = r + KG[k][1]; if (ff >= 0 && ff < 8 && rr >= 0 && rr < 8) { p = B[rr * 8 + ff]; if (p && p.c === by && p.k === 'k') return true; }
      }
      function ray(dirs, kinds) {
        for (var j = 0; j < dirs.length; j++) {
          var x = f + dirs[j][0], y = r + dirs[j][1];
          while (x >= 0 && x < 8 && y >= 0 && y < 8) {
            var q = B[y * 8 + x];
            if (q) { if (q.c === by && kinds.indexOf(q.k) >= 0) return true; break; }
            x += dirs[j][0]; y += dirs[j][1];
          }
        }
        return false;
      }
      return ray(DIAG, 'bq') || ray(LINE, 'rq');
    }
    function kingAt(c) { for (var i = 0; i < 64; i++) if (B[i] && B[i].c === c && B[i].k === 'k') return i; return -1; }
    function pseudo(c) {
      var out = [], i, p, f, r, k, ff, rr, t, dir, start;
      function add(a, b) { out.push({ a: a, b: b }); }
      for (i = 0; i < 64; i++) {
        p = B[i]; if (!p || p.c !== c) continue;
        f = i % 8; r = Math.floor(i / 8);
        if (p.k === 'p') {
          dir = c === 'w' ? 1 : -1; start = c === 'w' ? 1 : 6; rr = r + dir;
          if (rr >= 0 && rr < 8 && !B[rr * 8 + f]) { add(i, rr * 8 + f); if (r === start && !B[(r + 2 * dir) * 8 + f]) add(i, (r + 2 * dir) * 8 + f); }
          for (k = -1; k <= 1; k += 2) {
            ff = f + k; if (ff < 0 || ff > 7 || rr < 0 || rr > 7) continue;
            t = rr * 8 + ff; if ((B[t] && B[t].c !== c) || t === ep) add(i, t);
          }
        } else if (p.k === 'n' || p.k === 'k') {
          var J = p.k === 'n' ? KN : KG;
          for (k = 0; k < 8; k++) { ff = f + J[k][0]; rr = r + J[k][1]; if (ff >= 0 && ff < 8 && rr >= 0 && rr < 8) { t = rr * 8 + ff; if (!B[t] || B[t].c !== c) add(i, t); } }
          if (p.k === 'k' && f === 4 && r === (c === 'w' ? 0 : 7) && !attacked(i, other(c))) {
            var base = r * 8;
            if (castle[c + 'k'] && !B[base + 5] && !B[base + 6] && B[base + 7] && B[base + 7].k === 'r' && !attacked(base + 5, other(c))) add(i, base + 6);
            if (castle[c + 'q'] && !B[base + 3] && !B[base + 2] && !B[base + 1] && B[base] && B[base].k === 'r' && !attacked(base + 3, other(c))) add(i, base + 2);
          }
        } else {
          var dirs = p.k === 'b' ? DIAG : p.k === 'r' ? LINE : DIAG.concat(LINE);
          for (k = 0; k < dirs.length; k++) {
            ff = f + dirs[k][0]; rr = r + dirs[k][1];
            while (ff >= 0 && ff < 8 && rr >= 0 && rr < 8) {
              t = rr * 8 + ff; if (B[t]) { if (B[t].c !== c) add(i, t); break; }
              add(i, t); ff += dirs[k][0]; rr += dirs[k][1];
            }
          }
        }
      }
      return out;
    }
    /* play a move on the board, returning what undoes it */
    function make(a, b) {
      var p = B[a], u = { a: a, b: b, p: p, cap: B[b], capAt: b, ep: ep, castle: Object.assign({}, castle), quiet: quiet, turn: turn, rook: null, queen: false };
      if (p.k === 'p' && b === ep && !B[b]) { u.capAt = b + (p.c === 'w' ? -8 : 8); u.cap = B[u.capAt]; B[u.capAt] = null; }
      B[b] = p; B[a] = null;
      if (p.k === 'k' && Math.abs(b - a) === 2) {
        var rf = b > a ? a + 3 : a - 4, rt = b > a ? a + 1 : a - 1; B[rt] = B[rf]; B[rf] = null; u.rook = { a: rf, b: rt };
      }
      if (p.k === 'p' && (b < 8 || b >= 56)) { B[b] = { c: p.c, k: 'q' }; u.queen = true; }
      ep = p.k === 'p' && Math.abs(b - a) === 16 ? (a + b) / 2 : -1;
      if (p.k === 'k') castle[p.c + 'k'] = castle[p.c + 'q'] = false;
      [[0, 'wq'], [7, 'wk'], [56, 'bq'], [63, 'bk']].forEach(function (c) { if (a === c[0] || b === c[0]) castle[c[1]] = false; });
      quiet = p.k === 'p' || u.cap ? 0 : quiet + 1;
      turn = other(turn);
      return u;
    }
    function unmake(u) {
      B[u.a] = u.p; B[u.b] = null; if (u.cap) B[u.capAt] = u.cap;
      if (u.rook) { B[u.rook.a] = B[u.rook.b]; B[u.rook.b] = null; }
      ep = u.ep; castle = u.castle; quiet = u.quiet; turn = u.turn;
    }
    function legal(c) {
      return pseudo(c).filter(function (m) { var u = make(m.a, m.b), ok = !attacked(kingAt(c), other(c)); unmake(u); return ok; });
    }
    function bare() {
      var rest = B.filter(function (p) { return p && p.k !== 'k'; });
      return !rest.length || (rest.length === 1 && (rest[0].k === 'n' || rest[0].k === 'b'));
    }
    function status() {
      if (!legal(turn).length) return attacked(kingAt(turn), other(turn)) ? 'checkmate' : 'stalemate';
      if (quiet >= 100 || bare() || (seen[key()] || 0) >= 3) return 'draw';
      return 'play';
    }
    /* the search: material, a little centre for the knights and bishops, pawns pressing on */
    function score(c) {
      var s = 0;
      for (var i = 0; i < 64; i++) {
        var p = B[i]; if (!p) continue;
        var f = i % 8, r = Math.floor(i / 8), v = VAL[p.k];
        if (p.k === 'n' || p.k === 'b') v += 12 - 3 * (Math.abs(3.5 - f) + Math.abs(3.5 - r));
        if (p.k === 'p') v += 6 * (p.c === 'w' ? r - 1 : 6 - r) - 4 * Math.abs(3.5 - f);
        s += p.c === c ? v : -v;
      }
      return s;
    }
    function search(depth, alpha, beta) {
      var ms = legal(turn);
      if (!ms.length) return attacked(kingAt(turn), other(turn)) ? -100000 - depth : 0;
      if (depth === 0) return score(turn);
      ms.sort(function (x, y) { return (B[y.b] ? VAL[B[y.b].k] : 0) - (B[x.b] ? VAL[B[x.b].k] : 0); });
      for (var i = 0; i < ms.length; i++) {
        var u = make(ms[i].a, ms[i].b), v = -search(depth - 1, -beta, -alpha); unmake(u);
        if (v >= beta) return beta;
        if (v > alpha) alpha = v;
      }
      return alpha;
    }
    function detail(u) {
      return { from: name(u.a), to: name(u.b), side: u.p.c === 'w' ? 'white' : 'black', kind: u.p.k,
               taken: u.cap ? { sq: name(u.capAt), side: u.cap.c === 'w' ? 'white' : 'black', kind: u.cap.k } : null,
               rook: u.rook ? { from: name(u.rook.a), to: name(u.rook.b) } : null, queen: u.queen };
    }

    return {
      pieces: function () {
        var out = [];
        for (var i = 0; i < 64; i++) if (B[i]) out.push({ sq: name(i), side: B[i].c === 'w' ? 'white' : 'black', kind: B[i].k });
        return out;
      },
      turn: function () { return turn === 'w' ? 'white' : 'black'; },
      moves: function (sq) {
        var a = idx(sq);
        return legal(turn).filter(function (m) { return m.a === a; }).map(function (m) { var u = make(m.a, m.b), d = detail(u); unmake(u); return d; });
      },
      move: function (from, to) {
        var a = idx(from), b = idx(to);
        if (!legal(turn).some(function (m) { return m.a === a && m.b === b; })) return null;
        var d = detail(make(a, b)), k = key(); seen[k] = (seen[k] || 0) + 1;
        return d;
      },
      danger: function (from, to) {
        var a = idx(from), b = idx(to), hit = false;
        if (!legal(turn).some(function (m) { return m.a === a && m.b === b; })) return false;
        var u = make(a, b);
        hit = legal(turn).some(function (m) { return m.b === b; });
        unmake(u);
        return hit;
      },
      status: status,
      best: function (level) {
        level = Math.max(1, Math.min(4, level || 2));
        var depth = [1, 2, 3, 3][level - 1], wobble = [90, 35, 10, 0][level - 1], ms = legal(turn), best = null, bv = -Infinity;
        ms.forEach(function (m) {
          var u = make(m.a, m.b), v = -search(depth - 1, -Infinity, Infinity) + Math.random() * wobble; unmake(u);
          if (v > bv) { bv = v; best = m; }
        });
        return best ? { from: name(best.a), to: name(best.b) } : null;
      }
    };
  }
  window.lumosChess = { create: create, core: 'stand-in' };
})();
