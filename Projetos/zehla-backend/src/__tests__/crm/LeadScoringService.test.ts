import { describe, it, expect } from 'vitest'
import { LeadConversionPosterior, ICP_CONVERSION_PRIORS } from '../../domain/crm/models/LeadConversionPosterior'
import { LeadScoringService } from '../../domain/crm/services/LeadScoringService'

describe('Tese 2 — Lead Scoring Thompson Sampling', () => {
  describe('LeadConversionPosterior', () => {
    it('T2.1: uniform cria posterior com alpha=1, beta=1', () => {
      const p = LeadConversionPosterior.uniform({ originChannel: 'whatsapp', persona: 'hospede_romantico' })
      expect(p.alpha).toBe(1)
      expect(p.beta).toBe(1)
      expect(p.conversionProbability).toBe(0.5)
      expect(p.nObservations).toBe(0)
    })

    it('T2.2: fromPriors calcula alpha/beta a partir de baseRate', () => {
      const p = LeadConversionPosterior.fromPriors(
        { originChannel: 'whatsapp', persona: 'hospede_romantico' },
        0.35, 20,
      )
      expect(p.alpha).toBeCloseTo(8, 0)
      expect(p.beta).toBeCloseTo(14, 0)
      expect(p.conversionProbability).toBeCloseTo(0.35, 1)
    })

    it('T2.3: recordConversion incrementa alpha e nObservations', () => {
      const p = LeadConversionPosterior.fromPriors(
        { originChannel: 'whatsapp', persona: 'hospede_romantico' },
        0.35,
      )
      const updated = p.recordConversion(500)
      expect(updated.alpha).toBe(p.alpha + 1)
      expect(updated.beta).toBe(p.beta)
      expect(updated.nObservations).toBe(1)
      expect(updated.totalValueUsd).toBe(500)
      expect(updated.conversionCount).toBe(1)
    })

    it('T2.4: recordLoss incrementa beta e nObservations', () => {
      const p = LeadConversionPosterior.fromPriors(
        { originChannel: 'instagram', persona: 'familiar_lazer' },
        0.22,
      )
      const updated = p.recordLoss()
      expect(updated.alpha).toBe(p.alpha)
      expect(updated.beta).toBe(p.beta + 1)
      expect(updated.nObservations).toBe(1)
    })

    it('T2.5: sample retorna valores entre 0 e 1', () => {
      const p = LeadConversionPosterior.uniform({ originChannel: 'website', persona: 'desconhecido' })
      for (let i = 0; i < 50; i++) {
        const s = p.sample()
        expect(s).toBeGreaterThanOrEqual(0)
        expect(s).toBeLessThanOrEqual(1)
      }
    })

    it('T2.6: sample converge para conversionProbability com muitas observações', () => {
      let p = LeadConversionPosterior.uniform({ originChannel: 'whatsapp', persona: 'hospede_romantico' })
      for (let i = 0; i < 100; i++) {
        p = p.recordConversion(200)
      }
      const prob = p.conversionProbability
      expect(prob).toBeGreaterThan(0.85)
    })

    it('T2.7: expectedValue = conversionProbability * averageConversionValue', () => {
      let p = LeadConversionPosterior.fromPriors(
        { originChannel: 'whatsapp', persona: 'hospede_romantico' },
        0.35,
      )
      p = p.recordConversion(400)
      p = p.recordConversion(600)
      const expected = p.conversionProbability * p.averageConversionValue
      expect(p.expectedValue).toBeCloseTo(expected, 5)
    })
  })

  describe('LeadScoringService', () => {
    it('T2.8: inicializa com priors para todos (canal × persona)', () => {
      const service = new LeadScoringService()
      const posteriors = service.getAllPosteriors()
      const channels = ['whatsapp', 'instagram', 'website', 'booking_ota']
      expect(posteriors.size).toBe(channels.length * ICP_CONVERSION_PRIORS.length)
    })

    it('T2.9: scoreLead retorna resultado com todos os campos', () => {
      const service = new LeadScoringService()
      const result = service.scoreLead('whatsapp', 'hospede_romantico', () => 0.5)
      expect(result.key.originChannel).toBe('whatsapp')
      expect(result.key.persona).toBe('hospede_romantico')
      expect(result.sampledConversionProb).toBeGreaterThan(0)
      expect(result.priorityScore).toBeGreaterThan(0)
      expect(['invest_heavy', 'invest_moderate', 'invest_light', 'skip']).toContain(result.recommendation)
    })

    it('T2.10: canal whatsapp tem channelMultiplier 1.5 (maior prioridade)', () => {
      const service = new LeadScoringService()

      const whatsResult = service.scoreLead('whatsapp', 'hospede_romantico', () => 0.5)
      const webResult = service.scoreLead('website', 'hospede_romantico', () => 0.5)

      expect(whatsResult.priorityScore).toBeGreaterThan(webResult.priorityScore)
    })

    it('T2.11: recordConversion atualiza posteriors', () => {
      const service = new LeadScoringService()
      service.recordConversion('whatsapp', 'hospede_romantico', 800)
      const posteriors = service.getAllPosteriors()
      const key = 'whatsapp__hospede_romantico'
      const posterior = posteriors.get(key)!
      expect(posterior.nObservations).toBe(1)
      expect(posterior.totalValueUsd).toBe(800)
    })

    it('T2.12: recordLoss atualiza posteriors', () => {
      const service = new LeadScoringService()
      service.recordLoss('instagram', 'familiar_lazer')
      const posteriors = service.getAllPosteriors()
      const key = 'instagram__familiar_lazer'
      const posterior = posteriors.get(key)!
      expect(posterior.nObservations).toBe(1)
      expect(posterior.conversionCount).toBe(0)
    })

    it('T2.13: recomendação invest_heavy para alta prioridade', () => {
      const service = new LeadScoringService()
      for (let i = 0; i < 50; i++) {
        service.recordConversion('whatsapp', 'hospede_romantico', 500)
      }
      const result = service.scoreLead('whatsapp', 'hospede_romantico', () => 0.95)
      expect(result.recommendation).toBe('invest_heavy')
    })
  })
})
