import team from "./team.json";

// Un campo se muestra solo si tiene contenido real (vacío o "[EDITAR...]" = no se muestra).
export const visible = (s?: string | null): s is string => !!s && !s.trim().startsWith("[EDITAR");

export const EQUIPO = team.equipo;
export const JUGADORES = team.jugadores;
export const ORDEN = team.orden_presentacion.map((id) => team.jugadores.find((j) => j.id === id)!);
export const CENTRO_FINAL = team.centro_foto_final;
