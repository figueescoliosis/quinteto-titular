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

// Filtro leve igual para los 5 (contraste +, tono cálido a pedido del equipo) y contraluz Hielo
// que sigue el alpha. Un solo filtro SVG por persona para no encadenar pasadas.
const FiltroPersona: React.FC<{ id: string; contraluz: number }> = ({ id, contraluz }) => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <filter id={id} x="-15%" y="-10%" width="130%" height="120%" colorInterpolationFilters="sRGB">
      <feColorMatrix type="saturate" values="0.95" result="sat" />
      <feColorMatrix
        in="sat"
        type="matrix"
        values="1.06 0 0 0 0.012  0 1.0 0 0 0.004  0 0 0.88 0 0  0 0 0 1 0"
        result="calido"
      />
      <feComponentTransfer in="calido" result="cont">
        <feFuncR type="linear" slope="1.1" intercept="-0.045" />
        <feFuncG type="linear" slope="1.1" intercept="-0.045" />
        <feFuncB type="linear" slope="1.1" intercept="-0.045" />
      </feComponentTransfer>
      <feGaussianBlur in="SourceAlpha" stdDeviation={10 + 8 * contraluz} result="blur" />
      <feFlood floodColor={COLOR.hielo} floodOpacity={0.35 + 0.65 * contraluz} />
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
