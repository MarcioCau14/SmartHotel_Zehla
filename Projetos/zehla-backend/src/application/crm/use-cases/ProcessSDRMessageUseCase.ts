import { Result } from '../../../shared/Result'
import { SlotFillingState } from '../../../domain/crm/models/SDRSlotFilling'
import { ISlotExtractorPort } from '../../../domain/crm/ports/ISlotExtractorPort'

export interface ProcessSDRMessageInput {
  readonly message: string
  readonly sessionId: string
  readonly leadId: string
  readonly existingState?: SlotFillingState
}

export interface ProcessSDRMessageOutput {
  readonly state: SlotFillingState
  readonly nextPrompt: string
  readonly progress: number
}

export class ProcessSDRMessageUseCase {
  constructor(private readonly extractor: ISlotExtractorPort) {}

  async execute(input: ProcessSDRMessageInput): Promise<Result<ProcessSDRMessageOutput, Error>> {
    if (!input.message || input.message.trim().length === 0) {
      return Result.fail(new Error('Mensagem do hóspede não pode ser vazia'))
    }
    if (!input.sessionId || input.sessionId.trim().length === 0) {
      return Result.fail(new Error('ID da sessão SDR é obrigatório'))
    }
    if (!input.leadId || input.leadId.trim().length === 0) {
      return Result.fail(new Error('ID do lead é obrigatório'))
    }

    const extraction = await this.extractor.extractSlots(input.message)
    if (extraction.isFail) {
      return Result.fail(extraction.error)
    }

    const baseState = input.existingState
      ?? SlotFillingState.create(input.sessionId, input.leadId)

    let state = baseState
    for (const slot of extraction.value) {
      state = state.fillSlot(slot.slot, slot.value, slot.confidence)
    }

    return Result.ok({
      state,
      nextPrompt: state.nextPromptType,
      progress: state.completionPercentage,
    })
  }
}
