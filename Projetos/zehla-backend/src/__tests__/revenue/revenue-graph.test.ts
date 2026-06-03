import { describe, it, expect } from 'vitest'
import {
  RevenueGraphService,
  RevenueEntityType,
  RevenueRelationType,
  UPSELL_BFS_PATHS,
} from '../../domain/revenue/models/RevenueGraphEntities'

describe('RevenueGraphService', () => {
  let service: RevenueGraphService

  beforeEach(() => {
    service = new RevenueGraphService()
  })

  describe('addPricingRule', () => {
    it('deve adicionar regra de preço para um tipo de quarto', () => {
      service.addPricingRule('suite-luxo', 500)
      const result = service.calculatePrice('suite-luxo', 0.5, 0.5, null)
      expect(result).not.toBeNull()
      expect(result!.suggestedPriceUsd).toBeGreaterThan(0)
    })
  })

  describe('calculatePrice', () => {
    it('deve retornar null para roomTypeId inexistente', () => {
      const result = service.calculatePrice('inexistente', 0.5, 0.5, null)
      expect(result).toBeNull()
    })

    it('deve calcular preço base com ocupação baixa (<=60%) e demanda baixa (<=50%)', () => {
      service.addPricingRule('standard', 400)
      const result = service.calculatePrice('standard', 0.50, 0.40, null)!
      expect(result.suggestedPriceUsd).toBeLessThan(400)
      expect(result.reasoning).toContain('occ=0.90')
      expect(result.reasoning).toContain('season=0.95')
    })

    it('deve aplicar fator de ocupação 1.0 para 60-80%', () => {
      service.addPricingRule('standard', 400)
      const result = service.calculatePrice('standard', 0.70, 0.40, null)!
      expect(result.reasoning).toContain('occ=1.00')
      expect(result.suggestedPriceUsd).toBe(400 * 1.0 * 0.95 * 1.0)
    })

    it('deve aplicar fator de ocupação 1.15 para >80%', () => {
      service.addPricingRule('standard', 400)
      const result = service.calculatePrice('standard', 0.90, 0.40, null)!
      expect(result.reasoning).toContain('occ=1.15')
      expect(result.suggestedPriceUsd).toBeCloseTo(400 * 1.15 * 0.95 * 1.0, 2)
    })

    it('deve aplicar fator de sazonalidade 1.05 para 50-80%', () => {
      service.addPricingRule('standard', 400)
      const result = service.calculatePrice('standard', 0.50, 0.60, null)!
      expect(result.reasoning).toContain('season=1.05')
    })

    it('deve aplicar fator de sazonalidade 1.20 para >80%', () => {
      service.addPricingRule('standard', 400)
      const result = service.calculatePrice('standard', 0.50, 0.90, null)!
      expect(result.reasoning).toContain('season=1.20')
    })

    it('deve considerar preço do competidor quando disponível', () => {
      service.addPricingRule('suite-luxo', 500)
      const result = service.calculatePrice('suite-luxo', 0.70, 0.50, 600)!
      expect(result.competitorAvg).toBe(600)
      expect(result.reasoning).toContain('comp')
    })

    it('deve limitar fator do competidor a [0.85, 1.20]', () => {
      service.addPricingRule('suite-luxo', 500)
      const cheap = service.calculatePrice('suite-luxo', 0.50, 0.50, 100)!
      expect(cheap.reasoning).toContain('comp=0.85')

      const expensive = service.calculatePrice('suite-luxo', 0.50, 0.50, 1000)!
      expect(expensive.reasoning).toContain('comp=1.20')
    })

    it('deve retornar recomendação congelada (imutável)', () => {
      service.addPricingRule('standard', 400)
      const result = service.calculatePrice('standard', 0.70, 0.50, null)!
      expect(Object.isFrozen(result)).toBe(true)
    })

    it('deve calcular confidence entre 0.7 e 0.99', () => {
      service.addPricingRule('standard', 400)
      const low = service.calculatePrice('standard', 0, 0, null)!
      expect(low.confidence).toBe(0.70)

      const high = service.calculatePrice('standard', 1.0, 1.0, null)!
      expect(high.confidence).toBe(0.99)
    })

    it('deve definir min como 85% e max como 115% do sugerido', () => {
      service.addPricingRule('standard', 400)
      const result = service.calculatePrice('standard', 0.70, 0.50, null)!
      expect(result.minPriceUsd).toBeCloseTo(result.suggestedPriceUsd * 0.85, 2)
      expect(result.maxPriceUsd).toBeCloseTo(result.suggestedPriceUsd * 1.15, 2)
    })
  })

  describe('UPSELL_BFS_PATHS', () => {
    it('deve ter 5 caminhos pré-definidos', () => {
      expect(UPSELL_BFS_PATHS.length).toBe(5)
    })

    it('deve conter caminho Guest_Family → Upsell_WineTasting', () => {
      expect(UPSELL_BFS_PATHS[0]).toContain('Guest_Family')
      expect(UPSELL_BFS_PATHS[0]).toContain('Upsell_WineTasting')
    })

    it('todos os caminhos devem ser congelados', () => {
      for (const path of UPSELL_BFS_PATHS) {
        expect(Object.isFrozen(path)).toBe(true)
      }
    })
  })

  describe('RevenueEntityType', () => {
    it('deve ter 4 tipos de entidade com valores corretos', () => {
      expect(RevenueEntityType.PRICING_RULE).toBe('PricingRule')
      expect(RevenueEntityType.SEASONAL_DEMAND).toBe('SeasonalDemand')
      expect(RevenueEntityType.UPSELL_PATH).toBe('UpsellPath')
      expect(RevenueEntityType.COMPETITOR_PRICE).toBe('CompetitorPrice')
    })
  })

  describe('RevenueRelationType', () => {
    it('deve ter 6 tipos de relação com valores corretos', () => {
      expect(RevenueRelationType.PRICED_FOR).toBe('priced_for')
      expect(RevenueRelationType.DRIVEN_BY).toBe('driven_by')
      expect(RevenueRelationType.ENABLES_UPSELL).toBe('enables_upsell')
      expect(RevenueRelationType.COMPETES_WITH).toBe('competes_with')
      expect(RevenueRelationType.BUNDLED_WITH).toBe('bundled_with')
      expect(RevenueRelationType.PACE_ADJUSTS).toBe('pace_adjusts')
    })
  })
})
