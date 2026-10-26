import React from "react";
import { COLOR, ORO_GRADIENT, PLATA_GRADIENT } from "../theme";

// Degradé del metal y tinte del barrido de brillo.
const METALES = {
  plata: { degradado: PLATA_GRADIENT, tinte: "rgba(168,219,255,0.6)" },
  oro: { degradado: ORO_GRADIENT, tinte: "rgba(255,236,170,0.75)" },
};

// Texto con degradé metálico Plata -> Grafito (background-clip: text) y un barrido de brillo
// diagonal controlado por `brillo` (0 = antes de entrar, 1 = ya pasó). Se usa una sola vez.
// `metal="oro"` es el acento puntual (rol destacado); `resplandor` (0..1) le suma un halo cálido.
export const TextoPlata: React.FC<{
  children: React.ReactNode;
  brillo: number;
  metal?: keyof typeof METALES;
  resplandor?: number;
  style?: React.CSSProperties;
}> = ({ children, brillo, metal = "plata", resplandor = 0, style }) => {
  const pos = 130 - brillo * 160; // % de background-position del brillo: entra por la izquierda
  const { degradado, tinte } = METALES[metal];
  const halo = resplandor > 0 ? ` drop-shadow(0 0 ${12 + 10 * resplandor}px rgba(245,196,81,${0.6 * resplandor}))` : "";
  return (
    <span
      style={{
        backgroundImage: `linear-gradient(110deg, rgba(255,255,255,0) 42%, rgba(255,255,255,0.95) 50%, ${tinte} 53%, rgba(255,255,255,0) 60%), ${degradado}`,
        backgroundSize: "300% 100%, 100% 100%",
        backgroundPosition: `${pos}% 0%, 0% 0%`,
        backgroundRepeat: "no-repeat",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        filter: `drop-shadow(0 2px 0 rgba(6,16,43,0.55))${halo}`,
        ...style,
      }}
    >
      {children}
    </span>
  );
};

// Línea fina plateada que se dibuja desde el centro (o desde la izquierda).
export const LineaPlata: React.FC<{ progreso: number; ancho: number; origen?: "centro" | "izquierda" }> = ({
  progreso,
  ancho,
  origen = "centro",
}) => (
  <div
    style={{
      width: ancho,
      height: 2,
      background: `linear-gradient(90deg, rgba(231,236,243,0) 0%, ${COLOR.plata} ${origen === "centro" ? "50%" : "15%"}, rgba(140,151,171,0) 100%)`,
      scale: `${progreso} 1`,
      transformOrigin: origen === "centro" ? "50% 50%" : "0% 50%",
    }}
  />
);
