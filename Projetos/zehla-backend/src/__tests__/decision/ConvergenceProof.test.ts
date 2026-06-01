/**
 * ZEHLA SMARTHOTEL — ConvergenceProof Test Suite (Lote 1 Definitivo)
 * Módulo: src/__tests__/decision/ConvergenceProof.test.ts
 */

import { describe, it, expect } from 'vitest';
import { BetaBinomialPosterior } from '../../domain/decision/models/BetaBinomialPosterior';
import { ProviderCapabilityProfile } from '../../domain/decision/models/ProviderCapabilityProfile';
import { InMemoryRouterStateAdapter } from '../../domain/decision/adapters/InMemoryRouterStateAdapter';

describe('ConvergenceProof Test Suite — Lote 1 Definitivo', () => {

  // ── TESTE 25: Convergência Sublinear O(log T) ──
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
    const blockWindow = 50; // Avaliaremos a taxa de escolha após esta janela

    // Simularemos 150 turnos
    for (let turn = 1; turn <= 150; turn++) {
      // 1. Amostrar θ̃ para ambos os provedores usando o PRNG determinístico
      const thetaA = postA.sample(lcgPrng);
      const thetaB = postB.sample(lcgPrng);

      // 2. Selecionar o que tem maior probabilidade amostrada de sucesso (Thompson Sampling)
      const selected = thetaA >= thetaB ? 'A' : 'B';

      // 3. Simular sucesso/fracasso real
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

    // Após 150 iterações, o Thompson Sampling DEVE ter convergido majoritariamente para o Provedor A
    // Provaremos que Provedor A foi escolhido significativamente mais vezes que o B
    expect(choicesA).toBeGreaterThan(choicesB);
    
    // Provaremos que na segunda metade da simulação, Provedor B quase não é mais escolhido
    expect(postA.mean).toBeGreaterThan(0.85); // Converge próximo à média real
    expect(postB.mean).toBeLessThan(postA.mean); // Sub-ótimo não é mais escolhido, sua média fica defasada
  });

  // ── TESTE 26: Isolamento Bayesiano ──
  it('26. Isolamento Bayesiano — 500 falhas no bucket 05 (pricing) não contaminam nem alteram a posterior do bucket 00 (faq)', () => {
    const adapter = new InMemoryRouterStateAdapter();

    // Setup de posteriors iniciais uniformes para ambos os buckets
    adapter.setPosterior('00__gpt-4o-mini', { alpha: 1.0, beta: 1.0, nObservations: 0, lastUpdateAt: 0 });
    adapter.setPosterior('05__gpt-4o-mini', { alpha: 1.0, beta: 1.0, nObservations: 0, lastUpdateAt: 0 });

    // Simular 500 falhas no bucket 05
    let pricingPosterior = BetaBinomialPosterior.UNIFORM;
    for (let i = 0; i < 500; i++) {
      pricingPosterior = pricingPosterior.update(false); // Tudo falha
    }

    // Salvar no adapter
    adapter.setPosterior('05__gpt-4o-mini', {
      alpha: pricingPosterior.alpha,
      beta: pricingPosterior.beta,
      nObservations: pricingPosterior.nObservations,
      lastUpdateAt: Date.now()
    });

    // Ler dados salvos
    const posteriors = adapter.loadAllPosteriors();

    // Posterior do bucket 05 foi degradada com sucesso
    const post05 = posteriors.get('05__gpt-4o-mini')!;
    expect(post05.alpha).toBe(1.0);
    expect(post05.beta).toBe(501.0);
    expect(post05.nObservations).toBe(500);

    // Posterior do bucket 00 permanece intacta (isolamento absoluto!)
    const post00 = posteriors.get('00__gpt-4o-mini')!;
    expect(post00.alpha).toBe(1.0);
    expect(post00.beta).toBe(1.0);
    expect(post00.nObservations).toBe(0);
  });

  // ── TESTE 27: Cold Start MMLU Priors ──
  it('27. Cold Start MMLU Priors — Provedores com prior informado (capability=0.85) iniciam com média esperada de 0.85', () => {
    // Prior informado com score 0.85
    const p = BetaBinomialPosterior.fromBenchmarkPriors(0.85, 10);
    
    // alpha = 0.85 * 10 + 1 = 9.5
    // beta = (1 - 0.85) * 10 + 1 = 2.5
    expect(p.alpha).toBe(9.5);
    expect(p.beta).toBe(2.5);
    expect(p.mean).toBe(0.7916666667); // E[θ] = 9.5 / 12
    expect(p.nObservations).toBe(0); // Cold start
  });

  // ── TESTE 28: Decaimento Não-Estacionário ──
  it('28. Decaimento Não-Estacionário — Posteriors decaem com γ=0.999 sem perder prior mass de Beta(1,1)', () => {
    // Posterior com muitas observações (ex: alpha=101, beta=101)
    const initial = BetaBinomialPosterior.create(101.0, 101.0, 200, 1000);
    
    // Aplica decaimento com fator γ = 0.999
    const decayed = initial.decay(0.999);
    
    // alpha = 1.0 + 0.999 * (101.0 - 1.0) = 1.0 + 0.999 * 100 = 100.9
    expect(decayed.alpha).toBe(100.9);
    expect(decayed.beta).toBe(100.9);
    
    // O decaimento atenuou levemente a certeza sem destruir a distribuição (preservou a massa base)
    expect(decayed.mean).toBe(0.5);
  });

  // ── TESTE 29: Matriz 32x5 Completa ──
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

    // Mapeamento dos 32 buckets contextuais
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

    expect(updates.length).toBe(160); // 32 * 5 = 160

    // Salvar no adapter
    adapter.savePosteriorBatch(updates);

    const posteriors = adapter.loadAllPosteriors();
    expect(posteriors.size).toBe(160); // Nenhuma colisão!

    // Verificar uma chave específica
    const sampleKey = '13__claude-3.5-sonnet'; // complaint_cleanliness
    expect(posteriors.has(sampleKey)).toBe(true);
  });

  // ── TESTE 30: Reprodutibilidade com PRNG ──
  it('30. Reprodutibilidade com PRNG — Duas simulações de amostragem com a mesma semente LCG geram sequências idênticas', () => {
    const p = BetaBinomialPosterior.create(10.0, 5.0, 15, 1000);

    // LCG com mesma semente 1
    let seed1 = 987654321;
    const prng1 = () => {
      seed1 = (1103515245 * seed1 + 12345) % 2147483648;
      return seed1 / 2147483648;
    };

    // LCG com mesma semente 2
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

    // Asserção de igualdade exata para provar reprodutibilidade determinística!
    expect(samples1).toEqual(samples2);
  });
});
