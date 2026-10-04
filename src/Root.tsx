import { Composition } from "remotion";
import { Presentacion } from "./scenes/Presentacion";
import { PRESENTACIONES } from "./timing";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Style frames de la Fase 3: una presentación individual en ambos formatos */}
      <Composition
        id="Presentacion-Vertical"
        component={Presentacion}
        durationInFrames={PRESENTACIONES.durPorPersona}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ pid: "p1", logo: "plata" as const }}
      />
      <Composition
        id="Presentacion-Horizontal"
        component={Presentacion}
        durationInFrames={PRESENTACIONES.durPorPersona}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ pid: "p1", logo: "plata" as const }}
      />
    </>
  );
};
