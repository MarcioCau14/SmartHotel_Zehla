import { describe, it, expect } from 'vitest'
import { GenerateFollowUpSignature } from '../../domain/crm/cognitive/GenerateFollowUpSignature'
import { CRMPipelineStage } from '../../domain/crm/models/CRMPipelineStage'

function makeSig(overrides: Partial<{
  leadName: string
  leadStage: CRMPipelineStage
  scheduleType: 'ENGAJAMENTO' | 'URGENCIA' | 'FECHAMENTO'
  lastInteractionSummary: string
}> = {}) {
  return new GenerateFollowUpSignature({
    leadName: overrides.leadName ?? 'Maria',
    leadStage: overrides.leadStage ?? CRMPipelineStage.PROPOSTA,
    scheduleType: overrides.scheduleType ?? 'ENGAJAMENTO',
    lastInteractionSummary: overrides.lastInteractionSummary ?? 'Cliente pediu orçamento para casal 3 diárias em junho.',
  })
}

describe('GenerateFollowUpSignature', () => {
  it('interpola o nome do lead no context block', () => {
    const sig = makeSig({ leadName: 'João' })
    const ctx = sig.contextBlock
    expect(ctx).toContain('João')
    expect(ctx).not.toContain('Maria')
  })

  it('interpola o estágio do funil no context block', () => {
    const sig = makeSig({ leadStage: CRMPipelineStage.QUALIFICACAO })
    const ctx = sig.contextBlock
    expect(ctx).toContain('QUALIFICACAO')
  })

  it('interpola o resumo da última interação no context block', () => {
    const summary = 'Lead perguntou sobre pacotes para reveillon'
    const sig = makeSig({ lastInteractionSummary: summary })
    const ctx = sig.contextBlock
    expect(ctx).toContain(summary)
  })

  it('inclui o scheduleType no user prompt e context block', () => {
    const sig = makeSig({ scheduleType: 'URGENCIA' })
    const prompt = sig.buildFullPrompt()
    expect(prompt.userPrompt).toContain('URGENCIA')
    expect(sig.contextBlock).toContain('URGENCIA')
  })

  it('ENGAJAMENTO system prompt é amigável, sem pressão e sem estratégia de escassez', () => {
    const sig = makeSig({ scheduleType: 'ENGAJAMENTO' })
    const sp = sig.systemPrompt
    expect(sp).toContain('amigável')
    expect(sp).toContain('sem pressão')
    expect(sp).toContain('empurrar venda')
    expect(sp).toContain('pergunta aberta')
  })

  it('URGENCIA system prompt contém gatilho de escassez', () => {
    const sig = makeSig({ scheduleType: 'URGENCIA' })
    const sp = sig.systemPrompt
    const containsScarcity = sp.includes('escassez') || sp.includes('poucas unidades') || sp.includes('alta procura') || sp.includes('não inventar números')
    expect(containsScarcity).toBe(true)
  })

  it('FECHAMENTO system prompt contém última chamada e CTA', () => {
    const sig = makeSig({ scheduleType: 'FECHAMENTO' })
    const sp = sig.systemPrompt
    expect(sp).toContain('última chamada')
    expect(sp).toContain('call to action')
    expect(sp).toContain('prazo')
    expect(sp).toContain('benefício')
  })

  it('system prompts são diferentes entre cadências', () => {
    const eng = makeSig({ scheduleType: 'ENGAJAMENTO' }).systemPrompt
    const urg = makeSig({ scheduleType: 'URGENCIA' }).systemPrompt
    const fec = makeSig({ scheduleType: 'FECHAMENTO' }).systemPrompt
    expect(eng).not.toBe(urg)
    expect(urg).not.toBe(fec)
    expect(eng).not.toBe(fec)
  })

  it('buildFullPrompt retorna estrutura completa (system + user + outputFormat)', () => {
    const sig = makeSig()
    const prompt = sig.buildFullPrompt()
    expect(prompt).toHaveProperty('systemPrompt')
    expect(prompt).toHaveProperty('userPrompt')
    expect(prompt).toHaveProperty('outputFormat')
    expect(prompt.systemPrompt.length).toBeGreaterThan(0)
    expect(prompt.userPrompt.length).toBeGreaterThan(0)
    expect(prompt.outputPrompt).toBeUndefined()
    expect(prompt.outputFormat).toContain('mensagem de WhatsApp')
  })

  it('falha se leadName for vazio', () => {
    expect(() => {
      new GenerateFollowUpSignature({
        leadName: '',
        leadStage: CRMPipelineStage.PROPOSTA,
        scheduleType: 'ENGAJAMENTO',
        lastInteractionSummary: 'algum resumo',
      })
    }).toThrow('leadName é obrigatório')
  })

  it('falha se lastInteractionSummary for vazio', () => {
    expect(() => {
      new GenerateFollowUpSignature({
        leadName: 'João',
        leadStage: CRMPipelineStage.PROPOSTA,
        scheduleType: 'ENGAJAMENTO',
        lastInteractionSummary: '',
      })
    }).toThrow('lastInteractionSummary é obrigatório')
  })

  it('userPrompt contém o nome do lead e instrução de personalização', () => {
    const sig = makeSig({ leadName: 'Carlos' })
    const prompt = sig.buildFullPrompt()
    expect(prompt.userPrompt).toContain('Carlos')
    expect(prompt.userPrompt).toContain('português')
    expect(prompt.userPrompt).toContain('personalizada')
  })
})

describe('GenerateFollowUpSignature — integração com domínio CRM', () => {
  it('aceita qualquer CRMPipelineStage válido como leadStage', () => {
    const stages = Object.values(CRMPipelineStage)
    for (const stage of stages) {
      const sig = makeSig({ leadStage: stage })
      const ctx = sig.contextBlock
      expect(ctx).toContain(stage)
    }
  })

  it('aceita qualquer FollowUpCadence como scheduleType', () => {
    const cadences: Array<'ENGAJAMENTO' | 'URGENCIA' | 'FECHAMENTO'> = ['ENGAJAMENTO', 'URGENCIA', 'FECHAMENTO']
    for (const c of cadences) {
      const sig = makeSig({ scheduleType: c })
      expect(sig.cadenceConfig).toBeDefined()
      expect(sig.cadenceConfig.strategy.length).toBeGreaterThan(0)
    }
  })
})
