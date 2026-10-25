#!/bin/bash
# Publicaciones de Instagram (out/instagram/):
#  - NN_nombre_reel.mp4  : Reel individual 1080x1920, 5 s
#  - NN_nombre_foto.jpg  : foto 1080x1350 (4:5, feed) del final de su presentación
#  - 00_equipo_reel.mp4 / 00_equipo_foto.jpg : video completo y foto del cierre
# Uso: instagram.sh            -> los 5 del video del equipo + el video completo
#      instagram.sh p6 [...]   -> solo esas personas; además su versión 16:9 y la de «nuevo integrante»
#                                 (9:16 y 16:9)
# Calidad máxima para Instagram: 1080x1920 30 fps H.264 High, BT.709, CRF ${CRF_IG:-10} preset slow,
# pista AAC silenciosa (compatibilidad) y +faststart. Fotos JPEG calidad 100 con croma 4:4:4.
cd "$(dirname "$0")/.." || exit 1
CRF_IG=${CRF_IG:-10}
reel() { # composición, salida, props
  npx remotion render "$1" assets/work/ig/tmp_reel.mp4 ${3:+--props="$3"} --crf=$CRF_IG --x264-preset=slow \
    --color-space=bt709 --concurrency=4 2>&1 | grep -E "rror"
  ffmpeg -v error -y -i assets/work/ig/tmp_reel.mp4 -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=48000 \
    -map 0:v -map 1:a -c:v copy -c:a aac -b:a 128k -shortest -movflags +faststart "$2"
}
O=out/instagram; mkdir -p $O assets/work/ig
# foto 4:5 desde un still vertical: escala 0,8 y recorta la ventana útil (deja logo, persona y texto)
foto() { .venv/bin/python - "$1" "$2" "$3" <<'PY'
import sys, cv2, numpy as np
src, dst, y0 = sys.argv[1], sys.argv[2], int(sys.argv[3])
im = cv2.imread(src); s = 0.8
im = cv2.resize(im, (round(1080*s), round(1920*s)), interpolation=cv2.INTER_AREA)
win = im[y0:y0+1350]
# márgenes laterales color Noche con un fundido suave del borde (sin estirar la imagen)
noche = np.array([0x2B, 0x10, 0x06], np.float32)
w = win.shape[1]; f = 70
ramp = np.clip(np.minimum(np.arange(w), np.arange(w)[::-1]) / f, 0, 1)[None, :, None]
win = (win.astype(np.float32) * ramp + noche * (1 - ramp)).astype(np.uint8)
pad = (1080 - w) // 2
out = cv2.copyMakeBorder(win, 0, 0, pad, 1080 - w - pad, cv2.BORDER_CONSTANT, value=noche.tolist())
cv2.imwrite(dst, out, [cv2.IMWRITE_JPEG_QUALITY, 100, cv2.IMWRITE_JPEG_SAMPLING_FACTOR, cv2.IMWRITE_JPEG_SAMPLING_FACTOR_444])
PY
}
for pid in ${@:-p1 p2 p3 p4 p5}; do
  # número = posición en team.json; nombre de archivo sin tildes ni espacios
  read -r n slug < <(python3 -c "import json,unicodedata;js=json.load(open('src/data/team.json'))['jugadores'];k=[x['id'] for x in js].index('$pid');j=js[k];t=(j.get('solo') or j['nombre']+'_'+j['apellido']).lower().replace(' ','_');print('%02d'%(k+1), unicodedata.normalize('NFKD',t).encode('ascii','ignore').decode())")
  props="{\"pid\":\"$pid\",\"logo\":\"plata\"}"
  reel Reel-Persona $O/${n}_${slug}_reel.mp4 "$props"
  npx remotion still Presentacion-Vertical assets/work/ig/$pid.png --frame=100 --image-format=png --props="$props" 2>&1 | grep -E "rror"
  foto assets/work/ig/$pid.png $O/${n}_${slug}_foto.jpg 95
  if [ $# -gt 0 ]; then
    reel Persona-Horizontal $O/${n}_${slug}_16x9.mp4 "$props"
    reel Nuevo-Integrante $O/${n}_${slug}_nuevo_integrante.mp4 "{\"pid\":\"$pid\"}"
    reel Nuevo-Integrante-Horizontal $O/${n}_${slug}_nuevo_integrante_16x9.mp4 "{\"pid\":\"$pid\"}"
  fi
done
if [ $# -eq 0 ]; then
  reel Quinteto-Vertical $O/00_equipo_reel.mp4
  npx remotion still Quinteto-Vertical assets/work/ig/equipo.png --frame=850 --image-format=png 2>&1 | grep -E "rror"
  foto assets/work/ig/equipo.png $O/00_equipo_foto.jpg 40
fi
ls -la $O
echo IG_DONE
