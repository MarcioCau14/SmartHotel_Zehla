/**
 * ZEHLA SMARTHOTEL — ZaosNeuroRouter Lote 5 Test Suite
 * Módulo: src/__tests__/decision/ZaosNeuroRouterLote5.test.ts
 */

import { describe, it, expect } from 'vitest';
import { QualityProxy } from '../../domain/decision/services/QualityProxy';
import { HierarchicalTransfer } from '../../domain/decision/services/HierarchicalTransfer';
import { BetaBinomialPosterior } from '../../domain/decision/models/BetaBinomialPosterior';

describe('ZaosNeuroRouter Lote 5 Test Suite — Sinais Heurísticos & Compartilhamento Bayesiano', () => {

  // ──────────────────────────────────────────────────────────────────────────
  // 1. Testes de Sinais Heurísticos do QualityProxy
  // ──────────────────────────────────────────────────────────────────────────

  describe('1. QualityProxy Heuristics (<1ms)', () => {
    const proxy = new QualityProxy();

    it('1.1. Schema Signal — Valida se JSON transacional é analisado corretamente', () => {
      // Bucket 09 (booking_new_request) é transacional e exige JSON
      const invalidJson = 'Olá! Gostaria de reservar o quarto de casal para amanhã.';
      const validJson = JSON.stringify({
        action: 'BOOKING_NEW',
        guestName: 'Marcio',
        checkIn: '2026-06-02',
        checkOut: '2026-06-05',
      });

      const assessmentInvalid = proxy.assess('09', invalidJson, 'Quero reservar um quarto');
      const assessmentValid = proxy.assess('09', validJson, 'Quero reservar um quarto');

      expect(assessmentInvalid.schemaScore).toBe(0.0);
      expect(assessmentValid.schemaScore).toBe(1.0);
      // Para buckets transacionais JSON, o peso do schema é 40%
      expect(assessmentInvalid.finalScore).toBeLessThanOrEqual(0.6);
      expect(assessmentValid.finalScore).toBeGreaterThan(0.8);
    });

    it('1.2. Format Signal — Detecta e penaliza cabeçalhos markdown e tags abertas no WhatsApp', () => {
      // Resposta com H3 markdown '###' e negrito não fechado '*'
      const badFormat = '### Confirmação de Horário\nOlá! O check-in começa a partir das *14:00 horas.';
      const goodFormat = 'Olá! O *check-in* começa a partir das *14:00* horas.';

      const assessmentBad = proxy.assess('00', badFormat, 'Qual o horário de check-in?');
      const assessmentGood = proxy.assess('00', goodFormat, 'Qual o horário de check-in?');

      expect(assessmentBad.formatScore).toBeLessThan(1.0);
      expect(assessmentGood.formatScore).toBe(1.0);
    });

    it('1.3. Sentiment Signal — Exige empatia e penaliza respostas defensivas em reclamações', () => {
      // Reclamação do hóspede
      const input = 'O quarto está extremamente sujo e a toalha tem manchas!';

      // Resposta agressiva e defensiva
      const badResponse = 'Infelizmente não podemos fazer nada agora. O regulamento diz que a arrumação ocorre apenas de manhã. Não é nossa responsabilidade.';
      // Resposta acolhedora e empática
      const goodResponse = 'Compreendo perfeitamente o seu descontentamento e peço desculpas pelo ocorrido! Vamos mandar a equipe de limpeza imediatamente para resolver e ajudar com novas toalhas.';

      const assessmentBad = proxy.assess('13', badResponse, input);
      const assessmentGood = proxy.assess('13', goodResponse, input);

      expect(assessmentBad.sentimentScore).toBeLessThan(0.4);
      expect(assessmentGood.sentimentScore).toBe(1.0);
    });

    it('1.4. Keywords & Hallucination Signals — Detecta termos obrigatórios e placeholders não resolvidos', () => {
      const input = 'Qual o endereço da pousada?';
      
      // Resposta com placeholders vazios (alucinação) e sem keywords
      const badResponse = 'Esperamos você no dia {{Data}} no nosso [Espaço Reservado].';
      // Resposta perfeita
      const goodResponse = 'A nossa pousada fica localizada no endereço Rua das Flores, 123. A nossa localização é excelente, de fácil acesso e com estacionamento gratuito!';

      const assessmentBad = proxy.assess('01', badResponse, input);
      const assessmentGood = proxy.assess('01', goodResponse, input);

      expect(assessmentBad.hallucinationScore).toBe(0.2); // Penalização dupla por [ ] e {{ }}
      expect(assessmentGood.hallucinationScore).toBe(1.0);

      expect(assessmentBad.keywordsScore).toBe(0.4); // Falta termos no badResponse
      expect(assessmentGood.keywordsScore).toBe(1.0);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Testes do Compartilhamento Bayesiano Hierárquico (HierarchicalTransfer)
  // ──────────────────────────────────────────────────────────────────────────

  describe('2. Hierarchical Bayesian Transfer (Tese 6)', () => {
    const transferService = new HierarchicalTransfer(5, 0.5);

    it('2.1. Jaccard Similarity — Calcula similaridades corretas entre categorias da matriz', () => {
      // Buckets irmãos (Reclamação de Limpeza vs Reclamação de Ruído) devem ser altamente similares
      const simSiblings = transferService.calculateJaccard('13', '14'); 
      expect(simSiblings).toBeGreaterThan(0.5);

      // Buckets da mesma categoria (FAQ)
      const simFaq = transferService.calculateJaccard('00', '01');
      expect(simFaq).toBeGreaterThan(0.4);

      // Buckets totalmente disjuntos (Emergência de Segurança vs Negociação de Preços)
      const simDisjoint = transferService.calculateJaccard('31', '08');
      expect(simDisjoint).toBe(0.0);
    });

    it('2.2. Bayesian Cold-Start Transfer — Reduz incerteza (variância) e transfere pseudo-counts coerentes', () => {
      // Setup de mapa de posteriors em que o target bucket "13" (complaint_cleanliness)
      // está no cold-start total (0 observações), mas temos um bucket irmão "14" (complaint_noise)
      // com alto volume de observações positivas (10 sucessos cravados)
      const mockPosteriors = new Map<string, {
        alpha: number;
        beta: number;
        nObservations: number;
        lastUpdateAt: number;
      }>();

      // Bucket irmão 14 (noise) tem 10 sucessos (alpha = 11.0, beta = 1.0)
      mockPosteriors.set('14__claude-3.5-sonnet', {
        alpha: 11.0, // 10 sucessos reais + 1.0 base
        beta: 1.0,
        nObservations: 10,
        lastUpdateAt: Date.now(),
      });

      // Target bucket 13 (cleanliness) está zerado no banco (não tem registro)
      const benchmarkScore = 0.85; // Claude 3.5 Sonnet benchmark base

      // Sem transferência hierárquica, a posterior do target seria a uniforme/priors normais
      const localOnly = BetaBinomialPosterior.fromBenchmarkPriors(benchmarkScore);
      
      // Com transferência, importa observações atenuadas
      const transferred = transferService.transfer('13', 'claude-3.5-sonnet', mockPosteriors, benchmarkScore);

      // A similaridade Jaccard entre bucket 13 e 14 é:
      // tags 13: ['complaint', 'negative_sentiment', 'empathy_required', 'resolution', 'ops', 'cleanliness', 'long_sla']
      // tags 14: ['complaint', 'negative_sentiment', 'empathy_required', 'resolution', 'ops', 'noise', 'long_sla']
      // Intersecção: 6 tags. União: 8 tags. Jaccard = 6/8 = 0.75.
      // Observações reais de noise: successes = 10.0, failures = 0.0.
      // localObs = 0.
      // attenuation = 0.5 * (1 - 0/5) = 0.5.
      // alpha transferido = alpha_local + 0.75 * 10 * 0.5 = local_alpha + 3.75.
      expect(transferred.alpha).toBe(localOnly.alpha + 3.75);
      expect(transferred.beta).toBe(localOnly.beta);

      // Provar que a incerteza (variância) da distribuição diminuiu com a injeção bayesiana hierárquica
      expect(transferred.variance).toBeLessThan(localOnly.variance);
    });

    it('2.3. Transfer Attenuation — Zera a influência externa quando o bucket local atinge maturidade (n >= 5)', () => {
      const mockPosteriors = new Map<string, {
        alpha: number;
        beta: number;
        nObservations: number;
        lastUpdateAt: number;
      }>();

      // Bucket irmão 14 (noise) tem 10 sucessos
      mockPosteriors.set('14__gpt-4o-mini', {
        alpha: 11.0,
        beta: 1.0,
        nObservations: 10,
        lastUpdateAt: Date.now(),
      });

      // Target bucket 13 (cleanliness) já possui 5 observações locais reais
      mockPosteriors.set('13__gpt-4o-mini', {
        alpha: 5.0,
        beta: 2.0,
        nObservations: 5, // Atingiu maturidade de localConfidenceThreshold
        lastUpdateAt: Date.now(),
      });

      const benchmarkScore = 0.8;
      
      const transferred = transferService.transfer('13', 'gpt-4o-mini', mockPosteriors, benchmarkScore);

      // Como o bucket atingiu o threshold de 5 observações, a atenuação deve ser ZERO,
      // e os parâmetros retornados devem ser idênticos aos locais, sem nenhuma herança
      expect(transferred.alpha).toBe(5.0);
      expect(transferred.beta).toBe(2.0);
    });
  });
});
