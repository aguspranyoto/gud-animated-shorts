import React, { useId } from "react";
import { shadowCss } from "./shadowRig";
import { BLOTCH_SRC } from "../styles/paperTheme";

interface SvgCutoutProps {
  /** Silhouette path — paste `d` dari Figma/Inkscape/vtracer, jangan tulis manual. */
  d: string;
  viewBox: string;
  w?: number;
  h?: number;
  fill?: string;
  elevation?: number; // Z0-Z4, ladder dari shadowRig.ts
  /** Detail strokes di atas base, di bawah grain (lipatan, kuku, knuckle). */
  detail?: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * SvgCutout — pengganti PaperCutout buat prop organik (tangan, batu, bulu).
 * Kenapa SVG bukan div:
 *  1. drop-shadow ngikutin ALPHA path (tangan = tangan), bukan kotak div.
 *  2. grain di-clip ke path — nggak bocor jadi kotak putih kayak whiteBorder.
 *  3. 1 path `d` dari trace Figma > 20 div border-radius yang nggak pernah mirip.
 *
 * Cara dapat `d` tanpa gambar dari nol (pilih 1, paling lazy dulu):
 *  a. Trace referensi: screenshot frame-004 → Figma/Inkscape Trace Bitmap → copy `d`.
 *  b. Generate: minta image-gen "flat paper cutout silhouette, single solid color,
 *     top-down, no shading" → vtracer --mode polygon → copy `d`.
 *  c. Figma: gambar blob kasar → Plugins > Simplify → Export SVG → copy `d`.
 * Ganti fill pakai token PAPER.*, jangan hardcode hex scene.
 */
export const SvgCutout: React.FC<SvgCutoutProps> = ({
  d,
  viewBox,
  w = 200,
  h,
  fill = "#C9A87B",
  elevation = 2,
  detail,
  style = {},
}) => {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");

  return (
    <div
      style={{
        display: "inline-block",
        filter: shadowCss(elevation),
        ...style,
      }}
    >
      <svg viewBox={viewBox} width={w} height={h} style={{ display: "block", overflow: "visible" }}>
        <defs>
          <clipPath id={`c-${uid}`}>
            <path d={d} />
          </clipPath>
        </defs>
        {/* base silhouette */}
        <path d={d} fill={fill} />
        {/* detail + grain, di-clip ke silhouette — nggak bocor kotak */}
        <g clipPath={`url(#c-${uid})`}>
          {detail}
          <image
            href={BLOTCH_SRC}
            x="0"
            y="0"
            width="100%"
            height="100%"
            opacity={0.5}
            preserveAspectRatio="xMidYMid slice"
          />
        </g>
      </svg>
    </div>
  );
};
