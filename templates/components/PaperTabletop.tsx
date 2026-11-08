import React from "react";
import { AbsoluteFill } from "remotion";
import { FIBER_GRAIN, TABLETOPS } from "../styles/paperTheme";

export interface PaperTabletopProps {
  /** Preset key or raw color. Default "kraft" — the references' default table. */
  tone?: keyof typeof TABLETOPS | string;
  /** Top-down window-light wash angle (deg). Default 135 (diagonal shaft). */
  lightAngle?: number;
  /** Optional extra CSS layered ABOVE the light wash, BELOW the grain. */
  backdrop?: React.CSSProperties;
  children?: React.ReactNode;
}

/**
 * PaperTabletop — FULL-BLEED tactile table surface. Every scene sits on this;
 * flat solid-color voids are banned (§5.7 rule 1). Layers, bottom → top:
 *   1. base color/tone
 *   2. optional backdrop (map print, sky gradient wash, diorama base)
 *   3. diagonal window-light wash (soft warm shaft, cf. image_010 / image_070)
 *   4. fiber grain overlay (always on, multiply blend)
 *   5. scene children
 */
export const PaperTabletop: React.FC<PaperTabletopProps> = ({
  tone = "kraft",
  lightAngle = 135,
  backdrop = {},
  children,
}) => {
  const base = (TABLETOPS as Record<string, string>)[tone] ?? tone;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: base,
        overflow: "hidden",
      }}
    >
      {/* 2 — optional printed/painted backdrop */}
      <AbsoluteFill style={backdrop} />
      {/* 3 — diagonal window-light wash */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(${lightAngle}deg, rgba(255,250,235,0.22) 0%, rgba(255,250,235,0.06) 38%, rgba(40,25,15,0.00) 55%, rgba(40,25,15,0.14) 100%)`,
          pointerEvents: "none",
        }}
      />
      {/* 4 — fiber grain, always on */}
      <AbsoluteFill
        style={{
          backgroundImage: FIBER_GRAIN,
          opacity: 0.5,
          mixBlendMode: "multiply",
          pointerEvents: "none",
        }}
      />
      {/* 5 — scene content */}
      {children}
    </AbsoluteFill>
  );
};
