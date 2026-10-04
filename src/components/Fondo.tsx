import React, { useMemo } from "react";
import { AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { COLOR, clamp } from "../theme";

// Ambiente: radial Índigo -> Noche, estrellas que titilan lento, haces de luz desde arriba,
// humo tenue abajo, grano fino y viñeta. Todo determinístico (random con seed).

const Estrellas: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const estrellas = useMemo(
    () =>
      new Array(110).fill(0).map((_, i) => ({
        x: random(`estrella-x-${i}`) * width,
        y: random(`estrella-y-${i}`) * height * 0.8,
        r: 0.6 + random(`estrella-r-${i}`) ** 3 * 2.2,
        fase: random(`estrella-f-${i}`) * Math.PI * 2,
        vel: 0.03 + random(`estrella-v-${i}`) * 0.05,
        base: 0.25 + random(`estrella-b-${i}`) * 0.5,
      })),
    [width, height],
  );
  return (
    <svg width={width} height={height} style={{ position: "absolute" }}>
      {estrellas.map((e, i) => (
        <circle
          key={i}
          cx={e.x}
          cy={e.y}
          r={e.r}
          fill={COLOR.plata}
          opacity={e.base * (0.55 + 0.45 * Math.sin(frame * e.vel + e.fase))}
        />
      ))}
    </svg>
  );
};

const Haces: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const haces = [
    { x: 0.22, ang: 14, w: 0.26, op: 0.07, f: 0.011 },
    { x: 0.5, ang: 0, w: 0.34, op: 0.09, f: 0.008 },
    { x: 0.78, ang: -14, w: 0.26, op: 0.07, f: 0.013 },
  ];
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen" }}>
      {haces.map((h, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: width * h.x - (width * h.w) / 2,
            top: -height * 0.05,
            width: width * h.w,
            height: height * 1.1,
            transformOrigin: "50% 0%",
            rotate: `${h.ang + Math.sin(frame * h.f + i) * 2}deg`,
            clipPath: "polygon(42% 0%, 58% 0%, 100% 100%, 0% 100%)",
            background: `linear-gradient(180deg, ${COLOR.hielo} 0%, rgba(168,219,255,0.35) 30%, rgba(168,219,255,0) 75%)`,
            opacity: h.op * (0.8 + 0.2 * Math.sin(frame * h.f * 2 + i * 2)),
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

const Humo: React.FC = () => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();
  const H = height * 0.38;
  const W = (2048 / 700) * H;
  const capas = [
    { vel: 0.35, op: 0.1 },
    { vel: -0.22, op: 0.07 },
  ];
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen" }}>
      {capas.map((c, i) => {
        const off = (((frame * c.vel + i * W * 0.37) % W) + W) % W;
        return [0, 1].map((k) => (
          <Img
            key={`${i}-${k}`}
            src={staticFile("fx/humo.png")}
            style={{
              position: "absolute",
              left: k * W - off,
              top: height - H,
              width: W + 2,
              height: H,
              opacity: c.op,
            }}
          />
        ));
      })}
    </AbsoluteFill>
  );
};

export const Grano: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: 0.09, pointerEvents: "none" }}>
      {/* Img oculto: obliga a Remotion a esperar la textura antes de renderizar el frame */}
      <Img src={staticFile("fx/grano.png")} style={{ display: "none" }} />
      <AbsoluteFill
        style={{
          backgroundImage: `url(${staticFile("fx/grano.png")})`,
          backgroundSize: "512px 512px",
          backgroundPosition: `${Math.floor(random(`grano-x-${frame}`) * 512)}px ${Math.floor(random(`grano-y-${frame}`) * 512)}px`,
        }}
      />
    </AbsoluteFill>
  );
};

export const Vineta: React.FC = () => (
  <AbsoluteFill
    style={{
      background: "radial-gradient(ellipse 75% 70% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.6) 100%)",
      pointerEvents: "none",
    }}
  />
);

export const Fondo: React.FC<{ intensidad?: number }> = ({ intensidad = 1 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  return (
    <AbsoluteFill style={{ backgroundColor: COLOR.noche }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse ${vertical ? "95% 55%" : "60% 85%"} at 50% ${vertical ? "38%" : "42%"}, ${COLOR.indigo} 0%, rgba(18,36,94,0.55) 45%, ${COLOR.noche} 100%)`,
          opacity: interpolate(frame, [0, 30], [0.85, 1], clamp) * intensidad,
        }}
      />
      <Estrellas />
      <Haces />
      <Humo />
    </AbsoluteFill>
  );
};
