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
const OPENROUTER_URL = 'https://openrouter.ai/api/v1'
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || ''

const LOCAL_MODELS = {
  general: 'qwen2.5-coder:14b',
  reasoning: 'deepseek-r1:14b',
  fast: 'llama3.1:8b',
  classification: 'mistral:7b',
  fallback: 'glm-4.7-flash:9b'
}

const CLOUD_MODEL = 'moonshotai/kimi-k2-6'

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
          console.error('❌ [FINOPS BLOCK] Modelo local falhou e forceLocal está ativo. Abortando para evitar custos.')
          throw new Error('LLM_LOCAL_UNAVAILABLE: O motor local falhou e o custo zero é obrigatório.')
        }
        this.localFailureCount++
        console.warn(`⚠️ Ollama falhou (${this.localFailureCount}/${this.MAX_LOCAL_FAILURES})`)
        if (this.localFailureCount >= this.MAX_LOCAL_FAILURES) {
          this.useLocal = false
          console.log('🔄 Switching to cloud model (Kimi K2.6)')
        }
      }
    }

    try {
      const response = await this.callOpenRouter(request)
      return { ...response, duration: Date.now() - startTime }
    } catch {
      console.error('❌ Both local and cloud models failed')
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
    if (!response.ok) throw new Error(`Ollama error: ${response.status}`)
    const data = await response.json()
    return {
      content: data.message?.content || '',
      model: data.model || model,
      tokensUsed: data.eval_count || 0,
      cost: 0
    }
  }

  private async callOpenRouter(request: LLMRequest): Promise<Omit<LLMResponse, 'duration'>> {
    const response = await fetch(`${OPENROUTER_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
        'X-Title': 'Secretaria.ai'
      },
      body: JSON.stringify({
        model: CLOUD_MODEL,
        messages: request.messages,
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 2048
      })
    })
    if (!response.ok) throw new Error(`OpenRouter error: ${response.status}`)
    const data = await response.json()
    const usage = data.usage || {}
    return {
      content: data.choices?.[0]?.message?.content || '',
      model: data.model || CLOUD_MODEL,
      tokensUsed: usage.total_tokens || 0,
      cost: this.calculateCost(usage)
    }
  }

  private calculateCost(usage: { prompt_tokens?: number; completion_tokens?: number }): number {
    const inputTokens = usage.prompt_tokens || 0
    const outputTokens = usage.completion_tokens || 0
    return (inputTokens / 1_000_000 * 0.7448) + (outputTokens / 1_000_000 * 4.655)
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
      console.log(`🧠 [ML Brain] Interação registrada para Tenant: ${log.tenantId} | Resultado: ${log.outcome}`)
      if (log.outcome === 'BOOKED') {
        console.log(`📈 [ML Brain] Reforço Positivo: Preparando threadHistory para vetorização (RAG).`)
      }
    } catch (error) {
      console.error(`❌ [ML Brain] Erro ao registrar interação ML:`, error)
    }
  }
}

export const llmRouter = new LLMRouter()
