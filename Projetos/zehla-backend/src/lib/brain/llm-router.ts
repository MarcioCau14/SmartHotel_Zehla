import axios from 'axios';

/**
 * LLM Router — Unified interface for AI model calls
 * 
 * Architecture:
 * 1. Primary: Kimi K2.6 (via OpenRouter or direct API)
 * 2. Fallback: OpenAI GPT-4o-mini (cheaper, faster)
 * 3. Last resort: Local rule-based responses
 * 
 * Token cost tracking integrates with FinOps Breaker
 */

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMRequest {
  model?: 'kimi-k2.6' | 'gpt-4o-mini' | 'reasoning' | 'general';
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
  tenantId?: string;
}

export interface LLMResponse {
  content: string;
  tokensUsed: number;
  cost: number;
  model: string;
  latency: number;
}

const COST_PER_1K_TOKENS: Record<string, number> = {
  'kimi-k2.6': 0.02,
  'gpt-4o-mini': 0.01,
  'reasoning': 0.03,
  'general': 0.02,
};

const MODELS: Record<string, { provider: string; modelId: string; maxTokens: number }> = {
  'kimi-k2.6': { provider: 'openrouter', modelId: 'moonshot/moonshot-v1-128k', maxTokens: 4096 },
  'gpt-4o-mini': { provider: 'openai', modelId: 'gpt-4o-mini', maxTokens: 4096 },
  'reasoning': { provider: 'openrouter', modelId: 'moonshot/moonshot-v1-128k', maxTokens: 8192 },
  'general': { provider: 'openrouter', modelId: 'moonshot/moonshot-v1-8k', maxTokens: 2048 },
};

async function callOpenRouter(modelId: string, messages: LLMMessage[], maxTokens: number): Promise<{ content: string; tokensUsed: number }> {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.LLM_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not configured');
  }

  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: modelId,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      max_tokens: maxTokens,
      temperature: 0.7,
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://zehla.com.br',
        'X-Title': 'ZEHLA SmartHotel',
      },
      timeout: 30000,
    }
  );

  const choice = response.data.choices?.[0];
  const usage = response.data.usage;

  return {
    content: choice?.message?.content || '',
    tokensUsed: usage?.total_tokens || 0,
  };
}

async function callOpenAI(modelId: string, messages: LLMMessage[], maxTokens: number): Promise<{ content: string; tokensUsed: number }> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: modelId,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      max_tokens: maxTokens,
      temperature: 0.7,
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    }
  );

  const choice = response.data.choices?.[0];
  const usage = response.data.usage;

  return {
    content: choice?.message?.content || '',
    tokensUsed: usage?.total_tokens || 0,
  };
}

async function callLocalFallback(messages: LLMMessage[]): Promise<{ content: string; tokensUsed: number }> {
  const userMessage = messages.find(m => m.role === 'user')?.content || '';
  const lower = userMessage.toLowerCase();

  const rules: Array<{ keywords: string[]; response: string }> = [
    { keywords: ['check-in', 'check in', 'entrada', 'horario'], response: 'O check-in é a partir das 14h e o check-out até às 12h. Precisa de algo mais?' },
    { keywords: ['wifi', 'internet', 'wi-fi'], response: 'Sim, oferecemos Wi-Fi gratuito de alta velocidade em todas as áreas da pousada!' },
    { keywords: ['estacionamento', 'parking', 'carro'], response: 'Temos estacionamento gratuito e seguro para todos os hóspedes.' },
    { keywords: ['cafe', 'café', 'manha', 'manhã'], response: 'O café da manhã está incluído na diária e é servido das 7h às 10h.' },
    { keywords: ['pet', 'animal', 'cachorro', 'gato'], response: 'Aceitamos pets de pequeno porte! Consulte-nos para mais detalhes.' },
    { keywords: ['pix', 'pagamento', 'pagar'], response: 'Aceitamos PIX, cartão de crédito e débito. O PIX é processado na hora!' },
    { keywords: ['piscina', 'pool'], response: 'Sim, temos piscina! Ela fica aberta das 8h às 20h.' },
    { keywords: ['desconto', 'promocao', 'promoção'], response: 'Reservando direto conosco você já economiza! Sem taxas de OTA. Quer saber os valores?' },
    { keywords: ['ola', 'oi', 'bom dia', 'boa tarde', 'boa noite'], response: 'Olá! Que bom ter você aqui! Como posso ajudar com sua reserva?' },
  ];

  for (const rule of rules) {
    if (rule.keywords.some(k => lower.includes(k))) {
      return { content: rule.response, tokensUsed: 50 };
    }
  }

  return {
    content: 'Obrigado pela sua mensagem! Nossa equipe irá responder em breve. Enquanto isso, que tal conhecer nossas tarifas especiais reservando direto conosco?',
    tokensUsed: 80,
  };
}

export async function generate(request: LLMRequest): Promise<LLMResponse> {
  const startTime = Date.now();
  const modelKey = request.model || 'general';
  const modelConfig = MODELS[modelKey] || MODELS['general'];
  const maxTokens = request.maxTokens || modelConfig.maxTokens;

  let result: { content: string; tokensUsed: number };
  let actualModel = modelKey;

  try {
    // Try primary provider
    if (modelConfig.provider === 'openrouter') {
      result = await callOpenRouter(modelConfig.modelId, request.messages, maxTokens);
    } else if (modelConfig.provider === 'openai') {
      result = await callOpenAI(modelConfig.modelId, request.messages, maxTokens);
    } else {
      throw new Error('Unknown provider');
    }
  } catch (primaryError) {
    console.warn(`[LLM Router] Primary model ${modelKey} failed, trying fallback:`, (primaryError as Error).message);

    try {
      // Fallback to GPT-4o-mini
      if (modelConfig.provider !== 'openai') {
        const fallbackConfig = MODELS['gpt-4o-mini'];
        result = await callOpenAI(fallbackConfig.modelId, request.messages, maxTokens);
        actualModel = 'gpt-4o-mini';
      } else {
        throw primaryError;
      }
    } catch (fallbackError) {
      console.warn('[LLM Router] Fallback failed, using local rules:', (fallbackError as Error).message);
      result = await callLocalFallback(request.messages);
      actualModel = 'local_fallback';
    }
  }

  const latency = Date.now() - startTime;
  const costPer1K = COST_PER_1K_TOKENS[modelKey] || COST_PER_1K_TOKENS['general'];
  const cost = (result.tokensUsed / 1000) * costPer1K;

  return {
    content: result.content,
    tokensUsed: result.tokensUsed,
    cost,
    model: actualModel,
    latency,
  };
}

/**
 * Estimate token count for a text (rough approximation)
 * 1 token ≈ 4 characters for Portuguese
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
