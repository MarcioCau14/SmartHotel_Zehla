import { describe, it, expect, beforeEach } from 'vitest'
import { ZeSalesCognitiveService } from '../../../application/comercial/cognitive/ZeSalesCognitiveService'
import { ZeSalesInput } from '../../../application/comercial/cognitive/ZeCognitiveTypes'
import { LeadInMemoryRepository } from '../../../infrastructure/persistence/comercial/LeadInMemoryRepository'
import { PropostaInMemoryRepository } from '../../../infrastructure/persistence/comercial/PropostaInMemoryRepository'
import { PacoteInMemoryRepository } from '../../../infrastructure/persistence/comercial/PacoteInMemoryRepository'
import { PagamentoInMemoryRepository } from '../../../infrastructure/persistence/comercial/PagamentoInMemoryRepository'
import { ConversaoInMemoryRepository } from '../../../infrastructure/persistence/comercial/ConversaoInMemoryRepository'
import { CapturarLeadUseCase } from '../../../application/comercial/use-cases/CapturarLeadUseCase'
import { QualificarLeadUseCase } from '../../../application/comercial/use-cases/QualificarLeadUseCase'
import { CriarPropostaUseCase } from '../../../application/comercial/use-cases/CriarPropostaUseCase'
import { AceitarPropostaUseCase } from '../../../application/comercial/use-cases/AceitarPropostaUseCase'
import { SugerirDescontoUseCase } from '../../../application/comercial/use-cases/SugerirDescontoUseCase'
import { ConfirmarPagamentoUseCase } from '../../../application/comercial/use-cases/ConfirmarPagamentoUseCase'
import { Money } from '../../../domain/comercial/value-objects/Money'
import { RegraPrecificacao } from '../../../domain/comercial/value-objects/RegraPrecificacao'
import { Score } from '../../../domain/comercial/value-objects/Score'
import { ComercialLead } from '../../../domain/comercial/entities/ComercialLead'
import { LeadScore } from '../../../domain/comercial/value-objects/LeadScore'
import { OrigemLead } from '../../../domain/comercial/value-objects/OrigemLead'
import { DomainEventPublisher } from '../../../domain/shared/events/DomainEventPublisher'
import { InMemoryComercialLeadAdapter } from '../../../infrastructure/persistence/comercial/InMemoryComercialLeadAdapter'

const ZCP_SECRET = 'zcp-test-secret-zehla'

function money(reais: number) {
  const r = Money.deReais(reais)
  if (r.isFail) throw new Error(`Failed to create money: ${r.error.message}`)
  return r.value
}

function score(value: number) {
  const r = Score.criar(value)
  if (r.isFail) throw new Error(`Failed to create score: ${r.error.message}`)
  return r.value
}

describe('ZeSalesCognitiveService', () => {
  let leadRepo: LeadInMemoryRepository
  let propostaRepo: PropostaInMemoryRepository
  let pacoteRepo: PacoteInMemoryRepository
  let pagamentoRepo: PagamentoInMemoryRepository
  let conversaoRepo: ConversaoInMemoryRepository
  let service: ZeSalesCognitiveService

  function makeInput(intent: ZeSalesInput['intent'], overrides: Partial<ZeSalesInput> = {}): ZeSalesInput {
    return {
      intent,
      messageId: `msg-${Date.now()}-${Math.random()}`,
      propriedadeId: 'prop_seed',
      payload: {},
      ...overrides,
    }
  }

  beforeEach(async () => {
    leadRepo = new LeadInMemoryRepository()
    propostaRepo = new PropostaInMemoryRepository()
    pacoteRepo = new PacoteInMemoryRepository()
    pagamentoRepo = new PagamentoInMemoryRepository()
    conversaoRepo = new ConversaoInMemoryRepository()

    const regraResult = RegraPrecificacao.criar({
      tipo: 'por_noite',
      valorBase: money(200),
      valorPorNoite: money(150),
      valorPorPessoa: money(50),
    })
    if (regraResult.isFail) throw new Error(`Failed to create pricing rule: ${regraResult.error.message}`)

    const pacoteResult = await pacoteRepo.criarPacote({
      propriedadeId: 'prop_seed',
      nome: 'Suite Master Teste',
      descricao: 'Pacote de teste',
      tipoQuarto: 'suite',
      capacidadeMaxima: 4,
      servicosInclusos: ['cafe', 'wifi'],
      regraPrecificacao: regraResult.value,
      validadeInicio: new Date('2026-01-01'),
      validadeFim: new Date('2026-12-31'),
    })
    if (pacoteResult.isFail) throw new Error(`Failed to create package: ${pacoteResult.error.message}`)

    const comercialAdapter = new InMemoryComercialLeadAdapter()
    const publisher = new DomainEventPublisher()

    const capturarLeadUC = new CapturarLeadUseCase(leadRepo)
    const qualificarLeadUC = new QualificarLeadUseCase(comercialAdapter, publisher)
    const criarPropostaUC = new CriarPropostaUseCase(propostaRepo, leadRepo, pacoteRepo)
    const aceitarPropostaUC = new AceitarPropostaUseCase(propostaRepo, pagamentoRepo)
    const sugerirDescontoUC = new SugerirDescontoUseCase(propostaRepo, pacoteRepo, leadRepo)
    const confirmarPagamentoUC = new ConfirmarPagamentoUseCase(pagamentoRepo, propostaRepo, leadRepo, conversaoRepo)

    service = new ZeSalesCognitiveService(
      leadRepo, propostaRepo, pagamentoRepo, conversaoRepo,
      capturarLeadUC, qualificarLeadUC, criarPropostaUC,
      aceitarPropostaUC, sugerirDescontoUC, confirmarPagamentoUC,
      ZCP_SECRET,
    )

    // Seed a ComercialLead in the new adapter for qualification tests
    const origem = OrigemLead.criar('site').value as OrigemLead
    const score = LeadScore.criar(50, 'ideal', {
      budget: true, authority: false, need: true, timeline: true,
    }).value as LeadScore
    const seedLead = ComercialLead.create({
      id: 'lead_qualify_test',
      origem,
      propriedadeId: 'prop_seed',
      nome: 'Lead Qualify',
      score,
      sdrResponsavel: 'ze_sales',
    }).value as ComercialLead
    comercialAdapter.salvarMock(seedLead)

    // Seed a ComercialLead without score for rejection test
    const origem2 = OrigemLead.criar('site').value as OrigemLead
    const seedLeadNoScore = ComercialLead.create({
      id: 'lead_no_score_test',
      origem: origem2,
      propriedadeId: 'prop_seed',
      nome: 'Lead Sem Score',
      sdrResponsavel: 'ze_sales',
    }).value as ComercialLead
    comercialAdapter.salvarMock(seedLeadNoScore)
  })

  it('should capture a new lead', async () => {
    const output = await service.processIntent(makeInput('CAPTURAR_LEAD', {
      payload: {
        canal: 'site',
        nome: 'Maria Santos',
        email: 'maria@teste.com',
        telefone: '11988888888',
      },
    }))
    expect(output.success).toBe(true)
    expect(output.data).toHaveProperty('leadId')
  })

  it('should reject lead with invalid canal', async () => {
    const output = await service.processIntent(makeInput('CAPTURAR_LEAD', {
      payload: {
        canal: 'invalido',
        nome: 'Teste',
      },
    }))
    expect(output.success).toBe(false)
  })

  it('should qualify an existing lead via new use case', async () => {
    const output = await service.processIntent(makeInput('QUALIFICAR_LEAD', {
      payload: { leadId: 'lead_qualify_test' },
    }))
    expect(output.success).toBe(true)
  })

  it('should reject qualification for lead without score', async () => {
    const output = await service.processIntent(makeInput('QUALIFICAR_LEAD', {
      payload: { leadId: 'lead_no_score_test' },
    }))
    expect(output.success).toBe(false)
  })

  it('should list leads', async () => {
    await service.processIntent(makeInput('CAPTURAR_LEAD', {
      payload: { canal: 'site', nome: 'Lead 1', email: 'lead1@teste.com' },
    }))
    await service.processIntent(makeInput('CAPTURAR_LEAD', {
      payload: { canal: 'whatsapp', nome: 'Lead 2', email: 'lead2@teste.com' },
    }))

    const output = await service.processIntent(makeInput('LISTAR_LEADS'))
    expect(output.success).toBe(true)
  })

  it('should create a valid ZCP handoff to Ze-Marketer', () => {
    const handoff = service.requestHandoff({
      destino: 'ze-marketer',
      leadId: 'lead_001',
      contexto: 'Lead perdeu interesse na proposta.',
      motivo: 'Recusou proposta 3 vezes. Sugerir campanha de reengajamento.',
      payload: { propostasRecusadas: 3 },
    })
    expect(handoff.packageId).toBeTruthy()
    expect(handoff.origem).toBe('ze-sales')
    expect(handoff.destino).toBe('ze-marketer')
    expect(handoff.zcpSignature).toBeTruthy()
  })
})
