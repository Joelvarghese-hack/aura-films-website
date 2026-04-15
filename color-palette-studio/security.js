/* Color Palette Studio © 2026 Joel Varghese. All rights reserved.
   Unauthorized copying or distribution is prohibited. */

/**
 * security.js — Client-side deterrence measures
 *
 * HONEST DISCLAIMER (for maintainers):
 * These measures are deterrence only — not true security.
 * Since this is a client-side app, a determined developer can bypass
 * all of the following. The intent is to discourage casual copying and
 * to communicate that this is a protected work. Real security for paid
 * features would require a server-side authentication layer.
 */

(function () {
  'use strict';

  // ─── CONSOLE WARNING ──────────────────────────────────────────────────────
  // Styled message to anyone who opens DevTools

  console.log(
    '%c Stop! %c This is a protected application.\n' +
    'Color Palette Studio © 2026 Joel Varghese. All rights reserved.\n' +
    'Unauthorized reproduction or distribution is prohibited.\n\n' +
    'If you\'re a developer and found a bug, reach out: joelvarghese@email.com',
    'background:#1a1a1a; color:#ffffff; font-size:18px; font-weight:bold; padding:8px 16px; border-radius:4px;',
    'color:#4a4a4a; font-size:13px; padding:4px 0;'
  );

  // ─── RIGHT-CLICK OVERRIDE ─────────────────────────────────────────────────
  // Replace the default context menu with a polite copyright notice.
  // Inputs and textareas are excluded so they retain normal right-click behaviour.

  document.addEventListener('contextmenu', e => {
    const tag = e.target.tagName.toLowerCase();
    // Allow right-click on inputs for paste etc.
    if (['input', 'textarea', 'select'].includes(tag)) return;

    e.preventDefault();

    const menu = document.getElementById('custom-context-menu');
    if (!menu) return;

    // Position near cursor, keeping within viewport
    const x = Math.min(e.clientX, window.innerWidth - 260);
    const y = Math.min(e.clientY, window.innerHeight - 120);
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    menu.style.display = 'block';

    // Dismiss button
    const dismiss = document.getElementById('context-dismiss');
    if (dismiss) {
      dismiss.onclick = () => { menu.style.display = 'none'; };
    }
  });

  // Hide custom context menu on any outside click
  document.addEventListener('click', () => {
    const menu = document.getElementById('custom-context-menu');
    if (menu) menu.style.display = 'none';
  });

  // ─── DRAG PREVENTION ──────────────────────────────────────────────────────
  // Prevent dragging of images and non-input UI elements.

  document.addEventListener('dragstart', e => {
    const tag = e.target.tagName.toLowerCase();
    if (['img', 'svg', 'div', 'span', 'button', 'canvas'].includes(tag)) {
      e.preventDefault();
      return false;
    }
  });

  // ─── DEVTOOLS DETECTION ───────────────────────────────────────────────────
  // Heuristic-based detection: checks for window size anomalies typical of
  // open DevTools. NOTE: This is imprecise — false positives exist.
  // A floating watermark is shown; it does NOT break the app.

  let _devToolsOpen = false;

  function checkDevTools() {
    // Skip if running inside an iframe (preview panes, embeds) or if innerWidth is
    // very narrow — in those cases outerWidth vs innerWidth is always large and
    // not indicative of DevTools being open.
    if (window !== window.top) return;
    if (window.innerWidth < 600) return;
    const threshold = 160;
    const widthDiff = window.outerWidth - window.innerWidth > threshold;
    const heightDiff = window.outerHeight - window.innerHeight > threshold;

    if (widthDiff || heightDiff) {
      if (!_devToolsOpen) {
        _devToolsOpen = true;
        showDevToolsWatermark();
      }
    } else {
      if (_devToolsOpen) {
        _devToolsOpen = false;
        removeDevToolsWatermark();
      }
    }
  }

  function showDevToolsWatermark() {
    if (document.getElementById('cps-wm')) return;
    const wm = document.createElement('div');
    wm.id = 'cps-wm';
    wm.className = 'devtools-watermark';
    wm.setAttribute('aria-hidden', 'true');
    // Tiled watermark text
    const text = '© 2026 Joel Varghese — Color Palette Studio — Protected  ';
    wm.textContent = Array(20).fill(text).join('');
    document.body.appendChild(wm);
  }

  function removeDevToolsWatermark() {
    const wm = document.getElementById('cps-wm');
    if (wm) wm.remove();
  }

  // Poll every 1.5 seconds
  setInterval(checkDevTools, 1500);

  // ─── META TAGS (already in HTML) ──────────────────────────────────────────
  // <meta name="robots" content="noindex, nofollow"> is in index.html
  // Remove when ready to launch.

})();
