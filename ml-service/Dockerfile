# Build : contexte Docker = racine du dépôt (là où se trouvent ml-service/ et backend/models/).
# Sur Render : Root Directory laisser VIDE (racine du repo). Si Root = backend/models,
# le build cherche backend/models/ml-service et échoue (no such file).
# Commande locale : docker build -f ml-service/Dockerfile .
FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    TF_CPP_MIN_LOG_LEVEL=2 \
    TF_ENABLE_ONEDNN_OPTS=0 \
    MODELS_DIR=/app/models_data

COPY ml-service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ml-service/ /app/src/
COPY backend/models /app/models_data

WORKDIR /app/src

# Render injecte PORT
CMD sh -c "exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"
