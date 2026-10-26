import React, { useMemo } from "react";
import { AbsoluteFill, Img, Sequence, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { EQUIPO, JUGADORES, logoEsquina, visible } from "../data/equipo";
import { Fondo, Grano, Vineta } from "../components/Fondo";
import { LogoEsquina } from "../components/LogoEsquina";
import { Transicion } from "../components/Transicion";
import { COLOR, CURVA, LEXEND, clamp } from "../theme";
import { Presentacion, entradaEsquina } from "./Presentacion";

// Presentación de un integrante nuevo: rótulo (2,5 s) + barrido plateado + su presentación de
// siempre (5 s, igual que el Reel-Persona). Mismo lenguaje que la intro del video del equipo:
// estrellas que convergen, destello, escudo a color y "Team Mylquiades". Sin título: se pidió
// quitar "NUEVO INTEGRANTE" (El Victor es "jugador a honorarios").
export const NUEVO = { rotulo: 75, trans: 10, persona: 150 };
export const NUEVO_DUR = NUEVO.rotulo + NUEVO.persona;

const ESCUDO_RATIO = 889 / 721;

const Rotulo: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  const cx = width / 2;
  const cy = height * (vertical ? 0.46 : 0.43); // escudo + línea + nombre del equipo, centrados
  const DESTELLO = 20;

  const particulas = useMemo(
    () =>
      new Array(80).fill(0).map((_, i) => {
        const ang = random(`nuevo-a-${i}`) * Math.PI * 2;
        const dist = (0.45 + random(`nuevo-d-${i}`) * 0.7) * Math.max(width, height);
        return { ang, dist, r: 1 + random(`nuevo-r-${i}`) * 2.5, retraso: random(`nuevo-t-${i}`) * 8 };
      }),
    [width, height],
  );

  const destello = interpolate(frame, [DESTELLO - 4, DESTELLO, DESTELLO + 22], [0, 1, 0], clamp);
  const escudoP = interpolate(frame, [DESTELLO - 2, DESTELLO + 18], [0, 1], { ...clamp, easing: CURVA });
  const lineaP = interpolate(frame, [DESTELLO + 10, DESTELLO + 28], [0, 1], { ...clamp, easing: CURVA });
  const subP = interpolate(frame, [DESTELLO + 16, DESTELLO + 32], [0, 1], { ...clamp, easing: CURVA });
  const camara = interpolate(frame, [0, NUEVO.rotulo], [1, 1.04], clamp);

  const escudoW = vertical ? 470 : 300;
  const escudoH = escudoW * ESCUDO_RATIO;
  const escudoTop = cy - escudoH * 0.62;
  const textoTop = escudoTop + escudoH + (vertical ? 44 : 28);

  const revelar = (p: number): React.CSSProperties => ({
    clipPath: `inset(${(1 - p) * 100}% -10% -20% -10%)`,
    translate: `0 ${(1 - p) * 0.35}em`,
  });

  return (
    <AbsoluteFill style={{ scale: String(camara) }}>
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
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: textoTop,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontFamily: LEXEND,
          textAlign: "center",
        }}
      >
        <div
          style={{
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
      </div>
    </AbsoluteFill>
  );
};

export const NuevoIntegrante: React.FC<{ pid: string }> = ({ pid }) => {
  const { fps } = useVideoConfig();
  const j = JUGADORES.find((x) => x.id === pid)!;
  const logo = logoEsquina(j);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Fondo />
      <Sequence name="Rótulo" durationInFrames={NUEVO.rotulo + NUEVO.trans / 2}>
        <Rotulo />
      </Sequence>
      <Sequence name="Presentación" from={NUEVO.rotulo} durationInFrames={NUEVO.persona} premountFor={fps}>
        <Presentacion pid={pid} logo="plata" standalone={false} />
      </Sequence>
      <Sequence name="Barrido" from={NUEVO.rotulo - NUEVO.trans / 2} durationInFrames={NUEVO.trans}>
        <Transicion dur={NUEVO.trans} />
      </Sequence>
      <Vineta />
      {/* Encima de la viñeta; entra igual que en su presentación (al final de la cascada de texto) */}
      {logo ? <LogoEsquina src={logo} desde={NUEVO.rotulo + entradaEsquina(j)} /> : null}
      <Grano />
    </AbsoluteFill>
  );
};
