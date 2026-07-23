/** Parse #RGB / #RRGGBB into r,g,b (0–255). */
export function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const raw = hex.replace("#", "").trim();
  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(raw)) return null;
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function toHex(n: number) {
  return Math.round(Math.min(255, Math.max(0, n)))
    .toString(16)
    .padStart(2, "0");
}

/** Mix hex toward black (amount 0–1). */
export function darkenHex(hex: string, amount = 0.35): string {
  const rgb = parseHex(hex);
  if (!rgb) return hex;
  const f = 1 - amount;
  return `#${toHex(rgb.r * f)}${toHex(rgb.g * f)}${toHex(rgb.b * f)}`;
}

/** Mix hex toward white (amount 0–1). */
export function lightenHex(hex: string, amount = 0.35): string {
  const rgb = parseHex(hex);
  if (!rgb) return hex;
  return `#${toHex(rgb.r + (255 - rgb.r) * amount)}${toHex(rgb.g + (255 - rgb.g) * amount)}${toHex(rgb.b + (255 - rgb.b) * amount)}`;
}

/** Relative luminance — true when color is light enough for dark text. */
export function isLightColor(hex: string): boolean {
  const rgb = parseHex(hex);
  if (!rgb) return false;
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.55;
}

/**
 * Shared band: lightened color at top, gradient only in the MID,
 * then solid pure white for the bottom (no fade lingering at the edge).
 */
export function heroBandGradient(bgColor: string): string {
  const top = lightenHex(bgColor, 0.14);
  const mid = lightenHex(bgColor, 0.32);
  // 0–30% color · 30–55% gradient in mid · 62–100% solid white
  return `linear-gradient(180deg, ${top} 0%, ${top} 28%, ${mid} 45%, #ffffff 62%, #ffffff 100%)`;
}

/**
 * Translucent color overlay ON slide images (image stays visible):
 * backend color tint at top → clear mid → soft white at bottom.
 */
export function slideImageGradient(bgColor: string): string {
  const top = lightenHex(bgColor, 0.1);
  // Alpha hex: ~55% top, ~30% mid, transparent, then white bottom
  return `linear-gradient(180deg, ${top}8C 0%, ${top}4D 38%, ${top}1A 55%, rgba(255,255,255,0.55) 82%, #ffffff 100%)`;
}

/** Approx combined height used for continuous background-size (header + hero). */
export const HERO_BAND_SIZE = "100% 920px";

/** Approx bottom-header height — used to offset hero gradient. */
export const BOTTOM_HEADER_OFFSET = 56;
