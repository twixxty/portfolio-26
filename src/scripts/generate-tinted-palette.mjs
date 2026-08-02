// Takes the raw text of colors.css and re-hues every variable using a single
// hue+saturation pulled from the hero wallpaper (the same idea Material You /
// Android's dynamic color uses), while preserving each variable's original
// lightness and alpha. That keeps every existing contrast/tonal relationship
// in colors.css intact (a background stays darker than the text that sits on
// it, hairline borders stay just as subtle) — only the color cast changes.
//
// Values written by hand as `transparent` are left untouched. Everything
// else (#hex, #hexa, rgb(r g b / a)) gets converted to HSL, re-hued, and
// converted back in whichever format it was originally written in.

function hexToRgba(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3 || h.length === 4) {
    h = h.split('').map((c) => c + c).join('');
  }
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
  return { r, g, b, a };
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToRgb(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  };
}

function toHex2(n) {
  return n.toString(16).padStart(2, '0');
}

export function hexToHsl(hex) {
  const { r, g, b } = hexToRgba(hex);
  return rgbToHsl(r, g, b);
}

/**
 * @param {string} cssText raw contents of colors.css
 * @param {number} tintHue 0-360, dominant hue pulled from the hero image
 * @param {number} tintSaturation 0-100, how colorful the tint should read (kept low for a UI palette — try 8-20)
 * @returns {string} a `:root { --name:value; ... }` block with every variable re-hued
 */
export function generateTintedPalette(cssText, tintHue, tintSaturation) {
  const varPattern = /(--[\w-]+)\s*:\s*([^;]+);/g;
  const outLines = [];
  let match;

  while ((match = varPattern.exec(cssText))) {
    const [, name, rawValue] = match;
    const value = rawValue.trim();

    if (value === 'transparent' || value.startsWith('var(')) {
      // Nothing to re-hue — pass through as-is.
      outLines.push(`${name}:${value}`);
      continue;
    }

    let rgba = null;
    let format = null;

    if (value.startsWith('#')) {
      rgba = hexToRgba(value);
      format = 'hex';
    } else {
      const rgbMatch = value.match(
        /rgba?\(\s*(\d+)\s+(\d+)\s+(\d+)\s*(?:\/\s*([\d.]+))?\s*\)/
      );
      if (rgbMatch) {
        rgba = {
          r: Number(rgbMatch[1]),
          g: Number(rgbMatch[2]),
          b: Number(rgbMatch[3]),
          a: rgbMatch[4] !== undefined ? Number(rgbMatch[4]) : 1,
        };
        format = 'rgb';
      }
    }

    if (!rgba) {
      // Unrecognized value shape — leave untouched rather than risk corrupting it.
      outLines.push(`${name}:${value}`);
      continue;
    }

    const { l } = rgbToHsl(rgba.r, rgba.g, rgba.b);
    const { r, g, b } = hslToRgb(tintHue, tintSaturation, l);

    if (format === 'hex') {
      const alphaHex = rgba.a < 1 ? toHex2(Math.round(rgba.a * 255)) : '';
      outLines.push(`${name}:#${toHex2(r)}${toHex2(g)}${toHex2(b)}${alphaHex}`);
    } else {
      outLines.push(`${name}:rgb(${r} ${g} ${b} / ${rgba.a})`);
    }
  }

  return `:root{${outLines.join(';')}}`;
}
