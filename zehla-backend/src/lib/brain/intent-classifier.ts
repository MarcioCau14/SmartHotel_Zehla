import { llmRouter } from '@/lib/ai/llm-router'

export const INTENTS = [
  'RESERVATION_CREATE',
  'RESERVATION_MODIFY',
  'RESERVATION_CANCEL',
  'ROOM_AVAILABILITY',
  'PRICE_INQUIRY',
  'CHECK_IN',
  'CHECK_OUT',
  'HOUSEKEEPING_REQUEST',
  'AMENITIES_INQUIRY',
  'LOCAL_INFO',
  'PAYMENT_STATUS',
  'CANCELATION_POLICY',
  'GREETING',
  'FAREWELL',
  'SUPPLIER_INQUIRY',
  'UNKNOWN'
] as const

export type Intent = typeof INTENTS[number]

export interface ClassifiedIntent {
  intent: Intent
  confidence: number
  entities: Record<string, string>
  rawMessage: string
}

export async function classifyIntent(message: string): Promise<ClassifiedIntent> {
  const systemPrompt = `Você é um classificador de intents para um sistema hoteleiro.
Classifique a mensagem do hóspede em uma das seguintes categorias:
- RESERVATION_CREATE: Quer fazer uma nova reserva
- RESERVATION_MODIFY: Quer alterar uma reserva existente
- RESERVATION_CANCEL: Quer cancelar uma reserva
- ROOM_AVAILABILITY: Pergunta sobre disponibilidade de quartos
- PRICE_INQUIRY: Pergunta sobre preços
- CHECK_IN: Quer fazer check-in
- CHECK_OUT: Quer fazer check-out
- HOUSEKEEPING_REQUEST: Solicita serviço de limpeza/manutenção
- AMENITIES_INQUIRY: Pergunta sobre serviços/amenidades
- LOCAL_INFO: Pergunta sobre a região (praia, restaurantes, etc)
- PAYMENT_STATUS: Pergunta sobre pagamento
- CANCELATION_POLICY: Pergunta sobre política de cancelamento
- GREETING: Saudação simples
- FAREWELL: Despedida simples
- SUPPLIER_INQUIRY: Mensagem de fornecedor, vendedor, representante ou oferta de serviços (B2B)
- UNKNOWN: Não se encaixa em nenhuma categoria

Responda APENAS em JSON no formato:
{"intent": "CATEGORIA", "confidence": 0.95, "entities": {"data": "valor", "quartos": "2"}}`

  const response = await llmRouter.generate({
    model: 'classification',
    agentType: 'zmg-classify',
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
    return {
      intent: 'UNKNOWN',
      confidence: 0.3,
      entities: {},
      rawMessage: message
    }
  }
}
