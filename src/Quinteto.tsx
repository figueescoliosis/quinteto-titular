import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { ORDEN } from "./data/equipo";
import { Fondo, Grano, Vineta } from "./components/Fondo";
import { Transicion } from "./components/Transicion";
import { Alineacion } from "./scenes/Alineacion";
import { Cierre } from "./scenes/Cierre";
import { Intro } from "./scenes/Intro";
import { Presentacion } from "./scenes/Presentacion";
import { ALINEACION, CIERRE, INTRO, PRESENTACIONES } from "./timing";

// Video completo (30 s = 900 frames). Mismo timing para vertical y horizontal; el layout de cada
// escena cambia según useVideoConfig(). Sin música: si aparece public/audio/musica.mp3 se agrega aquí.
const TRANS = 10;

export const Quinteto: React.FC = () => {
  const { fps } = useVideoConfig();
  const cortes = [
    PRESENTACIONES.from,
    ...ORDEN.slice(1).map((_, i) => PRESENTACIONES.from + (i + 1) * PRESENTACIONES.durPorPersona),
    ALINEACION.from,
    CIERRE.from,
  ];
  return (
    <AbsoluteFill>
      <Fondo />
      <Sequence name="E1 Intro" from={INTRO.from} durationInFrames={INTRO.dur} premountFor={fps}>
        <Intro />
      </Sequence>
      {ORDEN.map((j, i) => (
        <Sequence
          key={j.id}
          name={`E2 ${j.nombre} ${j.apellido}`}
          from={PRESENTACIONES.from + i * PRESENTACIONES.durPorPersona}
          durationInFrames={PRESENTACIONES.durPorPersona}
          premountFor={fps}
        >
          <Presentacion pid={j.id} logo="plata" standalone={false} />
        </Sequence>
      ))}
      <Sequence name="E3 Alineación" from={ALINEACION.from} durationInFrames={ALINEACION.dur} premountFor={fps}>
        <Alineacion />
      </Sequence>
      <Sequence name="E4 Cierre" from={CIERRE.from} durationInFrames={CIERRE.dur} premountFor={fps}>
        <Cierre />
      </Sequence>
      {cortes.map((c) => (
        <Sequence key={c} name="Transición" from={c - TRANS / 2} durationInFrames={TRANS}>
          <Transicion dur={TRANS} />
        </Sequence>
      ))}
      <Vineta />
      <Grano />
    </AbsoluteFill>
  );
};
