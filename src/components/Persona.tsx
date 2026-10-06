import React from "react";
import { Video } from "@remotion/media";
import { AbsoluteFill, Img, Sequence, staticFile, useVideoConfig } from "remotion";
import encuadre from "../data/encuadre.json";
import { COLOR } from "../theme";

type Encuadre = { frames: number; final: number[]; cabeza_cx: number; cabeza_ancho: number };

// Dónde poner a la persona: centro y coronilla de la cabeza y ancho de cabeza objetivo (px del lienzo).
// Así los 5 quedan a la misma escala aunque vengan con encuadres distintos.
export type Colocacion = { cabezaCx: number; cabezaTop: number; cabezaAncho: number };

export const colocar = (pid: string, c: Colocacion) => {
  const e = (encuadre as Record<string, Encuadre>)[pid];
  const s = c.cabezaAncho / e.cabeza_ancho;
  return { s, left: c.cabezaCx - e.cabeza_cx * s, top: c.cabezaTop - e.final[1] * s, frames: e.frames };
};

// Colores naturales de la grabación (pedido del equipo: "normales, no brillosos"): sin contraste
// extra ni tono cálido, solo una contención leve de los brillos para que la piel no se vea lustrosa.
// Más el contraluz Hielo que sigue el alpha. Un solo filtro SVG por persona.
export const BRILLOS = { amplitude: 0.96, exponent: 1.06 };
const FiltroPersona: React.FC<{ id: string; contraluz: number }> = ({ id, contraluz }) => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <filter id={id} x="-15%" y="-10%" width="130%" height="120%" colorInterpolationFilters="sRGB">
      <feComponentTransfer in="SourceGraphic" result="cont">
        <feFuncR type="gamma" {...BRILLOS} offset="0" />
        <feFuncG type="gamma" {...BRILLOS} offset="0" />
        <feFuncB type="gamma" {...BRILLOS} offset="0" />
      </feComponentTransfer>
      <feGaussianBlur in="SourceAlpha" stdDeviation={22 + 14 * contraluz} result="blur" />
      <feFlood floodColor={COLOR.hielo} floodOpacity={0.08 + 0.5 * contraluz * contraluz} />
      <feComposite in2="blur" operator="in" result="glow" />
      <feMerge>
        <feMergeNode in="glow" />
        <feMergeNode in="cont" />
      </feMerge>
    </filter>
  </svg>
);

export const Persona: React.FC<{
  pid: string;
  colocacion: Colocacion;
  contraluz: number; // 0..1, sube en el paso
  desde?: number; // frame local donde arranca el recorte
}> = ({ pid, colocacion, contraluz, desde = 0 }) => {
  const { fps } = useVideoConfig();
  const { s, left, top, frames } = colocar(pid, colocacion);
  const id = `filtro-${pid}`;
  const estilo: React.CSSProperties = {
    position: "absolute",
    left,
    top,
    width: 1080,
    height: 1920,
    scale: String(s),
    transformOrigin: "0 0",
    filter: `url(#${id})`,
  };
  return (
    <AbsoluteFill>
      <FiltroPersona id={id} contraluz={contraluz} />
      <Sequence from={desde} durationInFrames={frames} premountFor={fps}>
        <Video src={staticFile(`alpha/${pid}.webm`)} muted style={estilo} />
      </Sequence>
      {/* Si el clip es más corto que su tramo, se congela el último frame */}
      <Sequence from={desde + frames} premountFor={fps}>
        <Img src={staticFile(`alpha/${pid}_final.png`)} style={estilo} />
      </Sequence>
    </AbsoluteFill>
  );
};
