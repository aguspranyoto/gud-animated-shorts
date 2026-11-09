import React from "react";
import { useCurrentFrame } from "remotion";
import { PAPER } from "../styles/paperTheme";
import { chunkPhrases } from "./chunkPhrases";

interface BeatCaptionProps {
  text: string;
  start: number;
  end: number;
  bottomOffset?: number;
  now?: number; // global timeline frame (Sequence makes useCurrentFrame local)
  maxWords?: number; // default 8 — fits 2 lines at 38px on 1080px canvas
}

/**
 * BeatCaption — rock-solid caption card with active-word highlight.
 * Sentence/phrase-aware chunking: never cuts mid-phrase the way
 * fixed 5-word CHUNK did ("yang berat" / "satu" / "kena" hanging).
 *
 * Rules (SKILL.md §7a):
 * - max 8 words per card, max 2 lines. Full short sentence in ONE card.
 * - Long sentence (>8 words) splits at comma/conjunction, never mid-phrase.
 * - ONE caption visible at a time: guard is [start, end] with +2f grace only.
 * - Frozen card: no jitter/rotation/wiggle. Only the active word scales.
 */
export { chunkPhrases };

export const BeatCaption: React.FC<BeatCaptionProps> = ({
  text,
  start,
  end,
  bottomOffset = 120,
  now,
  maxWords = 8,
}) => {
  const local = useCurrentFrame();
  const frame = now ?? local;
  // Tight guard: only ONE beat's caption visible. Old end+15 overlapped
  // the next beat → two captions fighting on screen.
  if (frame < start || frame > end + 2) return null;

  const cards = chunkPhrases(text, maxWords);
  const totalFrames = Math.max(1, end - start);
  // Time-proportional card selection: card i holds words proportional to its length.
  const totalWords = cards.reduce((n, c) => n + c.length, 0);
  const t = Math.min(1, Math.max(0, (frame - start) / totalFrames));
  const targetWord = Math.min(totalWords - 1, Math.floor(t * totalWords));
  let acc = 0;
  let cardIdx = 0;
  for (let i = 0; i < cards.length; i++) {
    if (targetWord < acc + cards[i].length) {
      cardIdx = i;
      break;
    }
    acc += cards[i].length;
    cardIdx = i;
  }
  const card = cards[cardIdx];
  const activeInCard = Math.min(card.length - 1, Math.max(0, targetWord - acc));

  return (
    <div
      style={{
        position: "absolute",
        bottom: bottomOffset,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        zIndex: 999,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          backgroundColor: "#FFFFFF",
          padding: "16px 36px",
          borderRadius: "28px",
          maxWidth: "88%",
          textAlign: "center",
          boxShadow:
            "0 12px 28px rgba(35, 25, 20, 0.22), 0 3px 6px rgba(0, 0, 0, 0.08)",
          border: "2.5px solid #F3EFEA",
        }}
      >
        <span
          style={{
            fontFamily:
              "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            fontSize: "38px",
            fontWeight: 500,
            letterSpacing: "-0.2px",
            lineHeight: 1.35,
          }}
        >
          {card.map((w, i) => (
            <span
              key={`${cardIdx}-${i}`}
              style={{
                color: i === activeInCard ? PAPER.accent : PAPER.ink,
                transform: i === activeInCard ? "scale(1.08)" : "scale(1)",
                display: "inline-block",
                marginRight: i < card.length - 1 ? 16 : 0,
                textShadow:
                  i === activeInCard
                    ? "0 2px 12px rgba(216,64,47,0.4)"
                    : "none",
              }}
            >
              {w}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
};
