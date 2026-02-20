#!/bin/bash

set -e

IMAGE_NAME="cosmic-chat:latest"
CONTAINER_NAME="cosmic-chat"

echo "---------------------------------------------------"
echo " Cosmic Chat Stop & Cleanup Script"
echo "---------------------------------------------------"
echo ""

# Stop container if running
if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "[INFO] Stopping running container '${CONTAINER_NAME}'..."
  docker stop "${CONTAINER_NAME}"
else
  echo "[INFO] No running container named '${CONTAINER_NAME}' found."
fi

# Remove container if exists
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "[INFO] Removing container '${CONTAINER_NAME}'..."
  docker rm "${CONTAINER_NAME}"
else
  echo "[INFO] No existing container '${CONTAINER_NAME}' to remove."
fi

# Remove image if exists
if docker images --format '{{.Repository}}:{{.Tag}}' | grep -q "^${IMAGE_NAME}$"; then
  echo "[INFO] Removing image '${IMAGE_NAME}'..."
  docker rmi "${IMAGE_NAME}"
else
  echo "[INFO] No image named '${IMAGE_NAME}' found."
fi

echo ""
echo "---------------------------------------------------"
echo " Cleanup complete!"
echo "---------------------------------------------------"