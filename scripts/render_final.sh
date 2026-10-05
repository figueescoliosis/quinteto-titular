#!/bin/bash
# Fase 5: render final H.264 de ambas composiciones + portadas. Log en assets/work/render_final.log
cd "$(dirname "$0")/.." || exit 1
npm run check --silent || exit 1
mkdir -p out
npx remotion render Quinteto-Vertical out/quinteto_9x16.mp4 --crf=18 --concurrency=4 2>&1 | grep -E "Encoded 900|rror" || exit 1
npx remotion render Quinteto-Horizontal out/quinteto_16x9.mp4 --crf=18 --concurrency=4 2>&1 | grep -E "Encoded 900|rror" || exit 1
npx remotion still Quinteto-Vertical out/portada_9x16.png --frame=850 --image-format=png 2>&1 | grep -E "rror"
npx remotion still Quinteto-Horizontal out/portada_16x9.png --frame=850 --image-format=png 2>&1 | grep -E "rror"
ls -la out
echo RENDER_FINAL_DONE
