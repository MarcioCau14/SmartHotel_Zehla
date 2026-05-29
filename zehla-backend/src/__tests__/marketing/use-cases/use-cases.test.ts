import { describe, it, expect, beforeEach } from 'vitest'
import { Money } from '../../../domain/comercial/value-objects/Money'
import { ReviewInMemoryRepository } from '../../../infrastructure/persistence/marketing/ReviewInMemoryRepository'
import { CampanhaInMemoryRepository } from '../../../infrastructure/persistence/marketing/CampanhaInMemoryRepository'
import { ConteudoInMemoryRepository } from '../../../infrastructure/persistence/marketing/ConteudoInMemoryRepository'
import { PostInMemoryRepository } from '../../../infrastructure/persistence/marketing/PostInMemoryRepository'
import { MetricaInMemoryRepository } from '../../../infrastructure/persistence/marketing/MetricaInMemoryRepository'
import { AnalisarSentimentoReviewUseCase } from '../../../application/marketing/use-cases/AnalisarSentimentoReviewUseCase'
import { ResponderReviewPortalUseCase } from '../../../application/marketing/use-cases/ResponderReviewPortalUseCase'
import { CriarCampanhaRemarketingUseCase } from '../../../application/marketing/use-cases/CriarCampanhaRemarketingUseCase'
import { AgendarPostUseCase } from '../../../application/marketing/use-cases/AgendarPostUseCase'
import { CalcularMetricasMarketingUseCase } from '../../../application/marketing/use-cases/CalcularMetricasMarketingUseCase'
import { ProcessarWebhookReviewUseCase } from '../../../application/marketing/use-cases/ProcessarWebhookReviewUseCase'

function money(centavos: number) {
  const r = Money.criar(centavos)
  if (r.isFail) throw new Error(`Failed to create money: ${r.error.message}`)
  return r.value
}

describe('AnalisarSentimentoReviewUseCase', () => {
  let reviewRepo: ReviewInMemoryRepository
  let useCase: AnalisarSentimentoReviewUseCase

  beforeEach(async () => {
    reviewRepo = new ReviewInMemoryRepository()
    useCase = new AnalisarSentimentoReviewUseCase(reviewRepo)
  })

  it('should analyze review and detect critico', async () => {
    const created = await reviewRepo.receberReview({
      propriedadeId: 'prop_1', hospedeNome: 'João', portal: 'booking',
      nota: 2, texto: 'Ar condicionado quebrado.', dataEstadia: new Date('2026-07-15'),
      quartoId: 'quarto_101',
    })
    expect(created.isOk).toBe(true)

    const result = await useCase.execute({ reviewId: created.value!.id, propriedadeId: 'prop_1' })
    expect(result.isOk).toBe(true)
    expect(result.value!.precisaHandoff).toBe(true)
    expect(result.value!.taskSugerida).toContain('quarto_101')
  })

  it('should analyze review without handoff for positive', async () => {
    const created = await reviewRepo.receberReview({
      propriedadeId: 'prop_1', hospedeNome: 'Maria', portal: 'booking',
      nota: 9, texto: 'Tudo perfeito!', dataEstadia: new Date('2026-07-15'),
    })
    const result = await useCase.execute({ reviewId: created.value!.id, propriedadeId: 'prop_1' })
    expect(result.isOk).toBe(true)
    expect(result.value!.precisaHandoff).toBe(false)
  })

  it('M2: should fail for non-existent review', async () => {
    const result = await useCase.execute({ reviewId: 'fake', propriedadeId: 'prop_1' })
    expect(result.isFail).toBe(true)
    expect(result.error.message).toBe('REVIEW_NOT_FOUND')
  })
})

describe('ResponderReviewPortalUseCase', () => {
  let reviewRepo: ReviewInMemoryRepository
  let conteudoRepo: ConteudoInMemoryRepository
  let useCase: ResponderReviewPortalUseCase

  beforeEach(async () => {
    reviewRepo = new ReviewInMemoryRepository()
    conteudoRepo = new ConteudoInMemoryRepository()
    useCase = new ResponderReviewPortalUseCase(reviewRepo, conteudoRepo, {
      buscarPorId: async () => ({ id: 'res_1', hospedeNome: 'João', dataCheckIn: new Date('2026-07-10'), dataCheckOut: new Date('2026-07-15') }),
    })
  })

  it('should respond to review', async () => {
    const created = await reviewRepo.receberReview({
      propriedadeId: 'prop_1', hospedeNome: 'João', portal: 'booking',
      nota: 8, texto: 'Ótima estadia!', dataEstadia: new Date('2026-07-15'),
    })
    const result = await useCase.execute({
      reviewId: created.value!.id, propriedadeId: 'prop_1',
      textoResposta: 'Obrigado João! Ficamos felizes que aproveitou a estadia conosco. Esperamos recebê-lo novamente em breve!',
      tom: 'acolhedor',
    })
    expect(result.isOk).toBe(true)
    expect(result.value!.review.status).toBe('respondido')
    expect(result.value!.conteudo.tom).toBe('acolhedor')
  })

  it('should fail for non-existent review', async () => {
    const result = await useCase.execute({
      reviewId: 'fake', propriedadeId: 'prop_1',
      textoResposta: 'Obrigado!', tom: 'profissional',
    })
    expect(result.isFail).toBe(true)
  })
})

describe('CriarCampanhaRemarketingUseCase', () => {
  let campanhaRepo: CampanhaInMemoryRepository
  let conteudoRepo: ConteudoInMemoryRepository
  let useCase: CriarCampanhaRemarketingUseCase

  beforeEach(async () => {
    campanhaRepo = new CampanhaInMemoryRepository()
    conteudoRepo = new ConteudoInMemoryRepository()
    useCase = new CriarCampanhaRemarketingUseCase(campanhaRepo, conteudoRepo)
  })

  it('should create campaign', async () => {
    const result = await useCase.execute({
      propriedadeId: 'prop_1', nome: 'Remarketing Verão',
      publicoAlvo: 'hospedes_satisfeitos', tipo: 'remarketing',
      textoConteudo: 'Venha passar o verão conosco!', tom: 'entusiasta',
      dataInicio: new Date('2026-12-01'), dataFim: new Date('2027-02-28'),
    })
    expect(result.isOk).toBe(true)
    expect(result.value!.campanha.status).toBe('draft')
    expect(result.value!.conteudo.tom).toBe('entusiasta')
  })

  it('M5: should fail without publicoAlvo', async () => {
    const result = await useCase.execute({
      propriedadeId: 'prop_1', nome: 'Campanha',
      publicoAlvo: '', tipo: 'remarketing',
      textoConteudo: 'Venha!', tom: 'neutro',
      dataInicio: new Date(), dataFim: new Date('2027-01-01'),
    })
    expect(result.isFail).toBe(true)
    expect(result.error.message).toBe('CAMPANHA_SEM_SEGMENTO')
  })

  it('M6: should fail with unvalidated promise', async () => {
    const result = await useCase.execute({
      propriedadeId: 'prop_1', nome: 'Campanha',
      publicoAlvo: 'todos', tipo: 'remarketing',
      textoConteudo: '20% de desconto!', tom: 'entusiasta',
      dataInicio: new Date(), dataFim: new Date('2027-01-01'),
      possuiPromiseFinanceira: true, promiseFinanceiraValidada: false,
    })
    expect(result.isFail).toBe(true)
    expect(result.error.message).toBe('CAMPANHA_PROMISE_FINANCEIRA')
  })

  it('M6: should allow with validated promise', async () => {
    const result = await useCase.execute({
      propriedadeId: 'prop_1', nome: 'Campanha',
      publicoAlvo: 'todos', tipo: 'promocional',
      textoConteudo: '20% de desconto na próxima estadia!', tom: 'entusiasta',
      dataInicio: new Date(), dataFim: new Date('2027-01-01'),
      possuiPromiseFinanceira: true, promiseFinanceiraValidada: true,
    })
    expect(result.isOk).toBe(true)
  })
})

describe('AgendarPostUseCase', () => {
  let postRepo: PostInMemoryRepository
  let conteudoRepo: ConteudoInMemoryRepository
  let useCase: AgendarPostUseCase

  beforeEach(async () => {
    postRepo = new PostInMemoryRepository()
    conteudoRepo = new ConteudoInMemoryRepository()
    useCase = new AgendarPostUseCase(postRepo, conteudoRepo)
  })

  it('should create and schedule post', async () => {
    const result = await useCase.execute({
      propriedadeId: 'prop_1', canal: 'instagram', tipo: 'institucional',
      texto: 'Venha conhecer nossa pousada!', tom: 'acolhedor',
      dataAgendamento: new Date('2026-12-25'),
    })
    expect(result.isOk).toBe(true)
    expect(result.value!.post.status).toBe('agendado')
    expect(result.value!.conteudo.tom).toBe('acolhedor')
  })

  it('M10: should reject non-social channel', async () => {
    const result = await useCase.execute({
      propriedadeId: 'prop_1', canal: 'booking', tipo: 'institucional',
      texto: 'Venha!', tom: 'neutro',
    })
    expect(result.isFail).toBe(true)
    expect(result.error.message).toBe('POST_CANAL_INVALIDO')
  })

  it('M11: should require midia for promocional', async () => {
    const result = await useCase.execute({
      propriedadeId: 'prop_1', canal: 'instagram', tipo: 'promocional',
      texto: 'Promoção!', tom: 'entusiasta',
    })
    expect(result.isFail).toBe(true)
    expect(result.error.message).toBe('POST_SEM_MIDIA_PROMOCIONAL')
  })

  it('M11: should allow promocional with midia', async () => {
    const result = await useCase.execute({
      propriedadeId: 'prop_1', canal: 'instagram', tipo: 'promocional',
      texto: 'Promoção imperdível!', tom: 'entusiasta',
      midias: ['img_promocao.jpg'],
    })
    expect(result.isOk).toBe(true)
  })
})

describe('CalcularMetricasMarketingUseCase', () => {
  let reviewRepo: ReviewInMemoryRepository
  let metricaRepo: MetricaInMemoryRepository
  let useCase: CalcularMetricasMarketingUseCase

  beforeEach(async () => {
    reviewRepo = new ReviewInMemoryRepository()
    metricaRepo = new MetricaInMemoryRepository()
    useCase = new CalcularMetricasMarketingUseCase(reviewRepo, metricaRepo)
  })

  it('should calculate metrics from reviews', async () => {
    await reviewRepo.receberReview({
      propriedadeId: 'prop_1', hospedeNome: 'João', portal: 'booking',
      nota: 9, texto: 'Excelente!', dataEstadia: new Date('2026-07-10'),
    })
    await reviewRepo.receberReview({
      propriedadeId: 'prop_1', hospedeNome: 'Maria', portal: 'tripadvisor',
      nota: 7, texto: 'Bom.', dataEstadia: new Date('2026-07-12'),
    })
    await reviewRepo.receberReview({
      propriedadeId: 'prop_1', hospedeNome: 'Pedro', portal: 'google',
      nota: 5, texto: 'Poderia melhorar.', dataEstadia: new Date('2026-07-15'),
    })

    const result = await useCase.execute({
      propriedadeId: 'prop_1',
      dataInicio: new Date('2026-07-01'),
      dataFim: new Date('2026-07-31'),
    })
    expect(result.isOk).toBe(true)
    expect(result.value!.totalReviews).toBe(3)
    expect(result.value!.notaMedia).toBe(7)
    expect(result.value!.totalRespondidos).toBe(0)
    expect(result.value!.taxaResposta).toBe(0)
  })

  it('M13: should return 100% response rate with no reviews', async () => {
    const result = await useCase.execute({
      propriedadeId: 'prop_1',
      dataInicio: new Date('2026-01-01'),
      dataFim: new Date('2026-01-31'),
    })
    expect(result.isOk).toBe(true)
    expect(result.value!.totalReviews).toBe(0)
    expect(result.value!.taxaResposta).toBe(100)
  })
})

describe('ProcessarWebhookReviewUseCase', () => {
  let reviewRepo: ReviewInMemoryRepository
  let useCase: ProcessarWebhookReviewUseCase

  beforeEach(async () => {
    reviewRepo = new ReviewInMemoryRepository()
    useCase = new ProcessarWebhookReviewUseCase(reviewRepo)
  })

  it('should process webhook and create review', async () => {
    const result = await useCase.execute({
      propriedadeId: 'prop_1', portal: 'booking',
      hospedeNome: 'João', nota: 9,
      texto: 'Estadia maravilhosa!',
      dataEstadia: new Date('2026-07-15'),
    })
    expect(result.isOk).toBe(true)
    expect(result.value!.review.status).toBe('recebido')
    expect(result.value!.sentimento.value).toBe('positivo')
    expect(result.value!.handoff).toBeUndefined()
  })

  it('should create handoff for critico review', async () => {
    const result = await useCase.execute({
      propriedadeId: 'prop_1', portal: 'booking',
      hospedeNome: 'João', nota: 2,
      texto: 'Quarto com infiltração e mofo.',
      dataEstadia: new Date('2026-07-15'),
      quartoId: 'quarto_101',
    })
    expect(result.isOk).toBe(true)
    expect(result.value!.handoff).toBeDefined()
    expect(result.value!.handoff!.needsEscalation).toBe(true)
    expect(result.value!.handoff!.tipo).toBe('abrir_tarefa')
    expect(result.value!.handoff!.payload.quartoId).toBe('quarto_101')
  })

  it('should reject non-readonly portal', async () => {
    const result = await useCase.execute({
      propriedadeId: 'prop_1', portal: 'instagram',
      hospedeNome: 'João', nota: 8,
      texto: 'Bom!', dataEstadia: new Date(),
    })
    expect(result.isFail).toBe(true)
    expect(result.error.message).toContain('Apenas portais externos')
  })
})
