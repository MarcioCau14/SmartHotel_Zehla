/**
 * ZEHLA SMARTHOTEL — ProviderHealthMonitor Domain Service
 * Módulo: src/domain/decision/services/ProviderHealthMonitor.ts
 */

import { IRouterStatePort } from '../ports/IRouterStatePort';
import { CircuitState } from '../models/CircuitBreakerState';

export class ProviderHealthMonitor {
  private intervalId: NodeJS.Timeout | null = null;
  private consecutiveFailures: Map<string, number> = new Map();

  constructor(
    private readonly providers: ReadonlyArray<string>,
    private readonly statePort: IRouterStatePort,
    private readonly probeFn: (provider: string) => Promise<boolean>,
    private readonly intervalMs: number = 60000
  ) {}

  /**
   * Inicia o monitoramento de saúde background.
   */
  start(): void {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => {
      this.runProbes().catch(() => {
        // Silenciar erros de background probes
      });
    }, this.intervalMs);
  }

  /**
   * Encerra o monitoramento de saúde background.
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Executa probes sintéticas para todos os provedores cadastrados.
   */
  async runProbes(): Promise<void> {
    for (const provider of this.providers) {
      try {
        const isHealthy = await this.probeFn(provider);
        if (isHealthy) {
          this.consecutiveFailures.set(provider, 0);
        } else {
          await this.handleFailure(provider);
        }
      } catch (err) {
        await this.handleFailure(provider);
      }
    }
  }

  private async handleFailure(provider: string): Promise<void> {
    const current = this.consecutiveFailures.get(provider) || 0;
    const nextCount = current + 1;
    this.consecutiveFailures.set(provider, nextCount);

    if (nextCount >= 2) {
      // Sinalizar para o CircuitBreaker do modelo abrir preventivamente.
      // Definimos o estado para OPEN em todos os 35 buckets possíveis (00 a 34).
      // Cada bucket terá o mesmo timeout base, pois a falha foi total (todo o provedor caiu).
      const states = new Map<string, {
        state: string;
        consecutiveFailures: number;
        consecutiveSuccesses: number;
        lastFailureAt: number;
        openedAt: number;
        halfOpenAttempts: number;
      }>();
      const timestamp = Date.now();
      for (let bucketInt = 0; bucketInt < 35; bucketInt++) {
        const bucketId = bucketInt.toString().padStart(2, '0');
        const key = `${bucketId}__${provider}`;
        states.set(key, {
          state: CircuitState.OPEN,
          consecutiveFailures: nextCount,
          consecutiveSuccesses: 0,
          lastFailureAt: timestamp,
          openedAt: timestamp,
          halfOpenAttempts: 0,
        });
      }

      await this.statePort.saveCircuitBreakerStates(states);
    }
  }

  public getConsecutiveFailures(provider: string): number {
    return this.consecutiveFailures.get(provider) || 0;
  }
}
