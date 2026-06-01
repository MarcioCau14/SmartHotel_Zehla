/**
 * ZEHLA SMARTHOTEL — In-Memory Router State Adapter
 * Módulo: src/domain/decision/adapters/InMemoryRouterStateAdapter.ts
 */

import type { IRouterStatePort } from '../ports/IRouterStatePort';

export class InMemoryRouterStateAdapter implements IRouterStatePort {
  private posteriors = new Map<string, {
    alpha: number;
    beta: number;
    nObservations: number;
    lastUpdateAt: number;
  }>();

  private cbStates = new Map<string, {
    state: string;
    consecutiveFailures: number;
    consecutiveSuccesses: number;
    lastFailureAt: number;
    openedAt: number;
    halfOpenAttempts: number;
  }>();

  loadAllPosteriors() {
    return new Map(this.posteriors);
  }

  async savePosteriorBatch(
    updates: ReadonlyArray<{
      bucketId: string;
      providerName: string;
      alpha: number;
      beta: number;
      nObservations: number;
      lastUpdateAt: number;
    }>
  ) {
    for (const u of updates) {
      const key = `${u.bucketId}__${u.providerName}`;
      this.posteriors.set(key, {
        alpha: u.alpha,
        beta: u.beta,
        nObservations: u.nObservations,
        lastUpdateAt: u.lastUpdateAt,
      });
    }
  }

  loadCircuitBreakerStates() {
    return new Map(this.cbStates);
  }

  async saveCircuitBreakerStates(
    states: ReadonlyMap<string, {
      state: string;
      consecutiveFailures: number;
      consecutiveSuccesses: number;
      lastFailureAt: number;
      openedAt: number;
      halfOpenAttempts: number;
    }>
  ) {
    this.cbStates = new Map(states);
  }

  /** Método de teste: injeta uma posterior diretamente */
  setPosterior(
    key: string,
    data: {
      alpha: number;
      beta: number;
      nObservations: number;
      lastUpdateAt: number;
    }
  ): void {
    this.posteriors.set(key, data);
  }

  /** Método de teste: reseta todo o estado */
  reset(): void {
    this.posteriors.clear();
    this.cbStates.clear();
  }
}
