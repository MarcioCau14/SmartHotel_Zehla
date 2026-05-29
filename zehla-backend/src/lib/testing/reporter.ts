import fs from 'fs/promises';
import path from 'path';
import { TestExecutionResult, HealingResult } from './test-agent';

export class Reporter {
  private outputDir: string;

  constructor(outputDir: string = process.cwd()) {
    this.outputDir = outputDir;
  }

  async generateMarkdown(
    execution: TestExecutionResult,
    healing: HealingResult
  ): Promise<string> {
    const lines: string[] = [
      `# ZEHLA Test Report — ${execution.runId}`,
      '',
      `**Projeto:** ${execution.projectName}`,
      `**Data:** ${execution.startedAt}`,
      `**Duracao:** ${execution.totalDuration}ms`,
      `**Tipo:** ${execution.type || 'unit'}`,
      '',
      `## Resumo`,
      '',
      `| Metrica | Valor |`,
      `|---------|-------|`,
      `| Total | ${execution.summary.total} |`,
      `| Aprovados | ${execution.summary.passed} |`,
      `| Falhados | ${execution.summary.failed} |`,
      `| Pulados | ${execution.summary.skipped} |`,
      `| Flaky | ${execution.summary.flaky} |`,
      `| Taxa de Aprovacao | ${execution.summary.passRate}% |`,
      '',
      `## Healing`,
      '',
      `| Metrica | Valor |`,
      `|---------|-------|`,
      `| Total de Falhas | ${healing.totalFailures} |`,
      `| Healed | ${healing.healed} |`,
      `| Nao Healed | ${healing.unhealed} |`,
      '',
    ];

    if (healing.actions.length > 0) {
      lines.push('### Acoes de Healing Aplicadas', '');
      for (const action of healing.actions) {
        lines.push(`- **${action.testCaseId}**: ${action.description}`);
        lines.push(`  - Tipo: \`${action.type}\``);
        lines.push(`  - Original: \`${action.original}\``);
        lines.push(`  - Corrigido: \`${action.fixed}\``);
        lines.push(`  - Auto-aplicado: ${action.autoApplied ? 'Sim' : 'Nao'}`);
        lines.push('');
      }
    }

    const failedTests = execution.results.filter(r => r.status === 'failed');
    if (failedTests.length > 0) {
      lines.push('## Testes Falhados', '');
      for (const test of failedTests) {
        lines.push(`### ${test.title}`);
        lines.push(`- **ID:** ${test.testCaseId}`);
        lines.push(`- **Duracao:** ${test.duration}ms`);
        lines.push(`- **Retries:** ${test.retryCount}`);
        if (test.error) {
          lines.push(`- **Erro:**`); 
          lines.push('```');
          lines.push(test.error.slice(0, 500));
          lines.push('```');
        }
        lines.push('');
      }
    }

    lines.push('## Recomendacoes', '');
    lines.push(`1. ${healing.unhealed > 0 ? 'Revisar manualmente os testes nao healed' : 'Nenhuma acao manual necessaria'}`);
    if (execution.summary.passRate < 80) {
      lines.push('2. Taxa de aprovacao abaixo de 80% — revisar codigo antes de fazer merge');
    }
    lines.push('');

    const reportContent = lines.join('\n');
    const reportPath = path.join(this.outputDir, 'download', `TEST_REPORT_${execution.runId}.md`);
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, reportContent, 'utf-8');
    return reportPath;
  }

  async generateJSON(execution: TestExecutionResult, healing: HealingResult): Promise<string> {
    const report = {
      runId: execution.runId,
      project: execution.projectName,
      timestamp: execution.completedAt,
      summary: execution.summary,
      healing,
      results: execution.results,
    };

    const reportPath = path.join(this.outputDir, 'download', `TEST_REPORT_${execution.runId}.json`);
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');
    return reportPath;
  }
}
