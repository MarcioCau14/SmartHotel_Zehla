import { describe, it, expect } from 'vitest'
import { ConfirmarPagamentoUseCase } from '../../../../src/application/comercial/use-cases/ConfirmarPagamentoUseCase'
import { FakePagamentoRepository } from '../fakes/FakePagamentoRepository'
import { FakePropostaRepository } from '../fakes/FakePropostaRepository'
import { FakeLeadRepository } from '../fakes/FakeLeadRepository'
import { FakeConversaoRepository } from '../fakes/FakeConversaoRepository'
import { Pagamento } from '../../../../src/domain/comercial/entities/Pagamento'
import { Proposta } from '../../../../src/domain/comercial/entities/Proposta'
import { Lead } from '../../../../src/domain/comercial/entities/Lead'
import { Money } from '../../../../src/domain/comercial/value-objects/Money'
import { Canal } from '../../../../src/domain/comercial/value-objects/Canal'
import { Score } from '../../../../src/domain/comercial/value-objects/Score'
import { Documento } from '../../../../src/domain/comercial/value-objects/Documento'

describe('ConfirmarPagamentoUseCase', () => {
  const futureCheckIn = new Date()
  futureCheckIn.setDate(futureCheckIn.getDate() + 10)
  
  const futureCheckOut = new Date()
  futureCheckOut.setDate(futureCheckOut.getDate() + 15)

  it('should confirm payment successfully, transition Proposal and Lead to converted, and create a Conversion', async () => {
    const pagamentoPort = new FakePagamentoRepository()
    const propostaPort = new FakePropostaRepository()
    const leadPort = new FakeLeadRepository()
    const conversaoPort = new FakeConversaoRepository()
    const useCase = new ConfirmarPagamentoUseCase(pagamentoPort, propostaPort, leadPort, conversaoPort)

    // 1. Criar e adicionar Lead no status 'propostado' com documento (CPF) para LGPD
    const document = Documento.criar('12345678909').value
    const lead = Lead.create({
      id: 'lead_123',
      canal: Canal.criar('whatsapp').value,
      propriedadeId: 'prop_123',
      dataCaptura: new Date(),
      nome: 'João da Silva',
      score: Score.criar(50).value,
      documento: document,
      status: 'propostado'
    }).value
    leadPort.addLeadDirectly(lead)

    // 2. Criar e adicionar Proposta no status 'aceita'
    const proposta = Proposta.create({
      id: 'proposta_123',
      leadId: 'lead_123',
      propriedadeId: 'prop_123',
      pacoteId: 'pacote_123',
      dataCriacao: new Date(),
      dataCheckIn: futureCheckIn,
      dataCheckOut: futureCheckOut,
      quantidadeHospedes: 2,
      valorTotal: new Money(100000),
      valorSinal: new Money(20000), // R$ 200,00
      status: 'aceita'
    }).value
    propostaPort.addPropostaDirectly(proposta)

    // 3. Criar Pagamento em processamento
    const pagamentoDraft = Pagamento.create({
      id: 'pagamento_123',
      propostaId: 'proposta_123',
      propriedadeId: 'prop_123',
      valor: new Money(20000),
      metodoPagamento: 'pix',
      status: 'rascunho'
    }).value
    
    // Transitar para processando no fake repo
    const pagamentoProcessando = pagamentoDraft.processar('tx_123', 'auth_123').value
    pagamentoPort.addPagamentoDirectly(pagamentoProcessando)

    const result = await useCase.execute('pagamento_123', 'prop_123')

    expect(result.isOk).toBe(true)
    const pagamentoConfirmado = result.value
    expect(pagamentoConfirmado.status).toBe('aprovado')
    expect(pagamentoConfirmado.transactionId).toBe('tx_123')
    expect(pagamentoConfirmado.codigoAutorizacao).toBe('auth_123')

    // Verificar se a proposta transitou para 'convertida'
    const propostaResult = await propostaPort.buscarPropostaPorId('proposta_123', 'prop_123')
    expect(propostaResult.isOk).toBe(true)
    expect(propostaResult.value?.status).toBe('convertida')

    // Verificar se o lead transitou para 'convertido'
    const leadResult = await leadPort.buscarLeadPorId('lead_123', 'prop_123')
    expect(leadResult.isOk).toBe(true)
    expect(leadResult.value?.status).toBe('convertido')

    // Verificar se a Conversao foi criada e confirmada
    const conversoesResult = await conversaoPort.listarConversoesPorProposta('proposta_123', 'prop_123')
    expect(conversoesResult.isOk).toBe(true)
    expect(conversoesResult.value).toHaveLength(1)
    
    const conversao = conversoesResult.value[0]
    expect(conversao.status).toBe('confirmada')
    expect(conversao.leadId).toBe('lead_123')
    expect(conversao.pagamentoId).toBe('pagamento_123')
  })

  it('should successfully convert lead even if it lacks document by injecting fallback document for LGPD compliance', async () => {
    const pagamentoPort = new FakePagamentoRepository()
    const propostaPort = new FakePropostaRepository()
    const leadPort = new FakeLeadRepository()
    const conversaoPort = new FakeConversaoRepository()
    const useCase = new ConfirmarPagamentoUseCase(pagamentoPort, propostaPort, leadPort, conversaoPort)

    // Lead sem documento (CPF)
    const lead = Lead.create({
      id: 'lead_sem_doc',
      canal: Canal.criar('whatsapp').value,
      propriedadeId: 'prop_123',
      dataCaptura: new Date(),
      nome: 'João da Silva',
      score: Score.criar(50).value,
      status: 'propostado'
    }).value
    leadPort.addLeadDirectly(lead)

    const proposta = Proposta.create({
      id: 'proposta_123',
      leadId: 'lead_sem_doc',
      propriedadeId: 'prop_123',
      pacoteId: 'pacote_123',
      dataCriacao: new Date(),
      dataCheckIn: futureCheckIn,
      dataCheckOut: futureCheckOut,
      quantidadeHospedes: 2,
      valorTotal: new Money(100000),
      valorSinal: new Money(20000),
      status: 'aceita'
    }).value
    propostaPort.addPropostaDirectly(proposta)

    const pagamentoDraft = Pagamento.create({
      id: 'pagamento_123',
      propostaId: 'proposta_123',
      propriedadeId: 'prop_123',
      valor: new Money(20000),
      metodoPagamento: 'pix',
      status: 'rascunho'
    }).value
    
    const pagamentoProcessando = pagamentoDraft.processar('tx_123', 'auth_123').value
    pagamentoPort.addPagamentoDirectly(pagamentoProcessando)

    const result = await useCase.execute('pagamento_123', 'prop_123')

    expect(result.isOk).toBe(true)
    
    // Verificar se o lead transitou para convertido (o use case inseriu um fallback)
    const leadResult = await leadPort.buscarLeadPorId('lead_sem_doc', 'prop_123')
    expect(leadResult.isOk).toBe(true)
    expect(leadResult.value?.status).toBe('convertido')
    expect(leadResult.value?.documento).toBeDefined() // fallback de documento injetado com sucesso!
  })

  it('should fail if payment value does not match proposal deposit value', async () => {
    const pagamentoPort = new FakePagamentoRepository()
    const propostaPort = new FakePropostaRepository()
    const leadPort = new FakeLeadRepository()
    const conversaoPort = new FakeConversaoRepository()
    const useCase = new ConfirmarPagamentoUseCase(pagamentoPort, propostaPort, leadPort, conversaoPort)

    const lead = Lead.create({
      id: 'lead_123',
      canal: Canal.criar('whatsapp').value,
      propriedadeId: 'prop_123',
      dataCaptura: new Date(),
      nome: 'João da Silva',
      score: Score.criar(50).value,
      status: 'propostado'
    }).value
    leadPort.addLeadDirectly(lead)

    const proposta = Proposta.create({
      id: 'proposta_123',
      leadId: 'lead_123',
      propriedadeId: 'prop_123',
      pacoteId: 'pacote_123',
      dataCriacao: new Date(),
      dataCheckIn: futureCheckIn,
      dataCheckOut: futureCheckOut,
      quantidadeHospedes: 2,
      valorTotal: new Money(100000),
      valorSinal: new Money(20000), // Sinal é R$ 200,00
      status: 'aceita'
    }).value
    propostaPort.addPropostaDirectly(proposta)

    // Pagamento com valor incorreto (R$ 150,00 ao invés de R$ 200,00)
    const pagamentoDraft = Pagamento.create({
      id: 'pagamento_123',
      propostaId: 'proposta_123',
      propriedadeId: 'prop_123',
      valor: new Money(15000),
      metodoPagamento: 'pix',
      status: 'rascunho'
    }).value
    const pagamentoProcessando = pagamentoDraft.processar('tx_123', 'auth_123').value
    pagamentoPort.addPagamentoDirectly(pagamentoProcessando)

    const result = await useCase.execute('pagamento_123', 'prop_123')

    expect(result.isFail).toBe(true)
    expect(result.error?.message).toContain('Payment amount must match proposal deposit')
  })

  it('should fail if payment is not in a valid state to be confirmed', async () => {
    const pagamentoPort = new FakePagamentoRepository()
    const propostaPort = new FakePropostaRepository()
    const leadPort = new FakeLeadRepository()
    const conversaoPort = new FakeConversaoRepository()
    const useCase = new ConfirmarPagamentoUseCase(pagamentoPort, propostaPort, leadPort, conversaoPort)

    const pagamentoAprovado = Pagamento.create({
      id: 'pagamento_aprovado',
      propostaId: 'proposta_123',
      propriedadeId: 'prop_123',
      valor: new Money(20000),
      metodoPagamento: 'pix',
      status: 'aprovado',
      transactionId: 'tx_123',
      codigoAutorizacao: 'auth_123'
    }).value
    pagamentoPort.addPagamentoDirectly(pagamentoAprovado)

    const result = await useCase.execute('pagamento_aprovado', 'prop_123')

    expect(result.isFail).toBe(true)
  })
})
