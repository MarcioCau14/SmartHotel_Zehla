import { describe, it, expect } from 'vitest'
import { QualificarLeadUseCase } from '../../../../src/application/comercial/use-cases/QualificarLeadUseCase'
import { FakeLeadRepository } from '../fakes/FakeLeadRepository'
import { Lead } from '../../../../src/domain/comercial/entities/Lead'
import { Score } from '../../../../src/domain/comercial/value-objects/Score'
import { Canal } from '../../../../src/domain/comercial/value-objects/Canal'

describe('QualificarLeadUseCase', () => {
  it('should qualify a lead successfully if score is sufficient', async () => {
    const leadPort = new FakeLeadRepository()
    const useCase = new QualificarLeadUseCase(leadPort)

    // Criar um lead com score 40 (suficiente para qualificar, pois >= 30)
    const canal = Canal.criar('whatsapp').value
    const score = Score.criar(40).value
    const lead = Lead.create({
      id: 'lead_1',
      canal,
      propriedadeId: 'prop_123',
      dataCaptura: new Date(),
      nome: 'João da Silva',
      score,
      status: 'prospect'
    }).value

    leadPort.addLeadDirectly(lead)

    const result = await useCase.execute('lead_1', 'prop_123')

    expect(result.isOk).toBe(true)
    const qualifiedLead = result.value
    expect(qualifiedLead.status).toBe('qualified')

    // Confirmar no repo
    const checkResult = await leadPort.buscarLeadPorId('lead_1', 'prop_123')
    expect(checkResult.isOk).toBe(true)
    expect(checkResult.value?.status).toBe('qualified')
  })

  it('should fail to qualify if lead score is insufficient', async () => {
    const leadPort = new FakeLeadRepository()
    const useCase = new QualificarLeadUseCase(leadPort)

    // Criar um lead com score 10 (insuficiente, pois < 30)
    const canal = Canal.criar('whatsapp').value
    const score = Score.criar(10).value
    const lead = Lead.create({
      id: 'lead_2',
      canal,
      propriedadeId: 'prop_123',
      dataCaptura: new Date(),
      nome: 'Maria Silva',
      score,
      status: 'prospect',
      tags: ['hourlyRate:1', 'adr:0']
    }).value

    leadPort.addLeadDirectly(lead)

    const result = await useCase.execute('lead_2', 'prop_123')

    expect(result.isFail).toBe(true)
    expect(result.error?.message).toContain('score is insufficient')
  })

  it('should fail if lead does not have a score', async () => {
    const leadPort = new FakeLeadRepository()
    const useCase = new QualificarLeadUseCase(leadPort)

    const canal = Canal.criar('whatsapp').value
    const lead = Lead.create({
      id: 'lead_3',
      canal,
      propriedadeId: 'prop_123',
      dataCaptura: new Date(),
      nome: 'Carlos Souza',
      status: 'prospect',
      tags: ['hourlyRate:1', 'adr:0']
      // sem score
    }).value

    leadPort.addLeadDirectly(lead)

    const result = await useCase.execute('lead_3', 'prop_123')

    expect(result.isFail).toBe(true)
    expect(result.error?.message).toContain('must have a score')
  })

  it('should fail if lead is not found', async () => {
    const leadPort = new FakeLeadRepository()
    const useCase = new QualificarLeadUseCase(leadPort)

    const result = await useCase.execute('non_existent', 'prop_123')

    expect(result.isFail).toBe(true)
    expect(result.error?.message).toContain('Lead not found')
  })
})
