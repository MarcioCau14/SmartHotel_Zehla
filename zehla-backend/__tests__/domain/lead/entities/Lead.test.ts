import { describe, it, expect } from 'vitest'
import { Lead } from '../../../../src/domain/lead/entities/Lead'
import { LeadContactInfo } from '../../../../src/domain/lead/value-objects/LeadContactInfo'
import { BusinessProfile } from '../../../../src/domain/lead/value-objects/BusinessProfile'
import { LeadScore } from '../../../../src/domain/lead/value-objects/LeadScore'
import { LeadEvent } from '../../../../src/domain/lead/entities/LeadEvent'
import { LeadEventType } from '../../../../src/domain/lead/LeadEventType'
import { LeadStatus } from '../../../../src/domain/lead/LeadStatus'

function makeContact(name = 'Pousada Sol Nascente') {
  return LeadContactInfo.create({ name, phone: '5511999999999' }).value
}

function makeBusiness(rooms = 12) {
  return BusinessProfile.create({
    property: 'Pousada Sol',
    category: 'pousada',
    city: 'Imbituba',
    state: 'SC',
    roomsCount: rooms,
    hasWebsite: true,
  }).value
}

describe('Lead', () => {
  describe('create', () => {
    it('should create a lead with minimal props', () => {
      const lead = Lead.create({
        id: 'lead-1',
        contact: makeContact(),
      })
      expect(lead.isOk).toBe(true)
      const l = lead.value
      expect(l.funnel.status).toBe(LeadStatus.PROSPECT)
      expect(l.score.score).toBe(0)
      expect(l.score.cluster).toBe('COLD')
      expect(l.events).toHaveLength(1)
      expect(l.events[0].eventName).toBe('LeadCaptured')
    })

    it('should create a lead with all optional props', () => {
      const lead = Lead.create({
        id: 'lead-2',
        contact: makeContact(),
        business: makeBusiness(),
        source: 'LANDING_PAGE',
        propertyId: 'prop-1',
      })
      expect(lead.isOk).toBe(true)
      const l = lead.value
      expect(l.propertyId).toBe('prop-1')
      expect(l.business.roomsCount).toBe(12)
      expect(l.funnel.source).toBe('LANDING_PAGE')
    })

    it('should reject invalid contact', () => {
      const badContact = LeadContactInfo.create({ name: 'X' })
      expect(badContact.isFail).toBe(true)
    })
  })

  describe('qualify', () => {
    it('should update score and emit event on cluster change', () => {
      const lead = Lead.create({ id: 'lead-3', contact: makeContact() }).value
      lead.clearEvents()
      const newScore = LeadScore.create({ score: 70 }).value
      const result = lead.qualify(newScore)
      expect(result.isOk).toBe(true)
      expect(lead.score.score).toBe(70)
      expect(lead.score.cluster).toBe('HOT')
      const hasEvent = lead.events.some((e) => e.eventName === 'LeadQualified')
      expect(hasEvent).toBe(true)
    })

    it('should NOT emit event if cluster does not change', () => {
      const lead = Lead.create({ id: 'lead-4', contact: makeContact() }).value
      lead.clearEvents()
      const sameClusterScore = LeadScore.create({ score: 10 }).value
      lead.qualify(sameClusterScore)
      const hasEvent = lead.events.some((e) => e.eventName === 'LeadQualified')
      expect(hasEvent).toBe(false)
    })
  })

  describe('transitionStatus', () => {
    it('should transition PROSPECT -> QUALIFIED', () => {
      const lead = Lead.create({ id: 'lead-5', contact: makeContact() }).value
      const result = lead.transitionStatus(LeadStatus.QUALIFIED)
      expect(result.isOk).toBe(true)
      expect(lead.funnel.status).toBe(LeadStatus.QUALIFIED)
    })

    it('should reject invalid transition', () => {
      const lead = Lead.create({ id: 'lead-6', contact: makeContact() }).value
      const result = lead.transitionStatus(LeadStatus.CONVERTED)
      expect(result.isFail).toBe(true)
    })

    it('should emit LeadConverted event', () => {
      const lead = Lead.create({ id: 'lead-7', contact: makeContact() }).value
      lead.clearEvents()
      lead.transitionStatus(LeadStatus.QUALIFIED)
      lead.clearEvents()
      lead.transitionStatus(LeadStatus.TRIAL_STARTED)
      lead.clearEvents()
      const result = lead.transitionStatus(LeadStatus.CONVERTED)
      expect(result.isOk).toBe(true)
      const hasEvent = lead.events.some((e) => e.eventName === 'LeadConverted')
      expect(hasEvent).toBe(true)
    })
  })

  describe('addEvent', () => {
    it('should add a WHATSAPP_REPLY event and increase score', () => {
      const lead = Lead.create({ id: 'lead-8', contact: makeContact() }).value
      const event = LeadEvent.create({
        id: 'evt-1',
        leadId: lead.id,
        type: LeadEventType.WHATSAPP_REPLY,
      }).value
      const result = lead.addEvent(event)
      expect(result.isOk).toBe(true)
      expect(lead.score.score).toBe(10)
      expect(lead.leadEvents).toHaveLength(1)
      expect(lead.lastInteractionAt).toBeDefined()
    })

    it('should emit InteractionAdded event', () => {
      const lead = Lead.create({ id: 'lead-9', contact: makeContact() }).value
      lead.clearEvents()
      const event = LeadEvent.create({
        id: 'evt-2',
        leadId: lead.id,
        type: LeadEventType.EMAIL_OPEN,
      }).value
      lead.addEvent(event)
      const hasEvent = lead.events.some((e) => e.eventName === 'InteractionAdded')
      expect(hasEvent).toBe(true)
    })

    it('should clamp score at 100 after multiple events', () => {
      const existingScore = LeadScore.create({ score: 95 }).value
      const lead = Lead.create({ id: 'lead-10', contact: makeContact() }).value
      lead.qualify(existingScore)
      lead.clearEvents()

      const event = LeadEvent.create({
        id: 'evt-3',
        leadId: lead.id,
        type: LeadEventType.CONVERSION,
      }).value
      lead.addEvent(event)
      expect(lead.score.score).toBe(100)
    })
  })

  describe('toJSON', () => {
    it('should serialize without throwing', () => {
      const lead = Lead.create({
        id: 'lead-11',
        contact: makeContact(),
        business: makeBusiness(),
        source: 'INSTAGRAM',
      }).value
      const json = lead.toJSON()
      expect(json.id).toBe('lead-11')
      expect(json.funnel.source).toBe('INSTAGRAM')
    })
  })
})
