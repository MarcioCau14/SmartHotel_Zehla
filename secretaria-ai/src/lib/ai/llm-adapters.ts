/**
 * ZÉLLA — LLM REST Adapters for 2026 Providers
 * Direct HTTP calls to bypass SDK network dependencies and allow switchable mock/real execution.
 */

export interface AdapterResponse {
  content: string;
  inputTokens: number;
  outputTokens: number;
}

export interface AdapterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function fetchWithRetry(url: string, options: RequestInit, retries = 1): Promise<Response> {
  try {
    const response = await fetch(url, options);
    if (!response.ok && retries > 0) {
      console.warn(`[LLMAdapter] Fetch failed with status ${response.status}. Retrying...`);
      return await fetchWithRetry(url, options, retries - 1);
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      console.warn(`[LLMAdapter] Fetch network error: ${error}. Retrying...`);
      return await fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

/**
 * OpenAI-Compatible Providers (OpenAI, OpenRouter, Groq, DeepSeek, Moonshot/Kimi, Zhipu/GLM)
 */
export async function callOpenAICompatible(params: {
  apiKey: string;
  baseUrl: string;
  model: string;
  messages: AdapterMessage[];
  temperature: number;
  maxTokens: number;
  isOpenRouter?: boolean;
}): Promise<AdapterResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${params.apiKey}`,
  };

  if (params.isOpenRouter) {
    headers['HTTP-Referer'] = 'https://zehla.com.br';
    headers['X-Title'] = 'ZEHLA SmartHotel';
  }

  const body = JSON.stringify({
    model: params.model,
    messages: params.messages,
    temperature: params.temperature,
    max_tokens: params.maxTokens,
  });

  const url = `${params.baseUrl.replace(/\/$/, '')}/chat/completions`;
  const response = await fetchWithRetry(url, {
    method: 'POST',
    headers,
    body,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`[LLMAdapter] OpenAI-compatible provider error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';
  const inputTokens = data.usage?.prompt_tokens || Math.ceil(JSON.stringify(params.messages).length / 4);
  const outputTokens = data.usage?.completion_tokens || Math.ceil(content.length / 4);

  return { content, inputTokens, outputTokens };
}

/**
 * Anthropic Messages API
 */
export async function callAnthropic(params: {
  apiKey: string;
  model: string;
  messages: AdapterMessage[];
  temperature: number;
  maxTokens: number;
}): Promise<AdapterResponse> {
  const systemMessage = params.messages.find(m => m.role === 'system');
  const userMessages = params.messages.filter(m => m.role !== 'system');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-api-key': params.apiKey,
    'anthropic-version': '2023-06-01',
  };

  const body = JSON.stringify({
    model: params.model,
    max_tokens: params.maxTokens,
    messages: userMessages.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    })),
    system: systemMessage?.content,
    temperature: params.temperature,
  });

  const url = 'https://api.anthropic.com/v1/messages';
  const response = await fetchWithRetry(url, {
    method: 'POST',
    headers,
    body,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`[LLMAdapter] Anthropic provider error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const content = data.content?.[0]?.text || '';
  const inputTokens = data.usage?.input_tokens || Math.ceil(JSON.stringify(params.messages).length / 4);
  const outputTokens = data.usage?.output_tokens || Math.ceil(content.length / 4);

  return { content, inputTokens, outputTokens };
}

/**
 * Google Gemini GenerateContent API
 */
export async function callGemini(params: {
  apiKey: string;
  model: string;
  messages: AdapterMessage[];
  temperature: number;
  maxTokens: number;
}): Promise<AdapterResponse> {
  const systemMessage = params.messages.find(m => m.role === 'system');
  const otherMessages = params.messages.filter(m => m.role !== 'system');

  const contents = otherMessages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const body: any = {
    contents,
    generationConfig: {
      temperature: params.temperature,
      maxOutputTokens: params.maxTokens,
    },
  };

  if (systemMessage) {
    body.systemInstruction = {
      parts: [{ text: systemMessage.content }],
    };
  }

  // Map shorter ID (like gemini-flash) to official Google model names
  let officialModel = params.model;
  if (officialModel === 'gemini-flash') {
    officialModel = 'gemini-2.5-flash';
  } else if (officialModel === 'gemini-pro') {
    officialModel = 'gemini-2.5-pro';
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${officialModel}:generateContent?key=${params.apiKey}`;
  const response = await fetchWithRetry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`[LLMAdapter] Gemini provider error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const inputTokens = data.usageMetadata?.promptTokenCount || Math.ceil(JSON.stringify(params.messages).length / 4);
  const outputTokens = data.usageMetadata?.candidatesTokenCount || Math.ceil(content.length / 4);

  return { content, inputTokens, outputTokens };
}
