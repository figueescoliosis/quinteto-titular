import { AbsoluteFill, Composition } from "remotion";

// Composición temporal para verificar que el navegador de Remotion funciona.
export const MyComposition = () => {
  return (
    <Composition
      id="Prueba"
      component={MyComponent}
      durationInFrames={30}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};

export const MyComponent: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle, #12245E 0%, #06102B 70%)",
        color: "#E7ECF3",
        justifyContent: "center",
        alignItems: "center",
        fontSize: 80,
        fontFamily: "sans-serif",
        letterSpacing: 12,
      }}
    >
      QUINTETO TITULAR
    </AbsoluteFill>
  );
};
