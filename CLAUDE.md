PROMPT: VIDEO "QUINTETO TITULAR" ESTILO NOCHE DE CHAMPIONS
Versión nube: sesión cloud de Claude Code (desde la app del celular) sobre el repo quinteto-titular.
Todo lo marcado [EDITAR] está sin confirmar.

==================================================================
0. REGLAS DE TRABAJO
==================================================================
- Primero guarda este prompt completo como CLAUDE.md en la raíz del repo y agrega al final una sección "ESTADO" (fase actual, decisiones, pendientes). En sesiones nuevas, retoma desde ESTADO.
- Empieza en modo plan: presenta tu plan de la Fase 1 y espera mi aprobación.
- Trabaja por fases. Al cerrar cada una: actualiza ESTADO, haz commit + push y detente en su CHECKPOINT hasta mi "OK". La VM puede reciclarse: lo que no esté en git se pierde.
- Usa una sola rama durante todo el trabajo y dime su nombre.
- Reviso desde el celular: no puedo abrir Remotion Studio ni entrar a la VM. En cada checkpoint deja previews livianas en previews/ (JPG o MP4) y dame el link directo de GitHub a cada una.
- Los datos del equipo te los paso en el chat y tú los escribes en team.json. No inventes nada: lo que falte queda como "[EDITAR]".
- Revisa tu propio trabajo: renderiza stills, míralos y corrige antes de mostrármelos.

==================================================================
1. ENTORNO (VM EN LA NUBE)
==================================================================
- Ubuntu 24.04 x86_64, ~4 vCPU, 16 GB RAM, 30 GB de disco, sin GPU.
- Red "Trusted": npm, PyPI, apt de Ubuntu, storage.googleapis.com y Google Fonts funcionan; otros dominios no. Si algo necesita un dominio fuera de la lista, dime cuál exactamente y lo agrego al entorno.
- Las descargas de releases de repos de GitHub ajenos devuelven 403. Por eso el modelo de recorte ya viene subido al repo: no lo descargues.
- Usa npm/npx, no bun (tiene problemas con el proxy).
- Los comandos en primer plano cortan a los 10 min: renders y procesos largos van en segundo plano con log, o por tramos.

Crea scripts/setup_env.sh con exactamente esto y hazlo ejecutable:

#!/bin/bash
# Prepara la VM cloud de Claude Code. Idempotente: solo instala lo que falta.
[ "$CLAUDE_CODE_REMOTE" = "true" ] || exit 0
cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/..}" || exit 0
SUDO=""; [ "$(id -u)" = 0 ] || SUDO="sudo"
if [ ! -f /var/tmp/quinteto_apt_ok ]; then
  $SUDO apt-get update -qq && $SUDO apt-get install -y -qq ffmpeg python3-venv \
    libnss3 libdbus-1-3 libatk1.0-0t64 libatk-bridge2.0-0t64 libgbm1 libasound2t64 \
    libxrandr2 libxkbcommon0 libxfixes3 libxcomposite1 libxdamage1 \
    libpango-1.0-0 libcairo2 libcups2t64 && touch /var/tmp/quinteto_apt_ok
fi
[ -x .venv/bin/python ] || python3 -m venv .venv
.venv/bin/python -c "import onnxruntime, cv2, PIL" 2>/dev/null || \
  .venv/bin/pip install -q onnxruntime numpy pillow opencv-python-headless
if [ -f package.json ]; then
  [ -d node_modules ] || npm install --no-audit --no-fund
  npx remotion browser ensure >/dev/null 2>&1
fi
exit 0

Regístralo como SessionStart hook en .claude/settings.json:
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|resume",
        "hooks": [
          { "type": "command", "command": "bash \"$CLAUDE_PROJECT_DIR\"/scripts/setup_env.sh" }
        ]
      }
    ]
  }
}

.gitignore: node_modules/, .venv/, assets/work/. Sí van a git: assets/raw/, models/, public/, previews/ y out/.
Si algún paquete de apt no existe con ese nombre, corrige el script (no lo saltes) y avísame.

==================================================================
2. OBJETIVO
==================================================================
Video de presentación de un equipo de 5 personas como la alineación titular en una transmisión de Champions: noche, azul profundo y plata; épico pero sobrio.
- Dos salidas del mismo proyecto: vertical 1080x1920 y horizontal 1920x1080, 30 fps, ~30 s.
- Material: 5 videos, uno por persona: brazos cruzados, serios, dando un paso adelante.
- Formación: futsal, rombo 1-2-1 + arquero (arquero, cierre, ala izquierda, ala derecha, pívot).
- Somos exactamente 5. El arquero es también el capitán.
- Sin logos, himno, balón de estrellas ni tipografías oficiales de la UEFA: solo la atmósfera.
- Qué es el equipo y a qué se dedica: [EDITAR]

==================================================================
3. ESTRUCTURA
==================================================================
Subí a la raíz del repo los 5 videos, rvm_mobilenetv3_fp32.onnx y, si están, escudo.png y una pista de música. Ordénalos con git mv:

quinteto-titular/
  assets/raw/          5 videos originales (fuera de public/ para no inflar el bundle)
  assets/work/         temporales (no van a git)
  models/              rvm_mobilenetv3_fp32.onnx
  public/alpha/        recortes con transparencia: pN.webm y pN_final.png
  public/brand/        escudo.png [EDITAR] (si no hay, propón uno simple con las iniciales, en plata)
  public/audio/        musica.mp3 [EDITAR] y sfx/ (opcional)
  scripts/             setup_env.sh y los scripts del pipeline
  src/data/team.json   datos del equipo
  src/timing.ts        duraciones y puntos de sync, en frames
  previews/            lo que reviso desde el celular
  out/                 renders finales

team.json ("acento" en null = solo plata; "lema" vacío = no se muestra; si no existe la música, se renderiza sin ella):
{
  "equipo": {
    "nombre": "[EDITAR]",
    "lema": "[EDITAR]",
    "ocasion": "[EDITAR: evento o fecha]",
    "escudo": "brand/escudo.png",
    "acento": null
  },
  "jugadores": [
    { "id": "p1", "nombre": "[EDITAR]", "apellido": "[EDITAR]", "dorsal": "[EDITAR]", "posicion": "arquero",       "capitan": true,  "rol": "[EDITAR]", "clip": "[EDITAR]", "corte": null, "paso_frame": null },
    { "id": "p2", "nombre": "[EDITAR]", "apellido": "[EDITAR]", "dorsal": "[EDITAR]", "posicion": "cierre",        "capitan": false, "rol": "[EDITAR]", "clip": "[EDITAR]", "corte": null, "paso_frame": null },
    { "id": "p3", "nombre": "[EDITAR]", "apellido": "[EDITAR]", "dorsal": "[EDITAR]", "posicion": "ala_izquierda", "capitan": false, "rol": "[EDITAR]", "clip": "[EDITAR]", "corte": null, "paso_frame": null },
    { "id": "p4", "nombre": "[EDITAR]", "apellido": "[EDITAR]", "dorsal": "[EDITAR]", "posicion": "ala_derecha",   "capitan": false, "rol": "[EDITAR]", "clip": "[EDITAR]", "corte": null, "paso_frame": null },
    { "id": "p5", "nombre": "[EDITAR]", "apellido": "[EDITAR]", "dorsal": "[EDITAR]", "posicion": "pivot",         "capitan": false, "rol": "[EDITAR]", "clip": "[EDITAR]", "corte": null, "paso_frame": null }
  ],
  "orden_presentacion": ["p1", "p2", "p3", "p4", "p5"],
  "centro_foto_final": "p1",
  "musica": "audio/musica.mp3"
}

==================================================================
FASE 1. ENTORNO, PROYECTO Y ANÁLISIS DE CLIPS
==================================================================
1. Guarda CLAUDE.md, ordena lo que subí, crea setup_env.sh, el hook y .gitignore, y ejecuta el script.
2. Proyecto Remotion en la raíz: `npx create-video@latest` (plantilla en blanco, TypeScript). Si el CLI no acepta una carpeta con archivos, créalo aparte y muévelo. Si no logra bajar la plantilla, arma el proyecto a mano (remotion, @remotion/cli, react, react-dom; src/index.ts y src/Root.tsx).
3. Skill oficial: `npx skills add remotion-dev/skills`. Si la red la bloquea, prueba `npx remotion skills add`; si tampoco, sigue sin ella y avísame.
4. Dependencias mínimas: @remotion/google-fonts y @remotion/media. Nada más sin preguntarme. Corre de nuevo setup_env.sh para dejar listo el navegador de Remotion y confírmalo con un still de prueba.
5. Por cada clip, con ffprobe: resolución, rotación, fps, duración y códec (ojo con HEVC/.mov de iPhone).
6. Hojas de contacto por clip (1 frame cada 0,25 s, con su tiempo) en assets/work/contact/. Míralas y anota: encuadre (cuerpo entero o plano medio), fondo, otras personas en cuadro y el momento en que el pie pisa al dar el paso (afínalo mirando los frames vecinos).
7. Propón el corte de cada clip: 2,5 a 3,5 s con postura inicial, paso y quedarse firme con los brazos cruzados. paso_frame se cuenta desde el inicio del corte, a 30 fps.
8. Sube a previews/ un JPG por clip (frame central, con el nombre del archivo escrito encima) para que yo diga quién es quién.

CHECKPOINT 1: tabla por clip (archivo, datos técnicos, encuadre, fondo, corte, paso_frame) y links a los JPG. Te paso en el chat nombres, dorsales, roles y quién es quién; tú completas team.json.

==================================================================
FASE 2. NORMALIZAR Y RECORTAR CON IA
==================================================================
1. Corta y normaliza cada clip: 30 fps constantes, rotación aplicada, lado corto de 1080 px, sin audio -> assets/work/norm/pN.mp4.
2. Iguala levemente exposición y balance de blancos entre los 5 para que parezcan de la misma sesión. Sin looks fuertes: el grading final va en Remotion.
3. Recorte con RobustVideoMatting en ONNX Runtime (CPU, dentro de .venv), modelo models/rvm_mobilenetv3_fp32.onnx:
   - Entradas: src [1,3,H,W] float32 en 0-1; r1i..r4i, el estado recurrente, que parte en ceros de forma [1,1,1,1]; downsample_ratio [1] float32.
   - Salidas: fgr, pha y r1o..r4o. Las r*o entran como r*i en el frame siguiente. Procesa en orden y reinicia el estado en cada clip.
   - downsample_ratio en 1080p: ~0,25 si es plano medio, ~0,4 si es cuerpo entero (regla: la imagen reducida queda entre 256 y 512 px).
   - Arma el RGBA con los colores de fgr (no los del frame original, así no arrastra el fondo) y pha como alpha -> PNG en assets/work/alpha_png/pN/.
   - Referencia: ~0,4 s por frame a 1080x1920 en CPU.
   - Si un clip tiene fondo verde liso, compara contra un chroma key y quédate con el más limpio.
4. Limpieza solo si se nota: halo de 1 px (erosión o feather suave del alpha) y contaminación de color en los bordes.
5. Codifica public/alpha/pN.webm (VP9 con alpha, yuva420p) y guarda el último frame como public/alpha/pN_final.png.
6. Previews en previews/: JPG de cada recorte en su paso_frame sobre magenta y sobre azul noche, y un MP4 de 540 px de alto con los 5 recortes seguidos sobre azul noche.

CHECKPOINT 2: links a las previews y tiempo por clip. Si alguno falla (fondo cargado, gente detrás), propón alternativas: modelo resnet50 (yo subo rvm_resnet50_fp32.onnx), recortar el encuadre antes del matting, o usar ese clip enmarcado sin recorte.

==================================================================
FASE 3. DIRECCIÓN DE ARTE Y STYLE FRAME
==================================================================
Antes de codear, define los tokens y revísalos contra este brief. Si algo se ve como plantilla deportiva genérica, cámbialo y dime qué cambiaste.

Paleta:
- Noche    #06102B   fondo base
- Índigo   #12245E   resplandor central (radial)
- Plata    #E7ECF3   texto y líneas, en degradé metálico hacia Grafito
- Grafito  #8C97AB   sombra de la plata y textos secundarios
- Hielo    #A8DBFF   solo brillos y contraluz
- Acento del equipo: solo si team.json lo define, y en un único detalle.

Tipografía (@remotion/google-fonts), dos familias bien distintas:
- Lexend Exa 600-700: títulos y apellidos, en mayúsculas con tracking amplio. Ancha y geométrica, como el broadcast europeo.
- Big Shoulders Display 800-900 (o su versión actual en Google Fonts): dorsales gigantes, condensados y altos.
- Nombre, posición y rol en Lexend Exa 400, en minúsculas normales.
- Si en el style frame no convence: Syncopate + Barlow Condensed. Una sola pareja en todo el video.

Protagonista único: el paso adelante. En paso_frame estalla el contraluz Hielo detrás de la persona y el dorsal gigante gana brillo. Todo lo demás acompaña en voz baja.

Capitán (p1): una C plateada dentro de un anillo fino junto a su apellido, en su marcador de la formación y en el cierre.

Ambiente, siempre sutil:
- Fondo radial Índigo -> Noche, estrellas plateadas pequeñas que titilan lento, grano fino y viñeta.
- Haces de luz desde arriba (blend screen, baja opacidad). Humo procedural solo abajo y muy tenue.
- Cámara: push-in lento, escala 1,00 -> 1,04 por escena.

Personas:
- Filtro leve igual para los 5: contraste +, saturación -, tono apenas frío.
- Contraluz: drop-shadow Hielo que sigue el alpha.
- Cuerpo entero: sombra suave en el piso. Plano medio: degradado Noche que funde la parte baja.

Texto plateado: degradé Plata -> Grafito con background-clip: text y un barrido de brillo diagonal al entrar (una vez, no en loop).

Movimiento: springs sin rebote, entradas escalonadas cortas, la misma curva en todo el video. Nada de fade + slide genérico en cada elemento.

Técnica:
- Determinístico: random() de remotion con seed, nunca Math.random.
- Duraciones y puntos de sync en src/timing.ts. Mismos componentes para ambos formatos; el layout cambia según useVideoConfig().
- Recortes con <Video> de @remotion/media (soporta alpha) u <OffthreadVideo transparent>, según indique la skill.
- Rendimiento: la VM no tiene GPU. Evita blur y drop-shadow sobre capas de pantalla completa y precalcula como PNG los fondos que no cambian.

Layout de la presentación individual:
VERTICAL 9:16            HORIZONTAL 16:9
+-----------+            +------------------------------+
|    77     |            |      77                      |
|  +-----+  |            |   +-----+                    |
|  |     |  |            |   |     |   nombre           |
|  |  P  |  |            |   |  P  |   APELLIDO         |
|  |     |  |            |   |     |   posición, rol    |
|  +-----+  |            |   +-----+                    |
|  nombre   |            +------------------------------+
| APELLIDO  |
| pos., rol |
+-----------+
P = persona recortada. 77 = dorsal gigante, detrás de P.
Vertical: texto centrado sobre el degradado Noche que funde la parte baja.
Horizontal: P en el tercio izquierdo, texto alineado a la izquierda.

Haz primero UN style frame: la presentación de p1 en su paso_frame, en ambos formatos (`npx remotion still`), y súbelos a previews/.

CHECKPOINT 3: links a los dos stills y tokens finales. No avanzar hasta que apruebe el look.

==================================================================
FASE 4. ESCENAS (30 s = 900 frames a 30 fps)
==================================================================
Composiciones: "Quinteto-Vertical" (1080x1920) y "Quinteto-Horizontal" (1920x1080). Mismo timing, layout adaptado.

E1 Intro (0-3 s, frames 0-90):
Estrellas que convergen al centro en un destello, aparece el escudo y luego "QUINTETO TITULAR" en plata con su barrido de brillo. Debajo, nombre del equipo y ocasión.

E2 Presentaciones (3-20,5 s, frames 90-615; 105 frames por persona, en orden_presentacion):
- El dorsal gigante entra desde desenfoque, escala 1,1 -> 1,0.
- La persona da su paso; en paso_frame, destello de contraluz Hielo.
- Entra el bloque de texto: nombre, APELLIDO, línea fina plateada, posición y rol.
- Transición entre personas: barrido diagonal de luz plateada (~8 frames).
- Si un clip dura menos que su tramo, congela su último frame (no cambies la velocidad).

E3 Formación (20,5-26 s, frames 615-780):
- Cancha de futsal 40x20 m con líneas plateadas finas sobre azul (perímetro, media cancha, círculo central, áreas, arcos).
- Vertical: cancha vertical con el arquero abajo. Horizontal: cancha horizontal en perspectiva (rotateX) con el arquero a la izquierda.
- Los 5 marcadores (anillo plateado con el dorsal y el apellido debajo) entran en cascada a su lugar del rombo 1-2-1; luego se dibujan las líneas del rombo (stroke-dashoffset).
- Título: "Rombo 1-2-1".

E4 Cierre (26-30 s, frames 780-900):
- Los 5 recortes (pN_final.png) juntos en V: el capitán (centro_foto_final) adelante y al centro, el resto escalonado detrás y algo más chico.
- Nombre del equipo grande en plata y el lema. Destello final y fundido a negro.

Audio:
- musica.mp3 [EDITAR: pista libre de derechos] con fade in/out: baja en la intro, sube desde E2. Si no existe, renderiza sin música (el vertical lo musicalizo en la app de Reels/TikTok).
- Si hay archivos en public/audio/sfx/: whoosh en cada transición, golpe grave en cada paso_frame y un riser antes de E4. Si no hay, deja esos puntos marcados en timing.ts.

CHECKPOINT 4: render de preview de ambas composiciones a media escala (--scale=0.5 --crf=28) en previews/, sus links y tu lista de ajustes sugeridos.

==================================================================
FASE 5. RENDER Y ENTREGA
==================================================================
1. Agrega `npm run check`: falla si team.json conserva "[EDITAR]" o falta algún archivo. Si falla, avísame y no renderices.
2. Render H.264 en segundo plano con log y --concurrency=4 (por tramos con --frames y unido con ffmpeg si hace falta):
   npx remotion render Quinteto-Vertical out/quinteto_9x16.mp4 --crf=18
   npx remotion render Quinteto-Horizontal out/quinteto_16x9.mp4 --crf=18
3. Si un archivo pasa de 50 MB, sube el CRF a 20-22 (GitHub rechaza archivos de más de 100 MB).
4. Portadas con `npx remotion still` de un frame del cierre: out/portada_9x16.png y out/portada_16x9.png.
5. Commit + push.

CHECKPOINT FINAL: links de descarga, duración y peso de cada archivo, y pendientes.

==================================================================
ESTADO
==================================================================
Rama única: ccr-a15b3306-j21m9o

Fase actual: FASE 1 TERMINADA — detenido en CHECKPOINT 1, esperando "OK" + datos del equipo (quién es quién).

Hecho en Fase 1:
- Videos movidos con git mv a assets/raw/. Modelo en models/.
- scripts/setup_env.sh (tal cual el prompt; todos los paquetes apt existen con ese nombre en Ubuntu 24.04, sin cambios), hook SessionStart en .claude/settings.json, .gitignore.
- Proyecto Remotion 4.0.532 (create-video --blank, TS, sin Tailwind) movido a la raíz. Deps extra: @remotion/google-fonts y @remotion/media (versiones fijas 4.0.532).
- Skill oficial instalada con `npx skills add remotion-dev/skills` en .claude/skills/ (remotion-best-practices, -multimedia, -render, etc.).
- Navegador de Remotion OK: still de prueba renderizado (composición temporal "Prueba" en src/Composition.tsx; se reemplaza en Fase 3).
- Análisis de clips en src/data/clips.json (cortes y paso_frame propuestos). team.json con plantilla en src/data/team.json.
- Previews: previews/f1_WA0087..91.jpg y previews/f1_todos.jpg.

Datos técnicos (ffprobe, los 5 iguales salvo duración):
- H.264 Baseline, 720x1280 vertical, sin rotación, ~59,97 fps (VFR leve, jitter 15-18 ms), audio AAC (se descarta).
- Duraciones: WA0087 7,04 s · WA0088 16,24 s · WA0089 21,48 s · WA0090 25,70 s · WA0091 24,61 s.
- Fondo común: barril gigante de madera con banda negra, pasto y arbustos; sin otras personas en cuadro. WA0087 y WA0089 con sol fuerte; el resto más nublado (igualar en Fase 2).

Cortes propuestos (seg. del original -> paso_frame a 30 fps desde el inicio del corte):
- WA0087: 1,25-4,10 (2,85 s), pisa 2,37 s -> paso_frame 34. Plano americano (corta en rodillas).
- WA0088: 12,25-14,90 (2,65 s), pisa 13,55 s -> 39. Casi entero (corta en tobillos).
- WA0089: 4,75-7,75 (3,00 s), pisa 5,88 s -> 34. Cuerpo entero con pies y piso (persona más chica en cuadro).
- WA0090: 7,75-10,75 (3,00 s), pisa 8,98 s -> 37. Plano americano tras el paso.
- WA0091: 4,90-8,20 (3,30 s), pisa 5,78 s -> 27. Casi entero.
- Alternativas vistas: WA0088 7,0-9,0 (brazos cruzados sin paso claro); WA0089 17,0-19,5 (sin paso claro); WA0090 17,0-20,0 (sonriendo); WA0091 20,0-23,2 (paso girando desde perfil).

Decisiones:
- Resolución: se normaliza a 1080 de lado corto con lanczos en Fase 2 (propuesto; el usuario dio OK general sin objetar).
- Encuadres mezclados: en Fase 3 usar el degradado Noche que funde la parte baja para todos, y sombra en piso solo si queda bien con WA0089.

Pendientes / preguntas abiertas:
- Quién es quién + nombres, apellidos, dorsales, roles (para completar team.json).
- ¿Hay originales sin comprimir (sin WhatsApp)? Si llegan, se reemplazan en assets/raw/.
- Imagen "TEAM MYLQUIADES TCG" enviada en el chat: ¿es el escudo / nombre del equipo, o solo referencia? Sin respuesta aún.
- Nombre del equipo, lema, ocasión, a qué se dedica; escudo.png; musica.mp3.
