// Duraciones y puntos de sync, en frames a 30 fps.
export const FPS = 30;
export const DURACION_TOTAL = 900;

export const INTRO = { from: 0, dur: 90 };
export const PRESENTACIONES = { from: 90, durPorPersona: 105 }; // 5 x 105 = 525 -> termina en 615
export const ALINEACION = { from: 615, dur: 165 };
export const CIERRE = { from: 780, dur: 120 };

// Dentro de cada presentación (frames locales de la escena de 105).
export const PRES = {
  clipIn: 4, // el recorte arranca aquí; su paso ocurre en clipIn + paso_frame
  logoIn: 0, // el logo entra desde desenfoque
  logoDur: 22,
  transicion: 8, // barrido diagonal de luz plateada al final de cada persona
  textoDelay: 6, // el texto entra unos frames después del paso
};

// Puntos para SFX (si existen archivos en public/audio/sfx/).
export const SFX = {
  whoosh: [90, 195, 300, 405, 510, 615, 780], // transiciones
  riser: 750, // antes del cierre
  // golpe grave en cada paso: PRESENTACIONES.from + i*105 + PRES.clipIn + paso_frame
};
