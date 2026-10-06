#!/bin/bash
# Rehace los recortes de los 5 con BiRefNet (reemplazo de RVM) y vuelve a renderizar todo.
# Log en assets/work/rehacer_recortes.log. Requiere assets/work/norm/pN.mp4 y el modelo birefnet_lite.onnx.
cd "$(dirname "$0")/.." || exit 1
.venv/bin/python scripts/matte_birefnet.py p1 p2 p3 p4 p5 || exit 1
for p in p1 p2 p3 p4 p5; do .venv/bin/python scripts/cleanup.py $p 9 || exit 1; done
scripts/encode_alpha.sh p1 p2 p4 p5 || exit 1
CRF=20 scripts/encode_alpha.sh p3 || exit 1
.venv/bin/python scripts/encuadre.py >/dev/null || exit 1
echo RECORTES_DONE
scripts/render_final.sh || exit 1
scripts/instagram.sh || exit 1
npx remotion render Presentacion-Vertical previews/prueba_benjamin_figueroa_9x16.mp4 --props='{"pid":"p3","logo":"plata"}' --crf=20 --concurrency=4 2>&1 | grep -E "Encoded 105/105|rror"
echo TODO_DONE
