import { LLMRequest, LLMResponse } from '../../types'

export interface MLInteractionLog {
  tenantId: string;
  leadId: string;
  threadHistory: Array<{ role: string, content: string }>;
  outcome: 'BOOKED' | 'LOST' | 'PENDING';
  confidenceScore: number;
  vectorsGenerated: boolean;
}

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434'
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || ''

const getOpenRouterUrl = () => {
  const useHeadroom = process.env.HEADROOM_PROXY_ENABLED === 'true';
  const headroomUrl = process.env.HEADROOM_PROXY_URL_V1 || 'http://localhost:8787/v1';
  return useHeadroom ? headroomUrl : 'https://openrouter.ai/api/v1';
};


const LOCAL_MODELS = {
  general: 'qwen2.5-coder:14b',
  reasoning: 'deepseek-r1:14b',
  fast: 'llama3.1:8b',
  classification: 'mistral:7b',
  fallback: 'glm-4.7-flash:9b'
}

interface CloudModelConfig {
  model: string
  costPerMInput: number
  costPerMOutput: number
}

const AGENT_CLOUD_MODELS: Record<string, CloudModelConfig> = {
  'ze-sales':     { model: 'moonshotai/kimi-k2-6',               costPerMInput: 0.7448, costPerMOutput: 4.655 },
  'ze-marketer':  { model: 'openai/gpt-4o-mini',                 costPerMInput: 0.15,   costPerMOutput: 0.60 },
  'ze-analyst':   { model: 'moonshotai/kimi-k2-6',               costPerMInput: 0.7448, costPerMOutput: 4.655 },
  'zmg-receive':  { model: 'deepseek/deepseek-chat-v3-0324',     costPerMInput: 0,      costPerMOutput: 0 },
  'zmg-classify': { model: 'deepseek/deepseek-chat-v3-0324',     costPerMInput: 0,      costPerMOutput: 0 },
}

const DEFAULT_CLOUD: CloudModelConfig = {
  model: 'moonshotai/kimi-k2-6',
  costPerMInput: 0.7448,
  costPerMOutput: 4.655,
}

export class LLMRouter {
  private useLocal: boolean = true
  private localFailureCount: number = 0
  private readonly MAX_LOCAL_FAILURES = 3

  async generate(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now()

    if (this.useLocal || request.forceLocal) {
      try {
        const response = await this.callOllama(request)
        this.localFailureCount = 0
        return { ...response, duration: Date.now() - startTime }
      } catch (error) {
        if (request.forceLocal) {
          console.error('[FINOPS BLOCK] Modelo local falhou e forceLocal está ativo. Abortando para evitar custos.')
          throw new Error('LLM_LOCAL_UNAVAILABLE: O motor local falhou e o custo zero é obrigatório.')
        }
        this.localFailureCount++
        console.warn(`Ollama falhou (${this.localFailureCount}/${this.MAX_LOCAL_FAILURES})`)
        if (this.localFailureCount >= this.MAX_LOCAL_FAILURES) {
          this.useLocal = false
          const agentLabel = request.agentType || 'general'
          const cloudCfg = AGENT_CLOUD_MODELS[agentLabel] || DEFAULT_CLOUD
          console.log(`Switching to cloud: ${cloudCfg.model} (agent: ${agentLabel})`)
        }
      }
    }

    try {
      const response = await this.callOpenRouter(request)
      return { ...response, duration: Date.now() - startTime }
    } catch (cloudError) {
      console.error('Both local and cloud models failed')
      throw new Error('LLM_UNAVAILABLE: Nenhum modelo disponível no momento')
    }
  }

  private async callOllama(request: LLMRequest): Promise<Omit<LLMResponse, 'duration'>> {
    const model = LOCAL_MODELS[request.model as keyof typeof LOCAL_MODELS] || LOCAL_MODELS.general
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: request.messages,
        stream: false,
        options: {
          temperature: request.temperature || 0.7,
          num_predict: request.maxTokens || 2048
        }
      })
    })
    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`)
    }
    const data = await response.json()
    return {
      content: data.message?.content || '',
      model: data.model || model,
      tokensUsed: data.eval_count || 0,
      cost: 0
    }
  }

  private async callOpenRouter(request: LLMRequest): Promise<Omit<LLMResponse, 'duration'>> {
    const agentLabel = request.agentType || 'general'
    const cloudCfg = AGENT_CLOUD_MODELS[agentLabel] || DEFAULT_CLOUD
    const modelToUse = cloudCfg.model

    const response = await fetch(`${getOpenRouterUrl()}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
        'X-Title': 'ZEHLA SmartHotel'
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: request.messages,
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 2048
      })
    })
    if (!response.ok) {
      throw new Error(`OpenRouter error: ${response.status}`)
    }
    const data = await response.json()
    const usage = data.usage || {}
    return {
      content: data.choices?.[0]?.message?.content || '',
      model: data.model || modelToUse,
      tokensUsed: usage.total_tokens || 0,
      cost: this.calculateCost(usage, cloudCfg)
    }
  }

  private calculateCost(
    usage: { prompt_tokens?: number; completion_tokens?: number },
    config: CloudModelConfig
  ): number {
    const inputTokens = usage.prompt_tokens || 0
    const outputTokens = usage.completion_tokens || 0
    return (inputTokens / 1_000_000 * config.costPerMInput) +
           (outputTokens / 1_000_000 * config.costPerMOutput)
  }

  async forceLocal(request: LLMRequest): Promise<LLMResponse> {
    this.useLocal = true
    this.localFailureCount = 0
    return this.generate(request)
  }

  async forceCloud(request: LLMRequest): Promise<LLMResponse> {
    this.useLocal = false
    const startTime = Date.now()
    const response = await this.callOpenRouter(request)
    return { ...response, duration: Date.now() - startTime }
  }

  async recordMLInteraction(log: MLInteractionLog): Promise<void> {
    try {
      console.log(`[Zehla ML Brain] Interação registrada para Tenant: ${log.tenantId} | Resultado: ${log.outcome}`)
      if (log.outcome === 'BOOKED') {
        console.log(`[Zehla ML Brain] Reforço Positivo: Preparando threadHistory para vetorização (RAG).`)
      }
    } catch (error) {
      console.error(`[Zehla ML Brain] Erro ao registrar interação ML:`, error)
    }
  }
}

export const llmRouter = new LLMRouter()
