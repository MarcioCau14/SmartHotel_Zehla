import { DomainEvent } from '../../domain/shared/DomainEvent'
import { IEventBus } from '../../application/reservation/ports/IEventBus'
import { DomainEventPublisher } from '../../domain/shared/events/DomainEventPublisher'
import { PlaybookGeneratedEventHandler } from '../../application/comercial/handlers/PlaybookGeneratedEventHandler'
import { followupQueue } from '../../lib/queues'
import { ZdrPrivacyModule } from '../../domain/security/services/ZdrPrivacyModule'
import { LeadBlacklistedHandler } from '../../application/growth/handlers/LeadBlacklistedHandler'

export class ConsoleEventBus implements IEventBus {
  private readonly publisher: DomainEventPublisher

  constructor() {
    this.publisher = new DomainEventPublisher()
    
    // Playbook Generated
    this.publisher.subscribe(
      'PlaybookGeneratedEvent',
      new PlaybookGeneratedEventHandler(followupQueue)
    )

    // Outbound LGPD/ZDR Expunge
    const zdrModule = new ZdrPrivacyModule()
    this.publisher.subscribe(
      'LeadBlacklistedEvent',
      new LeadBlacklistedHandler(zdrModule)
    )
  }

  async publish(event: DomainEvent): Promise<void> {
    console.log(`[EVENT] ${event.eventName} | aggregate: ${event.aggregateId} | at: ${event.occurredAt.toISOString()}`)
    if (process.env.NODE_ENV === 'development') {
      console.debug('[EVENT PAYLOAD]', JSON.stringify(event.payload, null, 2))
    }
    this.publisher.publish(event)
  }

  async publishMany(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event)
    }
  }
}

