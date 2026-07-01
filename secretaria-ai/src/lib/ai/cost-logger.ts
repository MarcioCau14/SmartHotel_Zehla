import { db } from '@/lib/db';

export interface LLMCostLogEntry {
  tenantId?: string;
  providerId: string;
  modelName: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  tier: number;
  bucket: string;
  cacheHit: boolean;
  latencyMs: number;
  circuitState?: string;
  budgetLevel?: string;
}

export class CostLogger {
  private buffer: LLMCostLogEntry[] = [];
  private readonly FLUSH_INTERVAL_MS = 30_000;
  private readonly MAX_BUFFER_SIZE = 100;
  private flushTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.startAutoFlush();
  }

  log(entry: LLMCostLogEntry): void {
    this.buffer.push(entry);

    if (this.buffer.length >= this.MAX_BUFFER_SIZE) {
      this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const batch = this.buffer.splice(0, this.buffer.length);

    try {
      const now = new Date();
      await db.costLog.createMany({
        data: batch.map(entry => ({
          tenantId: entry.tenantId ?? null,
          provider: entry.providerId,
          model: entry.modelName,
          inputTokens: entry.inputTokens,
          outputTokens: entry.outputTokens,
          costUsd: Math.round(entry.costUsd * 1_000_000) / 1_000_000,
          tier: entry.tier,
          bucket: entry.bucket,
          cacheHit: entry.cacheHit,
          latencyMs: entry.latencyMs,
          circuitState: entry.circuitState ?? null,
          budgetLevel: entry.budgetLevel ?? null,
          createdAt: now,
        })),
      });
    } catch (error) {
      console.error('[CostLogger] Erro ao salvar logs de custo:', error);
    }
  }

  async getDailyCost(tenantId?: string): Promise<number> {
    return this.calculateCostForPeriod('day', tenantId);
  }

  async getMonthlyCost(tenantId?: string): Promise<number> {
    return this.calculateCostForPeriod('month', tenantId);
  }

  getBufferSize(): number {
    return this.buffer.length;
  }

  private startAutoFlush(): void {
    if (typeof setInterval !== 'undefined') {
      this.flushTimer = setInterval(() => this.flush(), this.FLUSH_INTERVAL_MS);
    }
  }

  stop(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  private async calculateCostForPeriod(period: 'day' | 'month', tenantId?: string): Promise<number> {
    const now = new Date();
    const start = new Date(now);
    if (period === 'day') {
      start.setHours(0, 0, 0, 0);
    } else {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
    }

    const filter: { createdAt: { gte: Date }; tenantId?: string } = {
      createdAt: { gte: start },
    };
    if (tenantId) {
      filter.tenantId = tenantId;
    }

    try {
      const logs = await db.costLog.findMany({ where: filter });
      return logs.reduce((sum: number, log: { costUsd: number }) => sum + log.costUsd, 0);
    } catch {
      return 0;
    }
  }
}

export const costLogger = new CostLogger();
