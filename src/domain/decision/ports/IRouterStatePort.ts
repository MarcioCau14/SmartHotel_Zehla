export interface IRouterStatePort {
  /** Carrega todas as posteriors em memória */
  loadAllPosteriors(): ReadonlyMap<string, {
    alpha: number;
    beta: number;
    nObservations: number;
    lastUpdateAt: number;
  }>;

  /** Persiste batch de atualizações de posteriors */
  savePosteriorBatch(
    updates: ReadonlyArray<{
      bucketId: string;
      providerName: string;
      alpha: number;
      beta: number;
      nObservations: number;
      lastUpdateAt: number;
    }>,
  ): Promise<void>;

  /** Carrega estado dos Circuit Breakers */
  loadCircuitBreakerStates(): ReadonlyMap<string, {
    state: string;
    consecutiveFailures: number;
    consecutiveSuccesses: number;
    lastFailureAt: number;
    openedAt: number;
    halfOpenAttempts: number;
  }>;

  /** Persiste estado dos Circuit Breakers */
  saveCircuitBreakerStates(
    states: ReadonlyMap<string, {
      state: string;
      consecutiveFailures: number;
      consecutiveSuccesses: number;
      lastFailureAt: number;
      openedAt: number;
      halfOpenAttempts: number;
    }>,
  ): Promise<void>;
}
