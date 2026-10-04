import { AbsoluteFill, Composition, staticFile } from "remotion";
import { Video } from "@remotion/media";

// Composición temporal de verificación (alpha de los recortes). Se reemplaza en Fase 3.
export const MyComposition = () => {
  return (
    <Composition id="Prueba" component={MyComponent} durationInFrames={90} fps={30} width={1080} height={1920} />
  );
};

export const MyComponent: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#c00" }}>
      <Video src={staticFile("alpha/p1.webm")} muted />
    </AbsoluteFill>
  );
};
