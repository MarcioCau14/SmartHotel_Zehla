import { describe, it, expect, beforeEach } from 'vitest'
import { ComercialLead } from '../../domain/comercial/entities/ComercialLead'
import { LeadScore } from '../../domain/comercial/value-objects/LeadScore'
import { OrigemLead } from '../../domain/comercial/value-objects/OrigemLead'
import { Documento } from '../../domain/comercial/value-objects/Documento'
import { DomainEventPublisher } from '../../domain/shared/events/DomainEventPublisher'
import { InMemoryComercialLeadAdapter } from '../../infrastructure/persistence/comercial/InMemoryComercialLeadAdapter'
import { QualificarLeadUseCase } from '../../application/comercial/use-cases/QualificarLeadUseCase'
import { RealizarHandoffUseCase } from '../../application/comercial/use-cases/RealizarHandoffUseCase'
import { RegistrarNoShowUseCase } from '../../application/comercial/use-cases/RegistrarNoShowUseCase'

function criarLeadSalvo(adapter: InMemoryComercialLeadAdapter, score?: LeadScore, email?: string) {
  const origem = OrigemLead.criar('site').value as OrigemLead
  const lead = ComercialLead.create({
    id: 'lead_use_case_001',
    origem,
    propriedadeId: 'prop_123',
    nome: 'Cliente Teste',
    score,
    sdrResponsavel: 'ze_sales',
  }).value as ComercialLead
  adapter.salvarMock(lead)
  return lead
}

function criarLeadAgendadoSalvo(adapter: InMemoryComercialLeadAdapter) {
  const origem = OrigemLead.criar('site').value as OrigemLead
  const score = LeadScore.criar(80, 'ideal', {
    budget: true, authority: true, need: true, timeline: true,
  }).value as LeadScore
  const lead = ComercialLead.create({
    id: 'lead_agendado_001',
    origem,
    propriedadeId: 'prop_123',
    nome: 'Lead Agendado',
    score,
    sdrResponsavel: 'ze_sales',
  }).value as ComercialLead

  const contato = lead.primeiroContato().value as ComercialLead
  const agendado = contato.agendar(new Date('2026-06-10'), 'closer_01').value as ComercialLead
  adapter.salvarMock(agendado)
  return agendado
}

describe('ComercialLead — Casos de Uso (Application Layer)', () => {
  let adapter: InMemoryComercialLeadAdapter
  let publisher: DomainEventPublisher

  beforeEach(() => {
    adapter = new InMemoryComercialLeadAdapter()
    publisher = new DomainEventPublisher()
  })

  describe('QualificarLeadUseCase', () => {
    it('deve qualificar lead com score suficiente: entrada → primeira_interacao + qualificado', async () => {
      const score = LeadScore.criar(80, 'ideal', {
        budget: true, authority: true, need: true, timeline: true,
      }).value as LeadScore
      criarLeadSalvo(adapter, score)

      const useCase = new QualificarLeadUseCase(adapter, publisher)
      const result = await useCase.execute('lead_use_case_001')

      expect(result.isOk).toBe(true)
      if (result.isOk) {
        expect(result.value.estado).toBe('primeira_interacao')
        expect(result.value.quantidadeInteracoes).toBe(1)
        expect(result.value.ehQualificado).toBe(true)
      }
    })

    it('deve rejeitar qualificacao se lead nao tiver score', async () => {
      criarLeadSalvo(adapter)

      const useCase = new QualificarLeadUseCase(adapter, publisher)
      const result = await useCase.execute('lead_use_case_001')

      expect(result.isFail).toBe(true)
      if (result.isFail) {
        expect(result.error.message).toContain('LEAD_SEM_SCORE_NAO_PODE_QUALIFICAR')
      }
    })

    it('deve rejeitar qualificacao se score for insuficiente', async () => {
      const score = LeadScore.criar(10, 'fora_icp', {
        budget: false, authority: false, need: false, timeline: false,
      }).value as LeadScore
      criarLeadSalvo(adapter, score)

      const useCase = new QualificarLeadUseCase(adapter, publisher)
      const result = await useCase.execute('lead_use_case_001')

      expect(result.isFail).toBe(true)
      if (result.isFail) {
        expect(result.error.message).toContain('SCORE_INSUFICIENTE_PARA_QUALIFICACAO')
      }
    })

    it('deve rejeitar qualificacao se lead nao existir', async () => {
      const useCase = new QualificarLeadUseCase(adapter, publisher)
      const result = await useCase.execute('id_inexistente')

      expect(result.isFail).toBe(true)
      if (result.isFail) {
        expect(result.error.message).toContain('LEAD_NAO_ENCONTRADO')
      }
    })
  })

  describe('RealizarHandoffUseCase', () => {
    it('deve realizar handoff de lead agendado e persistir estado em_negociacao', async () => {
      criarLeadAgendadoSalvo(adapter)

      const useCase = new RealizarHandoffUseCase(adapter, publisher)
      const result = await useCase.execute({
        leadId: 'lead_agendado_001',
        closerId: 'closer_final',
        summaryPackage: {
          score: 80,
          icpFit: 'ideal',
          interacoes: 3,
          objecoes: ['preco'],
          respostas: ['cliente quer ver ROI'],
          ultimoEstado: 'agendado',
        },
      })

      expect(result.isOk).toBe(true)
      if (result.isOk) {
        expect(result.value.estado).toBe('em_negociacao')
        expect(result.value.closerResponsavel).toBe('closer_final')

        const busca = await adapter.buscarPorId('lead_agendado_001')
        expect(busca.isOk).toBe(true)
        if (busca.isOk) {
          expect(busca.value?.estado).toBe('em_negociacao')
          expect(busca.value?.closerResponsavel).toBe('closer_final')
        }
      }
    })

    it('deve REJEITAR handoff de lead em estado "entrada" (FSM violada)', async () => {
      const score = LeadScore.criar(50, 'ideal', {
        budget: true, authority: false, need: true, timeline: true,
      }).value as LeadScore
      criarLeadSalvo(adapter, score)

      const useCase = new RealizarHandoffUseCase(adapter, publisher)
      const result = await useCase.execute({
        leadId: 'lead_use_case_001',
        closerId: 'closer_final',
        summaryPackage: {
          score: 50,
          icpFit: 'ideal',
          interacoes: 0,
          objecoes: [],
          respostas: [],
          ultimoEstado: 'entrada',
        },
      })

      expect(result.isFail).toBe(true)
      if (result.isFail) {
        expect(result.error.message).toContain('HANDOFF_NAO_PERMITIDO')
      }

      const busca = await adapter.buscarPorId('lead_use_case_001')
      expect(busca.isOk).toBe(true)
      if (busca.isOk) {
        expect(busca.value?.estado).toBe('entrada')
      }
    })

    it('deve rejeitar handoff se lead nao existir', async () => {
      const useCase = new RealizarHandoffUseCase(adapter, publisher)
      const result = await useCase.execute({
        leadId: 'id_inexistente',
        closerId: 'closer',
        summaryPackage: {
          score: 50, icpFit: 'ideal', interacoes: 0,
          objecoes: [], respostas: [], ultimoEstado: 'desconhecido',
        },
      })

      expect(result.isFail).toBe(true)
      expect(result.error.message).toContain('LEAD_NAO_ENCONTRADO')
    })
  })

  describe('RegistrarNoShowUseCase', () => {
    it('deve registrar no-show de lead agendado e persistir', async () => {
      criarLeadAgendadoSalvo(adapter)

      const useCase = new RegistrarNoShowUseCase(adapter)
      const result = await useCase.execute('lead_agendado_001')

      expect(result.isOk).toBe(true)
      if (result.isOk) {
        expect(result.value.estado).toBe('no_show')

        const busca = await adapter.buscarPorId('lead_agendado_001')
        expect(busca.isOk).toBe(true)
        if (busca.isOk) {
          expect(busca.value?.estado).toBe('no_show')
        }
      }
    })

    it('deve REJEITAR no-show de lead sem data de agendamento', async () => {
      const score = LeadScore.criar(50, 'ideal', {
        budget: true, authority: false, need: true, timeline: true,
      }).value as LeadScore
      criarLeadSalvo(adapter, score)

      const useCase = new RegistrarNoShowUseCase(adapter)
      const result = await useCase.execute('lead_use_case_001')

      expect(result.isFail).toBe(true)
      if (result.isFail) {
        expect(result.error.message).toContain('NO_SHOW_SEM_AGENDAMENTO')
      }

      const busca = await adapter.buscarPorId('lead_use_case_001')
      expect(busca.isOk).toBe(true)
      if (busca.isOk) {
        expect(busca.value?.estado).toBe('entrada')
      }
    })

    it('deve rejeitar no-show se lead nao existir', async () => {
      const useCase = new RegistrarNoShowUseCase(adapter)
      const result = await useCase.execute('id_inexistente')

      expect(result.isFail).toBe(true)
      expect(result.error.message).toContain('LEAD_NAO_ENCONTRADO')
    })
  })
})
