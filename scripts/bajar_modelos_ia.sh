#!/bin/bash
# Modelos de mejora de imagen (no van a git por tamaño). Fuente: huggingface.co/facefusion/models-3.0.0
#  - real_esrgan_x2.onnx : super-resolución x2 (Real-ESRGAN, BSD-3)
#  - gfpgan_1.4.onnx     : restauración de rostro (GFPGAN, Apache-2.0)
#  - yoloface_8n.onnx    : detector de rostro con 5 puntos (para alinear)
cd "$(dirname "$0")/.." || exit 1
D=assets/work/modelos_ia; mkdir -p $D
for m in real_esrgan_x2.onnx gfpgan_1.4.onnx yoloface_8n.onnx; do
  [ -s $D/$m ] || curl -sSL --fail -o $D/$m "https://huggingface.co/facefusion/models-3.0.0/resolve/main/$m" || exit 1
done
ls -la $D
