import { Composition } from "remotion";
import { Quinteto } from "./Quinteto";
import { Presentacion } from "./scenes/Presentacion";
import { NUEVO_DUR, NuevoIntegrante } from "./scenes/NuevoIntegrante";
import { DURACION_TOTAL, FPS, PRESENTACIONES } from "./timing";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="Quinteto-Vertical" component={Quinteto} durationInFrames={DURACION_TOTAL} fps={FPS} width={1080} height={1920} />
      <Composition id="Quinteto-Horizontal" component={Quinteto} durationInFrames={DURACION_TOTAL} fps={FPS} width={1920} height={1080} />
      {/* Instagram: Reel individual por persona (5 s; la escena termina y queda quieta 1,5 s) */}
      <Composition
        id="Reel-Persona"
        component={Presentacion}
        durationInFrames={150}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ pid: "p1", logo: "plata" as const }}
      />
      {/* La misma presentación de 5 s en horizontal (YouTube, pantallas) */}
      <Composition
        id="Persona-Horizontal"
        component={Presentacion}
        durationInFrames={150}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{ pid: "p6", logo: "plata" as const }}
      />
      {/* Integrante nuevo: rótulo de bienvenida + su presentación (7,5 s) */}
      <Composition id="Nuevo-Integrante" component={NuevoIntegrante} durationInFrames={NUEVO_DUR} fps={FPS} width={1080} height={1920}
        defaultProps={{ pid: "p6" }} />
      <Composition id="Nuevo-Integrante-Horizontal" component={NuevoIntegrante} durationInFrames={NUEVO_DUR} fps={FPS} width={1920} height={1080}
        defaultProps={{ pid: "p6" }} />
      {/* Style frames de la Fase 3: una presentación individual suelta */}
      <Composition
        id="Presentacion-Vertical"
        component={Presentacion}
        durationInFrames={PRESENTACIONES.durPorPersona}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ pid: "p1", logo: "plata" as const }}
      />
      <Composition
        id="Presentacion-Horizontal"
        component={Presentacion}
        durationInFrames={PRESENTACIONES.durPorPersona}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{ pid: "p1", logo: "plata" as const }}
      />
    </>
  );
};
