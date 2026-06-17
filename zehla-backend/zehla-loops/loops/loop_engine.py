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
from typing import Optional, List, Dict, Any, TypeVar, Callable, Awaitable
import httpx
import redis
import signal
import threading

T = TypeVar("T")

async def retry_with_backoff(
    fn: Callable[..., Awaitable[T]],
    max_retries: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 16.0,
    retryable_exceptions: tuple = (httpx.TimeoutException, httpx.HTTPStatusError),
    on_retry: Callable[[int, Exception], None] = None,
) -> T:
    """
    Executa fn com retry e exponential backoff.
    
    Estratégia: 1s → 2s → 4s (max 3 tentativas)
    Não retry em erros 4xx (client error), só 5xx e timeouts.
    """
    last_exception = None
    
    for attempt in range(max_retries + 1):
        try:
            return await fn()
        except retryable_exceptions as e:
            last_exception = e
            
            # Não retry em 4xx (exceto 429 rate limit)
            if isinstance(e, httpx.HTTPStatusError):
                if e.response.status_code == 429:
                    delay = min(max_delay, base_delay * (2 ** attempt) * 2)
                elif 400 <= e.response.status_code < 500:
                    raise
                else:
                    delay = min(max_delay, base_delay * (2 ** attempt))
            else:
                delay = min(max_delay, base_delay * (2 ** attempt))
            
            if attempt < max_retries:
                if on_retry:
                    on_retry(attempt + 1, e)
                print(
                    f"[RETRY] Tentativa {attempt + 1}/{max_retries} falhou: {e}\n"
                    f"        Aguardando {delay:.1f}s antes de tentar novamente..."
                )
                await asyncio.sleep(delay)
    
    raise last_exception

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
    MAX_STATUS_ENTRIES = 10  # Manter últimas 10 execuções

    def __init__(self, config: LoopConfig):
        self.config = config
        self.headroom_url = os.getenv("HEADROOM_PROXY_URL", "http://headroom:8787/v1")
        self.api_key = os.getenv("OPENROUTER_API_KEY", "")
        self.redis_url = os.getenv("REDIS_URL", "redis://redis:6379/1")
        self.result = LoopResult(loop_name=config.name, started_at=datetime.now())
        self.mock_mode = os.getenv("MOCK_MODE", "false").lower() == "true"
        
        try:
            self.redis_client = redis.Redis.from_url(self.redis_url, decode_responses=True)
        except Exception as e:
            print(f"[WARN] Conexão Redis falhou, operando sem cache persistente Redis: {e}")
            self.redis_client = None

        self._shutdown_requested = False
        self._current_iteration = 0
        self._lock = threading.Lock()
        
        # Registra signal handlers para graceful shutdown
        signal.signal(signal.SIGTERM, self._handle_shutdown)
        signal.signal(signal.SIGINT, self._handle_shutdown)

    def _handle_shutdown(self, signum, frame):
        """Trata SIGTERM/SIGINT para graceful shutdown."""
        print(f"\n[SHUTDOWN] Sinal {signum} recebido. Finalizando iteração atual...")
        self._shutdown_requested = True

    def _read_spec(self) -> str:
        spec_path = Path("specs") / self.config.spec_path
        if not spec_path.exists():
            return f"# SPEC - {self.config.name}\n\nObjetivo: Executar mock de {self.config.name}."
        return spec_path.read_text(encoding="utf-8")

    def _read_status(self) -> str:
        """Lê STATUS.md (memória durável Ralph) com rotação."""
        status_path = Path("specs") / Path(self.config.spec_path).parent / "STATUS.md"
        if status_path.exists():
            content = status_path.read_text(encoding="utf-8")
            lines = content.strip().split("\n")
            if len(lines) > 200:
                header_end = 0
                for i, line in enumerate(lines):
                    if line.startswith("## Histórico") or line.startswith("## Execuções"):
                        header_end = i
                        break
                
                if header_end > 0:
                    header = "\n".join(lines[:header_end + 1])
                    execution_markers = [
                        i for i, line in enumerate(lines)
                        if line.startswith("## Execução") or line.startswith("## Iteração")
                    ]
                    if len(execution_markers) > self.MAX_STATUS_ENTRIES:
                        cutoff = execution_markers[-self.MAX_STATUS_ENTRIES]
                        return header + "\n" + "\n".join(lines[cutoff:])
            return content
        return "# STATUS — Nenhuma execução anterior\n\n- [ ] Iniciar"

    def _update_status(self, content: str, iteration_num: int = 0):
        """
        Atualiza STATUS.md com rotação automática.
        Mantém apenas as últimas MAX_STATUS_ENTRIES execuções.
        Move entradas antigas para o JSONL (que já existe como log permanente).
        """
        status_path = Path("specs") / Path(self.config.spec_path).parent / "STATUS.md"
        status_path.parent.mkdir(parents=True, exist_ok=True)
        current = ""
        
        if status_path.exists():
            current = status_path.read_text(encoding="utf-8")
        
        # Se é a primeira iteração ou final (iteration_num == 0), faz append
        if iteration_num <= 1:
            new_content = current + "\n\n" + content
        else:
            # Substitui a entrada da execução atual (update in-place)
            execution_marker = f"## Execução — {self.result.started_at.strftime('%Y-%m-%d')}"
            if execution_marker in current:
                parts = current.split(execution_marker)
                new_content = parts[0] + execution_marker + "\n" + content
            else:
                new_content = current + "\n\n" + content
        
        # Limita tamanho do STATUS.md (rotação)
        lines = new_content.strip().split("\n")
        execution_markers = [
            i for i, line in enumerate(lines)
            if line.startswith("## Execução") or line.startswith("## Iteração")
        ]
        
        if len(execution_markers) > self.MAX_STATUS_ENTRIES:
            cutoff_line = execution_markers[-self.MAX_STATUS_ENTRIES]
            
            # Loga as entradas removidas no JSONL para preservação
            for marker in execution_markers[:-self.MAX_STATUS_ENTRIES]:
                entry_lines = lines[marker:cutoff_line]
                entry_text = "\n".join(entry_lines[:20])  # Primeiras 20 linhas
                self._append_log({
                    "event": "status_rotation",
                    "loop": self.config.name,
                    "rotated_entry": entry_text[:500],
                    "timestamp": datetime.now().isoformat(),
                })
            
            # Trunca mantendo cabeçalho + últimas entradas
            header_end = 0
            for i, line in enumerate(lines):
                if line.startswith("## Histórico") or line.startswith("## Execuções"):
                    header_end = i + 1
                    break
            
            new_content = (
                "\n".join(lines[:header_end]) + "\n\n" +
                "\n".join(lines[cutoff_line:])
            )
        
        status_path.write_text(new_content.strip(), encoding="utf-8")

    def _append_log(self, entry: dict):
        log_dir = os.getenv("LOOP_LOG_PATH", "/var/log/zehla-loops")
        Path(log_dir).mkdir(parents=True, exist_ok=True)
        log_path = Path(log_dir) / f"{self.config.name}.jsonl"
        with open(log_path, "a") as f:
            f.write(json.dumps(entry) + "\n")

    def _estimate_tokens(self, messages: list[dict]) -> int:
        """Estima tokens antes do envio (regra: ~4 chars = 1 token)."""
        total_chars = sum(len(m.get("content", "")) for m in messages)
        return total_chars // 4

    async def _call_llm_with_retry(
        self, messages: list[dict], model: str
    ) -> dict:
        """
        Chama LLM via Headroom proxy com retry e exponential backoff.
        Máximo 3 tentativas com delays de 1s → 2s → 4s.
        """
        async def _single_call():
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
        
        return await retry_with_backoff(
            _single_call,
            max_retries=3,
            base_delay=1.0,
            on_retry=lambda attempt, err: print(
                f"[RETRY] Chamada LLM falhou (tentativa {attempt}): {err}"
            ),
        )

    async def _call_llm_with_tracking(
        self, messages: list[dict], model: str
    ) -> tuple[dict, int, int]:
        """
        Chama LLM via Headroom proxy (compressão automática).
        Retorna: (response, tokens_before, tokens_after).
        """
        tokens_before = self._estimate_tokens(messages)
        
        result = await self._call_llm_with_retry(messages, model)
        
        usage = result.get("usage", {})
        tokens_after = usage.get("total_tokens", 0)
        
        headroom_meta = result.get("headroom", {})
        if headroom_meta:
            tokens_before = headroom_meta.get("original_tokens", tokens_before)
            tokens_after = headroom_meta.get("compressed_tokens", tokens_after)
        
        return result, tokens_before, tokens_after

    def _should_halt(self) -> bool:
        """Verifica se o loop deve parar (guardas + shutdown signal)."""
        if self._shutdown_requested:
            return True
        return self._check_guards() is not None

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

    async def _evaluate_with_rubric(self, output: str, iteration: int) -> tuple[float, bool]:
        """
        Avalia o output usando o RubricEngine do loop (primário)
        ou LLM reviewer (fallback).
        """
        import re
        
        # CAMADA 1: Extração de JSON estruturado
        try:
            json_match = re.search(r'\{[^{}]*"status"\s*:\s*"[^"]*"[^{}]*\}', output)
            if json_match:
                data = json.loads(json_match.group())
                status = data.get("status", "").lower().strip()
                
                done_statuses = {"done", "complete", "concluido", "concluído", "finished", "ok", "success"}
                partial_statuses = {"partial", "progress", "in_progress", "ongoing", "continuing"}
                
                if status in done_statuses:
                    return 1.0, True
                elif status in partial_statuses:
                    return 0.5, False
                else:
                    return 0.2, False
        except (json.JSONDecodeError, AttributeError):
            pass
        
        # CAMADA 2: Avaliação por LLM Reviewer (Haiku — barato)
        try:
            review_prompt = [
                {
                    "role": "system",
                    "content": (
                        "Você é um revisor rigoroso. Avalie o output de um agente ZEHLA.\n"
                        "Responda APENAS com JSON: {\"score\": 0.0-1.0, \"passed\": true/false, \"reason\": \"...\"}\n"
                        "Score >= 0.7 = PASS. Score < 0.7 = FAIL.\n"
                        "Critérios: completude da tarefa, qualidade da resposta, ausência de alucinação."
                    ),
                },
                {
                    "role": "user",
                    "content": f"Output do agente (iteração {iteration}):\n\n{output[:2000]}",
                },
            ]
            
            review_response, _, _ = await self._call_llm_with_tracking(
                review_prompt, self.config.model_reviewer
            )
            
            review_text = review_response["choices"][0]["message"]["content"]
            
            score_match = re.search(r'"score"\s*:\s*([\d.]+)', review_text)
            passed_match = re.search(r'"passed"\s*:\s*(true|false)', review_text, re.IGNORECASE)
            
            if score_match:
                score = min(1.0, max(0.0, float(score_match.group(1))))
                passed = bool(passed_match and passed_match.group(1).lower() == "true")
                return score, passed
                
        except Exception as e:
            print(f"[WARN] LLM reviewer falhou: {e}")
        
        # CAMADA 3: Fallback conservador
        if len(output.strip()) > 100:
            return 0.3, False
        return 0.0, False

    async def _evaluate_with_domain_rubric(
        self, output: str, iteration: int, context: dict = None
    ) -> tuple[float, bool]:
        """
        Avalia usando rubrica de domínio se disponível (ex: pricing).
        Caso contrário, faz fallback para avaliação genérica.
        """
        rubric_path = Path("specs") / self.config.name / "rubric.py"
        if rubric_path.exists() and context:
            try:
                import importlib.util
                spec = importlib.util.spec_from_file_location(
                    "loop_rubric", rubric_path
                )
                rubric_module = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(rubric_module)
                
                if hasattr(rubric_module, "evaluate"):
                    result = rubric_module.evaluate(
                        context.get("before", {}),
                        context.get("after", {}),
                        context.get("market", {}),
                    )
                    return result["total_score"], result["passed"]
            except Exception as e:
                print(f"[WARN] Rubrica de domínio falhou: {e}")
        
        return await self._evaluate_with_rubric(output, iteration)

    async def run(self) -> LoopResult:
        """Executa o loop completo com graceful shutdown."""
        print(f"\n{'='*60}")
        print(f"LOOP ZEHLA: {self.config.name}")
        print(f"{'='*60}\n")
        
        spec = self._read_spec()
        status = self._read_status()
        
        try:
            while True:
                if self._should_halt():
                    if self._shutdown_requested:
                        self.result.status = "interrupted"
                        self.result.halt_reason = "SIGTERM/SIGINT recebido"
                        print("\n[SHUTDOWN] Loop interrompido por sinal externo")
                    break
                
                halt_reason = self._check_guards()
                if halt_reason:
                    self.result.status = "halted"
                    self.result.halt_reason = halt_reason
                    print(f"\n[HALT] {halt_reason}")
                    break
                
                iteration_num = len(self.result.iterations) + 1
                self._current_iteration = iteration_num
                start_time = time.time()
                result = IterationResult(
                    iteration=iteration_num,
                    writer_model=self.config.model_writer,
                )
                
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

                    # MOCK_MODE injection
                    if self.mock_mode:
                        mock_dir = Path("mock_data") / self.config.name
                        if mock_dir.exists():
                            mock_files = list(mock_dir.glob("*.json"))
                            mock_context = {}
                            for f in mock_files:
                                mock_context[f.stem] = json.loads(f.read_text(encoding="utf-8"))
                            
                            messages[0]["content"] += (
                                f"\n\n--- DADOS MOCK (MOCK_MODE=ON) ---\n"
                                f"{json.dumps(mock_context, indent=2, ensure_ascii=False)[:4000]}\n"
                                f"--- FIM DADOS MOCK ---"
                            )
                            print(f"[MOCK] Carregados {len(mock_files)} arquivos de mock data")

                    # DISPATCH: Envia ao LLM via Headroom proxy (compressão automática)
                    llm_response, tokens_before, tokens_after = await self._call_llm_with_tracking(
                        messages, self.config.model_writer
                    )
                    
                    result.tokens_before = tokens_before
                    result.tokens_after = tokens_after
                    result.tokens_saved = max(0, tokens_before - tokens_after)
                    compression_ratio = (
                        result.tokens_after / max(1, result.tokens_before)
                    )
                    result.compression_ratio = compression_ratio

                    output = llm_response["choices"][0]["message"]["content"]
                    result.output = output
                    
                    if result.tokens_saved > 0:
                        print(
                            f"[ITER {iteration_num}] "
                            f"Tokens: {result.tokens_before} → {result.tokens_after} "
                            f"({result.tokens_saved} saved, {compression_ratio:.0%} compress)"
                        )

                    # EVALUATE
                    context = {
                        "before": {"status": status},
                        "after": {"output": output},
                        "market": {}
                    }
                    if self.mock_mode:
                        mock_dir = Path("mock_data") / self.config.name
                        if mock_dir.exists():
                            pricing_occupancy = mock_dir / "occupancy.json"
                            pricing_competitors = mock_dir / "competitors.json"
                            if pricing_occupancy.exists():
                                occ_data = json.loads(pricing_occupancy.read_text(encoding="utf-8"))
                                context["before"]["current_occupancy"] = occ_data.get("current", {}).get("occupancy_percent", 0.68)
                                context["before"]["target_occupancy"] = occ_data.get("target_occupancy", 0.85)
                                context["before"]["max_revenue"] = occ_data.get("historical_max_revenue", 8540.0)
                            if pricing_competitors.exists():
                                comp_data = json.loads(pricing_competitors.read_text(encoding="utf-8"))
                                context["market"]["avg_market"] = comp_data.get("market_avg", {}).get("standard_double", 255.5)

                    result.rubric_score, result.rubric_passed = await self._evaluate_with_domain_rubric(
                        output, iteration_num, context
                    )

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
                    self._update_status(status, iteration_num=iteration_num)

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
                    
                    if self._shutdown_requested:
                        break
                    
                    break
        finally:
            self._save_final_state()
            self.result.finished_at = datetime.now()
            
        return self.result

    def _save_final_state(self):
        """Salva estado final do loop (chamado no finally)."""
        if self.result.status == "running":
            if self._shutdown_requested:
                self.result.status = "interrupted"
            else:
                self.result.status = "halted"
                
        self.result.total_tokens_saved = sum(i.tokens_saved for i in self.result.iterations)
        self.result.total_cost_usd = sum(i.cost_usd for i in self.result.iterations)
        
        summary = f"\n## Status Final — {datetime.now().isoformat()}\n"
        summary += f"- Status: {self.result.status}\n"
        summary += f"- Iterações completadas: {len(self.result.iterations)}\n"
        summary += f"- Custo total: ${self.result.total_cost_usd:.4f}\n"
        summary += f"- Tokens economizados: {self.result.total_tokens_saved}\n"
        if self.result.halt_reason:
            summary += f"- Motivo parada: {self.result.halt_reason}\n"
        
        self._update_status(summary, iteration_num=0)
        
        self._append_log({
            "event": "loop_finished",
            "loop": self.config.name,
            "status": self.result.status,
            "iterations": len(self.result.iterations),
            "total_cost_usd": self.result.total_cost_usd,
            "total_tokens_saved": self.result.total_tokens_saved,
            "halt_reason": self.result.halt_reason,
            "timestamp": datetime.now().isoformat(),
        })
        
        print(f"\n[STATE] Estado final salvo: {self.result.status}")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="ZEHLA Loop Engine")
    parser.add_argument("--loop", type=str, default="pricing_optimization", help="Nome do loop")
    parser.add_argument("--spec", type=str, default="pricing/spec.md", help="Caminho do spec")
    parser.add_argument("--mock", action="store_true", help="Ativar MOCK_MODE")
    args = parser.parse_args()

    if args.mock:
        os.environ["MOCK_MODE"] = "true"

    cfg = LoopConfig(
        name=args.loop,
        spec_path=args.spec,
        hardness="medium"
    )
    engine = ZehlaLoopEngine(cfg)
    asyncio.run(engine.run())
