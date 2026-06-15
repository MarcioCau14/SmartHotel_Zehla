/**
 * ZEHLA SMARTHOTEL — ZaosNeuroRouter Lote 3 Test Suite
 * Módulo: src/__tests__/decision/ZaosNeuroRouterLote3.test.ts
 */

import { describe, it, expect } from 'vitest';
import { ZaosNeuroRouter } from '../../domain/decision/services/ZaosNeuroRouter';
import { RoutingContext } from '../../domain/decision/models/RoutingContext';
import { ProviderCapabilityProfile } from '../../domain/decision/models/ProviderCapabilityProfile';
import { InMemoryRouterStateAdapter } from '../../domain/decision/adapters/InMemoryRouterStateAdapter';
import { ContextDiscretizer } from '../../domain/decision/services/ContextDiscretizer';
import { BudgetCircuitBreaker } from '../../domain/decision/services/BudgetCircuitBreaker';
import { ProviderCircuitBreaker } from '../../domain/decision/services/ProviderCircuitBreaker';
import { ParetoMultiObjectiveSelector } from '../../domain/decision/services/ParetoMultiObjectiveSelector';
import { BetaBinomialPosterior } from '../../domain/decision/models/BetaBinomialPosterior';
import { BudgetSnapshot } from '../../domain/decision/models/BudgetGuard';
import { ICacheRepository } from '../../domain/shared/ports/ICacheRepository';
import { Result } from '../../shared/Result';

class InMemoryCacheRepository implements ICacheRepository {
  private cache = new Map<string, { value: string; expiresAt: number }>()

  async setNX(key: string, value: string, ttlSeconds: number): Promise<Result<boolean, Error>> {
    const now = Date.now()
    const entry = this.cache.get(key)
    if (entry && entry.expiresAt > now) {
      return Result.ok(false)
    }
    this.cache.set(key, { value, expiresAt: now + ttlSeconds * 1000 })
    return Result.ok(true)
  }

  async exists(key: string): Promise<Result<boolean, Error>> {
    const now = Date.now()
    const entry = this.cache.get(key)
    return Result.ok(!!(entry && entry.expiresAt > now))
  }

  async delete(key: string): Promise<Result<void, Error>> {
    this.cache.delete(key)
    return Result.ok(undefined)
  }

  async clear(): Promise<Result<void, Error>> {
    this.cache.clear()
    return Result.ok(undefined)
  }

  async get(key: string): Promise<Result<string | null, Error>> {
    const now = Date.now()
    const entry = this.cache.get(key)
    if (entry && entry.expiresAt > now) {
      return Result.ok(entry.value)
    }
    return Result.ok(null)
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<Result<void, Error>> {
    const now = Date.now()
    const expiresAt = ttlSeconds ? now + ttlSeconds * 1000 : Infinity
    this.cache.set(key, { value, expiresAt })
    return Result.ok(undefined)
  }

  async incrementByFloat(key: string, value: number, ttlSeconds: number): Promise<Result<number, Error>> {
    const now = Date.now()
    const entry = this.cache.get(key)
    let currentVal = 0
    if (entry && entry.expiresAt > now) {
      currentVal = parseFloat(entry.value)
    }
    const newVal = currentVal + value
    this.cache.set(key, {
      value: String(newVal),
      expiresAt: now + ttlSeconds * 1000
    })
    return Result.ok(newVal)
  }
}

describe('ZaosNeuroRouter Lote 3 Test Suite — Aggregate Root & Bayesian Engine', () => {

  // Setup de perfis de capabilities dos provedores
  const caps = {
    reasoning: 0.9,
    conversation: 0.9,
    code: 0.9,
    json: 0.9,
    creative: 0.9,
    multilingual: 0.9,
    safety: 1.0,
  };

  const providers: ProviderCapabilityProfile[] = [
    ProviderCapabilityProfile.create({
      name: 'rules_engine',
      tier: 1,
      costInputPer1M: 0.0,
      costOutputPer1M: 0.0,
      capabilities: { ...caps, reasoning: 0.1, conversation: 0.1, code: 0.1, safety: 1.0 },
      slaLatencyMs: 10,
      maxContextTokens: 1000,
    }),
    ProviderCapabilityProfile.create({
      name: 'gpt-4o-mini',
      tier: 2,
      costInputPer1M: 0.15,
      costOutputPer1M: 0.60,
      capabilities: { ...caps, reasoning: 0.8, conversation: 0.8, creative: 0.8 },
      slaLatencyMs: 1500,
      maxContextTokens: 128_000,
    }),
    ProviderCapabilityProfile.create({
      name: 'claude-3.5-sonnet',
      tier: 3,
      costInputPer1M: 3.0,
      costOutputPer1M: 15.0,
      capabilities: { ...caps, reasoning: 0.95, creative: 0.95 },
      slaLatencyMs: 3000,
      maxContextTokens: 200_000,
    }),
  ];

  const budgetSnapshot: BudgetSnapshot = {
    dailySpendUsd: 1.0,
    dailyBudgetUsd: 10.0,
    monthlySpendUsd: 10.0,
    monthlyBudgetUsd: 100.0,
  };

  // LCG PRNG determinístico para reprodutibilidade
  let seed = 987654321;
  const lcgPrng = () => {
    seed = (1103515245 * seed + 12345) % 2147483648;
    return seed / 2147483648;
  };

  it('3.1. Convergência Sublinear O(log T) — Thompson Sampling migra tráfego do Tier 2 que falha para o Tier 3 estável', async () => {
    const adapter = new InMemoryRouterStateAdapter();
    const discretizer = new ContextDiscretizer();
    const budgetCb = new BudgetCircuitBreaker();
    const providerCb = new ProviderCircuitBreaker(adapter);
    const paretoSelector = new ParetoMultiObjectiveSelector();

    const router = new ZaosNeuroRouter(
      adapter,
      discretizer,
      budgetCb,
      providerCb,
      paretoSelector,
      providers
    );

    // Contexto de consulta de preços simples (bucket 05, minQuality = 0.7)
    // Permite tanto Tier 2 (gpt-4o-mini) quanto Tier 3 (claude-3.5-sonnet)
    const ctx = RoutingContext.create({
      inputText: 'Quanto custa a diária para o quarto de casal?',
      sessionId: 'session_123',
      tenantId: 'pousada_001',
      turnsCount: 1,
      sessionStartMs: Date.now(),
    });

    let choicesGpt = 0;
    let choicesClaude = 0;

    // Loop de 500 iterações simulando feedback do Thompson Sampling
    for (let turn = 1; turn <= 500; turn++) {
      const result = await router.route(ctx, budgetSnapshot, lcgPrng);
      expect(result.isOk).toBe(true);

      const decision = result.value;
      const selected = decision.selectedProviderName;

      // Simulamos feedback: gpt-4o-mini falha constantemente; claude-3.5-sonnet tem sucesso constante
      if (selected === 'gpt-4o-mini') {
        choicesGpt++;
        const key = `05__gpt-4o-mini`;
        const rawPost = adapter.loadAllPosteriors().get(key) || { alpha: 9.0, beta: 3.0, nObservations: 0, lastUpdateAt: 0 };
        adapter.setPosterior(key, {
          alpha: rawPost.alpha,
          beta: rawPost.beta + 1, // Falha
          nObservations: rawPost.nObservations + 1,
          lastUpdateAt: Date.now(),
        });
      } else if (selected === 'claude-3.5-sonnet') {
        choicesClaude++;
        const key = `05__claude-3.5-sonnet`;
        const rawPost = adapter.loadAllPosteriors().get(key) || { alpha: 10.5, beta: 1.5, nObservations: 0, lastUpdateAt: 0 };
        adapter.setPosterior(key, {
          alpha: rawPost.alpha + 1, // Sucesso
          beta: rawPost.beta,
          nObservations: rawPost.nObservations + 1,
          lastUpdateAt: Date.now(),
        });
      }
    }

    // Após 500 iterações, provamos que o Thompson Sampling aprendeu e convergiu para o Claude
    expect(choicesClaude).toBeGreaterThan(choicesGpt);

    // Nas últimas 50 iterações, o Claude deve dominar exaustivamente (gpt-4o-mini quase zerado)
    let lastGptChoices = 0;
    let lastClaudeChoices = 0;

    for (let turn = 1; turn <= 50; turn++) {
      const result = await router.route(ctx, budgetSnapshot, lcgPrng);
      const selected = result.value.selectedProviderName;
      if (selected === 'gpt-4o-mini') lastGptChoices++;
      if (selected === 'claude-3.5-sonnet') lastClaudeChoices++;
    }

    expect(lastClaudeChoices).toBeGreaterThan(45); // Quase 100% de tráfego migrado!
    expect(lastGptChoices).toBeLessThan(5);
  });

  it('3.2. Isolamento Bayesiano (Context Flip Mitigation) — Falhas no bucket 05 (pricing) não degradam decisões no bucket 00 (faq)', async () => {
    const adapter = new InMemoryRouterStateAdapter();
    const discretizer = new ContextDiscretizer();
    const budgetCb = new BudgetCircuitBreaker();
    const providerCb = new ProviderCircuitBreaker(adapter);
    const paretoSelector = new ParetoMultiObjectiveSelector();

    const router = new ZaosNeuroRouter(
      adapter,
      discretizer,
      budgetCb,
      providerCb,
      paretoSelector,
      providers
    );

    // Injetamos 500 falhas no bucket 05 para o gpt-4o-mini
    const key05 = `05__gpt-4o-mini`;
    adapter.setPosterior(key05, {
      alpha: 1.0,
      beta: 501.0, // Altamente degradado
      nObservations: 500,
      lastUpdateAt: Date.now(),
    });

    // 1. Decisão para o bucket 05 (pricing) -> Deve desviar do gpt-4o-mini degradado
    const ctxPricing = RoutingContext.create({
      inputText: 'Quanto custa a diária?',
      sessionId: 'session_abc',
      tenantId: 'pousada_001',
      turnsCount: 1,
      sessionStartMs: Date.now(),
    });

    const resPricing = await router.route(ctxPricing, budgetSnapshot, lcgPrng);
    expect(resPricing.isOk).toBe(true);
    expect(resPricing.value.selectedProviderName).not.toBe('gpt-4o-mini'); // Claude ou rules devido à degradação do Mini

    // 2. Decisão para o bucket 00 (faq) -> Deve continuar selecionando os ideais normais sem contaminação
    const ctxFaq = RoutingContext.create({
      inputText: 'Quais os horários de funcionamento do check-in?',
      sessionId: 'session_abc',
      tenantId: 'pousada_001',
      turnsCount: 1,
      sessionStartMs: Date.now(),
    });

    const resFaq = await router.route(ctxFaq, budgetSnapshot, lcgPrng);
    expect(resFaq.isOk).toBe(true);
    // Para FAQ simples (minQuality = 0.5), o gpt-4o-mini ainda deve ser selecionável e dominante devido ao seu custo mais baixo na fronteira
    expect(resFaq.value.selectedProviderName).toBe('gpt-4o-mini'); // Isolamento impecável!
  });

  it('3.3. ZaosNeuroRouter — Bloqueio Financeiro Real-Time via Redis (FinOps)', async () => {
    const cacheRepo = new InMemoryCacheRepository();
    const budgetCb = new BudgetCircuitBreaker(cacheRepo);
    const adapter = new InMemoryRouterStateAdapter();
    const discretizer = new ContextDiscretizer();
    const providerCb = new ProviderCircuitBreaker(adapter);
    const paretoSelector = new ParetoMultiObjectiveSelector();

    const router = new ZaosNeuroRouter(
      adapter,
      discretizer,
      budgetCb,
      providerCb,
      paretoSelector,
      providers
    );

    const ctx = RoutingContext.create({
      inputText: 'Preciso de ajuda urgente',
      sessionId: 'session_xyz',
      tenantId: 'pousada_xyz',
      turnsCount: 1,
      sessionStartMs: Date.now(),
      metadata: { dailyBudget: 10.0, monthlyBudget: 100.0 }
    });

    // 1. Tráfego permitido inicialmente (custo = 0)
    const res1 = await router.route(ctx, undefined, lcgPrng);
    expect(res1.isOk).toBe(true);
    expect(res1.value.isEmergencyFallback).toBe(false);

    // 2. Simular estouro de orçamento no cache (atinge 9.5 que é 95% do limite 10.0)
    await budgetCb.addTokenCost('pousada_xyz', 9.5);

    // 3. Tráfego deve ser bloqueado e redirecionado síncronamente para o emergencyFallback (Rules Engine)
    const res2 = await router.route(ctx, undefined, lcgPrng);
    expect(res2.isOk).toBe(true);
    expect(res2.value.isEmergencyFallback).toBe(true);
    expect(res2.value.selectedProviderName).toBe('rules_engine');
  });
});
