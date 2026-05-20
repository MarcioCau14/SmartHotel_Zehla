/**
 * FULL_STACK_AGENT — Markdown Reporter
 * Gera relatórios executivos em formato Markdown.
 */

export function generateMarkdownReport(context) {
  const { project, scores, analysis, findings = [] } = context;
  const timestamp = new Date().toLocaleString('pt-BR');

  let md = `# Relatório de Engenharia — FULL_STACK_AGENT\n\n`;
  md += `> **Projeto:** ${project.name}\n`;
  md += `> **Data:** ${timestamp}\n`;
  md += `> **Maturidade:** ${scores.maturity}/100\n`;
  md += `> **Qualidade:** ${scores.quality}/100\n\n`;

  md += `## 📊 Sumário Executivo\n\n`;
  md += `| Métrica | Valor |\n`;
  md += `| --- | --- |\n`;
  md += `| Arquivos Analisados | ${analysis.filesAnalyzed} |\n`;
  md += `| Tamanho Total | ${(analysis.totalSize / 1024 / 1024).toFixed(2)} MB |\n`;
  md += `| Framework Detectado | ${project.framework.name} (${project.framework.version || 'v?'}) |\n`;
  md += `| Score de Maturidade | ${scores.maturity} |\n`;
  md += `| Score de Qualidade | ${scores.quality} |\n\n`;

  md += `## 🔍 Principais Achados (Findings)\n\n`;
  
  if (findings.length === 0) {
    md += `✅ Nenhum problema crítico encontrado.\n\n`;
  } else {
    const severities = { critical: '🔴 CRITICAL', high: '🟠 HIGH', medium: '🟡 MEDIUM', low: '🟢 LOW' };
    
    findings.forEach(f => {
      md += `### [${f.rule}] ${f.message}\n`;
      md += `- **Severidade:** ${severities[f.severity] || f.severity}\n`;
      md += `- **Categoria:** ${f.category}\n`;
      md += `- **Arquivo:** \`${f.file}\`\n\n`;
    });
  }

  md += `---\n*Gerado automaticamente pelo FULL_STACK_AGENT*`;
  
  return md;
}
