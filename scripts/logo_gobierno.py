#!/usr/bin/env python3
"""Logo de esquina de El Victor (p6, "jugador a honorarios"): assets/raw/logo_gobierno_original.png
(círculo sobre fondo blanco) -> public/brand/gobierno.png con transparencia fuera del círculo.
- Círculo = todo lo que no es el blanco de afuera (el blanco conectado al borde; el escudo y el texto
  blancos de adentro no cuentan). Centro = centroide, radio = sqrt(área/pi).
- Borde antialiasado y 1,5 px hacia adentro para que no quede filo blanco. Salida 512x512."""
from pathlib import Path
import numpy as np, cv2

ROOT = Path(__file__).resolve().parent.parent
im = cv2.imread(str(ROOT / "assets/raw/logo_gobierno_original.png"), cv2.IMREAD_COLOR)
blanco = (np.abs(im.astype(np.int16) - 255).max(2) <= 40).astype(np.uint8)
n, lab = cv2.connectedComponents(blanco, connectivity=4)
borde = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
circulo = ~np.isin(lab, list(borde))
ys, xs = np.nonzero(circulo)
cy, cx, r = ys.mean(), xs.mean(), np.sqrt(circulo.sum() / np.pi)
yy, xx = np.mgrid[:im.shape[0], :im.shape[1]]
alpha = np.clip(r - 1.5 - np.hypot(yy - cy, xx - cx) + 0.5, 0, 1)
x0, y0, lado = int(round(cx - r)), int(round(cy - r)), int(round(2 * r))
rgba = np.dstack([im, (alpha * 255).astype(np.uint8)])[y0:y0 + lado, x0:x0 + lado]
rgba = cv2.resize(rgba, (512, 512), interpolation=cv2.INTER_AREA)
out = ROOT / "public/brand/gobierno.png"
cv2.imwrite(str(out), rgba)
print(f"centro ({cx:.0f},{cy:.0f}) radio {r:.0f} -> {out.relative_to(ROOT)} 512x512")
