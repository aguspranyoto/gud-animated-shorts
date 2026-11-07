import React from "react";
import { interpolate } from "remotion";

export interface PopUpPaperProps {
  children: React.ReactNode;
  progress: number; // 0 to 1
  perspective?: number;
  style?: React.CSSProperties;
}

export const PopUpPaper: React.FC<PopUpPaperProps> = ({
  children,
  progress,
  perspective = 1000,
  style = {},
}) => {
  // -85 deg lays it flat on table pointing forward, 0 deg stands upright
  const rotateX = interpolate(progress, [0, 1], [-85, 0]);
  const opacity = interpolate(progress, [0, 0.15, 1], [0, 0.9, 1]);

  return (
    <div
      style={{
        perspective: `${perspective}px`,
        transformStyle: "preserve-3d",
        display: "inline-block",
        ...style,
      }}
    >
      <div
        style={{
          transformOrigin: "bottom center",
          transform: `rotateX(${rotateX}deg)`,
          opacity,
          backfaceVisibility: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
};

