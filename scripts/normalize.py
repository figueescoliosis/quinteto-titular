#!/usr/bin/env python3
"""Fase 2.1-2.2: corta cada clip según team.json, lo deja a 30 fps constantes,
1080x1920 (lanczos), sin audio, e iguala levemente exposición y balance de blancos.

Referencia para igualar: la franja superior del cuadro (la pared de madera del barril),
que es la misma superficie en los 5 clips. Las ganancias se aplican al 50 % para que sea leve.
Salida: assets/work/norm/pN.mp4 (y pN_raw.mp4 sin igualar).
Uso: normalize.py            -> los 5, mide y guarda ganancias en scripts/ganancias.json
     normalize.py p3 [p5..]  -> solo esos, con las ganancias guardadas (los demás no cambian)."""
import json, subprocess, sys
from pathlib import Path
import numpy as np, cv2

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets/work/norm"; OUT.mkdir(parents=True, exist_ok=True)
team = json.loads((ROOT / "src/data/team.json").read_text())
STRENGTH = 0.5

def ff(*args):
    subprocess.run(["ffmpeg", "-v", "error", "-y", *args], check=True)

SOLO = sys.argv[1:]
JUG = [j for j in team["jugadores"] if not SOLO or j["id"] in SOLO]

# 1) corte + normalización
for j in JUG:
    a, b = j["corte"]
    ff("-ss", f"{a}", "-i", str(ROOT / "assets/raw" / j["clip"]), "-t", f"{b - a:.3f}",
       "-vf", "fps=30,scale=1080:1920:flags=lanczos,setsar=1", "-an",
       "-c:v", "libx264", "-crf", "12", "-preset", "slow", "-pix_fmt", "yuv420p",
       str(OUT / f"{j['id']}_raw.mp4"))

def igualar(pid, g):
    expr = lambda gain: (f"255*pow(min(1,pow(((val/255)+0.055)/1.055,2.4)*{gain:.4f}),1/2.4)")
    ff("-i", str(OUT / f"{pid}_raw.mp4"),
       "-vf", f"lutrgb=r='{expr(g[0])}':g='{expr(g[1])}':b='{expr(g[2])}'",
       "-c:v", "libx264", "-crf", "12", "-preset", "slow", "-pix_fmt", "yuv420p",
       str(OUT / f"{pid}.mp4"))

GAN = ROOT / "scripts/ganancias.json"
if SOLO:
    gs = json.loads(GAN.read_text())
    for j in JUG:
        igualar(j["id"], gs[j["id"]])
    print("reprocesados", SOLO)
    sys.exit(0)

# 2) estadística de la pared (franja 5-35 % de alto) en espacio lineal
def lin(x): return np.where(x <= 0.04045, x / 12.92, ((x + 0.055) / 1.055) ** 2.4)
stats = {}
for j in team["jugadores"]:
    cap = cv2.VideoCapture(str(OUT / f"{j['id']}_raw.mp4")); acc = []
    while True:
        ok, fr = cap.read()
        if not ok: break
        h = fr.shape[0]
        reg = fr[int(h * .05):int(h * .35), ::4][:, :, ::-1].astype(np.float32) / 255
        acc.append(lin(reg).reshape(-1, 3).mean(0))
    stats[j["id"]] = np.mean(acc, 0)
ref = np.exp(np.mean([np.log(v) for v in stats.values()], 0))  # media geométrica
report = {}
for j in team["jugadores"]:
    pid = j["id"]; g = (ref / stats[pid]) ** STRENGTH  # ganancia lineal por canal
    report[pid] = [round(float(x), 3) for x in g]
    igualar(pid, g)
GAN.write_text(json.dumps({"_nota": "Ganancias RGB lineales de la igualación (Fase 2).", **report}, indent=1) + "\n")
print(json.dumps({"pared_lineal": {k: [round(float(x), 4) for x in v] for k, v in stats.items()},
                  "ganancias": report}, indent=1))
