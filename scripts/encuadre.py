#!/usr/bin/env python3
"""Mide la caja de cada recorte (alpha>0.5) en coordenadas del clip normalizado 1080x1920:
unión de todo el clip y caja del último frame. Escribe src/data/encuadre.json."""
import json
from pathlib import Path
import numpy as np, cv2
ROOT = Path(__file__).resolve().parent.parent
res = {}
for pid in ["p1", "p2", "p3", "p4", "p5"]:
    fs = sorted((ROOT / "assets/work/alpha_clean" / pid).glob("*.png"))
    boxes = []
    for f in fs:
        a = cv2.imread(str(f), cv2.IMREAD_UNCHANGED)[:, :, 3]
        ys, xs = np.where(a > 127)
        boxes.append([int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())])
    b = np.array(boxes)
    last = boxes[-1]
    # ancho de cabeza en el último frame: ancho de la silueta 60 px bajo la coronilla
    a = cv2.imread(str(fs[-1]), cv2.IMREAD_UNCHANGED)[:, :, 3]
    row = np.where(a[last[1] + 60] > 127)[0]
    res[pid] = {"frames": len(fs), "union": [int(b[:, 0].min()), int(b[:, 1].min()), int(b[:, 2].max()), int(b[:, 3].max())],
                "final": last, "cabeza_cx": int((row.min() + row.max()) / 2), "cabeza_ancho": int(row.max() - row.min())}
(ROOT / "src/data/encuadre.json").write_text(json.dumps(res, indent=1) + "\n")
print(json.dumps(res))
