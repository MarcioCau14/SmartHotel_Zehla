import { IDomainEventHandler } from '../../../domain/shared/events/IDomainEventHandler'
import { DomainEvent } from '../../../domain/shared/DomainEvent'
import { ZdrPrivacyModule } from '../../../domain/security/services/ZdrPrivacyModule'

export class LeadBlacklistedHandler implements IDomainEventHandler {
  constructor(private readonly zdrPrivacyModule: ZdrPrivacyModule) {}

  async handle(event: DomainEvent): Promise<void> {
    if (event.eventName !== 'LeadBlacklistedEvent') {
      return
    }

    const leadId = event.aggregateId
    const { email } = event.payload as { email?: string | null }

    console.log(`[Event Handler] LeadBlacklistedEvent recebido para o Lead ${leadId}. Iniciando processamento ZDR (Zero Data Retention).`)

    const result = await this.zdrPrivacyModule.expunge(leadId, email)

    if (result.isFail) {
      console.error(`[Event Handler] Falha ao processar expurgo ZDR para o Lead ${leadId}:`, result.error.message)
    } else {
      console.log(`[Event Handler] Processamento ZDR concluído e dados expurgados com sucesso para o Lead ${leadId}.`)
    }
  }
}
