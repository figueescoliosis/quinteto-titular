#!/usr/bin/env python3
"""Fase 2.3: recorte con RobustVideoMatting (ONNX Runtime, CPU).
Uso: matte.py pN downsample_ratio [carpeta_salida]
Lee assets/work/norm/pN.mp4 y escribe PNG RGBA (color de fgr + alpha de pha)."""
import sys, time
from pathlib import Path
import numpy as np, cv2, onnxruntime as ort

ROOT = Path(__file__).resolve().parent.parent
pid, ratio = sys.argv[1], float(sys.argv[2])
out = Path(sys.argv[3]) if len(sys.argv) > 3 else ROOT / "assets/work/alpha_png" / pid
out.mkdir(parents=True, exist_ok=True)
for f in out.glob("*.png"): f.unlink()

so = ort.SessionOptions(); so.intra_op_num_threads = 4
sess = ort.InferenceSession(str(ROOT / "models/rvm_mobilenetv3_fp32.onnx"), so,
                            providers=["CPUExecutionProvider"])
cap = cv2.VideoCapture(str(ROOT / "assets/work/norm" / f"{pid}.mp4"))
frames = []
while True:
    ok, fr = cap.read()
    if not ok: break
    frames.append(fr)

def run(frame, rec):
    src = frame[:, :, ::-1].astype(np.float32).transpose(2, 0, 1)[None] / 255.0
    fgr, pha, *rec = sess.run(None, {"src": src, "r1i": rec[0], "r2i": rec[1], "r3i": rec[2],
                                     "r4i": rec[3], "downsample_ratio": np.array([ratio], np.float32)})
    return fgr, pha, rec

# Estado recurrente en ceros [1,1,1,1]. Se "calienta" con los primeros frames y luego
# se procesa el clip completo en orden desde el frame 0 conservando ese estado.
rec = [np.zeros((1, 1, 1, 1), np.float32)] * 4
for fr in frames[:12]:
    _, _, rec = run(fr, rec)
t0 = time.time()
for i, fr in enumerate(frames):
    fgr, pha, rec = run(fr, rec)
    rgb = (fgr[0].transpose(1, 2, 0).clip(0, 1) * 255 + 0.5).astype(np.uint8)
    a = (pha[0, 0].clip(0, 1) * 255 + 0.5).astype(np.uint8)
    cv2.imwrite(str(out / f"{i:04d}.png"), np.dstack([rgb[:, :, ::-1], a]),
                [cv2.IMWRITE_PNG_COMPRESSION, 1])
dt = time.time() - t0
print(f"{pid} ratio={ratio} frames={len(frames)} total={dt:.1f}s por_frame={dt/len(frames):.2f}s")
