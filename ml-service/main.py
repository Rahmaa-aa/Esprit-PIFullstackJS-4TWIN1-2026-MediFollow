"""API HTTP pour les 5 modèles CNN (déploiement Render)."""

from __future__ import annotations

import os

from fastapi import Depends, FastAPI, File, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from inference import MODEL_FILES, predict_image_bytes

app = FastAPI(title="MediFollow CNN inference", version="1.0.0")

_cors = os.environ.get("CORS_ORIGINS", "").strip()
if _cors:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[o.strip() for o in _cors.split(",") if o.strip()],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


def verify_internal_key(x_internal_key: str | None = Header(None, alias="X-Internal-Key")) -> None:
    expected = os.environ.get("ML_INTERNAL_API_KEY", "").strip()
    if not expected:
        return
    if (x_internal_key or "").strip() != expected:
        raise HTTPException(status_code=401, detail="Invalid or missing X-Internal-Key")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/models", dependencies=[Depends(verify_internal_key)])
def list_models() -> dict[str, list[str]]:
    return {"models": list(MODEL_FILES.keys())}


@app.post("/predict/{model_key}", dependencies=[Depends(verify_internal_key)])
async def predict(
    model_key: str,
    file: UploadFile = File(...),
) -> dict:
    if model_key not in MODEL_FILES:
        raise HTTPException(status_code=404, detail=f"Unknown model: {model_key}")
    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty file")
    try:
        return predict_image_bytes(model_key, raw)
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {e!s}") from e
