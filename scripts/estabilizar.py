#!/usr/bin/env python3
"""Estabiliza un recorte grabado con la cámara en la mano (p. ej. p6, Victor).
Sobre el fondo fijo del video, el movimiento de la cámara se ve como si la persona flotara. En el tramo
quieto (brazos cruzados) se fija la cabeza en su posición del último cuadro, que es la que usa el
encuadre (src/data/encuadre.json) y la del cuadro congelado. La entrada caminando no se toca: el ajuste
entra de a poco en unos cuadros alrededor de `desde`.
- Cabeza por cuadro: coronilla (primera fila con alpha) y centro de la silueta 60 px más abajo.
- Trayectoria suavizada (gaussiana) para no meter el ruido de la medición.
- Solo traslación. Los originales quedan en assets/work/alpha_clean_sinestab/pN.
Uso: estabilizar.py pN desde [--medir]"""
import sys, shutil
from pathlib import Path
import numpy as np, cv2

ROOT = Path(__file__).resolve().parent.parent
pid, desde = sys.argv[1], int(sys.argv[2])
medir = "--medir" in sys.argv
src = ROOT / "assets/work/alpha_clean" / pid
fs = sorted(src.glob("*.png"))

def cabeza(a):
    ys = np.where((a > 127).any(1))[0]
    top = int(ys.min())
    row = np.where(a[min(top + 60, a.shape[0] - 1)] > 127)[0]
    return np.array([(row.min() + row.max()) / 2, top], np.float64)

P = np.array([cabeza(cv2.imread(str(f), cv2.IMREAD_UNCHANGED)[:, :, 3]) for f in fs])
n = len(P)
k = np.exp(-0.5 * (np.arange(-9, 10) / 3.0) ** 2); k /= k.sum()
S = np.stack([np.convolve(np.pad(P[:, i], 9, mode="edge"), k, mode="valid") for i in range(2)], 1)
fin = P[-1]
hold = S[desde:]
print(f"{pid}: {n} cuadros. Tramo quieto desde {desde}: deriva de la cabeza x {np.ptp(hold[:, 0]):.0f} px, "
      f"y {np.ptp(hold[:, 1]):.0f} px (el ancho de cabeza ronda 170 px)")
if medir:
    for i in range(0, n, 4):
        print(f"  {i:3d}  cx {P[i, 0]:6.0f}  top {P[i, 1]:6.0f}")
    sys.exit(0)

back = ROOT / "assets/work/alpha_clean_sinestab" / pid
if not back.exists():
    shutil.copytree(src, back)
fs_src = sorted(back.glob("*.png"))
for i, f in enumerate(fs_src):
    w = float(np.clip((i - (desde - 8)) / 12, 0, 1))  # entra de a poco alrededor de `desde`
    d = (fin - S[i]) * w
    im = cv2.imread(str(f), cv2.IMREAD_UNCHANGED)
    if abs(d[0]) > 0.25 or abs(d[1]) > 0.25:
        M = np.float32([[1, 0, d[0]], [0, 1, d[1]]])
        im = cv2.warpAffine(im, M, (im.shape[1], im.shape[0]), flags=cv2.INTER_LINEAR,
                            borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))
    cv2.imwrite(str(src / f.name), im)
print(f"{pid}: estabilizado desde el cuadro {desde} (originales en {back.relative_to(ROOT)})")
