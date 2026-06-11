"""
CAMPO AKASHICO ZEHLA — Nucleo Python v1.0
==========================================
Sistema de memoria profunda para o ZEHLA Cognitive Hospitality OS.
Integra com: CADMAS-CTX, A-MEM (Zettelkasten), Thompson Sampling, ZCC.

Dependencias:
    pip install redis chromadb networkx numpy scipy community
"""

import hashlib
import json
import os
import time
import uuid
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional, Dict, Any, Tuple

import numpy as np


# ═══════════════════════════════════════════════════════════════
# CONSTANTS & CONFIGURATION
# ═══════════════════════════════════════════════════════════════

AKASHIC_STREAM_KEY = "whisper:stream"
AKASHIC_GROUP = "akashic_processors"

CAMADA_SUTIL_MAX_AGE_HOURS = 24
CAMADA_EPISODICA_MAX_AGE_DAYS = 90
CRISTALIZATION_INTERVAL_SECS = 900  # 15 minutos
CRISTALIZATION_BATCH_SIZE = 50

REDIS_WORKING_MEMORY_PREFIX = "akashic:working:"
REDIS_GUEST_PREFIX = "akashic:guest:"
REDIS_POUSADA_PREFIX = "akashic:pousada:"
REDIS_ALERT_CHANNEL = "akashic:alerts"

# CADMAS-CTX Integration
CADMAS_BUCKETS = {
    0: "faq_hours_operating", 1: "faq_location_access", 2: "faq_amenities_services",
    3: "faq_policies_rules", 4: "faq_general_misc",
    5: "pricing_simple_query", 6: "pricing_comparison", 7: "pricing_seasonal_promo",
    8: "pricing_negotiation",
    9: "booking_new_request", 10: "booking_modification", 11: "booking_cancellation",
    12: "booking_checkin_confirm",
    13: "complaint_cleanliness", 14: "complaint_noise", 15: "complaint_service_staff",
    16: "complaint_maintenance", 17: "complaint_food_beverage",
    18: "complaint_billing_charge",
    19: "sentiment_negative_deep", 20: "semantic_comparison", 21: "semantic_recommendation",
    22: "content_social_media", 23: "content_email_marketing", 24: "content_listing_desc",
    25: "review_google_trustpilot", 26: "review_booking_tripadvisor",
    27: "multilingual_english", 28: "multilingual_spanish", 29: "multilingual_other",
    30: "emergency_medical", 31: "emergency_safety",
}


class EpisodeOutcome(str, Enum):
    RESOLVED = "resolved"
    ESCALATED = "escalated"
    UNRESOLVED = "unresolved"
    POSITIVE_FEEDBACK = "positive_feedback"
    NEUTRAL = "neutral"
    ERROR = "error"


class KnowledgeCategory(str, Enum):
    INSIGHT = "insight"
    PATTERN = "pattern"
    PREFERENCE = "preference"
    ANOMALY = "anomaly"
    PREDICTION = "prediction"
    FACT = "fact"
    WARNING = "warning"


class PredictionType(str, Enum):
    DEMAND = "demand"
    CHURN_RISK = "churn_risk"
    PRICE_OPTIMAL = "price_optimal"
    COMPLAINT_LIKELY = "complaint_likely"
    REVENUE_FORECAST = "revenue_forecast"


# ═══════════════════════════════════════════════════════════════
# DATA STRUCTURES
# ═══════════════════════════════════════════════════════════════

@dataclass
class AkashicEpisode:
    """Memoria episodica — cada interacao viva com um hospede."""
    episode_id: str
    timestamp: str  # ISO 8601
    pousada_id: str
    source_channel: str

    guest_id: Optional[str] = None
    guest_profile: Optional[str] = None
    input_text: str = ""
    intent_classified: str = ""
    ai_response: str = ""
    provider_used: str = ""
    tier_used: int = 2

    outcome: str = EpisodeOutcome.NEUTRAL.value
    sentiment_after: float = 0.0
    duration_ms: int = 0
    tokens_used: int = 0

    seasonality: str = "regular"
    weather_context: Optional[str] = None
    occupancy_at_time: float = 0.0
    cadmas_bucket: int = 4  # faq_general_misc default
    was_sticky: bool = False

    # Metadata interno
    _processed: bool = False
    _crystalized: bool = False

    def to_dict(self) -> Dict[str, Any]:
        return {k: v for k, v in asdict(self).items() if not k.startswith("_")}

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "AkashicEpisode":
        return cls(**{k: v for k, v in data.items() if k in cls.__dataclass_fields__})


@dataclass
class AkashicKnowledge:
    """Conhecimento cristalizado — sabedoria extraida das experiencias."""
    knowledge_id: str
    crystalized_at: str
    source_episodes: List[str]
    pousada_id: str
    pousada_scope: str  # "specific" ou "global"

    category: str
    title: str
    content: str
    confidence: float = 0.5

    occurrence_count: int = 1
    first_seen: str = ""
    last_seen: str = ""

    embedding: Optional[List[float]] = None
    graph_node_id: Optional[str] = None

    actionable: bool = False
    action_suggested: Optional[str] = None
    zcc_alert_level: str = "info"  # "info", "warning", "critical"

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        if self.embedding is None:
            d.pop("embedding", None)
        return d


@dataclass
class AkashicPrediction:
    """Predicao gerada pelo campo akashico."""
    prediction_id: str
    created_at: str
    pousada_id: str
    prediction_type: str

    predicted_value: float
    confidence: float
    prediction_window: str

    based_on_episodes: List[str] = field(default_factory=list)
    based_on_knowledge: List[str] = field(default_factory=list)
    features_used: Dict[str, float] = field(default_factory=dict)

    actual_value: Optional[float] = None
    was_correct: Optional[bool] = None
    error_magnitude: Optional[float] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


# ═══════════════════════════════════════════════════════════════
# LAYER 1: CAMADA SUTIL (Ingestion Buffer)
# ═══════════════════════════════════════════════════════════════

class CamadaSutil:
    """
    Buffer de ingestao — Redis Streams.
    Captura eventos brutos e normaliza antes de processar.
    Latencia: <0.5ms por evento.
    """

    def __init__(self, redis_client):
        self.redis = redis_client

    def ingest(self, event_data: Dict[str, Any]) -> str:
        """Insere evento no Whisper Stream. Retorna stream ID."""
        event_data["_ingested_at"] = datetime.now(timezone.utc).isoformat()
        event_data["_id"] = str(uuid.uuid4())

        # Clean event_data for redis xadd (only accept str, int, float, bytes)
        cleaned_data = {}
        for k, v in event_data.items():
            if isinstance(v, bool):
                cleaned_data[k] = "true" if v else "false"
            elif v is None:
                cleaned_data[k] = ""
            elif isinstance(v, (dict, list)):
                import json
                cleaned_data[k] = json.dumps(v)
            else:
                cleaned_data[k] = v

        # XADD ao Redis Stream
        stream_id = self.redis.xadd(
            AKASHIC_STREAM_KEY,
            cleaned_data,
            maxlen=100000  # Limita stream a 100K mensagens (trim automatico)
        )
        return stream_id

    def read_pending(self, count: int = 100, block_ms: int = 1000):
        """Le eventos pendentes do Whisper Stream."""
        messages = self.redis.xreadgroup(
            AKASHIC_GROUP, "processor-1",
            {AKASHIC_STREAM_KEY: ">"},
            count=count, block=block_ms
        )
        return messages

    def ack(self, stream_id: str):
        """Confirma processamento de evento."""
        self.redis.xack(AKASHIC_STREAM_KEY, AKASHIC_GROUP, stream_id)


# ═══════════════════════════════════════════════════════════════
# LAYER 2: CAMADA EPISODICA (Episodic Memory)
# ═══════════════════════════════════════════════════════════════

class CamadaEpisodica:
    """
    Memoria episodica — SQLite WAL (append-only log).
    Armazena cada experiencia vivida com indexacao por pousada, hospede e tempo.
    Latencia: <5ms por escrita/leitura.
    """

    SCHEMA_EPISODES = """
    CREATE TABLE IF NOT EXISTS akashic_episodes (
        episode_id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        pousada_id TEXT NOT NULL,
        source_channel TEXT NOT NULL,
        guest_id TEXT,
        guest_profile TEXT,
        input_text TEXT,
        intent_classified TEXT,
        ai_response TEXT,
        provider_used TEXT,
        tier_used INTEGER DEFAULT 2,
        outcome TEXT DEFAULT 'neutral',
        sentiment_after REAL DEFAULT 0.0,
        duration_ms INTEGER DEFAULT 0,
        tokens_used INTEGER DEFAULT 0,
        seasonality TEXT DEFAULT 'regular',
        weather_context TEXT,
        occupancy_at_time REAL DEFAULT 0.0,
        cadmas_bucket INTEGER DEFAULT 4,
        was_sticky INTEGER DEFAULT 0,
        processed INTEGER DEFAULT 0,
        crystalized INTEGER DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_ep_pousada ON akashic_episodes(pousada_id, timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_ep_guest ON akashic_episodes(guest_id, timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_ep_bucket ON akashic_episodes(pousada_id, cadmas_bucket);
    CREATE INDEX IF NOT EXISTS idx_ep_outcome ON akashic_episodes(outcome, pousada_id);
    CREATE INDEX IF NOT EXISTS idx_ep_timestamp ON akashic_episodes(timestamp);
    CREATE INDEX IF NOT EXISTS idx_ep_processed ON akashic_episodes(processed) WHERE processed = 0;
    """

    SCHEMA_KNOWLEDGE = """
    CREATE TABLE IF NOT EXISTS akashic_knowledge (
        knowledge_id TEXT PRIMARY KEY,
        crystalized_at TEXT NOT NULL,
        source_episodes TEXT,
        pousada_id TEXT NOT NULL,
        pousada_scope TEXT DEFAULT 'specific',
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        confidence REAL DEFAULT 0.5,
        occurrence_count INTEGER DEFAULT 1,
        first_seen TEXT,
        last_seen TEXT,
        actionable INTEGER DEFAULT 0,
        action_suggested TEXT,
        zcc_alert_level TEXT DEFAULT 'info'
    );
    CREATE INDEX IF NOT EXISTS idx_kn_pousada ON akashic_knowledge(pousada_id, category);
    CREATE INDEX IF NOT EXISTS idx_kn_scope ON akashic_knowledge(pousada_scope, category);
    CREATE INDEX IF NOT EXISTS idx_kn_confidence ON akashic_knowledge(confidence DESC);
    """

    SCHEMA_PREDICTIONS = """
    CREATE TABLE IF NOT EXISTS akashic_predictions (
        prediction_id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL,
        pousada_id TEXT NOT NULL,
        prediction_type TEXT NOT NULL,
        predicted_value REAL NOT NULL,
        confidence REAL NOT NULL,
        prediction_window TEXT NOT NULL,
        actual_value REAL,
        was_correct INTEGER,
        error_magnitude REAL
    );
    CREATE INDEX IF NOT EXISTS idx_pr_pousada ON akashic_predictions(pousada_id, prediction_type);
    """

    def __init__(self, db_path: str):
        self.db_path = db_path
        os.makedirs(os.path.dirname(db_path) if os.path.dirname(db_path) else ".", exist_ok=True)
        self._init_db()

    def _init_db(self):
        """Inicializa SQLite em WAL mode com schema completo."""
        import sqlite3
        conn = sqlite3.connect(self.db_path)
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA synchronous=NORMAL")
        conn.execute("PRAGMA busy_timeout=5000")
        conn.execute("PRAGMA cache_size=-64000")  # 64MB cache
        conn.executescript(self.SCHEMA_EPISODES)
        conn.executescript(self.SCHEMA_KNOWLEDGE)
        conn.executescript(self.SCHEMA_PREDICTIONS)
        conn.commit()
        conn.close()

    def _get_conn(self):
        import sqlite3
        conn = sqlite3.connect(self.db_path)
        conn.execute("PRAGMA journal_mode=WAL")
        conn.row_factory = sqlite3.Row
        return conn

    def store_episode(self, episode: AkashicEpisode):
        """Armazena episodio na Camada 2. Latencia: <5ms."""
        conn = self._get_conn()
        try:
            conn.execute(
                """INSERT OR REPLACE INTO akashic_episodes
                VALUES (:episode_id, :timestamp, :pousada_id, :source_channel,
                        :guest_id, :guest_profile, :input_text, :intent_classified,
                        :ai_response, :provider_used, :tier_used, :outcome,
                        :sentiment_after, :duration_ms, :tokens_used, :seasonality,
                        :weather_context, :occupancy_at_time, :cadmas_bucket,
                        :was_sticky, 0, 0)""",
                episode.to_dict()
            )
            conn.commit()
        finally:
            conn.close()

    def store_knowledge(self, knowledge: AkashicKnowledge):
        """Armazena conhecimento cristalizado."""
        conn = self._get_conn()
        try:
            data = knowledge.to_dict()
            if isinstance(data.get("source_episodes"), list):
                data["source_episodes"] = json.dumps(data["source_episodes"])
            conn.execute(
                """INSERT OR REPLACE INTO akashic_knowledge
                (knowledge_id, crystalized_at, source_episodes, pousada_id, pousada_scope,
                 category, title, content, confidence, occurrence_count,
                 first_seen, last_seen, actionable, action_suggested, zcc_alert_level)
                VALUES (:knowledge_id, :crystalized_at, :source_episodes,
                        :pousada_id, :pousada_scope, :category, :title, :content,
                        :confidence, :occurrence_count, :first_seen, :last_seen,
                        :actionable, :action_suggested, :zcc_alert_level)""",
                data
            )
            conn.commit()
        finally:
            conn.close()

    def store_prediction(self, prediction: AkashicPrediction):
        """Armazena predicao do campo akashico."""
        conn = self._get_conn()
        try:
            conn.execute(
                """INSERT OR REPLACE INTO akashic_predictions
                VALUES (:prediction_id, :created_at, :pousada_id, :prediction_type,
                        :predicted_value, :confidence, :prediction_window,
                        :actual_value, :was_correct, :error_magnitude)""",
                prediction.to_dict()
            )
            conn.commit()
        finally:
            conn.close()

    def get_unprocessed_episodes(self, limit: int = 50) -> List[AkashicEpisode]:
        """Retorna episodios nao processados para cristalizacao."""
        conn = self._get_conn()
        try:
            rows = conn.execute(
                "SELECT * FROM akashic_episodes WHERE processed = 0 ORDER BY timestamp LIMIT ?",
                (limit,)
            ).fetchall()
            return [AkashicEpisode.from_dict(dict(r)) for r in rows]
        finally:
            conn.close()

    def mark_processed(self, episode_ids: List[str]):
        """Marca episodios como processados."""
        conn = self._get_conn()
        try:
            conn.executemany(
                "UPDATE akashic_episodes SET processed = 1 WHERE episode_id = ?",
                [(eid,) for eid in episode_ids]
            )
            conn.commit()
        finally:
            conn.close()

    def get_guest_history(self, guest_id: str, pousada_id: str, limit: int = 20) -> List[AkashicEpisode]:
        """Historico de interacoes de um hospede especifico."""
        conn = self._get_conn()
        try:
            rows = conn.execute(
                """SELECT * FROM akashic_episodes
                WHERE guest_id = ? AND pousada_id = ?
                ORDER BY timestamp DESC LIMIT ?""",
                (guest_id, pousada_id, limit)
            ).fetchall()
            return [AkashicEpisode.from_dict(dict(r)) for r in rows]
        finally:
            conn.close()

    def get_pousada_stats(self, pousada_id: str, days: int = 30) -> Dict[str, Any]:
        """Estatisticas agregadas da pousada."""
        conn = self._get_conn()
        try:
            since = datetime.now(timezone.utc).isoformat()[:10]
            stats = {}

            # Total de episodios
            row = conn.execute(
                "SELECT COUNT(*) as c FROM akashic_episodes WHERE pousada_id = ?",
                (pousada_id,)
            ).fetchone()
            stats["total_episodes"] = row["c"]

            # Episodios por bucket
            buckets = conn.execute(
                """SELECT cadmas_bucket, COUNT(*) as c FROM akashic_episodes
                WHERE pousada_id = ? GROUP BY cadmas_bucket""",
                (pousada_id,)
            ).fetchall()
            stats["by_bucket"] = {r["cadmas_bucket"]: r["c"] for r in buckets}

            # Outcome distribution
            outcomes = conn.execute(
                """SELECT outcome, COUNT(*) as c FROM akashic_episodes
                WHERE pousada_id = ? GROUP BY outcome""",
                (pousada_id,)
            ).fetchall()
            stats["by_outcome"] = {r["outcome"]: r["c"] for r in outcomes}

            # Sentiment average
            sent = conn.execute(
                "SELECT AVG(sentiment_after) as s FROM akashic_episodes WHERE pousada_id = ? AND sentiment_after != 0",
                (pousada_id,)
            ).fetchone()
            stats["avg_sentiment"] = round(sent["s"], 3) if sent["s"] else 0.0

            # Knowledge count
            kn = conn.execute(
                "SELECT COUNT(*) as c FROM akashic_knowledge WHERE pousada_id = ?",
                (pousada_id,)
            ).fetchone()
            stats["total_knowledge"] = kn["c"]

            return stats
        finally:
            conn.close()


# ═══════════════════════════════════════════════════════════════
# LAYER 3: CAMADA FLUIDA (Working Memory)
# ═══════════════════════════════════════════════════════════════

class CamadaFluida:
    """
    Memoria operacional — Redis Hash.
    Contexto ativo de hospedes e pousadas disponivel em <2ms.
    """

    def __init__(self, redis_client):
        self.redis = redis_client

    def update_guest_context(self, pousada_id: str, guest_id: str, data: Dict[str, Any]):
        """Atualiza working memory de um hospede. TTL: 24h."""
        key = f"{REDIS_GUEST_PREFIX}{pousada_id}:{guest_id}"
        self.redis.hset(key, mapping={k: str(v) for k, v in data.items()})
        self.redis.expire(key, 86400)  # 24h TTL

    def get_guest_context(self, pousada_id: str, guest_id: str) -> Dict[str, str]:
        """Recupera working memory de um hospede."""
        key = f"{REDIS_GUEST_PREFIX}{pousada_id}:{guest_id}"
        result = self.redis.hgetall(key)
        return {k.decode(): v.decode() for k, v in result.items()}

    def update_pousada_working(self, pousada_id: str, data: Dict[str, Any]):
        """Atualiza working memory da pousada. TTL: 1h."""
        key = f"{REDIS_POUSADA_PREFIX}{pousada_id}"
        self.redis.hset(key, mapping={k: str(v) for k, v in data.items()})
        self.redis.expire(key, 3600)

    def get_pousada_working(self, pousada_id: str) -> Dict[str, str]:
        """Recupera working memory da pousada."""
        key = f"{REDIS_POUSADA_PREFIX}{pousada_id}"
        result = self.redis.hgetall(key)
        return {k.decode(): v.decode() for k, v in result.items()}

    def record_realtime_metric(self, pousada_id: str, metric: str, value: float):
        """Registra metrica em tempo real."""
        key = f"{REDIS_WORKING_MEMORY_PREFIX}{pousada_id}:metrics"
        self.redis.hset(key, metric, str(value))
        self.redis.expire(key, 7200)  # 2h

    def emit_zcc_alert(self, pousada_id: str, alert_level: str, message: str,
                       knowledge_id: Optional[str] = None, action: Optional[str] = None):
        """Emite alerta para o ZCC via Redis Pub/Sub."""
        alert = {
            "alert_id": str(uuid.uuid4()),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "pousada_id": pousada_id,
            "level": alert_level,
            "message": message,
            "source": "campo_akashico",
            "knowledge_id": knowledge_id,
            "suggested_action": action,
        }
        self.redis.publish(REDIS_ALERT_CHANNEL, json.dumps(alert))
        return alert["alert_id"]


# ═══════════════════════════════════════════════════════════════
# LAYER 4: CAMADA RAIZ (Deep Memory / Knowledge Graph)
# ═══════════════════════════════════════════════════════════════

class CamadaRaiz:
    """
    Memoria profunda — ChromaDB (vector) + NetworkX (graph).
    Sabedoria cristalizada com busca hibrida (vector + PPR).
    Latencia: <10ms por query.
    """

    def __init__(self, chroma_path: str):
        import chromadb
        self.chroma = chromadb.PersistentClient(path=chroma_path)
        self.collections = {}
        self.graph = None
        self._init_graph()

    def _init_graph(self):
        import networkx as nx
        self.graph = nx.DiGraph()

    def get_or_create_collection(self, pousada_id: str):
        """Obtem ou cria colecao ChromaDB particionada por pousada."""
        if pousada_id not in self.collections:
            self.collections[pousada_id] = self.chroma.get_or_create_collection(
                name=f"akashic_{pousada_id}",
                metadata={"hnsw:space": "cosine", "hnsw:M": 32}
            )
        return self.collections[pousada_id]

    def get_global_collection(self):
        """Colecao global — apenas insights anonimizados."""
        if "global" not in self.collections:
            self.collections["global"] = self.chroma.get_or_create_collection(
                name="akashic_global",
                metadata={"hnsw:space": "cosine", "hnsw:M": 48}
            )
        return self.collections["global"]

    def store_knowledge_vector(self, knowledge: AkashicKnowledge, embedding: List[float]):
        """Armazena conhecimento com embedding vetorial."""
        if knowledge.pousada_scope == "global":
            collection = self.get_global_collection()
        else:
            collection = self.get_or_create_collection(knowledge.pousada_id)

        collection.upsert(
            ids=[knowledge.knowledge_id],
            documents=[knowledge.content],
            metadatas=[{
                "category": knowledge.category,
                "confidence": knowledge.confidence,
                "pousada_id": knowledge.pousada_id,
                "pousada_scope": knowledge.pousada_scope,
                "occurrence_count": knowledge.occurrence_count,
                "zcc_alert_level": knowledge.zcc_alert_level,
                "actionable": knowledge.actionable,
                "action_suggested": knowledge.action_suggested or "",
                "title": knowledge.title,
            }],
            embeddings=[embedding]
        )

        # Also add to knowledge graph
        self._add_graph_node(knowledge)

    def search_knowledge(self, pousada_id: str, query_embedding: List[float],
                         top_k: int = 10, min_confidence: float = 0.3) -> List[Dict]:
        """Busca hibrida: vector similarity + PPR fusion."""
        collection = self.get_or_create_collection(pousada_id)

        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            where={"confidence": {"$gte": min_confidence}}
        )

        # Formata resultados
        items = []
        if results and results["ids"] and results["ids"][0]:
            for i, kid in enumerate(results["ids"][0]):
                items.append({
                    "knowledge_id": kid,
                    "content": results["documents"][0][i] if results["documents"] else "",
                    "metadata": results["metadatas"][0][i] if results["metadatas"] else {},
                    "similarity": 1.0 - (results["distances"][0][i] if results["distances"] else 0),
                })

        # PPR boost (simplified)
        items = self._ppr_boost(items, pousada_id)

        return items

    def _add_graph_node(self, knowledge: AkashicKnowledge):
        """Adiciona no ao knowledge graph."""
        self.graph.add_node(
            knowledge.knowledge_id,
            category=knowledge.category,
            confidence=knowledge.confidence,
            pousada_id=knowledge.pousada_id,
            title=knowledge.title,
            last_seen=knowledge.last_seen,
        )

    def add_graph_link(self, source_id: str, target_id: str, link_type: str, weight: float = 1.0):
        """Adiciona link bidirecional ao knowledge graph."""
        self.graph.add_edge(source_id, target_id, type=link_type, weight=weight)
        # Inverso
        inverses = {
            "supports": "supported_by", "extends": "extended_by",
            "causes": "caused_by", "exemplifies": "exemplified_by",
            "temporal_before": "temporal_after", "contradicts": "contradicted_by",
            "analogous_to": "analogous_to",
        }
        inverse = inverses.get(link_type, link_type)
        self.graph.add_edge(target_id, source_id, type=inverse, weight=weight)

    def _ppr_boost(self, items: List[Dict], pousada_id: str, alpha: float = 0.2) -> List[Dict]:
        """Aplica Personalized PageRank boost."""
        if len(self.graph.nodes) < 5:
            return items

        try:
            import networkx as nx
            # PPR a partir de nos dos resultados
            personalization = {item["knowledge_id"]: 1.0 / len(items) for item in items}
            scores = nx.pagerank(self.graph, alpha=alpha, personalization=personalization, max_iter=100)

            # Fusion: alpha*sim + (1-alpha)*ppr
            for item in items:
                kid = item["knowledge_id"]
                ppr_score = scores.get(kid, 0.0)
                item["final_score"] = 0.6 * item["similarity"] + 0.4 * ppr_score

            items.sort(key=lambda x: x["final_score"], reverse=True)
        except Exception:
            pass  # Fallback to vector-only

        return items

    def get_graph_stats(self) -> Dict[str, int]:
        """Estatisticas do knowledge graph."""
        return {
            "nodes": self.graph.number_of_nodes(),
            "edges": self.graph.number_of_edges(),
            "communities": len(list(self.graph.subgraph(c)
                              for c in nx.community.greedy_modularity_communities(self.graph)))
                             if self.graph.number_of_nodes() > 10 else 0,
        }

    def snapshot_graph(self, filepath: str):
        """Salva snapshot do grafo em JSON."""
        import json as j
        data = nx.node_link_data(self.graph)
        os.makedirs(os.path.dirname(filepath) if os.path.dirname(filepath) else ".", exist_ok=True)
        with open(filepath, "w") as f:
            j.dump(data, f, default=str)


# ═══════════════════════════════════════════════════════════════
# CRYSTALLIZATION ENGINE — Ciclo Observar > Perceber > Entender
# ═══════════════════════════════════════════════════════════════

class CrystallizationEngine:
    """
    Motor de cristalizacao — transforma episodios em conhecimento.
    Executa em batch a cada 15 minutos ou 50 episodios.
    """

    def __init__(self, episodica: CamadaEpisodica, fluida: CamadaFluida,
                 raiz: CamadaRaiz, embedding_fn=None):
        self.episodica = episodica
        self.fluida = fluida
        self.raiz = raiz
        self.embedding_fn = embedding_fn or self._dummy_embedding
        self._last_run = time.time()

    def run_cycle(self):
        """Executa um ciclo completo de cristalizacao."""
        episodes = self.episodica.get_unprocessed_episodes(limit=CRISTALIZATION_BATCH_SIZE)
        if not episodes:
            return {"crystallized": 0, "patterns": 0, "anomalies": 0, "insights": 0, "total_knowledge_items": 0}

        results = {"crystallized": 0, "patterns": 0, "anomalies": 0, "insights": 0}

        # FASE 1: PERCEBER — Agrupar e analisar
        by_pousada = {}
        for ep in episodes:
            by_pousada.setdefault(ep.pousada_id, []).append(ep)

        for pousada_id, pousada_eps in by_pousada.items():
            # FASE 2: ENTENDER — Extrair padroes
            patterns = self._extract_patterns(pousada_id, pousada_eps)
            anomalies = self._detect_anomalies(pousada_id, pousada_eps)
            insights = self._generate_insights(pousada_id, pousada_eps)

            # FASE 3: AGIR — Armazenar e alertar
            for pattern in patterns:
                self._store_and_alert(pattern)
                results["patterns"] += 1

            for anomaly in anomalies:
                self._store_and_alert(anomaly)
                results["anomalies"] += 1

            for insight in insights:
                self._store_and_alert(insight)
                results["insights"] += 1

        # Marca episodios como processados
        episode_ids = [ep.episode_id for ep in episodes]
        self.episodica.mark_processed(episode_ids)
        results["crystallized"] = len(episodes)
        results["total_knowledge_items"] = results["patterns"] + results["anomalies"] + results["insights"]

        self._last_run = time.time()
        return results

    def _extract_patterns(self, pousada_id: str, episodes: List[AkashicEpisode]) -> List[AkashicKnowledge]:
        """Extrai padroes repetitivos dos episodios."""
        patterns = []
        bucket_counts = {}
        for ep in episodes:
            bucket_counts[ep.cadmas_bucket] = bucket_counts.get(ep.cadmas_bucket, 0) + 1

        # Padroes de bucket: buckets com alta frequencia
        for bucket, count in bucket_counts.items():
            if count >= 3:  # Padrao se aparece 3+ vezes
                bucket_name = CADMAS_BUCKETS.get(bucket, "unknown")
                confidence = min(0.95, 0.3 + count * 0.1)

                kn = AkashicKnowledge(
                    knowledge_id=f"pat_{pousada_id}_{bucket}_{hashlib.sha256(f'{bucket}{count}'.encode()).hexdigest()[:8]}",
                    crystalized_at=datetime.now(timezone.utc).isoformat(),
                    source_episodes=[ep.episode_id for ep in episodes if ep.cadmas_bucket == bucket],
                    pousada_id=pousada_id,
                    pousada_scope="specific",
                    category=KnowledgeCategory.PATTERN.value,
                    title=f"Alta frequencia: {bucket_name}",
                    content=f"Nos ultimos episodios, o bucket '{bucket_name}' apareceu {count} vezes. "
                            f"Isso indica demanda recorrente por este tipo de interacao. "
                            f"Considere criar resposta automatica ou conteudo pre-formatado.",
                    confidence=confidence,
                    occurrence_count=count,
                    first_seen=min(episodes, key=lambda e: e.timestamp).timestamp,
                    last_seen=max(episodes, key=lambda e: e.timestamp).timestamp,
                    actionable=True,
                    action_suggested=f"Criar template de resposta para {bucket_name}",
                    zcc_alert_level="info" if count < 5 else "warning",
                )
                patterns.append(kn)

        # Padroes de sentimento
        negative_eps = [ep for ep in episodes if ep.sentiment_after < -0.5]
        if len(negative_eps) >= 2:
            kn = AkashicKnowledge(
                knowledge_id=f"pat_{pousada_id}_sent_neg_{uuid.uuid4().hex[:8]}",
                crystalized_at=datetime.now(timezone.utc).isoformat(),
                source_episodes=[ep.episode_id for ep in negative_eps],
                pousada_id=pousada_id,
                pousada_scope="specific",
                category=KnowledgeCategory.PATTERN.value,
                title="Cluster de sentimento negativo detectado",
                content=f"{len(negative_eps)} interacoes com sentimento negativo recentes. "
                        f"Canais: {', '.join(set(ep.source_channel for ep in negative_eps))}. "
                        f"Buckets: {', '.join(str(ep.cadmas_bucket) for ep in negative_eps[:5])}.",
                confidence=min(0.9, 0.4 + len(negative_eps) * 0.15),
                occurrence_count=len(negative_eps),
                actionable=True,
                action_suggested="Investigar causas e preparar resposta proativa",
                zcc_alert_level="warning" if len(negative_eps) < 4 else "critical",
            )
            patterns.append(kn)

        return patterns

    def _detect_anomalies(self, pousada_id: str, episodes: List[AkashicEpisode]) -> List[AkashicKnowledge]:
        """Detecta anomalias — desvios significativos do padrao normal."""
        anomalies = []

        # Anomalia 1: Reclamacoes em buckets normalmente FAQ (insolito)
        complaint_buckets = {13, 14, 15, 16, 17, 18, 19}
        for ep in episodes:
            if ep.cadmas_bucket in complaint_buckets and ep.outcome == EpisodeOutcome.ESCALATED.value:
                kn = AkashicKnowledge(
                    knowledge_id=f"ano_{pousada_id}_{ep.episode_id[:12]}",
                    crystalized_at=datetime.now(timezone.utc).isoformat(),
                    source_episodes=[ep.episode_id],
                    pousada_id=pousada_id,
                    pousada_scope="specific",
                    category=KnowledgeCategory.ANOMALY.value,
                    title=f"Reclamacao escalada: {CADMAS_BUCKETS.get(ep.cadmas_bucket, '?')}",
                    content=f"Reclamacao escalada detectada em {ep.source_channel}: '{ep.input_text[:100]}'. "
                            f"Resposta: '{ep.ai_response[:100]}'. Sentimento: {ep.sentiment_after:.2f}",
                    confidence=0.8,
                    actionable=True,
                    action_suggested="Revisar causa raiz e preparar melhoria",
                    zcc_alert_level="critical",
                )
                anomalies.append(kn)

        # Anomalia 2: Troca de hospede na mesma sessao sem sticky
        bounced = [ep for ep in episodes if not ep.was_sticky and ep.tier_used >= 2]
        if len(bounced) >= 5:
            kn = AkashicKnowledge(
                knowledge_id=f"ano_{pousada_id}_bounce_{uuid.uuid4().hex[:8]}",
                crystalized_at=datetime.now(timezone.utc).isoformat(),
                source_episodes=[ep.episode_id for ep in bounced[:10]],
                pousada_id=pousada_id,
                pousada_scope="specific",
                category=KnowledgeCategory.ANOMALY.value,
                title=f"Alta taxa de bounce: {len(bounced)} episodios sem sticky",
                content=f"{len(bounced)} interacoes onde o hospede nao continuou na mesma sessao. "
                        f"Buckets afetados: {', '.join(str(ep.cadmas_bucket) for ep in bounced[:5])}. "
                        f"Isso pode indicar insatisfacao com respostas ou desistencia.",
                confidence=0.7,
                actionable=True,
                action_suggested="Revisar qualidade das respostas nos buckets afetados",
                zcc_alert_level="warning",
            )
            anomalies.append(kn)

        return anomalies

    def _generate_insights(self, pousada_id: str, episodes: List[AkashicEpisode]) -> List[AkashicKnowledge]:
        """Gera insights acionaveis a partir dos episodios."""
        insights = []

        # Insight 1: Melhor horario para marketing
        channel_hours = {}
        for ep in episodes:
            if ep.source_channel in ("whatsapp", "instagram"):
                hour = int(ep.timestamp.split("T")[1].split(":")[0]) if "T" in ep.timestamp else 12
                channel_hours.setdefault(ep.source_channel, []).append(hour)

        for channel, hours in channel_hours.items():
            if len(hours) >= 3:
                avg_hour = np.mean(hours)
                peak_hour = int(np.median(hours))
                kn = AkashicKnowledge(
                    knowledge_id=f"ins_{pousada_id}_{channel}_peak_{uuid.uuid4().hex[:8]}",
                    crystalized_at=datetime.now(timezone.utc).isoformat(),
                    source_episodes=[ep.episode_id for ep in episodes[:3]],
                    pousada_id=pousada_id,
                    pousada_scope="specific",
                    category=KnowledgeCategory.INSIGHT.value,
                    title=f"Pico de interacao via {channel}: {peak_hour}h",
                    content=f"Hospedes interagem mais via {channel} por volta das {peak_hour}h "
                            f"(media: {avg_hour:.1f}h, n={len(hours)}). "
                            f"Recomendacao: concentrar campanhas e mensagens ativas neste horario.",
                    confidence=min(0.85, 0.4 + len(hours) * 0.1),
                    occurrence_count=len(hours),
                    actionable=True,
                    action_suggested=f"Agendar campanhas {channel} para {peak_hour}h",
                    zcc_alert_level="info",
                )
                insights.append(kn)

        # Insight 2: Conversao por provider/tier
        by_provider = {}
        for ep in episodes:
            if ep.outcome == EpisodeOutcome.RESOLVED.value:
                key = f"{ep.provider_used}_t{ep.tier_used}"
                by_provider[key] = by_provider.get(key, 0) + 1

        if by_provider:
            best = max(by_provider, key=by_provider.get)
            kn = AkashicKnowledge(
                knowledge_id=f"ins_{pousada_id}_provider_{uuid.uuid4().hex[:8]}",
                crystalized_at=datetime.now(timezone.utc).isoformat(),
                source_episodes=[ep.episode_id for ep in episodes[:5]],
                pousada_id=pousada_id,
                pousada_scope="specific",
                category=KnowledgeCategory.INSIGHT.value,
                title=f"Melhor resolvedor: {best} ({by_provider[best]} resolucoes)",
                content=f"Neste periodo, '{best}' teve a melhor taxa de resolucao. "
                        f"Distribuicao: {json.dumps(by_provider)}. "
                        f"Recomendacao: priorizar este provider quando possivel.",
                confidence=0.7,
                actionable=True,
                action_suggested=f"Ajustar Thompson Sampling prior para {best}",
                zcc_alert_level="info",
            )
            insights.append(kn)

        return insights

    def _store_and_alert(self, knowledge: AkashicKnowledge):
        """Armazena conhecimento e emite alerta se necessario."""
        # Armazena na episodica (SQLite)
        self.episodica.store_knowledge(knowledge)

        # Armazena na raiz (ChromaDB + Graph)
        embedding = self.embedding_fn(knowledge.content)
        self.raiz.store_knowledge_vector(knowledge, embedding)

        # Emite alerta ZCC se acionavel
        if knowledge.actionable and knowledge.zcc_alert_level in ("warning", "critical"):
            self.fluida.emit_zcc_alert(
                pousada_id=knowledge.pousada_id,
                alert_level=knowledge.zcc_alert_level,
                message=f"[{knowledge.category.upper()}] {knowledge.title}: {knowledge.content[:200]}",
                knowledge_id=knowledge.knowledge_id,
                action=knowledge.action_suggested,
            )

    @staticmethod
    def _dummy_embedding(text: str) -> List[float]:
        """Embedding placeholder — substituir por embedding real."""
        # Em producao, use: sentence-transformers, OpenAI embeddings, ou Anthropic embeddings
        vec = np.zeros(384)
        for i, char in enumerate(text[:100]):
            vec[i % 384] += ord(char) / 1000.0
        return (vec / (np.linalg.norm(vec) + 1e-8)).tolist()


# ═══════════════════════════════════════════════════════════════
# CAMPO AKASHICO — Orquestrador Principal
# ═══════════════════════════════════════════════════════════════

class CampoAkashico:
    """
    O Campo Akashico ZEHLA — Orquestrador das 4 camadas de memoria.
    Ponto de entrada unificado para ingestao, consulta e cristalizacao.
    """

    def __init__(self, redis_url: str, db_base_path: str, chroma_path: str):
        import redis
        self.redis = redis.from_url(redis_url, decode_responses=True, ssl_cert_reqs=None)
        self.sutil = CamadaSutil(self.redis)
        self.episodica = CamadaEpisodica(os.path.join(db_base_path, "akashic_episodica.db"))
        self.fluida = CamadaFluida(self.redis)
        self.raiz = CamadaRaiz(chroma_path)
        self.cristalizador = CrystallizationEngine(self.episodica, self.fluida, self.raiz)
        self._running = False

    def ingest_event(self, event_data: Dict[str, Any]) -> str:
        """Ingesta evento no Campo Akashico. Ponto de entrada principal."""
        # Validacao minima
        required = ["pousada_id", "source_channel"]
        for field in required:
            if field not in event_data:
                raise ValueError(f"Campo obrigatorio: {field}")

        # Enrichment basico
        event_data.setdefault("timestamp", datetime.now(timezone.utc).isoformat())
        event_data.setdefault("cadmas_bucket", 4)  # faq_general_misc
        event_data.setdefault("outcome", "neutral")
        event_data.setdefault("sentiment_after", 0.0)

        # Camada 1: Buffer
        stream_id = self.sutil.ingest(event_data)

        # Camada 2: Episodica (imediato)
        episode = AkashicEpisode(
            episode_id=event_data.get("_id", str(uuid.uuid4())),
            timestamp=event_data["timestamp"],
            pousada_id=event_data["pousada_id"],
            source_channel=event_data["source_channel"],
            guest_id=event_data.get("guest_id"),
            guest_profile=event_data.get("guest_profile"),
            input_text=event_data.get("input_text", ""),
            intent_classified=event_data.get("intent_classified", ""),
            ai_response=event_data.get("ai_response", ""),
            provider_used=event_data.get("provider_used", ""),
            tier_used=event_data.get("tier_used", 2),
            outcome=event_data.get("outcome", "neutral"),
            sentiment_after=float(event_data.get("sentiment_after", 0)),
            duration_ms=event_data.get("duration_ms", 0),
            tokens_used=event_data.get("tokens_used", 0),
            seasonality=event_data.get("seasonality", "regular"),
            weather_context=event_data.get("weather_context"),
            occupancy_at_time=float(event_data.get("occupancy_at_time", 0)),
            cadmas_bucket=int(event_data.get("cadmas_bucket", 4)),
            was_sticky=event_data.get("was_sticky", False),
        )
        self.episodica.store_episode(episode)

        # Camada 3: Working memory (imediato)
        if event_data.get("guest_id"):
            self.fluida.update_guest_context(
                event_data["pousada_id"],
                event_data["guest_id"],
                {
                    "last_interaction": event_data["timestamp"],
                    "last_channel": event_data["source_channel"],
                    "last_bucket": str(event_data["cadmas_bucket"]),
                    "last_sentiment": str(event_data.get("sentiment_after", 0)),
                }
            )

        return stream_id

    def query_context(self, pousada_id: str, query_text: str,
                     top_k: int = 10) -> List[Dict]:
        """Consulta o campo akashico por contexto relevante."""
        embedding = self.cristalizador.embedding_fn(query_text)
        return self.raiz.search_knowledge(pousada_id, embedding, top_k=top_k)

    def get_guest_profile(self, pousada_id: str, guest_id: str) -> Dict[str, Any]:
        """Perfil completo de um hospede (working + episodico)."""
        # Working memory
        working = self.fluida.get_guest_context(pousada_id, guest_id)

        # Historico de episodios
        history = self.episodica.get_guest_history(guest_id, pousada_id, limit=20)

        # Aggregation
        if history:
            avg_sentiment = np.mean([ep.sentiment_after for ep in history if ep.sentiment_after != 0])
            bucket_counts = {}
            for ep in history:
                bucket_counts[ep.cadmas_bucket] = bucket_counts.get(ep.cadmas_bucket, 0) + 1
            top_bucket = max(bucket_counts, key=bucket_counts.get) if bucket_counts else 4

            return {
                **working,
                "total_interactions": len(history),
                "avg_sentiment": round(avg_sentiment, 3),
                "most_common_bucket": CADMAS_BUCKETS.get(top_bucket, "unknown"),
                "last_interaction": history[0].timestamp if history else None,
                "preferred_channel": max(
                    set(ep.source_channel for ep in history),
                    key=lambda c: sum(1 for ep in history if ep.source_channel == c)
                ) if history else None,
            }

        return {**working, "total_interactions": 0}

    def get_pousada_dashboard(self, pousada_id: str) -> Dict[str, Any]:
        """Dashboard completo do Campo Akashico para o ZCC."""
        stats = self.episodica.get_pousada_stats(pousada_id)
        graph_stats = self.raiz.get_graph_stats()
        recent_insights = self.episodica.get_unprocessed_episodes(limit=5)

        return {
            "pousada_id": pousada_id,
            "total_memories": stats.get("total_episodes", 0),
            "total_knowledge": stats.get("total_knowledge", 0),
            "avg_sentiment": stats.get("avg_sentiment", 0),
            "graph": graph_stats,
            "by_bucket": stats.get("by_bucket", {}),
            "by_outcome": stats.get("by_outcome", {}),
            "recent_episodes": [ep.to_dict() for ep in recent_insights],
        }

    def start_cristalization_loop(self, interval_secs: int = CRISTALIZATION_INTERVAL_SECS):
        """Inicia loop de cristalizacao em background."""
        import threading
        self._running = True

        def _loop():
            while self._running:
                try:
                    results = self.cristalizador.run_cycle()
                    if results["total_knowledge_items"] > 0:
                        print(f"[Akashico] Ciclo: {results}")
                except Exception as e:
                    print(f"[Akashico] Erro no ciclo: {e}")
                time.sleep(interval_secs)

        thread = threading.Thread(target=_loop, daemon=True, name="akashic-cristalization")
        thread.start()
        return thread

    def stop(self):
        """Para o loop de cristalizacao."""
        self._running = False


# ═══════════════════════════════════════════════════════════════
# FASTAPI INTEGRATION (ZCC API Routes)
# ═══════════════════════════════════════════════════════════════

def create_akashic_routes(akashico: CampoAkashico):
    """Cria rotas FastAPI para o Campo Akashico."""
    from fastapi import APIRouter, HTTPException
    from pydantic import BaseModel

    router = APIRouter(prefix="/api/v2/akashic", tags=["campo-akashico"])

    class IngestEvent(BaseModel):
        pousada_id: str
        source_channel: str
        guest_id: Optional[str] = None
        guest_profile: Optional[str] = None
        input_text: Optional[str] = ""
        ai_response: Optional[str] = ""
        provider_used: Optional[str] = ""
        tier_used: int = 2
        outcome: str = "neutral"
        sentiment_after: float = 0.0
        cadmas_bucket: int = 4
        was_sticky: bool = False

    @router.post("/ingest")
    async def ingest(event: IngestEvent):
        stream_id = akashico.ingest_event(event.model_dump())
        return {"status": "ingested", "stream_id": stream_id}

    @router.get("/guest/{pousada_id}/{guest_id}")
    async def guest_profile(pousada_id: str, guest_id: str):
        profile = akashico.get_guest_profile(pousada_id, guest_id)
        return profile

    @router.get("/dashboard/{pousada_id}")
    async def dashboard(pousada_id: str):
        return akashico.get_pousada_dashboard(pousada_id)

    @router.get("/search/{pousada_id}")
    async def search(pousada_id: str, query: str, top_k: int = 10):
        results = akashico.query_context(pousada_id, query, top_k=top_k)
        return {"results": results, "count": len(results)}

    @router.get("/stats/{pousada_id}")
    async def stats(pousada_id: str):
        return akashico.episodica.get_pousada_stats(pousada_id)

    @router.post("/cristalize")
    async def trigger_cristalization():
        results = akashico.cristalizador.run_cycle()
        return results

    @router.get("/health")
    async def health():
        return {"status": "alive", "timestamp": datetime.now(timezone.utc).isoformat()}

    return router


# ═══════════════════════════════════════════════════════════════
# INITIALIZATION
# ═══════════════════════════════════════════════════════════════

def initialize_akashico(
    redis_url: str = "redis://localhost:6379",
    db_path: str = "./zehla_data/akashic",
    chroma_path: str = "./zehla_chroma",
    start_loop: bool = True
) -> CampoAkashico:
    """
    Inicializa o Campo Akashico completo.
    Retorna a instancia orquestradora.
    """
    print("[Akashico] Inicializando Campo Akashico ZEHLA...")
    print(f"[Akashico] Redis: {redis_url}")
    print(f"[Akashico] DB Path: {db_path}")
    print(f"[Akashico] ChromaDB: {chroma_path}")

    akashico = CampoAkashico(redis_url, db_path, chroma_path)

    if start_loop:
        akashico.start_cristalization_loop()
        print("[Akashico] Loop de cristalizacao iniciado (15min)")

    print("[Akashico] Campo Akashico ZEHLA inicializado com sucesso.")
    return akashico


# ═══════════════════════════════════════════════════════════════
# STANDALONE TEST
# ═══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    # Demo standalone (sem Redis real)
    print("=" * 60)
    print("CAMPO AKASHICO ZEHLA — Demo Standalone")
    print("=" * 60)

    # Usa SQLite apenas (sem Redis para demo)
    import sqlite3 as _sqlite

    db_path = "/tmp/akashic_demo.db"
    chroma_path = "/tmp/akashic_chroma_demo"

    episodica = CamadaEpisodica(db_path)
    raiz = CamadaRaiz(chroma_path)

    class DummyRedis:
        def xadd(self, *a, **kw): return "demo_stream_id"
        def hset(self, *a, **kw): pass
        def expire(self, *a, **kw): pass
        def hgetall(self, *a, **kw): return {}
        def publish(self, *a, **kw): pass
        def xreadgroup(self, *a, **kw): return []
        def xack(self, *a, **kw): pass
        def from_url(self, *a, **kw): return DummyRedis()

    fluida = CamadaFluida(DummyRedis())
    engine = CrystallizationEngine(episodica, fluida, raiz)

    # Simula episodios
    print("\nSimulando ingestao de episodios...")
    for i in range(10):
        ep = AkashicEpisode(
            episode_id=f"ep_demo_{i:03d}",
            timestamp=datetime.now(timezone.utc).isoformat(),
            pousada_id="pousada_42",
            source_channel="whatsapp" if i % 2 == 0 else "instagram",
            guest_id=f"guest_{i % 3}",
            input_text=f"Pergunta {i}: Horario do check-in?",
            ai_response=f"Check-in a partir das 14h. Reserva: {i}",
            provider_used="claude-3.5-sonnet",
            tier_used=2,
            outcome="resolved" if i % 3 != 0 else "escalated",
            sentiment_after=0.3 + (i * 0.1),
            cadmas_bucket=0,  # faq_hours_operating
        )
        episodica.store_episode(ep)

    print(f"10 episodios armazenados")

    # Cristalizacao
    print("\nExecutando cristalizacao...")
    results = engine.run_cycle()
    print(f"Resultados: {results}")

    # Dashboard
    stats = episodica.get_pousada_stats("pousada_42")
    print(f"\nStats: {stats}")

    print("\nDemo concluida com sucesso!")
    print("=" * 60)
