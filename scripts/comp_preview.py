#!/usr/bin/env python3
"""Compone PNG RGBA sobre un color plano. Uso: comp_preview.py salida.jpg alto color_hex png1 [png2 ...]
Las imágenes se ponen lado a lado, escaladas al alto indicado."""
import sys
import numpy as np, cv2
out, h, col, files = sys.argv[1], int(sys.argv[2]), sys.argv[3], sys.argv[4:]
c = np.array([int(col[i:i + 2], 16) for i in (4, 2, 0)], np.float32)  # BGR
tiles = []
for f in files:
    im = cv2.imread(f, cv2.IMREAD_UNCHANGED).astype(np.float32)
    a = im[:, :, 3:4] / 255
    comp = im[:, :, :3] * a + c * (1 - a)
    w = round(comp.shape[1] * h / comp.shape[0])
    tiles.append(cv2.resize(comp, (w, h), interpolation=cv2.INTER_AREA))
cv2.imwrite(out, np.hstack(tiles).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 88])
