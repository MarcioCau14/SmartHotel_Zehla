/**
 * Circuit Breaker Pattern Implementation for ZaosNeuroRouter
 *
 * States:
 *   CLOSED   — normal operation, requests flow through
 *   OPEN     — provider is failing, requests are blocked
 *   HALF_OPEN — testing recovery, one probe request allowed
 *
 * Transitions:
 *   CLOSED  → OPEN       : after `failureThreshold` consecutive failures
 *   OPEN    → HALF_OPEN   : after `cooldownMs` milliseconds since entering OPEN
 *   HALF_OPEN → CLOSED    : probe request succeeds
 *   HALF_OPEN → OPEN      : probe request fails (reset cooldown timer)
 */

export enum CircuitState {
  CLOSED = 'closed',
  HALF_OPEN = 'half_open',
  OPEN = 'open',
}

export interface CircuitBreakerConfig {
  /** Number of consecutive failures before opening the circuit (default: 3) */
  failureThreshold: number;
  /** Cooldown period in ms before transitioning OPEN → HALF_OPEN (default: 60_000) */
  cooldownMs: number;
  /** Whether this breaker is enabled (default: true) */
  enabled: boolean;
}

export interface CircuitBreakerSnapshot {
  state: CircuitState;
  consecutiveFailures: number;
  lastFailureTime: number | null;
  totalSuccesses: number;
  totalFailures: number;
  openedAt: number | null;
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 3,
  cooldownMs: 60_000,
  enabled: true,
};

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private consecutiveFailures = 0;
  private lastFailureTime: number | null = null;
  private openedAt: number | null = null;
  private totalSuccesses = 0;
  private totalFailures = 0;
  private readonly config: CircuitBreakerConfig;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Determine whether a request is allowed to proceed through this circuit.
   *
   * - CLOSED: always allow
   * - OPEN: check if cooldown has elapsed; if so transition to HALF_OPEN and allow
   * - HALF_OPEN: allow exactly one probe request
   *
   * @returns `true` if the request may proceed
   */
  allow(): boolean {
    if (!this.config.enabled) {
      return true;
    }

    switch (this.state) {
      case CircuitState.CLOSED:
        return true;

      case CircuitState.OPEN: {
        const elapsed = Date.now() - (this.openedAt ?? 0);
        if (elapsed >= this.config.cooldownMs) {
          this.state = CircuitState.HALF_OPEN;
          return true; // Allow one probe request
        }
        return false;
      }

      case CircuitState.HALF_OPEN:
        return true; // Allow the probe

      default:
        return true;
    }
  }

  /**
   * Record a successful request.
   * - In HALF_OPEN: transition to CLOSED and reset failure counter
   * - In CLOSED: reset consecutive failure counter
   */
  recordSuccess(): void {
    this.totalSuccesses++;

    if (this.state === CircuitState.HALF_OPEN) {
      // Recovery confirmed — close the circuit
      this.state = CircuitState.CLOSED;
      this.consecutiveFailures = 0;
      this.openedAt = null;
    } else if (this.state === CircuitState.CLOSED) {
      this.consecutiveFailures = 0;
    }
  }

  /**
   * Record a failed request.
   * - In HALF_OPEN: immediately re-open (reset cooldown)
   * - In CLOSED: increment failures; open if threshold reached
   * - In OPEN: just update the failure timestamp
   */
  recordFailure(): void {
    this.totalFailures++;
    this.lastFailureTime = Date.now();

    switch (this.state) {
      case CircuitState.CLOSED: {
        this.consecutiveFailures++;
        if (this.consecutiveFailures >= this.config.failureThreshold) {
          this.transitionToOpen();
        }
        break;
      }

      case CircuitState.HALF_OPEN: {
        // Probe failed — go back to OPEN and restart cooldown
        this.transitionToOpen();
        break;
      }

      case CircuitState.OPEN: {
        // Already open — just update timestamp
        break;
      }
    }
  }

  /**
   * Force the circuit into a specific state. Useful for testing or admin overrides.
   */
  forceState(state: CircuitState): void {
    this.state = state;
    if (state === CircuitState.OPEN) {
      this.openedAt = Date.now();
    } else if (state === CircuitState.CLOSED) {
      this.consecutiveFailures = 0;
      this.openedAt = null;
    }
  }

  /** Get the current circuit state */
  getState(): CircuitState {
    // Lazily check if OPEN should transition to HALF_OPEN
    if (this.state === CircuitState.OPEN && this.openedAt !== null) {
      const elapsed = Date.now() - this.openedAt;
      if (elapsed >= this.config.cooldownMs) {
        this.state = CircuitState.HALF_OPEN;
      }
    }
    return this.state;
  }

  /** Get the number of consecutive failures (resets on success) */
  getConsecutiveFailures(): number {
    return this.consecutiveFailures;
  }

  /** Get the timestamp of the last failure, or null */
  getLastFailureTime(): number | null {
    return this.lastFailureTime;
  }

  /** Returns true if the circuit is currently allowing traffic */
  isAvailable(): boolean {
    return this.allow();
  }

  /** Get a full snapshot of the circuit breaker state for observability */
  getSnapshot(): CircuitBreakerSnapshot {
    return {
      state: this.getState(),
      consecutiveFailures: this.consecutiveFailures,
      lastFailureTime: this.lastFailureTime,
      totalSuccesses: this.totalSuccesses,
      totalFailures: this.totalFailures,
      openedAt: this.openedAt,
    };
  }

  /** Reset the circuit breaker to its initial state */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.consecutiveFailures = 0;
    this.lastFailureTime = null;
    this.openedAt = null;
    // Note: totalSuccesses and totalFailures are NOT reset — they are lifetime counters
  }

  /** Full reset including lifetime counters */
  resetAll(): void {
    this.reset();
    this.totalSuccesses = 0;
    this.totalFailures = 0;
  }

  /** Calculate success rate as a number between 0 and 1 */
  getSuccessRate(): number {
    const total = this.totalSuccesses + this.totalFailures;
    if (total === 0) return 1.0;
    return this.totalSuccesses / total;
  }

  /* ------------------------------------------------------------------ */
  /* Private helpers                                                     */
  /* ------------------------------------------------------------------ */

  private transitionToOpen(): void {
    this.state = CircuitState.OPEN;
    this.openedAt = Date.now();
  }
}