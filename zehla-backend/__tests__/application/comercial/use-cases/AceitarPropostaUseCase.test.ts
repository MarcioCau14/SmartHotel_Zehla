import { describe, it, expect } from 'vitest'
import { AceitarPropostaUseCase } from '../../../../src/application/comercial/use-cases/AceitarPropostaUseCase'
import { FakePropostaRepository } from '../fakes/FakePropostaRepository'
import { FakePagamentoRepository } from '../fakes/FakePagamentoRepository'
import { Proposta } from '../../../../src/domain/comercial/entities/Proposta'
import { Money } from '../../../../src/domain/comercial/value-objects/Money'

describe('AceitarPropostaUseCase', () => {
  const futureCheckIn = new Date()
  futureCheckIn.setDate(futureCheckIn.getDate() + 10)
  
  const futureCheckOut = new Date()
  futureCheckOut.setDate(futureCheckOut.getDate() + 15)

  it('should accept a proposal in negotiation and create a pending deposit payment', async () => {
    const propostaPort = new FakePropostaRepository()
    const pagamentoPort = new FakePagamentoRepository()
    const useCase = new AceitarPropostaUseCase(propostaPort, pagamentoPort)

    // Criar proposta rascunho
    const proposta = Proposta.create({
      id: 'proposta_1',
      leadId: 'lead_123',
      propriedadeId: 'prop_123',
      pacoteId: 'pacote_123',
      dataCriacao: new Date(),
      dataCheckIn: futureCheckIn,
      dataCheckOut: futureCheckOut,
      quantidadeHospedes: 2,
      valorTotal: new Money(100000), // R$ 1000,00
      valorSinal: new Money(20000),  // R$ 200,00 (20%)
      status: 'rascunho'
    }).value

    // Simular fluxo de estados até negociacao no domínio
    const enviada = proposta.enviar().value
    const vista = enviada.visualizar().value
    const negociacao = vista.negociar().value

    propostaPort.addPropostaDirectly(negociacao)

    const result = await useCase.execute('proposta_1', 'prop_123')

    expect(result.isOk).toBe(true)
    const propostaAceita = result.value
    expect(propostaAceita.status).toBe('aceita')

    // Confirmar se o pagamento do sinal foi criado
    const pagamentosResult = await pagamentoPort.listarPagamentosPorProposta('proposta_1', 'prop_123')
    expect(pagamentosResult.isOk).toBe(true)
    expect(pagamentosResult.value).toHaveLength(1)
    
    const pagamentoSinal = pagamentosResult.value[0]
    expect(pagamentoSinal.valor.centavos).toBe(20000)
    expect(pagamentoSinal.status).toBe('rascunho')
    expect(pagamentoSinal.metodoPagamento).toBe('pix')
  })

  it('should dynamically transition draft/sent proposal states to negotiation before accepting', async () => {
    const propostaPort = new FakePropostaRepository()
    const pagamentoPort = new FakePagamentoRepository()
    const useCase = new AceitarPropostaUseCase(propostaPort, pagamentoPort)

    // Criar proposta no status 'enviada'
    const proposta = Proposta.create({
      id: 'proposta_enviada',
      leadId: 'lead_123',
      propriedadeId: 'prop_123',
      pacoteId: 'pacote_123',
      dataCriacao: new Date(),
      dataCheckIn: futureCheckIn,
      dataCheckOut: futureCheckOut,
      quantidadeHospedes: 2,
      valorTotal: new Money(100000),
      valorSinal: new Money(20000),
      status: 'rascunho'
    }).value

    const enviada = proposta.enviar().value
    propostaPort.addPropostaDirectly(enviada)

    // O use case deve transitar enviada -> vista -> negociacao -> aceita
    const result = await useCase.execute('proposta_enviada', 'prop_123')

    expect(result.isOk).toBe(true)
    expect(result.value.status).toBe('aceita')

    const pagamentosResult = await pagamentoPort.listarPagamentosPorProposta('proposta_enviada', 'prop_123')
    expect(pagamentosResult.isOk).toBe(true)
    expect(pagamentosResult.value).toHaveLength(1)
  })

  it('should fail to accept if proposal does not exist', async () => {
    const propostaPort = new FakePropostaRepository()
    const pagamentoPort = new FakePagamentoRepository()
    const useCase = new AceitarPropostaUseCase(propostaPort, pagamentoPort)

    const result = await useCase.execute('non_existent', 'prop_123')

    expect(result.isFail).toBe(true)
    expect(result.error?.message).toContain('Proposal not found')
  })

  it('should fail if proposal status is incompatible (e.g. recusada)', async () => {
    const propostaPort = new FakePropostaRepository()
    const pagamentoPort = new FakePagamentoRepository()
    const useCase = new AceitarPropostaUseCase(propostaPort, pagamentoPort)

    const proposta = Proposta.create({
      id: 'proposta_recusada',
      leadId: 'lead_123',
      propriedadeId: 'prop_123',
      pacoteId: 'pacote_123',
      dataCriacao: new Date(),
      dataCheckIn: futureCheckIn,
      dataCheckOut: futureCheckOut,
      quantidadeHospedes: 2,
      valorTotal: new Money(100000),
      valorSinal: new Money(20000),
      status: 'rascunho'
    }).value

    const enviada = proposta.enviar().value
    const recusada = enviada.recusar().value
    propostaPort.addPropostaDirectly(recusada)

    const result = await useCase.execute('proposta_recusada', 'prop_123')

    expect(result.isFail).toBe(true)
  })
})
