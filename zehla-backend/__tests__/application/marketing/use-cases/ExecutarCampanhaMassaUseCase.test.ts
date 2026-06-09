import { describe, it, expect, beforeEach } from 'vitest'
import { ExecutarCampanhaMassaUseCase } from '../../../../src/application/marketing/use-cases/ExecutarCampanhaMassaUseCase'
import { CampaignOrchestrator } from '../../../../src/domain/marketing/services/CampaignOrchestrator'
import { CampanhaInMemoryRepository } from '../../../../src/infrastructure/persistence/marketing/CampanhaInMemoryRepository'
import { FakeMessagingGateway } from '../fakes/FakeMessagingGateway'

describe('ExecutarCampanhaMassaUseCase', () => {
  let campanhaRepo: CampanhaInMemoryRepository
  let messagingGateway: FakeMessagingGateway
  let orchestrator: CampaignOrchestrator
  let useCase: ExecutarCampanhaMassaUseCase

  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + 7)

  const validInput = {
    propriedadeId: 'prop-1',
    campanhaId: '',
    segmentFilter: { type: 'todos' as const },
    templateId: 'template_promocao',
    templateVariables: { nome: '{{nome}}', oferta: '20% off' },
    schedule: {
      startAt: futureDate,
      timezone: 'America/Sao_Paulo',
      sendWindowStart: '09:00',
      sendWindowEnd: '18:00',
    },
    recipients: [
      { id: 'guest-1', name: 'João', phone: '+5511999999999', language: 'pt-BR' },
      { id: 'guest-2', name: 'Maria', phone: '+5511888888888', language: 'pt-BR' },
      { id: 'guest-3', name: 'Carlos', phone: '+5511777777777', language: 'en' },
    ],
  }

  beforeEach(async () => {
    campanhaRepo = new CampanhaInMemoryRepository()
    messagingGateway = new FakeMessagingGateway()
    orchestrator = new CampaignOrchestrator()
    useCase = new ExecutarCampanhaMassaUseCase(campanhaRepo, messagingGateway, orchestrator)

    const campanhaResult = await campanhaRepo.criarCampanha({
      propriedadeId: 'prop-1',
      nome: 'Campanha Promoção Verão',
      publicoAlvo: 'todos',
      tipo: 'mass_messaging',
      dataInicio: futureDate,
      dataFim: new Date(futureDate.getTime() + 7 * 24 * 60 * 60 * 1000),
    })
    validInput.campanhaId = campanhaResult.value!.id
  })

  it('should execute campaign successfully', async () => {
    const result = await useCase.execute(validInput)
    expect(result.isOk).toBe(true)
    expect(result.value.status).toBe('em_execucao')
    expect(result.value.totalRecipients).toBe(3)
    expect(result.value.batchSize).toBe(3)
    expect(result.value.estimatedMinutes).toBeGreaterThan(0)
  })

  it('should fail if campaign not found', async () => {
    const result = await useCase.execute({ ...validInput, campanhaId: 'inexistente' })
    expect(result.isFail).toBe(true)
    expect(result.error.message).toContain('CAMPANHA_NAO_ENCONTRADA')
  })

  it('should fail with invalid segment', async () => {
    const result = await useCase.execute({
      ...validInput,
      segmentFilter: { type: 'invalido' as any },
    })
    expect(result.isFail).toBe(true)
  })

  it('should fail with past schedule', async () => {
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 1)
    const result = await useCase.execute({
      ...validInput,
      schedule: { ...validInput.schedule, startAt: pastDate },
    })
    expect(result.isFail).toBe(true)
  })

  it('should fail with no recipients', async () => {
    const result = await useCase.execute({ ...validInput, recipients: [] })
    expect(result.isFail).toBe(true)
    expect(result.error.message).toContain('CAMPANHA_SEM_DESTINATARIOS')
  })

  it('should update campaign status to em_execucao', async () => {
    await useCase.execute(validInput)
    const campanhaResult = await campanhaRepo.buscarPorId(validInput.campanhaId, 'prop-1')
    expect(campanhaResult.isOk).toBe(true)
    expect(campanhaResult.value!.status).toBe('em_execucao')
  })

  it('should calculate correct batch size for many recipients', async () => {
    const manyRecipients = Array.from({ length: 150 }, (_, i) => ({
      id: `guest-${i}`,
      name: `Guest ${i}`,
      phone: `+551199999${String(i).padStart(4, '0')}`,
      language: 'pt-BR',
    }))
    const result = await useCase.execute({ ...validInput, recipients: manyRecipients })
    expect(result.isOk).toBe(true)
    expect(result.value.batchSize).toBe(100)
  })

  it('should handle recipients from different properties', async () => {
    const campanha2 = await campanhaRepo.criarCampanha({
      propriedadeId: 'prop-2',
      nome: 'Outra Campanha',
      publicoAlvo: 'todos',
      tipo: 'mass_messaging',
      dataInicio: futureDate,
      dataFim: new Date(futureDate.getTime() + 7 * 24 * 60 * 60 * 1000),
    })
    const result = await useCase.execute({
      ...validInput,
      campanhaId: campanha2.value!.id,
      propriedadeId: 'prop-2',
    })
    expect(result.isOk).toBe(true)
    expect(result.value.campanhaId).toBe(campanha2.value!.id)
  })
})
