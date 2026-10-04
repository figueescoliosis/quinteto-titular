#!/bin/bash
# Prepara la VM cloud de Claude Code. Idempotente: solo instala lo que falta.
[ "$CLAUDE_CODE_REMOTE" = "true" ] || exit 0
cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/..}" || exit 0
SUDO=""; [ "$(id -u)" = 0 ] || SUDO="sudo"
if [ ! -f /var/tmp/quinteto_apt_ok ]; then
  $SUDO apt-get update -qq && $SUDO apt-get install -y -qq ffmpeg python3-venv \
    libnss3 libdbus-1-3 libatk1.0-0t64 libatk-bridge2.0-0t64 libgbm1 libasound2t64 \
    libxrandr2 libxkbcommon0 libxfixes3 libxcomposite1 libxdamage1 \
    libpango-1.0-0 libcairo2 libcups2t64 && touch /var/tmp/quinteto_apt_ok
fi
[ -x .venv/bin/python ] || python3 -m venv .venv
.venv/bin/python -c "import onnxruntime, cv2, PIL" 2>/dev/null || \
  .venv/bin/pip install -q onnxruntime numpy pillow opencv-python-headless
if [ -f package.json ]; then
  [ -d node_modules ] || npm install --no-audit --no-fund
  npx remotion browser ensure >/dev/null 2>&1
fi
exit 0
