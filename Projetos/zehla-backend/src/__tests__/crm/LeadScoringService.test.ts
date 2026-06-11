import { describe, it, expect } from 'vitest'
import { LeadConversionPosterior, ICP_CONVERSION_PRIORS } from '../../domain/crm/models/LeadConversionPosterior'
import { LeadScoringService } from '../../domain/crm/services/LeadScoringService'
import { LeadProfile } from '../../domain/crm/models/LeadProfile'
import { CRMPipelineStage, ICPersona } from '../../domain/crm/models/CRMPipelineStage'

function makeLead(overrides?: Partial<Parameters<typeof LeadProfile.create>[0]>) {
  const r = LeadProfile.create({
    id: 'lead-score-test',
    nome: 'Lead Teste',
    telefone: '5511999999999',
    canalOrigem: 'website',
    ltvScore: 50,
    stage: CRMPipelineStage.ENTRADA,
    createdAt: new Date('2026-01-01'),
    propriedadeId: 'prop-1',
    ...overrides,
  })
  if (r.isFail) throw r.error
  return r.value
}

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

    it('T2.14: lead B2B/WhatsApp com alto histórico recebe score maior que lead novo desconhecido/website', () => {
      const service = new LeadScoringService()
      for (let i = 0; i < 50; i++) {
        service.recordConversion('whatsapp', 'produtor_b2b', 1500)
      }
      const b2b = service.scoreLead('whatsapp', 'produtor_b2b', () => 0.95)
      const desconhecido = service.scoreLead('website', 'desconhecido', () => 0.5)
      expect(b2b.priorityScore).toBeGreaterThan(desconhecido.priorityScore)
      expect(b2b.recommendation).toBe('invest_heavy')
      expect(desconhecido.sampledConversionProb).toBeLessThan(b2b.sampledConversionProb)
    })

    it('T2.15: scoreLeadFromProfile deriva canal e persona do LeadProfile', () => {
      const service = new LeadScoringService()
      const lead = makeLead({ canalOrigem: 'whatsapp', persona: ICPersona.PRODUTOR_B2B })
      for (let i = 0; i < 20; i++) {
        service.recordConversion('whatsapp', 'produtor_b2b', 2000)
      }
      const result = service.scoreLeadFromProfile(lead, () => 0.85)
      expect(result.key.originChannel).toBe('whatsapp')
      expect(result.key.persona).toBe('produtor_b2b')
      expect(result.sampledConversionProb).toBeGreaterThan(0.5)
    })
  })
})

describe('Tese 2 — Hardening (Imutabilidade + Cold Start)', () => {
  it('T2.H1: LeadConversionPosterior uniform é imutável (Object.isFrozen)', () => {
    const p = LeadConversionPosterior.uniform({ originChannel: 'whatsapp', persona: 'hospede_romantico' })
    expect(Object.isFrozen(p)).toBe(true)
    expect(Object.isFrozen(p.key)).toBe(true)
  })

  it('T2.H2: recordConversion retorna nova instância congelada (não muta a original)', () => {
    const p = LeadConversionPosterior.uniform({ originChannel: 'instagram', persona: 'familiar_lazer' })
    const updated = p.recordConversion(500)
    expect(updated).not.toBe(p)
    expect(p.nObservations).toBe(0)
    expect(updated.nObservations).toBe(1)
    expect(Object.isFrozen(updated)).toBe(true)
  })

  it('T2.H3: recordLoss retorna nova instância congelada', () => {
    const p = LeadConversionPosterior.fromPriors({ originChannel: 'website', persona: 'produtor_b2b' }, 0.08)
    const updated = p.recordLoss()
    expect(updated).not.toBe(p)
    expect(p.beta).toBeCloseTo(p.beta, 0)
    expect(updated.beta).toBeGreaterThan(p.beta)
    expect(Object.isFrozen(updated)).toBe(true)
  })

  it('T2.H4: Cold Start (Beta(1,1)) tem conversionProbability = 0.5 (score mediano de exploração)', () => {
    const p = LeadConversionPosterior.uniform({ originChannel: 'whatsapp', persona: 'hospede_romantico' })
    expect(p.alpha).toBe(1)
    expect(p.beta).toBe(1)
    expect(p.conversionProbability).toBe(0.5)
    expect(p.nObservations).toBe(0)
  })

  it('T2.H5: Cold Start sample nunca falha (sempre retorna valor em [0,1])', () => {
    const p = LeadConversionPosterior.uniform({ originChannel: 'website', persona: 'desconhecido' })
    for (let i = 0; i < 100; i++) {
      const s = p.sample()
      expect(s).toBeGreaterThanOrEqual(0)
      expect(s).toBeLessThanOrEqual(1)
    }
  })
})
