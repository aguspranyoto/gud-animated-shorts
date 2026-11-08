import React from "react";

export interface PaperTextPillProps {
  text: string;
  bottomOffset?: number;
  textColor?: string;
  backgroundColor?: string;
  style?: React.CSSProperties;
}

/**
 * PaperTextPill — caption card. Rock-solid by design: NO jitter, NO rotation,
 * NO wiggle hook. Style-locked to the reference caption (image_010/070):
 * lowercase, weight 500, dark-on-white pill — NOT shouty uppercase 800.
 * Captions are the single most visible element; readability beats texture.
 * Only the word-highlight layer (see SKILL.md §7b) animates.
 */
export const PaperTextPill: React.FC<PaperTextPillProps> = ({
  text,
  bottomOffset = 140,
  textColor = "#1C1917",
  backgroundColor = "#FFFFFF",
  style = {},
}) => {
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
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            fontSize: "38px",
            fontWeight: 500,
            color: textColor,
            letterSpacing: "-0.2px",
            lineHeight: 1.35,
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
};
