import { describe, it, expect, beforeEach } from 'vitest'
import { LeadProfile } from '../../domain/crm/models/LeadProfile'
import { CRMPipelineStage, ICPersona } from '../../domain/crm/models/CRMPipelineStage'
import { Result } from '../../shared/Result'
import { ICRMRepositoryPort } from '../../domain/crm/ports/ICRMRepositoryPort'
import { IZaosMemoryPort, MemoryEntry } from '../../domain/memory/IZaosMemoryPort'
import { IPIIHasherPort } from '../../domain/privacy/ports/IPIIHasherPort'
import { IPrivacyEventBusPort, PrivacyExpungeEvent } from '../../domain/privacy/ports/IPrivacyEventBusPort'
import { PIIObfuscator } from '../../domain/privacy/services/PIIObfuscator'
import { ProcessPrivacyExpungeUseCase } from '../../application/privacy/use-cases/ProcessPrivacyExpungeUseCase'

// ─── Fakes In-Memory ────────────────────────────────────────────────

class FakeCRMRepo implements ICRMRepositoryPort {
  private leads = new Map<string, LeadProfile>()

  async salvarLead(lead: LeadProfile): Promise<Result<LeadProfile, Error>> {
    this.leads.set(lead.id, lead)
    return Result.ok(lead)
  }

  async buscarLeadPorId(id: string): Promise<Result<LeadProfile | null, Error>> {
    return Result.ok(this.leads.get(id) ?? null)
  }

  async buscarLeadPorTelefone(_telefone: string): Promise<Result<LeadProfile | null, Error>> {
    return Result.ok(null)
  }

  async listarLeadsPorStage(_stage: CRMPipelineStage): Promise<Result<LeadProfile[], Error>> {
    return Result.ok([])
  }

  async registrarInteracao(_record: any): Promise<Result<any, Error>> {
    return Result.ok(null as any)
  }

  async listarInteracoesPorLead(_leadId: string): Promise<Result<any[], Error>> {
    return Result.ok([])
  }

  async atualizarStage(_leadId: string, _stage: CRMPipelineStage): Promise<Result<LeadProfile, Error>> {
    return Result.fail(new Error('not implemented'))
  }

  async atualizarLead(lead: LeadProfile): Promise<Result<LeadProfile, Error>> {
    this.leads.set(lead.id, lead)
    return Result.ok(lead)
  }

  seed(lead: LeadProfile): void {
    this.leads.set(lead.id, lead)
  }

  getLead(id: string): LeadProfile | undefined {
    return this.leads.get(id)
  }
}

class FakeMemoryPort implements IZaosMemoryPort {
  deleteByLeadIdCalls: Array<{ leadId: string; tenantId: string }> = []

  async store(_entry: Omit<MemoryEntry, 'createdAt' | 'updatedAt'>): Promise<Result<MemoryEntry>> {
    return Result.ok(null as any)
  }

  async search(_query: any): Promise<Result<any[]>> {
    return Result.ok([])
  }

  async getById(_id: string, _tenantId: string): Promise<Result<MemoryEntry>> {
    return Result.fail(new Error('not found') as any)
  }

  async deleteById(_id: string, _tenantId: string): Promise<Result<void>> {
    return Result.ok(undefined)
  }

  async getByTenant(_tenantId: string): Promise<Result<MemoryEntry[]>> {
    return Result.ok([])
  }

  async deleteByLeadId(leadId: string, tenantId: string): Promise<Result<void>> {
    this.deleteByLeadIdCalls.push({ leadId, tenantId })
    return Result.ok(undefined)
  }
}

class FakePIIHasher implements IPIIHasherPort {
  hash(value: string): string {
    return `HASH_${value.split('').reverse().join('')}`
  }
}

class FakePrivacyEventBus implements IPrivacyEventBusPort {
  events: PrivacyExpungeEvent[] = []

  async publishExpungeCompleted(event: PrivacyExpungeEvent): Promise<void> {
    this.events.push(event)
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────

function createTestLead(overrides?: Partial<{
  id: string; nome: string; telefone: string; email: string | undefined;
  propriedadeId: string; ltvScore: number; totalSpentUsd: number;
  staysCount: number; persona: ICPersona; stage: CRMPipelineStage;
  bookingValueUsd: number | null; canalOrigem: string;
}>): LeadProfile {
  const defaults = {
    id: 'lead-001', nome: 'Maria Silva', telefone: '(11) 91234-5678',
    email: 'maria@exemplo.com' as string | undefined,
    canalOrigem: 'whatsapp', ltvScore: 72, stage: CRMPipelineStage.NEGOCIACAO,
    createdAt: new Date('2025-01-15'), propriedadeId: 'pousada-01',
    persona: ICPersona.HOSPEDE_ROMANTICO, totalSpentUsd: 1250, staysCount: 3,
    lastInteractionAt: new Date('2026-06-01'), bookingValueUsd: 450,
    tags: ['vip', 'repeat'],
  }
  const merged = { ...defaults, ...overrides }
  const result = LeadProfile.create({
    id: merged.id,
    nome: merged.nome,
    telefone: merged.telefone,
    email: merged.email,
    canalOrigem: merged.canalOrigem,
    ltvScore: merged.ltvScore,
    stage: merged.stage,
    createdAt: merged.createdAt,
    propriedadeId: merged.propriedadeId,
    persona: merged.persona,
    totalSpentUsd: merged.totalSpentUsd,
    staysCount: merged.staysCount,
    lastInteractionAt: merged.lastInteractionAt,
    bookingValueUsd: merged.bookingValueUsd,
    tags: merged.tags,
  })
  if (result.isFail) throw result.error
  return result.value!
}

// ─── Tests ───────────────────────────────────────────────────────────

describe('Tese 8 — LGPD Privacy (Right to be Forgotten)', () => {
  let crmRepo: FakeCRMRepo
  let memoryPort: FakeMemoryPort
  let hasher: FakePIIHasher
  let eventBus: FakePrivacyEventBus
  let obfuscator: PIIObfuscator
  let useCase: ProcessPrivacyExpungeUseCase

  const lead = createTestLead()

  beforeEach(() => {
    crmRepo = new FakeCRMRepo()
    memoryPort = new FakeMemoryPort()
    hasher = new FakePIIHasher()
    eventBus = new FakePrivacyEventBus()
    obfuscator = new PIIObfuscator(hasher)
    useCase = new ProcessPrivacyExpungeUseCase(crmRepo, memoryPort, obfuscator, eventBus)
  })

  it('T8.1: após expurgo, nome/telefone/email do lead são hashes, não plaintext', async () => {
    crmRepo.seed(lead)
    const result = await useCase.execute('lead-001', 'pousada-01')
    expect(result.isOk).toBe(true)

    const saved = crmRepo.getLead('lead-001')!
    expect(saved.nome).toBe(hasher.hash('Maria Silva'))
    expect(saved.telefone).toBe(hasher.hash('(11) 91234-5678'))
    expect(saved.email).toBe(hasher.hash('maria@exemplo.com'))
    expect(saved.nome).not.toBe('Maria Silva')
    expect(saved.telefone).not.toBe('(11) 91234-5678')
    expect(saved.email).not.toBe('maria@exemplo.com')
  })

  it('T8.2: LTV e métricas comerciais permanecem intactos após ofuscação', async () => {
    crmRepo.seed(lead)
    const result = await useCase.execute('lead-001', 'pousada-01')
    expect(result.isOk).toBe(true)

    const saved = crmRepo.getLead('lead-001')!
    expect(saved.ltvScore).toBe(72)
    expect(saved.totalSpentUsd).toBe(1250)
    expect(saved.staysCount).toBe(3)
    expect(saved.bookingValueUsd).toBe(450)
    expect(saved.stage).toBe(CRMPipelineStage.NEGOCIACAO)
    expect(saved.persona).toBe(ICPersona.HOSPEDE_ROMANTICO)
    expect(saved.canalOrigem).toBe('whatsapp')
    expect(saved.id).toBe('lead-001')
  })

  it('T8.3: A-MEM registra deleção com tenantId correto', async () => {
    crmRepo.seed(lead)
    const result = await useCase.execute('lead-001', 'pousada-01')
    expect(result.isOk).toBe(true)

    expect(memoryPort.deleteByLeadIdCalls).toHaveLength(1)
    expect(memoryPort.deleteByLeadIdCalls[0].leadId).toBe('lead-001')
    expect(memoryPort.deleteByLeadIdCalls[0].tenantId).toBe('pousada-01')
  })

  it('T8.4: evento PrivacyExpungeCompleted publicado com leadId e operationHash', async () => {
    crmRepo.seed(lead)
    const result = await useCase.execute('lead-001', 'pousada-01')
    expect(result.isOk).toBe(true)

    expect(eventBus.events).toHaveLength(1)
    expect(eventBus.events[0].leadId).toBe('lead-001')
    expect(eventBus.events[0].tenantId).toBe('pousada-01')
    expect(eventBus.events[0].operationHash).toMatch(/^EXPUNGE_[0-9a-f]+$/)
    expect(eventBus.events[0].occurredAt).toBeInstanceOf(Date)
  })

  it('T8.5: tenant mismatch bloqueia o expurgo', async () => {
    crmRepo.seed(lead)
    const result = await useCase.execute('lead-001', 'pousada-outra')
    expect(result.isFail).toBe(true)
    if (result.isFail) {
      expect(result.error.message).toContain('Tenant mismatch')
    }

    // Nada foi alterado
    const saved = crmRepo.getLead('lead-001')!
    expect(saved.nome).toBe('Maria Silva')
    expect(memoryPort.deleteByLeadIdCalls).toHaveLength(0)
    expect(eventBus.events).toHaveLength(0)
  })

  it('T8.6: expurgo é idempotente (segunda execução não quebra)', async () => {
    crmRepo.seed(lead)
    const first = await useCase.execute('lead-001', 'pousada-01')
    expect(first.isOk).toBe(true)

    const second = await useCase.execute('lead-001', 'pousada-01')
    expect(second.isOk).toBe(true)

    // A-MEM foi chamado duas vezes (idempotência no lado do adaptador)
    expect(memoryPort.deleteByLeadIdCalls).toHaveLength(2)

    // Dados permanecem ofuscados (double-hashed na segunda passagem)
    const saved = crmRepo.getLead('lead-001')!
    expect(saved.nome).not.toBe('Maria Silva')
    expect(saved.nome).toContain('HASH_')
    expect(saved.ltvScore).toBe(72)

    // Dois eventos publicados
    expect(eventBus.events).toHaveLength(2)
  })

  it('T8.7: lead inexistente retorna erro', async () => {
    const result = await useCase.execute('lead-inexistente', 'pousada-01')
    expect(result.isFail).toBe(true)
    if (result.isFail) {
      expect(result.error.message).toContain('Lead não encontrado')
    }
  })

  it('T8.8: leadId vazio retorna erro de validação', async () => {
    const result = await useCase.execute('', 'pousada-01')
    expect(result.isFail).toBe(true)
    if (result.isFail) {
      expect(result.error.message).toContain('ID do lead é obrigatório')
    }
  })

  it('T8.9: PIIObfuscator trata email undefined sem quebrar', async () => {
    const leadSemEmail = createTestLead({ email: undefined })
    const r = obfuscator.obfuscate(leadSemEmail)
    expect(r.isOk).toBe(true)
    if (r.isOk) {
      expect(r.value.email).toBeUndefined()
      expect(r.value.ltvScore).toBe(72)
    }
  })

  it('T8.10: obfuscateList ofusca múltiplos leads mantendo métricas', async () => {
    const lead1 = createTestLead({ id: 'l1', nome: 'João' })
    const lead2 = createTestLead({ id: 'l2', nome: 'Ana' })
    const r = obfuscator.obfuscateList([lead1, lead2])
    expect(r.isOk).toBe(true)
    if (r.isOk) {
      expect(r.value[0].nome).toBe(hasher.hash('João'))
      expect(r.value[0].id).toBe('l1')
      expect(r.value[0].ltvScore).toBe(72)
      expect(r.value[1].nome).toBe(hasher.hash('Ana'))
      expect(r.value[1].id).toBe('l2')
    }
  })
})


