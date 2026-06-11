import { DomainEvent } from '../DomainEvent'
import { IDomainEventHandler } from './IDomainEventHandler'

export class DomainEventPublisher {
  private handlers = new Map<string, IDomainEventHandler[]>()

  subscribe(eventName: string, handler: IDomainEventHandler): void {
    const existing = this.handlers.get(eventName) ?? []
    existing.push(handler)
    this.handlers.set(eventName, existing)
  }

  publish(event: DomainEvent): void {
    const handlers = this.handlers.get(event.eventName)
    if (!handlers) return
    for (const handler of handlers) {
      handler.handle(event)
    }
  }

  publishAll(events: DomainEvent[]): void {
    for (const event of events) {
      this.publish(event)
    }
  }

  clearSubscriptions(): void {
    this.handlers.clear()
  }
}
