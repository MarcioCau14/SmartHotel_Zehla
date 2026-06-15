import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProcessReplyUseCase } from '../../application/growth/use-cases/ProcessReplyUseCase'
import { LeadBlacklistedEvent } from '../../domain/growth/events/LeadBlacklistedEvent'
import { ZdrPrivacyModule } from '../../domain/security/services/ZdrPrivacyModule'
import { LeadBlacklistedHandler } from '../../application/growth/handlers/LeadBlacklistedHandler'
import { DomainEventPublisher } from '../../domain/shared/events/DomainEventPublisher'
import { prisma } from '@/lib/prisma'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    lead: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    blacklist: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(async (callback) => {
      return callback(prisma)
    }),
  },
}))

vi.mock('@/lib/brain/intent-classifier', () => ({
  classifyIntent: vi.fn(async () => ({
    intent: 'OPT_OUT',
    confidence: 0.99,
    entities: {},
    rawMessage: 'Favor me retirar da lista, não tenho interesse.'
  }))
}))

describe('ZEHLA Outbound 2.0 - Event-Driven Architecture (EDA) & Privacy', () => {
  let eventPublisher: DomainEventPublisher
  let fakeEventBus: any

  beforeEach(() => {
    vi.clearAllMocks()

    eventPublisher = new DomainEventPublisher()
    fakeEventBus = {
      publish: vi.fn(async (event) => {
        eventPublisher.publish(event)
      }),
    }
  })

  it('deve realizar fluxo completo de opt-out: transição de FSM, disparo de evento, hashing ZDR e expurgo PII', async () => {
    const mockLead = {
      id: 'lead-123',
      name: 'João Growth Tester',
      email: 'joao.growth@example.com',
      phone: '5548999999999',
      whatsapp: '5548999999999',
      status: 'ACTIVE',
      notes: 'Notes original',
    }

    ;(prisma.lead.findFirst as any).mockResolvedValue(mockLead)
    ;(prisma.lead.update as any).mockResolvedValue({ ...mockLead, status: 'BLACKLISTED' })

    const zdrModule = new ZdrPrivacyModule(prisma)
    const handler = new LeadBlacklistedHandler(zdrModule)
    eventPublisher.subscribe('LeadBlacklistedEvent', handler)

    const useCase = new ProcessReplyUseCase(fakeEventBus)
    const result = await useCase.execute('5548999999999', 'Favor me retirar da lista, não tenho interesse.')

    expect(result.isOk).toBe(true)
    expect(result.value!.transitionedToBlacklisted).toBe(true)
    
    expect(prisma.lead.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'lead-123' },
        data: expect.objectContaining({
          status: 'BLACKLISTED',
        }),
      })
    )

    expect(fakeEventBus.publish).toHaveBeenCalled()
    const publishedEvent = fakeEventBus.publish.mock.calls[0][0] as LeadBlacklistedEvent
    expect(publishedEvent.eventName).toBe('LeadBlacklistedEvent')
    expect(publishedEvent.aggregateId).toBe('lead-123')
    expect(publishedEvent.payload.email).toBe('joao.growth@example.com')

    expect(prisma.blacklist.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          emailHash: zdrModule.generateHash('joao.growth@example.com'),
        },
      })
    )

    expect(prisma.lead.update).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: { id: 'lead-123' },
        data: expect.objectContaining({
          name: expect.stringContaining('EXPUNGED_LEAD_'),
          email: null,
          phone: null,
          whatsapp: null,
          status: 'BLACKLISTED',
        }),
      })
    )
  })
})
