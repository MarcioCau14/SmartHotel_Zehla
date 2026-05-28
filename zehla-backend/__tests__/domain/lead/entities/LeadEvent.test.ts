import { describe, it, expect } from 'vitest'
import { LeadEvent } from '../../../../src/domain/lead/entities/LeadEvent'
import { LeadEventType } from '../../../../src/domain/lead/LeadEventType'

describe('LeadEvent', () => {
  it('should create a WHATSAPP_REPLY event', () => {
    const event = LeadEvent.create({
      id: 'evt-1',
      leadId: 'lead-1',
      type: LeadEventType.WHATSAPP_REPLY,
    })
    expect(event.isOk).toBe(true)
    expect(event.value.scoreImpact).toBe(10)
    expect(event.value.dedupHash).toBeDefined()
  })

  it('should create a CONVERSION event with score 50', () => {
    const event = LeadEvent.create({
      id: 'evt-2',
      leadId: 'lead-1',
      type: LeadEventType.CONVERSION,
    })
    expect(event.isOk).toBe(true)
    expect(event.value.scoreImpact).toBe(50)
  })

  it('should create an EMAIL_OPEN event with score 1', () => {
    const event = LeadEvent.create({
      id: 'evt-3',
      leadId: 'lead-1',
      type: LeadEventType.EMAIL_OPEN,
    })
    expect(event.isOk).toBe(true)
    expect(event.value.scoreImpact).toBe(1)
  })

  it('should generate different dedup hashes for different data', () => {
    const e1 = LeadEvent.create({
      id: 'evt-4',
      leadId: 'lead-1',
      type: LeadEventType.EMAIL_OPEN,
      sessionId: 'session-a',
    })
    const e2 = LeadEvent.create({
      id: 'evt-5',
      leadId: 'lead-1',
      type: LeadEventType.EMAIL_OPEN,
      sessionId: 'session-b',
    })
    expect(e1.isOk && e2.isOk).toBe(true)
    expect(e1.value.dedupHash).not.toBe(e2.value.dedupHash)
  })

  it('should include sessionId and metadata', () => {
    const event = LeadEvent.create({
      id: 'evt-6',
      leadId: 'lead-1',
      type: LeadEventType.LANDING_VISIT,
      sessionId: 'sess-123',
      metadata: { page: '/pricing', referrer: 'google.com' },
    })
    expect(event.isOk).toBe(true)
    expect(event.value.sessionId).toBe('sess-123')
  })
})
