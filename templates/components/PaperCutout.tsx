import React from "react";
import { interpolate } from "remotion";

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
  whiteBorder = true,
  borderWidth = 3,
  className = "",
  style = {},
}) => {
  const currentElevation = elevation + liftProgress * 2.5;

  const shadowX = interpolate(currentElevation, [0, 1, 2, 3, 4], [1, 3, 7, 14, 22]);
  const shadowY = interpolate(currentElevation, [0, 1, 2, 3, 4], [2, 6, 15, 28, 44]);
  const shadowBlur = interpolate(currentElevation, [0, 1, 2, 3, 4], [2, 6, 12, 24, 38]);
  const shadowAlpha = interpolate(currentElevation, [0, 1, 2, 3, 4], [0.38, 0.32, 0.26, 0.2, 0.14]);

  return (
    <div
      className={className}
      style={{
        display: "inline-block",
        position: "relative",
        filter: `drop-shadow(${shadowX}px ${shadowY}px ${shadowBlur}px rgba(35, 25, 20, ${shadowAlpha}))`,
        transform: `translateY(${-liftProgress * 15}px) scale(${1 + liftProgress * 0.03})`,
        transition: "filter 0.05s ease-out",
        ...style,
      }}
    >
      <div
        style={{
          border: whiteBorder ? `${borderWidth}px solid #FAF8F5` : "none",
          borderRadius: "6px",
          overflow: "hidden",
          backgroundColor: "#FAF8F5",
        }}
      >
        {children}
      </div>
    </div>
  );
};

