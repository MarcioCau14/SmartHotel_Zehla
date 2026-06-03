import { describe, it, expect } from 'vitest'
import { FollowUpEngineService } from '../../domain/crm/services/FollowUpEngineService'
import { LeadProfile } from '../../domain/crm/models/LeadProfile'
import { InteractionRecord } from '../../domain/crm/models/InteractionRecord'
import { CRMPipelineStage } from '../../domain/crm/models/CRMPipelineStage'
import { CadenceClock } from '../../domain/crm/models/CadenceClock'
import { FollowUpAction } from '../../domain/crm/models/FollowUpAction'
import { FollowUpCadence, FOLLOW_UP_INTERVALS_MS } from '../../domain/crm/models/FollowUpSchedule'

function makeLead(overrides: Partial<{
  id: string
  stage: CRMPipelineStage
  nome: string
  telefone: string
  canalOrigem: string
  ltvScore: number
  propriedadeId: string
}> = {}) {
  const r = LeadProfile.create({
    id: overrides.id ?? 'lead_001',
    nome: overrides.nome ?? 'João',
    telefone: overrides.telefone ?? '5511999999999',
    canalOrigem: overrides.canalOrigem ?? 'whatsapp',
    ltvScore: overrides.ltvScore ?? 50,
    stage: overrides.stage ?? CRMPipelineStage.QUALIFICACAO,
    createdAt: new Date('2026-01-01'),
    propriedadeId: overrides.propriedadeId ?? 'prop_001',
  })
  if (r.isFail) throw r.error
  return r.value
}

function makeInteraction(overrides: Partial<{
  id: string
  leadId: string
  canal: string
  timestamp: Date
  sentimentScore: number
  tokenCost: number
  outcome: 'CONVERTED' | 'LOST' | 'PENDING'
  resumo: string
}> = {}) {
  const r = InteractionRecord.create({
    id: overrides.id ?? 'int_001',
    leadId: overrides.leadId ?? 'lead_001',
    canal: overrides.canal ?? 'whatsapp',
    timestamp: overrides.timestamp ?? new Date(),
    sentimentScore: overrides.sentimentScore ?? 0.5,
    tokenCost: overrides.tokenCost ?? 100,
    outcome: overrides.outcome ?? 'PENDING',
    resumo: overrides.resumo ?? 'Cliente pediu orçamento',
  })
  if (r.isFail) throw r.error
  return r.value
}

const BASE = new Date('2026-06-01T10:00:00Z')

describe('CadenceClock', () => {
  it('retorna null quando não atingiu nenhuma janela', () => {
    const clock = CadenceClock.create({
      lastInteractionAt: BASE,
      currentDate: new Date(BASE.getTime() + 60 * 60 * 1000),
    })
    expect(clock.isOk).toBe(true)
    expect(clock.value!.hasTriggered()).toBe(false)
    expect(clock.value!.mostAdvancedCadence).toBeNull()
  })

  it('dispara ENGAJAMENTO exatamente em 2h', () => {
    const clock = CadenceClock.create({
      lastInteractionAt: BASE,
      currentDate: new Date(BASE.getTime() + FOLLOW_UP_INTERVALS_MS.ENGAJAMENTO),
    })
    expect(clock.isOk).toBe(true)
    expect(clock.value!.mostAdvancedCadence).toBe('ENGAJAMENTO')
  })

  it('dispara URGENCIA exatamente em 24h', () => {
    const clock = CadenceClock.create({
      lastInteractionAt: BASE,
      currentDate: new Date(BASE.getTime() + FOLLOW_UP_INTERVALS_MS.URGENCIA),
    })
    expect(clock.isOk).toBe(true)
    expect(clock.value!.mostAdvancedCadence).toBe('URGENCIA')
  })

  it('dispara FECHAMENTO exatamente em 48h', () => {
    const clock = CadenceClock.create({
      lastInteractionAt: BASE,
      currentDate: new Date(BASE.getTime() + FOLLOW_UP_INTERVALS_MS.FECHAMENTO),
    })
    expect(clock.isOk).toBe(true)
    expect(clock.value!.mostAdvancedCadence).toBe('FECHAMENTO')
  })

  it('avança para a cadência mais avançada quando múltiplas janelas passaram', () => {
    const clock = CadenceClock.create({
      lastInteractionAt: BASE,
      currentDate: new Date(BASE.getTime() + FOLLOW_UP_INTERVALS_MS.FECHAMENTO + 1000),
    })
    expect(clock.isOk).toBe(true)
    expect(clock.value!.mostAdvancedCadence).toBe('FECHAMENTO')
  })

  it('falha se currentDate for anterior a lastInteractionAt', () => {
    const clock = CadenceClock.create({
      lastInteractionAt: BASE,
      currentDate: new Date(BASE.getTime() - 1000),
    })
    expect(clock.isFail).toBe(true)
  })
})

describe('FollowUpAction', () => {
  it('cria com isExecuted false e sem executedAt', () => {
    const action = FollowUpAction.create({ leadId: 'lead_001', scheduleType: 'ENGAJAMENTO' })
    expect(action.isOk).toBe(true)
    expect(action.value!.isExecuted).toBe(false)
    expect(action.value!.executedAt).toBeNull()
    expect(action.value!.scheduleType).toBe('ENGAJAMENTO')
    expect(action.value!.leadId).toBe('lead_001')
  })

  it('executar marca como executado', () => {
    const action = FollowUpAction.create({ leadId: 'lead_001', scheduleType: 'ENGAJAMENTO' }).value!
    const executed = action.executar()
    expect(executed.isOk).toBe(true)
    expect(executed.value!.isExecuted).toBe(true)
    expect(executed.value!.executedAt).toBeInstanceOf(Date)
  })

  it('executar falha se já executado', () => {
    const action = FollowUpAction.create({ leadId: 'lead_001', scheduleType: 'ENGAJAMENTO' }).value!
    const executed = action.executar().value!
    const double = executed.executar()
    expect(double.isFail).toBe(true)
  })

  it('falha se leadId for vazio', () => {
    const action = FollowUpAction.create({ leadId: '', scheduleType: 'ENGAJAMENTO' })
    expect(action.isFail).toBe(true)
  })
})

describe('FollowUpEngineService', () => {
  const engine = new FollowUpEngineService()

  it('emite ENGAJAMENTO exatamente 2h após última interação', () => {
    const lead = makeLead()
    const lastInt = makeInteraction({
      id: 'int_001',
      leadId: lead.id,
      timestamp: BASE,
    })
    const result = engine.execute({
      lead,
      interactions: [lastInt],
      currentDate: new Date(BASE.getTime() + FOLLOW_UP_INTERVALS_MS.ENGAJAMENTO),
    })
    expect(result.isOk).toBe(true)
    expect(result.value).not.toBeNull()
    expect(result.value!.scheduleType).toBe('ENGAJAMENTO')
  })

  it('emite URGENCIA exatamente 24h após última interação', () => {
    const lead = makeLead()
    const lastInt = makeInteraction({
      id: 'int_001',
      leadId: lead.id,
      timestamp: BASE,
    })
    const result = engine.execute({
      lead,
      interactions: [lastInt],
      currentDate: new Date(BASE.getTime() + FOLLOW_UP_INTERVALS_MS.URGENCIA),
    })
    expect(result.isOk).toBe(true)
    expect(result.value).not.toBeNull()
    expect(result.value!.scheduleType).toBe('URGENCIA')
  })

  it('emite FECHAMENTO exatamente 48h após última interação', () => {
    const lead = makeLead()
    const lastInt = makeInteraction({
      id: 'int_001',
      leadId: lead.id,
      timestamp: BASE,
    })
    const result = engine.execute({
      lead,
      interactions: [lastInt],
      currentDate: new Date(BASE.getTime() + FOLLOW_UP_INTERVALS_MS.FECHAMENTO),
    })
    expect(result.isOk).toBe(true)
    expect(result.value).not.toBeNull()
    expect(result.value!.scheduleType).toBe('FECHAMENTO')
  })

  it('não gera follow-up se lead respondeu (reinicia clock)', () => {
    const lead = makeLead()
    const oldInt = makeInteraction({
      id: 'int_old',
      leadId: lead.id,
      timestamp: new Date(BASE.getTime() - 48 * 60 * 60 * 1000),
      outcome: 'PENDING',
    })
    const recentInt = makeInteraction({
      id: 'int_recent',
      leadId: lead.id,
      timestamp: new Date(BASE.getTime() - 60 * 60 * 1000),
      outcome: 'PENDING',
    })
    const result = engine.execute({
      lead,
      interactions: [oldInt, recentInt],
      currentDate: BASE,
    })
    expect(result.isOk).toBe(true)
    expect(result.value).toBeNull()
  })

  it('não gera follow-up para leads em FECHAMENTO', () => {
    const lead = makeLead({ stage: CRMPipelineStage.FECHAMENTO })
    const lastInt = makeInteraction({
      id: 'int_001',
      leadId: lead.id,
      timestamp: new Date(BASE.getTime() - 48 * 60 * 60 * 1000),
    })
    const result = engine.execute({
      lead,
      interactions: [lastInt],
      currentDate: BASE,
    })
    expect(result.isOk).toBe(true)
    expect(result.value).toBeNull()
  })

  it('não gera follow-up para leads em ENTRADA', () => {
    const lead = makeLead({ stage: CRMPipelineStage.ENTRADA })
    const lastInt = makeInteraction({
      id: 'int_001',
      leadId: lead.id,
      timestamp: new Date(BASE.getTime() - 48 * 60 * 60 * 1000),
    })
    const result = engine.execute({
      lead,
      interactions: [lastInt],
      currentDate: BASE,
    })
    expect(result.isOk).toBe(true)
    expect(result.value).toBeNull()
  })

  it('não gera follow-up se a última interação foi CONVERTED', () => {
    const lead = makeLead()
    const lastInt = makeInteraction({
      id: 'int_001',
      leadId: lead.id,
      timestamp: new Date(BASE.getTime() - 48 * 60 * 60 * 1000),
      outcome: 'CONVERTED',
    })
    const result = engine.execute({
      lead,
      interactions: [lastInt],
      currentDate: BASE,
    })
    expect(result.isOk).toBe(true)
    expect(result.value).toBeNull()
  })

  it('não gera follow-up se clock não atingiu nenhuma janela', () => {
    const lead = makeLead()
    const lastInt = makeInteraction({
      id: 'int_001',
      leadId: lead.id,
      timestamp: BASE,
    })
    const result = engine.execute({
      lead,
      interactions: [lastInt],
      currentDate: new Date(BASE.getTime() + 30 * 60 * 1000),
    })
    expect(result.isOk).toBe(true)
    expect(result.value).toBeNull()
  })

  it('retorna null se não há interações', () => {
    const lead = makeLead()
    const result = engine.execute({
      lead,
      interactions: [],
      currentDate: BASE,
    })
    expect(result.isOk).toBe(true)
    expect(result.value).toBeNull()
  })
})
