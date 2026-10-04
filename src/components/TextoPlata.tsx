import React from "react";
import { COLOR, PLATA_GRADIENT } from "../theme";

// Texto con degradé metálico Plata -> Grafito (background-clip: text) y un barrido de brillo
// diagonal controlado por `brillo` (0 = antes de entrar, 1 = ya pasó). Se usa una sola vez.
export const TextoPlata: React.FC<{
  children: React.ReactNode;
  brillo: number;
  style?: React.CSSProperties;
}> = ({ children, brillo, style }) => {
  const pos = 130 - brillo * 160; // % de background-position del brillo: entra por la izquierda
  return (
    <span
      style={{
        backgroundImage: `linear-gradient(110deg, rgba(255,255,255,0) 42%, rgba(255,255,255,0.95) 50%, rgba(168,219,255,0.6) 53%, rgba(255,255,255,0) 60%), ${PLATA_GRADIENT}`,
        backgroundSize: "300% 100%, 100% 100%",
        backgroundPosition: `${pos}% 0%, 0% 0%`,
        backgroundRepeat: "no-repeat",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        filter: `drop-shadow(0 2px 0 rgba(6,16,43,0.55))`,
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
