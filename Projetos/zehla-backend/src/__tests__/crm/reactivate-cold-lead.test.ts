import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ReactivateColdLeadUseCase } from '../../application/crm/use-cases/ReactivateColdLeadUseCase'
import { FarmerReactivationService } from '../../domain/crm/services/FarmerReactivationService'
import { LeadProfile } from '../../domain/crm/models/LeadProfile'
import { CRMPipelineStage, ICPersona } from '../../domain/crm/models/CRMPipelineStage'
import { InteractionRecord } from '../../domain/crm/models/InteractionRecord'
import { Result } from '../../shared/Result'
import { gaussianDelayMs } from '../../shared/GaussianDelay'

function leadValido(overrides?: Partial<Parameters<typeof LeadProfile.create>[0]>) {
  return LeadProfile.create({
    id: 'lead-cold-1',
    nome: 'Maria Silva',
    telefone: '5511999999999',
    email: 'maria@test.com',
    canalOrigem: 'instagram',
    ltvScore: 50,
    stage: CRMPipelineStage.ENTRADA,
    createdAt: new Date(Date.now() - 200 * 86_400_000),
    propriedadeId: 'prop-1',
    ...overrides,
  })
}

function createMockRepo() {
  return {
    salvarLead: vi.fn().mockResolvedValue(Result.ok({})),
    buscarLeadPorId: vi.fn(),
    buscarLeadPorTelefone: vi.fn().mockResolvedValue(Result.ok(null)),
    listarLeadsPorStage: vi.fn().mockResolvedValue(Result.ok([])),
    registrarInteracao: vi.fn().mockResolvedValue(Result.ok({})),
    listarInteracoesPorLead: vi.fn().mockResolvedValue(Result.ok([])),
    atualizarStage: vi.fn().mockResolvedValue(Result.ok({})),
  }
}

function createMockWhatsApp() {
  return {
    sendText: vi.fn().mockResolvedValue({ success: true, externalId: 'wa-123' }),
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

describe('GaussianDelay', () => {
  it('deve gerar delay dentro do intervalo [5000, 45000]', () => {
    for (let i = 0; i < 100; i++) {
      const delay = gaussianDelayMs(5000, 45000)
      expect(delay).toBeGreaterThanOrEqual(5000)
      expect(delay).toBeLessThanOrEqual(45000)
    }
  })

  it('deve ter média aproximada de 25000 para range 5000-45000', () => {
    const samples = Array.from({ length: 1000 }, () => gaussianDelayMs(5000, 45000))
    const mean = samples.reduce((a, b) => a + b, 0) / samples.length
    expect(mean).toBeGreaterThan(15000)
    expect(mean).toBeLessThan(35000)
  })

  it('deve aceitar ranges customizados', () => {
    for (let i = 0; i < 50; i++) {
      const delay = gaussianDelayMs(1000, 10000)
      expect(delay).toBeGreaterThanOrEqual(1000)
      expect(delay).toBeLessThanOrEqual(10000)
    }
  })
})

describe('ReactivateColdLeadUseCase', () => {
  let repo: ReturnType<typeof createMockRepo>
  let whatsApp: ReturnType<typeof createMockWhatsApp>
  let useCase: ReactivateColdLeadUseCase

  beforeEach(() => {
    vi.clearAllMocks()
    repo = createMockRepo()
    whatsApp = createMockWhatsApp()
    const noDelay = async () => {}
    useCase = new ReactivateColdLeadUseCase(repo, whatsApp, new FarmerReactivationService(), noDelay)
  })

  it('deve retornar erro para lista vazia de leads', async () => {
    const result = await useCase.execute([], new Date())
    expect(result.isOk).toBe(false)
  })

  it('NÃO deve enviar mensagem se lead não tiver interações', async () => {
    const lead = leadValido()
    expect(lead.isOk).toBe(true)
    if (!lead.isOk) return

    repo.listarInteracoesPorLead.mockResolvedValue(Result.ok([]))
    const result = await useCase.execute([lead.value], new Date())

    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.totalCandidates).toBe(0)
      expect(result.value.sentMessages).toBe(0)
      expect(whatsApp.sendText).not.toHaveBeenCalled()
    }
  })

  it('NÃO deve enviar para leads com reserva futura (status FUTURE)', async () => {
    const lead = leadValido()
    expect(lead.isOk).toBe(true)
    if (!lead.isOk) return

    const interaction = InteractionRecord.create({
      id: 'int-future',
      leadId: 'lead-cold-1',
      canal: 'website',
      timestamp: new Date(Date.now() + 30 * 86_400_000),
      sentimentScore: 0.5,
      tokenCost: 10,
      outcome: 'CONVERTED',
      resumo: 'Lead perguntou sobre pacotes para o próximo mês, SDR respondeu com opções',
    })
    expect(interaction.isOk).toBe(true)
    if (!interaction.isOk) return

    repo.listarInteracoesPorLead.mockResolvedValue(Result.ok([interaction.value]))
    const result = await useCase.execute([lead.value], new Date())

    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.skippedNoFutureReservations).toBeGreaterThanOrEqual(1)
      expect(whatsApp.sendText).not.toHaveBeenCalled()
    }
  })

  it('deve enviar mensagem para lead com interação antiga (>180 dias)', async () => {
    const lead = leadValido()
    expect(lead.isOk).toBe(true)
    if (!lead.isOk) return

    const oldInteraction = InteractionRecord.create({
      id: 'int-old',
      leadId: 'lead-cold-1',
      canal: 'whatsapp',
      timestamp: new Date(Date.now() - 200 * 86_400_000),
      sentimentScore: 0.5,
      tokenCost: 10,
      outcome: 'CONVERTED',
      resumo: 'Reserva confirmada e checkout realizado',
    })
    expect(oldInteraction.isOk).toBe(true)
    if (!oldInteraction.isOk) return

    repo.listarInteracoesPorLead.mockResolvedValue(Result.ok([oldInteraction.value]))
    whatsApp.sendText.mockResolvedValue({ success: true, externalId: 'wa-456' })

    const result = await useCase.execute([lead.value], new Date())

    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.totalCandidates).toBe(1)
      expect(result.value.sentMessages).toBe(1)
      expect(whatsApp.sendText).toHaveBeenCalledTimes(1)
      expect(whatsApp.sendText).toHaveBeenCalledWith({
        to: '5511999999999',
        content: expect.stringContaining('Maria Silva'),
      })
    }
  })

  it('deve registrar interação após envio bem-sucedido', async () => {
    const lead = leadValido()
    expect(lead.isOk).toBe(true)
    if (!lead.isOk) return

    const oldInteraction = InteractionRecord.create({
      id: 'int-old-2',
      leadId: 'lead-cold-1',
      canal: 'whatsapp',
      timestamp: new Date(Date.now() - 200 * 86_400_000),
      sentimentScore: 0.5,
      tokenCost: 10,
      outcome: 'CONVERTED',
      resumo: 'Checkout realizado',
    })
    expect(oldInteraction.isOk).toBe(true)
    if (!oldInteraction.isOk) return

    repo.listarInteracoesPorLead.mockResolvedValue(Result.ok([oldInteraction.value]))

    const result = await useCase.execute([lead.value], new Date())

    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(repo.registrarInteracao).toHaveBeenCalledTimes(1)
    }
  })

  it('deve acumular erros sem interromper o loop', async () => {
    const lead1 = leadValido({ id: 'lead-1', telefone: '111' })
    const lead2 = leadValido({ id: 'lead-2', telefone: '222' })
    const lead3 = leadValido({ id: 'lead-3', telefone: '333' })
    expect(lead1.isOk && lead2.isOk && lead3.isOk).toBe(true)
    if (!lead1.isOk || !lead2.isOk || !lead3.isOk) return

    const oldInteraction = InteractionRecord.create({
      id: 'int-old-3',
      leadId: 'lead-1',
      canal: 'whatsapp',
      timestamp: new Date(Date.now() - 200 * 86_400_000),
      sentimentScore: 0.5,
      tokenCost: 10,
      outcome: 'CONVERTED',
      resumo: 'Checkout realizado',
    })
    expect(oldInteraction.isOk).toBe(true)
    if (!oldInteraction.isOk) return

    repo.listarInteracoesPorLead
      .mockResolvedValueOnce(Result.ok([oldInteraction.value]))
      .mockResolvedValueOnce(Result.fail(new Error('REPO_FALHA')))
      .mockResolvedValueOnce(Result.ok([]))

    whatsApp.sendText.mockResolvedValue({ success: true })

    const result = await useCase.execute([lead1.value, lead2.value, lead3.value], new Date())

    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.sentMessages).toBe(1)
    }
  })
})
