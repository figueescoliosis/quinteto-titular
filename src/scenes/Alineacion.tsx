import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { EQUIPO, ORDEN, visible } from "../data/equipo";
import { Retrato } from "../components/Retrato";
import { LineaPlata, TextoPlata } from "../components/TextoPlata";
import { COLOR, CURVA, LEXEND, clamp } from "../theme";

const ESCUDO_RATIO = 889 / 721;

// E3 (reemplaza a la cancha): la alineación. Los 5 aparecen en cascada en una lista plateada
// estilo transmisión, con la C de capitán junto a Pablo. Vertical: filas. Horizontal: columnas.
export const Alineacion: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  const camara = interpolate(frame, [0, 165], [1, 1.04], clamp);
  const tituloP = interpolate(frame, [4, 20], [0, 1], { ...clamp, easing: CURVA });
  const brilloTitulo = interpolate(frame, [12, 36], [0, 1], clamp);
  const revelar = (p: number): React.CSSProperties => ({
    clipPath: `inset(${(1 - p) * 100}% -10% -25% -10%)`,
    translate: `0 ${(1 - p) * 0.35}em`,
  });

  const items = ORDEN.map((j, i) => {
    const t = 22 + i * 10;
    return {
      j,
      anillo: interpolate(frame, [t, t + 16], [0, 1], { ...clamp, easing: CURVA }),
      foto: interpolate(frame, [t + 4, t + 18], [0, 1], { ...clamp, easing: CURVA }),
      texto: interpolate(frame, [t + 6, t + 20], [0, 1], { ...clamp, easing: CURVA }),
      brillo: interpolate(frame, [t + 10, t + 32], [0, 1], clamp),
      linea: interpolate(frame, [t + 10, t + 26], [0, 1], { ...clamp, easing: CURVA }),
    };
  });

  const escudoW = vertical ? 900 : 760;
  return (
    <AbsoluteFill style={{ scale: String(camara), fontFamily: LEXEND }}>
      {/* Escudo plata muy tenue de fondo */}
      <Img
        src={staticFile("brand/escudo.png")}
        style={{
          position: "absolute",
          left: width / 2 - escudoW / 2,
          top: height / 2 - (escudoW * ESCUDO_RATIO) / 2,
          width: escudoW,
          height: escudoW * ESCUDO_RATIO,
          filter: "grayscale(1) brightness(0.45)",
          opacity: 0.14 * tituloP,
        }}
      />
      {/* Título */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: vertical ? 230 : 110,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {visible(EQUIPO.nombre) ? (
          <div style={{ fontSize: vertical ? 30 : 26, color: COLOR.grafito, letterSpacing: "0.3em", marginRight: "-0.3em", ...revelar(tituloP) }}>
            {`Team ${EQUIPO.nombre}`}
          </div>
        ) : null}
        <div style={{ marginTop: 12, fontSize: vertical ? 76 : 70, fontWeight: 700, letterSpacing: "0.2em", marginRight: "-0.2em", ...revelar(tituloP) }}>
          <TextoPlata brillo={brilloTitulo}>ALINEACIÓN</TextoPlata>
        </div>
        <div style={{ marginTop: 22 }}>
          <LineaPlata progreso={tituloP} ancho={vertical ? 600 : 700} />
        </div>
      </div>

      {vertical ? (
        <div style={{ position: "absolute", left: 120, right: 120, top: 560, display: "flex", flexDirection: "column" }}>
          {items.map(({ j, anillo, foto, texto, brillo, linea }, i) => {
            const size = 170;
            const apSize = Math.min(78, 600 / (j.apellido.length * 1.12));
            return (
              <div key={j.id}>
                <div style={{ display: "flex", alignItems: "center", gap: 44, height: 222 }}>
                  <Retrato pid={j.id} size={size} anillo={anillo} foto={foto} />
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ fontSize: 36, color: COLOR.plata, letterSpacing: "0.04em", ...revelar(texto) }}>{j.nombre}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 4 }}>
                      <div style={{ fontSize: apSize, fontWeight: 700, letterSpacing: "0.12em", lineHeight: 1.1, ...revelar(texto) }}>
                        <TextoPlata brillo={brillo}>{j.apellido.toUpperCase()}</TextoPlata>
                      </div>
                    </div>
                  </div>
                </div>
                {i < items.length - 1 ? <LineaPlata progreso={linea} ancho={840} origen="izquierda" /> : null}
              </div>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            position: "absolute",
            left: 80,
            right: 80,
            top: 360,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          {items.map(({ j, anillo, foto, texto, brillo }) => {
            const size = 230;
            const apSize = Math.min(54, 330 / (j.apellido.length * 1.12));
            return (
              <div key={j.id} style={{ width: 340, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <Retrato pid={j.id} size={size} anillo={anillo} foto={foto} />
                <div style={{ marginTop: 34, fontSize: 30, color: COLOR.plata, letterSpacing: "0.04em", ...revelar(texto) }}>{j.nombre}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 6 }}>
                  <div style={{ fontSize: apSize, fontWeight: 700, letterSpacing: "0.12em", marginRight: "-0.12em", lineHeight: 1.1, ...revelar(texto) }}>
                    <TextoPlata brillo={brillo}>{j.apellido.toUpperCase()}</TextoPlata>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AbsoluteFill>
  );
};
