import { DomainEvent } from '../../../domain/shared/DomainEvent'
import { IDomainEventHandler } from '../../../domain/shared/events/IDomainEventHandler'

export class TriggerWebhookOnHandoffHandler implements IDomainEventHandler {
  public readonly eventosRecebidos: DomainEvent[] = []

  handle(event: DomainEvent): void {
    this.eventosRecebidos.push(event)
  }
}
