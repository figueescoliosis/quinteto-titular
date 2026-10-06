#!/usr/bin/env python3
"""Recorte con BiRefNet (lite, ONNX CPU) cuadro a cuadro. Reemplaza a RVM, que en el paso perdía
partes de las piernas (zapato flotando, pie semitransparente) y arrastraba la sombra del piso.
- Entrada: assets/work/norm/pN.mp4 (1080x1920). Salida: assets/work/alpha_png/pN/NNNN.png (RGBA con
  los colores del cuadro; cleanup.py luego descontamina los bordes).
- Suavizado temporal leve (1-2-1) solo donde el alpha casi no cambia entre cuadros vecinos, para que
  el borde no tiemble sin emborronar lo que se mueve.
- Cada alpha crudo se guarda en assets/work/birefnet/pN/: si la VM se reinicia, retoma donde quedó.
Uso: matte_birefnet.py p1 [p2 ...]
Modelo: assets/work/modelos_ia/birefnet_lite.onnx (huggingface.co/onnx-community/BiRefNet_lite-ONNX, MIT)."""
import sys, time
from pathlib import Path
import numpy as np, cv2, onnxruntime as ort

ROOT = Path(__file__).resolve().parent.parent
so = ort.SessionOptions(); so.intra_op_num_threads = 4
ses = ort.InferenceSession(str(ROOT / "assets/work/modelos_ia/birefnet_lite.onnx"), so, providers=["CPUExecutionProvider"])
MEAN, STD = np.array([0.485, 0.456, 0.406], np.float32), np.array([0.229, 0.224, 0.225], np.float32)

def alpha(f):
    x = cv2.resize(f, (1024, 1024), interpolation=cv2.INTER_AREA)[:, :, ::-1].astype(np.float32) / 255
    x = ((x - MEAN) / STD).transpose(2, 0, 1)[None].astype(np.float32)
    y = ses.run(None, {"input_image": x})[0][0, 0]
    if y.min() < 0 or y.max() > 1: y = 1 / (1 + np.exp(-y))
    return cv2.resize(y, (f.shape[1], f.shape[0]), interpolation=cv2.INTER_CUBIC).clip(0, 1)

for pid in sys.argv[1:]:
    cap = cv2.VideoCapture(str(ROOT / "assets/work/norm" / f"{pid}.mp4"))
    frames = []
    while True:
        ok, f = cap.read()
        if not ok: break
        frames.append(f)
    cache = ROOT / "assets/work/birefnet" / pid; cache.mkdir(parents=True, exist_ok=True)
    t0 = time.time(); As = []
    for i, f in enumerate(frames):
        c = cache / f"{i:04d}.png"
        if c.exists():
            As.append(cv2.imread(str(c), 0).astype(np.float32) / 255); continue
        a = alpha(f); As.append(a)
        cv2.imwrite(str(c), (a * 255 + 0.5).astype(np.uint8))
        print(f"{pid} {i + 1}/{len(frames)} {time.time() - t0:.0f}s", flush=True)
    dst = ROOT / "assets/work/alpha_png" / pid; dst.mkdir(parents=True, exist_ok=True)
    for g in dst.glob("*.png"): g.unlink()
    n = len(As)
    for i, f in enumerate(frames):
        a, p, q = As[i], As[max(0, i - 1)], As[min(n - 1, i + 1)]
        quieto = (np.abs(p - q) < 0.15) & (np.abs(a - p) < 0.15)
        a = np.where(quieto, 0.25 * p + 0.5 * a + 0.25 * q, a)
        cv2.imwrite(str(dst / f"{i:04d}.png"), np.dstack([f, (a * 255 + 0.5).astype(np.uint8)]), [cv2.IMWRITE_PNG_COMPRESSION, 1])
    print(f"{pid} listo: {n} frames en {time.time() - t0:.0f}s", flush=True)
