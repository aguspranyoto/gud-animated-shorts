import { spring } from "remotion";

/**
 * getEmotionSpring — canonical tag → spring config (SKILL.md §4).
 * ONLY these 9 tags exist. Anything else falls back to thoughtful
 * (deliberate placement) — never invent a new config per scene.
 *
 * ALWAYS feed the RAW continuous frame, never a stepped frame:
 *   const raw = useCurrentFrame();
 *   const pop = getEmotionSpring(raw, 30, "excited", 5);
 */
const CONFIGS: Record<string, { damping: number; stiffness: number; mass: number }> = {
  excited: { damping: 10, stiffness: 220, mass: 0.6 },
  curiously: { damping: 16, stiffness: 110, mass: 0.9 },
  confused: { damping: 16, stiffness: 110, mass: 0.9 },
  shocked: { damping: 7, stiffness: 320, mass: 0.4 },
  thoughtful: { damping: 20, stiffness: 140, mass: 1.1 },
  serious: { damping: 20, stiffness: 140, mass: 1.1 },
  sad: { damping: 24, stiffness: 60, mass: 1.4 },
  triumphant: { damping: 12, stiffness: 180, mass: 0.7 },
  whisper: { damping: 18, stiffness: 130, mass: 0.8 },
};

export const getEmotionSpring = (
  frame: number,
  fps: number,
  emotion: string,
  delay = 0
): number => {
  const config = CONFIGS[emotion] ?? CONFIGS.thoughtful;
  return spring({ frame: frame - delay, fps, config });
};
