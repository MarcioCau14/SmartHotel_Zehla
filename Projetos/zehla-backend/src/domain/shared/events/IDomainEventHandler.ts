import { DomainEvent } from '../../shared/DomainEvent'

export interface IDomainEventHandler {
  handle(event: DomainEvent): void
}
