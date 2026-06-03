import { FollowUpCadence } from '../models/FollowUpSchedule'
import { CRMPipelineStage } from '../models/CRMPipelineStage'

export interface GenerateFollowUpInput {
  leadName: string
  leadStage: CRMPipelineStage
  scheduleType: FollowUpCadence
  lastInteractionSummary: string
}

export interface GenerateFollowUpOutput {
  whatsappMessage: string
}

const CADENCE_INSTRUCTIONS: Record<FollowUpCadence, { systemRole: string; tone: string; strategy: string; rules: string[] }> = {
  ENGAJAMENTO: {
    systemRole: 'Assistente de vendas hoteleiras — tom amigável e consultivo',
    tone: 'caloroso, educado, sem pressão',
    strategy: 'Quebrar o gelo e reengajar sem empurrar venda. Perguntar se a família/amigos gostaram das opções enviadas.',
    rules: [
      'Não mencionar prazos, descontos ou escassez',
      'Fazer uma pergunta aberta no final',
      'Manter mensagem curta (máximo 2 parágrafos)',
      'Usar o nome do lead naturalmente',
    ],
  },
  URGENCIA: {
    systemRole: 'Assistente de vendas hoteleiras — tom persuasivo com escassez sutil',
    tone: 'confiante, urgente mas não agressivo',
    strategy: 'Injetar gatilho de escassez informando alta procura para as datas consultadas.',
    rules: [
      'Mencionar que "restam poucas unidades" ou "alta procura para essa data"',
      'Sugerir que o lead confirme logo para não perder disponibilidade',
      'Não inventar números — usar "poucas suítes" genérico',
      'Manter tom educado e útil, não desesperado',
    ],
  },
  FECHAMENTO: {
    systemRole: 'Assistente de vendas hoteleiras — tom de última chamada com bônus de prazo',
    tone: 'decisivo, com senso de urgência final',
    strategy: 'Aplicar gatilho de última chamada com limite de horário para garantir a reserva com benefício especial.',
    rules: [
      'Informar que a oferta/prazo está se encerrando',
      'Criar um "call to action" claro: responder agora ou até horário específico',
      'Se aplicável, mencionar um pequeno bônus (cortesia ou check-in estendido) como incentivo final',
      'Deixar claro que após esse contato não haverá novas tentativas para não ser incômodo',
    ],
  },
}

export class GenerateFollowUpSignature {
  private readonly input: GenerateFollowUpInput

  constructor(input: GenerateFollowUpInput) {
    if (!input.leadName || input.leadName.trim().length === 0) {
      throw new Error('leadName é obrigatório')
    }
    if (!input.lastInteractionSummary || input.lastInteractionSummary.trim().length === 0) {
      throw new Error('lastInteractionSummary é obrigatório')
    }
    this.input = { ...input }
    Object.freeze(this)
  }

  get cadenceConfig() {
    return CADENCE_INSTRUCTIONS[this.input.scheduleType]
  }

  get systemPrompt(): string {
    const config = this.cadenceConfig
    return [
      `## Role`,
      `${config.systemRole}.`,
      ``,
      `## Tom`,
      `${config.tone}.`,
      ``,
      `## Estratégia de Copy`,
      `${config.strategy}`,
      ``,
      `## Regras Obrigatórias`,
      ...config.rules.map((r, i) => `${i + 1}. ${r}`),
    ].join('\n')
  }

  get contextBlock(): string {
    return [
      `## Contexto do Lead`,
      `- Nome: ${this.input.leadName}`,
      `- Estágio no Funil: ${this.input.leadStage}`,
      `- Tipo de Cadência: ${this.input.scheduleType}`,
      ``,
      `## Última Interação`,
      `${this.input.lastInteractionSummary}`,
    ].join('\n')
  }

  get userPrompt(): string {
    return [
      `Com base no contexto acima, gere a mensagem de WhatsApp para ${this.input.leadName} seguindo a estratégia de ${this.input.scheduleType}.`,
      ``,
      `A mensagem deve ser em português, natural e personalizada.`,
      `Use o nome do lead (${this.input.leadName}) na mensagem.`,
    ].join('\n')
  }

  buildFullPrompt(): { systemPrompt: string; userPrompt: string; outputFormat: string } {
    return {
      systemPrompt: this.systemPrompt,
      userPrompt: `${this.contextBlock}\n\n${this.userPrompt}`,
      outputFormat: 'Responda APENAS com a mensagem de WhatsApp, sem explicações adicionais.',
    }
  }
}
