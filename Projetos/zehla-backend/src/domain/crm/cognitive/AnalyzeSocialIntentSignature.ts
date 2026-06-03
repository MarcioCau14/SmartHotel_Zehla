import { SocialPlatform } from '../models/SocialInteraction'

export interface AnalyzeSocialInput {
  readonly content: string
  readonly platform: SocialPlatform
  readonly isDirectMessage: boolean
}

export interface AnalyzeSocialOutput {
  readonly hasBuyingIntent: boolean
  readonly urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  readonly extractedPhone: string | null
}

const URGENCY_PATTERNS: ReadonlyArray<{ patterns: string[]; level: 'HIGH' | 'MEDIUM' | 'LOW' }> = [
  { patterns: ['urgente', 'hoje', 'agora', 'preciso', 'quanto antes', 'amanhã', 'imediatamente'], level: 'HIGH' },
  { patterns: ['essa semana', 'esse mês', 'em breve', 'estou planejando'], level: 'MEDIUM' },
]

export class AnalyzeSocialIntentSignature {
  private readonly input: AnalyzeSocialInput

  constructor(input: AnalyzeSocialInput) {
    if (!input.content || input.content.trim().length === 0) {
      throw new Error('content é obrigatório')
    }
    this.input = { ...input }
    Object.freeze(this)
  }

  get systemPrompt(): string {
    return [
      '## Role',
      'Analisador de intenção de compra para redes sociais de uma pousada.',
      '',
      '## Tarefa',
      'Analise o comentário ou mensagem direta e identifique se há intenção de compra.',
      'Intenção de compra = a pessoa está perguntando sobre preços, disponibilidade, quer reservar,',
      'pede informações para contratar, ou demonstra desejo explícito de consumir o serviço.',
      '',
      '## Formato de Saída',
      'Responda APENAS com um JSON válido neste formato:',
      '{ "hasBuyingIntent": boolean, "urgencyLevel": "LOW"|"MEDIUM"|"HIGH", "extractedPhone": string|null }',
      '',
      '## Regras',
      '- hasBuyingIntent=true apenas se houver intenção comercial clara',
      '- urgencyLevel: HIGH se mencionar urgência/hoje, MEDIUM se esta semana/mês, LOW caso contrário',
      '- extractedPhone: preencher se houver número de telefone no texto, null caso contrário',
    ].join('\n')
  }

  get userPrompt(): string {
    return [
      `## Interação`,
      `- Plataforma: ${this.input.platform}`,
      `- Tipo: ${this.input.isDirectMessage ? 'Mensagem Direta' : 'Comentário'}`,
      `- Conteúdo: "${this.input.content}"`,
      '',
      'Analise a interação acima e retorne o JSON de intenção de compra.',
    ].join('\n')
  }

  buildFullPrompt(): { systemPrompt: string; userPrompt: string } {
    return {
      systemPrompt: this.systemPrompt,
      userPrompt: this.userPrompt,
    }
  }

  static classifyIntent(content: string): { hasBuyingIntent: boolean; urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH'; extractedPhone: string | null } {
    const lower = content.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

    const phoneRegex = /(\+?\d{1,3}[\s-]?)?\(?\d{2,3}\)?[\s-]?\d{4,5}[\s-]?\d{4}/g
    const phoneMatch = lower.match(phoneRegex)
    const extractedPhone = phoneMatch ? phoneMatch[0].trim() : null

    const buyingPatterns = [
      'quanto custa', 'valor', 'preco', 'diaria', 'pacote', 'reservar',
      'disponibilidade', 'disponivel', 'tem vaga', 'quero', 'gostei',
      'agendar', 'fazer reserva', 'qual o preco', 'quanto é',
      'quanto fica', 'vou querer', 'tenho interesse', 'quero ir',
      'preciso de um quarto', 'quero reservar',
    ]

    const hasBuyingIntent = buyingPatterns.some(p => lower.includes(p))

    let urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW'
    for (const { patterns, level } of URGENCY_PATTERNS) {
      if (patterns.some(p => lower.includes(p))) {
        urgencyLevel = level
        break
      }
    }

    return { hasBuyingIntent, urgencyLevel, extractedPhone }
  }
}
