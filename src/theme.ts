import { continueRender, delayRender, Easing, staticFile } from "remotion";

// Tokens de dirección de arte (Fase 3).
export const COLOR = {
  noche: "#06102B", // fondo base
  indigo: "#12245E", // resplandor central
  plata: "#E7ECF3", // texto y líneas
  grafito: "#8C97AB", // sombra de la plata y textos secundarios
  hielo: "#A8DBFF", // solo brillos y contraluz
} as const;

// Degradé metálico Plata -> Grafito para texto y líneas.
export const PLATA_GRADIENT = `linear-gradient(180deg, ${COLOR.plata} 0%, #D3DAE5 42%, #B4BDCC 58%, ${COLOR.grafito} 100%)`;

// Una sola familia: Lexend Exa (ancha, geométrica). Sin dorsales no hace falta la condensada.
// Se carga desde public/fonts (variable, 100-900; licencia OFL al lado): el Chrome del render no
// confía en el certificado del proxy de la VM, así que no puede bajarla de Google Fonts al renderizar.
export const LEXEND = "Lexend Exa Local";
if (typeof document !== "undefined") {
  const handle = delayRender("Cargando Lexend Exa");
  const face = new FontFace(LEXEND, `url(${staticFile("fonts/LexendExa-latin.woff2")}) format("woff2")`, {
    weight: "100 900",
  });
  face
    .load()
    .then((f) => {
      document.fonts.add(f);
      continueRender(handle);
    })
    .catch((err) => {
      throw err;
    });
}

// La misma curva en todo el video: spring sin rebote.
export const CURVA = Easing.bezier(0.16, 1, 0.3, 1);

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
