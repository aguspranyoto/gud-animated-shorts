import React from "react";
import { useCurrentFrame } from "remotion";

export interface PaperTextPillProps {
  text: string;
  bottomOffset?: number;
  textColor?: string;
  backgroundColor?: string;
  style?: React.CSSProperties;
}

export const PaperTextPill: React.FC<PaperTextPillProps> = ({
  text,
  bottomOffset = 140,
  textColor = "#1C1917",
  backgroundColor = "#FFFFFF",
  style = {},
}) => {
  const frame = useCurrentFrame();
  const steppedFrame = Math.floor(frame / 2) * 2;

  // Discrete micro-jitter emulation of stop-motion replacement animation
  const jitterAngle = Math.sin(steppedFrame * 0.45) * 0.75; // -0.75 to +0.75 deg
  const jitterY = Math.cos(steppedFrame * 0.35) * 1.0;

  return (
    <div
      style={{
        position: "absolute",
        bottom: bottomOffset,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        zIndex: 999,
        pointerEvents: "none",
        ...style,
      }}
    >
      <div
        style={{
          backgroundColor,
          padding: "16px 36px",
          borderRadius: "28px",
          maxWidth: "88%",
          textAlign: "center",
          boxShadow: "0 12px 28px rgba(35, 25, 20, 0.22), 0 3px 6px rgba(0, 0, 0, 0.08)",
          border: "2.5px solid #F3EFEA",
          transform: `rotate(${jitterAngle}deg) translateY(${jitterY}px)`,
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            fontSize: "36px",
            fontWeight: 800,
            color: textColor,
            letterSpacing: "-0.6px",
            lineHeight: 1.35,
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
};

