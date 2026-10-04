import React, { useMemo } from "react";
import { AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { EQUIPO, visible } from "../data/equipo";
import { TextoPlata } from "../components/TextoPlata";
import { COLOR, CURVA, LEXEND, clamp } from "../theme";

const ESCUDO_RATIO = 889 / 721;

// E1: estrellas que convergen al centro en un destello, aparece el escudo (a color) y luego
// "QUINTETO TITULAR" en plata con su barrido. Debajo, nombre del equipo y ocasión (si existen).
export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  const cx = width / 2;
  const cy = vertical ? height * 0.4 : height * 0.4;
  const DESTELLO = 30;

  const particulas = useMemo(
    () =>
      new Array(90).fill(0).map((_, i) => {
        const ang = random(`conv-a-${i}`) * Math.PI * 2;
        const dist = (0.45 + random(`conv-d-${i}`) * 0.7) * Math.max(width, height);
        return { ang, dist, r: 1 + random(`conv-r-${i}`) * 2.5, retraso: random(`conv-t-${i}`) * 10 };
      }),
    [width, height],
  );

  const destello = interpolate(frame, [DESTELLO - 4, DESTELLO, DESTELLO + 22], [0, 1, 0], clamp);
  const escudoP = interpolate(frame, [DESTELLO - 2, DESTELLO + 20], [0, 1], { ...clamp, easing: CURVA });
  const tituloP = interpolate(frame, [DESTELLO + 14, DESTELLO + 32], [0, 1], { ...clamp, easing: CURVA });
  const brillo = interpolate(frame, [DESTELLO + 22, DESTELLO + 46], [0, 1], clamp);
  const subP = interpolate(frame, [DESTELLO + 26, DESTELLO + 42], [0, 1], { ...clamp, easing: CURVA });
  const lineaP = interpolate(frame, [DESTELLO + 20, DESTELLO + 40], [0, 1], { ...clamp, easing: CURVA });
  const camara = interpolate(frame, [0, 90], [1, 1.04], clamp);

  const escudoW = vertical ? 520 : 360;
  const escudoH = escudoW * ESCUDO_RATIO;
  const escudoTop = cy - escudoH * 0.62;
  const tituloSize = vertical ? 74 : 86;
  const tituloTop = escudoTop + escudoH + (vertical ? 70 : 40);

  const revelar = (p: number): React.CSSProperties => ({
    clipPath: `inset(${(1 - p) * 100}% -10% -20% -10%)`,
    translate: `0 ${(1 - p) * 0.35}em`,
  });

  return (
    <AbsoluteFill style={{ scale: String(camara) }}>
      {/* Estrellas que convergen */}
      <svg width={width} height={height} style={{ position: "absolute" }}>
        {particulas.map((pt, i) => {
          const t = interpolate(frame, [pt.retraso, DESTELLO], [0, 1], { ...clamp, easing: (x) => x * x * x });
          const d = pt.dist * (1 - t);
          return (
            <circle
              key={i}
              cx={cx + Math.cos(pt.ang) * d}
              cy={cy + Math.sin(pt.ang) * d}
              r={pt.r * (1 - t * 0.5)}
              fill={COLOR.plata}
              opacity={frame < DESTELLO ? 0.3 + 0.7 * t : 0}
            />
          );
        })}
      </svg>
      {/* Destello central */}
      <AbsoluteFill style={{ mixBlendMode: "screen" }}>
        <div
          style={{
            position: "absolute",
            left: cx - 700,
            top: cy - 700,
            width: 1400,
            height: 1400,
            background:
              "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(168,219,255,0.6) 12%, rgba(168,219,255,0.15) 35%, rgba(168,219,255,0) 60%)",
            opacity: destello,
            scale: String(0.4 + destello * 0.8),
          }}
        />
      </AbsoluteFill>
      {/* Escudo a color */}
      <Img
        src={staticFile("brand/escudo.png")}
        style={{
          position: "absolute",
          left: cx - escudoW / 2,
          top: escudoTop,
          width: escudoW,
          height: escudoH,
          opacity: escudoP,
          scale: String(0.85 + 0.15 * escudoP),
          filter: `brightness(${1 + destello * 0.8}) drop-shadow(0 0 ${24 + destello * 40}px rgba(168,219,255,${0.25 + destello * 0.5}))`,
        }}
      />
      {/* Título y subtítulo */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: tituloTop,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontFamily: LEXEND,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: tituloSize,
            fontWeight: 700,
            letterSpacing: `${0.16 + (1 - tituloP) * 0.2}em`,
            marginRight: "-0.16em",
            lineHeight: 1.1,
            ...revelar(tituloP),
          }}
        >
          <TextoPlata brillo={brillo}>
            {vertical ? (
              <>
                QUINTETO
                <br />
                TITULAR
              </>
            ) : (
              "QUINTETO TITULAR"
            )}
          </TextoPlata>
        </div>
        <div
          style={{
            marginTop: vertical ? 34 : 26,
            width: vertical ? 520 : 620,
            height: 2,
            background: `linear-gradient(90deg, rgba(231,236,243,0) 0%, ${COLOR.plata} 50%, rgba(140,151,171,0) 100%)`,
            scale: `${lineaP} 1`,
          }}
        />
        {visible(EQUIPO.nombre) ? (
          <div
            style={{
              marginTop: vertical ? 30 : 22,
              fontSize: vertical ? 40 : 38,
              fontWeight: 400,
              color: COLOR.plata,
              letterSpacing: "0.3em",
              marginRight: "-0.3em",
              ...revelar(subP),
            }}
          >
            {`Team ${EQUIPO.nombre}`}
          </div>
        ) : null}
        {visible(EQUIPO.ocasion) ? (
          <div
            style={{
              marginTop: 14,
              fontSize: vertical ? 30 : 28,
              fontWeight: 400,
              color: COLOR.grafito,
              letterSpacing: "0.12em",
              ...revelar(subP),
            }}
          >
            {EQUIPO.ocasion}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
