import { describe, it, expect } from 'vitest'
import { CampaignOrchestrator } from '../../../../src/domain/marketing/services/CampaignOrchestrator'

describe('CampaignOrchestrator', () => {
  const orchestrator = new CampaignOrchestrator()

  describe('validateSegment', () => {
    it('should accept valid segment types', () => {
      const types = ['todos', 'hospedes_ativos', 'hospedes_passados', 'leads_quentes', 'leads_frios']
      for (const type of types) {
        const result = orchestrator.validateSegment({ type: type as any })
        expect(result.isOk).toBe(true)
      }
    })

    it('should accept personalizado with custom filter', () => {
      const result = orchestrator.validateSegment({ type: 'personalizado', customFilter: { city: 'SP' } })
      expect(result.isOk).toBe(true)
    })

    it('should reject personalizado without custom filter', () => {
      const result = orchestrator.validateSegment({ type: 'personalizado' })
      expect(result.isFail).toBe(true)
    })

    it('should reject invalid segment type', () => {
      const result = orchestrator.validateSegment({ type: 'invalido' as any })
      expect(result.isFail).toBe(true)
    })

    it('should reject empty segment type', () => {
      const result = orchestrator.validateSegment({ type: '' as any })
      expect(result.isFail).toBe(true)
    })
  })

  describe('validateSchedule', () => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 7)

    it('should accept valid schedule', () => {
      const result = orchestrator.validateSchedule({
        startAt: futureDate,
        timezone: 'America/Sao_Paulo',
        sendWindowStart: '09:00',
        sendWindowEnd: '18:00',
      })
      expect(result.isOk).toBe(true)
    })

    it('should reject past date', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)
      const result = orchestrator.validateSchedule({
        startAt: pastDate,
        timezone: 'America/Sao_Paulo',
        sendWindowStart: '09:00',
        sendWindowEnd: '18:00',
      })
      expect(result.isFail).toBe(true)
    })

    it('should reject window outside business hours', () => {
      const result = orchestrator.validateSchedule({
        startAt: futureDate,
        timezone: 'America/Sao_Paulo',
        sendWindowStart: '22:00',
        sendWindowEnd: '23:00',
      })
      expect(result.isFail).toBe(true)
    })

    it('should reject invalid window format', () => {
      const result = orchestrator.validateSchedule({
        startAt: futureDate,
        timezone: 'America/Sao_Paulo',
        sendWindowStart: 'abc',
        sendWindowEnd: 'xyz',
      })
      expect(result.isFail).toBe(true)
    })

    it('should reject invalid startAt', () => {
      const result = orchestrator.validateSchedule({
        startAt: new Date('invalid'),
        timezone: 'America/Sao_Paulo',
        sendWindowStart: '09:00',
        sendWindowEnd: '18:00',
      })
      expect(result.isFail).toBe(true)
    })
  })

  describe('canTransition', () => {
    it('should allow valid transitions', () => {
      expect(orchestrator.canTransition('agendada', 'em_envio').isOk).toBe(true)
      expect(orchestrator.canTransition('agendada', 'cancelada').isOk).toBe(true)
      expect(orchestrator.canTransition('em_envio', 'concluida').isOk).toBe(true)
    })

    it('should reject invalid transitions', () => {
      expect(orchestrator.canTransition('concluida', 'em_envio').isFail).toBe(true)
      expect(orchestrator.canTransition('concluida', 'cancelada').isFail).toBe(true)
      expect(orchestrator.canTransition('em_envio', 'agendada').isFail).toBe(true)
    })
  })

  describe('estimateRecipients', () => {
    it('should return all for todos', () => {
      expect(orchestrator.estimateRecipients({ type: 'todos' }, 1000)).toBe(1000)
    })

    it('should return percentage based on segment type', () => {
      expect(orchestrator.estimateRecipients({ type: 'hospedes_ativos' }, 1000)).toBe(300)
      expect(orchestrator.estimateRecipients({ type: 'leads_quentes' }, 1000)).toBe(150)
      expect(orchestrator.estimateRecipients({ type: 'leads_frios' }, 1000)).toBe(350)
    })
  })

  describe('calculateBatchSize', () => {
    it('should return all for small groups', () => {
      expect(orchestrator.calculateBatchSize(50)).toBe(50)
    })

    it('should return 100 for medium groups', () => {
      expect(orchestrator.calculateBatchSize(500)).toBe(100)
    })

    it('should return 200 for large groups', () => {
      expect(orchestrator.calculateBatchSize(5000)).toBe(200)
    })

    it('should return 500 for very large groups', () => {
      expect(orchestrator.calculateBatchSize(50000)).toBe(500)
    })
  })

  describe('estimateDurationMinutes', () => {
    it('should estimate reasonable duration', () => {
      const duration = orchestrator.estimateDurationMinutes(1000)
      expect(duration).toBeGreaterThan(0)
      expect(duration).toBeLessThan(60)
    })
  })
})
