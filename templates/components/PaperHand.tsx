import React from "react";
import { PAPER } from "../styles/paperTheme";
import { PaperCutout } from "./PaperCutout";

export interface PaperHandProps {
  /** "place" = full arm entering from top edge (frame-004 depth shot).
   *  "point" = floating cuff + index finger for mid-scene pointing. */
  variant?: "place" | "point";
  /** Left position of the hand assembly. */
  x?: number;
  /** Top position; for "place" this is where fingers touch the prop. */
  y?: number;
  /** Rotation in degrees. */
  r?: number;
  /** Scale. For "place" keep 1.6-2.2 so the hand reads GIANT in foreground. */
  s?: number;
  /** "left" | "right" — which side the cuff attaches. Default "top". */
  from?: "top" | "left" | "right";
  children?: React.ReactNode;
}

/**
 * PaperHand — the frame-004 depth device, locked as a template.
 *
 * What makes frame-004 read 2.5D (all mandatory in "place" variant):
 *  1. GIANT foreground hand (s 1.6-2.2) overlapping the hero prop —
 *     fingers land ON TOP of the prop, cuff bleeds OFF the top edge.
 *     A small floating hand reads as a sticker; an overlapping giant
 *     reads as a real hand reaching into the set.
 *  2. Thick cuff/sleeve (accent or kraft, ≥90px tall at s=1) anchoring
 *     the hand to outside the frame — never a floating wrist stub.
 *  3. Layered fingers: each finger its own strip with its own shadow,
 *     thumb as separate layer BEHIND the prop (fingers pinch THROUGH it).
 *  4. Room to breathe: the hand enters on an open vertical lane —
 *     no title badge or caption may sit where fingers land.
 *
 * Banned: cropped-at-edge finger stubs (the jatuh-benda-berat failure),
 * floating wrist with no cuff, hand same scale as props.
 */
export const PaperHand: React.FC<PaperHandProps> = ({
  variant = "place",
  x = 350,
  y = 300,
  r = 0,
  s = 1.8,
  from = "top",
  children,
}) => {
  if (variant === "point") {
    return (
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: 200 * s,
          height: 300 * s,
          transform: `rotate(${r}deg)`,
          zIndex: 50,
        }}
      >
        {/* cuff */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 50 * s,
            width: 110 * s,
            height: 90 * s,
            backgroundColor: PAPER.accent,
            borderRadius: "10px",
            boxShadow: "5px 8px 14px rgba(35,25,20,0.3)",
          }}
        />
        {/* palm */}
        <PaperCutout elevation={3} liftProgress={0.6}>
          <div
            style={{
              width: 138 * s,
              height: 108 * s,
              backgroundColor: PAPER.paper,
              borderRadius: "52px",
            }}
          />
        </PaperCutout>
        {/* fingers */}
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 158 * s,
              left: (44 + i * 32) * s,
              width: 26 * s,
              height: 105 * s,
              backgroundColor: PAPER.paper,
              borderRadius: "13px",
              boxShadow: "4px 6px 10px rgba(35,25,20,0.28)",
            }}
          />
        ))}
        {/* thumb */}
        <div
          style={{
            position: "absolute",
            top: 108 * s,
            left: 6 * s,
            width: 28 * s,
            height: 80 * s,
            backgroundColor: PAPER.paper,
            borderRadius: "14px",
            transform: "rotate(32deg)",
            boxShadow: "4px 6px 10px rgba(35,25,20,0.28)",
          }}
        />
        {children}
      </div>
    );
  }

  // "place" — frame-004 giant placing hand. Cuff off-frame, fingers on prop.
  const armLen = from === "top" ? y + 200 : 420 * s;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: from === "top" ? y - armLen : y,
        width: 260 * s,
        height: armLen + 320 * s,
        transform: `rotate(${r}deg)`,
        transformOrigin: "top center",
        zIndex: 60,
        pointerEvents: "none",
      }}
    >
      {/* forearm — kraft skin tone, runs off the frame edge */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 60 * s,
          width: 140 * s,
          height: armLen,
          backgroundColor: "#C9A87B",
          boxShadow: "10px 18px 30px rgba(35,25,20,0.35)",
        }}
      />
      {/* knuckle ridge where arm meets hand */}
      <div
        style={{
          position: "absolute",
          top: armLen - 30 * s,
          left: 52 * s,
          width: 156 * s,
          height: 60 * s,
          backgroundColor: "#B8946A",
          borderRadius: "20px",
        }}
      />
      {/* palm — giant, overlaps hero prop */}
      <PaperCutout elevation={4} liftProgress={0.8}>
        <div
          style={{
            width: 150 * s,
            height: 170 * s,
            backgroundColor: "#C9A87B",
            borderRadius: "40px",
          }}
        />
      </PaperCutout>
      {/* index finger pressing ON the prop */}
      <div
        style={{
          position: "absolute",
          top: armLen + 130 * s,
          left: 95 * s,
          width: 52 * s,
          height: 170 * s,
          backgroundColor: "#C9A87B",
          borderRadius: "26px",
          boxShadow: "8px 14px 24px rgba(35,25,20,0.4)",
        }}
      />
      {/* fingertip nail */}
      <div
        style={{
          position: "absolute",
          top: armLen + 250 * s,
          left: 102 * s,
          width: 38 * s,
          height: 46 * s,
          backgroundColor: PAPER.paperShade,
          borderRadius: "14px",
        }}
      />
      {/* curled middle fingers behind prop */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: armLen + 60 * s + i * 34 * s,
            left: (150 + i * 12) * s,
            width: 46 * s,
            height: 90 * s,
            backgroundColor: "#B8946A",
            borderRadius: "22px",
            transform: `rotate(${-18 - i * 8}deg)`,
            boxShadow: "6px 10px 18px rgba(35,25,20,0.32)",
          }}
        />
      ))}
      {/* thumb layer behind (pinch reads THROUGH the prop) */}
      <div
        style={{
          position: "absolute",
          top: armLen + 40 * s,
          left: 20 * s,
          width: 50 * s,
          height: 130 * s,
          backgroundColor: "#B8946A",
          borderRadius: "25px",
          transform: "rotate(28deg)",
          boxShadow: "6px 10px 18px rgba(35,25,20,0.32)",
          zIndex: -1,
        }}
      />
      {children}
    </div>
  );
};
