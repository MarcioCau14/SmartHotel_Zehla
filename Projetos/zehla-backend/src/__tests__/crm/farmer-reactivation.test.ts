import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LeadProfile } from '../../domain/crm/models/LeadProfile'
import { ReservationSnapshot } from '../../domain/crm/models/ReservationSnapshot'
import { ReactivationEligibility, REACTIVATION_THRESHOLD_DAYS, lgpdPermiteReativacao } from '../../domain/crm/models/ReactivationEligibility'
import { ReactivationCandidate } from '../../domain/crm/models/ReactivationCandidate'
import { FarmerReactivationService } from '../../domain/crm/services/FarmerReactivationService'
import { IdentifyReactivationCandidatesUseCase } from '../../application/crm/use-cases/IdentifyReactivationCandidatesUseCase'
import { CRMPipelineStage } from '../../domain/crm/models/CRMPipelineStage'
import { ConsentimentoLGPD } from '../../domain/crm/models/MarketIntelligence'
import { Result } from '../../shared/Result'

function makeLead(overrides?: Partial<Parameters<typeof LeadProfile.create>[0]>) {
  return LeadProfile.create({
    id: 'lead-1',
    nome: 'Carlos Almeida',
    telefone: '5511988888888',
    email: 'carlos@test.com',
    canalOrigem: 'website',
    ltvScore: 80,
    stage: CRMPipelineStage.FECHAMENTO,
    createdAt: new Date('2024-01-15'),
    propriedadeId: 'prop-1',
    ...overrides,
  })
}

function makeReservation(checkoutDate: Date, status: 'COMPLETED' | 'FUTURE' | 'CANCELLED' = 'COMPLETED') {
  return ReservationSnapshot.create({
    id: `res-${Date.now()}-${Math.random()}`,
    leadId: 'lead-1',
    checkoutDate,
    status,
    propriedadeId: 'prop-1',
  })
}

describe('Farmer IA — ReactivationEligibility', () => {
  it('a) Reserva com check-out há 179 dias retorna isEligible: false', () => {
    const checkout = new Date('2026-06-03T00:00:00Z')
    const currentDate = new Date('2026-11-29T00:00:00Z')
    const result = ReactivationEligibility.evaluate(checkout, currentDate)

    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.isEligible).toBe(false)
      expect(result.value.daysSinceCheckout).toBe(179)
    }
  })

  it('b) Reserva com check-out há 181 dias retorna isEligible: true', () => {
    const checkout = new Date('2026-06-01T00:00:00Z')
    const currentDate = new Date('2026-11-29T00:00:00Z')
    const result = ReactivationEligibility.evaluate(checkout, currentDate)

    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.isEligible).toBe(true)
      expect(result.value.daysSinceCheckout).toBe(181)
    }
  })

  it('b2) Limite exato: 180 dias retorna isEligible: false (ESTRITAMENTE superior)', () => {
    const checkout = new Date('2026-06-02T00:00:00Z')
    const currentDate = new Date('2026-11-29T00:00:00Z')
    const result = ReactivationEligibility.evaluate(checkout, currentDate)

    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.isEligible).toBe(false)
      expect(result.value.daysSinceCheckout).toBe(REACTIVATION_THRESHOLD_DAYS)
    }
  })
})

describe('Farmer IA — FarmerReactivationService', () => {
  const service = new FarmerReactivationService()

  it('c) Rejeita lead com reserva antiga (200 dias) + reserva futura', () => {
    const hoje = new Date('2026-11-29T00:00:00Z')

    const leadResult = makeLead()
    expect(leadResult.isOk).toBe(true)
    if (!leadResult.isOk) return
    const lead = leadResult.value

    const checkoutAntigo = new Date('2026-05-13T00:00:00Z')
    const reservaAntiga = makeReservation(checkoutAntigo, 'COMPLETED')
    expect(reservaAntiga.isOk).toBe(true)

    const checkinFuturo = new Date('2026-12-09T00:00:00Z')
    const reservaFutura = makeReservation(checkinFuturo, 'FUTURE')
    expect(reservaFutura.isOk).toBe(true)

    const result = service.execute(lead, [
      reservaAntiga.value,
      reservaFutura.value,
    ], hoje)

    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value).toBeNull()
    }
  })

  it('d) Aprova lead qualificado com reserva antiga e sem reserva futura', () => {
    const hoje = new Date('2026-11-29T00:00:00Z')

    const leadResult = makeLead()
    expect(leadResult.isOk).toBe(true)
    if (!leadResult.isOk) return
    const lead = leadResult.value

    const checkoutAntigo = new Date('2026-04-15T00:00:00Z')
    const reserva = makeReservation(checkoutAntigo, 'COMPLETED')
    expect(reserva.isOk).toBe(true)

    const result = service.execute(lead, [reserva.value], hoje)

    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value).not.toBeNull()
      expect(result.value!.leadId).toBe('lead-1')
      expect(result.value!.daysSinceCheckout).toBeGreaterThan(REACTIVATION_THRESHOLD_DAYS)
    }
  })

  it('d2) Aprova lead com multiplas reservas antigas, usa a mais antiga', () => {
    const hoje = new Date('2026-11-29T00:00:00Z')

    const leadResult = makeLead()
    expect(leadResult.isOk).toBe(true)
    if (!leadResult.isOk) return
    const lead = leadResult.value

    const reserva200 = makeReservation(new Date('2026-05-13T00:00:00Z'), 'COMPLETED')
    expect(reserva200.isOk).toBe(true)
    const reserva220 = makeReservation(new Date('2026-04-23T00:00:00Z'), 'COMPLETED')
    expect(reserva220.isOk).toBe(true)

    const result = service.execute(lead, [reserva200.value, reserva220.value], hoje)

    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value).not.toBeNull()
      expect(result.value!.daysSinceCheckout).toBeGreaterThanOrEqual(220)
    }
  })

  it('d3) Servico retorna null se lead nao tem nenhuma reserva', () => {
    const hoje = new Date('2026-11-29T00:00:00Z')

    const leadResult = makeLead()
    expect(leadResult.isOk).toBe(true)
    if (!leadResult.isOk) return
    const lead = leadResult.value

    const result = service.execute(lead, [], hoje)

    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value).toBeNull()
    }
  })

  it('d4) Servico rejeita se a unica reserva esta cancelada', () => {
    const hoje = new Date('2026-11-29T00:00:00Z')

    const leadResult = makeLead()
    expect(leadResult.isOk).toBe(true)
    if (!leadResult.isOk) return
    const lead = leadResult.value

    const reservaCancelada = makeReservation(new Date('2025-01-01T00:00:00Z'), 'CANCELLED')
    expect(reservaCancelada.isOk).toBe(true)

    const result = service.execute(lead, [reservaCancelada.value], hoje)

    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value).toBeNull()
    }
  })
})

describe('Farmer IA — LGPD Consent', () => {
  const hoje = new Date('2026-11-29T00:00:00Z')
  const checkoutElegivel = new Date('2026-05-01T00:00:00Z')

  it('e) lgpdPermiteReativacao("consentimento") retorna true', () => {
    expect(lgpdPermiteReativacao('consentimento')).toBe(true)
  })

  it('f) lgpdPermiteReativacao("legitimo_interesse") retorna true', () => {
    expect(lgpdPermiteReativacao('legitimo_interesse')).toBe(true)
  })

  it('g) lgpdPermiteReativacao("sem_consentimento") retorna false', () => {
    expect(lgpdPermiteReativacao('sem_consentimento')).toBe(false)
  })

  it('h) 212 dias com consentimento LGPD → elegivel', () => {
    const result = ReactivationEligibility.evaluate(checkoutElegivel, hoje, 'consentimento')
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.isEligible).toBe(true)
      expect(result.value.consentimentoLGPD).toBe('consentimento')
      expect(result.value.motivoInelegivel).toBeNull()
    }
  })

  it('i) 212 dias SEM consentimento LGPD → bloqueado por LGPD', () => {
    const result = ReactivationEligibility.evaluate(checkoutElegivel, hoje, 'sem_consentimento')
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.isEligible).toBe(false)
      expect(result.value.motivoInelegivel).toContain('LGPD')
    }
  })

  it('j) 179 dias com consentimento → inelegivel por tempo (mesmo com LGPD ok)', () => {
    const checkoutRecente = new Date('2026-06-03T00:00:00Z')
    const result = ReactivationEligibility.evaluate(checkoutRecente, hoje, 'consentimento')
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.isEligible).toBe(false)
      expect(result.value.motivoInelegivel).toContain('179')
    }
  })

  it('k) FarmerService bloqueia lead sem consentimento LGPD', () => {
    const service = new FarmerReactivationService()
    const leadResult = makeLead()
    expect(leadResult.isOk).toBe(true)
    if (!leadResult.isOk) return

    const reserva = makeReservation(checkoutElegivel, 'COMPLETED')
    expect(reserva.isOk).toBe(true)

    const result = service.execute(leadResult.value, [reserva.value], hoje, 'sem_consentimento')
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value).toBeNull()
    }
  })
})

describe('IdentifyReactivationCandidatesUseCase', () => {
  const hoje = new Date('2026-11-29T00:00:00Z')
  const checkoutElegivel = new Date('2026-05-01T00:00:00Z')
  let repo: ReturnType<typeof createMockRepo>
  let useCase: IdentifyReactivationCandidatesUseCase

  function createMockRepo() {
    return {
      salvarLead: vi.fn(),
      buscarLeadPorId: vi.fn(),
      buscarLeadPorTelefone: vi.fn(),
      listarLeadsPorStage: vi.fn().mockResolvedValue(Result.ok([])),
      registrarInteracao: vi.fn(),
      listarInteracoesPorLead: vi.fn().mockResolvedValue(Result.ok([])),
      atualizarStage: vi.fn(),
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    repo = createMockRepo()
    useCase = new IdentifyReactivationCandidatesUseCase(repo, new FarmerReactivationService())
  })

  it('l) retorna lista vazia para array vazio de leads', async () => {
    const result = await useCase.execute({ propriedadeId: 'prop-1', currentDate: hoje, leads: [], consentimentoPorLead: new Map() })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value).toHaveLength(0)
    }
  })

  it('m) filtra leads de outra propriedade (isolamento tenant)', async () => {
    const leadA = makeLead({ id: 'lead-a', propriedadeId: 'prop-1' })
    const leadB = makeLead({ id: 'lead-b', propriedadeId: 'prop-2' })
    expect(leadA.isOk && leadB.isOk).toBe(true)
    if (!leadA.isOk || !leadB.isOk) return

    repo.listarInteracoesPorLead.mockResolvedValue(Result.ok([]))

    const result = await useCase.execute({
      propriedadeId: 'prop-1',
      currentDate: hoje,
      leads: [leadA.value, leadB.value],
      consentimentoPorLead: new Map(),
    })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value).toHaveLength(0)
    }
  })

  it('n) retorna candidato elegivel com consentimento e tempo >180d', async () => {
    const lead = makeLead({ id: 'lead-elegivel' })
    expect(lead.isOk).toBe(true)
    if (!lead.isOk) return

    const interaction = {
      id: 'int-old',
      leadId: 'lead-elegivel',
      canal: 'website',
      timestamp: checkoutElegivel,
      sentimentScore: 0.5,
      tokenCost: 10,
      outcome: 'CONVERTED' as const,
      resumo: 'Checkout realizado com sucesso',
    }

    repo.listarInteracoesPorLead.mockResolvedValue(Result.ok([interaction]))

    const result = await useCase.execute({
      propriedadeId: 'prop-1',
      currentDate: hoje,
      leads: [lead.value],
      consentimentoPorLead: new Map([['lead-elegivel', 'consentimento']]),
    })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value).toHaveLength(1)
      expect(result.value[0].leadId).toBe('lead-elegivel')
      expect(result.value[0].daysSinceCheckout).toBeGreaterThan(REACTIVATION_THRESHOLD_DAYS)
    }
  })

  it('o) retorna lista congelada (imutavel)', async () => {
    const lead = makeLead({ id: 'lead-imutavel' })
    expect(lead.isOk).toBe(true)
    if (!lead.isOk) return

    const interaction = {
      id: 'int-imutavel',
      leadId: 'lead-imutavel',
      canal: 'whatsapp',
      timestamp: checkoutElegivel,
      sentimentScore: 0.5,
      tokenCost: 10,
      outcome: 'CONVERTED' as const,
      resumo: 'Reserva confirmada',
    }

    repo.listarInteracoesPorLead.mockResolvedValue(Result.ok([interaction]))

    const result = await useCase.execute({
      propriedadeId: 'prop-1',
      currentDate: hoje,
      leads: [lead.value],
      consentimentoPorLead: new Map([['lead-imutavel', 'consentimento']]),
    })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(Object.isFrozen(result.value)).toBe(true)
    }
  })
})
