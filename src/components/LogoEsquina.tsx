import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CURVA, clamp } from "../theme";

// Logo chico fijo en la esquina superior derecha, como el logo de un canal. Queda fuera del push-in
// de la cámara. En vertical baja 160 px (libre de la barra de Reels) y queda entero dentro de la
// foto 4:5; con 150 px no tapa la palabra TEAM del escudo.
export const LogoEsquina: React.FC<{ src: string; desde?: number }> = ({ src, desde = 0 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  const p = interpolate(frame, [desde, desde + 14], [0, 1], { ...clamp, easing: CURVA });
  const lado = vertical ? 150 : 140;
  return (
    <Img
      src={staticFile(src)}
      style={{
        position: "absolute",
        top: vertical ? 160 : 56,
        right: vertical ? 90 : 64,
        width: lado,
        height: lado,
        opacity: p,
        scale: String(0.9 + 0.1 * p),
        filter: "drop-shadow(0 4px 10px rgba(6,16,43,0.5))",
      }}
    />
  );
};
