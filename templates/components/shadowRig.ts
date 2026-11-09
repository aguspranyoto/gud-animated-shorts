/**
 * shadowRig — single source of truth for the §5.2 elevation → shadow ladder.
 * Pure module, ZERO imports: node can unit-test it without Remotion.
 * (Piecewise-linear, clamped — same curve as remotion's interpolate().)
 *
 * Formula (frame-004): light top-left (~315°), shadow falls bottom-RIGHT
 * (+x, +y), warm umber rgba(35,25,20,α). Higher elevation = further,
 * softer, fainter. Never eyeball per scene — if it looks wrong, the
 * prop's elevation value is wrong, not this ladder.
 */
const XS = [2, 5, 9, 16, 24];
const YS = [3, 8, 18, 32, 50];
const BLURS = [3, 8, 16, 30, 46];
const ALPHAS = [0.42, 0.34, 0.26, 0.18, 0.12];

const seg = (e: number, arr: number[]): number => {
  const c = Math.max(0, Math.min(4, e));
  const i = Math.min(3, Math.floor(c));
  const f = c - i;
  return arr[i] + (arr[i + 1] - arr[i]) * f;
};

export interface ShadowSpec {
  x: number;
  y: number;
  blur: number;
  alpha: number;
}

export const shadowForElevation = (elevation: number): ShadowSpec => ({
  x: seg(elevation, XS),
  y: seg(elevation, YS),
  blur: seg(elevation, BLURS),
  alpha: seg(elevation, ALPHAS),
});

/** CSS drop-shadow string from an elevation value. */
export const shadowCss = (elevation: number): string => {
  const s = shadowForElevation(elevation);
  return `drop-shadow(${s.x}px ${s.y}px ${s.blur}px rgba(35, 25, 20, ${s.alpha}))`;
};
