import type { RoutingContext } from '../models/RoutingContext';
import type { ProviderCapabilityProfile } from '../models/ProviderCapabilityProfile';

export interface IStickinessSessionState {
  readonly providerName: string;
  readonly lastSelectedAt: number;
  readonly turnsInSession: number;
}

export class AdaptiveStickiness {
  constructor(
    private readonly maxTurns: number = 8,
    private readonly maxDurationMs: number = 10 * 60 * 1000, // 10 minutes
  ) {}

  shouldMaintainStickiness(
    context: RoutingContext,
    currentState: IStickinessSessionState | null | undefined,
    currentProviderProfile: ProviderCapabilityProfile | undefined,
    isProviderHealthy: boolean,
  ): boolean {
    if (!currentState) {
      return false;
    }

    // If the provider is no longer healthy (e.g. circuit breaker open) or doesn't exist, break stickiness
    if (!currentProviderProfile || !isProviderHealthy) {
      return false;
    }

    // Check turns limit
    if (context.turnsCount - currentState.turnsInSession >= this.maxTurns) {
      return false;
    }

    // Check duration limit
    const elapsed = Date.now() - currentState.lastSelectedAt;
    if (elapsed >= this.maxDurationMs) {
      return false;
    }

    return true;
  }
}
