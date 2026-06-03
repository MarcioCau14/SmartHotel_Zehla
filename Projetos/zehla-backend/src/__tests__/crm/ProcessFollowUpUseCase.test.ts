import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProcessFollowUpUseCase } from '../../application/crm/use-cases/ProcessFollowUpUseCase'
import { ICRMRepositoryPort } from '../../domain/crm/ports/ICRMRepositoryPort'
import { ILMProviderPort } from '../../domain/crm/ports/ILMProviderPort'
import { IWhatsAppPort } from '../../application/shared/ports/IWhatsAppPort'
import { CRMPipelineStage } from '../../domain/crm/models/CRMPipelineStage'
import { LeadProfile } from '../../domain/crm/models/LeadProfile'
import { InteractionRecord } from '../../domain/crm/models/InteractionRecord'
import { Result } from '../../shared/Result'

function createMockRepo(): ICRMRepositoryPort {
  return {
    salvarLead: vi.fn(),
    buscarLeadPorId: vi.fn(),
    listarLeadsPorStage: vi.fn(),
    registrarInteracao: vi.fn(),
    listarInteracoesPorLead: vi.fn(),
    atualizarStage: vi.fn(),
  }
}

function createMockLLM(): ILMProviderPort {
  return { generate: vi.fn() }
}

function createMockWhatsApp(): IWhatsAppPort {
  return {
    sendText: vi.fn(),
    checkNumberStatus: vi.fn(),
    getConnectionState: vi.fn(),
    deleteMessage: vi.fn(),
    fetchContacts: vi.fn(),
    fetchContactAbout: vi.fn(),
    fetchGroups: vi.fn(),
    fetchGroupParticipants: vi.fn(),
    fetchInstances: vi.fn(),
  }
}

function leadValido(overrides?: Partial<Parameters<typeof LeadProfile.create>[0]>) {
  return LeadProfile.create({
    id: 'lead-1',
    nome: 'Maria Silva',
    telefone: '5511999999999',
    email: 'maria@test.com',
    canalOrigem: 'website',
    ltvScore: 65,
    stage: CRMPipelineStage.QUALIFICACAO,
    createdAt: new Date(),
    propriedadeId: 'prop-1',
    ...overrides,
  })
}

describe('ProcessFollowUpUseCase', () => {
  let repo: ReturnType<typeof createMockRepo>
  let llm: ReturnType<typeof createMockLLM>
  let whatsApp: ReturnType<typeof createMockWhatsApp>
  let useCase: ProcessFollowUpUseCase

  beforeEach(() => {
    repo = createMockRepo()
    llm = createMockLLM()
    whatsApp = createMockWhatsApp()
    useCase = new ProcessFollowUpUseCase(repo, llm, whatsApp)
  })

  it('1. Deve orquestrar follow-up de ponta a ponta com sucesso (ENGAJAMENTO)', async () => {
    const lead = leadValido()
    expect(lead.isOk).toBe(true)

    const interaction = InteractionRecord.create({
      id: 'int-1',
      leadId: 'lead-1',
      canal: 'website',
      timestamp: new Date(),
      sentimentScore: 0.5,
      tokenCost: 10,
      outcome: 'PENDING',
      resumo: 'Visitou pagina de suites',
    })
    expect(interaction.isOk).toBe(true)

    vi.mocked(repo.buscarLeadPorId).mockResolvedValue(lead)
    vi.mocked(repo.listarInteracoesPorLead).mockResolvedValue(
      interaction.isOk ? Result.ok([interaction.value]) : Result.fail(new Error('erro'))
    )
    vi.mocked(repo.registrarInteracao).mockResolvedValue(interaction)
    vi.mocked(llm.generate).mockResolvedValue(Result.ok('Olá Maria! Tudo bem? Vi que você visitou nossas suítes. Posso ajudar com alguma dúvida?'))
    vi.mocked(whatsApp.sendText).mockResolvedValue({ success: true, externalId: 'wa-123' })

    const result = await useCase.execute({ leadId: 'lead-1', scheduleType: 'ENGAJAMENTO' })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.messageSent).toBe(true)
      expect(result.value.leadId).toBe('lead-1')
      expect(result.value.cadence).toBe('ENGAJAMENTO')
    }
    expect(whatsApp.sendText).toHaveBeenCalledTimes(1)
    expect(llm.generate).toHaveBeenCalledTimes(1)
    expect(repo.registrarInteracao).toHaveBeenCalledTimes(1)
  })

  it('2. Deve pular lead em FECHAMENTO silenciosamente', async () => {
    const lead = leadValido({ stage: CRMPipelineStage.FECHAMENTO })
    expect(lead.isOk).toBe(true)

    vi.mocked(repo.buscarLeadPorId).mockResolvedValue(lead)

    const result = await useCase.execute({ leadId: 'lead-1', scheduleType: 'URGENCIA' })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.messageSent).toBe(false)
    }
    expect(llm.generate).not.toHaveBeenCalled()
    expect(whatsApp.sendText).not.toHaveBeenCalled()
  })

  it('3. Deve falhar graciosamente se lead nao for encontrado', async () => {
    vi.mocked(repo.buscarLeadPorId).mockResolvedValue(Result.ok(null))

    const result = await useCase.execute({ leadId: 'inexistente', scheduleType: 'ENGAJAMENTO' })
    expect(result.isFail).toBe(true)
    if (result.isFail) {
      expect(result.error.message).toBe('LEAD_NAO_ENCONTRADO')
    }
    expect(llm.generate).not.toHaveBeenCalled()
    expect(whatsApp.sendText).not.toHaveBeenCalled()
  })

  it('4. Deve falhar graciosamente se repositorio falhar', async () => {
    vi.mocked(repo.buscarLeadPorId).mockResolvedValue(Result.fail(new Error('DB_ERRO')))

    const result = await useCase.execute({ leadId: 'lead-1', scheduleType: 'ENGAJAMENTO' })
    expect(result.isFail).toBe(true)
    if (result.isFail) {
      expect(result.error.message).toBe('DB_ERRO')
    }
  })

  it('5. Deve falhar graciosamente se LLM falhar', async () => {
    const lead = leadValido()
    expect(lead.isOk).toBe(true)

    const interaction = InteractionRecord.create({
      id: 'int-1',
      leadId: 'lead-1',
      canal: 'website',
      timestamp: new Date(),
      sentimentScore: 0.5,
      tokenCost: 10,
      outcome: 'PENDING',
      resumo: 'Visitou pagina de suites',
    })
    expect(interaction.isOk).toBe(true)

    vi.mocked(repo.buscarLeadPorId).mockResolvedValue(lead)
    vi.mocked(repo.listarInteracoesPorLead).mockResolvedValue(
      interaction.isOk ? Result.ok([interaction.value]) : Result.fail(new Error('erro'))
    )
    vi.mocked(llm.generate).mockResolvedValue(Result.fail(new Error('LLM_INDISPONIVEL')))

    const result = await useCase.execute({ leadId: 'lead-1', scheduleType: 'ENGAJAMENTO' })
    expect(result.isFail).toBe(true)
    if (result.isFail) {
      expect(result.error.message).toContain('LLM_FALHA')
    }
    expect(whatsApp.sendText).not.toHaveBeenCalled()
  })

  it('6. Deve falhar graciosamente se WhatsApp falhar', async () => {
    const lead = leadValido()
    expect(lead.isOk).toBe(true)

    const interaction = InteractionRecord.create({
      id: 'int-1',
      leadId: 'lead-1',
      canal: 'website',
      timestamp: new Date(),
      sentimentScore: 0.5,
      tokenCost: 10,
      outcome: 'PENDING',
      resumo: 'Visitou pagina de suites',
    })
    expect(interaction.isOk).toBe(true)

    vi.mocked(repo.buscarLeadPorId).mockResolvedValue(lead)
    vi.mocked(repo.listarInteracoesPorLead).mockResolvedValue(
      interaction.isOk ? Result.ok([interaction.value]) : Result.fail(new Error('erro'))
    )
    vi.mocked(llm.generate).mockResolvedValue(Result.ok('Mensagem de teste'))
    vi.mocked(whatsApp.sendText).mockResolvedValue({ success: false, error: 'NUMERO_INVALIDO' })

    const result = await useCase.execute({ leadId: 'lead-1', scheduleType: 'URGENCIA' })
    expect(result.isFail).toBe(true)
    if (result.isFail) {
      expect(result.error.message).toContain('WHATSAPP_FALHA')
    }
  })

  it('7. Deve orquestrar corretamente com scheduleType FECHAMENTO', async () => {
    const lead = leadValido({ stage: CRMPipelineStage.PROPOSTA })
    expect(lead.isOk).toBe(true)

    const interaction = InteractionRecord.create({
      id: 'int-2',
      leadId: 'lead-1',
      canal: 'whatsapp',
      timestamp: new Date(),
      sentimentScore: 0.3,
      tokenCost: 15,
      outcome: 'PENDING',
      resumo: 'Cliente pediu tempo para decidir',
    })
    expect(interaction.isOk).toBe(true)

    vi.mocked(repo.buscarLeadPorId).mockResolvedValue(lead)
    vi.mocked(repo.listarInteracoesPorLead).mockResolvedValue(
      interaction.isOk ? Result.ok([interaction.value]) : Result.fail(new Error('erro'))
    )
    vi.mocked(llm.generate).mockResolvedValue(Result.ok('Maria, esta é nossa última oportunidade com condição especial. Me confirme até as 18h para garantir sua reserva!'))
    vi.mocked(whatsApp.sendText).mockResolvedValue({ success: true, externalId: 'wa-456' })

    const result = await useCase.execute({ leadId: 'lead-1', scheduleType: 'FECHAMENTO' })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.messageSent).toBe(true)
      expect(result.value.cadence).toBe('FECHAMENTO')
    }
    expect(whatsApp.sendText).toHaveBeenCalledTimes(1)
  })

  it('8. Deve usar o resumo da ultima interacao no prompt', async () => {
    const lead = leadValido()
    expect(lead.isOk).toBe(true)

    const interaction = InteractionRecord.create({
      id: 'int-3',
      leadId: 'lead-1',
      canal: 'email',
      timestamp: new Date(),
      sentimentScore: 0.8,
      tokenCost: 5,
      outcome: 'PENDING',
      resumo: 'Lead demonstrou interesse na suíte master',
    })
    expect(interaction.isOk).toBe(true)

    vi.mocked(repo.buscarLeadPorId).mockResolvedValue(lead)
    vi.mocked(repo.listarInteracoesPorLead).mockResolvedValue(
      interaction.isOk ? Result.ok([interaction.value]) : Result.fail(new Error('erro'))
    )
    vi.mocked(llm.generate).mockResolvedValue(Result.ok('Mensagem personalizada'))
    vi.mocked(whatsApp.sendText).mockResolvedValue({ success: true, externalId: 'wa-789' })

    await useCase.execute({ leadId: 'lead-1', scheduleType: 'ENGAJAMENTO' })

    expect(llm.generate).toHaveBeenCalled()
    const callArgs = vi.mocked(llm.generate).mock.calls[0][0]
    expect(callArgs.userPrompt).toContain('Maria Silva')
    expect(callArgs.userPrompt).toContain('Lead demonstrou interesse na suíte master')
  })
})
