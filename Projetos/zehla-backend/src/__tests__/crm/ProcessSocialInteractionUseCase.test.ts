import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProcessSocialInteractionUseCase } from '../../application/crm/use-cases/ProcessSocialInteractionUseCase'
import { ICRMRepositoryPort } from '../../domain/crm/ports/ICRMRepositoryPort'
import { AnalyzeSocialIntentSignature } from '../../domain/crm/cognitive/AnalyzeSocialIntentSignature'
import { Result } from '../../shared/Result'

function createMockRepo(): ICRMRepositoryPort & { reset: () => void } {
  const saved: any[] = []
  return {
    salvarLead: vi.fn().mockImplementation(async (lead) => { saved.push(lead); return Result.ok(lead) }),
    buscarLeadPorId: vi.fn().mockResolvedValue(Result.ok(null)),
    buscarLeadPorTelefone: vi.fn().mockResolvedValue(Result.ok(null)),
    listarLeadsPorStage: vi.fn().mockResolvedValue(Result.ok([])),
    registrarInteracao: vi.fn().mockResolvedValue(Result.ok({})),
    listarInteracoesPorLead: vi.fn().mockResolvedValue(Result.ok([])),
    atualizarStage: vi.fn().mockResolvedValue(Result.ok({})),
    reset: () => { saved.length = 0 },
  }
}

describe('ProcessSocialInteractionUseCase', () => {
  let repo: ReturnType<typeof createMockRepo>
  let useCase: ProcessSocialInteractionUseCase

  beforeEach(() => {
    repo = createMockRepo()
    useCase = new ProcessSocialInteractionUseCase(repo, AnalyzeSocialIntentSignature.classifyIntent)
  })

  it('1. Deve criar lead no CRM para comentário com intenção de compra (INSTAGRAM)', async () => {
    const result = await useCase.execute({
      platform: 'INSTAGRAM',
      username: '@maria_viajante',
      content: 'Qual o preço da diária para casal?',
      timestamp: 1000,
      isDirectMessage: false,
    })

    expect(result.isOk).toBe(true)
    expect(repo.salvarLead).toHaveBeenCalledTimes(1)

    const savedLead = (repo.salvarLead as any).mock.calls[0][0]
    expect(savedLead.canalOrigem).toBe('INSTAGRAM')
    expect(savedLead.stage).toBe('ENTRADA')
  })

  it('2. Deve criar lead no CRM para DM no FACEBOOK com intenção de compra', async () => {
    const result = await useCase.execute({
      platform: 'FACEBOOK',
      username: 'João Silva',
      content: 'Quero reservar um quarto para o feriado',
      timestamp: 2000,
      isDirectMessage: true,
    })

    expect(result.isOk).toBe(true)
    expect(repo.salvarLead).toHaveBeenCalledTimes(1)

    const savedLead = (repo.salvarLead as any).mock.calls[0][0]
    expect(savedLead.canalOrigem).toBe('FACEBOOK')
  })

  it('3. NÃO deve salvar lead para comentário sem intenção de compra', async () => {
    const result = await useCase.execute({
      platform: 'INSTAGRAM',
      username: '@fotografia_arte',
      content: 'Que foto linda!',
      timestamp: 3000,
      isDirectMessage: false,
    })

    expect(result.isOk).toBe(false)
    expect(repo.salvarLead).not.toHaveBeenCalled()
  })

  it('4. NÃO deve salvar lead para comentário genérico', async () => {
    const result = await useCase.execute({
      platform: 'INSTAGRAM',
      username: '@curtidor',
      content: 'Amei! 😍',
      timestamp: 4000,
      isDirectMessage: false,
    })

    expect(result.isOk).toBe(false)
    expect(repo.salvarLead).not.toHaveBeenCalled()
  })

  it('5. Deve rejeitar plataforma inválida antes de chamar o serviço', async () => {
    const result = await useCase.execute({
      platform: 'TIKTOK' as any,
      username: '@teste',
      content: 'Qual o valor?',
      timestamp: 5000,
      isDirectMessage: false,
    })

    expect(result.isOk).toBe(false)
    expect(repo.salvarLead).not.toHaveBeenCalled()
  })

  it('6. Deve extrair telefone e salvar lead corretamente', async () => {
    const result = await useCase.execute({
      platform: 'INSTAGRAM',
      username: '@urgente',
      content: 'Preciso de um quarto hoje, meu whats 11988887777',
      timestamp: 6000,
      isDirectMessage: true,
    })

    expect(result.isOk).toBe(true)
    expect(repo.salvarLead).toHaveBeenCalledTimes(1)

    const savedLead = (repo.salvarLead as any).mock.calls[0][0]
    expect(savedLead.telefone).toBe('11988887777')
  })

  it('7. Deve rejeitar content vazio', async () => {
    const result = await useCase.execute({
      platform: 'INSTAGRAM',
      username: '@teste',
      content: '',
      timestamp: 7000,
      isDirectMessage: false,
    })

    expect(result.isOk).toBe(false)
    expect(repo.salvarLead).not.toHaveBeenCalled()
  })

  it('8. Deve rejeitar username vazio', async () => {
    const result = await useCase.execute({
      platform: 'INSTAGRAM',
      username: '',
      content: 'Quanto custa?',
      timestamp: 8000,
      isDirectMessage: false,
    })

    expect(result.isOk).toBe(false)
    expect(repo.salvarLead).not.toHaveBeenCalled()
  })
})
