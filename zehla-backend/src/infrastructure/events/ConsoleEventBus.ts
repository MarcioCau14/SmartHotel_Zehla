import { DomainEvent } from '../../domain/shared/DomainEvent'
import { IEventBus } from '../../application/reservation/ports/IEventBus'

export class ConsoleEventBus implements IEventBus {
  async publish(event: DomainEvent): Promise<void> {
    console.log(`[EVENT] ${event.eventName} | aggregate: ${event.aggregateId} | at: ${event.occurredAt.toISOString()}`)
    if (process.env.NODE_ENV === 'development') {
      console.debug('[EVENT PAYLOAD]', JSON.stringify(event.payload, null, 2))
    }
  }

  async publishMany(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event)
    }
  }
}
