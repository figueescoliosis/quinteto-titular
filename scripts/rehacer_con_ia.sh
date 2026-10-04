#!/bin/bash
# Rehace un clip con mejora IA y lo pasa por el pipeline de recorte. Uso: rehacer_con_ia.sh pN ratio k_apertura
cd "$(dirname "$0")/.." || exit 1
pid=$1; ratio=${2:-0.4}; k=${3:-15}
scripts/bajar_modelos_ia.sh > /dev/null || exit 1
.venv/bin/python scripts/mejorar.py $pid || exit 1
.venv/bin/python scripts/matte.py $pid $ratio || exit 1
.venv/bin/python scripts/cleanup.py $pid $k || exit 1
.venv/bin/python scripts/encuadre.py > /dev/null || exit 1
scripts/encode_alpha.sh $pid > /dev/null || exit 1
echo "REHECHO $pid"
