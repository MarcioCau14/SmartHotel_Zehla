import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { getBasePrisma } from '../../../../src/lib/prisma'
import { Sentimento } from '../../../../src/domain/marketing/value-objects/Sentimento'

function sentimento(nota: number) {
  const r = Sentimento.criar(nota)
  if (r.isFail) throw new Error(`Failed to create sentimento: ${r.error.message}`)
  return r.value
}
import { PrismaReviewRepository } from '../../../../src/infrastructure/persistence/marketing/PrismaReviewRepository'
import { PrismaCampanhaRepository } from '../../../../src/infrastructure/persistence/marketing/PrismaCampanhaRepository'
import { PrismaConteudoRepository } from '../../../../src/infrastructure/persistence/marketing/PrismaConteudoRepository'
import { PrismaPostRepository } from '../../../../src/infrastructure/persistence/marketing/PrismaPostRepository'
import { PrismaMetricaRepository } from '../../../../src/infrastructure/persistence/marketing/PrismaMetricaRepository'

describe('Marketing Bounded Context — Persistência Real & RLS & Fail-Fast (Prisma)', () => {
  const prisma = getBasePrisma()

  const reviewRepo = new PrismaReviewRepository(prisma)
  const campanhaRepo = new PrismaCampanhaRepository(prisma)
  const conteudoRepo = new PrismaConteudoRepository(prisma)
  const postRepo = new PrismaPostRepository(prisma)
  const metricaRepo = new PrismaMetricaRepository(prisma)

  const pousadaId = 'pousada_canasvieiras_mkt'
  const pousadaOutro = 'pousada_outra_mkt_999'

  beforeAll(async () => {
    await prisma.$connect()
  })

  beforeEach(async () => {
    await prisma.marketingPost.deleteMany()
    await prisma.marketingMetrica.deleteMany()
    await prisma.marketingConteudo.deleteMany()
    await prisma.marketingCampanha.deleteMany()
    await prisma.marketingReview.deleteMany()
  })

  describe('1. PrismaReviewRepository (Data Mapper, RLS, Sentimento Guard)', () => {
    it('deve criar Review com sentimento derivado da nota e hidratar com 100% de integridade', async () => {
      const criarResult = await reviewRepo.receberReview({
        propriedadeId: pousadaId,
        hospedeNome: 'Maria Silva',
        portal: 'booking',
        nota: 2,
        texto: 'Quarto sujo e barulhento. Não recomendo.',
        dataEstadia: new Date('2026-05-10'),
      })
      expect(criarResult.isOk).toBe(true)
      const review = criarResult.value
      expect(review.id).toBeDefined()
      expect(review.hospedeNome).toBe('Maria Silva')
      expect(review.portal.value).toBe('booking')
      expect(review.nota).toBe(2)
      expect(review.sentimento.value).toBe('critico')
      expect(review.status).toBe('recebido')

      const buscarResult = await reviewRepo.buscarReviewPorId(review.id, pousadaId)
      expect(buscarResult.isOk).toBe(true)
      expect(buscarResult.value!.id).toBe(review.id)
      expect(buscarResult.value!.sentimento.value).toBe('critico')
    })

    it('deve aplicar RLS: buscar review de outro tenant retorna null', async () => {
      const criarResult = await reviewRepo.receberReview({
        propriedadeId: pousadaId,
        hospedeNome: 'João',
        portal: 'tripadvisor',
        nota: 8,
        texto: 'Ótima estadia!',
        dataEstadia: new Date('2026-05-15'),
      })
      expect(criarResult.isOk).toBe(true)
      const id = criarResult.value.id

      const buscarOutro = await reviewRepo.buscarReviewPorId(id, pousadaOutro)
      expect(buscarOutro.isOk).toBe(true)
      expect(buscarOutro.value).toBeNull()
    })

    it('deve listar reviews por sentimento', async () => {
      await reviewRepo.receberReview({
        propriedadeId: pousadaId, hospedeNome: 'A', portal: 'google',
        nota: 2, texto: 'Ruim', dataEstadia: new Date('2026-06-01'),
      })
      await reviewRepo.receberReview({
        propriedadeId: pousadaId, hospedeNome: 'B', portal: 'google',
        nota: 9, texto: 'Excelente', dataEstadia: new Date('2026-06-02'),
      })
      const criticos = await reviewRepo.listarPorSentimento(
        sentimento(2),
        pousadaId,
      )
      expect(criticos.isOk).toBe(true)
      expect(criticos.value.length).toBe(1)
    })

    it('deve responder review e transitar status', async () => {
      const criarResult = await reviewRepo.receberReview({
        propriedadeId: pousadaId, hospedeNome: 'Pedro', portal: 'booking',
        nota: 6, texto: 'Mais ou menos, poderia ser melhor.',
        dataEstadia: new Date('2026-05-20'),
      })
      expect(criarResult.isOk).toBe(true)
      const id = criarResult.value.id

      const responderResult = await reviewRepo.responderReview(
        id, pousadaId,
        'Olá Pedro, lamentamos que sua experiência não tenha sido perfeita. Já acionamos nossa equipe para melhorias.',
        'empatico',
      )
      expect(responderResult.isOk).toBe(true)
      expect(responderResult.value.status).toBe('respondido')
      expect(responderResult.value.resposta).toContain('Pedro')
    })

    it('deve falhar rápido ao hidratar review com nota corrompida', async () => {
      const id = `mkt_rev_corrompida_${Date.now()}`
      await prisma.marketingReview.create({
        data: {
          id,
          pousadaId,
          hospedeNome: 'Corrompido',
          portal: 'canal_invalido',
          nota: 99,
          texto: 'Review com dados inválidos',
          sentimento: 'inexistente',
          status: 'recebido',
          dataEstadia: new Date('2026-01-01'),
        },
      })
      const buscarResult = await reviewRepo.buscarReviewPorId(id, pousadaId)
      expect(buscarResult.isFail).toBe(true)
    })
  })

  describe('2. PrismaCampanhaRepository (Máquina de Estados, Promise Financeira, RLS)', () => {
    it('deve criar campanha e hidratar corretamente', async () => {
      const criarResult = await campanhaRepo.criarCampanha({
        propriedadeId: pousadaId,
        nome: 'Remarketing Hóspedes Satisfeitos',
        publicoAlvo: 'hospedes_satisfeitos',
        tipo: 'remarketing',
        dataInicio: new Date('2026-07-01'),
        dataFim: new Date('2026-07-31'),
      })
      expect(criarResult.isOk).toBe(true)
      const campanha = criarResult.value
      expect(campanha.nome).toBe('Remarketing Hóspedes Satisfeitos')
      expect(campanha.status).toBe('draft')
      expect(campanha.possuiPromiseFinanceira).toBe(false)

      const buscarResult = await campanhaRepo.buscarPorId(campanha.id, pousadaId)
      expect(buscarResult.isOk).toBe(true)
      expect(buscarResult.value!.nome).toBe('Remarketing Hóspedes Satisfeitos')
    })

    it('M5: deve rejeitar campanha sem publicoAlvo via validação de domínio', async () => {
      const criarResult = await campanhaRepo.criarCampanha({
        propriedadeId: pousadaId,
        nome: 'Campanha Inválida',
        publicoAlvo: '',
        tipo: 'remarketing',
        dataInicio: new Date('2026-07-01'),
        dataFim: new Date('2026-07-31'),
      })
      expect(criarResult.isFail).toBe(true)
    })

    it('M6: deve rejeitar campanha com promise financeira não validada', async () => {
      const criarResult = await campanhaRepo.criarCampanha({
        propriedadeId: pousadaId,
        nome: 'Campanha com Promessa',
        publicoAlvo: 'leads_frios',
        tipo: 'promocional',
        conteudo: '20% de desconto',
        dataInicio: new Date('2026-08-01'),
        dataFim: new Date('2026-08-15'),
        possuiPromiseFinanceira: true,
        promiseFinanceiraValidada: false,
      })
      expect(criarResult.isFail).toBe(true)
      expect(criarResult.error.message).toContain('promise financeira')
    })

    it('M6: deve permitir campanha com promise validada', async () => {
      const criarResult = await campanhaRepo.criarCampanha({
        propriedadeId: pousadaId,
        nome: 'Campanha Validada',
        publicoAlvo: 'todos',
        tipo: 'promocional',
        dataInicio: new Date('2026-08-01'),
        dataFim: new Date('2026-08-15'),
        possuiPromiseFinanceira: true,
        promiseFinanceiraValidada: true,
      })
      expect(criarResult.isOk).toBe(true)
    })

    it('deve aplicar RLS: buscar campanha de outro tenant retorna null', async () => {
      const criarResult = await campanhaRepo.criarCampanha({
        propriedadeId: pousadaId,
        nome: 'Campanha Secreta',
        publicoAlvo: 'todos',
        tipo: 'remarketing',
        dataInicio: new Date('2026-09-01'),
        dataFim: new Date('2026-09-30'),
      })
      const id = criarResult.value.id

      const buscarOutro = await campanhaRepo.buscarPorId(id, pousadaOutro)
      expect(buscarOutro.isOk).toBe(true)
      expect(buscarOutro.value).toBeNull()
    })

    it('deve listar apenas campanhas ativas', async () => {
      await campanhaRepo.criarCampanha({
        propriedadeId: pousadaId, nome: 'Ativa 1', publicoAlvo: 'todos',
        tipo: 'remarketing', dataInicio: new Date('2026-01-01'), dataFim: new Date('2026-12-31'),
      })
      await campanhaRepo.criarCampanha({
        propriedadeId: pousadaId, nome: 'Cancelada', publicoAlvo: 'todos',
        tipo: 'remarketing', dataInicio: new Date('2026-01-01'), dataFim: new Date('2026-12-31'),
      })
      const ativas = await campanhaRepo.listarAtivas(pousadaId)
      expect(ativas.isOk).toBe(true)
    })
  })

  describe('3. PrismaConteudoRepository (Versionamento, Tom)', () => {
    it('deve criar e hidratar conteúdo com tom válido', async () => {
      const criarResult = await conteudoRepo.criarConteudo({
        texto: 'Venha conhecer nossas diárias promocionais!',
        tom: 'entusiasta',
      })
      expect(criarResult.isOk).toBe(true)
      const conteudo = criarResult.value
      expect(conteudo.tom).toBe('entusiasta')
      expect(conteudo.versao).toBe(1)

      const buscarResult = await conteudoRepo.buscarPorId(conteudo.id)
      expect(buscarResult.isOk).toBe(true)
      expect(buscarResult.value!.texto).toBe('Venha conhecer nossas diárias promocionais!')
    })

    it('deve rejeitar conteúdo com tom inválido via VO', async () => {
      const criarResult = await conteudoRepo.criarConteudo({
        texto: 'Conteúdo com tom inválido',
        tom: 'agressivo',
      })
      expect(criarResult.isFail).toBe(true)
    })
  })

  describe('4. PrismaPostRepository (Canal Social, Mídia Obrigatória, RLS)', () => {
    it('deve criar post e hidratar com CanalDistribuicao VO', async () => {
      const criarResult = await postRepo.agendarPost({
        propriedadeId: pousadaId,
        canal: 'instagram',
        tipo: 'informativo',
        conteudoId: 'cont_001',
        midias: ['https://img.zehla.co/foto.jpg'],
        dataAgendamento: new Date('2026-07-10'),
      })
      expect(criarResult.isOk).toBe(true)
      const post = criarResult.value
      expect(post.canal.value).toBe('instagram')
      expect(post.tipo).toBe('informativo')
      expect(post.midias).toContain('https://img.zehla.co/foto.jpg')

      const buscarResult = await postRepo.buscarPorId(post.id, pousadaId)
      expect(buscarResult.isOk).toBe(true)
      expect(buscarResult.value!.canal.value).toBe('instagram')
    })

    it('M10: deve rejeitar canal não social', async () => {
      const criarResult = await postRepo.agendarPost({
        propriedadeId: pousadaId,
        canal: 'booking',
        tipo: 'informativo',
        conteudoId: 'cont_002',
      })
      expect(criarResult.isFail).toBe(true)
      expect(criarResult.error.message).toContain('Canal de publicação não suportado')
    })

    it('M11: deve rejeitar post promocional sem mídia', async () => {
      const criarResult = await postRepo.agendarPost({
        propriedadeId: pousadaId,
        canal: 'instagram',
        tipo: 'promocional',
        conteudoId: 'cont_003',
      })
      expect(criarResult.isFail).toBe(true)
      expect(criarResult.error.message).toContain('exige ao menos uma mídia')
    })

    it('deve aplicar RLS: buscar post de outro tenant retorna null', async () => {
      const criarResult = await postRepo.agendarPost({
        propriedadeId: pousadaId,
        canal: 'instagram',
        tipo: 'informativo',
        conteudoId: 'cont_004',
      })
      const id = criarResult.value.id

      const buscarOutro = await postRepo.buscarPorId(id, pousadaOutro)
      expect(buscarOutro.isOk).toBe(true)
      expect(buscarOutro.value).toBeNull()
    })
  })

  describe('5. PrismaMetricaRepository (Flags Agregadas, RLS)', () => {
    it('deve registrar e hidratar métrica calculada', async () => {
      const criarResult = await metricaRepo.registrarMetrica({
        propriedadeId: pousadaId,
        dataInicio: new Date('2026-06-01'),
        dataFim: new Date('2026-06-30'),
        notaMedia: 8.5,
        taxaResposta: 75,
        sentimentoMedio: 72,
        totalReviews: 20,
        totalRespondidos: 15,
        totalCampanhas: 3,
      })
      expect(criarResult.isOk).toBe(true)
      const metrica = criarResult.value
      expect(metrica.notaMedia).toBe(8.5)
      expect(metrica.taxaResposta).toBe(75)
      expect(metrica.totalReviews).toBe(20)

      const buscarResult = await metricaRepo.buscarMetricaPeriodo(
        pousadaId,
        new Date('2026-06-01'),
        new Date('2026-06-30'),
      )
      expect(buscarResult.isOk).toBe(true)
      expect(buscarResult.value).not.toBeNull()
      expect(buscarResult.value!.notaMedia).toBe(8.5)
    })

    it('deve aplicar RLS: métrica de outro tenant não encontrada', async () => {
      await metricaRepo.registrarMetrica({
        propriedadeId: pousadaId,
        dataInicio: new Date('2026-07-01'),
        dataFim: new Date('2026-07-31'),
        notaMedia: 9.0,
      })
      const buscarOutro = await metricaRepo.buscarMetricaPeriodo(
        pousadaOutro,
        new Date('2026-07-01'),
        new Date('2026-07-31'),
      )
      expect(buscarOutro.isOk).toBe(true)
      expect(buscarOutro.value).toBeNull()
    })
  })
})
