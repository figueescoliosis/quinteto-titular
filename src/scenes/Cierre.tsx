import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CENTRO_FINAL, EQUIPO, ORDEN, visible } from "../data/equipo";
import { colocar } from "../components/Persona";
import { TextoPlata } from "../components/TextoPlata";
import { COLOR, CURVA, LEXEND, clamp } from "../theme";

const ESCUDO_RATIO = 889 / 721;

// E4: los 5 recortes juntos en V (capitán adelante y al centro, el resto escalonado detrás y más
// chico), escudo a color, nombre del equipo grande en plata y el lema. Destello final y fundido a negro.
export const Cierre: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  const camara = interpolate(frame, [0, 120], [1, 1.04], clamp);

  const capitan = ORDEN.find((j) => j.id === CENTRO_FINAL)!;
  const resto = ORDEN.filter((j) => j.id !== CENTRO_FINAL);
  // Posiciones: [interior izq, interior der, exterior izq, exterior der]
  const cx = width / 2;
  const fila = vertical
    ? { top: [640, 600, 572], ancho: [135, 116, 100], dx: [0, 205, 372] }
    : { top: [292, 262, 240], ancho: [124, 106, 92], dx: [0, 255, 480] };
  const lugares = [
    { j: resto[3], nivel: 2, lado: 1 },
    { j: resto[2], nivel: 2, lado: -1 },
    { j: resto[1], nivel: 1, lado: 1 },
    { j: resto[0], nivel: 1, lado: -1 },
    { j: capitan, nivel: 0, lado: 0 },
  ].filter((l) => l.j); // de atrás hacia adelante

  const entrada = (nivel: number) => {
    const t = (2 - nivel) * 6; // exteriores primero, capitán al final
    return interpolate(frame, [t, t + 18], [0, 1], { ...clamp, easing: CURVA });
  };
  const nombreP = interpolate(frame, [26, 44], [0, 1], { ...clamp, easing: CURVA });
  const brillo = interpolate(frame, [34, 60], [0, 1], clamp);
  const lemaP = interpolate(frame, [40, 56], [0, 1], { ...clamp, easing: CURVA });
  const escudoP = interpolate(frame, [14, 34], [0, 1], { ...clamp, easing: CURVA });
  const destelloFinal = interpolate(frame, [96, 102, 112], [0, 1, 0], clamp);
  const negro = interpolate(frame, [104, 119], [0, 1], clamp);

  const nombre = visible(EQUIPO.nombre) ? EQUIPO.nombre.toUpperCase() : "";
  const nombreSize = Math.min(vertical ? 110 : 120, (vertical ? 940 : 1300) / (Math.max(1, nombre.length) * 1.12));
  const escudoW = vertical ? 300 : 190;
  const revelar = (p: number): React.CSSProperties => ({
    clipPath: `inset(${(1 - p) * 100}% -10% -25% -10%)`,
    translate: `0 ${(1 - p) * 0.35}em`,
  });

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ scale: String(camara), transformOrigin: "50% 45%" }}>
        {/* Contraluz general detrás del grupo */}
        <AbsoluteFill style={{ mixBlendMode: "screen" }}>
          <div
            style={{
              position: "absolute",
              left: cx - (vertical ? 620 : 820),
              top: (vertical ? 560 : 200) - 120,
              width: vertical ? 1240 : 1640,
              height: vertical ? 1100 : 820,
              background:
                "radial-gradient(ellipse 50% 50% at 50% 45%, rgba(168,219,255,0.5) 0%, rgba(168,219,255,0.15) 40%, rgba(168,219,255,0) 70%)",
              opacity: 0.35 + 0.5 * entrada(0) + destelloFinal * 0.5,
            }}
          />
        </AbsoluteFill>
        {/* Escudo a color arriba */}
        <Img
          src={staticFile("brand/escudo.png")}
          style={{
            position: "absolute",
            left: cx - escudoW / 2,
            top: vertical ? 150 : 22,
            width: escudoW,
            height: escudoW * ESCUDO_RATIO,
            opacity: escudoP,
            scale: String(0.9 + 0.1 * escudoP),
            filter: `drop-shadow(0 0 22px rgba(168,219,255,0.35))`,
          }}
        />
        {/* Los 5 en V */}
        {lugares.map(({ j, nivel, lado }) => {
          const p = entrada(nivel);
          const { s, left, top } = colocar(j.id, {
            cabezaCx: cx + lado * fila.dx[nivel],
            cabezaTop: fila.top[nivel],
            cabezaAncho: fila.ancho[nivel],
          });
          const sombra = nivel === 0 ? 1 : nivel === 1 ? 0.88 : 0.76; // los de atrás, un poco más oscuros
          return (
            <Img
              key={j.id}
              src={staticFile(`alpha/${j.id}_final.png`)}
              style={{
                position: "absolute",
                left,
                top,
                width: 1080,
                height: 1920,
                scale: String(s),
                transformOrigin: "0 0",
                opacity: p,
                filter: `saturate(0.8) contrast(1.08) brightness(${sombra * (1 + (1 - p) * 1.5)}) drop-shadow(0 0 ${12 / s}px rgba(168,219,255,0.55))`,
              }}
            />
          );
        })}
        {/* Funde la parte baja del grupo */}
        <AbsoluteFill
          style={{
            background: vertical
              ? `linear-gradient(180deg, rgba(6,16,43,0) 55%, rgba(6,16,43,0.85) 70%, ${COLOR.noche} 80%)`
              : `linear-gradient(180deg, rgba(6,16,43,0) 55%, rgba(6,16,43,0.85) 72%, ${COLOR.noche} 86%)`,
          }}
        />
        {/* Nombre del equipo y lema */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: vertical ? 1500 : 800,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            fontFamily: LEXEND,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: nombreSize, fontWeight: 700, letterSpacing: "0.12em", marginRight: "-0.12em", lineHeight: 1.1, ...revelar(nombreP) }}>
            <TextoPlata brillo={brillo}>{nombre}</TextoPlata>
          </div>
          {visible(EQUIPO.lema) ? (
            <div style={{ marginTop: 26, fontSize: vertical ? 36 : 32, color: COLOR.grafito, letterSpacing: "0.08em", ...revelar(lemaP) }}>
              {EQUIPO.lema}
            </div>
          ) : null}
        </div>
      </AbsoluteFill>
      {/* Destello final y fundido a negro */}
      <AbsoluteFill style={{ backgroundColor: "#DDEFFF", opacity: destelloFinal * 0.55, mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: negro }} />
    </AbsoluteFill>
  );
};
