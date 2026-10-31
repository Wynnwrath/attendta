/* ==========================================================================
   AttendTa v2 • ink-seam.js
   "The Ink Seam" — signature strip at the main→footer junction.
   Used by exactly 4 pages: index, account/login, account/register,
   certificates/view. Self-mounting on [data-ink-seam]; no dependencies.
   Ports as the _InkSeam footer partial (container div + ink-seam.css +
   ink-seam.js). Idle layered drift is transform-only CSS; pointer bulge is
   rAF-lerped here. Fully static under prefers-reduced-motion or no-JS
   (no-JS fallback = static gradient painted by ink-seam.css).
   ========================================================================== */
(function () {
  'use strict';

  /* SVG:START */
  var ART =
    '<svg class="ink-seam__art" viewBox="0 0 1440 160" preserveAspectRatio="none" focusable="false">' +
    '<defs>' +
    '<linearGradient id="__ID__-fade" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="#0B1120" stop-opacity="0"/>' +
    '<stop offset="0.55" stop-opacity="0.88" style="stop-color:var(--ink-seam-ground,#F8FAFC)"/>' +
    '<stop offset="1" stop-opacity="1" style="stop-color:var(--ink-seam-ground,#F8FAFC)"/>' +
    '</linearGradient>' +
    '</defs>' +
    '<g class="ink-seam__parallax ink-seam__parallax--deep"><g class="ink-seam__drift ink-seam__drift--deep">' +
    '<path fill="rgba(11,17,32,0.38)" d="M -80 -40 L 1520 -40 L 1520 124 C 1380 140 1240 106 1100 124 C 960 142 820 108 680 126 C 540 144 400 110 260 126 C 120 142 30 118 -80 126 Z"/></g></g>' +
    '<g class="ink-seam__parallax ink-seam__parallax--mid"><g class="ink-seam__drift ink-seam__drift--mid">' +
    '<path fill="rgba(11,17,32,0.72)" d="M -80 -40 L 1520 -40 L 1520 92 C 1400 108 1270 74 1130 92 C 990 110 870 78 730 94 C 590 110 470 76 330 92 C 190 108 90 80 -80 94 Z"/></g></g>' +
    '<g class="ink-seam__parallax ink-seam__parallax--front"><g class="ink-seam__drift ink-seam__drift--front">' +
    '<path class="ink-seam__seal" fill="#0B1120" stroke="#D97706" stroke-opacity="0.9" stroke-width="1" vector-effect="non-scaling-stroke" d="M -80 -40 L 1520 -40 L 1520 58 C 1380 40 1260 76 1120 58 C 980 40 900 74 760 56 C 620 38 540 72 400 55 C 260 38 180 70 40 54 C -20 48 -50 56 -80 50 Z"/></g></g>' +
    '<rect class="ink-seam__fade" x="-80" y="86" width="1600" height="84" fill="url(#__ID__-fade)"/>' +
    '</svg>';
  /* SVG:END */

  var DEPTH = { deep: 0.35, mid: 0.62, front: 1 };
  var uid = 0;

  function reduced() {
    try {
      var raw = window.localStorage.getItem('attendta:v2:prefs');
      if (raw) {
        var prefs = JSON.parse(raw);
        if (prefs && prefs.reducedMotion === true) return true;
      }
    } catch (e) { /* private mode / absent store */ }
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function depthOf(node) {
    var cls = node.getAttribute('class') || '';
    if (cls.indexOf('--front') > -1) return DEPTH.front;
    if (cls.indexOf('--mid') > -1) return DEPTH.mid;
    return DEPTH.deep;
  }

  function mount(el) {
    if (!el || el.getAttribute('data-ink-seam-mounted') === 'true') return;
    el.setAttribute('data-ink-seam-mounted', 'true');
    if (reduced()) el.classList.add('ink-seam--static');
    uid += 1;
    el.insertAdjacentHTML('afterbegin', ART.replace(/__ID__/g, 'ink-seam-' + uid));

    var groups = [];
    var nodes = el.querySelectorAll('.ink-seam__parallax');
    for (var i = 0; i < nodes.length; i++) {
      groups.push({ node: nodes[i], depth: depthOf(nodes[i]), x: 0, y: 0, tx: 0, ty: 0 });
    }
    if (!groups.length) return;

    var raf = 0;

    function frame() {
      raf = 0;
      var settled = true;
      for (var g = 0; g < groups.length; g++) {
        var it = groups[g];
        it.x += (it.tx - it.x) * 0.075;
        it.y += (it.ty - it.y) * 0.075;
        if (Math.abs(it.tx - it.x) > 0.05 || Math.abs(it.ty - it.y) > 0.05) settled = false;
        it.node.style.transform = 'translate(' + it.x.toFixed(2) + 'px,' + it.y.toFixed(2) + 'px)';
      }
      if (!settled) raf = window.requestAnimationFrame(frame);
    }

    function start() {
      if (!raf) raf = window.requestAnimationFrame(frame);
    }

    function aim(e) {
      var r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      var nx = (e.clientX - r.left) / r.width - 0.5;
      var ny = (e.clientY - r.top) / r.height - 0.5;
      for (var g = 0; g < groups.length; g++) {
        var it = groups[g];
        it.tx = nx * 44 * it.depth;
        it.ty = ny * 18 * it.depth;
      }
    }

    var active = false;
    el.addEventListener('pointerenter', function () {
      active = !reduced();
    });
    el.addEventListener('pointermove', function (e) {
      if (!active) return;
      aim(e);
      start();
    });
    el.addEventListener('pointerleave', function () {
      active = false;
      for (var g = 0; g < groups.length; g++) {
        groups[g].tx = 0;
        groups[g].ty = 0;
      }
      start();
    });
  }

  function mountAll() {
    var els = document.querySelectorAll('[data-ink-seam]');
    for (var i = 0; i < els.length; i++) mount(els[i]);
  }

  window.TaInkSeam = { mountAll: mountAll, reduced: reduced };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountAll);
  } else {
    mountAll();
  }
})();
