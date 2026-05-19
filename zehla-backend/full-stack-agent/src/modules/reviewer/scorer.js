/**
 * FULL_STACK_AGENT — Quality Scorer
 * Calcula o Quality Score (0-100) baseado na gravidade dos findings.
 */

export function calculateQualityScore(findings) {
  let score = 100;
  
  // Penalidades por severidade
  const penalties = {
    critical: 20,
    high: 10,
    medium: 5,
    low: 2
  };

  for (const finding of findings) {
    const penalty = penalties[finding.severity] || 0;
    score -= penalty;
  }

  return Math.min(100, Math.max(0, score));
}
