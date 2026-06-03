/**
 * ZEHLA SMARTHOTEL — ProviderCircuitBreaker Domain Service
 * Módulo: src/domain/decision/services/ProviderCircuitBreaker.ts
 */

import { Result } from '../../shared/Result';
import { IRouterStatePort } from '../ports/IRouterStatePort';
import { CircuitBreakerState, CircuitState, DEFAULT_CB_CONFIG, CircuitBreakerConfig } from '../models/CircuitBreakerState';

export class ProviderCircuitBreaker {
  constructor(
    private readonly statePort: IRouterStatePort,
    private readonly config: CircuitBreakerConfig = DEFAULT_CB_CONFIG
  ) {}

  async canRoute(bucketId: string, providerName: string): Promise<boolean> {
    const key = `${bucketId}__${providerName}`;
    const cbStates = this.statePort.loadCircuitBreakerStates();
    const raw = cbStates.get(key);

    const stateObj = raw
      ? CircuitBreakerState.create(
          raw.state as CircuitState,
          raw.consecutiveFailures,
          raw.consecutiveSuccesses,
          raw.lastFailureAt,
          raw.openedAt,
          raw.halfOpenAttempts
        )
      : CircuitBreakerState.INITIAL;

    if (stateObj.state === CircuitState.OPEN) {
      const updatedObj = stateObj.maybeTransitionToHalfOpen(this.config);
      if (updatedObj.state === CircuitState.HALF_OPEN) {
        // Salvar a transição para HALF_OPEN
        const map = new Map(cbStates);
        map.set(key, {
          state: updatedObj.state,
          consecutiveFailures: updatedObj.consecutiveFailures,
          consecutiveSuccesses: updatedObj.consecutiveSuccesses,
          lastFailureAt: updatedObj.lastFailureAt,
          openedAt: updatedObj.openedAt,
          halfOpenAttempts: updatedObj.halfOpenAttempts,
        });
        await this.statePort.saveCircuitBreakerStates(map);
        return true;
      }
      return false; // Circuito aberto (bloqueado)
    }

    return true; // CLOSED ou HALF_OPEN
  }

  async recordSuccess(bucketId: string, providerName: string): Promise<void> {
    const key = `${bucketId}__${providerName}`;
    const cbStates = this.statePort.loadCircuitBreakerStates();
    const raw = cbStates.get(key);

    const stateObj = raw
      ? CircuitBreakerState.create(
          raw.state as CircuitState,
          raw.consecutiveFailures,
          raw.consecutiveSuccesses,
          raw.lastFailureAt,
          raw.openedAt,
          raw.halfOpenAttempts
        )
      : CircuitBreakerState.INITIAL;

    const updated = stateObj.recordSuccess();
    const map = new Map(cbStates);
    map.set(key, {
      state: updated.state,
      consecutiveFailures: updated.consecutiveFailures,
      consecutiveSuccesses: updated.consecutiveSuccesses,
      lastFailureAt: updated.lastFailureAt,
      openedAt: updated.openedAt,
      halfOpenAttempts: updated.halfOpenAttempts,
    });
    await this.statePort.saveCircuitBreakerStates(map);
  }

  async recordFailure(bucketId: string, providerName: string): Promise<void> {
    const key = `${bucketId}__${providerName}`;
    const cbStates = this.statePort.loadCircuitBreakerStates();
    const raw = cbStates.get(key);

    const stateObj = raw
      ? CircuitBreakerState.create(
          raw.state as CircuitState,
          raw.consecutiveFailures,
          raw.consecutiveSuccesses,
          raw.lastFailureAt,
          raw.openedAt,
          raw.halfOpenAttempts
        )
      : CircuitBreakerState.INITIAL;

    const updated = stateObj.recordFailure(this.config);
    const map = new Map(cbStates);
    map.set(key, {
      state: updated.state,
      consecutiveFailures: updated.consecutiveFailures,
      consecutiveSuccesses: updated.consecutiveSuccesses,
      lastFailureAt: updated.lastFailureAt,
      openedAt: updated.openedAt,
      halfOpenAttempts: updated.halfOpenAttempts,
    });
    await this.statePort.saveCircuitBreakerStates(map);
  }
}
