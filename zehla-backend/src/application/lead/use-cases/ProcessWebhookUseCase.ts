import { Result } from '../../../domain/shared/Result'
import { LeadEventType } from '../../../domain/lead/LeadEventType'
import { ILeadRepository } from '../ports/ILeadRepository'
import { ILeadEventRepository } from '../ports/ILeadEventRepository'
import { IEventBus } from '../ports/IEventBus'
import { TrackInteractionUseCase } from './TrackInteractionUseCase'

const WEBHOOK_EVENT_MAP: Record<string, LeadEventType> = {
  email_opened: LeadEventType.EMAIL_OPEN,
  link_clicked: LeadEventType.LINK_CLICK,
  whatsapp_reply: LeadEventType.WHATSAPP_REPLY,
  whatsapp_delivered: LeadEventType.WHATSAPP_DELIVERED,
  trial_started: LeadEventType.TRIAL_STARTED,
  payment_made: LeadEventType.PAYMENT_MADE,
  conversion: LeadEventType.CONVERSION,
}

export interface ProcessWebhookInput {
  email?: string
  eventType: string
  externalId?: string
  metadata?: Record<string, unknown>
}

export interface ProcessWebhookOutput {
  status: 'processed' | 'ignored'
  mappedTo?: string
}

export class ProcessWebhookUseCase {
  constructor(
    private leadRepo: ILeadRepository,
    private eventRepo: ILeadEventRepository,
    private eventBus: IEventBus
  ) {}

  async execute(input: ProcessWebhookInput): Promise<Result<ProcessWebhookOutput, string>> {
    if (!input.email) {
      return Result.fail('Email não encontrado no payload')
    }

    const mappedType = WEBHOOK_EVENT_MAP[input.eventType]
    if (!mappedType) {
      return Result.ok({ status: 'ignored', mappedTo: undefined })
    }

    const lead = await this.leadRepo.findByEmail(input.email)
    if (!lead) {
      return Result.fail('Lead não encontrado para o email fornecido')
    }

    const result = await new TrackInteractionUseCase(
      this.leadRepo,
      this.eventRepo,
      this.eventBus
    ).execute({
      leadId: lead.id,
      eventType: mappedType,
      metadata: { ...input.metadata, externalId: input.externalId },
    })

    if (result.isFail) return Result.fail(result.error)

    return Result.ok({
      status: 'processed',
      mappedTo: mappedType,
    })
  }
}
