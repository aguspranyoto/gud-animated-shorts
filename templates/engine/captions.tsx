// Caption overlay in the reference-channel style (see references/frames/*.jpg):
// one chunk of max 2 words, a single line, white bold sans with a black outline,
// centred lower-middle (~64 % of frame height), hard swaps on word timing.
// Always on: render it in every short.
// Timing source of truth is the scene's voice/words.json [{ w, s, e }] in seconds;
// every caption check is timed to words.json, like every visual reaction.
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

export type Word = { w: string; s: number; e: number };
export type Chunk = { text: string; s: number; e: number };

/** group words into hard-swapping chunks of at most `n` words (reference: 2).
 *  Greedy pairs in word order; the last chunk may hold 1 word. Casing and
 *  punctuation stay as spoken ("thanks.", "seventy-seven,"). */
export const chunkWords = (words: Word[], n = 2): Chunk[] => {
  const out: Chunk[] = [];
  for (let i = 0; i < words.length; i += n) {
    const g = words.slice(i, i + n);
    out.push({ text: g.map((x) => x.w).join(" "), s: g[0].s, e: g[g.length - 1].e });
  }
  return out;
};

/** chunk visible at time t (seconds); null in the gaps between chunks */
export const captionAt = (chunks: Chunk[], t: number): Chunk | null =>
  chunks.find((c) => t >= c.s && t < c.e) ?? null;

/** px values are specified at 1080x1920; being DOM, they scale with --scale automatically */
export const CAPTION_TOP_PCT = 64; // centre of the line sits ~64 % down the frame (reference: 60-74 %)
export const CAPTION_FONT_PX = 80;
export const CAPTION_STROKE_PX = 5;

/** black outline that also renders in headless Chromium: -webkit-text-stroke
 *  paints over the fill there (and paint-order is SVG-only), so the outline is
 *  built from 8-direction text-shadows instead. Same look in every browser. */
const outlineShadows = (px: number, color = "#000000") => {
  const d = Math.round(px / 2.5);
  const o = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
    [-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7],
  ];
  return o.map(([x, y]) => `${Math.round(x * px)}px ${Math.round(y * px)}px 0 ${color}`).join(", ")
    + `, 0 0 ${d}px ${color}`;
};

export const CaptionOverlay: React.FC<{ words: Word[]; fps?: number; maxWords?: number }> = ({
  words, fps = 30, maxWords = 2,
}) => {
  const f = useCurrentFrame();
  const chunks = useMemo(() => chunkWords(words, maxWords), [words, maxWords]);
  const c = captionAt(chunks, f / fps);
  if (!c) return null;
  return (
    <AbsoluteFill style={{ alignItems: "center", pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: `${CAPTION_TOP_PCT}%`,
          transform: "translateY(-50%)",
          maxWidth: "92%",
          whiteSpace: "nowrap",
          textAlign: "center",
          fontFamily: '"Arial Black", Arial, Helvetica, sans-serif',
          fontWeight: 900,
          fontSize: CAPTION_FONT_PX,
          lineHeight: 1.1,
          color: "#ffffff",
          textShadow: outlineShadows(CAPTION_STROKE_PX),
        }}
      >
        {c.text}
      </div>
    </AbsoluteFill>
  );
};
