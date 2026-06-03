import { describe, it, expect } from 'vitest'
import { QualificarLeadUseCase } from '../../../../src/application/comercial/use-cases/QualificarLeadUseCase'
import { InMemoryComercialLeadAdapter } from '../../../../src/infrastructure/persistence/comercial/InMemoryComercialLeadAdapter'
import { ComercialLead } from '../../../../src/domain/comercial/entities/ComercialLead'
import { LeadScore } from '../../../../src/domain/comercial/value-objects/LeadScore'
import { OrigemLead } from '../../../../src/domain/comercial/value-objects/OrigemLead'
import { DomainEventPublisher } from '../../../../src/domain/shared/events/DomainEventPublisher'

describe('QualificarLeadUseCase', () => {
  it('should qualify a lead successfully if score is sufficient', async () => {
    const leadPort = new InMemoryComercialLeadAdapter()
    const publisher = new DomainEventPublisher()
    const useCase = new QualificarLeadUseCase(leadPort, publisher)

    const origem = OrigemLead.criar('whatsapp').value
    const score = LeadScore.criar(40, 'minimo').value
    const lead = ComercialLead.create({
      id: 'lead_1',
      origem,
      propriedadeId: 'prop_123',
      nome: 'João da Silva',
      score,
    }).value

    leadPort.salvarMock(lead)

    const result = await useCase.execute('lead_1')

    expect(result.isOk).toBe(true)
    expect(result.value).toBeDefined()
  })

  it('should fail to qualify if lead score is insufficient', async () => {
    const leadPort = new InMemoryComercialLeadAdapter()
    const publisher = new DomainEventPublisher()
    const useCase = new QualificarLeadUseCase(leadPort, publisher)

    const origem = OrigemLead.criar('whatsapp').value
    const score = LeadScore.criar(10).value
    const lead = ComercialLead.create({
      id: 'lead_2',
      origem,
      propriedadeId: 'prop_123',
      nome: 'Maria Silva',
      score,
    }).value

    leadPort.salvarMock(lead)

    const result = await useCase.execute('lead_2')

    expect(result.isFail).toBe(true)
    expect(result.error?.message).toContain('SCORE_INSUFICIENTE_PARA_QUALIFICACAO')
  })

  it('should fail if lead does not have a score', async () => {
    const leadPort = new InMemoryComercialLeadAdapter()
    const publisher = new DomainEventPublisher()
    const useCase = new QualificarLeadUseCase(leadPort, publisher)

    const origem = OrigemLead.criar('whatsapp').value
    const lead = ComercialLead.create({
      id: 'lead_3',
      origem,
      propriedadeId: 'prop_123',
      nome: 'Carlos Souza',
    }).value

    leadPort.salvarMock(lead)

    const result = await useCase.execute('lead_3')

    expect(result.isFail).toBe(true)
    expect(result.error?.message).toContain('LEAD_SEM_SCORE_NAO_PODE_QUALIFICAR')
  })

  it('should fail if lead is not found', async () => {
    const leadPort = new InMemoryComercialLeadAdapter()
    const publisher = new DomainEventPublisher()
    const useCase = new QualificarLeadUseCase(leadPort, publisher)

    const result = await useCase.execute('non_existent')

    expect(result.isFail).toBe(true)
    expect(result.error?.message).toContain('LEAD_NAO_ENCONTRADO')
  })
})
