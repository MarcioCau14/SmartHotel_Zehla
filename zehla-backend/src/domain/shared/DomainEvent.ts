export interface DomainEvent {
  aggregateId: string
  eventName: string
  occurredAt: Date
  payload: Record<string, unknown>
}

export type DomainEventClass<T extends DomainEvent = DomainEvent> = new (...args: any[]) => T
