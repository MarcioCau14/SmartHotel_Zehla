import { Result } from '../../../shared/Result'

export interface GenerateParams {
  systemPrompt: string
  userPrompt: string
  temperature?: number
  maxTokens?: number
}

export interface ILMProviderPort {
  generate(params: GenerateParams): Promise<Result<string, Error>>
}
