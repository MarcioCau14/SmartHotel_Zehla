const AKASHIC_BASE_URL = process.env.AKASHIC_URL || 'http://localhost:8001'
const INGEST_ENABLED = process.env.AKASHIC_ENABLED !== 'false'

interface IngestEventParams {
  pousada_id: string
  source_channel: string
  guest_id?: string
  guest_profile?: string
  input_text?: string
  intent_classified?: string
  ai_response?: string
  provider_used?: string
  tier_used?: number
  outcome?: string
  sentiment_after?: number
  duration_ms?: number
  tokens_used?: number
  seasonality?: string
  weather_context?: string
  occupancy_at_time?: number
  cadmas_bucket?: number
  was_sticky?: boolean
}

interface AkashicQueryResult {
  knowledge_id: string
  content: string
  metadata: Record<string, unknown>
  similarity: number
}

export class AkashicBridge {
  private baseUrl: string

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || AKASHIC_BASE_URL
  }

  async health(): Promise<boolean> {
    if (!INGEST_ENABLED) return false
    try {
      const res = await fetch(`${this.baseUrl}/api/v2/akashic/health`, {
        signal: AbortSignal.timeout(3000),
      })
      return res.ok
    } catch {
      return false
    }
  }

  async ingestEvent(params: IngestEventParams): Promise<string | null> {
    if (!INGEST_ENABLED) return null
    try {
      const res = await fetch(`${this.baseUrl}/api/v2/akashic/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
        signal: AbortSignal.timeout(5000),
      })
      if (!res.ok) return null
      const data = await res.json()
      return data.stream_id || null
    } catch {
      return null
    }
  }

  async queryContext(pousadaId: string, queryText: string, topK: number = 10): Promise<AkashicQueryResult[]> {
    if (!INGEST_ENABLED) return []
    try {
      const res = await fetch(`${this.baseUrl}/api/v2/akashic/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pousada_id: pousadaId, query_text: queryText, top_k: topK }),
        signal: AbortSignal.timeout(5000),
      })
      if (!res.ok) return []
      const data = await res.json()
      return data.results || []
    } catch {
      return []
    }
  }

  async getGuestProfile(pousadaId: string, guestId: string): Promise<Record<string, unknown> | null> {
    if (!INGEST_ENABLED) return null
    try {
      const res = await fetch(`${this.baseUrl}/api/v2/akashic/guest/${pousadaId}/${guestId}`, {
        signal: AbortSignal.timeout(3000),
      })
      if (!res.ok) return null
      return await res.json()
    } catch {
      return null
    }
  }

  async getPousadaDashboard(pousadaId: string): Promise<Record<string, unknown> | null> {
    if (!INGEST_ENABLED) return null
    try {
      const res = await fetch(`${this.baseUrl}/api/v2/akashic/pousada/${pousadaId}/dashboard`, {
        signal: AbortSignal.timeout(3000),
      })
      if (!res.ok) return null
      return await res.json()
    } catch {
      return null
    }
  }
}

export const akashicBridge = new AkashicBridge()
