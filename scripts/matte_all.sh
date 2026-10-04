#!/bin/bash
# Recorta los 5 clips en orden. downsample_ratio: 0,4 cuerpo entero/casi entero, 0,25 plano americano.
cd "$(dirname "$0")/.." || exit 1
for spec in "p1 0.4" "p2 0.25" "p3 0.4" "p4 0.25" "p5 0.4"; do
  .venv/bin/python scripts/matte.py $spec || exit 1
done
echo MATTE_DONE
