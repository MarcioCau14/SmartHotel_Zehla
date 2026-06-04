import { describe, it, expect } from 'vitest'
import { InteractionRecord } from '../../domain/crm/models/InteractionRecord'
import { QualityProxy } from '../../domain/decision/services/QualityProxy'
import { AuditTranscriptSignature } from '../../domain/crm/cognitive/AuditTranscriptSignature'
import { AuditorAgentService } from '../../domain/crm/services/AuditorAgentService'

function makeInteraction(overrides?: Partial<Parameters<typeof InteractionRecord.create>[0]>) {
  return InteractionRecord.create({
    id: 'int-1',
    leadId: 'lead-1',
    canal: 'whatsapp',
    timestamp: new Date(),
    sentimentScore: 0.5,
    tokenCost: 100,
    outcome: 'PENDING',
    resumo: 'Hóspede perguntou sobre horários de check-in. Concierge respondeu educadamente com os horários.',
    ...overrides,
  })
}

describe('AuditTranscriptSignature', () => {
  describe('analyzeTranscript (regras)', () => {
    it('deve detectar violação de desconto quando menciona percentual', () => {
      const result = AuditTranscriptSignature.analyzeTranscript(
        'Vou dar 15% de desconto para o hóspede',
        0.5,
      )
      expect(result.discountViolation).toBe(true)
    })

    it('NÃO deve detectar violação de desconto em resposta normal', () => {
      const result = AuditTranscriptSignature.analyzeTranscript(
        'O check-in é a partir das 14h',
        0.0,
      )
      expect(result.discountViolation).toBe(false)
    })

    it('deve detectar falha de empatia em reclamação com resposta defensiva', () => {
      const result = AuditTranscriptSignature.analyzeTranscript(
        'Não podemos fazer nada, é o regulamento',
        -0.5,
      )
      expect(result.empathyFailure).toBe(true)
      expect(result.correctionFeedback).toBeTruthy()
    })

    it('NÃO deve detectar falha de empatia em resposta acolhedora', () => {
      const result = AuditTranscriptSignature.analyzeTranscript(
        'Compreendo, pedimos desculpas pelo transtorno. Vamos resolver já!',
        0.3,
      )
      expect(result.empathyFailure).toBe(false)
      expect(result.correctionFeedback).toBe('')
    })

    it('deve preencher correctionFeedback apenas quando há violação', () => {
      const result = AuditTranscriptSignature.analyzeTranscript(
        'Vou dar 20% de desconto',
        -0.3,
      )
      expect(result.discountViolation).toBe(true)
      expect(result.empathyFailure).toBe(true)
      expect(result.correctionFeedback).toContain('desconto')
      expect(result.correctionFeedback).toContain('empatia')
    })
  })

  describe('buildFullPrompt', () => {
    it('deve construir prompt com sistema e usuário', () => {
      const sig = new AuditTranscriptSignature({
        transcript: 'O check-in é a partir das 14h',
        leadId: 'lead-1',
        canal: 'whatsapp',
        sentimentScore: 0.5,
      })
      const prompt = sig.buildFullPrompt()
      expect(prompt.systemPrompt).toContain('Auditor de qualidade')
      expect(prompt.userPrompt).toContain('lead-1')
      expect(prompt.userPrompt).toContain('O check-in é a partir das 14h')
    })

    it('deve rejeitar transcript vazio no construtor', () => {
      expect(() => new AuditTranscriptSignature({
        transcript: '',
        leadId: 'lead-1',
        canal: 'whatsapp',
        sentimentScore: 0.5,
      })).toThrow('transcript é obrigatório')
    })
  })
})

describe('QualityProxy (existente, verificado no Lote 5)', () => {
  it('deve pontuar baixo para resposta com markdown pesado + placeholder não resolvido', () => {
    const proxy = new QualityProxy()
    const badResponse = '### Confirmação\nOlá {{Nome}}!\n* opção 1\n* opção 2\n\nAguardamos você no [nosso espaço].'

    const result = proxy.assess('00', badResponse, 'teste')
    expect(result.finalScore).toBeLessThan(0.7)
  })

  it('deve pontuar alto para resposta limpa e concisa', () => {
    const proxy = new QualityProxy()
    const response = 'Olá! O check-in é a partir das 14h e o checkout até as 12h.'
    const result = proxy.assess('00', response, 'Qual o horário?')
    expect(result.finalScore).toBeGreaterThanOrEqual(0.7)
  })
})

describe('AuditorAgentService', () => {
  it('deve retornar relatório com interações que passaram pelo QualityProxy', () => {
    const interaction = makeInteraction()
    expect(interaction.isOk).toBe(true)
    if (!interaction.isOk) return

    const service = new AuditorAgentService(AuditTranscriptSignature.analyzeTranscript)
    const result = service.execute([interaction.value])

    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.totalInteractions).toBe(1)
      expect(result.value.flaggedCount).toBe(0)
      expect(result.value.items[0].passedQuality).toBe(true)
      expect(result.value.items[0].violations).toBeNull()
    }
  })

  it('deve sinalizar interação com qualidade baixa e extrair violações', () => {
    const interaction = makeInteraction({
      id: 'int-bad',
      canal: 'whatsapp',
      resumo: '### Oferta\nOlá {{Nome}}!\nVou dar 20% de desconto para o senhor. [Confirme aqui]\n* opção A\n* opção B\nNão podemos fazer nada sobre o problema.',
      sentimentScore: -0.5,
    })
    expect(interaction.isOk).toBe(true)
    if (!interaction.isOk) return

    const service = new AuditorAgentService(AuditTranscriptSignature.analyzeTranscript, 0.7)
    const result = service.execute([interaction.value])

    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.flaggedCount).toBe(1)
      expect(result.value.items[0].passedQuality).toBe(false)
      expect(result.value.items[0].violations).not.toBeNull()
      expect(result.value.items[0].violations!.discountViolation).toBe(true)
      expect(result.value.items[0].violations!.empathyFailure).toBe(true)
    }
  })

  it('deve permitir threshold configurável', () => {
    const interaction = makeInteraction({
      resumo: 'Resposta muito longa e cheia de markdown ' + '# Título\n```\ncódigo\n```\n* item\n'.repeat(20),
    })
    expect(interaction.isOk).toBe(true)
    if (!interaction.isOk) return

    const strictService = new AuditorAgentService(AuditTranscriptSignature.analyzeTranscript, 0.9)
    const result = strictService.execute([interaction.value])

    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.flaggedCount).toBeGreaterThanOrEqual(1)
    }
  })

  it('deve retornar erro para lista vazia de interações', () => {
    const service = new AuditorAgentService(AuditTranscriptSignature.analyzeTranscript)
    const result = service.execute([])
    expect(result.isOk).toBe(false)
  })

  it('deve orquestrar múltiplas interações e retornar relatório consolidado', () => {
    const i1 = makeInteraction({ id: 'int-1', resumo: 'Resposta educada e dentro do padrão.', sentimentScore: 0.5 })
    const i2 = makeInteraction({ id: 'int-2', canal: 'whatsapp', resumo: '### Oferta\nOlá {{Nome}}!\nVou dar 15% de desconto. [Confirme]\n* opção\nNão temos o que fazer.', sentimentScore: -0.8 })
    const i3 = makeInteraction({ id: 'int-3', resumo: 'Obrigado pelo contato! Seguem as informações.', sentimentScore: 0.8 })

    expect(i1.isOk && i2.isOk && i3.isOk).toBe(true)
    if (!i1.isOk || !i2.isOk || !i3.isOk) return

    const service = new AuditorAgentService(AuditTranscriptSignature.analyzeTranscript)
    const result = service.execute([i1.value, i2.value, i3.value])

    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.totalInteractions).toBe(3)
      expect(result.value.flaggedCount).toBe(1)
      expect(result.value.items[0].passedQuality).toBe(true)
      expect(result.value.items[1].passedQuality).toBe(false)
      expect(result.value.items[2].passedQuality).toBe(true)
    }
  })

  it('deve usar Result<T,E> e nunca lançar exceção', () => {
    const service = new AuditorAgentService(AuditTranscriptSignature.analyzeTranscript)
    const result = service.execute([] as any)
    expect(result.isOk).toBe(false)
  })
})
