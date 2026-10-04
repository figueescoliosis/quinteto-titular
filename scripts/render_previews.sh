#!/bin/bash
# Fase 4: previews de ambas composiciones a media escala.
cd "$(dirname "$0")/.." || exit 1
for c in Vertical Horizontal; do
  npx remotion render Quinteto-$c previews/f4_quinteto_$c.mp4 --scale=0.5 --crf=28 --concurrency=4 2>&1 | grep -E "Encoded 900|rror" 
done
echo PREVIEWS_DONE
