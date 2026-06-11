"""
CAMPO AKASHICO ZEHLA — FastAPI Entry Point
============================================
Exposes /api/v2/akashic/* routes.
"""

import os
import logging
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from core import CampoAkashico

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
DB_PATH = os.getenv("AKASHIC_DB_PATH", "./data/akashic")
CHROMA_PATH = os.getenv("AKASHIC_CHROMA_PATH", "./data/chroma")
HOST = os.getenv("AKASHIC_HOST", "0.0.0.0")
PORT = int(os.getenv("AKASHIC_PORT", "8001"))
CRISTALIZATION_INTERVAL = int(os.getenv("CRISTALIZATION_INTERVAL_SECS", "900"))
LOG_LEVEL = os.getenv("LOG_LEVEL", "info")

logging.basicConfig(
    level=getattr(logging, LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("akashico")

akashico: CampoAkashico | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global akashico
    logger.info("Inicializando Campo Akashico...")
    os.makedirs(DB_PATH, exist_ok=True)
    os.makedirs(CHROMA_PATH, exist_ok=True)
    akashico = CampoAkashico(REDIS_URL, DB_PATH, CHROMA_PATH)
    akashico.start_cristalization_loop(CRISTALIZATION_INTERVAL)
    logger.info("Campo Akashico pronto. Cristalização a cada %is.", CRISTALIZATION_INTERVAL)
    yield
    if akashico:
        akashico.stop()
    logger.info("Campo Akashico desligado.")


app = FastAPI(
    title="Campo Akashico ZEHLA",
    version="1.0.0",
    lifespan=lifespan,
)


# ── Models ──────────────────────────────────────────────────────

class IngestEventRequest(BaseModel):
    pousada_id: str
    source_channel: str
    guest_id: str | None = None
    guest_profile: str | None = None
    input_text: str = ""
    intent_classified: str = ""
    ai_response: str = ""
    provider_used: str = ""
    tier_used: int = 2
    outcome: str = "neutral"
    sentiment_after: float = 0.0
    duration_ms: int = 0
    tokens_used: int = 0
    seasonality: str = "regular"
    weather_context: str | None = None
    occupancy_at_time: float = 0.0
    cadmas_bucket: int = 4
    was_sticky: bool = False


class QueryContextRequest(BaseModel):
    pousada_id: str
    query_text: str
    top_k: int = 10


# ── Routes ──────────────────────────────────────────────────────

@app.get("/api/v2/akashic/health")
def health():
    return {"status": "ok", "service": "campo-akashico"}


@app.post("/api/v2/akashic/ingest")
def ingest_event(req: IngestEventRequest):
    if not akashico:
        raise HTTPException(503, "Campo Akashico nao inicializado")
    try:
        stream_id = akashico.ingest_event(req.model_dump())
        return {"status": "ingested", "stream_id": stream_id}
    except ValueError as e:
        raise HTTPException(422, str(e))


@app.post("/api/v2/akashic/query")
def query_context(req: QueryContextRequest):
    if not akashico:
        raise HTTPException(503, "Campo Akashico nao inicializado")
    results = akashico.query_context(req.pousada_id, req.query_text, top_k=req.top_k)
    return {"results": results}


@app.get("/api/v2/akashic/guest/{pousada_id}/{guest_id}")
def get_guest(pousada_id: str, guest_id: str):
    if not akashico:
        raise HTTPException(503, "Campo Akashico nao inicializado")
    return akashico.get_guest_profile(pousada_id, guest_id)


@app.get("/api/v2/akashic/pousada/{pousada_id}/dashboard")
def get_dashboard(pousada_id: str):
    if not akashico:
        raise HTTPException(503, "Campo Akashico nao inicializado")
    return akashico.get_pousada_dashboard(pousada_id)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=HOST, port=PORT, log_level=LOG_LEVEL)
