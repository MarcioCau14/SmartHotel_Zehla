import { describe, it, expect, beforeEach } from 'vitest'
import { ExecutarCampanhaMassaUseCase } from '@/application/marketing/use-cases/ExecutarCampanhaMassaUseCase'
import { CampaignOrchestrator } from '@/domain/marketing/services/CampaignOrchestrator'
import { CampanhaInMemoryRepository } from '@/infrastructure/persistence/marketing/CampanhaInMemoryRepository'
import { FakeQueue } from '../../../../application/marketing/fakes/FakeQueue'

describe('POST /api/marketing/campaigns/dispatch', () => {
  let campanhaRepo: CampanhaInMemoryRepository
  let fakeQueue: FakeQueue
  let orchestrator: CampaignOrchestrator
  let useCase: ExecutarCampanhaMassaUseCase
  let campanhaId: string

  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + 7)

  beforeEach(async () => {
    campanhaRepo = new CampanhaInMemoryRepository()
    fakeQueue = new FakeQueue()
    orchestrator = new CampaignOrchestrator()
    useCase = new ExecutarCampanhaMassaUseCase(campanhaRepo, orchestrator, fakeQueue as any)

    const result = await campanhaRepo.criarCampanha({
      propriedadeId: 'prop-1',
      nome: 'Campanha Teste',
      publicoAlvo: 'todos',
      tipo: 'mass_messaging',
      dataInicio: futureDate,
      dataFim: new Date(futureDate.getTime() + 7 * 24 * 60 * 60 * 1000),
    })
    campanhaId = result.value!.id
  })

  const validPayload = () => ({
    propriedadeId: 'prop-1',
    campanhaId: undefined as unknown as string,
    segmentFilter: { type: 'todos' as const },
    templateId: 'template_promocao',
    templateVariables: { nome: '{{nome}}' },
    schedule: {
      startAt: new Date(Date.now() + 86400000),
      timezone: 'America/Sao_Paulo',
      sendWindowStart: '09:00',
      sendWindowEnd: '18:00',
    },
    recipients: [
      { id: 'guest-1', name: 'João', phone: '+5511999999999', language: 'pt-BR' },
    ],
  })

  it('should return 202 on successful dispatch', async () => {
    const payload = validPayload()
    payload.campanhaId = campanhaId
    const result = await useCase.execute(payload as any)
    expect(result.isOk).toBe(true)
    expect(result.value.status).toBe('em_execucao')
    expect(fakeQueue.getJobCount()).toBe(1)
  })

  it('should fail with 400 when campanhaId is missing', async () => {
    const result = await useCase.execute({ ...validPayload(), campanhaId: '' } as any)
    expect(result.isFail).toBe(true)
  })

  it('should fail with 404 when campaign does not exist', async () => {
    const result = await useCase.execute({ ...validPayload(), campanhaId: 'inexistente' } as any)
    expect(result.isFail).toBe(true)
    expect(result.error.message).toContain('CAMPANHA_NAO_ENCONTRADA')
  })

  it('should fail with 400 when recipients is empty', async () => {
    const payload = validPayload()
    payload.campanhaId = campanhaId
    payload.recipients = []
    const result = await useCase.execute(payload as any)
    expect(result.isFail).toBe(true)
    expect(result.error.message).toContain('CAMPANHA_SEM_DESTINATARIOS')
  })

  it('should dispatch to queue with correct metadata', async () => {
    const payload = validPayload()
    payload.campanhaId = campanhaId
    const result = await useCase.execute(payload as any)
    expect(result.isOk).toBe(true)
    const jobData = fakeQueue.jobs[0].data as any
    expect(jobData.campaignId).toBe(campanhaId)
    expect(jobData.templateId).toBe('template_promocao')
    expect(jobData.recipients).toHaveLength(1)
    expect(jobData.propertyId).toBe('prop-1')
  })

  it('should handle multiple recipients with correct batch sizing', async () => {
    const payload = validPayload()
    payload.campanhaId = campanhaId
    payload.recipients = Array.from({ length: 200 }, (_, i) => ({
      id: `g-${i}`, name: `Guest ${i}`, phone: `+551199999${String(i).padStart(4, '0')}`, language: 'pt-BR',
    }))
    const result = await useCase.execute(payload as any)
    expect(result.isOk).toBe(true)
    expect(result.value.batchesDispatched).toBe(2)
    expect(fakeQueue.getJobCount()).toBe(2)
  })
})
