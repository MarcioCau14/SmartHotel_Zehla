export interface GenerateFollowUpInput {
  leadName: string
  roiSavings: number
  lgpdRisk: string
  playbookUrl: string
}

export interface GenerateFollowUpOutput {
  messageText: string
}

export class GenerateFollowUpSignature {
  private readonly input: GenerateFollowUpInput

  constructor(input: GenerateFollowUpInput) {
    if (!input.leadName || input.leadName.trim().length === 0) {
      throw new Error('leadName é obrigatório')
    }
    if (input.roiSavings < 0) {
      throw new Error('roiSavings deve ser maior ou igual a zero')
    }
    if (!input.lgpdRisk || input.lgpdRisk.trim().length === 0) {
      throw new Error('lgpdRisk é obrigatório')
    }
    if (!input.playbookUrl || input.playbookUrl.trim().length === 0) {
      throw new Error('playbookUrl é obrigatório')
    }
    this.input = { ...input }
    Object.freeze(this)
  }

  get systemPrompt(): string {
    return [
      `## Role`,
      `Você é um consultor sênior de transformação de IA para hotéis e pousadas.`,
      ``,
      `## Objetivo`,
      `Redigir uma abordagem de follow-up consultiva, urgente e natural via WhatsApp com base nos dados do Raio-X de maturidade da propriedade.`,
      ``,
      `## Regras Obrigatórias`,
      `1. NUNCA comece com saudações robóticas do tipo "Olá [Nome], sou a inteligência artificial..." ou "Tudo bem? Como consultor...". Comece direto ao ponto de forma calorosa e profissional.`,
      `2. Mencione a economia mensal projetada de R$ ${this.input.roiSavings.toFixed(2)} que a propriedade pode obter.`,
      `3. Faça menção ao risco LGPD categorizado como "${this.input.lgpdRisk}" de forma profissional (se alto, como um ponto crítico de atenção; se baixo, de forma positiva).`,
      `4. Peça para o lead acessar o playbook através do link: ${this.input.playbookUrl}.`,
      `5. A mensagem deve ter no máximo 2 parágrafos.`,
      `6. O tom deve ser extremamente humano, natural, consultivo e com senso de urgência, variando estruturalmente.`,
    ].join('\n')
  }

  get userPrompt(): string {
    return [
      `Gere a mensagem de abordagem personalizada para o lead ${this.input.leadName}.`,
      `Diga como as melhorias de IA e mitigação do risco de dados podem impulsionar o faturamento e proteção legal do hotel.`,
    ].join('\n')
  }

  buildFullPrompt(): { systemPrompt: string; userPrompt: string; outputFormat: string } {
    return {
      systemPrompt: this.systemPrompt,
      userPrompt: this.userPrompt,
      outputFormat: 'Responda APENAS com a mensagem formatada para WhatsApp, sem introduções, aspas ou explicações adicionais.',
    }
  }
}
