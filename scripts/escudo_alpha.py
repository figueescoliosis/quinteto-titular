#!/usr/bin/env python3
"""Quita el fondo gris claro del logo (assets/raw/escudo_original.jpg) -> public/brand/escudo.png.
Relleno desde los bordes + alpha suave por distancia de color en el contorno + des-mezcla del fondo."""
import numpy as np, cv2
im = cv2.imread("assets/raw/escudo_original.jpg").astype(np.float32)
h, w = im.shape[:2]
bg = np.median(np.concatenate([im[0], im[-1], im[:, 0], im[:, -1]]), 0)
dist = np.linalg.norm(im - bg, axis=2)
# región de fondo conectada a los bordes (tolerancia generosa)
cand = (dist < 40).astype(np.uint8)
n, lab = cv2.connectedComponents(cand, connectivity=4)
border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
bgmask = np.isin(lab, list(border))
# alpha: 0 en fondo puro, rampa por distancia de color dentro de la región de fondo
a = np.ones((h, w), np.float32)
a[bgmask] = np.clip((dist[bgmask] - 8) / 32, 0, 1)
a = cv2.GaussianBlur(a, (0, 0), 0.6)
a[~cv2.dilate(bgmask.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool)] = 1
# des-mezcla: C = a*F + (1-a)*bg  ->  F = (C - (1-a)*bg)/a
F = (im - (1 - a[..., None]) * bg) / np.maximum(a[..., None], 1e-3)
out = np.dstack([F.clip(0, 255), a[..., None] * 255]).astype(np.uint8)
ys, xs = np.where(a > 0.02)
pad = 8
out = out[max(0, ys.min() - pad):ys.max() + pad, max(0, xs.min() - pad):xs.max() + pad]
cv2.imwrite("public/brand/escudo.png", out)
print("escudo", out.shape)
