export interface AuditTranscriptInput {
  readonly transcript: string
  readonly leadId: string
  readonly canal: string
  readonly sentimentScore: number
}

export interface AuditTranscriptOutput {
  readonly discountViolation: boolean
  readonly empathyFailure: boolean
  readonly correctionFeedback: string
}

export class AuditTranscriptSignature {
  private readonly input: AuditTranscriptInput

  constructor(input: AuditTranscriptInput) {
    if (!input.transcript || input.transcript.trim().length === 0) {
      throw new Error('transcript é obrigatório')
    }
    if (!input.leadId) {
      throw new Error('leadId é obrigatório')
    }
    this.input = { ...input }
    Object.freeze(this)
  }

  get systemPrompt(): string {
    return [
      '## Role',
      'Auditor de qualidade de atendimento hoteleiro — D+1.',
      '',
      '## Tarefa',
      'Analise a transcrição de uma interação entre o concierge IA e um hóspede.',
      'Identifique violações de desconto e falhas de empatia.',
      '',
      '## Formato de Saída',
      'Responda APENAS com um JSON válido neste formato:',
      '{ "discountViolation": boolean, "empathyFailure": boolean, "correctionFeedback": string }',
      '',
      '## Regras',
      '- discountViolation=true se o concierge concedeu desconto fora da política ou valor incorreto',
      '- empathyFailure=true se o concierge foi seco, rude ou não demonstrou empatia em reclamação',
      '- correctionFeedback: descrição clara do que precisa ser corrigido, em português',
    ].join('\n')
  }

  get userPrompt(): string {
    return [
      `## Transcrição para Auditoria`,
      `- Lead ID: ${this.input.leadId}`,
      `- Canal: ${this.input.canal}`,
      `- Sentimento: ${this.input.sentimentScore}`,
      '',
      `## Conteúdo`,
      `${this.input.transcript}`,
      '',
      'Analise a interação acima e retorne o JSON de auditoria.',
    ].join('\n')
  }

  buildFullPrompt(): { systemPrompt: string; userPrompt: string } {
    return {
      systemPrompt: this.systemPrompt,
      userPrompt: this.userPrompt,
    }
  }

  static analyzeTranscript(transcript: string, sentimentScore: number): AuditTranscriptOutput {
    const lower = transcript.toLowerCase()

    const discountViolation = /desconto.*\d{2,}|.*% desconto|dar.*desconto|abaixo.*preco|cobrar.*menos/i.test(lower)

    const empathyPhrases = ['desculpa', 'perdão', 'compreendo', 'sentimos', 'lamentamos', 'entendo', 'lamento']
    const hasEmpathy = empathyPhrases.some(p => lower.includes(p))
    const hasDefensive = /regulamento|não podemos|não é nossa culpa|não fazemos|não temos o que fazer/i.test(lower)
    const empathyFailure = (!hasEmpathy || hasDefensive) && sentimentScore < 0

    let correctionFeedback = ''
    if (discountViolation && empathyFailure) {
      correctionFeedback = 'Concierge concedeu desconto irregular e falhou na empatia. Revisar política de preços e treinar tom em reclamações.'
    } else if (discountViolation) {
      correctionFeedback = 'Concierge concedeu desconto fora da política estabelecida. Reforçar regras de precificação.'
    } else if (empathyFailure) {
      correctionFeedback = 'Concierge não demonstrou empatia adequada. Recomendar tom mais acolhedor em interações negativas.'
    }

    return { discountViolation, empathyFailure, correctionFeedback }
  }
}
