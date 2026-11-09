import React from "react";
import { FIBER_BLOTCH, FIBER_GRAIN } from "../styles/paperTheme";
import { shadowCss } from "./shadowRig";

export interface PaperCutoutProps {
  children: React.ReactNode;
  elevation?: number; // 0 to 4
  liftProgress?: number; // 0 to 1
  whiteBorder?: boolean;
  borderWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const PaperCutout: React.FC<PaperCutoutProps> = ({
  children,
  elevation = 1,
  liftProgress = 0,
  whiteBorder = false,
  borderWidth = 10,
  className = "",
  style = {},
}) => {
  // Shadow rig — THE depth cue (frame-004). Formula, never eyeball:
  // light comes top-left (~315°), shadow falls bottom-RIGHT (+x, +y),
  // warm umber rgba(35,25,20,α) — NEVER neutral gray / black-only.
  // As elevation rises: shadow shifts FURTHER, gets SOFTER, goes LIGHTER.
  //   Z0 resting  → tight dark contact (α .38, blur 2) — grounds the prop
  //   Z2 floating  → lifted soft (α .26, blur 12)
  //   Z4 hero-high → far faint halo (α .14, blur 38) — giant hand territory
  // A shadow that's too dark + too sharp at high elevation = sticker look.
  // A missing shadow = floating-in-void fail (§5.8 gate auto-FAILS).
  // Single source of truth: shadowCss() from shadowRig.ts (pure, node-testable).
  const currentElevation = elevation + liftProgress * 2.5;

  // whiteBorder guide: silhouette props (stone, feather, hand, astronaut)
  // MUST use whiteBorder={false} — a rectangular white box behind a
  // clipPath polygon destroys the silhouette. whiteBorder={true} (8-12px
  // cardstock edge) is only for rectangular cards/boards. §5.5.
  // Grain layers below are ALWAYS on: tabletop-only grain is invisible
  // after video compression, the cutout MUST carry its own texture.
  return (
    <div
      className={className}
      style={{
        display: "inline-block",
        position: "relative",
        filter: shadowCss(currentElevation),
        transform: `translateY(${-liftProgress * 15}px) scale(${1 + liftProgress * 0.03})`,
        transition: "filter 0.05s ease-out",
        ...style,
      }}
    >
      <div
        style={{
          position: "relative",
          border: whiteBorder ? `${borderWidth}px solid #FFFDF8` : "none",
          borderRadius: whiteBorder ? "18px 22px 20px 24px" : 0,
          overflow: "hidden",
          backgroundColor: whiteBorder ? "#FFFDF8" : "transparent",
        }}
      >
        {children}
        {/* Dual-layer paper texture: blotch survives H264 where fine
            grain alone crushes (cf. frame-004 hand/table). */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: FIBER_BLOTCH,
            opacity: 0.5,
            mixBlendMode: "multiply",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: FIBER_GRAIN,
            opacity: 0.32,
            mixBlendMode: "multiply",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
};

