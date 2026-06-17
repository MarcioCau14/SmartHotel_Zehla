# ═══════════════════════════════════════════════════════════
# ARQUIVO: loops/headroom_client.py
# Cliente Headroom refatorado — sem compressão duplicada
# ═══════════════════════════════════════════════════════════

import httpx
import asyncio
from typing import Optional
from dataclasses import dataclass


@dataclass
class HeadroomStats:
    """Estatísticas do Headroom proxy."""
    healthy: bool
    savings_percent: float
    total_requests: int
    budget_used: float
    budget_limit: float
    mode: str
    uptime_seconds: int
    raw: dict


class HeadroomClient:
    """
    Cliente para Headroom proxy.
    
    IMPORTANTE: Em modo Proxy, NÃO chamar /v1/compress.
    A compressão acontece automaticamente em /v1/chat/completions.
    Este cliente é usado apenas para monitoramento (health, stats).
    """

    def __init__(self, proxy_url: str = "http://localhost:8787"):
        self.proxy_url = proxy_url.rstrip("/")
        self._client: Optional[httpx.AsyncClient] = None

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(timeout=10.0)
        return self._client

    async def health(self) -> HeadroomStats:
        """Verifica saúde do Headroom e retorna estatísticas."""
        client = await self._get_client()
        
        try:
            response = await client.get(f"{self.proxy_url}/health")
            response.raise_for_status()
            raw = response.json()
            return HeadroomStats(
                healthy=True,
                savings_percent=raw.get("savings_percent", 0.0),
                total_requests=raw.get("total_requests", 0),
                budget_used=raw.get("budget_used", 0.0),
                budget_limit=raw.get("budget_limit", 20.0),
                mode=raw.get("mode", "proxy"),
                uptime_seconds=raw.get("uptime_seconds", 0),
                raw=raw,
            )
        except (httpx.HTTPError, Exception):
            return HeadroomStats(
                healthy=False,
                savings_percent=0.0,
                total_requests=0,
                budget_used=0.0,
                budget_limit=0.0,
                mode="unknown",
                uptime_seconds=0,
                raw={},
            )

    async def stats(self) -> dict:
        """Retorna estatísticas detalhadas do Headroom."""
        client = await self._get_client()
        try:
            response = await client.get(f"{self.proxy_url}/stats")
            response.raise_for_status()
            return response.json()
        except (httpx.HTTPError, Exception):
            return {"error": "Headroom unavailable"}

    async def close(self):
        if self._client and not self._client.is_closed:
            await self._client.aclose()
