#!/usr/bin/env python3
"""Mejora con IA de un clip (antes del recorte): super-resolución Real-ESRGAN x2 sobre la zona de la
persona + restauración de rostro GFPGAN 1.4 (alineado con YOLOface, mezclado parcialmente para no
cambiar la cara). Parte del video original (720p de WhatsApp), según el corte de team.json.

Uso: mejorar.py pN [--frames N] [--prueba]
  Escribe assets/work/norm/pN_raw.mp4 (1080x1920, 30 fps) y pN.mp4 (con la ganancia de color de
  scripts/ganancias.json). Con --prueba solo procesa un frame y guarda una comparación en assets/work/ia/.
Modelos: scripts/bajar_modelos_ia.sh -> assets/work/modelos_ia/"""
import json, subprocess, sys, time
from pathlib import Path
import numpy as np, cv2, onnxruntime as ort

ROOT = Path(__file__).resolve().parent.parent
M = ROOT / "assets/work/modelos_ia"
pid = sys.argv[1]
PRUEBA = "--prueba" in sys.argv
MEZCLA_ROSTRO = 0.7  # cuánto de GFPGAN entra en la cara (1 = todo)

team = json.loads((ROOT / "src/data/team.json").read_text())
j = next(x for x in team["jugadores"] if x["id"] == pid)
a, b = j["corte"]
enc = json.loads((ROOT / "src/data/encuadre.json").read_text())[pid]

so = ort.SessionOptions(); so.intra_op_num_threads = 4
P = ["CPUExecutionProvider"]
esr = ort.InferenceSession(str(M / "real_esrgan_x2.onnx"), so, providers=P)
gfp = ort.InferenceSession(str(M / "gfpgan_1.4.onnx"), so, providers=P)
yolo = ort.InferenceSession(str(M / "yoloface_8n.onnx"), so, providers=P)

# Plantilla FFHQ 512 (5 puntos: ojos, nariz, comisuras) usada por GFPGAN.
FFHQ = np.array([[0.37691676, 0.46864664], [0.62285697, 0.46912813], [0.50123859, 0.61331904],
                 [0.39308822, 0.72541100], [0.61150205, 0.72490465]], np.float32) * 512

def leer_frames():
    W, H = 720, 1280
    cmd = ["ffmpeg", "-v", "error", "-ss", f"{a}", "-i", str(ROOT / "assets/raw" / j["clip"]),
           "-t", f"{b - a:.3f}", "-vf", "fps=30", "-f", "rawvideo", "-pix_fmt", "bgr24", "-"]
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)

def esrgan(img):
    x = img[:, :, ::-1].astype(np.float32).transpose(2, 0, 1)[None] / 255
    y = esr.run(None, {"input": x})[0][0].transpose(1, 2, 0)
    return (y[:, :, ::-1].clip(0, 1) * 255 + 0.5).astype(np.uint8)

def detectar(img):
    h, w = img.shape[:2]; s = 640 / max(h, w)
    lb = np.zeros((640, 640, 3), np.uint8)
    lb[:round(h * s), :round(w * s)] = cv2.resize(img, (round(w * s), round(h * s)), interpolation=cv2.INTER_AREA)
    x = lb[:, :, ::-1].astype(np.float32).transpose(2, 0, 1)[None] / 255
    o = yolo.run(None, {"input": x})[0][0].T  # (8400, 20)
    i = int(np.argmax(o[:, 4]))
    if o[i, 4] < 0.4:
        return None
    return o[i, 5:].reshape(5, 3)[:, :2] / s

def restaurar(img, kps):
    Mt, _ = cv2.estimateAffinePartial2D(kps, FFHQ, method=cv2.LMEDS)
    crop = cv2.warpAffine(img, Mt, (512, 512), flags=cv2.INTER_AREA, borderMode=cv2.BORDER_REPLICATE)
    x = ((crop[:, :, ::-1].astype(np.float32) / 255 - 0.5) / 0.5).transpose(2, 0, 1)[None]
    y = gfp.run(None, {"input": x})[0][0].transpose(1, 2, 0).clip(-1, 1)
    out = ((y + 1) / 2 * 255)[:, :, ::-1]
    mask = np.zeros((512, 512), np.float32); mask[40:-40, 40:-40] = 1
    mask = cv2.GaussianBlur(mask, (0, 0), 18)
    Mi = cv2.invertAffineTransform(Mt)
    h, w = img.shape[:2]
    back = cv2.warpAffine(out.astype(np.float32), Mi, (w, h), flags=cv2.INTER_LINEAR)
    m = cv2.warpAffine(mask, Mi, (w, h))[..., None] * MEZCLA_ROSTRO
    return (img * (1 - m) + back * m).clip(0, 255).astype(np.uint8)

def procesar(frame, kps_prev):
    # zona de la persona (caja de todo el clip, en coords 720p) + margen
    u = enc["union"]; s = 1 / 1.5
    x0, y0 = max(0, int(u[0] * s) - 40), max(0, int(u[1] * s) - 40)
    x1, y1 = min(720, int(u[2] * s) + 40), min(1280, int(u[3] * s) + 40)
    x1 -= (x1 - x0) % 2; y1 -= (y1 - y0) % 2  # Real-ESRGAN x2 exige lados pares
    big = cv2.resize(frame, (1440, 2560), interpolation=cv2.INTER_LANCZOS4)
    sr = esrgan(frame[y0:y1, x0:x1])
    # pega con borde suave sobre la base lanczos
    fm = np.ones(sr.shape[:2], np.float32)
    fm = cv2.GaussianBlur(cv2.copyMakeBorder(fm[12:-12, 12:-12], 12, 12, 12, 12, cv2.BORDER_CONSTANT, value=0), (0, 0), 6)[..., None]
    zona = big[y0 * 2:y1 * 2, x0 * 2:x1 * 2].astype(np.float32)
    big[y0 * 2:y1 * 2, x0 * 2:x1 * 2] = (sr * fm + zona * (1 - fm)).astype(np.uint8)
    kps = detectar(big)
    if kps is not None and kps_prev is not None:
        kps = 0.5 * kps + 0.5 * kps_prev  # suaviza el temblor de los puntos entre frames
    if kps is not None:
        big = restaurar(big, kps)
    return cv2.resize(big, (1080, 1920), interpolation=cv2.INTER_AREA), kps

frames = leer_frames()
if "--frames" in sys.argv:
    frames = frames[: int(sys.argv[sys.argv.index("--frames") + 1])]

if PRUEBA:
    out = ROOT / "assets/work/ia"; out.mkdir(parents=True, exist_ok=True)
    f = frames[len(frames) - 1]
    t0 = time.time(); mej, _ = procesar(f, None); dt = time.time() - t0
    base = cv2.resize(f, (1080, 1920), interpolation=cv2.INTER_LANCZOS4)
    cv2.imwrite(str(out / f"{pid}_antes.png"), base); cv2.imwrite(str(out / f"{pid}_despues.png"), mej)
    print(f"{pid} prueba: {dt:.1f} s por frame")
    sys.exit(0)

norm = ROOT / "assets/work/norm"
enc_cmd = ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", "1080x1920", "-r", "30",
           "-i", "-", "-c:v", "libx264", "-crf", "10", "-preset", "slow", "-pix_fmt", "yuv420p", str(norm / f"{pid}_raw.mp4")]
proc = subprocess.Popen(enc_cmd, stdin=subprocess.PIPE)
t0 = time.time(); kps = None
for i, f in enumerate(frames):
    mej, kps = procesar(f, kps)
    proc.stdin.write(mej.tobytes())
    print(f"{pid} frame {i + 1}/{len(frames)} {time.time() - t0:.0f}s", flush=True)
proc.stdin.close(); proc.wait()

g = json.loads((ROOT / "scripts/ganancias.json").read_text())[pid]
expr = lambda gain: f"255*pow(min(1,pow(((val/255)+0.055)/1.055,2.4)*{gain:.4f}),1/2.4)"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(norm / f"{pid}_raw.mp4"),
                "-vf", f"lutrgb=r='{expr(g[0])}':g='{expr(g[1])}':b='{expr(g[2])}'",
                "-c:v", "libx264", "-crf", "12", "-preset", "slow", "-pix_fmt", "yuv420p", str(norm / f"{pid}.mp4")], check=True)
print(f"{pid} listo: {len(frames)} frames en {time.time() - t0:.0f} s")
