import { llmRouter } from '../ai/llm-router'

export const INTENTS = [
  'RESERVATION_CREATE', 'RESERVATION_MODIFY', 'RESERVATION_CANCEL',
  'ROOM_AVAILABILITY', 'PRICE_INQUIRY', 'CHECK_IN', 'CHECK_OUT',
  'HOUSEKEEPING_REQUEST', 'AMENITIES_INQUIRY', 'LOCAL_INFO',
  'PAYMENT_STATUS', 'CANCELATION_POLICY', 'GREETING', 'FAREWELL',
  'SUPPLIER_INQUIRY', 'UNKNOWN'
] as const

export type Intent = typeof INTENTS[number]

export interface ClassifiedIntent {
  intent: Intent
  confidence: number
  entities: Record<string, string>
  rawMessage: string
}

export async function classifyIntent(message: string): Promise<ClassifiedIntent> {
  const systemPrompt = `Classifique a mensagem em uma das categorias:
RESERVATION_CREATE, RESERVATION_MODIFY, RESERVATION_CANCEL, ROOM_AVAILABILITY,
PRICE_INQUIRY, CHECK_IN, CHECK_OUT, HOUSEKEEPING_REQUEST, AMENITIES_INQUIRY,
LOCAL_INFO, PAYMENT_STATUS, CANCELATION_POLICY, GREETING, FAREWELL, SUPPLIER_INQUIRY, UNKNOWN
Responda APENAS em JSON: {"intent": "CATEGORIA", "confidence": 0.95, "entities": {}}`

  const response = await llmRouter.generate({
    model: 'classification',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ],
    temperature: 0.1,
    maxTokens: 500
  })

  try {
    const parsed = JSON.parse(response.content)
    return {
      intent: parsed.intent as Intent,
      confidence: parsed.confidence || 0.5,
      entities: parsed.entities || {},
      rawMessage: message
    }
  } catch {
    return { intent: 'UNKNOWN', confidence: 0.3, entities: {}, rawMessage: message }
  }
}
