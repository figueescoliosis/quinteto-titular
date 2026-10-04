import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CURVA, clamp } from "../theme";

// Barrido diagonal de luz plateada (~8 frames), centrado en el corte entre escenas.
// Se monta en una <Sequence> que empieza `dur/2` frames antes del corte.
export const Transicion: React.FC<{ dur?: number }> = ({ dur = 10 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const p = interpolate(frame, [0, dur], [0, 1], { ...clamp, easing: CURVA });
  const diag = Math.hypot(width, height);
  const flash = interpolate(frame, [0, dur / 2, dur], [0, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {/* Velo que tapa el corte en el centro del barrido */}
      <AbsoluteFill style={{ backgroundColor: "#06102B", opacity: flash * 0.85 }} />
      <AbsoluteFill style={{ mixBlendMode: "screen" }}>
        <div
          style={{
            position: "absolute",
            left: width / 2 - diag / 2,
            top: height / 2 - diag / 2,
            width: diag,
            height: diag,
            rotate: "-28deg",
            translate: `${interpolate(p, [0, 1], [-diag, diag])}px 0px`,
            background:
              "linear-gradient(90deg, rgba(231,236,243,0) 38%, rgba(168,219,255,0.35) 46%, rgba(255,255,255,0.95) 50%, rgba(168,219,255,0.35) 54%, rgba(231,236,243,0) 62%)",
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
