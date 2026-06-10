import { describe, it, expect, vi } from 'vitest'
import { PlaybookGeneratedEventHandler } from '../../../../src/application/comercial/handlers/PlaybookGeneratedEventHandler'
import { DomainEvent } from '../../../../src/domain/shared/DomainEvent'
import { Queue } from 'bullmq'

describe('PlaybookGeneratedEventHandler Unit Tests', () => {
  it('should correctly schedule followup job with base delay and Gaussian jitter', async () => {
    // 1. Mock BullMQ Queue
    const mockAdd = vi.fn().mockResolvedValue({ id: 'job_followup_001' })
    const mockQueue = {
      add: mockAdd
    } as unknown as Queue

    // 2. Instantiate Handler
    const handler = new PlaybookGeneratedEventHandler(mockQueue)

    // 3. Create Event
    const event: DomainEvent = {
      aggregateId: 'lead_abc_123',
      eventName: 'PlaybookGeneratedEvent',
      occurredAt: new Date(),
      payload: {
        score: 85,
        category: 'Brains',
        lgpdRisk: 'LOW',
        playbookUrl: '/playbooks/playbook_prop_123.md'
      }
    }

    // 4. Handle Event
    await handler.handle(event)

    // 5. Assertions
    expect(mockAdd).toHaveBeenCalledTimes(1)
    const [jobName, payload, options] = mockAdd.mock.calls[0]

    expect(jobName).toBe('DispatchFollowUp')
    expect(payload).toEqual({
      leadId: 'lead_abc_123',
      cadenceType: 'ENGAJAMENTO',
      roiData: {
        score: 85,
        category: 'Brains',
        lgpdRisk: 'LOW',
        playbookUrl: '/playbooks/playbook_prop_123.md'
      }
    })

    // Delay must be 2 hours (7,200,000 ms) + Gaussian Jitter (between 5,000 ms and 45,000 ms)
    const baseDelayMs = 2 * 60 * 60 * 1000
    const delay = options.delay
    expect(delay).toBeGreaterThanOrEqual(baseDelayMs + 5000)
    expect(delay).toBeLessThanOrEqual(baseDelayMs + 45000)

    expect(options.attempts).toBe(3)
    expect(options.backoff).toEqual({
      type: 'exponential',
      delay: 10000
    })
  })

  it('should ignore other events', async () => {
    const mockAdd = vi.fn()
    const mockQueue = {
      add: mockAdd
    } as unknown as Queue

    const handler = new PlaybookGeneratedEventHandler(mockQueue)

    const event: DomainEvent = {
      aggregateId: 'lead_abc_123',
      eventName: 'SomeOtherEvent',
      occurredAt: new Date(),
      payload: {}
    }

    await handler.handle(event)
    expect(mockAdd).not.toHaveBeenCalled()
  })
})
