#!/bin/bash
# Videos de prueba de una presentación suelta (calidad completa) + previews del video completo.
cd "$(dirname "$0")/.." || exit 1
r() { npx remotion render "$1" "$2" --props="$3" --crf=20 --concurrency=4 2>&1 | grep -E "Encoded 105/105|rror"; }
r Presentacion-Vertical previews/prueba_felipe_arias_9x16.mp4 '{"pid":"p2","logo":"plata"}'
r Presentacion-Horizontal previews/prueba_felipe_arias_16x9.mp4 '{"pid":"p2","logo":"plata"}'
r Presentacion-Vertical previews/prueba_benjamin_figueroa_9x16.mp4 '{"pid":"p3","logo":"plata"}'
scripts/render_previews.sh
echo PRUEBAS_DONE
