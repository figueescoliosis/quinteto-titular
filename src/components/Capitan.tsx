import React from "react";
import { COLOR, LEXEND } from "../theme";

// Insignia de capitán: una C plateada dentro de un anillo fino. `progreso` 0..1 dibuja el anillo
// y luego aparece la C.
export const Capitan: React.FC<{ size: number; progreso: number }> = ({ size, progreso }) => {
  const r = size / 2 - 2;
  const L = 2 * Math.PI * r;
  const anillo = Math.min(1, progreso / 0.7);
  const c = Math.max(0, (progreso - 0.45) / 0.55);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="capitan-plata" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={COLOR.plata} />
          <stop offset="100%" stopColor={COLOR.grafito} />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="url(#capitan-plata)"
        strokeWidth={Math.max(1.5, size * 0.035)}
        strokeDasharray={L}
        strokeDashoffset={L * (1 - anillo)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily={LEXEND}
        fontWeight={700}
        fontSize={size * 0.5}
        fill="url(#capitan-plata)"
        opacity={c}
      >
        C
      </text>
    </svg>
  );
};
