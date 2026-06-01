import { describe, it, expect } from 'vitest'
import { ProcessarPropostasExpiradasUseCase } from '../../../../src/application/comercial/use-cases/ProcessarPropostasExpiradasUseCase'
import { FakePropostaRepository } from '../fakes/FakePropostaRepository'
import { FakeLeadRepository } from '../fakes/FakeLeadRepository'
import { Proposta } from '../../../../src/domain/comercial/entities/Proposta'
import { Lead } from '../../../../src/domain/comercial/entities/Lead'
import { Money } from '../../../../src/domain/comercial/value-objects/Money'
import { Canal } from '../../../../src/domain/comercial/value-objects/Canal'

describe('ProcessarPropostasExpiradasUseCase', () => {
  const futureCheckIn = new Date()
  futureCheckIn.setDate(futureCheckIn.getDate() + 10)

  const futureCheckOut = new Date()
  futureCheckOut.setDate(futureCheckOut.getDate() + 15)

  it('should expire proposal in past validity and transition lead to lost if no other active proposals exist', async () => {
    const propostaPort = new FakePropostaRepository()
    const leadPort = new FakeLeadRepository()
    const useCase = new ProcessarPropostasExpiradasUseCase(propostaPort, leadPort)

    // 1. Criar lead no status 'propostado'
    const canal = Canal.criar('whatsapp').value
    const lead = Lead.create({
      id: 'lead_1',
      canal,
      propriedadeId: 'prop_123',
      dataCaptura: new Date(),
      nome: 'Lead Um',
      status: 'propostado'
    }).value
    leadPort.addLeadDirectly(lead)

    // 2. Criar proposta expirada (validade no passado)
    const validadeNoPassado = new Date()
    validadeNoPassado.setDate(validadeNoPassado.getDate() - 2)

    const propostaExpirada = Proposta.create({
      id: 'prop_expirada',
      leadId: 'lead_1',
      propriedadeId: 'prop_123',
      pacoteId: 'pacote_123',
      dataCriacao: new Date(),
      dataCheckIn: futureCheckIn,
      dataCheckOut: futureCheckOut,
      quantidadeHospedes: 2,
      valorTotal: new Money(100000),
      valorSinal: new Money(20000),
      status: 'enviada',
      validade: validadeNoPassado
    }).value
    propostaPort.addPropostaDirectly(propostaExpirada)

    const result = await useCase.execute('prop_123')

    expect(result.isOk).toBe(true)
    expect(result.value.propostasExpiradas).toHaveLength(1)
    expect(result.value.leadsAfetados).toHaveLength(1)
    expect(result.value.totalProcessadas).toBe(1)

    // Verificar se proposta no repo foi para expirada
    const checkProp = await propostaPort.buscarPropostaPorId('prop_expirada', 'prop_123')
    expect(checkProp.value?.status).toBe('expirada')

    // Verificar se o lead mudou para 'perdido'
    const checkLead = await leadPort.buscarLeadPorId('lead_1', 'prop_123')
    expect(checkLead.value?.status).toBe('perdido')
  })

  it('should keep lead active if it has other active proposals', async () => {
    const propostaPort = new FakePropostaRepository()
    const leadPort = new FakeLeadRepository()
    const useCase = new ProcessarPropostasExpiradasUseCase(propostaPort, leadPort)

    // 1. Criar lead no status 'propostado'
    const canal = Canal.criar('whatsapp').value
    const lead = Lead.create({
      id: 'lead_2',
      canal,
      propriedadeId: 'prop_123',
      dataCaptura: new Date(),
      nome: 'Lead Dois',
      status: 'propostado'
    }).value
    leadPort.addLeadDirectly(lead)

    // 2. Criar proposta expirada
    const validadeNoPassado = new Date()
    validadeNoPassado.setDate(validadeNoPassado.getDate() - 2)

    const propostaExpirada = Proposta.create({
      id: 'prop_expirada_2',
      leadId: 'lead_2',
      propriedadeId: 'prop_123',
      pacoteId: 'pacote_123',
      dataCriacao: new Date(),
      dataCheckIn: futureCheckIn,
      dataCheckOut: futureCheckOut,
      quantidadeHospedes: 2,
      valorTotal: new Money(100000),
      valorSinal: new Money(20000),
      status: 'enviada',
      validade: validadeNoPassado
    }).value
    propostaPort.addPropostaDirectly(propostaExpirada)

    // 3. Criar proposta ativa (futura validade) para o mesmo lead
    const validadeFutura = new Date()
    validadeFutura.setDate(validadeFutura.getDate() + 5)

    const propostaAtiva = Proposta.create({
      id: 'prop_ativa',
      leadId: 'lead_2',
      propriedadeId: 'prop_123',
      pacoteId: 'pacote_123',
      dataCriacao: new Date(),
      dataCheckIn: futureCheckIn,
      dataCheckOut: futureCheckOut,
      quantidadeHospedes: 2,
      valorTotal: new Money(100000),
      valorSinal: new Money(20000),
      status: 'enviada',
      validade: validadeFutura
    }).value
    propostaPort.addPropostaDirectly(propostaAtiva)

    const result = await useCase.execute('prop_123')

    expect(result.isOk).toBe(true)
    expect(result.value.propostasExpiradas).toHaveLength(1)
    expect(result.value.leadsAfetados).toHaveLength(0) // lead deve continuar propostado

    // Verificar se proposta expirou
    const checkProp = await propostaPort.buscarPropostaPorId('prop_expirada_2', 'prop_123')
    expect(checkProp.value?.status).toBe('expirada')

    // Verificar se o lead continuou 'propostado'
    const checkLead = await leadPort.buscarLeadPorId('lead_2', 'prop_123')
    expect(checkLead.value?.status).toBe('propostado')
  })

  it('should not transition lead status if lead status is not "propostado"', async () => {
    const propostaPort = new FakePropostaRepository()
    const leadPort = new FakeLeadRepository()
    const useCase = new ProcessarPropostasExpiradasUseCase(propostaPort, leadPort)

    // Lead no status 'qualificado' (não 'propostado')
    const canal = Canal.criar('whatsapp').value
    const lead = Lead.create({
      id: 'lead_3',
      canal,
      propriedadeId: 'prop_123',
      dataCaptura: new Date(),
      nome: 'Lead Tres',
      status: 'qualificado'
    }).value
    leadPort.addLeadDirectly(lead)

    const validadeNoPassado = new Date()
    validadeNoPassado.setDate(validadeNoPassado.getDate() - 2)

    const propostaExpirada = Proposta.create({
      id: 'prop_expirada_3',
      leadId: 'lead_3',
      propriedadeId: 'prop_123',
      pacoteId: 'pacote_123',
      dataCriacao: new Date(),
      dataCheckIn: futureCheckIn,
      dataCheckOut: futureCheckOut,
      quantidadeHospedes: 2,
      valorTotal: new Money(100000),
      valorSinal: new Money(20000),
      status: 'enviada',
      validade: validadeNoPassado
    }).value
    propostaPort.addPropostaDirectly(propostaExpirada)

    const result = await useCase.execute('prop_123')

    expect(result.isOk).toBe(true)
    expect(result.value.propostasExpiradas).toHaveLength(1)
    expect(result.value.leadsAfetados).toHaveLength(0) // lead não mudou, pois status não era 'propostado'

    const checkLead = await leadPort.buscarLeadPorId('lead_3', 'prop_123')
    expect(checkLead.value?.status).toBe('qualificado')
  })
})
