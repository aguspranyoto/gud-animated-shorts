import React from "react";
import { PAPER } from "../styles/paperTheme";
import { SvgCutout } from "./SvgCutout";

/**
 * PaperHand — EXAMPLE, not production art. Delete this file once you have
 * a real traced hand (Step 4a): screenshot frame-004 → Trace Bitmap →
 * save as `src/videos/<slug>/assets/hand.ts`, render via SvgCutout.
 *
 * This placeholder exists ONLY so the composition compiles before the
 * trace lands. Its layered structure IS the spec the trace must keep:
 *  - forearm off-frame + knuckle ridge (anchor, never a wrist stub)
 *  - palm at elevation Z4 (far faint halo shadow)
 *  - index finger pressing ON the prop (zIndex above hero object)
 *  - curled fingers BEHIND the prop (pinch reads THROUGH it)
 *  - thumb layer behind everything
 * A flat single-path hand with no layers = fail, however good the trace.
 */

export interface PaperHandProps {
  x?: number;
  y?: number; // fingertip touch point on the prop
  r?: number;
  s?: number; // 1.6-2.2 — GIANT, dwarfs the prop (§5.7 rule 4)
  from?: "top" | "left" | "right";
}

// Placeholder blob paths — REPLACE with the frame-004 trace (Step 4a).
// Same viewBox contract the real asset keeps: 0 0 260 480.
const PALM_D =
  "M70,240 C60,180 80,140 130,138 C180,136 200,176 192,240 L186,330 C184,360 160,372 130,370 C100,368 76,356 74,330 Z";
const FINGER_D =
  "M100,330 C96,290 98,250 106,220 C112,200 132,200 136,220 L144,330 C146,356 122,360 112,352 C104,346 101,338 100,330 Z";
const THUMB_D =
  "M60,250 C40,240 28,220 34,200 C40,182 62,184 74,200 L100,240 C110,256 100,272 84,270 C74,268 66,260 60,250 Z";

export const PaperHand: React.FC<PaperHandProps> = ({
  x = 400,
  y = 640,
  r = 0,
  s = 1.8,
  from = "top",
}) => {
  const armLen = from === "top" ? y : 420 * s;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: from === "top" ? y - armLen - 300 * s : y,
        width: 260 * s,
        height: armLen + 480 * s,
        transform: `rotate(${r}deg)`,
        transformOrigin: "top center",
        zIndex: 60,
        pointerEvents: "none",
      }}
    >
      {/* forearm — runs OFF the frame edge, never a stub */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 60 * s,
          width: 140 * s,
          height: armLen,
          backgroundColor: PAPER.skin,
          boxShadow: "10px 18px 30px rgba(35,25,20,0.35)",
        }}
      />
      {/* knuckle ridge */}
      <div
        style={{
          position: "absolute",
          top: armLen - 30 * s,
          left: 52 * s,
          width: 156 * s,
          height: 60 * s,
          backgroundColor: PAPER.skinShade,
          borderRadius: "20px",
        }}
      />
      {/* thumb BEHIND prop */}
      <SvgCutout
        d={THUMB_D}
        viewBox="0 0 260 480"
        w={130 * s}
        fill={PAPER.skinShade}
        elevation={2}
        style={{ position: "absolute", top: armLen + 40 * s, left: 10 * s, zIndex: -1 }}
      />
      {/* palm Z4 + index ON prop + curled fingers BEHIND */}
      <SvgCutout
        d={PALM_D}
        viewBox="0 0 260 480"
        w={200 * s}
        fill={PAPER.skin}
        elevation={4}
        style={{ position: "absolute", top: armLen, left: 30 * s }}
      />
      <SvgCutout
        d={FINGER_D}
        viewBox="0 0 260 480"
        w={150 * s}
        fill={PAPER.skin}
        elevation={4}
        style={{ position: "absolute", top: armLen + 100 * s, left: 75 * s, zIndex: 2 }}
      />
      {[0, 1].map((i) => (
        <SvgCutout
          key={i}
          d={FINGER_D}
          viewBox="0 0 260 480"
          w={130 * s}
          fill={PAPER.skinShade}
          elevation={2}
          style={{
            position: "absolute",
            top: armLen + 60 * s + i * 40 * s,
            left: (130 + i * 30) * s,
            transform: `rotate(${-18 - i * 10}deg)`,
          }}
        />
      ))}
    </div>
  );
};
