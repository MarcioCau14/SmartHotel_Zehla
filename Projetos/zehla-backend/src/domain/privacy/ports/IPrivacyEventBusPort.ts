export interface PrivacyExpungeEvent {
  leadId: string
  tenantId: string
  occurredAt: Date
  operationHash: string
}

export interface IPrivacyEventBusPort {
  publishExpungeCompleted(event: PrivacyExpungeEvent): Promise<void>
}
