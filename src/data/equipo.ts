import team from "./team.json";

// Un campo se muestra solo si tiene contenido real (vacío o "[EDITAR...]" = no se muestra).
export const visible = (s?: string | null): s is string => !!s && !s.trim().startsWith("[EDITAR");

export const EQUIPO = team.equipo;
export const JUGADORES = team.jugadores;
export const ORDEN = team.orden_presentacion.map((id) => team.jugadores.find((j) => j.id === id)!);
export const CENTRO_FINAL = team.centro_foto_final;

type Jugador = (typeof team.jugadores)[number] & {
  apodo?: string;
  nombre_mostrado?: string;
  solo?: string;
  icono?: string;
};

// Línea chica sobre el texto grande: nombre (o el que pidió mostrar) + apodo entre comillas.
// Si la persona pidió aparecer solo con un nombre ("solo"), esta línea va vacía.
export const lineaNombre = (j: Jugador): string =>
  j.solo ? "" : `${j.nombre_mostrado ?? j.nombre}${j.apodo ? ` “${j.apodo}”` : ""}`;

// Texto grande en plata: el apellido, o solo el nombre pedido.
export const textoGrande = (j: Jugador): string => (j.solo ?? j.apellido).toUpperCase();

export const icono = (j: Jugador): string | undefined => j.icono;
