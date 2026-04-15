/* Color Palette Studio © 2026 Joel Varghese. All rights reserved.
   Unauthorized copying or distribution is prohibited. */

/**
 * colorUtils.js
 * Single source of truth for all color math.
 * No external dependencies — pure vanilla JS.
 */

const ColorUtils = (() => {

  // ─── HEX ↔ RGB ────────────────────────────────────────────────────────────

  /**
   * Parse a hex string (#RRGGBB or RRGGBB) to {r, g, b} (0–255).
   * Returns null if invalid.
   */
  function hexToRgb(hex) {
    const clean = hex.replace(/^#/, '').trim();
    if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16),
    };
  }

  /**
   * Convert {r, g, b} (0–255) to uppercase "#RRGGBB".
   */
  function rgbToHex(r, g, b) {
    const clamp = v => Math.max(0, Math.min(255, Math.round(v)));
    return '#' + [clamp(r), clamp(g), clamp(b)]
      .map(v => v.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
  }

  // ─── RGB ↔ HSL ────────────────────────────────────────────────────────────

  /**
   * Convert {r, g, b} (0–255) to {h: 0–360, s: 0–100, l: 0–100}.
   */
  function rgbToHsl(r, g, b) {
    const rn = r / 255, gn = g / 255, bn = b / 255;
    const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
    const l = (max + min) / 2;
    let h = 0, s = 0;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break;
        case gn: h = ((bn - rn) / d + 2) / 6; break;
        case bn: h = ((rn - gn) / d + 4) / 6; break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  }

  /**
   * Convert {h: 0–360, s: 0–100, l: 0–100} to {r, g, b} (0–255).
   */
  function hslToRgb(h, s, l) {
    const hn = h / 360, sn = s / 100, ln = l / 100;

    if (sn === 0) {
      const v = Math.round(ln * 255);
      return { r: v, g: v, b: v };
    }

    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
    const p = 2 * ln - q;

    return {
      r: Math.round(hue2rgb(p, q, hn + 1/3) * 255),
      g: Math.round(hue2rgb(p, q, hn) * 255),
      b: Math.round(hue2rgb(p, q, hn - 1/3) * 255),
    };
  }

  /**
   * Convenience: hex string → {h, s, l}
   */
  function hexToHsl(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) return null;
    return rgbToHsl(rgb.r, rgb.g, rgb.b);
  }

  /**
   * Convenience: {h, s, l} → hex string
   */
  function hslToHex(h, s, l) {
    const rgb = hslToRgb(h, s, l);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
  }

  // ─── LUMINANCE & CONTRAST ─────────────────────────────────────────────────

  /**
   * WCAG 2.1 relative luminance of {r, g, b} (0–255).
   * Returns a value between 0 (black) and 1 (white).
   */
  function getLuminance({ r, g, b }) {
    const linearize = v => {
      const sRGB = v / 255;
      return sRGB <= 0.03928
        ? sRGB / 12.92
        : Math.pow((sRGB + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
  }

  /**
   * WCAG 2.1 contrast ratio between two luminance values (0–1).
   * Returns a ratio like 4.5, 7.1, etc.
   */
  function contrastRatio(lum1, lum2) {
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Get WCAG pass/fail badges for a given contrast ratio.
   * Returns { aaLarge, aaNormal, aaaLarge, aaaNormal } as booleans.
   */
  function getWcagResults(ratio) {
    return {
      aaLarge:   ratio >= 3.0,
      aaNormal:  ratio >= 4.5,
      aaaLarge:  ratio >= 4.5,
      aaaNormal: ratio >= 7.0,
    };
  }

  /**
   * Full contrast check between two hex colors.
   * Returns { ratio, wcag, fg, bg }
   */
  function checkContrast(fgHex, bgHex) {
    const fgRgb = hexToRgb(fgHex);
    const bgRgb = hexToRgb(bgHex);
    if (!fgRgb || !bgRgb) return null;
    const fgLum = getLuminance(fgRgb);
    const bgLum = getLuminance(bgRgb);
    const ratio = contrastRatio(fgLum, bgLum);
    return {
      ratio: Math.round(ratio * 100) / 100,
      wcag: getWcagResults(ratio),
      fg: fgHex,
      bg: bgHex,
    };
  }

  // ─── RGB DISTANCE ─────────────────────────────────────────────────────────

  /**
   * Euclidean distance in RGB space between two hex colors.
   * 0 = identical, ~441 = black vs white.
   */
  function rgbDistance(hex1, hex2) {
    const a = hexToRgb(hex1);
    const b = hexToRgb(hex2);
    if (!a || !b) return 999;
    return Math.sqrt(
      Math.pow(a.r - b.r, 2) +
      Math.pow(a.g - b.g, 2) +
      Math.pow(a.b - b.b, 2)
    );
  }

  // ─── SHADE / TINT GENERATION ──────────────────────────────────────────────

  /**
   * Generate a 9-step shade scale for a given hex color.
   * Steps: 50, 100, 200, 300, 400 (base), 500, 600, 700, 800, 900
   * Returns array of { step, hex, isBase } objects.
   */
  function generateShades(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) return [];
    const { h, s } = rgbToHsl(rgb.r, rgb.g, rgb.b);

    // Lightness targets for each step
    const lightnesses = [96, 90, 80, 70, 60, 50, 40, 30, 18];
    const steps = [50, 100, 200, 300, 400, 500, 600, 700, 900];

    // Find which step is closest to the base color
    const baseLum = rgbToHsl(rgb.r, rgb.g, rgb.b).l;
    let baseIdx = 0;
    let minDist = Infinity;
    lightnesses.forEach((l, i) => {
      const d = Math.abs(l - baseLum);
      if (d < minDist) { minDist = d; baseIdx = i; }
    });

    return lightnesses.map((l, i) => ({
      step: steps[i],
      hex: hslToHex(h, s, l),
      isBase: i === baseIdx,
    }));
  }

  // ─── COLOR TEMPERATURE ────────────────────────────────────────────────────

  /**
   * Estimate the "warmth" of a single hex color.
   * Returns 0 (cool) to 100 (warm).
   * Based on hue angle: reds/oranges/yellows are warm, blues/cyans are cool.
   */
  function getColorTemperature(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) return 50;
    const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);

    // Achromatic colors are neutral
    if (s < 10) return 50;

    // Warm hues: 0–60 (red, orange, yellow) and 300–360 (magenta-red)
    // Cool hues: 180–260 (cyan, blue)
    // Neutral: 60–180 (yellow-green, green) and 260–300 (blue-purple)
    if (h <= 60) {
      // Full warm at 0–30 (red/orange), tapering to neutral at 60
      return Math.round(75 + (1 - h / 60) * 25);
    } else if (h <= 180) {
      // Green range — slightly cool
      return Math.round(50 - ((h - 60) / 120) * 20);
    } else if (h <= 260) {
      // Full cool at 240 (blue)
      return Math.round(30 - ((h - 180) / 80) * 20);
    } else if (h <= 300) {
      // Purple — slightly warmer
      return Math.round(10 + ((h - 260) / 40) * 30);
    } else {
      // Magenta/red-violet back to warm
      return Math.round(40 + ((h - 300) / 60) * 45);
    }
  }

  /**
   * Average temperature of a palette (array of hex strings).
   * Returns 0–100.
   */
  function getPaletteTemperature(hexArray) {
    if (!hexArray.length) return 50;
    const temps = hexArray.map(getColorTemperature);
    return Math.round(temps.reduce((a, b) => a + b, 0) / temps.length);
  }

  // ─── PALETTE MOOD ─────────────────────────────────────────────────────────

  /**
   * Derive a mood label from a palette array of { hex } objects with role info.
   * Returns a string like "Warm", "Cool", "Pastel", etc.
   */
  function getPaletteMood(hexArray) {
    if (!hexArray.length) return '—';

    const hsls = hexArray.map(h => hexToHsl(h)).filter(Boolean);
    if (!hsls.length) return '—';

    const avgS = hsls.reduce((a, b) => a + b.s, 0) / hsls.length;
    const avgL = hsls.reduce((a, b) => a + b.l, 0) / hsls.length;
    const hues = hsls.map(h => h.h);
    const hueRange = Math.max(...hues) - Math.min(...hues);
    const temp = getPaletteTemperature(hexArray);

    // Decision tree
    if (avgL > 75 && avgS > 20) return 'Pastel';
    if (avgL < 25) return 'Dark';
    if (avgS < 15) return 'Neutral';
    if (hueRange < 30 && hsls.length > 2) return 'Monochromatic';
    if (avgS > 70 && avgL > 35 && avgL < 65) return 'Vivid';
    if (avgS > 25 && avgS < 60 && avgL > 30 && avgL < 60) return 'Earthy';
    if (temp >= 65) return 'Warm';
    if (temp <= 35) return 'Cool';
    return 'Balanced';
  }

  // ─── HARMONY ENGINE ───────────────────────────────────────────────────────

  const HARMONY_DESCRIPTIONS = {
    complementary:
      'Complementary colors sit directly across from each other on the color wheel. They create strong visual contrast and vibrant combinations — great for making elements pop.',
    analogous:
      'Analogous colors are adjacent on the color wheel. They create harmonious, cohesive palettes that feel natural and pleasing — ideal for backgrounds and gradients.',
    triadic:
      'Triadic colors are evenly spaced 120° apart on the color wheel. This scheme is vibrant and balanced, offering visual variety while maintaining harmony.',
    'split-complementary':
      'Split-complementary uses a base color plus the two colors adjacent to its complement. It has the visual contrast of complementary but is more nuanced and less jarring.',
    tetradic:
      'Tetradic (double-complementary) uses two complementary pairs. Rich and complex — works best when one color dominates and the others support.',
    square:
      'Square harmony uses four colors evenly spaced 90° apart. It offers a lively, balanced palette — works well when you let one color lead.',
    monochromatic:
      'Monochromatic palettes use a single hue at varying lightness and saturation. Elegant, cohesive, and easy to apply — relies on contrast through light and dark values.',
  };

  /**
   * Generate harmony swatches for a given hex color and harmony type.
   * Returns { colors: [hex, ...], description: string }
   */
  function getHarmony(hex, type) {
    const hsl = hexToHsl(hex);
    if (!hsl) return { colors: [], description: '' };
    const { h, s, l } = hsl;

    let hues = [];

    switch (type) {
      case 'complementary':
        hues = [h, (h + 180) % 360];
        break;
      case 'analogous':
        hues = [(h - 30 + 360) % 360, h, (h + 30) % 360];
        break;
      case 'triadic':
        hues = [h, (h + 120) % 360, (h + 240) % 360];
        break;
      case 'split-complementary':
        hues = [h, (h + 150) % 360, (h + 210) % 360];
        break;
      case 'tetradic':
        hues = [h, (h + 60) % 360, (h + 180) % 360, (h + 240) % 360];
        break;
      case 'square':
        hues = [h, (h + 90) % 360, (h + 180) % 360, (h + 270) % 360];
        break;
      case 'monochromatic':
        // Same hue, vary lightness & saturation
        return {
          colors: [
            hslToHex(h, Math.min(s + 10, 100), Math.min(l + 30, 92)),
            hslToHex(h, s, Math.min(l + 15, 80)),
            hex.toUpperCase(),
            hslToHex(h, s, Math.max(l - 15, 15)),
            hslToHex(h, Math.min(s + 10, 100), Math.max(l - 30, 8)),
          ],
          description: HARMONY_DESCRIPTIONS.monochromatic,
        };
      default:
        hues = [h];
    }

    return {
      colors: hues.map(hue => hslToHex(hue, s, l)),
      description: HARMONY_DESCRIPTIONS[type] || '',
    };
  }

  // ─── COLOR BLINDNESS SIMULATION ───────────────────────────────────────────

  /**
   * Simulate color blindness by transforming linear RGB through an LMS matrix.
   * Types: deuteranopia, protanopia, tritanopia.
   *
   * Matrices from Brettel et al. (1997) and Viénot et al. (1999).
   */
  function simulateColorBlindness(hex, type) {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;

    // Linearize sRGB
    const linearize = v => {
      const s = v / 255;
      return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    const delinearize = v => {
      const c = Math.max(0, Math.min(1, v));
      return Math.round((c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1/2.4) - 0.055) * 255);
    };

    let R = linearize(rgb.r);
    let G = linearize(rgb.g);
    let B = linearize(rgb.b);

    // sRGB → LMS (Hunt-Pointer-Estévez, D65)
    let L =  0.4002 * R + 0.7076 * G - 0.0808 * B;
    let M = -0.2263 * R + 1.1653 * G + 0.0457 * B;
    let S =  0.0000 * R + 0.0000 * G + 0.9182 * B;

    let Ls, Ms, Ss;

    switch (type) {
      case 'deuteranopia':
        // Green cone deficiency — project onto confusion line
        Ls = L;
        Ms = (0.494207 * L + 0.968437 * S) / 0.968437; // simplified projection
        Ms = (2.02344 * L - 2.52581 * S);
        Ms = L; // use simplified version
        Ls = 1.0 * L + 0.0 * M + 0.0 * S;
        Ms = 0.9513092 * L + 0.0 * M + -0.0 * S;
        Ss = 0.0 * L + 0.0 * M + 1.0 * S;
        // Proper deuteranopia matrix (Viénot 1999)
        Ls = 1.0 * L + 0.0 * M + 0.0 * S;
        Ms = 0.494207 * L + 0.0 * M + 1.24827 * S;
        Ss = 0.0 * L + 0.0 * M + 1.0 * S;
        break;
      case 'protanopia':
        // Red cone deficiency
        Ls = 0.0 * L + 2.02344 * M + -2.52581 * S;
        Ms = 0.0 * L + 1.0 * M + 0.0 * S;
        Ss = 0.0 * L + 0.0 * M + 1.0 * S;
        break;
      case 'tritanopia':
        // Blue cone deficiency
        Ls = 1.0 * L + 0.0 * M + 0.0 * S;
        Ms = 0.0 * L + 1.0 * M + 0.0 * S;
        Ss = -0.395913 * L + 0.801109 * M + 0.0 * S;
        break;
      default:
        return hex;
    }

    // LMS → sRGB (inverse of Hunt-Pointer-Estévez)
    const Rout =  0.8951 * Ls - 0.7502 * Ms + 0.0389 * Ss;
    const Gout =  0.2664 * Ls + 0.3273 * Ms + 0.0000 * Ss;
    const Bout = -0.1614 * Ls + 0.4228 * Ms + 0.9769 * Ss;

    return rgbToHex(delinearize(Rout), delinearize(Gout), delinearize(Bout));
  }

  // ─── PALETTE METRICS ──────────────────────────────────────────────────────

  /**
   * Compute a set of descriptive metrics for a palette (array of hex strings).
   */
  function getPaletteMetrics(hexArray) {
    if (!hexArray.length) return null;

    const rgbs = hexArray.map(hexToRgb).filter(Boolean);
    const hsls = hexArray.map(hexToHsl).filter(Boolean);
    const lums = rgbs.map(getLuminance);

    // Hue range
    const hues = hsls.map(h => h.h);
    const hueRange = hues.length > 1 ? Math.max(...hues) - Math.min(...hues) : 0;

    // Average saturation
    const avgSaturation = hsls.length
      ? Math.round(hsls.reduce((a, b) => a + b.s, 0) / hsls.length)
      : 0;

    // Saturation range
    const sats = hsls.map(h => h.s);
    const satRange = sats.length > 1 ? Math.max(...sats) - Math.min(...sats) : 0;

    // Luminance spread
    const lumSpread = lums.length > 1
      ? Math.round((Math.max(...lums) - Math.min(...lums)) * 100) / 100
      : 0;

    // Count passing AA pairs
    let passingAAPairs = 0;
    let totalPairs = 0;
    for (let i = 0; i < hexArray.length; i++) {
      for (let j = i + 1; j < hexArray.length; j++) {
        totalPairs++;
        const result = checkContrast(hexArray[i], hexArray[j]);
        if (result && result.wcag.aaNormal) passingAAPairs++;
      }
    }

    // Unique hue families (rough bucketing every 30°)
    const hueFamilies = new Set(hues.map(h => Math.floor(h / 30)));

    return {
      totalColors: hexArray.length,
      avgSaturation,
      satRange,
      hueRange,
      lumSpread,
      passingAAPairs,
      totalPairs,
      uniqueHueFamilies: hueFamilies.size,
      temperature: getPaletteTemperature(hexArray),
      mood: getPaletteMood(hexArray),
    };
  }

  // ─── ISSUES ENGINE ────────────────────────────────────────────────────────

  /**
   * Analyze a palette for design issues and return an array of issue objects.
   * Each color in `palette` is { id, hex, role }.
   * Returns array of { id, severity, title, desc, fix }.
   */
  function analyzeIssues(palette) {
    const issues = [];
    const hexes = palette.map(c => c.hex);

    if (palette.length === 0) return issues;

    // 1. Fewer than 3 colors
    if (palette.length < 3) {
      issues.push({
        id: 'too-few-colors',
        severity: 'warning',
        title: 'Too few colors',
        desc: 'Your palette has fewer than 3 colors. Most design systems need at least a primary, background, and text color.',
        fix: 'Add at least 3 colors to build a functional palette.',
      });
    }

    // 2. No Text role assigned
    const hasText = palette.some(c => c.role === 'Text');
    if (!hasText) {
      issues.push({
        id: 'no-text-role',
        severity: 'warning',
        title: 'No Text color assigned',
        desc: 'None of your colors are assigned the "Text" role. This prevents the contrast checker and UI preview from working correctly.',
        fix: 'Assign the "Text" role to your darkest or most legible color.',
      });
    }

    // 3. No Background role
    const hasBg = palette.some(c => c.role === 'Background');
    if (!hasBg) {
      issues.push({
        id: 'no-bg-role',
        severity: 'warning',
        title: 'No Background color assigned',
        desc: 'None of your colors have the "Background" role. This is needed for accurate contrast analysis.',
        fix: 'Assign the "Background" role to your lightest or page background color.',
      });
    }

    // 4. No dark anchor (luminance < 0.05)
    const lums = palette.map(c => {
      const rgb = hexToRgb(c.hex);
      return rgb ? getLuminance(rgb) : null;
    }).filter(l => l !== null);

    const hasDarkAnchor = lums.some(l => l < 0.05);
    if (!hasDarkAnchor && palette.length >= 3) {
      issues.push({
        id: 'no-dark-anchor',
        severity: 'info',
        title: 'No dark anchor color',
        desc: 'Your palette lacks a very dark color (luminance < 5%). Dark anchors ground a palette and ensure legible text.',
        fix: 'Add a near-black color like #1A1A1A or #111827.',
      });
    }

    // 5. No light anchor (luminance > 0.85)
    const hasLightAnchor = lums.some(l => l > 0.85);
    if (!hasLightAnchor && palette.length >= 3) {
      issues.push({
        id: 'no-light-anchor',
        severity: 'info',
        title: 'No light anchor color',
        desc: 'Your palette lacks a very light color (luminance > 85%). Light anchors provide breathing room and background options.',
        fix: 'Add a near-white color like #FFFFFF or #F9F9F9.',
      });
    }

    // 6. Insufficient luminance spread
    if (lums.length >= 3) {
      const lumSpread = Math.max(...lums) - Math.min(...lums);
      if (lumSpread < 0.15) {
        issues.push({
          id: 'low-luminance-spread',
          severity: 'error',
          title: 'Low luminance spread',
          desc: `All colors have similar brightness (spread: ${Math.round(lumSpread * 100)}%). This makes contrast difficult and the palette feels flat.`,
          fix: 'Add lighter or darker colors to increase the luminance range above 15%.',
        });
      }
    }

    // 7. Too-similar colors (RGB distance < 25)
    for (let i = 0; i < palette.length; i++) {
      for (let j = i + 1; j < palette.length; j++) {
        const dist = rgbDistance(palette[i].hex, palette[j].hex);
        if (dist < 25) {
          issues.push({
            id: `too-similar-${palette[i].id}-${palette[j].id}`,
            severity: 'warning',
            title: `${palette[i].hex} and ${palette[j].hex} are nearly identical`,
            desc: `These two colors are visually indistinguishable (RGB distance: ${Math.round(dist)}). Having them both adds no value.`,
            fix: `Remove or significantly differentiate one of them.`,
          });
        }
      }
    }

    // 8. Unintentional monochromatic (hue range < 30° with 3+ colors)
    if (palette.length >= 3) {
      const hsls = palette.map(c => hexToHsl(c.hex)).filter(Boolean);
      const hues = hsls.map(h => h.h);
      const hueRange = Math.max(...hues) - Math.min(...hues);
      if (hueRange < 30) {
        issues.push({
          id: 'monochromatic-unintentional',
          severity: 'info',
          title: 'All colors share similar hues',
          desc: `Your palette's hue range is only ${hueRange}°. If this isn't intentional, consider adding a contrasting hue.`,
          fix: 'Add a color at least 60° away in hue for visual interest.',
        });
      }
    }

    // 9. All colors at similar saturation (range < 10%)
    if (palette.length >= 3) {
      const hsls = palette.map(c => hexToHsl(c.hex)).filter(Boolean);
      const sats = hsls.map(h => h.s);
      const satRange = Math.max(...sats) - Math.min(...sats);
      if (satRange < 10) {
        issues.push({
          id: 'flat-saturation',
          severity: 'info',
          title: 'Uniform saturation across palette',
          desc: `All colors have similar saturation (range: ${satRange}%). This can make a palette feel one-dimensional.`,
          fix: 'Add at least one desaturated neutral to ground the palette.',
        });
      }
    }

    // 10. Text / Background contrast below 4.5:1
    const textColors = palette.filter(c => c.role === 'Text');
    const bgColors = palette.filter(c => c.role === 'Background');
    textColors.forEach(tc => {
      bgColors.forEach(bg => {
        const result = checkContrast(tc.hex, bg.hex);
        if (result && result.ratio < 4.5) {
          // Suggest a darker text or lighter bg fix
          const tcRgb = hexToRgb(tc.hex);
          const tcHsl = hexToHsl(tc.hex);
          const fixHex = hslToHex(tcHsl.h, tcHsl.s, Math.max(tcHsl.l - 20, 5));
          issues.push({
            id: `contrast-text-bg`,
            severity: 'error',
            title: 'Text/Background contrast fails WCAG AA',
            desc: `${tc.hex} on ${bg.hex} has a contrast ratio of ${result.ratio}:1. WCAG AA requires 4.5:1 for normal text.`,
            fix: `Try darkening the text color to ${fixHex}, or lighten the background.`,
            fixHex,
          });
        }
      });
    });

    // 11. Primary and Accent too similar
    const primary = palette.find(c => c.role === 'Primary');
    const accent = palette.find(c => c.role === 'Accent');
    if (primary && accent) {
      const dist = rgbDistance(primary.hex, accent.hex);
      if (dist < 40) {
        issues.push({
          id: 'primary-accent-similar',
          severity: 'warning',
          title: 'Primary and Accent colors are too similar',
          desc: 'Your Primary and Accent colors are visually close. They should be distinguishable to serve different design purposes.',
          fix: 'Make the Accent color more distinct — try adjusting hue by 30°+ or changing saturation significantly.',
        });
      }
    }

    return issues;
  }

  // ─── PALETTE GENERATORS ───────────────────────────────────────────────────

  /**
   * Random HSL in specified constraints.
   */
  function randomHsl(hRange, sRange, lRange) {
    const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    return {
      h: rnd(...hRange),
      s: rnd(...sRange),
      l: rnd(...lRange),
    };
  }

  /**
   * Generate a harmonically valid palette by type.
   * Returns array of hex strings (4–6 colors).
   */
  function generatePalette(type = 'random') {
    const colors = [];

    switch (type) {
      case 'warm': {
        // Reds, oranges, yellows
        const baseH = Math.floor(Math.random() * 60); // 0–60
        const baseS = 70 + Math.floor(Math.random() * 25);
        const baseL = 45 + Math.floor(Math.random() * 20);
        colors.push(hslToHex(baseH, baseS, baseL));
        colors.push(hslToHex((baseH + 20) % 60, baseS - 10, baseL + 15));
        colors.push(hslToHex((baseH + 40) % 60, baseS + 5, baseL - 15));
        colors.push(hslToHex(baseH, 15, 92));  // light neutral
        colors.push(hslToHex(baseH, 20, 15));  // dark anchor
        break;
      }
      case 'cool': {
        // Blues, cyans, purples
        const baseH = 180 + Math.floor(Math.random() * 80); // 180–260
        const baseS = 60 + Math.floor(Math.random() * 30);
        const baseL = 40 + Math.floor(Math.random() * 25);
        colors.push(hslToHex(baseH, baseS, baseL));
        colors.push(hslToHex((baseH + 25) % 360, baseS - 10, baseL + 18));
        colors.push(hslToHex((baseH - 25 + 360) % 360, baseS + 5, baseL - 12));
        colors.push(hslToHex(baseH, 15, 94));  // light
        colors.push(hslToHex(baseH, 25, 12));  // dark
        break;
      }
      case 'pastel': {
        const baseH = Math.floor(Math.random() * 360);
        for (let i = 0; i < 4; i++) {
          colors.push(hslToHex((baseH + i * 45) % 360, 40 + Math.floor(Math.random() * 25), 78 + Math.floor(Math.random() * 12)));
        }
        colors.push(hslToHex(0, 0, 20)); // dark anchor
        break;
      }
      case 'earthy': {
        const hues = [25, 35, 45, 55, 15, 200];
        const picked = hues.sort(() => Math.random() - 0.5).slice(0, 4);
        picked.forEach(h => {
          colors.push(hslToHex(h, 35 + Math.floor(Math.random() * 25), 35 + Math.floor(Math.random() * 25)));
        });
        colors.push(hslToHex(30, 10, 92));
        break;
      }
      case 'high-contrast': {
        colors.push('#FFFFFF');
        colors.push('#1A1A1A');
        const baseH = Math.floor(Math.random() * 360);
        colors.push(hslToHex(baseH, 90, 50));
        colors.push(hslToHex((baseH + 180) % 360, 85, 50));
        colors.push(hslToHex(baseH, 30, 85));
        break;
      }
      case 'monochromatic': {
        const baseH = Math.floor(Math.random() * 360);
        const baseS = 50 + Math.floor(Math.random() * 30);
        [15, 30, 50, 65, 80].forEach(l => {
          colors.push(hslToHex(baseH, baseS, l));
        });
        break;
      }
      case 'random':
      default: {
        // Random but harmonically valid — use triadic + neutrals
        const baseH = Math.floor(Math.random() * 360);
        const baseS = 55 + Math.floor(Math.random() * 35);
        const baseL = 40 + Math.floor(Math.random() * 25);
        colors.push(hslToHex(baseH, baseS, baseL));
        colors.push(hslToHex((baseH + 120) % 360, baseS - 5, baseL + 5));
        colors.push(hslToHex((baseH + 240) % 360, baseS + 5, baseL - 8));
        colors.push(hslToHex(baseH, 12, 94));  // near-white
        colors.push(hslToHex(baseH, 15, 13));  // near-black
        break;
      }
    }

    return colors;
  }

  // ─── IMAGE COLOR EXTRACTION ───────────────────────────────────────────────

  /**
   * Extract dominant colors from an ImageData pixel array using median-cut quantization.
   * Returns an array of up to `count` hex strings.
   */
  function extractColorsFromPixels(imageData, count = 6) {
    const { data, width, height } = imageData;
    const pixels = [];

    // Sample every 4th pixel for performance
    for (let i = 0; i < data.length; i += 16) {
      const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
      if (a < 128) continue; // skip transparent
      pixels.push([r, g, b]);
    }

    if (pixels.length === 0) return [];

    // Median cut quantization
    function medianCut(pixels, depth) {
      if (depth === 0 || pixels.length === 0) {
        // Return average color of this bucket
        const avg = [0, 0, 0];
        pixels.forEach(([r, g, b]) => { avg[0] += r; avg[1] += g; avg[2] += b; });
        const n = pixels.length;
        return [rgbToHex(Math.round(avg[0]/n), Math.round(avg[1]/n), Math.round(avg[2]/n))];
      }

      // Find channel with greatest range
      let ranges = [0, 1, 2].map(ch => {
        const vals = pixels.map(p => p[ch]);
        return { ch, range: Math.max(...vals) - Math.min(...vals) };
      });
      const { ch } = ranges.sort((a, b) => b.range - a.range)[0];

      // Sort and split
      pixels.sort((a, b) => a[ch] - b[ch]);
      const mid = Math.floor(pixels.length / 2);
      return [
        ...medianCut(pixels.slice(0, mid), depth - 1),
        ...medianCut(pixels.slice(mid), depth - 1),
      ];
    }

    const depth = Math.ceil(Math.log2(count));
    const extracted = medianCut(pixels, depth);

    // Deduplicate by removing colors too close to each other
    const unique = [];
    extracted.forEach(hex => {
      const tooClose = unique.some(u => rgbDistance(u, hex) < 30);
      if (!tooClose) unique.push(hex);
    });

    return unique.slice(0, count);
  }

  // ─── EXPORTS ──────────────────────────────────────────────────────────────

  return {
    hexToRgb,
    rgbToHex,
    rgbToHsl,
    hslToRgb,
    hexToHsl,
    hslToHex,
    getLuminance,
    contrastRatio,
    getWcagResults,
    checkContrast,
    rgbDistance,
    generateShades,
    getColorTemperature,
    getPaletteTemperature,
    getPaletteMood,
    getHarmony,
    simulateColorBlindness,
    getPaletteMetrics,
    analyzeIssues,
    generatePalette,
    extractColorsFromPixels,
  };

})();
