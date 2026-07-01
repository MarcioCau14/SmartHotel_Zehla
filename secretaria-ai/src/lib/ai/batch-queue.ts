const BATCH_WINDOW_MS = 5_000;
const BATCH_MAX_SIZE = 50;

interface BatchRequest {
  id: string;
  provider: 'deepseek' | 'gemini' | 'zhipu' | 'moonshot';
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  maxTokens?: number;
  resolve: (value: BatchResponse) => void;
  reject: (reason: unknown) => void;
  submittedAt: number;
}

interface BatchResponse {
  content: string;
  model: string;
  tokensUsed: number;
  cost: number;
  batchDiscount: number;
}

interface BatchConfig {
  windowMs: number;
  maxSize: number;
  enabled: boolean;
  discountRate: Record<string, number>;
}

const DEFAULT_CONFIG: BatchConfig = {
  windowMs: BATCH_WINDOW_MS,
  maxSize: BATCH_MAX_SIZE,
  enabled: process.env.BATCH_API_ENABLED === 'true',
  discountRate: {
    deepseek: 0.50,
    gemini: 0.50,
    zhipu: 0,
    moonshot: 0,
  },
};

export class BatchQueue {
  private queues: Map<string, BatchRequest[]>;
  private timers: Map<string, ReturnType<typeof setTimeout>>;
  private config: BatchConfig;

  constructor(config: Partial<BatchConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.queues = new Map();
    this.timers = new Map();
  }

  async enqueue(request: Omit<BatchRequest, 'id' | 'resolve' | 'reject' | 'submittedAt'>): Promise<BatchResponse> {
    if (!this.config.enabled) {
      return this.executeImmediate(request);
    }

    return new Promise<BatchResponse>((resolve, reject) => {
      const id = `${request.provider}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const item: BatchRequest = {
        ...request,
        id,
        resolve,
        reject,
        submittedAt: Date.now(),
      };

      const key = `${request.provider}:${request.model}`;
      if (!this.queues.has(key)) {
        this.queues.set(key, []);
      }
      this.queues.get(key)!.push(item);

      if (!this.timers.has(key)) {
        const timer = setTimeout(() => this.flush(key), this.config.windowMs);
        this.timers.set(key, timer);
      }

      if (this.queues.get(key)!.length >= this.config.maxSize) {
        this.flush(key);
      }
    });
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  getProviderBatchDiscount(provider: string): number {
    return this.config.discountRate[provider] ?? 0;
  }

  getQueueSize(): Record<string, number> {
    const sizes: Record<string, number> = {};
    Array.from(this.queues.entries()).forEach(([key, items]) => {
      sizes[key] = items.length;
    });
    return sizes;
  }

  flushAll(): void {
    Array.from(this.queues.keys()).forEach(key => this.flush(key));
  }

  private async flush(key: string): Promise<void> {
    const timer = this.timers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(key);
    }

    const items = this.queues.get(key) ?? [];
    this.queues.delete(key);

    if (items.length === 0) return;

    const [provider] = key.split(':');
    const discount = this.config.discountRate[provider] ?? 0;

    for (const item of items) {
      const pricing: Record<string, { input: number; output: number }> = {
        deepseek: { input: 0.00014, output: 0.00028 },
        gemini: { input: 0.00030, output: 0.00250 },
        zhipu: { input: 0.00140, output: 0.00440 },
        moonshot: { input: 0.00095, output: 0.00400 },
      };

      const price = pricing[item.provider] ?? { input: 0.001, output: 0.004 };
      const inputTokens = Math.ceil(item.messages.reduce((sum, m) => sum + m.content.length, 0) / 4);
      const outputTokens = 150 + Math.floor(Math.random() * 200);
      const baseCost = (inputTokens / 1000) * price.input + (outputTokens / 1000) * price.output;
      const cost = baseCost * (1 - discount);

      item.resolve({
        content: this.mockBatchResponse(item.messages, item.provider),
        model: item.model,
        tokensUsed: inputTokens + outputTokens,
        cost,
        batchDiscount: discount,
      });
    }
  }

  private async executeImmediate(request: Omit<BatchRequest, 'id' | 'resolve' | 'reject' | 'submittedAt'>): Promise<BatchResponse> {
    const pricing: Record<string, { input: number; output: number }> = {
      deepseek: { input: 0.00014, output: 0.00028 },
      gemini: { input: 0.00030, output: 0.00250 },
      zhipu: { input: 0.00140, output: 0.00440 },
      moonshot: { input: 0.00095, output: 0.00400 },
    };

    const price = pricing[request.provider] ?? { input: 0.001, output: 0.004 };
    const inputTokens = Math.ceil(request.messages.reduce((sum, m) => sum + m.content.length, 0) / 4);
    const outputTokens = 150 + Math.floor(Math.random() * 200);
    const cost = (inputTokens / 1000) * price.input + (outputTokens / 1000) * price.output;

    return {
      content: this.mockBatchResponse(request.messages, request.provider),
      model: request.model,
      tokensUsed: inputTokens + outputTokens,
      cost,
      batchDiscount: 0,
    };
  }

  private mockBatchResponse(messages: Array<{ role: string; content: string }>, provider: string): string {
    const lastMsg = messages[messages.length - 1]?.content ?? '';
    const lower = lastMsg.toLowerCase();

    if (lower.includes('horario') || lower.includes('check-in')) {
      return `Check-in disponível a partir das 14h. Seu quarto estará pronto ao chegar.\n\n*Processado em batch via ${provider}*`;
    }
    if (lower.includes('reserva') || lower.includes('booking')) {
      return `Sua reserva está confirmada em nosso sistema.\n\n*Processado em batch via ${provider}*`;
    }
    return `Recebemos sua mensagem e estamos processando.\n\n*Processado em batch via ${provider}*`;
  }
}

export const batchQueue = new BatchQueue();
