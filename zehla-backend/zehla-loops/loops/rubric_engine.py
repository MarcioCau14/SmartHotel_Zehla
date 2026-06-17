"""
Rubric Engine — Motor de avaliação unificado para todos os loops ZEHLA.
"""

from dataclasses import dataclass
from typing import Optional, List, Dict, Callable

@dataclass
class RubricCriteria:
    name: str
    weight: float          # 0.0-1.0
    description: str
    evaluate_fn: Callable[[Dict], float]

@dataclass
class RubricResult:
    total_score: float
    criteria_scores: Dict[str, float]
    passed: bool
    threshold: float
    violations: List[str]
    iteration: int

class RubricEngine:
    def __init__(self, name: str, criteria: List[RubricCriteria], threshold: float = 0.7):
        self.name = name
        self.criteria = criteria
        self.threshold = threshold

    def evaluate(self, iteration: int, context: dict) -> RubricResult:
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

        # Adiciona violações se dados estiverem fora dos limites
        if context.get("violations"):
            violations.extend(context["violations"])

        if violations:
            total *= 0.5 # Penalidade para falha de guardrail

        return RubricResult(
            total_score=total,
            criteria_scores=scores,
            passed=total >= self.threshold and len(violations) == 0,
            threshold=self.threshold,
            violations=violations,
            iteration=iteration,
        )

# ─── Mocks de Rubricas ───

def create_pricing_rubric() -> RubricEngine:
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
    return RubricEngine(
        name="akashic_cristalization",
        threshold=0.65,
        criteria=[
            RubricCriteria(name="insight_quality", weight=0.35, description="Qualidade dos insights", evaluate_fn=lambda ctx: ctx.get("insight_score", 0.0)),
            RubricCriteria(name="pattern_count", weight=0.25, description="Padrões detectados", evaluate_fn=lambda ctx: min(1.0, ctx.get("patterns_found", 0) / 10)),
            RubricCriteria(name="anomaly_detection", weight=0.20, description="Anomalias detectadas", evaluate_fn=lambda ctx: 1.0 if ctx.get("anomalies", 0) > 0 else 0.5),
            RubricCriteria(name="graph_update", weight=0.20, description="Knowledge Graph atualizado", evaluate_fn=lambda ctx: 1.0 if ctx.get("graph_updated") else 0.0),
        ],
    )
