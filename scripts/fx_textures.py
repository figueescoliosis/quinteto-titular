#!/usr/bin/env python3
"""Texturas precalculadas (la VM no tiene GPU): grano fino y humo tenue. Determinístico (seed fija)."""
import numpy as np, cv2
rng = np.random.default_rng(7)
# grano: ruido gris centrado en 128, tile 512
g = np.clip(rng.normal(128, 38, (512, 512)), 0, 255).astype(np.uint8)
cv2.imwrite("public/fx/grano.png", g)
# humo: ruido fractal suave, blanco con alpha; más denso abajo, tileable en x
h, w = 700, 2048
acc = np.zeros((h, w), np.float32)
for octave, amp in [(256, 1.0), (128, .55), (64, .3), (32, .15)]:
    n = rng.random((h // octave + 3, w // octave + 3)).astype(np.float32)
    n[:, -3:] = n[:, :3]  # repetir bordes para que haga tile en x
    up = cv2.resize(n, ((w // octave + 3) * octave, (h // octave + 3) * octave), interpolation=cv2.INTER_CUBIC)
    acc += amp * up[:h, :w]
acc = (acc - acc.min()) / (acc.max() - acc.min())
acc = np.clip((acc - 0.35) / 0.65, 0, 1) ** 1.6
fall = np.linspace(0, 1, h, dtype=np.float32)[:, None] ** 1.3  # 0 arriba, 1 abajo
alpha = (acc * fall * 255).astype(np.uint8)
alpha = cv2.GaussianBlur(alpha, (0, 0), 6)
cv2.imwrite("public/fx/humo.png", np.dstack([np.full((h, w, 3), 255, np.uint8), alpha]))
print("ok")
