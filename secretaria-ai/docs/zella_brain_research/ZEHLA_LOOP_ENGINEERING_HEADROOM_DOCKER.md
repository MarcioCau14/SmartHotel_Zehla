# ZEHLA LOOP ENGINEERING + HEADROOM — Documento de Implementação

**Versão:** 2.0 — Loop Engineering com Headroom via Docker
**Data:** 17 de junho de 2026
**Classificação:** CONHECIMENTO ESTRATÉGICO — Documento Nuclear ZEHLA
**Autoria:** Agente ZEHLA OS — Arquitetura Profunda
**Conceitos cruzados:** Looping Engineering × Headroom × Campo Akáshico × ZAOS 5 Pilares
**Status:** PRONTO PARA TESTES REAIS via Google Antigravity + Docker
**Depende de:** `ZEHLA_HEADROOM_Plano_Implementacao_Completo.md` + `LOOPING_ENGINEERING_PESQUISA_COMPLETA.md`

---

## SUMÁRIO

```
SEÇÃO 1  ── Visão Unificada: Looping Engineering + Headroom no ZEHLA
SEÇÃO 2  ── O Loop ZEHLA: Arquitetura com Headroom Embutido
SEÇÃO 3  ── Docker Compose Completo (Todos os Serviços)
SEÇÃO 4  ── Agendamento de Loops: Schedules de Madrugada e Horários Comerciais
SEÇÃO 5  ── Loop Engine (Python): Motor de Execução com Headroom
SEÇÃO 6  ── MOCK 1: Loop de Otimização de Precificação
SEÇÃO 7  ── MOCK 2: Loop de Cristalização Noturna do Campo Akáshico
SEÇÃO 8  ── MOCK 3: Loop de Monitoramento de Concorrentes
SEÇÃO 9  ── MOCK 4: Loop de Análise de Reviews e Sentimento
SEÇÃO 10 ── MOCK 5: Loop de Geração de Conteúdo Marketing
SEÇÃO 11 ── MOCK 6: Loop de Auditoria Automática (5 Passos)
SEÇÃO 12 ── Rubric Engine: Avaliação Automatizada de Todos os Loops
SEÇÃO 13 ── Guardas de Segurança: 3 Stop Conditions + Headroom Budget
SEÇÃO 14 ── Memória Durável: STATUS.md + JSONL + Campo Akáshico
SEÇÃO 15 ── headroom learn: Feedback Loop de Falhas
SEÇÃO 16 ── Google Antigravity: Configuração e Instruções de Deploy
SEÇÃO 17 ── Monitoramento: Dashboard ZCC + Métricas Headroom
SEÇÃO 18 ── Roadmap de Testes Reais (3 Fases)
SEÇÃO 19 ── Orçamento de Tokens e Economia Headroom por Loop
SEÇÃO 20 ── Referências Cruzadas
```

---

## SEÇÃO 1 — VISÃO UNIFICADA: LOOPING ENGINEERING + HEADROOM NO ZEHLA

### A Convergência Dos Conceitos

O **Looping Engineering** nos ensina que o futuro da engenharia de agentes não é escrever prompts — é projetar **sistemas que promptam agentes** automaticamente. O **Headroom** nos dá a camada de compressão de contexto que torna esses loops **economicamente viáveis**: 60-95% menos tokens por iteração, com zero perda de qualidade.

A união dos dois conceitos no ZEHLA cria algo poderoso: **loops autônomos que rodam 24/7, agendados para horários estratégicos (madrugada para economia, manhã para ações), comprimindo contexto via Headroom, operando dentro de rubricas rígidas, e registrando tudo no Campo Akáshico**.

### O Custo Sem vs Com Headroom

Um loop de produção ZEHLA típico faz 5 iterações por execução, cada uma enviando ~12.000 tokens:

```
SEM HEADROOM:
  5 iterações × 12.000 tokens × $0.015/1K = $0.90 por execução
  3 loops/dia × 30 dias = $81/mês

COM HEADROOM (70% compressão média):
  5 iterações × 3.600 tokens × $0.015/1K = $0.27 por execução
  3 loops/dia × 30 dias = $24.30/mês

ECONOMIA: $56.70/mês por loop × 6 loops = $340/mês total
```

Na madrugada (tarifa off-peak de providers), o custo cai ainda mais. A combinação **Headroom + horários off-peak + loops fechados** é a trindade econômica do ZEHLA.

### Princípios Fundamentais

1. **Todo loop é CLOSED** (rota mapeada, rubrica fixa, guardas rígidas)
2. **Todo loop passa pelo Headroom** (compressão transparente via proxy localhost:8787)
3. **Todo loop registra no Campo Akáshico** (memória durável, cristalização automática)
4. **Todo loop separa Writer de Reviewer** (modelos diferentes, custos diferentes)
5. **Todo loop tem 3 Guardas** (iteration cap, diff check, budget cap)
6. **Todo loop usa a Técnica Ralph** (contexto limpo a cada iteração, memória em disco)

---

## SEÇÃO 2 — O LOOP ZEHLA: ARQUITETURA COM HEADROOM EMBUTIDO

### Diagrama de Um Loop ZEHLA com Headroom

```
╔══════════════════════════════════════════════════════════════════════════╗
║                 ARQUITETURA DE UM LOOP ZEHLA + HEADROOM                 ║
║                                                                        ║
║  [CRON SCHEDULE]                                                       ║
║  (madrugada 2h / manhã 6h / tarde 18h)                                ║
║         │                                                              ║
║         ▼                                                              ║
║  [LOOP ENGINE (Python)]                                                ║
║  ┌─────────────────────────────────────────────────────────────────┐    ║
║  │  while not STOP_CONDITION:                                     │    ║
║  │    1. DISCOVERY: Lê STATUS.md + Akáshico + APIs externas      │    ║
║  │    2. COMPRESS: Headroom comprime contexto (~70%)              │    ║
║  │    3. DISPATCH: Envia ao LLM via proxy Headroom              │    ║
║  │    4. OBSERVE: Recebe resposta, extrai resultado             │    ║
║  │    5. EVALUATE: Rubrica pontua (writer ≠ reviewer)            │    ║
║  │    6. DECIDE: PASS → connector / FAIL → log + retry          │    ║
║  │    7. REMEMBER: Atualiza STATUS.md + Akáshico + JSONL         │    ║
║  │    8. CHECK GUARDS: iterations? budget? converged?            │    ║
║  └─────────────────────────────────────────────────────────────────┘    ║
║         │                                                              ║
║         ▼                                                              ║
║  [HEADROOM PROXY :8787]  ◄── Comprime ~70% tokens                    ║
║         │                                                              ║
║         ▼                                                              ║
║  [LLM PROVIDER]           ◄── Anthropic / OpenRouter / Local          ║
║         │                                                              ║
║         ▼                                                              ║
║  [CAMPO AKÁSHICO]          ◄── Registro permanente                   ║
║  [STATUS.md]               ◄── Checklist durável                      ║
║  [loop_log.jsonl]          ◄── Histórico de execuções                ║
║  [ZCC DASHBOARD]           ◄── Métricas e alertas                     ║
║                                                                        ║
╚══════════════════════════════════════════════════════════════════════════╝
```

### Fluxo de Tokens Dentro do Loop

```
Iteração 1:
  Contexto bruto: 12.000 tokens
  → Headroom CacheAligner: estabiliza prefixo (sub-ms)
  → Headroom SmartCrusher: comprime saídas de tools (5-50ms)
  → Headroom Context Manager: Intelligent Context scoring (<1ms)
  → Contexto comprimido: 3.600 tokens (70% economia)
  → Enviado ao LLM via OpenRouter
  → Resposta recebida e avaliada pela Rubrica

Iteração 2:
  Contexto acumulado: 15.000 tokens brutos
  → Headroom comprime para 4.200 tokens
  → CCR recupera dados originais se LLM precisar
  → Avaliação da rubrica

Iteração 3...N:
  CCR gerencia overflow de contexto
  Headroom learn analisa falhas
  Loop continua até PASS ou STOP CONDITION
```

---

## SEÇÃO 3 — DOCKER COMPOSE COMPLETO (TODOS OS SERVIÇOS)

### docker-compose.zehla-loops.yml

Este é o arquivo Docker Compose que sobe toda a infraestrutura necessária para executar loops de produção ZEHLA com Headroom:

```yaml
# docker-compose.zehla-loops.yml
# Infraestrutura completa para Loop Engineering ZEHLA + Headroom
# Uso: docker compose -f docker-compose.zehla-loops.yml up -d

version: "3.9"

services:
  # ═══════════════════════════════════════════════════════════
  # HEADROOM — Camada de Compressão de Contexto
  # ═══════════════════════════════════════════════════════════
  headroom:
    image: ghcr.io/chopratejas/headroom:latest
    container_name: zehla-headroom
    restart: unless-stopped
    ports:
      - "8787:8787"
      - "8789:8789"
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
  # LOOP ENGINE — Motor de Execução de Loops ZEHLA
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
      # ── Headroom Proxy ──
      HEADROOM_PROXY_URL: "http://headroom:8787/v1"
      HEADROOM_PROXY_ENABLED: "true"

      # ── LLM Providers ──
      OPENROUTER_API_KEY: "${OPENROUTER_API_KEY}"
      OPENROUTER_API_URL: "https://openrouter.ai/api/v1"
      ANTHROPIC_API_KEY: "${ANTHROPIC_API_KEY:-}"

      # ── Modelos ──
      MODEL_WRITER: "${MODEL_WRITER:-anthropic/claude-sonnet-4}"
      MODEL_REVIEWER: "${MODEL_REVIEWER:-anthropic/claude-haiku-3.5}"
      MODEL_DEEP: "${MODEL_DEEP:-anthropic/claude-3.5-sonnet}"

      # ── Loop Guards ──
      DEFAULT_MAX_ITERATIONS: "10"
      DEFAULT_BUDGET_CAP_USD: "5.00"

      # ── Campo Akáshico ──
      AKASHIC_API_URL: "http://zehla-backend:8000/api/v2/akashic"
      AKASHIC_ENABLED: "${AKASHIC_ENABLED:-true}"

      # ── Redis (memory + streams) ──
      REDIS_URL: "redis://redis:6379/1"

      # ── Logging ──
      LOG_LEVEL: "INFO"
      LOOP_LOG_PATH: "/var/log/zehla-loops"

      # ── Timezone ──
      TZ: "America/Sao_Paulo"
    volumes:
      - ./loops/specs:/app/specs           # Specs de loops (STATUS.md, rubricas)
      - ./loops/output:/app/output         # Outputs dos loops
      - loop_logs:/var/log/zehla-loops      # Logs persistidos
    networks:
      - zehla-loops

  # ═══════════════════════════════════════════════════════════
  # SCHEDULER — Agendador CRON para Loops
  # ═══════════════════════════════════════════════════════════
  scheduler:
    build:
      context: ./scheduler/
      dockerfile: Dockerfile
    container_name: zehla-scheduler
    restart: unless-stopped
    depends_on:
      loop-engine:
        condition: service_started
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
  # METRICS DASHBOARD — Painel de Economia e Status dos Loops
  # ═══════════════════════════════════════════════════════════
  metrics:
    image: nginx:alpine
    container_name: zehla-loops-metrics
    restart: unless-stopped
    ports:
      - "8090:80"
    volumes:
      - ./metrics:/usr/share/nginx/html
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

### Estrutura de Diretórios

```
zehla-loops/
├── docker-compose.zehla-loops.yml    ← Este arquivo
├── loops/
│   ├── Dockerfile                    ← Imagem do Loop Engine
│   ├── requirements.txt              ← Dependências Python
│   ├── loop_engine.py                ← Motor de execução
│   ├── rubric_engine.py              ← Motor de rubricas
│   ├── headroom_client.py            ← Cliente Headroom
│   ├── specs/                        ← Specs de cada loop
│   │   ├── pricing/
│   │   │   ├── STATUS.md             ← Checklist Ralph
│   │   │   ├── spec.md               ← Especificação do loop
│   │   │   └── rubric.py             ← Rubrica de avaliação
│   │   ├── akashic_cristalization/
│   │   │   ├── STATUS.md
│   │   │   ├── spec.md
│   │   │   └── rubric.py
│   │   ├── competitor_monitor/
│   │   │   ├── STATUS.md
│   │   │   ├── spec.md
│   │   │   └── rubric.py
│   │   ├── review_analysis/
│   │   │   ├── STATUS.md
│   │   │   ├── spec.md
│   │   │   └── rubric.py
│   │   ├── marketing_content/
│   │   │   ├── STATUS.md
│   │   │   ├── spec.md
│   │   │   └── rubric.py
│   │   └── auto_audit/
│   │       ├── STATUS.md
│   │       ├── spec.md
│   │       └── rubric.py
│   └── output/                      ← Outputs gerados
├── scheduler/
│   ├── Dockerfile
│   ├── scheduler.py                  ← Agendador CRON
│   └── schedules.yml                 ← Definição de horários
└── metrics/
    └── index.html                    ← Dashboard simples
```

---

## SEÇÃO 4 — AGENDAMENTO DE LOOPS: SCHEDULES DE MADRUGADA E HORÁRIOS COMERCIAIS

### schedules.yml — Configuração de Horários

```yaml
# scheduler/schedules.yml
# Horários de execução dos loops ZEHLA
# Timezone: America/Sao_Paulo

loops:
  # ══════════════════════════════════════════════════════
  # LOOPS DE MADRUGADA (00h-05h) — Custo reduzido + sem tráfego
  # ══════════════════════════════════════════════════════

  pricing_optimization:
    name: "Loop de Otimização de Precificação"
    spec: "pricing/spec.md"
    schedule: "0 4 * * *"           # 04:00 AM — Antes do pico de reservas
    model_writer: "anthropic/claude-sonnet-4"
    model_reviewer: "anthropic/claude-haiku-3.5"
    max_iterations: 3
    budget_cap_usd: 2.00
    hardness: "hard"
    reason_madrugada: >
      Executa às 4h AM porque: (1) preços dos concorrentes
      foram atualizados durante a noite, (2) off-peak em providers
      = custo até 50% menor, (3) Headroom comprime contexto em ~70%,
      (4) resultado fica pronto para o horário comercial.

  akashic_cristalization:
    name: "Loop de Cristalização Noturna do Akáshico"
    spec: "akashic_cristalization/spec.md"
    schedule: "0 2 * * *"           # 02:00 AM — Processamento batch pesado
    model_writer: "anthropic/claude-3.5-sonnet"
    model_reviewer: "anthropic/claude-haiku-3.5"
    max_iterations: 5
    budget_cap_usd: 3.00
    hardness: "hard"
    reason_madrugada: >
      Cristalização batch às 2h AM: processa 50+ episódios acumulados,
      extrai padrões, gera insights, atualiza Knowledge Graph.
      Tarefa pesada de CPU — madrugada não impacta usuários.
      Headroom comprime episódios brutos em ~85%.

  competitor_monitor:
    name: "Loop de Monitoramento de Concorrentes"
    spec: "competitor_monitor/spec.md"
    schedule: "30 1 * * *"          # 01:30 AM — Scraping noturno
    model_writer: "anthropic/claude-sonnet-4"
    model_reviewer: "anthropic/claude-haiku-3.5"
    max_iterations: 3
    budget_cap_usd: 1.50
    hardness: "medium"
    reason_madrugada: >
      Concorrentes atualizam preços à noite. Scraping às 1:30h captura
      os preços mais recentes. Headroom comprime HTML de 78K tokens
      para ~4K tokens (95% economia via SmartCrusher).

  # ══════════════════════════════════════════════════════
  # LOOPS MATUTINOS (06h-12h) — Ações comerciais
  # ══════════════════════════════════════════════════════

  review_analysis:
    name: "Loop de Análise de Reviews e Sentimento"
    spec: "review_analysis/spec.md"
    schedule: "0 7 * * *"           # 07:00 AM — Após checkouts matinais
    model_writer: "anthropic/claude-sonnet-4"
    model_reviewer: "anthropic/claude-haiku-3.5"
    max_iterations: 5
    budget_cap_usd: 2.00
    hardness: "hard"

  marketing_content:
    name: "Loop de Geração de Conteúdo Marketing"
    spec: "marketing_content/spec.md"
    schedule: "0 9 * * 1-5"         # 09:00 AM — Seg a Sex (dia útil)
    model_writer: "anthropic/claude-sonnet-4"
    model_reviewer: "anthropic/claude-haiku-3.5"
    max_iterations: 3
    budget_cap_usd: 2.50
    hardness: "medium"

  # ══════════════════════════════════════════════════════
  # LOOPS VESPERTINOS (18h-23h) — Auditoria e verificação
  # ══════════════════════════════════════════════════════

  auto_audit:
    name: "Loop de Auditoria Automática (5 Passos)"
    spec: "auto_audit/spec.md"
    schedule: "0 22 * * *"          # 22:00 PM — Verificação fim de dia
    model_writer: "anthropic/claude-sonnet-4"
    model_reviewer: "anthropic/claude-3.5-sonnet"
    max_iterations: 3
    budget_cap_usd: 3.00
    hardness: "hard"
```

### Por Que Madrugada?

| Horário | Vantagem Econômica | Vantagem Operacional |
|---|---|---|
| **01:00-05:00** | Off-peak em providers: até 50% mais barato | Sem tráfego de hóspedes; sem competição por API |
| **06:00-09:00** | Preço normal | Resultados prontos para operadores chegarem |
| **18:00-23:00** | Preço normal | Verificação do dia; correções antes de fechar |

### Ordem de Execução na Madrugada

```
01:30 ── Competitor Monitor (scraping)
02:00 ── Akashic Cristalization (batch pesado)
04:00 ── Pricing Optimization (usa dados dos dois anteriores)
```

Cada loop alimenta o próximo. O Headroom comprime o contexto em cada etapa.

---

## SEÇÃO 5 — LOOP ENGINE (PYTHON): MOTOR DE EXECUÇÃO COM HEADROOM

### loops/requirements.txt

```
headroom-ai[all]>=0.1.0
openai>=1.0.0
httpx>=0.25.0
redis>=5.0.0
pydantic>=2.0.0
apscheduler>=3.10.0
python-dotenv>=1.0.0
click>=8.0.0
rich>=13.0.0
```

### loops/loop_engine.py

```python
"""
ZEHLA Loop Engine — Motor de Execução com Headroom
Executa loops autônomos com compressão de contexto via Headroom proxy.
Cada iteração é um agente novo com contexto limpo (Técnica Ralph).
"""

import json
import time
import httpx
import os
from datetime import datetime
from pathlib import Path
from dataclasses import dataclass, field
from typing import Optional

import httpx

@dataclass
class LoopConfig:
    """Configuração de um loop."""
    name: str
    spec_path: str
    model_writer: str = "anthropic/claude-sonnet-4"
    model_reviewer: str = "anthropic/claude-haiku-3.5"
    max_iterations: int = 10
    budget_cap_usd: float = 5.0
    hardness: str = "hard"

@dataclass
class IterationResult:
    """Resultado de uma iteração do loop."""
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
    """Resultado completo de um loop."""
    loop_name: str
    started_at: datetime
    finished_at: Optional[datetime] = None
    iterations: list = field(default_factory=list)
    status: str = "running"  # running | completed | halted | failed
    halt_reason: Optional[str] = None
    total_tokens_saved: int = 0
    total_cost_usd: float = 0.0
    headroom_savings_percent: float = 0.0

class ZehlaLoopEngine:
    """Motor de execução de loops ZEHLA com Headroom."""

    def __init__(self, config: LoopConfig):
        self.config = config
        self.headroom_url = os.getenv(
            "HEADROOM_PROXY_URL", "http://localhost:8787/v1"
        )
        self.api_key = os.getenv("OPENROUTER_API_KEY", "")
        self.akashic_url = os.getenv("AKASHIC_API_URL", "")
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/1")
        self.result = LoopResult(
            loop_name=config.name,
            started_at=datetime.now()
        )

    def _read_spec(self) -> str:
        """Lê a spec do loop do disco."""
        spec_path = Path(self.config.spec_path)
        if not spec_path.exists():
            raise FileNotFoundError(f"Spec não encontrada: {spec_path}")
        return spec_path.read_text(encoding="utf-8")

    def _read_status(self) -> str:
        """Lê STATUS.md (memória durável Ralph)."""
        status_path = Path("specs") / self.config.name / "STATUS.md"
        if status_path.exists():
            return status_path.read_text(encoding="utf-8")
        return "# STATUS — Nenhuma execução anterior\n\n- [ ] Iniciar"

    def _update_status(self, content: str):
        """Atualiza STATUS.md no disco."""
        status_path = Path("specs") / self.config.name / "STATUS.md"
        status_path.write_text(content, encoding="utf-8")

    def _append_log(self, entry: dict):
        """Append no JSONL de log."""
        log_dir = os.getenv("LOOP_LOG_PATH", "/var/log/zehla-loops")
        Path(log_dir).mkdir(parents=True, exist_ok=True)
        log_path = Path(log_dir) / f"{self.config.name}.jsonl"
        with open(log_path, "a") as f:
            f.write(json.dumps(entry) + "\n")

    async def _compress_via_headroom(
        self, messages: list[dict]
    ) -> dict:
        """Comprime mensagens via Headroom proxy."""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.headroom_url.replace('/v1', '')}/v1/compress",
                    json={"messages": messages, "model": self.config.model_writer},
                    headers={"Authorization": f"Bearer {self.api_key}"},
                )
                if response.status_code == 200:
                    return response.json()
        except Exception as e:
            print(f"[WARN] Headroom compress falhou: {e}")
        return {"messages": messages, "tokens_before": 0, "tokens_after": 0, "tokens_saved": 0}

    async def _call_llm(
        self, messages: list[dict], model: str
    ) -> dict:
        """Chama LLM via Headroom proxy (compressão automática)."""
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

    async def _register_in_akashic(self, event: dict):
        """Registra evento no Campo Akáshico."""
        if not self.akashic_url:
            return
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                await client.post(
                    f"{self.akashic_url}/ingest",
                    json=event,
                )
        except Exception as e:
            print(f"[WARN] Akáshico registro falhou: {e}")

    def _check_guards(self) -> Optional[str]:
        """Verifica as 3 guardas de segurança."""
        r = self.result

        # Guarda 1: Iteration Cap
        if len(r.iterations) >= self.config.max_iterations:
            return f"ITERATION_CAP: atingido máximo de {self.config.max_iterations}"

        # Guarda 2: Budget Cap
        if r.total_cost_usd >= self.config.budget_cap_usd:
            return f"BUDGET_CAP: atingido máximo de ${self.config.budget_cap_usd:.2f}"

        # Guarda 3: Diff Check (convergência)
        if len(r.iterations) >= 3:
            last_3_outputs = [i.output for i in r.iterations[-3:]]
            if len(set(last_3_outputs)) == 1:
                return "DIFF_CHECK: convergiu — nenhuma mudança nos últimos 3 passes"

        return None

    async def run(self) -> LoopResult:
        """Executa o loop completo."""
        print(f"\n{'='*60}")
        print(f"LOOP ZEHLA: {self.config.name}")
        print(f"Hardness: {self.config.hardness}")
        print(f"Writer: {self.config.model_writer}")
        print(f"Reviewer: {self.config.model_reviewer}")
        print(f"Max Iterations: {self.config.max_iterations}")
        print(f"Budget Cap: ${self.config.budget_cap_usd:.2f}")
        print(f"Headroom Proxy: {self.headroom_url}")
        print(f"{'='*60}\n")

        spec = self._read_spec()
        status = self._read_status()

        while True:
            halt_reason = self._check_guards()
            if halt_reason:
                self.result.status = "halted"
                self.result.halt_reason = halt_reason
                print(f"\n[HALT] {halt_reason}")
                break

            iteration_num = len(self.result.iterations) + 1
            start_time = time.time()
            result = IterationResult(
                iteration=iteration_num,
                writer_model=self.config.model_writer,
            )

            try:
                # DISCOVERY: Monta contexto (Técnica Ralph — contexto limpo)
                messages = [
                    {
                        "role": "system",
                        "content": (
                            f"Você é o agente de loop do ZEHLA: {self.config.name}.\n"
                            f"Especiação:\n{spec}\n\n"
                            f"Status atual (memória durável):\n{status}\n\n"
                            f"Iteração {iteration_num} de {self.config.max_iterations}.\n"
                            f"Execute a próxima tarefa não concluída, avalie o resultado,\n"
                            f"e atualize o status."
                        ),
                    },
                    {
                        "role": "user",
                        "content": (
                            f"Esta é a iteração {iteration_num}.\n"
                            f"Leia o STATUS, identifique a próxima tarefa pendente,\n"
                            f"execute-a, e reporte o resultado no formato JSON:\n"
                            f'{{"task": "...", "result": "...", "status": "done/partial/failed", "next_action": "..."}}'
                        ),
                    },
                ]

                # COMPRESS: Headroom comprime contexto
                compressed = await self._compress_via_headroom(messages)
                result.tokens_before = compressed.get("tokens_before", 0)
                result.tokens_after = compressed.get("tokens_after", 0)
                result.tokens_saved = compressed.get("tokens_saved", 0)
                compression_ratio = compressed.get("compression_ratio", 1.0)
                result.compression_ratio = compression_ratio

                if result.tokens_saved > 0:
                    print(
                        f"[ITER {iteration_num}] "
                        f"Tokens: {result.tokens_before} -> {result.tokens_after} "
                        f"({result.tokens_saved} saved, {compression_ratio:.0%} compress)"
                    )

                # DISPATCH: Envia ao LLM via Headroom proxy
                llm_response = await self._call_llm(
                    compressed.get("messages", messages),
                    self.config.model_writer,
                )

                output = llm_response["choices"][0]["message"]["content"]
                result.output = output

                # OBSERVE + EVALUATE: Rubrica avalia resultado
                # (Para mocks, usamos avaliação simplificada)
                if '"status": "done"' in output:
                    result.rubric_score = 1.0
                    result.rubric_passed = True
                elif '"status": "partial"' in output:
                    result.rubric_score = 0.5
                    result.rubric_passed = False
                else:
                    result.rubric_score = 0.0
                    result.rubric_passed = False

                # Estimativa de custo (tokens output * preço)
                usage = llm_response.get("usage", {})
                total_tokens = usage.get("total_tokens", result.tokens_after + 500)
                result.cost_usd = total_tokens * 0.000015  # ~$0.015/1K
                result.total_cost_usd = (
                    sum(i.cost_usd for i in self.result.iterations)
                    + result.cost_usd
                )

                duration = int((time.time() - start_time) * 1000)
                result.duration_ms = duration

                print(
                    f"[ITER {iteration_num}] "
                    f"Score: {result.rubric_score:.2f} | "
                    f"Custo: ${result.cost_usd:.4f} | "
                    f"Total: ${result.total_cost_usd:.2f} | "
                    f"Duração: {duration}ms"
                )

                # REMEMBER: Atualiza memória durável
                self._update_status(
                    f"{status}\n\n"
                    f"## Iteração {iteration_num} — {datetime.now().isoformat()}\n"
                    f"- Score: {result.rubric_score:.2f}\n"
                    f"- Custo: ${result.cost_usd:.4f}\n"
                    f"- Output: {output[:200]}..."
                )

                # Log JSONL
                self._append_log({
                    "loop": self.config.name,
                    "iteration": iteration_num,
                    "score": result.rubric_score,
                    "passed": result.rubric_passed,
                    "tokens_before": result.tokens_before,
                    "tokens_after": result.tokens_after,
                    "tokens_saved": result.tokens_saved,
                    "cost_usd": result.cost_usd,
                    "total_cost_usd": result.total_cost_usd,
                    "duration_ms": duration,
                    "output": output[:500],
                    "timestamp": datetime.now().isoformat(),
                })

                # Registro no Akáshico
                await self._register_in_akashic({
                    "pousada_id": "ZEHLA_SYSTEM",
                    "source_channel": "loop_engine",
                    "input_text": f"Loop {self.config.name} iter {iteration_num}",
                    "ai_response": output[:300],
                    "outcome": "resolved" if result.rubric_passed else "escalated",
                    "tokens_used": total_tokens,
                    "cadmas_bucket": 31,
                })

                self.result.iterations.append(result)
                self.result.total_tokens_saved = sum(
                    i.tokens_saved for i in self.result.iterations
                )
                self.result.total_cost_usd = result.total_cost_usd

                # Se PASS e hardness for medium, pode parar
                if result.rubric_passed and self.config.hardness == "medium":
                    self.result.status = "completed"
                    print(f"\n[PASS] Loop completado na iteração {iteration_num}")
                    break

            except Exception as e:
                result.error = str(e)
                self.result.iterations.append(result)
                print(f"[ERROR] Iteração {iteration_num}: {e}")
                self._append_log({
                    "loop": self.config.name,
                    "iteration": iteration_num,
                    "error": str(e),
                    "timestamp": datetime.now().isoformat(),
                })

        self.result.finished_at = datetime.now()
        return self.result
```

### loops/Dockerfile

```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY loop_engine.py .
COPY rubric_engine.py .
COPY headroom_client.py .
COPY specs/ /app/specs/

RUN mkdir -p /app/output /var/log/zehla-loops

EXPOSE 8080

CMD ["python", "loop_engine.py", "--mode", "scheduler"]
```

---

## SEÇÃO 6 — MOCK 1: LOOP DE OTIMIZAÇÃO DE PRECIFICAÇÃO

### Spec: loops/specs/pricing/spec.md

```markdown
# SPEC — Loop de Otimização de Precificação ZEHLA

## Objetivo
Loop autônomo que analisa dados de mercado, ocupação e sazonalidade
para ajustar preços de diárias de pousadas automaticamente.
Todo tráfego LLM passa pelo Headroom proxy (compressão ~70%).

## Trigger
CRON: 04:00 AM (America/Sao_Paulo) — Madrugada, off-peak

## Topologia (Agent Graph)

[DISCOVERY: Claude Sonnet] → [PLANNING: Claude Sonnet] →
[EXECUTION: Claude Sonnet] → [VERIFICATION: Claude Haiku]

Nó 1 — DISCOVERY_AGENT:
  - Scraping de preços de concorrentes (Firecrawl)
  - Leitura de ocupação atual (Prisma/SQLite)
  - Recuperação de padrões sazonais (Campo Akáshico)
  - Headroom comprime outputs de scraping em ~85%
  - Saída: relatório de mercado JSON

Nó 2 — PLANNING_AGENT:
  - Input: relatório + rubrica de precificação
  - Calcula preços ótimos (estratégia neuroeconômica)
  - Guardrails: R$80 (mín), R$1500 (máx), 20%/dia
  - Headroom comprime contexto histórico em ~65%
  - Saída: plano de preços JSON

Nó 3 — EXECUTION_AGENT:
  - Aplica preços via API do ZEHLA
  - Saída: confirmation

Nó 4 — REVIEWER_AGENT (Claude Haiku — barato, diferente):
  - Avalia diff preços (antes/depois) contra rubrica
  - Verifica guardrails
  - Saída: PASS/FAIL com score

## Memória Durável
- STATUS.md: checklist Ralph (tarefa atual, histórico)
- pricing_log.jsonl: histórico de todos os ajustes
- Campo Akáshico: registro semântico de decisões

## Guardas
- MAX_ITERATIONS: 3
- BUDGET_CAP: $2.00
- DIFF_CHECK: se última não mudou, halt
- PRICE_GUARD: R$80–R$1500

## Com Headroom: economia estimada
- Sem Headroom: ~15.000 tokens/iteração × 3 = 45.000 → $0.67
- Com Headroom: ~4.500 tokens/iteração × 3 = 13.500 → $0.20
- Economia: $0.47/execução = ~$14/mês
```

### STATUS.md Inicial: loops/specs/pricing/STATUS.md

```markdown
# STATUS — Loop de Otimização de Precificação

## Tarefas Pendentes
- [ ] Coletar preços dos 5 concorrentes
- [ ] Comparar com preços atuais ZEHLA
- [ ] Calcular preços ótimos
- [ ] Verificar guardrails
- [ ] Aplicar ajustes via API
- [ ] Registrar no Campo Akáshico

## Histórico de Execuções
(nenhuma execução anterior)
```

### Rubrica: loops/specs/pricing/rubric.py

```python
"""Rubrica de avaliação do Loop de Precificação — MOCK."""

MIN_PRICE = 80.0
MAX_PRICE = 1500.0
MAX_DAILY_CHANGE = 0.20
THRESHOLD = 0.70

def evaluate(before: dict, after: dict, market: dict) -> dict:
    scores = {}
    violations = []

    # Critério 1: Ocupação-Alvo (40%)
    if market.get("target_occupancy", 0) > 0:
        scores["occupancy"] = (
            min(1.0, market.get("current_occupancy", 0) / market["target_occupancy"]) * 0.4
        )

    # Critério 2: Receita Maximizada (30%)
    if market.get("max_historical_revenue", 0) > 0:
        scores["revenue"] = (
            min(1.0, market.get("current_revenue", 0) / market["max_historical_revenue"]) * 0.3
        )

    # Critério 3: Competitividade (20%)
    avg_zehla = sum(after.values()) / len(after) if after else 0
    avg_market = market.get("avg_competitor_price", 0)
    if avg_market > 0:
        scores["competitiveness"] = (1.0 - min(1.0, abs(avg_zehla - avg_market) / avg_market)) * 0.2

    # Critério 4: Estabilidade (10%)
    max_change = 0.0
    for room in after:
        if room in before and before[room] > 0:
            change = abs(after[room] - before[room]) / before[room]
            max_change = max(max_change, change)
    scores["stability"] = (1.0 - min(1.0, max_change / MAX_DAILY_CHANGE)) * 0.1

    # Guardrails
    for room, price in after.items():
        if price < MIN_PRICE:
            violations.append(f"Preço abaixo mínimo: {room} = R${price}")
        if price > MAX_PRICE:
            violations.append(f"Preço acima máximo: {room} = R${price}")
    if max_change > MAX_DAILY_CHANGE:
        violations.append(f"Variação > {MAX_DAILY_CHANGE*100:.0f}%")

    total = sum(scores.values())
    if violations:
        total *= 0.5

    return {
        "total_score": total,
        "scores": scores,
        "violations": violations,
        "passed": total >= THRESHOLD and len(violations) == 0,
    }
```

---

## SEÇÃO 7 — MOCK 2: LOOP DE CRISTALIZAÇÃO NOTURNA DO CAMPO AKÁSHICO

### Spec: loops/specs/akashic_cristalization/spec.md

```markdown
# SPEC — Loop de Cristalização Noturna do Campo Akáshico

## Objetivo
Processa episódios acumulados do dia, extrai padrões, gera insights,
atualiza Knowledge Graph, e alimenta Thompson Sampling priors.
Tarefa pesada — executada às 2h AM na madrugada.

## Trigger
CRON: 02:00 AM (America/Sao_Paulo)

## Topologia

[DISCOVERY: Claude Sonnet] → [PATTERN EXTRACTION: Claude Sonnet] →
[INSIGHT GENERATION: Claude Fable 5] → [VERIFICATION: Claude Haiku]

Nó 1 — DISCOVERY:
  - Conta episódios pendentes na Camada 2 (SQLite WAL)
  - Verifica threshold: >= 30 episódios para processar
  - Se < 30, HALT (nada a cristalizar)
  - Headroom comprime lista de episódios em ~85%

Nó 2 — PATTERN EXTRACTION:
  - Agrupa episódios similares (sazonalidade, canal, sentimento)
  - Detecta anomalias (reclamações repetidas, mudanças de padrão)
  - Calcula estatísticas (frequência, correlação, tendência)
  - Headroom comprime arrays estatísticos em ~80%

Nó 3 — INSIGHT GENERATION (Claude Fable 5 — raciocínio profundo):
  - Transforma padrões em conhecimento acionável
  - Gera insights com confiança calculada
  - Cria links no Knowledge Graph (NetworkX)
  - Determina se é global ou específico por pousada
  - Headroom comprime contexto extenso em ~70%

Nó 4 — REVIEWER (Claude Haiku):
  - Verifica se insights são factualmente consistentes
  - Confere se não há PII no conhecimento global
  - Score: qualidade do insight × confiança

## Com Headroom: economia estimada
- Episódios brutos: 50 × 500 tokens = 25.000 tokens
- Comprimidos: 25.000 → 5.000 tokens (80% economia)
- Custo sem Headroom: ~$0.38 por cristalização
- Custo com Headroom: ~$0.08 por cristalização
- Economia: ~$9/mês

## Guardas
- MAX_ITERATIONS: 5
- BUDGET_CAP: $3.00
- DIFF_CHECK: se padrões são iguais aos últimos, halt
- MIN_EPISODES: 30 (não cristaliza com menos)
```

### STATUS.md Inicial

```markdown
# STATUS — Cristalização Noturna do Campo Akáshico

## Tarefas Pendentes
- [ ] Contar episódios acumulados (>= 30?)
- [ ] Agrupar por similaridade
- [ ] Detectar anomalias
- [ ] Gerar insights acionáveis
- [ ] Atualizar Knowledge Graph
- [ ] Alimentar Thompson Sampling priors
- [ ] Verificar qualidade (reviewer)
```

---

## SEÇÃO 8 — MOCK 3: LOOP DE MONITORAMENTO DE CONCORRENTES

### Spec: loops/specs/competitor_monitor/spec.md

```markdown
# SPEC — Loop de Monitoramento de Concorrentes

## Objetivo
Scraping noturno dos preços de 5 concorrentes principais.
Headroom SmartCrusher comprime HTML bruto (~95% economia).
Dados alimentam o loop de precificação (04:00 AM).

## Trigger
CRON: 01:30 AM (America/Sao_Paulo)

## Topologia
[SCRAPER: Claude Sonnet] → [PARSER: Claude Sonnet] → [STORAGE] → [REVIEWER: Claude Haiku]

Nó 1 — SCRAPER:
  - Acessa 5 sites de concorrentes via Firecrawl
  - Extrai preços de diárias para tipos de quarto equivalentes
  - HTML bruto: ~78.000 tokens → Headroom comprime para ~4.000 (95%)

Nó 2 — PARSER:
  - Normaliza preços (remove moeda, formatação)
  - Compara com preços ZEHLA anteriores
  - Detecta mudanças significativas (>10%)

Nó 3 — STORAGE:
  - Salva no Campo Akáshico (memória durável)
  - Atualiza dashboard ZCC

Nó 4 — REVIEWER:
  - Verifica se dados são consistentes e recentes
  - Alerta se site do concorrente mudou estrutura

## Guardas
- MAX_ITERATIONS: 3
- BUDGET_CAP: $1.50
- DIFF_CHECK: se preços idênticos aos anteriores, halt
```

---

## SEÇÃO 9 — MOCK 4: LOOP DE ANÁLISE DE REVIEWS E SENTIMENTO

### Spec: loops/specs/review_analysis/spec.md

```markdown
# SPEC — Loop de Análise de Reviews e Sentimento

## Objetivo
Coleta reviews de Google, Booking.com e TripAdvisor.
Analisa sentimento, extrai insights, gera respostas sugeridas.
Headroom comprime reviews brutas em ~90%.

## Trigger
CRON: 07:00 AM (após checkouts matinais)

## Topologia
[COLLECTOR: Claude Sonnet] → [ANALYZER: Claude Sonnet] →
[RESPONDER: Claude Sonnet] → [REVIEWER: Claude Haiku]

Nó 1 — COLLECTOR:
  - Coleta reviews das últimas 24h
  - Headroom comprime texto HTML (~90%)

Nó 2 — ANALYZER:
  - Sentimento (positivo/negativo/neutro)
  - Extrai temas (limpeza, barulho, café, localização)
  - Detecta anomalias (3+ reclamações mesmo tema = alerta)
  - Headroom comprime arrays de reviews (~85%)

Nó 3 — RESPONDER:
  - Gera rascunho de resposta para reviews negativos
  - Sugere ação para o operador

Nó 4 — REVIEWER:
  - Verifica se respostas são empáticas e alinhadas com política

## Guardas
- MAX_ITERATIONS: 5
- BUDGET_CAP: $2.00
```

---

## SEÇÃO 10 — MOCK 5: LOOP DE GERAÇÃO DE CONTEÚDO MARKETING

### Spec: loops/specs/marketing_content/spec.md

```markdown
# SPEC — Loop de Geração de Conteúdo Marketing

## Objetivo
Gera posts para Instagram e stories para pousadas
baseado em sazonalidade, eventos locais e padrões do Akáshico.
Headroom comprime contexto de sazonalidade e histórico (~70%).

## Trigger
CRON: 09:00 AM, segunda a sexta

## Topologia
[RESEARCHER: Claude Sonnet] → [CREATOR: Claude Sonnet] →
[APPROVER: Claude Haiku]

Nó 1 — RESEARCHER:
  - Consulta eventos locais (API feriados, clima)
  - Consulta Akáshico por padrões de engagement
  - Headroom comprime dados de sazonalidade (~70%)

Nó 2 — CREATOR:
  - Gera 3 opções de caption + sugestão de imagem
  - Adapta ao perfil da pousada

Nó 3 — APPROVER:
  - Verifica se é alinhado à marca
  - Score: criatividade × alinhamento × relevância

## Guardas
- MAX_ITERATIONS: 3
- BUDGET_CAP: $2.50
```

---

## SEÇÃO 11 — MOCK 6: LOOP DE AUDITORIA AUTOMÁTICA (5 PASSOS)

### Spec: loops/specs/auto_audit/spec.md

```markdown
# SPEC — Loop de Auditoria Automática (5 Passos)

## Objetivo
Executa os 5 passos da Auditoria Obrigatória ZEHLA
automaticamente às 22h. Verifica integridade do sistema.
Headroom comprime logs e outputs em ~75%.

## Trigger
CRON: 22:00 PM (verificação fim de dia)

## Topologia
[AUDITOR: Claude Sonnet] → [VALIDATOR: Claude Fable 5] → [REPORTER: Claude Haiku]

Nó 1 — AUDITOR (passos 1-3):
  1. Checklist de Funcionalidades (specs vs implementação)
  2. Análise de Segurança (LGPD, PII, encriptação)
  3. Teste de Performance (latência, uptime)
  - Headroom comprime logs em ~85%

Nó 2 — VALIDATOR (passos 4-5):
  4. Revisão de Código (boas práticas, vulnerabilidades)
  5. Validação de Conformidade (políticas internas)

Nó 3 — REPORTER:
  - Gera relatório consolidado
  - Score de compliance
  - Lista de ações recomendadas

## Guardas
- MAX_ITERATIONS: 3
- BUDGET_CAP: $3.00
```

---

## SEÇÃO 12 — RUBRIC ENGINE: AVALIAÇÃO AUTOMATIZADA DE TODOS OS LOOPS

### loops/rubric_engine.py

```python
"""
Rubric Engine — Motor de avaliação unificado para todos os loops ZEHLA.
Cada loop tem sua rubrica específica, mas o engine compartilha
a lógica de avaliação e thresholds.
"""

from dataclasses import dataclass
from typing import Optional

@dataclass
class RubricCriteria:
    """Critério de avaliação."""
    name: str
    weight: float          # 0.0-1.0
    description: str
    evaluate_fn: callable  # Função que retorna 0.0-1.0

@dataclass
class RubricResult:
    """Resultado da avaliação."""
    total_score: float
    criteria_scores: dict[str, float]
    passed: bool
    threshold: float
    violations: list[str]
    iteration: int

class RubricEngine:
    """Motor de rubricas para avaliação de loops."""

    def __init__(self, name: str, criteria: list[RubricCriteria], threshold: float = 0.7):
        self.name = name
        self.criteria = criteria
        self.threshold = threshold

    def evaluate(self, iteration: int, context: dict) -> RubricResult:
        """Avalia uma iteração do loop."""
        scores = {}
        violations = []

        for criterion in self.criteria:
            try:
                score = criterion.evaluate_fn(context)
                scores[criterion.name] = score * criterion.weight
            except Exception as e:
                scores[criterion.name] = 0.0
                violations.append(f"Erro no critério {criterion.name}: {e}")

        total = sum(scores.values())

        return RubricResult(
            total_score=total,
            criteria_scores=scores,
            passed=total >= self.threshold and len(violations) == 0,
            threshold=self.threshold,
            violations=violations,
            iteration=iteration,
        )

# ═══════════════════════════════════════════════════════════
# RUBRICAS ESPECÍFICAS DE CADA LOOP
# ═══════════════════════════════════════════════════════════

def create_pricing_rubric() -> RubricEngine:
    """Rubrica do Loop de Precificação."""
    return RubricEngine(
        name="pricing",
        threshold=0.70,
        criteria=[
            RubricCriteria(
                name="occupancy", weight=0.4,
                description="Ocupação atual vs alvo",
                evaluate_fn=lambda ctx: min(1.0, ctx.get("current_occupancy", 0) / max(0.01, ctx.get("target_occupancy", 1))),
            ),
            RubricCriteria(
                name="revenue", weight=0.3,
                description="Receita vs máximo histórico",
                evaluate_fn=lambda ctx: min(1.0, ctx.get("current_revenue", 0) / max(1, ctx.get("max_revenue", 1))),
            ),
            RubricCriteria(
                name="competitiveness", weight=0.2,
                description="Preço ZEHLA vs mercado",
                evaluate_fn=lambda ctx: 1.0 - min(1.0, abs(ctx.get("avg_zehla", 0) - ctx.get("avg_market", 0)) / max(1, ctx.get("avg_market", 1))),
            ),
            RubricCriteria(
                name="stability", weight=0.1,
                description="Variação percentual",
                evaluate_fn=lambda ctx: 1.0 - min(1.0, ctx.get("max_change", 0) / 0.20),
            ),
        ],
    )

def create_akashic_rubric() -> RubricEngine:
    """Rubrica do Loop de Cristalização."""
    return RubricEngine(
        name="akashic_cristalization",
        threshold=0.65,
        criteria=[
            RubricCriteria(name="insight_quality", weight=0.35, description="Qualidade dos insights gerados", evaluate_fn=lambda ctx: ctx.get("insight_score", 0)),
            RubricCriteria(name="pattern_count", weight=0.25, description="Número de padrões detectados", evaluate_fn=lambda ctx: min(1.0, ctx.get("patterns_found", 0) / 10)),
            RubricCriteria(name="anomaly_detection", weight=0.20, description="Anomalias detectadas", evaluate_fn=lambda ctx: 1.0 if ctx.get("anomalies", 0) > 0 else 0.5),
            RubricCriteria(name="graph_update", weight=0.20, description="Knowledge Graph atualizado", evaluate_fn=lambda ctx: 1.0 if ctx.get("graph_updated") else 0.0),
        ],
    )
```

---

## SEÇÃO 13 — GUARDAS DE SEGURANÇA: 3 STOP CONDITIONS + HEADROOM BUDGET

### As 3 Guardas (Implementadas no Loop Engine)

```python
# Guarda 1 — ITERATION CAP
MAX_ITERATIONS = int(os.getenv("DEFAULT_MAX_ITERATIONS", "10"))

# Guarda 2 — BUDGET CAP (HEADROOM ajuda aqui)
BUDGET_CAP_USD = float(os.getenv("DEFAULT_BUDGET_CAP_USD", "5.00"))

# Guarda 3 — DIFF CHECK (convergência)
def check_convergence(last_n_outputs: list[str], n: int = 3) -> bool:
    """Se os últimos N outputs forem idênticos, convergiu."""
    if len(last_n_outputs) < n:
        return False
    return len(set(last_n_outputs[-n:])) == 1
```

### Headroom Budget como 4a Guarda

O Headroom tem sua própria guarda de budget que opera em paralelo:

```python
# No docker-compose: HEADROOM_BUDGET=20.0 (diário)
# O Headroom corta requests quando o budget diário é atingido
# Isso protege mesmo que as 3 guardas do loop falhem
```

### Diálogo entre Guardas

```
Loop Guard 1 (iterations): "Parei em 3 iterações"
Loop Guard 2 (budget):     "Ainda tenho $3.50 do budget"
Loop Guard 3 (converged):   "Última mudou — não convergiu"
Headroom Guard 4:           "Hoje já usei $12 do budget de $20"

→ Loop continua (nenhuma guarda acionou halt)
→ Headroom continua comprimindo
→ Economia acumulada: $4.50 desta execução
```

---

## SEÇÃO 14 — MEMÓRIA DURÁVEL: STATUS.md + JSONL + CAMPO AKÁSHICO

### STATUS.md (Técnica Ralph)

Cada loop tem um STATUS.md no diretório de specs. O loop lê no início de cada iteração (Ralph: contexto limpo) e atualiza no final. O agente esquece; o STATUS.md não esquece.

```markdown
# Exemplo: STATUS.md após 3 execuções do Loop de Precificação

## Tarefas
- [x] Coletar preços dos concorrentes
- [x] Comparar com preços ZEHLA
- [ ] Calcular preços ótimos (bloqueado: API ZEHLA em manutenção)
- [ ] Verificar guardrails
- [ ] Aplicar ajustes

## Execuções
- **2026-06-17 04:00** — Score: 0.85, PASS, Custo: $0.18, Tokens: 12.4K → 3.8K
- **2026-06-16 04:00** — Score: 0.72, PASS, Custo: $0.21, Tokens: 15.1K → 4.2K
- **2026-06-15 04:00** — Score: 0.45, FAIL, Custo: $0.15, Motivo: API ZEHLA timeout
```

### JSONL (Log Estruturado)

Cada iteração gera uma linha JSON append-only. Ideal para análise posterior:

```jsonl
{"loop":"pricing","iteration":1,"score":0.85,"tokens_before":15000,"tokens_after":3800,"tokens_saved":11200,"cost_usd":0.18,"timestamp":"2026-06-17T04:00:01"}
{"loop":"pricing","iteration":2,"score":0.72,"tokens_before":14200,"tokens_after":4100,"tokens_saved":10100,"cost_usd":0.19,"timestamp":"2026-06-17T04:00:45"}
```

### Campo Akáshico (Registro Semântico)

Cada execução registra um episódio no Akáshico para cristalização futura:

```python
await akashic_bridge.ingest_event({
    "pousada_id": "ZEHLA_SYSTEM",
    "source_channel": "loop_engine",
    "input_text": f"Loop {loop_name} iter {iteration}",
    "ai_response": output[:300],
    "outcome": "resolved" if passed else "escalated",
    "tokens_used": total_tokens,
    "cadmas_bucket": 31,
})
```

---

## SEÇÃO 15 — HEADROOM LEARN: FEEDBACK LOOP DE FALHAS

### Configuração

```bash
# No container scheduler, executar headroom learn a cada hora
0 * * * * headroom learn --agent claude --sessions-dir /var/log/zehla-loops/
```

### Fluxo de Feedback

```
Loop executa → Iteração falha (score < threshold)
  → headroom learn analisa falha
  → Gera correção em linguagem natural
  → Correção salva em CLAUDE.md / spec.md
  → Próxima execução usa spec atualizado
  → Loop melhora iterativamente
```

Isso fecha o ciclo de autoevolução: loops que aprendem com seus próprios erros.

---

## SEÇÃO 16 — GOOGLE ANTIGRAVITY: CONFIGURAÇÃO E INSTRUÇÕES DE DEPLOY

### System Prompt para Google Antigravity

```markdown
# SYSTEM PROMPT — Loop Engineering + Headroom Agent para ZEHLA

Você é o engenheiro de loops do ZEHLA, especializado em
Loop Engineering com Headroom para compressão de contexto.

## SUA MISSÃO
Projetar e implementar loops autônomos que rodam via Docker
com Headroom proxy para reduzir tokens em 60-95%.

## STACK
- Docker Compose (infraestrutura)
- Headroom proxy (localhost:8787, compressão automática)
- OpenRouter (providers LLM, roteamento via Thompson Sampling)
- Campo Akáshico (memória durável, 4 camadas)
- Claude Fable 5 / Sonnet / Haiku (modelos por papel)

## PRINCÍPIOS
1. CLOSED LOOPS em produção
2. Writer ≠ Reviewer (modelos diferentes)
3. 3 Guardas: iteration cap, diff check, budget cap
4. Headroom em cada iteração
5. Ralph: contexto limpo, memória em disco
6. Registrar tudo no Akáshico

## CONCEITO HEADROOM + LOOP
Cada iteração do loop:
  1. Monta contexto (spec + STATUS.md + dados externos)
  2. Headroom comprime (~70% economia)
  3. Envia ao LLM via proxy
  4. Avalia resultado (rubrica)
  5. Atualiza memória durável
  6. Verifica guardas
```

### Instruções para Google Antigravity

```
PASSO 1: Faça upload deste documento completo como fonte no NotebookLM

PASSO 2: Carregue também:
  - ZEHLA_HEADROOM_Plano_Implementacao_Completo.md
  - docker-compose.zehla-loops.yml (este arquivo)
  - As specs dos 6 mocks (pricing, akashic, competitor, review, marketing, audit)

PASSO 3: No Antigravity, use PLAN MODE primeiro para ver o agente planejando

PASSO 4: Comando inicial:
"Use o Loop Engine ZEHLA com Headroom para subir a infraestrutura
Docker completa (docker-compose.zehla-loops.yml) e executar o
loop MOCK de precificação em modo teste. Verifique que o Headroom
está comprimindo tokens e reporte a economia."

PASSO 5: Para testes reais:
"Execute o loop de cristalização noturna do Campo Akáshico às 2h AM.
Use Headroom proxy. Reporte tokens economizados e insights gerados."
```

---

## SEÇÃO 17 — MONITORAMENTO: DASHBOARD ZCC + MÉTRICAS HEADROOM

### API de Métricas

```bash
# Status geral de todos os loops
curl http://localhost:8080/api/loops/status

# Métricas do Headroom
curl http://localhost:8787/stats
curl http://localhost:8787/health

# Histórico por loop
curl http://localhost:8080/api/loops/pricing/history
```

### Painel HTML Simples (metrics/index.html)

```html
<!DOCTYPE html>
<html><head><title>ZEHLA Loops Dashboard</title>
<meta http-equiv="refresh" content="60">
<style>
body{font-family:system-ui;margin:2rem;background:#0a0a0a;color:#e0e0e0}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem}
.card{background:#1a1a1a;border:1px solid #333;border-radius:12px;padding:1.5rem}
.card h3{margin:0 0 .5rem;color:#4ecdc4}
.metric{font-size:2rem;font-weight:700;color:#ffe66d}
.card pre{font-size:.75rem;overflow-x:auto;color:#aaa}
</style></head><body>
<h1>ZEHLA Loop Engineering + Headroom</h1>
<div class="grid">
  <div class="card"><h3>Headroom Status</h3><div class="metric" id="hr-savings">--</div><pre id="hr-stats">Carregando...</pre></div>
  <div class="card"><h3>Loops Executados Hoje</h3><div class="metric" id="loop-count">--</div><pre id="loop-list">Carregando...</pre></div>
  <div class="card"><h3>Tokens Economizados</h3><div class="metric" id="tokens-saved">--</div><pre id="tokens-detail">Carregando...</pre></div>
  <div class="card"><h3>Custo Total Hoje</h3><div class="metric" id="total-cost">--</div><pre id="cost-detail">Carregando...</pre></div>
</div>
<script>
async function refresh(){
  try{
    const hr=await fetch('/stats').then(r=>r.json());
    document.getElementById('hr-savings').textContent=(hr.savings_percent||0).toFixed(1)+'%';
    document.getElementById('hr-stats').textContent=JSON.stringify(hr,null,2);
  }catch(e){}
}
refresh();setInterval(refresh,60000);
</script></body></html>
```

---

## SEÇÃO 18 — ROADMAP DE TESTES REAIS (3 FASES)

### Fase 1: Smoke Test (Hoje)

- [ ] Subir Docker Compose: `docker compose -f docker-compose.zehla-loops.yml up -d`
- [ ] Verificar Headroom healthy: `curl http://localhost:8787/health`
- [ ] Verificar Redis: `docker exec zehla-loops-redis redis-cli ping`
- [ ] Executar loop pricing em modo manual (1 iteração)
- [ ] Verificar compressão no log do Headroom
- [ ] Verificar STATUS.md atualizado
- [ ] **Gate:** Headroom comprimiu >50% tokens em 1 iteração

### Fase 2: Mock Tests (Semana 1)

- [ ] Executar 6 loops mock sequencialmente
- [ ] Verificar rubricas passando/falhando corretamente
- [ ] Verificar 3 guardas acionando
- [ ] Verificar logs JSONL append-only
- [ ] Verificar registro no Campo Akáshico
- [ ] Comparar custo com vs sem Headroom
- [ ] **Gate:** Todos os 6 mocks rodam sem erros; economia >60%

### Fase 3: Produção (Semana 2-3)

- [ ] Configurar schedules no scheduler
- [ ] Executar loops de madrugada (01:30, 02:00, 04:00)
- [ ] Verificar resultados no dashboard ZCC
- [ ] Ativar headroom learn
- [ ] Ajustar budgets com base em dados reais
- [ ] **Gate:** 3 noites consecutivas sem erros; economia >70%

---

## SEÇÃO 19 — ORÇAMENTO DE TOKENS E ECONOMIA HEADROOM POR LOOP

| Loop | Horário | Tokens/Iter (bruto) | Com Headroom | Economia | Custo/Execução (com HR) | Custo/Mês |
|---|---|---:|---:|---:|---:|---:|
| Pricing | 04:00 AM | 15.000 | 4.500 (70%) | 70% | $0.20 | $6.00 |
| Akashic | 02:00 AM | 25.000 | 5.000 (80%) | 80% | $0.08 | $2.40 |
| Competitor | 01:30 AM | 78.000 | 4.000 (95%) | 95% | $0.06 | $1.80 |
| Reviews | 07:00 AM | 20.000 | 6.000 (70%) | 70% | $0.27 | $8.10 |
| Marketing | 09:00 AM | 12.000 | 4.200 (65%) | 65% | $0.21 | $5.25 (seg-sex) |
| Auditoria | 22:00 PM | 18.000 | 5.400 (70%) | 70% | $0.24 | $7.20 |
| **TOTAL** | | **168.000** | **29.100** | **83%** | **$1.06/exec** | **~$30.75/mês** |

**SEM Headroom:** ~$168/mês | **COM Headroom:** ~$30.75/mês | **Economia:** **$137.25/mês (82%)**

---

## SEÇÃO 20 — REFERÊNCIAS CRUZADAS

| # | Documento | Relação com Este |
|---|---|---|
| 1 | `ZEHLA_HEADROOM_Plano_Implementacao_Completo.md` | Documento base de integração Headroom (24 seções) |
| 2 | `LOOPING_ENGINEERING_PESQUISA_COMPLETA.md` | Pesquisa original sobre Loop Engineering (14 seções) |
| 3 | `CAMPO_AKASHICO_ZEHLA/01_CAMPO_AKASHICO_ARQUITETURA.md` | Arquitetura de memória (4 camadas) |
| 4 | `ZEHLA_EVOLUCAO_03_Thompson_CADMAS_CTX.md` | Router neuroeconômico (Thompson Sampling) |
| 5 | `ZEHLA_AUDITORIA_OBRIGATORIA_DOCUMENTO_MESTRE.md` | 5 passos da auditoria obrigatória |
| 6 | `HERMES_ZEHLA_Brain/README.md` | Motor cognitivo Hermes Agent |
| 7 | [Headroom GitHub](https://github.com/chopratejas/headroom) | Repositório oficial (30K stars) |
| 8 | [Headroom Docs](https://headroom-docs.vercel.app) | Documentação oficial |

---

*Documento Nuclear ZEHLA — Loop Engineering + Headroom v2.0*
*Criado por Agente ZEHLA OS — 17/06/2026*
*Classificação: CONHECIMENTO ESTRATÉGICO*
