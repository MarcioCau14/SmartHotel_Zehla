// =============================================================================
// ZÉLLA — Strategy Types & Interface
// =============================================================================
// Interface comum que ambas as strategies (Pousada e AirB) devem implementar.
// Este é o contrato do Strategy Pattern.
// =============================================================================

// ── Tipos Fundamentais ──────────────────────────────────────────────────────

/** Modo de operação do tenant — define qual Strategy o orquestrador usa */
export type OperatingMode = 'pousada' | 'airbnb';

/** Modo da conversa — pré-reserva (vendas) ou pós-reserva (suporte) */
export type ConversationMode = 'pre_booking' | 'post_booking';

/** Status da conversa */
export type ConversationStatus = 'active' | 'resolved' | 'escalated';

// ── Intenções ───────────────────────────────────────────────────────────────

/** Intenções do Zélla AirB — 21 intents totais */
export type AirBIntent =
  // Pré-reserva (Vendas) — 5 novas
  | 'PROPERTY_INQUIRY'
  | 'AVAILABILITY_CHECK'
  | 'PRICING_INFO'
  | 'BOOKING_INITIATION'
  | 'REVIEW_REQUEST'
  // Pós-reserva (Hospedagem) — 16 existentes
  | 'SELF_CHECK_IN'
  | 'CHECKOUT_INFO'
  | 'WIFI_INFO'
  | 'HOUSE_RULES'
  | 'EQUIPMENT_HELP'
  | 'NEIGHBORHOOD_TIPS'
  | 'PARKING_INFO'
  | 'EMERGENCY'
  | 'HOST_GREETING'
  | 'HOST_FAREWELL'
  | 'EXTEND_STAY'
  | 'CLEANING_REQUEST'
  | 'MAINTENANCE_ISSUE'
  | 'LOCAL_RECOMMENDATION'
  | 'HUMAN_HANDOVER'
  | 'UNKNOWN';

/** Intenções do Zélla Pousada (existente) */
export type PousadaIntent =
  | 'RESERVATION_INQUIRY'
  | 'AVAILABILITY_CHECK'
  | 'PRICING_INFO'
  | 'ROOM_SUGGESTION'
  | 'AMENITY_INFO'
  | 'LOCAL_TIPS'
  | 'CHECK_IN'
  | 'CHECK_OUT'
  | 'COMPLAINT'
  | 'GENERAL_QUESTION'
  | 'HUMAN_HANDOVER'
  | 'UNKNOWN';

/** Intent unificado */
export type ZellaIntent = AirBIntent | PousadaIntent;

// ── Contexto de Conversa ────────────────────────────────────────────────────

export interface ConversationContext {
  tenantId: string;
  tenantMode: OperatingMode;
  propertyId?: string;
  propertyName?: string;
  guestPhone?: string;
  guestName?: string;
  conversationMode: ConversationMode;
  messageHistory?: Array<{
    direction: 'inbound' | 'outbound';
    content: string;
    intent?: string;
  }>;
}

// ── Resultado de Classificação ──────────────────────────────────────────────

export interface IntentClassification {
  intent: ZellaIntent;
  confidence: number;
  method: 'heuristic' | 'llm' | 'fallback';
}

// ── Resposta One-Shot ───────────────────────────────────────────────────────

export interface OneShotResponse {
  content: string;
  intent: ZellaIntent;
  confidence: number;
  shouldEscalate: boolean;
  metadata?: {
    tokensUsed?: number;
    costCents?: number;
    toolsUsed?: string[];
  };
}

// ── Tool ────────────────────────────────────────────────────────────────────

export interface ZellaTool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute?: (args: Record<string, unknown>) => Promise<unknown>;
}

// ── Interface Principal ─────────────────────────────────────────────────────

/**
 * IZellaStrategy — Contrato comum para ambos os modos (Pousada / AirB).
 *
 * O Orquestrador recebe uma mensagem, identifica o tenant, carrega a Strategy
 * correta e delega todo o processamento.
 */
export interface IZellaStrategy {
  /** Modo de operação desta strategy */
  readonly mode: OperatingMode;

  /** Classifica a intenção da mensagem do hóspede */
  classifyIntent(
    message: string,
    context: ConversationContext
  ): Promise<IntentClassification>;

  /** Gera a resposta usando LLM + tools (One-Shot Resolution) */
  generateResponse(
    intent: ZellaIntent,
    context: ConversationContext,
    propertyData?: Record<string, unknown>
  ): Promise<OneShotResponse>;

  /** Retorna o system prompt adequado para a intenção e contexto */
  getSystemPrompt(context: ConversationContext): string;

  /** Lista de tools disponíveis para esta strategy */
  getAvailableTools(): ZellaTool[];

  /** Detecta modo de conversa (pré/pós reserva) */
  detectConversationMode(context: ConversationContext): ConversationMode;
}
