import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { COLOR, CURVA, clamp } from "../theme";

// Logo chico fijo en la esquina superior derecha, como el logo de un canal. Queda fuera del push-in
// de la cámara. En vertical baja 160 px (libre de la barra de Reels) y queda entero dentro de la
// foto 4:5; con 150 px no tapa la palabra TEAM del escudo.
// Entra con el lenguaje del resto del video: se dibuja un anillo plateado (como los retratos de la
// alineación), el logo aparece desde desenfoque con escala 1,1 -> 1,0 (como el escudo) y al final
// lo cruza un barrido de brillo diagonal, una sola vez (como los textos).
export const LogoEsquina: React.FC<{ src: string; desde?: number }> = ({ src, desde = 0 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  const anillo = interpolate(frame, [desde, desde + 16], [0, 1], { ...clamp, easing: CURVA });
  const logo = interpolate(frame, [desde + 4, desde + 22], [0, 1], { ...clamp, easing: CURVA });
  const brillo = interpolate(frame, [desde + 12, desde + 32], [0, 1], clamp);
  const lado = vertical ? 150 : 140;
  const margen = 7; // aire entre el logo y el anillo
  const aro = lado + 2 * margen;
  const r = aro / 2 - 1.5;
  const L = 2 * Math.PI * r;
  return (
    <div
      style={{
        position: "absolute",
        top: (vertical ? 160 : 56) - margen,
        right: (vertical ? 90 : 64) - margen,
        width: aro,
        height: aro,
        filter: "drop-shadow(0 4px 10px rgba(6,16,43,0.5))",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: margen,
          borderRadius: "50%",
          overflow: "hidden",
          opacity: logo,
          scale: String(1.1 - 0.1 * logo),
          filter: `blur(${(1 - logo) * 12}px)`,
        }}
      >
        <Img src={staticFile(src)} style={{ width: "100%", height: "100%" }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(110deg, rgba(255,255,255,0) 42%, rgba(255,255,255,0.8) 50%, rgba(168,219,255,0.45) 53%, rgba(255,255,255,0) 60%)",
            backgroundSize: "300% 100%",
            backgroundPosition: `${130 - brillo * 160}% 0%`,
            backgroundRepeat: "no-repeat",
            mixBlendMode: "screen",
          }}
        />
      </div>
      <svg width={aro} height={aro} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <linearGradient id="esquina-plata" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLOR.plata} />
            <stop offset="100%" stopColor={COLOR.grafito} />
          </linearGradient>
        </defs>
        <circle
          cx={aro / 2}
          cy={aro / 2}
          r={r}
          fill="none"
          stroke="url(#esquina-plata)"
          strokeWidth={2.5}
          strokeDasharray={L}
          strokeDashoffset={L * (1 - anillo)}
          transform={`rotate(-90 ${aro / 2} ${aro / 2})`}
        />
      </svg>
    </div>
  );
};
