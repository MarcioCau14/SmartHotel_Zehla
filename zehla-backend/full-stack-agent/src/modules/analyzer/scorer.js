/**
 * FULL_STACK_AGENT — Maturity Scorer
 * Calcula o score de maturidade técnica (PRD 3.6).
 */

/**
 * Calcula o Maturity Score baseado no contexto detectado
 * @param {object} context 
 * @returns {number} 0-100
 */
export function calculateMaturityScore(context) {
  let score = 0;
  const checks = {
    framework: 0,    // 15%
    testing: 0,      // 15%
    database: 0,     // 15%
    security: 0,     // 15%
    infra: 0,        // 10%
    linting: 0,      // 10%
    docs: 0,         // 10%
    performance: 0,  // 10%
  };

  // 1. Framework (15 pts)
  if (context.project.framework.name !== 'Desconhecido') {
    checks.framework = 15;
  }

  // 2. Testing (15 pts)
  // Detectado se houver diretório tests ou arquivos .test.js
  if (context.analysis.extensions['.test.js'] || context.analysis.extensions['.spec.ts']) {
    checks.testing = 15;
  }

  // 3. Database (15 pts)
  if (context.database.orm) {
    checks.database = 10;
    if (context.database.migrations) checks.database += 5;
  }

  // 4. Infra (10 pts)
  if (context.infra.docker) checks.infra += 5;
  if (context.infra.ci) checks.infra += 5;

  // 5. Linting (10 pts)
  if (context.infra.linting) checks.linting = 10;

  // 6. Docs (10 pts)
  // Verificação básica de README
  if (context.analysis.filesAnalyzed > 0) {
    // Heurística simples para este MVP
    checks.docs = 5; 
  }

  // Somatória final
  score = Object.values(checks).reduce((a, b) => a + b, 0);

  // Normalização final (garante 0-100)
  return Math.min(100, Math.max(0, score));
}

/**
 * Retorna a grade baseada no score
 */
export function getGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 50) return 'C';
  if (score >= 25) return 'D';
  return 'F';
}
