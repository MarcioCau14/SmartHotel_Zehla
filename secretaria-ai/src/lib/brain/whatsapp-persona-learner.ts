import { db } from '@/lib/db'
import { llmRouter } from '../ai/llm-router'
import { assertSanitized } from '../security/pii-sanitizer'
import { validateLearnedPersona } from '../security/prompt-guard'
import { truncateMessagesSecure, assertCostLimit, recordSuccess, recordFailure, ResourceExhaustionError, DEFAULT_LIMITS } from '../security/resource-guard'

export interface PersonaProfile {
  tone: string
  commonExpressions: string[]
  conversationTypes: string[]
  rules: string[]
}

const DEFAULT_PERSONA: PersonaProfile = {
  tone: 'Caloroso, prestativo e profissional, típico de hospitalidade premium.',
  commonExpressions: ['Seja muito bem-vindo!', 'Qualquer dúvida estamos à disposição.', 'Aproveite o paraíso!'],
  conversationTypes: ['Reservas', 'Dúvidas de Preço', 'Check-in e Check-out', 'Dicas locais'],
  rules: ['Sempre responda de forma empática.', 'Mantenha o foco em resolver as dores rapidamente.', 'Ofereça opções de upgrade sempre que possível.']
}

export class WhatsappPersonaLearner {
  private static CACHE_TTL = 86400

  static async getPersona(propertyId: string): Promise<PersonaProfile> {
    const circuitKey = `llm:persona:${propertyId}`

    try {
      const messages = await db.message.findMany({
        where: { propertyId, direction: 'OUTBOUND' },
        orderBy: { createdAt: 'desc' },
        take: 100
      })

      if (messages.length === 0) return DEFAULT_PERSONA

      const secureMessages = truncateMessagesSecure(messages, DEFAULT_LIMITS, circuitKey)
      const sanitizedMessages = secureMessages.map(m => `- ${assertSanitized(m.content)}`)
      const messageHistoryText = sanitizedMessages.join('\n')

      assertCostLimit(messageHistoryText.length, DEFAULT_LIMITS.maxLlmOutputTokens)

      const prompt = `Analise o histórico de mensagens abaixo enviado por uma pousada para seus hóspedes.
Extraia: {"tone": "...", "commonExpressions": [...], "conversationTypes": [...], "rules": [...]}
Histórico:
${messageHistoryText}`

      const llmResponse = await Promise.race([
        llmRouter.generate({
          model: 'general',
          messages: [
            { role: 'system', content: 'Você é um engenheiro de prompts e analista de tom de voz.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.1,
          maxTokens: 1024
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new ResourceExhaustionError('LLM_TIMEOUT', { timeout: 30000 })), 30000)
        )
      ])

      recordSuccess(circuitKey)

      let rawPersona: PersonaProfile
      try {
        const jsonMatch = llmResponse.content.match(/\{[\s\S]*\}/)
        if (jsonMatch) rawPersona = JSON.parse(jsonMatch[0]) as PersonaProfile
        else throw new Error('JSON not found')
      } catch {
        return DEFAULT_PERSONA
      }

      const validation = validateLearnedPersona(rawPersona)
      if (!validation.valid) {
        await db.securityAlert.create({
          data: {
            tenantId: propertyId,
            alertType: 'PROMPT_INJECTION_DETECTED',
            severity: 'CRITICAL',
            metadata: JSON.stringify({ reason: validation.reason })
          }
        })
        return DEFAULT_PERSONA
      }

      return validation.persona!
    } catch (error) {
      if (error instanceof ResourceExhaustionError) recordFailure(circuitKey)
      console.error('❌ Falha ao aprender persona:', error)
      return DEFAULT_PERSONA
    }
  }
}
