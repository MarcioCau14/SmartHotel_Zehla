import { describe, it, expect, beforeEach } from 'vitest'
import { ComercialLead } from '../../domain/comercial/entities/ComercialLead'
import { LeadScore } from '../../domain/comercial/value-objects/LeadScore'
import { OrigemLead } from '../../domain/comercial/value-objects/OrigemLead'
import { ProductTier, TierType } from '../../domain/comercial/value-objects/ProductTier'
import { Documento } from '../../domain/comercial/value-objects/Documento'
import { DomainEventPublisher } from '../../domain/shared/events/DomainEventPublisher'
import { InMemoryComercialLeadAdapter } from '../../infrastructure/persistence/comercial/InMemoryComercialLeadAdapter'
import { RegistrarPagamentoSinalUseCase } from '../../application/comercial/use-cases/RegistrarPagamentoSinalUseCase'
import { ConcluirVendaUseCase } from '../../application/comercial/use-cases/ConcluirVendaUseCase'
import { CalcularEscadaDeValorUseCase } from '../../application/comercial/use-cases/CalcularEscadaDeValorUseCase'
import { ExecutarSalesFarmingUseCase } from '../../application/comercial/use-cases/ExecutarSalesFarmingUseCase'
import { TriggerWebhookOnHandoffHandler } from '../../application/comercial/handlers/TriggerWebhookOnHandoffHandler'

function criarLeadAteNegociacao(adapter: InMemoryComercialLeadAdapter, id: string, closerId?: string) {
  const origem = OrigemLead.criar('site').value as OrigemLead
  const score = LeadScore.criar(80, 'ideal', {
    budget: true, authority: true, need: true, timeline: true,
  }).value as LeadScore
  const doc = Documento.criar('12345678909', 'CPF').value as Documento
  const lead = ComercialLead.create({
    id, origem, propriedadeId: 'prop_1', nome: 'Lead Venda', score, documento: doc,
    sdrResponsavel: 'ze_sales',
  }).value as ComercialLead

  const contato = lead.primeiroContato().value as ComercialLead
  const agendado = contato.agendar(new Date('2026-07-10'), closerId).value as ComercialLead
  const negociacao = agendado.iniciarNegociacao(closerId ?? 'closer_01').value as ComercialLead
  adapter.salvarMock(negociacao)
  return negociacao
}

function criarLeadEntrada(adapter: InMemoryComercialLeadAdapter, id: string, score?: LeadScore) {
  const origem = OrigemLead.criar('site').value as OrigemLead
  const lead = ComercialLead.create({
    id, origem, propriedadeId: 'prop_1', nome: 'Lead Entrada', score,
    sdrResponsavel: 'ze_sales',
  }).value as ComercialLead
  adapter.salvarMock(lead)
  return lead
}

describe('ComercialFechamento — Ciclo de Conversão, Escada de Valor e Farming', () => {
  let adapter: InMemoryComercialLeadAdapter
  let publisher: DomainEventPublisher

  beforeEach(() => {
    adapter = new InMemoryComercialLeadAdapter()
    publisher = new DomainEventPublisher()
  })

  // ─── RegistrarPagamentoSinalUseCase ───

  describe('RegistrarPagamentoSinalUseCase', () => {
    it('deve registrar sinal de lead em negociação com sucesso', async () => {
      criarLeadAteNegociacao(adapter, 'lead_sinal_ok')

      const useCase = new RegistrarPagamentoSinalUseCase(adapter, publisher)
      const result = await useCase.execute({
        leadId: 'lead_sinal_ok',
        propostaId: 'prop_001',
        valorSinal: 500,
        plano: 'back_end',
      })

      expect(result.isOk).toBe(true)
      if (result.isOk) {
        expect(result.value.estado).toBe('venda_sinal')
      }
    })

    it('deve REJEITAR sinal de lead em estado "entrada" (FSM violada)', async () => {
      criarLeadEntrada(adapter, 'lead_sinal_fail')

      const useCase = new RegistrarPagamentoSinalUseCase(adapter, publisher)
      const result = await useCase.execute({
        leadId: 'lead_sinal_fail',
        propostaId: 'prop_001',
        valorSinal: 500,
        plano: 'back_end',
      })

      expect(result.isFail).toBe(true)
      if (result.isFail) {
        expect(result.error.message).toContain('TRANSICAO_INVALIDA')
      }

      const busca = await adapter.buscarPorId('lead_sinal_fail')
      expect(busca.isOk).toBe(true)
      if (busca.isOk) {
        expect(busca.value?.estado).toBe('entrada')
      }
    })

    it('deve REJEITAR sinal com valor zero', async () => {
      criarLeadAteNegociacao(adapter, 'lead_sinal_zero')

      const useCase = new RegistrarPagamentoSinalUseCase(adapter, publisher)
      const result = await useCase.execute({
        leadId: 'lead_sinal_zero',
        propostaId: 'prop_001',
        valorSinal: 0,
        plano: 'back_end',
      })

      expect(result.isFail).toBe(true)
      expect(result.error.message).toContain('SINAL_DEVE_SER_POSITIVO')
    })
  })

  // ─── ConcluirVendaUseCase ───

  describe('ConcluirVendaUseCase', () => {
    it('deve concluir venda de lead com sinal e documento', async () => {
      criarLeadAteNegociacao(adapter, 'lead_concluir_ok')

      const sinalUC = new RegistrarPagamentoSinalUseCase(adapter, publisher)
      await sinalUC.execute({ leadId: 'lead_concluir_ok', propostaId: 'p1', valorSinal: 500, plano: 'back_end' })

      const concluirUC = new ConcluirVendaUseCase(adapter, publisher)
      const result = await concluirUC.execute('lead_concluir_ok')

      expect(result.isOk).toBe(true)
      if (result.isOk) {
        expect(result.value.estado).toBe('venda_concluida')
      }
    })

    it('deve REJEITAR conclusão de lead sem documento', async () => {
      const origem = OrigemLead.criar('site').value as OrigemLead
      const score = LeadScore.criar(80, 'ideal', {
        budget: true, authority: true, need: true, timeline: true,
      }).value as LeadScore
      const lead = ComercialLead.create({
        id: 'lead_no_doc', origem, propriedadeId: 'prop_1', nome: 'Sem Doc', score,
        sdrResponsavel: 'ze_sales',
      }).value as ComercialLead
      const contato = lead.primeiroContato().value as ComercialLead
      const agendado = contato.agendar(new Date('2026-07-10'), 'closer').value as ComercialLead
      const negociacao = agendado.iniciarNegociacao('closer').value as ComercialLead
      adapter.salvarMock(negociacao)

      const sinalUC = new RegistrarPagamentoSinalUseCase(adapter, publisher)
      await sinalUC.execute({ leadId: 'lead_no_doc', propostaId: 'p1', valorSinal: 500, plano: 'back_end' })

      const concluirUC = new ConcluirVendaUseCase(adapter, publisher)
      const result = await concluirUC.execute('lead_no_doc')

      expect(result.isFail).toBe(true)
      expect(result.error.message).toContain('DOCUMENTO_OBRIGATORIO_CONVERSAO')
    })
  })

  // ─── CalcularEscadaDeValorUseCase ───

  describe('CalcularEscadaDeValorUseCase', () => {
    it('deve sugerir UPSELL para lead ICP ideal + score alto + engajado', async () => {
      const origem = OrigemLead.criar('site').value as OrigemLead
      const score = LeadScore.criar(85, 'ideal', {
        budget: true, authority: true, need: true, timeline: true,
      }).value as LeadScore
      const lead = ComercialLead.create({
        id: 'lead_upsell', origem, propriedadeId: 'prop_1', nome: 'Up Sell', score,
        sdrResponsavel: 'ze_sales',
      }).value as ComercialLead
      const contato = lead.primeiroContato().value as ComercialLead
      const fu1 = contato.realizarFollowUp().value as ComercialLead
      adapter.salvarMock(fu1)

      const useCase = new CalcularEscadaDeValorUseCase(adapter)
      const result = await useCase.execute('lead_upsell', 'front_end')

      expect(result.isOk).toBe(true)
      if (result.isOk) {
        expect(result.value.tipoRecomendacao).toBe('upsell')
        expect(result.value.tierRecomendado).toBe('back_end')
        expect(result.value.confidenceScore).toBeGreaterThanOrEqual(0.8)
      }
    })

    it('deve NÃO sugerir HIGH_END para lead ICP ideal com score baixo (regra estrita)', async () => {
      const origem = OrigemLead.criar('site').value as OrigemLead
      const score = LeadScore.criar(25, 'ideal', {
        budget: false, authority: true, need: false, timeline: false,
      }).value as LeadScore
      const lead = ComercialLead.create({
        id: 'lead_no_high', origem, propriedadeId: 'prop_1', nome: 'No High', score,
        sdrResponsavel: 'ze_sales',
      }).value as ComercialLead
      adapter.salvarMock(lead)

      const useCase = new CalcularEscadaDeValorUseCase(adapter)
      const result = await useCase.execute('lead_no_high', 'front_end')

      expect(result.isOk).toBe(true)
      if (result.isOk) {
        expect(result.value.tipoRecomendacao).not.toBe('upsell')
        expect(result.value.tierRecomendado).not.toBe('high_end')
      }
    })

    it('deve sugerir DOWNSALE para lead ICP fora sem engajamento', async () => {
      const origem = OrigemLead.criar('site').value as OrigemLead
      const score = LeadScore.criar(10, 'fora_icp', {
        budget: false, authority: false, need: false, timeline: false,
      }).value as LeadScore
      const lead = ComercialLead.create({
        id: 'lead_downsell', origem, propriedadeId: 'prop_1', nome: 'Down', score,
        sdrResponsavel: 'ze_sales',
      }).value as ComercialLead
      adapter.salvarMock(lead)

      const useCase = new CalcularEscadaDeValorUseCase(adapter)
      const result = await useCase.execute('lead_downsell', 'back_end')

      expect(result.isOk).toBe(true)
      if (result.isOk) {
        expect(result.value.tipoRecomendacao).toBe('downsell')
        expect(result.value.tierRecomendado).toBe('isca')
      }
    })

    it('deve sugerir CROSS_SELL para lead ICP minimo com score medio', async () => {
      const origem = OrigemLead.criar('site').value as OrigemLead
      const score = LeadScore.criar(50, 'minimo', {
        budget: true, authority: false, need: true, timeline: false,
      }).value as LeadScore
      const lead = ComercialLead.create({
        id: 'lead_cross', origem, propriedadeId: 'prop_1', nome: 'Cross', score,
        sdrResponsavel: 'ze_sales',
      }).value as ComercialLead
      adapter.salvarMock(lead)

      const useCase = new CalcularEscadaDeValorUseCase(adapter)
      const result = await useCase.execute('lead_cross', 'front_end')

      expect(result.isOk).toBe(true)
      if (result.isOk) {
        expect(result.value.tipoRecomendacao).toBe('cross_sell')
        expect(result.value.tierRecomendado).toBe('complementar')
      }
    })
  })

  // ─── ExecutarSalesFarmingUseCase ───

  describe('ExecutarSalesFarmingUseCase', () => {
    function criarLeadPerdido(adapter: InMemoryComercialLeadAdapter, id: string, diasSemInteracao: number): ComercialLead {
      const origem = OrigemLead.criar('site').value as OrigemLead
      const score = LeadScore.criar(50, 'minimo', {
        budget: true, authority: false, need: true, timeline: false,
      }).value as LeadScore
      const lead = ComercialLead.create({
        id, origem, propriedadeId: 'prop_1', nome: 'Lead Perdido', score,
        sdrResponsavel: 'ze_sales',
      }).value as ComercialLead

      const perdido = lead.perder('Sem interesse').value as ComercialLead

      const diasAtras = new Date(Date.now() - diasSemInteracao * 24 * 60 * 60 * 1000)
      const clone = ComercialLead.restore({
        id: perdido.id,
        origem: perdido.origem,
        propriedadeId: perdido.propriedadeId,
        nome: perdido.nome,
        score: perdido.score,
        estado: perdido.estado,
        sdrResponsavel: perdido.sdrResponsavel,
        ultimaInteracao: diasAtras,
        observacoes: perdido.observacoes,
      })
      adapter.salvarMock(clone)
      return clone
    }

    function criarLeadNoShow(adapter: InMemoryComercialLeadAdapter, id: string, diasSemInteracao: number): ComercialLead {
      const origem = OrigemLead.criar('site').value as OrigemLead
      const score = LeadScore.criar(50, 'minimo', {
        budget: true, authority: false, need: true, timeline: false,
      }).value as LeadScore
      const lead = ComercialLead.create({
        id, origem, propriedadeId: 'prop_1', nome: 'Lead NoShow', score,
        sdrResponsavel: 'ze_sales',
      }).value as ComercialLead

      const contato = lead.primeiroContato().value as ComercialLead
      const agendado = contato.agendar(new Date('2026-06-01')).value as ComercialLead
      const noShow = agendado.marcarNoShow().value as ComercialLead

      const diasAtras = new Date(Date.now() - diasSemInteracao * 24 * 60 * 60 * 1000)
      const clone = ComercialLead.restore({
        id: noShow.id,
        origem: noShow.origem,
        propriedadeId: noShow.propriedadeId,
        nome: noShow.nome,
        score: noShow.score,
        estado: noShow.estado,
        sdrResponsavel: noShow.sdrResponsavel,
        ultimaInteracao: diasAtras,
        dataAgendamento: noShow.dataAgendamento,
      })
      adapter.salvarMock(clone)
      return clone
    }

    it('deve enviar leads perdidos há +30d para sales farming', async () => {
      criarLeadPerdido(adapter, 'lead_farm_1', 35)
      criarLeadPerdido(adapter, 'lead_farm_2', 40)

      const useCase = new ExecutarSalesFarmingUseCase(adapter, publisher, 30, 7)
      const result = await useCase.execute()

      expect(result.isOk).toBe(true)
      if (result.isOk) {
        expect(result.value.farmingEnviados).toBe(2)
        expect(result.value.reativados).toBe(0)
      }

      const buscado = await adapter.buscarPorId('lead_farm_1')
      expect(buscado.isOk).toBe(true)
      if (buscado.isOk) {
        expect(buscado.value?.estado).toBe('sales_farming')
      }
    })

    it('deve reativar leads perdidos entre 15-30 dias', async () => {
      criarLeadPerdido(adapter, 'lead_reativar_1', 20)

      const useCase = new ExecutarSalesFarmingUseCase(adapter, publisher, 30, 7)
      const result = await useCase.execute()

      expect(result.isOk).toBe(true)
      if (result.isOk) {
        expect(result.value.reativados).toBe(1)
      }

      const buscado = await adapter.buscarPorId('lead_reativar_1')
      expect(buscado.isOk).toBe(true)
      if (buscado.isOk) {
        expect(buscado.value?.estado).toBe('entrada')
      }
    })

    it('deve enviar no-shows de +7d para sales farming', async () => {
      criarLeadNoShow(adapter, 'lead_ns_1', 10)
      criarLeadNoShow(adapter, 'lead_ns_2', 14)

      const useCase = new ExecutarSalesFarmingUseCase(adapter, publisher, 30, 7)
      const result = await useCase.execute()

      expect(result.isOk).toBe(true)
      if (result.isOk) {
        expect(result.value.farmingEnviados).toBeGreaterThanOrEqual(2)
      }

      const buscado = await adapter.buscarPorId('lead_ns_1')
      expect(buscado.isOk).toBe(true)
      if (buscado.isOk) {
        expect(buscado.value?.estado).toBe('sales_farming')
      }
    })

    it('deve disparar eventos nos leads processados', async () => {
      criarLeadPerdido(adapter, 'lead_event_farm', 35)

      const handler = new TriggerWebhookOnHandoffHandler()
      publisher.subscribe('LeadSalesFarmingEvent', handler)

      const useCase = new ExecutarSalesFarmingUseCase(adapter, publisher, 30, 7)
      await useCase.execute()

      expect(handler.eventosRecebidos.length).toBe(1)
      expect(handler.eventosRecebidos[0].eventName).toBe('LeadSalesFarmingEvent')
    })
  })
})
