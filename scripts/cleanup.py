#!/usr/bin/env python3
"""Fase 2.4: limpieza del alpha de RVM.
- Quita restos finos fuera de la silueta (rendijas oscuras del barril junto a la cabeza):
  apertura morfológica + componente más grande, y se multiplica el alpha por esa máscara suave.
- Halo de 1 px: erosión de 1 px y feather suave.
- Contaminación de color en bordes (madera): el color del borde se lleva hacia el del interior.
Uso: cleanup.py pN [k_apertura=15]  (lee assets/work/alpha_png/pN, escribe assets/work/alpha_clean/pN)"""
import sys
from pathlib import Path
import numpy as np, cv2

ROOT = Path(__file__).resolve().parent.parent
pid = sys.argv[1]
src = ROOT / "assets/work/alpha_png" / pid
dst = ROOT / "assets/work/alpha_clean" / pid
dst.mkdir(parents=True, exist_ok=True)
for f in dst.glob("*.png"): f.unlink()
KO = int(sys.argv[2]) if len(sys.argv) > 2 else 15
K_OPEN = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (KO, KO))
K3 = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))

for f in sorted(src.glob("*.png")):
    im = cv2.imread(str(f), cv2.IMREAD_UNCHANGED)
    rgb = im[:, :, :3].astype(np.float32)
    a = im[:, :, 3].astype(np.float32) / 255

    # 1) silueta robusta: umbral, apertura, componente más grande
    hard = (a > 0.5).astype(np.uint8)
    opened = cv2.morphologyEx(hard, cv2.MORPH_OPEN, K_OPEN)
    n, lab, st, _ = cv2.connectedComponentsWithStats(opened, 8)
    if n > 1:
        opened = (lab == 1 + np.argmax(st[1:, cv2.CC_STAT_AREA])).astype(np.uint8)
    keep = cv2.GaussianBlur(cv2.dilate(opened, K3, iterations=2).astype(np.float32), (0, 0), 1.5)
    a = a * np.clip(keep, 0, 1)

    # 2) halo: erosión de 1 px + feather suave; corta residuos muy tenues
    a = cv2.erode(a, K3)
    a = cv2.GaussianBlur(a, (0, 0), 0.7)
    a = np.clip((a - 0.04) / 0.96, 0, 1)

    # 3) descontaminación: color interior promediado hacia el borde
    inner = cv2.erode((a > 0.97).astype(np.float32), K3, iterations=2)
    w = cv2.GaussianBlur(inner, (0, 0), 6)
    fill = cv2.GaussianBlur(rgb * inner[..., None], (0, 0), 6) / np.maximum(w, 1e-4)[..., None]
    mix = np.clip((1 - a) * 1.5, 0, 1)[..., None] * (w > 1e-3)[..., None]
    edge = (a < 0.97)[..., None]
    rgb = np.where(edge, rgb * (1 - mix) + fill * mix, rgb)

    out = np.dstack([rgb.clip(0, 255), a[..., None] * 255]).astype(np.uint8)
    cv2.imwrite(str(dst / f.name), out, [cv2.IMWRITE_PNG_COMPRESSION, 1])
print(pid, "ok")
