import { DomainEvent } from '../DomainEvent'

export interface IDomainEventHandler {
  handle(event: DomainEvent): void
}
