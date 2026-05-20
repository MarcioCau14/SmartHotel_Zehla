// ============================================================
// FREE LLM ROUTER — APIs GRATUITAS PARA DESENVOLVIMENTO
// ============================================================
// Prioridade: Ollama → Groq → Together → OpenRouter
// Em produção: substituir por Kimi K2.6 via OpenRouter
// ============================================================

import { LLMRequest, LLMResponse } from '@/types'
import { scanAndMaskPII, sanitizePrompt } from '@/lib/security/pii-scanner'

interface ProviderConfig {
  name: string
  url: string
  key: string
  model: string
  enabled: boolean
}

const providers: ProviderConfig[] = [
  {
    name: 'ollama',
    url: process.env.OLLAMA_URL || 'http://localhost:11434',
    key: '',
    model: process.env.OLLAMA_MODEL || 'qwen2.5-coder:14b',
    enabled: true
  },
  {
    name: 'groq',
    url: 'https://api.groq.com/openai/v1',
    key: process.env.GROQ_API_KEY || '',
    model: process.env.GROQ_MODEL || 'llama-3.1-70b-versatile',
    enabled: !!process.env.GROQ_API_KEY
  },
  {
    name: 'together',
    url: 'https://api.together.xyz/v1',
    key: process.env.TOGETHER_API_KEY || '',
    model: process.env.TOGETHER_MODEL || 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
    enabled: !!process.env.TOGETHER_API_KEY
  },
  {
    name: 'openrouter',
    url: 'https://openrouter.ai/api/v1',
    key: process.env.OPENROUTER_API_KEY || '',
    model: 'mistralai/mistral-7b-instruct:free',
    enabled: !!process.env.OPENROUTER_API_KEY
  },
  {
    name: 'nvidia',
    url: 'https://integrate.api.nvidia.com/v1',
    key: process.env.NVIDIA_API_KEY || '',
    model: process.env.NVIDIA_MODEL || 'meta/llama-3.1-405b-instruct',
    enabled: !!process.env.NVIDIA_API_KEY
  }
]

export class FreeLLMRouter {
  private currentProvider = 0
  private failureCounts = new Map<string, number>()
  private readonly MAX_FAILURES = 3

  async generate(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now()
    const errors: string[] = []

    // SECURITY: Sanitize and Mask PII
    const secureMessages = request.messages.map(msg => ({
      ...msg,
      content: scanAndMaskPII(sanitizePrompt(msg.content)).masked
    }))
    const secureRequest = { ...request, messages: secureMessages }

    // Tentar cada provider em ordem
    for (let i = 0; i < providers.length; i++) {
      const provider = providers[(this.currentProvider + i) % providers.length]

      if (!provider.enabled) continue
      if ((this.failureCounts.get(provider.name) || 0) >= this.MAX_FAILURES) continue

      try {
        console.log(`🤖 Tentando ${provider.name}...`)
        const response = await this.callProvider(provider, secureRequest)
        this.failureCounts.set(provider.name, 0)
        this.currentProvider = providers.indexOf(provider)
        return { ...response, duration: Date.now() - startTime }
      } catch (error: any) {
        console.warn(`⚠️ ${provider.name} falhou: ${error.message}`)
        this.failureCounts.set(provider.name, (this.failureCounts.get(provider.name) || 0) + 1)
        errors.push(`${provider.name}: ${error.message}`)
      }
    }

    throw new Error(`Todas as APIs falharam: ${errors.join('; ')}`)
  }

  private async callProvider(provider: ProviderConfig, request: LLMRequest): Promise<Omit<LLMResponse, 'duration'>> {
    switch (provider.name) {
      case 'ollama':
        return this.callOllama(provider, request)
      case 'groq':
        return this.callGroq(provider, request)
      case 'together':
        return this.callTogether(provider, request)
      case 'openrouter':
        return this.callOpenRouter(provider, request)
      case 'nvidia':
        return this.callNvidia(provider, request)
      default:
        throw new Error(`Provider desconhecido: ${provider.name}`)
    }
  }

  private async callNvidia(provider: ProviderConfig, request: LLMRequest): Promise<Omit<LLMResponse, 'duration'>> {
    const res = await fetch(`${provider.url}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.key}`
      },
      body: JSON.stringify({
        model: provider.model,
        messages: request.messages,
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 2048
      })
    })
    if (!res.ok) throw new Error(`NVIDIA ${res.status}`)
    const data = await res.json()
    return {
      content: data.choices?.[0]?.message?.content || '',
      model: data.model || provider.model,
      tokensUsed: data.usage?.total_tokens || 0,
      cost: 0
    }
  }

  private async callOllama(provider: ProviderConfig, request: LLMRequest): Promise<Omit<LLMResponse, 'duration'>> {
    const res = await fetch(`${provider.url}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: provider.model,
        messages: request.messages,
        stream: false,
        options: { temperature: request.temperature || 0.7, num_predict: request.maxTokens || 2048 }
      })
    })
    if (!res.ok) throw new Error(`Ollama ${res.status}`)
    const data = await res.json()
    return {
      content: data.message?.content || '',
      model: data.model || provider.model,
      tokensUsed: data.eval_count || 0,
      cost: 0
    }
  }

  private async callGroq(provider: ProviderConfig, request: LLMRequest): Promise<Omit<LLMResponse, 'duration'>> {
    const res = await fetch(`${provider.url}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.key}`
      },
      body: JSON.stringify({
        model: provider.model,
        messages: request.messages,
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 2048
      })
    })
    if (!res.ok) throw new Error(`Groq ${res.status}`)
    const data = await res.json()
    return {
      content: data.choices?.[0]?.message?.content || '',
      model: data.model || provider.model,
      tokensUsed: data.usage?.total_tokens || 0,
      cost: 0
    }
  }

  private async callTogether(provider: ProviderConfig, request: LLMRequest): Promise<Omit<LLMResponse, 'duration'>> {
    const res = await fetch(`${provider.url}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.key}`
      },
      body: JSON.stringify({
        model: provider.model,
        messages: request.messages,
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 2048
      })
    })
    if (!res.ok) throw new Error(`Together ${res.status}`)
    const data = await res.json()
    return {
      content: data.choices?.[0]?.text || '',
      model: data.model || provider.model,
      tokensUsed: data.usage?.total_tokens || 0,
      cost: 0
    }
  }

  private async callOpenRouter(provider: ProviderConfig, request: LLMRequest): Promise<Omit<LLMResponse, 'duration'>> {
    const res = await fetch(`${provider.url}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.key}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'ZEHLA SmartHotel'
      },
      body: JSON.stringify({
        model: provider.model,
        messages: request.messages,
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 2048
      })
    })
    if (!res.ok) throw new Error(`OpenRouter ${res.status}`)
    const data = await res.json()
    return {
      content: data.choices?.[0]?.message?.content || '',
      model: data.model || provider.model,
      tokensUsed: data.usage?.total_tokens || 0,
      cost: 0
    }
  }

  getStatus() {
    return providers.map(p => ({
      name: p.name,
      enabled: p.enabled,
      failures: this.failureCounts.get(p.name) || 0,
      model: p.model
    }))
  }
}

export const freeLLMRouter = new FreeLLMRouter()
