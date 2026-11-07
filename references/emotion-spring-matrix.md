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

## 3. Stop-Motion Wiggle Generator

To give 2D SVG or image cutouts the tactile feel of manual stop-motion manipulation:

```typescript
import { useCurrentFrame } from "remotion";

export const usePaperWiggle = (step = 2, intensity = 1.0) => {
  const frame = useCurrentFrame();
  const stepped = Math.floor(frame / step) * step;

  // Pseudo-random deterministic hash based on stepped frame
  const pseudoRandom = Math.sin(stepped * 999.0) * 10000;
  const normalized = pseudoRandom - Math.floor(pseudoRandom);

  const rotate = (normalized * 2 - 1) * 1.5 * intensity; // -1.5deg to +1.5deg
  const deltaX = (Math.cos(stepped * 1.3) * 1.5) * intensity;
  const deltaY = (Math.sin(stepped * 1.7) * 1.5) * intensity;

  return { rotate, deltaX, deltaY };
};
```

