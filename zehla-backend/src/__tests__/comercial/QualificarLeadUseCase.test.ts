import { describe, it, expect, beforeEach } from 'vitest'
import { QualificarLeadUseCase } from '../../application/comercial/use-cases/QualificarLeadUseCase'
import { LeadInMemoryRepository } from '../../infrastructure/persistence/comercial/LeadInMemoryRepository'
import { Score } from '../../domain/comercial/value-objects/Score'

describe('QualificarLeadUseCase — ROI Scored Boost', () => {
  let leadRepo: LeadInMemoryRepository
  let useCase: QualificarLeadUseCase

  beforeEach(() => {
    leadRepo = new LeadInMemoryRepository()
    useCase = new QualificarLeadUseCase(leadRepo)
  })

  it('should qualify lead and boost score by 20 if yearly ROI is > 200%', async () => {
    // Lead com tag "rooms_30" -> roomsCount = 30
    // ROICalculator calcula investimento = 30 * 97 = 2910/mes, retorno anual alto -> ROI > 200%
    const leadResult = await leadRepo.criarLead({
      canal: 'site',
      propriedadeId: 'prop_sc_flor_001',
      nome: 'Hotel Maravilha',
      email: 'contato@maravilha.com',
      telefone: '48999999999',
      tags: ['rooms_30'],
    })
    expect(leadResult.isOk).toBe(true)
    const leadId = leadResult.value!.id

    // Seta score inicial de 15 (qualificação precisa de >=30)
    await leadRepo.atualizarLead(leadId, 'prop_sc_flor_001', {
      score: 15
    })

    const result = await useCase.execute(leadId, 'prop_sc_flor_001')
    expect(result.isOk).toBe(true)
    
    if (result.isOk) {
      expect(result.value.status).toBe('qualified')
      // Score inicial (15) + boost (20) = 35
      expect(result.value.score?.value).toBe(35)
    }
  })

  it('should not boost score if lead does not have high ROI', async () => {
    // Lead sem tags ou com pouca economia
    const leadResult = await leadRepo.criarLead({
      canal: 'whatsapp',
      propriedadeId: 'prop_sc_flor_001',
      nome: 'Pousada Pequena',
      email: 'contato@pequena.com',
      telefone: '48999999998',
      tags: [],
    })
    expect(leadResult.isOk).toBe(true)
    const leadId = leadResult.value!.id

    // Seta score inicial de 15. Com default de 15 quartos, o ROI ainda é alto (> 200%).
    // Vamos testar passando 15 quartos com ADR e ocupação zerados para obter ROI zero.
    await leadRepo.atualizarLead(leadId, 'prop_sc_flor_001', {
      score: 15,
      tags: ['rooms_15', 'occupancy_0', 'adr_0', 'hourlyRate_2']
    })

    const result = await useCase.execute(leadId, 'prop_sc_flor_001')
    // Deve falhar a qualificação porque score de 15 não é suficiente (precisa de >= 30) e não foi impulsionado!
    expect(result.isFail).toBe(true)
    expect(result.error?.message).toContain('score is insufficient')
  })
})
