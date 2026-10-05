import React from "react";
import { COLOR } from "../theme";

// Reloj plateado fino (Alonso: "el calculador"). `progreso` 0..1 dibuja el aro y luego las agujas.
export const Reloj: React.FC<{ size: number; progreso: number }> = ({ size, progreso }) => {
  const c = size / 2;
  const r = size / 2 - 2;
  const L = 2 * Math.PI * r;
  const aro = Math.min(1, progreso / 0.7);
  const agujas = Math.max(0, (progreso - 0.45) / 0.55);
  const sw = Math.max(2, size * 0.065);
  const marcas = [0, 90, 180, 270];
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="reloj-plata" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={COLOR.plata} />
          <stop offset="100%" stopColor={COLOR.grafito} />
        </linearGradient>
      </defs>
      <circle cx={c} cy={c} r={r} fill="none" stroke="url(#reloj-plata)" strokeWidth={sw}
        strokeDasharray={L} strokeDashoffset={L * (1 - aro)} transform={`rotate(-90 ${c} ${c})`} />
      <g opacity={agujas} stroke={COLOR.plata} strokeLinecap="round">
        {marcas.map((a) => (
          <line key={a} x1={c} y1={c - r * 0.78} x2={c} y2={c - r * 0.62} strokeWidth={sw} transform={`rotate(${a} ${c} ${c})`} />
        ))}
        <line x1={c} y1={c} x2={c} y2={c - r * 0.5} strokeWidth={sw * 1.2} />
        <line x1={c} y1={c} x2={c + r * 0.38 * agujas} y2={c + r * 0.12} strokeWidth={sw * 1.2} />
      </g>
      <circle cx={c} cy={c} r={sw * 0.9} fill={COLOR.plata} opacity={agujas} />
    </svg>
  );
};
