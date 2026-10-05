// npm run check: falla si team.json conserva "[EDITAR" o falta algún archivo necesario para el render.
import { existsSync, readFileSync } from "node:fs";

const team = JSON.parse(readFileSync("src/data/team.json", "utf8"));
const errores = [];
if (JSON.stringify(team).includes("[EDITAR")) errores.push('team.json todavía tiene "[EDITAR]"');

const archivos = [
  `public/${team.equipo.escudo}`,
  "public/fonts/LexendExa-latin.woff2",
  "public/fx/grano.png",
  "public/fx/humo.png",
  "src/data/encuadre.json",
];
for (const j of team.jugadores) {
  archivos.push(`assets/raw/${j.clip}`, `public/alpha/${j.id}.webm`, `public/alpha/${j.id}_final.png`);
}
for (const f of archivos) if (!existsSync(f)) errores.push(`falta ${f}`);
// La música es opcional: si no está, el video sale sin audio.
if (!existsSync(`public/${team.musica}`)) console.log(`aviso: no hay public/${team.musica}, se renderiza sin música`);

if (errores.length) {
  console.error("CHECK FALLÓ:\n- " + errores.join("\n- "));
  process.exit(1);
}
console.log(`CHECK OK: ${archivos.length} archivos presentes, team.json completo`);
