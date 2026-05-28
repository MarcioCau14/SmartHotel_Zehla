import { Result } from '../../../domain/shared/Result'
import { ILeadRepository } from '../ports/ILeadRepository'
import { IDuplicateDetectionService } from '../ports/IDuplicateDetectionService'

export interface IdentifyDuplicateInput {
  email?: string
  phone?: string
}

export interface IdentifyDuplicateOutput {
  isDuplicate: boolean
  existingLeadId?: string
}

export class IdentifyDuplicateUseCase {
  constructor(
    private leadRepo: ILeadRepository,
    private duplicateService: IDuplicateDetectionService
  ) {}

  async execute(input: IdentifyDuplicateInput): Promise<Result<IdentifyDuplicateOutput, string>> {
    if (!input.email && !input.phone) {
      return Result.fail('Forneça email ou telefone para verificação')
    }

    const isDup = await this.duplicateService.isDuplicate(input.email, input.phone)
    if (!isDup) {
      return Result.ok({ isDuplicate: false })
    }

    const existing = input.email
      ? await this.duplicateService.findByEmail(input.email)
      : await this.duplicateService.findByPhone(input.phone!)

    return Result.ok({
      isDuplicate: true,
      existingLeadId: existing?.id,
    })
  }
}
