import { useCurrentFrame } from "remotion";

/**
 * useStopMotionFrame
 * Quantizes continuous timeline frames into stepped frames (e.g. 15 fps or 10 fps on a 30 fps timeline)
 * Use for STEPPED POSITIONS only (slide waypoints, slide-in offsets).
 * NEVER feed this into spring() / getEmotionSpring() — springs need the raw
 * continuous frame to resolve their own curve. Stepping a spring input
 * creates stutter-overshoot that never settles.
 * @param step Number of native frames per stop-motion key (default 2 -> 15 fps at 30 fps)
 */
export const useStopMotionFrame = (step: number = 2): number => {
  const frame = useCurrentFrame();
  return Math.floor(frame / step) * step;
};

/**
 * useSettleWiggle — the ONLY idle-motion hook.
 * Plays a decaying wobble inside [startFrame, startFrame + durationFrames],
 * then returns exactly { rotate: 0, deltaX: 0, deltaY: 0 } — frozen.
 *
 * @example
 * const rawFrame = useCurrentFrame();
 * const pop = getEmotionSpring(rawFrame, 30, "excited", 5); // raw frame!
 * const settle = useSettleWiggle(rawFrame, { startFrame: 25, durationFrames: 16, intensity: 0.5 });
 */
export const useSettleWiggle = (
  rawFrame: number,
  opts: { startFrame: number; durationFrames?: number; intensity?: number } = { startFrame: 0 }
): { rotate: number; deltaX: number; deltaY: number } => {
  const { startFrame, durationFrames = 16, intensity = 0.5 } = opts;
  const t = (rawFrame - startFrame) / durationFrames;
  if (t < 0 || t > 1) return { rotate: 0, deltaX: 0, deltaY: 0 };
  const decay = (1 - t) * (1 - t);
  return {
    rotate: Math.sin(t * Math.PI * 3) * 1.2 * intensity * decay,
    deltaX: Math.cos(t * Math.PI * 2) * 2 * intensity * decay,
    deltaY: Math.sin(t * Math.PI * 2) * 2 * intensity * decay,
  };
};
