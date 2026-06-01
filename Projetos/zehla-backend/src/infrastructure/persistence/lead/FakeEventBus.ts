import { DomainEvent } from '../../../domain/shared/DomainEvent'
import { IEventBus } from '../../../application/lead/ports/IEventBus'

export class FakeEventBus implements IEventBus {
  public events: DomainEvent[] = []

  async publish(event: DomainEvent): Promise<void> {
    this.events.push(event)
  }

  async publishMany(events: DomainEvent[]): Promise<void> {
    this.events.push(...events)
  }

  clear(): void {
    this.events = []
  }
}
