#!/bin/bash

set -e

IMAGE_NAME="cosmic-chat:latest"
CONTAINER_NAME="cosmic-chat"
NETWORK_NAME="cosmic_net"

echo "---------------------------------------------------"
echo " Cosmic Chat  Docker Launcher"
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

# 2) Build the container
echo "[INFO] Building Docker image '${IMAGE_NAME}'..."
docker build -t "${IMAGE_NAME}" .

echo ""

# 3) Stop and remove previous container if running
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "[INFO] Removing existing container '${CONTAINER_NAME}'..."
  docker rm -f "${CONTAINER_NAME}" >/dev/null 2>&1 || true
fi

echo ""

echo "[INFO] Starting container '${CONTAINER_NAME}' on network '${NETWORK_NAME}'..."
echo ""

# Linux hosts need the host-gateway mapping
EXTRA_OPTS=""
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
  EXTRA_OPTS="--add-host=host.docker.internal:host-gateway"
  echo "[INFO] Linux detected: enabling host.docker.internal mapping"
fi

docker run -d \
  --name "${CONTAINER_NAME}" \
  --network "${NETWORK_NAME}" \
  -p 8081:8081 \
  ${EXTRA_OPTS} \
  -e COSMIC_TIMEOUT="60" \
  "${IMAGE_NAME}"

echo ""
echo "---------------------------------------------------"
echo " Cosmic Chat is running!"
echo " Open your browser at: http://localhost:8081"
echo "---------------------------------------------------"