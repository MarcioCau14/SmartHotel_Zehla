"""
ZEHLA Loop Engine — Motor de Execução com Headroom
Executa loops autônomos com compressão de contexto via Headroom proxy.
"""

import os
import sys
import json
import time
import asyncio
from datetime import datetime
from pathlib import Path
from dataclasses import dataclass, field
from typing import Optional, List, Dict, Any
import httpx
import redis

@dataclass
class LoopConfig:
    name: str
    spec_path: str
    model_writer: str = "anthropic/claude-sonnet-4"
    model_reviewer: str = "anthropic/claude-haiku-3.5"
    max_iterations: int = 5
    budget_cap_usd: float = 3.0
    hardness: str = "hard"

@dataclass
class IterationResult:
    iteration: int
    writer_model: str
    tokens_before: int = 0
    tokens_after: int = 0
    tokens_saved: int = 0
    compression_ratio: float = 0.0
    cost_usd: float = 0.0
    total_cost_usd: float = 0.0
    rubric_score: float = 0.0
    rubric_passed: bool = False
    output: str = ""
    duration_ms: int = 0
    error: Optional[str] = None

@dataclass
class LoopResult:
    loop_name: str
    started_at: datetime
    finished_at: Optional[datetime] = None
    iterations: List[IterationResult] = field(default_factory=list)
    status: str = "running"
    halt_reason: Optional[str] = None
    total_tokens_saved: int = 0
    total_cost_usd: float = 0.0
    headroom_savings_percent: float = 0.0

class ZehlaLoopEngine:
    def __init__(self, config: LoopConfig):
        self.config = config
        self.headroom_url = os.getenv("HEADROOM_PROXY_URL", "http://headroom:8787/v1")
        self.api_key = os.getenv("OPENROUTER_API_KEY", "")
        self.redis_url = os.getenv("REDIS_URL", "redis://redis:6379/1")
        self.result = LoopResult(loop_name=config.name, started_at=datetime.now())
        try:
            self.redis_client = redis.Redis.from_url(self.redis_url, decode_responses=True)
        except Exception as e:
            print(f"[WARN] Conexão Redis falhou, operando sem cache persistente Redis: {e}")
            self.redis_client = None

    def _read_spec(self) -> str:
        spec_path = Path("specs") / self.config.spec_path
        if not spec_path.exists():
            return f"# SPEC - {self.config.name}\n\nObjetivo: Executar mock de {self.config.name}."
        return spec_path.read_text(encoding="utf-8")

    def _read_status(self) -> str:
        status_path = Path("specs") / Path(self.config.spec_path).parent / "STATUS.md"
        if status_path.exists():
            return status_path.read_text(encoding="utf-8")
        return "# STATUS — Nenhuma execução anterior\n\n- [ ] Iniciar"

    def _update_status(self, content: str):
        status_path = Path("specs") / Path(self.config.spec_path).parent / "STATUS.md"
        status_path.parent.mkdir(parents=True, exist_ok=True)
        status_path.write_text(content, encoding="utf-8")

    def _append_log(self, entry: dict):
        log_dir = os.getenv("LOOP_LOG_PATH", "/var/log/zehla-loops")
        Path(log_dir).mkdir(parents=True, exist_ok=True)
        log_path = Path(log_dir) / f"{self.config.name}.jsonl"
        with open(log_path, "a") as f:
            f.write(json.dumps(entry) + "\n")

    async def _compress_via_headroom(self, messages: list[dict]) -> dict:
        try:
            compress_endpoint = self.headroom_url.split("/v1")[0] + "/v1/compress"
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    compress_endpoint,
                    json={"messages": messages, "model": self.config.model_writer},
                    headers={"Authorization": f"Bearer {self.api_key}"},
                )
                if response.status_code == 200:
                    return response.json()
        except Exception as e:
            print(f"[WARN] Headroom compress falhou: {e}")
        return {"messages": messages, "tokens_before": 0, "tokens_after": 0, "tokens_saved": 0}

    async def _call_llm(self, messages: list[dict], model: str) -> dict:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{self.headroom_url}/chat/completions",
                json={
                    "model": model,
                    "messages": messages,
                    "temperature": 0.7,
                    "max_tokens": 4096,
                },
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
            )
            response.raise_for_status()
            return response.json()

    def _check_guards(self) -> Optional[str]:
        r = self.result
        if len(r.iterations) >= self.config.max_iterations:
            return f"ITERATION_CAP: atingido máximo de {self.config.max_iterations} iterações"
        if r.total_cost_usd >= self.config.budget_cap_usd:
            return f"BUDGET_CAP: atingido limite financeiro de ${self.config.budget_cap_usd:.2f} USD"
        if len(r.iterations) >= 3:
            last_3_outputs = [i.output for i in r.iterations[-3:]]
            if len(set(last_3_outputs)) == 1:
                return "DIFF_CHECK: convergência de resultado detectada (convergido)"
        return None

    async def run(self) -> LoopResult:
        print(f"🔄 Iniciando ZEHLA Loop: {self.config.name}")
        spec = self._read_spec()
        status = self._read_status()

        while True:
            halt_reason = self._check_guards()
            if halt_reason:
                self.result.status = "halted"
                self.result.halt_reason = halt_reason
                print(f"⚠️  Loop interrompido: {halt_reason}")
                break

            iteration_num = len(self.result.iterations) + 1
            start_time = time.time()
            result = IterationResult(iteration=iteration_num, writer_model=self.config.model_writer)

            try:
                # DISCOVERY: Ralph context
                messages = [
                    {
                        "role": "system",
                        "content": (
                            f"Você é o executor do loop {self.config.name}.\n"
                            f"Especificação técnica:\n{spec}\n\n"
                            f"Estado de progresso atual (STATUS.md):\n{status}\n"
                        )
                    },
                    {
                        "role": "user",
                        "content": f"Iteração {iteration_num}. Execute a próxima ação e responda em JSON: {{\"task\": \"...\", \"result\": \"...\", \"status\": \"done/partial\"}}"
                    }
                ]

                # COMPRESS
                compressed = await self._compress_via_headroom(messages)
                result.tokens_before = compressed.get("tokens_before", 0)
                result.tokens_after = compressed.get("tokens_after", 0)
                result.tokens_saved = compressed.get("tokens_saved", 0)
                result.compression_ratio = compressed.get("compression_ratio", 0.0)

                # DISPATCH
                llm_response = await self._call_llm(compressed.get("messages", messages), self.config.model_writer)
                output = llm_response["choices"][0]["message"]["content"]
                result.output = output

                # EVALUATE
                result.rubric_passed = '"status": "done"' in output.lower()
                result.rubric_score = 1.0 if result.rubric_passed else 0.5

                # COST & METRICS
                usage = llm_response.get("usage", {})
                total_tokens = usage.get("total_tokens", result.tokens_after + 500)
                result.cost_usd = total_tokens * 0.000015
                result.total_cost_usd = sum(i.cost_usd for i in self.result.iterations) + result.cost_usd
                duration = int((time.time() - start_time) * 1000)
                result.duration_ms = duration

                print(f"✓ Iteração {iteration_num} concluída (Score: {result.rubric_score}, Custo: ${result.cost_usd:.4f})")

                # REMEMBER
                self.result.iterations.append(result)
                status = f"{status}\n- Iteração {iteration_num}: Score {result.rubric_score}, passed={result.rubric_passed}"
                self._update_status(status)

                self._append_log({
                    "loop": self.config.name,
                    "iteration": iteration_num,
                    "score": result.rubric_score,
                    "passed": result.rubric_passed,
                    "cost_usd": result.cost_usd,
                    "tokens_saved": result.tokens_saved,
                    "duration_ms": duration,
                    "timestamp": datetime.now().isoformat()
                })

                if result.rubric_passed and self.config.hardness == "medium":
                    self.result.status = "completed"
                    print(f"🎉 Loop finalizado com sucesso!")
                    break

            except Exception as e:
                result.error = str(e)
                self.result.iterations.append(result)
                print(f"❌ Erro na iteração {iteration_num}: {e}")
                self._append_log({
                    "loop": self.config.name,
                    "iteration": iteration_num,
                    "error": str(e),
                    "timestamp": datetime.now().isoformat()
                })
                break

        self.result.finished_at = datetime.now()
        self.result.total_tokens_saved = sum(i.tokens_saved for i in self.result.iterations)
        self.result.total_cost_usd = sum(i.cost_usd for i in self.result.iterations)
        return self.result

if __name__ == "__main__":
    # Quando rodado de forma direta, executa um loop mock de teste de precificação
    cfg = LoopConfig(
        name="pricing_optimization",
        spec_path="pricing/spec.md",
        hardness="medium"
    )
    engine = ZehlaLoopEngine(cfg)
    asyncio.run(engine.run())
