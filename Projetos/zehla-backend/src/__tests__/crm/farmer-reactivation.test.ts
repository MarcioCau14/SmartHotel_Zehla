import { describe, it, expect } from 'vitest'
import { LeadProfile } from '../../domain/crm/models/LeadProfile'
import { ReservationSnapshot } from '../../domain/crm/models/ReservationSnapshot'
import { ReactivationEligibility, REACTIVATION_THRESHOLD_DAYS } from '../../domain/crm/models/ReactivationEligibility'
import { ReactivationCandidate } from '../../domain/crm/models/ReactivationCandidate'
import { FarmerReactivationService } from '../../domain/crm/services/FarmerReactivationService'
import { CRMPipelineStage } from '../../domain/crm/models/CRMPipelineStage'

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
