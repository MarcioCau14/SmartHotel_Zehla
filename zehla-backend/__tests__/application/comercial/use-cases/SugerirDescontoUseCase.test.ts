import { describe, it, expect } from 'vitest'
import { SugerirDescontoUseCase } from '../../../../src/application/comercial/use-cases/SugerirDescontoUseCase'
import { FakePropostaRepository } from '../fakes/FakePropostaRepository'
import { FakePacoteRepository } from '../fakes/FakePacoteRepository'
import { FakeLeadRepository } from '../fakes/FakeLeadRepository'
import { Proposta } from '../../../../src/domain/comercial/entities/Proposta'
import { Pacote } from '../../../../src/domain/comercial/entities/Pacote'
import { Lead } from '../../../../src/domain/comercial/entities/Lead'
import { Money } from '../../../../src/domain/comercial/value-objects/Money'
import { Canal } from '../../../../src/domain/comercial/value-objects/Canal'
import { RegraPrecificacao } from '../../../../src/domain/comercial/value-objects/RegraPrecificacao'
import { Score } from '../../../../src/domain/comercial/value-objects/Score'

describe('SugerirDescontoUseCase', () => {
  const futureCheckIn = new Date()
  futureCheckIn.setDate(futureCheckIn.getDate() + 10)
  
  const futureCheckOut = new Date()
  futureCheckOut.setDate(futureCheckOut.getDate() + 15)

  it('should suggest 20% discount if occupation is low (1 guest = 25% occupancy)', async () => {
    const propostaPort = new FakePropostaRepository()
    const pacotePort = new FakePacoteRepository()
    const leadPort = new FakeLeadRepository()
    const useCase = new SugerirDescontoUseCase(propostaPort, pacotePort, leadPort)

    // 1. Criar e adicionar Lead
    const lead = Lead.create({
      id: 'lead_1',
      canal: Canal.criar('whatsapp').value,
      propriedadeId: 'prop_123',
      dataCaptura: new Date(),
      nome: 'João da Silva',
      score: Score.criar(50).value,
      status: 'negotiation',
      ultimaInteracao: new Date() // interagiu hoje
    }).value
    leadPort.addLeadDirectly(lead)

    // 2. Criar e adicionar Pacote
    const regra = RegraPrecificacao.criar({
      tipo: 'fixo',
      valorBase: new Money(100000)
    }).value
    const pacote = Pacote.create({
      id: 'pacote_1',
      propriedadeId: 'prop_123',
      nome: 'Fim de Semana Premium',
      status: 'ativo',
      regraPrecificacao: regra
    }).value
    pacotePort.addPacoteDirectly(pacote)

    // 3. Criar Proposta com 1 hóspede (simula 25% ocupação -> 20% desc)
    const proposta = Proposta.create({
      id: 'proposta_1',
      leadId: 'lead_1',
      propriedadeId: 'prop_123',
      pacoteId: 'pacote_1',
      dataCriacao: new Date(),
      dataCheckIn: futureCheckIn,
      dataCheckOut: futureCheckOut,
      quantidadeHospedes: 1,
      valorTotal: new Money(100000), // R$ 1000,00
      status: 'enviada'
    }).value
    propostaPort.addPropostaDirectly(proposta)

    const result = await useCase.execute('proposta_1', 'prop_123')

    expect(result.isOk).toBe(true)
    const data = result.value
    expect(data.descontoSugerido.centavos).toBe(20000) // R$ 200,00 (20%)
    expect(data.motivo).toContain('Low property occupancy')
  })

  it('should suggest 10% discount if occupation is moderate (2 guests = 45% occupancy)', async () => {
    const propostaPort = new FakePropostaRepository()
    const pacotePort = new FakePacoteRepository()
    const leadPort = new FakeLeadRepository()
    const useCase = new SugerirDescontoUseCase(propostaPort, pacotePort, leadPort)

    const lead = Lead.create({
      id: 'lead_1',
      canal: Canal.criar('whatsapp').value,
      propriedadeId: 'prop_123',
      dataCaptura: new Date(),
      nome: 'João da Silva',
      status: 'negotiation',
      ultimaInteracao: new Date()
    }).value
    leadPort.addLeadDirectly(lead)

    const regra = RegraPrecificacao.criar({
      tipo: 'fixo',
      valorBase: new Money(100000)
    }).value
    const pacote = Pacote.create({
      id: 'pacote_1',
      propriedadeId: 'prop_123',
      nome: 'Fim de Semana Premium',
      status: 'ativo',
      regraPrecificacao: regra
    }).value
    pacotePort.addPacoteDirectly(pacote)

    // Proposta com 2 hóspedes (simula 45% ocupação -> 10% desc)
    const proposta = Proposta.create({
      id: 'proposta_2',
      leadId: 'lead_1',
      propriedadeId: 'prop_123',
      pacoteId: 'pacote_1',
      dataCriacao: new Date(),
      dataCheckIn: futureCheckIn,
      dataCheckOut: futureCheckOut,
      quantidadeHospedes: 2,
      valorTotal: new Money(100000),
      status: 'enviada'
    }).value
    propostaPort.addPropostaDirectly(proposta)

    const result = await useCase.execute('proposta_2', 'prop_123')

    expect(result.isOk).toBe(true)
    const data = result.value
    expect(data.descontoSugerido.centavos).toBe(10000) // R$ 100,00 (10%)
    expect(data.motivo).toContain('Moderate property occupancy')
  })

  it('should suggest 15% discount for re-engagement if lead has been inactive for 7+ days', async () => {
    const propostaPort = new FakePropostaRepository()
    const pacotePort = new FakePacoteRepository()
    const leadPort = new FakeLeadRepository()
    const useCase = new SugerirDescontoUseCase(propostaPort, pacotePort, leadPort)

    // Lead inativo há 8 dias
    const inativoHa8Dias = new Date()
    inativoHa8Dias.setDate(inativoHa8Dias.getDate() - 8)

    const lead = Lead.create({
      id: 'lead_inativo',
      canal: Canal.criar('whatsapp').value,
      propriedadeId: 'prop_123',
      dataCaptura: new Date(),
      nome: 'João da Silva',
      status: 'negotiation',
      ultimaInteracao: inativoHa8Dias
    }).value
    leadPort.addLeadDirectly(lead)

    const regra = RegraPrecificacao.criar({
      tipo: 'fixo',
      valorBase: new Money(100000)
    }).value
    const pacote = Pacote.create({
      id: 'pacote_1',
      propriedadeId: 'prop_123',
      nome: 'Fim de Semana Premium',
      status: 'ativo',
      regraPrecificacao: regra
    }).value
    pacotePort.addPacoteDirectly(pacote)

    // Proposta com 3 hóspedes (simula 75% ocupação -> 0% desc, mas deve prevalecer os 15% de inatividade)
    const proposta = Proposta.create({
      id: 'proposta_3',
      leadId: 'lead_inativo',
      propriedadeId: 'prop_123',
      pacoteId: 'pacote_1',
      dataCriacao: new Date(),
      dataCheckIn: futureCheckIn,
      dataCheckOut: futureCheckOut,
      quantidadeHospedes: 3,
      valorTotal: new Money(100000),
      status: 'enviada'
    }).value
    propostaPort.addPropostaDirectly(proposta)

    const result = await useCase.execute('proposta_3', 'prop_123')

    expect(result.isOk).toBe(true)
    const data = result.value
    expect(data.descontoSugerido.centavos).toBe(15000) // R$ 150,00 (15%)
    expect(data.motivo).toContain('inactive without response')
  })
})
