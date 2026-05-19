/**
 * FULL_STACK_AGENT — JSON Reporter
 * Gera relatórios estruturados para integração com outras ferramentas.
 */

export function generateJsonReport(context) {
  // Une os achados do Reviewer (Regex) com os do Analyzer Deep Scan (AST)
  const allFindings = [
    ...(context.findings || []),
    ...(context.analysis?.deepFindings || [])
  ];
  
  // Agrupa findings por arquivo para facilitar o parsing da IA
  const groupedFindings = allFindings.reduce((acc, f) => {
    if (!acc[f.file]) acc[f.file] = [];
    acc[f.file].push({
      rule: f.rule,
      severity: f.severity,
      category: f.category || 'GENERAL',
      message: f.message,
      loc: f.loc || null
    });
    return acc;
  }, {});

  const report = {
    metadata: {
      project: context.project.name,
      framework: context.project.framework,
      scores: context.scores,
      timestamp: new Date().toISOString(),
    },
    instructionForAntigravity: "Atue como um Engenheiro Sênior. Leia os 'actionableFindings' abaixo e refatore os arquivos listados para resolver os code smells e vulnerabilidades detectadas pelo FULL_STACK_AGENT.",
    actionableFindings: groupedFindings
  };

  return JSON.stringify(report, null, 2);
}
