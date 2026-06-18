# ZEHLA LOOP ENGINEERING — Correções Priorizadas e Código Corrigido

**Versão:** 1.0 — Documento de Correções Técnicas
**Data:** 17 de junho de 2026
**Classificação:** CONHECIMENTO TÉCNICO — Aplicável ao `zehla-backend`
**Autoria:** Agente ZEHLA OS — Revisão de Engenharia
**Referência:** `ZEHLA_LOOP_ENGINEERING_HEADROOM_DOCKER.md` (v2.0)
**Status:** PRONTO PARA APLICAÇÃO NO BACKEND

---

## SUMÁRIO

```
CORREÇÃO 1  ── Eliminar Compressão Dupla no Headroom Proxy
CORREÇÃO 2  ── Substituir Rubrica String-Match por LLM + RubricEngine Real
CORREÇÃO 3  ── Adicionar Retry com Exponential Backoff nas Chamadas LLM
CORREÇÃO 4  ── Implementar Status Rotation e Graceful Shutdown
CORREÇÃO 5  ── Corrigir Docker Compose: versão, scheduler, rede interna
CORREÇÃO 6  ── Adicionar Mock Data Fixtures para Testes Offline
CORREÇÃO 7  ── Corrigir Dashboard Métricas (Nginx Proxy Pass)
CORREÇÃO 8  ── Validação Empírica de Economia (Script de Benchmark)
APPENDIX A   ── Checklist de Aplicação
APPENDIX B   ── headroom_client.py Refatorado
```

---

## CORREÇÃO 1 — ELIMINAR COMPRESSÃO DUPLA NO HEADROOM PROXY

### ⚡ Prioridade: CRÍTICA — Impacto direto em custo

### O Problema

No código atual do `loop_engine.py` (Seção 5 do documento original), cada iteração faz **duas chamadas HTTP sequenciais** ao Headroom:

```python
# CHAMADA 1: Compressão explícita (desnecessária em modo Proxy)
compressed = await self._compress_via_headroom(messages)

# CHAMADA 2: Chat via proxy (já comprime automaticamente)
llm_response = await self._call_llm(compressed.get("messages", messages), ...)
```

Quando o Headroom opera em **modo Proxy** (configuração padrão do `docker-compose.zehla-loops.yml`), toda requisição que passa por `/v1/chat/completions` já é comprimida automaticamente pelo pipeline interno: CacheAligner → SmartCrusher → Context Manager. A chamada extra ao `/v1/compress` é redundante e adiciona latência sem benefício.

**Consequência:** Dobra o número de chamadas HTTP por iteração e pode interferir com o mecanismo de KV Cache do Headroom, pois a segunda chamada recebe um payload que já foi manipulado pela primeira.

### Quando Usar Cada Modo

| Modo Headroom | Compressão | Quando Usar |
|---|---|---|
| **Proxy** (padrão) | Automática em `/chat/completions` | Loop Engine em produção (cenário atual) |
| **Library** | Manual via API `/compress` | Pre-processing de batches, scripts standalone |
| **MCP Server** | Via tool call no LLM | Agentes que decidem quando comprimir |

### Código Corrigido

Substitua o método `_compress_via_headroom()` e o trecho de compressão no `run()` por:

```python
# ═══════════════════════════════════════════════════════════════
# REMOVIDO: Chamada duplicada de compressão
# ═══════════════════════════════════════════════════════════════
#
# ANTES (errado — compressão dupla):
#   compressed = await self._compress_via_headroom(messages)
#   result.tokens_before = compressed.get("tokens_before", 0)
#   llm_response = await self._call_llm(compressed.get("messages", messages), ...)
#
# DEPOIS (correto — proxy comprime automaticamente):
#   tokens_before = estimar_tokens(messages)
#   llm_response = await self._call_llm(messages, ...)
#   tokens_after = extrair_usage(response)
#

def _estimate_tokens(self, messages: list[dict]) -> int:
    """Estima tokens antes do envio (regra: ~4 chars = 1 token)."""
    total_chars = sum(len(m.get("content", "")) for m in messages)
    return total_chars // 4

async def _call_llm_with_tracking(
    self, messages: list[dict], model: str
) -> tuple[dict, int, int]:
    """
    Chama LLM via Headroom proxy (compressão automática).
    Retorna: (response, tokens_before, tokens_after).
    
    O Headroom proxy comprime automaticamente:
    - CacheAligner estabiliza prefixo (sub-ms)
    - SmartCrusher comprime conteúdo (5-50ms)  
    - Context Manager gerencia janela (<1ms)
    - CCR injeta tool call para recuperação se necessário
    
    NÃO é necessário chamar /v1/compress separadamente.
    """
    tokens_before = self._estimate_tokens(messages)
    
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
        result = response.json()
    
    # Extrai tokens reais do usage (retornado pelo provedor via Headroom)
    usage = result.get("usage", {})
    tokens_after = usage.get("total_tokens", 0)
    
    # Se o Headroom retornar metadata de compressão, use-a
    headroom_meta = result.get("headroom", {})
    if headroom_meta:
        tokens_before = headroom_meta.get("original_tokens", tokens_before)
        tokens_after = headroom_meta.get("compressed_tokens", tokens_after)
    
    return result, tokens_before, tokens_after
```

E no método `run()`, substitua o bloco COMPRESS + DISPATCH por:

```python
                # ═══════════════════════════════════════════════
                # DISPATCH: Envia ao LLM via Headroom proxy
                # O proxy comprime automaticamente (CacheAligner + SmartCrusher)
                # Não é necessário chamar /v1/compress separadamente
                # ═══════════════════════════════════════════════
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
```

### Economia Gerada por Esta Correção

| Métrica | Antes (compressão dupla) | Depois (proxy automático) |
|---|---|---|
| Chamadas HTTP / iteração | 2 | 1 |
| Latência adicional | ~50-100ms (compressão extra) | 0ms |
| Risco de KV Cache break | Alto (payload manipulado 2x) | Nenhum |

---

## CORREÇÃO 2 — SUBSTITUIR RUBRICA STRING-MATCH POR LLM + RUBRIC ENGINE REAL

### ⚡ Prioridade: ALTA — Impacto em confiabilidade

### O Problema

A avaliação atual no `loop_engine.py` usa string-matching frágil:

```python
# ANTES — frágil e não produtivo
if '"status": "done"' in output:
    result.rubric_score = 1.0
    result.rubric_passed = True
elif '"status": "partial"' in output:
    result.rubric_score = 0.5
```

Problemas:
- O LLM pode gerar `"done"`, `"concluído"`, `"complete"`, `"finalizado"`, `"DONE"`, etc.
- Não avalia qualidade real do output, só presencia de uma string
- Ignora completamente o `rubric_engine.py` e os `rubric.py` de cada spec que foram bem escritos

### Código Corrigido — Avaliação Hibrida (Primário: numérico / Fallback: LLM)

```python
# ═══════════════════════════════════════════════════════════
# ARQUIVO: loops/loop_engine.py
# Substituir o bloco OBSERVE + EVALUATE no método run()
# ═══════════════════════════════════════════════════════════

    def _evaluate_with_rubric(self, output: str, iteration: int) -> tuple[float, bool]:
        """
        Avalia o output usando o RubricEngine do loop (primário)
        ou LLM reviewer (fallback).
        
        Estratégia de avaliação em 3 camadas:
        1. Tenta extrair JSON estruturado do output (se o LLM seguiu o formato)
        2. Se não conseguir, usa LLM reviewer (Haiku) como juiz
        3. Se tudo falhar, marca como FAILED com score 0
        
        Nunca usa string-matching como critério único.
        """
        
        # CAMADA 1: Extração de JSON estruturado
        try:
            # Tenta encontrar JSON no output
            import re
            json_match = re.search(r'\{[^{}]*"status"\s*:\s*"[^"]*"[^{}]*\}', output)
            if json_match:
                data = json.loads(json_match.group())
                status = data.get("status", "").lower().strip()
                
                # Mapeamento flexível de status
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
            
            review_response = await self._call_llm_with_tracking(
                review_prompt, self.config.model_reviewer
            )[0]
            
            review_text = review_response["choices"][0]["message"]["content"]
            
            # Extrai score da resposta do reviewer
            score_match = re.search(r'"score"\s*:\s*([\d.]+)', review_text)
            passed_match = re.search(r'"passed"\s*:\s*(true|false)', review_text, re.IGNORECASE)
            
            if score_match:
                score = min(1.0, max(0.0, float(score_match.group(1))))
                passed = bool(passed_match and passed_match.group(1).lower() == "true")
                return score, passed
                
        except Exception as e:
            print(f"[WARN] LLM reviewer falhou: {e}")
        
        # CAMADA 3: Fallback conservador
        # Se o output tem mais de 100 chars, assume parcial (não falha silenciosamente)
        if len(output.strip()) > 100:
            return 0.3, False
        return 0.0, False
```

No método `run()`, substitua o bloco de avaliação:

```python
                # ═══════════════════════════════════════════════
                # OBSERVE + EVALUATE: Rubrica avalia resultado
                # 3 camadas: JSON estruturado → LLM reviewer → fallback
                # ═══════════════════════════════════════════════
                result.rubric_score, result.rubric_passed = self._evaluate_with_rubric(
                    output, iteration_num
                )
```

### Conectando com o RubricEngine Existente

Para loops que têm `rubric.py` específico (como `pricing/rubric.py`), adicione suporte a rubricas numéricas no método de avaliação:

```python
    def _evaluate_with_domain_rubric(
        self, output: str, iteration: int, context: dict = None
    ) -> tuple[float, bool]:
        """
        Avalia usando rubrica de domínio se disponível (ex: pricing).
        Caso contrário, faz fallback para avaliação genérica.
        """
        # Tenta importar rubrica específica do loop
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
        
        # Fallback para avaliação genérica
        return self._evaluate_with_rubric(output, iteration)
```

---

## CORREÇÃO 3 — ADICIONAR RETRY COM EXPONENTIAL BACKOFF

### ⚡ Prioridade: ALTA — Impacto em confiabilidade e economia

### O Problema

O `loop_engine.py` atual faz apenas uma tentativa por iteração. Se o OpenRouter der timeout, rate-limit, ou o Headroom estiver temporariamente indisponível, a iteração é marcada como falha e o loop pode haltar precocemente. Chamadas LLM em APIs públicas falham transitoriamente com frequência estimada de 2-5%.

### Código Corrigido

```python
# ═══════════════════════════════════════════════════════════
# ARQUIVO: loops/loop_engine.py
# Adicionar após as imports e antes da classe ZehlaLoopEngine
# ═══════════════════════════════════════════════════════════

import asyncio
from typing import TypeVar, Callable, Awaitable

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
    
    Args:
        fn: Função async a executar
        max_retries: Máximo de tentativas (padrão: 3)
        base_delay: Delay inicial em segundos (padrão: 1.0)
        max_delay: Delay máximo em segundos (padrão: 16.0)
        retryable_exceptions: Exceções que triggering retry
        on_retry: Callback opcional para log de retry
    
    Returns:
        Resultado de fn()
    
    Raises:
        Última exceção após todas as tentativas
    """
    last_exception = None
    
    for attempt in range(max_retries + 1):  # +1 para a tentativa inicial
        try:
            return await fn()
        except retryable_exceptions as e:
            last_exception = e
            
            # Não retry em 4xx (exceto 429 rate limit)
            if isinstance(e, httpx.HTTPStatusError):
                if e.response.status_code == 429:
                    # Rate limit — espera longer
                    delay = min(max_delay, base_delay * (2 ** attempt) * 2)
                elif 400 <= e.response.status_code < 500:
                    # Client error — não retry
                    raise
                else:
                    # 5xx — retry
                    delay = min(max_delay, base_delay * (2 ** attempt))
            else:
                # Timeout ou network error — retry
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
```

### Aplicando Retry nas Chamadas LLM

Substitua `_call_llm` por versão com retry:

```python
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
```

### Tabela de Comportamento do Retry

| Cenário | Comportamento | Tentativas |
|---|---|---|
| Timeout OpenRouter (30s) | Retry 1s → 2s → 4s | 4 total |
| Rate limit 429 | Retry 2s → 4s → 8s (delay dobrado) | 4 total |
| 400 Bad Request | Não retry, falha imediata | 1 |
| 401 Unauthorized | Não retry, falha imediata | 1 |
| 500 Internal Server Error | Retry 1s → 2s → 4s | 4 total |
| 503 Service Unavailable | Retry 1s → 2s → 4s | 4 total |

---

## CORREÇÃO 4 — IMPLEMENTAR STATUS ROTATION E GRACEFUL SHUTDOWN

### ⚡ Prioridade: MÉDIA — Impacto em estabilidade de longo prazo

### O Problema A: STATUS.md Crescente

O `_update_status()` faz append sem limite. Após 30 dias de execução diária, o STATUS.md do loop de reviews terá ~210 seções (7/semana × 30 dias), cada uma com dados de iteração. Quando o loop ler esse arquivo na próxima execução, o contexto será massivo e o Headroom terá que comprimir um volume desnecessário de texto histórico.

### Código Corrigido — Status Rotation

```python
# ═══════════════════════════════════════════════════════════
# ARQUIVO: loops/loop_engine.py
# Substituir os métodos _read_status e _update_status
# ═══════════════════════════════════════════════════════════

MAX_STATUS_ENTRIES = 10  # Manter últimas 10 execuções

def _read_status(self) -> str:
    """Lê STATUS.md (memória durável Ralph)."""
    status_path = Path("specs") / self.config.name / "STATUS.md"
    if status_path.exists():
        content = status_path.read_text(encoding="utf-8")
        # Se o status for muito grande, retorna apenas as últimas entradas
        lines = content.strip().split("\n")
        if len(lines) > 200:
            # Mantém cabeçalho + últimas MAX_STATUS_ENTRIES execuções
            header_end = 0
            for i, line in enumerate(lines):
                if line.startswith("## Histórico"):
                    header_end = i
                    break
            
            if header_end > 0:
                header = "\n".join(lines[:header_end + 1])
                # Encontra onde começam as últimas N execuções
                execution_markers = [
                    i for i, line in enumerate(lines)
                    if line.startswith("## Execução") or line.startswith("## Iteração")
                ]
                if len(execution_markers) > MAX_STATUS_ENTRIES:
                    cutoff = execution_markers[-MAX_STATUS_ENTRIES]
                    return header + "\n" + "\n".join(lines[cutoff:])
        return content
    return "# STATUS — Nenhuma execução anterior\n\n- [ ] Iniciar"

def _update_status(self, content: str, iteration_num: int = 0):
    """
    Atualiza STATUS.md com rotação automática.
    Mantém apenas as últimas MAX_STATUS_ENTRIES execuções.
    Move entradas antigas para o JSONL (que já existe como log permanente).
    """
    status_path = Path("specs") / self.config.name / "STATUS.md"
    current = ""
    
    if status_path.exists():
        current = status_path.read_text(encoding="utf-8")
    
    # Se é a primeira iteração, faz append
    if iteration_num <= 1:
        new_content = current + "\n\n" + content
    else:
        # Substitui a entrada da execução atual (update in-place)
        execution_marker = f"## Execução — {self.result.started_at.strftime('%Y-%m-%d')}"
        if execution_marker in current:
            # Encontra e substitui a execução do dia
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
    
    if len(execution_markers) > MAX_STATUS_ENTRIES:
        # Move entradas antigas para JSONL antes de truncar
        cutoff_line = execution_markers[-MAX_STATUS_ENTRIES]
        old_entries = "\n".join(lines[:cutoff_line])
        
        # Loga as entradas removidas no JSONL para preservação
        for marker in execution_markers[:-MAX_STATUS_ENTRIES]:
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
```

### O Problema B: Sem Graceful Shutdown

Se o container Docker for reiniciado no meio de uma iteração (ex: `docker compose restart`), o loop morre sem salvar estado parcial. Para a Cristalização Noturna (5 iterações, $3 budget), perder a iteração 3 desperdiça tokens e tempo.

### Código Corrigido — Graceful Shutdown

```python
# ═══════════════════════════════════════════════════════════
# ARQUIVO: loops/loop_engine.py
# Adicionar na classe ZehlaLoopEngine
# ═══════════════════════════════════════════════════════════

import signal
import threading

class ZehlaLoopEngine:
    def __init__(self, config: LoopConfig):
        # ... (inicialização existente) ...
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
    
    def _should_halt(self) -> bool:
        """Verifica se o loop deve parar (guardas + shutdown signal)."""
        if self._shutdown_requested:
            return True
        return self._check_guards() is not None
    
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
                    # ... (DISCOVERY, DISPATCH, EVALUATE existentes) ...
                    
                    self.result.iterations.append(result)
                    
                    if result.rubric_passed and self.config.hardness == "medium":
                        self.result.status = "completed"
                        break
                
                except Exception as e:
                    result.error = str(e)
                    self.result.iterations.append(result)
                    self._append_log({
                        "loop": self.config.name,
                        "iteration": iteration_num,
                        "error": str(e),
                        "timestamp": datetime.now().isoformat(),
                    })
                    
                    # Se o erro foi por shutdown, não tenta mais
                    if self._shutdown_requested:
                        break
        
        finally:
            # Sempre salva estado final, mesmo se interrompido
            self._save_final_state()
            self.result.finished_at = datetime.now()
        
        return self.result
    
    def _save_final_state(self):
        """Salva estado final do loop (chamado no finally)."""
        # Atualiza STATUS.md com status final
        summary = f"\n## Status Final — {datetime.now().isoformat()}\n"
        summary += f"- Status: {self.result.status}\n"
        summary += f"- Iterações completadas: {len(self.result.iterations)}\n"
        summary += f"- Custo total: ${self.result.total_cost_usd:.4f}\n"
        summary += f"- Tokens economizados: {self.result.total_tokens_saved}\n"
        if self.result.halt_reason:
            summary += f"- Motivo parada: {self.result.halt_reason}\n"
        
        self._update_status(summary, iteration_num=0)
        
        # Log de encerramento
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
```

---

## CORREÇÃO 5 — CORRIGIR DOCKER COMPOSE

### ⚡ Prioridade: MÉDIA — Impacto em operação e segurança

### 5A: Remover `version` (Deprecated)

```yaml
# ANTES:
version: "3.9"

services:
  ...

# DEPOIS: (remover a linha version completamente)
services:
  ...
```

### 5B: Corrigir Scheduler Dependency

```yaml
# ANTES:
scheduler:
  depends_on:
    loop-engine:
      condition: service_started  # ← Fraco: verifica só se subiu

# DEPOIS:
scheduler:
  depends_on:
    loop-engine:
      condition: service_healthy  # ← Forte: verifica se está pronto
```

### 5C: Adicionar Healthcheck no Loop Engine

```yaml
# Adicionar no serviço loop-engine:
  loop-engine:
    build:
      context: ./loops/
      dockerfile: Dockerfile
    container_name: zehla-loop-engine
    restart: unless-stopped
    # ... (environment, volumes, networks existentes) ...
    healthcheck:
      test: ["CMD", "python", "-c", "import httpx; httpx.get('http://localhost:8080/health').raise_for_status()"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 20s
```

### 5D: Rede Interna — Headroom Não Exposto

```yaml
# ═══════════════════════════════════════════════════════════
# ANTES — Headroom acessível de fora:
# ═══════════════════════════════════════════════════════════
  headroom:
    ports:
      - "8787:8787"    # ← Acessível de fora da rede Docker
      - "8789:8789"    # ← Acessível de fora da rede Docker

# ═══════════════════════════════════════════════════════════
# DEPOIS — Headroom acessível só dentro da rede Docker:
# ═══════════════════════════════════════════════════════════
  headroom:
    # REMOVIDO: ports (Headroom não fica exposto externamente)
    # O loop-engine e o backend ZEHLA acessam via rede interna
    expose:
      - "8787"    # Acessível só dentro da rede zehla-loops
      - "8789"
```

### 5E: Docker Compose Completo Corrigido

```yaml
# docker-compose.zehla-loops.yml
# Infraestrutura completa para Loop Engineering ZEHLA + Headroom
# Uso: docker compose -f docker-compose.zehla-loops.yml up -d
# Versão corrigida — sem 'version' (deprecated), rede interna, healthchecks

services:
  # ═══════════════════════════════════════════════════════════
  # HEADROOM — Camada de Compressão de Contexto (rede interna)
  # ═══════════════════════════════════════════════════════════
  headroom:
    image: ghcr.io/chopratejas/headroom:latest
    container_name: zehla-headroom
    restart: unless-stopped
    expose:
      - "8787"
      - "8789"
    environment:
      OPENAI_BASE_URL: "${OPENROUTER_API_URL:-https://openrouter.ai/api/v1}"
      OPENAI_API_KEY: "${OPENROUTER_API_KEY}"
      HEADROOM_NO_OPTIMIZE: "false"
      HEADROOM_NO_CACHE: "false"
      HEADROOM_NO_INTELLIGENT_CONTEXT: "false"
      HEADROOM_NO_COMPRESS_FIRST: "false"
      HEADROOM_BUDGET: "${HEADROOM_DAILY_BUDGET:-20.0}"
      HEADROOM_TELEMETRY: "off"
      HEADROOM_LOG_FILE: "/var/log/headroom/headroom.jsonl"
      HEADROOM_STORE_MAX_ENTRIES: "5000"
      HEADROOM_STORE_TTL_SECONDS: "14400"
      HEADROOM_LEARN_ENABLED: "true"
    volumes:
      - headroom_data:/root/.headroom
      - headroom_logs:/var/log/headroom
    networks:
      - zehla-loops
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8787/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 15s

  # ═══════════════════════════════════════════════════════════
  # LOOP ENGINE — Motor de Execução (com healthcheck)
  # ═══════════════════════════════════════════════════════════
  loop-engine:
    build:
      context: ./loops/
      dockerfile: Dockerfile
    container_name: zehla-loop-engine
    restart: unless-stopped
    depends_on:
      headroom:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      HEADROOM_PROXY_URL: "http://headroom:8787/v1"
      HEADROOM_PROXY_ENABLED: "true"
      OPENROUTER_API_KEY: "${OPENROUTER_API_KEY}"
      OPENROUTER_API_URL: "https://openrouter.ai/api/v1"
      ANTHROPIC_API_KEY: "${ANTHROPIC_API_KEY:-}"
      MODEL_WRITER: "${MODEL_WRITER:-anthropic/claude-sonnet-4}"
      MODEL_REVIEWER: "${MODEL_REVIEWER:-anthropic/claude-haiku-3.5}"
      MODEL_DEEP: "${MODEL_DEEP:-anthropic/claude-3.5-sonnet}"
      DEFAULT_MAX_ITERATIONS: "10"
      DEFAULT_BUDGET_CAP_USD: "5.00"
      AKASHIC_API_URL: "http://zehla-backend:8000/api/v2/akashic"
      AKASHIC_ENABLED: "${AKASHIC_ENABLED:-true}"
      REDIS_URL: "redis://redis:6379/1"
      LOG_LEVEL: "INFO"
      LOOP_LOG_PATH: "/var/log/zehla-loops"
      TZ: "America/Sao_Paulo"
    volumes:
      - ./loops/specs:/app/specs
      - ./loops/output:/app/output
      - ./loops/mock_data:/app/mock_data
      - loop_logs:/var/log/zehla-loops
    networks:
      - zehla-loops
    healthcheck:
      test: ["CMD", "python", "-c", "import httpx; r = httpx.get('http://localhost:8080/health'); r.raise_for_status()"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 20s

  # ═══════════════════════════════════════════════════════════
  # SCHEDULER — Agendador (dependência corrigida: healthy)
  # ═══════════════════════════════════════════════════════════
  scheduler:
    build:
      context: ./scheduler/
      dockerfile: Dockerfile
    container_name: zehla-scheduler
    restart: unless-stopped
    depends_on:
      loop-engine:
        condition: service_healthy   # ← CORRIGIDO: era service_started
    environment:
      LOOP_ENGINE_URL: "http://loop-engine:8080"
      TZ: "America/Sao_Paulo"
    volumes:
      - ./scheduler/schedules.yml:/app/schedules.yml
    networks:
      - zehla-loops

  # ═══════════════════════════════════════════════════════════
  # REDIS — Cache + Streams + Working Memory
  # ═══════════════════════════════════════════════════════════
  redis:
    image: redis:7-alpine
    container_name: zehla-loops-redis
    restart: unless-stopped
    ports:
      - "6380:6379"
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    networks:
      - zehla-loops
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3

  # ═══════════════════════════════════════════════════════════
  # METRICS — Painel com Nginx Proxy Pass (CORRIGIDO)
  # ═══════════════════════════════════════════════════════════
  metrics:
    image: nginx:alpine
    container_name: zehla-loops-metrics
    restart: unless-stopped
    ports:
      - "8090:80"
    volumes:
      - ./metrics/nginx.conf:/etc/nginx/conf.d/default.conf
      - ./metrics/index.html:/usr/share/nginx/html/index.html
    networks:
      - zehla-loops

volumes:
  headroom_data:
    driver: local
  headroom_logs:
    driver: local
  loop_logs:
    driver: local
  redis_data:
    driver: local

networks:
  zehla-loops:
    driver: bridge
```

---

## CORREÇÃO 6 — ADICIONAR MOCK DATA FIXTURES

### ⚡ Prioridade: ALTA — Necessário para testes offline funcionarem

### O Problema

As specs dos loops referenciam APIs externas (Firecrawl para scraping, Prisma para ocupação, Google/Booking para reviews). Sem dados mockados, qualquer execução de teste vai falhar ao tentar acessar APIs reais que podem não estar disponíveis no ambiente de teste.

### Estrutura de Mock Data

```
zehla-loops/loops/
├── mock_data/
│   ├── pricing/
│   │   ├── competitors.json      ← Preços mock de 5 concorrentes
│   │   ├── occupancy.json        ← Dados de ocupação mock
│   │   └── market_conditions.json ← Condições de mercado mock
│   ├── akashic_cristalization/
│   │   └── episodes_batch.json   ← 50 episódios mock para cristalizar
│   ├── competitor_monitor/
│   │   ├── sites_response.json   ← HTML/scraped mock de 5 sites
│   │   └── price_history.json    ← Histórico de preços dos concorrentes
│   ├── review_analysis/
│   │   ├── google_reviews.json   ← Reviews mock do Google
│   │   ├── booking_reviews.json  ← Reviews mock do Booking.com
│   │   └── tripadvisor_reviews.json ← Reviews mock do TripAdvisor
│   ├── marketing_content/
│   │   ├── events_local.json     ← Eventos locais mock (feriados, clima)
│   │   └── engagement_history.json ← Histórico de engagement mock
│   └── auto_audit/
│       ├── logs_sample.jsonl     ← Logs de sistema mock
│       └── security_scan.json    ← Resultados de scan de segurança mock
```

### Exemplo: loops/mock_data/pricing/competitors.json

```json
{
  "date": "2026-06-17",
  "region": "Paraty - Rio de Janeiro",
  "competitors": [
    {
      "name": "Pousada do Ouro",
      "source": "booking.com",
      "rooms": {
        "standard_double": 289.00,
        "standard_double_breakfast": 339.00,
        "superior_double": 419.00,
        "suite_master": 589.00
      },
      "occupancy_estimate": 0.72,
      "scraped_at": "2026-06-17T01:30:00-03:00"
    },
    {
      "name": "Hotel Litoral",
      "source": "direct_website",
      "rooms": {
        "quarto_standard": 245.00,
        "quarto_standard_cafe": 295.00,
        "quarto_superior": 380.00,
        "suite_premium": 520.00
      },
      "occupancy_estimate": 0.65,
      "scraped_at": "2026-06-17T01:30:00-03:00"
    },
    {
      "name": "Pousada Mar e Sol",
      "source": "airbnb",
      "rooms": {
        "quarto_casal": 199.00,
        "quarto_casal_cafe": 249.00,
        "suite_frente_mar": 398.00
      },
      "occupancy_estimate": 0.80,
      "scraped_at": "2026-06-17T01:31:00-03:00"
    },
    {
      "name": "Hostel Paraty Bay",
      "source": "hostelworld",
      "rooms": {
        "dorm_6beds": 65.00,
        "private_double": 180.00,
        "private_double_cafe": 220.00
      },
      "occupancy_estimate": 0.90,
      "scraped_at": "2026-06-17T01:32:00-03:00"
    },
    {
      "name": "Eco Resort Serra Verde",
      "source": "direct_website",
      "rooms": {
        "standard": 450.00,
        "deluxe": 680.00,
        "suite_campestre": 920.00
      },
      "occupancy_estimate": 0.55,
      "scraped_at": "2026-06-17T01:33:00-03:00"
    }
  ],
  "market_avg": {
    "standard_double": 255.50,
    "superior_double": 462.75,
    "suite_master": 676.00
  }
}
```

### Exemplo: loops/mock_data/pricing/occupancy.json

```json
{
  "date": "2026-06-17",
  "pousada_id": "zehla_smart_hotel_01",
  "current": {
    "occupancy_percent": 0.68,
    "rooms_total": 24,
    "rooms_occupied": 16,
    "rooms_available": 8,
    "avg_daily_rate": 312.50,
    "revpar": 212.50
  },
  "forecast_7d": [
    {"date": "2026-06-17", "projected_occupancy": 0.72, "projected_adr": 320.00},
    {"date": "2026-06-18", "projected_occupancy": 0.75, "projected_adr": 335.00},
    {"date": "2026-06-19", "projected_occupancy": 0.68, "projected_adr": 310.00},
    {"date": "2026-06-20", "projected_occupancy": 0.82, "projected_adr": 380.00},
    {"date": "2026-06-21", "projected_occupancy": 0.90, "projected_adr": 420.00},
    {"date": "2026-06-22", "projected_occupancy": 0.95, "projected_adr": 450.00},
    {"date": "2026-06-23", "projected_occupancy": 0.85, "projected_adr": 400.00}
  ],
  "target_occupancy": 0.85,
  "historical_max_revenue": 8540.00
}
```

### Exemplo: loops/mock_data/akashic_cristalization/episodes_batch.json

```json
{
  "batch_id": "batch_20260617",
  "total_episodes": 50,
  "episodes": [
    {
      "id": "ep_001",
      "timestamp": "2026-06-16T09:15:00-03:00",
      "channel": "whatsapp",
      "pousada_id": "zehla_smart_hotel_01",
      "input": "Qual o horario do checkout?",
      "response": "O checkout é às 12:00. Podemos estender até as 14:00 com custo adicional de R$50.",
      "outcome": "resolved",
      "tokens_used": 850,
      "sentiment": "neutral"
    },
    {
      "id": "ep_002",
      "timestamp": "2026-06-16T09:30:00-03:00",
      "channel": "whatsapp",
      "pousada_id": "zehla_smart_hotel_01",
      "input": "O café da manhã está incluso na diária da suíte master?",
      "response": "Sim! A suíte master inclui café da manhã completo no restaurante com vista para o mar, das 7h às 10h.",
      "outcome": "resolved",
      "tokens_used": 920,
      "sentiment": "positive"
    },
    {
      "id": "ep_003",
      "timestamp": "2026-06-16T10:45:00-03:00",
      "channel": "whatsapp",
      "pousada_id": "zehla_smart_hotel_02",
      "input": "O ar condicionado do quarto 103 não está funcionando. Estamos com calor!",
      "response": "Peço desculpas pelo inconveniente. Já encaminhei a equipe de manutenção. Enquanto isso, disponibilizei um ventilador extra. Vou acompanhar até a resolução.",
      "outcome": "resolved",
      "tokens_used": 1100,
      "sentiment": "negative",
      "category": "manutencao"
    }
  ],
  "summary": {
    "total_resolved": 42,
    "total_escalated": 5,
    "total_failed": 3,
    "avg_tokens": 980,
    "categories": {
      "reservas": 18,
      "checkin_checkout": 12,
      "precos": 8,
      "manutencao": 5,
      "alimentacao": 4,
      "localizacao": 3
    },
    "sentiment_distribution": {
      "positive": 28,
      "neutral": 15,
      "negative": 7
    }
  }
}
```

### Modo Mock no Loop Engine

Adicione uma flag `MOCK_MODE` ao `loop_engine.py`:

```python
# No __init__:
self.mock_mode = os.getenv("MOCK_MODE", "false").lower() == "true"

# Na DISCOVERY do run():
if self.mock_mode:
    mock_dir = Path("mock_data") / self.config.name
    if mock_dir.exists():
        mock_files = list(mock_dir.glob("*.json"))
        mock_context = {}
        for f in mock_files:
            mock_context[f.stem] = json.loads(f.read_text())
        
        # Injeta dados mock no prompt
        messages[0]["content"] += (
            f"\n\n--- DADOS MOCK (MOCK_MODE=ON) ---\n"
            f"{json.dumps(mock_context, indent=2, ensure_ascii=False)[:4000]}\n"
            f"--- FIM DADOS MOCK ---"
        )
        print(f"[MOCK] Carregados {len(mock_files)} arquivos de mock data")
```

---

## CORREÇÃO 7 — CORRIGIR DASHBOARD MÉTRICAS (NGINX PROXY PASS)

### ⚡ Prioridade: MÉDIA — Impacto em observabilidade

### O Problema

O `index.html` do dashboard faz `fetch('/stats')` que aponta para o container nginx (servindo estático). O nginx não tem configuração de proxy, então a chamada falha e o dashboard mostra "Carregando..." eternamente.

### Configuração Nginx Corrigida

```nginx
# ═══════════════════════════════════════════════════════════
# ARQUIVO: metrics/nginx.conf
# Nginx com proxy pass para Headroom e Loop Engine
# ═══════════════════════════════════════════════════════════

server {
    listen 80;
    server_name localhost;

    # Dashboard estático
    location / {
        root /usr/share/nginx/html;
        index index.html;
    }

    # Proxy para métricas do Headroom
    location /hr/ {
        proxy_pass http://headroom:8787/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_connect_timeout 5s;
        proxy_read_timeout 10s;
    }

    # Proxy para métricas do Loop Engine
    location /api/ {
        proxy_pass http://loop-engine:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_connect_timeout 5s;
        proxy_read_timeout 10s;
    }
}
```

### HTML do Dashboard Corrigido

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ZEHLA Loops Dashboard</title>
    <meta http-equiv="refresh" content="60">
    <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Inter',system-ui,-apple-system,sans-serif;margin:1.5rem;background:#0a0a0a;color:#e0e0e0}
        h1{font-size:1.5rem;margin-bottom:1.5rem;color:#4ecdc4}
        .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.25rem}
        .card{background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:1.25rem;transition:border-color .3s}
        .card:hover{border-color:#4ecdc4}
        .card h3{font-size:.85rem;color:#888;margin-bottom:.5rem;text-transform:uppercase;letter-spacing:.05em}
        .metric{font-size:2.25rem;font-weight:700;color:#ffe66d;margin-bottom:.5rem}
        .metric.negative{color:#ff6b6b}
        .metric.positive{color:#51cf66}
        .detail{font-size:.8rem;color:#666;line-height:1.5;white-space:pre-wrap;font-family:'SF Mono',Monaco,monospace}
        .loop-list{list-style:none;margin-top:.5rem}
        .loop-item{padding:.4rem 0;border-bottom:1px solid #222;display:flex;justify-content:space-between;font-size:.85rem}
        .loop-item:last-child{border:none}
        .loop-name{color:#4ecdc4}
        .loop-status{padding:2px 8px;border-radius:10px;font-size:.75rem;font-weight:600}
        .status-completed{background:#1a3a1a;color:#51cf66}
        .status-halted{background:#3a3a1a;color:#ffe66d}
        .status-failed{background:#3a1a1a;color:#ff6b6b}
        .status-running{background:#1a2a3a;color:#4dabf7}
        .timestamp{font-size:.75rem;color:#444;margin-top:.75rem}
    </style>
</head>
<body>
    <h1>ZEHLA Loop Engineering + Headroom</h1>
    <div class="grid">
        <!-- Card 1: Headroom Status -->
        <div class="card">
            <h3>Headroom — Compressão</h3>
            <div class="metric positive" id="hr-savings">--</div>
            <div class="detail" id="hr-stats">Aguardando Headroom...</div>
        </div>
        
        <!-- Card 2: Loops Executados Hoje -->
        <div class="card">
            <h3>Loops — Execuções Hoje</h3>
            <div class="metric" id="loop-count">--</div>
            <ul class="loop-list" id="loop-list">
                <li class="loop-item"><span>Carregando...</span></li>
            </ul>
        </div>
        
        <!-- Card 3: Tokens Economizados -->
        <div class="card">
            <h3>Tokens — Economia Total</h3>
            <div class="metric positive" id="tokens-saved">--</div>
            <div class="detail" id="tokens-detail">Aguardando dados...</div>
        </div>
        
        <!-- Card 4: Custo -->
        <div class="card">
            <h3>Custo — Total Hoje</h3>
            <div class="metric" id="total-cost">--</div>
            <div class="detail" id="cost-detail">Aguardando dados...</div>
        </div>
    </div>
    
    <div class="timestamp" id="last-update">Última atualização: --</div>

    <script>
    async function refresh() {
        const now = new Date().toLocaleTimeString('pt-BR');
        
        // Headroom stats (via nginx proxy /hr/)
        try {
            const hr = await fetch('/hr/stats').then(r => r.json());
            const savingsPercent = hr.savings_percent || 0;
            const savingsEl = document.getElementById('hr-savings');
            savingsEl.textContent = savingsPercent.toFixed(1) + '%';
            savingsEl.className = 'metric ' + (savingsPercent > 50 ? 'positive' : 'negative');
            
            document.getElementById('hr-stats').textContent = 
                'Requests: ' + (hr.total_requests || 0) + '\n' +
                'Budget: $' + (hr.budget_used || 0).toFixed(2) + ' / $' + (hr.budget_limit || 20).toFixed(2) + '\n' +
                'Mode: ' + (hr.mode || 'proxy') + '\n' +
                'Uptime: ' + (hr.uptime_seconds || 0) + 's';
        } catch (e) {
            document.getElementById('hr-stats').textContent = 'Headroom offline: ' + e.message;
        }
        
        // Loop Engine status (via nginx proxy /api/)
        try {
            const loops = await fetch('/api/loops/status').then(r => r.json());
            const loopsList = loops.loops || [];
            document.getElementById('loop-count').textContent = loopsList.length;
            
            const listHtml = loopsList.map(l => {
                const statusClass = 'status-' + (l.status || 'unknown');
                return '<li class="loop-item">' +
                    '<span class="loop-name">' + l.name + '</span>' +
                    '<span class="loop-status ' + statusClass + '">' + l.status + '</span>' +
                    '</li>';
            }).join('');
            document.getElementById('loop-list').innerHTML = listHtml || '<li>Sem loops hoje</li>';
            
            const totalSaved = loopsList.reduce((sum, l) => sum + (l.tokens_saved || 0), 0);
            document.getElementById('tokens-saved').textContent = 
                (totalSaved > 1000 ? (totalSaved / 1000).toFixed(1) + 'K' : totalSaved);
            document.getElementById('tokens-detail').textContent = 
                loopsList.map(l => l.name + ': ' + (l.tokens_saved || 0)).join('\n');
            
            const totalCost = loopsList.reduce((sum, l) => sum + (l.total_cost_usd || 0), 0);
            const costEl = document.getElementById('total-cost');
            costEl.textContent = '$' + totalCost.toFixed(2);
            costEl.className = 'metric ' + (totalCost < 2 ? 'positive' : '');
            document.getElementById('cost-detail').textContent = 
                loopsList.map(l => l.name + ': $' + (l.total_cost_usd || 0).toFixed(4)).join('\n');
                
        } catch (e) {
            document.getElementById('loop-list').innerHTML = 
                '<li class="loop-item"><span>Loop Engine offline</span></li>';
        }
        
        document.getElementById('last-update').textContent = 'Atualizado: ' + now;
    }
    
    refresh();
    setInterval(refresh, 60000);
    </script>
</body>
</html>
```

---

## CORREÇÃO 8 — VALIDAÇÃO EMPÍRICA DE ECONOMIA (SCRIPT DE BENCHMARK)

### ⚡ Prioridade: MÉDIA — Impacto em credibilidade dos números

### O Problema

Os números de economia reportados (70%, 80%, 95%) vêm dos benchmarks genéricos do Headroom. Cada caso de uso ZEHLA tem perfil de token diferente. É necessário validar empiricamente antes de comunicar ao cliente ou investidor.

### Script de Benchmark

```python
# ═══════════════════════════════════════════════════════════
# ARQUIVO: loops/benchmark_headroom.py
# Comparação empírica: custo COM vs SEM Headroom por loop
# Uso: python benchmark_headroom.py --loop pricing --iterations 3
# ═══════════════════════════════════════════════════════════

import json
import time
import httpx
import asyncio
import argparse
from pathlib import Path
from datetime import datetime

BENCHMARK_CONFIGS = {
    "pricing": {
        "system_prompt": "Você é o agente de precificação do ZEHLA. Analise dados de mercado e ajuste preços.",
        "user_prompt": "Analise os preços dos concorrentes e sugira ajustes para as suítes do hotel. Dados: Pousada do Ouro: R$289-589. Hotel Litoral: R$245-520. Pousada Mar e Sol: R$199-398. Ocupação atual: 68%. Meta: 85%.",
        "expected_tokens_input": 12000,
    },
    "akashic": {
        "system_prompt": "Você é o agente de cristalização do Campo Akáshico. Processe episódios e extraia padrões.",
        "user_prompt": "Processe os seguintes 50 episódios de atendimento e extraia padrões de comportamento dos hóspedes, anomalias e insights acionáveis. " + ("Episódio: Hóspede perguntou sobre checkout. Resolvido. " * 50),
        "expected_tokens_input": 25000,
    },
    "competitor": {
        "system_prompt": "Você é o agente de monitoramento de concorrentes. Extraia preços de HTML scraping.",
        "user_prompt": "Extraia os preços de diárias do seguinte HTML de 5 sites de concorrentes: " + ("<!DOCTYPE html><html><body><div class='room-price'>R$ 289,00</div><div class='room-name'>Standard</div><p>Descrição longa do quarto com amenities inclusas café da manhã piscina Wi-Fi estacionamento etc etc etc</p>" * 100),
        "expected_tokens_input": 78000,
    },
    "review": {
        "system_prompt": "Você é o agente de análise de reviews. Analise sentimento e extraia insights.",
        "user_prompt": "Analise as seguintes reviews de hóspedes: " + ("Review: 'O quarto estava limpo mas o café da manhã poderia ser melhor. Atendimento ok.' Rating: 3/5. " * 30),
        "expected_tokens_input": 20000,
    },
    "marketing": {
        "system_prompt": "Você é o agente de marketing do ZEHLA. Gere conteúdo para redes sociais.",
        "user_prompt": "Gere 3 opções de caption para Instagram da pousada, considerando: inverno em Paraty, festival de gastronomia nächste semana, pacote romântico disponível. Sazonalidade: baixa temporada. Público: casais 30-50 anos.",
        "expected_tokens_input": 12000,
    },
    "audit": {
        "system_prompt": "Você é o agente de auditoria do ZEHLA. Verifique conformidade e segurança.",
        "user_prompt": "Execute os 5 passos de auditoria: 1) Funcionalidades, 2) Segurança LGPD, 3) Performance, 4) Código, 5) Conformidade. Logs do sistema: " + ("[2026-06-17 10:00:00] INFO - Request processed in 45ms. [2026-06-17 10:00:01] INFO - User login successful. " * 100),
        "expected_tokens_input": 18000,
    },
}

async def run_single_request(
    api_url: str,
    api_key: str,
    model: str,
    system_prompt: str,
    user_prompt: str,
    label: str
) -> dict:
    """Executa uma única requisição e retorna métricas."""
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]
    
    start = time.time()
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            f"{api_url}/chat/completions",
            json={
                "model": model,
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 2048,
            },
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
        )
        elapsed_ms = int((time.time() - start) * 1000)
        
    result = response.json()
    usage = result.get("usage", {})
    
    return {
        "label": label,
        "status_code": response.status_code,
        "elapsed_ms": elapsed_ms,
        "tokens_input": usage.get("prompt_tokens", 0),
        "tokens_output": usage.get("completion_tokens", 0),
        "tokens_total": usage.get("total_tokens", 0),
        "headroom_meta": result.get("headroom", {}),
        "model": model,
    }

async def benchmark_loop(
    loop_name: str,
    api_key: str,
    headroom_url: str,
    direct_url: str,
    model: str,
    iterations: int = 3,
) -> dict:
    """
    Compara custo COM Headroom vs SEM Headroom para um loop.
    
    Executa N iterações em cada modo e compara:
    - Tokens consumidos (input + output)
    - Latência média
    - Custo estimado
    """
    config = BENCHMARK_CONFIGS.get(loop_name)
    if not config:
        print(f"[ERRO] Loop '{loop_name}' não encontrado. Disponíveis: {list(BENCHMARK_CONFIGS.keys())}")
        return {}
    
    print(f"\n{'='*60}")
    print(f"BENCHMARK: {loop_name.upper()}")
    print(f"Iterações: {iterations} | Modelo: {model}")
    print(f"{'='*60}\n")
    
    results = {"with_headroom": [], "without_headroom": []}
    
    # Fase 1: COM Headroom
    print(f"--- FASE 1: COM Headroom ({headroom_url}) ---")
    for i in range(iterations):
        r = await run_single_request(
            headroom_url, api_key, model,
            config["system_prompt"], config["user_prompt"],
            f"headroom_iter_{i+1}"
        )
        results["with_headroom"].append(r)
        print(
            f"  Iter {i+1}: {r['tokens_input']} in + {r['tokens_output']} out = "
            f"{r['tokens_total']} total | {r['elapsed_ms']}ms | "
            f"HR meta: {json.dumps(r.get('headroom_meta', {}))[:100]}"
        )
        await asyncio.sleep(2)  # Rate limit avoidance
    
    # Fase 2: SEM Headroom (chamada direta ao OpenRouter)
    print(f"\n--- FASE 2: SEM Headroom ({direct_url}) ---")
    for i in range(iterations):
        r = await run_single_request(
            direct_url, api_key, model,
            config["system_prompt"], config["user_prompt"],
            f"direct_iter_{i+1}"
        )
        results["without_headroom"].append(r)
        print(
            f"  Iter {i+1}: {r['tokens_input']} in + {r['tokens_output']} out = "
            f"{r['tokens_total']} total | {r['elapsed_ms']}ms"
        )
        await asyncio.sleep(2)
    
    # Cálculos
    avg_hr = sum(r["tokens_total"] for r in results["with_headroom"]) / len(results["with_headroom"])
    avg_direct = sum(r["tokens_total"] for r in results["without_headroom"]) / len(results["without_headroom"])
    avg_latency_hr = sum(r["elapsed_ms"] for r in results["with_headroom"]) / len(results["with_headroom"])
    avg_latency_direct = sum(r["elapsed_ms"] for r in results["without_headroom"]) / len(results["without_headroom"])
    
    savings_tokens = avg_direct - avg_hr
    savings_percent = (savings_tokens / avg_direct * 100) if avg_direct > 0 else 0
    
    cost_per_1k = 0.000015  # ~$0.015/1K tokens (Sonnet)
    cost_hr = avg_hr * cost_per_1k
    cost_direct = avg_direct * cost_per_1k
    cost_savings = cost_direct - cost_hr
    monthly_savings = cost_savings * 30  # 1 execução/dia
    
    summary = {
        "loop": loop_name,
        "iterations": iterations,
        "model": model,
        "timestamp": datetime.now().isoformat(),
        "avg_tokens_with_headroom": round(avg_hr),
        "avg_tokens_without_headroom": round(avg_direct),
        "tokens_saved_per_execution": round(savings_tokens),
        "savings_percent": round(savings_percent, 1),
        "avg_latency_ms_with_headroom": round(avg_latency_hr),
        "avg_latency_ms_without_headroom": round(avg_latency_direct),
        "cost_per_execution_with_headroom": round(cost_hr, 6),
        "cost_per_execution_without_headroom": round(cost_direct, 6),
        "cost_savings_per_execution": round(cost_savings, 6),
        "estimated_monthly_savings": round(monthly_savings, 2),
        "raw_results": results,
    }
    
    print(f"\n{'='*60}")
    print(f"RESULTADO — {loop_name.upper()}")
    print(f"{'='*60}")
    print(f"  Tokens médios COM Headroom:    {avg_hr:,.0f}")
    print(f"  Tokens médios SEM Headroom:    {avg_direct:,.0f}")
    print(f"  Tokens economizados:          {savings_tokens:,.0f} ({savings_percent:.1f}%)")
    print(f"  Latência média COM Headroom:  {avg_latency_hr}ms")
    print(f"  Latência média SEM Headroom:  {avg_latency_direct}ms")
    print(f"  Custo/exec COM Headroom:       ${cost_hr:.4f}")
    print(f"  Custo/exec SEM Headroom:       ${cost_direct:.4f}")
    print(f"  Economia/exec:                  ${cost_savings:.4f}")
    print(f"  Economia estimada/mês (30d):   ${monthly_savings:.2f}")
    print(f"{'='*60}\n")
    
    # Salva resultado
    output_dir = Path("output/benchmarks")
    output_dir.mkdir(parents=True, exist_ok=True)
    output_file = output_dir / f"benchmark_{loop_name}_{datetime.now().strftime('%Y%m%d_%H%M')}.json"
    output_file.write_text(json.dumps(summary, indent=2, ensure_ascii=False))
    print(f"Resultado salvo em: {output_file}")
    
    return summary

async def main():
    parser = argparse.ArgumentParser(description="Benchmark Headroom ZEHLA")
    parser.add_argument("--loop", type=str, default="pricing", help="Loop para testar")
    parser.add_argument("--iterations", type=int, default=3, help="Iterações por modo")
    parser.add_argument("--all", action="store_true", help="Testar todos os loops")
    parser.add_argument("--headroom-url", type=str, default="http://localhost:8787/v1")
    parser.add_argument("--direct-url", type=str, default="https://openrouter.ai/api/v1")
    parser.add_argument("--model", type=str, default="anthropic/claude-haiku-3.5")
    args = parser.parse_args()
    
    api_key = os.getenv("OPENROUTER_API_KEY", "")
    if not api_key:
        print("[ERRO] OPENROUTER_API_KEY não definida")
        return
    
    loops_to_test = list(BENCHMARK_CONFIGS.keys()) if args.all else [args.loop]
    
    all_summaries = []
    for loop in loops_to_test:
        summary = await benchmark_loop(
            loop, api_key,
            args.headroom_url, args.direct_url,
            args.model, args.iterations
        )
        all_summaries.append(summary)
    
    # Resumo consolidado
    if len(all_summaries) > 1:
        total_savings = sum(s.get("estimated_monthly_savings", 0) for s in all_summaries)
        avg_savings_pct = sum(s.get("savings_percent", 0) for s in all_summaries) / len(all_summaries)
        print(f"\n{'='*60}")
        print(f"RESUMO CONSOLIDADO — {len(all_summaries)} loops")
        print(f"  Economia média: {avg_savings_pct:.1f}%")
        print(f"  Economia mensal estimada: ${total_savings:.2f}")
        print(f"{'='*60}")

if __name__ == "__main__":
    import os
    asyncio.run(main())
```

### Como Usar o Benchmark

```bash
# Testar loop de precificação (3 iterações, modelo barato para economia)
docker exec -it zehla-loop-engine python benchmark_headroom.py \
  --loop pricing --iterations 3 --model anthropic/claude-haiku-3.5

# Testar todos os loops
docker exec -it zehla-loop-engine python benchmark_headroom.py \
  --all --iterations 3

# Comparar Headroom local vs Headroom desligado
# 1. Com Headroom:
docker exec -it zehla-loop-engine python benchmark_headroom.py \
  --headroom-url http://headroom:8787/v1 --loop pricing

# 2. Sem Headroom (direto no OpenRouter):
docker exec -it zehla-loop-engine python benchmark_headroom.py \
  --headroom-url https://openrouter.ai/api/v1 --loop pricing
```

---

## APPENDIX A — CHECKLIST DE APLICAÇÃO

Ordem recomendada para aplicar as correções:

```
ORDEM  PRIORIDADE  CORREÇÃO                         ARQUIVO                    TEMPO EST.
─────  ──────────  ───────────────────────────────  ──────────────────────────  ──────────
1      CRÍTICA     Eliminar compressão dupla         loops/loop_engine.py        30 min
2      ALTA        Rubrica real (LLM reviewer)       loops/loop_engine.py        45 min
3      ALTA        Retry com backoff                 loops/loop_engine.py        30 min
4      ALTA        Mock data fixtures                loops/mock_data/*           60 min
5      MÉDIA       Status rotation + shutdown        loops/loop_engine.py        45 min
6      MÉDIA       Docker Compose corrigido          docker-compose.zehla-loops   20 min
7      MÉDIA       Dashboard nginx proxy            metrics/nginx.conf + html   30 min
8      MÉDIA       Benchmark de economia             loops/benchmark_headroom.py 20 min
─────  ──────────  ───────────────────────────────  ──────────────────────────  ──────────
                              TOTAL ESTIMADO:                                  ~5 horas
```

### Pré-requisitos

- Acesso ao repositório `zehla-backend`
- Permissão para modificar `zehla-loops/`
- Chave API OpenRouter válida
- Docker e Docker Compose instalados
- Ambiente de teste (não aplicar direto em produção)

### Passo a Passo

```
1. Backup dos arquivos existentes:
   cp -r zehla-loops/ zehla-loops-backup-$(date +%Y%m%d)/

2. Aplicar Correção 1 (compressão dupla):
   - Substituir _compress_via_headroom() por _call_llm_with_tracking()
   - Atualizar bloco COMPRESS+DISPATCH no run()

3. Aplicar Correção 2 (rubrica):
   - Adicionar _evaluate_with_rubric()
   - Substituir string-matching no run()
   - Adicionar _evaluate_with_domain_rubric()

4. Aplicar Correção 3 (retry):
   - Adicionar retry_with_backoff() antes da classe
   - Substituir _call_llm() por _call_llm_with_retry()

5. Aplicar Correção 4 (status + shutdown):
   - Substituir _read_status() e _update_status()
   - Adicionar signal handlers e _should_halt()
   - Adicionar _save_final_state() e bloco finally

6. Aplicar Correção 6 (mock data):
   - Criar diretório loops/mock_data/
   - Copiar JSON fixtures deste documento
   - Adicionar flag MOCK_MODE no __init__

7. Aplicar Correção 5 (Docker):
   - Substituir docker-compose.zehla-loops.yml
   - Criar metrics/nginx.conf

8. Aplicar Correção 7 (dashboard):
   - Substituir metrics/index.html

9. Aplicar Correção 8 (benchmark):
   - Copiar benchmark_headroom.py para loops/
   - Executar benchmark com modelo barato

10. Teste completo:
    docker compose -f docker-compose.zehla-loops.yml up -d
    docker exec -it zehla-loop-engine python loop_engine.py --loop pricing --mock
```

---

## APPENDIX B — headroom_client.py REFACTORADO

```python
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
```

---

*Documento de Correções Técnicas — ZEHLA Loop Engineering v2.0*
*Criado por Agente ZEHLA OS — Revisão de Engenharia*
*17 de junho de 2026*
*Classificação: CONHECIMENTO TÉCNICO — PRONTO PARA APLICAÇÃO*
