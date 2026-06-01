/**
 * ZEHLA PRIME — SB20: Prova de Fogo do Zé-Marketer Cognitivo
 * ============================================================
 * Testes unitários com InMemory Repositories (zero Prisma, zero DB).
 * Foco: Intent-to-Action, Handoff ZCP Crítico, Tradução de Erros.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ZeMarketerCognitiveService } from '../../../../src/application/marketing/cognitive/ZeMarketerCognitiveService'
import { ZeMarketerIntent, translateError } from '../../../../src/application/marketing/cognitive/ZeMarketerCognitiveTypes'

// ─── Use Cases (injetados via DI)
import { AnalisarSentimentoReviewUseCase } from '../../../../src/application/marketing/use-cases/AnalisarSentimentoReviewUseCase'
import { ResponderReviewPortalUseCase } from '../../../../src/application/marketing/use-cases/ResponderReviewPortalUseCase'
import { CriarCampanhaRemarketingUseCase } from '../../../../src/application/marketing/use-cases/CriarCampanhaRemarketingUseCase'
import { AgendarPostUseCase } from '../../../../src/application/marketing/use-cases/AgendarPostUseCase'
import { CalcularMetricasMarketingUseCase } from '../../../../src/application/marketing/use-cases/CalcularMetricasMarketingUseCase'
import { ProcessarWebhookReviewUseCase } from '../../../../src/application/marketing/use-cases/ProcessarWebhookReviewUseCase'

// ─── InMemory Repositories (Fakes de Infraestrutura)
import { ReviewInMemoryRepository } from '../../../../src/infrastructure/persistence/marketing/ReviewInMemoryRepository'
import { CampanhaInMemoryRepository } from '../../../../src/infrastructure/persistence/marketing/CampanhaInMemoryRepository'
import { ConteudoInMemoryRepository } from '../../../../src/infrastructure/persistence/marketing/ConteudoInMemoryRepository'
import { PostInMemoryRepository } from '../../../../src/infrastructure/persistence/marketing/PostInMemoryRepository'
import { MetricaInMemoryRepository } from '../../../../src/infrastructure/persistence/marketing/MetricaInMemoryRepository'

// ─── Porta Read-Only (IReservaReadOnlyPort fake)
import { Result } from '../../../../src/shared/Result'

const PROP_ID = 'pousada_praia_brava_001'

// Fake da porta read-only de reservas (cross-context, somente leitura)
const fakeReservaPort = {
  buscarReservaPorId: vi.fn().mockResolvedValue(Result.ok(null)),
}

describe('SB20 — ZeMarketerCognitiveService: Intent-to-Action, ZCP Handoff e Tradução de Erros', () => {
  let reviewRepo: ReviewInMemoryRepository
  let campanhaRepo: CampanhaInMemoryRepository
  let conteudoRepo: ConteudoInMemoryRepository
  let postRepo: PostInMemoryRepository
  let metricaRepo: MetricaInMemoryRepository
  let service: ZeMarketerCognitiveService

  beforeEach(() => {
    reviewRepo = new ReviewInMemoryRepository()
    campanhaRepo = new CampanhaInMemoryRepository()
    conteudoRepo = new ConteudoInMemoryRepository()
    postRepo = new PostInMemoryRepository()
    metricaRepo = new MetricaInMemoryRepository()

    // Injeção de Dependência — zero import do Prisma
    const analisarSentimentoUC = new AnalisarSentimentoReviewUseCase(reviewRepo)
    const responderReviewUC = new ResponderReviewPortalUseCase(reviewRepo, conteudoRepo, fakeReservaPort as any)
    const criarCampanhaUC = new CriarCampanhaRemarketingUseCase(campanhaRepo, conteudoRepo)
    const agendarPostUC = new AgendarPostUseCase(postRepo, conteudoRepo)
    const calcularMetricasUC = new CalcularMetricasMarketingUseCase(reviewRepo, metricaRepo)
    const processarWebhookUC = new ProcessarWebhookReviewUseCase(reviewRepo)

    service = new ZeMarketerCognitiveService(
      analisarSentimentoUC,
      responderReviewUC,
      criarCampanhaUC,
      agendarPostUC,
      calcularMetricasUC,
      processarWebhookUC,
    )
  })

  // ─────────────────────────────────────────────────────────────────────────
  // 1. ROTEAMENTO CORRETO: Review Positivo → Caso de Uso de Resposta
  // ─────────────────────────────────────────────────────────────────────────
  describe('1. Roteamento de Intenções (Intent-to-Action)', () => {
    it('deve rotear PROCESSAR_WEBHOOK_REVIEW para o handler correto e persistir review positivo', async () => {
      const result = await service.processarIntencao(ZeMarketerIntent.PROCESSAR_WEBHOOK_REVIEW, {
        propriedadeId: PROP_ID,
        portal: 'booking',
        hospedeNome: 'Maria Silva',
        nota: 9, // POSITIVO — sem handoff
        texto: 'Café da manhã delicioso e atendimento impecável!',
        dataEstadia: new Date('2026-05-20'),
      })

      expect(result.isOk).toBe(true)
      const { dados, handoff } = result.value

      // Deve ter persistido o review
      expect(dados.reviewId).toBeDefined()
      expect(dados.sentimento).toBe('positivo')
      expect(dados.portal).toBe('booking')

      // Review positivo NÃO dispara handoff para o Zé-Ops
      expect(handoff).toBeUndefined()
    })

    it('deve rotear AGENDAR_POST e persistir post no canal correto', async () => {
      const futuro = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)

      const result = await service.processarIntencao(ZeMarketerIntent.AGENDAR_POST, {
        propriedadeId: PROP_ID,
        canal: 'instagram',
        tipo: 'institucional',
        texto: 'Venha curtir o verão na Pousada Praia Brava! 🌊',
        tom: 'entusiasta',
        dataAgendamento: futuro,
      })

      expect(result.isOk).toBe(true)
      expect(result.value.dados.canal).toBe('instagram')
      expect(result.value.dados.postId).toBeDefined()
    })

    it('deve retornar Result.fail com INTENT_NOT_RECOGNIZED para intents inválidas', async () => {
      const result = await service.processarIntencao('INTENT_INEXISTENTE' as ZeMarketerIntent, {
        propriedadeId: PROP_ID,
      })

      expect(result.isFail).toBe(true)
    })
  })

  // ─────────────────────────────────────────────────────────────────────────
  // 2. HANDOFF ZCP CRÍTICO: Review Crítico (nota ≤ 3) → Zé-Ops
  // ─────────────────────────────────────────────────────────────────────────
  describe('2. Escalação ZCP Dogmática: Review Crítico → Zé-Ops', () => {
    it('deve emitir handoff com needsEscalation=true para o Zé-Ops quando a nota for ≤ 3', async () => {
      const result = await service.processarIntencao(ZeMarketerIntent.PROCESSAR_WEBHOOK_REVIEW, {
        propriedadeId: PROP_ID,
        portal: 'tripadvisor',
        hospedeNome: 'Carlos Furioso',
        nota: 2, // CRÍTICO — dispara escalação
        texto: 'O ar-condicionado não funcionou a noite toda. Quarto 12. Péssimo!',
        dataEstadia: new Date('2026-05-25'),
        quartoId: 'quarto_12',
      })

      expect(result.isOk).toBe(true)
      const { dados, handoff } = result.value

      // O review foi salvo
      expect(dados.reviewId).toBeDefined()
      expect(dados.sentimento).toBe('critico')

      // 🚨 O Zé-Marketer DEVE emitir o handoff para o Zé-Ops
      expect(handoff).toBeDefined()
      expect(handoff!.needsEscalation).toBe(true)
      expect(handoff!.destino).toBe('ZeOps')
      expect(handoff!.payload).toMatchObject({
        reviewId: dados.reviewId,
      })
    })

    it('deve emitir handoff ZCP de validação financeira ao criar campanha com promise de desconto', async () => {
      const result = await service.processarIntencao(ZeMarketerIntent.CRIAR_CAMPANHA_REMARKETING, {
        propriedadeId: PROP_ID,
        nome: 'Campanha de Verão com 20% OFF',
        publicoAlvo: 'hospedes_satisfeitos',
        tipo: 'remarketing',
        textoConteudo: 'Volte e ganhe 20% de desconto na sua próxima estadia!',
        tom: 'entusiasta',
        dataInicio: new Date('2026-06-01'),
        dataFim: new Date('2026-08-31'),
        possuiPromiseFinanceira: true,       // ← gatilho financeiro
        promiseFinanceiraValidada: false,    // ← não validado pelo Zé-Analyst
      })

      expect(result.isOk).toBe(true)
      const { dados, handoff } = result.value

      // O Zé-Marketer NÃO cria a campanha — bloqueia e emite handoff
      expect(dados.precisaHandoffAnalyst).toBe(true)
      expect(dados.campanhaId).toBe('') // campanha vazia (não criada)

      // Handoff direcionado ao Zé-Analyst para validar a margem
      expect(handoff).toBeDefined()
      expect(handoff!.destino).toBe('ZeAnalyst')
      expect(handoff!.tipo).toBe('validar_desconto')
      expect(handoff!.needsEscalation).toBe(true)
    })
  })

  // ─────────────────────────────────────────────────────────────────────────
  // 3. TRADUÇÃO DE ERROS: Result.fail → Mensagem Humanizada sem Crash
  // ─────────────────────────────────────────────────────────────────────────
  describe('3. Tradução de Erros (translateError) — Zero Crash na Aplicação', () => {
    it('deve traduzir REVIEW_NOT_FOUND para mensagem humanizada', () => {
      const error = new Error('REVIEW_NOT_FOUND')
      const msg = translateError(error)

      expect(msg).not.toContain('REVIEW_NOT_FOUND') // código técnico nunca vaza
      expect(msg.length).toBeGreaterThan(10)         // mensagem substantiva
    })

    it('deve traduzir CAMPANHA_SEM_SEGMENTO para mensagem humanizada', () => {
      const error = new Error('CAMPANHA_SEM_SEGMENTO')
      const msg = translateError(error)

      expect(msg).not.toContain('CAMPANHA_SEM_SEGMENTO')
      expect(msg).toMatch(/público-alvo/i)
    })

    it('deve traduzir qualquer erro desconhecido para mensagem genérica (sem crash)', () => {
      const error = new Error('ERRO_COMPLETAMENTE_DESCONHECIDO_XYZ')
      const msg = translateError(error)

      // Nunca deve jogar exceção nem retornar undefined
      expect(msg).toBeDefined()
      expect(typeof msg).toBe('string')
      expect(msg.length).toBeGreaterThan(5)
    })

    it('deve falhar graciosamente ao tentar analisar review inexistente (Result.fail sem crash)', async () => {
      const result = await service.processarIntencao(ZeMarketerIntent.ANALISAR_SENTIMENTO_REVIEW, {
        propriedadeId: PROP_ID,
        reviewId: 'id_que_nao_existe_jamais',
      })

      // O serviço falha com Result.fail — não joga exceção
      expect(result.isFail).toBe(true)
      expect(result.error).toBeDefined()

      // A mensagem de erro deve ser humanizada (translateError foi aplicado)
      expect(result.error.message).not.toMatch(/^REVIEW_NOT_FOUND$/) // código técnico não vaza
    })
  })

  // ─────────────────────────────────────────────────────────────────────────
  // 4. MÉTRICAS: Calcular métricas de marketing por período
  // ─────────────────────────────────────────────────────────────────────────
  describe('4. Orquestração de Métricas', () => {
    it('deve calcular métricas de marketing para período com reviews existentes', async () => {
      // Primeiro: inserir um review via webhook
      await service.processarIntencao(ZeMarketerIntent.PROCESSAR_WEBHOOK_REVIEW, {
        propriedadeId: PROP_ID,
        portal: 'google',
        hospedeNome: 'Ana Positiva',
        nota: 8,
        texto: 'Ótima localização e café da manhã variado.',
        dataEstadia: new Date('2026-05-10'),
      })

      // Depois: calcular métricas do período
      const result = await service.processarIntencao(ZeMarketerIntent.CALCULAR_METRICAS_MARKETING, {
        propriedadeId: PROP_ID,
        dataInicio: new Date('2026-05-01'),
        dataFim: new Date('2026-05-31'),
      })

      expect(result.isOk).toBe(true)
      expect(result.value.dados.metricaId).toBeDefined()
      expect(result.value.dados.totalReviews).toBeGreaterThanOrEqual(0)
    })
  })
})
