import * as fs from "fs";
import * as path from "path";
import {


  TestRun, Vulnerability, CalibrationAction, SeverityLevel
} from "./types";

function generateId(): string {
  try {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

/**
 * CalibrationEngine — Generates actionable improvement recommendations
 * 
 * Analyzes vulnerabilities from the VulnerabilityScanner and produces
 * a prioritized plan of specific, measurable calibration actions.
 */
export class CalibrationEngine {
  private testRun: TestRun;
  private vulnerabilities: Vulnerability[];

  constructor(testRun: TestRun, vulnerabilities: Vulnerability[]) {
    this.testRun = testRun;
    this.vulnerabilities = vulnerabilities;
  }

  /**
   * Generate the full calibration plan
   */
  generate(): CalibrationAction[] {
    const actions: CalibrationAction[] = [];

    // Auto-generate calibrations from vulnerabilities
    for (const vuln of this.vulnerabilities) {
      const specificActions = this.generateSpecificActions(vuln);
      actions.push(...specificActions);
    }

    // Add capacity planning recommendations
    const capacityActions = this.analyzeCapacity();
    actions.push(...capacityActions);

    // Add cost optimization recommendations
    const costActions = this.analyzeCostEfficiency();
    actions.push(...costActions);

    // Sort by priority
    actions.sort((a, b) => {
      const priorityOrder = { critica: 0, alta: 1, media: 2, baixa: 3 };
      const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (pDiff !== 0) return pDiff;
      return a.phase - b.phase;
    });

    
    return actions;
  }

  /**
   * Generate a full text report
   */
  generateReport(outputDir: string): string {
    const actions = this.generate();
    const reportPath = path.join(outputDir, `xtress_calibration_${this.testRun.id}.txt`);
    
    const lines: string[] = [];
    lines.push("=".repeat(70));
    lines.push("  XTRESS_TEST — PLANO DE CALIBRAGEM DO ZEHLA");
    lines.push("=".repeat(70));
    lines.push("");
    lines.push(`Teste:       ${this.testRun.name}`);
    lines.push(`Executado em: ${this.testRun.startedAt?.toISOString() || "N/A"}`);
    lines.push(`Duracao:     ${this.testRun.totalMessages} mensagens processadas`);
    lines.push("");
    lines.push("-".repeat(70));
    lines.push("  RESUMO DO TESTE");
    lines.push("-".repeat(70));
    lines.push(`  Total de Mensagens:  ${this.testRun.totalMessages}`);
    lines.push(`  Erros:               ${this.testRun.totalErrors} (${(this.testRun.errorRate * 100).toFixed(1)}%)`);
    lines.push(`  Tempo Medio:         ${this.testRun.avgResponseMs.toFixed(0)}ms`);
    lines.push(`  P95:                 ${this.testRun.p95ResponseMs.toFixed(0)}ms`);
    lines.push(`  P99:                 ${this.testRun.p99ResponseMs.toFixed(0)}ms`);
    lines.push(`  Throughput Medio:    ${this.testRun.throughputAvg.toFixed(1)} msgs/s`);
    lines.push(`  Throughput Pico:     ${this.testRun.throughputPeak.toFixed(1)} msgs/s`);
    lines.push(`  Vulnerabilidades:    ${this.vulnerabilities.length}`);
    lines.push(`  Acoes de Calibragem: ${actions.length}`);
    lines.push("");

    // Vulnerabilities summary
    if (this.vulnerabilities.length > 0) {
      lines.push("-".repeat(70));
      lines.push("  VULNERABILIDADES DETECTADAS");
      lines.push("-".repeat(70));
      
      const bySeverity = this.groupBySeverity();
      for (const [severity, vulns] of Object.entries(bySeverity)) {
        lines.push(`\n  [${severity.toUpperCase()}] (${vulns.length})`);
        for (const v of vulns) {
          lines.push(`    - ${v.component}: ${v.description}`);
          lines.push(`      Score: ${v.score.toFixed(1)}/10 | Impacto: ${v.impact}`);
        }
      }
    } else {
      lines.push("\n  Nenhuma vulnerabilidade detectada! Sistema dentro dos parametros.");
    }

    // Calibration plan
    lines.push("");
    lines.push("-".repeat(70));
    lines.push("  PLANO DE CALIBRAGEM (POR FASE)");
    lines.push("-".repeat(70));
    
    for (let phase = 1; phase <= 4; phase++) {
      const phaseActions = actions.filter(a => a.phase === phase);
      if (phaseActions.length === 0) continue;

      const phaseNames: Record<number, string> = {
        1: "IMEDIATO (Esta Semana)",
        2: "CURTO PRAZO (2-4 Semanas)",
        3: "MEDIO PRAZO (1-2 Meses)",
        4: "LONGO PRAZO (3+ Meses)",
      };

      lines.push(`\n  === FASE ${phase}: ${phaseNames[phase]} ===\n`);

      for (let i = 0; i < phaseActions.length; i++) {
        const action = phaseActions[i];
        lines.push(`  ${i + 1}. [${action.priority.toUpperCase()}] ${action.component}`);
        lines.push(`     Problema:    ${action.current}`);
        lines.push(`     Objetivo:    ${action.target}`);
        lines.push(`     Acao:        ${action.action}`);
        lines.push(`     Impacto:     ${action.estimatedImpact}`);
        lines.push(`     Complexidade: ${action.complexidade}`);
        lines.push("");
      }
    }

    // Success criteria check
    lines.push("-".repeat(70));
    lines.push("  VERIFICACAO DE CRITERIOS DE SUCESSO");
    lines.push("-".repeat(70));
    
    if (this.testRun.config && "profile" in this.testRun.config) {
      // Access the profile from the test run's config reference
      lines.push(`  Perfil de Carga: ${this.testRun.config.profile}`);
    }
    lines.push("");

    // Score
    const score = this.calculateOverallScore();
    lines.push("=".repeat(70));
    lines.push(`  SCORE GERAL: ${score}/100`);
    if (score >= 80) lines.push("  STATUS: SISTEMA PRONTO PARA PRODUCAO");
    else if (score >= 60) lines.push("  STATUS: AJUSTES MENORES NECESSARIOS");
    else if (score >= 40) lines.push("  STATUS: AJUSTES SIGNIFICATIVOS NECESSARIOS");
    else lines.push("  STATUS: SISTEMA NAO PRONTO — REFORMA ESTRUTURAL");
    lines.push("=".repeat(70));

    const report = lines.join("\n");
    
    // Save to file
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(reportPath, report, "utf-8");
    

    return report;
  }

  /**
   * Generate specific calibration actions for a vulnerability
   */
  private generateSpecificActions(vuln: Vulnerability): CalibrationAction[] {
    const actions: CalibrationAction[] = [];

    switch (vuln.type) {
      case "timeout":
        actions.push({
          id: generateId(),
          testRunId: this.testRun.id,
          vulnerabilityId: vuln.id,
          component: vuln.component,
          current: `P95: ${vuln.evidence.observed}ms (limite: ${vuln.evidence.threshold}ms)`,
          target: `P95 < ${vuln.evidence.threshold}ms`,
          action: `Adicionar cache Redis para TrendSignals. Aumentar pool de workers de 5 para 15. Implementar circuit breaker no ZCC-TRENDS.`,
          estimatedImpact: "Reducao de 40-60% no tempo de resposta P95",
          priority: vuln.severity,
          complexity: "media",
          phase: 1,
        });
        if (vuln.evidence.observed > 5000) {
          actions.push({
            id: generateId(),
            testRunId: this.testRun.id,
            vulnerabilityId: vuln.id,
            component: "ZCC-TRENDS",
            current: "ZCC-TRENDS bloqueando pipeline de resposta",
            target: "ZCC-TRENDS nao bloqueante (fire-and-forget)",
            action: "Mover chamada ao ZCC-TRENDS para background queue. Responder ao hospede imediatamente com dados em cache, atualizar em background.",
            estimatedImpact: "Eliminacao de 1-3 segundos de latencia por mensagem",
            priority: "critica",
            complexity: "media",
            phase: 1,
          });
        }
        break;

      case "bottleneck":
        actions.push({
          id: generateId(),
          testRunId: this.testRun.id,
          vulnerabilityId: vuln.id,
          component: vuln.component,
          current: `Throughput: ${vuln.evidence.observed.toFixed(1)} msgs/s (target: ${vuln.evidence.threshold})`,
          target: `Throughput > ${vuln.evidence.threshold} msgs/s`,
          action: "Identificar componente mais lento via profiling. Adicionar processamento paralelo (worker threads). Aumentar concurrencia de BullMQ.",
          estimatedImpact: "Aumento de 2-3x no throughput",
          priority: vuln.severity,
          complexity: "alta",
          phase: 2,
        });
        break;

      case "memory_leak":
        actions.push({
          id: generateId(),
          testRunId: this.testRun.id,
          vulnerabilityId: vuln.id,
          component: "System",
          current: `Crescimento de memoria: ${vuln.evidence.observed.toFixed(1)}MB/hora`,
          target: "Crescimento < 10MB/hora (near-zero leak)",
          action: "Adicionar heap snapshots periodicos. Verificar closures nao liberadas, acumulo em arrays/mapas. Implementar GC manual periodico.",
          estimatedImpact: "Eliminacao de crashes por OOM em producao",
          priority: vuln.severity,
          complexity: "media",
          phase: 2,
        });
        break;

      case "error_spike":
        actions.push({
          id: generateId(),
          testRunId: this.testRun.id,
          vulnerabilityId: vuln.id,
          component: vuln.component,
          current: `Taxa de erro: ${(vuln.evidence.observed * 100).toFixed(1)}% (limite: ${(vuln.evidence.threshold * 100).toFixed(1)}%)`,
          target: `Taxa de erro < ${(vuln.evidence.threshold * 100).toFixed(1)}%`,
          action: "Investigar causas especificas de erro. Verificar rate limits, timeouts de provider (Z-API/360dialog), erros de validacao de payload. Adicionar retry com backoff exponencial.",
          estimatedImpact: "Reducao de 70-90% na taxa de erro",
          priority: vuln.severity,
          complexity: "media",
          phase: 1,
        });
        break;

      case "queue_overflow":
        actions.push({
          id: generateId(),
          testRunId: this.testRun.id,
          vulnerabilityId: vuln.id,
          component: "BullMQ",
          current: `Tamanho da fila: ${vuln.evidence.observed} (limite: ${vuln.evidence.threshold})`,
          target: "Fila < 1000 mensagens em qualquer momento",
          action: "Aumentar concurrencia de workers BullMQ (de 5 para 20). Implementar prioridade na fila (mensagens urgentes primeiro). Adicionar dead-letter queue.",
          estimatedImpact: "Eliminacao de backlog de mensagens",
          priority: vuln.severity,
          complexity: "baixa",
          phase: 1,
        });
        break;

      case "fallback_chain":
        actions.push({
          id: generateId(),
          testRunId: this.testRun.id,
          vulnerabilityId: vuln.id,
          component: "ZMG",
          current: "Fallback rate acima do normal",
          target: "Fallback rate < 10%",
          action: "Melhorar deteccao de disponibilidade do WhatsApp (health check a cada 30s). Ajustar timeout de fallback de 5s para 8s. Implementar retry antes do fallback.",
          estimatedImpact: "Reducao de custos (SMS e mais caro que WhatsApp)",
          priority: vuln.severity,
          complexity: "media",
          phase: 2,
        });
        break;

      case "degradation":
        actions.push({
          id: generateId(),
          testRunId: this.testRun.id,
          vulnerabilityId: vuln.id,
          component: "System",
          current: `Degradacao: ${(vuln.evidence.observed * 100).toFixed(0)}% (inicio vs fim do teste)`,
          target: "Degradacao < 20%",
          action: "Implementar connection pooling (Prisma). Adicionar LRU cache para dados quentes (ContactProfile, PropertyProfile). Rotacionar workers periodicamente.",
          estimatedImpact: "Performance estavel por 24h+ de operacao continua",
          priority: vuln.severity,
          complexity: "alta",
          phase: 2,
        });
        break;

      default:
        actions.push({
          id: generateId(),
          testRunId: this.testRun.id,
          vulnerabilityId: vuln.id,
          component: vuln.component,
          current: vuln.description,
          target: "Resolver vulnerabilidade",
          action: vuln.recommendation,
          estimatedImpact: "Reducao do risco identificado",
          priority: vuln.severity,
          complexity: "media",
          phase: 3,
        });
    }

    return actions;
  }

  /**
   * Analyze capacity planning needs
   */
  private analyzeCapacity(): CalibrationAction[] {
    const actions: CalibrationAction[] = [];

    // Estimate required infrastructure
    const peakTP = this.testRun.throughputPeak;
    if (peakTP > 0) {
      const estimatedConcurrentPousadas = Math.ceil(peakTP / 0.5); // 0.5 msg/s per pousada at peak
      if (estimatedConcurrentPousadas > 100) {
        actions.push({
          id: generateId(),
          testRunId: this.testRun.id,
          vulnerabilityId: "",
          component: "Infra",
          current: `Throughput pico: ${peakTP.toFixed(1)} msgs/s = ~${estimatedConcurrentPousadas} pousadas simultaneas`,
          target: "Suportar 500+ pousadas simultaneas",
          action: "Configurar horizontal scaling (auto-scaling de containers). Implementar connection pooling otimizado. Usar Redis cluster para cache distribuido.",
          estimatedImpact: "Suporte a 2-3x mais pousadas sem degradacao",
          priority: "media",
          complexity: "alta",
          phase: 3,
        });
      }
    }

    return actions;
  }

  /**
   * Analyze cost efficiency
   */
  private analyzeCostEfficiency(): CalibrationAction[] {
    const actions: CalibrationAction[] = [];

    if (this.testRun.totalFallbacks > this.testRun.totalMessages * 0.15) {
      actions.push({
        id: generateId(),
        testRunId: this.testRun.id,
        vulnerabilityId: "",
        component: "ZMG",
        current: `Fallback rate alto: custo adicional estimado de R$ ${(this.testRun.totalFallbacks * 0.08).toFixed(2)}/teste`,
        target: "Reduzir custos de fallback em 60%+",
        action: "Implementar pre-check de disponibilidade do WhatsApp. Usar template messages para reduzir custos de categoria. Compactar mensagens quando possivel.",
        estimatedImpact: "Economia estimada de R$ 200-500/mes em producao",
        priority: "media",
        complexity: "baixa",
        phase: 2,
      });
    }

    return actions;
  }

  /**
   * Calculate an overall health score (0-100)
   */
  private calculateOverallScore(): number {
    let score = 100;

    // Penalize for each vulnerability
    for (const vuln of this.vulnerabilities) {
      switch (vuln.severity) {
        case "critica": score -= vuln.score * 3; break;
        case "alta": score -= vuln.score * 2; break;
        case "media": score -= vuln.score * 1; break;
        case "baixa": score -= vuln.score * 0.5; break;
      }
    }

    // Bonus for low error rate
    if (this.testRun.errorRate < 0.01) score += 5;
    else if (this.testRun.errorRate < 0.05) score += 2;

    // Bonus for good P95
    if (this.testRun.p95ResponseMs < 1000) score += 5;
    else if (this.testRun.p95ResponseMs < 2000) score += 2;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Group vulnerabilities by severity
   */
  private groupBySeverity(): Record<string, Vulnerability[]> {
    const groups: Record<string, Vulnerability[]> = {
      critica: [],
      alta: [],
      media: [],
      baixa: [],
    };

    for (const vuln of this.vulnerabilities) {
      if (groups[vuln.severity]) {
        groups[vuln.severity].push(vuln);
      }
    }

    return groups;
  }
}

export default CalibrationEngine;
