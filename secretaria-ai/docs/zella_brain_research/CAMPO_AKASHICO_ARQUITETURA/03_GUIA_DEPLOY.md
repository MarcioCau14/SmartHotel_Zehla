# Campo Akashico — Guia de Deploy e Configuracao

## Requisitos

```bash
# Python 3.11+
pip install redis chromadb networkx numpy scipy fastapi uvicorn

# Redis (Upstash ou local)
# ChromaDB (local, ja instalado)
# SQLite (builtin)
```

## Configuracao Rapida

### 1. Variaveis de Ambiente

```bash
# .env
REDIS_URL=redis://localhost:6379
AKASHIC_DB_PATH=./zehla_data/akashic
AKASHIC_CHROMA_PATH=./zehla_chroma
ZEHLA_ENCRYPTION_KEY=sua-chave-master-32-caracteres-aqui
```

### 2. Inicializacao no FastAPI

```python
# main.py (ZEHLA Backend)
from fastapi import FastAPI
from campo_akashico_core import (
    initialize_akashico,
    create_akashic_routes
)

app = FastAPI(title="ZEHLA OS")

# Inicializa Campo Akashico
akashico = initialize_akashico(
    redis_url=os.getenv("REDIS_URL"),
    db_path=os.getenv("AKASHIC_DB_PATH"),
    chroma_path=os.getenv("AKASHIC_CHROMA_PATH"),
    start_loop=True  # Inicia cristalizacao automatica
)

# Registra rotas
app.include_router(create_akashic_routes(akashico))
```

### 3. Integracao com Whisper Stream (Ingestao Automatica)

```python
# Em cada canal de entrada (WhatsApp, Booking, etc.)

async def on_whatsapp_message(message):
    """Chamado quando chega mensagem WhatsApp."""
    await akashico.ingest_event({
        "pousada_id": message.pousada_id,
        "source_channel": "whatsapp",
        "guest_id": message.guest_id,
        "input_text": message.text,
        "cadmas_bucket": classify_cadmas(message.text),
        "sentiment_after": analyze_sentiment(message.text),
        "occupancy_at_time": get_current_occupancy(message.pousada_id),
    })

async def on_booking_event(event):
    """Chamado quando ha evento de reserva."""
    await akashico.ingest_event({
        "pousada_id": event.pousada_id,
        "source_channel": "booking",
        "guest_id": event.guest_id,
        "input_text": f"Reserva {event.type}: {event.room_type}",
        "cadmas_bucket": 9 if event.type == "new" else 10,
        "outcome": "resolved",
        "occupancy_at_time": get_current_occupancy(event.pousada_id),
    })

async def on_google_review(review):
    """Chamado quando chega review do Google."""
    await akashico.ingest_event({
        "pousada_id": review.pousada_id,
        "source_channel": "reviews",
        "input_text": review.text,
        "sentiment_after": review.sentiment,
        "cadmas_bucket": 25,
        "outcome": "positive_feedback" if review.rating >= 4 else "escalated",
    })
```

### 4. Integracao com A-MEM (Notas Atomicas)

```python
# O cristalizador automaticamente cria notas atomicas no A-MEM
# quando gera knowledge. Basta configurar a ponte:

from campo_akashico_core import KnowledgeCategory

def knowledge_to_amem_note(knowledge):
    """Converte conhecimento akashico em nota A-MEM."""
    category_map = {
        KnowledgeCategory.PATTERN: "pattern",
        KnowledgeCategory.PREFERENCE: "preference",
        KnowledgeCategory.INSIGHT: "insight",
        KnowledgeCategory.ANOMALY: "learning",
        KnowledgeCategory.FACT: "fact",
        KnowledgeCategory.WARNING: "policy",
    }
    return {
        "title": knowledge.title,
        "content": knowledge.content,
        "category": category_map.get(knowledge.category, "insight"),
        "source": f"akashic:{knowledge.knowledge_id}",
        "confidence": knowledge.confidence,
        "pousada_scope": knowledge.pousada_id,
        "tags": [knowledge.category, knowledge.pousada_scope],
    }
```

### 5. Integracao com Thompson Sampling

```python
# O Akashico realimenta os priors do Thompson Sampling
# com dados reais de performance por provider/bucket

def update_thompson_priors_from_akashico(akashico, router):
    """Atualiza priors do router com historico real do Akashico."""
    for pousada_id in akashico.get_active_pousadas():
        stats = akashico.episodica.get_pousada_stats(pousada_id)

        for bucket_id, count in stats.get("by_bucket", {}).items():
            # Calcula taxa de resolucao por bucket
            outcomes = stats.get("by_outcome", {})
            resolved = outcomes.get("resolved", 0)
            total = resolved + outcomes.get("escalated", 0) + outcomes.get("unresolved", 0)

            if total > 0:
                success_rate = resolved / total
                # Atualiza prior do Thompson Sampling
                router.update_prior(
                    bucket=bucket_id,
                    provider="claude-3.5-sonnet",  # ou dinamicamente
                    pseudo_observations=total,
                    success_rate=success_rate,
                )
```

### 6. ZCC Dashboard Integration

```javascript
// Frontend ZCC — consumir API do Campo Akashico

// Dashboard de Memorias Vivas
async function loadAkashicDashboard(pousadaId) {
  const response = await fetch(`/api/v2/akashic/dashboard/${pousadaId}`);
  const data = await response.json();

  // Total de memorias
  document.getElementById('total-memories').textContent = data.total_memories;

  // Sentimento medio
  document.getElementById('avg-sentiment').textContent = (data.avg_sentiment * 100).toFixed(0) + '%';

  // Knowledge Graph stats
  document.getElementById('graph-nodes').textContent = data.graph.nodes;
  document.getElementById('graph-edges').textContent = data.graph.edges;

  // Distribuicao por bucket
  renderBucketChart(data.by_bucket);
}

// Alertas em tempo real via WebSocket
const alertSocket = new WebSocket('/ws/akashic/alerts');
alertSocket.onmessage = (event) => {
  const alert = JSON.parse(event.data);
  showNotification(alert.level, alert.message, alert.suggested_action);
};
```

## Monitoramento

```bash
# Health check
curl http://localhost:8000/api/v2/akashic/health

# Stats por pousada
curl http://localhost:8000/api/v2/akashic/stats/pousada_42

# Trigger cristalizacao manual
curl -X POST http://localhost:8000/api/v2/akashic/cristalize

# Busca semantica
curl "http://localhost:8000/api/v2/akashic/search/pousada_42?query=preco+feriado&top_k=5"
```

## Custos Estimados

| Componente | Tecnologia | Custo/Mes |
|-----------|-----------|-----------|
| Episodica | SQLite (local) | R$ 0 |
| Fluida | Redis Hash (Upstash) | R$ 20-50 |
| Raiz | ChromaDB (local) | R$ 0 |
| Cristalizacao | Python (CPU) | R$ 0 |
| Embeddings | sentence-transformers (local) | R$ 0 |
| ZCC Integration | FastAPI | R$ 0 |
| **TOTAL** | | **R$ 20-50/mes** |

*Se usar Claude Fable 5 para cristalizacao profunda: +R$6/ciclo (~R$30/mes)*
