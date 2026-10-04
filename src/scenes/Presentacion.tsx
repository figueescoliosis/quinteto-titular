import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import ajustes from "../data/ajustes.json";
import team from "../data/team.json";
import { Capitan } from "../components/Capitan";
import { Fondo, Grano, Vineta } from "../components/Fondo";
import { Persona, colocar, type Colocacion } from "../components/Persona";
import { LineaPlata, TextoPlata } from "../components/TextoPlata";
import { COLOR, CURVA, LEXEND, clamp } from "../theme";
import { PRES } from "../timing";

export type TratamientoLogo = "color" | "plata";

const ESCUDO_RATIO = 889 / 721; // alto / ancho de public/brand/escudo.png
// Proporciones dentro del escudo (fracción del alto): cara de la mascota y borde inferior de "TEAM".
const ESCUDO_CARA_Y = 0.36;

// Ancho aproximado de Lexend Exa en mayúsculas con el tracking usado (em por carácter).
const EM_POR_LETRA = 1.12;

export const Presentacion: React.FC<{ pid: string; logo: TratamientoLogo }> = ({ pid, logo }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  const j = team.jugadores.find((x) => x.id === pid)!;
  const paso = PRES.clipIn + (j.paso_frame ?? 30);

  // --- Layout según formato ---
  const col: Colocacion = vertical
    ? { cabezaCx: width / 2, cabezaTop: 420, cabezaAncho: 200 }
    : { cabezaCx: width * 0.3, cabezaTop: 312, cabezaAncho: 165 };
  // El escudo se ubica desde la persona: la cara de la mascota queda tapada por la cara de la
  // persona (no compiten) y la banda "TEAM" asoma por encima de su cabeza.
  const logoW = col.cabezaAncho * 5.75;
  const logoTop = col.cabezaTop + col.cabezaAncho * 0.7 - ESCUDO_CARA_Y * logoW * ESCUDO_RATIO;
  const ajuste = (ajustes as Record<string, { escudoDx?: number }>)[pid] ?? {};
  const logoCx = col.cabezaCx + (ajuste.escudoDx ?? 0) * col.cabezaAncho;
  const textoMaxW = vertical ? width - 120 : width * 0.44;
  const apellido = j.apellido.toUpperCase();
  const apellidoSize = Math.min(vertical ? 150 : 170, textoMaxW / (apellido.length * EM_POR_LETRA));

  // --- Tiempos ---
  const entradaLogo = interpolate(frame, [PRES.logoIn, PRES.logoIn + PRES.logoDur], [0, 1], { ...clamp, easing: CURVA });
  // Protagonista: el paso. Destello de contraluz que estalla en `paso` y decae.
  const destello =
    interpolate(frame, [paso - 3, paso, paso + 24], [0, 1, 0], { ...clamp, easing: CURVA }) +
    interpolate(frame, [paso, paso + 30], [0, 0.3], clamp);
  const t0 = paso + PRES.textoDelay;
  const nombreP = interpolate(frame, [t0, t0 + 14], [0, 1], { ...clamp, easing: CURVA });
  const apellidoP = interpolate(frame, [t0 + 3, t0 + 19], [0, 1], { ...clamp, easing: CURVA });
  const brillo = interpolate(frame, [t0 + 8, t0 + 30], [0, 1], clamp);
  const lineaP = interpolate(frame, [t0 + 8, t0 + 24], [0, 1], { ...clamp, easing: CURVA });
  const rolP = interpolate(frame, [t0 + 12, t0 + 26], [0, 1], { ...clamp, easing: CURVA });
  const capitanP = interpolate(frame, [t0 + 10, t0 + 30], [0, 1], clamp);
  const camara = interpolate(frame, [0, 105], [1, 1.04], clamp);

  // Revelado de texto: sube desde detrás de una máscara (sin fade+slide genérico) y el tracking se cierra.
  const revelar = (p: number): React.CSSProperties => ({
    clipPath: `inset(${(1 - p) * 100}% -20% -20% -20%)`,
    translate: `0 ${(1 - p) * 0.35}em`,
  });

  const { s, top } = colocar(pid, col);
  const torsoY = top + 1100 * s * 0.5; // aprox. altura del pecho para el contraluz

  const filtroLogo =
    logo === "color"
      ? `brightness(${0.3 + 0.12 * entradaLogo + 0.4 * Math.min(1, destello)}) saturate(0.6)`
      : `grayscale(1) brightness(${0.4 + 0.12 * entradaLogo + 0.45 * Math.min(1, destello)}) contrast(1.1)`;

  const bloqueTexto = (
    <div
      style={{
        position: "absolute",
        ...(vertical
          ? { left: 0, right: 0, top: 1430, textAlign: "center" as const, alignItems: "center" }
          : { left: width * 0.53, top: 350, textAlign: "left" as const, alignItems: "flex-start" }),
        display: "flex",
        flexDirection: "column",
        fontFamily: LEXEND,
      }}
    >
      <div style={{ fontSize: vertical ? 54 : 54, fontWeight: 400, color: COLOR.plata, letterSpacing: "0.04em", ...revelar(nombreP) }}>
        {j.nombre}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: apellidoSize * 0.28,
          marginTop: vertical ? 6 : 4,
          flexDirection: "row",
        }}
      >
        <div
          style={{
            fontSize: apellidoSize,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: `${0.12 + (1 - apellidoP) * 0.25}em`,
            marginRight: "-0.12em",
            ...revelar(apellidoP),
          }}
        >
          <TextoPlata brillo={brillo}>{apellido}</TextoPlata>
        </div>
        {j.capitan ? <Capitan size={apellidoSize * 0.78} progreso={capitanP} /> : null}
      </div>
      <div style={{ marginTop: vertical ? 26 : 22 }}>
        <LineaPlata progreso={lineaP} ancho={vertical ? 560 : 640} origen={vertical ? "centro" : "izquierda"} />
      </div>
      {j.rol ? (
        <div
          style={{
            marginTop: vertical ? 22 : 18,
            fontSize: vertical ? 38 : 40,
            fontWeight: 400,
            color: COLOR.grafito,
            letterSpacing: "0.08em",
            ...revelar(rolP),
          }}
        >
          {j.rol}
        </div>
      ) : null}
    </div>
  );

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ scale: String(camara), transformOrigin: vertical ? "50% 40%" : "30% 45%" }}>
        <Fondo />
        {/* Logo detrás de la persona: entra desde desenfoque 1,1 -> 1,0 y gana brillo en el paso */}
        <Img
          src={staticFile("brand/escudo.png")}
          style={{
            position: "absolute",
            left: logoCx - logoW / 2,
            top: logoTop,
            width: logoW,
            height: logoW * ESCUDO_RATIO,
            opacity: entradaLogo * (logo === "color" ? 0.9 : 0.75),
            scale: String(1.1 - 0.1 * entradaLogo),
            filter: `${filtroLogo} blur(${(1 - entradaLogo) * 16}px)`,
          }}
        />
        {/* Contraluz Hielo detrás de la persona */}
        <AbsoluteFill style={{ mixBlendMode: "screen" }}>
          <div
            style={{
              position: "absolute",
              left: col.cabezaCx - (vertical ? 520 : 420),
              top: torsoY - (vertical ? 700 : 520),
              width: vertical ? 1040 : 840,
              height: vertical ? 1400 : 1040,
              background: `radial-gradient(ellipse 50% 50% at 50% 45%, rgba(214,238,255,0.95) 0%, rgba(168,219,255,0.45) 22%, rgba(168,219,255,0.12) 48%, rgba(168,219,255,0) 70%)`,
              opacity: 0.14 + 0.86 * Math.min(1, destello),
            }}
          />
        </AbsoluteFill>
        <Persona pid={pid} colocacion={col} contraluz={Math.min(1, destello)} desde={PRES.clipIn} />
        {/* Degradado Noche que funde la parte baja de la persona */}
        <AbsoluteFill
          style={{
            background: vertical
              ? `linear-gradient(180deg, rgba(6,16,43,0) 52%, rgba(6,16,43,0.82) 70%, ${COLOR.noche} 84%)`
              : `linear-gradient(180deg, rgba(6,16,43,0) 62%, rgba(6,16,43,0.85) 84%, ${COLOR.noche} 100%)`,
          }}
        />
        {bloqueTexto}
      </AbsoluteFill>
      <Vineta />
      <Grano />
    </AbsoluteFill>
  );
};
