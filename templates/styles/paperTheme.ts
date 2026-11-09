import type { CSSProperties } from "react";

/**
 * paperTheme — canonical art-direction tokens for the papercraft look.
 * Values sampled from references/video/frames/: kraft tabletops, off-white paper,
 * one muted red accent, dusty secondaries. Never use pure-neon fills
 * (cyan water, #FF0000 bars) — mute brights toward paper (see WATER/HEAT).
 */

export const PAPER = {
  /** Default paper surface — warm off-white, never pure #FFF. */
  paper: "#FFFDF8",
  /** Shaded paper (undersides, recessed layers). */
  paperShade: "#F1EAD9",
  /** Cut-edge / hairline borders on paper. */
  paperEdge: "#E9E0CE",
  /** Ink for text on paper. Warm near-black, never pure #000. */
  ink: "#2A2320",
  /** The ONE accent: ribbons, arrows, highlights, active caption words. */
  accent: "#D8402F",
  /** Muted water/diagram blue (NOT neon cyan). */
  water: "#6FA8BF",
  /** Muted heat red (NOT pure red). */
  heat: "#C4452B",
  /** Dusty secondaries for diagrams. */
  sage: "#8AA07A",
  dustyBlue: "#7C8DA0",
  /** Skin kraft for the giant placing hand (cf. frame-004). */
  skin: "#C9A87B",
  /** Skin shadow side (curled fingers, arm edge). */
  skinShade: "#B8946A",
} as const;

export const TABLETOPS = {
  /** Default tabletop — kraft cardboard, cf. image_010. */
  kraft: "#C9A87B",
  /** Neutral warm gray tabletop, cf. image_070. */
  warmGray: "#B7AB97",
  /** Cool scene backdrop, cf. image_030. */
  slateBlue: "#9FB3C0",
  /** Dark stage backdrop for night/dramatic beats. */
  charcoal: "#5A5650",
} as const;

/** Real cardstock edge on a 1080px canvas reads at 8–12px, corners never identical. */
export const PAPER_RADIUS = "18px 22px 20px 24px";

/** Small pill radius for captions/labels. */
export const PILL_RADIUS = "26px";

/** Warm cast shadow — the ONLY shadow color. Never neutral gray / black-only. */
export const warmShadow = (x: number, y: number, blur: number, alpha: number): string =>
  `${x}px ${y}px ${blur}px rgba(35, 25, 20, ${alpha})`;

/**
 * Raw grain data-URIs (no url() wrapper). TWO consumers, two formats:
 *  - CSS `backgroundImage` needs url("data:...") → use FIBER_GRAIN / FIBER_BLOTCH.
 *  - SVG <image href> needs raw data:... → use GRAIN_SRC / BLOTCH_SRC.
 * Mixing them 404s (the proof-still failure). Never hand-wrap; import the right one.
 */
export const GRAIN_SRC =
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='260'` +
  `%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' ` +
  `stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' ` +
  `opacity='0.6'/%3E%3C/svg%3E`;

/** Procedural paper-fiber grain for CSS backgrounds. */
export const FIBER_GRAIN = `url("${GRAIN_SRC}")`;

export const BLOTCH_SRC =
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='520' height='520'` +
  `%3E%3Cfilter id='b'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.035' numOctaves='3' ` +
  `stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23b)' ` +
  `opacity='0.55'/%3E%3C/svg%3E`;

/**
 * Large-scale paper mottling (low-frequency blotches) for CSS backgrounds.
 * Fine FIBER_GRAIN alone crushes in H264 — blotches survive compression
 * and are what reads as "paper" on phone screens (cf. frame-004 hand/table).
 * Always paired with FIBER_GRAIN, never alone.
 */
export const FIBER_BLOTCH = `url("${BLOTCH_SRC}")`;

/**
 * Grain overlay style for cutouts (§5.5: grain opacity ≥ 0.25 ON the cutout,
 * not only on the tabletop — tabletop-only grain is invisible after compression).
 * Render as an absolutely-positioned div on top of the cutout content:
 *
 *   <div style={{ position: "relative" }}>
 *     {content}
 *     <div style={grainOverlay(0.32)} />
 *   </div>
 */
export const grainOverlay = (opacity = 0.32): CSSProperties => ({
  position: "absolute",
  inset: 0,
  backgroundImage: FIBER_GRAIN,
  opacity,
  mixBlendMode: "multiply",
  pointerEvents: "none",
});
