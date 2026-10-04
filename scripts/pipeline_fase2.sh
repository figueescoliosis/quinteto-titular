#!/bin/bash
# Fase 2 completa: normalizar -> recortar (RVM) -> limpiar -> codificar webm + previews.
cd "$(dirname "$0")/.." || exit 1
.venv/bin/python scripts/normalize.py || exit 1
scripts/matte_all.sh || exit 1
for spec in "p1 27" "p2 15" "p3 15" "p4 15" "p5 27"; do .venv/bin/python scripts/cleanup.py $spec || exit 1; done
scripts/encode_alpha.sh
