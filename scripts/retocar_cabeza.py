#!/usr/bin/env python3
"""Retoque del recorte alrededor de la cabeza, para clips con fondo cargado detrás de la cara
(p6, Victor: pared clara, ropa colgada y un perro de ropa rojo). Corre después de cleanup.py.
- Pared pegada a la cara: al girar la cabeza, BiRefNet a veces pega a la frente o la mejilla un trozo
  de pared (una "visera"). Ahí RVM (assets/work/alpha_png_rvm) tiene bien el perfil de la cara. Se
  buscan las zonas donde BiRefNet ve persona y RVM no, en la franja de la cabeza, solo del lado hacia
  donde mira la cara y tocando el borde de la silueta; en esas zonas manda RVM. El moño y la nuca
  quedan del otro lado, y los huecos internos de RVM no tocan el borde, así que no se cortan.
- Rojo: el perro de ropa rojo que queda pegado al pelo. Píxeles rojos saturados en los 100 px de
  arriba de la cabeza (el pelo es oscuro y la oreja queda más abajo).
Edita assets/work/alpha_clean/pN en el lugar; los originales quedan en assets/work/alpha_clean_sinretoque/pN.
Uso: retocar_cabeza.py pN [der|izq]   (lado hacia donde mira la cara; por defecto der)"""
import sys, shutil
from pathlib import Path
import numpy as np, cv2

ROOT = Path(__file__).resolve().parent.parent
pid = sys.argv[1]
lado = sys.argv[2] if len(sys.argv) > 2 else "der"
dst = ROOT / "assets/work/alpha_clean" / pid
back = ROOT / "assets/work/alpha_clean_sinretoque" / pid
marca = dst / ".retocado"  # si cleanup.py volvió a correr, sus PNG son más nuevos: se respaldan de nuevo
if not marca.exists() or max(f.stat().st_mtime for f in dst.glob("*.png")) > marca.stat().st_mtime:
    shutil.rmtree(back, ignore_errors=True)
    shutil.copytree(dst, back, ignore=shutil.ignore_patterns(".retocado"))
rvm = ROOT / "assets/work/alpha_png_rvm" / pid
K3 = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
FRANJA, FRANJA_PELO = 330, 100  # px bajo la coronilla: cabeza completa / solo pelo
RVM_FONDO, AREA_MIN = 0.3, 30  # RVM bajo esto = fondo; zonas más chicas se ignoran

for f in sorted(back.glob("*.png")):
    im = cv2.imread(str(f), cv2.IMREAD_UNCHANGED)
    a = im[:, :, 3].astype(np.float32) / 255
    hard = a > 0.5
    top = int(np.where(hard.any(1))[0].min())
    xs = np.where(hard[top:top + FRANJA].any(0))[0]
    centro = (xs.min() + xs.max()) / 2
    zona = np.zeros(a.shape, bool); zona[max(0, top - 10):top + FRANJA] = True
    if lado == "der": zona[:, :int(centro)] = False
    else: zona[:, int(centro):] = False
    notas = []

    # 1) donde BiRefNet ve persona y RVM no, pegado al borde de la silueta: manda RVM
    ar = cv2.imread(str(rvm / f.name), cv2.IMREAD_UNCHANGED)[:, :, 3].astype(np.float32) / 255
    fondo = cv2.dilate((~hard).astype(np.uint8), K3) > 0
    n, lab, st, cen = cv2.connectedComponentsWithStats((hard & (ar < RVM_FONDO) & zona).astype(np.uint8), 8)
    rvm_manda = np.zeros(a.shape, bool)
    for k in range(1, n):
        m = lab == k
        if st[k, cv2.CC_STAT_AREA] >= AREA_MIN and (m & fondo).any():
            rvm_manda |= m
            notas.append(f"pared {st[k, cv2.CC_STAT_AREA]} px en ({int(cen[k][0])},{int(cen[k][1])})")
    if rvm_manda.any():  # con margen, para cubrir también el borde suave del trozo de pared
        w = cv2.GaussianBlur(cv2.dilate(rvm_manda.astype(np.uint8), K3, iterations=7).astype(np.float32), (0, 0), 2)
        a = a * (1 - w) + np.minimum(a, cv2.GaussianBlur(ar, (0, 0), 1.0)) * w

    # 2) rojo saturado pegado al pelo
    hsv = cv2.cvtColor(im[:, :, :3], cv2.COLOR_BGR2HSV)
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    pelo = np.zeros(a.shape, bool); pelo[max(0, top - 10):top + FRANJA_PELO] = True
    rojo = ((h <= 10) | (h >= 160)) & (s > 110) & (v > 70) & (a > 0.08) & pelo
    if rojo.sum() >= 5:
        quitar = cv2.dilate(rojo.astype(np.uint8), K3, iterations=8).astype(np.float32)
        a = a * (1 - cv2.GaussianBlur(quitar, (0, 0), 1.2))
        notas.append(f"rojo {int(rojo.sum())} px")

    if notas:
        # lo que haya quedado suelto se va (se conserva el componente más grande)
        n, lab, st, _ = cv2.connectedComponentsWithStats((a > 0.5).astype(np.uint8), 8)
        if n > 2:
            a = a * cv2.dilate((lab == 1 + np.argmax(st[1:, cv2.CC_STAT_AREA])).astype(np.uint8), K3, iterations=2)
        print(f"  {f.stem}: " + ", ".join(notas))
    im[:, :, 3] = (a * 255 + 0.5).clip(0, 255).astype(np.uint8)
    cv2.imwrite(str(dst / f.name), im, [cv2.IMWRITE_PNG_COMPRESSION, 1])
marca.touch()
print(pid, "retocado")
