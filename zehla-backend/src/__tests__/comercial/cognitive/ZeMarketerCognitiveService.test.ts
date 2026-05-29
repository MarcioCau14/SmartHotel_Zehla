import { describe, it, expect, beforeEach } from 'vitest'
import { ZeMarketerCognitiveService } from '../../../application/comercial/cognitive/ZeMarketerCognitiveService'
import { ZeMarketerInput } from '../../../application/comercial/cognitive/ZeCognitiveTypes'
import { LeadInMemoryRepository } from '../../../infrastructure/persistence/comercial/LeadInMemoryRepository'
import { PropostaInMemoryRepository } from '../../../infrastructure/persistence/comercial/PropostaInMemoryRepository'
import { PacoteInMemoryRepository } from '../../../infrastructure/persistence/comercial/PacoteInMemoryRepository'
import { PagamentoInMemoryRepository } from '../../../infrastructure/persistence/comercial/PagamentoInMemoryRepository'
import { ConversaoInMemoryRepository } from '../../../infrastructure/persistence/comercial/ConversaoInMemoryRepository'
import { CalcularTaxaConversaoUseCase } from '../../../application/comercial/use-cases/CalcularTaxaConversaoUseCase'
import { ProcessarPropostasExpiradasUseCase } from '../../../application/comercial/use-cases/ProcessarPropostasExpiradasUseCase'
import { Money } from '../../../domain/comercial/value-objects/Money'
import { RegraPrecificacao } from '../../../domain/comercial/value-objects/RegraPrecificacao'

const ZCP_SECRET = 'zcp-test-secret-zehla'

function money(reais: number) {
  const r = Money.deReais(reais)
  if (r.isFail) throw new Error(`Failed to create money: ${r.error.message}`)
  return r.value
}

describe('ZeMarketerCognitiveService', () => {
  let leadRepo: LeadInMemoryRepository
  let propostaRepo: PropostaInMemoryRepository
  let pacoteRepo: PacoteInMemoryRepository
  let pagamentoRepo: PagamentoInMemoryRepository
  let conversaoRepo: ConversaoInMemoryRepository
  let service: ZeMarketerCognitiveService

  function makeInput(intent: ZeMarketerInput['intent'], overrides: Partial<ZeMarketerInput> = {}): ZeMarketerInput {
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

    const calcularTaxaUC = new CalcularTaxaConversaoUseCase(leadRepo, propostaRepo, pagamentoRepo, conversaoRepo)
    const processarExpiradasUC = new ProcessarPropostasExpiradasUseCase(propostaRepo, leadRepo)

    service = new ZeMarketerCognitiveService(
      leadRepo, pacoteRepo, conversaoRepo,
      calcularTaxaUC, processarExpiradasUC,
      ZCP_SECRET,
    )
  })

  it('should create a new package', async () => {
    const output = await service.processIntent(makeInput('CRIAR_PACOTE', {
      payload: {
        nome: 'Pacote Promocional Verão',
        descricao: 'Pacote especial com desconto',
        tipoQuarto: 'suite',
        capacidadeMaxima: 4,
        servicosInclusos: ['cafe', 'wifi', 'spa'],
      },
    }))
    expect(output.success).toBe(true)
    expect(output.data).toHaveProperty('pacoteId')
  })

  it('should reject package without name', async () => {
    const output = await service.processIntent(makeInput('CRIAR_PACOTE', {
      payload: {
        tipoQuarto: 'suite',
      },
    }))
    expect(output.success).toBe(false)
  })

  it('should list packages', async () => {
    const output = await service.processIntent(makeInput('LISTAR_PACOTES'))
    expect(output.success).toBe(true)
  })

  it('should activate a package', async () => {
    const regraResult = RegraPrecificacao.criar({
      tipo: 'por_noite',
      valorBase: money(200),
      valorPorNoite: money(150),
      valorPorPessoa: money(50),
    })
    if (regraResult.isFail) throw new Error(`Failed to create rule: ${regraResult.error.message}`)
    const pacoteCriado = await pacoteRepo.criarPacote({
      propriedadeId: 'prop_seed',
      nome: 'Pacote Teste',
      regraPrecificacao: regraResult.value,
      status: 'pausado',
    })
    if (pacoteCriado.isFail) throw new Error(`Failed to create paused package: ${pacoteCriado.error.message}`)

    const output = await service.processIntent(makeInput('ATIVAR_PACOTE', {
      payload: { pacoteId: pacoteCriado.value.id },
    }))
    expect(output.success).toBe(true)
  })

  it('should consult a lead (read-only)', async () => {
    const leadResult = await leadRepo.criarLead({
      canal: 'site',
      propriedadeId: 'prop_seed',
      nome: 'Lead Marketing',
      email: 'marketing@teste.com',
    })
    if (leadResult.isFail) throw new Error(`Failed to create lead: ${leadResult.error.message}`)

    const output = await service.processIntent(makeInput('CONSULTAR_LEAD', {
      payload: { leadId: leadResult.value.id },
    }))
    expect(output.success).toBe(true)
    expect(output.responseText).toContain('Lead Marketing')
  })

  it('should calculate conversion rate', async () => {
    const output = await service.processIntent(makeInput('CALCULAR_TAXA_CONVERSAO'))
    expect(output.success).toBe(true)
    expect(output.data).toHaveProperty('taxaConversao')
  })

  it('should create a valid ZCP handoff to Ze-Sales', () => {
    const handoff = service.requestHandoff({
      destino: 'ze-sales',
      leadId: 'lead_001',
      contexto: 'Lead engajou com campanha de email.',
      motivo: 'Lead clicou em oferta especial e solicitou contato comercial.',
      payload: { campanhaId: 'camp_001', taxaEngajamento: 0.75 },
    })
    expect(handoff.packageId).toBeTruthy()
    expect(handoff.origem).toBe('ze-marketer')
    expect(handoff.destino).toBe('ze-sales')
    expect(handoff.zcpSignature).toBeTruthy()
  })
})
