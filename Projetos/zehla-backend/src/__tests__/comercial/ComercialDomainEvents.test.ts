import { describe, it, expect, beforeEach } from 'vitest'
import { ComercialLead } from '../../domain/comercial/entities/ComercialLead'
import { LeadScore } from '../../domain/comercial/value-objects/LeadScore'
import { OrigemLead } from '../../domain/comercial/value-objects/OrigemLead'
import { DomainEventPublisher } from '../../domain/shared/events/DomainEventPublisher'
import { InMemoryComercialLeadAdapter } from '../../infrastructure/persistence/comercial/InMemoryComercialLeadAdapter'
import { RealizarHandoffUseCase } from '../../application/comercial/use-cases/RealizarHandoffUseCase'
import { QualificarLeadUseCase } from '../../application/comercial/use-cases/QualificarLeadUseCase'
import { TriggerWebhookOnHandoffHandler } from '../../application/comercial/handlers/TriggerWebhookOnHandoffHandler'
import { NotifyZeSalesOnLeadCreatedHandler } from '../../application/comercial/handlers/NotifyZeSalesOnLeadCreatedHandler'

function criarLeadAgendadoSalvo(adapter: InMemoryComercialLeadAdapter) {
  const origem = OrigemLead.criar('site').value as OrigemLead
  const score = LeadScore.criar(80, 'ideal', {
    budget: true, authority: true, need: true, timeline: true,
  }).value as LeadScore
  const lead = ComercialLead.create({
    id: 'lead_event_001',
    origem,
    propriedadeId: 'prop_123',
    nome: 'Lead Evento',
    score,
    sdrResponsavel: 'ze_sales',
  }).value as ComercialLead

  const contato = lead.primeiroContato().value as ComercialLead
  const agendado = contato.agendar(new Date('2026-06-10'), 'closer_01').value as ComercialLead
  adapter.salvarMock(agendado)
  return agendado
}

function criarLeadSalvo(adapter: InMemoryComercialLeadAdapter, score?: LeadScore) {
  const origem = OrigemLead.criar('site').value as OrigemLead
  const lead = ComercialLead.create({
    id: 'lead_qualify_001',
    origem,
    propriedadeId: 'prop_123',
    nome: 'Lead Qualificar',
    score,
    sdrResponsavel: 'ze_sales',
  }).value as ComercialLead
  adapter.salvarMock(lead)
  return lead
}

describe('ComercialDomainEvents — Sistema Nervoso (Observer Pattern)', () => {
  let adapter: InMemoryComercialLeadAdapter
  let publisher: DomainEventPublisher
  let handoffHandler: TriggerWebhookOnHandoffHandler
  let zeSalesHandler: NotifyZeSalesOnLeadCreatedHandler

  beforeEach(() => {
    adapter = new InMemoryComercialLeadAdapter()
    publisher = new DomainEventPublisher()

    handoffHandler = new TriggerWebhookOnHandoffHandler()
    zeSalesHandler = new NotifyZeSalesOnLeadCreatedHandler()

    publisher.subscribe('LeadHandoffParaCloserEvent', handoffHandler)
    publisher.subscribe('LeadCapturadoEvent', zeSalesHandler)
    publisher.subscribe('LeadQualificadoEvent', zeSalesHandler)
  })

  describe('Prova A: Handoff bem-sucedido ativa o handler reativamente', () => {
    it('deve disparar LeadHandoffParaCloserEvent com payload correto após handoff', async () => {
      criarLeadAgendadoSalvo(adapter)

      const summaryPackage = {
        score: 85,
        icpFit: 'ideal',
        interacoes: 4,
        objecoes: ['preco', 'prazo'],
        respostas: ['roi em 6 meses', 'entrega imediata'],
        ultimoEstado: 'agendado',
        gatilho: 'qualificacao_automatica',
      }

      const useCase = new RealizarHandoffUseCase(adapter, publisher)
      const result = await useCase.execute({
        leadId: 'lead_event_001',
        closerId: 'closer_final',
        summaryPackage,
      })

      expect(result.isOk).toBe(true)

      // Handler foi ativado reativamente
      expect(handoffHandler.eventosRecebidos.length).toBe(1)

      const evento = handoffHandler.eventosRecebidos[0]
      expect(evento.eventName).toBe('LeadHandoffParaCloserEvent')
      expect(evento.aggregateId).toBe('lead_event_001')

      const payload = evento.payload as Record<string, unknown>
      expect((payload.closerId as string)).toBe('closer_final')
      expect((payload.gatilho as string)).toBe('qualificacao_automatica')

      const sp = payload.summaryPackage as Record<string, unknown>
      expect(sp.score as number).toBe(85)
      expect(sp.icpFit as string).toBe('ideal')
      expect(sp.objecoes as string[]).toEqual(['preco', 'prazo'])
    })

    it('deve disparar LeadCapturadoEvent e LeadQualificadoEvent após qualificação', async () => {
      const score = LeadScore.criar(90, 'ideal', {
        budget: true, authority: true, need: true, timeline: true,
      }).value as LeadScore
      criarLeadSalvo(adapter, score)

      const useCase = new QualificarLeadUseCase(adapter, publisher)
      const result = await useCase.execute('lead_qualify_001')

      expect(result.isOk).toBe(true)

      // 4 eventos: LeadCapturadoEvent (create) + LeadPrimeiraInteracaoEvent (primeiroContato) + LeadQualificadoEvent (qualificar)
      expect(zeSalesHandler.eventosRecebidos.length).toBeGreaterThanOrEqual(2)

      const names = zeSalesHandler.eventosRecebidos.map(e => e.eventName)
      expect(names).toContain('LeadCapturadoEvent')
      expect(names).toContain('LeadQualificadoEvent')
    })

    it('deve limpar eventos da entidade após publicação', async () => {
      const score = LeadScore.criar(90, 'ideal', {
        budget: true, authority: true, need: true, timeline: true,
      }).value as LeadScore
      criarLeadSalvo(adapter, score)

      const useCase = new QualificarLeadUseCase(adapter, publisher)
      const result = await useCase.execute('lead_qualify_001')

      expect(result.isOk).toBe(true)
      if (result.isOk) {
        const eventsAposLimpeza = result.value.getDomainEvents()
        expect(eventsAposLimpeza.length).toBe(0)
      }
    })
  })

  describe('Prova B: Falha na validação NUNCA ativa publish', () => {
    it('deve REJEITAR handoff de entrada e NÃO disparar evento algum', async () => {
      const score = LeadScore.criar(50, 'ideal', {
        budget: true, authority: false, need: true, timeline: true,
      }).value as LeadScore
      criarLeadSalvo(adapter, score)

      const useCase = new RealizarHandoffUseCase(adapter, publisher)
      const result = await useCase.execute({
        leadId: 'lead_qualify_001',
        closerId: 'closer_x',
        summaryPackage: {
          score: 50, icpFit: 'ideal', interacoes: 0,
          objecoes: [], respostas: [], ultimoEstado: 'entrada',
        },
      })

      expect(result.isFail).toBe(true)
      expect(handoffHandler.eventosRecebidos.length).toBe(0)
    })

    it('deve REJEITAR qualificação sem score e NÃO disparar evento de qualificação', async () => {
      criarLeadSalvo(adapter)

      const initialEventCount = zeSalesHandler.eventosRecebidos.length

      const useCase = new QualificarLeadUseCase(adapter, publisher)
      const result = await useCase.execute('lead_qualify_001')

      expect(result.isFail).toBe(true)
      // Nenhum evento novo foi publicado (contagem permanece a mesma)
      // LeadCapturadoEvent já foi gerado no create() ANTES, mas não é publicado
      // porque o use case falha antes de chegar no salvar+publish
      // Na verdade, o use case falha ANTES de chegar no salvar e publish,
      // então nenhum evento novo deve ter sido adicionado
      expect(zeSalesHandler.eventosRecebidos.length).toBe(initialEventCount)
    })
  })
})
