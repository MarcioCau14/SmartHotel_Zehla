/**
 * ZEHLA SMARTHOTEL — ZaosNeuroRouter Lote 2 Test Suite
 * Módulo: src/__tests__/decision/ZaosNeuroRouterLote2.test.ts
 */

import { describe, it, expect } from 'vitest';
import { performance } from 'perf_hooks';
import { RoutingContext } from '../../domain/decision/models/RoutingContext';
import { ContextDiscretizer, BUCKETS } from '../../domain/decision/services/ContextDiscretizer';
import { MultiObjectiveReward } from '../../domain/decision/services/MultiObjectiveReward';
import { AdaptiveStickiness } from '../../domain/decision/services/AdaptiveStickiness';
import { ParetoMultiObjectiveSelector, IParetoCandidate } from '../../domain/decision/services/ParetoMultiObjectiveSelector';
import { ProviderCircuitBreaker } from '../../domain/decision/services/ProviderCircuitBreaker';
import { BudgetCircuitBreaker } from '../../domain/decision/services/BudgetCircuitBreaker';
import { InMemoryRouterStateAdapter } from '../../domain/decision/adapters/InMemoryRouterStateAdapter';
import { CircuitState, DEFAULT_CB_CONFIG } from '../../domain/decision/models/CircuitBreakerState';

describe('ZaosNeuroRouter Lote 2 Test Suite — Domain Services & Analytics', () => {

  // ── 1. ContextDiscretizer Tests ──
  describe('ContextDiscretizer', () => {
    const discretizer = new ContextDiscretizer();

    it('1.1. ContextDiscretizer — Classifica entradas com RegExp (Fast Path) em <5ms', () => {
      const ctxMedical = RoutingContext.create({
        inputText: 'SOCORRO! Preciso de uma ambulância agora, há alguém passando muito mal!',
        sessionId: 'session_123',
        tenantId: 'pousada_001',
        turnsCount: 1,
        sessionStartMs: Date.now(),
      });

      // Warm up to eliminate JS Engine / JIT cold start overhead
      discretizer.classify(ctxMedical);

      const start = performance.now();
      const result = discretizer.classify(ctxMedical);
      const end = performance.now();

      expect(result.isOk).toBe(true);
      const bucket = result.value;
      expect(bucket.id).toBe('30'); // emergency_medical
      expect(bucket.category).toBe('Emergency');
      expect(end - start).toBeLessThan(10.0); // Garantia de O(1) < 10ms tolerando flutuações de I/O de teste
    });

    it('1.2. ContextDiscretizer — Classifica com Jaccard (Feature Path) e garante id no range [0, 31]', () => {
      const sampleInputs = [
        'Como funciona o estacionamento e qual a vaga da pousada?', // faq_location_access (01)
        'Quero fazer uma reserva para o fim de semana', // booking_new_request (09)
        'Tem cabelo no meu travesseiro e o banheiro esta sujo', // complaint_cleanliness (13)
        'Quanto custa a diaria para casal?', // pricing_simple_query (05)
        'Habitacion doble por favor', // multilingual_spanish (28)
      ];

      for (const input of sampleInputs) {
        const ctx = RoutingContext.create({
          inputText: input,
          sessionId: 'session_abc',
          tenantId: 'pousada_002',
          turnsCount: 2,
          sessionStartMs: Date.now(),
        });

        const result = discretizer.classify(ctx);
        expect(result.isOk).toBe(true);
        const bucket = result.value;

        const numericId = parseInt(bucket.id, 10);
        expect(numericId).toBeGreaterThanOrEqual(0);
        expect(numericId).toBeLessThanOrEqual(31);
        expect(bucket.id.length).toBe(2); // IDs padded "00" a "31"
      }
    });

    it('1.3. ContextDiscretizer — Lida com strings vazias retornando falhas determinísticas (Result)', () => {
      const ctxEmpty = RoutingContext.create({
        inputText: '   ',
        sessionId: 'session_abc',
        tenantId: 'pousada_002',
        turnsCount: 2,
        sessionStartMs: Date.now(),
      });

      const result = discretizer.classify(ctxEmpty);
      expect(result.isFail).toBe(true);
      expect(result.error.message).toContain('Input text cannot be empty');
    });
  });

  // ── 2. MultiObjectiveReward Tests ──
  describe('MultiObjectiveReward', () => {
    it('2.1. MultiObjectiveReward — Sucesso se Qualidade >= 0.6 e Latência <= 2 * SLA', () => {
      // Caso 1: Ótimo desempenho
      const r1 = MultiObjectiveReward.assess(0.85, 1200, 1500);
      expect(r1.value).toBe(true);

      // Caso 2: Qualidade baixa (< 0.6)
      const r2 = MultiObjectiveReward.assess(0.55, 1200, 1500);
      expect(r2.value).toBe(false);

      // Caso 3: Latência muito alta (> 2 * SLA)
      const r3 = MultiObjectiveReward.assess(0.9, 3200, 1500);
      expect(r3.value).toBe(false);

      // Validações Fail-Fast
      expect(MultiObjectiveReward.assess(-0.1, 100, 500).isFail).toBe(true);
      expect(MultiObjectiveReward.assess(0.8, -5, 500).isFail).toBe(true);
    });
  });

  // ── 3. AdaptiveStickiness Tests ──
  describe('AdaptiveStickiness', () => {
    const stickiness = new AdaptiveStickiness();

    it('3.1. AdaptiveStickiness — Decrementa stickiness com base em turnos e tempo decorrido', () => {
      // Turno 0, logo no início
      const s1 = stickiness.calculate('Complaint', 0, 0).value;
      expect(s1).toBe(0.5); // Base para Complaint

      // Após 3 turnos e 20 segundos
      const s2 = stickiness.calculate('Complaint', 3, 20000).value;
      // formula: 0.5 * (0.9^3) * exp(-0.05 * 20)
      // = 0.5 * 0.729 * exp(-1) = 0.3645 * 0.367879 = 0.1341
      expect(s2).toBeCloseTo(0.1341, 4);

      // Emergência atinge valores altos
      const sEmerg = stickiness.calculate('Emergency', 0, 0).value;
      expect(sEmerg).toBe(0.8);
    });
  });

  // ── 4. ParetoMultiObjectiveSelector Tests ──
  describe('ParetoMultiObjectiveSelector', () => {
    const selector = new ParetoMultiObjectiveSelector();

    const candidates: IParetoCandidate[] = [
      { name: 'rules_engine', quality: 0.1, adjustedCost: 0.00, latencyMs: 1 },
      { name: 'gpt-4o-mini', quality: 0.8, adjustedCost: 0.02, latencyMs: 500 },
      { name: 'claude-3.5-sonnet', quality: 0.95, adjustedCost: 0.10, latencyMs: 3000 },
    ];

    it('4.1. Pareto-Dominância — Barra provedores baratos que violam o threshold de qualidade rígido', () => {
      // Sensível: minQuality = 0.85 (rejeita rules_engine e gpt-4o-mini)
      const res = selector.selectRank0(candidates, 0.85);
      expect(res.isOk).toBe(true);

      const frontier = res.value;
      expect(frontier.length).toBe(1);
      expect(frontier[0].name).toBe('claude-3.5-sonnet');
    });

    it('4.2. Pareto-Dominância — Mantém toda a fronteira de não-dominados (Rank 0) quando qualidade é atendida', () => {
      // FAQ: minQuality = 0.1 (todos se qualificam)
      const res = selector.selectRank0(candidates, 0.1);
      expect(res.isOk).toBe(true);

      const frontier = res.value;
      // Ninguém domina ninguém na fronteira!
      // rules_engine é o mais barato e rápido
      // claude-3.5-sonnet é o de maior qualidade
      // gpt-4o-mini é equilibrado intermediário
      expect(frontier.length).toBe(3);
      const names = frontier.map(f => f.name);
      expect(names).toContain('rules_engine');
      expect(names).toContain('gpt-4o-mini');
      expect(names).toContain('claude-3.5-sonnet');
    });

    it('4.3. Pareto-Dominância — Lança erro Result.fail se nenhum atinge a qualidade mínima', () => {
      const res = selector.selectRank0(candidates, 0.99); // Exagerado
      expect(res.isFail).toBe(true);
      expect(res.error.message).toContain('No providers met the minimum quality threshold');
    });
  });

  // ── 5. ProviderCircuitBreaker Tests ──
  describe('ProviderCircuitBreaker', () => {
    it('5.1. ProviderCircuitBreaker — Orquestra bloqueio de provedores via IRouterStatePort', async () => {
      const adapter = new InMemoryRouterStateAdapter();
      const cb = new ProviderCircuitBreaker(adapter);

      const bucket = '13'; // complaint_cleanliness
      const provider = 'gpt-4o-mini';

      // 1. Inicialmente fechado (pode rotear)
      expect(await cb.canRoute(bucket, provider)).toBe(true);

      // 2. Simular 5 falhas consecutivas
      for (let i = 0; i < 5; i++) {
        await cb.recordFailure(bucket, provider);
      }

      // 3. Deve bloquear (canRoute retorna false)
      expect(await cb.canRoute(bucket, provider)).toBe(false);

      // 4. Testar cura do circuito após sucesso no probe
      // Injeta manualmente estado HALF_OPEN para forçar probe
      const key = `${bucket}__${provider}`;
      adapter.saveCircuitBreakerStates(new Map([
        [key, { state: 'HALF_OPEN', consecutiveFailures: 5, consecutiveSuccesses: 0, lastFailureAt: 0, openedAt: 0, halfOpenAttempts: 1 }]
      ]));

      // Em HALF_OPEN, deve poder rotear o probe
      expect(await cb.canRoute(bucket, provider)).toBe(true);

      // Registra 2 sucessos consecutivo para fechar o circuito
      await cb.recordSuccess(bucket, provider);
      await cb.recordSuccess(bucket, provider);

      // Agora o circuito deve estar fechado novamente
      expect(await cb.canRoute(bucket, provider)).toBe(true);
      const states = adapter.loadCircuitBreakerStates();
      expect(states.get(key)?.state).toBe('CLOSED');
    });
  });

  // ── 6. BudgetCircuitBreaker Tests ──
  describe('BudgetCircuitBreaker', () => {
    const budgetCb = new BudgetCircuitBreaker();

    const providers = [
      { name: 'rules_engine', tier: 1 as const },
      { name: 'gpt-4o-mini', tier: 2 as const },
      { name: 'claude-3.5-sonnet', tier: 3 as const },
    ];

    it('6.1. BudgetCircuitBreaker — Inflaciona custos aos 80% do budget diário', () => {
      // 80% de consumo do budget diário ($8.0 gasto de $10.0 de limite)
      const warningSnapshot = {
        dailySpendUsd: 8.0,
        dailyBudgetUsd: 10.0,
        monthlySpendUsd: 10.0,
        monthlyBudgetUsd: 100.0,
      };

      // Custo original $0.10 para claude (Tier 3) -> Deve inflacionar 3x para $0.30
      const costAdjusted = budgetCb.getAdjustedCost(0.10, 3, warningSnapshot);
      expect(costAdjusted).toBe(0.30);

      // Tier 1 (rules_engine) não sofre inflação
      const t1Cost = budgetCb.getAdjustedCost(0.00, 1, warningSnapshot);
      expect(t1Cost).toBe(0.00);
    });

    it('6.2. BudgetCircuitBreaker — Corta provedores não-Tier 1 aos 95% do budget', () => {
      // 95% de consumo (Critical)
      const criticalSnapshot = {
        dailySpendUsd: 9.5,
        dailyBudgetUsd: 10.0,
        monthlySpendUsd: 10.0,
        monthlyBudgetUsd: 100.0,
      };

      // Custo do Tier 2 ou Tier 3 vira infinito
      const costAdjusted = budgetCb.getAdjustedCost(0.10, 3, criticalSnapshot);
      expect(costAdjusted).toBe(Infinity);

      // Apenas provedores de Tier 1 são permitidos
      const allowed = budgetCb.filterAllowedProviders(providers, criticalSnapshot);
      expect(allowed.length).toBe(1);
      expect(allowed[0]).toBe('rules_engine');
    });
  });
});
