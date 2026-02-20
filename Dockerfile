# ---------- Stage 1: Build React frontend ----------
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY ./package*.json ./ 
# RUN npm ci
RUN npm install
COPY . .
RUN npm run build

# ---------- Stage 2: Python backend ----------
FROM python:3.11-slim AS runtime
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install system deps (optional)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend
COPY backend/ /app/backend/

# Copy built frontend into /app/static (served by FastAPI)
COPY --from=frontend-builder /app/dist /app/static

# Install Python deps
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Environment configuration
ENV COSMIC_URL="http://host.docker.internal:3000/cosmic"
# ENV COSMIC_URL="http://localhost:3000/cosmic"
ENV COSMIC_TIMEOUT="60"

# Expose app port
EXPOSE 8081

# Start Uvicorn
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8081", "--proxy-headers"]