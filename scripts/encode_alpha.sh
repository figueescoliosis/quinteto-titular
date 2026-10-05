#!/bin/bash
# Fase 2.5-2.6: PNG RGBA -> public/alpha/pN.webm (VP9 + alpha, yuva420p) y pN_final.png,
# más previews: paso_frame sobre magenta y azul noche, y MP4 de 540 px con los 5 seguidos.
cd "$(dirname "$0")/.." || exit 1
mkdir -p public/alpha previews assets/work/prev
NOCHE=06102B
for pid in ${@:-p1 p2 p3 p4 p5}; do
  d=assets/work/alpha_clean/$pid
  ffmpeg -v error -y -framerate 30 -i $d/%04d.png -c:v libvpx-vp9 -pix_fmt yuva420p \
    -b:v 0 -crf ${CRF:-26} -row-mt 1 -deadline good -cpu-used 2 -auto-alt-ref 0 public/alpha/$pid.webm || exit 1
  cp "$(ls $d/*.png | tail -1)" public/alpha/${pid}_final.png
  pf=$(python3 -c "import json;print([j for j in json.load(open('src/data/team.json'))['jugadores'] if j['id']=='$pid'][0]['paso_frame'])")
  f=$(printf "%s/%04d.png" $d $pf)
  .venv/bin/python scripts/comp_preview.py previews/f2_${pid}_magenta.jpg 960 FF00FF $f
  .venv/bin/python scripts/comp_preview.py previews/f2_${pid}_noche.jpg 960 $NOCHE $f
  # tramo sobre azul noche, 540 px de alto, desde el webm (verifica que el alpha sobrevive)
  ffmpeg -v error -y -f lavfi -i color=c=0x$NOCHE:s=1080x1920:r=30 -c:v libvpx-vp9 -i public/alpha/$pid.webm \
    -filter_complex "[0][1]overlay=shortest=1,scale=-2:540" -c:v libx264 -crf 23 -pix_fmt yuv420p assets/work/prev/$pid.mp4 || exit 1
done
printf "file '%s'\n" $(for p in p1 p2 p3 p4 p5; do echo "$PWD/assets/work/prev/$p.mp4"; done) > assets/work/prev/list.txt
ffmpeg -v error -y -f concat -safe 0 -i assets/work/prev/list.txt -c copy previews/f2_recortes_noche.mp4
ls -la public/alpha previews | grep -v "^total"
