import { RoutingDecision } from '../models/RoutingDecision';
import { RoutingContext } from '../models/RoutingContext';
import { BudgetGuard, BudgetLevel } from '../models/BudgetGuard';
import type { BudgetSnapshot } from '../models/BudgetGuard';
import { CircuitBreakerState, CircuitState, DEFAULT_CB_CONFIG } from '../models/CircuitBreakerState';
import type { CircuitBreakerConfig } from '../models/CircuitBreakerState';
import { BetaBinomialPosterior } from '../models/BetaBinomialPosterior';
import { ProviderCapabilityProfile } from '../models/ProviderCapabilityProfile';
import type { IRouterStatePort } from '../ports/IRouterStatePort';
import { ContextDiscretizer } from './ContextDiscretizer';
import { AdaptiveStickiness } from './AdaptiveStickiness';
import type { IStickinessSessionState } from './AdaptiveStickiness';
import { ParetoMultiObjectiveSelector } from './ParetoMultiObjectiveSelector';

export class ZaosNeuroRouter {
  private readonly stickinessMap = new Map<string, IStickinessSessionState>();

  constructor(
    private readonly statePort: IRouterStatePort,
    private readonly providers: ProviderCapabilityProfile[],
    private readonly budgetGuard: BudgetGuard,
    private readonly discretizer: ContextDiscretizer,
    private readonly stickinessService: AdaptiveStickiness,
    private readonly paretoSelector: ParetoMultiObjectiveSelector,
    private readonly neuroeconomicWeight: number = 10.0,
    private readonly cbConfig: CircuitBreakerConfig = DEFAULT_CB_CONFIG,
  ) {}

  async decide(
    context: RoutingContext,
    budgetSnapshot: BudgetSnapshot,
    prng: () => number = Math.random,
  ): Promise<RoutingDecision> {
    // 1. Identify Context Bucket
    const bucketId = this.discretizer.discretize(context.inputText);

    // 2. Assess Budget Level & Limits
    const budgetLevel = this.budgetGuard.assessLevel(budgetSnapshot);
    const maxAllowedTier = budgetLevel === BudgetLevel.CRITICAL ? 1 : 3;

    // 3. Load Posteriors & CB States
    const posteriors = this.statePort.loadAllPosteriors();
    const cbRawStates = this.statePort.loadCircuitBreakerStates();

    // 4. Update Circuit Breaker States (e.g. check for transition OPEN -> HALF_OPEN)
    const cbStates = new Map<string, CircuitBreakerState>();
    const updatedCbRawStates = new Map<string, any>();
    let cbModified = false;

    for (const provider of this.providers) {
      const raw = cbRawStates.get(provider.name);
      const cbState = raw
        ? CircuitBreakerState.create(
            raw.state as CircuitState,
            raw.consecutiveFailures,
            raw.consecutiveSuccesses,
            raw.lastFailureAt,
            raw.openedAt,
            raw.halfOpenAttempts,
          )
        : CircuitBreakerState.INITIAL;

      // Check transition to HALF_OPEN
      const nextCbState = cbState.maybeTransitionToHalfOpen(this.cbConfig);
      if (nextCbState.state !== cbState.state) {
        cbModified = true;
      }
      cbStates.set(provider.name, nextCbState);
      updatedCbRawStates.set(provider.name, {
        state: nextCbState.state,
        consecutiveFailures: nextCbState.consecutiveFailures,
        consecutiveSuccesses: nextCbState.consecutiveSuccesses,
        lastFailureAt: nextCbState.lastFailureAt,
        openedAt: nextCbState.openedAt,
        halfOpenAttempts: nextCbState.halfOpenAttempts,
      });
    }

    if (cbModified) {
      await this.statePort.saveCircuitBreakerStates(updatedCbRawStates);
    }

    // 5. Select Pareto Candidates
    const paretoCandidates = this.paretoSelector.selectEligibleProviders(
      bucketId,
      this.providers,
      maxAllowedTier,
    );

    // 6. Filter Candidates that are healthy (Circuit Breaker state is not OPEN)
    const healthyCandidates = paretoCandidates.filter((p) => {
      const cb = cbStates.get(p.name);
      return !cb || cb.state !== CircuitState.OPEN;
    });

    if (healthyCandidates.length === 0) {
      // Emergency fallback if all matching providers are unhealthy
      return RoutingDecision.emergencyFallback(bucketId);
    }

    // 7. Check if we should apply session stickiness
    const stickyState = this.stickinessMap.get(context.sessionId);
    if (stickyState) {
      const stickyProvider = healthyCandidates.find((p) => p.name === stickyState.providerName);
      const cb = cbStates.get(stickyState.providerName);
      const isHealthy = !cb || cb.state !== CircuitState.OPEN;

      if (
        stickyProvider &&
        this.stickinessService.shouldMaintainStickiness(context, stickyState, stickyProvider, isHealthy)
      ) {
        // Keep stickiness
        this.stickinessMap.set(context.sessionId, {
          providerName: stickyState.providerName,
          lastSelectedAt: Date.now(),
          turnsInSession: context.turnsCount,
        });

        // Compute dummy utility/theta arrays to return RoutingDecision correctly
        return RoutingDecision.create({
          bucketId,
          selectedProviderName: stickyState.providerName,
          isEmergencyFallback: false,
          isStickinessApplied: true,
          expectedUtility: 1.0,
          sampledThetas: new Map([[stickyState.providerName, 1.0]]),
          adjustedCosts: new Map([[stickyState.providerName, 0.0]]),
        });
      }
    }

    // 8. Execute Thompson Sampling on healthy candidates
    const sampledThetas = new Map<string, number>();
    const adjustedCosts = new Map<string, number>();
    let bestProvider: ProviderCapabilityProfile | null = null;
    let highestUtility = -Infinity;

    for (const provider of healthyCandidates) {
      const posteriorKey = `${bucketId}__${provider.name}`;
      const rawPost = posteriors.get(posteriorKey);
      const posterior = rawPost
        ? BetaBinomialPosterior.create(
            rawPost.alpha,
            rawPost.beta,
            rawPost.nObservations,
            rawPost.lastUpdateAt,
          )
        : BetaBinomialPosterior.fromBenchmarkPriors(provider.capabilityScore);

      // Draw sample theta
      const theta = posterior.sample(prng);
      sampledThetas.set(provider.name, theta);

      // Estimate Real Cost (using 2000 input / 1000 output tokens standard benchmark)
      const realCost = provider.estimateCost(2000, 1000);

      // Get Adjusted Cost based on Budget Level
      const adjustedCost = this.budgetGuard.getAdjustedCost(realCost, provider.tier, budgetLevel);
      adjustedCosts.set(provider.name, adjustedCost);

      // Expected utility calculation
      const utility = theta - this.neuroeconomicWeight * adjustedCost;

      if (utility > highestUtility) {
        highestUtility = utility;
        bestProvider = provider;
      }
    }

    const winner = bestProvider || healthyCandidates[0];

    // 9. Save Stickiness Session State
    this.stickinessMap.set(context.sessionId, {
      providerName: winner.name,
      lastSelectedAt: Date.now(),
      turnsInSession: context.turnsCount,
    });

    return RoutingDecision.create({
      bucketId,
      selectedProviderName: winner.name,
      isEmergencyFallback: false,
      isStickinessApplied: false,
      expectedUtility: highestUtility,
      sampledThetas,
      adjustedCosts,
    });
  }

  async recordFeedback(
    decision: RoutingDecision,
    success: boolean,
    latencyMs: number,
  ): Promise<void> {
    if (decision.isEmergencyFallback || decision.selectedProviderName === 'rules_engine') {
      return; // Do not update stats for rules fallback
    }

    const selectedProvider = this.providers.find((p) => p.name === decision.selectedProviderName);
    if (!selectedProvider) return;

    // Load states
    const posteriors = this.statePort.loadAllPosteriors();
    const cbRawStates = this.statePort.loadCircuitBreakerStates();

    // 1. Update posterior
    const posteriorKey = `${decision.bucketId}__${decision.selectedProviderName}`;
    const rawPost = posteriors.get(posteriorKey);
    const posterior = rawPost
      ? BetaBinomialPosterior.create(
          rawPost.alpha,
          rawPost.beta,
          rawPost.nObservations,
          rawPost.lastUpdateAt,
        )
      : BetaBinomialPosterior.fromBenchmarkPriors(selectedProvider.capabilityScore);

    const updatedPosterior = posterior.update(success);

    await this.statePort.savePosteriorBatch([
      {
        bucketId: decision.bucketId,
        providerName: decision.selectedProviderName,
        alpha: updatedPosterior.alpha,
        beta: updatedPosterior.beta,
        nObservations: updatedPosterior.nObservations,
        lastUpdateAt: updatedPosterior.lastUpdateAt,
      },
    ]);

    // 2. Update circuit breaker state
    const rawCb = cbRawStates.get(decision.selectedProviderName);
    const cbState = rawCb
      ? CircuitBreakerState.create(
          rawCb.state as CircuitState,
          rawCb.consecutiveFailures,
          rawCb.consecutiveSuccesses,
          rawCb.lastFailureAt,
          rawCb.openedAt,
          rawCb.halfOpenAttempts,
        )
      : CircuitBreakerState.INITIAL;

    // Treat success && latency within SLA as a CB success.
    // If latency is higher than provider SLA, or feedback is unsuccessful, it's a failure.
    const cbSuccess = success && latencyMs <= selectedProvider.slaLatencyMs;
    const nextCbState = cbSuccess
      ? cbState.recordSuccess()
      : cbState.recordFailure(this.cbConfig);

    const nextCbRawStates = new Map(cbRawStates);
    nextCbRawStates.set(decision.selectedProviderName, {
      state: nextCbState.state,
      consecutiveFailures: nextCbState.consecutiveFailures,
      consecutiveSuccesses: nextCbState.consecutiveSuccesses,
      lastFailureAt: nextCbState.lastFailureAt,
      openedAt: nextCbState.openedAt,
      halfOpenAttempts: nextCbState.halfOpenAttempts,
    });

    await this.statePort.saveCircuitBreakerStates(nextCbRawStates);
  }
}
