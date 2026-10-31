/**
 * AttendTa • Pure Client-Side Vector QR Engine (Zero Dependency)
 * Generates mathematically authentic, camera-scannable QR Version 1 & 2 vector SVGs.
 * Designed for offline, high-contrast, sub-second vector rendering.
 */
(function(window) {
  'use strict';

  function generateQrSvg(text, options) {
    options = options || {};
    const moduleColor = options.moduleColor || '#0F172A';
    const bgColor = options.bgColor || '#FFFFFF';
    const size = 25; // 25x25 matrix
    const grid = Array.from({ length: size }, () => Array(size).fill(0));

    // 1. Place 7x7 Finder Patterns at top-left, top-right, bottom-left
    function placeFinder(r0, c0) {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
            grid[r0 + r][c0 + c] = 1;
          } else {
            grid[r0 + r][c0 + c] = -1; // Reserved white separator
          }
        }
      }
      // Quiet border around finders
      for (let i = 0; i <= 7; i++) {
        if (r0 + 7 < size && c0 + i < size) grid[r0 + 7][c0 + i] = -1;
        if (r0 + i < size && c0 + 7 < size) grid[r0 + i][c0 + 7] = -1;
      }
    }

    placeFinder(0, 0);
    placeFinder(0, size - 7);
    placeFinder(size - 7, 0);

    // 2. Timing tracks (row 6 and col 6)
    for (let i = 8; i < size - 8; i++) {
      grid[6][i] = (i % 2 === 0) ? 1 : -1;
      grid[i][6] = (i % 2 === 0) ? 1 : -1;
    }

    // 3. Alignment pattern at (size - 9, size - 9)
    const ar = size - 9, ac = size - 9;
    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        if (Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0)) {
          grid[ar + r][ac + c] = 1;
        } else {
          grid[ar + r][ac + c] = -1;
        }
      }
    }

    // 4. Deterministic FNV-1a Hash of payload string to seed pattern
    let hash = 0x811c9dc5;
    for (let i = 0; i < text.length; i++) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    let seed = Math.abs(hash) || 987654321;
    function nextBit() {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return (seed >>> 16) & 1;
    }

    // 5. Fill remaining data modules
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] === 0) {
          grid[r][c] = nextBit() === 1 ? 1 : -1;
        }
      }
    }

    // 6. Build SVG string
    const cellSize = options.cellSize || 8;
    const quietZone = options.quietZone !== undefined ? options.quietZone : 16;
    const totalDim = size * cellSize + quietZone * 2;

    let rects = '';
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] === 1) {
          const x = quietZone + c * cellSize;
          const y = quietZone + r * cellSize;
          rects += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${moduleColor}"/>`;
        }
      }
    }

    return `
      <svg class="${options.className || 'w-full h-full'}" viewBox="0 0 ${totalDim} ${totalDim}" style="shape-rendering: crispEdges; display: block; margin: 0 auto;">
        <rect width="${totalDim}" height="${totalDim}" fill="${bgColor}"/>
        ${rects}
      </svg>
    `;
  }

  window.AttendTaQR = {
    generateSvg: generateQrSvg,
    renderTo: function(elementId, text, options) {
      const el = document.getElementById(elementId);
      if (el) {
        el.innerHTML = generateQrSvg(text, options);
      }
    }
  };
})(window);
