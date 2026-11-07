import { useCurrentFrame } from "remotion";

/**
 * useStopMotionFrame
 * Quantizes continuous timeline frames into stepped frames (e.g. 15 fps or 10 fps on a 30 fps timeline)
 * @param step Number of native frames per stop-motion key (default 2 -> 15 fps at 30 fps)
 */
export const useStopMotionFrame = (step: number = 2): number => {
  const frame = useCurrentFrame();
  return Math.floor(frame / step) * step;
};

/**
 * usePaperWiggle
 * Generates organic micro-wobble to simulate hands repositioning paper cutouts between frames
 */
export const usePaperWiggle = (step: number = 2, intensity: number = 1.0) => {
  const frame = useCurrentFrame();
  const stepped = Math.floor(frame / step) * step;

  const pseudoRandom = Math.sin(stepped * 999.0) * 10000;
  const normalized = pseudoRandom - Math.floor(pseudoRandom);

  const rotate = (normalized * 2 - 1) * 1.5 * intensity;
  const deltaX = Math.cos(stepped * 1.3) * 1.5 * intensity;
  const deltaY = Math.sin(stepped * 1.7) * 1.5 * intensity;

  return { rotate, deltaX, deltaY };
};

