import { prisma } from '@/lib/prisma'
import { llmRouter } from '@/lib/ai/llm-router'
import { Redis } from 'ioredis'
import { assertSanitized } from '@/lib/security/pii-sanitizer'
import { validateLearnedPersona } from '@/lib/security/prompt-guard'
import { signCache, verifyCache } from '@/lib/security/cache-signer'
import { 
  truncateMessagesSecure, 
  assertCostLimit, 
  recordSuccess, 
  recordFailure, 
  ResourceExhaustionError,
  DEFAULT_LIMITS 
} from '@/lib/security/resource-guard'

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

export interface PersonaProfile {
  tone: string
  commonExpressions: string[]
  conversationTypes: string[]
  rules: string[]
}

const DEFAULT_PERSONA: PersonaProfile = {
  tone: 'Caloroso, prestativo e profissional, típico de hospitalidade premium na Praia do Rosa.',
  commonExpressions: ['Seja muito bem-vindo!', 'Qualquer dúvida estamos à disposição.', 'Aproveite o paraíso!'],
  conversationTypes: ['Reservas', 'Dúvidas de Preço', 'Check-in e Check-out', 'Dicas locais'],
  rules: [
    'Sempre responda de forma empática.',
    'Mantenha o foco em resolver as dores do hóspede rapidamente.',
    'Ofereça opções de upgrade sempre que possível.'
  ]
}

export class WhatsappPersonaLearner {
  private static CACHE_KEY_PREFIX = 'property:persona:'
  private static CACHE_TTL = 86400 // 24 horas

  static async getPersona(propertyId: string): Promise<PersonaProfile> {
    const circuitKey = `llm:persona:${propertyId}`

    try {
      // 1. Tentar buscar do Redis e verificar assinatura (Cache Poisoning)
      const cached = await redis.get(`${this.CACHE_KEY_PREFIX}${propertyId}`)
      if (cached) {
        const verified = verifyCache<PersonaProfile>(cached)
        if (verified.valid && verified.data) {
          return verified.data
        } else {
          console.warn(`🚨 [Cache Poisoning] Cache inválido/adulterado para o tenant ${propertyId}. Removendo cache.`)
          await redis.del(`${this.CACHE_KEY_PREFIX}${propertyId}`)
        }
      }

      // 2. Buscar histórico de mensagens OUTBOUND no banco de dados
      const messages = await prisma.message.findMany({
        where: {
          propertyId,
          direction: 'OUTBOUND'
        },
        orderBy: { createdAt: 'desc' },
        take: 100 // Puxamos até 100 para o truncador seguro avaliar
      })

      if (messages.length === 0) {
        await this.cachePersona(propertyId, DEFAULT_PERSONA)
        return DEFAULT_PERSONA
      }

      // DEFESA 4 (DoS): Truncamento seguro de mensagens
      const secureMessages = truncateMessagesSecure(messages, DEFAULT_LIMITS, circuitKey)

      // DEFESA 1 (PII Leakage): Sanitização com Prova de Ausência
      const sanitizedMessages = secureMessages.map(m => {
        const cleanText = assertSanitized(m.content)
        return `- ${cleanText}`
      })

      const messageHistoryText = sanitizedMessages.join('\n')

      // DEFESA 4 (DoS): Cálculo de Custo antes do disparo
      assertCostLimit(messageHistoryText.length, DEFAULT_LIMITS.maxLlmOutputTokens)

      const prompt = `Analise o histórico de mensagens abaixo enviado por uma pousada para seus hóspedes. 
Extraia os seguintes dados para treinar um modelo de Machine Learning (responda estritamente em formato JSON válido):
{
  "tone": "Tom de voz geral das respostas (Ex: formal, jovem, muito acolhedor, focado em vendas)",
  "commonExpressions": ["3 a 5 expressões, gírias ou emojis usados com frequência"],
  "conversationTypes": ["3 tipos de conversas principais identificadas"],
  "rules": ["3 a 5 regras implícitas de atendimento que o atendente parece seguir"]
}

Histórico de Mensagens:
${messageHistoryText}`

      // DEFESA 4 (DoS): Chamada com Timeout de 15 segundos
      const llmResponse = await Promise.race([
        llmRouter.generate({
          model: 'general',
          messages: [
            { role: 'system', content: 'Você é um engenheiro de prompts e analista de tom de voz avançado.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          maxTokens: 1024
        }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new ResourceExhaustionError('LLM_TIMEOUT', { timeout: 15000 })), 15000)
        )
      ])

      recordSuccess(circuitKey)

      let rawPersona: PersonaProfile
      try {
        const jsonMatch = llmResponse.content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          rawPersona = JSON.parse(jsonMatch[0]) as PersonaProfile
        } else {
          throw new Error('JSON not found in response')
        }
      } catch (parseError) {
        console.error('⚠️ Erro ao parsear tom de voz gerado pela LLM. Usando padrão.', parseError)
        return DEFAULT_PERSONA
      }

      // DEFESA 2 (Prompt Injection Indireto): Validação da Persona Aprendida
      const validation = validateLearnedPersona(rawPersona)
      if (!validation.valid) {
        await prisma.securityAlert.create({
          data: {
            tenantId: propertyId,
            alertType: 'PROMPT_INJECTION_DETECTED',
            severity: 'CRITICAL',
            metadata: JSON.stringify({
              reason: validation.reason,
              preview: JSON.stringify(rawPersona).slice(0, 300)
            })
          }
        })
        
        await this.cachePersona(propertyId, DEFAULT_PERSONA)
        return DEFAULT_PERSONA
      }

      const finalPersona = validation.persona!

      // DEFESA 3 (Cache Poisoning): Salvar no Redis com assinatura HMAC
      await this.cachePersona(propertyId, finalPersona)
      return finalPersona

    } catch (error) {
      if (error instanceof ResourceExhaustionError) {
        recordFailure(circuitKey)
      }
      console.error('❌ Falha ao aprender persona do WhatsApp (ZEHLA Fortress interceptou):', error)
      return DEFAULT_PERSONA
    }
  }

  private static async cachePersona(propertyId: string, profile: PersonaProfile) {
    const signedData = signCache(profile, this.CACHE_TTL)
    await redis.setex(
      `${this.CACHE_KEY_PREFIX}${propertyId}`,
      this.CACHE_TTL,
      signedData
    )
  }
}
