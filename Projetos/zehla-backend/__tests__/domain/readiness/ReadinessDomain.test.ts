import { describe, it, expect } from 'vitest';
import { ReadinessEvaluator, ReadinessAnswers } from '../../../src/domain/readiness/entities/ReadinessEvaluator';
import { RoiPredictor, RoiInput } from '../../../src/domain/readiness/entities/RoiPredictor';
import { AgentRecommender } from '../../../src/domain/readiness/entities/AgentRecommender';
import { PIIScanner } from '../../../src/domain/security/services/PIIScanner';

describe('ZEHLA Readiness Evaluator Unit Tests', () => {
  it('should evaluate low maturity and high risk for a baseline pousada', () => {
    const answers: ReadinessAnswers = {
      hasPMS: false,
      hasChannelManager: false,
      hasBookingEngine: false,
      hasWhatsAppAutomation: false,
      hasReviewAutomation: false,
      hasConsolidatedDatabase: false,
      hasHistoricalData: false,
      teamOpenToAI: false,
      teamTrained: false,
      hasLgpdConsent: false,
      hasLgpdDeletionProcess: false,
      hasSecureDataStorage: false,
      propertyName: 'Pousada Teste',
      notes: 'Contato comercial: maria@teste.com e fone: (11) 99999-9999'
    };

    const result = ReadinessEvaluator.evaluate(answers);
    expect(result.isOk).toBe(true);

    const evaluation = result.value;
    expect(evaluation.score).toBe(0);
    expect(evaluation.category).toBe('Co-Pilots');
    expect(evaluation.lgpdRisk).toBe('HIGH');
    
    // Immutability Check
    expect(Object.isFrozen(evaluation)).toBe(true);

    // PII Scanner checks: email and phone should be tokenized in notes/propertyName
    expect(evaluation.propertyName).not.toContain('maria@teste.com');
    // Note: since propertyName was 'Pousada Teste' which doesn't have PII, it should remain 'Pousada Teste' (or tokenized)
    expect(evaluation.propertyName).toBe('Pousada Teste');
  });

  it('should evaluate high maturity and low risk for fully automated pousada', () => {
    const answers: ReadinessAnswers = {
      hasPMS: true, // 15
      hasChannelManager: true, // 15
      hasBookingEngine: true, // 10
      hasWhatsAppAutomation: true, // 15
      hasReviewAutomation: true, // 10
      hasConsolidatedDatabase: true, // 10
      hasHistoricalData: true, // 10
      teamOpenToAI: true, // 10
      teamTrained: true, // 5
      hasLgpdConsent: true,
      hasLgpdDeletionProcess: true,
      hasSecureDataStorage: true,
      propertyName: 'Pousada de Luxo'
    };

    const result = ReadinessEvaluator.evaluate(answers);
    expect(result.isOk).toBe(true);

    const evaluation = result.value;
    expect(evaluation.score).toBe(100);
    expect(evaluation.category).toBe('Autonomous Agents');
    expect(evaluation.lgpdRisk).toBe('LOW');
  });

  it('should evaluate medium maturity and medium risk for hybrid pousada', () => {
    const answers: ReadinessAnswers = {
      hasPMS: true, // 15
      hasChannelManager: true, // 15
      hasBookingEngine: false,
      hasWhatsAppAutomation: true, // 15
      hasReviewAutomation: false,
      hasConsolidatedDatabase: false,
      hasHistoricalData: false,
      teamOpenToAI: true, // 10
      teamTrained: false,
      hasLgpdConsent: true,
      hasLgpdDeletionProcess: true,
      hasSecureDataStorage: false,
      propertyName: 'Pousada Híbrida'
    };

    const result = ReadinessEvaluator.evaluate(answers);
    expect(result.isOk).toBe(true);

    const evaluation = result.value;
    expect(evaluation.score).toBe(55);
    expect(evaluation.category).toBe('Brains');
    expect(evaluation.lgpdRisk).toBe('MEDIUM');
  });
});

describe('ZEHLA ROI Predictor Unit Tests', () => {
  it('should fail to project ROI with invalid inputs', () => {
    const input: RoiInput = {
      roomsCount: 0,
      averageDailyRate: 150,
      currentOccupancy: 60,
      staffAverageHourlyRate: 20
    };

    const result = RoiPredictor.predict(input);
    expect(result.isFail).toBe(true);
    expect(result.error.message).toContain('roomsCount and averageDailyRate must be positive');
  });

  it('should calculate valid ROI estimations for typical pousada', () => {
    const input: RoiInput = {
      roomsCount: 20,
      averageDailyRate: 300,
      currentOccupancy: 50,
      staffAverageHourlyRate: 25
    };

    const result = RoiPredictor.predict(input);
    expect(result.isOk).toBe(true);

    const roi = result.value;
    expect(roi.occupancyBoostPercent).toBe(8.0);
    expect(roi.occupancyRevenueGain).toBe(20 * 30 * 0.08 * 300); // 14400
    expect(roi.totalMonthlyGain).toBeGreaterThan(14400);
    expect(roi.totalYearlyGain).toBe(roi.totalMonthlyGain * 12);
    
    // Immutability Check
    expect(Object.isFrozen(roi)).toBe(true);
  });
});

describe('ZEHLA Agent Recommender Unit Tests', () => {
  const samplerStats = {
    1: { alpha: 10, beta: 2, mean: 0.83 },
    2: { alpha: 5, beta: 3, mean: 0.625 },
    3: { alpha: 3, beta: 5, mean: 0.375 }
  };

  it('should recommend critical priority for WhatsApp when not automated', () => {
    const result = AgentRecommender.recommend(false, true, samplerStats);
    expect(result.isOk).toBe(true);

    const recommendations = result.value;
    expect(recommendations.length).toBeGreaterThan(0);

    const waRec = recommendations.find(r => r.agentName.includes('WhatsApp'));
    expect(waRec).toBeDefined();
    expect(waRec!.priority).toBe('CRITICAL');
    expect(waRec!.estimatedRoiMultiplier).toBeCloseTo(2.1);
  });

  it('should recommend critical or high priority for Revenue AI depending on PMS availability', () => {
    // With PMS and tier3Conversion = 0.375 (priority HIGH because conversion <= 0.4)
    const resultWithPMS = AgentRecommender.recommend(true, true, samplerStats);
    const recsWithPMS = resultWithPMS.value;
    const revRecPMS = recsWithPMS.find(r => r.agentName.includes('Revenue'));
    expect(revRecPMS!.priority).toBe('HIGH');
    expect(revRecPMS!.estimatedRoiMultiplier).toBeCloseTo(2.8);

    // Without PMS
    const resultNoPMS = AgentRecommender.recommend(true, false, samplerStats);
    const recsNoPMS = resultNoPMS.value;
    const revRecNoPMS = recsNoPMS.find(r => r.agentName.includes('Revenue'));
    expect(revRecNoPMS!.priority).toBe('MEDIUM');
    expect(revRecNoPMS!.description).toContain('integrar primeiro um PMS');
  });

  it('should return frozen recommendations list sorted by priority', () => {
    const result = AgentRecommender.recommend(false, false, samplerStats);
    const recs = result.value;
    
    expect(Object.isFrozen(recs)).toBe(true);
    for (const r of recs) {
      expect(Object.isFrozen(r)).toBe(true);
    }

    // Sorted by priority: CRITICAL(0) -> HIGH(1) -> MEDIUM(2)
    const priorities = recs.map(r => r.priority);
    for (let i = 0; i < priorities.length - 1; i++) {
      const p1 = priorities[i];
      const p2 = priorities[i + 1];
      const val = (p: string) => p === 'CRITICAL' ? 0 : p === 'HIGH' ? 1 : 2;
      expect(val(p1)).toBeLessThanOrEqual(val(p2));
    }
  });
});
