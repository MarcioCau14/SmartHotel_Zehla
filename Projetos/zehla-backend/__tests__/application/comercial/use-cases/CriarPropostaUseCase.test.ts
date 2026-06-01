import { describe, it, expect } from 'vitest'
import { CriarPropostaUseCase } from '../../../../src/application/comercial/use-cases/CriarPropostaUseCase'
import { FakeLeadRepository } from '../fakes/FakeLeadRepository'
import { FakePropostaRepository } from '../fakes/FakePropostaRepository'
import { FakePacoteRepository } from '../fakes/FakePacoteRepository'
import { Lead } from '../../../../src/domain/comercial/entities/Lead'
import { Pacote } from '../../../../src/domain/comercial/entities/Pacote'
import { Canal } from '../../../../src/domain/comercial/value-objects/Canal'
import { Score } from '../../../../src/domain/comercial/value-objects/Score'
import { RegraPrecificacao } from '../../../../src/domain/comercial/value-objects/RegraPrecificacao'
import { Money } from '../../../../src/domain/comercial/value-objects/Money'

describe('CriarPropostaUseCase', () => {
  const futureCheckIn = new Date()
  futureCheckIn.setDate(futureCheckIn.getDate() + 10)
  
  const futureCheckOut = new Date()
  futureCheckOut.setDate(futureCheckOut.getDate() + 15)

  it('should create a proposal successfully and transition lead status to propostado', async () => {
    const leadPort = new FakeLeadRepository()
    const propostaPort = new FakePropostaRepository()
    const pacotePort = new FakePacoteRepository()
    const useCase = new CriarPropostaUseCase(propostaPort, leadPort, pacotePort)

    // 1. Criar e adicionar lead qualificado (score >= 30, status = qualificado)
    const lead = Lead.create({
      id: 'lead_qualificado',
      canal: Canal.criar('whatsapp').value,
      propriedadeId: 'prop_123',
      dataCaptura: new Date(),
      nome: 'João da Silva',
      score: Score.criar(50).value,
      status: 'qualificado'
    }).value
    leadPort.addLeadDirectly(lead)

    // 2. Criar e adicionar pacote ativo (status = ativo, capacidadeMaxima = 4)
    const regra = RegraPrecificacao.criar({
      tipo: 'fixo',
      valorBase: new Money(100000)
    }).value
    const pacote = Pacote.create({
      id: 'pacote_ativo',
      propriedadeId: 'prop_123',
      nome: 'Fim de Semana Premium',
      status: 'ativo',
      capacidadeMaxima: 4,
      regraPrecificacao: regra
    }).value
    pacotePort.addPacoteDirectly(pacote)

    const result = await useCase.execute({
      leadId: 'lead_qualificado',
      propriedadeId: 'prop_123',
      pacoteId: 'pacote_ativo',
      dataCheckIn: futureCheckIn,
      dataCheckOut: futureCheckOut,
      quantidadeHospedes: 3,
      observacoes: 'Deseja quarto de casal'
    })

    expect(result.isOk).toBe(true)
    const proposta = result.value
    expect(proposta).toBeDefined()
    expect(proposta.id).toBeDefined()
    expect(proposta.status).toBe('rascunho')

    // Confirmar se o lead transitou para 'propostado'
    const leadAtualizadoResult = await leadPort.buscarLeadPorId('lead_qualificado', 'prop_123')
    expect(leadAtualizadoResult.isOk).toBe(true)
    expect(leadAtualizadoResult.value?.status).toBe('propostado')
  })

  it('should fail to create proposal if lead is not qualified', async () => {
    const leadPort = new FakeLeadRepository()
    const propostaPort = new FakePropostaRepository()
    const pacotePort = new FakePacoteRepository()
    const useCase = new CriarPropostaUseCase(propostaPort, leadPort, pacotePort)

    // Lead novo (score = 10, status = novo - não qualificado)
    const lead = Lead.create({
      id: 'lead_novo',
      canal: Canal.criar('whatsapp').value,
      propriedadeId: 'prop_123',
      dataCaptura: new Date(),
      nome: 'Maria da Silva',
      score: Score.criar(10).value,
      status: 'novo'
    }).value
    leadPort.addLeadDirectly(lead)

    const regra = RegraPrecificacao.criar({
      tipo: 'fixo',
      valorBase: new Money(100000)
    }).value
    const pacote = Pacote.create({
      id: 'pacote_ativo',
      propriedadeId: 'prop_123',
      nome: 'Fim de Semana Premium',
      status: 'ativo',
      regraPrecificacao: regra
    }).value
    pacotePort.addPacoteDirectly(pacote)

    const result = await useCase.execute({
      leadId: 'lead_novo',
      propriedadeId: 'prop_123',
      pacoteId: 'pacote_ativo',
      dataCheckIn: futureCheckIn,
      dataCheckOut: futureCheckOut,
      quantidadeHospedes: 2
    })

    expect(result.isFail).toBe(true)
    expect(result.error?.message).toContain('Proposal can only be created for qualified leads')
  })

  it('should fail to create proposal if package is not active', async () => {
    const leadPort = new FakeLeadRepository()
    const propostaPort = new FakePropostaRepository()
    const pacotePort = new FakePacoteRepository()
    const useCase = new CriarPropostaUseCase(propostaPort, leadPort, pacotePort)

    const lead = Lead.create({
      id: 'lead_qualificado',
      canal: Canal.criar('whatsapp').value,
      propriedadeId: 'prop_123',
      dataCaptura: new Date(),
      nome: 'João da Silva',
      score: Score.criar(50).value,
      status: 'qualificado'
    }).value
    leadPort.addLeadDirectly(lead)

    // Pacote pausado
    const regra = RegraPrecificacao.criar({
      tipo: 'fixo',
      valorBase: new Money(100000)
    }).value
    const pacote = Pacote.create({
      id: 'pacote_pausado',
      propriedadeId: 'prop_123',
      nome: 'Fim de Semana Premium',
      status: 'pausado',
      regraPrecificacao: regra
    }).value
    pacotePort.addPacoteDirectly(pacote)

    const result = await useCase.execute({
      leadId: 'lead_qualificado',
      propriedadeId: 'prop_123',
      pacoteId: 'pacote_pausado',
      dataCheckIn: futureCheckIn,
      dataCheckOut: futureCheckOut,
      quantidadeHospedes: 2
    })

    expect(result.isFail).toBe(true)
    expect(result.error?.message).toContain('Proposal can only be created for active packages')
  })

  it('should fail if quantity of guests exceeds package maximum capacity', async () => {
    const leadPort = new FakeLeadRepository()
    const propostaPort = new FakePropostaRepository()
    const pacotePort = new FakePacoteRepository()
    const useCase = new CriarPropostaUseCase(propostaPort, leadPort, pacotePort)

    const lead = Lead.create({
      id: 'lead_qualificado',
      canal: Canal.criar('whatsapp').value,
      propriedadeId: 'prop_123',
      dataCaptura: new Date(),
      nome: 'João da Silva',
      score: Score.criar(50).value,
      status: 'qualificado'
    }).value
    leadPort.addLeadDirectly(lead)

    const regra = RegraPrecificacao.criar({
      tipo: 'fixo',
      valorBase: new Money(100000)
    }).value
    const pacote = Pacote.create({
      id: 'pacote_ativo',
      propriedadeId: 'prop_123',
      nome: 'Fim de Semana Premium',
      status: 'ativo',
      capacidadeMaxima: 2, // Capacidade máxima de 2 pessoas
      regraPrecificacao: regra
    }).value
    pacotePort.addPacoteDirectly(pacote)

    const result = await useCase.execute({
      leadId: 'lead_qualificado',
      propriedadeId: 'prop_123',
      pacoteId: 'pacote_ativo',
      dataCheckIn: futureCheckIn,
      dataCheckOut: futureCheckOut,
      quantidadeHospedes: 3 // Excede capacidade
    })

    expect(result.isFail).toBe(true)
    expect(result.error?.message).toContain('exceeds package capacity')
  })

  it('should fail with invalid dates', async () => {
    const leadPort = new FakeLeadRepository()
    const propostaPort = new FakePropostaRepository()
    const pacotePort = new FakePacoteRepository()
    const useCase = new CriarPropostaUseCase(propostaPort, leadPort, pacotePort)

    const lead = Lead.create({
      id: 'lead_qualificado',
      canal: Canal.criar('whatsapp').value,
      propriedadeId: 'prop_123',
      dataCaptura: new Date(),
      nome: 'João da Silva',
      score: Score.criar(50).value,
      status: 'qualificado'
    }).value
    leadPort.addLeadDirectly(lead)

    const regra = RegraPrecificacao.criar({
      tipo: 'fixo',
      valorBase: new Money(100000)
    }).value
    const pacote = Pacote.create({
      id: 'pacote_ativo',
      propriedadeId: 'prop_123',
      nome: 'Fim de Semana Premium',
      status: 'ativo',
      regraPrecificacao: regra
    }).value
    pacotePort.addPacoteDirectly(pacote)

    // Check-out no mesmo dia que Check-in (estadia mínima 1 noite)
    const result = await useCase.execute({
      leadId: 'lead_qualificado',
      propriedadeId: 'prop_123',
      pacoteId: 'pacote_ativo',
      dataCheckIn: futureCheckIn,
      dataCheckOut: futureCheckIn,
      quantidadeHospedes: 2
    })

    expect(result.isFail).toBe(true)
  })
})
