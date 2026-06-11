import { describe, it, expect } from 'vitest'
import { CalcularTaxaConversaoUseCase } from '../../../../src/application/comercial/use-cases/CalcularTaxaConversaoUseCase'
import { FakeLeadRepository } from '../fakes/FakeLeadRepository'
import { FakePropostaRepository } from '../fakes/FakePropostaRepository'
import { FakePagamentoRepository } from '../fakes/FakePagamentoRepository'
import { FakeConversaoRepository } from '../fakes/FakeConversaoRepository'
import { Lead } from '../../../../src/domain/comercial/entities/Lead'
import { Proposta } from '../../../../src/domain/comercial/entities/Proposta'
import { Pagamento } from '../../../../src/domain/comercial/entities/Pagamento'
import { Conversao } from '../../../../src/domain/comercial/entities/Conversao'
import { Canal } from '../../../../src/domain/comercial/value-objects/Canal'
import { Money } from '../../../../src/domain/comercial/value-objects/Money'
import { Documento } from '../../../../src/domain/comercial/value-objects/Documento'

describe('CalcularTaxaConversaoUseCase', () => {
  it('should calculate conversion rates and acquisition channels breakdown successfully', async () => {
    const leadPort = new FakeLeadRepository()
    const propostaPort = new FakePropostaRepository()
    const pagamentoPort = new FakePagamentoRepository()
    const conversaoPort = new FakeConversaoRepository()
    const useCase = new CalcularTaxaConversaoUseCase(leadPort, propostaPort, pagamentoPort, conversaoPort)

    const date = new Date()

    // 1. Adicionar 4 Leads (3 do WhatsApp, 1 do Instagram)
    const lead1 = Lead.create({
      id: 'lead_1',
      canal: Canal.criar('whatsapp').value,
      propriedadeId: 'prop_123',
      dataCaptura: date,
      nome: 'João da Silva',
      documento: Documento.criar('12345678909').value,
      status: 'converted'
    }).value
    const lead2 = Lead.create({
      id: 'lead_2',
      canal: Canal.criar('whatsapp').value,
      propriedadeId: 'prop_123',
      dataCaptura: date,
      nome: 'Maria da Silva',
      documento: Documento.criar('12345678909').value,
      status: 'converted'
    }).value
    const lead3 = Lead.create({
      id: 'lead_3',
      canal: Canal.criar('whatsapp').value,
      propriedadeId: 'prop_123',
      dataCaptura: date,
      nome: 'Carlos da Silva',
      status: 'prospect'
    }).value
    const lead4 = Lead.create({
      id: 'lead_4',
      canal: Canal.criar('instagram').value,
      propriedadeId: 'prop_123',
      dataCaptura: date,
      nome: 'Fernanda da Silva',
      status: 'prospect'
    }).value

    leadPort.addLeadDirectly(lead1)
    leadPort.addLeadDirectly(lead2)
    leadPort.addLeadDirectly(lead3)
    leadPort.addLeadDirectly(lead4)

    // 2. Adicionar conversões confirmadas
    const conversao1 = Conversao.create({
      id: 'conv_1',
      leadId: 'lead_1',
      propostaId: 'prop_1',
      propriedadeId: 'prop_123',
      pagamentoId: 'pag_1',
      dataConversao: date,
      dataConfirmacao: date,
      status: 'confirmada'
    }).value
    const conversao2 = Conversao.create({
      id: 'conv_2',
      leadId: 'lead_2',
      propostaId: 'prop_2',
      propriedadeId: 'prop_123',
      pagamentoId: 'pag_2',
      dataConversao: date,
      dataConfirmacao: date,
      status: 'confirmada'
    }).value

    conversaoPort.addConversaoDirectly(conversao1)
    conversaoPort.addConversaoDirectly(conversao2)

    // 3. Executar use case
    const dataInicio = new Date(date.getTime() - 10 * 60 * 1000) // 10 minutos atrás
    const dataFim = new Date(date.getTime() + 10 * 60 * 1000)    // 10 minutos no futuro

    const result = await useCase.execute('prop_123', dataInicio, dataFim)

    expect(result.isOk).toBe(true)
    const data = result.value
    
    // Taxa de conversão geral: 2 conversões / 4 leads = 50%
    expect(data.taxaConversao).toBe(50)
    expect(data.detalhes.leads).toBe(4)
    expect(data.detalhes.conversoes).toBe(2)

    // Breakdown por canal
    // WhatsApp: 3 leads, 2 conversões -> 66.67%
    expect(data.breakdown.whatsapp.leads).toBe(3)
    expect(data.breakdown.whatsapp.conversoes).toBe(2)
    expect(data.breakdown.whatsapp.taxaConversao).toBe(66.67)

    // Instagram: 1 lead, 0 conversões -> 0%
    expect(data.breakdown.instagram.leads).toBe(1)
    expect(data.breakdown.instagram.conversoes).toBe(0)
    expect(data.breakdown.instagram.taxaConversao).toBe(0)
  })
})
