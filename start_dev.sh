#!/usr/bin/env bash
set -euo pipefail

# -----------------------------
# Defaults (override via env or flags)
# -----------------------------
IMAGE_NAME="${IMAGE_NAME:-cosmic-ui:latest}"
CONTAINER_NAME="${CONTAINER_NAME:-cosmic-ui}"
NETWORK_NAME="${NETWORK_NAME:-cosmic_net}"

# Backend will be called from the BROWSER as http://localhost:<port>
# Set via env BACKEND_PORT or flag --backend-port
BACKEND_HOST="${BACKEND_HOST:-0.0.0.0}"
BACKEND_PORT="${BACKEND_PORT:-3000}"

# Vite dev server ports
VITE_PORT="${VITE_PORT:-5173}"
VITE_HMR_PORT="${VITE_HMR_PORT:-24678}"


# Health endpoint to quickly verify backend availability (adjust if needed)
BACKEND_HEALTH_PATH="${BACKEND_HEALTH_PATH:-/health}"

# -----------------------------
# Parse flags
# -----------------------------
usage() {
  cat <<EOF
Usage: $0 [--backend-host HOST] [--backend-port PORT] [--vite-port PORT] [--hmr-port PORT] [--image-name NAME] [--container-name NAME]
Env overrides: IMAGE_NAME, CONTAINER_NAME, NETWORK_NAME, BACKEND_HOST, BACKEND_PORT, VITE_PORT, VITE_HMR_PORT, BACKEND_HEALTH_PATH
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --backend-host) BACKEND_HOST="$2"; shift 2 ;;
    --backend-port) BACKEND_PORT="$2"; shift 2 ;;
    --vite-port) VITE_PORT="$2"; shift 2 ;;
    --hmr-port) VITE_HMR_PORT="$2"; shift 2 ;;
    --image-name) IMAGE_NAME="$2"; shift 2 ;;
    --container-name) CONTAINER_NAME="$2"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown argument: $1"; usage; exit 1 ;;
  esac
done

API_BASE="http://${BACKEND_HOST}:${BACKEND_PORT}"

echo "---------------------------------------------------"
echo " Cosmic UI — Dev Launcher (localhost API)"
echo "---------------------------------------------------"
echo "Frontend image      : ${IMAGE_NAME}"
echo "Frontend container  : ${CONTAINER_NAME}"
echo "Docker network      : ${NETWORK_NAME}"
echo "Vite dev port       : ${VITE_PORT}"
echo "Vite HMR port       : ${VITE_HMR_PORT}"
echo "Backend (browser)   : ${API_BASE}"
echo "Health path         : ${BACKEND_HEALTH_PATH}"
echo "---------------------------------------------------"
echo ""

# 1) Ensure the network exists
if ! docker network ls --format '{{.Name}}' | grep -q "^${NETWORK_NAME}$"; then
  echo "[INFO] Docker network '${NETWORK_NAME}' does NOT exist. Creating it..."
  docker network create "${NETWORK_NAME}"
else
  echo "[INFO] Docker network '${NETWORK_NAME}' already exists ✔"
fi
echo ""

# 2) Build the frontend dev image
echo "[INFO] Building Docker image '${IMAGE_NAME}' from Dockerfile.dev..."
docker build -t "${IMAGE_NAME}" -f Dockerfile.dev .
echo ""

# 3) Stop/remove any previous container
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "[INFO] Removing existing container '${CONTAINER_NAME}'..."
  docker rm -f "${CONTAINER_NAME}" >/dev/null 2>&1 || true
fi
echo ""

# 4) Check backend availability from HOST perspective (browser path)
#    (Optional) If you don't have curl installed or want to skip, export SKIP_BACKEND_CHECK=1
if [[ "${SKIP_BACKEND_CHECK:-0}" != "1" ]]; then
  if command -v curl >/dev/null 2>&1; then
    echo "[INFO] Checking backend availability at ${API_BASE}${BACKEND_HEALTH_PATH} ..."
    if curl -fsS "${API_BASE}${BACKEND_HEALTH_PATH}" >/dev/null; then
      echo "[INFO] Backend is reachable ✔"
    else
      echo "[WARN] Could not reach ${API_BASE}${BACKEND_HEALTH_PATH}."
      echo "       Ensure your backend container publishes '${BACKEND_PORT}' to the host."
      echo "       Example:"
      echo "         docker run --rm -it --name cosmic-api --network ${NETWORK_NAME} -p ${BACKEND_PORT}:${BACKEND_PORT} cosmic-api-image"
      echo "       Continuing anyway..."
    fi
  else
    echo "[WARN] 'curl' not found; skipping backend health check."
  fi
fi
echo ""

# 5) Linux host mapping note (not needed for Option A, but harmless)
EXTRA_OPTS=()
if [[ "${OSTYPE:-}" == "linux-gnu"* ]]; then
  EXTRA_OPTS+=(--add-host=host.docker.internal:host-gateway)
  echo "[INFO] Linux detected: adding host.docker.internal mapping (not required for Option A)."
fi

# 6) Start frontend dev container
echo "[INFO] Starting '${CONTAINER_NAME}' on network '${NETWORK_NAME}'..."
echo "[INFO] VITE_API_BASE_URL will be set to ${API_BASE}"

docker run --rm -it \
  --name "${CONTAINER_NAME}" \
  --network "${NETWORK_NAME}" \
  -p "${VITE_PORT}:${VITE_PORT}" \
  -p "${VITE_HMR_PORT}:${VITE_HMR_PORT}" \
  -e CHOKIDAR_USEPOLLING=true \
  -e WATCHPACK_POLLING=true \
  -e VITE_API_BASE_URL="${API_BASE}" \
  -v "$PWD":/app \
  -v /app/node_modules \
  "${EXTRA_OPTS[@]}" \
  "${IMAGE_NAME}" 

echo ""
echo "---------------------------------------------------"
echo " Cosmic UI is running!"
echo " Open your browser at: http://localhost:${VITE_PORT}"
echo " API base (from browser): ${API_BASE}"
echo "---------------------------------------------------"