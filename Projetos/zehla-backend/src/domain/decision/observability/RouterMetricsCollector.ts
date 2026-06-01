/**
 * ZEHLA SMARTHOTEL — Router Metrics Collector
 * Módulo: src/domain/decision/observability/RouterMetricsCollector.ts
 *
 * Acumulador de métricas temporais em memória de alta performance.
 */

export interface RouterMetricsSnapshot {
  readonly timestamp: number;
  readonly totalDecisions: number;
  readonly successRate: number;
  readonly avgLatencyMs: number;
  readonly totalCostUsd: number;
  readonly decisionsByBucket: ReadonlyMap<string, number>;
  readonly decisionsByProvider: ReadonlyMap<string, number>;
}

export class RouterMetricsCollector {
  private static instance: RouterMetricsCollector | null = null;

  private totalDecisions = 0;
  private successCount = 0;
  private totalLatencyMs = 0;
  private totalCostUsd = 0;
  private latencies: number[] = [];
  private readonly decisionsByBucket = new Map<string, number>();
  private readonly decisionsByProvider = new Map<string, number>();
  private readonly maxWindowSize: number;

  constructor(maxWindowSize = 10000) {
    this.maxWindowSize = maxWindowSize;
  }

  /**
   * Obtém a instância singleton global do coletor.
   */
  public static getInstance(): RouterMetricsCollector {
    if (!this.instance) {
      this.instance = new RouterMetricsCollector();
    }
    return this.instance;
  }

  /**
   * Reseta o singleton global (útil para testes).
   */
  public static resetInstance(): void {
    this.instance = null;
  }

  /**
   * Registra uma decisão de roteamento com suas métricas.
   */
  public recordDecision(
    bucketId: string,
    providerName: string,
    latencyMs: number,
    costUsd = 0,
    success = true
  ): void {
    this.totalDecisions++;
    if (success) {
      this.successCount++;
    }
    this.totalLatencyMs += latencyMs;
    this.totalCostUsd += costUsd;

    // Atualizar mapas
    this.decisionsByBucket.set(
      bucketId,
      (this.decisionsByBucket.get(bucketId) ?? 0) + 1
    );
    this.decisionsByProvider.set(
      providerName,
      (this.decisionsByProvider.get(providerName) ?? 0) + 1
    );

    // Janela deslizante para latências
    this.latencies.push(latencyMs);
    if (this.latencies.length > this.maxWindowSize) {
      this.latencies.shift();
    }
  }

  /**
   * Calcula o percentil de latência exato da janela deslizante atual.
   * @param p Percentil desejado (ex: 95 para P95)
   */
  public getPercentileLatency(p: number): number {
    if (this.latencies.length === 0) return 0;
    const sorted = [...this.latencies].sort((a, b) => a - b);
    
    // Cálculo estatístico exato do índice (1-indexed index mapeado para 0-indexed)
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
  }

  /**
   * Retorna a latência média da janela atual.
   */
  public getAverageLatency(): number {
    if (this.latencies.length === 0) return 0;
    const sum = this.latencies.reduce((acc, val) => acc + val, 0);
    return sum / this.latencies.length;
  }

  /**
   * Retorna o snapshot de métricas consolidado.
   */
  public getSnapshot(): RouterMetricsSnapshot {
    return {
      timestamp: Date.now(),
      totalDecisions: this.totalDecisions,
      successRate: this.totalDecisions > 0 ? this.successCount / this.totalDecisions : 0,
      avgLatencyMs: this.getAverageLatency(),
      totalCostUsd: Math.round(this.totalCostUsd * 10000) / 10000,
      decisionsByBucket: new Map(this.decisionsByBucket),
      decisionsByProvider: new Map(this.decisionsByProvider),
    };
  }

  /**
   * Reseta o estado do coletor de métricas.
   */
  public reset(): void {
    this.totalDecisions = 0;
    this.successCount = 0;
    this.totalLatencyMs = 0;
    this.totalCostUsd = 0;
    this.latencies = [];
    this.decisionsByBucket.clear();
    this.decisionsByProvider.clear();
  }
}
