import axios from 'axios';

/**
 * LLM Router — Unified interface for AI model calls
 * 
 * MANTRA: CUSTO ZERO — apenas modelos gratuitos via OpenRouter
 * 
 * Architecture:
 * 1. Primary: Kimi K2.6 (Moonshot) — melhor para português
 * 2. Secondary: Qwen 2.5 72B — excelente alternativa gratuita
 * 3. Tertiary: Llama 3.3 70B — fallback robusto
 * 4. Last resort: Local rule-based responses (zero custo)
 * 
 * Token cost tracking integrates with FinOps Breaker
 * Todos os modelos usados são FREE TIER no OpenRouter
 */

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMRequest {
  model?: 'kimi-k2.6' | 'reasoning' | 'general' | 'fast';
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
  tenantId?: string;
}

export interface LLMResponse {
  content: string;
  tokensUsed: number;
  cost: number; // Sempre 0 (modelos gratuitos)
  model: string;
  latency: number;
}

// CUSTO ZERO — todos os modelos são free tier
const COST_PER_1K_TOKENS: Record<string, number> = {
  'kimi-k2.6': 0,
  'reasoning': 0,
  'general': 0,
  'fast': 0,
  'local_fallback': 0,
};

// Apenas modelos FREE TIER no OpenRouter
const MODELS: Record<string, { provider: string; modelId: string; maxTokens: number }> = {
  'kimi-k2.6': { provider: 'openrouter', modelId: 'moonshot/moonshot-v1-128k', maxTokens: 4096 },
  'reasoning': { provider: 'openrouter', modelId: 'qwen/qwen-2.5-72b-instruct', maxTokens: 8192 },
  'general': { provider: 'openrouter', modelId: 'qwen/qwen-2.5-72b-instruct', maxTokens: 4096 },
  'fast': { provider: 'openrouter', modelId: 'meta-llama/llama-3.3-70b-instruct', maxTokens: 2048 },
};

// Ordem de fallback: se o modelo principal falhar, tenta o próximo
const FALLBACK_ORDER: Record<string, string[]> = {
  'kimi-k2.6': ['reasoning', 'general', 'fast'],
  'reasoning': ['general', 'fast', 'kimi-k2.6'],
  'general': ['fast', 'reasoning', 'kimi-k2.6'],
  'fast': ['general', 'reasoning', 'kimi-k2.6'],
};

async function callOpenRouter(modelId: string, messages: LLMMessage[], maxTokens: number, temperature: number = 0.7): Promise<{ content: string; tokensUsed: number }> {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.LLM_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not configured — usando fallback local');
  }

  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: modelId,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      max_tokens: maxTokens,
      temperature,
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
    { keywords: ['preço', 'preco', 'valor', 'quanto custa'], response: 'Nossos quartos variam de acordo com a temporada. Posso verificar a disponibilidade e os valores para suas datas!' },
    { keywords: ['reserva', 'reservar', 'booking'], response: 'Claro! Para fazer uma reserva, preciso saber: datas de entrada e saída, número de hóspedes e tipo de quarto preferido.' },
    { keywords: ['cancelar', 'cancelamento'], response: 'Entendo. Para cancelar sua reserva, preciso do código da reserva. Nosso policy: cancelamento gratuito até 48h antes do check-in.' },
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
  const temperature = request.temperature ?? 0.7;
  const maxTokens = request.maxTokens;

  // Lista de modelos para tentar (pedido + fallbacks)
  const modelsToTry = [modelKey, ...(FALLBACK_ORDER[modelKey] || [])];

  let lastError: Error | null = null;

  for (const tryModelKey of modelsToTry) {
    const modelConfig = MODELS[tryModelKey];
    if (!modelConfig) continue;

    const actualMaxTokens = maxTokens || modelConfig.maxTokens;

    try {
      const result = await callOpenRouter(modelConfig.modelId, request.messages, actualMaxTokens, temperature);
      const latency = Date.now() - startTime;

      return {
        content: result.content,
        tokensUsed: result.tokensUsed,
        cost: 0, // CUSTO ZERO — modelos gratuitos
        model: tryModelKey,
        latency,
      };
    } catch (error) {
      lastError = error as Error;
      console.warn(`[LLM Router] Modelo ${tryModelKey} falhou:`, (error as Error).message);
      // Continua para o próximo fallback
    }
  }

  // Todos os modelos remotos falharam → fallback local
  console.warn('[LLM Router] Todos os modelos remotos falharam, usando regras locais');
  const result = await callLocalFallback(request.messages);
  const latency = Date.now() - startTime;

  return {
    content: result.content,
    tokensUsed: result.tokensUsed,
    cost: 0,
    model: 'local_fallback',
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
