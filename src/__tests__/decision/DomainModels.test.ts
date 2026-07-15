import { describe, it, expect, vi } from 'vitest';
import { ProviderCapabilityProfile } from '../../domain/decision/models/ProviderCapabilityProfile';
import { BetaBinomialPosterior } from '../../domain/decision/models/BetaBinomialPosterior';
import { RoutingContext } from '../../domain/decision/models/RoutingContext';
import { RoutingDecision } from '../../domain/decision/models/RoutingDecision';
import { CircuitBreakerState, CircuitState } from '../../domain/decision/models/CircuitBreakerState';
import { BudgetGuard, BudgetLevel } from '../../domain/decision/models/BudgetGuard';
import { InMemoryRouterStateAdapter } from '../../domain/decision/adapters/InMemoryRouterStateAdapter';

describe('Domain Decision Value Objects', () => {
  describe('ProviderCapabilityProfile', () => {
    it('should create a valid capability profile', () => {
      const cap = {
        reasoning: 0.9,
        conversation: 0.8,
        code: 0.7,
        json: 0.9,
        creative: 0.6,
        multilingual: 0.8,
        safety: 0.9,
      };
      const profile = ProviderCapabilityProfile.create({
        name: 'test-provider',
        tier: 3,
        costInputPer1M: 3.0,
        costOutputPer1M: 15.0,
        capabilities: cap,
        slaLatencyMs: 2000,
        maxContextTokens: 128000,
      });

      expect(profile.name).toBe('test-provider');
      expect(profile.tier).toBe(3);
      expect(profile.estimateCost(100000, 200000)).toBeCloseTo(0.3 + 3.0); // (100k/1M)*3 + (200k/1M)*15 = 0.3 + 3.0 = 3.3
      expect(profile.capabilityScore).toBeCloseTo((0.9 + 0.8 + 0.7 + 0.9 + 0.6 + 0.8 + 0.9) / 7);
    });
  });

  describe('BetaBinomialPosterior', () => {
    it('should initialize to uniform prior (Beta(1,1))', () => {
      const posterior = BetaBinomialPosterior.UNIFORM;
      expect(posterior.alpha).toBe(1.0);
      expect(posterior.beta).toBe(1.0);
      expect(posterior.mean).toBe(0.5);
      expect(posterior.variance).toBe(1 / 12); // 1*1 / (4 * 3) = 1/12
    });

    it('should create priors from benchmark capabilities', () => {
      const cap = 0.85;
      const posterior = BetaBinomialPosterior.fromBenchmarkPriors(cap, 10);
      // alpha = 0.85 * 10 + 1 = 9.5
      // beta = (1 - 0.85) * 10 + 1 = 2.5
      expect(posterior.alpha).toBe(9.5);
      expect(posterior.beta).toBe(2.5);
      expect(posterior.mean).toBeCloseTo(9.5 / 12);
    });

    it('should throw an error if alpha or beta <= 0', () => {
      expect(() => BetaBinomialPosterior.create(0, 1, 0, 0)).toThrow();
      expect(() => BetaBinomialPosterior.create(1, -0.5, 0, 0)).toThrow();
    });

    it('should update on success and failure returning new instances', () => {
      const p0 = BetaBinomialPosterior.UNIFORM;
      const p1 = p0.update(true);
      expect(p1).not.toBe(p0);
      expect(p1.alpha).toBe(2.0);
      expect(p1.beta).toBe(1.0);
      expect(p1.nObservations).toBe(1);

      const p2 = p1.update(false);
      expect(p2.alpha).toBe(2.0);
      expect(p2.beta).toBe(2.0);
      expect(p2.nObservations).toBe(2);
    });

    it('should decay exponentially preserving base prior mass', () => {
      const p0 = BetaBinomialPosterior.create(11.0, 6.0, 15, Date.now()); // alpha=11, beta=6 (mean ~ 0.647)
      const factor = 0.9;
      const p1 = p0.decay(factor);
      // alpha = 1 + 0.9 * 10 = 10
      // beta = 1 + 0.9 * 5 = 5.5
      expect(p1.alpha).toBe(10.0);
      expect(p1.beta).toBe(5.5);
      expect(p1.nObservations).toBe(15);
    });

    it('should sample deterministically under a PRNG', () => {
      const p0 = BetaBinomialPosterior.create(10, 5, 10, Date.now());
      
      // Seeded LCG PRNG for reproducibility
      let seed = 42;
      const lcg = () => {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        return seed / 4294967296;
      };

      const s1 = p0.sample(lcg);
      const s2 = p0.sample(lcg);

      // Reset seed
      seed = 42;
      const s1_dup = p0.sample(lcg);
      const s2_dup = p0.sample(lcg);

      expect(s1).toBe(s1_dup);
      expect(s2).toBe(s2_dup);
      expect(s1).toBeGreaterThan(0);
      expect(s1).toBeLessThan(1);
    });
  });

  describe('RoutingContext and Decision', () => {
    it('should build RoutingContext correctly', () => {
      const start = Date.now() - 5000;
      const ctx = RoutingContext.create({
        inputText: 'Preciso de wi-fi',
        sessionId: 'session-123',
        tenantId: 'tenant-456',
        turnsCount: 3,
        sessionStartMs: start,
        channel: 'whatsapp',
        metadata: { clientLanguage: 'pt-BR' },
      });

      expect(ctx.inputText).toBe('Preciso de wi-fi');
      expect(ctx.turnsCount).toBe(3);
      expect(ctx.elapsedMs).toBeGreaterThanOrEqual(5000);
      expect(ctx.metadata.clientLanguage).toBe('pt-BR');
      expect(Object.isFrozen(ctx.metadata)).toBe(true);
    });

    it('should build RoutingDecision correctly', () => {
      const sampled = new Map([['model-a', 0.8], ['model-b', 0.65]]);
      const costs = new Map([['model-a', 0.005], ['model-b', 0.002]]);

      const decision = RoutingDecision.create({
        bucketId: '02',
        selectedProviderName: 'model-a',
        expectedUtility: 0.795,
        sampledThetas: sampled,
        adjustedCosts: costs,
      });

      expect(decision.bucketId).toBe('02');
      expect(decision.selectedProviderName).toBe('model-a');
      expect(decision.isEmergencyFallback).toBe(false);
      expect(decision.expectedUtility).toBe(0.795);
      expect(decision.sampledThetas.get('model-a')).toBe(0.8);
    });

    it('should create an emergency fallback decision', () => {
      const fallback = RoutingDecision.emergencyFallback('05');
      expect(fallback.bucketId).toBe('05');
      expect(fallback.selectedProviderName).toBe('rules_engine');
      expect(fallback.isEmergencyFallback).toBe(true);
    });
  });

  describe('CircuitBreakerState', () => {
    it('should transition CLOSED -> OPEN on failures', () => {
      let cb = CircuitBreakerState.INITIAL;
      expect(cb.state).toBe(CircuitState.CLOSED);

      const config = {
        failureThreshold: 3,
        halfOpenMaxAttempts: 1,
        openDurationMs: 1000,
        successThreshold: 2,
      };

      cb = cb.recordFailure(config);
      cb = cb.recordFailure(config);
      expect(cb.state).toBe(CircuitState.CLOSED);
      expect(cb.consecutiveFailures).toBe(2);

      cb = cb.recordFailure(config);
      expect(cb.state).toBe(CircuitState.OPEN);
      expect(cb.consecutiveFailures).toBe(3);
      expect(cb.openedAt).toBeGreaterThan(0);
    });

    it('should transition OPEN -> HALF_OPEN after duration', async () => {
      const config = {
        failureThreshold: 2,
        halfOpenMaxAttempts: 1,
        openDurationMs: 50,
        successThreshold: 2,
      };

      let cb = CircuitBreakerState.INITIAL.recordFailure(config).recordFailure(config);
      expect(cb.state).toBe(CircuitState.OPEN);

      // Not enough time has passed
      cb = cb.maybeTransitionToHalfOpen(config);
      expect(cb.state).toBe(CircuitState.OPEN);

      // Wait 60ms
      await new Promise((r) => setTimeout(r, 60));

      cb = cb.maybeTransitionToHalfOpen(config);
      expect(cb.state).toBe(CircuitState.HALF_OPEN);
    });

    it('should transition HALF_OPEN -> CLOSED on successes', () => {
      const config = {
        failureThreshold: 2,
        halfOpenMaxAttempts: 1,
        openDurationMs: 50,
        successThreshold: 2,
      };

      // Force create a HALF_OPEN state by recording successes
      // (Using internal constructor trick: we can set up a HALF_OPEN state directly by testing recordSuccess)
      // Since recordSuccess transitions HALF_OPEN -> CLOSED once successThreshold is met.
      // Let's transition manually:
      // Initializing a custom CB state:
      const cbOpen = CircuitBreakerState.INITIAL.recordFailure(config).recordFailure(config);
      // Wait for openDurationMs by spoofing OpenedAt
      const spoofedCbOpen = new (CircuitBreakerState as any)(
        CircuitState.OPEN, 2, 0, Date.now() - 100, Date.now() - 100, 0
      );

      let cbHalf = spoofedCbOpen.maybeTransitionToHalfOpen(config);
      expect(cbHalf.state).toBe(CircuitState.HALF_OPEN);

      cbHalf = cbHalf.recordSuccess(); // success 1
      expect(cbHalf.state).toBe(CircuitState.HALF_OPEN);
      expect(cbHalf.consecutiveSuccesses).toBe(1);

      cbHalf = cbHalf.recordSuccess(); // success 2 (meets threshold of 2)
      expect(cbHalf.state).toBe(CircuitState.CLOSED);
      expect(cbHalf.consecutiveSuccesses).toBe(0);
      expect(cbHalf.consecutiveFailures).toBe(0);
    });

    it('should transition HALF_OPEN -> OPEN on failure immediately', () => {
      const config = {
        failureThreshold: 2,
        halfOpenMaxAttempts: 1,
        openDurationMs: 50,
        successThreshold: 2,
      };

      const spoofedCbOpen = new (CircuitBreakerState as any)(
        CircuitState.OPEN, 2, 0, Date.now() - 100, Date.now() - 100, 0
      );
      let cbHalf = spoofedCbOpen.maybeTransitionToHalfOpen(config);
      expect(cbHalf.state).toBe(CircuitState.HALF_OPEN);

      cbHalf = cbHalf.recordFailure(config);
      expect(cbHalf.state).toBe(CircuitState.OPEN);
      expect(cbHalf.consecutiveFailures).toBe(3);
    });
  });

  describe('BudgetGuard', () => {
    const allProviders = [
      { name: 'rules-tier1', tier: 1 as const },
      { name: 'mini-tier2', tier: 2 as const },
      { name: 'premium-tier3', tier: 3 as const },
    ];

    it('should assess correct budget level', () => {
      const guard = new BudgetGuard({ warningThreshold: 0.8, criticalThreshold: 0.95 });

      expect(guard.assessLevel({ dailySpendUsd: 5, dailyBudgetUsd: 10, monthlySpendUsd: 50, monthlyBudgetUsd: 100 })).toBe(BudgetLevel.NORMAL); // 50%
      expect(guard.assessLevel({ dailySpendUsd: 8.5, dailyBudgetUsd: 10, monthlySpendUsd: 50, monthlyBudgetUsd: 100 })).toBe(BudgetLevel.WARNING); // 85%
      expect(guard.assessLevel({ dailySpendUsd: 5, dailyBudgetUsd: 10, monthlySpendUsd: 96, monthlyBudgetUsd: 100 })).toBe(BudgetLevel.CRITICAL); // 96%
    });

    it('should restrict provider names on CRITICAL budget level', () => {
      const guard = new BudgetGuard();
      const allowedNormal = guard.getAllowedProviderNames(allProviders, BudgetLevel.NORMAL);
      expect(allowedNormal).toEqual(['rules-tier1', 'mini-tier2', 'premium-tier3']);

      const allowedCritical = guard.getAllowedProviderNames(allProviders, BudgetLevel.CRITICAL);
      expect(allowedCritical).toEqual(['rules-tier1']);
    });

    it('should inflate cost on WARNING and block on CRITICAL', () => {
      const guard = new BudgetGuard({ costInflationFactor: 4.0 });

      // normal
      expect(guard.getAdjustedCost(0.1, 3, BudgetLevel.NORMAL)).toBe(0.1);

      // warning
      expect(guard.getAdjustedCost(0.1, 3, BudgetLevel.WARNING)).toBe(0.4); // 0.1 * 4.0
      expect(guard.getAdjustedCost(0.01, 1, BudgetLevel.WARNING)).toBe(0.01); // tier 1 not inflated

      // critical
      expect(guard.getAdjustedCost(0.1, 2, BudgetLevel.CRITICAL)).toBe(Infinity);
      expect(guard.getAdjustedCost(0.01, 1, BudgetLevel.CRITICAL)).toBe(0.01); // tier 1 still cheap
    });
  });

  describe('InMemoryRouterStateAdapter', () => {
    it('should set, load and save state in memory', async () => {
      const adapter = new InMemoryRouterStateAdapter();
      adapter.setPosterior('02__model-a', {
        alpha: 3.5,
        beta: 1.5,
        nObservations: 5,
        lastUpdateAt: 1234567,
      });

      const posteriors = adapter.loadAllPosteriors();
      expect(posteriors.get('02__model-a')).toEqual({
        alpha: 3.5,
        beta: 1.5,
        nObservations: 5,
        lastUpdateAt: 1234567,
      });

      await adapter.savePosteriorBatch([
        {
          bucketId: '02',
          providerName: 'model-a',
          alpha: 4.5,
          beta: 1.5,
          nObservations: 6,
          lastUpdateAt: 1234568,
        }
      ]);

      const posteriorsAfter = adapter.loadAllPosteriors();
      expect(posteriorsAfter.get('02__model-a')).toEqual({
        alpha: 4.5,
        beta: 1.5,
        nObservations: 6,
        lastUpdateAt: 1234568,
      });

      adapter.reset();
      expect(adapter.loadAllPosteriors().size).toBe(0);
    });
  });
});
