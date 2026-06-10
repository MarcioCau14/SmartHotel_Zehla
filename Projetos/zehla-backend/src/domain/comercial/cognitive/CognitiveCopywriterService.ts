import { Result } from '../../../shared/Result'
import { ILMProviderPort } from '../../crm/ports/ILMProviderPort'
import { GenerateFollowUpSignature, GenerateFollowUpInput } from './GenerateFollowUpSignature'

export class CognitiveCopywriterService {
  constructor(private readonly llmProvider: ILMProviderPort) {}

  async generate(input: GenerateFollowUpInput): Promise<Result<string, Error>> {
    try {
      const signature = new GenerateFollowUpSignature(input)
      const prompt = signature.buildFullPrompt()

      const llmResult = await this.llmProvider.generate({
        systemPrompt: prompt.systemPrompt,
        userPrompt: `${prompt.userPrompt}\n\n${prompt.outputFormat}`,
        temperature: 0.7,
      })

      if (llmResult.isFail) {
        return Result.fail(llmResult.error)
      }

      return Result.ok(llmResult.value)
    } catch (error: any) {
      return Result.fail(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
