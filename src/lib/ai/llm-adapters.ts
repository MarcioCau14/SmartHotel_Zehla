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
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  /** ID da tool call (para mensagens de role 'tool') */
  tool_call_id?: string;
  /** Tool calls do assistant (para mensagens que invocam ferramentas) */
  tool_calls?: AdapterToolCallDef[];
}

/** Definição de tool no formato OpenAI-compatible (usado por Groq, DeepSeek, OpenRouter, etc.) */
export interface AdapterToolDef {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, unknown>;
      required?: string[];
    };
  };
}

/** Tool call retornada pelo LLM */
export interface AdapterToolCallDef {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string; // JSON string
  };
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
  jsonMode?: boolean;
}): Promise<AdapterResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${params.apiKey}`,
  };

  if (params.isOpenRouter) {
    headers['HTTP-Referer'] = 'https://zehla.com.br';
    headers['X-Title'] = 'ZEHLA SmartHotel';
  }

  const payload: any = {
    model: params.model,
    messages: params.messages,
    temperature: params.temperature,
    max_tokens: params.maxTokens,
  };

  if (params.jsonMode) {
    payload.response_format = { type: 'json_object' };
  }

  const body = JSON.stringify(payload);

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
  jsonMode?: boolean;
}): Promise<AdapterResponse> {
  const systemMessage = params.messages.find(m => m.role === 'system');
  const otherMessages = params.messages.filter(m => m.role !== 'system');

  const contents = otherMessages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const generationConfig: any = {
    temperature: params.temperature,
    maxOutputTokens: params.maxTokens,
  };

  if (params.jsonMode) {
    generationConfig.responseMimeType = 'application/json';
  }

  const body: any = {
    contents,
    generationConfig,
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

/* ================================================================== */
/* Native Function Calling Adapters                                      */
/* ================================================================== */

/** Resposta extendida com tool calls do LLM */
export interface AdapterToolResponse extends AdapterResponse {
  /** Tool calls solicitadas pelo LLM (vazio se resposta final em texto) */
  toolCalls: Array<{
    id: string;
    name: string;
    arguments: Record<string, unknown>;
  }>;
  /** Motivo de parada: 'stop' = texto final, 'tool_calls' = quer chamar ferramenta */
  finishReason: 'stop' | 'tool_calls';
}

/**
 * OpenAI-Compatible Function Calling
 *
 * Envia mensagens + tools no formato nativo da API OpenAI.
 * Funciona com: Groq, DeepSeek, OpenRouter, Zhipu/GLM, Moonshot/Kimi.
 *
 * Diferença do `callOpenAICompatible` padrão:
 * - Inclui `tools` no payload
 * - Parseia `tool_calls` da resposta
 * - Suporta mensagens com role 'tool' (resultado de execução)
 */
export async function callOpenAIWithTools(params: {
  apiKey: string;
  baseUrl: string;
  model: string;
  messages: AdapterMessage[];
  tools: AdapterToolDef[];
  temperature: number;
  maxTokens: number;
  isOpenRouter?: boolean;
}): Promise<AdapterToolResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${params.apiKey}`,
  };

  if (params.isOpenRouter) {
    headers['HTTP-Referer'] = 'https://zehla.com.br';
    headers['X-Title'] = 'ZEHLA SmartHotel';
  }

  // Build messages — filter tool_calls from serialization (only include content + role)
  const serializableMessages = params.messages.map(m => {
    const msg: Record<string, unknown> = { role: m.role, content: m.content };
    if (m.role === 'tool' && m.tool_call_id) {
      msg.tool_call_id = m.tool_call_id;
    }
    if (m.role === 'assistant' && m.tool_calls && m.tool_calls.length > 0) {
      msg.tool_calls = m.tool_calls;
    }
    return msg;
  });

  const payload: Record<string, unknown> = {
    model: params.model,
    messages: serializableMessages,
    tools: params.tools,
    temperature: params.temperature,
    max_tokens: params.maxTokens,
  };

  const url = `${params.baseUrl.replace(/\/$/, '')}/chat/completions`;
  const response = await fetchWithRetry(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`[LLMAdapter] Tool calling error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const choice = data.choices?.[0];
  const message = choice?.message;
  const finishReason = choice?.finish_reason || 'stop';

  // Extract text content
  const content = message?.content || '';

  // Extract tool calls
  const rawToolCalls: AdapterToolCallDef[] | undefined = message?.tool_calls;
  const toolCalls: AdapterToolResponse['toolCalls'] = [];

  if (rawToolCalls && Array.isArray(rawToolCalls)) {
    for (const tc of rawToolCalls) {
      let parsedArgs: Record<string, unknown> = {};
      try {
        parsedArgs = JSON.parse(tc.function?.arguments || '{}');
      } catch {
        parsedArgs = { _raw: tc.function?.arguments || '{}' };
      }
      toolCalls.push({
        id: tc.id || `tc_${Date.now()}`,
        name: tc.function?.name || 'unknown',
        arguments: parsedArgs,
      });
    }
  }

  const inputTokens = data.usage?.prompt_tokens || Math.ceil(JSON.stringify(serializableMessages).length / 4);
  const outputTokens = data.usage?.completion_tokens || Math.ceil((content.length + JSON.stringify(rawToolCalls || []).length) / 4);

  return {
    content,
    inputTokens,
    outputTokens,
    toolCalls,
    finishReason: finishReason === 'tool_calls' || toolCalls.length > 0 ? 'tool_calls' : 'stop',
  };
}

/**
 * Gemini Function Calling (functionDeclarations)
 *
 * Formato específico do Google Gemini:
 * - tools[].functionDeclarations[] em vez de tools[].function
 * - functionCall nos parts em vez de tool_calls
 * - functionResponse no role 'user' para devolver resultados
 */
export async function callGeminiWithTools(params: {
  apiKey: string;
  model: string;
  messages: AdapterMessage[];
  tools: AdapterToolDef[];
  temperature: number;
  maxTokens: number;
}): Promise<AdapterToolResponse> {
  const systemMessage = params.messages.find(m => m.role === 'system');
  const otherMessages = params.messages.filter(m => m.role !== 'system');

  // Convert messages to Gemini format
  // Gemini uses 'user' and 'model' roles, with parts array
  const contents: Array<Record<string, unknown>> = [];

  for (const msg of otherMessages) {
    if (msg.role === 'tool') {
      // Tool result messages in Gemini go as 'user' role with functionResponse part
      contents.push({
        role: 'user',
        parts: [{
          functionResponse: {
            name: msg.tool_call_id?.split('_')[0] || 'unknown',
            response: (() => {
              try { return JSON.parse(msg.content); }
              catch { return { result: msg.content }; }
            })(),
          },
        }],
      });
    } else if (msg.role === 'assistant') {
      if (msg.tool_calls && msg.tool_calls.length > 0) {
        // Assistant message with tool calls — convert to functionCall parts
        const parts: Array<Record<string, unknown>> = [];
        if (msg.content) {
          parts.push({ text: msg.content });
        }
        for (const tc of msg.tool_calls) {
          let parsedArgs: Record<string, unknown> = {};
          try {
            parsedArgs = JSON.parse(tc.function.arguments || '{}');
          } catch {
            parsedArgs = {};
          }
          parts.push({
            functionCall: {
              name: tc.function.name,
              args: parsedArgs,
            },
          });
        }
        contents.push({ role: 'model', parts });
      } else {
        contents.push({
          role: 'model',
          parts: [{ text: msg.content || '' }],
        });
      }
    } else {
      contents.push({
        role: 'user',
        parts: [{ text: msg.content }],
      });
    }
  }

  // Convert tools to Gemini functionDeclarations format
  const geminiTools = params.tools.map(t => ({
    functionDeclarations: [{
      name: t.function.name,
      description: t.function.description,
      parameters: t.function.parameters,
    }],
  }));

  const body: Record<string, unknown> = {
    contents,
    tools: geminiTools,
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

  // Map shorter model ID to official Google model names
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
    throw new Error(`[LLMAdapter] Gemini tool calling error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  const content = parts
    .filter((p: any) => p.text)
    .map((p: any) => p.text)
    .join('');

  // Extract function calls from parts
  const toolCalls: AdapterToolResponse['toolCalls'] = [];
  for (const part of parts) {
    if (part.functionCall) {
      toolCalls.push({
        id: `gemini_${part.functionCall.name}_${Date.now()}`,
        name: part.functionCall.name,
        arguments: part.functionCall.args || {},
      });
    }
  }

  const inputTokens = data.usageMetadata?.promptTokenCount || Math.ceil(JSON.stringify(body).length / 4);
  const outputTokens = data.usageMetadata?.candidatesTokenCount || Math.ceil((content.length + JSON.stringify(parts).length) / 4);

  return {
    content,
    inputTokens,
    outputTokens,
    toolCalls,
    finishReason: toolCalls.length > 0 ? 'tool_calls' : 'stop',
  };
}
