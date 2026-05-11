// ============================================================
// TIPOS COMPARTILHADOS — ZEHLA SMARTHOTEL
// ============================================================

export interface AgentRequest {
  propertyId: string
  message?: string
  intent?: string
  context?: Record<string, unknown>
  sessionId?: string
}

export interface AgentResponse {
  success: boolean
  agent: string
  intent: string
  confidence: number
  response: string
  data?: Record<string, unknown>
  tokensUsed: number
  cost: number
  duration: number
  fallback?: boolean
  voice?: {
    enabled: boolean
    tier: 'PRO' | 'MAX'
    adaptation?: {
      rate: number
      pitch: number
      style: string
      emotiveness: number
    }
    instruction?: string
  }
}

export interface LLMRequest {
  model: string
  messages: Array<{ role: string; content: string }>
  temperature?: number
  maxTokens?: number
  tools?: unknown[]
  forceLocal?: boolean // Força uso do motor local (Custo Zero)
}

export interface LLMResponse {
  content: string
  model: string
  tokensUsed: number
  cost: number
  duration: number
}

export interface WhatsAppWebhookPayload {
  event: string
  instance: string
  data: {
    key: {
      remoteJid: string
      fromMe: boolean
      id: string
    }
    message: {
      conversation?: string
      extendedTextMessage?: { text: string }
    }
    messageTimestamp: number
    pushName?: string
  }
}

export interface PagarmeWebhookPayload {
  id: string
  type: string
  data: {
    id: string
    status: string
    amount: number
    pix_qr_code?: string
    pix_code?: string
    paid_at?: string
  }
}

export interface RoomAvailability {
  roomId: string
  number: string
  type: string
  price: number
  available: boolean
  dates: string[]
}

export interface PricingSuggestion {
  roomType: string
  currentPrice: number
  suggestedPrice: number
  multiplier: number
  reason: string
}

export interface SystemHealth {
  status: 'OK' | 'WARNING' | 'CRITICAL'
  timestamp: string
  version: string
  services: {
    database: boolean
    redis: boolean
    ollama: boolean
    evolution: boolean
  }
  metrics: {
    cpuUsage: number
    memoryUsage: number
    diskUsage: number
    activeConnections: number
  }
}
