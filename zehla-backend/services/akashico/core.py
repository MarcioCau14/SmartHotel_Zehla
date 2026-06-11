"""
CAMPO AKASHICO ZEHLA — Core Engine v1.0
==========================================
4 camadas de memoria: Sutil (Redis Streams), Episodica (SQLite WAL),
Fluida (Redis Hash), Raiz (ChromaDB + NetworkX).
"""

import hashlib
import json
import os
import time
import uuid
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional, Dict, Any

import numpy as np


# ═══════════════════════════════════════════════════════════════
# CONSTANTS
# ═══════════════════════════════════════════════════════════════

AKASHIC_STREAM_KEY = "whisper:stream"
AKASHIC_GROUP = "akashic_processors"

CRISTALIZATION_INTERVAL_SECS = 900  # 15 min
CRISTALIZATION_BATCH_SIZE = 50

REDIS_GUEST_PREFIX = "akashic:guest:"
REDIS_POUSADA_PREFIX = "akashic:pousada:"
REDIS_ALERT_CHANNEL = "akashic:alerts"

CADMAS_BUCKETS = {
    0: "faq_hours_operating", 1: "faq_location_access", 2: "faq_amenities_services",
    3: "faq_policies_rules", 4: "faq_general_misc",
    5: "pricing_simple_query", 6: "pricing_comparison", 7: "pricing_seasonal_promo",
    8: "pricing_negotiation",
    9: "booking_new_request", 10: "booking_modification", 11: "booking_cancellation",
    12: "booking_checkin_confirm",
    13: "complaint_cleanliness", 14: "complaint_noise", 15: "complaint_service_staff",
    16: "complaint_maintenance", 17: "complaint_food_beverage", 18: "complaint_billing_charge",
    19: "sentiment_negative_deep",
    20: "semantic_comparison", 21: "semantic_recommendation",
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


# ═══════════════════════════════════════════════════════════════
# DATA STRUCTURES
# ═══════════════════════════════════════════════════════════════

@dataclass
class AkashicEpisode:
    episode_id: str
    timestamp: str
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
    cadmas_bucket: int = 4
    was_sticky: bool = False
    _processed: bool = False
    _crystalized: bool = False

    def to_dict(self) -> Dict[str, Any]:
        return {k: v for k, v in asdict(self).items() if not k.startswith("_")}

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "AkashicEpisode":
        return cls(**{k: v for k, v in data.items() if k in cls.__dataclass_fields__})


@dataclass
class AkashicKnowledge:
    knowledge_id: str
    crystalized_at: str
    source_episodes: List[str]
    pousada_id: str
    pousada_scope: str
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
    zcc_alert_level: str = "info"

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        if self.embedding is None:
            d.pop("embedding", None)
        return d


@dataclass
class AkashicPrediction:
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
# LAYER 1: CAMADA SUTIL (Redis Streams — <0.5ms)
# ═══════════════════════════════════════════════════════════════

class CamadaSutil:
    def __init__(self, redis_client):
        self.redis = redis_client

    def ingest(self, event_data: Dict[str, Any]) -> str:
        event_data["_ingested_at"] = datetime.now(timezone.utc).isoformat()
        event_data["_id"] = str(uuid.uuid4())
        stream_id = self.redis.xadd(AKASHIC_STREAM_KEY, event_data, maxlen=100000)
        return stream_id

    def read_pending(self, count: int = 100, block_ms: int = 1000):
        return self.redis.xreadgroup(
            AKASHIC_GROUP, "processor-1",
            {AKASHIC_STREAM_KEY: ">"},
            count=count, block=block_ms
        )

    def ack(self, stream_id: str):
        self.redis.xack(AKASHIC_STREAM_KEY, AKASHIC_GROUP, stream_id)


# ═══════════════════════════════════════════════════════════════
# LAYER 2: CAMADA EPISODICA (SQLite WAL — <5ms)
# ═══════════════════════════════════════════════════════════════

class CamadaEpisodica:
    SCHEMA = """
    CREATE TABLE IF NOT EXISTS akashic_episodes (
        episode_id TEXT PRIMARY KEY, timestamp TEXT NOT NULL,
        pousada_id TEXT NOT NULL, source_channel TEXT NOT NULL,
        guest_id TEXT, guest_profile TEXT,
        input_text TEXT, intent_classified TEXT, ai_response TEXT,
        provider_used TEXT, tier_used INTEGER DEFAULT 2,
        outcome TEXT DEFAULT 'neutral', sentiment_after REAL DEFAULT 0.0,
        duration_ms INTEGER DEFAULT 0, tokens_used INTEGER DEFAULT 0,
        seasonality TEXT DEFAULT 'regular', weather_context TEXT,
        occupancy_at_time REAL DEFAULT 0.0, cadmas_bucket INTEGER DEFAULT 4,
        was_sticky INTEGER DEFAULT 0, processed INTEGER DEFAULT 0, crystalized INTEGER DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_ep_pousada ON akashic_episodes(pousada_id, timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_ep_guest ON akashic_episodes(guest_id, timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_ep_bucket ON akashic_episodes(pousada_id, cadmas_bucket);
    CREATE INDEX IF NOT EXISTS idx_ep_processed ON akashic_episodes(processed) WHERE processed = 0;

    CREATE TABLE IF NOT EXISTS akashic_knowledge (
        knowledge_id TEXT PRIMARY KEY, crystalized_at TEXT NOT NULL,
        pousada_id TEXT NOT NULL, pousada_scope TEXT DEFAULT 'specific',
        category TEXT NOT NULL, title TEXT NOT NULL, content TEXT NOT NULL,
        confidence REAL DEFAULT 0.5, occurrence_count INTEGER DEFAULT 1,
        first_seen TEXT, last_seen TEXT,
        actionable INTEGER DEFAULT 0, action_suggested TEXT, zcc_alert_level TEXT DEFAULT 'info'
    );
    CREATE INDEX IF NOT EXISTS idx_kn_pousada ON akashic_knowledge(pousada_id, category);

    CREATE TABLE IF NOT EXISTS akashic_predictions (
        prediction_id TEXT PRIMARY KEY, created_at TEXT NOT NULL,
        pousada_id TEXT NOT NULL, prediction_type TEXT NOT NULL,
        predicted_value REAL NOT NULL, confidence REAL NOT NULL,
        prediction_window TEXT NOT NULL,
        actual_value REAL, was_correct INTEGER, error_magnitude REAL
    );
    CREATE INDEX IF NOT EXISTS idx_pr_pousada ON akashic_predictions(pousada_id, prediction_type);
    """

    def __init__(self, db_path: str):
        self.db_path = db_path
        os.makedirs(os.path.dirname(db_path) if os.path.dirname(db_path) else ".", exist_ok=True)
        self._init_db()

    def _init_db(self):
        import sqlite3
        conn = sqlite3.connect(self.db_path)
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA synchronous=NORMAL")
        conn.execute("PRAGMA busy_timeout=5000")
        conn.execute("PRAGMA cache_size=-64000")
        conn.executescript(self.SCHEMA)
        conn.commit()
        conn.close()

    def _get_conn(self):
        import sqlite3
        conn = sqlite3.connect(self.db_path)
        conn.execute("PRAGMA journal_mode=WAL")
        conn.row_factory = sqlite3.Row
        return conn

    def store_episode(self, episode: AkashicEpisode):
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
        conn = self._get_conn()
        try:
            conn.execute(
                """INSERT OR REPLACE INTO akashic_knowledge
                (knowledge_id, crystalized_at, source_episodes, pousada_id, pousada_scope,
                 category, title, content, confidence, occurrence_count,
                 first_seen, last_seen, actionable, action_suggested, zcc_alert_level)
                VALUES (:knowledge_id, :crystalized_at, :source_episodes,
                        :pousada_id, :pousada_scope, :category, :title, :content,
                        :confidence, :occurrence_count, :first_seen, :last_seen,
                        :actionable, :action_suggested, :zcc_alert_level)""",
                knowledge.to_dict()
            )
            conn.commit()
        finally:
            conn.close()

    def store_prediction(self, prediction: AkashicPrediction):
        conn = self._get_conn()
        try:
            conn.execute(
                """INSERT OR REPLACE INTO akashic_predictions VALUES
                (:prediction_id, :created_at, :pousada_id, :prediction_type,
                 :predicted_value, :confidence, :prediction_window,
                 :actual_value, :was_correct, :error_magnitude)""",
                prediction.to_dict()
            )
            conn.commit()
        finally:
            conn.close()

    def get_unprocessed_episodes(self, limit: int = 50) -> List[AkashicEpisode]:
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
        conn = self._get_conn()
        try:
            rows = conn.execute(
                "SELECT * FROM akashic_episodes WHERE guest_id = ? AND pousada_id = ? ORDER BY timestamp DESC LIMIT ?",
                (guest_id, pousada_id, limit)
            ).fetchall()
            return [AkashicEpisode.from_dict(dict(r)) for r in rows]
        finally:
            conn.close()

    def get_pousada_stats(self, pousada_id: str) -> Dict[str, Any]:
        conn = self._get_conn()
        try:
            stats = {}
            row = conn.execute("SELECT COUNT(*) as c FROM akashic_episodes WHERE pousada_id = ?", (pousada_id,)).fetchone()
            stats["total_episodes"] = row["c"]
            buckets = conn.execute(
                "SELECT cadmas_bucket, COUNT(*) as c FROM akashic_episodes WHERE pousada_id = ? GROUP BY cadmas_bucket",
                (pousada_id,)
            ).fetchall()
            stats["by_bucket"] = {r["cadmas_bucket"]: r["c"] for r in buckets}
            outcomes = conn.execute(
                "SELECT outcome, COUNT(*) as c FROM akashic_episodes WHERE pousada_id = ? GROUP BY outcome",
                (pousada_id,)
            ).fetchall()
            stats["by_outcome"] = {r["outcome"]: r["c"] for r in outcomes}
            sent = conn.execute(
                "SELECT AVG(sentiment_after) as s FROM akashic_episodes WHERE pousada_id = ? AND sentiment_after != 0",
                (pousada_id,)
            ).fetchone()
            stats["avg_sentiment"] = round(sent["s"], 3) if sent["s"] else 0.0
            kn = conn.execute("SELECT COUNT(*) as c FROM akashic_knowledge WHERE pousada_id = ?", (pousada_id,)).fetchone()
            stats["total_knowledge"] = kn["c"]
            return stats
        finally:
            conn.close()


# ═══════════════════════════════════════════════════════════════
# LAYER 3: CAMADA FLUIDA (Redis Hash — <2ms)
# ═══════════════════════════════════════════════════════════════

class CamadaFluida:
    def __init__(self, redis_client):
        self.redis = redis_client

    def update_guest_context(self, pousada_id: str, guest_id: str, data: Dict[str, Any]):
        key = f"{REDIS_GUEST_PREFIX}{pousada_id}:{guest_id}"
        self.redis.hset(key, mapping={k: str(v) for k, v in data.items()})
        self.redis.expire(key, 86400)

    def get_guest_context(self, pousada_id: str, guest_id: str) -> Dict[str, str]:
        key = f"{REDIS_GUEST_PREFIX}{pousada_id}:{guest_id}"
        result = self.redis.hgetall(key)
        return {k.decode(): v.decode() for k, v in result.items()} if result else {}

    def update_pousada_working(self, pousada_id: str, data: Dict[str, Any]):
        key = f"{REDIS_POUSADA_PREFIX}{pousada_id}"
        self.redis.hset(key, mapping={k: str(v) for k, v in data.items()})
        self.redis.expire(key, 3600)

    def get_pousada_working(self, pousada_id: str) -> Dict[str, str]:
        key = f"{REDIS_POUSADA_PREFIX}{pousada_id}"
        result = self.redis.hgetall(key)
        return {k.decode(): v.decode() for k, v in result.items()} if result else {}

    def emit_zcc_alert(self, pousada_id: str, alert_level: str, message: str,
                       knowledge_id: Optional[str] = None, action: Optional[str] = None):
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
# LAYER 4: CAMADA RAIZ (ChromaDB + NetworkX — <10ms)
# ═══════════════════════════════════════════════════════════════

class CamadaRaiz:
    def __init__(self, chroma_path: str):
        import chromadb
        self.chroma = chromadb.PersistentClient(path=chroma_path)
        self.collections: Dict[str, Any] = {}
        self.graph = None
        self._init_graph()

    def _init_graph(self):
        import networkx as nx
        self.graph = nx.DiGraph()

    def get_or_create_collection(self, pousada_id: str):
        if pousada_id not in self.collections:
            self.collections[pousada_id] = self.chroma.get_or_create_collection(
                name=f"akashic_{pousada_id}",
                metadata={"hnsw:space": "cosine", "hnsw:M": 32}
            )
        return self.collections[pousada_id]

    def get_global_collection(self):
        if "global" not in self.collections:
            self.collections["global"] = self.chroma.get_or_create_collection(
                name="akashic_global",
                metadata={"hnsw:space": "cosine", "hnsw:M": 48}
            )
        return self.collections["global"]

    def store_knowledge_vector(self, knowledge: AkashicKnowledge, embedding: List[float]):
        collection = self.get_global_collection() if knowledge.pousada_scope == "global" else self.get_or_create_collection(knowledge.pousada_id)
        collection.upsert(
            ids=[knowledge.knowledge_id],
            documents=[knowledge.content],
            metadatas=[{
                "category": knowledge.category, "confidence": knowledge.confidence,
                "pousada_id": knowledge.pousada_id, "pousada_scope": knowledge.pousada_scope,
                "occurrence_count": knowledge.occurrence_count,
                "zcc_alert_level": knowledge.zcc_alert_level,
                "actionable": knowledge.actionable,
                "action_suggested": knowledge.action_suggested or "",
                "title": knowledge.title,
            }],
            embeddings=[embedding]
        )
        self._add_graph_node(knowledge)

    def search_knowledge(self, pousada_id: str, query_embedding: List[float],
                         top_k: int = 10, min_confidence: float = 0.3) -> List[Dict]:
        collection = self.get_or_create_collection(pousada_id)
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            where={"confidence": {"$gte": min_confidence}}
        )
        items = []
        if results and results["ids"] and results["ids"][0]:
            for i, kid in enumerate(results["ids"][0]):
                items.append({
                    "knowledge_id": kid,
                    "content": results["documents"][0][i] if results["documents"] else "",
                    "metadata": results["metadatas"][0][i] if results["metadatas"] else {},
                    "similarity": 1.0 - (results["distances"][0][i] if results["distances"] else 0),
                })
        return self._ppr_boost(items, pousada_id)

    def _add_graph_node(self, knowledge: AkashicKnowledge):
        self.graph.add_node(
            knowledge.knowledge_id,
            category=knowledge.category, confidence=knowledge.confidence,
            pousada_id=knowledge.pousada_id, title=knowledge.title,
            last_seen=knowledge.last_seen,
        )

    def add_graph_link(self, source_id: str, target_id: str, link_type: str, weight: float = 1.0):
        self.graph.add_edge(source_id, target_id, type=link_type, weight=weight)
        inverses = {
            "supports": "supported_by", "extends": "extended_by", "causes": "caused_by",
            "exemplifies": "exemplified_by", "temporal_before": "temporal_after",
            "contradicts": "contradicted_by", "analogous_to": "analogous_to",
        }
        inverse = inverses.get(link_type, link_type)
        self.graph.add_edge(target_id, source_id, type=inverse, weight=weight)

    def _ppr_boost(self, items: List[Dict], pousada_id: str, alpha: float = 0.2) -> List[Dict]:
        if len(self.graph.nodes) < 5:
            return items
        try:
            import networkx as nx
            personalization = {item["knowledge_id"]: 1.0 / len(items) for item in items}
            scores = nx.pagerank(self.graph, alpha=alpha, personalization=personalization, max_iter=100)
            for item in items:
                kid = item["knowledge_id"]
                ppr_score = scores.get(kid, 0.0)
                item["final_score"] = 0.6 * item["similarity"] + 0.4 * ppr_score
            items.sort(key=lambda x: x.get("final_score", 0), reverse=True)
        except Exception:
            pass
        return items

    def get_graph_stats(self) -> Dict[str, int]:
        import networkx as nx
        try:
            communities = len(list(nx.community.greedy_modularity_communities(self.graph))) if self.graph.number_of_nodes() > 10 else 0
        except Exception:
            communities = 0
        return {"nodes": self.graph.number_of_nodes(), "edges": self.graph.number_of_edges(), "communities": communities}


# ═══════════════════════════════════════════════════════════════
# CRYSTALLIZATION ENGINE
# ═══════════════════════════════════════════════════════════════

class CrystallizationEngine:
    def __init__(self, episodica: CamadaEpisodica, fluida: CamadaFluida,
                 raiz: CamadaRaiz, embedding_fn=None):
        self.episodica = episodica
        self.fluida = fluida
        self.raiz = raiz
        self.embedding_fn = embedding_fn or self._dummy_embedding

    def run_cycle(self) -> Dict[str, int]:
        episodes = self.episodica.get_unprocessed_episodes(limit=CRISTALIZATION_BATCH_SIZE)
        if not episodes:
            return {"crystallized": 0, "patterns": 0, "anomalies": 0, "insights": 0}

        results = {"crystallized": 0, "patterns": 0, "anomalies": 0, "insights": 0}
        by_pousada: Dict[str, List[AkashicEpisode]] = {}
        for ep in episodes:
            by_pousada.setdefault(ep.pousada_id, []).append(ep)

        for pousada_id, pousada_eps in by_pousada.items():
            for pattern in self._extract_patterns(pousada_id, pousada_eps):
                self._store_and_alert(pattern)
                results["patterns"] += 1
            for anomaly in self._detect_anomalies(pousada_id, pousada_eps):
                self._store_and_alert(anomaly)
                results["anomalies"] += 1
            for insight in self._generate_insights(pousada_id, pousada_eps):
                self._store_and_alert(insight)
                results["insights"] += 1

        episode_ids = [ep.episode_id for ep in episodes]
        self.episodica.mark_processed(episode_ids)
        results["crystallized"] = len(episodes)
        results["total_knowledge_items"] = results["patterns"] + results["anomalies"] + results["insights"]
        return results

    def _extract_patterns(self, pousada_id: str, episodes: List[AkashicEpisode]) -> List[AkashicKnowledge]:
        patterns = []
        bucket_counts: Dict[int, int] = {}
        for ep in episodes:
            bucket_counts[ep.cadmas_bucket] = bucket_counts.get(ep.cadmas_bucket, 0) + 1

        for bucket, count in bucket_counts.items():
            if count >= 3:
                bucket_name = CADMAS_BUCKETS.get(bucket, "unknown")
                confidence = min(0.95, 0.3 + count * 0.1)
                kn = AkashicKnowledge(
                    knowledge_id=f"pat_{pousada_id}_{bucket}_{hashlib.sha256(f'{bucket}{count}'.encode()).hexdigest()[:8]}",
                    crystalized_at=datetime.now(timezone.utc).isoformat(),
                    source_episodes=[ep.episode_id for ep in episodes if ep.cadmas_bucket == bucket],
                    pousada_id=pousada_id, pousada_scope="specific",
                    category=KnowledgeCategory.PATTERN.value,
                    title=f"Alta frequencia: {bucket_name}",
                    content=f"Bucket '{bucket_name}' apareceu {count}x. Indica demanda recorrente. Considere criar resposta automatica.",
                    confidence=confidence, occurrence_count=count,
                    first_seen=min(episodes, key=lambda e: e.timestamp).timestamp,
                    last_seen=max(episodes, key=lambda e: e.timestamp).timestamp,
                    actionable=True,
                    action_suggested=f"Criar template de resposta para {bucket_name}",
                    zcc_alert_level="info" if count < 5 else "warning",
                )
                patterns.append(kn)

        negative_eps = [ep for ep in episodes if ep.sentiment_after < -0.5]
        if len(negative_eps) >= 2:
            patterns.append(AkashicKnowledge(
                knowledge_id=f"pat_{pousada_id}_sent_neg_{uuid.uuid4().hex[:8]}",
                crystalized_at=datetime.now(timezone.utc).isoformat(),
                source_episodes=[ep.episode_id for ep in negative_eps],
                pousada_id=pousada_id, pousada_scope="specific",
                category=KnowledgeCategory.PATTERN.value,
                title="Cluster de sentimento negativo",
                content=f"{len(negative_eps)} interacoes negativas. Canais: {', '.join(set(ep.source_channel for ep in negative_eps))}.",
                confidence=min(0.9, 0.4 + len(negative_eps) * 0.15),
                occurrence_count=len(negative_eps), actionable=True,
                action_suggested="Investigar causas e preparar resposta proativa",
                zcc_alert_level="warning" if len(negative_eps) < 4 else "critical",
            ))
        return patterns

    def _detect_anomalies(self, pousada_id: str, episodes: List[AkashicEpisode]) -> List[AkashicKnowledge]:
        anomalies = []
        complaint_buckets = {13, 14, 15, 16, 17, 18, 19}
        for ep in episodes:
            if ep.cadmas_bucket in complaint_buckets and ep.outcome == EpisodeOutcome.ESCALATED.value:
                anomalies.append(AkashicKnowledge(
                    knowledge_id=f"ano_{pousada_id}_{ep.episode_id[:12]}",
                    crystalized_at=datetime.now(timezone.utc).isoformat(),
                    source_episodes=[ep.episode_id],
                    pousada_id=pousada_id, pousada_scope="specific",
                    category=KnowledgeCategory.ANOMALY.value,
                    title=f"Reclamacao escalada: {CADMAS_BUCKETS.get(ep.cadmas_bucket, '?')}",
                    content=f"Escalada em {ep.source_channel}: '{ep.input_text[:100]}'. Sentimento: {ep.sentiment_after:.2f}",
                    confidence=0.8, actionable=True,
                    action_suggested="Revisar causa raiz",
                    zcc_alert_level="critical",
                ))
        bounced = [ep for ep in episodes if not ep.was_sticky and ep.tier_used >= 2]
        if len(bounced) >= 5:
            anomalies.append(AkashicKnowledge(
                knowledge_id=f"ano_{pousada_id}_bounce_{uuid.uuid4().hex[:8]}",
                crystalized_at=datetime.now(timezone.utc).isoformat(),
                source_episodes=[ep.episode_id for ep in bounced[:10]],
                pousada_id=pousada_id, pousada_scope="specific",
                category=KnowledgeCategory.ANOMALY.value,
                title=f"Alta taxa de bounce: {len(bounced)} sem sticky",
                content=f"{len(bounced)} interacoes sem continuidade. Possivel insatisfacao.",
                confidence=0.7, actionable=True,
                action_suggested="Revisar qualidade das respostas",
                zcc_alert_level="warning",
            ))
        return anomalies

    def _generate_insights(self, pousada_id: str, episodes: List[AkashicEpisode]) -> List[AkashicKnowledge]:
        insights = []
        channel_hours: Dict[str, List[int]] = {}
        for ep in episodes:
            if ep.source_channel in ("whatsapp", "instagram"):
                hour = int(ep.timestamp.split("T")[1].split(":")[0]) if "T" in ep.timestamp else 12
                channel_hours.setdefault(ep.source_channel, []).append(hour)

        for channel, hours in channel_hours.items():
            if len(hours) >= 3:
                peak_hour = int(np.median(hours))
                insights.append(AkashicKnowledge(
                    knowledge_id=f"ins_{pousada_id}_{channel}_peak_{uuid.uuid4().hex[:8]}",
                    crystalized_at=datetime.now(timezone.utc).isoformat(),
                    source_episodes=[ep.episode_id for ep in episodes[:3]],
                    pousada_id=pousada_id, pousada_scope="specific",
                    category=KnowledgeCategory.INSIGHT.value,
                    title=f"Pico de interacao via {channel}: {peak_hour}h",
                    content=f"Pico as {peak_hour}h (n={len(hours)}). Concentrar campanhas neste horario.",
                    confidence=min(0.85, 0.4 + len(hours) * 0.1),
                    occurrence_count=len(hours), actionable=True,
                    action_suggested=f"Agendar campanhas {channel} para {peak_hour}h",
                    zcc_alert_level="info",
                ))

        by_provider: Dict[str, int] = {}
        for ep in episodes:
            if ep.outcome == EpisodeOutcome.RESOLVED.value:
                key = f"{ep.provider_used}_t{ep.tier_used}"
                by_provider[key] = by_provider.get(key, 0) + 1
        if by_provider:
            best = max(by_provider, key=by_provider.get)
            insights.append(AkashicKnowledge(
                knowledge_id=f"ins_{pousada_id}_provider_{uuid.uuid4().hex[:8]}",
                crystalized_at=datetime.now(timezone.utc).isoformat(),
                source_episodes=[ep.episode_id for ep in episodes[:5]],
                pousada_id=pousada_id, pousada_scope="specific",
                category=KnowledgeCategory.INSIGHT.value,
                title=f"Melhor resolvedor: {best} ({by_provider[best]} resolucoes)",
                content=f"Provider '{best}' teve melhor taxa de resolucao: {json.dumps(by_provider)}.",
                confidence=0.7, actionable=True,
                action_suggested=f"Ajustar Thompson Sampling prior para {best}",
                zcc_alert_level="info",
            ))
        return insights

    def _store_and_alert(self, knowledge: AkashicKnowledge):
        self.episodica.store_knowledge(knowledge)
        embedding = self.embedding_fn(knowledge.content)
        self.raiz.store_knowledge_vector(knowledge, embedding)
        if knowledge.actionable and knowledge.zcc_alert_level in ("warning", "critical"):
            self.fluida.emit_zcc_alert(
                pousada_id=knowledge.pousada_id,
                alert_level=knowledge.zcc_alert_level,
                message=f"[{knowledge.category.upper()}] {knowledge.title}",
                knowledge_id=knowledge.knowledge_id,
                action=knowledge.action_suggested,
            )

    @staticmethod
    def _dummy_embedding(text: str) -> List[float]:
        vec = np.zeros(384)
        for i, char in enumerate(text[:100]):
            vec[i % 384] += ord(char) / 1000.0
        return (vec / (np.linalg.norm(vec) + 1e-8)).tolist()


# ═══════════════════════════════════════════════════════════════
# ORCHESTRATOR
# ═══════════════════════════════════════════════════════════════

class CampoAkashico:
    def __init__(self, redis_url: str, db_base_path: str, chroma_path: str):
        import redis
        self.redis = redis.from_url(redis_url, decode_responses=True)
        self.sutil = CamadaSutil(self.redis)
        self.episodica = CamadaEpisodica(os.path.join(db_base_path, "akashic_episodica.db"))
        self.fluida = CamadaFluida(self.redis)
        self.raiz = CamadaRaiz(chroma_path)
        self.cristalizador = CrystallizationEngine(self.episodica, self.fluida, self.raiz)
        self._running = False

    def ingest_event(self, event_data: Dict[str, Any]) -> str:
        required = ["pousada_id", "source_channel"]
        for field in required:
            if field not in event_data:
                raise ValueError(f"Campo obrigatorio: {field}")
        event_data.setdefault("timestamp", datetime.now(timezone.utc).isoformat())
        event_data.setdefault("cadmas_bucket", 4)
        event_data.setdefault("outcome", "neutral")
        event_data.setdefault("sentiment_after", 0.0)

        stream_id = self.sutil.ingest(event_data)

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

        if event_data.get("guest_id"):
            self.fluida.update_guest_context(
                event_data["pousada_id"], event_data["guest_id"],
                {"last_interaction": event_data["timestamp"],
                 "last_channel": event_data["source_channel"],
                 "last_bucket": str(event_data["cadmas_bucket"]),
                 "last_sentiment": str(event_data.get("sentiment_after", 0))}
            )
        return stream_id

    def query_context(self, pousada_id: str, query_text: str, top_k: int = 10) -> List[Dict]:
        embedding = self.cristalizador.embedding_fn(query_text)
        return self.raiz.search_knowledge(pousada_id, embedding, top_k=top_k)

    def get_guest_profile(self, pousada_id: str, guest_id: str) -> Dict[str, Any]:
        working = self.fluida.get_guest_context(pousada_id, guest_id)
        history = self.episodica.get_guest_history(guest_id, pousada_id, limit=20)
        if history:
            avg_sentiment = np.mean([ep.sentiment_after for ep in history if ep.sentiment_after != 0])
            bucket_counts: Dict[int, int] = {}
            for ep in history:
                bucket_counts[ep.cadmas_bucket] = bucket_counts.get(ep.cadmas_bucket, 0) + 1
            top_bucket = max(bucket_counts, key=bucket_counts.get) if bucket_counts else 4
            return {
                **working, "total_interactions": len(history),
                "avg_sentiment": round(float(avg_sentiment), 3),
                "most_common_bucket": CADMAS_BUCKETS.get(top_bucket, "unknown"),
                "last_interaction": history[0].timestamp,
                "preferred_channel": max(set(ep.source_channel for ep in history),
                                         key=lambda c: sum(1 for ep in history if ep.source_channel == c)) if history else None,
            }
        return {**working, "total_interactions": 0}

    def get_pousada_dashboard(self, pousada_id: str) -> Dict[str, Any]:
        stats = self.episodica.get_pousada_stats(pousada_id)
        graph_stats = self.raiz.get_graph_stats()
        return {
            "pousada_id": pousada_id,
            "total_memories": stats.get("total_episodes", 0),
            "total_knowledge": stats.get("total_knowledge", 0),
            "avg_sentiment": stats.get("avg_sentiment", 0),
            "graph": graph_stats,
            "by_bucket": stats.get("by_bucket", {}),
            "by_outcome": stats.get("by_outcome", {}),
        }

    def start_cristalization_loop(self, interval_secs: int = CRISTALIZATION_INTERVAL_SECS):
        import threading
        self._running = True
        def _loop():
            while self._running:
                try:
                    results = self.cristalizador.run_cycle()
                    if results.get("total_knowledge_items", 0) > 0:
                        print(f"[Akashico] Ciclo: {results}")
                except Exception as e:
                    print(f"[Akashico] Erro no ciclo: {e}")
                time.sleep(interval_secs)
        thread = threading.Thread(target=_loop, daemon=True, name="akashic-cristalization")
        thread.start()
        return thread

    def stop(self):
        self._running = False
