# Emotion-to-Spring Matrix & Stop-Motion Choreography

This reference specifies the exact Remotion `spring()` configurations, micro-choreography, visual cues, and SFX associations for every emotion tag found in `script.txt`.

---

## 1. Spring Physics Reference Table

| Emotion Tag | Damping | Stiffness | Mass | Overshoot Clamping | Visual Transition Pattern |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `[excited]` | 10 | 220 | 0.6 | `false` | Bouncy pop-in, 1.15x scale overshoot, playful wiggle ($\pm 4^\circ$) |
| `[curiously]` | 16 | 110 | 0.9 | `false` | Slow tilt ($8^\circ$), elevation lift, question mark pop-up |
| `[shocked]` | 7 | 320 | 0.4 | `false` | High-energy jump ($-40\text{px}$), rapid shadow expansion, camera shake |
| `[thoughtful]` | 20 | 140 | 1.1 | `true` | Deliberate placement, slides in with firm thud, no bounce |
| `[sad]` / `[down]` | 24 | 60 | 1.4 | `true` | Sluggish descent, downward sag ($-6^\circ$), slow drop |
| `[serious]` / `[tegas]`| 18 | 200 | 1.0 | `true` | Stamp / hammer slam (`scale: 1.4 -> 1.0`), heavy shadow snap |
| `[triumphant]` | 12 | 170 | 0.7 | `false` | Ascending pop, expanding paper sunburst/rays in background |
| `[whisper]` | 18 | 130 | 0.8 | `true` | Low-profile slide from behind an existing cutout layer |
| `[confused]` | 12 | 140 | 0.8 | `false` | Alternating tilt (left-right-left wobble, $\pm 5^\circ$) |

---

## 2. Dynamic Elevation & Cast Shadows (2.5D Lighting)

In papercraft cutout, depth is primarily expressed through shadows cast on the surface:

```typescript
// Elevation Levels (Z-axis in pixels):
// Z0 = 0px:   Desk / Base Paper
// Z1 = 5px:   Underlays, paper tracks, flat background decor
// Z2 = 15px:  Main props, buildings, scenery
// Z3 = 30px:  Characters, interactive items, jumping elements
// Z4 = 60px+: Floating clouds, airplane, soaring cutouts

export const getPaperShadow = (elevationZ: number) => {
  const x = Math.round(elevationZ * 0.4);
  const y = Math.round(elevationZ * 0.8);
  const blur = Math.round(elevationZ * 0.9 + 2);
  const alpha = Math.max(0.12, 0.42 - elevationZ * 0.004);

  return `drop-shadow(${x}px ${y}px ${blur}px rgba(35, 25, 20, ${alpha.toFixed(2)}))`;
};
```

---

## 3. Settle Wiggle Generator

To give 2D SVG or image cutouts the tactile feel of manual stop-motion manipulation, use a BOUNDED, decaying wobble — never a free-running one.

> [!CAUTION]
> There is NO free-running wiggle hook in this project — do not create one.
> An infinite wiggle on every element makes the whole frame vibrate.
> `useSettleWiggle` (below) runs on ONE hero element per scene (12–20 frames
> post-entrance, `intensity ≤ 0.5`), then frozen. Backgrounds, walls,
> badges, and captions get zero motion — default state is FROZEN.

```typescript
// Preferred: bounded settle wobble, then frozen
export const useSettleWiggle = (
  rawFrame: number,
  opts: { startFrame: number; durationFrames?: number; intensity?: number } = { startFrame: 0 }
) => {
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
```

## 4. Motion Ownership & Spring Input Rule

1. **One motion owner per element per beat.** NEVER stack `spring scale` +
   `wiggle rotate` + `sin pulse translateY` on the same `<div>`. Pick ONE:
   entrance spring then freeze, settle-wiggle then freeze, or ambient float
   (airborne things only, amplitude ≤ 4px, period ≥ 60 frames).
2. **`spring()` takes the RAW frame, never the stepped frame.**
   `useStopMotionFrame()` is for stepped positions only. Feeding stepped
   frames into a spring creates stutter-overshoot that never settles:

```tsx
// CORRECT
const rawFrame = useCurrentFrame();
const pop = getEmotionSpring(rawFrame, 30, "excited", 5);

// WRONG — do not do this
const frame = useStopMotionFrame(2);
const pop = getEmotionSpring(frame, 30, "excited", 5); // ❌
```

