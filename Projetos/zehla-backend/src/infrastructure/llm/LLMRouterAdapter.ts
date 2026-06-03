import { Result } from '../../shared/Result'
import { ILMProviderPort, GenerateParams } from '../../domain/crm/ports/ILMProviderPort'
import { llmRouter as defaultLLMRouter } from '../../lib/ai/llm-router'

export class LLMRouterAdapter implements ILMProviderPort {
  constructor(private readonly router: typeof defaultLLMRouter = defaultLLMRouter) {}

  async generate(params: GenerateParams): Promise<Result<string, Error>> {
    try {
      const response = await this.router.generate({
        model: 'general',
        messages: [
          { role: 'system', content: params.systemPrompt },
          { role: 'user', content: params.userPrompt },
        ],
        temperature: params.temperature ?? 0.7,
        maxTokens: params.maxTokens ?? 2048,
      })
      return Result.ok(response.content)
    } catch (err) {
      return Result.fail(err instanceof Error ? err : new Error(String(err)))
    }
  }
}
