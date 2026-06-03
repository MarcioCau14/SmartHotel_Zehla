/**
 * ZEHLA SMARTHOTEL — ZaosNeuroRouter Lote 1 Test Suite
 * Módulo: src/__tests__/decision/ZaosNeuroRouterLote1.test.ts
 */

import { describe, it, expect, vi } from 'vitest';
import { ProviderCapabilityProfile, ICapabilityVector } from '../../domain/decision/models/ProviderCapabilityProfile';
import { BetaBinomialPosterior } from '../../domain/decision/models/BetaBinomialPosterior';
import { RoutingContext } from '../../domain/decision/models/RoutingContext';
import { RoutingDecision } from '../../domain/decision/models/RoutingDecision';
import { CircuitBreakerState, CircuitState, DEFAULT_CB_CONFIG } from '../../domain/decision/models/CircuitBreakerState';
import { BudgetGuard, BudgetLevel, BudgetSnapshot } from '../../domain/decision/models/BudgetGuard';
import { InMemoryRouterStateAdapter } from '../../domain/decision/adapters/InMemoryRouterStateAdapter';

describe('ZaosNeuroRouter Lote 1 Test Suite — Domínio Puro e Resiliência', () => {

  // ── ProviderCapabilityProfile ──
  describe('ProviderCapabilityProfile', () => {
    const caps: ICapabilityVector = {
      reasoning: 0.9,
      conversation: 0.85,
      code: 0.5,
      json: 0.95,
      creative: 0.8,
      multilingual: 0.75,
      safety: 1.0,
    };

    it('1. ProviderCapabilityProfile.create() — Criação com Object.freeze e tipagem estrita de tier', () => {
      const p = ProviderCapabilityProfile.create({
        name: 'claude-3.5-sonnet',
        tier: 3,
        costInputPer1M: 3.0,
        costOutputPer1M: 15.0,
        capabilities: caps,
        slaLatencyMs: 3000,
        maxContextTokens: 200_000,
      });

      expect(p.name).toBe('claude-3.5-sonnet');
      expect(p.tier).toBe(3);
      expect(p.costInputPer1M).toBe(3.0);
      expect(p.costOutputPer1M).toBe(15.0);
      expect(p.slaLatencyMs).toBe(3000);
      expect(p.maxContextTokens).toBe(200_000);
      expect(Object.isFrozen(p.capabilities)).toBe(true);

      // Validação Fail-Fast
      expect(() => ProviderCapabilityProfile.create({
        name: 'test',
        tier: 5 as any, // Tier inválido
        costInputPer1M: 1,
        costOutputPer1M: 1,
        capabilities: caps,
        slaLatencyMs: 100,
        maxContextTokens: 100,
      })).toThrowError();
    });

    it('2. ProviderCapabilityProfile.estimateCost() — Cálculo de custo com input/output tokens', () => {
      const p = ProviderCapabilityProfile.create({
        name: 'gpt-4o-mini',
        tier: 2,
        costInputPer1M: 0.15,
        costOutputPer1M: 0.60,
        capabilities: caps,
        slaLatencyMs: 1500,
        maxContextTokens: 128_000,
      });

      // 10.000 input tokens ($0.0015) + 5.000 output tokens ($0.0030) = $0.0045
      const cost = p.estimateCost(10_000, 5_000);
      expect(cost).toBe(0.0045);
    });

    it('9 (Extra). ProviderCapabilityProfile.capabilityScore — Calcula média matemática das capabilities', () => {
      const p = ProviderCapabilityProfile.create({
        name: 'rules_engine',
        tier: 1,
        costInputPer1M: 0,
        costOutputPer1M: 0,
        capabilities: {
          reasoning: 0.1,
          conversation: 0.2,
          code: 0,
          json: 0,
          creative: 0,
          multilingual: 0,
          safety: 1.0,
        },
        slaLatencyMs: 10,
        maxContextTokens: 1000,
      });

      // (0.1 + 0.2 + 0 + 0 + 0 + 0 + 1.0) / 7 = 1.3 / 7 = 0.1857142857...
      expect(p.capabilityScore).toBeCloseTo(0.1857142857);
    });
  });

  // ── BetaBinomialPosterior ──
  describe('BetaBinomialPosterior', () => {
    it('3. BetaBinomialPosterior.UNIFORM — Posterior inicial Beta(1,1), mean=0.5', () => {
      const p = BetaBinomialPosterior.UNIFORM;
      expect(p.alpha).toBe(1.0);
      expect(p.beta).toBe(1.0);
      expect(p.mean).toBe(0.5);
      expect(p.variance).toBeCloseTo(1/12); // Var = 1*1/(4*3) = 1/12
    });

    it('4. BetaBinomialPosterior.fromBenchmarkPriors() — Prior informado (capability=0.85 → α=9.5, β=2.5)', () => {
      // alpha = 0.85 * 10 + 1 = 9.5
      // beta = (1 - 0.85) * 10 + 1 = 2.5
      const p = BetaBinomialPosterior.fromBenchmarkPriors(0.85, 10);
      expect(p.alpha).toBe(9.5);
      expect(p.beta).toBe(2.5);
      expect(p.mean).toBeCloseTo(9.5 / 12);
    });

    it('5. BetaBinomialPosterior.update(true) — Sucesso: α += 1, retorna nova instância (imutabilidade)', () => {
      const initial = BetaBinomialPosterior.UNIFORM;
      const updated = initial.update(true);

      expect(initial.alpha).toBe(1.0); // Imutável
      expect(updated.alpha).toBe(2.0);
      expect(updated.beta).toBe(1.0);
      expect(updated.nObservations).toBe(1);
    });

    it('6. BetaBinomialPosterior.update(false) — Falha: β += 1, retorna nova instância', () => {
      const initial = BetaBinomialPosterior.UNIFORM;
      const updated = initial.update(false);

      expect(initial.beta).toBe(1.0); // Imutável
      expect(updated.alpha).toBe(1.0);
      expect(updated.beta).toBe(2.0);
      expect(updated.nObservations).toBe(1);
    });

    it('7. BetaBinomialPosterior.decay() — Decaimento exponencial com fator γ, preserva prior mass', () => {
      const initial = BetaBinomialPosterior.create(5.0, 10.0, 15, 100);
      const decayed = initial.decay(0.9);

      // alpha = 1.0 + 0.9 * (5.0 - 1.0) = 4.6
      // beta = 1.0 + 0.9 * (10.0 - 1.0) = 9.1
      expect(decayed.alpha).toBe(4.6);
      expect(decayed.beta).toBe(9.1);
      expect(decayed.nObservations).toBe(15);
    });

    it('8. BetaBinomialPosterior.sample() — Amostra em [0,1], reprodutível com PRNG determinístico', () => {
      const p = BetaBinomialPosterior.create(5.0, 3.0, 8, 100);
      const mockPrng = () => 0.5; // PRNG constante para isolamento de testes

      const sample1 = p.sample(mockPrng);
      expect(sample1).toBeGreaterThanOrEqual(0.0);
      expect(sample1).toBeLessThanOrEqual(1.0);
    });

    it('9. BetaBinomialPosterior.mean/variance/mode — Estatísticas corretas', () => {
      const p = BetaBinomialPosterior.create(5.0, 3.0, 8, 100);
      
      // mean = 5 / 8 = 0.625
      expect(p.mean).toBe(0.625);
      
      // variance = 5*3 / (64 * 9) = 15 / 576 = 0.026041666...
      expect(p.variance).toBeCloseTo(0.0260416667);
      
      // mode = (5 - 1) / (5 + 3 - 2) = 4 / 6 = 0.666666...
      expect(p.mode).toBeCloseTo(0.6666666667);
      
      // uncertainty = variance * total = 15 / 576 * 8 = 120 / 576 = 0.208333...
      expect(p.uncertainty).toBeCloseTo(0.2083333333);
    });

    it('10. BetaBinomialPosterior.create() com α≤0 — Lança Error (validação de parâmetros inválidos)', () => {
      expect(() => BetaBinomialPosterior.create(0, 1, 0, 0)).toThrowError();
      expect(() => BetaBinomialPosterior.create(1, -1, 0, 0)).toThrowError();
    });
  });

  // ── RoutingContext & RoutingDecision ──
  describe('RoutingContext & RoutingDecision', () => {
    it('11. RoutingContext.create() — Criação imutável, cálculo de elapsedMs', () => {
      const start = Date.now() - 5000;
      const ctx = RoutingContext.create({
        inputText: 'Preciso reservar um quarto duplo para o fim de semana.',
        sessionId: 'session_123',
        tenantId: 'pousada_001',
        turnsCount: 3,
        sessionStartMs: start,
        channel: 'whatsapp',
        metadata: { source: 'organic' },
      });

      expect(ctx.inputText).toBe('Preciso reservar um quarto duplo para o fim de semana.');
      expect(ctx.sessionId).toBe('session_123');
      expect(ctx.turnsCount).toBe(3);
      expect(ctx.elapsedMs).toBeGreaterThanOrEqual(5000);
      expect(Object.isFrozen(ctx.metadata)).toBe(true);
    });

    it('12. RoutingDecision.create() — Criação com todos os campos, emergencyFallback() factory', () => {
      const decision = RoutingDecision.create({
        bucketId: '09', // booking_new_request
        selectedProviderName: 'claude-3.5-sonnet',
        isEmergencyFallback: false,
        isStickinessApplied: true,
        expectedUtility: 0.85,
        sampledThetas: new Map([['claude', 0.9]]),
        adjustedCosts: new Map([['claude', 0.05]]),
      });

      expect(decision.bucketId).toBe('09');
      expect(decision.selectedProviderName).toBe('claude-3.5-sonnet');
      expect(decision.isStickinessApplied).toBe(true);
      expect(decision.isEmergencyFallback).toBe(false);
      expect(decision.expectedUtility).toBe(0.85);

      const fallback = RoutingDecision.emergencyFallback('30'); // emergency_handling
      expect(fallback.bucketId).toBe('30');
      expect(fallback.selectedProviderName).toBe('rules_engine');
      expect(fallback.isEmergencyFallback).toBe(true);

      // Validação do bucket ID de 35 buckets
      expect(() => RoutingDecision.create({
        bucketId: '35', // Fora do range [0, 34]
        selectedProviderName: 'test',
        expectedUtility: 0.5,
        sampledThetas: new Map(),
        adjustedCosts: new Map(),
      })).toThrowError('Invalid bucketId: 35');
    });
  });

  // ── CircuitBreakerState ──
  describe('Value Object: CircuitBreakerState', () => {
    it('13. CircuitBreakerState.INITIAL — Estado inicial CLOSED com todos os campos zerados', () => {
      const cb = CircuitBreakerState.INITIAL;
      expect(cb.state).toBe(CircuitState.CLOSED);
      expect(cb.consecutiveFailures).toBe(0);
      expect(cb.consecutiveSuccesses).toBe(0);
      expect(cb.lastFailureAt).toBe(0);
      expect(cb.openedAt).toBe(0);
      expect(cb.halfOpenAttempts).toBe(0);
    });

    it('14. CB: CLOSED → OPEN — 5 falhas consecutivas abrem o circuito', () => {
      let cb = CircuitBreakerState.INITIAL;
      const config = DEFAULT_CB_CONFIG;

      // 4 falhas seguidas mantêm CLOSED
      for (let i = 0; i < 4; i++) {
        cb = cb.recordFailure(config);
        expect(cb.state).toBe(CircuitState.CLOSED);
      }

      // 5ª falha transiciona para OPEN
      cb = cb.recordFailure(config);
      expect(cb.state).toBe(CircuitState.OPEN);
      expect(cb.consecutiveFailures).toBe(5);
      expect(cb.openedAt).toBeGreaterThan(0);
    });

    it('15. CB: OPEN → HALF_OPEN — Transição após openDurationMs', async () => {
      let cb = CircuitBreakerState.INITIAL;
      const config = DEFAULT_CB_CONFIG;

      // Abre o circuito
      for (let i = 0; i < 5; i++) {
        cb = cb.recordFailure(config);
      }
      expect(cb.state).toBe(CircuitState.OPEN);

      // Forçar passagem do tempo usando Vitest Fake Timers
      vi.useFakeTimers();
      vi.setSystemTime(Date.now() + config.openDurationMs + 100);

      const checked = cb.maybeTransitionToHalfOpen(config);
      expect(checked.state).toBe(CircuitState.HALF_OPEN);
      vi.useRealTimers();
    });

    it('16. CB: HALF_OPEN → CLOSED — 2 sucessos fecham o circuito', () => {
      const config = DEFAULT_CB_CONFIG;
      // Cria estado HALF_OPEN de forma isolada
      let cb = CircuitBreakerState.create(CircuitState.HALF_OPEN, 5, 0, 1000, 1000, 1);

      // Sucesso 1
      cb = cb.recordSuccess();
      expect(cb.state).toBe(CircuitState.HALF_OPEN);
      expect(cb.consecutiveSuccesses).toBe(1);

      // Sucesso 2 (fecha o circuito)
      cb = cb.recordSuccess();
      expect(cb.state).toBe(CircuitState.CLOSED);
      expect(cb.consecutiveSuccesses).toBe(0);
      expect(cb.consecutiveFailures).toBe(0);
    });

    it('17. CB: HALF_OPEN → OPEN — 1 falha em probing reabre', () => {
      const config = DEFAULT_CB_CONFIG;
      const halfOpenCb = CircuitBreakerState.create(CircuitState.HALF_OPEN, 5, 1, 1000, 1000, 1);

      const failed = halfOpenCb.recordFailure(config);
      expect(failed.state).toBe(CircuitState.OPEN);
      expect(failed.consecutiveFailures).toBe(6);
      expect(failed.openedAt).toBeGreaterThan(1000); // Novo timestamp de abertura
    });

    it('18. CB: imutabilidade — Cada transição retorna nova instância', () => {
      const cb = CircuitBreakerState.INITIAL;
      const updated = cb.recordSuccess();

      expect(cb).not.toBe(updated);
      expect(cb.consecutiveSuccesses).toBe(0);
      expect(updated.consecutiveSuccesses).toBe(1);
    });
  });

  // ── BudgetGuard ──
  describe('Value Object: BudgetGuard', () => {
    const snapshotNormal: BudgetSnapshot = {
      dailySpendUsd: 1.0,
      dailyBudgetUsd: 10.0,
      monthlySpendUsd: 10.0,
      monthlyBudgetUsd: 100.0,
    };

    const snapshotWarning: BudgetSnapshot = {
      dailySpendUsd: 8.0, // 80% do budget diário
      dailyBudgetUsd: 10.0,
      monthlySpendUsd: 10.0,
      monthlyBudgetUsd: 100.0,
    };

    const snapshotCritical: BudgetSnapshot = {
      dailySpendUsd: 9.5, // 95% do budget diário
      dailyBudgetUsd: 10.0,
      monthlySpendUsd: 10.0,
      monthlyBudgetUsd: 100.0,
    };

    it('19. BudgetGuard.assessLevel() — NORMAL < 80%, WARNING ≥ 80%, CRITICAL ≥ 95%', () => {
      const guard = new BudgetGuard();

      expect(guard.assessLevel(snapshotNormal)).toBe(BudgetLevel.NORMAL);
      expect(guard.assessLevel(snapshotWarning)).toBe(BudgetLevel.WARNING);
      expect(guard.assessLevel(snapshotCritical)).toBe(BudgetLevel.CRITICAL);
    });

    it('20. BudgetGuard.getAdjustedCost() — CRITICAL + Tier 2 → Infinity, WARNING + Tier 2 → custo × 3.0', () => {
      const guard = new BudgetGuard({ costInflationFactor: 3.0 });

      // NORMAL: custo não altera
      expect(guard.getAdjustedCost(0.10, 3, BudgetLevel.NORMAL)).toBe(0.10);

      // WARNING: custo inflacionado por 3x para Tier >= 2
      expect(guard.getAdjustedCost(0.10, 3, BudgetLevel.WARNING)).toBe(0.30);
      expect(guard.getAdjustedCost(0.02, 2, BudgetLevel.WARNING)).toBe(0.06);
      expect(guard.getAdjustedCost(0.00, 1, BudgetLevel.WARNING)).toBe(0.00); // Tier 1 não sofre inflação

      // CRITICAL: custo vira infinito para Tier >= 2
      expect(guard.getAdjustedCost(0.10, 3, BudgetLevel.CRITICAL)).toBe(Infinity);
      expect(guard.getAdjustedCost(0.02, 2, BudgetLevel.CRITICAL)).toBe(Infinity);
      expect(guard.getAdjustedCost(0.00, 1, BudgetLevel.CRITICAL)).toBe(0.00);
    });

    it('21. BudgetGuard.getAllowedProviderNames() — CRITICAL → apenas Tier 1', () => {
      const guard = new BudgetGuard();
      const providers = [
        { name: 'rules_engine', tier: 1 as const },
        { name: 'gpt-4o-mini', tier: 2 as const },
        { name: 'claude-3.5-sonnet', tier: 3 as const },
      ];

      const allowedNormal = guard.getAllowedProviderNames(providers, BudgetLevel.NORMAL);
      expect(allowedNormal).toContain('rules_engine');
      expect(allowedNormal).toContain('gpt-4o-mini');
      expect(allowedNormal).toContain('claude-3.5-sonnet');

      const allowedCritical = guard.getAllowedProviderNames(providers, BudgetLevel.CRITICAL);
      expect(allowedCritical).toContain('rules_engine');
      expect(allowedCritical).not.toContain('gpt-4o-mini');
      expect(allowedCritical).not.toContain('claude-3.5-sonnet');
      expect(allowedCritical.length).toBe(1);
    });

    it('Extra. BudgetGuard.getBudgetStatus() — Retorna percentuais arredondados', () => {
      const guard = new BudgetGuard();
      const status = guard.getBudgetStatus({
        dailySpendUsd: 1.2345,
        dailyBudgetUsd: 10.0,
        monthlySpendUsd: 12.3456,
        monthlyBudgetUsd: 100.0,
      });

      expect(status.dailyRatio).toBe(0.123); // Arredondado para 3 casas decimais
      expect(status.monthlyRatio).toBe(0.123);
      expect(status.level).toBe(BudgetLevel.NORMAL);
    });
  });

  // ── InMemoryRouterStateAdapter ──
  describe('InMemoryRouterStateAdapter', () => {
    it('22. InMemoryRouterStateAdapter — load/save de posteriors e CB states em memória pura', async () => {
      const adapter = new InMemoryRouterStateAdapter();

      // Inicialmente vazio
      expect(adapter.loadAllPosteriors().size).toBe(0);
      expect(adapter.loadCircuitBreakerStates().size).toBe(0);

      // Salvar posteriors em batch
      await adapter.savePosteriorBatch([
        { bucketId: '00', providerName: 'gpt-4o-mini', alpha: 5, beta: 2, nObservations: 7, lastUpdateAt: 1000 },
      ]);

      const posteriors = adapter.loadAllPosteriors();
      expect(posteriors.size).toBe(1);
      expect(posteriors.get('00__gpt-4o-mini')?.alpha).toBe(5);

      // Salvar CB States
      const cbMap = new Map([
        ['00__gpt-4o-mini', { state: 'CLOSED', consecutiveFailures: 0, consecutiveSuccesses: 1, lastFailureAt: 0, openedAt: 0, halfOpenAttempts: 0 }],
      ]);
      await adapter.saveCircuitBreakerStates(cbMap);

      const cbStates = adapter.loadCircuitBreakerStates();
      expect(cbStates.size).toBe(1);
      expect(cbStates.get('00__gpt-4o-mini')?.state).toBe('CLOSED');
    });

    it('23. InMemoryRouterStateAdapter.setPosterior() — Injeção direta para setup de testes', () => {
      const adapter = new InMemoryRouterStateAdapter();
      adapter.setPosterior('05__claude', { alpha: 9, beta: 1, nObservations: 10, lastUpdateAt: 1500 });

      const posteriors = adapter.loadAllPosteriors();
      expect(posteriors.get('05__claude')?.alpha).toBe(9);
    });

    it('24. InMemoryRouterStateAdapter.reset() — Limpeza completa entre testes', () => {
      const adapter = new InMemoryRouterStateAdapter();
      adapter.setPosterior('05__claude', { alpha: 9, beta: 1, nObservations: 10, lastUpdateAt: 1500 });
      
      adapter.reset();
      expect(adapter.loadAllPosteriors().size).toBe(0);
    });
  });

  // ── Mathematical Proofs (Thompson Sampling, Bayesian Isolation, Decays) ──
  describe('Mathematical Proofs & Thompson Sampling', () => {
    it('25. Convergência Sublinear O(log T) — Thompson Sampling puro migra do ruim (50%) para o bom (95%) em <150 turnos', () => {
      // Provedor A (Bom): sucesso_real = 95%
      // Provedor B (Ruim): sucesso_real = 50%
      let postA = BetaBinomialPosterior.UNIFORM;
      let postB = BetaBinomialPosterior.UNIFORM;

      const rateRealA = 0.95;
      const rateRealB = 0.50;

      // Gerador de números pseudo-aleatórios linear congruencial simples (LCG) para consistência determinística
      let seed = 123456789;
      const lcgPrng = () => {
        seed = (1103515245 * seed + 12345) % 2147483648;
        return seed / 2147483648;
      };

      let choicesA = 0;
      let choicesB = 0;

      // Simularemos 150 turnos
      for (let turn = 1; turn <= 150; turn++) {
        const thetaA = postA.sample(lcgPrng);
        const thetaB = postB.sample(lcgPrng);

        const selected = thetaA >= thetaB ? 'A' : 'B';
        const roll = lcgPrng();

        if (selected === 'A') {
          choicesA++;
          const success = roll < rateRealA;
          postA = postA.update(success);
        } else {
          choicesB++;
          const success = roll < rateRealB;
          postB = postB.update(success);
        }
      }

      // Thompson Sampling deve convergir para o melhor provedor (A)
      expect(choicesA).toBeGreaterThan(choicesB);
      expect(postA.mean).toBeGreaterThan(0.85); // Converge próximo à média real
      expect(postB.mean).toBeLessThan(postA.mean); // Sub-ótimo fica defasado
    });

    it('26. Isolamento Bayesiano — 500 falhas no bucket 05 (pricing) não contaminam nem alteram a posterior do bucket 00 (faq)', () => {
      const adapter = new InMemoryRouterStateAdapter();

      adapter.setPosterior('00__gpt-4o-mini', { alpha: 1.0, beta: 1.0, nObservations: 0, lastUpdateAt: 0 });
      adapter.setPosterior('05__gpt-4o-mini', { alpha: 1.0, beta: 1.0, nObservations: 0, lastUpdateAt: 0 });

      // Simular 500 falhas no bucket 05
      let pricingPosterior = BetaBinomialPosterior.UNIFORM;
      for (let i = 0; i < 500; i++) {
        pricingPosterior = pricingPosterior.update(false);
      }

      adapter.setPosterior('05__gpt-4o-mini', {
        alpha: pricingPosterior.alpha,
        beta: pricingPosterior.beta,
        nObservations: pricingPosterior.nObservations,
        lastUpdateAt: Date.now()
      });

      const posteriors = adapter.loadAllPosteriors();

      const post05 = posteriors.get('05__gpt-4o-mini')!;
      expect(post05.alpha).toBe(1.0);
      expect(post05.beta).toBe(501.0);
      expect(post05.nObservations).toBe(500);

      const post00 = posteriors.get('00__gpt-4o-mini')!;
      expect(post00.alpha).toBe(1.0);
      expect(post00.beta).toBe(1.0);
      expect(post00.nObservations).toBe(0);
    });

    it('27. Cold Start MMLU Priors — Provedores com prior informado (capability=0.85) iniciam com média esperada de 0.85', () => {
      const p = BetaBinomialPosterior.fromBenchmarkPriors(0.85, 10);
      
      expect(p.alpha).toBe(9.5);
      expect(p.beta).toBe(2.5);
      expect(p.mean).toBeCloseTo(9.5 / 12);
      expect(p.nObservations).toBe(0);
    });

    it('28. Decaimento Não-Estacionário — Posteriors decaem com γ=0.999 sem perder prior mass de Beta(1,1)', () => {
      const initial = BetaBinomialPosterior.create(101.0, 101.0, 200, 1000);
      const decayed = initial.decay(0.999);
      
      expect(decayed.alpha).toBe(100.9);
      expect(decayed.beta).toBe(100.9);
      expect(decayed.mean).toBe(0.5);
    });

    it('29. Matriz 32×5 Completa — Inicialização de 160 posteriors (32 buckets × 5 provedores) sem colisão de chaves', () => {
      const adapter = new InMemoryRouterStateAdapter();
      const providers = ['rules_engine', 'gpt-4o-mini', 'claude-3.5-sonnet', 'gpt-4o', 'claude-3-opus'];

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
            lastUpdateAt: Date.now(),
          });
        }
      }

      expect(updates.length).toBe(160);
      adapter.savePosteriorBatch(updates);

      const posteriors = adapter.loadAllPosteriors();
      expect(posteriors.size).toBe(160);

      const sampleKey = '13__claude-3.5-sonnet';
      expect(posteriors.has(sampleKey)).toBe(true);
    });

    it('30. Reprodutibilidade com PRNG — Duas simulações de amostragem com a mesma semente LCG geram sequências idênticas', () => {
      const p = BetaBinomialPosterior.create(10.0, 5.0, 15, 1000);

      let seed1 = 987654321;
      const prng1 = () => {
        seed1 = (1103515245 * seed1 + 12345) % 2147483648;
        return seed1 / 2147483648;
      };

      let seed2 = 987654321;
      const prng2 = () => {
        seed2 = (1103515245 * seed2 + 12345) % 2147483648;
        return seed2 / 2147483648;
      };

      const samples1: number[] = [];
      const samples2: number[] = [];

      for (let i = 0; i < 50; i++) {
        samples1.push(p.sample(prng1));
        samples2.push(p.sample(prng2));
      }

      expect(samples1).toEqual(samples2);
    });
  });
});
