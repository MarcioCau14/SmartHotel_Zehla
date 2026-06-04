import { Result } from '../../../shared/Result'
import { ICRMRepositoryPort } from '../../../domain/crm/ports/ICRMRepositoryPort'
import { SocialInteraction } from '../../../domain/crm/models/SocialInteraction'
import { SocialSellerService, SocialIntentAnalyzer } from '../../../domain/crm/services/SocialSellerService'

export interface ProcessSocialInteractionInput {
  readonly platform: 'INSTAGRAM' | 'FACEBOOK' | 'WHATSAPP_STATUS'
  readonly username: string
  readonly content: string
  readonly timestamp: number
  readonly isDirectMessage: boolean
}

export class ProcessSocialInteractionUseCase {
  constructor(
    private readonly leadRepo: ICRMRepositoryPort,
    private readonly analyzeIntent: SocialIntentAnalyzer,
  ) {}

  async execute(input: ProcessSocialInteractionInput): Promise<Result<void, Error>> {
    const interactionResult = SocialInteraction.create(input)
    if (interactionResult.isFail) {
      return Result.fail(interactionResult.error)
    }

    const service = new SocialSellerService(this.analyzeIntent)
    const leadResult = service.execute(interactionResult.value)
    if (leadResult.isFail) {
      return Result.fail(leadResult.error)
    }

    const saveResult = await this.leadRepo.salvarLead(leadResult.value)
    if (saveResult.isFail) {
      return Result.fail(saveResult.error)
    }

    return Result.ok(undefined)
  }
}
