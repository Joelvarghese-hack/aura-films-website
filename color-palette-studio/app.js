/* Color Palette Studio © 2026 Joel Varghese. All rights reserved.
   Unauthorized copying or distribution is prohibited. */

/**
 * app.js — Main application controller
 * Handles all UI, state, and feature logic.
 * Depends on: colorUtils.js (must load first)
 */

(function () {
  'use strict';

  // ═══════════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════════

  const COLOR_ROLES = [
    '—', 'Primary', 'Secondary', 'Accent', 'Neutral',
    'Background', 'Surface', 'Text', 'Error', 'Warning', 'Success',
  ];

  let state = {
    palette: [],          // Array of { id, hex, role }
    selectedId: null,     // ID of currently selected palette card
    currentHex: '#3B82F6', // Color shown in sidebar inputs
    nextId: 1,
    activeTab: 'builder',
    selectedGenType: 'random',
  };

  // Freemium usage counters (stored in localStorage)
  const USAGE_KEYS = {
    contrast: 'cps_contrast_uses',
    cbsim: 'cps_cbsim_uses',
    export: 'cps_export_uses',
  };
  const FREE_LIMIT = 3;

  function getUsage(key) {
    return parseInt(localStorage.getItem(USAGE_KEYS[key]) || '0', 10);
  }
  function incrementUsage(key) {
    const n = getUsage(key) + 1;
    localStorage.setItem(USAGE_KEYS[key], n);
    return n;
  }

  // ═══════════════════════════════════════════════════════════════
  // DOM REFS
  // ═══════════════════════════════════════════════════════════════

  const $ = id => document.getElementById(id);
  const $$ = sel => document.querySelectorAll(sel);

  const els = {
    // Sidebar
    selectedSwatch:   $('selected-swatch'),
    selectedHex:      $('selected-hex'),
    selectedLabel:    $('selected-label'),
    nativePicker:     $('native-picker'),
    hexInput:         $('hex-input'),
    rgbR:             $('rgb-r'),
    rgbG:             $('rgb-g'),
    rgbB:             $('rgb-b'),
    hslH:             $('hsl-h'),
    hslS:             $('hsl-s'),
    hslL:             $('hsl-l'),
    hslHVal:          $('hsl-h-val'),
    hslSVal:          $('hsl-s-val'),
    hslLVal:          $('hsl-l-val'),
    uploadZone:       $('image-upload-zone'),
    fileInput:        $('image-file-input'),
    imgCanvas:        $('image-canvas'),
    extractedColors:  $('extracted-colors'),
    btnAddColor:      $('btn-add-color'),

    // Builder
    colorCards:       $('color-cards'),
    emptyState:       $('empty-state'),
    colorCountLabel:  $('color-count-label'),
    paletteStrip:     $('palette-strip'),
    shadesSection:    $('shades-section'),
    shadesGrid:       $('shades-grid'),

    // Analysis
    contrastPairs:    $('contrast-pairs'),
    issuesList:       $('issues-list'),
    issuesCount:      $('issues-count'),
    cbsimGrid:        $('cbsim-grid'),
    metricsGrid:      $('metrics-grid'),
    tempIndicator:    $('temp-indicator'),
    moodBadge:        $('mood-badge'),
    harmonySelect:    $('harmony-select'),
    harmonyResult:    $('harmony-result'),

    // Preview
    uiMockLight:      $('ui-mock-light'),
    uiMockDark:       $('ui-mock-dark'),

    // Export (previewable)
    exportCss:        $('export-css'),
    exportScss:       $('export-scss'),
    exportJson:       $('export-json'),
    exportTailwind:   $('export-tailwind'),
    exportFigma:      $('export-figma'),
    exportCanvas:     $('export-canvas'),
    exportPngPreview: $('export-png-preview'),

    // History
    historyList:      $('history-list'),
    historyEmpty:     $('history-empty'),
    btnClearHistory:  $('btn-clear-history'),

    // Modals
    modalGenerate:    $('modal-generate'),
    modalPro:         $('modal-pro'),
    contextMenu:      $('custom-context-menu'),

    // Buttons
    btnGenerate:      $('btn-generate'),
    btnTryPro:        $('btn-try-pro'),
  };

  // ═══════════════════════════════════════════════════════════════
  // COLOR SYNC — Bidirectional input sync
  // ═══════════════════════════════════════════════════════════════

  let _syncLock = false; // prevent feedback loops

  /** Update all sidebar inputs from a hex string */
  function syncInputsFromHex(hex, { skipNative = false } = {}) {
    if (_syncLock) return;
    _syncLock = true;

    const rgb = ColorUtils.hexToRgb(hex);
    if (!rgb) { _syncLock = false; return; }
    const hsl = ColorUtils.rgbToHsl(rgb.r, rgb.g, rgb.b);

    state.currentHex = hex.startsWith('#') ? hex : '#' + hex;
    const displayHex = hex.replace('#', '').toUpperCase();

    els.hexInput.value = displayHex;
    els.rgbR.value = rgb.r;
    els.rgbG.value = rgb.g;
    els.rgbB.value = rgb.b;
    els.hslH.value = hsl.h;
    els.hslS.value = hsl.s;
    els.hslL.value = hsl.l;
    els.hslHVal.value = hsl.h;
    els.hslSVal.value = hsl.s;
    els.hslLVal.value = hsl.l;
    if (!skipNative) els.nativePicker.value = state.currentHex.toLowerCase();

    // Update selected swatch display
    els.selectedSwatch.style.background = state.currentHex;
    els.selectedHex.textContent = '#' + displayHex;

    // Update hue slider gradient for S and L sliders
    updateSliderGradients(hsl.h, hsl.s, hsl.l);

    _syncLock = false;
  }

  function updateSliderGradients(h, s, l) {
    // Saturation slider: grey to full color
    els.hslS.style.background = `linear-gradient(to right, hsl(${h},0%,${l}%), hsl(${h},100%,${l}%))`;
    // Lightness slider: black → color → white
    els.hslL.style.background = `linear-gradient(to right, hsl(${h},${s}%,0%), hsl(${h},${s}%,50%), hsl(${h},${s}%,100%))`;
  }

  // Hex input
  els.hexInput.addEventListener('input', () => {
    const val = els.hexInput.value.replace(/[^0-9a-fA-F]/g, '').toUpperCase();
    els.hexInput.value = val;
    if (val.length === 6) {
      syncInputsFromHex('#' + val);
      if (state.selectedId) updateCardColor(state.selectedId, '#' + val);
      renderAll();
    }
  });

  // Native picker
  els.nativePicker.addEventListener('input', () => {
    syncInputsFromHex(els.nativePicker.value, { skipNative: true });
    if (state.selectedId) updateCardColor(state.selectedId, state.currentHex);
    renderAll();
  });

  // RGB inputs
  [els.rgbR, els.rgbG, els.rgbB].forEach(input => {
    input.addEventListener('input', () => {
      const r = clamp(parseInt(els.rgbR.value) || 0, 0, 255);
      const g = clamp(parseInt(els.rgbG.value) || 0, 0, 255);
      const b = clamp(parseInt(els.rgbB.value) || 0, 0, 255);
      const hex = ColorUtils.rgbToHex(r, g, b);
      syncInputsFromHex(hex);
      if (state.selectedId) updateCardColor(state.selectedId, hex);
      renderAll();
    });
  });

  // HSL sliders and number inputs
  function onHslChange() {
    const h = clamp(parseInt(els.hslH.value) || 0, 0, 360);
    const s = clamp(parseInt(els.hslS.value) || 0, 0, 100);
    const l = clamp(parseInt(els.hslL.value) || 0, 0, 100);
    const hex = ColorUtils.hslToHex(h, s, l);
    syncInputsFromHex(hex);
    if (state.selectedId) updateCardColor(state.selectedId, hex);
    renderAll();
  }

  els.hslH.addEventListener('input', () => { els.hslHVal.value = els.hslH.value; onHslChange(); });
  els.hslS.addEventListener('input', () => { els.hslSVal.value = els.hslS.value; onHslChange(); });
  els.hslL.addEventListener('input', () => { els.hslLVal.value = els.hslL.value; onHslChange(); });
  els.hslHVal.addEventListener('input', () => { els.hslH.value = els.hslHVal.value; onHslChange(); });
  els.hslSVal.addEventListener('input', () => { els.hslS.value = els.hslSVal.value; onHslChange(); });
  els.hslLVal.addEventListener('input', () => { els.hslL.value = els.hslLVal.value; onHslChange(); });

  // ═══════════════════════════════════════════════════════════════
  // PALETTE STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  function addColor(hex) {
    if (state.palette.length >= 8) {
      showToast('Maximum 8 colors per palette');
      return;
    }
    const id = 'c' + (state.nextId++);
    state.palette.push({ id, hex: hex.toUpperCase(), role: '—' });
    state.selectedId = id;
    renderAll();
    saveHistory();
  }

  function removeColor(id) {
    state.palette = state.palette.filter(c => c.id !== id);
    if (state.selectedId === id) {
      state.selectedId = state.palette.length ? state.palette[state.palette.length - 1].id : null;
    }
    renderAll();
    saveHistory();
  }

  function duplicateColor(id) {
    if (state.palette.length >= 8) { showToast('Maximum 8 colors per palette'); return; }
    const src = state.palette.find(c => c.id === id);
    if (!src) return;
    const newId = 'c' + (state.nextId++);
    const idx = state.palette.findIndex(c => c.id === id);
    state.palette.splice(idx + 1, 0, { id: newId, hex: src.hex, role: src.role });
    renderAll();
    saveHistory();
  }

  function updateCardColor(id, hex) {
    const card = state.palette.find(c => c.id === id);
    if (card) card.hex = hex.toUpperCase();
  }

  function updateCardRole(id, role) {
    const card = state.palette.find(c => c.id === id);
    if (card) card.role = role;
    renderAll();
    saveHistory();
  }

  function selectCard(id) {
    state.selectedId = id;
    const card = state.palette.find(c => c.id === id);
    if (card) syncInputsFromHex(card.hex);
    renderCards(); // just re-render cards to update selection ring
    renderShades();
  }

  // ═══════════════════════════════════════════════════════════════
  // RENDER — COLOR CARDS
  // ═══════════════════════════════════════════════════════════════

  function renderCards() {
    const container = els.colorCards;
    container.innerHTML = '';

    const count = state.palette.length;
    els.colorCountLabel.textContent = count === 0 ? '0 colors' : count === 1 ? '1 color' : `${count} colors`;
    els.emptyState.style.display = count === 0 ? 'flex' : 'none';

    state.palette.forEach(color => {
      const card = document.createElement('div');
      card.className = 'color-card' + (state.selectedId === color.id ? ' selected' : '');
      card.setAttribute('role', 'listitem');
      card.dataset.id = color.id;

      // Determine label text color (light or dark) for contrast
      const labelColor = getContrastTextColor(color.hex);

      card.innerHTML = `
        <div class="card-swatch" style="background:${color.hex}" title="Click to select" tabindex="0" aria-label="Select ${color.hex}"></div>
        <div class="card-body">
          <input class="card-hex-input" type="text" value="${color.hex.replace('#','')}"
            maxlength="6" spellcheck="false" aria-label="Hex value for this color">
          <select class="role-select" aria-label="Color role">
            ${COLOR_ROLES.map(r => `<option value="${r}" ${r === color.role ? 'selected' : ''}>${r}</option>`).join('')}
          </select>
        </div>
        <div class="card-actions">
          <button class="card-btn duplicate" title="Duplicate" aria-label="Duplicate color">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><rect x="4" y="4" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M2 10V3a1 1 0 0 1 1-1h7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
          </button>
          <button class="card-btn delete" title="Remove" aria-label="Remove color">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 3.5h10M5.5 3.5V2.5h3v1M6 6v4M8 6v4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><rect x="2.5" y="3.5" width="9" height="9" rx="1" stroke="currentColor" stroke-width="1.3"/></svg>
          </button>
        </div>
      `;

      // Events
      const swatch = card.querySelector('.card-swatch');
      swatch.addEventListener('click', () => selectCard(color.id));
      swatch.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectCard(color.id); } });
      card.addEventListener('click', e => {
        if (!e.target.closest('.card-btn') && !e.target.closest('.card-hex-input') && !e.target.closest('.role-select')) {
          selectCard(color.id);
        }
      });

      // Hex inline edit
      const hexInput = card.querySelector('.card-hex-input');
      hexInput.addEventListener('input', () => {
        const val = hexInput.value.replace(/[^0-9a-fA-F]/g, '').toUpperCase();
        hexInput.value = val;
        if (val.length === 6) {
          updateCardColor(color.id, '#' + val);
          card.querySelector('.card-swatch').style.background = '#' + val;
          if (state.selectedId === color.id) syncInputsFromHex('#' + val);
          renderPaletteStrip();
          renderShades();
          debounce(saveHistory, 800)();
        }
      });
      hexInput.addEventListener('blur', () => {
        const val = hexInput.value.replace(/[^0-9a-fA-F]/g, '').toUpperCase();
        if (val.length !== 6) hexInput.value = color.hex.replace('#', '');
        else renderAll();
      });

      // Role
      const roleSelect = card.querySelector('.role-select');
      roleSelect.addEventListener('change', () => updateCardRole(color.id, roleSelect.value));

      // Buttons
      card.querySelector('.card-btn.duplicate').addEventListener('click', e => { e.stopPropagation(); duplicateColor(color.id); });
      card.querySelector('.card-btn.delete').addEventListener('click', e => { e.stopPropagation(); removeColor(color.id); });

      container.appendChild(card);
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // RENDER — PALETTE STRIP
  // ═══════════════════════════════════════════════════════════════

  function renderPaletteStrip() {
    const strip = els.paletteStrip;
    strip.innerHTML = '';

    if (state.palette.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'palette-strip-empty';
      empty.textContent = 'ADD COLORS TO SEE YOUR PALETTE';
      strip.appendChild(empty);
      return;
    }

    state.palette.forEach(color => {
      const seg = document.createElement('div');
      seg.className = 'strip-segment';
      seg.style.background = color.hex;
      seg.setAttribute('tabindex', '0');
      seg.setAttribute('aria-label', color.hex);
      seg.title = color.hex;

      const label = document.createElement('span');
      label.className = 'strip-hex-label';
      label.textContent = color.hex;
      label.style.color = getContrastTextColor(color.hex);
      seg.appendChild(label);

      seg.addEventListener('click', () => selectCard(color.id));
      seg.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectCard(color.id); } });

      strip.appendChild(seg);
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // RENDER — SHADES & TINTS
  // ═══════════════════════════════════════════════════════════════

  function renderShades() {
    if (state.palette.length === 0) {
      els.shadesSection.style.display = 'none';
      return;
    }
    els.shadesSection.style.display = 'block';
    els.shadesGrid.innerHTML = '';

    state.palette.forEach(color => {
      const shades = ColorUtils.generateShades(color.hex);
      const group = document.createElement('div');
      group.className = 'shade-group';

      const lbl = document.createElement('div');
      lbl.className = 'shade-group-label';
      lbl.textContent = color.hex + (color.role !== '—' ? ` — ${color.role}` : '');
      group.appendChild(lbl);

      const row = document.createElement('div');
      row.className = 'shade-row';

      shades.forEach(({ step, hex, isBase }) => {
        const chip = document.createElement('div');
        chip.className = 'shade-chip' + (isBase ? ' base-shade' : '');
        chip.style.background = hex;
        chip.setAttribute('tabindex', '0');
        chip.setAttribute('title', hex);
        chip.setAttribute('aria-label', `Shade ${step}: ${hex}. Click to copy.`);

        const tooltip = document.createElement('div');
        tooltip.className = 'shade-tooltip';
        tooltip.textContent = hex;
        chip.appendChild(tooltip);

        const numLabel = document.createElement('span');
        numLabel.className = 'shade-chip-label';
        numLabel.textContent = step;
        numLabel.style.color = getContrastTextColor(hex);
        chip.appendChild(numLabel);

        // Click → copy hex
        chip.addEventListener('click', () => {
          copyToClipboard(hex);
          showToast(`Copied ${hex}`);
        });
        chip.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            copyToClipboard(hex);
            showToast(`Copied ${hex}`);
          }
          if (e.key === 'a' || e.key === 'A') {
            addColor(hex);
          }
        });

        // Right-click → add to palette
        chip.addEventListener('contextmenu', e => {
          e.preventDefault();
          addColor(hex);
          showToast(`Added ${hex} to palette`);
        });

        row.appendChild(chip);
      });

      group.appendChild(row);
      els.shadesGrid.appendChild(group);
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // RENDER — CONTRAST CHECKER
  // ═══════════════════════════════════════════════════════════════

  function renderContrastChecker() {
    const container = els.contrastPairs;
    container.innerHTML = '';

    const hexes = state.palette.map(c => c.hex);
    if (hexes.length < 2) {
      container.innerHTML = '<p style="color:var(--text-muted);font-size:13px;padding:16px 0">Add at least 2 colors to check contrast.</p>';
      return;
    }

    // All pairs, sorted by contrast ratio ascending (worst first)
    const pairs = [];
    for (let i = 0; i < hexes.length; i++) {
      for (let j = i + 1; j < hexes.length; j++) {
        const result = ColorUtils.checkContrast(hexes[i], hexes[j]);
        if (result) pairs.push(result);
      }
    }
    pairs.sort((a, b) => a.ratio - b.ratio);

    pairs.forEach(({ ratio, wcag, fg, bg }) => {
      const card = document.createElement('div');
      card.className = 'contrast-pair-card';

      card.innerHTML = `
        <div class="pair-preview" style="background:${bg}; color:${fg}">Aa</div>
        <div class="pair-info">
          <div class="pair-ratio">${ratio}:1</div>
          <div class="pair-colors">${fg} on ${bg}</div>
        </div>
        <div class="pair-badges">
          <span class="wcag-badge ${wcag.aaNormal ? 'pass' : 'fail'}">AA</span>
          <span class="wcag-badge ${wcag.aaaNormal ? 'pass' : 'fail'}">AAA</span>
          <span class="wcag-badge ${wcag.aaLarge ? 'pass' : 'fail'}">AA LG</span>
          <span class="wcag-badge ${wcag.aaaLarge ? 'pass' : 'fail'}">AAA LG</span>
        </div>
      `;

      container.appendChild(card);
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // RENDER — ISSUES ENGINE
  // ═══════════════════════════════════════════════════════════════

  function renderIssues() {
    const issues = ColorUtils.analyzeIssues(state.palette);
    els.issuesCount.textContent = issues.length === 0 ? 'No issues' : `${issues.length} issue${issues.length !== 1 ? 's' : ''}`;
    els.issuesList.innerHTML = '';

    if (issues.length === 0) {
      els.issuesList.innerHTML = `
        <div style="padding:20px;text-align:center;color:var(--text-muted);font-size:13px">
          <span style="font-size:20px;display:block;margin-bottom:8px">✓</span>
          No issues found. Looking good!
        </div>`;
      return;
    }

    issues.forEach(issue => {
      const card = document.createElement('div');
      card.className = `issue-card ${issue.severity}`;
      card.innerHTML = `
        <span class="issue-severity ${issue.severity}">${issue.severity.toUpperCase()}</span>
        <div class="issue-body">
          <div class="issue-title">${escapeHtml(issue.title)}</div>
          <div class="issue-desc">${escapeHtml(issue.desc)}</div>
          <div class="issue-fix">
            Fix: <code>${escapeHtml(issue.fix)}</code>
            ${issue.fixHex ? `<button class="apply-fix-btn" data-hex="${issue.fixHex}" title="Apply fix" style="margin-left:6px;font-size:10px;font-weight:600;color:var(--text-muted);border:1px solid var(--border);border-radius:3px;padding:1px 6px;background:var(--white)">Apply</button>` : ''}
          </div>
        </div>
      `;
      if (issue.fixHex) {
        const btn = card.querySelector('.apply-fix-btn');
        btn.addEventListener('click', () => {
          if (state.selectedId) {
            updateCardColor(state.selectedId, issue.fixHex);
            syncInputsFromHex(issue.fixHex);
            renderAll();
            saveHistory();
            showToast(`Applied ${issue.fixHex}`);
          }
        });
      }
      els.issuesList.appendChild(card);
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // RENDER — COLOR BLINDNESS SIMULATOR
  // ═══════════════════════════════════════════════════════════════

  const CB_TYPES = [
    { key: 'normal',      label: 'Normal Vision' },
    { key: 'deuteranopia', label: 'Deuteranopia' },
    { key: 'protanopia',  label: 'Protanopia' },
    { key: 'tritanopia',  label: 'Tritanopia' },
  ];

  function renderCBSim() {
    const container = els.cbsimGrid;
    container.innerHTML = '';

    if (state.palette.length === 0) {
      container.innerHTML = '<p style="color:var(--text-muted);font-size:13px;padding:12px 0">Add colors to simulate.</p>';
      return;
    }

    CB_TYPES.forEach(({ key, label }) => {
      const card = document.createElement('div');
      card.className = 'cbsim-card';

      const lbl = document.createElement('div');
      lbl.className = 'cbsim-label';
      lbl.textContent = label;
      card.appendChild(lbl);

      const strip = document.createElement('div');
      strip.className = 'cbsim-strip';

      const simColors = state.palette.map(c =>
        key === 'normal' ? c.hex : ColorUtils.simulateColorBlindness(c.hex, key)
      );

      simColors.forEach(hex => {
        const seg = document.createElement('div');
        seg.className = 'cbsim-strip-segment';
        seg.style.background = hex;
        strip.appendChild(seg);
      });
      card.appendChild(strip);

      // Check for indistinguishable adjacent colors
      if (key !== 'normal') {
        const warnings = [];
        for (let i = 0; i < simColors.length - 1; i++) {
          const dist = ColorUtils.rgbDistance(simColors[i], simColors[i + 1]);
          if (dist < 20) {
            warnings.push(`${state.palette[i].hex} and ${state.palette[i+1].hex} look identical`);
          }
        }
        if (warnings.length) {
          const w = document.createElement('div');
          w.className = 'cbsim-warning';
          w.textContent = '⚠ ' + warnings.join('; ');
          card.appendChild(w);
        }
      }

      container.appendChild(card);
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // RENDER — METRICS & TEMPERATURE
  // ═══════════════════════════════════════════════════════════════

  function renderMetrics() {
    const hexes = state.palette.map(c => c.hex);
    const metrics = ColorUtils.getPaletteMetrics(hexes);

    els.metricsGrid.innerHTML = '';

    if (!metrics) {
      els.metricsGrid.innerHTML = '<p style="color:var(--text-muted);font-size:13px;grid-column:1/-1">Add colors to see metrics.</p>';
      els.moodBadge.textContent = '—';
      els.tempIndicator.style.left = '50%';
      return;
    }

    const metricDefs = [
      { value: metrics.totalColors,           label: 'Colors' },
      { value: metrics.avgSaturation + '%',   label: 'Avg Saturation' },
      { value: metrics.hueRange + '°',        label: 'Hue Range' },
      { value: metrics.lumSpread.toFixed(2),  label: 'Lum Spread' },
      { value: `${metrics.passingAAPairs}/${metrics.totalPairs}`, label: 'Passing AA' },
      { value: metrics.uniqueHueFamilies,     label: 'Hue Families' },
    ];

    metricDefs.forEach(({ value, label }) => {
      const card = document.createElement('div');
      card.className = 'metric-card';
      card.innerHTML = `<div class="metric-value">${value}</div><div class="metric-label">${label}</div>`;
      els.metricsGrid.appendChild(card);
    });

    // Temperature indicator (0–100 → 0–100%)
    els.tempIndicator.style.left = metrics.temperature + '%';

    // Mood
    els.moodBadge.textContent = metrics.mood;
  }

  // ═══════════════════════════════════════════════════════════════
  // RENDER — HARMONY ENGINE
  // ═══════════════════════════════════════════════════════════════

  function renderHarmony() {
    const type = els.harmonySelect.value;
    const baseHex = state.selectedId
      ? (state.palette.find(c => c.id === state.selectedId) || {}).hex || state.currentHex
      : state.currentHex;

    const result = ColorUtils.getHarmony(baseHex, type);
    const container = els.harmonyResult;
    container.innerHTML = '';

    if (!result.colors.length) return;

    const swatchRow = document.createElement('div');
    swatchRow.className = 'harmony-swatches';

    result.colors.forEach(hex => {
      const sw = document.createElement('div');
      sw.className = 'harmony-swatch';
      sw.setAttribute('tabindex', '0');
      sw.setAttribute('title', `${hex} — click to add to palette`);
      sw.setAttribute('aria-label', `${hex}. Click to add to palette.`);
      sw.innerHTML = `
        <div class="harmony-swatch-inner" style="background:${hex}"></div>
        <span class="harmony-swatch-hex">${hex}</span>
      `;
      sw.addEventListener('click', () => { addColor(hex); showToast(`Added ${hex}`); });
      sw.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); addColor(hex); showToast(`Added ${hex}`); }
      });
      swatchRow.appendChild(sw);
    });

    container.appendChild(swatchRow);

    const desc = document.createElement('div');
    desc.className = 'harmony-desc';
    desc.textContent = result.description;
    container.appendChild(desc);
  }

  els.harmonySelect.addEventListener('change', renderHarmony);

  // ═══════════════════════════════════════════════════════════════
  // RENDER — UI PREVIEW (LIVE MOCK)
  // ═══════════════════════════════════════════════════════════════

  function renderUIPreview() {
    const byRole = {};
    state.palette.forEach(c => {
      if (c.role !== '—') byRole[c.role] = c.hex;
    });

    const hasCritical = byRole['Primary'] && byRole['Background'] && byRole['Text'];

    if (!hasCritical) {
      const notice = `<div class="missing-roles-notice">Assign <strong>Primary</strong>, <strong>Background</strong>, and <strong>Text</strong> roles to see the live preview.</div>`;
      els.uiMockLight.innerHTML = notice;
      els.uiMockDark.innerHTML = notice;
      return;
    }

    const light = buildMockUI({
      bg:        byRole['Background'] || '#FFFFFF',
      surface:   byRole['Surface']    || lightenHex(byRole['Background'] || '#FFFFFF', -5),
      text:      byRole['Text']       || '#1A1A1A',
      textMuted: darkenHex(byRole['Text'] || '#1A1A1A', -30),
      primary:   byRole['Primary']    || '#1A1A1A',
      accent:    byRole['Accent']     || byRole['Primary'],
      border:    `rgba(0,0,0,0.1)`,
    });
    els.uiMockLight.innerHTML = light;

    // Auto-derive dark mode by inverting luminance
    const darkBg      = darkenHex(byRole['Primary'] || '#1A1A1A', 30, true);
    const darkSurface = lightenHex(darkBg, 8);
    const darkText    = '#F5F5F5';
    const dark = buildMockUI({
      bg:        darkBg,
      surface:   darkSurface,
      text:      darkText,
      textMuted: 'rgba(245,245,245,0.6)',
      primary:   byRole['Primary'],
      accent:    byRole['Accent'] || byRole['Primary'],
      border:    `rgba(255,255,255,0.1)`,
    });
    els.uiMockDark.innerHTML = dark;
  }

  function buildMockUI({ bg, surface, text, textMuted, primary, accent, border }) {
    const btnText = getContrastTextColor(primary);
    return `
      <div class="mock-nav" style="background:${bg};border-color:${border}">
        <div class="mock-logo" style="color:${text}">Studio</div>
        <div class="mock-nav-links">
          <span style="color:${textMuted}">Features</span>
          <span style="color:${textMuted}">Pricing</span>
          <span style="color:${accent || primary}">Blog</span>
        </div>
        <div class="mock-nav-btn" style="background:${primary};color:${btnText};border-radius:6px;padding:6px 14px;font-size:12px;font-weight:600">Get started</div>
      </div>
      <div class="mock-hero" style="background:${bg}">
        <div class="mock-hero-tag" style="background:${accent || primary}22;color:${accent || primary}">NEW — Just launched</div>
        <div class="mock-hero-h1" style="color:${text}">Build beautiful products</div>
        <div class="mock-hero-sub" style="color:${textMuted}">The complete design toolkit for teams who care about craft.</div>
        <div class="mock-hero-btns">
          <div class="mock-btn-primary" style="background:${primary};color:${btnText}">Start for free</div>
          <div class="mock-btn-secondary" style="color:${text};border-color:${border}">Learn more</div>
        </div>
      </div>
      <div class="mock-cards" style="background:${bg}">
        ${[['⚡', 'Lightning fast', 'Optimized for performance at every scale.'],
           ['🎨', 'Fully customizable', 'Make it yours with powerful theming options.'],
           ['🔒', 'Secure by default', 'Enterprise-grade security built in from day one.'],
          ].map(([icon, h, p]) => `
          <div class="mock-card" style="background:${surface};border-color:${border}">
            <div class="mock-card-icon" style="background:${primary}22;display:flex;align-items:center;justify-content:center;font-size:16px">${icon}</div>
            <div class="mock-card-h" style="color:${text}">${h}</div>
            <div class="mock-card-p" style="color:${textMuted}">${p}</div>
          </div>`).join('')}
      </div>
      <div class="mock-input-row" style="background:${bg}">
        <input class="mock-input" style="color:${text};border-color:${border}" placeholder="Enter your email address" readonly>
      </div>
      <div class="mock-footer" style="background:${surface};border-top:1px solid ${border}">
        <span style="color:${textMuted}">© 2026 Studio Inc.</span>
        <span class="mock-badge" style="background:${accent || primary}22;color:${accent || primary}">v2.0</span>
      </div>
    `;
  }

  // ═══════════════════════════════════════════════════════════════
  // RENDER — EXPORT PANEL
  // ═══════════════════════════════════════════════════════════════

  function renderExports() {
    const palette = state.palette;

    // Helper: get variable name
    function varName(color, i) {
      return color.role !== '—'
        ? color.role.toLowerCase().replace(/\s+/g, '-')
        : `color-${i}`;
    }

    // CSS Variables
    if (els.exportCss) {
      els.exportCss.textContent = ':root {\n' +
        palette.map((c, i) => `  --${varName(c, i)}: ${c.hex};`).join('\n') +
        '\n}';
    }

    // SCSS Variables
    if (els.exportScss) {
      els.exportScss.textContent = palette.map((c, i) =>
        `$${varName(c, i)}: ${c.hex};`
      ).join('\n');
    }

    // JSON Tokens
    if (els.exportJson) {
      const tokens = {};
      palette.forEach((c, i) => {
        tokens[varName(c, i)] = { value: c.hex, type: 'color', role: c.role !== '—' ? c.role : null };
      });
      els.exportJson.textContent = JSON.stringify({ colors: tokens }, null, 2);
    }

    // Tailwind Config
    if (els.exportTailwind) {
      const entries = palette.map((c, i) => `      '${varName(c, i)}': '${c.hex}',`).join('\n');
      els.exportTailwind.textContent =
        `module.exports = {\n  theme: {\n    extend: {\n      colors: {\n${entries}\n      },\n    },\n  },\n};`;
    }

    // Figma Tokens (Pro)
    if (els.exportFigma) {
      const figma = {};
      palette.forEach((c, i) => {
        figma[varName(c, i)] = { value: c.hex, type: 'color' };
      });
      els.exportFigma.textContent = JSON.stringify(figma, null, 2);
    }

    // PNG preview canvas render
    renderPNGPreview();
  }

  function renderPNGPreview() {
    if (!els.exportCanvas || !els.exportPngPreview) return;
    const palette = state.palette;
    if (!palette.length) { els.exportPngPreview.innerHTML = '<span style="color:var(--text-muted);font-size:13px">Add colors to export.</span>'; return; }

    const W = 600, swatchH = 80, labelH = 40, H = swatchH + labelH + 20;
    const canvas = els.exportCanvas;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, W, H);

    const swatchW = Math.floor(W / palette.length);

    palette.forEach((c, i) => {
      ctx.fillStyle = c.hex;
      ctx.fillRect(i * swatchW, 0, swatchW, swatchH);

      // Hex label
      ctx.fillStyle = getContrastTextColor(c.hex);
      ctx.font = 'bold 11px DM Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(c.hex, i * swatchW + swatchW / 2, swatchH - 10);

      // Role label below swatch
      ctx.fillStyle = '#4a4a4a';
      ctx.font = '10px DM Sans, sans-serif';
      ctx.fillText(c.role !== '—' ? c.role : '', i * swatchW + swatchW / 2, swatchH + 20);
    });

    // Watermark
    ctx.fillStyle = '#9a9a9a';
    ctx.font = '9px DM Sans, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Color Palette Studio © 2026 Joel Varghese', W - 10, H - 6);

    // Show as image preview
    const img = document.createElement('img');
    img.src = canvas.toDataURL('image/png');
    img.style.cssText = 'width:100%;border-radius:6px;border:1px solid #e5e5e5';
    els.exportPngPreview.innerHTML = '';
    els.exportPngPreview.appendChild(img);
  }

  // ═══════════════════════════════════════════════════════════════
  // RENDER — HISTORY
  // ═══════════════════════════════════════════════════════════════

  const HISTORY_KEY = 'cps_palette_history';
  const MAX_HISTORY = 10;

  function saveHistory() {
    if (state.palette.length === 0) return;
    let history = loadHistoryData();

    const entry = {
      id: Date.now(),
      palette: JSON.parse(JSON.stringify(state.palette)),
      savedAt: new Date().toISOString(),
    };

    // Avoid duplicate consecutive saves
    if (history.length > 0) {
      const last = history[0];
      if (JSON.stringify(last.palette.map(c => c.hex)) === JSON.stringify(entry.palette.map(c => c.hex))) return;
    }

    history.unshift(entry);
    if (history.length > MAX_HISTORY) history = history.slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));

    if (state.activeTab === 'history') renderHistory();
  }

  function loadHistoryData() {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); }
    catch { return []; }
  }

  function renderHistory() {
    const history = loadHistoryData();
    els.historyList.innerHTML = '';
    els.historyEmpty.style.display = history.length === 0 ? 'flex' : 'none';

    history.forEach(entry => {
      const item = document.createElement('div');
      item.className = 'history-item';

      const strip = document.createElement('div');
      strip.className = 'history-strip';
      entry.palette.forEach(c => {
        const seg = document.createElement('div');
        seg.className = 'history-strip-seg';
        seg.style.background = c.hex;
        strip.appendChild(seg);
      });

      const meta = document.createElement('div');
      meta.className = 'history-meta';
      const d = new Date(entry.savedAt);
      meta.innerHTML = `
        <span class="history-date">${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        <span class="history-info">${entry.palette.length} color${entry.palette.length !== 1 ? 's' : ''}</span>
      `;

      const actions = document.createElement('div');
      actions.className = 'history-actions';

      const loadBtn = document.createElement('button');
      loadBtn.className = 'btn-history-load';
      loadBtn.textContent = 'Load';
      loadBtn.addEventListener('click', () => {
        state.palette = JSON.parse(JSON.stringify(entry.palette));
        state.selectedId = state.palette.length ? state.palette[0].id : null;
        if (state.selectedId) syncInputsFromHex(state.palette[0].hex);
        renderAll();
        switchTab('builder');
        showToast('Palette restored');
      });

      const delBtn = document.createElement('button');
      delBtn.className = 'btn-history-del';
      delBtn.textContent = '✕';
      delBtn.setAttribute('aria-label', 'Delete this history entry');
      delBtn.addEventListener('click', () => {
        let h = loadHistoryData();
        h = h.filter(e => e.id !== entry.id);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
        renderHistory();
      });

      actions.appendChild(loadBtn);
      actions.appendChild(delBtn);
      item.appendChild(strip);
      item.appendChild(meta);
      item.appendChild(actions);
      els.historyList.appendChild(item);
    });
  }

  els.btnClearHistory.addEventListener('click', () => {
    localStorage.removeItem(HISTORY_KEY);
    renderHistory();
    showToast('History cleared');
  });

  // ═══════════════════════════════════════════════════════════════
  // GENERATE PALETTE MODAL
  // ═══════════════════════════════════════════════════════════════

  els.btnGenerate.addEventListener('click', () => {
    els.modalGenerate.style.display = 'flex';
  });

  $('modal-generate-close').addEventListener('click', () => { els.modalGenerate.style.display = 'none'; });
  $('modal-generate-cancel').addEventListener('click', () => { els.modalGenerate.style.display = 'none'; });

  $$('.gen-option').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.gen-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.selectedGenType = btn.dataset.type;
    });
  });

  $('modal-generate-confirm').addEventListener('click', () => {
    const hexes = ColorUtils.generatePalette(state.selectedGenType);
    state.palette = [];
    hexes.forEach(hex => {
      state.palette.push({ id: 'c' + (state.nextId++), hex: hex.toUpperCase(), role: '—' });
    });
    state.selectedId = state.palette[0]?.id || null;
    if (state.selectedId) syncInputsFromHex(state.palette[0].hex);
    els.modalGenerate.style.display = 'none';
    renderAll();
    saveHistory();
    showToast(`Generated ${state.selectedGenType} palette`);
  });

  // ═══════════════════════════════════════════════════════════════
  // ADD COLOR BUTTON
  // ═══════════════════════════════════════════════════════════════

  els.btnAddColor.addEventListener('click', () => {
    addColor(state.currentHex);
  });

  // ═══════════════════════════════════════════════════════════════
  // IMAGE UPLOAD & COLOR EXTRACTION
  // ═══════════════════════════════════════════════════════════════

  els.uploadZone.addEventListener('click', () => els.fileInput.click());
  els.uploadZone.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); els.fileInput.click(); }
  });

  els.uploadZone.addEventListener('dragover', e => { e.preventDefault(); els.uploadZone.classList.add('drag-over'); });
  els.uploadZone.addEventListener('dragleave', () => els.uploadZone.classList.remove('drag-over'));
  els.uploadZone.addEventListener('drop', e => {
    e.preventDefault();
    els.uploadZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) processImageFile(file);
  });

  els.fileInput.addEventListener('change', () => {
    if (els.fileInput.files[0]) processImageFile(els.fileInput.files[0]);
  });

  function processImageFile(file) {
    if (!file.type.match(/image\/(jpeg|png|webp)/)) { showToast('Please upload a JPG, PNG, or WebP image'); return; }

    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = els.imgCanvas;
        const MAX = 200;
        const scale = Math.min(MAX / img.width, MAX / img.height, 1);
        canvas.width = Math.floor(img.width * scale);
        canvas.height = Math.floor(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const colors = ColorUtils.extractColorsFromPixels(imageData, 6);
        renderExtractedColors(colors);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function renderExtractedColors(colors) {
    els.extractedColors.style.display = 'flex';
    els.extractedColors.innerHTML = '<span style="font-size:11px;color:var(--text-muted);width:100%;letter-spacing:.05em;text-transform:uppercase;font-weight:600;margin-bottom:2px">Extracted — click to add</span>';

    colors.forEach(hex => {
      const sw = document.createElement('button');
      sw.className = 'extracted-swatch';
      sw.style.background = hex;
      sw.setAttribute('title', hex + ' — click to add to palette');
      sw.setAttribute('aria-label', `${hex}. Click to add.`);
      sw.addEventListener('click', () => {
        syncInputsFromHex(hex);
        addColor(hex);
        showToast(`Added ${hex}`);
      });
      els.extractedColors.appendChild(sw);
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // EXPORT COPY / DOWNLOAD BUTTONS
  // ═══════════════════════════════════════════════════════════════

  document.querySelectorAll('.btn-copy').forEach(btn => {
    btn.addEventListener('click', () => {
      const format = btn.dataset.format;
      if (btn.classList.contains('locked')) { showProModal(); return; }

      const n = incrementUsage('export');
      if (n > FREE_LIMIT && format !== 'css') { showProModal(); return; }

      const previewEl = document.getElementById('export-' + format);
      if (!previewEl) return;

      copyToClipboard(previewEl.textContent);
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
    });
  });

  document.querySelectorAll('.btn-download').forEach(btn => {
    btn.addEventListener('click', () => {
      const format = btn.dataset.format;
      if (btn.classList.contains('locked')) { showProModal(); return; }

      const n = incrementUsage('export');
      if (n > FREE_LIMIT) { showProModal(); return; }

      if (format === 'png') downloadPNG();
      if (format === 'ase') ExportEngine.downloadASE(state.palette);
    });
  });

  function downloadPNG() {
    renderPNGPreview();
    const canvas = els.exportCanvas;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'palette.png';
    a.click();
  }

  // ═══════════════════════════════════════════════════════════════
  // PRO MODAL
  // ═══════════════════════════════════════════════════════════════

  function showProModal() {
    if (sessionStorage.getItem('cps_pro_dismissed')) return;
    els.modalPro.style.display = 'flex';
  }

  els.btnTryPro.addEventListener('click', showProModal);
  $('modal-pro-close').addEventListener('click', dismissProModal);
  $('btn-maybe-later').addEventListener('click', dismissProModal);

  function dismissProModal() {
    els.modalPro.style.display = 'none';
    sessionStorage.setItem('cps_pro_dismissed', '1');
  }

  $('btn-get-access').addEventListener('click', () => {
    const email = $('pro-email').value.trim();
    if (!email || !email.includes('@')) { showToast('Please enter a valid email'); return; }
    localStorage.setItem('cps_waitlist_email', email);
    els.modalPro.innerHTML = `
      <div style="text-align:center;padding:20px 0">
        <div style="font-size:32px;margin-bottom:12px">✓</div>
        <h3 style="font-size:18px;font-weight:600;color:#1a1a1a;margin-bottom:8px">You're on the list!</h3>
        <p style="font-size:14px;color:#4a4a4a;margin-bottom:20px">We'll reach out to ${email} when Pro is ready.</p>
        <button onclick="document.getElementById('modal-pro').style.display='none'" style="padding:8px 20px;background:#1a1a1a;color:#fff;border-radius:6px;font-size:13px;font-weight:600">Close</button>
      </div>`;
  });

  // ═══════════════════════════════════════════════════════════════
  // TAB NAVIGATION
  // ═══════════════════════════════════════════════════════════════

  function switchTab(tabKey) {
    $$('.nav-tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
    $$('.panel').forEach(p => { p.classList.remove('active'); p.hidden = true; });

    const tab = document.querySelector(`.nav-tab[data-tab="${tabKey}"]`);
    const panel = $('panel-' + tabKey);
    if (tab) { tab.classList.add('active'); tab.setAttribute('aria-selected', 'true'); }
    if (panel) { panel.classList.add('active'); panel.hidden = false; }

    state.activeTab = tabKey;

    // Trigger lazy renders for specific panels
    if (tabKey === 'analysis') {
      renderContrastChecker();
      renderIssues();
      renderCBSim();
      renderMetrics();
      renderHarmony();
    }
    if (tabKey === 'preview') renderUIPreview();
    if (tabKey === 'export') renderExports();
    if (tabKey === 'history') renderHistory();
  }

  $$('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // ═══════════════════════════════════════════════════════════════
  // MASTER RENDER
  // ═══════════════════════════════════════════════════════════════

  function renderAll() {
    renderCards();
    renderPaletteStrip();
    renderShades();

    // Only re-render active tab
    switch (state.activeTab) {
      case 'analysis':
        renderContrastChecker();
        renderIssues();
        renderCBSim();
        renderMetrics();
        renderHarmony();
        break;
      case 'preview':
        renderUIPreview();
        break;
      case 'export':
        renderExports();
        break;
      case 'history':
        renderHistory();
        break;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // MODAL OVERLAY CLOSE ON BACKDROP CLICK
  // ═══════════════════════════════════════════════════════════════

  [els.modalGenerate, els.modalPro].forEach(modal => {
    modal.addEventListener('click', e => {
      if (e.target === modal) modal.style.display = 'none';
    });
  });

  // Escape key closes modals
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      els.modalGenerate.style.display = 'none';
      els.modalPro.style.display = 'none';
      els.contextMenu.style.display = 'none';
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  /**
   * Return '#FFFFFF' or '#000000' for best text contrast on a background.
   */
  function getContrastTextColor(hex) {
    const rgb = ColorUtils.hexToRgb(hex);
    if (!rgb) return '#000000';
    const lum = ColorUtils.getLuminance(rgb);
    return lum > 0.35 ? '#1A1A1A' : '#FFFFFF';
  }

  /** Lighten or darken a hex color by adjusting lightness */
  function lightenHex(hex, amount) {
    const hsl = ColorUtils.hexToHsl(hex);
    if (!hsl) return hex;
    return ColorUtils.hslToHex(hsl.h, hsl.s, clamp(hsl.l + amount, 0, 100));
  }

  function darkenHex(hex, amount, asBackground = false) {
    const hsl = ColorUtils.hexToHsl(hex);
    if (!hsl) return '#1A1A1A';
    if (asBackground) {
      // Force very dark
      return ColorUtils.hslToHex(hsl.h, Math.min(hsl.s + 10, 40), 12);
    }
    return ColorUtils.hslToHex(hsl.h, hsl.s, clamp(hsl.l - amount, 0, 100));
  }

  function copyToClipboard(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }

  let _toastTimeout;
  function showToast(message) {
    let toast = document.getElementById('cps-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'cps-toast';
      toast.style.cssText = `
        position:fixed; bottom:24px; left:50%; transform:translateX(-50%) translateY(8px);
        background:#1a1a1a; color:#fff; padding:9px 18px; border-radius:8px;
        font-size:13px; font-weight:500; z-index:9999; opacity:0;
        transition:opacity 180ms ease, transform 180ms ease;
        pointer-events:none; white-space:nowrap;
        font-family:'DM Sans',sans-serif;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(_toastTimeout);
    _toastTimeout = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(8px)';
    }, 2200);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  const _debounceMap = {};
  function debounce(fn, delay) {
    const key = fn.toString().slice(0, 20);
    return function (...args) {
      clearTimeout(_debounceMap[key]);
      _debounceMap[key] = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════════════════════════════

  function init() {
    // Start with a pleasing default palette so users see the UI immediately
    const defaults = [
      { hex: '#1A1A1A', role: 'Text' },
      { hex: '#FFFFFF', role: 'Background' },
      { hex: '#3B82F6', role: 'Primary' },
      { hex: '#10B981', role: 'Accent' },
    ];
    defaults.forEach(({ hex, role }) => {
      state.palette.push({ id: 'c' + (state.nextId++), hex, role });
    });
    state.selectedId = state.palette[0].id;

    // Sync sidebar to first color
    syncInputsFromHex(state.palette[0].hex);

    // Render initial UI
    renderAll();

    // Switch to builder tab
    switchTab('builder');
  }

  init();

})();
