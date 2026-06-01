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
});
