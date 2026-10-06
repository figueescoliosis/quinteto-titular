import React from "react";
import { Img, staticFile } from "remotion";
import encuadre from "../data/encuadre.json";
import { COLOR } from "../theme";

type Encuadre = { final: number[]; cabeza_cx: number; cabeza_ancho: number };

// Retrato circular a partir del último frame del recorte (cabeza centrada), con anillo plateado.
export const Retrato: React.FC<{ pid: string; size: number; anillo: number; foto: number }> = ({
  pid,
  size,
  anillo,
  foto,
}) => {
  const e = (encuadre as Record<string, Encuadre>)[pid];
  const k = (size * 0.5) / e.cabeza_ancho;
  const r = size / 2 - 2;
  const L = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div
        style={{
          position: "absolute",
          inset: 4,
          borderRadius: "50%",
          overflow: "hidden",
          background: "radial-gradient(circle at 50% 35%, #1a3170 0%, #0a1638 70%)",
          opacity: foto,
        }}
      >
        <Img
          src={staticFile(`alpha/${pid}_final.png`)}
          style={{
            position: "absolute",
            left: size / 2 - 4 - e.cabeza_cx * k,
            top: size * 0.2 - 4 - e.final[1] * k + (1 - foto) * size * 0.15,
            width: 1080 * k,
            height: 1920 * k,
            maxWidth: "none",
            filter: "brightness(0.95)", // colores naturales, brillos contenidos
          }}
        />
      </div>
      <svg width={size} height={size} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <linearGradient id={`retrato-plata-${pid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLOR.plata} />
            <stop offset="100%" stopColor={COLOR.grafito} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#retrato-plata-${pid})`}
          strokeWidth={2.5}
          strokeDasharray={L}
          strokeDashoffset={L * (1 - anillo)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
    </div>
  );
};
