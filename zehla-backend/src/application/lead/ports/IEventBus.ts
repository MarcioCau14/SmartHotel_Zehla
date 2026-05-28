import { DomainEvent } from '../../../domain/shared/DomainEvent'

export interface IEventBus {
  publish(event: DomainEvent): Promise<void>
  publishMany(events: DomainEvent[]): Promise<void>
}
