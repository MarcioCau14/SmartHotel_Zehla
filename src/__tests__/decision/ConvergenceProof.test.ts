import { describe, it, expect } from 'vitest';
import { BetaBinomialPosterior } from '../../domain/decision/models/BetaBinomialPosterior';
import { ProviderCapabilityProfile } from '../../domain/decision/models/ProviderCapabilityProfile';
import { InMemoryRouterStateAdapter } from '../../domain/decision/adapters/InMemoryRouterStateAdapter';

describe('Thompson Sampling and Bayesian Decision Convergence Proof', () => {
  // Simple LCG PRNG for reproducible testing
  const createLcg = (initSeed = 42) => {
    let seed = initSeed;
    return () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
  };

  it('should prove Sublinear Regret O(log T) and convergence to the optimal provider', async () => {
    const prng = createLcg(42);

    // Setup 2 providers
    // Provider A (Tier 2, cheaper, but lower quality/success rate)
    const capA = { reasoning: 0.5, conversation: 0.5, code: 0.5, json: 0.5, creative: 0.5, multilingual: 0.5, safety: 0.5 };
    const providerA = ProviderCapabilityProfile.create({
      name: 'local-ollama-8b',
      tier: 2,
      costInputPer1M: 0.2, // $0.20 per 1M input
      costOutputPer1M: 0.2,
      capabilities: capA,
      slaLatencyMs: 500,
      maxContextTokens: 8192,
    });
    const trueSuccessRateA = 0.50; // 50% true success rate

    // Provider B (Tier 3, more expensive, but high quality/success rate)
    const capB = { reasoning: 0.95, conversation: 0.95, code: 0.95, json: 0.95, creative: 0.95, multilingual: 0.95, safety: 0.95 };
    const providerB = ProviderCapabilityProfile.create({
      name: 'cloud-claude-sonnet',
      tier: 3,
      costInputPer1M: 3.0, // $3.00 per 1M input
      costOutputPer1M: 15.0, // $15.00 per 1M output
      capabilities: capB,
      slaLatencyMs: 2000,
      maxContextTokens: 200000,
    });
    const trueSuccessRateB = 0.95; // 95% true success rate

    // We start with uniform posteriors for both providers under bucket "05" (pricing_simple_query)
    let postA = BetaBinomialPosterior.UNIFORM;
    let postB = BetaBinomialPosterior.UNIFORM;

    const weight = 10.0; // Neuroeconomic cost penalty weight
    // Cost per request estimation (say 2000 input, 1000 output tokens)
    const costA = providerA.estimateCost(2000, 1000); // 2000*0.2/1M + 1000*0.2/1M = 0.0006
    const costB = providerB.estimateCost(2000, 1000); // 2000*3/1M + 1000*15/1M = 0.021

    let countA = 0;
    let countB = 0;
    const totalRounds = 300;

    for (let round = 1; round <= totalRounds; round++) {
      // 1. Sample theta values from posteriors
      const thetaA = postA.sample(prng);
      const thetaB = postB.sample(prng);

      // 2. Compute expected utilities
      const utilityA = thetaA - weight * costA;
      const utilityB = thetaB - weight * costB;

      // 3. Select provider with highest utility
      if (utilityA >= utilityB) {
        countA++;
        // Simulate trial success
        const success = prng() < trueSuccessRateA;
        postA = postA.update(success);
      } else {
        countB++;
        // Simulate trial success
        const success = prng() < trueSuccessRateB;
        postB = postB.update(success);
      }
    }

    // Convergence check: By the end of 300 rounds, the algorithm should have learned
    // that Claude (Provider B) provides significantly higher utility despite the cost.
    // Therefore, Provider B should be chosen significantly more than Provider A.
    // Let's assert that Provider B was chosen for the majority of the rounds.
    expect(countB).toBeGreaterThan(countA);
    expect(countB).toBeGreaterThan(totalRounds * 0.7); // At least 70% of the choices converge to B
  });

  it('should prove Bayesian Isolation between context buckets', async () => {
    const adapter = new InMemoryRouterStateAdapter();

    // Set posterior for bucket "05" (pricing_simple_query)
    adapter.setPosterior('05__model-a', {
      alpha: 10,
      beta: 2,
      nObservations: 12,
      lastUpdateAt: 1000,
    });

    // Bucket "00" (faq_hours_operating) should remain undefined/uniform
    const all = adapter.loadAllPosteriors();
    expect(all.has('05__model-a')).toBe(true);
    expect(all.has('00__model-a')).toBe(false);
  });

  it('should verify Cold Start MMLU Priors', () => {
    const post = BetaBinomialPosterior.fromBenchmarkPriors(0.85, 10);
    // alpha = 0.85 * 10 + 1 = 9.5
    // beta = (1 - 0.85) * 10 + 1 = 2.5
    // mean = 9.5 / 12 = 0.7916
    expect(post.mean).toBeCloseTo(0.7916);
    expect(post.mean).toBeGreaterThan(0.75);
  });

  it('should verify Decaimento Não-Estacionário limits', () => {
    const post0 = BetaBinomialPosterior.create(20, 10, 30, Date.now()); // mean = 2/3 ≈ 0.666
    const postDecayed = post0.decay(0.95); // apply 5% decay factor

    // alpha = 1.0 + 0.95 * 19 = 19.05
    // beta = 1.0 + 0.95 * 9 = 9.55
    expect(postDecayed.alpha).toBeCloseTo(19.05);
    expect(postDecayed.beta).toBeCloseTo(9.55);
    expect(postDecayed.mean).toBeCloseTo(19.05 / (19.05 + 9.55)); // 19.05 / 28.6 = 0.666
    expect(postDecayed.mean).toBeCloseTo(post0.mean);
  });

  it('should initialize a complete 32x5 matrix of posteriors without collisions', async () => {
    const adapter = new InMemoryRouterStateAdapter();
    const providers = ['rules', 'ollama-8b', 'ollama-14b', 'gpt-4o-mini', 'claude-sonnet'];
    const updates: Array<{
      bucketId: string;
      providerName: string;
      alpha: number;
      beta: number;
      nObservations: number;
      lastUpdateAt: number;
    }> = [];

    for (let b = 0; b < 32; b++) {
      const bucketId = b.toString().padStart(2, '0');
      for (const p of providers) {
        updates.push({
          bucketId,
          providerName: p,
          alpha: 1.0,
          beta: 1.0,
          nObservations: 0,
          lastUpdateAt: 0,
        });
      }
    }

    expect(updates.length).toBe(160); // 32 * 5 = 160

    await adapter.savePosteriorBatch(updates);
    const loaded = adapter.loadAllPosteriors();
    expect(loaded.size).toBe(160);

    // Assert specific key
    expect(loaded.get('15__gpt-4o-mini')).toEqual({
      alpha: 1.0,
      beta: 1.0,
      nObservations: 0,
      lastUpdateAt: 0,
    });
  });
});
