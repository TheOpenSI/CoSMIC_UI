#!/usr/bin/env bash
set -euo pipefail

IMAGE_NAME="${IMAGE_NAME:-cosmic-ui:latest}"
CONTAINER_NAME="${CONTAINER_NAME:-cosmic-ui}"
NETWORK_NAME="${NETWORK_NAME:-cosmic_cosmic_net}"

# Backend is accessed from the BROWSER at localhost:3000
BACKEND_HOST="${BACKEND_HOST:-localhost}"
BACKEND_PORT="${BACKEND_PORT:-3000}"
BACKEND_HEALTH_PATH="${BACKEND_HEALTH_PATH:-/health}"  # adjust to your backend health route

VITE_PORT="${VITE_PORT:-5173}"
VITE_HMR_PORT="${VITE_HMR_PORT:-24678}"

API_BASE_URL="http://${BACKEND_HOST}:${BACKEND_PORT}"

echo "---------------------------------------------------"
echo " Cosmic UI — Dev Launcher (Option A: localhost API)"
echo "---------------------------------------------------"
echo "Frontend image      : ${IMAGE_NAME}"
echo "Frontend container  : ${CONTAINER_NAME}"
echo "Docker network      : ${NETWORK_NAME}"
echo "Vite dev port       : ${VITE_PORT}"
echo "Vite HMR port       : ${VITE_HMR_PORT}"
echo "Backend (browser)   : ${API_BASE_URL}"
echo "Health path         : ${BACKEND_HEALTH_PATH}"
echo "Env var (Vite)      : VITE_API_BASE_URL"
echo "---------------------------------------------------"
echo ""

# 1) Ensure network exists
if ! docker network ls --format '{{.Name}}' | grep -q "^${NETWORK_NAME}$"; then
  echo "[INFO] Creating docker network '${NETWORK_NAME}'..."
  docker network create "${NETWORK_NAME}"
else
  echo "[INFO] Docker network '${NETWORK_NAME}' already exists ✔"
fi
echo ""

# 2) Build image
echo "[INFO] Building '${IMAGE_NAME}' from Dockerfile.dev..."
docker build -t "${IMAGE_NAME}" -f Dockerfile.dev .
echo ""

# 3) Remove existing container
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "[INFO] Removing existing container '${CONTAINER_NAME}'..."
  docker rm -f "${CONTAINER_NAME}" >/dev/null 2>&1 || true
fi
echo ""

# 4) Check backend reachability from host (browser perspective)
if [[ "${SKIP_BACKEND_CHECK:-0}" != "1" ]]; then
  if command -v curl >/dev/null 2>&1; then
    echo "[INFO] Checking ${API_BASE_URL}${BACKEND_HEALTH_PATH} ..."
    if curl -fsS "${API_BASE_URL}${BACKEND_HEALTH_PATH}" >/dev/null; then
      echo "[INFO] Backend is reachable ✔"
    else
      echo "[WARN] Could not reach ${API_BASE_URL}${BACKEND_HEALTH_PATH}."
      echo "      Ensure backend publishes ${BACKEND_PORT} to host:"
      echo "        docker run --rm -it --name cosmic --network ${NETWORK_NAME} -p ${BACKEND_PORT}:${BACKEND_PORT} <backend-image>"
      echo "      Continuing..."
    fi
  else
    echo "[WARN] 'curl' not found; skipping backend health check."
  fi
fi
echo ""

# 5) Ensure Vite definitely sees the variable (env file + env var)
echo "[INFO] Writing .env.development.local with VITE_API_BASE_URL=${API_BASE_URL}"
printf "VITE_API_BASE_URL=%s\n" "${API_BASE_URL}" > .env.development.local

# 6) Linux host mapping (harmless here)
EXTRA_OPTS=()
if [[ "${OSTYPE:-}" == "linux-gnu"* ]]; then
  EXTRA_OPTS+=(--add-host=host.docker.internal:host-gateway)
  echo "[INFO] Linux detected: adding host.docker.internal mapping."
fi

# 7) Start dev container; echo env var before starting Vite
echo "[INFO] Starting '${CONTAINER_NAME}'..."
docker run --rm -it \
  --name "${CONTAINER_NAME}" \
  --network "${NETWORK_NAME}" \
  -p "${VITE_PORT}:${VITE_PORT}" \
  -p "${VITE_HMR_PORT}:${VITE_HMR_PORT}" \
  -e CHOKIDAR_USEPOLLING=true \
  -e WATCHPACK_POLLING=true \
  -e VITE_API_BASE_URL="${API_BASE_URL}" \
  -v "$PWD":/app \
  -v /app/node_modules \
  "${EXTRA_OPTS[@]}" \
  --entrypoint /bin/sh \
  "${IMAGE_NAME}" -lc 'echo "VITE_API_BASE_URL=$VITE_API_BASE_URL"; yarn dev --host --port '"${VITE_PORT}"

echo ""
echo "---------------------------------------------------"
echo " Cosmic UI is running!"
echo " Open: http://localhost:${VITE_PORT}"
echo " API base (from browser): ${API_BASE_URL}"
echo "---------------------------------------------------"
``