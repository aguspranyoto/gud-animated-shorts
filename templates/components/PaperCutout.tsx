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
  whiteBorder = false,
  borderWidth = 10,
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
          position: "relative",
          border: whiteBorder ? `${borderWidth}px solid #FFFDF8` : "none",
          borderRadius: "18px 22px 20px 24px",
          overflow: "hidden",
          backgroundColor: "#FFFDF8",
        }}
      >
        {children}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='260'" +
              "%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' " +
              "stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' " +
              "opacity='0.6'/%3E%3C/svg%3E\")",
            opacity: 0.32,
            mixBlendMode: "multiply",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
};

