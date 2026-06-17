import { describe, it, expect, beforeEach } from 'vitest';
import { ZaosNeuroRouter } from '../../domain/decision/services/ZaosNeuroRouter';
import { ContextDiscretizer } from '../../domain/decision/services/ContextDiscretizer';
import { AdaptiveStickiness } from '../../domain/decision/services/AdaptiveStickiness';
import { ParetoMultiObjectiveSelector } from '../../domain/decision/services/ParetoMultiObjectiveSelector';
import { BudgetGuard, BudgetLevel } from '../../domain/decision/models/BudgetGuard';
import type { BudgetSnapshot } from '../../domain/decision/models/BudgetGuard';
import { ProviderCapabilityProfile } from '../../domain/decision/models/ProviderCapabilityProfile';
import { RoutingContext } from '../../domain/decision/models/RoutingContext';
import { InMemoryRouterStateAdapter } from '../../domain/decision/adapters/InMemoryRouterStateAdapter';
import { CircuitState } from '../../domain/decision/models/CircuitBreakerState';

describe('ZaosNeuroRouter Pipeline Integration Tests', () => {
  let statePort: InMemoryRouterStateAdapter;
  let budgetGuard: BudgetGuard;
  let discretizer: ContextDiscretizer;
  let stickinessService: AdaptiveStickiness;
  let paretoSelector: ParetoMultiObjectiveSelector;
  let providers: ProviderCapabilityProfile[];
  let router: ZaosNeuroRouter;

  const normalBudget: BudgetSnapshot = {
    dailySpendUsd: 10,
    dailyBudgetUsd: 100,
    monthlySpendUsd: 300,
    monthlyBudgetUsd: 3000,
  };

  const warningBudget: BudgetSnapshot = {
    dailySpendUsd: 85,
    dailyBudgetUsd: 100,
    monthlySpendUsd: 300,
    monthlyBudgetUsd: 3000,
  };

  const criticalBudget: BudgetSnapshot = {
    dailySpendUsd: 96,
    dailyBudgetUsd: 100,
    monthlySpendUsd: 300,
    monthlyBudgetUsd: 3000,
  };

  // Seeded LCG PRNG for reproducibility
  let seed = 12345;
  const lcg = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  beforeEach(() => {
    seed = 12345;
    statePort = new InMemoryRouterStateAdapter();
    budgetGuard = new BudgetGuard();
    discretizer = new ContextDiscretizer();
    stickinessService = new AdaptiveStickiness(5, 5000); // 5 turns, 5 seconds
    paretoSelector = new ParetoMultiObjectiveSelector();

    providers = [
      ProviderCapabilityProfile.create({
        name: 'rules_engine',
        tier: 1,
        costInputPer1M: 0,
        costOutputPer1M: 0,
        slaLatencyMs: 15,
        maxContextTokens: 4000,
        capabilities: {
          reasoning: 0.1,
          conversation: 1.0,
          code: 0.0,
          json: 0.0,
          creative: 0.1,
          multilingual: 0.3,
          safety: 0.9,
        },
      }),
      ProviderCapabilityProfile.create({
        name: 'local_ollama',
        tier: 2,
        costInputPer1M: 0.15,
        costOutputPer1M: 0.15,
        slaLatencyMs: 600,
        maxContextTokens: 8000,
        capabilities: {
          reasoning: 0.6,
          conversation: 0.8,
          code: 0.5,
          json: 0.9,
          creative: 0.6,
          multilingual: 0.7,
          safety: 0.8,
        },
      }),
      ProviderCapabilityProfile.create({
        name: 'claude_sonnet',
        tier: 3,
        costInputPer1M: 3.0,
        costOutputPer1M: 15.0,
        slaLatencyMs: 2200,
        maxContextTokens: 200000,
        capabilities: {
          reasoning: 0.95,
          conversation: 0.95,
          code: 0.9,
          json: 0.95,
          creative: 0.95,
          multilingual: 0.95,
          safety: 0.95,
        },
      }),
    ];

    router = new ZaosNeuroRouter(
      statePort,
      providers,
      budgetGuard,
      discretizer,
      stickinessService,
      paretoSelector,
      2.0, // w
    );
  });

  describe('Context Classification', () => {
    it('should correctly classify emergency messages', () => {
      const c1 = discretizer.discretize('O hóspede desmaiou, chamem um médico!');
      expect(c1).toBe('30'); // emergency_medical

      const c2 = discretizer.discretize('Tem um assaltante aqui, perigo!');
      expect(c2).toBe('31'); // emergency_safety
    });

    it('should classify hotel FAQ questions', () => {
      const c1 = discretizer.discretize('Qual o horário de funcionamento da piscina e do café da manhã?');
      expect(c1).toBe('00'); // faq_hours_operating

      const c2 = discretizer.discretize('Vocês aceitam cachorro pequeno?');
      expect(c2).toBe('03'); // faq_policies_rules
    });

    it('should classify billing and complaints', () => {
      const c1 = discretizer.discretize('O quarto está muito sujo e fedendo');
      expect(c1).toBe('13'); // complaint_cleanliness

      const c2 = discretizer.discretize('Fui cobrado duas vezes no meu cartão');
      expect(c2).toBe('18'); // complaint_billing_charge
    });
  });

  describe('Budget Constraints and Downgrades', () => {
    it('should allow Tier 3 models under normal budget', async () => {
      // Pricing negotiation needs Tier 3 (Claude Sonnet has higher utility)
      const context = RoutingContext.create({
        inputText: 'Gostaria de negociar o valor, fazer menor preço da diária.',
        sessionId: 'sess-1',
        tenantId: 'tenant-1',
        turnsCount: 0,
        sessionStartMs: Date.now(),
      });

      const decision = await router.decide(context, normalBudget, lcg);
      expect(decision.selectedProviderName).toBe('claude_sonnet');
    });

    it('should downgrade to Tier 1 under critical budget conditions', async () => {
      const context = RoutingContext.create({
        inputText: 'Gostaria de negociar o valor, fazer menor preço da diária.',
        sessionId: 'sess-1',
        tenantId: 'tenant-1',
        turnsCount: 0,
        sessionStartMs: Date.now(),
      });

      const decision = await router.decide(context, criticalBudget, lcg);
      // Under critical conditions, only Tier 1 is allowed
      expect(decision.selectedProviderName).toBe('rules_engine');
    });
  });

  describe('Circuit Breaker and Outage Handling', () => {
    it('should bypass a provider when its circuit breaker is OPEN', async () => {
      const context = RoutingContext.create({
        inputText: 'Dica de passeio e ponto turístico na região',
        sessionId: 'sess-2',
        tenantId: 'tenant-1',
        turnsCount: 0,
        sessionStartMs: Date.now(),
      });

      // Prepopulate high success rate for claude_sonnet to make it win under normal conditions
      await statePort.savePosteriorBatch([
        {
          bucketId: '21',
          providerName: 'claude_sonnet',
          alpha: 30,
          beta: 1,
          nObservations: 31,
          lastUpdateAt: Date.now(),
        },
      ]);

      // Claude Sonnet is selected under normal conditions
      const decision1 = await router.decide(context, normalBudget, lcg);
      expect(decision1.selectedProviderName).toBe('claude_sonnet');

      // Record 5 failures on claude_sonnet to open the circuit breaker
      for (let i = 0; i < 5; i++) {
        await router.recordFeedback(decision1, false, 2500);
      }

      // Check that CB state is OPEN in the statePort
      const cbStates = statePort.loadCircuitBreakerStates();
      expect(cbStates.get('claude_sonnet')?.state).toBe(CircuitState.OPEN);

      // Now route again
      const decision2 = await router.decide(context, normalBudget, lcg);
      // It should bypass claude_sonnet and select local_ollama instead
      expect(decision2.selectedProviderName).toBe('local_ollama');
    });
  });

  describe('Session Stickiness', () => {
    it('should stick to the previously selected provider within limits', async () => {
      const context1 = RoutingContext.create({
        inputText: 'Quais passeios vocês recomendam na região?',
        sessionId: 'sess-sticky',
        tenantId: 'tenant-1',
        turnsCount: 0,
        sessionStartMs: Date.now(),
      });

      const decision1 = await router.decide(context1, normalBudget, lcg);
      const firstChoice = decision1.selectedProviderName;

      // Turn 2
      const context2 = RoutingContext.create({
        inputText: 'E quanto custam em média esses passeios?',
        sessionId: 'sess-sticky',
        tenantId: 'tenant-1',
        turnsCount: 1,
        sessionStartMs: Date.now(),
      });

      const decision2 = await router.decide(context2, normalBudget, lcg);
      expect(decision2.selectedProviderName).toBe(firstChoice);
      expect(decision2.isStickinessApplied).toBe(true);
    });

    it('should break stickiness if turns count exceeds limit', async () => {
      const context1 = RoutingContext.create({
        inputText: 'Quais passeios vocês recomendam na região?',
        sessionId: 'sess-sticky-break',
        tenantId: 'tenant-1',
        turnsCount: 0,
        sessionStartMs: Date.now(),
      });

      const decision1 = await router.decide(context1, normalBudget, lcg);
      const firstChoice = decision1.selectedProviderName;

      // Turn 6 (stickiness limit is 5 turns)
      const context2 = RoutingContext.create({
        inputText: 'Obrigado. E qual o horário do café da manhã?',
        sessionId: 'sess-sticky-break',
        tenantId: 'tenant-1',
        turnsCount: 6,
        sessionStartMs: Date.now(),
      });

      const decision2 = await router.decide(context2, normalBudget, lcg);
      expect(decision2.isStickinessApplied).toBe(false);
    });
  });
});
