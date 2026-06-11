import { describe, it, expect } from 'vitest'
import { InteractionRecord } from '../../domain/crm/models/InteractionRecord'
import { QualityProxy } from '../../domain/decision/services/QualityProxy'
import { AuditTranscriptSignature } from '../../domain/crm/cognitive/AuditTranscriptSignature'
import { AuditorAgentService } from '../../domain/crm/services/AuditorAgentService'
import { TranscriptQualityScore, COMPLIANCE_THRESHOLD, TESE7_WEIGHTS } from '../../domain/crm/models/TranscriptQualityScore'
import { EWC_DR } from '../../domain/crm/services/EWC_DR'

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

describe('Tese 7 — TranscriptQualityScore VO', () => {
  it('T7.1: create com scores válidos retorna VO congelado', () => {
    const r = TranscriptQualityScore.create({
      schemaScore: 1.0, formatScore: 0.8, sentimentScore: 0.9,
      keywordsScore: 1.0, hallucinationScore: 0.9, lengthScore: 1.0,
    })
    expect(r.isOk).toBe(true)
    if (r.isOk) {
      expect(Object.isFrozen(r.value)).toBe(true)
    }
  })

  it('T7.2: rejeita score fora do intervalo [0,1]', () => {
    const r = TranscriptQualityScore.create({
      schemaScore: 1.5, formatScore: 0.8, sentimentScore: 0.9,
      keywordsScore: 1.0, hallucinationScore: 0.9, lengthScore: 1.0,
    })
    expect(r.isFail).toBe(true)
  })

  it('T7.3: cálculo ponderado obedece precisamente aos pesos Tese 7', () => {
    const r = TranscriptQualityScore.create({
      schemaScore: 1.0, formatScore: 1.0, sentimentScore: 1.0,
      keywordsScore: 1.0, hallucinationScore: 1.0, lengthScore: 1.0,
    })
    expect(r.isOk).toBe(true)
    if (r.isOk) {
      const expected = 1.0 * TESE7_WEIGHTS.schema + 1.0 * TESE7_WEIGHTS.format
        + 1.0 * TESE7_WEIGHTS.sentiment + 1.0 * TESE7_WEIGHTS.keywords
        + 1.0 * TESE7_WEIGHTS.hallucination + 1.0 * TESE7_WEIGHTS.length
      expect(r.value.finalScore).toBeCloseTo(expected, 5)
    }
  })

  it('T7.4: finalScore 0.86 é compliant (0.86 > 0.85)', () => {
    const r = TranscriptQualityScore.create({
      schemaScore: 1.0, formatScore: 0.8, sentimentScore: 0.8,
      keywordsScore: 0.5, hallucinationScore: 1.0, lengthScore: 1.0,
    })
    expect(r.isOk).toBe(true)
    if (r.isOk) {
      expect(r.value.finalScore).toBeGreaterThan(COMPLIANCE_THRESHOLD)
      const c = r.value.isCompliant()
      expect(c.isOk).toBe(true)
      if (c.isOk) expect(c.value).toBe(true)
    }
  })

  it('T7.5: finalScore 0.50 NÃO é compliant (0.50 ≤ 0.85)', () => {
    const r = TranscriptQualityScore.create({
      schemaScore: 0.5, formatScore: 0.5, sentimentScore: 0.5,
      keywordsScore: 0.5, hallucinationScore: 0.5, lengthScore: 0.5,
    })
    expect(r.isOk).toBe(true)
    if (r.isOk) {
      expect(r.value.finalScore).toBeLessThanOrEqual(COMPLIANCE_THRESHOLD)
      const c = r.value.isCompliant()
      expect(c.isOk).toBe(true)
      if (c.isOk) expect(c.value).toBe(false)
    }
  })

  it('T7.6: isCompliant rejeita threshold inválido', () => {
    const r = TranscriptQualityScore.create({
      schemaScore: 0.5, formatScore: 0.5, sentimentScore: 0.5,
      keywordsScore: 0.5, hallucinationScore: 0.5, lengthScore: 0.5,
    })
    expect(r.isOk).toBe(true)
    if (r.isOk) {
      const c = r.value.isCompliant(1.5)
      expect(c.isFail).toBe(true)
    }
  })
})

describe('Tese 7 — PII Detection (QualityProxy)', () => {
  const proxy = new QualityProxy()

  it('T7.7: transcrição com CPF zera schemaScore e formatScore', () => {
    const result = proxy.assess('00', 'Meu CPF é 123.456.789-00, pode confirmar?', '')
    expect(result.schemaScore).toBe(0)
    expect(result.formatScore).toBe(0)
  })

  it('T7.8: transcrição com telefone zera schemaScore e formatScore', () => {
    const result = proxy.assess('00', 'Ligue para (11) 91234-5678 para confirmar', '')
    expect(result.schemaScore).toBe(0)
    expect(result.formatScore).toBe(0)
  })

  it('T7.9: transcrição com email zera schemaScore e formatScore', () => {
    const result = proxy.assess('00', 'Envie para test@exemplo.com.br', '')
    expect(result.schemaScore).toBe(0)
    expect(result.formatScore).toBe(0)
  })

  it('T7.10: transcrição sem PII mantém scores normais', () => {
    const result = proxy.assess('00', 'O check-in é a partir das 14h, ok?', '')
    expect(result.schemaScore).toBeGreaterThan(0)
    expect(result.formatScore).toBeGreaterThan(0)
  })

  it('T7.11: transcriptAssess retorna TranscriptQualityScore congelado', () => {
    const result = proxy.transcriptAssess('Resposta educada e dentro do padrão.')
    expect(Object.isFrozen(result)).toBe(true)
    expect(result.finalScore).toBeGreaterThan(0)
  })
})

describe('Tese 7 — EWC-DR Barrier', () => {
  const ewc = new EWC_DR()

  function makeProposal(overrides?: Partial<{ ruleName: string; currentPrompt: string; proposedPrompt: string; reason: string }>) {
    return {
      ruleName: 'desconto_maximo',
      currentPrompt: 'Nunca dê descontos acima de 10%',
      proposedPrompt: 'Descontos de até 15% são permitidos com aprovação',
      reason: 'Alta temporada requer flexibilidade',
      ...overrides,
    }
  }

  it('T7.12: EWC-DR bloqueia evolução quando qualidade está abaixo do threshold', () => {
    const r = TranscriptQualityScore.create({
      schemaScore: 0.5, formatScore: 0.5, sentimentScore: 0.5,
      keywordsScore: 0.5, hallucinationScore: 0.5, lengthScore: 0.5,
    })
    expect(r.isOk).toBe(true)
    if (r.isOk) {
      const guard = ewc.guard(r.value, makeProposal())
      expect(guard.isFail).toBe(true)
      if (guard.isFail) {
        expect(guard.error.message).toContain('BLOQUEADA')
        expect(guard.error.message).toContain('desconto_maximo')
      }
    }
  })

  it('T7.13: EWC-DR permite evolução quando qualidade está acima do threshold', () => {
    const r = TranscriptQualityScore.create({
      schemaScore: 1.0, formatScore: 0.9, sentimentScore: 0.9,
      keywordsScore: 1.0, hallucinationScore: 1.0, lengthScore: 1.0,
    })
    expect(r.isOk).toBe(true)
    if (r.isOk) {
      const guard = ewc.guard(r.value, makeProposal())
      expect(guard.isOk).toBe(true)
      if (guard.isOk) {
        expect(guard.value.ruleName).toBe('desconto_maximo')
      }
    }
  })

  it('T7.14: EWC-DR rejeita proposal sem ruleName', () => {
    const r = TranscriptQualityScore.create({
      schemaScore: 1.0, formatScore: 1.0, sentimentScore: 1.0,
      keywordsScore: 1.0, hallucinationScore: 1.0, lengthScore: 1.0,
    })
    expect(r.isOk).toBe(true)
    if (r.isOk) {
      const guard = ewc.guard(r.value, makeProposal({ ruleName: '' }))
      expect(guard.isFail).toBe(true)
    }
  })
})
